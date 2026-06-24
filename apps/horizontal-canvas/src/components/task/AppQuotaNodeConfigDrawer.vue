<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="营运额度节点配置"
    width="520px"
    :read-only="readOnly"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <a-form-item label="节点名称" field="nodeName" required>
        <a-input
          v-model="formData.nodeName"
          placeholder="请输入节点名称"
          :max-length="50"
          show-word-limit
        />
      </a-form-item>

      <a-form-item label="额度类型" field="quotaType" required>
        <a-select
          v-model="formData.quotaType"
          placeholder="请选择额度类型"
          @change="handleQuotaTypeChange"
        >
          <a-option value="daily">每日额度</a-option>
          <a-option value="weekly">每周额度</a-option>
          <a-option value="monthly">每月额度</a-option>
          <a-option value="total">总额度</a-option>
        </a-select>
      </a-form-item>

      <a-form-item label="额度上限" field="quotaLimit" required>
        <a-input-number
          v-model="formData.quotaLimit"
          :min="1"
          :max="999999999"
          :step="1000"
          placeholder="请输入额度上限"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </a-input-number>
      </a-form-item>

      <a-form-item label="预警阈值" field="alertThreshold">
        <a-input-number
          v-model="formData.alertThreshold"
          :min="0"
          :max="formData.quotaLimit"
          :step="100"
          placeholder="请输入预警阈值（可选）"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </a-input-number>
        <template #extra>
          <span class="form-tip">额度剩余低于此值时触发预警通知</span>
        </template>
      </a-form-item>

      <a-form-item label="重置周期" field="resetCycle">
        <a-select
          v-model="formData.resetCycle"
          placeholder="请选择重置周期"
        >
          <a-option value="none">不重置</a-option>
          <a-option value="daily">每日重置</a-option>
          <a-option value="weekly">每周重置</a-option>
          <a-option value="monthly">每月重置</a-option>
        </a-select>
      </a-form-item>

      <a-form-item label="重置时间" v-if="formData.resetCycle && formData.resetCycle !== 'none'" field="resetTime">
        <a-time-picker
          v-model="formData.resetTime"
          placeholder="请选择重置时间"
          format="HH:mm"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="启用预警通知" field="enableAlert">
        <a-switch v-model="formData.enableAlert">
          <template #checked>开启</template>
          <template #unchecked>关闭</template>
        </a-switch>
      </a-form-item>

      <a-form-item v-if="formData.enableAlert" label="通知人员" field="notifyUsers">
        <a-select
          v-model="formData.notifyUsers"
          placeholder="选择需要通知的人员"
          multiple
          allow-clear
        >
          <a-option value="user_001">运营A</a-option>
          <a-option value="user_002">运营B</a-option>
          <a-option value="user_003">运营C</a-option>
          <a-option value="user_004">主管D</a-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="formData.enableAlert" label="通知方式" field="notifyChannel">
        <a-checkbox-group v-model="formData.notifyChannel">
          <a-checkbox value="inbox">站内信</a-checkbox>
          <a-checkbox value="email">邮件</a-checkbox>
        </a-checkbox-group>
      </a-form-item>
    </template>

    <template #debug>
      <div class="debug-info">
        <div><strong>额度类型:</strong> {{ formData.quotaType || '未设置' }}</div>
        <div><strong>额度上限:</strong> {{ formData.quotaLimit ? `¥${formData.quotaLimit}` : '未设置' }}</div>
        <div><strong>预警阈值:</strong> {{ formData.alertThreshold ? `¥${formData.alertThreshold}` : '未设置' }}</div>
        <div><strong>重置周期:</strong> {{ formData.resetCycle || '未设置' }}</div>
        <div><strong>预警通知:</strong> {{ formData.enableAlert ? '已开启' : '已关闭' }}</div>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'

interface AppQuotaFormData {
  nodeName?: string
  quotaType?: 'daily' | 'weekly' | 'monthly' | 'total'
  quotaLimit?: number
  alertThreshold?: number
  resetCycle?: 'none' | 'daily' | 'weekly' | 'monthly'
  resetTime?: string
  enableAlert?: boolean
  notifyUsers?: string[]
  notifyChannel?: string[]
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  nodeData: { type: Object, default: () => ({}) },
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const formRules = {
  quotaType: [
    { required: true, message: '请选择额度类型' }
  ],
  quotaLimit: [
    { required: true, message: '请输入额度上限' }
  ]
}

const getInitialFormData = (): AppQuotaFormData => ({
  nodeName: props.nodeData?.nodeName || '营运额度',
  quotaType: props.nodeData?.quotaType || 'daily',
  quotaLimit: props.nodeData?.quotaLimit || 100000,
  alertThreshold: props.nodeData?.alertThreshold || 10000,
  resetCycle: props.nodeData?.resetCycle || 'daily',
  resetTime: props.nodeData?.resetTime || '00:00',
  enableAlert: props.nodeData?.enableAlert !== false,
  notifyUsers: props.nodeData?.notifyUsers || [],
  notifyChannel: props.nodeData?.notifyChannel || ['inbox']
})

const handleQuotaTypeChange = (value: string) => {
  // 额度类型切换时的逻辑
}

const customValidation = (formData: AppQuotaFormData) => {
  const errors: string[] = []
  if (!formData.quotaType) {
    errors.push('请选择额度类型')
  }
  if (!formData.quotaLimit || formData.quotaLimit <= 0) {
    errors.push('请输入额度上限')
  }
  if (formData.alertThreshold && formData.quotaLimit && formData.alertThreshold > formData.quotaLimit) {
    errors.push('预警阈值不能大于额度上限')
  }
  if (formData.enableAlert && (!formData.notifyUsers || formData.notifyUsers.length === 0)) {
    errors.push('请选择通知人员')
  }
  if (formData.enableAlert && (!formData.notifyChannel || formData.notifyChannel.length === 0)) {
    errors.push('请选择通知方式')
  }
  return errors
}

const { formData, visible, isSubmitting, isFormValid, handleSubmit: baseHandleSubmit, handleCancel } = useBaseDrawer({
  props,
  emit,
  formRules,
  getInitialFormData,
  customValidation,
  nodeType: 'app-quota'
})

const handleSubmit = async () => {
  const config = {
    quotaType: formData.value.quotaType,
    quotaLimit: formData.value.quotaLimit,
    alertThreshold: formData.value.alertThreshold,
    resetCycle: formData.value.resetCycle,
    resetTime: formData.value.resetTime,
    enableAlert: formData.value.enableAlert,
    notifyUsers: formData.value.notifyUsers,
    notifyChannel: formData.value.notifyChannel,
    nodeType: 'app-quota'
  }
  await baseHandleSubmit(config)
}
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

.debug-info > div:last-child {
  margin-bottom: 0;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>