#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appDir = join(__dirname, 'divination-app');
const serverScript = join(appDir, 'src/mcp/server.ts');
const tsxBin = join(appDir, 'node_modules/.bin/tsx');

const child = spawn(tsxBin, [serverScript, ...process.argv.slice(2)], {
  cwd: appDir,
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
