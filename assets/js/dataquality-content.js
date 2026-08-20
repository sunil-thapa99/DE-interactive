// Content data for the Data Quality & Observability module.
// Senior-DE interview focus: quality vs observability, the DQ dimensions, the five pillars,
// data contracts/SLAs, and incident response. Examples lean on healthcare claims and
// finance/transaction pipelines to match real senior work.
const MODULE_ID = "dataquality";
const CONTENT = {

overview: {
  intro: {
    title: "Data Quality & Observability — knowing your data is right, and knowing when it isn't",
    desc: "Data quality is whether the data is correct. Data observability is whether you'd KNOW if it weren't. A senior DE owns both: the checks that assert correctness at each layer, and the monitoring that catches the failure you didn't write a check for. This module goes from the six DQ dimensions and test types, through the five pillars of observability and anomaly detection, to data contracts, SLAs, and incident response — with concrete tools (dbt tests, Great Expectations, Soda, Monte Carlo, Elementary) and the trade-offs an interview actually probes."
  },
  cards: [
    {
      title: "Data quality vs data observability — they are not the same thing",
      badge: "fundamentals",
      conceptLabel: "The core distinction:",
      concept: "Data quality answers 'is this data correct?' — completeness, validity, accuracy, and so on, usually asserted by explicit tests you wrote. Data observability answers 'would I know if it stopped being correct?' — it's the monitoring, metrics, and lineage that surface problems you never anticipated. Quality is a set of assertions about known failure modes. Observability is instrumentation for the unknown ones. You need both: tests catch the bugs you predicted, observability catches the freshness drop, the volume anomaly, and the schema change that no test covered.",
      noteLabel: "In practice:",
      note: "Think of it like application code. Data quality is unit tests. Data observability is the APM dashboard and alerting.<br><br>Tests fail loudly on conditions you thought of. Observability tells you something changed even when no test fired. A table that silently stopped loading passes every not-null test on yesterday's rows, but observability flags that zero rows arrived this morning.<br><br>Senior teams invest in both because bad data usually escapes through the gap between them: a real-world failure mode nobody wrote a check for.",
      followups: [
        { q: "\"Can you have great observability but poor data quality?\"", a: "Yes, and it's common. Observability tells you the data is wrong fast, but it doesn't make it correct. You still need quality checks and upstream fixes to actually improve the data." },
        { q: "\"If a team has neither, where do you start?\"", a: "Freshness and volume monitoring first, they catch the most incidents for the least effort. Then add cheap structural tests on the critical tables. Broad coverage beats deep coverage early on." },
        { q: "\"Isn't observability just monitoring with a rebrand?\"", a: "Partly, but the emphasis differs. Monitoring watches known metrics; observability adds lineage and distribution so you can explain a novel failure you didn't predict. The lineage piece is what monitoring usually lacks." }
      ]
    },
    {
      title: "Why data quality is a senior DE responsibility, not an afterthought",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Junior engineers move data. Senior engineers own whether that data can be trusted in production. As pipelines fan out, one bad upstream field corrupts dozens of downstream tables, dashboards, and ML features before anyone notices. The senior job is to design where checks live, what fails the batch versus what alerts, and how incidents get triaged — treating data reliability as a first-class SLO, the same way an SRE treats uptime.",
      noteLabel: "In practice:",
      note: "Ownership means you're accountable for trust, not just throughput. A pipeline that runs green while emitting wrong numbers is a failure, even though nothing errored.<br><br>The senior signal in an interview is framing DQ as reliability engineering: SLIs and SLOs on data, checks placed deliberately by layer, and a real incident process. Not 'I add some tests at the end.'",
      followups: [
        { q: "\"How do you convince leadership to fund DQ work?\"", a: "Frame it in business terms: revenue lost to wrong decisions, compliance exposure, and eroded stakeholder trust. Engineers care about coverage; leaders care about risk and dollars. Tie a recent incident to its cost." },
        { q: "\"Who owns data quality when it spans many teams?\"", a: "The producer owns the contract for what they emit, and each consumer owns validation of what they depend on. A central platform team owns the shared tooling and standards. Diffuse ownership without contracts is how quality rots." },
        { q: "\"What's a green pipeline that's still a failure?\"", a: "One that runs without errors but emits wrong numbers. No job failed, so nothing alerted, but a bad join silently doubled revenue. That's exactly the gap observability is meant to close." }
      ]
    },
    {
      title: "The cost of bad data — revenue, compliance, and trust",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Bad data is expensive in three ways. Revenue: wrong numbers drive wrong decisions, misbilled customers, and broken ML predictions. Compliance: in regulated domains like healthcare or finance, incorrect or leaked data means audit findings, HIPAA or PCI penalties, and legal exposure. Trust: this is the slow, compounding cost — once a stakeholder catches the dashboard being wrong once, they stop trusting all of it, and rebuilding that credibility takes far longer than the fix.",
      noteLabel: "In practice:",
      note: "Trust is the cost people underestimate. It's non-linear.<br><br>A pipeline can be 99% correct and still lose the room, because the one wrong number a VP spots poisons confidence in the other ninety-nine. After that, every report gets second-guessed and shadow spreadsheets appear.<br><br>In regulated work the stakes jump again. A completeness gap in claims data isn't just a bad metric, it's a reportable compliance issue. That's why senior DEs argue for DQ spend in business terms, not engineering ones.",
      followups: [
        { q: "\"Why is trust the most expensive cost?\"", a: "Because it's non-linear and slow to rebuild. One wrong number a VP spots poisons confidence in every other report. After that people build shadow spreadsheets and second-guess everything." },
        { q: "\"Give a concrete compliance example.\"", a: "A completeness gap in healthcare claims data isn't just a bad metric, it can be a reportable HIPAA or audit issue. In finance a reconciliation miss can mean misstated numbers. The penalty is regulatory, not just a bad dashboard." },
        { q: "\"How do you quantify the cost of a specific incident?\"", a: "Tie it to decisions made on the bad data: misbilled amounts, wasted ad spend, or engineer hours to fix and backfill. Even a rough dollar figure moves the funding conversation. Vague 'data is important' does not." }
      ]
    },
    {
      title: "Where checks belong — bronze, silver, gold",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Checks are cheapest and most valuable the earlier they run. At ingest/bronze, validate structure and freshness: did the file arrive, is the schema what we expect, is the row count sane. At transform/silver, validate business rules and referential integrity after cleaning and joins: no orphan foreign keys, amounts reconcile, enums are valid. At serve/gold, validate the contract consumers depend on: uniqueness of the reporting grain, metric totals, and freshness SLAs. The principle is shift-left — catch a problem at the boundary it entered, not three layers downstream where it's already fanned out.",
      noteLabel: "In practice:",
      note: "Match the check to the layer's job. Bronze checks are structural and cheap: existence, schema, volume, freshness. You want to reject or quarantine garbage before it costs compute.<br><br>Silver is where business logic lives, so that's where referential integrity, reconciliation, and validity checks belong.<br><br>Gold is the consumer contract: the grain is unique, the totals tie out, the data is fresh enough for the SLA. Same check family, escalating stakes as you move right.",
      followups: [
        { q: "\"Why not just put all checks at the gold layer?\"", a: "By gold the bad data has already fanned out to many tables and consumers. Catching it at bronze contains the blast radius and saves recompute. Late checks find problems after they've spread." },
        { q: "\"What check belongs at bronze but not gold?\"", a: "Raw structural checks: did the file arrive, is the schema as expected, is the row count sane. Those are about ingestion health. Gold cares about the consumer contract, like a unique reporting grain and metric totals." },
        { q: "\"Doesn't checking at every layer duplicate work?\"", a: "Some overlap is fine because each layer tests a different concern. Bronze tests structure, silver tests business rules, gold tests the contract. Duplicating the exact same check everywhere is waste; layering different checks is not." }
      ]
    },
    {
      title: "The testing pyramid for data — many cheap checks, few expensive ones",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Borrow the test pyramid from software. The wide base is many cheap, fast, high-coverage checks that run on every load: not-null, unique, accepted-values, row-count, freshness. The middle is business-rule and referential checks that need joins or aggregation, so fewer and slightly costlier. The narrow top is expensive, high-value checks: full source-to-target reconciliation, distribution/anomaly detection, cross-system control totals. Run the base constantly, the middle per pipeline, the top on a schedule or on the tables that matter most.",
      noteLabel: "In practice:",
      note: "Don't run everything everywhere, you'll blow the compute budget and slow every load.<br><br>Put the cheap structural checks on every model, every run. They're fast and catch most breakage. Reserve the expensive reconciliation and distribution scans for critical tables or a nightly cadence.<br><br>The anti-pattern is inverting the pyramid: a handful of slow, brittle end-to-end checks and no fast base. You get slow feedback and poor coverage at the same time.",
      followups: [
        { q: "\"What does an inverted pyramid look like in practice?\"", a: "A few slow end-to-end reconciliation checks and no fast structural base. You get slow feedback and thin coverage at once. Most breakage slips through because the cheap checks that would catch it don't exist." },
        { q: "\"How do you decide what goes in the expensive top tier?\"", a: "Reserve it for critical tables and run it on a schedule, not every load. Full source-to-target reconciliation and distribution scans are costly, so target financial and regulated data. Everything else lives in the cheap base." },
        { q: "\"Cheap checks are cheap, so why not run all of them everywhere?\"", a: "Even cheap checks add up across hundreds of models and slow every load. Put the structural base on everything, but scope the costly middle and top to where correctness matters. Budget compute like any other resource." }
      ]
    }
  ]
},

dimensions: {
  intro: {
    title: "DQ dimensions, test types & the tooling to enforce them",
    desc: "The vocabulary of data quality: the six dimensions every check maps to, the concrete test types, the tools that run them (dbt, Great Expectations, Soda), and the design decisions that separate senior work — fail-closed vs warn, quarantine vs drop, and why reconciliation is a different animal from validation."
  },
  cards: [
    {
      title: "The six data quality dimensions",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Most DQ frameworks converge on six dimensions. Completeness: are expected records and fields present (no missing rows, no unexpected nulls). Uniqueness: no unintended duplicates on the key. Validity: does a value conform to its format, type, and range (a valid ZIP, a date that isn't in the future). Consistency: do related values agree across tables and systems (the same customer's balance matches everywhere). Timeliness: is the data fresh enough for its use. Accuracy: does the value match reality (the hardest, because it needs a source of truth to compare against).",
      noteLabel: "In practice:",
      note: "Every concrete check maps to one of these six, and naming the dimension keeps coverage honest.<br><br>A quick gut-check per table: is anything missing (completeness), duplicated (uniqueness), malformed (validity), contradictory across sources (consistency), stale (timeliness), or just plain wrong (accuracy)?<br><br>Accuracy is the one people skip because it's the hardest, it needs an external source of truth. That's exactly why reconciliation against the source system matters.",
      followups: [
        { q: "\"Which dimension do teams most often neglect?\"", a: "Accuracy, because it's the hardest, it needs an external source of truth to compare against. Teams check format and nulls but never confirm the value matches reality. That's why reconciliation matters." },
        { q: "\"How is consistency different from accuracy?\"", a: "Consistency means related values agree across tables or systems, even if they're all wrong together. Accuracy means the value matches the real world. You can be perfectly consistent and uniformly inaccurate." },
        { q: "\"Can a value be valid but inaccurate?\"", a: "Absolutely. A birth date of 1990-01-01 is a valid date and passes format and range checks, but it's inaccurate if the person was born in 1985. Validity checks form, accuracy checks truth." }
      ]
    },
    {
      title: "Completeness, uniqueness, validity — concrete checks",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Completeness checks: not-null on required columns, row-count within an expected band, and 'did all expected partitions/dates arrive.' Uniqueness checks: unique or primary-key tests on the natural grain, and duplicate detection on composite keys. Validity checks: type/schema conformance, accepted-values for enums (status in an allowed set), regex or format checks (email, ZIP, NPI), and range checks (amount >= 0, birth date not in the future). These are the cheap, high-coverage base of the pyramid and belong on nearly every model.",
      code: "-- dbt schema test declarations (schema.yml)\nmodels:\n  - name: stg_claims\n    columns:\n      - name: claim_id\n        tests: [not_null, unique]           -- completeness + uniqueness\n      - name: status\n        tests:\n          - accepted_values:                 -- validity\n              values: ['paid','denied','pending']\n      - name: billed_amount\n        tests:\n          - dbt_utils.accepted_range:        -- validity (range)\n              min_value: 0",
      noteLabel: "In practice:",
      note: "These three cover the bulk of everyday breakage and cost almost nothing to run.<br><br>Not-null and unique on the key catch the two most common load bugs: dropped rows and fan-out from a bad join. Accepted-values catches an upstream system quietly adding a new status code.<br><br>Put them on every model as a default. The cost is negligible and the coverage is huge.",
      followups: [
        { q: "\"Why put not-null and unique on nearly every model?\"", a: "They catch the two most common load bugs cheaply: dropped rows and fan-out from a bad join. The cost to run is negligible. Making them a default gives huge coverage for almost nothing." },
        { q: "\"A unique test on the grain fails. What are the usual causes?\"", a: "Almost always a join that fanned out because a parent key wasn't unique, or a source that started sending duplicates. Check the join cardinality first. It's rarely the data itself and usually the transformation." },
        { q: "\"How do you check completeness beyond not-null?\"", a: "Row-count in an expected band, and 'did all expected partitions or dates arrive.' Not-null covers missing fields; those cover missing rows. A table can have zero nulls and still be missing half its records." }
      ]
    },
    {
      title: "Consistency, timeliness, accuracy — the harder three",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Consistency checks compare across tables or systems: referential integrity (every claim's provider_id exists in the providers dimension), and cross-source agreement (the customer count in the mart equals the count in the source). Timeliness checks assert freshness: max(loaded_at) is within the expected window, and late-arriving data is tracked as a percentage. Accuracy checks are the toughest — they need a trusted reference, so you reconcile against the source system or a control total. These sit in the middle and top of the pyramid because they need joins, aggregation, or a second system.",
      noteLabel: "In practice:",
      note: "The first three dimensions you can check on a single table. These three usually need a second thing to compare against.<br><br>Consistency means referential integrity and cross-system agreement, so it needs joins. Timeliness needs a load timestamp and an SLA to compare it to. Accuracy needs a source of truth, which is why it collapses into reconciliation.<br><br>Because they're costlier, apply them where correctness really matters: reporting grains, financial totals, regulated fields.",
      followups: [
        { q: "\"Why are these three costlier to check?\"", a: "They usually need a second thing to compare against: a joined table, a load timestamp plus an SLA, or a source of truth. Single-table checks are cheap; cross-references need joins or another system. So you scope them to what matters." },
        { q: "\"How do you check timeliness concretely?\"", a: "Compare max(loaded_at) against the expected window and alert if it's stale. Also track late-arriving data as a percentage. Freshness is the timeliness check that catches a stopped pipeline." },
        { q: "\"Referential integrity is slow on huge tables. What do you do?\"", a: "Scope it to recent partitions instead of the full history, or sample. You can also enforce it at write time with a merge that only accepts known keys. Full-table relationship tests every run get expensive fast." }
      ]
    },
    {
      title: "Test types — the standard vocabulary",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The reusable test types every DQ tool ships: schema tests (columns and types match), not-null, unique, accepted-values (enum membership), referential/relationship (FK exists in parent), row-count (volume in band), and freshness (data loaded within a window). These are declarative and generic — you point them at a column or table and they generate the check. The value is that most quality assertions are one of these, so you compose coverage from a small, well-understood set rather than hand-writing SQL for each.",
      noteLabel: "In practice:",
      note: "Reach for a generic test before writing custom SQL. Ninety percent of checks are one of these seven.<br><br>Schema and not-null and unique are your structural base. Accepted-values and range cover validity. Relationship covers referential integrity. Row-count and freshness cover volume and timeliness.<br><br>Only when a rule is genuinely business-specific — 'paid amount can't exceed billed amount' — do you drop to a custom/singular test.",
      followups: [
        { q: "\"When do you drop from generic tests to custom SQL?\"", a: "When the rule is genuinely business-specific, like 'paid amount can't exceed billed amount.' The seven generic types cover structure, validity, and referential integrity. Custom SQL is the escape hatch for real business logic." },
        { q: "\"How does a relationship test differ from a foreign key constraint?\"", a: "A relationship test runs on a schedule and reports violations without blocking writes; a DB foreign key blocks the write itself. Warehouses often don't enforce FKs, so the test is how you get referential integrity in practice." },
        { q: "\"Row-count test vs freshness, what's the difference?\"", a: "Row-count checks volume, is the data the right size. Freshness checks recency, did it arrive on time. A load can be fresh but half-sized, or full-sized but a day stale. You want both." }
      ]
    },
    {
      title: "Tooling — dbt tests, Great Expectations, Soda, custom SQL",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "dbt tests: generic tests (not-null/unique/accepted-values/relationships) declared in YAML, singular tests as a SQL query that returns failing rows, and unit tests that validate transformation logic on mock inputs. Great Expectations: expectation suites — a rich library of expectations with data docs and validation results, strong for standalone/non-dbt pipelines. Soda / Soda Core: checks written in SodaCL (a concise YAML-ish DSL), good for monitoring and alerting across warehouses. Custom SQL: the escape hatch for anything the frameworks don't express. Choice depends on stack: if you're already in dbt, its tests are the path of least resistance.",
      noteLabel: "In practice:",
      note: "Pick the tool that fits where the transformation already lives.<br><br>If the pipeline is dbt, use dbt tests, they run in the same DAG and fail the build. Great Expectations shines for Python/Spark pipelines outside dbt, with its expectation suites and generated data docs. Soda is strong when you want monitoring-style checks and alerting decoupled from the transformation tool.<br><br>All of them fall back to raw SQL for the weird business rules. Don't adopt three tools for the sake of it, standardize on one plus custom SQL.",
      followups: [
        { q: "\"When would you pick Great Expectations over dbt tests?\"", a: "When the pipeline lives outside dbt, like a Python or Spark job. GE's expectation suites and data docs shine there. If the transform is already dbt, dbt tests run in the same DAG and are the lower-friction choice." },
        { q: "\"What does Soda give you that dbt tests don't?\"", a: "Monitoring-style checks and alerting decoupled from the transformation tool, written in SodaCL. It's good when you want to watch data across warehouses independent of how it's built. dbt tests are tied to the dbt run." },
        { q: "\"Isn't adopting three tools overkill?\"", a: "Usually yes. Standardize on one framework plus custom SQL for the odd rule. Multiple tools mean multiple things to learn, maintain, and reconcile. Pick the one that fits where your transforms already live." }
      ]
    },
    {
      title: "Fail-closed vs warn, quarantine vs drop, and reconciliation",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Three design decisions define senior DQ. First, fail-closed vs warn: a blocking gate (fail-closed) stops the batch so bad data never propagates, right for critical correctness; a warn alerts but lets data flow, right for soft signals where blocking would be worse than the bad rows. Second, handling bad rows: quarantine/dead-letter isolates failing records for later inspection and replay, drop silently discards them (dangerous — you lose completeness), fail-the-batch rejects everything. Third, reconciliation is distinct from validation: validation checks a table against rules; reconciliation checks a table against another system via control totals (source count = target count, sum of amounts matches), which is the only way to prove accuracy.",
      noteLabel: "In practice:",
      note: "These are the judgment calls, not the boilerplate.<br><br>Fail-closed on anything that would corrupt downstream truth: a null primary key, a broken FK on a reporting table. Warn on soft anomalies where halting the whole pipeline causes more harm than a few odd rows.<br><br>For bad rows, quarantine beats drop almost always. Dropping silently destroys completeness and hides the problem. A dead-letter table lets you inspect, fix, and replay.<br><br>And keep reconciliation separate in your head. Validation says 'these rows follow the rules.' Reconciliation says 'we didn't lose or invent rows versus the source.' Both, always, for anything financial or regulated.",
      followups: [
        { q: "\"When would you warn instead of fail-closed?\"", a: "On soft signals where halting the whole pipeline causes more harm than a few odd rows, like a minor distribution shift. Fail-closed the things that corrupt downstream truth, like a null key. Warn the things that are merely suspicious." },
        { q: "\"Why is dropping bad rows dangerous?\"", a: "It silently destroys completeness and hides the problem. The numbers look clean while records vanish. Quarantine to a dead-letter table instead, so you can inspect, fix, and replay." },
        { q: "\"Why keep reconciliation separate from validation?\"", a: "They prove different things. Validation says the rows follow the rules; reconciliation says you didn't lose or invent rows versus the source. A table can pass every validation and still be missing half its records." }
      ]
    }
  ]
},

observability: {
  intro: {
    title: "Data observability — the five pillars, anomaly detection & SLOs",
    desc: "Observability is how you catch the failure you didn't write a test for. The five pillars, baselining vs static thresholds, the metrics worth emitting, alerting that doesn't cry wolf, the tool landscape (Monte Carlo, Bigeye, Elementary, DIY), and framing data reliability as SLIs/SLOs with an error budget."
  },
  cards: [
    {
      title: "The five pillars of data observability",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Data observability is usually framed as five pillars. Freshness: how recently the data updated, and is it within SLA. Volume: is the row count in the expected range (a sudden drop means a broken load, a spike means a duplicate). Schema: has the structure changed — a column added, dropped, or retyped upstream. Distribution/quality: are the values themselves healthy — null rates, cardinality, and metric ranges within normal bounds. Lineage: how tables connect, so when something breaks you can trace root cause upstream and impact downstream. Together they cover the failure modes that individual tests miss.",
      noteLabel: "In practice:",
      note: "The pillars are the checklist for 'what could silently go wrong that no test covers.'<br><br>Freshness and volume catch the most common silent failure: a load that stopped or a load that doubled. Schema catches upstream drift. Distribution catches a field that's technically valid but statistically wrong, like null rates jumping from 1% to 40%.<br><br>Lineage ties it together, it's what turns 'something's wrong' into 'this upstream table broke and here's what downstream is affected.'",
      followups: [
        { q: "\"Which pillar catches the most incidents?\"", a: "Freshness and volume, by a wide margin. The two most common silent failures are a pipeline that stopped and one that ran twice, and these catch both. They're also cheap to deploy broadly." },
        { q: "\"What does lineage add that the other four don't?\"", a: "It turns 'something's wrong' into 'this upstream table broke and here's the downstream impact.' The other pillars detect; lineage explains and scopes. Without it, root-cause analysis is manual guessing." },
        { q: "\"How does distribution catch what tests miss?\"", a: "It flags values that are technically valid but statistically wrong, like a null rate jumping from 1% to 40%. A not-null test passes because some values exist. Distribution notices the shape changed." }
      ]
    },
    {
      title: "Freshness and volume — the highest-signal pillars",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Freshness and volume catch more real incidents than anything else because they detect the two most common silent failures: the pipeline that stopped, and the pipeline that ran twice. Freshness monitors max(updated_at) against an expected cadence and alerts when data is stale. Volume monitors row counts per load or per partition against a normal range and alerts on drops (missing data) or spikes (duplicates, fan-out). Neither needs to understand the data's meaning, which is why they're cheap to deploy broadly and rarely produce false confidence.",
      noteLabel: "In practice:",
      note: "If you can only instrument two things, instrument these.<br><br>A stale table is invisible to row-level tests, yesterday's rows still pass not-null, but freshness catches that nothing arrived this morning. A volume drop catches a partial load before it shows up as a wrong dashboard number.<br><br>They're also the easiest to baseline, because counts and timestamps have obvious seasonal patterns you can learn.",
      followups: [
        { q: "\"Why do freshness and volume beat row-level tests for silent failures?\"", a: "A stopped load leaves yesterday's rows intact, so not-null and unique still pass. Freshness notices nothing arrived today; volume notices the count dropped. Row-level tests only see the rows that are there." },
        { q: "\"How do you set the freshness window?\"", a: "Base it on the load cadence plus a buffer for normal variance, and align it to the consumer's SLA. Hourly data might warn at 90 minutes and error at 3 hours. Too tight and it's noisy, too loose and it misses real staleness." },
        { q: "\"A volume spike fires. What's the usual cause?\"", a: "Duplicates or fan-out, often a reprocessed batch or a join that multiplied rows. A drop usually means a partial or failed load. Both are worth catching before they hit a dashboard." }
      ]
    },
    {
      title: "Anomaly detection — static thresholds vs learned baselines",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Two ways to decide 'is this abnormal.' Static thresholds are fixed rules: row count must be between 90k and 110k, freshness under 3 hours. Simple, transparent, and right for things with hard limits — but brittle when data has natural variation. Learned/seasonal baselines model the normal pattern from history and flag deviation: they understand that Monday volume differs from Sunday, and that month-end spikes are expected. Baselining reduces false positives on naturally variable metrics, at the cost of needing history and a warm-up period. Use static for hard business limits, learned baselines for metrics with seasonality and trend.",
      noteLabel: "In practice:",
      note: "Static thresholds are great until the data has a heartbeat.<br><br>A fixed row-count band screams every Monday if weekends are quiet. That's the fastest way to train people to ignore alerts. For anything seasonal — daily traffic, month-end billing — a learned baseline that knows the pattern is far quieter and catches real deviation better.<br><br>Keep static thresholds for genuine hard limits: amount can't be negative, freshness can't exceed the SLA. Use baselines for the naturally noisy stuff.",
      followups: [
        { q: "\"When is a static threshold the right choice?\"", a: "For genuine hard limits: amount can't be negative, freshness can't exceed the SLA. Those don't vary, so a fixed rule is clear and correct. Reserve learned baselines for metrics with natural seasonality." },
        { q: "\"What's the downside of learned baselines?\"", a: "They need history and a warm-up period, and they can learn a bad pattern if the training window included an incident. They're also harder to explain. Static thresholds are transparent; baselines trade transparency for fewer false alarms." },
        { q: "\"How do baselines handle a real trend, like steady growth?\"", a: "A good baseline models trend and seasonality, so gradual growth is expected and doesn't alert. A fixed band would fire constantly as the data grows. That trend-awareness is exactly why you use a baseline for growing metrics." }
      ]
    },
    {
      title: "Metrics you emit — the observability instrumentation",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Observability runs on metrics your pipelines emit every run: row counts (in, out, rejected), null rates per key column, distinct counts / cardinality, late-arrival percentage, min/max/mean of important numeric fields, and job duration. Persist these to a metrics table or metadata store so you have a time series to baseline against and to chart. The discipline is treating pipeline metadata as data itself — you can't detect an anomaly in null rate if you never recorded null rate over time.",
      noteLabel: "In practice:",
      note: "You can't observe what you never measured. Emit metrics on every run and store them.<br><br>A simple results table — run timestamp, model, row count, null rates, duration — is enough to start. That time series is what baselines and dashboards feed on.<br><br>Elementary does exactly this for dbt: it captures run results and test outcomes into tables you can monitor. If you're DIY, a metadata table plus a chart gets you most of the value cheaply.",
      followups: [
        { q: "\"What's the minimum set of metrics to start with?\"", a: "Run timestamp, model name, row count, null rates on key columns, and duration, persisted to a table. That time series is enough to baseline and chart. You can't detect a null-rate anomaly you never recorded." },
        { q: "\"Where do you store these metrics?\"", a: "A metadata or results table in the warehouse is enough to start. For dbt, Elementary captures run and test results into tables automatically. The key is persistence, so you have history to baseline against." },
        { q: "\"Why emit metrics if the tests already pass?\"", a: "Tests catch known failures; metrics catch the unknown ones by revealing trends. A null rate creeping up over weeks passes every test until it crosses a line. The time series shows the drift before it becomes a failure." }
      ]
    },
    {
      title: "Alerting that isn't noisy",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The failure mode of observability is alert fatigue — too many alerts and people mute the channel, so the one real alert is missed. Quiet alerting has four properties. Alert on deviation from baseline, not on every value, so normal variation stays silent. Dedupe and group related alerts, so one broken upstream table doesn't fire fifty downstream alarms. Route to the owner of the affected data, not a firehose channel everyone ignores. And set severity so a soft anomaly is a low-priority notice while an SLA breach pages someone. A noisy alerting system is worse than none, because it destroys trust in the signal.",
      noteLabel: "In practice:",
      note: "The goal isn't more alerts, it's alerts people act on.<br><br>Every alert that fires on normal variation is training your team to ignore the channel. Baseline-driven thresholds cut most of that noise. Deduping matters just as much: when one source table breaks, suppress the downstream cascade and alert on the root, not the fifty symptoms.<br><br>Route by ownership so the person who can fix it gets paged, and tier severity so soft signals don't wake anyone at 3am. If an alert can't be acted on, it shouldn't fire.",
      followups: [
        { q: "\"How do you stop one broken table from firing fifty alerts?\"", a: "Dedupe and group by root cause, and use lineage to suppress the downstream cascade. Alert on the upstream break, not the fifty symptoms. Otherwise the real signal drowns in noise." },
        { q: "\"What makes an alert actionable?\"", a: "It reaches the person who can fix it, says what deviated and by how much, and carries a severity that matches the impact. If nobody owns it or it can't be acted on, it shouldn't fire. Unactionable alerts train people to mute the channel." },
        { q: "\"How do you tier severity?\"", a: "Soft anomalies are low-priority notices; SLA breaches page someone. Match the noise to the stakes so a minor distribution wobble doesn't wake anyone. Mistiering everything as critical is the same as having no severity." }
      ]
    },
    {
      title: "Tooling, SLOs, and lineage-driven impact analysis",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Tools: Monte Carlo and Bigeye are managed platforms with automated ML-based anomaly detection across the five pillars, low setup but per-seat cost; Elementary is dbt-native and open-source, capturing run/test results and anomaly checks inside your dbt project; DIY builds on emitted metrics, logs, and dashboards when you want full control and no license. On top of any of them, treat data like a service: define SLIs (freshness, completeness, correctness), SLOs (targets like '99% of loads fresh within 2 hours'), and SLAs (the promise to consumers), with an error budget that governs how much unreliability is tolerable. Lineage-driven impact analysis then answers the incident question: when this table breaks, exactly what downstream reports, models, and consumers are affected.",
      noteLabel: "In practice:",
      note: "Build-vs-buy is the real question here. Managed tools like Monte Carlo give broad automated coverage fast but cost real money and can feel black-box. Elementary is the pragmatic middle for dbt shops: open-source, in your stack, versioned with your code. Full DIY is only worth it when you have unusual needs and the team to maintain it.<br><br>Whatever the tool, define SLOs so 'reliable' is measurable, not a vibe. An error budget makes the trade-off explicit.<br><br>And lineage is what makes incidents fast. When a source breaks, lineage tells you precisely which dashboards to flag and which owners to notify, before they find out the hard way.",
      followups: [
        { q: "\"When is a managed platform like Monte Carlo worth the cost?\"", a: "When the team is small, the stack is broad, and you can't spare engineers to build monitoring. You buy fast, wide coverage. The trade-off is real per-seat money and a more black-box feel." },
        { q: "\"What's the difference between an SLI, SLO, and SLA here?\"", a: "The SLI is the measurement, like freshness or completeness. The SLO is your internal target, like 99% of loads fresh within 2 hours. The SLA is the promise to consumers, usually looser, with consequences if missed." },
        { q: "\"What does an error budget do for a data team?\"", a: "It makes reliability a managed trade-off instead of a vibe. Inside budget, you ship features; burning it, reliability work takes priority. It ends the endless 'is this reliable enough' argument with a number." }
      ]
    }
  ]
},

contracts: {
  intro: {
    title: "Data contracts, SLAs & incident response",
    desc: "How senior teams make reliability enforceable rather than aspirational: data contracts guarded at the edge, SLAs that are actually monitored and escalated, RCA for data incidents, safe backfills after a bad load, and shifting detection left to the source boundary."
  },
  cards: [
    {
      title: "Data contracts — schema, semantics, freshness, volume, change policy",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A data contract is an explicit, versioned agreement between a data producer and its consumers. It specifies more than schema: the columns and types, the semantics (what each field means and its allowed values), freshness (how often it updates), volume (expected row ranges), and — critically — a change policy (how breaking changes are versioned and communicated). The point is to make the producer accountable, so an upstream team can't silently rename a column or change a unit and break every downstream consumer. The contract turns an implicit assumption into a checkable, owned commitment.",
      noteLabel: "In practice:",
      note: "A contract is the fix for 'upstream changed something and didn't tell anyone.'<br><br>Schema alone isn't enough. The semantics and the change policy are what actually prevent breakage: this field is cents not dollars, this enum won't add values without a version bump, this table updates hourly.<br><br>The hard part isn't writing the contract, it's the organizational agreement that the producer owns it. Without that ownership it's just documentation nobody honors.",
      followups: [
        { q: "\"What's the hardest part of adopting data contracts?\"", a: "The organizational agreement that the producer owns the contract, not the writing of it. Without that ownership it's just documentation nobody honors. The tech is easy; the accountability is the real work." },
        { q: "\"What goes in a contract beyond schema?\"", a: "Semantics, freshness, volume, and a change policy. Schema alone doesn't stop a unit change from cents to dollars or a silent enum addition. The semantics and change policy are what actually prevent breakage." },
        { q: "\"How does a change policy prevent breakage?\"", a: "It commits the producer to versioning and announcing breaking changes instead of shipping them silently. Consumers get warning and a migration path. That's the difference between a managed change and a 2am incident." }
      ]
    },
    {
      title: "Enforcing contracts at the edge with a schema guard",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A contract is only real if it's enforced automatically at the ingestion boundary. A schema guard validates incoming data against the contract before it enters your system: right columns, right types, freshness and volume in band. On violation it fails-closed or quarantines, so a breaking upstream change is caught at the door instead of corrupting downstream tables. dbt model contracts do this at the output boundary — the build fails if a model's columns/types don't match the declared contract. Great Expectations or a custom validator can do it at the input boundary. Either way, enforcement lives at a boundary, not in scattered downstream checks.",
      code: "# dbt model contract (schema.yml) — build fails on drift\nmodels:\n  - name: fct_claims\n    config:\n      contract: {enforced: true}\n    columns:\n      - name: claim_id\n        data_type: varchar\n        constraints: [{type: not_null}]\n      - name: paid_amount\n        data_type: numeric",
      noteLabel: "In practice:",
      note: "The contract has to be code that runs, not a wiki page.<br><br>Guard it at the boundary: validate incoming data at ingest, or enforce output shape with dbt contracts so a model that drifts from its declared schema fails the build instead of silently shipping.<br><br>The win is location. One enforced boundary beats twenty defensive checks scattered downstream, and it catches the break where it entered, not three layers later.",
      followups: [
        { q: "\"Input boundary vs output boundary enforcement, when each?\"", a: "Guard the input boundary when you ingest data you don't control, to reject bad upstream data at the door. Enforce the output boundary with dbt contracts to guarantee what you emit to consumers. Ideally you do both ends." },
        { q: "\"What does a dbt model contract actually fail on?\"", a: "The build fails if the model's output columns, types, or constraints drift from the declared contract. So an accidental column rename or type change is caught at build time, not by a downstream consumer. It's schema drift protection." },
        { q: "\"Why enforce at a boundary instead of many downstream checks?\"", a: "One enforced boundary beats twenty scattered defensive checks and catches the break where it entered. Downstream checks find the problem after it's fanned out. Fewer, well-placed guards are easier to maintain and reason about." }
      ]
    },
    {
      title: "Data SLAs — how you actually enforce them",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A data SLA is a commitment to consumers: 'the daily sales mart is fresh by 6am and 99.5% complete.' The rookie mistake is documenting an SLA and stopping there. Real enforcement is a loop: monitor the SLI continuously (is it fresh, is it complete), alert when it's at risk of breaching, escalate to the owner with a defined path, and review breaches to fix root causes. The SLA is only as good as the monitoring and escalation behind it — an unmonitored SLA is a promise you'll break silently.",
      noteLabel: "In practice:",
      note: "An SLA without monitoring is just a hope.<br><br>The enforcement is the loop, not the document. Measure the SLI on every run, alert before the breach not after, and have a real escalation path to the owner. Then review misses so the same breach doesn't recur.<br><br>Tie it to an error budget so it's a managed trade-off. If you're inside budget, ship features. If you're burning it, reliability work takes priority. That's what makes an SLA operational instead of decorative.",
      followups: [
        { q: "\"What's the most common mistake with data SLAs?\"", a: "Documenting one and stopping there, with no monitoring or escalation. An unmonitored SLA is a promise you'll break silently. The enforcement loop, not the document, is what makes it real." },
        { q: "\"What does the enforcement loop look like?\"", a: "Measure the SLI every run, alert before the breach not after, escalate to the owner on a defined path, and review misses to fix root causes. That loop is the SLA. The written target is just the reference point." },
        { q: "\"How do error budgets connect to SLAs?\"", a: "The error budget is how much breach you tolerate before reliability work takes over. Inside budget you keep shipping; over it, you stop and fix. It turns the SLA into a managed trade-off instead of a hard line." }
      ]
    },
    {
      title: "Incident response and RCA for data incidents",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Data incidents need a runbook like any production incident. The sequence: stabilize first — stop the bleed by pausing the pipeline or reverting the bad table so wrong data stops spreading. Communicate — tell affected consumers the data is suspect before they act on it. Diagnose — use lineage and metrics to find root cause upstream, not just the symptom. Preventive fix — add the check or contract that would have caught it, so it can't recur silently. Runbook — write down what happened and the resolution so the next person is faster. The senior differentiator is stabilizing and communicating before diagnosing, and always closing with a preventive control.",
      noteLabel: "In practice:",
      note: "Order matters. Stabilize and communicate before you diagnose.<br><br>The instinct is to dive straight into root cause, but every minute the bad data is live, more consumers act on it. Stop the spread first, flag the data as suspect, then investigate calmly.<br><br>And an incident isn't closed when the number is fixed. It's closed when you've added the check or contract that catches this class of failure next time, and written the runbook. A fix without a preventive control guarantees a repeat.",
      followups: [
        { q: "\"Why stabilize before diagnosing?\"", a: "Because every minute the bad data is live, more consumers act on it. Stopping the spread and flagging the data as suspect limits the damage. Root cause can wait a few minutes; a wrong decision made on live bad data can't be undone." },
        { q: "\"When is a data incident actually closed?\"", a: "When you've added the check or contract that catches this class of failure next time and written the runbook, not when the number is fixed. A fix without a preventive control guarantees a repeat." },
        { q: "\"How does lineage speed up RCA?\"", a: "It lets you trace upstream to the layer where numbers first go wrong and identify exactly which downstream consumers are affected. Without it you're manually guessing dependencies. Lineage turns a scramble into a systematic trace." }
      ]
    },
    {
      title: "Safe backfills after a DQ incident, and shifting detection left",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "After a bad load, backfilling is where you cause a second incident if you're careless. Safe backfills are idempotent — rerunnable without double-counting — which means merge-on-key (upsert) rather than blind insert, and processing scoped to the affected partitions or date range. Validate the corrected data in a staging location BEFORE releasing it to consumers, so you don't replace wrong data with different wrong data. The broader principle is shifting detection left: the cheapest place to catch a problem is the source boundary where it entered, not the downstream table where it's already fanned out to a dozen consumers.",
      noteLabel: "In practice:",
      note: "The backfill is the dangerous part, not the original bug.<br><br>Make it idempotent so a rerun can't double-count: merge on the key, scope to the affected range, don't blind-insert. Then validate the fixed data off to the side before you release it, so you don't trade one wrong answer for another.<br><br>And the meta-lesson from every data incident is the same: catch it earlier next time. A check at the source boundary is cheaper than an incident three layers downstream. Shifting left is how the same class of bug stops recurring.",
      followups: [
        { q: "\"What makes a backfill idempotent?\"", a: "You can rerun it without double-counting: merge on the key rather than blind-insert, and scope to the affected partitions. Blind inserts on a retry duplicate everything. Idempotency is what lets you rerun safely after a failure mid-backfill." },
        { q: "\"Why validate the corrected data before releasing it?\"", a: "So you don't replace wrong data with different wrong data. Stage the fix, reconcile it against the source, then release. Releasing an unvalidated backfill is how one incident becomes two." },
        { q: "\"What does shifting detection left actually save?\"", a: "Compute and blast radius. A check at the source boundary catches the problem before it fans out to a dozen downstream tables. The same bug caught three layers later costs a full backfill and an incident." }
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — DQ & observability Q&A and trade-offs",
    desc: "The spoken questions a senior DE gets on data quality and observability. Form your own answer first, then compare — the score is in the trade-off, the failure mode, and the boundary. Answers are first-person and framed on real pipeline work."
  },
  cards: [
    {
      title: "\"How do you stop bad upstream data from corrupting downstream tables?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you think in terms of boundaries and fail-closed gates, or just sprinkle tests. The interviewer wants to hear containment at the edge, blocking behavior on critical checks, and quarantine over silent drop. Bonus points for contracts and shift-left.",
      noteLabel: "Model answer:",
      note: "\"I stop it at the boundary, not downstream.<br><br>At ingest I validate incoming data against a contract: schema, freshness, volume, and key structural checks. If a critical check fails, I fail-closed so the bad batch never enters the system, or I quarantine the bad rows to a dead-letter table for inspection and replay. I never silently drop them, that destroys completeness and hides the problem.<br><br>In the transform layer I lean on the build tool's behavior. In dbt, `dbt build` interleaves tests with models and won't build a model's dependents if its tests fail. So a null primary key on staging halts the marts that depend on it, containing the blast radius.<br><br>The theme is catch it where it entered and block propagation. A contract at the edge plus fail-closed gates beats defensive checks scattered everywhere downstream.\"",
      followups: [
        { q: "\"What if the upstream team won't adopt a contract?\"", a: "Then I guard defensively at my ingestion boundary and quarantine anything that violates my expectations. I can't force their behavior, but I can refuse to let their bad data enter silently. I also escalate the pattern with data showing the cost." },
        { q: "\"Doesn't fail-closed risk halting the pipeline too often?\"", a: "Only if you fail-closed on the wrong things. Reserve blocking for checks that corrupt downstream truth, like a null primary key. Warn on soft signals. Tuned right, it blocks rarely and only when it should." },
        { q: "\"The quarantine table is filling up. What now?\"", a: "That's a signal the upstream problem is systemic, not a one-off. I investigate the pattern, fix at the source or contract, and replay the quarantined rows once corrected. A growing dead-letter table tells you to fix the root, not just drain it." }
      ]
    },
    {
      title: "\"Validation vs reconciliation — why do you need both?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand that rule-checking a table and comparing it to a source system are different guarantees. Many candidates conflate them. The senior answer names accuracy as the dimension only reconciliation can prove.",
      noteLabel: "Model answer:",
      note: "\"They answer different questions.<br><br>Validation checks a table against rules on its own: not-null, unique, valid enums, amounts in range. It proves the data is internally well-formed. But a table can pass every validation and still be wrong, because rows were silently lost or duplicated versus the source.<br><br>Reconciliation compares against another system with control totals: source row count equals target row count, sum of amounts matches end to end. That's the only way to prove accuracy and completeness against the source of truth.<br><br>On regulated claims work I ran both. Validation on every model for structure, and reconciliation against the source system for the financial totals. Validation catches malformed data. Reconciliation catches missing or invented data. You need both because they cover different failure classes.\"",
      followups: [
        { q: "\"Reconciliation is expensive. Where do you actually run it?\"", a: "On the data where accuracy is non-negotiable: financial totals and regulated fields, usually on a schedule rather than every load. Cheap validation runs everywhere; costly reconciliation is targeted. You don't reconcile every table." },
        { q: "\"What's a control total, concretely?\"", a: "An aggregate you compare across systems, like source row count equals target row count, or sum of transaction amounts matches end to end. If the totals tie out, no rows were lost or invented. It's the independent check validation can't provide." },
        { q: "\"Can automated tests replace reconciliation entirely?\"", a: "No. Tests validate a table against its own rules, but they can't confirm it matches the source without comparing to that source. Reconciliation is that comparison. They're complementary, not substitutes." }
      ]
    },
    {
      title: "\"How do you set an alert threshold that isn't noisy?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand alert fatigue and baselining. The interviewer wants deviation-from-baseline over fixed thresholds on variable data, plus dedupe, routing, and severity — the mechanics of a signal people actually act on.",
      noteLabel: "Model answer:",
      note: "\"The enemy is alert fatigue, so I design for a signal people act on.<br><br>For anything with natural variation I alert on deviation from a learned baseline, not a fixed value. A static row-count band fires every Monday if weekends are quiet, and that trains people to mute the channel. A baseline that knows the weekly and month-end pattern stays quiet on normal swings and flags real deviation.<br><br>I keep static thresholds only for hard limits: amount can't be negative, freshness can't exceed the SLA.<br><br>Then I dedupe and route. When one upstream table breaks I alert on the root, not the fifty downstream symptoms, and I route to the data's owner with a severity tier so soft anomalies are notices and SLA breaches actually page. If an alert can't be acted on, it shouldn't fire.\"",
      followups: [
        { q: "\"How do you handle a metric with no history to baseline?\"", a: "Start with a conservative static threshold and let it collect history, then switch to a learned baseline once there's enough. You can also borrow a pattern from a similar existing metric. Don't wait for perfect, start rough and tighten." },
        { q: "\"How do you measure whether your alerting is too noisy?\"", a: "Track the alert-to-action ratio. If most alerts get acknowledged and closed without action, they're noise. A healthy system has few alerts and most lead to a real fix. Muted channels are the clearest failure signal." },
        { q: "\"An alert fired but it was actually expected, like a holiday. What do you do?\"", a: "Feed that context into the baseline so it learns the pattern, or add a known-exception window. One expected-event false positive is fine; repeating it every holiday is a tuning failure. The system should learn recurring events." }
      ]
    },
    {
      title: "\"A dashboard shows wrong numbers. Walk me through finding the cause.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Your incident-response instinct and whether you use lineage to trace upstream systematically. They want stabilize-and-communicate before deep diagnosis, then a layer-by-layer trace, then a preventive fix — not random poking.",
      noteLabel: "Model answer:",
      note: "\"First I stabilize and communicate, before I dive into diagnosis.<br><br>I flag the dashboard as suspect so stakeholders stop acting on it, because every minute it's trusted, wrong decisions get made. Then I trace with lineage, working upstream layer by layer. Is the gold mart wrong, or is it faithfully reporting a wrong silver table? I check freshness and volume first, those catch the most common cause, a partial or stale load. Then schema drift and distribution: did a column change upstream, did null rates jump.<br><br>I isolate the layer where the numbers first go wrong, that's the root, everything below is a symptom.<br><br>Once I find it I fix the data, then I close the loop by adding the check or contract that would have caught it, plus a runbook note. An incident isn't done when the number's right, it's done when this class of failure can't recur silently.\"",
      followups: [
        { q: "\"The mart is wrong but silver looks fine. Where do you look?\"", a: "The transformation between silver and gold: the join, the aggregation, or a filter in the mart model. If silver reconciles and gold doesn't, the bug is in that last step. Isolate the layer where numbers first diverge." },
        { q: "\"How do you tell a data bug from a definition mismatch?\"", a: "Check whether the stakeholder's expected number uses the same definition as the pipeline. Often the data is right and the metric definition differs. Confirm the definition before assuming a data bug, it saves a lot of wasted investigation." },
        { q: "\"How do you prevent this exact incident from recurring?\"", a: "Add the check that would have caught it, whether a reconciliation on the mart total or a distribution monitor, and write it into the runbook. The incident isn't closed until that preventive control exists. Otherwise it just happens again." }
      ]
    },
    {
      title: "\"What are the pillars of data observability?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you know the framework and, more importantly, why each pillar exists and which ones catch the most incidents. Reciting five words is junior; explaining what each catches is senior.",
      noteLabel: "Model answer:",
      note: "\"Five pillars: freshness, volume, schema, distribution, and lineage.<br><br>Freshness is how recently the data updated versus its SLA. Volume is whether row counts are in the expected range, a drop means a broken load, a spike means duplicates. Schema is structural drift, a column added, dropped, or retyped upstream. Distribution is whether the values themselves are healthy, null rates, cardinality, and metric ranges. Lineage is how tables connect, so I can trace root cause upstream and impact downstream.<br><br>If I had to rank them, freshness and volume catch the most real incidents, because the two most common silent failures are a pipeline that stopped and one that ran twice.<br><br>The point of the framework is coverage of the failure modes individual tests miss, the things nobody wrote a check for.\"",
      followups: [
        { q: "\"If you could only instrument two pillars, which and why?\"", a: "Freshness and volume. They catch the two most common silent failures, a stopped load and a doubled load, for very little effort. They also need no understanding of the data's meaning, so they deploy broadly." },
        { q: "\"How do the pillars relate to the six DQ dimensions?\"", a: "They overlap but come from different angles. The dimensions describe what correct data looks like; the pillars describe what to monitor to know when it changes. Freshness maps to timeliness, volume to completeness, distribution to validity and accuracy." },
        { q: "\"Which pillar is hardest to implement well?\"", a: "Lineage, especially column-level across tools and systems. Freshness and volume are simple counts and timestamps; lineage requires parsing dependencies everywhere. It's also the highest-value for incident response, which is why managed tools compete on it." }
      ]
    },
    {
      title: "\"Build vs buy for data observability tooling?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you reason about trade-offs and team context instead of naming a favorite tool. They want cost, coverage, maintenance, and fit-to-stack weighed honestly, with a defensible recommendation.",
      noteLabel: "Model answer:",
      note: "\"It depends on team size, budget, and stack, and I'd frame it that way.<br><br>Buy — Monte Carlo or Bigeye — gives broad automated anomaly detection across all five pillars with low setup. The cost is real per-seat money and some black-box feel. It's worth it when the team is small, the stack is broad, and you can't spare engineers to build monitoring.<br><br>Build DIY on emitted metrics and dashboards gives full control and no license, but it's a real product to maintain. I'd only do it for unusual needs and a team that can own it.<br><br>For most dbt shops I'd start with Elementary, the pragmatic middle. It's open-source, lives in the dbt project, versions with the code, and captures run and test results for anomaly checks. My recommendation: start with the native, low-cost option, and only buy a platform when coverage gaps or scale justify the spend.\"",
      followups: [
        { q: "\"What's the risk of DIY observability?\"", a: "It's a real product to build and maintain, and it competes with your actual pipeline work. Teams underestimate the ongoing upkeep. I'd only DIY for unusual needs and a team that can own it long-term." },
        { q: "\"Why start with Elementary for a dbt shop?\"", a: "It's open-source, lives in the dbt project, versions with the code, and captures run and test results for anomaly checks. Low cost, low friction, no new platform. You can graduate to a managed tool when coverage gaps justify it." },
        { q: "\"What would trigger a move from open-source to a paid platform?\"", a: "Coverage gaps or scale the open-source tool can't handle: broad multi-warehouse lineage, ML-based anomaly detection, or maintenance outgrowing the team. When the platform's cost is less than the engineering time you're spending, you buy." }
      ]
    },
    {
      title: "\"How do you prove data is trustworthy to a skeptical stakeholder?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you can translate technical reliability into stakeholder-facing evidence and rebuild trust. This is a communication-and-ownership question as much as a technical one. They want tests, reconciliation, SLAs, and transparency.",
      noteLabel: "Model answer:",
      note: "\"Trust is earned with evidence and transparency, not assertions.<br><br>Concretely, I show the checks that run on every load — completeness, uniqueness, validity — and the reconciliation against the source system that proves the totals tie out. That last one usually lands hardest with a skeptic, because it's an independent comparison, not my pipeline grading its own homework.<br><br>Then I point to the SLAs and observability: freshness and volume monitored continuously, with alerting, so if something breaks we know before they do and we tell them.<br><br>And I'm transparent about incidents. When something was wrong, I say so, show the fix and the new check that prevents recurrence. Skeptics trust a team that catches and communicates its own problems far more than one that claims perfection. Trust compounds from that honesty over time.\"",
      followups: [
        { q: "\"The stakeholder still doesn't believe the numbers. What next?\"", a: "I walk them through a reconciliation live, comparing my output to their source of truth so they see the totals tie out independently. Showing the check beats asserting the result. If it still diverges, we've found a real gap to fix together." },
        { q: "\"How do you rebuild trust after a public incident?\"", a: "Be transparent: acknowledge it, show the fix, and show the new check that prevents recurrence. Skeptics trust a team that catches and communicates its own problems far more than one claiming perfection. Consistency over time rebuilds it." },
        { q: "\"Why does reconciliation land better than validation with a skeptic?\"", a: "Because it's an independent comparison, not my pipeline grading its own homework. Validation says my rules passed; reconciliation says my numbers match your source. The second is far more convincing to someone who doesn't trust the pipeline." }
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What is the core distinction between data quality and data observability?",
    options: [
      "Quality is for batch pipelines, observability is for streaming",
      "Quality is whether the data is correct; observability is whether you'd know when it isn't",
      "They are two names for the same set of tests",
      "Quality is done by analysts, observability by engineers"
    ],
    correct: 1
  },
  {
    q: "A table loaded fine yesterday but received zero rows this morning. All row-level not-null and unique tests still pass on the existing rows. Which observability pillar catches this?",
    options: [
      "Schema",
      "Distribution",
      "Freshness/volume",
      "Lineage"
    ],
    correct: 2
  },
  {
    q: "Which DQ dimension can generally only be proven by reconciliation against a source of truth?",
    options: [
      "Uniqueness",
      "Validity",
      "Completeness within a single table",
      "Accuracy"
    ],
    correct: 3
  },
  {
    q: "A critical pipeline hits a batch with null primary keys. What is the appropriate senior handling for the bad rows?",
    options: [
      "Silently drop them so the pipeline keeps running",
      "Fail-closed or quarantine to a dead-letter table for inspection and replay",
      "Warn and let all rows through unchanged",
      "Cast the nulls to a default value automatically"
    ],
    correct: 1
  },
  {
    q: "You keep getting false-alarm alerts every Monday because weekend volume is naturally low. What's the best fix?",
    options: [
      "Raise the static row-count threshold high enough that nothing fires",
      "Alert on deviation from a learned seasonal baseline instead of a fixed band",
      "Turn off volume monitoring on weekends",
      "Route all alerts to a channel and let people filter manually"
    ],
    correct: 1
  },
  {
    q: "What does an enforced dbt model contract protect against?",
    options: [
      "SQL injection in downstream queries",
      "Warehouse compute cost overruns",
      "Silent schema drift — the build fails if the model's output columns/types/constraints don't match the declared contract",
      "Slow-running incremental models"
    ],
    correct: 2
  },
  {
    q: "A dashboard is showing wrong numbers in production. What should a senior DE do FIRST?",
    options: [
      "Rewrite the SQL to guess at the fix",
      "Stabilize and communicate — flag the data as suspect so stakeholders stop acting on it, before deep diagnosis",
      "Backfill the entire table immediately with a blind insert",
      "Wait to see if the numbers correct themselves on the next run"
    ],
    correct: 1
  }
];
