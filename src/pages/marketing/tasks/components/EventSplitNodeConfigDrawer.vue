<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    title="事件分流节点配置"
    width="480px"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <!-- 调试信息 -->
      <div class="debug-info">
        <div>表单验证状态: {{ isValid ? '✓' : '✗' }}</div>
        <div>事件类型: {{ formData.eventType || '未选择' }}</div>
        <div>自定义事件: {{ formData.eventType === 'custom' ? (formData.customEventName || '未填写') : '不适用' }}</div>
        <div>超时设置: {{ formData.timeout }}分钟</div>
      </div>

      <!-- 节点名称 -->
      <a-form-item label="节点名称" field="nodeName">
        <a-input 
          v-model="formData.nodeName" 
          placeholder="请输入节点名称"
          allow-clear
        />
      </a-form-item>

      <!-- 事件类型 -->
      <a-form-item label="事件类型" field="eventType" required>
        <a-select 
          v-model="formData.eventType" 
          placeholder="请选择事件类型"
          allow-clear
        >
          <a-option value="click">点击事件</a-option>
          <a-option value="view">浏览事件</a-option>
          <a-option value="purchase">购买事件</a-option>
          <a-option value="register">注册事件</a-option>
          <a-option value="login">登录事件</a-option>
          <a-option value="custom">自定义事件</a-option>
        </a-select>
      </a-form-item>

      <!-- 自定义事件名称 -->
      <a-form-item 
        v-if="formData.eventType === 'custom'"
        label="自定义事件名称" 
        field="customEventName"
        required
      >
        <a-input 
          v-model="formData.customEventName" 
          placeholder="请输入自定义事件名称"
          allow-clear
        />
      </a-form-item>

      <!-- 事件条件 -->
      <a-form-item label="事件条件" field="eventCondition">
        <a-textarea 
          v-model="formData.eventCondition" 
          placeholder="请输入事件触发条件（可选）"
          :rows="3"
          allow-clear
        />
      </a-form-item>

      <!-- 分支标签配置 -->
      <a-form-item label="分支标签配置">
        <div class="branch-labels">
          <a-form-item label="满足条件分支" field="yesLabel">
            <a-input 
              v-model="formData.yesLabel" 
              placeholder="默认：是"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="不满足条件分支" field="noLabel">
            <a-input 
              v-model="formData.noLabel" 
              placeholder="默认：否"
              allow-clear
            />
          </a-form-item>
        </div>
      </a-form-item>

      <!-- 超时设置 -->
      <a-form-item label="超时设置" field="timeout">
        <a-input-number 
          v-model="formData.timeout" 
          placeholder="事件等待超时时间（分钟）"
          :min="1"
          :max="1440"
          style="width: 100%"
        />
        <div class="form-item-tip">设置等待事件的最长时间，超时后走"否"分支</div>
      </a-form-item>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { computed } from 'vue'
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
  eventType: [
    { required: true, message: '请选择事件类型' }
  ],
  customEventName: [
    { 
      required: true, 
      message: '请输入自定义事件名称',
      trigger: 'blur'
    }
  ]
}

// 初始表单数据
const getInitialFormData = () => ({
  nodeName: '',
  eventType: '',
  customEventName: '',
  eventCondition: '',
  yesLabel: '',
  noLabel: '',
  timeout: 60
})

// 自定义验证函数
const customValidation = (formData) => {
  const errors = []
  
  // 检查 formData 是否存在
  if (!formData) {
    return errors
  }
  
  // 验证事件类型
  if (!formData.eventType) {
    errors.push('请选择事件类型')
  }
  
  // 验证自定义事件名称
  if (formData.eventType === 'custom' && !formData.customEventName) {
    errors.push('请输入自定义事件名称')
  }
  
  return errors
}

// 使用 BaseDrawer 组合式函数
const {
  formData,
  formRef,
  isValid,
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
  nodeType: 'event-split'
})

// 重写 handleSubmit 方法
const handleSubmit = async () => {
  console.log('[EventSplitNodeConfigDrawer] 开始提交配置')
  
  const config = {
    nodeName: formData.nodeName || '事件分流',
    eventType: formData.eventType,
    customEventName: formData.customEventName,
    eventCondition: formData.eventCondition,
    yesLabel: formData.yesLabel || '是',
    noLabel: formData.noLabel || '否',
    timeout: formData.timeout,
    nodeType: 'event-split'
  }
  
  await baseHandleSubmit(config)
}
</script>

<style scoped>
.branch-labels {
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  padding: 16px;
  background-color: var(--color-fill-1);
}

.branch-labels .arco-form-item {
  margin-bottom: 12px;
}

.branch-labels .arco-form-item:last-child {
  margin-bottom: 0;
}

.form-item-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
  line-height: 1.4;
}

.debug-info {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.debug-info div {
  margin-bottom: 4px;
}

.debug-info div:last-child {
  margin-bottom: 0;
}

.arco-form-item-label {
  font-weight: 500;
  color: var(--color-text-1);
}

.arco-input,
.arco-select,
.arco-textarea,
.arco-input-number {
  border-radius: 6px;
}

.arco-input:focus,
.arco-select:focus,
.arco-textarea:focus,
.arco-input-number:focus {
  border-color: var(--color-primary-6);
  box-shadow: 0 0 0 2px var(--color-primary-1);
}
</style>