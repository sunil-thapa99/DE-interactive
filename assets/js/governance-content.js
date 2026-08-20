// Content data for the Data Governance, Security & Privacy module.
// Senior-DE interview focus. Examples lean on healthcare (HIPAA/PHI) and finance (PCI/financial data).
const MODULE_ID = "governance";
const CONTENT = {

overview: {
  intro: {
    title: "Data Governance, Security & Privacy — the trust layer",
    desc: "Governance is how an organization keeps data correct, protected, discoverable, and compliant — it's people, process, and policy over data, not a single tool you install. This module goes from fundamentals to the senior cross-exam: what governance actually is, access control, PII/PHI/PCI privacy regimes, catalogs and lineage, and the interview scenarios that separate a senior from a mid-level. Examples use claims/PHI (HIPAA) and transaction/card data (PCI) to match real regulated pipelines."
  },
  cards: [
    {
      title: "What data governance actually is (people + process + policy)",
      badge: "fundamentals",
      conceptLabel: "The core idea:",
      concept: "Data governance is the framework of people, process, and policy that decides who can do what with which data, and holds someone accountable for it. It is NOT a product you buy — a catalog or an IAM tool are just enablers. The substance is ownership (someone owns each dataset), rules (classification, access, retention), and enforcement (the controls that make the rules real). A tool with no owners and no policy is shelfware; policy with no tooling is a wiki nobody follows. Governance is the marriage of the two, plus the humans accountable when it breaks.",
      noteLabel: "In practice:",
      note: "Treat governance as a system, not a purchase. The winning setup names an owner per dataset, writes down the classification and access rules, and then wires those rules into the platform so they enforce automatically.<br><br>The failure mode is buying Collibra or Unity Catalog, calling it 'governance done', and having no owners or policy behind it. The tool without the people and process is just an empty cabinet.",
      followups: [
        { q: "\"Who actually owns a dataset — the business or engineering?\"", a: "Usually the business domain that produces or depends on it, because they understand what it means and who should see it. Engineering is custodian of the platform, not owner of the meaning. In healthcare, the claims dataset is owned by the claims business unit, with a DE team running the pipes." },
        { q: "\"How do you get governance off the ground without boiling the ocean?\"", a: "Start with the highest-risk data, usually PHI or PCI, and govern that first. Name owners, classify it, and wire up access controls there before expanding. Trying to govern everything at once stalls; a narrow high-value slice shows value and builds momentum." },
        { q: "\"What breaks first when a company skips governance?\"", a: "Trust and audits. Analysts stop believing the numbers because nobody owns correctness, and the first compliance audit exposes that no one can say who accessed PHI. You also get duplicate datasets nobody can reconcile." }
      ]
    },
    {
      title: "Why it matters — compliance, trust, security, discoverability",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Governance pays off in four ways. Compliance: HIPAA, GDPR, PCI-DSS, and SOX carry real fines and audit obligations, and you need to prove control, not just claim it. Trust: analysts and models are only as good as the data's correctness and clarity of meaning. Security: knowing where sensitive data lives is the precondition for protecting it — you can't secure PHI you didn't know was in a column. Discoverability: without a catalog, people rebuild datasets that already exist and query the wrong table. Weak governance shows up as breaches, failed audits, and duplicated, distrusted data.",
      noteLabel: "In practice:",
      note: "The pitch to leadership is risk plus velocity, not bureaucracy. Good governance avoids fines and breaches, and it makes teams faster because they can find trusted data instead of reinventing it.<br><br>In regulated shops the compliance angle usually funds the program, but discoverability and trust are what make engineers actually use it.",
      followups: [
        { q: "\"Leadership sees governance as pure cost. How do you justify it?\"", a: "Frame it as risk reduction plus velocity, not overhead. Quantify the downside: HIPAA fines, breach costs, failed audits. Then show the upside: teams find trusted data faster instead of rebuilding it. The compliance risk usually funds it, the velocity keeps it funded." },
        { q: "\"What's a concrete cost of bad discoverability specifically?\"", a: "Duplicated work and wrong answers. Analysts rebuild datasets that already exist because they can't find them, and different teams report different numbers from different copies of the 'same' data. That erodes trust in every dashboard." },
        { q: "\"Isn't compliance the only reason regulated shops care?\"", a: "It's the funding reason, but not the only value. Once the controls exist, the same metadata drives discoverability and quality, which analysts and data scientists benefit from daily. Compliance opens the budget; the day-to-day usefulness is what sustains adoption." }
      ]
    },
    {
      title: "Governance vs security vs privacy — three different things",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "These get conflated but they're distinct. Governance is the broad discipline: ownership, policy, quality, and lifecycle across all data. Security is protecting data from unauthorized access and breach — access control, encryption, network isolation, secrets. Privacy is specifically about personal data and individuals' rights — lawful use, consent, minimization, deletion, and the regimes (HIPAA, GDPR, CCPA) that govern it. Security is a subset of controls; privacy is about a class of data and legal obligations to people. You can be secure but not private (locked-down data you're still using unlawfully) or private-minded but insecure (good policy, no encryption).",
      noteLabel: "In practice:",
      note: "Governance is the umbrella; security and privacy are two things it must cover. Security answers 'is this data protected from unauthorized access.' Privacy answers 'are we lawfully allowed to hold and use this person's data, and can they get it deleted.'<br><br>An interviewer likes when you can separate them cleanly. Encrypting a table (security) does nothing for a GDPR deletion request (privacy).",
      followups: [
        { q: "\"Give an example of secure but not private.\"", a: "A perfectly encrypted, access-controlled table of customer data that you have no lawful basis to process, or that you keep past its retention period. It's locked down tight but you shouldn't be holding or using it at all. Security is fine; privacy is violated." },
        { q: "\"Which team usually owns privacy versus security?\"", a: "Security is typically owned by an infosec team, privacy by legal or a data protection officer, with engineering implementing both. The DPO interprets GDPR and HIPAA obligations; engineering builds the controls. Treating them as one team is where obligations fall through the cracks." },
        { q: "\"Where do the three overlap in practice?\"", a: "On sensitive personal data, all three converge: governance says who owns it and how it's classified, security encrypts and restricts it, privacy governs lawful use and deletion. A PHI column is where you need all three working together, which is why regulated data is the hard case." }
      ]
    },
    {
      title: "The pillars — access, classification, lineage, quality, stewardship",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A working governance program stands on a handful of pillars. Access control: who can read/write what, enforced with least privilege. Classification: labeling data by sensitivity (public/internal/confidential/restricted) and type (PII/PHI/PCI) so controls can key off it. Lineage: knowing where data came from and where it flows, for impact analysis and audits. Quality: tests and SLAs so downstream trusts the numbers. Stewardship/ownership: a named owner and steward per domain who is accountable. These reinforce each other — classification drives access and masking, lineage proves compliance, ownership makes anyone responsible at all.",
      noteLabel: "In practice:",
      note: "Think of classification as the keystone. Once data is tagged by sensitivity, access rules, masking, and retention can all key off the tag automatically instead of being set by hand per table.<br><br>Ownership is the pillar people skip and regret. Without a named owner, every other pillar has no one to answer for it when an auditor or an incident shows up.",
      followups: [
        { q: "\"If you could only stand up two pillars first, which?\"", a: "Ownership and classification. Ownership gives you someone accountable, and classification lets every other control key off tags. With those two in place, access control, masking, and retention can be layered on as policy. Without them, the rest has no foundation." },
        { q: "\"How does data quality fit as a governance pillar, not just an engineering task?\"", a: "Quality is governance because trust is the product. Tests and SLAs are the mechanism, but governance decides who owns the quality bar and answers when it's breached. A failing test with no owner is just noise; ownership turns it into accountability." },
        { q: "\"How do the pillars reinforce each other concretely?\"", a: "Classification drives access and masking, so tagging a column PHI auto-applies its controls. Lineage proves compliance and powers impact analysis. Ownership makes someone accountable for all of it. They're not independent checkboxes; each one makes the others enforceable." }
      ]
    },
    {
      title: "Governance as enabler, not blocker — make the safe path the easy path",
      badge: "advanced",
      conceptLabel: "The senior framing:",
      concept: "The senior insight is that governance fails when it's a gate teams route around. If the compliant way to get data is a two-week ticket and the shadow way is a CSV export to a laptop, people take the CSV and you've made things less safe. The answer is to make the governed path the path of least resistance: self-service access requests with fast approval, pre-approved masked views for common needs, templates and policy-as-code so the default is compliant. Governance should feel like paved roads, not roadblocks. You measure success partly by how little shadow data exists.",
      noteLabel: "In practice:",
      note: "The goal is to make the safe path the easy path. If compliance is slower than the workaround, people work around it and you're worse off than before.<br><br>Concretely that means self-service masked views for analysts, fast automated access requests, and sensible defaults baked into templates. When the easiest way to get data is also the compliant way, shadow copies dry up on their own.",
      followups: [
        { q: "\"How do you actually detect shadow data to know if this is working?\"", a: "Monitor for uncontrolled exports and copies: large result downloads, data landing in personal cloud storage, unmanaged extracts feeding BI. Rising shadow data is the signal your governed path is too slow. It's a leading indicator, not just an audit finding." },
        { q: "\"Doesn't self-service with fast approval weaken control?\"", a: "No, because self-service is scoped, not open. Non-sensitive data or masked views can auto-approve within safe bounds, while restricted data still routes to an owner, just quickly. The point is fast and governed, not ungoverned." },
        { q: "\"What's the risk if you swing too far toward enabler and under-control?\"", a: "You leak sensitive data by making it too easy to get raw. The balance is that the easy default should be the safe default, a masked view or scoped access, not raw PHI. Enabler means paving the compliant road, not removing the guardrails." }
      ]
    }
  ]
},

access: {
  intro: {
    title: "Access control — authn, authz, RBAC/ABAC, masking, secrets",
    desc: "Who is allowed to touch what, and how you prove it. This covers authentication vs authorization, RBAC vs ABAC, least privilege and separation of duties, row- and column-level security, the masking/tokenization/encryption family, secrets management, and how it all looks in Unity Catalog, Snowflake, and AWS."
  },
  cards: [
    {
      title: "Authentication vs authorization — who you are vs what you can do",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Authentication (authn) verifies identity — proving you are who you claim, via SSO/OIDC, MFA, service principals, or keys. Authorization (authz) decides what that verified identity is allowed to do — read this table, write that schema. They're sequential: authn first, then authz. A common confusion is treating a valid login as permission; it isn't. You can be fully authenticated and still authorized for nothing. In data platforms, authn is usually delegated to an IdP (Okta, Entra, AWS IAM), and authz is expressed as grants/policies inside the platform.",
      noteLabel: "In practice:",
      note: "Authn is the bouncer checking your ID; authz is the list of rooms you're allowed into. Getting past the door doesn't mean you can enter every room.<br><br>Delegate authn to a central IdP with SSO and MFA so identity is managed once. Keep authz close to the data as grants and policies, so the platform enforces what each identity can actually touch.",
      followups: [
        { q: "\"A service account authenticates fine but jobs fail with permission errors. Which layer?\"", a: "That's authorization, not authentication. The identity is verified, it just hasn't been granted the resource it's trying to touch. You fix it with a grant scoped to exactly what the job needs, not by touching the login." },
        { q: "\"Why delegate authn to an IdP instead of managing passwords in the platform?\"", a: "Central identity means one place to enforce MFA, SSO, and offboarding. When someone leaves, you disable them once in the IdP and access everywhere drops. Per-platform credentials scatter that and leave orphaned logins nobody revokes." },
        { q: "\"How do machine identities differ from human ones here?\"", a: "Machines authenticate with service principals, keys, or workload identity rather than SSO/MFA. The authz model is the same, but the secret handling differs: rotate keys, prefer short-lived tokens, and scope the principal tightly. A leaked service key is a common breach vector." }
      ]
    },
    {
      title: "RBAC vs ABAC — roles vs attributes, and when each",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "RBAC (role-based) grants permissions to roles, and users get roles — 'analyst_claims' can read the claims marts. It's simple, auditable, and enough for most orgs. ABAC (attribute/policy-based) makes access a function of attributes — user attributes (department, clearance), resource attributes (classification=restricted, region=EU), and context (time, network) evaluated by a policy. ABAC shines when access depends on data content, not just role: 'users can see rows for their own region', 'only users tagged HIPAA-trained can read PHI-tagged columns'. RBAC struggles with combinatorial rules (a role per region per sensitivity explodes); ABAC handles that with one policy over tags. Many real systems are hybrid: RBAC for coarse access, ABAC/tags for fine-grained.",
      noteLabel: "In practice:",
      note: "Start with RBAC because it's simple and auditable, and it covers the majority of cases. Reach for ABAC when you'd otherwise have a role explosion or when access has to depend on data attributes.<br><br>The classic trigger is regional or sensitivity-based rules. 'EU analysts see EU rows' is one ABAC policy over a region attribute, versus a separate role per region in pure RBAC. In practice you run both: roles for the coarse grants, tag-driven policies for the fine ones.",
      followups: [
        { q: "\"What exactly is the 'role explosion' problem?\"", a: "When access depends on multiple independent dimensions, RBAC needs a role for each combination. Region times sensitivity times department multiplies fast into hundreds of roles nobody can manage. ABAC collapses that into a few policies over attributes." },
        { q: "\"Where do the attributes for ABAC actually come from?\"", a: "From the identity provider (department, clearance, region on the user) and from data tags (classification, region on the resource), plus session context like network or time. The policy engine reads those at query time. Your ABAC is only as good as the attribute and tag hygiene behind it." },
        { q: "\"Why not just use ABAC everywhere and skip RBAC?\"", a: "ABAC is harder to audit and reason about, since effective access is computed rather than listed. For coarse, stable access RBAC is simpler and clearer. You reserve ABAC for the fine-grained, attribute-dependent rules where RBAC would explode." }
      ]
    },
    {
      title: "Least privilege & separation of duties",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Least privilege means every identity gets the minimum access needed for its job, and nothing more — default deny, grant narrowly, review and revoke. It shrinks the blast radius of a compromised account or a mistake. Separation of duties (SoD) means no single person controls a whole sensitive process end to end — the person who can approve access shouldn't be the one who grants it; the one who writes a payout job shouldn't also approve it. SoD prevents both fraud and single-point error, and it's an explicit control auditors check under SOX and PCI. In practice: scoped service accounts, time-bound elevated access, and periodic access reviews.",
      noteLabel: "In practice:",
      note: "Default to deny and grant the narrowest thing that works, then review access on a schedule so it doesn't drift wide. Broad standing access is the thing that turns one compromised token into a breach.<br><br>Separation of duties splits sensitive workflows so no one person owns the whole chain. Requester, approver, and grantor should be different people or systems. Auditors specifically look for this under SOX and PCI.",
      followups: [
        { q: "\"How do you enforce least privilege without constant access-request tickets slowing people down?\"", a: "Use scoped default roles that cover the common case plus fast self-service for the rest, and just-in-time elevation for the occasional need. The goal is narrow standing access with a quick path to more, not a ticket for every query. Broad grants to avoid tickets is the wrong trade." },
        { q: "\"Give a separation-of-duties example in a finance pipeline.\"", a: "The engineer who writes a payout or settlement job should not also be the one who approves and deploys it to prod. Split authoring from approval so no single person can push money-moving code alone. That prevents both fraud and a single unchecked mistake." },
        { q: "\"How do access reviews actually catch problems?\"", a: "They surface access that drifted wide: people who changed teams but kept old grants, service accounts with more than they use, temporary elevations that never got revoked. A periodic review with owners re-attesting is how you claw back the accumulation. Without it, permissions only ever grow." }
      ]
    },
    {
      title: "Row-level and column-level security",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Column-level security restricts which columns a user sees — hide or mask SSN/MRN/card number while exposing the rest of the row. Row-level security (RLS) restricts which rows — an analyst sees only their region's or their business unit's records. Both let many audiences share one physical table instead of maintaining copies. Implementations: Snowflake masking policies (column) and row access policies (row), Unity Catalog column masks and row filters, BigQuery policy tags and authorized views. The senior point: apply these on one governed table driven by tags/roles, rather than cutting bespoke restricted copies that drift and multiply.",
      code: "-- Snowflake: column masking policy on SSN, row access policy by region\nCREATE MASKING POLICY mask_ssn AS (val string) RETURNS string ->\n  CASE WHEN CURRENT_ROLE() IN ('COMPLIANCE') THEN val\n       ELSE 'XXX-XX-' || RIGHT(val,4) END;\nALTER TABLE claims MODIFY COLUMN ssn SET MASKING POLICY mask_ssn;\n\nCREATE ROW ACCESS POLICY region_rap AS (region string) RETURNS boolean ->\n  region = CURRENT_REGION() OR CURRENT_ROLE() = 'COMPLIANCE';\nALTER TABLE claims ADD ROW ACCESS POLICY region_rap ON (region);",
      noteLabel: "In practice:",
      note: "Column-level security controls which fields you see; row-level controls which records. Together they let one table serve many audiences without cutting bespoke copies.<br><br>The senior habit is to drive both from tags or roles on a single governed table. The moment you start making 'claims_no_ssn' and 'claims_east' copies, they drift out of sync and multiply, and now you have a governance problem instead of a policy.",
      followups: [
        { q: "\"Does dynamic masking or a row policy hurt query performance?\"", a: "There's some overhead because the policy is evaluated per query, especially row policies with subqueries or lookups. Keep the policy predicate simple and indexed where possible. It's usually well worth the cost versus maintaining separate physical copies." },
        { q: "\"How do you test that row and column policies actually work before shipping?\"", a: "Run the queries while impersonating each role or setting each session attribute, and assert the masked and filtered output matches expectations. Bake those checks into CI so a policy regression fails the build. Untested access policies are how PHI leaks quietly." },
        { q: "\"What happens if column masking and a row policy interact badly?\"", a: "They compose, but you have to reason about both: a user might be filtered to fewer rows and see masked columns on what remains. The risk is a gap where one policy assumes the other. Test the combined effect per role, not each policy in isolation." }
      ]
    },
    {
      title: "Masking vs tokenization vs encryption — when each",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "These solve different problems. Dynamic masking transforms data at query time based on who's asking — the stored value is intact, unprivileged users see 'XXX-XX-1234'. Static masking writes a permanently obscured copy, common for lower environments so dev never holds real PHI. Tokenization replaces a sensitive value with a meaningless token, with the real value held in a separate secure vault; the token can preserve format and referential joins without exposing data, and it's a core PCI strategy to shrink scope. Encryption makes data unreadable without a key and is reversible with that key; it protects data at rest and in transit but, once decrypted for use, doesn't limit who sees the plaintext. Rule of thumb: encryption for storage/transit protection, dynamic masking for role-based viewing, tokenization to remove sensitive values from a system entirely (PCI scope reduction), static masking to keep real secrets out of dev.",
      noteLabel: "In practice:",
      note: "Pick by the question you're answering. 'Protect it on disk and on the wire' is encryption. 'Let some roles see it and others not, from the same table' is dynamic masking. 'Get the raw card number out of this system but keep joins working' is tokenization. 'Give dev realistic but fake data' is static masking.<br><br>They stack. A PCI pipeline often tokenizes the PAN at ingest, encrypts everything at rest, and dynamically masks the last-four for support staff. Calling them interchangeable is the tell of a junior answer.",
      followups: [
        { q: "\"If dynamic masking leaves the real value stored, is it enough for PCI?\"", a: "Often no. PCI wants the raw PAN out of most systems, and dynamic masking still keeps it in the table for privileged roles to read. Tokenization removes it from scope entirely, which is why PCI leans on tokenization plus encryption, not masking alone." },
        { q: "\"Can tokenization preserve joins across tables?\"", a: "Yes, if it's deterministic: the same input always maps to the same token, so tokens join correctly across tables without exposing the value. Format-preserving tokenization also keeps the field's shape so downstream schemas don't break. That's a key reason it beats plain encryption for analytics." },
        { q: "\"When is static masking the wrong choice?\"", a: "When you need the real values in that environment, static masking permanently destroys them, so it's wrong for prod analytics on real data. It's right for dev and test, where realistic-but-fake is exactly what you want. Confusing it with dynamic masking is a common slip." }
      ]
    },
    {
      title: "Secrets management & platform enforcement (UC, Snowflake, AWS)",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Secrets — DB passwords, API keys, KMS keys — never belong in code, notebooks, or config committed to git. Use a vault: HashiCorp Vault, AWS Secrets Manager, Databricks secret scopes, and reference secrets at runtime, with rotation on a schedule so a leaked credential has a short life. On the authz side, each platform expresses access its own way: Unity Catalog uses a three-level namespace (catalog.schema.table) with GRANT and tag-based column masks/row filters, centralized across workspaces; Snowflake uses a role hierarchy with GRANTs plus masking and row access policies; AWS uses IAM for identity/permissions and Lake Formation for fine-grained table/column/row grants over data in S3/Glue. The through-line: express access as code/policy tied to identity, keep secrets in a vault, rotate.",
      noteLabel: "In practice:",
      note: "Rule one: no hardcoded secrets, ever. Put them in a vault or secret scope, reference them at runtime, and rotate on a schedule so a leak has a short blast radius.<br><br>For access, learn how your platform models it. Unity Catalog centralizes grants and tag-based masks across workspaces, Snowflake layers masking and row access policies on a role hierarchy, and AWS splits IAM (identity) from Lake Formation (fine-grained data grants). The concepts are the same; the syntax differs.",
      followups: [
        { q: "\"Why is a secret in a private git repo still a problem?\"", a: "Because git history is forever and repos get cloned, forked, and leaked. Once a secret is committed, rotating it is the only real fix, not deleting the line. Private is not the same as secret; use a vault and reference at runtime." },
        { q: "\"How does secret rotation actually limit damage?\"", a: "It caps the useful lifetime of a leaked credential. If secrets rotate on a schedule, a stolen key expires soon and the blast radius is bounded to that window. Short-lived tokens take this further by expiring in minutes." },
        { q: "\"What's the difference between IAM and Lake Formation in AWS specifically?\"", a: "IAM handles identity and coarse permissions on services and resources. Lake Formation adds fine-grained table, column, and row-level grants over data in S3 and Glue. You use IAM for who the principal is and Lake Formation for exactly which data cells they can read." }
      ]
    }
  ]
},

privacy: {
  intro: {
    title: "Privacy — PII/PHI/PCI, classification, encryption, subject rights",
    desc: "Personal data and the law around it. This covers PII vs PHI vs PCI and their regimes, data classification/tagging, encryption and key management, GDPR/CCPA subject rights (including why deleting one person from a data lake is genuinely hard), retention/minimization, de-identification, and data residency."
  },
  cards: [
    {
      title: "PII vs PHI vs PCI — what each is and its regime",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "These are overlapping categories of sensitive data, each with a different regulator. PII (personally identifiable information) is anything that identifies a person — name, email, SSN, address — governed broadly by GDPR (EU) and CCPA/CPRA (California). PHI (protected health information) is health data tied to an individual, governed by HIPAA in the US; it's PII plus a clinical/payment context (diagnoses, MRN, claims). PCI is cardholder data — the PAN (card number), plus related data — governed by PCI-DSS, a contractual standard from the card brands, not a law. A single record can be all three at once (a health insurance claim with a card payment). The regime determines your obligations: HIPAA's minimum-necessary and BAAs, GDPR's lawful basis and subject rights, PCI's storage prohibitions and scope rules.",
      noteLabel: "In practice:",
      note: "PII is the broad bucket, PHI is health data under HIPAA, PCI is card data under PCI-DSS. They overlap: a claims record with a copay charged to a card is PII, PHI, and PCI simultaneously.<br><br>What matters is that each regime imposes different duties. HIPAA wants minimum-necessary access and signed BAAs with vendors. GDPR wants a lawful basis and honors deletion. PCI flat-out forbids storing certain data and pushes you to tokenize to shrink scope. Know which apply to the field in front of you.",
      followups: [
        { q: "\"A single claims record can be PII, PHI, and PCI. How do you handle that?\"", a: "Classify at the field level, not the record level, and apply the strictest applicable control per field. The diagnosis is PHI under HIPAA, the card number is PCI, the name is PII. You tag each and let policy enforce the right treatment for each." },
        { q: "\"Is PCI a law like HIPAA and GDPR?\"", a: "No, PCI-DSS is a contractual standard from the card brands, not legislation. But non-compliance carries real teeth: fines, higher fees, or losing the ability to process cards. In practice you treat it as mandatory even though it's not statutory." },
        { q: "\"What's a BAA and why does HIPAA require it?\"", a: "A Business Associate Agreement is a contract binding any vendor that touches your PHI to HIPAA's safeguards. HIPAA requires it so liability and obligations follow the data to third parties like a cloud provider. No BAA means you legally can't hand them PHI." }
      ]
    },
    {
      title: "Data classification & tagging",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Classification is labeling data by sensitivity so controls can act on the label instead of on guesswork. A common scheme is four tiers: public, internal, confidential, restricted — with PHI/PCI usually landing in restricted. On top of sensitivity tiers you add type tags (PII, PHI, PCI). The payoff is automation: a column tagged 'PHI' can automatically get masked, encrypted, access-restricted, and retention-managed by policy, no per-table configuration. Classification is the keystone that makes the other controls scalable. Without it, every protection is a manual decision someone will forget.",
      noteLabel: "In practice:",
      note: "Classify first, then let the classification drive everything else. A four-tier sensitivity scale plus type tags (PII/PHI/PCI) is enough for most orgs.<br><br>The whole point is that tags become policy hooks. Tag a column 'PHI' once and masking, access rules, and retention all key off that tag automatically. Manual per-table protection doesn't scale and quietly rots; tag-driven policy does.",
      followups: [
        { q: "\"How do you classify data at scale instead of by hand?\"", a: "Combine automated PII/PHI detection (pattern and column-name scanning, tools like Macie or built-in classifiers) with human confirmation on the edge cases. Auto-tag the obvious, route the ambiguous to a steward. Pure manual doesn't keep up; pure automated misclassifies context." },
        { q: "\"A column gets classified wrong. What's the blast radius?\"", a: "Both directions hurt. Under-classifying PHI as internal leaves it unmasked and unprotected, a real breach risk. Over-classifying blocks legitimate access and drives people to workarounds. That's why classification needs an owner and periodic review, not set-and-forget." },
        { q: "\"How do you keep classification current as schemas change?\"", a: "Make tagging part of the pipeline, so new columns are classified at creation, and rescan periodically to catch drift. Ideally block deployment of an untagged sensitive-looking column. Classification that isn't enforced at write time decays as fast as the schema evolves." }
      ]
    },
    {
      title: "Encryption at rest & in transit + key management",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Encryption at rest protects stored data (disk, object storage, backups); encryption in transit (TLS) protects data moving over the network. Both are table stakes and usually on by default in cloud warehouses. The interesting part is key management. Envelope encryption is the standard pattern: data is encrypted with a data key, and that data key is itself encrypted by a master key held in a KMS (AWS KMS, Azure Key Vault, GCP KMS) — so you rotate and control the small master key without re-encrypting terabytes. BYOK (bring your own key) or CMK (customer-managed keys) let you own the master key so you can revoke access unilaterally, which matters for regulated tenants. Crypto-shredding — destroying a key to render its data unrecoverable — is built on this.",
      noteLabel: "In practice:",
      note: "At rest and in transit are both mandatory and mostly automatic in modern platforms. The real skill is key management.<br><br>Use envelope encryption so you rotate a small master key in KMS instead of re-encrypting everything. Choose customer-managed keys when you need to revoke access on your own terms, which is common in healthcare and finance. And note that owning the key enables crypto-shredding, which becomes the trick for GDPR deletion later.",
      followups: [
        { q: "\"Why bother with envelope encryption instead of one key for everything?\"", a: "So you can rotate without re-encrypting terabytes. You rotate the small master key in KMS, and it re-wraps the data keys, leaving the bulk data untouched. One key for everything means every rotation is a full re-encrypt, which is impractical at scale." },
        { q: "\"Encryption at rest is on by default. So why does key management still matter?\"", a: "Because whoever controls the key controls the data. Provider-managed keys mean the provider can technically access it; customer-managed keys let you revoke unilaterally and crypto-shred. For regulated tenants, key ownership is the real control, not just that encryption is on." },
        { q: "\"What does BYOK actually buy you over provider-managed keys?\"", a: "Unilateral control. You can revoke access or destroy the key on your own terms without the provider, which satisfies regulators who don't want the provider holding the only key. The cost is you now own key availability, so losing the key means losing the data." }
      ]
    },
    {
      title: "GDPR/CCPA subject rights — and why lake deletion is hard",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "GDPR and CCPA grant individuals rights over their data: access (give me what you hold), portability, correction, and deletion (the 'right to be forgotten'). Deletion is the operationally brutal one for data engineers. A data lake is built on immutable, columnar files (Parquet) in object storage, often partitioned and copied across bronze/silver/gold, backups, and downstream extracts — you can't just UPDATE ... WHERE user_id = X on an immutable file. Techniques: (1) crypto-shredding — encrypt each subject's data with a per-subject key and destroy the key on deletion, so the ciphertext is unrecoverable without rewriting files; (2) tombstones + compaction — mark rows deleted, then periodically rewrite files without them; (3) use a table format — Delta Lake or Apache Iceberg support row-level DELETE that handles the file rewrite/merge-on-read for you. You also have to chase copies: backups, replicas, and downstream exports all need a deletion story, which is why lineage matters.",
      noteLabel: "In practice:",
      note: "Access requests are mostly a query problem. Deletion in a lake is the genuinely hard one.<br><br>Immutable partitioned Parquet means you can't edit one person out in place. Three real approaches: crypto-shred by destroying that subject's key, tombstone-and-compact by marking rows dead and rewriting files later, or adopt Delta/Iceberg so row-level DELETE handles the rewrite for you.<br><br>The part people forget is copies. Backups, replicas, and downstream extracts all hold the data too, so you need lineage to know everywhere it went and a deletion story for each. That's why 'just delete the row' is a junior answer.",
      followups: [
        { q: "\"What's the SLA pressure on a deletion request?\"", a: "GDPR gives you about a month to comply, CCPA similar, so you can't hand-craft each deletion. It has to be a repeatable, mostly automated workflow keyed on the subject. Manual deletion doesn't meet the timeline at any real volume." },
        { q: "\"Tombstone-and-compact leaves the data in files until compaction. Is that compliant?\"", a: "There's a window where the row is marked deleted but physically still present until the rewrite. Regulators generally accept a reasonable compaction cadence, but you should compact promptly for deletion requests. Crypto-shredding avoids the window because destroying the key makes the ciphertext unreadable immediately." },
        { q: "\"How does Delta or Iceberg make row-level DELETE work on immutable files?\"", a: "They don't edit files in place. They write delete files or new data files and track them in the table's metadata log, so reads reconcile which rows are live (merge-on-read) or rewrite on compaction (copy-on-write). The engine handles the file mechanics you'd otherwise script by hand." }
      ]
    },
    {
      title: "Retention & data minimization",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Data minimization (a GDPR principle) says collect and keep only what you actually need, for only as long as you need it. Retention policy makes that concrete: each dataset gets a defined lifespan, after which it's deleted or archived automatically. This cuts risk (data you don't hold can't be breached or subpoenaed), cost, and compliance surface. Different data has different mandated retention — some financial records must be kept for years (SOX), some PII must be deleted promptly. The engineering side is automated lifecycle rules (S3 lifecycle policies, partition expiry, TTLs) and, importantly, applying them to backups and derived copies, not just the primary table.",
      noteLabel: "In practice:",
      note: "The safest data is the data you never kept. Minimization and retention are the cheapest privacy controls because they shrink what you have to protect at all.<br><br>Give every dataset an explicit lifespan and automate the expiry with lifecycle rules and partition TTLs. Watch for the conflict: SOX may force you to keep some records for years while GDPR pushes you to delete others fast, so retention has to be per-classification, not one global setting.",
      followups: [
        { q: "\"SOX says keep it seven years, GDPR says delete on request. How do you reconcile?\"", a: "They apply to different data and purposes, so you segment. Financial records under a legal-hold retention obligation are exempt from erasure for that period; general marketing PII is not. You map each dataset to its governing rule rather than picking one policy for all." },
        { q: "\"How do you actually enforce retention on object storage?\"", a: "Lifecycle rules and partition expiry: S3 lifecycle policies transition or delete objects by age, and partitioned tables drop expired partitions on a schedule. The catch is applying the same to backups and derived copies, not just the primary table." },
        { q: "\"Why is minimization a security win, not just compliance?\"", a: "Data you never collected can't be breached, subpoenaed, or mishandled. Every field you drop shrinks the attack surface and the deletion burden later. The cheapest data to protect is the data you don't have." }
      ]
    },
    {
      title: "De-identification — anonymization vs pseudonymization, residency",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "De-identification reduces how easily data ties back to a person. Pseudonymization replaces identifiers with a reversible token/key held separately — still personal data under GDPR (you can re-link it), but lower risk. Anonymization irreversibly strips identifiers so re-identification is not reasonably possible — truly anonymized data falls outside GDPR, but true anonymization is hard because of re-identification via quasi-identifiers (zip + birthdate + gender can pinpoint people). k-anonymity is a model that guards against this: generalize/suppress fields so every record is indistinguishable from at least k-1 others on the quasi-identifiers. Related: data residency/sovereignty — laws requiring certain data to physically stay in a country/region (EU data in EU regions), which drives multi-region architecture and where you can process and store data.",
      noteLabel: "In practice:",
      note: "Pseudonymization is reversible and still counts as personal data; anonymization is irreversible and, done right, escapes GDPR. Most 'anonymized' datasets are actually pseudonymized, and interviewers like when you catch that.<br><br>True anonymization is hard because quasi-identifiers re-identify people. k-anonymity generalizes fields so each person hides among at least k others. Separately, residency laws can force EU data to stay in EU regions, which becomes a real architecture constraint on where you store and process.",
      followups: [
        { q: "\"Why isn't pseudonymized data exempt from GDPR if identifiers are removed?\"", a: "Because it's reversible. You hold a key that re-links the token to the person, so the data can still be tied back to an individual and remains personal data. Only truly irreversible anonymization escapes GDPR." },
        { q: "\"What's a real re-identification risk in health data?\"", a: "Quasi-identifiers. Even without name or SSN, the combination of zip code, birth date, and gender can uniquely pinpoint a large share of people, and rare diagnoses narrow it further. That's why stripping direct identifiers isn't enough; you have to generalize the quasi-identifiers too." },
        { q: "\"How does data residency change your architecture?\"", a: "It forces regional storage and processing: EU personal data stays in EU regions, so you deploy multi-region and pin data and compute by residency. It also constrains where cross-region analytics and backups can go. It's an architecture constraint, not just a config flag." }
      ]
    }
  ]
},

catalog: {
  intro: {
    title: "Catalog, lineage, audit & stewardship",
    desc: "How you find data, trace where it flows, prove who touched it, and keep someone accountable. This covers data catalogs, column- vs table-level lineage and impact analysis, audit logging for auditors, stewardship/ownership and RACI, business glossary and discoverability, and automating governance so it doesn't rot."
  },
  cards: [
    {
      title: "Data catalogs — what they give you",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "A data catalog is the searchable inventory of your data — an index of datasets with their schemas, owners, descriptions, classifications, lineage, and usage. Options range from platform-native (Unity Catalog, AWS Glue Data Catalog) to enterprise governance suites (Collibra, Alation) to open source (DataHub, Amundsen). What they give you: discoverability (find the right table instead of asking in Slack), context (what a column means, who owns it, how fresh it is), and a control plane where tags, policies, and lineage live. Some, like Unity Catalog, are also the enforcement layer (grants and masks live there); others, like DataHub, are metadata/discovery layers that read from many systems.",
      noteLabel: "In practice:",
      note: "A catalog is the index that makes a data platform usable instead of a swamp. It answers 'does this dataset exist, what does it mean, who owns it, is it fresh' without a human in the loop.<br><br>Know the split: some catalogs are also the enforcement layer (Unity Catalog holds the grants), while others are pure discovery over many sources (DataHub, Amundsen). Pick based on whether you need it to enforce policy or just describe the landscape.",
      followups: [
        { q: "\"How does a catalog stay accurate instead of going stale like a wiki?\"", a: "It's populated automatically from the systems it describes: schemas, lineage, and usage are ingested via connectors, not typed by hand. Humans add business context on top. The technical metadata self-updates, which is exactly what a wiki can't do." },
        { q: "\"When would you pick a discovery-only catalog like DataHub over Unity Catalog?\"", a: "When your data is spread across many heterogeneous systems and you need one search layer over all of them, without moving to a single platform. Unity Catalog is great if you're on Databricks and want enforcement too. DataHub shines as vendor-neutral discovery across a mixed stack." },
        { q: "\"What makes a catalog actually get adopted versus ignored?\"", a: "Good search, trustworthy metadata, and owners who keep descriptions useful. If it's stale or empty, people go back to asking in Slack. Automated ingestion plus a light stewardship habit is what keeps it the first place people look." }
      ]
    },
    {
      title: "Data lineage — column- vs table-level, and impact analysis",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Lineage is the map of where data came from and where it flows. Table-level lineage says 'mart X is built from staging Y and source Z'. Column-level lineage is finer: 'the ssn column in this report traces back through these three transforms to this source field' — essential for privacy (proving where PHI flows) and for impact analysis. Impact analysis runs it forward: 'if I change or drop this column, what breaks downstream?' Lineage powers three things auditors and engineers care about: root-cause (a bad number, trace upstream), impact (a change, trace downstream), and compliance (prove the flow of a sensitive field end to end). Column-level is the gold standard for regulated data.",
      noteLabel: "In practice:",
      note: "Table-level lineage tells you which datasets feed which; column-level tells you the exact path a single field takes. For regulated data you want column-level, because proving where an SSN or MRN flows requires field-granularity, not 'this table feeds that table'.<br><br>The everyday payoff is impact analysis. Before dropping a column you trace it downstream to see what breaks, and when a number looks wrong you trace it upstream to the source. Same graph, run in two directions.",
      followups: [
        { q: "\"How is column-level lineage actually captured?\"", a: "By parsing the SQL or transformation logic to map output columns back to their source columns, or by tools emitting it at runtime (OpenLineage, dbt's exposures and manifest). Table-level is easy; column-level requires parsing the actual expressions. That's why not every tool offers it." },
        { q: "\"Your lineage graph has a gap where a Python job sits. What breaks?\"", a: "You lose the trace through that hop, so impact analysis and compliance proofs are incomplete right where it matters. The fix is instrumenting the job to emit lineage (OpenLineage) rather than leaving a manual note. An undocumented hop is a blind spot an auditor will find." },
        { q: "\"Why does column-level lineage matter specifically for PHI?\"", a: "Because compliance asks where a specific field flows, not just which tables connect. Proving an MRN or SSN's path to every consumer needs field granularity. Table-level lineage can't answer 'does this PHI column reach that export', which is the exact question auditors ask." }
      ]
    },
    {
      title: "Audit logging — proving who accessed what",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Audit logs record every access and action: who queried which table, when, from where, and what they did. This is a hard compliance requirement — HIPAA requires audit controls over PHI access, and auditors will ask you to produce 'who read this patient's record in the last year'. Sources: Snowflake ACCESS_HISTORY and QUERY_HISTORY, Databricks/Unity Catalog audit logs, AWS CloudTrail. The engineering job is to centralize these (often into a SIEM), retain them for the mandated period, make them tamper-evident, and be able to answer access questions quickly. The senior point: logging must be complete and queryable — a log you can't search under audit pressure is nearly useless.",
      noteLabel: "In practice:",
      note: "Audit logging answers 'who touched this data and when', and in healthcare that's a legal requirement over PHI, not a nice-to-have.<br><br>Centralize the platform logs (Snowflake ACCESS_HISTORY, Unity Catalog audit, CloudTrail) somewhere durable and searchable, retain them for the mandated window, and make sure you can actually answer an access question fast. An auditor asking 'who read this record' during a review is not the time to discover your logs aren't queryable.",
      followups: [
        { q: "\"Why centralize logs into a SIEM instead of querying each platform?\"", a: "So you can answer cross-system questions and correlate access in one place, and so logs outlive the source platform's short retention. A SIEM also adds alerting and tamper-resistance. Querying each system separately is slow and misses the full picture during an incident." },
        { q: "\"How do you make audit logs tamper-evident?\"", a: "Write them to append-only, access-restricted storage that even admins can't quietly edit, and keep integrity checks like hashing or object-lock. The point is that an insider can't cover their tracks. A log the accessed party can alter proves nothing to an auditor." },
        { q: "\"What's the difference between QUERY_HISTORY and ACCESS_HISTORY in Snowflake for this?\"", a: "QUERY_HISTORY tells you queries ran; ACCESS_HISTORY tells you which specific tables and columns each query actually touched, including through views. For proving who read a PHI column, ACCESS_HISTORY is the one that maps access down to the object level." }
      ]
    },
    {
      title: "Stewardship & ownership — owners, stewards, a RACI",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Governance dies without accountability. A data OWNER is accountable for a domain — decides access, classification, and acceptable use (often a business leader). A data STEWARD is responsible for the day-to-day: definitions, quality, metadata, fixing issues (often a hands-on analyst/engineer). Custodians (platform/DE teams) run the infrastructure the data lives on. A RACI (Responsible, Accountable, Consulted, Informed) makes this explicit per dataset or process so there's no ambiguity when a question or incident arises. The failure mode is data with no owner — nobody approves access, nobody fixes quality, and the auditor's 'who owns this' gets a shrug.",
      noteLabel: "In practice:",
      note: "Name an owner and a steward for every domain. The owner is accountable and makes the access/classification calls; the steward does the day-to-day definitions, quality, and metadata; the DE team is custodian of the platform.<br><br>A lightweight RACI per dataset removes the ambiguity. The thing to avoid at all costs is ownerless data, because every governance question about it ends in a shrug, and that's exactly what fails an audit.",
      followups: [
        { q: "\"What's the practical difference between an owner and a steward?\"", a: "The owner is accountable and makes the calls, on access, classification, and acceptable use, often a business leader. The steward does the hands-on work: definitions, quality, metadata, fixing issues. One decides, one executes; in small teams the same person wears both hats." },
        { q: "\"How does a RACI prevent finger-pointing in an incident?\"", a: "It names, per dataset, who is Responsible, Accountable, Consulted, and Informed before anything goes wrong. So when data breaks or an auditor asks, there's a documented answer instead of a scramble. Ambiguity is what turns an incident into a blame game." },
        { q: "\"Nobody wants to own a critical shared dataset. How do you resolve it?\"", a: "Escalate to leadership to assign ownership, usually to the domain that most depends on or produces it. Unowned critical data is a governance risk you make visible, not one you leave open. Sometimes the fix is splitting it so each domain owns its slice." }
      ]
    },
    {
      title: "Discoverability, glossary & automating governance (policy-as-code)",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Two ideas that keep governance alive. Discoverability plus a business glossary: a shared, authoritative definition of business terms ('what exactly counts as an active member') linked to the physical columns that implement them, so 'revenue' means one thing everywhere. Automation is the senior move: governance that's manual rots the moment the team is busy. Policy-as-code expresses access and classification rules in version-controlled code; tags drive masking and access automatically; Terraform (or dbt/CI) provisions grants so they're reviewed, repeatable, and auditable instead of clicked in a UI and forgotten. The goal is governance that enforces itself and survives turnover, rather than a binder no one updates.",
      noteLabel: "In practice:",
      note: "A business glossary makes 'revenue' or 'active member' mean one thing, tied to the actual columns that compute it, so teams stop arguing over definitions.<br><br>The bigger lever is automation. Manual governance decays fast, so put grants in Terraform, drive masking off tags, and express policy as version-controlled code that gets reviewed like any other change. Governance that enforces itself is the only kind that survives a busy quarter and staff turnover.",
      followups: [
        { q: "\"What does policy-as-code look like concretely for grants?\"", a: "Grants and masking rules live in version-controlled files, Terraform or similar, and get applied through CI with review, instead of clicked in a console. So every access change is a reviewed, auditable pull request. You can also diff and roll back, which a UI click can't." },
        { q: "\"Why does a business glossary reduce conflict, not just add docs?\"", a: "Because it pins one authoritative definition of terms like 'active member' or 'revenue' to the actual columns that compute them. Teams stop arguing over whose number is right when there's a single agreed definition. It turns semantic disputes into a lookup." },
        { q: "\"What's the failure mode of manual governance specifically?\"", a: "It rots the moment the team gets busy. Tags don't get applied, grants drift, docs go stale, and six months later the controls no longer match reality. Automation via tags and policy-as-code is what survives turnover and crunch; a binder doesn't." }
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Senior interview cross-exam",
    desc: "The scenario questions that separate senior from mid-level. Each is a real prompt with a first-person model answer and the follow-ups an interviewer will push on. Answers lean on healthcare (PHI/HIPAA) and finance (PCI) to match regulated pipelines."
  },
  cards: [
    {
      title: "\"An analyst needs claims data but must never see SSN or MRN. How?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you reach for one governed table with fine-grained controls rather than cutting a bespoke stripped copy, and whether you know column masking, tagging, and least privilege.",
      noteLabel: "Model answer:",
      note: "\"I keep one governed claims table and control the columns, not make a separate copy.<br><br>I tag SSN and MRN as PHI, then apply a column masking policy so the analyst's role sees them masked or nulled while compliance roles see the raw value. In Snowflake that's a masking policy on the column, in Unity Catalog a column mask driven by the tag.<br><br>I grant the analyst a role scoped to only the columns and rows they need, least privilege, and if they only need their region I add a row filter too.<br><br>I avoid making a 'claims_no_ssn' copy, because copies drift, multiply, and become their own governance problem. One table, policy-driven, is auditable and stays in sync.\"",
      followups: [
        { q: "\"Why not just create a view without the SSN column?\"", a: "A view works for one audience but you end up maintaining a view per role, and they drift. A tag-driven masking policy on the base table serves every role from one object and stays consistent. It's also easier to audit than a sprawl of views." },
        { q: "\"How do you make sure a new PHI column gets protected automatically?\"", a: "Drive protection off tags, not manual per-column config. Tag the column PHI at creation (ideally enforced in the pipeline or catalog), and have the masking and access policies apply to anything tagged PHI. Then new columns are covered by default instead of relying on someone remembering." },
        { q: "\"The analyst says masking breaks their join on MRN. Now what?\"", a: "If they need to join but not read the value, tokenize the MRN so the token preserves referential integrity across tables without exposing the real identifier. They join on the token; the real MRN stays in the vault. That gives them the join without the exposure." }
      ]
    },
    {
      title: "\"An auditor asks you to prove where a PHI field flows end to end. What do you show?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you understand column-level lineage, classification, and audit logging as the concrete artifacts that satisfy an auditor, not vague assurances.",
      noteLabel: "Model answer:",
      note: "\"I show them column-level lineage for that field, from source to every downstream consumer.<br><br>I pull it from the catalog, Unity Catalog or DataHub, so I can trace the PHI column through each transform into every report and extract it lands in. Table-level isn't enough here; the auditor wants the field's exact path.<br><br>Alongside that I show the classification tag proving it's marked PHI, and the access controls, the masking policy and the grants, that limit who can read it.<br><br>Then I show audit logs of who actually accessed it over the review period. Lineage proves where it can flow, the policies prove how it's protected, and the logs prove who touched it. Those three together are what satisfies an auditor.\"",
      followups: [
        { q: "\"Your lineage tool doesn't capture a legacy Python job in the middle. What do you do?\"", a: "That's a lineage gap and I'd flag it honestly. Short term I document that hop manually and add it to the lineage graph. Longer term I instrument the job to emit lineage (OpenLineage) so it's captured automatically and the gap doesn't recur." },
        { q: "\"How do you prove the data was protected historically, not just today?\"", a: "Policy and grant changes should be version-controlled and logged, so I can show the masking policy and access grants as they existed during the period in question. Combined with the audit logs of actual access over that window, that demonstrates protection over time, not just a current snapshot." },
        { q: "\"How far downstream does your responsibility go — into a BI extract on someone's laptop?\"", a: "Lineage should extend to the point data leaves governed systems, including BI extracts, and that boundary is exactly where risk concentrates. The fix is minimizing exports, masking at the source so extracts inherit protection, and monitoring for uncontrolled copies rather than pretending the boundary is the warehouse edge." }
      ]
    },
    {
      title: "\"How do you delete one user's data from an immutable data lake for GDPR?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you know why immutable/partitioned lake files make deletion hard and can name real techniques (crypto-shredding, tombstone+compaction, Delta/Iceberg DELETE) plus the copy problem.",
      noteLabel: "Model answer:",
      note: "\"First I acknowledge it's genuinely hard, because a lake is immutable partitioned Parquet, so I can't just edit one person out in place.<br><br>My preferred approach is a table format, Delta Lake or Iceberg, which supports row-level DELETE and handles the file rewrite or merge-on-read for me. If I'm on raw Parquet, I tombstone the rows and compact later, rewriting files without the deleted records.<br><br>The cleanest scheme for scale is crypto-shredding: encrypt each subject's data with a per-subject key, and on a deletion request I destroy that key. The ciphertext is then unrecoverable without rewriting anything.<br><br>The part people miss is copies. The data is also in backups, replicas, and downstream extracts, so I use lineage to find every location and apply the deletion, or key destruction, everywhere. 'Delete the row' is only step one.\"",
      followups: [
        { q: "\"Crypto-shredding sounds clean, but what's the catch?\"", a: "You need per-subject (or fine-grained) keys from the start, which is architectural work you can't retrofit easily. Key management gets heavy at millions of subjects, and if a subject's data was ever decrypted and re-stored elsewhere unencrypted, shredding the key doesn't cover that copy. It's powerful but not free." },
        { q: "\"How do you handle deletion in backups you can't easily rewrite?\"", a: "Two common answers. Crypto-shredding covers backups automatically if they hold ciphertext and you destroyed the key. Otherwise you rely on backup retention windows, documenting that the data ages out within the defined period, which regulators generally accept for backups you don't actively query." },
        { q: "\"How do you confirm the deletion actually happened everywhere?\"", a: "Track it as a workflow with lineage as the checklist: enumerate every system holding the subject's data, execute deletion or key destruction in each, and log completion. That deletion log is also your proof to the regulator that you honored the request end to end." }
      ]
    },
    {
      title: "\"RBAC vs ABAC — when would you actually pick ABAC?\"",
      badge: "intermediate",
      conceptLabel: "What's being tested:",
      concept: "Whether you can go past definitions to the real trigger — role explosion and attribute-dependent access — and whether you know most systems are hybrid.",
      noteLabel: "Model answer:",
      note: "\"I default to RBAC because it's simple, auditable, and covers most cases.<br><br>I reach for ABAC when access depends on data attributes rather than just job function, or when pure RBAC would explode into too many roles. The classic trigger is regional or sensitivity rules: 'EU analysts see only EU rows' is one ABAC policy over a region attribute, versus a separate role per region in RBAC.<br><br>Another trigger is context, like restricting access to certain networks or hours, which attributes handle naturally.<br><br>In reality I run a hybrid: RBAC for the coarse grants, then tag- and attribute-driven policies for the fine-grained rules. Tag a column PHI and let an attribute policy decide who reads it. That's ABAC doing the work RBAC can't scale to.\"",
      followups: [
        { q: "\"What's the downside of ABAC?\"", a: "It's harder to reason about and audit. With RBAC you can list a role's grants; with ABAC, effective access is computed from attributes and policies, so answering 'who can see this' takes evaluating the policy engine. It's more powerful but less transparent, which is why you don't use it for everything." },
        { q: "\"Give a concrete case where RBAC alone fails.\"", a: "Access that depends on row content — an insurer where each regional team may see only its own region's claims. In pure RBAC you'd create a role per region and maintain the explosion. One ABAC row policy comparing the user's region attribute to the row's region handles all regions at once." },
        { q: "\"How does this map to a real platform?\"", a: "Snowflake and Unity Catalog are effectively hybrid. You use roles/grants for coarse RBAC, then masking policies and row access policies that read tags and session attributes for the ABAC layer. So you rarely choose one exclusively; you layer attribute policies on top of roles." }
      ]
    },
    {
      title: "\"Masking vs encryption vs tokenization — when each?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you know these solve different problems and can map each to a concrete use case, especially PCI tokenization for scope reduction.",
      noteLabel: "Model answer:",
      note: "\"They answer different questions, so I pick by the problem.<br><br>Encryption protects data at rest and in transit, and it's reversible with the key. But once it's decrypted for use, it doesn't limit who sees the plaintext. So it's my baseline storage and transit protection.<br><br>Dynamic masking is for role-based viewing from one table: privileged roles see the real value, others see 'XXX-1234'. The stored data is intact; the transform happens at query time.<br><br>Tokenization replaces a sensitive value with a meaningless token, real value in a separate vault. It's my go-to for PCI, because getting the raw card number out of a system shrinks PCI scope while tokens keep joins working.<br><br>And static masking gives dev realistic but fake data so lower environments never hold real PHI. They stack: a PCI pipeline tokenizes the PAN at ingest, encrypts at rest, and dynamically masks last-four for support.\"",
      followups: [
        { q: "\"Why is tokenization specifically tied to PCI scope reduction?\"", a: "PCI-DSS scope covers any system that stores, processes, or transmits the card number. If you tokenize the PAN at the edge and keep the real value only in a small isolated vault, most of your systems only ever see tokens and fall out of PCI scope. That massively reduces audit burden." },
        { q: "\"If encryption is reversible, how is it different from tokenization?\"", a: "Encryption is a mathematical transform reversible anywhere with the key, and ciphertext generally doesn't preserve format or joins. Tokenization is a lookup: the token has no mathematical relationship to the value, can preserve format, and is only reversible via the vault. Tokenization removes the value from the system; encryption keeps it, just protected." },
        { q: "\"When would you NOT tokenize and just mask?\"", a: "When the value must stay in the system for legitimate use and you only need to control who sees it. Masking keeps the real data in place and hides it per role, which is simpler. Tokenize when the goal is to remove the sensitive value from most systems entirely, like PCI scope reduction." }
      ]
    },
    {
      title: "\"How do you keep governance from being a blocker teams route around?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "The senior mindset — that governance which is slower than the workaround creates shadow data and is a net negative. They want the 'paved road' framing plus concrete enablers.",
      noteLabel: "Model answer:",
      note: "\"My rule is to make the safe path the easy path.<br><br>If getting data the compliant way takes two weeks and exporting a CSV to a laptop takes two minutes, people take the CSV and I've made things less safe. So I measure success partly by how little shadow data exists.<br><br>Concretely I offer self-service access with fast, mostly automated approval, and pre-approved masked views for the common analyst needs so they don't have to ask at all.<br><br>I bake compliance into defaults, templates and policy-as-code, so the easy default is already governed. And I involve data owners so approvals are quick instead of a bottleneck.<br><br>Governance should feel like paved roads, not roadblocks. When the compliant path is also the fastest path, the workarounds dry up on their own.\"",
      followups: [
        { q: "\"How do you actually measure whether governance is working?\"", a: "Beyond audit pass/fail, I track leading indicators: time-to-access for a new request, number of shadow copies or ungoverned exports found, percentage of datasets with an owner and classification. Rising shadow data or slow access requests mean the governed path is losing to the workaround." },
        { q: "\"A team says your controls are slowing their delivery. How do you respond?\"", a: "I treat it as a signal the paved road isn't smooth enough, not as them being difficult. I find where the friction is (slow approvals, missing masked view) and fix that specific step, so the compliant path gets faster. Fighting the team just pushes them to shadow data." },
        { q: "\"Isn't self-service access risky?\"", a: "Self-service doesn't mean unrestricted. Requests are scoped, auto-approved only within safe bounds (non-sensitive data, or masked views), and everything is logged. Sensitive data still routes to an owner, but quickly. The point is fast and governed, not open." }
      ]
    },
    {
      title: "\"How do you isolate dev from prod so a dev job can't read prod PII?\"",
      badge: "advanced",
      conceptLabel: "What's being tested:",
      concept: "Whether you know environment isolation, separate credentials/accounts, and that dev should never hold real PHI — using static masking or synthetic data instead.",
      noteLabel: "Model answer:",
      note: "\"The core principle is that dev never has access to prod PII in the first place.<br><br>I separate environments hard: distinct accounts or catalogs for dev and prod, with separate credentials and IAM roles, so a dev job simply has no permission to reach prod data. Identity and network boundaries enforce it, not conventions.<br><br>Dev doesn't get a copy of real PHI. Instead I provision statically masked or synthetic data that has the right shape for testing but no real identifiers. So even a mistake in dev can't leak a real patient.<br><br>Access to prod is least-privilege and separated by duty, with any elevated access time-bound and logged. The combination, hard environment separation plus no real PII in dev, means a dev job can't read prod PII by construction, not just by policy.\"",
      followups: [
        { q: "\"Developers say they can't reproduce a bug without real prod data. What do you do?\"", a: "Give them statically masked prod data that preserves structure and distributions but replaces identifiers, which reproduces most bugs. If they truly need real records, that's a time-bound, logged, approved elevation to a restricted subset, not standing access. The default stays masked." },
        { q: "\"How do you enforce the separation technically, not just by policy?\"", a: "Separate cloud accounts or Unity Catalog catalogs with distinct IAM roles and network boundaries, so dev credentials have no grant path to prod objects. It's enforced by identity and infrastructure, so even a misconfigured dev job gets permission-denied rather than relying on people following a rule." },
        { q: "\"How does CI/CD fit without leaking prod access?\"", a: "CI runs against dev/test data with its own scoped service principal, never prod credentials. Techniques like dbt's defer let CI test only changed models against prod metadata without granting read on prod PII. Prod deploys use a separate, tightly-scoped principal triggered only by the pipeline." }
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "What best describes data governance?",
    options: [
      "A software product you install to automatically secure all data",
      "The framework of people, process, and policy that decides who can do what with which data, with accountable owners",
      "The encryption of data at rest and in transit",
      "The team responsible for writing ETL pipelines"
    ],
    correct: 1
  },
  {
    q: "An EU analyst should see only EU customer rows, and a US analyst only US rows, from the same table. Which approach fits best?",
    options: [
      "Create a separate physical table copy per region",
      "A row access policy (ABAC-style) that compares the user's region attribute to the row's region",
      "Encrypt the region column",
      "Give every analyst the same broad role and trust them"
    ],
    correct: 1
  },
  {
    q: "A payments pipeline must get raw card numbers (PANs) out of most systems to reduce PCI-DSS scope, while keeping joins working. What do you use?",
    options: [
      "Dynamic data masking",
      "Tokenization, with the real PAN in a separate vault and format-preserving tokens for joins",
      "TLS in transit",
      "Static masking of the dev environment"
    ],
    correct: 1
  },
  {
    q: "Why is deleting one person's data from a data lake for GDPR genuinely hard?",
    options: [
      "Data lakes don't support the DELETE keyword at all, ever",
      "Lake files are immutable/partitioned (Parquet) and the data is copied across zones, backups, and extracts, so you can't just edit one row in place",
      "GDPR forbids ever deleting data",
      "Object storage is too slow to run deletes"
    ],
    correct: 1
  },
  {
    q: "An auditor asks you to prove where a specific PHI field flows from source to every consumer. What is the most relevant artifact?",
    options: [
      "Table-level lineage only",
      "Column-level lineage from the catalog, plus the field's classification tag, access policies, and audit logs",
      "The warehouse's CPU utilization graph",
      "A screenshot of the masking policy syntax"
    ],
    correct: 1
  },
  {
    q: "What is the difference between pseudonymization and anonymization under GDPR?",
    options: [
      "They are the same thing",
      "Pseudonymization is reversible and still counts as personal data; anonymization is irreversible and, done properly, falls outside GDPR",
      "Anonymization is reversible; pseudonymization is not",
      "Only pseudonymization uses encryption"
    ],
    correct: 1
  },
  {
    q: "What is the senior framing for keeping governance from becoming a blocker teams route around?",
    options: [
      "Add more approval steps so nothing slips through",
      "Make the safe path the easy path — self-service access, pre-approved masked views, and compliant defaults, so the governed path is also the fastest",
      "Ban all data exports entirely",
      "Remove access controls to speed people up"
    ],
    correct: 1
  }
];
