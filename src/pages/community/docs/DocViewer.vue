<template>
  <div class="doc-viewer">
    <a-page-header :title="pageTitle" />
    <a-row :gutter="12">
      <a-col :span="6">
        <a-card :bordered="true" title="文档列表" class="doc-sidebar">
          <template #extra>
            <a-badge :count="docList.length" />
          </template>
          <a-input-search v-model="fileSearch" placeholder="搜索文档标题" allow-clear class="file-search" />
          <div class="file-list">
            <a-tree
              :data="docTree"
              block-node
              @select="onTreeSelect"
              v-model:selected-keys="selectedDocKeys"
              :default-expand-all="true"
            >
              <template #icon="{ node }">
                <icon-folder v-if="node.isFolder" />
                <icon-file v-else />
              </template>
            </a-tree>
          </div>
          <a-divider>当前章节</a-divider>
          <a-anchor :scroll-container="'#doc-scroll-container'">
            <a-anchor-link v-for="h in toc" :key="h.id" :href="'#'+h.id" :title="h.text" />
          </a-anchor>
        </a-card>
      </a-col>
      <a-col :span="18">
        <a-card :bordered="true">
          <div class="doc-ops">
            <a-space>
              <a-input-search v-model="keyword" placeholder="搜索当前文档内容" allow-clear @search="applySearch" />
              <a-button @click="copyLink">复制链接</a-button>
            </a-space>
          </div>
          <div class="doc-content" v-html="renderedHtml"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconFile, IconFilePdf, IconFolder } from '@arco-design/web-vue/es/icon'
import { marked } from 'marked'
import { listDocs, getDocBySlug } from '@/api/docsLocal'
import type { DocSummary } from '@/api/docsLocal'

type HeadingItem = { id: string; text: string; level: number }
type Frontmatter = { title?: string; description?: string; [k: string]: any }

const route = useRoute()
const router = useRouter()
const slug = computed(() => decodeURIComponent(String(route.params.slug || '')))
const keyword = ref('')
const fileSearch = ref('')
const sourceMd = ref<string>('')
const contentHtml = ref<string>('')
const contentFormat = ref<'markdown' | 'html'>('markdown')
const toc = ref<HeadingItem[]>([])
const docList = ref<DocSummary[]>([])
const meta = ref<Frontmatter>({})
const selectedDocKeys = ref<string[]>([])

watch(slug, (s: string) => {
  if (s) selectedDocKeys.value = [s]
}, { immediate: true })

const docTree = computed(() => {
  const root: any[] = []
  
  const search = fileSearch.value.toLowerCase()
  const filtered = search 
    ? docList.value.filter((d: DocSummary) => d.title.toLowerCase().includes(search) || d.slug.toLowerCase().includes(search))
    : docList.value

  filtered.forEach((doc: DocSummary) => {
    let currentLevel = root
    const path = doc.categoryPath || []
    
    path.forEach((folderName: string, index: number) => {
      let folder = currentLevel.find((item: any) => item.title === folderName && item.isFolder)
      if (!folder) {
        folder = {
          key: `folder-${path.slice(0, index + 1).join('/')}`,
          title: folderName,
          isFolder: true,
          children: []
        }
        currentLevel.push(folder)
      }
      currentLevel = folder.children
    })
    
    currentLevel.push({
      key: doc.slug,
      title: doc.title,
      isFolder: false
    })
  })

  const sortItems = (items: any[]) => {
    items.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      return a.title.localeCompare(b.title)
    })
    items.forEach((item: any) => {
      if (item.children) sortItems(item.children)
    })
  }
  sortItems(root)
  
  return root
})

const onTreeSelect = (keys: string[], data: any) => {
  if (data.node.isFolder) return
  if (keys.length > 0) {
    navigateTo(keys[0])
  }
}

const filteredFiles = computed<DocSummary[]>(() => {
  if (!fileSearch.value) return docList.value
  const search = fileSearch.value.toLowerCase()
  return docList.value.filter((item: DocSummary) => item.title.toLowerCase().includes(search) || item.slug.toLowerCase().includes(search))
})

const navigateTo = (name: string) => {
  router.push(`/docs/${encodeURIComponent(name)}`)
}

