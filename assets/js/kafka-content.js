// Content data for the Apache Kafka module.
const MODULE_ID = "kafka";
const CONTENT = {

overview: {
  intro: {
    title: "What is Kafka, and why does it dominate real-time data?",
    desc: "Apache Kafka is a distributed, append-only commit log you interact with as a publish/subscribe messaging system. This module goes from the core primitives (topics, partitions, offsets, the log) through producers, consumers, replication, exactly-once, the ecosystem, and production ops — the full surface a 5+ YOE Data Engineer is expected to reason about, not just wire up."
  },
  diagram: [
    { label: "Producers\n(apps, CDC, services)", hl: true },
    { arrow: true },
    { label: "Kafka Cluster\n(brokers + partitioned logs)", hl: true },
    { arrow: true },
    { label: "Consumer Groups\n(Spark, Flink, services, Connect)", hl: true },
    { arrow: true },
    { label: "Sinks\n(warehouse, S3, search, DBs)" },
  ],
  cards: [
    {
      title: "What Kafka actually is: a distributed commit log, not a queue",
      badge: "what & why",
      concept: "Kafka's core is a partitioned, replicated, append-only log. Producers append records to the end of a partition; consumers read forward from a position they track (the offset). Crucially, reading does NOT remove data — the log is retained by time or size, and many independent consumers can read the same records at their own pace. This is the key mental shift from a traditional message queue (RabbitMQ, SQS) where a message is typically delivered to one consumer and then deleted. Kafka is a durable, replayable log that happens to expose a pub/sub API on top.",
      navLabel: "Why that design wins:",
      nav: "Because storage is decoupled from consumption, Kafka is simultaneously a messaging system, a buffer, and a short-to-medium-term source of truth. You can add a brand-new consumer that reads all of history, replay after a bug fix, or have a real-time consumer and a batch consumer share one topic. Append-only sequential I/O + zero-copy transfer is also why a single broker sustains hundreds of MB/s on commodity disks.",
      noteLabel: "Where it fits in a DE stack:",
      note: "Kafka is the real-time backbone: CDC out of operational databases (Debezium), event streams from services, clickstream/IoT ingestion — all land in Kafka, then fan out to a warehouse (Snowflake), a lake (S3/Delta via Connect or Spark), search indexes, and stream processors (Spark Structured Streaming, Flink, Kafka Streams). It decouples fast producers from slow/varied consumers so one slow sink never backpressures the source."
    },
    {
      title: "Topics, partitions, and offsets — the three primitives",
      badge: "concept",
      concept: "A topic is a named stream of records (e.g. 'orders'). Each topic is split into partitions — the unit of parallelism and ordering. A partition is an ordered, immutable sequence of records; each record gets a monotonically increasing offset (0, 1, 2, …) that is unique within that partition. Ordering is guaranteed ONLY within a partition, never across partitions. Records with the same key are hashed to the same partition, which is how you keep all events for one entity (one user, one order) in order.",
      navLabel: "The trade-off you must internalize:",
      nav: "More partitions = more parallelism (more consumers can work in parallel, one per partition max within a group) and higher throughput, but also more open file handles, more memory for the controller/metadata, longer leader-election/rebalance times, and — if you over-partition a keyed topic — more small batches. Partition count is easy to increase but you can NEVER decrease it, and increasing it reshuffles the key→partition mapping, breaking per-key ordering for existing keys. Choose deliberately.",
      note: "Rule of thumb: size partitions for peak throughput and target consumer parallelism, e.g. target_throughput / per-partition_throughput, then round up with headroom. Common starting points are 6–30 partitions for a busy topic; thousands of tiny partitions is an anti-pattern."
    },
    {
      title: "Brokers, the cluster, and replication",
      badge: "concept",
      concept: "A broker is a single Kafka server that stores partition data and serves reads/writes. A cluster is a set of brokers. Each partition has one leader broker (handles all reads and writes) and configurable followers (replicas) on other brokers that copy the leader's log. If the leader broker dies, one of the in-sync replicas is promoted to leader — this is how Kafka survives machine failure without data loss. The replication.factor (commonly 3) is how many copies exist; the leader plus followers that are caught up form the ISR (in-sync replica set).",
      navLabel: "Why replication.factor=3 is the standard:",
      nav: "With RF=3 and min.insync.replicas=2, you can lose one broker and still accept writes (2 in-sync copies remain), and lose a second and still not lose committed data (1 copy remains, though writes pause). RF=1 means any single disk/broker failure loses that partition's data permanently — never use RF=1 for anything that matters. RF=3 is the sweet spot of durability vs. storage/network cost.",
      note: null
    },
    {
      title: "Where the coordination lives: ZooKeeper → KRaft",
      badge: "modern context",
      concept: "Historically Kafka stored cluster metadata (broker membership, topic configs, partition leadership, ACLs) in a separate ZooKeeper ensemble. Since Kafka 2.8 (preview) and GA in 3.3+, Kafka runs in KRaft mode — metadata is managed by a built-in Raft quorum of controller nodes, eliminating the ZooKeeper dependency entirely. ZooKeeper mode is deprecated and removed in Kafka 4.0. New clusters should be KRaft.",
      navLabel: "Why the change matters (interview-relevant):",
      nav: "KRaft removes an entire operational system to run and tune, makes metadata operations far faster, and dramatically raises the ceiling on the number of partitions a cluster can handle (metadata is now an event log the controller replays, not ZooKeeper znodes). If asked 'does Kafka need ZooKeeper?', the correct modern answer is: 'Not anymore — modern Kafka uses KRaft; ZooKeeper is deprecated and gone in 4.0. Older deployments still run it.'",
      note: null
    },
    {
      title: "The record itself: key, value, headers, timestamp",
      badge: "concept",
      concept: "A Kafka record is not just a value. It carries: a key (determines partition + used for log compaction), a value (the payload), optional headers (key/value metadata, e.g. trace IDs, schema versions, event type), and a timestamp (either producer-set 'CreateTime' or broker-set 'LogAppendTime'). Both key and value are just byte arrays to the broker — serialization/deserialization happens in the client, which is why the choice of serializer (Avro/Protobuf/JSON + Schema Registry) is a client-and-governance concern, not a broker one.",
      navLabel: "Practical implications:",
      nav: "The key drives everything downstream: partitioning, ordering, and compaction. A null key means round-robin (sticky) partition assignment and no per-entity ordering. Headers are the right place for cross-cutting metadata so you don't pollute your value schema. Timestamp semantics (CreateTime vs LogAppendTime) matter for event-time stream processing and retention.",
      note: null
    }
  ]
},

setup: {
  intro: {
    title: "Stage 1 — Run Kafka locally (KRaft) and build a mini produce→consume pipeline",
    desc: "Stand up a single-broker KRaft cluster with Docker, create a topic, produce keyed records, and consume them in a group — the same shape as any real pipeline, minus the cluster size. Every command here maps to something you'll do against a real cluster."
  },
  cards: [
    {
      title: "Run a single-broker Kafka in KRaft mode with Docker",
      badge: "setup",
      concept: "You don't need ZooKeeper anymore. The official apache/kafka image (3.7+) boots in KRaft mode with one process acting as both broker and controller — enough to learn every client-side concept. For multi-broker replication behavior you'd use docker-compose with 3 brokers, but a single broker teaches producers, consumers, groups, offsets, and compaction fine.",
      navLabel: "Steps:",
      nav: "Install Docker → run the command below → the broker listens on localhost:9092. The container ships the CLI tools under /opt/kafka/bin, which you'll exec into for the next steps.",
      code: "docker run -d --name kafka -p 9092:9092 apache/kafka:latest\n\n# open a shell with the CLI tools\ndocker exec -it kafka /bin/bash\ncd /opt/kafka/bin",
      note: "Prefer no Docker? Download the Kafka tarball, then bin/kafka-storage.sh format a KRaft storage dir and bin/kafka-server-start.sh with the KRaft config. Docker is just faster to throw away."
    },
    {
      title: "Create a topic with an explicit partition count",
      badge: "setup",
      concept: "Creating the topic explicitly (rather than relying on auto-create) forces you to make the two decisions that matter: partition count (parallelism/ordering) and replication factor (durability). On a single broker RF must be 1; on a real cluster you'd use 3.",
      navLabel: "Command:",
      nav: "From inside the container's bin dir. --partitions 3 lets you later run up to 3 consumers in one group in parallel. --describe shows you leaders, replicas, and ISR per partition.",
      code: "./kafka-topics.sh --create --topic orders \\\n  --bootstrap-server localhost:9092 \\\n  --partitions 3 --replication-factor 1\n\n./kafka-topics.sh --describe --topic orders \\\n  --bootstrap-server localhost:9092",
      note: "Disable auto topic creation in production (auto.create.topics.enable=false). Accidental auto-created topics with default configs are a classic source of under-partitioned, under-replicated data."
    },
    {
      title: "Produce keyed records",
      badge: "setup",
      concept: "The console producer with parse.key=true lets you send key:value pairs so you can SEE partition routing: all records with the same key land in the same partition and stay ordered relative to each other. This is the single most important producer behavior to internalize hands-on.",
      navLabel: "Command:",
      nav: "Type lines like  user7:placed order 100  then  user7:placed order 101 — both go to the same partition because the key is identical. Ctrl-C to stop.",
      code: "./kafka-console-producer.sh --topic orders \\\n  --bootstrap-server localhost:9092 \\\n  --property parse.key=true --property key.separator=:\n\n# then type:\n# user7:order-100\n# user7:order-101\n# user3:order-200",
      note: null
    },
    {
      title: "Consume from the beginning, and see offsets",
      badge: "setup",
      concept: "Reading with --from-beginning proves the log is retained and replayable — the records are still there regardless of prior reads. Printing partition/offset/key shows you exactly how records were distributed and ordered within each partition.",
      navLabel: "Command:",
      nav: "This reads all history. Note how records for the same key share a partition and have increasing offsets within it, while different keys may be on different partitions.",
      code: "./kafka-console-consumer.sh --topic orders \\\n  --bootstrap-server localhost:9092 --from-beginning \\\n  --property print.key=true --property print.partition=true \\\n  --property print.offset=true",
      note: null
    },
    {
      title: "Consume as a group and watch offset commits + lag",
      badge: "setup",
      concept: "Passing --group turns your consumer into a member of a consumer group, so Kafka tracks committed offsets for it in the internal __consumer_offsets topic. Run two consumers with the same --group against the 3-partition topic and Kafka assigns partitions between them (up to 3 active consumers). kafka-consumer-groups.sh --describe shows current offset, log-end offset, and LAG — the single most important operational metric.",
      navLabel: "Commands:",
      nav: "Start consumer(s) with --group orders-app, then in another shell describe the group. LAG = how far behind the consumer is. Steadily growing lag = consumers can't keep up; you need more partitions/consumers or faster processing.",
      code: "# terminal A (and optionally B, same group)\n./kafka-console-consumer.sh --topic orders --group orders-app \\\n  --bootstrap-server localhost:9092\n\n# terminal C: inspect the group\n./kafka-consumer-groups.sh --describe --group orders-app \\\n  --bootstrap-server localhost:9092",
      note: "LAG is THE health metric for streaming pipelines. Alert on sustained/growing lag, not on absolute value — a brief spike after a deploy is normal; a monotonic climb is an incident."
    }
  ]
},

producers: {
  intro: {
    title: "Stage 2 — Producers: durability, ordering, and throughput knobs",
    desc: "The producer is where you trade off durability vs. latency vs. throughput. These configs are the ones interviewers probe because getting them wrong silently loses or duplicates data."
  },
  cards: [
    {
      title: "acks — the durability dial (0, 1, all)",
      badge: "core config",
      concept: "acks controls how many replicas must acknowledge a write before the producer considers it successful. acks=0: fire-and-forget, the producer doesn't wait — highest throughput, but a record can be lost with zero notice. acks=1: the leader has written it, but if the leader dies before a follower replicates, the record is lost. acks=all (aka -1): the leader AND all in-sync replicas have it — no data loss as long as one ISR survives. This is the config that most directly decides 'can this pipeline lose data.'",
      navLabel: "The correct pairing:",
      nav: "acks=all is meaningless without min.insync.replicas set on the topic/broker. min.insync.replicas=2 with RF=3 means: a write only succeeds if at least 2 replicas have it, so you can lose one broker and still have the data. acks=all + min.insync.replicas=2 + RF=3 is the standard durable configuration. acks=all with min.insync.replicas=1 still risks loss because 'all in-sync replicas' could be just the leader if followers fell behind.",
      note: "Interview trap: 'acks=all guarantees no data loss.' Only true in combination with min.insync.replicas ≥ 2 and RF ≥ 3. State the full triple."
    },
    {
      title: "Idempotent producer — no duplicates from retries",
      badge: "core config",
      concept: "Without idempotence, a producer retry after a network hiccup (the write succeeded but the ack was lost) creates a DUPLICATE record. enable.idempotence=true makes the producer attach a producer ID and per-partition sequence numbers, so the broker deduplicates retried writes — you get exactly-once delivery to a partition despite retries. Since Kafka 3.0 this is ON by default, along with acks=all and retries set high.",
      navLabel: "What it does and doesn't cover:",
      nav: "Idempotence guarantees no duplicates AND preserves ordering per partition even with retries and max.in.flight.requests up to 5. It does NOT give you exactly-once across multiple partitions/topics or across the whole produce-consume-produce cycle — that's transactions (see the Exactly-Once tab). Idempotence = single-producer, per-partition dedup. Transactions = atomic multi-partition writes.",
      note: "Requirements auto-set by idempotence: acks=all, retries>0, max.in.flight.requests.per.connection ≤ 5. If you manually set acks=1 with idempotence you'll get an error — they're coupled by design."
    },
    {
      title: "Ordering: max.in.flight.requests and why it bites",
      badge: "gotcha",
      concept: "max.in.flight.requests.per.connection is how many un-acked batches the producer will send before waiting. With this > 1 AND idempotence OFF AND retries ON, a failed-then-retried batch can land AFTER a later batch that already succeeded — silently reordering your records within a partition. This is the classic 'my events are out of order and I swore Kafka preserves order' bug.",
      navLabel: "The fix:",
      nav: "Enable idempotence (default in 3.0+): the broker uses sequence numbers to reject out-of-order/duplicate batches, so ordering is preserved even with up to 5 in-flight requests and retries. If for some reason you can't use idempotence and need strict order, set max.in.flight.requests.per.connection=1 (at a throughput cost). Never rely on 'Kafka preserves order' without accounting for this config.",
      note: null
    },
    {
      title: "Partitioning strategy: keys, the sticky partitioner, custom partitioners",
      badge: "concept",
      concept: "If a record has a key, the default partitioner hashes it (murmur2) mod partition-count → same key always to same partition (per-entity ordering). If the key is null, modern clients use the sticky partitioner: they batch records to one partition until the batch is sent, then rotate — better batching/throughput than pure round-robin while still spreading load. You can also write a custom partitioner for special routing (e.g. geo, tenant isolation).",
      navLabel: "The hazard of hot keys:",
      nav: "Keying guarantees ordering but can create skew — if one key (one whale customer, one popular product) dominates traffic, its partition becomes a hotspot: one consumer overloaded while others idle, and you can't parallelize past it because splitting the key would break ordering. If you don't truly need per-key ordering, prefer null keys (even spread). If you do, watch for skew and consider a composite key (entity + bucket) when ordering can be relaxed to sub-groups.",
      note: "Reminder from the Overview: increasing partition count rehashes keys to new partitions, so historical per-key ordering across the change is not preserved. Plan partition count up front for keyed topics."
    },
    {
      title: "Throughput knobs: batch.size, linger.ms, compression",
      badge: "performance",
      concept: "The producer batches records per partition to amortize network/overhead. batch.size caps a batch's bytes; linger.ms is how long the producer waits to fill a batch before sending even if not full. Raising linger.ms (e.g. 5–50ms) and batch.size trades a little latency for much higher throughput and better compression ratios. compression.type (lz4, zstd, snappy, gzip) compresses whole batches — bigger batches compress better, cutting network and disk dramatically.",
      navLabel: "Sensible defaults for a throughput-oriented pipeline:",
      nav: "linger.ms=5-20, batch.size=64KB-256KB, compression.type=lz4 or zstd (zstd = best ratio, lz4 = fastest). These three together often 2-5x throughput vs. defaults. For strict low-latency (fraud, alerting) keep linger.ms=0. buffer.memory bounds total unsent data before the producer blocks/errors — size it for your peak burst.",
      code: "props = {\n  'bootstrap.servers': 'localhost:9092',\n  'acks': 'all',\n  'enable.idempotence': True,\n  'compression.type': 'zstd',\n  'linger.ms': 10,\n  'batch.size': 131072,\n}",
      note: null
    }
  ]
},

consumers: {
  intro: {
    title: "Stage 3 — Consumers, groups, rebalancing, and delivery semantics",
    desc: "Consumer groups are how Kafka scales reads and how it does load balancing + fault tolerance. Offset management and rebalancing are where at-least-once vs at-most-once vs exactly-once is actually decided."
  },
  cards: [
    {
      title: "Consumer groups: the unit of scaling and fan-out",
      badge: "concept",
      concept: "A consumer group is a set of consumers sharing a group.id that collectively read a topic, with each partition assigned to exactly ONE consumer in the group at a time. So within a group, max useful parallelism = number of partitions; extra consumers sit idle. Different groups are independent — each group gets its own copy of the stream and its own offsets. That's how one topic feeds, say, a warehouse-loader group AND a real-time-alerting group simultaneously, each at its own pace.",
      navLabel: "The two dimensions:",
      nav: "Scaling WITHIN a group (add consumers up to partition count) = parallel processing of one logical consumer. Multiple groups = fan-out to different applications. This is why partition count sets your ceiling on horizontal consumer scaling — if you have 6 partitions, a 7th consumer in that group does nothing. Size partitions for your worst-case required consumer parallelism.",
      note: null
    },
    {
      title: "Offsets: where 'exactly-once vs at-least-once' is really decided",
      badge: "core concept",
      concept: "A consumer tracks its position via committed offsets (stored in __consumer_offsets). The ORDER of 'process the record' vs 'commit the offset' decides your delivery semantics. Commit-then-process: if you crash after commit but before processing, you SKIP records → at-most-once (possible loss). Process-then-commit: if you crash after processing but before commit, you REPROCESS on restart → at-least-once (possible duplicates). Most pipelines choose at-least-once + idempotent downstream writes.",
      navLabel: "The default and its trap:",
      nav: "enable.auto.commit=true auto-commits every auto.commit.interval.ms (5s default) in the background — convenient but means you can commit offsets for records you haven't finished processing (loss) OR reprocess up to 5s of records on crash. For correctness-critical pipelines, set enable.auto.commit=false and commit manually AFTER the downstream write succeeds. This gives clean at-least-once.",
      note: "The pragmatic production pattern: at-least-once delivery + idempotent/upsert writes to the sink (keyed by a business ID). You accept possible reprocessing and make it harmless, rather than chasing perfect exactly-once end-to-end."
    },
    {
      title: "Rebalancing: what triggers it and why it hurts",
      badge: "deep-dive",
      concept: "When a consumer joins/leaves (deploy, crash, scale, or a slow consumer missing heartbeats), the group coordinator triggers a rebalance to reassign partitions. In the classic 'eager' protocol this is stop-the-world: ALL consumers stop, revoke everything, and get new assignments — a pause that can spike lag. Frequent rebalances (from tight timeouts or slow processing) are a top real-world Kafka pain point.",
      navLabel: "How modern Kafka reduces the pain:",
      nav: "Cooperative (incremental) rebalancing (CooperativeStickyAssignor, the modern default) only moves the partitions that need to move instead of revoking everything — far less disruption. Static group membership (group.instance.id) lets a consumer restart (e.g. a rolling deploy) WITHOUT triggering a rebalance, as long as it returns within session.timeout.ms. Tuning max.poll.interval.ms up for slow batch processing prevents the coordinator from wrongly evicting a busy-but-alive consumer.",
      note: "Common root cause of 'random rebalances': processing a batch takes longer than max.poll.interval.ms, so the consumer misses its poll deadline and is kicked out, which triggers a rebalance, which slows everyone, which causes more misses. Fix: reduce max.poll.records or raise max.poll.interval.ms."
    },
    {
      title: "Heartbeats, poll loop, and liveness",
      badge: "concept",
      concept: "Two separate timers keep a consumer 'alive' in its group. session.timeout.ms: a background heartbeat thread must heartbeat within this window or the consumer is declared dead. max.poll.interval.ms: the application must call poll() again within this window — it proves the app isn't stuck processing. Missing either evicts the consumer and triggers a rebalance. They're decoupled precisely so a slow-but-alive processor (long max.poll.interval) still heartbeats fine.",
      navLabel: "Tuning guidance:",
      nav: "If your per-record processing is heavy (calling an API, writing to a slow DB), either lower max.poll.records so each poll's batch finishes within max.poll.interval.ms, or raise max.poll.interval.ms. Keep session.timeout.ms modest (e.g. 10–45s) so genuinely dead consumers are detected quickly. Don't do heavy work on the heartbeat thread — it must stay responsive.",
      note: null
    },
    {
      title: "Reading position: auto.offset.reset and seeking",
      badge: "concept",
      concept: "When a consumer group has NO committed offset for a partition (brand new group, or offsets expired), auto.offset.reset decides where to start: 'earliest' (from the beginning of retained log — full replay) or 'latest' (only new records from now on). This ONLY applies when there's no valid committed offset; an existing group resumes from its commit. You can also programmatically seek() to a specific offset or timestamp for targeted replay/backfill.",
      navLabel: "Why this bites people:",
      nav: "A new consumer group with 'latest' silently skips everything already in the topic — teams expect to see historical data and don't. A group with 'earliest' that gets its offsets reset reprocesses the entire retained log — which can be huge. Know which one you want, and remember it only fires when no committed offset exists. For controlled backfills, seek to a timestamp (offsetsForTimes) rather than reprocessing everything.",
      note: null
    }
  ]
},

architecture: {
  intro: {
    title: "Stage 4 — Internals: replication, ISR, the log on disk, retention, compaction",
    desc: "This is the tab that separates 'I've used Kafka' from 'I understand Kafka.' Replication mechanics, how the log is physically stored, and the two retention modes are the deep-dive questions at senior level."
  },
  cards: [
    {
      title: "Replication and the ISR (in-sync replicas)",
      badge: "deep-dive",
      concept: "Each partition has one leader and RF-1 followers. Followers continuously fetch from the leader to stay caught up. The ISR is the set of replicas (including the leader) that are 'sufficiently caught up' — within replica.lag.time.max.ms of the leader. A record is COMMITTED (safe, visible to consumers) once all ISR members have it. If a follower falls behind, it's dropped from the ISR; when it catches up, it rejoins. Leader election only ever picks from the ISR (by default), so a promoted leader always has all committed data.",
      navLabel: "The durability guarantee, precisely:",
      nav: "Committed data survives as long as at least one ISR member survives. With acks=all + min.insync.replicas=2, a write only commits when ≥2 replicas have it, so losing one broker never loses committed data. The high-water mark is the highest offset all ISR members have — consumers can only read up to it, which is why an under-replicated partition can appear to 'stall' consumers even though the leader has newer data.",
      note: "unclean.leader.election.enable=false (the safe default) means if all ISR replicas die, the partition goes offline rather than electing an out-of-sync replica and silently losing data. Setting it true trades durability for availability — rarely the right call for data pipelines."
    },
    {
      title: "The controller and leadership (KRaft)",
      badge: "deep-dive",
      concept: "One broker (or dedicated controller node in KRaft) acts as the controller: it manages partition leadership, tracks broker liveness, and drives leader elections when a broker fails. In KRaft, controllers form a Raft quorum and the cluster metadata itself is a replicated log the controllers agree on — so failover of the controller is just Raft leader election, and metadata changes propagate as log records brokers replay. This is what removed the ZooKeeper dependency and massively scaled the partition ceiling.",
      navLabel: "Why it scales better than ZooKeeper era:",
      nav: "In the ZooKeeper era, controller failover meant reloading all partition state from ZooKeeper — slow, and it capped practical partition counts (tens of thousands per cluster). KRaft treats metadata as an incremental event log, so failover is fast and clusters handle millions of partitions. If asked 'what's the controller and what changed with KRaft', that's the answer.",
      note: null
    },
    {
      title: "How the log is stored: segments, indexes, zero-copy",
      badge: "deep-dive",
      concept: "Each partition is a directory of segment files. The active segment is appended to; when it hits segment.bytes or segment.ms it's rolled closed and a new one opens. Alongside each segment are offset and time indexes for fast seeking. Retention and compaction operate at the SEGMENT level (delete/compact whole closed segments), never mid-segment — which is why the active segment is never deleted and why very large segments delay retention. Reads use the OS page cache + sendfile (zero-copy): data goes disk→NIC without passing through the JVM heap, which is a big part of Kafka's throughput.",
      navLabel: "Operational consequences:",
      nav: "Kafka relies heavily on the OS page cache, so give brokers plenty of RAM but DON'T give the JVM a huge heap (6–8GB is typical) — you want RAM available for the page cache, not the heap. Sequential writes mean cheap spinning disks or SSDs both work well; the access pattern, not raw IOPS, is the point. segment.ms/segment.bytes affect how promptly retention/compaction can reclaim space.",
      note: null
    },
    {
      title: "Retention: time/size deletion vs. log compaction",
      badge: "core concept",
      concept: "Kafka has two cleanup policies. delete (default): drop segments older than retention.ms or beyond retention.bytes — a rolling window of recent events (e.g. keep 7 days). compact: keep at least the LATEST value for each key forever, garbage-collecting superseded older values for that key. Compaction turns a topic into a durable, replayable 'changelog' / materialized latest-state store (a null value for a key is a 'tombstone' that deletes it). You can even combine compact+delete.",
      navLabel: "When to use compaction:",
      nav: "Use compaction for keyed state you want the latest of: CDC snapshots (latest row per PK), user profiles, config, Kafka Streams state changelogs. A new consumer can rebuild full current state by reading a compacted topic start-to-finish. Use delete for event streams where history matters for a window but not forever (clicks, logs, metrics). Getting this wrong — using delete for a state topic — means a fresh consumer can't rebuild state after retention expires.",
      note: "Compaction guarantees the latest value per key survives, NOT that every intermediate value is gone immediately — recent updates in the active/uncompacted head are still there until compaction runs. It's 'eventually only the latest', not a live upsert store."
    },
    {
      title: "Delivery guarantees end-to-end, and where each is lost",
      badge: "concept",
      concept: "Kafka's per-hop guarantees compose into end-to-end semantics. At-most-once: never redeliver, may lose (commit before process, or acks=0). At-least-once: never lose, may duplicate (process before commit, acks=all + retries) — the common default. Exactly-once: neither lose nor duplicate — requires the idempotent producer + transactions on the produce side AND read-process-write within a transaction, OR at-least-once + idempotent sink.",
      navLabel: "The honest senior answer:",
      nav: "'True exactly-once end-to-end is achievable within Kafka (Streams/transactions) but across external systems it usually means at-least-once delivery plus idempotent writes keyed by a business ID — you make reprocessing harmless rather than impossible.' Interviewers respect that far more than claiming magic exactly-once everywhere. The next tab covers the mechanism.",
      note: null
    }
  ]
},

eos: {
  intro: {
    title: "Stage 5 — Exactly-once semantics: transactions and the read-process-write loop",
    desc: "EOS is the most misunderstood Kafka topic. It's real, but narrow: it covers Kafka-to-Kafka atomic writes and consumer offset commits within one transaction. Know exactly what it guarantees and what it doesn't."
  },
  cards: [
    {
      title: "Idempotence vs. transactions — two different guarantees",
      badge: "core concept",
      concept: "Idempotent producer (enable.idempotence=true): dedups retried writes to a SINGLE partition using a producer ID + sequence numbers. It stops retries from creating duplicates and preserves per-partition order. Transactions (transactional.id + beginTransaction/commitTransaction): make writes across MULTIPLE partitions/topics AND the consumer offset commit ATOMIC — all appear together or not at all. Idempotence is the building block; transactions layer atomic multi-partition commit on top.",
      navLabel: "What each unlocks:",
      nav: "Idempotence alone = no duplicate on retry, per-partition. Add transactions = atomically write to several topics/partitions and commit your consumed offsets in the same transaction, so a consumer either sees the whole output batch or none of it, and offsets never advance without the output being durable. This is the foundation of exactly-once STREAM PROCESSING.",
      note: null
    },
    {
      title: "The read-process-write loop and read_committed",
      badge: "deep-dive",
      concept: "Exactly-once stream processing = consume from topic A, transform, produce to topic B, and commit A's offsets — all inside ONE transaction. If the app crashes mid-loop, the transaction aborts: the output to B is never made visible and A's offsets never advance, so on restart it reprocesses cleanly with no duplicate output. Downstream consumers must set isolation.level=read_committed so they only see records from committed transactions (aborted/in-flight transactional records are filtered out).",
      navLabel: "The key configs:",
      nav: "Producer: transactional.id (stable per logical producer instance), enable.idempotence=true (implied). Consumer feeding the loop: enable.auto.commit=false (offsets are committed via the producer's sendOffsetsToTransaction, not the consumer). Downstream consumers: isolation.level=read_committed. Miss read_committed and downstream readers will see uncommitted/aborted data, defeating the purpose.",
      code: "producer.initTransactions()\nwhile True:\n  records = consumer.poll()\n  producer.beginTransaction()\n  for r in records:\n    producer.send('out', transform(r))\n  producer.sendOffsetsToTransaction(offsets, consumer_group_metadata)\n  producer.commitTransaction()   # atomic: output + offsets together",
      note: null
    },
    {
      title: "Kafka Streams: exactly-once for free (processing.guarantee)",
      badge: "concept",
      concept: "Implementing the transactional loop by hand is error-prone. Kafka Streams wraps it: set processing.guarantee=exactly_once_v2 and the framework handles transactional produce, offset commits, and its internal state-store changelogs atomically. For Kafka-to-Kafka processing (joins, aggregations, windowing), this is the pragmatic way to get real EOS without writing transaction plumbing yourself.",
      navLabel: "The boundary of the guarantee:",
      nav: "EOS (Streams or manual transactions) is exactly-once for Kafka→Kafka. The moment your sink is an EXTERNAL system (Postgres, S3, Snowflake, an HTTP API), Kafka transactions can't span it — you're back to at-least-once at that boundary and must make the external write idempotent (upsert on a key, dedup by event ID, or use a Connect sink with its own exactly-once support). Always name where the transactional boundary ends.",
      note: "exactly_once_v2 (Kafka 2.5+) is far more efficient than the original — it uses one producer per instance instead of per-partition. Older docs mention exactly_once (v1); v2 is the current answer."
    },
    {
      title: "Cost and when NOT to use EOS",
      badge: "trade-off",
      concept: "Transactions add overhead: extra coordination round-trips, transaction markers written to the log, and read_committed consumers buffer until they see the commit marker (adding a little latency). For high-throughput pipelines where duplicates are cheaply deduped downstream, at-least-once + idempotent sink is often faster AND simpler.",
      navLabel: "Decision rule:",
      nav: "Use EOS/transactions when reprocessing produces WRONG results that are hard to fix downstream (double-counting money, non-idempotent side effects you can't dedup). Skip it when your sink can naturally upsert by a business key — then at-least-once delivery is harmless and you avoid the transactional overhead and operational complexity. 'Exactly-once everywhere' is usually over-engineering; scope it to the paths that actually need it.",
      note: null
    }
  ]
},

ecosystem: {
  intro: {
    title: "Stage 6 — The ecosystem: Connect, Schema Registry, Streams, ksqlDB",
    desc: "In real data engineering you rarely write raw producers/consumers for integration — you use Kafka Connect for I/O, Schema Registry for governance, and a stream processor for transforms. Knowing where each fits is expected at senior level."
  },
  cards: [
    {
      title: "Kafka Connect — integration without writing consumers",
      badge: "concept",
      concept: "Kafka Connect is a framework + runtime for streaming data IN (source connectors) and OUT (sink connectors) of Kafka with just configuration, no custom code. Source examples: Debezium (CDC from Postgres/MySQL/Mongo), JDBC source. Sink examples: S3, Snowflake, Elasticsearch, JDBC. It runs as a distributed cluster of workers, handles offset tracking, retries, scaling, and dead-letter queues for bad records. For 'get data from a DB into Kafka' or 'land Kafka into S3/warehouse', Connect is almost always the right answer over a hand-rolled consumer.",
      navLabel: "Why DEs reach for it first:",
      nav: "It's declarative, fault-tolerant, and horizontally scalable, and the connector ecosystem covers most systems you'd integrate. Debezium CDC → Kafka → S3/Snowflake sink is one of the most common modern ingestion patterns. Writing that by hand means reimplementing offset management, retries, schema handling, and scaling that Connect already gives you. Reserve custom consumers for genuine business logic, not plumbing.",
      note: "Connect supports Single Message Transforms (SMTs) for light per-record tweaks (rename fields, mask, route) inline — but heavy transformation/joins belong in a real stream processor, not SMTs."
    },
    {
      title: "Schema Registry — contracts and safe evolution",
      badge: "core concept",
      concept: "Kafka values are just bytes; without governance, a producer changing its JSON shape silently breaks every consumer. Schema Registry stores versioned schemas (Avro/Protobuf/JSON Schema) and enforces compatibility rules on new versions. Producers register/validate the schema and send a small schema ID + compact binary payload; consumers fetch the schema by ID to deserialize. This gives you a real data contract between teams and prevents 'someone changed the payload and prod broke.'",
      navLabel: "Compatibility modes you must know:",
      nav: "BACKWARD (default): new schema can read old data — safe to add optional fields / remove fields; upgrade CONSUMERS first. FORWARD: old schema can read new data; upgrade PRODUCERS first. FULL: both. The direction dictates deploy order, which is a real interview question. Adding a field with a default is the canonical backward-compatible change; removing a required field or changing a type is breaking.",
      note: "Avro + Schema Registry is the classic combo for compact, evolvable, self-describing data. Protobuf is common where teams already standardize on it. Raw JSON without a registry is convenient but abandons the contract — fine for logs, risky for pipelines."
    },
    {
      title: "Stream processing: Kafka Streams vs. ksqlDB vs. Flink/Spark",
      badge: "concept",
      concept: "Kafka Streams: a JVM LIBRARY (not a cluster) you embed in your app to do stateful transforms, joins, windowed aggregations with exactly-once — you run it like any other service. ksqlDB: SQL over Kafka Streams for people who want streaming transforms without writing Java. Flink / Spark Structured Streaming: separate distributed engines, better when you need very large state, complex event-time processing, or to unify with big batch workloads. All consume/produce Kafka topics.",
      navLabel: "How to choose:",
      nav: "Kafka Streams when the processing lives naturally inside a JVM microservice and you don't want another cluster. ksqlDB for SQL-first, quick streaming ETL/enrichment. Flink for the most demanding event-time/stateful/low-latency use cases at scale. Spark Structured Streaming when you're already a Spark/Databricks shop and want one engine for batch + stream. There's no single right answer — the interviewer wants to see you weigh operational footprint vs. capability.",
      note: null
    },
    {
      title: "Schemas in the pipeline: putting it together",
      badge: "pattern",
      concept: "A typical modern DE pipeline: Debezium (Connect source) captures row changes from Postgres → publishes Avro to a compacted 'cdc.orders' topic with schemas in Schema Registry → a stream processor (Streams/Flink/Spark) enriches/joins → writes to a curated topic → an S3 or Snowflake sink connector lands it in the lake/warehouse. Kafka is the durable, replayable spine; Connect handles the edges; Schema Registry keeps the contracts; the processor holds the logic.",
      navLabel: "Why this shape recurs:",
      nav: "Each system does one thing and is independently scalable/replaceable. CDC decouples ingestion from source DB load; the compacted topic gives replayable latest-state; the registry prevents breaking changes; Connect sinks mean you don't hand-code loaders. Being able to draw this end-to-end and justify each hop is exactly what a 5+ YOE Kafka/DE interview is looking for.",
      note: null
    }
  ]
},

ops: {
  intro: {
    title: "Stage 7 — Production ops, monitoring, tuning, and best practices",
    desc: "The operational reality: what to monitor, how to size, and the mistakes that cause 2am pages. This is where experience shows — anyone can produce/consume; keeping it healthy at scale is the differentiator."
  },
  cards: [
    {
      title: "The metrics that matter: consumer lag first",
      badge: "monitoring",
      concept: "Consumer lag (log-end-offset − committed-offset, per partition) is THE health metric — it's how far behind your processing is from real time, in records. Also watch: under-replicated partitions (>0 means a broker is behind/down — durability at risk), offline partitions (>0 = data unavailable), request handler idle ratio (low = brokers saturated), and per-broker disk usage. ISR shrink/expand rate flags flapping replicas.",
      navLabel: "How to alert well:",
      nav: "Alert on SUSTAINED, GROWING lag, not absolute numbers or brief spikes (a deploy always causes a short spike). Under-replicated partitions > 0 for more than a few minutes is a real durability alert. Offline partitions > 0 is a page-now incident. Tools: Kafka's JMX metrics into Prometheus/Grafana, Burrow or the built-in kafka-consumer-groups for lag, plus Cruise Control for balancing.",
      note: "Lag in records can mislead if record sizes vary — for SLAs, time-lag (how old is the oldest unprocessed record) is often the more honest metric."
    },
    {
      title: "Sizing partitions and brokers",
      badge: "capacity",
      concept: "Partition count sets consumer parallelism and is hard to change safely later (increasing rehashes keys; you can't decrease). Estimate from throughput: partitions ≈ max(target_throughput/per_partition_throughput, required_consumer_parallelism), with headroom for growth. But avoid the opposite extreme — tens of thousands of partitions per broker inflate metadata, file handles, and recovery time. Broker count is driven by total throughput, storage (RF × retention × ingest), and fault tolerance (RF=3 needs ≥3 brokers).",
      navLabel: "Rules of thumb:",
      nav: "Storage per broker ≈ (daily ingest × RF × retention_days) / broker_count, plus headroom (keep disks <70% full). Keep partitions-per-broker in the low thousands, not tens of thousands (better with KRaft than the old ZK ceiling, but still bounded by recovery time). Prefer fewer, well-sized partitions over many tiny ones. Plan partition count for 2–3x current peak so you're not forced into a disruptive increase soon.",
      note: null
    },
    {
      title: "Broker/OS tuning: page cache, heap, disks",
      badge: "performance",
      concept: "Kafka's speed comes from sequential I/O + the OS page cache + zero-copy sendfile. So the tuning is counterintuitive for a JVM app: keep the JVM heap MODEST (6–8GB), and leave the rest of RAM for the page cache — that's what serves reads without hitting disk. Use multiple data directories across separate disks (JBOD) or fast SSDs; don't put Kafka logs on a network/remote filesystem. Prefer a low-pause GC (G1/ZGC) since long GC pauses can cause the broker to miss ZK/controller sessions and flap.",
      navLabel: "Common misconfigurations:",
      nav: "Giving Kafka a huge 32GB+ heap 'because it's important' — this starves the page cache and hurts throughput. Running RF=1 to save disk — one failure = permanent loss. Putting brokers on the same disks as another heavy service — I/O contention wrecks the sequential-write assumption. Ignoring open-file-descriptor limits — many partitions/segments need high ulimit -n.",
      note: null
    },
    {
      title: "Common failure modes and anti-patterns",
      badge: "gotchas",
      concept: "The recurring production problems: (1) rebalance storms from processing longer than max.poll.interval.ms; (2) hot partitions from a skewed key; (3) a consumer group with fewer partitions than consumers (idle consumers) or far more partitions than consumers (each consumer overloaded); (4) using delete retention on a topic that's actually state (fresh consumers can't rebuild); (5) RF=1 or min.insync.replicas=1 with acks=all giving false durability confidence; (6) unbounded lag because processing is synchronous per-record against a slow external system.",
      navLabel: "How seniors avoid them:",
      nav: "Right-size max.poll.records vs. processing time; watch for key skew and reconsider keying; match partition count to real consumer parallelism; choose compaction for state topics; always state RF=3 + min.insync.replicas=2 + acks=all as the durable triple; and batch/parallelize slow sink writes (or push to Connect) instead of blocking the poll loop. Knowing these by name is the mark of someone who's operated Kafka, not just used it.",
      note: null
    },
    {
      title: "Security and multi-tenancy essentials",
      badge: "best practice",
      concept: "Production Kafka is secured on three axes: encryption in transit (TLS on the listeners), authentication (SASL — SCRAM, or mTLS, or OAuth), and authorization (ACLs granting principals read/write/create on specific topics/groups). Quotas limit per-client produce/consume rate and request rate so one noisy tenant can't starve others. In multi-tenant clusters, topic naming conventions + ACLs + quotas are how you isolate teams on shared infrastructure.",
      navLabel: "The pragmatic baseline:",
      nav: "TLS everywhere, SASL/SCRAM (or mTLS) for auth, ACLs deny-by-default with explicit grants, and quotas on shared clusters. Managed offerings (Confluent Cloud, MSK, Aiven) handle much of this for you, which is increasingly the default rather than self-hosting. If asked about securing Kafka, name all three (encryption / authN / authZ) plus quotas — a common gap is people mentioning only TLS.",
      note: null
    }
  ]
},

patterns: {
  intro: {
    title: "Stage 8 — Multi-DC/DR, error handling, and stream-processing patterns",
    desc: "The topics that separate 'operated Kafka' from 'architected an event platform': cross-region disaster recovery, robust error handling (retry topics + DLQ), the transactional outbox for reliable event publishing, Kafka Streams internals, and the storage/placement features (tiered storage, rack awareness) senior/staff loops probe."
  },
  cards: [
    {
      title: "Cross-region DR: MirrorMaker 2 vs. Cluster Linking",
      badge: "disaster recovery",
      concept: "Kafka doesn't stretch a single cluster across regions well (replication is synchronous within the ISR — high inter-region latency would cripple it). Instead you run a cluster per region and replicate BETWEEN them. MirrorMaker 2 (open-source, Connect-based) consumes from a source cluster and produces to a target, also replicating consumer offsets and topic configs; topics are prefixed (e.g. 'us-east.orders') so you can tell origin. Confluent Cluster Linking is a broker-native alternative that mirrors topics byte-for-byte and preserves offsets exactly (no translation needed), at the cost of being a Confluent feature.",
      navLabel: "Active-passive vs. active-active:",
      nav: "Active-passive: one region takes all traffic, the other is a warm standby you fail over to — simpler, no conflict handling, but you waste the standby and face offset-translation gotchas on failover. Active-active: both regions serve traffic and replicate to each other — better utilization and lower RTO, but you must prevent replication loops (MM2's topic prefixing handles this) and handle the fact that the same logical event may exist under two names. Most orgs start active-passive because it's far simpler to reason about.",
      note: "The hard part of DR isn't replication — it's consumer failover. With MM2, offsets are TRANSLATED (source offset N ≠ target offset N), so on failover a consumer must resume via MM2's offset-sync/checkpoint topics, not by reusing raw offsets. Cluster Linking avoids this by preserving offsets. Always state RPO (how much data you can lose — bounded by replication lag) and RTO (how fast you fail over) explicitly."
    },
    {
      title: "Error handling: retry topics and the dead-letter queue",
      badge: "reliability pattern",
      concept: "A consumer that fails on a bad ('poison pill') record has three bad options: crash-loop forever, skip silently (data loss), or block the whole partition retrying one record (head-of-line blocking — everything behind it stalls). The production pattern is non-blocking retries: on failure, publish the record to a RETRY topic and commit the original offset so the partition keeps moving. A separate consumer processes the retry topic (often with a delay), and after N attempts the record goes to a DEAD-LETTER TOPIC (DLQ) for manual/automated inspection instead of being lost or blocking forever.",
      navLabel: "Why tiered retry topics (retry-5s, retry-1m, retry-10m):",
      nav: "A single retry topic reprocessed immediately just crash-loops on genuinely-broken records. Tiered retry topics with increasing delays give transient failures (a downstream service is briefly down) time to recover, while permanent failures drain through the tiers into the DLQ without blocking live traffic. This is the Uber/Confluent-documented pattern. Kafka Connect has built-in DLQ support (errors.tolerance=all + errors.deadletterqueue.topic.name) for sink connectors, so you don't hand-build it there.",
      note: "Trade-off to name: retry topics BREAK per-partition ordering for the retried records (they're reprocessed later, out of order relative to the original stream). If strict ordering matters more than throughput, you may instead have to block-and-retry in place. Know which your use case needs — it's a real interview follow-up."
    },
    {
      title: "The transactional outbox — reliable event publishing without dual-write",
      badge: "design pattern",
      concept: "The dual-write problem: a service that must both update its own database AND publish a Kafka event can't do both atomically — if it commits the DB row then crashes before publishing (or vice versa), the two systems diverge, and there's no distributed transaction across Postgres and Kafka. The outbox pattern solves it: within the SAME local DB transaction, the service writes the business row AND inserts the event into an 'outbox' table. Because it's one transaction, they commit or roll back together. A separate process then reads the outbox and publishes to Kafka.",
      navLabel: "How the outbox is drained — CDC, not polling:",
      nav: "The clean implementation uses CDC (Debezium) to tail the outbox table's write-ahead log and publish each new outbox row to Kafka — no polling load on the DB, and Debezium's own at-least-once delivery means the event WILL eventually reach Kafka. Consumers dedupe by the event's unique ID (idempotent consumption), so at-least-once from the outbox is harmless. This is THE canonical answer to 'how do you reliably publish events from a service' and pairs directly with the CDC pipeline from the Ecosystem tab.",
      note: "Why not just publish to Kafka inside the request and skip the DB? Because then a Kafka outage fails your business write, and a crash between the two writes silently drops events. The outbox makes the DB the single source of truth and Kafka delivery eventually-consistent but guaranteed."
    },
    {
      title: "Kafka Streams internals: KStream vs. KTable and state stores",
      badge: "stream processing",
      concept: "Kafka Streams models a topic two ways. A KStream is an unbounded stream of independent events (each record is a fact: 'user clicked') — you process every record. A KTable is a changelog interpreted as a table: each record is an UPSERT for its key ('user's current plan = pro'), so only the latest value per key matters — it's the compacted-topic idea as a first-class abstraction. Stateful operations (aggregations, joins) keep their state in a local STATE STORE (RocksDB on disk per instance), and every update is also written to a compacted CHANGELOG topic in Kafka so the state can be rebuilt on another instance after a failure — that's how Streams gets fault-tolerant local state.",
      navLabel: "Why the changelog is the key idea:",
      nav: "The local RocksDB store is fast but ephemeral (tied to one instance). By mirroring every state change to a compacted Kafka topic, Streams makes state durable and relocatable: if an instance dies, another reads the changelog to restore the exact state before resuming. This is also why Streams' exactly-once must include the changelog writes in its transaction — state and output must commit atomically. Interactive Queries let you read these state stores directly, turning a Streams app into a queryable materialized view.",
      note: "KStream-KTable is a common interview probe: use a KStream for events you act on individually (transactions, clicks), a KTable for current-state you enrich against (user profile, product catalog). A stream-table join enriches each event with the latest table value — the bread-and-butter of streaming enrichment."
    },
    {
      title: "Windowing and joins in stream processing",
      badge: "stream processing",
      concept: "Aggregating an unbounded stream requires WINDOWS to bound the computation. Tumbling: fixed, non-overlapping (count per 1-min bucket). Hopping: fixed size, overlapping by a step (5-min window every 1 min). Sliding: window defined by the time between events. Session: dynamic windows that close after a gap of inactivity (a user's browsing session). Windows are driven by EVENT TIME (when it happened) not processing time, which is why watermarks/grace periods exist — to decide how long to wait for late-arriving events before finalizing a window.",
      navLabel: "Join types and their constraints:",
      nav: "Stream-stream joins require a window (you can't hold two unbounded streams in memory forever — you join events within N minutes of each other). Stream-table joins are unwindowed — each stream event looks up the current table value (enrichment). Table-table joins keep two changelogs joined as a materialized result. The recurring gotcha: joining two streams without thinking about the window means either missed matches (window too small) or unbounded state (window too large). Late data + watermarks is where correctness actually lives.",
      note: "This maps directly onto Spark Structured Streaming's watermark/windowing model (see the Spark module) — the concepts transfer; the API differs. Being able to say 'event-time windowing with watermarks for late data' fluently is a senior streaming signal regardless of engine."
    },
    {
      title: "Storage & placement: tiered storage and rack awareness",
      badge: "scaling",
      concept: "Tiered storage (KIP-405, GA in Kafka 3.6+): brokers keep only recent data on local disk and offload older log segments to cheap object storage (S3/GCS), while the topic still looks like one continuous log to clients. This decouples retention from local disk size — you can keep months of replayable history without giant broker disks, and scaling compute no longer means moving terabytes of data. Rack awareness (broker.rack): Kafka spreads a partition's replicas across racks/availability zones so a whole-rack/AZ failure never takes out all copies; follower fetching (KIP-392) then lets consumers read from a same-AZ replica to cut cross-AZ network cost.",
      navLabel: "Why these matter at senior level:",
      nav: "Tiered storage changes capacity planning: you size local disk for hot data + throughput, not total retention, and long-retention 'replay everything' use cases (reprocessing after a bug, bootstrapping a new consumer over months of history) become cheap. Rack awareness + follower fetching is the standard multi-AZ durability + cost setup on cloud — mentioning replica placement across AZs and same-AZ reads shows you've run Kafka on real cloud infrastructure, not just localhost.",
      note: null
    }
  ]
},

comparison: {
  intro: {
    title: "Kafka vs. the alternatives — when NOT to reach for Kafka",
    desc: "Senior candidates are expected to know Kafka's boundaries: how it differs from traditional message brokers and from cloud-native streaming, and when a simpler tool is the right call."
  },
  cards: [
    {
      title: "Kafka vs. RabbitMQ / traditional message queues",
      badge: "trade-off",
      concept: "RabbitMQ (and SQS/ActiveMQ) are message brokers optimized for per-message delivery, routing, and typically deleting a message once consumed/acked. Kafka is a retained, replayable log optimized for high-throughput streaming and multiple independent consumers reading the same data. RabbitMQ shines at complex routing (exchanges, per-message TTL, priority, dead-lettering) and task/work queues; Kafka shines at durable event streaming, replay, and fan-out to many consumers at scale.",
      navLabel: "Decision rule:",
      nav: "Choose RabbitMQ when you need a work/task queue with sophisticated routing, per-message acknowledgment/priority, and modest throughput. Choose Kafka when you need durable, replayable event streams, very high throughput, multiple independent consumers of the same stream, or a buffer/source-of-truth between systems. 'RPC-style task dispatch' → RabbitMQ; 'event streaming backbone / analytics ingestion' → Kafka.",
      code: null,
      note: null
    },
    {
      title: "Kafka vs. AWS Kinesis / cloud-native streaming",
      badge: "trade-off",
      concept: "Kinesis (and Google Pub/Sub) are managed streaming services with a similar shard/partition + retained-log model, but fully hosted — no brokers to run. Trade-offs: less operational burden and tight cloud integration, but vendor lock-in, different (often smaller) retention/throughput ceilings per shard, and a smaller ecosystem than Kafka's Connect/Streams. Managed KAFKA (MSK, Confluent Cloud, Aiven) is a third option: Kafka's API and ecosystem without self-hosting brokers.",
      navLabel: "How to frame it:",
      nav: "If you're all-in on one cloud, want minimal ops, and Kafka's ecosystem isn't essential — Kinesis/Pub/Sub is reasonable. If you want Kafka's ecosystem (Connect, Streams, Debezium, Schema Registry), portability across clouds/on-prem, or higher retention/throughput flexibility — use Kafka, most likely via a MANAGED Kafka rather than self-hosting. Self-hosting raw Kafka is increasingly reserved for scale or compliance reasons that justify the ops cost.",
      code: null,
      note: null
    },
    {
      title: "Kafka vs. Pulsar, and 'is Kafka the log or the platform'",
      badge: "context",
      concept: "Apache Pulsar is the main architectural alternative: it separates serving (brokers) from storage (BookKeeper), giving easier independent scaling and tiered storage, plus built-in multi-tenancy and both queue and stream semantics. Kafka has a far larger ecosystem and mindshare, and has been closing gaps (tiered storage, KRaft). For most orgs the ecosystem and hiring pool make Kafka the default; Pulsar is chosen for specific needs (extreme partition/tenant counts, geo-replication, storage/compute separation).",
      navLabel: "The senior framing:",
      nav: "You rarely need to advocate Pulsar in an interview, but knowing it exists and WHY (storage/compute separation, native multi-tenancy) shows depth. The honest take: Kafka's ecosystem (Connect, Streams, Schema Registry, Debezium) and ubiquity usually outweigh Pulsar's cleaner storage architecture unless you have a specific problem it solves. Don't reach for Kafka reflexively either — for a simple app-to-app queue at low volume, Kafka is real operational overhead you may not need.",
      code: null,
      note: null
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — the questions a 5+ YOE DE actually gets asked",
    desc: "Each card is a real Kafka interview question. Form your own answer first, then expand for a model answer that shows senior-level depth, not textbook recitation."
  },
  cards: [
    {
      title: "\"Explain Kafka's core architecture end to end.\"",
      followups: [
        "\"A partition's leader broker dies mid-write — walk me through exactly what the producer and the consumers see.\"",
        "\"Why can't you safely just add partitions to a keyed topic to scale it?\"",
        "\"What does the controller actually do, and how did that change moving from ZooKeeper to KRaft?\""
      ],
      navLabel: "How to approach it:",
      badge: "fundamentals",
      nav: "Don't list features — tell the data's journey and name the primitives as you go. Producer → topic/partition (key→partition) → leader broker → replicated to ISR followers → consumers in groups reading by offset → retention. Land the 'it's a replayable log, not a queue' point.",
      noteLabel: "Model answer:",
      note: "\"Kafka is a distributed, replicated commit log. Producers append records to a topic, which is split into partitions — the unit of ordering and parallelism; a record's key hashes to a partition so all events for one entity stay ordered. Each partition has a leader broker that handles reads/writes and follower replicas that stay in-sync (the ISR); losing the leader promotes an in-sync follower, so committed data survives failure. Consumers read forward by offset and reading doesn't delete data — the log is retained by time or size, so many independent consumer groups can read the same stream at their own pace and replay history. Metadata and leadership are managed by the controller, which in modern Kafka is a KRaft Raft quorum rather than ZooKeeper.\""
    },
    {
      title: "\"How do you guarantee no data loss?\"",
      followups: [
        "\"You set min.insync.replicas=2 with RF=3, and now two of the three brokers are down — what happens to producer writes?\"",
        "\"Everything upstream is acks=all — where can you STILL lose data on the consumer side?\"",
        "\"How would you actually prove there's no loss in production — what test or metric?\""
      ],
      navLabel: "How to approach it:",
      badge: "durability",
      nav: "The trap is answering 'acks=all' alone. State the full triple and explain WHY each piece is needed. Then extend to the consumer side.",
      noteLabel: "Model answer:",
      note: "\"On the producer side: acks=all, replication.factor=3, and min.insync.replicas=2. acks=all alone isn't enough — if only the leader is in-sync, 'all replicas' is just the leader, so min.insync.replicas=2 forces at least two copies before a write commits, letting you lose a broker without losing data. Enable idempotence (default in 3.0+) so retries don't duplicate. On the consumer side, commit offsets only AFTER the downstream write succeeds (process-then-commit), giving at-least-once, and make the sink idempotent so reprocessing is harmless. And keep unclean.leader.election disabled so Kafka never elects an out-of-sync replica and silently drops committed records.\""
    },
    {
      title: "\"At-least-once vs exactly-once — how do you actually achieve exactly-once?\"",
      followups: [
        "\"Concretely, what's the difference between the idempotent producer and transactions?\"",
        "\"Your sink is Snowflake, not another Kafka topic — is exactly-once still possible? How?\"",
        "\"What does a downstream consumer see if a transaction aborts, and which config controls that?\""
      ],
      navLabel: "How to approach it:",
      badge: "deep-dive",
      nav: "Distinguish idempotence from transactions, describe the read-process-write loop, and — critically — name where the exactly-once boundary ends (external sinks).",
      noteLabel: "Model answer:",
      note: "\"Exactly-once within Kafka uses the idempotent producer plus transactions: consume from A, produce to B, and commit A's offsets all inside one transaction via sendOffsetsToTransaction, with downstream consumers set to isolation.level=read_committed so they never see aborted or in-flight output. Kafka Streams gives this with processing.guarantee=exactly_once_v2. But it's exactly-once for Kafka→Kafka only. The moment I write to Postgres, S3, or Snowflake, Kafka's transaction can't span that system, so in practice I do at-least-once delivery plus an idempotent upsert keyed by a business ID — I make reprocessing produce the same result rather than pretending I can prevent it. I scope true transactional EOS to paths where a duplicate is genuinely unfixable, like double-counting money.\""
    },
    {
      title: "\"Your consumer group keeps rebalancing / lag keeps growing. Debug it.\"",
      followups: [
        "\"How do session.timeout.ms and max.poll.interval.ms differ, and which one usually causes the eviction?\"",
        "\"You have 6 partitions and 10 consumers in one group — what are the other 4 doing?\"",
        "\"How would static membership or the cooperative-sticky assignor reduce the blast radius of a rolling deploy?\""
      ],
      navLabel: "How to approach it:",
      badge: "troubleshooting",
      nav: "Give an ordered diagnostic, not 'I'd check the logs.' Show you know the two timers and the common root cause.",
      noteLabel: "Model answer:",
      note: "\"First I'd separate the two symptoms. For rebalances: the usual root cause is processing a batch taking longer than max.poll.interval.ms, so the coordinator thinks the consumer is dead and evicts it — which triggers a rebalance that slows everyone and causes more misses. Fix is lowering max.poll.records so each poll finishes in time, or raising max.poll.interval.ms, and using static membership (group.instance.id) plus the cooperative-sticky assignor so deploys don't do a stop-the-world reassign. For growing lag: check whether consumers = partitions (idle consumers mean I'm partition-bound and need more partitions), look for a hot/skewed partition where one consumer is pinned, and check whether processing is blocked on a slow external call per-record — if so I'd batch or async the sink writes. I'd confirm all this with kafka-consumer-groups --describe for lag and the JMX rebalance-rate metric.\""
    },
    {
      title: "\"When would you use log compaction instead of time-based retention?\"",
      followups: [
        "\"A brand-new consumer joins a compacted topic — can it rebuild full current state? Why?\"",
        "\"How do you fully delete a key from a compacted topic?\"",
        "\"Someone set compaction on an event-stream topic by mistake — what breaks?\""
      ],
      navLabel: "How to approach it:",
      badge: "concept",
      nav: "Contrast event streams vs. state, and give the concrete failure mode of getting it wrong.",
      noteLabel: "Model answer:",
      note: "\"Delete retention keeps a rolling time/size window — right for event streams like clicks or logs where old events stop mattering. Compaction keeps at least the latest value per key forever and GCs superseded values, turning the topic into a replayable changelog of current state. I use compaction for CDC snapshots (latest row per primary key), user profiles, config, or Kafka Streams state changelogs — anything where a brand-new consumer must be able to rebuild full current state by reading the topic start to finish. The classic mistake is using delete retention on a state topic: once retention expires, a fresh consumer can no longer reconstruct state because the older keys were dropped by time, not superseded. A null value is a tombstone that removes a key entirely.\""
    },
    {
      title: "\"How do you choose the number of partitions for a topic?\"",
      followups: [
        "\"You need to double partitions on a live keyed topic — what breaks and how do you handle it?\"",
        "\"What's the downside of just setting 1000 partitions to be safe?\"",
        "\"One key is 10x hotter than the rest — how do you deal with that hot partition without breaking ordering?\""
      ],
      navLabel: "How to approach it:",
      badge: "design",
      nav: "Show you know it's a hard-to-reverse decision and that it trades throughput against overhead and ordering.",
      noteLabel: "Model answer:",
      note: "\"I size for the max of two things: target throughput divided by realistic per-partition throughput, and the consumer parallelism I need — since within a group max useful consumers equals partition count. Then I add headroom, often planning for 2–3x current peak, because increasing partitions later rehashes keys to new partitions and breaks per-key ordering across the change, and you can never decrease. But I don't over-partition: too many partitions inflate metadata, file handles, rebalance time, and produce lots of tiny poorly-compressed batches. So it's a deliberate middle — enough for parallelism and growth, not tens of thousands of tiny partitions. If the topic is keyed for ordering, I also check for key skew that would create a hot partition no amount of partitions can parallelize.\""
    },
    {
      title: "\"Design a real-time pipeline from an operational DB to the warehouse.\"",
      followups: [
        "\"Why CDC off the write-ahead log instead of a JDBC poll on an updated_at column?\"",
        "\"If the source app publishes events itself, how do you avoid the dual-write problem?\" (transactional outbox)",
        "\"The source table's schema changes — how does that not break every downstream consumer?\"",
        "\"How do you make the warehouse load idempotent if a record is delivered twice?\""
      ],
      navLabel: "How to approach it:",
      badge: "system design",
      nav: "Draw the canonical CDC pipeline and justify each hop and each ecosystem choice. This is where Connect + Schema Registry + a processor come together.",
      noteLabel: "Model answer:",
      note: "\"I'd capture changes with Debezium as a Kafka Connect source — CDC off the database's write-ahead log, so I don't add query load to the source DB — publishing Avro to a compacted per-table topic with schemas governed by Schema Registry, so the latest row per primary key is always replayable and schema changes can't silently break consumers. A stream processor (Kafka Streams, Flink, or Spark Structured Streaming depending on the shop) enriches/joins and writes a curated topic. Then a sink connector — Snowflake or an S3 sink for a lake — lands it downstream, with a dead-letter queue for bad records. Delivery is at-least-once with idempotent upserts keyed by primary key so duplicates are harmless. Each stage is independently scalable and replaceable, and Kafka is the durable, replayable spine that decouples source DB load from warehouse load. I'd monitor consumer lag and under-replicated partitions as the health signals.\""
    },
    {
      title: "\"Does Kafka still need ZooKeeper?\"",
      followups: [
        "\"What specifically did KRaft improve besides removing a dependency?\"",
        "\"You're on a ZooKeeper-based cluster today — how do you migrate to KRaft?\""
      ],
      navLabel: "How to approach it:",
      badge: "modern context",
      nav: "A quick check that you're current. Short, correct, and note the migration reality.",
      noteLabel: "Model answer:",
      note: "\"Not anymore. Modern Kafka runs in KRaft mode, where a built-in Raft quorum of controllers manages cluster metadata as a replicated log, replacing ZooKeeper entirely. It was GA from Kafka 3.3, and ZooKeeper mode is deprecated and removed in Kafka 4.0. Beyond dropping a whole system to operate, KRaft makes metadata operations and controller failover much faster and raises the partition ceiling dramatically. Plenty of existing clusters still run ZooKeeper and there's a supported migration path, but any new cluster should be KRaft.\""
    },
    {
      title: "\"Design cross-region disaster recovery for a Kafka pipeline.\"",
      navLabel: "How to approach it:",
      badge: "system design",
      nav: "Lead with 'a cluster per region, replicate between them' — never 'stretch one cluster.' Name the replication tool, the active-passive vs active-active choice, and — critically — the consumer-failover/offset-translation problem, which is the part people forget.",
      noteLabel: "Model answer:",
      note: "\"I'd run one cluster per region and replicate between them rather than stretching a single cluster across regions — synchronous ISR replication over inter-region latency would kill throughput. For replication I'd use MirrorMaker 2 (or Cluster Linking on Confluent), which mirrors topics plus consumer offsets and configs. I'd usually start active-passive: one region serves traffic, the other is a warm standby, which avoids conflict handling. The subtle part is consumer failover: MM2 translates offsets, so offset N on the source isn't offset N on the target — consumers must resume from MM2's offset-sync/checkpoint topics, not raw offsets. Cluster Linking preserves offsets exactly and avoids that. I'd state my RPO as bounded by replication lag and my RTO as how fast consumers cut over, and I'd actually rehearse the failover, because untested DR is theater.\"",
      followups: [
        "\"MirrorMaker translates offsets — what exactly does a consumer do on failover to resume correctly?\"",
        "\"Active-active instead of passive — what new problem do you take on, and how does topic prefixing help?\"",
        "\"What's your RPO here, and what physically determines it?\""
      ]
    },
    {
      title: "\"A consumer hits a record it can never successfully process. What happens, and what should happen?\"",
      navLabel: "How to approach it:",
      badge: "reliability",
      nav: "Name the poison-pill / head-of-line-blocking failure first, then the non-blocking retry-topic + DLQ pattern, then the ordering trade-off it introduces.",
      noteLabel: "Model answer:",
      note: "\"That's a poison pill. The naive outcomes are all bad: crash-loop forever, skip it and lose data, or block the whole partition retrying one record so everything behind it stalls — head-of-line blocking. The production pattern is non-blocking retries: on failure I publish the record to a retry topic and commit the original offset so the partition keeps flowing. A separate consumer works the retry topic, ideally through tiered delays — retry-5s, retry-1m, retry-10m — so transient downstream outages get time to recover, and after N attempts the record lands in a dead-letter topic for inspection instead of being lost or blocking live traffic. For sink connectors, Kafka Connect gives this via errors.tolerance=all and a configured DLQ. The honest trade-off is that retried records are reprocessed out of order relative to the original stream, so if strict ordering matters more than throughput I'd instead block-and-retry in place and accept the stall.\"",
      followups: [
        "\"Why tiered retry topics with increasing delays instead of one retry topic?\"",
        "\"What does this pattern cost you in terms of ordering, and when is that unacceptable?\"",
        "\"How do you make sure the DLQ doesn't just become a place data goes to die?\""
      ]
    },
    {
      title: "\"Your service updates its database AND must publish a Kafka event. How do you keep them consistent?\"",
      navLabel: "How to approach it:",
      badge: "design pattern",
      nav: "This is the dual-write problem — name it explicitly, then give the transactional outbox as the answer, drained by CDC. It's the single most common 'reliable event publishing' question.",
      noteLabel: "Model answer:",
      note: "\"This is the dual-write problem: I can't atomically write to Postgres and publish to Kafka — there's no distributed transaction across them, so a crash between the two writes leaves the systems diverged. The fix is the transactional outbox: inside the same local DB transaction that writes the business row, I also insert the event into an outbox table, so they commit or roll back together — the DB is the single source of truth. Then I drain the outbox to Kafka with CDC — Debezium tailing the outbox table's write-ahead log — rather than polling. Debezium's at-least-once delivery means the event is guaranteed to eventually reach Kafka, and consumers dedupe by the event's unique ID, so at-least-once is harmless. I specifically avoid publishing to Kafka inside the request path, because then a Kafka outage would fail my business write and a crash could silently drop the event.\"",
      followups: [
        "\"Why drain the outbox with CDC instead of a polling job?\"",
        "\"Why not just publish straight to Kafka in the request and skip the outbox table?\"",
        "\"The same event could reach Kafka twice — why is that fine here?\""
      ]
    },
    {
      title: "\"KStream vs KTable — when do you use each, and how does Kafka Streams keep state fault-tolerant?\"",
      navLabel: "How to approach it:",
      badge: "stream processing",
      nav: "Give the fact-vs-current-state distinction, a concrete example of each, then explain the state store + changelog mechanism — that second half is what shows real depth.",
      noteLabel: "Model answer:",
      note: "\"A KStream is an unbounded stream of independent facts — every record matters ('user clicked', 'payment made') — so I use it for events I act on individually. A KTable is a changelog read as a table: each record is an upsert for its key, so only the latest value matters ('user's current plan'), which I use for current-state I enrich against. A stream-table join enriching each event with the latest table value is the bread-and-butter of streaming enrichment. For fault tolerance: stateful operators keep state in a local RocksDB state store, but every update is also written to a compacted changelog topic in Kafka. So if an instance dies, another restores the exact state by replaying the changelog before resuming — that's how local state survives failure and relocates. It's also why exactly-once in Streams has to commit the changelog writes inside the same transaction as the output.\"",
      followups: [
        "\"Where does the local state actually live, and what makes it durable?\"",
        "\"A stream-stream join vs a stream-table join — why does one need a window and the other doesn't?\"",
        "\"How do watermarks / grace periods fit into windowed aggregation here?\""
      ]
    }
  ]
}
};

const COMPARE_META = {
  title: "Kafka vs. RabbitMQ vs. Kinesis — at a glance",
  desc: "The comparison interviewers use to test whether you know Kafka's boundaries, not just its features.",
  headers: ["Dimension", "Apache Kafka", "RabbitMQ", "AWS Kinesis"]
};

const COMPARE_ROWS = [
  ["Core model", "Retained, replayable partitioned log (pub/sub)", "Message broker; message deleted after ack", "Managed retained log (shards), Kafka-like"],
  ["Best at", "High-throughput event streaming, replay, fan-out", "Complex routing, task/work queues, per-msg priority", "Managed streaming inside AWS, low ops"],
  ["Retention / replay", "Days–weeks by time/size; replay any consumer", "Not designed for replay; consume-and-delete", "Up to 365 days; replay within retention"],
  ["Ordering", "Per-partition, via key", "Per-queue (weaker with competing consumers)", "Per-shard"],
  ["Consumer model", "Groups; many independent groups read same data", "Competing consumers; one gets each message", "Shards; KCL consumer groups"],
  ["Throughput", "Very high (100s MB/s per broker)", "Moderate; routing overhead at scale", "High, but per-shard limits (1MB/s in)"],
  ["Ecosystem", "Connect, Streams, Schema Registry, Debezium — huge", "Plugins; smaller streaming ecosystem", "AWS-native (Firehose, Lambda, Glue)"],
  ["Ops burden", "High self-hosted; low via managed (MSK/Confluent)", "Moderate", "Fully managed (no brokers)"],
  ["Choose when", "Streaming backbone, replay, high throughput, portability", "RPC/task dispatch, rich routing, modest volume", "All-in AWS, minimal ops, don't need Kafka ecosystem"],
];

const QUIZ = [
  {
    q: "Kafka guarantees message ordering...",
    options: [
      "Across an entire topic, always",
      "Only within a single partition",
      "Across all partitions if replication.factor=3",
      "Only when there is exactly one consumer"
    ],
    correct: 1
  },
  {
    q: "Which combination actually protects against data loss on the producer side?",
    options: [
      "acks=1 with replication.factor=1",
      "acks=0 with idempotence enabled",
      "acks=all with replication.factor=3 and min.insync.replicas=2",
      "acks=all with min.insync.replicas=1"
    ],
    correct: 2
  },
  {
    q: "In a consumer group reading a topic with 6 partitions, how many consumers can actively process in parallel?",
    options: [
      "Unlimited — Kafka splits partitions further",
      "At most 6; additional consumers sit idle",
      "Exactly 1 — groups are single-threaded",
      "12, two per partition"
    ],
    correct: 1
  },
  {
    q: "What does the idempotent producer (enable.idempotence=true) guarantee?",
    options: [
      "Exactly-once across multiple topics and external systems",
      "No duplicate records from producer retries, per partition, preserving order",
      "That consumers never reprocess a record",
      "That messages are encrypted end to end"
    ],
    correct: 1
  },
  {
    q: "Log compaction retains...",
    options: [
      "All records for a fixed time window",
      "At least the latest value for each key, GCing superseded values",
      "Only records with null keys",
      "The first value ever written for each key"
    ],
    correct: 1
  },
  {
    q: "The most common root cause of repeated consumer-group rebalances is...",
    options: [
      "Too many partitions in the topic",
      "Processing a batch longer than max.poll.interval.ms, so the consumer is evicted",
      "Using acks=all",
      "Enabling log compaction"
    ],
    correct: 1
  },
  {
    q: "For exactly-once Kafka-to-Kafka stream processing, downstream consumers must set...",
    options: [
      "auto.offset.reset=earliest",
      "isolation.level=read_committed",
      "enable.auto.commit=true",
      "compression.type=zstd"
    ],
    correct: 1
  },
  {
    q: "In modern Kafka, cluster metadata and controller leadership are managed by...",
    options: [
      "A required external ZooKeeper ensemble",
      "KRaft — a built-in Raft quorum of controllers",
      "The producer clients",
      "A separate Schema Registry cluster"
    ],
    correct: 1
  },
  {
    q: "Why keep the Kafka broker JVM heap modest (e.g. 6–8GB) on a large machine?",
    options: [
      "The JVM can't address more than 8GB",
      "To leave RAM for the OS page cache, which serves reads via zero-copy",
      "Kafka stores all data on the heap",
      "Larger heaps disable replication"
    ],
    correct: 1
  },
  {
    q: "You need a real-time feed of row changes from Postgres into Kafka without adding query load. Best tool?",
    options: [
      "A hand-written JDBC-polling consumer",
      "Debezium via Kafka Connect (log-based CDC)",
      "kafka-console-producer in a cron job",
      "Log compaction on the source database"
    ],
    correct: 1
  }
];
