<template>
  <BaseDrawer
    :visible="visible"
    title="短信节点配置"
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
      <a-form-item label="短信模板" field="smsTemplate">
        <a-select v-model="formData.smsTemplate" placeholder="请选择短信模板" allow-clear>
          <a-option v-for="template in smsTemplateOptions" :key="template.value" :value="template.value">{{ template.label }}</a-option>
        </a-select>
        <div class="form-item-tip">选择预设的短信模板进行发送</div>
      </a-form-item>
      <a-form-item v-if="formData.smsTemplate" label="短信内容预览">
        <div class="sms-preview">{{ getSmsPreviewContent() }}</div>
        <div class="form-item-tip">实际发送时会根据用户数据进行个性化替换</div>
      </a-form-item>
    </template>
    <template #debug="{ formData, isValid }">
      <div class="debug-info">
        <div>表单验证状态: {{ isValid ? '✓' : '✗' }}</div>
        <div>短信模板: {{ formData.smsTemplate ? '✓' : '✗' }}</div>
        <div>模板内容: {{ formData.smsTemplate ? '已选择' : '未选择' }}</div>
      </div>
    </template>
  </BaseDrawer>
</template>
<script setup>
import { computed } from 'vue'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'
const props = defineProps({ visible: { type: Boolean, default: false }, nodeData: { type: Object, default: () => ({}) }, readOnly: { type: Boolean, default: false } })
const emit = defineEmits(['update:visible', 'confirm', 'cancel'])
const smsTemplateOptions = [ { label: '营销推广模板', value: 'marketing' }, { label: '活动通知模板', value: 'activity' }, { label: '验证码模板', value: 'verification' }, { label: '订单通知模板', value: 'order' }, { label: '系统通知模板', value: 'system' } ]
const formRules = { smsTemplate: [ { required: true, message: '请选择短信模板' } ] }
const initialFormData = { nodeName: props.nodeData?.nodeName || '短信发送', smsTemplate: '' }
const { formData, formRef, isFormValid, submitting, handleSubmit, handleCancel, handleDebugSubmit } = useBaseDrawer({ props, emit, initialFormData, formRules, nodeType: 'sms', onSubmit: (data) => ({ smsTemplate: data.smsTemplate, nodeType: 'sms' }), onCancel: () => {} })
const getSmsPreviewContent = () => { const templateMap = { marketing: '【品牌名】亲爱的用户，我们为您准备了专属优惠活动，点击链接查看详情：http://example.com 退订回T', activity: '【品牌名】您好，我们即将举办精彩活动，时间：{活动时间}，地点：{活动地点}，期待您的参与！退订回T', verification: '【品牌名】您的验证码是：{验证码}，请在5分钟内完成验证，如非本人操作请忽略。', order: '【品牌名】您的订单{订单号}已确认，预计{发货时间}发货，感谢您的购买！退订回T', system: '【品牌名】系统通知：{通知内容}，如有疑问请联系客服。退订回T' }; return templateMap[formData.smsTemplate] || '请选择短信模板查看预览内容' }
</script>
<style scoped>
.form-item-tip { font-size: 12px; color: var(--color-text-3); margin-top: 4px }
.sms-preview { padding: 12px; background-color: var(--color-bg-2); border: 1px solid var(--color-border-2); border-radius: 4px; font-size: 14px; line-height: 1.5; color: var(--color-text-2) }
.debug-info { padding: 8px; background-color: var(--color-bg-2); border: 1px solid var(--color-border-2); border-radius: 4px; font-size: 12px; color: var(--color-text-3) }
.debug-info > div { margin-bottom: 4px }
.debug-info > div:last-child { margin-bottom: 0 }
</style>
