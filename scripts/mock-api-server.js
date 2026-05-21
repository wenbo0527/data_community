const http = require('http');
const url = require('url');

// ============ Mock 数据生成函数 ============

function generateMockProducts() {
  return [
    { id: 1, name: '运营商数据', supplier: '中国移动', status: 'active', category: '认证类' },
    { id: 2, name: '电商消费数据', supplier: '京东', status: 'active', category: '消费类' },
    { id: 3, name: '信用评分', supplier: '芝麻信用', status: 'active', category: '评分类' },
    { id: 4, name: '多头借贷', supplier: '同盾科技', status: 'inactive', category: '风控类' },
    { id: 5, name: '设备指纹', supplier: '顶象技术', status: 'active', category: '设备类' },
  ];
}

function generateMockProductOverview() {
  return {
    vision: '打造业界领先的数据资产管理平台',
    project: '数据资产管理平台',
    domains: [
      { code: 'PD-COM', name: '数字社区', label: '数字社区门户', description: '数字社区平台', priority: 'P2', status: '已上线', updatedAt: '2026-03-31T09:55:47', epicCount: 4, featureCount: 9, storyCount: 70 },
      { code: 'PD-MKT', name: '数字营销', label: '数字营销', description: '数字营销平台', priority: 'P1', status: '已上线', updatedAt: '2026-04-01T09:26:33', epicCount: 5, featureCount: 19, storyCount: 87 },
      { code: 'PD-RISK', name: '数字风险', label: '数字风险', description: '数字风险平台', priority: 'P1', status: '已上线', updatedAt: '2026-04-02T16:12:35', epicCount: 2, featureCount: 10, storyCount: 21 },
      { code: 'PD-DFD', name: '数据发现', label: '数据发现', description: '数据发现平台', priority: 'P0', status: '规划中', updatedAt: '2026-04-08T23:18:51', epicCount: 5, featureCount: 22, storyCount: 62 },
      { code: 'PD-DEX', name: '数据探索', label: '数据探索', description: '数据探索平台', priority: 'P0', status: '规划中', updatedAt: '2026-04-08T23:18:51', epicCount: 3, featureCount: 18, storyCount: 36 },
      { code: 'PD-DMT', name: '数据管理', label: '数据管理', description: '数据管理平台', priority: 'P0', status: '规划中', updatedAt: '2026-04-08T23:18:51', epicCount: 4, featureCount: 21, storyCount: 70 },
    ]
  };
}

function generateMockReports() {
  return {
    list: [
      { id: 1, reportName: 'Q1数据评估报告', status: 'published', supplier: '中国移动', createdAt: '2026-03-01' },
      { id: 2, reportName: '电商数据质量报告', status: 'draft', supplier: '京东', createdAt: '2026-04-15' },
      { id: 3, reportName: '信用评估准确性报告', status: 'archived', supplier: '芝麻信用', createdAt: '2026-02-20' },
    ],
    total: 3
  };
}

function generateMockTasks() {
  return {
    data: {
      list: [
        { id: 1, taskName: '离线任务-1', status: 'completed', progress: 100, createdAt: '2026-05-01' },
        { id: 2, taskName: '离线任务-2', status: 'in_progress', progress: 60, createdAt: '2026-05-03' },
        { id: 3, taskName: '离线任务-3', status: 'pending', progress: 0, createdAt: '2026-05-05' },
      ]
    }
  };
}

function generateMockBurndown() {
  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const year = new Date().getFullYear();
  const initial = 1000000;
  return months.map((m, i) => ({
    granularity: 'month',
    month: `${year}-${m}`,
    budget: initial - i * 60000,
    actual: initial - i * 50000,
    initialBudget: initial
  }));
}

