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
}

export async function getBurndown(params?: {
  range?: 'month' | 'quarter'
  businessType?: string
  platform?: string
  year?: string
  targetLoan?: number
}): Promise<BurndownPoint[]> {
  const res = await axios.get('/api/budgets/burndown', { params })
  const payload = (res as any)?.data
  const list = Array.isArray(payload) ? payload : (payload?.data ?? [])
  return (list ?? []) as BurndownPoint[]
}

export async function getWarnings(params?: {
  level?: string
  businessType?: string
  platform?: string
  year?: string
  targetLoan?: number
}): Promise<WarningItem[]> {
  const res = await axios.get('/api/budgets/warnings', { params })
  const payload = (res as any)?.data
  const list = Array.isArray(payload) ? payload : (payload?.data ?? [])
  return (list ?? []) as WarningItem[]
}

export async function markAlertAsRead(alertId: string | number): Promise<boolean> {
  await axios.put(`/api/budgets/alerts/${alertId}/read`)
  return true
}
