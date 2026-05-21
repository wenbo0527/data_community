<template>
  <div class="product-modules-complete">
    <!-- 错误状态 -->
    <div v-if="hasError" class="error-state">
      <AResult status="error" title="加载失败" :sub-title="errorMessage">
        <template #extra>
          <AButton type="primary" @click="$emit('retry')">
            重新加载
          </AButton>
        </template>
      </AResult>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="empty-state">
      <AEmpty description="暂无产品数据" />
    </div>

    <!-- 正常状态 -->
    <div v-else class="product-content">
      <!-- 调试信息面板 -->
      <div v-if="showDebugPanel" class="debug-panel">
        <h4>🔍 ProductModulesComplete 调试信息</h4>
        <div class="debug-content">
          <div><strong>选中产品:</strong> {{ selectedProduct ? selectedProduct.name : '未选择' }}</div>
          <div><strong>产品类型:</strong> {{ selectedProduct ? selectedProduct.type : '未知' }}</div>
          <div><strong>用户信息:</strong> {{ userInfo ? '已加载' : '未加载' }}</div>
          <div><strong>加载状态:</strong> {{ loading }}</div>
        </div>
      </div>

      <!-- 产品详细信息 -->
      <div class="product-complete-info">
        <!-- 基本信息 -->
        <div class="info-module">
          <div class="module-header">
            <h4><IconUser /> 基本信息</h4>
          </div>
          <div class="module-content">
            <ProductBasicInfo 
              :product-data="[selectedProduct]"
              :user-info="userInfo"
              @debug-info="handleDebugInfo"
            />
          </div>
        </div>

        <!-- 授信记录 -->
        <div class="info-module">
          <div class="module-header">
            <h4><IconSafe /> 授信记录</h4>
          </div>
          <div class="module-content">
            <CreditList 
              :credits="getProductCreditRecords(selectedProduct)"
              :loading="loading"
              @debug-info="handleDebugInfo"
            />
          </div>
        </div>

        <!-- 用信记录 -->
        <div class="info-module">
          <div class="module-header">
            <h4><IconStorage /> 用信记录</h4>
          </div>
          <div class="module-content">
            <LoanList 
              :loans="getProductLoanRecords(selectedProduct)"
              :loading="loading"
              @debug-info="handleDebugInfo"
            />
          </div>
        </div>

        <!-- 调额历史 -->
        <div class="info-module">
          <div class="module-header">
            <h4><IconHistory /> 调额历史</h4>
          </div>
          <div class="module-content">
            <AdjustmentHistory 
              :adjustments="getProductAdjustmentHistory(selectedProduct)"
              :loading="loading"
              @debug-info="handleDebugInfo"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Tabs as ATabs, TabPane as ATabPane, Result as AResult, Button as AButton, Empty as AEmpty } from '@arco-design/web-vue'
import { 
  IconUser, 
  IconSafe, 
  IconFile, 
  IconStorage, 
  IconHistory 
} from '@arco-design/web-vue/es/icon'
import { useProductStore } from '../../../../stores/productStore'

// 导入子组件
import ProductBasicInfo from './ProductBasicInfo.vue'
import CreditList from './CreditList.vue'
import LoanList from './LoanList.vue'
import AdjustmentHistory from './AdjustmentHistory.vue'

const props = defineProps({
  selectedProduct: {
    type: Object,
    default: () => null
  },
  userInfo: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  showDebugPanel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'debug-info',
  'tab-change',
  'module-loaded',
  'retry'
])

// 初始化store
const productStore = useProductStore()

// 状态管理
const showDebugPanel = ref(false)

// 计算属性
const hasError = computed(() => {
  return false // 暂时移除错误状态
})

const isEmpty = computed(() => {
  return !props.selectedProduct
})

const errorMessage = computed(() => {
  return '未知错误'
})

// 获取产品相关数据的方法
const getProductCreditRecords = (product) => {
  if (!product) {return []}
  return product.creditRecords || []
}

const getProductLoanRecords = (product) => {
  if (!product) {return []}
  return product.loanRecords || []
}

const getProductAdjustmentHistory = (product) => {
  if (!product) {return []}
  return product.adjustmentHistory || []
}

