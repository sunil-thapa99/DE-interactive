// Content data for the Interview Panel prep module — Azure + Databricks + regulated-domain
// (built around a Manulife-style insurance client panel, reusable for any Azure/Databricks role).
const MODULE_ID = "panel";
const CONTENT = {

overview: {
  intro: {
    title: "Azure + Databricks client-panel prep — regulated / insurance domain",
    desc: "A client panel isn't a pure coding screen: it weighs communication, domain judgment, and how you work with stakeholders as heavily as tech. For a Canadian insurer (Manulife-style) the recurring themes are governance, PII/PHI, and regulation (OSFI, PIPEDA) sitting on top of the Azure + Databricks stack. Work each tab, answer aloud first, then check the model answer and the follow-ups a panel actually digs with."
  },
  cards: [
    {
      title: "How a panel scores you — and where candidates lose points",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "A panel is usually 3–5 people across roles (a lead engineer, a manager, sometimes an architect or a business/actuarial stakeholder). They're not just checking if you can code — each seat weighs a different axis: technical depth, how you communicate under questioning, whether you'll be safe with sensitive data, and whether you're someone they want in stakeholder meetings. The losing pattern is a candidate who's technically fine but gets defensive on follow-ups, hand-waves the governance questions, or can't explain a design to the non-engineer on the panel.",
      navLabel: "What actually moves the needle:",
      nav: "Depth on ONE end-to-end architecture you can whiteboard beats shallow coverage of ten services. A crisp PII/governance story reassures the risk-minded panelist. Two rehearsed STAR stories cover most behavioral prompts. And treating every follow-up as curiosity rather than a trap — 'good question, here's how I'd think about it' — reads as senior.",
      noteLabel: "How to run the room:",
      note: "Answer the question asked, then stop — don't monologue.<br><br>Structure aloud: \"There are three parts to this…\" so the panel can follow.<br><br>When you don't know, say what you'd do to find out — never bluff, especially on the regulatory questions.<br><br>Have 3 questions ready for the end; asking about their medallion maturity, Unity Catalog adoption, and how the team handles OSFI signals you already think like their engineer.",
      followups: [
        "\"Explain your last pipeline to someone non-technical.\" — can you drop the jargon?",
        "\"What would you do differently?\" — do you reflect, or get defensive?",
        "\"What questions do you have for us?\" — did you prepare, or wing it?"
      ]
    },
    {
      title: "Prep priorities, ranked — where to spend your hours",
      badge: "fundamentals",
      conceptLabel: "The priority order:",
      concept: "1) The PII/PHI + governance story — this is a Canadian insurer's #1 concern; nail masking, RLS, Unity Catalog, retention, OSFI/PIPEDA. 2) Delta Lake + medallion fluency — MERGE, time travel, SCD2, the trust-boundary framing. 3) One crisp end-to-end architecture you can draw from source to Power BI. 4) Two solid STAR stories from real work (your Amex transaction-ETL work is ideal). 5) Cost/performance tuning specifics — skew, broadcast joins, job clusters, OPTIMIZE.",
      noteLabel: "The night before:",
      note: "Rehearse the end-to-end architecture out loud until it's smooth — ADLS raw → ADF orchestrates → Databricks transforms medallion Delta → serve → Power BI, with governance woven through.<br><br>Have your two STAR stories timed to ~90 seconds each.<br><br>Re-read the OSFI-vs-PIPEDA distinction and the column-masking approach — these are the questions candidates fumble.<br><br>Prepare your 3 closing questions.",
      followups: [
        "Can you draw the whole pipeline in 60 seconds without notes?",
        "Do both STAR stories have a measurable result?",
        "Can you state the difference between OSFI and PIPEDA in one sentence each?"
      ]
    }
  ]
},

azuredbx: {
  intro: {
    title: "Azure + Databricks core — where the panel spends the most time",
    desc: "The technical spine of the interview. They probe whether you know which service owns which job, keep transform logic out of the orchestrator, secure storage access without leaking keys, and understand Delta/medallion as a data-quality contract rather than folders. Each answer here is designed to be said aloud in under a minute."
  },
  cards: [
    {
      title: "\"Walk me through an end-to-end pipeline on Azure Databricks.\"",
      badge: "fundamentals",
      conceptLabel: "What they test:",
      concept: "Can you name the right service per stage and keep transform logic out of the orchestrator — the single most revealing question.",
      noteLabel: "Model answer:",
      note: "\"Sources land raw in ADLS Gen2 — ADF Copy activity for batch and relational, Event Hubs for streaming — always an immutable raw copy partitioned by ingest date.<br><br>ADF orchestrates and, on each step, triggers a Databricks notebook that transforms across medallion layers as Delta tables: bronze to silver to gold.<br><br>Curated gold marts serve from Databricks SQL or a Synapse pool, and Power BI reads from there.<br><br>Governance runs through Unity Catalog, secrets through Key Vault, auth through managed identities so no keys live in code. ADF conducts and moves; Databricks computes; ADLS stores.\"",
      followups: [
        "\"Why is transform logic in Databricks, not ADF Data Flows?\"",
        "\"Which parts are batch vs streaming, and how do they meet?\"",
        "\"Where's your reprocessing story if gold is wrong?\""
      ]
    },
    {
      title: "\"What does the medallion architecture buy you here?\"",
      badge: "fundamentals",
      conceptLabel: "What they test:",
      concept: "Whether you understand layering as a data-quality contract and audit trail, not just folders — which matters for regulated claims data.",
      noteLabel: "Model answer:",
      note: "\"Bronze is raw, immutable, append-only — exactly as it arrived, so I can always reprocess and I have an audit trail, which matters for regulated claims data.<br><br>Silver is cleaned, conformed, deduplicated, typed — policies and claims joined to reference data, PII handled.<br><br>Gold is business-level aggregates and dimensional marts the actuaries and BI consume.<br><br>The value is that each layer is a trust boundary: a bug in a gold KPI is fixed by replaying silver, and I never lose the source of truth because bronze is untouched.\"",
      followups: [
        "\"How do you handle a late-arriving claim correction that lands after gold is published?\"",
        "\"Is bronze ever deleted?\" (retention / regulatory)",
        "\"Where does data-quality validation sit?\""
      ]
    },
    {
      title: "\"How does a Databricks job securely read from ADLS?\"",
      badge: "fundamentals",
      conceptLabel: "What they test:",
      concept: "Whether you leak a storage key — a hard no in an insurance shop — and whether you know the current Unity Catalog pattern vs the deprecated mount.",
      noteLabel: "Model answer:",
      note: "\"The wrong answer is a storage account key in a notebook.<br><br>My default is Unity Catalog: a storage credential backed by a managed identity plus an external location, so access is governed centrally with no secrets in code.<br><br>If I must use a service principal directly, its secret goes in a Databricks secret scope backed by Azure Key Vault, read via dbutils.secrets.get — never inline.<br><br>I avoid the old dbutils.fs.mount approach in favor of direct abfss paths through Unity Catalog.\"",
      followups: [
        "\"Someone hardcoded the key — what do you replace it with?\"",
        "\"Why are mounts discouraged now?\"",
        "\"How would you rotate that service principal secret?\""
      ]
    },
    {
      title: "\"What is Unity Catalog and why does it matter here?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Governance maturity — critical for an insurer that answers to auditors and regulators.",
      noteLabel: "Model answer:",
      note: "\"It's the centralized governance layer across all Databricks workspaces: a three-level namespace — catalog, schema, table — with one place to grant and revoke, plus row and column-level security, data lineage, and audit logs.<br><br>For insurance that's exactly what I need. I can grant the analytics group read on the claims catalog but mask policyholder PII at the column level, and the fraud team sees more under a separate grant.<br><br>And I can show lineage from a raw feed all the way to the gold table feeding an actuarial dashboard, which regulators and auditors ask for.\"",
      followups: [
        "\"How would you mask a policyholder's SIN for analysts but expose it to the fraud team?\"",
        "\"What did teams use before Unity Catalog, and why was it painful?\"",
        "\"How does lineage help in an audit?\""
      ]
    },
    {
      title: "\"A nightly job is slow and costs are climbing. How do you approach it?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Performance and cost discipline — the client is paying for the compute, so waste is visible.",
      noteLabel: "Model answer:",
      note: "\"First I separate cost from speed.<br><br>On cost: are we running production on an always-on all-purpose cluster? Move scheduled work to job clusters that spin up and tear down, set auto-termination, autoscale to the job, use spot VMs where it tolerates it. The bill is Azure VM plus DBUs.<br><br>On speed: I check the Spark UI for the usual killers — skew, a shuffle-heavy join that should be a broadcast, a tiny-file explosion, spill. Fixes are broadcast the small dimension, salt the skewed key, OPTIMIZE and Auto Optimize on Delta to bin-pack files, cache only if reused, and Photon if it's SQL or DataFrame-heavy and earns its DBU premium.\"",
      followups: [
        "\"How do you detect data skew?\"",
        "\"When is caching a mistake?\"",
        "\"Job cluster vs all-purpose — when each?\""
      ]
    },
    {
      title: "\"Explain Delta Lake — what does it add over plain Parquet?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Whether you know the transaction log and can connect its features (MERGE, time travel) to real regulated-data needs.",
      noteLabel: "Model answer:",
      note: "\"Delta adds a transaction log over Parquet, which gives ACID transactions, so concurrent writes don't corrupt the table.<br><br>It gives upserts and deletes via MERGE — essential for CDC and for a PIPEDA right-to-be-forgotten delete on policyholder data.<br><br>Time travel lets me query or roll back to a prior version, which is gold for audit and for recovering from a bad run.<br><br>Schema enforcement and evolution stop a malformed feed from silently corrupting the table. And OPTIMIZE with Z-ordering plus file management keep read performance healthy.\"",
      followups: [
        "\"How would you action a 'delete this customer's data' request?\" (DELETE + VACUUM, retention vs regulatory delete)",
        "\"What does Z-ordering do?\"",
        "\"How does MERGE implement SCD Type 2?\""
      ]
    },
    {
      title: "\"How do you implement CDC / incremental loads?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Whether you avoid full reloads, handle history correctly, and reason about idempotency on retries.",
      noteLabel: "Model answer:",
      note: "\"At the ingest edge, ADF incremental copy on a high-watermark column — max modified timestamp or ID persisted in a control table — so each run pulls only changed rows, never a full reload.<br><br>Into the lake, Databricks Auto Loader for incremental file ingestion, since it tracks what's been processed.<br><br>Into silver and gold, a Delta MERGE keyed on the business key implements upserts and SCD Type 2 history — which matters for policies, where I need to know what a policy looked like at claim time, not just today.\"",
      followups: [
        "\"Why SCD2 for policy data specifically?\"",
        "\"How do you handle a hard-deleted source row?\"",
        "\"Exactly-once — how do you avoid double-counting on a retry?\" (idempotency + merge keys)"
      ]
    }
  ]
},

insurance: {
  intro: {
    title: "Insurance domain — what differentiates you on this panel",
    desc: "Domain fluency is where you separate from a generic DE candidate. For a Canadian insurer the recurring trio is: protect sensitive policyholder and health data, model policy/claims history correctly, and guarantee the numbers actuaries rely on. Get the PII/governance answer crisp — it's the theme they care about most."
  },
  cards: [
    {
      title: "\"Insurance data is sensitive — how do you handle PII/PHI?\"",
      badge: "fundamentals",
      conceptLabel: "What they test:",
      concept: "The single most important theme for a Canadian insurer — whether you'll be safe with policyholder and health data.",
      noteLabel: "Model answer:",
      note: "\"Least privilege throughout.<br><br>Data classified at ingest — policyholder identifiers, health data, financial data. Column-level masking and row-level security in Unity Catalog so analysts see only what they need, while the fraud or claims team sees more under a separate grant.<br><br>Tokenization or hashing of direct identifiers like SIN where the downstream use doesn't need the raw value. Encryption at rest and in transit, and Private Endpoints so storage isn't on the public internet.<br><br>Full audit logging of who accessed what. And retention and deletion rules aligned to PIPEDA and OSFI — I keep data as long as required and no longer, and I can action deletion requests.\"",
      followups: [
        "\"OSFI vs PIPEDA — what's the difference in what they require of you?\"",
        "\"How do you prove to an auditor who accessed a claims table?\"",
        "\"Tokenization vs masking vs encryption — when each?\""
      ]
    },
    {
      title: "\"How would you model policy and claims data?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Dimensional modeling plus the insurance-specific need to preserve history — a claim is assessed against the policy's state at the loss date.",
      noteLabel: "Model answer:",
      note: "\"Dimensional model in gold.<br><br>Fact tables for the events — fact_claim, fact_premium_payment — at a defined grain, with measures like claim amount and reserves. Conformed dimensions — dim_policyholder, dim_policy, dim_product, dim_date, dim_agent — shared across facts.<br><br>I'd use SCD Type 2 on dim_policy and dim_policyholder so I preserve history: when a claim is assessed, I need the policy's state at the loss date, not its current state.<br><br>Slowly changing coverage terms, beneficiary changes, address changes all need effective-dating. That historical accuracy is non-negotiable in insurance.\"",
      followups: [
        "\"Grain of the claims fact — one row per claim or per claim transaction?\"",
        "\"How do you handle a claim that spans multiple policy versions?\"",
        "\"Reserves change over time — how do you model that?\""
      ]
    },
    {
      title: "\"How do you guarantee an actuarial report isn't built on bad data?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Whether data quality is a gate in your pipeline or an afterthought — and whether you reconcile financial figures.",
      noteLabel: "Model answer:",
      note: "\"Validation as a gate, not an afterthought.<br><br>At silver I run checks — schema conformance, null and uniqueness on keys, referential integrity so every claim ties to a real policy, range checks so a claim amount can't be negative and a date can't be in the future, and reconciliation totals against the source.<br><br>I'd use a framework like Great Expectations or Delta Live Tables expectations so failures either quarantine bad rows or halt the pipeline depending on severity. Anything that fails is logged and alerted, and unvalidated data never reaches gold.<br><br>For financial figures I add reconciliation — row counts and control totals must match source to target.\"",
      followups: [
        "\"Quarantine vs halt — how do you decide?\"",
        "\"A reconciliation total is off by $200 — what's your process?\"",
        "\"How do you test the pipeline itself, not just the data?\""
      ]
    }
  ]
},

governance: {
  intro: {
    title: "Architecture & governance judgment — the senior-signal questions",
    desc: "Beyond building, the panel checks your judgment: choosing between Databricks and Synapse, promoting code safely, and designing a real-time path without hand-waving exactly-once. These are where an architect on the panel decides if you're senior."
  },
  cards: [
    {
      title: "\"Databricks vs Synapse — when would you use each?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Whether you have a defensible default and know the serving-vs-transform split, plus awareness of where Fabric is heading.",
      noteLabel: "Model answer:",
      note: "\"I transform in Databricks — it's the more mature Spark engine, better for ML and streaming, and Delta plus Unity Catalog give me governance and ACID.<br><br>I'd use a Synapse dedicated pool, or increasingly Databricks SQL, as the serving layer for BI when analysts need fast, concurrent queries on curated marts. Synapse serverless is the query-in-place option for ad-hoc lake exploration.<br><br>I'd also flag Microsoft Fabric as the strategic direction that unifies these, but plenty of production still runs classic Databricks plus ADF plus Synapse, so I know both.\"",
      followups: [
        "\"Why Databricks over Synapse Spark for transform?\"",
        "\"Where does Fabric fit?\"",
        "\"300 concurrent BI users — where do they query?\""
      ]
    },
    {
      title: "\"How do you promote code from dev to prod, and test it?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "CI/CD discipline and whether transformation logic is actually tested — not edited live in prod.",
      noteLabel: "Model answer:",
      note: "\"Notebooks and job definitions in Git — feature branch, PR, review. Databricks Repos or asset bundles deploy per environment, and ADF is wired to Git and promoted with ARM templates.<br><br>Unit tests on the transformation logic — pure functions on sample DataFrames with pytest — plus data-quality tests on the output.<br><br>CI runs tests on PR; deployment is automated per environment with config injected, not hardcoded. Secrets always from Key Vault.<br><br>I'd never let someone edit a prod notebook directly.\"",
      followups: [
        "\"How do you unit-test a PySpark transform?\"",
        "\"How do config values differ dev vs prod without code changes?\"",
        "\"How do you handle a bad deploy — rollback story?\""
      ]
    },
    {
      title: "\"Near-real-time fraud scoring on a transaction feed — how?\"",
      badge: "advanced",
      conceptLabel: "What they test:",
      concept: "Streaming design with a real exactly-once and late-data story, plus a batch safety net for reconciliation.",
      noteLabel: "Model answer:",
      note: "\"Events into Event Hubs — it speaks the Kafka protocol.<br><br>Databricks Structured Streaming reads from it, applies the transformation and the model scoring, and writes to a Delta table with checkpointing for exactly-once. For the fraud model I'd score inline or call a model-serving endpoint, and alerts go to the fraud team's system.<br><br>I'd design for idempotency so replays don't double-score, and I'd keep a batch path over the same bronze data for backfill and reconciliation — the safety net. Watermarking handles late-arriving events.\"",
      followups: [
        "\"Exactly-once — how does checkpointing give you that?\"",
        "\"How do you handle late events?\"",
        "\"What's your latency target and how do you hit it?\""
      ]
    }
  ]
},

behavioral: {
  intro: {
    title: "Client-panel & behavioral — weighted more than you'd expect",
    desc: "A panel is deciding whether they want you in the room with their stakeholders. Use STAR, keep stories to ~90 seconds with a measurable result, and show you treat data consumers as customers. Prepare two real stories from your own work — the Amex transaction-ETL work fits most prompts."
  },
  cards: [
    {
      title: "\"Tell us about a pipeline you owned end-to-end — what went wrong?\"",
      badge: "fundamentals",
      conceptLabel: "What they test:",
      concept: "Ownership, honesty about failure, and how you communicated it — via STAR with a measurable result.",
      noteLabel: "How to answer:",
      note: "Use STAR on a real example — your Amex large-scale transaction ETL in Databricks is ideal.<br><br>Situation: the scale and the stakes. Task: what you owned. Action: the specific failure (skew, an SLA miss, a data-quality escape) and what YOU did about it. Result: the measurable outcome.<br><br>Then pre-empt the probe: name what you'd do differently and how you communicated the issue to stakeholders while it was happening.<br><br>Keep it to about 90 seconds — don't narrate every detail.",
      followups: [
        "\"What would you do differently?\"",
        "\"How did you communicate the issue to stakeholders?\"",
        "\"How did you make sure it didn't recur?\""
      ]
    },
    {
      title: "\"A stakeholder disagrees with a number in your report. What do you do?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Whether you get defensive or investigate — and whether you distinguish a definition mismatch from a real bug.",
      noteLabel: "Model answer:",
      note: "\"I don't get defensive — I investigate.<br><br>I trace the number back through lineage: gold to silver to source, and reconcile. Often the 'wrong' number is a definition mismatch — they're computing 'active policies' differently than the spec. So I confirm the business definition first, then show the lineage and the source data.<br><br>If it's a genuine bug, I own it, fix root cause, and communicate the impact and remediation clearly.<br><br>The goal is a shared source of truth, not being right.\"",
      followups: [
        "\"How do you prevent definition mismatches?\" (data contracts, a metrics/semantic layer)",
        "\"How do you communicate a data incident to non-technical stakeholders?\"",
        "\"When would you escalate vs handle it yourself?\""
      ]
    },
    {
      title: "\"How do you work with actuaries, analysts, and data scientists?\"",
      badge: "intermediate",
      conceptLabel: "What they test:",
      concept: "Collaboration signal — do you treat downstream consumers as customers of your data product?",
      noteLabel: "Model answer:",
      note: "\"I treat consumers as customers.<br><br>I gather requirements up front, then define data contracts and SLAs so both sides know the shape, freshness, and guarantees of the data.<br><br>I document the marts, expose lineage so they can trust and trace the numbers, and I prepare model-ready datasets for the data scientists — feature-ready, validated, and stable.<br><br>When something changes upstream, they hear it from me before it breaks their work, not after.\"",
      followups: [
        "\"What goes in a data contract?\"",
        "\"How do you handle a breaking schema change consumers depend on?\"",
        "\"How do you prioritize between competing stakeholder requests?\""
      ]
    },
    {
      title: "Common panel closers — have these ready",
      badge: "fundamentals",
      conceptLabel: "What they test:",
      concept: "Motivation, self-awareness, and whether you came prepared — the questions that bookend the interview.",
      noteLabel: "Be ready for:",
      note: "\"Why Manulife / why insurance?\" — tie it to wanting your work to matter on regulated, high-stakes data.<br><br>\"How do you keep up with the Azure/Databricks ecosystem?\" — name concrete sources and a recent thing you learned.<br><br>\"Describe a time you disagreed with a technical decision.\" — a second STAR story, showing you disagree respectfully and commit once decided.<br><br>\"What questions do you have for us?\" — always have 3: their medallion maturity, Unity Catalog adoption, and how the team handles governance and OSFI.",
      followups: [
        "Do you have a genuine, specific reason for this company — not a generic one?",
        "Can you name the last thing you learned and where?",
        "Are your 3 closing questions written down and rehearsed?"
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "On an Azure Databricks pipeline, where should real transformation logic live?",
    options: [
      "In ADF Mapping Data Flows",
      "In Databricks notebooks/jobs that ADF triggers — ADF orchestrates and moves, it doesn't own transform logic",
      "In the ADF Copy activity",
      "In Power BI"
    ],
    correct: 1
  },
  {
    q: "A candidate pastes a storage account key into a Databricks notebook to read ADLS. The correct approach?",
    options: [
      "That's fine if the notebook is private",
      "Unity Catalog storage credentials + external locations (managed identity), or a service principal secret in a Key Vault-backed secret scope — never inline",
      "Put the key in a widget",
      "Make the container public"
    ],
    correct: 1
  },
  {
    q: "Why is the bronze (raw) medallion layer immutable and append-only in a regulated insurance shop?",
    options: [
      "To save storage",
      "So you can always reprocess and you keep an audit trail / source of truth — a gold bug is fixed by replaying, and the raw record is never lost",
      "Because Delta requires it",
      "It isn't — bronze should be overwritten each run"
    ],
    correct: 1
  },
  {
    q: "Which Delta Lake feature directly enables a PIPEDA 'right to be forgotten' deletion of a policyholder?",
    options: [
      "Time travel",
      "MERGE / DELETE (then VACUUM to purge, minding retention vs regulatory-delete needs)",
      "Z-ordering",
      "Auto Loader"
    ],
    correct: 1
  },
  {
    q: "Why model dim_policy as SCD Type 2 rather than Type 1 in an insurance warehouse?",
    options: [
      "Type 2 is always faster",
      "A claim is assessed against the policy's state at the loss date, so you must preserve history, not just current values",
      "Type 1 can't store dates",
      "Regulators forbid Type 1"
    ],
    correct: 1
  },
  {
    q: "In Unity Catalog, how do you let analysts query claims but not see policyholder SIN, while the fraud team can?",
    options: [
      "Two copies of the table",
      "Column-level masking / row-level security with separate grants per group",
      "Email the fraud team a CSV",
      "Drop the SIN column entirely"
    ],
    correct: 1
  },
  {
    q: "A nightly Databricks job is expensive. Which is the FIRST cost lever to check?",
    options: [
      "Buy more DBUs",
      "Whether production is running on an always-on all-purpose cluster instead of a job cluster with auto-termination",
      "Switch to CSV output",
      "Move to a different Azure region"
    ],
    correct: 1
  },
  {
    q: "How do you make an ADF copy of a 500M-row table incremental instead of a full reload?",
    options: [
      "Run it less often",
      "Track a high-watermark column (max modified timestamp/ID) in a control table and pull only rows past it",
      "Copy to CSV first",
      "You can't — ADF only does full loads"
    ],
    correct: 1
  },
  {
    q: "A stakeholder says a number in your report is wrong. Best first move?",
    options: [
      "Defend the number — your pipeline is tested",
      "Investigate: trace lineage gold→silver→source and confirm the business definition; it's often a definition mismatch, not a bug",
      "Rebuild the whole pipeline",
      "Tell them to file a ticket"
    ],
    correct: 1
  },
  {
    q: "For near-real-time fraud scoring, how do you avoid double-counting when a stream replays?",
    options: [
      "Accept some duplicates",
      "Checkpointing for exactly-once plus idempotent writes keyed on a business/merge key, with watermarking for late events",
      "Turn off retries",
      "Run it as a nightly batch instead"
    ],
    correct: 1
  }
];
