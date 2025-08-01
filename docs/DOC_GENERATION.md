# Documentation Generation Guide

This guide explains how to generate and maintain documentation for the EvorBrain project.

## Overview

EvorBrain uses automated documentation generation tools to create API documentation from source code
comments:

- **TypeDoc** for TypeScript/Frontend documentation
- **cargo doc** for Rust/Backend documentation

## Documentation Types

### 1. TypeScript/Frontend Documentation

Generated from JSDoc comments in TypeScript files using TypeDoc.

**Location**: `docs/api/typescript/`

**Source files**:

- Components in `src/components/`
- API client in `src/lib/api.ts`
- Stores in `src/stores/`
- Types in `src/types/`
- Utilities in `src/utils/`

### 2. Rust/Backend Documentation

Generated from Rust doc comments using cargo doc.

**Location**: `docs/api/rust/`

**Source files**:

- Commands in `src-tauri/src/commands/`
- Database models in `src-tauri/src/db/`
- Error handling in `src-tauri/src/error.rs`
- Main application in `src-tauri/src/lib.rs`

## Generating Documentation

### Generate All Documentation

```bash
bun run docs
```

This command runs the `scripts/generate-docs.sh` script which:

1. Creates necessary directories
2. Generates TypeScript documentation
3. Generates Rust documentation
4. Copies files to unified location
5. Creates an index page

### Generate TypeScript Documentation Only

```bash
bun run docs:typescript
```

**Note**: TypeDoc may fail if there are TypeScript compilation errors. To bypass:

- Fix TypeScript errors first, or
- Add `"skipErrorChecking": true` to `typedoc.json`

### Generate Rust Documentation Only

```bash
bun run docs:rust
```

This generates documentation for the Rust backend including private items.

### Serve Documentation Locally

```bash
bun run docs:serve
```

This starts a local server to view the generated documentation at `http://localhost:3000`.

## Configuration Files

### TypeDoc Configuration (`typedoc.json`)

```json
{
  "entryPoints": ["./src"],
  "entryPointStrategy": "expand",
  "out": "./docs/api/typescript",
  "exclude": ["**/*.test.ts", "**/*.test.tsx"],
  "plugin": ["typedoc-plugin-markdown"],
  "theme": "default"
}
```

### Cargo Documentation

Configured via command-line flags in package.json:

- `--no-deps`: Don't document dependencies
- `--document-private-items`: Include private items

## Writing Documentation

### TypeScript/JSDoc

````typescript
/**
 * Creates a new life area
 * @param request - The life area creation request
 * @returns Promise that resolves with the created LifeArea
 * @throws {EvorBrainError} If creation fails
 * @example
 * ```typescript
 * const area = await api.lifeArea.create({
 *   name: "Work",
 *   description: "Professional activities",
 *   color: "#0066cc"
 * });
 * ```
 */
export function createLifeArea(request: CreateLifeAreaRequest): Promise<LifeArea> {
  // ...
}
````

### Rust Documentation

```rust
/// Creates a new life area in the database
///
/// # Arguments
///
/// * `name` - The name of the life area
/// * `description` - Optional description
/// * `color` - Optional hex color code
/// * `icon` - Optional icon identifier
///
/// # Returns
///
/// Returns the created `LifeArea` on success
///
/// # Errors
///
/// Returns `AppError` if:
/// - Database connection fails
/// - Validation fails
pub async fn create_life_area(
    &self,
    name: String,
    description: Option<String>,
    color: Option<String>,
    icon: Option<String>,
) -> AppResult<LifeArea> {
    // ...
}
```

## CI/CD Integration

Documentation is automatically generated on push to main/master branches via GitHub Actions.

The workflow (`/.github/workflows/docs.yml`):

1. Installs dependencies
2. Generates TypeScript and Rust documentation
3. Uploads artifacts
4. Deploys to GitHub Pages (if enabled)

## Troubleshooting

### TypeDoc Errors

If TypeDoc fails due to TypeScript errors:

1. Fix the TypeScript errors:

   ```bash
   bun run lint:fix
   ```

2. Or temporarily bypass error checking by setting `"skipErrorChecking": true` in `typedoc.json`

### Rust Documentation Warnings

Warnings about unused code are normal during development. They don't prevent documentation
generation.

### Missing Documentation

If documentation is missing:

1. Ensure source files have proper doc comments
2. Check exclude patterns in configuration
3. Verify file paths in entry points

## Best Practices

1. **Keep documentation up-to-date**: Update doc comments when changing code
2. **Use examples**: Include code examples in documentation
3. **Document edge cases**: Explain error conditions and special behaviors
4. **Link related items**: Use `@see` tags to reference related functions/types
5. **Follow conventions**: Use consistent formatting and terminology

## Additional Resources

- [TypeDoc Documentation](https://typedoc.org/)
- [Rust Documentation Guide](https://doc.rust-lang.org/rustdoc/)
- [JSDoc Reference](https://jsdoc.app/)
- [Writing Great Documentation](https://documentation.divio.com/)
