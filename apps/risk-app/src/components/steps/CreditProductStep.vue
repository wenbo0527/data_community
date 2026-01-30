<template>
  <div>
    <a-form layout="vertical">
      <a-form-item label="信贷产品选择" field="creditProducts">
        <a-input-tag v-model="creditProducts" placeholder="输入产品后回车添加" />
      </a-form-item>
    </a-form>
    <a-space style="margin-top:12px">
      <a-button @click="$emit('prev')">上一步</a-button>
      <a-button type="primary" @click="$emit('next')">完成</a-button>
    </a-space>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: Object, default: () => ({ creditProducts: [] }) } })
const emit = defineEmits(['next','prev','update:modelValue'])
const creditProducts = ref(props.modelValue?.creditProducts || [])
watch(creditProducts, () => emit('update:modelValue', { creditProducts: creditProducts.value }), { deep: true })
</script>
