// Content data for the GCP Data Services module (BigQuery, GCS, Dataflow, Dataproc, Pub/Sub) + cross-cloud.
const MODULE_ID = "gcp";
const CONTENT = {

overview: {
  intro: {
    title: "The GCP data stack — BigQuery at the center, everything around it",
    desc: "GCP's data story is unusual: the warehouse (BigQuery) is so dominant that a lot of pipelines are just 'get data into BigQuery and transform with SQL.' Interviewers test whether you understand BigQuery's serverless model (no clusters, no dist keys, pay-per-byte-scanned), which service moves data (Dataflow, Pub/Sub, Datastream), and when you'd reach for Dataproc instead. This module goes service by service on the ones on most GCP-DE resumes, with the trade-offs, a cross-cloud tab, and interview Q&A."
  },
  cards: [
    {
      title: "The reference architecture — land in GCS or stream to Pub/Sub, converge in BigQuery",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "The canonical GCP flow: batch data lands in Cloud Storage (GCS, the lake) or is loaded straight into BigQuery; streaming events go to Pub/Sub → Dataflow → BigQuery; relational CDC comes via Datastream → BigQuery. Transformation is mostly SQL inside BigQuery (or Dataform/dbt over it), with Dataflow for complex streaming/transforms and Dataproc for existing Spark jobs. Orchestration is Cloud Composer (managed Airflow). Serving is BigQuery itself — BI (Looker) and ML (BigQuery ML / Vertex AI) read from it. The senior signal is naming which service owns which arrow, and recognizing that BigQuery is both the warehouse AND often the transform engine.",
      navLabel: "The distinction interviewers probe:",
      nav: "BigQuery collapses roles other clouds split. It's the warehouse, it queries the lake in place via external tables/BigLake, and it runs the transforms in SQL — so a GCP pipeline often has far fewer moving parts than the AWS/Azure equivalent. You reach OUT of BigQuery only when you need code-level transforms (Dataflow/Beam), an existing Spark/Hadoop job (Dataproc), or streaming logic SQL can't express. Knowing when NOT to leave BigQuery is the judgment they're after.",
      noteLabel: "Model answer:",
      note: "\"On GCP, BigQuery is the center of gravity — it's the warehouse, and it often does the transforms in SQL too.<br><br>Batch data lands in Cloud Storage or loads straight into BigQuery. Streaming goes Pub/Sub to Dataflow to BigQuery. Relational CDC comes through Datastream into BigQuery.<br><br>Transformation is mostly SQL in BigQuery, with Dataform or dbt managing it, and Cloud Composer orchestrating. Looker and BigQuery ML read from BigQuery to serve.<br><br>I only leave BigQuery for code-level transforms in Dataflow, an existing Spark job on Dataproc, or streaming logic SQL can't express. A GCP pipeline usually has fewer moving parts than the AWS or Azure equivalent because BigQuery absorbs so many roles.\"",
      followups: [
        "\"When would you NOT do the transform in BigQuery SQL?\"",
        "\"Draw the arrows: clickstream events need to reach a Looker dashboard. What runs?\"",
        "\"Why does a GCP pipeline often have fewer components than on AWS?\""
      ]
    },
    {
      title: "BigQuery vs Dataflow vs Dataproc vs Pub/Sub — the decision",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Anchor each to its job. BigQuery = serverless warehouse + SQL transform engine; default for storage, ELT, and BI. Dataflow = serverless Apache Beam, one engine for batch AND streaming, for code-level transforms, complex event-time/windowed streaming, and enrichment SQL can't do. Dataproc = managed Spark/Hadoop/Presto clusters; reach for it to lift-and-shift existing Spark jobs or when you need the OSS ecosystem and cluster control. Pub/Sub = the messaging backbone — decouples producers from consumers, buffers streams (the Kafka-analog), usually feeding Dataflow. The rule: SQL in BigQuery until you need code (Dataflow) or an existing Spark job (Dataproc); Pub/Sub is the pipe, not the processor.",
      noteLabel: "Model answer:",
      note: "\"I anchor each to its job.<br><br>BigQuery is the serverless warehouse and my default SQL transform engine.<br><br>Dataflow is serverless Beam — one engine for batch and streaming — for code-level transforms and complex event-time windowed streaming that SQL can't express.<br><br>Dataproc is managed Spark and Hadoop clusters, which I use to lift-and-shift existing Spark jobs or when I need the open-source ecosystem and cluster control.<br><br>Pub/Sub is the messaging backbone that decouples and buffers streams — the Kafka analog — usually feeding Dataflow.<br><br>So I stay in BigQuery SQL until I need code or an existing Spark job, and I remember Pub/Sub is the pipe, not the processor.\"",
      followups: [
        "\"You have a working PySpark job on-prem to migrate — Dataflow or Dataproc?\"",
        "\"Complex event-time windowing on a stream — which service?\"",
        "\"Is Pub/Sub a processing engine? What's its role?\""
      ]
    },
    {
      title: "How data GETS in — ingestion paths",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Match the path to the source. Batch files → land in GCS, then load into BigQuery (bq load / load jobs are free) or query in place as external tables. Streaming events → Pub/Sub buffers them, Dataflow processes and writes to BigQuery; or the BigQuery Storage Write API for direct streaming inserts. Relational CDC → Datastream replicates changes from MySQL/Postgres/Oracle to BigQuery or GCS continuously. Bulk/one-time transfers → Storage Transfer Service (from other clouds/on-prem) or the BigQuery Data Transfer Service (from SaaS sources). As always, land an immutable raw copy first (in GCS or a raw BigQuery dataset) so you can reprocess.",
      noteLabel: "Model answer:",
      note: "\"I match ingestion to the source and latency target.<br><br>Batch files land in GCS, then I either load them into BigQuery — load jobs are free — or query them in place as external tables.<br><br>Streaming goes through Pub/Sub to buffer, then Dataflow processes and writes to BigQuery, or I use the Storage Write API for direct streaming inserts.<br><br>Relational CDC comes through Datastream, which replicates changes from Postgres, MySQL, or Oracle into BigQuery continuously.<br><br>For bulk or one-time moves I use Storage Transfer Service or the BigQuery Data Transfer Service. And I always keep an immutable raw copy — in GCS or a raw dataset — so any downstream bug is a reprocess, not a re-fetch.\"",
      followups: [
        "\"Continuously replicate a Postgres table into BigQuery — which service?\"",
        "\"Streaming inserts vs batch load into BigQuery — cost and latency trade-off?\"",
        "\"Why is a BigQuery load job cheaper than streaming inserts?\""
      ]
    }
  ]
},

bigquery: {
  intro: {
    title: "BigQuery — the serverless warehouse (model, cost, partitioning, performance)",
    desc: "BigQuery is where the interview gets specific, because its serverless model breaks the instincts you built on Redshift/Snowflake — there are no clusters to size and no distribution keys to set. The questions center on how you're billed (bytes scanned or slots), how partitioning and clustering cut that bill, and the small set of levers that actually matter. This is the service you'll be pushed hardest on."
  },
  cards: [
    {
      title: "The serverless model — no clusters, no dist keys",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "BigQuery fully separates storage from compute and manages both for you — there's no cluster to provision, scale, or tune, and critically no DISTKEY/SORTKEY like Redshift or Synapse. Compute runs on 'slots' (units of parallelism) that BigQuery allocates automatically. You don't co-locate data on a join key; the engine (Dremel) shuffles as needed across a massive shared pool. So the tuning instinct transfers NOT AT ALL from Redshift — you optimize instead through partitioning, clustering, query shape, and not scanning columns you don't need. Recognizing that 'set the distribution key' has no meaning here is a common senior-signal moment.",
      noteLabel: "Model answer:",
      note: "\"BigQuery separates storage and compute and manages both — there's no cluster to size and, crucially, no distribution or sort keys like Redshift or Synapse.<br><br>Compute runs on slots, units of parallelism BigQuery allocates automatically, and the engine shuffles data as needed across a huge shared pool, so I don't co-locate tables on a join key.<br><br>That means my Redshift tuning instincts don't transfer. Instead I optimize through partitioning, clustering, query shape, and above all not scanning columns and rows I don't need.<br><br>The first thing I'd flag moving from Redshift is that 'set the DISTKEY' has no meaning in BigQuery.\"",
      followups: [
        "\"Moving from Redshift to BigQuery — which tuning stops applying?\"",
        "\"What is a slot?\"",
        "\"If you can't set a dist key, how do you make a big join fast?\""
      ]
    },
    {
      title: "Cost model — on-demand (bytes scanned) vs capacity (slots)",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "BigQuery has two pricing models and knowing both is essential. On-demand: you pay per BYTE SCANNED by a query (storage billed separately). This makes SELECT * over a big table expensive, rewards column pruning and partition filters, and means an unpartitioned full scan is the classic cost trap. Capacity (editions/reservations): you buy slot capacity (flat or autoscaling) for predictable, high-volume workloads — you pay for compute time, not bytes, so heavy steady usage gets cheaper and cost becomes predictable. The rule: on-demand for spiky/exploratory workloads, reservations when spend is high and steady. Either way, partitioning + clustering + avoiding SELECT * are the levers.",
      code: "-- On-demand bills bytes SCANNED. These two differ enormously:\nSELECT * FROM sales;                       -- scans every column, every row\nSELECT order_id, amount FROM sales         -- prunes columns\nWHERE  order_date = '2026-08-31';          -- + prunes partitions => tiny scan\n\n-- Estimate before running (dry run) to see bytes billed:\n-- bq query --dry_run --use_legacy_sql=false '...'",
      noteLabel: "Model answer:",
      note: "\"There are two models. On-demand bills per byte scanned, with storage billed separately. That makes SELECT * over a big table expensive and rewards column pruning and partition filters — an unpartitioned full scan is the classic cost trap.<br><br>Capacity pricing, through editions and reservations, buys slot capacity — flat or autoscaling — so I pay for compute time, not bytes. Heavy steady workloads get cheaper and the bill becomes predictable.<br><br>So I use on-demand for spiky, exploratory work and reservations when spend is high and steady.<br><br>Either way the levers are the same: partition, cluster, and never SELECT * on a wide table. I'll dry-run a query to see the bytes it'll bill before running it.\"",
      followups: [
        "\"A team's on-demand bill is spiking on one dashboard — what do you check?\"",
        "\"When do reservations/slots beat on-demand pricing?\"",
        "\"How do you find out what a query will cost before running it?\""
      ]
    },
    {
      title: "Partitioning & clustering — the two levers that cut the bill",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Partitioning splits a table physically by a column — usually a DATE/TIMESTAMP (or ingestion time), sometimes an integer range. A query that filters on the partition column reads only those partitions (partition pruning), so a date-filtered query scans one day, not the whole table — a direct cost cut on on-demand. Clustering sorts data within partitions by up to four columns; queries that filter or aggregate on the leading clustered columns read fewer blocks (block pruning). Rule of thumb: partition on the column you filter by date-wise, cluster on the high-cardinality columns you filter/join on next (customer_id, region). You can also set partition expiration to auto-drop old data. Together they're the single biggest cost and speed lever in BigQuery.",
      code: "CREATE TABLE sales (\n  order_id INT64, customer_id INT64, region STRING,\n  amount NUMERIC, order_date DATE)\nPARTITION BY order_date                 -- prune by date\nCLUSTER BY region, customer_id          -- prune blocks within a partition\nOPTIONS (partition_expiration_days = 1095);\n\n-- Now this scans ONE partition, and only region's blocks:\nSELECT SUM(amount) FROM sales\nWHERE order_date = '2026-08-31' AND region = 'west';",
      noteLabel: "Model answer:",
      note: "\"Partitioning and clustering are my two main levers.<br><br>Partitioning splits the table physically, usually by date, so a query filtering on that date reads only those partitions. On on-demand pricing that's a direct cost cut — a day's query scans a day, not the table.<br><br>Clustering sorts data within partitions by up to four columns, so filters or joins on the leading clustered columns read fewer blocks.<br><br>My rule is: partition on the date I filter by, cluster on the high-cardinality columns I filter or join on next, like customer or region. I'll also set partition expiration to age out old data automatically.<br><br>Together they're the biggest cost and performance lever BigQuery gives me.\"",
      followups: [
        "\"A date-partitioned table still scans everything — what's the likely bug?\" (not filtering on the partition column)",
        "\"Partitioning vs clustering — what does each prune?\"",
        "\"How many clustering columns, and does their order matter?\""
      ]
    },
    {
      title: "Nested & repeated data, and query anti-patterns",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "BigQuery natively supports nested and repeated fields (STRUCT and ARRAY), so you can store a denormalized, semi-structured shape — an order with an array of line-item structs — and query it with UNNEST instead of joining a separate table. This is idiomatic BigQuery: pre-joining into nested structures often beats a star-schema join because there's no dist key to make joins cheap. Common anti-patterns to avoid: SELECT * (scans all columns), not filtering the partition column, huge JOINs where a nested structure would do, overusing streaming inserts when a batch load is free, and running many tiny queries instead of batching. Also: BigQuery isn't for low-latency point lookups or high-frequency row updates — it's an analytical engine, not an OLTP store.",
      noteLabel: "Model answer:",
      note: "\"BigQuery natively supports nested and repeated fields — structs and arrays — so I can store an order with its line items as a nested array and query it with UNNEST instead of a separate join.<br><br>That's idiomatic here: because there's no distribution key to make joins cheap, pre-joining into a nested structure often beats a star-schema join.<br><br>The anti-patterns I avoid are SELECT *, forgetting to filter the partition column, giant joins where nesting would do, overusing streaming inserts when a batch load is free, and lots of tiny queries instead of batching.<br><br>And I remember BigQuery is analytical, not OLTP — I don't use it for low-latency point lookups or frequent row-level updates.\"",
      followups: [
        "\"Why might a nested/repeated design beat a star-schema join in BigQuery?\"",
        "\"When is BigQuery the wrong tool entirely?\"",
        "\"Name three query patterns that inflate an on-demand bill.\""
      ]
    }
  ]
},

ingestion: {
  intro: {
    title: "Ingestion & storage — GCS, Pub/Sub, Dataflow, Datastream",
    desc: "Before BigQuery can query it, the data has to arrive. This tab covers the lake (GCS), the streaming backbone (Pub/Sub), the processing pipe (Dataflow), and CDC (Datastream) — the paths that get batch and streaming data into the warehouse reliably and cheaply, plus the external-table option for querying the lake without loading it."
  },
  cards: [
    {
      title: "Cloud Storage (GCS) — the lake, and external tables",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "GCS is GCP's object store and the data lake — cheap, durable, the landing zone for raw files. Its storage classes (Standard → Nearline → Coldline → Archive) let you age data down by access frequency with lifecycle rules, same idea as S3/ADLS tiers. For analytics you have two choices: LOAD files into BigQuery native storage (best performance, load jobs are free), or leave them in GCS and query as external tables / BigLake tables (query-in-place, no copy, but slower and you don't get all native optimizations). BigLake adds fine-grained governance and lets BigQuery, Spark, and others share one governed copy in GCS. Rule: load hot, frequently-queried data into BigQuery; keep cold or rarely-queried data as external tables.",
      noteLabel: "Model answer:",
      note: "\"GCS is the object store and the lake — cheap, durable, where raw files land. Storage classes from Standard down to Archive let me age data by access frequency with lifecycle rules, the same idea as S3 or ADLS tiers.<br><br>For analytics I have two options. I load frequently-queried data into BigQuery native storage — best performance, and load jobs are free. Or I leave it in GCS and query it in place as external or BigLake tables — no copy, but slower and without all the native optimizations.<br><br>BigLake adds fine-grained governance and lets BigQuery and Spark share one governed copy.<br><br>So I load the hot data and keep cold or rarely-touched data as external tables.\"",
      followups: [
        "\"External table vs loading into BigQuery — when each?\"",
        "\"What does BigLake add over a plain external table?\"",
        "\"How do you age out cold data in GCS?\""
      ]
    },
    {
      title: "Pub/Sub — the streaming backbone",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Pub/Sub is GCP's fully-managed messaging service: publishers send messages to a topic, subscribers pull or get pushed from a subscription, and it decouples and buffers at massive scale — the role Kafka or Kinesis plays. It guarantees at-least-once delivery (so consumers must be idempotent) and doesn't guarantee ordering by default (you enable ordering keys if you need it). It's not a processor — you pair it with Dataflow to transform and land data, or use a Pub/Sub-to-BigQuery subscription for simple direct writes. Dead-letter topics catch messages that repeatedly fail. The DE judgment is treating it as the durable buffer between bursty producers and slower downstream processing.",
      noteLabel: "Model answer:",
      note: "\"Pub/Sub is the managed messaging backbone — publishers write to a topic, subscribers read from a subscription, and it decouples and buffers producers from consumers at scale. It's the role Kafka or Kinesis plays.<br><br>It's at-least-once, so my consumers have to be idempotent, and it doesn't guarantee ordering unless I set ordering keys.<br><br>It's not a processor. I pair it with Dataflow to transform and land the data, or use a direct Pub/Sub-to-BigQuery subscription for simple writes. Dead-letter topics catch messages that keep failing.<br><br>I treat it as the durable buffer between bursty producers and slower downstream processing, so a spike doesn't overwhelm the pipeline.\"",
      followups: [
        "\"Pub/Sub is at-least-once — what does that force on your consumer?\"",
        "\"How do you get ordered delivery when you need it?\"",
        "\"A downstream sink is slow and messages are piling up — is that a problem?\""
      ]
    },
    {
      title: "Dataflow (Apache Beam) — one engine, batch and streaming",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Dataflow is serverless Apache Beam — the same pipeline code runs in batch or streaming mode, with autoscaling and no cluster to manage. Its strength is stream processing done right: event-time windowing (fixed, sliding, session windows), watermarks to reason about late data, and triggers for when to emit results — the things plain SQL can't express. You use it for streaming ETL (Pub/Sub → transform/enrich → BigQuery), for complex batch transforms, and Google provides ready-made templates for common jobs (Pub/Sub to BigQuery, GCS to BigQuery). Reach for Dataflow when you need code-level logic or real streaming semantics; stay in BigQuery SQL when a query suffices.",
      noteLabel: "Model answer:",
      note: "\"Dataflow is serverless Apache Beam — the same pipeline code runs batch or streaming, it autoscales, and there's no cluster to manage.<br><br>Its real strength is streaming done properly: event-time windowing with fixed, sliding, and session windows, watermarks to handle late data, and triggers for when to emit — the semantics SQL can't express.<br><br>I use it for streaming ETL from Pub/Sub into BigQuery with enrichment, and for complex batch transforms. Google's templates cover common jobs like Pub/Sub to BigQuery out of the box.<br><br>So I reach for Dataflow when I need code-level logic or genuine streaming semantics, and I stay in BigQuery SQL when a query is enough.\"",
      followups: [
        "\"What can Dataflow express in streaming that BigQuery SQL can't?\"",
        "\"Event time vs processing time — why does the distinction matter?\"",
        "\"What are watermarks for?\""
      ]
    },
    {
      title: "Datastream — CDC into the warehouse",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Datastream is GCP's serverless change-data-capture service: it reads the transaction log of a source database (MySQL, PostgreSQL, Oracle, SQL Server) and continuously replicates inserts, updates, and deletes into BigQuery or GCS with low latency — no full reloads, minimal source impact. The common pattern is Datastream → BigQuery to keep an analytical replica of an operational database near-real-time, so analysts query fresh data without hammering the OLTP system. You typically land the change stream and then MERGE it into a clean target table (or use the managed BigQuery replication). It's the managed answer to 'how do I get operational data into BigQuery continuously without a nightly batch that misses changes.'",
      noteLabel: "Model answer:",
      note: "\"Datastream is serverless change-data-capture. It reads the source database's transaction log — MySQL, Postgres, Oracle, SQL Server — and continuously replicates inserts, updates, and deletes into BigQuery or GCS with low latency and minimal load on the source.<br><br>The common pattern is Datastream into BigQuery to keep a near-real-time analytical replica of an operational database, so analysts query fresh data without touching the OLTP system.<br><br>I land the change stream and MERGE it into a clean target, or use the managed replication.<br><br>It's the managed answer to getting operational data into BigQuery continuously, instead of a nightly batch that adds latency and can miss intermediate changes.\"",
      followups: [
        "\"Why is log-based CDC easier on the source than a query-based pull?\"",
        "\"How do you turn a raw change stream into a clean current-state table?\"",
        "\"Datastream vs a scheduled batch export — what do you gain?\""
      ]
    }
  ]
},

processing: {
  intro: {
    title: "Processing & orchestration — Dataproc, BigQuery ML, Dataform, Composer",
    desc: "Beyond BigQuery SQL and Dataflow, the panel checks you know when to use managed Spark (Dataproc), how transforms are managed as code (Dataform/dbt), how ML fits (BigQuery ML), and how it's all orchestrated (Cloud Composer). These are the judgment questions about running a real GCP data platform."
  },
  cards: [
    {
      title: "Dataproc — managed Spark/Hadoop when you need the OSS ecosystem",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Dataproc is GCP's managed Spark/Hadoop/Presto — you spin up a cluster (or use serverless Dataproc) to run Spark, Hive, or other OSS engines. You reach for it in two cases: lift-and-shift of existing Spark/Hadoop jobs you don't want to rewrite as Beam, and workloads that need the OSS ecosystem or libraries BigQuery/Dataflow don't cover. Cost control is the usual Spark story — ephemeral clusters that spin up per job and tear down, autoscaling, preemptible (Spot) VMs, and separating storage (in GCS) from the transient compute. The decision vs Dataflow: Dataflow is the GCP-native, serverless, no-ops choice for new pipelines; Dataproc is for existing Spark or when you specifically need Spark/Hadoop.",
      noteLabel: "Model answer:",
      note: "\"Dataproc is managed Spark, Hadoop, and Presto — I spin up a cluster, or use serverless Dataproc, to run OSS engines.<br><br>I reach for it in two cases: lifting and shifting existing Spark or Hadoop jobs I don't want to rewrite as Beam, and workloads that need OSS libraries Dataflow or BigQuery don't cover.<br><br>Cost control is the usual Spark story — ephemeral clusters that spin up per job and tear down, autoscaling, preemptible VMs, and keeping storage in GCS separate from transient compute.<br><br>Versus Dataflow: for a new pipeline I'd default to Dataflow because it's serverless and no-ops. I choose Dataproc when I already have Spark or specifically need it.\"",
      followups: [
        "\"You're migrating on-prem PySpark jobs to GCP — Dataproc or rewrite in Beam?\"",
        "\"How do you keep a Dataproc bill down?\"",
        "\"Dataflow vs Dataproc for a brand-new streaming pipeline?\""
      ]
    },
    {
      title: "Dataform / dbt & BigQuery ML — transforms and ML in SQL",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Transformation on GCP is mostly SQL, managed with software-engineering discipline. Dataform (now built into BigQuery) and dbt do the same job: define transforms as version-controlled SQL models with dependencies, tests, and documentation, executed in BigQuery — the ELT 'T' layer, giving you a tested DAG instead of ad-hoc scripts. BigQuery ML lets you train and run models with SQL (CREATE MODEL … then ML.PREDICT) — regression, classification, clustering, even calling out to Vertex AI — so a DE can serve predictions without moving data out of the warehouse. The theme: keep transforms and lightweight ML where the data already lives, in BigQuery, managed as code.",
      code: "-- BigQuery ML: train and predict in SQL, no data movement\nCREATE OR REPLACE MODEL sales.churn_model\nOPTIONS(model_type='logistic_reg', input_label_cols=['churned']) AS\nSELECT tenure, monthly_spend, region, churned FROM sales.customers;\n\nSELECT customer_id, predicted_churned\nFROM ML.PREDICT(MODEL sales.churn_model, TABLE sales.new_customers);",
      noteLabel: "Model answer:",
      note: "\"Transformation on GCP is mostly SQL, managed like code.<br><br>Dataform — now built into BigQuery — and dbt do the same thing: version-controlled SQL models with dependencies, tests, and docs, executed in BigQuery. That gives me a tested transformation DAG instead of ad-hoc scripts, the ELT T layer.<br><br>BigQuery ML lets me train and score models in SQL — CREATE MODEL then ML.PREDICT — for regression, classification, clustering, or calling Vertex AI, so I can serve predictions without moving data out of the warehouse.<br><br>The theme is keeping transforms and lightweight ML where the data already lives, managed as code.\"",
      followups: [
        "\"What does Dataform/dbt give you over a pile of SQL scripts?\"",
        "\"When would you use BigQuery ML vs a full Vertex AI pipeline?\"",
        "\"Why keep the transform in BigQuery rather than pulling data out?\""
      ]
    },
    {
      title: "Cloud Composer — managed Airflow for orchestration",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Cloud Composer is GCP's managed Apache Airflow — the orchestration layer that schedules and coordinates the whole pipeline: trigger a Datastream/load, run BigQuery transforms in order, kick off a Dataflow or Dataproc job, run data-quality checks, handle retries and dependencies, and alert on failure. Because it's Airflow, you author DAGs in Python with GCP-specific operators (BigQueryInsertJobOperator, DataflowTemplatedJobStartOperator, etc.). It's the same execution_date/idempotency/backfill discipline as any Airflow. Alternatives on GCP are Workflows (lighter, serverless, for simpler service-to-service orchestration) and Dataform's own scheduling for pure-SQL DAGs — but Composer is the standard for anything non-trivial.",
      noteLabel: "Model answer:",
      note: "\"Cloud Composer is managed Airflow — the orchestration layer over the whole pipeline.<br><br>It schedules and coordinates everything: trigger a load or Datastream, run BigQuery transforms in dependency order, kick off Dataflow or Dataproc jobs, run data-quality checks, and handle retries, dependencies, and failure alerts.<br><br>Since it's Airflow, I author DAGs in Python with GCP operators like BigQueryInsertJobOperator, and it's the same idempotency and backfill discipline as any Airflow.<br><br>For simpler service-to-service orchestration there's Workflows, and Dataform can schedule pure-SQL DAGs, but Composer is my default for anything non-trivial.\"",
      followups: [
        "\"When would you use Workflows instead of Composer?\"",
        "\"How does Composer trigger a BigQuery transform in the right order?\"",
        "\"What Airflow concepts carry straight over to Composer?\""
      ]
    }
  ]
},

crosscloud: {
  intro: {
    title: "Cross-cloud equivalents — mapping GCP to AWS & Azure",
    desc: "\"You did this on GCP — how would you do it on AWS?\" is a near-guaranteed follow-up. This tab lines the services up by role so you can translate on the fly, and — more importantly — flags where the analogy breaks, since BigQuery's serverless model is genuinely different from Redshift/Synapse."
  },
  cards: [
    {
      title: "The service-by-service mapping",
      badge: "fundamentals",
      conceptLabel: "The translation table:",
      concept: "Object storage / lake: GCS ≈ S3 ≈ ADLS Gen2. Warehouse: BigQuery ≈ Redshift ≈ Synapse dedicated pool (but BigQuery is serverless). Query-in-place over the lake: BigQuery external tables ≈ Athena ≈ Synapse serverless. Managed Spark: Dataproc ≈ EMR / Glue ≈ Azure Databricks / Synapse Spark. Serverless data processing: Dataflow (Beam) ≈ Glue / Kinesis Data Analytics ≈ ADF Data Flows (loosely). Streaming ingest: Pub/Sub ≈ Kinesis ≈ Event Hubs. CDC: Datastream ≈ DMS ≈ Azure Datastream/ADF. Orchestration: Cloud Composer ≈ MWAA (Airflow) ≈ ADF / Azure-managed Airflow. Secrets: Secret Manager ≈ Secrets Manager ≈ Key Vault. The point isn't memorizing names — it's one box per job in each cloud.",
      noteLabel: "Model answer:",
      note: "\"I translate by role, not brand.<br><br>The lake is GCS, S3, or ADLS. The warehouse is BigQuery, Redshift, or a Synapse dedicated pool — though BigQuery is serverless where the others aren't. Query-in-place is BigQuery external tables, Athena, or Synapse serverless.<br><br>Managed Spark is Dataproc, versus EMR or Glue, versus Databricks. Serverless processing is Dataflow, roughly Glue or Kinesis Analytics on AWS. Streaming ingest is Pub/Sub, Kinesis, or Event Hubs. CDC is Datastream or DMS.<br><br>Orchestration is Cloud Composer, which is just managed Airflow, like MWAA. Once I see it as one box per job, moving a design across clouds is mostly mechanical.\"",
      followups: [
        "\"You built a Pub/Sub + Dataflow + BigQuery pipeline — rebuild it on AWS.\"",
        "\"What's the AWS equivalent of Dataproc, and of Datastream?\"",
        "\"Which GCP service maps least cleanly to the other clouds?\""
      ]
    },
    {
      title: "Where the analogy breaks — BigQuery isn't Redshift",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The mapping gets you most of the way, but the seams are where you score. BigQuery is serverless with no dist/sort keys — so all the Redshift/Synapse 'set the distribution key, pick a sort key, size the cluster' tuning simply doesn't exist; you optimize via partitioning, clustering, and not scanning. Its on-demand pay-per-byte model rewards different behavior than a provisioned cluster (a full scan hits your wallet immediately, not just latency). Pub/Sub speaks its own model, not the Kafka protocol like Event Hubs does — no Kafka ecosystem drop-in. Dataflow (Beam) is a different programming model from Spark, so 'Dataproc ≈ EMR' is clean but 'Dataflow ≈ EMR' is not. Naming a seam like this is the senior signal on a cross-cloud question.",
      noteLabel: "Model answer:",
      note: "\"The mapping gets me most of the way, but I flag the seams.<br><br>The big one is that BigQuery is serverless with no distribution or sort keys, so the whole Redshift and Synapse tuning model — dist key, sort key, cluster sizing — just doesn't exist. I optimize with partitioning, clustering, and not scanning.<br><br>Its pay-per-byte model also rewards different behavior: a full scan hits the bill immediately, not just latency.<br><br>Pub/Sub uses its own model, not the Kafka protocol the way Event Hubs does, so it's not a Kafka drop-in. And Dataflow's Beam model is different from Spark, so Dataproc maps cleanly to EMR but Dataflow doesn't.<br><br>Calling out a seam like that is usually what the interviewer is fishing for.\"",
      followups: [
        "\"Moving Redshift logic to BigQuery — what tuning stops applying?\"",
        "\"Is Pub/Sub a drop-in for Kafka? Why not?\"",
        "\"Why isn't Dataflow just 'EMR on GCP'?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview Prep — GCP DE questions with model answers",
    desc: "The questions a GCP-focused DE screen actually asks, structured fundamentals → advanced. Each hides its model answer until you expand it, and ends with the follow-up cross-questions a real interviewer digs with. Practice by answering aloud first, then checking."
  },
  cards: [
    {
      title: "\"Walk me through an end-to-end pipeline you'd build on GCP.\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "Whether you center on BigQuery and name the right service per stage without over-building.",
      noteLabel: "Model answer:",
      note: "\"BigQuery is the center. Batch data lands in GCS and loads into BigQuery — load jobs are free — and I keep an immutable raw copy. Streaming goes Pub/Sub to Dataflow to BigQuery, and relational CDC comes through Datastream into BigQuery.<br><br>Transformation is mostly SQL in BigQuery, managed as version-controlled models with Dataform or dbt across raw, staging, and mart layers, with tests.<br><br>Cloud Composer orchestrates — loads, transforms in order, data-quality checks, retries, alerts. Looker and BigQuery ML read from the marts to serve.<br><br>I only leave BigQuery for code-level transforms in Dataflow or an existing Spark job on Dataproc. The design has few moving parts because BigQuery absorbs storage, transform, and serving.\"",
      followups: [
        "\"Which stages are batch vs streaming?\"",
        "\"Where would you leave BigQuery, and why?\"",
        "\"How do you keep the transforms tested and version-controlled?\""
      ]
    },
    {
      title: "\"A BigQuery bill is spiking. How do you bring it down?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "The on-demand cost model and the partition/cluster/scan levers — the most practical BigQuery skill.",
      noteLabel: "Model answer:",
      note: "\"On on-demand you pay per byte scanned, so I hunt for scans.<br><br>First, the tables: are the big ones partitioned by date and clustered on the columns queries filter by? If not, that's the fix, plus partition expiration to drop old data.<br><br>Second, the queries: I look for SELECT * on wide tables, queries not filtering the partition column, and giant joins where nesting would do. I dry-run to see bytes billed before running.<br><br>Third, the model: if spend is high and steady, I move that workload to slot reservations so I pay for predictable compute instead of bytes.<br><br>Materialized views or scheduled aggregates help if the same expensive query runs constantly.\"",
      followups: [
        "\"A date-partitioned table still scans fully — what's wrong?\"",
        "\"When do you switch from on-demand to reservations?\"",
        "\"How do you see a query's cost before you run it?\""
      ]
    },
    {
      title: "\"How is BigQuery different from Redshift or Snowflake?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Whether you understand the serverless model and that dist/sort tuning doesn't transfer.",
      noteLabel: "Model answer:",
      note: "\"The core difference is that BigQuery is fully serverless — no cluster to size and, crucially, no distribution or sort keys.<br><br>On Redshift I'd co-locate tables with a DISTKEY and set a SORTKEY. In BigQuery the engine shuffles across a shared slot pool automatically, so those levers don't exist. I optimize instead with partitioning, clustering, query shape, and not scanning.<br><br>Billing differs too: BigQuery's on-demand model charges per byte scanned, so a careless full scan hits cost immediately, where a provisioned cluster just gets slower.<br><br>Snowflake sits in between — serverless-feeling but with explicit virtual warehouses you size. So moving from Redshift, the first thing I drop is dist-key thinking.\"",
      followups: [
        "\"With no dist key, how do you make a big join fast?\"",
        "\"What replaces cluster sizing in BigQuery?\"",
        "\"How does Snowflake's model differ from BigQuery's?\""
      ]
    },
    {
      title: "\"Dataflow or Dataproc — how do you choose?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Judgment between GCP-native serverless Beam and managed Spark.",
      noteLabel: "Model answer:",
      note: "\"For a new pipeline I default to Dataflow — it's serverless Beam, no cluster to manage, one code path for batch and streaming, and it does real streaming semantics like event-time windowing and watermarks.<br><br>I choose Dataproc when I'm lifting and shifting existing Spark or Hadoop jobs I don't want to rewrite, or when I need an OSS library the managed options don't cover.<br><br>So it's really 'new and GCP-native' versus 'existing Spark or specific OSS need.' If someone hands me a working PySpark job to migrate quickly, Dataproc gets it running with the least change; if I'm building fresh streaming, Dataflow.\"",
      followups: [
        "\"Migrate an on-prem Spark job fast — which, and why?\"",
        "\"What streaming features push you to Dataflow?\"",
        "\"How do you control cost on each?\""
      ]
    },
    {
      title: "\"Continuously replicate an operational Postgres DB into BigQuery. How?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "CDC knowledge and turning a change stream into a clean analytical table.",
      noteLabel: "Model answer:",
      note: "\"I'd use Datastream for log-based CDC — it reads Postgres's write-ahead log and continuously streams inserts, updates, and deletes into BigQuery or GCS with low latency and minimal load on the source.<br><br>That lands a change stream. To get a clean current-state table I MERGE those changes into a target keyed on the primary key — applying updates and deletes — or use the managed BigQuery replication.<br><br>If I need history I'd keep it as SCD Type 2 in the target rather than overwriting.<br><br>The win over a nightly batch export is freshness and not missing intermediate changes, and analysts query the replica instead of hitting the production OLTP database.\"",
      followups: [
        "\"How do you apply deletes from the change stream?\"",
        "\"Where would SCD Type 2 fit in this?\"",
        "\"Why is this better than a scheduled full export?\""
      ]
    },
    {
      title: "\"When is BigQuery the WRONG tool?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Whether you know its boundaries — a senior candidate names them unprompted.",
      noteLabel: "Model answer:",
      note: "\"BigQuery is an analytical engine, not a transactional one, so I don't use it where OLTP behavior is needed.<br><br>It's wrong for low-latency point lookups — fetching a single row by key for an app — where a Bigtable, Firestore, or Cloud SQL fits. It's wrong for high-frequency row-level updates and deletes; it can do them but it's not built for constant mutation like an operational store.<br><br>It's also overkill for tiny datasets where a simple database is cheaper and simpler, and it's not a message queue — that's Pub/Sub.<br><br>So I match it to analytical scan-and-aggregate workloads and reach for Bigtable, Cloud SQL, Spanner, or Firestore when the access pattern is operational.\"",
      followups: [
        "\"An app needs single-row reads in a few milliseconds — what do you use?\"",
        "\"Why is constant row-level updating a poor fit for BigQuery?\"",
        "\"Which GCP database for a high-throughput OLTP workload?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What sits at the center of most GCP data architectures, often serving as warehouse AND transform engine?",
    options: [
      "Dataproc",
      "BigQuery — serverless warehouse that also runs the transforms in SQL",
      "Pub/Sub",
      "Cloud Composer"
    ],
    correct: 1
  },
  {
    q: "Moving from Redshift to BigQuery, which tuning technique STOPS applying?",
    options: [
      "Partitioning tables",
      "Setting DISTKEY/SORTKEY — BigQuery is serverless with no distribution or sort keys",
      "Avoiding SELECT *",
      "Clustering columns"
    ],
    correct: 1
  },
  {
    q: "On BigQuery's on-demand pricing, you are billed primarily for…",
    options: [
      "The number of rows returned",
      "The number of BYTES SCANNED by the query (storage billed separately)",
      "Cluster uptime",
      "The number of queries run"
    ],
    correct: 1
  },
  {
    q: "A date-partitioned BigQuery table still scans the whole table on every query. Most likely cause?",
    options: [
      "Partitioning is broken",
      "The queries don't filter on the partition column, so no partition pruning happens",
      "You need more slots",
      "The table needs a DISTKEY"
    ],
    correct: 1
  },
  {
    q: "What do partitioning and clustering respectively prune in BigQuery?",
    options: [
      "Both prune columns",
      "Partitioning prunes partitions (e.g. by date); clustering prunes blocks within partitions by the leading clustered columns",
      "Partitioning prunes rows; clustering prunes nothing",
      "Neither affects bytes scanned"
    ],
    correct: 1
  },
  {
    q: "Which service is GCP's streaming backbone (the Kafka/Kinesis analog), and what's its role?",
    options: [
      "Dataflow — it processes and stores streams",
      "Pub/Sub — a managed, at-least-once messaging buffer that decouples producers from consumers; it's the pipe, not the processor",
      "BigQuery — it ingests streams directly with no buffer",
      "Dataproc — it runs the streaming cluster"
    ],
    correct: 1
  },
  {
    q: "You have working on-prem PySpark jobs to migrate to GCP with minimal rewrite. Best choice?",
    options: [
      "Rewrite everything as Dataflow/Beam pipelines",
      "Dataproc — managed Spark, so existing Spark jobs run with the least change",
      "Load it all into BigQuery and use SQL",
      "Pub/Sub"
    ],
    correct: 1
  },
  {
    q: "Which service continuously replicates a source database's changes (CDC) into BigQuery?",
    options: [
      "Cloud Composer",
      "Datastream — log-based CDC from MySQL/Postgres/Oracle into BigQuery or GCS",
      "Pub/Sub",
      "Dataform"
    ],
    correct: 1
  },
  {
    q: "What is Cloud Composer?",
    options: [
      "A managed Spark cluster",
      "Managed Apache Airflow — orchestrates loads, transforms, and jobs with DAGs, retries, and dependencies",
      "A streaming message queue",
      "A BI dashboard tool"
    ],
    correct: 1
  },
  {
    q: "When is BigQuery the WRONG tool?",
    options: [
      "For analytical aggregation over large tables",
      "For low-latency single-row lookups or high-frequency row-level updates — that's OLTP work for Bigtable/Cloud SQL/Firestore",
      "For running SQL transforms",
      "For storing partitioned historical data"
    ],
    correct: 1
  }
];
