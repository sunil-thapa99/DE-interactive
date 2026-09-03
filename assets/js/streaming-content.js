// Content data for the Stream Processing module (Flink, Spark Structured Streaming, Kafka Streams).
const MODULE_ID = "streaming";
const CONTENT = {

overview: {
  intro: {
    title: "Stream processing — beyond Kafka, the compute on the stream",
    desc: "Kafka moves the events; stream processing is what you DO with them continuously — windowed aggregations, joins, enrichment, dedup, real-time features. The hard parts aren't the API, they're the concepts every engine shares: event time vs processing time, watermarks, windowing, state, and delivery semantics. This module covers those, then the engine trade-offs (Flink vs Spark Structured Streaming vs Kafka Streams). Work each tab, answer the follow-ups aloud, then check."
  },
  cards: [
    {
      title: "Batch vs streaming — and why streaming is genuinely harder",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "Batch processes a bounded, complete dataset — you have all the data, run once, done. Streaming processes an unbounded, never-complete flow — data arrives forever, out of order, and possibly late, and you must produce answers continuously without ever seeing 'all' of it. That unboundedness is the source of every hard concept: you can't wait for completeness, so you need a notion of TIME (when did the event happen vs when did you see it), WATERMARKS (how do you decide a window is 'done enough' to emit), WINDOWS (how do you bound an infinite stream into finite chunks to aggregate), STATE (you must remember things across events), and DELIVERY SEMANTICS (what happens on failure/replay). A batch job has none of these because the dataset is finite and static.",
      navLabel: "The distinction interviewers probe:",
      nav: "The real difficulty isn't 'process fast' — it's correctness under out-of-order, late, and duplicate data with failures. A batch job that's wrong you re-run; a streaming job has to be right continuously and recover exactly-once. So the questions are all about time, watermarks, state, and what happens when a node dies mid-window.",
      noteLabel: "Model answer:",
      note: "\"Batch processes a bounded, complete dataset — I have all of it, run once, and I'm done. Streaming processes an unbounded flow that arrives forever, out of order, and sometimes late, and I have to produce answers continuously without ever seeing all the data.<br><br>That unboundedness creates every hard concept. Because I can't wait for completeness, I need event time versus processing time, watermarks to decide when a window is done enough to emit, windows to carve the infinite stream into finite chunks, state to remember across events, and delivery semantics for what happens on failure.<br><br>A batch job needs none of that because the data is finite and static. The real difficulty in streaming is staying correct under out-of-order, late, and duplicate data while recovering exactly-once.\"",
      followups: [
        "\"Why can't you just treat a stream as many tiny batches and be done?\"",
        "\"Which streaming concept has no batch equivalent, and why?\"",
        "\"What makes streaming correctness harder than batch correctness?\""
      ]
    },
    {
      title: "When you actually need streaming — and when you don't",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Streaming earns its complexity only when latency requirements demand it. Reach for it when the business value decays in seconds-to-minutes: fraud/risk scoring on live transactions, real-time alerting/monitoring, live dashboards and metrics, dynamic pricing, real-time ML features, and event-driven pipelines that must react immediately. Do NOT reach for it when a scheduled batch (hourly/daily) meets the SLA — streaming is more expensive, harder to operate, harder to test, and harder to reason about. A common senior answer: 'most 'real-time' asks are actually satisfied by a frequent micro-batch or an incremental job; I only go true streaming when sub-minute latency is a real requirement, not a nice-to-have.' Also note the middle ground: micro-batch (Spark) gives seconds-latency with batch-like simplicity.",
      noteLabel: "Model answer:",
      note: "\"Streaming earns its complexity only when latency actually demands it.<br><br>I reach for it when value decays in seconds to minutes — fraud scoring on live transactions, real-time alerting and monitoring, live dashboards, dynamic pricing, real-time ML features, event-driven reactions.<br><br>I don't reach for it when an hourly or daily batch meets the SLA, because streaming costs more and is harder to operate, test, and reason about.<br><br>In practice a lot of 'real-time' requests are satisfied by a frequent micro-batch or an incremental job. I only go true streaming when sub-minute latency is a genuine requirement, not a nice-to-have. Micro-batch is a good middle ground — seconds of latency with batch-like simplicity.\"",
      followups: [
        "\"A stakeholder says 'we need it real-time' — how do you pressure-test that?\"",
        "\"What's the cost of choosing streaming when batch would do?\"",
        "\"Where does micro-batch sit between batch and true streaming?\""
      ]
    },
    {
      title: "The engine landscape — Flink, Spark Structured Streaming, Kafka Streams",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Three main engines, different sweet spots. Apache Flink: a true record-at-a-time streaming engine with event-time and state as first-class citizens, lowest latency, richest windowing/state; the choice for complex, low-latency, stateful streaming. Spark Structured Streaming: micro-batch (processes the stream as a series of small batches; a continuous mode exists but micro-batch dominates) — slightly higher latency but one unified API with batch, and it pairs beautifully with Delta Lake; the choice when you're already on Spark/Databricks and seconds-latency is fine. Kafka Streams: a lightweight JVM LIBRARY (not a cluster) embedded in your app, for Kafka-to-Kafka transformations and simpler stateful apps without standing up a processing cluster. The decision hinges on latency needs, existing stack, and complexity.",
      noteLabel: "Model answer:",
      note: "\"Three main engines with different sweet spots.<br><br>Flink is true record-at-a-time streaming with event-time and state as first-class citizens. It has the lowest latency and richest windowing and state, so it's my choice for complex, low-latency, stateful streaming.<br><br>Spark Structured Streaming is micro-batch — it treats the stream as a series of small batches. Latency is a bit higher, but I get one unified API with batch and it pairs beautifully with Delta Lake. I pick it when I'm already on Spark or Databricks and seconds of latency is fine.<br><br>Kafka Streams is a lightweight library embedded in my app, not a cluster, for Kafka-to-Kafka transformations and simpler stateful apps.<br><br>I decide on latency, existing stack, and complexity.\"",
      followups: [
        "\"Sub-100ms latency with complex state — which engine?\"",
        "\"You're on Databricks writing to Delta — which, and why?\"",
        "\"When is Kafka Streams the right, lighter choice?\""
      ]
    }
  ]
},

time: {
  intro: {
    title: "Event time vs processing time & watermarks",
    desc: "This is the conceptual heart of stream processing and the most-tested topic: which clock you compute on, why event time is almost always the right one, and how watermarks let you make progress on out-of-order data without waiting forever. Get this cold — it's where interviews separate people who've run streaming from people who've read about it."
  },
  cards: [
    {
      title: "Event time vs processing time — pick the right clock",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Every event has (at least) two timestamps: EVENT TIME, when it actually happened at the source (embedded in the event), and PROCESSING TIME, when your engine happened to process it. They diverge because of network delay, buffering, retries, backpressure, and mobile devices going offline then re-sending. Almost always you want EVENT TIME: a '9am sales' report must bucket a sale by when it occurred, not when a delayed message arrived at 9:03. Processing time is only acceptable when you genuinely don't care about source-time accuracy (e.g. a rough throughput monitor) — it's simpler and needs no watermarks, but any late/out-of-order data lands in the wrong window. The classic bug: aggregating by processing time and getting wrong numbers whenever the pipeline lags.",
      noteLabel: "Model answer:",
      note: "\"Every event has two timestamps. Event time is when it actually happened at the source, embedded in the event. Processing time is when my engine happened to handle it.<br><br>They diverge because of network delay, buffering, retries, backpressure, and devices going offline and re-sending.<br><br>I almost always want event time. A nine-a-m sales number has to bucket a sale by when it occurred, not when a delayed message showed up at nine-oh-three.<br><br>Processing time is only fine when I truly don't care about source-time accuracy, like a rough throughput monitor — it's simpler and needs no watermarks, but any late or out-of-order event lands in the wrong window. The classic bug is aggregating on processing time and getting wrong numbers the moment the pipeline lags.\"",
      followups: [
        "\"Give a case where processing-time aggregation produces wrong results.\"",
        "\"Where does the event-time timestamp come from?\"",
        "\"When is processing time actually acceptable?\""
      ]
    },
    {
      title: "Watermarks — making progress without waiting forever",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "If you compute on event time over an unbounded, out-of-order stream, when do you decide a window is 'complete' enough to emit? You can't wait forever for a straggler. A WATERMARK is the engine's assertion: 'I believe I've now seen all events with event time ≤ T' — i.e. event time has progressed to T. It's a heuristic, usually 'max event time seen so far minus an allowed-lateness bound' (e.g. max seen − 5 min). When the watermark passes a window's end, the engine emits that window's result and can drop its state. The trade-off is latency vs completeness: a large lateness bound waits longer (higher latency) but catches more stragglers; a small bound emits sooner but risks dropping late data. Watermarks are how streaming reconciles 'answer promptly' with 'answer correctly.'",
      code: "// Flink: event time + watermark allowing 5 min of out-of-orderness\nWatermarkStrategy\n  .<Event>forBoundedOutOfOrderness(Duration.ofMinutes(5))\n  .withTimestampAssigner((e, ts) -> e.getEventTimeMillis());\n\n// Spark Structured Streaming: same idea\n// df.withWatermark(\"event_time\", \"5 minutes\").groupBy(window(...)).count()",
      noteLabel: "Model answer:",
      note: "\"If I compute on event time over an out-of-order stream, I need to decide when a window is complete enough to emit — I can't wait forever for a straggler.<br><br>A watermark is the engine's assertion that it believes it has now seen all events with event time up to T. It's a heuristic, usually the max event time seen so far minus an allowed-lateness bound, say five minutes.<br><br>When the watermark passes a window's end, the engine emits that window and can drop its state.<br><br>The trade-off is latency versus completeness. A large bound waits longer and catches more late events; a small bound emits sooner but risks dropping stragglers. Watermarks are how streaming reconciles answering promptly with answering correctly.\"",
      followups: [
        "\"What exactly does a watermark assert?\"",
        "\"How does the lateness bound trade latency against completeness?\"",
        "\"When does a window emit and free its state?\""
      ]
    },
    {
      title: "Late data — dropping, allowed lateness, and side outputs",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "An event is 'late' if it arrives after the watermark has already passed its window. Options: (1) Drop it — the default once the window's state is gone; simplest, and fine if rare stragglers don't matter. (2) Allowed lateness — keep the window's state a bit longer past the watermark so late events still update the (already-emitted) result, re-firing an updated answer; you pay with retained state and downstream having to handle updates. (3) Route late events to a side output / dead-letter (Flink side outputs) for separate handling or reconciliation, so nothing is silently lost. The DE judgment is choosing based on how much correctness the late tail is worth: financial aggregates may need allowed-lateness or reconciliation, a live counter may just drop. Always know what your pipeline does with late data — 'silently dropped' is a decision, make it on purpose.",
      noteLabel: "Model answer:",
      note: "\"An event is late if it arrives after the watermark has passed its window.<br><br>I have three options. I can drop it, which is the default once the window's state is gone — fine if rare stragglers don't matter. I can set allowed lateness, keeping the window's state a bit longer so late events still update an already-emitted result, at the cost of retained state and downstream handling updates. Or I can route late events to a side output or dead-letter for separate reconciliation, so nothing is silently lost.<br><br>I choose based on what the late tail is worth. Financial aggregates may need allowed-lateness or reconciliation; a live counter can just drop.<br><br>The key discipline is knowing what my pipeline does with late data — silently dropping is a decision I make on purpose, not by accident.\"",
      followups: [
        "\"What happens to an event that arrives after its window's watermark?\"",
        "\"How does allowed lateness change downstream consumers?\"",
        "\"How do you make sure late data isn't silently lost?\""
      ]
    }
  ]
},

windows: {
  intro: {
    title: "Windowing & stream joins",
    desc: "Windows are how you bound an infinite stream into finite pieces you can aggregate. This tab covers the three window types, the triggers that decide when results fire, and the extra care stream-to-stream joins need. Being able to pick the right window for a scenario — and explain session windows — is a common interview ask."
  },
  cards: [
    {
      title: "Tumbling, sliding & session windows",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Three window types cover most needs. TUMBLING: fixed-size, non-overlapping, back-to-back — 'count per 1-minute bucket'; every event falls in exactly one window. SLIDING: fixed-size but overlapping, defined by size + slide — 'a 5-minute count, updated every 1 minute'; an event can belong to multiple windows (more state, smoother moving metrics). SESSION: dynamic, gap-based — a window stays open while events keep arriving and closes after a period of inactivity (the session gap), 'group a user's activity into sessions separated by 30 min idle'; window boundaries depend on the data, not the clock. Rule of thumb: tumbling for periodic non-overlapping aggregates, sliding for moving averages/rolling metrics, session for activity/behavior grouped by inactivity.",
      code: "// Flink examples (event time):\n.window(TumblingEventTimeWindows.of(Time.minutes(1)))               // fixed buckets\n.window(SlidingEventTimeWindows.of(Time.minutes(5), Time.minutes(1))) // 5-min, every 1-min\n.window(EventTimeSessionWindows.withGap(Time.minutes(30)))          // gap-based sessions",
      noteLabel: "Model answer:",
      note: "\"Three window types cover most needs.<br><br>Tumbling windows are fixed-size and non-overlapping — a count per one-minute bucket, where each event lands in exactly one window.<br><br>Sliding windows are fixed-size but overlapping, defined by a size and a slide — a five-minute count updated every minute — so an event can belong to several windows. That's more state but gives smooth moving metrics.<br><br>Session windows are dynamic and gap-based: the window stays open while events keep coming and closes after a period of inactivity. I'd use them to group a user's activity into sessions separated by, say, thirty minutes idle. The boundaries depend on the data, not the clock.<br><br>So tumbling for periodic aggregates, sliding for rolling metrics, session for behavior grouped by inactivity.\"",
      followups: [
        "\"Group a user's clicks into visits separated by 30 min of inactivity — which window?\"",
        "\"A 5-minute average updated every minute — which window, and what's the state cost?\"",
        "\"In which window type can one event count in multiple windows?\""
      ]
    },
    {
      title: "Triggers & incremental aggregation",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A window defines WHAT to group; a trigger defines WHEN to emit the result. The default trigger fires when the watermark passes the window end (one final result per window). But you can fire early (emit partial results periodically before the window closes, for low-latency dashboards) and fire late (re-emit an updated result when allowed-lateness late data arrives). Related: engines aggregate incrementally where possible — a sum/count updates a small accumulator per event rather than buffering all events and computing at the end, which bounds state. In Spark Structured Streaming this surfaces as output modes: append (emit rows once finalized), update (emit changed rows), complete (emit the whole result table each trigger). Knowing that triggers and output modes control the latency/correctness/duplication trade is the intermediate signal.",
      noteLabel: "Model answer:",
      note: "\"A window defines what to group; a trigger defines when to emit.<br><br>The default fires when the watermark passes the window end — one final result per window. But I can fire early to emit partial results before the window closes, for a low-latency dashboard, and fire late to re-emit an updated result when allowed-lateness data arrives.<br><br>Engines also aggregate incrementally where they can — a sum or count updates a small accumulator per event instead of buffering everything, which bounds state.<br><br>In Spark this shows up as output modes: append emits finalized rows, update emits changed rows, complete emits the whole result each trigger. So triggers and output modes are how I trade latency against correctness and duplication.\"",
      followups: [
        "\"How do you show a partial window result before the window closes?\"",
        "\"Spark append vs update vs complete output mode — when each?\"",
        "\"Why is incremental aggregation important for state size?\""
      ]
    },
    {
      title: "Stream-stream joins — why they need windows and state",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Joining two unbounded streams is hard: a matching event on the other side might not have arrived yet, and you can't buffer both streams forever. So stream-stream joins are bounded by time — you join events within a window/interval of each other (e.g. 'match a click to an impression within 10 minutes'), and the engine holds each side's recent events in state until the watermark says no more matches can arrive, then evicts. Without that time bound the state grows without limit. Contrast with stream-table (enrichment) joins: joining a stream against a mostly-static reference/dimension (a lookup table or a slowly-changing broadcast/temporal table) is cheaper — you look each event up, no unbounded buffering. The interview point: name the time bound and the state eviction for stream-stream, and prefer stream-table enrichment when one side is reference data.",
      noteLabel: "Model answer:",
      note: "\"Joining two unbounded streams is hard because a match on the other side might not have arrived yet, and I can't buffer both streams forever.<br><br>So stream-stream joins are bounded by time — I join events within an interval of each other, like matching a click to an impression within ten minutes. The engine holds each side's recent events in state until the watermark says no more matches can arrive, then evicts them. Without that time bound the state grows without limit.<br><br>A stream-table join is different and cheaper: I enrich a stream against mostly-static reference data — a lookup or a temporal dimension — so I just look each event up, no unbounded buffering.<br><br>So for stream-stream I name the time bound and the eviction, and where one side is reference data I prefer a stream-table enrichment.\"",
      followups: [
        "\"Why can't you join two streams without a time bound?\"",
        "\"What evicts the join state, and when?\"",
        "\"Stream-stream vs stream-table join — which is cheaper and why?\""
      ]
    }
  ]
},

state: {
  intro: {
    title: "State, checkpointing & delivery semantics",
    desc: "Anything beyond a stateless map — aggregations, joins, dedup, pattern detection — needs state, and state must survive failures. This tab covers stateful processing, how checkpointing makes it fault-tolerant, and the delivery-semantics question (at-most / at-least / exactly-once) that every streaming interview asks. This is the reliability core."
  },
  cards: [
    {
      title: "Stateful processing & state backends",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Stateless operations (filter, map, simple projection) treat each event independently. Stateful operations must remember across events: a running count, a window's accumulator, the other side of a join, seen-keys for dedup, or a pattern's progress. That state is partitioned by key (keyed state) so it scales horizontally. Where it lives matters: Flink keeps state on the local heap for small state, or in RocksDB (on local disk) for large state that exceeds memory — RocksDB lets state far exceed RAM at some access cost. State grows, so you bound it: window/watermark eviction, and state TTL to expire keys you'll never see again (e.g. drop a user's dedup key after 24h). Unbounded state is the classic streaming outage — a keyed aggregation with ever-growing distinct keys eventually blows memory/disk.",
      noteLabel: "Model answer:",
      note: "\"Stateless operations like filter and map treat each event independently. Stateful ones have to remember across events — a running count, a window accumulator, the other side of a join, seen-keys for dedup, a pattern's progress.<br><br>That state is partitioned by key so it scales horizontally. Where it lives matters: Flink keeps small state on the heap, or in RocksDB on local disk for large state that exceeds memory, which lets state grow well beyond RAM at some access cost.<br><br>State grows, so I bound it — window and watermark eviction, and TTL to expire keys I'll never see again, like dropping a dedup key after a day.<br><br>Unbounded state is the classic streaming outage: a keyed aggregation with ever-growing distinct keys eventually exhausts memory or disk.\"",
      followups: [
        "\"Which operations need state, and which don't?\"",
        "\"Your streaming job's memory grows forever — what's the likely cause and fix?\"",
        "\"When would you use RocksDB state over heap state?\""
      ]
    },
    {
      title: "Checkpointing — fault tolerance for stateful streams",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "To recover a stateful job after a crash, the engine periodically CHECKPOINTS a consistent snapshot of all operator state plus the source offsets to durable storage. On failure it restarts, restores the last checkpoint's state, and resumes reading from those offsets — so no state is lost and nothing is reprocessed incorrectly. Flink uses distributed snapshots via checkpoint BARRIERS flowing through the dataflow (the Chandy-Lamport algorithm): a barrier marks a consistent cut so every operator snapshots the same logical point, without stopping the stream. Spark Structured Streaming checkpoints offsets and state to reliable storage (e.g. cloud storage) per micro-batch. Flink SAVEPOINTS are user-triggered checkpoints for planned restarts, upgrades, and rescaling. The checkpoint interval trades recovery time/overhead against how much reprocessing a failure costs.",
      noteLabel: "Model answer:",
      note: "\"To recover a stateful job, the engine periodically checkpoints a consistent snapshot of all operator state plus the source offsets to durable storage. On a crash it restarts, restores that state, and resumes from those offsets — no state lost, nothing incorrectly reprocessed.<br><br>Flink does distributed snapshots using checkpoint barriers that flow through the dataflow — the Chandy-Lamport idea — so every operator snapshots the same logical point without stopping the stream.<br><br>Spark Structured Streaming checkpoints offsets and state to reliable storage each micro-batch.<br><br>Flink savepoints are user-triggered checkpoints for planned restarts, upgrades, and rescaling.<br><br>The checkpoint interval trades overhead and recovery time against how much work a failure forces me to redo.\"",
      followups: [
        "\"What's in a checkpoint, and how is it used on recovery?\"",
        "\"What are checkpoint barriers doing in Flink?\"",
        "\"Checkpoint vs savepoint — what's the difference?\""
      ]
    },
    {
      title: "Delivery semantics — at-most / at-least / exactly-once",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Three guarantees for what happens to each event under failure. AT-MOST-ONCE: no retries; events can be lost, never duplicated — fine only when loss is acceptable. AT-LEAST-ONCE: retries on failure guarantee no loss but can produce DUPLICATES — the sink/consumer must be idempotent. EXACTLY-ONCE: each event affects the result exactly once despite failures — the gold standard, achieved by combining checkpointed state with either idempotent writes or TRANSACTIONAL sinks (two-phase commit that ties the output commit to the checkpoint). Crucial nuance: 'exactly-once' usually means exactly-once STATE/processing, not magic at the sink — end-to-end exactly-once needs a transactional or idempotent sink (Kafka transactions, a Delta atomic commit, an upsert on a key). If the sink can't do that, you fall back to at-least-once + idempotency. Naming that 'effectively-once via idempotent sink' distinction is the senior signal.",
      code: "# End-to-end exactly-once needs BOTH:\n#   checkpointed state (engine)  +  transactional/idempotent sink\n# Examples of the sink half:\n#   - Kafka transactions (read-process-write, EOS)\n#   - Delta atomic commit + MERGE on a key (idempotent upsert)\n#   - UPSERT into a DB keyed by an event id\n# Without a capable sink => at-least-once + dedup on the key",
      noteLabel: "Model answer:",
      note: "\"There are three guarantees.<br><br>At-most-once means no retries — events can be lost but never duplicated, acceptable only when loss is fine. At-least-once means retries guarantee no loss but can duplicate, so my sink has to be idempotent. Exactly-once means each event affects the result exactly once despite failures.<br><br>Exactly-once comes from combining checkpointed state with either idempotent writes or a transactional sink that ties the output commit to the checkpoint with two-phase commit.<br><br>The nuance I'd stress is that 'exactly-once' usually means exactly-once processing and state, not magic at the sink. End-to-end exactly-once needs a transactional or idempotent sink — Kafka transactions, a Delta atomic commit with a keyed MERGE, or an upsert by event id. If the sink can't do that, I fall back to at-least-once plus dedup on the key.\"",
      followups: [
        "\"Does 'exactly-once' at the engine give you exactly-once at the database? Why not?\"",
        "\"How do you get end-to-end exactly-once into Kafka? Into Delta?\"",
        "\"If your sink can't be transactional, what's the fallback?\""
      ]
    }
  ]
},

