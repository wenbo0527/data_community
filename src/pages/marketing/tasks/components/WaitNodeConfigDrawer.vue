<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="等待节点配置"
    width="480px"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <!-- 等待时间配置 -->
      <a-form-item label="等待时间设置" field="waitTime">
        <div class="wait-time-container">
          <span class="wait-label">等待</span>
          <a-input-number
            v-model="formData.waitTime.value"
            :min="1"
            :max="getMaxTimeValue()"
            placeholder="请输入时间"
            class="time-input"
          />
          <a-select
            v-model="formData.waitTime.unit"
            class="unit-select"
            @change="handleTimeUnitChange"
          >
            <a-option value="minutes">分钟</a-option>
            <a-option value="hours">小时</a-option>
            <a-option value="days">天</a-option>
          </a-select>
        </div>
        <div class="form-item-tip">
          格式：等待 [时间数值] [时间单位]，设置用户在此节点的等待时间
        </div>
      </a-form-item>
    </template>

    <template #debug>
      <div class="debug-info">
        <div><strong>等待时间:</strong> {{ getFormattedWaitTime() }}</div>
        <div><strong>预计结束时间:</strong> {{ getEstimatedEndTime() }}</div>
        <div><strong>表单验证状态:</strong> {{ isFormValid ? '有效' : '无效' }}</div>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  nodeData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 表单验证规则
const formRules = {
  waitTime: [
    { required: true, message: '请输入等待时间' }
  ]
}

// 初始表单数据
const getInitialFormData = () => ({
  waitTime: {
    value: 30,
    unit: 'minutes'
  }
})

// 自定义验证函数
const customValidation = () => {
  return formData.waitTime.value > 0
}

// 使用基础抽屉组合式函数
const {
  formData,
  visible,
  isSubmitting,
  isFormValid,
  handleSubmit: baseHandleSubmit,
  handleCancel
} = useBaseDrawer({
  props,
  emit,
  formRules,
  getInitialFormData,
  customValidation,
  nodeType: 'wait'
})

// 获取时间最大值
const getMaxTimeValue = () => {
  switch (formData.waitTime.unit) {
    case 'minutes':
      return 1440 // 24小时
    case 'hours':
      return 720 // 30天
    case 'days':
      return 365 // 1年
    default:
      return 1440
  }
}

// 处理时间单位变化
const handleTimeUnitChange = () => {
  const maxValue = getMaxTimeValue()
  if (formData.waitTime.value > maxValue) {
    formData.waitTime.value = maxValue
  }
}

// 格式化等待时间显示
const getFormattedWaitTime = () => {
  const { value, unit } = formData.waitTime
  const unitMap = {
    minutes: '分钟',
    hours: '小时',
    days: '天'
  }
  return `${value} ${unitMap[unit]}`
}

// 获取预计结束时间
const getEstimatedEndTime = () => {
  const now = new Date()
  const { value, unit } = formData.waitTime
  
  let milliseconds = 0
  switch (unit) {
    case 'minutes':
      milliseconds = value * 60 * 1000
      break
    case 'hours':
      milliseconds = value * 60 * 60 * 1000
      break
    case 'days':
      milliseconds = value * 24 * 60 * 60 * 1000
      break
  }
  
  const endTime = new Date(now.getTime() + milliseconds)
  return endTime.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理提交
const handleSubmit = async () => {
  const config = {
    waitTime: formData.waitTime,
    nodeType: 'wait'
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

.form-item-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.wait-time-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wait-label {
  font-weight: 500;
  color: var(--color-text-1);
  white-space: nowrap;
}

.time-input {
  flex: 1;
  min-width: 120px;
}

.unit-select {
  width: 100px;
}
</style>