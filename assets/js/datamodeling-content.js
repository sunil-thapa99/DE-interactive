// Content data for the Data Modeling module — dimensional modeling, facts/dims, SCDs, patterns.
const MODULE_ID = "datamodeling";
const CONTENT = {

overview: {
  intro: {
    title: "Data modeling — the round that's its own interview",
    desc: "Dimensional modeling is a standalone interview round almost everywhere, and it's where 'I moved data' separates from 'I designed the warehouse.' This module covers the model most DE roles test: the star schema, fact and dimension design, slowly changing dimensions, and the normalize-vs-denormalize judgment. Work each tab, answer the follow-ups aloud, then check."
  },
  cards: [
    {
      title: "OLTP vs OLAP — why you don't report off the source database",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "Source systems are OLTP — normalized (3NF) to make writes fast and consistent: no duplicated data, many narrow tables, row-by-row inserts/updates. Analytics is OLAP — you read huge ranges, aggregate, and join a big fact to a few dimensions. A 3NF schema is terrible for that: a single report joins 15 tables. So you model a separate analytical layer — the dimensional model / star schema — denormalized for read speed and human understandability. The senior framing: OLTP optimizes for the transaction, OLAP for the question.",
      navLabel: "The distinction interviewers probe:",
      nav: "Normalization removes redundancy so an update happens in one place — right for writes. Dimensional modeling deliberately re-introduces redundancy (a dimension repeats the product's category on every row) so reads are fast and the model is legible to an analyst. Knowing WHEN each is correct — not treating denormalization as 'wrong' — is the signal.",
      noteLabel: "Model answer:",
      note: "\"Source systems are OLTP, normalized to 3NF so writes are fast and consistent with no duplication.<br><br>Analytics is the opposite workload — I scan and aggregate huge ranges and join a fact to a handful of dimensions. Running that on a normalized schema means joining a dozen tables per report.<br><br>So I build a separate dimensional model, a star schema, that's denormalized for read speed and easy for analysts to understand.<br><br>The point isn't that normalization is wrong — it's right for the transaction. Dimensional modeling is right for the question. I pick per workload.\"",
      followups: [
        "\"Why not just report directly off the production database?\"",
        "\"Is denormalization ever the wrong call in a warehouse?\"",
        "\"What does 3NF optimize for that a star schema gives up?\""
      ]
    },
    {
      title: "Star schema — the shape everything else builds on",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A star schema is one central fact table (the measurements — sales, claims, clicks) surrounded by dimension tables (the context — who, what, where, when). The fact holds foreign keys to each dimension plus numeric measures; dimensions hold descriptive attributes you filter and group by. It's called a star because the fact is the center and dimensions radiate out. Queries are simple and fast: filter/group on dimension attributes, aggregate fact measures, join fact-to-dim on surrogate keys. This is the default model you should reach for and be able to draw in seconds.",
      code: "-- Star: one fact, several dimensions, join on surrogate keys\nSELECT  d.year, p.category, SUM(f.sales_amount) AS revenue\nFROM    fact_sales      f\nJOIN    dim_date        d ON f.date_key    = d.date_key\nJOIN    dim_product     p ON f.product_key = p.product_key\nWHERE   d.year = 2026\nGROUP BY d.year, p.category;\n-- fact = measures + FKs; dims = the attributes you filter/group by",
      noteLabel: "Model answer:",
      note: "\"A star schema is one central fact table surrounded by dimension tables.<br><br>The fact holds the numeric measurements and foreign keys to each dimension. The dimensions hold the descriptive attributes I filter and group by — the who, what, where, and when.<br><br>Every analytical query has the same shape: filter and group on dimension attributes, aggregate the fact's measures, join on surrogate keys.<br><br>It's my default because it's fast, and because an analyst can read it without a map. I only add complexity when a real requirement forces it.\"",
      followups: [
        "\"What lives in the fact vs the dimension?\"",
        "\"Draw a star schema for an e-commerce orders dataset.\"",
        "\"Why join on a surrogate key instead of the natural business key?\""
      ]
    },
    {
      title: "Star vs snowflake — and why star usually wins",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A snowflake schema normalizes the dimensions — instead of one dim_product with category and department as columns, you split into dim_product → dim_category → dim_department. It saves a little storage and removes redundancy, but it costs more joins per query and makes the model harder for analysts to navigate. In a columnar warehouse, storage is cheap and the redundancy compresses away, so the trade rarely pays. The rule: default to star (denormalized dims); snowflake only a specific dimension when it's genuinely huge, shared, and changes in a way that redundancy makes painful.",
      noteLabel: "Model answer:",
      note: "\"A snowflake schema normalizes the dimensions into sub-tables, so product points to category points to department.<br><br>It removes redundancy and saves a bit of storage, but every query pays extra joins and the model is harder for analysts to read.<br><br>In a columnar warehouse storage is cheap and the repeated values compress away, so that trade usually doesn't pay.<br><br>So I default to a star with denormalized dimensions. I'd only snowflake a specific dimension if it were genuinely large, shared across many stars, and changing in a way that duplication made painful to maintain.\"",
      followups: [
        "\"When would you actually snowflake a dimension?\"",
        "\"Why does the storage argument for snowflaking weaken on a columnar warehouse?\"",
        "\"What's the cost of snowflaking at query time?\""
      ]
    }
  ]
},

facts: {
  intro: {
    title: "Fact tables — grain, measures, and the three fact types",
    desc: "Facts are where the interview gets specific, because getting the grain wrong poisons everything above it. This tab covers declaring the grain, additive vs semi- vs non-additive measures, the three fact-table types, and factless facts. Be able to state a fact's grain in one sentence — it's the first thing a good interviewer asks."
  },
  cards: [
    {
      title: "Grain — declare it first, in one sentence",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The grain is what one row of the fact table represents, and declaring it is the first step in designing any fact — before columns, before keys. 'One row per order line item.' 'One row per policy per day.' 'One row per patient admission.' Get it wrong and everything breaks: too coarse and you can't answer detailed questions; mixed grain (some rows per order, some per line) makes every SUM wrong. The rule: pick the finest grain the business needs and the source supports, keep every row at that same grain, and never mix.",
      noteLabel: "Model answer:",
      note: "\"The grain is what a single fact row means, and I declare it before anything else — before columns or keys.<br><br>I state it in one sentence: one row per order line item, or one row per policy per day.<br><br>I pick the finest grain the business needs and the source can support, because I can always aggregate up from fine grain but never drill down from coarse.<br><br>And I never mix grains in one table — if some rows are per order and others per line, every aggregate is wrong. Different grains mean different fact tables.\"",
      followups: [
        "\"State the grain of a fact table for retail sales.\"",
        "\"Why prefer the finest grain the source supports?\"",
        "\"What goes wrong if two different grains land in one fact table?\""
      ]
    },
    {
      title: "Additive, semi-additive, non-additive measures",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A measure's additivity is which dimensions you can safely SUM across. Additive = sums across all dimensions (sales_amount, quantity) — the easy, ideal case. Semi-additive = sums across some dimensions but NOT time (account_balance, inventory_on_hand): summing balances across accounts is fine, but summing today's and yesterday's balance is nonsense — you average or take end-of-period over time. Non-additive = can't be summed at all (ratios, percentages, unit_price): you must sum the components (total revenue, total units) and compute the ratio at query time. Knowing this stops a whole class of wrong dashboards.",
      noteLabel: "Model answer:",
      note: "\"Additivity is which dimensions I can safely add a measure across.<br><br>Additive measures like sales amount sum across everything — the ideal case.<br><br>Semi-additive measures like an account balance or inventory sum across most dimensions but not time. Adding today's and yesterday's balance is meaningless, so over time I take a period-end snapshot or an average.<br><br>Non-additive measures like a ratio or unit price can't be summed at all. I store the additive components — total revenue and total units — and compute the ratio at query time.<br><br>Getting this right is what stops a dashboard from silently double- or mis-counting.\"",
      followups: [
        "\"Is account balance additive? What do you do over the time dimension?\"",
        "\"Why never store a pre-computed ratio as the only measure?\"",
        "\"Give an example of a semi-additive measure in insurance.\""
      ]
    },
    {
      title: "The three fact types — transaction, periodic snapshot, accumulating",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Three fact-table shapes cover almost everything. Transaction fact: one row per event as it happens (a sale, a claim submission) — the most common, finest grain, additive. Periodic snapshot: one row per entity per regular period (account balance per day, inventory per week) — captures state at intervals, usually semi-additive. Accumulating snapshot: one row per process instance that you UPDATE as it moves through milestones (an order: ordered → shipped → delivered, with a date column per step) — for pipelines/workflows with a defined lifecycle. Naming which type a scenario needs is a classic question.",
      code: "-- Transaction: one row per event (append-only)\nfact_claim_txn      (claim_key, date_key, policy_key, amount)\n\n-- Periodic snapshot: one row per policy per day (state over time)\nfact_policy_daily   (policy_key, date_key, balance, reserve)\n\n-- Accumulating snapshot: one row per order, UPDATED per milestone\nfact_order_lifecycle(order_key, order_date_key, ship_date_key,\n                     deliver_date_key, order_amt, days_to_ship)",
      noteLabel: "Model answer:",
      note: "\"There are three fact types and I pick by how the data behaves.<br><br>A transaction fact is one row per event as it happens — a sale, a claim. It's append-only, finest grain, and the most common.<br><br>A periodic snapshot is one row per entity per period — a daily account balance — to capture state at regular intervals. These are usually semi-additive.<br><br>An accumulating snapshot is one row per process instance that I update as it moves through milestones — an order going ordered, shipped, delivered — with a date column and a duration per step. That's for a workflow with a defined lifecycle.\"",
      followups: [
        "\"An order goes through 5 stages and you want time-in-each — which fact type?\"",
        "\"Daily inventory levels — which type, and is the measure additive?\"",
        "\"Which fact type gets UPDATEd rather than only appended?\""
      ]
    },
    {
      title: "Factless fact tables",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A factless fact table has no numeric measure — just the foreign keys recording that an event or a relationship happened. Two uses: (1) event tracking — student-attended-class, patient-seen-by-doctor: you count rows to answer 'how many attended?' (2) coverage / condition — which products were on promotion on which days, so you can find what did NOT sell (promoted items with no matching sales row). The measure is the existence of the row itself; you COUNT instead of SUM. It's a favorite 'do you really understand facts' question.",
      noteLabel: "Model answer:",
      note: "\"A factless fact table records that something happened, with no numeric measure — just the foreign keys.<br><br>I use it two ways. One is event tracking, like a student attending a class or a patient seen by a doctor. There's nothing to sum; I count the rows to answer how many.<br><br>The other is coverage — recording which products were on promotion on which days. That lets me answer the negative question: which promoted items had no sale, by finding promotion rows with no matching sales fact.<br><br>The measure is the existence of the row, so I count instead of sum.\"",
      followups: [
        "\"How would you answer 'which promoted products did NOT sell'?\"",
        "\"What's the 'measure' in a factless fact table?\"",
        "\"Give an event-tracking example and the question it answers.\""
      ]
    }
  ]
},

dimensions: {
  intro: {
    title: "Dimension tables — surrogate keys, conformed dims, and the special types",
    desc: "Dimensions are the context that makes a fact answerable, and interviewers test the details: why surrogate keys, what conformed dimensions buy you, and the special-purpose types (degenerate, role-playing, junk). Conformed dimensions in particular are a senior-signal concept — know why they matter."
  },
  cards: [
    {
      title: "Surrogate keys — why not just use the natural key",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A surrogate key is a warehouse-generated, meaningless integer primary key on every dimension (product_key 1, 2, 3…), separate from the natural/business key (SKU 'ABC-123'). Four reasons: (1) SCD Type 2 needs it — the same SKU has multiple rows over time, so the natural key isn't unique anymore; the surrogate distinguishes each version. (2) It insulates the warehouse from source changes (a re-keyed source system, or two merged sources with clashing IDs). (3) Integer joins are faster and smaller than string/composite natural keys. (4) It handles the 'unknown/late-arriving' member cleanly with a reserved key like -1. Facts store the surrogate, not the natural key.",
      code: "-- SCD2 makes the natural key non-unique; surrogate distinguishes versions\n-- product_key | sku      | category | valid_from | valid_to   | is_current\n--     1       | ABC-123  | Toys     | 2024-01-01 | 2025-06-30 | false\n--     2       | ABC-123  | Games    | 2025-07-01 | 9999-12-31 | true\n-- The fact points at product_key (1 or 2), pinning the row to the\n-- category that was true when the event happened.",
      noteLabel: "Model answer:",
      note: "\"A surrogate key is a meaningless warehouse-generated integer on every dimension, separate from the natural business key.<br><br>The main reason is SCD Type 2: the same product SKU gets multiple rows over time, so the natural key stops being unique. The surrogate distinguishes each version, and the fact points at the exact version that was true when the event happened.<br><br>It also insulates me from source-system re-keying or merged sources with clashing IDs, integer joins are faster and smaller, and I get a clean reserved key for unknown or late-arriving members.\"",
      followups: [
        "\"Why does SCD Type 2 force a surrogate key?\"",
        "\"How do you handle a fact whose dimension member hasn't arrived yet?\"",
        "\"What breaks if you join facts on the natural key instead?\""
      ]
    },
    {
      title: "Conformed dimensions — the enterprise-level concept",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A conformed dimension is a single dimension used identically across multiple fact tables / data marts — the same dim_date, dim_customer, dim_product shared by sales, returns, and support facts. Because they mean exactly the same thing everywhere, you can compare and combine facts across processes: 'revenue vs support tickets by customer' works because both facts point at the same dim_customer. Without conformed dimensions you get stovepipe marts that can't be joined — the classic failure Kimball's 'bus architecture' (a matrix of business processes × conformed dimensions) is designed to prevent. This is a senior-signal answer.",
      noteLabel: "Model answer:",
      note: "\"A conformed dimension is one dimension used identically across multiple facts or marts — the same customer, date, and product dimensions shared by sales, returns, and support.<br><br>Because they mean the same thing everywhere, I can combine facts across business processes. I can put revenue next to support tickets by customer, because both facts join to the same customer dimension with the same keys and attributes.<br><br>Without conformity you get stovepipe marts that can't be compared. That's exactly what Kimball's bus architecture — the matrix of processes against conformed dimensions — is built to avoid.\"",
      followups: [
        "\"Two teams built separate customer dimensions — what problem will they hit?\"",
        "\"What is the Kimball bus matrix?\"",
        "\"How do conformed dimensions let you compare across data marts?\""
      ]
    },
    {
      title: "Special dimensions — degenerate, role-playing, junk",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Three named patterns worth knowing. Degenerate dimension: a dimension attribute with no other attributes — like an order number or invoice number — so it lives IN the fact table, not a separate dim (there's nothing to describe it, but you still group/filter by it). Role-playing dimension: one physical dimension used in multiple roles via views/aliases — dim_date joined three times as order_date, ship_date, delivery_date. Junk dimension: a grab-bag of low-cardinality flags and indicators (is_gift, payment_type, order_channel) combined into one small dimension instead of littering the fact with many boolean columns.",
      noteLabel: "Model answer:",
      note: "\"Three patterns I reach for.<br><br>A degenerate dimension is an identifier like an order or invoice number that has no descriptive attributes of its own, so it sits in the fact table itself. I still filter and group by it, but there's nothing to put in a separate dimension.<br><br>A role-playing dimension is one physical dimension used in several roles — the date dimension aliased as order date, ship date, and delivery date via views.<br><br>A junk dimension collects a handful of low-cardinality flags — a gift flag, payment type, channel — into one small dimension, so I don't litter the fact with a dozen boolean columns.\"",
      followups: [
        "\"Where does an order number live, and why not its own dimension?\"",
        "\"How do you model order_date, ship_date, and delivery_date without three date tables?\"",
        "\"You have 6 boolean flags on a fact — what do you do with them?\""
      ]
    }
  ]
},

scd: {
  intro: {
    title: "Slowly changing dimensions — the history question",
    desc: "How you handle a dimension attribute changing over time is one of the most-asked modeling questions, because it's where correctness of historical reporting lives. Know Types 1, 2, and 3 cold — especially Type 2 — and be able to explain when each is right and how you'd implement Type 2 with a MERGE."
  },
  cards: [
    {
      title: "SCD Type 1 — overwrite (no history)",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Type 1 simply overwrites the old value with the new one — no history kept. Use it when the change is a correction (a misspelled name, a fixed typo) or when history genuinely doesn't matter for that attribute. It's the simplest and cheapest, but it silently rewrites the past: every historical report now reflects the new value as if it were always true. That's fine for a corrected email, wrong for a customer's region if you report sales by region over time.",
      code: "-- Type 1: overwrite in place, past reports change retroactively\nUPDATE dim_customer\nSET    email = 'new@x.com', updated_at = CURRENT_TIMESTAMP\nWHERE  customer_key = 42;",
      noteLabel: "Model answer:",
      note: "\"Type 1 overwrites the old value and keeps no history.<br><br>I use it when the change is a correction — a misspelled name, a bad email — or when history for that attribute genuinely doesn't matter.<br><br>It's the simplest and cheapest option, but it rewrites the past: every historical report now shows the new value as if it had always been true.<br><br>So it's fine for a typo fix, but wrong for something like a customer's region if I ever report sales by region over time — for that I need Type 2.\"",
      followups: [
        "\"When is silently rewriting history acceptable?\"",
        "\"A customer moves regions — is Type 1 OK? Why or why not?\"",
        "\"What's the cost advantage of Type 1?\""
      ]
    },
    {
      title: "SCD Type 2 — new row per version (full history)",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Type 2 is the workhorse: when an attribute changes, you insert a NEW row for that member with a new surrogate key, and close out the old row. You track versions with effective-dating columns — valid_from, valid_to (often 9999-12-31 for the open row), and an is_current flag. Facts join to the surrogate key, so each fact is pinned to the attribute values that were true when the event happened — 'as-was' reporting. This is how you answer 'what region was this customer in when they made this purchase,' which is exactly the historical-accuracy requirement in finance, insurance, and healthcare.",
      code: "-- Type 2 via MERGE: close the old row, insert the new version\nMERGE INTO dim_customer t\nUSING staged_changes s ON t.customer_id = s.customer_id AND t.is_current\nWHEN MATCHED AND t.region <> s.region THEN\n  UPDATE SET valid_to = CURRENT_DATE - 1, is_current = false\n-- then a second step inserts the new row:\n--   new surrogate_key, valid_from = CURRENT_DATE,\n--   valid_to = '9999-12-31', is_current = true",
      noteLabel: "Model answer:",
      note: "\"Type 2 keeps full history by versioning rows.<br><br>When an attribute changes, I close the current row by setting its valid_to and clearing is_current, then insert a new row with a fresh surrogate key, a new valid_from, an open valid_to, and is_current true.<br><br>Because facts join on the surrogate key, every fact is pinned to the attribute values that were true at the time of the event — that's as-was reporting.<br><br>It's how I answer what region a customer was in when they bought, which is the non-negotiable historical-accuracy requirement in insurance, finance, and healthcare. I implement it with a MERGE on the natural key and the is_current flag.\"",
      followups: [
        "\"Walk me through the MERGE that implements Type 2.\"",
        "\"Which columns do you add to support Type 2?\"",
        "\"How does a fact get pinned to the right version?\""
      ]
    },
    {
      title: "SCD Type 3, and the higher types",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Type 3 keeps limited history in extra COLUMNS — a current_region and a previous_region column on the same row. It only remembers one (or a fixed few) prior values, so use it for the narrow case of 'compare current vs the immediately previous' — like a sales-territory realignment where you want to see both old and new groupings side by side. Beyond that: Type 0 = never changes (retain original, e.g. original signup date); Type 4 = move history to a separate mini-dimension/history table; Type 6 = a hybrid (1+2+3) combining a current-value column with Type 2 rows. Types 1 and 2 cover the vast majority; know 3 and mention the rest.",
      code: "-- Type 3: prior value in a column (only one level of history)\n-- customer_key | current_region | previous_region | changed_date\n--     42       | West           | East            | 2026-01-15",
      noteLabel: "Model answer:",
      note: "\"Type 3 keeps limited history in extra columns — a current value and a previous value on the same row.<br><br>It only remembers one prior value, so I use it for the narrow case of comparing current versus immediately previous — a sales-territory realignment where I want the old and new grouping side by side.<br><br>The others in brief: Type 0 never changes, for something like an original signup date. Type 4 moves history into a separate table. Type 6 is a hybrid that combines a current-value column with Type 2 rows.<br><br>In practice Types 1 and 2 cover almost everything; I reach for 3 only for that side-by-side comparison need.\"",
      followups: [
        "\"When is Type 3 actually the right choice over Type 2?\"",
        "\"What's a Type 0 attribute?\"",
        "\"What does Type 6 combine, and why?\""
      ]
    }
  ]
},

patterns: {
  intro: {
    title: "Modeling patterns & trade-offs — Kimball, Inmon, Data Vault, OBT",
    desc: "Beyond the star schema, interviewers check that you know the competing methodologies and when each fits — and the modern 'just make one big table' pressure. This is judgment territory: there's rarely one right answer, so what they're grading is whether you can articulate the trade-offs."
  },
  cards: [
    {
      title: "Kimball vs Inmon — bottom-up vs top-down",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The two classic warehouse philosophies. Kimball (bottom-up): build dimensional data marts (star schemas) per business process, tied together by conformed dimensions (the bus architecture); the 'warehouse' is the union of the marts. Fast to deliver value, analyst-friendly, most common in practice. Inmon (top-down): build one normalized (3NF) enterprise data warehouse as the single integrated source of truth first, then spin dimensional marts off it. More upfront effort and rigor, stronger for enterprise-wide consistency and complex integration. Most modern shops lean Kimball, sometimes Inmon-style integration layer feeding Kimball marts.",
      noteLabel: "Model answer:",
      note: "\"They're the two classic philosophies.<br><br>Kimball is bottom-up: I build dimensional star-schema marts per business process and tie them together with conformed dimensions. It delivers value fast and analysts can read it, so it's the most common in practice.<br><br>Inmon is top-down: build one normalized enterprise warehouse as the integrated source of truth first, then derive dimensional marts from it. More rigor and upfront cost, stronger when enterprise-wide integration and consistency are the priority.<br><br>Most shops I've seen lean Kimball, sometimes with an Inmon-style integration layer feeding Kimball marts. I'd pick based on how much cross-system integration the org actually needs.\"",
      followups: [
        "\"Which delivers business value faster, and why?\"",
        "\"When would you argue for an Inmon-style integration layer?\"",
        "\"How do the two approaches relate rather than compete?\""
      ]
    },
    {
      title: "Data Vault — when the star isn't enough",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Data Vault is a modeling approach for the raw integration layer, built for auditability and agility with many changing sources. It splits data into Hubs (business keys), Links (relationships between keys), and Satellites (descriptive attributes + history, effective-dated). It's highly normalized, insert-only, and tracks full lineage/load history — great for regulated environments and fast-changing source landscapes, because you add a source by adding hubs/links/sats without redesigning. The cost: many tables and complex queries, so you don't expose it to analysts — you build Kimball marts on top for consumption. Know it exists and its Hub/Link/Satellite structure.",
      noteLabel: "Model answer:",
      note: "\"Data Vault is for the raw integration layer when I have many, fast-changing sources and strong auditability needs.<br><br>It splits everything into hubs for business keys, links for relationships, and satellites for descriptive attributes with full history. It's highly normalized and insert-only, and it tracks complete load lineage.<br><br>The win is agility and audit: I onboard a new source by adding hubs, links, and satellites without redesigning existing structures, which suits regulated, integration-heavy environments.<br><br>The cost is a lot of tables and complex joins, so I never expose it to analysts directly — I build Kimball star marts on top for consumption.\"",
      followups: [
        "\"What are hubs, links, and satellites?\"",
        "\"Why not let analysts query the vault directly?\"",
        "\"What problem does Data Vault solve that a star schema struggles with?\""
      ]
    },
    {
      title: "One Big Table & the modern denormalization pressure",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "On modern columnar/cloud warehouses (BigQuery, Snowflake, Databricks SQL) there's real pressure toward wide, denormalized tables — even One Big Table (OBT), a single flat table with facts and all dimension attributes pre-joined. The argument: columnar storage compresses the redundancy away, joins are the expensive part, and a flat table is dead simple and fast for BI tools. The counter: OBT explodes when dimensions change (SCD history is awkward), duplicates logic, and loses the reusability conformed dimensions give. The mature take: star schema as the modeled core for correctness and reuse, then materialize wide OBT-style tables or a semantic layer on top for specific BI performance — not OBT as the primary model.",
      noteLabel: "Model answer:",
      note: "\"Modern columnar warehouses push toward wide, denormalized tables, sometimes a single One Big Table with the fact and all dimension attributes pre-joined.<br><br>The case for it is real: columnar storage compresses the redundancy, joins are the costly part, and a flat table is simple and fast for BI tools.<br><br>But OBT struggles with changing dimensions and SCD history, duplicates logic, and loses the reuse that conformed dimensions give.<br><br>So my mature take is to keep a star schema as the modeled core for correctness and reuse, then materialize wide tables or a semantic layer on top for specific BI performance. I use OBT as a serving optimization, not as the source model.\"",
      followups: [
        "\"Why is OBT tempting on a columnar warehouse?\"",
        "\"What does OBT make hard that a star schema handles well?\"",
        "\"How do you get OBT's read speed without losing the modeled core?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview Prep — data modeling questions with model answers",
    desc: "The modeling questions that actually come up, structured fundamentals → advanced. Each hides its model answer until you expand it, and ends with the follow-ups an interviewer digs with. Practice by designing on paper first, stating the grain out loud, then checking."
  },
  cards: [
    {
      title: "\"Design a dimensional model for [retail sales / e-commerce].\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "Whether you declare the grain first, pick the right fact type, and identify conformed dimensions — the core end-to-end modeling skill.",
      noteLabel: "Model answer:",
      note: "\"I start by declaring the grain: one row per order line item — the finest useful grain, so I can aggregate up to order, customer, or day.<br><br>The fact is fact_sales at that grain, with additive measures — quantity, unit_price rolled into extended_amount, discount — and foreign keys to the dimensions.<br><br>Dimensions are dim_date, dim_product, dim_customer, dim_store, and a degenerate order_number in the fact. dim_date is role-played if I need order vs ship date.<br><br>I'd make date, product, and customer conformed so returns and inventory facts can share them. Product and customer are Type 2 so I keep history. That's the star; I only add complexity if a real requirement forces it.\"",
      followups: [
        "\"What's the grain, and why that grain?\"",
        "\"Which dimensions are Type 2 and why?\"",
        "\"How would returns reuse this model?\""
      ]
    },
    {
      title: "\"A customer changes address — how do you handle it in the warehouse?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "SCD understanding — whether you ask 'does history matter?' before choosing, and can name the type.",
      noteLabel: "Model answer:",
      note: "\"First I ask whether history matters for that attribute.<br><br>If I need to know where the customer lived when each order was placed — for regional reporting or tax — that's SCD Type 2: I close the current dimension row and insert a new version with a new surrogate key and effective dates, so past facts stay pinned to the old address.<br><br>If the address is just a current contact detail and no report depends on its history, Type 1 — overwrite — is fine and cheaper.<br><br>So the answer is Type 2 for anything I report on over time, Type 1 for a pure correction or current-only attribute.\"",
      followups: [
        "\"How does Type 2 keep old orders tied to the old address?\"",
        "\"When would Type 1 be the right call here?\"",
        "\"What columns does Type 2 add to the dimension?\""
      ]
    },
    {
      title: "\"What's the grain of this fact table, and why does it matter?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "Whether grain is the first thing you reach for and whether you understand the consequences of getting it wrong.",
      noteLabel: "Model answer:",
      note: "\"The grain is what one row represents, and it's the first thing I declare when designing any fact.<br><br>It matters because it sets what questions I can answer. Too coarse — say one row per order instead of per line — and I can never analyze at the product-line level. Mixed grain, where some rows are per order and some per line, makes every SUM silently wrong.<br><br>So I pick the finest grain the business needs and the source supports, keep every row at that grain, and put different grains in different fact tables. I can always aggregate up from fine grain; I can never recover detail I didn't store.\"",
      followups: [
        "\"What happens to your aggregates if two grains mix in one table?\"",
        "\"Why finest grain rather than the grain the current report needs?\"",
        "\"How do you handle a genuinely different grain — a second fact?\""
      ]
    },
    {
      title: "\"Star or snowflake — which and why?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Whether you have a defensible default and understand the trade rather than reciting definitions.",
      noteLabel: "Model answer:",
      note: "\"I default to a star with denormalized dimensions.<br><br>Snowflaking normalizes the dimensions into sub-tables, which removes redundancy but adds joins to every query and makes the model harder for analysts to navigate.<br><br>On a columnar warehouse the storage saving barely matters because the redundancy compresses away, so the trade rarely pays.<br><br>I'd only snowflake a specific dimension if it were genuinely huge, shared across many stars, and changing in a way that duplication made painful to maintain. Otherwise star wins on query speed and legibility.\"",
      followups: [
        "\"What specifically would push you to snowflake one dimension?\"",
        "\"Why does the storage argument weaken on columnar storage?\"",
        "\"What's the analyst-experience cost of snowflaking?\""
      ]
    },
    {
      title: "\"Kimball vs Inmon — which would you use here?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Methodology awareness and whether you can reason about org context, not dogma.",
      noteLabel: "Model answer:",
      note: "\"Kimball is bottom-up — dimensional marts per process, tied together by conformed dimensions. It delivers value fast and is analyst-friendly, so it's my default.<br><br>Inmon is top-down — one normalized enterprise warehouse as the integrated source of truth first, then marts derived from it. More rigor and cost, stronger when enterprise-wide integration is the priority.<br><br>For most teams I'd start Kimball to ship value, and introduce an Inmon-style integration layer only if the org has many systems that genuinely need integrating before they're trustworthy. They're complementary more than opposed.\"",
      followups: [
        "\"Which ships business value faster?\"",
        "\"What signals tell you you need an integration layer?\"",
        "\"Where do conformed dimensions fit in Kimball?\""
      ]
    },
    {
      title: "\"How would you model a many-to-many between fact and dimension?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Bridge tables — a genuinely advanced modeling problem (e.g. a claim with multiple diagnoses, an account with multiple holders).",
      noteLabel: "Model answer:",
      note: "\"When one fact relates to many dimension members — a hospital claim with several diagnosis codes, or an account with multiple holders — I use a bridge table.<br><br>The bridge sits between the fact and the dimension, with a row per combination, often carrying a weighting factor so measures can be allocated without double-counting. The fact points at a group key, and the bridge maps that group to its members.<br><br>The thing I watch for is the double-counting trap: if I join through the bridge and sum naively, a claim with three diagnoses counts three times. The weighting factor, or careful use of the group key, is what prevents that.\"",
      followups: [
        "\"How does a bridge table avoid double-counting a measure?\"",
        "\"What's the weighting factor for?\"",
        "\"Model a patient with multiple simultaneous diagnoses on one claim.\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What is the FIRST thing you declare when designing a fact table?",
    options: [
      "The surrogate keys",
      "The grain — what a single row represents",
      "The partition column",
      "The measures"
    ],
    correct: 1
  },
  {
    q: "Why use a surrogate key on a dimension instead of the natural business key?",
    options: [
      "It looks cleaner",
      "SCD Type 2 makes the natural key non-unique (multiple versions per member); the surrogate distinguishes versions, insulates from source changes, and joins faster",
      "Natural keys aren't allowed in warehouses",
      "It saves storage on the fact"
    ],
    correct: 1
  },
  {
    q: "A customer's region changes and you must know their region at the time of each past order. Which SCD type?",
    options: [
      "Type 1 — overwrite",
      "Type 2 — new versioned row with effective dates, so facts stay pinned to the old value",
      "Type 0 — never change it",
      "Type 3 — a previous-value column"
    ],
    correct: 1
  },
  {
    q: "An account balance measure is summed across accounts fine, but summing it across days is nonsense. It is:",
    options: [
      "Fully additive",
      "Semi-additive — additive across most dimensions but not time (snapshot/average over time)",
      "Non-additive",
      "A degenerate dimension"
    ],
    correct: 1
  },
  {
    q: "You need one row per order that you UPDATE as it moves ordered → shipped → delivered, tracking time per step. Which fact type?",
    options: [
      "Transaction fact",
      "Accumulating snapshot fact",
      "Periodic snapshot fact",
      "Factless fact"
    ],
    correct: 1
  },
  {
    q: "Two teams each built their own dim_customer for their marts. What problem results?",
    options: [
      "Nothing — that's fine",
      "Stovepipe marts you can't compare/combine; conformed dimensions (one shared dim) are what enable cross-process analysis",
      "The warehouse runs out of surrogate keys",
      "Facts can no longer be partitioned"
    ],
    correct: 1
  },
  {
    q: "On a modern columnar warehouse, why does snowflaking dimensions usually NOT pay off?",
    options: [
      "Snowflaking is illegal in Snowflake",
      "Storage is cheap and the redundancy compresses away, so you'd add joins and hurt legibility for little gain",
      "Columnar warehouses can't do joins",
      "It always corrupts the fact table"
    ],
    correct: 1
  },
  {
    q: "Where does an order number (an identifier with no descriptive attributes) belong?",
    options: [
      "In its own dimension table",
      "As a degenerate dimension — a column in the fact table itself",
      "In dim_date",
      "It should be dropped"
    ],
    correct: 1
  },
  {
    q: "A hospital claim can have multiple diagnosis codes (many-to-many with the diagnosis dimension). How do you model it?",
    options: [
      "Put all codes in one comma-separated column",
      "A bridge table between fact and dimension, often with a weighting factor to avoid double-counting",
      "Duplicate the whole fact per code with no safeguards",
      "Ignore the extra codes"
    ],
    correct: 1
  },
  {
    q: "Which best describes the Kimball approach?",
    options: [
      "One normalized 3NF enterprise warehouse built first, marts derived after",
      "Bottom-up dimensional star-schema marts per business process, tied together by conformed dimensions",
      "Hubs, links, and satellites for the raw layer",
      "A single flat One Big Table for everything"
    ],
    correct: 1
  }
];
