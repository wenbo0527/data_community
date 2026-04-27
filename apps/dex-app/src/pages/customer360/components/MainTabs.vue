<template>
  <div class="main-tabs-container">
    <a-tabs 
      v-model:active-key="activeMainTab" 
      type="line" 
      size="default"
      class="main-tabs"
      position="left"
      @change="handleMainTabChange"
    >
      <a-tab-pane key="all-around">
        <template #title>
          <div class="tab-title-enhanced all-around">
            <IconDashboard />
            <span>客户概览</span>
          </div>
        </template>
        <div class="tab-content">
          <CustomerProfile
            :user-info="userInfo"
          />
        </div>
      </a-tab-pane>

      <a-tab-pane key="postloan">
        <template #title>
          <div class="tab-title-enhanced">
            <IconBarChart />
            <span>贷后管理</span>
          </div>
        </template>
        <div class="tab-content">
          <div class="data-zone offline-zone">
            <div class="zone-header">
              <div class="zone-title">
                <IconBarChart />
                <span>贷后综合分析</span>
                <span class="update-time">数据更新于 T-1</span>
              </div>
            </div>
            <PostLoanProfile :user-info="userInfo" :collection-records="collectionRecords" />
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="credit">
        <template #title>
          <div class="tab-title-enhanced">
            <IconSafe />
            <span>征信</span>
          </div>
        </template>
        <div class="tab-content">
          <div class="data-zone offline-zone credit-zone">
            <!-- 列表视图 -->
            <CreditReportList
              v-if="creditView === 'list'"
              :reports="userInfo?.creditReports || []"
              @refresh="handleModuleChange('credit-records')"
              @view-detail="handleViewCreditDetail"
              @compare="handleCompareReports"
            />
            <!-- 详情视图 -->
            <CreditReportDetail
              v-else-if="creditView === 'detail' && selectedReport"
              :report="selectedReport"
              @back="creditView = 'list'"
              @compare="handleCompareSingleReport"
            />
            <!-- 对比视图 -->
            <CreditReportCompare
              v-else-if="creditView === 'compare' && compareReports.length === 2"
              :report-a="compareReports[0]"
              :report-b="compareReports[1]"
              @back="creditView = 'list'"
            />
          </div>
        </div>
      </a-tab-pane>
      
      <a-tab-pane 
        v-for="product in products" 
        :key="product.productKey"
      >
        <template #title>
          <div class="tab-title-enhanced">
            <component :is="getProductIcon(product.productName)" />
            <span>{{ product.productName }}</span>
            <div class="tab-status-indicator" :class="product.status">
              <div class="status-dot"></div>
            </div>
          </div>
        </template>
        <div class="tab-content">
          <InfoModuleTabs 
            :product-key="product.productKey"
            :product-data="product"
            :user-info="userInfo"
            :loading="loading"
            :show-debug-panel="showDebugPanel"
            @module-change="handleModuleChange"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  IconDashboard, 
  IconSafe, 
  IconInteraction, 
  IconStorage,
  IconBarChart
} from '@arco-design/web-vue/es/icon'
import CustomerProfile from './CustomerProfile.vue'
import InfoModuleTabs from './InfoModuleTabs.vue'
import PostLoanProfile from './profile/PostLoanProfile.vue'
import CreditReportList from './CreditReportList.vue'
import CreditReportDetail from './CreditReportDetail.vue'
import CreditReportCompare from './CreditReportCompare.vue'

interface Product {
  productKey: string
  productName: string
  productType: string
  status: string
  balance?: number
  creditLimit?: number
  overdueAmount?: number
  overdueDays?: number
}

interface Props {
  userInfo?: any
  products?: Product[]
  creditInfo?: any
  collectionRecords?: any[]
  loading?: boolean
  showDebugPanel?: boolean
}

withDefaults(defineProps<Props>(), {
  userInfo: () => ({}),
  products: () => [],
  creditInfo: () => ({}),
  collectionRecords: () => [],
  loading: false,
  showDebugPanel: false
})

const getProductIcon = (productName: string) => {
  if (productName.includes('贷')) {return IconSafe}
  if (productName.includes('理财')) {return IconInteraction}
  if (productName.includes('存款')) {return IconStorage}
  return IconSafe // 默认图标
}

const emit = defineEmits<{
  'main-tab-change': [tabKey: string]
  'module-change': [moduleKey: string]
}>()

const activeMainTab = ref('all-around')
const activeCreditTab = ref('credit-records')

// 征信模块内部视图状态
type CreditView = 'list' | 'detail' | 'compare'
const creditView = ref<CreditView>('list')
const compareReports = ref<any[]>([])

