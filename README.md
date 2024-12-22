```markdown
# Cojack

**Cojack** is a Deno-based microservice that provides an OpenAPI-compatible wire API for LLM access to a Git project directory. It currently implements:

- `findOriginalUpdateBlocks`
- `applyEdits` (with fuzzy match)

Cojack aims for a **modern, elegant, idiomatic TypeScript** design, following a **functional** style whenever possible. We keep **dependencies minimal** while ensuring code quality and maintainability. It’s fully **cross-platform**, deployable to all major Linux distros, macOS, and Windows.

---

## Requirements
- [Deno v2.1+](https://deno.land/)

---

## Usage

```bash
deno task dev [projectPath]
```

- **`[projectPath]`** (optional): The path to the Git repository you want to expose. If omitted, Cojack uses the current working directory.
- The server automatically logs an **access URL** with a generated token. You can make requests to the provided endpoints, passing the `?token=...` query parameter for authentication.

---

## Building an Executable (Optional)

You can compile Cojack into a self-contained binary. This requires no local Deno installation on the target machine:

- **Linux**:
  ```bash
  deno compile --output cojack --allow-net --allow-read main.ts
  ```
- **macOS**:
  ```bash
  deno compile --output cojack_mac --allow-net --allow-read main.ts
  ```
- **Windows**:
  ```bash
  deno compile --output cojack.exe --allow-net --allow-read main.ts
  ```

Distribute the resulting binary on the target platform and run it directly.

---

## Testing

We employ a layered testing strategy using **Deno’s built-in test framework**:

1. **Unit Tests**  
   - Validate core logic in isolation (e.g., `findOriginalUpdateBlocks`, fuzzy matching, etc.).
   - Typically located in files like `tests/editblock.test.ts`.
   - Example command to run all tests:
     ```bash
     deno test --allow-read --allow-write --allow-net --allow-run
     ```
     _(We'll likely need additional permissions over time.)_

2. **Integration Tests**  
   - Spin up the **HTTP server** in-memory to test real endpoints (`/find_blocks`, `/apply_edits`, etc.) without fully launching the CLI.
   - Often in `tests/server.test.ts`.

3. **End-to-End (E2E) Tests**  
   - Launch the **Cojack CLI** (`main.ts`) as a child process.
   - Capture its stdout to parse the server URL and token.
   - Verify actual requests to the running server.
   - For example, in `tests/integration.test.ts` or `tests/e2e.test.ts`.

4. **Temporary Directories & Mocks**  
   - Tests create **temporary directories** via `Deno.makeTempDirSync()` to ensure we don’t pollute user data.
   - In-memory or file-based **mocks** let us test without touching real Git repos or external environments.

### Coverage

Deno provides a built-in coverage tool:

```bash
deno test --coverage=coverage/
deno coverage coverage/
```

This reports how much of the codebase is exercised by the tests. Combine with CI for continuous feedback.

---

## Contributing

Contributions are welcome! For small fixes or improvements, feel free to open a pull request. For larger changes, please open an issue first so we can discuss your ideas.

### Project Style

- **Minimal dependencies** consistent with excellent code quality.
- **Modern, functional TypeScript** for clarity and maintainability.
- **Cross-platform**: easily deployable to Linux, macOS, and Windows.

When contributing, please run:

```bash
deno lint
deno fmt
deno test
```

to ensure style, formatting, and tests pass.

---

## License

This project is licensed under the [MIT License](LICENSE). You are free to use and modify it according to the terms of the license.
```