// 状态记忆
const saveTabState = () => {
  if (props.rememberState && currentActiveKey.value) {
    const stateKey = `product-modules-complete-${props.productType}`
    localStorage.setItem(stateKey, currentActiveKey.value)
  }
}

const loadTabState = () => {
  if (props.rememberState) {
    const stateKey = `product-modules-complete-${props.productType}`
    const savedState = localStorage.getItem(stateKey)
    if (savedState && safeProducts.value.some(p => (p.productKey || p.id) === savedState)) {
      currentActiveKey.value = savedState
    } else if (safeProducts.value.length > 0) {
      currentActiveKey.value = safeProducts.value[0].productKey || safeProducts.value[0].id
    }
  } else if (safeProducts.value.length > 0) {
    currentActiveKey.value = safeProducts.value[0].productKey || safeProducts.value[0].id
  }
}

// Tab切换处理
const handleTabChange = (key) => {
  currentActiveKey.value = key
  saveTabState()
  
  emit('tab-change', {
    productType: props.productType,
    activeKey: key,
    timestamp: Date.now()
  })
  
  // 懒加载模块
  if (props.lazyLoad && !loadedModules.value.has(key)) {
    loadModule(key)
  }
}

// 模块懒加载
const loadModule = (key) => {
  if (loadedModules.value.has(key)) {return}
  
  loadedModules.value.add(key)
  emit('module-loaded', {
    productType: props.productType,
    moduleKey: key,
    timestamp: Date.now()
  })
}

// 子组件调试信息处理
const handleDebugInfo = (info) => {
  emit('debug-info', {
    component: 'ProductModulesComplete',
    productType: props.productType,
    activeKey: currentActiveKey.value,
    ...info
  })
}

// 监听器
watch(() => props.selectedProduct, (newProduct) => {
  if (newProduct) {
    console.log('🔍 [DEBUG] 选中产品变化:', newProduct)
  }
}, { immediate: true, deep: true })

watch(() => props.userInfo, (newUserInfo) => {
  if (newUserInfo) {
    console.log('🔍 [DEBUG] 用户信息更新:', newUserInfo)
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  console.log('🔍 [DEBUG] ProductModulesComplete 组件已挂载')
})

onUnmounted(() => {
  console.log('🔍 [DEBUG] ProductModulesComplete 组件已卸载')
})
</script>

<style scoped>
.product-modules-complete {
  width: 100%;
  min-height: 400px;
}

.debug-panel {
  background: #f0f9ff;
  border: 1px solid var(--subapp-info);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 12px;
}

.debug-panel h4 {
  color: var(--subapp-info);
  margin: 0 0 12px 0;
  font-size: 14px;
}

.debug-content div {
  margin-bottom: 4px;
  line-height: 1.4;
}

.error-state,
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.product-content {
  width: 100%;
}

.product-tabs {
  width: 100%;
}

.product-tabs :deep(.arco-tabs-nav) {
  margin-bottom: 16px;
}

.product-tabs :deep(.arco-tabs-tab) {
  padding: 8px 16px;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
}

.product-tabs :deep(.arco-tabs-tab:hover) {
  background-color: #f8fafc;
}

.product-tabs :deep(.arco-tabs-tab-active) {
  background-color: #3b82f6;
  color: white;
}

.product-tab-pane {
  padding: 0;
}

.product-complete-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-module {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.info-module:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.module-header {
  background: #f8fafc;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.module-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-note {
  font-size: 12px;
  color: #6b7280;
  font-weight: normal;
}

.module-content {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-modules-complete {
    padding: 12px;
  }
  
  .product-complete-info {
    gap: 16px;
  }
  
  .module-header {
    padding: 12px 16px;
  }
  
  .module-header h4 {
    font-size: 14px;
  }
  
  .module-content {
    padding: 16px;
  }
  
  .product-tabs :deep(.arco-tabs-tab) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 动画效果 */
.product-tab-pane {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .info-module {
    background: #1f2937;
    border-color: var(--subapp-text-secondary);
  }
  
  .module-header {
    background: #111827;
    border-color: var(--subapp-text-secondary);
  }
  
  .module-header h4 {
    color: #f9fafb;
  }
  
  .module-note {
    color: #9ca3af;
  }
}
</style>