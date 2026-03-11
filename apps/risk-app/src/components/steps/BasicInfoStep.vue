<template>
  <div>
    <a-form :model="modelValue" layout="vertical">
      <a-form-item label="流程名称" field="name"><a-input v-model="modelValue.name" /></a-form-item>
      <a-form-item label="缓存时间(天)" field="days"><a-input-number v-model="modelValue.days" :min="0" style="width:100%" /></a-form-item>
      <a-form-item label="描述" field="description"><a-textarea v-model="modelValue.description" :rows="3" /></a-form-item>
    </a-form>
    <a-space style="margin-top:12px">
      <a-button type="primary" @click="$emit('next')">下一步</a-button>
    </a-space>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: Object, default: () => ({ name: '', days: 0, description: '' }) } })
defineEmits(['next','prev','update:modelValue'])
</script>
