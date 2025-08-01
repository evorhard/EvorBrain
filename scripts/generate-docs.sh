#!/usr/bin/env bash

# EvorBrain Documentation Generation Script
# Generates documentation for both TypeScript (frontend) and Rust (backend) code

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting documentation generation..."

# Create documentation directories if they don't exist
mkdir -p "$PROJECT_ROOT/docs/api/typescript"
mkdir -p "$PROJECT_ROOT/docs/api/rust"
mkdir -p "$PROJECT_ROOT/docs/assets"

# Generate TypeScript documentation
echo "📘 Generating TypeScript documentation..."
cd "$PROJECT_ROOT"
bunx typedoc

# Generate Rust documentation
echo "🦀 Generating Rust documentation..."
cd "$PROJECT_ROOT/src-tauri"
cargo doc --no-deps --document-private-items

# Copy Rust docs to the unified docs directory
echo "📦 Copying Rust documentation..."
if [ -d "$PROJECT_ROOT/src-tauri/target/doc" ]; then
    cp -r "$PROJECT_ROOT/src-tauri/target/doc"/* "$PROJECT_ROOT/docs/api/rust/"
fi

# Create an index page for the documentation
echo "📄 Creating documentation index..."
cat > "$PROJECT_ROOT/docs/api/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EvorBrain API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 0.5rem;
        }
        .doc-section {
            margin: 2rem 0;
            padding: 1.5rem;
            background: #f5f5f5;
            border-radius: 8px;
        }
        .doc-section h2 {
            margin-top: 0;
            color: #555;
        }
        .doc-links {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        .doc-link {
            padding: 0.75rem 1.5rem;
            background: #007acc;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .doc-link:hover {
            background: #005999;
        }
        .rust-link {
            background: #ce422b;
        }
        .rust-link:hover {
            background: #a93826;
        }
    </style>
</head>
<body>
    <h1>EvorBrain API Documentation</h1>
    
    <div class="doc-section">
        <h2>TypeScript/Frontend Documentation</h2>
        <p>Documentation for the SolidJS frontend components, stores, and utilities.</p>
        <div class="doc-links">
            <a href="./typescript/index.html" class="doc-link">View TypeScript Docs</a>
        </div>
    </div>
    
    <div class="doc-section">
        <h2>Rust/Backend Documentation</h2>
        <p>Documentation for the Tauri backend, including commands, database operations, and system APIs.</p>
        <div class="doc-links">
            <a href="./rust/evorbrain_lib/index.html" class="doc-link rust-link">View Rust Docs</a>
        </div>
    </div>
    
    <div class="doc-section">
        <h2>Additional Documentation</h2>
        <p>For architectural decisions and development guidelines, see:</p>
        <ul>
            <li><a href="../BUSINESS_LOGIC.md">Business Logic Documentation</a></li>
            <li><a href="../COMPONENT_STANDARDS.md">Component Standards</a></li>
            <li><a href="../../README.md">Project README</a></li>
            <li><a href="../../CLAUDE.md">Development Guidelines</a></li>
        </ul>
    </div>
</body>
</html>
EOF

echo "✅ Documentation generation complete!"
echo "📁 Documentation available at: $PROJECT_ROOT/docs/api/"