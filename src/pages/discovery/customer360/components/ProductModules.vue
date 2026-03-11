<template>
  <div 
    :class="[
      'product-modules',
      {
        'loading': loading,
        'error': hasError,
        'empty': isEmpty
      }
    ]"
  >
    <!-- 错误状态 -->
    <div v-if="hasError" class="error-state" data-testid="error-state">
      <a-result
        status="error"
        title="数据加载失败"
        sub-title="请检查网络连接或稍后重试"
      >
        <template #extra>
          <a-button type="primary" @click="$emit('retry')">
            重新加载
          </a-button>
        </template>
      </a-result>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="empty-state" data-testid="empty-state">
      <a-empty
        :description="`暂无${productTypeLabel}数据`"
      />
    </div>

    <!-- 正常内容 -->
    <div v-else class="modules-content">
      <!-- 调试信息面板 -->
      <div v-if="showDebugPanel" class="debug-panel">
        <h4>ProductModules 调试信息</h4>
        <div class="debug-item">
          <strong>产品类型:</strong> {{ productType }}
        </div>
        <div class="debug-item">
          <strong>当前选中模块:</strong> {{ currentActiveKey }}
        </div>
        <div class="debug-item">
          <strong>状态记忆:</strong> {{ rememberState ? '启用' : '禁用' }}
        </div>
        <div class="debug-item">
          <strong>懒加载:</strong> {{ lazyLoad ? '启用' : '禁用' }}
        </div>
        <div class="debug-item">
          <strong>已加载模块:</strong> {{ loadedModules.join(', ') }}
        </div>
        <div class="debug-item">
          <strong>产品数据类型:</strong> {{ typeof productData }}
        </div>
        <div class="debug-item">
          <strong>产品数据长度:</strong> {{ productData?.products?.length || 'N/A' }}
        </div>
        <div class="debug-item">
          <strong>用户信息:</strong> {{ userInfo ? '已加载' : '未加载' }}
        </div>
        <div class="debug-item">
          <strong>安全产品数据:</strong> {{ safeProducts.length }} 项
        </div>
      </div>

      <a-spin :spinning="loading" tip="加载中...">
        <a-tabs 
          :active-key="currentActiveKey"
          @change="handleTabChange"
          :class="[
            'product-tabs',
            {
              'tabs-animated': animated,
              'tabs-lazy': lazyLoad
            }
          ]"
        >
          <a-tab-pane 
            key="basic-info" 
            tab="基础信息"
            data-testid="basic-info-tab"
            :disabled="loading"
          >
            <div v-if="shouldRenderModule('basic-info')" class="module-wrapper">
              <ProductBasicInfo 
                data-testid="product-basic-info"
                :product-type="productType"
                :product-data="safeProducts"
                :user-info="userInfo"
                @debug-info="handleDebugInfo"
              />
            </div>
          </a-tab-pane>
          
          <a-tab-pane 
            key="collection-records" 
            tab="催收记录"
            data-testid="collection-records-tab"
            :disabled="loading"
          >
            <div v-if="shouldRenderModule('collection-records')" class="module-wrapper" data-testid="collection-records">
              <CollectionRecords 
                v-if="loadedModules.includes('collection-records')"
                :product-type="productType"
                :user-info="userInfo"
              />
              <div v-else class="module-content">
                <h3>催收记录</h3>
                <p>产品类型: {{ productType }}</p>
                <p>用户ID: {{ userInfo?.userId }}</p>
                <!-- 这里将来会添加催收记录组件 -->
              </div>
            </div>
          </a-tab-pane>
          
          <a-tab-pane 
            key="credit-records" 
            tab="征信记录"
            data-testid="credit-records-tab"
            :disabled="loading"
          >
            <div v-if="shouldRenderModule('credit-records')" class="module-wrapper" data-testid="credit-records">
              <CreditRecords 
                v-if="loadedModules.includes('credit-records')"
                :productType="productType"
                :user-info="userInfo"
                :credit-data="productData?.credits || []"
              />
              <div v-else class="module-content">
                <h3>征信记录</h3>
                <p>产品类型: {{ productType }}</p>
                <p>用户ID: {{ userInfo?.userId }}</p>
                <!-- 这里将来会添加征信记录组件 -->
              </div>
            </div>
          </a-tab-pane>
          
          <a-tab-pane 
            key="marketing-records" 
            tab="营销记录"
            data-testid="marketing-records-tab"
            :disabled="loading"
          >
            <div v-if="shouldRenderModule('marketing-records')" class="module-wrapper" data-testid="marketing-records">
              <MarketingRecords 
                v-if="loadedModules.includes('marketing-records')"
                :product-type="productType"
                :user-info="userInfo"
              />
              <div v-else class="module-content">
                <h3>营销记录</h3>
                <p>产品类型: {{ productType }}</p>
                <p>用户ID: {{ userInfo?.userId }}</p>
                <!-- 这里将来会添加营销记录组件 -->
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import ProductBasicInfo from './ProductBasicInfo.vue'

// 动态导入子组件（用于懒加载）
const CollectionRecords = ref(null)
const CreditRecords = ref(null)
const MarketingRecords = ref(null)

