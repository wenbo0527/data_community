<template>
  <div class="coupon-selector-form">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
    >
      <!-- 搜索 -->
      <div class="search-bar">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索优惠券名称"
          allow-clear
          @search="handleSearch"
        />
      </div>

      <!-- 优惠券列表 -->
      <div class="coupon-list">
        <div
          v-for="coupon in filteredCouponList"
          :key="coupon.id"
          class="coupon-item"
          :class="{ 'coupon-item--selected': formData.couponId === coupon.id }"
          @click="handleSelectCoupon(coupon)"
        >
          <div class="coupon-content">
            <div class="coupon-header">
              <span class="coupon-name">{{ coupon.name }}</span>
              <a-tag v-if="coupon.type === 'discount'" color="orange">{{ coupon.discountRate }}折</a-tag>
              <a-tag v-else-if="coupon.type === 'cashback'" color="green">返现{{ coupon.amount }}元</a-tag>
              <a-tag v-else color="arcoblue">满{{ coupon.minAmount }}减{{ coupon.amount }}</a-tag>
            </div>
            <div class="coupon-info">
              <span>有效期：{{ coupon.validDays }}天</span>
              <span>库存：{{ coupon.stock }}</span>
            </div>
            <div v-if="coupon.tags?.length" class="coupon-tags">
              <a-tag v-for="tag in coupon.tags" :key="tag" size="small">{{ tag }}</a-tag>
            </div>
          </div>
          <div class="coupon-check">
            <a-radio :model-value="formData.couponId === coupon.id" />
          </div>
        </div>

        <!-- 空状态 -->
        <a-empty v-if="filteredCouponList.length === 0" description="暂无优惠券" />
      </div>

      <!-- 已选优惠券展示 -->
      <a-form-item v-if="selectedCoupon" label="已选优惠券">
        <a-card class="selected-coupon-card">
          <div class="selected-coupon">
            <div class="coupon-name">{{ selectedCoupon.name }}</div>
            <div class="coupon-desc">
              <span v-if="selectedCoupon.type === 'discount'">{{ selectedCoupon.discountRate }}折</span>
              <span v-else-if="selectedCoupon.type === 'cashback'">返现{{ selectedCoupon.amount }}元</span>
              <span v-else>满{{ selectedCoupon.minAmount }}减{{ selectedCoupon.amount }}</span>
              <span class="divider">|</span>
              <span>有效期{{ selectedCoupon.validDays }}天</span>
            </div>
          </div>
        </a-card>
      </a-form-item>

      <!-- 发放数量 -->
      <a-form-item v-if="selectedCoupon" field="grantCount" label="发放数量" required>
        <a-input-number
          v-model="formData.grantCount"
          :min="1"
          :max="selectedCoupon.stock"
          :placeholder="`最多${selectedCoupon.stock}`"
          style="width: 100%"
        />
      </a-form-item>

      <!-- 发放方式 -->
      <a-form-item v-if="selectedCoupon" field="grantType" label="发放方式">
        <a-radio-group v-model="formData.grantType">
          <a-radio value="all">全量发放</a-radio>
          <a-radio value="sample">抽样发放</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 抽样比例 -->
      <a-form-item v-if="selectedCoupon && formData.grantType === 'sample'" field="sampleRate" label="抽样比例">
        <a-slider
          v-model="formData.sampleRate"
          :min="1"
          :max="100"
          :step="1"
          :format-tooltip="(v: number) => `${v}%`"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { FormInstance } from '@arco-design/web-vue'

interface Coupon {
  id: string
  name: string
  type: 'discount' | 'cashback' | 'voucher'
  amount: number
  minAmount?: number
  discountRate?: number
  validDays: number
  stock: number
  tags?: string[]
}

interface CouponFormData {
  couponId?: string
  grantCount?: number
  grantType?: 'all' | 'sample'
  sampleRate?: number
}

interface Props {
  modelValue?: CouponFormData
}

interface Emits {
  (e: 'update:modelValue', value: CouponFormData): void
  (e: 'change', value: CouponFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    couponId: '',
    grantCount: 1,
    grantType: 'all',
    sampleRate: 10
  })
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const searchKeyword = ref('')

const formData = ref<CouponFormData>({
  couponId: props.modelValue.couponId || '',
  grantCount: props.modelValue.grantCount || 1,
  grantType: props.modelValue.grantType || 'all',
  sampleRate: props.modelValue.sampleRate || 10
})

const formRules = {
  couponId: [
    { required: true, message: '请选择优惠券' }
  ],
  grantCount: [
    { required: true, message: '请输入发放数量' }
  ]
}

// 模拟优惠券数据
const mockCouponList: Coupon[] = [
  { id: 'c_001', name: '新人满100减20券', type: 'voucher', amount: 20, minAmount: 100, validDays: 30, stock: 5000, tags: ['新人', '首单'] },
  { id: 'c_002', name: '满200减50券', type: 'voucher', amount: 50, minAmount: 200, validDays: 7, stock: 3000, tags: ['限时'] },
  { id: 'c_003', name: '95折折扣券', type: 'discount', discountRate: 95, validDays: 14, stock: 10000, tags: ['折扣'] },
  { id: 'c_004', name: '满500减100券', type: 'voucher', amount: 100, minAmount: 500, validDays: 30, stock: 2000, tags: ['大额'] },
  { id: 'c_005', name: '50元返现券', type: 'cashback', amount: 50, validDays: 7, stock: 500, tags: ['返现'] },
  { id: 'c_006', name: '9折折扣券', type: 'discount', discountRate: 90, validDays: 3, stock: 8000, tags: ['秒杀'] }
]

const couponList = ref<Coupon[]>([])

// 过滤后的列表
const filteredCouponList = computed(() => {
  if (!searchKeyword.value) return couponList.value
  return couponList.value.filter(c => 
    c.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 已选优惠券
const selectedCoupon = computed(() => {
  return couponList.value.find(c => c.id === formData.value.couponId)
})

// 加载优惠券列表
const loadCouponList = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  couponList.value = mockCouponList
}

// 搜索
const handleSearch = (value: string) => {
  searchKeyword.value = value
}

// 选择优惠券
const handleSelectCoupon = (coupon: Coupon) => {
  formData.value.couponId = coupon.id
  formData.value.grantCount = 1
}

// 监听数据变化
watch(formData, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
}, { deep: true })

onMounted(() => {
  loadCouponList()
})

// 暴露方法
defineExpose({
  validate: () => formRef.value?.validate(),
  getData: () => ({ ...formData.value })
})
</script>

<style scoped>
.coupon-selector-form {
  padding: 8px 0;
}

.search-bar {
  margin-bottom: 16px;
}

.coupon-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
}

.coupon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border-2);
  cursor: pointer;
  transition: background-color 0.2s;
}

.coupon-item:last-child {
  border-bottom: none;
}

.coupon-item:hover {
  background-color: var(--color-bg-2);
}

.coupon-item--selected {
  background-color: var(--color-primary-light-1);
}

.coupon-content {
  flex: 1;
}

.coupon-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.coupon-name {
  font-weight: 500;
}

.coupon-info {
  font-size: 12px;
  color: var(--color-text-3);
}

.coupon-info span {
  margin-right: 12px;
}

.coupon-tags {
  margin-top: 4px;
}

.coupon-check {
  margin-left: 12px;
}

.selected-coupon-card {
  background-color: var(--color-bg-2);
}

.selected-coupon .coupon-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.selected-coupon .coupon-desc {
  font-size: 12px;
  color: var(--color-text-3);
}

.divider {
  margin: 0 8px;
}
</style>