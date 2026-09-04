// Content data for the Terraform / IaC module (framed for data-infrastructure provisioning).
const MODULE_ID = "terraform";
const CONTENT = {

overview: {
  intro: {
    title: "Terraform & IaC — provisioning data infrastructure as code",
    desc: "A DE doesn't just write pipelines — they provision the infrastructure those pipelines run on: buckets, warehouses, Databricks workspaces, IAM, Airflow. Terraform is the standard way to do that as version-controlled, reviewable, reproducible code instead of clicking in a console. This module covers the concepts interviewers test — the declarative model, state, modules, and the CI/CD workflow — framed around data infra. Work each tab, answer the follow-ups aloud, then check."
  },
  cards: [
    {
      title: "What Infrastructure as Code is — and why it matters for a DE",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "IaC means defining your infrastructure — storage buckets, compute, networks, IAM roles, warehouse resources — in code files, versioned in Git, instead of clicking through a cloud console (ClickOps). The payoffs: reproducibility (spin up an identical dev/test/prod from the same code), reviewability (infra changes go through PRs like any code), auditability (Git history shows who changed what), and disaster recovery (rebuild everything from code). For a DE specifically, it's how you provision the data platform consistently — the same S3 bucket layout, Glue catalog, Databricks cluster policy, or BigQuery dataset across environments — and avoid the 'works in dev, missing in prod' drift that manual setup causes. Console clicks don't scale, aren't reviewable, and can't be reproduced.",
      navLabel: "The distinction interviewers probe:",
      nav: "IaC isn't just 'scripts that create infra' — that's imperative (a bash script running aws cli commands, which you can't safely re-run). Terraform is DECLARATIVE: you describe the desired end state and Terraform figures out the create/update/delete actions to reach it, and re-running is safe (idempotent). That declarative-vs-imperative distinction, and idempotency, is the core conceptual answer.",
      noteLabel: "Model answer:",
      note: "\"Infrastructure as Code means defining infrastructure — buckets, compute, IAM, warehouse resources — in versioned code instead of clicking in a console.<br><br>The payoffs are reproducibility, reviewability, auditability, and disaster recovery: I can stand up identical environments from the same code, changes go through PRs, Git shows who changed what, and I can rebuild from scratch.<br><br>For a DE it's how I provision the data platform consistently across dev, test, and prod, and avoid the 'works in dev, missing in prod' drift that manual setup causes.<br><br>And the key distinction is that Terraform is declarative — I describe the desired end state and it computes the actions to get there, so re-running is idempotent — versus an imperative script of CLI commands you can't safely re-run.\"",
      followups: [
        "\"Declarative vs imperative infra — what's the difference and why does it matter?\"",
        "\"What does 'idempotent' mean for a Terraform apply?\"",
        "\"Why is ClickOps a problem across environments?\""
      ]
    },
    {
      title: "Terraform vs CloudFormation, Bicep, Pulumi, CDK",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Terraform's edge is being cloud-agnostic and multi-provider: one tool and language (HCL) provisions AWS, Azure, GCP, Databricks, Snowflake, Kubernetes, and hundreds more via providers — valuable for a data stack that spans clouds and SaaS. Alternatives: CloudFormation (AWS-only, native, no separate state to manage), ARM/Bicep (Azure-only, native), Pulumi and AWS CDK (define infra in a real programming language — Python/TypeScript — rather than a DSL, better for complex logic but more moving parts). The honest framing: Terraform for multi-cloud/multi-provider and the largest ecosystem; the native tools if you're all-in on one cloud and want zero state management; Pulumi/CDK if your team strongly prefers a general-purpose language. Terraform is the de facto standard most DE roles expect.",
      noteLabel: "Model answer:",
      note: "\"Terraform's edge is that it's cloud-agnostic and multi-provider — one tool and language provisions AWS, Azure, GCP, Databricks, Snowflake, Kubernetes, and hundreds more through providers. That's valuable for a data stack spanning clouds and SaaS.<br><br>CloudFormation is AWS-only and native, with no separate state to manage. ARM and Bicep are the Azure-only equivalents. Pulumi and CDK let me define infra in a real language like Python instead of a DSL, which helps with complex logic but adds moving parts.<br><br>So I'd use Terraform for multi-cloud and the biggest ecosystem, a native tool if I'm all-in on one cloud and want zero state management, and Pulumi or CDK if the team strongly prefers a general-purpose language. Terraform is the de facto standard most roles expect.\"",
      followups: [
        "\"Why might you pick CloudFormation over Terraform on an all-AWS shop?\"",
        "\"What does Pulumi/CDK give you that Terraform's HCL doesn't?\"",
        "\"What's a Terraform 'provider'?\""
      ]
    },
    {
      title: "The core workflow — write, plan, apply",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "The Terraform loop is small and worth knowing cold. terraform init downloads the providers and configures the backend (where state lives). terraform plan compares your code (desired state) against the current state and shows exactly what it will create, change, or destroy — a dry run you review before touching anything (the single most important safety step). terraform apply executes that plan to reach the desired state. terraform destroy tears it all down. Supporting commands: terraform fmt (format), terraform validate (syntax/type check), terraform import (bring existing resources under management). The discipline that matters: ALWAYS read the plan before apply — especially watching for anything marked 'destroy', because Terraform will happily replace or delete a resource (like a database) if the change requires it.",
      code: "terraform init      # download providers, configure backend/state\nterraform plan      # dry run: shows +create ~update -destroy\nterraform apply     # execute the plan to reach desired state\nterraform destroy   # tear everything down\n\n# The rule: READ the plan. A '-/+ destroy and recreate' on a\n# stateful resource (DB, bucket) can mean data loss.",
      noteLabel: "Model answer:",
      note: "\"The loop is small. init downloads providers and configures the backend where state lives. plan compares my code against the current state and shows exactly what it will create, change, or destroy — a dry run I review before anything happens. apply executes that plan. destroy tears it down.<br><br>Supporting commands are fmt to format, validate to check syntax and types, and import to bring existing resources under management.<br><br>The discipline that matters most is always reading the plan before apply, especially watching for anything marked destroy — Terraform will happily replace or delete a stateful resource like a database if the change forces it, so that's where data loss hides.\"",
      followups: [
        "\"What does terraform plan actually compare?\"",
        "\"You see '-/+ destroy and then create' on your prod database in the plan — what do you do?\"",
        "\"What does terraform init set up?\""
      ]
    }
  ]
},

core: {
  intro: {
    title: "HCL & core constructs — providers, resources, variables, data sources",
    desc: "Terraform configs are written in HCL, and a handful of constructs cover almost everything: providers, resources, variables, outputs, and data sources, plus the meta-arguments (count, for_each, depends_on) that make configs reusable. This tab covers the building blocks you'll read and write daily, with data-infra examples."
  },
  cards: [
    {
      title: "Providers & resources — the building blocks",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A PROVIDER is a plugin that knows how to talk to a platform's API (aws, azurerm, google, databricks, snowflake); you configure it with region/credentials. A RESOURCE is a single managed object — an S3 bucket, a BigQuery dataset, a Databricks cluster — declared as a typed block with arguments. Terraform builds a dependency graph from references between resources (bucket B referencing bucket A's id means A is created first) and provisions in the right order, in parallel where it can. You reference one resource's attributes in another with resource_type.name.attribute. This graph-and-references model is why you don't write ordering logic yourself — you declare relationships and Terraform sequences them.",
      code: "provider \"aws\" { region = \"us-east-1\" }\n\nresource \"aws_s3_bucket\" \"lake\" {\n  bucket = \"my-company-data-lake\"\n}\n\nresource \"aws_glue_catalog_database\" \"silver\" {\n  name = \"silver\"\n  # reference another resource => Terraform orders it after the bucket\n  location_uri = \"s3://${aws_s3_bucket.lake.bucket}/silver/\"\n}",
      noteLabel: "Model answer:",
      note: "\"A provider is a plugin that knows how to talk to a platform's API — aws, azurerm, google, databricks, snowflake — configured with region and credentials.<br><br>A resource is a single managed object, like an S3 bucket or a BigQuery dataset, declared as a typed block with arguments.<br><br>Terraform builds a dependency graph from the references between resources. If one resource references another's id, it knows to create that one first, and it provisions in the right order, parallelizing where it can.<br><br>So I don't write ordering logic — I declare the relationships by referencing attributes, and Terraform sequences everything from the graph.\"",
      followups: [
        "\"How does Terraform know to create resource A before resource B?\"",
        "\"What's the difference between a provider and a resource?\"",
        "\"How do you reference one resource's output in another?\""
      ]
    },
    {
      title: "Variables, outputs & locals — parameterizing configs",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "VARIABLES are typed inputs that parameterize a config (environment name, region, instance size, a list of bucket names) — set via tfvars files, CLI flags, or environment variables, so the same code targets dev vs prod by changing inputs, not code. OUTPUTS expose values from your config (a created bucket's ARN, a cluster's URL) for humans or for other configs/modules to consume. LOCALS are named expressions for DRY-ing up repeated values or computed names within a config. Typing and validation on variables (e.g. constrain env to dev/staging/prod) catch mistakes at plan time. This is how one codebase serves every environment — the environment is an input, never a copy-paste.",
      code: "variable \"env\" {\n  type = string\n  validation { condition = contains([\"dev\",\"staging\",\"prod\"], var.env)\n               error_message = \"env must be dev|staging|prod\" }\n}\nlocals { bucket_name = \"data-lake-${var.env}\" }\nresource \"aws_s3_bucket\" \"lake\" { bucket = local.bucket_name }\noutput \"lake_arn\" { value = aws_s3_bucket.lake.arn }",
      noteLabel: "Model answer:",
      note: "\"Variables are typed inputs that parameterize a config — environment, region, instance size — set through tfvars, CLI flags, or environment variables, so the same code targets dev or prod by changing inputs, not the code.<br><br>Outputs expose values from the config, like a created bucket's ARN or a cluster URL, for people or for other modules to consume.<br><br>Locals are named expressions for DRY-ing up repeated or computed values, like building a bucket name from the environment.<br><br>I put typing and validation on variables so a bad value — an environment that isn't dev, staging, or prod — fails at plan time. That's how one codebase serves every environment: the environment is an input, never a copy-paste.\"",
      followups: [
        "\"How does the same config target dev and prod?\"",
        "\"Variable vs local vs output — what's each for?\"",
        "\"How do you stop someone passing an invalid environment value?\""
      ]
    },
    {
      title: "Data sources & meta-arguments (count, for_each)",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A DATA SOURCE reads existing infrastructure you didn't create in this config — look up an existing VPC, an AMI, the current account id, or a secret — so you can reference it without managing it. Distinct from a resource (which Terraform owns/creates). META-ARGUMENTS control resource behavior: count = N creates N copies (indexed), for_each iterates a map/set to create one resource per element (keyed, and safer than count because adding/removing an element doesn't reindex the others), depends_on forces an explicit ordering the graph can't infer, and lifecycle tunes behavior (prevent_destroy to guard a stateful resource, create_before_destroy for zero-downtime replacement, ignore_changes to stop fighting an externally-managed field). for_each over a map is the idiomatic way to provision N similar things (say a bucket per data domain).",
      code: "data \"aws_caller_identity\" \"current\" {}   # read existing (not managed)\n\n# one bucket per domain, keyed (for_each safer than count):\nresource \"aws_s3_bucket\" \"domain\" {\n  for_each = toset([\"sales\",\"claims\",\"web\"])\n  bucket   = \"lake-${each.key}-${data.aws_caller_identity.current.account_id}\"\n  lifecycle { prevent_destroy = true }   # guard against accidental deletion\n}",
      noteLabel: "Model answer:",
      note: "\"A data source reads existing infrastructure I didn't create here — an existing VPC, the current account id, a secret — so I can reference it without managing it. That's different from a resource, which Terraform owns and creates.<br><br>Meta-arguments control behavior. count makes N indexed copies. for_each iterates a map or set to create one keyed resource per element, and it's safer than count because adding or removing an element doesn't reindex the others. depends_on forces ordering the graph can't infer. And lifecycle tunes behavior — prevent_destroy to guard a stateful resource, create_before_destroy for zero-downtime replacement, ignore_changes to stop fighting an externally-managed field.<br><br>for_each over a map is how I idiomatically provision N similar things, like a bucket per data domain.\"",
      followups: [
        "\"Data source vs resource — what's the difference?\"",
        "\"Why is for_each usually safer than count?\"",
        "\"How do you stop a plan from accidentally destroying a prod bucket?\""
      ]
    }
  ]
},

