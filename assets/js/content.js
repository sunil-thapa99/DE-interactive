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
      concept: "This is the destination table your ETL merges into — the schema a BI tool or downstream consumer actually queries. Notice it has a real, typed schema (STRING, NUMBER(12,2), TIMESTAMP_NTZ) instead of the VARIANT column used in RAW.LANDING. That type promotion is the whole point of the transform layer: raw JSON is flexible but slow to query and easy to misuse (silent type coercion, no constraint enforcement); a curated table is fast to scan, self-documenting, and enforces expectations. UPDATED_AT is an audit column — without it, you can't answer 'when did this row last change' when debugging a stale-looking value downstream.",
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
      concept: "A Stream doesn't store data — it's a pointer (an offset) into the table's underlying change log, tracking which rows are 'new since I was last read.' When you SELECT from a stream, you get an implicit METADATA$ACTION column (INSERT/DELETE/UPDATE) and metadata rows describing what changed. Critically, the offset only advances when the stream is consumed inside a DML statement (like the MERGE in the next step) that actually commits — a SELECT alone doesn't consume it. This is what makes Streams safe to poll repeatedly without losing data: if the task fails mid-run, the stream still has the un-consumed rows next time it runs. APPEND_ONLY=TRUE is a real optimization, not just documentation — it tells Snowflake it never needs to track deletes/updates on this stream, which is true here because Snowpipe only ever inserts into RAW.LANDING.",
      nav: "Same worksheet/role. Confirm afterward: Data → Databases → AWS_INGEST_DB → RAW → Streams.",
      code: `CREATE STREAM IF NOT EXISTS AWS_INGEST_DB.RAW.LANDING_STREAM
  ON TABLE AWS_INGEST_DB.RAW.LANDING
  APPEND_ONLY = TRUE;   -- landing table is insert-only; cheaper stream metadata`
    },
    {
      title: "Create the transform task",
      concept: "A Task is just a scheduled wrapper around a single SQL statement (or a call to a stored procedure) — it needs its own warehouse to run on, its own schedule, and an optional guard condition. The guard here, WHEN SYSTEM$STREAM_HAS_DATA(...), is evaluated by a lightweight background service before spinning up the warehouse at all, so an empty check costs effectively nothing — this is different from the task simply running the MERGE against an empty stream every minute, which would still burn a few seconds of warehouse time per run for nothing. The MERGE pattern itself matters: because it's keyed on ORDER_ID with explicit MATCHED/NOT MATCHED branches, running the exact same task execution twice (e.g. after a retry) produces the same end state — that's the idempotency property you want in any pipeline that might reprocess data.",
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
      concept: "AFTER creates a parent-child dependency: TASK_MERGE_ORDERS only fires once TASK_CLEANSE finishes successfully — Snowflake manages this as a DAG (directed acyclic graph), not two independently-scheduled tasks that happen to run near each other. This matters because it removes an entire class of race condition: without AFTER, you'd need the cleanse task's schedule and the merge task's schedule to never overlap badly, which is fragile as the pipeline grows. The trade-off is that if TASK_CLEANSE fails, TASK_MERGE_ORDERS simply never runs that cycle (visible in Task History as a skipped run) — you're not silently merging half-cleansed data, but you do need to monitor the whole DAG, not just the leaf.",
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
      concept: "The RESUME order (child/leaf tasks before the root) matters mechanically: Snowflake only actually triggers a task run for a resumed task if every task above it in the chain is also resumed — resuming the root while a child is still suspended results in the root running but the child silently never firing. Resuming leaf-to-root guarantees the whole chain is armed before the root's schedule can trigger anything, so you don't get a partial DAG execution on the very first run.",
      nav: "UI alternative: Data → Databases → AWS_INGEST_DB → ANALYTICS → Tasks → TASK_MERGE_ORDERS → Resume button (top right of detail panel). Repeat per task, child before root.",
      code: `ALTER TASK AWS_INGEST_DB.ANALYTICS.TASK_MERGE_ORDERS RESUME;  -- resume leaf tasks first if chained
ALTER TASK AWS_INGEST_DB.STAGING.TASK_LOAD_ORDERS RESUME;     -- then the root`,
      note: "Tasks are created SUSPENDED by default — this is a safety default, not a bug."
    },
    {
      title: "Monitor task runs",
      concept: "TASK_HISTORY is a table function, not a static view — it takes parameters (task name, time window, result limit) because the underlying execution log can be large and you're expected to filter it rather than scan everything. The STATE column is the one that matters operationally: SUCCEEDED, FAILED, SKIPPED (guard condition was false — this is normal and expected most runs), and CANCELLED. A pipeline that looks 'broken' because no new rows are showing up is very often just a task stuck in SKIPPED because the stream never has data — which points back to the ingestion layer (Snowpipe), not the transform layer, being the actual problem.",
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
      concept: "A Dynamic Table inverts the mental model from Streams+Tasks: instead of you writing 'read the delta, then MERGE it,' you write one query describing the desired end state, and Snowflake's refresh engine figures out how to get there incrementally. Internally, on each refresh it computes what changed in the source since the last refresh and applies only that delta to the target — conceptually similar to what you'd hand-write with a Stream+MERGE, but Snowflake manages the change-tracking metadata for you. TARGET_LAG is a service-level objective, not a cron schedule: you're telling Snowflake 'this table must never be more than 5 minutes stale,' and it decides how often to actually run a refresh (and how much compute to throw at it) to hit that target as cheaply as possible. The QUALIFY ROW_NUMBER() dedup exists because RAW.LANDING can contain the same order_id more than once (e.g. a corrected re-upload of a file) — a dynamic table has no MERGE-style upsert logic of its own, so dedup has to happen inside the SELECT itself.",
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
      concept: "Because a dynamic table's defining query can SELECT FROM another dynamic table, Snowflake automatically infers the dependency graph — there's no explicit AFTER clause to write like there is with Tasks. The interesting part is lag propagation: TARGET_LAG = 'DOWNSTREAM' on ORDERS_ENRICHED means 'don't set your own staleness target — instead, refresh often enough to satisfy whatever consumes you.' If nothing ever queries ORDERS_ENRICHED directly and only a final report table (with its own explicit TARGET_LAG) consumes it, Snowflake propagates that report table's lag requirement backward through the whole chain. This avoids the situation where every intermediate table in a 4-stage chain is independently configured for '1 minute' lag when only the final output actually needs to be fresh — that would mean 4x the refresh compute for staleness nobody asked for.",
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
      concept: "This step exists because 'incremental' isn't guaranteed just because you asked for it — REFRESH_MODE = INCREMENTAL is a request, and Snowflake silently substitutes FULL if your query isn't incrementally-refreshable (common causes: certain window functions, non-deterministic functions, some outer joins). A full refresh recomputes the entire table from scratch on every cycle, which on a large source table is a very different cost profile than a true incremental delta — and nothing in the CREATE statement itself will warn you if this happens. DESC DYNAMIC TABLE exposes the actual refresh_mode Snowflake settled on, and DYNAMIC_TABLE_REFRESH_HISTORY exposes REFRESH_ACTION per run (INCREMENTAL vs FULL) so you can catch a silent downgrade before it becomes a cost surprise.",
      nav: "UI alternative: Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS → Refresh History tab.",
      code: `DESC DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS;

SELECT * FROM TABLE(INFORMATION_SCHEMA.DYNAMIC_TABLE_REFRESH_HISTORY(
  NAME => 'AWS_INGEST_DB.ANALYTICS.ORDERS'))
ORDER BY REFRESH_START_TIME DESC;`
    },
    {
      title: "Suspend / resume for maintenance",
      concept: "SUSPEND stops the refresh scheduler from running against this table — the table's data stays exactly as it was at the last successful refresh (it doesn't clear or lock the table, it just freezes it). This is the safe way to pause a table while you're, say, altering an upstream table's schema, without dropping and recreating the dynamic table (which would lose its refresh history and briefly make it unavailable). RESUME picks refreshing back up, and because Dynamic Tables track their own change-tracking metadata, it resumes incrementally from where it left off rather than needing a full recompute — as long as the suspension wasn't so long that the underlying source table's own change history expired.",
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
      concept: "dbt's core idea is that a 'transform' is just a SELECT statement saved as a version-controlled file (a model) — dbt compiles it, resolves dependencies between models via ref(), and issues the CREATE/INSERT/MERGE DDL to Snowflake for you. staging/ models typically do 1:1 cleansing of a single source (cast types, rename columns, filter obvious junk); marts/ models are the business-facing curated output, often joining multiple staging models together. This separation exists so a change to a source system only requires editing one staging model, not every downstream query that happens to reference that source.",
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
      concept: "sources.yml doesn't create anything in Snowflake — it's dbt's way of registering 'this table already exists and I don't manage it, but my models depend on it,' which is what makes source('raw','LANDING') resolvable in model SQL and what makes dbt docs able to draw the full lineage graph starting from a raw table it never touches. The freshness block is the more important part conceptually: it turns 'is Snowpipe still working' from a question you'd have to remember to check manually into an automated assertion dbt evaluates before running any downstream model — dbt source freshness effectively pings LOAD_TS's max value and compares it to the configured thresholds.",
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
      concept: "materialized='incremental' tells dbt: on the first run, build this as a full CREATE TABLE AS SELECT; on every subsequent run, only process rows matching the is_incremental() branch and MERGE them into the existing table using unique_key. Without is_incremental(), dbt would recompute and rebuild the entire table from all of RAW.LANDING on every single run — fine for a small table, prohibitively expensive once RAW.LANDING is millions of rows. This is functionally the same delta-only philosophy as a Snowflake Stream, just expressed in dbt's Jinja templating instead of native Snowflake DDL — worth noticing that both native and external orchestration converge on the same underlying idea: don't reprocess data you've already processed.",
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
      concept: "ref('stg_orders') is the mechanism that makes this a DAG instead of a pile of unrelated SQL files: dbt parses every model's ref()/source() calls at compile time to build the dependency graph, then runs models in the correct topological order automatically — you never have to manually sequence 'run staging first, then marts.' It also means dbt knows to resolve stg_orders to whatever schema/database that model actually landed in (which can differ between dev and prod targets in profiles.yml), so the SQL itself stays environment-agnostic.",
      nav: "Create/edit under models/marts/. Verify in Snowsight: Data → Databases → AWS_INGEST_DB → ANALYTICS → Tables → ORDERS.",
      code: `{{ config(materialized='incremental', unique_key='order_id') }}

SELECT * FROM {{ ref('stg_orders') }}
{% if is_incremental() %}
  WHERE order_ts > (SELECT MAX(order_ts) FROM {{ this }})
{% endif %}`
    },
    {
      title: "Connection profile — key-pair auth",
      concept: "profiles.yml is deliberately kept separate from dbt_project.yml (which lives in the repo) — profiles.yml holds environment/credential specifics and is meant to live outside version control (in ~/.dbt/ locally, or injected as a secret in CI/Airflow). Key-pair auth works via asymmetric crypto: dbt signs its connection request with the private key, Snowflake verifies it against the public key registered on the user via ALTER USER — Snowflake never sees or stores the private key itself. This is why rotation is simple and low-risk: generate a new key pair, register the new public key alongside the old one (Snowflake supports two active RSA keys per user for exactly this reason), cut over, then remove the old one — no shared password to reset everywhere at once.",
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
      concept: "Airflow's job here is purely orchestration — deciding when to run dbt and what to do if it fails — not transformation logic, which stays entirely inside the dbt models. Running dbt via KubernetesPodOperator (a fresh container per run) rather than a long-lived worker with dbt pre-installed keeps the dbt version pinned per-DAG-run and avoids dependency drift between Airflow's environment and dbt's; is_delete_operator_pod=True means the pod is cleaned up automatically instead of accumulating. The retries/retry_delay in default_args exist because transient failures (a warehouse resume timeout, a momentary network blip) shouldn't require a human to notice and manually re-trigger — Airflow retries automatically before escalating to an actual alert.",
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
      concept: "dbt tests compile down to a SELECT that should return zero rows if the assertion holds — unique/not_null are built-in generic tests, and dbt_utils.accepted_range is a package-provided one; you can also write fully custom SQL tests. The reason run_dbt >> dbt_test matters as a DAG ordering (rather than testing being optional/manual) is that it turns 'the pipeline ran' and 'the pipeline produced trustworthy data' into two separate, both-required conditions — a MERGE can succeed (no SQL error) while still producing duplicate order_ids or negative amounts if an upstream assumption silently broke, and only the test step would catch that.",
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

modeling: {
  intro: {
    title: "Data modeling & advanced loading — 4-5 YOE depth",
    desc: "The pipeline so far loads one flat ORDERS table. Real Data Engineer roles expect you to design proper dimensional models, handle slowly changing history, tune bulk loads beyond Snowpipe, move data back out, and reason about newer table formats. Each card is a concept, a runnable example, and why it matters."
  },
  cards: [
    {
      title: "Star schema vs snowflake schema",
      badge: "modeling",
      concept: "A star schema puts one central fact table (transactional/measurable events — orders, clicks, payments) surrounded by denormalized dimension tables (customer, product, date) that each join directly to the fact table in a single hop. A snowflake schema normalizes those dimensions further (e.g. PRODUCT splits into PRODUCT → CATEGORY → DEPARTMENT), trading storage/redundancy for query simplicity. On Snowflake specifically, storage is cheap and compute is what you pay for, and every extra join hop is another operator in the query plan — so the star schema's single-hop joins are almost always the better default; snowflaking only pays off when a dimension attribute changes so often that denormalizing it would mean rewriting huge swaths of the dimension table on every update.",
      navLabel: "Try it:",
      nav: "Sketch the model before writing DDL: one fact table with foreign keys to each dimension's surrogate key, never the dimension's natural/business key.",
      code: `CREATE TABLE ANALYTICS.DIM_CUSTOMER (
  CUSTOMER_SK   NUMBER AUTOINCREMENT PRIMARY KEY,  -- surrogate key, stable even if source system changes
  CUSTOMER_ID   STRING,                             -- natural/business key from the source
  CUSTOMER_NAME STRING,
  REGION        STRING
);

CREATE TABLE ANALYTICS.FACT_ORDERS (
  ORDER_ID      STRING PRIMARY KEY,
  CUSTOMER_SK   NUMBER REFERENCES ANALYTICS.DIM_CUSTOMER(CUSTOMER_SK),
  ORDER_AMOUNT  NUMBER(12,2),
  ORDER_TS      TIMESTAMP_NTZ
);`,
      noteLabel: "Why it matters:",
      note: "Interviewers will ask you to justify fact vs. dimension classification on the spot — the test is: does this table represent something that happened (fact, usually numeric/additive) or something that describes/categorizes (dimension, usually text attributes)? Getting the surrogate-key pattern right (never join facts to dimensions on the natural key directly) is what makes SCD Type 2 possible in the next card."
    },
    {
      title: "Slowly Changing Dimensions — Type 1, 2, and 3",
      badge: "modeling",
      concept: "SCD is about what happens when a dimension attribute changes (a customer moves region, a product gets recategorized) and whether you need to preserve that history. Type 1 overwrites — no history, simplest, use when the old value truly doesn't matter (correcting a typo). Type 2 adds a new row with validity dates and keeps the old row — full history, the standard choice for anything you'd ever need to report on 'as it was at the time' (e.g. which region a sale should be attributed to using the region that was true on the order date, not today's region). Type 3 adds a new column for the previous value — limited history (one prior state), rarely used, mainly when you only ever need 'current vs. immediately-previous.'",
      navLabel: "Try it:",
      nav: "Implement Type 2 with a MERGE that closes out the old row and inserts a new one in the same statement using a CTE.",
      code: `MERGE INTO ANALYTICS.DIM_CUSTOMER_SCD2 AS tgt
USING (
  SELECT CUSTOMER_ID, CUSTOMER_NAME, REGION FROM STAGING.CUSTOMER_UPDATES
) AS src
ON tgt.CUSTOMER_ID = src.CUSTOMER_ID AND tgt.IS_CURRENT = TRUE
WHEN MATCHED AND tgt.REGION != src.REGION THEN UPDATE SET
  tgt.IS_CURRENT = FALSE, tgt.VALID_TO = CURRENT_TIMESTAMP()
WHEN NOT MATCHED THEN INSERT (CUSTOMER_ID, CUSTOMER_NAME, REGION, VALID_FROM, VALID_TO, IS_CURRENT)
  VALUES (src.CUSTOMER_ID, src.CUSTOMER_NAME, src.REGION, CURRENT_TIMESTAMP(), NULL, TRUE);
-- Note: a single MERGE can't both close the old row AND insert the new one for the same key in one pass in all engines;
-- production implementations typically run this as two statements (UPDATE old row, then INSERT new row) inside one transaction.`,
      noteLabel: "Why it matters:",
      note: "This is one of the most commonly asked hands-on SQL questions in DE interviews — 'design a table that tracks a customer's region history and write the load logic.' Being able to explain the VALID_FROM/VALID_TO/IS_CURRENT pattern and why a naive UPDATE-in-place (Type 1) loses the ability to correctly attribute historical facts is the actual signal they're looking for."
    },
    {
      title: "COPY INTO file sizing & bulk load tuning",
      badge: "loading",
      concept: "Snowpipe (used elsewhere in this project) is optimized for frequent small files arriving continuously. For a one-time or scheduled bulk historical load, a plain COPY INTO on a warehouse is more efficient — but only if the source files are sized correctly. Snowflake parallelizes a COPY INTO load across the warehouse's available threads by file, not by splitting a single file — so 1 huge 5GB file loads on a single thread no matter how big the warehouse is, while 50 files of ~100MB each parallelize across many threads simultaneously. Snowflake's own guidance is roughly 100-250MB compressed per file as the sweet spot.",
      navLabel: "Try it:",
      nav: "Load a bulk historical export and check load parallelism.",
      code: `COPY INTO AWS_INGEST_DB.RAW.LANDING (RAW_DATA)
  FROM @AWS_INGEST_DB.RAW.S3_INGEST_STAGE/historical/
  FILE_FORMAT = (FORMAT_NAME = AWS_INGEST_DB.RAW.FF_JSON)
  PATTERN = '.*\\.json\\.gz'
  PARALLEL = 8      -- warehouse-side load parallelism hint
  ON_ERROR = 'CONTINUE';

SELECT FILE_NAME, ROW_COUNT, STATUS FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(
  TABLE_NAME=>'AWS_INGEST_DB.RAW.LANDING', START_TIME=>DATEADD(HOUR,-2,CURRENT_TIMESTAMP())))
ORDER BY LAST_LOAD_TIME DESC;`,
      noteLabel: "Why it matters:",
      note: "A common real interview scenario: 'a historical backfill of 200GB is taking 6 hours, how do you speed it up?' The answer is almost always file sizing/count and warehouse size, not application-level parallelism — an unaware candidate reaches for a bigger warehouse first when the actual bottleneck is 3 giant files that can't be parallelized regardless of warehouse size."
    },
    {
      title: "Unloading data out of Snowflake",
      badge: "loading",
      concept: "COPY INTO works in both directions — the same command that loads data (stage → table) also unloads it (table → stage) when the direction of the arguments is reversed. This matters whenever another system (a data lake, a partner, a legacy BI tool) needs a flat-file export rather than direct query access, and it's also how you'd hand off data to a system that doesn't support Snowflake's connectors at all.",
      navLabel: "Try it:",
      nav: "Export a curated table back to S3 as partitioned Parquet files.",
      code: `COPY INTO @AWS_INGEST_DB.RAW.S3_INGEST_STAGE/exports/orders/
  FROM AWS_INGEST_DB.ANALYTICS.ORDERS
  FILE_FORMAT = (TYPE = PARQUET)
  HEADER = TRUE
  MAX_FILE_SIZE = 134217728   -- ~128MB per output file, avoids one giant file on unload too
  OVERWRITE = TRUE;`,
      noteLabel: "Why it matters:",
      note: "Same file-sizing logic from the loading card applies in reverse — MAX_FILE_SIZE keeps unloaded output from becoming one unwieldy file. Interviewers sometimes probe whether you know COPY INTO is bidirectional at all, since many candidates only ever think of it as a load command."
    },
    {
      title: "Stream staleness",
      badge: "gotcha",
      concept: "A Stream depends on Time Travel metadata on its source table to compute the delta — if a stream goes unconsumed for longer than the source table's DATA_RETENTION_TIME_IN_DAYS (default 1 day on Standard edition), the stream becomes STALE and Snowflake can no longer reliably compute what changed. A stale stream doesn't error loudly by default in older behavior — querying it may silently return incomplete results unless you check its staleness first, which is exactly the kind of silent-data-loss bug that's hard to catch in code review.",
      navLabel: "Try it:",
      nav: "Check staleness before trusting a stream that hasn't been consumed recently — e.g. after a paused/suspended task.",
      code: `SHOW STREAMS LIKE 'LANDING_STREAM' IN SCHEMA AWS_INGEST_DB.RAW;
-- check the "stale" column in the result — 'true' means the delta is no longer trustworthy

ALTER TABLE AWS_INGEST_DB.RAW.LANDING SET DATA_RETENTION_TIME_IN_DAYS = 3;  -- widen the safety window`,
      noteLabel: "Why it matters:",
      note: "This is a classic 'why did my Task+Stream pipeline silently stop producing correct results after I paused it for a few days' interview/real-world scenario. The fix is either widening retention on the source table or rebuilding the stream (which forces a fresh baseline, at the cost of the old delta)."
    },
    {
      title: "Serverless task compute sizing",
      badge: "gotcha",
      concept: "A Task doesn't have to run on a warehouse you manage explicitly — omitting WAREHOUSE lets Snowflake run it as a serverless task, using Snowflake-managed compute that's billed separately and can auto-scale between runs based on observed workload. USER_TASK_MANAGED_INITIAL_WAREHOUSE_SIZE sets the starting size before Snowflake's own sizing heuristics take over.",
      navLabel: "Try it:",
      nav: "Convert a task to serverless when you don't want to own warehouse sizing for it.",
      code: `CREATE TASK AWS_INGEST_DB.STAGING.TASK_LOAD_ORDERS_SERVERLESS
  USER_TASK_MANAGED_INITIAL_WAREHOUSE_SIZE = 'XSMALL'
  SCHEDULE = '1 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('AWS_INGEST_DB.RAW.LANDING_STREAM')
AS
MERGE INTO AWS_INGEST_DB.ANALYTICS.ORDERS ... ;`,
      noteLabel: "Why it matters:",
      note: "Serverless tasks trade a bit of cost predictability (Snowflake decides sizing, billed per-second on its own credit rate) for zero warehouse management overhead — useful for infrequent, small, or unpredictable-load transform tasks where hand-tuning a dedicated warehouse isn't worth the effort. Worth knowing this option exists so you don't default to 'every task needs an explicit WAREHOUSE' when asked to design something lightweight."
    },
    {
      title: "Schema inference & MATCH_BY_COLUMN_NAME",
      badge: "loading",
      concept: "Instead of hand-writing a CREATE TABLE and then casting every VARIANT field individually (as this project's core pipeline does), Snowflake can infer a table schema directly from a set of Parquet/Avro/CSV/JSON files using INFER_SCHEMA, and MATCH_BY_COLUMN_NAME lets a COPY INTO map source file columns to target table columns by name instead of positional order — useful when the source schema evolves (new columns added) without you rewriting the load statement.",
      navLabel: "Try it:",
      nav: "Auto-generate a table DDL from a sample of files instead of hand-typing every column.",
      code: `SELECT * FROM TABLE(
  INFER_SCHEMA(LOCATION => '@AWS_INGEST_DB.RAW.S3_INGEST_STAGE/historical/', FILE_FORMAT => 'AWS_INGEST_DB.RAW.FF_JSON')
);

CREATE TABLE AWS_INGEST_DB.RAW.ORDERS_TYPED
  USING TEMPLATE (
    SELECT ARRAY_AGG(OBJECT_CONSTRUCT(*)) FROM TABLE(
      INFER_SCHEMA(LOCATION => '@AWS_INGEST_DB.RAW.S3_INGEST_STAGE/historical/', FILE_FORMAT => 'AWS_INGEST_DB.RAW.FF_JSON')
    )
  );

COPY INTO AWS_INGEST_DB.RAW.ORDERS_TYPED
  FROM @AWS_INGEST_DB.RAW.S3_INGEST_STAGE/historical/
  FILE_FORMAT = (FORMAT_NAME = AWS_INGEST_DB.RAW.FF_JSON)
  MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;`,
      noteLabel: "Why it matters:",
      note: "This is the more 'modern' loading pattern Snowflake has pushed for structured Parquet sources especially — it reduces the amount of hand-maintained VARIANT-casting SQL this project's ingestion setup relies on, at the cost of being less explicit about types. Good to mention as an alternative approach when asked 'how would you improve this ingestion design.'"
    },
    {
      title: "External tables vs. Iceberg tables",
      badge: "concept",
      concept: "An external table lets you query files sitting in S3 (or another cloud store) as if they were a Snowflake table, without ever copying the data in — Snowflake reads directly from the external location on each query, refreshing its own metadata via a similar auto-refresh mechanism to Snowpipe. It's read-only and typically slower than a native table since there's no Snowflake-managed micro-partitioning. Iceberg Tables are the newer, more capable evolution: Snowflake can both read AND write Apache Iceberg-format tables stored in your own S3 bucket, with full DML support and near-native performance, while still being directly readable by other Iceberg-compatible engines (Spark, Athena, etc.) — solving the 'my data is locked into Snowflake's proprietary storage format' concern some orgs have.",
      navLabel: "Try it:",
      nav: "Contrast a basic external table against an Iceberg table over the same S3 location.",
      code: `-- External table: read-only, Snowflake-managed metadata pointer to files in place
CREATE EXTERNAL TABLE AWS_INGEST_DB.RAW.EXT_ORDERS
  LOCATION = @AWS_INGEST_DB.RAW.S3_INGEST_STAGE/historical/
  AUTO_REFRESH = TRUE
  FILE_FORMAT = (TYPE = PARQUET);

-- Iceberg table: Snowflake reads AND writes, data still lives in your own S3 bucket in open format
CREATE ICEBERG TABLE AWS_INGEST_DB.ANALYTICS.ICEBERG_ORDERS
  EXTERNAL_VOLUME = 'my_s3_iceberg_volume'
  CATALOG = 'SNOWFLAKE'
  BASE_LOCATION = 'iceberg/orders/'
AS SELECT * FROM AWS_INGEST_DB.ANALYTICS.ORDERS;`,
      noteLabel: "Why it matters:",
      note: "Iceberg table support is one of the most actively-evolving parts of the Snowflake platform right now (2025-2026), and increasingly shows up in interviews as a 'have you kept up with the platform' signal, especially at orgs concerned about multi-engine/multi-cloud data lake strategies rather than being fully locked into Snowflake-proprietary storage."
    },
    {
      title: "Troubleshooting scenario: a task has been running for 2 hours",
      badge: "scenario",
      navLabel: "How to approach it:",
      nav: "This is a live-scenario question, not a lookup — walk the interviewer through your diagnostic order, not just the eventual fix.",
      code: `SELECT * FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_WAREHOUSE(WAREHOUSE_NAME=>'INGEST_WH'))
WHERE EXECUTION_STATUS = 'RUNNING' ORDER BY START_TIME;

SELECT SYSTEM$CANCEL_QUERY('<query_id>');   -- once you've confirmed it's genuinely stuck, not just slow`,
      noteLabel: "Model answer:",
      note: "\"First I'd check Query History filtered to that warehouse for RUNNING queries and open the Query Profile for the stuck one — I'm looking for spillage to remote storage (undersized warehouse for the data volume), a join producing far more rows than expected (bad join key), or the query just waiting on a warehouse that's queued behind other work. If it's a genuine runaway (e.g. a Cartesian join), I'd cancel it with SYSTEM$CANCEL_QUERY rather than let it keep burning credits, then fix the query and consider whether a resource monitor should have caught this earlier.\""
    },
    {
      title: "Troubleshooting scenario: credit spend spiked 3x overnight",
      badge: "scenario",
      navLabel: "How to approach it:",
      nav: "Another scenario question — show you'd investigate with data, not guess.",
      code: `SELECT WAREHOUSE_NAME, DATE_TRUNC('hour', START_TIME) AS hr, SUM(CREDITS_USED) AS credits
FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY
WHERE START_TIME > DATEADD(DAY, -2, CURRENT_TIMESTAMP())
GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 20;`,
      noteLabel: "Model answer:",
      note: "\"I'd start with WAREHOUSE_METERING_HISTORY bucketed by hour to find which specific warehouse and time window drove the spike, then cross-reference QUERY_HISTORY for that warehouse/window to find the specific query or queries responsible — common culprits are a Dynamic Table whose REFRESH_MODE silently fell back to FULL, a Task loop that started running every minute instead of skipping via STREAM_HAS_DATA due to a stream going stale, or someone running ad-hoc exploratory queries on a production-sized warehouse. I'd fix the immediate cause, then check whether a resource monitor threshold should be tightened so the next spike pages someone before it becomes a monthly bill surprise.\""
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
