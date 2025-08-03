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
    echo "🔒 Removing bun.lockb..."
    rm -f bun.lockb
    # Note: Cargo.lock is NOT removed as it should be committed for application projects
fi

echo "✅ Project cleaned!"