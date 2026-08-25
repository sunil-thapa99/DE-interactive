// Content data for the Docker, Kubernetes & CI/CD module.
// Senior-DE interview focus: containerizing data jobs, orchestrating batch workloads on
// Kubernetes, shipping pipelines like software through CI/CD, and provisioning platforms
// with infrastructure as code. Examples lean on Python/Spark data jobs, Airflow, and dbt
// to match real data-engineering work.
const MODULE_ID = "devops";
const CONTENT = {

overview: {
  intro: {
    title: "Docker, Kubernetes & CI/CD for Data Engineers — shipping pipelines like software",
    desc: "A data engineer who can only write SQL and Python stops where the code stops. The one who can package that code, run it reliably on a cluster, and deploy it through an automated pipeline owns the whole lifecycle. This module goes from why containers matter for reproducibility, through Docker images and Kubernetes batch workloads, to CI/CD promotion and infrastructure as code — framed the way a mid-to-senior interview actually probes it: the tradeoff, the failure mode, and the boundary."
  },
  cards: [
    {
      title: "Why a data engineer needs Docker, Kubernetes, and CI/CD at all",
      badge: "fundamentals",
      conceptLabel: "The core idea:",
      concept: "Data pipelines are software, and software that only runs on your laptop isn't finished. Docker packages your job and everything it depends on into one image that runs identically anywhere. Kubernetes runs many of those containers reliably across a cluster, restarting them when they die and scheduling batch jobs on demand. CI/CD automates the path from a git commit to running code, with tests as the gate. Together they turn 'it works on my machine' into 'it works the same in dev, staging, and prod, every time, deployed by a pipeline instead of by hand.'",
      noteLabel: "In practice:",
      note: "The pain these solve is painfully familiar. A pipeline that ran fine locally dies in production because the pandas version differed, or a colleague can't reproduce your environment, or a hand-deploy skipped a step and corrupted a table.<br><br>Docker fixes the environment drift, Kubernetes fixes the 'where does this run and who restarts it' problem, and CI/CD fixes the risky manual deploy.<br><br>In an interview, the signal is treating your pipeline as a deployable software artifact with a real release process, not as a script you scp to a box.",
      followups: [
        { q: "\"Do data engineers really need all three, or is that DevOps' job?\"", a: "You don't have to be the person who runs the cluster, but you own how your job is packaged, what resources it asks for, and how it gets deployed. Modern DE roles expect fluency here even when a platform team owns the infrastructure. The line has moved." },
        { q: "\"What's the single biggest win from adopting these?\"", a: "Reproducibility. The same image runs identically on your laptop, in CI, and in prod, so a pipeline that passes tests actually behaves the same when deployed. That one property removes a whole class of 'works on my machine' incidents." },
        { q: "\"Isn't this overkill for a small team with a few jobs?\"", a: "For a couple of cron jobs, maybe. Docker alone is still worth it for reproducibility. Kubernetes earns its keep once you have many jobs, scaling needs, or self-healing requirements. Match the tool to the scale, don't cargo-cult the whole stack." }
      ]
    },
    {
      title: "Reproducibility — the property that makes everything else work",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Reproducibility means the same code produces the same behavior regardless of where it runs. Without containers, your job depends on whatever Python, system libraries, and OS packages happen to be on the host, and those drift between machines and over time. A container pins all of it — interpreter, libraries, system dependencies, even the base OS layer — into an image identified by a digest. Pull that image anywhere and you get byte-for-byte the same environment. That's the foundation CI/CD relies on: if the image that passed tests is the exact image you deploy, the test result actually means something.",
      noteLabel: "In practice:",
      note: "The classic failure is environment drift. Your laptop has numpy 1.26, the prod box has 1.24, and a silent behavior change corrupts a calculation. Nothing errored, the numbers are just wrong.<br><br>Pinning dependencies in a requirements file helps, but the OS and system libraries still drift. A container captures the whole stack, so there's nothing left to drift.<br><br>The senior habit is deploying by image digest, not by rebuilding on the target. Build once, test that artifact, ship that exact artifact.",
      followups: [
        { q: "\"Isn't a pinned requirements.txt enough for reproducibility?\"", a: "It pins Python packages but not the OS, system libraries, or the interpreter build. A C extension can behave differently across Linux distros. The container captures the full stack, which is why it's more reproducible than pinned deps alone." },
        { q: "\"What does 'deploy by digest' mean and why does it matter?\"", a: "Every built image has a content hash (digest). Deploying by digest guarantees you run the exact bytes that passed tests, not a freshly rebuilt image that might pull newer layers. The 'latest' tag is mutable and a common source of surprise." },
        { q: "\"How does reproducibility help debugging a production issue?\"", a: "You can pull the exact image that ran and reproduce the failure locally, same environment and all. Without it you're guessing at version differences between prod and your laptop. Reproducibility turns 'can't reproduce' into a local repro." }
      ]
    },
    {
      title: "The deploy story for a data job, start to finish",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Picture the full path of a change to a Spark or Python pipeline. You write code and commit to git. CI kicks in: it runs unit tests, builds a Docker image, runs integration tests against that image, and pushes it to a registry. CD promotes it through environments — deploy to dev, run against sample data, promote to staging for a fuller test, then gate a production deploy behind approval. In prod, an orchestrator like Airflow or a Kubernetes CronJob pulls the image and runs the job on schedule. If something breaks, you roll back to the previous image. Every step is automated and every artifact is versioned.",
      noteLabel: "In practice:",
      note: "The contrast is with the hand-deploy: someone SSHes to a box, git-pulls, restarts a process, and hopes. That's how you get undocumented state, skipped steps, and 2am incidents nobody can explain.<br><br>The automated path makes every deploy identical and reversible. The image that runs in prod is the same one that passed tests, deployed by a pipeline that can't forget a step.<br><br>In an interview, being able to narrate this whole loop — commit to image to promotion to scheduled run to rollback — is the senior signal.",
      followups: [
        { q: "\"Where does the orchestrator (Airflow) fit versus CI/CD?\"", a: "CI/CD builds and deploys the code and images; the orchestrator schedules and runs the jobs at runtime. They're different phases. CI/CD ships the artifact, Airflow or a CronJob decides when and in what order the job actually runs." },
        { q: "\"What makes a deploy reversible?\"", a: "Versioned, immutable image artifacts. Rolling back is just pointing the deployment at the previous image digest. Because the old image still exists in the registry and nothing was mutated in place, rollback is fast and clean instead of a frantic re-deploy." },
        { q: "\"Why gate the production deploy behind approval?\"", a: "Because prod changes have real blast radius. An approval gate gives a human a checkpoint after automated tests pass but before customer-facing data is touched. Everything below prod stays fully automated, so the gate adds safety without slowing the whole loop." }
      ]
    }
  ]
},

docker: {
  intro: {
    title: "Docker — packaging a data job into a reliable, small, secure image",
    desc: "The container fundamentals a DE is expected to know cold: images versus containers, how layers and caching make builds fast, multi-stage builds for small artifacts, slim and distroless base images, running as non-root, .dockerignore, ENTRYPOINT versus CMD, volumes, and how to handle config and secrets — ending with a good Dockerfile for a Python data job."
  },
  cards: [
    {
      title: "Images vs containers — the class-and-instance distinction",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "An image is the immutable, read-only template — your code, dependencies, and base OS baked into a stack of layers, identified by a digest. A container is a running instance of that image: the image plus a thin writable layer on top and an isolated process. The relationship is like a class and its objects, or a program on disk versus a process in memory. You build an image once and run many containers from it, each isolated. Anything a container writes lives only in its writable layer and vanishes when the container is removed, unless you mount a volume.",
      noteLabel: "In practice:",
      note: "The distinction matters because it explains why containers are disposable. The image is the durable artifact you version and ship; the container is ephemeral and should be treated as throwaway.<br><br>This is why you never store important data inside a container's writable layer — remove the container and it's gone. State goes in volumes or external systems.<br><br>For a batch data job this fits perfectly: the container spins up, processes data, writes results to a warehouse or object store, and exits. Nothing valuable should depend on the container surviving.",
      followups: [
        { q: "\"What happens to data written inside a running container?\"", a: "It goes into the container's thin writable layer and disappears when the container is removed. That's fine for scratch space but never for anything you need to keep. Durable output goes to a volume, object store, or database." },
        { q: "\"Can two containers from the same image interfere with each other?\"", a: "No, each gets its own isolated process space and writable layer. They share the read-only image layers underneath for efficiency but can't see each other's runtime state. That isolation is the whole point of containers." },
        { q: "\"Why is an image described as immutable?\"", a: "Once built, its layers are fixed and identified by a content hash. You can't change an image, only build a new one. That immutability is what makes deploy-by-digest reliable — the bytes never change under you." }
      ]
    },
    {
      title: "Layers and build caching — why build order matters",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A Docker image is a stack of layers, and each instruction in a Dockerfile creates one. Docker caches each layer, so on a rebuild it reuses a layer if that instruction and everything before it are unchanged. The moment one layer changes, every layer after it is rebuilt. This is why order matters enormously: put things that change rarely (installing dependencies) early, and things that change often (copying your source code) late. Get it backwards and every one-line code change reinstalls all your dependencies from scratch.",
      code: "# Good ordering: deps cached, only code layer rebuilds on edits\nFROM python:3.12-slim\nWORKDIR /app\n\n# Changes rarely -> cached across most builds\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\n# Changes often -> only this layer rebuilds when you edit code\nCOPY . .\nCMD [\"python\", \"pipeline.py\"]",
      noteLabel: "In practice:",
      note: "The single most common Dockerfile mistake is copying all source before installing dependencies. Then every tiny code edit busts the cache and triggers a full dependency reinstall, turning a two-second rebuild into a two-minute one.<br><br>Copy the requirements file, install dependencies, then copy the rest of the code. Now editing pipeline.py reuses the cached dependency layer and only rebuilds the fast final layer.<br><br>Multiply that by every CI run and the time and cost savings are real. Cache-aware ordering is free performance.",
      followups: [
        { q: "\"Why does copying code before installing deps hurt so much?\"", a: "Because copying code invalidates the cache for every layer after it, including the expensive dependency install. So each code edit reinstalls everything. Copy requirements first, install, then copy code — the deps layer stays cached across edits." },
        { q: "\"What invalidates a layer's cache?\"", a: "A change to that instruction or to any layer before it, and for COPY, a change to the files being copied. Once invalidated, that layer and all subsequent layers rebuild. That cascade is why ordering from least-to-most-frequently-changed matters." },
        { q: "\"Why --no-cache-dir on pip install?\"", a: "pip's download cache adds weight to the image layer without any runtime benefit inside a container you build once. Disabling it keeps the layer smaller. It's a small, standard optimization for image size." }
      ]
    },
    {
      title: "Multi-stage builds and small, secure images",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A multi-stage build uses one stage to build and a separate, clean stage to run, copying only the finished artifacts into the final image. This keeps build tools, compilers, and dev dependencies out of what you ship. Combine it with a small base image — python:3.12-slim strips out unneeded OS packages, and distroless goes further, shipping just the runtime and your app with no shell or package manager. Smaller images pull faster, cost less to store, and have a smaller attack surface: fewer packages means fewer CVEs. The security win compounds with running as a non-root user, so a compromised container has limited privileges.",
      code: "# Stage 1: build wheels with full toolchain\nFROM python:3.12 AS builder\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt\n\n# Stage 2: slim runtime, non-root, only the wheels\nFROM python:3.12-slim\nRUN useradd -m appuser\nWORKDIR /app\nCOPY --from=builder /wheels /wheels\nRUN pip install --no-cache-dir /wheels/* && rm -rf /wheels\nCOPY . .\nUSER appuser\nCMD [\"python\", \"pipeline.py\"]",
      noteLabel: "In practice:",
      note: "The build stage can be fat — it has compilers and build tools to produce wheels or binaries. The runtime stage stays lean because it only receives the finished artifacts, not the toolchain.<br><br>Slim bases cut hundreds of megabytes and dozens of packages you'd otherwise have to patch. Distroless is the extreme: no shell means an attacker who lands in the container can't even run commands, though it also means you can't exec in to debug.<br><br>Running as non-root is non-negotiable for production. A container that runs as root and gets compromised is a much bigger problem than one confined to an unprivileged user.",
      followups: [
        { q: "\"What exactly does a multi-stage build keep out of the final image?\"", a: "The build toolchain: compilers, dev headers, build-only dependencies, and intermediate files. Only the finished artifacts get copied into the runtime stage. The result is a smaller image with far fewer packages to patch and fewer CVEs." },
        { q: "\"Distroless has no shell — isn't that a debugging nightmare?\"", a: "It's a real tradeoff. No shell means you can't exec in to poke around, so you lean on good logging and observability instead. The payoff is a minimal attack surface. Many teams use distroless in prod and slim in dev for that reason." },
        { q: "\"Why run as non-root if the container is isolated anyway?\"", a: "Isolation isn't perfect, and container escapes exist. Running as root means a compromise or escape has root on the host path; running as an unprivileged user contains the damage. It's defense in depth, cheap to add, and expected in production." }
      ]
    },
    {
      title: "ENTRYPOINT vs CMD, .dockerignore, and volumes",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "ENTRYPOINT sets the executable that always runs; CMD sets default arguments that are easy to override at run time. The common pattern is ENTRYPOINT for the command and CMD for the default args, so `docker run image` runs the default job but `docker run image --date 2026-01-01` overrides cleanly. A .dockerignore file keeps junk out of the build context — .git, __pycache__, local data, virtualenvs — which speeds builds and avoids leaking secrets or bloating the image. Volumes mount storage from outside the container so data survives the container's death and can be shared, since the container's own writable layer is ephemeral.",
      code: "# ENTRYPOINT = fixed command, CMD = overridable default args\nENTRYPOINT [\"python\", \"pipeline.py\"]\nCMD [\"--mode\", \"daily\"]\n# docker run img              -> python pipeline.py --mode daily\n# docker run img --mode full  -> python pipeline.py --mode full",
      noteLabel: "In practice:",
      note: "For a data job, ENTRYPOINT plus CMD is a clean way to parameterize runs: the entrypoint is always your pipeline, and CMD supplies the default date or mode you can override per run.<br><br>The .dockerignore is easy to forget and quietly important. Without it, your whole .git history and local data folder get sent into the build context and can end up in the image — slow, bloated, and a secret-leak risk.<br><br>Volumes matter whenever a container needs durable or shared state. For batch jobs you often skip them and write straight to object storage or a warehouse, but for local development a volume for input data is handy.",
      followups: [
        { q: "\"When would you use CMD alone versus ENTRYPOINT plus CMD?\"", a: "CMD alone when the whole command is meant to be replaceable, common for general-purpose images. ENTRYPOINT plus CMD when there's a fixed executable with overridable defaults, ideal for a parameterized job where the pipeline is fixed but the date or mode varies." },
        { q: "\"What goes in a .dockerignore for a Python data job?\"", a: ".git, __pycache__ and *.pyc, virtualenvs like .venv, local data and output folders, .env files with secrets, and test artifacts. Keeping them out shrinks the build context, speeds builds, and avoids baking secrets or bloat into the image." },
        { q: "\"Do batch data jobs actually need volumes?\"", a: "Often not. A batch job typically reads from and writes to external systems — object storage, a warehouse — so it needs no local durable state. Volumes matter more for local dev or stateful services. Design batch containers to be stateless and disposable." }
      ]
    },
    {
      title: "Config and secrets — keep them out of the image",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The cardinal rule is never bake configuration or secrets into an image. An image is meant to be immutable and promoted unchanged from dev to prod, so anything that differs per environment — connection strings, credentials, feature flags — must come in at run time. Pass non-sensitive config via environment variables. Never put secrets in the Dockerfile, in ENV lines, or in build args, because they persist in image layers and history where anyone who pulls the image can extract them. Instead inject secrets at run time from a secret manager, Kubernetes Secrets, or the orchestrator's secret backend.",
      noteLabel: "In practice:",
      note: "The reason to externalize config is promotion. The same image should run in dev, staging, and prod; only the injected environment differs. Bake in a prod database URL and you've lost that portability and probably leaked a credential.<br><br>Secrets in build args are a classic trap — people think ARG is temporary, but it can be recovered from image history. Same with an ENV line holding a password.<br><br>The right pattern: environment variables for plain config, and a real secret store injected at run time for anything sensitive. In Kubernetes that's a Secret mounted as an env var or file; in CI it's the platform's encrypted secrets.",
      followups: [
        { q: "\"Why can't I just use a build ARG for a secret?\"", a: "Build args can be recovered from image history and layer metadata, so the secret leaks to anyone who pulls the image. ARG is for build-time config like a version number, never for credentials. Inject secrets at run time from a secret store instead." },
        { q: "\"What's the difference between config and secrets handling?\"", a: "Non-sensitive config (log level, feature flags, endpoints) can go in plain environment variables. Secrets (passwords, API keys, tokens) need an encrypted store injected at run time — Kubernetes Secrets, a vault, or the CI platform's secret backend. Never treat them the same." },
        { q: "\"How does externalizing config enable environment promotion?\"", a: "Because the image stays identical across dev, staging, and prod — only the injected environment changes. You promote the exact artifact that passed tests and just point it at different config. Baking env-specific values in would force a rebuild per environment and break that guarantee." }
      ]
    }
  ]
},

kubernetes: {
  intro: {
    title: "Kubernetes — orchestrating containers and batch data workloads",
    desc: "What Kubernetes actually solves, the objects a DE touches (pods, deployments, services, Jobs, CronJobs), resource requests and limits, config versus secrets, why teams run Airflow and Spark on Kubernetes, the KubernetesPodOperator, how scaling and self-healing work — and the honest answer to when you should not reach for Kubernetes at all."
  },
  cards: [
    {
      title: "What problem Kubernetes solves — and pods, deployments, services",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Kubernetes is a container orchestrator: you declare the desired state and it continuously works to make reality match. It solves the problems you hit once you have more than a few containers — where do they run, who restarts them when they crash, how do they find each other, how do you scale them, how do you roll out a new version without downtime. The core objects: a pod is one or more co-located containers, the smallest deployable unit. A deployment manages a set of identical pods, handling rollouts and self-healing. A service gives a stable network address and load-balances across a deployment's pods, since pods themselves come and go with changing IPs.",
      noteLabel: "In practice:",
      note: "The mental model is declarative, not imperative. You don't tell Kubernetes 'start this container'; you declare 'I want three replicas of this' and the control loop makes it so and keeps it so. A pod dies, Kubernetes starts a new one to match the declared count.<br><br>For always-on services — an API, a streaming consumer — a deployment plus a service is the standard pairing. The deployment keeps the right number of pods healthy; the service gives clients a stable endpoint even as individual pods are replaced.<br><br>For batch data work, though, you usually reach for a different object entirely, because a deployment is built to keep things running forever, not to run once and stop.",
      followups: [
        { q: "\"What's the difference between a pod and a container?\"", a: "A container is one packaged process; a pod is Kubernetes' wrapper around one or more containers that share network and storage. Usually it's one container per pod. The pod is the unit Kubernetes schedules and manages, not the raw container." },
        { q: "\"Why do you need a service if you already have a deployment?\"", a: "Pods are ephemeral — they get replaced with new IPs constantly. A service provides one stable address and load-balances across the current healthy pods, so clients don't have to track changing pod IPs. It decouples the caller from pod churn." },
        { q: "\"What does 'declarative desired state' mean concretely?\"", a: "You declare what you want — say three replicas — and Kubernetes' control loop continuously reconciles reality to match. If a pod dies, it starts another; if you change the count, it adjusts. You describe the end state, not the steps to get there." }
      ]
    },
    {
      title: "Jobs and CronJobs — the right objects for batch data workloads",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A deployment is built to keep pods running forever, which is wrong for a batch job that should run once and exit. Kubernetes has purpose-built objects for this. A Job runs a pod to completion — it starts, does the work, exits successfully, and Kubernetes tracks that it finished, retrying on failure up to a limit. A CronJob creates Jobs on a schedule, so it's the native way to run a nightly ETL or an hourly aggregation without an external scheduler. For a data engineer, this is the direct fit: your containerized pipeline becomes a Job, and a CronJob runs it on a cron schedule with retries and history built in.",
      code: "apiVersion: batch/v1\nkind: CronJob\nmetadata: {name: nightly-etl}\nspec:\n  schedule: \"0 2 * * *\"        # 02:00 daily\n  jobTemplate:\n    spec:\n      backoffLimit: 2            # retry failed job twice\n      template:\n        spec:\n          restartPolicy: Never\n          containers:\n            - name: etl\n              image: registry/etl:1.4.2\n              args: [\"--mode\", \"daily\"]",
      noteLabel: "In practice:",
      note: "Using a deployment for a batch job is a classic mistake: it keeps restarting the pod after it exits successfully, because a deployment thinks 'exited' means 'crashed, bring it back.' A Job understands that completion is the goal.<br><br>CronJob gives you scheduled batch runs natively, with retry via backoffLimit and a history of past runs. For simpler setups it can replace a standalone scheduler entirely.<br><br>That said, many teams still run Airflow on top for complex DAGs with dependencies between tasks — CronJob handles 'run this on a schedule,' but not 'run B only after A succeeds, and fan out C across partitions.'",
      followups: [
        { q: "\"Why not use a Deployment to run a batch job?\"", a: "A Deployment keeps pods running and restarts them when they exit, so it treats a successful completion as a crash and loops forever. A Job is designed to run to completion and stop, tracking success and retrying only real failures. Use the object built for the workload." },
        { q: "\"CronJob can schedule jobs — why still use Airflow?\"", a: "CronJob handles 'run this on a schedule' well but not dependencies, backfills, or complex DAGs where task B waits on task A. Airflow gives you dependency management, retries per task, backfill, and observability across a pipeline. CronJob is great for simple, independent jobs." },
        { q: "\"How does a Job handle failures?\"", a: "It retries up to backoffLimit with exponential backoff, and only marks the Job failed once retries are exhausted. Set restartPolicy to Never or OnFailure. This gives batch jobs automatic, bounded retry without you wiring up retry logic in application code." }
      ]
    },
    {
      title: "Resource requests and limits — right-sizing data jobs",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Every container should declare CPU and memory requests and limits. A request is what the scheduler guarantees and uses to place the pod on a node with enough capacity — it's the reservation. A limit is the hard ceiling the container can't exceed. For memory, exceeding the limit gets the container OOM-killed. For CPU, exceeding the limit throttles it rather than killing it. Requests affect scheduling and guaranteed resources; limits affect the cap and how the pod is treated under pressure. Getting these right is critical for data jobs, which often have spiky, memory-hungry workloads.",
      code: "resources:\n  requests:              # guaranteed / used for scheduling\n    cpu: \"500m\"          # 0.5 core\n    memory: \"2Gi\"\n  limits:                # hard ceiling\n    cpu: \"2\"\n    memory: \"4Gi\"        # exceed -> OOMKilled",
      noteLabel: "In practice:",
      note: "Data jobs are the workload where this bites hardest. A Spark or pandas job that loads a big partition can blow past a memory limit and get OOM-killed mid-run, so you size the limit to the real peak, not the average.<br><br>Set requests too low and the scheduler overpacks the node, then everything contends and slows. Set them too high and you waste reserved capacity nobody uses. The art is measuring actual usage and sizing to it.<br><br>A common senior move is leaving headroom on the memory limit for spiky jobs, and being deliberate that CPU throttles (recoverable) while memory OOM-kills (fatal to the run).",
      followups: [
        { q: "\"What's the practical difference between a request and a limit?\"", a: "The request is the guaranteed reservation the scheduler uses to place the pod; the limit is the hard ceiling. A pod can burst above its request up to the limit if the node has room, but never above the limit. Requests drive scheduling, limits drive capping." },
        { q: "\"What happens when a data job exceeds its memory limit?\"", a: "It gets OOM-killed — the container is terminated immediately, failing the run. That's why you size the memory limit to the real peak usage of the job, not the average, and leave headroom for spiky partitions. Memory overruns are fatal, unlike CPU." },
        { q: "\"Why does exceeding a CPU limit behave differently from memory?\"", a: "CPU is compressible, so exceeding the limit just throttles the container — it runs slower but survives. Memory is not compressible, so exceeding it means the kernel kills the process. That asymmetry is why memory limits need more careful sizing." }
      ]
    },
    {
      title: "Config vs secrets, and running Airflow or Spark on Kubernetes",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Kubernetes separates non-sensitive config from secrets. A ConfigMap holds plain configuration — endpoints, flags, tuning values — injected into pods as env vars or files. A Secret holds sensitive data like credentials and tokens, handled with more care (base64-encoded at rest, ideally backed by a real secret manager and encrypted). Keeping them separate mirrors the 'never bake config into the image' rule. On top of this, teams run data platforms on Kubernetes: Airflow on Kubernetes uses the KubernetesExecutor or KubernetesPodOperator to launch each task as its own pod, and Spark on Kubernetes uses the cluster as Spark's resource manager, spinning up driver and executor pods per job. The draw is elastic, isolated, per-task resources instead of a fixed standing cluster.",
      noteLabel: "In practice:",
      note: "The ConfigMap-versus-Secret split is the Kubernetes-native version of the config-and-secrets discipline from Docker. Config that's fine in plaintext goes in a ConfigMap; anything sensitive goes in a Secret backed by a proper vault.<br><br>Airflow on Kubernetes is popular because each task runs in its own pod with its own image and resource sizing, and the pods vanish when done, so you're not paying for idle workers. A heavy task can request more memory without bloating every worker.<br><br>Spark on Kubernetes gives the same elasticity — executors scale up for a job and release when it finishes. The tradeoff is operational complexity: you're now running a data platform on an orchestrator, which is powerful but not free to operate.",
      followups: [
        { q: "\"ConfigMap vs Secret — when do you use each?\"", a: "ConfigMap for non-sensitive config like endpoints, log levels, and tuning flags. Secret for credentials, API keys, and tokens. The split keeps sensitive data handled with extra care and mirrors the rule against baking config into images. Back Secrets with a real vault where possible." },
        { q: "\"Why run Airflow on Kubernetes instead of fixed workers?\"", a: "Each task runs as its own pod with its own image and resource sizing, and pods disappear when done, so you don't pay for idle workers. Heavy tasks can request more memory without inflating every worker. You trade a standing worker pool for elastic, isolated per-task pods." },
        { q: "\"What does Spark-on-Kubernetes actually give you?\"", a: "Kubernetes becomes Spark's resource manager, launching driver and executor pods per job that scale up during the job and release afterward. You get elasticity and isolation without a permanent Spark cluster. The cost is added operational complexity in running it well." }
      ]
    },
    {
      title: "KubernetesPodOperator, scaling, self-healing — and when NOT to use k8s",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "The KubernetesPodOperator lets an Airflow task run any container as a pod on the cluster — you point it at an image and args, and Airflow schedules the pod, waits for completion, and captures the result. It's the clean way to run heterogeneous, containerized tasks from one DAG, each with its own image and resources. Kubernetes also gives you automatic scaling (the Horizontal Pod Autoscaler adds pods under load; the Cluster Autoscaler adds nodes) and self-healing (crashed pods are recreated, unhealthy pods are replaced via health probes). But it is not always the right tool: for a handful of simple cron jobs, or a small team without platform expertise, Kubernetes is heavy operational overhead. Managed services or a serverless runner are often the smarter, lazier choice.",
      noteLabel: "In practice:",
      note: "KubernetesPodOperator is the bridge for DEs already on Airflow: keep your DAG orchestration, but run each task as an isolated container with its own dependencies and resource profile. No more forcing every task into one worker's environment.<br><br>Self-healing and autoscaling are the real payoff of Kubernetes — a pod dies and comes back without a page, load rises and capacity follows. That reliability is why platforms adopt it.<br><br>But the honest senior take is knowing when not to. Kubernetes carries serious operational cost: you're running a distributed system to run your jobs. For a few scheduled scripts, a managed scheduler, a serverless container runner, or a simple CronJob on managed Kubernetes beats standing up and babysitting your own cluster. Match the complexity to the actual need.",
      followups: [
        { q: "\"What does the KubernetesPodOperator give you over a normal Airflow operator?\"", a: "Each task runs as its own pod from its own image with its own dependencies and resource sizing, instead of sharing the worker's environment. That means no dependency conflicts between tasks and per-task right-sizing, all while keeping your DAG orchestration in Airflow." },
        { q: "\"How does self-healing actually work?\"", a: "Kubernetes constantly reconciles actual state to desired state. Liveness and readiness probes detect unhealthy pods, and the controller recreates crashed or failed pods to maintain the declared replica count. You get automatic recovery without manual intervention or a 3am page." },
        { q: "\"When is Kubernetes the wrong choice for a data team?\"", a: "When you have a handful of simple scheduled jobs and no platform expertise to operate a cluster. Kubernetes is a distributed system with real operational cost. A managed scheduler, serverless container runner, or managed Kubernetes with CronJobs is often the smarter, lower-overhead choice." }
      ]
    }
  ]
},

cicd: {
  intro: {
    title: "CI/CD — shipping data pipelines through an automated, tested pipeline",
    desc: "Pipelines as code in git, the difference between unit and integration testing for data work, staged promotion from dev to staging to prod, gated deploys and rollback, a concrete GitHub Actions example, how dbt and Spark jobs get tested in CI, and how to handle secrets safely in a CI system."
  },
  cards: [
    {
      title: "Pipelines as code in git — the foundation of CI/CD",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "CI/CD means your build, test, and deploy steps live as code in the repository, versioned alongside the application. CI (continuous integration) is the automatic build-and-test that runs on every push or pull request, catching breakage early and keeping the main branch always releasable. CD (continuous delivery/deployment) automates promoting that tested artifact toward production. The key shift is that the deploy process itself is code — reviewed, versioned, and reproducible — instead of a runbook someone follows by hand. If it's in git, it's auditable, it's the same every time, and a new engineer can read exactly how deploys work.",
      noteLabel: "In practice:",
      note: "The contrast is the manual runbook: a wiki page of steps someone executes, forgets a step, and drifts from over time. Pipeline-as-code can't forget a step and is reviewed like any other change.<br><br>For data engineering this matters because pipeline changes touch production data. A tested, automated deploy is far safer than SSHing in to git-pull and restart.<br><br>The interview signal is treating the deploy process as a first-class, versioned artifact — the same rigor you apply to the pipeline code applies to how it ships.",
      followups: [
        { q: "\"What's the difference between continuous delivery and continuous deployment?\"", a: "Continuous delivery keeps every change deployable and automates up to a manual approval before prod. Continuous deployment removes even that gate — passing tests deploy straight to prod. Data teams usually favor delivery with a prod approval gate given the blast radius of bad data." },
        { q: "\"Why keep the pipeline definition in the same repo as the code?\"", a: "So the deploy process is versioned with the code it deploys, reviewed in the same PR, and always in sync. A change to the pipeline and the code it affects land together. Storing it elsewhere invites drift between what's deployed and how." },
        { q: "\"What does CI give you on every pull request?\"", a: "Automatic build and test before merge, so broken code never reaches the main branch. It catches failures at the cheapest point — before merge — and keeps main always releasable. That fast feedback loop is the core value of continuous integration." }
      ]
    },
    {
      title: "Unit vs integration testing for data pipelines",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Data pipelines need two layers of testing that answer different questions. Unit tests check transformation logic in isolation on small, mocked inputs — does this function dedupe correctly, does this SQL aggregate the sample rows right — and they're fast, so they run on every push. Integration tests check that the pieces work together against real-ish infrastructure — does the pipeline actually read from the source, transform, and write to the warehouse end to end — and they're slower and heavier, so they run less often, often against a staging environment or an ephemeral test database. Unit tests catch logic bugs cheaply; integration tests catch wiring and environment bugs that only appear when components meet.",
      noteLabel: "In practice:",
      note: "The split mirrors the test pyramid: many fast unit tests on logic, fewer slow integration tests on the whole flow.<br><br>For a dbt project, unit tests validate a model's transformation on mock input rows; integration-style runs execute the models against a test schema with sample data and check the results. For a Spark job, you unit-test the transformation functions on small DataFrames and integration-test the full read-process-write against a test bucket.<br><br>The senior point is that data pipelines fail in two distinct ways — wrong logic and wrong wiring — and you need both test types because neither catches the other's failures.",
      followups: [
        { q: "\"What does a unit test look like for a data transformation?\"", a: "You feed a small, known input — a few mock rows or a tiny DataFrame — into the transformation function and assert the output matches expected. No real warehouse, no real data, so it's fast and deterministic. It isolates the logic from the infrastructure." },
        { q: "\"Why aren't unit tests enough for a pipeline?\"", a: "They test logic in isolation but not wiring — connection configs, schema mismatches, permissions, the actual read-transform-write path. Those only surface when components run together against real infrastructure. Integration tests catch that class of failure that unit tests structurally can't see." },
        { q: "\"How do you run integration tests without touching production data?\"", a: "Against an isolated environment: a test schema, an ephemeral database, or a dedicated test bucket seeded with sample data. The pipeline runs end to end but writes to throwaway targets. You get real-wiring coverage without any risk to production." }
      ]
    },
    {
      title: "Staged promotion, gated deploys, and rollback",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Changes should flow through environments, not jump straight to production. The standard path is dev, then staging, then prod. Dev is where you iterate; staging mirrors production closely and runs fuller integration tests against realistic data; prod is the real thing. Promotion between stages is gated: automated tests must pass to move forward, and the prod step is usually gated behind human approval given its blast radius. And every deploy must be reversible — because artifacts are immutable versioned images, rollback is just redeploying the previous version. The combination means a bad change is caught in a lower environment, and if one slips through, you roll back fast instead of firefighting a fix.",
      noteLabel: "In practice:",
      note: "Staging is the environment people under-invest in and regret. If staging genuinely mirrors prod — same infrastructure, realistic data volumes — it catches the wiring and scale bugs that dev's tiny dataset never will.<br><br>Gating prod behind approval is the right amount of friction: everything below prod is fully automated for speed, and the one human checkpoint sits where the risk is highest.<br><br>Rollback is what lets you deploy confidently. Because you ship immutable images, reverting is pointing prod back at the last good digest — fast and clean, not a panicked hotfix. Knowing you can roll back in seconds is what makes frequent deploys safe.",
      followups: [
        { q: "\"Why bother with staging if dev tests already pass?\"", a: "Dev usually runs on tiny data and simplified config, so it misses scale and wiring bugs. Staging mirrors prod — real infrastructure, realistic volumes — and surfaces the failures that only appear at production-like conditions. It's the last catch before customer-facing data is touched." },
        { q: "\"What makes rollback fast and safe?\"", a: "Immutable, versioned image artifacts. Rolling back is just pointing the environment at the previous image digest, which still exists in the registry. Nothing was mutated in place, so there's no state to unwind — you're back to a known-good version in seconds." },
        { q: "\"Why gate prod behind human approval but not the lower environments?\"", a: "Prod has the highest blast radius — real customer-facing data. A human checkpoint there catches things automation can't judge, while keeping dev and staging fully automated for speed. You put the friction exactly where the risk is, and nowhere else." }
      ]
    },
    {
      title: "A GitHub Actions pipeline for a data job",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "A typical GitHub Actions workflow for a containerized data job triggers on push or pull request and runs jobs in sequence: check out the code, run unit tests, build the Docker image, run integration tests against that image, and on the main branch push the image to a registry and deploy. Each step is declared in YAML in the repo. Secrets like registry credentials come from the platform's encrypted secret store, referenced but never printed. The workflow is the concrete embodiment of pipeline-as-code — the whole build-test-ship sequence lives in version control and runs identically every time.",
      code: "name: ci\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Unit tests\n        run: pip install -r requirements.txt && pytest tests/unit\n      - name: Build image\n        run: docker build -t registry/etl:${{ github.sha }} .\n      - name: Push (main only)\n        if: github.ref == 'refs/heads/main'\n        env:\n          REGISTRY_TOKEN: ${{ secrets.REGISTRY_TOKEN }}\n        run: |\n          echo \"$REGISTRY_TOKEN\" | docker login -u ci --password-stdin registry\n          docker push registry/etl:${{ github.sha }}",
      noteLabel: "In practice:",
      note: "Tagging the image with the git SHA is a small but important habit — it ties every image back to the exact commit that built it, so you can trace any running artifact to its source and roll back precisely.<br><br>The `if: github.ref == 'refs/heads/main'` guard means pull requests run tests but only merges to main actually push and deploy. That keeps CI fast on PRs while reserving the ship step for the trunk.<br><br>Secrets come from `${{ secrets.* }}`, the encrypted store, and are piped via stdin rather than echoed, so they never land in logs. That's the safe pattern for credentials in CI.",
      followups: [
        { q: "\"Why tag the image with the git SHA?\"", a: "It ties every image to the exact commit that produced it, so any running artifact traces back to its source and rollback targets a precise version. Unlike the mutable 'latest' tag, a SHA tag is immutable and unambiguous — you always know exactly what's deployed." },
        { q: "\"Why run push and deploy only on main?\"", a: "Pull requests should be tested but not shipped. Gating push/deploy behind the main branch keeps PR runs fast and safe while reserving the actual release for merged, reviewed code. The same workflow serves both PR validation and trunk deployment." },
        { q: "\"How does this workflow keep the registry token out of logs?\"", a: "It pulls the token from GitHub's encrypted secret store via ${{ secrets.* }} and pipes it to docker login through stdin rather than echoing it. Secrets referenced this way are masked in logs, so the credential never appears in plaintext output." }
      ]
    },
    {
      title: "Testing dbt and Spark in CI, and handling secrets safely",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "For dbt, CI typically runs the models against a temporary or slim test schema, executes dbt build so tests run interleaved with models, and can use Slim CI to only rebuild what changed based on state comparison — fast feedback without rebuilding the whole project. For Spark jobs, CI unit-tests the transformation functions on small DataFrames and runs a scaled-down integration job against test data. Across all of this, secrets are handled by the CI platform's encrypted secret store, injected as environment variables at run time, never committed to the repo or printed to logs. The principle from Docker carries straight through: secrets live in a secure store and are injected at run time, and different environments get different secrets.",
      noteLabel: "In practice:",
      note: "dbt's Slim CI is a real time-saver on big projects: instead of rebuilding every model on each PR, it diffs against the production state and only builds and tests the changed models plus their downstream. Fast CI keeps people running it.<br><br>For Spark, the practical split is fast local-style unit tests on small DataFrames in every run, and a heavier integration run against a test dataset less often. You don't spin up a full cluster on every push.<br><br>On secrets, the rules are simple and non-negotiable: never commit them, reference them from the encrypted store, inject at run time, and scope them per environment so a leaked dev credential can't touch prod. CI logs are a common leak point, so ensure secrets are masked.",
      followups: [
        { q: "\"What is dbt Slim CI and why use it?\"", a: "It compares against the production state and rebuilds only the models that changed plus their downstream, instead of the whole project. On large dbt projects that turns a long CI run into a short one, so people actually run it on every PR. Fast feedback is the win." },
        { q: "\"Do you spin up a real Spark cluster in CI?\"", a: "Usually not per push. You run fast unit tests on small DataFrames every time, and a scaled-down integration run against test data less frequently. A full cluster on every commit is slow and costly. Match the test weight to how often it runs." },
        { q: "\"What are the non-negotiable rules for secrets in CI?\"", a: "Never commit them, reference them from the platform's encrypted store, inject at run time as env vars, scope them per environment, and ensure they're masked in logs. A leaked dev credential should never reach prod, which is why per-environment scoping matters." }
      ]
    }
  ]
},

iac: {
  intro: {
    title: "Infrastructure as Code — provisioning data platforms declaratively",
    desc: "Why senior teams define infrastructure in code with Terraform instead of clicking through a console: declarative and idempotent provisioning, managing multiple environments from one codebase, what state is and why it matters, and the concrete case for IaC over click-ops when you're running a data platform."
  },
  cards: [
    {
      title: "Infrastructure as Code and Terraform — the core idea",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Infrastructure as Code means defining your infrastructure — warehouses, buckets, clusters, networks, IAM roles — in version-controlled code instead of creating it by hand in a web console. Terraform is the dominant tool: you write declarative configuration describing the resources you want, and Terraform figures out the API calls to make reality match. Because it's code, infrastructure is reviewed in pull requests, versioned in git, and reproducible — you can stand up an identical environment from the same config. It brings the same discipline to infrastructure that CI/CD brought to application deploys: reviewed, versioned, automated, and repeatable.",
      noteLabel: "In practice:",
      note: "The contrast is 'click-ops' — provisioning by clicking through a cloud console. It works once, but it's unrepeatable, undocumented, and impossible to review. Six months later nobody remembers exactly how the prod warehouse was configured.<br><br>With Terraform the configuration is the documentation and the source of truth. Want to know how prod is set up? Read the code. Want an identical staging environment? Apply the same config with different variables.<br><br>For a data platform with warehouses, storage, compute, and permissions, IaC is what keeps environments consistent and changes auditable.",
      followups: [
        { q: "\"What does Terraform actually do when you run it?\"", a: "It compares your declared config against the current real state and computes the minimal set of API calls to reconcile them, then applies them. You describe the desired end state; Terraform plans and executes the diff. You never write the individual create/update calls yourself." },
        { q: "\"Why is IaC better than clicking through the console?\"", a: "Console changes are unrepeatable, undocumented, and unreviewable — nobody can tell how something was configured or reproduce it. IaC makes the config the source of truth: version-controlled, peer-reviewed in PRs, and reproducible across environments. It brings software discipline to infrastructure." },
        { q: "\"How does IaC relate to CI/CD?\"", a: "Same philosophy, different layer. CI/CD versions and automates how application code ships; IaC versions and automates how infrastructure is provisioned. Both replace manual, drift-prone processes with reviewed, repeatable code. Often the IaC apply itself runs through a CI/CD pipeline." }
      ]
    },
    {
      title: "Declarative and idempotent — apply the same config safely",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Two properties make IaC safe. Declarative means you describe the desired end state, not the steps to get there — you say 'this bucket with these settings should exist,' not 'create a bucket.' Idempotent means applying the same config repeatedly converges to the same result: if the resource already matches, nothing changes; if it drifted, Terraform corrects it. Together they mean you can run apply again and again without fear of duplicating resources or breaking things. This is the opposite of imperative scripts, where running a create-script twice makes two of everything.",
      code: "# Declarative: describe the desired resource, run apply anytime\nresource \"aws_s3_bucket\" \"lake\" {\n  bucket = \"acme-data-lake-${var.environment}\"\n}\nresource \"aws_s3_bucket_versioning\" \"lake\" {\n  bucket = aws_s3_bucket.lake.id\n  versioning_configuration { status = \"Enabled\" }\n}",
      noteLabel: "In practice:",
      note: "Idempotency is what makes IaC trustworthy. You can run terraform apply on a schedule or in CI and it only makes changes when something actually differs from the declared state. No drift, no duplicates.<br><br>The declarative model also means Terraform can show you a plan before applying — a diff of exactly what will change — so you review the impact before anything happens. That preview is a huge safety net for production infrastructure.<br><br>Contrast with a hand-written imperative script: run it twice and you might create two buckets or error out halfway. Declarative-plus-idempotent removes that whole failure class.",
      followups: [
        { q: "\"What does idempotent mean in practice here?\"", a: "Applying the same config any number of times converges to the same state. If the resource already matches, Terraform does nothing; if it drifted, Terraform corrects it. You can re-apply safely without creating duplicates or breaking existing resources — a property imperative scripts lack." },
        { q: "\"How does terraform plan help before an apply?\"", a: "It shows a diff of exactly what will be created, changed, or destroyed, without touching anything. You review the impact — especially destructive changes — before committing. That preview is a critical safety net for production infrastructure where a surprise deletion is expensive." },
        { q: "\"Why is declarative safer than an imperative provisioning script?\"", a: "An imperative script encodes steps, so running it twice can duplicate resources or fail halfway in an inconsistent state. Declarative config describes the end state and reconciles to it idempotently, so re-runs are safe and the result is predictable regardless of the starting point." }
      ]
    },
    {
      title: "Environments, state, and why IaC beats click-ops for data platforms",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "One IaC codebase drives multiple environments through variables and workspaces — the same config produces dev, staging, and prod that differ only in parameters like size and naming, guaranteeing they stay consistent. Central to Terraform is state: a file mapping your config to the real resources it created. State is how Terraform knows what already exists so it can compute the diff. It must be stored remotely (in object storage) and locked during changes, so a team shares one source of truth and two people can't apply conflicting changes at once. For a data platform — warehouses, lakes, compute, IAM across several environments — IaC is what keeps everything consistent, auditable, and reproducible, which click-ops fundamentally cannot.",
      noteLabel: "In practice:",
      note: "Managing environments from one codebase is the payoff that sells IaC. Staging genuinely mirrors prod because it's built from the same config with different variables, so 'works in staging' actually means something.<br><br>State is the part people trip on. It's Terraform's memory of what it created; lose it or corrupt it and Terraform no longer knows what exists. So you store it remotely with locking, never on one laptop, and never edit it by hand.<br><br>For a data platform the case for IaC is overwhelming: dozens of resources, strict permissions, several environments, and audit requirements. Reproducing that by clicking is slow, error-prone, and unauditable. IaC makes the whole platform a reviewed, versioned, reproducible artifact.",
      followups: [
        { q: "\"What is Terraform state and why does it matter?\"", a: "It's a file mapping your config to the real resources Terraform created — its memory of what exists. Terraform uses it to compute the diff on each run. Lose or corrupt it and Terraform no longer knows what it manages, which is why state is handled so carefully." },
        { q: "\"Why store state remotely with locking?\"", a: "So the whole team shares one source of truth and can't apply conflicting changes simultaneously. Locking prevents two applies from racing and corrupting state; remote storage means it's not stranded on one laptop. Shared, locked remote state is standard for any team." },
        { q: "\"Why is IaC especially compelling for a data platform?\"", a: "A data platform is dozens of resources — warehouses, lakes, compute, IAM — across several environments with audit needs. Reproducing that by hand is slow, drift-prone, and unauditable. IaC makes it consistent across environments, reviewable in PRs, and reproducible, which click-ops simply cannot deliver." }
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — Docker, Kubernetes & CI/CD Q&A",
    desc: "The spoken questions a mid-to-senior DE gets on containers, orchestration, and delivery. Form your own answer first, then compare — the score is in the tradeoff, the failure mode, and the boundary. Answers are first-person and framed on real pipeline work."
  },
  cards: [
    {
      title: "\"How would you containerize a Spark or Python data job?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you know the Dockerfile craft that matters — cache-aware layer ordering, multi-stage builds, small and non-root images, and externalized config — rather than just 'write a Dockerfile.' The interviewer wants the reasoning behind each choice.",
      noteLabel: "Model answer:",
      note: "\"I start from a slim base like python:3.12-slim to keep the image small and the attack surface low.<br><br>I order the Dockerfile for caching: copy the requirements file and install dependencies first, then copy the source code last, so a code edit doesn't reinstall every dependency. For anything with a build toolchain I use a multi-stage build — a fat builder stage produces the wheels or artifacts, and a clean runtime stage copies only those in, so compilers never ship to prod.<br><br>I run as a non-root user, add a .dockerignore to keep .git and local data out of the build context, and I never bake config or secrets into the image — those come in at run time via environment variables and a secret store, so the same image promotes cleanly from dev to prod.<br><br>For a Spark job specifically, I make sure the image matches the cluster's Spark and Java versions, and I keep the container stateless — it reads from and writes to external storage, so nothing depends on the container surviving.\"",
      followups: [
        { q: "\"Why multi-stage instead of just one stage?\"", a: "It keeps the build toolchain — compilers, dev headers, build deps — out of the final image. The runtime stage receives only the finished artifacts, so it's smaller and has far fewer packages to patch. One stage would ship all the build cruft to production." },
        { q: "\"How do you keep the image small beyond the base choice?\"", a: "Multi-stage builds, a slim or distroless base, --no-cache-dir on pip, a .dockerignore to shrink the build context, and combining related RUN steps to reduce layers. Each shaves size, which speeds pulls and reduces the surface to patch and secure." },
        { q: "\"What Spark-specific gotcha do you watch for?\"", a: "Version alignment — the image's Spark and Java versions must match the cluster, or you get cryptic runtime failures. I also keep the container stateless, reading and writing external storage, so nothing depends on the container living past the job." }
      ]
    },
    {
      title: "\"How do you run batch jobs on Kubernetes?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you reach for the right Kubernetes object — Job and CronJob — instead of misusing a Deployment, and whether you understand retries, resource sizing, and where an orchestrator like Airflow still fits.",
      noteLabel: "Model answer:",
      note: "\"I use a Job for a run-to-completion batch task and a CronJob to run it on a schedule — those are the objects built for batch work.<br><br>The mistake I avoid is using a Deployment, which is designed to keep pods running forever and treats a successful exit as a crash to restart. A Job understands that completing and stopping is the goal, and it retries real failures up to backoffLimit.<br><br>I set resource requests and limits deliberately, because data jobs are spiky — I size the memory limit to the real peak so a big partition doesn't get the pod OOM-killed mid-run. Config comes from a ConfigMap and secrets from a Secret, injected at run time.<br><br>For simple independent jobs a CronJob is enough on its own. But once I have dependencies between tasks, backfills, or a real DAG, I run Airflow on top — often with the KubernetesPodOperator so each task is its own pod with its own image and resources, while Airflow handles the orchestration.\"",
      followups: [
        { q: "\"Why not a Deployment for a batch job?\"", a: "A Deployment keeps pods running and restarts them on exit, so it treats a successful completion as a crash and loops forever. A Job is built to run to completion and stop, retrying only genuine failures. Using the right object is the whole point." },
        { q: "\"When does CronJob stop being enough?\"", a: "When you need dependencies between tasks, backfills, or a complex DAG where B waits on A. CronJob handles 'run on a schedule' but not orchestration. At that point I add Airflow, often with the KubernetesPodOperator to keep per-task isolation." },
        { q: "\"How do you keep a data job from getting OOM-killed?\"", a: "Size the memory limit to the real peak usage, not the average, and leave headroom for spiky partitions. Memory overruns are fatal — the pod is killed immediately — so I measure actual peak consumption and set the limit above it deliberately." }
      ]
    },
    {
      title: "\"What does CI/CD give a data pipeline that hand-deploying doesn't?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you can articulate the concrete benefits — reproducibility, testing gates, safe promotion, and rollback — rather than reciting 'automation good.' They want the failure modes CI/CD removes.",
      noteLabel: "Model answer:",
      note: "\"Hand-deploying is someone SSHing to a box, git-pulling, and restarting a process, and it fails in predictable ways: a skipped step, an untested change, undocumented state, and no clean way back.<br><br>CI/CD removes each of those. Every change runs through automated tests before it can ship, so broken logic is caught before prod. The artifact that gets deployed is the exact image that passed tests, so there's no environment drift between what I tested and what runs. Promotion is staged through dev, staging, and prod with the prod step gated behind approval, so a bad change is caught in a lower environment.<br><br>And because I ship immutable versioned images, rollback is just pointing prod back at the last good digest — fast and clean instead of a panicked hotfix.<br><br>The net effect is that deploys become boring and reversible, which is exactly what you want when a mistake can corrupt production data.\"",
      followups: [
        { q: "\"Which single benefit matters most for data work?\"", a: "Reproducibility plus rollback, together. The exact tested image runs in prod, and if something's wrong I revert to the last good version in seconds. When a bad deploy can corrupt production data, being able to test the real artifact and undo fast is the biggest safety win." },
        { q: "\"How does CI/CD prevent environment drift?\"", a: "By deploying the exact image that passed tests, identified by digest, rather than rebuilding on the target. What I tested and what runs are byte-for-byte identical, so a test pass actually predicts production behavior. Hand-deploys rebuild and drift." },
        { q: "\"What failure mode of hand-deploy bites hardest?\"", a: "The skipped or forgotten step that leaves undocumented state, with no clean rollback. Nobody remembers exactly what was done, so reproducing or reverting is guesswork. Pipeline-as-code can't forget a step and every deploy is identical and reversible." }
      ]
    },
    {
      title: "\"Explain resource requests versus limits.\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand Kubernetes scheduling and the asymmetry between CPU and memory under pressure — a very common, concrete Kubernetes question where vague answers show shallow experience.",
      noteLabel: "Model answer:",
      note: "\"A request is the guaranteed reservation — it's what the scheduler uses to place the pod on a node with enough capacity. A limit is the hard ceiling the container can't exceed.<br><br>The key nuance is that CPU and memory behave differently at the limit. CPU is compressible, so exceeding the CPU limit just throttles the container — it runs slower but survives. Memory is not compressible, so exceeding the memory limit gets the container OOM-killed outright.<br><br>That asymmetry drives how I size data jobs. Memory limits need careful sizing to the real peak, because a big partition that blows the limit kills the run instantly. CPU I can be a bit more relaxed about since overrun only slows things down.<br><br>Requests also matter for packing: set them too low and the scheduler overpacks the node and everything contends; too high and I waste reserved capacity. So I measure actual usage and size requests to the real typical load and limits to the real peak.\"",
      followups: [
        { q: "\"Why does exceeding a memory limit kill the pod but a CPU limit doesn't?\"", a: "Memory is non-compressible — you can't run with less than you allocated — so the kernel OOM-kills the process. CPU is compressible, so the container is just throttled to its limit and keeps running slower. That's why memory limits demand more careful sizing." },
        { q: "\"What happens if you set requests too low?\"", a: "The scheduler thinks the node has more free capacity than it does and overpacks it. Then pods contend for real resources, everything slows, and you can get evictions under pressure. Requests should reflect the real typical usage so scheduling decisions are sound." },
        { q: "\"Can a pod use more than its request?\"", a: "Yes, up to its limit, if the node has spare capacity — it can burst above the request. The request is the guarantee; the limit is the ceiling. Between them the pod uses what's available. Above the limit it's throttled (CPU) or killed (memory)." }
      ]
    },
    {
      title: "\"How do you handle secrets across environments?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you have a consistent, secure story from image to CI to runtime — never in the image, injected at run time, scoped per environment — rather than an ad hoc answer. Secrets handling is a security signal interviewers weight heavily.",
      noteLabel: "Model answer:",
      note: "\"The consistent rule across every layer is: secrets never live in the artifact, they're injected at run time from a secure store, and they're scoped per environment.<br><br>In Docker, that means no secrets in the Dockerfile, no ENV lines with credentials, and no build args — those persist in image layers and history where anyone who pulls the image can recover them. The image stays clean and portable.<br><br>In CI, secrets come from the platform's encrypted secret store, referenced as masked variables and piped via stdin so they never print to logs, which is a common leak point.<br><br>At run time in Kubernetes, plain config goes in a ConfigMap and sensitive values in a Secret, ideally backed by a real vault, injected as env vars or mounted files.<br><br>And crucially, each environment gets its own secrets — dev credentials are different from prod — so a leaked dev key can't touch production. Same image everywhere, different injected secrets per environment.\"",
      followups: [
        { q: "\"Why can't secrets go in a Docker build ARG?\"", a: "Build args are recoverable from image history and layer metadata, so the secret leaks to anyone who pulls the image. ARG is for build-time config like a version, never credentials. Secrets get injected at run time from a secret store instead." },
        { q: "\"How do you keep secrets out of CI logs?\"", a: "Reference them from the platform's encrypted store so they're masked in output, and pipe them via stdin rather than echoing them. Logs are a common leak point, so I never print a secret and rely on the platform's masking as a backstop." },
        { q: "\"Why scope secrets per environment?\"", a: "So a leaked or compromised dev credential can't reach production. Each environment gets its own distinct secrets, injected into the same portable image. This limits blast radius — the whole point is that a mistake in a low environment stays contained there." }
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What is the fundamental difference between a Docker image and a container?",
    options: [
      "An image runs, a container is stored on disk",
      "An image is the immutable read-only template; a container is a running instance of it",
      "They are two names for the same thing",
      "An image is for Kubernetes, a container is for Docker"
    ],
    correct: 1
  },
  {
    q: "In a Dockerfile, why should you copy requirements.txt and install dependencies BEFORE copying your source code?",
    options: [
      "It makes the final image smaller",
      "It is required syntax for pip to work",
      "So a code change doesn't bust the cache and reinstall all dependencies every build",
      "It runs the tests automatically"
    ],
    correct: 2
  },
  {
    q: "You need to run a nightly ETL job on Kubernetes that starts, processes data, and exits. Which object is the right fit?",
    options: [
      "A Deployment",
      "A Service",
      "A CronJob (which creates Jobs on a schedule)",
      "A ConfigMap"
    ],
    correct: 2
  },
  {
    q: "A container exceeds its memory limit in Kubernetes. What happens?",
    options: [
      "It is throttled but keeps running",
      "It is OOM-killed (terminated)",
      "Kubernetes automatically raises the limit",
      "Nothing, memory limits are advisory"
    ],
    correct: 1
  },
  {
    q: "What is the difference between a resource request and a limit in Kubernetes?",
    options: [
      "Request is the maximum; limit is the minimum",
      "They are the same value expressed differently",
      "Request is the guaranteed reservation used for scheduling; limit is the hard ceiling",
      "Request applies to CPU only; limit applies to memory only"
    ],
    correct: 2
  },
  {
    q: "Why should you NEVER put a secret in a Docker build ARG or ENV line?",
    options: [
      "Build args are too short to hold a secret",
      "It persists in image layers/history and can be recovered by anyone who pulls the image",
      "It slows down the build significantly",
      "ARG values are automatically printed to the console"
    ],
    correct: 1
  },
  {
    q: "What does a multi-stage Docker build primarily achieve?",
    options: [
      "It runs the container faster at runtime",
      "It keeps the build toolchain out of the final image, producing a smaller, more secure artifact",
      "It allows the image to run on multiple architectures",
      "It automatically encrypts the image layers"
    ],
    correct: 1
  },
  {
    q: "What distinguishes unit tests from integration tests for a data pipeline?",
    options: [
      "Unit tests run in prod, integration tests run in dev",
      "Unit tests check transformation logic in isolation on mock data; integration tests check the end-to-end flow against real infrastructure",
      "They are the same, just run at different times",
      "Unit tests are slower and heavier than integration tests"
    ],
    correct: 1
  },
  {
    q: "In a CI/CD flow, what makes rolling back a deployment fast and safe?",
    options: [
      "Rebuilding the previous version from source on the prod box",
      "Immutable versioned image artifacts — you just point prod at the previous image digest",
      "Manually editing the running container's files",
      "Deleting the current deployment and starting from scratch"
    ],
    correct: 1
  },
  {
    q: "What does it mean that Terraform (IaC) is 'idempotent'?",
    options: [
      "It can only be run once per environment",
      "Applying the same config repeatedly converges to the same state without duplicating resources",
      "It automatically deletes resources it didn't create",
      "It requires no state file to function"
    ],
    correct: 1
  }
];