const slugify = (s: string) => {
  return s.toLowerCase().replace(/[^a-z0-9\s\-]/g, '').trim().replace(/\s+/g, '-')
}

const buildToc = (md: string) => {
  const lines = md.split('\n')
  const out: HeadingItem[] = []
  lines.forEach((line: string) => {
    if (line.startsWith('### ')) {
      const t = line.slice(4).trim()
      out.push({ id: slugify(t), text: t, level: 3 })
    } else if (line.startsWith('## ')) {
      const t = line.slice(3).trim()
      out.push({ id: slugify(t), text: t, level: 2 })
    }
  })
  toc.value = out
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const applySearch = () => {
  if (!keyword.value) { Message.success('已清空搜索'); return }
  Message.success('已搜索')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    Message.success('链接已复制')
  } catch {
    Message.error('复制失败')
  }
}

const pageTitle = computed(() => {
  if (meta.value.title) return meta.value.title
  const firstLine = sourceMd.value.split('\n')[0] || ''
  if (firstLine.startsWith('# ')) return firstLine.slice(2).trim()
  const decoded = decodeURIComponent(slug.value || '')
  return decoded || '文档详情'
})

const renderedHtml = computed(() => {
  const html = contentFormat.value === 'html' ? contentHtml.value : marked.parse(sourceMd.value) as unknown as string
  let out = html
  toc.value.forEach((h: HeadingItem) => {
    const pattern = new RegExp(`<h${h.level}>\\s*${escapeRegExp(h.text)}\\s*</h${h.level}>`, 'i')
    out = out.replace(pattern, `<h${h.level} id="${h.id}">${h.text}</h${h.level}>`)
  })
  if (keyword.value) {
    const kw = escapeRegExp(keyword.value)
    const reg = new RegExp(`(${kw})`, 'gi')
    out = out.replace(reg, '<span class="doc-highlight">$1</span>')
  }
  return `<div id="doc-scroll-container">${out}</div>`
})

const buildIndex = async () => {
  const list = await listDocs()
  docList.value = list
}

// 解析由服务返回的 md 构建目录

const loadBySlug = async (s: string) => {
  const key = decodeURIComponent(s || '')
  let targetSlug = key
  if (!targetSlug && docList.value.length > 0) {
    targetSlug = docList.value[0].slug
  }
  const data = await getDocBySlug(targetSlug)
  meta.value = data.fm
  sourceMd.value = data.md
  contentHtml.value = data.html
  contentFormat.value = data.contentFormat || 'markdown'
  buildToc(data.md)
}

onMounted(async () => {
  await buildIndex()
  await loadBySlug(slug.value)
})

watch(slug, async (s: string) => {
  await loadBySlug(s)
})
</script>

<style scoped>
.doc-viewer { padding: 20px; background: #f0f2f5; min-height: 100vh; }
.doc-sidebar { max-height: calc(100vh - 120px); overflow-y: auto; position: sticky; top: 20px; }
.file-search { margin-bottom: 12px; }
.file-list { margin-bottom: 16px; }
.file-item { 
  padding: 8px 12px; 
  cursor: pointer; 
  border-radius: 4px; 
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-2);
}
.file-item:hover { background: var(--color-fill-2); color: var(--color-text-1); }
.file-item.active { background: var(--color-primary-light-1); color: var(--color-primary-light-4); font-weight: 500; }
.file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }

.doc-ops { margin-bottom: 20px; display: flex; justify-content: flex-end; }
.doc-content { line-height: 1.8; color: #333; }
.doc-content :deep(h1) { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0; }
.doc-content :deep(h2) { margin-top: 24px; border-left: 4px solid var(--color-primary-light-4); padding-left: 12px; }
.doc-content :deep(pre) { background: #f7f8fa; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid #e5e6eb; }
.doc-content :deep(code) { font-family: 'Fira Code', monospace; background: #f2f3f5; padding: 2px 4px; border-radius: 4px; }
.doc-content :deep(img) { max-width: 100%; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.doc-content :deep(.doc-highlight) { background: #ffe58f; padding: 0 2px; border-radius: 2px; }
</style>
