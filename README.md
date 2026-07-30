# Snowflake × AWS Ingestion Pipeline — Learning Dashboard

An interactive, static web dashboard for learning how to build a Snowflake ingestion + ETL pipeline sourced from AWS S3. Covers three ETL orchestration patterns (Snowflake Tasks + Streams, Dynamic Tables, and an external dbt/Airflow orchestrator) built on a shared Snowpipe ingestion foundation.

**Live demo:** enable GitHub Pages (see below) and it'll be at `https://<your-username>.github.io/<repo-name>/`

## What's included

- `index.html`, `styles.css`, `script.js`, `content.js` — the interactive dashboard (no build step, pure static files)
- `snowflake-pipeline-00-ingestion-setup.md` — S3 → Snowpipe ingestion setup (shared by all variants)
- `snowflake-pipeline-01-tasks-streams.md` — ETL via Streams + Tasks
- `snowflake-pipeline-02-dynamic-tables.md` — ETL via Dynamic Tables
- `snowflake-pipeline-03-external-orchestrator.md` — ETL via dbt + Airflow

The dashboard includes: an architecture overview, step-by-step cards with copyable SQL and click-through navigation for Snowsight/AWS Console, a comparison table across the three ETL approaches, progress tracking (saved in your browser via `localStorage`), and a short quiz.

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