const handleMainTabChange = (tabKey: string) => {
  emit('main-tab-change', tabKey)
}

const handleModuleChange = (moduleKey: string) => {
  emit('module-change', moduleKey)
}

// 征信模块视图控制
const selectedReport = ref<any>(null)

const handleViewCreditDetail = (report: any) => {
  selectedReport.value = report
  creditView.value = 'detail'
}

const handleCompareReports = (reports: any[]) => {
  compareReports.value = reports
  creditView.value = 'compare'
}

const handleCompareSingleReport = (report: any) => {
  // 直接从 userInfo prop 中查找另一份报告
  const reports = (userInfo as any)?.creditReports || []
  const otherReport = reports.find((r: any) => r.id !== report.id)
  if (otherReport) {
    compareReports.value = [report, otherReport]
    creditView.value = 'compare'
  }
}

// 移除了handleDebugInfo函数


</script>

<style scoped>
.main-tabs-container {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
}

.tab-content {
  padding: 0;
  height: 100%;
  overflow: auto;
  flex: 1;
}

.data-zone {
  background: #fff;
  border-radius: 8px;
  margin: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100% - 32px);
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--subapp-bg-secondary);
  flex-shrink: 0;
}

.zone-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.zone-title .arco-icon {
  margin-right: 8px;
  font-size: 18px;
}

.update-time {
  font-size: 12px;
  color: var(--subapp-text-tertiary);
  font-weight: normal;
  margin-left: 12px;
}

/* 覆盖内部 tabs 的样式，使其占满剩余空间 */
.data-zone > .arco-tabs,
.data-zone > .postloan-profile {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.data-zone > .arco-tabs :deep(.arco-tabs-content),
.data-zone > .postloan-profile :deep(.arco-tabs-content) {
  padding-top: 8px;
  flex: 1;
  overflow: auto;
}

.data-zone > .arco-tabs :deep(.arco-tabs-nav),
.data-zone > .postloan-profile :deep(.arco-tabs-nav) {
  margin-bottom: 0;
  padding: 0 20px;
}

/* 只有顶层的 tabs 应用特殊的 Flex 和左侧布局 */
:deep(> .arco-tabs) {
  height: 100%;
  display: flex;
  flex-direction: row; /* 修改为横向排列，使左侧导航和右侧内容并排 */
  align-items: stretch;
}

:deep(> .arco-tabs > .arco-tabs-content-holder) {
  flex: 1;
  overflow: hidden;
  height: 100%;
  padding-left: 20px;
}

:deep(> .arco-tabs > .arco-tabs-content-holder > .arco-tabs-content) {
  height: 100%;
  flex: 1;
}

:deep(> .arco-tabs > .arco-tabs-content-holder > .arco-tabs-content > .arco-tabs-tabpane) {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

:deep(> .arco-tabs > .arco-tabs-nav.arco-tabs-nav-left) {
  margin-bottom: 0;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 16px 0;
  flex-shrink: 0;
  width: 160px;
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-tab) {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
  justify-content: flex-start; /* 左对齐 */
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-tab:hover) {
  color: var(--subapp-info);
  background: rgba(24, 144, 255, 0.05);
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-tab.arco-tabs-tab-active) {
  color: var(--subapp-info);
  font-weight: 600;
  background: rgba(24, 144, 255, 0.1);
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-nav-ink) {
  background: var(--subapp-info);
  width: 2px;
  transition: all 0.3s ease;
}

/* 客户概览Tab特殊样式 */
:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-tab[data-key="all-around"]) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 0 6px 6px 0;
  margin-bottom: 8px;
  margin-right: 0;
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-tab[data-key="all-around"]:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  color: #fff;
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-tab-active[data-key="all-around"]) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-nav-tab) {
  flex-direction: column;
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-nav-tab-list) {
  flex-direction: column;
  transform: none !important;
  transition: transform 0.3s ease;
}

:deep(> .arco-tabs > .arco-tabs-nav .arco-tabs-nav-operations) {
  display: none;
}

.tab-title-enhanced {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0; /* 调整内边距适应左对齐 */
  border-radius: 4px;
  transition: all 0.3s ease;
  width: 100%;
}

.tab-title-enhanced:hover {
  background: rgba(24, 144, 255, 0.1);
}

.tab-title-enhanced :deep(.arco-icon) {
  font-size: 16px;
}

.tab-status-indicator {
  position: relative;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.tab-status-indicator.正常 .status-dot {
  background: #52c41a;
}

.tab-status-indicator.逾期 .status-dot {
  background: var(--subapp-danger);
}

.tab-status-indicator.关闭 .status-dot {
  background: #8c8c8c;
}

.tab-status-indicator.冻结 .status-dot {
  background: #fa8c16;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
