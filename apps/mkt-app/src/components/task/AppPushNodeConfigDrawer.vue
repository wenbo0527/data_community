<template>
  <BaseDrawer
    :visible="visible"
    title="APP PUSH 节点配置"
    width="520px"
    :form-data="formData"
    :form-rules="formRules"
    :form-ref="formRef"
    :is-form-valid="isFormValid"
    :submitting="submitting"
    :read-only="readOnly"
    @update:visible="(val) => emit('update:visible', val)"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @debug-submit="handleDebugSubmit"
  >
    <template #form="{ formData }">
      <a-form-item label="节点名称" field="nodeName" required>
        <a-input v-model="formData.nodeName" placeholder="请输入节点名称" allow-clear />
      </a-form-item>
      <a-form-item label="推送标题" field="pushTitle" required>
        <a-input v-model="formData.pushTitle" placeholder="请输入推送标题" allow-clear />
      </a-form-item>
      <a-form-item label="推送内容" field="pushContent" required>
        <a-textarea v-model="formData.pushContent" placeholder="请输入推送内容" :auto-size="{ minRows: 3, maxRows: 5 }" allow-clear />
      </a-form-item>
      <a-form-item label="跳转链接" field="jumpUrl">
        <a-input v-model="formData.jumpUrl" placeholder="请输入点击后的跳转链接" allow-clear />
      </a-form-item>
    </template>
    <template #debug="{ formData, isValid }">
      <div class="debug-info">
        <div>表单验证状态: {{ isValid ? '✓' : '✗' }}</div>
        <div>标题已填写: {{ formData.pushTitle ? '✓' : '✗' }}</div>
        <div>内容已填写: {{ formData.pushContent ? '✓' : '✗' }}</div>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { computed } from 'vue'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  nodeData: { type: Object, default: () => ({}) },
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const formRules = {
  nodeName: [{ required: true, message: '请输入节点名称' }],
  pushTitle: [{ required: true, message: '请输入推送标题' }],
  pushContent: [{ required: true, message: '请输入推送内容' }]
}

const initialFormData = {
  nodeName: props.nodeData?.nodeName || 'APP PUSH',
  pushTitle: props.nodeData?.pushTitle || '',
  pushContent: props.nodeData?.pushContent || '',
  jumpUrl: props.nodeData?.jumpUrl || ''
}

const {
  formData,
  formRef,
  isFormValid,
  submitting,
  handleSubmit,
  handleCancel,
  handleDebugSubmit
} = useBaseDrawer({
  props,
  emit,
  initialFormData,
  formRules,
  nodeType: 'app-push',
  onSubmit: (data) => ({
    ...data,
    nodeType: 'app-push'
  }),
  onCancel: () => {}
})
</script>

<style scoped>
.debug-info {
  padding: 8px;
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-text-3);
}
.debug-info > div {
  margin-bottom: 4px;
}
</style>
