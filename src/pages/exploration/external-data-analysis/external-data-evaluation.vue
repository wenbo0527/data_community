<template>
  <div class="external-data-evaluation">
    <div class="filter-section">
      <a-button type="primary" @click="exportData" style="margin-right: 16px">
        导出数据
      </a-button>
      <a-select 
        placeholder="选择外数产品" 
        :style="{width: '200px'}"
        v-model="selectedProducts"
        multiple
        allow-clear
      >
        <a-option v-for="product in products" :key="product" :value="product">
          {{ product }}
        </a-option>
      </a-select>

      <a-select 
        placeholder="选择使用平台" 
        :style="{width: '200px', marginLeft: '16px'}"
        v-model="selectedPlatform"
        allow-clear
      >
        <a-option v-for="platform in platforms" :key="platform" :value="platform">
          {{ platform }}
        </a-option>
      </a-select>

      <a-month-picker 
        placeholder="选择数据月份"
        :style="{width: '200px', marginLeft: '16px'}"
        v-model="selectedMonth"
      />
    </div>

    <a-table 
      :data="tableData" 
      :pagination="false" 
      :bordered="{ wrapper: true, cell: true }"
      class="evaluation-table"
    >
      <template #columns>
        <a-table-column title="外数产品" data-index="product" :width="180">
          <template #cell="{ record }">
            <a-link @click="showProductDetail(record)">{{ record.product }}</a-link>
          </template>
        </a-table-column>
        <a-table-column title="单价" data-index="price" :width="120">
          <template #cell="{ record }">
            <a-tooltip :content="`单价: ${record.price}`">
              <span>{{ record.price }}</span>
            </a-tooltip>
          </template>
        </a-table-column>
        <a-table-column title="当年实际消耗" data-index="cost" :width="120">
          <template #cell="{ record }">
            <a-tooltip :content="`当年实际消耗: ${record.cost}`">
              <span>{{ record.cost }}</span>
            </a-tooltip>
          </template>
        </a-table-column>
        
        <a-table-column title="性能" data-index="ks" :width="150">
          <template #cell="{ record }">
            <div>
              <span style="margin-right: 8px">{{ getKsLevel(record.ks) }}</span>
              <span style="color: var(--color-text-3)">{{ record.ks.toFixed(2) }}</span>
            </div>
          </template>
        </a-table-column>
        <a-table-column title="价格" data-index="priceLevel" :width="150">
          <template #cell="{ record }">
            <div>
              <span style="margin-right: 8px">{{ record.priceLevel }}</span>
              <span style="color: var(--color-text-3)">{{ record.price }}</span>
            </div>
          </template>
        </a-table-column>
        <a-table-column title="调用量" data-index="usageLevel" :width="150">
          <template #cell="{ record }">
            <div>
              <span style="margin-right: 8px">{{ record.usageLevel }}</span>
              <span style="color: var(--color-text-3)">{{ record.cost }}</span>
            </div>
          </template>
        </a-table-column>
        <a-table-column title="稳定性" data-index="stability" :width="150">
          <template #cell="{ record }">
            <div>
              <span style="margin-right: 8px">{{ record.stability }}</span>
              <span style="color: var(--color-text-3)">{{ record.stability === '稳定' ? '99.9%' : record.stability === '较稳定' ? '95%' : '90%' }}</span>
            </div>
          </template>
        </a-table-column>
      </template>
    </a-table>
    
    <ExternalProductModal 
      v-model:visible="modalVisible" 
      :product-data="currentProduct" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatAmount } from '@/utils/calculations'
import ExternalProductModal from '@/components/modals/ExternalProductModal.vue'


const selectedProducts = ref<string[]>([])
const selectedPlatform = ref<string>()
const selectedMonth = ref<string>()

const products = ref<string[]>([
  '产品A', '产品B', '产品C', '产品D'
])

const platforms = ref<string[]>([
  '平台1', '平台2', '平台3'
])

const tableData = ref([
  {
    product: '产品A',
    price: formatAmount(1000),
    cost: formatAmount(50000),
    iv: 0.5,
    ks: 0.45,
    psi: 0.12,
    value: 0.45,
    valueLevel: '高',
    performance: '优秀',
    performanceLevel: '高',
    priceLevel: '中',
    usageLevel: '高',
    stability: '稳定'
  },
  {
    product: '产品B',
    price: formatAmount(1500),
    cost: formatAmount(75000),
    iv: 0.4,
    ks: 0.35,
    psi: 0.15,
    value: 0.23,
    valueLevel: '中',
    performance: '良好',
    performanceLevel: '中',
    priceLevel: '高',
    usageLevel: '中',
    stability: '较稳定'
  },
  {
    product: '产品C',
    price: formatAmount(800),
    cost: formatAmount(40000),
    iv: 0.3,
    ks: 0.25,
    psi: 0.18,
    value: 0.31,
    valueLevel: '中',
    performance: '一般',
    performanceLevel: '低',
    priceLevel: '低',
    usageLevel: '高',
    stability: '一般'
  }
])

const getLevelColor = (level: string) => {
  switch(level) {
    case '高': return 'green'
    case '中': return 'orange'
    case '低': return 'red'
    default: return 'gray'
  }
}

const getKsLevel = (ks: number) => {
  if (ks >= 0.4) return '高'
  if (ks >= 0.3) return '中'
  return '低'
}

const modalVisible = ref(false)
const currentProduct = ref({})

const showProductDetail = (product: {
  product: string
  price: string
  cost: string
  iv: number
  ks: number
  psi: number
  value: number
  valueLevel: string
  performance: string
  performanceLevel: string
  priceLevel: string
  usageLevel: string
  stability: string
}) => {
  currentProduct.value = product
  modalVisible.value = true
}

const exportData = () => {
  // 导出按钮点击事件，仅保留UI功能
}
</script>

<style scoped>
.external-data-evaluation {
  padding: 16px;
}

.filter-section {
  display: flex;
  margin-bottom: 16px;
}

.evaluation-table {
  :deep(.arco-table-tr) {
    height: 56px;
  }
  :deep(.arco-table-cell) {
    padding: 16px 12px;
    font-size: 14px;
  }
  :deep(.arco-table-th) {
    font-weight: 600;
    background-color: #f7f8fa;
  }
}

.high-value {
  color: #00b42a;
  font-weight: 500;
}

.medium-value {
  color: #ff7d00;
  font-weight: 500;
}

.low-value {
  color: #f53f3f;
  font-weight: 500;
}
</style>