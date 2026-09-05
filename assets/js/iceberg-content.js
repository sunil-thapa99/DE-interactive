// Content data for the Apache Iceberg deep-dive module — metadata tree, snapshots, evolution, maintenance.
const MODULE_ID = "iceberg";
const CONTENT = {

overview: {
  intro: {
    title: "Apache Iceberg — the engine-neutral table format, and why the metadata tree is everything",
    desc: "Iceberg turns Parquet/ORC files on object storage into a real table — ACID, time travel, schema & partition evolution — without tying you to one engine. This module goes past 'Iceberg is like Delta': it's the internals interviewers push on — the catalog → metadata → manifest → data tree, how snapshots and time travel fall out of it, hidden partitioning, partition evolution, and the maintenance jobs. Work each tab, answer the follow-ups aloud, then check."
  },
  cards: [
    {
      title: "What Iceberg is — a metadata tree over data files",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "An Iceberg table is ordinary data files (Parquet/ORC/Avro) PLUS a tree of metadata that records exactly which files make up the table at each version. Readers never list the data directory — they walk the metadata from the top: a catalog points to the current metadata file, which points to a manifest list (one snapshot), which points to manifest files, which list the data files with per-file stats. That indirection is where everything comes from: ACID (swapping the current-metadata pointer is atomic), time travel (each snapshot is a full pointer set), evolution (schema and partition spec live in metadata, not in the directory layout), and fast reads (stats let whole manifests and files be pruned). Plain Parquet-on-a-lake has none of this — no metadata layer, so a partial write is visible and 'the table' is just whatever files happen to be in the folder.",
      navLabel: "The distinction interviewers probe:",
      nav: "Iceberg is a table FORMAT (a metadata spec), not an engine and not a file format — the data files are normal Parquet any engine can read. Its whole value is being engine-agnostic: Spark, Trino, Flink, Snowflake, BigQuery, and DuckDB all read the same table through the spec. That's the pitch versus Delta, which is strongest inside Databricks. 'Iceberg vs Parquet' isn't a different data format — it's Parquet plus a metadata tree that makes a pile of files behave like a transactional, evolvable table.",
      noteLabel: "Model answer:",
      note: "\"An Iceberg table is ordinary data files — usually Parquet — plus a tree of metadata that records exactly which files make up the table at each version.<br><br>Readers don't list the folder; they walk the metadata from the top: a catalog points to the current metadata file, that points to a manifest list for the snapshot, which points to manifests, which list the data files with per-file stats.<br><br>That indirection gives me everything: ACID because swapping the current-metadata pointer is atomic, time travel because each snapshot is a full set of pointers, schema and partition evolution because those live in metadata not the folder layout, and fast reads because stats let me prune whole manifests and files.<br><br>And crucially it's engine-neutral — Spark, Trino, Flink, and the warehouses all read the same table. Iceberg is a table format, a metadata spec, not a new file format or an engine.\"",
      followups: [
        "\"Is Iceberg a file format? If not, what is it?\"",
        "\"Where does the 'current version' of an Iceberg table actually live?\"",
        "\"What does Iceberg give you that raw Parquet-on-S3 doesn't?\""
      ]
    },
    {
      title: "The metadata tree — catalog, metadata file, manifest list, manifests, data",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Reading top-down: (1) the CATALOG holds a single pointer — the location of the current metadata.json for each table — and updating that pointer atomically is how a commit lands. (2) The METADATA FILE (vN.metadata.json) holds the table schema(s), partition spec(s), snapshot history, and a pointer to the current snapshot's manifest list. (3) The MANIFEST LIST (one per snapshot, an Avro file) lists the manifest files in that snapshot with partition-range summaries so whole manifests can be skipped. (4) A MANIFEST FILE lists actual data files with per-file column stats (min/max, null counts) and the partition values. (5) DATA FILES are the Parquet. A commit writes new metadata/manifest files and then atomically swaps the catalog pointer to the new metadata.json — old files stay untouched, which is exactly what makes time travel and snapshot isolation free. Knowing this five-level walk is the deep answer.",
      code: "catalog                       -> points to current metadata.json (the atomic commit target)\n  v3.metadata.json            -> schema, partition specs, snapshot list, current-snapshot ptr\n    snap-81..-manifest-list.avro   <- one manifest list per SNAPSHOT\n      manifest-a.avro         <- lists data files + per-file stats + partition values\n      manifest-b.avro\n        part-0001.parquet     <- ordinary data files\n        part-0002.parquet\n# read path: catalog -> metadata.json -> manifest list -> prune manifests -> prune files -> scan\n# commit:    write new metadata/manifests, then ATOMICALLY swap the catalog pointer",
      noteLabel: "Model answer:",
      note: "\"It's a tree you read top-down. The catalog holds one pointer — the current metadata file for the table — and swapping that pointer atomically is the commit.<br><br>The metadata file holds the schema, the partition specs, the snapshot history, and a pointer to the current snapshot's manifest list.<br><br>The manifest list — one per snapshot — names the manifest files with partition-range summaries, so I can skip whole manifests.<br><br>Each manifest lists the actual data files with per-file column stats and partition values, so I can prune individual files.<br><br>And the leaves are the Parquet data files. A commit writes new metadata and manifests and then atomically swaps the catalog pointer, leaving the old files in place — that's why time travel and snapshot isolation come for free.\"",
      followups: [
        "\"Walk me from the catalog down to a data file.\"",
        "\"What exactly does a commit change to become visible?\"",
        "\"How does Iceberg skip files without reading them?\""
      ]
    },
    {
      title: "Iceberg vs Delta vs Hudi — choosing an open table format",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "All three give ACID, upserts, time travel, and schema evolution over Parquet on object storage, with different metadata designs. Iceberg (Netflix origin): a snapshot/manifest tree, the most engine-neutral — broad support across Spark, Trino, Flink, Snowflake, BigQuery, DuckDB — with standout hidden partitioning and true partition evolution. Delta (Databricks origin): log-based (_delta_log), most seamless on Databricks/Spark, strong tooling (OPTIMIZE, Z-order, liquid clustering, CDF). Hudi (Uber origin): built around fast upserts and incremental streams, with copy-on-write vs merge-on-read table types. The honest senior answer: they've converged in capability, so pick by ECOSYSTEM — Iceberg for cross-engine neutrality (and it's become the de-facto industry standard, with the catalog now the real battleground: REST catalog, Polaris, Unity, Glue), Delta if you're all-in on Databricks. Interoperability layers (Delta UniForm, Apache XTable) increasingly let one table be read as multiple formats, so the choice matters less than it did.",
      noteLabel: "Model answer:",
      note: "\"All three give ACID, upserts, time travel, and schema evolution over Parquet, with different metadata designs.<br><br>Iceberg uses a snapshot-and-manifest tree and is the most engine-neutral — Spark, Trino, Flink, Snowflake, BigQuery, DuckDB — with standout hidden partitioning and real partition evolution.<br><br>Delta is log-based and the most seamless on Databricks and Spark, with strong tooling like OPTIMIZE, Z-order, and change data feed.<br><br>Hudi is built around fast upserts and incremental pulls, with copy-on-write and merge-on-read tables.<br><br>They've largely converged, so I pick by ecosystem: Iceberg for cross-engine neutrality — it's become the de-facto standard and the real fight now is the catalog, REST versus Polaris versus Unity versus Glue — and Delta if I'm all-in on Databricks. And interoperability layers like UniForm and XTable mean the choice matters less than it used to.\"",
      followups: [
        "\"You need Trino, Flink, and Snowflake on the same table — which format?\"",
        "\"You're all-in on Databricks — Iceberg or Delta, and why?\"",
        "\"What's the 'catalog war' and why does it matter for Iceberg?\""
      ]
    }
  ]
},

metadata: {
  intro: {
    title: "Snapshots & atomic commits — how the tree stays correct",
    desc: "The metadata tree doesn't just describe state; it's how Iceberg stays correct across concurrent writers. This tab covers snapshots, the atomic pointer swap, optimistic concurrency, and what the catalog actually guarantees — the internals behind 'ACID on a lake'."
  },
  cards: [
    {
      title: "Snapshots — every commit is a new immutable version",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Every write creates a new SNAPSHOT — a complete, immutable set of pointers describing the whole table at that instant, identified by a snapshot ID and captured in the metadata file's snapshot log. Old snapshots aren't modified or deleted by a write; they simply stop being 'current'. Because a snapshot is a full pointer set, time travel is just reading an old snapshot, and rollback is just re-pointing current to an old snapshot ID. Each snapshot also records the operation (append/overwrite/delete) and summary stats (records added/removed), which is what powers incremental reads — 'give me only what changed between snapshot A and B'. The cost is metadata and orphaned data files accumulate until you expire snapshots (covered in Maintenance).",
      noteLabel: "Model answer:",
      note: "\"Every write creates a new snapshot — a complete, immutable set of pointers describing the whole table at that moment, with its own ID.<br><br>A write never mutates old snapshots; they just stop being current. Because each snapshot is a full pointer set, time travel is reading an old snapshot and rollback is re-pointing current at an old snapshot ID.<br><br>Snapshots also record the operation type and summary stats — records added and removed — which is what lets me do incremental reads, only the rows that changed between two snapshots.<br><br>The trade-off is that metadata and now-unreferenced data files pile up, so I have to expire old snapshots on a schedule.\"",
      followups: [
        "\"How is rollback implemented — what actually changes?\"",
        "\"How do you read only the rows that changed since yesterday?\"",
        "\"What accumulates because snapshots are immutable?\""
      ]
    },
    {
      title: "Atomic commits & optimistic concurrency",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Iceberg uses optimistic concurrency, not locks. A writer: (1) reads the current metadata (base snapshot), (2) does its work, writing new data and manifest files, (3) tries to commit by atomically swapping the catalog's current-metadata pointer from the base version to the new one — a compare-and-swap. If another writer committed first, the swap fails; Iceberg re-reads the new current state, checks whether the changes actually conflict, and if not RETRIES the commit against it; a genuine conflict throws. This is why many concurrent appends succeed (they don't conflict) while two overlapping overwrites can fail. The whole guarantee rests on the catalog providing an atomic compare-and-swap on that pointer — which is why the catalog choice matters: a Hive metastore, a JDBC/REST catalog, Glue, Nessie, or Polaris each must give that atomic swap. Plain 'put a metadata file on S3' historically couldn't, which is why file-system-only setups needed a locking catalog.",
      code: "// commit = compare-and-swap on the catalog pointer\nbase   = catalog.current(table)         // e.g. v3.metadata.json\n... write new data + manifests + v4.metadata.json ...\nok = catalog.swap(table, from=base, to=v4)   // ATOMIC CAS\nif (!ok) {                              // someone else won v4\n   recheck conflicts against new current; retry swap, or throw\n}",
      noteLabel: "Model answer:",
      note: "\"Iceberg uses optimistic concurrency, not locks. A writer reads the current metadata as its base, writes new data and manifest files, then tries to commit by atomically swapping the catalog's current-metadata pointer from the base version to the new one — a compare-and-swap.<br><br>If another writer swapped first, mine fails; Iceberg re-reads the new state, checks whether the changes really conflict, and retries if not, or throws if they do.<br><br>That's why concurrent appends usually all succeed but two overlapping overwrites can collide.<br><br>The whole thing depends on the catalog giving an atomic compare-and-swap on that pointer — which is exactly why the catalog choice matters, and why plain files-on-S3 without a locking catalog historically couldn't commit safely.\"",
      followups: [
        "\"What single operation makes an Iceberg commit atomic?\"",
        "\"Two jobs append at once — conflict or not? Two overwrites?\"",
        "\"Why can't you safely run Iceberg on plain S3 with no catalog?\""
      ]
    },
    {
      title: "The catalog — the real decision point",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The catalog is the component that maps a table name to its current metadata pointer and provides the atomic swap. Options: Hive Metastore (legacy, widely supported), JDBC catalog (a relational DB holds the pointer), AWS Glue (managed, native on AWS), Nessie (git-like branching/tagging of table state), and the Iceberg REST catalog spec — a standard HTTP API that decouples engines from the backing store, now the direction the ecosystem is standardizing on (implementations include Polaris, Unity Catalog, Lakekeeper, Gravitino). The REST catalog matters because it lets any engine commit through one contract and centralizes governance/credentials. For interviews the point is: with Iceberg the catalog IS your governance and concurrency boundary — choosing it is a bigger decision than choosing the file format.",
      noteLabel: "Model answer:",
      note: "\"The catalog maps a table name to its current metadata pointer and provides the atomic swap that makes commits safe.<br><br>Options run from the legacy Hive Metastore, to a JDBC catalog, to managed ones like AWS Glue, to Nessie which adds git-like branching and tagging, to the Iceberg REST catalog spec — a standard HTTP API that decouples engines from the storage, which is where the ecosystem is standardizing, with implementations like Polaris and Unity Catalog.<br><br>The REST catalog matters because any engine can commit through one contract and governance and credentials get centralized.<br><br>The takeaway is that with Iceberg the catalog is your concurrency and governance boundary — picking it is a bigger decision than picking the file format.\"",
      followups: [
        "\"What does a REST catalog give you that a Hive metastore doesn't?\"",
        "\"What is Nessie's extra capability over a plain catalog?\"",
        "\"Why is the catalog choice more consequential than the format choice?\""
      ]
    }
  ]
},

