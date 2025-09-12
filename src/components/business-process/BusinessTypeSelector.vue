<template>
  <div class="business-type-selector">
    <div class="selector-header">
      <h4 class="selector-title">业务类型</h4>
      <div class="selector-description">选择您要管理的业务类型</div>
    </div>
    
    <div class="type-options">
      <a-radio-group 
        v-model="selectedBusinessType" 
        type="button"
        size="large"
        @change="handleBusinessTypeChange"
      >
        <a-radio 
          v-for="option in businessTypeOptions" 
          :key="option.value" 
          :value="option.value"
          class="type-option"
        >
          <div class="option-content">
            <div class="option-icon">
              <component :is="option.icon" />
            </div>
            <div class="option-text">
              <div class="option-label">{{ option.label }}</div>
              <div class="option-desc">{{ option.description }}</div>
            </div>
          </div>
        </a-radio>
      </a-radio-group>
    </div>
    
    <!-- 产品类型选择 -->
    <div v-if="selectedBusinessType" class="product-type-section">
      <div class="section-header">
        <h5 class="section-title">产品类型</h5>
        <div class="section-description">选择具体的产品类型</div>
      </div>
      
      <div class="product-options">
        <a-select
          v-model="selectedProductType"
          placeholder="请选择产品类型"
          size="large"
          :style="{ width: '100%' }"
          @change="handleProductTypeChange"
        >
          <a-option 
            v-for="product in currentProductOptions" 
            :key="product.value" 
            :value="product.value"
          >
            <div class="product-option">
              <span class="product-label">{{ product.label }}</span>
              <span class="product-desc">{{ product.description }}</span>
            </div>
          </a-option>
        </a-select>
      </div>
    </div>
    
    <!-- 选择结果展示 -->
    <div v-if="selectedBusinessType && selectedProductType" class="selection-result">
      <div class="result-header">
        <icon-check-circle class="result-icon" />
        <span class="result-text">已选择配置</span>
      </div>
      <div class="result-content">
        <a-tag color="blue" size="large">
          {{ getBusinessTypeName(selectedBusinessType) }}
        </a-tag>
        <icon-arrow-right class="arrow-icon" />
        <a-tag color="green" size="large">
          {{ getProductTypeName(selectedProductType) }}
        </a-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  IconHome, 
  IconApps, 
  IconUser,
  IconCheckCircle,
  IconArrowRight
} from '@arco-design/web-vue/es/icon'

interface BusinessTypeOption {
  value: string
  label: string
  description: string
  icon: any
}

interface ProductTypeOption {
  value: string
  label: string
  description: string
}

interface Props {
  modelValue?: {
    businessType: string
    productType: string
  }
}

