<template>
  <a-card class="action-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <IconSend />
        发布操作
      </div>
    </template>

    <div class="action-buttons">
      <a-space direction="vertical" :size="12" style="width: 100%">
        <div class="button-row">
          <a-button 
            type="primary" 
            size="large"
            :loading="isSubmitting"
            :disabled="isSaving"
            @click="handleSubmit"
            long
          >
            <template #icon>
              <IconSend />
            </template>
            {{ submitButtonText }}
          </a-button>
        </div>
        <div class="button-row secondary">
          <a-button 
            :loading="isSaving"
            :disabled="isSubmitting"
            @click="handleSaveDraft"
          >
            保存草稿
          </a-button>
          <a-button 
            @click="handleCancel"
          >
            取消
          </a-button>
        </div>
      </a-space>
    </div>

    <div class="action-tips">
      <div class="tip-item">
        <IconCheckCircle />
        <span>保存后可直接发布</span>
      </div>
      <div class="tip-item">
        <IconCheckCircle />
        <span>支持富文本编辑</span>
      </div>
      <div class="tip-item">
        <IconCheckCircle />
        <span>可添加附件</span>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconSend, IconCheckCircle } from '@arco-design/web-vue/es/icon'

interface Props {
  isSubmitting: boolean
  isSaving: boolean
  submitText?: string
}

const props = withDefaults(defineProps<Props>(), {
  submitText: '发布'
})

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'save-draft'): void
  (e: 'cancel'): void
}>()

const submitButtonText = computed(() => {
  return props.submitText || '发布'
})

const handleSubmit = () => {
  emit('submit')
}

const handleSaveDraft = () => {
  emit('save-draft')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.action-card {
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  padding: 8px 0;
}

.button-row {
  display: flex;
  gap: 12px;
}

.button-row.secondary {
  justify-content: center;
}

.action-tips {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e6e8;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
}

.tip-item:last-child {
  margin-bottom: 0;
}
</style>
