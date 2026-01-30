<template>
  <div class="credit-reports">
    <div class="section-header">
      <h3 class="section-title">
        <IconFile class="title-icon" />
        征信记录
      </h3>
      <div class="section-meta">
        <span class="record-count">共 {{ reports.length }} 条记录</span>
        <AButton 
          v-if="reports.length > 0"
          type="text" 
          size="small"
          @click="refreshReports"
        >
          <IconRefresh class="refresh-icon" />
          刷新
        </AButton>
      </div>
    </div>

    <div v-if="reports.length === 0" class="empty-state">
      <IconFile class="empty-icon" />
      <p class="empty-text">暂无征信记录</p>
    </div>

    <div v-else class="reports-list">
      <div 
        v-for="report in reports" 
        :key="report.id"
        class="report-item"
        :class="{
          'excellent': report.creditScore >= 750,
          'good': report.creditScore >= 650 && report.creditScore < 750,
          'fair': report.creditScore >= 550 && report.creditScore < 650,
          'poor': report.creditScore < 550
        }"
      >
        <div class="report-header">
          <div class="report-info">
            <span class="report-source">{{ report.source }}</span>
            <span class="report-date">{{ formatDate(report.queryDate) }}</span>
          </div>
          <div class="credit-score">
            <span class="score-label">信用评分</span>
            <span class="score-value">{{ report.creditScore }}</span>
          </div>
        </div>

        <div class="report-content">
          <div class="credit-overview">
            <div class="overview-item">
              <span class="overview-label">信用等级：</span>
              <ATag 
                :color="getCreditLevelColor(report.creditLevel)"
                class="credit-level-tag"
              >
                {{ report.creditLevel }}
              </ATag>
            </div>
            <div class="overview-item">
              <span class="overview-label">查询原因：</span>
              <span class="overview-value">{{ report.queryReason }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">查询机构：</span>
              <span class="overview-value">{{ report.queryInstitution }}</span>
            </div>
          </div>

          <div class="credit-details">
            <div class="detail-section">
              <h4 class="detail-title">信贷概况</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">信用卡账户：</span>
                  <span class="detail-value">{{ report.creditCardAccounts }}个</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">贷款账户：</span>
                  <span class="detail-value">{{ report.loanAccounts }}个</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">总授信额度：</span>
                  <span class="detail-value amount">{{ formatAmount(report.totalCreditLimit) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">已用额度：</span>
                  <span class="detail-value amount">{{ formatAmount(report.usedCredit) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="detail-title">逾期信息</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">逾期次数：</span>
                  <span class="detail-value" :class="{ 'warning': report.overdueCount > 0 }">
                    {{ report.overdueCount }}次
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">最长逾期：</span>
                  <span class="detail-value" :class="{ 'warning': report.maxOverdueDays > 0 }">
                    {{ report.maxOverdueDays }}天
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">当前逾期：</span>
                  <span class="detail-value" :class="{ 'danger': report.currentOverdue > 0 }">
                    {{ formatAmount(report.currentOverdue) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="detail-title">查询记录</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">近6个月查询：</span>
                  <span class="detail-value">{{ report.recentQueries }}次</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">贷款审批查询：</span>
                  <span class="detail-value">{{ report.loanQueries }}次</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">信用卡审批查询：</span>
                  <span class="detail-value">{{ report.creditCardQueries }}次</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="report.riskWarning" class="risk-warning">
            <IconExclamationCircle class="warning-icon" />
            <span class="warning-text">{{ report.riskWarning }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button as AButton, Tag as ATag } from '@arco-design/web-vue'
import { 
  IconFile, 
  IconRefresh, 
  IconExclamationCircle 
} from '@arco-design/web-vue/es/icon'
import { formatAmount } from '@/utils/formatUtils'

const props = defineProps({
  reports: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取信用等级颜色
const getCreditLevelColor = (level) => {
  const colorMap = {
    'AAA': 'green',
    'AA': 'green',
    'A': 'blue',
    'BBB': 'orange',
    'BB': 'orange',
    'B': 'red',
    'CCC': 'red',
    'CC': 'red',
    'C': 'red',
    'D': 'red'
  }
  return colorMap[level] || 'default'
}

// 刷新征信记录
const refreshReports = () => {
  emit('refresh')
}
</script>

<style scoped>
.credit-reports {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.title-icon {
  color: #1890ff;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-count {
  font-size: 12px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.refresh-icon {
  margin-right: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  margin: 0;
  font-size: 14px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  position: relative;
}

.report-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.report-item.excellent {
  border-left: 4px solid #52c41a;
}

.report-item.good {
  border-left: 4px solid #1890ff;
}

.report-item.fair {
  border-left: 4px solid #faad14;
}

.report-item.poor {
  border-left: 4px solid #ff4d4f;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.report-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-source {
  font-weight: 500;
  color: #262626;
}

.report-date {
  font-size: 12px;
  color: #8c8c8c;
}

.credit-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.score-label {
  font-size: 12px;
  color: #8c8c8c;
}

.score-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.credit-overview {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.overview-label {
  font-size: 13px;
  color: #8c8c8c;
}

.overview-value {
  font-size: 13px;
  color: #262626;
}

.credit-level-tag {
  font-size: 12px;
  font-weight: 500;
}

.credit-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
}

.detail-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 12px;
  color: #8c8c8c;
  min-width: 80px;
}

.detail-value {
  font-size: 13px;
  color: #262626;
}

.detail-value.amount {
  font-weight: 500;
  color: #1890ff;
}

.detail-value.warning {
  color: #faad14;
  font-weight: 500;
}

.detail-value.danger {
  color: #ff4d4f;
  font-weight: 500;
}

.risk-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff2e8;
  border: 1px solid #ffbb96;
  border-radius: 6px;
  margin-top: 8px;
}

.warning-icon {
  color: #fa8c16;
  flex-shrink: 0;
}

.warning-text {
  font-size: 13px;
  color: #d46b08;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .credit-reports {
    padding: 16px;
  }
  
  .report-item {
    padding: 16px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .credit-overview {
    flex-direction: column;
    gap: 8px;
  }
  
  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .credit-score {
    align-items: flex-start;
  }
}
</style>