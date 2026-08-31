// Content data for the LangChain / RAG for Data Engineering module.
const MODULE_ID = "rag";
const CONTENT = {

overview: {
  intro: {
    title: "RAG for data engineers — the pipeline, not the prompt",
    desc: "Retrieval-Augmented Generation is where a lot of DE work is heading: the hard part isn't the LLM call, it's the data pipeline feeding it — ingesting sources, chunking, embedding, indexing, keeping it fresh, and proving the answers are grounded. This module frames RAG as a DE owns it: the retrieval quality, the eval, the serving, and the governance. Work each tab, answer the follow-ups aloud, then check."
  },
  cards: [
    {
      title: "What RAG is — and why it's a data problem",
      badge: "fundamentals",
      conceptLabel: "The mental model:",
      concept: "An LLM only knows what was in its training data — it can't see your enterprise documents, and it's frozen at a cutoff. RAG fixes that by retrieving relevant context from YOUR data at query time and stuffing it into the prompt, so the model answers from facts you supply instead of its parametric memory. The flow: user question → embed it → search a vector index of your chunked documents → take the top-k relevant chunks → put them in the prompt as context → the LLM answers grounded in them, ideally with citations. The LLM is the last step; everything before it — ingest, chunk, embed, index, retrieve — is a data pipeline, which is exactly why it lands on a DE.",
      navLabel: "The distinction interviewers probe:",
      nav: "The model isn't 'learning' your data — nothing is trained. You're doing information retrieval at inference time and handing the results to a frozen model as context. That's why answer quality is dominated by retrieval quality: if the right chunk isn't in the top-k, the model can't answer no matter how good it is. 'Garbage retrieval in, confident hallucination out.'",
      noteLabel: "Model answer:",
      note: "\"An LLM only knows its training data and is frozen at a cutoff, so it can't answer from my company's documents.<br><br>RAG retrieves relevant context from my own data at query time and puts it in the prompt, so the model answers from facts I supply, ideally with citations.<br><br>The flow is: embed the question, search a vector index of my chunked documents, take the top-k chunks, add them to the prompt, and the model answers grounded in them.<br><br>The key point is that the model isn't trained on anything — this is retrieval at inference time. So answer quality is dominated by retrieval quality, and that whole retrieval side is a data pipeline. That's why it's a DE's job.\"",
      followups: [
        "\"Is the model learning your data in RAG? What's actually happening?\"",
        "\"If answers are wrong, where do you look first — the model or the retrieval?\"",
        "\"Why does a DE own RAG rather than an ML engineer?\""
      ]
    },
    {
      title: "RAG vs fine-tuning vs long context — when each",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Three ways to get a model to use your information, and interviewers want the trade-off, not a favorite. RAG: inject retrieved facts at query time — best for knowledge that changes, large corpora, and when you need citations and access control; cheap to update (re-index, no retraining). Fine-tuning: further-train the model to change its behavior/style/format or teach a narrow skill — good for tone, structure, or a domain's language, but a poor and expensive way to inject facts (they go stale and you can't cite them). Long context: just paste everything into a huge context window — fine for a handful of documents per query, but it doesn't scale to a corpus, costs tokens on every call, and retrieval still beats it on precision. The usual answer: RAG for knowledge, fine-tuning for behavior, and they compose.",
      noteLabel: "Model answer:",
      note: "\"I match the tool to the need.<br><br>RAG injects retrieved facts at query time. It's the right choice for knowledge that changes, large corpora, and anywhere I need citations or per-user access control, and it's cheap to update because I just re-index.<br><br>Fine-tuning changes the model's behavior — tone, format, a narrow skill or domain language. It's a bad way to inject facts, because they go stale and can't be cited, and retraining is expensive.<br><br>Long context is just pasting documents into the prompt. Fine for a few documents, but it doesn't scale to a corpus and you pay for those tokens every call.<br><br>So: RAG for knowledge, fine-tuning for behavior. They compose — a fine-tuned model can still retrieve.\"",
      followups: [
        "\"You need the bot to always answer in a strict JSON format — RAG or fine-tune?\"",
        "\"Your policy documents change weekly — which approach, and why not fine-tune?\"",
        "\"When does just using a long context window make sense?\""
      ]
    },
    {
      title: "The RAG pipeline — two phases: indexing and querying",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "Every RAG system has an offline indexing pipeline and an online query pipeline, and separating them is the DE framing. Indexing (batch, like an ETL job): load documents from sources → split into chunks → embed each chunk into a vector → store vectors + text + metadata in a vector database. This runs on a schedule or on document change, and it's where all the classic DE concerns live (incremental loads, dedup, freshness, PII handling). Querying (real-time, per request): embed the user's question → similarity-search the index for top-k chunks → assemble the prompt with those chunks → call the LLM → return the answer with citations. The indexing pipeline is the part a DE most owns; the query pipeline is where latency and grounding matter.",
      code: "# Indexing (offline, batch ETL):\n#   load -> split(chunk) -> embed -> upsert into vector store\n# Querying (online, per request):\n#   question -> embed -> top-k similarity search -> build prompt -> LLM -> answer + citations\n#\n# Same split as any pipeline: a batch build job + a serving path.",
      noteLabel: "Model answer:",
      note: "\"I split every RAG system into two pipelines.<br><br>The indexing pipeline is offline and batch, like an ETL job: load documents from the sources, split them into chunks, embed each chunk into a vector, and upsert the vectors, text, and metadata into a vector store. It runs on a schedule or on document change, and it's where the usual DE concerns live — incremental loads, dedup, freshness, PII handling.<br><br>The query pipeline is real-time and per request: embed the question, similarity-search for the top-k chunks, assemble the prompt, call the model, and return the answer with citations.<br><br>Framing it as a batch build plus a serving path is exactly how I'd reason about any pipeline.\"",
      followups: [
        "\"Which phase runs on a schedule and which per request?\"",
        "\"Where do incremental loads and freshness fit?\"",
        "\"A document is updated — what has to happen for the answer to reflect it?\""
      ]
    }
  ]
},

