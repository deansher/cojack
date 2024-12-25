```markdown
# Cojack Specification

This document provides a **complete, unified specification** for Cojack. Cojack is a Deno-based microservice that exposes an OpenAPI-compatible wire API for:

1. **Retrieval-Augmented Generation** of code or other repository contents.  
2. **Fuzzy-Edits** of files within a Git repo.  
3. **Shell Command Execution** within the repo’s environment (optional usage).  

Below is an overview of the relevant endpoints, usage patterns, and architecture guidelines.

---

## 1. Public API

### 1.1 `POST /coderag/query?token=YOUR_TOKEN`
Retrieves relevant snippets from one or more repositories for LLM context. Returns a curated text representation (e.g., `<codeRag:chunk>` elements).

<details>
<summary>Request Body (JSON)</summary>

```json
{
  "messages": [
    {
      "role": "user|assistant|system",
      "content": "some message content"
    }
  ],
  "approxLength": 10000,
  "repos": [
    {
      "originUri": "http://github.com/repo/url",
      "checkoutHost": "hostname or IP",
      "checkoutPath": "/path/to/repo",
      "versionSpecifier": "latest"
    }
  ]
}
```
</details>

<details>
<summary>Response Body (JSON)</summary>

```json
{
  "ragText": "<codeRag:chunk>...</codeRag:chunk>",
  "metadata": {}
}
```
</details>


### 1.2 `POST /coderag/refresh?token=YOUR_TOKEN`
Initiates a re-scan of the specified repository/repositories to rebuild local indexing. Useful if files have changed significantly.

<details>
<summary>Request Body (JSON)</summary>

```json
{
  "repoPath": "/path/to/repo"
}
```
</details>

<details>
<summary>Response Body (JSON)</summary>

```json
{
  "status": "ok",
  "refreshed": true
}
```
</details>


### 1.3 `POST /editOne?token=YOUR_TOKEN`
Applies a **single** fuzzy edit to a file in the specified repository. The caller provides the precise snippet to be replaced (`existingContent`) and the new snippet (`newContent`). Cojack attempts to match `existingContent` with a configurable fuzziness, then replaces it if found.

<details>
<summary>Request Body (JSON)</summary>

```json
{
  "repo": {
    "checkoutPath": "/path/to/repo",
    "versionSpecifier": "master"
  },
  "filepath": "src/example.ts",
  "existingContent": "console.log('Hello')",
  "newContent": "console.log('Hello, world!')",
  "fuzzyThreshold": 0.8
}
```

- **`repo.checkoutPath`**: Local path to the repo (already present or cloned)  
- **`repo.versionSpecifier`** (optional): e.g. a commit hash, tag, or branch  
- **`filepath`**: Path (relative to `repo.checkoutPath`)  
- **`existingContent`**: The snippet to find and replace.  
- **`newContent`**: The snippet to insert in place of `existingContent`.  
- **`fuzzyThreshold`** (optional, default `0.7–0.8`): Lower thresholds allow more lenient matching.
</details>

<details>
<summary>Response Body (JSON)</summary>

```json
{
  "ok": true,
  "reason": null
}
```

- **`ok`**: `true` if the edit was applied, `false` otherwise.  
- **`reason`**: A human-readable explanation if `ok` is `false` (e.g., "No fuzzy match found").
</details>


### 1.4 `POST /execShell?token=YOUR_TOKEN`
Executes a **single** shell command in the context of the specified repository. Returns `stdout` and `stderr` along with the process exit code.

<details>
<summary>Request Body (JSON)</summary>

```json
{
  "repo": {
    "checkoutPath": "/path/to/repo",
    "versionSpecifier": "master"
  },
  "command": "ls -la",
  "mergeStderr": false
}
```

- **`command`**: A single-line shell command (e.g. `git status`, `ls -la`, etc.).  
- **`mergeStderr`** (optional, default `false`): If `true`, merges stderr into stdout.
</details>

<details>
<summary>Response Body (JSON)</summary>

```json
{
  "stdout": "list of files\nanother line\n",
  "stderr": "",
  "exitCode": 0
}
```

- **`stderr`**: May be empty if `mergeStderr = true` or if there was no error output.  
- **`exitCode`**: Numeric exit code from the shell command.
</details>

---

## 2. Implementation Approach

### 2.1 Code RAG
1. **Indexing**  
   - Tree-sitter or equivalent to parse code into chunks.  
   - Store embeddings for each chunk.  
2. **Query**  
   - Embed user query, find nearest chunks, optionally expand by references.  
   - Return assembled context under `<codeRag:chunk>` tags.

### 2.2 Single-File Edits
1. **ApplyOneEdit**:  
   - Read the target file.  
   - Attempt fuzzy match for `existingContent`.  
   - Replace matched region with `newContent`, or fail if match is below `fuzzyThreshold`.  
   - Write the file back.

### 2.3 Shell Execution
1. **ExecShell**:  
   - Validate `command`.  
   - Run it within `repo.checkoutPath`.  
   - Capture `stdout`, `stderr`, `exitCode`.  
   - Return them.

---

## 3. Roadmap

1. **MVP**  
   - Code RAG indexing & retrieval  
   - Single-file fuzzy edit  
   - Single shell command exec  
2. **Phases**  
   - Future expansions: advanced fuzzy matching, multi-file or bulk operations, multi-tenant usage, etc.

---

## 4. Security

Cojack’s **initial security** model is intentionally minimal, relying on an **auto-generated token** that is embedded in the service URL. This approach is sufficient for open-source users, individuals, and small teams who are comfortable with a single, broad permission level, and it keeps the user experience extremely simple. Below are the key points of our MVP solution, alongside hints on how we can layer in more robust security while retaining backward compatibility.

### 4.1 Single-User Token Model

- **Startup & Token Generation**  
  When Cojack starts, it automatically generates a random token and logs a full URL (including `?token=...`) to stdout.  
  - **Example**: `Cojack started! Access: http://<host>:<port>?token=abcdef`