state: {
  intro: {
    title: "State — the concept interviews push hardest on",
    desc: "Terraform's state file is its most important and most-tested concept: it's how Terraform maps your code to real resources. Mishandle it and you get corruption, conflicts, or accidental destruction. This tab covers what state is, why remote backends and locking are non-negotiable on a team, drift, and importing existing resources."
  },
  cards: [
    {
      title: "What state is, and why it exists",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Terraform stores a STATE file (terraform.tfstate) — a JSON mapping between the resources in your code and the real objects in the cloud (their IDs and current attributes). It needs this because on the next plan it must know 'the aws_s3_bucket.lake in my code IS this actual bucket' to compute the diff; without state it couldn't tell a create from an update from a delete. State also caches attributes and tracks metadata/dependencies. The critical warnings: state can contain SECRETS (a generated DB password ends up in plaintext state), so it must be stored securely and never committed to Git; and state is the source of truth Terraform trusts — if code and state disagree, Terraform acts on the diff, so corrupting or losing state is a real incident.",
      noteLabel: "Model answer:",
      note: "\"Terraform stores a state file — a JSON mapping between the resources in my code and the real objects in the cloud, their IDs and current attributes.<br><br>It needs this because on the next plan it has to know that the bucket in my code IS this specific real bucket, to compute the diff. Without state it couldn't tell a create from an update from a delete.<br><br>Two critical warnings. State can contain secrets — a generated database password lands in plaintext state — so it must be stored securely and never committed to Git. And state is the source of truth Terraform trusts; if code and state disagree it acts on the diff, so losing or corrupting state is a genuine incident.\"",
      followups: [
        "\"Why does Terraform need a state file at all?\"",
        "\"Should the state file go in Git? Why not?\"",
        "\"Can state contain sensitive data? What do you do about it?\""
      ]
    },
    {
      title: "Remote backends & state locking — the team requirement",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Local state on one laptop doesn't work for a team — nobody else can apply, and two people applying at once corrupt it. The fix is a REMOTE BACKEND: state lives in shared, durable, encrypted storage — S3 (with a DynamoDB table for locking), GCS, Azure Blob, or Terraform Cloud. Two things it gives you: shared state everyone reads/writes, and LOCKING so only one apply runs at a time (a second apply waits or fails rather than racing and corrupting state). The classic AWS pattern is S3 backend + DynamoDB lock table + encryption enabled. You also split state by environment/component (separate state files for dev vs prod, or per service) so a mistake in one has a small blast radius and applies are faster. Remote backend + locking is table-stakes for any real setup — a very common interview checkpoint.",
      code: "terraform {\n  backend \"s3\" {\n    bucket         = \"my-tfstate\"\n    key            = \"data-platform/prod/terraform.tfstate\"\n    region         = \"us-east-1\"\n    dynamodb_table = \"tf-locks\"   # state locking\n    encrypt        = true\n  }\n}",
      noteLabel: "Model answer:",
      note: "\"Local state on one laptop doesn't work for a team — no one else can apply, and two simultaneous applies corrupt it.<br><br>So I use a remote backend: state in shared, durable, encrypted storage like S3, GCS, Azure Blob, or Terraform Cloud. It gives me shared state everyone uses, and locking so only one apply runs at a time — a second waits or fails instead of racing.<br><br>The classic AWS pattern is an S3 backend with a DynamoDB lock table and encryption on.<br><br>I also split state by environment and component, so dev and prod have separate state and a mistake has a small blast radius. Remote backend plus locking is table-stakes for any real setup.\"",
      followups: [
        "\"Two engineers run apply at the same time — what stops corruption?\"",
        "\"What's the S3 + DynamoDB pattern doing?\"",
        "\"Why keep separate state for dev and prod?\""
      ]
    },
    {
      title: "Drift & terraform import",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "DRIFT is when the real infrastructure diverges from state — someone changed a resource by hand in the console, or another process modified it. terraform plan detects drift by refreshing state against reality and showing the difference; apply then reconciles it back to what the code says (which is why manual console changes get reverted — the code is the source of truth). The DE discipline is to make changes in code, not the console, so drift stays near zero. terraform import is the flip side: bring an EXISTING resource (created manually or by another tool) under Terraform management by writing its config and importing it into state, so you can manage it going forward without recreating it — the standard way to adopt Terraform onto infrastructure that already exists. Related: moved blocks / state mv handle refactors without destroy-recreate.",
      noteLabel: "Model answer:",
      note: "\"Drift is when the real infrastructure diverges from state — someone changed a resource by hand in the console, or another process modified it.<br><br>terraform plan detects it by refreshing state against reality and showing the difference, and apply reconciles it back to what the code says. That's why manual console changes get reverted — the code is the source of truth. So my discipline is to change infra in code, not the console, keeping drift near zero.<br><br>terraform import is the other side: I bring an existing resource — created manually or by another tool — under management by writing its config and importing it into state, so I can manage it going forward without recreating it. That's how I adopt Terraform onto infrastructure that already exists.\"",
      followups: [
        "\"Someone changed a bucket setting in the console — what does the next apply do?\"",
        "\"You have 50 hand-created resources to bring under Terraform — how?\"",
        "\"How do you rename/refactor a resource without destroying it?\""
      ]
    }
  ]
},

