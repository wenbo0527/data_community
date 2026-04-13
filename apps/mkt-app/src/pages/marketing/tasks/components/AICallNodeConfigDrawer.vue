<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="AI外呼节点配置"
    width="560px"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <!-- 节点名称 -->
      <a-form-item label="节点名称" field="nodeName" required>
        <a-input
          v-model="formData.nodeName"
          placeholder="请输入节点名称"
          allow-clear
        />
      </a-form-item>

      <!-- 触达任务ID -->
      <a-form-item label="触达任务ID" field="taskId">
        <a-input
          v-model="formData.taskId"
          placeholder="请输入触达任务ID"
          allow-clear
        />
        <div class="form-item-tip">
          配置AI外呼的触达任务标识
        </div>
      </a-form-item>
    </template>

    <template #debug>
      <div class="debug-info">
        <div><strong>触达任务ID:</strong> {{ formData.taskId || '未设置' }}</div>
        <div><strong>表单验证状态:</strong> {{ isFormValid ? '有效' : '无效' }}</div>
        <div><strong>是否新节点:</strong> {{ nodeData?.isNewNode ? '是' : '否' }}</div>
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
  taskId: [
    { required: true, message: '请输入触达任务ID' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: '任务ID只能包含字母、数字、下划线和横线' }
  ]
}

// 初始表单数据
const getInitialFormData = () => ({
  nodeName: props.nodeData?.nodeName || 'AI外呼',
  taskId: ''
})

// 自定义验证函数
const customValidation = () => {
  // 如果是新节点且表单为空，允许保存空配置
  if (props.nodeData?.isNewNode && formData.taskId.trim() === '') {
    return true
  }
  // 否则要求必须输入任务ID
  return formData.taskId.trim() !== ''
}

// 使用基础抽屉组合式函数
const {
  formData,
  visible,
  isSubmitting,
  handleSubmit: baseHandleSubmit,
  handleCancel
} = useBaseDrawer({
  props,
  emit,
  formRules,
  getInitialFormData,
  customValidation,
  nodeType: 'ai-call'
})

// 表单验证状态
const isFormValid = computed(() => {
  // 如果是新节点且表单为空，允许保存空配置
  if (props.nodeData?.isNewNode && formData.taskId.trim() === '') {
    return true
  }
  // 否则要求必须输入任务ID
  return formData.taskId.trim() !== ''
})

// 处理提交
const handleSubmit = async () => {
  const config = {
    taskId: formData.taskId,
    nodeType: 'ai-call'
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
</style>