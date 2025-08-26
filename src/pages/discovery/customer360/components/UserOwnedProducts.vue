<template>
  <div class="user-owned-products">
    <!-- 调试信息 -->
    <div v-if="showDebug" class="debug-panel">
      <h4>用户拥有产品调试信息</h4>
      <p>产品总数: {{ products.length }}</p>
      <p>选中产品: {{ selectedProduct?.productName || '无' }}</p>
    </div>

    <!-- 产品列表 -->
    <div v-if="products.length > 0" class="products-container">
      <div class="products-grid">
        <div 
          v-for="product in products" 
          :key="product.id || product.productKey"
          class="product-card"
          :class="{ 'selected': selectedProduct?.id === product.id }"
          @click="handleProductSelect(product)"
        >
          <div class="product-header">
            <h4 class="product-name">{{ product.productName }}</h4>
            <span class="product-category">{{ product.category }}</span>
          </div>
          <div class="product-details">
            <div class="detail-item">
              <span class="label">余额:</span>
              <span class="value">{{ formatAmount(product.balance) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">利率:</span>
              <span class="value">{{ product.interestRate }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <span class="value" :class="getStatusClass(product.status)">{{ product.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <icon-storage :size="48" />
      </div>
      <h3>暂无产品</h3>
      <p>该用户暂未持有任何产品</p>
    </div>

    <!-- 选中产品详情 -->
    <div v-if="selectedProduct" class="selected-product-details">
      <h3>产品详情</h3>
      <div class="detail-content">
        <div class="detail-row">
          <span class="label">产品名称:</span>
          <span class="value">{{ selectedProduct.productName }}</span>
        </div>
        <div class="detail-row">
          <span class="label">产品类型:</span>
          <span class="value">{{ selectedProduct.category }}</span>
        </div>
        <div class="detail-row">
          <span class="label">账户余额:</span>
          <span class="value">{{ formatAmount(selectedProduct.balance) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">贷款利率:</span>
          <span class="value">{{ selectedProduct.interestRate }}%</span>
        </div>
        <div class="detail-row">
          <span class="label">开户时间:</span>
          <span class="value">{{ selectedProduct.openDate }}</span>
        </div>
        <div class="detail-row">
          <span class="label">产品状态:</span>
          <span class="value" :class="getStatusClass(selectedProduct.status)">{{ selectedProduct.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { IconStorage } from '@arco-design/web-vue/es/icon'
import { formatAmount } from '../../../../utils/formatUtils'

// Props
const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  showDebug: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['product-select', 'debug-info'])

// 响应式数据
const selectedProduct = ref(null)

// 方法
const handleProductSelect = (product) => {
  selectedProduct.value = product
  emit('product-select', product)
  
  emit('debug-info', {
    component: 'UserOwnedProducts',
    type: 'product-select',
    message: `选中产品: ${product.productName}`,
    data: product
  })
}

const getStatusClass = (status) => {
  const statusMap = {
    '正常': 'status-normal',
    '冻结': 'status-frozen',
    '逾期': 'status-overdue',
    '已结清': 'status-settled'
  }
  return statusMap[status] || 'status-unknown'
}

// 监听产品数据变化
watch(() => props.products, (newProducts) => {
  emit('debug-info', {
    component: 'UserOwnedProducts',
    type: 'data-update',
    message: `产品数据更新，共 ${newProducts.length} 个信贷产品`,
    data: {
      total: newProducts.length
    }
  })
}, { immediate: true })

// 组件挂载
onMounted(() => {
  emit('debug-info', {
    component: 'UserOwnedProducts',
    type: 'mounted',
    message: '用户产品组件已挂载',
    data: {
      total: props.products.length
    }
  })
})
</script>

<style scoped>
.user-owned-products {
  padding: 16px;
}

.debug-panel {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 12px;
}

.debug-panel h4 {
  margin: 0 0 8px 0;
  color: #666;
}

.debug-panel p {
  margin: 4px 0;
  color: #888;
}

.products-container {
  margin-bottom: 24px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.product-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.product-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.product-card.selected {
  border-color: #1890ff;
  background: #f6ffed;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.product-category {
  background: #f0f0f0;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item .label {
  color: #666;
  font-size: 14px;
}

.detail-item .value {
  font-weight: 500;
  color: #333;
}

.status-normal {
  color: #52c41a;
}

.status-frozen {
  color: #faad14;
}

.status-overdue {
  color: #ff4d4f;
}

.status-settled {
  color: #666;
}

.status-unknown {
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #999;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #666;
}

.empty-state p {
  margin: 0;
  color: #999;
}

.selected-product-details {
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
}

.selected-product-details h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #666;
  font-weight: 500;
}

.detail-row .value {
  color: #333;
  font-weight: 600;
}
</style>