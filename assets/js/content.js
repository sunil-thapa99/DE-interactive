// Content data for the dashboard, distilled from the four markdown guides.
const CONTENT = {

overview: {
  intro: {
    title: "How this pipeline fits together",
    desc: "S3 files land in Snowflake via Snowpipe (auto-ingest), then one of three ETL engines transforms the raw data into curated internal tables. Pick a tab above to go deep on any stage."
  },
  diagram: [
    { label: "S3 bucket\n(source files)" },
    { arrow: true },
    { label: "SQS queue\n(auto-created)" },
    { arrow: true },
    { label: "Snowpipe\n(auto-ingest)", hl: true },
    { arrow: true },
    { label: "RAW.LANDING\n(variant table)" },
    { arrow: true },
    { label: "ETL engine\n(Tasks / Dynamic Tables / dbt)", hl: true },
    { arrow: true },
    { label: "Internal curated\ntables" },
  ],
  cards: [
    {
      title: "Why this architecture",
      nav: "No console steps — this is background reading before you start building.",
      note: "Snowpipe is event-driven (near real-time) rather than polling, so new files land within seconds of arriving in S3. Everything downstream reads from RAW.LANDING, so all three ETL variants share the same ingestion foundation and only differ in how they transform + load."
    },
    {
      title: "What you need before starting",
      nav: "Have both consoles open: Snowsight (app.snowflake.com) and the AWS Console (console.aws.amazon.com), plus permission to create IAM roles and S3 event notifications.",
      note: "Snowflake side: ACCOUNTADMIN access for one-time setup, plus a role for ongoing operations. AWS side: permission to create IAM roles/policies and configure S3 bucket notifications."
    }
  ]
},

ingestion: {
  intro: {
    title: "Stage 1 — S3 → Snowpipe ingestion (shared foundation)",
    desc: "Complete this section once. All three ETL variants read from the RAW.LANDING table created here."
  },
  cards: [
    {
      title: "Create dedicated role, warehouse, database",
      nav: "Snowsight → Worksheets → + Worksheet → set role to ACCOUNTADMIN (top-right dropdown) → paste & run (Ctrl+Enter).",
      code: `-- Run as ACCOUNTADMIN
CREATE ROLE IF NOT EXISTS INGEST_ETL_ROLE;

CREATE WAREHOUSE IF NOT EXISTS INGEST_WH
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE
  COMMENT = 'Dedicated warehouse for S3 ingestion + ETL, isolated for cost tracking';

CREATE DATABASE IF NOT EXISTS AWS_INGEST_DB;
CREATE SCHEMA IF NOT EXISTS AWS_INGEST_DB.RAW;
CREATE SCHEMA IF NOT EXISTS AWS_INGEST_DB.STAGING;
CREATE SCHEMA IF NOT EXISTS AWS_INGEST_DB.ANALYTICS;

GRANT USAGE ON WAREHOUSE INGEST_WH TO ROLE INGEST_ETL_ROLE;
GRANT USAGE ON DATABASE AWS_INGEST_DB TO ROLE INGEST_ETL_ROLE;
GRANT ALL ON ALL SCHEMAS IN DATABASE AWS_INGEST_DB TO ROLE INGEST_ETL_ROLE;
GRANT ALL ON FUTURE SCHEMAS IN DATABASE AWS_INGEST_DB TO ROLE INGEST_ETL_ROLE;
GRANT ROLE INGEST_ETL_ROLE TO USER <ETL_SERVICE_USER>;`,
      note: "Dedicated warehouse + auto-suspend/auto-resume keeps ingestion cost isolated and avoids idle credit burn. Role-based grants (not user-based) keep access managed centrally."
    },
    {
      title: "Create storage integration (get IAM ARN + external ID)",
      nav: "Same worksheet, role = ACCOUNTADMIN. After DESC INTEGRATION, scroll the results grid's property column to STORAGE_AWS_IAM_USER_ARN and STORAGE_AWS_EXTERNAL_ID — copy both.",
      code: `USE ROLE ACCOUNTADMIN;

CREATE STORAGE INTEGRATION S3_INGEST_INT
  TYPE = EXTERNAL_STAGE
  STORAGE_PROVIDER = 'S3'
  ENABLED = TRUE
  STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::<AWS_ACCOUNT_ID>:role/snowflake-ingest-role'
  STORAGE_ALLOWED_LOCATIONS = ('s3://<your-bucket>/<prefix>/');

DESC INTEGRATION S3_INGEST_INT;
-- Note down: STORAGE_AWS_IAM_USER_ARN and STORAGE_AWS_EXTERNAL_ID`,
      note: "This is the key to avoiding static AWS keys entirely — Snowflake authenticates via a temporary assumed role, using the external ID as a shared secret to prevent the confused-deputy problem."
    },
    {
      title: "AWS: create IAM policy (least privilege)",
      nav: "AWS Console → IAM → Policies (left sidebar) → Create policy → JSON tab → paste → Next → name it snowflake-ingest-s3-readonly → Create policy.",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::<your-bucket>/<prefix>/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::<your-bucket>",
      "Condition": { "StringLike": { "s3:prefix": ["<prefix>/*"] } }
    }
  ]
}`,
      note: "Read-only, scoped to a single prefix. Never grant s3:* or bucket-wide access to an ingestion role."
    },
    {
      title: "AWS: create IAM role with trust policy",
      nav: "AWS Console → IAM → Roles → Create role → Custom trust policy → paste JSON → Next → attach snowflake-ingest-s3-readonly → name it snowflake-ingest-role → Create role.",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "<STORAGE_AWS_IAM_USER_ARN>" },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": { "sts:ExternalId": "<STORAGE_AWS_EXTERNAL_ID>" }
      }
    }
  ]
}`,
      note: "The external ID condition ensures only Snowflake's specific integration can assume this role — even if another AWS account learned the role ARN, they couldn't assume it without the external ID."
    },
    {
      title: "Create file format, stage, and RAW landing table",
      nav: "Snowsight worksheet → role = INGEST_ETL_ROLE, warehouse = INGEST_WH (both dropdowns top-right) → run. Browse result: Data → Databases → AWS_INGEST_DB → RAW.",
      code: `USE ROLE INGEST_ETL_ROLE;
USE WAREHOUSE INGEST_WH;

CREATE FILE FORMAT AWS_INGEST_DB.RAW.FF_JSON
  TYPE = 'JSON'
  STRIP_OUTER_ARRAY = TRUE;

CREATE STAGE AWS_INGEST_DB.RAW.S3_INGEST_STAGE
  URL = 's3://<your-bucket>/<prefix>/'
  STORAGE_INTEGRATION = S3_INGEST_INT
  FILE_FORMAT = AWS_INGEST_DB.RAW.FF_JSON;

CREATE TABLE IF NOT EXISTS AWS_INGEST_DB.RAW.LANDING (
  RAW_DATA        VARIANT,
  SRC_FILE_NAME   STRING DEFAULT METADATA$FILENAME,
  SRC_FILE_ROW    NUMBER DEFAULT METADATA$FILE_ROW_NUMBER,
  LOAD_TS         TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);`,
      note: "Landing table stores raw JSON as VARIANT plus lineage columns (source file, row, load time) — essential for debugging and replay."
    },
    {
      title: "Create the Snowpipe (auto-ingest)",
      nav: "Same worksheet/role. After SHOW PIPES, widen the notification_channel column in the results grid to copy the SQS ARN — or browse Data → Databases → AWS_INGEST_DB → RAW → Pipes.",
      code: `CREATE PIPE AWS_INGEST_DB.RAW.S3_INGEST_PIPE
  AUTO_INGEST = TRUE
AS
COPY INTO AWS_INGEST_DB.RAW.LANDING (RAW_DATA)
  FROM @AWS_INGEST_DB.RAW.S3_INGEST_STAGE
  FILE_FORMAT = (FORMAT_NAME = AWS_INGEST_DB.RAW.FF_JSON)
  ON_ERROR = 'CONTINUE';

SHOW PIPES LIKE 'S3_INGEST_PIPE';
-- Note the "notification_channel" (SQS ARN)`,
      note: "ON_ERROR = 'CONTINUE' means malformed rows don't halt the whole pipe — pair this with regular COPY_HISTORY checks."
    },
    {
      title: "AWS: wire S3 event notification to Snowpipe's SQS queue",
      nav: "AWS Console → S3 → your bucket → Properties tab → Event notifications → Create event notification → name it, prefix = <prefix>/, event = All object create events, destination = SQS queue → paste the ARN → Save changes.",
      code: null,
      note: "If events don't arrive after testing, check AWS Console → SQS → your queue → Access policy — Snowflake sets this automatically, but a manually recreated queue can lose it."
    },
    {
      title: "Validate the pipe is working",
      nav: "Upload a test file: AWS Console → S3 → bucket → Objects → Upload → into <prefix>/. Then Snowsight: same worksheet → run below. Browse visually: Data → Databases → AWS_INGEST_DB → RAW → Tables → LANDING → Data Preview.",
      code: `SELECT SYSTEM$PIPE_STATUS('AWS_INGEST_DB.RAW.S3_INGEST_PIPE');
SELECT * FROM AWS_INGEST_DB.RAW.LANDING ORDER BY LOAD_TS DESC LIMIT 10;

SELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(
  TABLE_NAME=>'AWS_INGEST_DB.RAW.LANDING', START_TIME=>DATEADD(HOURS,-1,CURRENT_TIMESTAMP())));`,
      note: "COPY_HISTORY is your first stop when rows don't show up — it surfaces parse errors per file."
    }
  ]
},

