<template>
  <a-drawer
    v-model:visible="drawerVisible"
    title="短信节点配置"
    width="520px"
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
        <!-- 短信模板 -->
        <a-form-item label="短信模板" field="smsTemplate">
          <a-select
            v-model="formData.smsTemplate"
            placeholder="请选择短信模板"
            allow-clear
          >
            <a-option
              v-for="template in smsTemplateOptions"
              :key="template.value"
              :value="template.value"
            >
              {{ template.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <!-- 短信内容预览 -->
        <a-form-item
          v-if="formData.smsTemplate"
          label="短信内容预览"
        >
          <div class="sms-preview">
            {{ getSmsPreviewContent() }}
          </div>
        </a-form-item>

        <!-- 发送结果判断开关 -->
        <a-form-item label="发送结果判断" field="enableResultCheck">
          <a-switch
            v-model="formData.enableResultCheck"
            checked-text="开启"
            unchecked-text="关闭"
          />
          <div class="form-item-tip">
            开启后将根据短信发送结果进行分流
          </div>
        </a-form-item>

        <!-- 最长等待时间配置 -->
        <a-form-item
          v-if="formData.enableResultCheck"
          label="最长等待时间"
          field="maxWaitTime"
        >
          <div class="time-input-group">
            <a-input-number
              v-model="formData.maxWaitTime.value"
              :min="1"
              :max="getMaxTimeValue()"
              placeholder="请输入时间"
              style="flex: 1"
            />
            <a-select
              v-model="formData.maxWaitTime.unit"
              style="width: 100px; margin-left: 8px"
              @change="handleTimeUnitChange"
            >
              <a-option value="minutes">分钟</a-option>
              <a-option value="hours">小时</a-option>
              <a-option value="days">天</a-option>
            </a-select>
          </div>
          <div class="form-item-tip">
            超过等待时间将自动进入失败分支
          </div>
        </a-form-item>

        <!-- 结果分支配置 -->
        <a-form-item
          v-if="formData.enableResultCheck"
          label="结果分支配置"
          field="resultBranches"
        >
          <div class="branches-container">
            <div
              v-for="(branch, index) in formData.resultBranches"
              :key="index"
              class="branch-item"
              :class="{ 'success-branch': branch.type === 'success', 'failure-branch': branch.type === 'failure' }"
            >
              <div class="branch-header">
                <span class="branch-label">
                  <icon-check-circle v-if="branch.type === 'success'" class="success-icon" />
                  <icon-close-circle v-else class="failure-icon" />
                  {{ branch.type === 'success' ? '发送成功' : '发送失败' }}
                </span>
              </div>
              
              <div class="branch-content">
                <a-form-item
                  :field="`resultBranches.${index}.name`"
                  label="分支名称"
                  :rules="[{ required: true, message: '请输入分支名称' }]"
                >
                  <a-input
                    v-model="branch.name"
                    placeholder="请输入分支名称"
                  />
                </a-form-item>
                
                <a-form-item
                  :field="`resultBranches.${index}.description`"
                  label="分支描述"
                >
                  <a-textarea
                    v-model="branch.description"
                    placeholder="请输入分支描述（可选）"
                    :rows="2"
                  />
                </a-form-item>
              </div>
            </div>
          </div>
        </a-form-item>

        <!-- 短信发送设置 -->
        <a-form-item label="发送设置">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model="formData.enableRetry">
              启用重试机制
            </a-checkbox>
            <a-checkbox v-model="formData.enableDeliveryReport">
              启用送达报告
            </a-checkbox>
            <a-checkbox v-model="formData.enableClickTracking">
              启用点击追踪（适用于包含链接的短信）
            </a-checkbox>
          </a-space>
        </a-form-item>

        <!-- 重试配置 -->
        <a-form-item
          v-if="formData.enableRetry"
          label="重试配置"
        >
          <div class="retry-config">
            <a-form-item label="最大重试次数" field="retryConfig.maxRetries">
              <a-input-number
                v-model="formData.retryConfig.maxRetries"
                :min="1"
                :max="3"
                style="width: 100%"
              />
            </a-form-item>
            <a-form-item label="重试间隔(分钟)" field="retryConfig.retryInterval">
              <a-input-number
                v-model="formData.retryConfig.retryInterval"
                :min="1"
                :max="60"
                style="width: 100%"
              />
            </a-form-item>
          </div>
        </a-form-item>

        <!-- 发送时间设置 -->
        <a-form-item label="发送时间设置">
          <a-radio-group v-model="formData.sendTimeType">
            <a-radio value="immediate">立即发送</a-radio>
            <a-radio value="scheduled">定时发送</a-radio>
            <a-radio value="optimal">智能最佳时间</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 定时发送配置 -->
        <a-form-item
          v-if="formData.sendTimeType === 'scheduled'"
          label="发送时间"
          field="scheduledTime"
        >
          <a-date-picker
            v-model="formData.scheduledTime"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择发送时间"
            style="width: 100%"
          />
        </a-form-item>

        <!-- 智能发送配置 -->
        <a-form-item
          v-if="formData.sendTimeType === 'optimal'"
          label="智能发送设置"
        >
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model="formData.optimalConfig.avoidRestTime">
              避开休息时间 (22:00-08:00)
            </a-checkbox>
            <a-checkbox v-model="formData.optimalConfig.considerUserActivity">
              考虑用户活跃时间
            </a-checkbox>
            <a-checkbox v-model="formData.optimalConfig.avoidWeekends">
              避开周末发送
            </a-checkbox>
          </a-space>
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
import { IconCheckCircle, IconCloseCircle } from '@arco-design/web-vue/es/icon'

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

// 短信模板选项
const smsTemplateOptions = [
  { value: 'template_1', label: '营销推广模板' },
  { value: 'template_2', label: '活动通知模板' },
  { value: 'template_3', label: '产品介绍模板' },
  { value: 'template_4', label: '优惠券模板' },
  { value: 'template_5', label: '会员邀请模板' }
]

// 表单数据
const formData = reactive({
  smsTemplate: '',
  enableResultCheck: false,
  maxWaitTime: {
    value: 30,
    unit: 'minutes'
  },
  resultBranches: [
    {
      type: 'success',
      name: '发送成功',
      description: '短信发送成功的用户'
    },
    {
      type: 'failure',
      name: '发送失败',
      description: '短信发送失败或超时的用户'
    }
  ],
  enableRetry: false,
  enableDeliveryReport: true,
  enableClickTracking: false,
  retryConfig: {
    maxRetries: 2,
    retryInterval: 5
  },
  sendTimeType: 'immediate',
  scheduledTime: null,
  optimalConfig: {
    avoidRestTime: true,
    considerUserActivity: false,
    avoidWeekends: false
  }
})

// 表单验证规则
const formRules = {
  smsTemplate: [
    { required: true, message: '请选择短信模板' }
  ],
  maxWaitTime: [
    { required: true, message: '请输入最长等待时间' }
  ],
  scheduledTime: [
    { required: true, message: '请选择发送时间' }
  ]
}

// 获取短信内容预览
const getSmsPreviewContent = () => {
  const templates = {
    template_1: '【品牌名】尊敬的客户，我们为您准备了专属优惠，点击链接查看详情：http://xxx.com 退订回T',
    template_2: '【品牌名】活动通知：限时特惠活动即将开始，不要错过！详情咨询：400-xxx-xxxx 退订回T',
    template_3: '【品牌名】新品上市！为您推荐最新产品，立即了解：http://xxx.com 退订回T',
    template_4: '【品牌名】专属优惠券已发放，有效期3天，立即使用：http://xxx.com 退订回T',
    template_5: '【品牌名】邀请您成为VIP会员，享受专属权益，立即加入：http://xxx.com 退订回T'
  }
  return templates[formData.smsTemplate] || ''
}

// 获取时间最大值
const getMaxTimeValue = () => {
  switch (formData.maxWaitTime.unit) {
    case 'minutes':
      return 1440 // 24小时
    case 'hours':
      return 72 // 3天
    case 'days':
      return 30 // 30天
    default:
      return 1440
  }
}

// 处理时间单位变化
const handleTimeUnitChange = () => {
  const maxValue = getMaxTimeValue()
  if (formData.maxWaitTime.value > maxValue) {
    formData.maxWaitTime.value = maxValue
  }
}

// 表单验证状态
const isFormValid = computed(() => {
  const basicValid = formData.smsTemplate !== ''
  
  if (!formData.enableResultCheck) {
    return basicValid
  }
  
  const resultValid = formData.resultBranches.every(branch => 
    branch.name.trim() !== ''
  )
  
  const timeValid = formData.sendTimeType !== 'scheduled' || formData.scheduledTime !== null
  
  return basicValid && resultValid && timeValid
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
      smsTemplate: props.nodeData.config.smsTemplate || '',
      enableResultCheck: props.nodeData.config.enableResultCheck ?? false,
      maxWaitTime: props.nodeData.config.maxWaitTime || { value: 30, unit: 'minutes' },
      resultBranches: props.nodeData.config.resultBranches || [
        { type: 'success', name: '发送成功', description: '短信发送成功的用户' },
        { type: 'failure', name: '发送失败', description: '短信发送失败或超时的用户' }
      ],
      enableRetry: props.nodeData.config.enableRetry ?? false,
      enableDeliveryReport: props.nodeData.config.enableDeliveryReport ?? true,
      enableClickTracking: props.nodeData.config.enableClickTracking ?? false,
      retryConfig: props.nodeData.config.retryConfig || { maxRetries: 2, retryInterval: 5 },
      sendTimeType: props.nodeData.config.sendTimeType || 'immediate',
      scheduledTime: props.nodeData.config.scheduledTime || null,
      optimalConfig: props.nodeData.config.optimalConfig || {
        avoidRestTime: true,
        considerUserActivity: false,
        avoidWeekends: false
      }
    })
  }
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
      smsTemplate: formData.smsTemplate,
      enableResultCheck: formData.enableResultCheck,
      maxWaitTime: formData.maxWaitTime,
      resultBranches: formData.resultBranches.map((branch, index) => ({
        id: `${branch.type}_branch`,
        type: branch.type,
        name: branch.name,
        description: branch.description,
        label: branch.name
      })),
      enableRetry: formData.enableRetry,
      enableDeliveryReport: formData.enableDeliveryReport,
      enableClickTracking: formData.enableClickTracking,
      retryConfig: formData.retryConfig,
      sendTimeType: formData.sendTimeType,
      scheduledTime: formData.scheduledTime,
      optimalConfig: formData.optimalConfig,
      nodeType: 'sms'
    }
    
    emit('confirm', config)
    drawerVisible.value = false
  } catch (error) {
    console.error('短信配置验证失败:', error)
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

.sms-preview {
  padding: 12px;
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-2);
}

.time-input-group {
  display: flex;
  align-items: center;
}

.branches-container {
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  padding: 16px;
  background-color: var(--color-bg-1);
}

.branch-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--color-border-3);
  border-radius: 4px;
  background-color: var(--color-bg-2);
}

.branch-item:last-child {
  margin-bottom: 0;
}

.success-branch {
  border-color: var(--color-success-3);
  background-color: var(--color-success-1);
}

.failure-branch {
  border-color: var(--color-danger-3);
  background-color: var(--color-danger-1);
}

.branch-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.branch-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--color-text-1);
}

.success-icon {
  color: var(--color-success-6);
  margin-right: 8px;
}

.failure-icon {
  color: var(--color-danger-6);
  margin-right: 8px;
}

.branch-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.retry-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>