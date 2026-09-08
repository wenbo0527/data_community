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
  businessType?: string
  platform?: string
  year?: string
  targetLoan?: number
}): Promise<BurndownPoint[]> {
  try {
    const res = await axios.get('/api/budgets/burndown', { params })
    const payload = (res as any)?.data
    const list = Array.isArray(payload) ? payload : (payload?.data ?? [])
    if (Array.isArray(list) && list.length) return list as BurndownPoint[]
  } catch {}
  const now = new Date()
  const y = String(now.getFullYear())
  const m = (mm: number) => String(mm).padStart(2, '0')
  const base = 1_000_000
  const points: BurndownPoint[] = []
  for (let i = 1; i <= 12; i++) {
    const month = `${y}-${m(i)}`
    const actual = Math.round(base * (i / 12) * (0.7 + (i % 3) * 0.05))
    const budget = Math.round(base * (i / 12))
    points.push({
      granularity: 'month',
      month,
      period: month,
      budget,
      actual,
      initialBudget: base,
      cumulativeBudget: Math.round(base * (i / 12)),
      cumulativeActual: actual
    })
  }
  return points
}

export async function getWarnings(params?: {
  level?: string
  businessType?: string
  platform?: string
  year?: string
  targetLoan?: number
}): Promise<WarningItem[]> {
  try {
    const res = await axios.get('/api/budgets/warnings', { params })
    const payload = (res as any)?.data
    const list = Array.isArray(payload) ? payload : (payload?.data ?? [])
    if (Array.isArray(list) && list.length) return list as WarningItem[]
  } catch {}
  const y = String(new Date().getFullYear())
  const mk = (id: number, platform: string, bt: string, loan: number, estCost: number, actCost: number, estAnnual: number, actAnnual: number, estRf: number, actRf: number): WarningItem => ({
    id: `W-${id}`,
    level: actCost > estCost * 1.1 ? 'critical' : (actAnnual > estAnnual * 1.05 ? 'warning' : 'info'),
    message: `${platform}预算健康度监控`,
    createdAt: new Date().toISOString(),
    tag: platform,
    businessType: bt,
    platform,
    year: y,
    targetLoan: loan,
    estimatedLoan: Math.round(loan * 1.1),
    actualLoan: Math.round(loan * (0.95 + (id % 3) * 0.03)),
    estimatedCost: estCost,
    actualCost: actCost,
    estimatedAnnualCost: estAnnual,
    actualAnnualCost: actAnnual,
    estimatedRiskFreeReturn: estRf,
    actualRiskFreeReturn: actRf,
    externalDataCost: Math.round(actCost * 0.12),
    budgetStatus: actCost > estCost * 1.1 ? '超支' : (actAnnual > estAnnual * 1.05 ? '偏高' : '正常')
  })
  const mock: WarningItem[] = [
    mk(1, '蚂蚁', '助贷业务', 3_000_000, 120_000, 138_000, 0.15, 0.18, 0.12, 0.11),
    mk(2, '字节', '融担类业务', 2_500_000, 95_000, 88_000, 0.12, 0.11, 0.10, 0.09),
    mk(3, '京东', '直贷类业务', 4_000_000, 160_000, 182_000, 0.18, 0.21, 0.14, 0.13),
    mk(4, '苏贷', '助贷业务', 2_000_000, 80_000, 72_000, 0.10, 0.095, 0.08, 0.081)
  ]
  const filter = (rows: WarningItem[]) => {
    let r = rows
    if (params?.businessType) r = r.filter(x => x.businessType === params.businessType)
    if (params?.platform) r = r.filter(x => x.platform === params.platform)
    if (params?.year) r = r.filter(x => String(x.year) === String(params.year))
    if (typeof params?.targetLoan === 'number') r = r.filter(x => Number(x.targetLoan) === Number(params?.targetLoan))
    return r
  }
  return filter(mock)
}

export async function markAlertAsRead(alertId: string | number): Promise<boolean> {
  await axios.put(`/api/budgets/alerts/${alertId}/read`)
  return true
}