tasks: {
  intro: {
    title: "Stage 2a — Streams + Tasks",
    desc: "Native Snowflake orchestration: a Stream captures new rows since it was last read; a Task runs on a schedule (only when the stream has data) and MERGEs the delta into the curated table."
  },
  cards: [
    {
      title: "Create the internal target (curated) table",
      nav: "Snowsight → Worksheets → role = INGEST_ETL_ROLE, warehouse = INGEST_WH → run.",
      code: `CREATE TABLE IF NOT EXISTS AWS_INGEST_DB.ANALYTICS.ORDERS (
  ORDER_ID        STRING PRIMARY KEY,
  CUSTOMER_ID     STRING,
  ORDER_AMOUNT    NUMBER(12,2),
  ORDER_STATUS    STRING,
  ORDER_TS        TIMESTAMP_NTZ,
  UPDATED_AT      TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);`
    },
    {
      title: "Create a stream on the landing table",
      nav: "Same worksheet/role. Confirm afterward: Data → Databases → AWS_INGEST_DB → RAW → Streams.",
      code: `CREATE STREAM IF NOT EXISTS AWS_INGEST_DB.RAW.LANDING_STREAM
  ON TABLE AWS_INGEST_DB.RAW.LANDING
  APPEND_ONLY = TRUE;   -- landing table is insert-only; cheaper stream metadata`
    },
    {
      title: "Create the transform task",
      nav: "Same worksheet/role. View later: Data → Databases → AWS_INGEST_DB → STAGING → Tasks, or Monitoring → Task History (left sidebar).",
      code: `CREATE TASK IF NOT EXISTS AWS_INGEST_DB.STAGING.TASK_LOAD_ORDERS
  WAREHOUSE = INGEST_WH
  SCHEDULE = '1 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('AWS_INGEST_DB.RAW.LANDING_STREAM')
AS
MERGE INTO AWS_INGEST_DB.ANALYTICS.ORDERS AS tgt
USING (
  SELECT
    RAW_DATA:order_id::STRING        AS ORDER_ID,
    RAW_DATA:customer_id::STRING     AS CUSTOMER_ID,
    RAW_DATA:amount::NUMBER(12,2)    AS ORDER_AMOUNT,
    RAW_DATA:status::STRING          AS ORDER_STATUS,
    RAW_DATA:order_ts::TIMESTAMP_NTZ AS ORDER_TS
  FROM AWS_INGEST_DB.RAW.LANDING_STREAM
  WHERE METADATA$ACTION = 'INSERT'
) AS src
ON tgt.ORDER_ID = src.ORDER_ID
WHEN MATCHED THEN UPDATE SET
  tgt.CUSTOMER_ID  = src.CUSTOMER_ID,
  tgt.ORDER_AMOUNT = src.ORDER_AMOUNT,
  tgt.ORDER_STATUS = src.ORDER_STATUS,
  tgt.ORDER_TS     = src.ORDER_TS,
  tgt.UPDATED_AT   = CURRENT_TIMESTAMP()
WHEN NOT MATCHED THEN INSERT (ORDER_ID, CUSTOMER_ID, ORDER_AMOUNT, ORDER_STATUS, ORDER_TS)
  VALUES (src.ORDER_ID, src.CUSTOMER_ID, src.ORDER_AMOUNT, src.ORDER_STATUS, src.ORDER_TS);`,
      note: "WHEN SYSTEM$STREAM_HAS_DATA(...) skips the task body (no warehouse spend) when there's nothing new — SCHEDULE is just the polling cadence, not a guaranteed run. MERGE makes this idempotent."
    },
    {
      title: "Chain tasks for multi-step pipelines (optional)",
      nav: "Same worksheet/role. View the DAG: Monitoring → Task History → click task name → Graph tab.",
      code: `CREATE TASK AWS_INGEST_DB.STAGING.TASK_CLEANSE
  WAREHOUSE = INGEST_WH
  SCHEDULE = '1 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('AWS_INGEST_DB.RAW.LANDING_STREAM')
AS
INSERT INTO AWS_INGEST_DB.STAGING.ORDERS_CLEAN
SELECT ... FROM AWS_INGEST_DB.RAW.LANDING_STREAM WHERE RAW_DATA:order_id IS NOT NULL;

CREATE TASK AWS_INGEST_DB.ANALYTICS.TASK_MERGE_ORDERS
  WAREHOUSE = INGEST_WH
  AFTER AWS_INGEST_DB.STAGING.TASK_CLEANSE
AS
MERGE INTO AWS_INGEST_DB.ANALYTICS.ORDERS ... ;`
    },
    {
      title: "Enable the tasks (resume, root last)",
      nav: "UI alternative: Data → Databases → AWS_INGEST_DB → ANALYTICS → Tasks → TASK_MERGE_ORDERS → Resume button (top right of detail panel). Repeat per task, child before root.",
      code: `ALTER TASK AWS_INGEST_DB.ANALYTICS.TASK_MERGE_ORDERS RESUME;  -- resume leaf tasks first if chained
ALTER TASK AWS_INGEST_DB.STAGING.TASK_LOAD_ORDERS RESUME;     -- then the root`,
      note: "Tasks are created SUSPENDED by default — this is a safety default, not a bug."
    },
    {
      title: "Monitor task runs",
      nav: "UI alternative: Monitoring → Task History (left sidebar) — filter by task name/state/time range instead of writing SQL.",
      code: `SELECT * FROM TABLE(AWS_INGEST_DB.INFORMATION_SCHEMA.TASK_HISTORY(
  TASK_NAME => 'TASK_LOAD_ORDERS', RESULT_LIMIT => 20));

SELECT * FROM TABLE(AWS_INGEST_DB.INFORMATION_SCHEMA.TASK_HISTORY())
WHERE STATE = 'FAILED' AND SCHEDULED_TIME > DATEADD(HOUR,-24,CURRENT_TIMESTAMP());`
    }
  ]
},

