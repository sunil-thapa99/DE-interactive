// Content data for the AWS Certified Cloud Practitioner (CLF-C02) exam-prep module.
const MODULE_ID = "aws-ccp";
const CONTENT = {

overview: {
  intro: {
    title: "AWS Certified Cloud Practitioner (CLF-C02) — Exam Overview",
    desc: "This tab covers exam logistics, registration, scoring, study strategy, and exam-day mechanics. It does not cover AWS technical content — use the Cloud Concepts, Security, Infra, Services, and Billing tabs for that, then use the Mock Exam tab to validate readiness."
  },
  cards: [
    {
      title: "Exam Format",
      badge: "logistics",
      conceptLabel: "What to know:",
      concept: "65 questions total, 90 minutes, scored on a scale of 100-1000, with a passing score of 700. Two question formats appear: multiple choice (select 1 correct answer from 4 options) and multiple response (select 2 correct answers from 5+ options).",
      navLabel: "Why it matters:",
      nav: "Time management matters: 90 minutes for 65 questions is about 1.3 minutes per question, and unanswered questions are scored as incorrect, so every question should get an answer before time runs out.",
      noteLabel: "Remember:",
      note: "On multiple-response questions, you must select every correct choice. There is no partial credit. Get 2 of 3 right and the whole answer counts as wrong."
    },
    {
      title: "Domain Weightings",
      badge: "logistics",
      conceptLabel: "What to know:",
      concept: "The exam is split into 4 domains: Cloud Concepts (24%), Security and Compliance (30%), Cloud Technology and Services (34%), and Billing, Pricing, and Support (12%).",
      navLabel: "Why it matters:",
      nav: "Security and Cloud Technology/Services together make up 64% of the exam — prioritize study time there, but don't ignore Billing/Support just because it's the smallest slice, since a few easy points can be the difference between pass and fail.",
      noteLabel: "Remember:",
      note: "Check the current domain weightings on the official AWS exam guide before you book. AWS updates these guides between versions."
    },
    {
      title: "How to Register",
      badge: "logistics",
      conceptLabel: "What to know:",
      concept: "Create or use an AWS Certification account (via aws.training / the AWS Certification portal) to schedule the exam. The exam itself is delivered through Pearson VUE, either at a physical testing center or via online proctoring from your own location.",
      navLabel: "Why it matters:",
      nav: "Online proctored exams offer flexibility but have stricter environment requirements (see the exam-day card below); testing centers are more predictable but require travel and adherence to their ID/arrival policies.",
      noteLabel: "Remember:",
      note: "Check the current price and available languages on the official AWS exam guide before you book. These details change over time."
    },
    {
      title: "Prerequisites",
      badge: "logistics",
      conceptLabel: "What to know:",
      concept: "There are no official prerequisites or required certifications to sit for CLF-C02. AWS recommends around 6 months of exposure to the AWS Cloud in any capacity — even just reading documentation or experimenting in the AWS Free Tier counts.",
      navLabel: "Why it matters:",
      nav: "This is an entry-level, non-technical certification. It tests conceptual understanding and awareness of services, not hands-on configuration skill.",
      noteLabel: "Remember:",
      note: "You do not need hands-on production experience to pass. Familiarity from reading and light experimenting is enough, as long as you pair it with structured study."
    },
    {
      title: "How to Use This Module",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "Work through the domain tabs in order — Cloud Concepts, then Security, Infra, Services, and Billing — reading each once fully before moving on.",
      navLabel: "Why it matters:",
      nav: "The domains build on each other conceptually (e.g., Security concepts like shared responsibility reappear when discussing specific services), so sequencing matters more than jumping around.",
      noteLabel: "Remember:",
      note: "Do not skip straight to the Mock Exam tab. It works best after you have built a foundation. It is not a substitute for one."
    },
    {
      title: "Cheat Sheet + Mock Exam Loop",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "After completing the domain tabs, use the Service Cheat Sheet tab for rapid-recall review of service names and purposes, then take the Mock Exam tab repeatedly.",
      navLabel: "Why it matters:",
      nav: "Aim to consistently score 80%+ on mock exams before scheduling the real thing — this margin accounts for exam-day nerves and question phrasing you haven't seen before.",
      noteLabel: "Remember:",
      note: "Treat every missed mock question as a signal. Go back and re-read that specific domain tab. Do not just note the wrong answer and move on."
    },
    {
      title: "Trap Pattern: Service Selection Over Definitions",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "The real exam tests your ability to pick the RIGHT service for a scenario far more often than it asks you to define a service in isolation.",
      navLabel: "Why it matters:",
      nav: "When reading a scenario question, always ask: 'what is the requirement actually driving this decision?' — is it cost, compliance, latency, or durability? The correct answer is the one that satisfies that specific driver.",
      noteLabel: "Remember:",
      note: "Watch how you are choosing. If you are picking the service that sounds most powerful instead of the one that fits the stated requirement, re-read the question."
    },
    {
      title: "Trap Pattern: Shared Responsibility Model",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "Questions invoking the shared responsibility model appear throughout the exam, not just in the Security domain.",
      navLabel: "Why it matters:",
      nav: "Whenever a question describes a task or failure, ask 'who manages this specific layer — AWS or the customer?' This single question resolves most shared-responsibility traps quickly.",
      noteLabel: "Remember:",
      note: "AWS handles security OF the cloud. That covers infrastructure, hardware, and the internals of managed services.<br><br>The customer handles security IN the cloud. That covers data, access management, and configuration."
    },
    {
      title: "Trap Pattern: Look-Alike Services",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "The exam frequently uses distractor answers built from services that sound similar but serve different purposes: CloudWatch vs CloudTrail vs Config vs Trusted Advisor; SQS vs SNS vs EventBridge; Reserved Instances vs Savings Plans vs Spot Instances.",
      navLabel: "Why it matters:",
      nav: "These groupings are tested specifically because they're easy to confuse — expect at least a few questions built entirely around telling two similar-sounding services apart.",
      noteLabel: "Remember:",
      note: "The Service Cheat Sheet tab groups these look-alike services together on purpose. Review those groupings right before your exam."
    },
    {
      title: "Trap Pattern: Don't Overthink It",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "CLF-C02 is intentionally non-technical and conceptual — it does not require deep hands-on configuration knowledge.",
      navLabel: "Why it matters:",
      nav: "If answering a question seems to require detailed hands-on config expertise, you are probably overanalyzing it. The simpler, higher-level answer is usually correct.",
      noteLabel: "Remember:",
      note: "Torn between a simple conceptual answer and a complex technical one? Lean toward the simple one. This exam rewards broad awareness, not deep implementation skill."
    },
    {
      title: "Exam-Day Mechanics",
      badge: "exam-day",
      conceptLabel: "What to know:",
      concept: "Bring a valid government-issued photo ID (testing centers typically require two forms of ID — know the specific two-ID rule for your test center). Arrive early. If taking the exam online proctored, expect a clear desk/room scan, and you'll need stable internet and a working webcam.",
      navLabel: "Why it matters:",
      nav: "No notes, phone, or reference material of any kind is allowed in either format. Testing centers provide a scratchpad or whiteboard for calculations/notes during the exam.",
      noteLabel: "Remember:",
      note: "For online proctored exams, scan your desk and room carefully and follow the instructions before you start. Failing the room scan can delay or disqualify your session."
    },
    {
      title: "Time Management During the Exam",
      badge: "exam-day",
      conceptLabel: "What to know:",
      concept: "90 minutes for 65 questions works out to roughly 1.3 minutes per question on average.",
      navLabel: "Why it matters:",
      nav: "Use a flag-and-skip strategy: if a question is taking too long, flag it for review and move on, then return to flagged questions after finishing the rest. Don't let one hard question consume time needed for several easy ones.",
      noteLabel: "Remember:",
      note: "Answer every question before time runs out, even if it is a guess. Unanswered questions are marked wrong automatically."
    },
    {
      title: "Getting Results",
      badge: "exam-day",
      conceptLabel: "What to know:",
      concept: "An unofficial pass/fail result is shown on screen immediately at the end of the exam. Official results, including a detailed score report, appear in your AWS Certification account within about 5 business days.",
      navLabel: "Why it matters:",
      nav: "Passing earns a digital badge (shareable on profiles/resumes), a discount voucher toward your next AWS certification exam, and access to the AWS re/Post community.",
      noteLabel: "Remember:",
      note: "Check the current voucher discount and how long it stays valid on the official AWS certification benefits page. These terms can change."
    },
    {
      title: "If You Don't Pass",
      badge: "exam-day",
      conceptLabel: "What to know:",
      concept: "There is a mandatory 14-day waiting period before you can retake the exam after a failed attempt.",
      navLabel: "Why it matters:",
      nav: "Use the waiting period productively: review your score report's per-domain performance breakdown to identify exactly which domains were weakest, then focus re-study on this module's corresponding tabs before retaking.",
      noteLabel: "Remember:",
      note: "The official score report gives a per-domain breakdown, not just a pass or fail. Use it to target your study instead of re-reading everything equally."
    },
    {
      title: "Verify These Numbers Right Before You Book",
      badge: "logistics",
      conceptLabel: "What to know:",
      concept: "A handful of facts in this module are explicitly called out as 'verify before scheduling' rather than hardcoded, because AWS updates them periodically: current exam price, available exam languages, the exact discount percentage and validity period on the post-pass certification voucher, and the precise Free Tier quotas (e.g. which instance types and how many hours/GB are included this year).",
      navLabel: "Why it matters:",
      nav: "These are logistics facts, not exam content — getting them wrong doesn't cost you exam points, but it can cost you money or a scheduling surprise (e.g. assuming a discount that's since changed, or a Free Tier limit that's been revised).",
      noteLabel: "Remember:",
      note: "Check the official AWS Certification exam guide and the AWS Free Tier page for current figures. Do this in the week you actually book. Do not rely on an older number from memory."
    },
    {
      title: "Well-Architected Framework Lenses (Out of Scope, but Know the Name)",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "Beyond the six core pillars (covered in depth on the Cloud Concepts tab), AWS publishes 'Lenses' that apply the framework to specific workload types — e.g. the Serverless Lens, SaaS Lens, Machine Learning Lens, and others. These add workload-specific guidance on top of the six pillars.",
      navLabel: "Why it matters:",
      nav: "Lenses are NOT part of the CLF-C02 exam guide and are very unlikely to be tested directly — this card exists so you recognize the term if you see it in AWS documentation and don't mistake it for a required exam topic.",
      noteLabel: "Remember:",
      note: "You do not need to study individual Lenses for this exam. Know the six pillars cold. Just know that a 'Lens' is a specialized application of those pillars."
    },
    {
      title: "Get Hands-On Before the Exam, Even Briefly",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "This module is intentionally conceptual, matching how CLF-C02 itself is tested — but spending even 20-30 minutes clicking through the real AWS Console (using the Free Tier) on EC2, S3, IAM, and the Billing Dashboard turns abstract vocabulary into something you've actually seen.",
      navLabel: "Why it matters:",
      nav: "Scenario questions read faster and feel more concrete once you've seen the actual EC2 launch wizard, an S3 bucket's storage-class dropdown, or the IAM policy JSON editor with your own eyes — it's a small time investment with an outsized confidence payoff.",
      noteLabel: "Remember:",
      note: "You do not need a real project. Twenty minutes of curious clicking in the Free Tier console is enough exposure for this exam."
    },
    {
      title: "Exam Languages and Accessibility Accommodations",
      badge: "logistics",
      conceptLabel: "What to know:",
      concept: "AWS offers CLF-C02 in multiple languages beyond English (availability varies and changes over time), and Pearson VUE supports accessibility accommodations (e.g. extended time, sign language interpreters, assistive technology) for candidates who request them in advance through the AWS Certification account.",
      navLabel: "Why it matters:",
      nav: "If either applies to you, request it well before your target exam date — accommodation requests and non-English language selection both go through a review/setup process that isn't instant.",
      noteLabel: "Remember:",
      note: "This only matters if you need a non-English exam or an accommodation. If it applies to you, check the current language options and the accommodation request process on the official AWS certification accessibility page."
    },
    {
      title: "Supplement With Official AWS Practice Resources",
      badge: "strategy",
      conceptLabel: "What to know:",
      concept: "This module's Mock Exam tab is one practice source among several worth using. AWS Skill Builder offers an official practice exam (paid) written by AWS's own exam team, and AWS re:Post has community-driven Q&A and discussion threads on CLF-C02 topics.",
      navLabel: "Why it matters:",
      nav: "AWS's own practice exam is the closest available proxy for the real question-writing style and phrasing quirks — doing at least one official practice exam in addition to this module's mock exam reduces the chance of being surprised by phrasing on test day.",
      noteLabel: "Remember:",
      note: "Use this module to build and check your knowledge first. Then use AWS Skill Builder's official practice exam as a final calibration check closer to your test date."
    }
  ]
},

concepts: {
  intro: {
    title: "Domain 1: Cloud Concepts (~24% of exam)",
    desc: "Covers the definition of cloud computing, the six advantages AWS markets, deployment and service models, the Well-Architected Framework's six pillars, cloud economics, and the AWS Global Infrastructure. This domain is conceptual and vocabulary-heavy — exam questions test whether you can match a scenario to the right term, not calculations."
  },
  cards: [
    {
      title: "What Is Cloud Computing?",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "Cloud computing is the on-demand delivery of IT resources (compute, storage, databases, networking) over the internet with pay-as-you-go pricing, instead of buying, owning, and maintaining physical data centers and servers. AWS defines three deployment models (public, private, hybrid) and lets you provision resources in seconds rather than weeks. The core shift is from a capital-intensive, fixed-capacity model to an elastic, consumption-based model.",
      navLabel: "Exam angle:",
      nav: "Questions describe a scenario (e.g., a startup wants to avoid buying servers) and ask which cloud characteristic applies. 'Pay only for what you use' and 'no upfront hardware investment' are the most common correct-answer phrasings.",
      noteLabel: "Remember:",
      note: "Cloud means IT resources you get on demand and provision yourself over the internet. You pay based on what you consume.",
      followups: [
        "A company wants to eliminate the need to forecast server capacity years in advance — which cloud advantage does this describe?",
        "Which is NOT a characteristic of cloud computing: (a) pay-as-you-go, (b) on-demand self-service, (c) long-term hardware ownership, (d) rapid elasticity?"
      ]
    },
    {
      title: "Six Advantages of Cloud Computing",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "AWS's official list: (1) Trade capital expense for variable expense — pay for computing resources as you consume them instead of investing heavily in data centers before knowing how you'll use them. (2) Benefit from massive economies of scale — AWS aggregates usage from hundreds of thousands of customers to achieve higher economies of scale, which translates into lower pay-as-you-go prices. (3) Stop guessing capacity — no more idle resources or capacity constraints; scale based on actual demand. (4) Increase speed and agility — new IT resources are available in minutes. (5) Stop spending money running and maintaining data centers — focus on projects that differentiate your business, not infrastructure racking/stacking/powering. (6) Go global in minutes — deploy applications in multiple AWS Regions around the world with a few clicks, providing lower latency and better experience for customers globally.",
      navLabel: "Exam angle:",
      nav: "Exam gives a business scenario and asks 'which advantage of cloud computing does this represent?' Learn to recognize each by paraphrase — e.g., 'no longer need to buy servers upfront' = capex to opex; 'launch in Japan and Australia in an afternoon' = go global in minutes.",
      noteLabel: "Remember:",
      note: "The six advantages, in short: trade capex for opex, gain economies of scale, stop guessing capacity, gain speed and agility, stop managing data centers, and go global in minutes.",
      followups: [
        "A company reduces its server fleet costs by benefiting from AWS's aggregated purchasing power across all customers — which advantage is this?",
        "A retailer over-provisioned servers for a holiday sale that never arrived, wasting money on idle capacity — which advantage of cloud computing solves this going forward?",
        "Which advantage best describes a company deploying its app to a new AWS Region in Singapore within the same day to serve APAC customers?"
      ]
    },
    {
      title: "Cloud Deployment Models",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "Public cloud: resources deployed entirely in the cloud, all infrastructure runs on the cloud provider (e.g., a SaaS app fully hosted on AWS). Private cloud (on-premises/'cloud in a private data center'): resources deployed on-premises using virtualization and resource-management tools, sometimes called 'private cloud' — used when workloads can't move (regulatory, latency). Hybrid cloud: connects cloud-based resources to on-premises infrastructure — e.g., using AWS Direct Connect or VPN to extend a data center into AWS, common during migration or when some data must stay on-premises. Multi-cloud: an architecture strategy using services from more than one cloud provider (e.g., AWS plus Azure) — not an official AWS deployment model term on the exam guide but appears as a distractor.",
      navLabel: "Exam angle:",
      nav: "Given a scenario like 'a company keeps sensitive data on-premises but bursts compute to AWS during peak load,' the answer is hybrid. 'Company has no on-prem infrastructure at all' is public cloud.",
      noteLabel: "Remember:",
      note: "Public means everything runs in the cloud. Private means everything runs on-premises. Hybrid connects the two.",
      followups: [
        "A hospital must keep patient records on-premises for compliance but wants to run analytics in AWS — which deployment model?",
        "A company has zero physical servers and runs 100% of its infrastructure on AWS — which deployment model?"
      ]
    },
    {
      title: "Cloud Computing Models: IaaS, PaaS, SaaS",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "Infrastructure as a Service (IaaS) provides the basic building blocks — compute, storage, networking — giving maximum flexibility and control; you manage the OS and above (example: Amazon EC2, Amazon VPC, Amazon EBS). Platform as a Service (PaaS) removes the need to manage underlying infrastructure (OS, patching) so you focus on deployment and management of your applications (example: AWS Elastic Beanstalk, AWS Lambda). Software as a Service (SaaS) is a complete product run and managed by the service provider — you just use the software (example: Amazon Chime, Amazon QuickSight, Gmail/Salesforce as general SaaS examples). The responsibility for managing components decreases as you move from IaaS → PaaS → SaaS.",
      navLabel: "Exam angle:",
      nav: "Exam gives an AWS service name and asks which model it fits, or gives a description ('I don't want to manage servers, just deploy code') and asks for the model (PaaS/Lambda). A frequent trap: EC2 is IaaS even though it's 'in the cloud' — because you still manage the OS.",
      noteLabel: "Remember:",
      note: "IaaS is EC2, where you manage the OS and up. PaaS is Elastic Beanstalk or Lambda, where you manage only the app. SaaS is QuickSight or Chime, a fully managed product you just use.",
      followups: [
        "A developer wants to upload code and have AWS handle scaling, patching, and OS management automatically — which model and which service exemplifies it?",
        "Which AWS service is the clearest example of SaaS: EC2, Elastic Beanstalk, or Amazon Chime?",
        "A company needs full control over the guest OS for compliance reasons — should they choose IaaS, PaaS, or SaaS?"
      ]
    },
    {
      title: "Well-Architected Framework: Operational Excellence & Security",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "The AWS Well-Architected Framework has 6 pillars for evaluating architectures. Operational Excellence: the ability to run and monitor systems to deliver business value and continually improve supporting processes/procedures; design principle — perform operations as code (automate), make frequent small reversible changes, refine operations procedures frequently, anticipate failure, and learn from operational failures. Security: the ability to protect data, systems, and assets to take advantage of cloud technologies to improve your security; design principle — implement a strong identity foundation (least privilege), enable traceability, apply security at all layers, automate security best practices, protect data in transit and at rest, keep people away from data (reduce/eliminate direct access), and prepare for security events.",
      navLabel: "Exam angle:",
      nav: "Exam asks 'which pillar does this design principle belong to' or 'a company wants to automate infrastructure changes and track every deployment — which pillar?' (Operational Excellence). Least privilege / encrypting data at rest questions map to Security pillar.",
      noteLabel: "Remember:",
      note: "Operational Excellence is about running, monitoring, and improving systems through automation. Security is about protecting them with layered defense and least privilege.",
      followups: [
        "A team automates all infrastructure deployments using scripts and tracks every change — which Well-Architected pillar is this?",
        "Applying encryption to data both in transit and at rest supports which pillar?"
      ]
    },
    {
      title: "Well-Architected Framework: Reliability & Performance Efficiency",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "Reliability: the ability of a system to recover from infrastructure or service disruptions, dynamically acquire resources to meet demand, and mitigate disruptions like misconfigurations or transient network issues; design principle — automatically recover from failure, test recovery procedures, scale horizontally to increase aggregate system availability, stop guessing capacity, and manage change through automation. Performance Efficiency: the ability to use computing resources efficiently to meet system requirements and maintain efficiency as demand changes and technologies evolve; design principle — democratize advanced technologies (consume as managed services), go global in minutes, use serverless architectures, experiment more often, and consider mechanical sympathy (choose the right resource type/size for the job).",
      navLabel: "Exam angle:",
      nav: "'A company automatically replaces a failed EC2 instance without manual intervention' = Reliability. 'A company chooses a purpose-built database instead of a generic one to match workload needs' = Performance Efficiency (mechanical sympathy).",
      noteLabel: "Remember:",
      note: "Reliability is about recovering from failure and scaling to meet demand. Performance Efficiency is about picking the right resource for the job and staying efficient as technology evolves.",
      followups: [
        "A system automatically detects a failed component and replaces it without human action — which pillar?",
        "Choosing a graph database instead of a relational database because it fits the access pattern better reflects which pillar's principle of 'mechanical sympathy'?"
      ]
    },
    {
      title: "Well-Architected Framework: Cost Optimization & Sustainability",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "Cost Optimization: the ability to run systems to deliver business value at the lowest price point; design principle — implement cloud financial management, adopt a consumption model (pay only for what you use), measure overall efficiency, stop spending money on undifferentiated heavy lifting (data center operations), and analyze and attribute expenditure (tagging for cost allocation). Sustainability: the ability to minimize the environmental impacts of running cloud workloads; design principle — understand your impact and measure it, establish sustainability goals, maximize utilization, anticipate and adopt new, more efficient hardware/software offerings, use managed services (which are often shared across many customers, increasing efficiency), and reduce the downstream impact of your cloud workloads (e.g., reduce customer device/network energy use).",
      navLabel: "Exam angle:",
      nav: "Sustainability is the newest pillar (added 2021) and is frequently tested via 'minimizing environmental/carbon footprint' scenarios. Cost Optimization questions often reference Reserved Instances, Savings Plans, or rightsizing as the applied mechanism — but the pillar name itself is the concept tested here.",
      noteLabel: "Remember:",
      note: "Cost Optimization is about delivering business value at the lowest price, using a consumption model. Sustainability is about minimizing environmental impact through efficiency and managed services.",
      followups: [
        "A company tags every resource by department to track and attribute spending — which pillar?",
        "A company migrates from self-managed servers to managed services partly to reduce its carbon footprint — which pillar is the primary driver?"
      ]
    },
    {
      title: "Cloud Economics: TCO and AWS Cost Calculators",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "Total Cost of Ownership (TCO) is the estimated cost of an investment across its full lifecycle, used to compare running infrastructure on-premises versus in the cloud — it includes hidden on-premises costs like power, cooling, physical security, real estate, and IT labor, not just hardware purchase price. The AWS Pricing Calculator lets you create cost estimates for AWS services/architectures before you deploy, useful for planning and quoting solutions to customers. The AWS TCO Calculator (sometimes referenced as 'Migration Evaluator' concepts) compares the cost of a customer's current on-premises or hosting environment against running the equivalent workload on AWS, helping build the business case for migration.",
      navLabel: "Exam angle:",
      nav: "Exam distinguishes the two tools: Pricing Calculator = 'estimate cost of a planned AWS deployment/architecture'; TCO Calculator = 'compare on-premises costs to AWS costs to justify migration.' Don't confuse either with the Cost Explorer or Billing Console (those analyze costs of resources already running — Domain 4 territory).",
      noteLabel: "Remember:",
      note: "The Pricing Calculator estimates the future cost of an AWS setup. The TCO Calculator compares on-premises costs against AWS to build the case for migrating.",
      followups: [
        "A company wants to show leadership how much cheaper AWS would be than their current data center before migrating — which tool?",
        "A solutions architect wants to estimate the monthly cost of a proposed 3-tier AWS architecture — which tool?"
      ]
    },
    {
      title: "AWS Global Infrastructure: Regions",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "An AWS Region is a physical, geographically isolated location (e.g., us-east-1, eu-west-1) containing multiple, isolated Availability Zones. Regions are completely independent of each other by design, for fault isolation, stability, and compliance/data residency. Not every AWS service is available in every Region, and pricing can vary by Region. Choosing a Region depends on four factors: compliance/data governance (legal requirements to keep data within geographic boundaries), proximity/latency (choose closest to your users to reduce latency), feature/service availability (newer services roll out to select Regions first), and pricing (costs differ Region to Region).",
      navLabel: "Exam angle:",
      nav: "Exam frequently asks 'a company must keep data within the EU for GDPR — what should they consider when choosing a Region?' → compliance/data residency. Also tests that Regions are fully isolated (a failure in one Region does not affect another).",
      noteLabel: "Remember:",
      note: "Four factors drive Region choice: compliance, latency, service availability, and pricing.",
      followups: [
        "A German company must legally store customer data within Germany — what Region-selection factor is this?",
        "A US-based company wants the lowest latency for Australian users — what factor drives the Region choice?"
      ]
    },
    {
      title: "AWS Global Infrastructure: Availability Zones",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "An Availability Zone (AZ) is one or more discrete data centers with redundant power, networking, and connectivity, located within a Region. Each AZ is isolated from failures in other AZs (separate power, cooling, physical security) but connected via high-bandwidth, low-latency private networking. Each Region has a minimum of 3 AZs (AWS's stated minimum design standard). Deploying across multiple AZs within a Region is the primary mechanism for building highly available and fault-tolerant applications.",
      navLabel: "Exam angle:",
      nav: "Common trap: an AZ is NOT the same as a data center — an AZ can consist of multiple data centers. Exam tests that deploying an app across 2+ AZs (not just multiple EC2 instances in the same AZ) is what provides high availability.",
      noteLabel: "Remember:",
      note: "An AZ is one or more data centers inside a Region. Every Region has at least 3 AZs. Spread your app across AZs for high availability.",
      followups: [
        "A company runs all its EC2 instances in a single Availability Zone — what risk does this create, and what's the fix?",
        "True or false: an Availability Zone is exactly one physical data center."
      ]
    },
    {
      title: "AWS Global Infrastructure: Edge Locations, Local Zones, Wavelength, Outposts",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "Edge Locations (part of Points of Presence) are sites used by Amazon CloudFront and other edge services to cache content closer to end users, reducing latency — there are far more Edge Locations than Regions. AWS Local Zones are infrastructure deployments that place compute, storage, and select services closer to large population/industry centers, extending a Region for single-digit-millisecond latency to those metro areas. AWS Wavelength embeds AWS compute/storage at the edge of 5G telecom networks, so mobile/connected-device applications get ultra-low latency by not leaving the telecom network. AWS Outposts is a fully managed service that extends AWS infrastructure, services, and APIs to virtually any on-premises or edge location, delivering a truly consistent hybrid experience for workloads that must run on-premises (e.g., low-latency local processing or local data residency).",
      navLabel: "Exam angle:",
      nav: "Exam matches scenario to the right edge concept: 'cache video content globally' = Edge Location/CloudFront; 'run a low-latency app in Los Angeles without a full Region there' = Local Zone; 'mobile game needs ultra-low latency over 5G' = Wavelength; 'run AWS services in our own data center' = Outposts.",
      noteLabel: "Remember:",
      note: "Edge Locations do CDN caching. Local Zones give metro-area low latency. Wavelength lives at the 5G network edge. Outposts puts AWS hardware on your own premises.",
      followups: [
        "A telecom wants its 5G mobile app to have minimal latency by keeping compute inside the carrier network — which AWS offering?",
        "A company needs to run AWS services physically inside its own on-premises data center for local processing — which offering?",
        "A media company wants to cache video streams close to viewers worldwide — which infrastructure component?"
      ]
    },
    {
      title: "High Availability & Fault Tolerance",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "High availability (HA) means a system is designed to operate continuously with minimal downtime, typically achieved by removing single points of failure — e.g., running an application across multiple Availability Zones behind an Elastic Load Balancer, and using Multi-AZ for RDS. Fault tolerance goes further: the system continues operating properly even when one or more components fail, with no perceptible impact to the end user (built-in redundancy absorbs the failure entirely, vs. HA which may involve brief failover). AWS enables both through multi-AZ/multi-Region architectures, Auto Scaling, Elastic Load Balancing, and managed services with built-in redundancy (e.g., Amazon S3's built-in durability across multiple facilities).",
      navLabel: "Exam angle:",
      nav: "Exam distinguishes HA (minimize downtime, brief failover acceptable) from fault tolerance (zero perceptible disruption) — fault tolerance is the stricter, higher bar. Both are usually achieved via multi-AZ deployment, so the mechanism-question answer is often the same ('deploy across multiple AZs'), but the terminology question tests you know they're not identical.",
      noteLabel: "Remember:",
      note: "High availability means minimal downtime with quick failover. Fault tolerance means failures cause zero perceptible impact. Both rely on multiple AZs.",
      followups: [
        "A system continues serving users with absolutely no interruption even when a server fails — is this best described as HA or fault tolerant?",
        "What is the primary AWS mechanism used to achieve both high availability and fault tolerance for a web application?"
      ]
    },
    {
      title: "Elasticity & Scalability (Vertical vs Horizontal)",
      badge: "concept",
      conceptLabel: "Concept:",
      concept: "Scalability is the ability of a system to accommodate growth (increased load) by adding resources. Vertical scaling ('scaling up') means increasing the size of an existing resource — e.g., resizing an EC2 instance to a larger instance type — but has a hard ceiling and usually requires downtime/restart. Horizontal scaling ('scaling out') means adding more instances of a resource — e.g., adding more EC2 instances behind a load balancer — and is essentially limitless and typically done without downtime; this is the cloud-native preferred approach. Elasticity is the ability to automatically and dynamically acquire and release resources to match demand in near real-time (e.g., AWS Auto Scaling adding instances during a traffic spike and removing them afterward), so you pay only for what you need at any given moment — elasticity is essentially automated horizontal (or sometimes vertical) scaling tied to actual demand.",
      navLabel: "Exam angle:",
      nav: "Exam gives a scenario ('resize a single database server to have more CPU/RAM' = vertical scaling; 'add more web servers during a traffic spike, then remove them after' = elasticity/horizontal scaling + Auto Scaling) and asks you to name the concept. Elasticity is specifically about automatic, demand-driven adjustment — plain 'scalability' just means the capability to grow at all.",
      noteLabel: "Remember:",
      note: "Vertical scaling means a bigger instance, and it has a ceiling. Horizontal scaling means more instances, with no real ceiling. Elasticity means scaling up and down automatically with real-time demand.",
      followups: [
        "A company changes its single EC2 instance from m5.large to m5.4xlarge to handle more load — is this vertical or horizontal scaling?",
        "An e-commerce site automatically adds EC2 instances during a flash sale and removes them once traffic normalizes — which concept best names this behavior?",
        "Which scaling approach has an eventual hard ceiling: vertical or horizontal?"
      ]
    }
  ]
},

security: {
  intro: {
    title: "Domain 2: Security and Compliance (~30%)",
    desc: "The largest exam domain. Focus on the Shared Responsibility Model, IAM fundamentals, the core security services (GuardDuty, Inspector, Macie, Security Hub, WAF, Shield, KMS), and where to find compliance documentation (Artifact). CCP tests conceptual recognition, not hands-on configuration."
  },
  cards: [
    {
      title: "AWS Shared Responsibility Model",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "AWS is responsible for 'security OF the cloud': physical data centers, hardware, network infrastructure, and the virtualization/hypervisor layer. The customer is responsible for 'security IN the cloud': guest OS patching, network/firewall configuration (security groups, NACLs), IAM identities and permissions, data encryption, and application-level security. Both parties share responsibility, but the dividing line moves depending on the service's abstraction level. For unmanaged/IaaS services like EC2, the customer manages more (guest OS, patching). For managed/PaaS-like services like RDS, AWS manages the underlying OS and database engine patching, while the customer still manages access control and data. For serverless/SaaS-like services like Lambda or S3, AWS manages almost everything except the customer's code/data/access configuration.",
      navLabel: "Exam angle:",
      nav: "Expect a scenario naming a service (EC2, RDS, S3, Lambda) and asking who is responsible for a specific task (e.g., 'patching the OS' or 'physical security'). Trap: customers sometimes assume AWS manages IAM or data encryption configuration — AWS provides the tools (KMS, IAM) but the customer must configure and use them.",
      noteLabel: "Remember:",
      note: "AWS owns security OF the cloud, meaning the infrastructure. The customer owns security IN the cloud, meaning data, access, and configuration.",
      followups: [
        "Who patches the OS on an EC2 instance vs. an RDS instance?",
        "Does the customer manage the underlying hardware for any AWS service?",
        "For S3, what exactly is the customer responsible for?"
      ]
    },
    {
      title: "Root User Best Practices",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "The root user is created when an AWS account is opened and has unrestricted access to all resources and billing — it cannot be permission-restricted. Best practice is to never use the root user for daily tasks: enable MFA on it immediately, delete or avoid creating root access keys, and create an IAM administrator user (or use IAM Identity Center) for everyday administrative work. Root credentials should be locked away and used only for a small set of tasks that truly require root (e.g., changing account settings, closing the account, some billing/support plan changes).",
      navLabel: "Exam angle:",
      nav: "Questions often ask 'what should you do immediately after creating an AWS account' — answer: enable MFA on root, create an IAM admin user, and stop using root. Trap answers suggest creating IAM users with root-equivalent access keys for automation — wrong, use IAM roles instead.",
      noteLabel: "Remember:",
      note: "Lock the root user away. Enable MFA on it, do not create access keys for it, and use IAM for everyday work.",
      followups: [
        "What tasks specifically still require the root user?",
        "Why are long-term root access keys considered a major risk?"
      ]
    },
    {
      title: "IAM Users, Groups, and Roles",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "IAM Users represent individual people or applications with long-term credentials (password and/or access keys). IAM Groups are collections of users used to apply policies collectively (a user can belong to multiple groups; groups cannot be nested). IAM Roles are identities with temporary credentials that can be assumed by users, applications, or AWS services — no long-term password or access key is stored. Roles are preferred over long-term credentials whenever possible: EC2 instances should use instance roles (not embedded access keys) to call other AWS services, cross-account access should use roles rather than sharing credentials, and federated users (e.g., corporate directory via SAML, or mobile app users via web identity federation) assume roles rather than getting IAM user accounts.",
      navLabel: "Exam angle:",
      nav: "Classic scenario: 'An application on EC2 needs to access S3 — what is the best practice?' Answer: attach an IAM role to the EC2 instance. Trap answers: hardcoding access keys in the app, or creating an IAM user for the EC2 instance — both violate best practice.",
      noteLabel: "Remember:",
      note: "Roles hand out temporary credentials that identities assume. Prefer them for EC2, cross-account access, and federation.",
      followups: [
        "Why shouldn't you embed access keys in application code on EC2?",
        "What is the difference between a role and a group?",
        "Give an example of cross-account access using roles."
      ]
    },
    {
      title: "IAM Policies: Structure and Types",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "IAM policies are JSON documents with a Statement array; each statement has an Effect (Allow/Deny), Action (the API calls permitted/denied, e.g., s3:GetObject), Resource (the ARN(s) the statement applies to), and optionally Condition (e.g., restrict by IP range, MFA presence, or time). Policies can be identity-based (attached to a user, group, or role) or resource-based (attached to a resource itself, e.g., an S3 bucket policy, allowing cross-account or public access grants). Policies can be AWS managed (created and maintained by AWS, e.g., AmazoS3ReadOnlyAccess), customer managed (created by the customer, reusable across multiple identities), or inline (embedded directly in a single user/group/role, not reusable). By default IAM denies everything; an explicit Deny always overrides any Allow.",
      navLabel: "Exam angle:",
      nav: "Expect to identify the effect of a policy from a snippet, or to know that an explicit Deny beats an Allow. Trap: confusing resource-based policies (e.g., S3 bucket policy granting another account access) with identity-based policies.",
      noteLabel: "Remember:",
      note: "A policy statement has four parts: Effect, Action, Resource, and Condition. An explicit Deny always wins.",
      followups: [
        "What's the difference between a managed policy and an inline policy?",
        "When would you use a resource-based policy instead of an identity-based one?"
      ]
    },
    {
      title: "Principle of Least Privilege & MFA",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "Least privilege means granting only the permissions required to perform a specific task, nothing more, and expanding access only as needed rather than starting broad. Multi-Factor Authentication (MFA) adds a second authentication factor (e.g., a virtual MFA device or hardware token) beyond a password, and should be enabled on the root user and ideally all IAM users, especially privileged ones. AWS IAM Access Analyzer helps identify resources shared with external entities and can validate policies against least-privilege best practices before deployment.",
      navLabel: "Exam angle:",
      nav: "'Least privilege' is a direct vocabulary term the exam tests — recognize it as the correct answer to 'how should permissions be granted.' MFA questions often pair with root user security.",
      noteLabel: "Remember:",
      note: "Grant only the access that is truly needed. MFA adds a second factor on top of the password.",
      followups: [
        "What does IAM Access Analyzer actually check for?",
        "Why is starting with broad permissions and narrowing later considered bad practice?"
      ]
    },
    {
      title: "IAM Identity Center (successor to AWS SSO)",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "AWS IAM Identity Center (formerly AWS Single Sign-On) provides centralized access management across multiple AWS accounts and business applications, integrating with an organization's existing identity source (e.g., Microsoft Active Directory, or a built-in identity store) so users sign in once to access multiple accounts/apps without separate IAM user credentials per account. It's the recommended way to manage human user access at scale within AWS Organizations, replacing the need to create individual IAM users in every member account.",
      navLabel: "Exam angle:",
      nav: "Exam may still reference the old name 'AWS SSO' — know it's the same service, now IAM Identity Center. Tested as the answer for 'centralized workforce access across multiple AWS accounts.'",
      noteLabel: "Remember:",
      note: "IAM Identity Center gives single sign-on across multiple AWS accounts and apps. It was formerly called AWS SSO.",
      followups: []
    },
    {
      title: "AWS Organizations: Service Control Policies (SCPs)",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "AWS Organizations lets you centrally manage multiple AWS accounts, grouped into Organizational Units (OUs). Service Control Policies (SCPs) are guardrails applied at the account or OU level that set the maximum available permissions for all IAM users and roles within affected accounts — SCPs never grant permissions by themselves, they only restrict what IAM policies within the account can allow. This differs from IAM policies, which are attached to individual identities/resources and can grant permissions directly. Even an account's root user is bound by SCPs. Consolidated Billing under Organizations also enables volume pricing discounts and a single payment method across accounts.",
      navLabel: "Exam angle:",
      nav: "Key distinction tested: SCPs set boundaries/maximum permissions (restrict only) and apply org-wide; IAM policies grant actual permissions to identities. Trap: thinking an SCP can grant access — it cannot, it can only limit.",
      noteLabel: "Remember:",
      note: "SCPs are guardrails that cap the maximum permissions across the organization. They never grant permissions on their own.",
      followups: [
        "Can an SCP grant a permission that no IAM policy grants?",
        "What is Consolidated Billing and why do organizations use it?"
      ]
    },
    {
      title: "AWS CloudTrail",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "CloudTrail logs API calls and account activity across AWS services — who did what, when, and from where (the identity, timestamp, source IP, request/response). It is enabled by default for the last 90 days of management events (event history), and you can create a Trail to deliver logs continuously to an S3 bucket for long-term retention and analysis. CloudTrail is primarily for auditing, governance, compliance, and operational/security troubleshooting — answering 'who made this change.'",
      navLabel: "Exam angle:",
      nav: "If a question asks 'who deleted this resource' or 'how do I audit API activity,' the answer is CloudTrail. Don't confuse with CloudWatch (performance/operational monitoring) or Config (compliance/configuration tracking).",
      noteLabel: "Remember:",
      note: "CloudTrail tells you who did what. It is your API activity audit log.",
      followups: []
    },
    {
      title: "AWS Config",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "AWS Config records and tracks configuration changes to AWS resources over time, providing a detailed inventory and configuration history/timeline. It evaluates resource configurations against desired rules (Config Rules) to assess compliance (e.g., 'is encryption enabled on all EBS volumes,' 'are all S3 buckets non-public'), and can trigger notifications or remediation when resources drift out of compliance. It answers 'what did this resource look like at a point in time' and 'is my environment compliant with internal policy.'",
      navLabel: "Exam angle:",
      nav: "Distinguish from CloudTrail: Config = configuration state/compliance over time; CloudTrail = API call history. A scenario about 'tracking resource configuration changes for compliance' = Config.",
      noteLabel: "Remember:",
      note: "Config tracks resource configuration compliance and change history over time.",
      followups: []
    },
    {
      title: "Amazon GuardDuty",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "GuardDuty is a managed threat detection service that continuously monitors for malicious activity and unauthorized behavior using machine learning, anomaly detection, and threat intelligence feeds, analyzing sources like VPC Flow Logs, DNS logs, and CloudTrail event logs. It requires no agents to deploy and generates findings such as compromised credentials, cryptocurrency mining, or command-and-control communication from an EC2 instance.",
      navLabel: "Exam angle:",
      nav: "'Intelligent threat detection' or 'continuously monitors for malicious activity' = GuardDuty. Trap: confusing with Inspector (vulnerability scanning of resources) or Macie (sensitive data discovery).",
      noteLabel: "Remember:",
      note: "GuardDuty is intelligent threat detection. It analyzes your logs for malicious activity.",
      followups: []
    },
    {
      title: "Amazon Inspector, Macie, and Security Hub",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "Amazon Inspector automatically scans EC2 instances, container images (ECR), and Lambda functions for software vulnerabilities and unintended network exposure, producing a risk score for prioritization. Amazon Macie uses machine learning and pattern matching to discover and classify sensitive data (like PII) stored in S3, alerting on exposure risk. AWS Security Hub aggregates and prioritizes security findings/alerts from multiple AWS services (GuardDuty, Inspector, Macie, Config) and third-party tools into a single dashboard, and checks against security standards/best practices (e.g., CIS AWS Foundations Benchmark).",
      navLabel: "Exam angle:",
      nav: "Match the keyword to the service: 'vulnerability scanning' = Inspector; 'sensitive data / PII discovery in S3' = Macie; 'central dashboard aggregating findings from multiple security services' = Security Hub.",
      noteLabel: "Remember:",
      note: "Inspector finds vulnerabilities. Macie finds sensitive data in S3. Security Hub is the dashboard that aggregates findings.",
      followups: [
        "Which service would you use to find PII accidentally stored in an S3 bucket?",
        "How does Security Hub relate to GuardDuty and Inspector findings?"
      ]
    },
    {
      title: "AWS WAF and AWS Shield",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "AWS WAF (Web Application Firewall) protects web applications from common exploits by filtering HTTP/HTTPS traffic based on rules (e.g., blocking SQL injection, cross-site scripting, or specific IP ranges/rate limits); it's deployed in front of CloudFront, ALB, API Gateway, or AppSync. AWS Shield provides DDoS (Distributed Denial of Service) protection: Shield Standard is automatically enabled at no extra cost for all AWS customers, protecting against common, most-frequently-occurring network/transport layer DDoS attacks. Shield Advanced is a paid service offering enhanced protection for larger/more sophisticated attacks, 24/7 access to the AWS DDoS Response Team (DRT), cost protection for scaling during an attack, and integration with WAF.",
      navLabel: "Exam angle:",
      nav: "'Protect against SQL injection/XSS on a web app' = WAF. 'Protect against DDoS' = Shield. Know Shield Standard is free/automatic; Shield Advanced is paid and adds DRT access and cost protection.",
      noteLabel: "Remember:",
      note: "WAF filters web application traffic, blocking things like SQL injection and XSS. Shield handles DDoS protection: Standard is free, Advanced is paid.",
      followups: [
        "Is Shield Standard something you have to enable, or is it automatic?",
        "What extra capability does Shield Advanced add beyond Standard?"
      ]
    },
    {
      title: "Encryption at Rest vs. In Transit, and AWS KMS",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "Encryption at rest protects data stored on disk (e.g., EBS volumes, S3 objects, RDS storage); encryption in transit protects data moving across a network (e.g., HTTPS/TLS between client and service). AWS Key Management Service (KMS) is a managed service for creating and controlling cryptographic keys used to encrypt data across AWS services (S3, EBS, RDS, etc.), supporting both AWS-managed keys and customer-managed keys (CMKs), with fine-grained access control via key policies and integration with CloudTrail for auditing key usage. Most AWS storage services support enabling encryption with a simple checkbox/setting, and KMS handles the underlying key management.",
      navLabel: "Exam angle:",
      nav: "Distinguish at-rest (stored data) from in-transit (moving data, typically via SSL/TLS). A scenario naming 'centrally manage and audit use of encryption keys' = KMS.",
      noteLabel: "Remember:",
      note: "Encryption at rest protects stored data. Encryption in transit uses SSL/TLS across the network. KMS is the managed service that creates and controls the keys.",
      followups: []
    },
    {
      title: "AWS Certificate Manager (ACM)",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "ACM provisions, manages, and automatically renews free public and private SSL/TLS certificates for use with AWS services like CloudFront, Elastic Load Balancing, and API Gateway, removing the manual overhead of purchasing, uploading, and renewing certificates. It handles encryption in transit (HTTPS) for applications hosted on AWS.",
      navLabel: "Exam angle:",
      nav: "'Free SSL/TLS certificates that auto-renew' = ACM. Often paired with ELB or CloudFront in scenario questions about enabling HTTPS.",
      noteLabel: "Remember:",
      note: "ACM gives you free SSL/TLS certificates for AWS services, and it renews them automatically.",
      followups: []
    },
    {
      title: "Secrets Manager vs. Systems Manager Parameter Store",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "AWS Secrets Manager is purpose-built for storing and managing secrets such as database credentials, API keys, and passwords, with built-in automatic rotation (including native integration for RDS credential rotation) and fine-grained IAM/resource policies; it charges per secret plus API calls. AWS Systems Manager Parameter Store stores configuration data and secrets as parameters (String, StringList, or SecureString using KMS encryption); the Standard tier is free and lacks built-in automatic rotation (rotation must be scripted), while the Advanced tier adds capacity and supports parameter policies (e.g., expiration).",
      navLabel: "Exam angle:",
      nav: "Trap: exam may ask which is more cost-effective for simple config values (Parameter Store, free Standard tier) vs. which natively auto-rotates database credentials (Secrets Manager).",
      noteLabel: "Remember:",
      note: "Secrets Manager stores secrets and rotates them automatically, and it is paid. Parameter Store stores config and secrets, has a free Standard tier, and has no built-in rotation.",
      followups: [
        "Which service would you choose for a database password that needs automatic rotation?"
      ]
    },
    {
      title: "Network Security: Security Groups vs. Network ACLs",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "Within a VPC, Security Groups act as a virtual firewall at the instance (ENI) level: they are stateful (return traffic is automatically allowed regardless of outbound rules), support only Allow rules (no explicit Deny), and evaluate all rules before deciding. Network ACLs (NACLs) operate at the subnet level: they are stateless (return traffic must be explicitly allowed by a separate rule), support both Allow and Deny rules, and are evaluated in numbered order. A public subnet typically has a route to an Internet Gateway (resources can be reached from/reach the internet); a private subnet has no direct route to an Internet Gateway, isolating resources like databases from direct internet access.",
      navLabel: "Exam angle:",
      nav: "Core distinction tested repeatedly: Security Group = stateful, instance-level, allow-only. NACL = stateless, subnet-level, allow AND deny. Public subnet = has internet gateway route; private = does not.",
      noteLabel: "Remember:",
      note: "Security groups are stateful, work at the instance level, and only allow. NACLs are stateless, work at the subnet level, and can allow or deny.",
      followups: [
        "Why must a NACL have both inbound and outbound rules for a single request/response, unlike a security group?"
      ]
    },
    {
      title: "AWS Artifact and Compliance Programs",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "AWS Artifact is a self-service portal providing on-demand access to AWS's compliance reports (e.g., SOC reports, PCI DSS attestations, ISO certifications) and the ability to review and accept agreements like the Business Associate Addendum (BAA) for HIPAA. AWS operates under a shared compliance model: AWS provides infrastructure that has been audited and certified against many compliance programs (HIPAA, PCI DSS, GDPR, SOC 1/2/3, ISO 27001, etc.), acting as a compliance enabler, but the customer remains responsible for ensuring their own application, data handling, and configuration meet the relevant compliance requirements — compliance is not automatic just because it runs on AWS.",
      navLabel: "Exam angle:",
      nav: "'Where do I download AWS's compliance reports/certifications' = AWS Artifact. Trap: assuming using AWS automatically makes a workload HIPAA/PCI compliant — the customer must still configure their environment correctly.",
      noteLabel: "Remember:",
      note: "AWS Artifact gives you compliance reports and agreements on demand. AWS enables compliance, but the customer is still responsible for their own.",
      followups: [
        "If a company needs to prove PCI DSS compliance to an auditor, where do they get AWS's attestation?"
      ]
    },
    {
      title: "AWS Trusted Advisor: Security Checks",
      badge: "security",
      conceptLabel: "Concept:",
      concept: "AWS Trusted Advisor inspects an account and provides recommendations across five categories: cost optimization, performance, security, fault tolerance, and service limits. The security category flags issues like security groups with unrestricted access (open ports), MFA not enabled on the root account, IAM use best practices, exposed access keys, and S3 bucket permissions. Full check access requires a Business or Enterprise Support plan; a limited set of core checks is available to all customers on Basic/Developer support.",
      navLabel: "Exam angle:",
      nav: "'Automated recommendations for open security groups / root MFA / exposed access keys' = Trusted Advisor security checks. Know the five categories and that full checks need Business/Enterprise support.",
      noteLabel: "Remember:",
      note: "Trusted Advisor security checks flag open security groups, missing root MFA, and exposed keys. Full checks require a Business or Enterprise support plan.",
      followups: []
    }
  ]
},

infra: {
  intro: {
    title: "Core Infrastructure: Compute, Storage, Networking, Database",
    desc: "The densest slice of Domain 3. CCP tests this almost entirely as scenario-based service selection: given a workload description, pick the right compute model, storage class, network path, or database engine. Know each service's one-line purpose, its pricing/performance lever, and how it compares to its closest sibling service."
  },
  cards: [
    {
      title: "EC2 instance type families",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "EC2 instances are grouped into families by the letter prefix: T/M = general purpose (balanced CPU/memory, web servers, dev/test), C = compute optimized (batch processing, gaming servers, HPC), R/X = memory optimized (in-memory databases, real-time big data analytics), I/D = storage optimized (high sequential read/write, data warehousing, distributed file systems), P/G/Inf = accelerated computing (GPU/ML training and inference, graphics rendering).",
      navLabel: "Exam angle:",
      nav: "CCP never asks for exact instance sizes — it asks 'which family for this workload' at the letter level. Memorize: C=compute, R=RAM/memory, I=IOPS/storage, P/G=GPU.",
      noteLabel: "Remember:",
      note: "The T-series (T3, T4g) is burstable general purpose. It is the cheapest entry point for variable, low-to-moderate CPU workloads.",
      followups: ["A workload needs an in-memory cache-like database with huge RAM — which family?", "Which family suits a genomics/ML training job needing GPUs?"]
    },
    {
      title: "EC2 pricing models",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "On-Demand: pay per second/hour, no commitment, highest unit cost — for unpredictable or short-term workloads. Reserved Instances (RIs): 1 or 3-year commitment for a specific instance type/region, up to ~72% discount — for steady-state, predictable usage. Savings Plans: commit to a $/hour spend (not instance type) for 1 or 3 years, more flexible than RIs, applies across EC2/Fargate/Lambda. Spot Instances: bid on spare capacity, up to 90% discount, can be reclaimed with 2-minute warning — for fault-tolerant, interruptible workloads.",
      navLabel: "Exam angle:",
      nav: "Classic matching question: 'batch job that can tolerate interruption' = Spot; 'steady 3-year production workload' = Reserved/Savings Plan; 'unknown/spiky traffic' = On-Demand.",
      noteLabel: "Remember:",
      note: "Spot is the cheapest option, but AWS can terminate it at any time. Never use it for stateful or non-fault-tolerant workloads.",
      followups: ["Which pricing model for a workload with a known 3-year baseline but flexibility to change instance families?", "Why is Spot unsuitable for a single-instance production database?"]
    },
    {
      title: "EC2 Auto Scaling",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "Automatically adds or removes EC2 instances in an Auto Scaling Group based on demand (target tracking, scheduled, or step scaling policies), maintaining a desired capacity between a min and max. Ensures availability during spikes and cost savings during lulls.",
      navLabel: "Exam angle:",
      nav: "Paired conceptually with Elastic Load Balancing — ASG handles 'how many instances,' ELB handles 'distribute traffic to them.'",
      noteLabel: "Remember:",
      note: "Auto Scaling is about elasticity: scaling instances out and in horizontally. It is not only about fault tolerance, though it does also replace unhealthy instances.",
      followups: []
    },
    {
      title: "Elastic Load Balancing (ALB / NLB / GWLB / CLB)",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "ELB distributes incoming traffic across multiple targets. Application Load Balancer (ALB): Layer 7 (HTTP/HTTPS), content-based routing (path/host-based rules), best for microservices/containers. Network Load Balancer (NLB): Layer 4 (TCP/UDP), ultra-high performance and static IP, best for extreme low-latency workloads. Gateway Load Balancer (GWLB): Layer 3, transparently routes traffic to third-party virtual appliances (firewalls, IDS/IPS). Classic Load Balancer (CLB): legacy, Layer 4/7, being phased out.",
      navLabel: "Exam angle:",
      nav: "Exam gives a protocol/use-case clue: 'route based on URL path' = ALB; 'millions of requests, need static IP, TCP' = NLB; 'deploy inline security appliances' = GWLB.",
      noteLabel: "Remember:",
      note: "ALB gives smart Layer 7 routing. NLB gives raw Layer 4 speed.",
      followups: ["Which load balancer type provides a static IP address?", "Which load balancer would front a fleet of intrusion-detection appliances?"]
    },
    {
      title: "AWS Lambda",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "Serverless, event-driven compute service that runs code in response to triggers (S3 uploads, API Gateway calls, DynamoDB streams, schedules) without provisioning or managing servers. Billed per invocation and execution duration (rounded to the millisecond), scales automatically, has a maximum execution timeout (15 minutes).",
      navLabel: "Exam angle:",
      nav: "Signal words 'event-driven,' 'no server management,' 'pay only when code runs,' or 'short-lived function' all point to Lambda.",
      noteLabel: "Remember:",
      note: "Lambda is not for long-running or stateful processes. For those, use EC2, ECS/EKS, or Batch instead.",
      followups: ["What triggers commonly invoke a Lambda function?", "Why is Lambda a poor fit for a 2-hour video transcoding job?"]
    },
    {
      title: "AWS Elastic Beanstalk",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "Platform-as-a-Service (PaaS) that automates deployment of web applications — handling provisioning of EC2, load balancing, Auto Scaling, and health monitoring — while the developer only uploads application code.",
      navLabel: "Exam angle:",
      nav: "Distinguish from CloudFormation: Beanstalk = quick app deployment with underlying infra abstracted; CloudFormation = explicit infrastructure-as-code control.",
      noteLabel: "Remember:",
      note: "Beanstalk still lets you reach the underlying EC2 resources when you need to. It is not fully hidden the way Lambda is.",
      followups: []
    },
    {
      title: "Containers: ECS, EKS, Fargate",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "Elastic Container Service (ECS): AWS-native container orchestration for Docker containers. Elastic Kubernetes Service (EKS): managed Kubernetes for teams standardized on K8s. Fargate: serverless compute engine for containers — works as a launch type for both ECS and EKS, removing the need to provision or manage the underlying EC2 instances (a 'cluster').",
      navLabel: "Exam angle:",
      nav: "'Serverless containers' or 'run containers without managing servers' = Fargate. 'Need Kubernetes API compatibility' = EKS. 'AWS-proprietary orchestrator' = ECS.",
      noteLabel: "Remember:",
      note: "Fargate is a launch type, not a competitor to ECS or EKS. You pick the EC2 launch type, where you manage the instances, or the Fargate launch type, where AWS manages them.",
      followups: ["A team wants to run containers with zero server management on ECS — which launch type?", "Which service would a team already using open-source Kubernetes tooling prefer?"]
    },
    {
      title: "AWS Batch",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "Fully managed batch processing service that dynamically provisions the optimal compute (EC2 or Fargate) to run large numbers of batch computing jobs, handling queuing, scheduling, and scaling.",
      navLabel: "Exam angle:",
      nav: "Keyword 'batch jobs at scale' or 'job queue' without needing to manage scheduling infrastructure.",
      noteLabel: "Remember:",
      note: "AWS Batch picks the instance types for you, based on what the job needs. You do not have to.",
      followups: []
    },
    {
      title: "Amazon Lightsail",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "Simplified virtual private server (VPS) offering with bundled compute, storage, and networking at a predictable low monthly price — aimed at simple web apps, blogs, or small projects and users new to AWS.",
      navLabel: "Exam angle:",
      nav: "Signal: 'simple, low-cost way to launch a website/app' or 'don't need full EC2 flexibility' = Lightsail.",
      noteLabel: "Remember:",
      note: "Lightsail gives up EC2's flexibility in exchange for simplicity and flat-rate pricing.",
      followups: []
    },
    {
      title: "Outposts, Wavelength, Local Zones",
      badge: "compute",
      conceptLabel: "Concept:",
      concept: "AWS Outposts: AWS-managed hardware installed on-premises to run AWS services in a customer's own data center (hybrid, low-latency, data residency). Wavelength: AWS infrastructure embedded within telecom 5G networks for ultra-low-latency mobile edge applications. Local Zones: smaller AWS infrastructure deployments closer to large population centers for low-latency access to a region's services.",
      navLabel: "Exam angle:",
      nav: "These overlap with Global Infrastructure content — recognize them as 'compute closer to where the data/user is' rather than needing config detail.",
      noteLabel: "Remember:",
      note: "Outposts runs in your own data center. Wavelength sits at the telecom 5G edge. Local Zones are AWS-run edge sites near big cities.",
      followups: []
    },
    {
      title: "Amazon S3 fundamentals",
      badge: "storage",
      conceptLabel: "Concept:",
      concept: "Simple Storage Service is object storage — data stored as objects (files + metadata) inside buckets, accessed via API/HTTP, not mounted as a filesystem. Virtually unlimited scale, used for backups, static websites, data lakes, and content storage.",
      navLabel: "Exam angle:",
      nav: "'Store any amount of unstructured data, access via URL/API' = S3. Distinguish from EBS/EFS (see block vs file vs object card).",
      noteLabel: "Remember:",
      note: "S3 bucket names must be globally unique across every AWS account.",
      followups: []
    },
    {
      title: "S3 storage classes",
      badge: "storage",
      conceptLabel: "Concept:",
      concept: "Standard: frequent access, low latency, highest cost. Intelligent-Tiering: automatically moves objects between tiers based on access patterns. Standard-IA: infrequent access, lower storage cost but retrieval fee, millisecond access. One Zone-IA: like Standard-IA but single AZ, cheaper, less resilient. Glacier Instant Retrieval: archive with millisecond access, lowest-cost archive tier with instant access. Glacier Flexible Retrieval: archive, retrieval in minutes to hours, very low cost. Glacier Deep Archive: lowest-cost storage overall, retrieval in ~12 hours, for long-term compliance archives.",
      navLabel: "Exam angle:",
      nav: "Exam gives access frequency + retrieval time tolerance; you pick the cheapest class that satisfies it. 'Rarely accessed, retrieval can take 12 hours' = Deep Archive.",
      noteLabel: "Remember:",
      note: "Cost and retrieval time move in opposite directions. The cheaper the storage class, the slower or costlier the retrieval.",
      followups: ["Which storage class fits data accessed unpredictably where access patterns are unknown?", "Which class fits 7-year regulatory archives rarely if ever retrieved?"]
    },
    {
      title: "S3 versioning, lifecycle policies, durability/availability",
      badge: "storage",
      conceptLabel: "Concept:",
      concept: "Versioning keeps multiple variants of an object to protect against accidental deletion/overwrite. Lifecycle policies automate transitioning objects between storage classes or expiring them based on age rules. S3 Standard is designed for 99.999999999% (11 nines) durability (objects won't be lost) and 99.99% availability (objects accessible when needed) — durability and availability are separate concepts.",
      navLabel: "Exam angle:",
      nav: "The 11-nines durability figure is a frequently quoted exact exam fact — memorize it distinctly from availability percentages, which vary by storage class.",
      noteLabel: "Remember:",
      note: "Durability means the data will not be lost. Availability means you can access it right now. S3 is strong on both, but they are not the same number.",
      followups: []
    },
    {
      title: "Block vs File vs Object storage: EBS, EFS, FSx",
      badge: "storage",
      conceptLabel: "Concept:",
      concept: "EBS (Elastic Block Store): block storage, attached to a single EC2 instance (unless Multi-Attach io-series), like a virtual hard drive — for OS boot volumes and databases. Volume types gp3 (general purpose SSD, balanced cost/performance) and io2 (highest IOPS, mission-critical low-latency databases). EFS (Elastic File System): managed NFS file storage, mountable by multiple EC2 instances simultaneously across AZs — for shared content repositories, CMS. FSx: managed file systems for specific engines — FSx for Windows File Server (SMB/Windows workloads) and FSx for Lustre (high-performance computing, machine learning).",
      navLabel: "Exam angle:",
      nav: "'Attached to one instance, boot volume' = EBS. 'Shared across many instances, POSIX/NFS' = EFS. 'Needs Windows file shares' or 'HPC scratch storage' = FSx.",
      noteLabel: "Remember:",
      note: "Object storage (S3) holds files plus metadata, accessed via API. Block storage (EBS) gives raw disk volumes. File storage (EFS/FSx) is a shared filesystem that many compute nodes can mount.",
      followups: ["A fleet of Linux instances needs a shared, concurrently-writable filesystem — which service?", "A single EC2 instance needs a low-latency boot volume — which service and volume type for a high-IOPS database?"]
    },
    {
      title: "AWS Storage Gateway",
      badge: "storage",
      conceptLabel: "Concept:",
      concept: "Hybrid cloud storage service that connects on-premises environments to AWS storage, presenting cloud storage as local file shares, volumes, or tape backups. Three types: File Gateway (NFS/SMB to S3), Volume Gateway (iSCSI block volumes backed by S3/EBS snapshots), Tape Gateway (virtual tape library backed by S3/Glacier, for existing backup software).",
      navLabel: "Exam angle:",
      nav: "Signal words: 'extend on-premises storage to the cloud' or 'replace physical tape backups with cloud storage.'",
      noteLabel: "Remember:",
      note: "Storage Gateway is for ongoing hybrid access, not a one-time bulk transfer. Bulk transfer is the Snow Family's job.",
      followups: []
    },
    {
      title: "Snow Family",
      badge: "storage",
      conceptLabel: "Concept:",
      concept: "Physical devices for offline, large-scale data transfer into/out of AWS when network transfer would be too slow or costly. Snowcone: small, portable, lowest capacity (edge computing/data collection). Snowball (Edge): suitcase-sized, terabytes of capacity, with optional onboard compute. Snowmobile: a literal shipping container on a truck for exabyte-scale migrations.",
      navLabel: "Exam angle:",
      nav: "'Migrate petabytes of data and internet transfer would take weeks/months' = Snowball/Snowmobile family, scaled to data volume.",
      noteLabel: "Remember:",
      note: "Here is the rule of thumb the exam relies on. If a network transfer would take more than about a week, use the Snow Family instead.",
      followups: []
    },
    {
      title: "AWS Backup",
      badge: "storage",
      conceptLabel: "Concept:",
      concept: "Centralized, managed service to automate and consolidate backup policies across multiple AWS services (EBS, RDS, DynamoDB, EFS, Storage Gateway, etc.) from a single console, instead of configuring backups per-service.",
      navLabel: "Exam angle:",
      nav: "Signal: 'single place to manage backup policies across many AWS resources.'",
      noteLabel: "Remember:",
      note: "AWS Backup orchestrates backup policies on top of each service's own native snapshot and backup features.",
      followups: []
    },
    {
      title: "VPC fundamentals",
      badge: "network",
      conceptLabel: "Concept:",
      concept: "A Virtual Private Cloud is an isolated, logically-defined virtual network within AWS where you launch resources. Contains subnets — public subnets (route to the internet via an Internet Gateway) and private subnets (no direct internet route). A NAT Gateway lets instances in private subnets initiate outbound internet traffic without being directly reachable inbound. Route tables control traffic flow between subnets and gateways.",
      navLabel: "Exam angle:",
      nav: "'Database tier that shouldn't be reachable from the internet but needs outbound updates' = private subnet + NAT Gateway.",
      noteLabel: "Remember:",
      note: "An Internet Gateway gives two-way internet access for a public subnet. A NAT Gateway gives one-way, outbound-only access for a private subnet.",
      followups: ["Why would a web server sit in a public subnet but its database in a private subnet?", "What component allows a private-subnet instance to download OS patches from the internet?"]
    },
    {
      title: "Hybrid connectivity: Direct Connect vs Site-to-Site VPN vs Internet",
      badge: "network",
      conceptLabel: "Concept:",
      concept: "Direct Connect: dedicated, private physical network connection from on-premises to AWS — consistent low latency, high bandwidth, but expensive and slow to provision (weeks). Site-to-Site VPN: encrypted connection over the public internet between on-premises and a VPC — fast to set up, lower cost, but subject to internet variability. Public internet: no dedicated setup, least secure/consistent, cheapest.",
      navLabel: "Exam angle:",
      nav: "Trade-off question: 'need connection today' = VPN; 'need guaranteed bandwidth and consistent low latency for a long-term data-heavy workload' = Direct Connect. They can also be combined for failover.",
      noteLabel: "Remember:",
      note: "Direct Connect is a dedicated line, and it is not encrypted by default. VPN is encrypted, but it runs over the shared internet.",
      followups: []
    },
    {
      title: "Route 53",
      badge: "network",
      conceptLabel: "Concept:",
      concept: "AWS's managed DNS service, also supports domain registration and health checking. Offers multiple routing policies conceptually: Simple, Weighted (split traffic by percentage), Latency-based (route to lowest-latency region), Failover (route to standby on primary failure), Geolocation (route by user's geographic location).",
      navLabel: "Exam angle:",
      nav: "Match the routing policy name to the scenario description — e.g., 'send 90% of traffic to old version, 10% to new' = Weighted.",
      noteLabel: "Remember:",
      note: "Route 53 handles DNS and domain routing. It does not cache or serve content itself; that is CloudFront's job.",
      followups: []
    },
    {
      title: "CloudFront vs Global Accelerator",
      badge: "network",
      conceptLabel: "Concept:",
      concept: "CloudFront: Content Delivery Network (CDN) that caches content (static and dynamic) at edge locations close to users, reducing latency for HTTP/HTTPS content; commonly uses S3 or an ALB as origin. Global Accelerator: improves performance for a broad range of traffic (TCP/UDP, not just HTTP) by routing through the AWS global network backbone to the optimal endpoint, without caching content.",
      navLabel: "Exam angle:",
      nav: "'Cache static website/video content near users' = CloudFront. 'Improve performance/availability for non-HTTP or gaming/VoIP traffic across regions without caching' = Global Accelerator.",
      noteLabel: "Remember:",
      note: "CloudFront caches content at the edge. Global Accelerator only speeds up the network path; it never caches.",
      followups: ["Which service would speed up a UDP-based gaming application across multiple AWS regions?"]
    },
    {
      title: "Amazon API Gateway",
      badge: "network",
      conceptLabel: "Concept:",
      concept: "Fully managed service to create, publish, secure, and monitor APIs that act as the 'front door' for backend services — commonly invoking Lambda functions (serverless API), but also EC2 or any HTTP backend. Handles authorization, throttling, caching, and versioning of API requests.",
      navLabel: "Exam angle:",
      nav: "Paired heavily with Lambda in exam scenarios: 'expose a serverless backend as a REST API' = API Gateway + Lambda.",
      noteLabel: "Remember:",
      note: "API Gateway is the entry point and router for API traffic. It is not compute itself.",
      followups: []
    },
    {
      title: "RDS: Multi-AZ vs Read Replicas",
      badge: "database",
      conceptLabel: "Concept:",
      concept: "Relational Database Service is a managed relational database supporting engines MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Aurora — AWS handles patching, backups, and provisioning. Multi-AZ deployment: synchronous replication to a standby instance in another AZ purely for high availability/disaster recovery (standby is not readable). Read Replicas: asynchronous copies used to offload read traffic and improve read performance/scalability (can be cross-region).",
      navLabel: "Exam angle:",
      nav: "'Improve availability/failover' = Multi-AZ. 'Reduce load on primary from heavy read traffic' or 'scale reads' = Read Replicas. They solve different problems and can be combined.",
      noteLabel: "Remember:",
      note: "A Multi-AZ standby is for failover only, and you cannot query it. Read Replicas are queryable, but they exist to scale reads, not to provide HA by default.",
      followups: ["Which RDS feature would you add solely to survive an AZ outage?", "Which RDS feature would you add to handle a reporting dashboard hammering the database with SELECT queries?"]
    },
    {
      title: "Amazon Aurora",
      badge: "database",
      conceptLabel: "Concept:",
      concept: "AWS-built relational database engine, MySQL- and PostgreSQL-compatible, designed for higher performance (up to 5x MySQL, 3x PostgreSQL claimed) and greater fault tolerance than standard RDS, with storage that auto-scales and replicates across multiple AZs automatically.",
      navLabel: "Exam angle:",
      nav: "'Need RDS-like relational database but with better performance/availability at a premium' = Aurora over standard RDS engines.",
      noteLabel: "Remember:",
      note: "Aurora is a distinct, AWS-proprietary engine you choose within RDS. It is not a separate service category.",
      followups: []
    },
    {
      title: "DynamoDB",
      badge: "database",
      conceptLabel: "Concept:",
      concept: "Fully managed, serverless NoSQL database supporting key-value and document data models, with single-digit millisecond latency at virtually any scale. Automatically scales throughput and storage without capacity planning (or use provisioned capacity).",
      navLabel: "Exam angle:",
      nav: "Choose DynamoDB over RDS when the workload is: flexible/non-relational schema, needs massive horizontal scale, or needs serverless operation with no capacity management — 'session state,' 'IoT data,' 'gaming leaderboards' are classic cues.",
      noteLabel: "Remember:",
      note: "RDS and Aurora are relational: structured, SQL, with joins. DynamoDB is NoSQL: key-value or document, no joins, and massive scale.",
      followups: ["Why would a gaming leaderboard use DynamoDB instead of RDS?"]
    },
    {
      title: "Amazon Redshift",
      badge: "database",
      conceptLabel: "Concept:",
      concept: "Fully managed data warehouse service optimized for OLAP (Online Analytical Processing) — complex analytical queries and aggregations across large historical datasets — using columnar storage and massively parallel processing (MPP). Contrasts with RDS/Aurora, which are optimized for OLTP (Online Transaction Processing) — fast, small, frequent read/write transactions.",
      navLabel: "Exam angle:",
      nav: "'Run business intelligence/analytics queries across years of historical data' = Redshift. 'Process day-to-day application transactions' = RDS/Aurora.",
      noteLabel: "Remember:",
      note: "OLTP is transactional and maps to RDS. OLAP is analytical and maps to Redshift. This pairing comes up on the exam again and again.",
      followups: []
    },
    {
      title: "ElastiCache, DocumentDB, Neptune",
      badge: "database",
      conceptLabel: "Concept:",
      concept: "ElastiCache: managed in-memory data store (Redis or Memcached engines) used to cache frequently accessed data and reduce database load, delivering microsecond latency. DocumentDB: managed, MongoDB-compatible document database for JSON-like semi-structured data. Neptune: managed graph database for datasets with highly connected relationships (social networks, fraud detection, recommendation engines).",
      navLabel: "Exam angle:",
      nav: "Recognition-level: 'speed up database reads with an in-memory cache' = ElastiCache; 'MongoDB workload' = DocumentDB; 'relationships/connections between entities matter most' = Neptune.",
      noteLabel: "Remember:",
      note: "Each one is purpose-built. ElastiCache is for caching, DocumentDB is for documents, and Neptune is for graphs and relationships. Pick by the shape of your data.",
      followups: []
    },
    {
      title: "AWS Database Migration Service (DMS)",
      badge: "database",
      conceptLabel: "Concept:",
      concept: "Managed service to migrate databases to AWS with minimal downtime, supporting homogeneous (same engine) and heterogeneous (different engine, e.g., Oracle to Aurora) migrations, and can keep source and target in sync during the transition (continuous data replication).",
      navLabel: "Exam angle:",
      nav: "Signal: 'migrate an on-premises database to AWS with minimal downtime.' Often paired with the Schema Conversion Tool (SCT) for heterogeneous engine changes.",
      noteLabel: "Remember:",
      note: "DMS handles the actual data and engine migration. SCT converts the schema and code when the engines differ.",
      followups: []
    }
  ]
},

services: {
  intro: {
    title: "AWS Services: Analytics, ML, Integration, Management & Support",
    desc: "CLF-C02 Domain 3 tests whether you can match a scenario to the right service by name, not configure it. Focus on the one-line 'what it does' and the classic pairwise distinctions (CloudWatch vs CloudTrail, SQS vs SNS vs EventBridge, the support plan tiers) that show up as direct exam questions."
  },
  cards: [
    {
      title: "Amazon Athena",
      badge: "analytics",
      conceptLabel: "Concept:",
      concept: "Serverless interactive query service that runs standard SQL directly against data sitting in Amazon S3 — no clusters to provision or manage.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'run ad-hoc SQL queries against log files in S3 without managing infrastructure' → Athena. Pay only per query (per data scanned).",
      noteLabel: "Remember:",
      note: "Athena queries data right where it sits in S3. It does not store or move the data itself."
    },
    {
      title: "AWS Glue",
      badge: "analytics",
      conceptLabel: "Concept:",
      concept: "Serverless data integration service for ETL (extract, transform, load) jobs, plus the Glue Data Catalog — a central metadata repository describing where data lives and its schema.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'prepare/clean/transform data before analysis' or 'discover and catalog schemas across data lakes' → Glue. Athena and QuickSight can both use the Glue Data Catalog.",
      noteLabel: "Remember:",
      note: "Glue does ETL and the catalog. Athena queries. QuickSight visualizes. Together they form a common serverless analytics pipeline."
    },
    {
      title: "Amazon QuickSight",
      badge: "analytics",
      conceptLabel: "Concept:",
      concept: "Serverless business intelligence (BI) service for building interactive dashboards and visualizations, with ML-powered insights (anomaly detection, forecasting).",
      navLabel: "Exam angle:",
      nav: "Scenario: 'business dashboards for executives' or 'self-service BI/visualization' → QuickSight.",
      noteLabel: "Remember:",
      note: "QuickSight is the visualization and dashboard layer. It pairs with Athena, Redshift, or Glue as data sources."
    },
    {
      title: "Amazon EMR",
      badge: "analytics",
      conceptLabel: "Concept:",
      concept: "Managed cluster platform for big-data frameworks — Apache Hadoop, Spark, Hive, Presto — for large-scale distributed data processing.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'process petabytes of data with Spark/Hadoop' or 'big data processing framework needing clusters' → EMR. Contrast with Athena/Glue which are serverless and framework-agnostic.",
      noteLabel: "Remember:",
      note: "With EMR, you still think in terms of clusters and frameworks. Athena and Glue are fully serverless, with no cluster to think about."
    },
    {
      title: "Amazon Kinesis (family)",
      badge: "analytics",
      conceptLabel: "Concept:",
      concept: "Family of services for collecting, processing, and analyzing real-time streaming data: Kinesis Data Streams (custom real-time processing), Kinesis Data Firehose (load streaming data into S3/Redshift/OpenSearch with no code), Kinesis Data Analytics (SQL/Apache Flink analytics on streams).",
      navLabel: "Exam angle:",
      nav: "Scenario: 'real-time clickstream/IoT/log data ingestion and processing' → Kinesis. 'Deliver streaming data to a data store with minimal setup' → Firehose specifically.",
      noteLabel: "Remember:",
      note: "Kinesis is for real-time streaming. Glue and EMR are batch-oriented, though EMR can also stream through Spark Streaming."
    },
    {
      title: "Amazon OpenSearch Service",
      badge: "analytics",
      conceptLabel: "Concept:",
      concept: "Managed service for deploying, operating, and scaling OpenSearch (formerly Elasticsearch) clusters — used for search, log analytics, and real-time application monitoring.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'full-text search engine' or 'centralized log analytics/observability' → OpenSearch Service. Formerly named 'Amazon Elasticsearch Service' — exam may reference either name.",
      noteLabel: "Remember:",
      note: "This is the search and log-analytics use case. It is different from Athena's ad-hoc SQL-over-S3 use case."
    },
    {
      title: "Amazon SageMaker",
      badge: "ml",
      conceptLabel: "Concept:",
      concept: "Fully managed service to build, train, and deploy machine learning models at scale, covering the full ML lifecycle (notebooks, training, tuning, hosting).",
      navLabel: "Exam angle:",
      nav: "Scenario: 'build a custom ML model' or 'train and deploy your own model' → SageMaker. Contrast with the pre-built AI services below, which require no model-building.",
      noteLabel: "Remember:",
      note: "SageMaker is for building your own model. Rekognition, Comprehend, and the rest use AWS's pre-trained models through a simple API call."
    },
    {
      title: "Pre-built AI Services (recognition set)",
      badge: "ml",
      conceptLabel: "Concept:",
      concept: "Amazon Rekognition (image/video analysis — object/face detection), Comprehend (natural language processing — sentiment, entities, key phrases), Textract (extract text/data from scanned documents/forms), Transcribe (speech-to-text) and Polly (text-to-speech), Translate (language translation), Lex (build conversational chatbots — powers Alexa), Personalize (real-time personalized recommendations), Forecast (time-series business forecasting).",
      navLabel: "Exam angle:",
      nav: "Exam tests pattern-matching a keyword to a service name: 'scanned invoices/forms' → Textract; 'sentiment analysis of text' → Comprehend; 'detect objects/faces in images' → Rekognition; 'chatbot' → Lex; 'product recommendations' → Personalize; 'demand forecasting' → Forecast.",
      noteLabel: "Remember:",
      note: "None of these need any ML expertise. That is the whole selling point compared with SageMaker.",
      followups: ["Which single word in a scenario maps to which AI service — build a mental keyword table before the exam."]
    },
    {
      title: "Amazon SQS (Simple Queue Service)",
      badge: "integration",
      conceptLabel: "Concept:",
      concept: "Fully managed message queuing service used to decouple and scale microservices, distributed systems, and serverless applications. One producer, messages held until a consumer polls and processes them (at-least-once delivery).",
      navLabel: "Exam angle:",
      nav: "Scenario: 'decouple application components so a spike in one doesn't overwhelm another' → SQS. Point-to-point / one message consumed by one consumer (per queue).",
      noteLabel: "Remember:",
      note: "SQS is a queue. It is pull-based and used for decoupling. It is not a broadcast mechanism."
    },
    {
      title: "Amazon SNS (Simple Notification Service)",
      badge: "integration",
      conceptLabel: "Concept:",
      concept: "Fully managed pub/sub messaging service: a single message published to a topic is pushed out to many subscribers simultaneously (email, SMS, SQS queues, Lambda, HTTP endpoints).",
      navLabel: "Exam angle:",
      nav: "Scenario: 'notify multiple subscribers/systems of an event at once' → SNS. Classic fan-out pattern: SNS topic → multiple SQS queues.",
      noteLabel: "Remember:",
      note: "SNS is push: one-to-many broadcast. SQS is pull: a one-to-one queue. This pairing is a top exam favorite."
    },
    {
      title: "Amazon EventBridge",
      badge: "integration",
      conceptLabel: "Concept:",
      concept: "Serverless event bus service that routes events between AWS services, SaaS applications, and your own applications based on rules, with built-in filtering/routing logic.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'route events from many different AWS/SaaS sources based on content-based rules' → EventBridge. Broader/more flexible routing than SNS's simple topic model.",
      noteLabel: "Remember:",
      note: "SQS is a queue. SNS is pub/sub broadcast. EventBridge is an event bus that routes by rules across many sources, including third-party SaaS."
    },
    {
      title: "AWS Step Functions",
      badge: "integration",
      conceptLabel: "Concept:",
      concept: "Serverless orchestration service for coordinating multiple AWS services (especially Lambda functions) into visual workflows using state machines.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'orchestrate a multi-step workflow/business process across services in a defined order' → Step Functions.",
      noteLabel: "Remember:",
      note: "Step Functions coordinates the sequence and logic of a workflow. That is different from SQS, SNS, and EventBridge, which just move individual messages and events."
    },
    {
      title: "Amazon CloudWatch",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Monitoring and observability service: collects metrics, logs, and events from AWS resources; supports dashboards, alarms, and automated actions based on thresholds.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'monitor CPU/memory/performance metrics' or 'trigger an alarm/auto scaling action on a threshold' → CloudWatch.",
      noteLabel: "Remember:",
      note: "CloudWatch is performance and operational monitoring. It answers what is happening and how things are performing. Contrast it directly with CloudTrail below."
    },
    {
      title: "AWS CloudTrail",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Governance/audit service that records API calls and account activity across your AWS account — who did what, when, and from where.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'audit who made a change / deleted a resource / API call history for compliance investigation' → CloudTrail.",
      noteLabel: "Remember:",
      note: "CloudWatch is performance monitoring. CloudTrail is API activity auditing and governance. This distinction shows up on almost every exam sitting."
    },
    {
      title: "AWS Config",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Service that records and evaluates configurations of AWS resources over time, checking them against desired baselines/rules for compliance.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'track configuration changes to resources over time' or 'assess/audit resource compliance against a rule' → AWS Config.",
      noteLabel: "Remember:",
      note: "CloudTrail records the API call or action. Config records the resulting resource configuration state and checks it for compliance."
    },
    {
      title: "AWS Systems Manager",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Unified operations hub for managing EC2 and on-premises resources: includes Parameter Store (secure config/secrets storage) and Session Manager (secure shell access without opening SSH ports or using bastion hosts).",
      navLabel: "Exam angle:",
      nav: "Scenario: 'centrally manage/patch fleets of servers' or 'securely store configuration values/secrets' or 'connect to an instance without SSH keys/open ports' → Systems Manager.",
      noteLabel: "Remember:",
      note: "Session Manager removes the need for bastion hosts and inbound SSH or RDP ports. That is a common security best-practice scenario."
    },
    {
      title: "AWS Trusted Advisor",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Automated service that inspects your AWS environment and provides real-time recommendations across five categories: cost optimization, performance, security, fault tolerance, and service limits.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'get recommendations on unused resources / security gaps / approaching service limits' → Trusted Advisor. Access to full check set scales with support plan (see Support Plans card).",
      noteLabel: "Remember:",
      note: "On Basic and Developer support, you get only the 7 core security and service-limit checks. On Business and Enterprise support, you get full access to all Trusted Advisor checks across all five categories."
    },
    {
      title: "AWS Organizations",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Account management service for centrally governing multiple AWS accounts: consolidated billing (single bill, volume discounts across accounts) and Service Control Policies (SCPs) that set maximum permission guardrails for member accounts.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'manage billing for multiple accounts under one company' or 'restrict what actions accounts in a group can ever take' → Organizations + SCPs.",
      noteLabel: "Remember:",
      note: "SCPs set a permission ceiling, meaning what can ever be allowed. They do not grant permissions themselves. IAM policies still grant the actual access within that ceiling."
    },
    {
      title: "AWS Control Tower",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Service that automates setup of a secure, multi-account AWS environment ('landing zone') based on best-practice blueprints, built on top of AWS Organizations.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'quickly set up a well-architected multi-account landing zone with governance guardrails out of the box' → Control Tower.",
      noteLabel: "Remember:",
      note: "Control Tower automates and extends Organizations. Organizations on its own is more manual, lower-level account and billing management."
    },
    {
      title: "AWS CloudFormation",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Infrastructure as Code (IaC) service: define AWS resources in JSON/YAML templates and have CloudFormation provision/update/delete them as a single managed 'stack.'",
      navLabel: "Exam angle:",
      nav: "Scenario: 'provision infrastructure repeatably/consistently via code/templates' or 'automate environment replication' → CloudFormation.",
      noteLabel: "Remember:",
      note: "CloudFormation provisions the infrastructure itself, as code. Config tracks and evaluates configuration after the fact. They do entirely different jobs."
    },
    {
      title: "AWS Well-Architected Tool",
      badge: "management",
      conceptLabel: "Concept:",
      concept: "Free self-service tool that reviews your workloads against the six pillars of the AWS Well-Architected Framework (operational excellence, security, reliability, performance efficiency, cost optimization, sustainability) and gives improvement recommendations.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'review a workload against AWS best practices across the well-architected pillars' → Well-Architected Tool.",
      noteLabel: "Remember:",
      note: "The Well-Architected Tool does a workload-level architectural review. Trusted Advisor runs account-wide automated checks. They complement each other; they are not the same."
    },
    {
      title: "The 6 R's of Migration Strategy",
      badge: "migration",
      conceptLabel: "Concept:",
      concept: "Rehost ('lift-and-shift' — move as-is, no changes), Replatform ('lift-tinker-and-shift' — minor optimizations, e.g. moving DB to RDS), Repurchase ('drop-and-shop' — switch to a different product, e.g. move to SaaS), Refactor/Re-architect (redesign the application to be cloud-native), Retain (keep on-premises, revisit later), Retire (decommission, no longer needed).",
      navLabel: "Exam angle:",
      nav: "Exam gives a scenario description and asks 'which of the 6 R's does this describe?' — memorize each definition precisely, especially the distinction between Rehost and Replatform, and Repurchase vs Refactor.",
      noteLabel: "Remember:",
      note: "Roughly in order of increasing effort and change: Retain and Retire, then Rehost, then Replatform, then Repurchase, then Refactor."
    },
    {
      title: "AWS Migration Hub & Application Discovery Service",
      badge: "migration",
      conceptLabel: "Concept:",
      concept: "Migration Hub provides a single place to track migration progress across multiple AWS and partner migration tools. Application Discovery Service gathers information about on-premises servers/applications (usage, dependencies) to plan a migration.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'central dashboard to track status of many migrations' → Migration Hub. 'Discover what's running on-prem before migrating' → Application Discovery Service.",
      noteLabel: "Remember:",
      note: "Discovery comes first, so you know what you have. Then Migration Hub tracks the move, so you know how far along you are.<br><br>DMS (Database Migration Service) and the Snow Family handle the actual data and database transfer. Those are covered under infra and storage."
    },
    {
      title: "AWS Developer Tools (CI/CD suite)",
      badge: "devtools",
      conceptLabel: "Concept:",
      concept: "CodeCommit (managed private Git source control), CodeBuild (compiles source and runs tests), CodeDeploy (automates code deployment to compute), CodePipeline (orchestrates the full CI/CD release pipeline end-to-end).",
      navLabel: "Exam angle:",
      nav: "Scenario: 'automate build-test-deploy pipeline' → CodePipeline orchestrating the others. Exam tests recognition-level matching of each name to its pipeline stage.",
      noteLabel: "Remember:",
      note: "The names mirror the pipeline. Commit is source, then Build, then Deploy, and Pipeline glues all the stages together."
    },
    {
      title: "AWS Cloud9 & AWS X-Ray",
      badge: "devtools",
      conceptLabel: "Concept:",
      concept: "Cloud9 is a cloud-based IDE accessible from a browser for writing, running, and debugging code. X-Ray helps developers analyze and debug distributed/microservices applications by tracing requests as they travel through the system.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'browser-based code editor, no local setup' → Cloud9. 'Trace a request across multiple microservices to find where latency/errors occur' → X-Ray.",
      noteLabel: "Remember:",
      note: "X-Ray is for distributed tracing and debugging. That is different from CloudWatch's metrics and logs, and from CloudTrail's API audit trail."
    },
    {
      title: "AWS IoT Core",
      badge: "iot",
      conceptLabel: "Concept:",
      concept: "Managed cloud service that lets connected IoT devices securely interact with cloud applications and other devices, handling billions of devices and trillions of messages.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'connect and manage fleets of IoT/sensor devices to the cloud' → IoT Core. Recognition-level only for CCP.",
      noteLabel: "Remember:",
      note: "Just know the name and its one-line purpose. Depth is not tested at the CCP level."
    },
    {
      title: "AWS Support Plans: Basic & Developer",
      badge: "support",
      conceptLabel: "Concept:",
      concept: "Basic (free, included for all accounts): access to documentation, whitepapers, and AWS Support forums only — no SLA-backed case support, only the 7 core/security Trusted Advisor checks. Developer ($29/mo or 3% of usage, whichever is greater): adds business-hours email access to Cloud Support Associates; general guidance response < 24 business hours, system impaired < 12 business hours; still only core Trusted Advisor checks; no phone support.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'individual/learning account with no need for guaranteed response times' → Basic. 'Testing/early development, want some support access to a person' → Developer.",
      noteLabel: "Remember:",
      note: "Basic has no case support at all, just forums and docs. Developer is the first tier with a real support case channel, and it is email only during business hours."
    },
    {
      title: "AWS Support Plans: Business",
      badge: "support",
      conceptLabel: "Concept:",
      concept: "Greater of $100/mo or tiered % of usage. 24/7 phone, chat, and email access to Cloud Support Engineers. Full access to all Trusted Advisor checks. Response times: general guidance < 24 hrs, system impaired < 12 hrs, production system impaired < 4 hrs, production system down < 1 hr. Includes Infrastructure Event Management (for an additional fee) and third-party software support.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'production workloads on AWS, need 24/7 support and full Trusted Advisor access, but no dedicated account manager' → Business.",
      noteLabel: "Remember:",
      note: "Business is the first tier with full Trusted Advisor access. It is also the first with a sub-1-hour SLA, since production down is under 1 hour. There is no TAM yet."
    },
    {
      title: "AWS Support Plans: Enterprise On-Ramp",
      badge: "support",
      conceptLabel: "Concept:",
      concept: "Greater of $5,500/mo or tiered % of usage. Designed for production/business-critical workloads needing a level between Business and Enterprise. Provides a pool of Technical Account Managers (TAM), not a single dedicated TAM. Response times same top-tier as Business/Enterprise: business-critical system down < 30 minutes.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'wants some TAM-like guidance but not the full dedicated Enterprise cost' → Enterprise On-Ramp (pool of TAMs, concierge support team access).",
      noteLabel: "Remember:",
      note: "On-Ramp is the bridge tier. TAM access exists, but it is shared and pooled, not a single dedicated person like full Enterprise."
    },
    {
      title: "AWS Support Plans: Enterprise",
      badge: "support",
      conceptLabel: "Concept:",
      concept: "Greater of $15,000/mo or tiered % of usage. Highest tier: includes a dedicated Technical Account Manager (TAM), dedicated Concierge Support team, full Trusted Advisor access, 24/7 phone/chat/email, and the fastest SLA — business-critical system down < 15 minutes response.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'mission-critical workloads needing a dedicated named point of contact' or 'which plan includes a TAM' → Enterprise (dedicated TAM is exclusive to this tier; On-Ramp only gets a pooled TAM team).",
      noteLabel: "Remember:",
      note: "Memorize the SLA ladder for a production or business-critical system being down. Business is under 1 hour. Enterprise On-Ramp is under 30 minutes, and Enterprise is under 15 minutes. Enterprise is the fastest, and the only tier with a single dedicated TAM."
    },
    {
      title: "AWS Technology Support Resources",
      badge: "support",
      conceptLabel: "Concept:",
      concept: "Beyond paid support plans, AWS provides free resources: AWS re:Post (community Q&A forum), AWS Knowledge Center, AWS Documentation, Whitepapers, AWS Marketplace, and the AWS Partner Network (APN) for finding certified consulting/technology partners.",
      navLabel: "Exam angle:",
      nav: "Scenario: 'find a certified third-party consulting partner to help with a migration' → AWS Partner Network. 'Look up a community-answered technical question for free' → AWS re:Post.",
      noteLabel: "Remember:",
      note: "These resources are available at every support tier, including Basic. They are not locked behind paid support plans."
    }
  ]
},

billing: {
  intro: {
    title: "Billing, Pricing, and Support",
    desc: "Domain 4 (~12% of CLF-C02): AWS pricing models, Free Tier types, cost management/analysis tools, consolidated billing, and how support plan choice ties into cost. Exam loves 'which tool does X' distinctions between the Pricing Calculator, Cost Explorer, Budgets, and CUR."
  },
  cards: [
    {
      title: "Pay-As-You-Go & Pricing Fundamentals",
      badge: "pricing",
      conceptLabel: "Concept:",
      concept: "AWS pricing is consumption-based: pay only for what you use, with no upfront costs or long-term contracts required for most services. Pricing dimensions vary by service — compute charges by instance-hour/second, storage by GB stored, data transfer by GB moved, requests by API call count.",
      navLabel: "Exam angle:",
      nav: "Expect a question framing pay-as-you-go against traditional on-prem CapEx: AWS converts capital expense (buying servers) into variable operating expense (paying for usage). Also tested: economies of scale — AWS passes bulk-purchasing savings to customers via periodic price reductions.",
      noteLabel: "Remember:",
      note: "No upfront investment. You pay only for what you consume, and you stop paying when you stop using it. This is one of cloud's core value-proposition pillars: elasticity, agility, and cost.",
      followups: [
        "How does pay-as-you-go change CapEx into OpEx?",
        "Name three different pricing dimensions across AWS services."
      ]
    },
    {
      title: "AWS Free Tier — Three Types",
      badge: "pricing",
      conceptLabel: "Concept:",
      concept: "Free Tier has three distinct categories: (1) 12 Months Free — for new accounts only, e.g. 750 hrs/month EC2 t2.micro/t3.micro, 5GB S3 Standard storage; (2) Always Free — no expiration, available to all accounts, e.g. Lambda 1M free requests/month, DynamoDB 25GB storage; (3) Trials — short-term, start when a service is activated and last a fixed duration regardless of account age, e.g. Amazon Inspector free trial, SageMaker trial.",
      navLabel: "Exam angle:",
      nav: "The exam tests whether you can classify a given offer into the correct bucket, especially distinguishing '12 months from account creation' vs 'always free regardless of account age' vs 'trial starts on activation, time-boxed.'",
      noteLabel: "Remember:",
      note: "12 Months Free runs on a new-account clock. Always Free has no clock and never expires. Trials start their clock when you activate the service and last only a short time.",
      followups: [
        "A 2-year-old AWS account launches EC2 — does it get the 12-months-free tier?",
        "Which Free Tier type has no expiration date at all?"
      ]
    },
    {
      title: "On-Demand vs Reserved vs Savings Plans vs Spot",
      badge: "pricing",
      conceptLabel: "Concept:",
      concept: "Compute pricing spectrum by commitment level: On-Demand (pay per hour/second, no commitment, highest unit price, full flexibility) → Savings Plans (commit to a $/hour spend for 1 or 3 years for a discount, flexible across instance families/regions) → Reserved Instances (commit to specific instance type/region for 1 or 3 years, up to 72% off, less flexible than Savings Plans) → Spot Instances (bid on spare capacity, up to 90% off, can be interrupted with 2-minute warning).",
      navLabel: "Exam angle:",
      nav: "Scenario questions describe a workload (steady-state DB, flexible batch job, fault-tolerant/interruptible analytics) and ask which pricing model fits best. Steady predictable workload → Reserved/Savings Plans. Fault-tolerant, flexible timing, cost-sensitive → Spot. Unpredictable/short-term → On-Demand.",
      noteLabel: "Remember:",
      note: "Roughly by discount: On-Demand at 0%, then Savings Plans and RIs up to about 72%, then Spot up to about 90% but interruptible. Never use Spot for critical, always-on workloads.",
      followups: [
        "Which pricing model suits a fault-tolerant, interruptible batch analytics job?",
        "Why would a company choose a Savings Plan over a Reserved Instance?"
      ]
    },
    {
      title: "Savings Plans Types",
      badge: "pricing",
      conceptLabel: "Concept:",
      concept: "Two Savings Plan types: Compute Savings Plans (most flexible — applies across EC2 instance family, size, OS, tenancy, region, and even to Fargate/Lambda) and EC2 Instance Savings Plans (less flexible — locked to a specific instance family in a specific region, but deeper discount than Compute Savings Plans).",
      navLabel: "Exam angle:",
      nav: "Recognition-level only: know that Compute Savings Plans = maximum flexibility (multi-service), EC2 Instance Savings Plans = narrower scope but bigger discount than Compute SP.",
      noteLabel: "Remember:",
      note: "Compute Savings Plans are flexible across compute services. EC2 Instance Savings Plans lock to a specific family and region, but give a higher discount.",
      followups: [
        "Which Savings Plan type also covers Fargate and Lambda usage?"
      ]
    },
    {
      title: "Reserved Instance Marketplace",
      badge: "pricing",
      conceptLabel: "Concept:",
      concept: "The Reserved Instance Marketplace lets customers sell unused Standard RIs they no longer need to other AWS customers, and lets buyers purchase third-party RIs often at a discount, without going through AWS directly for that specific listing.",
      navLabel: "Exam angle:",
      nav: "Brief recognition item: if a company over-purchased RIs and no longer needs them, they can sell them on the RI Marketplace rather than let them go to waste.",
      noteLabel: "Remember:",
      note: "The RI Marketplace is a secondary market for unused Standard RIs. It does not cover Convertible RIs.",
      followups: [
        "Can Convertible RIs be sold on the RI Marketplace?"
      ]
    },
    {
      title: "Data Transfer Pricing",
      badge: "pricing",
      conceptLabel: "Concept:",
      concept: "Data transfer IN to AWS is generally free. Data transfer OUT to the internet is charged (and is often the largest 'hidden' cost). Data transfer within the same Availability Zone is typically free or cheapest; across AZs within the same region costs more; cross-region transfer costs the most.",
      navLabel: "Exam angle:",
      nav: "Expect a conceptual ranking question: 'which is most expensive — same-AZ, cross-AZ same-region, or cross-region data transfer?' Answer: cross-region > cross-AZ > same-AZ, and inbound is generally cheaper than outbound.",
      noteLabel: "Remember:",
      note: "Data IN is usually free. Data OUT to the internet costs money. The farther the hop, the more it costs: same AZ is cheapest, then cross-AZ, then cross-region.",
      followups: [
        "Why do architects try to keep chatty services in the same AZ?",
        "Which direction of data transfer is typically free?"
      ]
    },
    {
      title: "AWS Pricing Calculator",
      badge: "pricing",
      conceptLabel: "Concept:",
      concept: "AWS Pricing Calculator is a free tool to estimate the cost of AWS services BEFORE you use them — build out a hypothetical architecture and get a cost estimate for planning/budgeting purposes. It does not look at your actual account usage.",
      navLabel: "Exam angle:",
      nav: "Classic distractor set: Pricing Calculator (future/hypothetical estimate) vs Cost Explorer (past/current actual usage) vs Budgets (alerts on thresholds) vs CUR (raw detailed billing data). If the scenario says 'planning a new workload not yet deployed,' the answer is Pricing Calculator.",
      noteLabel: "Remember:",
      note: "Use the Pricing Calculator to estimate future costs for an architecture you have not built yet, or a hypothetical one.",
      followups: [
        "A company wants to estimate costs before migrating a workload to AWS — which tool?"
      ]
    },
    {
      title: "AWS Cost Explorer",
      badge: "billing",
      conceptLabel: "Concept:",
      concept: "Cost Explorer visualizes and analyzes your actual past and current AWS spending and usage over time, with default reports and the ability to filter/group by service, linked account, tag, etc. Includes basic forecasting of future costs based on historical patterns.",
      navLabel: "Exam angle:",
      nav: "If the scenario says 'analyze spending trends over the last 6 months' or 'see which service is driving cost increases,' the answer is Cost Explorer, not the Pricing Calculator.",
      noteLabel: "Remember:",
      note: "Use Cost Explorer to visualize and analyze your past and current actual spend. It also does light forecasting.",
      followups: [
        "How is Cost Explorer different from the Pricing Calculator in terms of time direction?"
      ]
    },
    {
      title: "AWS Budgets",
      badge: "billing",
      conceptLabel: "Concept:",
      concept: "AWS Budgets lets you set custom cost, usage, or Reserved Instance/Savings Plans utilization/coverage thresholds and sends alerts (email/SNS) when actual or forecasted spend exceeds them. It doesn't stop spending by default — it notifies.",
      navLabel: "Exam angle:",
      nav: "If the scenario says 'notify the finance team when spending exceeds $X' or 'alert before month-end forecast exceeds budget,' the answer is AWS Budgets, not Cost Explorer.",
      noteLabel: "Remember:",
      note: "Set a threshold in Budgets and it alerts you when you cross it, whether that is actual or forecasted spend.",
      followups: [
        "Does AWS Budgets automatically stop resources when a threshold is exceeded?"
      ]
    },
    {
      title: "Cost and Usage Report (CUR)",
      badge: "billing",
      conceptLabel: "Concept:",
      concept: "The Cost and Usage Report (CUR) is the most comprehensive, granular billing dataset AWS offers — includes line-item usage, costs, discounts, credits, and can be delivered to an S3 bucket for analysis with tools like Athena, Redshift, or QuickSight.",
      navLabel: "Exam angle:",
      nav: "If the scenario mentions 'most detailed billing data available' or 'ingest billing data into a data lake / BI tool,' the answer is CUR — it is the raw source of truth, richer than what Cost Explorer's UI shows.",
      noteLabel: "Remember:",
      note: "The CUR is the most granular, detailed billing and usage data available. You can export it to S3 for custom analysis.",
      followups: [
        "Which billing tool provides the most granular line-item data, and where can it be delivered?"
      ]
    },
    {
      title: "CloudWatch Billing Alarms",
      badge: "billing",
      conceptLabel: "Concept:",
      concept: "You can enable billing alerts and create a CloudWatch alarm on the estimated charges metric to notify you (via SNS) when your AWS bill crosses a set dollar threshold — an older/simpler mechanism than AWS Budgets.",
      navLabel: "Exam angle:",
      nav: "Know it exists as a distinct path from AWS Budgets: billing alerts must first be enabled in the Billing console, then a CloudWatch alarm is created against the EstimatedCharges metric.",
      noteLabel: "Remember:",
      note: "A CloudWatch billing alarm is a simple threshold alert on estimated charges. AWS Budgets is the more flexible, purpose-built budgeting and alerting tool.",
      followups: [
        "What must be enabled first before a CloudWatch billing alarm can be created?"
      ]
    },
    {
      title: "Cost Anomaly Detection & Compute Optimizer",
      badge: "billing",
      conceptLabel: "Concept:",
      concept: "AWS Cost Anomaly Detection uses machine learning to automatically detect unusual spend patterns and alert you, without manually setting thresholds. AWS Compute Optimizer analyzes resource utilization and recommends rightsizing (e.g., downsizing an over-provisioned EC2 instance) to reduce cost and improve performance.",
      navLabel: "Exam angle:",
      nav: "Recognition-level: 'unexpected spend spike, no manual threshold set' → Cost Anomaly Detection. 'Recommend a better/cheaper instance type for my workload' → Compute Optimizer.",
      noteLabel: "Remember:",
      note: "Cost Anomaly Detection uses ML to alert you to unusual spend. Compute Optimizer gives rightsizing recommendations based on how much you actually use.",
      followups: [
        "Which service would recommend downsizing an underutilized EC2 instance?"
      ]
    },
    {
      title: "Organizations Consolidated Billing",
      badge: "billing",
      conceptLabel: "Concept:",
      concept: "AWS Organizations lets you link multiple AWS accounts under one management (payer) account for consolidated billing: a single bill for all accounts, combined usage pooled to reach volume discount tiers and Reserved Instance/Savings Plans discount sharing faster, while each linked account's usage is still tracked and viewable separately.",
      navLabel: "Exam angle:",
      nav: "Key exam point: consolidated billing gives pricing benefits (volume discounts, RI/Savings Plans sharing across accounts) but does NOT merge accounts operationally — each account still has separate usage reports and resource isolation.",
      noteLabel: "Remember:",
      note: "You get one bill, pooled volume discounts, and RI and Savings Plans sharing. Even so, usage and resources are still tracked separately per account.",
      followups: [
        "Does consolidated billing allow one account's RI discount to benefit usage in a different linked account?",
        "Is usage still tracked separately per account under consolidated billing?"
      ]
    },
    {
      title: "Support Plans — Cost & Billing Angle",
      badge: "support",
      conceptLabel: "Concept:",
      concept: "AWS support plan tier (Basic, Developer, Business, Enterprise On-Ramp, Enterprise) determines both the monthly cost (Business/Enterprise scale with usage) and what account/billing support is included — e.g. Basic includes only account and billing support with no technical support, while paid tiers add technical support with tiered response times.",
      navLabel: "Exam angle:",
      nav: "This card is a pointer, not the full comparison — the detailed SLA/response-time table lives in the Support domain section. Here, just know that choosing a higher support tier costs more but also unlocks faster technical response and a named Technical Account Manager (Enterprise tiers), on top of billing/account support which is free at every tier.",
      noteLabel: "Remember:",
      note: "Billing and account support is free for every customer, on every tier. Technical support comes only with paid tiers, and the cost scales with the tier.",
      followups: [
        "Is billing/account support available on the free Basic support plan?"
      ]
    },
    {
      title: "AWS Marketplace Billing",
      badge: "billing",
      conceptLabel: "Concept:",
      concept: "AWS Marketplace is a digital catalog of third-party software (AMIs, SaaS, containers) that can be deployed on AWS. Charges for Marketplace products are billed through the customer's regular AWS bill alongside native AWS service usage, simplifying procurement.",
      navLabel: "Exam angle:",
      nav: "Brief recognition: know that Marketplace purchases show up as a line item on the same consolidated AWS invoice, rather than requiring a separate vendor billing relationship.",
      noteLabel: "Remember:",
      note: "Marketplace software cost lands on your existing AWS bill, not on a separate invoice.",
      followups: [
        "Where does a Marketplace software charge appear — a separate vendor invoice or the AWS bill?"
      ]
    }
  ]
},

reference: {
  intro: { title: "AWS Service Cheat Sheet", desc: "Rapid-fire, one-line-per-service recall for nearly every AWS service on the CLF-C02 exam guide. Scan the night before, not the week before." },
  cards: [
    { title: "EC2", badge: "compute", conceptLabel: "What it is:", concept: "Resizable virtual servers (instances) in the cloud, billed by the second/hour depending on purchase option.", navLabel: "One-liner to remember:", nav: "The default IaaS building block — you manage the OS." },
    { title: "Lambda", badge: "compute", conceptLabel: "What it is:", concept: "Serverless functions that run code in response to events without provisioning servers, billed per invocation/duration.", navLabel: "One-liner to remember:", nav: "No servers, no idle cost — pay only when code runs." },
    { title: "Elastic Beanstalk", badge: "compute", conceptLabel: "What it is:", concept: "PaaS that automatically handles deployment, capacity, load balancing, and scaling for uploaded application code.", navLabel: "One-liner to remember:", nav: "Upload code, AWS handles the infrastructure plumbing." },
    { title: "ECS", badge: "compute", conceptLabel: "What it is:", concept: "AWS's own container orchestration service for running and scaling Docker containers.", navLabel: "One-liner to remember:", nav: "AWS-native container orchestrator (not Kubernetes)." },
    { title: "EKS", badge: "compute", conceptLabel: "What it is:", concept: "Managed Kubernetes service for running containerized apps using the open-source Kubernetes control plane.", navLabel: "One-liner to remember:", nav: "Managed Kubernetes — pick this if you need K8s specifically." },
    { title: "Fargate", badge: "compute", conceptLabel: "What it is:", concept: "Serverless compute engine for containers, usable with both ECS and EKS, removing the need to manage EC2 instances.", navLabel: "One-liner to remember:", nav: "Containers without managing the underlying servers." },
    { title: "Lightsail", badge: "compute", conceptLabel: "What it is:", concept: "Simplified virtual private server offering with bundled compute, storage, and networking at predictable pricing.", navLabel: "One-liner to remember:", nav: "AWS's easy-button VPS for simple websites/apps." },
    { title: "Batch", badge: "compute", conceptLabel: "What it is:", concept: "Fully managed service to run batch computing jobs at any scale, provisioning compute automatically.", navLabel: "One-liner to remember:", nav: "For big offline/batch jobs, not real-time requests." },
    { title: "Outposts", badge: "compute", conceptLabel: "What it is:", concept: "AWS-managed hardware racks that extend native AWS infrastructure and services into on-premises data centers.", navLabel: "One-liner to remember:", nav: "AWS hardware, physically in your own building." },
    { title: "S3", badge: "storage", conceptLabel: "What it is:", concept: "Object storage for any amount of unstructured data, accessed via HTTP API; 11 nines durability.", navLabel: "One-liner to remember:", nav: "Think 'files/objects', not 'disk' — use EBS for that." },
    { title: "EBS", badge: "storage", conceptLabel: "What it is:", concept: "Persistent block storage volumes that attach to a single EC2 instance, like a virtual hard drive.", navLabel: "One-liner to remember:", nav: "The 'disk' attached to one EC2 instance." },
    { title: "EFS", badge: "storage", conceptLabel: "What it is:", concept: "Managed elastic NFS file system that can be mounted concurrently by many EC2 instances.", navLabel: "One-liner to remember:", nav: "Shared file storage across many instances at once." },
    { title: "FSx", badge: "storage", conceptLabel: "What it is:", concept: "Managed file storage built on popular third-party file systems, e.g. FSx for Windows File Server or FSx for Lustre.", navLabel: "One-liner to remember:", nav: "Pick this when you need Windows/Lustre-flavored file systems." },
    { title: "Storage Gateway", badge: "storage", conceptLabel: "What it is:", concept: "Hybrid storage service connecting on-premises environments to AWS cloud storage.", navLabel: "One-liner to remember:", nav: "The bridge between on-prem storage and S3/cloud." },
    { title: "Snow Family", badge: "storage", conceptLabel: "What it is:", concept: "Physical devices (Snowcone, Snowball, Snowmobile) for shipping large amounts of data into/out of AWS offline.", navLabel: "One-liner to remember:", nav: "'Truck full of data' — for huge transfers with poor bandwidth." },
    { title: "AWS Backup", badge: "storage", conceptLabel: "What it is:", concept: "Centralized service to automate and manage backups across multiple AWS services from one place.", navLabel: "One-liner to remember:", nav: "One console to schedule backups everywhere." },
    { title: "VPC", badge: "network", conceptLabel: "What it is:", concept: "Logically isolated virtual network within AWS where you launch resources and control IP ranges, subnets, and routing.", navLabel: "One-liner to remember:", nav: "Your own private slice of the AWS network." },
    { title: "Direct Connect", badge: "network", conceptLabel: "What it is:", concept: "Dedicated private physical network connection from on-premises to AWS, bypassing the public internet.", navLabel: "One-liner to remember:", nav: "A dedicated cable to AWS for speed and consistency." },
    { title: "Site-to-Site VPN", badge: "network", conceptLabel: "What it is:", concept: "Encrypted IPsec connection over the public internet linking an on-premises network to a VPC.", navLabel: "One-liner to remember:", nav: "Quick, encrypted tunnel over the internet, not dedicated hardware." },
    { title: "Route 53", badge: "network", conceptLabel: "What it is:", concept: "Highly available DNS web service that also handles domain registration and health checks.", navLabel: "One-liner to remember:", nav: "AWS's DNS and domain name manager." },
    { title: "CloudFront", badge: "network", conceptLabel: "What it is:", concept: "Content delivery network (CDN) that caches content at edge locations close to users for low-latency delivery.", navLabel: "One-liner to remember:", nav: "Speeds up content delivery by caching at the edge." },
    { title: "Global Accelerator", badge: "network", conceptLabel: "What it is:", concept: "Uses the AWS global network to route traffic to the optimal healthy endpoint, improving performance for TCP/UDP apps.", navLabel: "One-liner to remember:", nav: "Routes traffic over AWS backbone, not the public internet." },
    { title: "API Gateway", badge: "network", conceptLabel: "What it is:", concept: "Fully managed service to create, publish, and secure REST/WebSocket APIs at any scale.", navLabel: "One-liner to remember:", nav: "The front door for your APIs, often paired with Lambda." },
    { title: "RDS", badge: "database", conceptLabel: "What it is:", concept: "Managed relational database service supporting engines like MySQL, PostgreSQL, SQL Server, MariaDB, Oracle.", navLabel: "One-liner to remember:", nav: "Managed SQL databases — AWS handles patching/backups." },
    { title: "Aurora", badge: "database", conceptLabel: "What it is:", concept: "AWS's own MySQL/PostgreSQL-compatible relational database, built for higher performance and availability.", navLabel: "One-liner to remember:", nav: "AWS's faster, cloud-native spin on RDS." },
    { title: "DynamoDB", badge: "database", conceptLabel: "What it is:", concept: "Fully managed, serverless key-value and document NoSQL database with single-digit millisecond performance.", navLabel: "One-liner to remember:", nav: "NoSQL, serverless, scales automatically." },
    { title: "Redshift", badge: "database", conceptLabel: "What it is:", concept: "Fully managed petabyte-scale data warehouse for analytics and complex SQL queries.", navLabel: "One-liner to remember:", nav: "For big analytical queries, not transactional apps." },
    { title: "ElastiCache", badge: "database", conceptLabel: "What it is:", concept: "Managed in-memory caching service supporting Redis and Memcached to speed up applications.", navLabel: "One-liner to remember:", nav: "In-memory cache in front of a slower database." },
    { title: "DocumentDB", badge: "database", conceptLabel: "What it is:", concept: "Managed document database service compatible with MongoDB APIs.", navLabel: "One-liner to remember:", nav: "MongoDB-compatible, managed document store." },
    { title: "Neptune", badge: "database", conceptLabel: "What it is:", concept: "Managed graph database service for highly connected data like social networks or recommendation engines.", navLabel: "One-liner to remember:", nav: "Pick this when the data model is a graph of relationships." },
    { title: "DMS", badge: "database", conceptLabel: "What it is:", concept: "Database Migration Service that migrates databases to AWS with minimal downtime, supporting homogeneous/heterogeneous moves.", navLabel: "One-liner to remember:", nav: "The tool that moves your database into AWS." },
    { title: "IAM", badge: "security", conceptLabel: "What it is:", concept: "Service to securely manage users, groups, roles, and permissions/policies for AWS resource access.", navLabel: "One-liner to remember:", nav: "Who can do what — the core of AWS access control." },
    { title: "Organizations", badge: "security", conceptLabel: "What it is:", concept: "Centrally manages and governs multiple AWS accounts, enabling consolidated billing and account-wide policies (SCPs).", navLabel: "One-liner to remember:", nav: "Manages many AWS accounts as one family." },
    { title: "IAM Identity Center", badge: "security", conceptLabel: "What it is:", concept: "Centralized single sign-on (SSO) service for workforce access across multiple AWS accounts and applications.", navLabel: "One-liner to remember:", nav: "One login for users across many accounts/apps." },
    { title: "KMS", badge: "security", conceptLabel: "What it is:", concept: "Managed service to create and control encryption keys used to encrypt data across AWS services.", navLabel: "One-liner to remember:", nav: "The vault that manages your encryption keys." },
    { title: "ACM", badge: "security", conceptLabel: "What it is:", concept: "Provisions, manages, and deploys free SSL/TLS certificates for AWS resources.", navLabel: "One-liner to remember:", nav: "Free, auto-renewing HTTPS certificates." },
    { title: "Secrets Manager", badge: "security", conceptLabel: "What it is:", concept: "Securely stores, rotates, and retrieves secrets like database credentials and API keys.", navLabel: "One-liner to remember:", nav: "Rotating vault for passwords/API keys, unlike static Parameter Store." },
    { title: "Systems Manager", badge: "security", conceptLabel: "What it is:", concept: "Suite of tools for operational visibility and control of AWS resources, including Parameter Store and Session Manager.", navLabel: "One-liner to remember:", nav: "The ops toolbox for patching, running commands, storing config." },
    { title: "CloudTrail", badge: "security", conceptLabel: "What it is:", concept: "Logs and tracks every API call/user action made across your AWS account for auditing.", navLabel: "One-liner to remember:", nav: "The 'who did what, when' account audit log." },
    { title: "AWS Config", badge: "security", conceptLabel: "What it is:", concept: "Tracks resource configurations and changes over time, checking compliance against desired rules.", navLabel: "One-liner to remember:", nav: "Tracks configuration drift and compliance, not API calls." },
    { title: "GuardDuty", badge: "security", conceptLabel: "What it is:", concept: "Intelligent threat detection service that continuously monitors for malicious activity using machine learning.", navLabel: "One-liner to remember:", nav: "Automated threat detection watching your account." },
    { title: "Security Hub", badge: "security", conceptLabel: "What it is:", concept: "Aggregates and prioritizes security findings from GuardDuty, Inspector, Macie, and other tools in one dashboard.", navLabel: "One-liner to remember:", nav: "One pane of glass for all your security findings." },
    { title: "Inspector", badge: "security", conceptLabel: "What it is:", concept: "Automated security assessment service that scans EC2, containers, and Lambda for vulnerabilities.", navLabel: "One-liner to remember:", nav: "Automated vulnerability scanner for your workloads." },
    { title: "Macie", badge: "security", conceptLabel: "What it is:", concept: "Uses machine learning to discover and protect sensitive data (like PII) stored in S3.", navLabel: "One-liner to remember:", nav: "Finds sensitive data (PII) hiding in your S3 buckets." },
    { title: "WAF", badge: "security", conceptLabel: "What it is:", concept: "Web Application Firewall that protects web apps from common exploits like SQL injection and XSS.", navLabel: "One-liner to remember:", nav: "Filters malicious HTTP requests at the application layer." },
    { title: "Shield", badge: "security", conceptLabel: "What it is:", concept: "Managed DDoS protection service; Standard is free/automatic, Advanced adds enhanced protection and support.", navLabel: "One-liner to remember:", nav: "Protects against DDoS attacks specifically." },
    { title: "Artifact", badge: "security", conceptLabel: "What it is:", concept: "Self-service portal for on-demand access to AWS compliance reports and agreements (e.g. SOC, PCI).", navLabel: "One-liner to remember:", nav: "Download compliance/audit reports here for free." },
    { title: "Athena", badge: "analytics", conceptLabel: "What it is:", concept: "Serverless interactive query service to analyze data directly in S3 using standard SQL.", navLabel: "One-liner to remember:", nav: "SQL queries straight on S3 data, no infrastructure." },
    { title: "Glue", badge: "analytics", conceptLabel: "What it is:", concept: "Serverless ETL (extract, transform, load) service to prepare and catalog data for analytics.", navLabel: "One-liner to remember:", nav: "Cleans/moves data and builds the data catalog." },
    { title: "QuickSight", badge: "analytics", conceptLabel: "What it is:", concept: "Serverless business intelligence service for building interactive dashboards and visualizations.", navLabel: "One-liner to remember:", nav: "AWS's BI/dashboarding tool." },
    { title: "EMR", badge: "analytics", conceptLabel: "What it is:", concept: "Managed cluster platform for big data frameworks like Hadoop and Spark.", navLabel: "One-liner to remember:", nav: "Managed Hadoop/Spark clusters for big data processing." },
    { title: "Kinesis", badge: "analytics", conceptLabel: "What it is:", concept: "Family of services for real-time streaming data ingestion, processing, and analysis.", navLabel: "One-liner to remember:", nav: "Real-time streaming data, not batch." },
    { title: "OpenSearch Service", badge: "analytics", conceptLabel: "What it is:", concept: "Managed service for deploying and scaling OpenSearch (Elasticsearch) clusters for search and log analytics.", navLabel: "One-liner to remember:", nav: "Managed search/log analytics engine (formerly Elasticsearch Service)." },
    { title: "SageMaker", badge: "ml", conceptLabel: "What it is:", concept: "Fully managed platform to build, train, and deploy machine learning models at scale.", navLabel: "One-liner to remember:", nav: "The end-to-end platform for building custom ML models." },
    { title: "Rekognition", badge: "ml", conceptLabel: "What it is:", concept: "Pre-trained service for image and video analysis, including facial recognition and object detection.", navLabel: "One-liner to remember:", nav: "Computer vision — analyzes pictures and video." },
    { title: "Comprehend", badge: "ml", conceptLabel: "What it is:", concept: "Natural language processing service that extracts insights, sentiment, and entities from text.", navLabel: "One-liner to remember:", nav: "Understands sentiment/meaning in written text." },
    { title: "Textract", badge: "ml", conceptLabel: "What it is:", concept: "Extracts text, forms, and tables automatically from scanned documents and images.", navLabel: "One-liner to remember:", nav: "OCR that also understands document structure." },
    { title: "Transcribe", badge: "ml", conceptLabel: "What it is:", concept: "Automatic speech-to-text service that converts audio into written transcripts.", navLabel: "One-liner to remember:", nav: "Speech to text." },
    { title: "Polly", badge: "ml", conceptLabel: "What it is:", concept: "Text-to-speech service that turns written text into lifelike spoken audio.", navLabel: "One-liner to remember:", nav: "Text to speech (the reverse of Transcribe)." },
    { title: "Translate", badge: "ml", conceptLabel: "What it is:", concept: "Neural machine translation service for fast, high-quality language translation of text.", navLabel: "One-liner to remember:", nav: "Automatic language translation." },
    { title: "Lex", badge: "ml", conceptLabel: "What it is:", concept: "Service for building conversational chatbots and voice interfaces using the same tech behind Alexa.", navLabel: "One-liner to remember:", nav: "Builds chatbots/voice assistants." },
    { title: "Personalize", badge: "ml", conceptLabel: "What it is:", concept: "Managed ML service to build real-time personalized product/content recommendations, based on Amazon's own tech.", navLabel: "One-liner to remember:", nav: "'Customers who bought this also bought...' engine." },
    { title: "Forecast", badge: "ml", conceptLabel: "What it is:", concept: "Managed ML service for time-series forecasting, e.g. demand or inventory predictions.", navLabel: "One-liner to remember:", nav: "Predicts future numbers from historical time-series data." },
    { title: "SQS", badge: "integration", conceptLabel: "What it is:", concept: "Fully managed message queuing service that decouples and buffers messages between application components.", navLabel: "One-liner to remember:", nav: "A queue for decoupling — one message, one consumer typically." },
    { title: "SNS", badge: "integration", conceptLabel: "What it is:", concept: "Fully managed pub/sub messaging service that pushes notifications to multiple subscribers at once.", navLabel: "One-liner to remember:", nav: "Broadcast/fan-out to many subscribers, unlike SQS's queue." },
    { title: "EventBridge", badge: "integration", conceptLabel: "What it is:", concept: "Serverless event bus that routes events between AWS services, SaaS apps, and custom applications.", navLabel: "One-liner to remember:", nav: "Rules-based event routing/bus across services." },
    { title: "Step Functions", badge: "integration", conceptLabel: "What it is:", concept: "Serverless orchestration service to coordinate multiple AWS services (often Lambdas) into visual workflows.", navLabel: "One-liner to remember:", nav: "Visual state machine that chains steps/Lambdas together." },
    { title: "CloudWatch", badge: "management", conceptLabel: "What it is:", concept: "Monitoring and observability service collecting metrics, logs, and alarms across AWS resources.", navLabel: "One-liner to remember:", nav: "Metrics, logs, and alarms — AWS's monitoring hub." },
    { title: "Trusted Advisor", badge: "management", conceptLabel: "What it is:", concept: "Automated tool that inspects your account and gives recommendations across cost, performance, security, and fault tolerance.", navLabel: "One-liner to remember:", nav: "Your automated best-practices checkup." },
    { title: "Control Tower", badge: "management", conceptLabel: "What it is:", concept: "Sets up and governs a secure, multi-account AWS environment based on best-practice landing zones.", navLabel: "One-liner to remember:", nav: "Automates setting up a well-governed multi-account landing zone." },
    { title: "CloudFormation", badge: "management", conceptLabel: "What it is:", concept: "Infrastructure-as-code service that provisions AWS resources from declarative JSON/YAML templates.", navLabel: "One-liner to remember:", nav: "Define infrastructure as code and deploy it repeatably." },
    { title: "Migration Hub", badge: "migration", conceptLabel: "What it is:", concept: "Central place to track the progress of application migrations across multiple AWS and partner tools.", navLabel: "One-liner to remember:", nav: "One dashboard tracking all your migration projects." },
    { title: "Application Discovery Service", badge: "migration", conceptLabel: "What it is:", concept: "Collects usage and configuration data from on-premises servers to plan a migration.", navLabel: "One-liner to remember:", nav: "Finds out what you actually have on-prem before migrating." },
    { title: "CodeCommit", badge: "devtools", conceptLabel: "What it is:", concept: "Fully managed private Git source control repository hosting service.", navLabel: "One-liner to remember:", nav: "AWS's own private Git repo hosting." },
    { title: "CodeBuild", badge: "devtools", conceptLabel: "What it is:", concept: "Fully managed build service that compiles code, runs tests, and produces deployable packages.", navLabel: "One-liner to remember:", nav: "Compiles/tests code — the 'build' in CI/CD." },
    { title: "CodeDeploy", badge: "devtools", conceptLabel: "What it is:", concept: "Automates code deployments to EC2, on-premises servers, Lambda, or ECS.", navLabel: "One-liner to remember:", nav: "Automates the 'deploy' step to your compute targets." },
    { title: "CodePipeline", badge: "devtools", conceptLabel: "What it is:", concept: "Fully managed continuous delivery service that automates build, test, and deploy release pipelines.", navLabel: "One-liner to remember:", nav: "Orchestrates the whole CI/CD pipeline end to end." },
    { title: "Cloud9", badge: "devtools", conceptLabel: "What it is:", concept: "Cloud-based IDE for writing, running, and debugging code directly in the browser.", navLabel: "One-liner to remember:", nav: "An IDE that lives in your browser, no local setup." },
    { title: "X-Ray", badge: "devtools", conceptLabel: "What it is:", concept: "Distributed tracing service that helps analyze and debug requests as they travel through microservices.", navLabel: "One-liner to remember:", nav: "Traces a single request across many services to find bottlenecks." },
    { title: "IoT Core", badge: "management", conceptLabel: "What it is:", concept: "Managed cloud service that lets connected IoT devices securely interact with cloud applications and other devices.", navLabel: "One-liner to remember:", nav: "The gateway connecting IoT devices to the cloud." },
    { title: "Pricing Calculator", badge: "management", conceptLabel: "What it is:", concept: "Free web tool to estimate the cost of AWS services before you build/deploy anything.", navLabel: "One-liner to remember:", nav: "Estimate cost before you build, not after." },
    { title: "Cost Explorer", badge: "management", conceptLabel: "What it is:", concept: "Visualization tool to view, analyze, and understand your historical and forecasted AWS spend patterns.", navLabel: "One-liner to remember:", nav: "Visualize and explore where past/future spend is going." },
    { title: "Budgets", badge: "management", conceptLabel: "What it is:", concept: "Lets you set custom cost/usage thresholds and receive alerts when they are exceeded or forecasted to be.", navLabel: "One-liner to remember:", nav: "Set a spend limit and get alerted before/when you hit it." },
    { title: "Cost and Usage Report", badge: "management", conceptLabel: "What it is:", concept: "The most comprehensive, granular breakdown of AWS costs and usage, deliverable to S3 for detailed analysis.", navLabel: "One-liner to remember:", nav: "The most detailed raw billing data export available." },
    { title: "Compute Optimizer", badge: "management", conceptLabel: "What it is:", concept: "Uses machine learning to analyze resource utilization and recommend optimal instance types/sizes.", navLabel: "One-liner to remember:", nav: "ML-driven 'you're over/under-provisioned' recommendations." },
    { title: "Well-Architected Tool", badge: "management", conceptLabel: "What it is:", concept: "Free tool to review workloads against the AWS Well-Architected Framework's six pillars and get improvement guidance.", navLabel: "One-liner to remember:", nav: "Self-review your architecture against the 6 pillars." }
  ]
}

};

