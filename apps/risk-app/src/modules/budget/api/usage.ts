export interface UsageRecord {
  supplierId: string
  productCode: string
  productName: string
  month: string
  quantity: number
  unit: 'call' | 'record' | 'gb'
  source: string
  collectedAt: string
}

const usageMock: Record<string, UsageRecord[]> = {
  // 学信网 SUP-001
  'SUP-001': [
    { supplierId: 'SUP-001', productCode: 'XUEXIN_ID_VERIFY', productName: '学籍身份核验', month: '2026-01', quantity: 9200, unit: 'record', source: 'dw.xuexin_id_verify', collectedAt: '2026-01-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_DEGREE_VERIFY', productName: '学历认证查询', month: '2026-01', quantity: 8100, unit: 'record', source: 'dw.xuexin_degree_verify', collectedAt: '2026-01-16T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_STATUS_CHECK', productName: '在校状态核查', month: '2026-01', quantity: 7600, unit: 'record', source: 'dw.xuexin_status_check', collectedAt: '2026-01-11T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_ENROLL_VERIFY', productName: '入学资格核验', month: '2026-01', quantity: 6800, unit: 'record', source: 'dw.xuexin_enroll_verify', collectedAt: '2026-01-19T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_BATCH_DEGREE', productName: '学历批量认证', month: '2026-01', quantity: 13200, unit: 'record', source: 'dw.xuexin_batch_degree', collectedAt: '2026-01-10T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_BATCH_STATUS', productName: '在校状态批量查询', month: '2026-01', quantity: 14800, unit: 'record', source: 'dw.xuexin_batch_status', collectedAt: '2026-01-13T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_SPECIAL_AUDIT', productName: '专项人工核算', month: '2026-01', quantity: 240, unit: 'record', source: 'dw.xuexin_special_audit', collectedAt: '2026-01-25T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'XUEXIN_BATCH_EXPORT', productName: '批量导出服务', month: '2026-01', quantity: 3200, unit: 'record', source: 'dw.xuexin_batch_export', collectedAt: '2026-01-08T00:00:00Z' }
  ],
  // 百行 SUP-002
  'SUP-002': [
    { supplierId: 'SUP-002', productCode: 'BH_CREDIT_QUERY', productName: '百行征信查询', month: '2026-01', quantity: 15600, unit: 'record', source: 'dw.bh_credit_query', collectedAt: '2026-01-12T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'BH_CREDIT_SCORE', productName: '百行信用评分', month: '2026-01', quantity: 14000, unit: 'record', source: 'dw.bh_credit_score', collectedAt: '2026-01-18T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'BH_ID_VALIDATION', productName: '身份一致性校验', month: '2026-01', quantity: 9800, unit: 'record', source: 'dw.bh_id_validation', collectedAt: '2026-01-07T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'BH_PHONE_RISK', productName: '手机号风险评估', month: '2026-01', quantity: 11200, unit: 'record', source: 'dw.bh_phone_risk', collectedAt: '2026-01-21T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'BH_BLACKLIST_CHECK', productName: '黑名单命中校验', month: '2026-01', quantity: 7200, unit: 'record', source: 'dw.bh_blacklist_check', collectedAt: '2026-01-05T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'BH_MULTI_QUERY', productName: '多实体并行查询', month: '2026-01', quantity: 8600, unit: 'record', source: 'dw.bh_multi_query', collectedAt: '2026-01-17T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'BH_DATA_EXPORT', productName: '批量导出服务', month: '2026-01', quantity: 2800, unit: 'record', source: 'dw.bh_data_export', collectedAt: '2026-01-09T00:00:00Z' }
  ],
  // 朴道 SUP-003
  'SUP-003': [
    { supplierId: 'SUP-003', productCode: 'PD_DEVICE_RISK', productName: '设备风险识别', month: '2026-01', quantity: 5000, unit: 'record', source: 'dw.pd_device_risk', collectedAt: '2026-01-20T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'PD_LOCATION_RISK', productName: '位置风险评估', month: '2026-01', quantity: 4600, unit: 'record', source: 'dw.pd_location_risk', collectedAt: '2026-01-22T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'PD_DEVICE_FINGERPRINT', productName: '设备指纹生成', month: '2026-01', quantity: 10400, unit: 'record', source: 'dw.pd_device_fingerprint', collectedAt: '2026-01-03T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'PD_IP_RISK', productName: 'IP风险画像', month: '2026-01', quantity: 9100, unit: 'record', source: 'dw.pd_ip_risk', collectedAt: '2026-01-04T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'PD_BEHAVIOR_RISK', productName: '行为风险分析', month: '2026-01', quantity: 7800, unit: 'record', source: 'dw.pd_behavior_risk', collectedAt: '2026-01-06T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'PD_TRAFFIC_ANALYSIS', productName: '流量分析', month: '2026-01', quantity: 12800, unit: 'record', source: 'dw.pd_traffic_analysis', collectedAt: '2026-01-14T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'PD_DEVICE_CLUSTER', productName: '设备集群识别', month: '2026-01', quantity: 8600, unit: 'record', source: 'dw.pd_device_cluster', collectedAt: '2026-01-23T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'PD_DATA_EXPORT', productName: '批量导出服务', month: '2026-01', quantity: 3000, unit: 'record', source: 'dw.pd_data_export', collectedAt: '2026-01-02T00:00:00Z' }
  ]
}

export async function getMonthlyUsageBySupplier(supplierId: string, month: string): Promise<UsageRecord[]> {
  const nameToId: Record<string, string> = { '学信网': 'SUP-001', '百行': 'SUP-002', '朴道': 'SUP-003' }
  const normalizedId = usageMock[supplierId] ? supplierId : (nameToId[supplierId] || supplierId)
  const list = (usageMock[normalizedId] || []).filter(u => u.month === month)
  return Promise.resolve(list)
}