dynamic: {
  intro: {
    title: "Stage 2b — Dynamic Tables",
    desc: "A declarative alternative: write the transform query once, set a target lag, and Snowflake manages refresh scheduling and incremental compute automatically — no streams or tasks to hand-wire."
  },
  cards: [
    {
      title: "Create the dynamic table",
      nav: "Snowsight → Worksheets → role = INGEST_ETL_ROLE, warehouse = INGEST_WH → run. View: Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS.",
      code: `CREATE DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS
  TARGET_LAG = '5 minutes'
  WAREHOUSE = INGEST_WH
  REFRESH_MODE = INCREMENTAL
AS
SELECT
  RAW_DATA:order_id::STRING        AS ORDER_ID,
  RAW_DATA:customer_id::STRING     AS CUSTOMER_ID,
  RAW_DATA:amount::NUMBER(12,2)    AS ORDER_AMOUNT,
  RAW_DATA:status::STRING          AS ORDER_STATUS,
  RAW_DATA:order_ts::TIMESTAMP_NTZ AS ORDER_TS,
  LOAD_TS
FROM AWS_INGEST_DB.RAW.LANDING
QUALIFY ROW_NUMBER() OVER (PARTITION BY RAW_DATA:order_id ORDER BY LOAD_TS DESC) = 1;`,
      note: "TARGET_LAG is the max staleness you accept — tighter lag = more frequent refresh = more compute cost. Verify REFRESH_MODE actually stayed INCREMENTAL (see validation step) since Snowflake silently falls back to FULL for non-incrementally-refreshable queries."
    },
    {
      title: "Chain multiple dynamic tables",
      nav: "Same worksheet/role. View DAG: Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS_ENRICHED → Graph tab.",
      code: `CREATE DYNAMIC TABLE AWS_INGEST_DB.STAGING.ORDERS_CLEAN
  TARGET_LAG = '2 minutes'
  WAREHOUSE = INGEST_WH
AS
SELECT * FROM AWS_INGEST_DB.RAW.LANDING
WHERE RAW_DATA:order_id IS NOT NULL;

CREATE DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS_ENRICHED
  TARGET_LAG = 'DOWNSTREAM'   -- inherit lag from whatever consumes this table
  WAREHOUSE = INGEST_WH
AS
SELECT o.*, c.CUSTOMER_NAME
FROM AWS_INGEST_DB.STAGING.ORDERS_CLEAN o
JOIN AWS_INGEST_DB.ANALYTICS.CUSTOMERS c ON o.CUSTOMER_ID = c.CUSTOMER_ID;`,
      note: "TARGET_LAG = 'DOWNSTREAM' on intermediate tables avoids redundant refresh scheduling — only the final consumer's lag matters."
    },
    {
      title: "Validate refresh behavior",
      nav: "UI alternative: Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS → Refresh History tab.",
      code: `DESC DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS;

SELECT * FROM TABLE(INFORMATION_SCHEMA.DYNAMIC_TABLE_REFRESH_HISTORY(
  NAME => 'AWS_INGEST_DB.ANALYTICS.ORDERS'))
ORDER BY REFRESH_START_TIME DESC;`
    },
    {
      title: "Suspend / resume for maintenance",
      nav: "UI alternative: Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS → Suspend / Resume buttons (top right).",
      code: `ALTER DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS SUSPEND;
ALTER DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS RESUME;`,
      note: "Dynamic tables are read-only otherwise — never manually INSERT/MERGE into them; all writes flow through the defining query."
    }
  ]
},

