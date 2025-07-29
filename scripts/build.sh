#!/bin/bash

# Build script for EvorBrain
# Creates production builds for distribution

echo "🏗️  Building EvorBrain for production..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it first: https://bun.sh"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf src-tauri/target/release/bundle

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build the application
echo "🔨 Building application..."
bun run tauri build

echo "✅ Build complete! Check src-tauri/target/release/bundle for the installer."