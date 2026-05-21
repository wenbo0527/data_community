<template>
  <div class="credit-report-panel">
    <!-- 报告选择器 -->
    <div class="report-selector">
      <div class="selector-header">
        <h3 class="section-title">
          <IconFile class="title-icon" />
          征信报告详情
        </h3>
        <div class="selector-actions">
          <ASelect
            v-model="selectedReportId"
            placeholder="请选择报告版本"
            class="report-select"
            @change="handleReportChange"
          >
            <ASelectOption
              v-for="report in creditReports"
              :key="report.id"
              :value="report.id"
            >
              <div class="report-option">
                <span class="report-date">{{ formatDate(report.queryDate) }}</span>
                <ATag :color="getScoreColor(report.creditScore)" size="small">
                  {{ report.creditLevel }}
                </ATag>
                <span class="report-score">{{ report.creditScore }}分</span>
              </div>
            </ASelectOption>
          </ASelect>
          <AButton type="text" size="small" @click="refreshReports" :loading="loading">
            <IconRefresh :class="{ spinning: loading }" />
          </AButton>
        </div>
      </div>
    </div>

    <!-- 无报告时 -->
    <div v-if="!selectedReport && !loading" class="empty-state">
      <IconFile class="empty-icon" />
      <p class="empty-text">暂无征信报告</p>
      <p class="empty-hint">请先在客户360主页面查询客户信息</p>
    </div>

    <!-- 报告内容 -->
    <div v-if="selectedReport" class="report-content">
      <!-- 报告摘要卡片 -->
      <div class="summary-card" :class="getScoreClass(selectedReport.creditScore)">
        <div class="summary-header">
          <div class="summary-score">
            <span class="score-value">{{ selectedReport.creditScore }}</span>
            <span class="score-label">信用评分</span>
          </div>
          <div class="summary-info">
            <div class="info-row">
              <span class="info-label">信用等级</span>
              <ATag :color="getLevelColor(selectedReport.creditLevel)" size="large">
                {{ selectedReport.creditLevel }}
              </ATag>
            </div>
            <div class="info-row">
              <span class="info-label">报告状态</span>
              <ATag :color="selectedReport.reportStatus === '正常' ? 'green' : 'red'" size="large">
                {{ selectedReport.reportStatus }}
              </ATag>
            </div>
            <div class="info-row">
              <span class="info-label">查询时间</span>
              <span class="info-value">{{ formatDate(selectedReport.queryDate) }}</span>
            </div>
          </div>
        </div>
        <div class="summary-score-bar">
          <div class="score-indicator" :style="{ left: `${(selectedReport.creditScore - 350) / 500 * 100}%` }">
            <div class="indicator-arrow"></div>
          </div>
          <div class="score-range">
            <span>350</span>
            <span>850</span>
          </div>
        </div>
      </div>

      <!-- 四大模块折叠面板 -->
      <a-collapse v-model="activeModules" class="module-collapse">
        <!-- 模块1：信贷账户概览 -->
        <a-collapse-item key="overview" class="module-item">
          <template #header>
            <div class="module-header">
              <IconWallet class="module-icon" />
              <span class="module-title">信贷账户概览</span>
              <ATag size="small" color="arcoblue">{{ selectedReport.creditOverview.creditCardAccounts + selectedReport.creditOverview.loanAccounts }}个账户</ATag>
            </div>
          </template>
          <div class="module-content">
            <div class="overview-stats">
              <div class="stat-card">
                <div class="stat-icon card-icon">
                  <IconCard />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ selectedReport.creditOverview.creditCardAccounts }}</span>
                  <span class="stat-label">信用卡账户</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon loan-icon">
                  <IconMoney />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ selectedReport.creditOverview.loanAccounts }}</span>
                  <span class="stat-label">贷款账户</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon amount-icon">
                  <IconBankCard />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ formatAmount(selectedReport.creditOverview.totalCreditLimit) }}</span>
                  <span class="stat-label">总授信额度</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon used-icon">
                  <IconBill />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ formatAmount(selectedReport.creditOverview.usedCredit) }}</span>
                  <span class="stat-label">已用额度</span>
                </div>
              </div>
            </div>
            <div class="utilization-bar">
              <div class="bar-label">
                <span>额度使用率</span>
                <span :class="{ warning: selectedReport.creditOverview.creditUtilizationRate > 70 }">
                  {{ selectedReport.creditOverview.creditUtilizationRate }}%
                </span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :class="{ warning: selectedReport.creditOverview.creditUtilizationRate > 70, danger: selectedReport.creditOverview.creditUtilizationRate > 90 }"
                  :style="{ width: `${selectedReport.creditOverview.creditUtilizationRate}%` }"
                ></div>
              </div>
            </div>
          </div>
        </a-collapse-item>

        <!-- 模块2：逾期与风险 -->
        <a-collapse-item key="overdue" class="module-item">
          <template #header>
            <div class="module-header">
              <IconWarning class="module-icon risk" />
              <span class="module-title">逾期与风险</span>
              <ATag v-if="selectedReport.overdueInfo.overdueCount > 0" size="small" color="orange">
                {{ selectedReport.overdueInfo.overdueCount }}次逾期
              </ATag>
              <ATag v-else size="small" color="green">无逾期</ATag>
            </div>
          </template>
          <div class="module-content">
            <div class="overdue-stats">
              <div class="risk-stat" :class="{ danger: selectedReport.overdueInfo.overdueCount > 0 }">
                <span class="risk-value">{{ selectedReport.overdueInfo.overdueCount }}</span>
                <span class="risk-label">历史逾期次数</span>
              </div>
              <div class="risk-stat" :class="{ danger: selectedReport.overdueInfo.maxOverdueDays > 30 }">
                <span class="risk-value">{{ selectedReport.overdueInfo.maxOverdueDays || 0 }}</span>
                <span class="risk-label">最长逾期天数</span>
              </div>
              <div class="risk-stat" :class="{ danger: selectedReport.overdueInfo.currentOverdueCount > 0 }">
                <span class="risk-value">{{ selectedReport.overdueInfo.currentOverdueCount }}</span>
                <span class="risk-label">当前逾期数</span>
              </div>
              <div class="risk-stat">
                <span class="risk-value">{{ formatAmount(selectedReport.overdueInfo.overdueAmount) }}</span>
                <span class="risk-label">逾期金额</span>
              </div>
            </div>
            <div class="risk-indicators">
              <div
                v-for="note in selectedReport.specialNotes"
                :key="note.label"
                class="risk-indicator"
                :class="note.type"
              >
                <IconCaretRight class="indicator-arrow" />
                <span class="indicator-label">{{ note.label }}</span>
                <span class="indicator-desc">{{ note.description }}</span>
              </div>
            </div>
          </div>
        </a-collapse-item>

        <!-- 模块3：查询记录分析 -->
        <a-collapse-item key="query" class="module-item">
          <template #header>
            <div class="module-header">
              <IconHistory class="module-icon" />
              <span class="module-title">查询记录分析</span>
              <ATag size="small" color="arcoblue">{{ selectedReport.queryRecords.totalQueryCount }}次</ATag>
            </div>
          </template>
          <div class="module-content">
            <div class="query-summary">
              <div class="query-stat">
                <span class="query-value">{{ selectedReport.queryRecords.totalQueryCount }}</span>
                <span class="query-label">总查询次数</span>
              </div>
              <div class="query-stat" :class="{ warning: selectedReport.queryRecords.queriesLast3Months >= 3 }">
                <span class="query-value">{{ selectedReport.queryRecords.queriesLast3Months }}</span>
                <span class="query-label">近3个月</span>
              </div>
            </div>
            <div class="query-reasons">
              <h4 class="reasons-title">查询原因分布</h4>
              <div class="reason-list">
                <div v-for="item in selectedReport.queryRecords.queryReasons" :key="item.reason" class="reason-item">
                  <span class="reason-name">{{ item.reason }}</span>
                  <div class="reason-bar-track">
                    <div
                      class="reason-bar-fill"
                      :style="{ width: `${(item.count / selectedReport.queryRecords.totalQueryCount) * 100}%` }"
                    ></div>
                  </div>
                  <span class="reason-count">{{ item.count }}次</span>
                </div>
              </div>
            </div>
          </div>
        </a-collapse-item>

        <!-- 模块4：账户明细 -->
        <a-collapse-item key="accounts" class="module-item">
          <template #header>
            <div class="module-header">
              <IconAccount class="module-icon" />
              <span class="module-title">账户明细</span>
              <ATag size="small" color="arcoblue">{{ selectedReport.accounts.length }}个账户</ATag>
            </div>
          </template>
          <div class="module-content">
            <a-table
              :data="selectedReport.accounts"
              :columns="accountColumns"
              :pagination="{ pageSize: 5 }"
              size="small"
              :bordered="true"
            >
              <template #type="{ record }">
                <ATag :color="record.type === 'credit_card' ? 'blue' : 'green'">
                  {{ record.type === 'credit_card' ? '信用卡' : '贷款' }}
                </ATag>
              </template>
              <template #overdueStatus="{ record }">
                <span :class="getOverdueClass(record.overdueStatus)">
                  {{ record.overdueStatus }}
                </span>
              </template>
              <template #usedAmount="{ record }">
                <span>{{ formatAmount(record.usedAmount) }}</span>
              </template>
            </a-table>
          </div>
        </a-collapse-item>
      </a-collapse>

      <!-- 备注区域 -->
      <div class="notes-section">
        <div class="notes-header">
          <h3 class="section-title">
            <IconMessage class="title-icon" />
            业务备注
          </h3>
          <AButton type="primary" size="small" @click="showNoteModal = true">
            <template #icon><IconPlus /></template>
            添加备注
          </AButton>
        </div>
        <div v-if="creditNotes.length === 0" class="notes-empty">
          <p>暂无备注</p>
        </div>
        <div v-else class="notes-list">
          <div v-for="note in creditNotes" :key="note.id" class="note-item">
            <div class="note-content">{{ note.content }}</div>
            <div class="note-meta">
              <span class="note-creator">{{ note.creator }}</span>
              <span class="note-time">{{ note.createTime }}</span>
              <AButton type="text" size="mini" @click="handleDeleteNote(note.id)">
                <IconDelete />
              </AButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加备注弹窗 -->
    <a-modal
      v-model:visible="showNoteModal"
      title="添加备注"
      @ok="handleAddNote"
      @cancel="noteContent = ''"
      :ok-loading="noteLoading"
    >
      <a-textarea
        v-model="noteContent"
        placeholder="请输入备注内容（最多500字）"
        :max-length="500"
        show-word-limit
        rows="4"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  IconFile, IconRefresh, IconWallet, IconMoney, IconBankCard, IconBill,
  IconWarning, IconHistory, IconAccount, IconMessage, IconPlus, IconDelete,
  IconCaretRight, IconCaretUp, IconCaretDown
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import type { CreditReport, CreditNote } from '../../../mock/creditReport'
import {
  fetchCreditReports,
  fetchCreditNotes,
  addCreditNote as addNote,
  deleteCreditNote
} from '../../../api/creditReport'

