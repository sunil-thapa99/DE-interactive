// Content data for the dbt module — full standalone, basic -> advanced, senior-DE interview focus.
// All follow-ups use the answered { q, a } format. Examples lean on healthcare claims (Cedar Gate)
// and finance/transaction (Amex) to match the resume.
const MODULE_ID = "dbt";
const CONTENT = {

overview: {
  intro: {
    title: "dbt — the transformation layer of the modern data stack",
    desc: "dbt (data build tool) is how you do the 'T' in ELT: SQL SELECTs plus software-engineering discipline — version control, testing, documentation, and a dependency DAG — that turn raw warehouse tables into trustworthy models. This module goes basic to advanced with the exact things a senior interview probes: ref/source and the DAG, materializations, incremental models, testing, snapshots, Jinja/macros, project layering, deployment/CI, and governance. Examples use claims and transaction data to match real pipelines."
  },
  cards: [
    {
      title: "What dbt is — and what it deliberately is NOT",
      badge: "fundamentals",
      conceptLabel: "The core idea:",
      concept: "dbt transforms data ALREADY IN your warehouse (Snowflake, BigQuery, Redshift, Databricks) — it does not extract or load, and it does not have its own compute. You write models as SQL SELECT statements; dbt wraps each in the right DDL (CREATE TABLE/VIEW), works out the dependency order from how models reference each other, and runs the SQL IN the warehouse (pushdown). On top of raw SQL it adds what analytics work usually lacks: version control, a testable dependency graph, automated data tests, generated documentation and lineage, and environments. So dbt = SQL + software engineering, executed by your warehouse.",
      navLabel: "Why interviewers open here:",
      nav: "They want to hear that dbt is transform-only and warehouse-pushdown — a common misconception is that dbt 'processes' data itself. It doesn't; it compiles SQL and orchestrates its execution in the warehouse. Getting this right frames everything else (cost lives in the warehouse, not dbt; scale is the warehouse's problem).",
      noteLabel: "Model answer:",
      note: "\"dbt is the transformation layer — the T in ELT. It doesn't extract, load, or have its own compute; it takes SQL SELECTs I write, wraps them in the correct DDL, figures out the run order from the dependency graph, and pushes that SQL down to the warehouse to execute. What it adds over raw SQL scripts is engineering discipline: models under version control, a testable DAG, automated data tests, generated docs and lineage, and dev/prod environments. So the mental model is SQL plus software engineering, run by the warehouse — which also means cost and scale are warehouse concerns, and dbt's job is correctness, dependency management, and testability.\"",
      followups: [
        { q: "\"Does dbt process the data itself? Where does the compute happen?\"", a: "No — dbt compiles your SQL and issues it to the warehouse, which does all the compute (pushdown). dbt itself just templates SQL and orchestrates run order; that's why warehouse choice, not dbt, governs performance and cost." },
        { q: "\"So dbt is only the T — what does the E and L?\"", a: "Separate tools: ingestion/loading (Fivetran, Airbyte, custom loaders, Kafka sinks, COPY) land raw data in the warehouse, then dbt transforms it in place. dbt assumes the data is already there." },
        { q: "\"What does dbt give you that a folder of .sql scripts run by cron doesn't?\"", a: "Automatic dependency ordering via ref(), data tests, generated docs/lineage, environment portability (dev vs prod without editing SQL), incremental materializations, and reproducible runs — the engineering scaffolding raw scripts lack." }
      ]
    },
    {
      title: "dbt Core vs dbt Cloud, and the analytics-engineering role",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "dbt CORE is the open-source CLI — free, you run it yourself (locally, in Airflow, in CI). dbt CLOUD is the managed SaaS on top: a hosted IDE, a job scheduler, CI integrations, hosted docs, an API, and the semantic layer — you pay for convenience and orchestration you'd otherwise build. Many shops run Core in their own orchestrator (Airflow) to avoid Cloud cost; others adopt Cloud for the scheduler and CI. The 'analytics engineer' is the role dbt created — someone who applies software-engineering practice to SQL transformations, sitting between data engineers (pipes/infra) and analysts (consumption).",
      noteLabel: "Model answer:",
      note: "\"dbt Core is the free open-source CLI I run myself — locally, in CI, or triggered from Airflow. dbt Cloud is the managed layer on top: hosted scheduler, IDE, CI, docs, API, and the semantic layer. The decision is build-vs-buy the orchestration: if I already run Airflow, Core-in-Airflow avoids Cloud's per-seat cost; if I want a turnkey scheduler and CI without building it, Cloud earns its price. As for the role, dbt created 'analytics engineering' — applying engineering discipline (version control, tests, modularity) to the transformation layer, bridging the DE who owns ingestion/infra and the analyst who consumes marts.\"",
      followups: [
        { q: "\"You already run Airflow. Do you need dbt Cloud?\"", a: "Not necessarily — you can run dbt Core as a task in Airflow (via BashOperator or a tool like Cosmos) and get scheduling for free. Cloud adds a hosted IDE, managed CI, docs, and the semantic layer; worth it if you value those over building them, but Core-in-Airflow is a common cost-conscious choice." },
        { q: "\"What's the difference between a data engineer and an analytics engineer here?\"", a: "The DE owns ingestion, infrastructure, and the pipes; the analytics engineer owns the transformation layer — clean, tested, documented models on top of raw data. In smaller teams one person does both; dbt is the analytics engineer's primary tool." },
        { q: "\"How do you run dbt Core in production without dbt Cloud?\"", a: "Trigger `dbt build`/`dbt run` + `dbt test` from an orchestrator (Airflow, a container in CI/CD, a scheduled job), against a prod target/profile, with artifacts and logs captured. Cloud just packages the scheduler, CI, and docs hosting around the same commands." }
      ]
    }
  ]
},

models: {
  intro: {
    title: "Models, ref(), sources & the DAG",
    desc: "The heart of dbt: a model is a SELECT, ref() and source() wire models together into a dependency graph dbt runs in order, and materializations decide how each model becomes a warehouse object. Get these right and everything else follows."
  },
  cards: [
    {
      title: "Models & ref() — the dependency graph",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A model is a single .sql file containing one SELECT; its filename is the resulting object's name. Models reference each other with `{{ ref('other_model') }}` instead of hardcoding a table name — and that ref() is the magic: dbt builds a DAG from all the refs, so it knows to build upstream models before downstream ones, and it can run independent branches in parallel. ref() also makes the SQL environment-portable — in dev it resolves to your dev schema, in prod to prod — because you never wrote a literal database.schema.table. The DAG is the whole value proposition: correct ordering and parallelism, derived from the code.",
      code: "-- models/marts/claims_by_provider.sql\nselect\n  provider_id,\n  count(*)        as claim_count,\n  sum(amount)     as total_amount\nfrom {{ ref('stg_claims') }}      -- dbt builds stg_claims first, resolves the schema per env\nwhere status = 'paid'\ngroup by provider_id",
      noteLabel: "Model answer:",
      note: "\"A model is one .sql file with one SELECT, named after the object it produces. The critical habit is referencing upstream models with ref() rather than a literal table name — dbt reads every ref() to build the dependency DAG, so it runs models in the correct order and parallelizes independent branches automatically. ref() also gives environment portability: the same code resolves to my dev schema in dev and prod in prod, because I never hardcoded the location. So the DAG isn't something I maintain by hand — it's derived from the refs in my SQL, which is exactly why dbt beats a pile of ordered scripts.\"",
      followups: [
        { q: "\"Why use ref() instead of just writing the schema.table name?\"", a: "ref() lets dbt build the dependency graph (so it orders and parallelizes runs) AND makes the SQL environment-portable — it resolves to dev or prod schema automatically. Hardcoding a table name breaks both: no dependency tracking and no dev/prod separation." },
        { q: "\"How does dbt decide what to build first and what can run in parallel?\"", a: "From the ref()/source() graph: a model runs only after everything it refs is built, and independent branches (models with no dependency between them) run concurrently up to the thread count. The order is computed from the DAG, not declared manually." },
        { q: "\"You change one model. How do you build just it and its downstream?\"", a: "Node selection: `dbt build --select my_model+` builds it and everything downstream; `+my_model` includes upstream; `my_model+` downstream. This is the basis of efficient CI and targeted reruns." }
      ]
    },
    {
      title: "sources() — declaring and testing raw inputs",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Raw tables loaded by your EL tool are declared as SOURCES in a .yml file, then referenced with `{{ source('group','table') }}`. This does three things: it puts the raw tables on the DAG (so lineage starts at the true origin), it lets you test and document raw data at the edge, and it enables SOURCE FRESHNESS checks — dbt can verify the raw data isn't stale (loaded within an expected window) and fail/warn if the upstream load is late. Staging models are the only layer that should read from source(); everything downstream refs staging.",
      code: "# models/staging/_sources.yml\nsources:\n  - name: raw_claims\n    freshness:                     # alert if the load is stale\n      warn_after:  {count: 12, period: hour}\n      error_after: {count: 24, period: hour}\n    loaded_at_field: _loaded_at\n    tables:\n      - name: claims\n      - name: providers\n# usage in a staging model:  from {{ source('raw_claims', 'claims') }}",
      noteLabel: "Model answer:",
      note: "\"I declare every raw input as a source in YAML and reference it with source(), so the raw tables appear at the start of the lineage graph and I can test and document data at the edge — catching a bad upstream feed before it propagates. Sources also give me freshness checks: dbt compares a loaded-at timestamp against a threshold and warns or errors if the upstream load is late, which is how I detect a broken ingestion before my models run on stale data. My convention is that only staging models read from source(); everything else refs staging, so there's exactly one place raw is renamed and cleaned.\"",
      followups: [
        { q: "\"What does source freshness actually check, and why is it useful?\"", a: "It compares a loaded_at timestamp on the raw table against warn/error thresholds, so `dbt source freshness` flags when upstream loading is late or stalled — you catch a broken EL job before transforming stale data, rather than silently reporting old numbers." },
        { q: "\"Why should only staging models select from source()?\"", a: "It gives one controlled boundary where raw is renamed, cast, and lightly cleaned. If marts read source() directly you'd duplicate cleaning logic and lose the single point where upstream schema quirks are absorbed — staging is the anti-corruption layer." },
        { q: "\"How is source() different from ref()?\"", a: "source() points at raw tables loaded by external tools (not built by dbt); ref() points at models dbt builds. Both add to the DAG, but source marks graph roots (with freshness/tests) while ref marks dbt-managed dependencies." }
      ]
    },
    {
      title: "Materializations — view, table, incremental, ephemeral",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A materialization is HOW a model becomes a warehouse object. VIEW (default): no storage, always fresh, recomputed on every query — good for light staging. TABLE: rebuilt fully on each run, fast to query, costs compute to rebuild — good for marts queried often. INCREMENTAL: only processes new/changed rows and appends/merges them, avoiding a full rebuild — essential for large fact tables. EPHEMERAL: not built at all; inlined as a CTE into downstream models — good for small reusable logic you don't want cluttering the warehouse. The choice is a cost/freshness/latency trade, set per model in config.",
      code: "-- per-model config chooses the materialization\n{{ config(materialized='table') }}         -- rebuilt each run\n{{ config(materialized='view') }}          -- no storage, recomputed on read\n{{ config(materialized='incremental') }}   -- only new/changed rows\n{{ config(materialized='ephemeral') }}     -- inlined as a CTE, no object created",
      noteLabel: "Model answer:",
      note: "\"Four main ones, chosen per model. Views cost no storage and are always current but recompute on every read — fine for thin staging. Tables are rebuilt fully each run: fast reads, but you pay to rebuild, so I use them for marts that are queried far more than they're built. Incremental only processes new or changed rows and merges them — the one that matters at scale, because rebuilding a billion-row claims fact nightly is wasteful. Ephemeral isn't built at all; it's inlined as a CTE, good for small shared logic I don't want as a warehouse object. The decision is always freshness vs build-cost vs query-latency, and I default views for staging, tables for small marts, incremental for big facts.\"",
      followups: [
        { q: "\"When do you pick a view over a table?\"", a: "When storage/rebuild cost matters more than query speed and the logic is light — typically staging models, or marts queried rarely. Views are always fresh and free to store but pay compute on every read, so they're wrong for heavy, frequently-queried models." },
        { q: "\"A 2-billion-row fact table is rebuilt as a table every night and it's slow/expensive. Fix?\"", a: "Switch it to incremental so each run processes only new/changed rows and merges them, instead of a full rebuild. That's the primary lever for large facts — turning an O(all-history) rebuild into O(new data)." },
        { q: "\"What's the downside of ephemeral models?\"", a: "They're inlined as CTEs into every downstream model, so they can't be queried or tested as standalone objects, they can bloat compiled SQL, and debugging is harder. Use them only for small, simple reusable logic — not for anything you'd want to inspect or test directly." }
      ]
    }
  ]
},

incremental: {
  intro: {
    title: "Incremental models — the senior-level topic",
    desc: "Incremental models are where dbt performance and correctness questions concentrate. Processing only new/changed data is easy to get subtly wrong — late-arriving records, updates, dedup — so interviewers dig into is_incremental, the strategies, unique_key, and full-refresh."
  },
  cards: [
    {
      title: "How incremental models work — is_incremental() & unique_key",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "An incremental model runs one of two ways. On the FIRST run (or --full-refresh) it builds the whole table. On subsequent runs, the `{% if is_incremental() %}` block adds a filter so it only reads NEW source rows — typically `where updated_at > (select max(updated_at) from {{ this }})`, where `this` is the model's own existing table. Those new rows are then applied per the strategy. `unique_key` is what makes it handle UPDATES: with a unique_key, dbt MERGEs (updates matching rows, inserts new) instead of blind-appending — so a changed record updates in place rather than duplicating. Without a unique_key it's append-only.",
      code: "{{ config(materialized='incremental', unique_key='claim_id') }}\nselect claim_id, provider_id, status, amount, updated_at\nfrom {{ source('raw_claims', 'claims') }}\n{% if is_incremental() %}\n  -- only rows newer than what we've already loaded (with a small lookback for late data)\n  where updated_at > (select dateadd('hour', -3, max(updated_at)) from {{ this }})\n{% endif %}",
      noteLabel: "Model answer:",
      note: "\"On the first run it builds fully; after that, the is_incremental() block adds a predicate so it only reads source rows newer than the max timestamp already in the table (`this`). The subtle part is unique_key: with it, dbt MERGEs the new rows — updating existing keys, inserting new ones — so an updated claim reconciles in place instead of creating a duplicate; without it, it's append-only and updates would double the row. I also add a small lookback window on the filter so late-arriving records within a few hours aren't missed, and I periodically full-refresh to correct any drift. That combination — incremental filter, unique_key merge, lookback — is what makes it both fast and correct.\"",
      followups: [
        { q: "\"What does unique_key change, concretely?\"", a: "It switches the load from append-only to a merge/upsert on that key: matching rows are updated, new rows inserted. So a re-sent or updated record reconciles in place instead of duplicating — which is what makes the model idempotent for changing data." },
        { q: "\"A record's timestamp is updated AFTER your last run's max. Does your filter catch it?\"", a: "If the update bumps updated_at above the stored max, yes. The risk is late-arriving data with an OLD event time but landing after the run — that's why I use a lookback window (max minus N hours) on the filter, and periodically --full-refresh to catch anything that still slipped through." },
        { q: "\"Why not just always full-refresh — it's simpler?\"", a: "Cost and time: rebuilding a huge fact from all history every run wastes warehouse compute and blows the run window. Incremental trades a bit of complexity (correctly handling new/updated/late rows) for processing only the delta, which at scale is the difference between minutes and hours." }
      ]
    },
    {
      title: "Incremental strategies — merge, append, delete+insert, insert_overwrite",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The `incremental_strategy` config controls HOW new rows are applied, and support varies by warehouse. MERGE (default on Snowflake/BigQuery/Databricks): upsert on unique_key — updates and inserts atomically. APPEND: just insert new rows, no update — fastest, only correct for immutable event data. DELETE+INSERT: delete matching keys then insert — an alternative to merge on warehouses/cases where merge is costly. INSERT_OVERWRITE (BigQuery/Spark): replace whole partitions — ideal for partitioned data where you reprocess entire days idempotently. Choosing wrong is a correctness or cost bug: append on mutable data duplicates; merge on huge tables can be expensive if not partition-pruned.",
      noteLabel: "Model answer:",
      note: "\"incremental_strategy decides how the delta lands. Merge is the default upsert on unique_key — right for mutable data like claims that get updated. Append is insert-only, fastest, but ONLY correct for immutable events where nothing is ever updated — using it on mutable data silently duplicates. Delete+insert deletes matching keys then inserts, an option when merge is expensive. Insert_overwrite replaces whole partitions, which is the cleanest idempotent pattern for partitioned data — reprocess a day's partition and it atomically replaces it, no dedup needed. I pick based on whether data is mutable and how it's partitioned, and I make sure a merge or overwrite is pruned to a partition so it doesn't scan the whole table.\"",
      followups: [
        { q: "\"When is append the right strategy, and when is it a bug?\"", a: "Right for truly immutable event/log data that's only ever inserted. A bug for anything that gets updated (claims, orders, customers) — append can't update, so a resent/changed record becomes a duplicate row. Mutable data needs merge or delete+insert." },
        { q: "\"What makes insert_overwrite attractive for partitioned data?\"", a: "It replaces entire partitions atomically, so reprocessing a day just overwrites that day's partition — no unique_key, no dedup, and it's naturally idempotent. Ideal when data arrives/reprocesses by partition (e.g. daily) on BigQuery/Spark." },
        { q: "\"A merge-based incremental on a huge table is slow/expensive. What do you check?\"", a: "Whether the merge is pruned — the target should be constrained to recent partitions (via a partition predicate / cluster key), so the MERGE rewrites a small slice, not the whole table. An unpruned merge scans everything and is the usual cause of expensive incrementals." }
      ]
    }
  ]
},

tests: {
  intro: {
    title: "Testing — data tests, unit tests & quality gates",
    desc: "Testing is dbt's headline feature and a guaranteed interview topic — especially for someone whose resume features validation/reconciliation. Generic tests, singular tests, custom tests, unit tests (newer), and how severity/thresholds turn tests into real quality gates."
  },
  cards: [
    {
      title: "Generic (schema) tests — not_null, unique, accepted_values, relationships",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "dbt ships four built-in generic tests you declare in YAML on a column: NOT_NULL, UNIQUE, ACCEPTED_VALUES (value is in a set), and RELATIONSHIPS (every value exists in a parent table — referential integrity). Each compiles to a SQL query that returns FAILING rows; the test passes if it returns zero. They run with `dbt test` (or as part of `dbt build`), so every run validates keys, enums, and foreign keys automatically. This is how you assert the data contract on every model cheaply — a null primary key or an orphaned foreign key fails the run instead of silently corrupting a report.",
      code: "# models/marts/_marts.yml\nmodels:\n  - name: fct_claims\n    columns:\n      - name: claim_id\n        tests: [not_null, unique]\n      - name: status\n        tests:\n          - accepted_values: {values: ['submitted','paid','denied']}\n      - name: provider_id\n        tests:\n          - relationships: {to: ref('dim_provider'), field: provider_id}",
      noteLabel: "Model answer:",
      note: "\"The four built-ins cover most contract checks: not_null and unique on keys, accepted_values for enums like claim status, and relationships for referential integrity — every provider_id in the fact must exist in the provider dimension. Each compiles to a query returning failing rows, and the test passes only if that's empty, so `dbt test` (or `dbt build`) validates the whole contract on every run. This is the cheap, declarative version of the validation framework I built at Cedar Gate — instead of a separate reconciliation job, a null key or an orphaned foreign key fails the dbt run before bad data reaches reporting.\"",
      followups: [
        { q: "\"How does a dbt test actually determine pass/fail?\"", a: "Each test compiles to a SELECT that returns the FAILING rows; the test passes if that query returns zero rows. So `unique` returns duplicated keys, `not_null` returns null rows — non-empty means failure, and you can inspect exactly which rows broke it." },
        { q: "\"What does the relationships test protect against?\"", a: "Referential integrity — it fails if any value in the child column has no match in the referenced parent, catching orphaned foreign keys (e.g. a claim pointing at a provider_id that doesn't exist), which would otherwise silently drop rows in downstream joins." },
        { q: "\"Do these tests run before or after the model is built?\"", a: "After — the test queries the built model/table. With `dbt build` dbt interleaves: it builds a model, tests it, and (by default) won't build downstream models if an upstream test fails, so bad data is caught before it propagates." }
      ]
    },
    {
      title: "Singular & custom generic tests + severity/thresholds",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "When the built-ins aren't enough: a SINGULAR test is just a .sql file in tests/ containing a query that returns rows that SHOULD NOT exist (e.g. claims where paid_amount > billed_amount) — if it returns any, it fails. A CUSTOM GENERIC test is a reusable, parameterized test macro you can apply to many columns (like the built-ins). Both support SEVERITY: warn vs error, and thresholds (`error_if`, `warn_if`) so a handful of bad rows warns but a flood errors — turning a binary check into a tolerance band. This is how you encode business rules and reconciliation logic as tests, not just structural checks.",
      code: "-- tests/assert_paid_not_over_billed.sql  (singular test: rows here = failure)\nselect claim_id\nfrom {{ ref('fct_claims') }}\nwhere paid_amount > billed_amount\n\n# or with a tolerance band in YAML:\ntests:\n  - not_null:\n      config: {severity: warn, warn_if: '>10', error_if: '>100'}",
      noteLabel: "Model answer:",
      note: "\"For business rules I use singular tests — a SQL file that selects the rows that must not exist, like claims where paid exceeds billed; any rows returned fail the run. For a rule I want to reuse across models I write a custom generic test macro, parameterized like the built-ins. And I use severity and thresholds so tests reflect reality: a strict error on a null primary key, but a warn-with-threshold on softer checks — warn if more than a handful of rows violate, error only past a larger bound. That's how I express the reconciliation logic from my healthcare work as tests: cross-field and cross-table business rules, gated with tolerances instead of brittle all-or-nothing checks.\"",
      followups: [
        { q: "\"Singular vs custom generic test — when each?\"", a: "Singular for a one-off rule specific to one model (a SQL file selecting bad rows). Custom generic when you want to reuse a parameterized rule across many columns/models, like the built-ins — you write it once as a test macro and apply it in YAML wherever needed." },
        { q: "\"Why would you set a test to 'warn' instead of 'error'?\"", a: "For soft checks where some violations are tolerable/expected, so you monitor without blocking the pipeline. Combined with warn_if/error_if thresholds, you get a band: warn on a few bad rows, error only when it crosses a level that indicates a real problem." },
        { q: "\"How do you express a cross-table reconciliation as a dbt test?\"", a: "A singular test joining the two models and selecting mismatches — e.g. billed rows with no matching paid record beyond a tolerance. It returns the reconciliation exceptions; zero rows passes, and you can set a threshold for acceptable mismatch levels." }
      ]
    },
    {
      title: "Unit tests — testing model LOGIC on mock inputs",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Data tests check the DATA in a built model; UNIT TESTS (added in dbt 1.8) check the model's LOGIC against fixed mock inputs and an expected output — like a pytest for SQL. You provide given rows for the model's refs/sources and the expected result, and dbt runs the model's transformation on that mock data and asserts it matches. This catches logic bugs (a wrong CASE, a bad join, an off-by-one in a window) at build time with no dependence on real data — the piece SQL transformation testing always lacked. Data tests + unit tests together mirror the runtime-DQ + code-test split of any pipeline.",
      code: "# models/_unit_tests.yml\nunit_tests:\n  - name: test_denial_flag\n    model: fct_claims\n    given:\n      - input: ref('stg_claims')\n        rows:\n          - {claim_id: 1, status: 'denied', amount: 100}\n          - {claim_id: 2, status: 'paid',   amount: 50}\n    expect:\n      rows:\n        - {claim_id: 1, is_denied: true}\n        - {claim_id: 2, is_denied: false}",
      noteLabel: "Model answer:",
      note: "\"Unit tests (dbt 1.8+) test the transformation LOGIC, not the data: I give mock input rows for the model's refs and the expected output, and dbt runs the model's SQL on that fixture and asserts the result matches. So a wrong CASE, a bad join grain, or a miscomputed window is caught at build time, deterministically, without needing production data — which is exactly what SQL testing was missing. I think of it like the pipeline testing tiers: unit tests catch my logic bugs in CI, and data tests (not_null/unique/relationships/singular) catch bad real data at runtime. Together they give code-level and data-level confidence.\"",
      followups: [
        { q: "\"How is a unit test different from a not_null/unique data test?\"", a: "A data test asserts something about the ACTUAL data in the built table (are keys unique?). A unit test asserts the model's LOGIC transforms known mock inputs into an expected output — no real data involved. One catches bad data, the other catches bad code." },
        { q: "\"What kind of bug does a unit test catch that data tests can't?\"", a: "Logic errors: a wrong CASE/WHEN, an incorrect join causing fan-out, a window frame off by one, mishandled nulls. These produce wrong-but-well-formed output that passes not_null/unique, but a unit test with a known expected result catches it." },
        { q: "\"Why run unit tests in CI specifically?\"", a: "They're fast and deterministic (fixed mock data, no warehouse-data dependency), so they catch logic regressions on every PR before merge — the ideal shift-left check, versus data tests which need real data and run against built models." }
      ]
    }
  ]
},

snapshots: {
  intro: {
    title: "Snapshots & seeds — SCD Type 2 and static data",
    desc: "Snapshots are dbt's built-in SCD Type 2 machinery — how you capture history of changing source records. Seeds handle small static reference data. Both are frequent interview touchpoints, and snapshots connect directly to dimensional-modeling questions."
  },
  cards: [
    {
      title: "Snapshots — SCD Type 2 history capture",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A source table usually shows only the CURRENT state — if a provider's network status changes, yesterday's value is gone. A dbt SNAPSHOT captures history as SCD Type 2: on each run it compares the source to the snapshot table and, when a tracked record changed, closes the old version (sets dbt_valid_to) and inserts a new one (dbt_valid_from, dbt_valid_to=null for current). Two strategies detect change: TIMESTAMP (an updated_at column — reliable if trustworthy) or CHECK (compare a list of columns — a hash-diff when there's no reliable timestamp). Snapshots give you point-in-time correctness — you can reconstruct what a record looked like on any date.",
      code: "{% snapshot provider_snapshot %}\n{{ config(target_schema='snapshots', unique_key='provider_id',\n          strategy='check', check_cols=['network_status','name']) }}\nselect provider_id, name, network_status from {{ source('raw','providers') }}\n{% endsnapshot %}\n-- dbt maintains dbt_valid_from / dbt_valid_to / dbt_scd_id automatically",
      noteLabel: "Model answer:",
      note: "\"Snapshots are dbt's SCD Type 2. Sources usually overwrite — a provider's network status changes and the old value is lost — so a snapshot runs against the source each time, and when a tracked column changed it closes the previous version with dbt_valid_to and inserts a new current version with dbt_valid_from. It manages dbt_valid_from/to and a surrogate dbt_scd_id for me. I pick the strategy by data quality: timestamp when there's a trustworthy updated_at, check (a column hash-diff) when there isn't. The payoff is point-in-time correctness — a claim adjudicated last year can be joined to the provider status that was true then, not today's, which is exactly the historical-accuracy requirement in claims reporting.\"",
      followups: [
        { q: "\"timestamp vs check strategy — how do you choose?\"", a: "timestamp when the source has a reliable updated_at that always advances on change — cheapest and simplest. check (compares/hashes a set of columns) when there's no trustworthy timestamp — it detects change by value difference, at the cost of comparing columns each run." },
        { q: "\"Why capture history in a snapshot instead of just querying the source later?\"", a: "The source usually shows only current state — past values are overwritten and unrecoverable. The snapshot preserves each version with validity dates, so you can reconstruct what a record looked like at any point — required for accurate historical reporting and audits." },
        { q: "\"How does a fact table use the snapshot for point-in-time correctness?\"", a: "Join the fact to the snapshot on the natural key with a validity predicate — the fact's event date between dbt_valid_from and dbt_valid_to (or current). That resolves each fact to the dimension version that was true at event time, not the latest." }
      ]
    },
    {
      title: "Seeds — small static reference data in version control",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A SEED is a small CSV file in the repo that `dbt seed` loads into a table you can ref() like any model. Seeds are for small, static, version-controlled reference data that belongs with the code: code/value mappings, denial-reason lookups, a list of test accounts, country codes, status descriptions. Because it's in Git, changes are reviewed and versioned. Seeds are NOT for loading real/large/frequently-changing data — that's the EL tool's job; a seed is for the little lookup tables analysts otherwise hardcode or maintain in a spreadsheet.",
      noteLabel: "Model answer:",
      note: "\"A seed is a CSV in the repo that dbt loads into a table I can ref() like a model — for small, static reference data that should live with the code and be version-controlled: denial-reason code mappings, status descriptions, a curated list of test accounts, lookup tables. The value is that changes go through Git review instead of someone editing a spreadsheet. What seeds are NOT for is real or large or frequently-changing data — that belongs to the ingestion tool; seeds are strictly the little mapping tables that would otherwise be hardcoded in SQL or maintained manually.\"",
      followups: [
        { q: "\"What belongs in a seed vs what should the EL tool load?\"", a: "Seeds: small, static, code-adjacent reference data (code mappings, lookups) that benefits from version control. EL tool: real business data, anything large or frequently changing. If it's more than a few thousand static rows or updates regularly, it's not a seed." },
        { q: "\"Why put reference data in a seed instead of a hardcoded CASE statement?\"", a: "It's reusable across models via ref(), reviewable in Git, testable, and analysts can update the mapping via a PR without touching model logic. A hardcoded CASE duplicates the mapping everywhere and drifts." },
        { q: "\"What's the risk of using seeds for large or changing data?\"", a: "They're loaded from CSV in the repo, so large files bloat the repo and are slow to load, and changing data means constant commits and stale snapshots between runs. Seeds have no incremental logic — they're full-replace — so they don't fit dynamic data." }
      ]
    }
  ]
},

jinja: {
  intro: {
    title: "Jinja, macros & packages — DRY SQL",
    desc: "dbt SQL is templated with Jinja, which is what makes it programmable — variables, loops, conditionals, and macros (reusable functions). Plus packages (dbt_utils and friends) that give you battle-tested macros for free. Interviewers check you can abstract without over-engineering."
  },
  cards: [
    {
      title: "Jinja & macros — reusable SQL logic",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Every dbt model is a Jinja template compiled to raw SQL before execution — ref(), source(), config() are all Jinja. You get variables (`{{ var('x') }}`, `{{ env_var('Y') }}`), control flow (`{% if %}`, `{% for %}`), and MACROS — reusable SQL functions defined once and called anywhere, like functions in code. Macros kill repetition: a cents-to-dollars conversion, a standard date-spine, a way to pivot statuses into columns — write once, call everywhere. The senior skill is knowing WHEN to macro: repeated logic across models, yes; a one-off transform, no — a macro for a single use is over-engineering that hurts readability.",
      code: "-- macros/cents_to_dollars.sql\n{% macro cents_to_dollars(col, precision=2) %}\n  round({{ col }} / 100.0, {{ precision }})\n{% endmacro %}\n\n-- in a model: reuse everywhere, one definition\nselect claim_id, {{ cents_to_dollars('amount_cents') }} as amount_usd\nfrom {{ ref('stg_claims') }}",
      noteLabel: "Model answer:",
      note: "\"Models are Jinja templates compiled to SQL — ref/source/config are Jinja, and I get variables, loops, and conditionals. Macros are the reusable-function part: logic I'd otherwise repeat across models — a cents-to-dollars conversion, a date spine, a status pivot — defined once and called everywhere, so a change happens in one place. The judgment an interviewer is checking is restraint: I macro genuinely repeated logic, but I don't wrap a one-off transform in a macro, because indirection for a single caller just makes the SQL harder to read. DRY where it repeats, plain SQL where it doesn't.\"",
      followups: [
        { q: "\"When should you write a macro, and when is it over-engineering?\"", a: "Macro when the same non-trivial logic appears in multiple models (or will) — you get one source of truth. Over-engineering when it's used once: the indirection makes the model harder to read for no reuse benefit. Repetition justifies abstraction; anticipation usually doesn't." },
        { q: "\"What's the difference between var() and env_var()?\"", a: "var() reads a variable defined in dbt_project.yml or passed with --vars (project config, e.g. a lookback window). env_var() reads an OS environment variable (e.g. a secret or environment-specific value) at compile time — used for secrets and per-environment settings you don't commit." },
        { q: "\"Give a real use of a Jinja for-loop in a model.\"", a: "Generating repetitive SQL — e.g. pivoting a fixed list of statuses into columns with a `{% for status in ['paid','denied','submitted'] %}` loop producing a SUM(CASE...) per status, so adding a status is a one-line list change instead of hand-writing each column." }
      ]
    },
    {
      title: "Packages — dbt_utils and reusing community macros",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Packages are dbt projects you import for their macros/models — installed via packages.yml + `dbt deps`. dbt_utils is the ubiquitous one: generate_surrogate_key (hash a set of columns into a key), date_spine (a calendar table), star (select all-but-some columns), and generic tests like equal_rowcount, expression_is_true, unique_combination_of_columns. Others: dbt_expectations (Great-Expectations-style tests), dbt_audit_helper (compare two models for migrations), codegen (generate boilerplate). The point: don't hand-roll a surrogate-key hash or a date spine — a well-tested package macro exists, and reusing it is faster and less buggy.",
      noteLabel: "Model answer:",
      note: "\"Packages let me import other dbt projects for their macros and tests via packages.yml and dbt deps. dbt_utils is the default install — generate_surrogate_key for hashing columns into a stable key, date_spine for a calendar, star for select-all-but, and extra generic tests like unique_combination_of_columns and expression_is_true. I also reach for dbt_expectations for richer data tests and audit_helper when validating a migration by diffing two models. The principle is the same as any dependency: I don't hand-roll a surrogate-key hash or a date spine when a battle-tested macro exists — reusing it is faster and less error-prone than reinventing it.\"",
      followups: [
        { q: "\"What does dbt_utils.generate_surrogate_key do and why use it?\"", a: "It hashes a list of columns into a single deterministic surrogate key (handling nulls consistently). You use it to build stable keys for dimensions/facts without hand-writing a hash concatenation that breaks on nulls or ordering — one tested macro instead of fragile bespoke SQL." },
        { q: "\"How do you add and install a package?\"", a: "Declare it in packages.yml (package name + version, or a git/local ref), then run `dbt deps` to install it into dbt_packages/. After that its macros/tests are available like your own." },
        { q: "\"When would you use dbt_expectations over the built-in tests?\"", a: "When you need richer assertions than not_null/unique/accepted_values/relationships — value ranges, distributions, row-count comparisons, regex/format checks, aggregate expectations. It's a Great-Expectations-style library for cases the four built-ins don't cover." }
      ]
    }
  ]
},

project: {
  intro: {
    title: "Project structure & configuration — staging / intermediate / marts",
    desc: "How you lay out a dbt project signals seniority. The staging→intermediate→marts layering, naming conventions, and where configuration lives (dbt_project.yml vs schema.yml vs in-model config) are all things an interviewer uses to gauge whether you've run a real project."
  },
  cards: [
    {
      title: "The staging / intermediate / marts layering",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The standard dbt project layers models by purpose. STAGING (stg_): one model per source table, light cleaning only — rename, cast, basic standardization; the anti-corruption layer, usually views. INTERMEDIATE (int_): reusable business-logic building blocks that join/aggregate staging models but aren't consumed directly — the 'plumbing' that keeps marts readable, often ephemeral or views. MARTS (fct_/dim_): the final, consumable models — facts and dimensions organized by business domain (finance, claims), usually tables. Data flows one direction: staging → intermediate → marts, and marts never read raw. This structure is what makes a project navigable and the DAG sane.",
      noteLabel: "Model answer:",
      note: "\"Three layers by purpose. Staging is one model per source, light cleaning only — rename, cast, standardize — the anti-corruption boundary, and the only layer that touches source(); I keep these as views. Intermediate holds reusable business-logic building blocks that stitch staging together but aren't consumed directly — they keep the marts readable, often ephemeral. Marts are the consumable facts and dimensions, grouped by business domain, materialized as tables. Data flows staging→intermediate→marts in one direction and marts never read raw. That layering is what makes a hundred-model project navigable and keeps the DAG clean — and it's the first thing I'd point to as evidence a project was built by someone who's done it before.\"",
      followups: [
        { q: "\"What exactly is allowed in a staging model?\"", a: "Light, non-destructive transforms only: renaming columns to a standard, casting types, basic cleaning (trim, standardize casing), and simple derived columns — one staging model per source table. No joins across sources and no business logic; those belong in intermediate/marts." },
        { q: "\"What problem do intermediate models solve?\"", a: "They hold reusable, complex logic (multi-step joins/aggregations) so marts don't become giant unreadable queries and so that logic isn't duplicated across marts. They're the DAG's plumbing — not consumed directly, but they keep marts simple and DRY." },
        { q: "\"Why should only staging read from source()?\"", a: "It creates a single controlled boundary where raw schema quirks are absorbed and renamed once. If marts read raw directly, cleaning logic scatters and duplicates, and an upstream change ripples everywhere instead of being contained in one staging model." }
      ]
    },
    {
      title: "Configuration — dbt_project.yml, schema.yml & in-model config",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Config lives at three levels, most-general to most-specific, with the specific winning. dbt_project.yml sets project-wide defaults — e.g. everything in models/staging is a view, everything in marts is a table — applied by folder. schema.yml (the _*.yml files) documents and tests models/columns and can set config per model. In-model `{{ config(...) }}` overrides for that one model. This cascade means you set the sensible default once by folder and only override the exceptions, rather than repeating materialization/tags on every model. Knowing the precedence (in-model > yml > project) is a common practical question.",
      code: "# dbt_project.yml — defaults by folder\nmodels:\n  my_project:\n    staging:   {+materialized: view}\n    marts:     {+materialized: table}\n    intermediate: {+materialized: ephemeral}\n# override just the exception, in the model:\n# {{ config(materialized='incremental', unique_key='claim_id') }}",
      noteLabel: "Model answer:",
      note: "\"Three levels with a clear precedence. dbt_project.yml sets defaults by folder — staging as views, marts as tables, intermediate ephemeral — so I configure once for a whole layer. schema.yml files document and test models and can set per-model config. In-model config() is the most specific and overrides both. The cascade (project < yml < in-model) means I set the sensible default at the folder level and only override the exceptions — like flipping one big fact to incremental — instead of stamping materialized on every file. Getting that precedence right is what keeps configuration DRY and predictable.\"",
      followups: [
        { q: "\"If dbt_project.yml says view but the model has config(materialized='table'), what wins?\"", a: "The in-model config — table. Precedence is most-specific-wins: in-model config() overrides schema.yml, which overrides dbt_project.yml folder defaults. You set defaults broadly and override the exceptions locally." },
        { q: "\"Where do you document a model and its columns?\"", a: "In a schema.yml (the _*.yml files) alongside the models: model and column descriptions, tests, and config. Those descriptions flow into `dbt docs` and the lineage site, so documentation lives with the code and is generated, not maintained separately." },
        { q: "\"How do you apply a materialization to a whole folder at once?\"", a: "In dbt_project.yml under models: with the folder path and a `+materialized:` key — e.g. all models under staging default to view. It applies to everything in that folder unless a more specific config overrides it." }
      ]
    }
  ]
},

deploy: {
  intro: {
    title: "Deployment, CI/CD, docs & lineage",
    desc: "Running dbt in production: orchestration (Cloud jobs vs Airflow), Slim CI with state:modified and defer, environments and target-based schemas, and the auto-generated docs/lineage. This is the 'how does it actually ship' senior material."
  },
  cards: [
    {
      title: "Running dbt in production — Cloud jobs vs Airflow, and dbt build",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "In production you run dbt on a schedule against a prod target. Two common ways: dbt Cloud JOBS (managed scheduler runs `dbt build`) or dbt Core triggered from an orchestrator — Airflow via BashOperator or, better, the Cosmos package which renders each dbt model as its own Airflow task for granular retries/visibility. The command that matters is `dbt build`: it runs models, tests, snapshots, and seeds in DAG order, interleaved, and stops a branch if a test fails — so bad data doesn't propagate. (`dbt run` + `dbt test` separately loses that interleaving.) Artifacts (manifest.json, run_results.json) capture what ran for CI and observability.",
      noteLabel: "Model answer:",
      note: "\"Production is dbt on a schedule against a prod target. Either dbt Cloud jobs run it for me, or — if I already have Airflow — I trigger dbt Core from it; I prefer the Cosmos package over a single BashOperator because it turns each model into its own Airflow task, so I get per-model retries and lineage in the Airflow UI instead of one opaque step. The command I run is `dbt build`, not run-then-test, because build interleaves models, tests, snapshots, and seeds in DAG order and halts a branch when a test fails — so a failed not_null on staging stops its downstream marts from building on bad data. I capture the run artifacts for CI and monitoring.\"",
      followups: [
        { q: "\"Why `dbt build` instead of `dbt run` then `dbt test`?\"", a: "build interleaves per node — it builds a model, tests it, and won't build downstream models if the test fails — so bad data is stopped at the source. run-then-test builds everything first, then tests, so failures are detected only after bad data has already populated downstream tables." },
        { q: "\"Why use Cosmos over a single BashOperator for dbt in Airflow?\"", a: "Cosmos parses the dbt DAG and creates one Airflow task per model, giving per-model retries, granular failure isolation, and visible lineage in the Airflow UI. A single BashOperator runs the whole project as one opaque task — a failure means rerunning everything with no visibility." },
        { q: "\"What are dbt's artifacts and what do you use them for?\"", a: "manifest.json (the full project graph/state) and run_results.json (what ran and outcomes). They power Slim CI's state comparison, docs generation, and observability — e.g. diffing manifests to find changed models, or feeding run results into monitoring." }
      ]
    },
    {
      title: "Slim CI — state:modified & defer",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "On a PR you don't want to rebuild the entire project — that's slow and expensive. SLIM CI builds and tests only what CHANGED and its downstream: `dbt build --select state:modified+ --defer --state <prod-manifest>`. state:modified+ compares the PR's manifest to production's to find changed models (and their children); DEFER tells dbt to use PROD versions of the UNCHANGED upstream models instead of rebuilding them. So a one-model change tests just that model against real prod dependencies — fast, cheap CI that still validates the change end to end. This is the flagship senior dbt-ops answer.",
      code: "# CI on a PR: build only changed models + downstream, using prod for the rest\ndbt build --select state:modified+ \\\n          --defer --state ./prod-artifacts\n# state:modified+  = changed nodes and their descendants\n# --defer + --state = resolve unchanged upstream refs to the PROD objects",
      noteLabel: "Model answer:",
      note: "\"Slim CI is how you keep PR checks fast and cheap. Instead of rebuilding everything, I run `dbt build --select state:modified+ --defer --state <prod manifest>`. state:modified+ diffs the PR's manifest against production's to find exactly the changed models and their downstream; defer with the prod state tells dbt to reference the existing PROD tables for all the UNCHANGED upstream models rather than rebuilding them. So a change to one mart tests just that mart and its children, resolving its inputs from real prod data — full validation of the change without a full-project rebuild. That's the difference between a 2-minute CI run and an hour, and it's the standard modern dbt CI setup.\"",
      followups: [
        { q: "\"What does state:modified+ actually select?\"", a: "The nodes that changed relative to a reference (prod) manifest, plus their downstream descendants (the trailing +). So it's the changed models and everything that depends on them — the blast radius of the change — not the whole project." },
        { q: "\"What does --defer do, and why is it needed for Slim CI?\"", a: "It resolves refs to UNCHANGED upstream models against a different environment's objects (prod) instead of rebuilding them in CI. Without defer, building only changed models would fail because their upstream inputs don't exist in the CI schema — defer points those refs at prod." },
        { q: "\"Where does the prod manifest for state comparison come from?\"", a: "From the last successful production run's artifacts (manifest.json), stored somewhere CI can fetch (artifact store, S3, dbt Cloud). CI downloads it and passes it as --state so dbt can diff the PR against known prod state." }
      ]
    },
    {
      title: "Environments, target schemas, docs & exposures",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "dbt separates environments via TARGETS in profiles (dev vs prod: different database/schema/credentials), so the same code runs in an isolated dev schema or prod without edits — often customized with a generate_schema_name macro. `dbt docs generate` + serve builds a documentation site with descriptions AND an interactive lineage graph (the DAG), auto-generated from the project — the living data catalog. EXPOSURES declare downstream consumers (a BI dashboard, an ML model) as nodes in the DAG, so lineage extends past dbt to 'this dashboard depends on these models', and you can see impact before changing a model. Together these are the governance/observability story.",
      noteLabel: "Model answer:",
      note: "\"Environments are targets in the profile — dev and prod point at different schemas/credentials, so the same code runs isolated in dev or in prod without edits; I customize schema naming with generate_schema_name so devs get their own sandboxes. `dbt docs generate` builds a docs site from the project — model/column descriptions plus an interactive lineage DAG — which is a living catalog instead of a stale wiki. Exposures let me declare downstream consumers like a Power BI dashboard or an ML model as DAG nodes, so lineage runs past dbt to 'these models feed this dashboard' and I can do impact analysis before I change something. That's the governance and observability layer — self-documenting lineage rather than tribal knowledge.\"",
      followups: [
        { q: "\"How do you keep dev work from touching prod data?\"", a: "Separate targets in the profile: dev uses a dev database/schema and often a per-developer schema (via generate_schema_name), with its own credentials that have no write access to prod. The same code deploys to prod only through the prod target in CI/CD." },
        { q: "\"What does dbt docs give you that a wiki doesn't?\"", a: "It's generated from the project, so it can't go stale relative to the code — model/column descriptions plus an interactive, always-current lineage graph. A wiki is hand-maintained and drifts; dbt docs reflect the actual DAG and tests on every generate." },
        { q: "\"What's an exposure and why declare one?\"", a: "A declared downstream consumer of your models (dashboard, report, ML model) added as a DAG node. It extends lineage beyond dbt so you can see what business assets depend on a model — enabling impact analysis ('what breaks if I change this?') and freshness/status tracking for consumers." }
      ]
    }
  ]
},

advanced: {
  intro: {
    title: "Advanced — contracts, governance, performance & the semantic layer",
    desc: "Senior/staff dbt: model contracts and versions for stable interfaces, access/groups for governance at scale, performance and cost levers, and the semantic layer for consistent metrics. Plus the trade-off questions (dbt vs stored procs vs Spark)."
  },
  cards: [
    {
      title: "Model contracts, versions & access (governance at scale)",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "As a dbt project grows and other teams depend on your models, dbt adds governance. CONTRACTS enforce a model's shape: declare columns/types/constraints and dbt fails the build if the model's output doesn't match — so a downstream consumer's expected schema can't silently break. VERSIONS let you publish v1 and v2 of a model and migrate consumers gradually. ACCESS (private/protected/public) + GROUPS control which models other teams can ref(), so internal 'plumbing' isn't depended on directly. Together they turn a model into a stable, governed interface — the difference between a small project and a data platform many teams build on.",
      code: "# a contracted, public, versioned model interface\nmodels:\n  - name: fct_claims\n    access: public\n    config: {contract: {enforced: true}}\n    columns:\n      - name: claim_id\n        data_type: bigint\n        constraints: [{type: not_null}]\n      - name: amount\n        data_type: numeric",
      noteLabel: "Model answer:",
      note: "\"Once other teams depend on my models, I treat them as governed interfaces. Contracts enforce the output shape — declared column names, types, and constraints — and dbt fails the build if the model drifts from them, so a consumer's expected schema can't break silently. Versions let me ship v2 alongside v1 and migrate consumers gradually instead of a breaking change. Access modifiers plus groups control who can ref() what, so intermediate 'plumbing' models stay private and only curated public marts are the supported interface. That's how dbt scales from one team's project to a platform many teams build on — stable contracts instead of everyone reaching into everyone's tables.\"",
      followups: [
        { q: "\"What does a model contract protect against?\"", a: "Silent schema drift breaking downstream consumers — dbt fails the build if the model's actual output columns/types/constraints don't match the declared contract, so a change that would break a dependent is caught at build time, not in their broken dashboard." },
        { q: "\"How do model versions help a breaking change?\"", a: "You publish v2 alongside v1 so existing consumers keep using v1 while new/migrating ones move to v2, then retire v1 once everyone's off. It turns a hard breaking change into a gradual, coordinated migration." },
        { q: "\"Why mark some models private with access/groups?\"", a: "So other teams can't ref() your internal intermediate/plumbing models and create hidden dependencies on things you might refactor. Only curated public marts are the supported interface; private/protected keeps the internals free to change." }
      ]
    },
    {
      title: "Performance & cost — dbt is only as cheap as your SQL",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Because dbt pushes SQL to the warehouse, performance and cost are warehouse concerns dbt gives you levers over. The big ones: incremental models (don't rebuild huge facts), materialization choice (view vs table trade-off), and warehouse-native config passed through dbt — partitioning/clustering on BigQuery/Databricks, cluster_by on Snowflake, all set in model config so the built table is laid out for pruning. Also: right-size the warehouse the dbt job runs on, use `--select` to run only what's needed, and avoid needless full rebuilds. dbt won't make bad SQL fast — but it makes the good patterns (incremental, clustering, targeted runs) easy to apply consistently.",
      code: "-- warehouse-native layout via dbt config (Snowflake example)\n{{ config(materialized='incremental', unique_key='claim_id',\n          cluster_by=['service_date','provider_id']) }}\n-- BigQuery:  partition_by + cluster_by ;  Databricks: partition_by / liquid clustering",
      noteLabel: "Model answer:",
      note: "\"dbt pushes SQL down, so cost lives in the warehouse — but dbt gives me the levers to control it consistently. The biggest is incremental models so I'm not rebuilding billion-row facts every run. Then materialization choice, and warehouse-native physical layout passed through config — cluster_by on Snowflake, partition_by/cluster on BigQuery or Databricks — so the built tables prune well for downstream queries. Operationally I right-size the warehouse the job runs on, use --select to run only what changed, and avoid gratuitous full-refreshes. dbt won't rescue bad SQL, but it makes the cost-saving patterns easy to apply everywhere, which is exactly the kind of systematic cost control I did at Amex.\"",
      followups: [
        { q: "\"dbt is 'slow' — is that dbt's fault?\"", a: "Almost never dbt itself — it just issues SQL; the warehouse does the work. Slowness is full rebuilds that should be incremental, un-pruned queries, an undersized warehouse, or bad SQL. You diagnose in the warehouse's query profile, not in dbt." },
        { q: "\"How do you apply clustering/partitioning through dbt?\"", a: "Via model config passed to the adapter — cluster_by on Snowflake, partition_by + cluster_by on BigQuery, partitioning/liquid clustering on Databricks. dbt builds the table with that physical layout so downstream queries prune, all declared in the model rather than hand-run DDL." },
        { q: "\"How does node selection reduce cost in a run?\"", a: "`--select` (and state:modified+) run only the models you need instead of the whole project — so a targeted change or a Slim CI run rebuilds a handful of models against deferred prod data, not hundreds, cutting warehouse compute dramatically." }
      ]
    },
    {
      title: "The semantic layer & dbt vs stored procs / Spark",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The dbt SEMANTIC LAYER (MetricFlow) lets you define metrics once — 'total paid amount', 'denial rate' — as governed definitions, and query them consistently from any BI tool, so 'revenue' means the same thing everywhere instead of each dashboard redefining it. On trade-offs: dbt vs STORED PROCEDURES — dbt gives version control, testing, lineage, and portability that procs lack (procs are untested, warehouse-locked, and invisible to lineage). dbt vs SPARK — dbt is SQL transforms IN a warehouse; Spark is code-based distributed compute for data too big/unstructured for SQL or needing non-SQL logic (ML, complex parsing). They're complementary: Spark/ingestion lands data, dbt models it in the warehouse.",
      noteLabel: "Model answer:",
      note: "\"The semantic layer (MetricFlow) is metrics-as-code: I define 'denial rate' or 'total paid' once as a governed metric, and every BI tool queries that definition, so a metric means the same thing everywhere instead of five dashboards each rolling their own. On trade-offs — dbt versus stored procedures: dbt gives version control, testing, lineage, and dev/prod portability that procs simply don't have; a proc is untested, warehouse-locked, and invisible to lineage, so dbt is the modern replacement. dbt versus Spark: dbt is SQL transforms run in the warehouse; Spark is distributed code compute for data too large or unstructured for SQL, or logic SQL can't express like ML or heavy parsing. They're complementary — ingestion/Spark lands and pre-processes, dbt models it in the warehouse.\"",
      followups: [
        { q: "\"What problem does the semantic layer solve?\"", a: "Inconsistent metrics — every dashboard redefining 'revenue' or 'active users' slightly differently. Defining metrics once as governed, queryable definitions means all consumers compute them identically, eliminating the 'why do these two reports disagree' problem." },
        { q: "\"Why is dbt better than stored procedures for transformations?\"", a: "Version control, automated testing, generated lineage/docs, environment portability, and modularity — none of which procs offer. Procs are untested, warehouse-locked, and opaque to lineage, so they rot into unmaintainable tribal knowledge; dbt brings software engineering to the same SQL." },
        { q: "\"When do you need Spark instead of dbt?\"", a: "When the work isn't set-based SQL in a warehouse: data too large/unstructured to land first, complex procedural logic, ML feature engineering/training, or heavy semi-structured parsing. Spark is code-based distributed compute; dbt is SQL modeling of data already in the warehouse — use each for its job." }
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — dbt Q&A and trade-offs",
    desc: "The spoken dbt questions a DE loop asks. Form your own answer first, then expand — the score is in the trade-off, the failure mode, and the boundary, framed on real transformation work."
  },
  cards: [
    {
      title: "\"Walk me through how you'd structure a dbt project from scratch.\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Show the layering, the conventions, and the engineering scaffolding — sources, staging/intermediate/marts, tests, CI — as a coherent standard, not a pile of models.",
      noteLabel: "Model answer:",
      note: "\"I declare raw inputs as sources with freshness and tests. Then three model layers: staging (one view per source, light cleaning, the only layer touching source()), intermediate (reusable business-logic building blocks, often ephemeral), and marts (facts/dimensions by business domain, materialized as tables, big facts incremental). Config defaults by folder in dbt_project.yml — staging=view, marts=table — overridden per model only for exceptions. Every model has tests in schema.yml (keys not_null/unique, enums accepted_values, FKs relationships, plus singular tests for business rules) and descriptions that flow into dbt docs. Snapshots for SCD2 on changing dimensions. Then Slim CI on PRs (state:modified+ with defer) and `dbt build` on a schedule in prod. The theme is a consistent, tested, documented standard — so a new engineer can navigate it and the DAG stays sane.\"",
      followups: [
        { q: "\"Why one staging model per source table?\"", a: "It creates a single, predictable anti-corruption boundary per source where renaming/casting/cleaning happens once, so upstream quirks are contained and every downstream model builds on a clean, consistent version. One-to-one keeps it navigable and the cleaning non-duplicated." },
        { q: "\"Where does business logic live vs cleaning?\"", a: "Cleaning (rename/cast/standardize) in staging; business logic (joins, aggregations, derived metrics) in intermediate and marts. Keeping them separate means staging stays reusable and simple, and business rules live where they're consumed, not smeared across layers." },
        { q: "\"How do you keep a 200-model project maintainable?\"", a: "Strict layering and naming conventions, folder-level config defaults, tests and descriptions on every model, node selection for targeted runs, access/groups so teams depend only on public marts, and generated docs/lineage — so structure and governance scale rather than the project turning into spaghetti." }
      ]
    },
    {
      title: "\"How do you ensure data quality in dbt?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Layer it: generic tests, singular/business-rule tests, unit tests for logic, source freshness, and how build halts propagation. Tie to real reconciliation work.",
      noteLabel: "Model answer:",
      note: "\"Layered. Generic tests on every model — not_null/unique on keys, accepted_values on enums, relationships for referential integrity — assert the structural contract on each run. Singular tests encode business rules and reconciliation (claims where paid exceeds billed, source-vs-target mismatches), with severity/thresholds so soft checks warn and hard ones error. Unit tests validate transformation LOGIC on mock inputs in CI, catching a wrong CASE or join before merge. Source freshness catches stale upstream loads before I even transform. And I run `dbt build`, which interleaves tests with model builds and stops a branch when a test fails — so bad data never reaches the marts. That's the validation-and-reconciliation framework from my healthcare work, expressed declaratively in dbt.\"",
      followups: [
        { q: "\"Unit tests vs data tests — why both?\"", a: "Unit tests catch logic bugs (wrong transformation) on mock data in CI at build time; data tests catch bad actual data (null keys, orphans, business-rule violations) at runtime on built models. Code correctness and data correctness are different failure classes needing different checks." },
        { q: "\"How does dbt stop bad data from reaching downstream models?\"", a: "`dbt build` interleaves per node and, by default, won't build a model's downstream dependents if its tests fail — so a failed not_null on staging halts the marts that depend on it, containing the bad data at the point of failure." },
        { q: "\"How do you handle a test that's 'mostly' fine — a few expected bad rows?\"", a: "Severity + thresholds: set the test to warn, or use warn_if/error_if to define a tolerance band — warn on a handful of rows, error only past a level that signals a real problem. That avoids brittle all-or-nothing failures on data with known minor noise." }
      ]
    },
    {
      title: "\"Your dbt run is slow and expensive. How do you fix it?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Locate the cost (warehouse, not dbt), then apply levers cheapest-first: incremental, pruning/clustering, node selection, warehouse sizing. Method over grab-bag.",
      noteLabel: "Model answer:",
      note: "\"First, remember dbt just issues SQL — the cost is in the warehouse, so I look at the warehouse query profile to find the expensive models, not guess. Biggest lever: convert full-rebuild table models on large facts to incremental so I process only the delta. Next, physical layout — cluster_by/partition_by via config so queries and merges prune instead of scanning everything, and make sure incremental merges are pruned to recent partitions. Then operational: use --select / state:modified+ so I only run what changed rather than the whole project, and right-size the warehouse to the job. I change one thing and re-measure against warehouse cost/runtime. The framing that lands: dbt performance IS warehouse performance, so I optimize the SQL and the physical model, not dbt itself.\"",
      followups: [
        { q: "\"Where do you look first to find what's expensive?\"", a: "The warehouse's query history/profile (Snowflake query profile, BigQuery job stats), ranked by cost/scan/time, mapped back to dbt models. dbt's run_results timings help find slow nodes, but the actual cost diagnosis is in the warehouse." },
        { q: "\"A large fact is rebuilt fully every night. First change?\"", a: "Make it incremental with a unique_key and a pruned incremental predicate, so each run merges only new/changed rows into recent partitions instead of rebuilding all history — usually the single biggest cost and runtime cut." },
        { q: "\"How does clustering/partitioning cut cost in dbt-built tables?\"", a: "Set via model config, it lays the table out so warehouse queries (and incremental merges) prune to relevant micro-partitions/partitions instead of full scans — fewer bytes scanned means lower cost and faster runs, especially for date/entity-filtered analytics." }
      ]
    },
    {
      title: "\"dbt vs stored procedures / vs a raw SQL script pipeline — why dbt?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Name what dbt adds that ad-hoc SQL lacks — DAG, tests, lineage, portability, modularity — without pretending it's magic. It's SQL plus engineering.",
      noteLabel: "Model answer:",
      note: "\"dbt is the same SQL, but with software engineering around it that ad-hoc scripts and stored procs lack. Versus a folder of scripts run by cron: dbt derives the dependency DAG from ref() so ordering and parallelism are automatic, adds automated tests, generates lineage/docs, and gives dev/prod portability — none of which you get hand-ordering scripts. Versus stored procedures: procs are untested, warehouse-locked, and invisible to lineage, so they become unmaintainable tribal knowledge; dbt models are version-controlled, tested, documented, and portable. I'm honest that dbt isn't magic — it doesn't add compute or do the E/L, and bad SQL is still bad — but it turns a pile of transformations into a maintainable, testable, self-documenting project, which is exactly why it won the transformation layer.\"",
      followups: [
        { q: "\"Give the single strongest argument for dbt over stored procs.\"", a: "Testability and lineage under version control: dbt models are tested on every run and their dependencies/lineage are explicit and generated, whereas stored procs are untested, opaque, and warehouse-locked — dbt makes transformations maintainable software instead of tribal knowledge." },
        { q: "\"Is there a case where a stored procedure is still the right call?\"", a: "Occasionally — highly procedural warehouse-specific logic, or a tiny shop with no appetite for a dbt toolchain. But for any transformation layer that multiple people maintain, dbt's testing/lineage/portability wins; procs don't scale as a team practice." },
        { q: "\"What does dbt explicitly NOT do that you must handle elsewhere?\"", a: "Extract and load (ingestion tools do that), compute (the warehouse does it), and non-SQL logic like ML or heavy parsing (Spark/Python). dbt is transform-only, SQL-only, warehouse-pushdown — you pair it with EL and, where needed, Spark." }
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What does dbt actually do?",
    options: [
      "Extracts, loads, AND transforms data using its own compute engine",
      "Transforms data already in the warehouse — it compiles SQL and pushes it down to the warehouse to execute (transform-only, no own compute)",
      "Replaces the data warehouse entirely",
      "Streams data from Kafka into dashboards"
    ],
    correct: 1
  },
  {
    q: "Why reference upstream models with ref() instead of a hardcoded schema.table name?",
    options: [
      "It's shorter to type",
      "ref() builds the dependency DAG (ordering + parallelism) AND makes SQL environment-portable (resolves to dev vs prod schema)",
      "It encrypts the query",
      "Hardcoded names run faster"
    ],
    correct: 1
  },
  {
    q: "A 2-billion-row claims fact is materialized as a 'table' and rebuilt fully every night — slow and expensive. Best fix?",
    options: [
      "Switch it to a view",
      "Make it incremental (with unique_key) so each run merges only new/changed rows instead of rebuilding all history",
      "Add more dbt threads",
      "Run it as ephemeral"
    ],
    correct: 1
  },
  {
    q: "In an incremental model, what does specifying a unique_key change?",
    options: [
      "Nothing — it's just documentation",
      "It switches the load from append-only to a merge/upsert on that key, so updated records reconcile in place instead of duplicating",
      "It makes the model a view",
      "It disables tests"
    ],
    correct: 1
  },
  {
    q: "What is a dbt snapshot for?",
    options: [
      "Backing up the whole warehouse",
      "Capturing SCD Type 2 history of changing source records (dbt_valid_from/to), so you can reconstruct point-in-time state",
      "Taking a screenshot of the DAG",
      "Loading CSV reference data"
    ],
    correct: 1
  },
  {
    q: "The difference between a dbt unit test and a not_null/unique data test is:",
    options: [
      "They're the same thing",
      "A unit test checks model LOGIC against mock inputs/expected output (a code test); a data test checks the actual DATA in the built model",
      "Unit tests only run in production",
      "Data tests require dbt Cloud"
    ],
    correct: 1
  },
  {
    q: "What does Slim CI (`dbt build --select state:modified+ --defer --state <prod>`) accomplish?",
    options: [
      "Rebuilds the entire project on every PR for safety",
      "Builds/tests only changed models and their downstream, deferring unchanged upstream refs to prod objects — fast, cheap PR checks",
      "Deletes unused models",
      "Runs dbt without any tests"
    ],
    correct: 1
  },
  {
    q: "A dbt run is slow. What's the most accurate framing?",
    options: [
      "dbt's engine is slow; switch tools",
      "dbt just issues SQL — the cost is in the warehouse; fix it with incremental models, pruning/clustering, node selection, and warehouse sizing",
      "Add more Jinja macros",
      "Convert everything to ephemeral"
    ],
    correct: 1
  },
  {
    q: "Why is only the staging layer supposed to select from source()?",
    options: [
      "source() is deprecated",
      "It creates one controlled boundary where raw is renamed/cast/cleaned once; if marts read raw directly, cleaning logic scatters and duplicates",
      "Staging models run faster",
      "source() only works in staging"
    ],
    correct: 1
  },
  {
    q: "What does a dbt model contract protect against?",
    options: [
      "SQL injection",
      "Silent schema drift breaking downstream consumers — the build fails if the model's output columns/types/constraints don't match the declared contract",
      "Warehouse outages",
      "Slow queries"
    ],
    correct: 1
  }
];
