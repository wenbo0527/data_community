/**
 * Daily Funnel Mock Data（每日漏斗快照）
 * 用途：近 7 天每日漏斗快照 mock（含 4 阶段 + 转化率）
 * 来源：TASK-20260717-2FFA5BCA · 候选 #235 dev 范围 · PM A' 拍板 23:00 CST
 * 消费方：@/api/marketing.ts + @/mock/marketing/index.ts 聚合
 * 边界：纯前端 demo；recentDates 动态生成近 7 天
 */
import type { DailyFunnel } from '@/types/marketing'

/** 生成近 7 天日期 (含今日) */
const recentDates = (): string[] => {
  const dates: string[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().substring(0, 10))
  }
  return dates
}

export const mockDailyFunnel: DailyFunnel[] = recentDates().map((date, idx) => ({
  date,
  stage1Visitors: 10000 + idx * 850,
  stage2Visitors: 6500 + idx * 520,
  stage3Visitors: 4200 + idx * 380,
  stage4Visitors: 1850 + idx * 165,
  conversionRate: 0.185 + idx * 0.003,
}))

export default mockDailyFunnel