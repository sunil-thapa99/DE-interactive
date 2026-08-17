// Content data for the Resume Deep-Dive (Technical) module — tailored to Sunil Thapa's resume.
// Every card is a question an interviewer could ask off a specific resume bullet, with a model
// answer and DEEP, answered follow-ups. Distinct from the behavioral module: this is the
// architecture/implementation grilling, not the STAR story.
const MODULE_ID = "resume";
const CONTENT = {

overview: {
  intro: {
    title: "Technical resume deep-dive — defending what you wrote",
    desc: "Every line on your resume is an invitation to 'walk me through exactly how you did that.' This module takes your real bullets — Cedar Gate healthcare claims, Amex risk/transaction, InfoDevelopers — and turns each into the technical cross-examination a senior interviewer runs: not 'tell me the story' (that's the behavioral module) but 'defend the design, the numbers, and the trade-offs.' Model answers plus deep, answered follow-ups so you can rehearse the whole tree. The last tab — Resume Landmines — is the one candidates skip: the skills you listed but used thinly, and how to answer honestly without deflating."
  },
  cards: [
    {
      title: "How a technical resume grilling actually works",
      badge: "fundamentals",
      conceptLabel: "What's really being tested:",
      concept: "The interviewer picks a bullet, asks you to walk through it, then drills for 8–15 minutes to find the floor of your understanding — where 'we did X' turns into 'I'm not sure.' They're checking three things: did YOU actually do it (or just sit near it), do you understand WHY the design was right (not just what you built), and can you name the trade-off and failure mode you lived with. The senior tell is that you volunteer the metric, the alternative you rejected, and the thing that went wrong — before they have to extract it.",
      noteLabel: "Model answer / approach:",
      note: "\"I run the same rhythm for any resume bullet.<br><br>One line of context first — the problem and the scale. Then the design and the two or three key decisions, including the alternative I rejected and why. Then the result, with a number.<br><br>And then, unprompted, the trade-off or failure mode and what I'd do differently.<br><br>I keep that opening to about 90 seconds, then I stop. The silence invites the follow-up, and the follow-up is where I show depth.<br><br>If I didn't personally own a part, I say who did. That honesty reads as senior, not weak.\"",
      followups: [
        { q: "\"How do you handle a follow-up you genuinely don't know?\"", a: "State the boundary honestly, then reason from fundamentals to a best guess and say how you'd verify it. Something like: 'I didn't own that config, but based on how X works I'd expect Y, and I'd confirm by checking Z.' Bluffing a specific wrong number is fatal. Reasoning transparently is not." },
        { q: "\"Why do interviewers keep drilling even after a good answer?\"", a: "They're finding the floor of your knowledge — the depth at which you stop being certain. It's not hostility. A confident answer three levels down is the strongest possible signal, so give them room to keep going instead of getting defensive." },
        { q: "\"How specific should your metrics be if you don't remember exactly?\"", a: "Quantify the shape honestly. 'Cut the reconciliation run from roughly X hours to Y', or 'reduced repeated pages from several a week to near zero.' Directional-but-true beats precise-but-invented, and it beats no number at all. Never fabricate a figure you can't defend under follow-up." }
      ]
    }
  ]
},

cedar: {
  intro: {
    title: "Cedar Gate Technologies — healthcare claims & clinical data (2022–2024)",
    desc: "The healthcare-DE core of your resume: HL7v2/FHIR/EDI ingestion, the batch→Airflow+dbt migration (+35%), the validation/reconciliation framework, Kafka/CDC replication, dimensional modeling, and HIPAA/PHI. These are the bullets a healthcare or data-platform interviewer will spend the most time on — each here with a model answer and deep answered follow-ups."
  },
  cards: [
    {
      title: "\"Walk me through ingesting HL7v2, FHIR, and EDI 837/835 into your warehouse.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand healthcare data formats concretely (not as buzzwords), how you parse messy semi-structured clinical/claims data reliably, and how you land it idempotently for reporting and revenue-cycle management. They'll probe the format differences and your handling of malformed messages.",
      noteLabel: "Model answer:",
      note: "\"Three different shapes, so three parse paths landing into one model.<br><br>HL7v2 is pipe-and-hat-delimited segment messages from the EHRs. I parsed the segments — MSH, PID, OBX — into structured records. FHIR is JSON resources from the newer systems, things like Patient, Claim, and Observation, so that was schema-on-read into typed columns.<br><br>EDI 837 is the claim submission and 835 is the remittance, the payment. I parsed the X12 segments, and critically I linked the 835 back to its 837 so we could reconcile billed versus paid.<br><br>Everything landed raw first, in an immutable staging layer partitioned by ingest date, then a cleaned and conformed layer. So any parser bug was a reprocess, not a re-pull from the source.<br><br>Malformed messages were quarantined with the reason, never dropped silently. In healthcare, a dropped claim is lost revenue.\"",
      followups: [
        { q: "\"What's the difference between an 837 and an 835, and why does linking them matter?\"", a: "The 837 is the claim the provider submits — what was billed. The 835 is the payer's remittance advice — what was paid and why, including denial and adjustment codes. Linking them is how you reconcile billed versus paid and catch underpayments and denials. That's the core of revenue-cycle management, and it's the basis of the denial-reduction work." },
        { q: "\"HL7v2 vs FHIR — when does a source give you one or the other?\"", a: "HL7v2 is the legacy standard most existing EHR interfaces still emit — delimited segments, event-driven messages like ADT and ORU. FHIR is the modern REST/JSON resource model the newer systems expose. You handle both because a real payer or provider estate is mixed. Old interfaces don't get rewritten just because FHIR exists." },
        { q: "\"A batch of 837s has malformed segments. Drop, fail, or quarantine — and why?\"", a: "Quarantine with the failure reason, never silently drop. A dropped claim is unbilled revenue and a compliance problem. Failing the whole batch blocks the good claims too, so I isolate the bad records to a quarantine table for correction and reprocessing while the valid ones flow through." },
        { q: "\"How did you make ingestion idempotent so a re-run didn't double-count claims?\"", a: "Land raw immutably, then upsert into the conformed layer keyed on the claim business key rather than blind-appending. Replaying a file updates in place. Combined with tracking which files were already processed, a re-run after a fix reconciles instead of duplicating — which is essential when duplicate claims mean duplicate billing." }
      ]
    },
    {
      title: "\"You migrated batch scripts to Airflow + dbt and improved throughput 35%. How?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether the 35% came from real engineering (idempotency, parallelism, incremental processing, tested transforms) or just 'we rewrote it,' and whether you measured honestly and cut over safely. This is your headline metric — expect the hardest drilling here.",
      noteLabel: "Model answer:",
      note: "\"The legacy was monolithic Python batch scripts — sequential, no idempotency, full re-runs on any failure, and someone restarting from the top at 2am. I moved it to Airflow-orchestrated DAGs with dbt for the SQL transforms.<br><br>The throughput gain came from concrete things, not the rewrite itself. Independent steps that used to run in sequence now ran in parallel. dbt incremental models processed only new or changed data instead of full rebuilds. Idempotent, retryable tasks meant a failure re-ran one task, not the whole chain. And dbt tests caught bad data before it forced downstream reprocessing.<br><br>I measured end-to-end wall-clock over comparable volumes, before and after.<br><br>For the cutover, I ran old and new in parallel and reconciled the outputs until they matched, then switched.\"",
      followups: [
        { q: "\"Which single change drove most of the 35%, and how do you know?\"", a: "Incremental dbt models plus parallelizing the previously-sequential steps. The full-rebuild-every-run was the dominant cost. I know because I measured stage timings before and after — the incremental change collapsed the largest stage's runtime, and the parallelism removed the sequential tail." },
        { q: "\"How did dbt incremental models work here, and what's the risk with them?\"", a: "An incremental model only transforms rows newer than what's already loaded — an is_incremental filter on a timestamp or key — instead of rebuilding the whole table. The risk is missing late-arriving or updated records. So I used a lookback window and a unique-key merge so updates reconcile rather than duplicate, and I periodically full-refreshed to correct any drift." },
        { q: "\"How did you cut over without risking claims data during the switch?\"", a: "A parallel run. The new pipeline ran alongside the old one, writing to a separate target, and I reconciled row counts and the key financial totals — billed and paid — between them until they matched over several cycles. Only then did I switch consumers over, and I kept the old one warm as a rollback for a defined period." },
        { q: "\"What did you measure the 35% against — be precise.\"", a: "End-to-end wall-clock time to process a comparable daily volume, old versus new, averaged over multiple runs to smooth out variance. Not a single lucky run, and not just one fast stage. I was careful to compare like volumes so the number reflected the design, not a light day." },
        { q: "\"What broke or surprised you during the migration?\"", a: "Idempotency gaps surfaced first. A couple of steps double-applied on retry until I made the loads merge-on-key. That's exactly why I now treat every task as 'must be safe to re-run' from the start — retries are only safe if the work is idempotent." }
      ]
    },
    {
      title: "\"Describe the validation & reconciliation framework that reduced claim denials.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you treat data quality as a system (rules, thresholds, reconciliation between source and target) rather than ad-hoc checks, and whether you can connect a technical control to a business outcome — fewer denials means protected revenue.",
      noteLabel: "Model answer:",
      note: "\"Two layers.<br><br>Validation ran at ingest — not-null and format checks on the fields payers reject on, like member IDs, provider NPI, procedure and diagnosis codes, and service dates. So a claim likely to be denied got flagged before submission, not after.<br><br>Reconciliation ran across systems. I matched claims and encounter data between the clinical/billing source and the warehouse, and 837 billed against 835 paid, so mismatches, missing records, and underpayments surfaced as reports the revenue-cycle team acted on.<br><br>The business tie is direct: catching a bad claim pre-submission avoids a denial-and-resubmit cycle, and surfacing underpayments recovers revenue that would otherwise leak.<br><br>It ran on a schedule with thresholds that alerted when mismatch rates crossed normal, so drift got escalated proactively.\"",
      followups: [
        { q: "\"What specific fields cause the most denials, and how did you validate them?\"", a: "Eligibility and member-ID mismatches, invalid or missing provider NPI, bad or non-covered procedure/diagnosis code combinations, and service dates outside coverage. I validated with not-null plus format and reference checks at ingest — an NPI checksum, a code checked against a valid code set — flagging failures before submission." },
        { q: "\"How is reconciliation different from validation — why do you need both?\"", a: "Validation checks a record against rules in isolation — is this claim well-formed? Reconciliation checks records against each other across systems — does source match target, does billed match paid? Validation catches malformed data. Reconciliation catches lost, duplicated, or under-paid records that are each individually valid. Different failure classes." },
        { q: "\"How did you set the alerting threshold so it wasn't noisy?\"", a: "I baselined the normal mismatch and denial rate over history, then alerted on deviation from that baseline rather than on any nonzero mismatch — a small steady rate is expected. I tuned it to catch step-changes, like a source change doubling mismatches, without paging on normal noise." },
        { q: "\"Prove the framework caused fewer denials rather than something else.\"", a: "I'd point to the pre-submission flag rate correlating with a drop in payer denials for those same edit types, and to reconciliation-surfaced underpayments being recovered. Directionally, denials on the validated edit types fell and manual reprocessing volume dropped. I'm honest that it's directional, not a controlled experiment." }
      ]
    },
    {
      title: "\"You replicated data across regional facilities with Kafka/CDC. Walk me through it.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand CDC mechanics (log-based capture, ordering, idempotency), how you handled schema changes and out-of-order/duplicate events, and how you kept regions consistent for centralized reporting without losing or double-applying records.",
      noteLabel: "Model answer:",
      note: "\"Regional facility systems were the source of truth locally, but central reporting needed one consistent consolidated view. So I used change-data-capture off the source databases, publishing to Kafka, with consumers applying those changes into the central store.<br><br>Three things make CDC correct.<br><br>Ordering — I sequenced by the source commit position so a stale update couldn't overwrite a newer one. Idempotency — consumers upserted on the business key, so a redelivered event didn't duplicate. And delivery — offsets were committed only after the write succeeded, so at-least-once delivery plus idempotent upsert gave effectively exactly-once.<br><br>Schema changes were the operational risk, so a schema registry with compatibility rules kept a producer change from breaking consumers.\"",
      followups: [
        { q: "\"An old update arrives after a newer one (out of order). How do you prevent regression?\"", a: "Sequence by the source commit position or LSN, or a version column, and only apply a change if its sequence is newer than what's stored — a conditional upsert. A late, stale event is then ignored instead of overwriting the newer state." },
        { q: "\"Exactly where does 'exactly-once' come from in your design?\"", a: "It's effectively-once, not magic. At-least-once delivery — offsets committed only after a successful write — combined with an idempotent, keyed upsert sink. Redelivery updates the same row to the same state, so duplicates are harmless. The sink's idempotency is what makes at-least-once safe." },
        { q: "\"A producer adds a field. How do you stop that breaking consumers?\"", a: "A schema registry enforcing backward and forward compatibility. Additive changes with defaults are allowed, breaking changes are rejected at publish time. Consumers tolerate unknown or new fields, so a producer evolution doesn't crash the pipeline." },
        { q: "\"Why CDC instead of a periodic batch extract from each facility?\"", a: "Lower latency for central reporting, far less load on the source systems than repeated full or large extracts, and it captures deletes and intermediate states a snapshot diff would miss. Batch extract also struggles to detect what changed without a reliable high-water mark, which CDC gives you natively." }
      ]
    },
    {
      title: "\"You designed relational and dimensional schemas in PostgreSQL/Snowflake — show me.\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you actually model dimensionally (grain, facts vs dimensions, SCDs) rather than just create tables, and whether you choose normalization vs denormalization deliberately for the workload.",
      noteLabel: "Model answer:",
      note: "\"I matched the model to the workload.<br><br>For the operational and staging side in Postgres, I stayed more normalized to keep writes clean.<br><br>For the analytics warehouse in Snowflake, I modeled dimensionally — fact tables at a defined grain, one row per claim line or per encounter, with conformed dimensions for patient, provider, payer, and date, so the same provider dimension served every fact.<br><br>I declared the grain explicitly before building, because getting grain wrong is the classic modeling bug that silently double-counts.<br><br>Slowly-changing attributes like provider network status I handled as SCD Type 2 with effective dating. So a claim adjudicated last year still resolves to the provider attributes that were true then — which is critical for accurate historical reporting.\"",
      followups: [
        { q: "\"What's the grain of your claims fact table and why does it matter?\"", a: "One row per claim line item, the service line, because that's the level payment and denial happen at. Grain matters because it defines what a COUNT or SUM means — mixing grains, claim-level and line-level in one fact, silently double-counts amounts. I fix the grain first, then everything aggregates cleanly." },
        { q: "\"Provider network status changes over time. How do you model that?\"", a: "SCD Type 2 on the provider dimension. Close the old version — effective_to, is_current false — and insert a new one, and facts join on the surrogate key, so a historical claim resolves to the status that was true at service date, not today's. Type 1 would overwrite and corrupt the historical adjudication reporting." },
        { q: "\"When did you denormalize, and what did it cost you?\"", a: "In the gold marts I denormalized common provider and payer attributes onto the fact, or into wide reporting tables, to avoid repeated joins for BI. The cost is storage and update complexity — if a denormalized attribute changes I have to propagate it. So I only did it for read-heavy, latency-sensitive reporting surfaces, not the core model." },
        { q: "\"Postgres vs Snowflake here — why split the work?\"", a: "Postgres for the operational and staging workloads — transactional writes, smaller, low-latency. Snowflake for analytics at scale — columnar, elastic compute, dimensional marts serving BI. Using each for what it's good at, OLTP-ish versus OLAP, rather than forcing one to do both." }
      ]
    },
    {
      title: "\"How did you handle PHI/PII and prove HIPAA compliance?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Concrete controls, not buzzwords: encryption, least-privilege access, masking, audit logging, and lineage that proves where PHI flows. They want evidence you can pass an audit, not that you 'follow HIPAA.'",
      noteLabel: "Model answer:",
      note: "\"Controls at every layer.<br><br>Encryption at rest and in transit as a baseline. Least-privilege, role-based access so only the roles that needed PHI could see it, with masking and limited views for everyone else — an analyst saw what they needed, not raw identifiers.<br><br>Audit logging of access, so we could always answer 'who touched this.'<br><br>And documented data-mapping and lineage — where each PHI element originated and how it flowed from source to report. An auditor's real questions are 'where does PHI go' and 'who can see it', and lineage plus access records answer both.<br><br>I worked with clinical ops and revenue-cycle to keep that documentation current, not a stale one-time artifact.\"",
      followups: [
        { q: "\"An analyst needs claims data but must never see the SSN/MRN. How?\"", a: "Expose a view or a masked column that returns the identifier only to a privileged role, and null or masked otherwise, with the analyst's role granted the masked path. Least-privilege plus column masking, enforced centrally so it applies on every access route, not per-tool." },
        { q: "\"An auditor asks you to prove where a PHI field flows end to end. What do you show?\"", a: "Data lineage — the documented, and ideally tool-captured, mapping from the source element through each transformation to every downstream table and report — plus the access log showing who queried those objects. Together they prove the flow and the controls around it." },
        { q: "\"What's the difference between masking and encryption for PHI, and when each?\"", a: "Encryption protects data at rest and in transit from unauthorized system access — you need the keys to read it. Masking controls what an authorized-but-limited user sees at query time, like the last-4 of an ID. You need both: encryption for storage and transport security, masking for least-privilege within the app." },
        { q: "\"How do you keep lineage/governance docs from going stale?\"", a: "Tie them to the pipeline — generate lineage from the code or catalog where possible rather than hand-maintaining it. Review it on every schema change as part of the change process. And co-own it with the business teams so updates happen when feeds change, not as a once-a-year scramble before audit." }
      ]
    },
    {
      title: "\"You used dbt for the transforms — go deeper than 'incremental models'.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "You named dbt on the migration bullet, so a dbt shop will drill past incremental models into the features that show real production use: snapshots for SCD, tests/sources/exposures, materialization choices, and macros for DRY SQL. A vague answer here after claiming dbt exposes the bullet as thin.",
      noteLabel: "Model answer:",
      note: "\"Beyond incremental models, here are the dbt features I leaned on.<br><br>Snapshots for slowly-changing dimensions. dbt snapshot captures history on a source table, with a timestamp or check strategy, so a provider's network-status changes are versioned as Type 2 without me hand-rolling effective dating.<br><br>Sources with freshness checks, so a stale upstream feed fails loudly at the edge. And tests as the quality gate — not-null, unique, accepted_values, relationships for referential integrity, plus a few custom singular tests for business rules — run in CI and before promotion.<br><br>Materializations chosen per model: views for cheap passthroughs, tables for the heavy reused ones, incremental for the big append/merge facts. And macros to DRY up repeated logic, like a shared surrogate-key or code-cleaning macro, plus ref() giving me the DAG and lineage for free.<br><br>The senior point is that I use dbt as a tested, version-controlled transformation layer, not just SQL-in-a-scheduler.\"",
      followups: [
        { q: "\"How does a dbt snapshot implement SCD Type 2 exactly?\"", a: "dbt snapshot records a row's state over time in a snapshot table with dbt_valid_from and dbt_valid_to columns. The timestamp strategy detects change via an updated_at column; the check strategy diffs specified columns. On each run, changed rows close the old version by setting valid_to and insert a new current version. That's Type 2, maintained by dbt instead of hand-written effective-dating MERGE logic." },
        { q: "\"incremental model vs snapshot — when each?\"", a: "Incremental is for efficiently appending or merging new fact rows so you don't rebuild a huge table. Snapshot is for capturing the history of a mutable dimension source — preserving what a record looked like at each point in time. Different jobs: incremental is about processing cost, snapshot is about historical accuracy, the SCD." },
        { q: "\"What dbt tests did you run, and which caught the most real issues?\"", a: "Generic tests — unique and not_null on keys, relationships for referential integrity, accepted_values on code columns — plus singular tests for business invariants like paid ≤ billed. The relationships and not_null-on-keys tests caught the most, because broken keys silently corrupt joins and aggregates downstream. Catching them in CI beats debugging a wrong report." },
        { q: "\"Why put transforms in dbt rather than plain SQL scripts or stored procs?\"", a: "The ref()-driven DAG and lineage, built-in testing, environment-aware promotion, and version control. The transform layer becomes tested, reviewable software instead of loose scripts. Stored procs lack the dependency graph, the testing framework, and the Git-first workflow. dbt is why the SQL layer got the same engineering rigor as the code." }
      ]
    },
    {
      title: "\"You orchestrated with Airflow — walk me through the DAG design, not just 'we used Airflow'.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Airflow is on the migration bullet, so expect drilling into real orchestration design: DAG structure and dependencies, idempotent retryable tasks, backfill/catchup semantics, sensors vs triggers, passing state, and avoiding the classic anti-patterns. Naming Airflow without operational depth is a landmine.",
      noteLabel: "Model answer:",
      note: "\"I designed DAGs as graphs of small, idempotent, retryable tasks, rather than one monolithic step. So a failure retries one task, not the whole chain, and a re-run reconciles instead of duplicating.<br><br>Dependencies were explicit, so independent branches ran in parallel and only truly dependent steps serialized. I parameterized on the logical execution/data date, not wall-clock 'now', so backfills and reruns processed the correct window deterministically. And I was deliberate about catchup — off for pipelines that shouldn't stampede historical runs, on with a bounded start for the ones that should.<br><br>For 'wait for upstream data' I preferred sensors in reschedule mode, or event and dataset triggers, over poke mode — so a waiting task didn't hold a worker slot.<br><br>I kept heavy compute out of the Airflow workers. Airflow orchestrates, the cluster or warehouse does the work, and I passed only small values via XCom, never big data.<br><br>The anti-pattern I avoid is business logic living in the DAG file. The DAG coordinates; the tasks — dbt, Spark — transform.\"",
      followups: [
        { q: "\"Why key tasks on execution_date instead of the current time?\"", a: "So a run is deterministic and re-runnable. The task processes the window defined by its logical date, regardless of when it actually executes. That's what makes backfills correct and retries safe. 'Now' would process a different window on every rerun, breaking idempotency and making a backfill reprocess the wrong data." },
        { q: "\"poke vs reschedule sensor mode — why does it matter at scale?\"", a: "A poke sensor holds a worker slot the entire time it waits, so many waiting sensors starve the pool and deadlock the scheduler. Reschedule mode releases the slot between checks, so the worker is free while waiting. At any real scale you use reschedule — or better, dataset and event-driven triggers — to avoid slot exhaustion." },
        { q: "\"How do you backfill a month without hammering the source or double-loading?\"", a: "Idempotent, date-parameterized tasks that merge-on-key, bounded parallelism via max_active_runs and pool limits so you don't stampede the source, and catchup controlled deliberately. Because each run is keyed on its logical date and the loads are merge-not-append, replaying the month reconciles instead of duplicating, at a rate the source can absorb." },
        { q: "\"What should never go inside an Airflow task, and where does it go instead?\"", a: "Heavy data processing, and big datasets pushed through XCom. Compute belongs on Spark or the warehouse — Airflow triggers it and tracks success. XCom is for small control values like a path, a count, a flag, not datasets. Keeping transformation logic in dbt or Spark and coordination in Airflow keeps the workers light and the logic testable outside the scheduler." }
      ]
    }
  ]
},

amex: {
  intro: {
    title: "American Express — risk & transaction data at scale (2024–present)",
    desc: "Your current role: large-scale transaction/customer ETL for risk and analytics, Spark + Snowflake optimization, cost right-sizing, CI/CD, on-call/RCA, data contracts and governance. A finance/platform interviewer will push on scale, reliability, cost, and how you operate in a regulated enterprise."
  },
  cards: [
    {
      title: "\"You optimized Spark jobs and Snowflake queries — give me a concrete before/after.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you diagnose from evidence (Spark UI, Snowflake query profile) and apply principled fixes (partitioning, broadcast, avoiding shuffles, clustering, warehouse sizing) with a real before/after — not a grab-bag of tips.",
      noteLabel: "Model answer:",
      note: "\"Let me give you one from each side.<br><br>On the Spark side, a job was slow from a skewed join — a few transaction keys had most of the rows, so a handful of tasks ran 10x longer while the rest idled. I confirmed it in the Spark UI's task-time distribution. Then I fixed it by broadcasting the small dimension to avoid the shuffle where I could, and salting the hot key where I couldn't. The straggler stages collapsed.<br><br>On the Snowflake side, a heavy analytical query was scanning far more than it needed — the query profile showed poor pruning. I added a clustering key aligned to the common filter, transaction date and account, and I rewrote a predicate that had wrapped the partition column in a function, which had been defeating pruning.<br><br>I always work from the profile or the UI, and I change one thing at a time and re-measure. I never guess.\"",
      followups: [
        { q: "\"How did you confirm it was skew and not just an undersized cluster?\"", a: "The Spark UI task-time distribution within the stage. Skew shows a few tasks running far longer than the median while most finish fast and executors sit idle. An undersized cluster shows uniformly busy executors and consistent task times. Idle capacity plus a long tail equals skew, so more nodes wouldn't have helped." },
        { q: "\"When does salting beat broadcast for a skewed join, and what's salting's cost?\"", a: "Broadcast only works when one side is small enough to replicate to every executor. When both sides are large but one key is hot, you salt — split the hot key into N sub-keys on both sides to spread it across tasks. The cost is added complexity and a larger join, the fan-out of salt values, so you salt only the skewed keys, not the whole dataset." },
        { q: "\"A 'filtered' Snowflake query still scans everything. Most likely cause?\"", a: "A function wrapping the pruning column in the WHERE clause — something like DATE(ts) = ... — defeats micro-partition pruning, so Snowflake can't skip micro-partitions. Rewrite it as a range predicate on the raw column so pruning kicks in. That's usually the single biggest scan reduction." },
        { q: "\"How do you choose a Snowflake clustering key, and when is it not worth it?\"", a: "Cluster on the column or columns queries filter and range on most, often date or account. It's not worth it on small tables, where micro-partitions already prune well, on high-churn tables where reclustering cost is high, or when queries don't filter on a consistent key. Clustering has a maintenance cost, so it has to pay for itself in pruning." }
      ]
    },
    {
      title: "\"Tell me about the cost / right-sizing initiative and how you protected SLAs.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you approached cost systematically (biggest spenders first, measure, change one thing, re-measure) and whether you cut spend without breaking SLAs — a method, not a one-off lucky win.",
      noteLabel: "Model answer:",
      note: "\"Method first. I found the biggest spenders from usage data — which warehouses, clusters, and storage tiers cost the most — and attacked those, because chasing small line items wastes effort.<br><br>Then the concrete levers. Right-sizing the Snowflake warehouses to the workload and setting auto-suspend so idle warehouses stopped billing. Right-sizing the Spark clusters instead of running one oversized cluster. And tiering storage so cold data moved off the hot, expensive tiers.<br><br>The SLA guard was to change one thing at a time and re-measure both cost and runtime. If a downsize pushed a job past its window, I backed it off.<br><br>The point is that protecting the SLA is a constraint, not an afterthought. I never traded a missed data-delivery deadline for savings.\"",
      followups: [
        { q: "\"Where do you look first to find what's actually costing the most?\"", a: "Usage and billing data broken down by warehouse or cluster and by job — Snowflake's account usage views, cloud cost reports, cluster utilization. You rank the spenders and target the top few. Optimizing a cheap job is wasted effort, no matter how inefficient it looks." },
        { q: "\"How does auto-suspend save money without hurting the first query's latency?\"", a: "Auto-suspend stops a warehouse after it's idle, so you stop paying for nothing. The trade is a brief resume on the next query. You tune the idle timeout to the workload — short for spiky ad-hoc, longer for steady batch — and accept the small warm-up in exchange for not paying through long idle gaps." },
        { q: "\"You downsized a cluster and a job started missing its window. Now what?\"", a: "Back off the change. The SLA is the constraint. Then find why it's on the critical path — is it skew or a shuffle I can fix so it runs fast on the smaller cluster, instead of paying for a bigger one to mask an inefficiency? Fix the root cause, then re-attempt the downsize." },
        { q: "\"How do you make cost savings stick instead of drifting back?\"", a: "Guardrails, not one-time cleanups. Warehouse size and auto-suspend defaults, cluster policies capping sizes, storage lifecycle rules, and monitoring that flags spend regressions. Otherwise teams re-inflate clusters and the savings evaporate. The durable win is policy, not a heroic one-off." }
      ]
    },
    {
      title: "\"Walk me through an on-call incident and how you ran the RCA.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Incident discipline: how you triaged (stop the bleeding vs find the cause), how you communicated while data was late, the actual root cause, and the preventive fix so it never pages again. Blaming upstream data is the wrong tone; owning the response is right.",
      noteLabel: "Model answer:",
      note: "\"My structure is: stabilize, then diagnose, then prevent.<br><br>When a critical pipeline failed or ran late, step one was stop the bleeding and communicate — tell the downstream risk and analytics stakeholders that data would be late, and give an ETA. A known delay is manageable; a silent one destroys trust.<br><br>Then I triaged from evidence — the failing task's logs and the recent changes, deploys, upstream schema or volume shifts — rather than guessing. Once I had the root cause, I applied the fix, backfilled correctly, and validated the output.<br><br>The part that matters most is the preventive fix — a validation check, a schema guard, an idempotency fix, or an alert — so the same failure can't page us again.<br><br>And I write it up in a runbook so the next person resolves it faster.\"",
      followups: [
        { q: "\"Data's late and stakeholders are asking. What do you say before you know the cause?\"", a: "Acknowledge the delay, give a rough ETA or a time you'll next update, and state impact in their terms — 'the risk dashboard will refresh late.' You don't need the root cause to communicate. A proactive 'we're on it, next update in 30 minutes' preserves trust far better than silence while you dig." },
        { q: "\"Upstream sent bad/late data and broke your job. Whose problem is it?\"", a: "Mine to respond to, regardless of source. The senior move is owning the handling — a schema or volume guard that fails gracefully and alerts instead of corrupting downstream — then working with the source owner on a data contract or SLA so it's less likely to recur. Blaming upstream while your pipeline breaks is the wrong signal." },
        { q: "\"How do you make sure the same incident never pages you again?\"", a: "The preventive fix is the deliverable, not the restart. Add the missing validation, guard, or idempotency, and an alert that catches the condition earlier, then document it in a runbook. An incident that recurs identically means the RCA stopped at the symptom." },
        { q: "\"You had to backfill after the fix. How do you backfill safely?\"", a: "Idempotently. Reprocess the affected window with merge-on-key loads so it reconciles rather than duplicates, from the immutable raw layer, and validate row counts and key totals against expectation before releasing it downstream. Non-idempotent backfill is how you turn one incident into two." }
      ]
    },
    {
      title: "\"How do you build CI/CD and testing for data pipeline deployments?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you ship pipelines like software — version control, automated tests, staged promotion — rather than editing jobs by hand, and whether you understand what to test at each layer.",
      noteLabel: "Model answer:",
      note: "\"Pipelines live in Git, and a CI pipeline runs on every PR.<br><br>That's unit tests on the transformation logic — which I factor into importable functions, not buried in a notebook or script — plus linting and dbt tests for the SQL models.<br><br>A merge deploys to a staging environment where integration tests run against real infrastructure with sample data. Only after that does it promote to prod, through a gated, automated deploy, not a manual copy.<br><br>The layering mirrors any pipeline: many fast unit tests, fewer integration tests, and data-quality checks that run in production on every load.<br><br>The win over hand-deploying is consistency and rollback. A bad change is caught in CI or reverted by re-deploying a known-good version, not hotfixed live.\"",
      followups: [
        { q: "\"What do you unit-test vs integration-test in a data pipeline?\"", a: "Unit-test pure transformation logic with small in-memory inputs — dedup, parsing, business rules — fast, in CI, no infra. Integration-test the wiring — read, transform, write against real storage and the actual SQL dialect with sample data — to catch what mocks hide, like schema, permissions, and dialect. Different failure classes." },
        { q: "\"A pipeline passes all unit tests but still loads bad data. How?\"", a: "Unit tests check your code, not the world's data. An upstream schema or volume change slips past them. That's why you also run production data-quality checks — not-null and unique keys, row-count and volume bands, referential checks — that gate the load at runtime. Code tests catch your bugs; data tests catch upstream changes." },
        { q: "\"How do you isolate staging from prod so a test can't touch prod data?\"", a: "Separate environments with separate credentials and roles and separate schemas or accounts. Staging compute has no permission on prod data, so even a misconfigured test physically can't read or write prod. Config and secrets are per-environment, injected at deploy, never hardcoded." },
        { q: "\"How does CI/CD give you safe rollback?\"", a: "Because the pipeline is versioned and deploys are reproducible, rolling back is just re-deploying the last known-good commit or artifact, not hand-editing prod. Combined with idempotent loads, you can revert the code and reprocess cleanly instead of hotfixing under pressure." }
      ]
    },
    {
      title: "\"How do you set up data contracts and SLAs with source owners?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you convert vague expectations into a written, agreed spec — schema, semantics, freshness, quality, and what happens on breach — and whether you can hold both sides to it.",
      noteLabel: "Model answer:",
      note: "\"A data contract is a written agreement with the source owner.<br><br>It covers the schema and types, the semantics of each field, expected freshness and delivery cadence, volume ranges, quality guarantees, and — crucially — what happens on a breaking change, meaning advance notice and versioning. I turn 'the data will be there' into something both sides signed off on.<br><br>The SLA is the delivery-and-quality promise attached to it: data arrives by time T, meets these checks, with an agreed process if it doesn't.<br><br>Then I enforce it technically. Schema and volume guards that detect a contract violation and alert, so a source-side change surfaces as a clear 'contract breach' rather than a mysterious downstream corruption.<br><br>The senior signal is producing the artifact and getting agreement, not just hoping the source stays stable.\"",
      followups: [
        { q: "\"What exactly goes in a data contract?\"", a: "Schema and field types, the semantic meaning of each field, freshness and delivery cadence, expected volume ranges, quality guarantees like nullability, key uniqueness, and valid value sets, ownership and contacts, and the change-management policy — how breaking changes get versioned and communicated in advance." },
        { q: "\"A source silently changes schema and breaks you. How does a contract help?\"", a: "The contract defines what's allowed and the notice process, so the change is a defined breach, not a surprise. Technically I enforce it with a schema guard that detects the violation at ingest and alerts, failing closed, instead of letting it corrupt downstream. It turns a silent break into an actionable, attributable alert." },
        { q: "\"How do you enforce an SLA rather than just document it?\"", a: "Monitor freshness and quality against the agreed thresholds and alert on breach, with the agreed escalation path. The SLA is only real if a miss triggers a defined response — otherwise it's a wish. I make the breach observable and route it to the owner who can fix it." },
        { q: "\"Source owner won't commit to a contract. What do you do?\"", a: "Make the risk visible. Document the current undefined behavior and the downstream impact of a change, propose a minimal contract — even just 'notify us before schema changes' — and add defensive guards on my side regardless. Influence without authority is showing the cost of no contract, not demanding one." }
      ]
    },
    {
      title: "\"You process transaction data for risk — walk me through the Structured Streaming design.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Real-time/near-real-time transaction risk implies streaming, so a senior interviewer probes Spark Structured Streaming specifics: checkpoints and exactly-once, watermarks and late data, stateful operations, output modes, and how you keep a 24/7 stream reliable. Naming 'streaming' without the delivery-semantics detail is thin at this level.",
      noteLabel: "Model answer:",
      note: "\"The mental model is the micro-batch as an incremental query over an unbounded table.<br><br>The load path is transactions landing on Kafka, a Structured Streaming job reading them, enriching against reference and feature data, and writing to Delta for risk scoring and downstream analytics.<br><br>The pieces that make it correct: checkpoints persist the read offsets and any state, so a restart resumes exactly where it left off — that plus Delta's atomic commits gives effectively exactly-once into the sink, not just at-least-once. Watermarks bound how long I wait for late-arriving events, so stateful operations like windowed aggregates and stream-stream joins can drop state that's too old instead of growing unbounded. That's a real trade-off between completeness and memory.<br><br>I pick the output mode deliberately — append for immutable event writes, update for keyed aggregates. For the reference-data join I broadcast the small side or use a stream-static join, so I'm not shuffling per micro-batch.<br><br>And I run it with a checkpoint on durable storage, monitoring for consumer lag and state-store growth, because a streaming job is a long-lived service, not a batch that ends.\"",
      followups: [
        { q: "\"Where does exactly-once actually come from in Structured Streaming?\"", a: "It's effectively-once, via two mechanisms. The checkpoint records the source offsets processed per micro-batch, and the sink commit is atomic and idempotent — Delta commits the batch's files transactionally, tied to that offset range. On restart it reprocesses the last uncommitted batch, and the atomic commit prevents duplicates. Replayable source plus checkpointed offsets plus idempotent transactional sink equals exactly-once. Drop any one and you're back to at-least-once." },
        { q: "\"What does a watermark do, and what's the cost of setting it too tight or too loose?\"", a: "A watermark tells the engine 'don't expect events older than max_event_time minus the threshold', so it can finalize windows and evict old state. Too tight and you drop legitimately late transactions — data loss, undercounting. Too loose and state grows, memory and latency climb. You set it from the real late-arrival distribution of the source: tight enough to bound state, loose enough not to drop meaningful late data." },
        { q: "\"How do you enrich each transaction with reference/feature data without killing throughput?\"", a: "Avoid a per-record lookup shuffle. Broadcast the small reference dataset so the join is map-side, or use a stream-static join against a Delta table that Spark re-reads efficiently. For features that must be fresh, a stream-stream join with watermarks on both sides, or an external low-latency store for point lookups. The rule is keep the hot path shuffle-free where possible." },
        { q: "\"A streaming job runs 24/7 — what breaks over time that a batch job never hits?\"", a: "Unbounded state growth from no or loose watermark, checkpoint corruption or incompatibility across code changes, consumer lag creeping up when the input rate exceeds the processing rate, and small-file accumulation in the Delta sink from frequent micro-batch commits. So I monitor lag and state-store size, compact the sink with OPTIMIZE, and treat checkpoint and schema changes as careful migrations. It's an always-on service with service concerns, not a job that ends." }
      ]
    }
  ]
},

early: {
  intro: {
    title: "InfoDevelopers & foundations (2019–2022) + education",
    desc: "Your earlier software-engineering role and your degrees. Interviewers use these to check foundations (testing, SQL, forecasting/ML basics) and to probe the career arc — why you moved from software engineering into data engineering, and how the AI/ML diploma fits."
  },
  cards: [
    {
      title: "\"Tell me about the predictive forecasting system that cut costs 25%.\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand the forecasting/ML basics you claim (ARIMA/LSTM), how forecasting drove a real operational saving, and honesty about your role (built the data/pipeline vs authored the model).",
      noteLabel: "Model answer:",
      note: "\"The system forecast a demand and load signal so the team could act proactively instead of reactively.<br><br>The 25% came from that proactivity — pre-empting issues rather than paying for them after the fact, through monitoring and early intervention.<br><br>On the modeling, ARIMA suited the stationary, seasonal time-series components, and LSTM captured the longer non-linear patterns where ARIMA fell short. I evaluated on held-out time windows, not random splits, because time-series can't be shuffled.<br><br>I'm clear about my role: I built the data pipeline and feature engineering that fed the model, and I productionized the scoring. The model choice was collaborative.<br><br>The saving was operational — proactive monitoring driven by the forecast reduced the costly reactive work.\"",
      followups: [
        { q: "\"Why evaluate a time-series model on time-ordered splits instead of a random split?\"", a: "Because a random split leaks future information into training — the model sees points after the ones it predicts, which inflates accuracy. You split chronologically, train on the past and test on the future, so evaluation reflects real forecasting, where you only have the past." },
        { q: "\"ARIMA vs LSTM — when does each win?\"", a: "ARIMA for stationary series with clear autocorrelation and seasonality and limited data — it's interpretable and cheap. LSTM for longer, non-linear dependencies and richer feature sets, when you have enough data to train it. ARIMA is the strong baseline; you only justify LSTM if it beats it on held-out windows." },
        { q: "\"As the DE, what did you actually own versus the data scientist?\"", a: "I owned the data pipeline, the feature engineering, and productionizing the scoring and monitoring — reliable, timely inputs and getting predictions into the operational workflow. Model selection and tuning were collaborative. I don't overclaim authorship of the model. The DE value was the reliable data and the productionization around it." },
        { q: "\"How did a forecast turn into a 25% cost cut concretely?\"", a: "The forecast enabled proactive action — anticipating load and issues and intervening before they became expensive reactive incidents. The saving is the difference between planned, pre-emptive handling and after-the-fact firefighting. I'd frame it as directional and tied to reduced reactive and operational effort." }
      ]
    },
    {
      title: "\"You built testing frameworks with pytest and Selenium — what and why?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you have genuine testing discipline (not just 'I wrote some tests') and understand unit vs integration vs UI/regression testing and their trade-offs.",
      noteLabel: "Model answer:",
      note: "\"Two tools for two jobs.<br><br>pytest for unit and integration tests on the application and data logic. I factored the logic into testable functions, used fixtures for shared setup and parametrize to cover edge cases as data instead of copy-pasted tests, and ran it in CI so regressions were caught on every change.<br><br>Selenium for cross-browser and regression testing of the web UI — automating the flows that were painful and error-prone to click through manually before each release.<br><br>The payoff was release consistency: less manual QA, fewer regressions reaching production.<br><br>And that testing habit carried directly into data engineering. The same 'make it testable, automate the check, run it in CI' discipline is exactly how I test transformations and gate pipelines now.\"",
      followups: [
        { q: "\"pytest fixtures vs just calling a setup function — why fixtures?\"", a: "Fixtures are injected by naming them as arguments, they're reusable across tests, they compose, and they manage setup and teardown, including scope — per-test versus per-session. They keep tests declarative and DRY, and things like tmp_path give you real temp resources cleanly. More maintainable than manual setup calls." },
        { q: "\"When is Selenium/UI testing the wrong tool?\"", a: "UI tests are slow and brittle, so they're wrong for logic you can test at a lower layer. Unit-test the business rules directly and reserve Selenium for a thin layer of critical end-to-end user flows. Over-relying on UI tests gives you a slow, flaky suite that erodes trust." },
        { q: "\"How does @parametrize improve edge-case coverage?\"", a: "It runs the same test over many input/expected pairs, so edge cases — zero, null, boundary, error — become visible data in one place instead of copy-pasted test functions. A reviewer can see exactly which cases are covered, and adding a case is one line." },
        { q: "\"How did that testing habit transfer to data engineering?\"", a: "Same discipline, different target. Factor transforms into pure functions, unit-test them in CI with small inputs, integration-test the wiring, and add runtime data-quality gates. The reflex 'if it has logic, it has a runnable check' is identical — I just apply it to pipelines now." }
      ]
    },
    {
      title: "\"Why did you move from software engineering into data engineering — and what's the AI/ML diploma for?\"",
      badge: "fundamentals",
      conceptLabel: "What's being tested:",
      concept: "A coherent career narrative and self-awareness — that the move was deliberate and that your SE foundation and ML education strengthen your DE work rather than looking like a scattered background.",
      noteLabel: "Model answer:",
      note: "\"At InfoDevelopers I kept gravitating to the data side — the pipelines, the ETL, the forecasting data work — more than the application code. That's where I saw the leverage: reliable data unlocks everything downstream.<br><br>So the move to data engineering was deliberate. And my software-engineering foundation is an asset in it — testing discipline, version control, CI/CD, writing maintainable code. That's exactly what separates ad-hoc data scripts from production pipelines.<br><br>The AI/ML diploma fits the same way. I don't want to be a data scientist, but understanding how models consume data makes me a better DE. I build feature pipelines and serve data knowing what the model needs — which is increasingly the DE's job as platforms fold ML in.\"",
      followups: [
        { q: "\"Doesn't a scattered stack (SE, ML, DE) look unfocused?\"", a: "Framed as a progression it's the opposite. SE gave me engineering rigor, the ML education gave me an understanding of the consumer of data, and DE is where they converge — building the reliable, tested data systems that ML and analytics depend on. The through-line is 'engineering discipline applied to data.'" },
        { q: "\"How does the ML background actually help you as a DE, day to day?\"", a: "I build feature pipelines understanding train/serve skew, I know what makes data model-ready, and I can speak to data scientists in their terms, so the hand-off is cleaner. As platforms like Databricks fold ML and AI in, the DE increasingly owns the feature and inference data paths, and the ML literacy makes that natural." },
        { q: "\"You did a full-time PG diploma (2022–2024) while at Cedar Gate (2022–2024). How?\"", a: "Be straightforward. The roles and study were structured to be manageable — remote work, the program schedule — and I was transparent about the arrangement. Answer the timeline honestly and briefly. The interviewer is checking for evasiveness, so a calm, direct explanation closes it." }
      ]
    }
  ]
},

landmines: {
  intro: {
    title: "Resume landmines — the skills you listed but used thinly",
    desc: "The most dangerous questions come off the SKILLS section, not the experience bullets — a tech you listed for keyword coverage but have no project behind. An interviewer who spots one and gets a hollow answer starts doubting the whole resume. Each card is a landmine on YOUR resume, why it's risky, and how to answer honestly without deflating. The rule everywhere: never claim depth you can't defend under one follow-up — reframe to what you genuinely did."
  },
  cards: [
    {
      title: "MongoDB / NoSQL — listed in skills, no project behind it",
      badge: "advanced",
      conceptLabel: "The risk:",
      concept: "MongoDB and NoSQL are in your skills list but no experience bullet uses them — every documented project is relational (Postgres/Snowflake) or streaming (Kafka). If an interviewer asks 'tell me about a MongoDB system you built,' a vague answer exposes the skills section as padded and taints everything else.",
      noteLabel: "Model answer (honest reframe):",
      note: "\"I'd be straight about the depth.<br><br>My production data stores have been relational and warehouse — Postgres and Snowflake — plus Kafka for streaming. I haven't run MongoDB as the primary store of a production system.<br><br>Where I've worked with document and semi-structured data is FHIR JSON and nested event and claim payloads, which I parsed and modeled. So I understand document modeling concepts — embedding versus referencing, access-pattern-driven design, when a document store beats relational.<br><br>If the role needs MongoDB depth, I'd ramp quickly given that conceptual base. But I won't overstate hands-on production experience I don't have.\"",
      followups: [
        { q: "\"So why is it on your resume?\"", a: "Honest framing: I've worked with it enough to be productive and understand the model, and I list it as a competency rather than a specialty. My deep production experience is relational and streaming. I'd rather be accurate about that than oversell. Owning the distinction reads as trustworthy, not weak." },
        { q: "\"When would you choose MongoDB over Postgres, then?\"", a: "When the access pattern is document-centric — reading a whole aggregate, like a patient summary or an order with its lines, in one shot — with a flexible, evolving schema and horizontal scale via sharding. Postgres wins when you need multi-table joins, strong cross-entity transactions, and set-based analytics. Answering the concept well recovers a lot even without deep hands-on." },
        { q: "\"Model a patient with their claims in a document store.\"", a: "Embed the bounded, read-together data — demographics, current meds — on the patient. Reference the unbounded or shared data — claims, providers — into their own collections keyed by patient and provider id. Embedding an ever-growing claims array hits the document-size limit and rewrites the whole doc on each append. Access pattern drives embed-versus-reference." }
      ]
    },
    {
      title: "TensorFlow / OpenCV / LSTM / ARIMA — ML tools from your earlier role",
      badge: "intermediate",
      conceptLabel: "The risk:",
      concept: "These sit in your skills and trace to the InfoDevelopers era (2019–2022). For a DE role they're peripheral, but if an interviewer probes ('walk me through a TensorFlow model you trained') and you can't go deep, it looks like padding. The fix is to scope them accurately to what you did and pivot to the DE-relevant part.",
      noteLabel: "Model answer (honest reframe):",
      note: "\"Those are from my earlier software-engineering role, where I worked on the forecasting and CV work — ARIMA and LSTM for the time-series forecasting, and I touched OpenCV and TensorFlow on that team.<br><br>I'm honest that I'm not a deep ML researcher. My contribution was the data and engineering side — pipelines, feature engineering, productionizing the scoring and monitoring.<br><br>I keep them on the resume because the exposure helps me work with ML teams as a DE. But I'd point a hardcore modeling question to where my real value is: building the reliable data and feature pipelines that models depend on.\"",
      followups: [
        { q: "\"Can you explain how an LSTM differs from a plain RNN?\"", a: "An LSTM adds gates — input, forget, output — and a cell state that let it retain or discard information over long sequences, which mitigates the vanishing-gradient problem plain RNNs suffer on long dependencies. Know this much conceptually; don't wade into training internals you can't defend. Scope honestly." },
        { q: "\"Are you claiming to be an ML engineer?\"", a: "No. Be explicit: I'm a data engineer with ML literacy, not an ML engineer. I build the data and feature pipelines and can collaborate with data scientists fluently, but I don't claim to author and tune production models. Clear scoping prevents the padding perception." },
        { q: "\"Why keep ML tools on a DE resume at all?\"", a: "Because modern DE increasingly owns the feature and inference data paths, and understanding how models consume data makes the hand-off cleaner. Framed as 'literacy that supports DE work,' it's an asset. Framed as claimed expertise, it's a trap — so I frame it as the former." }
      ]
    },
    {
      title: "Kubernetes, LangChain, FastAPI — in skills, no supporting bullet",
      badge: "intermediate",
      conceptLabel: "The risk:",
      concept: "These appear in your skills list with no experience bullet demonstrating them. Kubernetes especially invites 'tell me how you deployed on K8s.' A hollow answer on a specific tool is worse than not listing it. Scope to real exposure and don't bluff operational depth.",
      noteLabel: "Model answer (honest reframe):",
      note: "\"I'd calibrate each to real depth.<br><br>Docker I use genuinely — containerizing pipeline components and local dev.<br><br>Kubernetes I understand conceptually — pods, deployments, services, how it orchestrates containers — and I've worked in environments that ran on it. But I haven't been the person operating a cluster day to day, and I'll say that rather than pretend.<br><br>LangChain and FastAPI I've used for building lightweight services and LLM-app glue at a working level, not as a specialty.<br><br>The honest version is more credible: I list them as working competencies, and I'm precise about which I'd operate solo versus ramp into.\"",
      followups: [
        { q: "\"Have you run production workloads on Kubernetes yourself?\"", a: "Answer precisely: I've worked in K8s-based environments and understand the model, but I haven't been the cluster operator — I'd ramp into that. Docker I use directly. The specificity is what makes it credible; a vague 'yes' collapses on the next question." },
        { q: "\"What problem does Kubernetes actually solve for a data platform?\"", a: "Orchestrating containerized workloads — scheduling, scaling, self-healing, and resource isolation across a cluster — so jobs and services run reliably without manual placement. For data, it underpins platforms like Airflow on K8s or Spark on K8s by managing the compute containers. Knowing the 'why' recovers credibility even without operator experience." },
        { q: "\"Why list a tool you can't operate solo?\"", a: "Only list it if you can speak to it at a working level and are honest about depth. The safe framing is 'a competency I'm productive with and can grow in,' with the boundary stated. If you truly can't say anything useful under one follow-up, it shouldn't be on the resume. Better to remove it than to get caught." }
      ]
    },
    {
      title: "Azure (Data Factory, Azure ML) & GCP (BigQuery) — cloud breadth claims",
      badge: "intermediate",
      conceptLabel: "The risk:",
      concept: "Your production experience is AWS (S3, Glue, Lambda, Redshift) and Snowflake; Azure and GCP appear as breadth. 'How would you build this on Azure/GCP?' tests whether you know the concepts or just the AWS brand names. Handled well it shows range; handled badly it looks like keyword stuffing.",
      noteLabel: "Model answer (honest reframe):",
      note: "\"My hands-on cloud depth is AWS and Snowflake — that's where I've run production.<br><br>I list Azure and GCP because the concepts map directly and I've worked with them at a smaller scale, so I can reason across clouds even where I'm not the deepest operator.<br><br>The honest and useful move is to show the mapping. Object storage is S3, ADLS, or GCS. The warehouse is Redshift, Synapse, or BigQuery. Serverless functions are Lambda, Azure Functions, or Cloud Functions. Orchestration is Glue-plus-Step-Functions, Data Factory, or Composer.<br><br>I design against concepts — decoupled storage and compute, partitioned columnar files, orchestrated ELT — so porting is mostly swapping service names. And I'm clear about where I'd need ramp-up on the cloud-specific quirks.\"",
      followups: [
        { q: "\"Rebuild your AWS pipeline on GCP — name the services.\"", a: "S3 to GCS, Glue or EMR Spark to Dataproc, Glue Catalog to a Dataproc/Hive metastore, Redshift to BigQuery, Lambda to Cloud Functions, Step Functions or Glue orchestration to Cloud Composer, which is managed Airflow, and Kinesis to Pub/Sub. Being able to map fluently is what proves it's concepts, not brand memorization." },
        { q: "\"Biggest behavioral difference moving Redshift → BigQuery?\"", a: "BigQuery is fully serverless and bills per byte scanned — no DISTKEY or SORTKEY tuning. Instead you partition, usually by date, cluster on filter columns, and never SELECT *. The optimization mindset shifts from distribution tuning to scan reduction." },
        { q: "\"Be honest — how deep is your Azure/GCP experience really?\"", a: "State it plainly: AWS and Snowflake are my production depth; Azure and GCP I've used at smaller scale and understand conceptually. I can be productive quickly because the patterns transfer, but I won't claim I've operated them at the scale I have AWS. Calibrated honesty beats a bluff that unravels." }
      ]
    },
    {
      title: "\"6+ years of experience\" and the timeline",
      badge: "fundamentals",
      conceptLabel: "The risk:",
      concept: "Your experience spans July 2019 to present (~6 years), but it includes a software-engineering role (2019–2022), and your PG diploma (2022–2024) overlapped with the Cedar Gate role (2022–2024). An interviewer may test whether '6+ years DE' is accurate and may ask about the study/work overlap. Be ready to frame the arc honestly.",
      noteLabel: "Model answer (honest reframe):",
      note: "\"I frame it as 6+ years in software and data engineering, with the last few focused specifically on data engineering.<br><br>I started in software engineering at InfoDevelopers in 2019, where I was already doing pipeline and ETL work, then moved fully into data engineering at Cedar Gate and now Amex.<br><br>If asked directly, I don't claim six years of pure senior DE. I claim six years of engineering with a deliberate progression into DE, and the SE foundation is part of what makes me effective.<br><br>On the diploma overlapping Cedar Gate, I'm straightforward: the remote role and program schedule made it workable, and I was transparent about it.\"",
      followups: [
        { q: "\"Is it really 6 years of data engineering, or software plus data?\"", a: "Be honest: six years of engineering, with the first at InfoDevelopers being software engineering that included pipeline and ETL work, then a deliberate move into full data engineering. Claiming six years of pure senior DE when the record shows otherwise is the kind of thing that unravels on a reference check. Accuracy is safer and still strong." },
        { q: "\"You did a full-time diploma while working full-time. Explain.\"", a: "Answer calmly and briefly. The remote role and the program's schedule made the combination manageable, and you were transparent with your employer. The interviewer is really checking for evasiveness — a direct, unflustered answer closes it, and a defensive one creates suspicion." },
        { q: "\"How does the software-engineering start make you a better DE?\"", a: "Engineering rigor — testing, version control, CI/CD, maintainable code — is exactly what separates production pipelines from throwaway scripts. Framing the SE years as the foundation of your DE discipline turns a potential 'that's not DE' into a strength." }
      ]
    },
    {
      title: "Delta Lake / Databricks — on the resume's edge, and this interview",
      badge: "advanced",
      conceptLabel: "The risk:",
      concept: "Your skills list Delta Lake, and Spark/PySpark are core, but Databricks itself isn't explicitly on the resume — yet you're interviewing at a Databricks shop. The landmine is claiming more Databricks tenure than you have, or conversely underselling genuinely transferable Spark/Delta/lakehouse knowledge.",
      noteLabel: "Model answer (honest reframe):",
      note: "\"I'd be precise. My production experience is Spark and PySpark, Delta Lake, and Snowflake, on AWS.<br><br>Databricks is the natural platform for exactly that stack. So my Spark execution, Delta — ACID, MERGE, time travel, OPTIMIZE — medallion architecture, and structured-streaming knowledge transfer directly.<br><br>The platform-specific pieces like Unity Catalog governance, Workflows and DLT, and Photon, I understand conceptually and would ramp into quickly.<br><br>I won't claim years of hands-on Databricks if I don't have them. I'll claim strong Spark, Delta, and lakehouse fundamentals that make me productive on Databricks fast.<br><br>Framing it as transferable depth plus a fast ramp is both honest and credible.\"",
      followups: [
        { q: "\"How long have you used Databricks specifically?\"", a: "Answer with the honest frame: my hands-on depth is Spark, PySpark, and Delta Lake, which is the Databricks core. I'd calibrate my Databricks-platform tenure honestly rather than inflate it, and I ramp fast because the fundamentals transfer. Don't invent years — it's checkable, and the fundamentals are genuinely strong." },
        { q: "\"What transfers directly from your Spark/Delta work to Databricks?\"", a: "The Spark execution model — lazy eval, shuffles, skew, broadcast. Delta internals — the transaction log, MERGE for CDC and SCD, time travel, OPTIMIZE and ZORDER. Medallion architecture, and Structured Streaming with checkpoints. All of that is Databricks day-to-day. The platform adds Unity Catalog, Workflows and DLT, and Photon on top." },
        { q: "\"What would you need to ramp on for a Databricks-first role?\"", a: "The platform layer: the Unity Catalog governance model, Workflows and Delta Live Tables for orchestration, Asset Bundles for deployment, and Photon and serverless specifics. I'd frame it as a short ramp on platform features sitting on fundamentals I already have — concrete about the gap, confident about the base." }
      ]
    }
  ]
},

senior: {
  intro: {
    title: "Senior & scope — proving you're 6 years senior, not 1 year × 6",
    desc: "The questions that separate a senior DE from a mid-level one aren't about a single bullet — they're about scope, leverage, judgment, and whether you can hold a whole system in your head and critique it honestly. At 6 years an interviewer expects you to set technical direction, multiply the team, and know when NOT to build. These two cards defend exactly that: what makes you senior, and the capstone 'largest system you architected' question."
  },
  cards: [
    {
      title: "\"What makes you a senior DE and not a mid-level one?\"",
      badge: "fundamentals",
      conceptLabel: "What's being tested:",
      concept: "Whether '6 years' means six years of growth or one year repeated six times. The interviewer is distinguishing someone who delivers assigned pipelines well (mid) from someone who owns problems before there's a ticket, multiplies the team, and shows judgment about complexity (senior). They probe for design ownership, mentoring, cross-team influence, and — the subtle one — restraint about when not to build.",
      noteLabel: "Model answer:",
      note: "\"For me the line is scope and leverage.<br><br>A mid-level DE delivers the pipeline they're handed, well. A senior owns the problem before it's a ticket. I scope an ambiguous ask into a design, name the trade-offs and failure modes up front, and I'm accountable for the outcome, not just the merge.<br><br>Leverage is the other half. I multiply the team by reviewing designs and PRs for the why, writing the runbooks and data contracts that stop repeat incidents, and mentoring so a junior doesn't relearn the idempotency lesson the hard way.<br><br>And a real senior tell is restraint — knowing the answer is sometimes 'don't build this, a scheduled query covers it' instead of a new service.<br><br>So I'd point to systems I drove end to end, the people I leveled up, and the times I argued us out of unnecessary complexity.\"",
      followups: [
        { q: "\"Give a concrete example of influence without authority.\"", a: "A source team kept breaking us with silent schema changes, and I had no authority over them. I made the cost visible — documented the downstream impact and the incident hours — proposed a minimal contract, just advance notice on schema changes, and shipped a schema guard on my side meanwhile. Showing the cost plus offering the cheap fix earned buy-in that demanding it wouldn't have." },
        { q: "\"How do you mentor without just doing the work for them?\"", a: "I pair on the design and the first hard case, then hand off with a clear check — 'make it safe to re-run, add the row-count gate' — rather than writing it myself. Code review is where I teach: I comment on the reasoning, not just the fix. The goal is they hit the next problem without me, so I optimize for their next task, not this one's speed." },
        { q: "\"Tell me about a time the senior move was NOT to build something.\"", a: "Someone wanted a streaming pipeline for a dashboard that refreshed daily. The freshness SLA didn't justify the operational cost, so I pushed back, and a scheduled batch load covered it at a fraction of the complexity. Matching the tool to the SLA, rather than building the impressive thing, is the judgment that separates senior from eager." }
      ]
    },
    {
      title: "\"What's the largest system you've architected end to end — and what would you change?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "The capstone senior question. They want to see you hold a whole system in your head — not one bullet — reason about the constraint that drove the design, and critique it honestly. The 'what would you change' half is the real test: a senior has scar tissue and opinions; a mid-level says 'nothing, it worked.' Naming a real weakness and the lesson from it is the strongest signal in the interview.",
      noteLabel: "Model answer:",
      note: "\"I'd take the Cedar Gate claims platform, because I owned it end to end.<br><br>The constraint that drove everything was correctness under messy input — a dropped or double-counted claim is lost revenue and a compliance problem. So the architecture was raw-immutable-first, idempotent merge-on-key loads, malformed records quarantined not dropped, and reconciliation of billed 837 against paid 835 as a first-class gated stage, all orchestrated in Airflow with dbt transforms and validation checks.<br><br>What I'd change: I'd push data contracts with the source systems far earlier. Most of our incidents were silent upstream schema changes we caught downstream instead of at the edge. And I'd have invested in lineage and observability tooling sooner, rather than hand-maintaining data maps for audits.<br><br>The design was right on correctness. The gap was shifting failure detection left, to the source boundary.\"",
      followups: [
        { q: "\"What single constraint drove the architecture, and where did it show up?\"", a: "Correctness on lossy healthcare data. It shows up in every decision: immutable raw landing so you reprocess and never re-pull, idempotent keyed upserts so replay is safe, quarantine-not-drop for malformed claims, and reconciliation as a gated stage. Each one traces back to the same rule — never silently lose or double a claim." },
        { q: "\"You'd add data contracts earlier — so why didn't you at the time?\"", a: "Honestly, we treated sources as fixed and fought fires as they came. It took a few silent-schema incidents to justify the cross-team effort. The lesson is that contracts are cheaper than the incidents they prevent, so now I push for them at design time — even a minimal 'notify before schema change' — instead of after the third page." },
        { q: "\"Rebuild it today on a modern lakehouse — what stays and what changes?\"", a: "What stays: medallion layering, idempotency, reconciliation, quarantine. Those are architecture, not tooling. What changes: Delta Lake for ACID, MERGE, and time-travel instead of hand-rolled idempotency, Unity Catalog for the governance and lineage I was documenting by hand, and DLT expectations for the validation gates. Same design, far less glue — which is exactly why the fundamentals matter more than the platform." }
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "An interviewer drills into a resume bullet and hits a follow-up you genuinely don't know. Best move?",
    options: [
      "Confidently invent a specific answer so you don't look weak",
      "State the boundary honestly, then reason from fundamentals to a best guess and say how you'd verify it",
      "Change the subject to something you know",
      "Say 'we had a team for that' and stop"
    ],
    correct: 1
  },
  {
    q: "What is the relationship between an EDI 837 and an 835 in claims processing?",
    options: [
      "They're two names for the same file",
      "837 is the claim submitted (billed); 835 is the remittance (paid) — linking them reconciles billed vs paid and surfaces denials/underpayments",
      "835 is submitted first, then 837 pays it",
      "Both are HL7v2 message types"
    ],
    correct: 1
  },
  {
    q: "You claim a batch→Airflow+dbt migration improved throughput 35%. Which answer signals real engineering?",
    options: [
      "\"We rewrote everything in modern tools so it got faster\"",
      "\"Incremental dbt models and parallelizing previously-sequential steps collapsed the largest stage; I measured end-to-end wall-clock over comparable volumes\"",
      "\"The new servers were bigger\"",
      "\"dbt is just faster than Python\""
    ],
    correct: 1
  },
  {
    q: "MongoDB is in your skills but no project uses it. An interviewer asks about it. Safest approach?",
    options: [
      "Describe a detailed MongoDB production system you didn't actually build",
      "Be honest that your production stores are relational/warehouse + Kafka, show you understand document modeling concepts (embed vs reference), and don't overstate hands-on depth",
      "Claim you can't discuss it for confidentiality reasons",
      "Insist MongoDB and Postgres are basically the same"
    ],
    correct: 1
  },
  {
    q: "In CDC replication, an old update arrives after a newer one. How do you prevent it overwriting current state?",
    options: [
      "Process events faster",
      "Sequence by the source commit/LSN or version and apply a change only if it's newer than what's stored (conditional upsert)",
      "Drop all late events",
      "Use a bigger Kafka cluster"
    ],
    correct: 1
  },
  {
    q: "On the '6+ years' claim, an interviewer notes your first role was software engineering. Best framing?",
    options: [
      "Insist it was all senior data engineering",
      "\"Six years of engineering with a deliberate progression into DE; the SE foundation — testing, CI/CD, maintainable code — is what makes my pipelines production-grade\"",
      "Refuse to discuss the timeline",
      "Say the resume has a typo"
    ],
    correct: 1
  },
  {
    q: "You're at a Databricks-shop interview but Databricks isn't explicitly on your resume. Best positioning?",
    options: [
      "Claim several years of hands-on Databricks anyway",
      "Be precise: strong Spark/PySpark/Delta/lakehouse fundamentals that transfer directly, honest about platform-specific ramp (Unity Catalog, DLT, Photon)",
      "Avoid mentioning Spark or Delta",
      "Say Databricks is irrelevant to the role"
    ],
    correct: 1
  }
];