const props = defineProps<{
  userId?: string
}>()

const loading = ref(false)
const creditReports = ref<CreditReport[]>([])
const selectedReportId = ref('')
const creditNotes = ref<CreditNote[]>([])
const activeModules = ref(['overview'])
const showNoteModal = ref(false)
const noteContent = ref('')
const noteLoading = ref(false)

const selectedReport = computed(() =>
  creditReports.value.find(r => r.id === selectedReportId.value)
)

const accountColumns = [
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 80 },
  { title: '银行', dataIndex: 'bank', width: 100 },
  { title: '账号', dataIndex: 'accountNo', width: 150 },
  { title: '已用额度', dataIndex: 'usedAmount', slotName: 'usedAmount', width: 120 },
  { title: '逾期状态', dataIndex: 'overdueStatus', slotName: 'overdueStatus', width: 80 }
]

function getScoreColor(score: number): string {
  if (score >= 750) return 'green'
  if (score >= 650) return 'cyan'
  if (score >= 550) return 'orange'
  return 'red'
}

function getScoreClass(score: number): string {
  if (score >= 750) return 'excellent'
  if (score >= 650) return 'good'
  if (score >= 550) return 'fair'
  return 'poor'
}

function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    'AAA': 'green', 'AA': 'cyan', 'A': 'blue',
    'BBB': 'arcoblue', 'BB': 'orange', 'B': 'orangered', 'CCC': 'red'
  }
  return colors[level] || 'gray'
}

