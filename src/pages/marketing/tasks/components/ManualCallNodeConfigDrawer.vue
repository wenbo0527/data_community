<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="人工外呼节点配置"
    width="480px"
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

      <!-- 配置ID -->
      <a-form-item label="配置ID" field="configId">
        <a-input 
          v-model="formData.configId" 
          placeholder="请输入人工外呼配置ID" 
          allow-clear
        />
      </a-form-item>
      
      <!-- 外呼配置描述 -->
      <a-form-item label="配置描述" field="description">
        <a-textarea 
          v-model="formData.description" 
          placeholder="请输入配置描述（可选）" 
          :max-length="200"
          show-word-limit
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>
    </template>

    <template #debug>
      <div class="debug-info">
        <div><strong>配置ID:</strong> {{ formData.configId || '未设置' }}</div>
        <div><strong>配置描述:</strong> {{ formData.description || '未设置' }}</div>
        <div><strong>表单验证状态:</strong> {{ isFormValid ? '有效' : '无效' }}</div>
        <div><strong>是否新节点:</strong> {{ nodeData?.isNewNode ? '是' : '否' }}</div>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
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
  configId: [
    { required: true, message: '请输入配置ID' },
    { 
      pattern: /^[A-Za-z0-9_-]+$/, 
      message: '配置ID只能包含字母、数字、下划线和横线' 
    },
    {
      min: 3,
      max: 50,
      message: '配置ID长度应在3-50个字符之间'
    }
  ]
}

// 初始表单数据
const getInitialFormData = () => ({
  nodeName: props.nodeData?.nodeName || '人工外呼',
  configId: '',
  description: ''
})

// 自定义验证函数
const customValidation = (formData) => {
  const errors = []
  
  // 验证配置ID
  if (!formData.configId || formData.configId.trim() === '') {
    errors.push('请输入配置ID')
  } else if (!/^[A-Za-z0-9_-]+$/.test(formData.configId)) {
    errors.push('配置ID只能包含字母、数字、下划线和横线')
  } else if (formData.configId.length < 3 || formData.configId.length > 50) {
    errors.push('配置ID长度应在3-50个字符之间')
  }
  
  return errors
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
  nodeType: 'manual-call'
})

// 处理提交
const handleSubmit = async () => {
  const config = {
    configId: formData.configId,
    description: formData.description,
    nodeType: 'manual-call'
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
</style>