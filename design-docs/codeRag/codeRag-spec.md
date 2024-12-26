# codeRag – Detailed Chunking and Retrieval Specification

This document focuses on the **internals** of how `codeRag` handles repository files and organizes them into chunks for retrieval-augmented generation. It supplements the core `codeRag` endpoint descriptions found in `spec.md`.

---

## 1. Chunking & Commentary

### 1.1 Inspiration & Overall Flow

We emulate, at least initially, the techniques used by [aider’s](http://aider.chat) `repomap.py`:
1. **Process each source file** with tree-sitter.
2. **Parse out top-level (or near-top-level) declarations**—for example, functions, classes, methods.
3. **Group small declarations into a single chunk** to avoid overly fragmenting the code.
4. **Identify references** between declarations (e.g., function A calls function B).
5. Store metadata (file name, line ranges, references, doc comments, etc.), plus embeddings (both raw code and optional commentary).

### 1.2 Chunk Structure

`codeRag` treats each file as a **sequence of chunks**. The first chunk often includes any leading imports and top-level doc comments; subsequent chunks typically align with major declarations. Each chunk includes:

1. **Metadata**: file name, line numbers, references, etc.  
2. **Optional Commentary**: generated summary or docstring expansions intended to aid an LLM in understanding the chunk.  
3. **Content**: the actual code or text, using `...` (ellipsis) where content is elided for brevity.

#### 1.2.1 `<codeRag:chunk>` Format

A chunk is formatted as an XML-like element:

```xml
<codeRag:chunk>
  <codeRag:metadata>
    <!-- e.g., file="src/foo.ts" lines="10-36" -->
  </codeRag:metadata>
  <codeRag:commentary>
    <!-- Optional: short summary or context for LLM consumption -->
  </codeRag:commentary>
  <codeRag:content>
    <!-- Actual code lines, with possible . . . elisions -->
  </codeRag:content>
</codeRag:chunk>
```

- **`<codeRag:metadata>`**: Minimal info to locate and track the chunk (file path, line offsets).  
- **`<codeRag:commentary>`**: A short summary or doc-like explanation.  
- **`<codeRag:content>`**: The verbatim code or text, possibly elided (`. . .`) if content is lengthy.

### 1.3 Commentary & Embedding

During indexing, `codeRag` may generate:
- **Commentary Embedding**: Summaries or doc expansions that help the retrieval algorithm.  
- **Raw Code Embedding**: The literal chunk text.  
Storing both embeddings lets us tailor searches for either direct code references or conceptual similarities gleaned from commentary.

---

## 2. Boost Directives & Advanced Retrieval

Beyond the basic “nearest chunks” approach, `codeRag` supports **boost directives**. This mechanism allows the user (or a higher-level orchestration) to designate certain files, declarations, or entire directories as “must-include” or “high priority” during retrieval. For example:

- **Explicit File Inclusion**: “Always include `README.md` fully.”  
- **Declaration-Level Boosting**: “Return the entire `FooClass` implementation.”

When assembling the final snippet:
1. `codeRag` merges the highest-scoring chunks from embedding searches (or from direct references).
2. Any boosted chunks are forcibly included (subject to the overall length limit).

---

## 3. References & Personalized PageRank

In addition to nearest-neighbor embedding searches, `codeRag` includes a **relationship expansion** step:
1. **Root Chunks**: The top-N chunks most relevant to the query (by embedding similarity).  
2. **Referential Expansion**: If chunk A references chunk B, then B gets a “link-based” boost.  
3. **Personalized PageRank**: The final set of chunks is determined by combining embedding scores + reference-based boosts.

In other words, a chunk that is frequently referenced by your top results is more likely to be included, especially when you set a high “referenceFollow” parameter in future expansions.

---

## 4. Handling Non-Source Files

Although `codeRag` is primarily designed for source code, it also accommodates:
- **Markdown & Docs** (grouped by headings/sections).
- **YAML & JSON** (grouped by top-level keys).
- **Miscellaneous** text or configuration files.

For these file types, tree-sitter might be replaced or augmented by simpler chunking heuristics (e.g., splitting on headings in `.md`). Doc sections can still have references (e.g., in-line links).

---

## 5. Implementation Notes (Beyond `spec.md`)

1. **Elision Heuristics**: 
   - For large declarations, `codeRag` replaces internal lines with `...` to respect the `approxLength` limit.
   - For smaller declarations, the entire body is typically shown.

2. **Caching & Updates**:
   - `codeRag` caches results in a local DB. When `POST /coderag/refresh` is called, the relevant entries are cleared or re-indexed.
   - Implementation detail: In the MVP, we refresh everything in the target repo. Later, we can do incremental indexing based on Git diffs.

3. **Multi-File Aggregation**:
   - The final returned snippet may combine chunks from multiple files (or multiple repos in future expansions).
   - `codeRag` tries to unify them under the same `<codeRag:chunk>`-based markup, ensuring an LLM can parse each chunk in context.

---

## 6. Future-Focused Enhancements

1. **Hybrid Summaries**: Summaries that combine code commentary with high-level usage examples.  
2. **Multi-Repo Graph**: A cross-repo reference graph, letting `codeRag` unify code relationships across different projects.  
3. **Automatic Elision of “Noisy” Blocks**: If repeated boilerplate code appears in many files, automatically detect and omit (unless specifically referenced).  
4. **Comprehensive Reference Types**: Future expansions could parse not just imports and function calls, but also environment dependencies, build pipeline references, etc.

## 7. MVP Implementation Outline

Below is a concise, step-by-step outline for how `codeRag` can be initially implemented in an MVP capacity, focusing on the core tasks of **chunking**, **embedding**, **storing**, and **retrieving** code. This design aligns with the broader `codeRag` specification but keeps the implementation as simple as possible for immediate functionality.

---

### 7.1 Overview

The MVP algorithm proceeds in **four phases**:

1. **Parse & Chunk**  
   - Use a code-aware parser (e.g., Tree-Sitter) to walk through each file, extracting top-level declarations (e.g., functions, classes, or methods).  
   - If a file lacks a recognized structure (like plain text or Markdown), fall back on a simpler “heading-based” or “N-line” splitting approach.  
   - Build a list of chunks, each with metadata (`filepath`, `lineStart`, `lineEnd`, etc.) and the raw code snippet.  

2. **Embed & Store**  
   - For each chunk, generate **two** embeddings: one from the raw code snippet, one from a short “commentary” string (if applicable).  
   - Store these embeddings alongside chunk metadata in RxDB.

3. **Query & Retrieval**  
   - For an incoming request (i.e., `POST /coderag/query`):
    - First, decide what portion of the chat history to embed as the semantic key. We may just use the most recent few messages, or have an LLM decide what messages to use.
     - Then, embed the query content with the same model used to embed chunks.
   - Perform a **similarity search** to fetch the top-K matching chunks from the index, optionally applying reference expansions if needed (see 7.4 for details).  
   - Combine the final set of chunks into a `<codeRag:chunk>`-based text block for returning to the caller.

4. **(Optional) PageRank Boost**  
   - Once the top-K chunks are found, gather chunks that are heavily referenced by these top-K results.  
   - Add them to the final set if the overall token limit (`approxLength`) permits.

---

### 7.2 Phase 1: Parse & Chunk

1. **Initialize Tree-Sitter**  
   - Load the grammar for the relevant languages (TypeScript, Python, etc.). For non-supported or simple text files, skip AST-based parsing.  
   - Optionally maintain a fallback method for files that Tree-Sitter cannot parse.

2. **Extract Top-Level Declarations**  
   - Identify each function/class/method node.  
   - Capture the source lines for each node; if a node is larger than a set threshold (e.g., 200 lines), consider splitting it further or eliding internal lines to keep the chunk size manageable.

3. **Build Chunk Metadata**  
   - For each chunk, store:
     - `filePath`: relative path in the repo.  
     - `lineRange`: e.g., `startLine` and `endLine`.  
     - `references`: minimal set of references (if easily derivable from import statements or function calls).  
     - `content`: the raw (possibly partially elided) code lines.

4. **Generate Commentary (Optional)**  
   - If you want short doclike commentary, feed a small prompt to an LLM or implement a static summarizer for each chunk.  
   - Store this commentary so it can be embedded separately.

---

### 7.3 Phase 2: Embed & Store

1. **Choose an Embedding Model**  
   - For the MVP, pick a single model (e.g., OpenAI’s `text-embedding-ada-002` or a local open-source alternative).  
   - Each chunk yields:
     - `embeddingCode`: an embedding of the raw code snippet.  
     - `embeddingCommentary`: an embedding of the commentary (if used).

2. **Store in a Simple Index**  
   - Use either a file-based index (e.g., an on-disk FAISS index or Qdrant running locally) or an in-memory data structure if the repos are small.  
   - Maintain a simple table or JSON structure linking chunk IDs → embeddings → metadata.

3. **Basic Caching**  
   - Optionally store partial results in memory (especially if re-indexing is expensive).  
   - If `POST /coderag/refresh` is called, drop or rebuild these entries for the specified repo.

---

### 7.4 Phase 3: Query & Retrieval

1. **Embed the Query**  
   - Take the user’s prompt/messages from the request body, construct a single text string or short summary, and get its embedding from the same model.

2. **Nearest-Neighbor Search**  
   - Query the vector index for the top-N matches, sorted by cosine similarity (or a comparable metric).  
   - For each returned chunk, retrieve the stored metadata and raw code from your DB/index.

3. **Reference Expansion (Optional)**  
   - If the user has a “referenceFollow” parameter > 0, gather references from the top-N chunks.  
   - Pull in additional chunks that are either directly referenced or appear in the same file.  
   - Make sure the final set doesn’t exceed `approxLength` tokens.

4. **Response Assembly**  
   - Format the final set of chunks as `<codeRag:chunk>` blocks, each containing `<metadata>`, `<commentary>` (if available), and `<content>`.  
   - Return them in the `ragText` field of your JSON response.

---

### 7.5 Phase 4: (Optional) PageRank Boost

1. **Build Graph of References**  
   - For each chunk, you have a list of references (e.g., imported modules, called functions). Build a directed graph connecting chunks.  

2. **Re-Score**  
   - After obtaining top-N by embedding similarity, run a short link-based scoring pass (like a personalized PageRank) to see which chunks are heavily connected to the top-N.  
   - Raise the rank of chunks that appear in multiple references.  

3. **Combine & Cap**  
   - Merge the embedding-based top-N with the top M from PageRank.  
   - Enforce length constraints so you don’t exceed the `approxLength` limit.

---

### 7.6 Example Data Flow (MVP)

1. **Indexing**  
   - `POST /coderag/refresh?repoPath=/my/local/repo`  
   - Cojack scans `/my/local/repo`, calls Tree-Sitter on `.ts`/`.js`/`.py` files, produces chunk objects.  
   - Each chunk is embedded and stored in your chosen index.

2. **Querying**  
   - `POST /coderag/query` with `messages: [...], approxLength: 8000`.  
   - Cojack embeds the query, fetches the top 6–10 chunks, and optionally expands references.  
   - The chunks are returned as `<codeRag:chunk>` elements in the response `ragText`.

3. **Edits & Shell** (Orthogonal)  
   - The `/editOne` and `/execShell` endpoints run independently of `codeRag`, though in practice you may want to refresh the index after major edits if the code changed substantially.

---

### 7.7 Summary of MVP Goals

- **Simplicity**: The algorithm avoids heavy complexity—one pass for chunk creation, one pass for indexing, one pass for retrieval.  
- **Extensibility**: You can add advanced reference analysis or more flexible chunk splitting later.  
- **Modularity**: Each phase (parse, embed, store, retrieve) is conceptually separate, making debugging easier.  
- **Low Friction**: For a basic single-repo case, even an in-memory vector index can suffice. Larger deployments can adopt production-grade vector stores or caching strategies.

This MVP flow provides the minimum needed to get `codeRag` functioning for code retrieval tasks while leaving room for incremental improvements—such as multi-language support, more elaborate reference-based expansions, or partial AST rewriting. 

## 8. Incorporating Hybrid Lexical & Semantic Search

Recent insights from **Anthropic’s Contextual Retrieval** method, along with older yet proven lexical indexing techniques such as **BM25**, highlight the need to balance semantic similarity with exact keyword matching—particularly when unique identifiers or error codes are present. Below is a proposed addition to the `codeRag` design that addresses precise keyword lookups (especially for code identifiers) alongside embedding-based retrieval, all while leveraging **RxDB** for unified storage.

---

### 8.1 Rationale

1. **Exact Keyword Searches**  
   - Pure embedding approaches may overlook rare or “low-frequency” terms (e.g., `TS-999`, `myVarXYZ`), since they don’t always factor in literal string matches.  
   - A BM25 (or TF-IDF) index excels at handling these cases by focusing on token occurrences.

2. **Semantic Similarity**  
   - Embedding-based queries capture broader, conceptual matches—useful for “explain how function X works” or “find the chunk describing concurrency in this class.”

3. **Hybrid Fusion**  
   - By combining top results from BM25 with top results from embeddings, then merging or re-ranking them, we maximize coverage.  
   - “Rank fusion” merges both lists (possibly de-duping identical chunks) and re-sorts based on an overall relevance score.

4. **Contextual Chunking**  
   - Prepending or generating short chunk-specific context (à la Anthropic’s “Contextual Embeddings”) can further improve recall by clarifying which function, file, or domain the chunk belongs to.

---

### 8.2 Proposed Changes

1. **Dual Indexing**  
   - **BM25**: Build a token-based index using BM25 or a similar lexical approach.  
     - Store each chunk’s text in RxDB, ensuring you maintain a text-search index (RxDB can store and index short documents, though you may need an external library or manually implement BM25-like logic).  
   - **Embedding**: Continue storing the chunk embeddings (raw code, commentary, or contextual expansions) in the RxDB documents as vectors for quick nearest-neighbor queries.  
     - Depending on performance and your data size, you might store the vector in RxDB directly or integrate with an external library that can handle approximate nearest neighbor (ANN) lookups.  

2. **Query Flow**  
   - **(A) Lexical Search**: Given a user query, run a BM25 text match in RxDB.  
   - **(B) Embedding Search**: Generate an embedding of the query, then do a semantic search for top-K results from your stored vectors.  
   - **(C) Rank Fusion**: Merge both result sets.  
     - One approach:  
       1. For each chunk, maintain two scores: `semanticScore` (from embedding similarity), `lexicalScore` (from BM25).  
       2. Combine them (e.g., weighted sum, or prioritize whichever is highest).  
       3. Sort the merged list by the combined score.  
   - **(D) Truncate** to the final top-K (or top-K + reference expansions) before forming the `<codeRag:chunk>` response.

3. **Contextual Retrieval** (Optional Enhancement)  
   - When indexing each file, generate an additional “context snippet” that clarifies which project, file, or functional domain the code belongs to—especially if the chunk is small or ambiguous.  
   - Prepend that snippet to the code before embedding, and also store it for BM25 indexing.  
   - This step helps ensure code references (like “this function belongs to the concurrency module of Project X”) are accessible for both semantic and lexical searches.

---

### 8.3 Implementation Notes with RxDB

1. **Chunk Schema**  
   - Each chunk entry in RxDB might look like:
     ```js
     {
       _id: <chunkId>,
       filepath: <string>,
       codeContent: <string>,
       commentary: <string>,
       references: [<string>],
       embeddingVector: [<number>], // e.g., float array
       lexicalTokens: <string>,     // full or partial text for BM25
       // ...
     }
     ```
   - This schema allows for:
     - Full-text or token-based indexing for BM25 logic.
     - Storing the chunk’s embedding vector in a field (`embeddingVector`).

2. **BM25 in RxDB**  
   - RxDB doesn’t natively implement BM25.  
   - Potential solutions:
     1. **Plugin/Module**: Implement or integrate a library that can do a BM25 pass over the chunk’s `lexicalTokens`.  
     2. **Custom Logic**: Export the chunk data, run BM25 offline or in-memory, then store the results or partial indexes back in RxDB.

3. **Embeddings**  
   - While you *can* store embeddings in RxDB, you may also want an external nearest-neighbor index if dealing with large-scale codebases.  
   - For an MVP or smaller repositories, a direct RxDB approach with a scanning similarity search could be enough. Indexing can be refined later as scale grows.

4. **Rank Fusion**  
   - Keep your logic for merging BM25 and embedding hits in a dedicated function or microservice. This ensures you can tweak the weighting strategy or add advanced re-ranking (e.g., with a second LLM pass) as you evolve.

---

### 8.4 Example Flow

**Indexing**  
1. Parse chunk → store chunk text & optional context snippet in `lexicalTokens`.  
2. Generate code & commentary embeddings → store in `embeddingVector`.  
3. Insert into RxDB.

**Querying**  
1. **Lexical**: BM25 on `lexicalTokens` → get top-10 lexical matches.  
2. **Semantic**: Embed user query → find top-10 embedding matches.  
3. **Merge**: Combine & de-dupe chunk IDs from both sets.  
4. **Score**: For each chunk, compute a final relevance score, e.g. `weightedSum = 0.5 * lexicalScore + 0.5 * semanticScore`.  
5. **Sort**: Sort descending by final score.  
6. **Reference expansions** (optional).  
7. **Output**: Format the final list as `<codeRag:chunk>` blocks.

---

### 8.5 Conclusion

By augmenting `codeRag` with a **hybrid search** approach—**BM25** plus **embeddings**—and optionally using short contextual expansions, you achieve:

- More robust handling of code-specific identifiers.  
- Maintained coverage for conceptual or high-level queries.  
- A flexible design that scales from small single repos (pure RxDB, scanning-based approach) to large, multi-repo contexts (external ANN index, advanced rank fusion, etc.).

This hybrid approach complements the existing `codeRag` specification, refining it to excel in code retrieval scenarios that demand both **semantic** *and* **literal** matches. 
