# Snowflake × AWS Ingestion Pipeline — Learning Dashboard

An interactive, static web dashboard for learning how to build a Snowflake ingestion + ETL pipeline sourced from AWS S3. Covers three ETL orchestration patterns (Snowflake Tasks + Streams, Dynamic Tables, and an external dbt/Airflow orchestrator) built on a shared Snowpipe ingestion foundation.

**Live demo:** https://sunil-thapa99.github.io/snowflake-interactive/

## Project structure

```
.
├── index.html                     # dashboard entry point (GitHub Pages serves this)
├── assets/
│   ├── css/
│   │   └── styles.css             # dashboard styling (light/dark aware)
│   └── js/
│       ├── content.js             # dashboard content data (steps, code, quiz)
│       └── script.js              # rendering, tabs, progress tracking, quiz logic
├── docs/
│   ├── 00-ingestion-setup.md      # S3 → Snowpipe ingestion setup (shared by all variants)
│   ├── 01-tasks-streams.md        # ETL via Streams + Tasks
│   ├── 02-dynamic-tables.md       # ETL via Dynamic Tables
│   └── 03-external-orchestrator.md# ETL via dbt + Airflow
├── .gitattributes
├── .gitignore
└── README.md
```

The dashboard includes: an architecture overview, step-by-step cards with copyable SQL and click-through navigation for Snowsight/AWS Console (each ETL step also has an in-depth **Concept** explanation of the underlying mechanism, not just the how-to), a comparison table across the three ETL approaches, an **Architecture & Performance** tab and a **Governance & Advanced** tab (clustering, caching, Time Travel/Fail-safe, RBAC, masking policies, secure data sharing, Snowpark, CI/CD, DR), a **Data Modeling & Loading** tab (star/snowflake schema, SCD Type 1/2/3, COPY INTO file-sizing tuning, unloading, stream staleness, serverless tasks, schema inference, external/Iceberg tables, and two live troubleshooting scenarios), an **Interview Prep** tab (common DE/Snowflake interview questions with model answers, framed around this project), progress tracking (saved in your browser via `localStorage`), and a short quiz.

## Run locally

No build step needed — just open `index.html` in a browser, or serve it locally:

```bash
python -m http.server 8000
# then open http://localhost:8000
```
