<template>
zuo b  <a-drawer
    v-model:visible="drawerVisible"
    title="开始节点配置"
    width="480"
    :footer="false"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
      @submit="handleSubmit"
    >
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

     </a-form>

    <template #footer>
      <div class="drawer-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSubmit">确定</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useStartNodeForm } from '@/composables/useStartNodeForm'
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
  nodeData?: Partial<StartNodeConfig>
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm', config: StartNodeConfig): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  nodeData: () => ({})
})

const emit = defineEmits<Emits>()

// 使用表单 composable
const {
  formRef,
  formData,
  rules,
  showCustomAudienceConfig,
  loadFormData,
  resetForm,
  submitForm
} = useStartNodeForm()

// 抽屉显示状态
const drawerVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 监听节点数据变化
watch(() => props.nodeData, (newData) => {
  if (newData && props.visible) {
    loadFormData(newData)
  }
}, { immediate: true, deep: true })

// 监听抽屉显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.nodeData) {
    loadFormData(props.nodeData)
  } else if (!visible) {
    resetForm()
  }
})

// 处理确认
const handleSubmit = async () => {
  try {
    const config = await submitForm()
    if (config) {
      emit('confirm', config)
      drawerVisible.value = false
    }
  } catch (error) {
    console.error('提交失败:', error)
    Message.error('配置保存失败，请检查表单数据')
  }
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  drawerVisible.value = false
}
</script>

<style scoped>
.form-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-2);
  display: flex;
  justify-content: flex-end;
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