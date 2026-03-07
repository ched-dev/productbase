#!/usr/bin/env node

import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src');

/** Vite built-in env vars — always available, no .env entry needed */
const VITE_BUILTINS = new Set(['DEV', 'PROD', 'SSR', 'MODE', 'BASE_URL']);

/** Recursively find all .ts/.tsx files */
function getSourceFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getSourceFiles(fullPath));
    } else if (/\.[tj]sx?$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Extract all import.meta.env.* keys from source files */
function findEnvKeys(files) {
  const keys = new Set();
  const re = /import\.meta\.env\.(\w+)/g;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = re.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  return keys;
}

const files = getSourceFiles(srcDir);
const usedKeys = findEnvKeys(files);

// Remove Vite built-ins
for (const builtin of VITE_BUILTINS) {
  usedKeys.delete(builtin);
}

// Determine mode from npm lifecycle event (predev → development, else → production)
const lifecycleEvent = process.env.npm_lifecycle_event ?? '';
const mode = lifecycleEvent.includes('dev') ? 'development' : 'production';

const env = loadEnv(mode, root, '');
const missing = [...usedKeys]
  .filter(key => !env[key])
  .filter(key => !(mode === 'production' && key.startsWith('VITE_DEV')));

if (missing.length > 0) {
  console.error(`\n✗ Missing required environment variables:\n`);
  missing.forEach(key => console.error(`  - ${key}`));
  if (mode === 'production') {
    console.error(`\nAdd env vars in Railway in the service settings\n`);
  } else {
    console.error(`\nAdd them to your frontend/.env file`);
  }
  process.exit(1);
}

console.log('✓ Required env var check passed');
