<template>
  <a-drawer
    v-model:visible="drawerVisible"
    title="AI外呼节点配置"
    width="560px"
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
        <!-- 触达任务ID -->
        <a-form-item label="触达任务ID" field="taskId">
          <a-input
            v-model="formData.taskId"
            placeholder="请输入触达任务ID"
            allow-clear
          />
        </a-form-item>

        <!-- AI外呼意愿分流开关 -->
        <a-form-item label="AI外呼意愿分流" field="enableIntentionFlow">
          <a-switch
            v-model="formData.enableIntentionFlow"
            checked-text="开启"
            unchecked-text="关闭"
          />
          <div class="form-item-tip">
            开启后将根据AI识别的用户意愿进行分流
          </div>
        </a-form-item>

        <!-- 最长等待时间配置 -->
        <a-form-item
          v-if="formData.enableIntentionFlow"
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
            超过等待时间将自动进入默认分支
          </div>
        </a-form-item>

        <!-- 意愿分流配置 -->
        <a-form-item
          v-if="formData.enableIntentionFlow"
          label="意愿分流配置"
          field="intentionBranches"
        >
          <div class="branches-container">
            <div
              v-for="(branch, index) in formData.intentionBranches"
              :key="index"
              class="branch-item"
            >
              <div class="branch-header">
                <span class="branch-label">意愿分支 {{ index + 1 }}</span>
                <a-button
                  v-if="formData.intentionBranches.length > 1"
                  type="text"
                  status="danger"
                  size="small"
                  @click="removeIntentionBranch(index)"
                >
                  <template #icon>
                    <icon-delete />
                  </template>
                </a-button>
              </div>
              
              <div class="branch-content">
                <a-form-item
                  :field="`intentionBranches.${index}.name`"
                  label="分支名称"
                  :rules="[{ required: true, message: '请输入分支名称' }]"
                >
                  <a-input
                    v-model="branch.name"
                    placeholder="请输入分支名称"
                  />
                </a-form-item>
                
                <a-form-item
                  :field="`intentionBranches.${index}.intentionCodes`"
                  label="意愿码值"
                  :rules="[{ required: true, message: '请选择意愿码值' }]"
                >
                  <a-select
                    v-model="branch.intentionCodes"
                    multiple
                    placeholder="请选择意愿码值"
                    allow-clear
                  >
                    <a-option
                      v-for="code in intentionCodeOptions"
                      :key="code.value"
                      :value="code.value"
                      :disabled="isCodeUsedInOtherBranches(code.value, index)"
                    >
                      {{ code.label }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </div>
            </div>
            
            <!-- 添加意愿分支按钮 -->
            <a-button
              v-if="formData.intentionBranches.length < 10"
              type="dashed"
              block
              @click="addIntentionBranch"
            >
              <template #icon>
                <icon-plus />
              </template>
              添加意愿分支
            </a-button>
          </div>
        </a-form-item>

        <!-- 默认分支配置 -->
        <a-form-item
          v-if="formData.enableIntentionFlow"
          label="默认分支"
          field="defaultBranch"
        >
          <a-input
            v-model="formData.defaultBranch.name"
            placeholder="请输入默认分支名称"
          />
          <div class="form-item-tip">
            未匹配到意愿码值或超时的用户将进入此分支
          </div>
        </a-form-item>

        <!-- 外呼设置 -->
        <a-form-item label="外呼设置">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model="formData.enableRetry">
              启用重试机制
            </a-checkbox>
            <a-checkbox v-model="formData.enableRecording">
              启用通话录音
            </a-checkbox>
            <a-checkbox v-model="formData.enableRealTimeAnalysis">
              启用实时意愿分析
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
                :max="5"
                style="width: 100%"
              />
            </a-form-item>
            <a-form-item label="重试间隔(分钟)" field="retryConfig.retryInterval">
              <a-input-number
                v-model="formData.retryConfig.retryInterval"
                :min="1"
                :max="1440"
                style="width: 100%"
              />
            </a-form-item>
          </div>
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

// 意愿码值选项
const intentionCodeOptions = [
  { value: 'A', label: 'A - 强烈意愿' },
  { value: 'B', label: 'B - 有意愿' },
  { value: 'C', label: 'C - 一般意愿' },
  { value: 'D', label: 'D - 无意愿' },
  { value: 'E', label: 'E - 明确拒绝' },
  { value: 'F', label: 'F - 无法接通' },
  { value: 'G', label: 'G - 空号/停机' },
  { value: 'H', label: 'H - 其他情况' }
]

// 表单数据
const formData = reactive({
  taskId: '',
  enableIntentionFlow: false,
  maxWaitTime: {
    value: 30,
    unit: 'minutes'
  },
  intentionBranches: [
    {
      name: '高意愿客户',
      intentionCodes: ['A', 'B']
    }
  ],
  defaultBranch: {
    name: '默认分支'
  },
  enableRetry: false,
  enableRecording: true,
  enableRealTimeAnalysis: true,
  retryConfig: {
    maxRetries: 3,
    retryInterval: 30
  }
})

// 表单验证规则
const formRules = {
  taskId: [
    { required: true, message: '请输入触达任务ID' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: '任务ID只能包含字母、数字、下划线和横线' }
  ],
  maxWaitTime: [
    { required: true, message: '请输入最长等待时间' }
  ]
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

// 检查意愿码值是否在其他分支中使用
const isCodeUsedInOtherBranches = (code, currentIndex) => {
  return formData.intentionBranches.some((branch, index) => 
    index !== currentIndex && branch.intentionCodes.includes(code)
  )
}

// 表单验证状态
const isFormValid = computed(() => {
  const basicValid = formData.taskId.trim() !== ''
  
  if (!formData.enableIntentionFlow) {
    return basicValid
  }
  
  const intentionValid = formData.intentionBranches.length > 0 &&
    formData.intentionBranches.every(branch => 
      branch.name.trim() !== '' && branch.intentionCodes.length > 0
    ) &&
    formData.defaultBranch.name.trim() !== ''
  
  return basicValid && intentionValid
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
      taskId: props.nodeData.config.taskId || '',
      enableIntentionFlow: props.nodeData.config.enableIntentionFlow ?? false,
      maxWaitTime: props.nodeData.config.maxWaitTime || { value: 30, unit: 'minutes' },
      intentionBranches: props.nodeData.config.intentionBranches || [
        { name: '高意愿客户', intentionCodes: ['A', 'B'] }
      ],
      defaultBranch: props.nodeData.config.defaultBranch || { name: '默认分支' },
      enableRetry: props.nodeData.config.enableRetry ?? false,
      enableRecording: props.nodeData.config.enableRecording ?? true,
      enableRealTimeAnalysis: props.nodeData.config.enableRealTimeAnalysis ?? true,
      retryConfig: props.nodeData.config.retryConfig || { maxRetries: 3, retryInterval: 30 }
    })
  }
}

