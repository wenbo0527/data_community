<template>
  <a-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :disabled="disabled || locked"
    :style="{ width: width }"
    :options="availableOptions"
    :field-names="{ label: 'label', value: 'value' }"
    @change="handleChange"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { PRICED_PRODUCTS } from '@/types/api/coupon'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  /**
   * 券类型，用于控制产品选项范围
   * 'PRICED_DISCOUNT' → 只显示京东/美团
   * 其他类型 → 不显示产品选项（本组件隐藏）
   */
  couponType: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '请选择产品',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '100%',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    selectedValue.value = val
  }
)

const availableOptions = computed(() => {
  // 只有临价折扣券才显示产品选择（京东/美团）
  if (props.couponType === 'PRICED_DISCOUNT') {
    return PRICED_PRODUCTS.map((p) => ({
      label: p.product_name,
      value: p.product_id,
    }))
  }
  // 其他券类型不显示（本组件用于临价折扣券专用）
  return []
})

const handleChange = (value) => {
  selectedValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>