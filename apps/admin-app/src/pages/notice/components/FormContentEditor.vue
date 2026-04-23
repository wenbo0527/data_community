<template>
  <a-card class="content-editor-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <IconEdit />
        内容编辑
        <span class="required-mark">*</span>
      </div>
    </template>

    <!-- Markdown编辑器工具栏 -->
    <div class="editor-toolbar">
      <a-space>
        <a-button size="small" @click="insertMarkdown('**', '**')">
          <strong>B</strong>
        </a-button>
        <a-button size="small" @click="insertMarkdown('*', '*')">
          <em>I</em>
        </a-button>
        <a-button size="small" @click="insertMarkdown('# ', '')">
          H1
        </a-button>
        <a-button size="small" @click="insertMarkdown('## ', '')">
          H2
        </a-button>
        <a-button size="small" @click="insertMarkdown('- ', '')">
          列表
        </a-button>
        <a-button size="small" @click="insertMarkdown('1. ', '')">
          数字
        </a-button>
        <a-button size="small" @click="insertMarkdown('[', '](url)')">
          链接
        </a-button>
        <a-button size="small" @click="insertMarkdown('`', '`')">
          代码
        </a-button>
        <a-button size="small" @click="insertMarkdown('```\n', '\n```')">
          代码块
        </a-button>
      </a-space>
      <div class="toolbar-right">
        <a-button size="small" type="text" @click="handlePreview">
          <IconEye />
          预览
        </a-button>
        <span class="word-count">字数：{{ contentWordCount }}</span>
      </div>
    </div>

    <!-- Markdown编辑器 -->
    <a-textarea
      ref="contentEditor"
      v-model="localContent"
      placeholder="请输入内容，支持 Markdown 格式..."
      :auto-size="{ minRows: 12, maxRows: 20 }"
      :max-length="50000"
      @input="handleContentChange"
    />

    <!-- 预览区域 -->
    <div v-if="previewVisible" class="preview-section">
      <div class="preview-header">
        <span>预览</span>
        <a-button size="mini" type="text" @click="previewVisible = false">
          关闭
        </a-button>
      </div>
      <div class="preview-content markdown-body" v-html="renderedContent"></div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { IconEdit, IconEye } from '@arco-design/web-vue/es/icon'
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  (e: 'update:content', value: string): void
  (e: 'change'): void
  (e: 'preview'): void
}>()

const contentEditor = ref()
const previewVisible = ref(false)
const localContent = ref(props.content)

// 监听 props 变化
watch(() => props.content, (newVal) => {
  localContent.value = newVal
})

// 字数统计
const contentWordCount = computed(() => {
  return localContent.value?.length || 0
})

// Markdown 渲染
const renderedContent = computed(() => {
  if (!localContent.value) return ''
  return marked(localContent.value)
})

// 插入 Markdown 语法
const insertMarkdown = (prefix: string, suffix: string) => {
  const textarea = contentEditor.value?.$el?.querySelector('textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const content = localContent.value || ''
  const before = content.substring(0, start)
  const selected = content.substring(start, end)
  const after = content.substring(end)

  localContent.value = before + prefix + selected + suffix + after
  emit('update:content', localContent.value)
  emit('change')

  // 恢复光标位置
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(
      start + prefix.length,
      end + prefix.length
    )
  })
}

const handleContentChange = () => {
  emit('update:content', localContent.value)
  emit('change')
}

const handlePreview = () => {
  previewVisible.value = !previewVisible.value
  emit('preview')
}

import { nextTick } from 'vue'
</script>

<style scoped>
.content-editor-card {
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.required-mark {
  color: #f53f3f;
  margin-left: 4px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 4px;
  margin-bottom: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word-count {
  font-size: 12px;
  color: var(--subapp-text-tertiary);
}

.preview-section {
  margin-top: 16px;
  border: 1px solid var(--subapp-border);
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f7f8fa;
  border-bottom: 1px solid var(--subapp-border);
  font-weight: 600;
}

.preview-content {
  padding: 16px;
  min-height: 200px;
  background: #fff;
}

.markdown-body {
  line-height: 1.6;
}

.markdown-body :deep(h1) {
  font-size: 24px;
  margin: 16px 0;
}

.markdown-body :deep(h2) {
  font-size: 20px;
  margin: 14px 0;
}

.markdown-body :deep(code) {
  background: #f7f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
