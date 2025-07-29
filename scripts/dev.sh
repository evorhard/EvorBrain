#!/bin/bash

# Development server script for EvorBrain
# Starts both Tauri and Vite dev servers

echo "🚀 Starting EvorBrain development environment..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it first: https://bun.sh"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Start Tauri development server
echo "🔧 Starting Tauri development server..."
bun run tauri dev