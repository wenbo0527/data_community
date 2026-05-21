<template>
  <BaseDrawer
    :visible="visible"
    title="开始节点配置"
    width="480px"
    :form-data="formData"
    :form-rules="formRules"
    :form-ref="formRef"
    :is-form-valid="isFormValid"
    :submitting="submitting"
    @update:visible="(val: boolean) => emit('update:visible', val)"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @debug-submit="handleDebugSubmit"
  >
    <!-- 表单内容 -->
    <template #form="{ formData }: { formData: Record<string, any> }">
      <!-- 节点名称 -->
      <a-form-item label="节点名称" field="nodeName" required>
        <a-input
          v-model="formData.nodeName"
          placeholder="请输入节点名称"
          allow-clear
        />
      </a-form-item>

      <!-- 任务类型 -->
      <a-form-item label="任务类型" field="taskType">
        <a-select
          v-model="formData.taskType"
          placeholder="请选择任务类型"
          allow-clear
        >
          <a-option 
            v-for="option in TASK_TYPES" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </a-option>
        </a-select>
      </a-form-item>

      <!-- 进入日期 -->
      <a-form-item label="进入日期" field="entryDate">
        <a-date-picker
          v-model="formData.entryDate"
          placeholder="请选择进入日期"
          style="width: 100%"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-item>

      <!-- 进入频率 -->
      <a-form-item label="进入频率" field="frequency">
        <a-select
          v-model="formData.frequency"
          placeholder="请选择进入频率"
        >
          <a-option 
            v-for="option in FREQUENCY_OPTIONS" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </a-option>
        </a-select>
      </a-form-item>

      <!-- 去重天数 -->
      <a-form-item label="去重天数" field="deduplicationDays">
        <a-input-number
          v-model="formData.deduplicationDays"
          :min="VALIDATION_LIMITS.deduplicationDays.min"
          :max="VALIDATION_LIMITS.deduplicationDays.max"
          placeholder="请输入去重天数"
          style="width: 100%"
        />
      </a-form-item>

      <!-- 推送上限 -->
      <a-form-item label="推送上限" field="pushLimit">
        <a-input-number
          v-model="formData.pushLimit"
          :min="VALIDATION_LIMITS.pushLimit.min"
          :max="VALIDATION_LIMITS.pushLimit.max"
          placeholder="请输入推送上限"
          style="width: 100%"
        />
      </a-form-item>

      <!-- 优先级 -->
      <a-form-item label="优先级" field="priority">
        <a-select
          v-model="formData.priority"
          placeholder="请选择优先级"
        >
          <a-option 
            v-for="option in PRIORITY_OPTIONS" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </a-option>
        </a-select>
      </a-form-item>

      <!-- 目标人群 -->
      <a-form-item label="目标人群" field="targetAudience">
        <a-checkbox-group v-model="formData.targetAudience">
          <a-checkbox 
            v-for="option in TARGET_AUDIENCE_OPTIONS" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </a-checkbox>
        </a-checkbox-group>
      </a-form-item>

      <!-- 自定义人群配置 -->
      <a-form-item 
        v-if="showCustomAudienceConfig" 
        label="自定义人群筛选条件" 
        field="customAudienceConfig"
      >
        <a-textarea
          v-model="formData.customAudienceConfig"
          placeholder="请输入自定义人群筛选条件"
          :rows="4"
        />
      </a-form-item>
    </template>

    <!-- 调试信息 -->
    <template #debug="{ formData, isValid }: { formData: Record<string, any>; isValid: boolean }">
      <div class="debug-info">
        <div>表单验证状态: {{ isValid ? '✓' : '✗' }}</div>
        <div>任务类型: {{ formData.taskType ? '✓' : '✗' }}</div>
        <div>进入日期: {{ formData.entryDate ? '✓' : '✗' }}</div>
        <div>进入频率: {{ formData.frequency ? '✓' : '✗' }}</div>
        <div>目标人群: {{ formData.targetAudience?.length > 0 ? '✓' : '✗' }}</div>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer'
