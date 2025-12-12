export interface Pricing {
  supplierId: string
  productCode: string
  billingType: 'fixed' | 'tiered' | 'volume'
  unit: 'call' | 'record' | 'gb'
  currency: 'CNY' | 'USD'
  unitPrice?: number
  taxRate: number
  tiers?: Array<{ lower: number; upper?: number; price: number }>
}

const pricingMock: Pricing[] = [
  // SUP-001 美团
  { supplierId: 'SUP-001', productCode: 'POI_SEARCH', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 50000, price: 0.005 }, { lower: 50000, upper: 100000, price: 0.004 }, { lower: 100000, price: 0.0035 } ] },
  { supplierId: 'SUP-001', productCode: 'ROUTE_PLAN', billingType: 'fixed', unit: 'call', currency: 'CNY', taxRate: 0.06, unitPrice: 0.006 },
  { supplierId: 'SUP-001', productCode: 'GEO_ENRICH', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.08 },

  // SUP-002 滴滴
  { supplierId: 'SUP-002', productCode: 'TRAFFIC_FEED', billingType: 'fixed', unit: 'gb', currency: 'CNY', taxRate: 0.06, unitPrice: 80 },
  { supplierId: 'SUP-002', productCode: 'RIDE_STATS', billingType: 'volume', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },

  // SUP-003 百度
  { supplierId: 'SUP-003', productCode: 'MAP_TILE', billingType: 'fixed', unit: 'gb', currency: 'CNY', taxRate: 0.06, unitPrice: 120 },
  { supplierId: 'SUP-003', productCode: 'POI_SEARCH', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 30000, price: 0.0045 }, { lower: 30000, upper: 80000, price: 0.004 }, { lower: 80000, price: 0.0036 } ] },

  // SUP-004 高德
  { supplierId: 'SUP-004', productCode: 'ROUTE_PLAN', billingType: 'fixed', unit: 'call', currency: 'CNY', taxRate: 0.06, unitPrice: 0.0055 },
  { supplierId: 'SUP-004', productCode: 'GEO_ENRICH', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.075 }
]

export async function getActivePricing(supplierId: string, productCode: string): Promise<Pricing | null> {
  const found = pricingMock.find(p => p.supplierId === supplierId && p.productCode === productCode) || null
  return Promise.resolve(found)
}

export async function getActivePricingMap(supplierId: string): Promise<Record<string, Pricing>> {
  const map: Record<string, Pricing> = {}
  for (const p of pricingMock) {
    if (p.supplierId === supplierId) map[p.productCode] = p
  }
  return Promise.resolve(map)
}

