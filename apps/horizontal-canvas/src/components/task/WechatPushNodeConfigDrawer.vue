<template>
  <BaseDrawer
    :visible="visible"
    title="公众号推送节点配置"
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
      <a-form-item label="公众号模板" field="wechatTemplate" required>
        <a-select v-model="formData.wechatTemplate" placeholder="请选择公众号模板" allow-clear>
          <a-option v-for="tpl in templateOptions" :key="tpl.value" :value="tpl.value">{{ tpl.label }}</a-option>
        </a-select>
      </a-form-item>
      <div v-if="formData.wechatTemplate" class="template-preview">
        <div class="preview-title">模板预览:</div>
        <div class="preview-content">{{ getTemplatePreview() }}</div>
      </div>
    </template>
    <template #debug="{ formData, isValid }">
      <div class="debug-info">
        <div>表单验证状态: {{ isValid ? '✓' : '✗' }}</div>
        <div>模板已选择: {{ formData.wechatTemplate ? '✓' : '✗' }}</div>
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

const templateOptions = [
  { label: '活动优惠提醒', value: 'discount' },
  { label: '服务进度通知', value: 'service_progress' },
  { label: '账户变动提醒', value: 'account_change' }
]

const formRules = {
  nodeName: [{ required: true, message: '请输入节点名称' }],
  wechatTemplate: [{ required: true, message: '请选择公众号模板' }]
}

const initialFormData = {
  nodeName: props.nodeData?.nodeName || '公众号推送',
  wechatTemplate: props.nodeData?.wechatTemplate || ''
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
  nodeType: 'wechat-push',
  onSubmit: (data) => ({
    ...data,
    nodeType: 'wechat-push'
  }),
  onCancel: () => {}
})

const getTemplatePreview = () => {
  const previews = {
    discount: '【活动提醒】您有一张5折优惠券即将到期，请尽快使用。',
    service_progress: '【服务进度】您的申请已通过审核，点击查看详情。',
    account_change: '【变动提醒】您的账户于10:00发生一笔交易，金额：100元。'
  }
  return previews[formData.wechatTemplate] || ''
}
</script>

<style scoped>
.template-preview {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--color-fill-2);
  border-radius: 4px;
}
.preview-title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
}
.preview-content {
  font-size: 14px;
  color: var(--color-text-2);
}
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
