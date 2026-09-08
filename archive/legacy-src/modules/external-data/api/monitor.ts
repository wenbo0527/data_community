import axios from 'axios'

export interface BurndownPoint {
  granularity?: 'month' | 'quarter'
  month?: string
  period?: string
  budget?: number
  actual?: number
  initialBudget?: number
  cumulativeBudget?: number
  cumulativeActual?: number
}

export interface WarningItem {
  id: string | number
  level: 'info' | 'warning' | 'critical'
  message: string
  createdAt?: string
  tag?: string
  businessType?: string
  platform?: string
  year?: string | number
  targetLoan?: number
  estimatedLoan?: number
  actualLoan?: number
  estimatedCost?: number
  actualCost?: number
  estimatedAnnualCost?: number
  actualAnnualCost?: number
  estimatedRiskFreeReturn?: number
  actualRiskFreeReturn?: number
  externalDataCost?: number
  budgetStatus?: string
}

export async function getBurndown(params?: {
  range?: 'month' | 'quarter'
  productId?: string | number
  businessType?: string
  platform?: string
  year?: string
  targetLoan?: number
}): Promise<BurndownPoint[]> {
  const res = await axios.get('/api/external-data/burndown', { params })
  const payload = (res as any)?.data
  const list = Array.isArray(payload) ? payload : (payload?.data ?? [])
  return (list ?? []) as BurndownPoint[]
}

export async function getWarnings(params?: {
  level?: string
  productId?: string | number
  businessType?: string
  platform?: string
  year?: string
  targetLoan?: number
}): Promise<WarningItem[]> {
  const res = await axios.get('/api/external-data/warning', { params })
  const payload = (res as any)?.data
  const list = Array.isArray(payload) ? payload : (payload?.data ?? [])
  return (list ?? []) as WarningItem[]
}
