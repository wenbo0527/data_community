<template>
  <div class="risk-profile">
    <div class="profile-section">
      <h3 class="section-title">欺诈风险</h3>
      <div class="tags-container">
        <a-tag color="green">{{ fraudRiskTags.deviceRisk }}</a-tag>
        <a-tag color="green">{{ fraudRiskTags.behaviorRisk }}</a-tag>
        <a-tag color="green">{{ fraudRiskTags.identityRisk }}</a-tag>
        <a-tag color="green">{{ fraudRiskTags.associationRisk }}</a-tag>
      </div>
    </div>

    <div class="profile-section">
      <h3 class="section-title">信用风险</h3>
      <div class="tags-container">
        <a-tag color="blue">{{ creditRiskTags.creditRecord }}</a-tag>
        <a-tag color="orange">{{ creditRiskTags.multipleLoans }}</a-tag>
        <a-tag color="green">{{ creditRiskTags.repaymentAbility }}</a-tag>
        <a-tag color="blue">{{ creditRiskTags.historicalPerformance }}</a-tag>
        <a-tag color="purple">{{ creditRiskTags.creditLevel }}</a-tag>
        <a-tag color="cyan">{{ creditRiskTags.debtLevel }}</a-tag>
        <a-tag color="geekblue">{{ creditRiskTags.incomeStability }}</a-tag>
      </div>
      
      <!-- 征信记录展示 -->
      <div class="credit-report-section" v-if="creditInfo">
        <h4 class="subsection-title">最新征信报告</h4>
        <div class="credit-report-card">
          <div class="report-header">
            <div class="report-info">
              <span class="report-time">报告时间：{{ creditInfo.reportTime }}</span>
              <span class="query-org">查询机构：{{ creditInfo.queryOrg }}</span>
            </div>
            <div class="report-score">
              <span class="score-label">征信评分</span>
              <span class="score-value">{{ creditInfo.creditScore }}</span>
            </div>
          </div>
          
          <div class="report-content">
            <div class="status-info">
              <a-tag :color="creditInfo.status === '正常' ? 'green' : 'red'">
                {{ creditInfo.status }}
              </a-tag>
              <a-tag :color="getRiskLevelColor(creditInfo.riskLevel)">
                {{ creditInfo.riskLevel }}
              </a-tag>
              <span class="query-count">最近查询：{{ creditInfo.recentQueries }}次</span>
            </div>
            
            <div class="report-actions">
              <a-button type="primary" size="small" @click="viewFullReport">
                查看完整报告
              </a-button>
              <a-button size="small" @click="downloadReport">
                下载PDF
              </a-button>
              <a-button size="small" @click="copyReportLink">
                复制链接
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-section">
      <h3 class="section-title">行为风险</h3>
      <div class="tags-container">
        <a-tag color="green">{{ behaviorRiskTags.transactionRisk }}</a-tag>
        <a-tag color="green">{{ behaviorRiskTags.operationRisk }}</a-tag>
        <a-tag color="green">{{ behaviorRiskTags.fundRisk }}</a-tag>
      </div>
    </div>

    <div class="profile-section">
      <h3 class="section-title">逾期情况</h3>
      <div class="tags-container">
        <a-tag color="green">{{ overdueTags.overdueHistory }}</a-tag>
        <a-tag color="green">{{ overdueTags.overdueDegree }}</a-tag>
        <a-tag color="blue">{{ overdueTags.overdueTrend }}</a-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Message } from '@arco-design/web-vue'

interface Props {
  userInfo?: any
  creditInfo?: any
}

const props = withDefaults(defineProps<Props>(), {
  userInfo: () => ({}),
  creditInfo: () => ({
    reportTime: '2024-01-15 14:30:25',
    queryOrg: '中国人民银行征信中心',
    creditScore: 785,
    creditLevel: 'AA',
    status: '正常',
    riskLevel: '低风险',
    recentQueries: 2
  })
})

// 模拟数据
const fraudRiskTags = computed(() => ({
  deviceRisk: '正常设备',
  behaviorRisk: '正常行为',
  identityRisk: '身份真实',
  associationRisk: '无关联风险'
}))

const creditRiskTags = computed(() => ({
  creditRecord: '征信正常',
  multipleLoans: '轻度多头(2-3家)',
  repaymentAbility: '强',
  historicalPerformance: '履约良好',
  creditLevel: 'AA',
  debtLevel: '适度负债',
  incomeStability: '稳定'
}))

const behaviorRiskTags = computed(() => ({
  transactionRisk: '低风险',
  operationRisk: '正常操作',
  fundRisk: '资金安全'
}))

const overdueTags = computed(() => ({
  overdueHistory: '无逾期',
  overdueDegree: '无逾期记录',
  overdueTrend: '稳定状态'
}))

const getRiskLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    '低风险': 'green',
    '中风险': 'orange',
    '高风险': 'red'
  }
  return colorMap[level] || 'default'
}

const viewFullReport = () => {
  Message.info('跳转到征信报告详情页面')
}

const downloadReport = () => {
  Message.success('征信报告PDF下载中...')
}

const copyReportLink = () => {
  Message.success('征信报告链接已复制到剪贴板')
}
</script>

<style scoped>
.risk-profile {
  padding: 16px;
}

.profile-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.subsection-title {
  margin: 16px 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #595959;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags-container .ant-tag {
  margin: 0;
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 16px;
}

.credit-report-section {
  margin-top: 16px;
}

.credit-report-card {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-time,
.query-org {
  font-size: 12px;
  color: #8c8c8c;
}

.report-score {
  text-align: right;
}

.score-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.score-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.report-content {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.query-count {
  font-size: 12px;
  color: #8c8c8c;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.report-actions .ant-btn {
  height: 28px;
  font-size: 12px;
}
</style>