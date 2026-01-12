<template>
  <div class="doc-viewer">
    <a-page-header :title="pageTitle" />
    <a-row :gutter="12">
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
      <a-col :span="6">
        <a-card :bordered="true" title="目录">
          <a-anchor :scroll-container="'#doc-scroll-container'">
            <a-anchor-link v-for="h in toc" :key="h.id" :href="'#'+h.id" :title="h.text" />
          </a-anchor>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { marked } from 'marked'

type HeadingItem = { id: string; text: string; level: number }
type Frontmatter = { title?: string; description?: string; [k: string]: any }

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const keyword = ref('')
const sourceMd = ref<string>('')
const toc = ref<HeadingItem[]>([])
const files = (import.meta as any).glob('../../../../.trae/documents/**/*.md', { as: 'raw', eager: true }) as Record<string, string>
const index = ref<Record<string, string>>({})
const meta = ref<Frontmatter>({})

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
  const html = marked.parse(sourceMd.value) as unknown as string
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

const buildIndex = () => {
  const map: Record<string, string> = {}
  Object.keys(files).forEach((p) => {
    const name = (p.split('/').pop() || '').replace(/\.md$/i, '')
    if (name) {
      const content = (files[p] as unknown as string) || ''
      map[name] = content
    }
  })
  index.value = map
}

const parseFrontmatter = (md: string): { fm: Frontmatter; body: string } => {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3)
    if (end !== -1) {
      const raw = md.slice(3, end).trim()
      const body = md.slice(end + 4)
      const fm: Frontmatter = {}
      raw.split('\n').forEach((line) => {
        const idx = line.indexOf(':')
        if (idx > 0) {
          const key = line.slice(0, idx).trim()
          const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
          fm[key] = val
        }
      })
      return { fm, body }
    }
  }
  return { fm: {}, body: md }
}

const loadBySlug = (s: string) => {
  const key = decodeURIComponent(s || '')
  let md = (key && index.value[key]) || ''
  if (!md) {
    const preferred = '社区产品文档中心重构方案'
    md = index.value[preferred] || Object.values(index.value)[0] || '# 文档详情'
  }
  const { fm, body } = parseFrontmatter(md)
  meta.value = fm
  sourceMd.value = body
  buildToc(body)
}

onMounted(() => {
  buildIndex()
  loadBySlug(slug.value)
})

watch(slug, (s: string) => {
  loadBySlug(s)
})
</script>

<style scoped>
.doc-ops { margin-bottom: 12px; }
.doc-content :deep(pre) { background: #f7f8fa; padding: 12px; border-radius: 6px; }
.doc-content :deep(.doc-highlight) { background: #ffe58f; }
</style>