// 添加意愿分支
const addIntentionBranch = () => {
  if (formData.intentionBranches.length >= 10) return
  
  formData.intentionBranches.push({
    name: `意愿分支${formData.intentionBranches.length + 1}`,
    intentionCodes: []
  })
}

// 删除意愿分支
const removeIntentionBranch = (index) => {
  if (formData.intentionBranches.length <= 1) return
  formData.intentionBranches.splice(index, 1)
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
      taskId: formData.taskId,
      enableIntentionFlow: formData.enableIntentionFlow,
      maxWaitTime: formData.maxWaitTime,
      intentionBranches: formData.intentionBranches.map((branch, index) => ({
        id: `intention_branch_${index + 1}`,
        name: branch.name,
        intentionCodes: branch.intentionCodes,
        label: branch.name
      })),
      defaultBranch: {
        id: 'default_branch',
        name: formData.defaultBranch.name,
        label: formData.defaultBranch.name
      },
      enableRetry: formData.enableRetry,
      enableRecording: formData.enableRecording,
      enableRealTimeAnalysis: formData.enableRealTimeAnalysis,
      retryConfig: formData.retryConfig,
      nodeType: 'ai-call'
    }
    
    emit('confirm', config)
    drawerVisible.value = false
  } catch (error) {
    console.error('AI外呼配置验证失败:', error)
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

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.branch-label {
  font-weight: 500;
  color: var(--color-text-1);
}

.branch-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
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