import { 
  TASK_TYPES, 
  FREQUENCY_OPTIONS, 
  PRIORITY_OPTIONS, 
  TARGET_AUDIENCE_OPTIONS,
  VALIDATION_LIMITS 
} from '@/constants/startNodeConfig'
import type { StartNodeConfig } from '@/types/startNodeConfig'

interface Props {
  visible: boolean
  nodeData?: Partial<StartNodeConfig> & {
    isNewNode?: boolean
    nodeId?: string
    nodeType?: string
    config?: any
  }
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  nodeData: () => ({})
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 表单验证规则
const formRules = {
  taskType: [
    { required: true, message: '请选择任务类型' }
  ],
  entryDate: [
    { required: true, message: '请选择进入日期' }
  ],
  frequency: [
    { required: true, message: '请选择进入频率' }
  ],
  deduplicationDays: [
    { required: true, message: '请输入去重天数' },
    { type: 'number', min: VALIDATION_LIMITS.deduplicationDays.min, max: VALIDATION_LIMITS.deduplicationDays.max, message: `去重天数必须在${VALIDATION_LIMITS.deduplicationDays.min}-${VALIDATION_LIMITS.deduplicationDays.max}之间` }
  ],
  pushLimit: [
    { required: true, message: '请输入推送上限' },
    { type: 'number', min: VALIDATION_LIMITS.pushLimit.min, max: VALIDATION_LIMITS.pushLimit.max, message: `推送上限必须在${VALIDATION_LIMITS.pushLimit.min}-${VALIDATION_LIMITS.pushLimit.max}之间` }
  ],
  priority: [
    { required: true, message: '请选择优先级' }
  ],
  targetAudience: [
    { required: true, message: '请选择目标人群' },
    { type: 'array', min: 1, message: '至少选择一个目标人群' }
  ]
}

// 初始表单数据
const initialFormData = {
  nodeName: props.nodeData?.nodeName || '开始节点',
  taskType: '',
  entryDate: '',
  frequency: '',
  deduplicationDays: 7,
  pushLimit: 1000,
  priority: '',
  targetAudience: [],
  customAudienceConfig: ''
}

// 自定义验证函数
const customValidation = (formData: any) => {
  // 检查 formData 是否存在
  if (!formData) {
    return false
  }
  
  // 检查必填字段
  if (!formData.taskType || !formData.entryDate || !formData.frequency || 
      !formData.priority || !formData.targetAudience?.length) {
    return false
  }
  
  // 检查数值范围
  if (formData.deduplicationDays < VALIDATION_LIMITS.deduplicationDays.min || 
      formData.deduplicationDays > VALIDATION_LIMITS.deduplicationDays.max) {
    return false
  }
  
  if (formData.pushLimit < VALIDATION_LIMITS.pushLimit.min || 
      formData.pushLimit > VALIDATION_LIMITS.pushLimit.max) {
    return false
  }
  
  return true
}

// 使用基础抽屉逻辑
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
  nodeType: 'start',
  customValidation,
  onSubmit: (data: any) => {
    console.log('[StartNodeConfigDrawer] 提交配置:', data)
    return {
      ...data,
      nodeType: 'start'
    } as StartNodeConfig
  },
  onCancel: () => {
    console.log('[StartNodeConfigDrawer] 处理取消操作')
  }
})

// 计算属性：是否显示自定义人群配置
const showCustomAudienceConfig = computed(() => {
  return formData.targetAudience?.includes('custom')
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

.debug-info > div:last-child {
  margin-bottom: 0;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
  color: var(--color-text-1);
}

:deep(.arco-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.arco-checkbox) {
  margin-right: 0;
}

:deep(.arco-input-number) {
  width: 100%;
}

:deep(.arco-textarea) {
  resize: vertical;
  min-height: 80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.arco-drawer) {
    width: 100% !important;
  }
}
</style>