function generateMockWarnings() {
  const platforms = ['字节', '京东', '美团', '百度', '腾讯'];
  const businessTypes = ['授信', '营销', '风控'];
  return Array.from({ length: 10 }, (_, i) => {
    const platform = platforms[i % platforms.length];
    const businessType = businessTypes[i % 3];
    const estimatedLoan = 500000 + i * 12000;
    const actualLoan = estimatedLoan * (0.88 + (i % 5) * 0.03);
    const estimatedCost = 100000 + i * 7000;
    const actualCost = estimatedCost * (1.05 + (i % 4) * 0.04);
    const over = actualCost > estimatedCost * 1.1;
    const slow = actualLoan < estimatedLoan * 0.9;
    return {
      id: i + 1,
      level: over ? 'critical' : slow ? 'warning' : 'info',
      message: `预算预警 - ${platform} - ${businessType}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      businessType,
      platform,
      estimatedCost,
      actualCost,
      estimatedLoan,
      actualLoan,
      targetLoan: estimatedLoan,
      estimatedAnnualCost: 0.08 + (i % 4) * 0.005,
      actualAnnualCost: 0.082 + (i % 3) * 0.003,
      estimatedRiskFreeReturn: 0.035 + (i % 3) * 0.003,
      actualRiskFreeReturn: 0.034 + (i % 4) * 0.002,
      externalDataCost: Math.round(estimatedCost * 0.3),
      budgetStatus: over ? '超支' : (slow ? '偏离' : '正常')
    };
  });
}

function generateMockContracts() {
  const suppliers = ['百行征信', '朴道征信', '钱塘征信', '学信网', '腾讯征信', '芝麻信用'];
  const list = Array.from({ length: 8 }, (_, i) => ({
    id: `C${i+1}`,
    contractNo: `CT-2026-${String(i+1).padStart(4, '0')}`,
    contractName: `${suppliers[i % suppliers.length]}数据服务合同`,
    supplier: suppliers[i % suppliers.length],
    amount: 100000 + i * 50000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: ['active', 'active', 'active', 'completed', 'terminated', 'pending', 'expired', 'active'][i],
    dataCount: 5 + i,
    productCount: 2 + (i % 3),
    writtenOffAmount: 30000 + i * 10000,
    totalFreeQuota: 10000,
    usedFreeQuota: 3000 + i * 500,
    contractType: i % 2 === 0 ? 'framework' : 'supplement',
    frameworkId: i % 2 === 1 ? 'C1' : null,
  }));
  return { code: 200, data: { list, total: list.length } };
}

function generateMockContractDetail(id) {
  return {
    code: 200,
    data: {
      id,
      contractNo: `CT-2026-${String(id).padStart(4, '0')}`,
      contractName: '数据服务合同',
      supplier: '百行征信',
      amount: 150000,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'active',
      dataCount: 8,
      productCount: 3,
      writtenOffAmount: 45000,
      totalFreeQuota: 10000,
      usedFreeQuota: 4500,
    }
  };
}

function generateMockSettlementList() {
  const suppliers = ['百行', '朴道', '钱塘', '学信网'];
  const list = Array.from({ length: 6 }, (_, i) => ({
    id: `S${i+1}`,
    contractNo: `FA-00${i+1}`,
    supplier: suppliers[i % 4],
    amount: 80000 + i * 5000,
    writtenOffAmount: 20000 + i * 3000,
    endDate: new Date(Date.now() + (i + 15) * 86400000).toISOString().split('T')[0]
  }));
  return { code: 200, data: { list, total: list.length } };
}

function generateMockBudgetList() {
  const list = Array.from({ length: 8 }, (_, i) => ({
    id: `B${i+1}`,
    name: `年度预算-${i+1}`,
    year: new Date().getFullYear(),
    total: 1000000 + i * 50000,
    used: 400000 + i * 30000,
    status: 'active'
  }));
  return { code: 200, data: { list, total: list.length } };
}

function generateMockBudgetDetail(id) {
  return {
    code: 200,
    data: {
      id,
      name: `年度预算-${id}`,
      year: new Date().getFullYear(),
      total: 1200000,
      used: 480000,
      status: 'active',
      items: [
        { category: '数据采购', budget: 500000, used: 200000 },
        { category: '云服务', budget: 400000, used: 180000 },
        { category: '人工成本', budget: 300000, used: 100000 }
      ]
    }
  };
}

// ============ 请求体解析 ============
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// ============ Mock API 服务器 ============
const mockServer = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  res.setHeader('Content-Type', 'application/json');
  
  console.log(`[Mock API] ${req.method} ${pathname}`);
  
  try {
    // ===== ProductOverview =====
    if (pathname === '/api/v1/product-overview') {
      res.writeHead(200);
      res.end(JSON.stringify(generateMockProductOverview()));
      return;
    }
    
    if (pathname.match(/^\/api\/v1\/domains\/[^/]+$/)) {
      const domain = pathname.split('/').pop();
      res.writeHead(200);
      res.end(JSON.stringify({ 
        code: 200, 
        data: { 
          code: domain, 
          name: '数字风险', 
          label: '数字风险',
          description: '数字风险平台',
          priority: 'P1',
          status: '已上线',
          epicCount: 2,
          featureCount: 10,
          storyCount: 21
        }
      }));
      return;
    }
    
    // ===== Evaluation APIs =====
    if (pathname === '/api/external-data-evaluation/list') {
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, data: generateMockReports() }));
      return;
    }
    
    if (pathname.match(/^\/api\/external-data-evaluation\/detail\/\d+$/)) {
      const id = pathname.split('/').pop();
      res.writeHead(200);
      res.end(JSON.stringify({ 
        code: 200, 
        data: { 
          id, 
          reportName: `评估报告 #${id}`, 
          status: 'published',
          supplier: '中国移动',
          createdAt: '2026-04-01',
          details: '这是一份详细的评估报告数据，包含各项指标和评分。'
        }
      }));
      return;
    }
    
    if (pathname === '/api/external-data-evaluation/create') {
      const body = await parseBody(req);
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, data: { id: Date.now(), ...body } }));
      return;
    }
    
    if (pathname.match(/^\/api\/external-data-evaluation\/\d+\/publish$/)) {
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, message: '发布成功' }));
      return;
    }
    
    if (pathname.match(/^\/api\/external-data-evaluation\/\d+\/archive$/)) {
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, message: '归档成功' }));
      return;
    }
    
    if (pathname === '/api/external-data-evaluation/products') {
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, data: generateMockProducts() }));
      return;
    }
    
    // ===== Monitor APIs =====
    if (pathname === '/budget/monitor/burndown' || pathname === '/api/budget/monitor/burndown') {
      res.writeHead(200);
      res.end(JSON.stringify(generateMockBurndown()));
      return;
    }
    
    if (pathname === '/budget/monitor/warnings' || pathname === '/api/budget/monitor/warnings') {
      res.writeHead(200);
      res.end(JSON.stringify(generateMockWarnings()));
      return;
    }
    
    // ===== Task APIs =====
    if (pathname === '/external-data-task/list') {
      res.writeHead(200);
      res.end(JSON.stringify(generateMockTasks()));
      return;
    }
    
    if (pathname.match(/^\/external-data-task\/\d+$/)) {
      const id = pathname.split('/').pop();
      res.writeHead(200);
      res.end(JSON.stringify({ data: { id, taskName: `离线任务-${id}`, status: 'in_progress', progress: 50 } }));
      return;
    }
    
    if (pathname === '/external-data-task') {
      const body = await parseBody(req);
      res.writeHead(200);
      res.end(JSON.stringify({ id: Date.now(), ...body }));
      return;
    }
    
    if (pathname.match(/^\/external-data-task\/\d+\/progress$/)) {
      const body = await parseBody(req);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, ...body }));
      return;
    }
    
    // ===== Budget Contract APIs =====
    if (pathname === '/budget/contracts') {
      if (req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(generateMockContracts()));
        return;
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        res.writeHead(200);
        res.end(JSON.stringify({ code: 200, data: { id: Date.now().toString(), ...body } }));
        return;
      }
    }
    
    if (pathname.match(/^\/budget\/contracts\/[^/]+$/)) {
      const id = pathname.split('/').pop();
      if (req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(generateMockContractDetail(id)));
        return;
      }
      if (req.method === 'PUT') {
        const body = await parseBody(req);
        res.writeHead(200);
        res.end(JSON.stringify({ code: 200, data: { id, ...body } }));
        return;
      }
      if (req.method === 'DELETE') {
        res.writeHead(200);
        res.end(JSON.stringify({ code: 200, message: '删除成功' }));
        return;
      }
    }
    
    // ===== Budget Settlement APIs =====
    if (pathname === '/budget/settlement/list') {
      res.writeHead(200);
      res.end(JSON.stringify(generateMockSettlementList()));
      return;
    }
    
    if (pathname === '/budget/settlement/writeoff') {
      const body = await parseBody(req);
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, data: { id: Date.now().toString(), ...body } }));
      return;
    }
    
    if (pathname === '/budget/settlement/task') {
      const body = await parseBody(req);
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, data: { id: Date.now().toString(), ...body } }));
      return;
    }
    
    // ===== Budget APIs =====
    if (pathname === '/budget/list') {
      res.writeHead(200);
      res.end(JSON.stringify(generateMockBudgetList()));
      return;
    }
    
    if (pathname === '/budget' && req.method === 'POST') {
      const body = await parseBody(req);
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, data: { id: Date.now().toString(), ...body } }));
      return;
    }
    
    if (pathname.match(/^\/budget\/[^/]+$/) && req.method === 'GET') {
      const id = pathname.split('/').pop();
      res.writeHead(200);
      res.end(JSON.stringify(generateMockBudgetDetail(id)));
      return;
    }
    
    if (pathname.match(/^\/budget\/[^/]+$/) && req.method === 'PUT') {
      const id = pathname.split('/').pop();
      const body = await parseBody(req);
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, data: { id, ...body } }));
      return;
    }
    
    if (pathname === '/budget/verification') {
      const body = await parseBody(req);
      res.writeHead(200);
      res.end(JSON.stringify({ code: 200, data: { id: `V-${Date.now()}`, ...body } }));
      return;
    }
    
    // ===== 默认 404 =====
    res.writeHead(404);
    res.end(JSON.stringify({ code: 404, message: `API not found: ${pathname}` }));
    
  } catch (err) {
    console.error(`[Mock API Error] ${err.message}`);
    res.writeHead(500);
    res.end(JSON.stringify({ code: 500, message: 'Internal server error' }));
  }
});

