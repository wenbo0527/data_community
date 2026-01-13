<template>
  <div class="doc-edit-page">
    <a-page-header :title="isEdit ? '编辑文档' : '新建文档'" @back="$router.back()">
        <template #extra>
            <a-button @click="$router.back()">取消</a-button>
            <a-button type="primary" :loading="submitting" @click="handleSubmit">保存</a-button>
        </template>
    </a-page-header>
    
    <a-card class="edit-card">
      <a-form :model="form" layout="vertical">
        <a-form-item field="title" label="文档标题" required>
          <a-input v-model="form.title" placeholder="请输入文档标题" />
        </a-form-item>
        <a-form-item field="slug" label="Slug (唯一标识)" required>
          <a-input v-model="form.slug" placeholder="例如: user-guide" :disabled="isEdit" />
          <template #help>文档的唯一标识符，将用于 URL 访问</template>
        </a-form-item>
        <a-form-item field="category" label="文档分类路径">
          <a-tree-select
            v-model="form.category"
            :data="categoryTree"
            placeholder="请选择或输入新分类"
            allow-clear
            allow-search
            allow-create
            :field-names="{ key: 'value', title: 'title' }"
          />
          <template #help>可以直接选择已有分类，或输入新分类（使用 / 分隔多级路径，例如：资产管理/指标体系）</template>
        </a-form-item>
        <a-form-item field="description" label="简要描述">
          <a-textarea v-model="form.description" placeholder="文档简介" :max-length="200" show-word-limit />
        </a-form-item>
        <a-form-item field="contentFormat" label="编辑模式">
          <a-radio-group v-model="form.contentFormat" type="button">
            <a-radio value="markdown">Markdown</a-radio>
            <a-radio value="html">富文本 (HTML)</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="content" :label="form.contentFormat === 'markdown' ? '文档内容 (Markdown)' : '文档内容 (富文本)'" required>
          <div v-if="form.contentFormat === 'html'" class="editor-container">
            <QuillEditor
              v-model:content="form.content"
              content-type="html"
              theme="snow"
              toolbar="full"
              style="min-height: 400px"
            />
          </div>
          <a-textarea 
            v-else
            v-model="form.content" 
            :auto-size="{ minRows: 20 }" 
            style="font-family: monospace" 
            placeholder="# 请输入Markdown内容" 
          />
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDocBySlug, saveDoc, getCategoryTree, listDocs, type CategoryNode } from '@/api/docsLocal'
import { Message } from '@arco-design/web-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.slug)
const submitting = ref(false)
const categoryTree = ref<CategoryNode[]>([])

const form = ref({
  title: '',
  slug: '',
  category: '',
  description: '',
  content: '',
  contentFormat: 'markdown' as 'markdown' | 'html'
})

onMounted(async () => {
  categoryTree.value = await getCategoryTree()
  
  if (isEdit.value) {
    const slug = route.params.slug as string
    const data = await getDocBySlug(slug)
    form.value.title = data.title
    form.value.slug = slug
    form.value.category = data.fm.category || (data.fm.categoryPath ? data.fm.categoryPath.join('/') : '')
    form.value.description = data.fm.description || ''
    form.value.content = data.md
    form.value.contentFormat = data.contentFormat || 'markdown'
  }
})

const handleSubmit = async () => {
    if (!form.value.title || !form.value.slug || !form.value.content) {
        Message.error('请填写完整信息')
        return
    }

    // 校验 Slug 格式
    if (!/^[a-z0-9-_]+$/.test(form.value.slug)) {
        Message.error('Slug 只能包含小写字母、数字、连字符(-)和下划线(_)')
        return
    }
    
    submitting.value = true
    try {
        // 如果是新建，校验 Slug 是否已存在
        if (!isEdit.value) {
            const allDocs = await listDocs()
            if (allDocs.some(d => d.slug === form.value.slug)) {
                Message.error('该 Slug 已被占用，请更换')
                submitting.value = false
                return
            }
        }

        // 清理分类路径
        const cleanCategory = form.value.category
            .split('/')
            .map(s => s.trim())
            .filter(Boolean)
            .join('/')

        const fm = [
            '---',
            `title: "${form.value.title.replace(/"/g, '\\"')}"`,
            `description: "${(form.value.description || '').replace(/"/g, '\\"')}"`,
            `category: "${cleanCategory.replace(/"/g, '\\"')}"`,
            `contentFormat: "${form.value.contentFormat}"`,
            '---',
            '',
            form.value.content
        ].join('\n')
        
        await saveDoc(form.value.slug, fm)
        Message.success('保存成功')
        router.push({ name: 'AdminDocList' })
    } catch (e) {
        Message.error('保存失败')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.doc-edit-page {
    padding: 20px;
}
.editor-container {
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    width: 100%;
}
:deep(.ql-container) {
    font-size: 14px;
}
:deep(.ql-editor) {
    min-height: 400px;
}
</style>