retrieval: {
  intro: {
    title: "Retrieval quality — chunking, embeddings, and search",
    desc: "Retrieval quality is the whole ballgame: the model can only answer from what you retrieve. This tab covers the levers a DE actually tunes — how you chunk, what you embed, which vector store, and the search strategies (hybrid, reranking, metadata filtering) that pull the right context to the top. This is where most RAG systems are won or lost."
  },
  cards: [
    {
      title: "Chunking — the highest-leverage decision",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "You don't embed whole documents — you split them into chunks, and how you chunk dominates retrieval quality. Too large and a chunk mixes multiple topics, so its embedding is muddy and you waste prompt tokens; too small and it loses the context needed to be meaningful. The default is recursive character splitting that respects structure (paragraphs, then sentences) with an overlap between chunks so an idea split across a boundary isn't lost. Better still is structure-aware chunking: split on markdown headers, sections, or semantic boundaries so each chunk is a coherent unit. Attach metadata to every chunk (source, title, section, date, access tags) — you'll need it for filtering and citations.",
      code: "# Recursive splitter: respect structure, keep an overlap\nfrom langchain.text_splitter import RecursiveCharacterTextSplitter\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=800, chunk_overlap=120,      # overlap preserves cross-boundary context\n    separators=[\"\\n\\n\", \"\\n\", \". \", \" \"]) # try paragraph, then line, then sentence\nchunks = splitter.split_documents(docs)\n# attach metadata per chunk: {source, section, date, acl} for filtering + citations",
      noteLabel: "Model answer:",
      note: "\"I don't embed whole documents — I split them, and chunking is the highest-leverage decision.<br><br>Too large and a chunk covers multiple topics, so its embedding is muddy and it wastes prompt tokens. Too small and it loses the context to be meaningful.<br><br>My default is recursive splitting that respects structure — paragraphs, then sentences — with an overlap so an idea split across a boundary survives. Where documents have structure I chunk on headers or sections so each chunk is a coherent unit.<br><br>And I attach metadata to every chunk — source, section, date, access tags — because I need it for filtering and for citations.\"",
      followups: [
        "\"What goes wrong with chunks that are too big? Too small?\"",
        "\"Why the overlap between chunks?\"",
        "\"Retrieval is returning irrelevant snippets — is chunking a suspect?\""
      ]
    },
    {
      title: "Embeddings & the vector store",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "An embedding model maps text to a vector so that semantically similar text lands close together; you embed every chunk once at index time and the question at query time, then find nearest neighbors by cosine similarity. Key DE concerns: pick one embedding model and stay consistent — you cannot mix models in one index, and changing the model means re-embedding everything. The vector store (pgvector, FAISS, Pinecone, Chroma, and vector features in Databricks/Snowflake) holds the vectors plus text and metadata and does approximate-nearest-neighbor search (HNSW/IVF) so it scales to millions of chunks. Choose by scale, existing stack, and whether you need metadata filtering and hybrid search — often 'pgvector because we already run Postgres' is the right, boring answer.",
      noteLabel: "Model answer:",
      note: "\"An embedding model turns text into a vector so similar text sits close together. I embed every chunk once at index time and the question at query time, then find nearest neighbors by cosine similarity.<br><br>Two things I'm strict about: I pick one embedding model and stay consistent, because you can't mix models in an index, and changing it means re-embedding everything. And I store text and metadata alongside the vectors so I can filter and cite.<br><br>For the store I choose by scale and existing stack. It does approximate-nearest-neighbor search so it scales to millions of chunks. Often the right answer is boring — pgvector because we already run Postgres — unless scale or features push me to a dedicated one.\"",
      followups: [
        "\"Can you change the embedding model without re-indexing? Why not?\"",
        "\"What does 'approximate' nearest-neighbor buy you over exact search?\"",
        "\"How would you pick a vector store for a team already on Postgres?\""
      ]
    },
    {
      title: "Search strategy — hybrid, reranking, metadata filters",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Pure vector search misses things — it's weak on exact keywords, names, codes, and acronyms. Three upgrades a DE reaches for: (1) Hybrid search — combine dense vector search with sparse keyword search (BM25) so you catch both semantic matches and exact terms, fused with something like reciprocal-rank fusion. (2) Reranking — over-fetch (say top-50) then run a cross-encoder reranker to reorder by true relevance and keep the top-k; much more precise than embedding similarity alone. (3) Metadata filtering — restrict the search by tags before/during retrieval (date > X, department = Y, and critically ACLs so a user only retrieves what they're allowed to see). These stack, and they're the difference between a demo and something that answers real questions.",
      noteLabel: "Model answer:",
      note: "\"Pure vector search is weak on exact keywords, names, and codes, so I layer strategies.<br><br>First, hybrid search — I combine dense vector search with sparse keyword search like BM25 and fuse the rankings, so I catch both semantic matches and exact terms.<br><br>Second, reranking — I over-fetch, say the top 50, then run a cross-encoder reranker to reorder by true relevance and keep the top few. That's far more precise than embedding similarity alone.<br><br>Third, metadata filtering — I restrict by tags like date or department, and critically by access-control tags, so a user only ever retrieves documents they're allowed to see.<br><br>Those three stack, and they're usually what moves a RAG system from demo to production.\"",
      followups: [
        "\"A user searches for an exact error code and vector search misses it — fix?\"",
        "\"What does a reranker do that the vector search didn't?\"",
        "\"How do you stop a user retrieving documents they shouldn't see?\""
      ]
    },
    {
      title: "Keeping the index fresh — incremental indexing",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "An index is a derived dataset that goes stale, so freshness is a DE problem. You don't re-embed the whole corpus nightly — that's expensive and slow. Instead, incremental indexing: detect changed/new/deleted documents (via source timestamps, CDC, or content hashes), and upsert only those chunks, deleting the old versions so you don't serve stale or duplicate context. Use a stable chunk ID (e.g. hash of source + section) so re-indexing a changed document replaces its chunks cleanly. This is exactly incremental-load thinking from any pipeline — watermark or hash the source, MERGE the changes — applied to a vector store. Also plan for the re-embed-everything case when you upgrade the embedding model: it's a full backfill.",
      noteLabel: "Model answer:",
      note: "\"An index is a derived dataset, so it goes stale and freshness is my problem.<br><br>I don't re-embed the whole corpus on a schedule — that's slow and expensive. I do incremental indexing: detect new, changed, and deleted documents through source timestamps, CDC, or content hashes, and upsert only those chunks, deleting the old versions so I never serve stale or duplicate context.<br><br>I use a stable chunk ID, like a hash of source plus section, so re-indexing a changed document replaces its chunks cleanly.<br><br>It's the same incremental-load thinking as any pipeline — watermark or hash the source and merge the changes — just applied to a vector store. The one full-backfill case is upgrading the embedding model, which forces re-embedding everything.\"",
      followups: [
        "\"A document is deleted at the source — what must happen in the index?\"",
        "\"How do you avoid duplicate chunks when a document is edited?\"",
        "\"When are you forced to re-embed the entire corpus?\""
      ]
    }
  ]
},

