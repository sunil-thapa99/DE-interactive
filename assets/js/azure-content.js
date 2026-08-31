// Content data for the Azure Data Services module (ADLS, ADF, Databricks, Synapse) + cross-cloud.
const MODULE_ID = "azure";
const CONTENT = {

overview: {
  intro: {
    title: "The Azure data stack — how the pieces fit, and what each is FOR",
    desc: "Azure has more overlapping services than AWS and the names hide the jobs, so interviewers probe whether you know which tool owns which arrow: ADLS Gen2 as the lake, ADF for orchestration & ingestion, Databricks for heavy transform, Synapse for warehousing & serving. This module maps the reference architecture, then goes service by service on the ones on most Azure-DE resumes — with the trade-offs, the AWS/GCP equivalents (the standard 'how would you do this on the other cloud' follow-up), and interview Q&A."
  },
  cards: [
    {
      title: "The reference architecture — ADLS at the center, ADF moving, Databricks transforming",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "On Azure the lake is ADLS Gen2 (Blob storage + a hierarchical namespace), and the canonical flow is: sources land in ADLS raw (via ADF copy, Event Hubs, or a partner drop) → ADF orchestrates the pipeline and does the E/L → Databricks (or Synapse Spark) does the heavy T across medallion layers (bronze/silver/gold, usually as Delta tables) → curated data is served from a Synapse dedicated pool, a Databricks SQL warehouse, or queried in place → Power BI / ML consume it. The senior signal is naming which service owns which arrow: ADF moves and schedules, Databricks computes, ADLS stores, Synapse serves.",
      navLabel: "The distinction interviewers probe:",
      nav: "ADF is an orchestrator and a data-mover, NOT a transformation engine — its Copy activity is for E/L and its Mapping Data Flows run on a Spark cluster under the hood, but real transform logic belongs in Databricks/notebooks that ADF triggers. People who put business logic in Data Flows hit a wall on testability, version control, and cost. The clean split: ADF = control flow + ingestion; Databricks = compute; ADLS = storage; Synapse/Databricks SQL = serving.",
      noteLabel: "Model answer:",
      note: "\"ADLS Gen2 is the lake and the source of truth. Everything else is compute or movement I bring to it.<br><br>ADF orchestrates the pipeline and handles ingestion — its Copy activity lands raw data in ADLS.<br><br>Databricks does the heavy transformation across bronze, silver, and gold, usually as Delta tables.<br><br>Serving is either a Synapse dedicated pool or a Databricks SQL warehouse, and Power BI reads from there.<br><br>The key discipline is keeping transform logic out of ADF. ADF moves and schedules; Databricks computes. That keeps the logic version-controlled and testable.\"",
      followups: [
        "\"Where does transformation logic belong — in ADF Data Flows or Databricks, and why?\"",
        "\"Draw the arrows: a Postgres table must reach a Power BI dashboard hourly on Azure. What runs?\"",
        "\"Map this stack to AWS — what's the equivalent of ADF, ADLS, and Synapse?\""
      ]
    },
    {
      title: "ADLS vs ADF vs Databricks vs Synapse — the four-way decision",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "These blur together, so anchor each to its job. ADLS Gen2 = the storage layer (cheap, durable, hierarchical namespace, the lake). ADF = serverless orchestration + ingestion (schedule pipelines, Copy activity for E/L, connectors to 100+ sources, no heavy compute of its own). Databricks = managed Spark + Delta Lake for real transformation, ML, and streaming, with notebooks and jobs. Synapse Analytics = the umbrella: a dedicated SQL pool (provisioned MPP warehouse, like Redshift), a serverless SQL pool (query-in-place over ADLS, like Athena), and Synapse Spark (a Databricks-lite Spark). The rule: ADF orchestrates, Databricks transforms, Synapse serves BI — and most shops use Databricks over Synapse Spark because it's more mature.",
      noteLabel: "Model answer:",
      note: "\"I anchor each to its job.<br><br>ADLS Gen2 is storage — the lake itself.<br><br>ADF is orchestration and ingestion. It schedules pipelines and its Copy activity does the extract-and-load. It has no heavy compute of its own.<br><br>Databricks is where transformation, ML, and streaming actually run, on Spark and Delta.<br><br>Synapse is the serving umbrella: a dedicated pool for a provisioned MPP warehouse, a serverless pool for query-in-place over the lake, and Synapse Spark.<br><br>In practice I orchestrate with ADF, transform in Databricks, and serve BI from a Synapse pool or Databricks SQL. I lean Databricks over Synapse Spark because it's the more mature engine.\"",
      followups: [
        "\"Synapse serverless SQL pool vs a dedicated pool — when each?\"",
        "\"Why do most teams transform in Databricks rather than Synapse Spark?\"",
        "\"ADF Mapping Data Flow vs a Databricks notebook for a join — trade-offs?\""
      ]
    },
    {
      title: "How data GETS into the lake — ingestion paths",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The ingestion path depends on the source shape. Batch / DB pulls → ADF Copy activity (100+ connectors, incremental via watermark columns or the built-in incremental copy). Database CDC → ADF with change tracking, or a dedicated CDC tool landing to ADLS. Streaming events → Event Hubs (Azure's Kafka-equivalent, and it even speaks the Kafka protocol) → captured to ADLS or read by Databricks Structured Streaming. Self-hosted sources (on-prem SQL Server behind a firewall) → a Self-Hosted Integration Runtime that ADF uses as a secure bridge. As always, land an immutable raw copy first, partitioned by ingest date, so any downstream bug is fixable by reprocessing.",
      noteLabel: "Model answer:",
      note: "\"I match ingestion to the source and the latency target.<br><br>Batch and relational pulls come in through the ADF Copy activity, incrementally via a watermark column so I'm not reloading everything.<br><br>Streaming goes through Event Hubs, which speaks the Kafka protocol, and I either capture it to ADLS or read it with Databricks Structured Streaming.<br><br>For on-prem sources behind a firewall I use a Self-Hosted Integration Runtime as the secure bridge.<br><br>And I always land an immutable raw copy in ADLS first, partitioned by ingest date, so any bug downstream is a reprocess, not a re-fetch.\"",
      followups: [
        "\"On-prem SQL Server behind a corporate firewall — how does ADF reach it?\"",
        "\"Copy a large table daily but only the changed rows — how do you do incremental in ADF?\"",
        "\"Event Hubs vs Kafka — are they interchangeable, and what's the catch?\""
      ]
    }
  ]
},

adls: {
  intro: {
    title: "ADLS Gen2 — the lake foundation (namespace, layout, security, cost)",
    desc: "Everything sits on ADLS Gen2, so the questions get specific: what the hierarchical namespace changes versus plain Blob, how you lay out containers and folders, the security model (RBAC vs ACLs vs SAS), storage tiers and lifecycle, and the small-files problem. A bad lake layout poisons every engine above it."
  },
  cards: [
    {
      title: "Gen2 vs plain Blob — what the hierarchical namespace buys you",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "ADLS Gen2 is Blob storage with a Hierarchical Namespace (HNS) turned on. That one flag matters: without it, 'folders' are just key prefixes and a rename/delete of a 'directory' is a per-object loop; with HNS, directories are real, so directory rename/delete is a single atomic metadata operation — which is exactly what Spark/Delta commit protocols rely on for performance and correctness. HNS also enables POSIX-style ACLs for fine-grained access. The catch: HNS must be enabled at account creation and can't be toggled later, and a few Blob features don't yet support it. For a data lake, you always enable HNS.",
      code: "# The dfs endpoint = Gen2 (HNS); the blob endpoint = flat Blob API\nabfss://silver@mylake.dfs.core.windows.net/claims/ingest_date=2026-08-13/\n#      ^container ^account            ^Gen2 driver (abfss = secure)\n\n# Why HNS matters: a Spark job renaming _temporary -> final is ONE\n# metadata op with HNS, vs copying every file on flat Blob.",
      noteLabel: "Model answer:",
      note: "\"ADLS Gen2 is Blob storage with the hierarchical namespace enabled.<br><br>That flag turns prefixes into real directories, so a directory rename or delete is a single atomic metadata operation instead of a loop over every object. Spark and Delta commit protocols depend on that for both speed and correctness.<br><br>It also gives me POSIX-style ACLs for fine-grained access.<br><br>The gotcha is that HNS has to be set at account creation — you can't flip it on later. So for any lake, I enable it up front. I access it over the abfss driver, not the flat blob endpoint.\"",
      followups: [
        "\"Why does a Spark job commit faster on Gen2 than on flat Blob storage?\"",
        "\"Can you enable the hierarchical namespace on an existing Blob account?\"",
        "\"What's the difference between the blob and dfs endpoints?\""
      ]
    },
    {
      title: "Container & folder layout — the decision that governs cost",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Layout on ADLS drives query cost the same way it does on S3, because Spark/Synapse prune by folder path. The common pattern is a container per medallion layer (bronze/silver/gold) or one lake container with layer folders, then Hive-style partition folders (col=value) under each table. Partition on what you filter by — usually ingest_date, sometimes a coarse dimension like region. Too few partitions and every query scans the table; too many (partition by a high-cardinality id) and you drown in tiny files and slow directory listings. Target file sizes of 128MB–1GB and partition at a grain that keeps them there.",
      code: "# Container-per-layer + hive-style partitions:\nabfss://silver@mylake.dfs.core.windows.net/claims/ingest_date=2026-08-13/region=east/part-0001.parquet\n\n# Spark prunes to one partition on a filter over the partition column:\nspark.read.format(\"delta\").load(\"abfss://silver@mylake.dfs.core.windows.net/claims\") \\\n     .where(\"ingest_date = '2026-08-13'\")   # partition pruning => scans one folder\n\n# BAD: partition by claim_id => millions of dirs, tiny files, slow listing",
      noteLabel: "Model answer:",
      note: "\"Layout is the biggest lever on lake cost, because the engines skip whole folders.<br><br>I use a container per medallion layer, then Hive-style partition folders under each table. I partition on what queries filter by — almost always ingest date, sometimes a coarse dimension like region.<br><br>I avoid partitioning on high-cardinality keys, because that explodes into tiny files and slow directory listings, which hurt even more on object storage.<br><br>My target file size is 128MB to 1GB, and I compact partitions that drift small.\"",
      followups: [
        "\"A Delta table is partitioned by date but queries still scan everything — what do you check?\"",
        "\"Why is partitioning by user_id usually a mistake on a lake?\"",
        "\"Container-per-layer vs one container with folders — does it matter?\""
      ]
    },
    {
      title: "Security model — RBAC vs ACLs vs SAS vs Private Endpoints",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Azure gives layered access control and interviewers want you to place each correctly. Azure RBAC = coarse, at the container/account scope via roles (Storage Blob Data Reader/Contributor), assigned to Entra ID (formerly AAD) identities — good for 'this team can read this container'. POSIX ACLs = fine-grained, per-folder/file, for cases RBAC is too blunt (one folder a group shouldn't see). Managed Identity = the right way for ADF/Databricks to authenticate to storage — no keys in code. SAS tokens / account keys = time-boxed or shared-secret access; avoid keys, prefer user-delegation SAS or Managed Identity. Private Endpoints / firewall = keep the account off the public internet, reachable only from your VNet.",
      noteLabel: "Model answer:",
      note: "\"I layer the controls.<br><br>Azure RBAC handles the coarse grain — a role like Storage Blob Data Reader on a container, assigned to an Entra ID group. That covers most 'this team reads this layer' cases.<br><br>POSIX ACLs handle the exceptions, where one folder needs tighter access than the container.<br><br>For service-to-service auth — ADF or Databricks reaching storage — I use a Managed Identity so there are no keys in code.<br><br>I avoid account keys and long-lived SAS. And for network isolation I put a Private Endpoint on the account and lock the firewall so it's only reachable from the VNet.\"",
      followups: [
        "\"ADF needs to read a container — how should it authenticate, and what would you NOT do?\"",
        "\"RBAC vs ACLs — when is RBAC not enough?\"",
        "\"How do you keep a storage account off the public internet?\""
      ]
    },
    {
      title: "Access tiers, lifecycle & the small-files problem",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "ADLS has Hot / Cool / Cold / Archive access tiers — you shouldn't pay Hot rates for raw files nobody's touched in 90 days. Lifecycle management rules move blobs by age (Hot → Cool → Archive → delete) based on last-modified or last-access. Archive is cheapest storage but needs a rehydration step (hours) before you can read — so never archive data a job still reprocesses. The day-to-day performance killer, as on any lake, is small files: a Spark job writing thousands of tiny objects makes the next reader pay huge per-file overhead, and directory listing on object storage is slow. Fix with coalesce/repartition before write, Delta's OPTIMIZE (bin-packing) and Auto Optimize, and set retention windows to match compliance, not 'forever'.",
      code: "// Lifecycle rule: bronze -> Cool at 30d, Archive at 90d, delete at 7y\n{\n  \"rules\": [{\n    \"name\": \"age-out-bronze\",\n    \"definition\": {\n      \"filters\": { \"prefixMatch\": [\"bronze/\"], \"blobTypes\": [\"blockBlob\"] },\n      \"actions\": { \"baseBlob\": {\n        \"tierToCool\":    { \"daysAfterModificationGreaterThan\": 30 },\n        \"tierToArchive\": { \"daysAfterModificationGreaterThan\": 90 },\n        \"delete\":        { \"daysAfterModificationGreaterThan\": 2555 }\n      }}\n    }\n  }]\n}",
      noteLabel: "Model answer:",
      note: "\"I don't keep cold data on the Hot tier.<br><br>Lifecycle rules age bronze blobs to Cool, then Archive, and delete them at the end of the retention window. For compliance-bound data I set that window to the required retention, not forever.<br><br>The one thing I never archive is data a job still reprocesses, because Archive needs a multi-hour rehydration before you can read it.<br><br>And the problem I actively engineer against is small files. I coalesce before writing to hit 128MB to 1GB, and on Delta tables I run OPTIMIZE and enable Auto Optimize so the file sizes stay healthy.\"",
      followups: [
        "\"Raw data must be kept 7 years but is rarely read after 60 days — design the lifecycle.\"",
        "\"A job reads a table and it's slow; the table has 2 million tiny files. Fix?\"",
        "\"What breaks if you Archive-tier data a nightly job still reads?\""
      ]
    }
  ]
},

adf: {
  intro: {
    title: "Azure Data Factory — orchestration & ingestion (pipelines, IR, triggers, patterns)",
    desc: "ADF is the control plane: it schedules, moves data, and calls the compute. Interviewers test whether you know its boundaries (orchestration, not heavy transform), the Integration Runtime types, how you parameterize for reuse, incremental copy, and how you'd trigger and monitor Databricks from it. Getting the ADF-vs-Databricks split right is the whole game."
  },
  cards: [
    {
      title: "What ADF is (and is NOT) — Copy activity, Data Flows, and the boundary",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "ADF is a serverless orchestrator + data-mover. Its two workhorses: the Copy activity (extract from a source, load to a sink, 100+ connectors — this is your E and L) and control-flow activities (ForEach, If, Until, Lookup, Execute Pipeline, and activities that call external compute like Databricks/Stored Proc/Functions). Mapping Data Flows are ADF's visual transform that secretly spins up a Spark cluster — usable, but you lose version control, unit testing, and fine cost control, so real transform logic belongs in Databricks notebooks that ADF triggers. The clean mental model: ADF = the conductor and the courier; the actual playing happens in Databricks.",
      noteLabel: "Model answer:",
      note: "\"ADF is a serverless orchestrator and data-mover, not a transformation engine.<br><br>Its Copy activity does the extract and load across a hundred-plus connectors. Its control-flow activities — ForEach, If, Lookup, Execute Pipeline — wire the steps together and call external compute like a Databricks notebook.<br><br>ADF does have Mapping Data Flows, which run Spark under the hood, but I keep real logic out of them. You lose version control, unit testing, and cost control.<br><br>So the split I hold is: ADF conducts and moves, Databricks computes. That keeps transformation logic in code that's reviewed and tested.\"",
      followups: [
        "\"An interviewer says 'just do the joins in a Data Flow' — what's your pushback?\"",
        "\"What are the E, T, and L of ELT mapped onto ADF and Databricks?\"",
        "\"How does ADF actually run a Databricks transformation?\""
      ]
    },
    {
      title: "Integration Runtime — the compute behind every activity",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Every ADF activity runs on an Integration Runtime (IR), and there are three. Azure IR = the default, fully managed, for cloud-to-cloud copy and Data Flow Spark compute. Self-Hosted IR (SHIR) = an agent you install on a VM/on-prem box so ADF can reach private/on-prem sources behind a firewall (it dials out, so no inbound ports) — this is the answer to 'how does ADF read on-prem SQL Server'. Azure-SSIS IR = a managed cluster to lift-and-shift existing SSIS packages. Knowing which IR a scenario needs — especially SHIR for hybrid connectivity — is a very common question.",
      noteLabel: "Model answer:",
      note: "\"Every activity runs on an Integration Runtime, and there are three.<br><br>The Azure IR is the managed default for cloud-to-cloud copy and Data Flow compute.<br><br>The Self-Hosted IR is an agent I install on a machine inside the private network, so ADF can reach on-prem or firewalled sources. It dials outbound, so I don't have to open inbound ports. That's how ADF reaches an on-prem SQL Server.<br><br>The SSIS IR is a managed cluster for lifting existing SSIS packages into Azure.<br><br>So for a hybrid pipeline, the key piece is a Self-Hosted IR bridging on-prem to cloud.\"",
      followups: [
        "\"On-prem source behind a firewall — which IR, and why is no inbound port needed?\"",
        "\"You're only copying between two Azure services — which IR?\"",
        "\"What's the Azure-SSIS IR for?\""
      ]
    },
    {
      title: "Parameterization & metadata-driven pipelines — one pipeline, many tables",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The senior ADF pattern is NOT one pipeline per table — it's a metadata-driven pipeline. You keep a control table (in SQL or a config file) listing each source table, its watermark column, and its sink path; a Lookup activity reads that list, a ForEach loops over it, and a single parameterized Copy activity ingests each one. Add linked-service and dataset parameters so the same pipeline points at different servers per environment (dev/test/prod). This turns 200 near-identical pipelines into one, and onboarding a new table becomes a row in a table, not a deployment.",
      code: "# Metadata-driven ingestion, conceptually:\n# 1. Lookup: SELECT table_name, watermark_col, sink_path FROM control.ingest_config\n# 2. ForEach item in Lookup.output:\n#      Copy activity, parameterized:\n#        source query: SELECT * FROM @{item.table_name}\n#                      WHERE @{item.watermark_col} > '@{lastRun}'\n#        sink:         @{item.sink_path}/ingest_date=@{utcnow('yyyy-MM-dd')}\n# Onboarding a new table = INSERT one row into control.ingest_config.",
      noteLabel: "Model answer:",
      note: "\"I don't build one pipeline per table. I build one metadata-driven pipeline.<br><br>A control table lists each source table, its watermark column, and its sink. A Lookup reads that list, a ForEach loops over it, and a single parameterized Copy activity ingests each one.<br><br>I parameterize the linked services and datasets too, so the same pipeline targets dev, test, or prod by swapping parameters.<br><br>The payoff is huge: onboarding a new table is inserting a row into the control table, not writing and deploying a new pipeline. It collapses hundreds of near-identical pipelines into one.\"",
      followups: [
        "\"You need to ingest 150 tables with the same shape — how many pipelines do you build?\"",
        "\"How does the same pipeline point at dev vs prod databases?\"",
        "\"Where do you store the watermark for incremental loads?\""
      ]
    },
    {
      title: "Triggers, incremental copy & monitoring — running it in production",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Three production concerns. Triggers: schedule triggers (wall-clock), tumbling-window triggers (fixed, non-overlapping windows with dependency + retry + backfill — the choice for reliable incremental loads), and event triggers (fire on a blob landing in ADLS). Incremental copy: track a high-watermark (max modified timestamp or an ID) per table, persisted in a control table, so each run pulls only rows past the last watermark — never a full reload. Monitoring & CI/CD: ADF integrates with Git (author in a feature branch, publish from main), deploys across environments via ARM templates or the newer deployment tooling, and pipeline runs are monitored in Azure Monitor with alerting on failures.",
      noteLabel: "Model answer:",
      note: "\"Three things I set up for production.<br><br>Triggers: for reliable incremental loads I use tumbling-window triggers, because they give fixed non-overlapping windows with built-in dependency, retry, and backfill. Event triggers fire on a blob landing when I need file-driven ingestion.<br><br>Incremental copy: I persist a high-watermark per table in a control table — the max modified timestamp or ID from the last run — so each run only pulls new rows. Never a full reload.<br><br>And CI/CD: ADF is wired to Git, so I author on a branch and promote across environments with ARM templates. Runs are monitored in Azure Monitor with alerts on failure.\"",
      followups: [
        "\"Schedule trigger vs tumbling-window trigger — when does the difference matter?\"",
        "\"A nightly copy re-loads the whole 500M-row table. How do you make it incremental?\"",
        "\"How do you promote an ADF pipeline from dev to prod?\""
      ]
    }
  ]
},

databricks: {
  intro: {
    title: "Azure Databricks — the transformation engine (Spark, Delta, Unity Catalog, jobs)",
    desc: "Databricks is where the real compute lives on Azure. Because there's a dedicated Spark/Databricks module elsewhere, this tab focuses on the Azure-specific angles interviewers push: how it authenticates to ADLS, Unity Catalog governance, cluster/compute choices for cost, how ADF drives it, and where it overlaps (and competes) with Synapse."
  },
  cards: [
    {
      title: "How Databricks reaches ADLS — the auth question you WILL get",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Connecting Databricks to ADLS securely is a top interview question. The wrong answer is putting a storage account key in a notebook. The right progression: use a Managed Identity / service principal, ideally surfaced through Unity Catalog storage credentials + external locations so access is governed centrally and no secrets live in code. If you must use a service principal directly, its secret goes in a Databricks Secret Scope backed by Azure Key Vault — never inline. Older material mentions mounting storage with dbutils.fs.mount; mounts are now discouraged in favor of Unity Catalog external locations and direct abfss paths.",
      code: "# GOOD (Unity Catalog): access governed, no secrets in code\nspark.read.format(\"delta\").load(\n  \"abfss://silver@mylake.dfs.core.windows.net/claims\")\n\n# ACCEPTABLE (service principal via Key Vault-backed secret scope):\nspark.conf.set(\"fs.azure.account.oauth2.client.secret\",\n  dbutils.secrets.get(scope=\"kv-scope\", key=\"sp-secret\"))\n\n# WRONG: account key inline in the notebook — never do this",
      noteLabel: "Model answer:",
      note: "\"The wrong answer is a storage account key pasted in a notebook.<br><br>My default now is Unity Catalog. I register a storage credential backed by a managed identity and an external location, so access is governed centrally and there are no secrets in code.<br><br>If I have to use a service principal directly, its secret lives in a Databricks secret scope backed by Azure Key Vault, and I read it with dbutils.secrets.get — never inline.<br><br>I avoid the old mount approach; direct abfss paths through Unity Catalog are the current pattern.\"",
      followups: [
        "\"A candidate pastes a storage key in the notebook — what do you change?\"",
        "\"What does Unity Catalog change about how Databricks accesses storage?\"",
        "\"Where does a service principal's secret belong?\""
      ]
    },
    {
      title: "Unity Catalog — governance across workspaces",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Unity Catalog is Databricks' centralized governance layer: a three-level namespace (catalog.schema.table) shared across all workspaces in an account, with one place to grant/revoke access, plus column/row-level security, data lineage, and auditing. Before UC, access was per-workspace and messy (Hive metastore + mount points + table ACLs). For Azure DEs, UC is what lets you say 'the finance catalog is readable by the analytics group, and I can see the lineage from raw to the gold table that feeds Power BI'. It governs external locations (the ADLS paths above) so storage access and table access are managed together.",
      noteLabel: "Model answer:",
      note: "\"Unity Catalog is the centralized governance layer across all my Databricks workspaces.<br><br>It gives a three-level namespace — catalog, schema, table — with one place to grant and revoke, plus row and column-level security, lineage, and audit logs.<br><br>Before it, governance was per-workspace through the Hive metastore, mounts, and table ACLs, which didn't scale.<br><br>The practical win is that storage access and table access are governed together: an external location points at an ADLS path, and I grant on the catalog. So I can say the finance catalog is readable by analytics, and trace lineage from raw all the way to the gold table feeding Power BI.\"",
      followups: [
        "\"How do you grant one team read on curated tables but not raw?\"",
        "\"What did teams use before Unity Catalog, and why was it painful?\"",
        "\"How does Unity Catalog help with a data-lineage or audit question?\""
      ]
    },
    {
      title: "Compute & cost — job clusters, pools, Photon, and not overspending",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Databricks cost is mostly compute, and interviewers check you won't burn money. Key levers: use job clusters (spun up per job, torn down after) for scheduled pipelines, NOT an always-on all-purpose cluster — all-purpose is for interactive notebooks only. Auto-termination on idle clusters. Autoscaling min/max workers sized to the job. Spot/low-priority VMs for fault-tolerant workloads. Photon (the vectorized C++ engine) for SQL/DataFrame-heavy jobs where it earns its DBU premium. And the cost has two parts: the Azure VM cost plus Databricks' DBU cost — you pay both. The classic mistake is running production jobs on a shared interactive cluster that never shuts off.",
      noteLabel: "Model answer:",
      note: "\"Databricks cost is mostly compute, so I run scheduled work on job clusters that spin up for the run and tear down after. All-purpose clusters are only for interactive notebooks.<br><br>I set auto-termination on idle, autoscale workers to the job's size, and use spot or low-priority VMs for anything fault-tolerant.<br><br>For SQL and DataFrame-heavy jobs I enable Photon, the vectorized engine, when it earns its DBU premium.<br><br>And I keep in mind the bill is two parts — the Azure VM cost plus the DBU cost. The classic waste I avoid is production jobs pinned to a shared interactive cluster that never shuts off.\"",
      followups: [
        "\"A team runs all nightly jobs on one always-on cluster — what's wrong and what do you change?\"",
        "\"Job cluster vs all-purpose cluster — when each?\"",
        "\"What two cost components make up a Databricks bill?\""
      ]
    }
  ]
},

synapse: {
  intro: {
    title: "Synapse Analytics — warehousing & serving (dedicated vs serverless, distributions)",
    desc: "Synapse is Azure's analytics umbrella and the usual serving layer for BI. Interviewers probe the split between its dedicated SQL pool (a provisioned MPP warehouse, the Redshift-analog you tune with distributions) and its serverless SQL pool (query-in-place over ADLS, the Athena-analog), plus where Fabric fits now. Getting the dedicated-pool distribution model right is the deepest question here."
  },
  cards: [
    {
      title: "Dedicated vs serverless SQL pool — the core Synapse decision",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Synapse has two SQL engines and mixing them up is a red flag. Dedicated SQL pool = a provisioned, always-on MPP data warehouse (formerly Azure SQL DW): you pre-buy compute (DWUs), data is loaded and stored in the pool across distributions, and it's built for fast, concurrent, repeated BI queries on curated marts. Serverless SQL pool = no infrastructure, query files IN PLACE on ADLS with T-SQL (OPENROWSET/external tables), billed per TB scanned — the Athena analog, for ad-hoc exploration and light ELT. The rule: serverless to explore the lake cheaply and occasionally; dedicated when BI needs guaranteed low latency and high concurrency on loaded, curated data.",
      noteLabel: "Model answer:",
      note: "\"Synapse has two SQL engines and I keep them straight.<br><br>The dedicated SQL pool is a provisioned MPP warehouse. I pre-buy compute in DWUs, load data into it across distributions, and it's built for fast, concurrent, repeated BI queries on curated marts.<br><br>The serverless SQL pool has no infrastructure — I query files in place on ADLS with T-SQL and pay per terabyte scanned. It's the Athena analog, for ad-hoc exploration and light ELT.<br><br>So I explore the lake with serverless, and I load a dedicated pool only when BI needs guaranteed low latency and high concurrency.\"",
      followups: [
        "\"Analysts run 300 concurrent dashboard queries all day — serverless or dedicated pool?\"",
        "\"You want to peek at a new Parquet dataset once — which engine, and why?\"",
        "\"How is the serverless SQL pool billed?\""
      ]
    },
    {
      title: "Distributions — hash, round-robin, replicated (the Redshift-DISTKEY question)",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A dedicated pool spreads each table across 60 distributions, and how you distribute governs whether joins are local or shuffle data across nodes — the exact analog of Redshift's DISTKEY. Three options: HASH (distribute by a column; pick the common join key on big fact tables so matching rows co-locate and joins are local), ROUND_ROBIN (even but random spread; fine for staging/load tables with no obvious join key), REPLICATE (full copy on every node; for small dimensions so fact↔dim joins need no movement). The classic tuning: hash-distribute the fact on its join key, replicate the small dims. Also choose a clustered columnstore index (default, for big analytic tables) and mind data-movement (shuffle) in query plans.",
      code: "-- Fact: hash on the join key so joins are local\nCREATE TABLE gold.fct_claims ( ... )\nWITH ( DISTRIBUTION = HASH(provider_id),\n       CLUSTERED COLUMNSTORE INDEX );\n\n-- Small dimension: replicate to every node\nCREATE TABLE gold.dim_provider ( ... )\nWITH ( DISTRIBUTION = REPLICATE );\n\n-- Staging with no natural key: round-robin\nCREATE TABLE stg.load_batch ( ... )\nWITH ( DISTRIBUTION = ROUND_ROBIN );",
      noteLabel: "Model answer:",
      note: "\"A dedicated pool spreads every table across 60 distributions, and the distribution choice decides whether a join is local or shuffles data — it's Redshift's DISTKEY by another name.<br><br>I hash-distribute big fact tables on their common join key, so matching rows co-locate and the join stays local. I replicate small dimensions so they're on every node and the fact-to-dim join needs no movement. And I round-robin staging tables that have no natural key.<br><br>I use clustered columnstore for the big analytic tables, and when I see data movement in a query plan, that's my signal the distribution is wrong.\"",
      followups: [
        "\"A fact↔dim join shuffles huge data every run — how do you distribute the two tables?\"",
        "\"When is ROUND_ROBIN the right choice?\"",
        "\"You see 'data movement' in the query plan — what does it tell you?\""
      ]
    },
    {
      title: "Loading, and where Microsoft Fabric fits",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Load a dedicated pool with COPY INTO (or PolyBase) reading many files from ADLS in parallel — never row-by-row INSERTs, which serialize and crawl (same lesson as Redshift COPY). Stage as Parquet, load in bulk, then transform with CTAS. On the horizon: Microsoft Fabric is Microsoft's newer unified SaaS analytics platform (OneLake storage, Data Factory, Synapse-style engines, Power BI, all in one) built on the open Delta/Parquet-based OneLake. Interviewers may ask if it 'replaces' Synapse/ADF — the honest answer is it's the strategic direction that folds them together, but plenty of production stacks still run classic ADF + Synapse + Databricks, so know both.",
      noteLabel: "Model answer:",
      note: "\"I load a dedicated pool with COPY INTO reading many Parquet files from ADLS in parallel. Never row-by-row INSERTs — they serialize and crawl, same lesson as Redshift's COPY. I stage as Parquet, bulk-load, then transform with CTAS.<br><br>On Fabric: it's Microsoft's newer unified SaaS platform — OneLake storage, Data Factory, Synapse engines, and Power BI folded together on open Delta and Parquet.<br><br>If asked whether it replaces Synapse and ADF, I'd say it's the strategic direction that unifies them, but a lot of production still runs classic ADF plus Synapse plus Databricks. So I know both and don't assume a greenfield Fabric stack.\"",
      followups: [
        "\"How do you bulk-load a dedicated pool from ADLS, and what do you avoid?\"",
        "\"What is Microsoft Fabric, and does it replace Synapse and ADF?\"",
        "\"What is OneLake?\""
      ]
    }
  ]
},

crosscloud: {
  intro: {
    title: "Cross-cloud equivalents — mapping Azure to AWS & GCP",
    desc: "\"You did this on Azure — how would you do it on AWS?\" is a near-guaranteed follow-up, because teams are multi-cloud and interviewers want to know you understand the roles, not just one vendor's brand names. This tab lines the services up so you can translate on the fly."
  },
  cards: [
    {
      title: "The service-by-service mapping",
      badge: "fundamentals",
      conceptLabel: "The translation table:",
      concept: "Object storage / lake: ADLS Gen2 ≈ S3 ≈ Google Cloud Storage. Orchestration & ingestion: ADF ≈ AWS Glue (jobs) + Step Functions / MWAA (Airflow) ≈ Cloud Composer / Dataflow. Managed Spark: Azure Databricks ≈ AWS Databricks/EMR/Glue ETL ≈ Dataproc. Provisioned MPP warehouse: Synapse dedicated pool ≈ Redshift ≈ BigQuery (though BigQuery is serverless). Query-in-place over the lake: Synapse serverless ≈ Athena ≈ BigQuery external tables. Streaming ingest: Event Hubs ≈ Kinesis ≈ Pub/Sub. Secrets: Key Vault ≈ Secrets Manager ≈ Secret Manager. Identity: Entra ID ≈ IAM ≈ Cloud IAM. The point of the table isn't memorization — it's that each cloud has one box for each job.",
      noteLabel: "Model answer:",
      note: "\"I translate by role, not brand.<br><br>The lake is ADLS on Azure, S3 on AWS, GCS on Google. Orchestration is ADF, versus Glue plus Step Functions or MWAA on AWS, and Composer on GCP. Managed Spark is Databricks or Synapse Spark, versus EMR or Glue, versus Dataproc.<br><br>The provisioned warehouse is a Synapse dedicated pool, like Redshift, while BigQuery plays that role serverlessly. Query-in-place is Synapse serverless, like Athena or BigQuery external tables.<br><br>Streaming is Event Hubs, Kinesis, or Pub/Sub. Once I see it as one box per job, moving a design across clouds is mechanical.\"",
      followups: [
        "\"You built an ADF + Synapse pipeline — rebuild it on AWS. What are the pieces?\"",
        "\"Which Azure service has the least clean equivalent on GCP, and why?\"",
        "\"Event Hubs to Kinesis — what actually changes for your code?\""
      ]
    },
    {
      title: "Where the analogies break — don't over-map",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The mapping gets you 80% there, but interviewers reward knowing the seams. BigQuery is serverless with no dist/sort tuning — so a Synapse-dedicated or Redshift 'set the distribution key' instinct doesn't transfer; you optimize BigQuery via partitioning, clustering, and not scanning columns. Event Hubs speaks the Kafka protocol but isn't Kafka — no full Kafka Streams/Connect ecosystem, capped retention semantics. ADF is more of a pure orchestrator+mover than Glue, which bundles a Spark ETL engine and a catalog. And Synapse bundles several engines under one workspace, so 'Synapse' alone is ambiguous — always say which pool. Naming a seam like this is the senior signal on a cross-cloud question.",
      noteLabel: "Model answer:",
      note: "\"The mapping gets me most of the way, but I flag the seams.<br><br>BigQuery is serverless with no distribution or sort keys, so the Redshift-or-Synapse tuning instinct doesn't carry — there I optimize with partitioning and clustering and by not scanning columns.<br><br>Event Hubs speaks the Kafka protocol but isn't full Kafka, so I don't assume the whole Streams and Connect ecosystem.<br><br>ADF is a purer orchestrator and mover than Glue, which also bundles a Spark engine and a catalog. And 'Synapse' is ambiguous because it's several engines in one workspace, so I always name the pool. Calling out a seam like that is usually what the interviewer is fishing for.\"",
      followups: [
        "\"Moving Synapse-dedicated logic to BigQuery — what tuning stops applying?\"",
        "\"Why can't you treat Event Hubs as a drop-in Kafka?\"",
        "\"What's imprecise about saying just 'Synapse'?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview Prep — Azure DE questions with model answers",
    desc: "The questions an Azure-focused DE screen actually asks, structured basic → advanced. Each hides its model answer until you expand it, and ends with the follow-up cross-questions a real interviewer digs with. Practice by answering aloud first, then checking."
  },
  cards: [
    {
      title: "\"Walk me through an end-to-end pipeline you'd build on Azure.\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "Whether you can name the right service for each stage and keep transform logic out of the orchestrator — the single most revealing Azure question.",
      noteLabel: "Model answer:",
      note: "\"Sources land raw in ADLS Gen2 — ADF's Copy activity for batch and relational sources, Event Hubs for streaming — always an immutable raw copy partitioned by ingest date.<br><br>ADF orchestrates the pipeline and, on each step, triggers a Databricks notebook that transforms across the medallion layers as Delta tables — bronze to silver to gold.<br><br>Curated gold marts are served either from a Synapse dedicated pool or Databricks SQL, and Power BI reads from there.<br><br>Governance runs through Unity Catalog, secrets through Key Vault, and identity through managed identities so there are no keys in code. ADF conducts and moves; Databricks computes; ADLS stores; Synapse serves.\"",
      followups: [
        "\"Where's the transform logic, and why not in ADF?\"",
        "\"How does each service authenticate to storage without secrets in code?\"",
        "\"Which parts are batch and which streaming, and how do they meet?\""
      ]
    },
    {
      title: "\"How does ADF securely read an on-prem SQL Server?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "Integration Runtime knowledge and hybrid-connectivity understanding — a very common, very concrete question.",
      noteLabel: "Model answer:",
      note: "\"I install a Self-Hosted Integration Runtime on a machine inside the on-prem network. ADF's activities then run on that IR to reach the SQL Server.<br><br>The key security property is that the SHIR dials outbound to Azure — so I don't open any inbound firewall ports. Credentials are stored in a linked service backed by Key Vault, not in the pipeline.<br><br>For the pull itself I do an incremental copy on a watermark column, so I'm moving only changed rows, and I land them as Parquet in ADLS.\"",
      followups: [
        "\"Why is no inbound port needed?\"",
        "\"Where do the SQL Server credentials live?\"",
        "\"How do you make the copy incremental instead of full?\""
      ]
    },
    {
      title: "\"Databricks needs to read ADLS — how do you set up access?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Whether you'll leak a storage key, and whether you know the current (Unity Catalog) pattern vs the deprecated mount approach.",
      noteLabel: "Model answer:",
      note: "\"My default is Unity Catalog: a storage credential backed by a managed identity plus an external location over the ADLS path, so access is governed centrally and there are no secrets in code.<br><br>If I must use a service principal directly, its secret lives in a Databricks secret scope backed by Azure Key Vault, read with dbutils.secrets.get — never inline in the notebook.<br><br>I avoid account keys entirely, and I avoid the old dbutils mount approach in favor of direct abfss paths through Unity Catalog.\"",
      followups: [
        "\"Someone hardcoded the account key — what do you replace it with?\"",
        "\"Why are storage mounts discouraged now?\"",
        "\"What does Unity Catalog govern beyond just the table?\""
      ]
    },
    {
      title: "\"Synapse dedicated vs serverless pool — when do you use each?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Whether you understand provisioned MPP vs query-in-place, and can map them to concurrency/cost.",
      noteLabel: "Model answer:",
      note: "\"The dedicated pool is a provisioned MPP warehouse — I pre-buy compute, load curated data across distributions, and it gives fast, concurrent, repeated BI queries. I reach for it when a dashboard workload needs guaranteed low latency and high concurrency.<br><br>The serverless pool has no infrastructure — I query files in place on ADLS with T-SQL and pay per terabyte scanned. It's the Athena analog, for ad-hoc exploration and light ELT.<br><br>So I explore the lake cheaply with serverless, and only load a dedicated pool when concurrency and latency demand it.\"",
      followups: [
        "\"300 concurrent dashboard users — which pool, and why?\"",
        "\"How is each one billed?\"",
        "\"Can serverless query data that isn't loaded anywhere? How?\""
      ]
    },
    {
      title: "\"A fact↔dimension join in a dedicated pool shuffles data every run. Fix it.\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "The distribution model — the deepest dedicated-pool question, and the direct analog of Redshift DISTKEY.",
      noteLabel: "Model answer:",
      note: "\"The shuffle means the two tables aren't co-located on the join key.<br><br>I hash-distribute the large fact table on the join key, so matching rows land in the same distribution and the join becomes local. I replicate the small dimension so a full copy sits on every node and the fact-to-dim join needs no movement at all.<br><br>After that I check the query plan — 'data movement' disappearing confirms the fix. I'd also make sure the big fact is on a clustered columnstore index.\"",
      followups: [
        "\"Why replicate the dimension instead of hashing it too?\"",
        "\"How many distributions does a dedicated pool have?\"",
        "\"What in the query plan tells you the distribution is wrong?\""
      ]
    },
    {
      title: "\"How do you control Databricks and Synapse costs?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Whether you'll quietly burn money, and whether you know the specific cost levers of each engine.",
      noteLabel: "Model answer:",
      note: "\"On Databricks I run scheduled work on job clusters that spin up and tear down, not always-on interactive clusters. I set auto-termination, autoscale to the job, use spot VMs where the work tolerates it, and enable Photon only where it pays. And I remember the bill is Azure VM cost plus DBUs.<br><br>On a Synapse dedicated pool I pause it when it's idle, since I'm paying for provisioned DWUs whether or not queries run, and I right-size the DWUs. For occasional querying I use the serverless pool and pay per scan instead.<br><br>Across both, good partitioning and Parquet cut bytes scanned, which is the cost driver on the pay-per-scan engines.\"",
      followups: [
        "\"A dedicated pool runs 24/7 but is only queried 9-5 — what do you do?\"",
        "\"What are the two components of a Databricks bill?\"",
        "\"How does partitioning affect a serverless-pool bill?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "On Azure, which service is the data lake / storage layer that everything else reads from?",
    options: [
      "Azure Data Factory",
      "ADLS Gen2 — Blob storage with a hierarchical namespace, decoupled from compute",
      "Synapse dedicated SQL pool",
      "Azure Databricks DBFS"
    ],
    correct: 1
  },
  {
    q: "Where should real transformation logic live in an Azure pipeline?",
    options: [
      "In ADF Mapping Data Flows, since they run Spark",
      "In Databricks notebooks/jobs that ADF triggers — ADF orchestrates and moves, it doesn't own transform logic",
      "In the Copy activity",
      "In the Synapse serverless SQL pool"
    ],
    correct: 1
  },
  {
    q: "How does ADF securely read an on-prem SQL Server behind a corporate firewall?",
    options: [
      "Open an inbound firewall port to Azure",
      "A Self-Hosted Integration Runtime installed on-prem that dials outbound — no inbound port needed",
      "The Azure Integration Runtime, which reaches on-prem directly",
      "Copy the database to a public endpoint first"
    ],
    correct: 1
  },
  {
    q: "You need to ingest 150 same-shaped tables. How many ADF pipelines should you build?",
    options: [
      "150 — one per table",
      "One metadata-driven pipeline: a control table + Lookup + ForEach + a parameterized Copy activity",
      "Three, one per environment",
      "One per source database"
    ],
    correct: 1
  },
  {
    q: "A Databricks notebook needs to read ADLS. What's the correct, secure approach?",
    options: [
      "Paste the storage account key into the notebook",
      "Unity Catalog storage credentials + external locations (managed identity), or a service principal secret in a Key Vault-backed secret scope",
      "Email the key to the team",
      "Make the container public"
    ],
    correct: 1
  },
  {
    q: "Synapse dedicated SQL pool vs serverless SQL pool — the key difference?",
    options: [
      "They're the same engine with different names",
      "Dedicated is a provisioned MPP warehouse (data loaded, pre-bought DWUs); serverless queries files in place on ADLS, billed per TB scanned",
      "Serverless is always faster and cheaper",
      "Dedicated can't do joins"
    ],
    correct: 1
  },
  {
    q: "A fact↔dimension join in a dedicated SQL pool shuffles huge data every run. Best fix?",
    options: [
      "Add more DWUs",
      "HASH-distribute the fact on the join key and REPLICATE the small dimension so rows co-locate and the join is local",
      "Convert both tables to CSV",
      "Run the query in the serverless pool instead"
    ],
    correct: 1
  },
  {
    q: "A Synapse dedicated pool runs 24/7 but is only queried during business hours. What do you do?",
    options: [
      "Nothing — you can't change the cost",
      "Pause the pool when idle (you pay for provisioned DWUs regardless), and/or use the serverless pool for occasional queries",
      "Add more nodes",
      "Switch the region"
    ],
    correct: 1
  },
  {
    q: "What does enabling the hierarchical namespace (Gen2) give you over plain Blob storage?",
    options: [
      "Nothing meaningful",
      "Real directories: atomic directory rename/delete (which Spark/Delta commits rely on) plus POSIX ACLs — but it must be set at account creation",
      "Automatic Parquet conversion",
      "Unlimited free storage"
    ],
    correct: 1
  },
  {
    q: "Mapping to AWS: ADF, ADLS Gen2, and Event Hubs correspond most closely to…",
    options: [
      "Lambda, EBS, and SNS",
      "Glue/Step Functions (orchestration), S3 (lake), and Kinesis (streaming ingest)",
      "Redshift, RDS, and SQS",
      "Athena, DynamoDB, and Kafka"
    ],
    correct: 1
  }
];