function getOverdueClass(status: string): string {
  if (status === '正常') return 'status-normal'
  if (status === '逾期') return 'status-warning'
  return 'status-danger'
}

function formatDate(date: string): string {
  return date || '-'
}

function formatAmount(amount: number): string {
  if (!amount) return '0'
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}万`
  }
  return amount.toLocaleString()
}

async function loadReports() {
  if (!props.userId) return
  loading.value = true
  try {
    creditReports.value = await fetchCreditReports(props.userId)
    if (creditReports.value.length > 0) {
      selectedReportId.value = creditReports.value[0].id
    }
  } catch (e) {
    Message.error('加载征信报告失败')
  } finally {
    loading.value = false
  }
}

async function loadNotes() {
  if (!selectedReportId.value) return
  try {
    creditNotes.value = await fetchCreditNotes(selectedReportId.value)
  } catch (e) {
    console.error('加载备注失败', e)
  }
}

function handleReportChange() {
  loadNotes()
}

function refreshReports() {
  loadReports()
  Message.success('刷新成功')
}

async function handleAddNote() {
  if (!noteContent.value.trim()) {
    Message.warning('请输入备注内容')
    return
  }
  noteLoading.value = true
  try {
    const newNote = await addNote(selectedReportId.value, noteContent.value)
    creditNotes.value.unshift(newNote)
    showNoteModal.value = false
    noteContent.value = ''
    Message.success('添加备注成功')
  } catch (e) {
    Message.error('添加备注失败')
  } finally {
    noteLoading.value = false
  }
}

async function handleDeleteNote(noteId: string) {
  try {
    await deleteCreditNote(noteId)
    creditNotes.value = creditNotes.value.filter(n => n.id !== noteId)
    Message.success('删除备注成功')
  } catch (e) {
    Message.error('删除备注失败')
  }
}

watch(() => props.userId, (newVal) => {
  if (newVal) {
    loadReports()
  }
}, { immediate: true })

watch(selectedReportId, () => {
  if (selectedReportId.value) {
    loadNotes()
  }
})
</script>

<style scoped>
.credit-report-panel {
  padding: 16px;
}

.report-selector {
  margin-bottom: 16px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: var(--subapp-primary);
}

.selector-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-select {
  min-width: 250px;
}

.report-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-date {
  color: var(--color-text-2);
}

.report-score {
  color: var(--color-text-3);
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-3);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  margin: 0;
}

/* 摘要卡片 */
.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  margin-bottom: 16px;
}

.summary-card.good {
  background: linear-gradient(135deg, var(--subapp-success) 0%, #38ef7d 100%);
}

.summary-card.fair {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.summary-card.poor {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
}

.summary-header {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.summary-score {
  text-align: center;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  display: block;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  opacity: 0.8;
}

.summary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-size: 14px;
  opacity: 0.8;
}

.info-value {
  font-size: 14px;
}

.summary-score-bar {
  position: relative;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 4px 8px;
}

.score-indicator {
  position: absolute;
  top: -8px;
  transition: left 0.3s ease;
}

.indicator-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #fff;
}

.score-range {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

/* 折叠面板 */
.module-collapse {
  margin-bottom: 16px;
}

.module-item {
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-icon {
  color: var(--subapp-primary);
}

.module-icon.risk {
  color: var(--subapp-warning);
}

.module-title {
  font-weight: 500;
}

.module-content {
  padding: 12px 0;
}

/* 统计卡片 */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: var(--color-fill-1);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.card-icon { background: var(--subapp-primary); }
.loan-icon { background: var(--subapp-success); }
.amount-icon { background: var(--subapp-warning); }
.used-icon { background: var(--subapp-danger); }

.stat-value {
  font-size: 18px;
  font-weight: 600;
  display: block;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-3);
}

.utilization-bar {
  margin-top: 12px;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 4px;
}

.warning {
  color: var(--subapp-warning);
}

.bar-track {
  height: 8px;
  background: var(--color-fill-2);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--subapp-success);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-fill.warning {
  background: var(--subapp-warning);
}

.bar-fill.danger {
  background: var(--subapp-danger);
}

/* 风险统计 */
.overdue-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.risk-stat {
  text-align: center;
  padding: 12px;
  background: var(--color-fill-1);
  border-radius: 8px;
}

.risk-stat.danger {
  background: #fff2e8;
}

.risk-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--subapp-success);
  display: block;
}

.risk-stat.danger .risk-value {
  color: var(--subapp-danger);
}

.risk-label {
  font-size: 12px;
  color: var(--color-text-3);
}

.risk-indicators {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.risk-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.risk-indicator.warning {
  background: #fff2e8;
  color: var(--subapp-warning);
}

.risk-indicator.danger {
  background: #fff1f0;
  color: var(--subapp-danger);
}

.risk-indicator.info {
  background: #f0f5ff;
  color: var(--subapp-primary);
}

.indicator-label {
  font-weight: 500;
}

.indicator-desc {
  color: var(--color-text-3);
}

/* 查询记录 */
.query-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.query-stat {
  text-align: center;
}

.query-stat.warning .query-value {
  color: var(--subapp-warning);
}

.query-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--subapp-primary);
  display: block;
}

.query-label {
  font-size: 12px;
  color: var(--color-text-3);
}

.reason-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reason-name {
  width: 80px;
  font-size: 14px;
}

.reason-bar-track {
  flex: 1;
  height: 8px;
  background: var(--color-fill-2);
  border-radius: 4px;
  overflow: hidden;
}

.reason-bar-fill {
  height: 100%;
  background: var(--subapp-primary);
  border-radius: 4px;
}

.reason-count {
  width: 50px;
  text-align: right;
  font-size: 12px;
  color: var(--color-text-3);
}

.status-normal {
  color: var(--subapp-success);
}

.status-warning {
  color: var(--subapp-warning);
}

.status-danger {
  color: var(--subapp-danger);
}

/* 备注区域 */
.notes-section {
  background: var(--color-fill-1);
  border-radius: 8px;
  padding: 16px;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notes-empty {
  text-align: center;
  color: var(--color-text-3);
  padding: 16px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-item {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
}

.note-content {
  font-size: 14px;
  color: var(--color-text-1);
  margin-bottom: 8px;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-3);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}
</style>