orchestrator: {
  intro: {
    title: "Stage 2c — External Orchestrator (dbt + Airflow)",
    desc: "Snowpipe still handles ingestion. Transform logic lives in version-controlled dbt models, scheduled by Airflow — useful when transforms need to integrate with non-Snowflake systems or existing dbt/Airflow infrastructure."
  },
  cards: [
    {
      title: "Scaffold the dbt project",
      nav: "Terminal (not Snowsight): dbt init aws_ingest_pipeline, or create the folders/files manually in your editor.",
      code: `models/
  staging/
    stg_orders.sql
  marts/
    orders.sql
sources.yml
dbt_project.yml
profiles.yml`
    },
    {
      title: "Declare the Snowpipe-fed source",
      nav: "Create sources.yml at the project root in your editor — no Snowsight/AWS UI for this step.",
      code: `version: 2
sources:
  - name: raw
    database: AWS_INGEST_DB
    schema: RAW
    tables:
      - name: LANDING
        loaded_at_field: LOAD_TS
        freshness:
          warn_after: { count: 15, period: minute }
          error_after: { count: 60, period: minute }`,
      note: "Freshness checks fail the DAG loudly if Snowpipe stops delivering, instead of silently running on stale data."
    },
    {
      title: "Incremental staging model",
      nav: "Create/edit in your editor under models/staging/. Test locally: terminal → dbt run --select stg_orders.",
      code: `{{ config(materialized='incremental', unique_key='order_id') }}

SELECT
  raw_data:order_id::string        AS order_id,
  raw_data:customer_id::string     AS customer_id,
  raw_data:amount::number(12,2)    AS order_amount,
  raw_data:status::string          AS order_status,
  raw_data:order_ts::timestamp_ntz AS order_ts,
  load_ts
FROM {{ source('raw', 'LANDING') }}
{% if is_incremental() %}
  WHERE load_ts > (SELECT MAX(load_ts) FROM {{ this }})
{% endif %}`
    },
    {
      title: "Curated mart model",
      nav: "Create/edit under models/marts/. Verify in Snowsight: Data → Databases → AWS_INGEST_DB → ANALYTICS → Tables → ORDERS.",
      code: `{{ config(materialized='incremental', unique_key='order_id') }}

SELECT * FROM {{ ref('stg_orders') }}
{% if is_incremental() %}
  WHERE order_ts > (SELECT MAX(order_ts) FROM {{ this }})
{% endif %}`
    },
    {
      title: "Connection profile — key-pair auth",
      nav: "Generate keys in terminal: openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out dbt_rsa_key.p8 -nocrypt, then openssl rsa -in dbt_rsa_key.p8 -pubout -out dbt_rsa_key.pub. Register in Snowsight (role=ACCOUNTADMIN): ALTER USER DBT_SERVICE_USER SET RSA_PUBLIC_KEY='...'; Place profiles.yml in ~/.dbt/.",
      code: `aws_ingest_pipeline:
  target: prod
  outputs:
    prod:
      type: snowflake
      account: <account_locator>
      user: DBT_SERVICE_USER
      role: INGEST_ETL_ROLE
      database: AWS_INGEST_DB
      warehouse: INGEST_WH
      schema: ANALYTICS
      private_key_path: /secrets/dbt_rsa_key.p8
      threads: 4`,
      note: "Key-pair auth, not username/password — rotate keys periodically, store the private key in a secrets manager, never in the repo."
    },
    {
      title: "Airflow DAG to trigger dbt on schedule",
      nav: "Save as dags/aws_ingest_dbt_pipeline.py in your Airflow dags/ folder. In the Airflow UI: DAGs page → toggle it On → Graph tab to watch runs, or Trigger DAG (▶) to run manually.",
      code: `from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from datetime import datetime, timedelta

default_args = {"owner": "data-eng", "retries": 2, "retry_delay": timedelta(minutes=5)}

with DAG(
    dag_id="aws_ingest_dbt_pipeline",
    default_args=default_args,
    schedule_interval="*/15 * * * *",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    max_active_runs=1,
) as dag:
    run_dbt = KubernetesPodOperator(
        task_id="dbt_run",
        image="ghcr.io/dbt-labs/dbt-snowflake:1.8.0",
        cmds=["dbt"], arguments=["run", "--select", "stg_orders+", "--profiles-dir", "/secrets"],
        name="dbt-run-aws-ingest", is_delete_operator_pod=True, get_logs=True,
    )
    dbt_test = KubernetesPodOperator(
        task_id="dbt_test",
        image="ghcr.io/dbt-labs/dbt-snowflake:1.8.0",
        cmds=["dbt"], arguments=["test", "--select", "stg_orders+"],
        name="dbt-test-aws-ingest", is_delete_operator_pod=True, get_logs=True,
    )
    run_dbt >> dbt_test`,
      note: "max_active_runs=1 prevents overlapping runs from racing on the same incremental table."
    },
    {
      title: "dbt tests as a quality gate",
      nav: "Create/edit models/marts/schema.yml. Run manually: dbt test --select orders. In Airflow UI, failures show as a red dbt_test box on the Graph/Grid view → click → Logs tab.",
      code: `version: 2
models:
  - name: orders
    columns:
      - name: order_id
        tests: [unique, not_null]
      - name: order_amount
        tests:
          - dbt_utils.accepted_range: { min_value: 0 }`,
      note: "run_dbt >> dbt_test blocks bad data from being treated as 'done' — wire test failures to Airflow alerting."
    }
  ]
},

