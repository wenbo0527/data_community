<template>
  <div class="info-module-tabs">
    <div class="tabs-header">
      <h4>信息模块</h4>
      <div class="module-summary">
        <span class="summary-text">产品: {{ currentProductName }}</span>
      </div>
    </div>
    
    <a-tabs 
      v-model:active-key="selectedInfoModule" 
      type="line" 
      size="default"
      @change="handleModuleChange"
    >
      <a-tab-pane key="overview" title="客户概览">
        <div class="module-content">
          <CustomerOverview 
            :product-key="productKey"
            :product-data="productData"
            :user-info="userInfo"
            :loading="loading"
          />
        </div>
      </a-tab-pane>
      
      <a-tab-pane key="business" title="业务核心明细">
        <div class="module-content">
          <BusinessCoreDetails 
            :product-key="productKey"
            :business-data="businessData"
            :user-info="userInfo"
            :loading="loading"
          />
        </div>
      </a-tab-pane>
      
      <a-tab-pane key="marketing" title="营销记录">
        <div class="module-content">
          <MarketingRecords 
            :product-key="productKey"
            :marketing-data="marketingData"
            :user-info="userInfo"
            :loading="loading"
          />
        </div>
      </a-tab-pane>
      
      <a-tab-pane key="product" title="产品信息">
        <div class="module-content">
          <ProductInfo 
            :product-key="productKey"
            :product-data="productData"
            :user-info="userInfo"
            :loading="loading"
          />
        </div>
      </a-tab-pane>

    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import CustomerOverview from './CustomerOverview.vue'
import BusinessCoreDetails from './BusinessCoreDetails.vue'
import MarketingRecords from './MarketingRecords.vue'
import ProductInfo from './ProductInfo.vue'


interface Props {
  productKey: string
  productData?: any
  userInfo?: any
  loading?: boolean
  defaultModule?: string
  showDebugPanel?: boolean
}

interface Emits {
  (e: 'module-change', moduleKey: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  defaultModule: 'overview',
  showDebugPanel: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const selectedInfoModule = ref<string>(props.defaultModule)

// 计算属性
const currentProductName = computed(() => {
  return props.productData?.productName || '未知产品'
})

const businessData = computed(() => {
  if (!props.userInfo || !props.productKey) return {}
  
  return {
    creditList: props.userInfo.creditsList?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    loanList: props.userInfo.loanRecords?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    adjustmentHistory: props.userInfo.quotaAdjustHistory?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    paymentProcess: props.userInfo.paymentProcessRecords || {}
  }
})

const marketingData = computed(() => {
  if (!props.userInfo || !props.productKey) return {}
  
  return {
    touchRecords: props.userInfo.marketingRecords?.touchRecords?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    benefitRecords: props.userInfo.marketingRecords?.benefitRecords?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    effectAnalysis: props.userInfo.marketingRecords?.effectAnalysis || {}
  }
})

// 监听模块变化
watch(
  selectedInfoModule,
  (newModule, oldModule) => {
    emit('module-change', newModule)
  }
)

// 监听产品变化，重置到概览模块
watch(
  () => props.productKey,
  (newKey, oldKey) => {
    selectedInfoModule.value = 'overview'
  }
)

// 监听用户信息变化
watch(
  () => props.userInfo,
  (newUserInfo, oldUserInfo) => {
    // 简化逻辑，移除调试代码
  },
  { deep: true, immediate: true }
)

// 监听loading状态变化
watch(
  () => props.loading,
  (newLoading, oldLoading) => {
    // 简化逻辑，移除调试代码
  }
)

// 方法
const handleModuleChange = (moduleKey: string) => {
  selectedInfoModule.value = moduleKey
  emit('module-change', moduleKey)
}

// 移除了handleDebugInfo函数
</script>

<style scoped>
.info-module-tabs {
  background: #fff;
  border-radius: 6px;
  padding: 0;
  width: 100%;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e6eb;
}

.tabs-header h4 {
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.module-summary {
  .summary-text {
    color: #86909c;
    font-size: 12px;
  }
}

.module-content {
  padding: 16px;
  min-height: 400px;
}

/* Tab样式优化 - 使用Arco Design */

:deep(.arco-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.arco-tabs .arco-tabs-content-holder) {
  flex: 1;
  overflow: hidden;
}

:deep(.arco-tabs .arco-tabs-content) {
  height: 100%;
}

:deep(.arco-tabs .arco-tabs-tabpane) {
  height: 100%;
  overflow: auto;
}

:deep(.arco-tabs .arco-tabs-nav) {
  margin-bottom: 0;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
}

:deep(.arco-tabs .arco-tabs-tab) {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border: none;
  background: transparent;
}

:deep(.arco-tabs .arco-tabs-tab:hover) {
  color: #1890ff;
}

:deep(.arco-tabs .arco-tabs-tab.arco-tabs-tab-active) {
  color: #1890ff;
  font-weight: 600;
}

:deep(.arco-tabs .arco-tabs-nav-ink) {
  background: #1890ff;
  height: 2px;
}
</style>