<template>
  <div class="credit-report-detail">
    <!-- 顶部导航 -->
    <div class="detail-nav">
      <a-button type="text" size="small" @click="$emit('back')">
        <template #icon><IconLeft /></template>
        返回列表
      </a-button>
      <div class="nav-title">
        <IconFile class="nav-icon" />
        <span>报告详情</span>
        <span class="report-id">{{ report.reportId }}</span>
      </div>
      <a-button type="primary" size="small" @click="$emit('compare', report)">
        <template #icon><IconSwap /></template>
        对比
      </a-button>
    </div>

    <!-- 报告摘要卡片 -->
    <div class="summary-card">
      <div class="summary-main">
        <div class="score-display">
          <span class="score-number">{{ report.creditScore }}</span>
          <span class="score-label">信用评分</span>
        </div>
        <div class="score-compare">
          <div class="industry-avg">行业均值: 650</div>
          <div class="compare-diff" :class="getCompareClass(report.creditScore)">
            {{ getCompareText(report.creditScore) }}
          </div>
        </div>
      </div>
      <div class="summary-meta">
        <div class="meta-item">
          <span class="meta-label">信用等级</span>
          <a-tag :color="getLevelColor(report.creditLevel)" size="small">
            {{ report.creditLevel }}级
          </a-tag>
        </div>
        <div class="meta-item">
          <span class="meta-label">风险评级</span>
          <span class="risk-value" :class="getRiskClass(report.creditScore)">
            {{ getRiskLevel(report.creditScore) }}
          </span>
        </div>
        <div class="meta-item">
          <span class="meta-label">报告状态</span>
          <a-tag :color="getStatusColor(report.reportStatus)" size="small">
            {{ report.reportStatus }}
          </a-tag>
        </div>
        <div class="meta-item">
          <span class="meta-label">查询日期</span>
          <span class="meta-value">{{ report.queryDate }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">数据来源</span>
          <span class="meta-value">{{ report.source }}</span>
        </div>
      </div>
    </div>

    <!-- 四大模块折叠面板 -->
    <div class="modules-container">
      <a-collapse v-model:active-keys="activeKeys" class="credit-collapse">
        
        <!-- 模块1: 信贷账户概览 -->
        <a-collapse-item key="overview" header="📈 信贷账户概览">
          <div class="module-content">
            <div class="stat-cards">
              <div class="stat-card">
                <div class="stat-icon blue">
                  <IconSafe />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ report.creditOverview?.creditCardAccounts || 0 }}</span>
                  <span class="stat-label">信用卡账户</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon green">
                  <IconSafe />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ report.creditOverview?.loanAccounts || 0 }}</span>
                  <span class="stat-label">贷款账户</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon purple">
                  <IconSafe />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ formatAmount(report.creditOverview?.totalCreditLimit) }}</span>
                  <span class="stat-label">总授信额度</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon orange">
                  <IconSubscribe />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ formatAmount(report.creditOverview?.usedCredit) }}</span>
                  <span class="stat-label">已用额度</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" :class="getUtilizationClass(report.creditOverview?.creditUtilizationRate)">
                  <IconBarChart />
                </div>
                <div class="stat-info">
                  <span class="stat-value" :class="getUtilizationClass(report.creditOverview?.creditUtilizationRate)">
                    {{ report.creditOverview?.creditUtilizationRate || 0 }}%
                  </span>
                  <span class="stat-label">负债率</span>
                </div>
              </div>
            </div>
          </div>
        </a-collapse-item>

        <!-- 模块2: 逾期与风险 -->
        <a-collapse-item key="overdue" header="⚠️ 逾期与风险">
          <div class="module-content">
            <div class="risk-grid">
              <div class="risk-card" :class="getOverdueSeverityClass(report.overdueInfo?.overdueCount)">
                <div class="risk-icon">
                  <IconExclamationCircle />
                </div>
                <div class="risk-info">
                  <span class="risk-value">{{ report.overdueInfo?.overdueCount || 0 }}</span>
                  <span class="risk-label">逾期次数</span>
                </div>
              </div>
              <div class="risk-card" :class="getOverdueSeverityClass(report.overdueInfo?.maxOverdueDays)">
                <div class="risk-icon">
                  <IconHistory />
                </div>
                <div class="risk-info">
                  <span class="risk-value">{{ report.overdueInfo?.maxOverdueDays || 0 }}天</span>
                  <span class="risk-label">最长逾期</span>
                </div>
              </div>
              <div class="risk-card" :class="getOverdueSeverityClass(report.overdueInfo?.currentOverdueCount)">
                <div class="risk-icon">
                  <IconCloseCircle />
                </div>
                <div class="risk-info">
                  <span class="risk-value">{{ report.overdueInfo?.currentOverdueCount || 0 }}笔</span>
                  <span class="risk-label">当前逾期</span>
                </div>
              </div>
              <div class="risk-card">
                <div class="risk-icon">
                  <IconSafe />
                </div>
                <div class="risk-info">
                  <span class="risk-value">{{ formatAmount(report.overdueInfo?.overdueAmount) }}</span>
                  <span class="risk-label">逾期金额</span>
                </div>
              </div>
            </div>
            
            <div v-if="report.overdueInfo?.overdueCount > 0" class="risk-alert">
              <IconExclamationCircle class="alert-icon" />
              <div class="alert-content">
                <span class="alert-title">风险提示</span>
                <span class="alert-desc">存在 {{ report.overdueInfo.overdueCount }} 次逾期记录，其中最长逾期 {{ report.overdueInfo.maxOverdueDays }} 天，请重点关注。</span>
              </div>
            </div>
          </div>
        </a-collapse-item>

        <!-- 模块3: 查询记录分析 -->
        <a-collapse-item key="query" header="🔍 查询记录分析">
          <div class="module-content">
            <div class="query-summary">
              <div class="query-stat primary">
                <span class="query-value">{{ report.queryRecords?.totalQueryCount || 0 }}</span>
                <span class="query-label">总查询次数</span>
              </div>
              <div class="query-stat" :class="{ warning: (report.queryRecords?.queriesLast3Months || 0) > 5 }">
                <span class="query-value">{{ report.queryRecords?.queriesLast3Months || 0 }}</span>
                <span class="query-label">近3个月查询</span>
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
            <div v-else class="no-notes">
              <IconCheckCircle class="no-notes-icon" />
              <span>无特殊标注</span>
            </div>
          </div>
        </a-collapse-item>

        <!-- 模块5: 账户列表 -->
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
                  <div v-if="account.overdueDays > 0" class="account-overdue">
                    <a-tag color="red" size="small">逾期{{ account.overdueDays }}天</a-tag>
                  </div>
                  <div v-else class="account-normal">
                    <a-tag color="green" size="small">正常</a-tag>
                  </div>
                </div>
                <div class="account-details">
                  <div class="detail-item">
                    <span class="detail-label">账号</span>
                    <span class="detail-value">{{ account.accountNo }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">开卡日期</span>
                    <span class="detail-value">{{ account.openDate }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">额度</span>
                    <span class="detail-value">{{ formatAmount(account.creditLimit) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">已用</span>
                    <span class="detail-value">{{ formatAmount(account.usedAmount) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-accounts">
              <IconFile class="no-accounts-icon" />
              <span>无账户信息</span>
            </div>
          </div>
        </a-collapse-item>

      </a-collapse>
    </div>
    <!-- 备注区域 -->
    <div class="report-notes">
      <div class="notes-header">
        <span class="notes-title">备注</span>
        <a-button type="text" size="small" @click="openNoteModal(null)">
          <template #icon><IconPlus /></template>
          添加备注
        </a-button>
      </div>
      <div v-if="notes.length" class="notes-list">
        <div
          v-for="note in notes"
          :key="note.id"
          class="note-card"
          @mouseenter="hoveredNoteId = note.id"
          @mouseleave="hoveredNoteId = null"
        >
          <div class="note-content">{{ note.content }}</div>
          <div class="note-meta">
            <span class="note-author">{{ note.createdBy }}</span>
            <span class="note-time">{{ note.createdAt }}</span>
            <div v-if="hoveredNoteId === note.id" class="note-actions">
              <a-button type="text" size="mini" @click.stop="openNoteModal(note)">编辑</a-button>
              <a-button type="text" size="mini" status="danger" @click.stop="deleteNote(note.id!)">删除</a-button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-notes">
        <span>暂无备注</span>
      </div>
    </div>

    <!-- 备注弹窗 -->
    <CreditReportNoteModal
      v-model:visible="noteModalVisible"
      :note="editingNote"
      :report-id="report.reportId"
      @save="handleSaveNote"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IconLeft,
  IconFile,
  IconSwap,
  IconSafe,
  IconSubscribe,
  IconBarChart,
  IconHistory,
  IconCloseCircle,
  IconExclamationCircle,
  IconCheckCircle,
  IconPlus
} from '@arco-design/web-vue/es/icon'
import CreditReportNoteModal from './CreditReportNoteModal.vue'

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

const props = defineProps<{
  report: CreditReport
}>()

defineEmits<{
  (e: 'back'): void
  (e: 'compare', report: CreditReport): void
}>()

// 备注相关
interface Note {
  id: string
  reportId: string
  content: string
  createdAt: string
  createdBy: string
}

const noteModalVisible = ref(false)
const editingNote = ref<Note | null>(null)
const hoveredNoteId = ref<string | null>(null)

// Mock notes data - 实际项目中应该从后端获取
const notes = ref<Note[]>([
  {
    id: 'note_001',
    reportId: '',
    content: '该用户信用评分良好，但近3个月查询次数较多，需关注。',
    createdAt: '2026-04-20 14:30',
    createdBy: '张三'
  },
  {
    id: 'note_002',
    reportId: '',
    content: '建议提高授信额度，有良好的还款记录。',
    createdAt: '2026-04-21 09:15',
    createdBy: '李四'
  }
])

const openNoteModal = (note: Note | null) => {
  editingNote.value = note
  noteModalVisible.value = true
}

const handleSaveNote = (note: Note) => {
  const index = notes.value.findIndex(n => n.id === note.id)
  if (index >= 0) {
    notes.value[index] = note
  } else {
    notes.value.unshift(note)
  }
}

const deleteNote = (noteId: string) => {
  notes.value = notes.value.filter(n => n.id !== noteId)
}

// 状态
const activeKeys = ref(['overview'])

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

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '关注': 'orange',
    '异常': 'red'
  }
  return colorMap[status] || 'default'
}

const getRiskLevel = (score: number) => {
  if (score >= 800) return '很低'
  if (score >= 700) return '低'
  if (score >= 600) return '中等'
  if (score >= 500) return '较高'
  return '很高'
}

const getRiskClass = (score: number) => {
  if (score >= 700) return 'risk-low'
  if (score >= 600) return 'risk-medium'
  return 'risk-high'
}

const getCompareText = (score: number) => {
  const diff = score - 650
  if (diff > 0) return `▲ +${diff}（优于均值）`
  if (diff < 0) return `▼ ${diff}（低于均值）`
  return '＝ 与均值持平'
}

const getCompareClass = (score: number) => {
  const diff = score - 650
  if (diff > 0) return 'compare-good'
  if (diff < 0) return 'compare-bad'
  return 'compare-neutral'
}

const getUtilizationClass = (rate: number | undefined) => {
  if (!rate) return ''
  if (rate >= 70) return 'utilization-high'
  if (rate >= 50) return 'utilization-medium'
  return ''
}

const getOverdueSeverityClass = (value: number | undefined) => {
  if (!value || value === 0) return 'severity-none'
  if (value >= 90 || value >= 3) return 'severity-high'
  if (value >= 30 || value >= 1) return 'severity-medium'
  return 'severity-low'
}

const getReasonBarWidth = (count: number) => {
  const maxCount = props.report.queryRecords?.queryReasons?.[0]?.count || 1
  return Math.min((count / maxCount) * 100, 100)
}
</script>

<style scoped>
.credit-report-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 顶部导航 */
.detail-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7f8fa;
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

.report-id {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: normal;
}

/* 报告摘要卡片 */
.summary-card {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.summary-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-number {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 4px;
}

.score-compare {
  text-align: right;
}

.industry-avg {
  font-size: 13px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.compare-diff {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 4px;
}

.compare-good {
  background: rgba(82, 196, 26, 0.3);
  color: #52c41a;
}

.compare-bad {
  background: rgba(255, 77, 79, 0.3);
  color: #ff7875;
}

.compare-neutral {
  background: rgba(255, 255, 255, 0.2);
}

.summary-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 11px;
  opacity: 0.8;
}

.meta-value {
  font-size: 13px;
}

.risk-value.risk-low {
  color: #52c41a;
}

.risk-value.risk-medium {
  color: #faad14;
}

.risk-value.risk-high {
  color: var(--subapp-danger);
}

/* 四大模块 */
.modules-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.credit-collapse {
  background: #fff;
}

.module-content {
  padding: 8px 0;
}

/* 统计卡片网格 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 20px;
}

.stat-icon.blue {
  background: #e6f7ff;
  color: var(--subapp-info);
}

.stat-icon.green {
  background: #f6ffed;
  color: #52c41a;
}

.stat-icon.purple {
  background: #f9f0ff;
  color: #722ed1;
}

.stat-icon.orange {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-icon.utilization-high {
  background: #fff2f0;
  color: var(--subapp-danger);
}

.stat-icon.utilization-medium {
  background: #fff7e6;
  color: #faad14;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.stat-value.utilization-high {
  color: var(--subapp-danger);
}

.stat-value.utilization-medium {
  color: #faad14;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

/* 风险卡片网格 */
.risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.risk-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  border-left: 3px solid #d9d9d9;
}

.risk-card.severity-none {
  border-left-color: #52c41a;
}

.risk-card.severity-low {
  border-left-color: #faad14;
}

.risk-card.severity-medium {
  border-left-color: #fa8c16;
}

.risk-card.severity-high {
  border-left-color: var(--subapp-danger);
  background: #fff2f0;
}

.risk-icon {
  font-size: 20px;
  color: #8c8c8c;
}

.risk-info {
  display: flex;
  flex-direction: column;
}

.risk-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.risk-label {
  font-size: 11px;
  color: #8c8c8c;
}

.risk-alert {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff2e8;
  border: 1px solid #ffbb96;
  border-radius: 6px;
}

.alert-icon {
  font-size: 20px;
  color: #fa8c16;
  flex-shrink: 0;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-title {
  font-weight: 500;
  color: #d46b08;
}

.alert-desc {
  font-size: 12px;
  color: #8c5a28;
}

/* 查询记录 */
.query-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.query-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  background: #f7f8fa;
  border-radius: 8px;
}

.query-stat.primary {
  background: #e6f7ff;
}

.query-stat.warning {
  background: #fff7e6;
}

.query-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--subapp-info);
}

.query-stat.warning .query-value {
  color: #faad14;
}

.query-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.reasons-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--subapp-text-primary);
  margin-bottom: 12px;
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
  font-size: 12px;
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
}

.reason-count {
  width: 40px;
  text-align: right;
  font-size: 12px;
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

.no-notes,
.no-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px;
  color: #8c8c8c;
  font-size: 13px;
}

.no-notes-icon,
.no-accounts-icon {
  font-size: 32px;
  opacity: 0.5;
}

/* 账户列表 */
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid var(--subapp-info);
}

.account-item.loan {
  border-left-color: #52c41a;
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

.account-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.detail-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.detail-label {
  color: #8c8c8c;
  flex-shrink: 0;
}

.detail-value {
  color: var(--subapp-text-primary);
}

/* 备注区域 */
.report-notes {
  margin-top: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notes-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-card {
  position: relative;
  padding: 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.note-content {
  font-size: 13px;
  color: var(--subapp-text-primary);
  line-height: 1.5;
  margin-bottom: 8px;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.note-author {
  font-weight: 500;
}

.note-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

</style>
