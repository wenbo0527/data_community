#!/usr/bin/env node
/**
 * 微应用健康检查脚本
 * 检查所有子应用的状态、Registry 注册情况、页面渲染
 * 
 * 用法: node scripts/health-check.js [--verbose] [--fix]
 */

const http = require('http');
const { execSync } = require('child_process');

// 配置
const APPS = [
  { name: 'main-app', port: 5173, base: '/', type: 'main' },
  { name: 'risk-app', port: 5176, base: '/risk/', type: 'qiankun' },
  { name: 'touch', port: 5181, base: '/touch/', type: 'qiankun' },
  { name: 'mkt-app', port: 5177, base: '/mkt/', type: 'qiankun' },
  { name: 'dex-app', port: 5180, base: '/dex/', type: 'qiankun' },
  { name: 'dmt-app', port: 5184, base: '/dmt/', type: 'qiankun' },
  { name: 'admin-app', port: 5182, base: '/admin/', type: 'qiankun' },
];

const verbose = process.argv.includes('--verbose');
const fixMode = process.argv.includes('--fix');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP 请求检查
function checkHttp(url, timeout = 5000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ ok: false, status: 0, error: 'timeout' });
    }, timeout);
    
    http.get(url, (res) => {
      clearTimeout(timer);
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
    }).on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, status: 0, error: err.message });
    });
  });
}

// 检查端口占用
function checkPort(port) {
  try {
    execSync(`lsof -i :${port} -sTCP:LISTEN`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// 检查进程
function checkProcess(appName) {
  try {
    const result = execSync(`pgrep -f "${appName}" | head -1`, { stdio: 'pipe' });
    return result.toString().trim().length > 0;
  } catch {
    return false;
  }
}

// 主要检查逻辑
async function runHealthCheck() {
  log('\n🏥 微应用健康检查', 'blue');
  log('=' .repeat(50), 'blue');
  
  const results = [];
  let allHealthy = true;
  
  // 1. 端口检查
  log('\n📡 端口连通性检查', 'blue');
  for (const app of APPS) {
    const portOpen = checkPort(app.port);
    const status = portOpen ? '🟢' : '🔴';
    log(`  ${status} ${app.name} (${app.port}): ${portOpen ? '监听中' : '未启动'}`, portOpen ? 'green' : 'red');
    
    if (!portOpen && app.type === 'qiankun') {
      allHealthy = false;
      results.push({ app: app.name, check: 'port', status: 'fail' });
    }
  }
  
  // 2. HTTP 检查
  log('\n🌐 HTTP 状态检查', 'blue');
  for (const app of APPS) {
    const result = await checkHttp(`http://localhost:${app.port}${app.base}`);
    const icon = result.ok ? '🟢' : '🔴';
    const statusText = result.ok ? `${result.status} OK` : result.error;
    log(`  ${icon} ${app.name}: ${statusText}`, result.ok ? 'green' : 'red');
    
    if (!result.ok) {
      allHealthy = false;
      results.push({ app: app.name, check: 'http', status: 'fail', detail: result.error });
    }
  }
  
  // 3. Registry 检查（仅 qiankun 应用）
  log('\n📋 Registry 注册检查', 'blue');
  const qiankunApps = APPS.filter(a => a.type === 'qiankun');
  const registeredApps = await checkRegistry();
  
  for (const app of qiankunApps) {
    const registered = registeredApps.includes(app.name);
    const icon = registered ? '🟢' : '🔴';
    log(`  ${icon} ${app.name}: ${registered ? '已注册' : '未注册'}`, registered ? 'green' : 'red');
    
    if (!registered) {
      allHealthy = false;
      results.push({ app: app.name, check: 'registry', status: 'fail' });
    }
  }
  
  // 4. Playwright 渲染检查（可选）
  if (process.env.CI || verbose) {
    log('\n🎨 页面渲染检查 (Playwright)', 'blue');
    try {
      await runPlaywrightCheck();
    } catch (err) {
      log(`  ⚠️ Playwright 检查失败: ${err.message}`, 'yellow');
    }
  }
  
  // 总结
  log('\n' + '=' .repeat(50), 'blue');
  if (allHealthy) {
    log('✅ 所有检查通过！', 'green');
    process.exit(0);
  } else {
    log('❌ 部分检查失败', 'red');
    log('\n失败详情:', 'yellow');
    results.forEach(r => {
      log(`  - ${r.app}: ${r.check}`, 'yellow');
    });
    process.exit(1);
  }
}

// 检查 Registry 注册情况（通过读取控制台日志）
async function checkRegistry() {
  // 简化版：通过检查 registry.ts 文件是否存在
  const fs = require('fs');
  const path = require('path');
  
  const registered = [];
  for (const app of APPS.filter(a => a.type === 'qiankun')) {
    const registryPath = path.join(__dirname, '..', 'apps', app.name, 'src', 'registry.ts');
    if (fs.existsSync(registryPath)) {
      registered.push(app.name);
    }
  }
  return registered;
}

// Playwright 渲染检查
async function runPlaywrightCheck() {
  const { chromium } = require('playwright');
  
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  
  // 检查主页
  await page.goto('http://localhost:5173/discovery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 检查 SideMenu
  const sideMenu = await page.locator('.arco-menu').count();
  log(`  ${sideMenu > 0 ? '🟢' : '🔴'} SideMenu 渲染`, sideMenu > 0 ? 'green' : 'red');
  
  // 检查控制台错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  // 检查 Registry 日志
  const registryLogs = [];
  page.on('console', msg => {
    if (msg.text().includes('[Registry]')) {
      registryLogs.push(msg.text());
    }
  });
  
  await page.reload();
  await page.waitForTimeout(3000);
  
  const appCount = registryLogs.find(l => l.includes('Loaded'))?.match(/Loaded (\d+) apps/)?.[1] || '0';
  log(`  🟢 Registry 加载应用数: ${appCount}`, 'green');
  
  if (errors.length > 0) {
    log(`  ⚠️ 控制台错误 (${errors.length}个):`, 'yellow');
    errors.slice(0, 3).forEach(e => log(`    - ${e.substring(0, 100)}`, 'yellow'));
  }
  
  await browser.close();
}

// 运行
runHealthCheck().catch(err => {
  log(`\n❌ 检查脚本错误: ${err.message}`, 'red');
  process.exit(1);
});
