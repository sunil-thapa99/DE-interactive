// Content data for the Power BI & Tableau module.
// Senior-DE interview focus: BI from the data engineer's seat — serving analytics-ready
// star-schema models to BI tools, the semantic layer, dimensional modeling, the engines
// (VertiPaq, hyper), DAX vs LOD, import vs DirectQuery, RLS, and dashboard performance.
const MODULE_ID = "powerbi";
const CONTENT = {

overview: {
  intro: {
    title: "BI & visualization from the data engineer's seat",
    desc: "For a DE, BI isn't about picking chart colors — it's about serving a model the BI tool can query fast and correctly. The dashboard is only as good as the star schema underneath it. This module frames Power BI and Tableau the way a senior DE has to: the warehouse model is the contract, the semantic layer is where metrics get defined once, and most 'slow dashboard' tickets are really data-modeling problems. We cover the DE's role in the BI stack, star schema as the interface, and the semantic layer that sits between your warehouse and the report."
  },
  cards: [
    {
      title: "What BI and visualization actually mean for a data engineer",
      badge: "fundamentals",
      conceptLabel: "What it is:",
      concept: "Business intelligence is the layer where the data you've engineered becomes decisions — dashboards, reports, and self-serve analytics in tools like Power BI and Tableau. As a data engineer you rarely build the final visuals, but you own everything the visual depends on: the tables, the grain, the relationships, and the refresh cadence.<br><br>The mental shift is that BI is a consumer of your pipeline, and it's a demanding one. Analysts and executives will slice the data in ways you never anticipated, so the model has to be flexible and fast under arbitrary filtering. A pipeline that lands correct data but in a shape the BI tool can't query efficiently has failed at the last mile.",
      noteLabel: "In practice:",
      note: "The dashboard is the tip of the iceberg; the model under it is your job.<br><br>When a stakeholder says 'the dashboard is slow' or 'the numbers don't tie out,' the root cause is almost always upstream: a bad grain, a missing dimension, a many-to-many relationship, or a metric defined three different ways in three different reports.<br><br>So the senior DE frames BI success as a modeling problem, not a charting problem. Serve a clean star schema with a well-defined grain and one source of truth for each metric, and the BI layer mostly takes care of itself.",
      followups: [
        { q: "\"If the DE doesn't build the charts, why does BI matter to the role?\"", a: "Because the chart is only as trustworthy and fast as the model feeding it. The DE owns the tables, grain, relationships, and refresh — every performance and correctness problem in the dashboard traces back to those. BI is the customer of your pipeline." },
        { q: "\"What's the most common last-mile failure you see?\"", a: "Landing correct data in a shape the BI tool can't query well — wrong grain, missing conformed dimension, or a many-to-many that inflates totals. The data is right but the model fights the tool. That's a modeling miss, not a viz problem." },
        { q: "\"How do you know if the model is BI-ready?\"", a: "It's a star schema with a clear grain, conformed dimensions, one-to-many relationships, and a single agreed definition per metric. If an analyst can filter and drill arbitrarily and still get fast, consistent numbers, it's ready." }
      ]
    },
    {
      title: "The DE's role — serving analytics-ready models to BI",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The data engineer's job in the BI stack is to deliver an analytics-ready model: cleaned, conformed, aggregated to a sensible grain, and shaped as a star schema the BI tool can consume directly. That means the heavy lifting — joins, deduplication, business logic, type casting — happens in the warehouse or transformation layer, not in the report.<br><br>The anti-pattern is pushing that work into the BI tool. When analysts build complex joins and business rules inside Power BI or Tableau, you get logic scattered across dozens of reports, no single source of truth, and painful performance. The DE's contribution is to centralize that logic upstream so the report is a thin presentation layer over a trustworthy model.",
      noteLabel: "In practice:",
      note: "Do the hard work upstream so the report doesn't have to.<br><br>If business logic lives in the warehouse — a clean gold-layer fact table joined to conformed dimensions — every BI tool that connects gets the same correct numbers. If it lives in the report, each report reinvents it slightly differently and they drift apart.<br><br>The signal of good DE work here is that the BI developer's job is easy: point at the fact table, drag in dimensions, done. If they're writing elaborate transformations in the tool, you left work on the table.",
      followups: [
        { q: "\"Why not just let analysts join tables in the BI tool?\"", a: "Because the logic then lives in dozens of reports and drifts. Each analyst joins slightly differently, definitions diverge, and there's no source of truth. Centralize joins and business rules upstream so every report inherits the same correct model." },
        { q: "\"Where should business logic live — warehouse or BI tool?\"", a: "The warehouse or transformation layer, for anything reusable. The BI tool should hold only presentation-level and lightweight metric logic. Heavy joins, dedup, and business rules belong upstream where they're defined once and versioned." },
        { q: "\"What does 'analytics-ready' concretely mean?\"", a: "Cleaned, conformed, aggregated to a sensible grain, and shaped as a star schema with one-to-many relationships. The BI developer should be able to connect, drag dimensions onto a fact, and get correct fast numbers with no further transformation." }
      ]
    },
    {
      title: "The star schema as the BI contract",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The star schema is the interface between your pipeline and the BI tool, and it's not optional — both Power BI and Tableau are built and optimized around it. A central fact table holds the measurable events at a defined grain, surrounded by dimension tables that hold the descriptive context you filter and group by. The relationships are one-to-many from dimension to fact.<br><br>Treating the star schema as a contract means the shape is a deliberate, stable commitment to your BI consumers, not an accident of how the source data happened to arrive. When you honor that contract, filtering is fast, relationships resolve unambiguously, and metrics aggregate correctly. When you violate it — a snowflaked mess, a fact at the wrong grain, a many-to-many — the tool fights you at every turn.",
      noteLabel: "In practice:",
      note: "BI tools don't just tolerate star schemas, they're engineered for them.<br><br>Power BI's engine resolves filters by propagating from the 'one' side (dimension) to the 'many' side (fact). Tableau's join and blend model assumes the same shape. Give them a clean star and everything just works; give them something else and you're constantly working around the tool.<br><br>So I design the gold layer as a star on purpose: fact at a documented grain, conformed dimensions shared across facts, one-to-many relationships. That shape is the promise I make to whoever builds the report.",
      followups: [
        { q: "\"Why is the star schema specifically a 'contract'?\"", a: "Because it's a deliberate, stable commitment about the shape the BI tool receives — fact grain, conformed dimensions, one-to-many relationships. Consumers build reports against that shape. Change it silently and you break every report, same as any contract." },
        { q: "\"What breaks when you hand a BI tool something other than a star?\"", a: "Filter propagation gets ambiguous, aggregations double-count, and performance tanks. The tools optimize filter flow from the one-side dimension to the many-side fact. A snowflake, wrong grain, or many-to-many fights that optimization constantly." },
        { q: "\"Where in the pipeline do you build the star?\"", a: "In the gold/serving layer of the transformation stage. Bronze and silver clean and conform; gold shapes the star — fact at a documented grain plus conformed dimensions — as the thing BI connects to. That's the presentation contract." }
      ]
    },
    {
      title: "The semantic layer — defining metrics once",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A semantic layer sits between the physical warehouse tables and the BI report, translating raw columns into business concepts: named metrics, dimensions, and relationships with agreed definitions. In Power BI this is the dataset/model with its DAX measures; in Tableau it's the published data source; increasingly it's a dedicated tool like dbt's semantic layer, LookML, or Cube that's tool-agnostic.<br><br>The point is to define 'revenue' or 'active user' exactly once, in one governed place, so every dashboard that references it gets the identical number. Without a semantic layer, each report redefines metrics in its own formulas, and you get the classic problem: three dashboards, three different revenue figures, and a meeting spent arguing about which is right instead of what the number means.",
      noteLabel: "In practice:",
      note: "The semantic layer is how you kill the 'whose number is right' argument.<br><br>Define each metric once — the filters, the grain, the exact aggregation — and publish it. Every report pulls that definition instead of re-deriving it. When the definition changes, it changes in one place and every dashboard updates.<br><br>A shared/tool-agnostic semantic layer (dbt, Cube, LookML) goes further: the same metric definition serves Power BI, Tableau, and a notebook identically. That consistency across tools is what a senior DE argues for when the org uses more than one BI tool.",
      followups: [
        { q: "\"Where does the semantic layer physically live?\"", a: "It can be the Power BI dataset with its DAX measures, a Tableau published data source, or a tool-agnostic layer like dbt's semantic layer, LookML, or Cube. The last kind serves every BI tool the same definition, which matters in multi-tool shops." },
        { q: "\"What problem does it actually solve?\"", a: "Metric drift — the same concept defined differently in every report. It defines 'revenue' or 'active user' once, with agreed filters and aggregation, so every dashboard returns the identical number. One place to change, one source of truth." },
        { q: "\"Is a star schema enough, or do you also need a semantic layer?\"", a: "You need both. The star schema shapes the physical tables; the semantic layer names and defines the metrics and relationships on top. The star makes queries fast and correct; the semantic layer makes definitions consistent across reports." }
      ]
    }
  ]
},

modeling: {
  intro: {
    title: "Dimensional modeling for BI — star schemas, grain & relationships",
    desc: "The modeling decisions that make or break a dashboard. Grain first, then fact vs dimension, why BI engines love star schemas, the denormalization tradeoff, the date dimension every model needs, one-to-many relationships, and the many-to-many trap that silently inflates your totals."
  },
  cards: [
    {
      title: "Grain first — the single most important modeling decision",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The grain of a fact table is what one row represents — one order line, one daily account balance, one page view. You decide the grain before anything else, because every other decision (which dimensions attach, which measures are additive, how you aggregate) follows from it. A clearly stated grain like 'one row per order line item' is the foundation of a correct model.<br><br>Getting the grain wrong is the most expensive mistake in dimensional modeling. Too coarse and you can't drill into detail the business needs; too mixed — rows at different grains in one table — and every aggregation double-counts or under-counts because you're summing things that aren't comparable. Senior DEs write the grain statement down and defend it, because a fact table with an ambiguous grain produces wrong numbers no BI tool can fix.",
      noteLabel: "In practice:",
      note: "State the grain in one sentence before you write a line of SQL.<br><br>'One row per order line item.' 'One row per account per day.' If you can't say it cleanly, the model isn't ready. A mixed-grain fact — order headers and order lines in the same table — is the classic source of totals that don't tie out.<br><br>Pick the finest grain the business realistically needs, because you can always aggregate up from fine detail but you can never recover detail you didn't store. Finer grain costs storage; coarse grain costs answers you can't give.",
      followups: [
        { q: "\"What happens if a fact table has mixed grain?\"", a: "Aggregations double-count or under-count because you're summing rows that aren't comparable — order headers and line items together, say. Totals won't tie out and no BI-side fix helps. One consistent grain per fact table is non-negotiable." },
        { q: "\"Coarse or fine grain — how do you choose?\"", a: "Pick the finest grain the business realistically needs. You can always aggregate fine detail up, but you can never recover detail you didn't store. Finer grain costs storage; too coarse costs you answers you can't give later." },
        { q: "\"Why state the grain before modeling anything else?\"", a: "Because every downstream choice depends on it — which dimensions attach, which measures are additive, how aggregation behaves. If the grain is ambiguous, those choices are ambiguous too. A one-sentence grain statement is the foundation of a correct model." }
      ]
    },
    {
      title: "Fact vs dimension — measurements vs context",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Facts and dimensions split your model along a clean line: facts are the things you measure, dimensions are the context you measure them by. A fact table holds numeric, additive measures — amounts, quantities, counts — plus foreign keys to dimensions, and it's typically tall and narrow with millions of rows. A dimension table holds descriptive attributes you filter and group by — customer name, product category, region, date — and it's typically short and wide.<br><br>The test is simple: if you'd sum or average it, it's a measure and belongs in a fact; if you'd filter, group, or label by it, it's an attribute and belongs in a dimension. Get this split right and the model reads naturally — 'sum of sales (fact) by product category (dimension) over time (date dimension).' That sentence is literally how a BI report is built.",
      noteLabel: "In practice:",
      note: "Facts are the verbs and numbers; dimensions are the nouns and adjectives.<br><br>Ask of each column: would I aggregate it, or would I slice by it? Sales amount, quantity, cost — aggregate, so fact. Category, region, status, customer — slice, so dimension.<br><br>Facts stay lean: keys and measures, nothing descriptive. Dimensions carry all the descriptive richness because that's what analysts filter and label with. When the split is clean, building a report is just 'measure by dimension,' which is exactly the shape BI tools expect.",
      followups: [
        { q: "\"Quick test for whether a column is a fact or a dimension?\"", a: "Would you aggregate it or slice by it? If you'd sum or average it (sales amount, quantity), it's a measure and belongs in the fact. If you'd filter, group, or label by it (category, region), it's an attribute and belongs in a dimension." },
        { q: "\"Why keep facts narrow and dimensions wide?\"", a: "Facts have millions of rows, so every extra column is expensive at scale — keep them to keys and measures. Dimensions are small, so they can be wide with rich descriptive attributes that analysts slice and label by. Shape follows how each is used." },
        { q: "\"Can an attribute ever live on the fact table?\"", a: "Occasionally — a 'degenerate dimension' like an order number with no other attributes sits on the fact. But generally descriptive context belongs in dimensions so it's shared, conformed, and not repeated across millions of fact rows." }
      ]
    },
    {
      title: "Why BI engines love star schemas — and the denormalization tradeoff",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "BI engines are optimized for star schemas because the shape makes query planning predictable: filters applied to small dimension tables propagate down to the large fact table through simple one-to-many joins, and the engine can prune and aggregate efficiently. A snowflake schema — dimensions normalized into sub-dimensions with extra joins — adds join hops that slow queries and complicate filter propagation, which is why BI favors the flatter, denormalized star.<br><br>The tradeoff is classic normalization versus denormalization. Denormalizing dimensions (flattening a product-category-subcategory hierarchy into one wide product dimension) means some redundancy and larger dimension tables, but far fewer joins at query time. For BI, where read performance and simplicity dominate and dimensions are small relative to facts, that redundancy is almost always worth it. You optimize for the read, not the write.",
      noteLabel: "In practice:",
      note: "Normalize for OLTP writes; denormalize for OLAP reads. BI is firmly the read side.<br><br>A star trades a little storage redundancy for far fewer joins and simpler filter propagation, and dimensions are tiny next to facts so the redundancy barely costs anything. That's why you flatten hierarchies into wide dimensions instead of snowflaking them.<br><br>The rule of thumb: if snowflaking saves you a few megabytes on a dimension but adds a join to every query over a billion-row fact, you've optimized the wrong side. Keep the star flat and let the fact table do the heavy lifting.",
      followups: [
        { q: "\"Why does a star query faster than a snowflake?\"", a: "Fewer join hops. In a star, small dimensions join directly to the fact one-to-many and filters propagate cleanly. A snowflake normalizes dimensions into sub-tables, adding joins per query and complicating filter flow. BI engines are tuned for the flat star." },
        { q: "\"Isn't denormalization bad practice?\"", a: "For OLTP writes, yes — you normalize to avoid update anomalies. But BI is read-optimized OLAP. There you denormalize deliberately: trade a little redundancy in small dimensions for far fewer joins on huge facts. You optimize for the read." },
        { q: "\"When would you accept a snowflake in a BI model?\"", a: "Rarely — maybe a very large dimension where a normalized sub-dimension genuinely saves meaningful storage, or a conformed hierarchy reused widely. But the default is flatten. If snowflaking adds a join to every query on a billion-row fact, it's the wrong trade." }
      ]
    },
    {
      title: "The date dimension — the one dimension every model needs",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Almost every BI model needs a dedicated date dimension: a table with one row per calendar date, carrying every attribute you'd ever slice time by — year, quarter, month, week, day of week, fiscal period, holiday flag, is-weekend. The fact table stores a date key that joins to it. This is standard practice, not optional polish, because time-based analysis is the backbone of nearly every dashboard.<br><br>The reason you build an explicit table instead of deriving date parts on the fly is twofold. First, it lets the BI tool do time intelligence — year-to-date, same-period-last-year, rolling averages — which in Power BI's DAX and Tableau both depend on a proper continuous date table marked as such. Second, it centralizes fiscal calendars and holiday logic in one place so every report treats 'Q1' or 'a business day' identically. Deriving date logic ad hoc in each report is how fiscal-year definitions drift.",
      noteLabel: "In practice:",
      note: "Build the date dimension once, mark it as the date table, and never derive dates ad hoc again.<br><br>Power BI's time-intelligence functions (TOTALYTD, SAMEPERIODLASTYEAR) require a marked date table with a contiguous range. Tableau's date handling assumes a real date field. Give them a proper date dimension and all the period-over-period analysis just works.<br><br>Crucially, it's where fiscal calendars and holidays live. Define fiscal Q1 and 'business day' once in the date dimension, and every report inherits the same definition instead of each analyst reinventing it slightly differently.",
      followups: [
        { q: "\"Why a date table instead of just using the timestamp column?\"", a: "Because time intelligence — YTD, same-period-last-year, rolling windows — needs a contiguous marked date table in Power BI DAX, and Tableau assumes a real date field. It also centralizes fiscal calendar and holiday logic so every report defines 'Q1' identically." },
        { q: "\"What should the date dimension contain?\"", a: "One row per calendar date across the full range, with year, quarter, month, week, day of week, fiscal period, holiday flag, and weekend flag. Anything you'd ever slice time by lives there so reports never re-derive it." },
        { q: "\"What breaks if you skip the date dimension?\"", a: "Time-intelligence functions fail or misbehave, and fiscal/holiday logic gets re-derived per report and drifts. You lose consistent period-over-period analysis and end up with different fiscal-year definitions across dashboards." }
      ]
    },
    {
      title: "One-to-many relationships and avoiding the many-to-many trap",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The healthy relationship in a star schema is one-to-many: one row in a dimension relates to many rows in the fact, and filters flow cleanly from the one side to the many side. This is what BI engines are built to resolve, and keeping every relationship one-to-many is what keeps aggregations correct and filter propagation unambiguous.<br><br>The many-to-many relationship is the trap. It arises when neither side has a unique key for the join — for example, joining sales directly to a sales-team table where reps belong to multiple teams. BI tools can sometimes handle it (Power BI has a many-to-many mode, Tableau relationships can too), but it silently inflates totals through fan-out: a single fact row matches multiple dimension rows and gets counted once per match. The senior fix is to resolve the many-to-many with a bridge table — an intermediate table that models the association explicitly — turning one problematic relationship into two clean one-to-many relationships.",
      noteLabel: "In practice:",
      note: "One-to-many is the shape you want everywhere; many-to-many is the bug that inflates your numbers.<br><br>When a fact joins to a dimension and neither side is unique on the key, you get fan-out: rows multiply and totals overcount. The classic symptom is a total that's suspiciously too high and grows when you add a dimension to the view.<br><br>The clean fix is a bridge table. Instead of sales-to-teams directly, insert a rep-team bridge, giving you sales-to-rep (one-to-many) and rep-team (one-to-many) with the association modeled explicitly. Two clean relationships beat one ambiguous one, and the totals come out right.",
      followups: [
        { q: "\"How does a many-to-many silently inflate totals?\"", a: "Through fan-out: a single fact row matches multiple dimension rows and gets counted once per match. The classic symptom is a total that's too high and grows when you add a dimension to the view. The join multiplied rows that should have stayed distinct." },
        { q: "\"What's a bridge table and how does it fix this?\"", a: "It's an intermediate table modeling the association explicitly — a rep-team bridge between sales and teams. It turns one problematic many-to-many into two clean one-to-many relationships (sales-to-rep, rep-team), so filters propagate correctly and totals stop double-counting." },
        { q: "\"Power BI supports many-to-many natively — why not just use it?\"", a: "Because it handles the relationship without erroring but still risks ambiguous filter propagation and inflated totals if you're not careful. A bridge table makes the association explicit and the aggregation predictable. Native many-to-many is a last resort, not the default." }
      ]
    }
  ]
},

powerbi: {
  intro: {
    title: "Power BI internals — VertiPaq, DAX, storage modes & security",
    desc: "The Power BI concepts a DE gets grilled on: the three storage modes (import, DirectQuery, composite/dual), how the VertiPaq columnar engine compresses and scans, measures vs calculated columns, the row-context/filter-context distinction that trips everyone up, CALCULATE, dataflows, incremental refresh, and Row-Level Security."
  },
  cards: [
    {
      title: "Import vs DirectQuery vs composite/dual storage modes",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Power BI has three storage modes, and choosing between them is a core DE decision. Import mode loads data into Power BI's in-memory VertiPaq engine — blazing fast queries because everything's compressed in RAM, but data is a snapshot that only updates on refresh, and it's bounded by memory. DirectQuery leaves data in the source and sends SQL to it on every interaction — always live and no size limit, but every filter click is a round-trip to the source, so it's slower and puts load on your warehouse.<br><br>Composite mode mixes them: some tables imported, some DirectQuery, in one model. Dual is a per-table mode that lets a table act as imported or DirectQuery depending on the query, which is the key to fast composite models — you typically set dimensions to dual so they can serve fast imported queries alongside a DirectQuery fact. The senior answer is that import is the default for speed, DirectQuery is for real-time or data-too-big-to-import, and composite with dual dimensions is how you get near-real-time facts without making every dimension lookup a source round-trip.",
      noteLabel: "In practice:",
      note: "Default to import for speed; reach for DirectQuery only when you must; use composite to get the best of both.<br><br>Import is the right answer most of the time — VertiPaq in memory is far faster than any round-trip. Choose DirectQuery when data is too large to import, when you need real-time freshness, or when governance forbids copying data out.<br><br>Composite is the nuanced play: keep a huge or real-time fact in DirectQuery, import the small dimensions, and mark those dimensions as dual so dimension-only queries stay fast in memory while fact queries hit the source. That dual setting is what stops every slicer from becoming a database round-trip.",
      followups: [
        { q: "\"When is DirectQuery actually the right choice?\"", a: "Three cases: the data is too large to fit in memory, you need real-time freshness rather than a refresh snapshot, or governance forbids copying data out of the source. Otherwise import is faster and the default. DirectQuery trades speed for liveness and scale." },
        { q: "\"What does setting a dimension to 'dual' buy you?\"", a: "The dimension can act as imported (fast, in-memory) for dimension-only queries and as DirectQuery when joined to a DirectQuery fact. It stops every slicer and filter on that dimension from becoming a source round-trip. Dual dimensions are what make composite models fast." },
        { q: "\"What's the downside of DirectQuery on the warehouse?\"", a: "Every user interaction — each filter, slicer, drill — sends live SQL to the source, so a popular dashboard can hammer the warehouse with concurrent queries. You have to size and tune the source for that load, and push aggregations down to keep it manageable." }
      ]
    },
    {
      title: "The VertiPaq columnar engine — why import mode is fast",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "VertiPaq is the in-memory columnar engine behind Power BI import mode (and Analysis Services Tabular). Instead of storing rows, it stores each column separately and compresses it hard using dictionary encoding (replacing repeated values with small integer codes), run-length encoding, and value encoding. Because analytical queries touch few columns but many rows, columnar storage means the engine reads only the columns a query needs and skips the rest entirely.<br><br>For a DE, the practical consequences are what matter. Compression — and therefore model size and speed — depends heavily on cardinality: low-cardinality columns (few distinct values, like a status or category) compress beautifully, while high-cardinality columns (unique IDs, precise timestamps, free-text) compress poorly and bloat the model. So you reduce model size by dropping unneeded high-cardinality columns, splitting datetime into separate date and time columns, and reducing numeric precision where you can. Understanding VertiPaq is understanding why the same row count can produce a 200MB model or a 2GB one.",
      noteLabel: "In practice:",
      note: "VertiPaq is columnar and cardinality-driven, so the way to a small, fast model is killing high-cardinality columns.<br><br>The single biggest lever is cardinality. A unique transaction ID or a full-precision datetime has millions of distinct values and compresses terribly. A status enum with five values compresses to almost nothing.<br><br>Concrete wins: drop columns the report doesn't use, split datetime into a low-cardinality date and a separate time, round numerics that don't need full precision, and avoid importing free-text you'll never filter on. Same rows, a fraction of the memory — and everything gets faster because the engine scans less.",
      followups: [
        { q: "\"Why does cardinality matter so much for model size?\"", a: "VertiPaq compresses via dictionary encoding — it replaces repeated values with small integer codes. Low-cardinality columns have few distinct values, so they compress to almost nothing; high-cardinality columns (unique IDs, precise timestamps) have millions and barely compress. Cardinality is the main driver of size." },
        { q: "\"Give concrete ways to shrink a Power BI model.\"", a: "Drop columns the report doesn't use, split datetime into a low-cardinality date plus a separate time column, reduce numeric precision where full precision isn't needed, and don't import free-text you won't filter on. All of it attacks high-cardinality bloat." },
        { q: "\"Why is columnar storage good for analytics specifically?\"", a: "Analytical queries touch few columns but many rows. Columnar storage lets the engine read only the columns a query needs and skip the rest, and it compresses each column independently. Row storage would force reading whole rows even to sum one column." }
      ]
    },
    {
      title: "DAX measures vs calculated columns — when each",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "DAX gives you two ways to compute, and confusing them is a classic mistake. A calculated column is computed row-by-row when the model refreshes, stored physically in the table, and takes memory like any column — it's evaluated in row context, one row at a time, and its value is fixed until the next refresh. A measure is computed at query time, on the fly, in response to the filters currently applied in the report — it's evaluated in filter context and stores nothing.<br><br>The rule: use a measure for anything you aggregate — sums, averages, ratios, anything that should respond to the report's filters and slicers. Use a calculated column only when you need a per-row value to filter, group, or relate on that doesn't already exist. Overusing calculated columns bloats the model (they're stored, often high-cardinality) and produces static values that don't respond to slicing. Most of the time, the answer is 'make it a measure.'",
      noteLabel: "In practice:",
      note: "Default to measures; reach for a calculated column only when you truly need a stored per-row value.<br><br>Measures compute at query time in filter context, so they respond to every slicer and cost no storage. That's what you want for any aggregation — total sales, margin %, YTD.<br><br>Calculated columns are stored and computed at refresh, so they're right only when you need a physical per-row attribute to group or filter by that doesn't exist yet — say, a bucketed age band. If you're tempted to make a calculated column for something you'll sum, stop: that's a measure. Overusing calculated columns bloats memory and gives you values that ignore the report's filters.",
      followups: [
        { q: "\"Simple rule for measure vs calculated column?\"", a: "If you'll aggregate it or it should respond to slicers, make it a measure — computed at query time in filter context, no storage. If you need a stored per-row attribute to group or filter on that doesn't exist yet, make a calculated column. Default to measure." },
        { q: "\"Why do calculated columns bloat the model?\"", a: "They're computed at refresh and stored physically like any column, taking memory — and they're often high-cardinality, which compresses poorly in VertiPaq. Measures store nothing; they compute on the fly. Overusing calculated columns is a common cause of oversized models." },
        { q: "\"Why don't calculated columns respond to slicers?\"", a: "Because they're evaluated once at refresh in row context and the value is frozen until the next refresh. Measures evaluate at query time in the current filter context, so they react to every slicer and filter. That's why aggregations must be measures." }
      ]
    },
    {
      title: "Row context vs filter context — the DAX concept everyone trips on",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "This is the concept that separates people who 'use DAX' from people who understand it. Row context is 'the current row' — it exists when DAX iterates a table, like inside a calculated column or an iterator function (SUMX, FILTER), where the expression sees one row at a time. Filter context is 'the set of filters currently applied' — it comes from the report's slicers, rows and columns of a visual, and filter arguments, and it defines which rows a measure aggregates over.<br><br>A measure evaluates in filter context: put [Total Sales] in a matrix by region, and each cell computes over the rows the region filter allows. A calculated column evaluates in row context: it sees its own row but not the report's filters. The crux is that they're different mechanisms, and the function that converts between them is CALCULATE — it can take a row context and materialize it as a filter (context transition), which is why CALCULATE is both powerful and the source of most DAX confusion.",
      noteLabel: "In practice:",
      note: "Row context is 'this one row'; filter context is 'which rows are in scope right now.'<br><br>A calculated column runs in row context — it knows its own row's values but is blind to the report's slicers. A measure runs in filter context — it aggregates over whatever the current slicers, visual axes, and filters allow, which is why the same measure gives different numbers in different cells of a matrix.<br><br>Mixing them up is the root of most 'why is my number wrong' DAX bugs. The bridge is CALCULATE, which can turn a row context into a filter context (context transition). Once you can say which context an expression is in, DAX stops being mysterious.",
      followups: [
        { q: "\"Define row context and filter context in one line each.\"", a: "Row context is 'the current row' — present when DAX iterates a table (calculated columns, SUMX, FILTER). Filter context is 'the set of filters currently applied' — from slicers, visual axes, and filter arguments — and it defines which rows a measure aggregates over." },
        { q: "\"Why does the same measure show different numbers in different cells?\"", a: "Because measures evaluate in filter context, and each cell of a matrix imposes a different filter (this region, this month). The measure aggregates over only the rows that cell's filters allow. Same formula, different context, different result." },
        { q: "\"What's context transition?\"", a: "It's CALCULATE turning the current row context into an equivalent filter context — taking 'this row' and materializing it as a filter on the model. It's why CALCULATE inside an iterator behaves the way it does, and it's the single biggest source of DAX confusion." }
      ]
    },
    {
      title: "CALCULATE — the function that rewrites filter context",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "CALCULATE is the most important function in DAX because it's the one that modifies filter context. It evaluates an expression under a filter context you specify, adding, removing, or overriding filters. That's what powers nearly every non-trivial measure: percent of total (remove the filter on a dimension with ALL), same-period-last-year (shift the date filter), sales for a specific category regardless of what's sliced (override the category filter).<br><br>For example, CALCULATE([Total Sales], ALL(Product)) computes total sales ignoring any product filter, which is exactly what you divide by to get percent-of-total. CALCULATE(..., Product[Category] = \"Bikes\") computes sales filtered to bikes no matter the visual's own filters. And because CALCULATE performs context transition, wrapping a measure in it inside an iterator turns the current row into a filter — the mechanism behind row-level measure evaluation. Understanding that CALCULATE manipulates the filter context is the key that unlocks advanced DAX.",
      noteLabel: "In practice:",
      note: "CALCULATE is the verb 'change the filters, then compute.'<br><br>Almost every interesting measure is CALCULATE plus a filter modifier. Percent of total: CALCULATE with ALL to strip the filter you want to divide against. Time intelligence: CALCULATE with SAMEPERIODLASTYEAR or DATEADD to shift the date filter. Fixed subsets: CALCULATE with an explicit filter to pin a category regardless of the visual.<br><br>The mental model is: CALCULATE takes your expression, applies the filter changes you hand it, and evaluates in that new context. Once you see it as 'the filter-context editor,' the advanced patterns fall into place — and so does why it's the function interviewers probe hardest.",
      followups: [
        { q: "\"What does CALCULATE fundamentally do?\"", a: "It evaluates an expression under a modified filter context — adding, removing, or overriding filters you specify. Nearly every non-trivial measure is CALCULATE plus a filter modifier. It's the only common function that rewrites filter context, which is why it's central to DAX." },
        { q: "\"How would you compute percent of total with CALCULATE?\"", a: "Divide the measure by the same measure wrapped in CALCULATE([Measure], ALL(Dimension)), which removes the dimension's filter so the denominator is the grand total. ALL strips the filter you want to divide against — that's the standard percent-of-total pattern." },
        { q: "\"How does CALCULATE enable time intelligence?\"", a: "By shifting the date filter. CALCULATE([Sales], SAMEPERIODLASTYEAR(Date[Date])) or DATEADD re-applies the measure over a shifted date range. The date table plus CALCULATE's filter manipulation is what makes YTD, prior-year, and rolling windows work." }
      ]
    },
    {
      title: "Dataflows, incremental refresh & Row-Level Security",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Three operational features a DE owns. Dataflows are Power BI's reusable, cloud-hosted ETL — Power Query transformations that run in the service and land results (often in Azure Data Lake), so multiple datasets share the same cleaned, conformed tables instead of each report re-doing the prep. They're the self-service ETL layer that centralizes transformation logic across reports.<br><br>Incremental refresh partitions a large table by date and refreshes only the recent partitions instead of reloading everything, so a billion-row fact refreshes in minutes by touching only the last few days. You configure a range (e.g. store 5 years, refresh the last 10 days) and Power BI manages the partitions. Row-Level Security (RLS) restricts which rows a user sees by defining roles with DAX filter expressions — a sales rep sees only their region, an exec sees all — enforced at query time so the same report shows each person only their permitted data. Dynamic RLS uses USERPRINCIPALNAME() to filter by the logged-in user against a mapping table, so you don't hand-maintain a role per person.",
      noteLabel: "In practice:",
      note: "Dataflows centralize prep, incremental refresh makes big tables refreshable, and RLS secures per-user data — all DE responsibilities.<br><br>Reach for dataflows when several reports need the same cleaned tables, so the Power Query logic lives once in the service instead of copy-pasted per report. Configure incremental refresh on any large date-partitioned fact so you refresh the last N days, not the whole history — the difference between a 3-minute and a 3-hour refresh.<br><br>For RLS, prefer dynamic RLS: one role with a DAX filter like Region[Manager] = USERPRINCIPALNAME() against a user-to-region mapping table, so access scales without a role per person. It's enforced at query time, so users physically cannot pull rows they're not entitled to.",
      followups: [
        { q: "\"What problem do dataflows solve?\"", a: "Duplicated prep logic. Instead of each report re-doing the same Power Query cleaning and conforming, a dataflow runs that transformation once in the service and lands reusable tables. Multiple datasets share the same cleaned source — centralized, self-service ETL." },
        { q: "\"How does incremental refresh work and why use it?\"", a: "It partitions a large table by date and refreshes only recent partitions instead of reloading everything. You set a policy like 'store 5 years, refresh last 10 days.' A billion-row fact then refreshes in minutes, not hours, because it only touches recent data." },
        { q: "\"Static vs dynamic RLS — what's the difference?\"", a: "Static RLS defines a role per group with a hard-coded filter (a role per region). Dynamic RLS uses USERPRINCIPALNAME() against a user-to-region mapping table, so one role filters by whoever's logged in. Dynamic scales without maintaining a role per person." },
        { q: "\"Is RLS actually secure or just cosmetic?\"", a: "It's enforced at query time in the engine — the filter is applied before rows are returned, so a user physically cannot retrieve rows outside their role, even via drill-through or export. It's real row filtering, not UI hiding. It does need correct role and mapping setup." }
      ]
    }
  ]
},

tableau: {
  intro: {
    title: "Tableau internals — extracts, LOD, order of operations & fit",
    desc: "The Tableau concepts that map to the same DE concerns as Power BI: extracts (hyper) vs live connections, LOD expressions for controlling aggregation grain, context filters and Tableau's order of operations, dashboard performance, and the honest 'Tableau vs Power BI' comparison."
  },
  cards: [
    {
      title: "Extracts (hyper) vs live connections",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Tableau's storage choice mirrors Power BI's import-vs-DirectQuery split. A live connection queries the source database directly on every interaction — always current, no copy, but every filter and drill is a round-trip whose speed depends entirely on the source. An extract is a compressed, columnar snapshot stored in Tableau's hyper engine — an in-memory-optimized columnar format (the analog of VertiPaq) that makes queries fast and offloads work from the source, at the cost of being a point-in-time snapshot that only updates on refresh.<br><br>The decision logic is the same as Power BI's. Use an extract for speed, to reduce load on the source, and when data doesn't need to be real-time — which covers most dashboards. Use a live connection when you need up-to-the-minute freshness, when the data is too large to extract, or when governance requires querying in place. And extracts support incremental refresh too, so you can append new rows rather than rebuilding the whole thing.",
      noteLabel: "In practice:",
      note: "Extract for speed, live for freshness — the same call you make with import vs DirectQuery.<br><br>Hyper is Tableau's columnar engine, the direct analog of VertiPaq: compress the data into a fast snapshot and most dashboards fly. That's the default for performance and for taking load off the warehouse.<br><br>Go live only when you genuinely need real-time data, the dataset is too big to extract, or policy forbids copying it. And for large extracts, use incremental extract refresh to append only new rows instead of rebuilding — the Tableau equivalent of Power BI incremental refresh.",
      followups: [
        { q: "\"What's hyper and what's it analogous to?\"", a: "Hyper is Tableau's in-memory-optimized columnar engine that stores extracts. It's the direct analog of Power BI's VertiPaq — compress data columnar for fast queries. An extract on hyper is to Tableau what import mode is to Power BI." },
        { q: "\"When would you choose a live connection?\"", a: "When you need up-to-the-minute freshness, the data is too large to extract, or governance requires querying in place rather than copying data out. Otherwise an extract is faster and lighter on the source — the default for most dashboards." },
        { q: "\"Do extracts support incremental refresh?\"", a: "Yes — incremental extract refresh appends only new rows (based on a chosen column) instead of rebuilding the whole extract. It's the Tableau equivalent of Power BI's incremental refresh, and it's how you keep large extracts refreshable in reasonable time." }
      ]
    },
    {
      title: "LOD expressions — FIXED, INCLUDE, EXCLUDE",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Level-of-Detail (LOD) expressions are Tableau's mechanism for computing aggregations at a grain different from the visual's grain — the rough analog of controlling filter context in DAX. By default a Tableau viz aggregates at the level of the dimensions on the view; LOD expressions override that. FIXED computes a value at a specified set of dimensions regardless of what's in the view — {FIXED [Customer] : SUM([Sales])} gives sales per customer no matter how the visual is sliced, which is how you compute things like customer lifetime value or percent-of-a-fixed-total.<br><br>INCLUDE computes at a finer grain than the view (adding dimensions to the aggregation) then rolls up — useful for average-of-a-finer-thing like average sales per store shown at region level. EXCLUDE computes at a coarser grain by removing dimensions from the aggregation — useful for percent-of-total-type comparisons against a broader group. The one that matters most for interviews is FIXED, because its independence from the view's filters (it responds only to context filters, not dimension filters) is exactly the aggregation-grain control that trips people up, the same way filter context does in DAX.",
      noteLabel: "In practice:",
      note: "LOD expressions let you aggregate at a grain that isn't the visual's grain — Tableau's version of taking control of the aggregation context.<br><br>FIXED is the workhorse: compute at a set grain regardless of the view. Customer lifetime value, first-purchase date per customer, share of a fixed total — all FIXED. INCLUDE goes finer then rolls up (average per store shown at region). EXCLUDE goes coarser (compare a row to its group total).<br><br>The gotcha to know cold: FIXED ignores dimension filters but does respect context filters, which is why FIXED and context filters come up together — it's about where FIXED sits in Tableau's order of operations.",
      followups: [
        { q: "\"What does each LOD keyword do?\"", a: "FIXED computes at a specified grain regardless of the view. INCLUDE computes at a finer grain than the view (adds dimensions) then rolls up. EXCLUDE computes at a coarser grain (removes dimensions). All three override the view's default aggregation level." },
        { q: "\"Give a real use for FIXED.\"", a: "Customer lifetime value: {FIXED [Customer] : SUM([Sales])} gives total sales per customer no matter how the visual is sliced. Also first-purchase-date per customer, or percent of a fixed total. FIXED pins the grain independent of the view." },
        { q: "\"Does FIXED respect filters?\"", a: "It ignores dimension (normal) filters but does respect context filters, because of where it sits in Tableau's order of operations — FIXED is computed after context filters but before dimension filters. That interaction is the classic FIXED gotcha." }
      ]
    },
    {
      title: "Context filters & Tableau's order of operations",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Tableau evaluates a viz through a defined order of operations, and knowing it explains most 'why is my filter not working' surprises. The sequence runs roughly: context filters first, then FIXED LOD expressions, then dimension filters, then INCLUDE/EXCLUDE LODs, then measure filters, then totals. Because FIXED sits above ordinary dimension filters in that order, a FIXED calculation ignores your regular filters — which is by design but surprises people.<br><br>A context filter is a filter you promote to run first, creating a filtered subset that everything downstream (including FIXED LODs) operates on. That's how you make a FIXED expression respect a filter: put the filter in context. It's also a performance tool — a context filter that dramatically cuts the data means all subsequent filters and calculations work on a smaller set. The senior point is that the order of operations isn't trivia; it's the model you use to reason about why a number is what it is and where to intervene.",
      noteLabel: "In practice:",
      note: "The order of operations is the map for debugging any 'my filter isn't doing what I expect' problem.<br><br>The key fact: context filters run first, then FIXED LODs, then normal dimension filters. So a FIXED expression is blind to a regular filter — if you need FIXED to honor a filter, promote that filter to context. That single interaction is behind most FIXED confusion.<br><br>Context filters also help performance: promote a filter that slashes the row count and everything after it works on less data. But they have overhead, so use them where they materially cut the set or where you specifically need something upstream of FIXED, not everywhere.",
      followups: [
        { q: "\"Roughly what is Tableau's order of operations?\"", a: "Context filters first, then FIXED LODs, then dimension filters, then INCLUDE/EXCLUDE LODs, then measure filters, then totals. The order explains why FIXED ignores normal filters (it runs before them) and why context filters affect everything downstream." },
        { q: "\"How do you make a FIXED expression respect a filter?\"", a: "Promote that filter to a context filter. Context filters run before FIXED LODs in the order of operations, so FIXED will operate on the context-filtered subset. Regular dimension filters run after FIXED, so FIXED ignores them by default." },
        { q: "\"When is a context filter a performance win?\"", a: "When it dramatically cuts the row count, because every filter and calculation after it then works on a smaller set. It has some overhead, so use it where it materially reduces the data or where you specifically need something upstream of FIXED — not on every filter." }
      ]
    },
    {
      title: "Dashboard performance in Tableau",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Slow Tableau dashboards usually come from a handful of causes, and most are addressable by the DE. Too many marks — a viz trying to render hundreds of thousands of points — is a common killer; aggregate or filter to what's actually readable. Live connections to a slow source turn every interaction into a round-trip, so extracts fix a lot of performance complaints outright. Overly complex calculations, especially nested LODs and table calcs evaluated per mark, add up; pushing that logic into the extract or the source is faster.<br><br>Other frequent causes: too many filters, especially 'only relevant values' quick filters that each query the data, and too many worksheets crammed on one dashboard so every view has to render. The DE's leverage is upstream: serve a well-aggregated extract at the right grain, minimize high-cardinality fields, and move heavy calculations into the data source so Tableau renders rather than computes. Tableau's Performance Recorder is the tool to find which query or render step is actually the bottleneck instead of guessing.",
      noteLabel: "In practice:",
      note: "Most slow dashboards are too many marks, a slow live connection, or heavy calcs — and the DE can fix all three from upstream.<br><br>Reduce marks: aggregate and filter to what a human can actually read; nobody interprets 200,000 points. Use an extract instead of a slow live connection to kill round-trips. Push complex calculations into the extract or the warehouse so Tableau renders precomputed values instead of computing per mark.<br><br>Watch quick filters set to 'only relevant values' — each one queries the data on interaction. And use the Performance Recorder to find the real bottleneck rather than optimizing blind. The theme is the same as Power BI: fix it in the model, not the visual.",
      followups: [
        { q: "\"What are the most common causes of a slow Tableau dashboard?\"", a: "Too many marks to render, a live connection to a slow source, overly complex calculations (nested LODs, per-mark table calcs), too many quick filters querying the data, and too many worksheets on one dashboard. Most are fixable upstream by the DE." },
        { q: "\"How does a DE improve Tableau performance from upstream?\"", a: "Serve a well-aggregated extract at the right grain, minimize high-cardinality fields, and push heavy calculations into the extract or warehouse so Tableau renders precomputed values instead of computing per mark. Same principle as Power BI — fix it in the model." },
        { q: "\"How do you find the actual bottleneck?\"", a: "Tableau's Performance Recorder — it breaks down time by query execution, connecting to the data source, and rendering, so you optimize the real slow step instead of guessing. Often it reveals one expensive query or an over-dense render, not what you assumed." }
      ]
    },
    {
      title: "When Tableau vs when Power BI",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "Both are mature BI tools with a hyper/VertiPaq columnar engine, extract/live (import/DirectQuery) modes, and rich modeling — so the honest answer is 'it depends on context,' not 'X is better.' Power BI's strengths: deep Microsoft/Azure integration, lower cost especially with Microsoft licensing, DAX's power for complex measures, and a strong self-service semantic model. It's the natural fit for Microsoft-centric organizations and Excel-heavy analyst cultures.<br><br>Tableau's strengths: best-in-class visual exploration and flexibility, a very strong analyst/visualization community, and often-cited superiority for open-ended visual analysis and beautiful, highly-customized dashboards. It's platform-agnostic, which matters if you're not on Azure. For a DE the reassuring part is that the underlying data-engineering job is nearly identical either way: serve a clean star schema with a well-defined grain and a semantic layer, and both tools consume it well. The tool choice is mostly about ecosystem, cost, and analyst preference, not about how you engineer the data.",
      noteLabel: "In practice:",
      note: "The DE work is the same for both; the choice is ecosystem, cost, and culture.<br><br>Power BI wins on Microsoft/Azure integration and cost, and DAX is extremely powerful for complex measures — the default for Microsoft shops. Tableau wins on visual exploration flexibility and a strong viz community — favored where open-ended analysis and dashboard craft matter most, and where you're not tied to Azure.<br><br>What I emphasize as a DE is that it barely changes my job: a clean star schema, correct grain, conformed dimensions, and a semantic layer serve both tools well. So I don't over-index on the tool debate — I make the model excellent and either tool shines on top of it.",
      followups: [
        { q: "\"Does the tool choice change the data engineering work?\"", a: "Barely. Both consume a clean star schema with a well-defined grain, conformed dimensions, and a semantic layer. The engineering job — model shape, grain, refresh, security — is nearly identical. The choice is ecosystem, cost, and analyst preference, not data architecture." },
        { q: "\"When does Power BI make more sense?\"", a: "Microsoft/Azure-centric organizations, cost-sensitive shops (especially with existing Microsoft licensing), Excel-heavy analyst cultures, and teams that need DAX's power for complex measures. Its Azure integration and price are the usual deciding factors." },
        { q: "\"When does Tableau make more sense?\"", a: "When open-ended visual exploration and highly-customized, polished dashboards are the priority, when you have a strong Tableau/viz community, and when you're not tied to the Microsoft ecosystem. Tableau is platform-agnostic and often preferred for visualization craft." }
      ]
    }
  ]
},

performance: {
  intro: {
    title: "BI performance — model size, cardinality, aggregations & pushdown",
    desc: "Why dashboards are slow and how a DE fixes it from the model out: controlling model size and cardinality, star vs snowflake for BI performance, aggregation tables, reducing scan with DirectQuery pushdown, refresh and extract strategy, and a checklist of common slow-dashboard causes and their fixes."
  },
  cards: [
    {
      title: "Model size and cardinality — the root of most slowness",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "In columnar engines like VertiPaq and hyper, performance and memory are dominated by cardinality — the number of distinct values in a column — not just row count. High-cardinality columns (unique IDs, full-precision timestamps, free text, high-precision decimals) compress poorly, bloat the model, and slow every scan; low-cardinality columns compress to almost nothing and are fast. So the first lever for a fast dashboard is a small model, and the way to a small model is attacking cardinality.<br><br>Concretely: drop columns the report doesn't use (every column is stored and scanned), split datetime into a low-cardinality date plus a separate time column, reduce numeric precision where full precision isn't needed, and don't import free-text you'll never filter on. A model that's a fraction of the size scans a fraction of the data and responds faster on every interaction. This is the highest-leverage performance work a DE does, and it happens in the model, not the report.",
      noteLabel: "In practice:",
      note: "Small model, fast dashboard — and small means low cardinality, not just fewer rows.<br><br>The engine compresses by distinct values, so a unique transaction ID or a to-the-second timestamp is poison: millions of distinct values, terrible compression, slow scans. A five-value status enum is nearly free.<br><br>The moves are always the same: drop unused columns, split datetime, round numerics, drop free text you won't filter on. Same rows, a fraction of the memory, faster on every click. When someone hands me a slow dashboard, model size is the first thing I check.",
      followups: [
        { q: "\"Why cardinality over row count?\"", a: "Columnar engines compress by distinct values via dictionary encoding. A column with millions of distinct values (unique ID, precise timestamp) compresses terribly and scans slowly, regardless of whether the table has a million or a billion rows. Cardinality drives both size and scan speed." },
        { q: "\"First things you'd do to shrink a slow model?\"", a: "Drop unused columns, split datetime into date + time, reduce numeric precision where full precision isn't needed, and drop free-text you won't filter on. All of it attacks high-cardinality columns, which are what bloat the model and slow scans." },
        { q: "\"Why does a smaller model respond faster on every click?\"", a: "Because the engine scans less data per query. Fewer, lower-cardinality columns mean less to read and decompress for each filter and aggregation. Model size directly determines interaction latency, which is why it's the highest-leverage performance lever." }
      ]
    },
    {
      title: "Star vs snowflake for BI performance",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "For BI specifically, the star schema outperforms the snowflake, and the reason is join hops. A star joins small dimensions directly to the large fact with a single one-to-many hop each, so filter propagation is one step and the engine's query plan is simple. A snowflake normalizes dimensions into sub-dimensions, so filtering by, say, product subcategory means traversing multiple joins to reach the fact — more hops, more complex plans, slower queries.<br><br>The tradeoff people cite for snowflaking is storage: normalizing removes redundancy. But in BI, dimensions are tiny relative to the fact, so the storage saved is negligible while the per-query join cost is paid on every interaction over a huge fact. That's a bad trade. The senior position is: denormalize dimensions into a flat star for BI, accept the small redundancy, and reserve snowflaking for the rare genuinely-huge dimension where normalization saves meaningful space — and even then, weigh it against the query cost.",
      noteLabel: "In practice:",
      note: "For BI, flatten to a star; snowflaking optimizes the wrong side.<br><br>Snowflaking saves storage on dimensions, but dimensions are small and the fact is huge — so you save megabytes and pay a join on every query over billions of rows. That's backwards for a read-optimized BI workload.<br><br>Flatten the hierarchy into a wide dimension (product with category and subcategory as columns, not separate tables). One hop to the fact, simple filter propagation, fast queries. I only consider snowflaking a truly massive dimension where normalization saves real space, and even then I check whether the added join cost is worth it.",
      followups: [
        { q: "\"Why is a star faster than a snowflake for BI?\"", a: "Fewer join hops. A star joins small dimensions directly to the fact in one one-to-many hop, so filter propagation is one step and query plans stay simple. A snowflake adds joins through sub-dimensions, so every filter traverses more hops over the huge fact." },
        { q: "\"Snowflaking saves storage — why not do it?\"", a: "Because in BI, dimensions are tiny next to the fact. You save negligible storage but pay an extra join on every query over billions of fact rows. That's optimizing the write side at the read side's expense, exactly backwards for a read-heavy BI workload." },
        { q: "\"Is snowflaking ever justified in BI?\"", a: "Rarely — a genuinely massive dimension where normalization saves meaningful storage, or a conformed hierarchy reused across many models. Even then you weigh the storage saved against the per-query join cost. The default for BI is a flat, denormalized star." }
      ]
    },
    {
      title: "Aggregation tables — precompute the expensive rollups",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "When a fact table is huge but most dashboards query it at a coarse grain (monthly totals by region, not individual transactions), aggregation tables are the fix. You precompute the rollup — a smaller table already summarized to month/region — and the BI tool answers common queries from the small aggregate instead of scanning the billion-row detail every time. Power BI formalizes this with aggregations: you define an aggregation table over a DirectQuery fact, and the engine automatically redirects queries it can answer from the aggregate to the fast in-memory summary, falling back to DirectQuery detail only when a query needs finer grain.<br><br>This is the same idea as materialized views in a warehouse, applied at the BI layer: trade some storage and refresh cost to precompute expensive aggregations once, so thousands of dashboard interactions read a tiny table instead of scanning the full fact. It's especially powerful with DirectQuery, where it lets most interactions hit a fast in-memory aggregate and only the rare drill-to-detail touches the source.",
      noteLabel: "In practice:",
      note: "If most queries are coarse but the fact is huge, precompute the rollup and serve from it.<br><br>Power BI aggregations let you define a summarized table over a DirectQuery fact; the engine auto-redirects matching queries to the fast in-memory aggregate and only falls back to the source for finer grain. Most interactions never touch the billion-row detail.<br><br>It's the BI-layer version of a materialized view: pay a little storage and refresh to precompute the expensive rollups once, and every dashboard read after that is cheap. Ideal when you have a real-time-ish DirectQuery fact but the common questions are monthly or regional totals.",
      followups: [
        { q: "\"When do aggregation tables pay off?\"", a: "When the fact is huge but most dashboard queries are at a coarse grain — monthly totals by region, not individual transactions. You precompute the rollup so common queries read a tiny summary instead of scanning the full detail every time." },
        { q: "\"How do Power BI aggregations work with DirectQuery?\"", a: "You define an aggregation table (imported, in-memory) over a DirectQuery fact. The engine automatically redirects queries it can answer from the aggregate to the fast summary and only falls back to DirectQuery for finer grain. Most interactions never hit the source." },
        { q: "\"What's the analogy to warehouse concepts?\"", a: "It's a materialized view applied at the BI layer — precompute expensive aggregations once, trading storage and refresh cost so thousands of reads are cheap. Same trade-off: pay to precompute so the common query is fast." }
      ]
    },
    {
      title: "Reducing scan — DirectQuery pushdown and query folding",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "With DirectQuery (and Tableau live connections), performance depends on how much work gets pushed down to the source versus done by the BI tool after pulling data back. Pushdown (query folding in Power Query terms) means the tool translates filters, aggregations, and joins into SQL the source executes, so the warehouse does the heavy lifting on its own engine and returns only the small result. When folding breaks — because a transformation can't be expressed in SQL — the tool pulls raw data and processes it locally, which is slow and defeats the point.<br><br>The DE's job is to keep operations foldable: apply filters and aggregations in ways the source can execute, avoid transformations that break folding, and let the powerful warehouse do the scanning and grouping rather than dragging rows into the BI tool. Combined with a source that's well-indexed/clustered and partitioned, pushdown means a DirectQuery dashboard can be fast because the warehouse answers each query efficiently and returns a tiny aggregate, not because the BI tool is doing anything clever.",
      noteLabel: "In practice:",
      note: "In DirectQuery, the win is pushing work to the source, not pulling data to the tool.<br><br>Query folding is the mechanism: filters and aggregations get compiled to SQL the warehouse runs, so it scans and groups on its own engine and hands back a small result. Break folding — with a transform SQL can't express — and the tool drags raw rows over and processes locally, which is slow.<br><br>So I keep transformations foldable and lean on the warehouse's strengths: partitioning, clustering, and indexes so each pushed-down query scans little. A DirectQuery dashboard is fast when the source answers efficiently and returns an aggregate, not when the BI tool is doing the work." ,
      followups: [
        { q: "\"What is query folding / pushdown?\"", a: "The BI tool translating filters, aggregations, and joins into SQL the source executes, so the warehouse does the heavy work on its own engine and returns only a small result. It's how DirectQuery and live connections stay fast — the source scans, not the BI tool." },
        { q: "\"What happens when folding breaks?\"", a: "The tool can't express the transformation in SQL, so it pulls raw data back and processes it locally — slow, memory-heavy, and it defeats the purpose of DirectQuery. Keeping operations foldable is how you avoid dragging rows into the tool." },
        { q: "\"How does the source setup help pushdown?\"", a: "A well-partitioned, clustered, and indexed source means each pushed-down query scans little and returns fast. Pushdown sends the work to the warehouse, so the warehouse's physical design (partition pruning, clustering) directly determines DirectQuery dashboard speed." }
      ]
    },
    {
      title: "Common slow-dashboard causes and their fixes",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Slow dashboards trace to a short, recurring list, and a senior DE diagnoses from the model outward. Oversized model from high-cardinality columns — fix by dropping columns, splitting datetime, reducing precision. Wrong storage mode — a DirectQuery model where import would be far faster, or vice versa. Too much detail — rendering hundreds of thousands of marks or a fact at too fine a grain when the dashboard only shows totals — fix with aggregation tables or a coarser serving grain. Complex measures evaluated per row or per mark — push logic upstream into the model or source.<br><br>Other usual suspects: a snowflaked model adding join hops, many-to-many relationships fanning out, expensive calculated columns that should be measures, and folding breaking so a live query pulls raw data. The through-line is that almost every fix lives upstream of the visual — in the model, the grain, the storage mode, or the source — which is exactly why BI performance is a data-engineering responsibility, not a report-authoring one. Use the tool's profiler (Power BI Performance Analyzer, Tableau Performance Recorder) to find the real bottleneck before optimizing.",
      noteLabel: "In practice:",
      note: "The causes repeat, so I run down the same checklist from the model out.<br><br>Model too big? Attack cardinality. Wrong storage mode? Switch to import or add composite/aggregations. Too much detail rendered? Aggregate or coarsen the serving grain. Heavy per-mark calcs? Push them into the model or source. Snowflake or many-to-many? Flatten to a star and add a bridge. Calculated column that should be a measure? Convert it. Folding broken on a live query? Restore it.<br><br>Almost every fix is upstream of the visual, which is the whole point — BI performance is my job as the DE. And I profile first with Performance Analyzer or the Performance Recorder so I fix the real bottleneck, not a guess.",
      followups: [
        { q: "\"Someone hands you a slow dashboard — what's your process?\"", a: "Profile first with Performance Analyzer or the Performance Recorder to find the real bottleneck, then work the checklist from the model out: model size/cardinality, storage mode, grain and marks rendered, calculation cost, schema shape, and folding. Almost every fix is upstream of the visual." },
        { q: "\"Which fixes are upstream of the report?\"", a: "Nearly all of them — reducing cardinality, choosing the storage mode, setting the serving grain, adding aggregation tables, flattening a snowflake, resolving many-to-many with a bridge, converting calculated columns to measures, and keeping queries foldable. That's why BI performance is a DE responsibility." },
        { q: "\"Why profile before optimizing?\"", a: "Because the real bottleneck is often not what you assumed — one expensive query, an over-dense render, or a broken fold. The profiler breaks down time by query and render step, so you fix the actual slow part instead of spending effort where it doesn't help." }
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — BI-for-DE Q&A and trade-offs",
    desc: "The spoken BI questions a data engineer gets asked. Form your own answer first, then compare — the score is in the modeling reasoning, the engine understanding, and the trade-off. Answers are first-person and framed on real pipeline and model work."
  },
  cards: [
    {
      title: "\"How do you design the warehouse model so BI is fast?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you connect data modeling to BI performance, or just describe generic warehouse design. The interviewer wants star schema, grain, cardinality, and serving-layer thinking — the model as the thing that determines whether the dashboard flies.",
      noteLabel: "Model answer:",
      note: "\"I design the serving layer as a star schema on purpose, because both Power BI and Tableau are built around it.<br><br>I start with the grain — one clear statement of what a fact row represents — then attach conformed dimensions with one-to-many relationships and no many-to-many traps, resolving any of those with bridge tables. I denormalize dimensions into a flat star rather than snowflaking, because for BI the storage saved by normalizing is negligible while the extra join hops are paid on every query over a huge fact.<br><br>Then I optimize for the columnar engine: keep cardinality low by dropping unused columns, splitting datetime into date and time, and reducing numeric precision, so the model is small and scans fast. If the fact is huge but most queries are coarse, I add aggregation tables so common queries read a tiny rollup.<br><br>The theme is that dashboard speed is a modeling decision. Give the BI tool a clean, low-cardinality star at the right grain and it's fast by default.\"",
      followups: [
        { q: "\"What's the first thing you decide?\"", a: "The grain — one sentence for what a fact row represents. Everything else (which dimensions attach, which measures are additive, how aggregation behaves) follows from it. An ambiguous grain produces wrong numbers no downstream tuning can fix." },
        { q: "\"How does the model interact with the engine?\"", a: "The columnar engine (VertiPaq, hyper) compresses by cardinality, so a low-cardinality star scans fast and stays small. I drop unused columns, split datetime, and reduce precision to keep cardinality down. Model shape and engine behavior are the same optimization." },
        { q: "\"What if the fact is too big for fast queries even as a star?\"", a: "Aggregation tables — precompute the coarse rollups most dashboards actually use, so common queries read a tiny summary and only rare drill-to-detail touches the full fact. With DirectQuery, Power BI auto-redirects to the aggregate. It's a materialized view at the BI layer." }
      ]
    },
    {
      title: "\"Import vs DirectQuery — walk me through the trade-off.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand the storage-mode decision deeply — not just 'import is faster' but why, when DirectQuery is right, and how composite/dual bridges them. This maps directly to Tableau's extract-vs-live, so a strong answer shows the general principle.",
      noteLabel: "Model answer:",
      note: "\"Import loads data into the in-memory VertiPaq engine, so queries are extremely fast because everything's compressed columnar in RAM — but the data is a refresh snapshot and it's bounded by memory. DirectQuery leaves data in the source and sends SQL on every interaction, so it's always live and unbounded in size, but every filter click is a round-trip that's only as fast as the source and adds load to it.<br><br>I default to import for speed, because in-memory beats a round-trip almost always. I choose DirectQuery when the data is too big to import, when I need real-time freshness, or when governance forbids copying data out.<br><br>When I need near-real-time on a huge fact without making every dimension lookup a round-trip, I go composite: DirectQuery the fact, import the small dimensions, and mark them dual so dimension queries stay in memory while fact queries hit the source. And with DirectQuery I lean hard on query folding so the warehouse does the scanning.<br><br>It's the exact same decision as extract-vs-live in Tableau — the principle carries across tools.\"",
      followups: [
        { q: "\"Why is import usually faster?\"", a: "It loads data into VertiPaq, an in-memory columnar engine, so queries read compressed data from RAM with no network round-trip. DirectQuery sends live SQL to the source on every interaction, so it's bounded by the source's speed and adds load. In-memory beats round-trips almost always." },
        { q: "\"How does composite mode get you the best of both?\"", a: "DirectQuery the huge or real-time fact, import the small dimensions, and mark those dimensions dual so they serve fast in-memory for dimension-only queries and switch to DirectQuery when joined to the fact. You get near-real-time facts without every slicer becoming a source round-trip." },
        { q: "\"How does this map to Tableau?\"", a: "Directly — extract is import (a compressed hyper snapshot, fast, point-in-time) and live connection is DirectQuery (queries the source on every interaction, always current, source-bound). Same trade-off, same decision logic; the principle carries across both tools." }
      ]
    },
    {
      title: "\"Explain row context vs filter context in DAX.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "The single most probed DAX concept. Reciting definitions is junior; the senior answer explains why measures and calculated columns behave differently and names CALCULATE as the bridge via context transition.",
      noteLabel: "Model answer:",
      note: "\"They're two different evaluation contexts. Row context is 'the current row' — it exists when DAX iterates a table, like inside a calculated column or an iterator such as SUMX, where the expression sees one row at a time. Filter context is 'the set of filters currently applied' — from slicers, the visual's rows and columns, and filter arguments — and it defines which rows a measure aggregates over.<br><br>That's why a calculated column and a measure behave differently. A calculated column runs in row context: it knows its own row but is blind to the report's slicers, and it's computed once at refresh and stored. A measure runs in filter context: it aggregates over whatever the current filters allow, which is why the same measure gives different numbers in different cells of a matrix.<br><br>The bridge between them is CALCULATE, which performs context transition — it can take the current row context and materialize it as a filter context. That's the mechanism behind evaluating a measure per row, and honestly it's the source of most DAX confusion. Once you can name which context an expression is in, DAX stops being mysterious.\"",
      followups: [
        { q: "\"Why does a measure give different results across a matrix?\"", a: "Because it evaluates in filter context, and each cell imposes a different filter — this region, this month. The measure aggregates only over the rows that cell allows. Same formula, different context, different number. A calculated column, by contrast, is frozen at refresh." },
        { q: "\"What's context transition?\"", a: "CALCULATE turning the current row context into an equivalent filter context — taking 'this row' and materializing it as a filter on the model. It's what lets a measure evaluate per row inside an iterator, and it's the single biggest source of DAX confusion." },
        { q: "\"How does this connect to measures vs calculated columns?\"", a: "Calculated columns evaluate in row context, computed at refresh and stored, blind to slicers. Measures evaluate in filter context at query time and respond to filters. So aggregations must be measures; a stored per-row attribute is a calculated column. The context explains the rule." }
      ]
    },
    {
      title: "\"How do you secure per-user data in a dashboard?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you know Row-Level Security concretely — static vs dynamic RLS, that it's enforced at query time, and how dynamic RLS scales via a mapping table. Security is a place interviewers want specifics, not hand-waving.",
      noteLabel: "Model answer:",
      note: "\"I use Row-Level Security, which restricts which rows a user sees by applying a filter at query time based on who they are.<br><br>In Power BI I define roles with DAX filter expressions — a sales rep's role filters the fact to their region. But rather than hand-maintain a role per person, I use dynamic RLS: one role with a filter like Region[Manager] = USERPRINCIPALNAME() against a user-to-region mapping table. The logged-in user's identity filters the data automatically, so access scales without a role per user, and when someone changes territory I just update the mapping table.<br><br>The important point is that RLS is enforced in the engine at query time — the filter is applied before rows are returned, so a user physically cannot pull rows outside their entitlement, even via drill-through or export. It's real row filtering, not UI hiding.<br><br>Tableau does the same thing with user filters or a data-source filter keyed on USERNAME(), often against an entitlements table — same pattern, same query-time enforcement.\"",
      followups: [
        { q: "\"Static vs dynamic RLS?\"", a: "Static defines a role per group with a hard-coded filter — a role per region, which doesn't scale. Dynamic uses USERPRINCIPALNAME() against a user-to-region mapping table, so one role filters by whoever's logged in. Dynamic scales without a role per person and updates via the mapping table." },
        { q: "\"Is RLS actually secure or just hiding rows in the UI?\"", a: "It's enforced in the engine at query time — the filter is applied before rows are returned, so a user cannot retrieve rows outside their role even via drill-through or export. It's real row filtering, not cosmetic UI hiding. It does require correct role and mapping setup." },
        { q: "\"How does Tableau do the equivalent?\"", a: "User filters or a calculated data-source filter keyed on USERNAME(), typically joined to an entitlements/mapping table so each user sees only their rows. Same pattern as dynamic RLS and the same query-time enforcement — the filter constrains what the source returns." }
      ]
    },
    {
      title: "\"Star vs snowflake for BI — which and why?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you can reason about the normalization trade-off in the specific context of BI, rather than reciting textbook normalization. The senior answer is decisive — star for BI — with the join-hop and cardinality reasoning behind it.",
      noteLabel: "Model answer:",
      note: "\"For BI, star, almost always — and the reason is join hops on the read path.<br><br>A star joins small dimensions directly to the fact with one one-to-many hop each, so filter propagation is a single step and the engine's query plan is simple and fast. A snowflake normalizes dimensions into sub-dimensions, so filtering by something like product subcategory has to traverse multiple joins to reach the fact — more hops, more complex plans, slower queries.<br><br>People justify snowflaking with storage savings from removing redundancy, but in BI that's the wrong side to optimize. Dimensions are tiny relative to the fact, so you save negligible storage while paying an extra join on every query over billions of fact rows.<br><br>So I flatten hierarchies into wide, denormalized dimensions and accept the small redundancy. I'd only consider snowflaking a genuinely massive dimension where normalization saves real space — and even then I'd weigh it against the per-query join cost. For a read-optimized BI workload, the flat star wins.\"",
      followups: [
        { q: "\"Give the one-line reason star beats snowflake for BI.\"", a: "Fewer join hops on the read path. A star is one one-to-many hop from dimension to fact with simple filter propagation; a snowflake adds joins through sub-dimensions, paid on every query over the huge fact. BI is read-optimized, so you minimize hops." },
        { q: "\"Isn't normalization the 'correct' design?\"", a: "For OLTP writes, yes — you normalize to avoid update anomalies. But BI is OLAP, read-optimized. There you deliberately denormalize into a flat star: trade negligible redundancy on small dimensions for far fewer joins on huge facts. Right design depends on workload." },
        { q: "\"When would you ever snowflake in BI?\"", a: "Rarely — a genuinely massive dimension where normalization saves meaningful storage, or a conformed hierarchy reused across many models. Even then I'd weigh the storage saved against the added per-query join cost. The default for BI stays the flat, denormalized star." }
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "From a data engineer's perspective, what most determines whether a BI dashboard is fast and correct?",
    options: [
      "The choice of chart types and colors in the report",
      "The underlying data model — grain, star schema shape, and relationships",
      "The number of users viewing the dashboard",
      "Whether the report uses light or dark theme"
    ],
    correct: 1
  },
  {
    q: "You need extremely fast query performance and the data only needs to update on a scheduled refresh. Which Power BI storage mode fits best?",
    options: [
      "DirectQuery",
      "Import (into VertiPaq)",
      "Live connection only",
      "A many-to-many relationship"
    ],
    correct: 1
  },
  {
    q: "In Power BI's VertiPaq engine, what most drives model size and query speed?",
    options: [
      "The number of visuals on the report page",
      "Column cardinality — the number of distinct values per column",
      "The alphabetical order of table names",
      "Whether measures use uppercase names"
    ],
    correct: 1
  },
  {
    q: "Which statement correctly distinguishes a DAX measure from a calculated column?",
    options: [
      "A measure is stored on disk; a calculated column is computed at query time",
      "A measure is computed at query time in filter context; a calculated column is computed at refresh in row context and stored",
      "They are identical and interchangeable",
      "A calculated column responds to slicers; a measure never does"
    ],
    correct: 1
  },
  {
    q: "Which DAX function's primary purpose is to modify the filter context of an expression?",
    options: [
      "SUMX",
      "RELATED",
      "CALCULATE",
      "CONCATENATE"
    ],
    correct: 2
  },
  {
    q: "A fact table joins to a dimension where neither side is unique on the key, and totals come out inflated. What is happening and what's the fix?",
    options: [
      "Query folding broke; rewrite the measure",
      "A many-to-many relationship is causing fan-out; resolve it with a bridge table",
      "The date dimension is missing; add one",
      "VertiPaq compression failed; reduce precision"
    ],
    correct: 1
  },
  {
    q: "In Tableau, which storage option is the direct analog of Power BI's import mode (a compressed columnar snapshot)?",
    options: [
      "A live connection",
      "An extract on the hyper engine",
      "A context filter",
      "A FIXED LOD expression"
    ],
    correct: 1
  },
  {
    q: "A Tableau FIXED LOD expression is ignoring one of your filters. What makes FIXED respect that filter?",
    options: [
      "Convert the filter to a measure filter",
      "Promote the filter to a context filter (it runs before FIXED in the order of operations)",
      "Delete the date dimension",
      "Switch from an extract to a live connection"
    ],
    correct: 1
  },
  {
    q: "How do you secure a dashboard so each user sees only their own rows, scaling without a role per person?",
    options: [
      "Hide the rows visually in the report layout",
      "Dynamic Row-Level Security — a role with USERPRINCIPALNAME() filtered against a user-to-region mapping table, enforced at query time",
      "Give each user a separate copy of the report file",
      "Reduce column cardinality"
    ],
    correct: 1
  },
  {
    q: "With DirectQuery, what keeps a dashboard fast by making the warehouse do the heavy lifting?",
    options: [
      "Query folding / pushdown — filters and aggregations compiled to SQL the source executes, returning small results",
      "Storing more calculated columns in the model",
      "Adding more marks to each visual",
      "Snowflaking every dimension to save storage"
    ],
    correct: 0
  }
];
