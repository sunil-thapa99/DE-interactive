# ETL Variant 3: External Orchestrator (Airflow / dbt)

Prerequisite: complete [00-ingestion-setup.md](00-ingestion-setup.md) first — this assumes `AWS_INGEST_DB.RAW.LANDING` is being populated by Snowpipe. Snowflake only holds the raw + target tables; all scheduling/transform logic lives externally.

## 1. Concept

Snowpipe still handles ingestion (near real-time, event-driven). Instead of Snowflake Tasks/Dynamic Tables, an external orchestrator (Airflow, dbt Cloud, dbt+Airflow) triggers the transformation SQL on its own schedule/DAG and writes into internal tables. Best when transform logic needs to integrate with non-Snowflake systems, existing dbt projects, or centralized company-wide orchestration.

## 2. dbt project structure

**Navigation:** In your terminal (not Snowsight): run `dbt init aws_ingest_pipeline` to scaffold this layout, or create the files/folders manually in your code editor under a new `aws_ingest_pipeline/` project directory.

```
models/
  staging/
    stg_orders.sql
  marts/
    orders.sql
sources.yml
dbt_project.yml
profiles.yml
```

### 2.1 `sources.yml` — declare the Snowpipe-fed raw table

**Navigation:** Create this file at the project root (or `models/sources.yml`) in your editor — no Snowsight/AWS UI involved for this step.

```yaml
version: 2
sources:
  - name: raw
    database: AWS_INGEST_DB
    schema: RAW
    tables:
      - name: LANDING
        loaded_at_field: LOAD_TS
        freshness:
          warn_after: { count: 15, period: minute }
          error_after: { count: 60, period: minute }
```

### 2.2 `models/staging/stg_orders.sql` — incremental cleanse

**Navigation:** Create/edit in your editor under `models/staging/`. To test locally before scheduling: terminal → `dbt run --select stg_orders` from the project root.

```sql
{{ config(materialized='incremental', unique_key='order_id') }}

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
{% endif %}
```

### 2.3 `models/marts/orders.sql` — curated internal table

**Navigation:** Create/edit in your editor under `models/marts/`. To verify the resulting table landed in Snowflake: Snowsight → left sidebar **Data → Databases → AWS_INGEST_DB → ANALYTICS → Tables → ORDERS**.

```sql
{{ config(materialized='incremental', unique_key='order_id') }}

SELECT * FROM {{ ref('stg_orders') }}
{% if is_incremental() %}
  WHERE order_ts > (SELECT MAX(order_ts) FROM {{ this }})
{% endif %}
```

### 2.4 `profiles.yml` — connection (key-pair auth, not password)

**Navigation:** Generate the key pair first — terminal: `openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out dbt_rsa_key.p8 -nocrypt` then `openssl rsa -in dbt_rsa_key.p8 -pubout -out dbt_rsa_key.pub`. Register the public key on the service user: Snowsight → switch role to `ACCOUNTADMIN` → **Worksheets** → run `ALTER USER DBT_SERVICE_USER SET RSA_PUBLIC_KEY='<contents of dbt_rsa_key.pub, header/footer stripped>';`. Place `profiles.yml` in `~/.dbt/` (default dbt lookup path) or point to it via `--profiles-dir`.

```yaml
aws_ingest_pipeline:
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
      private_key_path: /secrets/dbt_rsa_key.p8   # key-pair auth, not a password
      threads: 4
```

## 3. Airflow DAG (triggers dbt run on schedule)

**Navigation:** Save this file as `dags/aws_ingest_dbt_pipeline.py` in your Airflow `dags/` folder (or the path configured in `airflow.cfg` / your Airflow deployment's DAG bag). Once picked up, open the **Airflow UI** → **DAGs** page (top nav) → find `aws_ingest_dbt_pipeline` → toggle it **On** (switch on the left of the DAG row) → click the DAG name → **Graph** tab to watch runs, or **Trigger DAG** (▶ button, top right) to run manually.

```python
from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from datetime import datetime, timedelta

default_args = {
    "owner": "data-eng",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

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
        cmds=["dbt"],
        arguments=["run", "--select", "stg_orders+", "--profiles-dir", "/secrets"],
        secrets=[...],   # mount private key + profiles.yml via Airflow Secrets/K8s secret
        name="dbt-run-aws-ingest",
        is_delete_operator_pod=True,
        get_logs=True,
    )

    dbt_test = KubernetesPodOperator(
        task_id="dbt_test",
        image="ghcr.io/dbt-labs/dbt-snowflake:1.8.0",
        cmds=["dbt"],
        arguments=["test", "--select", "stg_orders+"],
        secrets=[...],
        name="dbt-test-aws-ingest",
        is_delete_operator_pod=True,
        get_logs=True,
    )

    run_dbt >> dbt_test
```

## 4. dbt tests (data quality gate before promoting to curated)

**Navigation:** Create/edit `models/marts/schema.yml` in your editor. To run tests manually: terminal → `dbt test --select orders`. In the Airflow UI, test failures appear on the DAG's **Graph**/**Grid** view as a red `dbt_test` task box → click it → **Logs** tab for the failure detail.

```yaml
# models/marts/schema.yml
version: 2
models:
  - name: orders
    columns:
      - name: order_id
        tests: [unique, not_null]
      - name: order_amount
        tests:
          - dbt_utils.accepted_range: { min_value: 0 }
```

## 5. Best practices applied here

- **Key-pair authentication for the service user**, not username/password — rotate keys periodically, store the private key in a secrets manager (Airflow Secrets Backend / Vault / AWS Secrets Manager), never in the repo.
- **`INGEST_ETL_ROLE`** reused from the shared setup — the dbt/Airflow service user gets only this role, not broader access.
- **Incremental models with `unique_key`** — avoids full-table rescans on every run.
- **Source freshness checks (`sources.yml`)** — fail the DAG loudly if Snowpipe stops delivering, rather than silently running on stale data.
- **dbt tests as a quality gate** — `dbt_run >> dbt_test` blocks bad data from being treated as "done"; wire dbt test failures to Airflow alerting (email/Slack via Airflow callbacks).
- **`max_active_runs=1`** — prevents overlapping runs from racing on the same incremental table.
- **Retries with backoff** on the Airflow task — transient warehouse/network errors don't require manual re-triggering.
- Keep transform SQL in **version-controlled dbt models**, not ad hoc scripts — gives you lineage (`dbt docs generate`), diffable history, and CI integration.
