// Content data for the Python for Data Engineering module.
// Senior-DE interview focus: why Python is the DE lingua franca, core language
// mechanics (data structures, generators, context managers, decorators, typing),
// pandas at scale, performance and the GIL, testing transforms, and the classic
// spoken interview questions. Examples lean on real pipeline work: streaming big
// files, vectorizing transforms, and making logic testable outside notebooks.
const MODULE_ID = "python";
const CONTENT = {

overview: {
  intro: {
    title: "Python for Data Engineering — the glue language of the modern data stack",
    desc: "Python is the lingua franca of data engineering not because it's the fastest language, but because it sits at the seam of everything: it glues APIs, warehouses, and orchestrators together; it's the interface to Spark, dbt, and Airflow; and its data ecosystem (pandas, PyArrow, Polars, DuckDB) is unmatched. This module goes from why Python won that role, through the language mechanics interviewers actually probe — generators, context managers, decorators, typing — into pandas at scale and its breaking points, performance and the GIL, testing transforms as pure functions, and the spoken interview questions a mid-to-senior DE gets asked."
  },
  cards: [
    {
      title: "Why Python became the lingua franca of data engineering",
      badge: "fundamentals",
      conceptLabel: "What it is:",
      concept: "Python won the data-engineering seat for a few compounding reasons. It's readable and fast to write, so a transform or a glue script takes minutes, not hours. Its data ecosystem is unmatched — pandas, NumPy, PyArrow, Polars, DuckDB, plus SDKs for every cloud and warehouse. And it's the control plane for the heavy tools: PySpark, dbt, Airflow, Dagster, and Prefect are all driven from Python, so the language you orchestrate in is the same one you transform in.<br><br>The trade-off is that pure Python is slow and single-threaded under the GIL. But that rarely matters, because the heavy lifting happens in C-backed libraries (NumPy, Arrow) or is pushed down to an engine (Spark, the warehouse). Python is the thin, expressive layer on top.",
      noteLabel: "How it works:",
      note: "Think of Python as the orchestration and glue layer, not the compute layer.<br><br>The pattern that repeats across every stack is: Python expresses the logic, and a fast engine executes it. You write a DataFrame transform in PySpark, but the JVM runs it. You write SQL through a Python client, but the warehouse runs it. You call NumPy, but C runs the loop.<br><br>That's why 'Python is slow' rarely bites a DE: you're almost never doing the tight numeric loop in interpreted Python. When you are, that's the bug — and vectorizing or pushing it down is the fix.",
      followups: [
        { q: "\"If Python is slow, why not use a faster language for pipelines?\"", a: "Because the slow part is almost never in Python. The heavy work runs in C-backed libraries or a pushed-down engine like Spark or the warehouse. Python is the thin expressive layer, and developer speed and ecosystem beat raw language speed for glue and transforms." },
        { q: "\"Where does Python actually run the compute versus delegate it?\"", a: "It delegates whenever it can: NumPy and Arrow run loops in C, PySpark runs on the JVM, SQL runs in the warehouse. Python runs the compute itself only in plain loops and comprehensions, which is exactly where you should avoid heavy work." },
        { q: "\"What do interviewers actually test with Python for DE?\"", a: "Not clever algorithms. They test whether you can process data larger than memory (generators, chunking), vectorize instead of loop, know when pandas breaks and reach for Spark or Polars, understand the GIL, and write transforms you can unit-test. It's practical data handling, not LeetCode." }
      ]
    },
    {
      title: "Where Python fits — glue, transforms, orchestration, PySpark",
      badge: "fundamentals",
      conceptLabel: "What it is:",
      concept: "Python shows up in four distinct roles in a data platform, and it helps to name them. Glue: calling APIs, moving files between S3 and a warehouse, reshaping JSON, handling auth — the connective tissue between systems. Transforms: the actual cleaning, joining, and aggregating, in pandas for small data or pushed to SQL/Spark for big data. Orchestration: defining DAGs and dependencies in Airflow, Dagster, or Prefect, where Python describes what runs when. And distributed compute via PySpark, where you write Python but a cluster executes it.<br><br>Knowing which role you're in tells you what matters: glue needs robust error handling and retries, transforms need correctness and testability, orchestration needs idempotency, and PySpark needs an understanding of what runs on the driver versus the executors.",
      noteLabel: "How it works:",
      note: "Each role has a different failure mode, and a senior answer names it.<br><br>Glue code fails on the network and on messy input, so it lives or dies by retries, timeouts, and validation at the boundary. Transform code fails on correctness, so it lives or dies by tests. Orchestration fails on non-idempotent reruns, so tasks must be safe to run twice. PySpark fails when you accidentally pull everything to the driver with a collect(), or when you use a Python UDF where a native function would push down.<br><br>Placing your work in the right role is how you know which concern to defend.",
      followups: [
        { q: "\"What's the difference between driver and executor code in PySpark?\"", a: "The driver is the single Python process that builds the plan and coordinates; executors are the distributed workers that run it on partitions. A collect() or toPandas() pulls all data to the driver and can blow its memory. Keep work in the distributed DataFrame API so it runs on executors." },
        { q: "\"Why is idempotency the key concern for orchestration code?\"", a: "Because tasks get retried and backfilled, so they run more than once. If a task blind-inserts, a retry double-counts. Idempotent tasks — merge/upsert on a key, scoped to a partition — can rerun safely, which is what makes orchestration reliable." },
        { q: "\"When do you transform in pandas versus push to SQL or Spark?\"", a: "Pandas for data that fits comfortably in memory on one machine. Push to SQL when the data already lives in the warehouse and the transform is expressible there — let the warehouse do it. Reach for Spark or Polars/DuckDB when the data is too big for single-machine pandas." }
      ]
    },
    {
      title: "The mental model interviewers reward — data movement, not algorithms",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "Python-for-DE interviews are not software-engineering algorithm interviews. Nobody cares if you can invert a binary tree. They care whether you can move and reshape data safely and efficiently: can you read a 50GB file on an 8GB machine, can you turn a slow row-by-row loop into a vectorized operation, do you know when a single machine stops being enough, and can you write a transform that someone else can test and trust.<br><br>The recurring themes are memory (bound it with streaming), speed (vectorize or push down), and correctness (make it testable). If your answer touches those three, you sound senior. If you jump straight to clever code, you sound junior.",
      noteLabel: "How it works:",
      note: "Frame every Python-for-DE answer around three questions: does it fit in memory, is it fast enough, and can I test it.<br><br>Memory first, because it's the hard constraint — a transform that's correct but OOMs is useless. Streaming with generators and chunked reads is the standard answer. Speed second — vectorize with NumPy/pandas or push to an engine, never a Python loop over millions of rows. Correctness third — factor logic into pure functions you can assert on.<br><br>These three cover the vast majority of what gets asked, and they're the difference between 'I wrote a script' and 'I built something that holds up in production.'",
      followups: [
        { q: "\"What's the single most common Python-for-DE interview question?\"", a: "'How do you process a file that's too big to fit in memory?' The answer is streaming: read line by line or in chunks with a generator, process each piece, and never hold the whole thing at once. It tests whether you think about memory as a real constraint." },
        { q: "\"How do you sound senior rather than junior in these answers?\"", a: "Lead with the constraint and the trade-off, not the code. Say why you'd stream, when pandas stops being enough, what the GIL does to your threading choice. Naming the failure mode and the alternative is the senior signal; jumping to clever code is the junior one." },
        { q: "\"Is knowing pandas enough for a DE role?\"", a: "For small data, mostly. But seniors are expected to know pandas's limits and what's past them — that it's single-machine and memory-bound, and that Polars, DuckDB, or Spark take over when it breaks. Knowing the tool and its ceiling matters more than deep pandas trivia." }
      ]
    }
  ]
},

core: {
  intro: {
    title: "Core Python — data structures, generators, context managers, decorators, typing",
    desc: "The language mechanics that separate someone who writes scripts from someone who writes maintainable pipeline code: choosing the right data structure by its complexity, comprehensions and generators for lazy processing of big data, iterators and context managers for safe resource handling, decorators for cross-cutting concerns like retries, the classic mutable-default-argument trap, and typing plus dataclasses for self-documenting, checkable code."
  },
  cards: [
    {
      title: "Data structures and their complexity — list, dict, set, tuple",
      badge: "fundamentals",
      conceptLabel: "What it is:",
      concept: "The four core built-ins each have a job, and picking wrong quietly turns an O(n) job into O(n²). A list is an ordered, mutable sequence — great for ordered data and iteration, but membership testing (x in list) is O(n). A dict is a hash map — O(1) average lookup, insert, and delete by key, the workhorse for lookups and grouping. A set is a hash of unique keys — O(1) membership and deduplication, exactly what you want when you're checking 'have I seen this.' A tuple is an immutable sequence — hashable, so it can be a dict key or set member, and it signals 'this won't change.'<br><br>The single most common performance bug in DE Python is doing repeated membership checks against a list instead of a set.",
      code: "# O(n) per check -> O(n*m) total. Slow on big data.\nseen = []\nfor row in rows:\n    if row.id not in seen:   # O(n) scan each time\n        seen.append(row.id)\n\n# O(1) per check -> O(n) total. Use a set.\nseen = set()\nfor row in rows:\n    if row.id not in seen:   # O(1) hash lookup\n        seen.add(row.id)",
      noteLabel: "How it works:",
      note: "The decision is usually driven by one question: what operation do you do most?<br><br>If you look things up by key, dict. If you test membership or dedupe, set. If you need order and will iterate, list. If it's a fixed record that shouldn't change and might be a key, tuple.<br><br>The trap is reaching for a list by reflex and then doing 'in' checks on it inside a loop. That's the quadratic blowup that makes a job that should take seconds take minutes. Converting the lookup collection to a set is often a one-line fix that changes the complexity class.",
      followups: [
        { q: "\"Why is 'x in my_list' slow but 'x in my_set' fast?\"", a: "A list has to scan element by element until it finds a match, which is O(n). A set is a hash table, so membership is an O(1) average hash lookup. Inside a loop that difference is O(n²) versus O(n) — the classic quadratic bug." },
        { q: "\"When would you use a tuple instead of a list?\"", a: "When the data is fixed and shouldn't change, and especially when you need it to be hashable — as a dict key or set member. A tuple signals immutability to readers and lets you key on a composite value like (user_id, date), which a list can't do." },
        { q: "\"What's collections.defaultdict and Counter good for?\"", a: "defaultdict removes the 'check if key exists then initialize' boilerplate when grouping — defaultdict(list) lets you just append. Counter is a dict subclass built for frequency counts and gives you most_common() for free. Both are idiomatic for the group-and-aggregate patterns DE code is full of." }
      ]
    },
    {
      title: "Comprehensions and generator expressions — readable, and lazy when you need it",
      badge: "fundamentals",
      conceptLabel: "What it is:",
      concept: "A list comprehension builds a whole list in memory in one readable expression: [f(x) for x in xs if cond]. It's faster and clearer than an append loop, and it's the idiomatic way to transform a collection. But it materializes everything — for a million rows, that's a million objects held at once.<br><br>A generator expression looks almost identical but uses parentheses: (f(x) for x in xs if cond). It produces items lazily, one at a time, holding only the current one in memory. Swapping the square brackets for parentheses is the difference between loading a whole file into RAM and streaming it. For anything large, that one-character change is the memory fix.",
      code: "# List comp: builds the whole list in memory.\ntotal = sum([int(line) for line in open('big.txt')])\n\n# Generator expr: streams one line at a time. Bounded memory.\ntotal = sum(int(line) for line in open('big.txt'))\n\n# Same idea, explicit: this never holds more than one line.\nlines = (line.strip() for line in open('big.txt'))",
      noteLabel: "How it works:",
      note: "Use a list comprehension when you need the whole collection again — you'll index it, len it, or iterate it more than once. Use a generator when you'll consume it once and want to bound memory.<br><br>The tell is size. For a few thousand rows, a list comp is fine and simpler. For a file or a stream you can't hold in RAM, the generator is the whole point.<br><br>A gotcha: a generator is single-pass. Once you've iterated it, it's exhausted — iterate again and you get nothing. If you need multiple passes, you need a list (and the memory that comes with it).",
      followups: [
        { q: "\"When would you pick a list comprehension over a generator?\"", a: "When you need the collection more than once — to index into it, take its length, or iterate it several times. A generator is single-pass and has no length. If the data fits in memory and you'll reuse it, the list is simpler and correct." },
        { q: "\"What happens if you iterate a generator twice?\"", a: "The second iteration yields nothing, because generators are exhausted after one pass — there's no rewind. It's a subtle bug: the first loop works, the second silently does nothing. If you need two passes, materialize to a list or recreate the generator." },
        { q: "\"Is a list comprehension actually faster than a for-append loop?\"", a: "Usually yes, modestly, because the iteration happens in optimized C rather than interpreted bytecode with repeated attribute lookups for .append. But the bigger win is readability. For memory, though, the loop and the list comp are the same — both materialize everything." }
      ]
    },
    {
      title: "Generators and lazy evaluation — the standard answer for big data",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "A generator function uses yield instead of return. Each yield hands back one value and pauses the function's state; the next call resumes right after it. The effect is lazy evaluation — values are produced on demand, one at a time, so you can process a stream far larger than memory because you never hold more than the current item plus whatever you accumulate.<br><br>This is the canonical answer to 'how do you handle a file too big for memory.' You wrap the source in a generator, and the consumer pulls items through it. You can even chain generators into a pipeline — read, then parse, then filter, then transform — and data flows through one record at a time, with memory bounded regardless of total size.",
      code: "def read_records(path):\n    with open(path) as f:\n        for line in f:              # file objects are already lazy\n            yield parse(line)\n\ndef only_valid(records):\n    for r in records:\n        if r.amount > 0:\n            yield r\n\n# A streaming pipeline. Memory stays flat no matter the file size.\nfor rec in only_valid(read_records('huge.jsonl')):\n    load(rec)",
      noteLabel: "How it works:",
      note: "The mental model is a conveyor belt, not a warehouse. Each record moves through the stages and is gone; you never stockpile.<br><br>Chaining generators is the elegant part: each stage is a small generator that takes an iterable and yields a transformed iterable. Composing them builds a lazy pipeline where nothing is computed until the final consumer pulls, and memory stays flat.<br><br>The caveat is the same as before — single pass, and any state you accumulate (a running total, a growing set) does grow. Streaming bounds the input, not necessarily your aggregates. If you group by a high-cardinality key into a dict, that dict can still blow up.",
      followups: [
        { q: "\"What's the difference between yield and return?\"", a: "return ends the function and hands back one value. yield hands back a value but pauses the function with its state intact, so the next call resumes right after the yield. That pause-and-resume is what makes lazy, one-at-a-time production possible." },
        { q: "\"Does streaming with generators guarantee bounded memory?\"", a: "It bounds the input — you hold one record at a time instead of the whole file. But it doesn't bound state you accumulate. A running total is fine; grouping into a dict by a high-cardinality key still grows unboundedly. Streaming fixes input memory, not aggregate memory." },
        { q: "\"How do you chain generators into a pipeline?\"", a: "Each stage is a generator that takes an iterable and yields a transformed one: read -> parse -> filter -> transform. You pass the output of one as the input to the next. Nothing runs until the final consumer iterates, and data flows through one record at a time." }
      ]
    },
    {
      title: "Context managers and the with statement — safe resource handling",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "A context manager guarantees setup and teardown around a block, even if an exception is thrown. The with statement is the syntax: with open(path) as f: ... closes the file automatically when the block exits, whether it exits normally or by an error. This matters enormously in DE code, where you're constantly acquiring resources — file handles, database connections, locks, transactions — that must be released or they leak.<br><br>You can write your own with @contextlib.contextmanager: code before the yield is the setup, code after (ideally in a finally) is the teardown. It's the clean way to wrap 'open a connection, do work, always close it' so the closing can't be forgotten.",
      code: "from contextlib import contextmanager\n\n@contextmanager\ndef db_cursor(conn):\n    cur = conn.cursor()\n    try:\n        yield cur           # hand the resource to the with-block\n        conn.commit()       # runs on clean exit\n    except Exception:\n        conn.rollback()     # runs on error\n        raise\n    finally:\n        cur.close()         # always runs\n\nwith db_cursor(conn) as cur:\n    cur.execute(sql)",
      noteLabel: "How it works:",
      note: "The value is that cleanup is guaranteed, so you can't leak a connection by forgetting to close it in an error path.<br><br>Without with, you'd write try/finally by hand everywhere, and one missed finally leaks a handle. The context manager centralizes that pattern once. The transaction example is the classic: commit on success, rollback on failure, close always — exactly the semantics you want, encoded so you can't get it wrong.<br><br>In pipelines this shows up constantly: file handles, warehouse connections, Spark sessions, distributed locks, temp directories. Anything acquired should be released in a context manager.",
      followups: [
        { q: "\"Why use 'with open()' instead of just open() and close()?\"", a: "Because if an exception fires between open and close, a bare close() never runs and you leak the handle. with guarantees the file closes on any exit path, normal or error. It's the difference between usually closing and always closing." },
        { q: "\"How does contextlib.contextmanager work under the hood?\"", a: "It turns a generator into a context manager. Everything before the yield is the setup that runs on enter; the yielded value is what 'as' binds; everything after the yield runs on exit, and a finally block there guarantees teardown even on exception. It's the concise way to write one." },
        { q: "\"What resources besides files need context managers in DE?\"", a: "Database and warehouse connections, cursors and transactions, Spark sessions, distributed locks, network sessions, and temp files or directories. Anything you acquire that must be released belongs in a with-block, so an error can't leak it or leave a transaction half-open." }
      ]
    },
    {
      title: "Decorators and *args/**kwargs — cross-cutting concerns without duplication",
      badge: "advanced",
      conceptLabel: "What it is:",
      concept: "A decorator is a function that wraps another function to add behavior without touching its body. It's the clean way to attach cross-cutting concerns that repeat across a pipeline — retries on a flaky API call, timing and logging, caching, auth checks. You write the concern once and apply it with @retry above any function that needs it.<br><br>To wrap arbitrary functions, decorators use *args and **kwargs: *args captures positional arguments as a tuple, **kwargs captures keyword arguments as a dict, and passing *args, **kwargs through forwards them unchanged. That's what lets one decorator wrap functions with any signature. Use functools.wraps so the wrapped function keeps its name and docstring instead of masquerading as the wrapper.",
      code: "import functools, time\n\ndef retry(times=3, delay=1):\n    def deco(fn):\n        @functools.wraps(fn)\n        def wrapper(*args, **kwargs):\n            for attempt in range(times):\n                try:\n                    return fn(*args, **kwargs)\n                except Exception:\n                    if attempt == times - 1:\n                        raise\n                    time.sleep(delay)\n        return wrapper\n    return deco\n\n@retry(times=5, delay=2)\ndef fetch(url):\n    ...",
      noteLabel: "How it works:",
      note: "The point of a decorator is DRY for behavior that isn't part of the function's logic. Retry logic doesn't belong inside every API call; it's noise that hides the real work. A @retry decorator lifts it out.<br><br>*args/**kwargs are what make the decorator general — the wrapper doesn't know or care what arguments the target takes, it just forwards them. Without them, a decorator would only work on one specific signature.<br><br>Always reach for functools.wraps. Skip it and the wrapped function reports the wrapper's name and loses its docstring, which breaks introspection, logging, and debugging in confusing ways.",
      followups: [
        { q: "\"Give a real DE use case for a decorator.\"", a: "Retries with backoff on a flaky API or warehouse call, timing and logging a task's duration, caching an expensive lookup, or enforcing that a config is loaded before a function runs. Any concern that repeats across many functions but isn't their core logic is a decorator candidate." },
        { q: "\"What do *args and **kwargs actually do?\"", a: "*args gathers extra positional arguments into a tuple; **kwargs gathers extra keyword arguments into a dict. Passing *args, **kwargs onward forwards them unchanged. That's what lets a single decorator or wrapper handle functions of any signature without knowing them in advance." },
        { q: "\"Why is functools.wraps important?\"", a: "Without it, the wrapper replaces the target's metadata — the wrapped function reports the wrapper's name and loses its docstring and signature. That breaks logging, help(), and debuggers. functools.wraps copies that metadata over so the decorated function still looks like itself." }
      ]
    },
    {
      title: "The mutable default argument gotcha, typing, and dataclasses",
      badge: "advanced",
      conceptLabel: "What it is:",
      concept: "The mutable-default trap: a default argument is evaluated once, when the function is defined, not on each call. So def f(x, acc=[]) shares one list across every call — mutate it and the change persists into the next call, a bug that looks like haunted state. The fix is the None sentinel: default to None and create the list inside the function.<br><br>Type hints (def load(rows: list[dict]) -> int) don't change runtime behavior but make code self-documenting and let mypy or your IDE catch mismatches before they run. Dataclasses (@dataclass) turn a class into a typed record with __init__, __repr__, and __eq__ generated for you — perfect for config objects and structured records, far clearer than passing around loose dicts.",
      code: "# BUG: the default list is created once and shared across calls.\ndef append_row(row, batch=[]):\n    batch.append(row)\n    return batch          # grows across unrelated calls!\n\n# FIX: use None as a sentinel, create fresh each call.\ndef append_row(row, batch=None):\n    if batch is None:\n        batch = []\n    batch.append(row)\n    return batch\n\nfrom dataclasses import dataclass\n@dataclass\nclass JobConfig:\n    source: str\n    batch_size: int = 1000",
      noteLabel: "How it works:",
      note: "The mutable default is a favorite interview trap because it exposes whether you understand when defaults are evaluated — once, at definition time. The None-sentinel pattern is the standard fix and you should reach for it automatically with any mutable default (list, dict, set).<br><br>Typing and dataclasses are about making intent explicit. A function signature with hints tells the reader and the type checker exactly what goes in and comes out. A dataclass replaces a bag-of-keys dict — where a typo in a key fails silently — with a real typed object where the mistake is caught. For config and records passed around a pipeline, that clarity pays off fast.",
      followups: [
        { q: "\"Why does def f(x, acc=[]) cause a bug?\"", a: "Because the default list is created once when the function is defined and reused on every call that omits the argument. Mutating it persists across calls, so state leaks between unrelated invocations. Default to None and build the list inside the function instead." },
        { q: "\"Do Python type hints do anything at runtime?\"", a: "No, they're ignored by the interpreter by default — they don't enforce or coerce types. Their value is static: mypy, IDEs, and readers use them to catch mismatches and document intent before the code runs. Runtime validation needs something like pydantic on top." },
        { q: "\"When would you use a dataclass over a dict?\"", a: "For structured records and config where the fields are known — a JobConfig, a parsed row. A dataclass gives typed attributes, a readable repr, and equality for free, and a wrong field name is caught rather than silently returning None like a dict key typo would." }
      ]
    }
  ]
},

pandas: {
  intro: {
    title: "Pandas at scale — vectorization, memory, and knowing when it breaks",
    desc: "Pandas is the default for single-machine tabular work, but using it well at data-engineering scale means vectorizing instead of looping, reading big files in chunks, controlling dtypes and memory, joining and grouping efficiently, chaining methods cleanly, avoiding the SettingWithCopyWarning trap — and, most importantly, recognizing the point where pandas stops being the right tool and PySpark, Polars, or DuckDB take over."
  },
  cards: [
    {
      title: "Vectorization vs iterrows — never loop a DataFrame row by row",
      badge: "fundamentals",
      conceptLabel: "What it is:",
      concept: "Pandas is fast because operations run in vectorized C over whole columns at once (NumPy underneath). df['a'] + df['b'] adds a million pairs in one C-level pass. The cardinal sin is iterating rows with iterrows() or a Python for-loop and computing one row at a time — that pulls every value into slow interpreted Python and boxes it into a Series per row, often 100x–1000x slower than the vectorized equivalent.<br><br>The rule: express the transform as operations on entire columns. Arithmetic, comparisons, string methods via .str, date methods via .dt, and conditional logic via np.where or np.select all vectorize. iterrows() should be a last resort, and apply() a middle ground — cleaner than a loop but still row-wise Python, not truly vectorized.",
      code: "# SLOW: row-by-row Python. Avoid on real data.\nfor i, row in df.iterrows():\n    df.at[i, 'total'] = row['price'] * row['qty']\n\n# FAST: vectorized, one C pass over the columns.\ndf['total'] = df['price'] * df['qty']\n\n# Conditional logic, still vectorized:\nimport numpy as np\ndf['tier'] = np.where(df['total'] > 100, 'high', 'low')",
      noteLabel: "How it works:",
      note: "The instinct from general programming is to loop; in pandas that instinct is the bug. Think in columns, not rows.<br><br>Whenever you catch yourself writing iterrows or a for-loop over a DataFrame, stop and ask what the whole-column operation is. Arithmetic is direct. Text is .str. Dates are .dt. Branching is np.where for two cases or np.select for many. Row-dependent logic that truly can't vectorize is rare.<br><br>If you must go row-wise, apply() is cleaner than iterrows but still Python-speed — treat it as a readability convenience, not a performance solution. 'Vectorize this loop' is one of the most common pandas interview asks precisely because looping is the most common mistake.",
      followups: [
        { q: "\"Why is iterrows so much slower than a vectorized operation?\"", a: "iterrows pulls each row into interpreted Python and constructs a Series object per row, so you pay Python overhead a million times. Vectorized operations run one loop in compiled C over the raw column arrays. The gap is routinely 100x or more." },
        { q: "\"Is df.apply() vectorized?\"", a: "Not really. apply() over rows still calls a Python function once per row, so it's Python-speed — cleaner than iterrows but not truly vectorized. Column-wise apply of a NumPy-friendly function is better. For real speed, express the logic as native column operations or np.where/np.select." },
        { q: "\"How do you vectorize conditional logic across rows?\"", a: "np.where(cond, a, b) for a two-way choice, and np.select([cond1, cond2], [val1, val2], default) for many branches. Both operate on whole columns at C speed and replace a per-row if/else loop. For mapping discrete values, .map with a dict is also vectorized." }
      ]
    },
    {
      title: "Chunked reading of big files — bounding memory in pandas",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "pd.read_csv loads the whole file into memory, so a file near or above your RAM will OOM. The chunksize parameter turns the read into an iterator of DataFrames, each holding chunksize rows, so you process the file piece by piece and never hold it all at once. You aggregate incrementally across chunks — sum partial totals, accumulate group counts — or write each transformed chunk out immediately.<br><br>This is pandas's version of streaming, and it's the standard answer for 'process a big file' when you're staying in pandas. It works when the computation is chunk-local or incrementally combinable. When it isn't — say you need a global sort or a join against another huge dataset — chunking gets awkward and it's a sign you've outgrown pandas.",
      code: "totals = {}\nfor chunk in pd.read_csv('huge.csv', chunksize=100_000):\n    chunk = chunk[chunk['amount'] > 0]          # transform per chunk\n    part = chunk.groupby('user')['amount'].sum() # partial aggregate\n    for user, amt in part.items():\n        totals[user] = totals.get(user, 0) + amt # combine incrementally",
      noteLabel: "How it works:",
      note: "Chunking trades a single big allocation for many small ones, keeping peak memory to one chunk plus your running aggregates.<br><br>It fits naturally when each chunk can be processed independently — filter and write out — or when the aggregate combines across chunks, like sums and counts. Averages you compute as sum-over-count at the end, not per chunk.<br><br>The honest caveat: some operations don't chunk cleanly. A global sort, a distinct count across the whole file, or a join to another large table all want the full dataset at once. When you find yourself fighting chunking to fake a global operation, that's the signal to move to DuckDB, Polars, or Spark, which do this natively.",
      followups: [
        { q: "\"How does chunksize actually help with memory?\"", a: "It makes read_csv return an iterator of DataFrames instead of one giant DataFrame, so you hold only chunksize rows at a time plus whatever you accumulate. Peak memory drops from the whole file to one chunk, which is what lets you process files larger than RAM." },
        { q: "\"What operations don't chunk cleanly?\"", a: "Anything global: a full sort, a distinct/unique count across the whole file, a median, or a join against another large dataset. These need all the data at once, so chunking forces awkward multi-pass workarounds. That difficulty is the signal to move to DuckDB, Polars, or Spark." },
        { q: "\"How do you compute an average across chunks correctly?\"", a: "Not by averaging per-chunk averages — that's wrong when chunks differ in size. Accumulate the running sum and running count separately across chunks, then divide sum by count at the end. Sums and counts combine additively; means don't." }
      ]
    },
    {
      title: "Dtypes and memory — category, downcasting, and reading efficiently",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "Pandas often uses far more memory than necessary because of default dtypes. Object dtype for strings is expensive — each value is a full Python object. int64/float64 are used even when int32 or float32 would do. Fixing dtypes can cut a DataFrame's memory several-fold, which directly raises the ceiling on what fits in single-machine pandas.<br><br>The big levers: convert low-cardinality strings (status, country, category) to the category dtype, which stores them as integer codes plus a small lookup — huge savings when the same values repeat. Downcast numerics to the smallest type that holds the range. And specify dtype (and usecols) in read_csv so you never materialize the wasteful version in the first place. Reading only the columns you need is the cheapest win of all.",
      code: "# Specify dtypes and columns at read time — cheapest win.\ndf = pd.read_csv(\n    'data.csv',\n    usecols=['user', 'status', 'amount'],\n    dtype={'status': 'category', 'amount': 'float32'},\n)\n\n# Or fix after loading:\ndf['status'] = df['status'].astype('category')\ndf['count'] = pd.to_numeric(df['count'], downcast='integer')\nprint(df.memory_usage(deep=True))  # inspect real usage",
      noteLabel: "How it works:",
      note: "The mindset is that dtypes are a memory budget you control, not a default you accept.<br><br>Category is the highest-leverage change for real data, because DE tables are full of repeated low-cardinality strings — status codes, country, product type. Storing those as integer codes instead of full string objects can cut memory dramatically and speed up groupby too.<br><br>Downcasting numerics helps when you know the range fits a smaller type. And the cheapest optimization is simply not reading columns you don't need — usecols — and setting dtypes at read time so the bloated version never exists. Use memory_usage(deep=True) to see where the bytes actually go before optimizing.",
      followups: [
        { q: "\"When does the category dtype help, and when does it hurt?\"", a: "It helps a lot when a string column has low cardinality — few distinct values repeated many times, like status or country — storing integer codes plus a small map. It hurts when cardinality is high (near-unique values like IDs), where the code map is as big as the data with added overhead." },
        { q: "\"Why is object dtype for strings expensive?\"", a: "Each value is a separate full Python string object with per-object overhead, and the column is an array of pointers to them. That's far heavier than a fixed-width numeric array. Converting to category, or using the newer pyarrow-backed string dtype, cuts that overhead substantially." },
        { q: "\"What's the single cheapest memory optimization when reading a file?\"", a: "Reading only the columns you actually need with usecols — you never pay for the rest at all. Combined with setting dtypes at read time so the wasteful default version is never materialized, you avoid the memory instead of fixing it after the fact." }
      ]
    },
    {
      title: "Merge, groupby, method chaining, and SettingWithCopyWarning",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "merge is pandas's join: specify on/left_on/right_on and how ('inner', 'left', etc.). The trap is fan-out — if the right key isn't unique, rows multiply, silently inflating counts and sums, the pandas version of a bad SQL join. Validate cardinality (merge has a validate= argument) when correctness matters. groupby(...).agg(...) is the split-apply-combine workhorse; passing a dict lets you aggregate multiple columns with named outputs cleanly.<br><br>Method chaining (df.assign(...).query(...).groupby(...)) reads top-to-bottom like a pipeline and avoids intermediate variables. The SettingWithCopyWarning appears when you assign to what might be a view of a slice, so pandas can't tell if you're editing the original or a copy — the fix is .loc for assignment, or .copy() when you deliberately want an independent frame.",
      code: "# Guard against fan-out with validate=\norders = orders.merge(users, on='user_id', how='left',\n                       validate='many_to_one')\n\n# groupby with named, multi-column aggregation\nsummary = (orders\n    .query('amount > 0')\n    .groupby('user_id')\n    .agg(total=('amount', 'sum'), n=('order_id', 'count'))\n    .reset_index())\n\n# Avoid SettingWithCopyWarning: assign via .loc, not chained []\ndf.loc[df['amount'] < 0, 'amount'] = 0",
      noteLabel: "How it works:",
      note: "On merge, the failure mode to watch is the same as in SQL: a non-unique key on the 'one' side fans rows out and quietly corrupts every downstream aggregate. The validate= argument turns that silent bug into a loud error, and it's a senior habit to use it on joins that matter.<br><br>Method chaining is about readability — each step is a clear transformation, no throwaway df2, df3 variables. It also plays well with .pipe() for inserting custom functions.<br><br>SettingWithCopyWarning is pandas warning you that an assignment might be hitting a copy, so it may not do what you think. Don't silence it — fix it: use .loc[rows, cols] = value for conditional assignment, and .copy() when you slice a frame you intend to modify independently.",
      followups: [
        { q: "\"What causes fan-out in a merge and how do you catch it?\"", a: "A non-unique key on the side you're joining to: each left row matches multiple right rows, so rows multiply and sums/counts inflate. Catch it with merge's validate= argument (like 'many_to_one'), which raises if the cardinality assumption is violated instead of silently corrupting the result." },
        { q: "\"What does SettingWithCopyWarning actually mean?\"", a: "You assigned to something that might be a view of a slice rather than the original frame, so pandas can't guarantee the write lands where you intend. The fix is to assign with .loc[rows, cols] on the real frame, or to take an explicit .copy() when you meant to work on an independent slice." },
        { q: "\"Why prefer method chaining over intermediate variables?\"", a: "It reads as a top-to-bottom pipeline of transformations with no throwaway df2/df3 to track or accidentally reuse, which makes the flow and the bugs easier to see. Combined with .assign, .query, and .pipe, the whole transform is one readable expression." }
      ]
    },
    {
      title: "When pandas breaks down — reaching for PySpark, Polars, or DuckDB",
      badge: "advanced",
      conceptLabel: "What it is:",
      concept: "Pandas has hard limits, and a senior DE knows them. It's single-machine and single-threaded for most operations, and it's memory-hungry — the working set often needs several times the data size, so it struggles well before you literally run out of RAM. When a dataset stops fitting comfortably on one machine, or transforms get painfully slow, pandas is the wrong tool.<br><br>The alternatives: Polars is a Rust-based DataFrame library — multi-threaded, columnar (Arrow), with lazy evaluation and query optimization, often 5–30x faster than pandas on one machine and far more memory-efficient. DuckDB is an in-process analytical SQL engine that queries Parquet/CSV directly, spills to disk, and is superb for out-of-core SQL on a laptop. PySpark is for genuinely distributed, cluster-scale data. The order of escalation is usually pandas -> Polars/DuckDB (bigger single machine) -> Spark (multi-machine).",
      noteLabel: "How it works:",
      note: "The senior move is matching the tool to the data size and staying one step ahead of the pain, not defaulting to Spark for everything.<br><br>For data that fits on one machine but strains pandas, Polars or DuckDB is usually the answer — same laptop, multithreaded, far more efficient, no cluster to manage. Reaching for Spark too early adds serious operational overhead (a cluster, shuffles, tuning) you don't need until the data is truly distributed-scale.<br><br>A pragmatic pattern: use DuckDB to run SQL directly over Parquet files that don't fit in pandas, or Polars' lazy API to get query-optimizer benefits on one box. Escalate to Spark only when a single big machine genuinely can't hold or process the data. Right-sizing the engine is a strong senior signal.",
      followups: [
        { q: "\"How do you know it's time to leave pandas?\"", a: "When the working set no longer fits comfortably in RAM (remember pandas needs several times the data size), when transforms are painfully slow despite vectorization, or when you're contorting code to chunk around a global operation. Those are the signs to move to Polars, DuckDB, or Spark." },
        { q: "\"Polars or DuckDB or Spark — how do you choose?\"", a: "If it fits on one machine, prefer Polars or DuckDB — multithreaded, memory-efficient, no cluster. DuckDB shines when you want SQL over Parquet/CSV and can spill to disk; Polars when you want a fast DataFrame API with lazy optimization. Reach for Spark only when the data is genuinely too big for one machine." },
        { q: "\"Why not just use Spark for everything?\"", a: "Because Spark brings real overhead — a cluster to run and tune, shuffles, JVM startup, distributed debugging — that's wasteful for data a single machine can handle. For laptop- to server-scale data, Polars or DuckDB is faster to run and far simpler to operate. Match the tool to the actual scale." }
      ]
    }
  ]
},

performance: {
  intro: {
    title: "Performance — memory, vectorization, the GIL, and reaching for the right engine",
    desc: "How senior DEs make Python fast enough and light enough: streaming to bound memory, vectorizing to avoid interpreted loops, killing quadratic algorithms, profiling before optimizing, understanding the GIL and when multiprocessing versus threading actually helps, choosing efficient file formats like Parquet, and knowing the point to push work out to PySpark, Polars, or DuckDB."
  },
  cards: [
    {
      title: "Bounding memory with streaming and generators",
      badge: "fundamentals",
      conceptLabel: "What it is:",
      concept: "The first performance concern in DE isn't speed, it's memory — a job that OOMs doesn't finish at all. The core technique is streaming: process data as a flow of records rather than loading it all at once. Generators, file iteration (for line in f), and chunked reads keep peak memory bounded to one record or chunk plus your accumulators, regardless of total input size.<br><br>The discipline is to never call something that materializes the whole dataset unless you're sure it fits — no readlines() on a giant file, no list() around a huge generator, no toPandas() on a big Spark frame, no unbounded accumulation into a dict. If you can express the job as 'pull one, process, discard,' memory stops being the limiting factor and you can handle inputs far larger than RAM.",
      noteLabel: "How it works:",
      note: "Ask of any big-data step: what's the largest thing this holds in memory at once? If the answer scales with the input, that's your risk.<br><br>Streaming pushes that peak down to a single record or chunk. The traps are the operations that quietly break the stream: sorting (needs everything), a global distinct (needs to remember everything), or grouping into a growing dict by a high-cardinality key. Those re-introduce unbounded memory even inside a streaming loop.<br><br>When a genuinely global operation is unavoidable and the data won't fit, that's when you push down to an engine — a warehouse, DuckDB, or Spark — that handles spill-to-disk for you rather than trying to force it in Python.",
      followups: [
        { q: "\"What operations quietly break a streaming approach?\"", a: "Anything needing the whole dataset at once: a global sort, a distinct/unique count, a median, or grouping into a dict by a high-cardinality key. Each re-introduces unbounded memory even inside a streaming loop. When these are unavoidable at scale, push down to an engine that spills to disk." },
        { q: "\"What calls should raise a red flag on big data?\"", a: "readlines() or read() on a huge file, list() around a large generator, df.collect() or toPandas() on a big Spark frame, and unbounded growth of a dict or list. Each materializes the full dataset. On data near or above RAM, they're how a job OOMs." },
        { q: "\"Streaming bounds input memory — what about the output or state?\"", a: "Streaming only bounds what you read, not what you accumulate. A running sum is fine, but a growing set or a group-by dict scales with cardinality and can still blow up. Watch your accumulators as carefully as your input, and offload large state to disk or an engine when needed." }
      ]
    },
    {
      title: "Vectorization and killing quadratic loops",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "Two speed problems dominate DE Python. First, interpreted loops over data that should be vectorized — a Python for-loop doing arithmetic row by row is 100x+ slower than the NumPy/pandas column operation, because the vectorized version runs in compiled C. Second, accidental quadratic complexity — most often repeated membership checks against a list inside a loop, turning O(n) into O(n²), which is invisible on 100 rows and catastrophic on a million.<br><br>The fixes are simple once you see them. For vectorization, express the transform over whole arrays/columns instead of element by element. For quadratic loops, use the right data structure — a set for membership, a dict for lookups — so each check is O(1) instead of O(n). Both are about not doing in slow interpreted Python what a C library or a hash table does far faster.",
      code: "# O(n*m): nested lookup against a list. Quadratic.\nresult = [r for r in rows if r.id in valid_ids_list]\n\n# O(n): hash the lookup set once, membership is O(1).\nvalid = set(valid_ids_list)\nresult = [r for r in rows if r.id in valid]\n\n# Vectorize numeric work instead of looping:\nimport numpy as np\narr = np.array(values)\nscaled = arr * 1.05        # one C pass, not a Python loop",
      noteLabel: "How it works:",
      note: "These two show up constantly and both have clean answers. When you see a loop doing math over rows, the fix is vectorization — push it to NumPy or pandas columns. When a job is mysteriously slow and gets worse as data grows faster than linearly, suspect a quadratic: a list membership test or a nested loop join in Python.<br><br>The quadratic fix is almost always a data-structure swap — set for 'have I seen it,' dict for 'look it up by key.' Converting one list to a set can turn a job from minutes to seconds and change the complexity class outright.<br><br>The meta-skill is recognizing the shape: interpreted loop over data = vectorize; repeated scan inside a loop = hash it.",
      followups: [
        { q: "\"How do you spot an accidental O(n²) in Python?\"", a: "Look for a scan inside a loop: 'x in some_list', a nested for-loop joining two collections, or repeatedly rebuilding something per iteration. The tell at runtime is that time grows much faster than the data. The usual fix is a set or dict to make the inner check O(1)." },
        { q: "\"Why is a Python loop so much slower than a NumPy operation?\"", a: "The Python loop runs interpreted bytecode with per-element object overhead and dynamic typing on every iteration. NumPy runs one loop in compiled C over a contiguous typed array. That's why the same arithmetic is often 100x faster vectorized — the work moves out of the interpreter." },
        { q: "\"When is a plain Python loop actually fine?\"", a: "When the data is small, when the per-item work is genuinely non-vectorizable (calling an external API, complex branching), or when clarity matters more than microseconds. The rule is about big data and hot paths; over a few hundred items a readable loop is perfectly fine." }
      ]
    },
    {
      title: "Profiling before optimizing — cProfile and measuring first",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "The cardinal rule of performance is measure before you optimize — intuition about where time goes is usually wrong, and optimizing the wrong thing wastes effort while the real bottleneck sits untouched. cProfile is Python's built-in deterministic profiler: it reports how many times each function was called and how much cumulative time each took, so you find the actual hot spot instead of guessing.<br><br>For line-level detail there's line_profiler, and for memory there's memory_profiler or tracemalloc to find what's allocating. The workflow is always the same: profile to find the bottleneck, fix that one thing, then profile again to confirm it moved. Optimizing without profiling is how you spend a day speeding up code that was never the problem.",
      code: "import cProfile, pstats\n\ncProfile.run('run_pipeline()', 'stats.out')\np = pstats.Stats('stats.out')\np.sort_stats('cumulative').print_stats(10)  # top 10 by cumulative time\n\n# Quick one-liner from the shell:\n# python -m cProfile -s cumtime my_job.py",
      noteLabel: "How it works:",
      note: "The senior instinct is to resist optimizing on a hunch. Profile first, always — the bottleneck is frequently somewhere you didn't expect, like a surprise per-row API call or a repeated file read.<br><br>Sort by cumulative time to find where the wall-clock actually goes, fix the single biggest contributor, then re-profile to confirm the needle moved and find the new top item. Optimization is iterative and evidence-driven.<br><br>Match the tool to the question: cProfile for which function, line_profiler for which line, memory_profiler or tracemalloc for what's eating RAM. And know when to stop — once the job is fast enough for its SLA, further micro-optimization is wasted effort better spent elsewhere.",
      followups: [
        { q: "\"Why profile before optimizing?\"", a: "Because intuition about bottlenecks is usually wrong, and optimizing the wrong code wastes time while the real hot spot stays slow. Profiling shows where wall-clock time actually goes, so you fix the thing that matters. Measure, fix, measure again — never guess." },
        { q: "\"What does cProfile tell you, and what doesn't it?\"", a: "It tells you per-function call counts and cumulative/total time, so you find which function dominates. It doesn't give line-level detail (use line_profiler) or memory usage (use memory_profiler/tracemalloc). It's the first-pass tool to locate the hot function before drilling in." },
        { q: "\"How do you know when to stop optimizing?\"", a: "When the job comfortably meets its SLA or the cost/runtime is acceptable. Beyond that, more micro-optimization is effort better spent elsewhere. Performance work should be driven by a real requirement, not by chasing a faster number for its own sake." }
      ]
    },
    {
      title: "The GIL — multiprocessing vs threading, and when each helps",
      badge: "advanced",
      conceptLabel: "What it is:",
      concept: "The Global Interpreter Lock (GIL) is a mutex in CPython that lets only one thread execute Python bytecode at a time. The consequence: threads do NOT give you parallel CPU — a CPU-bound job across many threads runs about as fast as one thread, because they take turns holding the GIL. But threads DO help I/O-bound work, because a thread releases the GIL while waiting on network or disk, letting another run. So threading is for I/O concurrency (many API calls, many file reads), not CPU parallelism.<br><br>For CPU-bound parallelism you use multiprocessing: separate processes, each with its own interpreter and its own GIL, running truly in parallel across cores — at the cost of process overhead and inter-process data copying. The rule of thumb: threads for I/O-bound, processes for CPU-bound. (Note: NumPy/pandas already release the GIL in their C code, and newer Python offers a no-GIL build, but the classic model still frames the interview answer.)",
      code: "# I/O-bound: many API/file calls -> threads (GIL released on I/O wait)\nfrom concurrent.futures import ThreadPoolExecutor\nwith ThreadPoolExecutor(max_workers=16) as ex:\n    results = list(ex.map(fetch_url, urls))\n\n# CPU-bound: heavy pure-Python compute -> processes (own GIL each)\nfrom concurrent.futures import ProcessPoolExecutor\nwith ProcessPoolExecutor(max_workers=8) as ex:\n    results = list(ex.map(heavy_transform, chunks))",
      noteLabel: "How it works:",
      note: "The GIL is a favorite senior question because it separates people who've hit real concurrency from those who've read about it.<br><br>The clean framing: threading helps when your threads spend time waiting (network, disk, DB) because the GIL is released during that wait, so you overlap the waits. Threading does not speed up pure Python computation, because only one thread runs bytecode at a time. For that you need multiprocessing, which sidesteps the GIL with separate interpreters and runs truly parallel on multiple cores.<br><br>In practice, a lot of DE 'CPU-bound' work is really inside NumPy/pandas/Arrow, which already release the GIL, so threads can help there too. And for genuinely large parallel compute, the honest answer is often not multiprocessing at all — it's pushing the work to Spark or the warehouse.",
      followups: [
        { q: "\"Why doesn't threading speed up CPU-bound Python?\"", a: "Because the GIL lets only one thread execute Python bytecode at a time, so CPU-bound threads just take turns — no real parallelism. They run about as fast as a single thread plus switching overhead. For CPU parallelism you need multiprocessing, where each process has its own GIL." },
        { q: "\"So when does threading actually help?\"", a: "For I/O-bound work — many network calls, DB queries, or file reads — because a thread releases the GIL while it waits on I/O, letting others run. You overlap the waiting, not the computing. Fetching 100 URLs concurrently is the classic win for threads." },
        { q: "\"When is multiprocessing NOT the right answer for CPU work?\"", a: "When the heavy compute is already in NumPy/pandas/Arrow (which release the GIL, so threads suffice), when process startup and data-copying overhead outweighs the gain on small tasks, or when the data is large enough that pushing it to Spark or the warehouse is the real solution instead of local processes." }
      ]
    },
    {
      title: "Efficient file formats and pushing work to the right engine",
      badge: "advanced",
      conceptLabel: "What it is:",
      concept: "File format is a performance lever people underrate. CSV is row-oriented, untyped, uncompressed, and forces reading every column — slow and bloated at scale. Parquet is columnar, compressed, and typed: you read only the columns you need (projection pushdown) and can skip row groups by statistics (predicate pushdown), so analytical reads are dramatically faster and smaller. For data engineering, Parquet is the default for anything but tiny interchange files, and it carries its schema so you don't re-infer dtypes every read.<br><br>The bigger principle is pushdown: do the work where it's cheapest. Filter and aggregate in the warehouse or in DuckDB against Parquet before pulling into Python, rather than dragging raw rows into pandas and processing there. The fastest Python code is often the code you don't run because you pushed the work down to an engine built for it.",
      code: "# Columnar + compressed + typed. Read only what you need.\ndf.to_parquet('out.parquet', compression='snappy')\ndf = pd.read_parquet('out.parquet', columns=['user', 'amount'])\n\n# Push the filter+aggregate down to DuckDB over Parquet on disk\nimport duckdb\ndf = duckdb.sql(\"\"\"\n    SELECT user, sum(amount) AS total\n    FROM 'events/*.parquet'\n    WHERE amount > 0\n    GROUP BY user\n\"\"\").df()   # only the small result comes into pandas",
      noteLabel: "How it works:",
      note: "Two habits give outsized returns. First, default to Parquet over CSV for anything at scale — columnar reads, compression, and embedded schema make it faster and lighter, and column/row-group pruning means you touch only the data you need.<br><br>Second, push work down. Instead of pulling millions of raw rows into pandas and filtering there, let DuckDB or the warehouse do the filter and aggregate against the Parquet or table, and bring back only the small result. You move less data and use an engine optimized for the operation.<br><br>The senior framing is that Python is the coordinator: it decides what work happens where, and the best-performing pipelines do the heavy scanning and grouping in a columnar engine, reserving Python for glue and the final light touches.",
      followups: [
        { q: "\"Why is Parquet faster than CSV for analytics?\"", a: "It's columnar, so you read only the columns you query instead of every field in every row; it's compressed, so there's less I/O; it's typed, so no dtype re-inference; and row-group statistics let readers skip chunks that can't match a filter. CSV forces a full, untyped, uncompressed scan." },
        { q: "\"What does 'pushdown' mean and why does it help?\"", a: "Pushdown means doing filtering, column selection, and aggregation as close to the storage/engine as possible — in the warehouse or DuckDB over Parquet — so only the small result travels into Python. You move and process far less data than pulling raw rows into pandas and filtering there." },
        { q: "\"When would you still use CSV?\"", a: "For small files, human-readable interchange, quick debugging, or when a downstream system only accepts CSV. It's fine at tiny scale. For any real data-engineering volume, Parquet's columnar reads, compression, and schema make it the default — CSV becomes a liability as size grows." }
      ]
    }
  ]
},

testing: {
  intro: {
    title: "Testing data pipelines — pytest, pure transforms, mocking, and CI",
    desc: "How to make pipeline code trustworthy and changeable: pytest with fixtures and parametrize, the key move of factoring transforms into pure functions you can unit-test, mocking IO so tests are fast and deterministic, integration tests for the wiring, getting logic out of notebooks, and running it all in CI so nothing merges broken."
  },
  cards: [
    {
      title: "pytest essentials — fixtures and parametrize",
      badge: "fundamentals",
      conceptLabel: "What it is:",
      concept: "pytest is the standard Python test framework because tests are just functions with plain assert statements — no boilerplate class hierarchy. Two features carry most DE testing. Fixtures (@pytest.fixture) provide reusable setup — a sample DataFrame, a temp directory, a fake connection — injected into any test that names them as an argument, so setup is defined once and shared. Parametrize (@pytest.mark.parametrize) runs the same test over many input/expected pairs, so you cover edge cases (empty input, nulls, negatives, duplicates) without copy-pasting the test body.<br><br>Together they make it cheap to test a transform against a table of cases, which is exactly the shape of most data-quality logic: given this input row, expect this output.",
      code: "import pytest\n\n@pytest.fixture\ndef sample_rows():\n    return [{'amount': 10}, {'amount': -5}, {'amount': 0}]\n\n@pytest.mark.parametrize('amount, expected', [\n    (10, 10), (-5, 0), (0, 0),        # negatives clamp to 0\n])\ndef test_clamp(amount, expected):\n    assert clamp_negative(amount) == expected",
      noteLabel: "How it works:",
      note: "The workflow is: write the transform as a function, then assert its output over a table of cases. pytest makes that nearly frictionless.<br><br>Fixtures keep tests DRY — build the sample data or the temp resource once and inject it everywhere. Use tmp_path (a built-in fixture) for tests that touch the filesystem so they clean up after themselves.<br><br>Parametrize is where data testing shines, because data logic is all about edge cases: empty input, nulls, negatives, duplicates, boundary values. Listing them as parameters gives broad coverage in a few lines, and each case reports as its own pass/fail so you see exactly which input broke.",
      followups: [
        { q: "\"What's a pytest fixture for?\"", a: "Reusable setup injected into tests by naming it as an argument — a sample DataFrame, a temp dir, a fake client. It's defined once and shared, so tests stay DRY, and fixtures can handle teardown too. Built-ins like tmp_path give you a clean temp directory per test automatically." },
        { q: "\"When do you reach for parametrize?\"", a: "When the same assertion should run over many input/expected pairs — edge cases like empty, null, negative, duplicate, and boundary values. It avoids copy-pasting the test body, and each case reports separately so you see exactly which input failed. It's ideal for testing transforms." },
        { q: "\"Why pytest over unittest?\"", a: "Less boilerplate — plain functions and assert instead of TestCase classes and assertEqual methods — plus powerful fixtures, parametrize, and a rich plugin ecosystem. It's the de facto standard in modern Python. unittest still works, but pytest expresses the same tests more concisely." }
      ]
    },
    {
      title: "Unit-testing transforms as pure functions — the key move",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "The single most important testability practice in DE is separating the transformation logic from the IO. A pure function takes data in and returns data out with no side effects — it doesn't read a file, hit a database, or call an API. Because it's pure, you can test it with an in-memory input and assert on the output: no fixtures for external systems, no network, fast and deterministic.<br><br>The anti-pattern is a monolithic function that reads from S3, transforms, and writes to the warehouse all in one body — you can't test the logic without standing up S3 and a warehouse. The fix is to split it: read_data() (IO), transform_data(df) (pure), write_data(df) (IO). Now the transform, where the real logic and bugs live, is trivially unit-testable, and the thin IO wrappers get covered by integration tests.",
      code: "# Hard to test: IO and logic tangled together.\ndef run(): \n    df = pd.read_parquet(s3_path)\n    df = df[df.amount > 0].assign(net=lambda d: d.amount * 0.97)\n    df.to_sql('t', engine)\n\n# Testable: pure transform separated from IO.\ndef transform(df):                     # pure: DataFrame in, out\n    return df[df.amount > 0].assign(net=lambda d: d.amount * 0.97)\n\ndef run():\n    write(transform(read()))           # IO at the edges\n\ndef test_transform():\n    out = transform(pd.DataFrame({'amount': [10, -1]}))\n    assert out['net'].tolist() == [9.7]",
      noteLabel: "How it works:",
      note: "This is the highest-leverage answer to 'how do you make a pipeline testable,' and it's a strong senior signal in an interview.<br><br>The principle is IO at the edges, logic in the middle. Keep reads and writes in thin wrapper functions and put all the real transformation in pure functions that take a DataFrame (or records) and return one. Those pure functions carry the business logic — and the bugs — so making them testable is where testing pays off.<br><br>Once the transform is pure, a unit test is just: construct a small input including the tricky cases, call the function, assert the output. No mocks, no infrastructure, runs in milliseconds. The IO wrappers, being thin, need only light integration coverage.",
      followups: [
        { q: "\"What makes a function 'pure' and why does it matter for testing?\"", a: "It depends only on its inputs and returns a value with no side effects — no file reads, DB writes, or API calls. That means you can test it with in-memory data and assert the output, with no infrastructure, no mocks, and fully deterministic results. It's the cleanest thing to test." },
        { q: "\"How do you refactor a monolithic read-transform-write function?\"", a: "Split it into three: an IO function to read, a pure function to transform, an IO function to write, with the runner wiring them. The transform holds the logic and becomes trivially unit-testable; the thin IO wrappers get integration coverage. It's the standard move for testability." },
        { q: "\"Where do the bugs usually live, and does that guide testing?\"", a: "In the transformation logic — the filters, joins, aggregations, edge-case handling — not in the thin read/write calls. So concentrate unit tests on the pure transforms where bugs hide, and use lighter integration tests for the IO wiring. Test where the risk actually is." }
      ]
    },
    {
      title: "Mocking IO and external systems",
      badge: "intermediate",
      conceptLabel: "What it is:",
      concept: "Even with logic factored into pure functions, some code has to touch the outside world — an API client, a warehouse write, a file read in a wrapper. To test that code without the real system, you mock it: replace the external call with a stand-in that returns canned data or records how it was called. unittest.mock (and pytest's monkeypatch) let you patch a function or object so the test runs fast, deterministically, and offline.<br><br>The judgment is what to mock. Mock slow, external, or non-deterministic dependencies — network, cloud storage, time, randomness. Don't mock the thing you're actually testing, and don't over-mock to the point the test just asserts your mocks were called and proves nothing real. The best-tested pipelines minimize how much needs mocking by keeping logic pure; mocks then cover only the thin IO edges.",
      code: "from unittest.mock import patch, MagicMock\n\ndef test_load_calls_warehouse():\n    fake_conn = MagicMock()\n    with patch('mymod.get_connection', return_value=fake_conn):\n        load_rows([{'id': 1}])\n    fake_conn.execute.assert_called_once()   # verify the IO happened\n\n# monkeypatch (pytest) to stub a slow API call:\ndef test_fetch(monkeypatch):\n    monkeypatch.setattr('mymod.requests.get',\n                        lambda url: MagicMock(json=lambda: {'ok': True}))\n    assert fetch()['ok'] is True",
      noteLabel: "How it works:",
      note: "Mock the boundary, not the logic. The point is to make tests fast and deterministic by cutting out the slow, flaky, or external parts — the network, the cloud, the clock — while still exercising your code around them.<br><br>A key subtlety is patching in the right place: patch where the name is used, not where it's defined, or the patch won't take effect. That trips people up constantly.<br><br>The warning is over-mocking. If a test mocks so much that it only verifies your mocks were called in the order you told them to, it tests your assumptions, not the system. Keep logic pure so most tests need no mocks at all, and reserve mocking for the genuine IO edges where there's no alternative.",
      followups: [
        { q: "\"What should you mock and what should you not?\"", a: "Mock slow, external, or non-deterministic dependencies — network, cloud storage, databases, time, randomness. Don't mock the code under test itself, and avoid mocking so much that the test only checks your mocks. Keeping logic pure minimizes what needs mocking in the first place." },
        { q: "\"What's the classic mocking mistake?\"", a: "Patching where the object is defined instead of where it's used — patch 'mymod.requests.get' (where your code looks it up), not 'requests.get' globally, or the patch may not take. The other is over-mocking until the test verifies only the mocks, proving nothing about real behavior." },
        { q: "\"How do you test code that depends on the current time or randomness?\"", a: "Mock them — patch the clock (or freeze time) and seed or patch the random source so results are deterministic. Better yet, pass time or a random seed in as a parameter so the function is pure and you can just supply a fixed value in the test, no mocking needed." }
      ]
    },
    {
      title: "Integration tests, notebooks, and CI",
      badge: "advanced",
      conceptLabel: "What it is:",
      concept: "Unit tests prove each pure transform is correct; integration tests prove the pieces are wired together correctly — read, transform, and write actually connect, the schema matches, the query runs. You run these against a lightweight real system: a local Postgres or DuckDB, a temp file, a test schema — not production. They're slower and fewer than unit tests (the data test pyramid again: many fast unit tests, fewer integration tests).<br><br>Two operational practices complete the picture. Get logic out of notebooks: exploratory notebooks are great for analysis but terrible as production code — untestable, unversioned execution order, hidden state. Move the real transforms into importable, tested modules the notebook (or pipeline) calls. And run everything in CI: on every pull request, execute the test suite and linters so broken logic can't merge. Tests that don't run in CI rot.",
      noteLabel: "How it works:",
      note: "The layering mirrors the software test pyramid. A wide base of fast unit tests on pure transforms, a thinner layer of integration tests that check the wiring against a local database or temp files, and you deliberately keep the slow end-to-end checks few.<br><br>Notebooks are the recurring DE trap. They're perfect for exploration and a menace as production code: cells run out of order, state hides between them, nothing is versioned or tested. The fix is to factor the real logic into a module with functions you can import and test, and let the notebook be a thin caller. Then the same code runs in the pipeline and under pytest.<br><br>CI is what makes tests matter. If the suite and linters run on every PR, a regression can't merge. Tests that only run when someone remembers to run them locally quietly stop running — and then quietly stop passing.",
      followups: [
        { q: "\"Unit vs integration test — what's the split for a pipeline?\"", a: "Unit tests cover the pure transforms in isolation — fast, many, no infrastructure. Integration tests cover the wiring — read/transform/write connecting correctly, schemas matching, queries running — against a local Postgres or DuckDB. Follow the pyramid: many unit tests, fewer integration tests, minimal end-to-end." },
        { q: "\"Why is production logic in notebooks a problem?\"", a: "Cells can run out of order, state hides between them, execution isn't reproducible, and none of it is versioned or testable. It's great for exploration but fragile as production code. Move the real transforms into importable, tested modules and let the notebook be a thin caller." },
        { q: "\"Why does running tests in CI matter so much?\"", a: "Because tests that depend on someone remembering to run them locally quietly stop running, then quietly stop passing. CI runs the suite and linters on every PR automatically, so a regression can't merge. It's what turns tests from good intentions into an actual safety net." }
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — the classic Python-for-DE questions",
    desc: "The spoken questions a mid-to-senior DE gets on Python. Form your own answer first, then compare — the score is in the constraint you name, the trade-off you weigh, and the failure mode you head off. Answers are first-person and framed on real pipeline work."
  },
  cards: [
    {
      title: "\"Generator vs list for reading a large file — which and why?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand lazy evaluation and treat memory as a real constraint, or reach for a list by reflex. The interviewer wants to hear that a generator bounds memory to one record while a list materializes everything, plus the single-pass caveat.",
      noteLabel: "Model answer:",
      note: "\"A generator, for anything large.<br><br>A list comprehension materializes the whole file in memory at once — for a big file that's how you OOM. A generator produces records lazily, one at a time, so I only ever hold the current record plus whatever I'm accumulating. Memory stays flat regardless of file size, which is exactly what I want when the file is bigger than RAM.<br><br>Concretely, file objects are already lazy, so 'for line in f' streams. I wrap parsing and filtering as generators too, and chain them into a pipeline where each record flows through and is discarded.<br><br>The one caveat I keep in mind is that a generator is single-pass — once consumed it's exhausted. If I genuinely need multiple passes over the data, I have to either recreate the generator or accept the memory of a list. But for a straight read-process-write over a big file, the generator is the right call.\"",
      followups: [
        { q: "\"When would the list actually be the better choice?\"", a: "When the data fits in memory and I need more than one pass — indexing into it, taking its length, or iterating several times. A generator gives none of those and is exhausted after one pass. If it's small and reused, the list is simpler and correct." },
        { q: "\"Does the generator bound all memory, or just the input?\"", a: "Just the input — I hold one record at a time. Any state I accumulate still grows: a running sum is fine, but grouping into a dict by a high-cardinality key can blow up regardless of streaming. I watch the accumulators as carefully as the input." },
        { q: "\"How do you chain generators for a transform pipeline?\"", a: "Each stage is a generator taking an iterable and yielding a transformed one — read, then parse, then filter, then map. I pass each into the next. Nothing computes until the final consumer pulls, and data moves through one record at a time with flat memory." }
      ]
    },
    {
      title: "\"How do you process a file too big to fit in memory?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "The single most common Python-for-DE question. They want streaming as the instinct, the operations that break streaming, and the judgment to escalate to an engine when a global operation makes streaming impractical.",
      noteLabel: "Model answer:",
      note: "\"I stream it — I never load the whole thing.<br><br>I read it as a flow of records: line by line for text, or in chunks with pandas' chunksize for tabular data. I process each piece and either write it out immediately or fold it into a running aggregate, so peak memory is one chunk plus my accumulators, not the whole file. That handles inputs far larger than RAM.<br><br>The thing I watch for is operations that don't stream cleanly: a global sort, a distinct count across everything, a median, or a join to another large dataset. Those want all the data at once, and forcing them through chunking gets ugly fast.<br><br>When I hit one of those at real scale, that's my signal to stop fighting pandas and push the work to an engine built for it — DuckDB running SQL directly over the file with spill-to-disk, Polars, or Spark if it's truly distributed-scale. Match the tool to the operation.\"",
      followups: [
        { q: "\"How do you aggregate across chunks correctly?\"", a: "Combine additively — accumulate running sums and counts across chunks, then compute derived metrics at the end. For an average I keep sum and count separately and divide once at the end, never average per-chunk averages, which is wrong when chunk sizes differ." },
        { q: "\"At what point do you leave pandas chunking for DuckDB or Spark?\"", a: "When the operation is inherently global — a full sort, distinct across everything, or a big join — so chunking forces awkward multi-pass hacks, or when the data is simply too big to process on one machine. DuckDB or Polars for single-machine out-of-core, Spark for distributed." },
        { q: "\"What does DuckDB give you here that pandas doesn't?\"", a: "It runs SQL directly over Parquet or CSV on disk, reads only the columns and row groups it needs, and spills to disk automatically, so it handles larger-than-memory queries without manual chunking. I get the global operations — sort, join, distinct — for free instead of hand-rolling them." }
      ]
    },
    {
      title: "\"Here's a slow pandas loop — how would you speed it up?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether vectorization is your reflex. They want you to recognize that a row-by-row loop or iterrows is the problem and replace it with whole-column operations, and to know where apply and np.where fit.",
      noteLabel: "Model answer:",
      note: "\"First thing I look for is a row-by-row loop — iterrows or a Python for-loop over the DataFrame — because that's almost always the bottleneck. It pulls every value into interpreted Python and boxes it per row, so it's routinely a hundred times slower than the vectorized equivalent.<br><br>The fix is to express the transform over whole columns. Arithmetic like price times quantity is just df['price'] * df['qty'] in one C-level pass. Text is .str, dates are .dt. For conditional logic I use np.where for a two-way choice or np.select for many branches, both vectorized.<br><br>If the logic genuinely resists vectorizing, apply() is a cleaner middle ground than iterrows, but I'm honest that it's still Python-speed, not a real fix. And if the data is large enough that even vectorized pandas struggles, that's when I'd move to Polars or push the aggregation into DuckDB or the warehouse.<br><br>So: kill the loop, think in columns, and escalate the engine only if vectorized pandas still isn't enough.\"",
      followups: [
        { q: "\"Is apply a real fix for a slow loop?\"", a: "Not really — row-wise apply still calls a Python function per row, so it's Python-speed, just cleaner to read than iterrows. It's a middle ground, not a performance solution. For real speed I express the logic as native column operations or np.where/np.select." },
        { q: "\"How do you vectorize an if/else across rows?\"", a: "np.where(condition, value_if_true, value_if_false) for a two-way branch, or np.select for several conditions with a default. Both run over whole columns in C. For mapping discrete values to outputs, .map with a dict is also vectorized and clean." },
        { q: "\"What if even vectorized pandas is too slow?\"", a: "Then the data has likely outgrown single-machine pandas. I'd move to Polars for a faster multithreaded DataFrame on the same box, push the aggregation into DuckDB or the warehouse with SQL, or go to Spark if it's genuinely distributed-scale. Match the engine to the data size." }
      ]
    },
    {
      title: "\"Explain the GIL and when multiprocessing actually helps.\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand real Python concurrency. They want the GIL's effect (one thread runs bytecode at a time), the I/O-bound vs CPU-bound distinction, and threads-for-IO / processes-for-CPU — plus the nuance that NumPy releases the GIL.",
      noteLabel: "Model answer:",
      note: "\"The GIL is a lock in CPython that lets only one thread execute Python bytecode at a time. The practical consequence is that threads don't give you parallel CPU — a CPU-bound job across many threads runs about as fast as one, because they take turns holding the lock.<br><br>So the distinction I reason about is I/O-bound versus CPU-bound. For I/O-bound work — lots of API calls, DB queries, file reads — threading helps a lot, because a thread releases the GIL while it waits on I/O, so I overlap the waits. For CPU-bound work I use multiprocessing: separate processes, each with its own interpreter and its own GIL, running truly in parallel across cores. The cost is process startup and copying data between processes.<br><br>Rule of thumb: threads for I/O-bound, processes for CPU-bound.<br><br>Two nuances I'd add. A lot of DE 'compute' is inside NumPy, pandas, or Arrow, which release the GIL in their C code, so threads can actually parallelize there. And for genuinely large parallel compute, the honest answer is often neither — it's pushing the work to Spark or the warehouse rather than local processes.\"",
      followups: [
        { q: "\"Why don't threads speed up CPU-bound Python?\"", a: "Because the GIL permits only one thread to run bytecode at a time, so CPU-bound threads just alternate — no true parallelism, and you even pay switching overhead. Real CPU parallelism needs multiprocessing, where each process has its own interpreter and GIL and runs on a separate core." },
        { q: "\"Give a concrete case where threading is the right call.\"", a: "Fetching hundreds of URLs or running many independent DB queries. Each thread spends most of its time waiting on the network, releasing the GIL during the wait, so the waits overlap and total time drops sharply. It's I/O-bound, which is exactly where threads shine." },
        { q: "\"When is multiprocessing the wrong answer for CPU work?\"", a: "When the heavy compute is already in NumPy/pandas/Arrow that release the GIL (threads suffice), when startup and data-copy overhead outweighs the gain on small tasks, or when the data is large enough that the real answer is pushing it to Spark or the warehouse instead of local processes." }
      ]
    },
    {
      title: "\"How do you make a data transform testable?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you separate logic from IO. The senior answer is pure functions for the transform, IO at the edges, mocking only the boundaries, and running it in CI — not 'I add some tests at the end.'",
      noteLabel: "Model answer:",
      note: "\"The key move is separating the transformation logic from the IO.<br><br>I write the transform as a pure function: data in, data out, no side effects — it doesn't read from S3 or write to the warehouse. Then I can test it with a small in-memory DataFrame and assert on the output, with no infrastructure, no network, and fully deterministic results. That matters because the logic — the filters, joins, aggregations, edge cases — is where the bugs live, so that's what I most want under test.<br><br>The anti-pattern is one function that reads, transforms, and writes all in one body; you can't test the logic without standing up the whole world. So I split it into read, transform, write, with the transform pure and the IO in thin wrappers at the edges.<br><br>For the IO wrappers I use light integration tests against a local DuckDB or temp files, and I mock only genuine external boundaries like an API. I keep the real logic out of notebooks and in importable modules, and I run the whole suite in CI on every PR so nothing broken merges.\"",
      followups: [
        { q: "\"Why pure functions specifically?\"", a: "Because they depend only on inputs and have no side effects, so I test them with in-memory data and assert the output — no mocks, no infrastructure, deterministic and fast. And they hold the business logic where bugs actually live, so testing them is where testing pays off most." },
        { q: "\"What do you still need integration tests for?\"", a: "The wiring — that read, transform, and write actually connect, schemas match, and queries run — which pure unit tests can't cover. I run those against a local Postgres or DuckDB or temp files, fewer of them than unit tests, following the pyramid." },
        { q: "\"How do notebooks fit into a testable setup?\"", a: "They don't hold production logic. Cells run out of order, state hides, nothing's versioned or testable. I factor the real transforms into importable, tested modules and let the notebook be a thin caller, so the same code runs in the pipeline and under pytest." }
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "Why is Python considered the lingua franca of data engineering despite being relatively slow?",
    options: [
      "It has the fastest raw execution speed of any language",
      "The heavy work runs in C-backed libraries or pushed-down engines while Python provides an unmatched ecosystem and glue/orchestration layer",
      "It compiles to native machine code ahead of time",
      "It is the only language that can connect to cloud warehouses"
    ],
    correct: 1
  },
  {
    q: "You need to test 'have I seen this id before' millions of times inside a loop. Which data structure avoids an O(n²) blowup?",
    options: [
      "A list, checking with 'id in my_list'",
      "A tuple, checking with 'id in my_tuple'",
      "A set, checking with 'id in my_set'",
      "A sorted list scanned linearly"
    ],
    correct: 2
  },
  {
    q: "What is the practical difference between [f(x) for x in xs] and (f(x) for x in xs)?",
    options: [
      "They are identical in every way",
      "The list comprehension materializes everything in memory; the generator expression is lazy and yields one item at a time",
      "The generator is always faster and also reusable",
      "The list version is lazy and the generator version is eager"
    ],
    correct: 1
  },
  {
    q: "What bug does def f(x, acc=[]) introduce?",
    options: [
      "Syntax error — you can't use a list as a default",
      "The default list is created once at definition and shared across calls, so state leaks between calls",
      "The list is recreated on every call, which is slow",
      "acc becomes read-only and can't be appended to"
    ],
    correct: 1
  },
  {
    q: "In pandas, what is the main problem with using iterrows() to compute a new column on a large DataFrame?",
    options: [
      "It corrupts the DataFrame index",
      "It only works on numeric columns",
      "It pulls each row into interpreted Python and is often 100x+ slower than the vectorized column operation",
      "It silently drops rows with null values"
    ],
    correct: 2
  },
  {
    q: "The category dtype in pandas gives the biggest memory win for which kind of column?",
    options: [
      "A near-unique high-cardinality ID column",
      "A float column of measurements",
      "A low-cardinality string column like status or country with repeated values",
      "A datetime column"
    ],
    correct: 2
  },
  {
    q: "Because of the GIL, which type of workload does Python threading actually speed up?",
    options: [
      "CPU-bound pure-Python computation",
      "I/O-bound work like many network or file calls, where threads release the GIL while waiting",
      "Nothing — threading never helps in Python",
      "Only NumPy matrix multiplication"
    ],
    correct: 1
  },
  {
    q: "What is the single most important practice for making a data transform unit-testable?",
    options: [
      "Adding print statements throughout the transform",
      "Running the whole pipeline against production data before merging",
      "Separating the pure transformation logic from IO so it can be tested with in-memory input and no infrastructure",
      "Writing all logic inside a Jupyter notebook cell"
    ],
    correct: 2
  },
  {
    q: "Why is Parquet generally preferred over CSV for analytical data at scale?",
    options: [
      "It is human-readable and easy to edit by hand",
      "It is columnar, compressed, and typed, so reads touch only needed columns and can skip row groups",
      "It is always smaller than any other format regardless of content",
      "It stores data row-by-row for faster full-row reads"
    ],
    correct: 1
  },
  {
    q: "You call df.merge(other, on='user_id') and your downstream sums suddenly double. What is the most likely cause?",
    options: [
      "The merge dropped all null keys",
      "Fan-out — the key isn't unique on the other side, so rows multiplied",
      "merge automatically sums duplicate columns",
      "The 'on' column was the wrong dtype"
    ],
    correct: 1
  }
];