modules: {
  intro: {
    title: "Modules & environments — reuse and DRY",
    desc: "Modules are how Terraform scales beyond a single file: package a reusable chunk of infrastructure once, call it many times. This tab covers writing and consuming modules, structuring multiple environments, and the workspaces-vs-directories debate that comes up whenever someone asks 'how do you manage dev/staging/prod?'"
  },
  cards: [
    {
      title: "Modules — package and reuse infrastructure",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A MODULE is a reusable, parameterized package of resources with defined inputs (variables) and outputs — the function of Terraform. Instead of copy-pasting the twelve resources that make up 'a governed data-lake bucket' (bucket + versioning + encryption + lifecycle + IAM policy + logging), you write it once as a module and call it wherever you need one, passing inputs. Benefits: DRY, consistency (every bucket gets the same security defaults), and a tested, reviewed unit. Modules can be local (a directory), from the public Terraform Registry (community/verified modules for common infra), or from a private registry/Git. The senior pattern: thin environment configs that just call shared modules with different inputs, so the actual infra logic lives in one reviewed place. Keep modules focused — a module per logical component, not one giant module.",
      code: "# root config just wires modules with env-specific inputs:\nmodule \"lake\" {\n  source     = \"../../modules/governed-bucket\"\n  env        = var.env\n  versioning = true\n  retention_days = var.env == \"prod\" ? 2555 : 30\n}\noutput \"lake_arn\" { value = module.lake.arn }",
      noteLabel: "Model answer:",
      note: "\"A module is a reusable, parameterized package of resources with defined inputs and outputs — Terraform's version of a function.<br><br>Instead of copy-pasting the dozen resources that make up a governed lake bucket — bucket, versioning, encryption, lifecycle, IAM, logging — I write it once as a module and call it wherever I need one, passing inputs. That gives me DRY, consistency so every bucket gets the same security defaults, and a tested reviewed unit.<br><br>Modules can be local, from the public registry, or from a private Git registry.<br><br>My pattern is thin environment configs that just call shared modules with different inputs, so the real infra logic lives in one reviewed place. And I keep modules focused — one per logical component, not a single giant module.\"",
      followups: [
        "\"When would you extract something into a module?\"",
        "\"How do modules help enforce security defaults?\"",
        "\"Where can a module's source come from?\""
      ]
    },
    {
      title: "Managing environments — workspaces vs directories",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A classic question: how do you run dev/staging/prod? Two approaches. Terraform WORKSPACES let one config have multiple named states (default, dev, prod) — cheap, but they share the same code and backend config, the env is just a state namespace, and it's easy to apply to the wrong workspace; generally discouraged for strong prod isolation. The more robust and common pattern is DIRECTORY-PER-ENVIRONMENT: separate folders (environments/dev, environments/prod) each with their own backend/state and tfvars, all calling the SAME shared modules. This gives real isolation (separate state, separate blast radius, different-sized resources per env, explicit prod), at the cost of a little duplication in the thin root configs. Tools like Terragrunt reduce that duplication. The interview-safe answer: shared modules + directory-per-env for isolation; workspaces only for lightweight, low-risk variations.",
      noteLabel: "Model answer:",
      note: "\"There are two approaches, and which I pick signals whether I've run this in production.<br><br>Workspaces give one config multiple named states — dev, prod — which is cheap, but they share the same code and backend, the environment is just a state namespace, and it's easy to apply to the wrong one. So I don't rely on them for strong prod isolation.<br><br>The robust, common pattern is a directory per environment — separate folders for dev and prod, each with its own backend, state, and tfvars, all calling the same shared modules. That gives real isolation: separate state, separate blast radius, different-sized resources per environment, and an explicit prod. The cost is a little duplication in the thin root configs, which a tool like Terragrunt reduces.<br><br>So: shared modules plus directory-per-env for isolation, and workspaces only for lightweight variations.\"",
      followups: [
        "\"Why are workspaces risky for prod isolation?\"",
        "\"How do dev and prod share logic but stay isolated?\"",
        "\"What does Terragrunt add?\""
      ]
    },
    {
      title: "Provider versioning & the dependency lock file",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Reproducibility requires pinning versions. You constrain the Terraform core version and each provider version in a required_providers block (e.g. aws ~> 5.0), so an apply next month doesn't silently pull a breaking provider release. Terraform generates a .terraform.lock.hcl DEPENDENCY LOCK FILE recording the exact provider versions and checksums resolved — you COMMIT this file (unlike state) so every teammate and CI run uses identical providers, the same way a package-lock.json pins app dependencies. Module versions are pinned too when sourced from a registry. Without pinning, 'it worked yesterday' breaks when a provider updates. The rule: pin core + provider version constraints, commit the lock file, and bump deliberately.",
      code: "terraform {\n  required_version = \"~> 1.7\"\n  required_providers {\n    aws       = { source = \"hashicorp/aws\",       version = \"~> 5.0\" }\n    databricks = { source = \"databricks/databricks\", version = \"~> 1.30\" }\n  }\n}\n# .terraform.lock.hcl (exact versions + checksums) => COMMIT this file",
      noteLabel: "Model answer:",
      note: "\"Reproducibility requires pinning versions. I constrain the Terraform core version and each provider version in a required_providers block, so an apply next month doesn't silently pull a breaking provider release.<br><br>Terraform generates a dependency lock file recording the exact provider versions and checksums it resolved, and I commit that file — unlike state — so every teammate and every CI run uses identical providers, the same way a lock file pins application dependencies.<br><br>Module versions get pinned too when they come from a registry.<br><br>Without pinning, 'it worked yesterday' breaks the moment a provider updates. So the rule is pin the core and provider constraints, commit the lock file, and bump versions deliberately.\"",
      followups: [
        "\"Do you commit .terraform.lock.hcl? Why?\"",
        "\"A provider auto-updated and broke your apply — how do you prevent that?\"",
        "\"How is the lock file like a package-lock.json?\""
      ]
    }
  ]
},

