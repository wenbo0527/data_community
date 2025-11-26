<template>
  <a-drawer :visible="visible" title="等待配置" :footer="false" @update:visible="$emit('update:visible', $event)">
    <a-form :model="form">
      <a-form-item label="节点名称"><a-input v-model="form.nodeName" :disabled="readOnly" /></a-form-item>
      <a-space>
        <a-button v-if="!readOnly" type="primary" @click="confirm">确定</a-button>
        <a-button @click="cancel">{{ readOnly ? '关闭' : '取消' }}</a-button>
      </a-space>
    </a-form>
  </a-drawer>
</template>
<script setup>
import { reactive } from 'vue'
const props = defineProps({ visible: { type: Boolean, default: false }, nodeData: { type: Object, default: () => ({}) }, readOnly: { type: Boolean, default: false } })
const emit = defineEmits(['update:visible','confirm','cancel'])
const form = reactive({ nodeName: props.nodeData?.nodeName || '' })
function confirm() { emit('confirm', { nodeName: form.nodeName }) }
function cancel() { emit('cancel') }
</script>
