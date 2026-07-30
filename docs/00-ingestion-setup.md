# Snowflake Ingestion Setup — S3 Source (Shared Foundation)

This file sets up the **common ingestion layer** used by all three ETL variants:
- [01-tasks-streams.md](01-tasks-streams.md)
- [02-dynamic-tables.md](02-dynamic-tables.md)
- [03-external-orchestrator.md](03-external-orchestrator.md)

Do this setup once, then follow whichever ETL file matches your chosen engine.

---

## 1. Architecture

```
S3 bucket (source files)
   │  (event notification: s3:ObjectCreated)
   ▼
SQS queue (auto-created by Snowflake)
   ▼
Snowpipe (auto-ingest) ──► RAW.LANDING table (variant/staged columns)
                                  │
                          [ETL engine — see 01/02/03]
                                  ▼
                          internal target tables (curated schema)
```

## 2. Prerequisites

- Snowflake account with `ACCOUNTADMIN` (one-time setup) and a dedicated role for ongoing ops.
- AWS account with permission to create IAM roles/policies and S3 bucket event notifications.
- Decide naming: this guide uses `RAW` (landing), `STAGING` (cleansed), `ANALYTICS` (curated/internal) schemas.

## 3. Snowflake: create dedicated role, warehouse, database

**Navigation:** Snowsight → left sidebar **Worksheets** → **+ Worksheet** (top right) → paste SQL below → select `ACCOUNTADMIN` role from the role dropdown (top right, next to your username) → run with **Ctrl+Enter** (or the ▶ Run button, per statement or "Run All").

```sql
-- Run as ACCOUNTADMIN
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

-- Assign role to the service/ETL user, not to individual humans
GRANT ROLE INGEST_ETL_ROLE TO USER <ETL_SERVICE_USER>;
```

## 4. Security: IAM role with External ID (no static keys)

**Best practice: never use long-lived AWS access keys.** Use an IAM role trust relationship scoped by Snowflake's external ID.

### 4.1 Create a placeholder storage integration first (to get the IAM user ARN + external ID)

**Navigation:** Same Snowsight worksheet, role switched to `ACCOUNTADMIN` (role dropdown, top right). After running `DESC INTEGRATION`, read the two values from the **Results** grid at the bottom of the worksheet — scroll the `property` column to `STORAGE_AWS_IAM_USER_ARN` and `STORAGE_AWS_EXTERNAL_ID`.

```sql
USE ROLE ACCOUNTADMIN;

CREATE STORAGE INTEGRATION S3_INGEST_INT
  TYPE = EXTERNAL_STAGE
  STORAGE_PROVIDER = 'S3'
  ENABLED = TRUE
  STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::<AWS_ACCOUNT_ID>:role/snowflake-ingest-role'
  STORAGE_ALLOWED_LOCATIONS = ('s3://<your-bucket>/<prefix>/');

DESC INTEGRATION S3_INGEST_INT;
-- Note down: STORAGE_AWS_IAM_USER_ARN and STORAGE_AWS_EXTERNAL_ID
```

### 4.2 AWS: create IAM policy (least privilege — read-only on the ingest prefix)

**Navigation:** AWS Console → search bar → **IAM** → left sidebar **Policies** → **Create policy** (top right) → tab **JSON** → paste below → **Next** → name it (e.g. `snowflake-ingest-s3-readonly`) → **Create policy**.

```json
{
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
}
```

### 4.3 AWS: create IAM role trust policy (uses values from step 4.1)

**Navigation:** AWS Console → **IAM** → left sidebar **Roles** → **Create role** (top right) → trust entity type **Custom trust policy** → paste the JSON below into the editor → **Next** → on the permissions page, check the policy created in 4.2 (`snowflake-ingest-s3-readonly`) → **Next** → name the role `snowflake-ingest-role` → **Create role**. After creation, open the role → **Trust relationships** tab → **Edit trust policy** if you need to fix the external ID later.

```json
{
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
}
```

Attach the policy from 4.2 to this role, and use its ARN to update the storage integration if it changed:

```sql
ALTER STORAGE INTEGRATION S3_INGEST_INT
  SET STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::<AWS_ACCOUNT_ID>:role/snowflake-ingest-role';
```

## 5. Create file format, external stage, and RAW landing table

**Navigation:** Snowsight → **Worksheets** → switch role dropdown (top right) to `INGEST_ETL_ROLE` → select warehouse `INGEST_WH` from the warehouse dropdown next to the role selector → run below. To browse the created objects afterward: left sidebar **Data → Databases → AWS_INGEST_DB → RAW**.

