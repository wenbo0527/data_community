<template>
  <div class="reach-strategy-form">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
    >
      <!-- 触达渠道 -->
      <a-form-item field="channel" label="触达渠道" required>
        <a-select
          v-model="formData.channel"
          placeholder="请选择触达渠道"
        >
          <a-option value="sms">短信</a-option>
          <a-option value="ai-call">AI外呼</a-option>
          <a-option value="manual-call">人工外呼</a-option>
          <a-option value="app-push">APP推送</a-option>
          <a-option value="wechat-push">微信推送</a-option>
        </a-select>
      </a-form-item>

      <!-- 策略名称 -->
      <a-form-item field="strategyName" label="策略名称" required>
        <a-input
          v-model="formData.strategyName"
          placeholder="请输入策略名称"
          :max-length="50"
          show-word-limit
        />
      </a-form-item>

      <!-- 触达时间策略 -->
      <a-form-item field="timeStrategy" label="触达时间" required>
        <a-radio-group v-model="formData.timeStrategy">
          <a-radio value="immediate">立即触达</a-radio>
          <a-radio value="scheduled">定时触达</a-radio>
          <a-radio value="delay">延迟触达</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 定时触达配置 -->
      <a-form-item v-if="formData.timeStrategy === 'scheduled'" field="scheduledTime" label="定时时间" required>
        <a-date-picker
          v-model="formData.scheduledTime"
          type="datetime"
          placeholder="请选择触达时间"
          style="width: 100%"
        />
      </a-form-item>

      <!-- 延迟触达配置 -->
      <a-form-item v-if="formData.timeStrategy === 'delay'" field="delayHours" label="延迟小时数" required>
        <a-input-number
          v-model="formData.delayHours"
          :min="1"
          :max="168"
          placeholder="1-168小时"
          style="width: 100%"
        />
        <template #extra>
          <span class="form-tip">延迟触达：用户满足条件后等待N小时再触达</span>
        </template>
      </a-form-item>

      <!-- 重试策略 -->
      <a-form-item field="retryStrategy" label="失败重试">
        <a-switch v-model="formData.retryStrategy">
          <template #checked>开启</template>
          <template #unchecked>关闭</template>
        </a-switch>
      </a-form-item>

      <!-- 重试次数 -->
      <a-form-item v-if="formData.retryStrategy" field="retryCount" label="重试次数">
        <a-input-number
          v-model="formData.retryCount"
          :min="1"
          :max="5"
          :step="1"
          placeholder="1-5次"
          style="width: 100%"
        />
      </a-form-item>

      <!-- 重试间隔 -->
      <a-form-item v-if="formData.retryStrategy" field="retryInterval" label="重试间隔">
        <a-input-number
          v-model="formData.retryInterval"
          :min="30"
          :max="3600"
          :step="30"
          placeholder="30-3600秒"
          style="width: 100%"
        >
          <template #suffix>秒</template>
        </a-input-number>
      </a-form-item>

      <!-- 渠道配置（根据渠道动态显示） -->
      <a-form-item v-if="formData.channel === 'sms'" field="smsTemplate" label="短信模板" required>
        <a-select
          v-model="formData.smsTemplate"
          placeholder="请选择短信模板"
        >
          <a-option value="marketing">营销推广模板</a-option>
          <a-option value="activity">活动通知模板</a-option>
          <a-option value="verification">验证码模板</a-option>
          <a-option value="order">订单通知模板</a-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="formData.channel === 'ai-call'" field="aiTaskId" label="AI外呼任务ID" required>
        <a-input
          v-model="formData.aiTaskId"
          placeholder="请输入AI外呼任务ID"
        />
      </a-form-item>

      <a-form-item v-if="formData.channel === 'manual-call'" field="manualConfigId" label="人工外呼配置ID" required>
        <a-input
          v-model="formData.manualConfigId"
          placeholder="请输入人工外呼配置ID"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { FormInstance } from '@arco-design/web-vue'

interface ReachStrategyFormData {
  channel?: 'sms' | 'ai-call' | 'manual-call' | 'app-push' | 'wechat-push'
  strategyName?: string
  timeStrategy?: 'immediate' | 'scheduled' | 'delay'
  scheduledTime?: string
  delayHours?: number
  retryStrategy?: boolean
  retryCount?: number
  retryInterval?: number
  smsTemplate?: string
  aiTaskId?: string
  manualConfigId?: string
}

interface Props {
  modelValue?: ReachStrategyFormData
}

interface Emits {
  (e: 'update:modelValue', value: ReachStrategyFormData): void
  (e: 'change', value: ReachStrategyFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    channel: 'sms',
    strategyName: '',
    timeStrategy: 'immediate',
    scheduledTime: '',
    delayHours: 24,
    retryStrategy: true,
    retryCount: 3,
    retryInterval: 300,
    smsTemplate: '',
    aiTaskId: '',
    manualConfigId: ''
  })
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

const formData = ref<ReachStrategyFormData>({
  channel: props.modelValue.channel || 'sms',
  strategyName: props.modelValue.strategyName || '',
  timeStrategy: props.modelValue.timeStrategy || 'immediate',
  scheduledTime: props.modelValue.scheduledTime || '',
  delayHours: props.modelValue.delayHours || 24,
  retryStrategy: props.modelValue.retryStrategy !== undefined ? props.modelValue.retryStrategy : true,
  retryCount: props.modelValue.retryCount || 3,
  retryInterval: props.modelValue.retryInterval || 300,
  smsTemplate: props.modelValue.smsTemplate || '',
  aiTaskId: props.modelValue.aiTaskId || '',
  manualConfigId: props.modelValue.manualConfigId || ''
})

const formRules = {
  channel: [
    { required: true, message: '请选择触达渠道' }
  ],
  strategyName: [
    { required: true, message: '请输入策略名称' }
  ],
  timeStrategy: [
    { required: true, message: '请选择触达时间策略' }
  ],
  scheduledTime: [
    { required: true, message: '请选择定时时间' }
  ],
  delayHours: [
    { required: true, message: '请输入延迟小时数' }
  ],
  smsTemplate: [
    { required: true, message: '请选择短信模板' }
  ],
  aiTaskId: [
    { required: true, message: '请输入AI外呼任务ID' }
  ],
  manualConfigId: [
    { required: true, message: '请输入人工外呼配置ID' }
  ]
}

// 监听数据变化
watch(formData, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
}, { deep: true })

// 暴露方法供父组件调用
defineExpose({
  validate: () => formRef.value?.validate(),
  getData: () => ({ ...formData.value })
})
})
</script>

<style scoped>
.reach-strategy-form {
  padding: 8px 0;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>