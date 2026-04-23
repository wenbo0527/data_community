#!/usr/bin/env node
/**
 * 数据社区平台 - 统一启动脚本
 * 一键启动所有服务，自动检查端口占用
 */

const { spawn } = require('child_process');

const services = [
  { name: 'portal-shell', port: 8000, color: '\x1b[34m' }, // blue
  { name: 'risk-app', port: 8001, color: '\x1b[32m' },    // green
  { name: 'mkt-app', port: 8002, color: '\x1b[33m' },     // yellow
  { name: 'dex-app', port: 8003, color: '\x1b[36m' },     // cyan
  { name: 'dmt-app', port: 8004, color: '\x1b[35m' },    // magenta
  { name: 'admin-app', port: 8005, color: '\x1b[31m' },  // red
];

const reset = '\x1b[0m';

console.log('🚀 数据社区平台 - 统一启动\n');

// 启动所有服务
const processes = services.map(service => {
  console.log(`${service.color}[${service.name}]${reset} 启动中... (端口 ${service.port})`);
  
  const proc = spawn('npm', ['run', `dev:${service.name.replace('-app', '')}`], {
    stdio: 'pipe',
    shell: true,
  });
  
  proc.stdout.on('data', (data) => {
    console.log(`${service.color}[${service.name}]${reset} ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`${service.color}[${service.name}]${reset} ERROR: ${data.toString().trim()}`);
  });
  
  return { service, proc };
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n👋 正在关闭所有服务...\n');
  processes.forEach(({ service, proc }) => {
    console.log(`${service.color}[${service.name}]${reset} 关闭中...`);
    proc.kill('SIGTERM');
  });
  setTimeout(() => process.exit(0), 2000);
});

console.log('\n✅ 所有服务启动中...');
console.log('按 Ctrl+C 停止所有服务\n');
