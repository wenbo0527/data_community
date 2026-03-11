<template>
  <div>
    <a-form layout="vertical">
      <a-form-item label="周期配置(天)" field="periodDays">
        <a-input-tag v-model="internal.periodDays" />
      </a-form-item>
      <a-form-item label="数据产品列表" field="products">
        <a-table :data="internal.products" :pagination="false">
          <template #columns>
            <a-table-column title="名称" data-index="name" :width="200" />
            <a-table-column title="总金额" data-index="totalAmount" :width="160" />
          </template>
          <template #empty><a-empty description="暂无产品" /></template>
        </a-table>
      </a-form-item>
    </a-form>
    <a-space style="margin-top:12px">
      <a-button @click="$emit('prev')">上一步</a-button>
      <a-button type="primary" @click="$emit('next')">下一步</a-button>
    </a-space>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({ modelValue: { type: Object, default: () => ({ products: [], periodDays: [] }) } })
const emit = defineEmits(['next','prev','update:modelValue'])
const internal = reactive({ products: props.modelValue.products || [], periodDays: props.modelValue.periodDays || [] })
watch(internal, () => emit('update:modelValue', internal), { deep: true })
</script>
