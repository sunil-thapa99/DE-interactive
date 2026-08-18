// Content data for the Data Engineering System Design module.
const MODULE_ID = "sysdesign";
const CONTENT = {

overview: {
  intro: {
    title: "How a Data Engineering system-design round actually works",
    desc: "A DE design round is not 'draw boxes.' It's a conversation where YOU drive: you turn a vague prompt ('design a fraud pipeline') into a bounded problem by stating assumptions, then walk ingestion → storage → transform → serve, and finally stress it with scale, failure, and cost. This module gives you a repeatable framework, reusable building blocks, five full case studies (leaning finance + healthcare), and sharp active-recall Q&A. Every answer here names concrete tech, the SLA/consistency trade-off, the failure mode, and the cost lever — because that's what separates a senior from someone who has only wired up a DAG."
  },
  diagram: [
    { label: "Sources\n(OLTP, events,\nfiles, APIs)", hl: true },
    { arrow: true },
    { label: "Ingestion\n(CDC, Kafka,\nbatch loads)", hl: true },
    { arrow: true },
    { label: "Storage\n(lake / warehouse\nbronze→silver→gold)", hl: true },
    { arrow: true },
    { label: "Transform\n(Spark, dbt,\nstream proc)", hl: true },
    { arrow: true },
    { label: "Serve\n(BI, ML, APIs,\nreverse ETL)" },
  ],
  cards: [
    {
      title: "The prompt is deliberately vague — your first job is to bound it",
      badge: "framework",
      conceptLabel: "Concept:",
      concept: "Interviewers open with something like 'design a pipeline for transaction data' precisely to see whether you clarify or start drawing. A senior candidate spends the first 3–5 minutes converting the open prompt into a spec by asking about six dimensions: data VOLUME (rows/day, bytes/day, peak vs average), LATENCY SLA (how fresh must the served data be — seconds, minutes, hours, next-day?), CONSISTENCY (is a duplicate or a missed record catastrophic, like money, or tolerable?), ACCESS PATTERNS (who reads it — dashboards, ad-hoc SQL, ML features, a downstream service?), RETENTION/COMPLIANCE (how long, PII/PHI, HIPAA/PCI, right-to-be-forgotten?), and BUDGET (is this cost-sensitive, or latency-at-any-cost?).",
      navLabel: "Why this wins the round:",
      nav: "Every downstream decision — batch vs streaming, lake vs warehouse, exactly-once vs at-least-once — falls out of those answers. If you skip them you'll design the wrong system confidently, which is worse than designing nothing. State your assumptions out loud ('I'll assume 50M transactions/day, sub-minute freshness for risk scoring, and that a double-counted transaction is unacceptable') so the interviewer can correct you early instead of watching you build on sand.",
      noteLabel: "The one-liner to internalize:",
      note: "Requirements first, architecture second. The highest-signal opening question in the whole round is simple: 'What's the freshness SLA, and is a duplicate acceptable?'"
    },
    {
      title: "The repeatable framework: clarify → sketch → drill → stress",
      badge: "framework",
      conceptLabel: "Concept:",
      concept: "Use the same skeleton every time so you never freeze. (1) CLARIFY the six dimensions above and write the numbers down. (2) SKETCH the high-level flow end to end in one line — sources → ingestion → storage → transform → serve — and get agreement before you go deep. (3) DRILL each stage in order: how data lands (batch/CDC/stream), where it's stored (file format, layout, table type), how it's transformed (medallion layers, dbt/Spark), how it's served (warehouse tables, BI, ML features, APIs). (4) STRESS it: scale it 10x, break a component, and make it cheaper.",
      navLabel: "How to run it live:",
      nav: "Narrate the framework so the interviewer knows where you are ('let me lock requirements, then I'll draw the spine, then go stage by stage, then we'll scale and break it'). Timebox yourself — don't spend 20 minutes gold-plating ingestion and leave no time for the serving layer or failure handling, which is usually where the senior signal lives. Leave 5 minutes for the stress test; that's the part junior candidates never reach.",
      noteLabel: "Reference spine:",
      note: "Sources → Ingestion (CDC / Kafka / batch) → Landing/Bronze (raw, immutable) → Silver (cleaned, conformed, deduped) → Gold (business marts / aggregates) → Serve (BI, ML, reverse-ETL).<br><br>Almost every DE design is a variation on this one line. Memorize it, then specialize it per prompt."
    },
    {
      title: "Batch, streaming, and the freshness SLA that decides between them",
      badge: "framework",
      conceptLabel: "Concept:",
      concept: "The single most consequential fork is batch vs streaming, and it's driven entirely by the freshness SLA, not by what's fashionable. If the business can tolerate hourly or daily data (most reporting, most dimensional warehouses), batch is cheaper, simpler, easier to reason about, and trivially reprocessable. If decisions must be made in seconds (fraud/risk scoring, live ops metrics, alerting), you need streaming — Kafka + a stream processor — and you accept the added complexity of state, watermarks, and exactly-once concerns.",
      navLabel: "How seniors answer 'batch or streaming?':",
      nav: "Never say 'streaming because real-time is better.' Say: 'What's the freshness SLA and what decision does the data drive? If sub-minute risk decisions, streaming; if daily executive dashboards, batch — streaming there is pure cost and operational burden for no business value.' Then note the middle ground: micro-batch (Spark Structured Streaming, Snowpipe, dbt every 5 min) often hits 'near-real-time' at a fraction of true-streaming complexity.",
      noteLabel: "The trap:",
      note: "The trap is reaching for Kafka/Flink when the SLA is 'next morning.'<br><br>Streaming buys you low latency, but you pay for it: more operational complexity, harder reprocessing, and 24/7 on-call.<br><br>Only pay that price when the SLA demands it. And say so out loud."
    },
    {
      title: "Drive the conversation — silence and box-drawing both lose",
      badge: "meta",
      conceptLabel: "Concept:",
      concept: "The round grades your reasoning process as much as the final diagram. Two failure modes: going silent while you think (the interviewer can't follow your logic), and drawing an elaborate architecture with no justification (looks like memorization). The winning behavior is continuous narration of trade-offs: 'I'll use CDC not query-polling because it doesn't load the source DB; I'll land raw to S3 first so I can always reprocess; I'll dedupe in silver keyed by transaction ID because at-least-once ingestion can duplicate.'",
      navLabel: "The pattern for every decision:",
      nav: "State the choice, the alternative, and why you picked one — in one breath. 'Parquet over CSV because columnar + predicate pushdown cuts scan cost 10x.' 'Warehouse over lake for the serving layer because analysts write SQL and want governed, fast marts.' Each sentence shows you know there WAS a fork and you took the right branch for the stated requirements. That's the entire signal.",
      noteLabel: "Remember:",
      note: "There is rarely one right architecture. There's the right architecture FOR THE STATED REQUIREMENTS.<br><br>Change the SLA or the budget and the answer changes. Make that dependency explicit, and you sound like someone who has actually shipped these systems."
    }
  ]
},

framework: {
  intro: {
    title: "Reusable building blocks — the vocabulary every DE design is assembled from",
    desc: "These are the components you'll compose in every case study. Each card is a decision you'll defend in a round: what it is, the trade-off, the failure mode, and the cost lever. Know them cold and you can build any pipeline live from parts."
  },
  cards: [
    {
      title: "Batch vs streaming vs Lambda/Kappa",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "Batch processes bounded chunks on a schedule (Airflow-triggered Spark/dbt) — simple, cheap, easily reprocessed. Streaming processes unbounded events continuously (Kafka → Flink/Spark Structured Streaming/Kafka Streams) — low latency, stateful, harder to reason about. Lambda architecture runs BOTH a batch layer (accurate, slow) and a speed layer (fast, approximate) and merges them — historically common but you maintain two codebases computing the same thing. Kappa architecture uses ONE streaming pipeline for both real-time and reprocessing (replay the log through the same code) — simpler, now preferred where the stream engine can handle backfill.",
      navLabel: "How to choose:",
      nav: "Default to batch/micro-batch unless the SLA forces streaming. If you need both fresh and historically-accurate numbers, prefer Kappa (one codebase, replay Kafka to reprocess) over Lambda (two codebases that inevitably drift and disagree). Lambda's dual-code maintenance is the classic 'why are the real-time and batch numbers different' incident.",
      followups: [
        "\"Your Lambda batch and speed layers report different daily totals — how do you reconcile, and would Kappa have avoided it?\"",
        "\"The streaming job falls behind by 6 hours during a spike — how do you catch up without losing correctness?\"",
        "\"Make this cheaper: the streaming cluster runs 24/7 but traffic is bursty — what do you change?\""
      ]
    },
    {
      title: "Lake vs warehouse vs lakehouse + the medallion model",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "A data LAKE is cheap object storage (S3/ADLS/GCS) holding raw files in open formats — schema-on-read, flexible, cheap, but no transactions/governance by itself. A data WAREHOUSE (Snowflake, Redshift, BigQuery) is a managed, columnar, ACID, SQL-first store — governed, fast for analytics, more expensive per TB. A LAKEHOUSE (Delta Lake, Iceberg, Hudi on top of the lake) adds ACID transactions, schema enforcement, time travel, and upserts to lake files — warehouse-like guarantees on lake economics. The MEDALLION model layers data as bronze (raw, immutable, append-only), silver (cleaned, deduped, conformed, typed), gold (business-level aggregates and dimensional marts).",
      navLabel: "How to choose:",
      nav: "Land raw to the lake (bronze) always — it's your cheap, replayable source of truth and audit trail. Serve analysts from the warehouse or gold-layer lakehouse tables (governed, fast). Use a lakehouse table format (Iceberg/Delta) when you want upserts/time-travel/schema evolution without paying warehouse storage rates for everything. The medallion split lets you reprocess silver/gold from immutable bronze after any bug.",
      followups: [
        "\"Why land raw to S3 at all if it's going straight into Snowflake — isn't that a redundant copy?\"",
        "\"A transform bug corrupted silver last night — how does the medallion layout let you recover with zero data loss?\"",
        "\"Storage cost is exploding — which layer do you tier to cold storage or drop, and how do you decide retention per layer?\""
      ]
    },
    {
      title: "File formats & partitioning (Parquet, pruning, small files)",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "Columnar formats (Parquet, ORC) store data by column, enabling compression and predicate/projection pushdown so a query reads only the columns and row-groups it needs — often 10x+ less I/O than row-based CSV/JSON. Partitioning physically lays out files by a column (e.g. dt=2026-08-10/) so queries with a filter on that column skip entire directories: partition PRUNING. The catch is the SMALL-FILES problem: streaming or over-partitioning produces millions of tiny files, and each file has fixed read/metadata overhead, so scans and listing become dominated by per-file cost.",
      navLabel: "How to choose:",
      nav: "Parquet/ORC for anything analytical; keep raw source dumps as-is in bronze if needed. Partition by the columns you filter on most (usually a date) and by a coarse high-cardinality dimension only if it prunes real queries — never partition by something with millions of values. Target file sizes of ~128MB–1GB; run compaction (OPTIMIZE / bin-packing) to merge small files, and avoid partitioning so finely that each partition holds kilobytes.",
      followups: [
        "\"Your streaming job writes to S3 every 10s and queries got 5x slower over a month — diagnose and fix.\"",
        "\"An analyst filters on customer_id constantly — should you partition by it? Why or why not?\"",
        "\"Make scans cheaper: the table is 50TB and every dashboard does a full scan — what layout changes cut cost most?\""
      ]
    },
    {
      title: "Change Data Capture (CDC) patterns",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "CDC keeps a warehouse in sync with an OLTP source by capturing row-level changes. Log-based CDC (Debezium reading the DB write-ahead log / binlog) is the gold standard: it captures every insert/update/delete in order with near-zero load on the source and no missed changes. Query-based CDC (polling WHERE updated_at > last_run) is simpler but misses hard deletes, misses intermediate updates between polls, and adds query load. CDC events flow through Kafka, then a consumer applies them as upserts/deletes to the target (typically MERGE into a warehouse table).",
      navLabel: "How to choose:",
      nav: "Prefer log-based (Debezium → Kafka) whenever you can read the DB log — it's complete, ordered, and doesn't hammer the source. Land CDC events to a compacted Kafka topic and/or bronze, then MERGE into silver keyed by primary key. Handle deletes explicitly (tombstones) and be idempotent: replaying a CDC event must not double-apply. Watch initial snapshot cost for large tables (Debezium's incremental snapshot avoids a giant lock).",
      followups: [
        "\"Query-based CDC on updated_at missed some deletes and some fast updates — walk me through both bugs and the log-based fix.\"",
        "\"Debezium's initial snapshot of a 2TB table is locking production — how do you avoid impacting the OLTP source?\"",
        "\"CDC events arrive out of order for the same primary key — how do you guarantee the latest wins on MERGE?\""
      ]
    },
    {
      title: "Idempotency & exactly-once at the sink",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "Distributed pipelines retry, so at-least-once delivery (a record may arrive more than once) is the pragmatic default; true end-to-end exactly-once across external systems is largely a myth. The senior move is to make reprocessing HARMLESS via idempotent sink writes: a MERGE/upsert keyed by a stable business ID, or a dedup on a natural key + event timestamp. Then a duplicate delivery, a retried batch, or a full replay all converge to the same correct state.",
      navLabel: "How to choose:",
      nav: "Design every sink write to be idempotent by construction: MERGE ... ON target.txn_id = source.txn_id, or dedup by (business_key, event_time) keeping the latest. Reserve real transactional exactly-once (Kafka transactions, Flink two-phase commit) for paths where a duplicate is genuinely unfixable AND the sink can't upsert — e.g. counting money via a non-idempotent side effect. Otherwise 'at-least-once + idempotent upsert' is simpler and just as correct.",
      followups: [
        "\"Prove a full replay of yesterday's Kafka topic won't double-count any transaction — what makes it safe?\"",
        "\"The sink is an external payment API that can't upsert — now how do you avoid double charges?\"",
        "\"Two consumers processed the same partition during a rebalance — where exactly does the duplicate get absorbed?\""
      ]
    },
    {
      title: "Schema evolution & data contracts",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "Upstream schemas change — a field is added, renamed, or retyped — and without governance that silently breaks every downstream consumer. A schema registry (Avro/Protobuf + Confluent Schema Registry) enforces compatibility rules on new versions: BACKWARD (new schema reads old data; add-optional-field is safe; upgrade consumers first), FORWARD (old schema reads new data; upgrade producers first), FULL (both). A DATA CONTRACT formalizes this as an agreement between producing and consuming teams — the schema, semantics, SLAs, and ownership — enforced in CI so a breaking change is caught before it ships.",
      navLabel: "How to choose:",
      nav: "Use a registry with BACKWARD compatibility as the default so additive changes are safe and old data still reads. Make schema a contract checked in CI, not tribal knowledge. In the warehouse/lakehouse, prefer formats that support schema evolution (Iceberg/Delta add columns cleanly). Never do implicit 'schema-on-read hope' for critical pipelines — an unexpected type change becomes a silent data-quality incident.",
      followups: [
        "\"A producer team renamed a required field and prod broke at 2am — how does a contract + registry prevent this, and what compatibility mode?\"",
        "\"You must add a non-nullable column to a 10TB Iceberg table with live readers — how, without downtime?\"",
        "\"Who owns the contract when producer and consumer are different teams, and how is it enforced automatically?\""
      ]
    },
    {
      title: "Backfill & reprocessing design",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "A backfill re-runs a pipeline over historical data — because you fixed a bug, added a column, or onboarded a new source. The ability to reprocess cleanly is a design property, not an afterthought: it requires immutable raw data (bronze you never mutate), deterministic transforms (same input → same output, so re-running is safe), and idempotent sinks (re-writing a partition overwrites, not appends). Partition-scoped reprocessing (recompute just dt=2026-07 partitions) beats reprocessing everything.",
      navLabel: "How to choose:",
      nav: "Keep raw immutable and partitioned by ingest date so you can target a window. Make transforms idempotent and partition-overwrite (dynamic partition overwrite / dbt full-refresh of a range / Delta REPLACE WHERE) so a rerun replaces exactly the affected partitions with no duplicates. Run backfills on a separate compute pool at low priority so they don't starve live pipelines. With Kappa, backfill = replay the Kafka log through the same code.",
      followups: [
        "\"A logic bug corrupted the last 30 days of gold tables — reprocess with zero downtime for live dashboards. Walk me through it.\"",
        "\"Your backfill of 2 years of data is competing with the nightly production run for cluster resources — how do you isolate it?\"",
        "\"How do you guarantee the backfill produces IDENTICAL results to the original run for unaffected rows?\""
      ]
    },
    {
      title: "Data-quality gates",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "Bad data is worse than late data — a wrong number in a dashboard erodes trust permanently. Quality gates are automated assertions run as pipeline steps: schema checks, not-null/uniqueness on keys, referential integrity, row-count and freshness anomaly detection, and business-rule checks (e.g. transaction amount ≥ 0). Tools: dbt tests, Great Expectations, Soda, or custom Spark assertions. The gate decides what happens on failure — WARN (log, continue), BLOCK (fail the run, don't publish bad data), or QUARANTINE (route bad rows aside, publish the good ones).",
      navLabel: "How to choose:",
      nav: "Gate at layer boundaries: validate on bronze→silver (structural: schema, keys, nulls) and silver→gold (semantic: business rules, reconciliation totals). BLOCK on critical invariants (primary-key uniqueness, financial totals reconciling) so you never publish corrupt marts; QUARANTINE malformed rows to a dead-letter table so one bad record doesn't fail the batch. Alert on freshness and volume anomalies, not just hard failures — a table that's silently stale is a common outage.",
      followups: [
        "\"A quality gate would BLOCK the whole batch for 3 bad rows out of 50M — is that right? When do you quarantine instead?\"",
        "\"Row count dropped 40% overnight but every hard check passed — how do you catch that class of failure?\"",
        "\"Where do quarantined/rejected records go, and how does someone find and reprocess them?\""
      ]
    },
    {
      title: "Orchestration choice & dependency management",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "Orchestration schedules and sequences pipeline tasks, handles dependencies, retries, backfills, and alerting. Airflow is the incumbent (Python DAGs, huge ecosystem, mature scheduling and backfill). Newer options: Dagster and Prefect (asset-aware, better local dev and typing), dbt's own DAG for SQL transforms, and cloud-native (Step Functions, ADF, Glue Workflows). The core concepts transcend tool: idempotent tasks, explicit dependencies, retries with backoff, SLAs/alerting, and backfill support.",
      navLabel: "How to choose:",
      nav: "Airflow when you need mature scheduling/backfill and the team knows it (and for orchestrating heterogeneous tasks: Spark, dbt, transfers). Consider Dagster/Prefect for asset-lineage-first, typed, testable pipelines. Let dbt own the SQL transform DAG inside the warehouse and have the orchestrator just trigger dbt. Whatever the tool, insist tasks are idempotent and retry-safe so a mid-DAG failure re-runs cleanly.",
      followups: [
        "\"A task fails halfway and Airflow retries it — what property must the task have so the retry doesn't corrupt data?\"",
        "\"You have 500 tables with complex cross-dependencies — how do you avoid one late source blocking everything?\"",
        "\"Would you orchestrate dbt models as individual Airflow tasks or one dbt run? Trade-offs?\""
      ]
    },
    {
      title: "DR & multi-region",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "Disaster recovery is about surviving a region/AZ loss with bounded data loss and downtime, quantified as RPO (recovery point objective — how much data you can lose) and RTO (recovery time objective — how fast you're back). Levers: cross-region replication of object storage and warehouse (S3 CRR, Snowflake database replication + failover), Kafka cross-region (MirrorMaker 2 / Cluster Linking), and infrastructure-as-code so you can rebuild compute anywhere. Active-passive (warm standby you fail over to) is simpler; active-active (both regions serving) is lower-RTO but must handle conflict and replication loops.",
      navLabel: "How to choose:",
      nav: "Start by asking the business for RPO/RTO — don't over-engineer DR the requirements don't need. For most analytics, cross-region replication of the lake + warehouse and IaC to rebuild compute (active-passive) is enough. For always-on operational data, go active-active but design idempotency and dedup so replay after failover doesn't double-count. Always state RPO = replication lag and RTO = failover automation time explicitly.",
      followups: [
        "\"Region us-east goes dark mid-batch — what's your RPO/RTO and exactly what do you fail over first?\"",
        "\"On failover, consumers resume from a replicated Kafka cluster — why won't the raw offsets line up, and how do you handle it?\"",
        "\"Active-active doubles your infra bill — how do you justify it, or when do you talk the business down to active-passive?\""
      ]
    },
    {
      title: "Cost levers — how you make any pipeline cheaper",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "Cost is a first-class design axis at senior level; 'now make it cheaper' is a standard probe. The levers: STORAGE — tier cold data to cheaper classes (S3 IA/Glacier), set per-layer retention, compress + columnar formats. COMPUTE — right-size and auto-suspend warehouses (Snowflake auto-suspend), use spot instances for fault-tolerant batch, separate compute pools by workload. SCAN — partition + cluster so queries read less, prune aggressively, materialize hot aggregates instead of recomputing. PIPELINE — batch instead of stream where the SLA allows, dedup early, and avoid recomputing unchanged partitions (incremental models).",
      navLabel: "How to choose:",
      nav: "Attack the biggest line item first — usually either warehouse compute (idle warehouses, full-table scans) or streaming infra running 24/7. Auto-suspend/auto-scale compute, convert full scans to partition-pruned incremental models, tier and expire storage by layer, and downgrade streaming to micro-batch where seconds-of-latency buys nothing. Every cut should name the SLA it does NOT violate.",
      followups: [
        "\"The Snowflake bill doubled — give me the first three things you'd check and the fastest win.\"",
        "\"A dashboard scans 50TB hourly for a number that changes daily — what's the cheap fix?\"",
        "\"Which is cheaper for a 2am-only batch: an always-on cluster, autoscaling, or spot? What's the failure trade-off of spot?\""
      ]
    },
    {
      title: "Dimensional modeling: star schema, facts/dims, SCD Type 2",
      badge: "building block",
      conceptLabel: "Concept:",
      concept: "The serving layer for analytics is usually a dimensional (Kimball) model: FACT tables hold measurable events at a defined grain (one row per transaction, per claim line) with foreign keys and numeric measures; DIMENSION tables hold descriptive context (customer, product, date, provider). A STAR schema is facts surrounded by denormalized dims — fast, intuitive for BI. Slowly Changing Dimensions handle attributes that change over time: SCD Type 1 overwrites (lose history), Type 2 adds a new row per change with effective_from/effective_to + is_current + a surrogate key (full history, and facts join to the version that was valid at event time).",
      navLabel: "How to choose:",
      nav: "Define the fact grain FIRST — it's the most important modeling decision and everything else follows. Use surrogate keys on dimensions so you can version them and decouple from source natural keys. Use SCD Type 2 whenever history matters (a customer's plan tier when a claim was filed, the address at time of purchase) — Type 1 only when you genuinely don't care about the old value. dbt snapshots implement Type 2 cleanly.",
      followups: [
        "\"A customer moved from Basic to Premium mid-year — with SCD Type 2, how does a claim from March join to the correct historical tier?\"",
        "\"What's the grain of your fact table and how do you prevent double-counting when you join to a Type 2 dimension?\"",
        "\"Why surrogate keys instead of just using the source system's primary key on the dimension?\""
      ]
    }
  ]
},

cases: {
  intro: {
    title: "Full case studies — five open-ended designs, driven end to end",
    desc: "Each card is a complete system-design prompt. Start by asking the clarifying questions, sketch the reference design (the arrow-text architecture is in the 'Reference design' note), then answer the scale/failure/cost follow-ups. The two flagships lean finance (fraud/risk) and healthcare (claims) — the domains a 6-YOE Amex + Cedar Gate engineer owns."
  },
  diagram: [
    { label: "OLTP / events /\nHL7-FHIR-EDI /\nclickstream", hl: true },
    { arrow: true },
    { label: "Ingest\nCDC / Kafka /\nbatch loads" },
    { arrow: true },
    { label: "Bronze\nS3 raw\n(immutable)", hl: true },
    { arrow: true },
    { label: "Silver\nclean+dedupe\nSpark / dbt" },
    { arrow: true },
    { label: "Gold\nstar schema /\naggregates", hl: true },
    { arrow: true },
    { label: "Serve\nBI / ML /\nAPIs" },
  ],
  cards: [
    {
      title: "Case 1 (finance) — Near-real-time credit-card transaction fraud / risk pipeline",
      badge: "flagship · finance",
      conceptLabel: "The prompt:",
      concept: "Design a pipeline that ingests credit-card transactions as they happen and produces a risk/fraud score fast enough to influence the authorization decision, while also feeding analytics and model retraining. This is the Amex-shaped problem: high volume, sub-second-to-second latency on the hot path, and a hard correctness bar — you cannot double-count a transaction or lose one.",
      navLabel: "Clarifying questions to ask first:",
      nav: "What's the volume and peak (tens of millions/day, holiday spikes 5–10x)? What's the latency SLA — does scoring happen INLINE in the auth flow (single-digit ms, a different system) or NEAR-real-time alongside it (sub-second to seconds)? Is a missed or double-counted transaction acceptable (no — it's money)? What features does the model need (velocity/aggregates over recent windows per card)? Retention and compliance (PCI-DSS, tokenize the PAN, encryption everywhere)? Who consumes the score (auth service, case-management dashboards, model retraining)?",
      noteLabel: "Reference design:",
      note: "Hot path first. Transaction events → Kafka (partition by card/account so per-card events stay ordered) → Flink/Spark Structured Streaming computes velocity features over sliding windows and calls/serves the model → the score is published back to a Kafka topic for the decision service AND upserted to a feature store.<br><br>In parallel, the batch path: Kafka → S3 raw (bronze, immutable, PCI-encrypted) → PySpark/dbt clean and dedupe by transaction_id (silver) → Snowflake gold marts for analysts plus labeled training sets. Airflow orchestrates the batch/training side.<br><br>Arrow sketch: card swipe → Kafka (keyed by card) → Flink windowed features + model score → decision topic + feature store; Kafka → S3 bronze → PySpark silver (dedupe by txn_id) → Snowflake gold → BI + model retraining.<br><br>The exactly-once concern is handled by at-least-once delivery plus an idempotent upsert keyed by txn_id, so replay or retry never double-counts.",
      followups: [
        "\"Black Friday brings a 10x spike — where does it break first (Kafka, the stream job's state, the feature store) and how do you absorb it?\"",
        "\"The stream job crashes mid-window — how do you guarantee no transaction is scored twice and none is dropped?\"",
        "\"The feature-computation cluster runs 24/7 at peak sizing but traffic is bursty overnight — how do you cut cost without risking the SLA?\"",
        "\"Late-arriving transactions (network delay) land after their window closed — how do you handle them for correct velocity features?\""
      ]
    },
    {
      title: "Case 2 (healthcare) — Clinical/claims platform ingesting HL7/FHIR/EDI from many hospitals",
      badge: "flagship · healthcare",
      conceptLabel: "The prompt:",
      concept: "Design a platform that ingests healthcare data — HL7 v2 messages, FHIR resources, and X12 EDI claims (837/835) — from hundreds of hospitals and payers, each with quirks and different delivery cadences, normalizes it into a governed warehouse, and serves analytics and quality/risk reporting. This is the Cedar Gate-shaped problem: heterogeneous messy inputs, strict HIPAA/PHI governance, and dimensional modeling on top.",
      navLabel: "Clarifying questions to ask first:",
      nav: "How do sources deliver (SFTP batch files, real-time HL7 feeds over MLLP, FHIR REST APIs, EDI via clearinghouse)? What's the freshness SLA (claims are typically daily/near-real-time, not sub-second)? Volume and number of distinct source formats/versions? PHI/HIPAA requirements (encryption, access control, audit, BAAs, de-identification for analytics)? Data quality expectations (claims must reconcile; duplicate claims are a real problem)? Who consumes it (quality measures, risk adjustment, actuarial, provider dashboards)? How is patient/member identity resolved across sources (MPI/EMPI)?",
      noteLabel: "Reference design:",
      note: "Start with multi-protocol ingestion. SFTP/MLLP/FHIR/EDI landers write RAW messages to S3 bronze (immutable, encrypted, partitioned per source).<br><br>Then a parsing layer (HL7/FHIR/EDI parsers, often on Spark or a dedicated parser service) normalizes each format into one common canonical model in silver, deduping by message/claim ID. Identity resolution (EMPI) links members and providers. dbt then builds the dimensional gold layer (fact_claim at claim-line grain, dim_member with SCD Type 2, dim_provider, dim_date) in Snowflake/PostgreSQL. Finally you serve quality/risk/actuarial marts with row-level PHI access control.<br><br>Arrow sketch: hospital SFTP/HL7/EDI → landing (raw to S3 bronze) → Spark/parser normalize to canonical (silver, dedupe by claim_id) → EMPI identity resolution → dbt star schema (fact_claim + SCD2 dims) in Snowflake → governed BI.<br><br>Use Kafka/CDC where sources push real-time HL7. For HIPAA: encryption at rest and in transit, column-level PHI masking, full audit, and de-identified analytics views.",
      followups: [
        "\"Onboarding jumps from 50 to 500 hospitals, each with schema quirks — how do you scale onboarding without N one-off pipelines?\"",
        "\"A payer resends a corrected 837 claim you already loaded — how does the model avoid double-counting and reflect the correction?\"",
        "\"A parser bug mis-mapped a FHIR field for the last month — reprocess just the affected data without touching the rest. How?\"",
        "\"Analytics needs the data but most users must never see PHI — how do you serve de-identified data cheaply while keeping the governed copy?\""
      ]
    },
    {
      title: "Case 3 — Data warehouse + dimensional model (star schema, SCD Type 2)",
      badge: "case study",
      conceptLabel: "The prompt:",
      concept: "Design the analytics warehouse for an e-commerce/subscription business: model orders, customers, and products into a governed star schema that answers business questions (revenue by segment over time, cohort retention) and correctly reflects how dimensions change — a customer's tier, address, or a product's category can change over time and history must be preserved.",
      navLabel: "Clarifying questions to ask first:",
      nav: "What are the core business questions and their grain (per-order? per-order-line? per-day-per-customer)? How fresh must it be (daily is usually fine for a warehouse)? Which dimension attributes change over time and does history matter for them (customer tier at time of order — yes; a cosmetic label — maybe not)? Data sources and how they land (CDC from the OLTP DB)? Volume and retention? Who queries it (BI tools, analysts writing SQL)?",
      noteLabel: "Reference design:",
      note: "The spine: CDC from OLTP (Debezium) → Kafka → S3 bronze raw → dbt builds silver (cleaned, typed, deduped by PK) → gold star schema in Snowflake.<br><br>In gold, fact_order_line sits at order-line grain (measures: quantity, amount) with FKs to dim_customer, dim_product, and dim_date. dim_customer and dim_product use SCD Type 2 (surrogate key, effective_from/to, is_current) via dbt snapshots, so a fact row joins to the dimension version that was valid at order time.<br><br>Arrow sketch: OLTP → Debezium CDC → Kafka → S3 bronze → dbt silver (dedupe by PK) → dbt gold star schema (fact_order_line + SCD2 dims) in Snowflake → BI. Airflow triggers dbt daily.<br><br>Quality gates: PK uniqueness on dims, fact-to-dim referential integrity, and revenue reconciliation against the source.",
      followups: [
        "\"A customer upgraded tier in June — show me how a March order still reports under the OLD tier with SCD Type 2, and how you avoid fan-out double-counting.\"",
        "\"The fact table hits 10B rows and dashboards slow down — clustering, partitioning, or pre-aggregation? Walk through the choice.\"",
        "\"Marketing wants near-real-time order dashboards instead of daily — what changes in this design, and is it worth it?\"",
        "\"The warehouse compute bill is high from analysts full-scanning the fact table — cheapest effective fix?\""
      ]
    },
    {
      title: "Case 4 — Near-real-time clickstream / events pipeline (Kafka → lake)",
      badge: "case study",
      conceptLabel: "The prompt:",
      concept: "Design a pipeline to ingest high-volume web/mobile clickstream and product events, land them for both real-time metrics (live dashboards, funnels) and batch analytics/ML, at large scale where the volume is huge but a single lost click is not catastrophic — the opposite correctness profile from the fraud case.",
      navLabel: "Clarifying questions to ask first:",
      nav: "Event volume and peak (billions/day, spiky)? Freshness SLA for the real-time metrics (seconds? minutes?) vs the batch layer (hourly/daily)? Is occasional event loss/duplication tolerable (usually yes for product analytics — at-least-once is fine)? Schema stability (events evolve constantly — need a registry)? Who consumes (real-time ops dashboards, batch funnels, ML feature pipelines)? Retention (raw events for how long)? PII in events (user IDs — hashing/consent)?",
      noteLabel: "Reference design:",
      note: "SDK/collector → Kafka (high partition count for parallelism; a schema registry with BACKWARD compat for evolving events) → two consumers.<br><br>Consumer (a): a stream processor (Flink/Spark Structured Streaming) computes windowed metrics, served to a fast store (Druid/ClickHouse/Pinot or a real-time dashboard). Consumer (b): Kafka → S3 raw in Parquet, partitioned by dt/hour, with compaction to fix the small-files problem → dbt/Spark builds silver/gold aggregates in the lakehouse/warehouse for batch funnels plus ML features.<br><br>Arrow sketch: app SDK → Kafka (partitioned, schema registry) → Flink windowed metrics → ClickHouse/Druid live dashboards; Kafka → S3 Parquet (dt/hour partitions, compacted) → dbt/Spark gold → BI + ML.<br><br>Use at-least-once plus dedup by event_id where it matters, and stay loss-tolerant elsewhere. Kappa-style: replay Kafka to backfill.",
      followups: [
        "\"Traffic 10x during a launch — Kafka partitions, consumer parallelism, and the sink all need to scale; what's your ordered plan and what breaks first?\"",
        "\"The S3 landing job writes tiny files every few seconds and Athena queries crawled to a halt — diagnose and fix.\"",
        "\"A product team wants exactly-once counts for a revenue funnel over this loss-tolerant stream — how do you provide it just for that path?\"",
        "\"Retention of raw events is blowing the storage budget — how do you decide what to keep, tier, or roll up?\""
      ]
    },
    {
      title: "Case 5 — CDC pipeline keeping an OLTP source in sync with the warehouse",
      badge: "case study",
      conceptLabel: "The prompt:",
      concept: "Design a pipeline that keeps an analytical warehouse continuously in sync with a production OLTP database (e.g. PostgreSQL) so analysts see near-real-time data — including inserts, updates, AND deletes — without adding query load to the production database.",
      navLabel: "Clarifying questions to ask first:",
      nav: "Freshness SLA (seconds? a few minutes is usually fine)? Can we read the DB transaction log (WAL/binlog) for log-based CDC, or are we restricted to query-based? Volume of changes/sec and the size of the initial snapshot (huge tables need incremental snapshot)? Must hard deletes be reflected (compliance often requires it)? Schema evolution frequency on the source? Consistency requirement — is eventual (seconds behind) acceptable, or must the warehouse be transactionally consistent with the source?",
      noteLabel: "Reference design:",
      note: "Debezium reads the Postgres WAL. That's log-based CDC: complete, ordered, and near-zero load on the source.<br><br>It publishes change events (with before/after images plus op type) to Kafka, one topic per table, keyed by primary key so per-key changes stay ordered, and often compacted. A consumer (Kafka Connect JDBC/Snowflake sink, or Spark/dbt) applies those changes as a MERGE into the warehouse silver table keyed by PK, handling deletes via tombstones. dbt builds gold on top.<br><br>Arrow sketch: Postgres WAL → Debezium → Kafka (per-table, keyed by PK, compacted) → MERGE upsert into Snowflake silver (deletes via tombstone) → dbt gold → BI.<br><br>It's idempotent by construction: MERGE keyed by PK plus newest-event-wins ordering, so replays and retries converge. Seed the initial load with a Debezium incremental snapshot to avoid locking the source.",
      followups: [
        "\"CDC events for the same primary key arrive out of order (retries, rebalance) — how do you guarantee the latest state wins on MERGE?\"",
        "\"The initial snapshot of a 2TB table is threatening production — how do you seed the warehouse without impacting the OLTP source?\"",
        "\"Someone adds a column to the source table — what happens to your pipeline and how do you make schema changes non-breaking?\"",
        "\"Replication lag spiked to 30 minutes — how do you detect it, alert on it, and what are the likely root causes?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — active-recall design questions a senior DE gets asked",
    desc: "Each card is a real design probe. Form your own answer first, then expand for a model answer that names concrete tech, the trade-off, the failure mode, and the cost lever — senior depth, not textbook recitation."
  },
  cards: [
    {
      title: "\"How do you handle late-arriving data in a streaming aggregation?\"",
      badge: "streaming",
      navLabel: "How to approach it:",
      nav: "Separate event time from processing time, then name watermarks + grace period as the mechanism, and the accuracy-vs-latency trade-off. Finish with what happens to data later than the grace period.",
      noteLabel: "Model answer:",
      note: "\"Drive aggregations by EVENT time (when it happened), not processing time (when we saw it). Otherwise a network delay silently corrupts the wrong window.<br><br>I use watermarks. The engine tracks the max event time it has seen, and assumes nothing older than watermark minus a grace period will still arrive. So it holds a window open for that grace period before finalizing.<br><br>The trade-off is direct. A longer grace period catches more late data, but it delays results and holds more state. A shorter one is faster and cheaper, but it drops stragglers.<br><br>Anything later than the grace period goes to a side-output or dead-letter for a batch correction, rather than silently vanishing.<br><br>In Spark Structured Streaming that's withWatermark. Flink has explicit watermark strategies and allowed lateness. The cost lever is simple: grace period equals state size. So I tune it to the real observed lateness distribution, not a guess.\""
    },
    {
      title: "\"You need to reprocess a month of bad data with zero downtime for live consumers. How?\"",
      badge: "reprocessing",
      navLabel: "How to approach it:",
      nav: "Lean on immutable raw + idempotent partition-overwrite + isolated compute. Never mutate in place on the live path; compute alongside and swap.",
      noteLabel: "Model answer:",
      note: "\"Raw stays immutable in bronze, partitioned by date, so I can target exactly the affected window.<br><br>I run the fixed transform on a SEPARATE compute pool at low priority, so it doesn't starve the live pipeline. It writes to the affected partitions with an idempotent partition-overwrite — dynamic partition overwrite in Spark, REPLACE WHERE in Delta, or a dbt full-refresh scoped to the date range. Re-running replaces those partitions cleanly, with no duplicates.<br><br>For the serving layer, I compute into a shadow location and do an atomic swap or partition-pointer switch. Live dashboards never see a half-written state.<br><br>Because transforms are deterministic and sinks are idempotent, unaffected rows come out byte-identical. If it's a Kappa or streaming setup, reprocessing is just replaying that slice of the Kafka log through the same code into the same idempotent sink.<br><br>Zero downtime comes from never mutating the live path in place. You build the corrected data beside it, then flip.\""
    },
    {
      title: "\"Guarantee no transaction is ever double-counted, even with retries and replays.\"",
      badge: "correctness",
      navLabel: "How to approach it:",
      nav: "Reject 'exactly-once magic.' Answer: at-least-once delivery + idempotent sink keyed by a business ID, and name where each duplicate is absorbed.",
      noteLabel: "Model answer:",
      note: "\"I don't rely on end-to-end exactly-once across systems. Once an external sink is involved, that's largely a myth.<br><br>Instead, I make duplicates HARMLESS. Every transaction carries a stable business ID (txn_id), and the sink write is a MERGE/upsert keyed on it. So a retried batch, a consumer rebalance re-delivering a partition, or a full replay all converge to the same single row.<br><br>On the produce side, I enable the idempotent producer, so retries don't create Kafka-level duplicates in the first place. For aggregations where I'm summing money, I dedup on txn_id BEFORE aggregating, or I aggregate from the deduped silver table rather than the raw stream.<br><br>The only time I reach for true Kafka transactions or two-phase commit is when the sink genuinely can't upsert and a duplicate is unfixable — like a non-idempotent external charge.<br><br>Otherwise, 'at-least-once plus idempotent upsert keyed by txn_id' is simpler and just as correct. And I can prove it: replay the data and show the row count is unchanged.\""
    },
    {
      title: "\"Design this pipeline to survive a 10x traffic spike.\"",
      badge: "scaling",
      navLabel: "How to approach it:",
      nav: "Walk the pipeline stage by stage and name what saturates first and the elastic lever at each: buffer, partitions, autoscaling compute, sink throughput, backpressure.",
      noteLabel: "Model answer:",
      note: "\"I'd trace the spike through each stage and name the bottleneck and the lever at each one.<br><br>Ingestion: Kafka absorbs the burst as a buffer — that's the whole point of decoupling producers from consumers. But I need enough partitions up front, because I can't cheaply add them to a keyed topic later, so I provision partition count for peak parallelism.<br><br>Processing: the stream or batch cluster autoscales on lag or queue depth. If a hot key skews load, I re-key or add sub-bucketing.<br><br>Sink: this is often the real bottleneck. I batch writes, use bulk-load paths (Snowpipe/COPY instead of row-by-row), and let Kafka backpressure hold the excess rather than drop it.<br><br>The key insight: Kafka turns a spike into lag, not loss. So I scale consumers to burn down the lag, and the SLA degrades gracefully instead of the system falling over.<br><br>Cost lever: autoscaling means I only pay for peak during the spike, and I set a max so a runaway doesn't blow the budget. I'd also load-test at 10x beforehand, so I know which component actually breaks first instead of guessing.\""
    },
    {
      title: "\"How do you make a pipeline idempotent, end to end?\"",
      badge: "correctness",
      navLabel: "How to approach it:",
      nav: "Define idempotency (re-running yields the same state), then give the three requirements: immutable input, deterministic transform, idempotent write.",
      noteLabel: "Model answer:",
      note: "\"Idempotent means running it once or five times produces the same final state. That's what makes retries and backfills safe.<br><br>Three properties get you there. First, immutable input: raw lands append-only in bronze, partitioned by date, so a rerun reads the exact same bytes. Second, deterministic transforms: no dependence on wall-clock now() or on random ordering that changes results between runs — same input must yield same output. Third, idempotent writes: partition-overwrite or MERGE/upsert keyed by a business key, never a blind append, so re-writing a partition replaces rather than duplicates.<br><br>With those three, a mid-DAG failure that Airflow retries, a manual backfill of a date range, or a Kafka replay all land on identical, correct data.<br><br>The anti-pattern is an INSERT that appends on every run — the first retry doubles your data. I test it by running the same task twice and asserting the output is unchanged.\""
    },
    {
      title: "\"Batch or streaming for this workload — how do you decide?\"",
      badge: "architecture",
      navLabel: "How to approach it:",
      nav: "Anchor entirely on the freshness SLA and the decision the data drives; name the cost/complexity streaming adds; mention micro-batch as the middle ground.",
      noteLabel: "Model answer:",
      note: "\"I decide from the freshness SLA and what decision the data drives, never from what's trendy.<br><br>If the business acts in seconds — fraud scoring, live ops alerting — it's streaming: Kafka plus Flink or Spark Structured Streaming. I accept the cost of managing state, watermarks, and 24/7 on-call.<br><br>If the SLA is hourly or daily — most reporting and dimensional warehouses — it's batch. It's cheaper, simpler, and trivially reprocessable, and I'm not paying for streaming infra and complexity that buy nothing.<br><br>The middle ground is micro-batch: Spark Structured Streaming triggers, Snowpipe, or dbt every few minutes. It hits 'near-real-time' at a fraction of true-streaming complexity, and it covers a lot of 'we want it fresh-ish' asks.<br><br>The trap is reaching for Kafka/Flink on a next-morning SLA. That's latency you're not using, paid for in operational burden. So my answer is always 'what's the SLA and the decision?', and the architecture follows from that.\""
    },
    {
      title: "\"An upstream schema changed and broke production. How do you prevent it?\"",
      badge: "governance",
      navLabel: "How to approach it:",
      nav: "Name schema registry + compatibility mode + data contract enforced in CI; give the deploy-order rule tied to the compatibility direction.",
      noteLabel: "Model answer:",
      note: "\"The root cause is an implicit, ungoverned schema.<br><br>I put a schema registry in front with BACKWARD compatibility as the default. Additive changes (a new optional field) stay safe, and consumers reading old data still work. A breaking change — renaming or retyping a required field — gets REJECTED at publish time, instead of at 2am in prod.<br><br>I formalize this as a data contract: the schema, semantics, and ownership, all checked in CI so the producing team can't merge a breaking change.<br><br>Compatibility direction dictates deploy order. BACKWARD means upgrade consumers first; FORWARD means producers first. Knowing that is the difference between a smooth rollout and an outage.<br><br>In the warehouse, I use a table format that evolves cleanly (Iceberg/Delta add-column). For truly breaking changes, I version the topic or table (v2) and migrate consumers deliberately rather than mutating in place. The principle: schema is a contract enforced by tooling, not tribal knowledge.\""
    },
    {
      title: "\"Design idempotent, ordered CDC from Postgres to Snowflake.\"",
      badge: "CDC",
      navLabel: "How to approach it:",
      nav: "Log-based over query-based, key by PK for ordering, MERGE with newest-wins, handle deletes and the initial snapshot.",
      noteLabel: "Model answer:",
      note: "\"I'd use log-based CDC: Debezium reading the Postgres WAL. It captures every insert, update, and delete in commit order with near-zero load on the source. Query-polling on updated_at can't match that — it misses hard deletes and intermediate updates.<br><br>Change events go to Kafka, one topic per table, KEYED BY PRIMARY KEY, so all changes for a row land on the same partition and stay ordered.<br><br>The sink applies them as a MERGE into the Snowflake silver table, keyed on that PK, with newest-event-wins using the log sequence number or commit timestamp. That way an out-of-order redelivery can't overwrite newer state with older. Deletes are handled explicitly via tombstones, so the warehouse reflects removals.<br><br>It's idempotent by construction: a MERGE keyed by PK means replays and retries converge to the same row.<br><br>For the initial load, I use Debezium's incremental snapshot, so seeding a large table doesn't lock production. I'd monitor replication lag and alert on it, since a stalled connector is the usual failure. dbt builds gold on top of the synced silver.\""
    },
    {
      title: "\"How do you serve both real-time and historically-accurate numbers without them disagreeing?\"",
      badge: "architecture",
      navLabel: "How to approach it:",
      nav: "Contrast Lambda (two codebases that drift) with Kappa (one codebase, replay to reprocess); explain why Kappa avoids the reconciliation problem.",
      noteLabel: "Model answer:",
      note: "\"The classic 'our real-time and batch dashboards show different totals' incident comes from Lambda architecture: a speed layer and a batch layer computing the same metric in two separate codebases that inevitably drift.<br><br>My default now is Kappa. ONE streaming pipeline is the source of truth, and 'reprocessing' means replaying the Kafka log through the SAME code into the same idempotent sink. The historical and real-time numbers come from identical logic, so they can't disagree by construction.<br><br>That requires two things: enough Kafka retention (or tiered storage) to replay the history you need, and idempotent sinks so a replay overwrites rather than duplicates.<br><br>I'd only keep Lambda if the batch engine can compute something the stream engine genuinely can't at acceptable cost. Even then, I'd share as much transformation logic as possible.<br><br>And if the SLA doesn't actually need real-time, I collapse to pure batch and the problem disappears entirely. Two systems computing the same number is a cost and a correctness risk, so I only run two when the requirements truly force it.\""
    }
  ]
},

};

const QUIZ = [
  {
    q: "What should you do FIRST in a data-engineering system-design round?",
    options: [
      "Draw the full architecture diagram immediately",
      "Clarify requirements: volume, latency SLA, consistency, access patterns, retention, budget",
      "Pick the trendiest streaming stack",
      "Start writing the dbt models"
    ],
    correct: 1
  },
  {
    q: "The single most consequential factor in choosing batch vs streaming is:",
    options: [
      "The programming language of the team",
      "The freshness SLA and the decision the data drives",
      "Whether Kafka is already installed",
      "The size of the engineering team"
    ],
    correct: 1
  },
  {
    q: "In the medallion model, why land raw data to an immutable bronze layer?",
    options: [
      "It's required by HIPAA",
      "So you can reprocess silver/gold deterministically after any transform bug, with no data loss",
      "Because warehouses can't read Parquet",
      "To reduce the number of tables"
    ],
    correct: 1
  },
  {
    q: "The pragmatic way to guarantee a transaction is never double-counted despite retries and replays is:",
    options: [
      "True end-to-end exactly-once across all external systems",
      "acks=0 for maximum speed",
      "At-least-once delivery plus an idempotent sink (MERGE/upsert) keyed by a business ID",
      "Never retrying failed writes"
    ],
    correct: 2
  },
  {
    q: "For keeping a warehouse in sync with an OLTP database including deletes and without adding query load, the best approach is:",
    options: [
      "Query-based polling on an updated_at column",
      "Log-based CDC (Debezium reading the WAL/binlog)",
      "A nightly full-table dump",
      "Triggers that email changes"
    ],
    correct: 1
  },
  {
    q: "SCD Type 2 on a dimension lets you:",
    options: [
      "Overwrite the old value and lose history",
      "Preserve history so a fact joins to the dimension version valid at event time",
      "Delete dimensions automatically",
      "Avoid needing a fact table"
    ],
    correct: 1
  },
  {
    q: "Late-arriving data in a streaming aggregation is correctly handled by:",
    options: [
      "Ignoring processing time entirely and never finalizing windows",
      "Event-time windows with watermarks + a grace period, trading latency for completeness",
      "Always using processing time",
      "Dropping any record more than 1 second old, silently"
    ],
    correct: 1
  },
  {
    q: "The 'small files problem' in a lake is caused by, and fixed by:",
    options: [
      "Too few partitions; fixed by adding more partitions",
      "Frequent tiny writes / over-partitioning; fixed by compaction and targeting ~128MB–1GB files",
      "Using Parquet; fixed by switching to CSV",
      "Encryption; fixed by disabling it"
    ],
    correct: 1
  }
];
