# Snowflake × AWS Ingestion Pipeline — Learning Dashboard

An interactive, static web dashboard for learning how to build a Snowflake ingestion + ETL pipeline sourced from AWS S3. Covers three ETL orchestration patterns (Snowflake Tasks + Streams, Dynamic Tables, and an external dbt/Airflow orchestrator) built on a shared Snowpipe ingestion foundation.

**Live demo:** enable GitHub Pages (see below) and it'll be at `https://<your-username>.github.io/<repo-name>/`

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

The dashboard includes: an architecture overview, step-by-step cards with copyable SQL and click-through navigation for Snowsight/AWS Console, a comparison table across the three ETL approaches, an **Architecture & Performance** tab and a **Governance & Advanced** tab (broader Snowflake concepts a 4-5 YOE Data Engineer is expected to know — clustering, caching, Time Travel/Fail-safe, RBAC, masking policies, secure data sharing, Snowpark, CI/CD, DR, and more), an **Interview Prep** tab (common DE/Snowflake interview questions with model answers, framed around this project), progress tracking (saved in your browser via `localStorage`), and a short quiz.

## Run locally

No build step needed — just open `index.html` in a browser, or serve it locally:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Publish with GitHub Pages

1. Push this project to a new GitHub repository (see commands below).
2. On GitHub, go to your repo → **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
4. Under **Branch**, select `main` and folder `/ (root)` → **Save**.
5. GitHub will publish at `https://<your-username>.github.io/<repo-name>/` within a minute or two — refresh the Pages settings page to get the link.

### Push this project to GitHub

```bash
cd "path/to/this/project"
git init
git add .
git commit -m "Initial commit: Snowflake ingestion pipeline docs + interactive dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

(Create the empty repository on GitHub first at github.com/new — don't initialize it with a README, or the push will need a merge.)