orchestration: {
  intro: {
    title: "LangChain & orchestration — chains, retrievers, agents",
    desc: "LangChain (and similar frameworks) is the glue that wires retrieval to the model and beyond. Interviewers check you understand the components without over-relying on the framework's magic: retrievers, chains/LCEL, prompt assembly, agents vs simple RAG, and when NOT to add agentic complexity. Know the pieces well enough to build it without the framework if asked."
  },
  cards: [
    {
      title: "The core LangChain components",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "LangChain gives named building blocks so you don't hand-roll the plumbing. The ones that matter: Document loaders (pull from PDFs, SQL, S3, web, Confluence…), Text splitters (chunking), Embeddings (wrap an embedding model), Vector stores / Retrievers (the retriever is the key abstraction — 'given a query, return relevant docs', and it hides whether that's vector, hybrid, or reranked), Prompt templates (assemble the context + question), the LLM/chat model, and Output parsers (coerce the response into a structure). LCEL (LangChain Expression Language) pipes these together with a `|` operator into a runnable chain. The value is standard interfaces and swappability; the risk is treating it as magic — know what each piece does.",
      code: "# Minimal RAG chain in LCEL: retrieve -> format prompt -> LLM -> parse\nchain = (\n    {\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}\n    | prompt         # inserts context + question\n    | llm            # the chat model\n    | StrOutputParser()\n)\nanswer = chain.invoke(\"What is our refund policy?\")\n# retriever hides vector/hybrid/rerank; swap it without touching the chain",
      noteLabel: "Model answer:",
      note: "\"LangChain gives me named building blocks so I'm not hand-rolling plumbing.<br><br>Loaders pull from sources, splitters chunk, embeddings wrap the embedding model, and the retriever is the key abstraction — given a query it returns relevant documents, and it hides whether that's plain vector, hybrid, or reranked underneath.<br><br>Then prompt templates assemble the context and question, the chat model answers, and output parsers coerce the result into a structure.<br><br>LCEL pipes these together with a pipe operator into a runnable chain. The value is standard, swappable interfaces. The risk is treating it as magic, so I make sure I know what each piece does and could build it without the framework.\"",
      followups: [
        "\"What's the retriever abstraction hiding, and why is that useful?\"",
        "\"Could you build this RAG chain without LangChain? What would you write?\"",
        "\"What does an output parser buy you?\""
      ]
    },
    {
      title: "Simple RAG vs agentic RAG — don't over-build",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Basic RAG is a single pass: retrieve once, answer. Agentic RAG adds an LLM-driven control loop — the agent can reformulate the query, decide which tool/index to hit, retrieve multiple times, or do multi-step reasoning (query decomposition for multi-hop questions, routing across several data sources, self-correction if the first retrieval was weak). It's more capable but also slower, costlier, harder to test, and less predictable — every extra LLM call is latency, money, and a new failure mode. The senior instinct: start with simple RAG; add agentic steps only when the questions genuinely need multi-hop or multi-source reasoning that one retrieval can't serve. Complexity you can't evaluate is complexity you shouldn't ship.",
      noteLabel: "Model answer:",
      note: "\"Basic RAG is one pass — retrieve once and answer.<br><br>Agentic RAG adds an LLM-driven loop: the agent can rewrite the query, choose which index or tool to hit, retrieve several times, or decompose a multi-hop question and self-correct if the first retrieval was weak.<br><br>It's more capable, but every extra model call is more latency, more cost, and another failure mode, and it's harder to test and less predictable.<br><br>So I start simple and only add agentic steps when the questions genuinely need multi-hop or multi-source reasoning a single retrieval can't serve. I don't ship complexity I can't evaluate.\"",
      followups: [
        "\"When is a single retrieval not enough — give a question that needs multi-hop.\"",
        "\"What are the costs of going agentic?\"",
        "\"How would you route a query across three different data sources?\""
      ]
    },
    {
      title: "Prompt assembly & context-window budgeting",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Assembling the final prompt is a real engineering step, not an afterthought. You have a fixed context budget, so you can't just dump all retrieved chunks: you rank, take the top-k that fit, and leave room for the system prompt, the question, and the answer. Order matters — models attend less to the middle of a long context ('lost in the middle'), so put the strongest chunks at the edges. Always include instructions to answer only from the provided context and to say 'I don't know' if it's not there — this is your main anti-hallucination lever. And include the source metadata with each chunk so the model can cite. Token budgeting, truncation strategy, and de-duplicating near-identical chunks are all DE concerns here.",
      noteLabel: "Model answer:",
      note: "\"Assembling the prompt is a real step. I have a fixed context budget, so I can't dump every retrieved chunk — I rank, take the top-k that fit, and leave room for the system prompt, the question, and the answer.<br><br>Order matters, because models attend less to the middle of a long context, so I put the strongest chunks at the edges.<br><br>I always instruct the model to answer only from the provided context and to say 'I don't know' if it's not there — that's my main anti-hallucination lever.<br><br>And I include each chunk's source metadata so the model can cite. Budgeting tokens, truncating sensibly, and de-duplicating near-identical chunks are all part of it.\"",
      followups: [
        "\"What is 'lost in the middle' and how do you mitigate it?\"",
        "\"How do you make the model say 'I don't know' instead of guessing?\"",
        "\"You retrieved 20 chunks but only 8 fit — what do you do?\""
      ]
    }
  ]
},

