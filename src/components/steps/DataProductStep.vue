<template>
  <div class="data-product-config">
    <div v-for="(product, index) in modelValue.products" :key="index" class="product-section">
      <div class="product-header">
        <a-button v-if="modelValueRef.products.length > 1" type="text" status="danger" @click="removeProduct(index)">
          <icon-delete />
        </a-button>
      </div>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="数据产品" :field="`products[${index}].name`" required>
            <a-select v-model="product.name" placeholder="请选择数据产品" class="custom-select">
              <a-option v-for="dp in mockDataProducts" :key="dp.id" :value="dp.name">
                {{ dp.name }} - {{ dp.description }} ({{ dp.price }}元/条)
              </a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="总陪跑量" :field="`products[${index}].totalAmount`" required>
            <a-input-number v-model="product.totalAmount" placeholder="请输入总陪跑量" :min="0" class="custom-input-number" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-table :data="product.periods" :columns="columns" :pagination="false" class="period-table">
        <template #period="{ record, rowIndex }">
          第{{ rowIndex + 1 }}期
        </template>
        <template #periodConfig="{ record }">
          <a-input-number v-model="record.count" :min="0" :max="product.totalAmount" class="count-input" placeholder="请输入条数" />
        </template>
        <template #periodRatio="{ record }">
          {{ calculateRatio(record.count, product.totalAmount) }}%
        </template>
        <template #averageDailyAmount="{ record }">
          {{ calculateDailyAmount(record.count, record.days) }}
        </template>
        <template #discountOption="{ record }">
          <a-row :gutter="8">
            <a-col :span="12">
              <a-select v-model="record.discount.type" class="discount-select">
                <a-option value="none">无优惠</a-option>
                <a-option value="discount">折扣优惠</a-option>
                <a-option value="free">免费条数</a-option>
              </a-select>
            </a-col>
            <a-col :span="12">
              <a-input-number
                v-if="record.discount.type !== 'none'"
                v-model="record.discount.value"
                :min="0"
                :max="record.discount.type === 'discount' ? 1 : record.count"
                :precision="record.discount.type === 'discount' ? 2 : 0"
                :placeholder="record.discount.type === 'discount' ? '请输入折扣率' : '请输入免费条数'"
                class="discount-value-input"
              />
            </a-col>
          </a-row>
        </template>
        <template #totalCost="{ record }">
          {{ calculateCost(record.count, getProductPrice(product.name), record.discount.type, record.discount.value) }}元
        </template>
      </a-table>
    </div>

    <div class="actions">
      <a-button type="outline" @click="addProduct">新增数据产品</a-button>
    </div>

    <div class="form-footer">
      <a-space>
        <a-button size="large" @click="handlePrev">上一步</a-button>
        <a-button type="primary" size="large" @click="handleNext">下一步</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRefs, computed, onMounted } from 'vue'
import type { DataProduct, Period } from '../../types/accompany'
import { IconDelete } from '@arco-design/web-vue/es/icon'

interface ModelValue {
  products: DataProduct[]
  periodDays: number[]
}

const mockDataProducts = [
  { id: 'dp1', name: '数据产品A', description: '用于信用评估的综合数据产品', price: 100, supplier: '供应商A', sceneRatios: {} },
  { id: 'dp2', name: '数据产品B', description: '用于风险控制的专业数据产品', price: 150, supplier: '供应商B', sceneRatios: {} },
  { id: 'dp3', name: '数据产品C', description: '用于营销分析的高级数据产品', price: 200, supplier: '供应商C', sceneRatios: {} },
]

const props = defineProps<{
  modelValue: ModelValue
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue): void
  (e: 'next'): void
  (e: 'prev'): void
}>()

// 使用reactive创建一个新的响应式对象
const modelValueRef = reactive({
  products: [...props.modelValue.products],
  periodDays: [...props.modelValue.periodDays]
})

const products = computed(() => modelValueRef.products)
const periodDays = computed(() => modelValueRef.periodDays)

// 监听props变化更新reactive对象
watch(() => props.modelValue, (newValue) => {
  Object.assign(modelValueRef, newValue)
}, { deep: true })

// 删除数据产品
const removeProduct = (index: number) => {
  modelValueRef.products.splice(index, 1)
  emit('update:modelValue', modelValueRef)
}

// 初始化默认数据产品
onMounted(() => {
  if (modelValueRef.products.length === 0) {
    addProduct()
  }
  // 为每个数据产品初始化期数配置
  modelValueRef.products.forEach(product => {
    if (!product.periods || product.periods.length !== periodDays.value.length) {
      product.periods = periodDays.value.map((days, index) => ({
        count: 0,
        days,
        ratio: 0,
        dailyAmount: 0,
        cost: 0,
        discount: {
          type: 'none',
          value: 0
        }
      }))
    }
  })
})

const columns = [
  { title: '期数', slotName: 'period', width: 80 },
  { title: '每期陪跑量', slotName: 'periodConfig', width: 120 },
  { title: '当期占比', slotName: 'periodRatio', width: 100 },
  { title: '日均陪跑量', slotName: 'averageDailyAmount', width: 100 },
  { title: '折扣优惠', slotName: 'discountOption', width: 200 },
  { title: '当期费用', slotName: 'totalCost', width: 120 }
]

import { calculateRatio, calculateDailyAmount, calculateCost } from '../../utils/calculations'

const getProductPrice = (name: string): number => {
  const product = mockDataProducts.find(p => p.name === name)
  return product?.price || 0
}

const addProduct = () => {
  const newProduct: DataProduct = {
    id: `dp${modelValueRef.products.length + 1}`,
    name: '',
    totalAmount: 0,
    periods: periodDays.value.map((days, index) => ({
      count: 0,
      days,
      ratio: 0,
      dailyAmount: 0,
      cost: 0,
      discount: {
        type: 'none',
        value: 0
      }
    })),
    sceneRatios: {},
    scenes: []
  }
  modelValueRef.products.push(newProduct)
  emit('update:modelValue', modelValueRef)
}

const handleNext = () => emit('next')
const handlePrev = () => emit('prev')

watch(products, (newProducts) => {
  emit('update:modelValue', {
    ...modelValueRef,
    products: newProducts
  })
}, { deep: true })

// 监听每个产品的periods变化
watch(() => modelValueRef.products.map((p: DataProduct) => p.periods), () => {
  console.log('Periods updated:', modelValueRef.products.map((p: DataProduct) => p.periods))
  emit('update:modelValue', modelValueRef)
}, { deep: true })
</script>

<style scoped>
.data-product-config {
  padding: 24px;
}

.product-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.custom-select,
.custom-input-number {
  width: 100%;
}

.period-table {
  margin-top: 24px;
}

.count-input,
.discount-select,
.discount-value-input {
  width: 100%;
}

.actions {
  margin-top: 24px;
  text-align: center;
}

.form-footer {
  margin-top: 40px;
  text-align: center;
}
</style>
