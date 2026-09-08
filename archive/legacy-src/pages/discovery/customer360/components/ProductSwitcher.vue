<template>
  <div class="product-switcher">
    <div class="switcher-header">
      <h4>产品切换</h4>
      <div class="product-summary">
        <span class="summary-text">共 {{ products.length }} 个产品</span>
      </div>
    </div>
    
    <a-tabs 
      v-model:active-key="selectedProductKey" 
      type="card" 
      size="large"
      @change="handleProductChange"
    >
      <a-tab-pane 
        v-for="product in products" 
        :key="product.productKey"
        :title="getProductTabTitle(product)"
      >
        <template #title>
          <div class="product-tab-title">
            <div class="product-icon">
              <icon-credit-card v-if="product.productType === 'credit'" />
              <icon-bank v-else-if="product.productType === 'loan'" />
              <icon-wallet v-else />
            </div>
            <div class="product-info">
              <span class="product-name">{{ product.productName }}</span>
              <a-tag :color="getProductStatusColor(product.status)" size="small">
                {{ product.status }}
              </a-tag>
            </div>
            <div class="product-metrics">
              <span class="metric-item">
                余额: {{ formatAmount(product.balance || 0) }}
              </span>
            </div>
          </div>
        </template>
        
        <!-- 产品详细信息展示区域 -->
        <div class="product-content">
          <slot :product="product" :product-key="product.productKey" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { IconIdcard, IconHome, IconUser } from '@arco-design/web-vue/es/icon'

const getProductIcon = (type: string) => {
  switch (type) {
    case 'credit_card':
      return IconIdcard
    case 'loan':
      return IconHome
    case 'deposit':
      return IconUser
    default:
      return IconIdcard
  }
}

interface Product {
  productKey: string
  productName: string
  productType: string
  status: string
  balance?: number
  [key: string]: any
}

interface Props {
  products: Product[]
  defaultProductKey?: string
  loading?: boolean
}

interface Emits {
  (e: 'product-change', productKey: string, product: Product): void
  (e: 'update:selectedProductKey', productKey: string): void
}

const props = withDefaults(defineProps<Props>(), {
  products: () => [],
  loading: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const selectedProductKey = ref<string>(props.defaultProductKey || '')

// 计算属性
const currentProduct = computed(() => {
  return props.products.find(p => p.productKey === selectedProductKey.value)
})

// 监听产品列表变化，设置默认选中
watch(
  () => props.products,
  (newProducts) => {
    if (newProducts.length > 0 && !selectedProductKey.value) {
      selectedProductKey.value = newProducts[0].productKey
    }
  },
  { immediate: true }
)

// 监听选中产品变化
watch(
  selectedProductKey,
  (newKey) => {
    if (newKey && currentProduct.value) {
      emit('update:selectedProductKey', newKey)
      emit('product-change', newKey, currentProduct.value)
    }
  },
  { immediate: true }
)

// 方法
const handleProductChange = (productKey: string) => {
  selectedProductKey.value = productKey
}

const getProductTabTitle = (product: Product) => {
  return `${product.productName} (${product.status})`
}

const getProductStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '逾期': 'red',
    '结清': 'blue',
    '冻结': 'orange',
    '待激活': 'gray'
  }
  return colorMap[status] || 'default'
}

const formatAmount = (amount: number) => {
  if (amount === 0) return '¥0'
  if (!amount) return '--'
  return `¥${amount.toLocaleString()}`
}
</script>

<style scoped>
.product-switcher {
  background: #fff;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.switcher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.switcher-header h4 {
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.product-summary {
  .summary-text {
    color: #86909c;
    font-size: 12px;
  }
}

.product-tab-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  min-width: 200px;
}

.product-icon {
  display: flex;
  align-items: center;
  color: #165dff;
  font-size: 16px;
}

.product-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  white-space: nowrap;
}

.product-metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.metric-item {
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
}

.product-content {
  padding: 16px 0;
}

/* Tab样式优化 */
:deep(.arco-tabs-nav) {
  margin-bottom: 0;
}

:deep(.arco-tabs-tab) {
  padding: 8px 16px;
  border-radius: 6px 6px 0 0;
}

:deep(.arco-tabs-tab-active) {
  background: #f7f8fa;
}

:deep(.arco-tabs-content) {
  padding-top: 16px;
}
</style>