- **Usage**  
  Anyone with the URL (and its token) can directly access Cojack’s endpoints. This includes:
  - **Local Development**: An IDE plugin on the same machine.
  - **Remote Access**: If Cojack is running on a server exposed to the internet, a cloud-based client can connect.

### 4.2 Deployment Considerations

- **Open Internet vs. Private Network**  
  - **Open-Source or Small Teams**: May choose to expose Cojack to the public internet for cloud-based workflows, as the simple token-based link is enough for their risk profile.  
  - **Private Network**: For higher security, run Cojack behind a firewall or a private network.  
- **Shell Commands**  
  Shell commands represent a potential security risk. If you expose Cojack publicly, use a firewall, VPN, or other private hosting methods to limit incoming traffic.

### 4.3 Light Abstraction for a Future Multi-User World

Though Cojack currently supports only one user with a single token, the following design choices make it easier to extend to multiple users and stricter permissions later:

1. **Token → User Mapping**  
   Internally, the server has a simple method (`validateToken`) that returns a user object. In the future, this can map each token to a distinct user account.  
2. **Repo-Level Authorization Hook**  
   Before indexing or querying, the server calls a small “checkAccess” function. Currently, it always allows access. In a multi-user scenario, this could implement per-repo or per-directory rules.
3. **Caching Interface**  
   Caching of file chunks is encapsulated behind a single interface. Although it does not enforce user-based separation today, it can be extended to store user IDs or repo IDs to provide multi-user segregation.

### 4.4 Potential Future Directions

Even though the MVP uses a single-token approach, below are ways Cojack can evolve for teams or organizations needing stricter security:

1. **Extension to OAuth, User Accounts, or Multi-Tenant Tokens**  
   - Map tokens to unique user accounts for multi-tenant usage.  
   - Integrate with OAuth providers (e.g., GitHub, Google).  
2. **Fine-Grained Authorization**  
   - Per-repo permissions (reader, contributor, admin).  
   - Directory- or file-level rules.  
3. **Auditing & Logging**  
   - Query logs tracking which queries were made, by whom, and when.  
   - Access traces for compliance or internal audit requirements.  
4. **Secure Access Enforcement**  
   - Transport encryption (TLS/SSL).  
   - Network isolation (VPNs, private subnets).  
5. **Multi-Tenant Caching**  
   - Shared repo caches for teams.  
   - User-specific caches for private repos.

---

## 5. Testing & Validation

1. **Unit Tests**  
   - Code RAG chunking & embeddings  
   - Fuzzy match logic  
2. **Integration Tests**  
   - Spin up an in-memory server, call `/editOne` & `/execShell`  
3. **E2E**  
   - Launch Cojack, parse token, run real shell commands, edit real files  
4. **Coverage**  
   ```bash
   deno test --coverage=coverage/
   deno coverage coverage/
   ```

---

## 6. Building & Contributing

1. **Compile an Executable**:
   ```bash
   deno compile --output cojack --allow-net --allow-read main.ts
   ```
2. **Contributing**:
   - Fork, implement changes, run `deno lint`, `deno fmt`, and `deno test`.
   - Submit PRs with a clear summary of changes.

---

## 7. License

Cojack is licensed under [MIT](LICENSE). Feel free to use or modify it under these terms.
