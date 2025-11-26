<template>
  <div class="horizontal-iframe-page">
    <div class="page-header">
      <h1 class="page-title">横版任务流（嵌入）</h1>
      <div class="page-actions">
        <a-space>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </div>
    </div>
    <div class="content-card">
      <div class="iframe-container">
        <iframe ref="iframeRef" :src="iframeSrc" class="iframe" @load="onIframeLoad"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { TaskStorage } from '../../../utils/taskStorage.js'

const route = useRoute()
const router = useRouter()

const iframeRef = ref(null)
const mode = computed(() => route.query.mode || '')
const id = computed(() => route.query.id || '')
const version = computed(() => parseInt(route.query.version || '1'))

const iframeSrc = computed(() => {
  const qs = new URLSearchParams({ mode: String(mode.value || 'view'), id: String(id.value), version: String(version.value) })
  return `http://localhost:5175/editor?${qs.toString()}`
})

function goBack() {
  router.push('/marketing/tasks')
}

function getInitialTask() {
  const tid = id.value ? String(id.value) : ''
  if (tid) {
    const task = TaskStorage.getTaskById(tid)
    if (task) return task
  }
  return {
    id: tid || String(Date.now()),
    name: '未命名任务',
    description: '',
    type: 'marketing',
    status: 'draft',
    version: version.value || 1,
    canvasData: { nodes: [{ id: 'start', type: 'start', x: 120, y: 120, label: '开始' }], connections: [] }
  }
}

function onIframeLoad() {
  try {
    const task = getInitialTask()
    const payload = { mode: mode.value, id: id.value, version: version.value, task }
    iframeRef.value?.contentWindow?.postMessage({ type: 'init', payload }, '*')
  } catch {}
}

function handleMessage(e) {
  const data = e.data
  if (!data || typeof data !== 'object') return
  if (data.type === 'save') {
    const p = data.payload || {}
    const saved = TaskStorage.saveTask({ id: String(p.id), version: p.version || 1, status: 'draft', type: 'marketing', canvasData: p.canvasData })
    if (saved) Message.success('保存成功')
    else Message.error('保存失败')
  }
}

onMounted(() => {
  // 若无有效参数，跳列表页
  const m = String(mode.value || '')
  if (!m || !['create','edit','view'].includes(m)) {
    router.push('/marketing/tasks')
    return
  }
  window.addEventListener('message', handleMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.horizontal-iframe-page { padding: 0; height: 100%; display: flex; flex-direction: column }
.page-header { background: #fff; border-bottom: 1px solid #f2f3f5; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: #1d2129 }
.content-card { flex: 1; margin: 16px 24px; background: #fff; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); display: flex }
.iframe-container { flex: 1; border-radius: 8px; overflow: hidden }
.iframe { width: 100%; height: 100%; border: 0 }
</style>
