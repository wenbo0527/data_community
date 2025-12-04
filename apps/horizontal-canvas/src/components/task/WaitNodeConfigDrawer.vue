<template>
  <a-drawer :visible="visible" title="等待配置" :footer="false" @update:visible="$emit('update:visible', $event)">
    <a-form :model="form" :rules="rules" layout="vertical">
      <a-form-item label="节点名称" field="nodeName">
        <a-input v-model="form.nodeName" :disabled="readOnly" />
      </a-form-item>
      <a-form-item label="等待时间" field="value">
        <a-input-number v-model="form.value" :min="1" :precision="0" :disabled="readOnly" style="width: 160px;" />
        <a-select v-model="form.unit" :disabled="readOnly" style="width: 120px; margin-left: 8px;">
          <a-option value="分钟">分钟</a-option>
          <a-option value="小时">小时</a-option>
          <a-option value="天">天</a-option>
        </a-select>
      </a-form-item>
      <a-alert type="warning" v-if="formMaxExceeded" style="margin-bottom: 8px;">
        最大等待时间为15天，请调整配置
      </a-alert>
      <a-space>
        <a-button v-if="!readOnly" type="primary" :disabled="formMaxExceeded" @click="confirm">确定</a-button>
        <a-button @click="cancel">{{ readOnly ? '关闭' : '取消' }}</a-button>
      </a-space>
    </a-form>
  </a-drawer>
</template>
<script setup>
import { reactive, computed } from 'vue'
const props = defineProps({ visible: { type: Boolean, default: false }, nodeData: { type: Object, default: () => ({}) }, readOnly: { type: Boolean, default: false } })
const emit = defineEmits(['update:visible','confirm','cancel'])
const initial = props.nodeData?.config || {}
const form = reactive({ nodeName: props.nodeData?.nodeName || initial?.nodeName || '', value: initial?.value || 10, unit: initial?.unit || '分钟' })
const rules = { value: [{ required: true, message: '请输入等待时间' }], nodeName: [{ required: true, message: '请输入节点名称' }] }
const maxMinutes = 15 * 24 * 60
const formMinutes = computed(() => {
  const v = Number(form.value) || 0
  switch (form.unit) {
    case '分钟': return v
    case '小时': return v * 60
    case '天': return v * 24 * 60
    default: return v
  }
})
const formMaxExceeded = computed(() => formMinutes.value > maxMinutes)
function confirm() { emit('confirm', { nodeName: form.nodeName, config: { value: Number(form.value), unit: form.unit, nodeName: form.nodeName, nodeType: 'wait' } }) }
function cancel() { emit('cancel') }
</script>