production: {
  intro: {
    title: "Production RAG — evaluation, guardrails, cost, and security",
    desc: "Shipping RAG is where DEs earn their keep: how do you prove it's accurate, stop it hallucinating or leaking data, keep latency and cost sane, and monitor it? A demo that answers three questions is easy; a system you'd trust on enterprise data — especially in a regulated shop — needs evaluation, guardrails, and governance. This is the most senior-signal tab."
  },
  cards: [
    {
      title: "Evaluating RAG — you can't improve what you don't measure",
      badge: "fundamentals",
      conceptLabel: "Concept:",
      concept: "RAG has two failure surfaces, so you evaluate both. Retrieval quality: did the right chunks come back? Measure with context precision/recall, hit-rate, and MRR against a labeled set of question→relevant-chunk pairs. Generation quality: given the retrieved context, is the answer faithful (grounded, no hallucination), relevant, and complete? Frameworks like RAGAS score faithfulness, answer relevancy, and context precision/recall, often using an LLM-as-judge. The DE move is to build an evaluation set of real questions with known answers/sources early, run it in CI on every change (new chunking, new embedding model, new prompt), and track the metrics — so you know a change helped instead of guessing. Groundedness/faithfulness is the metric to watch in a regulated domain.",
      noteLabel: "Model answer:",
      note: "\"RAG fails in two places, so I evaluate both.<br><br>For retrieval I ask whether the right chunks came back, and I measure context precision and recall, hit-rate, and MRR against a labeled set of question-to-chunk pairs.<br><br>For generation I ask whether the answer is faithful to the retrieved context, relevant, and complete. I use something like RAGAS to score faithfulness and relevancy, often with an LLM as judge.<br><br>The engineering discipline is building an evaluation set of real questions with known sources early, running it in CI on every change — new chunking, embedding model, or prompt — and tracking the metrics. That way I know a change actually helped. In a regulated domain, faithfulness is the number I watch hardest.\"",
      followups: [
        "\"How do you tell whether a bad answer is a retrieval or a generation failure?\"",
        "\"What's in your evaluation set and how do you build it?\"",
        "\"You changed the embedding model — how do you know it helped?\""
      ]
    },
    {
      title: "Hallucination & grounding guardrails",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "A RAG system can still hallucinate — answer beyond the retrieved context or when nothing relevant was found. Layered defenses: (1) Prompt discipline — instruct 'answer only from context; if not present, say you don't know.' (2) Require citations and, ideally, verify the answer's claims are supported by the retrieved chunks (a faithfulness check, sometimes a second LLM pass). (3) A retrieval confidence threshold — if the top similarity scores are low, refuse rather than answer from weak context. (4) Show sources to the user so they can verify. (5) For high-stakes domains, keep a human in the loop or restrict to answering with citations only. The honest 'I don't know' is a feature, especially in insurance/health/finance where a confident wrong answer is worse than no answer.",
      noteLabel: "Model answer:",
      note: "\"RAG can still hallucinate — answer beyond the context, or when nothing relevant was retrieved. So I layer defenses.<br><br>The prompt instructs the model to answer only from context and to say it doesn't know otherwise. I require citations and, for high stakes, verify the claims are actually supported by the retrieved chunks with a faithfulness check.<br><br>I set a retrieval confidence threshold — if the top similarity scores are weak, I refuse instead of answering from thin context.<br><br>I always show sources so the user can verify, and in a regulated domain I'd keep a human in the loop. An honest 'I don't know' is a feature, because a confident wrong answer on a claim or a policy is worse than no answer.\"",
      followups: [
        "\"Nothing relevant was retrieved — what should the system do?\"",
        "\"How do you check an answer is actually grounded in the sources?\"",
        "\"Why is refusing sometimes better than answering?\""
      ]
    },
    {
      title: "Latency, cost & caching",
      badge: "intermediate",
      conceptLabel: "Concept:",
      concept: "Every query does an embedding call, a vector search, maybe a rerank, and an LLM call — latency and cost add up. Levers: cache embeddings for repeated/known queries; cache full responses for common questions (semantic caching matches paraphrases, not just exact strings); pick model size per need — a small/cheap model for simple answers, a larger one only when required; cap top-k and context length to control tokens; batch the offline embedding job. Cost has two big drivers — the embedding cost at index time (one-off-ish, scales with corpus) and the LLM tokens per query (recurring, scales with traffic and context size). Streaming the response improves perceived latency even when total time is unchanged. These are ordinary serving-performance concerns applied to an LLM path.",
      noteLabel: "Model answer:",
      note: "\"Every query embeds, searches, maybe reranks, and calls the model, so latency and cost add up.<br><br>I cache aggressively — embeddings for known queries, and full responses for common questions with semantic caching so paraphrases hit the cache too. I right-size the model, using a small cheap one for simple answers and a larger one only when needed. I cap top-k and context length to control tokens, and I batch the offline embedding job.<br><br>Cost has two drivers: embedding at index time, which scales with the corpus, and LLM tokens per query, which scale with traffic and context size.<br><br>And I stream the response, which improves perceived latency even when total time is the same. It's ordinary serving-performance work applied to the LLM path.\"",
      followups: [
        "\"What's the difference between exact and semantic response caching?\"",
        "\"Which cost scales with corpus size, and which with traffic?\"",
        "\"How do you cut per-query cost without hurting answer quality?\""
      ]
    },
    {
      title: "Security & governance — the regulated-domain lens",
      badge: "advanced",
      conceptLabel: "Concept:",
      concept: "Enterprise RAG on sensitive data raises real risks a DE must own. Access control: retrieval must respect permissions — filter the vector search by the user's ACLs so they can't retrieve documents they can't see (a top enterprise-RAG failure is a bot surfacing HR or PII data to the wrong user). PII/PHI: decide what to redact or exclude at index time, and remember embeddings and cached prompts now contain your data — govern them like any other copy. Prompt injection: retrieved or user content can carry instructions that hijack the model ('ignore previous instructions…'); mitigate by separating instructions from data, sanitizing, and least-privilege tools. Auditability: log what was retrieved and answered for each query. And data residency/retention: the vector store and any third-party LLM API are data-processing surfaces that must fit your compliance posture (OSFI/PIPEDA/HIPAA).",
      noteLabel: "Model answer:",
      note: "\"Enterprise RAG on sensitive data raises risks I have to own.<br><br>Access control is first: retrieval must respect permissions, so I filter the vector search by the user's access tags — a classic failure is a bot surfacing HR or PII data to someone who shouldn't see it. The index isn't a bypass around your existing permissions.<br><br>For PII and PHI I decide what to redact or exclude at index time, and I treat embeddings and cached prompts as governed copies of the data, because they contain it.<br><br>I guard against prompt injection by separating instructions from retrieved content and using least-privilege tools. I log what was retrieved and answered for audit. And I make sure the vector store and any third-party LLM API fit our compliance posture — residency, retention, OSFI or PIPEDA or HIPAA.\"",
      followups: [
        "\"How do you stop a user retrieving documents they're not allowed to see?\"",
        "\"What is prompt injection and how do you mitigate it in RAG?\"",
        "\"Do embeddings and caches need governing? Why?\""
      ]
    }
  ]
},

