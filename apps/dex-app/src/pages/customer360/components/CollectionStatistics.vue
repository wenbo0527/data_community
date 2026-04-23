<template>
  <div class="statistics-section">
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">{{ statistics.totalRecords }}</div>
        <div class="stat-label">总催收次数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.successRate }}%</div>
        <div class="stat-label">联系成功率</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.avgScore }}</div>
        <div class="stat-label">平均效果评分</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.totalAmount }}</div>
        <div class="stat-label">累计催收金额</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.contactSuccessCount }}</div>
        <div class="stat-label">成功联系</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.highScoreCount }}</div>
        <div class="stat-label">高分记录</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.recentRecordsCount }}</div>
        <div class="stat-label">近30天</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ statistics.promiseCount }}</div>
        <div class="stat-label">承诺还款</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatAmount } from '@/utils/formatUtils'

interface CollectionRecord {
  collectionDate?: string
  contactResult?: string
  effectiveScore?: string | number
  overdueAmount?: string | number
  promiseAmount?: string | number
  collectionMethod?: string
}

interface Props {
  records: CollectionRecord[]
}

const props = defineProps<Props>()

// 统计数据
const statistics = computed(() => {
  const records = props.records || []
  if (records.length === 0) {
    return {
      totalRecords: 0,
      successRate: 0,
      avgScore: '0.0',
      totalAmount: '¥0.00',
      contactSuccessCount: 0,
      highScoreCount: 0,
      recentRecordsCount: 0,
      promiseCount: 0
    }
  }

  // 联系成功统计
  const successCount = records.filter(r => r.contactResult === '联系成功').length
  
  // 评分统计
  const validScores = records.map(r => parseFloat(String(r.effectiveScore))).filter(score => !isNaN(score))
  const totalScore = validScores.reduce((sum, score) => sum + score, 0)
  const avgScore = validScores.length > 0 ? (totalScore / validScores.length).toFixed(1) : '0.0'
  const highScoreCount = validScores.filter(score => score >= 8).length
  
  // 金额统计
  const validAmounts = records.map(r => parseFloat(String(r.overdueAmount))).filter(amount => !isNaN(amount))
  const totalAmount = validAmounts.reduce((sum, amount) => sum + amount, 0)
  
  // 承诺还款统计
  const promiseCount = records.filter(r => r.promiseAmount && parseFloat(String(r.promiseAmount)) > 0).length
  
  // 最近记录统计（最近30天）
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentRecordsCount = records.filter(r => {
    const recordDate = new Date(r.collectionDate || '')
    return recordDate >= thirtyDaysAgo
  }).length

  return {
    totalRecords: records.length,
    successRate: records.length > 0 ? Math.round((successCount / records.length) * 100) : 0,
    avgScore,
    totalAmount: formatAmount(totalAmount),
    contactSuccessCount: successCount,
    highScoreCount,
    recentRecordsCount,
    promiseCount
  }
})
</script>

<style scoped>
.statistics-section {
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--subapp-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