timetravel: {
  intro: {
    title: "Time travel, incremental reads & branching",
    desc: "Because every commit is an immutable snapshot, reading the past is nearly free. This tab covers time-travel queries, incremental (changelog) reads, rollback, and Iceberg's branching/tagging — plus the retention caveat that limits how far back you can go."
  },
  cards: [
    {
      title: "Time travel & rollback",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "You can query any retained snapshot by snapshot ID or by timestamp, because each snapshot is a full pointer set — the engine just reads that snapshot's manifest tree instead of the current one. Rollback (rollback_to_snapshot / set_current_snapshot) re-points current at an older snapshot, which is how you recover from a bad write instantly without rewriting data. The hard limit: time travel only reaches snapshots that still exist — once you expire_snapshots past a retention window, those versions and their now-orphaned data files are gone. So 'how far back can I query?' equals 'what's my snapshot retention,' not 'forever.'",
      code: "-- Spark SQL\nSELECT * FROM db.t VERSION AS OF 8143029       -- by snapshot id\nSELECT * FROM db.t TIMESTAMP AS OF '2026-09-01 00:00:00'\n\n-- rollback a bad write (instant, no data rewrite)\nCALL catalog.system.rollback_to_snapshot('db.t', 8143028)",
      noteLabel: "Model answer:",
      note: "\"I can query any retained snapshot by ID or by timestamp, because each snapshot is a complete pointer set — the engine just reads that snapshot's manifest tree.<br><br>Rollback re-points current at an older snapshot, so I can recover from a bad write instantly without rewriting any data.<br><br>The limit is retention: time travel only reaches snapshots that still exist. Once I expire snapshots past my retention window, those versions and their orphaned files are gone — so how far back I can query is really my snapshot retention, not forever.\"",
      followups: [
        "\"You just ran a bad overwrite — fastest way to recover?\"",
        "\"How far back can you time-travel, and what limits it?\"",
        "\"Query by timestamp vs by snapshot ID — how does each resolve?\""
      ]
    },
    {
      title: "Incremental / changelog reads",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Because snapshots record what each commit added and removed, you can ask Iceberg for only the data files appended between two snapshots — an incremental read — instead of rescanning the whole table. This powers cheap downstream CDC-style pipelines: a job tracks the last snapshot it processed and pulls only newer files next run. For row-level change semantics (inserts/updates/deletes with before/after images), Iceberg exposes changelog reads built on its position/equality delete files. The interview point: incremental append reads are the simple, common case (streaming ETL that only wants new rows); full changelog with updates/deletes is heavier and depends on how the table records deletes (merge-on-read).",
      code: "-- Spark: only files appended between two snapshots\nspark.read.format('iceberg')\n  .option('start-snapshot-id', A)\n  .option('end-snapshot-id',   B)\n  .load('db.t')\n-- downstream job persists B as its new checkpoint for next run",
      noteLabel: "Model answer:",
      note: "\"Because each snapshot records what a commit added and removed, I can ask Iceberg for only the files appended between two snapshots instead of rescanning the table.<br><br>That powers cheap incremental pipelines — a job remembers the last snapshot it processed and pulls only newer files next run.<br><br>For full row-level change data — updates and deletes with before-and-after — Iceberg has changelog reads built on its delete files, but that's heavier and depends on merge-on-read.<br><br>So the common case is incremental append reads for streaming ETL; full changelog is the advanced case.\"",
      followups: [
        "\"How would you build an incremental downstream job on Iceberg?\"",
        "\"What state does the downstream job need to persist?\"",
        "\"Append-only incremental vs full changelog — what's the difference?\""
      ]
    },
    {
      title: "Branching & tagging",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Iceberg supports named BRANCHES and TAGS over snapshots (natively in the spec, and more richly via Nessie). A tag is a named, retained snapshot — e.g. tag 'eom-2026-08' so an audit can always query month-end regardless of expiration. A branch is an independent line of commits — write and validate on an 'audit' or 'staging' branch, then fast-forward it into main only once checks pass (write-audit-publish pattern). This gives data engineering git-like semantics: isolate risky writes, run DQ checks on the branch, publish atomically. The point for interviews: branches let you validate BEFORE data becomes visible on main, turning 'publish then discover it's bad' into 'validate then publish.'",
      noteLabel: "Model answer:",
      note: "\"Iceberg supports named branches and tags over snapshots.<br><br>A tag is a named, retained snapshot — I might tag month-end so an audit can always query it regardless of expiration.<br><br>A branch is an independent line of commits — I write and validate on a staging or audit branch, then fast-forward it into main only once the checks pass. That's the write-audit-publish pattern.<br><br>It gives me git-like semantics for data: isolate a risky write, run data-quality checks on the branch, and publish atomically — so instead of publishing and then discovering it's bad, I validate and then publish.\"",
      followups: [
        "\"What's the write-audit-publish pattern and why use branches for it?\"",
        "\"Tag vs branch — when do you reach for each?\"",
        "\"How do you guarantee a month-end snapshot survives expiration?\""
      ]
    }
  ]
},

