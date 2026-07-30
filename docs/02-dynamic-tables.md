# ETL Variant 2: Snowflake Dynamic Tables

Prerequisite: complete [00-ingestion-setup.md](00-ingestion-setup.md) first — this assumes `AWS_INGEST_DB.RAW.LANDING` is being populated by Snowpipe.

## 1. Concept

A **Dynamic Table** is a declarative target: you write the transformation query once, and Snowflake automatically and incrementally refreshes it to keep it within a **target lag** of the source — no manual streams, tasks, or scheduling logic. Best for straightforward transform/aggregate pipelines where you don't need custom branching logic.

## 2. Create the dynamic table (replaces manual MERGE/task logic)

**Navigation:** Snowsight → **Worksheets** → **+ Worksheet** → role dropdown (top right) → `INGEST_ETL_ROLE`, warehouse dropdown → `INGEST_WH` → paste and run. To view it afterward as an object: left sidebar **Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS**.

```sql
USE ROLE INGEST_ETL_ROLE;
USE WAREHOUSE INGEST_WH;

CREATE DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS
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
QUALIFY ROW_NUMBER() OVER (PARTITION BY RAW_DATA:order_id ORDER BY LOAD_TS DESC) = 1;
```

> `TARGET_LAG` is the max staleness you accept — Snowflake decides refresh cadence/compute to meet it. Smaller lag = more frequent refresh = more compute cost. `REFRESH_MODE = INCREMENTAL` processes only new/changed rows; Snowflake falls back to `FULL` automatically if the query isn't incrementally-refreshable (e.g. certain window functions) — check with `DESC DYNAMIC TABLE`.

## 3. Chain multiple dynamic tables (staging → curated)

Dynamic tables can reference other dynamic tables — Snowflake builds the DAG and lag propagation automatically.

**Navigation:** Same worksheet/role. View the generated DAG graphically: left sidebar **Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS_ENRICHED** → **Graph** tab (shows upstream/downstream dynamic table dependencies).

```sql
CREATE DYNAMIC TABLE AWS_INGEST_DB.STAGING.ORDERS_CLEAN
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
JOIN AWS_INGEST_DB.ANALYTICS.CUSTOMERS c ON o.CUSTOMER_ID = c.CUSTOMER_ID;
```

## 4. Validate refresh behavior

**Navigation:** left sidebar **Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS** → **Refresh History** tab shows the same data as the SQL below without writing a query.

```sql
DESC DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS;

SELECT *
FROM TABLE(INFORMATION_SCHEMA.DYNAMIC_TABLE_REFRESH_HISTORY(
  NAME => 'AWS_INGEST_DB.ANALYTICS.ORDERS'))
ORDER BY REFRESH_START_TIME DESC;

-- Confirm incremental (not full) refresh is being used
SELECT REFRESH_ACTION, STATE, DATA_TIMESTAMP FROM TABLE(
  INFORMATION_SCHEMA.DYNAMIC_TABLE_REFRESH_HISTORY(NAME => 'AWS_INGEST_DB.ANALYTICS.ORDERS'))
LIMIT 10;
```

## 5. Suspend / resume (maintenance)

**Navigation (UI alternative to SQL):** left sidebar **Data → Databases → AWS_INGEST_DB → ANALYTICS → Dynamic Tables → ORDERS** → **Suspend** / **Resume** buttons (top right of the object detail panel).

```sql
ALTER DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS SUSPEND;
ALTER DYNAMIC TABLE AWS_INGEST_DB.ANALYTICS.ORDERS RESUME;
```

## 6. Best practices applied here

- **`TARGET_LAG` tuned to business need, not "as fast as possible"** — tightest lag your use case actually requires; over-tight lag drives unnecessary compute cost.
- **`REFRESH_MODE = INCREMENTAL`** explicitly requested, and verified via `DESC DYNAMIC TABLE` — silent fallback to `FULL` refresh on a large table is a common cost surprise.
- **`QUALIFY ROW_NUMBER()`** dedup pattern — handles duplicate/out-of-order landing rows without a separate merge step.
- **`TARGET_LAG = 'DOWNSTREAM'`** on intermediate tables — avoids redundant refresh scheduling; only the final consumer's lag matters.
- **Dedicated warehouse**, separate from ingestion if refresh volume is large, to avoid contention.
- **`DYNAMIC_TABLE_REFRESH_HISTORY`** monitoring — wire into alerting for failed/skipped refreshes.
- Dynamic tables are **read-only to users otherwise** — don't attempt manual `INSERT`/`MERGE` into them; all writes flow through the defining query.
