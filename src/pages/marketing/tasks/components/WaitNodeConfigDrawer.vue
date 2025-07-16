<template>
  <a-drawer
    v-model:visible="drawerVisible"
    title="等待节点配置"
    width="480px"
    placement="right"
    @cancel="handleCancel"
  >
    <div class="config-form">
      <a-form
        ref="formRef"
        :model="formData"
        layout="vertical"
        :rules="formRules"
      >
        <!-- 等待时间配置 -->
        <a-form-item label="等待时间" field="waitTime">
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
            设置用户在此节点的等待时间，等待结束后自动进入下一节点
          </div>
        </a-form-item>

        <!-- 等待时间预览 -->
        <a-form-item label="等待时间预览">
          <div class="time-preview">
            <div class="preview-item">
              <span class="preview-label">等待时长：</span>
              <span class="preview-value">{{ getFormattedWaitTime() }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">预计结束时间：</span>
              <span class="preview-value">{{ getEstimatedEndTime() }}</span>
            </div>
          </div>
        </a-form-item>

        <!-- 等待类型 -->
        <a-form-item label="等待类型" field="waitType">
          <a-radio-group v-model="formData.waitType">
            <a-radio value="fixed">固定等待</a-radio>
            <a-radio value="conditional">条件等待</a-radio>
            <a-radio value="dynamic">动态等待</a-radio>
          </a-radio-group>
          <div class="form-item-tip">
            <div v-if="formData.waitType === 'fixed'">固定等待：按设定时间等待</div>
            <div v-else-if="formData.waitType === 'conditional'">条件等待：满足条件时提前结束等待</div>
            <div v-else>动态等待：根据用户行为动态调整等待时间</div>
          </div>
        </a-form-item>

        <!-- 条件等待配置 -->
        <a-form-item
          v-if="formData.waitType === 'conditional'"
          label="提前结束条件"
          field="endConditions"
        >
          <div class="conditions-container">
            <div
              v-for="(condition, index) in formData.endConditions"
              :key="index"
              class="condition-item"
            >
              <div class="condition-header">
                <span class="condition-label">条件 {{ index + 1 }}</span>
                <a-button
                  v-if="formData.endConditions.length > 1"
                  type="text"
                  status="danger"
                  size="small"
                  @click="removeCondition(index)"
                >
                  <template #icon>
                    <icon-delete />
                  </template>
                </a-button>
              </div>
              
              <div class="condition-content">
                <a-form-item
                  :field="`endConditions.${index}.type`"
                  label="条件类型"
                  :rules="[{ required: true, message: '请选择条件类型' }]"
                >
                  <a-select
                    v-model="condition.type"
                    placeholder="请选择条件类型"
                  >
                    <a-option value="user_action">用户行为</a-option>
                    <a-option value="time_window">时间窗口</a-option>
                    <a-option value="external_event">外部事件</a-option>
                    <a-option value="data_update">数据更新</a-option>
                  </a-select>
                </a-form-item>
                
                <a-form-item
                  :field="`endConditions.${index}.description`"
                  label="条件描述"
                  :rules="[{ required: true, message: '请输入条件描述' }]"
                >
                  <a-input
                    v-model="condition.description"
                    placeholder="请描述触发条件"
                  />
                </a-form-item>
              </div>
            </div>
            
            <!-- 添加条件按钮 -->
            <a-button
              v-if="formData.endConditions.length < 5"
              type="dashed"
              block
              @click="addCondition"
            >
              <template #icon>
                <icon-plus />
              </template>
              添加条件
            </a-button>
          </div>
        </a-form-item>

        <!-- 动态等待配置 -->
        <a-form-item
          v-if="formData.waitType === 'dynamic'"
          label="动态调整规则"
        >
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model="formData.dynamicConfig.adjustByUserActivity">
              根据用户活跃度调整
            </a-checkbox>
            <a-checkbox v-model="formData.dynamicConfig.adjustByTimeOfDay">
              根据时间段调整
            </a-checkbox>
            <a-checkbox v-model="formData.dynamicConfig.adjustByUserSegment">
              根据用户分群调整
            </a-checkbox>
          </a-space>
        </a-form-item>

        <!-- 等待期间行为 -->
        <a-form-item label="等待期间行为">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model="formData.enableNotification">
              发送等待通知
            </a-checkbox>
            <a-checkbox v-model="formData.enableProgressTracking">
              启用进度追踪
            </a-checkbox>
            <a-checkbox v-model="formData.enableUserInteraction">
              允许用户交互
            </a-checkbox>
          </a-space>
        </a-form-item>

        <!-- 超时处理 -->
        <a-form-item label="超时处理">
          <a-radio-group v-model="formData.timeoutAction">
            <a-radio value="continue">继续下一步</a-radio>
            <a-radio value="retry">重新等待</a-radio>
            <a-radio value="terminate">终止流程</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button
          type="primary"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          确定
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'

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

const formRef = ref()
const drawerVisible = ref(false)

// 表单数据
const formData = reactive({
  waitTime: {
    value: 30,
    unit: 'minutes'
  },
  waitType: 'fixed',
  endConditions: [
    {
      type: 'user_action',
      description: '用户点击邮件链接'
    }
  ],
  dynamicConfig: {
    adjustByUserActivity: false,
    adjustByTimeOfDay: false,
    adjustByUserSegment: false
  },
  enableNotification: false,
  enableProgressTracking: false,
  enableUserInteraction: false,
  timeoutAction: 'continue'
})

// 表单验证规则
const formRules = {
  waitTime: [
    { required: true, message: '请输入等待时间' }
  ]
}

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

// 表单验证状态
const isFormValid = computed(() => {
  const basicValid = formData.waitTime.value > 0
  
  if (formData.waitType === 'conditional') {
    const conditionsValid = formData.endConditions.length > 0 &&
      formData.endConditions.every(condition => 
        condition.type && condition.description.trim() !== ''
      )
    return basicValid && conditionsValid
  }
  
  return basicValid
})

// 监听visible变化
watch(() => props.visible, (newVal) => {
  drawerVisible.value = newVal
  if (newVal) {
    initFormData()
  }
})

watch(drawerVisible, (newVal) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})

