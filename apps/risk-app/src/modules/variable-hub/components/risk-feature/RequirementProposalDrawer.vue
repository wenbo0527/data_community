<!--
  需求提出表单（批量注册）
  - 每行：特征名称 + 需求描述 + 附件
  - 支持多行增删，一次批量提交
  - 提交后状态=需求提出（requirement_proposal），生成 DRV-YYYYMMDD-NNNN，通知管理员审核
-->
<template>
  <a-drawer
    :visible="visible"
    :width="720"
    title="批量注册需求（需求提出）"
    @cancel="handleCancel"
  >
    <a-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      填写特征名称、需求描述（可上传附件），支持一次提交多条需求。每条生成独立需求 ID（DRV-YYYYMMDD-NNNN）。
    </a-alert>

    <div v-for="(row, idx) in rows" :key="idx" class="batch-row">
      <div class="batch-row-header">
        <span class="batch-row-index">第 {{ idx + 1 }} 条</span>
        <a-button
          v-if="rows.length > 1"
          type="text"
          size="small"
          status="danger"
          @click="removeRow(idx)"
        >
          <template #icon><icon-delete /></template>
          删除
        </a-button>
      </div>

      <a-form layout="vertical">
        <a-form-item label="特征名称" required>
          <a-input
            v-model="row.variableName"
            :max-length="50"
            show-word-limit
            size="large"
            placeholder="≤50字，输入特征名称"
          />
        </a-form-item>

        <a-form-item label="需求描述">
          <a-textarea
            v-model="row.requirementDescription"
            :max-length="500"
            :rows="4"
            show-word-limit
            size="large"
            placeholder="详细描述需求内容、背景及具体要求"
          />
        </a-form-item>

        <a-form-item label="附件">
          <a-upload
            :custom-request="(opt) => handleUpload(opt, idx)"
            :show-file-list="false"
            :before-upload="(file) => beforeUpload(file)"
            accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
          >
            <a-button size="large">
              <template #icon><icon-upload /></template>
              {{ row.attachment ? row.attachment.name : '上传附件' }}
            </a-button>
            <span v-if="row.attachment" class="attachment-info">
              <icon-file /> {{ row.attachment.name }}（{{ formatSize(row.attachment.size) }}）
              <a-link style="margin-left: 8px" @click="row.attachment = null">移除</a-link>
            </span>
          </a-upload>
        </a-form-item>
      </a-form>

      <a-divider v-if="idx < rows.length - 1" style="margin: 4px 0" />
    </div>

    <a-button type="dashed" long @click="addRow" style="margin-top: 8px">
      <template #icon><icon-plus /></template>
      添加一行
    </a-button>

    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">
          批量提交（{{ rows.length }} 条）
        </a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'

interface Props {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', payloads: any[]): void
}>()

const submitting = ref(false)

interface BatchRow {
  variableName: string
  requirementDescription: string
  attachment: { name: string; size: number; uploadedAt: string } | null
}

function createEmptyRow(): BatchRow {
  return {
    variableName: '',
    requirementDescription: '',
    attachment: null
  }
}

const rows = reactive<BatchRow[]>([createEmptyRow()])

function addRow() {
  rows.push(createEmptyRow())
}

function removeRow(idx: number) {
  rows.splice(idx, 1)
}

// ============ 附件上传 ============
function formatSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

function beforeUpload(file: any) {
  if (file.size > MAX_FILE_SIZE) {
    Message.error('文件超过 10MB 上限')
    return false
  }
  return true
}

function handleUpload(option: any, idx: number) {
  const file = option.fileItem?.file
  if (!file) return
  rows[idx].attachment = {
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  option.onSuccess?.(file)
}

// ============ 提交 / 取消 ============
function handleCancel() {
  emit('update:visible', false)
}

function handleSubmit() {
  if (rows.length === 0) {
    Message.warning('请至少添加一条需求')
    return
  }
  const invalid = rows.findIndex((r) => !r.variableName || !r.variableName.trim())
  if (invalid >= 0) {
    Message.warning(`第 ${invalid + 1} 条：特征名称必填`)
    return
  }

  submitting.value = true
  try {
    const payloads = rows.map((r) => ({
      requirementName: r.variableName,
      requirementDescription: r.requirementDescription,
      excelAttachment: r.attachment || undefined,
      creator: '小李'
    }))
    emit('submit', payloads)
  } finally {
    submitting.value = false
  }
}

// 打开时重置
watch(
  () => props.visible,
  (v) => {
    if (v) {
      rows.splice(0, rows.length, createEmptyRow())
    }
  }
)
</script>

<style scoped>
.batch-row {
  padding: 12px 0;
}
.batch-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.batch-row-index {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-2);
}
.attachment-info {
  margin-left: 12px;
  color: var(--color-text-3);
  font-size: 13px;
}
</style>
