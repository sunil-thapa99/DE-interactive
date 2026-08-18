// Content data for the Apache Airflow module.
const MODULE_ID = "airflow";
const CONTENT = {

overview: {
  intro: {
    title: "What is Airflow, and when do you actually reach for it?",
    desc: "Apache Airflow is a workflow orchestrator: you author pipelines as Python code (DAGs of tasks), and a scheduler decides when each task runs, an executor decides where it runs, and a metadata DB records what happened. This module goes from that mental model through DAG authoring, scheduling semantics, and internals to the interview questions a 6+ YOE Data Engineer is expected to answer — not just wire up a DAG, but reason about idempotency, backfills, sensor starvation, and where Airflow is the wrong tool."
  },
  diagram: [
    { label: "DAG files\n(Python, in dags/)", hl: true },
    { arrow: true },
    { label: "Scheduler\n(parses DAGs, creates runs)", hl: true },
    { arrow: true },
    { label: "Executor + Workers\n(Local / Celery / K8s)", hl: true },
    { arrow: true },
    { label: "Metadata DB\n(state, XCom, history)" },
  ],
  cards: [
    {
      title: "What Airflow actually is: code-first orchestration, not a data-processing engine",
      badge: "what & why",
      concept: "Airflow orchestrates work — it decides WHAT runs, WHEN, in WHAT ORDER, and WHAT to do on failure. It does not (and should not) process large data itself. A task is typically a thin trigger: kick off a Spark job, run a dbt model, call a warehouse SQL, land a file. The pipeline is defined as a DAG (Directed Acyclic Graph) in Python: tasks are nodes, dependencies are edges, and 'acyclic' means no task can (even transitively) depend on itself. Because DAGs are plain Python, you get version control, code review, dynamic generation, and testing — the thing that made Airflow win over drag-and-drop schedulers.",
      navLabel: "The core components you must be able to name:",
      nav: "Scheduler: parses DAG files, evaluates schedules, and creates DAG runs / task instances. Executor: the strategy for running tasks (Sequential, Local, Celery, Kubernetes). Workers: where task code actually executes (with Celery/K8s). Metadata database (Postgres/MySQL): the source of truth for every run's state, XComs, connections, variables. Webserver: the UI reading from that DB. Triggerer: the async process powering deferrable operators. Get these five right and you can reason about almost any Airflow behavior.",
      noteLabel: "Where it fits in a DE stack:",
      note: "Airflow is the control plane that sits above your compute. It triggers Spark, EMR, and Databricks jobs, dbt runs, warehouse loads, and Kafka-adjacent batch jobs. It wires them into dependency chains and adds retries, SLAs, and alerting.<br><br>At American Express this meant orchestrating batch and near-real-time transaction and risk pipelines with hard SLAs and data contracts. The heavy lifting lived in Spark and the warehouse. Airflow owned the sequencing, the dependencies, and the failure handling."
    },
    {
      title: "Airflow vs. cron vs. Dagster / Prefect / Step Functions",
      badge: "when to use",
      concept: "Cron just fires a command at a time — no dependencies, no retries, no visibility into whether yesterday's run succeeded, no backfill, no lineage between jobs. The moment you have 'run B only after A succeeds, retry on failure, alert on-call, and let me rerun last Tuesday', cron collapses and you want an orchestrator. Among orchestrators: Airflow is the mature, ubiquitous, task-centric default with a huge provider ecosystem. Dagster is asset/data-aware (you declare data assets and their dependencies, not just tasks) with strong local testing and typing. Prefect is Python-native with very dynamic, less boilerplate-y flows. AWS Step Functions is a managed, serverless state machine — great if you're all-in on AWS Lambda/ECS and don't want to run a scheduler.",
      navLabel: "How to answer 'why Airflow' in an interview:",
      nav: "Frame it as trade-offs, not tribalism. Airflow wins on ecosystem (providers/hooks for nearly every system), maturity, hiring pool, and battle-tested scheduling. It loses on data-awareness (it orchestrates tasks, not assets — though Datasets/Assets narrow this), on developer ergonomics vs. Prefect/Dagster, and on operational overhead vs. a managed serverless option. I'd pick Dagster when the team wants asset-centric lineage and testability; Step Functions when the workload is already Lambda/ECS and I want zero infra; and Airflow when I need broad integrations, complex scheduling, and a large team already fluent in it.",
      note: "Interviewers love the migration story: you replace a pile of cron, bash, and 'did it run?' Slack messages with Airflow DAGs.<br><br>At Cedar Gate I migrated legacy batch scripts to Airflow and dbt and improved throughput about 35%. The win wasn't the speed of any one job. It was parallelism, dependency-aware scheduling, retries instead of silent failures, and visibility that ended the manual babysitting."
    },
    {
      title: "The mental model: DAG → DAG run → task instance",
      badge: "concept",
      concept: "A DAG is the definition (the template). A DAG run is one execution of that DAG for a specific data interval (e.g. the run covering 2026-08-09). A task instance is one task within one DAG run — it has its own state (queued, running, success, failed, up_for_retry, skipped, upstream_failed). This three-level model is why Airflow can run the same DAG for many dates simultaneously (backfill), retry a single task without rerunning the whole DAG, and show you a grid of task-instance states across historical runs. Every 'why did this happen' question resolves at the task-instance level.",
      navLabel: "Why this matters for reasoning about failures:",
      nav: "When someone says 'the DAG failed', the precise question is 'which task instance, in which DAG run, in which state, and why'. A task can be failed (its own error), upstream_failed (a dependency failed so it never ran), skipped (a branch/short-circuit), or up_for_retry. The scheduler drives task instances through these states based on dependencies + trigger rules. Thinking in task instances rather than 'the DAG' is the difference between debugging and guessing.",
      note: null
    },
    {
      title: "What a DAG file is NOT: the top-level-code trap",
      badge: "gotcha",
      concept: "A DAG file is parsed by the scheduler REPEATEDLY — every few seconds by default — to discover DAGs and their structure. Anything at the top level of the file (module scope) runs on EVERY parse: not once per run, but constantly. So a top-level API call, database query, pandas read, or heavy import doesn't 'happen when the DAG runs' — it happens every time the scheduler parses the file, slowing parsing for every DAG in the deployment and hammering external systems for no reason.",
      navLabel: "The rule:",
      nav: "Top-level code should only define structure (operators, dependencies, constants). Any real work — fetching data, querying, computing — belongs INSIDE a task (a function that runs only when that task executes). If you must pull config at parse time (e.g. to generate tasks dynamically), keep it cheap and cached, never a live per-parse network call. Slow DAG parsing is one of the most common real-world Airflow performance problems and it almost always traces back to expensive top-level code.",
      note: "Here's the interview tell. A candidate puts a Variable.get() or a requests.get() at module scope, then is surprised the DAG is slow or the external API is getting hammered.<br><br>Seniors know the file is re-parsed constantly, so they keep the module scope inert."
    }
  ]
},

dags: {
  intro: {
    title: "Stage 1 — Authoring DAGs: from a basic DAG to dynamic pipelines",
    desc: "The authoring surface: classic operators, the TaskFlow API, dependencies, dynamic task mapping, task groups, params, and the discipline that makes it all safe to rerun — idempotency and determinism. Every card has runnable code."
  },
  cards: [
    {
      title: "A basic DAG with the modern @dag / operator style",
      badge: "authoring",
      concept: "The minimum viable DAG: a schedule, a start_date, catchup control, and some tasks with dependencies. Modern Airflow (2.x) prefers a context-manager DAG with default_args for retry policy shared across tasks. start_date + schedule define WHICH data intervals exist; catchup=False means 'only run for the latest interval, don't backfill history on deploy' — almost always what you want for a new DAG.",
      navLabel: "What each piece controls:",
      nav: "schedule: how often a run is created (cron, preset, timedelta, or a Dataset). start_date: the earliest interval. catchup=False: don't auto-create runs for all intervals between start_date and now. default_args: defaults applied to every task (retries, retry_delay, owner, on_failure_callback). tags: for filtering in the UI. Setting retries at the DAG level via default_args is the norm — you rarely want a task with zero retries in production.",
      code: "from airflow import DAG\nfrom airflow.operators.bash import BashOperator\nfrom airflow.operators.empty import EmptyOperator\nimport pendulum, datetime\n\ndefault_args = {\n    \"owner\": \"de-team\",\n    \"retries\": 3,\n    \"retry_delay\": datetime.timedelta(minutes=5),\n}\n\nwith DAG(\n    dag_id=\"daily_orders_etl\",\n    schedule=\"0 2 * * *\",            # 02:00 every day\n    start_date=pendulum.datetime(2026, 1, 1, tz=\"UTC\"),\n    catchup=False,\n    default_args=default_args,\n    tags=[\"orders\", \"etl\"],\n) as dag:\n    start = EmptyOperator(task_id=\"start\")\n    extract = BashOperator(task_id=\"extract\", bash_command=\"echo extract\")\n    load = BashOperator(task_id=\"load\", bash_command=\"echo load\")\n    start >> extract >> load",
      note: "Always set start_date as a static, timezone-aware datetime. Never use datetime.now().<br><br>A dynamic start_date makes the set of intervals shift on every parse, which breaks scheduling in bizarre ways. This is a classic gotcha interviewers plant.",
      followups: [
        "\"Why should start_date be a fixed timestamp and never datetime.now()?\"",
        "\"What actually happens the first time this DAG is deployed with catchup=True vs catchup=False?\""
      ]
    },
    {
      title: "The TaskFlow API: @task for clean Python pipelines",
      badge: "authoring",
      concept: "The TaskFlow API (@task decorator) turns plain Python functions into tasks and passes return values between them as XComs automatically — no explicit ti.xcom_push/pull, no manual dependency wiring. You call one @task function with the output of another and Airflow infers both the data flow (XCom) and the dependency edge. It reads like normal Python and is the recommended style for Python-centric pipelines.",
      navLabel: "What it buys you and its limit:",
      nav: "It removes boilerplate and makes small Python ETL readable and testable. But the values passed between tasks still travel through XCom, which is stored in the metadata DB — so you pass IDENTIFIERS and small results (a file path, a row count, a partition key), never a DataFrame or a large payload. TaskFlow makes it deceptively easy to return something huge; the XCom size discipline still applies (see the Internals tab).",
      code: "from airflow.decorators import dag, task\nimport pendulum\n\n@dag(schedule=\"@daily\",\n     start_date=pendulum.datetime(2026, 1, 1, tz=\"UTC\"),\n     catchup=False)\ndef orders_taskflow():\n\n    @task\n    def extract() -> str:\n        # returns a small identifier, NOT the data itself\n        return \"s3://raw/orders/2026-08-09.parquet\"\n\n    @task\n    def transform(path: str) -> int:\n        # do real work here (or trigger Spark); return a small result\n        print(f\"processing {path}\")\n        return 12345  # e.g. row count\n\n    @task\n    def load(row_count: int):\n        print(f\"loaded {row_count} rows\")\n\n    load(transform(extract()))\n\norders_taskflow()",
      note: "TaskFlow and classic operators mix freely in one DAG. You can pass a @task output to a classic operator, and the other way around too.<br><br>Use TaskFlow for Python glue. Use provider operators like SparkSubmit, dbt, and BigQuery for the heavy integrations.",
      followups: [
        "\"Where does the value returned by extract() physically live between tasks?\"",
        "\"You return a 500MB DataFrame from a @task — what breaks and why?\""
      ]
    },
    {
      title: "Declaring dependencies: >> , << , and chain()",
      badge: "authoring",
      concept: "Dependencies define the edges of the DAG. a >> b means 'a runs before b' (a is upstream). a << b is the reverse. A list fans out/in: a >> [b, c] >> d means b and c both wait for a and both must finish before d. For long linear or cross-product wiring, airflow.models.baseoperator.chain() and cross_downstream() keep it readable. The graph must stay acyclic — Airflow rejects a cycle at parse time.",
      navLabel: "Common shapes:",
      nav: "Fan-out (one source, many parallel transforms): extract >> [t1, t2, t3]. Fan-in (many sources, one aggregate): [t1, t2, t3] >> combine. Diamond: start >> [a, b] >> end. Use chain() for sequential lists and cross_downstream() when every task in one group must precede every task in another. Keep the graph readable — a DAG whose dependency section is unreadable is a DAG nobody can safely change.",
      code: "from airflow.models.baseoperator import chain, cross_downstream\n\n# linear chain\nchain(start, extract, transform, load, end)\n\n# fan-out then fan-in (diamond)\nstart >> [clean_a, clean_b] >> merge >> publish\n\n# every extract must precede every load\ncross_downstream([extract_us, extract_eu], [load_a, load_b])",
      note: null,
      followups: [
        "\"What happens at parse time if your dependencies form a cycle?\""
      ]
    },
    {
      title: "Dynamic task mapping: .expand() for runtime fan-out",
      badge: "authoring",
      concept: "Sometimes you don't know how many tasks you need until runtime — e.g. one task per file that landed today, or one per partition returned by an upstream query. Dynamic task mapping (.expand(), Airflow 2.3+) creates a variable number of parallel mapped task instances from a list produced at runtime. The upstream task returns a list; the mapped task runs once per element, and you see them as indexed instances (0, 1, 2, …) in the UI. This replaced the old anti-pattern of generating tasks from top-level code that hit an API on every parse.",
      navLabel: "Why this is the right tool:",
      nav: "The number of tasks is decided by DATA at runtime, not by parse-time code — so no top-level network calls, and the mapping is visible and retryable per element. .expand() maps over one argument; .expand_kwargs() maps over dicts for multiple arguments. You can cap concurrency of the mapped set. Use it for 'process each file / each partition / each region we discovered', where the count varies day to day.",
      code: "from airflow.decorators import dag, task\nimport pendulum\n\n@dag(schedule=\"@daily\",\n     start_date=pendulum.datetime(2026, 1, 1, tz=\"UTC\"),\n     catchup=False)\ndef process_files():\n\n    @task\n    def list_files() -> list[str]:\n        # discovered at RUNTIME, not parse time\n        return [\"a.csv\", \"b.csv\", \"c.csv\"]\n\n    @task\n    def process(file: str) -> int:\n        print(f\"processing {file}\")\n        return len(file)\n\n    # one mapped task instance per file returned\n    counts = process.expand(file=list_files())\n\n    @task\n    def total(sizes: list[int]):\n        print(f\"total={sum(sizes)}\")\n\n    total(counts)\n\nprocess_files()",
      note: "Contrast this with the old anti-pattern: a for-loop at module scope that calls an API to decide how many operators to create. That runs on every parse and makes the DAG structure unstable.<br><br>Dynamic mapping keeps the parse cheap and the fan-out data-driven.",
      followups: [
        "\"How is .expand() different from a Python for-loop that creates operators at the top level of the file?\"",
        "\"One of 200 mapped instances fails — what can you rerun, and does the whole mapped group rerun?\""
      ]
    },
    {
      title: "Task groups: organizing complex DAGs",
      badge: "authoring",
      concept: "A TaskGroup visually and logically bundles related tasks into a collapsible node in the UI, without creating a separate DAG. It's purely organizational — dependencies still work across groups — but it makes a 60-task DAG comprehensible and lets you apply dependencies to the group as a unit. It replaced the older SubDAG operator, which had real deadlock/executor-slot problems and is deprecated.",
      navLabel: "TaskGroup vs SubDAG:",
      nav: "Use TaskGroup, never SubDagOperator. SubDAGs ran as a separate DAG with their own scheduling and could deadlock the executor by holding a worker slot while their children waited for slots. TaskGroups are just a UI/organizational grouping with zero execution overhead — same scheduler, same slots. If an interviewer mentions SubDAGs, the senior answer is 'deprecated; use TaskGroups (or, for reuse across DAGs, trigger a separate DAG).'",
      code: "from airflow.decorators import dag, task_group, task\nimport pendulum\n\n@dag(schedule=\"@daily\", start_date=pendulum.datetime(2026,1,1,tz=\"UTC\"), catchup=False)\ndef grouped():\n\n    @task_group(group_id=\"ingest\")\n    def ingest():\n        @task\n        def pull_us(): ...\n        @task\n        def pull_eu(): ...\n        pull_us(); pull_eu()\n\n    @task\n    def publish(): ...\n\n    ingest() >> publish()\n\ngrouped()",
      note: null,
      followups: [
        "\"Why are SubDAGs deprecated — what could deadlock?\"",
        "\"How would you reuse a whole sub-pipeline across several DAGs instead of copy-pasting a TaskGroup?\""
      ]
    },
    {
      title: "Params: making a DAG configurable at trigger time",
      badge: "authoring",
      concept: "params let you define typed, validated inputs for a DAG that can be overridden when you trigger a run (via UI, CLI, or REST API). Instead of hard-coding a date range or a region, you declare params with defaults and a schema; a manual trigger can supply different values. This is how you make one DAG serve 'run for this specific date / this tenant / full-refresh vs incremental' without cloning it.",
      navLabel: "Params vs Variables vs XCom — don't confuse them:",
      nav: "params: per-DAG-run inputs, set at trigger time, validated by a JSON schema. Variables: global key/value config for the whole deployment (feature flags, bucket names), read at runtime. XCom: small values passed BETWEEN tasks within a run. A frequent mistake is using Variables (a global, per-parse-if-top-level fetch) where params (per-run input) belong. Reach for params when the value differs per run.",
      code: "from airflow import DAG\nfrom airflow.models.param import Param\nfrom airflow.decorators import task\nimport pendulum\n\nwith DAG(\n    dag_id=\"reprocess\",\n    schedule=None,                    # manual / triggered only\n    start_date=pendulum.datetime(2026,1,1,tz=\"UTC\"),\n    params={\n        \"target_date\": Param(\"2026-08-09\", type=\"string\", format=\"date\"),\n        \"full_refresh\": Param(False, type=\"boolean\"),\n    },\n) as dag:\n\n    @task\n    def run(**context):\n        p = context[\"params\"]\n        print(p[\"target_date\"], p[\"full_refresh\"])\n\n    run()",
      note: null,
      followups: [
        "\"When would you use params instead of an Airflow Variable?\""
      ]
    },
    {
      title: "Idempotency: the single most important DAG-authoring discipline",
      badge: "critical",
      concept: "A task is idempotent if running it twice for the same data interval produces the same end state as running it once — no duplicates, no double-counting, no corruption. This is NOT optional: Airflow WILL rerun tasks (retries, backfills, manual clears, catchup). The classic non-idempotent sin is INSERT INTO target SELECT … — rerun it and you double the rows. The fix is to make the write deterministic and overwrite-safe: DELETE-then-INSERT for the partition, MERGE/UPSERT keyed by a business key, or write to a partition path you can atomically replace.",
      navLabel: "The pattern:",
      nav: "Scope every write to the run's data interval and make it replace-not-append. For a warehouse: DELETE WHERE dt = '{{ ds }}' then INSERT for that dt, or MERGE on the key. For a lake: write to s3://…/dt=2026-08-09/ and overwrite that partition. Never append blindly. Combine at-least-once execution (Airflow retries) with idempotent writes so a rerun is always harmless — the same discipline as idempotent Kafka consumers.",
      code: "from airflow.decorators import task\n\n@task\ndef load_partition(**context):\n    ds = context[\"ds\"]              # the logical date, e.g. 2026-08-09\n    sql = f\"\"\"\n    DELETE FROM analytics.orders WHERE order_date = '{ds}';\n    INSERT INTO analytics.orders\n      SELECT * FROM staging.orders WHERE order_date = '{ds}';\n    \"\"\"\n    # execute via a hook; rerunning for the same ds is now safe\n    print(sql)",
      note: "This is the number one thing interviewers probe on backfills: 'you backfill 90 days, does anything double up?'<br><br>If your writes are DELETE+INSERT or MERGE scoped to {{ ds }}, the answer is confidently no. If they're plain INSERTs, you have a data-corruption incident.",
      followups: [
        "\"Rewrite a naive INSERT INTO target SELECT ... so a rerun for the same day is safe.\"",
        "\"Why can't Airflow just guarantee a task runs exactly once instead of making me write idempotent tasks?\""
      ]
    },
    {
      title: "Determinism: templating with the data interval, not wall-clock time",
      badge: "critical",
      concept: "A task must depend only on its inputs (the data interval), never on when it happens to run. If a task computes 'today' with datetime.now() or pulls 'the latest file', then a rerun or a backfill produces different results than the original run — non-deterministic and impossible to reason about. The fix is to template everything off Airflow's provided execution context: {{ ds }}, {{ data_interval_start }}, {{ data_interval_end }} — these are fixed for a given DAG run regardless of when it actually executes.",
      navLabel: "Why this pairs with idempotency:",
      nav: "Idempotency makes reruns safe; determinism makes them CORRECT. A backfill run for 2026-06-01 must process June 1st's data — which only works if the task reads {{ ds }} rather than 'now'. Together they give you the property that matters: rerunning any historical DAG run reproduces exactly the same output. Any use of datetime.now(), 'latest partition', or a mutable external state inside a task breaks this.",
      code: "from airflow.operators.bash import BashOperator\n\n# CORRECT: driven by the run's data interval, reproducible on backfill\nextract = BashOperator(\n    task_id=\"extract\",\n    bash_command=(\n        \"python extract.py \"\n        \"--start '{{ data_interval_start }}' \"\n        \"--end '{{ data_interval_end }}' \"\n        \"--out s3://raw/orders/dt={{ ds }}/\"\n    ),\n)\n# WRONG: 'now' means a backfill of June processes today's data",
      note: "Jinja templating is evaluated at task RUN time using the run's context. So {{ ds }} is the logical date of THAT run, which is exactly what makes a backfilled run process the right historical window.",
      followups: [
        "\"Your extract uses datetime.now() to pick the day. What goes wrong when someone backfills last month?\""
      ]
    },
    {
      title: "Branching: choosing a path at runtime",
      badge: "authoring",
      concept: "Sometimes the DAG must take one of several paths based on a runtime condition — e.g. 'if data arrived, process it; else skip and alert'. @task.branch (BranchPythonOperator) returns the task_id(s) to follow; the un-chosen branches are marked skipped. This is how you build conditional pipelines without cramming logic into one giant task. ShortCircuitOperator is the simpler cousin: if it returns False, all downstream tasks are skipped.",
      navLabel: "The trigger-rule gotcha that follows branching:",
      nav: "Skipped branches propagate 'skipped' downstream by default, which can accidentally skip a join task you wanted to run. If a task must run when SOME upstreams were skipped (e.g. a common 'finalize' step after a branch), set its trigger_rule to none_failed_min_one_success (or all_done). This branch-then-join pattern with the wrong trigger rule is a classic 'why did my final task get skipped' bug.",
      code: "from airflow.decorators import task, dag\nimport pendulum\n\n@dag(schedule=\"@daily\", start_date=pendulum.datetime(2026,1,1,tz=\"UTC\"), catchup=False)\ndef branchy():\n    @task.branch\n    def choose(**ctx) -> str:\n        return \"process\" if ctx[\"ds\"] != \"2026-12-25\" else \"skip_holiday\"\n\n    @task\n    def process(): ...\n    @task\n    def skip_holiday(): ...\n    @task(trigger_rule=\"none_failed_min_one_success\")\n    def finalize(): ...   # must run whether we processed or skipped\n\n    c = choose()\n    p, s = process(), skip_holiday()\n    c >> [p, s] >> finalize()\n\nbranchy()",
      note: null,
      followups: [
        "\"After a branch, your 'finalize' task keeps getting skipped. What's the fix?\"",
        "\"When would you use ShortCircuitOperator instead of a branch?\""
      ]
    },
    {
      title: "Cross-DAG dependencies: TriggerDagRun, ExternalTaskSensor, and Datasets",
      badge: "authoring",
      concept: "Real platforms have DAGs that depend on other DAGs. Three tools: TriggerDagRunOperator (DAG A explicitly kicks off DAG B), ExternalTaskSensor (DAG B waits for a specific task/run of DAG A to succeed), and Datasets/Assets (data-aware scheduling: DAG A 'produces' a Dataset, DAG B is scheduled to run whenever that Dataset is updated — no time schedule, no polling sensor). Datasets are the modern, decoupled way to express 'run when this data is ready'.",
      navLabel: "Which to pick:",
      nav: "Datasets when the relationship is 'B needs A's OUTPUT' — it's declarative, event-driven, and avoids brittle time-coupling or a sensor burning a worker slot. TriggerDagRunOperator when A must imperatively launch B (and optionally wait). ExternalTaskSensor when you can't change the producing DAG but must wait on it — but beware its execution_date alignment gotcha (the sensor looks for a run at a matching logical date; misaligned schedules make it wait forever). Prefer Datasets for new work.",
      code: "from airflow import Dataset\nfrom airflow.decorators import dag, task\nimport pendulum\n\nORDERS = Dataset(\"s3://curated/orders/\")\n\n# Producer DAG: declares it updates the dataset\n@dag(schedule=\"@daily\", start_date=pendulum.datetime(2026,1,1,tz=\"UTC\"), catchup=False)\ndef producer():\n    @task(outlets=[ORDERS])\n    def build(): ...\n    build()\nproducer()\n\n# Consumer DAG: runs whenever ORDERS is updated, no cron\n@dag(schedule=[ORDERS], start_date=pendulum.datetime(2026,1,1,tz=\"UTC\"), catchup=False)\ndef consumer():\n    @task\n    def use(): ...\n    use()\nconsumer()",
      note: "ExternalTaskSensor's most common failure is schedules that don't line up on the same logical date. The sensor then waits for a run that will never exist. Datasets sidestep the entire timing-alignment problem.",
      followups: [
        "\"ExternalTaskSensor is stuck forever but the upstream DAG clearly succeeded. What's likely wrong?\"",
        "\"Why are Datasets usually better than a sensor for 'run B when A's data is ready'?\""
      ]
    },
    {
      title: "Migrating cron/batch scripts to Airflow (a real resume story)",
      badge: "war story",
      concept: "The common brownfield task: a directory of cron entries firing bash/Python scripts, with dependencies encoded as 'schedule script B 30 minutes after script A and hope A finished'. Migrating to Airflow means (1) making implicit dependencies explicit as DAG edges, (2) making each script idempotent and interval-driven so retries/backfills are safe, (3) replacing 'hope it finished' timing with real dependencies or sensors/Datasets, and (4) adding retries, SLAs, and alerting that cron never had.",
      navLabel: "How I'd sequence the migration:",
      nav: "Start by wrapping existing scripts as BashOperator/PythonOperator tasks 1:1 so the DAG mirrors current behavior (low risk), THEN refactor: parameterize dates off {{ ds }} instead of 'now', convert appends to idempotent MERGE/overwrite, collapse timing-based ordering into real edges, and add retries + on-call alerting. At Cedar Gate this lift-then-refactor of legacy batch scripts into Airflow + dbt improved throughput ~35% — mostly from dependency-aware parallelism and eliminating manual reruns after silent cron failures. The mistake to avoid is 'big-bang rewrite'; wrap first, refactor incrementally, keep the old cron paused as a fallback.",
      code: "from airflow import DAG\nfrom airflow.operators.bash import BashOperator\nimport pendulum, datetime\n\n# Phase 1: wrap existing scripts 1:1, add retries cron never had\nwith DAG(\"legacy_batch\", schedule=\"0 1 * * *\",\n         start_date=pendulum.datetime(2026,1,1,tz=\"UTC\"), catchup=False,\n         default_args={\"retries\": 2, \"retry_delay\": datetime.timedelta(minutes=5)}) as dag:\n\n    a = BashOperator(task_id=\"extract\",\n        bash_command=\"/opt/legacy/extract.sh {{ ds }}\")   # now interval-driven\n    b = BashOperator(task_id=\"transform\",\n        bash_command=\"/opt/legacy/transform.sh {{ ds }}\")\n    a >> b   # explicit dependency, not 'schedule 30 min later'",
      note: "Interviewers probe this bullet hard, so expect 'what broke when you migrated?'<br><br>The honest answers are scripts that assumed 'now', appends that double-counted on the first backfill, and timing dependencies that were actually races. Those are exactly the idempotency and determinism lessons from the previous cards.",
      followups: [
        "\"What's the first thing you'd fix about a bash script before it's safe to backfill in Airflow?\"",
        "\"Why wrap-then-refactor instead of rewriting the scripts as clean tasks up front?\""
      ]
    },
    {
      title: "Custom operators and hooks: when and how",
      badge: "authoring",
      concept: "A Hook is a reusable client for an external system (a DB, S3, an API) that manages the connection using Airflow Connections. An Operator wraps a unit of work (usually built on a hook) as a task. You write a custom operator when you repeat the same task logic across many DAGs and want one tested, parameterized abstraction — not for a one-off. Before writing one, check the provider ecosystem: most systems (Spark, dbt, BigQuery, Snowflake, S3, HTTP) already have battle-tested operators.",
      navLabel: "The reuse discipline:",
      nav: "Don't reimplement what a provider already gives you. Do extract a custom operator when you find yourself pasting the same 30 lines of hook + retry + XCom logic into ten DAGs — centralizing it means one place to fix bugs and add logging. Override execute() for the work; put connection handling in a hook so credentials come from Connections, never hard-coded. Keep operators thin: orchestration and triggering, not heavy compute.",
      code: "from airflow.models.baseoperator import BaseOperator\nfrom airflow.hooks.base import BaseHook\n\nclass NotifyOperator(BaseOperator):\n    def __init__(self, conn_id: str, message: str, **kwargs):\n        super().__init__(**kwargs)\n        self.conn_id = conn_id\n        self.message = message\n\n    def execute(self, context):\n        conn = BaseHook.get_connection(self.conn_id)  # creds from Connections\n        # ... call the API using conn.host / conn.password ...\n        self.log.info(\"sent: %s\", self.message)\n        return \"ok\"   # small XCom",
      note: null,
      followups: [
        "\"When is writing a custom operator over-engineering, and what would you do instead?\""
      ]
    }
  ]
},

scheduling: {
  intro: {
    title: "Stage 2 — Scheduling: intervals, the execution_date trap, catchup, sensors, SLAs",
    desc: "Scheduling is where most Airflow confusion lives. The 'runs at the END of the interval' behavior, catchup and backfills, and the difference between a poking sensor and a deferrable operator are the highest-signal senior topics here."
  },
  cards: [
    {
      title: "schedule: cron, presets, timedelta, and timetables",
      badge: "scheduling",
      concept: "The schedule argument accepts several forms: a cron string (\"0 2 * * *\"), a preset (@daily, @hourly, @weekly), a datetime.timedelta (every N hours relative to the previous run), None (manual/triggered only), or a Dataset list (data-aware). For anything cron can't express — 'last business day of the month', 'every weekday at 9 but skip holidays' — you write a custom Timetable (Airflow 2.2+), which is the modern replacement for the old schedule_interval hacks.",
      navLabel: "cron vs timedelta — a subtle difference:",
      nav: "A cron schedule pins runs to wall-clock times (02:00 daily). A timedelta schedules relative to the previous run's start, so if runs drift or you pause/unpause, the cadence follows the last run rather than fixed clock times. For calendar-aligned data (daily partitions), use cron/presets. For 'every 6 hours from whenever it last ran', use timedelta. Timetables handle the genuinely irregular cases without abusing cron.",
      code: "# equivalent daily schedules\nschedule=\"0 0 * * *\"\nschedule=\"@daily\"\n\n# every 6 hours relative to last run\nfrom datetime import timedelta\nschedule=timedelta(hours=6)\n\n# manual only\nschedule=None",
      note: null,
      followups: [
        "\"You need 'last business day of each month'. Cron can't do it — what do you build?\""
      ]
    },
    {
      title: "The big one: execution_date / logical_date and 'runs at the END of the interval'",
      badge: "critical gotcha",
      concept: "This is THE Airflow gotcha. A scheduled DAG run does NOT run at its logical_date — it runs at the END of the data interval that starts at that logical date. So a @daily DAG with logical_date 2026-08-09 actually EXECUTES just after 2026-08-10 00:00. Why: Airflow assumes you process a period AFTER it completes — you can't summarize August 9th until August 9th is over. The (now-renamed) execution_date is really the START of the interval you're processing, not the moment of execution.",
      navLabel: "How to keep it straight:",
      nav: "Think 'a run covers [data_interval_start, data_interval_end) and fires at data_interval_end.' For a daily run, data_interval_start = the day being processed, data_interval_end = start of the next day = roughly when it runs. That's why {{ ds }} (the logical date) is the day of DATA, not the day of execution. Modern Airflow renamed execution_date to logical_date and added the explicit data_interval_start / data_interval_end precisely because 'execution_date' misled everyone into thinking it was 'when it runs'.",
      code: "# @daily DAG, run with logical_date = 2026-08-09\n# {{ ds }}                  -> 2026-08-09   (the day of DATA)\n# {{ data_interval_start }} -> 2026-08-09 00:00\n# {{ data_interval_end }}   -> 2026-08-10 00:00\n# ACTUAL wall-clock execution: just after 2026-08-10 00:00\n\n# So to process 'yesterday relative to when it runs', you use {{ ds }}\n# WITHOUT any date math -- ds already IS the interval you should process.",
      note: "Here's the interview signal. A candidate who says 'execution_date is when the DAG runs' has not operated Airflow.<br><br>The correct statement is: logical_date is the start of the data interval, and the run fires at the end of that interval. This single misunderstanding causes the most off-by-one-day data bugs in Airflow.",
      followups: [
        "\"A @daily DAG has logical_date 2026-08-09. At what wall-clock time does it actually run, and why?\"",
        "\"A junior hard-codes date = ds + 1 day 'to fix the off-by-one'. Why is that wrong?\""
      ]
    },
    {
      title: "catchup and backfill: filling history",
      badge: "scheduling",
      concept: "catchup (a DAG argument) controls what happens for intervals between start_date and now that have no runs yet. catchup=True: on deploy/unpause, the scheduler creates a run for EVERY missing interval — potentially hundreds at once. catchup=False: only the most recent interval runs; history is skipped. backfill is the explicit, on-demand version: `airflow dags backfill` (or clearing runs) reruns a specified date range regardless of catchup. Both rely completely on your tasks being idempotent and deterministic.",
      navLabel: "The operational danger:",
      nav: "Deploying a DAG with catchup=True and a start_date months in the past will stampede the scheduler and executor with hundreds of simultaneous runs, hammering source systems and possibly corrupting data if tasks aren't idempotent. Default to catchup=False for new DAGs; when you genuinely need history, backfill deliberately with a bounded date range and often a lower max_active_runs so you don't overwhelm downstream systems. Never let an accidental catchup=True be your backfill mechanism.",
      code: "# Controlled backfill of a bounded range (idempotent tasks required):\n# airflow dags backfill daily_orders_etl \\\n#   --start-date 2026-06-01 --end-date 2026-06-30\n\n# In the DAG, keep the default safe:\n#   catchup=False\n# and throttle history replays with:\n#   max_active_runs=3",
      note: "'How do you backfill safely?' expects several things: idempotent and deterministic tasks, a bounded date range, throttled concurrency via max_active_runs, verification that source data for those dates still exists, and awareness of downstream load.<br><br>'I set catchup=True' is the wrong answer.",
      followups: [
        "\"You deploy a DAG with start_date=Jan 1 and catchup=True. It's now August. What happens the instant you unpause it?\"",
        "\"How do you throttle a 90-day backfill so it doesn't overwhelm the warehouse?\""
      ]
    },
    {
      title: "Sensors: waiting for external conditions (and how they bite)",
      badge: "scheduling",
      concept: "A Sensor is a task that waits for a condition — a file to land (S3KeySensor), a partition to appear, an external task to succeed, an API to return ready. In classic 'poke' mode, the sensor occupies a worker slot the entire time it waits, checking every poke_interval. The danger: many long-running sensors can consume ALL your worker/executor slots, so real work can't run — the pipeline deadlocks itself waiting. This is 'sensor starvation' and it's a top production incident.",
      navLabel: "reschedule mode vs poke mode:",
      nav: "poke mode holds the slot and sleeps between checks — fine for short waits, catastrophic for long ones at scale. reschedule mode releases the worker slot between checks (the task goes back to 'scheduled' and is re-queued at the next check) — so a sensor waiting hours doesn't tie up a slot. Rule: any sensor that might wait more than a few minutes should use mode='reschedule', or better, a deferrable operator (next card). Also always set a timeout so a sensor can't wait forever.",
      code: "from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor\n\nwait = S3KeySensor(\n    task_id=\"wait_for_file\",\n    bucket_key=\"orders/dt={{ ds }}/_SUCCESS\",\n    bucket_name=\"raw\",\n    mode=\"reschedule\",     # release the worker slot between checks\n    poke_interval=300,     # check every 5 min\n    timeout=6 * 3600,      # give up after 6h instead of waiting forever\n)",
      note: "Sensor starvation is a favorite scenario: 'your DAGs all hang and nothing runs, but there are no errors.'<br><br>The diagnosis is dozens of poke-mode sensors holding every worker slot. The fix is reschedule mode, deferrable operators, and timeouts.",
      followups: [
        "\"All your tasks are stuck 'queued' and nothing runs, but there are no errors. Sensors are involved. What's happening?\"",
        "\"Why does poke mode cause this and reschedule mode not?\""
      ]
    },
    {
      title: "Deferrable operators and the triggerer: async waiting done right",
      badge: "modern",
      concept: "Deferrable operators (Airflow 2.2+) are the modern answer to 'wait efficiently'. A deferrable operator does its quick setup, then DEFERS: it hands off an async 'trigger' (a coroutine) to a separate process called the triggerer and completely frees its worker slot. The triggerer runs thousands of these lightweight async checks in one process (asyncio); when the condition is met, it wakes the task back up to finish. So 10,000 tasks can wait on external conditions using almost no worker resources — impossible with poke sensors.",
      navLabel: "Sensor (reschedule) vs deferrable:",
      nav: "reschedule sensors free the slot but still re-queue a full task instance on every check (scheduler + DB overhead per poke). Deferrable operators offload the WAIT itself to the async triggerer with near-zero per-wait cost, so they scale far better for many concurrent long waits. Many sensors have deferrable variants (deferrable=True) or async operators (e.g. S3KeySensorAsync). At scale, prefer deferrable > reschedule > poke. The triggerer is the fifth component people forget to mention alongside scheduler/executor/workers/webserver.",
      code: "# Deferrable variant frees the worker slot AND offloads the wait to the triggerer\nfrom airflow.providers.amazon.aws.sensors.s3 import S3KeySensor\n\nwait = S3KeySensor(\n    task_id=\"wait_for_file\",\n    bucket_key=\"orders/dt={{ ds }}/_SUCCESS\",\n    bucket_name=\"raw\",\n    deferrable=True,       # hand the wait to the triggerer (async)\n    poke_interval=300,\n    timeout=6 * 3600,\n)",
      note: "This requires the triggerer process to be running. If you enable deferrable operators but never start a triggerer, tasks defer and hang forever. It's a subtle deployment gotcha.",
      followups: [
        "\"How does a deferrable operator differ from a reschedule-mode sensor at 10,000 concurrent waits?\"",
        "\"What extra process must be running for deferrable operators to work?\""
      ]
    },
    {
      title: "SLAs and SLA misses: alerting on lateness",
      badge: "scheduling",
      concept: "An SLA (sla=timedelta) declares 'this task should complete within X of the DAG run's start'. If it doesn't, Airflow records an SLA miss and can fire an sla_miss_callback / email — WITHOUT failing the task. It's for lateness alerting, not correctness. Critically, an SLA miss is measured relative to the DAG run's expected start; it's about 'is this late', not 'did it fail'. SLAs have real quirks (they don't apply to manually triggered runs, and the classic SLA feature has known reliability edges), so many teams implement freshness checks or external monitoring instead.",
      navLabel: "How to talk about SLAs at senior level:",
      nav: "Distinguish an SLA miss (late but maybe still succeeds) from a failure (errored). Use sla=... + sla_miss_callback for 'page me if the risk feed isn't done by 6am'. But know the limitations: SLAs are per-task, tied to scheduled runs, and historically flaky — for hard business SLAs (like Amex risk pipelines) I'd back them with independent data-freshness monitoring (is the target partition present and fresh?) rather than trusting Airflow's SLA feature alone. Newer Airflow is moving toward 'deadline alerts' to address the old SLA shortcomings.",
      code: "import datetime\nfrom airflow.operators.bash import BashOperator\n\ndef sla_miss_callback(dag, task_list, blocking_task_list, slas, blocking_tis):\n    # page on-call, post to Slack, etc.\n    print(\"SLA MISSED:\", slas)\n\nrisk_feed = BashOperator(\n    task_id=\"risk_feed\",\n    bash_command=\"run_risk.sh {{ ds }}\",\n    sla=datetime.timedelta(hours=2),   # should finish within 2h of run start\n)",
      note: "Here's an SLA gotcha worth naming. SLAs are not evaluated for manually triggered or backfill runs, only scheduled ones. So 'I triggered it and no SLA alert fired' is expected behavior, not a bug.",
      followups: [
        "\"What's the difference between an SLA miss and a task failure in Airflow?\"",
        "\"For a hard 6am business SLA, why might you NOT rely solely on Airflow's SLA feature?\""
      ]
    },
    {
      title: "depends_on_past, wait_for_downstream, and ordered runs",
      badge: "scheduling",
      concept: "By default DAG runs for different intervals are independent and can run in parallel. Sometimes you need ordering: depends_on_past=True makes a task instance wait for the SAME task in the PREVIOUS run to have succeeded — useful for cumulative/stateful computations where day N needs day N-1 done first. wait_for_downstream goes further (also waits for downstream of the previous run). max_active_runs=1 forces the whole DAG to run one interval at a time.",
      navLabel: "The backfill trap with depends_on_past:",
      nav: "depends_on_past serializes history: a backfill must proceed oldest-to-newest, and if one day fails, all later days block waiting on it. That's correct for genuinely sequential state but murder for parallel backfills. Use it ONLY when day N truly depends on N-1's output; otherwise keep runs independent so backfills parallelize. Also, the very first run has no 'past', so depends_on_past has a special first-run behavior to understand. Reach for it deliberately, not as a default.",
      code: "from airflow import DAG\nimport pendulum\n\nwith DAG(\n    dag_id=\"running_balance\",\n    schedule=\"@daily\",\n    start_date=pendulum.datetime(2026,1,1,tz=\"UTC\"),\n    catchup=False,\n    default_args={\"depends_on_past\": True},  # day N waits for day N-1\n    max_active_runs=1,                        # one interval at a time\n) as dag:\n    ...",
      note: null,
      followups: [
        "\"When is depends_on_past exactly right, and when does it turn a backfill into a nightmare?\""
      ]
    }
  ]
},

internals: {
  intro: {
    title: "Stage 3 — Internals: scheduler, executors, metadata DB, XCom, concurrency, retries",
    desc: "The 'do you actually understand Airflow' tab. Executors, where state lives, why XCom is not for data, and the concurrency knobs (pools, parallelism, max_active_runs) that decide whether your platform runs smoothly or thrashes."
  },
  cards: [
    {
      title: "The scheduler: what it actually does",
      badge: "internals",
      concept: "The scheduler is the heart of Airflow. On a loop it: (1) parses DAG files to discover DAGs and structure, (2) evaluates each DAG's schedule to decide which DAG runs should exist, (3) creates DAG runs and task instances, (4) checks dependencies + trigger rules to find task instances that are ready, and (5) hands ready tasks to the executor to run. It also handles retries and timeouts. DAG parsing is decoupled (the DagFileProcessor) so slow files don't stall scheduling as badly as they used to, and since 2.0 you can run MULTIPLE active schedulers (HA) sharing the metadata DB via row-level locking.",
      navLabel: "Why parsing performance matters:",
      nav: "The scheduler re-parses DAG files continually (dag_dir_list_interval / min_file_process_interval). Expensive top-level code, huge numbers of DAGs, or slow imports make parsing lag, which delays run creation and makes DAGs 'start late'. This is why 'my DAG is scheduled for 2am but starts at 2:15' often traces to scheduler/parse pressure, not the schedule. Multiple schedulers add throughput but every one still parses; keeping files cheap to parse is the real fix.",
      note: null,
      followups: [
        "\"Your DAG is scheduled for 02:00 but consistently starts around 02:20. Where do you look first?\""
      ]
    },
    {
      title: "Executors: Sequential, Local, Celery, Kubernetes",
      badge: "internals",
      concept: "The executor decides WHERE and HOW tasks run. SequentialExecutor: one task at a time, SQLite-backed — dev/demo only. LocalExecutor: runs tasks as subprocesses on the scheduler machine, real parallelism on one box — good for small/medium. CeleryExecutor: distributes tasks to a fleet of persistent worker nodes via a broker (Redis/RabbitMQ) — the classic horizontal-scaling choice, workers are always-on. KubernetesExecutor: launches ONE pod per task, so each task gets isolated resources and the cluster scales to zero when idle — great for spiky, heterogeneous workloads. CeleryKubernetes is a hybrid.",
      navLabel: "How to choose (a real interview question):",
      nav: "LocalExecutor when one machine's parallelism is enough and you want simplicity. CeleryExecutor when you have steady, high task volume and want a warm worker pool (low per-task startup latency) — but you pay for idle workers and must run a broker. KubernetesExecutor when workloads are spiky or need per-task resource isolation / different images — you trade per-task pod-startup latency for elasticity and no idle cost. Amex-style steady batch + NRT → Celery or CeleryKubernetes; bursty ad-hoc → Kubernetes.",
      code: "# airflow.cfg\n# [core]\n# executor = CeleryExecutor        # or LocalExecutor / KubernetesExecutor\n#\n# Celery adds: a broker (Redis/RabbitMQ) + a result backend + worker nodes\n# Kubernetes adds: one pod per task, scales to zero, per-task resources",
      note: "Name the trade-off crisply. Celery gives you warm workers and low latency, but you pay for idle. Kubernetes gives you per-task pods that scale to zero, but you pay a higher per-task startup latency.<br><br>There's no universally right choice. Match it to the workload shape.",
      followups: [
        "\"CeleryExecutor vs KubernetesExecutor — give me the latency/cost trade-off in one sentence each.\"",
        "\"Which executor scales to zero when nothing is running, and what's the cost of that?\""
      ]
    },
    {
      title: "The metadata database: the source of truth",
      badge: "internals",
      concept: "The metadata DB (Postgres or MySQL — never SQLite in prod) stores EVERYTHING stateful: DAG run and task instance states, XComs, connections, variables, pools, SLA misses, and history. The scheduler, webserver, and workers all coordinate through it. If it's down or slow, Airflow effectively stops — the scheduler can't create runs, workers can't update state. So the metadata DB is a critical, must-be-HA component, and its performance (connection pool, table bloat from history) directly caps how many tasks/DAGs the whole system can handle.",
      navLabel: "Operational realities:",
      nav: "Because all coordination flows through it, the DB is a common scaling bottleneck: too many tasks + aggressive parsing + no cleanup and it chokes. You must periodically clean up old metadata (airflow db clean) or the task_instance / log tables bloat and slow every query. Multiple schedulers use row-level locks here for HA, which needs a DB that supports SELECT ... FOR UPDATE SKIP LOCKED (Postgres, MySQL 8). Treat it like the production database it is: HA, backups, monitoring, retention.",
      note: null,
      followups: [
        "\"What breaks if the metadata database goes down mid-run?\"",
        "\"Why does an old, never-cleaned metadata DB slow the whole deployment down?\""
      ]
    },
    {
      title: "XCom: what it's for, and why NOT for large data",
      badge: "critical",
      concept: "XCom ('cross-communication') lets tasks pass small values to each other — the TaskFlow return values, ti.xcom_push/pull. Crucially, XComs are STORED IN THE METADATA DATABASE (serialized into a table row). So an XCom is meant for tiny things: a file path, a partition key, a row count, a small config dict. Pushing a DataFrame, a big JSON blob, or a file's contents through XCom bloats the metadata DB, slows every scheduler query, and can hit hard size limits (the backend column has a size cap).",
      navLabel: "The correct pattern for 'passing data':",
      nav: "Don't pass DATA between tasks — pass a POINTER. Task A writes the data to S3/GCS/a table and returns the PATH via XCom; Task B reads the path and loads the data itself. This keeps the metadata DB tiny and makes tasks independently retryable. If you truly need larger XComs, use a custom XCom backend that stores the payload in object storage and keeps only a reference in the DB (the standard way to 'raise' the XCom limit). But 95% of the time, the answer is 'write to storage, pass the path'.",
      code: "from airflow.decorators import task\n\n@task\ndef extract() -> str:\n    df = expensive_query()                 # big data\n    path = \"s3://staging/orders/dt=2026-08-09.parquet\"\n    df.to_parquet(path)                    # data goes to storage\n    return path                            # only the POINTER goes to XCom\n\n@task\ndef load(path: str):\n    df = read_parquet(path)                # downstream reads it back\n    ...",
      note: "Here's the interview trap: 'how do you pass a big dataset between tasks via XCom?'<br><br>The senior answer is: you don't. XCom lives in the metadata DB and is for small values. You stage the data in object storage and pass the path, or you use a custom XCom backend backed by S3.",
      followups: [
        "\"Where is an XCom physically stored, and what's the consequence of pushing a 200MB object through it?\"",
        "\"How would you legitimately raise the effective XCom size limit?\""
      ]
    },
    {
      title: "Connections, Variables, and secrets backends",
      badge: "internals",
      concept: "Connections store credentials/endpoints for external systems (a Postgres conn, an AWS conn, an HTTP API) referenced by conn_id — hooks read them so credentials never live in DAG code. Variables are global key/value config (bucket names, feature flags). Both are stored in the metadata DB (encrypted with the Fernet key for connections). For real secret management you configure a secrets backend (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager) so Airflow fetches connections/variables from there instead of the DB — the production-grade approach.",
      navLabel: "The discipline:",
      nav: "Never hard-code credentials in a DAG — use conn_id + a hook. Never store real secrets as plaintext Variables. Use a secrets backend so rotation and access control live in a proper vault, and Airflow just references them. Also beware: a Variable.get() at the TOP LEVEL of a DAG file runs on every parse (a DB/secrets hit per parse across all files) — read Variables inside tasks, or use the '{{ var.value.x }}' Jinja form which is templated at run time.",
      code: "from airflow.decorators import task\nfrom airflow.models import Variable\nfrom airflow.hooks.base import BaseHook\n\n@task\ndef work():\n    bucket = Variable.get(\"raw_bucket\")        # read INSIDE the task, not top-level\n    conn = BaseHook.get_connection(\"snowflake_default\")\n    # ... use conn.login / conn.password / conn.host ...",
      note: "A top-level Variable.get() is a classic performance footgun. It fires a metadata-DB or secrets-backend call on every DAG parse, for every file that does it.<br><br>Keep it inside tasks, or use templated var references.",
      followups: [
        "\"Why is a top-level Variable.get() in a DAG file a problem?\"",
        "\"Where should production secrets actually live, and how does Airflow reach them?\""
      ]
    },
    {
      title: "Concurrency knobs: parallelism, max_active_runs, task concurrency",
      badge: "internals",
      concept: "Several independent limits gate how much runs at once, and confusing them causes both 'nothing runs' and 'we overwhelmed the DB'. parallelism (core): max task instances running across the WHOLE Airflow deployment. max_active_tasks_per_dag (was dag_concurrency): max running tasks within one DAG. max_active_runs (per DAG): max concurrent DAG RUNS of that DAG. max_active_tis_per_dag (task-level): max instances of ONE task across all runs. A task runs only if it clears ALL applicable limits plus its pool.",
      navLabel: "How they interact (and the debugging move):",
      nav: "A task stuck in 'scheduled/queued' with no error usually means it's hitting one of these ceilings, not failing. Order of debugging: is parallelism maxed globally? is this DAG at max_active_tasks? is max_active_runs capping how many intervals run? is a pool full? These compose — the tightest one wins. For backfills you often LOWER max_active_runs to avoid stampeding downstream; for throughput you RAISE parallelism (and size workers + DB to match).",
      code: "with DAG(\n    dag_id=\"heavy\",\n    max_active_runs=3,            # at most 3 intervals running at once\n    max_active_tasks=16,          # at most 16 tasks in this DAG at once\n) as dag:\n    ...\n\n# global cap in airflow.cfg:\n# [core] parallelism = 64        # whole-deployment ceiling\n# a task also needs a free slot in its pool (next card)",
      note: null,
      followups: [
        "\"A task sits in 'queued' forever with no error. Walk me through the concurrency limits you'd check.\"",
        "\"parallelism vs max_active_runs vs max_active_tasks_per_dag — what does each cap?\""
      ]
    },
    {
      title: "Pools and priority_weight: rationing scarce resources",
      badge: "internals",
      concept: "A Pool is a named bucket of N slots used to limit concurrent access to a scarce external resource — e.g. a database that only tolerates 5 concurrent heavy queries. Tasks assigned to a pool wait until a slot is free, regardless of how much global parallelism exists. priority_weight decides the ORDER in which queued tasks grab available slots (higher weight goes first), so critical tasks jump the queue. Together they let you protect fragile downstreams and prioritize important work under contention.",
      navLabel: "The real use case:",
      nav: "Classic example: a warehouse or API that falls over past K concurrent connections. Create a pool with K slots and assign every task that hits it to that pool — now Airflow can have 200 tasks running overall but only K touching that system. priority_weight ensures the risk/SLA-critical tasks win the pool slots over best-effort backfills. This is how you stop Airflow from DDoSing your own database during a backfill.",
      code: "# create a pool (UI or CLI): airflow pools set warehouse 5 \"warehouse conns\"\nfrom airflow.operators.bash import BashOperator\n\nq = BashOperator(\n    task_id=\"heavy_query\",\n    bash_command=\"run_query.sh {{ ds }}\",\n    pool=\"warehouse\",        # max 5 of these run concurrently, cluster-wide\n    priority_weight=10,      # jumps ahead of low-priority tasks for a slot\n)",
      note: "Pools answer the complaint 'a backfill of DAG X keeps knocking over the shared warehouse.' Size a pool to what the downstream can take, so you cap concurrent access. Then prioritize live SLA work over the backfill.",
      followups: [
        "\"A backfill keeps overwhelming a shared database. How do pools fix it, and how is that different from just lowering parallelism?\"",
        "\"What does priority_weight decide, and when do you actually need it?\""
      ]
    },
    {
      title: "Retries, exponential backoff, and failure callbacks",
      badge: "internals",
      concept: "Retries make transient failures self-heal. Per task (usually via default_args): retries (how many), retry_delay (wait between), retry_exponential_backoff=True (delay grows exponentially: 1m, 2m, 4m…), max_retry_delay (cap it), and execution_timeout (kill a task that runs too long). on_failure_callback / on_retry_callback / on_success_callback fire Python functions for alerting (page on-call, post to Slack) — the modern way to wire notifications rather than only email_on_failure.",
      navLabel: "How to set a sane policy:",
      nav: "For tasks calling flaky external systems (APIs, warehouses), retries=3–5 with exponential backoff and a max_retry_delay so retries don't wait hours. Always set execution_timeout so a hung task (stuck network call) can't run forever and block slots. Use on_failure_callback to page on-call for critical DAGs and to attach context (which task, which logical_date, the log link). Retries + idempotent tasks together are what make 'at-least-once execution' safe — retries only help if reruns are harmless.",
      code: "import datetime\ndefault_args = {\n    \"retries\": 4,\n    \"retry_delay\": datetime.timedelta(minutes=1),\n    \"retry_exponential_backoff\": True,       # 1m, 2m, 4m, 8m ...\n    \"max_retry_delay\": datetime.timedelta(minutes=30),\n    \"execution_timeout\": datetime.timedelta(hours=1),\n    \"on_failure_callback\": lambda ctx: page_oncall(ctx),\n}",
      note: "Retries are only safe because your tasks are idempotent (see the DAGs tab). Retrying a non-idempotent task just multiplies the corruption. At senior level, the two concepts are inseparable.",
      followups: [
        "\"Why is retry_exponential_backoff + max_retry_delay better than a fixed retry_delay for an API-calling task?\"",
        "\"Retries and idempotency — why can't you have a good retry policy without the other?\""
      ]
    },
    {
      title: "Trigger rules: controlling when a task runs given its upstreams",
      badge: "internals",
      concept: "By default a task runs only when ALL upstreams succeeded (trigger_rule='all_success'). But you can change this: all_done (run once all upstreams finish regardless of state — good for cleanup), one_success (run as soon as any upstream succeeds), none_failed_min_one_success (run if nothing failed and at least one succeeded — the branch-join fix), all_failed, one_failed (run a task specifically when something upstream failed, e.g. an alert task). Trigger rules are how you express 'always run cleanup' or 'run this only on failure'.",
      navLabel: "The two you'll actually reach for:",
      nav: "all_done for a teardown/cleanup task that must run whether the pipeline succeeded or failed (release resources, drop temp tables). none_failed_min_one_success for a join task after a branch, so a skipped branch doesn't wrongly skip the join. one_failed for a dedicated 'alert on failure' task. Misusing the default all_success after a branch is the #1 'why did my downstream task get skipped' bug — the skipped branch propagates skip.",
      code: "from airflow.operators.bash import BashOperator\n\ncleanup = BashOperator(\n    task_id=\"cleanup\",\n    bash_command=\"drop_temp.sh {{ ds }}\",\n    trigger_rule=\"all_done\",     # run even if upstream failed\n)\n\nalert = BashOperator(\n    task_id=\"alert\",\n    bash_command=\"page.sh\",\n    trigger_rule=\"one_failed\",   # run only if an upstream failed\n)",
      note: null,
      followups: [
        "\"Which trigger rule makes a cleanup task run whether or not the pipeline succeeded?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — the questions a 6+ YOE DE actually gets asked about Airflow",
    desc: "Each card is a real spoken interview question. Form your own answer first, then expand for a model answer that shows senior depth — the failure modes and gotchas, not textbook definitions."
  },
  cards: [
    {
      title: "\"Walk me through exactly what happens when a scheduled DAG runs.\"",
      badge: "fundamentals",
      navLabel: "How to approach it:",
      nav: "Tell the lifecycle in order and name the components as you go — scheduler, executor, workers, metadata DB, triggerer. Land the 'runs at the END of the interval' point and the DAG-run/task-instance model; that's the senior signal.",
      noteLabel: "Model answer:",
      note: "\"The scheduler continually parses DAG files and evaluates each DAG's schedule. When a data interval completes, it creates a DAG run for that interval, plus the task instances, in the metadata DB. Note that the run fires at the END of its interval, so a daily run for the 9th executes just after midnight on the 10th.<br><br>The scheduler then checks each task instance's dependencies and trigger rules. When one is ready, it queues it to the executor. The executor, whether Local, Celery, or Kubernetes, runs the task on a worker. The worker executes the code and writes state and any small XComs back to the metadata DB.<br><br>Retries fire on failure per the retry policy. Deferrable operators hand their wait to the triggerer to free the slot. The webserver just reflects the metadata DB. Everything coordinates through that database, which is why it's the critical component.\"",
      followups: [
        "\"At what wall-clock time does a @daily run for logical_date 2026-08-09 actually execute?\"",
        "\"Which component frees a worker slot while waiting on an external condition?\""
      ]
    },
    {
      title: "\"How do you make a task idempotent and rerunnable?\"",
      badge: "critical",
      navLabel: "How to approach it:",
      nav: "Define idempotency, then give the concrete write patterns (DELETE+INSERT / MERGE scoped to the interval), and connect it to why Airflow forces the issue (retries, catchup, backfills, manual clears).",
      noteLabel: "Model answer:",
      note: "\"Idempotent means running the task twice for the same data interval leaves the same end state as running it once. It matters because Airflow WILL rerun tasks, through retries, backfills, catchup, and manual clears. So any non-idempotent write silently corrupts data.<br><br>Concretely, instead of INSERT INTO target SELECT …, I scope the write to the run's interval and make it replace-not-append. That means DELETE WHERE dt = '{{ ds }}' then INSERT, or MERGE/UPSERT on a business key, or overwrite the dt= partition in object storage.<br><br>I also make the task deterministic by templating off {{ ds }} or data_interval_start instead of datetime.now(), so a backfilled run reads the correct historical window. Together, idempotent plus deterministic, a rerun is always both safe and correct.\"",
      followups: [
        "\"Turn INSERT INTO orders SELECT * FROM staging WHERE dt = today into something backfill-safe.\"",
        "\"Why isn't 'Airflow guarantees exactly-once execution' the answer here?\""
      ]
    },
    {
      title: "\"How do you backfill 90 days safely?\"",
      badge: "operations",
      navLabel: "How to approach it:",
      nav: "Don't say 'catchup=True'. Lead with the preconditions (idempotent + deterministic), then the mechanics (bounded range, throttled concurrency, protect downstream), then verification.",
      noteLabel: "Model answer:",
      note: "\"First, the preconditions. The tasks must be idempotent and deterministic: templated off {{ ds }}, writing via DELETE+INSERT or MERGE per partition. Otherwise a backfill duplicates or corrupts data.<br><br>Then I run a bounded backfill with `airflow dags backfill --start-date … --end-date …`, or I clear the specific runs. I do NOT flip catchup=True, which would stampede everything at once. I throttle it: I lower max_active_runs, say to 3, and route heavy tasks through a pool sized to what the warehouse can take, so I don't knock over shared downstreams. I set priority so live SLA work still wins slots.<br><br>I verify the source data for those dates still exists, then spot-check row counts or a checksum on a few reprocessed partitions. If day N depends on N-1 I'd use depends_on_past and go oldest-first. Otherwise I let them parallelize within the throttle.\"",
      followups: [
        "\"Why not just set catchup=True with an old start_date to backfill?\"",
        "\"How do you keep the backfill from overwhelming the shared warehouse?\""
      ]
    },
    {
      title: "\"You have a task that must never run twice for the same period. How?\"",
      badge: "reliability",
      navLabel: "How to approach it:",
      nav: "Reframe: Airflow gives at-least-once execution, so you can't PREVENT a second attempt — you make the effect exactly-once. Cover idempotent writes plus, if there's a non-idempotent side effect, an external dedup/lock keyed by run.",
      noteLabel: "Model answer:",
      note: "\"Airflow can't promise exactly-once execution. Retries, clears, and overlapping runs mean a task may attempt more than once. So the guarantee has to live in the task's effect, not in Airflow.<br><br>If the work is a data write, I make it idempotent, with a MERGE or an overwrite of the {{ ds }} partition, so a second run is a no-op. If it's a genuinely non-idempotent side effect, like submitting a payment or sending an external event, I add an idempotency key derived from the dag_id, task_id, and logical_date. Then I dedup against it in the target system, or take a lock keyed on that, so a retry is recognized and ignored.<br><br>I'd also use max_active_runs=1, and depends_on_past if needed, to stop two runs of the same interval from overlapping. The principle is the same as idempotent Kafka consumers: make reprocessing harmless rather than pretending it can't happen.\"",
      followups: [
        "\"What idempotency key would you use so a retry is recognized as a duplicate?\"",
        "\"How do you stop two DAG runs of the same interval from overlapping?\""
      ]
    },
    {
      title: "\"Explain the execution_date / logical_date confusion.\"",
      badge: "gotcha",
      navLabel: "How to approach it:",
      nav: "State the counter-intuitive fact plainly (runs at END of interval), explain WHY (you process a period after it completes), and note the modern rename to logical_date + data_interval_start/end.",
      noteLabel: "Model answer:",
      note: "\"The name misleads everyone. execution_date is NOT when the DAG runs. It's the START of the data interval the run processes. A scheduled run fires at the END of its interval, because you can't process a period until it's complete.<br><br>So a @daily DAG with logical_date 2026-08-09 actually executes just after midnight on the 10th. And {{ ds }} = 2026-08-09 is the day of DATA, not the day of execution. That's why you template off {{ ds }} directly with no date math: it already IS the interval to process.<br><br>Modern Airflow renamed execution_date to logical_date and exposed data_interval_start and data_interval_end explicitly, precisely to kill this confusion. The classic bug it causes is people adding a day to 'fix' an off-by-one that was never wrong.\"",
      followups: [
        "\"A colleague adds +1 day to ds to 'correct' the date. Why is that a bug?\"",
        "\"What do data_interval_start and data_interval_end give you that execution_date didn't?\""
      ]
    },
    {
      title: "\"Why can't you pass large data through XCom, and what do you do instead?\"",
      badge: "internals",
      navLabel: "How to approach it:",
      nav: "Name where XCom is stored (metadata DB), the consequences (bloat, size limit, slow scheduler), and the pointer pattern; mention custom XCom backends as the legit escape hatch.",
      noteLabel: "Model answer:",
      note: "\"XComs are serialized into the metadata database, so they're for small values: a path, a row count, a partition key. Push a DataFrame or a big blob and you bloat the DB, slow every scheduler query that touches that table, and can hit the column's size limit outright.<br><br>The right pattern is to pass a POINTER, not the payload. The producing task writes the data to S3/GCS or a staging table and returns the PATH via XCom. The consumer reads the path and loads the data itself. That keeps the metadata DB tiny and makes each task independently retryable.<br><br>If I genuinely need larger XComs, I configure a custom XCom backend that stores the payload in object storage and keeps only a reference in the DB. But 95% of the time, 'write to storage, pass the path' is the answer.\"",
      followups: [
        "\"Where does an XCom physically live?\"",
        "\"How would a custom XCom backend change the size story?\""
      ]
    },
    {
      title: "\"A DAG is starting late / not running on time. Debug it.\"",
      badge: "troubleshooting",
      navLabel: "How to approach it:",
      nav: "Give an ordered diagnostic. Separate 'scheduled but not starting' (scheduler/parse/concurrency) from 'running but slow'. Name the specific knobs.",
      noteLabel: "Model answer:",
      note: "\"I'd localize it. First, is the run even being created on time? If DAG parsing is slow, from expensive top-level code, thousands of DAGs, or slow imports, the scheduler lags creating runs, so tasks start minutes late. I'd check scheduler metrics and DAG parse times, and move any top-level work into tasks.<br><br>Second, is the task created but stuck 'queued'? Then it's a concurrency ceiling: global parallelism maxed, the DAG at max_active_tasks, max_active_runs capping intervals, or a full pool. I check each in that order. Third, are workers saturated, from Celery queue depth or no free K8s capacity? Fourth, is a sensor eating slots through poke-mode starvation?<br><br>I'd confirm with the scheduler logs, the task instance's state and its 'why not scheduled' details, and the executor and queue metrics. 'Starts late' is almost always parse pressure or a concurrency limit, not the schedule itself.\"",
      followups: [
        "\"What top-level DAG code would you look for first, and why does it slow the scheduler?\"",
        "\"Task is stuck in 'queued' with no error — what are the four things you'd check?\""
      ]
    },
    {
      title: "\"All your DAGs hang and nothing runs, but there are no errors. What's going on?\"",
      badge: "troubleshooting",
      navLabel: "How to approach it:",
      nav: "Recognize the sensor-starvation / slot-exhaustion pattern. Explain poke vs reschedule vs deferrable and the fix.",
      noteLabel: "Model answer:",
      note: "\"That's the classic symptom of worker-slot exhaustion, usually sensor starvation. Poke-mode sensors hold a worker slot the entire time they wait. If you have many long-running sensors, they occupy every slot, so no real tasks can be scheduled. The system deadlocks itself with zero errors, because nothing failed, everything's just waiting.<br><br>The fix is to switch long-waiting sensors to mode='reschedule' so they release the slot between checks. Better still, use deferrable operators that offload the wait to the triggerer and free the slot entirely, which scales to thousands of concurrent waits. I'd also set timeouts so no sensor can wait forever, and check global parallelism and pool sizing.<br><br>Longer term, I'd replace 'wait for the file' sensors with Dataset-driven scheduling, so the consumer runs on the produce event instead of polling.\"",
      followups: [
        "\"Poke vs reschedule vs deferrable — rank them for 5,000 concurrent waits.\"",
        "\"How would Datasets remove the need for the sensor entirely?\""
      ]
    },
    {
      title: "\"How do you build a pipeline where the number of tasks isn't known until runtime?\"",
      badge: "authoring",
      navLabel: "How to approach it:",
      nav: "Reach for dynamic task mapping (.expand). Contrast it explicitly with the old top-level for-loop anti-pattern and say why mapping is better.",
      noteLabel: "Model answer:",
      note: "\"Dynamic task mapping, with .expand(). An upstream task returns a list at runtime, like the files that landed today or the partitions from a query, and the mapped task runs once per element as indexed, individually-retryable instances.<br><br>The key reason it's right: the count is decided by DATA at run time, with no code running at parse time. The old anti-pattern was a for-loop at module scope that hit an API to decide how many operators to create. That runs on every scheduler parse, hammers the external system, and makes the DAG structure unstable and slow to parse.<br><br>With .expand() the parse stays cheap and inert, while the fan-out is data-driven, visible in the UI, and each mapped instance can be retried on its own. I can also cap the mapped concurrency so a 500-way fan-out doesn't overwhelm downstream.\"",
      followups: [
        "\"Why is a top-level for-loop over an API result worse than .expand()?\"",
        "\"One mapped instance out of 300 fails — what reruns?\""
      ]
    },
    {
      title: "\"How do you test a DAG, and would you use Airflow to transform data inside the warehouse?\"",
      badge: "judgment",
      navLabel: "How to approach it:",
      nav: "Two-parter. For testing: distinguish parse/import tests, unit-testing task logic as plain Python, and integration tests. For the second: the senior take is Airflow ORCHESTRATES, it doesn't transform — push logic into SQL/dbt/Spark.",
      noteLabel: "Model answer:",
      note: "\"Testing has layers. The cheapest is a DAG-validation and import test that parses every DAG and asserts no import errors and no cycles. That catches most breakages in CI. Then unit tests: with the TaskFlow API my task logic is a plain Python function, so I test it directly with sample inputs, no Airflow needed. That's a big reason to keep business logic in testable functions rather than sprawling operators. Then integration tests with `airflow tasks test dag_id task_id date`, to run a single task instance against real or sandboxed systems for a given logical date.<br><br>On the second question: no, I wouldn't do heavy transformation inside Airflow tasks. Airflow is the orchestrator. The transform belongs in the warehouse, in SQL or dbt, or in Spark. Those are built for set-based and distributed compute, give better lineage and testing, and keep Airflow tasks as thin, idempotent triggers. Pulling data into a Python task to transform it doesn't scale and abuses the metadata DB via XCom.\"",
      followups: [
        "\"What's the cheapest test that catches the most DAG breakages in CI?\"",
        "\"Why push transformation into dbt/Spark rather than doing it in a PythonOperator?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "A @daily DAG has logical_date 2026-08-09. When does the scheduled run actually execute?",
    options: [
      "At the start of 2026-08-09 (midnight that day)",
      "Just after 2026-08-10 00:00 — at the END of the data interval",
      "Whenever the scheduler is first started",
      "Exactly at noon on 2026-08-09"
    ],
    correct: 1
  },
  {
    q: "What makes a task idempotent for safe reruns/backfills?",
    options: [
      "Adding more retries in default_args",
      "Running twice for the same interval leaves the same end state (e.g. DELETE+INSERT or MERGE per partition)",
      "Setting catchup=True",
      "Using datetime.now() so it always reflects the latest data"
    ],
    correct: 1
  },
  {
    q: "Why should you NOT pass a large DataFrame between tasks via XCom?",
    options: [
      "XComs are encrypted and too slow to decrypt",
      "XComs are stored in the metadata DB — large values bloat it, slow the scheduler, and hit size limits; pass a storage path instead",
      "XComs can only hold strings",
      "XComs are deleted after every task, so the data is lost"
    ],
    correct: 1
  },
  {
    q: "All tasks are stuck 'queued', nothing runs, and there are no errors. Sensors are involved. Most likely cause?",
    options: [
      "The metadata DB schema is corrupt",
      "Poke-mode sensors are holding every worker slot (sensor starvation) — use reschedule mode or deferrable operators",
      "catchup is set to False",
      "The DAG has a cycle"
    ],
    correct: 1
  },
  {
    q: "You need to create one task per file discovered at runtime. Best approach?",
    options: [
      "A for-loop at the top level of the DAG file that lists the files via an API call",
      "Dynamic task mapping with .expand() over an upstream task's returned list",
      "A single BashOperator that loops internally",
      "Set max_active_runs equal to the file count"
    ],
    correct: 1
  },
  {
    q: "Which executor launches one pod per task and can scale to zero when idle?",
    options: [
      "SequentialExecutor",
      "LocalExecutor",
      "KubernetesExecutor",
      "CeleryExecutor"
    ],
    correct: 2
  },
  {
    q: "A shared warehouse falls over when a backfill runs too many concurrent heavy queries. Best fix?",
    options: [
      "Increase global parallelism so tasks finish faster",
      "Assign those tasks to a Pool sized to what the warehouse can take (and prioritize live work)",
      "Set catchup=True",
      "Switch every task to poke-mode sensors"
    ],
    correct: 1
  },
  {
    q: "After a @task.branch, your final 'finalize' task keeps getting skipped. What's the fix?",
    options: [
      "Set retries higher on finalize",
      "Set finalize's trigger_rule to none_failed_min_one_success (default all_success propagates the skip)",
      "Move finalize into a SubDAG",
      "Give finalize a later start_date"
    ],
    correct: 1
  }
];
