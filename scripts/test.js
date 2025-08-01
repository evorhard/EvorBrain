#!/usr/bin/env node

/**
 * Test runner script that ensures proper environment setup
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Get command line arguments
const args = process.argv.slice(2);

// Run vitest with proper configuration
const vitest = spawn('bunx', ['vitest', ...args], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test'
  }
});

vitest.on('close', (code) => {
  process.exit(code);
});