export interface Pricing {
  supplierId: string
  productCode: string
  billingType: 'fixed' | 'tiered' | 'volume' | 'special'
  unit: 'call' | 'record' | 'gb'
  currency: 'CNY' | 'USD'
  unitPrice?: number
  taxRate: number
  tiers?: Array<{ lower: number; upper?: number; price: number }>
  formula?: 'manual' | 'capped' | 'bundled'
  remark?: string
}

const pricingMock: Pricing[] = [
  { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_1', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_2', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'VERIFY_PART_1', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.08 },
  { supplierId: 'SUP-001', productCode: 'VERIFY_PART_2', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.08 },
  { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_3', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_4', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_5', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_6', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_7', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 50000, price: 0.005 }, { lower: 50000, upper: 120000, price: 0.004 }, { lower: 120000, price: 0.0035 } ] },
  { supplierId: 'SUP-001', productCode: 'EXTERNAL_PART_8', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 30000, price: 0.006 }, { lower: 30000, upper: 90000, price: 0.005 }, { lower: 90000, price: 0.0045 } ] },
  { supplierId: 'SUP-001', productCode: 'SPECIAL_BUNDLE', billingType: 'special', unit: 'gb', currency: 'CNY', taxRate: 0.06, formula: 'manual', remark: '特殊计费包，按合同约定收费' },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_01', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_02', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_03', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_04', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_05', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_06', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_07', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_08', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_09', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_10', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_11', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_12', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_13', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_14', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_15', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_16', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_17', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_18', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_19', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_20', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_21', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_22', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_23', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_24', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_25', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_26', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_27', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_28', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_29', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_30', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.055 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_31', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_32', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_33', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_34', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_35', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_36', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_37', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_38', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_39', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_FIX_40', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.065 },
  { supplierId: 'SUP-001', productCode: 'EXT_TIER_01', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 40000, price: 0.006 }, { lower: 40000, upper: 100000, price: 0.005 }, { lower: 100000, price: 0.0045 } ] },
  { supplierId: 'SUP-001', productCode: 'EXT_TIER_02', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 50000, price: 0.0055 }, { lower: 50000, upper: 120000, price: 0.0046 }, { lower: 120000, price: 0.004 } ] },
  { supplierId: 'SUP-001', productCode: 'EXT_TIER_03', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 30000, price: 0.0065 }, { lower: 30000, upper: 90000, price: 0.0056 }, { lower: 90000, price: 0.0048 } ] },
  { supplierId: 'SUP-001', productCode: 'EXT_TIER_04', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 60000, price: 0.005 }, { lower: 60000, upper: 130000, price: 0.0044 }, { lower: 130000, price: 0.0039 } ] },
  { supplierId: 'SUP-001', productCode: 'EXT_TIER_05', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 45000, price: 0.0058 }, { lower: 45000, upper: 110000, price: 0.0049 }, { lower: 110000, price: 0.0043 } ] },
  { supplierId: 'SUP-001', productCode: 'EXT_TIER_06', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 55000, price: 0.0052 }, { lower: 55000, upper: 125000, price: 0.0045 }, { lower: 125000, price: 0.0041 } ] },
  { supplierId: 'SUP-001', productCode: 'EXT_TIER_07', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 35000, price: 0.0062 }, { lower: 35000, upper: 95000, price: 0.0053 }, { lower: 95000, price: 0.0046 } ] },
  { supplierId: 'SUP-001', productCode: 'EXT_TIER_08', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 70000, price: 0.0049 }, { lower: 70000, upper: 140000, price: 0.0043 }, { lower: 140000, price: 0.0039 } ] },
  { supplierId: 'SUP-001', productCode: 'SPC_BUNDLE_01', billingType: 'special', unit: 'gb', currency: 'CNY', taxRate: 0.06, formula: 'manual', remark: '特殊计费包01，按合同约定收费' },
  { supplierId: 'SUP-001', productCode: 'SPC_BUNDLE_02', billingType: 'special', unit: 'gb', currency: 'CNY', taxRate: 0.06, formula: 'manual', remark: '特殊计费包02，按合同约定收费' },

  { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_3', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_4', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.06 },
  { supplierId: 'SUP-002', productCode: 'VERIFY_PART_3', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.08 },
  { supplierId: 'SUP-002', productCode: 'VERIFY_PART_4', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.08 },
  { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_9', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_10', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_13', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_14', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.05 },
  { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_11', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 40000, price: 0.0055 }, { lower: 40000, upper: 100000, price: 0.0048 }, { lower: 100000, price: 0.0042 } ] },
  { supplierId: 'SUP-002', productCode: 'EXTERNAL_PART_12', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 60000, price: 0.0048 }, { lower: 60000, upper: 120000, price: 0.0042 }, { lower: 120000, price: 0.0038 } ] },
  { supplierId: 'SUP-002', productCode: 'SPECIAL_BUNDLE', billingType: 'special', unit: 'gb', currency: 'CNY', taxRate: 0.06, formula: 'manual', remark: '特殊计费包，按合同约定收费' },

  // SUP-003 百度
  { supplierId: 'SUP-003', productCode: 'MAP_TILE', billingType: 'fixed', unit: 'gb', currency: 'CNY', taxRate: 0.06, unitPrice: 120 },
  { supplierId: 'SUP-003', productCode: 'POI_SEARCH', billingType: 'tiered', unit: 'call', currency: 'CNY', taxRate: 0.06, tiers: [ { lower: 0, upper: 30000, price: 0.0045 }, { lower: 30000, upper: 80000, price: 0.004 }, { lower: 80000, price: 0.0036 } ] },
  { supplierId: 'SUP-003', productCode: 'AD_TILE_BUNDLE', billingType: 'special', unit: 'gb', currency: 'CNY', taxRate: 0.06, formula: 'manual', remark: '广告瓦片整包，按投放合约约定' },

  // SUP-004 高德
  { supplierId: 'SUP-004', productCode: 'ROUTE_PLAN', billingType: 'fixed', unit: 'call', currency: 'CNY', taxRate: 0.06, unitPrice: 0.0055 },
  { supplierId: 'SUP-004', productCode: 'GEO_ENRICH', billingType: 'fixed', unit: 'record', currency: 'CNY', taxRate: 0.06, unitPrice: 0.075 },
  { supplierId: 'SUP-004', productCode: 'VIP_ROUTE_BUNDLE', billingType: 'special', unit: 'call', currency: 'CNY', taxRate: 0.06, formula: 'manual', remark: 'VIP路线包量方案，特殊合约' },

  // 示例：特殊计费（合同约定，需人工填入）
  { supplierId: 'SUP-001', productCode: 'SPECIAL_BUNDLE', billingType: 'special', unit: 'gb', currency: 'CNY', taxRate: 0.06, formula: 'manual', remark: '按合同约定单次包量收费，需手动填写' }
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
