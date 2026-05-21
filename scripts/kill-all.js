#!/usr/bin/env node
/**
 * 一键停止所有服务脚本
 */

const { exec } = require('child_process');

const ports = [8000, 8001, 8002, 8003, 8004, 8005, 3001];

console.log('🛑 正在停止所有服务...\n');

let killed = 0;
ports.forEach(port => {
  exec(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, (err) => {
    killed++;
    console.log(`✅ 端口 ${port}: 已释放`);
    
    if (killed === ports.length) {
      console.log('\n👋 所有服务已停止');
      process.exit(0);
    }
  });
});
