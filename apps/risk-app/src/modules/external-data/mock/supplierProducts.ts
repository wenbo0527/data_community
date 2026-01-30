import type { SupplierProduct } from '../../external-data/types/supplier'

const now = new Date().toISOString()

export const supplierProductsMock: SupplierProduct[] = [
  { id: 'SP-001-XUEXIN_ID_VERIFY', supplierId: 'SUP-001', productId: 'P-XUEXIN_ID_VERIFY', productCode: 'XUEXIN_ID_VERIFY', productName: '学籍身份核验', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-XUEXIN_DEGREE_VERIFY', supplierId: 'SUP-001', productId: 'P-XUEXIN_DEGREE_VERIFY', productCode: 'XUEXIN_DEGREE_VERIFY', productName: '学历认证查询', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-XUEXIN_STATUS_CHECK', supplierId: 'SUP-001', productId: 'P-XUEXIN_STATUS_CHECK', productCode: 'XUEXIN_STATUS_CHECK', productName: '在学状态核验', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-XUEXIN_ENROLL_VERIFY', supplierId: 'SUP-001', productId: 'P-XUEXIN_ENROLL_VERIFY', productCode: 'XUEXIN_ENROLL_VERIFY', productName: '入学信息核验', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-BH_CREDIT_SCORE', supplierId: 'SUP-002', productId: 'P-BH_CREDIT_SCORE', productCode: 'BH_CREDIT_SCORE', productName: '百行信用评分', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-BH_ID_VALIDATION', supplierId: 'SUP-002', productId: 'P-BH_ID_VALIDATION', productCode: 'BH_ID_VALIDATION', productName: '身份有效性核验', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-BH_PHONE_RISK', supplierId: 'SUP-002', productId: 'P-BH_PHONE_RISK', productCode: 'BH_PHONE_RISK', productName: '手机号风险评估', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-BH_BLACKLIST_CHECK', supplierId: 'SUP-002', productId: 'P-BH_BLACKLIST_CHECK', productCode: 'BH_BLACKLIST_CHECK', productName: '黑名单查询', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-PD_LOCATION_RISK', supplierId: 'SUP-003', productId: 'P-PD_LOCATION_RISK', productCode: 'PD_LOCATION_RISK', productName: '位置风险评估', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-PD_DEVICE_FINGERPRINT', supplierId: 'SUP-003', productId: 'P-PD_DEVICE_FINGERPRINT', productCode: 'PD_DEVICE_FINGERPRINT', productName: '设备指纹分析', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-PD_IP_RISK', supplierId: 'SUP-003', productId: 'P-PD_IP_RISK', productCode: 'PD_IP_RISK', productName: 'IP风险识别', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-PD_BEHAVIOR_RISK', supplierId: 'SUP-003', productId: 'P-PD_BEHAVIOR_RISK', productCode: 'PD_BEHAVIOR_RISK', productName: '行为风险分析', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-BH_CREDIT_QUERY', supplierId: 'SUP-002', productId: 'P-BH_CREDIT_QUERY', productCode: 'BH_CREDIT_QUERY', productName: '百行征信查询', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-BH_MULTI_QUERY', supplierId: 'SUP-002', productId: 'P-BH_MULTI_QUERY', productCode: 'BH_MULTI_QUERY', productName: '多维征信查询', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-XUEXIN_BATCH_DEGREE', supplierId: 'SUP-001', productId: 'P-XUEXIN_BATCH_DEGREE', productCode: 'XUEXIN_BATCH_DEGREE', productName: '学历批量认证', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-XUEXIN_BATCH_STATUS', supplierId: 'SUP-001', productId: 'P-XUEXIN_BATCH_STATUS', productCode: 'XUEXIN_BATCH_STATUS', productName: '在学状态批量核验', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-PD_TRAFFIC_ANALYSIS', supplierId: 'SUP-003', productId: 'P-PD_TRAFFIC_ANALYSIS', productCode: 'PD_TRAFFIC_ANALYSIS', productName: '流量行为分析', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-PD_DEVICE_CLUSTER', supplierId: 'SUP-003', productId: 'P-PD_DEVICE_CLUSTER', productCode: 'PD_DEVICE_CLUSTER', productName: '设备聚类分析', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-PD_DEVICE_RISK', supplierId: 'SUP-003', productId: 'P-PD_DEVICE_RISK', productCode: 'PD_DEVICE_RISK', productName: '设备风险识别', category: 'SPECIAL', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-XUEXIN_SPECIAL_AUDIT', supplierId: 'SUP-001', productId: 'P-XUEXIN_SPECIAL_AUDIT', productCode: 'XUEXIN_SPECIAL_AUDIT', productName: '特殊教育审核', category: 'SPECIAL', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now }
]

export async function getSupplierProductsMock(supplierId: string): Promise<SupplierProduct[]> {
  return Promise.resolve(supplierProductsMock.filter(p => p.supplierId === supplierId))
}

export async function getSupplierProductsMap(): Promise<Record<string, SupplierProduct[]>> {
  const map: Record<string, SupplierProduct[]> = {}
  for (const p of supplierProductsMock) {
    (map[p.supplierId] ||= []).push(p)
  }
  return Promise.resolve(map)
}
