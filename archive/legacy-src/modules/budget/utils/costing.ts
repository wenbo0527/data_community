import { getMonthlyUsageBySupplier } from '@/modules/budget/api/usage'
import type { UsageRecord } from '@/modules/budget/api/usage'
import { getActivePricing } from '@/modules/budget/api/pricingArchive'
import type { Pricing } from '@/modules/budget/api/pricingArchive'

export type VerifyStatus = 'pending' | 'verified' | 'rejected'

export interface BillLine {
  lineId: string
  supplierId: string
  productCode: string
  productName: string
  unit: 'call' | 'record' | 'gb'
  unitPrice: number
  usageQty: number
  chargeQty: number
  freeQuota?: number
  freeDeducted?: number
  freeValidStart?: string
  freeValidEnd?: string
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
    const last = tiers[tiers.length - 1]!
    total += remain * last.price
  }
  return total
}

function calcAmountByPricing(qty: number, pricing: Pricing): number {
  if (pricing.billingType === 'special') {
    return 0
  }
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
  const monthDate = new Date(`${month}-01T00:00:00Z`)
  const { useContractStore } = await import('@/modules/budget/stores/contract')
  const contractStore = useContractStore()
  for (const u of usage) {
    const pricing = await getActivePricing(supplierId, u.productCode)
    if (!pricing) continue
    const cfg = contractStore.getPricing?.(u.productCode) || {}
    const startStr = cfg?.freeQuotaStart
    const endStr = cfg?.freeQuotaEnd
    const valid = !!startStr && !!endStr && (() => {
      const st = new Date(startStr as string)
      const ed = new Date(endStr as string)
      return monthDate.getTime() >= st.getTime() && monthDate.getTime() <= ed.getTime()
    })()
    const freeQuota = valid ? Number(cfg?.freeQuotaValue || 0) : 0
    const freeDeducted = Math.min(Number(u.quantity || 0), freeQuota)
    const chargeQty = Math.max(0, Number(u.quantity || 0) - freeDeducted)
    const amountExclTax = Number(calcAmountByPricing(chargeQty, pricing).toFixed(2))
    const taxAmount = pricing.billingType === 'special' ? 0 : Number((amountExclTax * pricing.taxRate).toFixed(2))
    const amountInclTax = pricing.billingType === 'special' ? 0 : Number((amountExclTax + taxAmount).toFixed(2))
    lines.push({
      lineId: `${supplierId}-${u.productCode}-${month}`,
      supplierId,
      productCode: u.productCode,
      productName: u.productName,
      unit: pricing.unit,
      unitPrice: Number((pricing.unitPrice ?? 0).toFixed(6)),
      usageQty: u.quantity,
      chargeQty,
      freeQuota,
      freeDeducted,
      freeValidStart: valid ? startStr as string : undefined,
      freeValidEnd: valid ? endStr as string : undefined,
      amountExclTax,
      taxRate: pricing.taxRate,
      taxAmount,
      amountInclTax,
      currency: pricing.currency,
      verifyStatus: 'pending',
      remark: pricing.billingType === 'special' ? (pricing.remark || '特殊计费，需人工填写金额') : '',
      source: u.source
    })
  }
  return lines
}