const QUIZ = [
  {
    q: "Which of the following is a core advantage of cloud computing as described by AWS?",
    options: ["You must forecast infrastructure capacity months in advance", "You trade capital expense for variable expense", "You are required to sign multi-year hardware contracts", "You must manage physical data centers yourself"],
    correct: 1
  },
  {
    q: "A startup expects unpredictable traffic spikes during product launches. Which cloud characteristic allows them to automatically scale resources up and down to match demand?",
    options: ["High availability", "Elasticity", "Fault tolerance", "Consolidated billing"],
    correct: 1
  },
  {
    q: "Which AWS Well-Architected Framework pillar focuses on the ability to run workloads effectively, gain insight into operations, and continuously improve supporting processes?",
    options: ["Performance Efficiency", "Cost Optimization", "Operational Excellence", "Reliability"],
    correct: 2
  },
  {
    q: "A company wants to run some workloads in an on-premises data center while running others in AWS, with integration between the two environments. Which deployment model does this describe?",
    options: ["All-in cloud", "Private cloud", "Hybrid cloud", "On-premises"],
    correct: 2
  },
  {
    q: "Which AWS global infrastructure component consists of one or more discrete data centers with redundant power, networking, and connectivity?",
    options: ["Region", "Availability Zone", "Edge location", "Local Zone"],
    correct: 1
  },
  {
    q: "A company needs to deploy an application close to end users in a specific city to achieve single-digit millisecond latency for a specific use case, without deploying a full Region. What should they use?",
    options: ["An additional AWS Region", "An Availability Zone", "A placement group", "A Local Zone"],
    correct: 3
  },
  {
    q: "Which of the following BEST describes 'high availability' in the context of AWS architecture?",
    options: ["The system automatically adds more compute during peak demand", "The system minimizes cost by shutting down unused resources", "The system operates with minimal downtime, often through redundancy across multiple Availability Zones", "The system uses only serverless services"],
    correct: 2
  },
  {
    q: "Which Well-Architected Framework pillar is primarily concerned with protecting data, systems, and assets through risk assessments and mitigation strategies?",
    options: ["Security", "Sustainability", "Reliability", "Cost Optimization"],
    correct: 0
  },
  {
    q: "A company is evaluating cloud adoption and wants to avoid large upfront investments in physical servers. Which economic benefit of the cloud does this describe?",
    options: ["Economies of scale", "Trading capital expense for variable expense", "Global reach", "Increased speed and agility"],
    correct: 1
  },
  {
    q: "What is the relationship between AWS Regions and Availability Zones?",
    options: ["Each Region contains exactly one Availability Zone", "Availability Zones span multiple Regions", "A Region is a geographic area that contains multiple, isolated Availability Zones", "Availability Zones are only used for storage services"],
    correct: 2
  },
  {
    q: "A company wants to reduce the time it takes to experiment with new ideas and deploy them to production. Which cloud benefit does this best illustrate?",
    options: ["Reduced total cost of ownership only", "Increased speed and agility", "Going global in minutes", "Stop guessing capacity"],
    correct: 1
  },
  {
    q: "Which statement correctly distinguishes scalability from elasticity?",
    options: ["Scalability and elasticity mean exactly the same thing", "Elasticity only applies to storage services", "Scalability only applies to Amazon EC2 Spot Instances", "Scalability is the ability to increase resources to meet demand; elasticity is the ability to automatically scale resources up and down as demand changes"],
    correct: 3
  },
  {
    q: "Which of the following is an example of AWS achieving 'economies of scale' that benefits customers?",
    options: ["AWS raises prices annually regardless of demand", "As AWS's infrastructure usage grows, AWS can achieve better economies of scale and pass on cost savings via price reductions", "Customers must purchase hardware in bulk to get discounts", "Economies of scale only apply to enterprise support customers"],
    correct: 1
  },
  {
    q: "Which pillar of the AWS Well-Architected Framework was added to help customers minimize the environmental impacts of running workloads in the cloud?",
    options: ["Security", "Cost Optimization", "Sustainability", "Reliability"],
    correct: 2
  },
  {
    q: "A media company wants to launch its application to customers in Europe, Asia, and North America within days rather than months. Which cloud benefit does AWS's global infrastructure primarily provide here?",
    options: ["Stop guessing capacity", "Go global in minutes", "Variable expense", "Economies of scale"],
    correct: 1
  },
  {
    q: "Under the AWS Shared Responsibility Model, which of the following is ALWAYS the customer's responsibility?",
    options: ["Physical security of data centers", "Patching the underlying hypervisor", "Configuring security groups and network ACLs for their resources", "Decommissioning of storage devices"],
    correct: 2
  },
  {
    q: "Under the AWS Shared Responsibility Model, AWS is responsible for 'security of the cloud.' What does this include?",
    options: ["Configuring IAM policies for the customer's users", "Encrypting the customer's application data", "Protecting the global infrastructure that runs all AWS services, including hardware, software, networking, and facilities", "Patching the customer's guest operating system"],
    correct: 2
  },
  {
    q: "A company's root user credentials were used to log in and perform daily administrative tasks. What is the BEST practice AWS recommends regarding the root user?",
    options: ["Use the root user for all daily tasks since it has full permissions", "Lock away the root user credentials, enable MFA, and use IAM users/roles for daily tasks", "Share the root user credentials with all administrators", "Disable MFA on the root user for convenience"],
    correct: 1
  },
  {
    q: "Which AWS service allows you to manage users, groups, roles, and permissions to control access to AWS resources?",
    options: ["Amazon Cognito", "AWS Organizations", "AWS IAM", "AWS Directory Service"],
    correct: 2
  },
  {
    q: "A security team needs a service that continuously monitors AWS accounts and workloads for malicious activity, such as unusual API calls or potentially unauthorized behavior, using threat intelligence. Which service should they use?",
    options: ["AWS Config", "Amazon GuardDuty", "AWS CloudTrail", "AWS Trusted Advisor"],
    correct: 1
  },
  {
    q: "Which AWS service records API calls made on your account and delivers log files for governance, compliance, and operational auditing, answering the question 'who did what and when'?",
    options: ["Amazon CloudWatch", "AWS CloudTrail", "AWS Config", "Amazon GuardDuty"],
    correct: 1
  },
  {
    q: "A company needs to assess, audit, and evaluate the configurations of their AWS resources over time and detect if resources drift from a desired compliant state. Which service fits this need?",
    options: ["AWS CloudTrail", "Amazon Inspector", "AWS Artifact", "AWS Config"],
    correct: 3
  },
  {
    q: "Which service provides a comprehensive view of security alerts and compliance status across an AWS account by aggregating findings from services like GuardDuty, Inspector, and Macie?",
    options: ["AWS Security Hub", "AWS Config", "Amazon Macie", "AWS Trusted Advisor"],
    correct: 0
  },
  {
    q: "A company must automatically discover and protect sensitive data, such as personally identifiable information (PII), stored in Amazon S3. Which service should they use?",
    options: ["Amazon Inspector", "AWS Shield", "Amazon Macie", "AWS KMS"],
    correct: 2
  },
  {
    q: "Which service performs automated security assessments of Amazon EC2 instances and container workloads to check for software vulnerabilities and unintended network exposure?",
    options: ["Amazon Inspector", "Amazon GuardDuty", "AWS Config", "AWS Firewall Manager"],
    correct: 0
  },
  {
    q: "A company needs on-demand access to AWS compliance reports and agreements, such as SOC and PCI reports, to satisfy auditors. Which service should they use?",
    options: ["AWS Trusted Advisor", "AWS Config", "AWS Audit Manager", "AWS Artifact"],
    correct: 3
  },
  {
    q: "Which AWS service helps protect web applications from common web exploits such as SQL injection and cross-site scripting by allowing you to configure rules that filter HTTP/HTTPS traffic?",
    options: ["AWS Shield", "Amazon GuardDuty", "AWS WAF", "AWS Firewall Manager"],
    correct: 2
  },
  {
    q: "A company wants managed protection against Distributed Denial of Service (DDoS) attacks for their internet-facing applications. Which service provides this?",
    options: ["AWS WAF", "AWS Shield", "AWS Secrets Manager", "AWS IAM"],
    correct: 1
  },
  {
    q: "Which statement about AWS Key Management Service (KMS) is correct?",
    options: ["KMS is used only for managing IAM user passwords", "KMS lets you create and control cryptographic keys used to encrypt your data", "KMS replaces the need for IAM policies", "KMS is a free service with no key usage limits"],
    correct: 1
  },
  {
    q: "Which IAM feature allows you to grant temporary permissions to an AWS service or federated user without sharing long-term credentials?",
    options: ["IAM groups", "IAM roles", "IAM users", "IAM access keys"],
    correct: 1
  },
  {
    q: "Which statement about Multi-Factor Authentication (MFA) in AWS is TRUE?",
    options: ["MFA replaces the need for a password entirely", "MFA can only be enabled for the root user", "MFA is automatically enabled for all new IAM users", "MFA adds an extra layer of security by requiring a second authentication factor in addition to a username and password"],
    correct: 3
  },
  {
    q: "Which of the following is NOT a recommended IAM best practice?",
    options: ["Grant least privilege permissions", "Enable MFA for privileged users", "Share a single IAM user's credentials among an entire team", "Use IAM roles instead of long-term access keys where possible"],
    correct: 2
  },
  {
    q: "A healthcare company needs to store and manage database credentials and automatically rotate them on a schedule. Which service should they use?",
    options: ["AWS IAM", "AWS Secrets Manager", "Amazon Cognito", "AWS Certificate Manager"],
    correct: 1
  },
  {
    q: "Which encryption approach allows AWS to manage the encryption keys entirely on the customer's behalf, requiring the least operational effort from the customer?",
    options: ["Client-side encryption with customer-managed keys", "No encryption at all", "Encryption managed entirely on-premises", "Server-side encryption with AWS-owned or AWS-managed keys"],
    correct: 3
  },
  {
    q: "Which statement about AWS CloudTrail is FALSE?",
    options: ["CloudTrail can log management and data events", "CloudTrail helps with governance, compliance, and operational auditing", "CloudTrail is used to collect and monitor performance metrics like CPU utilization", "CloudTrail records API calls made within an AWS account"],
    correct: 2
  },
  {
    q: "A retail company wants a fully managed database that automatically scales storage, is compatible with MySQL, and removes the need to manage database infrastructure. Which service best fits?",
    options: ["Amazon RDS", "Amazon EC2 with a self-managed database", "Amazon S3", "AWS Lambda"],
    correct: 0
  },
  {
    q: "A company needs object storage for static website assets that is highly durable and accessible over HTTP/HTTPS. Which service should they choose?",
    options: ["Amazon EBS", "Amazon EFS", "Amazon S3", "Amazon RDS"],
    correct: 2
  },
  {
    q: "A company has rarely accessed archival data that must be retained for 7 years for compliance, with retrieval times of several hours being acceptable. Which S3 storage class minimizes cost for this use case?",
    options: ["S3 Standard", "S3 Standard-IA", "S3 Glacier Deep Archive", "S3 Intelligent-Tiering"],
    correct: 2
  },
  {
    q: "A company wants to run containerized applications without managing the underlying EC2 instances or Kubernetes control plane. Which combination of services fits this serverless container need?",
    options: ["Amazon EC2 with manually installed Docker", "AWS Lambda only", "Amazon S3 with static website hosting", "Amazon ECS or EKS on AWS Fargate"],
    correct: 3
  },
  {
    q: "A developer wants to run code in response to events, such as an S3 upload, without provisioning or managing servers, and pay only for compute time used. Which service fits this?",
    options: ["AWS Lambda", "Amazon EC2", "Amazon Lightsail", "AWS Elastic Beanstalk"],
    correct: 0
  },
  {
    q: "A company needs an isolated virtual network within AWS where they can define subnets, route tables, and gateways for their resources. Which service provides this?",
    options: ["AWS Direct Connect", "Amazon Route 53", "AWS Transit Gateway", "Amazon VPC"],
    correct: 3
  },
  {
    q: "A company wants a dedicated, private network connection from their on-premises data center to AWS that does not traverse the public internet, for consistent network performance. Which service should they use?",
    options: ["AWS Direct Connect", "AWS VPN", "Amazon Route 53", "AWS Site-to-Site VPN"],
    correct: 0
  },
  {
    q: "Which AWS service is a highly available and scalable Domain Name System (DNS) web service used to route end-user requests to endpoints?",
    options: ["Amazon Route 53", "Amazon CloudFront", "AWS Global Accelerator", "Elastic Load Balancing"],
    correct: 0
  },
  {
    q: "A company wants to distribute incoming application traffic automatically across multiple EC2 instances in different Availability Zones to improve fault tolerance. Which service should they use?",
    options: ["Amazon Route 53 only", "AWS Direct Connect", "Amazon CloudFront", "Elastic Load Balancing"],
    correct: 3
  },
  {
    q: "A media company wants to cache and deliver video content with low latency to users around the world. Which service is designed for this content delivery use case?",
    options: ["Amazon CloudFront", "AWS Direct Connect", "Amazon VPC", "AWS Transit Gateway"],
    correct: 0
  },
  {
    q: "A company needs a fully managed NoSQL database with single-digit millisecond performance at any scale for a gaming application's session data. Which service fits best?",
    options: ["Amazon RDS", "Amazon Redshift", "Amazon Aurora", "Amazon DynamoDB"],
    correct: 3
  },
  {
    q: "A company wants to run complex analytical queries across petabytes of structured data for business intelligence reporting. Which service is purpose-built for data warehousing?",
    options: ["Amazon Redshift", "Amazon DynamoDB", "Amazon RDS", "Amazon ElastiCache"],
    correct: 0
  },
  {
    q: "A company wants to reduce database read latency for a frequently accessed dataset by adding an in-memory caching layer. Which service should they use?",
    options: ["Amazon Redshift", "Amazon S3 Glacier", "AWS Storage Gateway", "Amazon ElastiCache"],
    correct: 3
  },
  {
    q: "A company needs to decouple microservices by having producers send messages to a queue that consumers poll independently, ensuring messages are processed reliably even if a consumer is temporarily unavailable. Which service fits this?",
    options: ["Amazon SNS", "Amazon SQS", "Amazon EventBridge", "AWS Step Functions"],
    correct: 1
  },
  {
    q: "A company wants to send a single notification that fans out to multiple subscribers, such as email addresses and Lambda functions simultaneously, when an event occurs. Which service is designed for this pub/sub pattern?",
    options: ["Amazon SNS", "Amazon SQS", "Amazon Kinesis", "AWS Direct Connect"],
    correct: 0
  },
  {
    q: "A company wants to build an event-driven architecture that routes events from various AWS services and SaaS applications to different targets based on rules. Which service fits best?",
    options: ["Amazon SQS", "AWS Batch", "Amazon Route 53", "Amazon EventBridge"],
    correct: 3
  },
  {
    q: "A company wants to analyze images and videos to identify objects, people, and faces automatically. Which AWS service should they use?",
    options: ["Amazon Rekognition", "Amazon Textract", "Amazon Transcribe", "Amazon Polly"],
    correct: 0
  },
  {
    q: "A company wants to run SQL queries directly against data stored in Amazon S3 without setting up and managing servers. Which service fits this?",
    options: ["Amazon Athena", "Amazon Redshift", "Amazon RDS", "AWS Glue"],
    correct: 0
  },
  {
    q: "Which AWS migration strategy involves moving an application to the cloud without making any changes, sometimes called 'lift and shift'?",
    options: ["Rehost", "Refactor", "Replatform", "Retire"],
    correct: 0
  },
  {
    q: "Which of the '6 R's' of migration involves re-architecting an application to take full advantage of cloud-native features, typically the most time-consuming approach?",
    options: ["Rehost", "Repurchase", "Retain", "Refactor / Re-architect"],
    correct: 3
  },
  {
    q: "Which AWS service provides recommendations across cost optimization, performance, security, fault tolerance, and service limits for an AWS account?",
    options: ["Amazon CloudWatch", "AWS Config", "AWS Compute Optimizer", "AWS Trusted Advisor"],
    correct: 3
  },
  {
    q: "Which service is best used to monitor performance metrics, set alarms, and collect logs across AWS resources in near real time?",
    options: ["Amazon CloudWatch", "AWS CloudTrail", "AWS Config", "AWS X-Ray"],
    correct: 0
  },
  {
    q: "A company wants to model, provision, and manage AWS infrastructure using code templates written in JSON or YAML, enabling repeatable deployments. Which service should they use?",
    options: ["AWS Config", "AWS Systems Manager", "Amazon CloudWatch", "AWS CloudFormation"],
    correct: 3
  },
  {
    q: "Which AWS support plan provides access to a designated Technical Account Manager (TAM) and is generally intended for business-critical workloads?",
    options: ["Enterprise Support", "Basic Support", "Developer Support", "Business Support"],
    correct: 0
  },
  {
    q: "A company wants to commit to a consistent amount of compute usage (measured in $/hour) for a 1- or 3-year term across instance families and Regions in exchange for a lower price than On-Demand, while retaining flexibility to change instance types. Which pricing option fits best?",
    options: ["Spot Instances", "Dedicated Hosts", "Reserved Instances only", "Savings Plans"],
    correct: 3
  },
  {
    q: "A company has a fault-tolerant, flexible batch-processing workload that can be interrupted and wants the deepest possible discount on EC2 compute. Which purchasing option should they use?",
    options: ["Spot Instances", "On-Demand Instances", "Reserved Instances", "Savings Plans"],
    correct: 0
  },
  {
    q: "Which AWS Free Tier type provides a certain amount of usage free for 12 months after initial sign-up, such as 750 hours of a t2.micro instance per month?",
    options: ["Always Free", "12-Months Free", "Trials", "Free Tier for Enterprise"],
    correct: 1
  },
  {
    q: "A finance team wants to forecast future AWS costs and estimate the cost of an architecture BEFORE deploying any resources. Which tool should they use?",
    options: ["AWS Cost Explorer", "AWS Budgets", "AWS Cost and Usage Report", "AWS Pricing Calculator"],
    correct: 3
  },
  {
    q: "A company wants to receive an alert when their AWS spending is forecasted to exceed a set threshold for the month. Which service should they use?",
    options: ["AWS Cost Explorer", "AWS Pricing Calculator", "AWS Trusted Advisor", "AWS Budgets"],
    correct: 3
  },
  {
    q: "A company with multiple AWS accounts under one organization wants to combine usage across accounts to potentially reach volume pricing discounts and receive one bill. Which AWS Organizations feature enables this?",
    options: ["Service Control Policies", "IAM Identity Center", "AWS Control Tower", "Consolidated Billing"],
    correct: 3
  }
];
