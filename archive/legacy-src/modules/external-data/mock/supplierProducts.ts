import type { SupplierProduct } from '@/modules/external-data/types/supplier'

const now = new Date().toISOString()

export const supplierProductsMock: SupplierProduct[] = [
  { id: 'SP-001-EXTERNAL_PART_1', supplierId: 'SUP-001', productId: 'P-EXTERNAL_PART_1', productCode: 'EXTERNAL_PART_1', productName: '外数分1', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXTERNAL_PART_2', supplierId: 'SUP-001', productId: 'P-EXTERNAL_PART_2', productCode: 'EXTERNAL_PART_2', productName: '外数分2', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-VERIFY_PART_1', supplierId: 'SUP-001', productId: 'P-VERIFY_PART_1', productCode: 'VERIFY_PART_1', productName: '核验分1', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-VERIFY_PART_2', supplierId: 'SUP-001', productId: 'P-VERIFY_PART_2', productCode: 'VERIFY_PART_2', productName: '核验分2', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-SPECIAL_BUNDLE', supplierId: 'SUP-001', productId: 'P-SPECIAL_BUNDLE', productCode: 'SPECIAL_BUNDLE', productName: '特殊计费包', category: 'SPECIAL', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_01', supplierId: 'SUP-001', productId: 'P-EXT_FIX_01', productCode: 'EXT_FIX_01', productName: '外数分01', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_02', supplierId: 'SUP-001', productId: 'P-EXT_FIX_02', productCode: 'EXT_FIX_02', productName: '外数分02', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_03', supplierId: 'SUP-001', productId: 'P-EXT_FIX_03', productCode: 'EXT_FIX_03', productName: '外数分03', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_04', supplierId: 'SUP-001', productId: 'P-EXT_FIX_04', productCode: 'EXT_FIX_04', productName: '外数分04', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_05', supplierId: 'SUP-001', productId: 'P-EXT_FIX_05', productCode: 'EXT_FIX_05', productName: '外数分05', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_06', supplierId: 'SUP-001', productId: 'P-EXT_FIX_06', productCode: 'EXT_FIX_06', productName: '外数分06', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_07', supplierId: 'SUP-001', productId: 'P-EXT_FIX_07', productCode: 'EXT_FIX_07', productName: '外数分07', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_08', supplierId: 'SUP-001', productId: 'P-EXT_FIX_08', productCode: 'EXT_FIX_08', productName: '外数分08', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_09', supplierId: 'SUP-001', productId: 'P-EXT_FIX_09', productCode: 'EXT_FIX_09', productName: '外数分09', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_10', supplierId: 'SUP-001', productId: 'P-EXT_FIX_10', productCode: 'EXT_FIX_10', productName: '外数分10', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_11', supplierId: 'SUP-001', productId: 'P-EXT_FIX_11', productCode: 'EXT_FIX_11', productName: '外数分11', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_12', supplierId: 'SUP-001', productId: 'P-EXT_FIX_12', productCode: 'EXT_FIX_12', productName: '外数分12', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_13', supplierId: 'SUP-001', productId: 'P-EXT_FIX_13', productCode: 'EXT_FIX_13', productName: '外数分13', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_14', supplierId: 'SUP-001', productId: 'P-EXT_FIX_14', productCode: 'EXT_FIX_14', productName: '外数分14', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_15', supplierId: 'SUP-001', productId: 'P-EXT_FIX_15', productCode: 'EXT_FIX_15', productName: '外数分15', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_16', supplierId: 'SUP-001', productId: 'P-EXT_FIX_16', productCode: 'EXT_FIX_16', productName: '外数分16', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_17', supplierId: 'SUP-001', productId: 'P-EXT_FIX_17', productCode: 'EXT_FIX_17', productName: '外数分17', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_18', supplierId: 'SUP-001', productId: 'P-EXT_FIX_18', productCode: 'EXT_FIX_18', productName: '外数分18', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_19', supplierId: 'SUP-001', productId: 'P-EXT_FIX_19', productCode: 'EXT_FIX_19', productName: '外数分19', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_20', supplierId: 'SUP-001', productId: 'P-EXT_FIX_20', productCode: 'EXT_FIX_20', productName: '外数分20', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_21', supplierId: 'SUP-001', productId: 'P-EXT_FIX_21', productCode: 'EXT_FIX_21', productName: '外数分21', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_22', supplierId: 'SUP-001', productId: 'P-EXT_FIX_22', productCode: 'EXT_FIX_22', productName: '外数分22', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_23', supplierId: 'SUP-001', productId: 'P-EXT_FIX_23', productCode: 'EXT_FIX_23', productName: '外数分23', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_24', supplierId: 'SUP-001', productId: 'P-EXT_FIX_24', productCode: 'EXT_FIX_24', productName: '外数分24', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_25', supplierId: 'SUP-001', productId: 'P-EXT_FIX_25', productCode: 'EXT_FIX_25', productName: '外数分25', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_26', supplierId: 'SUP-001', productId: 'P-EXT_FIX_26', productCode: 'EXT_FIX_26', productName: '外数分26', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_27', supplierId: 'SUP-001', productId: 'P-EXT_FIX_27', productCode: 'EXT_FIX_27', productName: '外数分27', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_28', supplierId: 'SUP-001', productId: 'P-EXT_FIX_28', productCode: 'EXT_FIX_28', productName: '外数分28', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_29', supplierId: 'SUP-001', productId: 'P-EXT_FIX_29', productCode: 'EXT_FIX_29', productName: '外数分29', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_30', supplierId: 'SUP-001', productId: 'P-EXT_FIX_30', productCode: 'EXT_FIX_30', productName: '外数分30', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_31', supplierId: 'SUP-001', productId: 'P-EXT_FIX_31', productCode: 'EXT_FIX_31', productName: '外数分31', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_32', supplierId: 'SUP-001', productId: 'P-EXT_FIX_32', productCode: 'EXT_FIX_32', productName: '外数分32', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_33', supplierId: 'SUP-001', productId: 'P-EXT_FIX_33', productCode: 'EXT_FIX_33', productName: '外数分33', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_34', supplierId: 'SUP-001', productId: 'P-EXT_FIX_34', productCode: 'EXT_FIX_34', productName: '外数分34', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_35', supplierId: 'SUP-001', productId: 'P-EXT_FIX_35', productCode: 'EXT_FIX_35', productName: '外数分35', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_36', supplierId: 'SUP-001', productId: 'P-EXT_FIX_36', productCode: 'EXT_FIX_36', productName: '外数分36', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_37', supplierId: 'SUP-001', productId: 'P-EXT_FIX_37', productCode: 'EXT_FIX_37', productName: '外数分37', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_38', supplierId: 'SUP-001', productId: 'P-EXT_FIX_38', productCode: 'EXT_FIX_38', productName: '外数分38', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_39', supplierId: 'SUP-001', productId: 'P-EXT_FIX_39', productCode: 'EXT_FIX_39', productName: '外数分39', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_FIX_40', supplierId: 'SUP-001', productId: 'P-EXT_FIX_40', productCode: 'EXT_FIX_40', productName: '外数分40', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_TIER_01', supplierId: 'SUP-001', productId: 'P-EXT_TIER_01', productCode: 'EXT_TIER_01', productName: '外数阶梯01', category: 'DATA', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_TIER_02', supplierId: 'SUP-001', productId: 'P-EXT_TIER_02', productCode: 'EXT_TIER_02', productName: '外数阶梯02', category: 'DATA', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_TIER_03', supplierId: 'SUP-001', productId: 'P-EXT_TIER_03', productCode: 'EXT_TIER_03', productName: '外数阶梯03', category: 'DATA', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_TIER_04', supplierId: 'SUP-001', productId: 'P-EXT_TIER_04', productCode: 'EXT_TIER_04', productName: '外数阶梯04', category: 'DATA', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_TIER_05', supplierId: 'SUP-001', productId: 'P-EXT_TIER_05', productCode: 'EXT_TIER_05', productName: '外数阶梯05', category: 'DATA', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_TIER_06', supplierId: 'SUP-001', productId: 'P-EXT_TIER_06', productCode: 'EXT_TIER_06', productName: '外数阶梯06', category: 'DATA', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_TIER_07', supplierId: 'SUP-001', productId: 'P-EXT_TIER_07', productCode: 'EXT_TIER_07', productName: '外数阶梯07', category: 'DATA', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-EXT_TIER_08', supplierId: 'SUP-001', productId: 'P-EXT_TIER_08', productCode: 'EXT_TIER_08', productName: '外数阶梯08', category: 'DATA', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-SPC_BUNDLE_01', supplierId: 'SUP-001', productId: 'P-SPC_BUNDLE_01', productCode: 'SPC_BUNDLE_01', productName: '特殊计费包01', category: 'SPECIAL', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-001-SPC_BUNDLE_02', supplierId: 'SUP-001', productId: 'P-SPC_BUNDLE_02', productCode: 'SPC_BUNDLE_02', productName: '特殊计费包02', category: 'SPECIAL', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-EXTERNAL_PART_3', supplierId: 'SUP-002', productId: 'P-EXTERNAL_PART_3', productCode: 'EXTERNAL_PART_3', productName: '外数分3', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-EXTERNAL_PART_4', supplierId: 'SUP-002', productId: 'P-EXTERNAL_PART_4', productCode: 'EXTERNAL_PART_4', productName: '外数分4', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-VERIFY_PART_3', supplierId: 'SUP-002', productId: 'P-VERIFY_PART_3', productCode: 'VERIFY_PART_3', productName: '核验分3', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-VERIFY_PART_4', supplierId: 'SUP-002', productId: 'P-VERIFY_PART_4', productCode: 'VERIFY_PART_4', productName: '核验分4', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-EXTERNAL_PART_13', supplierId: 'SUP-002', productId: 'P-EXTERNAL_PART_13', productCode: 'EXTERNAL_PART_13', productName: '外数分13', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-EXTERNAL_PART_14', supplierId: 'SUP-002', productId: 'P-EXTERNAL_PART_14', productCode: 'EXTERNAL_PART_14', productName: '外数分14', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-002-SPECIAL_BUNDLE', supplierId: 'SUP-002', productId: 'P-SPECIAL_BUNDLE', productCode: 'SPECIAL_BUNDLE', productName: '特殊计费包', category: 'SPECIAL', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  // SUP-003 百度
  { id: 'SP-003-MAP_TILE', supplierId: 'SUP-003', productId: 'P-MAP_TILE', productCode: 'MAP_TILE', productName: '地图瓦片', category: 'MAP', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-POI_SEARCH', supplierId: 'SUP-003', productId: 'P-POI_SEARCH', productCode: 'POI_SEARCH', productName: '地点搜索', category: 'LBS', status: 'active', interfaceCount: 3, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-003-AD_TILE_BUNDLE', supplierId: 'SUP-003', productId: 'P-AD_TILE_BUNDLE', productCode: 'AD_TILE_BUNDLE', productName: '广告瓦片包', category: 'SPECIAL', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  // SUP-004 高德
  { id: 'SP-004-ROUTE_PLAN', supplierId: 'SUP-004', productId: 'P-ROUTE_PLAN', productCode: 'ROUTE_PLAN', productName: '路线规划', category: 'LBS', status: 'active', interfaceCount: 2, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-004-GEO_ENRICH', supplierId: 'SUP-004', productId: 'P-GEO_ENRICH', productCode: 'GEO_ENRICH', productName: '地理增强', category: 'DATA', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now },
  { id: 'SP-004-VIP_ROUTE_BUNDLE', supplierId: 'SUP-004', productId: 'P-VIP_ROUTE_BUNDLE', productCode: 'VIP_ROUTE_BUNDLE', productName: 'VIP路线包', category: 'SPECIAL', status: 'active', interfaceCount: 1, hasContract: true, createdAt: now, updatedAt: now }
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