architecture: {
  intro: {
    title: "Snowflake architecture & performance — 4-5 YOE depth",
    desc: "This pipeline only exercises ingestion/ETL. A mid-to-senior Data Engineer interview will also probe how Snowflake stores data, caches it, and how you'd diagnose and tune a slow or expensive query. Each card below is a concept, a runnable example, and why it matters."
  },
  cards: [
    {
      title: "Micro-partitions & automatic clustering",
      badge: "storage",
      navLabel: "Try it:",
      nav: "Run the query below against any sizeable table you own, then read the results — depth is how deep pruning had to go to satisfy the filter.",
      code: `SELECT SYSTEM$CLUSTERING_INFORMATION('AWS_INGEST_DB.ANALYTICS.ORDERS', '(ORDER_TS)');

-- Add a clustering key if scans on this column stay expensive at scale
ALTER TABLE AWS_INGEST_DB.ANALYTICS.ORDERS CLUSTER BY (ORDER_TS);`,
      noteLabel: "Why it matters:",
      note: "Snowflake stores every table as immutable 16MB (compressed) micro-partitions, each with min/max metadata per column. Queries prune partitions using that metadata instead of scanning everything — this is why there are no traditional indexes. Clustering keys reorder data so partitions for a given key range don't overlap; without a good natural insert order (e.g. append-only by timestamp) on a huge table, clustering can meaningfully cut scan cost. Don't add clustering keys reflexively — they cost re-clustering credits and only pay off on multi-TB tables with a clear, selective filter pattern."
    },
    {
      title: "Three caching layers: result, warehouse, metadata",
      badge: "performance",
      navLabel: "Try it:",
      nav: "Run the same query twice back-to-back — the second run should return near-instantly from the result cache. Check the Query Profile UI (Snowsight → Monitoring → Query History → click a query) to see which cache served it.",
      code: `-- Result cache: identical query text + unchanged underlying data = instant return, no compute
SELECT COUNT(*) FROM AWS_INGEST_DB.ANALYTICS.ORDERS;   -- run twice, compare "Bytes scanned" in Query Profile

-- Force a cache bypass for benchmarking
ALTER SESSION SET USE_CACHED_RESULT = FALSE;`,
      noteLabel: "Why it matters:",
      note: "Result cache (24hr, per-query-text, account-wide, free) is the cheapest possible win and interviewers ask about it directly. Warehouse cache (local SSD on the compute nodes) speeds up repeat scans of the same data on a warm warehouse — this is why the same warehouse tends to get faster after a few runs, and why AUTO_SUSPEND has a real trade-off (suspend too aggressively and you lose warm cache, but stay up too long and you burn idle credits). Metadata cache (partition min/max stats) is what makes SELECT COUNT(*) and MIN/MAX-only queries return without touching storage at all."
    },
    {
      title: "Time Travel vs Fail-safe",
      badge: "resilience",
      navLabel: "Try it:",
      nav: "Simulate an accidental drop and recover it.",
      code: `DROP TABLE AWS_INGEST_DB.ANALYTICS.ORDERS;
UNDROP TABLE AWS_INGEST_DB.ANALYTICS.ORDERS;

-- Query as of a point in time within the retention window
SELECT * FROM AWS_INGEST_DB.ANALYTICS.ORDERS
  AT (OFFSET => -60*30)   -- 30 minutes ago
LIMIT 10;

ALTER TABLE AWS_INGEST_DB.ANALYTICS.ORDERS SET DATA_RETENTION_TIME_IN_DAYS = 7;`,
      noteLabel: "Why it matters:",
      note: "Time Travel (0-90 days depending on edition, table type, and DATA_RETENTION_TIME_IN_DAYS) is user-queryable and lets you UNDROP or query AT/BEFORE a timestamp — this is your primary recovery tool for accidental deletes/updates. Fail-safe (7 fixed days, kicks in only after Time Travel expires) is Snowflake-managed disaster recovery only — you cannot query or restore it yourself; you'd have to open a support case. A common interview trap: 'how would you recover data deleted 10 days ago on a Standard-edition table with 1-day retention?' — the honest answer is you likely can't; that's exactly why retention settings should be a deliberate choice per table, not a default left alone."
    },
    {
      title: "Warehouse scaling: scale up vs scale out",
      badge: "compute",
      navLabel: "Try it:",
      nav: "Compare a single complex query's runtime against a bigger warehouse size (scale up) vs concurrent query throughput against a multi-cluster warehouse (scale out).",
      code: `ALTER WAREHOUSE INGEST_WH SET WAREHOUSE_SIZE = 'MEDIUM';  -- scale UP: speeds up one query (more nodes per cluster)

ALTER WAREHOUSE INGEST_WH SET
  MIN_CLUSTER_COUNT = 1
  MAX_CLUSTER_COUNT = 3
  SCALING_POLICY = 'STANDARD';                              -- scale OUT: handles more concurrent queries`,
      noteLabel: "Why it matters:",
      note: "Scaling up (bigger T-shirt size) helps a single large/complex query finish faster by giving it more compute nodes. Scaling out (multi-cluster) doesn't speed up any individual query — it spins up additional clusters of the same size to absorb queuing when many users/queries hit the same warehouse concurrently. Picking the wrong lever is a classic interview 'what's wrong with this setup' question: a BI dashboard with 50 concurrent users on an undersized single-cluster XL warehouse needs multi-cluster, not a bigger size."
    },
    {
      title: "Reading the Query Profile for a slow query",
      badge: "performance",
      navLabel: "Try it:",
      nav: "Snowsight → Monitoring → Query History → click a slow query → Query Profile tab (visual operator tree).",
      code: null,
      noteLabel: "Why it matters:",
      note: "The three things to check first: (1) 'Bytes spilled to local/remote storage' — a sort or join too big for the warehouse's memory, spilling to disk (local) or worse, cloud storage (remote), which is dramatically slower — usually fixed by a bigger warehouse or a better filter earlier in the query, not by adding an index (there isn't one); (2) a join that explodes row count in the operator tree (a mismatched join key producing a fan-out) — visible as a large 'rows produced' jump at one operator; (3) 'Partitions scanned' vs 'partitions total' — low pruning ratio on a filtered query usually means the filter column isn't naturally clustered and might need a clustering key at scale."
    },
    {
      title: "Materialized Views vs Dynamic Tables",
      badge: "trade-off",
      navLabel: "Try it:",
      nav: "Contrast the two for the same aggregation use case.",
      code: `-- Materialized view: single-table, simple aggregation, auto-maintained by Snowflake background service
CREATE MATERIALIZED VIEW AWS_INGEST_DB.ANALYTICS.MV_DAILY_ORDER_TOTALS AS
SELECT DATE_TRUNC('day', ORDER_TS) AS ORDER_DAY, SUM(ORDER_AMOUNT) AS TOTAL
FROM AWS_INGEST_DB.ANALYTICS.ORDERS
GROUP BY 1;

-- Dynamic table: multi-table joins, chaining, explicit target lag control
CREATE DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.DT_DAILY_ORDER_TOTALS
  TARGET_LAG = '10 minutes' WAREHOUSE = INGEST_WH
AS SELECT DATE_TRUNC('day', ORDER_TS) AS ORDER_DAY, SUM(ORDER_AMOUNT) AS TOTAL
FROM AWS_INGEST_DB.ANALYTICS.ORDERS GROUP BY 1;`,
      noteLabel: "Why it matters:",
      note: "Materialized views are restricted to a single source table, no joins, and Snowflake decides refresh timing for you — simplest option for a single-table rollup. Dynamic Tables support joins and multi-table DAGs, and let you control staleness explicitly via TARGET_LAG — the better choice once your transform needs more than one source table, which is most real pipelines. A materialized view still wins when you want zero operational thought and the query really is single-table."
    },
    {
      title: "Resource monitors — capping runaway spend",
      badge: "cost",
      navLabel: "Try it:",
      nav: "Snowsight → Admin → Cost Management → Resource Monitors → Create Resource Monitor (or the SQL below as ACCOUNTADMIN).",
      code: `CREATE RESOURCE MONITOR INGEST_MONITOR
  WITH CREDIT_QUOTA = 100
  FREQUENCY = MONTHLY
  START_TIMESTAMP = IMMEDIATELY
  TRIGGERS
    ON 75 PERCENT DO NOTIFY
    ON 100 PERCENT DO SUSPEND
    ON 110 PERCENT DO SUSPEND_IMMEDIATE;

ALTER WAREHOUSE INGEST_WH SET RESOURCE_MONITOR = INGEST_MONITOR;`,
      noteLabel: "Why it matters:",
      note: "A misconfigured task loop or a runaway ad-hoc query on an oversized warehouse can burn a month's compute budget in a day. Resource monitors are the guardrail: notify at a threshold, suspend gracefully at 100%, hard-suspend at 110%. Interviewers ask this specifically to see if you think about cost governance proactively, not just performance."
    }
  ]
},

