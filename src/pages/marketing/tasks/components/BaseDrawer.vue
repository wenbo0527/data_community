<template>
  <a-drawer
    :visible="visible"
    :title="title"
    :width="width"
    placement="right"
    :closable="closable"
    :mask-closable="maskClosable"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <!-- 主要内容区域 -->
    <div class="base-drawer-content">
      <!-- 表单区域 -->
      <div class="form-container">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
        >
          <slot name="form" :form-data="formData" :form-ref="formRef" />
        </a-form>
      </div>
      
      <!-- 自定义内容区域 -->
      <div v-if="$slots.content" class="content-container">
        <slot name="content" />
      </div>
      
      <!-- 调试信息区域 -->
      <div v-if="showDebug && $slots.debug" class="debug-container">
        <a-divider>调试信息</a-divider>
        <slot name="debug" :form-data="formData" :is-valid="isFormValid" />
      </div>
    </div>

    <!-- 底部操作区域 -->
    <template #footer>
      <div class="drawer-footer">
        <!-- 自定义操作按钮 -->
        <div v-if="$slots.actions" class="custom-actions">
          <slot name="actions" />
        </div>
        
        <!-- 调试按钮 -->
        <a-button
          v-if="showDebug"
          type="outline"
          @click="handleDebugSubmit"
        >
          调试
        </a-button>
        
        <!-- 默认操作按钮 -->
        <a-button @click="handleCancel">
          {{ cancelText }}
        </a-button>
        <a-button
          type="primary"
          :loading="submitting"
          :disabled="!isFormValid"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { computed } from 'vue'

// Props 定义
const props = defineProps({
  // 基础属性
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '配置'
  },
  width: {
    type: String,
    default: '520px'
  },
  closable: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  
  // 表单相关
  formData: {
    type: Object,
    required: true
  },
  formRules: {
    type: Object,
    default: () => ({})
  },
  formRef: {
    type: Object,
    default: null
  },
  isFormValid: {
    type: Boolean,
    default: true
  },
  
  // 按钮相关
  submitting: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  
  // 调试相关
  showDebug: {
    type: Boolean,
    default: false
  }
})

// Emits 定义
const emit = defineEmits([
  'update:visible',
  'confirm',
  'cancel',
  'debug-submit'
])

// 处理取消
const handleCancel = () => {
  emit('cancel')
}

// 处理确认
const handleConfirm = () => {
  emit('confirm')
}

// 处理调试提交
const handleDebugSubmit = () => {
  emit('debug-submit')
}
</script>

<style scoped>
.base-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  padding: 0 4px;
}

.content-container {
  margin-top: 16px;
}

.debug-container {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.custom-actions {
  margin-right: auto;
}
</style>