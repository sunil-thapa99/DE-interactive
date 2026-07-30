# DE Interactive — Data Engineering Learning Dashboard

A hands-on, interview-focused learning platform for Data Engineering. The home page lists available technologies; each one opens its own interactive dashboard with step-by-step build guides, in-depth concept explanations, architecture/trade-off deep-dives, and an interview prep section.

**Live demo:** https://sunil-thapa99.github.io/DE-interactive/

## Technologies

- **Snowflake + AWS** (`technologies/snowflake/`) — Snowpipe ingestion from S3, three ETL orchestration patterns (Tasks+Streams, Dynamic Tables, dbt+Airflow), architecture & performance, governance & advanced concepts, data modeling & loading, and interview Q&A.
- More technologies (Kafka, Databricks+Spark, Airflow) are planned — see the home page for the roadmap.

## Project structure

```
.
├── index.html                          # home page — technology picker (GitHub Pages serves this)
├── assets/
│   ├── css/
│   │   ├── home.css                    # home page styling
│   │   └── styles.css                  # shared dashboard styling used by each technology module
│   └── js/
│       ├── content.js                  # Snowflake module content data (steps, code, quiz)
│       └── script.js                   # Snowflake module rendering, tabs, progress tracking, quiz logic
├── technologies/
│   └── snowflake/
│       └── index.html                  # Snowflake + AWS interactive dashboard
├── docs/
│   ├── 00-ingestion-setup.md           # S3 → Snowpipe ingestion setup (shared by all variants)
│   ├── 01-tasks-streams.md             # ETL via Streams + Tasks
│   ├── 02-dynamic-tables.md            # ETL via Dynamic Tables
│   └── 03-external-orchestrator.md     # ETL via dbt + Airflow
├── .gitattributes
├── .gitignore
└── README.md
```

Adding a new technology: create `technologies/<name>/index.html` (copy the Snowflake module's structure/tab pattern), its own `content.js`/`script.js` under `assets/js/` (or namespaced within the technology folder if content grows large), then add a card to `index.html`'s technology grid.

## Run locally

No build step needed — just open `index.html` in a browser, or serve it locally:

```bash
python -m http.server 8000
# then open http://localhost:8000
```
