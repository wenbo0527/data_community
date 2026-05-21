// 预算预警规则组合式函数
// 提供基础预警：余额不足、超预算
import { ref } from 'vue'

export type AlertLevel = 'info' | 'warning' | 'critical'

export interface AlertRecord {
  id: string
  title: string
  level: AlertLevel
  content: string
  relatedId?: string | number
  createdAt: Date
}

export interface BudgetLike {
  id: string | number
  budgetName?: string
  totalAmount?: number
  usedAmount?: number
  remainingAmount?: number
}

export function useWarningRules() {
  const rules = ref([
    {
      id: 'budget-insufficient',
      name: '预算余额不足',
      level: 'critical' as AlertLevel,
      check: (b: BudgetLike) => {
        const total = Number(b.totalAmount ?? 0)
        const remaining = Number(b.remainingAmount ?? Math.max(0, total - Number(b.usedAmount ?? 0)))
        return total > 0 && remaining < total * 0.1
      },
      makeMessage: (b: BudgetLike) => `预算余额不足：${b.budgetName || b.id} 剩余 ¥${Number(b.remainingAmount ?? 0).toLocaleString()}`
    },
    {
      id: 'budget-overrun',
      name: '超预算',
      level: 'critical' as AlertLevel,
      check: (b: BudgetLike) => {
        const total = Number(b.totalAmount ?? 0)
        const used = Number(b.usedAmount ?? 0)
        return total > 0 && used > total
      },
      makeMessage: (b: BudgetLike) => `超预算警告：${b.budgetName || b.id} 已使用 ¥${Number(b.usedAmount ?? 0).toLocaleString()}`
    }
  ])

  const checkBudgetWarnings = (budget: BudgetLike): AlertRecord[] => {
    const alerts: AlertRecord[] = []
    rules.value.forEach((rule) => {
      if (rule.check(budget)) {
        alerts.push({
          id: `${rule.id}_${budget.id}`,
          title: rule.name,
          level: rule.level,
          content: rule.makeMessage(budget),
          relatedId: budget.id,
          createdAt: new Date()
        })
      }
    })
    return alerts
  }

  return { rules, checkBudgetWarnings }
}