#!/usr/bin/env node
/**
 * 端口占用检查脚本
 */

const { exec } = require('child_process');

const ports = [8000, 8001, 8002, 8003, 8004, 8005, 3001];

console.log('🔍 检查端口占用情况...\n');

let checked = 0;
ports.forEach(port => {
  exec(`lsof -i :${port} | grep LISTEN`, (err, stdout) => {
    checked++;
    if (stdout) {
      console.log(`❌ 端口 ${port}: 已被占用`);
      console.log(`   ${stdout.trim()}`);
    } else {
      console.log(`✅ 端口 ${port}: 可用`);
    }
    
    if (checked === ports.length) {
      console.log('\n检查完成');
      process.exit(0);
    }
  });
});
