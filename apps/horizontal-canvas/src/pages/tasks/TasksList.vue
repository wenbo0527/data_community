<template>
  <div class="tasks-page">
    <div class="header">
      <div class="title">营销任务列表（横版）</div>
      <div class="tools">
        <a-input v-model="searchText" placeholder="搜索任务名称" allow-clear style="width: 220px" />
        <a-select v-model="statusFilter" style="width: 160px" placeholder="按状态过滤">
          <a-option value="">全部状态</a-option>
          <a-option value="draft">草稿</a-option>
          <a-option value="published">已发布</a-option>
        </a-select>
        <a-space>
          <a-button @click="refresh">刷新</a-button>
          <a-button type="primary" @click="createTask">新建任务</a-button>
        </a-space>
      </div>
    </div>
    <div class="stats" v-if="stats">
      <a-space>
        <a-tag color="arcoblue">总数：{{ stats.totalTasks }}</a-tag>
        <a-tag color="green">已发布：{{ publishedCount }}</a-tag>
        <a-tag color="blue">草稿：{{ draftCount }}</a-tag>
      </a-space>
    </div>
    <a-table :columns="columns" :data="rowsFiltered" :pagination="pagination" @page-change="onPageChange" @page-size-change="onPageSizeChange" row-key="id">
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
      </template>
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="edit(record)" v-if="record.status === 'draft' || record.status === 'published'">编辑</a-button>
          <a-dropdown v-if="record.versions && record.versions.length > 1">
            <a-button type="text" size="small">历史版本</a-button>
            <template #content>
              <a-doption v-for="version in record.versions" :key="version.version" @click="viewVersion(record, version.version)">
                <div class="version-option">
                  <span>v{{ version.version }}</span>
                  <a-tag v-if="version.isActive" color="green" size="small">运行中</a-tag>
                  <span class="version-time">{{ version.createTime }}</span>
                </div>
              </a-doption>
            </template>
          </a-dropdown>
          <a-button type="text" size="small" @click="manualPush(record)" v-if="record.status === 'draft' || record.status === 'running'">手工推送</a-button>
          <a-button type="text" size="small" @click="viewExecutionLog(record)" v-if="record.status === 'running' || record.status === 'completed'">执行日志</a-button>
          <a-button type="text" size="small" @click="stopTask(record)" v-if="record.status === 'running'">停止</a-button>
          <a-popconfirm content="确认删除该任务？" @ok="del(record)">
            <a-button type="text" size="small" status="danger">删除</a-button>
          </a-popconfirm>
          <a-button v-if="record.status !== 'published'" type="text" size="small" status="success" @click="pub(record)">发布</a-button>
          <a-button v-else type="text" size="small" @click="unpub(record)">取消发布</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup>
/*
用途：通用任务列表页（数据展示与基础操作）
说明：负责从 TaskStorage 读取与展示任务，提供创建/编辑/查看/发布等入口，导航到横版画布页。
边界：不直接修改画布结构；发布/取消发布通过 TaskStorage 或后端接口（当前为 mock）。
副作用：窗口跳转（iframe/窗口两种场景）、消息提示。
*/
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Message } from '@arco-design/web-vue'
import { TaskStorage } from '@/utils/taskStorage.js'

const rows = ref([])
const searchText = ref('')
const statusFilter = ref('')
const stats = ref(null)
const inIframe = false
const columns = [
  { title: '任务名称', dataIndex: 'taskName', width: 200 },
  { title: '任务类型', dataIndex: 'taskType', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '当前版本', dataIndex: 'version', width: 100, render: ({ record }) => `v${record.version || 1}` },
  { title: '创建时间', dataIndex: 'createTime', width: 160 },
  { title: '执行时间', dataIndex: 'executeTime', width: 160 },
  { title: '创建人', dataIndex: 'creator', width: 100 },
  { title: '操作', slotName: 'actions', width: 280, fixed: 'right' }
]
const pagination = ref({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true })

const rowsFiltered = computed(() => {
  const q = (searchText.value || '').toLowerCase()
  const s = statusFilter.value || ''
  return rows.value.filter(r => {
    const matchName = !q || String(r.name || '').toLowerCase().includes(q)
    const matchStatus = !s || r.status === s
    return matchName && matchStatus
  })
})

const publishedCount = computed(() => rows.value.filter(r => r.status === 'published').length)
const draftCount = computed(() => rows.value.filter(r => r.status !== 'published').length)

