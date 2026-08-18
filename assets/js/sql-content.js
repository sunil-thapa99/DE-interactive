// Content data for the SQL & Python/PySpark coding interview module.
const MODULE_ID = "sql";
const CONTENT = {

overview: {
  intro: {
    title: "Live-coding rounds: what they actually test",
    desc: "A DE coding round is rarely about whether you know SQL syntax — it's whether you decompose an ambiguous problem, reach for the right window function, reason about NULLs and duplicates, and talk about cost. This module drills the exact SQL and PySpark patterns that recur in finance/transaction and healthcare-claims interviews, each with a runnable solution, the reasoning behind it, and the cross-questions an interviewer follows up with."
  },
  cards: [
    {
      title: "How to approach a live SQL/PySpark problem",
      badge: "fundamentals",
      conceptLabel: "The framework:",
      concept: "The candidates who pass aren't the fastest typists — they're the ones who make their thinking legible. Five moves, in order: (1) Restate the problem and clarify the grain — 'one row per transaction, or per account per day?' (2) Confirm assumptions about NULLs, duplicates, ties, and time zones out loud. (3) Sketch the shape of the answer (which columns, which grain) before writing. (4) Write the query, narrating why each CTE exists. (5) State the complexity / cost and one edge case you'd test. Interviewers are scoring your communication and correctness reflexes as much as the final query.",
      navLabel: "Why clarifying grain matters most:",
      nav: "The single most common failure is answering the wrong question because the grain was assumed. 'Top customers by spend' — spend gross or net of refunds? Over what window? Per card or per customer (a customer has many cards)? Ten seconds of clarifying questions prevents a perfect query to the wrong problem. At Amex, 'a transaction' can mean auth, settlement, or a reversal — the grain is never free.",
      noteLabel: "Model answer:",
      note: "\"Before I write anything, I want three things clear. What's the grain of the input and the expected output? How should I treat NULLs and duplicate rows? And how do I break ties?<br><br>Then I'll write it in CTEs so it reads top to bottom. And I'll tell you where it'd get expensive at scale.\" That one sentence signals seniority.",
      followups: [
        "\"You wrote a correct query — now the table is 5 billion rows. What changes?\"",
        "\"How would you verify your query is right before shipping it — what would you check?\""
      ]
    },
    {
      title: "The window-function mental model",
      badge: "fundamentals",
      conceptLabel: "The one idea behind ROW_NUMBER, RANK, LAG, running totals:",
      concept: "Nearly every non-trivial analytics query is a window function. A window does NOT collapse rows like GROUP BY — it computes a value for each row over a related set of rows (the 'window'), defined by PARTITION BY (the group), ORDER BY (the sequence within the group), and an optional frame (ROWS/RANGE BETWEEN). Once you see 'per X, ordered by Y, compute Z relative to neighbors', it's a window function: dedup (ROW_NUMBER), ranking (RANK/DENSE_RANK), previous/next value (LAG/LEAD), running totals (SUM OVER with a frame), and sessionization all fall out of this one model.",
      navLabel: "The distinction interviewers probe:",
      nav: "GROUP BY returns one row per group and loses the detail rows; a window function keeps every row and attaches an aggregate. If the interviewer asks 'top 3 transactions per account, keeping the transaction rows', GROUP BY can't do it — you need ROW_NUMBER. If they ask 'total spend per account', GROUP BY is the right, cheaper tool. Knowing which to reach for is the tell.",
      noteLabel: "Model answer:",
      note: "\"A window function keeps the rows and computes something over a partition. GROUP BY collapses them.<br><br>I reach for windows when I need per-row context: a rank, a prior value, a running total. I use GROUP BY when I only need the aggregate, because it's cheaper.\"",
      followups: [
        "\"What's the difference between RANK, DENSE_RANK, and ROW_NUMBER on tied values?\"",
        "\"When is a GROUP BY strictly cheaper than an equivalent window query?\""
      ]
    }
  ]
},

sql: {
  intro: {
    title: "SQL patterns — the ones that actually come up",
    desc: "Each card is a pattern you'll be asked to write live, ordered roughly fundamentals → staff-level. Every card has a runnable solution (ANSI SQL, notes where dialects differ), the reasoning, and the follow-ups. Examples lean on transactions and healthcare claims because that's where these patterns bite hardest."
  },
  cards: [
    {
      title: "ROW_NUMBER vs RANK vs DENSE_RANK",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "All three number rows within a partition ordered by some key; they differ ONLY on ties. ROW_NUMBER gives every row a distinct number even on a tie (1,2,3,4) — arbitrary among ties unless you add a tiebreaker to ORDER BY. RANK leaves gaps after ties (1,1,3,4). DENSE_RANK does not (1,1,2,3). Pick ROW_NUMBER when you need exactly one row per group (dedup, 'the latest'); RANK/DENSE_RANK when ties should genuinely share a position (leaderboards).",
      code: "SELECT\n  account_id,\n  txn_id,\n  amount,\n  ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY amount DESC) AS rn,\n  RANK()       OVER (PARTITION BY account_id ORDER BY amount DESC) AS rnk,\n  DENSE_RANK() OVER (PARTITION BY account_id ORDER BY amount DESC) AS drnk\nFROM transactions;",
      noteLabel: "Model answer:",
      note: "Here's the gotcha. ROW_NUMBER with a non-unique ORDER BY is non-deterministic, so two runs can pick different 'winners' among ties.<br><br>If the choice matters, say which duplicate record survives dedup, add a deterministic tiebreaker like ORDER BY amount DESC, txn_id.<br><br>Interviewers plant tied values on purpose, just to see if you notice.",
      followups: [
        "\"Your dedup keeps a different row each run — why, and how do you make it stable?\"",
        "\"Leaderboard: two players tie for 2nd. Should the next be 3rd or 4th? Which function gives which?\""
      ]
    },
    {
      title: "Dedup keeping the latest row per key",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The most common real ETL task: a CDC or claims feed delivers multiple versions of the same record (same primary key) and you want only the most recent per key. ROW_NUMBER partitioned by the key, ordered by the version/updated timestamp descending, then keep rn = 1. This beats a correlated subquery or a self-join on MAX(updated_at) because it's a single pass and handles the tie-break explicitly.",
      code: "WITH ranked AS (\n  SELECT\n    *,\n    ROW_NUMBER() OVER (\n      PARTITION BY member_id\n      ORDER BY updated_at DESC, source_file_seq DESC\n    ) AS rn\n  FROM stg_member_records\n)\nSELECT * FROM ranked WHERE rn = 1;",
      noteLabel: "Model answer:",
      note: "Why not GROUP BY member_id, MAX(updated_at) then join back? Because if two rows share the same member_id AND updated_at, you get duplicate winners and the join fans out.<br><br>ROW_NUMBER with a tiebreaker, like source_file_seq, guarantees exactly one row.<br><br>In dbt this is the standard 'latest snapshot' pattern. The tiebreaker is what makes it idempotent across reruns.",
      followups: [
        "\"Two rows have the identical key AND updated_at. What does the MAX+join approach return vs ROW_NUMBER?\"",
        "\"A record was deleted upstream (soft delete flag). How do you exclude it from the latest snapshot?\"",
        "\"How would you write this in Snowflake using QUALIFY instead of a CTE?\""
      ]
    },
    {
      title: "QUALIFY — filtering on a window result",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "You can't put a window function in a WHERE clause — WHERE runs before windows are computed. The portable fix is a CTE/subquery then filter on the alias. Snowflake, BigQuery, DuckDB, and Databricks add QUALIFY, which filters on window results directly, like a HAVING for window functions. It's not ANSI but it's ubiquitous in modern warehouses and makes dedup a one-liner.",
      code: "-- Snowflake / BigQuery / Databricks\nSELECT *\nFROM stg_member_records\nQUALIFY ROW_NUMBER() OVER (\n  PARTITION BY member_id ORDER BY updated_at DESC\n) = 1;",
      noteLabel: "Model answer:",
      note: "Know both forms. In an interview, write the portable CTE version first, since it runs anywhere. Then mention that in Snowflake you'd collapse it to QUALIFY.<br><br>Reaching straight for QUALIFY on a Postgres interview is a small but real tell. Postgres doesn't support it, so it signals you conflate dialects.",
      followups: [
        "\"Why can't you filter a window function in WHERE? What's the clause evaluation order?\"",
        "\"Which engines support QUALIFY and which don't?\""
      ]
    },
    {
      title: "LAG / LEAD — comparing to the previous or next row",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "LAG(col, n) reads a value from n rows earlier in the partition; LEAD looks forward. The classic uses: day-over-day deltas (spend today vs yesterday), detecting state changes (did the account status flip?), and computing gaps between consecutive events (time since previous transaction — the basis of sessionization and fraud velocity checks). Always supply a default for the first/last row where there's no neighbor.",
      code: "SELECT\n  account_id,\n  txn_ts,\n  amount,\n  LAG(amount) OVER (PARTITION BY account_id ORDER BY txn_ts) AS prev_amount,\n  amount - LAG(amount, 1, 0) OVER (\n    PARTITION BY account_id ORDER BY txn_ts\n  ) AS delta_from_prev,\n  txn_ts - LAG(txn_ts) OVER (\n    PARTITION BY account_id ORDER BY txn_ts\n  ) AS gap_since_prev\nFROM transactions;",
      noteLabel: "Model answer:",
      note: "Here's the failure mode. If you forget the third arg, the default, the first row's delta is NULL and silently drops out of a later WHERE.<br><br>In fraud and velocity work, gap_since_prev turning up NULL for a customer's first transaction is a real bug. Set a sensible default, or handle the NULL explicitly.",
      followups: [
        "\"Detect every time an account's status changed between consecutive events. Write it.\"",
        "\"What does LAG return for the first row in each partition, and how do you control it?\""
      ]
    },
    {
      title: "Running totals and moving averages",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "SUM(x) OVER (PARTITION BY ... ORDER BY ...) with a frame gives a cumulative/rolling aggregate per row. The frame clause is where people go wrong. Default frame when you have ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — a running total. For a rolling N-row window (e.g. 7-transaction moving average) you must specify ROWS BETWEEN 6 PRECEDING AND CURRENT ROW. RANGE vs ROWS differ on ties: RANGE lumps all peer rows (same ORDER BY value) into the same frame; ROWS counts physical rows.",
      code: "SELECT\n  account_id,\n  txn_date,\n  amount,\n  SUM(amount) OVER (\n    PARTITION BY account_id ORDER BY txn_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total,\n  AVG(amount) OVER (\n    PARTITION BY account_id ORDER BY txn_date\n    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n  ) AS moving_avg_7\nFROM transactions;",
      noteLabel: "Model answer:",
      note: "Here's the subtle bug. The default frame with ORDER BY gives you RANGE. So if two rows share the same txn_date, they get the SAME running total, because both include each other. That's not what you want for a strict cumulative sum.<br><br>Specify ROWS explicitly when the grain has ties. This exact issue is what produces 'my running total has duplicate values' bug reports.",
      followups: [
        "\"Explain RANGE vs ROWS and construct a case where they give different answers.\"",
        "\"Compute a 30-day (not 30-row) rolling sum. Does ROWS work? What do you need?\""
      ]
    },
    {
      title: "Top-N per group",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "'Top 3 highest transactions per account', 'the 2 most recent claims per member' — the canonical window pattern. ROW_NUMBER (or RANK if ties should count) partitioned by the group, ordered by the metric desc, filter rn <= N. ROW_NUMBER caps the count at exactly N even with ties; RANK can return more than N rows if the Nth position is tied. Choose based on whether ties should all make the cut.",
      code: "WITH ranked AS (\n  SELECT\n    account_id, txn_id, amount,\n    ROW_NUMBER() OVER (\n      PARTITION BY account_id ORDER BY amount DESC, txn_id\n    ) AS rn\n  FROM transactions\n)\nSELECT account_id, txn_id, amount\nFROM ranked\nWHERE rn <= 3\nORDER BY account_id, rn;",
      noteLabel: "Model answer:",
      note: "If the interviewer says 'include ties at the cutoff', switch ROW_NUMBER to RANK. Now 'top 3' with a three-way tie for 3rd returns 5 rows, which may be the business rule they want.<br><br>Always clarify: top 3 rows, or top 3 distinct values? The word 'top' is ambiguous, and they're testing whether you catch it.",
      followups: [
        "\"'Top 3' with a tie at 3rd place — ROW_NUMBER returns 3 rows, RANK returns 5. Which does the business want?\"",
        "\"How would you make this efficient if there are millions of accounts?\""
      ]
    },
    {
      title: "Gaps-and-islands: finding consecutive runs",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A classic staff-level puzzle: given events with dates, find continuous runs ('islands') and the gaps between them — e.g. periods of continuous insurance enrollment, consecutive days a card was active, streaks. The trick: assign a group id that stays constant within a run. The elegant method: ROW_NUMBER() over the ordered events, and for daily data subtract it from the date — consecutive dates minus a monotonically increasing counter yield a constant, which becomes the island's group key.",
      code: "WITH numbered AS (\n  SELECT\n    member_id,\n    coverage_date,\n    coverage_date\n      - (ROW_NUMBER() OVER (\n          PARTITION BY member_id ORDER BY coverage_date\n        ) * INTERVAL '1 day') AS grp\n  FROM enrollment_days\n)\nSELECT\n  member_id,\n  MIN(coverage_date) AS island_start,\n  MAX(coverage_date) AS island_end,\n  COUNT(*)           AS days_in_island\nFROM numbered\nGROUP BY member_id, grp\nORDER BY member_id, island_start;",
      noteLabel: "Model answer:",
      note: "Here's the intuition to say out loud. Within a run of consecutive dates, the date minus its row number is constant, because both climb in lockstep. A gap breaks the lockstep and starts a new group.<br><br>This handles healthcare 'continuous enrollment' and 'find the longest active streak' the same way.<br><br>Watch for duplicate dates. Dedup first, or the row-number arithmetic drifts.",
      followups: [
        "\"Walk me through WHY date-minus-rownumber is constant within an island.\"",
        "\"There are duplicate coverage_dates per member. What breaks, and how do you fix it first?\"",
        "\"Now the gap tolerance is 'up to 3 days apart still counts as continuous'. How does the approach change?\""
      ]
    },
    {
      title: "Sessionization — grouping events into sessions",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Given a stream of user events, group them into sessions where a new session starts after an inactivity gap (e.g. 30 minutes). Three-step pattern: (1) LAG to get the previous event time per user, (2) flag a new session when the gap exceeds the threshold (or it's the first event), (3) running SUM of that flag = session number. This is the SQL twin of Spark/Flink session windows and shows up in clickstream, fraud, and 'define a customer visit' questions.",
      code: "WITH flagged AS (\n  SELECT\n    user_id, event_ts,\n    CASE WHEN event_ts - LAG(event_ts) OVER (\n           PARTITION BY user_id ORDER BY event_ts\n         ) > INTERVAL '30 minutes'\n         OR LAG(event_ts) OVER (\n           PARTITION BY user_id ORDER BY event_ts\n         ) IS NULL\n         THEN 1 ELSE 0 END AS is_new_session\n  FROM events\n)\nSELECT\n  user_id, event_ts,\n  SUM(is_new_session) OVER (\n    PARTITION BY user_id ORDER BY event_ts\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS session_id\nFROM flagged;",
      noteLabel: "Model answer:",
      note: "Interviewers check two edge cases. First, the FIRST event per user: LAG is NULL there, and it must still count as a new session, which is what the IS NULL branch handles.<br><br>Second, the frame on the running sum: it must be ROWS ... CURRENT ROW so the session id increments correctly.<br><br>Miss the NULL branch and every user's first session goes unlabeled.",
      followups: [
        "\"Why the explicit IS NULL check? What happens to the first event without it?\"",
        "\"How is this the same as a Spark session window? Where would you actually run it and why?\""
      ]
    },
    {
      title: "Self-joins — comparing rows within one table",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Join a table to itself to relate rows: employee→manager (same employees table), find pairs of transactions on the same account within a time window (fraud: two charges minutes apart in different cities), or match a claim to its prior claim. Alias both sides and put the relationship in the ON clause. Many self-join questions today are better solved with LAG (previous row) — but self-joins remain necessary for many-to-many comparisons like 'all pairs within 5 minutes'.",
      code: "-- All pairs of card charges on the same account within 5 minutes\nSELECT\n  a.account_id,\n  a.txn_id  AS txn_a,\n  b.txn_id  AS txn_b,\n  a.merchant_city AS city_a,\n  b.merchant_city AS city_b,\n  b.txn_ts - a.txn_ts AS gap\nFROM transactions a\nJOIN transactions b\n  ON a.account_id = b.account_id\n AND b.txn_ts > a.txn_ts\n AND b.txn_ts <= a.txn_ts + INTERVAL '5 minutes'\nWHERE a.merchant_city <> b.merchant_city;",
      noteLabel: "Model answer:",
      note: "There are two traps here. First, use b.txn_ts > a.txn_ts, which is strict and ordered, instead of <>. That avoids both self-pairs (a=a) and mirror duplicates (a,b and b,a).<br><br>Second, a self-join is O(n^2) per partition. That's fine for pairs-within-5-minutes on a partitioned key. But a self-join without a selective ON condition on a big table is a query that never finishes. Name the cost.",
      followups: [
        "\"How do you avoid a row joining to itself, and mirror-image duplicate pairs?\"",
        "\"When would you rewrite a self-join as a window function, and when can't you?\""
      ]
    },
    {
      title: "CTEs vs subqueries vs temp tables",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A CTE (WITH) names an intermediate result to make a query readable and to reference it multiple times. It is NOT automatically a performance win — in most engines a non-recursive CTE is inlined (optimized as if it were a subquery), so 'use a CTE to speed it up' is a myth. Postgres materialized CTEs pre-12, and some engines still do; Snowflake/BigQuery generally inline. For genuinely expensive intermediates reused many times, a temp table (or a dbt model) that's computed once beats re-deriving it.",
      code: "-- Readable multi-step logic; each CTE is one clear transform\nWITH recent_txns AS (\n  SELECT * FROM transactions\n  WHERE txn_ts >= CURRENT_DATE - INTERVAL '90 days'\n),\nper_account AS (\n  SELECT account_id, SUM(amount) AS spend_90d, COUNT(*) AS txn_count\n  FROM recent_txns\n  GROUP BY account_id\n)\nSELECT a.account_id, a.spend_90d, a.txn_count\nFROM per_account a\nWHERE a.spend_90d > 10000;",
      noteLabel: "Model answer:",
      note: "The senior answer to 'are CTEs faster?' is this: \"No, they're about readability, not speed. Most modern engines inline them, so a CTE and the equivalent subquery produce the same plan. If I reference an expensive result many times, or the optimizer keeps re-deriving it, I materialize it into a temp table or a dbt model so it's computed once.\"<br><br>Recursive CTEs are the real exception, used for hierarchies and graph walks.",
      followups: [
        "\"Is a CTE faster than the same logic as a subquery? Prove your answer.\"",
        "\"When would you deliberately materialize a CTE result to a temp table instead?\"",
        "\"Write a recursive CTE to walk an org hierarchy from a given manager down.\""
      ]
    },
    {
      title: "NULL handling and three-valued logic",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "NULL means unknown, and SQL uses three-valued logic (TRUE/FALSE/UNKNOWN). Consequences that bite: NULL = NULL is UNKNOWN (not true) — use IS NULL. WHERE x <> 'A' silently drops rows where x IS NULL. NOT IN (subquery) returns nothing if the subquery contains a single NULL. COUNT(col) skips NULLs but COUNT(*) counts them. Aggregates (SUM/AVG) ignore NULLs, so AVG over a column with NULLs divides by the non-null count, which may not be what you intend.",
      code: "-- These are NOT equivalent when status can be NULL:\nSELECT * FROM claims WHERE status <> 'DENIED';          -- drops NULL status\nSELECT * FROM claims WHERE status <> 'DENIED'\n   OR status IS NULL;                                    -- keeps them\n\n-- NOT IN lands people: if any excluded_id is NULL, this returns 0 rows\nSELECT * FROM claims\nWHERE claim_id NOT IN (SELECT bad_id FROM excluded);     -- danger\n-- Safer:\nSELECT c.* FROM claims c\nLEFT JOIN excluded e ON c.claim_id = e.bad_id\nWHERE e.bad_id IS NULL;                                  -- anti-join",
      noteLabel: "Model answer:",
      note: "The NOT IN plus NULL trap is the single most common silent-empty-result bug in production SQL.<br><br>Default to NOT EXISTS, or a LEFT JOIN ... IS NULL anti-join. Both are NULL-safe and usually plan better.<br><br>For equality that should treat NULL as a value, use IS NOT DISTINCT FROM in Postgres, or EQUAL_NULL in Snowflake.",
      followups: [
        "\"Why does NOT IN with a NULL in the list return zero rows? Walk through the logic.\"",
        "\"COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col) — what does each do with NULLs?\"",
        "\"How do you write a join key comparison that treats two NULLs as equal?\""
      ]
    },
    {
      title: "Date bucketing and time-series gap-filling",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Aggregating by time bucket (daily/weekly/monthly spend) uses DATE_TRUNC. The subtlety interviewers test: days with NO transactions produce NO row, so a naive GROUP BY has gaps — a chart or a moving average over it is wrong. The fix is to generate a complete calendar (generate_series / a date dimension) and LEFT JOIN the aggregated data onto it, filling missing buckets with 0.",
      code: "WITH calendar AS (\n  SELECT generate_series(\n    DATE '2026-01-01', DATE '2026-01-31', INTERVAL '1 day'\n  )::date AS d\n),\ndaily AS (\n  SELECT DATE_TRUNC('day', txn_ts)::date AS d, SUM(amount) AS spend\n  FROM transactions\n  GROUP BY 1\n)\nSELECT c.d, COALESCE(daily.spend, 0) AS spend\nFROM calendar c\nLEFT JOIN daily ON daily.d = c.d\nORDER BY c.d;",
      noteLabel: "Model answer:",
      note: "Always ask: do missing periods need to appear as zero? For a running total or moving average the answer is almost always yes. Otherwise a quiet day just vanishes and skews the trend.<br><br>The calendar or date-dimension LEFT JOIN is the standard fix. In Snowflake, use a date dimension table. In Postgres, generate_series.",
      followups: [
        "\"Why does GROUP BY date miss zero-activity days, and why does that matter for a 7-day moving average?\"",
        "\"How do you bucket by week starting Monday vs by ISO week? Any dialect gotchas?\""
      ]
    },
    {
      title: "Pivot and unpivot",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Pivot = rows to columns (one row per account, a column per month of spend); unpivot = columns to rows (a wide metrics table into tall key/value). Portable pivot is conditional aggregation: SUM(CASE WHEN month = 'Jan' THEN amount END). Snowflake/SQL Server have a PIVOT operator but it needs the column values known up front — truly dynamic pivots require generating SQL or doing it in the BI/Spark layer. Unpivot portably is UNION ALL or a CROSS JOIN LATERAL / VALUES.",
      code: "-- Portable pivot via conditional aggregation\nSELECT\n  account_id,\n  SUM(CASE WHEN EXTRACT(MONTH FROM txn_ts) = 1 THEN amount END) AS jan,\n  SUM(CASE WHEN EXTRACT(MONTH FROM txn_ts) = 2 THEN amount END) AS feb,\n  SUM(CASE WHEN EXTRACT(MONTH FROM txn_ts) = 3 THEN amount END) AS mar\nFROM transactions\nWHERE txn_ts >= DATE '2026-01-01'\nGROUP BY account_id;",
      noteLabel: "Model answer:",
      note: "The honest senior point: SQL pivots are fixed-width. You must know the target columns at write time.<br><br>If the set of pivot columns is dynamic, like unknown merchant categories, don't fight SQL. Pivot in the presentation layer, in Spark, or generate the SQL programmatically.<br><br>Conditional aggregation is more portable and more flexible than the PIVOT keyword.",
      followups: [
        "\"The months to pivot aren't known ahead of time. How do you handle a dynamic pivot?\"",
        "\"Unpivot a wide table of 12 monthly columns into (account, month, amount). Write it.\""
      ]
    },
    {
      title: "Anti-joins and semi-joins (EXISTS / NOT EXISTS)",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Semi-join: rows in A that HAVE a match in B, but you don't want B's columns and you don't want to fan out on multiple matches — EXISTS or IN. Anti-join: rows in A with NO match in B — NOT EXISTS or LEFT JOIN ... WHERE b.key IS NULL. The trap is using a plain JOIN for 'A that exists in B', which duplicates A rows when B has multiple matches. EXISTS stops at the first match and never fans out.",
      code: "-- Semi-join: accounts that had at least one refund (no fan-out)\nSELECT a.*\nFROM accounts a\nWHERE EXISTS (\n  SELECT 1 FROM refunds r WHERE r.account_id = a.account_id\n);\n\n-- Anti-join: accounts with NO transaction in 90 days (churn candidates)\nSELECT a.*\nFROM accounts a\nWHERE NOT EXISTS (\n  SELECT 1 FROM transactions t\n  WHERE t.account_id = a.account_id\n    AND t.txn_ts >= CURRENT_DATE - INTERVAL '90 days'\n);",
      noteLabel: "Model answer:",
      note: "Reach for EXISTS and NOT EXISTS over IN and NOT IN. They're NULL-safe, since NOT IN breaks on NULLs, and they short-circuit.<br><br>Reach for them over a JOIN when you only need existence, not B's columns. A JOIN duplicates the left row per match, which quietly inflates counts and sums.<br><br>'Why is my total double?' is often a semi-join written as a JOIN.",
      followups: [
        "\"You used an INNER JOIN to filter and your SUM doubled. Why, and what should you have used?\"",
        "\"EXISTS vs IN — performance and NULL behavior. When does it actually matter?\""
      ]
    },
    {
      title: "Query optimization — what to actually check",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Optimization is not folklore; it's reading the plan and cutting the biggest cost. The reliable levers: (1) read less data — partition pruning (filter on the partition/cluster key so the engine skips files) and column pruning (never SELECT * on a wide columnar table — you pay per column scanned). (2) Filter early — predicate pushdown so filters happen before joins/aggregations, not after. (3) Right join strategy — broadcast a small dimension instead of shuffling both sides. (4) Avoid functions on indexed/partition columns in WHERE (WHERE DATE(ts) = ... defeats pruning; use a range instead). (5) Read EXPLAIN / EXPLAIN ANALYZE to see the actual plan, not guess.",
      code: "-- BAD: wrapping the partition column kills pruning + scans every column\nSELECT * FROM transactions\nWHERE DATE(txn_ts) = '2026-01-15';\n\n-- GOOD: range predicate prunes partitions; project only needed columns\nSELECT account_id, amount\nFROM transactions\nWHERE txn_ts >= TIMESTAMP '2026-01-15 00:00:00'\n  AND txn_ts <  TIMESTAMP '2026-01-16 00:00:00';\n\n-- Always look at the plan\nEXPLAIN ANALYZE\nSELECT account_id, SUM(amount) FROM transactions\nWHERE txn_ts >= DATE '2026-01-01' GROUP BY account_id;",
      noteLabel: "Model answer:",
      note: "The framing that lands: \"I don't guess. I read EXPLAIN and find the biggest node: a full scan I can prune, a shuffle I can broadcast away, or a spill I can fix with more partitions. The cheapest query reads the least data, so partition pruning and column projection come first, and join strategy second.\"<br><br>Naming that a function on the partition column defeats pruning is a concrete senior signal. It's the number one reason a 'filtered' query still scans everything.",
      followups: [
        "\"WHERE DATE(txn_ts) = '2026-01-15' — why is this slow on a partitioned table and how do you fix it?\"",
        "\"You see a huge shuffle in the plan for a join. What are your options?\"",
        "\"How do partition pruning and predicate pushdown differ? Can you have one without the other?\""
      ]
    },
    {
      title: "GROUP BY ... HAVING and finding duplicates",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "WHERE filters rows before grouping; HAVING filters groups after aggregation. The everyday DE use: find duplicate keys (a supposedly-unique column that isn't) with GROUP BY key HAVING COUNT(*) > 1. This is the first thing to run when a downstream join fans out or a 'unique' constraint is suspected broken — a 30-second data-quality check.",
      code: "-- Which member_ids appear more than once in what should be a unique table?\nSELECT member_id, COUNT(*) AS n\nFROM dim_member\nGROUP BY member_id\nHAVING COUNT(*) > 1\nORDER BY n DESC;",
      noteLabel: "Model answer:",
      note: "This is my reflex when a join produces more rows than expected. Check both sides for duplicate join keys with GROUP BY ... HAVING COUNT(*) > 1, before touching the join itself.<br><br>The fan-out is almost always a non-unique key on one side, not a bug in the JOIN.<br><br>It's cheap to run, and it's the first thing I'd show an interviewer as my debugging instinct.",
      followups: [
        "\"A join returns 3x the rows you expected. What's your first query to diagnose it?\"",
        "\"Can you reference a column alias from the SELECT in HAVING? In WHERE? Why the difference?\""
      ]
    },
    {
      title: "Slowly Changing Dimensions — Type 1 vs Type 2 (MERGE + effective dating)",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A dimension attribute changes upstream (a member changes address, a provider changes network status) — how the warehouse records that change is the SCD type. Type 1: overwrite in place, keep no history (the row just reflects the current value). Type 2: never overwrite — close the old row and insert a new version, so history is queryable 'as of' any date. Type 2 is the one interviewers press on because it forces surrogate keys, effective-dating, and a current-row flag. Mechanics: each dimension row gets a surrogate key (its own PK, independent of the natural/business key), effective_from / effective_to timestamps, and is_current. On a change you set effective_to + is_current=false on the old version, then insert the new version as current. Facts join on the surrogate key, so a fact recorded last year still points at the attribute values that were true last year — that's the whole reason Type 2 exists.",
      code: "-- SCD Type 2 upsert via MERGE (Snowflake/BigQuery/Postgres 15+ syntax)\n-- Detect change with a hash of tracked columns so we don't version on no-op reruns.\nMERGE INTO dim_member AS tgt\nUSING (\n  SELECT member_id, name, address, plan_tier,\n         MD5(name || '|' || address || '|' || plan_tier) AS row_hash,\n         CURRENT_TIMESTAMP() AS load_ts\n  FROM stg_member\n) AS src\nON  tgt.member_id = src.member_id\nAND tgt.is_current = TRUE\n-- close the old version only when a tracked attribute actually changed\nWHEN MATCHED AND tgt.row_hash <> src.row_hash THEN UPDATE SET\n  tgt.effective_to = src.load_ts,\n  tgt.is_current   = FALSE\n-- brand-new business key -> insert as current\nWHEN NOT MATCHED THEN INSERT\n  (member_sk, member_id, name, address, plan_tier, row_hash, effective_from, effective_to, is_current)\n  VALUES\n  (DEFAULT,   src.member_id, src.name, src.address, src.plan_tier, src.row_hash, src.load_ts, NULL, TRUE);\n\n-- MERGE can't both close the old row AND insert its replacement in one pass,\n-- so the new version for a CHANGED key is inserted in a second statement:\nINSERT INTO dim_member (member_sk, member_id, name, address, plan_tier, row_hash, effective_from, effective_to, is_current)\nSELECT DEFAULT, s.member_id, s.name, s.address, s.plan_tier, s.row_hash, CURRENT_TIMESTAMP(), NULL, TRUE\nFROM stg_member s\nJOIN dim_member t ON t.member_id = s.member_id AND t.is_current = FALSE AND t.effective_to = <this run's load_ts>\nWHERE NOT EXISTS (SELECT 1 FROM dim_member c WHERE c.member_id = s.member_id AND c.is_current = TRUE);\n\n-- ----- ANSWERING THE 'AS OF' FOLLOW-UP -----\n-- The version that was current at a point in time: half-open interval [from, to).\n-- effective_to IS NULL means the still-open current row. Using the same half-open\n-- rule everywhere is what prevents a fact landing exactly on a boundary from\n-- matching two versions (double-count) or none (drop).\nSELECT f.claim_id, f.amount, d.plan_tier\nFROM fact_claim f\nJOIN dim_member d\n  ON d.member_id = f.member_id\n AND f.service_date >= d.effective_from\n AND (f.service_date < d.effective_to OR d.effective_to IS NULL);\n\n-- ----- ANSWERING THE LATE-ARRIVING-DIMENSION FOLLOW-UP -----\n-- A change is discovered today but truly happened at 2026-03-01, and a LATER\n-- version already exists. You must SPLIT the version that spanned that date, not\n-- append to the tail — otherwise history reads wrong for March–now.\n-- 1) Shorten the version that covered 2026-03-01 so it ends at the true change:\nUPDATE dim_member\n   SET effective_to = TIMESTAMP '2026-03-01 00:00:00', is_current = FALSE\n WHERE member_id = 'M-100'\n   AND effective_from <  TIMESTAMP '2026-03-01 00:00:00'\n   AND (effective_to  >  TIMESTAMP '2026-03-01 00:00:00' OR effective_to IS NULL);\n-- 2) Insert the corrected version, bounded by the NEXT known version's start\n--    (NULL/current only if no later version exists):\nINSERT INTO dim_member (member_sk, member_id, name, address, plan_tier, row_hash, effective_from, effective_to, is_current)\nSELECT DEFAULT, 'M-100', 'Ada Byte', '9 New St', 'GOLD',\n       MD5('Ada Byte|9 New St|GOLD'),\n       TIMESTAMP '2026-03-01 00:00:00',\n       (SELECT MIN(effective_from) FROM dim_member\n         WHERE member_id = 'M-100' AND effective_from > TIMESTAMP '2026-03-01 00:00:00'),\n       FALSE;  -- is_current stays TRUE only if this is now the newest version\n\n-- ----- ANSWERING THE DELETE FOLLOW-UP -----\n-- Type 2 NEVER hard-deletes: a delete is just the end of validity. Close the\n-- current row; the history (and any facts that pointed at it) stays intact and\n-- 'as of' queries before the delete still resolve. Add an is_deleted tombstone\n-- flag so consumers can tell 'gone' from 'simply not current yet'.\nUPDATE dim_member\n   SET effective_to = CURRENT_TIMESTAMP(), is_current = FALSE, is_deleted = TRUE\n WHERE member_id = 'M-100' AND is_current = TRUE;\n-- (Hard-deleting the dim rows would orphan every historical fact on the surrogate\n--  key and rewrite the past — exactly what Type 2 exists to prevent.)\n\n-- ----- ANSWERING THE IN-BATCH ORDERING FOLLOW-UP -----\n-- Two changes to the same key arrive in one load. The MERGE sees the key once and\n-- would collapse them, losing the middle version. Fix: don't feed raw staging to\n-- the MERGE — first order the intra-batch changes and treat the batch as a chain.\n-- Cheapest correct option when only the end state matters: keep the LAST change,\n-- version once. When every intermediate state must be preserved: build the\n-- effective_from/to chain in staging, then load all versions.\nWITH ordered AS (\n  SELECT member_id, name, address, plan_tier, change_ts,\n         ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY change_ts) AS seq,\n         LEAD(change_ts) OVER (PARTITION BY member_id ORDER BY change_ts) AS next_ts\n  FROM stg_member_changes\n)\nSELECT member_id, name, address, plan_tier,\n       change_ts             AS effective_from,\n       next_ts               AS effective_to,       -- NULL on the last => current\n       (next_ts IS NULL)     AS is_current\nFROM ordered;  -- this pre-chained set is what you load, not the raw feed",
      noteLabel: "Model answer:",
      note: "\"Type 1 overwrites. I use it when history has no business value, like fixing a typo.<br><br>Type 2 keeps history: a surrogate key, effective_from and effective_to, and is_current. Facts join on the surrogate key, so an old fact still resolves to the attributes that were true then.<br><br>Two gotchas I call out unprompted. First, diff on a hash of the tracked columns, not row-by-row. That way a reload of unchanged data doesn't create phantom versions and break idempotency. Second, a single MERGE can't close the old row and insert its successor at once. You close in the MERGE and insert successors in a second step, or the new version silently overwrites the close.<br><br>At Cedar Gate that mattered for provider network-status changes: a claim adjudicated under the old status must never re-resolve to the new one.\"<br><br>The remaining follow-ups, answered crisply.<br><br>(a) Use a surrogate key, not the natural key. A Type 2 dimension has MANY rows per business key, so joining facts on member_id would fan out to every version. The surrogate key identifies ONE version, so a fact resolves to exactly the attributes true at that time. It also decouples the warehouse from source-key changes and reuse.<br><br>(b) When to pick each. Type 1, overwrite, when history has no business value: typo fixes, backfilled nulls. Type 3, add a 'previous_value' column, only when you need exactly one prior value side-by-side, which is rare. A full daily snapshot table when nearly every attribute changes often, or you need point-in-time on the WHOLE row cheaply; a snapshot is simpler than Type 2 but storage-heavy, so reserve it for small dimensions. Type 2 is the default when history matters and changes are sparse.<br><br>(c) dbt snapshots implement exactly this. strategy='timestamp', an updated_at column, is the effective-dating driver. strategy='check', check_cols, is the hash-diff I showed by hand. dbt manages dbt_valid_from, dbt_valid_to, and dbt_scd_id, the surrogate, for you. Same model, generated.",
      followups: [
        "\"Why a surrogate key instead of just joining facts on the natural/business key?\"",
        "\"A dimension record arrives late — its change happened last week but you're loading it today. How do you back-date effective_from without corrupting the version that was current in between? (late-arriving dimension)\"",
        "\"How do you query the dimension 'as of' a specific date — give me the WHERE clause.\"",
        "\"Why diff on a hash column instead of comparing each attribute? What breaks on a full reload if you don't?\"",
        "\"A business key is hard-deleted upstream. Do you delete the dim rows, or mark them? How does Type 2 represent a delete?\"",
        "\"Why can't one MERGE both expire the old row and insert the new version? What actually happens if you try?\"",
        "\"When would you pick Type 1, Type 3, or a full daily snapshot table over Type 2?\"",
        "\"How does dbt snapshots implement this, and what does its check/timestamp strategy correspond to here?\"",
        "\"Two updates to the same key land in one batch. How do you make sure the versions chain in the right order?\""
      ]
    }
  ]
},

pyspark: {
  intro: {
    title: "PySpark & Python coding patterns",
    desc: "The DataFrame transforms, joins, window functions, and skew/UDF tradeoffs you'll be asked to write, plus a couple of pure-Python cards that come up as warmups. Each has runnable code and the reasoning an interviewer wants to hear — especially 'why is this Spark job slow' territory."
  },
  cards: [
    {
      title: "DataFrame basics: select, filter, withColumn",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "PySpark DataFrames are lazy: transformations (select, filter, withColumn, groupBy) build a plan; nothing runs until an action (show, count, write, collect) triggers it. This is why a chain of ten transforms is 'free' until the write — and why an accidental collect() or count() in a loop is what actually kills a job. Prefer column expressions (F.col, F.when) over Python-side row loops, which don't parallelize.",
      code: "from pyspark.sql import functions as F\n\ndf = (\n    spark.read.parquet(\"s3://lake/transactions/\")\n      .filter(F.col(\"txn_ts\") >= \"2026-01-01\")\n      .withColumn(\"is_large\", F.col(\"amount\") > 10000)\n      .withColumn(\"amount_usd\", F.col(\"amount\") * F.col(\"fx_rate\"))\n      .select(\"account_id\", \"txn_ts\", \"amount_usd\", \"is_large\")\n)\ndf.show(5)   # first action — plan runs now",
      noteLabel: "Model answer:",
      note: "Lead with the lazy-evaluation point: \"Nothing executes until an action, so Spark can optimize the whole chain via Catalyst and prune columns and partitions before reading. The performance mistakes are triggering actions you don't need: count() to 'check', collect() to driver memory, or show() inside a loop.\"",
      followups: [
        "\"Which of these operations are lazy and which trigger a job?\"",
        "\"You call df.count() three times in your script 'to log progress'. What's the cost?\""
      ]
    },
    {
      title: "groupBy and aggregations",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "groupBy(...).agg(...) is the Spark equivalent of SQL GROUP BY. Pass multiple aggregations in one agg() call — each is computed in the same shuffle, far cheaper than chaining separate groupBys. A groupBy triggers a shuffle (data for each key must land on one executor), so the cost model is 'how much data moves across the network', and skewed keys are the enemy (next cards).",
      code: "from pyspark.sql import functions as F\n\nagg = (\n    df.groupBy(\"account_id\")\n      .agg(\n          F.sum(\"amount\").alias(\"total_spend\"),\n          F.count(\"*\").alias(\"txn_count\"),\n          F.avg(\"amount\").alias(\"avg_amount\"),\n          F.countDistinct(\"merchant_id\").alias(\"distinct_merchants\"),\n          F.max(\"txn_ts\").alias(\"last_txn\"),\n      )\n)",
      noteLabel: "Model answer:",
      note: "Compute all aggregates in one agg() call. I've seen code do five separate groupBy-plus-join passes for five metrics, which is five shuffles instead of one.<br><br>Also, countDistinct is expensive, because it can't be partially aggregated as cheaply as sum or count. For huge cardinality where you can tolerate some error, approx_count_distinct, which is HyperLogLog, is dramatically faster.",
      followups: [
        "\"Why is countDistinct more expensive than count, and what's the cheaper approximate option?\"",
        "\"You need 5 metrics per account. One agg call or five? Why?\""
      ]
    },
    {
      title: "Joins and broadcast",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A shuffle (sort-merge) join repartitions BOTH sides by the join key across the network — expensive but necessary when both sides are large. A broadcast join ships a SMALL table in full to every executor so the large side never shuffles — the single biggest join speedup when one side fits in memory (dimension tables, lookup tables). Spark auto-broadcasts under spark.sql.autoBroadcastJoinThreshold (default 10MB); hint it explicitly with F.broadcast() when you know a side is small but Spark's estimate is off.",
      code: "from pyspark.sql import functions as F\n\n# small merchant dimension broadcast to every executor -> no shuffle of txns\nenriched = transactions.join(\n    F.broadcast(merchant_dim),\n    on=\"merchant_id\",\n    how=\"left\",\n)",
      noteLabel: "Model answer:",
      note: "\"When one side is small I broadcast it. That removes the shuffle of the big side entirely, which is usually where the time goes.<br><br>Spark auto-broadcasts below the threshold, but the estimate is often wrong for freshly computed DataFrames, so I hint F.broadcast() explicitly.\"<br><br>The failure mode to name: broadcasting a table that's too big OOMs the driver or executors. Broadcast is for genuinely small dimensions, not 'medium' tables.",
      followups: [
        "\"How does Spark decide to broadcast, and when does its size estimate mislead it?\"",
        "\"You broadcast a table and executors start OOMing. What happened and what do you do?\"",
        "\"Both tables are large. Broadcast is out — what determines join performance now?\""
      ]
    },
    {
      title: "Window functions in Spark",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Same window model as SQL, via pyspark.sql.Window. partitionBy = the group, orderBy = the sequence, and rowsBetween/rangeBetween = the frame. Dedup-latest, top-N, running totals, LAG/LEAD all transfer directly. The performance caveat: a window with partitionBy triggers a shuffle to co-locate each partition's rows, and a partition with no partitionBy (global order) funnels ALL data to one executor — a common accidental-full-scan-on-one-core mistake.",
      code: "from pyspark.sql import Window, functions as F\n\nw = Window.partitionBy(\"member_id\").orderBy(F.col(\"updated_at\").desc())\n\nlatest = (\n    df.withColumn(\"rn\", F.row_number().over(w))\n      .filter(F.col(\"rn\") == 1)\n      .drop(\"rn\")\n)\n\n# running total needs an explicit frame\nw2 = (Window.partitionBy(\"account_id\").orderBy(\"txn_date\")\n            .rowsBetween(Window.unboundedPreceding, Window.currentRow))\nrun = df.withColumn(\"running_total\", F.sum(\"amount\").over(w2))",
      noteLabel: "Model answer:",
      note: "Two things to flag. First, a Window without partitionBy puts everything in one partition on one executor. That's fine for tiny data, but catastrophic at scale. If you need a global order, reconsider the requirement.<br><br>Second, just like SQL, orderBy without a frame defaults to a range frame up to the current row. Specify rowsBetween for a true row-count running total.",
      followups: [
        "\"What happens when a Window has orderBy but no partitionBy on a billion-row DataFrame?\"",
        "\"Give the Spark equivalent of SQL's QUALIFY ROW_NUMBER() = 1.\""
      ]
    },
    {
      title: "Data skew and salting",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Skew = a few keys have vastly more rows than the rest, so after a shuffle one executor gets a giant partition while others finish and idle — the job's tail is one straggler task. Classic in finance: one mega-merchant or a null/default account_id dominating. Fixes, cheapest first: (1) Adaptive Query Execution (spark.sql.adaptive.enabled, on by default in Spark 3+) auto-splits skewed partitions — try this first. (2) Broadcast the small side if it's a join. (3) Salting: append a random bucket to the hot key so it spreads across executors, then aggregate in two stages.",
      code: "from pyspark.sql import functions as F\n\nN = 16  # salt buckets for hot keys\nsalted = df.withColumn(\"salt\", (F.rand() * N).cast(\"int\"))\n\nstage1 = (salted\n    .groupBy(\"account_id\", \"salt\")\n    .agg(F.sum(\"amount\").alias(\"partial\")))\n\nfinal = (stage1\n    .groupBy(\"account_id\")\n    .agg(F.sum(\"partial\").alias(\"total_spend\")))",
      noteLabel: "Model answer:",
      note: "The senior sequence: \"First I confirm it IS skew: one or two straggler tasks in the Spark UI taking 10x the rest. Then I try AQE skew handling, usually already on. Then broadcast, if it's a joinable dimension. Salting is the manual last resort, because it complicates the aggregation into two stages, so I only reach for it when a specific hot key resists AQE.\"<br><br>Mentioning you'd check the Spark UI first shows you diagnose, not cargo-cult.",
      followups: [
        "\"How do you confirm a slow job is skew and not just under-resourced?\"",
        "\"Walk me through salting a skewed JOIN (not a groupBy) — it's trickier. How?\"",
        "\"AQE is enabled — why might it still not fix your skew?\""
      ]
    },
    {
      title: "UDFs vs native functions",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A Python UDF serializes each row from the JVM to a Python process, runs your function, serializes back — it's a black box Catalyst can't optimize and it's slow. Order of preference: (1) native Spark SQL functions (F.*) always, they run in the JVM and optimize/pushdown. (2) If you must write custom logic, a pandas UDF (vectorized, Arrow-based) processes batches and is far faster than a row-at-a-time UDF. (3) A plain Python UDF only as a last resort. 'Rewrite this UDF with native functions' is a common optimization ask.",
      code: "from pyspark.sql import functions as F\n\n# SLOW: Python UDF, row-by-row, opaque to the optimizer\n# @F.udf(\"double\")\n# def to_usd(amount, rate): return amount * rate\n# df.withColumn(\"usd\", to_usd(\"amount\", \"fx_rate\"))\n\n# FAST: native expression, stays in the JVM, optimizable\ndf = df.withColumn(\"usd\", F.col(\"amount\") * F.col(\"fx_rate\"))\n\n# If custom logic is unavoidable, vectorized pandas UDF beats a plain UDF\nfrom pyspark.sql.functions import pandas_udf\n@pandas_udf(\"double\")\ndef risk_score(amount, tenure):\n    return (amount.rank(pct=True) * 100) / (tenure + 1)",
      noteLabel: "Model answer:",
      note: "\"Native first, always. A Python UDF breaks Catalyst optimization and pays serialization per row.<br><br>If I genuinely need custom logic Spark can't express, I use a pandas or Arrow UDF so it's vectorized per batch.<br><br>The classic interview trap is a UDF doing something F.when or a built-in already does. I'd rewrite it natively, and it'll be an order of magnitude faster.\"",
      followups: [
        "\"Why exactly is a Python UDF slow? What's the overhead per row?\"",
        "\"When is a pandas UDF still worth it over pure native functions?\""
      ]
    },
    {
      title: "Reading and writing Parquet (partitioning)",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Parquet is columnar + compressed, so Spark reads only the columns you select (column pruning) and only the files matching your filter (predicate pushdown / partition pruning). partitionBy on write creates a directory per partition value — filtering on that column later skips whole directories. The classic mistake: partitioning by a high-cardinality column (account_id) creates millions of tiny files — the 'small files problem' that destroys read performance. Partition by low-cardinality, commonly-filtered columns like date.",
      code: "# write partitioned by date (low cardinality, always filtered on)\n(df.write\n   .mode(\"overwrite\")\n   .partitionBy(\"txn_date\")\n   .parquet(\"s3://lake/transactions/\"))\n\n# read side: filter on partition col -> only relevant dirs scanned\nrecent = (spark.read.parquet(\"s3://lake/transactions/\")\n            .filter(F.col(\"txn_date\") >= \"2026-01-01\")\n            .select(\"account_id\", \"amount\"))",
      noteLabel: "Model answer:",
      note: "\"Partition by something low-cardinality and commonly filtered, usually date. Partitioning by account_id or transaction_id is the small-files disaster: millions of directories with one tiny file each, and the metadata overhead alone kills reads.<br><br>If files come out too small, I coalesce or repartition before writing, or compact them.\"<br><br>Naming the small-files problem unprompted is a strong DE signal.",
      followups: [
        "\"You partitioned by customer_id and reads got slower. Why? How do you fix it?\"",
        "\"What's the small-files problem, and how do you prevent tiny output files?\"",
        "\"How does Parquet give you predicate pushdown that CSV can't?\""
      ]
    },
    {
      title: "repartition vs coalesce",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Both change the number of partitions. repartition(n) does a FULL shuffle — can increase or decrease, and it evenly rebalances (use it to fix skew or increase parallelism). coalesce(n) only DECREASES and avoids a full shuffle by merging adjacent partitions — cheap, but can leave uneven partition sizes. Rule: coalesce to reduce partitions before a write (fewer output files) cheaply; repartition when you need to increase parallelism or rebalance skew, accepting the shuffle cost.",
      code: "# cheap reduction before write -> fewer output files, no full shuffle\ndf.coalesce(8).write.parquet(\"s3://lake/curated/\")\n\n# full shuffle to rebalance / increase parallelism (e.g. before a heavy join)\ndf.repartition(200, \"account_id\").write.parquet(\"s3://lake/keyed/\")",
      noteLabel: "Model answer:",
      note: "\"coalesce is cheap because it doesn't shuffle, so I use it to cut output-file count before writing.<br><br>But coalesce(1) on a big DataFrame is a trap: it forces all data through one task and executor, and it OOMs or crawls. If I need one file, I'd rather write partitioned and compact, or repartition then write.<br><br>I use repartition when I actually need even redistribution.\"",
      followups: [
        "\"Why can coalesce(1) on a large DataFrame kill your job while repartition(1) 'works' (slowly)?\"",
        "\"You want fewer output files after a filter that dropped 90% of rows. Which do you use?\""
      ]
    },
    {
      title: "Flatten nested JSON (pure Python)",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A frequent warmup: flatten an arbitrarily nested dict into dot-notation keys ({'a': {'b': 1}} -> {'a.b': 1}). Tests recursion, dict handling, and clean edge cases (empty dicts, lists). Recurse into dicts building a key prefix; optionally index into lists. In real DE this is the shape of parsing an HL7/FHIR claim payload or a nested event before landing it in a flat table — worth connecting to that.",
      code: "def flatten(obj, prefix=\"\", sep=\".\"):\n    out = {}\n    for k, v in obj.items():\n        key = f\"{prefix}{sep}{k}\" if prefix else k\n        if isinstance(v, dict) and v:\n            out.update(flatten(v, key, sep))\n        elif isinstance(v, list):\n            for i, item in enumerate(v):\n                ik = f\"{key}{sep}{i}\"\n                out.update(flatten(item, ik, sep) if isinstance(item, dict)\n                           else {ik: item})\n        else:\n            out[key] = v\n    return out\n\nassert flatten({\"a\": {\"b\": 1}, \"c\": [10, {\"d\": 2}]}) == \\\n    {\"a.b\": 1, \"c.0\": 10, \"c.1.d\": 2}",
      noteLabel: "Model answer:",
      note: "Clarify the edge cases OUT LOUD before coding. How do you handle lists: index them, or join them? Empty dicts: drop them, or keep as a leaf? And what about key collisions?<br><br>In production I wouldn't hand-roll this at scale. Spark's from_json plus explode plus selectExpr, with a known schema, is the right tool.<br><br>The pure-Python version is for small payloads, or the interview warmup itself.",
      followups: [
        "\"How would you do this on a billion rows? (hint: not this function)\"",
        "\"How do you handle a list of objects — index each, or explode into rows?\""
      ]
    },
    {
      title: "Dedup with a set, preserving order (pure Python)",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Remove duplicates from a list while preserving first-seen order — a set for O(1) membership tests plus a result list. The naive 'if x not in result_list' is O(n^2); the set makes it O(n). Since Python 3.7 dict.fromkeys(items) also does it in one line (insertion-ordered). Tests whether you reach for the right data structure and know the complexity difference.",
      code: "def dedup(items):\n    seen = set()\n    out = []\n    for x in items:\n        if x not in seen:      # O(1) set lookup, not O(n) list scan\n            seen.add(x)\n            out.append(x)\n    return out\n\n# one-liner, order-preserving (3.7+):\n# list(dict.fromkeys(items))\n\nassert dedup([3, 1, 3, 2, 1]) == [3, 1, 2]",
      noteLabel: "Model answer:",
      note: "Here's the point to make. 'if x not in a list' is O(n), so the whole loop is O(n^2). A set makes membership O(1), and the whole thing O(n).<br><br>If order doesn't matter, list(set(items)) is fine. If it does, the seen-set or dict.fromkeys preserves it.<br><br>Stating the complexity and the order-preservation tradeoff is what they're checking.",
      followups: [
        "\"What's the complexity of your solution vs 'if x not in result_list'? Why?\"",
        "\"The items are unhashable dicts. Now what?\""
      ]
    }
  ]
},

python: {
  intro: {
    title: "Python fundamentals & testing — the non-Spark coding screen",
    desc: "Plenty of DE loops include a plain-Python screen (data structures, a transform, a bit of design) plus a 'how do you test this pipeline' conversation. These cards drill the fundamentals that actually come up — the right container, generators for big files, the stdlib toolkit, decorators/context managers — and then pytest: fixtures, parametrize, mocking, and a testing strategy for pipelines. Runnable, with asserts you can paste into a REPL."
  },
  cards: [
    {
      title: "Picking the right data structure — list, dict, set, tuple",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The single most common Python-screen tell: do you reach for the container whose complexity fits the operation? dict/set membership and lookup are O(1) average; list membership (x in list) is O(n). Use a set for dedup and 'have I seen this key', a dict for grouping/counting and keyed lookup, a list for ordered sequences you iterate, a tuple for a fixed, hashable record (so it can be a dict key or set member). Turning an O(n^2) nested loop into an O(n) set/dict lookup is the fix interviewers are fishing for.",
      code: "# O(n^2): 'which txn_ids are also in the blocklist?' with a list\ndef flagged_slow(txns, blocklist):\n    return [t for t in txns if t in blocklist]        # t in list == O(n)\n\n# O(n): hash the blocklist once, then O(1) lookups\ndef flagged(txns, blocklist):\n    block = set(blocklist)\n    return [t for t in txns if t in block]\n\nassert flagged([1, 2, 3, 4], [2, 4]) == [2, 4]\n# tuple as a composite key — (account, day) grouping\nassert hash((\"ACC-1\", \"2026-08-11\"))  # tuples are hashable; lists are not",
      noteLabel: "Model answer:",
      note: "\"I match the container to the operation's complexity. For membership or lookup by key, I use a set or dict for O(1). If I catch myself writing `x in some_list` inside a loop, I hoist it to a set.<br><br>For grouping or counting, a dict, or defaultdict or Counter. For a fixed record that needs to be a key, a tuple, because it's hashable and immutable.<br><br>The classic red flag is a nested loop doing list membership. That's an O(n^2) that a set turns into O(n).\"",
      followups: [
        "\"You wrote `if id in seen_list` inside a loop over a million rows. What's the complexity and the fix?\"",
        "\"When would you use a tuple over a list — give a concrete DE example.\"",
        "\"dict vs set for deduping records by a business key — which, and why?\""
      ]
    },
    {
      title: "Comprehensions and generators — and why generators matter for big files",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A list comprehension builds the whole result in memory; a generator (parentheses instead of brackets, or `yield`) produces items lazily, one at a time. For a 50GB file or a streamed API you do NOT want the whole thing materialized — a generator pipeline keeps memory flat and starts producing before the input is exhausted. This is the difference between an ETL step that OOMs and one that streams. Comprehensions win for small, reusable results; generators win for large or one-pass streams.",
      code: "# Materializes every line -> memory blows up on a huge file\n# total = sum([parse(line).amount for line in open(\"claims.csv\")])\n\n# Generator pipeline: constant memory, one pass, lazy\ndef amounts(path):\n    with open(path) as f:\n        for line in f:\n            yield parse(line).amount        # produced on demand\n\n# total = sum(amounts(\"claims.csv\"))        # streams, never holds all rows\n\ngen = (x * 2 for x in range(3))\nassert next(gen) == 0 and list(gen) == [2, 4]   # lazy; consumed once",
      navLabel: "The gotcha interviewers plant:",
      nav: "A generator is single-use — once exhausted it's empty. If you iterate it twice (e.g. to count then to sum) the second pass sees nothing. Either materialize with list() when you genuinely need it twice, or restructure to one pass. Candidates who reuse an exhausted generator and get zero are the ones who haven't used them for real.",
      noteLabel: "Model answer:",
      note: "\"For large or streamed inputs I use generators, so memory stays flat and work starts before the input is fully read. That's a `yield` pipeline over a file, instead of reading it all into a list.<br><br>For small results I'll reuse, a list comprehension is fine.<br><br>The trap is that generators are one-shot. If I need two passes, I materialize once with list(), or redesign to a single pass.\"",
      followups: [
        "\"You count a generator's items then try to sum it and get 0. Why?\"",
        "\"How would you process a file too big to fit in memory in pure Python?\"",
        "\"What does `yield` actually return the first time you call the function?\""
      ]
    },
    {
      title: "The stdlib DE toolkit — collections & itertools",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Most Python data-wrangling screens are solved cleanly with the standard library — reaching for pandas or hand-rolled loops is the wrong instinct on a small screen. defaultdict avoids the 'key exists?' dance when grouping; Counter counts and gives most_common in one line; itertools.groupby collapses consecutive runs (remember: it needs sorted input); itertools.islice batches a stream without materializing it. Knowing these signals fluency and writes less code.",
      code: "from collections import defaultdict, Counter\nfrom itertools import islice\n\n# group transactions by account -> {acct: [amounts]}\ndef by_account(rows):\n    g = defaultdict(list)\n    for acct, amt in rows:\n        g[acct].append(amt)          # no 'if acct in g' needed\n    return dict(g)\n\nassert by_account([(\"A\", 10), (\"B\", 5), (\"A\", 2)]) == {\"A\": [10, 2], \"B\": [5]}\nassert Counter(\"abbccc\").most_common(1) == [(\"c\", 3)]\n\n# batch an iterable into chunks of n (bulk-load friendly), lazily\ndef batched(it, n):\n    it = iter(it)\n    while (chunk := list(islice(it, n))):\n        yield chunk\n\nassert list(batched(range(5), 2)) == [[0, 1], [2, 3], [4]]",
      noteLabel: "Model answer:",
      note: "\"For grouping I use defaultdict(list), so I don't write the key-existence check. For counting, Counter with most_common. For batching a stream into bulk-insert chunks, islice, so I never materialize the whole thing.<br><br>itertools.groupby is handy, but it only collapses CONSECUTIVE equal keys. So I sort first, or it won't group what I expect. That's the one people trip on.\"",
      followups: [
        "\"itertools.groupby returned more groups than you expected. Why?\"",
        "\"Batch a stream of records into groups of 1000 for a bulk insert — write it.\"",
        "\"defaultdict(int) vs Counter for frequency counting — any real difference?\""
      ]
    },
    {
      title: "Context managers — deterministic cleanup for files, connections, transactions",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A `with` block guarantees teardown runs even if the body raises — the reason you never leak a file handle, DB connection, or open transaction. In DE this is how you make a load step safe: acquire the connection, do the work, and have the context manager commit on success / roll back on exception, then always close. You can write your own with @contextmanager: everything before `yield` is setup, everything after is guaranteed cleanup.",
      code: "from contextlib import contextmanager\n\n@contextmanager\ndef transaction(conn):\n    tx = conn.begin()\n    try:\n        yield conn            # body runs here\n        tx.commit()           # only on clean exit\n    except Exception:\n        tx.rollback()         # guaranteed on any error\n        raise\n    finally:\n        conn.close()          # always\n\n# with transaction(conn) as c:\n#     c.execute(insert_claims)      # commit on success, rollback on raise, always closed\n\n# proof the cleanup path runs even on error:\nlog = []\n@contextmanager\ndef traced():\n    log.append(\"open\")\n    try: yield\n    finally: log.append(\"close\")\ntry:\n    with traced(): raise ValueError\nexcept ValueError: pass\nassert log == [\"open\", \"close\"]",
      noteLabel: "Model answer:",
      note: "\"Anything with acquire/release semantics goes in a `with` block, so cleanup is guaranteed on the error path, not just the happy path. That means files, connections, and especially a load transaction that must commit on success and roll back on failure.<br><br>I write custom ones with @contextmanager: pre-yield is setup, and the finally after yield is the cleanup that always runs.<br><br>It's how a partially-failed batch doesn't leave a half-applied transaction.\"",
      followups: [
        "\"A pipeline step raises mid-insert. How do you guarantee the transaction rolls back and the connection closes?\"",
        "\"What runs before vs after the `yield` in a @contextmanager, and when does the after-part run?\""
      ]
    },
    {
      title: "Decorators — retry, timing, and caching without touching business logic",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A decorator wraps a function to add behavior around it — the DE staples are retry (flaky API/DB call), timing/logging (observability), and caching. You rarely hand-roll caching: functools.lru_cache memoizes a pure function in one line. A retry decorator with backoff is the one you'll actually write in an interview — the signal is that you make the retry idempotent-aware and cap the attempts, not retry forever.",
      code: "import functools\n\ndef retry(times=3):\n    def deco(fn):\n        @functools.wraps(fn)               # preserve name/docstring\n        def wrapper(*a, **k):\n            last = None\n            for attempt in range(times):\n                try:\n                    return fn(*a, **k)\n                except Exception as e:\n                    last = e               # backoff: sleep 2**attempt in real code\n            raise last                      # exhausted -> surface the real error\n        return wrapper\n    return deco\n\ncalls = []\n@retry(times=3)\ndef flaky():\n    calls.append(1)\n    if len(calls) < 2: raise ConnectionError\n    return \"ok\"\nassert flaky() == \"ok\" and len(calls) == 2   # failed once, succeeded on retry\n\n@functools.lru_cache(maxsize=1000)           # memoize a pure lookup in one line\ndef fx_rate(day, ccy): ...",
      noteLabel: "Model answer:",
      note: "\"Cross-cutting concerns, like retry, timing, and caching, go in a decorator so the business logic stays clean.<br><br>For caching a pure function I use functools.lru_cache, rather than a custom cache. For retry I write a small decorator with capped attempts and exponential backoff. And I only auto-retry operations that are idempotent, because retrying a non-idempotent write can double-apply.<br><br>I use functools.wraps, so the wrapped function keeps its name for logging and traceback.\"",
      followups: [
        "\"Which operations are safe to auto-retry, and which will corrupt data if you do?\"",
        "\"Why wrap with functools.wraps — what breaks without it?\"",
        "\"When is lru_cache the wrong choice? (hint: unbounded keys, mutable args, freshness)\""
      ]
    },
    {
      title: "Type hints & dataclasses — data contracts you can test",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Type hints don't run at runtime, but they turn a dict-of-unknown-shape into a documented, IDE-checkable, mypy-verifiable contract — which matters when a record passes through five pipeline stages. A @dataclass gives you a typed record with __init__, __eq__, and __repr__ for free, so tests can assert equality on whole records instead of field-by-field. For real validation (not just hints), pydantic enforces the types at parse time — the honest distinction to draw is hints = static/dev-time, pydantic = runtime enforcement.",
      code: "from dataclasses import dataclass\n\n@dataclass(frozen=True)          # frozen -> hashable, usable as a dict key / set member\nclass Claim:\n    claim_id: str\n    amount: float\n    provider_id: str\n\ndef normalize(raw: dict) -> Claim:\n    return Claim(raw[\"id\"], float(raw[\"amt\"]), raw[\"prov\"])\n\n# whole-record equality in tests, free from @dataclass:\nassert normalize({\"id\": \"C-1\", \"amt\": \"12.5\", \"prov\": \"P-9\"}) == \\\n       Claim(\"C-1\", 12.5, \"P-9\")",
      noteLabel: "Model answer:",
      note: "\"I type the boundaries: function signatures, and the record shapes that cross pipeline stages. That way mypy and the IDE catch mismatches before runtime, and the contract is self-documenting.<br><br>For records I use @dataclass: typed fields, plus a free __eq__ so tests assert on whole objects, and frozen=True when I need it hashable.<br><br>But I'm clear that hints aren't enforcement. If I need to reject bad data at ingest, I reach for pydantic, which validates at parse time.\"",
      followups: [
        "\"Do type hints do anything at runtime? What actually enforces them?\"",
        "\"dataclass vs a plain dict for a record passing through several stages — trade-offs?\"",
        "\"When would you reach for pydantic over a dataclass?\""
      ]
    },
    {
      title: "pytest fundamentals — assert, fixtures, parametrize",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "pytest needs no boilerplate: a function named test_* with a plain `assert` is a test, and pytest rewrites the assert to show you the actual values on failure. The two features that carry real suites: fixtures (reusable setup — a sample DataFrame, a temp DB, a spark session — injected by naming them as arguments) and @parametrize (run the same test over many input/expected pairs instead of copy-pasting). tmp_path is a built-in fixture for a real temp directory, so you test file I/O without touching the repo.",
      code: "import pytest\n\ndef net_amount(gross, refund):\n    return round(gross - refund, 2)\n\n@pytest.fixture\ndef sample_txns():\n    return [(\"A\", 10.0, 1.0), (\"B\", 5.0, 0.0)]\n\n@pytest.mark.parametrize(\"gross,refund,expected\", [\n    (10.0, 1.0, 9.0),\n    (5.0,  0.0, 5.0),\n    (0.0,  0.0, 0.0),          # edge: zero\n    (10.0, 10.0, 0.0),         # edge: full refund\n])\ndef test_net_amount(gross, refund, expected):\n    assert net_amount(gross, refund) == expected\n\ndef test_uses_fixture(sample_txns):\n    assert sum(g - r for _, g, r in sample_txns) == 14.0",
      noteLabel: "Model answer:",
      note: "\"A test is a test_* function with a bare assert. pytest shows the real values on failure, so I don't need assertEqual.<br><br>I push shared setup into fixtures, like sample data, a temp dir via tmp_path, or a spark session, and inject them by parameter name. And I use @parametrize to cover the edge cases, like zero, nulls, and boundaries, as data instead of copy-pasted tests.<br><br>That keeps the suite readable, and makes the edge coverage obvious to a reviewer.\"",
      followups: [
        "\"How do you test a function that reads/writes files without polluting the repo?\"",
        "\"You have one test copy-pasted five times with different inputs. What do you use?\"",
        "\"What's the difference between a fixture and just calling a setup function?\""
      ]
    },
    {
      title: "Unit-testing a data transformation (and comparing DataFrames)",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "The most testable pipeline is one where the transform is a pure function: (input DataFrame/rows) -> (output), no I/O inside. Then a unit test builds a tiny input with the tricky cases baked in (a null, a duplicate key, a tie), runs the transform, and asserts on the output. The catch with Spark/pandas is equality: you can't use ==. Compare with a helper that ignores row order and checks schema + values (chispa's assert_df_equality for Spark, pandas.testing.assert_frame_equal for pandas). Separate the transform from the read/write and 90% of your logic becomes trivially testable.",
      code: "# transform is PURE: takes rows, returns rows — no file/db access inside\ndef dedup_latest(rows):\n    latest = {}\n    for r in sorted(rows, key=lambda r: r[\"updated_at\"]):\n        latest[r[\"id\"]] = r        # later row wins per id\n    return sorted(latest.values(), key=lambda r: r[\"id\"])\n\ndef test_dedup_keeps_latest_per_key():\n    rows = [\n        {\"id\": \"A\", \"updated_at\": 1, \"v\": \"old\"},\n        {\"id\": \"A\", \"updated_at\": 2, \"v\": \"new\"},   # should win\n        {\"id\": \"B\", \"updated_at\": 1, \"v\": \"only\"},\n    ]\n    out = dedup_latest(rows)\n    assert [(r[\"id\"], r[\"v\"]) for r in out] == [(\"A\", \"new\"), (\"B\", \"only\")]\n\n# Spark:  from chispa import assert_df_equality; assert_df_equality(actual, expected, ignore_row_order=True)\n# pandas: from pandas.testing import assert_frame_equal; assert_frame_equal(actual, expected)",
      noteLabel: "Model answer:",
      note: "\"I structure transforms as pure functions: data in, data out, no I/O. So the read and write are the only parts that touch the outside world.<br><br>Then a unit test feeds a handful of rows with the nasty cases baked in, like a null, a duplicate key, or a tie, and asserts on the output.<br><br>For DataFrames I never use ==. I use chispa's assert_df_equality for Spark, ignoring row order, or pandas.testing.assert_frame_equal. They compare schema and values, and give a readable diff.<br><br>Keeping I/O at the edges is what makes the core logic testable at all.\"",
      followups: [
        "\"Why can't you assert `df1 == df2` for a Spark/pandas DataFrame?\"",
        "\"What input rows would you put in the test for a dedup-latest transform?\"",
        "\"Your transform reads from S3 inside the function. Why is that hard to test, and how do you fix it?\""
      ]
    },
    {
      title: "Mocking external systems & integration tests",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Unit tests shouldn't hit S3, an API, or a warehouse — they'd be slow, flaky, and non-deterministic. You mock the boundary: patch the client so it returns canned data (or asserts it was called correctly), and test YOUR logic in isolation. unittest.mock.patch (or pytest's monkeypatch) swaps the real object for a fake. The complement is a small number of integration tests that DO run against a real (often containerized, e.g. testcontainers/localstack) dependency to catch what mocks can't — schema drift, real SQL dialect, auth. The senior framing: mock to test logic, integration-test to test the seams.",
      code: "from unittest.mock import patch, MagicMock\n\ndef load_provider(client, pid):\n    resp = client.get(f\"/providers/{pid}\")     # external call\n    return {\"id\": pid, \"name\": resp[\"name\"].strip().upper()}\n\ndef test_load_provider_normalizes_name():\n    client = MagicMock()\n    client.get.return_value = {\"name\": \"  mercy cardiology \"}\n    out = load_provider(client, \"P-42\")\n    assert out == {\"id\": \"P-42\", \"name\": \"MERCY CARDIOLOGY\"}\n    client.get.assert_called_once_with(\"/providers/P-42\")   # verify the call too\n\n# patch a module-level dependency:\n# with patch(\"mypkg.jobs.boto3.client\") as m:\n#     m.return_value.get_object.return_value = {\"Body\": fake_bytes}\n#     run_job()",
      noteLabel: "Model answer:",
      note: "\"I mock at the boundary, the S3, API, or warehouse client, so unit tests are fast and deterministic and only exercise my logic.<br><br>I both stub the return value AND assert the call was made correctly, with the right path and right args, because a transform that silently stops calling the API is a real bug.<br><br>Then I keep a thin layer of integration tests against a real or containerized dependency, like localstack or testcontainers, to catch what mocks hide: schema drift, the actual SQL dialect, and auth.<br><br>Mocks test my code. Integration tests test the seams.\"",
      followups: [
        "\"What class of bug does a mock-only suite completely miss?\"",
        "\"How do you decide what to mock vs what to hit for real?\"",
        "\"patch the wrong import path and the mock doesn't take effect — why does 'where you patch' matter?\""
      ]
    },
    {
      title: "A testing strategy for data pipelines — unit vs integration vs data checks",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Code tests aren't enough for data — a pipeline can be bug-free and still load garbage because the SOURCE changed. Three layers: (1) unit tests on pure transforms (fast, most of them); (2) integration tests on the wiring — read, transform, write against a real/containerized store (few, slower); (3) DATA-quality tests that run in production on every load — not-null, uniqueness, row-count/volume, referential integrity, freshness — via dbt tests or Great Expectations. The distinction interviewers want: code tests catch YOUR bugs at deploy time; data tests catch the WORLD's changes at run time, and they gate the load so bad data never reaches downstream.",
      code: "# LAYER 1 (unit): tiny input, pure transform, assert output — shown in earlier cards.\n\n# LAYER 3 (data quality) — assertions that run on real data every load.\ndef check_load(df):\n    assert df.filter(\"claim_id IS NULL\").count() == 0,        \"null primary key\"\n    assert df.count() == df.select(\"claim_id\").distinct().count(), \"duplicate claim_id\"\n    n = df.count()\n    assert 900 <= n <= 1100, f\"row-count anomaly: {n} (expected ~1000)\"  # volume drift\n    # in dbt: tests: [not_null, unique] on claim_id; a dbt test for accepted range.\n    return df   # only returns (proceeds) if every gate passes\n\n# The gate pattern: fail the pipeline BEFORE the write, so bad data never lands.",
      noteLabel: "Model answer:",
      note: "\"I test in three layers. Most tests are unit tests on pure transforms: fast, run in CI on every commit. A few integration tests exercise the read, transform, and write wiring against a containerized store.<br><br>Then, distinct from code tests, I run data-quality checks in production on every load: not-null and unique on keys, referential integrity, and a row-count and volume band to catch a source that silently halved or doubled. I use dbt tests or Great Expectations, and I fail the pipeline BEFORE the write, so bad data never reaches downstream.<br><br>Code tests catch my bugs at deploy. Data tests catch upstream changes at runtime.<br><br>That's exactly the validation-and-reconciliation framing that cut claim denials at Cedar Gate.\"",
      followups: [
        "\"A pipeline passes all its unit tests but still loads bad data. How is that possible, and what layer catches it?\"",
        "\"Which data-quality checks would you gate a claims load on, and would you fail the run or quarantine the rows?\"",
        "\"Where do dbt tests / Great Expectations fit relative to your pytest suite?\"",
        "\"How do you detect that an upstream source silently changed (schema or volume)?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — coding-round Q&A and tradeoffs",
    desc: "Spoken questions from real DE loops. Form your own answer first, then expand for a model answer that shows senior judgment — the tradeoff, the failure mode, and where the boundary is. These are the 'talk through it' questions that bracket the live coding."
  },
  cards: [
    {
      title: "\"When would you use SQL vs PySpark for a transformation?\"",
      badge: "fundamentals",
      navLabel: "How to approach it:",
      nav: "Don't pick a side tribally. Frame it as: where does the data live, how big is it, who maintains it, and what does the transform need? The mature answer is 'they're the same relational operations; I choose by data location and engine, not preference.'",
      noteLabel: "Model answer:",
      note: "\"They express the same relational logic, so I choose by context.<br><br>If the data's already in the warehouse, like Snowflake, and the transform is set-based, I do it in SQL, often via dbt. It's declarative, testable, versioned, the warehouse optimizes it, and there's no cluster to run.<br><br>I reach for PySpark when data lives in the lake, like S3 or Parquet, when I need procedural logic or ML feature code that's awkward in SQL, when I'm processing before it ever lands in a warehouse, or when volume and cost favor Spark's distributed compute over warehouse credits.<br><br>At Amex I'd land and heavily transform in PySpark on the lake, then do the final set-based marts in Snowflake SQL. The anti-pattern is dogma either way.\"",
      followups: [
        "\"Your team already runs Snowflake + dbt. When is dropping to PySpark still the right call?\"",
        "\"Cost: 10TB daily join — warehouse SQL or Spark on the lake? What drives the decision?\""
      ]
    },
    {
      title: "\"This query is slow. Optimize it.\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Never guess. State a diagnostic order: read the plan, find the biggest cost, cut it. Then list the levers from cheapest to most invasive. Interviewers want a method, not a grab-bag of tips.",
      noteLabel: "Model answer:",
      note: "\"First I EXPLAIN it and find the dominant node, usually a full scan or a big shuffle. Then, cheapest first.<br><br>(1) Read less: add a partition-pruning predicate and project only needed columns instead of SELECT *. Make sure I'm not wrapping the partition column in a function, which defeats pruning.<br><br>(2) Filter before joining, not after.<br><br>(3) Fix the join: broadcast a small dimension to kill a shuffle, or check for a fan-out from a non-unique key that's inflating the row count.<br><br>(4) Check for skew, one straggler doing all the work.<br><br>(5) Only then consider indexes for OLTP, or clustering and sort keys for the warehouse.<br><br>I verify each change against the plan and the runtime, not by faith.\"",
      followups: [
        "\"The query already filters on the date column but still scans everything. What's the most likely cause?\"",
        "\"How do you tell the difference between a slow query and a slow CLUSTER?\"",
        "\"When would adding an index make a query SLOWER?\""
      ]
    },
    {
      title: "\"Why is this Spark job slow?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Show you'd open the Spark UI and reason from evidence. The four usual suspects: skew, too many small files / bad partitioning, unnecessary shuffles, and driver-side bottlenecks (collect/UDF). Name them and how you'd confirm each.",
      noteLabel: "Model answer:",
      note: "\"I open the Spark UI and look at the stages.<br><br>(1) Skew: one or two tasks take 10x the others. That's a hot key; fix with AQE, broadcast, or salting.<br><br>(2) Small files: thousands of tiny input files means huge task overhead. Compact them or repartition.<br><br>(3) Excessive shuffles: every wide transform, like join, groupBy, or distinct, shuffles. I check whether I can broadcast, reduce the number of shuffles, or avoid re-shuffling already-partitioned data.<br><br>(4) Driver bottleneck: a collect() pulling everything to the driver, or a Python UDF serializing row-by-row. Rewrite with native functions.<br><br>(5) Spill: tasks spilling to disk means partitions too big, or not enough memory.<br><br>I confirm with the UI's task-time distribution and shuffle and spill metrics, rather than guessing.\"",
      followups: [
        "\"Every task is fast except two that run for 20 minutes. Diagnosis?\"",
        "\"The job spends 80% of its time in one shuffle stage. What are your options?\"",
        "\"How does Adaptive Query Execution change your answer to some of these?\""
      ]
    },
    {
      title: "\"What's the time complexity of your solution?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Translate SQL/Spark operations into cost, not just Big-O of a Python loop. A join is roughly the cost of the shuffle + the larger side; a sort is O(n log n); a hash aggregate is ~O(n). For distributed work, the real cost is data movement (shuffle), not CPU.",
      noteLabel: "Model answer:",
      note: "\"For pure Python I'll give the Big-O and the data-structure choice driving it. For example, a set lookup makes dedup O(n) instead of O(n^2).<br><br>For SQL and Spark I reason about the physical plan: a hash aggregate is about O(n), a sort is O(n log n), and a self-join is O(n^2) within a partition. The dominant real cost is usually the shuffle, how much data crosses the network, not CPU.<br><br>So 'complexity' for a distributed job means how much data moves, and how evenly. That's why skew and broadcast matter more than the theoretical bound.\"",
      followups: [
        "\"Your query has a self-join. What's the complexity and when does it blow up?\"",
        "\"Two solutions are both O(n) in theory but one is 10x faster in Spark. Why?\""
      ]
    },
    {
      title: "\"When should you NOT use SQL?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Show you know SQL's edges. It's superb for set-based relational transforms and terrible for a few specific things — name them concretely rather than saying 'SQL is limited'.",
      noteLabel: "Model answer:",
      note: "\"SQL is the wrong tool for a few things. Iterative or procedural logic and complex control flow, though recursive CTEs cover hierarchies. Heavy string or JSON parsing of messy semi-structured data, where Spark or Python is cleaner. Anything needing external calls, ML training, or stateful streaming logic. And truly dynamic schemas, with unknown columns, where you'd be generating SQL.<br><br>I also avoid pushing enormous row-by-row transformations through SQL when the logic is more naturally expressed and tested in code.<br><br>The heuristic: if it's set-based and the data's in a warehouse, SQL wins. If it's procedural, iterative, or the data isn't relational yet, drop to Python or Spark.\"",
      followups: [
        "\"Parsing deeply nested FHIR/HL7 payloads — SQL or Spark? Why?\"",
        "\"Give an example where forcing logic into SQL created a maintenance nightmare.\""
      ]
    },
    {
      title: "\"How do you dedup a table keeping the latest record?\"",
      badge: "fundamentals",
      navLabel: "How to approach it:",
      nav: "State the pattern, then immediately surface the tie-break edge case — that's the senior differentiator over just reciting ROW_NUMBER.",
      noteLabel: "Model answer:",
      note: "\"ROW_NUMBER over PARTITION BY the business key, ORDER BY the version or updated timestamp descending, keep rn = 1. In Snowflake I collapse it with QUALIFY.<br><br>The part people miss: if two rows share the key AND the timestamp, I add a deterministic tiebreaker, like source file sequence or ingestion order, so the result is stable across reruns. Otherwise the pipeline is non-deterministic, and dbt and incremental logic can flip-flop.<br><br>I'd also confirm whether soft-deleted records should be excluded, and whether 'latest' means latest event time or latest ingestion time. They differ with late-arriving data.\"",
      followups: [
        "\"Latest by event time or by load time? When does the distinction bite?\"",
        "\"Make it incremental — you only get new/changed rows each run. How do you merge?\""
      ]
    },
    {
      title: "\"Explain window functions to someone who only knows GROUP BY.\"",
      badge: "fundamentals",
      navLabel: "How to approach it:",
      nav: "A teaching question — they're testing depth of understanding and communication. Use the 'keeps the rows vs collapses them' contrast and one concrete example.",
      noteLabel: "Model answer:",
      note: "\"GROUP BY collapses each group into one summary row, and you lose the detail. A window function keeps every original row and attaches a computed value, calculated over a related set of rows: the 'window', defined by PARTITION BY, the group, and ORDER BY, the sequence.<br><br>So 'total spend per account' is GROUP BY, one row per account. But 'each transaction, plus that account's running total' needs a window: I keep all transactions and add the cumulative sum.<br><br>Anytime the requirement is per row, relative to its neighbors, like rank, previous value, or running total, it's a window. Anytime it's one summary per group, it's GROUP BY.\"",
      followups: [
        "\"Give a query GROUP BY simply cannot do but a window function can.\"",
        "\"Which is cheaper when either would work, and why?\""
      ]
    },
    {
      title: "\"Batch or streaming for this pipeline?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Anchor on the business latency requirement, then the operational cost. Don't reach for streaming reflexively — it's more complex to run and most 'real-time' asks tolerate minutes.",
      noteLabel: "Model answer:",
      note: "\"I start from the actual latency SLA and the cost of being late.<br><br>If the business genuinely needs sub-minute reaction, like fraud scoring on a live transaction or real-time risk limits, that's streaming: Kafka plus Spark Structured Streaming or Flink.<br><br>If 'real-time' really means within an hour, which covers most reporting and reconciliation, a frequent micro-batch is far simpler to build, test, backfill, and operate, and it's cheaper.<br><br>Streaming adds state management, watermarking for late data, exactly-once concerns, and 24/7 ops. My default is the largest batch interval that still meets the SLA, and I only pay the streaming complexity tax where the latency requirement truly demands it.<br><br>At Amex, fraud is streaming; most customer and risk marts are batch.\"",
      followups: [
        "\"'We need real-time dashboards.' How do you pin down whether that's actually streaming?\"",
        "\"What operational costs does streaming add that batch doesn't?\""
      ]
    },
    {
      title: "\"How do you test and validate a data transformation?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "Move beyond 'I eyeball the output'. Name concrete checks: row-count reconciliation, uniqueness/not-null on keys, referential integrity, and known-value spot checks — ideally automated (dbt tests / Great Expectations).",
      noteLabel: "Model answer:",
      note: "\"Layered checks. Before shipping, I reconcile row counts and control totals against the source: does SUM(amount) tie out? I assert the grain, that the primary key is unique and not null, so GROUP BY key HAVING COUNT(*) > 1 must return nothing. I check referential integrity, no orphaned foreign keys. And I spot-check a few known records end to end.<br><br>Then I make these tests automated and continuous, with dbt tests, like unique, not_null, relationships, and accepted_values, or Great Expectations in the pipeline. So a bad upstream change fails the run instead of silently corrupting a mart.<br><br>For the transform logic itself, I'll unit-test the tricky bits, like the dedup tiebreaker and the sessionization boundary, on small fixtures.<br><br>The mindset: assume the data will break, and make the pipeline tell me, rather than a stakeholder finding it.\"",
      followups: [
        "\"A downstream user says a number 'looks wrong'. Walk me through isolating it.\"",
        "\"How do you catch a schema change in an upstream source before it breaks prod?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "You need the single most recent row per member_id from a CDC feed, and two rows can share the same member_id AND updated_at. What's the most robust approach?",
    options: [
      "GROUP BY member_id with MAX(updated_at), then join back on both columns",
      "ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY updated_at DESC, <tiebreaker>) then keep rn = 1",
      "SELECT DISTINCT on member_id",
      "RANK() OVER (PARTITION BY member_id ORDER BY updated_at DESC) then keep rank = 1"
    ],
    correct: 1
  },
  {
    q: "Why does SELECT * FROM claims WHERE claim_id NOT IN (SELECT bad_id FROM excluded) sometimes return zero rows unexpectedly?",
    options: [
      "NOT IN doesn't work on subqueries",
      "If excluded contains any NULL bad_id, every comparison becomes UNKNOWN and no row qualifies",
      "The subquery is too slow and times out to empty",
      "claim_id must be indexed for NOT IN to work"
    ],
    correct: 1
  },
  {
    q: "A running total using SUM(amount) OVER (PARTITION BY acct ORDER BY txn_date) shows identical values for rows on the same date. Why?",
    options: [
      "The ORDER BY is being ignored",
      "The default frame with ORDER BY is RANGE, which lumps all rows with the same date into one frame; use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      "SUM cannot be used as a window function",
      "PARTITION BY should be GROUP BY"
    ],
    correct: 1
  },
  {
    q: "In PySpark, which is the single biggest speedup for joining a large transactions table to a small merchant dimension?",
    options: [
      "Increase spark.sql.shuffle.partitions to 2000",
      "Broadcast the small dimension so the large side never shuffles",
      "Cache both DataFrames before the join",
      "Convert both to RDDs and use join()"
    ],
    correct: 1
  },
  {
    q: "Your Spark job has two tasks running 10x longer than all the others. Most likely cause?",
    options: [
      "The cluster is under-provisioned on CPU",
      "Data skew — a couple of hot keys concentrate most rows on a few tasks",
      "Parquet compression is too aggressive",
      "The driver has too little memory"
    ],
    correct: 1
  },
  {
    q: "Are non-recursive CTEs generally faster than the equivalent subquery?",
    options: [
      "Yes, CTEs are always materialized and cached",
      "No — most modern engines inline them, so the plan is the same; CTEs are for readability, and you materialize to a temp table only when a costly result is reused",
      "Yes, because CTEs use an index automatically",
      "No, subqueries cannot express the same logic"
    ],
    correct: 1
  },
  {
    q: "Why is a row-at-a-time Python UDF in PySpark slow compared to native functions?",
    options: [
      "Python is a slow language for arithmetic",
      "Each row is serialized between the JVM and a Python process and the UDF is opaque to Catalyst, blocking optimization and pushdown",
      "UDFs always trigger a full shuffle",
      "UDFs run only on the driver"
    ],
    correct: 1
  },
  {
    q: "A supposedly-unique key join suddenly returns 3x the expected rows. What's your first diagnostic query?",
    options: [
      "SELECT COUNT(*) FROM the joined result",
      "GROUP BY the join key HAVING COUNT(*) > 1 on each side to find duplicate keys causing fan-out",
      "Add DISTINCT to the final SELECT and move on",
      "Rewrite the INNER JOIN as a LEFT JOIN"
    ],
    correct: 1
  },
  {
    q: "You need to sum amounts from a 50GB file in pure Python without blowing up memory. Which approach?",
    options: [
      "Read all lines into a list, then sum a list comprehension over them",
      "A generator that yields one parsed amount per line, passed to sum() — constant memory, one pass",
      "Load it into a pandas DataFrame and call .sum()",
      "Read the file twice: once to count, once to sum"
    ],
    correct: 1
  },
  {
    q: "A data pipeline passes 100% of its pytest unit tests but still loads corrupt data into the warehouse. What most likely caught nothing, and what would?",
    options: [
      "The code was fine; unit tests can't catch upstream source changes — data-quality checks (not-null/unique/volume) gated on the load do",
      "The unit tests were written wrong; rewrite them",
      "Add more mocks to the unit tests",
      "Nothing can catch this; it's unavoidable"
    ],
    correct: 0
  }
];
