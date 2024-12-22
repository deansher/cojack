# Cojack

**Cojack** is a Deno-based microservice that provides an OpenAPI-compatible wire API for LLM access to a Git project directory, initially implementing:
- `findOriginalUpdateBlocks`
- `applyEdits` (with fuzzy match)

## Requirements
- Deno (v1.34+ recommended)

## Usage

```
deno task dev [projectPath]
```

If `[projectPath]` is omitted, Cojack uses the current working directory.

## Building an executable (optional)
- **Linux**:
    ```
    deno compile --output cojack --allow-net --allow-read main.ts
    ```
- **macOS**:
    ```
    deno compile --output cojack_mac --allow-net --allow-read main.ts
    ```
- **Windows**:
    ```
    deno compile --output cojack.exe --allow-net --allow-read main.ts
    ```

Once compiled, you can distribute the standalone `cojack` binary to run on that platform without requiring Deno installed.

## Contributing

Contributions are welcome. For small fixes or improvements, just submit a PR. For larger changes, please open an issue first to discuss your ideas.

### Project Style

Cojack must be easily deployable to Linux (eventually all popular distros), MacOS, and Windows. We want to keep dependencies as minimal as is consistent with excellent code. Cojack aspires to modern, elegant, idiomatic TypeScript in a functional style.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.



