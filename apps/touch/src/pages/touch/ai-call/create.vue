<template>
  <div class="ai-call-create-container">
    <a-card :bordered="false" class="form-card">
      <template #title>
        <div class="card-title">
          <icon-edit />
          AI外呼模板新建
        </div>
      </template>

      <a-form
        :model="formData"
        :rules="rules"
        layout="vertical"
        ref="formRef"
        class="template-form"
        :label-col-props="{ span: 24 }"
        :wrapper-col-props="{ span: 24 }"
      >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="name" label="模板名称" required>
              <a-input
                v-model="formData.name"
                placeholder="请输入模板名称"
                allow-clear
                size="large"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item field="vendor" label="供应商">
              <a-select
                v-model="formData.vendor"
                placeholder="请选择供应商"
                allow-clear
                size="large"
              >
                <a-option value="阿里云">阿里云</a-option>
                <a-option value="腾讯云">腾讯云</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="scene" label="应用场景">
              <a-select
                v-model="formData.scene"
                placeholder="请选择应用场景"
                allow-clear
                size="large"
              >
                <a-option value="营销推广">营销推广</a-option>
                <a-option value="客户回访">客户回访</a-option>
                <a-option value="逾期提醒">逾期提醒</a-option>
                <a-option value="活动通知">活动通知</a-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item field="enabled" label="是否启用">
              <a-radio-group v-model="formData.enabled" size="large">
                <a-radio :value="true">启用</a-radio>
                <a-radio :value="false">停用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item field="script" label="话术内容" class="script-form-item">
              <a-textarea
                v-model="formData.script"
                placeholder="请输入AI外呼话术内容"
                :auto-size="{ minRows: 8, maxRows: 15 }"
                allow-clear
                class="script-textarea"
              />
              <div class="script-hint">
                <icon-info-circle />
                <span>支持变量引用，格式：${变量名}</span>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item class="action-form-item">
              <a-space size="large">
                <a-button type="primary" size="large" @click="handleSubmit">
                  <template #icon><icon-check /></template>
                  确定
                </a-button>
                <a-button size="large" @click="handleCancel">
                  <template #icon><icon-close /></template>
                  取消
                </a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconEdit, IconCheck, IconClose, IconInfoCircle } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const formRef = ref()

const formData = reactive({
  name: '',
  vendor: '',
  scene: '',
  enabled: true,
  script: ''
})

const rules = {
  name: [
    { required: true, message: '请输入模板名称' }
  ]
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }

  try {
    Message.success('保存成功')
    router.push('/touch/ai-call')
  } catch (error) {
    Message.error('保存失败')
  }
}

function handleCancel() {
  router.back()
}
</script>

<style scoped>
.ai-call-create-container {
  padding: 20px;
  background: #f2f3f5;
  min-height: 100vh;
}

.form-card {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.template-form {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
  font-size: 14px;
  color: #1d2129;
  margin-bottom: 8px;
}

:deep(.arco-form-item-label-required-symbol) {
  color: #f53f3f;
  margin-right: 4px;
}

:deep(.arco-input),
:deep(.arco-select-view),
:deep(.arco-textarea) {
  border-radius: 4px;
}

:deep(.arco-input:hover),
:deep(.arco-select-view:hover),
:deep(.arco-textarea:hover) {
  border-color: #4080ff;
}

:deep(.arco-radio-group) {
  display: flex;
  gap: 24px;
}

:deep(.arco-radio) {
  font-size: 14px;
}

.script-form-item {
  margin-top: 8px;
}

.script-textarea {
  border-radius: 4px;
}

.script-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #86909c;
}

.action-form-item {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e6eb;
}

.action-form-item :deep(.arco-form-item-content-flex) {
  justify-content: center;
}

@media (max-width: 768px) {
  .template-form {
    padding: 16px;
  }

  .ai-call-create-container {
    padding: 12px;
  }
}
</style>
