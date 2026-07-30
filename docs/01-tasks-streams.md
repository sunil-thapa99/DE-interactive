# ETL Variant 1: Snowflake Tasks + Streams

Prerequisite: complete [00-ingestion-setup.md](00-ingestion-setup.md) first — this assumes `AWS_INGEST_DB.RAW.LANDING` is being populated by Snowpipe.

## 1. Concept

A **Stream** on `RAW.LANDING` captures every new row (CDC-style, insert-only) since the stream was last consumed. A **Task** runs on a schedule (or chained), reads only the stream's delta, transforms it, and `MERGE`s it into the internal target table. Consuming the stream (via `DML` inside the task) resets its offset — this is what makes it incremental and idempotent.

## 2. Create the internal target (curated) table

**Navigation:** Snowsight → **Worksheets** → **+ Worksheet** → role dropdown (top right) → `INGEST_ETL_ROLE`, warehouse dropdown → `INGEST_WH` → paste and run.

```sql
USE ROLE INGEST_ETL_ROLE;
USE WAREHOUSE INGEST_WH;

CREATE TABLE IF NOT EXISTS AWS_INGEST_DB.ANALYTICS.ORDERS (
  ORDER_ID        STRING PRIMARY KEY,
  CUSTOMER_ID     STRING,
  ORDER_AMOUNT    NUMBER(12,2),
  ORDER_STATUS    STRING,
  ORDER_TS        TIMESTAMP_NTZ,
  UPDATED_AT      TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

## 3. Create a stream on the landing table

**Navigation:** Same worksheet/role. To confirm the stream exists afterward: left sidebar **Data → Databases → AWS_INGEST_DB → RAW → Streams**.

```sql
CREATE STREAM IF NOT EXISTS AWS_INGEST_DB.RAW.LANDING_STREAM
  ON TABLE AWS_INGEST_DB.RAW.LANDING
  APPEND_ONLY = TRUE;   -- landing table is insert-only; cheaper stream metadata
```

## 4. Create the transform task (stream-triggered, no fixed polling interval)

**Navigation:** Same worksheet/role. To view it as a UI object afterward: left sidebar **Data → Databases → AWS_INGEST_DB → STAGING → Tasks → TASK_LOAD_ORDERS**, or the dedicated **Monitor → Task History** page (left sidebar **Monitoring → Task History**) once it starts running.

```sql
CREATE TASK IF NOT EXISTS AWS_INGEST_DB.STAGING.TASK_LOAD_ORDERS
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
  VALUES (src.ORDER_ID, src.CUSTOMER_ID, src.ORDER_AMOUNT, src.ORDER_STATUS, src.ORDER_TS);
```

> `WHEN SYSTEM$STREAM_HAS_DATA(...)` means the task body is skipped (no warehouse spend) if there's nothing new — the `SCHEDULE` interval is just the polling cadence, not a guaranteed run.

## 5. Multi-step pipelines: chain tasks (optional)

If you need a staging cleanse step before the curated merge, use a DAG via `AFTER`:

**Navigation:** Same worksheet/role. View the resulting DAG graphically: left sidebar **Monitoring → Task History** → click the task name → **Graph** tab shows the parent/child chain.

```sql
CREATE TASK AWS_INGEST_DB.STAGING.TASK_CLEANSE
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
MERGE INTO AWS_INGEST_DB.ANALYTICS.ORDERS ... ;
```

## 6. Enable the task(s)

Tasks are created **suspended** by default — you must explicitly resume, starting from the root of the DAG (children auto-run when the parent finishes):

**Navigation (UI alternative to SQL):** left sidebar **Data → Databases → AWS_INGEST_DB → ANALYTICS → Tasks → TASK_MERGE_ORDERS** → click **Resume** button (top right of the task detail panel); the button does the same as `ALTER TASK ... RESUME`. Repeat per task, same order as below (child before root).

```sql
ALTER TASK AWS_INGEST_DB.ANALYTICS.TASK_MERGE_ORDERS RESUME;  -- resume leaf tasks first if chained
ALTER TASK AWS_INGEST_DB.STAGING.TASK_LOAD_ORDERS RESUME;     -- then the root
```

## 7. Monitor

**Navigation:** left sidebar **Monitoring → Task History** for a visual, filterable view (filter by task name/state/time range at the top of the page) instead of writing SQL each time.

```sql
SELECT *
FROM TABLE(AWS_INGEST_DB.INFORMATION_SCHEMA.TASK_HISTORY(
  TASK_NAME => 'TASK_LOAD_ORDERS', RESULT_LIMIT => 20));

-- Alert on failures
SELECT * FROM TABLE(AWS_INGEST_DB.INFORMATION_SCHEMA.TASK_HISTORY())
WHERE STATE = 'FAILED' AND SCHEDULED_TIME > DATEADD(HOUR,-24,CURRENT_TIMESTAMP());
```

## 8. Best practices applied here

- **Stream + `WHEN STREAM_HAS_DATA`** — avoids paying for warehouse time when no new data arrived.
- **`APPEND_ONLY` stream** — cheaper than standard stream since landing is insert-only.
- **`MERGE`** — idempotent upsert; safe to reprocess without duplicating rows.
- **Explicit column mapping from `VARIANT`** — never `SELECT *` from raw JSON; cast and validate types explicitly.
- **DAG via `AFTER`** — keeps cleanse/merge steps decoupled and independently testable.
- **`TASK_HISTORY` monitoring query** — wire into an alert (e.g. Snowflake alerts, or external monitoring) rather than checking manually.
- Use a **separate, right-sized warehouse** per task if transform volume is heavy, to avoid queueing against ingestion.
