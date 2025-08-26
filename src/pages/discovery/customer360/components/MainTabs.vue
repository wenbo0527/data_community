<template>
  <div class="main-tabs-container">
    <a-tabs 
      v-model:active-key="activeMainTab" 
      type="line" 
      size="default"
      @change="handleMainTabChange"
    >
      <a-tab-pane key="profile" title="客户画像">
        <div class="tab-content">
          <CustomerProfile
            :user-info="userInfo"
            :credit-info="creditInfo"
            :collection-records="collectionRecords"
          />
        </div>
      </a-tab-pane>
      
      <a-tab-pane 
        v-for="product in products" 
        :key="product.productKey"
        :title="product.productName"
      >
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
import CustomerProfile from './CustomerProfile.vue'
import InfoModuleTabs from './InfoModuleTabs.vue'

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

const props = withDefaults(defineProps<Props>(), {
  userInfo: () => ({}),
  products: () => [],
  creditInfo: () => ({}),
  collectionRecords: () => [],
  loading: false,
  showDebugPanel: false
})

const emit = defineEmits<{
  'main-tab-change': [tabKey: string]
  'module-change': [moduleKey: string]
}>()

const activeMainTab = ref('profile')

const getProductTabLabel = (product: Product) => {
  const statusColor = getStatusColor(product.status)
  const statusText = product.status
  
  return {
    key: product.productKey,
    label: product.productName,
    status: statusText,
    statusColor,
    balance: product.balance,
    creditLimit: product.creditLimit,
    overdueAmount: product.overdueAmount,
    overdueDays: product.overdueDays
  }
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': '#52c41a',
    '逾期': '#ff4d4f',
    '关闭': '#8c8c8c',
    '冻结': '#fa8c16'
  }
  return colorMap[status] || '#1890ff'
}

const handleMainTabChange = (tabKey: string) => {
  emit('main-tab-change', tabKey)
}

const handleModuleChange = (moduleKey: string) => {
  emit('module-change', moduleKey)
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
  overflow: hidden;
}

:deep(.arco-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.arco-tabs-content-holder) {
  flex: 1;
  overflow: hidden;
}

:deep(.arco-tabs-content) {
  height: 100%;
}

:deep(.arco-tabs-tabpane) {
  height: 100%;
  overflow: auto;
}

:deep(.arco-tabs-nav) {
  margin-bottom: 0;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 16px;
  flex-shrink: 0;
}

:deep(.arco-tabs-tab) {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
}

:deep(.arco-tabs-tab:hover) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
}

:deep(.arco-tabs-tab.arco-tabs-tab-active) {
  color: #1890ff;
  font-weight: 600;
  background: rgba(24, 144, 255, 0.1);
}

:deep(.arco-tabs-nav-ink) {
  background: #1890ff;
  height: 2px;
  transition: all 0.3s ease;
}

/* 客户画像Tab特殊样式 */
:deep(.arco-tabs-tab[data-key="profile"]) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 6px 6px 0 0;
  margin-right: 8px;
}

:deep(.arco-tabs-tab[data-key="profile"]:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  color: #fff;
}

:deep(.arco-tabs-tab-active[data-key="profile"]) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

/* 修复Tab切换时的偏移问题 */
:deep(.arco-tabs-nav-tab-list) {
  transform: none !important;
  transition: transform 0.3s ease;
}

:deep(.arco-tabs-nav-operations) {
  display: none;
}
</style>