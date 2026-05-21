#!/usr/bin/env node
/**
 * Demo 项目自动化测试 - HTTP 层面
 * 测试范围：
 * 1. 所有 Mock API 端点 (HTTP 状态 + 响应格式)
 * 2. 所有子应用页面 HTTP 状态
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'https://118.196.79.130:8443';

// ============ API 测试 ============
const API_TESTS = [
  // ProductOverview
  { name: 'GET /api/v1/product-overview', path: '/api/v1/product-overview', method: 'GET', expectedStatus: 200, validator: (d) => d.domains && d.domains.length === 6 },
  
  // Evaluation APIs
  { name: 'GET /api/external-data-evaluation/products', path: '/api/external-data-evaluation/products', method: 'GET', expectedStatus: 200 },
  { name: 'GET /api/external-data-evaluation/list', path: '/api/external-data-evaluation/list', method: 'GET', expectedStatus: 200 },
  { name: 'GET /api/external-data-evaluation/detail/1', path: '/api/external-data-evaluation/detail/1', method: 'GET', expectedStatus: 200 },
  { name: 'POST /api/external-data-evaluation/create', path: '/api/external-data-evaluation/create', method: 'POST', expectedStatus: 200, body: { reportName: '测试报告' } },
  { name: 'PUT /api/external-data-evaluation/1/publish', path: '/api/external-data-evaluation/1/publish', method: 'PUT', expectedStatus: 200 },
  { name: 'PUT /api/external-data-evaluation/1/archive', path: '/api/external-data-evaluation/1/archive', method: 'PUT', expectedStatus: 200 },
  
  // Monitor APIs
  { name: 'GET /budget/monitor/burndown', path: '/budget/monitor/burndown', method: 'GET', expectedStatus: 200 },
  { name: 'GET /budget/monitor/warnings', path: '/budget/monitor/warnings', method: 'GET', expectedStatus: 200 },
  
  // Task APIs
  { name: 'GET /external-data-task/list', path: '/external-data-task/list', method: 'GET', expectedStatus: 200 },
  { name: 'GET /external-data-task/1', path: '/external-data-task/1', method: 'GET', expectedStatus: 200 },
  { name: 'POST /external-data-task', path: '/external-data-task', method: 'POST', expectedStatus: 200, body: { taskName: '测试任务' } },
  { name: 'PUT /external-data-task/1/progress', path: '/external-data-task/1/progress', method: 'PUT', expectedStatus: 200, body: { progress: 50 } },
  
  // Budget Contract APIs
  { name: 'GET /budget/contracts', path: '/budget/contracts', method: 'GET', expectedStatus: 200 },
  { name: 'POST /budget/contracts', path: '/budget/contracts', method: 'POST', expectedStatus: 200, body: { contractName: '测试合同' } },
  { name: 'GET /budget/contracts/C1', path: '/budget/contracts/C1', method: 'GET', expectedStatus: 200 },
  { name: 'PUT /budget/contracts/C1', path: '/budget/contracts/C1', method: 'PUT', expectedStatus: 200, body: { contractName: '更新合同' } },
  { name: 'DELETE /budget/contracts/C1', path: '/budget/contracts/C1', method: 'DELETE', expectedStatus: 200 },
  
  // Budget Settlement APIs
  { name: 'GET /budget/settlement/list', path: '/budget/settlement/list', method: 'GET', expectedStatus: 200 },
  { name: 'POST /budget/settlement/writeoff', path: '/budget/settlement/writeoff', method: 'POST', expectedStatus: 200, body: { id: 'S1' } },
  { name: 'POST /budget/settlement/task', path: '/budget/settlement/task', method: 'POST', expectedStatus: 200, body: { id: 'S1' } },
  
  // Budget APIs
  { name: 'GET /budget/list', path: '/budget/list', method: 'GET', expectedStatus: 200 },
  { name: 'GET /budget/B1', path: '/budget/B1', method: 'GET', expectedStatus: 200 },
  { name: 'POST /budget', path: '/budget', method: 'POST', expectedStatus: 200, body: { name: '测试预算' } },
  { name: 'PUT /budget/B1', path: '/budget/B1', method: 'PUT', expectedStatus: 200, body: { name: '更新预算' } },
  { name: 'POST /budget/verification', path: '/budget/verification', method: 'POST', expectedStatus: 200, body: { budgetId: 'B1' } },
];

// ============ 页面测试 ============
const PAGE_TESTS = [
  // shell-app
  { name: 'Shell App 首页', path: '/home/' },
  { name: 'Shell App 产品概览', path: '/home/product-overview' },
  
  // risk-app
  { name: 'Risk App 首页', path: '/risk/' },
  { name: 'Risk App 外数档案', path: '/risk/external-data/archive' },
  { name: 'Risk App 外数监控', path: '/risk/external-data/monitor' },
  { name: 'Risk App 外数任务', path: '/risk/external-data/task' },
  { name: 'Risk App 预算合同', path: '/risk/budget/contract' },
  { name: 'Risk App 预算结算', path: '/risk/budget/settlement' },
  { name: 'Risk App 预算总览', path: '/risk/budget/overview' },
  
  // mkt-app
  { name: 'MKT App 首页', path: '/mkt/' },
  
  // dex-app
  { name: 'DEX App 首页', path: '/dex/' },
  
  // admin-app
  { name: 'Admin App 首页', path: '/admin/' },
  
  // dmt-app
  { name: 'DMT App 首页', path: '/dmt/' },
  
  // dfd-app
  { name: 'DFD App 首页', path: '/dfd/' },
];

// ============ 工具函数 ============
function httpRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Demo-Test/1.0',
      },
      rejectUnauthorized: false,
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ============ 主测试流程 ============
async function testApi(test) {
  const url = `${BASE_URL}${test.path}`;
  const start = Date.now();
  try {
    const result = await httpRequest(url, test.method, test.body);
    const duration = Date.now() - start;
    const passed = result.status === test.expectedStatus;
    const valid = test.validator ? test.validator(result.data) : true;
    
    return {
      name: test.name,
      passed: passed && valid,
      status: result.status,
      expectedStatus: test.expectedStatus,
      duration,
      error: !passed ? `Status ${result.status} !== ${test.expectedStatus}` : (!valid ? 'Validator failed' : null),
      dataPreview: typeof result.data === 'object' ? JSON.stringify(result.data).substring(0, 80) : String(result.data).substring(0, 80),
    };
  } catch (err) {
    return {
      name: test.name,
      passed: false,
      status: null,
      expectedStatus: test.expectedStatus,
      duration: Date.now() - start,
      error: err.message,
    };
  }
}

async function testPage(page) {
  const url = `${BASE_URL}${page.path}`;
  const start = Date.now();
  try {
    const result = await httpRequest(url, 'GET');
    const duration = Date.now() - start;
    const passed = result.status === 200;
    
    // 检查是否是有效的 HTML 或 JSON
    const isHtml = typeof result.data === 'string' && result.data.includes('<html');
    const isJson = typeof result.data === 'object';
    const isValid = isHtml || isJson;
    
    return {
      name: page.name,
      path: page.path,
      passed: passed && isValid,
      status: result.status,
      duration,
      contentType: result.headers['content-type'] || 'unknown',
      error: !passed ? `Status ${result.status} !== 200` : (!isValid ? 'Not HTML or JSON' : null),
    };
  } catch (err) {
    return {
      name: page.name,
      path: page.path,
      passed: false,
      status: null,
      duration: Date.now() - start,
      error: err.message,
    };
  }
}

async function runTests() {
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(20) + 'Demo 项目自动化测试' + ' '.repeat(27) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');
  console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`基础 URL: ${BASE_URL}`);
  console.log('');
  
  let passed = 0;
  let failed = 0;
  const failedTests = [];
  
  // 1. 测试 Mock API 端点
  console.log('┌' + '─'.repeat(68) + '┐');
  console.log('│ [1/2] Mock API 端点测试                                           │');
  console.log('└' + '─'.repeat(68) + '┘');
  
  for (const test of API_TESTS) {
    const result = await testApi(test);
    if (result.passed) {
      passed++;
      console.log(`  ✅ ${result.name.padEnd(50)} ${result.status} (${result.duration}ms)`);
    } else {
      failed++;
      failedTests.push({ ...result, type: 'api' });
      console.log(`  ❌ ${result.name.padEnd(50)} ${result.status || 'FAIL'} - ${result.error}`);
    }
  }
  
  console.log('');
  console.log('┌' + '─'.repeat(68) + '┐');
  console.log('│ [2/2] 子应用页面测试                                               │');
  console.log('└' + '─'.repeat(68) + '┘');
  
  for (const page of PAGE_TESTS) {
    const result = await testPage(page);
    if (result.passed) {
      passed++;
      console.log(`  ✅ ${result.name.padEnd(50)} ${result.status} (${result.duration}ms)`);
    } else {
      failed++;
      failedTests.push({ ...result, type: 'page' });
      console.log(`  ❌ ${result.name.padEnd(50)} ${result.status || 'FAIL'} - ${result.error}`);
    }
  }
  
  console.log('');
  console.log('┌' + '─'.repeat(68) + '┐');
  console.log('│ 测试结果汇总                                                       │');
  console.log('└' + '─'.repeat(68) + '┘');
  
  const total = passed + failed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  
  console.log(`  总计: ${total} 项`);
  console.log(`  通过: ${passed} ✅`);
  console.log(`  失败: ${failed} ❌`);
  console.log(`  通过率: ${passRate}%`);
  console.log('');
  
  if (failedTests.length > 0) {
    console.log('┌' + '─'.repeat(68) + '┐');
    console.log('│ 失败详情                                                           │');
    console.log('└' + '─'.repeat(68) + '┘');
    for (const t of failedTests) {
      console.log(`  ❌ [${t.type.toUpperCase()}] ${t.name}`);
      if (t.error) console.log(`     Error: ${t.error}`);
      if (t.dataPreview) console.log(`     Data: ${t.dataPreview}`);
    }
    console.log('');
  }
  
  // 生成总结
  console.log('┌' + '─'.repeat(68) + '┐');
  console.log('│ API 覆盖                                                           │');
  console.log('└' + '─'.repeat(68) + '┘');
  console.log(`  - ProductOverview APIs:    1 个`);
  console.log(`  - Evaluation APIs:        6 个`);
  console.log(`  - Monitor APIs:            2 个`);
  console.log(`  - Task APIs:              4 个`);
  console.log(`  - Budget Contract APIs:   5 个`);
  console.log(`  - Budget Settlement APIs: 3 个`);
  console.log(`  - Budget APIs:            5 个`);
  console.log(`  子应用页面:               ${PAGE_TESTS.length} 个`);
  console.log('');
  console.log('='.repeat(70));
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('测试执行失败:', err.message);
  process.exit(1);
});
