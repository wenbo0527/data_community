import http from '../../../api/http'

// 93BB782D 修复 (2026-06-24): 仿 api/task.ts:5 useMock 模式 + Archive.vue buildProductsView 20 字段
const useMock = (import.meta as any)?.env?.VITE_USE_MOCK === 'true'

// 20 字段对齐 Archive.vue buildProductsView L370-405
// 仿 supplierProducts.ts 模板（20 个产品）
function generateMockProducts() {
  const now = new Date().toISOString()
  const randBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomDateWithinYear = () => {
    const now = Date.now()
    return new Date(now - Math.floor(Math.random() * 365) * 86400000).toISOString()
  }

  // 20 个产品模板（仿 supplierProducts.ts + 扩展 20 字段）
  const products = [
    { supplierId: 'SUP-001', productCode: 'XUEXIN_ID_VERIFY', productName: '学籍身份核验', category: 'DATA' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_DEGREE_VERIFY', productName: '学历认证查询', category: 'DATA' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_STATUS_CHECK', productName: '在学状态核验', category: 'DATA' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_ENROLL_VERIFY', productName: '入学信息核验', category: 'DATA' },
    { supplierId: 'SUP-002', productCode: 'BH_CREDIT_SCORE', productName: '百行信用评分', category: 'DATA' },
    { supplierId: 'SUP-002', productCode: 'BH_ID_VALIDATION', productName: '身份有效性核验', category: 'DATA' },
    { supplierId: 'SUP-002', productCode: 'BH_PHONE_RISK', productName: '手机号风险评估', category: 'DATA' },
    { supplierId: 'SUP-002', productCode: 'BH_BLACKLIST_CHECK', productName: '黑名单查询', category: 'DATA' },
    { supplierId: 'SUP-003', productCode: 'PD_LOCATION_RISK', productName: '位置风险评估', category: 'DATA' },
    { supplierId: 'SUP-003', productCode: 'PD_DEVICE_FINGERPRINT', productName: '设备指纹分析', category: 'DATA' },
    { supplierId: 'SUP-003', productCode: 'PD_IP_RISK', productName: 'IP风险识别', category: 'DATA' },
    { supplierId: 'SUP-003', productCode: 'PD_BEHAVIOR_RISK', productName: '行为风险分析', category: 'DATA' },
    { supplierId: 'SUP-002', productCode: 'BH_CREDIT_QUERY', productName: '百行征信查询', category: 'DATA' },
    { supplierId: 'SUP-002', productCode: 'BH_MULTI_QUERY', productName: '多维征信查询', category: 'DATA' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_BATCH_DEGREE', productName: '学历批量认证', category: 'DATA' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_BATCH_STATUS', productName: '在学状态批量核验', category: 'DATA' },
    { supplierId: 'SUP-003', productCode: 'PD_TRAFFIC_ANALYSIS', productName: '流量行为分析', category: 'DATA' },
    { supplierId: 'SUP-003', productCode: 'PD_DEVICE_CLUSTER', productName: '设备聚类分析', category: 'DATA' },
    { supplierId: 'SUP-003', productCode: 'PD_DEVICE_RISK', productName: '设备风险识别', category: 'SPECIAL' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_SPECIAL_AUDIT', productName: '特殊教育审核', category: 'SPECIAL' },
  ]

  // supplierId → 中文供应商映射
  const supplierMap: Record<string, string> = {
    'SUP-001': '学信网',
    'SUP-002': '百行征信',
    'SUP-003': '同盾科技',
  }

  return products.map((p, idx) => {
    const hasInterfaces = Math.random() > 0.1
    const hasBottomTable = Math.random() > 0.1
    return {
      id: p.productCode,
      name: p.productName,
      code: `ED-${String(idx + 1).padStart(3, '0')}`,
      supplier: supplierMap[p.supplierId] || p.supplierId,
      status: hasInterfaces && hasBottomTable ? 'active' : (hasInterfaces ? 'importing' : 'pending_evaluation'),
      createdAt: randomDateWithinYear(),
      usageScene: idx % 2 === 0 ? '贷前评分' : '贷中监控',
      billingMode: p.category === 'SPECIAL' ? 'package' : 'per_call',
      unitPrice: randBetween(1, 10),
      billingCycle: 'month',
      currency: 'CNY',
      effectiveDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      expireDate: new Date(Date.now() + 335 * 86400000).toISOString(),
      tags: ['外数', p.category === 'SPECIAL' ? '特殊' : '风控'],
      evaluationScore: randBetween(60, 95),
      monitorStatus: Math.random() > 0.15 ? '正常' : '异常',
      hasInterfaces,
      hasBottomTable,
      frameworkAgreements: [],
      totalSupplementAmount: 0,
    }
  })
}

export async function getEvaluationReports(params: any) {
  const res: any = await http.get('/external-data-evaluation/list', { params })
  // 适配 Mock 返回结构 { code: 200, data: { list: [], total: 0 } }
  // 同时也兼容直接返回 { list: [], total: 0 } 的情况
  const payload = res?.data || res
  return { 
    list: payload?.list || [], 
    total: Number(payload?.total || 0) 
  }
}

export async function getEvaluationReportDetail(id: string | number) {
  const res: any = await http.get(`/external-data-evaluation/detail/${id}`)
  return res?.data || res
}

export async function createEvaluationReport(payload: any) {
  const res: any = await http.post('/external-data-evaluation/create', payload)
  return res?.data || res
}

export async function publishReport(id: string | number) {
  const res: any = await http.put(`/external-data-evaluation/${id}/publish`)
  return res?.data || res
}

export async function archiveReport(id: string | number) {
  const res: any = await http.put(`/external-data-evaluation/${id}/archive`)
  return res?.data || res
}

export async function getRegisteredProducts() {
  // 93BB782D 修复 (2026-06-24): VITE_USE_MOCK=true 时返回 20 字段 mock，避免后端未启 404
  // 返回完整的响应对象，由 Store 处理 { code, data } 结构
  if (useMock) {
    return { code: 200, message: 'success', data: generateMockProducts() }
  }
  return await http.get('/external-data-evaluation/products')
}