engines: {
  intro: {
    title: "Engines compared — Flink vs Spark Structured Streaming vs Kafka Streams",
    desc: "With the concepts in hand, the engine choice becomes concrete. This tab compares the execution models (true streaming vs micro-batch vs embedded library), how each handles latency and backpressure, and when you'd pick each — the practical judgment a streaming interview closes on."
  },
  cards: [
    {
      title: "Execution models — true streaming vs micro-batch",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Flink is true continuous streaming: each record flows through operators one at a time (pipelined), giving millisecond latency and fine-grained event-time/state control. Spark Structured Streaming is micro-batch: it collects events for a short interval and processes them as a small batch job, so latency is typically hundreds of ms to seconds — the cost of the batch boundary — but you get Spark's unified batch+stream API, mature ecosystem, and seamless Delta integration (a Continuous Processing mode exists for lower latency but is far less used). Kafka Streams isn't a cluster at all — it's a JVM library you embed in your service, processing Kafka topics with local state (RocksDB) and Kafka for fault tolerance; you scale it by running more instances of your app. The model dictates the latency floor and the ops story.",
      noteLabel: "Model answer:",
      note: "\"Flink is true continuous streaming — each record flows through the operators one at a time, giving millisecond latency and fine-grained control over event time and state.<br><br>Spark Structured Streaming is micro-batch — it collects events for a short interval and runs them as a small batch. Latency is usually hundreds of milliseconds to seconds because of the batch boundary, but I get Spark's unified batch-and-stream API, a mature ecosystem, and seamless Delta integration. There's a continuous mode, but micro-batch dominates.<br><br>Kafka Streams isn't a cluster — it's a library I embed in my service, processing topics with local RocksDB state and Kafka for fault tolerance, and I scale it by running more app instances.<br><br>The execution model sets the latency floor and the operational story.\"",
      followups: [
        "\"Why does micro-batch have a higher latency floor than Flink?\"",
        "\"How do you scale a Kafka Streams app?\"",
        "\"What does Spark's micro-batch model give up, and gain?\""
      ]
    },
    {
      title: "Backpressure & scaling",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Backpressure is when a downstream operator/sink can't keep up and the pipeline must slow the source rather than blow up memory. Flink propagates backpressure naturally through its pipelined data exchange — a slow operator slows its upstream, all the way back to the source, so the system self-throttles (and you monitor which operator is the bottleneck). Spark Structured Streaming controls intake per micro-batch (e.g. maxOffsetsPerTrigger / rate limits) so a batch doesn't ingest more than it can process, and adaptive scheduling helps. Both rely on a durable, replayable source (Kafka) so throttling the read is safe — you're not dropping data, just reading slower. Scaling is by parallelism/partitions: throughput is ultimately bounded by the source partition count and the keyed parallelism, so you size partitions and operator parallelism together. The interview cue: name the bottleneck operator and the replayable source that makes throttling safe.",
      noteLabel: "Model answer:",
      note: "\"Backpressure is when a downstream operator or sink can't keep up, and the system has to slow the source rather than run out of memory.<br><br>Flink propagates it naturally through its pipelined exchange — a slow operator slows its upstream all the way back to the source, so it self-throttles, and I monitor which operator is the bottleneck.<br><br>Spark limits intake per micro-batch with settings like maxOffsetsPerTrigger, so a batch never ingests more than it can process.<br><br>Both rely on a durable, replayable source like Kafka, so throttling the read is safe — I'm reading slower, not dropping data.<br><br>Scaling is by parallelism and partitions: throughput is bounded by the source partition count and keyed parallelism, so I size those together. The thing to name is the bottleneck operator and the replayable source that makes throttling safe.\"",
      followups: [
        "\"Your sink slows down — what stops the job from OOMing?\"",
        "\"Why is a replayable source important for backpressure?\"",
        "\"What ultimately caps a keyed pipeline's throughput?\""
      ]
    },
    {
      title: "Choosing an engine — the decision",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Anchor the choice to requirements, not fashion. Pick Flink when you need the lowest latency, complex event-time processing, large stateful workloads, CEP/pattern detection, or true per-event semantics. Pick Spark Structured Streaming when you're already on Spark/Databricks, seconds-latency is acceptable, you want ONE codebase for batch and streaming, and you're writing to Delta/lakehouse — the operational simplicity and unified API often outweigh the latency gap. Pick Kafka Streams (or ksqlDB) when the job is Kafka-to-Kafka, you want to embed processing in an existing JVM service without standing up a cluster, and state/complexity are modest. Meta-point: the concepts (event time, watermarks, windows, state, exactly-once) transfer across all three — the engine is a deployment/latency/ecosystem decision, not a re-learn.",
      noteLabel: "Model answer:",
      note: "\"I anchor the choice to requirements.<br><br>Flink when I need the lowest latency, complex event-time processing, large state, pattern detection, or true per-event semantics.<br><br>Spark Structured Streaming when I'm already on Spark or Databricks, seconds of latency is fine, I want one codebase for batch and streaming, and I'm writing to Delta — the unified API and operational simplicity usually outweigh the latency gap.<br><br>Kafka Streams when the job is Kafka-to-Kafka and I want to embed processing in an existing service without a cluster, with modest state.<br><br>And the meta-point I'd make: the concepts — event time, watermarks, windows, state, exactly-once — transfer across all three. The engine is a latency, ecosystem, and ops decision, not a concept re-learn.\"",
      followups: [
        "\"Sub-second latency, heavy stateful CEP — which engine?\"",
        "\"On Databricks writing to Delta, seconds is fine — which, and why?\"",
        "\"Do the core concepts change when you switch engines?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview Prep — stream processing questions with model answers",
    desc: "The streaming questions that actually get asked, structured fundamentals → advanced. Each hides its model answer until you expand it, and ends with the follow-ups an interviewer digs with. Practice by explaining the concept and the failure mode aloud, then checking."
  },
  cards: [
    {
      title: "\"Event time vs processing time — what's the difference and why does it matter?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "The single most fundamental streaming concept — and whether you default to event time.",
      noteLabel: "Model answer:",
      note: "\"Event time is when an event actually happened at the source, embedded in the event. Processing time is when my engine handled it.<br><br>They diverge because of network delay, buffering, retries, backpressure, and devices going offline and re-sending.<br><br>It matters because almost all correct aggregations are on event time. A nine-a-m sales number must bucket a sale by when it occurred, not when a delayed message arrived at nine-oh-three.<br><br>Processing time is simpler and needs no watermarks, but it's only acceptable when I genuinely don't care about source-time accuracy, like a rough throughput monitor. Compute windows on processing time and any lag in the pipeline silently produces wrong numbers.\"",
      followups: [
        "\"When is processing time acceptable?\"",
        "\"What breaks if you window on processing time and the pipeline lags?\"",
        "\"Where does the event-time timestamp come from?\""
      ]
    },
    {
      title: "\"What's a watermark and what problem does it solve?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Whether you understand how streaming makes progress on out-of-order data without waiting forever.",
      noteLabel: "Model answer:",
      note: "\"Over an unbounded, out-of-order stream, I need to decide when an event-time window is complete enough to emit — I can't wait forever for a straggler.<br><br>A watermark is the engine's assertion that it believes it has now seen all events up to event time T. It's a heuristic, usually the max event time seen minus an allowed-lateness bound.<br><br>When the watermark passes a window's end, the engine emits that window and can drop its state.<br><br>So it solves the completeness problem: it's how streaming decides 'done enough to answer' and reclaims state. The bound is a latency-versus-completeness dial — bigger waits longer but catches more late events.\"",
      followups: [
        "\"How do you set the lateness bound, and what's the trade-off?\"",
        "\"What happens to an event that arrives after the watermark?\"",
        "\"How does a watermark let the engine free state?\""
      ]
    },
    {
      title: "\"Design a real-time fraud-scoring pipeline.\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "End-to-end streaming design pulling the concepts together — a common system-design-lite ask.",
      noteLabel: "Model answer:",
      note: "\"Transactions publish to Kafka for a durable, replayable, partitioned source — partitioned by account so per-account state is local.<br><br>A stream processor — Flink for low latency, or Spark Structured Streaming if I'm on Databricks — consumes on event time with a watermark for out-of-orderness. It maintains keyed state per account: sliding-window features like count and sum over the last few minutes, plus enrichment via a stream-table join against a customer/reference table.<br><br>It scores each transaction — inline model or a model-serving call — and emits alerts to an output topic and results to a Delta table.<br><br>For correctness I checkpoint state and use exactly-once: Kafka transactions or an idempotent keyed upsert so a replay doesn't double-score. And I keep a batch path over the same Kafka/bronze data for backfill and reconciliation.\"",
      followups: [
        "\"How do you avoid double-scoring on a replay?\"",
        "\"Which window type for the velocity features, and why?\"",
        "\"How do you enrich with customer data without unbounded state?\""
      ]
    },
    {
      title: "\"What are the delivery semantics, and how do you get exactly-once?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Whether you know exactly-once needs a capable sink, not just engine magic — the senior distinction.",
      noteLabel: "Model answer:",
      note: "\"At-most-once retries nothing, so events can be lost but never duplicated. At-least-once retries, so no loss but possible duplicates, which forces an idempotent consumer. Exactly-once means each event affects the result once despite failures.<br><br>Exactly-once comes from checkpointed state combined with either idempotent writes or a transactional sink using two-phase commit that ties the output to the checkpoint.<br><br>The nuance I'd stress is that engine exactly-once means exactly-once processing and state, not automatic exactly-once at the sink. End-to-end, I need a transactional or idempotent sink — Kafka transactions, a Delta atomic commit with a keyed MERGE, or an upsert by event id.<br><br>If the sink can't do that, I run at-least-once and dedup on a key downstream. Calling that out is the honest answer.\"",
      followups: [
        "\"Does engine exactly-once guarantee exactly-once in your database?\"",
        "\"How do you achieve it writing to Delta? To Kafka?\"",
        "\"Sink can't be transactional — what do you do?\""
      ]
    },
    {
      title: "\"A streaming job's memory grows unbounded and it eventually crashes. Why?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "The most common real streaming failure — unbounded state — and how to diagnose it.",
      noteLabel: "Model answer:",
      note: "\"The usual cause is unbounded state.<br><br>Most often it's a keyed aggregation or join whose set of distinct keys keeps growing — new keys forever and nothing ever evicted — so state grows without limit.<br><br>I'd check whether windows and watermarks are actually advancing to evict window state; a watermark that never progresses (say a stuck or missing source, or wrong timestamp assignment) means windows never close and state never frees. I'd add state TTL to expire keys I'll never see again, bound joins with a time interval, and make sure aggregations are incremental rather than buffering all events.<br><br>Operationally I'd move large state to RocksDB and monitor state size per operator so I catch the growth before it crashes.\"",
      followups: [
        "\"How does a stuck watermark cause unbounded state?\"",
        "\"What's the fix for an ever-growing keyed aggregation?\"",
        "\"When do you move state to RocksDB?\""
      ]
    },
    {
      title: "\"Flink or Spark Structured Streaming — how do you choose?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Engine judgment grounded in requirements, and awareness the concepts transfer.",
      noteLabel: "Model answer:",
      note: "\"I choose on requirements.<br><br>Flink for the lowest latency, complex event-time processing, large stateful workloads, and pattern detection — it's true record-at-a-time streaming with the richest state and windowing.<br><br>Spark Structured Streaming when I'm already on Spark or Databricks, seconds of latency is acceptable, I want one codebase for batch and streaming, and I'm writing to Delta. Its micro-batch model has a higher latency floor, but the unified API and Delta integration usually win when sub-second isn't required.<br><br>And I'd note the concepts — event time, watermarks, windows, state, exactly-once — are the same across both, so the engine is a latency, ecosystem, and operations decision, not a relearning of streaming.\"",
      followups: [
        "\"What specifically pushes you to Flink over Spark?\"",
        "\"Why might the latency gap not matter?\"",
        "\"Do you have to relearn streaming to switch engines?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "Why is stream processing fundamentally harder than batch?",
    options: [
      "Streams have more data",
      "The data is unbounded, out-of-order, and possibly late, so you must be correct continuously without ever seeing all of it",
      "Streaming engines are slower",
      "Batch can't do joins"
    ],
    correct: 1
  },
  {
    q: "You compute a '9am sales' aggregate. Which time should you window on?",
    options: [
      "Processing time — when the engine saw the event",
      "Event time — when the sale actually happened; late/delayed messages must still land in the 9am window",
      "Ingestion time only",
      "It doesn't matter"
    ],
    correct: 1
  },
  {
    q: "What does a watermark assert?",
    options: [
      "The exact number of events in a window",
      "That the engine believes it has now seen all events with event time up to T (so a window can be emitted and its state freed)",
      "That processing is caught up to real time",
      "The maximum throughput of the source"
    ],
    correct: 1
  },
  {
    q: "You want to group a user's clicks into visits separated by 30 minutes of inactivity. Which window?",
    options: [
      "Tumbling window",
      "Session window (gap-based; closes after the inactivity gap)",
      "Sliding window",
      "Global window"
    ],
    correct: 1
  },
  {
    q: "Why must a stream-stream join be bounded by time?",
    options: [
      "To make it run faster",
      "A match on the other side may not have arrived yet; without a time bound the engine would buffer both streams' state forever",
      "Because joins aren't allowed on streams",
      "To avoid duplicate keys"
    ],
    correct: 1
  },
  {
    q: "A stateful streaming job recovers after a crash without losing state or reprocessing incorrectly. What enables this?",
    options: [
      "Restarting from the beginning of the topic",
      "Checkpointing a consistent snapshot of operator state + source offsets to durable storage, restored on restart",
      "Larger executors",
      "Turning off event time"
    ],
    correct: 1
  },
  {
    q: "Your engine guarantees exactly-once processing. Does that guarantee exactly-once in your output database?",
    options: [
      "Yes, always — the engine handles everything",
      "No — end-to-end exactly-once also needs a transactional or idempotent sink (Kafka txns, Delta MERGE/upsert); otherwise fall back to at-least-once + dedup",
      "Yes, if you disable retries",
      "Only for batch jobs"
    ],
    correct: 1
  },
  {
    q: "A streaming job's memory grows unbounded until it crashes. Most likely cause?",
    options: [
      "Too few partitions",
      "Unbounded state — an ever-growing set of keys with no eviction, or a watermark that never advances so windows never close",
      "The checkpoint interval is too short",
      "Event time is enabled"
    ],
    correct: 1
  },
  {
    q: "Why does Spark Structured Streaming have a higher latency floor than Flink?",
    options: [
      "It's written in Python",
      "It's micro-batch — it collects events for an interval and processes them as a small batch, adding the batch-boundary delay",
      "It can't use Kafka",
      "It doesn't support event time"
    ],
    correct: 1
  },
  {
    q: "A downstream sink slows down. What keeps the streaming job from running out of memory?",
    options: [
      "It drops the excess events",
      "Backpressure throttles the source (safe because the source, e.g. Kafka, is durable and replayable — reading slower, not losing data)",
      "It spins up infinite executors",
      "Nothing — the job always crashes"
    ],
    correct: 1
  }
];
