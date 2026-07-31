# DE Interactive — Data Engineering Learning Dashboard

A hands-on, interview-focused learning platform for Data Engineering. The home page lists available technologies; each one opens its own interactive dashboard with step-by-step build guides, in-depth concept explanations, architecture/trade-off deep-dives, and an interview prep section.

**Live demo:** https://sunil-thapa99.github.io/DE-interactive/

## Technologies

- **Snowflake + AWS** (`technologies/snowflake/`) — Snowpipe ingestion from S3, three ETL orchestration patterns (Tasks+Streams, Dynamic Tables, dbt+Airflow), architecture & performance, governance & advanced concepts, data modeling & loading, and interview Q&A.
- **Apache Spark + PySpark + Databricks** (`technologies/spark/`) — a hands-on Databricks Community Edition pipeline, Python/PySpark fundamentals through the DataFrame API, architecture & performance tuning (shuffles, caching, AQE, skew), Structured Streaming, Delta Lake, Spark-vs-Snowflake trade-offs, and interview Q&A.
- More technologies (Kafka, Airflow) are planned — see the home page for the roadmap.

## Project structure

```
.
├── index.html                          # home page — technology picker (GitHub Pages serves this)
├── assets/
│   ├── css/
│   │   ├── home.css                    # home page styling
│   │   └── styles.css                  # shared dashboard styling used by every technology module
│   └── js/
│       ├── script.js                   # shared rendering engine: tabs, cards, progress tracking, quiz logic
│       ├── content.js                  # Snowflake module content data (steps, code, quiz)
│       └── spark-content.js            # Spark module content data (steps, code, quiz)
├── technologies/
│   ├── snowflake/
│   │   └── index.html                  # Snowflake + AWS interactive dashboard
│   └── spark/
│       └── index.html                  # Spark + PySpark + Databricks interactive dashboard
├── docs/
│   ├── 00-ingestion-setup.md           # S3 → Snowpipe ingestion setup (shared by all variants)
│   ├── 01-tasks-streams.md             # ETL via Streams + Tasks
│   ├── 02-dynamic-tables.md            # ETL via Dynamic Tables
│   └── 03-external-orchestrator.md     # ETL via dbt + Airflow
├── .gitattributes
├── .gitignore
└── README.md
```

`script.js` is shared and fully generic — it derives its tab sections directly from whichever `CONTENT` object is loaded on the page, so it needs no changes per technology. Each technology's own `<name>-content.js` sets `const MODULE_ID = "<name>"` (used to namespace that module's saved progress in `localStorage` so modules don't collide) and defines `CONTENT` (tab sections/cards) plus `QUIZ` (the quiz tab). A `compare`-named section is reserved for a special table-style renderer requiring `COMPARE_ROWS`/`COMPARE_META` — use any other section name (e.g. `comparison`) for a normal card-based comparison tab, as the Spark module does.

**Adding a new technology:**
1. Create `assets/js/<name>-content.js` with `MODULE_ID`, `CONTENT`, and `QUIZ`.
2. Create `technologies/<name>/index.html` (copy an existing module's `<nav class="tabs">` and script tags, pointing at the new content file and the shared `script.js`/`styles.css`).
3. Add a card to `index.html`'s technology grid on the home page.

## Run locally

No build step needed — just open `index.html` in a browser, or serve it locally:

```bash
python -m http.server 8000
# then open http://localhost:8000
```
