<template>
  <a-modal
    v-model:visible="visible"
    :title="isEdit ? '编辑备注' : '添加备注'"
    :width="520"
    :mask-closable="false"
    class="note-modal"
    @before-ok="handleSave"
    @cancel="handleCancel"
  >
    <div class="note-form">
      <div class="form-item">
        <label class="form-label">备注内容</label>
        <a-textarea
          v-model="formData.content"
          placeholder="请输入备注内容..."
          :max-length="500"
          show-word-limit
          :rows="4"
          class="note-textarea"
        />
      </div>
      
      <div class="form-item">
        <label class="form-label">备注人</label>
        <a-select
          v-model="formData.createdBy"
          placeholder="选择备注人"
          class="creator-select"
        >
          <a-option value="张三">张三</a-option>
          <a-option value="李四">李四</a-option>
          <a-option value="王五">王五</a-option>
        </a-select>
      </div>

      <div v-if="isEdit" class="form-item meta">
        <span class="meta-text">
          创建于 {{ note?.createdAt }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :disabled="!formData.content.trim()" @click="handleSave">
          {{ isEdit ? '保存' : '添加' }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'

interface Note {
  id?: string
  reportId: string
  content: string
  createdAt?: string
  createdBy?: string
}

interface Props {
  visible: boolean
  note?: Note | null
  reportId: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  note: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', note: Note): void
  (e: 'cancel'): void
}>()

const isEdit = computed(() => !!props.note?.id)

const formData = reactive<{
  content: string
  createdBy: string
}>({
  content: '',
  createdBy: ''
})

// 监听 props 变化来初始化表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.note) {
      formData.content = props.note.content
      formData.createdBy = props.note.createdBy || ''
    } else {
      formData.content = ''
      formData.createdBy = ''
    }
  }
})

const handleSave = () => {
  if (!formData.content.trim()) return
  
  const note: Note = {
    id: props.note?.id || `note_${Date.now()}`,
    reportId: props.reportId,
    content: formData.content.trim(),
    createdAt: props.note?.createdAt || new Date().toLocaleString('zh-CN'),
    createdBy: formData.createdBy || '未知'
  }
  
  emit('save', note)
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
.note-form {
  padding: 8px 0;
}

.form-item {
  margin-bottom: 20px;
}

.form-item.meta {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--subapp-text-primary);
  margin-bottom: 8px;
}

.note-textarea {
  width: 100%;
}

.creator-select {
  width: 100%;
}

.meta-text {
  font-size: 12px;
  color: #8c8c8c;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