governance: {
  intro: {
    title: "Governance, sharing & advanced Snowflake — 4-5 YOE depth",
    desc: "Beyond building pipelines, a mid/senior DE is expected to reason about who can see what data, how to share it outside the pipeline's own account, and how to operate the platform (CI/CD, DR, semi-structured data at scale)."
  },
  cards: [
    {
      title: "RBAC hierarchy: roles, not users",
      badge: "security",
      navLabel: "Try it:",
      nav: "Sketch the role graph for a real org before you build it: SYSADMIN owns objects, custom functional roles (e.g. DATA_ENGINEER, ANALYST) get granted privileges and are granted up to SYSADMIN, humans/service accounts are granted the functional roles — never privileges directly.",
      code: `CREATE ROLE DATA_ENGINEER;
GRANT ROLE DATA_ENGINEER TO ROLE SYSADMIN;      -- role hierarchy: SYSADMIN can see/manage everything below it
GRANT ALL ON DATABASE AWS_INGEST_DB TO ROLE DATA_ENGINEER;
GRANT ROLE DATA_ENGINEER TO USER <some_user>;   -- humans/service accounts get the functional role, not raw grants`,
      noteLabel: "Why it matters:",
      note: "ACCOUNTADMIN is for break-glass/account admin only, never day-to-day work. SECURITYADMIN manages roles/users/grants; SYSADMIN should own all warehouse/database/schema objects so it can always see and manage them via the role hierarchy. This project's `INGEST_ETL_ROLE` is a simplification — a real org would split it into narrower functional roles (ingest-only, transform-only, read-only reporting) so a compromised or buggy service account can't touch more than its slice."
    },
    {
      title: "Row access policies & column masking",
      badge: "governance",
      navLabel: "Try it:",
      nav: "Apply a mask so only a specific role sees a sensitive column in full.",
      code: `CREATE MASKING POLICY MASK_CUSTOMER_EMAIL AS (val STRING) RETURNS STRING ->
  CASE WHEN CURRENT_ROLE() IN ('DATA_ENGINEER', 'ACCOUNTADMIN') THEN val
       ELSE REGEXP_REPLACE(val, '.+@', '***@') END;

ALTER TABLE AWS_INGEST_DB.ANALYTICS.CUSTOMERS
  MODIFY COLUMN EMAIL SET MASKING POLICY MASK_CUSTOMER_EMAIL;

CREATE ROW ACCESS POLICY RAP_REGION_FILTER AS (region STRING) RETURNS BOOLEAN ->
  CURRENT_ROLE() = 'ACCOUNTADMIN' OR region = CURRENT_ROLE();`,
      noteLabel: "Why it matters:",
      note: "Masking policies are attached once to a column and apply everywhere that column is queried — including through views and joins — so PII protection can't be bypassed by writing a different query. Row access policies do the equivalent for rows (e.g. a sales rep only sees their own region). This is the mechanism interviewers expect you to reach for over 'we filter it in the application layer,' which is not actually enforced at the data layer."
    },
    {
      title: "Secure Data Sharing (zero-copy)",
      badge: "sharing",
      navLabel: "Try it:",
      nav: "Snowsight → Data Products → Private Sharing (or the SQL below) to share curated tables with another Snowflake account without copying data.",
      code: `CREATE SHARE ORDERS_SHARE;
GRANT USAGE ON DATABASE AWS_INGEST_DB TO SHARE ORDERS_SHARE;
GRANT USAGE ON SCHEMA AWS_INGEST_DB.ANALYTICS TO SHARE ORDERS_SHARE;
GRANT SELECT ON TABLE AWS_INGEST_DB.ANALYTICS.ORDERS TO SHARE ORDERS_SHARE;
ALTER SHARE ORDERS_SHARE ADD ACCOUNTS = <consumer_account_locator>;`,
      noteLabel: "Why it matters:",
      note: "The consumer account queries live data directly against your storage — no export, no copy, no staleness, and you control access down to the object grant. This is Snowflake's headline differentiator over 'send them a nightly extract' data exchange, and a very likely 'how would you share this with another team/company' interview question."
    },
    {
      title: "Zero-copy cloning for dev/test",
      badge: "operations",
      navLabel: "Try it:",
      nav: "Clone a full database instantly for a safe dev/test copy.",
      code: `CREATE DATABASE AWS_INGEST_DB_DEV CLONE AWS_INGEST_DB;
-- Instant, metadata-only operation — no data is physically copied until either side diverges (copy-on-write)`,
      noteLabel: "Why it matters:",
      note: "Cloning is metadata-only at creation time — copy-on-write means storage cost only accrues for the blocks that change afterward. This makes 'spin up a full-size dev copy of production to test a migration' something that takes seconds and costs almost nothing, instead of a multi-hour data copy job. Good answer to 'how do you test schema changes safely.'"
    },
    {
      title: "Semi-structured data at scale: FLATTEN & lateral joins",
      badge: "querying",
      navLabel: "Try it:",
      nav: "Unnest a JSON array field into rows.",
      code: `SELECT
  RAW_DATA:order_id::STRING AS order_id,
  item.value:sku::STRING    AS sku,
  item.value:qty::NUMBER    AS qty
FROM AWS_INGEST_DB.RAW.LANDING,
  LATERAL FLATTEN(input => RAW_DATA:line_items) AS item;`,
      noteLabel: "Why it matters:",
      note: "This project's examples only pull scalar fields out of VARIANT. Real source payloads nest arrays (line items, tags, event lists) — FLATTEN with a LATERAL join is the standard way to explode those into relational rows without a pre-processing step outside Snowflake. Expect at least one interview question that hands you a nested JSON sample and asks you to write this from scratch."
    },
    {
      title: "Streams on views & Change Tracking",
      badge: "concept",
      navLabel: "Try it:",
      nav: "Enable change tracking on a view built from a join, then stream it.",
      code: `ALTER VIEW AWS_INGEST_DB.ANALYTICS.V_ORDERS_ENRICHED SET CHANGE_TRACKING = TRUE;
CREATE STREAM AWS_INGEST_DB.ANALYTICS.V_ORDERS_ENRICHED_STREAM ON VIEW AWS_INGEST_DB.ANALYTICS.V_ORDERS_ENRICHED;`,
      noteLabel: "Why it matters:",
      note: "Streams aren't limited to base tables — you can track changes on a view (including joins across tables), which matters when the 'unit of change' your downstream consumer cares about is a joined/enriched shape, not a single raw table. Lets you avoid materializing an intermediate table purely to get a stream on it."
    },
    {
      title: "Cost & usage observability views",
      badge: "cost",
      navLabel: "Try it:",
      nav: "Query the account usage views that back Snowsight's cost dashboards directly.",
      code: `SELECT WAREHOUSE_NAME, SUM(CREDITS_USED) AS credits
FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY
WHERE START_TIME > DATEADD(DAY, -30, CURRENT_TIMESTAMP())
GROUP BY 1 ORDER BY 2 DESC;

SELECT QUERY_TEXT, WAREHOUSE_NAME, TOTAL_ELAPSED_TIME, BYTES_SCANNED
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
ORDER BY TOTAL_ELAPSED_TIME DESC LIMIT 20;`,
      noteLabel: "Why it matters:",
      note: "SNOWFLAKE.ACCOUNT_USAGE is the audit-grade source (up to 1-year retention, ~45min-3hr latency) behind every cost/usage dashboard; INFORMATION_SCHEMA equivalents are near-real-time but only cover the last 7-14 days. Knowing which schema to query, and the latency trade-off, is a concrete signal of operational maturity beyond 'I look at the Snowsight cost tab.'"
    },
    {
      title: "CI/CD for Snowflake objects",
      badge: "operations",
      navLabel: "How to approach it:",
      nav: "This is usually a discussion question, not a live-code one — have a clear opinion ready.",
      code: null,
      noteLabel: "Model answer:",
      note: "Snowflake DDL/DML should live in version control like any other code, not be run ad hoc through Snowsight. Common approaches: dbt (already covers the ETL layer, and its `schema.yml`/tests double as light governance docs), the official Terraform provider for account-level objects (warehouses, roles, resource monitors, integrations) that don't fit dbt's model, or `schemachange` for pure versioned-migration-style DDL. The dividing line I'd draw: dbt owns transformation logic and tests; Terraform owns account/security-level objects that are provisioned once and rarely change; application/pipeline DDL that changes often belongs in dbt or a migration tool, not hand-run scripts."
    },
    {
      title: "Replication & failover for DR",
      badge: "resilience",
      navLabel: "Try it:",
      nav: "Set up database replication to a secondary account/region (requires Business Critical edition or above for failover).",
      code: `CREATE DATABASE AWS_INGEST_DB_REPLICA AS REPLICA OF <primary_org>.<primary_account>.AWS_INGEST_DB;
ALTER DATABASE AWS_INGEST_DB_REPLICA REFRESH;

-- Business Critical+: promote the replica to primary during a regional outage
ALTER DATABASE AWS_INGEST_DB_REPLICA ENABLE FAILOVER TO ACCOUNTS <secondary_account>;`,
      noteLabel: "Why it matters:",
      note: "Time Travel/Fail-safe protect against accidental data loss, not a regional outage taking your whole account offline. Cross-region/cross-cloud database replication (with failover on Business Critical+) is the actual DR story — worth knowing the distinction cold, since conflating 'Time Travel' with 'disaster recovery' is a common and easily-caught mistake in interviews."
    },
    {
      title: "Snowpark & external functions",
      badge: "advanced",
      navLabel: "Try it:",
      nav: "Write transformation logic in Python that runs inside Snowflake's compute, instead of pulling data out to a separate Python service.",
      code: `# Snowpark Python (runs inside Snowflake's warehouse, not a separate cluster)
from snowflake.snowpark.functions import col
df = session.table("AWS_INGEST_DB.ANALYTICS.ORDERS")
df.filter(col("ORDER_AMOUNT") > 100).group_by("ORDER_STATUS").count().show()`,
      noteLabel: "Why it matters:",
      note: "Snowpark (Python/Java/Scala) lets you write DataFrame-style or UDF/UDTF transformation logic that executes inside Snowflake's own compute — no data leaves the platform, unlike a separate Spark cluster reading via a connector. External Functions go the other direction: calling out to an external API (e.g. AWS Lambda) from within a SQL query, useful for enrichment logic that can't live in SQL. Increasingly common in interviews now that Snowpark ML and Cortex (Snowflake's managed LLM functions) are pushing more of the ML/AI workload directly into the warehouse."
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — talk through this project",
    desc: "Each card is a question you're likely to get in a Data Engineer / Snowflake interview, framed around this project. Read the question, form your own answer out loud first, then expand for a model answer and the reasoning behind it."
  },
  cards: [
    {
      title: "\"Walk me through a Snowflake pipeline you've built.\"",
      navLabel: "How to approach it:",
      badge: "behavioral",
      nav: "Use this project as your STAR narrative: Situation (need to ingest AWS S3 data into Snowflake for analytics), Task (build automated, low-latency ingestion + ETL), Action (Snowpipe + IAM role, then Streams/Tasks or Dynamic Tables), Result (near-real-time curated tables, cost-isolated warehouse). Keep it under 90 seconds, then let them drive follow-ups.",
      noteLabel: "Model answer:",
      note: "\"I set up event-driven ingestion from S3 into Snowflake using Snowpipe with auto-ingest — S3 event notifications push to an SQS queue Snowflake listens on, so new files land within seconds without polling. Files land as VARIANT in a RAW table with lineage columns. From there I built the transform layer two ways depending on need: Streams + Tasks for cases needing custom MERGE logic, and Dynamic Tables when the transform was a straightforward declarative query with a target staleness tolerance. I secured the S3 access with a storage integration and IAM role scoped by external ID — no static AWS keys anywhere.\""
    },
    {
      title: "Why Snowpipe instead of a scheduled COPY INTO?",
      navLabel: "How to approach it:",
      badge: "concept",
      nav: "Contrast latency, cost, and operational model.",
      noteLabel: "Model answer:",
      note: "Snowpipe is event-driven — an S3 event notification triggers ingestion via SQS within seconds of a file arriving, using serverless compute billed per-second. A scheduled COPY INTO on a Task means data waits for the next scheduled run (minutes of latency) and consumes a running warehouse whether or not new files exist. Snowpipe is the right choice when near-real-time matters and file arrival is unpredictable; a scheduled batch load is simpler and fine when latency doesn't matter and files arrive on a predictable cadence."
    },
    {
      title: "How does the SQS-based auto-ingest mechanism actually work end to end?",
      navLabel: "How to approach it:",
      badge: "deep-dive",
      nav: "Trace the event path precisely — interviewers use this to check you understand the mechanism, not just the buzzword.",
      noteLabel: "Model answer:",
      note: "S3 emits an ObjectCreated event on the configured prefix → the bucket's event notification is configured to publish that event to an SQS queue Snowflake owns (created automatically when the pipe is defined with AUTO_INGEST=TRUE) → Snowflake's pipe process consumes the SQS message, which just contains the S3 object key, not the data itself → the pipe issues a COPY INTO against the stage using that key → rows land in the target table with ON_ERROR behavior applied. SHOW PIPES exposes the SQS ARN as notification_channel; SYSTEM$PIPE_STATUS and COPY_HISTORY are the two things to check when files 'go missing'."
    },
    {
      title: "Streams + Tasks vs. Dynamic Tables — when do you pick each?",
      navLabel: "How to approach it:",
      badge: "trade-off",
      nav: "This is the most common follow-up after mentioning both patterns exist — have a clean one-liner plus a nuanced elaboration ready.",
      noteLabel: "Model answer:",
      note: "One-liner: 'Dynamic Tables when the transform is a plain declarative query and I want Snowflake to manage refresh; Streams + Tasks when I need custom branching, multi-statement logic, or non-SQL side effects.' Elaboration: Dynamic Tables reduce operational surface — no stream offsets, no task DAG to manage, target lag abstracts scheduling. But they're read-only (all writes go through the defining query), and some queries (certain window functions, non-deterministic functions) fall back to full refresh silently, which I always verify via DESC DYNAMIC TABLE. Streams + Tasks give full control — arbitrary SQL, procedural logic via stored procs, conditional branching — at the cost of managing stream consumption offsets and task DAG ordering myself."
    },
    {
      title: "How do you guarantee idempotency if a file is processed twice?",
      navLabel: "How to approach it:",
      badge: "correctness",
      nav: "This tests whether you understand exactly-once vs at-least-once semantics — a very common gotcha question.",
      noteLabel: "Model answer:",
      note: "Snowpipe gives at-least-once delivery, not exactly-once — the same file could theoretically be reprocessed (e.g. after a retry). I don't rely on the ingestion layer for idempotency; I push it downstream. The RAW landing table can have duplicate rows, which is fine because it's append-only and cheap. The transform layer is where I enforce correctness: MERGE on a business key (Streams+Tasks) or QUALIFY ROW_NUMBER() OVER (PARTITION BY key ORDER BY load_ts DESC) = 1 (Dynamic Tables) so duplicates collapse to the latest version regardless of how many times the same record landed."
    },
    {
      title: "Why IAM role + external ID instead of an AWS access key on the stage?",
      navLabel: "How to approach it:",
      badge: "security",
      nav: "Security questions in DE interviews are often just checking whether you default to least-privilege / no-static-credentials thinking.",
      noteLabel: "Model answer:",
      note: "Static access keys are a long-lived secret that has to be stored, rotated, and can leak. A storage integration lets Snowflake assume a role via STS instead — no credential to store at all. The external ID in the trust policy exists specifically to prevent the 'confused deputy' problem: without it, anyone who learned the role ARN (which isn't secret) could potentially get another AWS account to assume it on their behalf. The IAM policy attached to that role is also scoped to GetObject/ListBucket on a single prefix — least privilege, not account-wide S3 access."
    },
    {
      title: "How would you control cost on this pipeline?",
      navLabel: "How to approach it:",
      badge: "cost",
      nav: "List concrete levers, not just 'use a small warehouse' — show you understand the cost model.",
      noteLabel: "Model answer:",
      note: "Several levers: (1) dedicated XSMALL warehouse with AUTO_SUSPEND=60s so it's not billed while idle; (2) Snowpipe billing is per-second serverless compute, no warehouse needed for ingestion itself; (3) for Dynamic Tables, TARGET_LAG tuned to the loosest value the business actually needs — 5 minutes instead of 30 seconds can be an order-of-magnitude compute difference; (4) WHEN SYSTEM$STREAM_HAS_DATA(...) on tasks so scheduled runs skip entirely (and cost nothing) when there's no new data instead of running an empty MERGE every interval; (5) tagging the warehouse/database for cost attribution so ingestion spend is visible separately from BI/reporting."
    },
    {
      title: "What happens to malformed or bad rows?",
      navLabel: "How to approach it:",
      badge: "reliability",
      nav: "Good opportunity to be honest about a gap and show you know how to close it — this project uses ON_ERROR='CONTINUE' but doesn't build a full dead-letter pattern.",
      noteLabel: "Model answer:",
      note: "Currently ON_ERROR='CONTINUE' means a bad row is skipped rather than failing the whole file load, and COPY_HISTORY surfaces the error detail per file for investigation. What I'd add for production: a dead-letter table capturing the raw failed record plus the error reason, and an alert (e.g. a scheduled task checking COPY_HISTORY for errors in the last N minutes, or a Snowflake alert) so failures aren't just sitting silently in COPY_HISTORY waiting to be noticed."
    },
    {
      title: "What's missing for this to be production-grade?",
      navLabel: "How to approach it:",
      badge: "maturity",
      nav: "Interviewers love candidates who proactively name the gaps in their own design — it signals seniority. Have 3-4 ready, not a vague 'it would need more testing.'",
      noteLabel: "Model answer:",
      note: "Four concrete gaps I'd flag unprompted: (1) RBAC is collapsed into a single ETL role — production would split ingest/transform/read roles; (2) no dead-letter table or automated alerting wired to Slack/PagerDuty, just queryable history; (3) schema evolution isn't handled — a renamed source field silently casts to NULL rather than failing loud; (4) everything is set up via console/SQL rather than Terraform, so there's no repeatable, reviewable infra-as-code for a second environment."
    },
    {
      title: "When would you reach for dbt + Airflow instead of native Snowflake orchestration?",
      navLabel: "How to approach it:",
      badge: "architecture",
      nav: "Shows you can reason about organizational context, not just technical capability — an important senior-level signal.",
      noteLabel: "Model answer:",
      note: "When the transform needs to integrate with non-Snowflake systems in the same DAG (e.g. write to a data lake, trigger a downstream ML job, call an API), when the org already standardizes on dbt for transformation logic/lineage/testing across multiple warehouses, or when centralized company-wide scheduling/observability (one Airflow instance for everything) matters more than avoiding extra infrastructure. If everything lives and stays in Snowflake and the team is small, native Tasks/Dynamic Tables have less operational overhead — no separate service to run and monitor."
    }
  ]
}
};

