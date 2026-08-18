// Content data for the AWS Data Services module (S3, Glue, EMR, Lambda, Redshift) + cross-cloud.
const MODULE_ID = "aws";
const CONTENT = {

overview: {
  intro: {
    title: "The AWS data stack — how the pieces fit, and what each is FOR",
    desc: "A DE isn't asked to recite AWS service names — they're asked which service does which job and why, and where the boundaries are (Glue vs EMR, Redshift vs Athena, Lambda vs a real job). This module maps the reference lake-house architecture, then goes service by service on the ones on most DE resumes: S3, Glue, EMR, Lambda, Redshift — with the trade-offs and the interview Q&A, plus a cross-cloud tab (Azure Data Factory, BigQuery) since 'compare to what you'd do on GCP/Azure' is a standard follow-up."
  },
  cards: [
    {
      title: "The reference architecture — S3 at the center, everything else around it",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "On AWS the data lake IS S3 — every other service reads from or writes to it. The canonical flow: raw data lands in S3 (from Lambda/Kinesis/Firehose, DMS, or a batch drop) → a catalog (Glue Data Catalog) describes it → compute transforms it (Glue ETL or EMR/Spark for heavy jobs) → curated data is queried in place (Athena, Redshift Spectrum) or loaded into a warehouse (Redshift) → BI/ML consume it. The medallion pattern (raw/bronze → cleaned/silver → curated/gold) is just prefixes in S3 with a Glue table over each layer. Naming which service owns which arrow is the senior signal.",
      navLabel: "The distinction interviewers probe:",
      nav: "Storage is decoupled from compute — that's the whole point. S3 holds the data durably and cheaply; compute (Glue, EMR, Athena, Redshift) is spun up against it and torn down. This is why you can run Athena, a Glue job, and Redshift Spectrum over the SAME S3 files without copying them, and why you pay for compute and storage separately. Contrast with an on-prem Hadoop cluster where storage and compute are welded to the same nodes.",
      noteLabel: "Model answer:",
      note: "\"S3 is the lake and the single source of truth. Everything else is just compute I bring to the data.<br><br>Raw data lands in S3. The Glue Catalog makes it queryable. Glue or EMR transforms it across the bronze, silver, and gold prefixes.<br><br>From there I either query it in place with Athena or Spectrum, or I load curated marts into Redshift for BI.<br><br>The key property is that storage and compute are separate. Same files, many engines, and you pay for each one on its own. That's exactly what you lose on a coupled Hadoop cluster.\"",
      followups: [
        "\"Where would you NOT put the data lake — why S3 and not EBS or a database?\"",
        "\"Same S3 dataset queried by Athena AND loaded to Redshift — is that duplication a smell or fine?\"",
        "\"Draw the arrows: a CSV lands in S3 hourly and analysts need it in a dashboard. What runs?\""
      ]
    },
    {
      title: "Glue vs EMR vs Redshift vs Athena — the four-way decision",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "These overlap enough to confuse, so anchor each to its job. Athena = serverless SQL over S3, pay-per-query-scanned, ad-hoc and light ELT, zero infra. Glue = serverless Spark for ETL + the metadata catalog everything shares; great for scheduled transforms without managing a cluster. EMR = you manage a real Spark/Hadoop/Presto cluster; reach for it when you need cluster control, non-Spark frameworks, heavy long-running jobs, or the lowest cost at large steady scale. Redshift = a managed columnar MPP warehouse for fast, repeated BI queries on curated data with joins and concurrency. The rule: serverless (Athena/Glue) until scale or control forces you to EMR; query-in-place (Athena/Spectrum) until BI concurrency forces you to load Redshift.",
      noteLabel: "Model answer:",
      note: "\"I anchor each service to its job.<br><br>Athena is for ad-hoc SQL and light ELT over the lake. No infra, and you pay per scan.<br><br>Glue is for scheduled Spark ETL and the shared catalog, without babysitting a cluster.<br><br>EMR is for when I need cluster control, a non-Spark engine, or the best price on large steady workloads. It's cheaper than Glue at high, constant utilization, but you own the ops.<br><br>Redshift is for when BI needs fast, concurrent, repeated queries on curated marts.<br><br>I default to serverless and only move to EMR or Redshift when scale, control, or concurrency demands it. The trade is always convenience versus cost-at-scale and control.\"",
      followups: [
        "\"You run the same 6-hour Spark job nightly. Glue or EMR — and what tips the decision?\"",
        "\"Analysts run 200 concurrent dashboard queries. Athena over S3 or load Redshift? Why?\"",
        "\"When is Athena's pay-per-scan model a trap?\""
      ]
    },
    {
      title: "How data GETS into the lake — ingestion paths",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The ingestion path depends on the source shape. Batch file drops → land straight in S3 (SFTP/Transfer Family, partner drop, or a scheduled pull). Database CDC → DMS (Database Migration Service) streams inserts/updates from an RDBMS to S3. Streaming events → Kinesis Data Streams / Firehose, with Firehose buffering and writing batched files to S3 (and optionally to Redshift). Event-driven glue between steps → Lambda triggered by an S3 put or an EventBridge schedule. The DE judgment is matching the tool to latency and volume, and always landing an immutable raw copy first so you can reprocess.",
      noteLabel: "Model answer:",
      note: "\"I match ingestion to the source and the latency target.<br><br>Batch files land directly in S3. Relational CDC comes in through DMS to S3. Streaming goes through Kinesis or Firehose, which buffers and writes batched objects, so I'm not creating millions of tiny files.<br><br>Lambda or EventBridge wires the steps together.<br><br>One thing is non-negotiable: I land an immutable raw copy in S3 first, partitioned by ingest date. That way any downstream bug is fixable by reprocessing, instead of re-fetching from the source.\"",
      followups: [
        "\"Streaming clickstream at 50k events/sec — what lands it in S3 without a small-files problem?\"",
        "\"Replicate a Postgres table's changes into the lake continuously. Which service?\"",
        "\"Why land raw before transforming — what does it buy you?\""
      ]
    }
  ]
},

s3: {
  intro: {
    title: "S3 — the lake foundation (layout, formats, cost, performance)",
    desc: "Everything sits on S3, so the questions get specific: how you lay out prefixes, why partitioning and columnar formats cut cost and time, storage classes and lifecycle, and the consistency/performance model. This is the service you'll be pushed hardest on because a bad lake layout poisons every engine above it."
  },
  cards: [
    {
      title: "Prefix layout & partitioning — the decision that governs cost",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "How you name S3 keys IS your query performance, because Athena/Spark/Spectrum prune by prefix. Partition on the columns you filter by most — usually date, sometimes a high-cardinality-but-common filter like region. Hive-style partitioning (col=value in the path) lets engines auto-discover partitions. The catch: too few partitions and every query scans everything; too many (e.g. partition by user_id) and you get millions of tiny files and catalog bloat. Partition by what you filter on, at a grain that keeps files in the 128MB–1GB range.",
      code: "# GOOD: hive-style, date-partitioned, filterable\ns3://lake/silver/claims/ingest_date=2026-08-13/region=us-east/part-0001.parquet\n\n# Athena prunes to just that date — scans one partition, not the table:\nSELECT provider_id, SUM(amount)\nFROM   silver.claims\nWHERE  ingest_date = '2026-08-13'   -- partition column => partition pruning\nGROUP  BY provider_id;\n\n# BAD: partition by claim_id => millions of dirs, tiny files, slow catalog\n# s3://lake/claims/claim_id=CLM-000001/...",
      noteLabel: "Model answer:",
      note: "\"Partitioning is the single biggest lever on lake cost, because the engines skip whole prefixes.<br><br>I partition on what queries filter by. That's almost always date, and occasionally a coarse dimension like region. I use Hive-style col=value paths so partitions auto-register.<br><br>I avoid partitioning on high-cardinality keys, because that explodes into tiny files and a bloated catalog.<br><br>My target file size is 128MB to 1GB. If a partition is producing many small files, I compact them. Thousands of tiny objects kill Spark and Athena on task overhead.\"",
      followups: [
        "\"A table is partitioned by date but queries are still slow and scan a lot. What do you check?\"",
        "\"Why is partitioning by a high-cardinality column (user_id) usually a mistake?\"",
        "\"What file size do you aim for and why does 'too small' hurt as much as 'too big'?\""
      ]
    },
    {
      title: "File formats — why Parquet, and when not",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Columnar formats (Parquet, ORC) beat row formats (CSV, JSON) on analytics for three compounding reasons: column pruning (read only the columns you SELECT), better compression (like values sit together), and predicate pushdown via row-group stats (skip chunks that can't match). On S3 where you pay per byte scanned, this is a direct cost cut — often 10x+ vs CSV. Use row formats (JSON/CSV) only at the raw landing edge or for tiny lookup files. Avro is row-based but shines for streaming/serialization and schema evolution — common as the Kafka/ingest wire format before you rewrite to Parquet.",
      code: "# Athena cost demo — same query, different format:\n# CSV:     scans 40 GB  -> $0.20  (pay per byte scanned)\n# Parquet: scans  3 GB  -> $0.015 (column pruning + compression)\n#\n# Rewrite raw JSON/CSV to partitioned Parquet in a Glue/Spark job:\ndf.write.mode(\"overwrite\") \\\n  .partitionBy(\"ingest_date\") \\\n  .parquet(\"s3://lake/silver/claims/\")",
      noteLabel: "Model answer:",
      note: "\"For anything queried analytically, I store Parquet.<br><br>Column pruning means a SELECT of 3 columns doesn't read the other 50. Compression is far better than CSV. And row-group min and max stats let the engine skip chunks. On Athena that's a direct dollar saving, because you pay per byte scanned.<br><br>I keep raw landings in their native JSON or CSV for fidelity, then rewrite to partitioned Parquet in the bronze-to-silver step.<br><br>Avro I reach for on the streaming and serialization side, and where schema evolution matters. Then I convert it to Parquet at rest.\"",
      followups: [
        "\"Athena bill is high on a CSV-backed table. First change you make?\"",
        "\"Parquet vs Avro — when does each win?\"",
        "\"How does Parquet let an engine skip data it doesn't need to read?\""
      ]
    },
    {
      title: "Storage classes & lifecycle — paying for cold data correctly",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "S3 Standard is for hot data; you shouldn't pay Standard rates for raw files nobody's queried in 90 days. Lifecycle rules transition objects by age: Standard → Standard-IA (infrequent access, cheaper storage/higher retrieval) → Glacier/Deep Archive (cheapest storage, minutes-to-hours retrieval) → expire/delete. Intelligent-Tiering does this automatically based on access patterns when you can't predict them. For a DE, the raw/bronze layer is the classic target: keep 30–90 days hot for reprocessing, then archive. The trap is archiving data you still reprocess — Glacier retrieval latency and fees will bite.",
      code: "// Lifecycle rule: raw layer -> IA at 30d, Glacier at 90d, expire at 7y\n{\n  \"Rules\": [{\n    \"Filter\": { \"Prefix\": \"raw/\" },\n    \"Transitions\": [\n      { \"Days\": 30, \"StorageClass\": \"STANDARD_IA\" },\n      { \"Days\": 90, \"StorageClass\": \"GLACIER\" }\n    ],\n    \"Expiration\": { \"Days\": 2555 }\n  }]\n}",
      noteLabel: "Model answer:",
      note: "\"I don't keep cold data on Standard.<br><br>Lifecycle rules age raw and bronze objects to Standard-IA, then to Glacier, and expire them past the retention window. For compliance-bound data like claims, I set expiration to the required retention, not 'forever'.<br><br>I use Intelligent-Tiering when access is unpredictable.<br><br>The one mistake I avoid is archiving anything I still routinely reprocess. Glacier's retrieval latency and per-request fees make a nightly job that touches archived data slow and expensive.\"",
      followups: [
        "\"Raw claims data must be kept 7 years but is rarely read after 60 days. Design the lifecycle.\"",
        "\"When is Intelligent-Tiering better than explicit lifecycle transitions?\"",
        "\"What breaks if you Glacier-archive data a nightly job still reads?\""
      ]
    },
    {
      title: "Consistency, performance & the small-files problem",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "S3 now gives strong read-after-write consistency for new objects and overwrites — the old 'eventual consistency' caveats and workarounds (EMRFS consistent view) are gone; don't cite them. Performance scales with prefix: S3 handles 3,500 writes and 5,500 reads per second PER PREFIX, so spreading keys across prefixes (which good partitioning already does) removes throughput ceilings. The real day-to-day performance killer isn't S3 itself — it's the small-files problem: a job that writes thousands of tiny objects makes the NEXT reader pay huge per-file open overhead. Fix with compaction, coalesce/repartition before write, or table formats (Iceberg/Delta/Hudi) that manage file sizes and give ACID + time travel over S3.",
      noteLabel: "Model answer:",
      note: "\"S3 is strongly consistent now for puts and overwrites, so I don't design around eventual consistency anymore.<br><br>Throughput scales per prefix, and sane date or region partitioning already spreads keys enough.<br><br>The problem I actually engineer against is small files. A Spark job with 800 output tasks writes 800 tiny files per partition, and every downstream reader pays the open cost.<br><br>So I coalesce or repartition before writing to hit roughly 128MB to 1GB files, and I run compaction on chatty streaming sinks. And where I need ACID, upserts, and file management for free, I use a table format like Iceberg or Delta over S3.\"",
      followups: [
        "\"An interviewer says 'S3 is eventually consistent so...' — what's your correction?\"",
        "\"A streaming job created 2 million 5KB files. What's the impact and the fix?\"",
        "\"What do Iceberg/Delta/Hudi add on top of plain Parquet-on-S3?\""
      ]
    }
  ]
},

glue: {
  intro: {
    title: "AWS Glue — serverless ETL + the catalog everyone shares",
    desc: "Glue is two things people conflate: the Data Catalog (the metastore Athena, Redshift Spectrum, and EMR all read) and Glue ETL (serverless Spark jobs). Interviewers probe whether you know crawlers vs jobs, DynamicFrames vs DataFrames, job bookmarks for incrementality, and when Glue is the wrong tool."
  },
  cards: [
    {
      title: "The Glue Data Catalog & crawlers — the shared metastore",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The Glue Data Catalog is a Hive-compatible metastore: databases, tables, schemas, and partition locations pointing at S3. Its power is that it's SHARED — Athena, Redshift Spectrum, EMR, and Glue jobs all read the same table definitions, so you define schema once. Crawlers scan S3 paths, infer schema and partitions, and populate/update the catalog automatically. But crawlers are a convenience, not a mandate: for stable, known schemas, defining tables explicitly (or via your ETL job / IaC) is more predictable than letting a crawler re-infer and occasionally mis-type a column.",
      noteLabel: "Model answer:",
      note: "\"The catalog is a Hive-compatible metastore, shared across Athena, Spectrum, EMR, and Glue. You define a table once and query it everywhere.<br><br>Crawlers auto-discover schema and partitions from S3, which is handy for messy or evolving external data.<br><br>But for pipelines I own with a known schema, I prefer to register tables explicitly from the ETL job or from IaC. A crawler can silently re-infer a type, like a string that looks numeric, and break things downstream.<br><br>And for new partitions, I'll often just run an ADD PARTITION or MSCK REPAIR rather than a full crawl.\"",
      followups: [
        "\"When would you NOT use a crawler and register the table yourself instead?\"",
        "\"You added a new date partition in S3 but Athena can't see it. Why, and two ways to fix it?\"",
        "\"How do Athena and Redshift Spectrum both query the same table without duplicating schema?\""
      ]
    },
    {
      title: "Glue ETL jobs — DynamicFrames vs DataFrames",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Glue ETL runs serverless Spark. It adds the DynamicFrame — a Spark-DataFrame-like structure built for messy, semi-structured data with a self-describing schema, so it can handle records with inconsistent fields (choice types), resolve them (ResolveChoice), and doesn't require you to declare a schema up front. You convert to a regular DataFrame (toDF()) the moment you want normal Spark SQL/API power, and convert back only if you need Glue sinks. Rule of thumb: DynamicFrame at the messy ingest edge (schema drift, mixed types), DataFrame for the actual transformation logic.",
      code: "# Read via DynamicFrame (tolerant of schema drift), transform as DataFrame\ndyf = glueContext.create_dynamic_frame.from_catalog(database=\"raw\", table_name=\"claims\")\ndf  = dyf.toDF()                              # drop to Spark DataFrame for real work\nout = (df.filter(\"amount IS NOT NULL\")\n         .withColumn(\"amount\", df.amount.cast(\"double\")))\n# write partitioned Parquet back to the lake\nout.write.mode(\"overwrite\").partitionBy(\"ingest_date\").parquet(\"s3://lake/silver/claims/\")",
      noteLabel: "Model answer:",
      note: "\"Glue ETL is serverless Spark, so I don't manage a cluster.<br><br>The Glue-specific bit is the DynamicFrame. It's built for semi-structured, drifting data, with a self-describing schema, choice types, and ResolveChoice to collapse mixed types. So it survives the messy ingest edge better than a DataFrame that needs a fixed schema.<br><br>But I call toDF() as soon as I'm doing real transformation, because the standard DataFrame API and Spark SQL are richer and more familiar.<br><br>So: DynamicFrame to land and clean, DataFrame to transform.\"",
      followups: [
        "\"A source column is sometimes an int and sometimes a string. How does a DynamicFrame handle it?\"",
        "\"Why convert to a DataFrame at all — what do you lose staying in DynamicFrames?\"",
        "\"Glue job is slow and you can't tune the cluster. What levers do you actually have?\""
      ]
    },
    {
      title: "Job bookmarks — incrementality without re-processing",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A job bookmark is Glue's built-in state that tracks what a job has already processed (by S3 object / partition or a JDBC high-water column), so a rerun picks up only NEW data instead of reprocessing everything. Enable it and Glue skips already-seen input. The gotchas that come up: bookmarks track ADDITIONS well but not in-place mutations of already-processed files; a bug that requires reprocessing means you must RESET the bookmark; and idempotency of your sink still matters because a retried run can re-emit a batch. It's the serverless equivalent of the high-water-mark you'd otherwise hand-roll.",
      noteLabel: "Model answer:",
      note: "\"Job bookmarks give me incremental processing for free. Glue records what's been consumed, either S3 objects or a JDBC bookmark key, so a rerun only touches new data. I lean on them instead of hand-rolling a high-water mark.<br><br>Three things I stay aware of. They detect new files, not edits to already-processed ones. If I need to reprocess after a logic fix, I reset the bookmark explicitly. And I still make the sink idempotent, upserting on a business key, because a retry can replay a batch.<br><br>It's the same discipline as Airflow idempotency, just managed by Glue.\"",
      followups: [
        "\"You fixed a transform bug and need to reprocess last week. How, with bookmarks on?\"",
        "\"Bookmarks are on but a corrected upstream file isn't being re-read. Why?\"",
        "\"Why does sink idempotency still matter if bookmarks prevent reprocessing?\""
      ]
    },
    {
      title: "When Glue is the WRONG tool",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Glue's convenience has edges. You can't finely tune the cluster (limited to worker type + DPU count), so a job needing specific Spark configs, custom native libraries, or a non-Spark engine belongs on EMR. Cold-start/overhead makes Glue a poor fit for very short or very frequent tasks — a per-event Lambda or Athena query is cheaper. At high, steady utilization Glue's per-DPU-hour price loses to a right-sized long-running EMR cluster. And for pure SQL transforms over the lake, Athena or dbt-on-Redshift is simpler than spinning a Spark job. Glue's sweet spot: scheduled, medium Spark ETL where you value zero cluster ops over cost-at-scale and deep control.",
      noteLabel: "Model answer:",
      note: "\"Glue is my default for scheduled, medium Spark ETL, because I don't manage a cluster.<br><br>I move off it in four cases. When I need real cluster control or a non-Spark framework, I go to EMR. When the workload is huge and runs constantly, where a right-sized EMR cluster is cheaper per hour, I go to EMR. When the task is tiny or event-driven, where Glue's startup overhead is wasteful, I use Lambda or Athena. And when it's pure SQL, where Athena or dbt is simpler.<br><br>The trade is always the same. Glue sells convenience, EMR sells control and cost-at-scale.\"",
      followups: [
        "\"Your Glue job needs a specific Spark config and a custom C library. Where does it go?\"",
        "\"A 6-hour job runs every night at full tilt — is Glue or EMR cheaper, and why?\"",
        "\"A transform is 20 lines of SQL. Why might Glue be overkill?\""
      ]
    }
  ]
},

emr: {
  intro: {
    title: "EMR — managed Hadoop/Spark when you need the cluster",
    desc: "EMR is a managed cluster running Spark, Hadoop, Hive, Presto, and more. The interview theme is control-vs-convenience: when the serverless options (Glue/Athena) don't cut it, and how you run EMR cost-effectively (transient clusters, Spot, EMR on EKS/Serverless, S3 as storage not HDFS)."
  },
  cards: [
    {
      title: "What EMR is, and when you actually need it",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "EMR provisions a cluster (a master + core + optional task nodes) with the Hadoop ecosystem installed — Spark, Hive, Presto/Trino, HBase, Flink. You get full control: instance types, Spark configs, bootstrap actions to install libraries, cluster sizing. Reach for it over Glue when you need that control, a non-Spark engine, very large or long-running jobs, or the lowest cost at high steady utilization. Modern EMR runs on EC2, on EKS (containers), or EMR Serverless (no cluster management, closer to Glue). Critically, you use S3 (via EMRFS) as storage, not cluster HDFS — so the cluster is disposable compute over durable lake data.",
      noteLabel: "Model answer:",
      note: "\"EMR is a managed Hadoop and Spark cluster. I get instance-level control, custom Spark tuning, bootstrap-installed libraries, and non-Spark engines like Presto or Flink.<br><br>I choose it over Glue when I need that control, a huge or long-running job, or the best price at sustained high utilization.<br><br>I keep data in S3 through EMRFS rather than HDFS, so the cluster is throwaway compute and the lake is the durable layer.<br><br>And if I want EMR's engine choice without babysitting a cluster, EMR Serverless splits the difference with Glue.\"",
      followups: [
        "\"Glue and EMR both run Spark. Give me two concrete reasons to pick EMR.\"",
        "\"Why store data in S3 instead of the cluster's HDFS?\"",
        "\"What does EMR Serverless change about the Glue-vs-EMR decision?\""
      ]
    },
    {
      title: "Cost control — transient clusters, Spot, and right-sizing",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A permanently-on EMR cluster is how teams waste the most money. The patterns that cut it: transient clusters — spin up for a job, run it, terminate — instead of a 24/7 cluster; Spot instances for task nodes (interruptible, up to ~90% cheaper) while keeping core/master on On-Demand for stability; instance fleets so the cluster falls back across instance types when Spot capacity is tight; and right-sizing to the job rather than one giant cluster. Because storage is S3, terminating a cluster loses nothing. This directly maps to the cost/right-sizing work interviewers love.",
      noteLabel: "Model answer:",
      note: "\"The biggest EMR waste is an always-on cluster. So I run transient clusters: provision for the job, then terminate on completion. That's safe because the data lives in S3, not HDFS.<br><br>I put task nodes on Spot for the big discount, and keep master and core on On-Demand so an interruption doesn't kill the job. I use instance fleets to fall back across types when Spot is scarce.<br><br>Then I right-size to the actual job, instead of one oversized cluster.<br><br>That's the same measure-then-cut discipline I applied to the platform cost work: find the biggest spender, change one thing, re-measure.\"",
      followups: [
        "\"Which EMR nodes are safe to run on Spot and which aren't? Why?\"",
        "\"A team runs one 24/7 EMR cluster for nightly jobs. How do you cut that bill?\"",
        "\"Spot capacity keeps disappearing mid-job. What's your mitigation?\""
      ]
    },
    {
      title: "EMR vs Databricks vs Glue — the Spark-platform question",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "All three run Spark; the difference is management model and ecosystem. Glue: fully serverless, least ops, least control, AWS-native catalog. EMR: max control and engine choice, you own more ops, cheapest at steady scale, AWS-native. Databricks: managed Spark with a superior developer experience (notebooks, Delta Lake, Unity Catalog, Photon engine, MLflow), cross-cloud, at a premium and with vendor lock-in to the platform. The honest DE answer names the trade: Databricks for productivity and the lakehouse feature set, EMR for control and cost at scale on AWS, Glue for zero-ops scheduled ETL.",
      noteLabel: "Model answer:",
      note: "\"Same engine, different management and ecosystem.<br><br>Glue is zero-ops serverless Spark with the AWS catalog. Least control, least toil.<br><br>EMR is maximum control and the cheapest at sustained scale, but I own cluster ops.<br><br>Databricks is the best developer experience: notebooks, Delta, Unity Catalog, Photon, MLflow, and it's cross-cloud. That comes at a price premium and some platform lock-in.<br><br>So: Databricks when team productivity and lakehouse features justify the cost. EMR when I need control or the best price at scale on AWS. Glue when I just want scheduled ETL with no cluster to run.\"",
      followups: [
        "\"Your team already uses Databricks. When would you still drop to EMR or Glue on AWS?\"",
        "\"What does Databricks give you that raw EMR Spark doesn't?\"",
        "\"Cost vs control vs productivity — rank the three for a small team with tight budget.\""
      ]
    }
  ]
},

lambda: {
  intro: {
    title: "Lambda — serverless glue and event-driven ingestion",
    desc: "Lambda runs code in response to events with no server to manage. For a DE it's the connective tissue — S3-triggered ingestion, kicking off pipelines, light transforms — and the interview point is knowing its limits so you don't use it as a general compute engine."
  },
  cards: [
    {
      title: "Where Lambda fits in a data pipeline",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Lambda is event-driven, ephemeral compute: an event arrives (S3 put, EventBridge schedule, SQS/Kinesis record, API call), your function runs, it scales out automatically per event, you pay per invocation + duration. In pipelines it's the GLUE: a file lands in S3 → Lambda validates it and triggers a Glue job or Step Function; a schedule fires → Lambda calls an API and drops the response in S3; a Kinesis record arrives → Lambda enriches and forwards it. It's for short, stateless, event-shaped work — not for crunching large datasets.",
      code: "# S3-put-triggered ingestion glue: validate + kick off the real job\ndef handler(event, context):\n    for rec in event[\"Records\"]:\n        bucket = rec[\"s3\"][\"bucket\"][\"name\"]\n        key    = rec[\"s3\"][\"object\"][\"key\"]\n        if not key.endswith(\".parquet\"):\n            raise ValueError(f\"unexpected file: {key}\")   # fail fast, DLQ catches it\n        glue.start_job_run(JobName=\"silver_claims\",\n                           Arguments={\"--input\": f\"s3://{bucket}/{key}\"})",
      noteLabel: "Model answer:",
      note: "\"Lambda is my event-driven glue: S3-put triggers, scheduled EventBridge pulls, and per-record Kinesis enrichment.<br><br>It scales per event and I pay per invocation, so it's perfect for short, stateless reactions. Validate a landed file and start a Glue job. Call an API on a schedule and land the JSON. Route a stream record.<br><br>What I don't do is treat it as a compute engine for big transforms. The moment the work is heavy or long, it belongs in Glue or EMR, and Lambda just kicks it off.\"",
      followups: [
        "\"A file lands in S3 and a pipeline should start. Wire it up — what triggers what?\"",
        "\"Why not just do the whole transformation inside the Lambda?\"",
        "\"How do you handle a Lambda that fails mid-batch — where does the event go?\""
      ]
    },
    {
      title: "The limits that decide 'Lambda or not'",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The hard limits are the whole interview: 15-minute max execution (so no long jobs), up to 10GB memory and 10GB ephemeral /tmp (so no huge datasets in-function), a deployment package size cap (mitigated by layers/containers), and cold starts adding latency on the first invoke or after scale-out. Concurrency is high but account-limited, and hammering a downstream (a DB) with thousands of concurrent Lambdas can overwhelm it — you throttle with reserved concurrency or buffer through SQS. If a task risks hitting the 15-min wall or needs lots of memory/state, it's the wrong tool — use Glue/EMR/ECS.",
      noteLabel: "Model answer:",
      note: "\"I size the task against Lambda's limits: a 15-minute ceiling, up to 10GB memory and 10GB of /tmp, package limits, and cold-start latency.<br><br>So it's great for short event handlers and terrible for anything long or data-heavy. If a job could approach 15 minutes or needs large memory or state, I move it to Glue, EMR, or an ECS/Fargate task, and let Lambda just orchestrate.<br><br>One production gotcha I call out: Lambda scales out fast. So if each invocation hits a database, I cap it with reserved concurrency or put SQS in front. Otherwise I'll accidentally DDoS my own warehouse.\"",
      followups: [
        "\"A transform occasionally takes 20 minutes. Is Lambda safe? What do you do?\"",
        "\"1,000 files land at once; each Lambda writes to Postgres. What goes wrong and how do you fix it?\"",
        "\"What causes a cold start and when does it actually matter for a data pipeline?\""
      ]
    },
    {
      title: "Orchestrating beyond one function — Step Functions vs Airflow",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "One Lambda is a step; a pipeline is many steps with retries, branching, and error handling. Step Functions is AWS's native state-machine orchestrator — it chains Lambdas/Glue/EMR steps with built-in retry, catch, parallel, and wait states, serverless and pay-per-transition, great for event-driven AWS-native flows. Airflow (MWAA on AWS) is the choice when you need rich scheduling, backfills, a big operator ecosystem across non-AWS systems, and code-defined DAGs your team already knows. The rule: Step Functions for lightweight serverless AWS orchestration, Airflow when the DAG spans many systems or needs real scheduling/backfill semantics.",
      noteLabel: "Model answer:",
      note: "\"A single Lambda is one step. To make a pipeline, I need orchestration.<br><br>For AWS-native, event-driven flows, I use Step Functions. It's a serverless state machine with retry, catch, parallel, and wait built in, it's pay-per-transition, and there's no scheduler to run.<br><br>When the workflow spans many systems, needs backfills and real scheduling, or the team already lives in Airflow, I use MWAA.<br><br>Roughly: Step Functions for lightweight serverless glue between AWS services, Airflow for cross-system pipelines with proper scheduling and backfill.\"",
      followups: [
        "\"Chain: Lambda validate → Glue transform → Redshift load, with retries. Step Functions or Airflow?\"",
        "\"What does Step Functions give you over just having each Lambda call the next?\"",
        "\"When is MWAA (Airflow) worth its overhead vs Step Functions?\""
      ]
    }
  ]
},

redshift: {
  intro: {
    title: "Redshift — the MPP warehouse (dist/sort keys, Spectrum, vs Snowflake)",
    desc: "Redshift is a columnar MPP warehouse. The questions that separate levels: how data is distributed across nodes (DISTKEY/SORTKEY), loading efficiently (COPY), querying the lake in place (Spectrum), and the honest Redshift-vs-Snowflake comparison — since your resume has both."
  },
  cards: [
    {
      title: "MPP architecture — leader, compute nodes, and slices",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Redshift is Massively Parallel Processing: a leader node plans the query and compute nodes execute it in parallel, each split into slices that each own a portion of the data. A query is fast when work is evenly spread across all slices and slow when it isn't — which is why data distribution (how rows map to nodes/slices) is the central performance concept. Columnar storage + compression (encodings) cut I/O; zone maps (per-block min/max) skip blocks, like Parquet row-group stats. Modern RA3 nodes separate compute from managed storage (S3-backed), moving Redshift closer to Snowflake's decoupled model.",
      noteLabel: "Model answer:",
      note: "\"Redshift is MPP. The leader plans, and compute nodes and their slices execute in parallel, each slice owning a portion of the data.<br><br>So performance is a function of how evenly work spreads across slices. Uneven distribution means a few slices do all the work while the rest idle.<br><br>On top of that, it's columnar, with compression encodings and zone maps that skip blocks by min and max.<br><br>With RA3 nodes, compute and storage are decoupled onto managed S3 storage. So it's converged a lot toward the Snowflake model of scaling them independently.\"",
      followups: [
        "\"A query is slow and one slice is doing most of the work. What's the likely cause?\"",
        "\"What do zone maps do, and what's the Parquet analogue?\"",
        "\"How do RA3 nodes change the classic 'Redshift couples compute and storage' critique?\""
      ]
    },
    {
      title: "DISTKEY & SORTKEY — the two knobs that make or break Redshift",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Distribution style decides which node/slice each row lands on. DISTKEY(col): rows with the same key co-locate — set it to the JOIN key of your big fact↔dimension join so the join happens locally with no data redistribution. DISTSTYLE ALL: replicate a small dimension to every node (kills redistribution for small tables). DISTSTYLE EVEN: round-robin when there's no good key. The failure mode is a bad DISTKEY causing skew (one slice overloaded) or forcing a broadcast/redistribution on every join. SORTKEY orders rows on disk so range filters and merge joins skip blocks — pick the column you filter/range on most (often a date). Together they're the #1 Redshift tuning lever.",
      code: "-- Fact distributed on the join key; sorted on the common filter\nCREATE TABLE fact_claims (\n  claim_id     BIGINT,\n  provider_id  BIGINT,\n  service_date DATE,\n  amount       DECIMAL(12,2)\n)\nDISTKEY (provider_id)      -- co-locate with dim_provider's join key => local join\nSORTKEY (service_date);    -- range filters on date skip blocks\n\n-- Small dimension replicated everywhere => no redistribution on the join\nCREATE TABLE dim_provider ( provider_id BIGINT, name VARCHAR ) DISTSTYLE ALL;",
      noteLabel: "Model answer:",
      note: "\"DISTKEY and SORTKEY are where Redshift performance is won.<br><br>I set the big fact table's DISTKEY to its join key, so it co-locates with the dimension and the join runs on each slice without redistributing terabytes across the network. Small dimensions I make DISTSTYLE ALL, so they're everywhere and never redistributed.<br><br>SORTKEY I set to the column I filter or range on most, usually the date, so zone maps skip blocks.<br><br>A wrong DISTKEY is the classic Redshift disaster: either skew, with one slice doing everything, or a redistribution on every single join.\"",
      followups: [
        "\"A fact↔dimension join redistributes huge data every run. How do you fix it with dist styles?\"",
        "\"When is DISTSTYLE ALL a good idea and when does it backfire?\"",
        "\"How do you choose a SORTKEY, and what query pattern does it accelerate?\""
      ]
    },
    {
      title: "Loading data — COPY, not INSERT",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "You load Redshift with COPY from S3, never row-by-row INSERTs. COPY reads many files in parallel across all slices — so split your input into multiple files (ideally a multiple of the slice count) of roughly equal size for balanced parallel load; one giant file loads on effectively one stream. COPY handles column mapping, compression, and error logging (to a system table). After big loads, VACUUM (reclaim/re-sort) and ANALYZE (refresh stats for the planner) — though modern Redshift auto-does much of this. Single-row INSERT loops are the anti-pattern that makes people think Redshift is slow.",
      code: "-- Parallel bulk load from S3; many even files => all slices work\nCOPY fact_claims\nFROM 's3://lake/silver/claims/ingest_date=2026-08-13/'\nIAM_ROLE 'arn:aws:iam::123456789012:role/redshift-copy'\nFORMAT AS PARQUET;\n\n-- After large loads (often automatic on modern Redshift):\nANALYZE fact_claims;   -- refresh planner statistics\n-- VACUUM fact_claims;  -- reclaim space + restore sort order",
      noteLabel: "Model answer:",
      note: "\"I load with COPY from S3, never INSERT loops. COPY parallelizes the read across all slices.<br><br>The trick is the input file count. I want many roughly-equal files, a multiple of the slice count, so every slice loads in parallel. A single huge file bottlenecks on one stream.<br><br>COPY does column mapping and decompression, and it logs bad rows to a system table so I can inspect failures.<br><br>After heavy loads, I ANALYZE to refresh stats and VACUUM to reclaim and re-sort, though modern Redshift automates a lot of that.<br><br>Row-by-row INSERTs are the anti-pattern that gives Redshift a bad name.\"",
      followups: [
        "\"A COPY from one 50GB file is slow. What's wrong and how do you speed it up?\"",
        "\"Why are single-row INSERTs pathological in Redshift?\"",
        "\"What do VACUUM and ANALYZE each do, and when do you still run them manually?\""
      ]
    },
    {
      title: "Redshift Spectrum — querying S3 without loading",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Spectrum lets Redshift query external tables that live in S3 (via the Glue Catalog) directly in a SQL query, joining lake data to loaded Redshift tables — you pay per S3 byte scanned, like Athena. The pattern: keep hot, frequently-joined curated data IN Redshift for speed, leave cold/huge/rarely-queried history in S3 and reach it through Spectrum, all in one query. Same cost levers as the lake apply: partition and store the external data as Parquet or Spectrum scans (and bills) far more. It's how you avoid loading petabytes you rarely touch while still exposing them to SQL.",
      code: "-- External schema over the Glue Catalog, then query S3 + Redshift together\nCREATE EXTERNAL SCHEMA lake FROM DATA CATALOG DATABASE 'silver'\n  IAM_ROLE 'arn:aws:iam::123456789012:role/redshift-spectrum';\n\n-- Join cold S3 history (Spectrum) to hot loaded dims (Redshift) in one query\nSELECT p.name, SUM(h.amount)\nFROM   lake.claims_history h            -- scanned from S3, Parquet + partitioned\nJOIN   dim_provider p ON p.provider_id = h.provider_id\nWHERE  h.ingest_date >= '2026-01-01'    -- partition prune to limit bytes scanned\nGROUP  BY p.name;",
      noteLabel: "Model answer:",
      note: "\"Spectrum queries S3 external tables from within Redshift. So I can join cold lake history to hot loaded marts in a single SQL statement, without ingesting the history.<br><br>I keep frequently-joined, latency-sensitive data loaded in Redshift, and leave the huge cold tail in S3, reached via Spectrum.<br><br>Because I pay per byte scanned there, the external data must be partitioned Parquet, and my queries must filter on the partition column. Otherwise Spectrum scans the whole thing and the bill spikes, exactly like Athena.\"",
      followups: [
        "\"7 years of claims history, but only 90 days is queried often. What's in Redshift vs Spectrum/S3?\"",
        "\"A Spectrum query got expensive. What are the first two things you check?\"",
        "\"How is Spectrum's cost model different from a query on a loaded Redshift table?\""
      ]
    },
    {
      title: "Redshift vs Snowflake — the comparison you'll be asked",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Both are columnar cloud warehouses; the honest differences: (1) Architecture — Snowflake fully decoupled compute (virtual warehouses) from storage from day one and auto-scales concurrency; Redshift approached this with RA3 + Concurrency Scaling but historically coupled them. (2) Tuning — Redshift exposes DISTKEY/SORTKEY/VACUUM that you must get right; Snowflake hides distribution (micro-partitions + auto-clustering), less to tune but less control. (3) Ops — Snowflake is near-zero-admin and multi-cloud; Redshift is AWS-native and integrates tightly with the AWS stack (and can be cheaper there, especially reserved). (4) Concurrency — Snowflake spins independent warehouses per workload trivially; Redshift uses Concurrency Scaling/WLM. The senior answer picks on ecosystem + tuning appetite, not 'X is better'.",
      noteLabel: "Model answer:",
      note: "\"Both are columnar MPP warehouses. I compare them on four axes.<br><br>Architecture: Snowflake decoupled compute and storage, and multi-cluster concurrency, from the start. Redshift got there with RA3 and Concurrency Scaling, but was historically coupled.<br><br>Tuning: Redshift makes me own DISTKEY, SORTKEY, and VACUUM. That's more control, but more foot-guns. Snowflake hides it behind micro-partitions and auto-clustering.<br><br>Ops and ecosystem: Snowflake is near-zero-admin and cross-cloud. Redshift is AWS-native, tighter with S3, Glue, and Spectrum, and often cheaper on reserved AWS spend.<br><br>So I choose on the ecosystem I'm in and how much tuning control the team wants, not on a blanket 'better'.\"",
      followups: [
        "\"You're all-in on AWS with reserved capacity. Does that push you toward Redshift or Snowflake?\"",
        "\"What Redshift tuning work simply doesn't exist in Snowflake, and why?\"",
        "\"How does each handle 200 concurrent BI users hitting the warehouse at 9am?\""
      ]
    }
  ]
},

crosscloud: {
  intro: {
    title: "Cross-cloud — Azure Data Factory & GCP BigQuery equivalents",
    desc: "Interviewers often ask 'how would you do this on Azure/GCP?' to test whether you understand the concepts or just the AWS brand names. This tab maps the AWS services to their Azure and GCP counterparts and covers BigQuery and Azure Data Factory specifically, since both are on the resume."
  },
  cards: [
    {
      title: "The service-equivalence map across the three clouds",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The concepts are identical; only the brands differ. Object storage / data lake: S3 ↔ Azure Data Lake Storage (ADLS) Gen2 ↔ Google Cloud Storage (GCS). Serverless SQL over the lake: Athena ↔ Synapse Serverless ↔ BigQuery (external tables). Managed Spark: EMR/Glue ↔ Azure Databricks / Synapse Spark ↔ Dataproc. Data warehouse: Redshift ↔ Azure Synapse (dedicated SQL pool) ↔ BigQuery. Orchestration / ELT movement: Glue/Step Functions ↔ Azure Data Factory ↔ Cloud Composer (managed Airflow) / Dataflow. Serverless functions: Lambda ↔ Azure Functions ↔ Cloud Functions. Streaming: Kinesis ↔ Event Hubs ↔ Pub/Sub. Being able to say the map is the signal you learned data engineering, not one vendor's console.",
      noteLabel: "Model answer:",
      note: "\"The clouds are the same shapes with different labels.<br><br>Lake storage is S3, ADLS Gen2, or GCS. Serverless lake SQL is Athena, Synapse Serverless, or BigQuery external tables. Managed Spark is EMR-or-Glue, Azure Databricks-or-Synapse Spark, or Dataproc. The warehouse is Redshift, Synapse, or BigQuery.<br><br>Orchestration and movement is Glue plus Step Functions, Data Factory, or Composer plus Dataflow. Functions are Lambda, Azure Functions, or Cloud Functions. Streaming is Kinesis, Event Hubs, or Pub/Sub.<br><br>I design against the concepts: decoupled storage and compute, partitioned columnar files, an orchestrated ELT. So porting is just a matter of swapping service names.\"",
      followups: [
        "\"Rebuild your S3 + Glue + Redshift pipeline on GCP. What services?\"",
        "\"On Azure, what plays the role of S3 and of Redshift?\"",
        "\"What's the GCP equivalent of Athena, and how is it different in practice?\""
      ]
    },
    {
      title: "BigQuery — serverless warehouse with a different cost model",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "BigQuery is GCP's fully serverless warehouse: no clusters, no nodes, no DISTKEY/SORTKEY to tune — you submit SQL and Google's Dremel engine parallelizes it over separated storage and compute. The defining difference is the cost model: on-demand BigQuery bills by BYTES SCANNED per query (like Athena), so the tuning is about scanning less — partition tables (usually by date), cluster them (BigQuery clustering ≈ sort order for pruning), and NEVER SELECT *, because you pay for every column read. The alternative is flat-rate/editions (reserved slots) for predictable heavy workloads. It's the closest thing to 'Athena but as your primary warehouse'.",
      noteLabel: "Model answer:",
      note: "\"BigQuery is fully serverless. There's no cluster, and none of Redshift's DISTKEY or SORTKEY tuning. Dremel just scales the query out.<br><br>The thing that reshapes how I work is the pricing. On-demand, it bills per byte scanned, so the whole game is scanning less.<br><br>I partition tables by date and cluster on common filter and join columns so queries prune, and I never SELECT *, because every column read costs money.<br><br>For steady heavy usage, I'd move to reserved slots or editions for predictable cost. Mentally, it's Athena's model, but as the primary warehouse.\"",
      followups: [
        "\"A BigQuery bill spiked. What are the first things you check?\"",
        "\"How does BigQuery partitioning + clustering compare to Redshift SORTKEY/DISTKEY?\"",
        "\"When would you pick flat-rate slots over on-demand pricing?\""
      ]
    },
    {
      title: "Azure Data Factory — orchestration & the ELT movement layer",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Azure Data Factory (ADF) is Azure's managed data-integration and orchestration service — think 'Glue jobs + Step Functions + a big connector library' in one. It centers on pipelines (the DAG), activities (steps), datasets (source/sink definitions), linked services (connections), and the copy activity (its high-throughput move-data-between-stores workhorse). Triggers schedule or event-fire pipelines; Integration Runtimes are the compute that actually executes (including a self-hosted IR to reach on-prem sources). For heavy transformation it either pushes down to the target (ELT into Synapse/Databricks) or uses Mapping Data Flows (visually-authored Spark). The mental model: ADF orchestrates and moves; real transform compute is Databricks/Synapse underneath.",
      noteLabel: "Model answer:",
      note: "\"ADF is Azure's orchestration and data-movement layer. It's roughly Glue plus Step Functions, with a huge connector catalog.<br><br>Pipelines are the DAG, activities are the steps, and linked services are the connections. The copy activity is the high-throughput mover between stores. Triggers schedule or event-fire it, and Integration Runtimes are the execution compute, including a self-hosted IR when I need to reach on-prem.<br><br>I keep ADF as the orchestrator and mover, and push heavy transformation down to Databricks or Synapse, or use Mapping Data Flows for visual Spark.<br><br>It's the same pattern as AWS: a light orchestrator over real compute, not the compute itself.\"",
      followups: [
        "\"What's the ADF equivalent of an Airflow DAG and its tasks?\"",
        "\"You need to pull from an on-prem SQL Server into ADLS with ADF. What component makes that possible?\"",
        "\"Where does the actual transformation run in an ADF-based ELT pipeline?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — AWS data-services Q&A and trade-offs",
    desc: "The spoken questions an AWS-heavy DE loop asks. Form your own answer first, then expand — the score is in naming the trade-off, the cost lever, and the boundary between overlapping services, not in listing features."
  },
  cards: [
    {
      title: "\"Design an ingestion pipeline on AWS for hourly file drops.\"",
      badge: "fundamentals",
      navLabel: "How to approach it:",
      nav: "Drive it end to end and name the service per arrow, with a raw-immutable-first principle and an idempotent load. Don't over-engineer — match the components to 'hourly files', not 'real-time at scale'.",
      noteLabel: "Model answer:",
      note: "\"Files land in an S3 raw prefix, partitioned by ingest date.<br><br>The S3 put triggers a Lambda that validates the file and starts a Glue job, or a Step Function if there are several steps. Glue reads raw, cleans and casts, and writes partitioned Parquet to a silver prefix, registering partitions in the Glue Catalog.<br><br>Curated marts either stay in S3 for Athena and Spectrum, or COPY into Redshift for BI.<br><br>I keep the raw copy immutable, so any bug is just a reprocess. I make the load idempotent by upserting on a business key. And I add a data-quality gate, like row counts and not-null keys, before the curated write.<br><br>For hourly volume, I wouldn't reach for Kinesis or EMR. That's over-built.\"",
      followups: [
        "\"Now it's 100k events/second instead of hourly files. What changes?\"",
        "\"A bad file landed and got processed. How does your design let you recover?\"",
        "\"Where's the data-quality gate and does it fail the run or quarantine rows?\""
      ]
    },
    {
      title: "\"Glue or EMR for this job — how do you decide?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Turn it into a checklist of decisive factors rather than a vibe: control needs, scale/duration, cost at utilization, engine choice, ops appetite.",
      noteLabel: "Model answer:",
      note: "\"I ask five things. Do I need cluster control or specific Spark configs and native libs? Do I need a non-Spark engine like Presto or Flink? Is the job huge or long-running at high, steady utilization, where a right-sized cluster is cheaper per hour? How much ops can the team absorb? And is it event-driven and short?<br><br>Glue wins for scheduled, medium, zero-ops Spark ETL. EMR wins when I need control, engine choice, or the best cost at sustained scale, at the price of owning cluster ops.<br><br>If it's tiny or event-shaped, it's neither. That's Lambda or Athena.<br><br>EMR Serverless is my middle ground when I want engine flexibility without managing nodes.\"",
      followups: [
        "\"Same nightly 6-hour Spark job at full utilization — which is cheaper and why?\"",
        "\"The job needs a custom native library. Does that decide it?\"",
        "\"Where does EMR Serverless fit between Glue and EMR-on-EC2?\""
      ]
    },
    {
      title: "\"Why is our Athena bill so high — how do you cut it?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Athena bills per byte scanned, so every lever reduces bytes scanned. List them cheapest-first and name the biggest wins.",
      noteLabel: "Model answer:",
      note: "\"Athena charges per byte scanned, so I attack bytes scanned. Biggest wins first.<br><br>Convert CSV and JSON to compressed, partitioned Parquet. That alone is often a 10x cut, from column pruning plus compression.<br><br>Make sure queries filter on the partition column so they prune, and that the partition column isn't wrapped in a function.<br><br>Stop using SELECT *. Project only the columns you need, since columnar scans are per-column. And compact small files to reduce overhead.<br><br>Then the structural options. Use a CTAS or summary table for repeated heavy aggregations, so you scan the small rollup, not the raw.<br><br>I confirm each change against the bytes-scanned metric Athena reports per query.\"",
      followups: [
        "\"The table is Parquet and partitioned but still scans everything. What's the bug?\"",
        "\"How would materializing a summary table change the cost?\"",
        "\"Same query on Redshift vs Athena — how do the cost models differ?\""
      ]
    },
    {
      title: "\"A Redshift query got slow. Walk me through diagnosing it.\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Reason from the plan and the distribution model, not folklore. Name the Redshift-specific culprits: distribution/skew, missing sort benefit, stale stats, spill.",
      noteLabel: "Model answer:",
      note: "\"I look at the query plan from EXPLAIN and at the system tables. There are five Redshift-specific culprits.<br><br>One: data distribution. Is a big join redistributing, showing DS_BCAST or DS_DIST, because the DISTKEY doesn't match the join key? I fix that with DISTKEY on the join column, or DISTSTYLE ALL for the small dimension.<br><br>Two: skew. One slice holding most of the rows because of a low-cardinality DISTKEY.<br><br>Three: no sort benefit. Filtering on a non-SORTKEY column, so zone maps can't skip blocks.<br><br>Four: stale statistics. The planner picks a bad plan, so I run ANALYZE.<br><br>Five: disk spill, from under-provisioned memory or bad WLM.<br><br>I confirm each one from the plan and the svl and stl system views rather than guessing, then change one thing and re-measure.\"",
      followups: [
        "\"The plan shows DS_BCAST_INNER on a huge table. What does that mean and how do you kill it?\"",
        "\"How do you detect distribution skew, and what causes it?\"",
        "\"When would a query be slow purely because of stale statistics?\""
      ]
    },
    {
      title: "\"How do you keep the lake query-fast AND cheap at scale?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Tie the levers together into a coherent story: layout, format, file size, tiering, and hot/cold split. This is the synthesis question.",
      noteLabel: "Model answer:",
      note: "\"There are five levers that compound.<br><br>Layout: partition on what you filter by, usually date, at a grain that keeps files 128MB to 1GB.<br><br>Format: Parquet everywhere you query, so column pruning and row-group stats cut bytes read.<br><br>File size: compact small files so readers don't die on per-file overhead.<br><br>Tiering: lifecycle raw and cold data to IA and Glacier, and expire it past retention, so I'm not paying hot rates for data nobody reads.<br><br>Hot/cold split: keep frequently-joined curated data loaded in Redshift, and leave the huge cold tail in S3, reached via Spectrum or Athena.<br><br>Because storage and compute are separate, I scale each to what it needs. That's the whole reason the lakehouse is cheaper than a coupled cluster.\"",
      followups: [
        "\"Rank those levers by impact for a 40GB-scanned-per-query table.\"",
        "\"What's the hot/cold boundary for 7 years of claims where only 90 days is hot?\"",
        "\"Which of these would you automate vs do once?\""
      ]
    },
    {
      title: "\"How would you build this same pipeline on GCP or Azure?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Show the concept-first mapping so you don't sound like a one-cloud engineer. Map each AWS component to its counterpart and note the one real behavioral difference.",
      noteLabel: "Model answer:",
      note: "\"I map by concept.<br><br>S3 becomes GCS or ADLS Gen2. The Glue Catalog becomes the Dataproc or Hive metastore, or Synapse's catalog. Glue and EMR Spark become Dataproc or Azure Databricks. Redshift becomes BigQuery or Synapse. Lambda becomes Cloud Functions or Azure Functions. Step Functions and Glue orchestration become Cloud Composer, which is managed Airflow, or Azure Data Factory. Kinesis becomes Pub/Sub or Event Hubs.<br><br>The one behavioral difference I'd flag: BigQuery is fully serverless and bills per byte scanned. So instead of Redshift's DISTKEY and SORTKEY tuning, I'd lean on partitioning, clustering, and never SELECT *.<br><br>Same architecture, different knobs.\"",
      followups: [
        "\"What's the single biggest behavioral difference moving Redshift → BigQuery?\"",
        "\"On Azure, what orchestrates and what actually computes the transform?\"",
        "\"Which AWS concept has the least clean equivalent elsewhere?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "On AWS, what is the data lake actually stored in, with every compute engine reading from it?",
    options: [
      "The Glue Data Catalog",
      "S3 — storage decoupled from compute, so Athena/Glue/EMR/Redshift Spectrum all read the same files",
      "Redshift's local node storage",
      "EMR's HDFS"
    ],
    correct: 1
  },
  {
    q: "An Athena bill is high on a CSV-backed, unpartitioned table. What's the highest-impact first change?",
    options: [
      "Increase the Athena query timeout",
      "Convert to compressed, partitioned Parquet so queries prune partitions and read only needed columns",
      "Add a secondary index",
      "Switch the region"
    ],
    correct: 1
  },
  {
    q: "You run the same heavy Spark job for 6 hours nightly at full utilization. Glue or EMR, cost-wise?",
    options: [
      "Glue — it's always cheaper because it's serverless",
      "EMR — a right-sized (possibly transient, Spot task nodes) cluster is cheaper at sustained high utilization; Glue trades cost for zero-ops",
      "Neither — use Lambda",
      "Always Glue; EMR is deprecated"
    ],
    correct: 1
  },
  {
    q: "A Redshift fact↔dimension join redistributes huge data across nodes every run. Best fix?",
    options: [
      "Add more compute nodes",
      "Set the fact's DISTKEY to the join key (and DISTSTYLE ALL on the small dimension) so rows co-locate and the join is local",
      "Run VACUUM after every query",
      "Convert the tables to CSV"
    ],
    correct: 1
  },
  {
    q: "Why load Redshift with COPY from S3 instead of INSERT statements?",
    options: [
      "INSERT isn't supported in Redshift",
      "COPY reads many files in parallel across all slices; row-by-row INSERTs serialize and are pathologically slow",
      "COPY automatically creates indexes",
      "INSERT costs more per statement"
    ],
    correct: 1
  },
  {
    q: "A task in your pipeline occasionally runs ~20 minutes and needs 12GB RAM. Is AWS Lambda appropriate?",
    options: [
      "Yes — Lambda has no time or memory limits",
      "No — Lambda caps at 15 minutes and 10GB memory; use Glue/EMR/ECS and let Lambda only trigger it",
      "Yes — just enable provisioned concurrency",
      "Yes — split it into 100 Lambdas"
    ],
    correct: 1
  },
  {
    q: "What does Redshift Spectrum let you do?",
    options: [
      "Automatically tune DISTKEYs",
      "Query external tables in S3 (via the Glue Catalog) directly, joining lake data to loaded Redshift tables, billed per byte scanned",
      "Replicate Redshift to another region",
      "Convert CSV to Parquet automatically"
    ],
    correct: 1
  },
  {
    q: "Moving a workload from Redshift to BigQuery, what's the biggest behavioral change for a DE?",
    options: [
      "You must still set DISTKEY and SORTKEY",
      "No dist/sort tuning; it's serverless and bills per byte scanned, so you optimize via partitioning, clustering, and avoiding SELECT *",
      "BigQuery has no partitioning",
      "You manage the cluster nodes yourself"
    ],
    correct: 1
  }
];
