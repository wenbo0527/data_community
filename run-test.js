#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFile = 'src/tests/unified-edge-manager/core-functionality.test.js';

console.log('正在运行测试文件:', testFile);

const child = spawn('npx', ['vitest', 'run', testFile, '--reporter=verbose'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`测试进程退出，退出码: ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('运行测试时出错:', error);
  process.exit(1);
});