const COMPARE_ROWS = [
  ["Orchestration", "Snowflake Tasks (schedule + stream-triggered)", "Fully automatic (target lag driven)", "Airflow DAG (external cron)"],
  ["Transform logic", "SQL MERGE inside task body", "Declarative SELECT query", "dbt models (SQL + Jinja)"],
  ["Best for", "Custom branching logic, fine-grained control", "Simple transform/aggregate pipelines", "Cross-system integration, existing dbt/Airflow shops"],
  ["Incremental handling", "Manual via Stream + MERGE", "Automatic (REFRESH_MODE=INCREMENTAL)", "Manual via is_incremental() + unique_key"],
  ["Ops overhead", "Medium — manage streams, tasks, DAG order", "Low — Snowflake manages refresh", "High — separate infra (Airflow) to run/monitor"],
  ["Data quality gates", "Custom SQL checks", "Custom SQL checks", "Native dbt tests (unique, not_null, custom)"],
  ["Vendor lock-in", "Snowflake-native", "Snowflake-native", "Portable transform logic (dbt runs on many warehouses)"],
];

const QUIZ = [
  {
    q: "Why does the setup use a storage integration + IAM role instead of AWS access keys?",
    options: [
      "Access keys are slower to authenticate with",
      "It avoids long-lived static credentials — Snowflake assumes a role instead",
      "IAM roles are required by S3 event notifications",
      "Access keys don't support JSON file formats"
    ],
    correct: 1
  },
  {
    q: "What does the external ID in the IAM trust policy protect against?",
    options: [
      "SQL injection in the COPY INTO statement",
      "Data corruption during file parsing",
      "The confused-deputy problem — ensuring only Snowflake's specific integration can assume the role",
      "S3 storage costs exceeding budget"
    ],
    correct: 2
  },
  {
    q: "In the Tasks + Streams pattern, why use WHEN SYSTEM$STREAM_HAS_DATA(...) on the task?",
    options: [
      "It's required syntax and has no functional effect",
      "It skips running the task body (and its warehouse cost) when there's nothing new to process",
      "It encrypts the stream contents",
      "It forces the task to run every second instead of every minute"
    ],
    correct: 1
  },
  {
    q: "What does TARGET_LAG control on a Dynamic Table?",
    options: [
      "The maximum staleness you accept before Snowflake refreshes it",
      "How long the table can be queried before it's dropped",
      "The number of retries on a failed COPY INTO",
      "The IAM role's session timeout"
    ],
    correct: 0
  },
  {
    q: "Why register a public key on the dbt service user instead of using a password?",
    options: [
      "Passwords aren't supported by Snowflake at all",
      "Key-pair auth avoids storing a rotatable secret in profiles.yml directly and is easier to rotate/revoke",
      "Public keys make queries run faster",
      "It's required for incremental models to work"
    ],
    correct: 1
  },
  {
    q: "What's the risk of not checking REFRESH_MODE after creating a Dynamic Table with REFRESH_MODE = INCREMENTAL?",
    options: [
      "The table might silently fall back to FULL refresh, which is far more compute-expensive",
      "The table will fail to create",
      "Data will be duplicated on every refresh",
      "The target lag will be ignored entirely"
    ],
    correct: 0
  }
];