evolution: {
  intro: {
    title: "Schema & partition evolution — Iceberg's signature feature",
    desc: "Iceberg's standout over older lakes is safe, metadata-only evolution — of both schema and partitioning — plus hidden partitioning that stops users from having to know the layout. This tab covers all three, the internals that make them safe, and the gotchas."
  },
  cards: [
    {
      title: "Hidden partitioning — users don't manage partition columns",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "In Hive-style tables you had to add an explicit partition column (e.g. event_date) and every query had to filter on it or scan everything — and if a user filtered on the raw timestamp, partition pruning silently didn't happen. Iceberg's hidden partitioning stores a PARTITION SPEC in metadata as a transform on a real column — days(ts), bucket(16, id), truncate(10, name) — so the engine derives the partition value automatically and prunes when you filter on the underlying column (WHERE ts >= ...). There's no separate partition column to maintain and no way to 'forget' to filter on it. The interview point: this eliminates the single most common lake performance bug — full scans because someone filtered on the natural column instead of the derived partition column.",
      code: "-- partition by a TRANSFORM of a real column (stored in metadata)\nCREATE TABLE db.events (id bigint, ts timestamp, ...)\nPARTITIONED BY (days(ts), bucket(16, id));\n\n-- user filters the NATURAL column; Iceberg still prunes partitions\nSELECT * FROM db.events WHERE ts >= '2026-09-01';  -- no event_date column needed",
      noteLabel: "Model answer:",
      note: "\"In Hive-style tables you needed an explicit partition column like event_date, and queries had to filter on that exact column or they'd scan everything — filtering on the raw timestamp silently skipped pruning.<br><br>Iceberg stores the partition spec in metadata as a transform on a real column — days of a timestamp, bucket of an id, truncate of a string. The engine derives the partition value automatically and prunes when I filter on the underlying column.<br><br>So there's no separate partition column to maintain and no way to forget to filter on it. That kills the most common lake performance bug — full scans because someone filtered the natural column instead of the derived one.\"",
      followups: [
        "\"What lake bug does hidden partitioning eliminate?\"",
        "\"Name three partition transforms and when you'd use each.\"",
        "\"User filters on ts, not event_date — does pruning still happen?\""
      ]
    },
    {
      title: "Partition evolution — change the layout without rewriting data",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "This is Iceberg's headline capability: you can CHANGE the partition spec of an existing table (e.g. from days(ts) to hours(ts) as volume grows) and it applies only to NEW data — old data keeps its old spec, nothing is rewritten. Iceberg handles this because the partition spec is versioned in metadata and each data file records which spec produced it; a query planner uses the right spec per file. Compare with Hive, where changing partitioning meant rewriting the whole table. The gotcha to mention: a single query then spans files with mixed specs, so pruning is per-file by its own spec — it works, but you may eventually run a rewrite to fully re-lay-out old data if the old spec hurts. Still, evolving layout with zero downtime and zero rewrite is the thing older formats simply can't do.",
      code: "-- volume grew; go from daily to hourly partitioning, no rewrite\nALTER TABLE db.events REPLACE PARTITION FIELD days(ts) WITH hours(ts);\n-- old files keep days(ts) spec; new files use hours(ts); planner uses each file's spec",
      noteLabel: "Model answer:",
      note: "\"This is Iceberg's headline feature. I can change the partition spec of an existing table — say from daily to hourly as volume grows — and it applies only to new data. Old data keeps its old spec and nothing is rewritten.<br><br>It works because the partition spec is versioned in metadata and every data file records which spec produced it, so the planner uses the right spec per file.<br><br>In Hive, changing partitioning meant rewriting the entire table.<br><br>The caveat is that a query then spans mixed specs, so pruning is per-file by its own spec — it works, but I might eventually rewrite old data if the old layout hurts. Still, evolving the layout with zero downtime and zero rewrite is something older formats just can't do.\"",
      followups: [
        "\"Traffic 10x'd and daily partitions are too big — what do you do?\"",
        "\"After partition evolution, how does a query prune mixed-spec files?\"",
        "\"Why could Hive never do this?\""
      ]
    },
    {
      title: "Schema evolution — safe because columns have IDs",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Iceberg tracks every column by a stable, unique field ID in metadata, not by name or by position in the file. That makes schema changes safe and metadata-only: add, drop, rename, reorder, and widen-type all just edit metadata — no data rewrite — and old data files still map correctly because the reader matches by ID. Renaming a column can't accidentally read a different column's data (a real Hive/Parquet-by-position hazard), and dropping then re-adding a column with the same name gives it a NEW id, so old values don't resurface. Add-column reads back NULL for old files. The interview point: name/position-based formats make schema changes risky; ID-based tracking is why Iceberg's are safe and free.",
      code: "ALTER TABLE db.t ADD COLUMN region string;      -- old files read region as NULL\nALTER TABLE db.t RENAME COLUMN qty TO quantity;  -- metadata only; ID unchanged\nALTER TABLE db.t DROP COLUMN legacy;             -- metadata only; id retired\n-- reader matches columns by field-ID, never by name or file position",
      noteLabel: "Model answer:",
      note: "\"Iceberg tracks every column by a stable unique field ID in metadata, not by name or by position in the file.<br><br>That makes schema changes metadata-only and safe: add, drop, rename, reorder, and type-widen just edit metadata with no data rewrite, and old files still map correctly because the reader matches by ID.<br><br>So a rename can't accidentally read another column's data — a real hazard in position-based Parquet — and dropping then re-adding the same name gives a new ID, so old values don't resurface. A newly added column just reads back NULL for old files.<br><br>The point is that name- or position-based formats make schema changes risky; ID-based tracking is why Iceberg's are safe and free.\"",
      followups: [
        "\"Why is renaming a column safe in Iceberg but risky in plain Parquet?\"",
        "\"You drop a column then add one with the same name — do old values come back?\"",
        "\"What does add-column return for rows written before it existed?\""
      ]
    }
  ]
},