workflow: {
  intro: {
    title: "CI/CD, secrets & data-platform patterns",
    desc: "Running Terraform safely on a team is a workflow problem: plan on PR, apply on merge, keep secrets out of code and state, and enforce guardrails. This tab covers the automation and security practices, plus how it all applies to provisioning real data infrastructure — Databricks, warehouses, buckets, IAM."
  },
  cards: [
    {
      title: "Terraform in CI/CD — plan on PR, apply on merge",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Infra changes go through the same PR flow as code. The standard pipeline: on a PR, CI runs terraform fmt -check, validate, and terraform plan, posting the plan as a PR comment so reviewers see exactly what will change before approving. On merge to main, CI runs terraform apply (often gated by a manual approval for prod). CI authenticates to the cloud via short-lived credentials (OIDC federation from GitHub Actions/GitLab to the cloud — no long-lived keys), and state lives in the remote backend so CI and humans share it with locking. This gives you reviewable, audited, consistent infra changes and removes 'apply from my laptop.' Add policy-as-code (Sentinel, OPA/Conftest) to enforce rules automatically — e.g. 'no public S3 buckets', 'all resources tagged', 'only approved instance types'.",
      noteLabel: "Model answer:",
      note: "\"Infra changes go through the same PR flow as code.<br><br>On a PR, CI runs fmt-check, validate, and plan, and posts the plan as a comment so reviewers see exactly what will change before approving. On merge to main, CI runs apply, usually gated by a manual approval for prod.<br><br>CI authenticates with short-lived credentials through OIDC federation, so there are no long-lived keys, and state is in the remote backend with locking so CI and humans share it safely.<br><br>That gives me reviewable, audited, consistent changes and kills 'apply from my laptop.'<br><br>I'd also add policy-as-code with Sentinel or OPA to enforce rules automatically — no public buckets, everything tagged, only approved instance types — so guardrails aren't just review discipline.\"",
      followups: [
        "\"What runs on a PR vs on merge?\"",
        "\"How does CI authenticate to the cloud without stored keys?\"",
        "\"How do you enforce 'no public buckets' automatically?\""
      ]
    },
    {
      title: "Secrets & sensitive data — keeping them out of code and state",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Two problems: secrets in CODE and secrets in STATE. Never hardcode credentials in .tf files — pull them at run time from a secrets manager (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, Vault) via data sources, or inject as environment variables / CI secrets. The subtler issue: even if not hardcoded, a generated secret (a random DB password Terraform creates) is written to STATE in plaintext — which is exactly why state must be encrypted at rest and access-controlled, and never in Git. Mark variables/outputs sensitive = true so Terraform redacts them from plan/apply logs (note: it's redacted in output, still present in state). For a DE, this matters because you're provisioning databases, warehouse users, and service principals whose credentials would leak through careless state handling.",
      noteLabel: "Model answer:",
      note: "\"There are two problems — secrets in code and secrets in state.<br><br>I never hardcode credentials in .tf files. I pull them at run time from a secrets manager like Secrets Manager, Key Vault, or Vault through data sources, or inject them as CI secrets and environment variables.<br><br>The subtler issue is that even a generated secret — a random database password Terraform creates — is written to state in plaintext. That's exactly why state must be encrypted at rest, access-controlled, and never in Git.<br><br>I mark sensitive variables and outputs as sensitive so Terraform redacts them from logs, though they're still present in state.<br><br>This matters for a DE because I'm provisioning databases, warehouse users, and service principals whose credentials would leak through careless state handling.\"",
      followups: [
        "\"A generated DB password — where does it end up, and what's the risk?\"",
        "\"Where should the actual secret values live?\"",
        "\"What does marking an output sensitive actually do?\""
      ]
    },
    {
      title: "Provisioning the data platform — what a DE actually builds",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "This is where it comes together for a DE. Terraform providers let you provision the whole data stack as code: cloud storage (S3/GCS/ADLS buckets with encryption, lifecycle, versioning), catalogs and warehouses (Glue databases, BigQuery datasets, Snowflake databases/warehouses/roles/grants via the snowflake provider), compute (EMR/Dataproc, Databricks workspaces, clusters, cluster policies, jobs, and Unity Catalog objects via the databricks provider), orchestration (MWAA/Cloud Composer environments), streaming (Kafka/MSK, Pub/Sub topics), and — critically — IAM roles, policies, and least-privilege grants that tie it all together. Doing this in Terraform means every environment's data platform is identical, reviewed, and reproducible, and onboarding a new data domain or environment is a code change, not a week of console clicks. Even RBAC/grants (who can read which dataset) become version-controlled and auditable.",
      noteLabel: "Model answer:",
      note: "\"This is where it comes together for a DE. Terraform providers let me provision the whole stack as code.<br><br>Storage — buckets with encryption, lifecycle, and versioning. Catalogs and warehouses — Glue databases, BigQuery datasets, or Snowflake databases, warehouses, roles, and grants. Compute — Databricks workspaces, clusters, cluster policies, jobs, and Unity Catalog objects. Orchestration — managed Airflow or Composer environments. Streaming — Kafka or Pub/Sub topics. And critically the IAM roles, policies, and least-privilege grants that tie it together.<br><br>Doing this in Terraform means every environment's platform is identical, reviewed, and reproducible, and onboarding a new domain or environment is a code change, not a week of clicks.<br><br>Even RBAC — who can read which dataset — becomes version-controlled and auditable, which matters in a regulated shop.\"",
      followups: [
        "\"Name data resources you'd manage in Terraform.\"",
        "\"How does managing grants in Terraform help an audit?\"",
        "\"Why provision Databricks clusters/policies as code instead of the UI?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview Prep — Terraform / IaC questions with model answers",
    desc: "The IaC questions a DE screen actually asks, structured fundamentals → advanced. Each hides its model answer until you expand it, and ends with the follow-ups an interviewer digs with. Practice by explaining the concept and the failure mode aloud, then checking."
  },
  cards: [
    {
      title: "\"What is Terraform state and why does it matter?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "The single most important Terraform concept — and whether you know its risks.",
      noteLabel: "Model answer:",
      note: "\"State is a file mapping the resources in my code to the real objects in the cloud — their IDs and attributes.<br><br>Terraform needs it because on the next plan it must know that a given resource in my code IS this specific real resource, to compute whether to create, update, or delete. Without state it couldn't tell those apart.<br><br>It matters for two risky reasons. State can hold secrets in plaintext, like a generated password, so it must be encrypted and never committed to Git. And it's the source of truth Terraform trusts, so losing or corrupting it is a real incident.<br><br>On a team I keep it in a remote backend with locking so it's shared and safe from concurrent applies.\"",
      followups: [
        "\"Why can't Terraform work without state?\"",
        "\"What are the two big risks with state?\"",
        "\"Where should state live for a team?\""
      ]
    },
    {
      title: "\"How do you manage state for a team so two applies don't collide?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Remote backends and locking — the practical team requirement.",
      noteLabel: "Model answer:",
      note: "\"I use a remote backend instead of local state — S3, GCS, Azure Blob, or Terraform Cloud — so state is shared, durable, and encrypted.<br><br>The key piece is locking: with something like an S3 backend plus a DynamoDB lock table, only one apply can run at a time. A second apply waits or fails rather than racing and corrupting state.<br><br>I also split state by environment and component, so dev and prod are isolated and a mistake has a small blast radius.<br><br>And I commit the dependency lock file so everyone resolves identical provider versions. Remote backend, locking, and split state are the baseline for any real team setup.\"",
      followups: [
        "\"What provides the lock in the S3 backend pattern?\"",
        "\"Why split state per environment?\"",
        "\"What happens to the second apply while one is running?\""
      ]
    },
    {
      title: "\"Declarative vs imperative, and what does idempotent mean here?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "The core conceptual model behind Terraform.",
      noteLabel: "Model answer:",
      note: "\"Imperative means writing the steps — a script of CLI commands that create resources — which you can't safely re-run, because running it twice tries to create things that already exist.<br><br>Declarative means I describe the desired end state, and Terraform figures out the actions to reach it by diffing that against current state. It creates what's missing, updates what changed, and leaves what already matches.<br><br>That's what idempotent means: applying the same config repeatedly converges to the same result — a second apply with no code change does nothing. That safety to re-run is the whole point, and it's why declarative infra scales where re-running a bash script doesn't.\"",
      followups: [
        "\"Why can't you safely re-run an imperative provisioning script?\"",
        "\"What does a second apply with no changes do?\"",
        "\"How does Terraform decide what actions to take?\""
      ]
    },
    {
      title: "\"How do you handle multiple environments (dev/staging/prod)?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Whether you've actually structured a real project — workspaces vs directories, and modules.",
      noteLabel: "Model answer:",
      note: "\"I use shared modules plus a directory per environment.<br><br>The infrastructure logic lives once in modules — a governed bucket, a Databricks workspace, a warehouse. Then each environment is a thin folder with its own backend, state, and tfvars that calls those modules with different inputs, like smaller compute in dev and full retention in prod.<br><br>That gives real isolation: separate state, separate blast radius, and an explicit prod I can't apply to by accident.<br><br>I avoid leaning on workspaces for prod isolation, because they share code and backend and it's easy to target the wrong one. For heavy multi-env duplication I'd reach for Terragrunt.\"",
      followups: [
        "\"Why not just use workspaces for prod?\"",
        "\"How do dev and prod differ but share logic?\"",
        "\"Where does the actual infra logic live?\""
      ]
    },
    {
      title: "\"You have 50 resources someone created by hand. Bring them under Terraform.\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "terraform import and the adoption story — a real migration task.",
      noteLabel: "Model answer:",
      note: "\"I adopt them with terraform import rather than recreating anything.<br><br>For each existing resource I write the matching Terraform configuration, then import it into state so Terraform maps the code to the real object. After importing, I run plan and confirm it shows no changes — that tells me my config faithfully matches reality. If plan wants to change something, I fix the config until it's a clean no-op.<br><br>For fifty resources I'd script the imports and lean on tooling — import blocks in newer Terraform can generate configuration to speed this up.<br><br>The goal is zero-downtime adoption: nothing is destroyed or recreated, they just come under management so future changes go through code.\"",
      followups: [
        "\"After importing, what should plan show, and why?\"",
        "\"What if plan wants to change the imported resource?\"",
        "\"How do you avoid destroying anything during adoption?\""
      ]
    },
    {
      title: "\"The plan shows your prod database will be destroyed and recreated. What now?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Plan-reading discipline and protecting stateful resources — where data loss actually happens.",
      noteLabel: "Model answer:",
      note: "\"I stop and do not apply.<br><br>A destroy-and-recreate on a database means data loss, so first I read the plan to find WHY — usually a change to an immutable, force-new attribute like the engine, name, or a subnet that can't be updated in place.<br><br>Then I find a non-destructive path: change the attribute another way, use create_before_destroy if a replacement is truly needed and the data can migrate, or handle it out-of-band with a snapshot and restore. I'd put prevent_destroy in the resource's lifecycle so an accidental destroy is blocked outright.<br><br>The broader lesson is that this is exactly why I always read the plan before apply, and why guarding stateful resources with lifecycle rules matters.\"",
      followups: [
        "\"What kinds of changes force a destroy-and-recreate?\"",
        "\"How does prevent_destroy help, and what's its limit?\"",
        "\"When is create_before_destroy the right tool?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What makes Terraform 'declarative' rather than 'imperative'?",
    options: [
      "It uses YAML",
      "You describe the desired end state and Terraform computes the create/update/delete actions to reach it — so applies are idempotent",
      "It runs CLI commands in order",
      "It only works on AWS"
    ],
    correct: 1
  },
  {
    q: "What is the Terraform state file?",
    options: [
      "A log of past commands",
      "A mapping between the resources in your code and the real cloud objects (IDs/attributes) that Terraform diffs against on each plan",
      "The provider plugin binary",
      "A backup of your .tf files"
    ],
    correct: 1
  },
  {
    q: "Should you commit terraform.tfstate to Git?",
    options: [
      "Yes, always",
      "No — it can contain plaintext secrets and must live in a secure remote backend, not version control",
      "Only for prod",
      "Only if encrypted with gpg"
    ],
    correct: 1
  },
  {
    q: "Two engineers run terraform apply at the same time. What prevents state corruption?",
    options: [
      "Nothing — Terraform can't handle this",
      "State locking via a remote backend (e.g. S3 + DynamoDB lock table) so only one apply runs at a time",
      "Running fmt first",
      "Committing state to Git"
    ],
    correct: 1
  },
  {
    q: "Which command previews changes without modifying any infrastructure?",
    options: [
      "terraform apply",
      "terraform plan — a dry run showing what will be created, changed, or destroyed",
      "terraform init",
      "terraform destroy"
    ],
    correct: 1
  },
  {
    q: "Someone changed a bucket setting by hand in the console (drift). What does the next terraform apply do?",
    options: [
      "Keeps the manual change",
      "Reconciles it back to what the code declares — the code is the source of truth",
      "Deletes the bucket",
      "Nothing — Terraform ignores console changes"
    ],
    correct: 1
  },
  {
    q: "You have 50 hand-created resources to manage with Terraform without recreating them. Best approach?",
    options: [
      "Delete and recreate them all via Terraform",
      "Write matching config and terraform import each into state, then confirm plan shows no changes",
      "Copy the console settings into a spreadsheet",
      "It can't be done"
    ],
    correct: 1
  },
  {
    q: "How should you manage dev/staging/prod for strong isolation?",
    options: [
      "One workspace switched between envs",
      "Shared modules + a directory per environment (separate backend/state/tfvars each) for real isolation and blast-radius control",
      "One giant main.tf with if-statements",
      "A separate Git repo per resource"
    ],
    correct: 1
  },
  {
    q: "Do you commit the .terraform.lock.hcl dependency lock file?",
    options: [
      "No — it's like state",
      "Yes — it pins exact provider versions/checksums so every teammate and CI run resolves identical providers",
      "Only in CI",
      "It doesn't exist"
    ],
    correct: 1
  },
  {
    q: "The plan shows your prod database will be destroyed and recreated. First move?",
    options: [
      "Apply — Terraform knows best",
      "Do NOT apply; investigate the force-new attribute causing it, find a non-destructive path, and guard the resource with lifecycle prevent_destroy",
      "Delete the state file",
      "Run apply with -auto-approve"
    ],
    correct: 1
  }
];
