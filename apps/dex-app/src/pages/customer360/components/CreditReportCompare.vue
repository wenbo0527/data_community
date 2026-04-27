<template>
  <div class="credit-report-compare">
    <!-- 顶部导航 -->
    <div class="compare-nav">
      <a-button type="text" size="small" @click="$emit('back')">
        <template #icon><IconLeft /></template>
        返回
      </a-button>
      <div class="nav-title">
        <IconSwap class="nav-icon" />
        <span>报告对比</span>
      </div>
      <div class="nav-spacer"></div>
    </div>

    <!-- 报告选择器 -->
    <div class="report-selector">
      <div class="selector-card" :class="{ active: selectedIndex === 0 }" @click="selectedIndex = 0">
        <div class="selector-label">报告 A</div>
        <div class="selector-date">{{ reportA.queryDate }}</div>
        <div class="selector-score">{{ reportA.creditScore }}分</div>
        <a-tag :color="getLevelColor(reportA.creditLevel)" size="small">
          {{ reportA.creditLevel }}级
        </a-tag>
      </div>
      <div class="selector-vs">VS</div>
      <div class="selector-card" :class="{ active: selectedIndex === 1 }" @click="selectedIndex = 1">
        <div class="selector-label">报告 B</div>
        <div class="selector-date">{{ reportB.queryDate }}</div>
        <div class="selector-score">{{ reportB.creditScore }}分</div>
        <a-tag :color="getLevelColor(reportB.creditLevel)" size="small">
          {{ reportB.creditLevel }}级
        </a-tag>
      </div>
    </div>

    <!-- 对比内容 -->
    <div class="compare-content">
      
      <!-- 核心指标对比 -->
      <div class="compare-section">
        <div class="section-title">
          <IconBarChart class="section-icon" />
          核心指标对比
        </div>
        <div class="indicator-cards">
          <!-- 信用评分 -->
          <div class="indicator-card">
            <div class="indicator-header">
              <span class="indicator-name">信用评分</span>
              <span class="indicator-change" :class="getScoreChangeClass">
                {{ getScoreChangeText }}
              </span>
            </div>
            <div class="indicator-values">
              <div class="indicator-value-box">
                <span class="value">{{ reportA.creditScore }}</span>
                <span class="label">{{ reportA.queryDate }}</span>
              </div>
              <div class="indicator-arrow">
                <span class="arrow-icon">{{ getScoreChangeIcon }}</span>
              </div>
              <div class="indicator-value-box">
                <span class="value">{{ reportB.creditScore }}</span>
                <span class="label">{{ reportB.queryDate }}</span>
              </div>
            </div>
          </div>

          <!-- 负债率 -->
          <div class="indicator-card">
            <div class="indicator-header">
              <span class="indicator-name">负债率</span>
              <span class="indicator-change" :class="getUtilizationChangeClass">
                {{ getUtilizationChangeText }}
              </span>
            </div>
            <div class="indicator-values">
              <div class="indicator-value-box">
                <span class="value">{{ reportA.creditOverview?.creditUtilizationRate || 0 }}%</span>
                <span class="label">{{ reportA.queryDate }}</span>
              </div>
              <div class="indicator-arrow">
                <span class="arrow-icon">{{ getUtilizationChangeIcon }}</span>
              </div>
              <div class="indicator-value-box">
                <span class="value">{{ reportB.creditOverview?.creditUtilizationRate || 0 }}%</span>
                <span class="label">{{ reportB.queryDate }}</span>
              </div>
            </div>
          </div>

          <!-- 逾期次数 -->
          <div class="indicator-card">
            <div class="indicator-header">
              <span class="indicator-name">逾期次数</span>
              <span class="indicator-change" :class="getOverdueChangeClass">
                {{ getOverdueChangeText }}
              </span>
            </div>
            <div class="indicator-values">
              <div class="indicator-value-box">
                <span class="value">{{ reportA.overdueInfo?.overdueCount || 0 }}次</span>
                <span class="label">{{ reportA.queryDate }}</span>
              </div>
              <div class="indicator-arrow">
                <span class="arrow-icon">{{ getOverdueChangeIcon }}</span>
              </div>
              <div class="indicator-value-box">
                <span class="value">{{ reportB.overdueInfo?.overdueCount || 0 }}次</span>
                <span class="label">{{ reportB.queryDate }}</span>
              </div>
            </div>
          </div>

          <!-- 总授信额度 -->
          <div class="indicator-card">
            <div class="indicator-header">
              <span class="indicator-name">总授信额度</span>
            </div>
            <div class="indicator-values">
              <div class="indicator-value-box">
                <span class="value">{{ formatAmount(reportA.creditOverview?.totalCreditLimit) }}</span>
                <span class="label">{{ reportA.queryDate }}</span>
              </div>
              <div class="indicator-arrow neutral">
                <span class="arrow-icon">→</span>
              </div>
              <div class="indicator-value-box">
                <span class="value">{{ formatAmount(reportB.creditOverview?.totalCreditLimit) }}</span>
                <span class="label">{{ reportB.queryDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细对比 -->
      <div class="compare-section">
        <div class="section-title">
          <IconFile class="section-icon" />
          详细数据对比
        </div>
        <a-collapse v-model:active-keys="detailActiveKeys" class="detail-collapse">
          
          <!-- 信贷账户对比 -->
          <a-collapse-item key="overview" header="📈 信贷账户">
            <div class="detail-table">
              <div class="detail-row header">
                <span class="detail-cell">指标</span>
                <span class="detail-cell">{{ reportA.queryDate }}</span>
                <span class="detail-cell">{{ reportB.queryDate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">信用卡账户</span>
                <span class="detail-cell">{{ reportA.creditOverview?.creditCardAccounts || 0 }}</span>
                <span class="detail-cell">{{ reportB.creditOverview?.creditCardAccounts || 0 }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">贷款账户</span>
                <span class="detail-cell">{{ reportA.creditOverview?.loanAccounts || 0 }}</span>
                <span class="detail-cell">{{ reportB.creditOverview?.loanAccounts || 0 }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">总授信额度</span>
                <span class="detail-cell">{{ formatAmount(reportA.creditOverview?.totalCreditLimit) }}</span>
                <span class="detail-cell">{{ formatAmount(reportB.creditOverview?.totalCreditLimit) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">已用额度</span>
                <span class="detail-cell">{{ formatAmount(reportA.creditOverview?.usedCredit) }}</span>
                <span class="detail-cell">{{ formatAmount(reportB.creditOverview?.usedCredit) }}</span>
              </div>
            </div>
          </a-collapse-item>

          <!-- 逾期信息对比 -->
          <a-collapse-item key="overdue" header="⚠️ 逾期与风险">
            <div class="detail-table">
              <div class="detail-row header">
                <span class="detail-cell">指标</span>
                <span class="detail-cell">{{ reportA.queryDate }}</span>
                <span class="detail-cell">{{ reportB.queryDate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">逾期次数</span>
                <span class="detail-cell" :class="getCellClass(reportA.overdueInfo?.overdueCount, reportB.overdueInfo?.overdueCount, true)">
                  {{ reportA.overdueInfo?.overdueCount || 0 }}次
                </span>
                <span class="detail-cell" :class="getCellClass(reportB.overdueInfo?.overdueCount, reportA.overdueInfo?.overdueCount, true)">
                  {{ reportB.overdueInfo?.overdueCount || 0 }}次
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">最长逾期天数</span>
                <span class="detail-cell" :class="getCellClass(reportA.overdueInfo?.maxOverdueDays, reportB.overdueInfo?.maxOverdueDays, true)">
                  {{ reportA.overdueInfo?.maxOverdueDays || 0 }}天
                </span>
                <span class="detail-cell" :class="getCellClass(reportB.overdueInfo?.maxOverdueDays, reportA.overdueInfo?.maxOverdueDays, true)">
                  {{ reportB.overdueInfo?.maxOverdueDays || 0 }}天
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">当前逾期笔数</span>
                <span class="detail-cell" :class="getCellClass(reportA.overdueInfo?.currentOverdueCount, reportB.overdueInfo?.currentOverdueCount, true)">
                  {{ reportA.overdueInfo?.currentOverdueCount || 0 }}笔
                </span>
                <span class="detail-cell" :class="getCellClass(reportB.overdueInfo?.currentOverdueCount, reportA.overdueInfo?.currentOverdueCount, true)">
                  {{ reportB.overdueInfo?.currentOverdueCount || 0 }}笔
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">逾期金额</span>
                <span class="detail-cell">{{ formatAmount(reportA.overdueInfo?.overdueAmount) }}</span>
                <span class="detail-cell">{{ formatAmount(reportB.overdueInfo?.overdueAmount) }}</span>
              </div>
            </div>
          </a-collapse-item>

          <!-- 查询记录对比 -->
          <a-collapse-item key="query" header="🔍 查询记录">
            <div class="detail-table">
              <div class="detail-row header">
                <span class="detail-cell">指标</span>
                <span class="detail-cell">{{ reportA.queryDate }}</span>
                <span class="detail-cell">{{ reportB.queryDate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">总查询次数</span>
                <span class="detail-cell">{{ reportA.queryRecords?.totalQueryCount || 0 }}</span>
                <span class="detail-cell">{{ reportB.queryRecords?.totalQueryCount || 0 }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-cell">近3个月查询</span>
                <span class="detail-cell">{{ reportA.queryRecords?.queriesLast3Months || 0 }}</span>
                <span class="detail-cell">{{ reportB.queryRecords?.queriesLast3Months || 0 }}</span>
              </div>
            </div>
          </a-collapse-item>

          <!-- 特殊标注对比 -->
          <a-collapse-item key="special" header="📋 特殊标注">
            <div class="special-compare">
              <div class="special-col">
                <div class="special-col-title">{{ reportA.queryDate }}</div>
                <div v-if="reportA.specialNotes?.length" class="special-list">
                  <div v-for="(note, i) in reportA.specialNotes" :key="i" class="special-item" :class="note.type">
                    <a-tag :color="note.type === 'warning' ? 'orange' : 'blue'" size="small">
                      {{ note.label }}
                    </a-tag>
                    <span>{{ note.description }}</span>
                  </div>
                </div>
                <div v-else class="no-special">无特殊标注</div>
              </div>
              <div class="special-col">
                <div class="special-col-title">{{ reportB.queryDate }}</div>
                <div v-if="reportB.specialNotes?.length" class="special-list">
                  <div v-for="(note, i) in reportB.specialNotes" :key="i" class="special-item" :class="note.type">
                    <a-tag :color="note.type === 'warning' ? 'orange' : 'blue'" size="small">
                      {{ note.label }}
                    </a-tag>
                    <span>{{ note.description }}</span>
                  </div>
                </div>
                <div v-else class="no-special">无特殊标注</div>
              </div>
            </div>
          </a-collapse-item>

        </a-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IconLeft,
  IconSwap,
  IconBarChart,
  IconFile
} from '@arco-design/web-vue/es/icon'

interface CreditReport {
  id: string
  reportId: string
  source: string
  queryDate: string
  creditScore: number
  creditLevel: string
  reportStatus: string
  creditOverview?: {
    creditCardAccounts: number
    loanAccounts: number
    totalCreditLimit: number
    usedCredit: number
    creditUtilizationRate: number
  }
  overdueInfo?: {
    overdueCount: number
    maxOverdueDays: number
    overdueAmount: number
    currentOverdueCount: number
  }
  queryRecords?: {
    totalQueryCount: number
    queriesLast3Months: number
    queryReasons: { reason: string; count: number }[]
  }
  specialNotes?: { type: string; label: string; description: string }[]
  accounts?: any[]
}

const props = defineProps<{
  reportA: CreditReport
  reportB: CreditReport
}>()

defineEmits<{
  (e: 'back'): void
}>()

// 状态
const selectedIndex = ref(0)
const detailActiveKeys = ref(['overview'])

// 计算属性
const scoreDiff = computed(() => props.reportB.creditScore - props.reportA.creditScore)
const utilizationDiff = computed(() => 
  (props.reportB.creditOverview?.creditUtilizationRate || 0) - 
  (props.reportA.creditOverview?.creditUtilizationRate || 0)
)
const overdueDiff = computed(() => 
  (props.reportB.overdueInfo?.overdueCount || 0) - 
  (props.reportA.overdueInfo?.overdueCount || 0)
)

// 评分变化
const getScoreChangeClass = computed(() => {
  if (scoreDiff.value > 0) return 'change-good'
  if (scoreDiff.value < 0) return 'change-bad'
  return 'change-neutral'
})
const getScoreChangeText = computed(() => {
  if (scoreDiff.value > 0) return `提升 ${scoreDiff.value} 分`
  if (scoreDiff.value < 0) return `下降 ${Math.abs(scoreDiff.value)} 分`
  return '无变化'
})
const getScoreChangeIcon = computed(() => {
  if (scoreDiff.value > 0) return '↑'
  if (scoreDiff.value < 0) return '↓'
  return '＝'
})

// 负债率变化（降低是好的）
const getUtilizationChangeClass = computed(() => {
  if (utilizationDiff.value < 0) return 'change-good'
  if (utilizationDiff.value > 0) return 'change-bad'
  return 'change-neutral'
})
const getUtilizationChangeText = computed(() => {
  if (Math.abs(utilizationDiff.value) < 0.1) return '无变化'
  return `${utilizationDiff.value > 0 ? '↑' : '↓'} ${Math.abs(utilizationDiff.value).toFixed(1)}%`
})
const getUtilizationChangeIcon = computed(() => {
  if (Math.abs(utilizationDiff.value) < 0.1) return '＝'
  return utilizationDiff.value > 0 ? '↑' : '↓'
})

// 逾期变化（减少是好的）
const getOverdueChangeClass = computed(() => {
  if (overdueDiff.value < 0) return 'change-good'
  if (overdueDiff.value > 0) return 'change-bad'
  return 'change-neutral'
})
const getOverdueChangeText = computed(() => {
  if (overdueDiff.value === 0) return '无变化'
  return `${overdueDiff.value > 0 ? '↑' : '↓'} ${Math.abs(overdueDiff.value)}次`
})
const getOverdueChangeIcon = computed(() => {
  if (overdueDiff.value === 0) return '＝'
  return overdueDiff.value > 0 ? '↑' : '↓'
})

// 工具方法
const formatAmount = (amount: number | undefined) => {
  if (!amount) return '-'
  return amount.toLocaleString('zh-CN')
}

const getLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    'AAA': 'green', 'AA': 'green', 'A': 'cyan',
    'BBB': 'blue', 'BB': 'blue', 'B': 'arcoblue',
    'CCC': 'orange', 'CC': 'orange', 'C': 'orangered',
    'D': 'red'
  }
  return colorMap[level] || 'default'
}

const getCellClass = (valueA: number | undefined, valueB: number | undefined, lowerIsBetter: boolean = false) => {
  const a = valueA || 0
  const b = valueB || 0
  if (a === b) return ''
  if (lowerIsBetter) {
    return a < b ? 'cell-good' : 'cell-bad'
  }
  return a > b ? 'cell-good' : 'cell-bad'
}
</script>

<style scoped>
.credit-report-compare {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

/* 顶部导航 */
.compare-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.nav-icon {
  color: var(--subapp-info);
}

.nav-spacer {
  width: 60px;
}

/* 报告选择器 */
.report-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.selector-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 32px;
  background: #f7f8fa;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.selector-card:hover {
  border-color: var(--subapp-info);
}

.selector-card.active {
  border-color: var(--subapp-info);
  background: #e6f7ff;
}

.selector-label {
  font-size: 12px;
  color: #8c8c8c;
}

.selector-date {
  font-size: 13px;
  color: var(--subapp-text-primary);
  font-weight: 500;
}

.selector-score {
  font-size: 24px;
  font-weight: 700;
  color: var(--subapp-info);
}

.selector-vs {
  font-size: 18px;
  font-weight: 600;
  color: #8c8c8c;
}

/* 对比内容 */
.compare-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.compare-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--subapp-text-primary);
  margin-bottom: 12px;
}

.section-icon {
  color: var(--subapp-info);
}

/* 指标卡片 */
.indicator-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.indicator-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.indicator-name {
  font-size: 13px;
  color: #666;
}

.indicator-change {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.indicator-change.change-good {
  background: #f6ffed;
  color: #52c41a;
}

.indicator-change.change-bad {
  background: #fff2f0;
  color: var(--subapp-danger);
}

.indicator-change.change-neutral {
  background: #f7f8fa;
  color: #8c8c8c;
}

.indicator-values {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.indicator-value-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.indicator-value-box .value {
  font-size: 24px;
  font-weight: 700;
  color: var(--subapp-text-primary);
}

.indicator-value-box .label {
  font-size: 11px;
  color: #8c8c8c;
  margin-top: 2px;
}

.indicator-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 20px;
  color: #8c8c8c;
}

.indicator-arrow:not(.neutral) .arrow-icon {
  font-size: 16px;
}

.indicator-arrow:not(.neutral) .arrow-icon:first-child {
  color: #52c41a;
}

/* 详细对比表格 */
.detail-collapse {
  background: #fff;
  border-radius: 8px;
}

.detail-table {
  padding: 0;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.header {
  background: #f7f8fa;
  font-weight: 500;
}

.detail-cell {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--subapp-text-primary);
}

.detail-cell:first-child {
  color: #666;
}

.detail-cell.cell-good {
  color: #52c41a;
  font-weight: 500;
}

.detail-cell.cell-bad {
  color: var(--subapp-danger);
  font-weight: 500;
}

/* 特殊标注对比 */
.special-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.special-col-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--subapp-text-primary);
  margin-bottom: 8px;
}

.special-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.special-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;
}

.special-item.warning {
  background: #fff2e8;
}

.special-item.info {
  background: #f0f9ff;
}

.no-special {
  font-size: 12px;
  color: #8c8c8c;
  text-align: center;
  padding: 12px;
}
</style>
