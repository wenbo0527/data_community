<template>
  <div class="customer-overview">
    <div class="overview-header">
      <h4>客户概览</h4>
      <div class="header-actions">
        <a-button size="small" @click="refreshData">
          <template #icon><icon-refresh /></template>
          刷新
        </a-button>

        <!-- 查看联系人按钮 -->
        <a-button size="small" @click="showContacts">
          <template #icon><icon-user-group /></template>
          查看联系人
        </a-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <a-spin size="large" />
      <p>加载客户概览数据...</p>
    </div>
    
    <div v-else-if="!userInfo" class="empty-state">
      <a-empty description="暂无客户数据" />
    </div>
    
    <div v-else class="overview-content">
      <!-- 客户基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <icon-user class="card-icon" />
          <span class="card-title">客户基本信息</span>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">姓名</span>
              <span class="value">{{ userInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">客户号</span>
              <span class="value">{{ userInfo.customerId }}</span>
            </div>
            <div class="info-item">
              <span class="label">身份证号</span>
              <span class="value">{{ formatIdCard(userInfo.idCard) }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机号</span>
              <span class="value">{{ formatPhone(userInfo.phone) }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄</span>
              <span class="value">{{ userInfo.age }}岁</span>
            </div>
            <div class="info-item">
              <span class="label">性别</span>
              <span class="value">{{ userInfo.gender }}</span>
            </div>
            <div class="info-item">
              <span class="label">户籍</span>
              <span class="value">{{ userInfo.domicile }}</span>
            </div>
            <div class="info-item">
              <span class="label">身份证有效期</span>
              <span class="value">{{ userInfo.idCardExpiry }}</span>
            </div>
            <div class="info-item">
              <span class="label">用户状态</span>
              <a-tag :color="getStatusColor(userInfo.status)">{{ userInfo.status }}</a-tag>
            </div>
            <div class="info-item">
              <span class="label">自营总额度</span>
              <span class="value amount">{{ formatAmount(userInfo.totalCredit) }}</span>
            </div>
            <div class="info-item">
              <span class="label">自营已用额度</span>
              <span class="value amount">{{ formatAmount(userInfo.usedCredit) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 产品概览卡片（合并产品概览和风险概览） -->
      <div class="info-card">
        <div class="card-header">
          <icon-apps class="card-icon" />
          <span class="card-title">产品概览</span>
        </div>
        <div class="card-content">
          <div class="product-overview">
            <div class="overview-item">
              <span class="label">历史最大逾期天数</span>
              <span class="value highlight">{{ maxOverdueDays }}天</span>
            </div>
            <div class="overview-item">
              <span class="label">当前逾期天数</span>
              <span class="value highlight">{{ currentOverdueDays }}天</span>
            </div>
            <div class="overview-item">
              <span class="label">当前总在贷余额</span>
              <span class="value highlight">{{ formatAmount(currentTotalLoanBalance) }}</span>
            </div>
            <div class="overview-item">
              <span class="label">当前总授信金额</span>
              <span class="value highlight">{{ formatAmount(currentTotalCreditAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  </div>
  
  <!-- APP信息抽屉 -->
  <AppInfoDrawer 
    v-model:visible="appDrawerVisible"
    :app-info="currentAppInfo"
    @close="closeAppDrawer"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  IconUser,
  IconApps,
  IconSafe,
  IconMobile,
  // IconHistory, IconCheckCircle, IconExclamationCircle, IconInfoCircle 已删除（最近活动相关）
  IconRefresh,
  IconUserGroup
} from '@arco-design/web-vue/es/icon'
import AppInfoDrawer from './AppInfoDrawer.vue'

interface Props {
  productKey: string
  productData?: any
  userInfo?: any
  loading?: boolean
}

interface Emits {
  (e: 'debug-info', info: any): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// APP信息抽屉状态
const appDrawerVisible = ref(false)
const currentAppInfo = ref(null)

// 计算属性

// 计算历史最大逾期天数
const maxOverdueDays = computed(() => {
  return props.userInfo?.maxOverdueDays || 0
})

// 计算当前逾期天数
const currentOverdueDays = computed(() => {
  return props.userInfo?.currentOverdueDays || 0
})

// 计算当前总在贷余额
const currentTotalLoanBalance = computed(() => {
  return props.userInfo?.currentTotalLoanBalance || 0
})

// 计算当前总授信金额
const currentTotalCreditAmount = computed(() => {
  return props.userInfo?.currentTotalCreditAmount || 0
})

// recentActivities 计算属性已删除（最近活动模块已删除）

// 方法
const refreshData = () => {
  emit('refresh')
  emit('debug-info', {
    action: 'refresh',
    component: 'CustomerOverview',
    productKey: props.productKey
  })
}

// 处理产品点击
const handleProductClick = (product: any) => {
  // 可以在这里添加产品选择逻辑
}

// 显示APP信息抽屉
const showAppInfo = (appInfo: any) => {
  currentAppInfo.value = appInfo
  appDrawerVisible.value = true
}

// 关闭APP信息抽屉
const closeAppDrawer = () => {
  appDrawerVisible.value = false
  currentAppInfo.value = null
}

// 显示联系人
const showContacts = () => {
  // TODO: 实现查看联系人功能
}

const formatPhone = (phone: string) => {
  if (!phone) return '--'
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

const formatIdCard = (idCard: string) => {
  if (!idCard) return '--'
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

const formatDate = (date: string) => {
  if (!date) return '--'
  return new Date(date).toLocaleString('zh-CN')
}

const formatAmount = (amount: number) => {
  if (amount === 0) return '¥0'
  if (!amount) return '--'
  return `¥${amount.toLocaleString()}`
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '冻结': 'orange',
    '注销': 'red'
  }
  return colorMap[status] || 'default'
}


</script>

<style scoped>
.customer-overview {
  padding: 16px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.overview-header h4 {
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #86909c;
}

.overview-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-card {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f3f5;
}

.card-icon {
  margin-right: 8px;
  color: #165dff;
  font-size: 16px;
}

.card-title {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #86909c;
  font-size: 12px;
}

.value {
  color: #1d2129;
  font-size: 12px;
  font-weight: 500;
}

.value.highlight {
  color: #165dff;
  font-size: 14px;
  font-weight: 600;
}

.product-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-progress {
  margin-top: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: var(--color-text-2);
}

.progress-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
}

.product-list {
  margin-top: 20px;
  border-top: 1px solid var(--color-border-2);
  padding-top: 16px;
}

.list-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
  margin: 0 0 12px 0;
}

.product-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--color-fill-1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-item:hover {
  background: var(--color-fill-2);
  transform: translateY(-1px);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
}

.product-amount {
  font-size: 12px;
  color: var(--color-text-3);
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.risk-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.risk-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-list {
  max-height: 200px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f2f3f5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  margin-top: 2px;
}

.success-icon {
  color: #00b42a;
}

.warning-icon {
  color: #ff7d00;
}

.info-icon {
  color: #165dff;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: #1d2129;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  color: #86909c;
  font-size: 11px;
}
</style>