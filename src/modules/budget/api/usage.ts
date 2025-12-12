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
    { supplierId: 'SUP-001', productCode: 'POI_SEARCH', productName: '地点搜索', month: '2025-11', quantity: 125000, unit: 'call', source: 'dw.poi_search_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'ROUTE_PLAN', productName: '路线规划', month: '2025-11', quantity: 52000, unit: 'call', source: 'dw.route_plan_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-001', productCode: 'GEO_ENRICH', productName: '地理增强', month: '2025-11', quantity: 7800, unit: 'record', source: 'dw.geo_enrich_records', collectedAt: '2025-12-01T00:00:00Z' }
  ],
  'SUP-002': [
    { supplierId: 'SUP-002', productCode: 'TRAFFIC_FEED', productName: '交通流量', month: '2025-11', quantity: 3100, unit: 'gb', source: 'dw.traffic_feed_bytes', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-002', productCode: 'RIDE_STATS', productName: '出行统计', month: '2025-11', quantity: 46000, unit: 'record', source: 'dw.ride_stats_records', collectedAt: '2025-12-01T00:00:00Z' }
  ],
  'SUP-003': [
    { supplierId: 'SUP-003', productCode: 'MAP_TILE', productName: '地图瓦片', month: '2025-11', quantity: 12, unit: 'gb', source: 'dw.map_tile_gb', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-003', productCode: 'POI_SEARCH', productName: '地点搜索', month: '2025-11', quantity: 88000, unit: 'call', source: 'dw.poi_search_calls', collectedAt: '2025-12-01T00:00:00Z' }
  ],
  'SUP-004': [
    { supplierId: 'SUP-004', productCode: 'ROUTE_PLAN', productName: '路线规划', month: '2025-11', quantity: 69000, unit: 'call', source: 'dw.route_plan_calls', collectedAt: '2025-12-01T00:00:00Z' },
    { supplierId: 'SUP-004', productCode: 'GEO_ENRICH', productName: '地理增强', month: '2025-11', quantity: 9400, unit: 'record', source: 'dw.geo_enrich_records', collectedAt: '2025-12-01T00:00:00Z' }
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

