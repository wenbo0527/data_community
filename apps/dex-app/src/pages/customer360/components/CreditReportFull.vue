<template>
  <div class="credit-report-summary">
    <!-- 顶部导航 -->
    <div class="report-nav">
      <div class="nav-title">
        <IconFile class="nav-icon" />
        <span>征信报告速览</span>
      </div>
      <div class="nav-actions">
        <a-button-group size="small">
          <a-button @click="expandAll">全部展开</a-button>
          <a-button @click="collapseAll">全部折叠</a-button>
        </a-button-group>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <a-spin size="large" />
      <span>加载中...</span>
    </div>

    <!-- 报告内容 -->
    <div v-else-if="reportData" class="report-content">
      
      <!-- ========== 模块一：个人基本信息 ========== -->
      <div class="report-section">
        <div 
          class="section-header"
          :class="{ 'is-expanded': expandedSections.basic }"
          @click="toggleSection('basic')"
        >
          <div class="section-header-left">
            <IconDown class="collapse-icon" :class="{ rotated: expandedSections.basic }" />
            <span class="section-title">个人基本信息</span>
          </div>
          <div class="section-summary" v-if="!expandedSections.basic">
            {{ getBasicSummary() }}
          </div>
          <div class="expand-hint">{{ expandedSections.basic ? '收起' : '展开' }}</div>
        </div>
        
        <div class="section-body" v-show="expandedSections.basic">
          <!-- 折叠态显示的精简信息 -->
          <div class="summary-cards">
            <div class="summary-card">
              <span class="card-label">姓名</span>
              <span class="card-value masked">{{ reportData.identityInfo.name }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">身份证</span>
              <span class="card-value masked">{{ maskIdCard(reportData.identityInfo.idCard) }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">手机</span>
              <span class="card-value masked">{{ maskPhone(reportData.identityInfo.phone) }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">婚姻状态</span>
              <span class="card-value">{{ reportData.identityInfo.maritalStatus || '-' }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">学历</span>
              <span class="card-value">{{ reportData.identityInfo.education || '-' }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">就业状态</span>
              <span class="card-value">{{ reportData.identityInfo.employmentStatus || '-' }}</span>
            </div>
          </div>

          <!-- 展开后显示完整信息 -->
          <div class="detail-section">
            <!-- 身份信息 -->
            <div class="detail-block">
              <div class="block-title">身份信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">报告生成时间</span>
                  <span class="info-value">{{ reportData.identityInfo.reportGenerateTime || reportData.reportInfo?.reportGenerateTime }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">姓名</span>
                  <span class="info-value masked">{{ reportData.identityInfo.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">身份证号码</span>
                  <span class="info-value masked">{{ reportData.identityInfo.idCard }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">出生日期</span>
                  <span class="info-value">{{ reportData.identityInfo.birthDate }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">婚姻状态</span>
                  <span class="info-value">{{ reportData.identityInfo.maritalStatus }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">学历</span>
                  <span class="info-value">{{ reportData.identityInfo.education }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">学位</span>
                  <span class="info-value">{{ reportData.identityInfo.degree }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">就业状态</span>
                  <span class="info-value">{{ reportData.identityInfo.employmentStatus }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">国籍</span>
                  <span class="info-value">{{ reportData.identityInfo.nationality }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">电子邮箱</span>
                  <span class="info-value">{{ reportData.identityInfo.email }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">通讯地址</span>
                  <span class="info-value masked">{{ reportData.identityInfo.postalAddress }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">户籍地址</span>
                  <span class="info-value masked">{{ reportData.identityInfo.householdAddress }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">手机号码</span>
                  <span class="info-value masked">{{ reportData.identityInfo.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">信息更新日期</span>
                  <span class="info-value">{{ reportData.identityInfo.phoneUpdateDate }}</span>
                </div>
              </div>
            </div>

            <!-- 配偶信息 -->
            <div class="detail-block" v-if="reportData.spouseInfo">
              <div class="block-title">配偶信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">配偶姓名</span>
                  <span class="info-value masked">{{ reportData.spouseInfo.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">配偶证件类型</span>
                  <span class="info-value">{{ reportData.spouseInfo.idType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">配偶证件号码</span>
                  <span class="info-value masked">{{ reportData.spouseInfo.idNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">配偶工作单位</span>
                  <span class="info-value">{{ reportData.spouseInfo.employer }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">配偶联系电话</span>
                  <span class="info-value masked">{{ reportData.spouseInfo.phone }}</span>
                </div>
              </div>
            </div>
            <div class="detail-block" v-else>
              <div class="block-title">配偶信息</div>
              <div class="empty-block">无</div>
            </div>

            <!-- 居住信息 -->
            <div class="detail-block" v-if="reportData.residenceInfo?.length">
              <div class="block-title">居住信息</div>
              <div v-for="(res, idx) in reportData.residenceInfo" :key="idx" class="info-sub-block">
                <div class="sub-block-label">居住{{ idx + 1 }}</div>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">状况</span>
                    <span class="info-value">{{ res.condition }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">信息更新日期</span>
                    <span class="info-value">{{ res.updateDate }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="info-label">居住地址</span>
                    <span class="info-value masked">{{ res.address }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">住宅电话</span>
                    <span class="info-value masked">{{ res.homePhone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 职业信息 -->
            <div class="detail-block" v-if="reportData.occupationInfo">
              <div class="block-title">职业信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">工作单位</span>
                  <span class="info-value masked">{{ reportData.occupationInfo.employer }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">单位性质</span>
                  <span class="info-value">{{ reportData.occupationInfo.employerType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">就业状况</span>
                  <span class="info-value">{{ reportData.occupationInfo.employmentStatus }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">职业</span>
                  <span class="info-value">{{ reportData.occupationInfo.occupation }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">行业</span>
                  <span class="info-value">{{ reportData.occupationInfo.industry }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">职务</span>
                  <span class="info-value">{{ reportData.occupationInfo.jobTitle }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">职称</span>
                  <span class="info-value">{{ reportData.occupationInfo.professionalTitle }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">进入本单位年份</span>
                  <span class="info-value">{{ reportData.occupationInfo.joinYear }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">信息更新时间</span>
                  <span class="info-value">{{ reportData.occupationInfo.updateDate }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">单位地址</span>
                  <span class="info-value masked">{{ reportData.occupationInfo.employerAddress }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">单位电话</span>
                  <span class="info-value masked">{{ reportData.occupationInfo.employerPhone }}</span>
                </div>
              </div>
            </div>
            <div class="detail-block" v-else>
              <div class="block-title">职业信息</div>
              <div class="empty-block">无</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 模块二：信息摘要 ========== -->
      <div class="report-section">
        <div 
          class="section-header"
          :class="{ 'is-expanded': expandedSections.summary }"
          @click="toggleSection('summary')"
        >
          <div class="section-header-left">
            <IconDown class="collapse-icon" :class="{ rotated: expandedSections.summary }" />
            <span class="section-title">信息摘要</span>
          </div>
          <div class="section-summary" v-if="!expandedSections.summary">
            {{ getSummarySummary() }}
          </div>
          <div class="expand-hint">{{ expandedSections.summary ? '收起' : '展开' }}</div>
        </div>
        
        <div class="section-body" v-show="expandedSections.summary">
          <!-- 折叠态显示的精简信息 -->
          <div class="summary-cards" v-if="reportData.creditSummary">
            <div class="summary-card">
              <span class="card-label">信贷账户总数</span>
              <span class="card-value">{{ getTotalAccountCount() }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">授信总额</span>
              <span class="card-value">{{ formatAmount(getTotalCreditLimit()) }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">负债总额</span>
              <span class="card-value">{{ formatAmount(getTotalBalance()) }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">逾期账户数</span>
              <span class="card-value warning">{{ getOverdueAccountCount() }}</span>
            </div>
          </div>

          <!-- 展开后显示完整信息 -->
          <div class="detail-section">
            <!-- 信贷交易信息提示 -->
            <div class="detail-block" v-if="reportData.creditSummary?.loanTransactionSummary?.length">
              <div class="block-title">信贷交易信息提示</div>
              <a-table
                :columns="transactionColumns"
                :data="reportData.creditSummary.loanTransactionSummary"
                :pagination="false"
                size="small"
                bordered
              />
            </div>

            <!-- 信贷交易违约信息摘要 -->
            <div class="detail-block" v-if="reportData.creditSummary?.overdueSummary?.length">
              <div class="block-title">信贷交易违约信息摘要（逾期/透支信息汇总）</div>
              <a-table
                :columns="overdueColumns"
                :data="reportData.creditSummary.overdueSummary"
                :pagination="false"
                size="small"
                bordered
              />
            </div>

            <!-- 信贷交易授信及负债信息摘要 -->
            <div class="detail-block" v-if="reportData.creditSummary?.creditLiabilitySummary">
              <div class="block-title">信贷交易授信及负债信息摘要</div>
              
              <!-- 非循环贷账户 -->
              <div class="summary-sub-section">
                <div class="sub-title">非循环贷账户信息汇总</div>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">管理机构数</span>
                    <span class="summary-value">{{ reportData.creditSummary.creditLiabilitySummary.nonRevolvingLoans.institutionCount }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">账户数</span>
                    <span class="summary-value">{{ reportData.creditSummary.creditLiabilitySummary.nonRevolvingLoans.accountCount }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">授信总额</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.nonRevolvingLoans.totalCreditLimit) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">余额</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.nonRevolvingLoans.balance) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">最近6个月平均应还款</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.nonRevolvingLoans.avgPayment6M) }}</span>
                  </div>
                </div>
              </div>

              <!-- 循环贷账户 -->
              <div class="summary-sub-section">
                <div class="sub-title">循环贷账户信息汇总</div>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">管理机构数</span>
                    <span class="summary-value">{{ reportData.creditSummary.creditLiabilitySummary.revolvingLoans.institutionCount }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">账户数</span>
                    <span class="summary-value">{{ reportData.creditSummary.creditLiabilitySummary.revolvingLoans.accountCount }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">授信总额</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.revolvingLoans.totalCreditLimit) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">余额</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.revolvingLoans.balance) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">最近6个月平均应还款</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.revolvingLoans.avgPayment6M) }}</span>
                  </div>
                </div>
              </div>

              <!-- 贷记卡账户 -->
              <div class="summary-sub-section">
                <div class="sub-title">贷记卡账户信息汇总</div>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">发卡机构数</span>
                    <span class="summary-value">{{ reportData.creditSummary.creditLiabilitySummary.creditCards.issuerCount }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">账户数</span>
                    <span class="summary-value">{{ reportData.creditSummary.creditLiabilitySummary.creditCards.accountCount }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">授信总额</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.creditCards.totalCreditLimit) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">已用额度</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.creditCards.usedAmount) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">最近6个月平均使用额度</span>
                    <span class="summary-value">{{ formatAmount(reportData.creditSummary.creditLiabilitySummary.creditCards.avgUsed6M) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <IconFile class="empty-icon" />
      <p class="empty-text">暂无征信报告</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { IconFile, IconDown } from '@arco-design/web-vue/es/icon'
import { fetchCreditReportFull, type CreditReportFull } from '@/mock/creditReportFull'

interface Props {
  userInfo?: any
}

const props = withDefaults(defineProps<Props>(), {
  userInfo: () => ({})
})

const loading = ref(false)
const reportData = ref<CreditReportFull | null>(null)

// 折叠状态 - 默认全部展开
const expandedSections = reactive({
  basic: true,      // 个人基本信息
  summary: true,     // 信息摘要
})

// 切换单个区块折叠/展开
const toggleSection = (section: 'basic' | 'summary') => {
  expandedSections[section] = !expandedSections[section]
}

// 全部展开
const expandAll = () => {
  expandedSections.basic = true
  expandedSections.summary = true
}

// 全部折叠
const collapseAll = () => {
  expandedSections.basic = false
  expandedSections.summary = false
}

// 格式化金额
const formatAmount = (amount: number | undefined) => {
  if (!amount && amount !== 0) return '-'
  return amount.toLocaleString('zh-CN')
}

// 掩码手机号
const maskPhone = (phone: string | undefined) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 掩码身份证
const maskIdCard = (idCard: string | undefined) => {
  if (!idCard) return '-'
  return idCard.replace(/(\d{3})\d+(\d{4})/, '$1************$2')
}

// 获取个人基本信息摘要
const getBasicSummary = () => {
  if (!reportData.value?.identityInfo) return ''
  const info = reportData.value.identityInfo
  return `${info.name || '-'} | ${maskIdCard(info.idCard)} | ${info.maritalStatus || '-'}`
}

// 获取信息摘要摘要
const getSummarySummary = () => {
  if (!reportData.value?.creditSummary?.creditLiabilitySummary) return ''
  const summary = reportData.value.creditSummary.creditLiabilitySummary
  const totalAccounts = (summary.nonRevolvingLoans?.accountCount || 0) + 
                        (summary.revolvingLoans?.accountCount || 0) + 
                        (summary.creditCards?.accountCount || 0)
  return `信贷账户 ${totalAccounts} 个 | 授信 ${formatAmount(summary.nonRevolvingLoans?.totalCreditLimit + summary.revolvingLoans?.totalCreditLimit + summary.creditCards?.totalCreditLimit)}`
}

// 获取信贷账户总数
const getTotalAccountCount = () => {
  if (!reportData.value?.creditSummary?.creditLiabilitySummary) return '-'
  const summary = reportData.value.creditSummary.creditLiabilitySummary
  return (summary.nonRevolvingLoans?.accountCount || 0) + 
         (summary.revolvingLoans?.accountCount || 0) + 
         (summary.creditCards?.accountCount || 0)
}

// 获取授信总额
const getTotalCreditLimit = () => {
  if (!reportData.value?.creditSummary?.creditLiabilitySummary) return 0
  const summary = reportData.value.creditSummary.creditLiabilitySummary
  return (summary.nonRevolvingLoans?.totalCreditLimit || 0) + 
         (summary.revolvingLoans?.totalCreditLimit || 0) + 
         (summary.creditCards?.totalCreditLimit || 0)
}

// 获取负债总额
const getTotalBalance = () => {
  if (!reportData.value?.creditSummary?.creditLiabilitySummary) return 0
  const summary = reportData.value.creditSummary.creditLiabilitySummary
  return (summary.nonRevolvingLoans?.balance || 0) + 
         (summary.revolvingLoans?.balance || 0) + 
         (summary.creditCards?.usedAmount || 0)
}

// 获取逾期账户数
const getOverdueAccountCount = () => {
  if (!reportData.value?.creditSummary?.overdueSummary?.length) return '0'
  const overdueList = reportData.value.creditSummary.overdueSummary
  const totalOverdue = overdueList.reduce((sum: number, item: any) => sum + (item.accountCount || 0), 0)
  return String(totalOverdue)
}

const transactionColumns = [
  { title: '业务类型', dataIndex: 'businessType' },
  { title: '账户数', dataIndex: 'accountCount' },
  { title: '首笔业务发放月份', dataIndex: 'firstLoanMonth' },
  { title: '合计', dataIndex: 'total' }
]

const overdueColumns = [
  { title: '账户类型', dataIndex: 'accountType' },
  { title: '账户数', dataIndex: 'accountCount' },
  { title: '月份数', dataIndex: 'monthCount' },
  { title: '单月最高逾期/透支总额', dataIndex: 'maxOverdueAmount' },
  { title: '最长逾期/透支月数', dataIndex: 'maxOverdueMonths' }
]

onMounted(async () => {
  loading.value = true
  try {
    const userId = props.userInfo?.userId || 'DEMO_USER'
    reportData.value = await fetchCreditReportFull(userId)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.credit-report-summary {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
}

/* 顶部导航 */
.report-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
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
  font-size: 16px;
}

.nav-actions {
  display: flex;
  gap: 8px;
}

/* 加载状态 */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #666;
}

/* 报告内容 */
.report-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

/* 区块 */
.report-section {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* 可折叠的头部 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.section-header:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-icon {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  transition: transform 0.2s;
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.section-summary {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.section-body {
  padding: 16px;
}

/* 摘要卡片 - 折叠态显示 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.card-label {
  font-size: 11px;
  color: #888;
}

.card-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--subapp-text-primary);
}

.card-value.masked {
  color: var(--subapp-danger);
  font-family: monospace;
}

.card-value.warning {
  color: #e6a23c;
}

/* 详情区域 - 展开态显示 */
.detail-section {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.detail-block {
  margin-bottom: 20px;
}

.detail-block:last-child {
  margin-bottom: 0;
}

.block-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--subapp-text-primary);
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid var(--subapp-info);
}

/* 信息块 */
.info-block {
  margin-bottom: 20px;
}

.info-sub-block {
  margin-bottom: 12px;
  padding: 10px;
  background: #fafafa;
  border-radius: 6px;
}

.sub-block-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-item.full-width {
  grid-column: span 3;
}

.info-label {
  font-size: 11px;
  color: #888;
}

.info-value {
  font-size: 12px;
  color: var(--subapp-text-primary);
}

.info-value.masked {
  color: var(--subapp-danger);
  font-family: monospace;
}

/* 空区块 */
.empty-block {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

/* 摘要子区块 */
.summary-sub-section {
  margin-bottom: 14px;
  padding: 10px;
  background: #fafafa;
  border-radius: 6px;
}

.sub-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--subapp-text-primary);
  margin-bottom: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 11px;
  color: #888;
}

.summary-value {
  font-size: 12px;
  font-weight: 500;
  color: var(--subapp-text-primary);
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.4;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* Arco table 样式覆盖 */
:deep(.arco-table) {
  font-size: 12px;
}

:deep(.arco-table-th) {
  background: #f7f8fa;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-item.full-width {
    grid-column: span 2;
  }
}
</style>