interface Emits {
  (e: 'update:modelValue', value: { businessType: string; productType: string }): void
  (e: 'change', value: { businessType: string; productType: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const selectedBusinessType = ref<string>(props.modelValue?.businessType || '')
const selectedProductType = ref<string>(props.modelValue?.productType || '')

// 业务类型选项
const businessTypeOptions: BusinessTypeOption[] = [
  {
    value: 'self',
    label: '自营',
    description: '自主经营的金融业务',
    icon: IconHome
  },
  {
    value: 'supermarket',
    label: '贷超',
    description: '贷款超市平台业务',
    icon: IconApps
  },
  {
    value: 'assist',
    label: '助贷',
    description: '助贷服务业务',
    icon: IconUser
  }
]

// 产品类型选项映射
const productTypeOptionsMap: Record<string, ProductTypeOption[]> = {
  self: [
    { value: 'general', label: '通用', description: '通用金融产品' },
    { value: 'personal', label: '个人贷', description: '个人信贷产品' },
    { value: 'business', label: '企业贷', description: '企业信贷产品' },
    { value: 'mortgage', label: '房贷', description: '房屋抵押贷款' },
    { value: 'car', label: '车贷', description: '汽车消费贷款' }
  ],
  supermarket: [
    { value: 'general', label: '通用', description: '通用贷超产品' },
    { value: 'personal', label: '个人贷', description: '个人贷超产品' },
    { value: 'business', label: '企业贷', description: '企业贷超产品' }
  ],
  assist: [
    { value: 'general', label: '通用', description: '通用助贷产品' },
    { value: 'personal', label: '个人贷', description: '个人助贷产品' },
    { value: 'business', label: '企业贷', description: '企业助贷产品' }
  ]
}

// 计算属性
const currentProductOptions = computed(() => {
  return productTypeOptionsMap[selectedBusinessType.value] || []
})

// 方法
const getBusinessTypeName = (type: string): string => {
  const option = businessTypeOptions.find(opt => opt.value === type)
  return option?.label || type
}

const getProductTypeName = (type: string): string => {
  const option = currentProductOptions.value.find(opt => opt.value === type)
  return option?.label || type
}

const handleBusinessTypeChange = (value: string) => {
  selectedBusinessType.value = value
  // 重置产品类型选择
  selectedProductType.value = ''
  emitChange()
}

const handleProductTypeChange = (value: string) => {
  selectedProductType.value = value
  emitChange()
}

const emitChange = () => {
  const value = {
    businessType: selectedBusinessType.value,
    productType: selectedProductType.value
  }
  emit('update:modelValue', value)
  emit('change', value)
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedBusinessType.value = newValue.businessType || ''
    selectedProductType.value = newValue.productType || ''
  }
}, { deep: true })
</script>

<style scoped>
.business-type-selector {
  padding: 24px;
  background: var(--color-bg-1);
  border-radius: 8px;
  border: 1px solid var(--color-border-2);
}

.selector-header {
  margin-bottom: 20px;
}

.selector-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
}

.selector-description {
  font-size: 14px;
  color: var(--color-text-3);
  line-height: 1.5;
}

.type-options {
  margin-bottom: 24px;
}

.type-options :deep(.arco-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-option {
  width: 100% !important;
  height: auto !important;
  padding: 0 !important;
  border-radius: 8px !important;
  border: 1px solid var(--color-border-2) !important;
  background: var(--color-bg-2) !important;
  transition: all 0.2s ease !important;
}

.type-option:hover {
  border-color: var(--color-primary-light-4) !important;
  background: var(--color-primary-light-1) !important;
}

.type-option :deep(.arco-radio-button) {
  width: 100%;
  height: auto;
  padding: 16px;
  border: none;
  background: transparent;
}

.type-option.arco-radio-checked {
  border-color: var(--color-primary-6) !important;
  background: var(--color-primary-light-1) !important;
  box-shadow: 0 0 0 2px rgba(var(--arcoblue-6), 0.1) !important;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--color-primary-light-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-6);
  font-size: 20px;
  flex-shrink: 0;
}

.type-option.arco-radio-checked .option-icon {
  background: var(--color-primary-6);
  color: white;
}

.option-text {
  flex: 1;
  text-align: left;
}

.option-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 4px;
}

.option-desc {
  font-size: 13px;
  color: var(--color-text-3);
  line-height: 1.4;
}

.type-option.arco-radio-checked .option-label {
  color: var(--color-primary-6);
}

.product-type-section {
  margin-bottom: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-2);
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}

.section-description {
  font-size: 13px;
  color: var(--color-text-3);
}

.product-options :deep(.arco-select-view) {
  border-radius: 8px;
}

.product-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
}

.product-desc {
  font-size: 12px;
  color: var(--color-text-3);
}

.selection-result {
  padding: 16px;
  background: var(--color-success-light-1);
  border: 1px solid var(--color-success-light-3);
  border-radius: 8px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.result-icon {
  font-size: 16px;
  color: var(--color-success-6);
}

.result-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-success-6);
}

.result-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.arrow-icon {
  font-size: 14px;
  color: var(--color-text-3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .business-type-selector {
    padding: 16px;
  }
  
  .option-content {
    gap: 12px;
  }
  
  .option-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .option-label {
    font-size: 15px;
  }
  
  .option-desc {
    font-size: 12px;
  }
}
</style>