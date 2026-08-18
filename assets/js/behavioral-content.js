// Content data for the Behavioral + Resume Deep-Dive module.
// Tailored to Sunil Thapa's resume (Data Engineer, 6+ yrs, Toronto).
const MODULE_ID = "behavioral";
const CONTENT = {

overview: {
  intro: {
    title: "How Data Engineering behavioral rounds actually work",
    desc: "The behavioral loop is where offers are won or lost — not because the questions are hard, but because strong engineers ramble, forget the metric, and say \"we\" when the interviewer needs to hear \"I\". This module teaches the STAR framework, then turns every real line on your resume into an interviewer opener with the technical cross-questions that always follow. Every model answer here is built from YOUR actual experience: American Express, Cedar Gate, InfoDevelopers."
  },
  cards: [
    {
      title: "What the behavioral round is really testing",
      badge: "what & why",
      conceptLabel: "The signal they're buying:",
      concept: "For a 6+ YOE Data Engineer, the behavioral round is not a personality test — it's a proxy for \"can this person own a pipeline in production, make a judgment call at 2am, and explain the trade-off to a risk stakeholder the next morning?\" Interviewers are scoring four things: ownership (did YOU drive it), impact (did it move a number), judgment (did you weigh alternatives), and communication (can a non-engineer follow you). Your resume is the evidence file; the questions just probe whether the stories hold up under cross-examination.",
      navLabel: "How the loop is structured:",
      nav: "Typically one or two dedicated behavioral interviewers plus a hiring manager, each 45–60 min. Openers are broad (\"tell me about a project you're proud of\"), then they drill into specifics for 10–15 min per story. The senior signal is that YOU volunteer the metric, the trade-off, and the failure mode before they have to pull it out of you.",
      noteLabel: "The bar for your level:",
      note: "At six years, \"I built the pipeline\" is the bare minimum. They want scope.<br><br>Show that you designed the schema standards. You set the SLA with the source owner. You ran the RCA. You mentored the junior who now owns it.<br><br>Talk about systems and people, not just tasks."
    },
    {
      title: "The STAR method — the only structure you need",
      badge: "framework",
      conceptLabel: "STAR in one breath:",
      concept: "Situation (1–2 sentences of context — what system, what stakes), Task (what specifically YOU were responsible for), Action (the 2–4 concrete decisions YOU made and why — this is 60% of your answer), Result (the quantified outcome + what you learned). Most engineers over-invest in Situation and under-invest in Action and Result. Flip that. The interviewer does not need five minutes of background on the healthcare claims domain; they need to hear the decisions only you could have made.",
      navLabel: "How to keep it tight:",
      nav: "Aim for 2–3 minutes per story. If you're past three minutes you're rambling. A good rhythm: 20 seconds Situation/Task, 90 seconds Action, 30 seconds Result. End on the number and the lesson, then stop talking — silence invites the follow-up, which is where you score.",
      noteLabel: "Strong answer skeleton:",
      note: "\"At Cedar Gate we had [situation]. I owned [task]. I did three things: first [action, and why], then [action, and why], then [action, and why]. The result was [metric, like +35% throughput], and it taught me [lesson].\"<br><br>That skeleton fits every story in this module."
    },
    {
      title: "Impact & metrics — quantify or it didn't happen",
      badge: "framework",
      conceptLabel: "Why numbers are non-negotiable:",
      concept: "\"I improved the pipeline\" is invisible; \"I cut the nightly run from 6 hours to under 4, a 35% throughput gain\" is a hire signal. Metrics prove you measured, which proves you're an engineer and not a storyteller. Your resume already gives you two hard anchors: +35% throughput (Airflow+dbt migration) and -25% operational cost (ARIMA/LSTM forecasting). Lead with those. For everything else, coach yourself to insert a real number: runtime before/after, rows/day, SLA hit-rate, incident count, on-call pages reduced, denial-rate drop.",
      navLabel: "How to build a metric when you don't have the exact figure:",
      nav: "Never fabricate. Instead, quantify the SHAPE: \"cut the reconciliation job from roughly X hours to Y\", \"reduced repeated on-call pages for that pipeline from several a week to near zero\", \"onboarded N new data sources on a standard ingestion pattern.\" Directional-but-honest beats precise-but-invented, and it beats no number at all.",
      noteLabel: "The two metrics to memorize cold:",
      note: "Memorize two numbers cold.<br><br>First: +35% throughput from moving legacy batch scripts to modular Airflow and dbt at Cedar Gate. Second: -25% operational cost from the predictive forecasting work at InfoDevelopers.<br><br>These are your headline numbers. Weave them into \"tell me about yourself\" and at least two deep-dive answers."
    },
    {
      title: "\"I\" vs \"we\" — claim your work without overclaiming",
      badge: "framework",
      conceptLabel: "The trap:",
      concept: "DE work is collaborative, so engineers default to \"we built, we decided, we shipped.\" But the interviewer is hiring one person and needs to know what YOU did. Overcorrecting into \"I did everything\" is just as bad — it reads as a team player who steals credit. The senior move is precise attribution: \"the team owned the platform; I specifically designed the reconciliation framework and set the validation rules.\"",
      navLabel: "How to phrase it:",
      nav: "Use \"we\" for context and \"I\" for your decisions. \"We were seeing rising claim denials [context]. I proposed and built a reconciliation framework that flagged mismatches before submission [your action].\" When the work was genuinely shared, say who did what — that honesty reads as senior, not weak.",
      noteLabel: "Watch for:",
      note: "Interviewers will ask straight out: \"what did YOU do versus the team?\"<br><br>If your story falls apart under that question, it was never really your story. Pick projects where you owned a distinct, defensible slice."
    },
    {
      title: "The five mistakes that sink strong engineers",
      badge: "pitfalls",
      conceptLabel: "The list:",
      concept: "1) Rambling — no structure, five-minute answers, interviewer loses the thread. 2) No metric — every story ends with \"and it worked well.\" 3) Blaming others — \"the data was bad, the other team dropped the ball\" reads as someone who won't own outcomes. 4) \"We\" with no \"I\" — can't tell what you actually did. 5) No trade-off or failure — every project was a flawless success, which no experienced interviewer believes.",
      navLabel: "How to inoculate yourself:",
      nav: "Structure with STAR (fixes rambling). Pre-load a metric per story (fixes no-metric). Reframe blame as \"here's how I handled a hard situation\" (fixes blaming). Rehearse the \"what did YOU do\" cut (fixes we/I). Have a genuine failure ready with the lesson (fixes the flawless-hero problem).",
      noteLabel: "The failure story is mandatory:",
      note: "Prepare one real failure. A bad cutover, a missed edge case, a wrong assumption about a data source.<br><br>Own the mistake, and show what you changed afterward. Refusing to have a failure story is a red flag on its own."
    }
  ]
},

star: {
  intro: {
    title: "The STAR playbook — six answer patterns you'll reuse all round",
    desc: "These are the reusable scaffolds behind the classic behavioral prompts. Learn the shape once and you can drop any resume story into it. Each card: what the interviewer is probing, how to structure it, and a strong skeleton keyed to your actual experience."
  },
  cards: [
    {
      title: "\"Tell me about a project you're most proud of\"",
      badge: "STAR",
      conceptLabel: "What they're probing:",
      concept: "Scope and ownership. They want to hear a project big enough to matter, with a decision only you could have made and a number attached. This is your chance to lead with a headline metric before they even ask.",
      navLabel: "How to structure it:",
      nav: "Pick the Cedar Gate Airflow+dbt migration (it has the cleanest metric). One line of context, then your three key decisions, then the +35%. Don't pick the biggest system — pick the one where your fingerprints are clearest and the number is real.",
      noteLabel: "Strong answer skeleton:",
      note: "\"At Cedar Gate we ran high-volume clinical and claims ETL on brittle legacy batch scripts. They were hard to test, they had no lineage, and failures were silent.<br><br>I led the migration to a modular Airflow and dbt setup. I broke the monolith into idempotent tasks with explicit dependencies. I moved the transforms into tested dbt models. And I added monitoring for latency and data drift.<br><br>The result was 35% more throughput, and failures finally became visible and easy to re-run. What I'm most proud of is that it became the template the team reused for every new feed.\"",
      followups: [
        "How did you measure the 35% — wall-clock runtime, rows processed, or something else?",
        "What made the legacy scripts slow — was it the code, the scheduling, or the infrastructure?",
        "How did you make the migration safe — did you run old and new in parallel?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about a time you failed\"",
      badge: "STAR",
      conceptLabel: "What they're probing:",
      concept: "Self-awareness and growth. A refusal (\"I can't think of one\") or a humblebrag (\"I work too hard\") both fail. They want a real mistake YOU owned and the concrete process change that followed. The lesson matters more than the failure.",
      navLabel: "How to structure it:",
      nav: "Situation short, own the mistake in the Task/Action without blaming data or teammates, then spend your Result on what you changed so it can't recur. Pick something real but bounded — a cutover that broke, a validation gap that let bad data through — not a career-defining catastrophe.",
      noteLabel: "Strong answer skeleton:",
      note: "\"Early in the Cedar Gate migration I cut over a claims feed without a full parallel-run window. I trusted my row-count checks.<br><br>A subtle timezone bug in one HL7 field shifted a day boundary, and a batch landed in the wrong partition. I caught it in reconciliation, but it cost me a re-backfill.<br><br>Here's the lesson. I made dual-run-until-reconciled a hard gate in my cutover checklist, and I added a schema and semantic diff, not just row counts. I've never skipped it since.\" (Quantify if you can, for example 'it cost about a day of rework.')",
      followups: [
        "How did you catch it — what alerted you?",
        "How long did recovery take, and who did you have to notify?",
        "What's in your cutover checklist now because of this?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about a time you disagreed with your lead / a senior\"",
      badge: "STAR",
      conceptLabel: "What they're probing:",
      concept: "Can you push back with evidence and still stay a team player? They're watching for two failure modes: the pushover who never disagrees, and the person who can't let a decision go once it's made. The senior answer disagrees with data, then commits fully whichever way it lands.",
      navLabel: "How to structure it:",
      nav: "Frame the disagreement as a technical trade-off, not a personality clash. State both positions fairly, show the evidence you brought, then — critically — say what happened AND that you committed to the outcome even if it wasn't your pick. \"Disagree and commit\" is the phrase they want to hear demonstrated.",
      noteLabel: "Strong answer skeleton:",
      note: "\"At Amex I pushed for near-real-time ingestion on a new source. My lead wanted batch to keep it simple.<br><br>I disagreed, but instead of arguing I pulled the numbers. I looked at the actual latency SLA the risk team needed and the cost difference between streaming and micro-batch. The data showed micro-batch in Airflow met the SLA at a fraction of the streaming cost. So I changed my own mind, and we shipped micro-batch.<br><br>The lesson: bring the number, not the opinion, and be willing to lose the argument to the data.\"",
      followups: [
        "What would have changed your mind the other way?",
        "How did you keep the relationship good after disagreeing?",
        "Have you ever committed to a decision you still thought was wrong — how did that go?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about a tight deadline / high-pressure delivery\"",
      badge: "STAR",
      conceptLabel: "What they're probing:",
      concept: "Prioritization under constraint. Anyone can work a weekend; they want to hear you make trade-offs — what you cut, what you protected, and how you communicated the risk rather than silently shipping something half-tested.",
      navLabel: "How to structure it:",
      nav: "Name the constraint and the stakes, then show the triage: what was must-have vs nice-to-have, what you de-scoped, and how you kept quality on the critical path. End on the delivery AND the fact that you flagged residual risk honestly rather than hiding it.",
      noteLabel: "Strong answer skeleton:",
      note: "\"We were onboarding a new payer feed at Cedar Gate with a fixed go-live tied to a client contract.<br><br>I protected the non-negotiables, which were the validation rules and the PHI access controls. I de-scoped the nice-to-haves, like the extra reconciliation dashboard, and shipped that a sprint later. I flagged the trade-off to the PM in writing, so it was a decision and not a surprise.<br><br>We hit the date with the data contract intact. (Quantify it, for example 'ingested N sources on schedule.')\"",
      followups: [
        "What specifically did you de-scope, and did anything you cut come back to bite you?",
        "How did you decide what was safe to defer?",
        "How did you communicate the risk to stakeholders?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about ambiguous / poorly-defined requirements\"",
      badge: "STAR",
      conceptLabel: "What they're probing:",
      concept: "Can you turn vague business asks into concrete data contracts? This is core DE seniority — translating \"the risk team wants better data\" into schemas, SLAs, and validation rules. They want to see you drive clarity rather than wait for a perfect spec.",
      navLabel: "How to structure it:",
      nav: "Show your process for removing ambiguity: who you talked to, the questions you asked, and the artifact you produced (a data contract, a schema standard, an SLA). The senior signal is that you converted talk into a written, agreed spec that both sides signed off on.",
      noteLabel: "Strong answer skeleton:",
      note: "\"At Amex, a risk-analytics ask came in as 'we need transaction data we can trust.'<br><br>I sat with the analysts and the source owners and turned that into a data contract. It spelled out the exact fields, a freshness SLA, null and validation rules, and who owned what on each side.<br><br>That artifact killed the ambiguity. Everyone now knew what 'trust' meant in columns and thresholds. It also became a reusable onboarding template for new sources.\"",
      followups: [
        "What goes into your data contract — can you list the fields?",
        "What do you do when the source owner won't commit to an SLA?",
        "How do you handle scope creep after the contract is signed?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about going above and beyond / taking initiative\"",
      badge: "STAR",
      conceptLabel: "What they're probing:",
      concept: "Ownership beyond the assigned ticket. They want proof you spot problems nobody asked you to fix and drive them, especially things that outlast you — a reusable framework, a standard, a mentored teammate.",
      navLabel: "How to structure it:",
      nav: "Pick something you initiated, not something you were handed. Show you saw the recurring pain, made the case, and built the durable fix. Reusability and adoption by others is the strongest version of this answer.",
      noteLabel: "Strong answer skeleton:",
      note: "\"Nobody asked me to, but I kept seeing the same manual data-cleanup steps across feeds at Cedar Gate. So I built a library of reusable Python cleanup scripts and got the team to standardize on them.<br><br>That cut the effort to onboard each feed and made new hires ramp up faster. The same instinct is why I set up validation-rule templates instead of one-off checks.\" (Quantify it, for example 'cut new-feed setup from days to hours.')",
      followups: [
        "How did you get others to actually adopt it?",
        "How do you balance this kind of work against your assigned deliverables?",
        "What happened to it after you left — did it stick?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    }
  ]
},

projects: {
  intro: {
    title: "Resume deep-dive — the openers, and the cross-questions that always follow",
    desc: "Each card is an interviewer's opener drawn straight from your resume. The follow-ups are the technical drills that always come next — the ones that separate people who did the work from people who watched it happen. Rehearse the model answer AND every follow-up out loud."
  },
  cards: [
    {
      title: "\"Walk me through the batch-to-Airflow migration that improved throughput 35%.\"",
      badge: "Cedar Gate",
      conceptLabel: "The context to establish:",
      concept: "High-volume clinical and claims ETL (HL7v2, FHIR, EDI 837/835) running on legacy batch scripts — monolithic, untested, silent failures, no lineage. This is your single strongest story: it has the cleanest metric and shows architecture, testing, and observability judgment all at once.",
      navLabel: "What they're probing:",
      nav: "Whether you understand WHY the old design was slow and fragile, and whether the new design's wins came from real engineering (idempotency, parallelism, tested transforms, observability) versus just \"we rewrote it.\" They'll poke at how you measured and how you cut over safely.",
      noteLabel: "Model answer (STAR):",
      note: "\"The situation was brittle legacy batch scripts for claims and clinical ETL. They were hard to test, failures were silent, and backfills were manual.<br><br>My task was to own re-architecting it. So I broke the monolith into idempotent Airflow tasks with explicit dependency ordering. I moved the transforms into dbt models with tests and documented lineage. And I added monitoring for latency and data drift, so failures surfaced right away. I ran the old and new versions in parallel and reconciled them before cutover.<br><br>The result was 35% more throughput, failures you could re-run, and a modular template the team reused for new feeds.\"",
      followups: [
        "How did you measure the 35% — runtime, rows/hour, or SLA hit-rate? Over what window?",
        "What broke or surprised you during cutover?",
        "How did you keep tasks idempotent so backfills didn't double-count claims?",
        "Why dbt for transforms instead of keeping logic in Python/Airflow?",
        "How did you handle a mid-DAG failure — partial re-run or full re-run?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about the validation & reconciliation framework that reduced claim denials.\"",
      badge: "Cedar Gate",
      conceptLabel: "The context to establish:",
      concept: "Claim denials are expensive and often caused by data mismatches (eligibility, coding, payer-specific rules) caught too late. You built validation and reconciliation that flagged issues before submission — a data-quality system with a direct dollar impact.",
      navLabel: "What they're probing:",
      nav: "Whether you think about data quality as a system (rules, thresholds, reconciliation between source and target) rather than ad-hoc checks, and whether you can connect a technical control to a business outcome (fewer denials = revenue protected).",
      noteLabel: "Model answer (STAR):",
      note: "\"Denials were rising, and we were catching bad claims only after submission.<br><br>I built a validation framework that ran schema, referential, and payer-rule checks at ingestion. I added a reconciliation layer that compared source counts and key amounts against what landed in the warehouse, so it flagged drift before it reached submission. Bad records got quarantined and routed for correction instead of failing downstream.<br><br>The result was fewer denials and far less firefighting. (Quantify with your real figure, for example 'cut denial-related rework by X%.')\"",
      followups: [
        "What were the actual validation rules — give me three concrete examples?",
        "Row-count reconciliation is weak against same-count-wrong-values — how did you catch value-level drift?",
        "What did you do with a record that failed — quarantine, drop, or alert?",
        "How did you tune thresholds so you weren't drowning in false-positive alerts?",
        "How did you attribute the denial reduction to your framework specifically?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"How did you handle PHI/PII in the healthcare pipelines — walk me through your HIPAA controls.\"",
      badge: "Cedar Gate",
      conceptLabel: "The context to establish:",
      concept: "Clinical/claims data is regulated PHI under HIPAA. You owned access controls, encryption, and the data-mapping/lineage/governance documentation. This tests whether you treat compliance as engineering, not paperwork.",
      navLabel: "What they're probing:",
      nav: "Concrete controls, not buzzwords — encryption at rest and in transit, least-privilege/role-based access, masking/tokenization, audit logging, and lineage docs that prove where PHI flows. Amex risk/compliance work makes this doubly relevant to bring up.",
      noteLabel: "Model answer (STAR):",
      note: "\"PHI was in scope end to end. So I enforced least-privilege access.<br><br>Access was role-based, so analysts saw de-identified or minimum-necessary fields, never raw PHI. I encrypted data at rest and in transit. And I kept data-mapping and lineage docs, so for audits we could show exactly where PHI entered, moved, and rested. Where analytics didn't need identifiers, I masked or tokenized them at ingestion.<br><br>The lineage work paid off operationally too. It made impact analysis for schema changes trivial. At Amex I apply the same discipline, partnering with data governance on quality, lineage, and access control.\"",
      followups: [
        "Where exactly is data encrypted, and who holds the keys?",
        "How do you enforce minimum-necessary — column-level, row-level, or view-based?",
        "How did you handle PHI in non-prod / test environments?",
        "How did you keep lineage docs from going stale?",
        "What's your process when someone requests broader access than their role allows?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Describe the Kafka/CDC replication across regional facilities.\"",
      badge: "Cedar Gate",
      conceptLabel: "The context to establish:",
      concept: "You used Kafka and CDC to replicate data across regional healthcare facilities — keeping distributed sites consistent with a central store. This tests streaming/CDC fundamentals and how you reason about consistency and failure across regions.",
      navLabel: "What they're probing:",
      nav: "Whether you understand CDC mechanics (log-based capture, ordering, idempotency), how you handled schema changes and out-of-order/duplicate events, and how you kept regions consistent without losing or double-applying records.",
      noteLabel: "Model answer (STAR):",
      note: "\"We needed regional facility data centralized, but without brittle nightly dumps.<br><br>I used log-based CDC into Kafka, keyed by entity so per-record ordering held within a partition. Consumers applied changes idempotently, using an upsert on the primary key, so replays and duplicates were safe. I handled schema evolution with a registry, so a producer change didn't break consumers. And I monitored consumer lag as the health metric.<br><br>The payoff was near-real-time consistency across facilities instead of stale batch snapshots.\"",
      followups: [
        "Log-based CDC or query-based — and why does that choice matter?",
        "How did you guarantee exactly-once effect on the target given at-least-once delivery?",
        "What happened when a consumer fell behind — how did you detect and recover?",
        "How did you handle a hard delete in the source?",
        "How did you deal with schema changes without downtime?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about an on-call incident at Amex and how you ran the RCA.\"",
      badge: "American Express",
      conceptLabel: "The context to establish:",
      concept: "You're on an on-call rotation owning batch + near-real-time pipelines feeding risk/analytics, and you do root-cause analysis plus preventive fixes. This tests calm-under-fire, structured debugging, and whether you close the loop with a permanent fix.",
      navLabel: "What they're probing:",
      nav: "Incident discipline: how you triaged (stop the bleeding vs find the cause), how you communicated to stakeholders while data was late, the actual root cause, and — most important — the preventive fix so it never pages again. Blaming upstream data is the wrong tone; owning the response is the right one.",
      noteLabel: "Model answer (STAR):",
      note: "\"A near-real-time risk feed started lagging its SLA overnight.<br><br>First I stabilized it. I checked consumer lag and pipeline health, confirmed no data loss, and gave the risk stakeholders a revised ETA so they weren't flying blind. The root cause was an upstream source that changed its volume and shape and blew past our cluster sizing.<br><br>The immediate fix was to reprocess the backlog idempotently. The preventive fix was bigger: I right-sized the job, added a volume-anomaly alert, and put a data contract on that source so shape changes came with notice. That class of page stopped.\" (Quantify it, for example 'recurring pages for that pipeline dropped to near zero.')",
      followups: [
        "How do you decide between mitigating fast vs finding root cause first?",
        "What did you tell stakeholders, and when?",
        "How did you reprocess without double-counting into the risk models?",
        "What's the preventive fix, and how do you know it worked?",
        "Walk me through how you actually found the root cause — what did you look at first?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"You optimized Spark jobs and Snowflake queries — give me a concrete example.\"",
      badge: "American Express",
      conceptLabel: "The context to establish:",
      concept: "You tune PySpark jobs and Snowflake queries at large transaction/customer scale, and you drive cost/capacity optimization by right-sizing clusters and storage. This tests real performance debugging, not memorized tips.",
      navLabel: "What they're probing:",
      nav: "Whether you diagnose from evidence (Spark UI stages, skew, spill; Snowflake query profile, pruning, spilling to remote storage) and whether your fixes are principled — partitioning, broadcast joins, avoiding shuffles, clustering keys, warehouse right-sizing — with a before/after number.",
      noteLabel: "Model answer (STAR):",
      note: "\"A Spark job on transaction data was slow and expensive.<br><br>The Spark UI showed skew. A few keys dominated a shuffle join and spilled to disk. I salted the hot keys and switched a small dimension to a broadcast join, which killed the big shuffle.<br><br>On the Snowflake side, one query wasn't pruning. I added a clustering key aligned to the filter and stopped selecting unused columns. I paired that with right-sizing the warehouse and cluster, so we weren't paying for idle capacity. (Quantify it, for example 'cut runtime from X to Y and spend by Z%.')\"",
      followups: [
        "How did you identify the skew — what in the Spark UI told you?",
        "When is a broadcast join the wrong choice?",
        "How does Snowflake clustering actually help pruning, and what's the cost of over-clustering?",
        "How do you right-size a warehouse without hurting SLA?",
        "How do you separate a real optimization from noise in the timing?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about the cost / right-sizing initiative at Amex.\"",
      badge: "American Express",
      conceptLabel: "The context to establish:",
      concept: "You drove cost and capacity optimization — right-sizing clusters and storage. Cost work is a strong senior signal because it shows you think about the business, not just the pipeline.",
      navLabel: "What they're probing:",
      nav: "Whether you approached cost systematically (found the biggest spenders first, measured, changed one thing, re-measured) and whether you protected SLAs while cutting spend. They want a method, not a one-off lucky win.",
      noteLabel: "Model answer (STAR):",
      note: "\"Compute and storage spend was creeping up.<br><br>I started by finding the biggest line items. It came down to a handful of oversized warehouses, always-on clusters, and cold data sitting on hot storage. So I right-sized warehouses to actual concurrency, turned on auto-suspend, moved cold partitions to cheaper storage tiers, and killed redundant intermediate datasets.<br><br>After each change I watched SLA and query latency, so I wasn't trading cost for reliability. (Quantify it, for example 'reduced monthly spend by X% with no SLA regressions.')\"",
      followups: [
        "How did you find where the money was actually going?",
        "How do you avoid cost cuts that quietly break an SLA?",
        "What's the trade-off in auto-suspend / cold-storage tiering?",
        "How did you get buy-in to change infrastructure others depended on?",
        "Which single change gave the biggest saving?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"How do you set up data contracts and SLAs with source owners?\"",
      badge: "American Express",
      conceptLabel: "The context to establish:",
      concept: "You onboard new data sources with ingestion patterns, validation rules, and SLAs, and translate product/risk/analytics requirements into specs and data contracts. This is core senior-DE stakeholder work.",
      navLabel: "What they're probing:",
      nav: "Whether you can drive agreement between producers and consumers — the fields, freshness, quality thresholds, ownership, and what happens on breach — and whether you enforce the contract in code rather than trusting goodwill.",
      noteLabel: "Model answer (STAR):",
      note: "\"When I onboard a source, I don't start with pipelines. I start with a contract.<br><br>I sit with the source owner and the consumer, which is usually risk or analytics, and we pin down the schema, a freshness SLA, validation rules and thresholds, and who owns what on a breach. Then I enforce it in code, with schema checks and freshness and volume alerts at ingestion. That way a broken contract fails loudly instead of poisoning everything downstream.<br><br>That's also how I standardized onboarding at Amex, so every new source follows the same pattern.\"",
      followups: [
        "What's in the contract — walk me through the fields?",
        "What happens technically when a producer violates the contract?",
        "How do you get a reluctant source team to commit to an SLA?",
        "How do you version a contract when requirements change?",
        "How do you handle a source that's chronically late?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"You mentor junior data engineers — tell me about developing someone.\"",
      badge: "American Express",
      conceptLabel: "The context to establish:",
      concept: "You mentor junior DEs and set data-model/schema standards. Mentoring stories show leadership and that your impact scales beyond your own keyboard — a key differentiator at senior level.",
      navLabel: "What they're probing:",
      nav: "Whether you develop people deliberately (not just answer questions), transfer ownership, and raise the team's bar through standards and code review. The strongest version shows the mentee growing into real ownership.",
      noteLabel: "Model answer (STAR):",
      note: "\"A junior DE was strong on code, but he was shipping pipelines without thinking about idempotency or observability.<br><br>Instead of fixing his PRs myself, I paired with him on one pipeline end to end. We set up the validation, the alerts, and the backfill story together. Then I had him own the next one solo, with me on review. I also wrote down our schema and ingestion standards, so the guidance didn't live only in my head.<br><br>Within a couple of months he owned a source area outright and was reviewing other people's PRs.\"",
      followups: [
        "How do you give feedback that lands without discouraging someone?",
        "How do you decide when to let someone struggle vs step in?",
        "What's in your code-review standard for a new pipeline?",
        "How do you mentor someone more senior or resistant to feedback?",
        "How do you measure whether your mentoring actually worked?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Tell me about the forecasting work that cut operational cost 25%.\"",
      badge: "InfoDevelopers",
      conceptLabel: "The context to establish:",
      concept: "At InfoDevelopers you built predictive forecasting (ARIMA/LSTM) that reduced operational cost by 25%. It's older and more ML-flavored, but it's a hard metric and shows you connect modeling to business outcomes — good for a range/versatility question.",
      navLabel: "What they're probing:",
      nav: "That the number is real and attributable — what was forecast, how the forecast drove a decision that saved money, and why you chose ARIMA vs LSTM. Be ready to be honest that this is earlier-career and less core to DE than your recent work.",
      noteLabel: "Model answer (STAR):",
      note: "\"We were over-provisioning because planning ran on gut feel.<br><br>I built demand forecasting. I used ARIMA as a strong seasonal baseline, and LSTM where the patterns were non-linear and I had enough history. Then I fed it into capacity planning, so provisioning matched the actual expected demand. That alignment cut operational cost by 25%.<br><br>I'll be honest, this is earlier-career and it's more modeling than pipeline work. But it's why I care about tying data work to a dollar outcome, which is the same instinct behind my cost right-sizing at Amex.\"",
      followups: [
        "Why ARIMA vs LSTM — how did you choose, and did LSTM actually beat the baseline?",
        "How did you validate the forecast — what error metric, what backtest window?",
        "How did the forecast concretely translate into the 25% saving?",
        "How would you productionize and monitor that model for drift today?",
        "How is this relevant to a pure data-engineering role?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    }
  ]
},

leadership: {
  intro: {
    title: "Leadership, influence & incidents — the senior signals",
    desc: "At 6+ years you're expected to lead without a title: raise the bar through standards, influence peers, disagree productively, and stay calm when production is on fire. These cards give you the skeleton and the follow-ups for each."
  },
  cards: [
    {
      title: "Mentoring & growing the team's bar",
      badge: "leadership",
      conceptLabel: "What they're probing:",
      concept: "Whether your impact scales through other people and durable standards, not just your own output. They want deliberate development and knowledge that outlives you.",
      navLabel: "How to structure it:",
      nav: "Show a specific person, a specific gap, your intervention (pairing, transferring ownership, written standards), and the outcome (they now own it). Tie it to the schema/ingestion standards you set so it's clearly systemic, not one-off.",
      noteLabel: "Strong answer skeleton:",
      note: "\"I mentor by transferring ownership, not by fixing PRs.<br><br>With one junior DE, I paired on a full pipeline, then had him own the next one solo under review. I also wrote down our schema and ingestion standards, so the bar was explicit for everyone. He now owns a source area and reviews others.\"",
      followups: [
        "How do you tell when to step in versus let someone struggle?",
        "What's in your written standard, and how do you keep it alive?",
        "How do you mentor without becoming the bottleneck?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "Setting code-review & pipeline standards",
      badge: "leadership",
      conceptLabel: "What they're probing:",
      concept: "Whether you have an opinion on what \"production-ready\" means for a pipeline, and whether you enforce it consistently and kindly. Standards are how a senior engineer scales quality.",
      navLabel: "How to structure it:",
      nav: "Give your actual checklist: idempotency, tests (dbt tests / data-quality checks), observability (alerts on lag/latency/drift), documented lineage, and a backfill story. Show you review for design and data-correctness, not just style.",
      noteLabel: "Strong answer skeleton:",
      note: "\"For a pipeline PR I have a clear bar. Is it idempotent and safe to re-run? Are there data-quality tests? Does it alert on failure, lag, and drift? Is the lineage documented? And is there a backfill plan?<br><br>I review the design before the syntax, and I frame my comments as questions, so it's a conversation and not a gate.\"",
      followups: [
        "How do you handle a PR that works but doesn't meet the bar under deadline pressure?",
        "How do you keep reviews from becoming a bottleneck?",
        "How do you enforce standards without demoralizing the team?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "Influencing without authority",
      badge: "leadership",
      conceptLabel: "What they're probing:",
      concept: "Can you get another team to change behavior when you can't order them to — e.g. getting a source team to honor a data contract or an SLA? This is daily senior reality.",
      navLabel: "How to structure it:",
      nav: "Show that you led with their incentives and with data, not with your preference. Name the shared goal, the evidence you brought, and how you made the right thing the easy thing for them.",
      noteLabel: "Strong answer skeleton:",
      note: "\"To get a source team to commit to an SLA and validation, I didn't escalate.<br><br>I showed them the downstream cost of drift in their own terms, like denials and risk-reporting delays. Then I made compliance cheap by giving them the schema check to run on their side. Framed as a way to help them avoid pages, they signed on.\"",
      followups: [
        "What do you do when they still won't cooperate?",
        "When is escalation the right call versus a last resort?",
        "How do you keep the relationship healthy for next time?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "Disagreeing with a decision — and committing",
      badge: "leadership",
      conceptLabel: "What they're probing:",
      concept: "Backbone plus maturity. They want someone who voices a well-reasoned objection but doesn't sabotage or sulk once the call is made.",
      navLabel: "How to structure it:",
      nav: "Disagree with evidence, state it once clearly, then commit visibly. The phrase to demonstrate is \"disagree and commit\" — show you executed the chosen path in good faith even when it wasn't yours.",
      noteLabel: "Strong answer skeleton:",
      note: "\"I argued for streaming a source, and leadership chose micro-batch.<br><br>I made my case once, with the latency SLA and the cost numbers. The team went micro-batch, and I built it properly instead of half-heartedly. The data later proved micro-batch was right for that SLA. That reinforced two things for me: bring numbers, and stay open to being wrong.\"",
      followups: [
        "Tell me about a time you committed to a decision and it turned out badly.",
        "How do you know when to keep pushing versus let it go?",
        "How do you disagree with someone much more senior than you?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "Leading a production incident under pressure",
      badge: "leadership",
      conceptLabel: "What they're probing:",
      concept: "Calm, structured incident command: stabilize, communicate, diagnose, prevent. Given your Amex on-call rotation and RCA work, this should be one of your sharpest answers.",
      navLabel: "How to structure it:",
      nav: "Order matters: stop the bleeding and confirm no data loss first, communicate a clear status/ETA to stakeholders early, then find root cause, then ship the preventive fix. Emphasize the loop actually closing.",
      noteLabel: "Strong answer skeleton:",
      note: "\"When a risk feed breached SLA overnight, I stabilized it first. I confirmed no data loss and checked the lag.<br><br>Then I gave the risk team a clear ETA, so they weren't guessing, and I found the root cause, which was an upstream volume change past our sizing. I reprocessed idempotently and shipped the preventive fix: right-sizing, plus a volume-anomaly alert, plus a contract on the source. That class of page stopped.\"",
      followups: [
        "Mitigate first or root-cause first — how do you decide?",
        "How much do you communicate to stakeholders during an active incident?",
        "How do you make sure the preventive fix actually holds?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "Communicating with non-technical stakeholders",
      badge: "leadership",
      conceptLabel: "What they're probing:",
      concept: "Can you translate pipeline reality into risk/product/compliance language and back? At Amex you translate product/risk/analytics requirements into specs — this is exactly that muscle.",
      navLabel: "How to structure it:",
      nav: "Show you lead with the business impact and the decision they need to make, not the implementation. Give an example of turning a vague ask into a concrete contract, and of explaining an incident or trade-off in their terms.",
      noteLabel: "Strong answer skeleton:",
      note: "\"With risk stakeholders I talk in freshness, trust, and decisions, not in Airflow DAGs.<br><br>When a feed was late, I told them 'reporting will be N hours behind, here's the revised ETA, and here's what's affected.' I didn't hand them the stack trace. And I turn vague asks like 'we need better data' into a written data contract they can actually sign off on.\"",
      followups: [
        "How do you say no to a stakeholder request without damaging the relationship?",
        "How do you explain a technical trade-off (cost vs latency) to a non-engineer?",
        "How do you communicate bad news like data loss or a missed SLA?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "Handling conflict on the team",
      badge: "leadership",
      conceptLabel: "What they're probing:",
      concept: "Emotional maturity and whether you resolve friction directly and professionally rather than avoiding it or escalating prematurely.",
      navLabel: "How to structure it:",
      nav: "Frame conflict as a technical or priority disagreement, show you sought to understand the other side first, found the shared goal, and resolved it with data or a small experiment. Avoid any story that makes a colleague the villain.",
      noteLabel: "Strong answer skeleton:",
      note: "\"Another engineer and I disagreed on whether transforms should live in dbt or Python.<br><br>Rather than argue in the abstract, I asked what he was optimizing for. It turned out to be debuggability. So we agreed on dbt for set-based transforms and Python for the connector logic, and we wrote it into the standard. The disagreement actually produced a better rule than either of us had alone.\"",
      followups: [
        "What if you'd understood their position and still disagreed?",
        "When do you bring a manager into a peer conflict?",
        "How do you rebuild trust after a heated disagreement?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    }
  ]
},

interview: {
  intro: {
    title: "Classic behavioral questions — approach, model answer, follow-ups",
    desc: "The predictable questions that open or close almost every loop. Prepare these cold. Each card: how to approach it, a model answer built from your resume, and the follow-ups that come next."
  },
  cards: [
    {
      title: "\"Tell me about yourself\" — the 60-second DE pitch",
      badge: "must-prep",
      conceptLabel: "How to approach it:",
      concept: "This is a positioning statement, not a life story. Present → past highlights → why you're here, in about 60 seconds. Lead with your current level and domain, hit your two headline metrics, and land on why THIS role. Rehearse it until it's smooth but not robotic.",
      navLabel: "Structure:",
      nav: "One line on who you are now (senior DE, domain), two or three lines of the strongest resume proof with numbers, one line on what you're looking for that connects to this role. Stop at 60–75 seconds.",
      noteLabel: "Model answer (memorize this shape):",
      note: "\"I'm a data engineer with over six years of experience, currently at American Express in Toronto. There I architect large-scale ETL and ELT for transaction and customer data on our lake and Snowflake warehouse, for risk and analytics. It's batch and near-real-time in Airflow, with a lot of Spark and Snowflake tuning and cost work.<br><br>Before that, at Cedar Gate in healthcare, I re-architected legacy batch scripts into a modular Airflow and dbt platform that lifted throughput by 35%, and I built the validation and reconciliation frameworks that cut claim denials. Earlier, I built forecasting models that took 25% out of operational cost.<br><br>I care about pipelines that are reliable, observable, and tied to a real business outcome. That's exactly why this role interests me.\"",
      followups: [
        "You mentioned 35% — how did you measure that?",
        "What are you looking for that you're not getting today?",
        "Which of those are you proudest of and why?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Why do you want to work here / why this company?\"",
      badge: "must-prep",
      conceptLabel: "How to approach it:",
      concept: "This is a research check. Generic praise (\"great company, great culture\") fails. Connect something specific about their data problems, scale, or domain to something specific you've done. Show you'd solve THEIR problem, not just any problem.",
      navLabel: "How to approach it:",
      nav: "Name a concrete reason tied to the role (their scale, their domain, a data challenge you're suited to), then bridge to your matching experience. Do 20 minutes of homework on their stack/domain beforehand so this isn't hollow.",
      noteLabel: "Model answer:",
      note: "\"There are two reasons.<br><br>First, the scale and the problem. [Company]'s data challenge in [their domain] is exactly the kind of large-scale, reliability-and-governance-heavy work I did at Amex on risk data and at Cedar Gate under HIPAA. So I can contribute early. Second, I want to keep working where data quality and cost actually matter to the business, not where pipelines are an afterthought. That's the environment where I do my best work.\" (Insert a specific fact about the company you researched.)",
      followups: [
        "What specifically about our stack appeals to you?",
        "What do you know about what our team works on?",
        "What would you want to work on first here?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Why are you leaving American Express?\"",
      badge: "must-prep",
      conceptLabel: "How to approach it:",
      concept: "The trap is negativity. Never trash Amex, your manager, or the work — it signals you'll do the same about the next employer. Frame the move as toward growth, scope, or a domain you want, not away from a problem.",
      navLabel: "How to approach it:",
      nav: "Positive, forward-looking, brief. Acknowledge what's good about Amex, then name the specific growth this role offers that's harder to get where you are. Keep it to two sentences — don't over-explain, which reads as defensive.",
      noteLabel: "Model answer:",
      note: "\"I've grown a lot at Amex, with large-scale risk pipelines, on-call ownership, and mentoring, and I'm grateful for it.<br><br>I'm looking for a role with more scope to [own architecture end to end / work in this domain / lead more]. That's a natural next step for me, and it matches what this position offers. It's about the opportunity ahead, not anything wrong where I am.\"",
      followups: [
        "What specifically can't you get in your current role?",
        "Have you tried to get that scope internally?",
        "What would make you stay?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"What's your greatest strength?\"",
      badge: "classic",
      conceptLabel: "How to approach it:",
      concept: "Pick one strength that maps to the job and prove it with a resume example. A strength without evidence is a claim; a strength with a metric is a signal.",
      navLabel: "How to approach it:",
      nav: "Name it, then immediately back it with a specific story and number. For a senior DE, the strongest picks are reliability/ownership, turning ambiguity into contracts, or performance/cost engineering.",
      noteLabel: "Model answer:",
      note: "\"Turning messy, ambiguous data problems into reliable systems.<br><br>At Cedar Gate I took brittle legacy scripts and built a modular Airflow and dbt platform with real testing and observability. That gave us 35% more throughput, and failures were finally visible and easy to re-run. I don't just make a pipeline work once. I make it something the team can trust and reuse.\"",
      followups: [
        "When has that strength been a weakness?",
        "Give me another example of it.",
        "How does that strength show up day to day?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"What's your greatest weakness?\"",
      badge: "classic",
      conceptLabel: "How to approach it:",
      concept: "They're testing self-awareness, not looking for a confession. Give a real weakness (not a disguised strength like \"perfectionism\") plus the concrete thing you do to manage it. Honesty + a control mechanism = maturity.",
      navLabel: "How to approach it:",
      nav: "Pick a genuine, non-fatal weakness and pair it with the specific habit you built to counter it. Avoid anything that's core to the job (\"I'm bad at SQL\" is disqualifying).",
      noteLabel: "Model answer:",
      note: "\"I've tended to over-invest in polishing a pipeline, with extra tests and extra observability, past the point of diminishing returns, especially under a deadline.<br><br>I manage it now by agreeing the must-haves versus the nice-to-haves up front, and time-boxing the polish, then shipping the rest as a follow-up. Naming that trade-off out loud with stakeholders keeps me from gold-plating on the critical path.\"",
      followups: [
        "How has that weakness actually cost you?",
        "What are you doing to improve it right now?",
        "Has anyone ever given you that feedback directly?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Where do you see yourself in 5 years?\"",
      badge: "classic",
      conceptLabel: "How to approach it:",
      concept: "They want ambition that's compatible with the role — not \"your job in a year\" and not something the role can't offer. Show a realistic growth trajectory that this position feeds into.",
      navLabel: "How to approach it:",
      nav: "Point at a plausible senior/lead/architect track and tie it to skills you'd build here. Keep it about impact and depth, not just titles.",
      noteLabel: "Model answer:",
      note: "\"Growing into a senior or lead data engineer, or a data architect role. That means owning platform-level architecture, setting the standards and data-contract practices for a team, and mentoring more heavily, which I already do informally.<br><br>I'm not chasing a title. I want the scope to shape how data is built reliably at scale, and this role is a strong step toward that.\"",
      followups: [
        "Do you want to move into management or stay technical?",
        "What skills do you still need to build to get there?",
        "How does this role fit that path?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Why should we hire you?\" / \"What sets you apart?\"",
      badge: "classic",
      conceptLabel: "How to approach it:",
      concept: "A tight closing summary of your fit — the two or three things that make you the low-risk, high-value hire for THIS role. Confident, specific, brief.",
      navLabel: "How to approach it:",
      nav: "Pick your two or three strongest differentiators that match the job description and back each with a one-line proof. Don't list your whole resume — synthesize.",
      noteLabel: "Model answer:",
      note: "\"Three things.<br><br>First, I've shipped reliable large-scale pipelines in two demanding, regulated domains: risk at Amex and healthcare under HIPAA at Cedar Gate. So governance and reliability are second nature. Second, I have hard results, not just activity: 35% throughput and 25% cost. Third, I raise the team around me through standards and mentoring.<br><br>That combination of scale, measurable impact, and lifting the team is what I'd bring here.\"",
      followups: [
        "Which of those matters most for this role?",
        "Where would you have the biggest impact in your first 90 days?",
        "What's the one thing you'd need to learn fastest here?"
      ],
      followupsLabel: "Cross-questions that always follow:"
    },
    {
      title: "\"Do you have any questions for us?\"",
      badge: "must-prep",
      conceptLabel: "How to approach it:",
      concept: "Never say no — that reads as disinterest. Great questions signal seniority and let you assess the role. Ask about things that matter to how you'd actually work: data quality culture, on-call, ownership, tech debt, how success is measured.",
      navLabel: "How to approach it:",
      nav: "Prepare 4–5 so you're not stuck if some get answered earlier. Aim them at reality, not perks. The best questions make the interviewer picture you already on the team.",
      noteLabel: "Strong questions to ask:",
      note: "\"How does the team handle data quality and observability today? Is it a culture, or a backlog?<br><br>What does on-call look like, and how do you follow up on incidents? How do you decide which pipelines to build versus buy?<br><br>How is success measured for this role in the first year? And what's the biggest data challenge the team is facing right now?\"",
      followups: [
        "(Listen actively and ask a genuine follow-up to their answer.)",
        "Tie their answer back to your experience where honest.",
        "End by confirming your interest in the role."
      ],
      followupsLabel: "Follow through:"
    }
  ]
}

};

const QUIZ = [
  {
    q: "What do the letters in the STAR method stand for?",
    options: [
      "Situation, Task, Action, Result",
      "Story, Timeline, Analysis, Recap",
      "Setup, Trouble, Attempt, Reward",
      "Scope, Team, Approach, ROI"
    ],
    correct: 0
  },
  {
    q: "Which part of a STAR answer should get the MOST time?",
    options: [
      "Situation — give lots of background context",
      "Action — the specific decisions YOU made and why",
      "Result — just repeat the metric several times",
      "Task — describe the whole team's responsibilities"
    ],
    correct: 1
  },
  {
    q: "You don't have the exact number for a project. What's the best move?",
    options: [
      "Invent a precise-sounding figure so it looks rigorous",
      "Skip metrics entirely and say 'it went well'",
      "Quantify honestly and directionally (e.g. 'cut runtime from roughly X to Y')",
      "Say metrics don't apply to data engineering"
    ],
    correct: 2
  },
  {
    q: "Which is a red flag interviewers watch for in behavioral answers?",
    options: [
      "Using 'I' to describe your specific decisions",
      "Ending a story with a quantified result",
      "Blaming teammates or 'bad data' for a failure",
      "Naming a genuine trade-off you made"
    ],
    correct: 2
  },
  {
    q: "For 'tell me about a time you failed', the strongest answer includes:",
    options: [
      "A disguised strength like 'I'm a perfectionist'",
      "A real mistake you owned plus the process change that followed",
      "A story where a coworker was actually at fault",
      "A refusal because you can't recall failing"
    ],
    correct: 1
  },
  {
    q: "When you disagree with a decision your lead makes, the senior move is to:",
    options: [
      "Keep re-litigating it until they change their mind",
      "Stay silent to avoid conflict",
      "Make your case with data once, then disagree and commit",
      "Implement it half-heartedly to prove your point"
    ],
    correct: 2
  }
];