// 初始化表单数据
const initFormData = () => {
  if (props.nodeData?.config) {
    Object.assign(formData, {
      waitTime: props.nodeData.config.waitTime || { value: 30, unit: 'minutes' },
      waitType: props.nodeData.config.waitType || 'fixed',
      endConditions: props.nodeData.config.endConditions || [
        { type: 'user_action', description: '用户点击邮件链接' }
      ],
      dynamicConfig: props.nodeData.config.dynamicConfig || {
        adjustByUserActivity: false,
        adjustByTimeOfDay: false,
        adjustByUserSegment: false
      },
      enableNotification: props.nodeData.config.enableNotification ?? false,
      enableProgressTracking: props.nodeData.config.enableProgressTracking ?? false,
      enableUserInteraction: props.nodeData.config.enableUserInteraction ?? false,
      timeoutAction: props.nodeData.config.timeoutAction || 'continue'
    })
  }
}

// 添加条件
const addCondition = () => {
  if (formData.endConditions.length >= 5) return
  
  formData.endConditions.push({
    type: 'user_action',
    description: ''
  })
}

// 删除条件
const removeCondition = (index) => {
  if (formData.endConditions.length <= 1) return
  formData.endConditions.splice(index, 1)
}

// 处理取消
const handleCancel = () => {
  drawerVisible.value = false
  emit('cancel')
}

// 处理提交
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return
    
    const config = {
      waitTime: formData.waitTime,
      waitType: formData.waitType,
      endConditions: formData.endConditions,
      dynamicConfig: formData.dynamicConfig,
      enableNotification: formData.enableNotification,
      enableProgressTracking: formData.enableProgressTracking,
      enableUserInteraction: formData.enableUserInteraction,
      timeoutAction: formData.timeoutAction,
      nodeType: 'wait'
    }
    
    emit('confirm', config)
    drawerVisible.value = false
  } catch (error) {
    console.error('等待节点配置验证失败:', error)
  }
}
</script>

<style scoped>
.config-form {
  padding: 0 4px;
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

.time-preview {
  padding: 12px;
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  color: var(--color-text-3);
}

.preview-value {
  font-weight: 500;
  color: var(--color-text-1);
}

.conditions-container {
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  padding: 16px;
  background-color: var(--color-bg-1);
}

.condition-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--color-border-3);
  border-radius: 4px;
  background-color: var(--color-bg-2);
}

.condition-item:last-child {
  margin-bottom: 0;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.condition-label {
  font-weight: 500;
  color: var(--color-text-1);
}

.condition-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>