const PORT = 8081;
mockServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Mock API Server] Running on port ${PORT}`);
  console.log('[Mock API Server] APIs registered:');
  console.log('  === ProductOverview ===');
  console.log('  - GET  /api/v1/product-overview');
  console.log('  - GET  /api/v1/domains/:code');
  console.log('  === Evaluation ===');
  console.log('  - GET  /api/external-data-evaluation/list');
  console.log('  - GET  /api/external-data-evaluation/detail/:id');
  console.log('  - POST /api/external-data-evaluation/create');
  console.log('  - PUT  /api/external-data-evaluation/:id/publish');
  console.log('  - PUT  /api/external-data-evaluation/:id/archive');
  console.log('  - GET  /api/external-data-evaluation/products');
  console.log('  === Monitor ===');
  console.log('  - GET  /budget/monitor/burndown');
  console.log('  - GET  /budget/monitor/warnings');
  console.log('  === Task ===');
  console.log('  - GET  /external-data-task/list');
  console.log('  - GET  /external-data-task/:id');
  console.log('  - POST /external-data-task');
  console.log('  - PUT  /external-data-task/:id/progress');
  console.log('  === Budget Contract ===');
  console.log('  - GET    /budget/contracts');
  console.log('  - POST   /budget/contracts');
  console.log('  - GET    /budget/contracts/:id');
  console.log('  - PUT    /budget/contracts/:id');
  console.log('  - DELETE /budget/contracts/:id');
  console.log('  === Budget Settlement ===');
  console.log('  - GET  /budget/settlement/list');
  console.log('  - POST /budget/settlement/writeoff');
  console.log('  - POST /budget/settlement/task');
  console.log('  === Budget ===');
  console.log('  - GET  /budget/list');
  console.log('  - GET  /budget/:id');
  console.log('  - POST /budget');
  console.log('  - PUT  /budget/:id');
  console.log('  - POST /budget/verification');
});
