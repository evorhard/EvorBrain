#!/bin/bash

# Test runner script for EvorBrain
# Runs all test suites

echo "🧪 Running EvorBrain tests..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it first: https://bun.sh"
    exit 1
fi

# Run frontend tests
echo "📱 Running frontend tests..."
bun test

# Run Rust tests
echo "🦀 Running Rust tests..."
cd src-tauri && cargo test && cd ..

echo "✅ All tests complete!"