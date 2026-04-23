<template>
  <a-drawer
    :visible="visible"
    :title="title"
    :width="width"
    placement="right"
    :closable="closable"
    :mask-closable="maskClosable"
    :class="[{ 'base-drawer--readonly': readOnly }]"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <div class="base-drawer-content">
      <div class="form-container" :style="readOnly ? { pointerEvents: 'none', opacity: 0.85 } : {}">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
        >
          <slot name="form" :form-data="formData" :form-ref="formRef" />
        </a-form>
      </div>
      <div v-if="$slots.content" class="content-container">
        <slot name="content" />
      </div>
      <div v-if="showDebug && !readOnly && $slots.debug" class="debug-container">
        <a-divider>调试信息</a-divider>
        <slot name="debug" :form-data="formData" :is-valid="isFormValid" />
      </div>
    </div>
    <template #footer>
      <div class="drawer-footer">
        <div v-if="$slots.actions" class="custom-actions">
          <slot name="actions" />
        </div>
        <a-button v-if="showDebug && !readOnly" type="outline" @click="handleDebugSubmit">调试</a-button>
        <a-button @click="handleCancel">{{ cancelText }}</a-button>
        <a-button v-if="!readOnly" type="primary" :loading="submitting" :disabled="!isFormValid" @click="handleConfirm">{{ confirmText }}</a-button>
      </div>
    </template>
  </a-drawer>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '配置' },
  width: { type: String, default: '520px' },
  closable: { type: Boolean, default: true },
  maskClosable: { type: Boolean, default: true },
  formData: { type: Object, required: true },
  formRules: { type: Object, default: () => ({}) },
  formRef: { type: Object, default: null },
  isFormValid: { type: Boolean, default: true },
  submitting: { type: Boolean, default: false },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  showDebug: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible','confirm','cancel','debug-submit'])
const handleCancel = () => { emit('cancel'); emit('update:visible', false) }
const handleConfirm = () => { emit('confirm') }
const handleDebugSubmit = () => { emit('debug-submit') }
</script>
<style scoped>
.base-drawer-content { height: 100%; display: flex; flex-direction: column }
.form-container { flex: 1; padding: 0 4px }
.content-container { margin-top: 16px }
.debug-container { margin-top: 16px; padding: 12px; background-color: var(--color-bg-2); border: 1px solid var(--color-border-2); border-radius: 4px }
.drawer-footer { display: flex; justify-content: flex-end; align-items: center; gap: 12px }
.custom-actions { margin-right: auto }
.base-drawer--readonly :deep(.arco-input),
.base-drawer--readonly :deep(textarea),
.base-drawer--readonly :deep(select),
.base-drawer--readonly :deep(.arco-input-number),
.base-drawer--readonly :deep(.arco-select),
.base-drawer--readonly :deep(.arco-textarea) { pointer-events: none }
</style>
