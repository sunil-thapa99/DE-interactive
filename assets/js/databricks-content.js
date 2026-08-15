// Content data for the Databricks module — full standalone, basic -> advanced, senior-DE interview focus.
const MODULE_ID = "databricks";
const CONTENT = {

overview: {
  intro: {
    title: "Databricks & the Lakehouse — what it is and why it exists",
    desc: "A senior DE interview at a Databricks shop tests whether you understand the Lakehouse architecture and can reason about the platform's layers — Delta, compute, Unity Catalog, Workflows, DLT — not just run a notebook. This module goes basic to advanced, with every concept framed around real pipelines (healthcare claims, financial/risk transactions), the trade-offs, and the follow-up cross-questions."
  },
  cards: [
    {
      title: "The Lakehouse — one system instead of a lake AND a warehouse",
      badge: "fundamentals",
      conceptLabel: "The core idea:",
      concept: "The old world was two tiers: a data lake (cheap S3/ADLS storage, flexible, but no ACID/quality/BI performance) plus a separate warehouse (fast SQL, governed, but expensive and a copy of the lake). You paid to move and duplicate data between them and reconciled two governance models. The Lakehouse collapses both: keep data in cheap object storage as open Delta tables, but get ACID transactions, schema enforcement, governance, and warehouse-grade SQL performance directly on it. Databricks is the platform built around that idea — Delta Lake for the storage layer, Spark/Photon for compute, Unity Catalog for governance, all over your cloud's object store.",
      navLabel: "Why an interviewer asks this first:",
      nav: "They want to hear the problem it solves, not a feature list. The senior framing is 'one copy of the data, open format, serving both data-science/ML and BI/SQL with one governance model' — versus maintaining a lake and a warehouse and an ETL job copying between them. If you can name the two-tier pain (duplication, drift, double governance, extract latency), you've shown you understand why the Lakehouse exists.",
      noteLabel: "Model answer:",
      note: "\"The Lakehouse is the lake and the warehouse merged into one tier. Traditionally you had a data lake for cheap, flexible storage and a separate warehouse for fast governed SQL, with ETL copying data between them — so you paid twice, kept two copies, and reconciled two governance models. Databricks puts ACID, schema enforcement, governance, and warehouse-grade performance directly on open Delta tables in object storage, so one copy serves ML, streaming, and BI under one governance model via Unity Catalog. That's the pitch: no extract-and-duplicate, no drift between lake and warehouse.\"",
      followups: [
        { q: "\"What specifically did the lake lack that forced teams to also run a warehouse?\"", a: "ACID transactions, schema enforcement, and warehouse-grade governed SQL performance. A plain lake was cheap and flexible but couldn't give consistent reads or quality guarantees, so teams bolted on a warehouse for those." },
        { q: "\"If the Lakehouse is so good, why do companies still run Snowflake alongside it?\"", a: "For predominantly SQL/BI workloads with near-zero admin, a warehouse can be simpler and cheaper to operate; the convergence is recent and existing investment plus inertia keep both around." },
        { q: "\"What makes Delta a 'lakehouse' table and plain Parquet not?\"", a: "The _delta_log transaction log adds ACID commits, schema enforcement, time travel, and data skipping on top of the Parquet files, giving warehouse guarantees on open storage that raw Parquet lacks." }
      ]
    },
    {
      title: "Architecture — control plane vs data plane",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Databricks splits into two planes. The CONTROL PLANE (managed by Databricks) holds the web UI, notebooks, job scheduler, cluster manager, and metadata — the orchestration brain. The DATA PLANE / COMPUTE PLANE runs in YOUR cloud account: the clusters (EC2/VMs) that actually process data and the object storage (S3/ADLS/GCS) where your data lives. So your data never has to leave your cloud account — Databricks orchestrates compute that runs next to your storage. Serverless compute is a variant where the compute runs in Databricks' account instead, for faster startup. Knowing this split answers security/compliance questions (where does PHI actually sit?).",
      noteLabel: "Model answer:",
      note: "\"Two planes. The control plane is Databricks-managed — UI, job scheduler, cluster manager, notebook metadata. The data plane runs in my own cloud account: the clusters that crunch data and the object storage holding it. So the data stays in my VPC and my S3/ADLS; Databricks just orchestrates compute that runs beside it. That's the answer to 'where does our PHI live?' — it stays in our account's storage, processed by clusters in our account, which matters for HIPAA. Serverless flips the compute into Databricks' account for faster spin-up, which is a compliance conversation of its own.\"",
      followups: [
        { q: "\"A security reviewer asks where your PHI physically resides on Databricks. What do you tell them?\"", a: "With classic compute it stays in your own cloud account — your S3/ADLS storage and clusters in your VPC. Databricks' control plane only orchestrates, so the data never leaves your account, which is the HIPAA answer." },
        { q: "\"What's the trade-off of serverless compute vs classic compute in your account?\"", a: "Serverless runs the compute in Databricks' account for faster startup and no cluster management, but moves it out of your VPC — a data-residency/compliance conversation that classic in-account compute avoids." },
        { q: "\"Which plane does the cluster that runs your Spark job live in?\"", a: "The data (compute) plane, in your own cloud account with classic compute. The control plane only schedules and manages it." }
      ]
    },
    {
      title: "The medallion architecture — bronze, silver, gold",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The standard Databricks data-org pattern is three Delta layers. BRONZE: raw ingested data, appended as-is (immutable landing, full fidelity, reprocessable). SILVER: cleaned, conformed, deduplicated, joined — the validated, query-ready model. GOLD: business-level aggregates and marts serving BI/ML (per-provider claim totals, risk features). Data flows bronze → silver → gold, each a Delta table, so every layer is ACID, time-travelable, and independently reprocessable. It's the same raw/cleaned/curated idea as any lake, but here each layer is a governed Delta table rather than a loose prefix of files.",
      code: "# Bronze: land raw claims exactly as received (append-only, full fidelity)\n(spark.readStream.format(\"cloudFiles\").option(\"cloudFiles.format\",\"json\")\n   .load(\"/mnt/raw/claims/\")\n   .writeStream.format(\"delta\").option(\"checkpointLocation\",\"/chk/bronze_claims\")\n   .toTable(\"main.bronze.claims\"))\n\n# Silver: clean, cast, dedup latest per claim_id -> validated model\n# Gold: aggregate for BI -> e.g. main.gold.claims_by_provider_month",
      noteLabel: "Model answer:",
      note: "\"I organize into bronze/silver/gold Delta tables. Bronze is the immutable raw landing — I append exactly what arrived so I can always reprocess. Silver is cleaned, cast, deduped, and conformed — the trustworthy model everything queries. Gold is the business marts and aggregates for BI and ML. Because each layer is a Delta table, every stage is ACID and time-travelable, and I can rebuild silver/gold from bronze after a logic fix. At Cedar Gate that meant raw HL7/FHIR claims in bronze, a validated claims model in silver, and per-provider/per-payer gold marts for reporting.\"",
      followups: [
        { q: "\"Why keep bronze at all once silver exists — isn't it wasted storage?\"", a: "Bronze is the immutable, full-fidelity raw record, so silver/gold can be reprocessed from scratch after a logic fix or schema change. Object storage is cheap; losing the ability to rebuild is expensive." },
        { q: "\"A bug in your silver logic shipped bad data for a week. How does medallion let you recover?\"", a: "Fix the silver transform and reprocess from the untouched bronze landing, since bronze retains the raw source. Delta time travel / RESTORE on the affected tables also helps roll back." },
        { q: "\"Where do data-quality checks belong in this flow?\"", a: "At the bronze→silver boundary: silver is the validated, cleaned, conformed model, so quality gates (not-null keys, valid amounts) run as data is promoted into silver before anything trusts it." }
      ]
    },
    {
      title: "When Databricks — and when not",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Databricks is the strong choice when you need ONE platform spanning batch + streaming + ML + BI on large or varied data, with code (PySpark/SQL/Scala) not just SQL, and open storage you're not locked into. It's less compelling when the workload is purely SQL analytics on structured data with no ML/streaming — a warehouse like Snowflake or BigQuery may be simpler and cheaper to operate; or when data is small enough that a cluster is overkill (a single-node script/pandas wins); or when the team has no appetite for cluster/compute concepts at all. The senior answer names the trade honestly rather than treating Databricks as universal.",
      noteLabel: "Model answer:",
      note: "\"Databricks wins when I need one engine across batch, streaming, ML, and BI, with real code not just SQL, on big or semi-structured data, in an open format. It's overkill when the job is pure SQL BI on clean structured data — a warehouse is simpler there — or when the data's small enough that spinning a cluster costs more than it's worth, where a single-node script is honest. I don't pretend it's universal; the value is the unified lakehouse, so if you don't need the breadth, a narrower tool can be cheaper to run.\"",
      followups: [
        { q: "\"A team does only SQL dashboards on 50GB of clean data. Databricks or Snowflake — argue it.\"", a: "Snowflake (or any warehouse): pure SQL/BI on small, clean, structured data needs no Spark/ML/streaming, so a warehouse is simpler and cheaper to operate. Databricks' unified breadth is wasted here." },
        { q: "\"When is spinning up a Spark cluster the wrong call entirely?\"", a: "When the data is small enough that a single-node script/pandas finishes before a cluster even starts — the cluster overhead costs more than it saves." },
        { q: "\"What does 'open format' actually protect you from?\"", a: "Vendor lock-in: data stays in open Delta/Parquet on your own object storage, so other engines can read it and you're not trapped in a proprietary managed format." }
      ]
    }
  ]
},

workspace: {
  intro: {
    title: "The workspace — clusters, notebooks, and how work is organized",
    desc: "The basics you're assumed to have used daily: what a cluster is and the types, notebooks and Repos, DBFS/volumes, and dbutils/secrets/widgets. Interviewers use these to confirm you've actually worked in the platform, then pivot to the choices (which cluster type, why) that signal real experience."
  },
  cards: [
    {
      title: "Clusters — all-purpose vs job vs SQL warehouse",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Compute comes in three shapes and picking right is a cost signal. ALL-PURPOSE clusters: interactive, shared, for development/notebooks/ad-hoc — stay up, cost more, multiple users. JOB clusters: created for a scheduled job run and TERMINATED when it finishes — cheaper (job-compute DBU rate) and isolated, the right choice for production pipelines. SQL WAREHOUSES: compute dedicated to Databricks SQL / BI queries (classic, pro, or serverless), optimized for concurrent SQL. The classic mistake is running production jobs on an always-on all-purpose cluster — you pay the interactive rate around the clock for scheduled work.",
      noteLabel: "Model answer:",
      note: "\"Three types. All-purpose for interactive dev — shared, persistent, higher DBU rate. Job clusters for production: spun up per job run and torn down after, billed at the cheaper job rate and isolated so one job can't destabilize another. SQL Warehouses for BI/SQL concurrency. The cost mistake I watch for is production jobs pinned to an always-on all-purpose cluster — you pay the interactive rate 24/7 for work that should run on an ephemeral job cluster. So dev on all-purpose, schedule on job clusters, serve BI from a SQL Warehouse.\"",
      followups: [
        { q: "\"A team runs all nightly jobs on one shared always-on cluster. What's wrong and what do you change?\"", a: "They pay the interactive all-purpose rate 24/7 for scheduled work, and jobs aren't isolated. Move each production job onto an ephemeral job cluster spun up per run at the cheaper job rate and terminated after." },
        { q: "\"Why is a job cluster cheaper than an all-purpose cluster for the same work?\"", a: "It's billed at the lower job-compute DBU rate and is ephemeral — created for the run and torn down after — so you don't pay interactive rates or for idle uptime." },
        { q: "\"When would you use a serverless SQL Warehouse over a pro one?\"", a: "For spiky/interactive BI where you want second-scale startup and fast autoscaling without paying to keep a warehouse warm; pro is chosen when data-residency requires the compute to run in your own account." }
      ]
    },
    {
      title: "Notebooks, Repos & Git — code, not just cells",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Notebooks are the interactive surface (Python/SQL/Scala/R, mixable via %python/%sql magics), but for production you treat them as versioned code: Databricks Repos syncs a notebook/folder to a Git provider so pipelines live in a repo with PRs and CI, not as ad-hoc notebooks in someone's user folder. %run imports another notebook; increasingly you package shared logic as Python modules/wheels and import them normally. The senior signal is that your Databricks code is Git-backed and testable, not click-ops in the UI.",
      noteLabel: "Model answer:",
      note: "\"Notebooks are great for exploration, but production code is Git-backed via Repos — the pipeline lives in a repo with branches, PRs, and CI running unit tests, not as loose notebooks in a personal workspace folder. I factor shared logic into Python modules/wheels I can import and unit-test off-cluster, and keep notebooks thin. %run works for stitching notebooks but I prefer real imports. That's how I get code review, testing, and reproducible deploys on Databricks instead of click-ops.\"",
      followups: [
        { q: "\"How do you unit-test transformation logic that runs in a Databricks notebook?\"", a: "Factor the logic into pure functions in an importable module/wheel and pytest them off-cluster against a local Spark session (e.g. chispa for DataFrame equality); the notebook stays a thin caller." },
        { q: "\"Why factor logic into modules/wheels instead of big notebooks?\"", a: "Modules are importable, unit-testable in CI off-cluster, reusable, and code-reviewable — versus logic buried in notebook cells that can only be run and eyeballed." },
        { q: "\"How does a notebook pipeline get from a dev branch to production safely?\"", a: "It's Git-backed via Repos with branches and PRs, CI runs unit tests, and it's promoted through environments rather than edited live — code review and reproducible deploys instead of click-ops." }
      ]
    },
    {
      title: "DBFS, mounts, Volumes & dbutils",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "DBFS is a filesystem abstraction over object storage. Historically you 'mounted' an S3/ADLS path to /mnt/... but under Unity Catalog the governed way is VOLUMES (catalog.schema.volume) — governed, access-controlled storage for files, replacing ad-hoc mounts. dbutils is the utility toolbelt: dbutils.fs (file ops), dbutils.secrets (pull credentials from a secret scope — never hardcode keys), dbutils.widgets (parameterize a notebook so a job can pass values), dbutils.notebook (chain notebooks). Knowing Volumes-over-mounts and secrets-over-hardcoding are the two 'current best practice' tells.",
      code: "# Parameterize a notebook (a Job passes these in)\ndbutils.widgets.text(\"ingest_date\", \"2026-08-14\")\nrun_date = dbutils.widgets.get(\"ingest_date\")\n\n# Pull a credential from a secret scope (never hardcode)\ntoken = dbutils.secrets.get(scope=\"prod\", key=\"api_token\")\n\n# Governed file access via Unity Catalog Volume (preferred over /mnt mounts)\ndf = spark.read.json(\"/Volumes/main/raw/landing/claims/\")",
      noteLabel: "Model answer:",
      note: "\"DBFS abstracts object storage. The modern, governed way to reach files is Unity Catalog Volumes rather than legacy /mnt mounts — Volumes are access-controlled and audited. dbutils is the toolbelt: dbutils.secrets to pull credentials from a secret scope so nothing's hardcoded, dbutils.widgets to parameterize a notebook so a job passes run dates or paths, dbutils.fs for file ops. The two things I'd flag as current practice: Volumes over mounts, and secrets over inline keys — both are governance/security expectations at a senior level.\"",
      followups: [
        { q: "\"Why are Unity Catalog Volumes preferred over the old /mnt mount pattern?\"", a: "Volumes are governed, access-controlled, audited UC objects, whereas /mnt mounts are ad-hoc and ungoverned — Volumes bring file access under the same permission model as tables." },
        { q: "\"How do you pass a run date into a notebook from a scheduled job?\"", a: "dbutils.widgets: define a widget in the notebook and the job passes the value in, so the same notebook is parameterized per run (e.g. ingest_date)." },
        { q: "\"Where do API keys and DB passwords live so they're not in the notebook?\"", a: "In a secret scope, pulled at runtime via dbutils.secrets.get — never hardcoded inline." }
      ]
    }
  ]
},

spark: {
  intro: {
    title: "Spark on Databricks — the execution model you must be able to explain",
    desc: "Databricks IS Spark under the hood, so senior rounds still probe the execution model: lazy transformations vs actions, jobs/stages/tasks, narrow vs wide, and where shuffles come from. This is the 'why is my job slow' foundation the performance tab builds on."
  },
  cards: [
    {
      title: "Lazy evaluation — transformations vs actions",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Spark is lazy. Transformations (select, filter, withColumn, join, groupBy) don't execute — they build a logical plan. Nothing runs until an ACTION (write, count, collect, show, take) triggers the whole plan to be optimized (by Catalyst) and executed. This is why a chain of twenty transforms is 'free' until the write, why Catalyst can reorder/prune across the chain, and why an accidental count() or display() in the middle of a pipeline forces a full execution you didn't intend. Understanding this explains most 'my job ran the expensive part twice' surprises.",
      noteLabel: "Model answer:",
      note: "\"Transformations are lazy — they just extend the query plan; only an action (write, count, collect, show) triggers execution, at which point Catalyst optimizes the whole plan at once. Two practical consequences: I don't sprinkle count()/display() through a pipeline because each is a full action that re-executes upstream work, and if I reuse an expensive intermediate DataFrame across multiple actions I cache/persist it or the lineage recomputes every time. Lazy evaluation is also why Spark can push filters down and prune columns across a long chain — it sees the whole plan before running anything.\"",
      followups: [
        { q: "\"You added a count() to 'check progress' mid-pipeline and it got slower. Why?\"", a: "count() is an action, so it forces the entire upstream transformation chain to execute; the pipeline then re-executes that work again at the real write. Each action triggers a full run." },
        { q: "\"An intermediate DataFrame feeds three different writes and recomputes each time. Fix?\"", a: "cache/persist the intermediate DataFrame so it's computed once and reused, instead of the lineage recomputing it for every action." },
        { q: "\"Name three actions and three transformations.\"", a: "Actions: write, count, collect (also show/take). Transformations: select, filter, withColumn (also join/groupBy). Transformations are lazy; actions trigger execution." }
      ]
    },
    {
      title: "Jobs, stages, tasks & the shuffle boundary",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "When an action fires, Spark creates a JOB, splits it into STAGES at shuffle boundaries, and each stage runs as TASKS (one per partition, run in parallel across executor cores). NARROW transformations (map, filter, withColumn) need no data movement — each partition is processed independently. WIDE transformations (groupBy, join, distinct, repartition) require a SHUFFLE — data is redistributed across the network by key, which is expensive and creates a new stage. Almost all Spark performance problems live at shuffle boundaries: too much data moving, or moving unevenly (skew). Reading the Spark UI stage view is how you find them.",
      noteLabel: "Model answer:",
      note: "\"An action becomes a job; Spark cuts the job into stages at each shuffle, and a stage runs as one task per partition in parallel. Narrow transforms — filter, withColumn, map — stay within a partition, no network. Wide transforms — join, groupBy, distinct — shuffle data across the cluster by key and start a new stage, and that's where the cost is. So when a job's slow I open the Spark UI, find the stage burning the time, and ask: is it a huge shuffle I can avoid or broadcast away, or is it skew where a few tasks run 10x longer than the rest? The shuffle boundary is where I look first.\"",
      followups: [
        { q: "\"Which of these shuffle: filter, join, withColumn, groupBy, select?\"", a: "join and groupBy shuffle — wide transforms redistributing data by key across the network; filter, withColumn, and select are narrow and stay within a partition." },
        { q: "\"Two tasks in a stage run 10x longer than the other 200. Diagnosis?\"", a: "Data skew — a few keys hold disproportionate data, so their partitions/tasks take far longer. Fix with AQE skew join or by salting the hot key." },
        { q: "\"Why does reducing shuffles usually matter more than adding CPU?\"", a: "A shuffle moves data across the network by key and creates a new stage, and that I/O and serialization is usually the bottleneck — so removing a shuffle (e.g. broadcast) helps more than CPU that sits idle waiting on the network." }
      ]
    },
    {
      title: "PySpark, SQL, or Scala — and DataFrames over RDDs",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "On Databricks you can mix PySpark, Spark SQL, and Scala in the same workflow, and they compile to the same optimized plan via Catalyst — so PySpark DataFrame code and the equivalent SQL perform essentially identically. Pick by fit: SQL for set-based transforms and analysts; PySpark for complex logic, testing, and Python ecosystem/ML. The one real performance rule: stay in the DataFrame/SQL API and avoid RDDs and Python UDFs where a native function exists — RDDs bypass Catalyst optimization, and a row-at-a-time Python UDF serializes between the JVM and Python and is opaque to the optimizer. Use pandas/Arrow UDFs if you must go custom.",
      noteLabel: "Model answer:",
      note: "\"PySpark, SQL, and Scala all lower to the same Catalyst plan, so DataFrame PySpark and SQL perform the same — I choose on readability and the team. SQL for set-based work and analysts, PySpark for complex/tested logic and ML. The performance rule that matters: stay in the DataFrame/SQL API, avoid RDDs (they skip Catalyst) and avoid row-at-a-time Python UDFs (they serialize JVM↔Python and block optimization/pushdown). If I truly need custom logic I reach for a pandas/Arrow-vectorized UDF, but I try native functions first.\"",
      followups: [
        { q: "\"Is a PySpark DataFrame slower than the equivalent Spark SQL? Why or why not?\"", a: "No — both lower to the same Catalyst-optimized plan, so DataFrame PySpark and SQL perform essentially identically. Choose on readability and team fit." },
        { q: "\"Why avoid a plain Python UDF, and what's the faster alternative?\"", a: "A row-at-a-time Python UDF serializes data JVM↔Python and is opaque to Catalyst (no pushdown/optimization). Prefer native functions, or a vectorized pandas/Arrow UDF if custom logic is unavoidable." },
        { q: "\"When would you still drop to the RDD API?\"", a: "Only for low-level control the DataFrame API can't express (custom partitioning, non-tabular data). It bypasses Catalyst optimization, so it's a last resort." }
      ]
    }
  ]
},

delta: {
  intro: {
    title: "Delta Lake — the transactional table format under everything",
    desc: "Delta is what makes the Lakehouse work: ACID on object storage, upserts, time travel, schema control, and file optimization. Senior interviews go deep here — the transaction log, MERGE for CDC/SCD, OPTIMIZE/ZORDER, and Change Data Feed. This is the highest-value tab for a Databricks role."
  },
  cards: [
    {
      title: "What Delta adds over Parquet — the transaction log",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A Delta table is Parquet data files PLUS a transaction log (_delta_log): an ordered series of JSON commits recording which files are added/removed by each atomic operation, periodically checkpointed. That log is what gives ACID on object storage — a reader sees a consistent snapshot (the set of files valid as of a log version), writers commit atomically via optimistic concurrency, and a failed job leaves no half-written table because uncommitted files aren't in the log. Plain Parquet has none of this: a concurrent writer or a failed append can leave readers seeing partial/corrupt data. The log also powers time travel, schema tracking, and CDC.",
      noteLabel: "Model answer:",
      note: "\"Delta is Parquet plus a transaction log — an ordered set of JSON commits in _delta_log that lists the files each operation adds or removes, with periodic checkpoints. That log is the whole game: readers get a consistent snapshot as of a version, writers commit atomically with optimistic concurrency control, and a crashed job leaves the table clean because its files were never committed to the log. Plain Parquet gives me none of that — a failed append or a concurrent write can expose partial files. The same log also enables time travel, schema enforcement, and Change Data Feed, so it's the foundation for basically every Delta feature.\"",
      followups: [
        { q: "\"A Spark job writing Parquet dies halfway. What do readers see? Now with Delta?\"", a: "With plain Parquet, readers can see partial/half-written files. With Delta, the uncommitted files were never added to _delta_log, so readers still see the last consistent snapshot and the crashed write leaves the table clean." },
        { q: "\"How do two concurrent writers to a Delta table avoid corrupting it?\"", a: "Optimistic concurrency control on the transaction log: each commits atomically, and a conflicting commit is detected and retried or failed rather than corrupting the table." },
        { q: "\"What's actually inside _delta_log?\"", a: "An ordered series of JSON commit files listing which data files each atomic operation added/removed, plus schema and per-file stats, with periodic Parquet checkpoints. That log defines each table version." }
      ]
    },
    {
      title: "MERGE — upserts for CDC and SCD",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "MERGE INTO is Delta's upsert: match a target table against a source on a key, then UPDATE/DELETE matched rows and INSERT unmatched ones — all atomically. It's the backbone of CDC sinks (apply inserts/updates/deletes from a change feed idempotently) and SCD Type 1/2 dimension maintenance. The idempotency win: re-running the same batch through MERGE on the business key doesn't create duplicates, unlike a blind append — which is exactly what makes a pipeline safe to retry. Watch the cost: MERGE rewrites the data files containing matched rows, so on huge tables you narrow the target with a partition/ZORDER predicate.",
      code: "# Idempotent CDC sink: apply a batch of changes by business key\nfrom delta.tables import DeltaTable\ntgt = DeltaTable.forName(spark, \"main.silver.claims\")\n(tgt.alias(\"t\").merge(updates.alias(\"s\"), \"t.claim_id = s.claim_id\")\n    .whenMatchedDelete(condition=\"s.op = 'D'\")\n    .whenMatchedUpdateAll(condition=\"s.op = 'U'\")\n    .whenNotMatchedInsertAll(condition=\"s.op = 'I'\")\n    .execute())\n# Re-running the same batch is safe: matches update in place, no duplicate inserts.",
      noteLabel: "Model answer:",
      note: "\"MERGE is Delta's atomic upsert — match target to source on a key, then update/delete/insert in one transaction. It's how I build idempotent CDC sinks and maintain SCD dimensions: because it keys on the business id, replaying a batch updates in place instead of duplicating, so the pipeline is safe to retry — that's the property a blind append can't give me. The cost to respect is that MERGE rewrites whole files touched by matches, so on big tables I constrain the target with a partition predicate (and ZORDER on the merge key) so it rewrites a small slice, not the table. At Cedar Gate this was the pattern for applying claim updates from the source feed.\"",
      followups: [
        { q: "\"Why is MERGE idempotent where an INSERT append isn't?\"", a: "MERGE keys on the business id and updates matched rows in place, so replaying a batch updates instead of duplicating. A blind append adds the same rows again on every replay." },
        { q: "\"A MERGE on a 2TB table is rewriting far too much. How do you shrink the blast radius?\"", a: "Constrain the target with a partition/ZORDER predicate on the merge key so only the relevant files are rewritten — MERGE rewrites entire files containing matched rows, so narrowing the match narrows the rewrite." },
        { q: "\"Map the three CDC operations (I/U/D) to MERGE clauses.\"", a: "Insert → whenNotMatchedInsert; Update → whenMatchedUpdate; Delete → whenMatchedDelete — all applied atomically in one MERGE keyed on the business id." }
      ]
    },
    {
      title: "Time travel & VACUUM",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Because the log versions every commit, you can query a table AS OF an older version or timestamp — time travel. Uses: reproduce yesterday's report, debug 'what did this look like before the bad load', audit, or roll back with RESTORE. The counterpart is VACUUM: it physically deletes data files no longer referenced by the log and older than a retention window (default 7 days). So time travel only reaches back as far as VACUUM has left files. The trap: VACUUM with a very short retention can break running readers/time-travel and streaming checkpoints; you keep enough retention for your recovery/audit needs but not so much you pay for infinite dead files.",
      code: "-- Read an old snapshot to debug or reproduce\nSELECT * FROM main.silver.claims VERSION AS OF 42;\nSELECT * FROM main.silver.claims TIMESTAMP AS OF '2026-08-13';\n-- Roll the whole table back after a bad load\nRESTORE TABLE main.silver.claims TO VERSION AS OF 41;\n-- Reclaim storage from files older than retention (default 7 days)\nVACUUM main.silver.claims RETAIN 168 HOURS;",
      noteLabel: "Model answer:",
      note: "\"Every commit is a version, so I can read a table AS OF a version or timestamp — invaluable for reproducing a prior report, debugging what a table looked like before a bad load, auditing, or RESTORE-ing to roll back. VACUUM is the counterweight: it deletes unreferenced files older than the retention window, so time travel only reaches as far back as VACUUM leaves data. I set retention to cover my audit/recovery needs — for regulated claims data that might be longer — and I'm careful that aggressive VACUUM doesn't yank files out from under a running streaming reader or long time-travel query.\"",
      followups: [
        { q: "\"A bad batch corrupted a table an hour ago. Two ways Delta lets you recover?\"", a: "RESTORE the table to the prior version, or read a time-travel snapshot (VERSION/TIMESTAMP AS OF) from before the bad load and rewrite from it — both rely on the versioned log." },
        { q: "\"You set VACUUM retention to 1 hour and a streaming job broke. Why?\"", a: "VACUUM physically deleted files still referenced by a running reader/time-travel query or the streaming checkpoint, which need older files to remain. Aggressive retention yanks files out from under active readers." },
        { q: "\"How far back can you time travel, and what limits it?\"", a: "As far back as VACUUM has left the data files — the retention window bounds it. Once VACUUM removes unreferenced older files, those versions can no longer be read." }
      ]
    },
    {
      title: "Schema enforcement & evolution",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Delta enforces schema on write: a write whose columns/types don't match the table is REJECTED, not silently coerced — so a malformed upstream change can't quietly corrupt your table (the opposite of schema-on-read Parquet). When a change is intended, schema EVOLUTION lets you opt in — mergeSchema to add new columns on append, or ALTER TABLE — and Auto Loader can evolve automatically. The senior point is the balance: enforcement protects the silver/gold contract by default; evolution is a deliberate, opt-in act for genuinely new fields, not a blanket 'accept anything' setting that lets drift through.",
      noteLabel: "Model answer:",
      note: "\"Delta enforces schema on write — a mismatched write fails rather than coercing, so an upstream field rename or type change can't silently poison a table; that's a feature, not an annoyance. When the change is real I evolve deliberately: mergeSchema to add columns on append, ALTER TABLE for explicit changes, and Auto Loader can auto-evolve at the bronze edge where drift is expected. The judgment is where to allow each: I let bronze absorb drift, but silver/gold have enforced schemas because they're contracts downstream depends on — I don't want a surprise column silently reshaping a mart.\"",
      followups: [
        { q: "\"Upstream renamed a column and your append failed. Is that good or bad? What do you do?\"", a: "Good — schema enforcement rejected the mismatched write instead of silently corrupting the table. Then decide: fix the source mapping, or deliberately evolve the schema (mergeSchema/ALTER TABLE) if the change is intended." },
        { q: "\"Where do you allow schema evolution and where do you enforce strictly? Why?\"", a: "Allow evolution at the bronze edge where drift is expected (Auto Loader auto-evolve); enforce strictly on silver/gold because they're contracts downstream depends on and a surprise column shouldn't reshape a mart." },
        { q: "\"How does this differ from schema-on-read Parquet?\"", a: "Delta enforces schema on write and rejects mismatches; schema-on-read Parquet applies a schema only at read time, so bad/mismatched data lands silently and surfaces as corruption later." }
      ]
    },
    {
      title: "OPTIMIZE, ZORDER & liquid clustering — the file layout levers",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Streaming and frequent MERGE/append create many small files, which kills read performance (per-file overhead). OPTIMIZE compacts them into larger files (bin-packing). ZORDER BY co-locates data by one or more high-cardinality columns you filter on, so data skipping (the log's per-file min/max stats) can prune far more files — think of it as multi-dimensional clustering for the columns you query by. LIQUID CLUSTERING is the newer replacement for both partitioning and ZORDER: you declare CLUSTER BY columns and Databricks maintains layout automatically, avoiding the over/under-partitioning trap. Data skipping + the right clustering is how Delta gets warehouse-grade scan performance.",
      code: "-- Compact small files and cluster by the common filter/join columns\nOPTIMIZE main.silver.claims ZORDER BY (provider_id, service_date);\n\n-- Modern approach: declare clustering, Databricks maintains it\nALTER TABLE main.silver.claims CLUSTER BY (provider_id, service_date);\n-- (Liquid clustering replaces manual partitioning + ZORDER)",
      noteLabel: "Model answer:",
      note: "\"Streaming and MERGE create small files, so I run OPTIMIZE to bin-pack them into read-sized files, and ZORDER BY the high-cardinality columns queries filter on so data skipping — the file min/max stats in the log — prunes far more files. Increasingly I use liquid clustering instead: I declare CLUSTER BY and Databricks maintains the layout, which sidesteps the classic over- or under-partitioning mistake. The mental model is that data skipping is only as good as the layout, so OPTIMIZE + clustering on the actual query predicates is what gives Delta warehouse-grade scan speed on object storage.\"",
      followups: [
        { q: "\"A streaming table's queries got slow over time. Most likely cause and fix?\"", a: "The small-files problem from frequent streaming/MERGE writes — per-file overhead kills scans. Run OPTIMIZE to compact them, and ZORDER or liquid-cluster on the columns queries filter on." },
        { q: "\"What does ZORDER actually change on disk, and how does it speed queries?\"", a: "It co-locates rows with similar values of the chosen high-cardinality columns into the same files, tightening each file's min/max stats so data skipping prunes far more files on a filtered query." },
        { q: "\"Why might you choose liquid clustering over Hive-style partitioning + ZORDER?\"", a: "Databricks maintains the layout automatically and it sidesteps the over/under-partitioning trap (skew, tiny partitions) of fixed Hive partitioning — you just declare CLUSTER BY." }
      ]
    },
    {
      title: "Change Data Feed — Delta as a change source",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "With Change Data Feed (CDF) enabled, a Delta table emits row-level changes (inserts, updates with pre/post images, deletes) that downstream consumers can read incrementally — turning any Delta table into a CDC source. This is how you propagate changes bronze→silver→gold efficiently: silver reads only what changed in bronze since the last checkpoint, instead of recomputing the whole table. It's the Databricks-native way to build incremental medallion pipelines and to feed changes to external systems, and it pairs with MERGE (read CDF from upstream, MERGE into downstream).",
      code: "-- Enable CDF, then read only the changes between versions\nALTER TABLE main.bronze.claims SET TBLPROPERTIES (delta.enableChangeDataFeed = true);\n\nchanges = (spark.read.format(\"delta\")\n  .option(\"readChangeFeed\", \"true\")\n  .option(\"startingVersion\", 41)\n  .table(\"main.bronze.claims\"))   # _change_type: insert/update_preimage/update_postimage/delete",
      noteLabel: "Model answer:",
      note: "\"Change Data Feed makes a Delta table emit row-level changes — inserts, pre/post update images, deletes — so a downstream layer reads only what changed since its last version instead of rescanning the whole upstream table. That's how I build incremental medallion pipelines: silver consumes bronze's CDF and MERGEs the changes forward, gold consumes silver's, so each hop touches only deltas. It's also a clean way to feed changes to an external system. The pairing I lean on is CDF upstream + MERGE downstream for efficient, idempotent incremental propagation.\"",
      followups: [
        { q: "\"How would you make silver update incrementally from bronze instead of full recompute?\"", a: "Enable Change Data Feed on bronze and read only the rows changed since silver's last version, then MERGE them forward — each hop touches only deltas rather than rescanning the whole table." },
        { q: "\"What change types does CDF emit and why are pre/post images useful?\"", a: "insert, update_preimage, update_postimage, and delete. The pre/post images let a consumer see both the old and new values of an updated row, which is needed for correct downstream merges and aggregations." },
        { q: "\"CDF vs just reading the table with a Structured Streaming source — when each?\"", a: "A streaming source gives you appended rows; CDF gives full row-level changes including updates (pre/post) and deletes. Use CDF when you must propagate updates/deletes, a plain stream when append-only is enough." }
      ]
    }
  ]
},

ingestion: {
  intro: {
    title: "Ingestion & streaming — Auto Loader, Structured Streaming, COPY INTO",
    desc: "How data actually lands and moves on Databricks: Auto Loader for incremental file ingestion, Structured Streaming for continuous pipelines with exactly-once, and COPY INTO for idempotent batch. This is where your Kafka/CDC and file-ingestion resume stories live in Databricks terms."
  },
  cards: [
    {
      title: "Auto Loader — incremental file ingestion done right",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Auto Loader (the cloudFiles source) incrementally ingests new files from object storage as they arrive, without you tracking what's been processed — it maintains that state itself (via checkpoints, and optionally cloud file-notification queues instead of listing directories, which scales to millions of files). It handles schema inference and schema evolution at the bronze edge, and rescue-columns malformed data instead of failing. It's the modern replacement for hand-rolled 'list the directory and diff against what I loaded' jobs, and the standard way to feed bronze. Exactly-once into Delta comes from the checkpoint + Delta's atomic commits.",
      code: "(spark.readStream.format(\"cloudFiles\")\n   .option(\"cloudFiles.format\", \"json\")\n   .option(\"cloudFiles.schemaLocation\", \"/chk/schema/claims\")   # tracks/evolves schema\n   .option(\"cloudFiles.useNotifications\", \"true\")               # queue, not dir-listing\n   .load(\"/Volumes/main/raw/claims/\")\n   .writeStream.option(\"checkpointLocation\", \"/chk/bronze/claims\")\n   .trigger(availableNow=True)                                   # process all new, then stop\n   .toTable(\"main.bronze.claims\"))",
      noteLabel: "Model answer:",
      note: "\"Auto Loader incrementally picks up new files from object storage and tracks processed state itself via a checkpoint, so I don't hand-roll a 'diff the directory against what I've loaded' job. At scale I switch it from directory listing to cloud file notifications so it handles millions of files. It infers and evolves schema and rescues bad records at the bronze edge where drift is expected. Exactly-once into Delta falls out of the checkpoint plus Delta's atomic commits. I often run it with trigger availableNow for a batch-style 'process everything new then stop' job, or continuously for low latency.\"",
      followups: [
        { q: "\"How does Auto Loader know which files it's already processed?\"", a: "It maintains processed-file state itself in its checkpoint, so it only picks up genuinely new files — no hand-rolled directory diffing." },
        { q: "\"Directory listing vs file notifications — when does the difference matter?\"", a: "At scale: directory listing gets expensive with millions of files, so switch to cloud file-notification queues (cloudFiles.useNotifications) for efficient discovery at high volume." },
        { q: "\"How do you get exactly-once from files into a bronze Delta table?\"", a: "The Auto Loader checkpoint tracks processed files/offsets and Delta commits atomically, so each file is ingested exactly once even across restarts." }
      ]
    },
    {
      title: "Structured Streaming — continuous pipelines & exactly-once",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Structured Streaming treats a stream as an unbounded table you write incremental queries against — same DataFrame API as batch. The engine tracks progress in a CHECKPOINT (offsets + state), so on restart it resumes exactly where it left off; combined with idempotent Delta sinks this gives exactly-once. Key knobs: triggers (processingTime for micro-batches, availableNow for batch-drain, continuous rarely), output modes (append/update/complete), and watermarks (to bound state for windowed aggregations/late data and let old state expire). For Kafka/CDC ingestion you readStream from Kafka, transform, and writeStream/MERGE into Delta with a checkpoint — that's the resilient replication pattern.",
      code: "(spark.readStream.format(\"kafka\")\n   .option(\"subscribe\", \"claims-cdc\").load()\n   .transform(parse_and_clean)\n   .writeStream\n   .option(\"checkpointLocation\", \"/chk/silver/claims\")   # offsets+state => exactly-once on restart\n   .foreachBatch(merge_into_silver)                        # idempotent MERGE per micro-batch\n   .trigger(processingTime=\"1 minute\").start())",
      noteLabel: "Model answer:",
      note: "\"Structured Streaming is the same DataFrame API over an unbounded input; the engine checkpoints offsets and state, so a restart resumes exactly where it stopped, and with an idempotent Delta sink that's exactly-once. For CDC/Kafka replication I readStream from the topic, parse, and in foreachBatch run a MERGE into silver keyed on the business id — so even a replayed micro-batch can't duplicate. Watermarks bound the state for any windowed logic and expire late data, and I pick the trigger by latency need — a one-minute micro-batch for near-real-time, availableNow when I want batch semantics. That's how I'd frame the Cedar Gate cross-region CDC replication on Databricks.\"",
      followups: [
        { q: "\"Where does exactly-once actually come from in a Kafka→Delta stream?\"", a: "The checkpoint stores Kafka offsets and state so a restart resumes exactly where it stopped, combined with an idempotent Delta sink (a keyed MERGE) so a replayed micro-batch can't double-apply." },
        { q: "\"What's a watermark and what breaks without one in a windowed aggregation?\"", a: "A watermark declares how late event-time data can arrive, letting the engine finalize windows and evict old state. Without one, windowed state grows unbounded until the job OOMs." },
        { q: "\"Why run the MERGE inside foreachBatch instead of a plain streaming append?\"", a: "foreachBatch exposes each micro-batch as a DataFrame you can MERGE by business key — giving idempotent upserts (apply updates/deletes, no duplicates on replay); a plain append can only add rows." }
      ]
    },
    {
      title: "Stateful streaming — aggregations, stream-stream joins, and bounding state",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Stateless streaming (map/filter, then write) is easy; STATEFUL streaming is where seniors are tested. Windowed aggregations, deduplication, and stream-stream joins all keep STATE in the stream between micro-batches, and that state must be bounded or it grows forever. The tool is the WATERMARK: it tells the engine how late data can arrive, so it can finalize windows and evict old state. Stream-stream joins need a watermark on both sides plus a time constraint so the engine knows when it can stop buffering unmatched rows. For arbitrary custom state (sessionization, state machines) you use flatMapGroupsWithState / applyInPandasWithState. Databricks backs this with a RocksDB state store so state can exceed executor memory.",
      code: "from pyspark.sql import functions as F\n# Windowed count with a watermark so old state is evicted (bounded)\n(events.withWatermark(\"event_ts\", \"10 minutes\")\n   .groupBy(F.window(\"event_ts\", \"5 minutes\"), \"provider_id\")\n   .count())\n\n# Stream-stream join: watermark BOTH sides + a time bound so buffers drain\nclaims.withWatermark(\"claim_ts\", \"1 hour\").join(\n  payments.withWatermark(\"pay_ts\", \"2 hours\"),\n  F.expr(\"claim_id = ref_claim_id AND pay_ts BETWEEN claim_ts AND claim_ts + interval 1 hour\"))",
      noteLabel: "Model answer:",
      note: "\"Stateless streams are trivial; the senior questions are about state. Windowed aggregations, dedup, and stream-stream joins all hold state across micro-batches, and unbounded state is the classic production failure — OOM or ever-growing checkpoints. So I set a watermark on the event-time column to declare how late data can be, which lets Spark finalize windows and evict expired state. A stream-stream join needs watermarks on both sides plus a time-bounded join condition so the engine knows when to stop buffering unmatched rows. For custom stateful logic like sessionization I use applyInPandasWithState, and on Databricks the RocksDB state store lets that state spill beyond memory. The interview tell is naming the watermark as the thing that bounds state.\"",
      followups: [
        { q: "A windowed streaming aggregation's state keeps growing until it OOMs. Cause and fix?", a: "No watermark (or one too loose), so the engine never finalizes windows and evicts old state. Add withWatermark on the event-time column with a tolerance matching real lateness, so completed windows and their state are dropped." },
        { q: "Why does a stream-stream join need a watermark on both streams?", a: "Each side buffers rows waiting for a match on the other. Without watermarks plus a time-bounded join condition, the engine can never decide a row will get no future match, so buffers grow unbounded. Watermarks + a time range let it drop rows past the join window." },
        { q: "When do you reach for applyInPandasWithState instead of built-in windows?", a: "When the state logic isn't a standard window/aggregation — sessionization with custom gap logic, a per-key state machine, or custom timeout handling. It gives you arbitrary per-group state with explicit timeout control, at the cost of writing and managing that state yourself." }
      ]
    },
    {
      title: "COPY INTO & batch idempotency",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "COPY INTO is a SQL command for idempotent batch loading from files into a Delta table — it tracks which files it has already ingested, so re-running skips them (retry-safe) without the streaming machinery. It's the right tool for periodic bulk loads and simple SQL-driven ingestion where you don't need continuous processing. The decision vs Auto Loader: COPY INTO for straightforward, lower-frequency batch loads driven from SQL; Auto Loader when you have high file volume, want streaming/near-real-time, or need robust schema evolution and notification-based discovery.",
      noteLabel: "Model answer:",
      note: "\"COPY INTO is idempotent SQL batch loading — it remembers the files it already ingested, so a rerun skips them and it's safe to retry without duplicating. I use it for periodic bulk loads and simple SQL-first ingestion. I reach for Auto Loader instead when file volume is high, I want near-real-time or streaming semantics, or I need strong schema evolution and notification-based file discovery. Both give idempotent ingestion into Delta; COPY INTO is the lighter, batch-SQL option and Auto Loader is the scalable streaming one.\"",
      followups: [
        { q: "\"COPY INTO vs Auto Loader — give me the deciding factors.\"", a: "COPY INTO for straightforward, lower-frequency SQL-driven batch loads; Auto Loader for high file volume, streaming/near-real-time, or robust schema evolution and notification-based discovery. Both are idempotent into Delta." },
        { q: "\"How does COPY INTO avoid double-loading a file on a retry?\"", a: "It tracks which files it has already ingested, so a rerun skips them — making the load retry-safe without duplicating." },
        { q: "\"When is streaming overkill and a batch COPY INTO the honest choice?\"", a: "For periodic bulk loads where you don't need continuous processing or low latency — a simple SQL COPY INTO is lighter than standing up checkpointed streaming machinery." }
      ]
    }
  ]
},

dlt: {
  intro: {
    title: "Delta Live Tables — declarative pipelines with built-in quality",
    desc: "DLT (now 'Lakehouse Pipelines') lets you declare the tables and their transformations and lets Databricks manage the execution, dependencies, and infrastructure — with data-quality expectations as first-class citizens. This maps directly onto your validation/reconciliation and pipeline-migration resume bullets."
  },
  cards: [
    {
      title: "What DLT is — declare tables, not orchestration",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "In DLT you write declarative table definitions — each table is a query over other tables — and DLT infers the dependency DAG, manages the cluster, handles incremental vs full computation, retries, and monitoring for you. Streaming tables ingest incrementally (append/CDC); materialized views recompute results when inputs change. You stop writing orchestration glue (task ordering, checkpoints, error handling) and instead declare the target state; DLT figures out how to maintain it. It's the managed, opinionated way to build medallion pipelines versus hand-wiring notebooks in Workflows.",
      code: "import dlt\nfrom pyspark.sql.functions import col\n\n@dlt.table(comment=\"Cleaned claims\")\ndef silver_claims():\n    return (dlt.read_stream(\"bronze_claims\")\n              .where(col(\"claim_id\").isNotNull())\n              .withColumn(\"amount\", col(\"amount\").cast(\"double\")))\n# DLT infers silver_claims depends on bronze_claims and manages the run.",
      noteLabel: "Model answer:",
      note: "\"DLT is declarative pipelines — I define each table as a query over upstream tables and DLT builds the dependency DAG, manages the cluster, decides incremental vs full recompute, and handles retries and monitoring. Streaming tables ingest incrementally; materialized views refresh when inputs change. So instead of hand-wiring task order, checkpoints, and error handling in notebooks, I declare the medallion targets and DLT maintains them. I'd frame the Cedar Gate batch-to-orchestrated migration as exactly this move — from imperative scripts to a declarative, managed pipeline with quality built in.\"",
      followups: [
        { q: "\"What does DLT manage for you that you'd hand-code in a Workflows-of-notebooks setup?\"", a: "The dependency DAG, cluster management, incremental-vs-full recompute decisions, checkpoints, retries, and monitoring — you declare the target tables instead of wiring task order and error handling by hand." },
        { q: "\"Streaming table vs materialized view in DLT — when each?\"", a: "Streaming table for incremental append/CDC ingestion of new data; materialized view when the result should recompute as its inputs change (aggregations/joins over the full set)." },
        { q: "\"How does DLT know the order to build your tables?\"", a: "It infers the dependency DAG from the table definitions — each table is a query referencing others — and builds them in that inferred order." }
      ]
    },
    {
      title: "Expectations — data quality as code",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "DLT expectations are declarative data-quality rules attached to a table: a boolean constraint plus an action. expect (warn/track but keep the row), expect_or_drop (drop violating rows), expect_or_fail (halt the pipeline). Metrics on pass/fail rates are captured automatically and visible in the pipeline UI, so quality is observable over time, not a one-off script. This is the native answer to 'how do you enforce data quality' — and it maps straight onto the validation/reconciliation framework on your resume: not-null keys, valid amounts, referential checks, all as expectations gating the load.",
      code: "@dlt.table\n@dlt.expect_or_drop(\"valid_id\", \"claim_id IS NOT NULL\")\n@dlt.expect_or_drop(\"positive_amount\", \"amount >= 0\")\n@dlt.expect(\"known_provider\", \"provider_id IS NOT NULL\")   # warn+track, keep row\ndef silver_claims():\n    return dlt.read_stream(\"bronze_claims\")\n# Drop rows failing hard rules; track soft ones; metrics surface in the pipeline UI.",
      noteLabel: "Model answer:",
      note: "\"Expectations are DQ rules declared on the table: a condition plus an action — expect to warn and track, expect_or_drop to quarantine bad rows, expect_or_fail to stop the pipeline on a critical breach. DLT records pass/fail rates automatically so quality is a monitored metric, not a script someone forgets to run. That's precisely the validation-and-reconciliation framework from Cedar Gate expressed natively: not-null and positive-amount as hard drops or fails, softer referential checks as tracked warnings — and because it's in the pipeline, bad claims never silently reach the billing/reporting layer.\"",
      followups: [
        { q: "\"Which expectation action for a null primary key vs a slightly-off reference value?\"", a: "expect_or_drop (or expect_or_fail) for the null key — a hard breach you quarantine or halt on; expect (warn/track, keep the row) for the softer reference value." },
        { q: "\"How do you see whether data quality is degrading over time?\"", a: "DLT captures pass/fail rates for every expectation automatically and surfaces them in the pipeline UI, so quality is a monitored, alertable metric rather than a one-off script." },
        { q: "\"Where do dropped/quarantined rows go and how do you reprocess them?\"", a: "Rows failing expect_or_drop are dropped from the target; route them to a quarantine table (via a separate expectation/branch) so you can inspect, fix the source, and reprocess." }
      ]
    },
    {
      title: "APPLY CHANGES INTO — declarative CDC & SCD in DLT",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "DLT's native CDC: APPLY CHANGES INTO takes a change feed and maintains the target table for you — you declare the key, the sequencing column (to order out-of-order changes), and whether you want SCD Type 1 (overwrite, current state) or Type 2 (full history with __START_AT/__END_AT). DLT handles the MERGE mechanics, ordering, and deletes. So instead of hand-writing foreachBatch + MERGE + tie-break logic, you declare intent and DLT does the idempotent upsert. It's the DLT answer to everything the Delta MERGE card does manually, and the reason a DLT shop rarely hand-rolls SCD.",
      code: "import dlt\ndlt.create_streaming_table(\"silver_claims\")\ndlt.apply_changes(\n  target = \"silver_claims\",\n  source = \"bronze_claims_cdc\",\n  keys = [\"claim_id\"],\n  sequence_by = \"commit_ts\",          # orders out-of-order changes\n  apply_as_deletes = \"op = 'D'\",       # handle deletes\n  stored_as_scd_type = 2)              # 2 = full history; 1 = current state only",
      noteLabel: "Model answer:",
      note: "\"APPLY CHANGES INTO is DLT's declarative CDC — I give it the key, a sequence_by column so late/out-of-order changes apply in the right order, a delete condition, and SCD type 1 or 2, and DLT maintains the target: the MERGE, the ordering, the delete handling, the Type-2 __START_AT/__END_AT bookkeeping. It's the managed version of the hand-rolled foreachBatch-plus-MERGE pattern — same idempotency and ordering guarantees, far less code. In a DLT shop this is how CDC into silver and SCD dimensions are actually built; I only drop to manual MERGE when I need logic APPLY CHANGES can't express.\"",
      followups: [
        { q: "How does APPLY CHANGES handle changes that arrive out of order?", a: "The sequence_by column defines event order, so DLT applies the latest by sequence and won't let a stale update overwrite a newer one — the same regression protection you'd hand-code with a sequence/LSN in a manual MERGE." },
        { q: "SCD Type 1 vs Type 2 here — what changes in the output?", a: "Type 1 keeps only current state (overwrites in place). Type 2 keeps full history, adding __START_AT/__END_AT (and a current flag) so you can query the row as-of any time — DLT manages the version chaining for you." },
        { q: "When would you still hand-roll a MERGE instead of using APPLY CHANGES?", a: "When the upsert logic is non-standard — multi-table transactional writes, custom conflict resolution, or transformations that don't fit the key+sequence+SCD model. For plain CDC/SCD, APPLY CHANGES is less code and less risk." }
      ]
    },
    {
      title: "When DLT vs hand-rolled Workflows",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "DLT shines for medallion ETL where you want managed incrementality, built-in quality, auto-dependency management, and less operational code — the common case. You stay with imperative Workflows (notebooks/JARs as tasks) when you need arbitrary logic DLT's model doesn't express well, tight control over cluster/execution, integration steps that aren't table transformations (call an API, trigger an external system, run ML training), or you're orchestrating heterogeneous work beyond table-building. Many real setups combine them: DLT for the data pipeline, Workflows to orchestrate DLT alongside other tasks.",
      noteLabel: "Model answer:",
      note: "\"DLT is my default for medallion ETL — I get managed incrementality, expectations, and dependency inference with far less orchestration code. I stay imperative in Workflows when the work isn't just table transformations: arbitrary logic, calling external systems, ML training, or when I need fine control over clusters and execution. In practice I often combine them — DLT owns the data-transformation pipeline, and a Workflow orchestrates that pipeline alongside the non-table steps. The trade is the usual declarative-vs-imperative one: less control, less code with DLT; more control, more glue with Workflows.\"",
      followups: [
        { q: "\"Your pipeline needs to call an external claims-scrubbing API mid-flow. DLT or Workflows?\"", a: "Workflows — calling an external API isn't a table transformation, which is where DLT's declarative model fits. Often combine both: DLT for the data pipeline, a Workflow to orchestrate it alongside the API call." },
        { q: "\"What do you give up by going declarative with DLT?\"", a: "Fine-grained control over cluster/execution and the ability to express arbitrary non-table logic — the usual declarative trade of less control for less code." },
        { q: "\"How would you combine DLT and Workflows in one production setup?\"", a: "DLT owns the medallion data-transformation pipeline; a Workflow orchestrates that DLT pipeline alongside non-table steps like API calls, ML training, or external triggers." }
      ]
    }
  ]
},

workflows: {
  intro: {
    title: "Workflows — orchestrating jobs on Databricks",
    desc: "Databricks Workflows (Jobs) is the native orchestrator: multi-task DAGs, job clusters, retries, parameters, and scheduling. The recurring interview theme is Workflows vs Airflow — which reframes your batch-to-Airflow migration story for a Databricks shop."
  },
  cards: [
    {
      title: "Jobs & multi-task Workflows",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A Databricks Job (Workflow) is a DAG of TASKS — each task runs a notebook, Python script/wheel, JAR, SQL query, DLT pipeline, or dbt project — with declared dependencies so they run in order and in parallel where independent. Tasks can share a job cluster (spun up for the run, torn down after) or use separate clusters. You get scheduling (cron/quartz), parameters passed to tasks, and task values to pass small data between tasks. It's the native, Databricks-aware orchestrator: it knows about clusters, DLT, and Unity Catalog in a way an external scheduler doesn't.",
      noteLabel: "Model answer:",
      note: "\"A Workflow is a DAG of tasks — notebooks, wheels, JARs, SQL, a DLT pipeline, or a dbt project — with dependencies so they order correctly and parallelize where they can. I run production jobs on a job cluster that's created for the run and terminated after, for cost and isolation. It handles cron scheduling, per-task parameters, retries, and passing small values between tasks. The advantage over an external scheduler is that it's Databricks-native — it understands job clusters, DLT pipelines, and Unity Catalog directly, so there's less glue.\"",
      followups: [
        { q: "How do tasks in a Workflow share compute, and what's the cost-smart choice?", a: "Tasks can share a single job cluster (created for the run and terminated after) or use separate clusters; sharing one job cluster across tasks is the cost-smart default because it avoids repeated spin-up and idle compute, with separate clusters reserved for tasks that have conflicting resource needs." },
        { q: "How do you pass a value produced by one task into the next?", a: "Task values (dbutils.jobs.taskValues set/get) pass small values between tasks; anything larger is handed off by writing to a Delta table the downstream task reads." },
        { q: "What task types can a Workflow run besides notebooks?", a: "A task can run a notebook, a Python script/wheel, a JAR, a SQL query/file, a DLT pipeline, or a dbt project — which is why Workflows can orchestrate a whole pipeline natively." }
      ]
    },
    {
      title: "Reliability — retries, repair runs, idempotency",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Production orchestration is about failure. Workflows gives per-task retries with backoff, timeouts, alerting/notifications on failure, and — crucially — REPAIR RUN, which re-runs only the failed tasks (and their downstream) rather than the whole job, so a 10-task pipeline that failed on task 8 doesn't redo 1–7. But the orchestrator can only retry safely if your tasks are IDEMPOTENT: a retried task must not double-apply. That's why the loads are MERGE/upsert on a business key and ingestion is checkpointed — the same idempotency discipline as any Airflow pipeline, just enforced here.",
      noteLabel: "Model answer:",
      note: "\"Workflows gives me per-task retries with backoff, timeouts, failure alerts, and repair run — which re-runs only the failed task and its downstream instead of the entire job, so a failure at task 8 of 10 doesn't recompute 1 through 7. But retries are only safe if tasks are idempotent, so my loads are MERGE on the business key and my ingestion is checkpointed — a replayed task then can't duplicate. It's the same idempotency-first discipline I applied to the Airflow migration: design every step to be safely re-runnable, then let the orchestrator retry freely.\"",
      followups: [
        { q: "A 12-task job fails on task 10. How do you avoid rerunning the first 9?", a: "Use repair run, which re-executes only the failed task and its downstream dependents, so tasks 1–9 aren't recomputed." },
        { q: "Why is idempotency a precondition for safe automatic retries?", a: "A retry re-executes the task, so unless it's idempotent the replay double-applies data; idempotency (MERGE/upsert on a business key, checkpointed ingestion) is what lets the orchestrator retry freely without corruption." },
        { q: "What makes a load task idempotent on Databricks?", a: "Writing via Delta MERGE/upsert keyed on the business id rather than a blind append, plus checkpointed ingestion, so re-running the same batch updates in place instead of creating duplicates." }
      ]
    },
    {
      title: "Databricks Workflows vs Airflow",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Workflows is native — zero extra infrastructure, deeply integrated with clusters/DLT/Unity Catalog/notebooks, and the simplest path when everything you orchestrate lives on Databricks. Airflow (or MWAA/Astronomer) wins when you orchestrate a HETEROGENEOUS estate — Databricks plus external systems, APIs, other warehouses, on-prem — need its rich operator ecosystem and complex scheduling/backfill semantics, or the org already standardizes on it. A very common pattern is Airflow as the enterprise orchestrator triggering Databricks jobs via the Databricks operator, so Databricks does the compute and Airflow coordinates the cross-system DAG.",
      noteLabel: "Model answer:",
      note: "\"If everything I orchestrate is on Databricks, Workflows is the simplest choice — no extra infra and native integration with clusters, DLT, and Unity Catalog. I reach for Airflow when the DAG spans a heterogeneous estate — Databricks plus external APIs, other warehouses, on-prem — or I need its operator ecosystem and richer backfill/scheduling, or the company already runs it. The pattern I've actually used is Airflow as the enterprise orchestrator triggering Databricks jobs through the Databricks operator: Databricks does the heavy compute, Airflow coordinates the cross-system dependencies. So it's not either/or — it's 'native for Databricks-only, Airflow for cross-system'.\"",
      followups: [
        { q: "Your pipeline touches Databricks, an on-prem SFTP, and Salesforce. Workflows or Airflow?", a: "Airflow (e.g. MWAA): the DAG spans a heterogeneous estate needing varied operators/connectors, so Airflow orchestrates the cross-system steps and triggers the Databricks compute via the Databricks operator." },
        { q: "How do Airflow and Databricks coexist in one architecture?", a: "Airflow is the enterprise orchestrator calling the Databricks Jobs API (through the Databricks operator), so Databricks does the heavy compute while Airflow coordinates the cross-system dependencies — not either/or." },
        { q: "What does Workflows do better than Airflow for a Databricks-only shop?", a: "It's native — no extra infrastructure and deep integration with clusters, DLT, Unity Catalog, and notebooks — so there's far less glue when everything you orchestrate already lives on Databricks." }
      ]
    }
  ]
},

unity: {
  intro: {
    title: "Unity Catalog — governance, lineage & access control",
    desc: "Unity Catalog (UC) is the unified governance layer over all data and AI assets. For a senior DE — especially one with HIPAA/PHI on the resume — this is where you prove you can govern sensitive data: the namespace model, fine-grained access control, lineage, and auditing."
  },
  cards: [
    {
      title: "The three-level namespace & the metastore",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Unity Catalog replaces the old two-level hive_metastore (schema.table, per-workspace) with a THREE-level namespace: catalog.schema.table, governed by a single METASTORE that spans workspaces in a region. So you reference main.silver.claims, and the same governed object is consistent across every workspace attached to that metastore — one place to manage permissions, lineage, and discovery instead of per-workspace chaos. Catalogs are the top grouping (often per environment or domain — e.g. prod, dev, or per business unit), schemas group tables, and UC also governs views, volumes, functions, and models.",
      noteLabel: "Model answer:",
      note: "\"Unity Catalog gives a three-level namespace — catalog.schema.table — under one metastore that spans all workspaces in a region, replacing the old per-workspace two-level hive_metastore. So main.silver.claims is the same governed object everywhere, with one place for permissions, lineage, and discovery. I use catalogs to separate environments or domains — prod vs dev, or per business unit — schemas to group tables, and UC also governs views, volumes, functions, and ML models. The win is centralized, consistent governance instead of reconciling permissions workspace by workspace.\"",
      followups: [
        { q: "\"What did the old hive_metastore make painful that UC fixes?\"", a: "It was two-level (schema.table) and per-workspace, so permissions, lineage, and discovery had to be reconciled workspace by workspace. UC's single metastore gives one consistent three-level namespace and governance across all workspaces in a region." },
        { q: "\"How would you lay out catalogs and schemas for prod/dev across two domains?\"", a: "Catalogs as the top grouping per environment/domain (e.g. prod and dev, or per business unit), with schemas grouping tables within each, so grants and isolation are managed at the catalog level." },
        { q: "\"Besides tables, what else does Unity Catalog govern?\"", a: "Views, volumes (files), functions, and ML models — all governed assets under the same namespace and permission model." }
      ]
    },
    {
      title: "Managed vs external tables, external locations & storage credentials",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "How UC actually reaches storage. A STORAGE CREDENTIAL is a UC object wrapping a cloud IAM role/identity; an EXTERNAL LOCATION binds that credential to a specific storage path (s3://.../claims) and is what you GRANT access on — so nobody uses raw keys. On top of that, tables are MANAGED (UC owns the data lifecycle and storage location; DROP TABLE deletes the data, and UC can auto-optimize/vacuum) or EXTERNAL (you point at data in a path you manage; DROP removes only the metadata, the files stay). Rule of thumb: prefer managed tables so UC governs the full lifecycle and can run predictive optimization; use external when the data is shared with non-Databricks tools or you must control the physical layout.",
      code: "-- Credential + external location = governed path access, no raw keys\nCREATE STORAGE CREDENTIAL claims_cred\n  WITH (IAM_ROLE 'arn:aws:iam::123:role/uc-claims');\nCREATE EXTERNAL LOCATION claims_loc\n  URL 's3://acme-lake/claims/' WITH (STORAGE CREDENTIAL claims_cred);\nGRANT READ FILES ON EXTERNAL LOCATION claims_loc TO `data_eng`;\n\n-- Managed: UC owns storage + lifecycle (DROP deletes data)\nCREATE TABLE main.silver.claims (...);\n-- External: you own the path (DROP keeps the files)\nCREATE TABLE main.silver.claims_ext (...) LOCATION 's3://acme-lake/claims/ext/';",
      noteLabel: "Model answer:",
      note: "\"UC reaches storage through a storage credential — a wrapped cloud IAM role — bound to an external location on a specific path, and you grant on that location, so there are no raw keys floating in notebooks. Then tables are managed or external: managed means UC owns the data and lifecycle, so DROP deletes the files and UC can auto-optimize and vacuum — I default to managed so governance and optimization are automatic. External means I point at a path I control and DROP only removes metadata — I use it when the data is shared with tools outside Databricks or I need to own the physical layout. Knowing that distinction is also a safety thing: DROP on a managed table deletes data, on external it doesn't.\"",
      followups: [
        { q: "You DROP a table and the files vanish. Was it managed or external, and why?", a: "Managed — UC owns the data lifecycle, so DROP deletes the underlying files. On an external table DROP removes only the metadata and the files remain, which is exactly why external is safer for data shared with other tools." },
        { q: "Why use external locations + storage credentials instead of mounting with keys?", a: "They're governed UC objects: access is granted and audited per location, credentials are centrally managed (no keys in notebooks), and it integrates with lineage — the modern replacement for /mnt mounts with embedded keys." },
        { q: "When would you deliberately choose external tables over managed?", a: "When non-Databricks tools read the same files, when you need explicit control of the physical path/layout (e.g. a fixed partition scheme other systems expect), or during a migration where the data already lives in a path you don't want UC to own yet." }
      ]
    },
    {
      title: "Access control — grants, and securing PHI/PII",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "UC does fine-grained, SQL-standard access control: GRANT/REVOKE on catalogs, schemas, tables, views, down to ROW filters and COLUMN masks, assigned to users/groups. For sensitive data (PHI/PII), the toolkit is: least-privilege grants per group, dynamic VIEWS that expose only permitted columns, column masking functions (e.g. mask SSN unless the caller is in a privileged group), and row-level filters (a user sees only their region's claims). Because governance is centralized, these controls apply consistently across SQL, notebooks, and BI — you're not re-implementing masking in every tool.",
      code: "-- Least-privilege grant to an analyst group\nGRANT SELECT ON TABLE main.gold.claims_summary TO `analysts`;\n\n-- Column mask: only compliance sees raw MRN, others get NULL\nCREATE FUNCTION main.sec.mask_mrn(mrn STRING)\n  RETURN CASE WHEN is_account_group_member('compliance') THEN mrn ELSE NULL END;\nALTER TABLE main.silver.claims ALTER COLUMN mrn SET MASK main.sec.mask_mrn;",
      noteLabel: "Model answer:",
      note: "\"UC is SQL-standard GRANT/REVOKE from catalog down to row and column level. For PHI I work least-privilege by group, then layer column masking — a masking function that returns the raw MRN/SSN only if the caller is in a compliance group and NULL otherwise — and row filters so, say, a regional analyst only sees their region's claims. The reason this matters over per-tool controls is that UC enforces it centrally, so the same masking applies whether someone hits the table from SQL, a notebook, or Power BI — I'm not re-implementing HIPAA controls in every access path, which is exactly the consistency an auditor wants.\"",
      followups: [
        { q: "\"Analysts must see claims but never the raw SSN. How do you implement that?\"", a: "A column mask: a UC masking function that returns the raw SSN only if the caller is in a privileged (compliance) group and NULL otherwise, applied to the column — enforced centrally across SQL, notebooks, and BI." },
        { q: "\"A user should only see their own facility's rows. Which UC feature?\"", a: "Row-level filters — a row filter function so each user sees only rows matching their facility/region." },
        { q: "\"Why is centralized governance better than masking in each BI tool?\"", a: "UC enforces the controls at the data layer, so the same masking/row filters apply across every access path — SQL, notebooks, Power BI — instead of being re-implemented, and inconsistently, per tool." }
      ]
    },
    {
      title: "Lineage, auditing & discovery",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "UC automatically captures column-level LINEAGE — which tables/columns feed which, down to the notebook/job that produced them — and an AUDIT log of who accessed what. For a regulated pipeline this is gold: you can prove where PHI flows end to end (source → bronze → silver → gold → dashboard), do impact analysis before a schema change ('what breaks if I drop this column?'), and answer 'who queried this sensitive table' for compliance. It also powers discovery/search so consumers find governed data instead of copying it around. This directly supports the HIPAA audit and data-lineage documentation on your resume.",
      noteLabel: "Model answer:",
      note: "\"UC auto-captures column-level lineage — every table and column traced to the job/notebook that produced it — plus an audit log of access. For regulated claims data that answers the questions auditors actually ask: where does PHI flow from source to dashboard, and who touched this table. It also lets me do impact analysis before changing a schema — see every downstream consumer of a column before I drop it — and it powers discovery so teams find and reuse governed tables instead of copying data around. This is the automated version of the lineage and HIPAA-audit documentation I maintained by hand at Cedar Gate.\"",
      followups: [
        { q: "\"An auditor asks you to prove where PHI flows. How does UC answer that?\"", a: "UC's automatic column-level lineage traces every table/column to the job or notebook that produced it, so you can show PHI flowing source → bronze → silver → gold → dashboard end to end." },
        { q: "\"Before dropping a column, how do you find everything that depends on it?\"", a: "Use UC's column-level lineage for impact analysis — it shows every downstream table, view, and consumer of that column before you change it." },
        { q: "\"How does automatic lineage change your data-governance workload vs documenting by hand?\"", a: "It's captured automatically and stays current, replacing manually-maintained lineage/HIPAA-audit docs that drift — governance becomes a query rather than a documentation chore." }
      ]
    }
  ]
},

sqlwarehouse: {
  intro: {
    title: "Databricks SQL & Photon — the BI/analytics surface",
    desc: "Databricks SQL brings warehouse-style querying, dashboards, and BI connectivity to the Lakehouse, powered by SQL Warehouses and the Photon engine. The interview angle: when you serve BI from a SQL Warehouse vs run a job cluster, and what Photon actually does."
  },
  cards: [
    {
      title: "SQL Warehouses — classic, pro, serverless",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A SQL Warehouse is compute tuned for concurrent SQL/BI over Delta tables. Three flavors: CLASSIC (in your account, slowest to start), PRO (more features, still your account), SERVERLESS (runs in Databricks' account, starts in seconds, best for spiky/interactive BI because it scales fast and you don't pay for idle warm-up). Warehouses auto-scale out to handle query concurrency and auto-stop when idle to save cost. You point BI tools (Power BI, Tableau) and the SQL editor at them. The choice is mostly serverless-for-interactive-BI vs classic/pro when data-residency requires compute in your own account.",
      noteLabel: "Model answer:",
      note: "\"A SQL Warehouse is compute built for concurrent SQL and BI on Delta. Serverless is my default for interactive BI — it starts in seconds and scales fast, so analysts aren't waiting on a cold cluster and I'm not paying to keep one warm; it auto-scales for concurrency and auto-stops when idle. I use classic or pro when data-residency rules require the compute to run in our own cloud account rather than Databricks'. I point Power BI/Tableau and the SQL editor at the warehouse. So the decision is mostly serverless for spiky interactive BI, in-account when compliance dictates.\"",
      followups: [
        { q: "\"Analysts complain the first query each morning is slow. Which warehouse type helps and why?\"", a: "Serverless — it starts in seconds from Databricks' warm pool, so there's no cold-cluster wait on the first morning query, unlike classic/pro which provision in your account." },
        { q: "\"What makes serverless start faster than a classic warehouse?\"", a: "The compute runs in Databricks' account from pre-warmed capacity, so there's no VM provisioning wait in your own account — startup drops from minutes to seconds." },
        { q: "\"When would data-residency push you off serverless?\"", a: "When compliance requires compute to run inside your own cloud account/VPC; serverless runs in Databricks' account, so you use classic or pro instead." }
      ]
    },
    {
      title: "Photon — the vectorized engine",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Photon is Databricks' C++ vectorized query engine that replaces parts of the JVM-based Spark execution for SQL and DataFrame workloads — it processes data in columnar batches using SIMD, so scans, filters, joins, and aggregations run substantially faster and cheaper on the same hardware. It's transparent: same SQL/DataFrame code, you just enable Photon on the cluster/warehouse. It accelerates SQL-style analytical work most; it doesn't speed up arbitrary Python UDFs (those still run in Python). The senior framing: Photon is why Databricks SQL competes with dedicated warehouses on BI performance, and it changes the cost equation because faster completion = fewer DBU-seconds.",
      noteLabel: "Model answer:",
      note: "\"Photon is a native C++ vectorized engine that replaces parts of JVM Spark for SQL/DataFrame work — columnar, SIMD, batch-at-a-time — so scans, joins, and aggregations run several times faster on the same nodes. It's transparent: I enable it and my existing SQL/DataFrame code just runs faster, which also lowers cost because the job finishes in fewer DBU-seconds. The caveat is it accelerates analytical SQL, not arbitrary Python UDFs, which still execute in Python — another reason to prefer native functions. Photon is a big part of why Databricks SQL can compete with dedicated warehouses on BI.\"",
      followups: [
        { q: "\"Photon is on but your Python-UDF-heavy job didn't speed up. Why?\"", a: "Photon accelerates native SQL/DataFrame operations; a row-at-a-time Python UDF still executes in Python outside the vectorized engine, so it doesn't benefit. Use native functions instead." },
        { q: "\"How can enabling Photon reduce cost even though it's the same cluster?\"", a: "It finishes the work in fewer DBU-seconds — faster completion on the same hardware means less billed compute time." },
        { q: "\"What kinds of queries benefit most from Photon?\"", a: "Analytical SQL/DataFrame work — scans, filters, joins, and aggregations — where vectorized columnar/SIMD execution pays off." }
      ]
    },
    {
      title: "SQL Warehouse vs job cluster — which for what",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Use a SQL WAREHOUSE for interactive, concurrent, low-latency SQL and BI — many analysts/dashboards hitting curated gold tables. Use a JOB CLUSTER for scheduled ETL/ML pipelines — the transformation work that builds bronze/silver/gold, often in PySpark, running once and terminating. Rough rule: warehouses serve the gold layer to humans/BI; job clusters produce the layers. Running heavy scheduled ETL on a SQL Warehouse, or serving hundreds of concurrent dashboards from an all-purpose cluster, are both the wrong tool.",
      noteLabel: "Model answer:",
      note: "\"SQL Warehouse for the read/serve side — interactive, concurrent BI and SQL on gold tables, with auto-scaling for concurrency. Job cluster for the write/build side — scheduled PySpark/SQL ETL that produces bronze/silver/gold and then terminates. The clean rule I use: job clusters build the layers, warehouses serve the gold layer to people and BI tools. The anti-patterns are running big scheduled ETL on a warehouse or trying to serve hundreds of concurrent dashboards off an all-purpose cluster — matching the compute to the workload is a real cost and performance lever.\"",
      followups: [
        { q: "\"Nightly PySpark ETL vs a Power BI dashboard on gold — which compute for each?\"", a: "Job cluster for the nightly PySpark ETL (builds the layers, then terminates); SQL Warehouse for the Power BI dashboard (concurrent interactive reads of gold)." },
        { q: "\"Why not just serve BI from your always-on all-purpose dev cluster?\"", a: "It's the expensive interactive rate running 24/7 and isn't tuned for the SQL concurrency many dashboards need — a SQL Warehouse auto-scales for concurrency and auto-stops when idle." },
        { q: "\"How does auto-scaling differ in purpose between a warehouse and a job cluster?\"", a: "A warehouse scales out to handle query concurrency (more simultaneous users); a job cluster scales workers to parallelize a single job's data processing." }
      ]
    }
  ]
},

performance: {
  intro: {
    title: "Performance & cost — the levers that separate senior from mid",
    desc: "The tab that wins senior interviews: right-sizing and cluster choice, Spot/pools, Photon, and the Spark tuning (AQE, skew, broadcast, file sizing) that turns a slow expensive job into a fast cheap one. Frame it as your Amex cost/right-sizing story in Databricks terms."
  },
  cards: [
    {
      title: "Cluster sizing, autoscaling & when bigger doesn't help",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Right-sizing is matching the cluster to the job, not maxing it out. Autoscaling adds/removes workers between a min and max as load varies — great for variable stages, but it can't fix a job bottlenecked on one skewed task (more workers sit idle while one struggles). More/bigger nodes help work that parallelizes; they do nothing for a single hot partition, a driver-side collect(), or an I/O-bound small-files problem. The senior move is to diagnose WHY it's slow (Spark UI) before adding hardware — because scaling up a fundamentally skewed or serialized job just burns money.",
      noteLabel: "Model answer:",
      note: "\"Right-sizing means fitting the cluster to the job. Autoscaling handles variable load by adding workers within a range, but I know its limits: it can't help a job stuck on one skewed task or a driver-side collect — extra workers just idle. So before I scale up I read the Spark UI and find the real bottleneck: skew, a giant shuffle, small files, or driver work. Adding nodes only helps genuinely parallelizable work; throwing hardware at a skewed or serialized job just raises the bill without fixing runtime. That diagnose-then-size discipline is exactly how I approached cost right-sizing at Amex.\"",
      followups: [
        { q: "\"You doubled the cluster and the job got no faster. What are the likely reasons?\"", a: "The bottleneck doesn't parallelize: data skew on one hot task, a driver-side collect(), or an I/O-bound small-files problem — extra workers just idle. Diagnose in the Spark UI before scaling." },
        { q: "\"When does autoscaling help and when is it useless?\"", a: "It helps with variable, parallelizable load (adds workers when stages need them); it's useless against a single skewed task or driver-serialized work, where the extra workers idle." },
        { q: "\"What do you check before deciding a job needs a bigger cluster?\"", a: "The Spark UI for the real bottleneck — skew, a huge shuffle, small files, or driver work — since more hardware only helps genuinely parallelizable work." }
      ]
    },
    {
      title: "Cost control — job clusters, Spot, pools & policies",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The big cost levers on Databricks: (1) run production on JOB clusters (cheaper DBU rate, ephemeral) not all-purpose; (2) SPOT instances for workers with on-demand fallback for the driver — big discount, tolerant of interruption; (3) CLUSTER POOLS to keep warm instances ready so job clusters start in seconds instead of minutes (cuts idle-wait cost across many short jobs); (4) CLUSTER POLICIES to cap instance types/sizes and enforce auto-termination so teams can't spin giant always-on clusters; (5) auto-termination on idle. Plus Photon (finish faster = fewer DBU-seconds) and right layout (OPTIMIZE, fewer files) so jobs scan less. It's the same measure-biggest-spender-then-cut method as any cost work.",
      noteLabel: "Model answer:",
      note: "\"My cost toolkit: production on job clusters at the cheaper rate, not always-on all-purpose; Spot workers with on-demand driver for the discount without risking the whole job; cluster pools so short jobs start warm in seconds instead of paying minutes of spin-up; and cluster policies plus mandatory auto-termination so nobody leaves a giant cluster running. On top of that, Photon to finish in fewer DBU-seconds and OPTIMIZE/clustering so jobs scan less data. The method is the same one I used at Amex — find the biggest spender, change one thing, re-measure — governed here by policies so the savings stick instead of drifting back.\"",
      followups: [
        { q: "\"Which cluster nodes are safe on Spot and which aren't? Why?\"", a: "Workers are safe on Spot — they tolerate interruption and can be re-provisioned. Keep the driver on-demand, since losing the driver kills the whole job." },
        { q: "\"Teams keep spinning oversized always-on clusters. How do you stop that platform-wide?\"", a: "Cluster policies that cap instance types/sizes and enforce mandatory auto-termination, so the savings are governed and can't drift back." },
        { q: "\"Many tiny jobs each wait 4 minutes for cluster startup. What cuts that?\"", a: "Cluster pools — pre-warmed instances kept ready so job clusters start in seconds instead of minutes, cutting idle-wait cost across many short jobs." }
      ]
    },
    {
      title: "Spark tuning — AQE, skew, broadcast, caching",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The runtime levers for a slow job: ADAPTIVE QUERY EXECUTION (AQE, on by default) re-optimizes at runtime — coalescing shuffle partitions, switching join strategies, and splitting skewed partitions — so much tuning is automatic now. Beyond it: BROADCAST the small side of a join so the large side never shuffles (broadcast hash join); handle SKEW with AQE skew join or salting a hot key; CACHE/persist a DataFrame reused across multiple actions; and fix the SMALL-FILES problem with OPTIMIZE and sensible partition/file sizing (~128MB–1GB). And avoid the pipeline-killers: Python UDFs (use native/pandas UDFs), and stray collect()/count() that force full re-execution.",
      noteLabel: "Model answer:",
      note: "\"First I lean on AQE — it's on by default and already coalesces shuffle partitions, flips join strategies, and handles many skew cases at runtime. Beyond that: broadcast the small dimension so the big fact table doesn't shuffle; for a hot key AQE can't tame, salt it; cache a DataFrame only if it's reused across multiple actions; and cure small files with OPTIMIZE and 128MB–1GB target sizes. I also kill the usual culprits — replace row-at-a-time Python UDFs with native or pandas UDFs, and remove stray count()/display() that trigger extra full executions. Every change I verify in the Spark UI against runtime and shuffle metrics, not by guessing.\"",
      followups: [
        { q: "\"A large-table join is shuffling everything. First thing you try?\"", a: "Broadcast the small side (broadcast hash join) so the large table never shuffles — the biggest single win when one side fits in memory." },
        { q: "\"AQE is on but one task still runs 20x longer. What's left to do?\"", a: "It's skew AQE can't fully tame — salt the hot key to spread it across partitions, or split it out and handle it separately." },
        { q: "\"When does caching help and when is it just wasted memory?\"", a: "Caching helps only when an expensive DataFrame is reused across multiple actions; if it's used once, caching just consumes memory for no gain." }
      ]
    }
  ]
},

cicd: {
  intro: {
    title: "CI/CD & deployment — shipping Databricks code like software",
    desc: "The senior differentiator: you don't click-deploy notebooks, you version, test, and promote pipelines through environments with CI. This tab covers Asset Bundles, testing, environment promotion/Terraform, and the automation surface — the 'how does this get to prod safely' questions a 6+ YOE DE must answer."
  },
  cards: [
    {
      title: "Databricks Asset Bundles (DABs) — deploy pipelines as code",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A Databricks Asset Bundle is the current standard way to package a project — notebooks/wheels, job & DLT pipeline definitions, cluster config — as a YAML-defined unit you deploy from CI. One databricks.yml declares your resources (jobs, pipelines) and per-target overrides (dev/staging/prod: different catalogs, cluster sizes, schedules). `databricks bundle deploy -t prod` then creates/updates everything idempotently. It replaces the older dbx and hand-clicking jobs in the UI, and it's what makes a Databricks project reproducible, reviewable, and promotable instead of drifting between environments.",
      code: "# databricks.yml — one source of truth, per-env targets\nbundle: { name: claims_pipeline }\nresources:\n  jobs:\n    claims_etl:\n      tasks:\n        - task_key: silver\n          notebook_task: { notebook_path: ./src/silver.py }\ntargets:\n  dev:  { default: true, variables: { catalog: dev } }\n  prod: { variables: { catalog: prod },\n          resources: { jobs: { claims_etl: { schedule: { quartz_cron_expression: \"0 0 * * * ?\" } } } } }\n# CI runs:  databricks bundle validate && databricks bundle deploy -t prod",
      noteLabel: "Model answer:",
      note: "\"I ship with Asset Bundles. The whole project — job and DLT definitions, notebooks/wheels, cluster config — is declared in databricks.yml with per-target overrides so dev points at a dev catalog and small clusters while prod points at prod catalog, real schedules, and prod sizing. CI validates then runs `bundle deploy -t <env>`, which reconciles the resources idempotently, so there's no click-ops and no drift between environments. It replaced dbx as the standard. The point I'd make in an interview: my pipelines are Git-backed, PR-reviewed, and promoted by a command, not edited live in the prod workspace.\"",
      followups: [
        { q: "How do dev and prod differ in a bundle without duplicating the whole config?", a: "Targets: a shared resource definition plus per-target overrides (variables and resource patches). dev might use a dev catalog and no schedule; prod overrides the catalog, adds the cron schedule, and bumps cluster size — same base definition, environment-specific deltas." },
        { q: "What did Asset Bundles replace, and why move off it?", a: "dbx (and hand-configuring jobs in the UI). DABs are first-party, declarative, and cover jobs + DLT + config in one deploy unit with environment targets, so they're more complete and better supported than dbx." },
        { q: "How is a bundle deploy idempotent?", a: "It reconciles declared state against the workspace — creating what's missing, updating what changed, leaving matching resources alone — so re-deploying the same bundle is a no-op rather than creating duplicate jobs." }
      ]
    },
    {
      title: "Testing Databricks code — unit, integration & Databricks Connect",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Testable Databricks code means factoring transformation logic into pure functions in Python modules/wheels (not buried in notebook cells), so you can unit-test them with pytest — often against a local Spark session or with chispa for DataFrame equality — in CI, off-cluster. Databricks Connect lets you run code from your IDE/CI against a real Databricks cluster for integration tests that need actual Delta/UC behavior. The layering mirrors any pipeline: many fast unit tests on pure transforms, a few integration tests on the real platform, and DLT expectations as runtime data-quality gates. The anti-pattern is 'test by running the notebook and eyeballing output'.",
      code: "# transform lives in a module, imported by both the job and the test\ndef dedup_latest(df):\n    from pyspark.sql import Window, functions as F\n    w = Window.partitionBy(\"claim_id\").orderBy(F.col(\"updated_at\").desc())\n    return df.withColumn(\"rn\", F.row_number().over(w)).filter(\"rn = 1\").drop(\"rn\")\n\n# test_transforms.py (pytest, runs in CI)\ndef test_dedup_keeps_latest(spark):\n    src = spark.createDataFrame([(\"A\",1,\"old\"),(\"A\",2,\"new\")], \"claim_id string, updated_at int, v string\")\n    assert [r.v for r in dedup_latest(src).collect()] == [\"new\"]",
      noteLabel: "Model answer:",
      note: "\"I make logic testable by keeping transforms as pure functions in importable modules, not notebook cells — then pytest unit-tests them in CI against a local Spark session, using chispa for DataFrame equality, all off-cluster and fast. For the parts that need real platform behavior — Delta MERGE semantics, Unity Catalog permissions — I use Databricks Connect to run integration tests from CI against an actual cluster. Then DLT expectations are the runtime data-quality layer on top. So it's the same three tiers as any pipeline: lots of fast unit tests, a few integration tests on the real thing, and data-quality gates in production — never 'run the notebook and look at it'.\"",
      followups: [
        { q: "How do you unit-test transformation logic that normally runs in a notebook?", a: "Move the logic into a pure function in a Python module the notebook/job imports, then pytest it against a local SparkSession (asserting with chispa or by collecting rows). The notebook becomes a thin caller, and the logic is tested in CI without a cluster." },
        { q: "What does Databricks Connect give you that a local Spark session can't?", a: "Execution against a real Databricks cluster from your IDE/CI — so integration tests exercise actual Delta, Unity Catalog, Photon, and workspace behavior that a local Spark session can't reproduce." },
        { q: "Where do DLT expectations fit relative to pytest?", a: "They're complementary: pytest catches code bugs at deploy time; expectations catch bad data at runtime on every load. Code tests test your logic, expectations test the world's data." }
      ]
    },
    {
      title: "Environments, promotion & Terraform",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Two layers of infrastructure-as-code. Asset Bundles deploy the DATA project (jobs, pipelines, notebooks). The Databricks TERRAFORM PROVIDER manages the PLATFORM: workspaces, Unity Catalog metastores/catalogs/schemas, permissions/grants, clusters/policies, secret scopes — the governed foundation that rarely changes. Promotion flow: code lands via PR → CI runs tests → merge deploys the bundle to staging → after validation, promote to prod (a tagged release or manual approval gate). Environments are isolated by UC catalog (dev/staging/prod) and separate workspaces, so a dev job can't touch prod data. The senior signal is separating slow-moving platform IaC (Terraform) from fast-moving pipeline deploys (bundles).",
      noteLabel: "Model answer:",
      note: "\"I split IaC in two. Terraform's Databricks provider manages the platform foundation — workspaces, Unity Catalog catalogs/schemas, grants, cluster policies, secret scopes — the slow-moving governed layer. Asset Bundles deploy the fast-moving data project on top. Promotion is Git-driven: PR triggers CI tests, merge deploys the bundle to staging, and prod is gated behind validation or an approval. Environments are isolated by UC catalog and separate workspaces so dev compute physically can't read prod PHI. Keeping platform-as-Terraform separate from pipeline-as-bundle is what stops a routine pipeline change from accidentally re-provisioning governance.\"",
      followups: [
        { q: "What do you manage with Terraform vs with Asset Bundles?", a: "Terraform for the platform/governance foundation (workspaces, UC metastore/catalogs, grants, cluster policies, secret scopes) that changes rarely; bundles for the data project (jobs, DLT pipelines, notebooks) that changes constantly. Different cadence, different tool." },
        { q: "How do you isolate dev from prod so a dev job can't read prod PHI?", a: "Separate Unity Catalog catalogs per environment (and often separate workspaces), with grants scoped per catalog. Dev compute has no permission on the prod catalog, so it physically can't read prod data even by mistake." },
        { q: "Describe a safe promotion path from a code change to prod.", a: "PR → CI runs unit/integration tests → merge deploys the bundle to staging → validate against staging data → promote to prod via a tagged release or manual approval gate, deploying the same bundle with the prod target. No manual edits in the prod workspace." }
      ]
    },
    {
      title: "The automation surface — CLI, Jobs REST API & Git folders",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Underneath bundles sits an automation surface worth knowing: the Databricks CLI (drives bundles, jobs, secrets, fs from scripts/CI); the REST API (Jobs, Clusters, Repos, SQL) for programmatic control and for external orchestrators — Airflow's Databricks operator calls the Jobs API under the hood; and Git folders (Repos) that connect the workspace to your Git provider so notebooks are versioned and pulled by CI, not authored loose. Together they're why everything on Databricks can be scripted and put under source control — the foundation the higher-level tools (bundles, Terraform) build on.",
      noteLabel: "Model answer:",
      note: "\"Everything on Databricks is scriptable, which is what makes real CI/CD possible. The CLI drives bundles, jobs, secrets, and files from CI. The REST API gives programmatic control of jobs, clusters, and repos — it's also what external orchestrators use, since Airflow's Databricks operator just calls the Jobs API. Git folders connect the workspace to the repo so notebooks are versioned and CI pulls a known commit rather than someone's edited copy. I rarely call these raw day to day — bundles and Terraform sit on top — but knowing the surface is why I can automate anything and why nothing needs to be done by hand in the UI.\"",
      followups: [
        { q: "How does Airflow actually trigger a Databricks job?", a: "Through the Databricks operator, which calls the Jobs REST API to submit/run a job and poll its status — so Airflow orchestrates cross-system while Databricks does the compute." },
        { q: "Why use Git folders/Repos instead of importing notebooks into the workspace?", a: "They bind the workspace to a Git provider, so notebooks are version-controlled with branches/PRs and CI can check out a specific commit — reproducible and reviewable, versus loose notebooks that drift and can't be diffed." },
        { q: "When would you call the REST API directly rather than use a bundle?", a: "For dynamic, runtime operations a static bundle can't express — programmatically launching parameterized runs, integrating Databricks into a custom control plane, or one-off automation — where you need imperative control, not declarative deployment." }
      ]
    }
  ]
},

mlai: {
  intro: {
    title: "ML & AI on Databricks — and the DE's day-to-day role in it",
    desc: "Databricks is now as much an ML/AI platform (MLflow, Feature Store, Model Serving, Mosaic AI / GenAI, Vector Search, AI-in-SQL, Genie) as a data platform. You won't be asked to train models as a DE — you'll be asked how you FEED and PRODUCTIONIZE them. Each card covers the capability plus exactly what you own as the data engineer, so you can answer any ML/AI-adjacent question."
  },
  cards: [
    {
      title: "MLflow — experiment tracking & the model lifecycle",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "MLflow is the open-source ML lifecycle tool baked into Databricks: TRACKING logs experiments (params, metrics, artifacts) so runs are reproducible; the MODEL REGISTRY (now in Unity Catalog) versions models and moves them through stages/aliases (e.g. @champion, @challenger) with governance and lineage like any UC asset; MLflow packaging standardizes how a model is saved and loaded. As a DE you rarely train, but you consume the registry: your batch/streaming pipeline loads a registered model by name+alias to score data, and you want the reproducibility and versioning MLflow gives so a model swap is controlled, not a copy-pasted pickle file.",
      code: "import mlflow\n# DE side: load a governed, versioned model from the UC registry and score a batch\nmodel = mlflow.pyfunc.load_model(\"models:/main.ml.fraud_scorer@champion\")\nscored = batch_df.withColumn(\"risk_score\", model(*feature_cols))",
      noteLabel: "Model answer:",
      note: "\"MLflow is the ML lifecycle layer: tracking for reproducible experiments, and a model registry — now in Unity Catalog — that versions models and promotes them via aliases like @champion with full lineage and access control, same as any governed asset. As a DE I'm on the consuming end: my scoring pipeline loads a model by name and alias from the registry rather than a loose pickle, so upgrading the model is flipping the alias, not editing my pipeline. That gives me reproducibility, rollback, and governance on the model exactly like I have on the data — which is the answer to 'how do models get into your pipeline safely'.\"",
      followups: [
        { q: "As a DE, do you train models? What's your actual MLflow touchpoint?", a: "Rarely training. My touchpoint is the registry: I load registered, versioned models by name+alias to score data in batch/streaming pipelines, and I care that promotion is governed so a model change doesn't silently alter my pipeline's output." },
        { q: "Why load a model by alias (@champion) instead of a specific version number?", a: "Indirection: the pipeline references @champion and the ML team repoints that alias to a new version after validation. The pipeline code doesn't change, promotion/rollback is a controlled registry action, and you avoid hardcoded version drift." },
        { q: "What does the registry being in Unity Catalog give you?", a: "Models get the same governance as tables — grants, lineage, and audit — so you can see which data trained a model and which pipelines consume it, and control who can promote to production." }
      ]
    },
    {
      title: "Feature engineering & the Feature Store in Unity Catalog",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "This is the DE's biggest ML touchpoint. Features are the model's inputs, computed from raw data — and the classic failure is TRAIN/SERVE SKEW: the feature computed in the training pipeline differs from the one computed at inference. Databricks Feature Engineering in Unity Catalog solves it: you publish feature tables (just governed Delta tables keyed by an entity), and both training and inference read the SAME feature definitions — offline for batch training, and an online store for low-latency real-time serving. As a DE you own the feature PIPELINES: the medallion jobs that compute and refresh feature tables reliably, on time, with quality — that's your day-to-day contribution to ML.",
      code: "from databricks.feature_engineering import FeatureEngineeringClient\nfe = FeatureEngineeringClient()\n# DE owns this: compute + publish a governed feature table (a Delta table under UC)\nfe.create_table(name=\"main.ml.provider_features\", primary_keys=[\"provider_id\"],\n                df=provider_agg_df, description=\"Rolling 30d claim stats per provider\")\n# Training & inference both look features up here -> no train/serve skew",
      noteLabel: "Model answer:",
      note: "\"Features are where I add the most ML value as a DE. The risk is train/serve skew — the feature computed at training time not matching what's computed at inference. Databricks Feature Engineering in Unity Catalog fixes that: I publish feature tables as governed Delta tables keyed by an entity, and both the training job and the serving path read the same definitions — offline for batch, an online store for real-time lookups. What I own is the feature pipelines: the medallion jobs that compute rolling aggregates — say 30-day claim stats per provider — refreshed on schedule with expectations for quality and freshness. So my answer to 'what's your role in ML' is: I build and operate the reliable, governed feature pipelines the models depend on.\"",
      followups: [
        { q: "What is train/serve skew and how does a feature store prevent it?", a: "It's when the feature value used to train differs from the one at inference (different code/timing), silently degrading the model. A feature store gives one governed definition both paths read, so training and serving use identical features." },
        { q: "As a DE, what part of the ML feature workflow do you own?", a: "The feature pipelines — the jobs that compute and refresh feature tables from raw/silver data on schedule, with quality and freshness checks. Data scientists define what features they want; you make them reliable, timely, and governed." },
        { q: "Why do you need an online store in addition to the offline feature table?", a: "Batch training reads the offline Delta table, but real-time inference needs millisecond lookups per request — the online store serves the same features at low latency, keeping real-time scoring consistent with training." }
      ]
    },
    {
      title: "Model serving & inference in your pipelines",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Models produce value three ways, and the DE wires all three. BATCH inference: a scheduled job loads a registered model and scores a table (fraud scores on last night's transactions) — pure data-pipeline work. STREAMING inference: score records as they flow through a Structured Streaming pipeline. REAL-TIME: Databricks Model Serving exposes a model behind a low-latency REST endpoint (serverless, autoscaling) for apps that need per-request scoring, backed by the online feature store. The DE's day-to-day is mostly batch/streaming scoring inside medallion pipelines, plus supplying the online features that real-time endpoints depend on.",
      noteLabel: "Model answer:",
      note: "\"Three inference modes and I build the data path for each. Batch is the common one — a scheduled job loads the registered model and scores a Delta table, e.g. risk scores on the overnight transaction batch; that's just a pipeline step. Streaming scores records inline in a Structured Streaming job for near-real-time. Real-time uses Model Serving — a serverless autoscaling REST endpoint the application calls per request, fed by the online feature store. My day-to-day is overwhelmingly the batch and streaming scoring inside medallion pipelines, plus keeping the online features fresh so the real-time endpoint stays consistent with training. I don't build the model; I build everything that gets data to and from it.\"",
      followups: [
        { q: "Fraud scores on last night's transactions — batch, streaming, or real-time serving?", a: "Batch: a scheduled job loads the model and scores the overnight table. No endpoint needed — it's a data-pipeline step writing scores to a Delta table for downstream use." },
        { q: "When do you actually need a real-time Model Serving endpoint?", a: "When an application must score per request with low latency — e.g. approve/deny a transaction at swipe time. Batch/streaming can't meet per-request latency, so you expose the model as a serving endpoint backed by online features." },
        { q: "What does the DE supply for a real-time endpoint to work correctly?", a: "The online feature store data — fresh, low-latency feature lookups that match training features — plus the pipelines that keep them updated. If features go stale, the endpoint scores on bad inputs even though the model is fine." }
      ]
    },
    {
      title: "Mosaic AI & GenAI — Vector Search, RAG & foundation models",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Databricks' GenAI stack (Mosaic AI): Foundation Model APIs give pay-per-token access to LLMs (and hosting of open models) inside the platform; VECTOR SEARCH is a managed vector database that indexes embeddings of your text for semantic retrieval; together they enable RAG (Retrieval-Augmented Generation) — answer questions grounded in your own documents. The DE owns the RAG DATA PIPELINE: ingest documents, chunk them, generate embeddings, and load them into a Vector Search index kept in sync as source docs change (often via Delta + a sync job). It's a new kind of ETL — 'document → chunk → embed → index' — but it's fundamentally a data pipeline, which is why it lands on the DE.",
      code: "# DE-owned RAG prep: chunk + embed clinical docs into a Vector Search index\nfrom databricks.vector_search.client import VectorSearchClient\n# 1) chunk docs -> Delta table  2) index it (embeddings computed by an endpoint)\nVectorSearchClient().create_delta_sync_index(\n  endpoint_name=\"vs\", index_name=\"main.ml.policy_docs_idx\",\n  source_table_name=\"main.silver.policy_chunks\",   # Delta table of chunks\n  pipeline_type=\"TRIGGERED\", primary_key=\"chunk_id\",\n  embedding_source_column=\"text\", embedding_model_endpoint_name=\"bge-large\")",
      noteLabel: "Model answer:",
      note: "\"The GenAI stack is Foundation Model APIs for LLM access, Vector Search as a managed vector index, and RAG to ground an LLM in our own data. My role as a DE is the RAG data pipeline, which is really just a new ETL shape: ingest the documents, chunk them sensibly, generate embeddings, and load them into a Vector Search index that stays in sync as source docs change — Databricks can do that as a Delta-sync index off a chunks table I maintain. So when a team wants a chatbot over our claims policies, I don't build the model — I build and keep fresh the chunk-and-embed pipeline and the index behind it, with the same reliability and governance discipline as any pipeline. 'Document → chunk → embed → index' is ETL, so it's mine.\"",
      followups: [
        { q: "A team wants an LLM chatbot over internal claims policies. What do you, the DE, build?", a: "The RAG data pipeline: ingest the policy docs, chunk them, embed the chunks, and load them into a Vector Search index that re-syncs when docs change. You own retrieval-data freshness and governance; the ML/app team wires the LLM and prompt." },
        { q: "Why is RAG prep considered data engineering rather than ML?", a: "It's an ETL pipeline — extract documents, transform (chunk + embed), load into an index — with the usual concerns: incremental sync, freshness, quality, and governance. The embedding model is a called service; the pipeline around it is standard DE work." },
        { q: "How do you keep the vector index fresh as source documents change?", a: "Maintain the chunks as a Delta table and use a Delta-sync Vector Search index (triggered or continuous) so inserts/updates to the chunk table propagate to the index — the same CDC/incremental thinking as any Delta pipeline." }
      ]
    },
    {
      title: "AI functions in SQL — ai_query, ai_classify, ai_gen",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Databricks exposes LLMs as SQL functions so analysts and DEs can apply AI inside a query — ai_query() to call a served/foundation model, plus task functions like ai_classify(), ai_extract(), ai_gen(), ai_summarize(), ai_translate(). This means bulk AI transformations become a SQL/pipeline step: classify support tickets, extract fields from free-text claim notes, summarize documents — over millions of rows, governed and scalable. As a DE you use these to build enrichment pipelines (turn unstructured text into structured columns) without standing up a separate ML service — it's LLM inference as a set-based transform.",
      code: "-- Enrich free-text claim notes into structured columns, in a pipeline step\nSELECT claim_id, note,\n       ai_classify(note, ARRAY('billing', 'clinical', 'eligibility')) AS category,\n       ai_extract(note, ARRAY('denial_reason', 'cpt_code'))          AS extracted\nFROM   main.silver.claim_notes;",
      noteLabel: "Model answer:",
      note: "\"AI functions put LLM inference into SQL — ai_query for a general model call, and task functions like ai_classify, ai_extract, ai_summarize. For me that turns AI into a set-based transform in a pipeline: I can take free-text claim notes and, in one SQL step over millions of rows, classify them and extract denial reasons or CPT codes into structured columns — governed by Unity Catalog, no separate ML service to operate. It's the pragmatic way to add AI enrichment to a bronze→silver step. I'd flag cost and rate limits on large volumes, but for structuring unstructured text at scale it's exactly the DE's tool.\"",
      followups: [
        { q: "You need to extract denial reasons from millions of free-text claim notes. Approach?", a: "ai_extract() (or ai_query with a prompt) as a SQL transform in the silver step, writing structured columns back to a Delta table. It's set-based LLM inference over the whole table — no separate service — governed by UC." },
        { q: "What are the practical concerns using AI functions at scale?", a: "Cost per token and rate/throughput limits on large volumes, plus non-determinism — so you batch sensibly, monitor spend, and validate outputs (and often cache/store results in Delta so you don't re-infer unchanged rows)." },
        { q: "Why is this attractive versus a standalone ML inference service?", a: "No separate service to build or operate — it runs inside the SQL/pipeline you already have, governed by Unity Catalog, and scales as a normal query. For text enrichment it collapses an ML deployment into a transform." }
      ]
    },
    {
      title: "Genie / AI-BI — natural-language analytics",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "AI/BI Genie lets business users ask questions of their data in natural language and get SQL-generated answers over Databricks tables — a 'chat with your data' layer on the Lakehouse. It's a consumption tool, not something the DE operates directly, but its quality depends entirely on DE work: well-modeled, well-named gold tables, good column comments/metadata, and curated 'Genie spaces' with example queries and definitions. The DE relevance: garbage or ambiguous models produce wrong NL answers, so clean semantics and metadata in the gold layer are what make AI-BI trustworthy. It's another reason gold-layer modeling and documentation matter.",
      noteLabel: "Model answer:",
      note: "\"Genie is AI-BI — business users ask questions in plain language and it generates SQL over our tables. I don't operate it, but its accuracy is downstream of my work: it reasons over the gold layer, so if my tables are well-modeled, clearly named, and have good column comments and defined metrics in a curated Genie space, it answers correctly; if the model is ambiguous or poorly named, it confidently answers wrong. So the DE relevance is that clean semantics and documentation in gold aren't just nice-to-have — they're what makes natural-language analytics trustworthy. It raises the bar on modeling and metadata rather than replacing it.\"",
      followups: [
        { q: "Genie gives users wrong answers. As the DE, where do you look?", a: "The gold model and its metadata: ambiguous/duplicated column names, missing comments, undefined metrics, or a grain that's easy to misread. Improve naming, add column descriptions, and curate a Genie space with example queries and metric definitions." },
        { q: "Does AI-BI reduce the need for good data modeling?", a: "The opposite — it raises it. NL-to-SQL is only as good as the semantics it reasons over, so clear naming, comments, and well-defined gold tables become more important, not less." },
        { q: "What's the DE's contribution to making Genie reliable?", a: "Clean, well-named, documented gold tables; defined metrics; and curated Genie spaces with sample questions and business definitions so the model has unambiguous semantics to translate against." }
      ]
    },
    {
      title: "The DE's role across ML/AI — what you actually own",
      badge: "advanced",
      conceptLabel: "The synthesis:",
      concept: "Across all of the above, the through-line is that a DE doesn't build models — the DE builds and operates the DATA around them. Concretely you own: feature pipelines (compute/refresh governed feature tables, kill train/serve skew), the data path for inference (batch/streaming scoring steps, fresh online features for real-time), RAG data pipelines (chunk/embed/index and keep it synced), AI-enrichment transforms (AI functions turning text into structure), and the governance/lineage of ML assets in Unity Catalog (models, features, and their source data all governed and auditable). ML/AI on Databricks is mostly reliable, governed, timely data — which is the DE job.",
      noteLabel: "Model answer:",
      note: "\"My one-line answer to 'what's your role in ML/AI as a DE': I don't train models, I build and operate everything the models depend on — and on Databricks that's a lot of the value. Feature pipelines that produce governed, skew-free feature tables. The inference data path: batch and streaming scoring steps, and fresh online features when there's a real-time endpoint. RAG pipelines that chunk, embed, and keep a Vector Search index in sync. AI-function enrichment that structures unstructured text at scale. And governance — models, features, and their lineage all live in Unity Catalog, so I can prove what data trained a model and what consumes it. ML/AI success comes down to reliable, timely, governed data, and that's exactly what I own.\"",
      followups: [
        { q: "Summarize a DE's ML/AI responsibilities in one sentence.", a: "Build and operate the data around models — feature pipelines, inference data paths, RAG indexes, AI-enrichment transforms — all reliable, timely, and governed in Unity Catalog; the data scientists build the models." },
        { q: "An interviewer asks 'you're a DE, why should you know ML/AI on Databricks?'", a: "Because on Databricks ML/AI runs on the same platform and its outcomes depend on data engineering — feature freshness, no train/serve skew, RAG index sync, governed lineage. The model is a small piece; the reliable data pipeline around it is the DE's job and the usual point of failure." },
        { q: "Which ML/AI area is the single biggest DE contribution?", a: "Feature engineering pipelines — computing and refreshing governed feature tables with quality/freshness guarantees and preventing train/serve skew. It's the highest-leverage, most DE-owned part of the ML lifecycle." }
      ]
    }
  ]
},

compare: {
  intro: {
    title: "Databricks vs the alternatives — the trade-off questions",
    desc: "Senior rounds always test whether you can place Databricks against Snowflake, EMR/Glue, and the two-tier lake+warehouse world honestly. Name the axes and the boundary, not 'X is better'."
  },
  cards: [
    {
      title: "Databricks vs Snowflake",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Both are Lakehouse-ish now, but the origins show. Snowflake started as a SQL warehouse: unbeatable ease for SQL/BI, near-zero admin, great concurrency, but historically weaker for code-first data science / custom Spark / streaming, and data lives in its managed format. Databricks started as Spark/data-science: superb for code (PySpark/Scala), ML, and streaming on open Delta you own, with strong SQL via Photon — but more compute concepts to manage. Both have converged (Snowflake added Snowpark/Iceberg; Databricks added serverless SQL). Honest pick: Snowflake if the workload is predominantly SQL/BI and you value zero-admin simplicity; Databricks if you need heavy code/ML/streaming and open-format control in one platform.",
      noteLabel: "Model answer:",
      note: "\"They've converged but their DNA differs. Snowflake is the easiest path for SQL/BI — near-zero admin, excellent concurrency — but it started warehouse-first, so code-heavy data science, custom Spark, and streaming were later additions, and data sits in its managed format. Databricks started Spark/ML-first: best-in-class for PySpark, ML, and streaming on open Delta you control, with strong SQL via Photon, at the cost of more compute concepts to manage. So I choose on workload: predominantly SQL/BI with a small team wanting simplicity → Snowflake; heavy transformation, ML, streaming, and open-format control in one place → Databricks. Both can serve the other case now; it's about where the center of gravity is.\"",
      followups: [
        { q: "\"A shop is 90% SQL dashboards. Which, and what would change your mind?\"", a: "Snowflake — predominantly SQL/BI favors its near-zero admin and concurrency. Heavy code-first transformation, ML, or streaming entering the picture would flip it toward Databricks." },
        { q: "\"What did Snowflake historically make hard that Databricks did well, and vice versa?\"", a: "Snowflake was weaker at code-first data science, custom Spark, and streaming; Databricks required managing more compute concepts where Snowflake offered near-zero-admin SQL simplicity." },
        { q: "\"How have Snowpark and serverless SQL blurred this comparison?\"", a: "Snowflake added Snowpark/Iceberg (code + open format) and Databricks added serverless SQL and Photon (easy, fast BI), so it's rarely a capability wall now — more a fit-and-operability call." }
      ]
    },
    {
      title: "Databricks vs EMR / Glue (raw Spark)",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "All run Spark. EMR/Glue give you Spark on AWS with either cluster control (EMR) or serverless simplicity (Glue), AWS-native and often cheaper on raw compute — but you assemble the rest (catalog, quality, governance, notebooks, optimization) yourself. Databricks is the managed, integrated platform: Delta with Photon and auto-optimization, Unity Catalog governance, notebooks/Repos, Workflows, DLT, MLflow — a far better developer experience and less to build, at a platform premium and some lock-in to the Databricks experience (though Delta itself is open). The pick: EMR/Glue for cost-sensitive, AWS-native Spark where you'll build your own platform; Databricks when developer productivity and the integrated lakehouse feature set justify the premium.",
      noteLabel: "Model answer:",
      note: "\"Same engine, different amount of assembly. EMR gives me cluster control and Glue gives me serverless Spark, both AWS-native and cheaper on raw compute — but I build the surrounding platform myself: catalog, quality, governance, notebooks, optimization. Databricks hands me that integrated — Delta plus Photon and auto-optimize, Unity Catalog, Repos, Workflows, DLT, MLflow — so the team ships faster with far less plumbing, at a platform premium and some lock-in to the experience, though Delta is open so my data isn't trapped. I'd pick EMR/Glue when cost and AWS-native matter more than developer time, Databricks when productivity and the unified feature set pay for themselves.\"",
      followups: [
        { q: "\"Your team of 4 has no platform engineers. Databricks or roll-your-own on Glue/EMR?\"", a: "Databricks — the integrated platform (Delta, UC, Workflows, DLT, MLflow) means far less to build and operate, which matters most for a tiny team with no platform engineers. The premium buys developer productivity." },
        { q: "\"What exactly do you have to build yourself on EMR that Databricks gives you?\"", a: "The catalog/governance, data quality, notebooks/Repos, orchestration, file optimization, and ML lifecycle — Databricks ships these integrated; on EMR/Glue you assemble them yourself." },
        { q: "\"How real is Databricks lock-in given Delta is open source?\"", a: "Data lock-in is limited because Delta is open and lives in your own object storage, readable by other engines. The lock-in is to the Databricks platform experience and tooling, not the data format." }
      ]
    },
    {
      title: "Lakehouse vs the two-tier lake + warehouse",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The pattern Databricks argues against: a data lake (S3 + Spark for raw/ML) AND a separate warehouse (Redshift/Snowflake for BI), with ETL copying curated data from lake to warehouse. Costs: two copies of data, drift between them, two governance models, and extract latency. The Lakehouse claim is one governed copy in open Delta serving both ML and BI, removing the copy step. When the two-tier is still reasonable: an org deeply invested in a warehouse for BI with a separate lake for data science can be pragmatic — but the direction of travel, and the thing to articulate, is consolidating onto one governed tier.",
      noteLabel: "Model answer:",
      note: "\"The two-tier world is a lake for raw/ML plus a separate warehouse for BI, with ETL shuffling curated data between them — which means two copies, drift, two governance models, and extract latency. The Lakehouse pitch is one governed copy in open Delta that serves both ML and BI, so you delete the copy step and the drift. I'll acknowledge the two-tier can be pragmatic where an org is heavily invested in an existing warehouse and a separate DS lake, but the direction I'd argue for is consolidating onto one governed tier — that's the whole reason the lakehouse concept exists.\"",
      followups: [
        { q: "\"What are the concrete costs of maintaining a lake AND a warehouse?\"", a: "Two copies of the data, drift between them, two governance models to reconcile, and extract latency from the ETL copying curated data into the warehouse." },
        { q: "\"When is staying two-tier actually the pragmatic choice?\"", a: "When an org is heavily invested in an existing warehouse for BI plus a separate lake for data science, and consolidation isn't worth the migration cost right now." },
        { q: "\"How does one governed copy change your data-quality and governance work?\"", a: "One governed Delta copy under one governance model (Unity Catalog) removes the copy/reconcile step, so quality and access controls are defined once and serve both BI and ML consistently." }
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — senior DE, Databricks-focused Q&A",
    desc: "The spoken questions a senior loop at a Databricks shop asks. Form your own answer first, then expand — the score is architecture judgment, the trade-off, the cost lever, and the failure mode. Answers are framed so your resume projects read as Databricks work."
  },
  cards: [
    {
      title: "\"Design an end-to-end pipeline on Databricks for our claims/transaction data.\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Drive medallion end to end, name the Databricks component per stage, and bake in quality, idempotency, and governance without being asked. Match scale to the ask; don't over-stream a batch problem.",
      noteLabel: "Model answer:",
      note: "\"Ingest with Auto Loader (or Kafka via Structured Streaming for CDC) into a bronze Delta table — raw, appended, checkpointed for exactly-once. Silver cleans, casts, and dedups via MERGE on the business key so it's idempotent and retry-safe, with DLT expectations enforcing not-null keys and valid amounts — bad rows quarantined before they reach billing. Gold builds the per-provider/per-risk marts as materialized views. Orchestrate with a Workflow (or DLT pipeline) on job clusters that terminate after; Unity Catalog governs access with column masking on PHI and gives me lineage for audit. OPTIMIZE/liquid-clustering keeps files read-sized. For hourly files that's batch triggers; only if it's true real-time do I run continuous streaming. That's the Cedar Gate pipeline expressed natively.\"",
      followups: [
        { q: "\"Where exactly is exactly-once guaranteed, and where is idempotency guaranteed?\"", a: "Exactly-once comes from the ingestion checkpoint (offsets/processed files) plus Delta's atomic commits; idempotency comes from the keyed MERGE in silver, so a replayed batch updates in place instead of duplicating." },
        { q: "\"Now make it near-real-time. What changes vs the batch version?\"", a: "Swap batch triggers for continuous Structured Streaming (Kafka/CDC source, short micro-batch trigger) feeding foreachBatch MERGEs; the medallion structure, quality gates, and governance stay the same." },
        { q: "\"How do you keep PHI controlled across every access path in this design?\"", a: "Unity Catalog enforces least-privilege grants, column masking on PHI, and row filters centrally, so the same controls apply across SQL, notebooks, and BI, with lineage for audit." }
      ]
    },
    {
      title: "\"You migrated batch scripts to an orchestrated pipeline. Do that on Databricks — what improves?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "This is your resume's +35% throughput story reframed. Anchor the wins to real engineering — idempotency, parallelism, quality gates, incrementality — not 'we rewrote it'.",
      noteLabel: "Model answer:",
      note: "\"The legacy problem was monolithic batch scripts: no idempotency, full recomputes, and failures that needed manual reruns from the top. On Databricks I'd move it to DLT/Workflows with medallion Delta tables. Wins that are real engineering: idempotent MERGE loads and checkpointed ingestion make every step safely retryable; incremental processing via CDF/streaming tables means silver/gold rebuild only what changed instead of full recomputes — that's most of the throughput gain; DLT expectations catch bad data inline instead of downstream reprocessing; parallelism across independent tasks and Photon on the heavy transforms cut wall-clock; and repair-run reruns only failed tasks. I'd measure before/after on runtime and on-call pages, and cut over by running both in parallel and reconciling outputs before switching.\"",
      followups: [
        { q: "\"Which specific change drove most of the throughput improvement, and why?\"", a: "Incremental processing (CDF/streaming tables) — silver/gold rebuild only what changed instead of full recomputes, which is most of the throughput gain over monolithic batch scripts." },
        { q: "\"How do you cut over safely without a risky big-bang switch?\"", a: "Run the new pipeline in parallel with the legacy one and reconcile outputs before switching over, so correctness is proven before decommissioning the old path." },
        { q: "\"How did you measure the improvement credibly?\"", a: "Before/after on wall-clock runtime and on-call pages/failures, measured against real metrics rather than claiming \\\"we rewrote it.\\\"" }
      ]
    },
    {
      title: "\"How do you enforce data quality in a Databricks pipeline?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Lead with DLT expectations as the native mechanism, distinguish hard vs soft rules, and connect it to observability and reprocessing — the validation/reconciliation resume bullet.",
      noteLabel: "Model answer:",
      note: "\"Natively with DLT expectations — declarative rules on each table with an action: expect_or_fail for critical breaches that must halt the pipeline (null primary key), expect_or_drop to quarantine bad rows (negative amount), and expect to track softer issues while keeping the row. DLT records pass/fail rates automatically, so quality is a monitored metric I can alert on, not a script that rots. Quarantined rows land somewhere I can inspect and reprocess after fixing the source. Outside DLT I'd assert the same checks in the job before the write and fail closed. This is the validation-and-reconciliation framework from Cedar Gate — the point is bad claims never silently reach reporting or billing.\"",
      followups: [
        { q: "\"Null key vs a reference value that's slightly off — which action for each?\"", a: "expect_or_fail (or expect_or_drop) for the null primary key — a critical breach; expect (warn/track, keep the row) for the slightly-off reference value." },
        { q: "\"How do you know if data quality is degrading week over week?\"", a: "DLT records expectation pass/fail rates automatically, so you monitor and alert on those trends — quality is an observable metric, not a script that rots." },
        { q: "\"What happens to dropped rows and how do you get them back in?\"", a: "expect_or_drop quarantines them out of the target; route them to a quarantine table so you can inspect, fix the source, and reprocess once corrected." }
      ]
    },
    {
      title: "\"Replicate a source's changes into the Lakehouse continuously (CDC). How?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Name the path (Kafka/DMS → stream → MERGE) and be crisp about exactly-once and ordering/idempotency — your Kafka/CDC resume story.",
      noteLabel: "Model answer:",
      note: "\"Changes land on a stream — Kafka, or DMS/Debezium into a topic. I readStream from it, and in foreachBatch run a Delta MERGE into the silver table keyed on the business id, mapping the CDC op to update/delete/insert. The streaming checkpoint stores offsets so a restart resumes exactly once, and the keyed MERGE makes a replayed micro-batch idempotent — together that's no loss and no double-apply, the two things CDC must guarantee. For ordering I sequence by the source commit/LSN so a stale update can't overwrite a newer one, and I propagate onward with Change Data Feed so downstream layers consume only deltas. That's the Cedar Gate cross-region replication in Databricks form.\"",
      followups: [
        { q: "\"Out-of-order events: an old update arrives after a newer one. How do you prevent regression?\"", a: "Sequence by the source commit/LSN in the MERGE so a stale update can't overwrite a newer one — only apply the change if its sequence is newer than what's already stored." },
        { q: "\"Exactly where do exactly-once and idempotency each come from here?\"", a: "Exactly-once from the streaming checkpoint's stored offsets (a restart resumes where it stopped); idempotency from the business-key MERGE, so a replayed micro-batch updates in place rather than duplicating." },
        { q: "\"How do you propagate these changes efficiently to gold?\"", a: "Enable Change Data Feed on silver so gold consumes only the changed rows and MERGEs them forward, instead of recomputing the whole table each run." }
      ]
    },
    {
      title: "\"Our Databricks bill is too high. How do you bring it down?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Method first (measure biggest spender), then the specific Databricks levers, then governance so it stays cut. This is your Amex cost story.",
      noteLabel: "Model answer:",
      note: "\"Method first: find the biggest spenders from usage/system tables — which jobs and clusters burn the most DBUs — then attack those, not everything. Levers: move production off always-on all-purpose clusters onto ephemeral job clusters; Spot workers with on-demand driver; cluster pools so short jobs don't pay minutes of startup; auto-termination everywhere; Photon so jobs finish in fewer DBU-seconds; and OPTIMIZE/clustering so they scan less data. Then I make it stick with cluster policies capping sizes and enforcing auto-terminate, so savings don't drift back as teams spin up giant clusters. Change one thing, re-measure against the DBU metric — same discipline as the Amex right-sizing work, just with Databricks knobs.\"",
      followups: [
        { q: "\"Where do you look to find what's actually costing the most?\"", a: "Usage/system tables to identify the jobs and clusters burning the most DBUs, then attack those biggest spenders rather than everything." },
        { q: "\"How do you make the savings permanent instead of drifting back?\"", a: "Cluster policies capping sizes and enforcing auto-termination, so teams can't re-spin oversized always-on clusters and the savings stick." },
        { q: "\"A job runs fine but costs a lot. What are the first two changes?\"", a: "Move it off an always-on all-purpose cluster onto an ephemeral job cluster, and enable Photon (plus OPTIMIZE/clustering) so it finishes in fewer DBU-seconds scanning less data." }
      ]
    },
    {
      title: "\"How do you govern PHI/PII across the Lakehouse for a HIPAA audit?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Unity Catalog is the answer: least-privilege, masking/row-filters, lineage, audit — and why centralized beats per-tool. Your HIPAA resume bullet, made concrete.",
      noteLabel: "Model answer:",
      note: "\"Unity Catalog as the single governance layer. Least-privilege grants by group; column masking so raw MRN/SSN is visible only to a compliance group and NULL otherwise; row filters so a facility only sees its own claims. Because UC enforces centrally, the same controls apply whether someone queries from SQL, a notebook, or Power BI — I'm not re-implementing masking per tool, which is exactly what an auditor wants to see. UC's automatic column-level lineage proves where PHI flows source-to-dashboard, and its audit log answers 'who accessed this table.' On the platform side, PHI stays in our own account's storage under the classic-compute data plane. That's the HIPAA controls and lineage documentation from my resume, but enforced and automated instead of manual.\"",
      followups: [
        { q: "\"Analysts need claims but must never see the SSN. Implement it.\"", a: "A Unity Catalog column mask: a masking function returning the raw SSN only for a compliance group and NULL otherwise, applied to the SSN column, enforced centrally across every access path." },
        { q: "\"An auditor asks you to prove PHI never reached an unauthorized table. How?\"", a: "UC's automatic column-level lineage shows every table/column PHI flows into end to end, and the audit log shows who accessed what — together proving containment." },
        { q: "\"Why is UC's centralized enforcement better than masking in each BI tool?\"", a: "UC enforces at the data layer, so the same masking/row filters apply across SQL, notebooks, and every BI tool, instead of being re-implemented inconsistently per tool." }
      ]
    },
    {
      title: "\"Databricks or Snowflake for this workload — convince me.\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Refuse the false binary; pick on workload center-of-gravity and name what would flip you. Shows senior judgment, not fandom.",
      noteLabel: "Model answer:",
      note: "\"I'd decide on where the workload's center of gravity sits. If it's predominantly SQL and BI on structured data with a team that values near-zero admin, Snowflake is the simpler, cheaper-to-operate choice. If there's heavy code-first transformation, ML, and streaming, and I want one open-format copy serving both data science and BI, Databricks wins. I'd flip toward Snowflake if the ML/streaming need evaporated, and toward Databricks if we needed serious Spark/ML or wanted to avoid a managed proprietary format. I'd also note both have converged — Snowpark and Iceberg on one side, serverless SQL and Photon on the other — so it's rarely a capability wall now, more a fit-and-operability call. I won't pretend one is universally better.\"",
      followups: [
        { q: "\"What single fact about the workload would flip your recommendation?\"", a: "Whether there's serious code-first transformation, ML, or streaming: its presence pushes to Databricks, its absence (pure SQL/BI) pushes to Snowflake." },
        { q: "\"Where do the two genuinely still differ in 2026?\"", a: "DNA and operability: Snowflake's near-zero-admin SQL simplicity vs Databricks' code/ML/streaming depth on open Delta you own — rarely a capability wall now, more a fit call." },
        { q: "\"How do you avoid sounding like a vendor fan in this answer?\"", a: "Decide on workload center-of-gravity, name what would flip you either way, and acknowledge both have converged — judgment, not fandom." }
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What fundamentally makes a Delta table transactional where plain Parquet is not?",
    options: [
      "Delta files are compressed differently",
      "The _delta_log transaction log records atomic add/remove of files, giving ACID snapshots, atomic commits, and time travel",
      "Delta stores data in a proprietary binary format",
      "Delta requires a running database server"
    ],
    correct: 1
  },
  {
    q: "You need an idempotent CDC sink into a silver Delta table so replayed batches don't duplicate. What's the core mechanism?",
    options: [
      "INSERT INTO with DISTINCT",
      "MERGE INTO on the business key (update/delete/insert atomically), so a replay updates in place instead of duplicating",
      "Append then run VACUUM",
      "Write to Parquet and swap directories"
    ],
    correct: 1
  },
  {
    q: "Which compute should run a scheduled nightly PySpark ETL pipeline, cost-wise?",
    options: [
      "An always-on all-purpose (interactive) cluster",
      "A job cluster — created for the run at the cheaper job rate and terminated after",
      "A serverless SQL Warehouse",
      "The driver node only"
    ],
    correct: 1
  },
  {
    q: "In the Databricks architecture, where does your data (and the clusters processing it) live with classic compute?",
    options: [
      "Entirely in Databricks' cloud account",
      "In your own cloud account (data plane) — Databricks' control plane only orchestrates",
      "On the notebook server",
      "In the Unity Catalog metastore"
    ],
    correct: 1
  },
  {
    q: "A DLT pipeline must drop rows with a null primary key but only warn on a slightly-off reference value. Which expectations?",
    options: [
      "expect_or_fail for both",
      "expect_or_drop for the null key; expect (warn/track, keep row) for the reference value",
      "expect for both",
      "No expectations — handle it after the load"
    ],
    correct: 1
  },
  {
    q: "Auto Loader gives exactly-once ingestion from files into bronze Delta primarily because of…",
    options: [
      "It reads each file twice and compares",
      "Its checkpoint tracks processed files/offsets, combined with Delta's atomic commits",
      "It locks the source bucket",
      "It disables schema evolution"
    ],
    correct: 1
  },
  {
    q: "A large fact-to-dimension join is shuffling the whole fact table. First tuning move?",
    options: [
      "Add more worker nodes",
      "Broadcast the small dimension so the large side isn't shuffled (broadcast hash join)",
      "Cache both tables",
      "Convert the join to an RDD union"
    ],
    correct: 1
  },
  {
    q: "How do you enforce that analysts can query claims but never see the raw SSN, consistently across SQL, notebooks, and BI?",
    options: [
      "Ask each tool's admin to hide the column",
      "A Unity Catalog column mask (and least-privilege grants), enforced centrally so it applies on every access path",
      "Store SSN in a separate CSV",
      "Rely on analysts not to select it"
    ],
    correct: 1
  },
  {
    q: "A streaming table's queries have gotten slow over months. Most likely cause and fix?",
    options: [
      "Too few columns; add more",
      "Small-file accumulation from frequent writes; run OPTIMIZE (and ZORDER / liquid clustering on filter columns)",
      "Time travel is enabled; disable it",
      "The schema evolved; revert it"
    ],
    correct: 1
  },
  {
    q: "You orchestrate Databricks jobs plus an on-prem SFTP pull and a Salesforce API call in one DAG. Best fit?",
    options: [
      "Databricks Workflows only — it can do everything",
      "Airflow (e.g. MWAA) for the heterogeneous cross-system DAG, triggering Databricks jobs via the Databricks operator",
      "A single giant notebook",
      "Delta Live Tables"
    ],
    correct: 1
  },
  {
    q: "Photon speeds up your SQL/DataFrame aggregations but not a Python-UDF-heavy job. Why?",
    options: [
      "Photon only works on weekends",
      "Photon is a native vectorized engine for SQL/DataFrame ops; arbitrary Python UDFs still execute in Python and bypass it",
      "The UDF job wasn't using Delta",
      "Photon requires RDDs"
    ],
    correct: 1
  },
  {
    q: "What does Change Data Feed (CDF) enable in a medallion pipeline?",
    options: [
      "Automatic cluster scaling",
      "Reading only the row-level changes from an upstream Delta table so downstream layers update incrementally instead of full recompute",
      "Encrypting PHI at rest",
      "Converting Parquet to CSV"
    ],
    correct: 1
  },
  {
    q: "What is the current standard way to package and deploy a Databricks project (jobs, DLT pipelines, config) across dev/staging/prod?",
    options: [
      "Manually import notebooks and click 'Create Job' in each workspace",
      "Databricks Asset Bundles (databricks.yml with per-target overrides), deployed from CI",
      "Email a .dbc archive to each environment owner",
      "Copy-paste cells between workspaces"
    ],
    correct: 1
  },
  {
    q: "In DLT, what's the declarative way to apply CDC changes and maintain SCD Type 2 history?",
    options: [
      "Write a foreachBatch MERGE by hand for every table",
      "APPLY CHANGES INTO with keys, sequence_by, and stored_as_scd_type = 2",
      "TRUNCATE and reload each run",
      "Use a crawler"
    ],
    correct: 1
  },
  {
    q: "A model scores worse in production than in training even though the model is unchanged. Most likely data-engineering cause?",
    options: [
      "The cluster is too small",
      "Train/serve skew — features computed differently at inference than at training; a feature store with one shared definition prevents it",
      "Photon is disabled",
      "The model needs more epochs"
    ],
    correct: 1
  },
  {
    q: "A team wants an LLM chatbot over internal policy documents. What does the DE own?",
    options: [
      "Training the LLM from scratch",
      "The RAG data pipeline — ingest, chunk, embed, and keep a Vector Search index in sync as docs change",
      "Writing the chatbot UI",
      "Nothing; it's entirely the ML team's job"
    ],
    correct: 1
  },
  {
    q: "You must extract structured fields (denial reason, CPT code) from millions of free-text claim notes inside a pipeline. Idiomatic Databricks approach?",
    options: [
      "Stand up a separate microservice and call it row by row",
      "Use AI functions in SQL (ai_extract / ai_query) as a set-based transform in the silver step, governed by Unity Catalog",
      "Export to CSV and process on a laptop",
      "Manually label them"
    ],
    correct: 1
  }
];
