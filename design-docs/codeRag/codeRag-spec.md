Below is a **detailed specification** for a new `codeRag` endpoint (and corresponding module) in **Cojack**. This specification outlines:

1. **Public API** (including data types and endpoint definitions).  
2. **Implementation Approach** (including indexing, chunking, ranking, and retrieval).  
3. **Phased Roadmap** (initial MVP and subsequent improvements).  

`codeRag` takes the following inputs:
- OpenAI-compatible chat history
- a search scope: one or more target git repos with version specifications
- boost directives
  - list of files (repo, file) whose content to boost or return in their entirity
  - list of near-top-level declarations that are specifically requested
    - repo identifier and version spec
    - path in repo
    - whether to include implementation
- parameters such as 
  - target character length of the search result
  - target model family
    - enum: "claude", "openai", eventually more

`codeRag` then returns a long string that provides a view of the contents of the target repos, intended as context for an LLM. This string provideds elided contents of selected files, aiming to provide the most
informative possible content subset for this point in the chat.

We emulate, at least initially, the techniques used by [aider's](http://aider.chat) `repomap.py`:
- Process each source file with tree-sitter.
- Parse out top-level declarations. 
- Recognize references from declarations to other declarations.
- A personalized page rank algorithm to rank declarations based on their relevance to the query.

We treat each file as a sequence of chunks. For a source file, the first chunk contains all leading imports and leading file-level comments or docstrings. Each subsequent chunk contains one or more near-top-level declarations. We say "near-top-level" to include declarations contained in large top-level declarations such as classes. We group adjacent small declarations into chunks.

Each chunk contains file contents verbatim, except that it can use ". . ." to elide content. Depending
on the file type, this elision marker may be placed in a comment.

For each source code chunk, `codeRag` decides whether to include or elide implementations. (Implementation note: we store chunks with their implementations, but with the metadata we need for easy elisio at query time.)

Each `<codeRag:chunk>` element contains three subordinate elements:
- `<codeRag:metadata>`: metadata about the chunk, including the file name, the chunk's start and end line numbers, and the chunk's start and end character offsets.
- `<codeRag:commentary>`: (optional) generated information about the chunk, which may summarize context and/or explain the chunk's content. (This is query-independent.)
- `<codeRag:content>`: the chunk's content, with elisions.

Although `codeRag` is oriented toward code repos, it treats non-source files as first-class citizens. In fact, it is intended to work well on a repo that has no source files. Over time (although at a lower priority than source code), we will add special support for markdown, yaml, and other common formats in a programming context. Instead of top-level declarations, we are then aware of sections and subsections. Instead of references through identifiers, have references through links and other file mentions.

Unlike `repomap.py`, we don't require a list of files as our starting point. Instead, we compute an embedding for each file chunk, and then use a vector database to the chunks closest to the query in semantic space as root nodes, from which we then expand outward by reference. (Implementation note: if we are going to compute a commentary, we do this first and then include it in our embedding.)

---

## 1. Public API

### 1.1 `POST /coderag/query`

The principal endpoint for retrieving a snippet of relevant code from the repository based on a query. It returns a curated text representation of the relevant sections of code, intended for LLM consumption.

**Request Body** (JSON):
```json
{
  "messages": [
    {
        "role": "user|assistant|system",
        "content": "some message content"
    },
    {
        // . . .
    }
  }
  "approxLength": 10000, 
  "repos": [
    {
      "originUri": "http://github.com/repo/url",
      "checkoutHost": "hostname or IP",
      "checkoutPath": "/path/to/repo",
      "versionSpecifier": "latest"
    },
    {
        // Additional repositories can be added in future expansions
    }
  ],
  "token": "some-auth-token"
}
```

- **`messages`**: OpenAI-compatible message history
- **`approxLength`**: A soft limit (in characters) for the length of the returned RAG content. The system will try to keep the total snippet size near or below this threshold.  
- **`repos`**: An array of objects specifying which repository (or repositories in future expansions) to use, and which version or revision.  
  - **`repoPath`**: Local path to the git repo. (Initially we support a single repo, but this design allows for future multi-repo expansions.)  
  - **`versionSpecifier`**: For future multi-version use, e.g. “latest,” a commit hash, or “workspace.”  
- **`token`**: Opaque authentication token, consistent with Cojack’s existing auth pattern.  

**Response** (JSON):
```json
{
  "ragText": "string",
  "metadata": {
    // TBD
  }
}
```

- **`ragText`**: The curated body of code and other content that `codeRag` deems most relevant.  
- **`metadata`**: Minimal extra information about how the query was fulfilled

Formatting `ragText` for maximum LLM effectiveness is tricky. For one thing, different LLMs have different format preferences. For another, whatever outer format is chosen (such as markdown or XML) might also be used by contained source files.

We choose to use informal XML tags as our outermost formatting. Anthropic specifically recommends this, and OpenAI includes it as a possibility in their recommendations. However, the result is **not** XML. For example, it does not escape special characters. This would surely disrupt LLM understanding of the content -- and LLM editing even more.

For additional clarity -- especially when files being excerpted contain XML -- we use an XML namespace for `codeRag` tags. For example, `<codeRag:file>` instead of `<file>`.

### 1.2 `POST /coderag/refresh`

A housekeeping endpoint that prompts a re-scan of the specified repo(s). This is useful when the underlying filesystem or repository might have changed significantly. In the early MVP, we might do a simple approach: we discard or rebuild the local cache for that repo path.

**Request Body** (JSON):
```json
{
  "repoPath": "/path/to/repo",
  "token": "some-auth-token"
}
```

**Response** (JSON):
```json
{
  "status": "ok",
  "refreshed": true
}
```

---

## 2. Implementation Approach

### 2.1 Overview

At indexing time, ...

At query time, ...

### 2.2 Data Storage

We use **RxDB** (initially backed by **DenoKV**) to store file chunks and metadata and to perform vector search.

### 2.3 Indexing Flow

### 2.4 Query Flow

## 3. Phased Roadmap

### 3.1 **Phase 1: MVP**

- **Goal**: Basic functionality, close to `repomap.py` in capability.  

- **Indexing Capability**:
  1. Basic scanning of a single repository.  
  2. Extraction of top-level declarations (functions, classes) via tree-sitter.  
  3. Basic references among declarations.  
  4. Construct and embed chunks and store in **RxDB** with reference links.

- **Query Capability**:
  1. Vector search for "root" chunks.
  2. Transitively include additional chunks based on simple personalized page rank like `repomap.py`.
  3. Assemble result.

- **Success Criteria**: Manual scoring of query results shows `codeRag` doing meaningfully better than `repomap.py`.

### 3.2 **Phase 2: Documentation Context**  

Following the “Add Documentation Context” plan from `plan_enhance_repomap.md`:

- **Features**:
  1. Capture doc comments in many languages (if grammar available).  
  2. Associate doc comments directly with the top-level declaration.  
  3. Optionally store doc comments in `Declaration.docComment`.  
  4. When assembling the snippet, prepend doc comments.  

- **Implementation Steps**:
  1. Extend tree-sitter queries to capture doc comments in each language’s `.scm` file.  
  2. Store doc comments in the DB.  
  3. Adjust snippet assembly to insert doc comments above each declaration.  
  4. Test with Python docstrings, JS/TS `/** ... */` style, etc.  

- **Success Criteria**: Query returns code plus relevant doc comments, improving context for the LLM.

### 3.3 **Phase 3: Relationship Context**

Following the “Add Relationship Context” plan from `plan_enhance_repomap.md`:

- **Features**:
  1. Identify class inheritance, interface/implements relationships, etc.  
  2. Store these relationships in references (e.g., `fromDeclarationId=childClass`, `toDeclarationId=parentClass`).  
  3. Adjust snippet assembly to mention “extends/implements.”  

- **Implementation Steps**:
  1. Extend tree-sitter queries and reference extraction for OOP relationships.  
  2. Add references for `classChild -> classParent`, also for interface implementations.  
  3. Enhance snippet formatting to optionally list “inherited from.”  
  4. Extend tests for multiple languages, multiple inheritance.  

- **Success Criteria**: The snippet includes not only the relevant classes but also contextual inheritance references.

### 3.4 **Future Phases**  

- **Incremental re-indexing** for partial changes to large repositories.  
- **More advanced AI summarization**: generate "commentary"  
- **Multi-repo support**: orchestrating references across multiple projects.  
- **Git version references**: retrieving code from specific commits or comparing changes.  