const props = defineProps({
  productType: {
    type: String,
    required: true,
    validator: (value) => ['loan'].includes(value)
  },
  productData: {
    type: Object,
    default: () => ({
      products: [],
      collections: [],
      credits: [],
      marketing: []
    })
  },
  userInfo: {
    type: Object,
    default: () => null
  },
  loading: {
    type: Boolean,
    default: false
  },
  showDebugPanel: {
    type: Boolean,
    default: false
  },
  rememberState: {
    type: Boolean,
    default: true
  },
  lazyLoad: {
    type: Boolean,
    default: true
  },
  animated: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['debug-info', 'tab-change', 'module-loaded', 'retry'])

// 状态管理
const currentActiveKey = ref('basic-info')
const loadedModules = ref(['basic-info']) // 基础信息默认加载
const tabStates = ref({})
const STORAGE_KEY = 'productModules_tabState'

// 计算属性
const productTypeLabel = computed(() => {
  return '信贷产品'
})

const hasError = computed(() => {
  return !props.userInfo && !props.loading
})

const isEmpty = computed(() => {
  return !hasError.value && (!props.productData || props.productData.length === 0)
})

// 安全的产品数据
const safeProducts = computed(() => {
  if (!props.productData || typeof props.productData !== 'object') {
    console.warn('[ProductModules] productData 不是有效对象:', props.productData)
    return []
  }
  // 返回products数组，这是ProductBasicInfo组件期望的格式
  return props.productData.products || []
})

// 状态记忆功能
const saveTabState = () => {
  if (!props.rememberState) return
  
  try {
    tabStates.value[props.productType] = currentActiveKey.value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabStates.value))
  } catch (error) {
    console.warn('[ProductModules] 保存Tab状态失败:', error)
  }
}

const loadTabState = () => {
  if (!props.rememberState) return
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      tabStates.value = JSON.parse(saved)
      const savedKey = tabStates.value[props.productType]
      if (savedKey) {
        currentActiveKey.value = savedKey
        // 确保已加载模块包含当前选中的模块
        if (!loadedModules.value.includes(savedKey)) {
          loadedModules.value.push(savedKey)
        }
      }
    }
  } catch (error) {
    console.warn('[ProductModules] 加载Tab状态失败:', error)
  }
}

// 懒加载模块判断
const shouldRenderModule = (moduleKey) => {
  if (!props.lazyLoad) return true
  return loadedModules.value.includes(moduleKey)
}

// 动态加载组件
const loadModule = async (moduleKey) => {
  if (loadedModules.value.includes(moduleKey)) return
  
  try {
    switch (moduleKey) {
      case 'collection-records':
        if (!CollectionRecords.value) {
          // 这里可以动态导入组件
          // CollectionRecords.value = (await import('./CollectionRecords.vue')).default
        }
        break
      case 'credit-records':
        if (!CreditRecords.value) {
          // CreditRecords.value = (await import('./CreditRecords.vue')).default
        }
        break
      case 'marketing-records':
        if (!MarketingRecords.value) {
          // MarketingRecords.value = (await import('./MarketingRecords.vue')).default
        }
        break
    }
    
    loadedModules.value.push(moduleKey)
    emit('module-loaded', moduleKey)
    
    console.log(`[ProductModules] 模块 ${moduleKey} 加载完成`)
  } catch (error) {
    console.error(`[ProductModules] 模块 ${moduleKey} 加载失败:`, error)
  }
}

// Tab切换处理
const handleTabChange = async (activeKey) => {
  if (props.loading || activeKey === currentActiveKey.value) return
  
  console.log('[ProductModules] Tab切换:', activeKey)
  
  // 懒加载模块
  if (props.lazyLoad && !loadedModules.value.includes(activeKey)) {
    await loadModule(activeKey)
  }
  
  currentActiveKey.value = activeKey
  
  // 保存状态
  saveTabState()
  
  // 发射事件
  emit('tab-change', activeKey)
  emit('debug-info', {
    component: 'ProductModules',
    action: 'tab-change',
    data: {
      activeKey,
      productType: props.productType,
      timestamp: new Date().toISOString()
    }
  })
}

// 处理子组件调试信息
const handleDebugInfo = (info) => {
  emit('debug-info', info)
}

// 监听产品类型变化
watch(
  () => props.productType,
  (newType, oldType) => {
    console.log('[ProductModules] 产品类型变化:', { from: oldType, to: newType })
    
    // 保存当前状态
    if (oldType && props.rememberState) {
      tabStates.value[oldType] = currentActiveKey.value
    }
    
    // 恢复新类型的状态
    loadTabState()
    
    emit('debug-info', {
      component: 'ProductModules',
      action: 'product-type-change',
      data: {
        from: oldType,
        to: newType,
        activeKey: currentActiveKey.value,
        timestamp: new Date().toISOString()
      }
    })
  }
)

// 监听产品数据变化
watch(
  () => props.productData,
  (newData, oldData) => {
    console.log('[ProductModules] 产品数据变化:', {
      newCount: newData?.products?.length || 0,
      oldCount: oldData?.products?.length || 0
    })
    emit('debug-info', {
      component: 'ProductModules',
      action: 'product-data-change',
      data: {
        newCount: newData?.products?.length || 0,
        oldCount: oldData?.products?.length || 0,
        timestamp: new Date().toISOString()
      }
    })
  },
  { deep: true }
)

