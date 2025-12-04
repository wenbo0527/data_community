<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    title="事件分流节点配置"
    width="480px"
    :read-only="readOnly"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <div class="debug-info">
        <div>表单验证状态: {{ isValid ? '✓' : '✗' }}</div>
        <div>事件类型: {{ formData.eventType || '未选择' }}</div>
        <div>自定义事件: {{ formData.eventType === 'custom' ? (formData.customEventName || '未填写') : '不适用' }}</div>
        <div>超时设置: {{ formData.timeout }}分钟</div>
      </div>
      <a-form-item label="节点名称" field="nodeName">
        <a-input v-model="formData.nodeName" placeholder="请输入节点名称" allow-clear />
      </a-form-item>
      <a-form-item label="事件类型" field="eventType" required>
        <a-select v-model="formData.eventType" placeholder="请选择事件类型" allow-clear>
          <a-option value="sms_success">短信发送成功事件</a-option>
          <a-option value="app_hot_scene">APP热场景事件</a-option>
          <a-option value="click">点击事件</a-option>
          <a-option value="view">浏览事件</a-option>
          <a-option value="purchase">购买事件</a-option>
          <a-option value="register">注册事件</a-option>
          <a-option value="login">登录事件</a-option>
          <a-option value="custom">自定义事件</a-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="formData.eventType === 'custom'" label="自定义事件名称" field="customEventName" required>
        <a-input v-model="formData.customEventName" placeholder="请输入自定义事件名称" allow-clear />
      </a-form-item>
      <a-form-item label="事件条件" field="eventCondition">
        <a-textarea v-model="formData.eventCondition" placeholder="请输入事件触发条件（可选）" :rows="3" allow-clear />
      </a-form-item>
      <a-form-item label="分支标签配置">
        <div class="branch-labels">
          <a-form-item label="满足条件分支" field="yesLabel">
            <a-input v-model="formData.yesLabel" placeholder="默认：是" allow-clear />
          </a-form-item>
          <a-form-item label="不满足条件分支" field="noLabel">
            <a-input v-model="formData.noLabel" placeholder="默认：否" allow-clear />
          </a-form-item>
        </div>
      </a-form-item>
      <a-form-item label="超时设置" field="timeout">
        <div style="display:flex; gap:8px; align-items:center;">
          <a-input-number v-model="formData.timeout" placeholder="事件等待超时时间" :min="1" style="width: 160px" />
          <a-select v-model="formData.unit" style="width: 120px">
            <a-option value="分钟">分钟</a-option>
            <a-option value="小时">小时</a-option>
            <a-option value="天">天</a-option>
          </a-select>
        </div>
        <div class="form-item-tip">根据超时设置，未发生事件将进入“否”分支</div>
      </a-form-item>
    </template>
  </BaseDrawer>
</template>
<script setup>
import { computed } from 'vue'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'
const props = defineProps({ visible: { type: Boolean, default: false }, nodeData: { type: Object, default: () => ({}) }, readOnly: { type: Boolean, default: false } })
const emit = defineEmits(['update:visible', 'confirm', 'cancel'])
const formRules = { eventType: [{ required: true, message: '请选择事件类型' }], customEventName: [{ required: true, message: '请输入自定义事件名称', trigger: 'blur' }] }
const getInitialFormData = () => ({ nodeName: props.nodeData?.nodeName || '事件分流', eventType: '', customEventName: '', eventCondition: '', yesLabel: '', noLabel: '', timeout: 60, unit: '分钟' })
const customValidation = (formData) => { const errors = []; if (!formData) return errors; if (!formData.eventType) errors.push('请选择事件类型'); if (formData.eventType === 'custom' && !formData.customEventName) errors.push('请输入自定义事件名称'); return errors }
const { formData, formRef, isValid, visible, isSubmitting, handleSubmit: baseHandleSubmit, handleCancel } = useBaseDrawer({ props, emit, formRules, getInitialFormData, customValidation, nodeType: 'event-split' })
const LABEL_MAP = { sms_success: '短信发送成功事件', app_hot_scene: 'APP热场景事件', click: '点击事件', view: '浏览事件', purchase: '购买事件', register: '注册事件', login: '登录事件' }
const handleSubmit = async () => { const typeLabel = formData.eventType === 'custom' ? (formData.customEventName || '') : (LABEL_MAP[formData.eventType] || formData.eventType || ''); const config = { nodeName: formData.nodeName || '事件分流', eventType: formData.eventType, eventTypeLabel: typeLabel, customEventName: formData.customEventName, eventCondition: formData.eventCondition, yesLabel: formData.yesLabel || '是', noLabel: formData.noLabel || '否', timeout: formData.timeout, unit: formData.unit || '分钟', nodeType: 'event-split' }; await baseHandleSubmit(config) }
</script>
<style scoped>
.branch-labels { border: 1px solid var(--color-border-2); border-radius: 6px; padding: 16px; background-color: var(--color-fill-1) }
.branch-labels .arco-form-item { margin-bottom: 12px }
.branch-labels .arco-form-item:last-child { margin-bottom: 0 }
.form-item-tip { font-size: 12px; color: var(--color-text-3); margin-top: 4px; line-height: 1.4 }
.debug-info { font-size: 12px; color: #666; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-bottom: 12px }
.debug-info div { margin-bottom: 4px }
.debug-info div:last-child { margin-bottom: 0 }
.arco-form-item-label { font-weight: 500; color: var(--color-text-1) }
.arco-input, .arco-select, .arco-textarea, .arco-input-number { border-radius: 6px }
.arco-input:focus, .arco-select:focus, .arco-textarea:focus, .arco-input-number:focus { border-color: var(--color-primary-6); box-shadow: 0 0 0 2px var(--color-primary-1) }
</style>
