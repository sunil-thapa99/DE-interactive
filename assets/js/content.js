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