// 监听用户信息变化
watch(
  () => props.userInfo,
  (newInfo, oldInfo) => {
    console.log('[ProductModules] 用户信息变化:', {
      newUserId: newInfo?.userId,
      oldUserId: oldInfo?.userId
    })
    emit('debug-info', {
      component: 'ProductModules',
      action: 'user-info-change',
      data: {
        newUserId: newInfo?.userId,
        oldUserId: oldInfo?.userId,
        timestamp: new Date().toISOString()
      }
    })
  }
)

// 生命周期
onMounted(() => {
  loadTabState()
  
  // 如果禁用懒加载，预加载所有模块
  if (!props.lazyLoad) {
    loadedModules.value = ['basic-info', 'collection-records', 'credit-records', 'marketing-records']
  } else if (currentActiveKey.value === 'basic-info') {
    // 预加载下一个可能访问的模块
    setTimeout(() => {
      loadModule('collection-records')
    }, 1000)
  }
})

onUnmounted(() => {
  saveTabState()
})
</script>

<style scoped>
.product-modules {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-modules.loading {
  opacity: 0.8;
}

.product-modules.error,
.product-modules.empty {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-state,
.empty-state {
  width: 100%;
  padding: 40px 20px;
}

.modules-content {
  height: 100%;
}

.debug-panel {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

.debug-panel h4 {
  margin: 0 0 12px 0;
  color: #24292e;
  font-size: 14px;
  font-weight: 600;
}

.debug-item {
  margin-bottom: 8px;
  line-height: 1.4;
}

.debug-item strong {
  color: #0366d6;
  margin-right: 8px;
}

.debug-item pre {
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 3px;
  padding: 8px;
  margin: 4px 0 0 0;
  font-size: 11px;
  overflow-x: auto;
  max-height: 200px;
}

.product-tabs {
  background: #fff;
  height: 100%;
}

.product-tabs :deep(.arco-tabs-nav) {
  margin-bottom: 0;
  background: #fafafa;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
}

.product-tabs :deep(.arco-tabs-tab) {
  padding: 12px 16px;
  margin-right: 8px;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s ease;
  position: relative;
  color: #333;
}

.product-tabs :deep(.arco-tabs-tab:hover:not(.arco-tabs-tab-disabled)) {
  background: rgba(24, 144, 255, 0.04);
  color: #1890ff;
}

.product-tabs :deep(.arco-tabs-tab-active) {
  background: #fff;
  color: #1890ff;
  font-weight: 500;
}

.product-tabs :deep(.arco-tabs-tab-active::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: #1890ff;
  border-radius: 1px;
}

.product-tabs :deep(.arco-tabs-tab-disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-tabs :deep(.arco-tabs-content) {
  background: #fff;
  min-height: 400px;
}

.product-tabs :deep(.arco-tabs-content-item) {
  padding: 24px;
  outline: none;
}

/* 动画效果 */
.product-tabs.tabs-animated :deep(.arco-tabs-tab) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-tabs.tabs-animated :deep(.arco-tabs-content) {
  transition: opacity 0.3s ease;
}

/* 懒加载样式 */
.product-tabs.tabs-lazy :deep(.arco-tabs-content-item) {
  min-height: 200px;
}

.module-wrapper {
  animation: fadeIn 0.3s ease;
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

.module-content {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  min-height: 300px;
}

.module-content h3 {
  margin: 0 0 16px 0;
  color: #262626;
  font-size: 18px;
  font-weight: 500;
}

.module-content p {
  margin: 8px 0;
  color: #666;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-tabs :deep(.arco-tabs-nav) {
    padding: 0 12px;
  }
  
  .product-tabs :deep(.arco-tabs-tab) {
    padding: 10px 12px;
    margin-right: 4px;
    font-size: 13px;
  }
  
  .product-tabs :deep(.arco-tabs-content-item) {
    padding: 16px;
  }
  
  .module-content {
    padding: 16px;
  }
  
  .debug-panel {
    padding: 12px;
    margin-bottom: 12px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .product-modules {
    background: #1f1f1f;
  }
  
  .product-tabs :deep(.arco-tabs-nav) {
    background: #262626;
    border-bottom-color: #404040;
  }
  
  .product-tabs :deep(.arco-tabs-tab-active) {
    background: #1f1f1f;
    color: #1890ff;
  }
  
  .product-tabs :deep(.arco-tabs-content) {
    background: #1f1f1f;
  }
  
  .module-content {
    background: #1f1f1f;
    border-color: #404040;
    color: #d9d9d9;
  }
  
  .module-content h3 {
    color: #f0f0f0;
  }
  
  .debug-panel {
    background: #262626;
    border-color: #404040;
    color: #d9d9d9;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .product-tabs :deep(.arco-tabs-tab),
  .product-tabs :deep(.arco-tabs-content),
  .module-wrapper {
    transition: none;
    animation: none;
  }
}
</style>