// 预算计算组合式函数
// 提供执行率、偏差率、增长率与健康度评分等计算逻辑
import { computed } from 'vue'

export function useBudgetCalculations() {
  const calculateExecutionRate = (used: number, total: number): number => {
    if (!isFinite(total) || total <= 0) return 0
    return Number(((used / total) * 100).toFixed(2))
  }

  const calculateVarianceRate = (actual: number, planned: number): number => {
    if (!isFinite(planned) || planned <= 0) return 0
    return Number((((actual - planned) / planned) * 100).toFixed(2))
  }

  const calculateGrowthRate = (current: number, previous: number): number => {
    if (!isFinite(previous) || previous <= 0) return 0
    return Number((((current - previous) / previous) * 100).toFixed(2))
  }

  // 简化版健康度评分：结合执行率与剩余比例
  const calculateHealthScore = (usedAmount: number, totalAmount: number): number => {
    const executionRate = calculateExecutionRate(usedAmount, totalAmount)
    const remainingRatio = totalAmount > 0 ? (totalAmount - usedAmount) / totalAmount : 1

    let score = 100
    // 执行率评分（理想执行率 70-90%）
    if (executionRate > 90) score -= 20
    else if (executionRate < 70) score -= (70 - executionRate) * 0.5

    // 剩余预算评分
    if (remainingRatio < 0.1) score -= 30
    else if (remainingRatio < 0.2) score -= 10

    return Math.max(0, Math.min(100, Number(score.toFixed(2))))
  }

  return {
    calculateExecutionRate,
    calculateVarianceRate,
    calculateGrowthRate,
    calculateHealthScore
  }
}

// 汇总统计的辅助函数
export function useBudgetStatsAggregator(list: Array<{ targetLoan: number; estimatedLoan: number }>) {
  const totalBudget = computed(() => list.reduce((sum, i) => sum + (Number(i.targetLoan) || 0), 0))
  const usedBudget = computed(() => list.reduce((sum, i) => sum + (Number(i.estimatedLoan) || 0), 0))
  const remainingBudget = computed(() => totalBudget.value - usedBudget.value)
  const executionRate = computed(() => {
    if (totalBudget.value <= 0) return 0
    return Number(((usedBudget.value / totalBudget.value) * 100).toFixed(2))
  })

  return { totalBudget, usedBudget, remainingBudget, executionRate }
}

// 根据总额生成简单的月度燃尽数据（线性分配）
export function buildMonthlyBurndown(totalBudget: number, usedBudget: number) {
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const monthlyBudgetDecrease = totalBudget / months.length
  const monthlyActualDecrease = usedBudget / months.length

  const initialBudget = totalBudget
  const initialActual = usedBudget

  return months.map((m, idx) => {
    const budgetRemaining = Math.max(0, initialBudget - monthlyBudgetDecrease * (idx + 1))
    const actualRemaining = Math.max(0, initialActual - monthlyActualDecrease * (idx + 1))
    return {
      granularity: 'month',
      month: m,
      budget: budgetRemaining,
      actual: actualRemaining,
      initialBudget
    }
  })
}