performance: {
  intro: {
    title: "Deletes, maintenance & performance",
    desc: "Iceberg's read speed and correctness depend on how it records row-level deletes and on regular maintenance. This tab covers copy-on-write vs merge-on-read, compaction, expiring snapshots and orphan files, and the stats/pruning that make scans fast — the levers a senior owns in production."
  },
  cards: [
    {
      title: "Row-level deletes — copy-on-write vs merge-on-read",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Deleting/updating rows in immutable files needs a strategy. COPY-ON-WRITE (CoW): rewrite each affected data file without the deleted rows at write time — writes are expensive, reads are fast (no merge). MERGE-ON-READ (MoR): write small DELETE FILES that mark removed rows (position deletes = 'row 5 of file X is gone'; equality deletes = 'any row where id=42 is gone'), and reconcile them at read time — writes are cheap and fast, reads pay a merge cost until compaction folds the deletes in. Choose CoW for read-heavy, infrequently-updated tables; MoR for high-frequency updates/streaming upserts where write latency matters. The catch: MoR without regular compaction accumulates delete files and degrades reads — so MoR is a commitment to run maintenance.",
      code: "-- pick per table\nALTER TABLE db.t SET TBLPROPERTIES (\n  'write.delete.mode'='merge-on-read',\n  'write.update.mode'='merge-on-read',\n  'write.merge.mode' ='merge-on-read');\n-- CoW is the default-ish read-optimized choice; MoR trades read cost for write speed",
      noteLabel: "Model answer:",
      note: "\"Rows live in immutable files, so a delete or update needs a strategy.<br><br>Copy-on-write rewrites each affected file without the deleted rows at write time — expensive writes, fast reads because there's nothing to merge.<br><br>Merge-on-read instead writes small delete files — position deletes marking specific rows, or equality deletes matching a predicate — and reconciles them at read time. Cheap writes, but reads pay a merge cost until compaction folds them in.<br><br>So I pick copy-on-write for read-heavy, rarely-updated tables and merge-on-read for high-frequency updates or streaming upserts where write latency matters — knowing merge-on-read is a commitment to run compaction, or reads degrade.\"",
      followups: [
        "\"Streaming upserts every few seconds — CoW or MoR, and why?\"",
        "\"Position deletes vs equality deletes — what's the difference?\"",
        "\"What happens to MoR reads if you never compact?\""
      ]
    },
    {
      title: "Maintenance — compaction, expire snapshots, orphan files",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Iceberg tables need housekeeping, usually as scheduled jobs. (1) COMPACTION (rewrite_data_files) merges many small files into fewer right-sized ones and folds MoR delete files into data — the single biggest read-performance lever (small-file problem). (2) EXPIRE_SNAPSHOTS drops snapshots older than a retention window and deletes data files no longer referenced by any live snapshot — this is what actually reclaims storage and bounds time travel. (3) REMOVE_ORPHAN_FILES deletes files left behind by failed writes that no metadata references. (4) rewrite_manifests keeps the manifest layer tidy so planning stays fast. The interview point: Iceberg gives you the transactions, but a production table's cost and speed are owned by whether these maintenance jobs run — 'set up the table' is half the job; 'run OPTIMIZE/expire on a schedule' is the other half.",
      code: "CALL cat.system.rewrite_data_files('db.t');                 -- compact small files + deletes\nCALL cat.system.expire_snapshots('db.t', TIMESTAMP '2026-08-01 00:00:00');  -- reclaim storage\nCALL cat.system.remove_orphan_files(table => 'db.t');       -- clean failed-write leftovers\nCALL cat.system.rewrite_manifests('db.t');                  -- keep planning fast",
      noteLabel: "Model answer:",
      note: "\"Iceberg tables need scheduled housekeeping.<br><br>Compaction — rewrite_data_files — merges many small files into fewer right-sized ones and folds merge-on-read delete files into the data. That's the biggest read-performance lever because of the small-file problem.<br><br>Expire_snapshots drops snapshots past my retention window and deletes data files no live snapshot references — that's what actually reclaims storage and bounds how far back I can time-travel.<br><br>Remove_orphan_files cleans up leftovers from failed writes, and rewrite_manifests keeps planning fast.<br><br>The point is Iceberg gives me the transactions, but a production table's cost and speed depend on whether these jobs run — setting up the table is only half the job.\"",
      followups: [
        "\"Reads got slow over weeks of streaming ingest — first thing you check?\"",
        "\"Which maintenance job actually reclaims storage, and why not compaction?\"",
        "\"What are orphan files and how do they appear?\""
      ]
    },
    {
      title: "Fast scans — stats, pruning & data skipping",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Iceberg makes scans fast by pruning at three levels before touching data: (1) the manifest list carries partition-range summaries so whole MANIFESTS are skipped; (2) each manifest carries per-file PARTITION values and column STATS (min/max, null/value counts) so individual DATA FILES are skipped when they can't match the predicate; (3) within a file, Parquet's own row-group stats skip further. So a selective query reads only the files that could contain matches — and because this is all metadata, planning doesn't list the object store (a huge win over Hive, where listing millions of paths was the bottleneck). Keeping stats useful is why compaction and sorting matter: well-sorted, right-sized files give tight min/max ranges and thus aggressive skipping; tiny random files give loose ranges and skip nothing.",
      noteLabel: "Model answer:",
      note: "\"Iceberg prunes at three levels before reading data. The manifest list carries partition-range summaries, so I skip whole manifests. Each manifest carries per-file partition values and column stats — min/max, null and value counts — so I skip individual data files that can't match. And inside a file, Parquet's row-group stats skip further.<br><br>So a selective query reads only the files that could contain matches — and because it's all metadata, planning never lists the object store, which was the Hive bottleneck of listing millions of paths.<br><br>That's also why compaction and sorting matter: well-sorted, right-sized files give tight min/max ranges and aggressive skipping, while tiny random files give loose ranges and skip nothing.\"",
      followups: [
        "\"At what levels does Iceberg prune before reading data files?\"",
        "\"Why does planning avoid listing the object store, and why does that matter?\"",
        "\"How does file sorting affect data skipping?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — trace every feature back to the metadata tree",
    desc: "The senior signal on Iceberg is the same as on Delta: don't recite features — trace each one back to the metadata tree and the atomic pointer swap. These are the questions that separate memorized from understood."
  },
  cards: [
    {
      title: "\"Why Iceberg over Delta?\" — answer without tribalism",
      badge: "must-know",
      conceptLabel: "How to answer:",
      concept: "The strong answer is ecosystem-driven, not fandom. Lead with engine neutrality: Iceberg is a spec many engines implement natively (Spark, Trino, Flink, Snowflake, BigQuery, DuckDB), so if you need more than one engine on the same table, it's the safe default. Then concede Delta's edge on Databricks (tighter integration, liquid clustering, CDF). Mention the convergence and interop layers (UniForm, XTable) so you don't sound dogmatic. Close on the real modern differentiator: the catalog layer and the REST catalog standard. That structure — neutrality, honest concession, convergence, catalog — reads as senior.",
      noteLabel: "Model answer:",
      note: "\"I pick by ecosystem, not loyalty. Iceberg is a spec that many engines implement natively — Spark, Trino, Flink, Snowflake, BigQuery, DuckDB — so if more than one engine has to read the same table, it's the safe default.<br><br>I'll concede Delta is tighter on Databricks, with things like liquid clustering and change data feed.<br><br>But they've largely converged, and interop layers like UniForm and XTable let one table be read as multiple formats, so I don't treat it as a religious choice.<br><br>The real modern differentiator is the catalog — the Iceberg REST catalog standard and implementations like Polaris and Unity are where the interesting decisions now sit.\"",
      followups: [
        "\"Give me one concrete case where Delta wins.\"",
        "\"What makes Iceberg the safe multi-engine default?\"",
        "\"Are the formats converging? What's still different?\""
      ]
    },
    {
      title: "\"How does Iceberg give ACID on object storage?\"",
      badge: "must-know",
      conceptLabel: "How to answer:",
      concept: "Trace it to the atomic pointer swap. A commit writes new immutable data and metadata files, then atomically swaps the catalog's current-metadata pointer via compare-and-swap. Atomicity = the swap is all-or-nothing; consistency = readers only ever see a fully committed metadata version; isolation = snapshot isolation on reads plus serializable commits via the version sequence; durability = object storage. Then name the caveat: it's per-table, and the guarantee depends on the catalog providing the atomic CAS — which is why a proper catalog (not plain files) is required.",
      noteLabel: "Model answer:",
      note: "\"It comes down to one atomic operation. A commit writes new immutable data and metadata files, then atomically swaps the catalog's current-metadata pointer with a compare-and-swap.<br><br>Atomicity is that the swap is all-or-nothing. Consistency is that readers only ever see a fully committed metadata version, never partial files. Isolation is snapshot isolation for reads and serializable commits through the version sequence. Durability is object storage.<br><br>The caveat is it's per-table — no cross-table transaction — and the whole guarantee rests on the catalog giving that atomic swap, which is why you need a real catalog and not just files on S3.\"",
      followups: [
        "\"Which single operation is the transaction boundary?\"",
        "\"Is it multi-table? What can't you do atomically?\"",
        "\"What must the catalog provide for this to hold?\""
      ]
    },
    {
      title: "\"A streaming job made millions of tiny files — walk me through the fix.\"",
      badge: "scenario",
      conceptLabel: "How to answer:",
      concept: "Diagnose then fix then prevent. Diagnose: streaming commits produce many small files; reads slow because planning and I/O scale with file count and stats get loose. Fix now: run rewrite_data_files (compaction) to merge small files and fold MoR deletes; if updates are frequent, confirm merge-on-read and schedule compaction. Reclaim: expire_snapshots and remove_orphan_files so old/orphaned files stop costing storage and slowing listing. Prevent: tune write target file size and commit interval (fewer, larger commits), consider sorting/clustering on common filter columns for tighter stats, and put compaction + expiration on a schedule. The senior close: ongoing maintenance is part of owning the table, not a one-off.",
      noteLabel: "Model answer:",
      note: "\"First I diagnose: streaming commits create lots of small files, and reads slow down because planning and I/O scale with file count and the per-file stats get loose.<br><br>Fix now: run compaction — rewrite_data_files — to merge the small files and fold in any merge-on-read delete files. If updates are frequent I confirm merge-on-read and schedule compaction to keep up.<br><br>Then reclaim: expire old snapshots and remove orphan files so they stop costing storage and slowing listing.<br><br>Prevent: tune the target file size and commit interval so I write fewer, larger files, sort on common filter columns for tighter min/max stats, and put compaction and expiration on a schedule.<br><br>The point is maintenance is part of owning the table, not a one-off cleanup.\"",
      followups: [
        "\"Which job merges the files, and which reclaims the storage?\"",
        "\"How do you stop it recurring at write time?\"",
        "\"How does sorting help beyond just file size?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What is Apache Iceberg, precisely?",
    options: [
      "A new columnar file format that replaces Parquet",
      "A table format — a metadata spec over data files (Parquet/ORC) that many engines implement",
      "A query engine like Spark or Trino",
      "A managed cloud data warehouse"
    ],
    correct: 1
  },
  {
    q: "Reading an Iceberg table, what is the correct top-down order?",
    options: [
      "Data files → manifests → catalog",
      "Catalog → metadata file → manifest list → manifests → data files",
      "Hive metastore → Parquet footer → data",
      "Snapshot → catalog → metadata → data"
    ],
    correct: 1
  },
  {
    q: "What single operation makes an Iceberg commit atomic?",
    options: [
      "Acquiring a table-level lock in the metastore",
      "An atomic compare-and-swap of the catalog's current-metadata pointer",
      "Renaming the data directory",
      "Writing a _SUCCESS marker file"
    ],
    correct: 1
  },
  {
    q: "Two jobs APPEND to the same Iceberg table at the same instant. What happens?",
    options: [
      "One is always rejected — appends conflict",
      "Both succeed — appends don't conflict; the loser re-reads and retries the commit swap",
      "The table is corrupted",
      "They must acquire a lock first"
    ],
    correct: 1
  },
  {
    q: "Volume grew and daily partitions are too large. What can Iceberg do that Hive can't?",
    options: [
      "Nothing — you must rewrite the whole table",
      "Partition evolution — change the spec (days→hours) for NEW data only, no rewrite",
      "Delete the old partitions automatically",
      "Switch the file format to ORC"
    ],
    correct: 1
  },
  {
    q: "Why are schema changes (rename/drop/add) safe and metadata-only in Iceberg?",
    options: [
      "It rewrites every data file on each change",
      "Columns are tracked by stable unique field IDs, not by name or file position",
      "It forbids renaming columns",
      "A Hive metastore validates each change"
    ],
    correct: 1
  },
  {
    q: "A user filters on the raw timestamp column (WHERE ts >= ...), not a partition column. Does pruning happen?",
    options: [
      "No — they must filter on an explicit partition column",
      "Yes — hidden partitioning stores the spec as a transform (days(ts)), so Iceberg prunes automatically",
      "Only if they add a WHERE on event_date too",
      "Only for ORC files"
    ],
    correct: 1
  },
  {
    q: "You have high-frequency streaming upserts and write latency matters most. Which delete strategy?",
    options: [
      "Copy-on-write — rewrite affected files on every update",
      "Merge-on-read — write cheap delete files, reconcile at read, and schedule compaction",
      "Neither — Iceberg can't do row-level updates",
      "Drop and recreate the table each batch"
    ],
    correct: 1
  },
  {
    q: "Which maintenance operation actually reclaims storage and bounds how far back you can time-travel?",
    options: [
      "rewrite_data_files (compaction)",
      "expire_snapshots — drops old snapshots and deletes data files no live snapshot references",
      "rewrite_manifests",
      "None — storage is reclaimed automatically"
    ],
    correct: 1
  },
  {
    q: "Why is the catalog choice (Hive/JDBC/Glue/Nessie/REST) so consequential for Iceberg?",
    options: [
      "It determines the data file format",
      "It provides the atomic commit swap and is your concurrency & governance boundary",
      "It compresses the data files",
      "It's purely cosmetic — any catalog behaves identically"
    ],
    correct: 1
  }
];
