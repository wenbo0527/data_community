import { getMonthlyUsageBySupplier, UsageRecord } from '@/modules/budget/api/usage'
import { getActivePricing, Pricing } from '@/modules/budget/api/pricingArchive'

export type VerifyStatus = 'pending' | 'verified' | 'rejected'

export interface BillLine {
  lineId: string
  supplierId: string
  productCode: string
  productName: string
  unit: 'call' | 'record' | 'gb'
  unitPrice: number
  usageQty: number
  amountExclTax: number
  taxRate: number
  taxAmount: number
  amountInclTax: number
  currency: 'CNY' | 'USD'
  verifyStatus: VerifyStatus
  remark?: string
  source: string
}

function calcTieredAmount(qty: number, tiers: NonNullable<Pricing['tiers']>): number {
  let remain = qty
  let total = 0
  for (const t of tiers) {
    const upper = t.upper ?? Infinity
    const span = Math.max(0, Math.min(remain, upper - t.lower))
    if (span > 0) {
      total += span * t.price
      remain -= span
    }
    if (remain <= 0) break
  }
  // 若超出所有upper则按最后一档价格
  if (remain > 0 && tiers.length > 0) {
    const last = tiers[tiers.length - 1]
    total += remain * last.price
  }
  return total
}

function calcAmountByPricing(qty: number, pricing: Pricing): number {
  if (pricing.billingType === 'fixed' || pricing.billingType === 'volume') {
    return qty * (pricing.unitPrice || 0)
  }
  if (pricing.billingType === 'tiered' && pricing.tiers?.length) {
    return calcTieredAmount(qty, pricing.tiers)
  }
  return qty * (pricing.unitPrice || 0)
}

export async function generateBillLines(supplierId: string, month: string): Promise<BillLine[]> {
  const usage: UsageRecord[] = await getMonthlyUsageBySupplier(supplierId, month)
  const lines: BillLine[] = []
  for (const u of usage) {
    const pricing = await getActivePricing(supplierId, u.productCode)
    if (!pricing) continue
    const amountExclTax = Number(calcAmountByPricing(u.quantity, pricing).toFixed(2))
    const taxAmount = Number((amountExclTax * pricing.taxRate).toFixed(2))
    const amountInclTax = Number((amountExclTax + taxAmount).toFixed(2))
    lines.push({
      lineId: `${supplierId}-${u.productCode}-${month}`,
      supplierId,
      productCode: u.productCode,
      productName: u.productName,
      unit: pricing.unit,
      unitPrice: Number((pricing.unitPrice ?? 0).toFixed(6)),
      usageQty: u.quantity,
      amountExclTax,
      taxRate: pricing.taxRate,
      taxAmount,
      amountInclTax,
      currency: pricing.currency,
      verifyStatus: 'pending',
      remark: '',
      source: u.source
    })
  }
  return lines
}

