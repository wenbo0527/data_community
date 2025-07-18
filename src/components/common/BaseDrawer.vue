/**
 * 通用抽屉组件
 * 提供标准化的抽屉UI结构和行为
 */
<template>
  <a-drawer
    :visible="visible"
    :title="title"
    :width="width"
    :placement="placement"
    :closable="closable"
    :mask-closable="maskClosable"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <!-- 抽屉内容插槽 -->
    <div class="base-drawer-content">
      <slot name="content" :form-data="formData" :form-ref="formRef">
        <!-- 默认表单容器 -->
        <a-form
          ref="formRef"
          :model="formData"
          layout="vertical"
          :rules="formRules"
        >
          <slot name="form" :form-data="formData"></slot>
        </a-form>
      </slot>
    </div>

    <!-- 抽屉底部操作区 -->
    <template #footer>
      <div class="base-drawer-footer">
        <!-- 调试信息插槽 -->
        <slot name="debug" :form-data="formData" :is-valid="isFormValid"></slot>
        
        <!-- 操作按钮 -->
        <div class="drawer-actions">
          <slot name="actions" :handle-cancel="handleCancel" :handle-submit="handleSubmit">
            <!-- 默认操作按钮 -->
            <a-button @click="handleCancel">{{ cancelText }}</a-button>
            <a-button
              type="primary"
              :loading="submitting"
              :disabled="!isFormValid && !allowEmptySubmit"
              @click="handleSubmit"
            >
              {{ confirmText }}
            </a-button>
            
            <!-- 调试按钮（开发环境） -->
            <a-button
              v-if="showDebugButton"
              type="outline"
              status="warning"
              @click="handleDebugSubmit"
              style="margin-left: 8px;"
            >
              强制提交(调试)
            </a-button>
          </slot>
        </div>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 基础抽屉属性
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '节点配置'
  },
  width: {
    type: String,
    default: '520px'
  },
  placement: {
    type: String,
    default: 'right'
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
  
  // 验证和提交
  isFormValid: {
    type: Boolean,
    default: true
  },
  submitting: {
    type: Boolean,
    default: false
  },
  allowEmptySubmit: {
    type: Boolean,
    default: true
  },
  
  // 按钮文本
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  
  // 调试选项
  showDebugButton: {
    type: Boolean,
    default: process.env.NODE_ENV === 'development'
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel', 'debug-submit'])

// 处理取消
const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

// 处理提交
const handleSubmit = () => {
  emit('confirm')
}

// 处理调试提交
const handleDebugSubmit = () => {
  emit('debug-submit')
}
</script>

<style scoped>
.base-drawer-content {
  padding: 0;
}

.base-drawer-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 表单样式 */
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
}

:deep(.form-item-tip) {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

/* 调试信息样式 */
:deep(.debug-info) {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

:deep(.debug-info div) {
  margin-bottom: 2px;
}

:deep(.debug-info div:last-child) {
  margin-bottom: 0;
}
</style>