```sql
USE ROLE INGEST_ETL_ROLE;
USE WAREHOUSE INGEST_WH;

CREATE FILE FORMAT AWS_INGEST_DB.RAW.FF_JSON
  TYPE = 'JSON'
  STRIP_OUTER_ARRAY = TRUE;

CREATE STAGE AWS_INGEST_DB.RAW.S3_INGEST_STAGE
  URL = 's3://<your-bucket>/<prefix>/'
  STORAGE_INTEGRATION = S3_INGEST_INT
  FILE_FORMAT = AWS_INGEST_DB.RAW.FF_JSON;

-- Landing table: raw variant + ingestion metadata for lineage/debugging
CREATE TABLE IF NOT EXISTS AWS_INGEST_DB.RAW.LANDING (
  RAW_DATA        VARIANT,
  SRC_FILE_NAME   STRING DEFAULT METADATA$FILENAME,
  SRC_FILE_ROW    NUMBER DEFAULT METADATA$FILE_ROW_NUMBER,
  LOAD_TS         TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

## 6. Create Snowpipe (auto-ingest via S3 event notification)

**Navigation:** Same Snowsight worksheet/role. After `SHOW PIPES`, click the result row and scroll the results grid right (or widen the `notification_channel` column) to copy the SQS ARN — alternatively left sidebar **Data → Databases → AWS_INGEST_DB → RAW → Pipes → S3_INGEST_PIPE** shows pipe details in the object browser panel.

```sql
CREATE PIPE AWS_INGEST_DB.RAW.S3_INGEST_PIPE
  AUTO_INGEST = TRUE
AS
COPY INTO AWS_INGEST_DB.RAW.LANDING (RAW_DATA)
  FROM @AWS_INGEST_DB.RAW.S3_INGEST_STAGE
  FILE_FORMAT = (FORMAT_NAME = AWS_INGEST_DB.RAW.FF_JSON)
  ON_ERROR = 'CONTINUE';

SHOW PIPES LIKE 'S3_INGEST_PIPE';
-- Note the "notification_channel" (SQS ARN) column from the output
```

## 7. AWS: wire S3 event notification to the Snowpipe SQS queue

**Navigation (step by step):**
1. AWS Console → search bar → **S3** → click your bucket name.
2. Tab **Properties** (top, next to Objects/Permissions/Metrics) → scroll down to **Event notifications** → **Create event notification**.
3. **General configuration**: name it (e.g. `snowpipe-ingest-trigger`) → **Prefix**: `<prefix>/`.
4. **Event types**: check **All object create events** (or specifically `s3:ObjectCreated:Put`/`Post`/`CompleteMultipartUpload`).
5. **Destination**: select **SQS queue** → choose **Enter SQS queue ARN** → paste the `notification_channel` ARN copied in step 6 → **Save changes**.
6. Verify: back in Snowsight, run `SELECT SYSTEM$PIPE_STATUS(...)` (step 8) after dropping a test file — if events aren't arriving, go to AWS Console → **SQS** → open the queue → tab **Access policy** to confirm the bucket is allowed to publish (Snowflake sets this automatically, but a manually recreated queue can lose it).

## 8. Validate

**Navigation:** Upload a test file via AWS Console → **S3** → your bucket → **Objects** tab → **Upload** → drag file into `<prefix>/` → **Upload**. Then back in Snowsight, same worksheet/role, run below. To browse landed rows visually: left sidebar **Data → Databases → AWS_INGEST_DB → RAW → Tables → LANDING** → **Data Preview** tab.

```sql
-- Drop a test file in s3://<your-bucket>/<prefix>/ then check:
SELECT SYSTEM$PIPE_STATUS('AWS_INGEST_DB.RAW.S3_INGEST_PIPE');
SELECT * FROM AWS_INGEST_DB.RAW.LANDING ORDER BY LOAD_TS DESC LIMIT 10;

-- Copy history / error diagnostics
SELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(
  TABLE_NAME=>'AWS_INGEST_DB.RAW.LANDING', START_TIME=>DATEADD(HOURS,-1,CURRENT_TIMESTAMP())));
```

## 9. Best practices applied here

- **No static AWS keys** — storage integration + IAM role + external ID.
- **Least privilege** — IAM policy scoped to `GetObject`/`ListBucket` on the ingest prefix only.
- **Dedicated warehouse** — isolates ingestion/ETL compute cost from BI/reporting.
- **Auto-suspend/auto-resume** — avoids idle credit burn.
- **Lineage columns** (`SRC_FILE_NAME`, `SRC_FILE_ROW`, `LOAD_TS`) — required for debugging and replay.
- **`ON_ERROR = 'CONTINUE'`** — bad rows don't halt the pipe; pair with regular `COPY_HISTORY` monitoring or a dead-letter table.
- **RBAC** — access granted to a role, never directly to a user.

Next: pick one of the ETL engine files (01/02/03) to build the transform from `RAW.LANDING` into curated internal tables.
