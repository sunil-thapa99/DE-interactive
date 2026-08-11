// Content data for the MongoDB & NoSQL module.
const MODULE_ID = "mongodb";
const CONTENT = {

overview: {
  intro: {
    title: "What is NoSQL, where does MongoDB fit, and when should a DE reach for it?",
    desc: "NoSQL is not one thing — it's a family of non-relational stores that trade the relational model's joins/constraints for flexible schema, horizontal scale, and read patterns tuned to how the app actually accesses data. MongoDB is the dominant document store. This module covers the document model, embedding vs referencing, the aggregation pipeline, indexing (the ESR rule), and replication/sharding — the surface a 6+ YOE Data Engineer is expected to reason about when choosing, modeling, and pulling data out of Mongo, not just an app developer's CRUD."
  },
  diagram: [
    { label: "Sources\n(services, FHIR/HL7, transactions)", hl: true },
    { arrow: true },
    { label: "MongoDB\n(document store, replica set / sharded)", hl: true },
    { arrow: true },
    { label: "CDC / Change Streams\n(Debezium, $changeStream)", hl: true },
    { arrow: true },
    { label: "Warehouse / Lake\n(Snowflake, S3, analytics)" },
  ],
  cards: [
    {
      title: "The NoSQL family taxonomy — four shapes, not one database",
      badge: "fundamentals",
      concept: "'NoSQL' spans four broad families, each tuned to a different access pattern. Document stores (MongoDB, Couchbase) hold self-describing JSON/BSON documents and are the natural fit for hierarchical, evolving entities. Key-value stores (Redis, DynamoDB in its simplest use) are a giant hash map — O(1) get/put by key, no query over values. Wide-column stores (Cassandra, HBase, Bigtable) store sparse rows keyed by a partition+clustering key, optimized for massive write throughput and queries along that key. Graph databases (Neo4j) make relationships first-class for traversal-heavy workloads (fraud rings, recommendations). They are NOT interchangeable — the family follows the query shape.",
      navLabel: "How to place MongoDB:",
      nav: "MongoDB is a document store: a record is a BSON document (binary JSON — adds types like Date, Decimal128, ObjectId, binary). The unit you read/write is a whole document or part of one, addressed by _id or by a query over any field. That makes it ideal when an 'entity' is naturally a nested tree (a patient with encounters, meds, and allergies; an order with line items) and you want to fetch the whole thing in one round trip without joining five tables.",
      noteLabel: "Where it fits in a DE stack:",
      note: "As a Data Engineer you meet Mongo as a SOURCE far more than as a warehouse: it's the operational store behind a service (semi-structured, schema-flexible data — FHIR resources, event payloads, risk profiles) that you must land into Snowflake/S3 via CDC (change streams or Debezium). The recurring job is un-nesting documents into columnar tables. Mongo is a great operational/serving store and a poor analytical one — know both sides."
    },
    {
      title: "The core decision: when to choose MongoDB/NoSQL vs a relational DB",
      badge: "fundamentals",
      concept: "Choose MongoDB when: (1) the schema is flexible or evolving — fields differ per document, or the shape changes often and you don't want a migration for every change (semi-structured feeds, FHIR resources where optional fields abound); (2) your read pattern is 'fetch one rich entity and everything under it' — denormalized reads that a relational model would satisfy with 4-5 joins; (3) you need horizontal write scale across commodity nodes via sharding. Choose a relational DB (Postgres) when: you have many-to-many relationships and complex ad-hoc joins, you need multi-entity ACID transactions as the norm (money moving between accounts), strong constraints/referential integrity, or the workload is analytical SQL.",
      navLabel: "The senior framing:",
      nav: "It's about access patterns and the shape of consistency you need, not 'SQL bad, NoSQL web-scale.' A useful test: can you draw the primary read as one document you'd fetch by key? Then Mongo shines. Is the primary workload joining and aggregating across many independent entities with strong invariants? Then relational. The classic mistake is picking Mongo for schema flexibility, then querying it like a relational DB with $lookup everywhere — you get neither Mongo's read speed nor Postgres's join optimizer.",
      note: "Modern caveat: the line has blurred. Postgres has JSONB (document-ish columns) and Mongo added multi-document ACID transactions (4.0+). So the decision is rarely 'impossible in the other' — it's which one makes the DOMINANT access pattern cheap and the rare one merely possible."
    },
    {
      title: "CAP, BASE vs ACID — the consistency model at a high level",
      badge: "intermediate",
      concept: "CAP says a distributed store, when a network partition happens, must choose between Consistency (every read sees the latest write) and Availability (every request gets a response). Classic relational systems lean CA/CP with ACID guarantees (Atomic, Consistent, Isolated, Durable) — strong invariants, but historically single-node. Many NoSQL stores adopted BASE (Basically Available, Soft state, Eventually consistent): accept temporary staleness for availability and scale. MongoDB is more nuanced than 'BASE': within a replica set it's a CP system — writes go to a single primary, and you TUNE the consistency/durability you get per operation via write concern and read concern.",
      navLabel: "What that means in practice:",
      nav: "MongoDB is strongly consistent by default when you read from the primary. Reads from secondaries can be stale (they replicate asynchronously) — that's the eventual-consistency knob you opt into for read scaling. Durability is tunable: writeConcern w:'majority' waits until a majority of the replica set has the write, j:true waits for the on-disk journal. So Mongo isn't dogmatically BASE or ACID — it hands you the dial, and picking the wrong setting is where people lose data or read stale data.",
      note: "Interview-ready one-liner: 'MongoDB gives per-operation tunable consistency and durability inside a CP replica set — strong by default from the primary, eventual from secondaries, with write concern controlling how many nodes must acknowledge before a write is considered safe.'"
    },
    {
      title: "BSON, _id, and the 16MB document limit",
      badge: "fundamentals",
      concept: "Documents are stored as BSON (Binary JSON): typed, ordered, length-prefixed for fast traversal. Every document has an _id, unique within its collection and immutable; if you don't supply one, the driver generates an ObjectId — a 12-byte value encoding a timestamp + machine/process + counter, which is roughly monotonically increasing and globally unique without coordination. A single document is capped at 16MB. Collections are schemaless by default (you CAN attach JSON-Schema validation), so two documents in one collection can have different fields.",
      navLabel: "Why the limits shape your model:",
      nav: "The 16MB cap is a hard design constraint, not a footnote: any 'embed everything' model where a child array grows unboundedly (a patient's entire lifetime of lab results, a device's every reading) will eventually blow the limit or make the document slow to read/update. That single fact drives half of MongoDB data modeling — it's why 'embed vs reference' is a capacity decision as much as an access-pattern one. The ObjectId's time-prefix also matters for sharding: it's monotonic, so a naive ObjectId shard key hotspots one shard (covered in Scaling).",
      note: null
    },
    {
      title: "Collections, databases, and the absence of a fixed schema",
      badge: "fundamentals",
      concept: "A MongoDB deployment holds databases; a database holds collections (the rough analog of tables); a collection holds documents (rows). But unlike a table, a collection enforces no columns by default — schema lives in your application and, optionally, in a JSON-Schema validator you attach to the collection. This is 'schema-on-read' pushed to the store: writers can add fields freely, and readers must tolerate documents that predate a field.",
      navLabel: "The data-engineering consequence:",
      nav: "Schema flexibility is a double-edged sword for a DE. It's great for ingesting messy semi-structured sources (varied FHIR bundles, third-party payloads) without a migration per source. But when you land it in a warehouse you inherit the messiness: fields that are sometimes a string and sometimes an object, arrays that are sometimes absent. The pipeline, not the store, ends up enforcing the schema. That's why real Mongo shops still attach a $jsonSchema validator on critical collections and version their document shape (covered in Modeling).",
      note: "Attach validation with db.createCollection(name, { validator: { $jsonSchema: {...} } }). Use validationAction:'warn' first to observe violations before enforcing — flipping straight to 'error' on a live collection rejects writes you didn't know were happening."
    }
  ]
},

modeling: {
  intro: {
    title: "Data modeling — embedding vs referencing and the patterns that follow",
    desc: "MongoDB modeling is the inverse of relational modeling: you don't normalize to third normal form and join back — you model around how the application READS. The central decision is embed vs reference, and every design pattern here is a variation on managing that tradeoff against the 16MB limit and update cost."
  },
  cards: [
    {
      title: "The document model: model for your access pattern, not your entities",
      badge: "fundamentals",
      concept: "In relational design you model entities and relationships first, then queries fall out of joins. In MongoDB you invert it: identify the dominant read, then shape the document so that read is a single lookup. If your app always displays a patient with their current medications and allergies together, store them together in one document. Data that is read together should live together. This is 'model for the query,' and it's the mental shift that trips up people coming from SQL.",
      navLabel: "The tradeoff you're making:",
      nav: "Embedding optimizes reads (one round trip, no join) at the cost of write complexity and duplication. A relational model optimizes writes and integrity (one fact in one place) at the cost of read-time joins. Neither is 'correct' — you pick per access pattern. The failure mode is importing a normalized relational schema 1:1 into Mongo (one collection per table, references everywhere) and then $lookup-joining at read time: you've recreated a relational DB inside a store that has no join optimizer.",
      code: "// Access-pattern-driven: the whole patient summary in one read\ndb.patients.findOne({ _id: \"P-10293\" })\n// returns demographics + current meds + allergies together,\n// exactly what the summary screen needs — no joins.",
      note: "Rule of thumb interviewers like: 'What data is displayed/updated together, and how big/unbounded can it get?' Those two questions decide almost every embed-vs-reference call.",
      followups: [
        "\"You modeled for today's read. A new screen needs the data sliced a different way — how do you serve it without re-modeling?\"",
        "\"How is this different from just denormalizing a relational schema?\""
      ]
    },
    {
      title: "Embedding vs referencing — the central decision",
      badge: "fundamentals",
      concept: "Embedding nests related data inside the parent document (the child array lives in the parent). Referencing stores the child separately and keeps only its _id (or a small key) in the parent, joining at read time via $lookup or a second query. Embed when the child is owned by, bounded with, and read alongside the parent. Reference when the child is large, unbounded, shared across parents, or accessed independently.",
      navLabel: "The decision checklist:",
      nav: "EMBED if: one-to-few, the child has no life of its own, you always read them together, and the array stays small and bounded. REFERENCE if: one-to-many/unbounded (blows the 16MB cap or bloats every read), the child is a shared entity (a provider referenced by thousands of claims), the child is written far more often than the parent (you'd rewrite a huge document for a tiny change), or you query children independently. The two failure modes: unbounded embedded arrays (document grows forever) and over-referencing (every read fans out to N follow-up lookups).",
      code: "// EMBED: order + its line items (bounded, read together)\n{\n  _id: \"ORD-88\",\n  customerId: \"C-1\",\n  status: \"shipped\",\n  items: [\n    { sku: \"A1\", qty: 2, price: 9.99 },\n    { sku: \"B7\", qty: 1, price: 49.0 }\n  ]\n}\n\n// REFERENCE: claim -> provider (provider shared by many claims)\n{ _id: \"CLM-501\", providerId: \"PRV-42\", amount: 1200.00 }\n// provider lives once in its own collection:\n{ _id: \"PRV-42\", name: \"Mercy Cardiology\", npi: \"1234567890\" }",
      note: "The default bias in MongoDB is EMBED — it's what makes Mongo fast. Reach for referencing only when one of the concrete triggers above fires. 'When in doubt, embed, but watch the array bounds' is a defensible senior stance.",
      followups: [
        "\"The embedded array is bounded today but the product owner wants full history. What breaks, and what do you change?\"",
        "\"You referenced the provider. Now every claim read does a $lookup — is that actually cheaper than embedding a copy of the provider name?\""
      ]
    },
    {
      title: "One-to-few: embed the array",
      badge: "intermediate",
      concept: "One-to-few (a handful, bounded, doesn't grow without limit) is the textbook embed case: a patient's addresses, an order's line items, a user's a few payment methods. The children are part of the entity, read with it, and small enough that the whole thing stays far under 16MB. You get atomic updates for free — updating the parent and its embedded children is a single-document write, which is always atomic in MongoDB.",
      navLabel: "Why atomicity here is a big deal:",
      nav: "A single-document update is atomic without any transaction machinery. So 'add an address AND mark it primary' on an embedded array is one atomic op — no multi-document transaction, no partial state. That's a real advantage over a normalized model where the same change touches two tables. This is why embedding isn't just a read optimization; it collapses a class of consistency problems into single-document writes.",
      code: "// Add an address atomically; embedded => single-doc atomic write\ndb.patients.updateOne(\n  { _id: \"P-10293\" },\n  { $push: { addresses: { type: \"home\", zip: \"71360\", primary: true } } }\n)",
      note: null,
      followups: [
        "\"Define 'few'. At what array size would you stop embedding, and why that number?\""
      ]
    },
    {
      title: "One-to-many and many-to-many: reference (usually)",
      badge: "intermediate",
      concept: "One-to-many where 'many' is large or unbounded (a provider's claims, a device's readings, a customer's transactions) should be referenced — the child collection holds a reference back to the parent (parent _id as a field), and you query children by that field with an index on it. Many-to-many (patients↔providers, students↔courses) is modeled by referencing on one or both sides, or with a linking collection when the relationship itself has attributes (enrollment date, role).",
      navLabel: "Which side holds the reference:",
      nav: "Put the reference on the 'many' side and index it — e.g. each claim stores providerId, with an index on providerId, so 'all claims for a provider' is an indexed range scan rather than scanning an unbounded embedded array. For many-to-many with relationship attributes, use a dedicated linking collection ({patientId, providerId, since, role}); for a plain relationship, an array of references on the side you query from is enough. Avoid arrays of references that grow unbounded — that's the unbounded-array anti-pattern wearing a reference costume.",
      code: "// One-to-many: reference on the MANY side + index it\ndb.claims.insertOne({ _id: \"CLM-501\", patientId: \"P-10293\", providerId: \"PRV-42\", amount: 1200 })\ndb.claims.createIndex({ patientId: 1 })\ndb.claims.find({ patientId: \"P-10293\" })   // indexed, scales with history\n\n// Many-to-many WITH attributes: linking collection\ndb.enrollments.insertOne({ patientId: \"P-10293\", providerId: \"PRV-42\", since: ISODate(\"2024-01-01\"), role: \"pcp\" })",
      note: null,
      followups: [
        "\"Many-to-many via arrays on both sides — what consistency problem do you now own on every update?\""
      ]
    },
    {
      title: "Anti-pattern: unbounded arrays and the massive-document trap",
      badge: "advanced",
      concept: "The single most common MongoDB modeling mistake is the ever-growing embedded array: patient.labResults that appends every lab forever, device.readings that appends every sensor tick, post.comments on a viral post. Three things break: (1) the document creeps toward 16MB and eventually writes fail; (2) MongoDB may have to move/rewrite the whole document on each append as it grows, so writes get slower over time; (3) every read of the parent drags the entire array over the wire even when you only wanted the top-level fields.",
      navLabel: "How to fix it:",
      nav: "If the array is unbounded, don't embed it — reference the children in their own collection, OR use the bucket pattern (next card) to cap array size per document. A good smell test: 'Is there any value of N at which this array is too big?' If yes, it's unbounded and shouldn't be a naked embedded array. Use $slice projections and the subset pattern (below) when you only ever need the most recent few. Massive documents also hurt the WiredTiger cache — a few huge docs evict many small ones.",
      code: "// ANTI-PATTERN: unbounded, rewrites whole doc, drags array on every read\n{ _id: \"DEV-1\", readings: [ /* ... millions of entries ... */ ] }\n\n// FIX A: reference into a readings collection\ndb.readings.insertOne({ deviceId: \"DEV-1\", ts: ISODate(), temp: 71.2 })\n// FIX B: bucket (next card)",
      note: "Watch for this on the READ side too: a projection that excludes a giant array ({ readings: 0 }) is a band-aid — the document is still huge on disk and in cache. The real fix is not storing it embedded.",
      followups: [
        "\"How would you detect this in a running system before it hits 16MB?\"",
        "\"Why does a growing document specifically hurt the WiredTiger cache?\""
      ]
    },
    {
      title: "The bucket pattern — time-series / IoT without unbounded arrays",
      badge: "advanced",
      concept: "The bucket pattern caps array growth by grouping many small events into one document per (entity, time-window): instead of one document per sensor reading (millions of tiny docs, huge index overhead) or one document per device (unbounded array), you store one document per device per hour holding an array of that hour's readings plus rollups (count, sum, min, max). You get bounded arrays, far fewer documents, cheap pre-aggregated stats, and index entries per bucket instead of per event.",
      navLabel: "Why DEs care about this specifically:",
      nav: "Time-series/IoT and financial tick data are exactly the workloads where the naive model collapses, and bucketing is the standard fix. MongoDB 5.0+ also has native time-series collections that implement bucketing for you (you declare timeField/metaField and it buckets under the hood) — prefer those for new time-series workloads, but understand the manual pattern because it's what native collections do internally and what you'll see in older schemas. The rollups make downstream analytics cheaper: you can pull hourly aggregates straight out instead of re-summing raw points.",
      code: "// One bucket per device per hour: bounded array + rollups\n{\n  deviceId: \"DEV-1\",\n  hour: ISODate(\"2026-08-10T14:00:00Z\"),\n  count: 60,\n  sumTemp: 4272.0, minTemp: 70.1, maxTemp: 72.9,\n  readings: [ { m: 0, temp: 71.2 }, { m: 1, temp: 71.3 } /* <=60 */ ]\n}\n\n// Native time-series collection (5.0+) buckets for you:\ndb.createCollection(\"readings\", {\n  timeseries: { timeField: \"ts\", metaField: \"deviceId\", granularity: \"minutes\" }\n})",
      note: "Cap the bucket by time OR by count (e.g. flush at 200 entries), whichever comes first, so a burst can't blow the 16MB limit inside a single window.",
      followups: [
        "\"Native time-series vs manual buckets — when would you still hand-roll buckets?\"",
        "\"How do you query across bucket boundaries for a 90-minute window?\""
      ]
    },
    {
      title: "The subset pattern — keep the hot slice, reference the cold tail",
      badge: "advanced",
      concept: "When you almost always need only the most recent/most relevant few of a large child set — the last 10 transactions on an account summary, the top comments on a post — embed just that subset in the parent and keep the full set in a referenced collection. The parent read stays small and single-round-trip; the rare 'show all history' case pages the full collection. This directly counters both the unbounded-array anti-pattern and the over-referencing (N follow-up reads) anti-pattern.",
      navLabel: "How the write side works:",
      nav: "On insert of a new child, you $push into the embedded subset and $slice it to keep only the newest K (an atomic single-doc op), AND insert the full record into the referenced collection. Slightly more write work, but the dominant read (the summary) never touches the big collection. This is the pattern behind most 'recent activity' panels. It's a deliberate, controlled duplication — you accept two writes to make the common read one lookup.",
      code: "// Keep only the 10 most recent transactions embedded on the account\ndb.accounts.updateOne(\n  { _id: \"ACC-7\" },\n  { $push: { recentTxns: { $each: [ { id: \"T-991\", amt: 42.10, ts: ISODate() } ],\n                          $sort: { ts: -1 }, $slice: 10 } } }\n)\n// full history lives in its own collection, referenced by accountId\ndb.transactions.insertOne({ accountId: \"ACC-7\", id: \"T-991\", amt: 42.10, ts: ISODate() })",
      note: null,
      followups: [
        "\"The embedded 'recent 10' and the transactions collection can drift. How do you keep them consistent?\""
      ]
    },
    {
      title: "The extended-reference pattern — duplicate the fields you read, not the whole doc",
      badge: "advanced",
      concept: "Pure referencing forces a $lookup on every read; pure embedding duplicates the whole child. The extended reference is the middle ground: alongside the reference _id, copy the FEW fields you display so the common read needs no join. A claim stores providerId AND a snapshot of providerName + npi; you only $lookup the full provider on the rare detail view. You duplicate the small, rarely-changing fields you actually render, not the entire entity.",
      navLabel: "The consistency cost you're accepting:",
      nav: "Duplicated fields can go stale when the source changes (provider renames). You accept that, and you decide how to reconcile: for slowly/never-changing fields (npi, historical name-at-time-of-service) staleness is fine or even correct — a claim SHOULD show the provider name as of service date, not today's. For fields that must stay current, you fan out an update (or a change-stream-driven job) to refresh copies. Pick extended reference when the read frequency of those fields massively outweighs their change frequency.",
      code: "// Extended reference: keep the reference + a snapshot of display fields\n{\n  _id: \"CLM-501\",\n  providerId: \"PRV-42\",\n  provider: { name: \"Mercy Cardiology\", npi: \"1234567890\" }, // snapshot\n  amount: 1200.00, serviceDate: ISODate(\"2026-07-01\")\n}\n// list view renders provider.name with zero joins;\n// full provider detail does the rare $lookup by providerId.",
      note: "In healthcare/finance, snapshotting values AS OF the event (name/address/plan at time of service) is often the CORRECT behavior, not a compromise — the record must reflect what was true then. Extended reference and point-in-time correctness align here.",
      followups: [
        "\"Which fields do you snapshot, and how do you decide when staleness is a bug vs the intended behavior?\""
      ]
    },
    {
      title: "The computed pattern — precompute at write time to make reads cheap",
      badge: "advanced",
      concept: "When a value is read far more often than the underlying data changes, compute it on write and store it, rather than aggregating on every read. Store an account's runningBalance, a post's likeCount, a claim batch's totalAmount alongside the raw data, updating it with $inc as events arrive. The read becomes a single field fetch instead of an aggregation over thousands of children.",
      navLabel: "The tradeoff and the risk:",
      nav: "You trade a little write complexity and a correctness risk (the computed value can drift from the source of truth if an update is missed) for cheap reads. Mitigate drift with a periodic reconciliation job that recomputes from raw data and corrects the stored value. This is the same read-vs-write tradeoff as extended reference and subset — MongoDB modeling is largely 'how much do I precompute/duplicate at write time to make the dominant read a single cheap operation.' Pair with $inc so the counter update is atomic.",
      code: "// Maintain a running total with an atomic $inc on each event\ndb.batches.updateOne(\n  { _id: \"BATCH-2026-08\" },\n  { $inc: { totalAmount: 1200.00, claimCount: 1 } },\n  { upsert: true }\n)\n// reconcile nightly from raw claims to correct any drift.",
      note: null,
      followups: [
        "\"Your likeCount drifted from the actual likes. Where did the update get lost, and how do you self-heal?\""
      ]
    },
    {
      title: "Schema versioning — evolve document shape without a big-bang migration",
      badge: "advanced",
      concept: "Because collections are schemaless, you can't ALTER TABLE. The schema-versioning pattern stamps each document with a schemaVersion field and lets multiple shapes coexist. New writes use the latest shape; readers handle old shapes (or a lazy migration upgrades a document on next write). You migrate incrementally — no downtime, no rewriting a billion documents at once — which is exactly the flexibility that made you pick Mongo, used deliberately.",
      navLabel: "How to run it safely:",
      nav: "Add schemaVersion to every document. Application code branches on it (or normalizes old→new on read). Run a background migrator that upgrades documents in batches during off-peak, or migrate-on-write (upgrade a document whenever it's next updated). Keep a $jsonSchema validator that accepts the versions currently in flight, tightening it once the old version is fully drained. For a DE pulling this into a warehouse, schemaVersion is gold — it tells your un-nesting job which parsing path to use.",
      code: "// Multiple shapes coexist; reader/migrator branches on version\n{ _id: \"P-1\", schemaVersion: 1, name: \"Ada Byte\" }              // old\n{ _id: \"P-2\", schemaVersion: 2, name: { first: \"Ada\", last: \"Byte\" } } // new\n\n// Lazy migrate on next touch:\ndb.patients.updateMany(\n  { schemaVersion: 1 },\n  [ { $set: { name: { first: { $arrayElemAt: [ { $split: [\"$name\", \" \"] }, 0 ] },\n                      last:  { $arrayElemAt: [ { $split: [\"$name\", \" \"] }, 1 ] } },\n              schemaVersion: 2 } } ]\n)",
      note: "The aggregation-pipeline form of update ([ {$set: ...} ]) lets a migration reference other fields of the same document — plain update operators can't. Handy for exactly these in-place transforms.",
      followups: [
        "\"Two app versions are deployed at once during a rolling release. How do both read/write safely across schema versions?\""
      ]
    },
    {
      title: "Polymorphic collections — different shapes, one collection",
      badge: "advanced",
      concept: "The polymorphic pattern stores related-but-differently-shaped entities in one collection with a discriminator field (type). Different product categories with different attributes, or different FHIR resource types, live together and are queried uniformly, with type-specific fields present only where relevant. This leans directly into Mongo's schemaless nature — the thing a rigid relational schema makes painful (a table per subtype, or a sparse wide table) is natural here.",
      navLabel: "When it helps vs hurts:",
      nav: "It helps when the entities share a dominant access pattern (list/search across all types) and differ only in a minority of fields — one collection, one index, one query path. It hurts when the types are truly unrelated (then you've just made a junk drawer) or when per-type fields are so divergent that no shared index serves the common query. FHIR-style data (many resource types, shared envelope) is a canonical fit. Always keep the discriminator indexed.",
      code: "// One collection, discriminated by `resourceType`\n{ _id: \"O-1\", resourceType: \"Observation\", code: \"8867-4\", valueQuantity: { value: 72, unit: \"bpm\" } }\n{ _id: \"C-1\", resourceType: \"Condition\",   code: \"E11.9\", clinicalStatus: \"active\" }\ndb.resources.createIndex({ resourceType: 1, code: 1 })",
      note: null,
      followups: [
        "\"When does polymorphism become a 'junk drawer' collection, and how do you tell you've crossed that line?\""
      ]
    }
  ]
},

queries: {
  intro: {
    title: "Query & aggregation — find, update, and the aggregation pipeline",
    desc: "MongoDB's query surface is find() for point/range reads and the aggregation pipeline for everything analytical — grouping, joining, reshaping. The recurring senior theme: push work as early as possible ($match first, so indexes apply) and know that $lookup is not a free relational join."
  },
  cards: [
    {
      title: "find() and projection — read only what you need",
      badge: "fundamentals",
      concept: "find(filter, projection) returns documents matching the filter, and the projection controls which fields come back. Projecting only the fields you need cuts network and, when the projection is covered by an index, avoids touching documents at all (a covered query — see Indexing). Filters compose field predicates; nested fields use dot notation ('provider.npi'); arrays match if ANY element matches unless you use $elemMatch.",
      navLabel: "The gotchas:",
      nav: "1 includes a field, 0 excludes; you can't mix include/exclude except for _id. Querying an array field like { tags: 'x' } matches documents where the array CONTAINS 'x' — surprising if you expected equality on the whole array. To match multiple conditions on the SAME array element, use $elemMatch, otherwise { arr.a: 1, arr.b: 2 } matches if different elements satisfy each — a classic bug. Always project; returning whole fat documents 'just in case' is wasted I/O.",
      code: "// only name + npi, drop _id; dotted path into a subdoc\ndb.claims.find(\n  { \"provider.npi\": \"1234567890\", amount: { $gte: 1000 } },\n  { _id: 0, \"provider.name\": 1, amount: 1 }\n)\n\n// same array element must satisfy BOTH conditions:\ndb.orders.find({ items: { $elemMatch: { sku: \"A1\", qty: { $gte: 2 } } } })",
      note: null,
      followups: [
        "\"{ 'items.sku': 'A1', 'items.qty': { $gte: 5 } } returns a doc you didn't expect. Why, and what's the fix?\""
      ]
    },
    {
      title: "Query operators — comparison, logical, element, array",
      badge: "fundamentals",
      concept: "The operator vocabulary: comparison ($eq/$ne/$gt/$gte/$lt/$lte/$in/$nin), logical ($and implicit, $or, $not, $nor), element ($exists, $type), evaluation ($regex, $expr to use aggregation expressions in a find), and array ($all, $size, $elemMatch). $in is your set-membership; $exists is how you cope with schemaless data where a field may be absent; $expr lets you compare two fields of the same document in a plain query.",
      navLabel: "Performance-relevant notes:",
      nav: "$ne, $nin, and $not are NOT selective — they can't use an index efficiently (they match 'everything except', so the index doesn't narrow much) and often force scans; prefer positive predicates ($in, $eq) that an index can seek. Leading-wildcard $regex (/foo$/, /.*x/) can't use an index either — anchor at the start (/^foo/) to make it index-friendly, or use a text index for real search. $exists:false on a sparse field is a common accidental collection scan.",
      code: "db.patients.find({ status: { $in: [\"active\", \"pending\"] } })   // index-friendly\ndb.patients.find({ mrn: { $exists: true } })                    // schemaless guard\ndb.orders.find({ $expr: { $gt: [\"$paid\", \"$total\"] } })         // field vs field\ndb.claims.find({ code: { $regex: /^E11/ } })                    // anchored => index-usable",
      note: null,
      followups: [
        "\"Why can't { status: { $ne: 'closed' } } use an index effectively, and what would you do instead?\""
      ]
    },
    {
      title: "Update operators — $set, $inc, $push, arrayFilters, upsert",
      badge: "fundamentals",
      concept: "Updates mutate in place with operators, not by rewriting the whole document: $set/$unset fields, $inc/$mul numbers, $push/$pull/$addToSet arrays, $min/$max, $rename. $push with $each/$slice/$sort maintains a bounded, sorted array (the subset pattern). arrayFilters ($[identifier]) update specific matching array elements. upsert:true inserts the document if the filter matched nothing — the workhorse for idempotent 'insert-or-update' pipelines (CDC sinks, dedup by business key).",
      navLabel: "Why upsert matters for pipelines:",
      nav: "An idempotent upsert keyed by a business ID makes at-least-once ingestion harmless — reprocessing the same event just re-sets the same document rather than duplicating it. That's the MongoDB equivalent of the 'at-least-once + idempotent sink' pattern from streaming. $setOnInsert lets you set fields only on the insert branch of an upsert (e.g. createdAt) while $set runs on both. Single-document updates are always atomic, so 'read-modify-write' on one document needs no transaction if expressed as operators.",
      code: "// Idempotent CDC-style sink: upsert by business key\ndb.patients.updateOne(\n  { mrn: \"MRN-55\" },\n  { $set: { name: \"Ada Byte\", updatedAt: ISODate() },\n    $setOnInsert: { createdAt: ISODate() },\n    $inc: { version: 1 } },\n  { upsert: true }\n)\n\n// Update a specific matching array element (arrayFilters)\ndb.orders.updateOne(\n  { _id: \"ORD-88\" },\n  { $set: { \"items.$[i].qty\": 5 } },\n  { arrayFilters: [ { \"i.sku\": \"A1\" } ] }\n)",
      note: "$addToSet vs $push: $addToSet dedups (set semantics), $push always appends. Reaching for $push then complaining about duplicates is a common bug.",
      followups: [
        "\"How does an idempotent upsert let you safely re-run a failed ingestion batch?\"",
        "\"$set the whole array vs arrayFilters on one element — what's the concurrency difference?\""
      ]
    },
    {
      title: "The aggregation pipeline — the analytical workhorse",
      badge: "intermediate",
      concept: "Aggregation is a pipeline of stages, each consuming the previous stage's stream: $match (filter), $project/$set (reshape), $group (aggregate), $sort, $limit/$skip, $unwind (explode an array into one doc per element), $lookup (join), $facet (multiple sub-pipelines in one pass). It's MongoDB's SQL-equivalent for GROUP BY / analytics / ETL-style reshaping, and it's what a DE uses to un-nest and roll up documents.",
      navLabel: "The golden rule — $match early:",
      nav: "Put $match (and $sort when index-backed) as EARLY as possible. A $match at the front can use an index to seek only the relevant documents; the same $match after a $group or $unwind runs on the whole intermediate stream in memory with no index. The optimizer reorders some stages, but don't rely on it — write the pipeline so the selective filter is first. This one habit is the difference between an aggregation that seeks a few thousand docs and one that scans the collection.",
      code: "// Total claim amount per provider, this month, top 10\ndb.claims.aggregate([\n  { $match: { serviceDate: { $gte: ISODate(\"2026-08-01\") } } },  // FIRST: index-usable\n  { $group: { _id: \"$providerId\", total: { $sum: \"$amount\" }, n: { $sum: 1 } } },\n  { $sort: { total: -1 } },\n  { $limit: 10 }\n])",
      note: "Aggregations have a 100MB per-stage memory limit; a big $group or $sort that exceeds it errors unless you set allowDiskUse:true (spills to disk, slower). Hitting that is a signal your $match isn't selective enough or you need a supporting index.",
      followups: [
        "\"Your $match is after $group and the query is slow. Why, and what changes?\"",
        "\"When would you set allowDiskUse:true, and what does hitting the 100MB limit tell you about the pipeline?\""
      ]
    },
    {
      title: "$group, $unwind, $project — reshaping documents",
      badge: "intermediate",
      concept: "$group buckets by an _id expression and computes accumulators ($sum, $avg, $min/$max, $push to collect into an array, $addToSet, $first/$last). $unwind explodes an array field so each element becomes its own document — essential for aggregating over embedded arrays (sum over an order's line items) and the exact operation a DE uses to FLATTEN nested documents into rows for a warehouse. $project/$set add, remove, or compute fields, including nested expressions.",
      navLabel: "The un-nesting idiom for pipelines:",
      nav: "To turn one order document with an items array into one row per line item (the shape a columnar warehouse wants), $unwind '$items' then $project the fields you want flat. This is the bread-and-butter of extracting Mongo data for analytics: documents are hierarchical, warehouse tables are flat, and $unwind + $project is the bridge. Watch that $unwind on an empty/missing array drops the document unless preserveNullAndEmptyArrays:true.",
      code: "// Flatten order line items -> one row per item (warehouse-friendly)\ndb.orders.aggregate([\n  { $match: { status: \"shipped\" } },\n  { $unwind: { path: \"$items\", preserveNullAndEmptyArrays: false } },\n  { $project: { _id: 0, orderId: \"$_id\", sku: \"$items.sku\",\n                qty: \"$items.qty\", lineTotal: { $multiply: [\"$items.qty\", \"$items.price\"] } } }\n])",
      note: null,
      followups: [
        "\"An order with no items disappears from your flattened output. Why, and how do you keep it?\""
      ]
    },
    {
      title: "$lookup vs relational joins — and why it's not free",
      badge: "advanced",
      concept: "$lookup performs a left outer join to another collection within an aggregation. It works, but it is fundamentally different from a relational join: MongoDB has no join optimizer, no hash/merge-join planner, and for each input document it effectively runs a query against the foreign collection. If the foreign field isn't indexed, that's a collection scan per input document — catastrophic. Even indexed, joining large collections is far more expensive than the equivalent in a relational DB tuned for joins.",
      navLabel: "The senior stance:",
      nav: "$lookup is for occasional enrichment, not your primary access pattern. If you find yourself $lookup-ing on every read, your data model is wrong — you should have embedded or used an extended reference so the read is a single document. ALWAYS index the foreign field ($lookup uses it). For heavy analytical joins across large collections, the right answer is often 'don't do it in Mongo' — land both collections in a warehouse (Snowflake) and join there, where the query planner is built for it. Recognizing that boundary is a data-engineering judgment interviewers probe.",
      code: "// Enrich claims with provider — foreign field MUST be indexed\ndb.providers.createIndex({ _id: 1 })  // (already indexed by default)\ndb.claims.aggregate([\n  { $match: { serviceDate: { $gte: ISODate(\"2026-08-01\") } } }, // narrow FIRST\n  { $lookup: { from: \"providers\", localField: \"providerId\",\n               foreignField: \"_id\", as: \"provider\" } },\n  { $unwind: \"$provider\" }\n])",
      note: "Reduce $lookup cost by $match-ing hard BEFORE the $lookup so you join few documents, not the whole collection. A $lookup at the top of a pipeline over an unfiltered collection is a classic slow-query cause.",
      followups: [
        "\"Every read in your app does a $lookup. What does that tell you about the data model?\"",
        "\"You need to join two 500M-doc collections for a report. Do you do it in Mongo? Where else, and why?\""
      ]
    },
    {
      title: "$facet, $bucket, and multi-view aggregations",
      badge: "advanced",
      concept: "$facet runs multiple sub-pipelines over the SAME input in a single pass, each producing its own result array — perfect for a dashboard that needs several rollups (total by status, histogram of amounts, top providers) without re-scanning the collection N times. $bucket/$bucketAuto group numeric/date ranges into buckets (histograms). Together they let you compute a whole analytics panel in one aggregation.",
      navLabel: "Why it's efficient:",
      nav: "Without $facet you'd run three separate aggregations, each re-reading and re-filtering the collection. $facet shares the upstream $match/stream once and fans out — one pass, multiple outputs. The catch: each facet sub-pipeline runs on the post-$match stream and can't individually use different indexes, so keep the shared $match selective. For paginated results with a total count, the count+page $facet is the idiomatic 'give me this page AND the total' in one round trip.",
      code: "// One pass: page of results + total count + status breakdown\ndb.claims.aggregate([\n  { $match: { serviceDate: { $gte: ISODate(\"2026-08-01\") } } },\n  { $facet: {\n      page:   [ { $sort: { amount: -1 } }, { $skip: 0 }, { $limit: 20 } ],\n      total:  [ { $count: \"n\" } ],\n      byStatus: [ { $group: { _id: \"$status\", n: { $sum: 1 } } } ]\n  } }\n])",
      note: null,
      followups: [
        "\"What can and can't each $facet sub-pipeline do with indexes?\""
      ]
    },
    {
      title: "Multi-document transactions — real ACID, used sparingly",
      badge: "advanced",
      concept: "Since 4.0 (replica sets) and 4.2 (sharded clusters), MongoDB supports multi-document ACID transactions: a set of reads/writes across multiple documents and collections that commit atomically or roll back together, with snapshot isolation. This closes the historical 'Mongo isn't ACID' gap — but it's scoped. Single-document writes have ALWAYS been atomic; transactions are only for the rarer case where one logical change genuinely spans multiple documents.",
      navLabel: "When to use — and when your model should avoid needing it:",
      nav: "Use a transaction when correctness requires several documents to change together and you can't restructure to a single document (transfer between two account documents; updating a claim and its ledger entry). But transactions carry cost — they hold locks, have a default 60s runtime limit, can abort on write conflicts (you must retry), and don't scale as cheaply across shards. The senior instinct: if you reach for transactions constantly, your model is too normalized — embedding would make many of those changes single-document and atomic for free. Transactions are the exception, not the pattern.",
      code: "const s = db.getMongo().startSession();\ns.startTransaction({ readConcern: { level: \"snapshot\" },\n                     writeConcern: { w: \"majority\" } });\ntry {\n  const a = s.getDatabase(\"bank\").accounts;\n  a.updateOne({ _id: \"ACC-1\" }, { $inc: { balance: -100 } });\n  a.updateOne({ _id: \"ACC-2\" }, { $inc: { balance:  100 } });\n  s.commitTransaction();\n} catch (e) { s.abortTransaction(); throw e; }  // retry on transient error\nfinally { s.endSession(); }",
      note: "Interview trap: 'MongoDB isn't ACID.' Correct answer: single-document ops always were atomic; multi-document ACID transactions exist since 4.0 but are meant for the exceptions — a well-modeled schema needs them rarely.",
      followups: [
        "\"If you're using transactions everywhere, what does that say about your schema?\"",
        "\"A transaction aborts with a write conflict. Whose job is the retry, and why does that happen?\""
      ]
    },
    {
      title: "Bulk writes and change streams — the DE ingest/egress edges",
      badge: "advanced",
      concept: "bulkWrite() batches many inserts/updates/deletes into one round trip — ordered (stops on first error) or unordered (best-effort, parallelizable, faster). It's how you load throughput efficiently instead of one op per network hop. Change streams ($changeStream) let you subscribe to a real-time feed of inserts/updates/deletes on a collection, built on the replica-set oplog — this is MongoDB's native CDC and the primary way a DE gets data OUT of Mongo into Kafka/Snowflake without polling.",
      navLabel: "Why these two matter most to a DE:",
      nav: "Bulk writes are the sink side (loading into Mongo efficiently, unordered for speed when order doesn't matter); change streams are the source side (streaming changes out). A change stream returns a resumeToken with each event so you can restart exactly where you left off after a crash — the same 'commit your position' idea as Kafka offsets. Debezium's Mongo connector is essentially a managed change-stream consumer that lands events in Kafka. If asked 'how do you get data out of Mongo continuously,' the answer is change streams / Debezium, not a nightly full scan.",
      code: "// Efficient batched load\ndb.readings.bulkWrite([\n  { insertOne: { document: { deviceId: \"DEV-1\", ts: ISODate(), temp: 71.2 } } },\n  { updateOne: { filter: { _id: \"DEV-1\" }, update: { $inc: { count: 1 } }, upsert: true } }\n], { ordered: false });\n\n// Native CDC: stream changes out (resumable)\nconst cs = db.claims.watch([ { $match: { operationType: { $in: [\"insert\",\"update\"] } } } ]);\nwhile (cs.hasNext()) { const change = cs.next(); /* -> Kafka/Snowflake; save change._id token */ }",
      note: "Change streams need the resumeToken persisted downstream; on restart you resumeAfter(token) so you don't miss or double-read events — exactly the offset-management discipline of any streaming pipeline.",
      followups: [
        "\"How do change streams guarantee you don't miss events across a consumer restart?\"",
        "\"Ordered vs unordered bulkWrite — when does ordered actually matter?\""
      ]
    }
  ]
},

indexing: {
  intro: {
    title: "Indexing & performance — the ESR rule, covered queries, and reading a plan",
    desc: "Indexes are where MongoDB performance is won or lost. The single most important concept is the ESR rule for compound-index field order; the second is being able to read explain() and tell an IXSCAN from a COLLSCAN. Everything else is knowing which specialized index a query shape needs."
  },
  cards: [
    {
      title: "Single-field and compound indexes — order is everything",
      badge: "fundamentals",
      concept: "A single-field index ({ status: 1 }) speeds equality/range/sort on that field. A compound index ({ a: 1, b: 1, c: 1 }) is ONE index over the ordered tuple — and field order is decisive. A compound index supports a query only if the query uses a PREFIX of the index fields: { a:1, b:1, c:1 } serves queries on {a}, {a,b}, {a,b,c}, but NOT {b} or {c} alone. It's like a phone book sorted by (last, first): great for 'last=Smith' or 'last=Smith, first=Ada', useless for 'first=Ada' alone.",
      navLabel: "The practical implication:",
      nav: "You don't need a separate index per field — one well-ordered compound index covers a whole family of prefix queries, which is why over-indexing (an index per field) is wasteful. Order the fields by the ESR rule (next card), not alphabetically or by intuition. The direction (1/-1) only matters for sort, and only relative to other fields in the index.",
      code: "db.claims.createIndex({ providerId: 1, serviceDate: -1 })\n// serves: {providerId}, {providerId, serviceDate}\n// does NOT serve: {serviceDate} alone -> that needs its own index",
      note: null,
      followups: [
        "\"You have indexes on {a} and {a,b}. Is the {a} index redundant? When is it not?\""
      ]
    },
    {
      title: "The ESR rule — Equality, Sort, Range field order",
      badge: "intermediate",
      concept: "The ESR rule dictates compound-index field order: put EQUALITY-matched fields first, then the SORT fields, then RANGE-matched fields — Equality, Sort, Range. Equality fields narrow the index to a contiguous block; a sort field placed next lets the index return rows already in sorted order (no in-memory sort); range fields go last because a range scans a span, and any field after a range in the index can't be used to satisfy equality/sort efficiently.",
      navLabel: "Why this exact order:",
      nav: "Equality first collapses the search to one contiguous slice of the B-tree. Within that slice, if the next index field is your sort key, the results are already ordered — you skip the blocking in-memory SORT stage (which is what blows the 32MB sort memory limit / forces disk). Range last because once you scan a range, index order beyond it is no longer aligned with a further sort/equality. Get ESR wrong and MongoDB still 'uses' the index but adds a SORT stage or scans far more keys than needed. This is THE compound-index interview question.",
      code: "// Query: status == 'active' (E), sorted by serviceDate (S), amount > 500 (R)\ndb.claims.find({ status: \"active\", amount: { $gt: 500 } })\n         .sort({ serviceDate: -1 })\n// ESR-correct index:\ndb.claims.createIndex({ status: 1, serviceDate: -1, amount: 1 })",
      note: "If you see a SORT stage in explain() despite an index, your sort field is likely misplaced relative to ESR — the index narrowed the match but couldn't supply order. Reorder to E-S-R and the SORT disappears.",
      followups: [
        "\"Query filters on 3 equalities, sorts on 1, ranges on 1. Give me the index field order.\"",
        "\"Why does a range field before a sort field defeat the index-provided sort?\""
      ]
    },
    {
      title: "explain() — reading a query plan (COLLSCAN vs IXSCAN)",
      badge: "intermediate",
      concept: "explain('executionStats') is how you SEE what a query does. The winning plan's stages tell the story: IXSCAN = it used an index (good); COLLSCAN = it scanned every document (usually bad on a large collection); FETCH = it went from index entries to full documents; SORT = an in-memory sort (a red flag — means no index provided order). The headline numbers: totalKeysExamined, totalDocsExamined, and nReturned. You want examined ≈ returned; examined ≫ returned means the index is poorly matched.",
      navLabel: "How to read it fast:",
      nav: "1) Is the top stage IXSCAN or COLLSCAN? COLLSCAN on anything but a tiny collection = missing/unused index. 2) Is there a SORT stage? If yes, an index could probably supply the order (fix via ESR). 3) docsExamined vs nReturned: if you examined 1,000,000 to return 10, the index isn't selective enough or a $ne/$regex defeated it. A perfect plan: IXSCAN, no SORT, keysExamined ≈ docsExamined ≈ nReturned.",
      code: "db.claims.find({ status: \"active\" }).sort({ serviceDate: -1 })\n  .explain(\"executionStats\")\n// look for: winningPlan.stage, totalKeysExamined,\n//           totalDocsExamined, nReturned, and any SORT stage",
      note: "explain('allPlansExecution') shows the rejected plans too — useful when the optimizer picked a surprising index. MongoDB caches the winning plan per query shape, so a plan can go stale after data distribution changes.",
      followups: [
        "\"explain shows IXSCAN but docsExamined is 100x nReturned. What's wrong?\"",
        "\"You see a SORT stage. Walk me through eliminating it.\""
      ]
    },
    {
      title: "Covered queries — answer from the index alone",
      badge: "advanced",
      concept: "A covered query is answered ENTIRELY from an index without fetching documents — it happens when every field in the filter AND the projection is in the index, and you exclude _id (or include it in the index). explain() shows an IXSCAN with NO FETCH stage. Because it never touches the actual documents (which live off in the collection / off-heap), a covered query is dramatically cheaper — pure index B-tree reads.",
      navLabel: "How to engineer one:",
      nav: "Build a compound index that contains both the filtered fields and the returned fields, then project exactly those fields with _id:0. Great for high-frequency lookups that need only a few fields (does this MRN exist? what's this key's status?). The catch: you can't cover a query that projects a field not in the index, and multikey (array) indexes generally can't cover. It's a targeted optimization for hot, narrow read paths — not something you do for every query.",
      code: "db.claims.createIndex({ providerId: 1, status: 1 })   // covers if we only need these\ndb.claims.find(\n  { providerId: \"PRV-42\" },\n  { _id: 0, providerId: 1, status: 1 }   // all projected fields are in the index\n)  // explain -> IXSCAN, no FETCH  == covered",
      note: null,
      followups: [
        "\"Why does including a non-indexed field in the projection break coverage?\""
      ]
    },
    {
      title: "Multikey indexes — indexing array fields",
      badge: "intermediate",
      concept: "When you index a field that holds an array, MongoDB creates a MULTIKEY index: it stores one index entry per array element. So an index on { tags: 1 } lets { tags: 'urgent' } seek directly to documents whose tags array contains 'urgent'. This is how array containment queries stay fast. It's automatic — you don't declare 'multikey'; Mongo marks the index multikey the moment any indexed document has an array there.",
      navLabel: "The constraints that bite:",
      nav: "You can't create a compound index with MORE THAN ONE array field (it would be a combinatorial explosion of element-pairs) — MongoDB rejects it. Multikey indexes are usually larger (one entry per element) and generally can't produce covered queries or support certain sort optimizations. And a compound multikey index behaves subtly with $elemMatch vs separate predicates. Know that indexing arrays works and is common, but the multi-array-field restriction and the coverage limitation are the gotchas.",
      code: "db.orders.createIndex({ \"items.sku\": 1 })   // multikey (items is an array)\ndb.orders.find({ \"items.sku\": \"A1\" })       // seeks via the multikey index\n// db.orders.createIndex({ \"items.sku\": 1, \"tags\": 1 })  // ERROR if both are arrays",
      note: null,
      followups: [
        "\"Why won't MongoDB let you compound-index two array fields together?\""
      ]
    },
    {
      title: "Specialized indexes — text, geo, TTL, partial, wildcard",
      badge: "advanced",
      concept: "Beyond B-tree indexes: TEXT indexes tokenize string fields for keyword search ($text); 2dsphere GEO indexes enable $near / $geoWithin location queries; TTL indexes auto-delete documents after N seconds past a date field (self-expiring sessions, logs, PHI retention windows); PARTIAL indexes index only documents matching a filter (smaller/cheaper — index only active records); SPARSE indexes skip documents missing the field; WILDCARD indexes ({ '$**': 1 }) index unknown/variable field names in truly dynamic documents.",
      navLabel: "Which to reach for:",
      nav: "TTL is a DE favorite: attach it to a timestamp and MongoDB garbage-collects old data on a background sweep — perfect for retention policies (expire raw events after 30 days) without a cron job. PARTIAL indexes cut index size and write cost when you only ever query a subset (e.g. status:'active') — often better than a sparse index because the condition is explicit. WILDCARD is a last resort for genuinely unpredictable schemas (polymorphic/attribute-bag documents); it's not a substitute for knowing your access pattern. TEXT is fine for light search but a real search workload belongs in Elasticsearch.",
      code: "// TTL: expire documents 30 days after createdAt\ndb.events.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 })\n// Partial: index only active claims -> smaller, cheaper\ndb.claims.createIndex({ providerId: 1 },\n  { partialFilterExpression: { status: \"active\" } })\n// Geo\ndb.sites.createIndex({ location: \"2dsphere\" })",
      note: "TTL granularity is ~60s (background sweeper), so deletion isn't instant at the expiry second — fine for retention, not for precise scheduling.",
      followups: [
        "\"Partial vs sparse index — when is partial the better choice?\"",
        "\"You need PHI purged after 7 years for compliance. TTL index — what are its limits for that guarantee?\""
      ]
    },
    {
      title: "Selectivity and cardinality — why an index can be ignored",
      badge: "advanced",
      concept: "An index only helps if it's SELECTIVE — if it narrows the candidate set substantially. Indexing a low-cardinality field (a boolean isActive, a gender field, a status with 3 values) barely narrows anything: a value that matches 40% of the collection means the index scans ~40% of entries then fetches, often WORSE than a plain scan, so the optimizer may ignore the index entirely. High-cardinality fields (MRN, email, ObjectId, providerId) make excellent index leads because equality collapses to few documents.",
      navLabel: "The compound-index payoff:",
      nav: "Low-cardinality fields aren't useless — they're just poor LEADING fields alone. Compounded AFTER a high-selectivity equality (ESR), a status field is fine because the leading field already narrowed to a small block. The design rule: lead compound indexes with your most selective equality field. If you 'added an index but the query is still slow,' selectivity (or ESR order) is the usual culprit — the index exists but doesn't narrow enough for the planner to prefer it.",
      code: "// Poor: leads with low-cardinality boolean\ndb.claims.createIndex({ isActive: 1 })\n// Better: selective field leads; status rides along (ESR)\ndb.claims.createIndex({ providerId: 1, isActive: 1 })",
      note: null,
      followups: [
        "\"You indexed a boolean field and the planner ignores it. Explain why in terms of selectivity.\""
      ]
    },
    {
      title: "Write amplification — the cost of too many indexes",
      badge: "advanced",
      concept: "Every index is a data structure that must be updated on every insert/update/delete of an indexed field. Ten indexes on a collection means an insert writes eleven structures (the document + ten index entries). Indexes also consume RAM (you want the working set of indexes in the WiredTiger cache) and disk. So indexes are not free 'read accelerators' — they are a direct tax on write throughput and memory. Over-indexing is as real a problem as under-indexing.",
      navLabel: "The balance a senior strikes:",
      nav: "Index for your actual query shapes, then stop. Use compound indexes to serve families of queries with one structure rather than one index per field. Periodically drop unused indexes ($indexStats shows access counts — an index with zero ops since restart is dead weight taxing every write). On write-heavy collections (IoT ingest, event logs) be especially frugal: each extra index directly caps your insert rate. The interview signal is naming this tradeoff — read speed bought with write cost and memory — rather than treating indexes as pure upside.",
      code: "// Find indexes nobody uses (candidates to drop)\ndb.claims.aggregate([ { $indexStats: {} } ])\n// -> accesses.ops per index; 0 (since restart) => likely droppable",
      note: "Rule of thumb: if adding an index doesn't demonstrably help a real query (checked via explain), don't add it. And prefer one compound index over three single-field indexes when a prefix relationship exists.",
      followups: [
        "\"A write-heavy collection is slowing down. How could indexes be the cause, and how do you confirm it?\""
      ]
    },
    {
      title: "The working set and the WiredTiger cache",
      badge: "advanced",
      concept: "MongoDB's default storage engine, WiredTiger, keeps hot data and indexes in an in-memory cache (default ~50% of RAM). Performance stays high as long as your WORKING SET — the indexes and documents you actually touch — fits in that cache. When it doesn't, queries fault to disk and latency spikes. This is why index size and document size (see the massive-document anti-pattern) directly affect performance: bloated documents and redundant indexes evict the hot data you need.",
      navLabel: "Why this ties the module together:",
      nav: "Everything connects here: unbounded arrays make documents huge → they evict cache; too many indexes → indexes don't fit in cache and writes thrash; low-selectivity indexes → scanned pages fault in uselessly. The senior mental model is 'keep the working set (hot docs + the indexes serving hot queries) resident in the WiredTiger cache.' When someone says 'Mongo got slow as we grew,' the working set outgrowing RAM is the usual root cause — and the fix is often better modeling and fewer/leaner indexes, not just a bigger box.",
      code: "// Inspect cache pressure\ndb.serverStatus().wiredTiger.cache[\"bytes currently in the cache\"]\ndb.serverStatus().wiredTiger.cache[\"maximum bytes configured\"]",
      note: null,
      followups: [
        "\"'Mongo was fast, now it's slow as we scaled' with no query changes. What's your first hypothesis?\""
      ]
    }
  ]
},

scaling: {
  intro: {
    title: "Replication & sharding — availability, durability, and horizontal scale",
    desc: "A replica set gives you HA and read scaling on one dataset; sharding gives you horizontal write/storage scale across many. The senior topics are write concern / read preference tradeoffs and — the big one — picking a shard key, where a bad choice hotspots one shard and can't be undone easily."
  },
  cards: [
    {
      title: "Replica sets — primary, secondaries, elections, the oplog",
      badge: "intermediate",
      concept: "A replica set is a group of mongod nodes holding the same data: one PRIMARY (takes all writes) and several SECONDARIES that replicate from it by tailing the primary's OPLOG (a capped collection of every write operation — the same log that powers change streams and CDC). If the primary fails, the remaining nodes hold an ELECTION (Raft-like) and a secondary is promoted — automatic failover, typically in seconds. A replica set is the baseline production deployment; a single mongod is for dev only.",
      navLabel: "Why an odd number of voting members:",
      nav: "Elections need a strict majority, so you want an odd number of voters (3, 5) to avoid ties and to define majority cleanly. With 3 nodes you tolerate 1 failure and still elect a primary; with a 2-node set a single failure leaves no majority and writes stop. When cost rules out a third data-bearing node, an ARBITER (votes but holds no data) breaks ties — but arbiters weaken durability guarantees under w:majority, so real deployments prefer three full members. The oplog is finite (capped): a secondary offline longer than the oplog window falls off and needs a full resync.",
      code: "rs.initiate({ _id: \"rs0\", members: [\n  { _id: 0, host: \"m1:27017\" },\n  { _id: 1, host: \"m2:27017\" },\n  { _id: 2, host: \"m3:27017\" }\n] })\nrs.status()   // who's PRIMARY, replication lag per secondary",
      note: "The oplog is the CDC backbone: change streams and Debezium tail it. Size the oplog for your peak write burst plus your longest expected secondary downtime, or you risk resyncs and gaps in downstream CDC.",
      followups: [
        "\"3-node set, the primary's disk dies. Walk me through what happens to in-flight writes and reads.\"",
        "\"Why is an arbiter a durability risk under w:majority?\""
      ]
    },
    {
      title: "Write concern — how durable is 'acknowledged'?",
      badge: "advanced",
      concept: "Write concern (w, j, wtimeout) controls how many nodes must confirm a write before the driver calls it successful. w:1 = only the primary acknowledged (fast, but if the primary dies before replicating, that write can be lost on failover — a rollback). w:'majority' = a majority of the set has it, so it survives failover (this is the durable default in modern drivers). j:true = the primary has flushed it to the on-disk journal (survives a crash, not just a process restart). wtimeout bounds how long you wait for the concern to be met.",
      navLabel: "The tradeoff and the trap:",
      nav: "w:'majority' + j:true is the durable setting; w:1 j:false is the fast, lossy one. This is the direct analog of Kafka's acks=all vs acks=1 — same durability-vs-latency dial. The trap: writing with w:1 and assuming the data is safe, then losing it in a rollback when the primary fails over before replicating. For money/clinical writes, use w:'majority'. For high-volume telemetry where a lost point is fine, w:1 is a legitimate throughput choice. State the concern explicitly per workload rather than trusting the default.",
      code: "db.transactions.insertOne(\n  { acct: \"ACC-1\", amt: 100 },\n  { writeConcern: { w: \"majority\", j: true, wtimeout: 5000 } }\n)",
      note: "A write acknowledged at w:1 that hasn't replicated when the primary crashes gets ROLLED BACK when that node rejoins — the classic 'my write vanished' incident. w:'majority' prevents it.",
      followups: [
        "\"w:1 write, primary crashes 50ms later before replicating. Where did the write go?\"",
        "\"How is w:'majority'/j:true the same idea as Kafka's acks=all + min.insync.replicas?\""
      ]
    },
    {
      title: "Read preference — scaling reads and the staleness cost",
      badge: "advanced",
      concept: "Read preference decides which node serves a read: primary (default — always current, the CP choice), primaryPreferred, secondary, secondaryPreferred, or nearest (lowest latency). Reading from secondaries scales read throughput and can cut latency geographically, but secondaries replicate asynchronously, so a secondary read can be STALE (return data older than the latest committed write). You're trading consistency for read scale/latency — an explicit, per-query decision.",
      navLabel: "When secondary reads are (and aren't) OK:",
      nav: "Fine for analytics, dashboards, and reporting where slightly stale is acceptable — and a good way to keep heavy read/ETL load off the primary that serves writes. NOT fine for read-your-own-write flows (create a record then immediately read it back — a secondary may not have it yet) or anything needing the latest state. As a DE running extract queries, pointing them at a secondary (secondaryPreferred) to avoid loading the write primary is a common, sensible pattern — just accept the replication-lag staleness. Pair with readConcern for stronger guarantees when needed.",
      code: "// Keep heavy ETL reads off the write primary\ndb.claims.find({ serviceDate: { $gte: ISODate(\"2026-08-01\") } })\n  .readPref(\"secondaryPreferred\")\n// readConcern 'majority' => only see majority-committed data (no dirty reads)",
      note: "'read-your-write' bug: app writes to primary, immediately reads from a secondary, gets nothing because replication hasn't caught up. Either read from primary for that flow or use causal consistency (a session guarantee).",
      followups: [
        "\"Your app writes then immediately reads and sometimes sees nothing. Diagnose it.\"",
        "\"You point ETL extracts at a secondary. What do you accept, and what could break?\""
      ]
    },
    {
      title: "Sharding — horizontal scale across many nodes",
      badge: "advanced",
      concept: "When one replica set can't hold the data or absorb the write rate, you SHARD: partition the collection across multiple shards (each shard is itself a replica set) by a SHARD KEY. A mongos router sends each query to the right shard(s) using metadata from config servers. Sharding scales writes and storage horizontally — the thing a single replica set can't do (a replica set scales reads, not writes, since all writes hit one primary). It's the answer to 'how does MongoDB scale writes.'",
      navLabel: "Targeted vs scatter-gather:",
      nav: "A query that includes the shard key is TARGETED — routed to the one shard holding that key (fast, scales). A query WITHOUT the shard key is SCATTER-GATHER — sent to every shard and merged (slow, doesn't scale, gets worse as you add shards). This is why the shard key must match your dominant query pattern: if you shard by patientId but mostly query by providerId, every read scatters. The whole payoff of sharding hinges on the shard key aligning with how you read — which is why picking it is the critical, hard-to-reverse decision.",
      code: "sh.enableSharding(\"clinic\")\nsh.shardCollection(\"clinic.claims\", { patientId: 1 })   // ranged shard key\n// query WITH the key -> targeted (one shard):\ndb.claims.find({ patientId: \"P-10293\" })\n// query WITHOUT it -> scatter-gather to all shards:\ndb.claims.find({ amount: { $gt: 1000 } })",
      note: "Don't shard prematurely. Sharding adds real operational complexity (config servers, mongos, balancer, backup/restore harder). A well-indexed replica set on decent hardware handles a lot — shard when you've genuinely outgrown vertical scale, not by default.",
      followups: [
        "\"Sharded by patientId but reports query by providerId — what happens to those reports as you add shards?\"",
        "\"How does sharding scale writes when a plain replica set can't?\""
      ]
    },
    {
      title: "Choosing a shard key — cardinality, frequency, monotonicity",
      badge: "staff-level",
      concept: "A good shard key has three properties: HIGH CARDINALITY (many possible values, so data can split into many chunks — a boolean or low-cardinality field can't spread across many shards); LOW FREQUENCY / EVEN DISTRIBUTION (no single value dominates, or that value's chunk becomes a hotspot no split can relieve); and NON-MONOTONIC write pattern (a steadily increasing key like an ObjectId or timestamp sends ALL new writes to the single highest chunk → one 'hot shard' takes all write load while others idle). Getting these right is the whole game.",
      navLabel: "Hashed vs ranged, and why monotonic keys hotspot:",
      nav: "A RANGED shard key keeps nearby values together — great for range queries (time ranges) but terrible with a monotonic key (all recent writes pile on the top chunk/shard). A HASHED shard key hashes the value so inserts spread evenly across shards — it fixes the monotonic hotspot but destroys range-query locality (a date range now scatters). The classic resolution: use a hashed key, OR a COMPOUND shard key that leads with a high-cardinality, well-distributed field (e.g. { patientId: 1, serviceDate: 1 }) to combine distribution with some range locality. Shard keys are immutable and the collection is hard to reshard, so this decision is effectively permanent — which is exactly why interviewers test it.",
      code: "// BAD: monotonic ObjectId/date -> all new writes hit one shard (hotspot)\nsh.shardCollection(\"clinic.events\", { _id: 1 })\n// FIX A: hashed -> even write distribution (loses range locality)\nsh.shardCollection(\"clinic.events\", { _id: \"hashed\" })\n// FIX B: compound leading with a distributed field\nsh.shardCollection(\"clinic.events\", { patientId: 1, ts: 1 })",
      note: "The three tests to say out loud: cardinality (can it split into many chunks?), frequency (does one value dominate → unsplittable hotspot?), monotonicity (do new writes all target one chunk?). Name all three and give the hashed-vs-ranged tradeoff and you've nailed the hardest MongoDB scaling question.",
      followups: [
        "\"You shard a high-volume event stream by timestamp. What goes wrong, and give me two fixes.\"",
        "\"Hashed shard key fixes the hotspot but breaks something. What, and when do you accept that?\"",
        "\"Can you change a shard key later? What are your options if the original was wrong?\""
      ]
    },
    {
      title: "Chunks and the balancer — how data spreads and moves",
      badge: "staff-level",
      concept: "A sharded collection's key space is divided into CHUNKS (contiguous shard-key ranges). As a chunk exceeds a size threshold it SPLITS; the BALANCER background process migrates chunks between shards to keep the distribution even. This is automatic, but a bad shard key defeats it: a low-cardinality key can't split into enough chunks, and a hot value's chunk can't be split at all (all its documents share one key value), so the balancer can't relieve the hotspot no matter what.",
      navLabel: "What a DE watches for:",
      nav: "Chunk migrations consume I/O and network and can add latency during heavy balancing — you often schedule the balancer to run in off-peak windows. 'Jumbo chunks' (a chunk too big to move because it's a single un-splittable key value) are the visible symptom of a bad shard key — they signal a hotspot the balancer literally cannot fix. Uneven chunk distribution shown by sh.status() is your early warning that the shard key isn't spreading load. The lesson loops back: the balancer only works if the shard key allows fine-grained, even splitting.",
      code: "sh.status()                 // chunk distribution per shard, jumbo flags\nsh.disableBalancer()        // pause during peak load\nsh.enableBalancer()\n// balancer window (off-peak) is set in config.settings",
      note: null,
      followups: [
        "\"You see jumbo chunks piling on one shard. What does that tell you about the shard key?\""
      ]
    },
    {
      title: "Zone sharding — pinning data to shards for locality/compliance",
      badge: "staff-level",
      concept: "Zone (tag) sharding associates ranges of the shard key with specific shards, so those documents physically live on chosen nodes. Uses: data residency/compliance (EU patient records must stay on EU-region shards — a real healthcare/finance requirement), and tiered storage (recent 'hot' data on fast SSD shards, older 'cold' data on cheap shards). It gives you control over placement that the default balancer's even-spread wouldn't provide.",
      navLabel: "Why this is a senior/compliance topic:",
      nav: "In regulated domains (HIPAA, GDPR data residency, financial data sovereignty), 'where does this row physically live' is a legal requirement, not a performance tweak — zone sharding is how MongoDB satisfies it natively instead of running separate clusters per region. The tradeoff: you've overridden automatic balancing, so you own ensuring each zone has capacity; a zone can hotspot if its key range is busy and it has too few shards. Mentioning zone sharding for data-residency shows you've thought about compliance-driven data placement, which lands well for an Amex/healthcare-background candidate.",
      code: "sh.addShardToZone(\"shard-eu\", \"EU\")\nsh.updateZoneKeyRange(\"clinic.patients\",\n  { region: \"EU\", patientId: MinKey }, { region: \"EU\", patientId: MaxKey }, \"EU\")\n// EU-region patients now live only on shard-eu",
      note: null,
      followups: [
        "\"How would you keep EU patient data on EU infrastructure within one sharded cluster?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview prep — the MongoDB/NoSQL questions a 6+ YOE DE actually gets",
    desc: "Each card is a real interview question. Answer it yourself first, then expand for a model answer that shows the tradeoff, the failure mode, and where the boundary is — not textbook recitation. The recurring trap across all of them: treating MongoDB like a relational DB."
  },
  cards: [
    {
      title: "\"When would you NOT use MongoDB?\"",
      badge: "fundamentals",
      navLabel: "How to approach it:",
      nav: "Interviewers ask this to check you're not a NoSQL zealot. Name concrete workloads where relational wins, tie it to access patterns, and show you'd pick the boring right tool. The strongest answers include 'and here's where the line has blurred.'",
      noteLabel: "Model answer:",
      note: "\"I wouldn't use MongoDB when the workload is dominated by complex multi-entity transactions and strong invariants — moving money between accounts, anything needing referential integrity across many tables — a relational DB gives me ACID and constraints natively. I'd avoid it for ad-hoc analytical SQL with lots of joins across large independent entities; Mongo has no join optimizer, so that belongs in a warehouse like Snowflake. And I'd avoid it when the data is genuinely tabular and the schema is stable — I'd just be paying for flexibility I don't use. Mongo shines when the entity is a nested tree read as a unit, the schema is evolving, or I need horizontal write scale. The caveat I'd add: the line has blurred — Postgres has JSONB and Mongo has multi-document transactions now, so it's about which tool makes the DOMINANT access pattern cheap, not what's strictly impossible in the other.\"",
      followups: [
        "\"Postgres has JSONB now — so why would you ever still pick MongoDB?\"",
        "\"Give me a workload where you'd be fired for choosing MongoDB.\""
      ]
    },
    {
      title: "\"Embed or reference? Model a patient with their claims.\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "This tests whether you model by access pattern and whether you spot the unbounded-array trap. Don't answer 'embed' or 'reference' flatly — ask about access patterns and bounds first, then decide, and name the 16MB limit.",
      noteLabel: "Model answer:",
      note: "\"First I'd ask how it's read and how it grows. Demographics, current meds, and allergies I'd EMBED in the patient document — they're bounded, owned by the patient, and shown together on the summary screen, so it's one read and updates are single-document atomic. Claims I'd REFERENCE in their own collection with patientId indexed: a patient accumulates claims without bound, so embedding them would grow the document toward the 16MB limit and drag the whole array on every read. If the common screen shows 'last 5 claims,' I'd use the subset pattern — keep the recent 5 embedded and the full history referenced — so the dominant read stays a single lookup. The trap I'd avoid is embedding an unbounded array because it 'reads faster today'; it's a time bomb against the document-size limit.\"",
      followups: [
        "\"You embedded 'current medications.' A patient's med history is now needed for analytics. What changes?\"",
        "\"How big can the patient document get before you'd worry, and how would you monitor it?\""
      ]
    },
    {
      title: "\"How does MongoDB scale writes?\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "The key distinction: a replica set does NOT scale writes (all writes hit one primary) — sharding does. Name that clearly, then explain the shard-key dependency. Many candidates conflate replication with write scaling.",
      noteLabel: "Model answer:",
      note: "\"A replica set does not scale writes — every write goes to the single primary; secondaries only scale reads and provide HA. To scale writes you SHARD: partition the collection across multiple shards by a shard key, each shard being its own replica set, with a mongos router directing writes to the right shard. That distributes write load horizontally. But it only works if the shard key spreads writes evenly — a monotonic key like a timestamp or ObjectId sends every new write to the single highest chunk, so one shard takes all the load while the others idle, and you've added complexity for no scaling. So 'how does Mongo scale writes' is really 'pick a shard key with high cardinality, even frequency, and non-monotonic write distribution' — often a hashed key or a compound key leading with a well-distributed field.\"",
      followups: [
        "\"So a replica set gives you nothing for write throughput? Confirm and explain.\"",
        "\"You sharded but one shard is at 90% CPU and the rest are idle. What happened?\""
      ]
    },
    {
      title: "\"Pick a shard key for a high-volume payment-transaction stream.\"",
      badge: "staff-level",
      navLabel: "How to approach it:",
      nav: "Concrete shard-key design. Walk the three tests (cardinality, frequency, monotonicity), reject the obvious-but-wrong choices out loud, then justify a key that balances distribution with the dominant query. This is where finance/Amex flavor lands naturally.",
      noteLabel: "Model answer:",
      note: "\"I'd reject the tempting keys first. Timestamp or a monotonic transactionId: high cardinality but monotonic, so every new write hits one shard — a write hotspot, exactly the wrong choice for a high-volume stream. A low-cardinality field like currency or merchant category: can't split into enough chunks, so it can't spread. What I'd actually pick depends on the dominant read. If we mostly query 'all transactions for an account,' I'd use accountId — high cardinality, evenly distributed if no single account dominates, non-monotonic — and reads by account are then targeted to one shard. If a few whale accounts dominate volume, that account's chunk hotspots and can't be split (single key value), so I'd go compound, { accountId: 1, timestamp: 1 }, to spread a hot account across chunks while keeping some time locality, or hash accountId if I don't need range queries. I'd state the tradeoff: hashed kills range-scan locality, and the shard key is effectively permanent, so I'd validate it against real query and volume distributions before committing.\"",
      followups: [
        "\"One merchant is 30% of all transactions. What does that do to your shard key, and how do you handle it?\"",
        "\"You need both 'by account' and 'by time range' queries fast. Can one shard key serve both?\""
      ]
    },
    {
      title: "\"Is MongoDB ACID?\"",
      badge: "intermediate",
      navLabel: "How to approach it:",
      nav: "A trap question — the naive answer ('no, it's BASE') is outdated, and 'yes, fully' is wrong too. Give the precise, current answer: single-document always atomic; multi-document transactions since 4.0 but scoped.",
      noteLabel: "Model answer:",
      note: "\"Yes, with nuance. Single-document operations have ALWAYS been atomic in MongoDB — because a document can nest related data, a lot of what needs a multi-row transaction in a relational DB is a single-document atomic update here, which is a big part of why the model works. Since 4.0 on replica sets and 4.2 on sharded clusters, MongoDB also supports multi-document ACID transactions with snapshot isolation for the cases that genuinely span documents. But they're the exception, not the pattern: they hold locks, have a ~60-second default limit, can abort on write conflicts so you must retry, and cost more across shards. The senior point is that if I find myself reaching for transactions constantly, my schema is probably too normalized — good document modeling makes most changes single-document and atomic for free. So: atomic per-document always, full multi-document ACID available since 4.0, used sparingly by design.\"",
      followups: [
        "\"If transactions exist, why not just use them like Postgres and stop worrying about modeling?\"",
        "\"What's the isolation level of a MongoDB transaction, and what can still go wrong under concurrency?\""
      ]
    },
    {
      title: "\"Model an e-commerce / claims domain in MongoDB — talk me through it.\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "An open design question. Show the method: enumerate access patterns first, then apply embed/reference/pattern decisions per entity with justification. Name at least two design patterns by name.",
      noteLabel: "Model answer:",
      note: "\"I start from access patterns, not entities. Take claims: the dominant reads are 'show a claim with its line items and the provider name' and 'list a patient's recent claims.' So: line items I EMBED in the claim — bounded, always read together, single-document atomic updates. The provider I REFERENCE by id but use an EXTENDED REFERENCE — snapshot the provider name and NPI on the claim so the list view needs no $lookup, and in healthcare that snapshot is actually correct because the record should show the provider as of service date. A patient's claims I REFERENCE in a claims collection with patientId indexed (unbounded history), and use the SUBSET pattern to keep the recent few on the patient summary. For a batch total I'd use the COMPUTED pattern — maintain totalAmount with $inc rather than aggregating on every read, with a nightly reconciliation to correct drift. And I'd stamp a schemaVersion so I can evolve the shape without a big-bang migration. The through-line is: embed by default, reference when unbounded or shared, and duplicate small display fields deliberately to make the dominant read a single lookup.\"",
      followups: [
        "\"You snapshotted provider name on the claim. The provider renames. Bug or feature? Defend it.\"",
        "\"Where in this model would you still need a multi-document transaction?\""
      ]
    },
    {
      title: "\"This aggregation is slow. Debug it.\"",
      badge: "advanced",
      navLabel: "How to approach it:",
      nav: "Give an ordered diagnostic, not 'add an index.' Show you'd run explain, check stage order ($match early), spot a $lookup or SORT, and know the memory limits. Reference COLLSCAN vs IXSCAN.",
      noteLabel: "Model answer:",
      note: "\"I'd run it through explain('executionStats') and read it top-down. First, is the leading stage an IXSCAN or a COLLSCAN? A COLLSCAN means my $match isn't hitting an index — I'd check that $match is the FIRST stage (a $match after $group or $unwind can't use an index, it runs on the whole in-memory stream) and that a supporting index exists in ESR order. Second, is there a SORT stage? That's a blocking in-memory sort — I'd add or reorder a compound index so the index supplies the order. Third, is there a $lookup near the top over an unfiltered collection, or on an unindexed foreign field? That's a per-document query — I'd $match hard BEFORE the $lookup and index the foreign field, or question whether that join belongs in Mongo at all versus a warehouse. Fourth, if it's erroring at the 100MB stage limit or I've set allowDiskUse, that's telling me the filter isn't selective enough. I'd confirm the fix by comparing totalDocsExamined to nReturned — I want them close.\"",
      followups: [
        "\"explain shows a COLLSCAN feeding a $group. Two possible causes?\"",
        "\"The pipeline errors with 'exceeded memory limit.' What does that tell you, and is allowDiskUse the right fix?\""
      ]
    },
    {
      title: "\"SQL/warehouse vs MongoDB for analytics — where do you draw the line?\"",
      badge: "staff-level",
      navLabel: "How to approach it:",
      nav: "This is the data-engineering judgment question. Show you know Mongo is operational, not analytical, and that the right architecture moves data OUT to a warehouse — via CDC — for heavy analytics. Name the mechanism (change streams / Debezium).",
      noteLabel: "Model answer:",
      note: "\"MongoDB is an operational/serving store, not an analytical one — no columnar storage, no join optimizer, aggregations run on the live cluster competing with production traffic, and cross-collection joins over large data are expensive. So for anything beyond light operational rollups, I don't run analytics IN Mongo. The pattern I'd build: capture changes with change streams — or Debezium's Mongo connector, which tails the oplog — stream them into Kafka, and land them in Snowflake or S3, un-nesting the documents into flat columnar tables (that's exactly what $unwind + $project does, but I'd rather do the heavy lifting downstream). Then analysts join and aggregate in the warehouse where the query planner is built for it, and production Mongo is never touched by a heavy report. If I must query Mongo directly for ops dashboards, I'd point those reads at a SECONDARY with secondaryPreferred so they don't load the write primary, accepting a little replication-lag staleness. The line is: operational reads and single-entity lookups in Mongo, analytical joins and aggregations in the warehouse, CDC as the bridge.\"",
      followups: [
        "\"How do you get data continuously out of Mongo without hammering it with full-table scans?\"",
        "\"Your analysts keep running heavy aggregations on the production replica set. How do you fix this architecturally?\""
      ]
    },
    {
      title: "\"How do you get data out of MongoDB into your warehouse — and keep it fresh?\"",
      badge: "staff-level",
      navLabel: "How to approach it:",
      nav: "Direct DE pipeline question. Contrast full-scan batch vs CDC, name the resumeToken/oplog mechanics, and address schema drift from a schemaless source. This is your home turf as a DE — go concrete.",
      noteLabel: "Model answer:",
      note: "\"For a one-time or slowly-changing load, a batched extract with bulkWrite-style paging off a SECONDARY works. But for freshness at scale you don't full-scan repeatedly — you use CDC. MongoDB's change streams expose a resumable feed of inserts/updates/deletes built on the replica-set oplog; each event carries a resumeToken I persist downstream so on restart I resumeAfter it and neither miss nor double-read — the same offset discipline as Kafka. In practice I'd run Debezium's Mongo connector, which is a managed change-stream consumer, land events in Kafka, then sink to Snowflake/S3. The hard part is that Mongo is schemaless, so the pipeline owns the schema: fields that are sometimes absent or type-varying, arrays to un-nest into rows. I'd lean on the schemaVersion field if the source uses it, enforce a target schema in the warehouse, and handle deletes explicitly (a delete event carries only the _id). I'd also size the oplog generously — if a secondary or the CDC consumer falls behind the oplog window, I get a gap and a costly resync.\"",
      followups: [
        "\"A delete event from the change stream only has the _id. How do you propagate deletes to the warehouse?\"",
        "\"Your CDC consumer was down for a day and the oplog rolled over. What now?\"",
        "\"How do you handle a field that's a string in some documents and an object in others when loading to a typed warehouse?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "In MongoDB, the central data-modeling decision is:",
    options: [
      "Normalizing to third normal form",
      "Embed vs reference, driven by access patterns and array bounds",
      "Choosing between INT and VARCHAR column types",
      "Picking an isolation level for every read"
    ],
    correct: 1
  },
  {
    q: "You have a field that appends new entries forever (a device's readings). Embedding it as an array is:",
    options: [
      "Fine — arrays are unbounded in MongoDB",
      "The unbounded-array anti-pattern; it trends toward the 16MB limit and slows reads/writes",
      "Required, because embedding is always faster",
      "Only a problem on sharded clusters"
    ],
    correct: 1
  },
  {
    q: "For a compound index, the ESR rule orders fields as:",
    options: [
      "Range, Sort, Equality",
      "Equality, Sort, Range",
      "Sort, Equality, Range",
      "Alphabetical, then by cardinality"
    ],
    correct: 1
  },
  {
    q: "In an aggregation pipeline, $match should be placed:",
    options: [
      "As late as possible, after $group",
      "As early as possible, so it can use an index to narrow the input",
      "It doesn't matter — the optimizer always reorders it",
      "Only inside a $facet stage"
    ],
    correct: 1
  },
  {
    q: "What does a replica set give you for WRITE throughput?",
    options: [
      "Linear write scaling as you add secondaries",
      "Nothing — all writes go to the single primary; sharding is what scales writes",
      "Double the write rate with two secondaries",
      "Write scaling only if reads use secondaryPreferred"
    ],
    correct: 1
  },
  {
    q: "A monotonically increasing shard key (e.g. a timestamp or ObjectId) causes:",
    options: [
      "Perfectly even write distribution",
      "A write hotspot — all new writes target the single highest chunk/shard",
      "Faster elections",
      "Covered queries by default"
    ],
    correct: 1
  },
  {
    q: "writeConcern w:'majority', j:true gives you durability most analogous to which Kafka setting?",
    options: [
      "acks=0",
      "acks=all with min.insync.replicas >= 2",
      "auto.offset.reset=earliest",
      "enable.idempotence=false"
    ],
    correct: 1
  },
  {
    q: "As a Data Engineer, the standard way to continuously get changes OUT of MongoDB into a warehouse is:",
    options: [
      "Repeatedly full-scan the collection on a cron",
      "Change streams / Debezium tailing the oplog, with a persisted resumeToken",
      "Read directly from the WiredTiger cache files",
      "Run all analytics aggregations on the primary"
    ],
    correct: 1
  }
];