interview: {
  intro: {
    title: "Interview Prep — RAG / LangChain questions with model answers",
    desc: "The questions a DE building LLM/RAG systems actually gets, structured fundamentals → advanced. Each hides its model answer until you expand it, and ends with the follow-ups an interviewer digs with. Practice by sketching the pipeline first, then checking."
  },
  cards: [
    {
      title: "\"Walk me through a RAG system you'd build over our documents.\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "Whether you frame it as two pipelines and own the retrieval side — the core RAG-as-a-DE-problem question.",
      noteLabel: "Model answer:",
      note: "\"I split it into an indexing pipeline and a query pipeline.<br><br>Indexing is a batch job: load the documents, chunk them with structure-aware splitting and overlap, embed each chunk with one consistent embedding model, and upsert vectors plus text and metadata — including access tags — into a vector store. It runs incrementally on document change.<br><br>Querying is per request: embed the question, do a hybrid search filtered by the user's ACLs, rerank and take the top-k, assemble a prompt that says answer only from context, call the model, and return the answer with citations.<br><br>Around it I build an evaluation set and run it in CI, add grounding guardrails, and cache for cost and latency. The model is the last step; the retrieval pipeline is the work.\"",
      followups: [
        "\"Which parts are batch and which are real-time?\"",
        "\"Where does access control happen?\"",
        "\"If answers are wrong, where do you debug first?\""
      ]
    },
    {
      title: "\"RAG or fine-tuning?\"",
      badge: "fundamentals",
      conceptLabel: "What they're testing:",
      concept: "Whether you know RAG is for knowledge and fine-tuning is for behavior — and don't reach for fine-tuning to inject facts.",
      noteLabel: "Model answer:",
      note: "\"It depends on whether I'm changing what the model knows or how it behaves.<br><br>RAG is for knowledge — facts that change, large corpora, anything needing citations or access control. It's cheap to update because I just re-index.<br><br>Fine-tuning is for behavior — tone, a strict output format, a domain's language or a narrow skill. It's a poor way to inject facts, because they go stale and can't be cited, and retraining is expensive.<br><br>So for answering from our documents, RAG. If I also needed a fixed response format, I might fine-tune for that on top. They compose.\"",
      followups: [
        "\"Your facts change weekly — which, and why not fine-tune?\"",
        "\"You need strict JSON output every time — which?\"",
        "\"Can you use both together?\""
      ]
    },
    {
      title: "\"Retrieval is returning irrelevant chunks. How do you debug it?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Systematic debugging of the retrieval side — the most practical RAG skill.",
      noteLabel: "Model answer:",
      note: "\"I work the pipeline in order.<br><br>First chunking — are chunks too large and mixing topics, or too small and losing context? I'd inspect the actual chunks being retrieved.<br><br>Then the query itself — is it too short or ambiguous for good embedding similarity? Query rewriting can help.<br><br>Then search strategy — if it's missing exact terms like codes or names, I add hybrid keyword search; if the right chunk is retrieved but ranked low, I add a reranker and over-fetch.<br><br>I'd also check metadata filters aren't over-restricting, and confirm the question is even answerable from the corpus. And I measure — run the eval set so I'm improving retrieval metrics, not guessing.\"",
      followups: [
        "\"The right chunk is in the top-50 but ranked 40th — what fixes that?\"",
        "\"Exact error codes aren't matching — what do you add?\"",
        "\"How do you know your fix actually improved retrieval?\""
      ]
    },
    {
      title: "\"How do you stop it from hallucinating?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Grounding discipline — layered guardrails, not a single trick.",
      noteLabel: "Model answer:",
      note: "\"I layer defenses rather than rely on one.<br><br>The prompt instructs the model to answer only from the retrieved context and to say it doesn't know otherwise. I require citations and, for high stakes, verify the answer's claims are supported by the chunks with a faithfulness check.<br><br>I set a retrieval confidence threshold, so if the top scores are weak I refuse instead of answering from thin context. I show sources so the user can verify.<br><br>And I measure faithfulness in my eval set so I catch regressions. In a regulated domain the honest 'I don't know' is the safe default — a confident wrong answer is worse than none.\"",
      followups: [
        "\"Nothing relevant was retrieved — what does the system return?\"",
        "\"How do you verify an answer is grounded in the sources?\"",
        "\"How do you measure hallucination rate over time?\""
      ]
    },
    {
      title: "\"How do you keep the index fresh and correct as documents change?\"",
      badge: "intermediate",
      conceptLabel: "What they're testing:",
      concept: "Whether you apply incremental-load thinking to a vector store — pure DE.",
      noteLabel: "Model answer:",
      note: "\"I treat the index as a derived dataset and do incremental indexing.<br><br>I detect new, changed, and deleted documents through source timestamps, CDC, or content hashes, and I upsert only the affected chunks, deleting the old versions so I never serve stale or duplicate context.<br><br>I use a stable chunk ID — a hash of source plus section — so re-indexing a changed document replaces its chunks cleanly.<br><br>It's the same watermark-or-hash-and-merge pattern as any incremental pipeline. The one full-backfill case is upgrading the embedding model, which forces re-embedding the whole corpus, so I plan that as a migration.\"",
      followups: [
        "\"A source document is deleted — what happens in the index?\"",
        "\"How do you avoid duplicate chunks after an edit?\"",
        "\"When must you re-embed everything?\""
      ]
    },
    {
      title: "\"This RAG bot serves sensitive enterprise data. What are your top risks?\"",
      badge: "advanced",
      conceptLabel: "What they're testing:",
      concept: "Security and governance maturity — the differentiator for a regulated employer.",
      noteLabel: "Model answer:",
      note: "\"My first risk is access control: retrieval must respect permissions. I filter the vector search by the user's access tags so the bot can never surface a document the user couldn't otherwise see — the index is not a bypass around existing permissions.<br><br>Second, PII and PHI: I decide what to redact or exclude at index time, and I govern embeddings and cached prompts as copies of the data, because they contain it.<br><br>Third, prompt injection: retrieved or user text can carry instructions, so I separate instructions from data and use least-privilege tools.<br><br>Fourth, auditability and compliance: I log what was retrieved and answered, and I make sure the vector store and any external LLM API fit our residency and retention rules — OSFI, PIPEDA, HIPAA as applicable.\"",
      followups: [
        "\"How exactly do you enforce per-user access in retrieval?\"",
        "\"Are embeddings a compliance surface? Why?\"",
        "\"How do you defend against prompt injection from a retrieved document?\""
      ]
    }
  ]
}

};

