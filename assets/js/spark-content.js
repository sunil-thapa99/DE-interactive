// Content data for the Apache Spark / PySpark / Databricks module.
const MODULE_ID = "spark";
const CONTENT = {

overview: {
  intro: {
    title: "What is Spark, and why use it?",
    desc: "Apache Spark is a distributed compute engine for processing large datasets across a cluster of machines. Databricks is the most common managed platform for running it. This module builds a small end-to-end PySpark pipeline on Databricks Community Edition, then goes deep on the language, architecture, streaming, and Delta Lake — everything a 4-5 YOE Data Engineer is expected to know."
  },
  diagram: [
    { label: "Driver\n(your PySpark code)", hl: true },
    { arrow: true },
    { label: "Cluster Manager\n(Databricks / YARN / K8s)" },
    { arrow: true },
    { label: "Executors\n(run tasks in parallel)", hl: true },
    { arrow: true },
    { label: "Partitioned data\n(S3 / DBFS / Delta)" },
  ],
  cards: [
    {
      title: "What is Spark, and why use it?",
      badge: "what & why",
      concept: "Spark is a distributed, in-memory compute engine: it splits a large dataset into partitions, ships the computation (not the data) to wherever those partitions live, and runs the work in parallel across a cluster of machines. This is fundamentally different from a single-node tool like pandas — pandas loads everything into one machine's RAM and processes it on one CPU (or a few threads); Spark scales horizontally by adding more machines, which is what makes it viable for datasets from tens of GB up to petabytes.",
      navLabel: "Why teams choose it:",
      nav: "It's the dominant engine for large-scale batch and streaming ETL when the data or the transformation logic is too big or too custom for pure SQL in a warehouse — arbitrary Python/Scala transformation code, ML feature engineering, joining many large datasets, and unifying batch + streaming under one API. It also runs everywhere: on-prem clusters, EMR, Databricks, Kubernetes — not tied to one vendor's storage.",
      noteLabel: "Where it fits vs. Snowflake:",
      note: "Snowflake is a SQL-first warehouse optimized for structured/semi-structured analytics with minimal ops. Spark is a general compute engine — better when you need custom code (not just SQL), ML pipelines, or to process data before it ever lands in a warehouse. Many real architectures use both: Spark for heavy upstream transformation/ML, Snowflake for the serving/BI layer. See the Compare tab for a fuller breakdown."
    },
    {
      title: "Core abstraction: RDDs, DataFrames, and (in Scala/Java) Datasets",
      badge: "concept",
      concept: "An RDD (Resilient Distributed Dataset) is Spark's original abstraction — a distributed, immutable collection of objects, partitioned across the cluster, with no built-in notion of schema or column types; you operate on it with functional operations (map, filter, reduce). A DataFrame is built on top of RDDs but adds a schema (named, typed columns) and gets optimized by Spark's Catalyst query optimizer — for almost all real work, DataFrames (or Spark SQL, which compiles to the same execution plan) are what you actually use. Datasets add compile-time type safety on top of DataFrames, but they're a JVM-only concept (Scala/Java) — PySpark doesn't have Datasets because Python is dynamically typed, so in PySpark you work with DataFrames (and occasionally raw RDDs for niche cases Catalyst can't optimize, like certain custom partitioning logic).",
      navLabel: "Interview framing:",
      nav: "If asked 'RDD vs DataFrame, which do you use and why' — the honest, correct answer for almost any real PySpark job is DataFrame/Spark SQL by default, because Catalyst can't optimize what it can't see inside (an RDD's arbitrary Python lambda is opaque to the optimizer), and dropping to RDDs should be a deliberate, justified exception, not a default habit.",
      note: null
    },
    {
      title: "Lazy evaluation and the DAG",
      badge: "concept",
      concept: "Spark doesn't execute anything when you call .filter() or .select() — those are transformations, and Spark just records them into a logical plan (a DAG of operations). Nothing actually runs until you call an action (.count(), .collect(), .write(), .show()) — at that point Spark's Catalyst optimizer analyzes the whole accumulated plan, rewrites/optimizes it (predicate pushdown, column pruning, join reordering), and only then breaks it into stages and tasks to execute across the cluster.",
      navLabel: "Why this matters practically:",
      nav: "This is why chaining 10 .filter()/.withColumn() calls costs nothing extra by itself — they're just plan-building — but it also means a bug in transformation logic won't surface until the action runs, which can make debugging feel delayed compared to eager, line-by-line execution in pandas. .explain() on a DataFrame shows you the actual physical plan Spark settled on, which is the single most useful debugging tool for 'why is this slow.'",
      note: null
    },
    {
      title: "Cluster architecture: Driver, Executors, Cluster Manager",
      badge: "concept",
      concept: "The Driver is the process running your main PySpark program — it builds the DAG, asks the Cluster Manager (Databricks' own, or YARN/Kubernetes/Spark Standalone elsewhere) for resources, and schedules tasks onto Executors. Executors are worker processes that actually run tasks and hold cached data partitions in memory; each Executor runs multiple tasks concurrently across its allocated CPU cores. Nothing about this changes based on which cluster manager you use — Databricks just packages cluster provisioning, the Spark UI, and notebooks into one managed experience instead of you standing up YARN/Kubernetes yourself.",
      navLabel: "Common interview trap:",
      nav: "'What happens if the Driver dies?' — the whole application fails; the Driver is a single point of coordination (though Databricks/YARN can be configured for Driver HA in cluster mode). 'What happens if an Executor dies?' — Spark's resilience kicks in: since RDDs/DataFrames track lineage (the sequence of transformations that produced them), Spark can recompute just the lost partitions on a different Executor rather than failing the whole job.",
      note: null
    }
  ]
},

setup: {
  intro: {
    title: "Stage 1 — Databricks Community Edition + a mini PySpark pipeline",
    desc: "Build a small but complete pipeline: read raw files, transform with the DataFrame API, write curated output as Delta — the same 'read → transform → write' shape as any real Spark job, using Databricks' free tier."
  },
  cards: [
    {
      title: "Create a Databricks Community Edition account",
      badge: "setup",
      concept: "Community Edition is Databricks' permanently free tier — a single small cluster, notebooks, and enough of the platform to learn the real workflow (it lacks Unity Catalog, jobs scheduling at scale, and multi-user collaboration features of the paid tiers, but the core Spark/notebook experience is the same).",
      navLabel: "Navigation:",
      nav: "Go to databricks.com/try-databricks → choose the Community Edition link (small text link, not the main paid-trial button) → sign up with an email → verify → you land in a workspace at community.cloud.databricks.com.",
      code: null,
      note: null
    },
    {
      title: "Create a cluster",
      badge: "setup",
      concept: "A cluster is the set of machines (Driver + Executors) that will actually run your code — on Community Edition you get one small shared-node cluster (Driver and Executor combined on one machine), which is enough for learning-scale data but means you won't see true multi-executor parallelism the way you would on a real multi-node cluster.",
      navLabel: "Navigation:",
      nav: "Left sidebar → Compute → Create Compute → leave defaults (Community Edition limits you to one small runtime) → Create Compute → wait for the green 'Running' state (takes 3-5 minutes to provision).",
      code: null,
      note: null
    },
    {
      title: "Create a notebook and attach it to the cluster",
      badge: "setup",
      concept: "A Databricks notebook is a web-based, cell-by-cell code editor (like Jupyter) that runs against a live SparkSession on the attached cluster — every cell shares the same SparkSession, so variables/DataFrames defined in one cell are usable in the next.",
      navLabel: "Navigation:",
      nav: "Left sidebar → Workspace → your user folder → Create → Notebook → name it pyspark_pipeline, language = Python → in the top-right cluster dropdown, select the cluster created in the previous step to attach it.",
      code: `# First cell — confirm the session and Spark version
spark
print(spark.version)`,
      note: "spark (a SparkSession) is pre-created and injected automatically in every Databricks notebook cell — you never need to build it yourself with SparkSession.builder like you would running PySpark locally."
    },
    {
      title: "Load sample raw data",
      badge: "pipeline",
      concept: "Databricks ships a small set of public sample datasets under /databricks-datasets on DBFS (Databricks File System, a managed abstraction over cloud storage) — using one of these avoids needing your own S3 bucket/credentials just to practice the pipeline shape.",
      navLabel: "Navigation:",
      nav: "Run in a notebook cell. Browse available sample paths: left sidebar → Catalog (or run dbutils.fs.ls('/databricks-datasets') in a cell) to explore what's available.",
      code: `df_raw = spark.read.csv(
    "/databricks-datasets/samples/population-vs-price/data_geo.csv",
    header=True, inferSchema=True
)
df_raw.printSchema()
df_raw.show(5)`,
      note: "inferSchema=True makes Spark do a pass over the data first to guess types — convenient for exploration, but in a real production pipeline you should pass an explicit StructType schema instead, so a malformed/reordered source file fails loudly rather than silently inferring the wrong types."
    },
    {
      title: "Transform with the DataFrame API",
      badge: "pipeline",
      concept: "This step is the actual ETL: selecting/renaming columns, filtering bad rows, and deriving new columns — all expressed as chained DataFrame transformations, none of which execute yet (lazy evaluation, covered in Overview).",
      navLabel: "Navigation:",
      nav: "Same notebook, next cell.",
      code: `from pyspark.sql import functions as F

df_clean = (
    df_raw
    .select(
        F.col("City").alias("city"),
        F.col("State").alias("state"),
        F.col("2014 Population estimate").cast("long").alias("population"),
        F.col("2015 median sales price").cast("double").alias("median_price")
    )
    .filter(F.col("population").isNotNull())
    .withColumn("price_per_1000_pop", F.round(F.col("median_price") / (F.col("population") / 1000), 2))
)
df_clean.show(5)`,
      note: "F.col(...) references a column explicitly rather than using a bare string — this is the idiomatic PySpark style because it lets you build column expressions (arithmetic, casts, conditionals) that a plain string can't represent."
    },
    {
      title: "Write the curated output as Delta",
      badge: "pipeline",
      concept: "This is the action that finally triggers everything queued up in df_clean's lazy plan. Writing as Delta (rather than plain Parquet) gets you ACID transactions, schema enforcement, and time travel for free — covered in depth in the Delta Lake tab.",
      navLabel: "Navigation:",
      nav: "Same notebook, next cell. Verify afterward: left sidebar → Catalog → browse to the table, or run %sql SELECT * FROM city_price_stats LIMIT 10 in a new cell.",
      code: `(df_clean.write
    .format("delta")
    .mode("overwrite")
    .saveAsTable("city_price_stats"))

display(spark.sql("SELECT * FROM city_price_stats ORDER BY price_per_1000_pop DESC LIMIT 10"))`,
      note: "mode('overwrite') replaces the table's contents entirely on each run — fine for a learning pipeline; a real incremental pipeline would use mode('append') plus a dedup/MERGE strategy instead, the same idempotency concern covered in the Snowflake module's Tasks+Streams tab."
    },
    {
      title: "Inspect the execution plan and Spark UI",
      badge: "pipeline",
      concept: "Every job you just ran left a trace in Spark's own UI — stages, tasks, shuffle read/write volumes, and time spent per stage. This is the primary tool for diagnosing 'why is my job slow' in any real Spark environment, Databricks or otherwise.",
      navLabel: "Navigation:",
      nav: "Databricks: click the cluster name in the notebook's top bar → Spark UI tab, or in the notebook itself, each cell that triggered a job shows a small expandable 'View' link under the cell for that job's DAG/stages.",
      code: `df_clean.explain(True)   # shows the logical + physical plan for a DataFrame without running it`,
      note: "explain(True) is free (it doesn't execute the job) and is the single fastest way to check whether Spark actually pushed a filter down to the data source or is planning to shuffle more than expected, before you spend cluster time finding out the slow way."
    }
  ]
},

pyspark: {
  intro: {
    title: "Stage 2 — Python foundations, then the PySpark API in depth",
    desc: "PySpark's DataFrame API is built on Python's functional programming idioms. This tab covers the Python concepts that matter for Spark first, then the core PySpark building blocks: transformations vs. actions, the DataFrame API, joins, window functions, UDFs, and Spark SQL."
  },
  cards: [
    {
      title: "Functional programming fundamentals: map, filter, reduce, lambda",
      badge: "python",
      concept: "PySpark's transformation vocabulary (map, filter, reduce, flatMap) is lifted directly from functional programming — the same pattern you'd use on a plain Python list, just distributed across a cluster instead of running on one machine. A lambda is just an anonymous, one-expression function — Python's map(lambda x: x*2, my_list) and Spark's rdd.map(lambda x: x*2) are conceptually identical; the difference is entirely about where the computation happens (locally in one process vs. distributed across executors) and how much data it can handle.",
      navLabel: "Why this foundation matters:",
      nav: "If you're comfortable with Python's built-in map/filter/reduce and list comprehensions, PySpark's RDD API (and the mental model behind the DataFrame API) is not new syntax to learn — it's the same functional thinking applied at scale. Interviewers sometimes start with a plain-Python functional question before moving to PySpark specifically to check this foundation.",
      code: `# Plain Python — single machine, in memory
nums = [1, 2, 3, 4, 5]
doubled = list(map(lambda x: x * 2, nums))
evens = list(filter(lambda x: x % 2 == 0, nums))
total = reduce(lambda a, b: a + b, nums)  # from functools

# Same shape, distributed — Spark RDD
rdd = spark.sparkContext.parallelize(nums)
doubled_rdd = rdd.map(lambda x: x * 2)
evens_rdd = rdd.filter(lambda x: x % 2 == 0)
total_rdd = rdd.reduce(lambda a, b: a + b)`,
      note: null
    },
    {
      title: "Closures and why they cause a classic Spark bug",
      badge: "python",
      concept: "A closure is a function that captures variables from its enclosing scope. This becomes a real gotcha in Spark: when you use a variable from the Driver inside a lambda passed to .map()/.filter(), Spark serializes and ships a copy of that variable to every Executor — for a small variable, fine; for accidentally capturing a huge object (e.g. a whole DataFrame's collected contents, or a large dict), this silently bloats every task's serialized closure and can crash or massively slow down the job.",
      navLabel: "The fix pattern:",
      nav: "For genuinely large shared read-only data, use a Broadcast variable (spark.sparkContext.broadcast(...)) instead of relying on closure capture — it ships the data to each Executor once and caches it there, instead of once per task.",
      code: `# Risky: large_lookup_dict gets serialized into every task's closure
large_lookup_dict = {...}  # e.g. 50MB dict built on the Driver
rdd.map(lambda x: large_lookup_dict.get(x))  # closure capture — inefficient at scale

# Better: broadcast it once per executor
bc = spark.sparkContext.broadcast(large_lookup_dict)
rdd.map(lambda x: bc.value.get(x))`,
      note: null
    },
    {
      title: "Accumulators — write-only counters across executors",
      badge: "python",
      concept: "A Broadcast variable moves read-only data from the Driver out to every Executor. An Accumulator does the reverse: it lets every Executor add to a shared counter/aggregate, which the Driver can then read back after an action completes — used for things like counting malformed rows encountered during a transformation, without collecting all the data back to the Driver just to count it. Accumulators are write-only from the executors' side (you can .add() to them inside a transformation, but can't reliably .value read them from inside a transformation) and are only guaranteed accurate for actions, not transformations — because of lazy evaluation and potential task retries, an accumulator updated inside a transformation that gets recomputed (e.g. after a failed task retry, or reused across multiple actions) can double-count.",
      navLabel: "Try it:",
      nav: "Count malformed rows encountered during a filter, without a separate counting pass over the data.",
      code: `bad_row_count = spark.sparkContext.accumulator(0)

def check_row(row):
    if row.population is None:
        bad_row_count.add(1)
        return False
    return True

filtered = df_raw.rdd.filter(check_row)
filtered.count()  # action — forces evaluation, accumulator value is now reliable
print(f"Bad rows encountered: {bad_row_count.value}")`,
      noteLabel: "Interview framing:",
      note: "'How would you count how many rows failed a validation check, without materializing them all to the Driver' is exactly the accumulator use case — and being able to name the reliability caveat (guaranteed accurate only within actions, not arbitrary transformations, due to potential task re-execution) shows you understand the mechanism, not just the API surface."
    },
    {
      title: "Working with nested/complex data: explode, StructType, ArrayType, MapType",
      badge: "api",
      concept: "Real source data is rarely flat — a JSON payload with a line_items array or a nested customer object is the norm, not the exception (the exact same shape as the VARIANT/FLATTEN content in the Snowflake module, just expressed through PySpark's typed schema system instead). A DataFrame column can itself be typed as ArrayType, StructType, or MapType — struct fields are accessed with dot notation (col.field), and an array column needs explode() to turn each array element into its own row before you can work with it relationally, exactly mirroring what LATERAL FLATTEN does in Snowflake SQL.",
      navLabel: "Try it:",
      nav: "Explode a nested array column into rows, and pull fields out of a struct column.",
      code: `from pyspark.sql import functions as F

# Given a column "line_items": array<struct<sku:string, qty:int>>
exploded = (
    df_orders
    .withColumn("item", F.explode("line_items"))   # one row per array element
    .select(
        "order_id",
        F.col("item.sku").alias("sku"),             # dot notation into the struct
        F.col("item.qty").alias("qty")
    )
)

# posexplode gives you the array index too, when order/position matters
with_position = df_orders.select("order_id", F.posexplode("line_items").alias("pos", "item"))`,
      noteLabel: "Interview framing:",
      note: "If handed a sample of nested JSON and asked to flatten it into rows on the spot, explode() plus dot notation into struct fields is the expected core answer — directly parallel to the FLATTEN/LATERAL JOIN pattern in the Snowflake module, just via PySpark's own schema-aware API instead of SQL."
    },
    {
      title: "Transformations vs. actions — the full taxonomy",
      badge: "concept",
      concept: "Transformations (select, filter, withColumn, groupBy, join, orderBy) are lazy — they build the plan. Actions (count, collect, show, write, take, first) trigger execution. Some transformations are 'narrow' (filter, select — each output partition depends on only one input partition, no data movement between machines) and some are 'wide' (groupBy, join, orderBy, distinct — require a shuffle, moving data across the network between partitions). This narrow/wide distinction is the single biggest performance lever in Spark: wide transformations are expensive, narrow ones are nearly free.",
      navLabel: "Interview one-liner:",
      nav: "'Which operations cause a shuffle?' — anything that needs to bring together rows that might currently live on different partitions to compute a result: groupBy/aggregations, joins (unless broadcast), repartition, distinct, orderBy/sort.",
      code: null,
      note: null
    },
    {
      title: "The DataFrame API: select, filter, groupBy, agg",
      badge: "api",
      concept: "This is the day-to-day vocabulary of PySpark ETL work — equivalent in spirit to SQL's SELECT/WHERE/GROUP BY, expressed as chained method calls that build toward an action.",
      navLabel: "Try it:",
      nav: "Run against any DataFrame with a numeric column to practice the pattern.",
      code: `from pyspark.sql import functions as F

result = (
    df_clean
    .filter(F.col("population") > 100000)
    .groupBy("state")
    .agg(
        F.count("*").alias("city_count"),
        F.avg("median_price").alias("avg_price"),
        F.max("population").alias("max_population")
    )
    .orderBy(F.col("avg_price").desc())
)
result.show()`,
      note: "Every .agg() call here triggers a shuffle (groupBy requires collecting rows by key across partitions) — this is exactly the kind of wide transformation from the previous card, and it's the natural place to reach for query-plan inspection (.explain()) if this were running slow on a large dataset."
    },
    {
      title: "Joins: shuffle joins vs. broadcast joins",
      badge: "performance",
      concept: "A standard join between two large DataFrames is a shuffle join — Spark repartitions both sides by the join key so matching rows land on the same executor, which is expensive (network + disk I/O). A broadcast join instead sends the entire smaller DataFrame to every executor (as a broadcast variable) so the join happens locally with no shuffle on the large side — dramatically faster, but only viable when one side is small enough to fit comfortably in each executor's memory (Spark's default threshold is 10MB, configurable via spark.sql.autoBroadcastJoinThreshold, and Spark will auto-choose broadcast below that threshold without you asking).",
      navLabel: "Try it:",
      nav: "Force a broadcast join explicitly when you know one side is small and want to guarantee the optimizer picks it (rather than relying on auto-detection, which can misjudge size after upstream filters).",
      code: `from pyspark.sql import functions as F

# Explicit broadcast hint — guarantees a broadcast join regardless of auto-detected size
result = large_df.join(F.broadcast(small_lookup_df), on="key", how="left")

# Check which join strategy Spark actually chose
result.explain()   # look for "BroadcastHashJoin" vs "SortMergeJoin" in the physical plan`,
      note: "'Explain the difference between a shuffle join and a broadcast join, and when you'd force one' is one of the most common PySpark performance interview questions — being able to name the config threshold and the explain() verification step signals real hands-on experience, not just textbook knowledge."
    },
    {
      title: "Window functions",
      badge: "api",
      concept: "Window functions compute a value across a group of rows related to the current row (like SQL's OVER (PARTITION BY ... ORDER BY ...)) without collapsing rows the way groupBy does — essential for running totals, rankings, and row-over-row comparisons (e.g. 'previous day's value').",
      navLabel: "Try it:",
      nav: "Rank cities within each state by population.",
      code: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

window_spec = Window.partitionBy("state").orderBy(F.col("population").desc())

ranked = df_clean.withColumn("rank_in_state", F.rank().over(window_spec))
ranked.filter(F.col("rank_in_state") <= 3).show()`,
      note: "rank() vs dense_rank() vs row_number() is a common follow-up: rank() leaves gaps after ties (1,1,3), dense_rank() doesn't (1,1,2), row_number() breaks ties arbitrarily with no repeats (1,2,3) — know which one a given business requirement actually needs."
    },
    {
      title: "User-Defined Functions (UDFs) — and why to avoid them when possible",
      badge: "performance",
      concept: "A UDF lets you run arbitrary Python code per-row, but it comes at a real cost: Catalyst can't see inside a Python UDF to optimize around it, and (for a standard, non-pandas UDF) every row has to be serialized out of the JVM into a Python process, processed, and serialized back — that serialization boundary is the single biggest reason plain UDFs are slow. Whenever a built-in Spark SQL function (F.upper, F.when, F.datediff, etc.) can do the same job, prefer it — it runs entirely inside the JVM with full Catalyst optimization.",
      navLabel: "Try it:",
      nav: "Compare a plain UDF against the same logic with built-ins, and know pandas UDFs (vectorized, via Apache Arrow) as the better-performing escape hatch when custom Python logic is genuinely unavoidable.",
      code: `from pyspark.sql import functions as F
from pyspark.sql.types import StringType
import pandas as pd
from pyspark.sql.functions import pandas_udf

# Avoid: plain UDF, row-by-row Python/JVM serialization overhead
@F.udf(returnType=StringType())
def classify_udf(pop):
    return "large" if pop > 500000 else "small"

# Prefer: built-in, stays inside the JVM, fully optimized by Catalyst
classified = df_clean.withColumn(
    "size_class", F.when(F.col("population") > 500000, "large").otherwise("small")
)

# If custom Python logic is unavoidable: pandas UDF processes in batches via Arrow — much faster than row-by-row
@pandas_udf(StringType())
def classify_pandas_udf(pop: pd.Series) -> pd.Series:
    return pop.apply(lambda p: "large" if p > 500000 else "small")`,
      note: "'When would you use a UDF, and what's the faster alternative' is a near-guaranteed interview question — the expected answer is: avoid them when a built-in exists, and prefer pandas UDFs over plain UDFs when custom logic is truly required, because Arrow-based batching amortizes the serialization cost across many rows instead of paying it per-row."
    },
    {
      title: "Spark SQL — the same engine, SQL syntax",
      badge: "api",
      concept: "Spark SQL isn't a separate engine — a SQL query and the equivalent DataFrame method chain compile down to the exact same Catalyst logical plan and get optimized identically. This means the choice between writing SQL vs. DataFrame code is purely about developer ergonomics/readability for a given task, never about performance.",
      navLabel: "Try it:",
      nav: "Register a DataFrame as a temp view to query it with SQL in the same notebook session.",
      code: `df_clean.createOrReplaceTempView("cities")

result = spark.sql("""
    SELECT state, COUNT(*) AS city_count, AVG(median_price) AS avg_price
    FROM cities
    WHERE population > 100000
    GROUP BY state
    ORDER BY avg_price DESC
""")
result.show()`,
      note: "createOrReplaceTempView registers the view only for the current SparkSession/notebook — it's not persisted anywhere. saveAsTable (used in the Setup tab) is what actually persists a table durably."
    }
  ]
},

execution: {
  intro: {
    title: "Stage 3 — Execution model: entities, scheduling, and deploy modes",
    desc: "How a line of PySpark code actually turns into work running on a cluster — the entity hierarchy (Application → Job → Stage → Task), the two internal schedulers that make that happen, and where the Driver process itself physically runs. This is the internals layer that Databricks notebooks mostly hide from you, but interviewers expect you to know it anyway."
  },
  cards: [
    {
      title: "The entity hierarchy: Application → Job → Stage → Task",
      badge: "entities",
      concept: "A SparkSession (or the older SparkContext underneath it) represents one Application — the single process that runs for the life of your notebook or spark-submit run. Every time you call an action (.count(), .write(), .collect()), Spark creates one Job for that action. Spark then splits that Job into Stages, with a new stage boundary created at every wide dependency (anything requiring a shuffle — groupBy, join, repartition); narrow dependencies (filter, select, map) stay within the same stage since no data movement between partitions is needed. Finally, each Stage is split into Tasks — one Task per partition, since a Task is the smallest unit of work, executing that stage's transformations on exactly one partition of data on one executor core.",
      navLabel: "See it live:",
      nav: "Databricks: click into any completed cell's job link (or cluster → Spark UI) → Jobs tab shows one row per Job → click a Job to see its Stages → click a Stage to see its individual Tasks, their duration, and which executor ran each one.",
      code: `# One action = one Job. This single write() triggers exactly one Job,
# which gets split into however many Stages the shuffle boundaries require.
df_clean.groupBy("state").agg(F.avg("median_price")).write.format("delta").saveAsTable("stats")
# Job 1
#   Stage 1 (narrow: read + filter + select)  -> N tasks, N = number of input partitions
#   [shuffle boundary — groupBy]
#   Stage 2 (wide: aggregate + write)          -> M tasks, M = number of shuffle partitions (default 200)`,
      noteLabel: "Why this matters:",
      note: "This hierarchy is the actual vocabulary the Spark UI, and every performance discussion, is built on — 'this job is slow' isn't specific enough to debug, but 'stage 2 has a 40-second task and the rest finish in 2 seconds' immediately points at skew in a specific stage."
    },
    {
      title: "Narrow vs. wide dependencies — what actually creates a new stage",
      badge: "internals",
      concept: "A narrow dependency means each output partition depends on only one (or a small, fixed number of) input partitions — no data has to move between machines, so Spark can pipeline these operations together within a single stage (filter → select → withColumn all fuse into one stage's task). A wide dependency means an output partition can depend on many/all input partitions (groupBy, join, distinct, repartition, orderBy) — this requires a shuffle, and a shuffle boundary is exactly where the DAGScheduler cuts a new stage, because all of stage N's tasks must finish writing shuffle output before any of stage N+1's tasks can start reading it.",
      navLabel: "Interview one-liner:",
      nav: "'What determines where a stage boundary falls?' — a wide dependency (shuffle). Everything narrow between two shuffles gets pipelined into one stage.",
      code: null,
      note: null
    },
    {
      title: "The DAG Scheduler",
      badge: "internals",
      concept: "The DAGScheduler is the component (running inside the Driver) responsible for taking the logical DAG of RDD/DataFrame operations built up by your lazy transformations and turning it into a physical execution plan of Stages — it walks the DAG backward from the action that triggered it, cutting a new stage at every wide-dependency (shuffle) boundary, and submits stages for execution in dependency order (a stage can't start until all stages it depends on have completed). It's also the layer responsible for fault tolerance at the stage level: if a stage fails (e.g. an executor holding its output dies), the DAGScheduler uses RDD lineage to know exactly how to recompute only the lost partitions, rather than the entire application failing.",
      navLabel: "Interview framing:",
      nav: "'What happens if a stage fails partway through?' — the DAGScheduler doesn't restart the whole Application; it resubmits just the failed stage (or the specific lost partitions within it), recomputed from lineage, and continues from there — this is the concrete mechanism behind Spark's fault tolerance.",
      code: null,
      note: null
    },
    {
      title: "The Task Scheduler",
      badge: "internals",
      concept: "Once the DAGScheduler hands off a stage as a ready 'TaskSet' (one task per partition), the TaskScheduler is the component that actually assigns those individual tasks to specific executors, requesting resources from the cluster manager and respecting data locality (preferring to run a task on an executor that already has that partition's data in memory/local disk, to avoid an unnecessary network read). It also handles per-task retries: if one task fails (not the whole stage — e.g. a transient error on one executor), the TaskScheduler retries just that task, up to a configurable limit (spark.task.maxFailures, default 4), before escalating a stage-level failure to the DAGScheduler. It's also what implements speculative execution — optionally re-launching a copy of an unusually slow straggler task on a different executor and taking whichever copy finishes first.",
      navLabel: "Interview framing:",
      nav: "DAGScheduler = stage-level planning and fault tolerance ('what stages exist, in what order, and how do we recover a lost stage'). TaskScheduler = task-level execution and fault tolerance ('which executor runs this specific task, and what do we do if just this one task fails'). Keeping this division clean is exactly what a strong internals answer sounds like.",
      code: null,
      note: null
    },
    {
      title: "Cluster mode vs. Client mode — where does the Driver actually run?",
      badge: "deploy",
      concept: "These are the two deploy modes for spark-submit (this distinction is invisible in a Databricks notebook, where Databricks manages it for you, but it's a real, common interview topic tied to plain/on-prem Spark or EMR). In Client mode, the Driver runs on the machine that launched the job — e.g. your laptop, or an edge/gateway node — while only the Executors run on the cluster; this is convenient for interactive work (you see logs/output locally in real time) but means the Driver process dies if that launching machine disconnects or is shut down, killing the whole Application. In Cluster mode, the Driver itself runs inside the cluster (on one of the cluster's own nodes, managed by the cluster manager) — better for unattended, long-running production jobs since the job's lifecycle isn't tied to your laptop staying connected, but you lose the convenience of local interactive output.",
      navLabel: "Try it:",
      nav: "The deploy mode is set via a spark-submit flag — this is what to reach for if asked to contrast the two concretely.",
      code: `# Client mode: Driver runs on the machine issuing this command (e.g. an edge node)
spark-submit --deploy-mode client --master yarn my_job.py

# Cluster mode: Driver runs inside the cluster itself, managed by the cluster manager
spark-submit --deploy-mode cluster --master yarn my_job.py`,
      noteLabel: "Interview framing:",
      note: "'Why would a production Spark job use cluster mode instead of client mode?' — so the Driver's lifecycle isn't tied to a single machine staying online; an unattended scheduled job (via Airflow, cron, or a job scheduler) should run in cluster mode so a disconnect on the submitting side doesn't kill a multi-hour job partway through. Databricks Jobs (as opposed to interactive notebooks) conceptually follow the same cluster-mode philosophy — the Driver's lifecycle is tied to the managed job run, not to your own machine."
    },
    {
      title: "Tracing one action end-to-end",
      badge: "scenario",
      concept: "Putting the whole model together: when df.write.format('delta').saveAsTable(...) runs, the Driver's DAGScheduler examines the accumulated lazy plan, identifies the shuffle boundary at the earlier groupBy, and submits Stage 1 (read + filter + select — narrow, pipelined) as a TaskSet to the TaskScheduler, which assigns one task per input partition to available executors respecting data locality. Once every Stage 1 task finishes writing its shuffle output, the DAGScheduler submits Stage 2 (the aggregation + write — reading shuffled data, wide) as a new TaskSet, again handed to the TaskScheduler for per-partition task assignment. If any individual task fails transiently, the TaskScheduler retries just that task; if an entire executor is lost, the DAGScheduler recomputes the affected partitions from lineage rather than restarting the Application.",
      navLabel: "Where to verify this:",
      nav: "Spark UI → Jobs tab (one row per action/Job) → click into the Job → Stages (in execution order, with the shuffle boundary visible as the transition between them) → click a Stage → Tasks tab shows every individual task, its executor, duration, and any retries — this is the literal, visual confirmation of everything in this tab.",
      code: null,
      note: "Being able to narrate this whole chain — Job to Stage to Task, DAGScheduler to TaskScheduler, narrow vs. wide as the reason stages exist at all — in response to 'what happens when I call .write() on a DataFrame' is one of the strongest signals of genuine Spark depth in an interview, well beyond just knowing the DataFrame API."
    }
  ]
},

architecture: {
  intro: {
    title: "Stage 4 — Architecture & performance tuning",
    desc: "The concepts that separate someone who's written PySpark code from someone who can diagnose and fix a slow, expensive, or failing Spark job in production."
  },
  cards: [
    {
      title: "Catalyst optimizer & Tungsten",
      badge: "internals",
      concept: "Catalyst is Spark SQL's query optimizer — it takes your DataFrame/SQL logical plan and applies rule-based and cost-based optimizations (predicate pushdown: filtering as early/close to the data source as possible; column pruning: only reading columns you actually select; join reordering) before generating a physical plan. Tungsten is the execution engine underneath — it manages memory in a binary, off-heap-friendly format (avoiding JVM object overhead and garbage collection pressure) and generates optimized JVM bytecode at runtime (whole-stage code generation) for the physical plan instead of interpreting it row by row.",
      navLabel: "Interview framing:",
      nav: "You don't need to reimplement these — the point is knowing they exist and why DataFrame/SQL code outperforms equivalent raw-RDD Python code: Catalyst+Tungsten only optimize what they can see and represent natively, and a Python UDF or raw RDD lambda is an opaque black box to both.",
      code: null,
      note: null
    },
    {
      title: "Partitioning: repartition vs. coalesce",
      badge: "performance",
      concept: "A partition is the unit of parallelism — each partition is processed by one task on one executor core. repartition(n) does a full shuffle to redistribute data into exactly n partitions (can increase or decrease partition count, and can rebalance skewed data) — expensive but thorough. coalesce(n) only merges existing partitions without a full shuffle — cheap, but can only decrease partition count, and can't fix skew because it just glues existing partitions together rather than truly rebalancing.",
      navLabel: "Try it:",
      nav: "Use coalesce before writing output to avoid producing hundreds of tiny files; use repartition when you actually need to rebalance skewed data or change partitioning by a specific column before a join.",
      code: `# Reduce output file count cheaply before a write (no shuffle)
df_clean.coalesce(4).write.format("delta").mode("overwrite").saveAsTable("city_price_stats")

# Rebalance/repartition by a key before a join or aggregation that's skewed
df_repartitioned = df_clean.repartition(200, "state")`,
      note: "'Why do I have 500 tiny output files instead of a few reasonably-sized ones' is a very common real-world Spark complaint, and the answer is almost always 'too many partitions going into the write, use coalesce.'"
    },
    {
      title: "Shuffles — the most expensive operation in Spark",
      badge: "performance",
      concept: "A shuffle physically moves data across the network between executors so that rows with the same key end up on the same partition (needed for groupBy, join, distinct, repartition). It involves writing intermediate data to disk on the source side (shuffle write) and reading it back over the network on the destination side (shuffle read) — this disk + network cost is why shuffles dominate the runtime of most non-trivial Spark jobs, and why so much of Spark performance tuning is really 'how do I avoid or minimize shuffles.'",
      navLabel: "Where to look:",
      nav: "The Spark UI's Stages tab shows shuffle read/write bytes per stage — a stage with a disproportionately large shuffle relative to input data size (often from a join that fans out rows unexpectedly) is the first place to investigate a slow job.",
      code: null,
      note: null
    },
    {
      title: "Caching and persistence — cache() vs persist()",
      badge: "performance",
      concept: "Because of lazy evaluation, a DataFrame used in multiple downstream actions gets recomputed from scratch each time by default — if df is expensive to build and you call df.count() then later df.write(...), Spark redoes all the upstream work twice. cache() (a shorthand for persist(MEMORY_AND_DISK)) tells Spark to materialize and keep the result after the first action, so subsequent actions reuse it instead of recomputing. persist() takes an explicit StorageLevel (MEMORY_ONLY, MEMORY_AND_DISK, DISK_ONLY, plus serialized/replicated variants) for finer control over the memory/disk/CPU trade-off.",
      navLabel: "Try it:",
      nav: "Cache a DataFrame you'll reuse across multiple actions in the same job — and remember to unpersist() when done to free executor memory for later stages.",
      code: `df_clean.cache()
df_clean.count()          # first action materializes the cache
df_clean.filter(...).show()   # reuses the cached result, doesn't recompute df_clean from df_raw

df_clean.unpersist()      # free the memory once you're done with it`,
      note: "A common mistake: calling .cache() and expecting it to do something immediately — cache() is itself lazy too, it only marks the DataFrame for caching; the actual caching happens on the next action that touches it."
    },
    {
      title: "Adaptive Query Execution (AQE)",
      badge: "performance",
      concept: "AQE (default-on since Spark 3.0) lets Spark re-optimize a query plan mid-execution using actual runtime statistics instead of only the pre-execution estimates Catalyst had at plan time — it can dynamically switch a sort-merge join to a broadcast join once it observes one side is actually small at runtime, coalesce small shuffle partitions automatically, and split skewed partitions (skew join optimization) so one oversized partition doesn't bottleneck an entire stage.",
      navLabel: "Interview framing:",
      nav: "Knowing AQE exists — and that it's the reason many manual tuning tricks from older Spark tutorials (manually setting shuffle partition counts, manually forcing broadcast joins) matter less than they used to — is a good signal of staying current with the platform, similar to knowing about Snowflake's Dynamic Tables refresh-mode fallback behavior.",
      code: `# Confirm AQE is enabled (default True since Spark 3.0)
spark.conf.get("spark.sql.adaptive.enabled")`,
      note: null
    },
    {
      title: "Data skew and salting",
      badge: "performance",
      concept: "Skew happens when one key (or a small number of keys) has vastly more rows than others — e.g. a 'null' or 'default' customer_id representing 40% of all orders. During a groupBy/join on that key, one partition/task ends up with a disproportionate amount of work while every other task finishes quickly and sits idle, so the whole stage waits on that one straggler task. AQE's skew join optimization handles many cases automatically now, but for severe manual cases the classic fix is salting: append a random suffix to the skewed key to artificially split it across more partitions, process, then remove the suffix and re-aggregate.",
      navLabel: "Where to spot it:",
      nav: "Spark UI → Stages → a stage where task duration is wildly uneven (a few tasks taking 10x longer than the median) is the signature of skew.",
      code: `from pyspark.sql import functions as F

# Salting pattern for a severely skewed join key
salted = df.withColumn("salted_key", F.concat(F.col("key"), F.lit("_"), (F.rand() * 10).cast("int")))
# join on salted_key against a correspondingly exploded version of the small side, then drop the salt suffix after`,
      note: "'How would you handle a skewed join' is a classic senior-level Spark question — mentioning both AQE's automatic handling and salting as the manual fallback shows awareness of both the modern default behavior and the underlying problem it's solving."
    },
    {
      title: "Memory management: unified memory model",
      badge: "internals",
      concept: "Each executor's JVM heap is split into a unified memory region shared dynamically between execution memory (shuffles, joins, sorts, aggregations) and storage memory (cached DataFrames/RDDs) — unlike Spark's older static split, either side can borrow space from the other under memory pressure, up to configurable limits (spark.memory.fraction, spark.memory.storageFraction). Running out of this memory causes spills to disk (slow but survivable) or, in the worst case, an executor OOM (job failure).",
      navLabel: "Interview framing:",
      nav: "'My job is spilling to disk / OOMing, what do you check' — partition count and size (too few, too-large partitions per task), whether a broadcast join's 'small' side turned out to be bigger than expected after upstream filtering changed, and whether too much is being cached/persisted at once without unpersisting what's no longer needed.",
      code: null,
      note: null
    },
    {
      title: "Resource tuning: spark-submit configs and dynamic allocation",
      badge: "tuning",
      concept: "These are the concrete knobs behind everything discussed so far. --num-executors / --executor-cores / --executor-memory (or their spark.executor.* config equivalents on Databricks) set how many executors run and how much CPU/RAM each gets — get executor-memory too small relative to partition size and you spill/OOM; too few executor-cores and you under-parallelize a stage with plenty of tasks waiting. spark.sql.shuffle.partitions sets how many partitions a shuffle produces (default 200) — too low under-parallelizes a large shuffle, too high creates excessive small-task scheduling overhead; with AQE enabled (the default since Spark 3.0), Spark auto-coalesces small shuffle partitions at runtime, which is why manually tuning this value matters far less than it did in Spark 2.x tutorials. Dynamic allocation (spark.dynamicAllocation.enabled) lets the number of executors scale up/down automatically based on pending task backlog, instead of a fixed executor count for the whole job's lifetime.",
      navLabel: "Try it:",
      nav: "Databricks: cluster configuration UI exposes autoscaling (dynamic allocation's cluster-level equivalent) directly, so you rarely set these flags by hand there — but on plain spark-submit/EMR you set them explicitly.",
      code: `spark-submit \\
  --num-executors 10 \\
  --executor-cores 4 \\
  --executor-memory 8g \\
  --conf spark.sql.shuffle.partitions=400 \\
  --conf spark.dynamicAllocation.enabled=true \\
  my_job.py`,
      noteLabel: "Interview framing:",
      note: "'How would you size a Spark job's resources' — start from data volume and shuffle partition count, not a guessed cluster size: enough executor-cores in total to have meaningfully more tasks running in parallel than waiting, enough executor-memory per core to hold a partition's working set without spilling, and prefer dynamic allocation over a fixed executor count for variable workloads."
    },
    {
      title: "Serialization: Java vs. Kryo",
      badge: "tuning",
      concept: "Whenever Spark moves data across the network (shuffles) or between memory and disk (caching, spilling), it has to serialize objects into bytes and back. The JVM's default Java serialization is general-purpose but slow and produces large serialized output. Kryo serialization (spark.serializer = org.apache.spark.serializer.KryoSerializer) is significantly faster and more compact for most object types, and is recommended for any performance-sensitive job — though it requires registering custom classes for best results, and DataFrame/Dataset operations already use Spark's own optimized encoders under the hood regardless of this setting (this config mainly matters for RDD-based workloads and cached objects).",
      navLabel: "Try it:",
      nav: "Set Kryo as the default serializer for an RDD-heavy or cache-heavy job.",
      code: `spark-submit --conf spark.serializer=org.apache.spark.serializer.KryoSerializer my_job.py`,
      noteLabel: "Interview framing:",
      note: "A concrete, specific answer ('switch to Kryo via spark.serializer, since it's faster and more compact than Java serialization for shuffle/cache-heavy RDD workloads') signals real tuning experience — most candidates only know Spark 'does serialization' without knowing there's a choice or a config for it."
    },
    {
      title: "partitionBy (physical, on write) vs. repartition (in-memory)",
      badge: "gotcha",
      concept: "These two easily get confused because they share the word 'partition' but solve completely different problems. repartition(n) (covered earlier in this tab) changes the number of in-memory partitions a DataFrame is split into during processing — it affects parallelism during computation, not the output file layout. partitionBy('year', 'month') is a write-time option that creates an actual physical directory structure on disk/object storage (.../year=2026/month=07/...) — it doesn't change in-memory processing at all; it changes how output files are organized so that a future read with a filter on that column can skip entire directories without reading their contents at all (partition pruning at the storage layer, conceptually similar to Snowflake's micro-partition pruning, just done via literal folder structure instead of internal metadata).",
      navLabel: "Try it:",
      nav: "Write output partitioned by a column commonly filtered on downstream.",
      code: `(df_clean
    .write
    .partitionBy("state")
    .format("delta")
    .mode("overwrite")
    .saveAsTable("city_price_stats_partitioned"))
# Result: one subdirectory per distinct state value, e.g. state=CA/, state=TX/, ...
# A later query filtering WHERE state = 'CA' skips reading every other directory entirely.`,
      noteLabel: "Interview framing:",
      note: "'What's the difference between repartition and partitionBy' is a near-guaranteed question specifically because they sound like the same concept — the clean answer is: repartition is about in-memory parallelism during processing, partitionBy is about physical file layout on write for future read pruning. Over-partitioning on write (too many distinct values, e.g. partitioning by a high-cardinality column like customer_id) creates the small-file problem at the storage layer — a real, common mistake worth naming unprompted."
    }
  ]
},

streaming: {
  intro: {
    title: "Stage 5 — Structured Streaming",
    desc: "Real-time/near-real-time processing with the same DataFrame API used for batch — Spark unifies both under Structured Streaming rather than a separate streaming-only API."
  },
  cards: [
    {
      title: "Micro-batch vs. continuous processing",
      badge: "concept",
      concept: "Structured Streaming's default execution model is micro-batch: Spark repeatedly runs the same batch query against whatever new data has arrived since the last cycle, at a configurable trigger interval — it's not truly event-by-event streaming, but batches so small (sub-second to seconds) it behaves like streaming for most use cases. A separate, more experimental Continuous Processing mode offers true low-latency (~1ms) processing but with a much smaller feature set — in practice, the vast majority of real Spark streaming jobs use micro-batch.",
      navLabel: "Interview framing:",
      nav: "Don't confuse this with Kafka's own per-message delivery — Spark's micro-batch model reads from Kafka (or any streaming source) and processes accumulated new records on each trigger, not one Kafka message at a time.",
      code: null,
      note: null
    },
    {
      title: "Reading a stream and writing a stream",
      badge: "api",
      concept: "The DataFrame API is identical between batch and streaming — spark.read becomes spark.readStream, and .write becomes .writeStream — the same transformations (select, filter, groupBy, join) work on both, which is exactly what 'unified batch and streaming' means in practice.",
      navLabel: "Try it:",
      nav: "Read from a directory being continuously written to (or a Kafka topic in a real setup) and write results to a Delta table.",
      code: `stream_df = (
    spark.readStream
    .format("json")
    .schema(known_schema)          # required for streaming sources — no inferSchema
    .load("/mnt/raw/events/")
)

transformed = stream_df.filter(F.col("event_type") == "purchase")

query = (
    transformed.writeStream
    .format("delta")
    .option("checkpointLocation", "/mnt/checkpoints/purchases/")
    .outputMode("append")
    .trigger(processingTime="30 seconds")
    .start("/mnt/curated/purchases/")
)
query.awaitTermination()`,
      note: "Streaming sources require an explicit schema — inferSchema isn't allowed, since Spark can't infer a schema from data that hasn't arrived yet."
    },
    {
      title: "Checkpointing",
      badge: "concept",
      concept: "A checkpoint directory stores the streaming query's progress (which offsets/files have been processed) and state (for stateful operations like aggregations) durably, so if the job crashes and restarts, it resumes exactly where it left off rather than reprocessing everything or skipping data. This is the streaming equivalent of a Snowflake Stream's offset — both exist to make 'what's new since I last processed' a durable, resumable fact rather than something tracked only in memory.",
      navLabel: "Interview framing:",
      nav: "A checkpoint is tied to the specific query logic — changing the transformation logic significantly (adding a new aggregation, changing a join) can invalidate an existing checkpoint and require starting fresh, which is a real operational gotcha worth knowing.",
      code: null,
      note: null
    },
    {
      title: "Output modes: append, update, complete",
      badge: "api",
      concept: "Append only writes new rows since the last trigger — works for simple filters/maps but not for aggregations where existing output rows can change. Update writes only rows that changed since last trigger (works for aggregations). Complete rewrites the entire result table every trigger — only viable for aggregations small enough to fully materialize each time.",
      navLabel: "Interview framing:",
      nav: "'I'm doing a streaming groupBy and append mode is throwing an error' — this is the single most common Structured Streaming beginner error, because aggregation results can retroactively change as more matching data arrives, which append mode structurally can't represent; the fix is switching to update or complete mode.",
      code: null,
      note: null
    },
    {
      title: "Watermarking and late data",
      badge: "concept",
      concept: "In event-time processing (grouping by when an event happened, not when Spark received it), Spark needs to know when it's safe to stop waiting for more late-arriving data for a given time window and finalize/emit the result. A watermark declares an explicit tolerance: 'once I've seen an event timestamp X, assume no more events older than X minus threshold will arrive, and drop/ignore any that do.' Without a watermark on a windowed aggregation, Spark would have to keep unbounded state forever, waiting indefinitely for data that might never come.",
      navLabel: "Try it:",
      nav: "Apply a watermark before a windowed aggregation on event time.",
      code: `windowed = (
    stream_df
    .withWatermark("event_time", "10 minutes")
    .groupBy(F.window("event_time", "5 minutes"), "event_type")
    .count()
)`,
      note: "'How does Spark handle data that arrives late' is a direct signal question for streaming maturity — the answer is watermarking, and the trade-off is explicit: too tight a threshold drops legitimately late data, too loose a threshold keeps state around (and memory pressure) longer than necessary."
    },
    {
      title: "Exactly-once semantics with idempotent sinks",
      badge: "concept",
      concept: "Structured Streaming guarantees exactly-once processing for the data itself (via checkpointed offsets — no data is double-counted internally), but end-to-end exactly-once delivery to an external sink depends on that sink supporting idempotent or transactional writes. Delta Lake sinks get this for free (writes are transactional, and re-running a micro-batch after a failure just re-applies the same transaction). A sink that doesn't support this (e.g. a plain REST API call inside a foreachBatch) can end up processing the same micro-batch twice after a restart unless you build idempotency into the write yourself (e.g. an upsert keyed on a unique event ID).",
      navLabel: "Interview framing:",
      nav: "This mirrors the exact same idempotency conversation from the Snowflake module's Streams+Tasks tab — 'Spark/Kafka give you at-least-once delivery guarantees at the framework level; true exactly-once end-to-end is a property you have to engineer into the sink, not something the framework hands you automatically for any target.'",
      code: null,
      note: null
    }
  ]
},

delta: {
  intro: {
    title: "Stage 6 — Delta Lake",
    desc: "Delta Lake is the storage layer that gives plain Parquet files ACID transactions, schema enforcement, and time travel — it's the reason Databricks pipelines default to Delta tables instead of raw Parquet, and it maps almost one-to-one onto Snowflake concepts covered elsewhere in this project."
  },
  cards: [
    {
      title: "What Delta Lake adds on top of Parquet",
      badge: "concept",
      concept: "Plain Parquet files in object storage have no transaction concept — a failed write can leave partial files behind, concurrent writers can corrupt each other's output, and there's no way to atomically swap old data for new. Delta Lake solves this with a transaction log (_delta_log/, a sequence of JSON + checkpoint files recording every add/remove file operation) sitting alongside the actual Parquet data files — every read/write goes through this log, giving you ACID guarantees on top of storage that has none natively.",
      navLabel: "Interview framing:",
      nav: "'What is Delta Lake, in one sentence' — a transaction log layer on top of Parquet files that adds ACID transactions, and everything else (time travel, schema enforcement, MERGE) follows from that log existing.",
      code: null,
      note: null
    },
    {
      title: "Time travel",
      badge: "concept",
      concept: "Because the transaction log records every version of the table, you can query (or restore) the table as it existed at any prior version or timestamp — directly analogous to Snowflake's Time Travel, though the mechanism differs (Delta replays the log to reconstruct the file set for that version; Snowflake retains historical micro-partitions internally).",
      navLabel: "Try it:",
      nav: "Query a previous version after making a change.",
      code: `# By version number
spark.read.format("delta").option("versionAsOf", 3).table("city_price_stats")

# By timestamp
spark.read.format("delta").option("timestampAsOf", "2026-07-01").table("city_price_stats")

# Full version history
spark.sql("DESCRIBE HISTORY city_price_stats").show()

# Roll back to a prior version
spark.sql("RESTORE TABLE city_price_stats TO VERSION AS OF 3")`,
      note: "Time travel depends on the old data files still existing — VACUUM (covered below) permanently deletes files older than its retention threshold, which caps how far back you can actually travel."
    },
    {
      title: "Schema enforcement and schema evolution",
      badge: "concept",
      concept: "By default, Delta enforces schema on write — a write with mismatched column types or unexpected extra columns fails loudly rather than silently succeeding with corrupted/null data (schema enforcement). When a schema change is intentional, mergeSchema=True lets a write add new columns to the target table's schema (schema evolution) instead of failing.",
      navLabel: "Try it:",
      nav: "Add a new column via an evolving write instead of hand-running ALTER TABLE.",
      code: `df_with_new_col.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable("city_price_stats")`,
      note: "This is the direct Delta equivalent of the 'schema evolution isn't handled' gap flagged in the Snowflake module's production-hardening discussion — worth explicitly contrasting the two approaches if asked how each platform handles it."
    },
    {
      title: "MERGE INTO — upserts",
      badge: "concept",
      concept: "MERGE INTO on a Delta table works exactly like Snowflake's MERGE — match incoming rows against the target on a key, UPDATE matches, INSERT non-matches — and it's the standard way to do incremental/idempotent loads into a Delta table, the same idempotency pattern used throughout the Snowflake module's Tasks+Streams tab.",
      navLabel: "Try it:",
      nav: "Upsert a batch of updates into the curated table.",
      code: `from delta.tables import DeltaTable

target = DeltaTable.forName(spark, "city_price_stats")

(target.alias("tgt")
    .merge(df_updates.alias("src"), "tgt.city = src.city AND tgt.state = src.state")
    .whenMatchedUpdateAll()
    .whenNotMatchedInsertAll()
    .execute())`,
      note: null
    },
    {
      title: "OPTIMIZE and Z-ORDER",
      badge: "performance",
      concept: "Frequent small writes (e.g. from streaming or many incremental batches) leave a Delta table fragmented into many small files, which hurts read performance (more file-open overhead, less efficient scanning). OPTIMIZE compacts small files into larger ones (Delta's version of Snowflake's automatic background compaction, but manually triggered). ZORDER BY colocates rows with similar values in a given column together within those compacted files, which lets Delta's data-skipping statistics prune far more aggressively on filters against that column — directly analogous to a Snowflake clustering key.",
      navLabel: "Try it:",
      nav: "Compact and Z-order a table that's been receiving frequent small writes.",
      code: `spark.sql("OPTIMIZE city_price_stats ZORDER BY (state)")`,
      note: "'Delta's OPTIMIZE ZORDER is basically Snowflake's CLUSTER BY key' is a strong comparison to have ready — both exist to solve the exact same problem (help the engine prune irrelevant data on a selective filter) via a similar mechanism (colocating similar values together), just triggered differently (manual OPTIMIZE run vs. Snowflake's automatic background reclustering)."
    },
    {
      title: "VACUUM — cleaning up old files",
      badge: "concept",
      concept: "Because time travel and concurrent readers depend on old file versions still existing, Delta doesn't delete superseded data files immediately on overwrite/delete — VACUUM is what actually removes files older than a retention threshold (default 7 days) that are no longer referenced by any retained table version, freeing storage.",
      navLabel: "Try it:",
      nav: "Manually vacuum a table (rarely needed on a schedule since Databricks can automate this, but important to understand for the retention/time-travel trade-off).",
      code: `-- Dry run first to see what would be deleted
spark.sql("VACUUM city_price_stats DRY RUN")

spark.sql("VACUUM city_price_stats RETAIN 168 HOURS")  -- 7 days, the default`,
      note: "Running VACUUM with too short a retention window is a real, hard-to-reverse mistake — it can delete files a concurrent long-running read or an intended time-travel query still needed, directly paralleling why Snowflake's DATA_RETENTION_TIME_IN_DAYS is a deliberate per-table decision, not a default to leave unexamined."
    }
  ]
},

storage: {
  intro: {
    title: "Stage 7 — Storage internals, testing, and operations",
    desc: "The file-format knowledge behind why Parquet is the default, how to actually test PySpark transformation logic, and the operational patterns (incremental ingestion, scheduling, cost control) that come up once a pipeline needs to run unattended in production."
  },
  cards: [
    {
      title: "Parquet internals: why it's the default file format",
      badge: "storage",
      concept: "Parquet is a columnar storage format — values from the same column are stored together on disk, rather than row-by-row like CSV/JSON. This matters for two reasons: a query that only needs 3 of a table's 40 columns only has to read those 3 columns' bytes off disk (column pruning), and each column chunk carries its own min/max statistics per row group (a row group is a horizontal slice of the file, typically ~128MB), so a filter can skip entire row groups whose min/max can't possibly match (predicate pushdown) — conceptually the same pruning idea as Snowflake's micro-partition metadata, just implemented at the file level instead of inside a managed warehouse. Parquet also supports per-column compression (snappy is the common default — fast, moderate ratio; gzip/zstd compress smaller but slower) and columnar encoding (dictionary/run-length encoding for repetitive values), which is why Parquet files are usually dramatically smaller than the equivalent CSV/JSON.",
      navLabel: "Interview framing:",
      nav: "'Why Parquet over CSV/JSON for large-scale data' — columnar storage enables column pruning and predicate pushdown that row-based formats structurally can't do, plus better compression from columnar encoding — not just 'it's faster,' but specifically why.",
      code: null,
      note: null
    },
    {
      title: "Testing PySpark transformation logic",
      badge: "testing",
      concept: "Transformation logic (the kind built in the Setup tab's mini pipeline) is regular Python code operating on DataFrames, and it's testable the same way any Python code is — the key enabler is running Spark locally (master='local[*]') so tests don't need a real cluster, and comparing actual vs. expected DataFrames (by collecting small test DataFrames or using a comparison helper) rather than eyeballing .show() output.",
      navLabel: "Try it:",
      nav: "A minimal pytest-based unit test for a transformation function, run entirely locally.",
      code: `# conftest.py
import pytest
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark():
    return SparkSession.builder.master("local[*]").appName("tests").getOrCreate()

# test_transform.py
def test_price_per_1000_pop(spark):
    input_df = spark.createDataFrame(
        [("Austin", "TX", 1000000, 300000.0)],
        ["city", "state", "population", "median_price"]
    )
    result = clean_and_derive(input_df)  # the function under test, extracted from the notebook
    row = result.collect()[0]
    assert row.price_per_1000_pop == 300.0`,
      noteLabel: "Interview framing:",
      note: "'How do you test Spark code' is a real differentiator question — many candidates have only ever run transformations interactively in a notebook and never extracted them into testable functions at all. Mentioning local[*] mode, small hand-built input DataFrames instead of production-scale data, and asserting on collected output signals real engineering practice, not just notebook exploration."
    },
    {
      title: "Databricks Auto Loader (cloudFiles) — Spark's answer to incremental ingestion",
      badge: "ingestion",
      concept: "Auto Loader is Databricks' mechanism for incrementally and efficiently ingesting new files as they land in cloud storage (S3/ADLS/GCS), without re-scanning the entire directory on every run — it tracks which files have already been processed (via either directory listing with checkpointing, or cloud-native file notifications, similarly to how Snowpipe listens on an SQS queue fed by S3 event notifications). This is the direct Spark/Databricks equivalent of the Snowpipe auto-ingest pattern covered in the Snowflake module's ingestion setup — same underlying goal (process only new files, near-real-time, without manual re-scans), different platform.",
      navLabel: "Try it:",
      nav: "Read incrementally from an S3 path with Auto Loader inside a streaming job.",
      code: `df_stream = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/mnt/schemas/orders/")
    .load("s3://my-bucket/raw/orders/")
)

(df_stream.writeStream
    .format("delta")
    .option("checkpointLocation", "/mnt/checkpoints/orders/")
    .trigger(availableNow=True)   # process what's currently available, then stop — good for scheduled batch-style runs
    .start("/mnt/curated/orders/"))`,
      noteLabel: "Interview framing:",
      note: "'How would you incrementally ingest new files landing in S3 into a Spark/Databricks pipeline, without a full directory rescan each time' — Auto Loader, and being able to name that it can use cloud-native file notifications (not just directory listing) for efficiency at scale is the same maturity signal as knowing Snowpipe uses SQS rather than polling."
    },
    {
      title: "Orchestrating Spark jobs: Databricks Jobs and Airflow",
      badge: "ops",
      concept: "A notebook run interactively is fine for development, but a production pipeline needs to run unattended, on a schedule, with retries and alerting — Databricks Jobs (schedule a notebook or JAR/wheel to run on its own job cluster, with retry policies and email/webhook alerts built in) is the platform-native way to do this. For pipelines that need to coordinate Spark alongside other systems (the same reasoning as the Snowflake module's dbt+Airflow tab), Airflow can trigger a Databricks job run via its Databricks provider operator instead.",
      navLabel: "Try it:",
      nav: "Trigger a Databricks Job run from an Airflow DAG rather than duplicating scheduling logic in two places.",
      code: `from airflow.providers.databricks.operators.databricks import DatabricksRunNowOperator

run_spark_job = DatabricksRunNowOperator(
    task_id="run_pyspark_pipeline",
    databricks_conn_id="databricks_default",
    job_id=12345,   # the Databricks Job ID configured in the workspace UI
)`,
      noteLabel: "Interview framing:",
      note: "'Notebook run manually' vs. 'Databricks Job' vs. 'Airflow triggering a Databricks Job' is a spectrum of production-readiness worth being able to place a given setup on — mirroring exactly the same 'native orchestration vs. external orchestrator' trade-off discussion already covered for Snowflake Tasks vs. dbt+Airflow."
    },
    {
      title: "Bucketing (bucketBy) for repeated joins on the same key",
      badge: "storage",
      concept: "bucketBy pre-shuffles and pre-sorts data into a fixed number of buckets by a key at write time, and persists that bucketing as part of the table's metadata — when two tables are bucketed identically on the same join key and bucket count, a later join between them can skip the shuffle entirely (a sort-merge-bucket join), because matching keys are already guaranteed to live in the same bucket. This only pays off for a join pattern repeated often enough (e.g. a daily job joining the same two large tables) to amortize the one-time cost of bucketing the data.",
      navLabel: "Try it:",
      nav: "Bucket two tables identically before a repeated join.",
      code: `df_orders.write.bucketBy(8, "customer_id").sortBy("customer_id").saveAsTable("orders_bucketed")
df_customers.write.bucketBy(8, "customer_id").sortBy("customer_id").saveAsTable("customers_bucketed")
# A later join on customer_id between these two tables can skip the shuffle entirely`,
      noteLabel: "Interview framing:",
      note: "Lower priority than broadcast joins for most interviews, but worth knowing exists — 'bucketing trades a one-time write-time cost for avoiding a shuffle on every future join,' as the concise answer if asked to go beyond broadcast joins."
    },
    {
      title: "FAIR vs. FIFO scheduling within one Application",
      badge: "internals",
      concept: "This is a different scheduling concept from the DAGScheduler/TaskScheduler covered in the Execution Model tab — it's about how multiple concurrent Jobs within the same Application (e.g. two notebook cells running simultaneously, or multiple threads submitting jobs against the same SparkSession) share the Application's executors. FIFO (the default) runs Jobs in submission order — an early, long-running Job can starve later Jobs of resources until it finishes. The FAIR scheduler instead round-robins resources across concurrent Jobs so a long job doesn't block short ones behind it.",
      navLabel: "Try it:",
      nav: "Switch to FAIR scheduling for a workload with multiple concurrent, independent jobs sharing one Application.",
      code: `spark.conf.set("spark.scheduler.mode", "FAIR")`,
      noteLabel: "Interview framing:",
      note: "This is a niche but real distinguishing question — most candidates only know about cluster-manager-level resource allocation and have never considered that jobs within a single Application also need a scheduling policy relative to each other."
    },
    {
      title: "Cost control: autoscaling, spot instances, cluster pools",
      badge: "ops",
      concept: "Autoscaling (the cluster-level version of dynamic allocation covered in Architecture & Performance) lets a Databricks cluster grow/shrink its worker count based on load rather than running a fixed size for the job's entire duration. Spot instances (cheaper, reclaimable-on-short-notice cloud VMs) can cut compute cost substantially for fault-tolerant batch workloads — Spark's task-level retry behavior (covered in Execution Model) makes it naturally resilient to losing a spot-instance executor mid-job, unlike a stateful application that would need to handle that itself. Cluster pools keep a set of idle, pre-warmed instances ready so a new cluster attaches to them instantly instead of waiting several minutes for cloud VMs to provision from scratch — trading a small always-on idle cost for much faster cluster startup.",
      navLabel: "Interview framing:",
      nav: "'How would you control Databricks cluster costs' — autoscaling instead of fixed oversized clusters, spot instances for fault-tolerant batch jobs (not for jobs that can't tolerate an executor disappearing), and pools if fast job-start latency matters enough to justify a small idle-instance cost — directly parallel to the resource-monitor/warehouse-sizing cost conversation already covered in the Snowflake module.",
      code: null,
      note: null
    }
  ]
},

advanced: {
  intro: {
    title: "Stage 8 — Join strategies, Photon, stragglers, stateful streaming & modern Delta",
    desc: "The staff-level surface beyond core tuning: how Catalyst actually chooses a join, what Photon is, how Spark handles slow/lost tasks, real stateful streaming (stream-stream joins and arbitrary state), and the modern Delta/Databricks features (CDF, liquid clustering, deletion vectors, DLT, Unity Catalog) that come up for senior candidates."
  },
  cards: [
    {
      title: "Join strategies: how Catalyst picks, and how to override it",
      badge: "deep-dive",
      concept: "Spark has several physical join implementations and Catalyst chooses among them by cost. Broadcast Hash Join: ship the small side to every executor, build a hash table, no shuffle of the big side — the fastest, chosen when one side is under spark.sql.autoBroadcastJoinThreshold (default 10MB, raised by AQE at runtime). Sort-Merge Join: shuffle BOTH sides by the join key, sort, merge — the default for two large tables; robust but pays two shuffles + sorts. Shuffle Hash Join: shuffle both sides but build a hash table instead of sorting — used when one side is smallish but over the broadcast threshold and hashing is cheaper than sorting. Broadcast Nested Loop / Cartesian: the fallback for non-equi joins — usually a red flag.",
      navLabel: "The practical levers:",
      nav: "The most common performance fix is forcing or preventing a broadcast: broadcast(df) hint (or /*+ BROADCAST(t) */ in SQL) when Catalyst underestimates a small side after filtering, or RAISING autoBroadcastJoinThreshold. AQE also converts sort-merge to broadcast at runtime once it sees real post-filter sizes. Set it to -1 to disable broadcasting entirely when a 'small' side is actually large enough to OOM the executors building the hash table. The interview signal is knowing sort-merge is the large-table default and broadcast is the thing you reach for — and why an errant broadcast causes executor OOM.",
      code: "from pyspark.sql.functions import broadcast\nbig.join(broadcast(small), \"key\")          # force broadcast hash join\n# SQL: SELECT /*+ BROADCAST(small) */ ...\nspark.conf.set(\"spark.sql.autoBroadcastJoinThreshold\", 50*1024*1024)",
      note: "A join silently degrading to Sort-Merge (or worse, a Cartesian/BroadcastNestedLoop for a non-equi condition) is a top cause of slow jobs. .explain() literally names the join type in the physical plan — that's the first thing to check."
    },
    {
      title: "Photon — the vectorized C++ engine",
      badge: "databricks",
      concept: "Photon is Databricks' native, vectorized query engine written in C++ that replaces parts of the JVM-based Spark execution for SQL and DataFrame operations. Instead of row-at-a-time JVM code, it processes data in columnar batches with SIMD vectorization, which speeds up scans, filters, joins, and aggregations — often 2-3x on SQL-heavy/analytical workloads — while being transparent (same DataFrame/SQL API, it just runs operators it supports and falls back to Spark for the rest). It's a Databricks feature, not open-source Spark.",
      navLabel: "When it helps and when it doesn't:",
      nav: "Photon shines on SQL/DataFrame analytical work — big scans, joins, aggregations on columnar (Delta/Parquet) data. It does NOT accelerate arbitrary Python UDFs or RDD code (those still run on the JVM/Python), so a job dominated by a Python UDF sees little benefit — another reason to prefer built-in functions. It also changes the cost equation: Photon clusters cost more per DBU but often finish faster, so the honest answer is 'benchmark total job cost, not just runtime.' Knowing Photon is columnar/vectorized and UDF-blind is the senior-level point.",
      note: null
    },
    {
      title: "Stragglers: speculative execution & the external shuffle service",
      badge: "deep-dive",
      concept: "A straggler is one task far slower than its peers (a slow disk, a noisy-neighbor node, mild skew). Speculative execution (spark.speculation=true) launches a duplicate copy of a task that's running much slower than the median; whichever finishes first wins, the other is killed — it hides transient slow nodes at the cost of some redundant work. Separately, the external shuffle service is a process that lives on each worker node and serves shuffle files independently of the executors — so an executor can be removed (dynamic allocation scaling down, or a spot-instance reclaim) WITHOUT losing the shuffle data other stages still need to read.",
      navLabel: "Why they matter together at scale:",
      nav: "Dynamic allocation (add/remove executors based on load) is only safe with the external shuffle service — otherwise scaling down or losing an executor would delete shuffle output and force expensive recomputation. Speculative execution is the mitigation for stragglers that aren't true data skew (which you fix with salting/AQE instead). The distinction interviewers probe: speculation helps with a slow NODE; salting/AQE skew-join helps with a slow PARTITION (uneven data). Using speculation to paper over real skew just wastes compute duplicating an inherently huge task.",
      note: "On Databricks, decommissioning + the shuffle service is also what makes spot/preemptible instances viable — a reclaimed node's shuffle data is migrated rather than lost. This is a big cost lever tied directly to this machinery."
    },
    {
      title: "Stateful Structured Streaming: stream-stream joins & arbitrary state",
      badge: "streaming deep-dive",
      concept: "Beyond stateless map/filter, Structured Streaming keeps STATE across micro-batches in a state store (backed by checkpointed files, RocksDB on Databricks). Stream-stream joins buffer both sides in state and require a watermark + time constraint on the join condition so state doesn't grow unbounded — you're joining events within a bounded time window of each other. For logic that windowing can't express, flatMapGroupsWithState / mapGroupsWithState (and the newer transformWithState) let you maintain arbitrary per-key state with your own timeout/eviction — e.g. sessionization, custom deduplication, or state machines over an event stream.",
      navLabel: "The thing that bites people:",
      nav: "Unbounded state growth. A stream-stream join or arbitrary-state operator without a watermark (or with too loose a one) accumulates state forever until the job OOMs or checkpoints balloon — the #1 stateful-streaming failure. The watermark is what tells Spark 'events older than this can't match anymore, evict their state.' The senior answer to any stateful-streaming design question always names the watermark and the state-eviction/timeout policy explicitly, and treats the state store size as a first-class metric to monitor.",
      note: "RocksDB state store (vs the default in-memory + HDFS) is the standard choice for large state — it spills to local disk so state bigger than executor memory doesn't OOM, at the cost of some latency. Naming it signals you've run stateful streaming at real scale."
    },
    {
      title: "Modern Delta: Change Data Feed, liquid clustering, deletion vectors",
      badge: "delta advanced",
      concept: "Change Data Feed (CDF, delta.enableChangeDataFeed=true) makes a Delta table emit row-level changes (insert/update/delete with _change_type) so downstream consumers can read just what changed — Delta's answer to CDC on the lake, powering incremental MERGE pipelines without diffing whole tables. Liquid clustering replaces both partitioning and Z-ordering with a single CLUSTER BY that adapts automatically as data and query patterns evolve — no more choosing partition columns up front or manual re-Z-ordering. Deletion vectors implement merge-on-read deletes/updates: instead of rewriting a whole Parquet file to delete a few rows, Delta records which rows are logically deleted in a side file, making DELETE/UPDATE/MERGE far cheaper (rewrite happens later during OPTIMIZE).",
      navLabel: "Why each is a senior talking point:",
      nav: "CDF is how you build efficient incremental downstream loads (read changes, MERGE them) instead of full recomputes. Liquid clustering is the current best-practice answer to 'how do you physically lay out a Delta table' — and 'don't over-partition into tiny files' is the classic mistake it prevents. Deletion vectors flip the cost of point deletes/updates from 'rewrite gigabytes' to 'write a tiny vector,' which matters enormously for GDPR-style row deletes and frequent MERGEs. Knowing these exist and what problem each solves separates current knowledge from Spark-2.x-era knowledge.",
      note: null
    },
    {
      title: "Declarative pipelines (DLT) & Unity Catalog governance",
      badge: "platform",
      concept: "Delta Live Tables / Lakeflow Declarative Pipelines let you define a pipeline as a set of declarative table definitions with built-in data-quality EXPECTATIONS (constraints that can drop, quarantine, or fail on bad rows), automatic dependency resolution, incremental processing, and managed orchestration — you declare the tables and the framework handles the DAG, retries, and streaming-vs-batch execution. Unity Catalog is Databricks' unified governance layer: a three-level namespace (catalog.schema.table), centralized access control, column/row-level security, data lineage, and audit across all workspaces — the equivalent of the RBAC + lineage story you'd expect from a warehouse, applied to the lakehouse.",
      navLabel: "Where these come up:",
      nav: "DLT answers 'how do you productionize and quality-gate a Spark pipeline without hand-writing all the orchestration and validation' — expectations are the headline feature (declarative data quality). Unity Catalog answers 'how do you govern data access and get lineage across a lakehouse' — it's the modern replacement for per-workspace hive metastore + ad-hoc ACLs. You don't need to have used them deeply, but naming DLT's expectations and Unity Catalog's centralized lineage/RBAC shows you understand the platform, not just the engine.",
      note: null
    }
  ]
},

comparison: {
  intro: {
    title: "Spark vs. Snowflake, and RDD vs. DataFrame — when to use which",
    desc: "Two comparisons that come up constantly in interviews: when to reach for Spark instead of (or alongside) a warehouse like Snowflake, and which Spark API to default to."
  },
  cards: [
    {
      title: "Spark vs. Snowflake — architecture and use case",
      badge: "trade-off",
      concept: "Snowflake is a managed SQL-first warehouse: storage and compute are separated, but you interact with it almost entirely through SQL, and Snowflake manages the execution engine internals for you. Spark is a general-purpose distributed compute engine you program directly (Python/Scala/SQL), with far more control over — and more responsibility for — partitioning, caching, and execution behavior.",
      navLabel: "Practical decision rule:",
      nav: "Reach for Snowflake when the work is primarily SQL-shaped analytics/BI on structured or semi-structured data and low operational overhead matters most. Reach for Spark when you need custom transformation code Snowflake SQL can't express cleanly, ML feature engineering/training, processing before data ever lands in a warehouse, or a single unified engine across batch and streaming. Many real architectures use both together — Spark for heavy upstream transformation/ML, Snowflake for the serving/BI layer downstream.",
      code: null,
      note: null
    },
    {
      title: "RDD vs. DataFrame vs. Dataset",
      badge: "trade-off",
      concept: "RDD: no schema, functional API, no Catalyst optimization — full control, but you own performance yourself. DataFrame: schema-aware, optimized by Catalyst, available in PySpark/Scala/Java/R — the default choice for nearly everything. Dataset: DataFrame plus compile-time type safety — Scala/Java only, not available in PySpark, valuable when you want the compiler to catch a schema mismatch before runtime.",
      navLabel: "Interview framing:",
      nav: "In a PySpark-specific interview, the realistic answer is simply 'DataFrame by default, RDD only for the rare case Catalyst can't express or optimize (custom partitioning logic, certain low-level operations)' — Datasets aren't part of the PySpark conversation at all since Python has no compile-time type checking to benefit from them.",
      code: null,
      note: null
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — talk through this project",
    desc: "Each card is a question you're likely to get in a Data Engineer interview covering Spark/PySpark, framed around this module's mini pipeline. Read the question, form your own answer first, then expand for a model answer."
  },
  cards: [
    {
      title: "\"Walk me through a Spark/PySpark pipeline you've built.\"",
      followups: [
        "\"Where in that pipeline is the first shuffle, and could you avoid it?\"",
        "\"How did you decide the output partition count?\"",
        "\"What did .explain() tell you that you actually acted on?\""
      ],
      navLabel: "How to approach it:",
      badge: "behavioral",
      nav: "Use this project's shape as your STAR narrative: Situation (need to transform raw data at a scale/complexity SQL alone couldn't handle cleanly), Task (build a reliable, performant ETL job), Action (DataFrame API transformations, Delta for the output, attention to shuffles/partitioning), Result (a curated table ready for downstream consumption). Keep it under 90 seconds.",
      noteLabel: "Model answer:",
      note: "\"I built a PySpark pipeline that reads raw source files, applies a series of DataFrame transformations — type casting, filtering, derived columns — and writes the curated result as a Delta table so downstream consumers get ACID guarantees and time travel for free. Along the way I paid attention to the things that actually determine whether a Spark job is fast or slow: avoiding unnecessary shuffles, using broadcast joins where one side was small, and checking the physical plan with .explain() rather than guessing at performance.\""
    },
    {
      title: "Why DataFrame API over RDDs for almost everything?",
      followups: [
        "\"Give a concrete case where you'd still drop down to an RDD.\"",
        "\"What can Catalyst do with a DataFrame filter that it can't with an RDD's lambda?\"",
        "\"Where does a Python UDF sit on this spectrum, and why is it a problem?\""
      ],
      navLabel: "How to approach it:",
      badge: "concept",
      nav: "Tie the answer to Catalyst specifically, not just 'it's easier to write.'",
      noteLabel: "Model answer:",
      note: "DataFrames carry a schema and get compiled through Catalyst's optimizer — predicate pushdown, column pruning, join reordering, whole-stage code generation — none of which Catalyst can do for an RDD, because an RDD's transformations are opaque Python/Scala closures it can't see inside. The performance gap isn't marginal; it's the difference between an optimized JVM execution plan and interpreted, row-by-row Python in the worst case."
    },
    {
      title: "How do you approach debugging a slow Spark job?",
      followups: [
        "\"The Spark UI shows one task taking 10x the others — what is that, and how do you fix it?\"",
        "\"How do you tell a broadcast join from a shuffle join in the plan?\"",
        "\"A filter isn't being pushed to the source — how would you notice, and why does it happen?\""
      ],
      navLabel: "How to approach it:",
      badge: "deep-dive",
      nav: "Give a concrete diagnostic order, not a vague 'I'd look at the logs.'",
      noteLabel: "Model answer:",
      note: "\"First, .explain() on the DataFrame to see the physical plan — am I getting a broadcast join where I expect one, is a filter actually pushed down to the source? Second, the Spark UI's Stages tab — looking for a stage with disproportionate shuffle read/write, or wildly uneven task durations, which usually means data skew. Third, checking partition count and size going into expensive stages — too few large partitions underutilizes the cluster, too many tiny ones adds scheduling overhead. From there it's usually one of: add a broadcast hint, repartition on a better key, salt a skewed key, or cache a DataFrame that's being recomputed multiple times.\""
    },
    {
      title: "Walk me through what happens when I call .write() on a DataFrame.",
      followups: [
        "\"Where exactly are the stage boundaries drawn, and why there?\"",
        "\"An executor dies mid-write — what does Spark do? And what if the driver dies instead?\"",
        "\"Why can't stage 2 start before every task in stage 1 finishes?\""
      ],
      navLabel: "How to approach it:",
      badge: "deep-dive",
      nav: "This is the execution-model question, almost verbatim — narrate the full chain from the Execution Model tab rather than staying at the surface level of 'it writes the data.'",
      noteLabel: "Model answer:",
      note: "\"Calling .write() is the action that finally triggers the accumulated lazy plan. The Driver's DAGScheduler looks at that plan and creates one Job, then walks it backward, cutting a new Stage at every wide-dependency shuffle boundary — narrow operations like filter and select before the first shuffle stay pipelined into one stage. Each Stage becomes a TaskSet with one task per partition, which the TaskScheduler hands off to executors, respecting data locality where possible. Stage 2 can't start until every task in Stage 1 finishes writing its shuffle output. If a single task fails transiently, the TaskScheduler just retries that task; if a whole executor is lost, the DAGScheduler recomputes the lost partitions from lineage rather than restarting the Job. I'd verify all of this concretely in the Spark UI's Jobs → Stages → Tasks views rather than just asserting it.\""
    },
    {
      title: "What's the difference between cache() and checkpoint()?",
      followups: [
        "\"cache() didn't speed anything up — when is it useless or even harmful?\"",
        "\"Why does checkpoint() truncate lineage, and when do you actually need that?\"",
        "\"How is this different from Structured Streaming's checkpointing?\""
      ],
      navLabel: "How to approach it:",
      badge: "gotcha",
      nav: "A good one to have precise, since the two sound similar but solve different problems.",
      noteLabel: "Model answer:",
      note: "cache()/persist() stores a DataFrame's materialized result in memory/disk on the executors to avoid recomputing it across multiple actions — but it doesn't truncate lineage; if an executor holding cached data is lost, Spark still knows how to recompute it from the original plan. checkpoint() (a different concept from Structured Streaming's checkpointing) writes the DataFrame to reliable storage and truncates the lineage/DAG entirely — used for very long, iterative lineages (common in ML/graph algorithms) where recomputing from scratch after a failure would be prohibitively expensive, at the cost of an actual write to storage rather than just an in-memory cache."
    },
    {
      title: "How would you handle a job that's failing with executor OOM errors?",
      followups: [
        "\"How would a 'small' broadcast side cause OOM after an upstream filter?\"",
        "\"How do you confirm skew is the cause rather than just guessing?\"",
        "\"Why is 'add more memory' usually the wrong first move?\""
      ],
      navLabel: "How to approach it:",
      badge: "scenario",
      nav: "Walk through a real diagnostic/fix order rather than jumping straight to 'add more memory.'",
      noteLabel: "Model answer:",
      note: "\"I wouldn't reach for a bigger cluster first. I'd check: is a broadcast join broadcasting something bigger than expected (e.g. a 'small' lookup table that grew, or the auto-broadcast threshold misjudging size after upstream filtering)? Is data heavily skewed, so one task/partition is holding far more data than the rest? Am I caching more DataFrames than I actually still need, without unpersisting? Is partition count too low for the data volume, so each partition is oversized for a single task's memory? Only after ruling those out would I actually scale up executor memory, since that just delays the same problem at a higher data volume otherwise.\""
    },
    {
      title: "When would you use Spark instead of Snowflake, or vice versa, in a real pipeline?",
      followups: [
        "\"Give an architecture where you use both — who does what?\"",
        "\"What transformation would you refuse to do in Snowflake SQL and push to Spark?\"",
        "\"Cost-wise, when does Spark actually lose to just running SQL in the warehouse?\""
      ],
      navLabel: "How to approach it:",
      badge: "architecture",
      nav: "Shows you can reason about the two tools together rather than treating them as competitors in every scenario — often the strongest answer is 'both, at different stages.'",
      noteLabel: "Model answer:",
      note: "\"Snowflake for SQL-shaped analytics and BI serving where low operational overhead matters and the transformation logic fits naturally in SQL. Spark when I need custom code Snowflake SQL can't express cleanly, ML feature engineering, or processing that needs to happen before data lands in a warehouse at all — e.g. cleaning and joining large raw files from multiple systems. A lot of real architectures use Spark upstream for the heavy lifting and land clean, curated data into Snowflake for the serving layer, rather than picking one exclusively.\""
    },
    {
      title: "\"How does Spark decide which join to use, and how would you change it?\"",
      navLabel: "How to approach it:",
      badge: "deep-dive",
      nav: "Name the join taxonomy and the cost basis, then the concrete levers (broadcast hint, threshold, AQE). Land the 'sort-merge is the large-table default, broadcast is what you reach for' point.",
      noteLabel: "Model answer:",
      note: "\"Catalyst chooses by cost. If one side is under the autoBroadcastJoinThreshold — 10MB by default, and AQE raises this using real post-filter sizes — it does a broadcast hash join: ship the small side everywhere, no shuffle of the big side, the fastest option. For two large tables it defaults to sort-merge join, which shuffles and sorts both sides; shuffle-hash join is used when one side is smallish but over the broadcast threshold and hashing beats sorting. A non-equi condition falls back to broadcast-nested-loop or Cartesian, which is usually a red flag. To change it I'd add a broadcast() hint when Catalyst underestimates a small side after filtering, or raise the threshold; conversely I'd set it to -1 if a 'small' side is actually large enough to OOM executors building the hash table. I confirm the actual choice in .explain() — the physical plan names the join type.\"",
      followups: [
        "\"An errant broadcast is OOM-ing the executors — what happened and how do you fix it?\"",
        "\"You see a BroadcastNestedLoopJoin in the plan — what does that usually mean?\"",
        "\"How does AQE change the join choice at runtime versus what the static plan picked?\""
      ]
    },
    {
      title: "\"What is Photon, and when does it actually help?\"",
      navLabel: "How to approach it:",
      badge: "databricks",
      nav: "Vectorized C++ engine, columnar batches, transparent — but UDF-blind. Close on 'benchmark total cost, not just runtime.'",
      noteLabel: "Model answer:",
      note: "\"Photon is Databricks' native vectorized engine written in C++ that replaces parts of JVM Spark execution for SQL and DataFrame operators. Instead of row-at-a-time JVM code it processes columnar batches with SIMD, so scans, filters, joins, and aggregations on Delta/Parquet often run 2-3x faster, transparently — same API, it runs the operators it supports and falls back to Spark for the rest. The key limitation is that it doesn't accelerate arbitrary Python UDFs or RDD code — those still run on the JVM/Python — so a UDF-dominated job barely benefits, which is one more reason to prefer built-in functions. And Photon clusters cost more per DBU but often finish faster, so I'd benchmark total job cost rather than assuming faster equals cheaper.\"",
      followups: [
        "\"Your job is dominated by a Python UDF — will Photon help? Why or why not?\"",
        "\"Photon finished faster but the bill went up — how is that possible?\""
      ]
    },
    {
      title: "\"A streaming stream-stream join keeps growing state until the job dies. What's wrong?\"",
      navLabel: "How to approach it:",
      badge: "streaming",
      nav: "This is the watermark question in disguise. Explain unbounded state, the watermark's role in eviction, and the RocksDB state store for large state.",
      noteLabel: "Model answer:",
      note: "\"That's unbounded state growth — the classic stateful-streaming failure. A stream-stream join buffers both sides in the state store to match late-arriving events, and without a watermark plus a time constraint on the join condition, Spark can never conclude that old events won't match anymore, so state grows forever until it OOMs or checkpoints balloon. The fix is a watermark on both streams and a time-bounded join condition, so Spark knows 'events older than this can be evicted.' For genuinely large state I'd use the RocksDB state store, which spills to local disk instead of holding everything in executor memory, and I'd monitor state store size as a first-class metric. The same watermark/eviction thinking applies to arbitrary state via flatMapGroupsWithState — you must define a timeout, or state leaks.\"",
      followups: [
        "\"What exactly does the watermark let Spark do to the state store?\"",
        "\"When would you use flatMapGroupsWithState instead of a windowed aggregation?\"",
        "\"Why RocksDB state store instead of the default, and what does it cost you?\""
      ]
    }
  ]
}
};

const QUIZ = [
  {
    q: "Why does a chain of .filter() and .select() calls execute instantly with no data processed yet?",
    options: [
      "Spark caches all data in memory automatically",
      "Transformations are lazy — nothing runs until an action like .collect() or .write() is called",
      "filter() and select() only work on already-cached DataFrames",
      "Spark pre-computes results during the SparkSession's startup"
    ],
    correct: 1
  },
  {
    q: "What's the main reason a broadcast join is faster than a standard shuffle join?",
    options: [
      "It runs on the Driver instead of the Executors",
      "It compresses the data before sending it",
      "It sends the smaller side to every executor once, avoiding a shuffle of the large side entirely",
      "It only works with cached DataFrames"
    ],
    correct: 2
  },
  {
    q: "Why should you generally avoid a plain Python UDF when a built-in Spark SQL function exists?",
    options: [
      "UDFs require a paid Databricks license",
      "UDFs can only return strings",
      "Plain UDFs serialize data across the JVM/Python boundary per row and are invisible to Catalyst's optimizer, unlike built-ins",
      "UDFs don't work inside notebooks, only in .py scripts"
    ],
    correct: 2
  },
  {
    q: "In Structured Streaming, what does a watermark do?",
    options: [
      "Encrypts data in transit between the source and Spark",
      "Declares a threshold after which late-arriving event-time data is considered too late and can be dropped, bounding how long state is retained",
      "Marks which files have already been read from a directory source",
      "Sets the maximum number of records processed per micro-batch"
    ],
    correct: 1
  },
  {
    q: "What does Delta Lake's transaction log (_delta_log) actually enable?",
    options: [
      "Faster network transfer between executors",
      "ACID transactions, time travel, and safe concurrent writes on top of plain Parquet files",
      "Automatic UDF optimization",
      "Compression of Parquet files to a smaller format"
    ],
    correct: 1
  },
  {
    q: "What's the practical difference between coalesce(n) and repartition(n)?",
    options: [
      "They're identical, just different method names",
      "coalesce can only decrease partitions without a full shuffle; repartition does a full shuffle and can increase or decrease, including rebalancing skew",
      "coalesce works only on RDDs, repartition only on DataFrames",
      "repartition is deprecated in favor of coalesce"
    ],
    correct: 1
  }
];
