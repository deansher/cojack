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