const QUIZ = [
  {
    q: "In a RAG system, what is actually happening to your data?",
    options: [
      "The model is fine-tuned on your documents",
      "Nothing is trained — relevant chunks are retrieved at query time and put in the prompt as context",
      "Your documents replace the model's training data permanently",
      "The vector store retrains the model nightly"
    ],
    correct: 1
  },
  {
    q: "Answers are wrong. Where does a DE look FIRST?",
    options: [
      "Swap to a bigger LLM",
      "Retrieval quality — if the right chunk isn't in the top-k, the model can't answer no matter how good it is",
      "Increase the temperature",
      "Retrain the embedding model from scratch"
    ],
    correct: 1
  },
  {
    q: "Your knowledge base changes weekly and answers must cite sources. RAG or fine-tuning?",
    options: [
      "Fine-tuning — bake the facts into the model",
      "RAG — it injects current facts at query time, is cheap to update, and supports citations; fine-tuning bakes in stale, uncitable facts",
      "Neither — use a bigger context window only",
      "Both are equally good here"
    ],
    correct: 1
  },
  {
    q: "Why is chunking called the highest-leverage retrieval decision?",
    options: [
      "It reduces storage cost",
      "Too-large chunks mix topics (muddy embeddings); too-small lose context — chunk quality drives what can be retrieved at all",
      "It changes the model's weights",
      "It only affects indexing speed"
    ],
    correct: 1
  },
  {
    q: "You upgrade to a different embedding model. What must you do?",
    options: [
      "Nothing — indexes are model-agnostic",
      "Re-embed the entire corpus — you cannot mix embedding models in one index",
      "Only re-embed the query",
      "Delete the vector store and use keyword search"
    ],
    correct: 1
  },
  {
    q: "Users search for exact error codes and pure vector search keeps missing them. Best fix?",
    options: [
      "Lower the similarity threshold to 0",
      "Hybrid search — combine dense vector search with sparse keyword (BM25) search to catch exact terms",
      "Make chunks much larger",
      "Switch to fine-tuning"
    ],
    correct: 1
  },
  {
    q: "What does a cross-encoder reranker add over embedding similarity alone?",
    options: [
      "It compresses the vectors",
      "You over-fetch candidates, then reorder them by true relevance and keep the top-k — much higher precision",
      "It encrypts the chunks",
      "It removes the need for a vector store"
    ],
    correct: 1
  },
  {
    q: "A document is deleted at the source. What must happen in a fresh, correct index?",
    options: [
      "Nothing — old chunks are harmless",
      "Its chunks must be deleted from the vector store so stale context is never retrieved",
      "Re-embed the whole corpus",
      "Lower that document's similarity score"
    ],
    correct: 1
  },
  {
    q: "An enterprise RAG bot must not leak documents a user can't see. How do you enforce that?",
    options: [
      "Trust the LLM to refuse",
      "Filter the retrieval by the user's ACLs / access tags so restricted documents are never retrieved",
      "Put a warning in the system prompt",
      "Encrypt the answer"
    ],
    correct: 1
  },
  {
    q: "How should you measure whether a chunking or embedding change actually improved things?",
    options: [
      "Ask the model if it got better",
      "Run a labeled evaluation set in CI and track retrieval + faithfulness metrics before/after",
      "Ship it and wait for complaints",
      "Check that latency went down"
    ],
    correct: 1
  }
];
