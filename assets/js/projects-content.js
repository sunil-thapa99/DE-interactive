// Content for the Project Deep-Dives module — tailored to Sunil Thapa's resume.
// Distinct lens from the resume/behavioral modules: this groups the resume bullets into the
// actual PROJECTS behind them, and for each walks HOW it was built -> COMPLICATIONS that arise
// -> SOLUTIONS -> the interview follow-ups and answers. Mid-to-senior depth.
const MODULE_ID = "projects";
const CONTENT = {

overview: {
  intro: {
    title: "Project deep-dives — the work behind the bullets",
    desc: "Your resume lists ~33 bullets across three roles. Behind them are a handful of real projects. This module reconstructs each one the way you'd defend it on a whiteboard: how it was built, the complications that actually bite in production, how they're solved, and the technical follow-ups an interviewer digs with — each answered. Grouped by role. Every card follows the same rhythm so you can rehearse the whole tree, not just the headline."
  },
  cards: [
    {
      title: "How to read these cards",
      badge: "fundamentals",
      conceptLabel: "How it was built:",
      concept: "Each project card is structured the same way an interviewer thinks about your work. First the design and the key decisions — the architecture and why it was right. This is where you show you drove it, not sat near it.",
      navLabel: "Complications that arise:",
      nav: "The failure modes and edge cases the design has to survive — the things that break at 2am, the data that arrives malformed, the retry that double-counts. Naming these unprompted is the senior tell.",
      noteLabel: "Solutions:",
      note: "The concrete controls that make the complication a non-event — idempotency, quarantine, contracts, guards. Every solution ties back to a specific complication above it.<br><br>Then the follow-ups: the cross-questions that find the floor of your knowledge, each with a model answer to rehearse and adapt.",
      followups: [
        { q: "How deep should I go before stopping?", a: "About 90 seconds on the how, then stop and let the follow-up pull you deeper. Volunteering the complication and the metric before you're asked is the strongest signal; over-talking buries it." },
        { q: "What if I didn't personally own a part of a project?", a: "Say so, and say who did. 'I owned the pipeline and feature engineering; model selection was collaborative.' Honest scoping reads as senior, not weak — and it's checkable." }
      ]
    }
  ]
},

amex: {
  intro: {
    title: "American Express — risk & transaction data at scale (2024–present)",
    desc: "Four projects reconstructed from your Amex bullets: the Databricks/PySpark transaction-ETL platform, the Azure ingestion + source-onboarding layer, the data-quality + reliability (CI/CD, on-call) system, and the FastAPI/RAG AI-serving path. A finance/platform interviewer pushes hardest on scale, cost, reliability, and operating in a regulated enterprise."
  },
  cards: [
    {
      title: "Project 1 — Databricks/PySpark ETL platform for transaction & customer data",
      badge: "advanced",
      conceptLabel: "How it was built:",
      concept: "Scalable ETL/ELT on Databricks: raw transaction and customer feeds land in a bronze layer on ADLS as Delta, PySpark transforms and validates into silver (conformed, deduped, typed), and gold serves risk scoring and analytics. Delta Lake gives ACID commits, MERGE for upserts, and time travel. Heavy joins and aggregations run as PySpark on autoscaling clusters; the reusable, curated marts and some analytical queries live in Snowflake. Transformation logic is factored into importable functions so it's unit-testable, not buried in a notebook.",
      navLabel: "Complications that arise:",
      nav: "Skewed joins — a few hot transaction keys (a giant merchant, a test account) get most of the rows, so a handful of tasks run 10x longer while executors idle. Small-file explosion from frequent writes degrades read performance. Snowflake queries that scan far more than they filter because a function wrapped the pruning column. Non-idempotent loads that double-count on retry — fatal when a duplicated transaction means duplicated risk exposure.",
      noteLabel: "Solutions:",
      note: "Skew: confirm it in the Spark UI task-time distribution (long tail + idle executors, not uniform load), then broadcast the small dimension to kill the shuffle, or salt the hot key when both sides are large. Small files: periodic OPTIMIZE/compaction on the Delta tables. Snowflake pruning: rewrite predicates so the partition column isn't wrapped in a function, and add a clustering key aligned to the common filter (transaction date + account). Idempotency: MERGE on the business key instead of blind append, so a replay reconciles instead of duplicating.<br><br>The discipline underneath all of it: diagnose from the profile or UI, change one thing, re-measure. Never guess.",
      followups: [
        { q: "How did you confirm it was skew and not an undersized cluster?", a: "The Spark UI task-time distribution within the stage. Skew is a few tasks far longer than the median while most finish fast and executors sit idle. Undersized is uniformly busy executors. Idle capacity plus a long tail equals skew — more nodes wouldn't help." },
        { q: "When does salting beat broadcast, and what does salting cost?", a: "Broadcast only when one side fits in each executor's memory. When both sides are large but one key is hot, salt: split the hot key into N sub-keys on both sides. The cost is a larger, more complex join from the fan-out, so you salt only the skewed keys, not the whole dataset." },
        { q: "A 'filtered' Snowflake query still scans everything — most likely cause?", a: "A function wrapping the pruning column in the WHERE clause, like DATE(ts) = ..., defeats micro-partition pruning. Rewrite as a range predicate on the raw column. Usually the single biggest scan reduction." },
        { q: "Why land raw as Delta bronze first instead of transforming on ingest?", a: "So a parser or logic bug is a reprocess from immutable raw, not a re-pull from the source. Raw is the replayable source of truth; everything downstream is a deterministic function of it. It also decouples ingest reliability from transform correctness." }
      ]
    },
    {
      title: "Project 2 — Azure ingestion layer + onboarding new enterprise sources",
      badge: "intermediate",
      conceptLabel: "How it was built:",
      concept: "Cloud ingestion with Azure Data Factory orchestrating pulls from enterprise source systems, APIs, and cloud stores into ADLS Gen2, organized into landing/curated zones. Onboarding a new source meant defining the ingestion pattern (batch vs incremental vs event), the transformation and validation rules, and an SLA, agreed with the source owner as a written data contract — schema, field semantics, freshness, volume ranges, and the change-management policy for breaking changes.",
      navLabel: "Complications that arise:",
      nav: "A source silently changes its schema and corrupts everything downstream. A feed arrives late or half-empty and the pipeline happily loads the partial data. Different sources have wildly different reliability, so one flaky API stalls a shared pipeline. And 'the data will be there' is an assumption, not an agreement — nobody owns the breakage.",
      noteLabel: "Solutions:",
      note: "The data contract turns a silent break into an attributable, actionable one: a schema guard at ingest detects a violation and fails closed with a clear 'contract breach' alert instead of corrupting downstream. Volume/freshness guards catch the late or half-empty feed before it loads. Isolating each source's ingestion so one flaky API doesn't stall the others. And the SLA is only real because a miss triggers a defined escalation to the owner — otherwise it's a wish.<br><br>The senior signal is producing the artifact and getting sign-off, not hoping the source stays stable.",
      followups: [
        { q: "What exactly goes in a data contract?", a: "Schema and field types, the semantic meaning of each field, freshness and delivery cadence, expected volume ranges, quality guarantees (nullability, key uniqueness, valid value sets), ownership/contacts, and the change-management policy for how breaking changes are versioned and announced in advance." },
        { q: "A source owner won't commit to a contract. What do you do?", a: "Make the risk visible: document the current undefined behavior and the downstream cost of a change, propose a minimal contract — even just 'notify us before schema changes' — and add defensive guards on my side regardless. Influence without authority is showing the cost of no contract." },
        { q: "How do you decide batch vs incremental vs event-driven for a new source?", a: "Driven by latency need and source capability. Full batch if the dataset is small or has no reliable change marker. Incremental on a high-water mark (timestamp/id) when the source supports it and volume is large. Event/CDC when downstream needs low latency and the source can emit changes. Cheapest pattern that meets the freshness SLA." }
      ]
    },
    {
      title: "Project 3 — Data quality, CI/CD, and on-call reliability",
      badge: "advanced",
      conceptLabel: "How it was built:",
      concept: "Pipelines shipped like software: everything in Git, a CI pipeline runs unit tests on the transformation functions plus dbt/SQL tests on every PR, a merge deploys to staging where integration tests run against real infra with sample data, and only then a gated automated promote to prod. On top of that, runtime data-quality gates on every load — not-null and unique keys, referential checks, row-count and volume bands — plus validation and reconciliation across pipelines. When something did break, a stabilize → diagnose → prevent incident rhythm.",
      navLabel: "Complications that arise:",
      nav: "A change passes every unit test but still loads bad data, because unit tests check your code, not the world's data. A critical pipeline fails or runs late and risk/analytics stakeholders are blind. A hotfix under pressure makes it worse. And the same incident pages you again next week because the fix stopped at the symptom.",
      noteLabel: "Solutions:",
      note: "Two test layers for two failure classes: unit tests catch your bugs, runtime data-quality checks catch upstream changes — that's why both exist. For incidents: stabilize first (tell stakeholders data is late, give an ETA — a known delay is manageable, a silent one destroys trust), then diagnose from evidence (failing task logs, recent deploys, upstream schema/volume shifts), then the preventive fix is the actual deliverable — a guard, an idempotency fix, an earlier alert — plus a runbook so the next person resolves it faster.<br><br>CI/CD gives safe rollback: a bad change is reverted by re-deploying a known-good commit, not hotfixed live.",
      followups: [
        { q: "A pipeline passes all unit tests but still loads bad data. How?", a: "Unit tests check your code, not the world's data — an upstream schema or volume change slips past them. That's why runtime data-quality checks gate the load: not-null/unique keys, volume bands, referential checks. Code tests catch your bugs; data tests catch upstream changes." },
        { q: "Data's late and stakeholders are asking, before you know the cause. What do you say?", a: "Acknowledge the delay, give a rough ETA or a next-update time, state impact in their terms ('the risk dashboard refreshes late'). You don't need the root cause to communicate. 'We're on it, next update in 30 minutes' preserves trust far better than silence." },
        { q: "How do you make sure the same incident never pages you again?", a: "The preventive fix is the deliverable, not the restart — add the missing validation/guard/idempotency and an alert that catches it earlier, then document it in a runbook. An incident that recurs identically means the RCA stopped at the symptom." },
        { q: "You had to backfill after a fix. How do you do it safely?", a: "Idempotently — reprocess the affected window with merge-on-key loads from the immutable raw layer so it reconciles rather than duplicates, and validate row counts and key totals before releasing downstream. Non-idempotent backfill turns one incident into two." }
      ]
    },
    {
      title: "Project 4 — FastAPI AI services + LangChain/RAG on curated data",
      badge: "advanced",
      conceptLabel: "How it was built:",
      concept: "Python/FastAPI services expose model outputs and analytics to downstream applications over REST, so consumers get scalable access to insights without touching the warehouse directly. Separately, LangChain + RAG workflows integrate enterprise data sources and curated datasets to provide context-aware answers — retrieval over governed, curated data rather than a raw dump. The DE-owned part is the pipeline that prepares model-ready datasets: feature preparation, data-quality validation, and the curated/embedded data the retrieval layer reads.",
      navLabel: "Complications that arise:",
      nav: "RAG answers are only as trustworthy as the retrieved context — stale, ungoverned, or PII-laden data in the index leaks or misleads. A synchronous model call inside a request path blows the API latency budget. Train/serve skew: features computed one way offline and another way at request time give inconsistent results. And an LLM path over enterprise data is a fresh compliance surface.",
      noteLabel: "Solutions:",
      note: "Retrieve only over curated, access-controlled data with the same governance as any other consumer — the index is a downstream table, not an exception. Keep the hot request path light: serve precomputed features and model outputs, push heavy scoring to batch or async, and cache where the freshness budget allows. Kill train/serve skew by computing features in one shared pipeline used by both offline training and online serving. And treat the RAG corpus as PHI/PII-governed: classification and masking apply before anything is embedded.",
      followups: [
        { q: "What makes a RAG answer trustworthy vs a hallucination risk?", a: "The quality and governance of the retrieved context. Retrieve over curated, current, access-controlled data; ground the answer in it and cite sources; and never index data the caller shouldn't see. Garbage or stale context produces confident-wrong answers — the retrieval layer is where you control that." },
        { q: "How do you keep a model-serving API within its latency budget?", a: "Keep synchronous work minimal — serve precomputed features and cached or batch-scored outputs on the hot path, push heavy inference to async or batch, and set timeouts and fallbacks. The API returns a fast, prepared answer; the expensive computation happened upstream." },
        { q: "What's train/serve skew and how do you prevent it as the DE?", a: "When a feature is computed differently offline (training) than online (serving), so the model sees inconsistent inputs and degrades silently. Prevent it by computing features in one shared pipeline/definition used by both paths, rather than reimplementing the logic in the serving code." }
      ]
    }
  ]
},

cedar: {
  intro: {
    title: "Cedar Gate Technologies — healthcare claims & clinical data (2022–2024)",
    desc: "Four projects from the healthcare-DE core: the HL7/FHIR/EDI ingestion pipeline, the batch→Airflow+dbt migration (+35%), the validation/reconciliation + monitoring framework, and the Kafka/CDC replication with dimensional modeling and HIPAA governance. A healthcare or data-platform interviewer spends the most time here."
  },
  cards: [
    {
      title: "Project 1 — HL7v2 / FHIR / EDI ingestion into a centralized warehouse",
      badge: "advanced",
      conceptLabel: "How it was built:",
      concept: "Three data shapes, three parse paths, one model. HL7v2 is pipe-and-hat delimited segment messages from the EHRs — parse MSH/PID/OBX segments into structured records. FHIR is JSON resources (Patient, Claim, Observation) from newer systems — schema-on-read into typed columns. EDI 837 is the claim submitted, 835 is the remittance (payment) — parse the X12 segments and critically link the 835 back to its 837 so billed-vs-paid reconciles. Everything lands raw and immutable first (partitioned by ingest date), then a cleaned/conformed layer.",
      navLabel: "Complications that arise:",
      nav: "Malformed segments in a batch — drop them and you lose revenue (a dropped claim is unbilled money and a compliance problem); fail the whole batch and you block the good claims too. A re-run after a parser fix double-counts claims — and a duplicated claim means duplicated billing. Mixed source estates emit HL7v2 and FHIR for the same concept, so the model has to conform both.",
      noteLabel: "Solutions:",
      note: "Quarantine malformed messages with the failure reason, never silently drop — the valid records flow through, the bad ones go to a quarantine table for correction and reprocessing. Idempotent landing: raw immutable, then upsert into conformed keyed on the claim business key (plus tracking which files were already processed), so replaying a file reconciles instead of duplicating. Conform HL7v2 and FHIR into the same target model so downstream doesn't care which interface a record came from.",
      followups: [
        { q: "What's the difference between an 837 and an 835, and why link them?", a: "The 837 is the claim the provider submits (what was billed); the 835 is the payer's remittance advice (what was paid, with denial/adjustment codes). Linking them reconciles billed vs paid and surfaces underpayments and denials — the core of revenue-cycle management." },
        { q: "A batch of 837s has malformed segments — drop, fail, or quarantine?", a: "Quarantine with the reason, never silently drop — a dropped claim is unbilled revenue and a compliance issue. Failing the whole batch blocks the good claims too. Isolate the bad records for correction and reprocessing; let the valid ones flow." },
        { q: "How did you make ingestion idempotent so a re-run didn't double-count?", a: "Land raw immutably, then upsert into conformed keyed on the claim business key rather than blind-appending, and track which files were already processed. Replaying a file after a fix updates in place and reconciles instead of duplicating — essential when duplicate claims mean duplicate billing." },
        { q: "HL7v2 vs FHIR — when does a source give you one or the other?", a: "HL7v2 is the legacy standard most existing EHR interfaces still emit (delimited segments, ADT/ORU events). FHIR is the modern REST/JSON resource model newer systems expose. A real payer/provider estate is mixed, so you handle both — old interfaces don't get rewritten just because FHIR exists." }
      ]
    },
    {
      title: "Project 2 — Migrating batch scripts to Airflow + dbt (+35% throughput)",
      badge: "advanced",
      conceptLabel: "How it was built:",
      concept: "The legacy was monolithic Python batch scripts: sequential, no idempotency, full re-runs on any failure, someone restarting from the top at 2am. Rebuilt as Airflow-orchestrated DAGs of small, idempotent, retryable tasks, with dbt for the SQL transforms. The throughput gain came from concrete engineering, not the rewrite: previously-sequential independent steps now run in parallel, dbt incremental models process only new/changed rows instead of full rebuilds, retries re-run one task not the whole chain, and dbt tests catch bad data before it forces downstream reprocessing.",
      navLabel: "Complications that arise:",
      nav: "Idempotency gaps surface first — a couple of steps double-apply on retry until the loads merge on key. Incremental models silently miss late-arriving or updated records. A sensor waiting for upstream data holds a worker slot and starves the pool. Business logic creeping into the DAG file makes it untestable. And the risk of corrupting live claims data during the cutover itself.",
      noteLabel: "Solutions:",
      note: "Make every task safe to re-run from the start — merge-on-key loads, keyed on the logical execution date not wall-clock 'now', so backfills and retries are deterministic. Incremental models use a lookback window + unique-key merge so updates reconcile, with periodic full-refresh to correct drift. Sensors run in reschedule mode (or event/dataset triggers) so waiting doesn't hold a slot. Logic lives in dbt/Spark, the DAG only coordinates. Cutover was a parallel run: new pipeline alongside old, writing to a separate target, reconciling row counts and key financial totals over several cycles before switching — old kept warm as rollback.",
      followups: [
        { q: "Which single change drove most of the 35%, and how do you know?", a: "Incremental dbt models plus parallelizing the previously-sequential steps. Full-rebuild-every-run was the dominant cost. I know because I measured stage timings before and after — the incremental change collapsed the largest stage, parallelism removed the sequential tail." },
        { q: "What did you measure the 35% against — be precise.", a: "End-to-end wall-clock to process a comparable daily volume, old vs new, averaged over multiple runs to smooth variance. Not one lucky run, not one fast stage, and comparing like volumes so the number reflects the design, not a light day." },
        { q: "Why key tasks on execution_date instead of 'now'?", a: "So a run is deterministic and re-runnable — the task processes the window defined by its logical date regardless of when it executes. That's what makes backfills correct and retries safe. 'Now' processes a different window each rerun, breaking idempotency." },
        { q: "How did you cut over without risking claims data?", a: "Parallel run — new pipeline writing to a separate target, reconciling row counts and key financial totals (billed/paid) against the old until they matched over several cycles, then switch consumers, keeping the old warm as rollback for a defined period." }
      ]
    },
    {
      title: "Project 3 — Validation & reconciliation framework + monitoring/alerting",
      badge: "advanced",
      conceptLabel: "How it was built:",
      concept: "Two layers. Validation at ingest — not-null and format/reference checks on the fields payers reject on (member ID, provider NPI, procedure/diagnosis codes, service dates) — so a likely-denial claim is flagged before submission, not after. Reconciliation across systems — matching claims/encounter data between the clinical/billing source and the warehouse, and 837 billed against 835 paid — so mismatches, missing records, and underpayments surface as reports the revenue-cycle team acts on. It runs on a schedule with thresholds that alert when mismatch rates cross normal.",
      navLabel: "Complications that arise:",
      nav: "Alerting on any nonzero mismatch is pure noise — a small steady mismatch rate is normal, so the team learns to ignore alerts. Validation catches malformed records but misses lost, duplicated, or underpaid records that are each individually valid. And 'we reduced denials' is hard to actually attribute — correlation vs causation.",
      noteLabel: "Solutions:",
      note: "Baseline the normal mismatch/denial rate over history and alert on deviation from baseline — catch step-changes (a source change doubling mismatches) without paging on normal noise. Run both validation and reconciliation because they catch different failure classes: validation checks a record against rules in isolation; reconciliation checks records against each other across systems. On attribution, be honest — point to the pre-submission flag rate correlating with a drop in payer denials for those edit types and to recovered underpayments, and call it directional, not a controlled experiment.",
      followups: [
        { q: "How is reconciliation different from validation — why both?", a: "Validation checks a record against rules in isolation (is this claim well-formed?). Reconciliation checks records against each other across systems (does source match target, billed match paid?). Validation catches malformed data; reconciliation catches lost, duplicated, or underpaid records that are each individually valid. Different failure classes." },
        { q: "How did you set the alert threshold so it wasn't noisy?", a: "Baseline the normal mismatch/denial rate over history, then alert on deviation from that baseline rather than any nonzero mismatch — a small steady rate is expected. Tuned to catch step-changes without paging on normal noise." },
        { q: "Prove the framework caused fewer denials rather than something else.", a: "I'd point to the pre-submission flag rate correlating with a drop in payer denials for the same edit types, and to reconciliation-surfaced underpayments being recovered, with manual reprocessing volume dropping. I'm honest it's directional, not a controlled experiment." },
        { q: "Which fields cause the most denials, and how did you validate them?", a: "Eligibility/member-ID mismatches, invalid or missing NPI, bad procedure/diagnosis code combinations, and service dates outside coverage. Validated with not-null plus format and reference checks at ingest — NPI checksum, codes checked against valid code sets — flagging failures before submission." }
      ]
    },
    {
      title: "Project 4 — Kafka/CDC regional replication, dimensional modeling & HIPAA",
      badge: "advanced",
      conceptLabel: "How it was built:",
      concept: "Regional facility systems were the local source of truth, but central reporting needed one consistent consolidated view — so change-data-capture off the source DBs published to Kafka, with consumers applying changes into the central store. On top of that store, a dimensional model in Snowflake: fact tables at a declared grain (one row per claim line / encounter) with conformed dimensions (patient, provider, payer, date), and SCD Type 2 on attributes like provider network status. All of it under HIPAA controls — encryption, least-privilege RBAC, masking, audit logging, and documented lineage.",
      navLabel: "Complications that arise:",
      nav: "An old CDC update arrives after a newer one and overwrites current state. A redelivered event duplicates a record. A producer adds a field and breaks consumers. Wrong fact-table grain silently double-counts amounts. A Type 1 overwrite corrupts historical adjudication (a claim from last year resolves to today's provider status). And an auditor asks 'where does this PHI field flow, and who can see it?'",
      noteLabel: "Solutions:",
      note: "CDC correctness rests on three things: sequence by source commit position/LSN and apply a change only if newer (conditional upsert) so a stale event can't regress state; idempotent keyed upserts so redelivery is harmless; commit offsets only after a successful write (at-least-once + idempotent sink = effectively exactly-once). A schema registry with compatibility rules stops a producer change breaking consumers. Declare grain explicitly before building. SCD Type 2 with effective dating so historical claims resolve to the status true at service date. For HIPAA: masked views/columns so an analyst sees what they need not raw identifiers, plus lineage + access logs that answer the auditor's two real questions.",
      followups: [
        { q: "An old update arrives after a newer one — how do you prevent regression?", a: "Sequence by source commit position/LSN or a version column, and apply a change only if its sequence is newer than what's stored — a conditional upsert. A late, stale event is ignored instead of overwriting newer state." },
        { q: "Where does 'exactly-once' actually come from here?", a: "It's effectively-once: at-least-once delivery (offsets committed only after a successful write) plus an idempotent keyed upsert sink. Redelivery updates the same row to the same state, so duplicates are harmless. The sink's idempotency is what makes at-least-once safe." },
        { q: "Provider network status changes over time — how do you model it?", a: "SCD Type 2 on the provider dimension: close the old version (effective_to, is_current=false), insert a new one; facts join on the surrogate key so a historical claim resolves to the status true at service date. Type 1 would overwrite and corrupt historical adjudication reporting." },
        { q: "An auditor asks you to prove where a PHI field flows end to end. What do you show?", a: "Data lineage — the documented, ideally tool-captured mapping from source element through each transform to every downstream table/report — plus the access log showing who queried those objects. Together they prove the flow and the controls around it." },
        { q: "Why CDC instead of periodic batch extracts from each facility?", a: "Lower latency for central reporting, far less load on the source systems, and it captures deletes and intermediate states a snapshot diff misses. Batch also struggles to detect what changed without a reliable high-water mark, which CDC gives natively." }
      ]
    }
  ]
},

infodev: {
  intro: {
    title: "InfoDevelopers — software engineering & the DE foundation (2019–2022)",
    desc: "Two projects from the earlier software-engineering role that seed the DE career: the predictive forecasting system that cut operational costs 25%, and the pytest/Selenium test-automation framework. Interviewers use these to check foundations and the deliberate arc into data engineering."
  },
  cards: [
    {
      title: "Project 1 — Predictive forecasting system (−25% operational cost) + ETL",
      badge: "intermediate",
      conceptLabel: "How it was built:",
      concept: "Automated data pipelines and ETL workflows feeding a forecasting system for a demand/load signal, so the team could act proactively instead of reactively. ARIMA covered the stationary, seasonal time-series components; LSTM captured longer non-linear patterns where ARIMA fell short. Evaluated on held-out time windows, not random splits, because time-series can't be shuffled. The 25% came from proactivity — pre-empting issues via monitoring and early intervention rather than paying for them after the fact.",
      navLabel: "Complications that arise:",
      nav: "A random train/test split leaks future information and inflates accuracy — the model looks great and fails live. Overclaiming authorship of a model you supported but didn't own. And attributing a 25% cost cut to a forecast when many factors move operational cost.",
      noteLabel: "Solutions:",
      note: "Chronological splits — train on the past, test on the future — so evaluation reflects real forecasting where you only have the past. On ownership, scope honestly: I built the data pipeline and feature engineering and productionized the scoring/monitoring; model selection and tuning were collaborative. On the metric, frame it directionally — the saving is the gap between planned pre-emptive handling and after-the-fact firefighting, tied to reduced reactive/operational effort, not a controlled experiment.",
      followups: [
        { q: "Why evaluate a time-series model on time-ordered splits, not random?", a: "A random split leaks future information into training — the model sees points after the ones it predicts, inflating accuracy. Split chronologically: train on the past, test on the future, so evaluation reflects real forecasting." },
        { q: "ARIMA vs LSTM — when does each win?", a: "ARIMA for stationary series with clear autocorrelation/seasonality and limited data — interpretable and cheap. LSTM for longer non-linear dependencies and richer features when you have enough data. ARIMA is the strong baseline; only justify LSTM if it beats it on held-out windows." },
        { q: "As the DE, what did you own vs the data scientist?", a: "I owned the data pipeline, feature engineering, and productionizing the scoring/monitoring — reliable, timely inputs and getting predictions into the operational workflow. Model selection and tuning were collaborative. I don't overclaim model authorship." }
      ]
    },
    {
      title: "Project 2 — pytest/Selenium test-automation framework",
      badge: "intermediate",
      conceptLabel: "How it was built:",
      concept: "Two tools for two jobs. pytest for unit and integration tests on the application and data logic — logic factored into testable functions, fixtures for shared setup, @parametrize to cover edge cases as data instead of copy-pasted tests, run in CI so regressions are caught on every change. Selenium for cross-browser and regression testing of the web UI — automating the flows that were painful and error-prone to click through before each release. The payoff was release consistency: less manual QA, fewer regressions in production.",
      navLabel: "Complications that arise:",
      nav: "UI tests are slow and brittle, so leaning on Selenium for logic you could test lower down gives a flaky suite the team stops trusting. Copy-pasted near-identical tests hide which edge cases are actually covered. And a test that depends on manual setup drifts and breaks.",
      noteLabel: "Solutions:",
      note: "Test business rules at the lowest layer (pytest unit tests) and reserve Selenium for a thin layer of critical end-to-end flows — fast where possible, slow only where necessary. @parametrize makes edge cases (zero, null, boundary, error) visible data in one place, so a reviewer sees exactly what's covered and adding a case is one line. Fixtures manage setup/teardown and scope, keeping tests declarative and DRY.<br><br>That same discipline carried directly into DE: factor transforms into pure functions, unit-test in CI, integration-test the wiring, add runtime data-quality gates.",
      followups: [
        { q: "When is Selenium/UI testing the wrong tool?", a: "For logic you can test at a lower layer — UI tests are slow and brittle. Unit-test the business rules directly and reserve Selenium for a thin layer of critical end-to-end flows. Over-relying on UI tests gives a slow, flaky suite that erodes trust." },
        { q: "How does @parametrize improve edge-case coverage?", a: "It runs the same test over many input/expected pairs, so edge cases become visible data in one place instead of copy-pasted functions. A reviewer sees exactly which cases are covered, and adding one is a single line." },
        { q: "How did that testing habit transfer to data engineering?", a: "Same discipline, different target: factor transforms into pure functions, unit-test them in CI with small inputs, integration-test the wiring, add runtime data-quality gates. The reflex 'if it has logic, it has a runnable check' is identical — just applied to pipelines now." }
      ]
    }
  ]
}

};
