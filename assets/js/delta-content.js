// Content data for the Delta Lake deep-dive module — transaction log, DML, time travel, performance.
const MODULE_ID = "delta";
const CONTENT = {

overview: {
  intro: {
    title: "Delta Lake — ACID on the lake, and why the log is everything",
    desc: "Delta Lake turns a folder of Parquet files into a real table: ACID transactions, upserts, time travel, and schema enforcement — all from one idea, the transaction log. This module goes deeper than 'Delta gives you MERGE'; it's the internals an interviewer pushes on: how the _delta_log works, how concurrency and time travel fall out of it, and the performance levers. Work each tab, answer the follow-ups aloud, then check."
  },
  cards: [
    {
      title: "What Delta is — a transaction log over Parquet",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "A Delta table is just Parquet data files in a directory PLUS a transaction log (the _delta_log folder) that records, as an ordered series of commits, exactly which files make up the table right now. Readers don't list the directory — they read the log to learn the current set of valid files, then read only those. That one indirection is where everything comes from: ACID (a commit is atomic), time travel (replay the log to any past version), schema enforcement (the log stores the schema), and performance (the log carries per-file stats for skipping). Plain Parquet-on-a-lake has none of this because there's no log — a half-finished write leaves partial files a reader can see.",
      navLabel: "The distinction interviewers probe:",
      nav: "The data files are ordinary Parquet — any engine can read them. The magic is entirely in the log: it's the source of truth for what the table IS at a given version. So 'Delta vs Parquet' isn't a different file format — it's Parquet plus a metadata layer that makes a pile of files behave like a transactional table. Iceberg and Hudi solve the same problem with a different metadata design.",
      noteLabel: "Model answer:",
      note: "\"A Delta table is Parquet data files plus a transaction log — the _delta_log directory — that records, as ordered commits, exactly which files make up the table at each version.<br><br>Readers don't list the folder; they read the log to find the current valid files and read only those.<br><br>That one indirection gives me everything: ACID because a commit is atomic, time travel because I can replay the log to any past version, schema enforcement because the log stores the schema, and fast reads because the log carries per-file statistics for data skipping.<br><br>Plain Parquet on a lake has none of that — there's no log, so a failed write can leave partial files a reader sees. Delta isn't a new file format; it's Parquet plus a metadata layer.\"",
      followups: [
        "\"Is a Delta data file readable by a non-Delta engine? What isn't?\"",
        "\"Where does the 'current state' of a Delta table actually live?\"",
        "\"What does plain Parquet-on-S3 lack that Delta adds?\""
      ]
    },
    {
      title: "The transaction log — commits, checkpoints, and how state is computed",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Inside _delta_log, each commit is a numbered JSON file (00000.json, 00001.json, …) containing atomic ACTIONS: add file, remove file, metadata (schema/partitioning), and protocol. The current table state is the result of replaying every commit in order — an add then a later remove of the same file means it's gone. Because replaying thousands of JSONs is slow, Delta writes a Parquet CHECKPOINT every 10 commits that snapshots the full state, so a reader loads the latest checkpoint plus the few JSONs after it, not the whole history. A commit succeeds by atomically creating the next-numbered JSON file — that atomic 'create N+1' is the transaction boundary. Knowing this replay-plus-checkpoint mechanic is the deep answer.",
      code: "my_table/\n  part-0001.parquet          <- ordinary Parquet data files\n  part-0002.parquet\n  _delta_log/\n    00000000000000000000.json  <- commit 0: add file, set schema\n    00000000000000000001.json  <- commit 1: add/remove actions (a MERGE)\n    ...\n    00000000000000000010.checkpoint.parquet  <- state snapshot @ v10\n    _last_checkpoint           <- pointer to newest checkpoint\n# current state = latest checkpoint + JSON commits after it, replayed in order",
      noteLabel: "Model answer:",
      note: "\"Inside the log, each commit is a numbered JSON file holding atomic actions — add file, remove file, metadata, protocol.<br><br>The table's current state is the replay of every commit in order: if one commit adds a file and a later one removes it, it's gone from the current version.<br><br>Replaying thousands of JSONs would be slow, so every ten commits Delta writes a Parquet checkpoint that snapshots the full state. A reader loads the latest checkpoint plus the handful of JSONs after it.<br><br>And a commit succeeds by atomically creating the next-numbered JSON. That atomic 'create commit N plus one' is the transaction boundary — it's what makes the write all-or-nothing.\"",
      followups: [
        "\"Why does Delta write checkpoints, and how often?\"",
        "\"What makes a Delta commit atomic?\"",
        "\"How does a reader compute the current state without reading all history?\""
      ]
    },
    {
      title: "Delta vs Iceberg vs Hudi — the open table formats",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "All three solve the same problem — ACID, upserts, time travel, and schema evolution over Parquet on object storage — with different metadata designs. Delta (Databricks origin): log-based, the most seamless on Databricks/Spark, strong tooling (OPTIMIZE, Z-order, liquid clustering, CDF). Iceberg (Netflix origin): a manifest/snapshot tree design, engine-agnostic and increasingly the neutral industry standard, strong on hidden partitioning and partition evolution, broad support (Spark, Trino, Flink, Snowflake, BigQuery). Hudi (Uber origin): built around fast upserts and incremental streams, with copy-on-write vs merge-on-read table types. For a DE the honest answer is they've converged in capability; pick by ecosystem (Delta if you're on Databricks, Iceberg for cross-engine neutrality) — and note the industry is coalescing toward interoperability (e.g. UniForm/XTable exposing one table as multiple formats).",
      noteLabel: "Model answer:",
      note: "\"All three give ACID, upserts, time travel, and schema evolution over Parquet, with different metadata designs.<br><br>Delta is log-based and the most seamless on Databricks and Spark, with strong tooling like OPTIMIZE, Z-ordering, and change data feed.<br><br>Iceberg uses a snapshot-and-manifest design, is engine-agnostic, and is becoming the neutral industry standard, with strong hidden partitioning and broad support across Spark, Trino, Flink, and the warehouses.<br><br>Hudi is built around fast upserts and incremental pulls, with copy-on-write and merge-on-read table types.<br><br>Honestly they've converged, so I pick by ecosystem — Delta on Databricks, Iceberg for cross-engine neutrality — and I note the industry is moving toward interoperability so the choice matters less than it did.\"",
      followups: [
        "\"You're all-in on Databricks — which format, and why?\"",
        "\"You need Trino, Flink, and Snowflake to read the same table — which?\"",
        "\"What problem do all three solve that raw Parquet doesn't?\""
      ]
    }
  ]
},

log: {
  intro: {
    title: "ACID & concurrency — how the log makes writes safe",
    desc: "The log doesn't just record state; it's how Delta stays correct when writes overlap. This tab covers optimistic concurrency, what isolation Delta actually gives, how conflicts are detected and resolved, and the failure modes — the internals behind 'ACID on a lake' that separate a memorized answer from an understood one."
  },
  cards: [
    {
      title: "Optimistic concurrency — how concurrent writers don't corrupt the table",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Delta uses optimistic concurrency control (OCC), not locks. A writer: (1) reads the current table version (say v10), (2) does its work and stages new/removed files, (3) tries to commit as v11 by atomically creating 00011.json. If another writer already claimed v11, the commit fails; Delta checks whether the two changes actually conflict (did the other write touch files or rows this one read/depends on?) — if not, it retries the commit against the new version; if they genuinely conflict, it throws a ConcurrentModificationException. This is why Delta handles multiple concurrent appends fine (they don't conflict) but two blind concurrent updates to the same data can fail. The atomicity of 'create the next commit file' is what makes OCC safe — only one writer can win a given version number.",
      noteLabel: "Model answer:",
      note: "\"Delta uses optimistic concurrency, not locks.<br><br>A writer reads the current version, does its work staging added and removed files, then tries to commit as the next version by atomically creating that numbered log file.<br><br>If someone else already took that version number, the commit fails and Delta checks whether the changes actually conflict — did the other writer touch files or rows this one depended on? If not, it retries against the new version. If they truly conflict, it throws a concurrent-modification error.<br><br>That's why many concurrent appends are fine — they don't conflict — but two blind updates to the same data can collide. The atomic 'only one writer wins a version number' is what keeps it safe without locks.\"",
      followups: [
        "\"Two jobs append to the same table simultaneously — does that conflict?\"",
        "\"Two jobs UPDATE overlapping rows at once — what happens?\"",
        "\"Why doesn't Delta just use locks?\""
      ]
    },
    {
      title: "Isolation levels & what ACID means here",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Delta gives ACID on a single table. Atomicity: a commit's actions all apply or none do (the log file appears or it doesn't). Consistency: readers only ever see a fully committed version — never partial files from an in-flight write. Isolation: writes are serializable (they take effect in a well-defined order via the version sequence); reads default to snapshot isolation — a query reads a consistent version even as writes happen. Durability: it's object storage. The important caveat for interviews: ACID is per-table, not multi-table/multi-statement — there's no cross-table transaction, so a pipeline updating two Delta tables can't commit them atomically together. Also, correctness depends on the storage giving atomic 'put-if-absent' for the commit file (handled on the major clouds / by Databricks; DIY on plain S3 historically needed a coordinator).",
      noteLabel: "Model answer:",
      note: "\"Delta gives ACID on a single table.<br><br>Atomicity: a commit's actions all apply or none, because the log file either appears or it doesn't. Consistency: a reader only sees a fully committed version, never partial files from an in-flight write. Isolation: writes are serializable through the version sequence, and reads get snapshot isolation, so a query sees one consistent version even as writes land. Durability comes from object storage.<br><br>The caveat I'd flag is that this is per-table — there's no multi-table transaction, so a pipeline touching two Delta tables can't commit them atomically together.<br><br>And it relies on the storage providing an atomic create-if-absent for the commit file, which the major clouds and Databricks handle.\"",
      followups: [
        "\"Can you atomically update two Delta tables in one transaction?\"",
        "\"What isolation does a reader get during a concurrent write?\"",
        "\"What storage guarantee does the commit protocol depend on?\""
      ]
    },
    {
      title: "Schema enforcement & evolution",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Because the log stores the schema, Delta enforces it on write: a write whose columns/types don't match is rejected by default (schema enforcement / 'schema-on-write'), which stops a malformed upstream feed from silently corrupting the table — a real guardrail vs schema-on-read Parquet. When you DO want the schema to change, you opt in: mergeSchema=true to add new columns on append, or ALTER TABLE / overwriteSchema for explicit changes. Delta supports adding columns, widening some types, and (with column mapping) renames/drops without rewriting data. The DE discipline: enforcement on by default so bad data bounces; evolution as a deliberate, reviewed action, not an accident.",
      code: "# Rejected by default if df has an extra/mismatched column (enforcement):\ndf.write.format(\"delta\").mode(\"append\").saveAsTable(\"claims\")\n\n# Opt in to add new columns on append (evolution):\n(df.write.format(\"delta\").mode(\"append\")\n   .option(\"mergeSchema\", \"true\").saveAsTable(\"claims\"))",
      noteLabel: "Model answer:",
      note: "\"The log stores the schema, so Delta enforces it on write. A write whose columns or types don't match is rejected by default — schema-on-write. That's a real guardrail: a malformed upstream feed bounces instead of silently corrupting the table, which schema-on-read Parquet can't do.<br><br>When I actually want the schema to change, I opt in — mergeSchema to add columns on append, or an explicit ALTER TABLE. With column mapping I can rename or drop columns without rewriting the data.<br><br>My discipline is to leave enforcement on so bad data bounces, and treat evolution as a deliberate, reviewed change rather than something that happens by accident.\"",
      followups: [
        "\"An upstream feed adds a column — what happens by default, and how do you allow it?\"",
        "\"Why is schema-on-write a safety feature?\"",
        "\"Can you rename a column without rewriting the whole table?\""
      ]
    }
  ]
},

dml: {
  intro: {
    title: "DML & MERGE — upserts, deletes, and streaming writes",
    desc: "The features people adopt Delta FOR: row-level UPDATE/DELETE and the MERGE that powers CDC, SCD2, and dedup — things plain Parquet can't do. This tab covers how MERGE works, implementing SCD2, regulatory deletes done correctly, and Delta as a streaming sink with idempotency. This is the most-used tab in practice."
  },
  cards: [
    {
      title: "MERGE — the upsert that powers CDC and dedup",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "MERGE INTO matches a target table against a source on a condition and, per row, does WHEN MATCHED (update/delete) or WHEN NOT MATCHED (insert) — one atomic statement. It's the workhorse for: applying a CDC change stream (update changed rows, insert new, delete removed), deduplicating on a business key, and SCD2. Mechanically Delta finds the files containing matching rows, rewrites them with the changes, and commits the add/remove in the log (copy-on-write). The performance watch-outs: a MERGE that can't prune (no partition/cluster filter in the ON clause) rewrites huge amounts of data, and a source with duplicate keys makes MERGE ambiguous/error. Narrow the match with partition predicates and dedup the source first.",
      code: "MERGE INTO claims t\nUSING cdc_batch s\n  ON t.claim_id = s.claim_id\n     AND t.ingest_date >= current_date() - 7   -- prune target files!\nWHEN MATCHED AND s.op = 'DELETE' THEN DELETE\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED AND s.op <> 'DELETE' THEN INSERT *;",
      noteLabel: "Model answer:",
      note: "\"MERGE matches a target against a source on a key and, per row, updates, deletes, or inserts — in one atomic statement.<br><br>It's the workhorse for applying a CDC stream, deduplicating on a business key, and SCD2.<br><br>Mechanically Delta finds the files holding matching rows, rewrites them with the changes, and commits the adds and removes in the log — copy-on-write.<br><br>The two things I watch: if the ON clause can't prune — no partition or cluster predicate — the MERGE rewrites huge amounts of data, so I add a partition filter to narrow the target. And duplicate keys in the source make the match ambiguous, so I dedup the source first.\"",
      followups: [
        "\"A MERGE is rewriting most of the table every run — likely cause and fix?\"",
        "\"What happens if the source has duplicate match keys?\"",
        "\"How does one MERGE apply inserts, updates, and deletes from a CDC feed?\""
      ]
    },
    {
      title: "Implementing SCD Type 2 with MERGE",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "SCD2 keeps history by versioning rows, and MERGE implements it. The idiom: for a changed key, close the current row (set valid_to = now, is_current = false) AND insert a new row (new surrogate key, valid_from = now, valid_to = null/'9999', is_current = true). Because a single MERGE can't both update the old row and insert a new one for the same key cleanly, the common pattern uses a two-part source (a union that yields the 'close' match and the 'insert' not-matched) or Databricks' higher-level APIs. Delta's atomic commit means the close-and-insert lands together — no window where history is inconsistent. This is exactly the policy/claims history requirement from insurance and finance.",
      noteLabel: "Model answer:",
      note: "\"SCD2 versions rows to keep history, and I implement it with MERGE.<br><br>For a changed key I close the current row — set valid_to to now and is_current false — and insert a new row with a fresh surrogate key, valid_from now, an open valid_to, and is_current true.<br><br>Since one MERGE can't cleanly both update the old row and insert a new one for the same key, the usual trick is a two-part source — a union that produces the close-match and the insert-not-matched — or the platform's higher-level SCD API.<br><br>Delta's atomic commit means the close and the insert land together, so there's never a moment where the history is inconsistent. That's the policy-history requirement in insurance and finance.\"",
      followups: [
        "\"Why can't a single naive MERGE do both the close and the insert?\"",
        "\"How does Delta's atomicity help SCD2 correctness?\"",
        "\"What columns does your SCD2 target carry?\""
      ]
    },
    {
      title: "Deletes done right — GDPR/PIPEDA and VACUUM",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A DELETE (or MERGE delete) removes rows logically — Delta writes new files without those rows and marks the old files removed in the log — but the old files still physically exist so time travel can read past versions. For a real 'right to be forgotten' erasure you must also purge the underlying files: run VACUUM to delete removed files older than the retention window (default 7 days), which permanently drops the data time travel could have surfaced. The tension to name: time-travel retention vs regulatory deletion — you cannot both keep 30 days of history AND guarantee data is gone in 24 hours for the same rows; you set VACUUM retention and time-travel policy to satisfy the regulation. Also: deletion vectors (below) make the logical delete cheap, but VACUUM is still what physically erases.",
      code: "DELETE FROM customers WHERE customer_id = 42;   -- logical: rewrites files, old ones remain\n-- Physically purge so time travel can't resurrect the data:\nVACUUM customers RETAIN 168 HOURS;              -- drop removed files > 7 days old\n-- Regulatory erasure => shorten retention so purge happens within the required window",
      noteLabel: "Model answer:",
      note: "\"A DELETE removes rows logically — Delta writes new files without them and marks the old files removed in the log — but the old files still exist so time travel can read past versions.<br><br>For a genuine right-to-be-forgotten erasure I also have to purge the files, which is what VACUUM does: it deletes removed files older than the retention window, permanently.<br><br>The tension I'd name is time-travel retention versus regulatory deletion. I can't both keep thirty days of history and guarantee the data is gone in twenty-four hours for the same rows, so I set the VACUUM retention and time-travel policy to meet the regulation — often a shorter retention on tables holding PII.\"",
      followups: [
        "\"You ran DELETE for a GDPR request — is the data actually gone? What else is needed?\"",
        "\"What's the conflict between time travel and 'right to be forgotten'?\"",
        "\"What does VACUUM's retention window control?\""
      ]
    },
    {
      title: "Delta as a streaming sink & source — idempotency",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A Delta table is both a streaming source and a sink. As a sink, Structured Streaming writes micro-batches with checkpointing; combined with Delta's atomic commits you get exactly-once — each micro-batch commits once, and a replay after failure doesn't double-write because the checkpoint and log agree. For upserting streams, foreachBatch + MERGE applies each micro-batch idempotently on the key. As a source, streaming reads the log to emit only new files/changes since the last offset — incremental by construction. Change Data Feed (CDF) goes further, emitting the actual row-level changes (insert/update/delete with before/after) so downstream can consume just what changed. The combination — atomic commits + checkpoint offsets + MERGE keys — is what makes a Delta streaming pipeline exactly-once and safe to replay.",
      noteLabel: "Model answer:",
      note: "\"A Delta table is both a streaming source and a sink.<br><br>As a sink, Structured Streaming writes micro-batches with checkpointing, and with Delta's atomic commits I get exactly-once — each micro-batch commits once, and a replay after failure doesn't double-write because the checkpoint and the log agree. For upserts I use foreachBatch with MERGE so each micro-batch applies idempotently on the key.<br><br>As a source, a stream reads the log to emit only new files since the last offset, so it's incremental by construction.<br><br>Change Data Feed goes further and emits the actual row-level changes with before and after images, so downstream consumes just what changed. Atomic commits, checkpoint offsets, and MERGE keys together are what make it exactly-once and replay-safe.\"",
      followups: [
        "\"How does a Delta streaming sink achieve exactly-once?\"",
        "\"How do you upsert a stream into Delta idempotently?\"",
        "\"What does Change Data Feed give a downstream consumer?\""
      ]
    }
  ]
},

timetravel: {
  intro: {
    title: "Time travel, versioning & recovery",
    desc: "Because the log records every version, Delta lets you query or restore the table as of any past point — a superpower for audit, debugging, and recovering from a bad write. This tab covers how time travel works, restore/rollback, the retention and VACUUM interplay, and the audit story that matters in regulated shops."
  },
  cards: [
    {
      title: "Time travel — querying past versions",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Every commit is a version, so you can read the table AS OF a version number or a timestamp — Delta computes that older state by replaying the log up to that point and reading the files that were valid then. Uses: reproduce a report exactly as it was, debug 'what did this table look like before the bad run,' compare versions to see what changed, or feed a stable snapshot to an ML training run for reproducibility. It works only as far back as the files still exist — VACUUM sets the horizon. Syntax is VERSION AS OF n or TIMESTAMP AS OF '…'. This is audit and reproducibility for free, straight out of the log.",
      code: "SELECT * FROM claims VERSION AS OF 42;\nSELECT * FROM claims TIMESTAMP AS OF '2026-08-25 00:00:00';\n\n-- See the history: who/what/when for each version\nDESCRIBE HISTORY claims;",
      noteLabel: "Model answer:",
      note: "\"Every commit is a version, so I can read the table as of a version number or a timestamp. Delta computes that older state by replaying the log to that point and reading the files that were valid then.<br><br>I use it to reproduce a report exactly as it was, to debug what a table looked like before a bad run, to diff two versions to see what changed, and to pin a stable snapshot for a reproducible ML training run.<br><br>It reaches back only as far as the files still exist, and VACUUM sets that horizon.<br><br>So it's audit and reproducibility straight out of the log — DESCRIBE HISTORY even shows who did what and when for each version.\"",
      followups: [
        "\"How far back can you time travel, and what limits it?\"",
        "\"How would you reproduce last month's report exactly?\"",
        "\"How do you see who made a given change?\""
      ]
    },
    {
      title: "Restore & rollback — recovering from a bad write",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A bad job — dropped rows, wrong transform, an accidental overwrite — isn't a disaster on Delta: RESTORE TABLE … TO VERSION AS OF n rolls the table back to a known-good version by committing a new version whose state equals the old one (it doesn't rewrite history; it adds a commit that re-adds the old files and removes the bad ones). Because it's just another commit, you can even time-travel past the restore. This is the recovery story you cite in reliability questions: the fix for a corrupt load is a one-line restore to the last good version, no backup restore, no reprocessing — as long as VACUUM hasn't purged those files yet, which is a reason not to set VACUUM retention too aggressively low.",
      code: "-- Undo a bad run in one line:\nRESTORE TABLE claims TO VERSION AS OF 41;      -- or TO TIMESTAMP AS OF '...'\n-- Adds a new commit whose state == v41; time travel still works across it",
      noteLabel: "Model answer:",
      note: "\"A bad write isn't a disaster on Delta. RESTORE rolls the table back to a known-good version by committing a new version whose state equals the old one — it re-adds the good files and removes the bad ones, it doesn't erase history.<br><br>Because it's just another commit, I can even time-travel across the restore.<br><br>So in a reliability question my recovery story is a one-line restore to the last good version — no backup to recover, no full reprocessing.<br><br>The one dependency is that VACUUM hasn't already purged those files, which is a reason not to set the retention window too aggressively short on important tables.\"",
      followups: [
        "\"A job overwrote a table with garbage an hour ago — how do you recover?\"",
        "\"Does RESTORE delete the bad version from history?\"",
        "\"What could prevent a restore from working?\""
      ]
    },
    {
      title: "Retention, VACUUM & the log-cleanup interplay",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Two retention knobs interact. VACUUM deletes data files that were removed and are older than the file-retention window (default 7 days) — this bounds time travel (you can't read a version whose files are gone) and reclaims storage. Log retention (checkpoints + old JSON commits) is cleaned separately (default 30 days). The trap: setting VACUUM retention very low to save storage silently destroys your ability to time-travel or restore beyond that window — and Delta guards against too-short VACUUM (it warns/blocks below the safe threshold) because an in-flight reader or writer could still need those files. The DE judgment: match VACUUM retention to how far back you actually need recovery/audit, and remember VACUUM is the operation that makes regulatory deletes physical.",
      noteLabel: "Model answer:",
      note: "\"Two knobs interact. VACUUM deletes removed data files older than a retention window, defaulting to seven days. That both reclaims storage and bounds how far back time travel and restore can reach — you can't read a version whose files are gone. Log retention, the checkpoints and old commits, is cleaned separately with its own default.<br><br>The trap is setting VACUUM retention very low to save storage, which silently kills your recovery window. Delta actually guards against too-short VACUUM because an in-flight reader could still need those files.<br><br>So I match VACUUM retention to how far back I genuinely need recovery and audit — and I remember VACUUM is also what makes a regulatory delete physical.\"",
      followups: [
        "\"Why is setting VACUUM RETAIN 0 HOURS dangerous?\"",
        "\"What bounds how far back you can time travel?\"",
        "\"How do time-travel needs and storage cost trade off?\""
      ]
    }
  ]
},

performance: {
  intro: {
    title: "Performance — file sizing, OPTIMIZE, clustering & data skipping",
    desc: "Delta's read performance comes from the log carrying per-file statistics plus keeping files well-sized and well-organized. This tab covers the small-files problem, OPTIMIZE and Z-ordering, the newer liquid clustering and deletion vectors, and how data skipping actually prunes files — the levers an interviewer expects a senior DE to reach for."
  },
  cards: [
    {
      title: "Data skipping — how the log prunes files without reading them",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "For every data file, the log stores column statistics — min, max, null count — for the first N columns. When a query has a filter, Delta consults these stats and skips any file whose min/max range can't contain matching rows, so it never opens most files. This is why a WHERE on a well-clustered column is fast even without partitioning: the file's min/max excludes it. Skipping works best when values for a column are physically co-located in few files (so their min/max ranges are tight and non-overlapping) — which is exactly what partitioning, Z-ordering, and clustering arrange. If a column's values are scattered across all files, every file's range matches and nothing is skipped. Data skipping + file organization is the whole performance game.",
      noteLabel: "Model answer:",
      note: "\"The log stores per-file statistics — min, max, and null counts for the leading columns.<br><br>When a query filters, Delta checks those stats and skips any file whose min-to-max range can't contain a match, so it never opens most files.<br><br>That's why a filter on a well-clustered column is fast even without partitioning — the file's range simply excludes it.<br><br>Skipping works when a column's values are physically co-located in a few files, so their ranges are tight and non-overlapping. That's exactly what partitioning, Z-ordering, and clustering arrange. If the values are scattered across every file, every range matches and nothing gets skipped. So file organization plus data skipping is the whole performance game.\"",
      followups: [
        "\"How can a filter be fast on a non-partitioned column?\"",
        "\"Why does clustering make data skipping effective?\"",
        "\"When does data skipping fail to skip anything?\""
      ]
    },
    {
      title: "The small-files problem, OPTIMIZE & compaction",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Streaming writes and frequent small MERGEs produce many tiny files, and lots of small files kill read performance (per-file open overhead) and bloat the log. OPTIMIZE fixes it by bin-packing — rewriting many small files into fewer ~128MB–1GB files (committed atomically as add/remove in the log, so readers are never disrupted). On Databricks, Auto Optimize (optimizeWrite + autoCompact) does this during writes to prevent the problem up front. The target is roughly 128MB–1GB per file — big enough to amortize open cost, small enough for parallelism. Compaction is routine Delta maintenance; a table that's never optimized slowly degrades. This is the same small-files lesson as any lake, with Delta giving you a first-class command for it.",
      code: "OPTIMIZE claims WHERE ingest_date >= current_date() - 7;  -- bin-pack recent partitions\n-- Prevent it at write time (Databricks):\n--   delta.autoOptimize.optimizeWrite = true\n--   delta.autoOptimize.autoCompact   = true",
      noteLabel: "Model answer:",
      note: "\"Streaming and frequent small MERGEs create many tiny files, and small files kill reads through per-file open overhead and bloat the log.<br><br>OPTIMIZE fixes it by bin-packing — rewriting many small files into fewer files around 128MB to 1GB, committed atomically so readers aren't disrupted.<br><br>On Databricks I turn on Auto Optimize so optimized writes and auto-compaction prevent the problem at write time.<br><br>My target is roughly 128MB to 1GB per file — big enough to amortize the open cost, small enough to keep parallelism. Compaction is routine maintenance; a table that's never optimized slowly degrades.\"",
      followups: [
        "\"A streaming table has millions of tiny files — impact and fix?\"",
        "\"What file size do you target and why both bounds matter?\"",
        "\"How do you stop small files forming in the first place?\""
      ]
    },
    {
      title: "Z-ordering, liquid clustering & partitioning",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Three ways to co-locate data so skipping works. Partitioning: physical directories by a low-cardinality column (date) — great for the main date filter, but partitioning on high-cardinality columns creates the small-files/over-partitioning problem. Z-ordering (with OPTIMIZE ZORDER BY): multi-column sorting that co-locates related values across a few columns so filters on any of them skip well — used for the high-cardinality columns you filter/join on (customer_id, region) that you can't partition by. Liquid clustering: the newer replacement that supersedes both partitioning and Z-order — you declare CLUSTER BY columns and Delta maintains the layout incrementally, adapting as data/queries change, without the rigidity of directory partitioning or full re-Z-order. Rule of thumb now: liquid clustering where available; otherwise partition on date + Z-order the high-cardinality filters.",
      code: "-- Classic: partition on date, Z-order the high-cardinality filters\nOPTIMIZE claims ZORDER BY (customer_id, region);\n\n-- Newer: liquid clustering (supersedes partitioning + Z-order)\n-- CREATE TABLE claims (...) CLUSTER BY (customer_id, region);",
      noteLabel: "Model answer:",
      note: "\"Three ways to co-locate data so skipping works.<br><br>Partitioning makes physical directories by a low-cardinality column like date — great for the date filter, but partitioning on high-cardinality columns causes over-partitioning and small files.<br><br>Z-ordering is multi-column sorting that co-locates related values, so filters on any of those columns skip well. I use it for the high-cardinality columns I filter or join on that I can't partition by.<br><br>Liquid clustering is the newer approach that supersedes both — I declare cluster-by columns and Delta maintains the layout incrementally, adapting as data and queries change, without directory rigidity.<br><br>So my rule now is liquid clustering where available, otherwise partition on date and Z-order the high-cardinality filters.\"",
      followups: [
        "\"You filter heavily on customer_id but can't partition by it — what do you do?\"",
        "\"What problem does liquid clustering solve over partitioning + Z-order?\"",
        "\"When is partitioning actively harmful?\""
      ]
    },
    {
      title: "Deletion vectors & merge-on-read",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Classically, a DELETE/UPDATE/MERGE of even one row rewrites the whole file containing it (copy-on-write) — expensive for small changes. Deletion vectors change this to merge-on-read: instead of rewriting the file, Delta writes a small side file marking which rows are logically deleted, and readers apply it to skip those rows on the fly. This makes point deletes and updates far cheaper (no big rewrite), at the cost of a little read-time overhead and needing periodic OPTIMIZE to physically apply the vectors and reclaim space. It's the same trade the table formats all converge on: copy-on-write (cheap reads, costly writes) vs merge-on-read (cheap writes, slightly costlier reads). Know that deletion vectors exist and turn Delta's DML from always-copy-on-write into an on-read model for the changed rows.",
      noteLabel: "Model answer:",
      note: "\"Classically a delete or update of even one row rewrites the entire file that holds it — copy-on-write — which is expensive for small changes.<br><br>Deletion vectors switch that to merge-on-read: instead of rewriting the file, Delta writes a small side file marking which rows are logically deleted, and readers apply it to skip those rows on the fly.<br><br>That makes point deletes and updates much cheaper, at the cost of a little read overhead and needing a periodic OPTIMIZE to physically apply the vectors and reclaim space.<br><br>It's the classic copy-on-write versus merge-on-read trade every table format converges on — cheap reads and costly writes, versus cheap writes and slightly costlier reads. Delta lets me get the merge-on-read benefit for the changed rows.\"",
      followups: [
        "\"Why is deleting one row from a big file expensive by default?\"",
        "\"What do deletion vectors trade to make writes cheaper?\"",
        "\"Copy-on-write vs merge-on-read — when does each win?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview Prep — Delta Lake questions with model answers",
    desc: "The Delta questions that separate 'I used MERGE once' from 'I understand the log,' structured fundamentals → advanced. Each hides its model answer until you expand it, and ends with the follow-ups an interviewer digs with. Practice by explaining the mechanism aloud, then checking."
  },
  cards: [
    {
      title: "\"What does Delta Lake add over plain Parquet, and how?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "Whether you can trace every Delta feature back to the transaction log — the core mental model.",
      noteLabel: "Model answer:",
      note: "\"Delta is Parquet data files plus a transaction log that records, as ordered commits, which files make up the table at each version.<br><br>Every feature comes from that log. ACID, because a commit is an atomic new log file. Time travel, because I can replay the log to any past version. Schema enforcement, because the log stores the schema. Fast reads, because the log carries per-file min/max stats for data skipping. And upserts and deletes, because MERGE just commits new files and removes old ones in the log.<br><br>Plain Parquet has none of this — no log means a failed write leaves partial files a reader can see, and there's no way to update a row without managing files by hand. Delta isn't a new format; it's Parquet plus that metadata layer.\"",
      followups: [
        "\"Where does the current state of the table live?\"",
        "\"How does time travel actually work?\"",
        "\"What makes a write atomic?\""
      ]
    },
    {
      title: "\"How does Delta handle two jobs writing at the same time?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Optimistic concurrency and what actually conflicts — a deep-internals question.",
      noteLabel: "Model answer:",
      note: "\"Delta uses optimistic concurrency, not locks.<br><br>Each writer reads the current version, stages its added and removed files, then tries to commit as the next version by atomically creating that numbered log file. Only one writer can win a given version number.<br><br>If a writer loses the race, Delta checks whether the changes actually conflict — did the other one touch files or rows this one depended on? If not, it retries against the new version. If they genuinely conflict, it throws a concurrent-modification error.<br><br>So concurrent appends are fine because they don't conflict, but two blind updates to the same data can collide. I reduce conflicts by narrowing writes with partition predicates so they touch disjoint files.\"",
      followups: [
        "\"Do two appends conflict? Two overlapping updates?\"",
        "\"How would you reduce write conflicts on a hot table?\"",
        "\"Why optimistic concurrency instead of locking?\""
      ]
    },
    {
      title: "\"A MERGE is slow and rewrites most of the table. Why, and how do you fix it?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Practical MERGE performance — the most common real-world Delta problem.",
      noteLabel: "Model answer:",
      note: "\"The usual cause is that the MERGE can't prune the target, so it rewrites far more files than the change needs.<br><br>First, I add a predicate on the partition or clustering column to the ON clause, so Delta only touches the recent partitions the change actually affects instead of scanning the whole table.<br><br>Second, I make sure the source is deduplicated on the match key, because duplicate keys both error and force extra work.<br><br>Third, I check file layout — if it's a sea of tiny files or badly clustered, OPTIMIZE and Z-order or liquid clustering on the merge key help. And deletion vectors make the row-level changes cheaper by avoiding full-file rewrites.<br><br>The core fix is almost always narrowing the match so it prunes.\"",
      followups: [
        "\"What in the ON clause enables target pruning?\"",
        "\"How do deletion vectors change MERGE cost?\"",
        "\"Why does a duplicate key in the source hurt?\""
      ]
    },
    {
      title: "\"A GDPR request says delete a customer. Walk me through it on Delta.\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Whether you know a DELETE alone isn't erasure — the time-travel/VACUUM interplay, key in regulated shops.",
      noteLabel: "Model answer:",
      note: "\"A DELETE alone isn't enough. It removes the rows logically — Delta writes new files without them and marks the old files removed — but those old files still exist, so time travel could still surface the data.<br><br>For real erasure I also run VACUUM to physically purge the removed files older than the retention window. Only after that is the data actually gone.<br><br>The tension I'd raise is time-travel retention versus the deletion deadline: I can't keep thirty days of history and also guarantee erasure within twenty-four hours for the same rows. So on tables holding PII I set a shorter VACUUM retention to meet the regulation, and I document that policy.<br><br>I'd also confirm the data isn't lingering in downstream copies, caches, or backups.\"",
      followups: [
        "\"After DELETE, is the data gone? What else runs?\"",
        "\"How do you reconcile time travel with right-to-be-forgotten?\"",
        "\"Where else might the data still live?\""
      ]
    },
    {
      title: "\"How do you make a Delta streaming pipeline exactly-once?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "The interplay of checkpointing, atomic commits, and MERGE keys — senior streaming design.",
      noteLabel: "Model answer:",
      note: "\"Exactly-once comes from three things working together.<br><br>Structured Streaming checkpoints its progress — the source offsets and state. Delta commits each micro-batch atomically through the log. So on a failure and replay, the checkpoint and the log agree on what was already written, and the batch isn't double-committed.<br><br>For upserting streams I use foreachBatch with a MERGE keyed on the business key, so even if a micro-batch is retried, applying it again is idempotent — the key matches and updates rather than duplicates.<br><br>So atomic commits give exactly-once appends, and MERGE keys give idempotent upserts. Together the pipeline is safe to replay after any failure.\"",
      followups: [
        "\"What role does the checkpoint play vs the Delta log?\"",
        "\"Why does MERGE make a retried micro-batch safe?\"",
        "\"How does a Delta streaming SOURCE stay incremental?\""
      ]
    },
    {
      title: "\"Delta, Iceberg, or Hudi — how would you choose?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Ecosystem judgment without dogma — that you know they've converged and pick by context.",
      noteLabel: "Model answer:",
      note: "\"They solve the same problem — ACID, upserts, time travel, schema evolution over Parquet — with different metadata designs, and honestly they've largely converged in capability.<br><br>So I choose by ecosystem. On Databricks or a Spark-centric stack, Delta is the most seamless with the best tooling — OPTIMIZE, Z-order, liquid clustering, change data feed. If I need many engines reading the same table — Trino, Flink, Snowflake, BigQuery — Iceberg is the neutral standard with strong partition evolution. Hudi I'd consider where very fast upserts and incremental pulls are the dominant pattern.<br><br>I'd also note the industry is moving toward interoperability, with things like UniForm exposing one table as multiple formats, so I try not to over-index on the choice.\"",
      followups: [
        "\"All-Databricks shop — which, and why?\"",
        "\"Cross-engine reads across Trino and Snowflake — which?\"",
        "\"What's converging the three formats?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What actually makes a Delta table more than a folder of Parquet files?",
    options: [
      "A special columnar file format",
      "The transaction log (_delta_log) recording ordered commits of which files are valid at each version",
      "A required Hive metastore",
      "Row-level indexes on every column"
    ],
    correct: 1
  },
  {
    q: "How is the current state of a Delta table computed efficiently?",
    options: [
      "By listing the directory and reading every file",
      "Load the latest Parquet checkpoint, then replay only the JSON commits after it",
      "From a separate PostgreSQL catalog",
      "By scanning the newest file only"
    ],
    correct: 1
  },
  {
    q: "Two jobs APPEND to the same Delta table at the same instant. What happens?",
    options: [
      "One is rejected — appends always conflict",
      "Both succeed — appends don't conflict; optimistic concurrency retries the loser against the new version",
      "The table is corrupted",
      "They must acquire a table lock first"
    ],
    correct: 1
  },
  {
    q: "You ran DELETE FROM customers WHERE id = 42 for a GDPR request. Is the data gone?",
    options: [
      "Yes, immediately and permanently",
      "No — DELETE is logical; old files remain for time travel until VACUUM purges them past the retention window",
      "Yes, but only after a checkpoint",
      "No — DELETE isn't supported on Delta"
    ],
    correct: 1
  },
  {
    q: "A MERGE is rewriting most of the table every run. Most likely fix?",
    options: [
      "Add more executors",
      "Add a partition/cluster predicate to the ON clause so the target prunes, and dedup the source key",
      "Convert the table to CSV",
      "Disable the transaction log"
    ],
    correct: 1
  },
  {
    q: "How does Delta skip reading files a query can't match?",
    options: [
      "It reads every file and filters in memory",
      "The log stores per-file min/max/null stats; files whose range can't contain matches are skipped",
      "It uses a B-tree index on disk",
      "It asks the metastore"
    ],
    correct: 1
  },
  {
    q: "You filter heavily on customer_id but can't partition by it (too high-cardinality). Best move?",
    options: [
      "Partition by customer_id anyway",
      "Z-order (or liquid-cluster) by customer_id so its values co-locate and data skipping works",
      "Store one file per customer",
      "Nothing can help"
    ],
    correct: 1
  },
  {
    q: "What do deletion vectors change about Delta DML?",
    options: [
      "They disable time travel",
      "They switch small deletes/updates from full-file rewrite (copy-on-write) to marking rows deleted (merge-on-read), making writes cheaper",
      "They compress the log",
      "They remove the need for OPTIMIZE forever"
    ],
    correct: 1
  },
  {
    q: "A job overwrote a table with garbage an hour ago. Fastest recovery on Delta?",
    options: [
      "Restore from last night's backup and reprocess",
      "RESTORE TABLE ... TO VERSION AS OF <last good> — a one-line rollback via the log (if VACUUM hasn't purged the files)",
      "Rebuild the table from source",
      "Nothing — the data is lost"
    ],
    correct: 1
  },
  {
    q: "What makes a Delta Structured Streaming sink exactly-once?",
    options: [
      "Turning off retries",
      "Checkpoint offsets + Delta's atomic per-micro-batch commits agree on replay; MERGE keys make upserts idempotent",
      "Writing to CSV first",
      "A global lock on the table"
    ],
    correct: 1
  }
];
