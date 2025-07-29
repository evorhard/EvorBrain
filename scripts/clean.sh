#!/bin/bash

# Clean script for EvorBrain
# Removes all build artifacts and dependencies

echo "🧹 Cleaning EvorBrain project..."

# Remove node modules
echo "📦 Removing node_modules..."
rm -rf node_modules

# Remove build artifacts
echo "🗑️  Removing build artifacts..."
rm -rf dist
rm -rf src-tauri/target

# Remove lock files if requested
if [ "$1" == "--all" ]; then
    echo "🔒 Removing lock files..."
    rm -f bun.lockb
    rm -f src-tauri/Cargo.lock
fi

echo "✅ Project cleaned!"