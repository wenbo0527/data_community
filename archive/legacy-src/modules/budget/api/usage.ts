export interface UsageRecord {
  supplierId: string
  productCode: string
  productName: string
  month: string // YYYY-MM
  quantity: number
  unit: 'call' | 'record' | 'gb'
  source: string
  collectedAt: string
}

const usageMock: Record<string, UsageRecord[]> = {
  'SUP-001': [
    { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_1', productName: '外数分1', month: '2025-11', quantity: 8000, unit: 'record', source: 'dw.external_part_1_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_2', productName: '外数分2', month: '2025-11', quantity: 7800, unit: 'record', source: 'dw.external_part_2_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'VERIFY_PART_1', productName: '核验分1', month: '2025-11', quantity: 4200, unit: 'record', source: 'dw.verify_part_1_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'VERIFY_PART_2', productName: '核验分2', month: '2025-11', quantity: 4600, unit: 'record', source: 'dw.verify_part_2_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_7', productName: '外数分7', month: '2025-11', quantity: 62000, unit: 'call', source: 'dw.external_part_7_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_8', productName: '外数分8', month: '2025-11', quantity: 35000, unit: 'call', source: 'dw.external_part_8_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'SPECIAL_BUNDLE', productName: '特殊计费包', month: '2025-11', quantity: 120, unit: 'gb', source: 'dw.special_bundle_gb', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_01', productName: '外数分01', month: '2025-11', quantity: 7900, unit: 'record', source: 'dw.ext_fix_01_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_02', productName: '外数分02', month: '2025-11', quantity: 8100, unit: 'record', source: 'dw.ext_fix_02_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_03', productName: '外数分03', month: '2025-11', quantity: 7600, unit: 'record', source: 'dw.ext_fix_03_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_04', productName: '外数分04', month: '2025-11', quantity: 8000, unit: 'record', source: 'dw.ext_fix_04_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_05', productName: '外数分05', month: '2025-11', quantity: 7400, unit: 'record', source: 'dw.ext_fix_05_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_06', productName: '外数分06', month: '2025-11', quantity: 7600, unit: 'record', source: 'dw.ext_fix_06_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_07', productName: '外数分07', month: '2025-11', quantity: 7800, unit: 'record', source: 'dw.ext_fix_07_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_08', productName: '外数分08', month: '2025-11', quantity: 8200, unit: 'record', source: 'dw.ext_fix_08_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_TIER_01', productName: '外数阶梯01', month: '2025-11', quantity: 42000, unit: 'call', source: 'dw.ext_tier_01_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_TIER_02', productName: '外数阶梯02', month: '2025-11', quantity: 52000, unit: 'call', source: 'dw.ext_tier_02_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'SPC_BUNDLE_01', productName: '特殊计费包01', month: '2025-11', quantity: 88, unit: 'gb', source: 'dw.spc_bundle_01_gb', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'SPC_BUNDLE_02', productName: '特殊计费包02', month: '2025-11', quantity: 92, unit: 'gb', source: 'dw.spc_bundle_02_gb', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_1', productName: '外数分1', month: '2025-12', quantity: 8200, unit: 'record', source: 'dw.external_part_1_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_2', productName: '外数分2', month: '2025-12', quantity: 8000, unit: 'record', source: 'dw.external_part_2_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'VERIFY_PART_1', productName: '核验分1', month: '2025-12', quantity: 4300, unit: 'record', source: 'dw.verify_part_1_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'VERIFY_PART_2', productName: '核验分2', month: '2025-12', quantity: 4800, unit: 'record', source: 'dw.verify_part_2_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_7', productName: '外数分7', month: '2025-12', quantity: 59000, unit: 'call', source: 'dw.external_part_7_calls', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_8', productName: '外数分8', month: '2025-12', quantity: 37000, unit: 'call', source: 'dw.external_part_8_calls', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'SPECIAL_BUNDLE', productName: '特殊计费包', month: '2025-12', quantity: 140, unit: 'gb', source: 'dw.special_bundle_gb', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_01', productName: '外数分01', month: '2025-12', quantity: 8000, unit: 'record', source: 'dw.ext_fix_01_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_02', productName: '外数分02', month: '2025-12', quantity: 8300, unit: 'record', source: 'dw.ext_fix_02_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_03', productName: '外数分03', month: '2025-12', quantity: 7700, unit: 'record', source: 'dw.ext_fix_03_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_04', productName: '外数分04', month: '2025-12', quantity: 8100, unit: 'record', source: 'dw.ext_fix_04_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_05', productName: '外数分05', month: '2025-12', quantity: 7500, unit: 'record', source: 'dw.ext_fix_05_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_06', productName: '外数分06', month: '2025-12', quantity: 7800, unit: 'record', source: 'dw.ext_fix_06_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_07', productName: '外数分07', month: '2025-12', quantity: 7900, unit: 'record', source: 'dw.ext_fix_07_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_FIX_08', productName: '外数分08', month: '2025-12', quantity: 8300, unit: 'record', source: 'dw.ext_fix_08_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_TIER_01', productName: '外数阶梯01', month: '2025-12', quantity: 45000, unit: 'call', source: 'dw.ext_tier_01_calls', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'EXT_TIER_02', productName: '外数阶梯02', month: '2025-12', quantity: 54000, unit: 'call', source: 'dw.ext_tier_02_calls', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'SPC_BUNDLE_01', productName: '特殊计费包01', month: '2025-12', quantity: 98, unit: 'gb', source: 'dw.spc_bundle_01_gb', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'SPC_BUNDLE_02', productName: '特殊计费包02', month: '2025-12', quantity: 102, unit: 'gb', source: 'dw.spc_bundle_02_gb', collectedAt: '2025-12-15T00:00:00Z' }
  ],
  'SUP-002': [
    { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_3', productName: '外数分3', month: '2025-11', quantity: 7600, unit: 'record', source: 'dw.external_part_3_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_4', productName: '外数分4', month: '2025-11', quantity: 7400, unit: 'record', source: 'dw.external_part_4_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'VERIFY_PART_3', productName: '核验分3', month: '2025-11', quantity: 4000, unit: 'record', source: 'dw.verify_part_3_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'VERIFY_PART_4', productName: '核验分4', month: '2025-11', quantity: 4200, unit: 'record', source: 'dw.verify_part_4_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_11', productName: '外数分11', month: '2025-11', quantity: 48000, unit: 'call', source: 'dw.external_part_11_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_12', productName: '外数分12', month: '2025-11', quantity: 51000, unit: 'call', source: 'dw.external_part_12_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'SPECIAL_BUNDLE', productName: '特殊计费包', month: '2025-11', quantity: 96, unit: 'gb', source: 'dw.special_bundle_gb', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_3', productName: '外数分3', month: '2025-12', quantity: 7800, unit: 'record', source: 'dw.external_part_3_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_4', productName: '外数分4', month: '2025-12', quantity: 7600, unit: 'record', source: 'dw.external_part_4_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'VERIFY_PART_3', productName: '核验分3', month: '2025-12', quantity: 4100, unit: 'record', source: 'dw.verify_part_3_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'VERIFY_PART_4', productName: '核验分4', month: '2025-12', quantity: 4300, unit: 'record', source: 'dw.verify_part_4_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_11', productName: '外数分11', month: '2025-12', quantity: 50000, unit: 'call', source: 'dw.external_part_11_calls', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_12', productName: '外数分12', month: '2025-12', quantity: 53000, unit: 'call', source: 'dw.external_part_12_calls', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'SPECIAL_BUNDLE', productName: '特殊计费包', month: '2025-12', quantity: 108, unit: 'gb', source: 'dw.special_bundle_gb', collectedAt: '2025-12-15T00:00:00Z' }
  ],
  'SUP-003': [
    { supplierId: 'SUP-003', productCode: 'MAP_TILE', productName: '地图瓦片', month: '2025-11', quantity: 12, unit: 'gb', source: 'dw.map_tile_gb', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'POI_SEARCH', productName: '地点搜索', month: '2025-11', quantity: 88000, unit: 'call', source: 'dw.poi_search_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'AD_TILE_BUNDLE', productName: '广告瓦片包', month: '2025-11', quantity: 20, unit: 'gb', source: 'dw.ad_tile_bundle_bytes', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'MAP_TILE', productName: '地图瓦片', month: '2025-12', quantity: 14, unit: 'gb', source: 'dw.map_tile_gb', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'POI_SEARCH', productName: '地点搜索', month: '2025-12', quantity: 91000, unit: 'call', source: 'dw.poi_search_calls', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'AD_TILE_BUNDLE', productName: '广告瓦片包', month: '2025-12', quantity: 22, unit: 'gb', source: 'dw.ad_tile_bundle_bytes', collectedAt: '2025-12-15T00:00:00Z' }
  ],
  'SUP-004': [
    { supplierId: 'SUP-004', productCode: 'ROUTE_PLAN', productName: '路线规划', month: '2025-11', quantity: 69000, unit: 'call', source: 'dw.route_plan_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-004', productCode: 'GEO_ENRICH', productName: '地理增强', month: '2025-11', quantity: 9400, unit: 'record', source: 'dw.geo_enrich_records', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-004', productCode: 'VIP_ROUTE_BUNDLE', productName: 'VIP路线包', month: '2025-11', quantity: 25000, unit: 'call', source: 'dw.vip_route_bundle_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-004', productCode: 'ROUTE_PLAN', productName: '路线规划', month: '2025-12', quantity: 71000, unit: 'call', source: 'dw.route_plan_calls', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-004', productCode: 'GEO_ENRICH', productName: '地理增强', month: '2025-12', quantity: 9900, unit: 'record', source: 'dw.geo_enrich_records', collectedAt: '2025-12-15T00:00:00Z' },
    { supplierId: 'SUP-004', productCode: 'VIP_ROUTE_BUNDLE', productName: 'VIP路线包', month: '2025-12', quantity: 26000, unit: 'call', source: 'dw.vip_route_bundle_calls', collectedAt: '2025-12-15T00:00:00Z' }
  ]
}

export async function getMonthlyUsageBySupplier(supplierId: string, month: string): Promise<UsageRecord[]> {
  const list = (usageMock[supplierId] || []).filter(u => u.month === month)
  return Promise.resolve(list)
}

export async function getMonthlyUsageSummary(supplierId: string, month: string): Promise<{ total: number; byUnit: Record<string, number> }> {
  const list = await getMonthlyUsageBySupplier(supplierId, month)
  const byUnit: Record<string, number> = {}
  let total = 0
  for (const u of list) {
    total += u.quantity
    byUnit[u.unit] = (byUnit[u.unit] || 0) + u.quantity
  }
  return { total, byUnit }
}
