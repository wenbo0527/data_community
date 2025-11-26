<template>
  <div class="horizontal-tasks-iframe-page">
    <div class="page-header">
      <h1 class="page-title">营销任务（横版列表嵌入）</h1>
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
import { Message } from '@arco-design/web-vue'
import { TaskStorage } from '../../../utils/taskStorage.js'

const iframeRef = ref(null)
const iframeSrc = computed(() => 'http://localhost:5175/tasks')

function onIframeLoad() {
  try {
    const tasks = TaskStorage.getAllTasks ? TaskStorage.getAllTasks() : []
    iframeRef.value?.contentWindow?.postMessage({ type: 'tasks', payload: tasks }, '*')
  } catch {}
}

function handleMessage(e) {
  const data = e.data
  if (!data || typeof data !== 'object') return
  if (data.type === 'query-tasks') {
    try {
      const tasks = TaskStorage.getAllTasks ? TaskStorage.getAllTasks() : []
      iframeRef.value?.contentWindow?.postMessage({ type: 'tasks', payload: tasks }, '*')
    } catch (err) {
      iframeRef.value?.contentWindow?.postMessage({ type: 'tasks', payload: [] }, '*')
    }
    try {
      const stats = TaskStorage.getStorageStats ? TaskStorage.getStorageStats() : null
      iframeRef.value?.contentWindow?.postMessage({ type: 'tasks-stats', payload: stats }, '*')
    } catch {}
  } else if (data.type === 'delete-task') {
    const id = data.payload?.id
    let ok = false
    try { ok = TaskStorage.deleteTask ? TaskStorage.deleteTask(String(id)) : false } catch {}
    iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: !!ok, message: ok ? '删除成功' : '删除失败' } }, '*')
  } else if (data.type === 'publish-task') {
    const id = data.payload?.id
    try {
      const task = TaskStorage.getTaskById ? TaskStorage.getTaskById(String(id)) : null
      if (task) {
        task.status = 'published'
        TaskStorage.saveTask && TaskStorage.saveTask(task)
        iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: true, message: '发布成功' } }, '*')
      } else {
        iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: false, message: '任务不存在' } }, '*')
      }
    } catch {
      iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: false, message: '发布失败' } }, '*')
    }
  } else if (data.type === 'unpublish-task') {
    const id = data.payload?.id
    try {
      const task = TaskStorage.getTaskById ? TaskStorage.getTaskById(String(id)) : null
      if (task) {
        task.status = 'draft'
        TaskStorage.saveTask && TaskStorage.saveTask(task)
        iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: true, message: '已取消发布' } }, '*')
      } else {
        iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: false, message: '任务不存在' } }, '*')
      }
    } catch {
      iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: false, message: '取消发布失败' } }, '*')
    }
  } else if (data.type === 'create-task') {
    try {
      const newTask = TaskStorage.createTask ? TaskStorage.createTask({
        name: data.payload?.name || '未命名任务',
        description: data.payload?.description || '',
        version: data.payload?.version || 1,
        status: 'draft'
      }) : null
      iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: !!newTask, message: newTask ? '创建成功' : '创建失败', id: newTask?.id } }, '*')
      const tasks = TaskStorage.getAllTasks ? TaskStorage.getAllTasks() : []
      iframeRef.value?.contentWindow?.postMessage({ type: 'tasks', payload: tasks }, '*')
    } catch {
      iframeRef.value?.contentWindow?.postMessage({ type: 'operation-result', payload: { success: false, message: '创建失败' } }, '*')
    }
  }
}

onMounted(() => { window.addEventListener('message', handleMessage) })
onBeforeUnmount(() => { window.removeEventListener('message', handleMessage) })
</script>

<style scoped>
.horizontal-tasks-iframe-page { padding: 0; height: 100%; display: flex; flex-direction: column }
.page-header { background: #fff; border-bottom: 1px solid #f2f3f5; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: #1d2129 }
.content-card { flex: 1; margin: 16px 24px; background: #fff; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); display: flex }
.iframe-container { flex: 1; border-radius: 8px; overflow: hidden }
.iframe { width: 100%; height: 100%; border: 0 }
</style>