function post() {}

function refresh() {
  try {
    TaskStorage.seedIfEmpty && TaskStorage.seedIfEmpty()
    const list = TaskStorage.getAllTasks ? TaskStorage.getAllTasks() : []
    rows.value = (list || []).map(t => ({
      id: String(t.id),
      taskName: t.name || '未命名任务',
      taskType: t.type || '未分类',
      status: t.status || 'draft',
      version: t.version || 1,
      createTime: t.createdAt || new Date().toLocaleString('zh-CN'),
      executeTime: t.executeTime || '-',
      creator: t.creator || '当前用户',
      versions: t.versions || [ { version: t.version || 1, createTime: t.createdAt || new Date().toLocaleString('zh-CN'), isActive: t.status === 'running' } ],
      canvasData: t.canvasData || { nodes: [], connections: [] }
    }))
    pagination.value.total = rows.value.length
    stats.value = TaskStorage.getStorageStats ? TaskStorage.getStorageStats() : null
  } catch {}
}

// 用途：创建任务并跳转到横版画布编辑模式
// 入参：无
// 返回：无
// 边界：依赖 TaskStorage.createTask；失败提示
// 副作用：window.location 跳转至 `/marketing/tasks/horizontal?mode=edit`
function createTask() {
  try {
    const newTask = TaskStorage.createTask ? TaskStorage.createTask({ name: '未命名任务', description: '', version: 1, status: 'draft' }) : null
    if (newTask) {
      Message.success('创建成功')
      refresh()
      const qs = new URLSearchParams({ mode: 'edit', id: newTask.id, version: String(newTask.version || 1) })
      window.location.assign(`/marketing/tasks/horizontal?${qs.toString()}`)
    }
  } catch { Message.error('创建失败') }
}

// 用途：编辑任务（支持 iframe/窗口两种场景）
// 入参：record 任务记录
// 返回：无
// 边界：需存在 id/version 字段
// 副作用：跳转至编辑模式
function edit(record) {
  const qs = new URLSearchParams({ mode: 'edit', id: record.id, version: String(record.version || 1) })
  if (inIframe) {
    try { window.parent.location.href = `/marketing/tasks/horizontal?${qs.toString()}` } catch {}
  } else {
    window.location.assign(`/marketing/tasks/horizontal?${qs.toString()}`)
  }
}
// 用途：查看任务（支持 iframe/窗口两种场景）
// 入参：record 任务记录
// 返回：无
// 边界：需存在 id/version 字段
// 副作用：跳转至查看模式
function view(record) {
  const qs = new URLSearchParams({ mode: 'view', id: record.id, version: String(record.version || 1) })
  if (inIframe) {
    try { window.parent.location.href = `/marketing/tasks/horizontal?${qs.toString()}` } catch {}
  } else {
    window.location.assign(`/marketing/tasks/horizontal?${qs.toString()}`)
  }
}
function del(record) { post('delete-task', { id: record.id }) }
function pub(record) { post('publish-task', { id: record.id }) }
function unpub(record) { post('unpublish-task', { id: record.id }) }
function getStatusColor(status) { const m = { draft: 'blue', running: 'green', completed: 'green', disabled: 'red', published: 'green' }; return m[status] || 'gray' }
function getStatusText(status) { const m = { draft: '草稿', running: '运行中', completed: '已完成', disabled: '停用', published: '已发布' }; return m[status] || '未知' }
function viewVersion(record, version) { const qs = new URLSearchParams({ mode: 'view', id: record.id, version: String(version || 1) }); if (inIframe) { try { window.parent.location.href = `/marketing/tasks/horizontal?${qs.toString()}` } catch {} } else { window.location.assign(`/editor?${qs.toString()}`) } }
function manualPush(record) { if (record.status === 'draft') { record.status = 'running'; Message.success('任务推送成功') } }
function viewExecutionLog(record) { Message.info('执行日志功能开发中...') }
function stopTask(record) { record.status = 'disabled'; Message.success('任务已停止') }
function onPageChange(page) { pagination.value.current = page }
function onPageSizeChange(size) { pagination.value.pageSize = size; pagination.value.current = 1 }

onMounted(() => { refresh() })
</script>

<style scoped>
.tasks-page { padding: 16px }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px }
.title { font-size: 18px; font-weight: 600; color: #1d2129 }
.tools { display: flex; align-items: center; gap: 12px }
.stats { margin: 12px 0 }
</style>
