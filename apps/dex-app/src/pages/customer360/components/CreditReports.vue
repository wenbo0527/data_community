<template>
  <div class="credit-reports">
    <!-- ========== 报告版本选择器（多报告对比用） ========== -->
    <div v-if="reports.length > 1" class="report-selector">
      <div class="selector-label">选择对比报告（最多3份）：</div>
      <div class="selector-tags">
        <a-checkable-tag
          v-for="report in reports"
          :key="report.id"
          :checked="selectedReportIds.includes(report.id)"
          @change="(checked) => handleReportSelect(report.id, checked)"
        >
          {{ report.queryDate }} - {{ report.creditLevel }}
        </a-checkable-tag>
      </div>
    </div>

    <!-- ========== 对比视图（选中多份报告时显示） ========== -->
    <div v-if="selectedReports.length >= 2" class="compare-view">
      <div class="compare-header">
        <h3 class="compare-title">📊 指标对比</h3>
        <a-button type="text" size="small" @click="selectedReportIds = []">清除对比</a-button>
      </div>
      <div class="compare-cards">
        <div class="compare-card">
          <div class="compare-card-title">信用评分</div>
          <div class="compare-card-values">
            <div v-for="report in selectedReports" :key="report.id" class="compare-value-item">
              <span class="compare-value">{{ report.creditScore }}</span>
              <span class="compare-date">{{ report.queryDate }}</span>
              <span :class="getScoreTrend(report.creditScore)" class="compare-trend">
                {{ getScoreTrendIcon(report.creditScore) }}
              </span>
            </div>
          </div>
        </div>
        <div class="compare-card">
          <div class="compare-card-title">负债率</div>
          <div class="compare-card-values">
            <div v-for="report in selectedReports" :key="report.id" class="compare-value-item">
              <span class="compare-value">{{ report.creditOverview?.creditUtilizationRate || 0 }}%</span>
              <span class="compare-date">{{ report.queryDate }}</span>
              <span :class="getUtilizationTrend(report.creditOverview?.creditUtilizationRate)">
                {{ getUtilizationTrendIcon(report.creditOverview?.creditUtilizationRate) }}
              </span>
            </div>
          </div>
        </div>
        <div class="compare-card">
          <div class="compare-card-title">逾期次数</div>
          <div class="compare-card-values">
            <div v-for="report in selectedReports" :key="report.id" class="compare-value-item">
              <span class="compare-value">{{ report.overdueInfo?.overdueCount || 0 }}次</span>
              <span class="compare-date">{{ report.queryDate }}</span>
              <span :class="getOverdueTrend(report.overdueInfo?.overdueCount)">
                {{ getOverdueTrendIcon(report.overdueInfo?.overdueCount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 单报告视图 / 选中单报告详情 ========== -->
    <div v-if="displayReports.length > 0" class="reports-container">
      <div v-for="report in displayReports" :key="report.id" class="report-section">
        
        <!-- ========== 报告摘要卡片 ========== -->
        <div class="summary-card" @click="expandedSections[report.id] = !expandedSections[report.id]">
          <div class="summary-left">
            <div class="summary-score">
              <span class="score-value">{{ report.creditScore }}</span>
              <span class="score-label">信用评分</span>
            </div>
            <div class="summary-meta">
              <a-tag :color="getLevelColor(report.creditLevel)" class="level-tag">{{ report.creditLevel }}级</a-tag>
              <span class="risk-label" :class="getRiskClass(report.creditScore)">
                风险：{{ getRiskLevel(report.creditScore) }}
              </span>
            </div>
          </div>
          <div class="summary-right">
            <div class="summary-compare">
              <span class="compare-label">行业均值</span>
              <span class="compare-value">650</span>
              <span :class="getCompareClass(report.creditScore)" class="compare-diff">
                {{ getCompareText(report.creditScore) }}
              </span>
            </div>
            <div class="summary-info">
              <span class="info-item">ID: {{ report.reportId }}</span>
              <span class="info-item">查询: {{ report.queryDate }}</span>
            </div>
          </div>
          <div class="summary-arrow">
            <IconDown :class="{ 'arrow-rotated': expandedSections[report.id] }" />
          </div>
        </div>

        <!-- ========== 四大模块折叠面板 ========== -->
        <a-collapse v-model:active-keys="activeCollapseKeys[report.id]" class="credit-collapse">
          
          <!-- 模块1: 信贷账户概览 -->
          <a-collapse-item key="overview" header="📈 信贷账户概览">
            <div class="module-content">
              <div class="stat-grid">
                <div class="stat-item">
                  <span class="stat-label">信用卡账户</span>
                  <span class="stat-value">{{ report.creditOverview?.creditCardAccounts || 0 }}个</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">贷款账户</span>
                  <span class="stat-value">{{ report.creditOverview?.loanAccounts || 0 }}个</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">总授信额度</span>
                  <span class="stat-value highlight">{{ formatAmount(report.creditOverview?.totalCreditLimit) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已用额度</span>
                  <span class="stat-value highlight">{{ formatAmount(report.creditOverview?.usedCredit) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">负债率</span>
                  <span class="stat-value" :class="getUtilizationClass(report.creditOverview?.creditUtilizationRate)">
                    {{ report.creditOverview?.creditUtilizationRate || 0 }}%
                  </span>
                </div>
              </div>
            </div>
          </a-collapse-item>

          <!-- 模块2: 逾期与风险 -->
          <a-collapse-item key="overdue" header="⚠️ 逾期与风险">
            <div class="module-content">
              <div class="risk-summary">
                <div class="risk-item" :class="getOverdueSeverityClass(report.overdueInfo?.overdueCount)">
                  <span class="risk-label">逾期次数</span>
                  <span class="risk-value">{{ report.overdueInfo?.overdueCount || 0 }}次</span>
                </div>
                <div class="risk-item" :class="getOverdueSeverityClass(report.overdueInfo?.maxOverdueDays)">
                  <span class="risk-label">最长逾期</span>
                  <span class="risk-value">{{ report.overdueInfo?.maxOverdueDays || 0 }}天</span>
                </div>
                <div class="risk-item" :class="getOverdueSeverityClass(report.overdueInfo?.currentOverdueCount)">
                  <span class="risk-label">当前逾期</span>
                  <span class="risk-value">{{ report.overdueInfo?.currentOverdueCount || 0 }}笔</span>
                </div>
                <div class="risk-item">
                  <span class="risk-label">逾期金额</span>
                  <span class="risk-value">{{ formatAmount(report.overdueInfo?.overdueAmount) }}</span>
                </div>
              </div>
              <div v-if="report.overdueInfo?.overdueCount > 0" class="risk-alert">
                <IconExclamationCircle class="alert-icon" />
                <span>存在{{ report.overdueInfo.overdueCount }}次逾期记录，请重点关注</span>
              </div>
            </div>
          </a-collapse-item>

          <!-- 模块3: 查询记录分析 -->
          <a-collapse-item key="query" header="🔍 查询记录分析">
            <div class="module-content">
              <div class="query-stats">
                <div class="query-stat">
                  <span class="stat-label">总查询次数</span>
                  <span class="stat-value">{{ report.queryRecords?.totalQueryCount || 0 }}次</span>
                </div>
                <div class="query-stat">
                  <span class="stat-label">近3个月查询</span>
                  <span class="stat-value" :class="{ 'warning': (report.queryRecords?.queriesLast3Months || 0) > 5 }">
                    {{ report.queryRecords?.queriesLast3Months || 0 }}次
                  </span>
                </div>
              </div>
              <div v-if="report.queryRecords?.queryReasons?.length > 0" class="query-reasons">
                <div class="reasons-title">查询原因分布</div>
                <div class="reason-bars">
                  <div v-for="item in report.queryRecords.queryReasons" :key="item.reason" class="reason-bar">
                    <span class="reason-name">{{ item.reason }}</span>
                    <div class="bar-track">
                      <div class="bar-fill" :style="{ width: getReasonBarWidth(item.count) + '%' }"></div>
                    </div>
                    <span class="reason-count">{{ item.count }}次</span>
                  </div>
                </div>
              </div>
            </div>
          </a-collapse-item>

          <!-- 模块4: 特殊标注 -->
          <a-collapse-item key="special" header="📋 特殊标注">
            <div class="module-content">
              <div v-if="report.specialNotes?.length > 0" class="special-notes">
                <div
                  v-for="(note, index) in report.specialNotes"
                  :key="index"
                  class="note-item"
                  :class="note.type"
                >
                  <a-tag :color="note.type === 'warning' ? 'orange' : 'blue'" class="note-tag">
                    {{ note.label }}
                  </a-tag>
                  <span class="note-desc">{{ note.description }}</span>
                </div>
              </div>
              <div v-else class="no-notes">无特殊标注</div>
            </div>
          </a-collapse-item>

          <!-- 模块5: 账户列表（新增） -->
          <a-collapse-item key="accounts" header="💳 账户列表">
            <div class="module-content">
              <div v-if="report.accounts?.length > 0" class="accounts-list">
                <div
                  v-for="(account, index) in report.accounts"
                  :key="index"
                  class="account-item"
                  :class="account.type"
                >
                  <div class="account-header">
                    <div class="account-type">
                      <a-tag :color="account.type === 'credit_card' ? 'blue' : 'green'" size="small">
                        {{ account.type === 'credit_card' ? '信用卡' : '贷款' }}
                      </a-tag>
                      <span class="account-bank">{{ account.bank }}</span>
                    </div>
                    <div class="account-overdue" v-if="account.overdueDays > 0">
                      <a-tag color="red" size="small">逾期{{ account.overdueDays }}天</a-tag>
                    </div>
                  </div>
                  <div class="account-details">
                    <div class="detail-row">
                      <span class="detail-label">账号</span>
                      <span class="detail-value">{{ account.accountNo }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">开卡日期</span>
                      <span class="detail-value">{{ account.openDate }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">额度</span>
                      <span class="detail-value">{{ formatAmount(account.creditLimit) }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">已用</span>
                      <span class="detail-value">{{ formatAmount(account.usedAmount) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-accounts">无账户信息</div>
            </div>
          </a-collapse-item>

        </a-collapse>
      </div>
    </div>

    <!-- ========== 空状态 ========== -->
    <div v-else class="empty-state">
      <IconFile class="empty-icon" />
      <p class="empty-text">暂无征信记录</p>
    </div>

    <!-- ========== 趋势图弹窗 ========== -->
    <a-modal
      v-model:visible="trendModalVisible"
      title="📈 指标趋势"
      width="800px"
      :footer="null"
    >
      <div class="trend-chart">
        <div class="trend-header">
          <a-radio-group v-model="trendPeriod" size="small">
            <a-radio-button value="6">近6个月</a-radio-button>
            <a-radio-button value="12">近12个月</a-radio-button>
          </a-radio-group>
        </div>
        <div class="trend-placeholder">
          <IconBarChart class="chart-icon" />
          <p>趋势图展示区域（可接入 ECharts / Arco Design Charts）</p>
          <p class="trend-hint">当前选中 {{ trendPeriod }} 个月的数据趋势</p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconFile,
  IconDown,
  IconExclamationCircle,
  IconBarChart
} from '@arco-design/web-vue/es/icon'
import { formatAmount } from '@/utils/formatUtils'

// ========== 类型定义 ==========
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
  accounts?: {
    type: 'credit_card' | 'loan'
    bank: string
    accountNo: string
    openDate: string
    creditLimit: number
    usedAmount: number
    overdueStatus: string
    overdueDays: number
  }[]
}

// ========== Props ==========
const props = defineProps<{
  reports: CreditReport[]
}>()

// ========== 响应式状态 ==========
const selectedReportIds = ref<string[]>([])
const expandedSections = ref<Record<string, boolean>>({})
const activeCollapseKeys = ref<Record<string, string[]>>({})
const trendModalVisible = ref(false)
const trendPeriod = ref('6')

// 调试日志
console.log('[CreditReports] 🔍 组件已加载, 版本: 2026-04-21-PRD-Refactor')
console.log('[CreditReports] 📊 接收到的报告数:', props.reports?.length || 0)

// ========== 计算属性 ==========
const selectedReports = computed(() => {
  return props.reports.filter(r => selectedReportIds.value.includes(r.id))
})

const displayReports = computed(() => {
  if (selectedReportIds.value.length > 0) {
    return selectedReports.value
  }
  return props.reports || []
})

// ========== 监听器 ==========
watch(() => props.reports, (newReports) => {
  console.log('[CreditReports] 📊 报告数据变化:', newReports?.length || 0)
  // 初始化展开状态
  newReports?.forEach(report => {
    if (!expandedSections.value[report.id]) {
      expandedSections.value[report.id] = true
    }
    if (!activeCollapseKeys.value[report.id]) {
      activeCollapseKeys.value[report.id] = ['overview']
    }
  })
}, { immediate: true, deep: true })

// ========== 方法 ==========

// 报告选择
const handleReportSelect = (reportId: string, checked: boolean) => {
  if (checked) {
    if (selectedReportIds.value.length >= 3) {
      Message.warning('最多只能选择3份报告进行对比')
      return
    }
    selectedReportIds.value.push(reportId)
  } else {
    selectedReportIds.value = selectedReportIds.value.filter(id => id !== reportId)
  }
}

// 格式化金额
const formatAmountValue = (amount: number | undefined) => {
  if (!amount) return '-'
  return amount.toLocaleString('zh-CN')
}

// 获取等级颜色
const getLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    'AAA': 'green', 'AA': 'green', 'A': 'cyan',
    'BBB': 'blue', 'BB': 'blue', 'B': 'arcoblue',
    'CCC': 'orange', 'CC': 'orange', 'C': 'orangered',
    'D': 'red'
  }
  return colorMap[level] || 'default'
}

// 获取风险等级
const getRiskLevel = (score: number) => {
  if (score >= 800) return '很低'
  if (score >= 700) return '低'
  if (score >= 600) return '中等'
  if (score >= 500) return '较高'
  return '很高'
}

// 获取风险样式类
const getRiskClass = (score: number) => {
  if (score >= 700) return 'risk-low'
  if (score >= 600) return 'risk-medium'
  return 'risk-high'
}

// 获取比较文本
const getCompareText = (score: number) => {
  const diff = score - 650
  if (diff > 0) return `▲ +${diff}（优于均值）`
  if (diff < 0) return `▼ ${diff}（低于均值）`
  return '＝ 与均值持平'
}

// 获取比较样式类
const getCompareClass = (score: number) => {
  const diff = score - 650
  if (diff > 0) return 'compare-good'
  if (diff < 0) return 'compare-bad'
  return 'compare-neutral'
}

// 获取负债率样式
const getUtilizationClass = (rate: number | undefined) => {
  if (!rate) return ''
  if (rate >= 70) return 'utilization-high'
  if (rate >= 50) return 'utilization-medium'
  return ''
}

// 逾期严重程度样式
const getOverdueSeverityClass = (value: number | undefined) => {
  if (!value || value === 0) return 'severity-none'
  if (value >= 90 || value >= 3) return 'severity-high'
  if (value >= 30 || value >= 1) return 'severity-medium'
  return 'severity-low'
}

// 查询原因条形图宽度
const getReasonBarWidth = (count: number) => {
  const maxCount = props.reports?.[0]?.queryRecords?.queryReasons?.[0]?.count || 1
  return Math.min((count / maxCount) * 100, 100)
}

// 对比趋势图标（评分）
const getScoreTrendIcon = (score: number) => {
  const sorted = [...selectedReports.value].sort((a, b) => b.creditScore - a.creditScore)
  if (sorted[0]?.creditScore === score) return '↑'
  return '↓'
}

const getScoreTrend = (score: number) => {
  const sorted = [...selectedReports.value].sort((a, b) => b.creditScore - a.creditScore)
  if (sorted[0]?.creditScore === score) return 'trend-up'
  return 'trend-down'
}

// 对比趋势图标（负债率）
const getUtilizationTrendIcon = (rate: number | undefined) => {
  if (!rate) return ''
  const sorted = [...selectedReports.value].sort((a, b) => 
    (b.creditOverview?.creditUtilizationRate || 0) - (a.creditOverview?.creditUtilizationRate || 0)
  )
  if (sorted[0]?.creditOverview?.creditUtilizationRate === rate) return '↑'
  return '↓'
}

const getUtilizationTrend = (rate: number | undefined) => {
  if (!rate) return ''
  const sorted = [...selectedReports.value].sort((a, b) => 
    (b.creditOverview?.creditUtilizationRate || 0) - (a.creditOverview?.creditUtilizationRate || 0)
  )
  if (sorted[0]?.creditOverview?.creditUtilizationRate === rate) return 'trend-up'
  return 'trend-down'
}

// 对比趋势图标（逾期）
const getOverdueTrendIcon = (count: number | undefined) => {
  if (!count) return ''
  const sorted = [...selectedReports.value].sort((a, b) => 
    (b.overdueInfo?.overdueCount || 0) - (a.overdueInfo?.overdueCount || 0)
  )
  if (sorted[0]?.overdueInfo?.overdueCount === count) return '↑'
  return '↓'
}

const getOverdueTrend = (count: number | undefined) => {
  if (!count) return ''
  const sorted = [...selectedReports.value].sort((a, b) => 
    (b.overdueInfo?.overdueCount || 0) - (a.overdueInfo?.overdueCount || 0)
  )
  if (sorted[0]?.overdueInfo?.overdueCount === count) return 'trend-up'
  return 'trend-down'
}
</script>

<style scoped>
.credit-reports {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

/* ========== 报告版本选择器 ========== */
.report-selector {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.selector-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.selector-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ========== 对比视图 ========== */
.compare-view {
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.compare-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.compare-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.compare-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px;
}

.compare-card-title {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.compare-card-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compare-value-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compare-value {
  font-size: 20px;
  font-weight: 600;
}

.compare-date {
  font-size: 11px;
  opacity: 0.7;
}

.compare-trend {
  font-size: 12px;
}

.trend-up {
  color: #52c41a;
}

.trend-down {
  color: var(--subapp-danger);
}

/* ========== 报告摘要卡片 ========== */
.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 16px;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.summary-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.summary-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-tag {
  font-size: 14px;
  font-weight: 600;
}

.risk-label {
  font-size: 12px;
  opacity: 0.9;
}

.risk-low {
  color: #52c41a;
}

.risk-medium {
  color: #faad14;
}

.risk-high {
  color: var(--subapp-danger);
}

.summary-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.summary-compare {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.compare-label {
  opacity: 0.8;
}

.compare-diff {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.compare-good {
  background: rgba(82, 196, 26, 0.3);
  color: #52c41a;
}

.compare-bad {
  background: rgba(255, 77, 79, 0.3);
  color: var(--subapp-danger);
}

.compare-neutral {
  background: rgba(255, 255, 255, 0.2);
}

.summary-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  opacity: 0.8;
}

.summary-arrow {
  font-size: 20px;
  opacity: 0.8;
  transition: transform 0.3s;
}

.summary-arrow .arrow-rotated {
  transform: rotate(180deg);
}

/* ========== 折叠面板 ========== */
.credit-collapse {
  margin-bottom: 16px;
}

/* ========== 模块内容 ========== */
.module-content {
  padding: 8px 0;
}

/* 统计网格 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.stat-value.highlight {
  color: var(--subapp-info);
}

.stat-value.warning {
  color: #faad14;
}

.stat-value.utilization-high {
  color: var(--subapp-danger);
}

.stat-value.utilization-medium {
  color: #faad14;
}

/* 逾期风险汇总 */
.risk-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.risk-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  border-left: 3px solid #d9d9d9;
}

.risk-item.severity-none {
  border-left-color: #52c41a;
}

.risk-item.severity-low {
  border-left-color: #faad14;
}

.risk-item.severity-medium {
  border-left-color: #fa8c16;
}

.risk-item.severity-high {
  border-left-color: var(--subapp-danger);
  background: #fff2f0;
}

.risk-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff2e8;
  border: 1px solid #ffbb96;
  border-radius: 6px;
  color: #d46b08;
  font-size: 13px;
}

.alert-icon {
  font-size: 18px;
}

/* 查询记录 */
.query-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.query-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reason-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reason-name {
  width: 80px;
  font-size: 13px;
  color: #666;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--subapp-info), #66b5ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.reason-count {
  width: 40px;
  text-align: right;
  font-size: 13px;
  color: var(--subapp-text-primary);
}

/* 特殊标注 */
.special-notes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
}

.note-item.warning {
  background: #fff2e8;
  border: 1px solid #ffbb96;
}

.note-item.info {
  background: #f0f9ff;
  border: 1px solid #91d5ff;
}

.note-tag {
  flex-shrink: 0;
}

.note-desc {
  font-size: 13px;
  color: var(--subapp-text-primary);
  line-height: 1.4;
}

.no-notes {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 20px;
}

/* 账户列表 */
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.2s;
}

.account-item:hover {
  border-color: #d9d9d9;
}

.account-item.credit_card {
  border-left: 3px solid var(--subapp-info);
}

.account-item.loan {
  border-left: 3px solid #52c41a;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.account-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-bank {
  font-weight: 500;
  color: var(--subapp-text-primary);
}

.account-overdue {
  flex-shrink: 0;
}

.account-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.detail-row {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.detail-label {
  color: #999;
  flex-shrink: 0;
}

.detail-value {
  color: var(--subapp-text-primary);
}

.no-accounts {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 20px;
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  margin: 0;
  font-size: 14px;
}

/* ========== 趋势图弹窗 ========== */
.trend-chart {
  padding: 16px 0;
}

.trend-header {
  margin-bottom: 16px;
}

.trend-placeholder {
  text-align: center;
  padding: 40px;
  background: #f7f8fa;
  border-radius: 8px;
  color: #666;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.trend-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .summary-card {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .summary-left,
  .summary-right {
    align-items: center;
  }

  .compare-cards {
    grid-template-columns: 1fr;
  }

  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .query-stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
