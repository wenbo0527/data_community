<template>
  <div class="marketing-tasks-container">
    <div class="page-header">
      <h1 class="page-title">营销任务</h1>
      <p class="page-description">管理和监控营销活动任务，包括任务创建、执行状态跟踪和效果分析</p>
    </div>
    
    <div class="content-card">
      <div class="task-section">
        <div class="section-header">
          <h2>任务列表</h2>
      <a-space>
        <a-button @click="refreshTaskList">
          <template #icon>
            <IconRefresh />
          </template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreateModal">
          <template #icon>
            <IconPlus />
          </template>
          新建任务
        </a-button>
        <template v-if="canBatchSubmitApproval">
          <a-button type="primary" @click="batchSubmitApproval">批量提交审批</a-button>
        </template>
        <template v-else>
          <a-tooltip content="请选择草稿且发布校验通过的任务">
            <a-button type="primary" disabled>批量提交审批</a-button>
          </a-tooltip>
        </template>
        <a-button type="primary" status="success" :disabled="!canBatchApprove" @click="batchApprove('approve')">批量审批通过</a-button>
        <a-button status="warning" :disabled="!canBatchApprove" @click="batchApprove('reject')">批量驳回</a-button>
      </a-space>
        </div>
        
        <div class="task-filters">
          <a-space>
            <a-select placeholder="任务状态" style="width: 120px;">
              <a-option value="all">全部</a-option>
              <a-option value="pending">待执行</a-option>
              <a-option value="running">执行中</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="failed">失败</a-option>
            </a-select>
            <a-select placeholder="任务类型" style="width: 120px;">
              <a-option value="all">全部</a-option>
              <a-option value="promotion">促销活动</a-option>
              <a-option value="notification">消息推送</a-option>
              <a-option value="analysis">数据分析</a-option>
            </a-select>
            <a-input placeholder="搜索任务名称" style="width: 200px;" />
            <a-button type="primary">搜索</a-button>
          </a-space>
        </div>
        
        <a-table 
          :columns="columns" 
          :data="taskData" 
          :pagination="pagination"
          :row-selection="rowSelection"
          @page-change="onPageChange"
          @page-size-change="onPageSizeChange"
        >
          <template #status="{ record }">
            <a-tag :color="getStatusColor(displayStatus(record))">{{ getStatusText(displayStatus(record)) }}</a-tag>
          </template>
          <template #publishCheck="{ record }">
            <a-tooltip v-if="Array.isArray(record.publishMessages) && record.publishMessages.length" :content="record.publishMessages.join('\n')">
              <a-tag :color="record.publishReady ? 'green' : 'red'">{{ record.publishReady ? '通过' : '未通过' }}</a-tag>
            </a-tooltip>
            <a-tag v-else :color="record.publishReady ? 'green' : 'red'">{{ record.publishReady ? '通过' : '未通过' }}</a-tag>
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="editTask(record)" v-if="record.status === 'draft' || record.status === 'published'">编辑</a-button>
              <a-button type="text" size="small" v-if="record.status === 'draft' && record.publishReady === true" @click="openSubmitApprovalModal(record)">提交审批</a-button>
              <a-tooltip v-else-if="record.status === 'draft'" content="发布校验未通过，请在画布保存并修复问题">
                <a-button type="text" size="small" disabled>提交审批</a-button>
              </a-tooltip>
              <a-button type="text" size="small" v-if="record.status === 'pending_approval'" @click="approveOne(record)">审批通过</a-button>
              <a-button type="text" size="small" v-if="record.status === 'pending_approval'" @click="rejectOne(record)">驳回</a-button>
              <a-dropdown v-if="record.versions && record.versions.length > 1">
                <a-button type="text" size="small">
                  历史版本
                  <IconDown />
                </a-button>
                <template #content>
                  <a-doption 
                    v-for="version in record.versions" 
                    :key="version.version"
                    @click="viewVersion(record, version.version)"
                  >
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
              <a-button type="text" size="small" @click="deleteTask(record)" class="danger-btn">删除</a-button>
            </a-space>
          </template>
        </a-table>
    </div>
  </div>
  <a-modal v-model:visible="createModalVisible" title="新建画布" ok-text="确认" cancel-text="取消" @ok="confirmCreateTask">
    <a-form :model="createForm" layout="vertical">
      <a-form-item label="画布名称" field="name" required>
        <a-input v-model="createForm.name" placeholder="请输入画布名称" />
      </a-form-item>
      <a-form-item label="画布说明" field="description">
        <a-input v-model="createForm.description" placeholder="请输入画布说明" />
      </a-form-item>
    </a-form>
  </a-modal>
  <a-modal v-model:visible="approvalModalVisible" title="提交审批" ok-text="确认提交" cancel-text="取消" @ok="confirmSubmitApproval">
    <a-form :model="approvalForm" layout="vertical">
      <a-form-item label="版本说明" field="remark">
        <a-textarea v-model="approvalForm.remark" placeholder="请输入版本说明" :max-length="300" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>
  <a-modal v-model:visible="batchApprovalModalVisible" title="批量提交审批" ok-text="提交" cancel-text="取消" @ok="confirmBatchSubmitApproval">
    <a-form :model="batchApprovalForm" layout="vertical">
      <a-form-item label="统一版本说明" field="remark">
        <a-textarea v-model="batchApprovalForm.remark" placeholder="请输入统一版本说明（应用于所有选中项）" :max-length="300" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>
</div>
</template>

<script setup>
/*
用途：营销任务入口页（列表与导航）
说明：负责任务列表展示、数据来源（TaskStorage）、路由跳转到画布页的查看/编辑模式。
边界：不直接操作画布数据；删除/发布等操作通过 TaskStorage 与后续页面处理。
副作用：路由跳转与消息提示。
*/
import { ref, reactive, onMounted, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconDown, IconRefresh } from '@arco-design/web-vue/es/icon'
import { TaskStorage } from '../../../utils/taskStorage.js'
import { validateForPublish } from './horizontal/persistence/PersistenceService.ts'

const router = useRouter()
const createModalVisible = ref(false)
const createForm = reactive({ name: '', description: '' })

// 表格列定义
const columns = [
  {
    title: '任务名称',
    dataIndex: 'taskName',
    width: 200,
    render: ({ record }) => {
      return h('a', {
        class: 'task-name-link',
        onClick: () => viewTask(record)
      }, record.taskName)
    }
  },
  {
    title: '任务类型',
    dataIndex: 'taskType',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '当前版本',
    dataIndex: 'version',
    width: 100,
    render: ({ record }) => `v${record.version || 1}`
  },
  {
    title: '发布校验',
    dataIndex: 'publishReady',
    slotName: 'publishCheck',
    width: 140
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160
  },
  {
    title: '执行时间',
    dataIndex: 'executeTime',
    width: 160
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 100
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 280,
    fixed: 'right'
  }
]

// 任务数据
const taskData = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 初始化数据
const initData = () => {
  console.log('🔄 [TaskList] 开始加载任务列表数据')
  
  // 从本地存储获取所有任务
  const storedTasks = TaskStorage.getAllTasks()
  console.log('📦 [TaskList] 从本地存储加载的任务:', storedTasks)
  
  // 转换本地存储的任务格式以匹配列表显示
  const convertedStoredTasks = storedTasks.map(task => ({
    id: task.id,
    taskName: task.name || '未命名任务',
    taskType: task.type || '未分类',
    status: task.status || 'draft',
    version: task.version || 1,
    createTime: task.createTime || new Date().toLocaleString('zh-CN'),
    executeTime: task.executeTime || '-',
    creator: task.creator || '当前用户',
    description: task.description || '',
    versions: task.versions || [
      { version: task.version || 1, createTime: task.createTime || new Date().toLocaleString('zh-CN'), isActive: task.status === 'running' }
    ],
    canvasData: task.canvasData || { nodes: [], connections: [] },
    publishReady: (() => { try { const v = (task.versions || []).find(x => Number(x.version) === Number(task.version || 1)); return !!(v && v.publishReady === true) } catch { return false } })(),
    publishMessages: (() => { try { const v = (task.versions || []).find(x => Number(x.version) === Number(task.version || 1)); return Array.isArray(v?.publishMessages) ? v.publishMessages : [] } catch { return [] } })(),
    approvalStatus: (() => { try { const v = (task.versions || []).find(x => Number(x.version) === Number(task.version || 1)); return v?.approvalStatus || null } catch { return null } })()
  }))
  
  // 仅使用本地存储任务数据
  const allTasks = convertedStoredTasks
  
  console.log('✅ [TaskList] 任务列表数据加载完成:', {
    storedTasksCount: convertedStoredTasks.length,
    mockTasksCount: 0,
    totalTasksCount: allTasks.length
  })
  
  taskData.value = allTasks
  pagination.total = allTasks.length
  
  // 显示存储统计
  const stats = TaskStorage.getStorageStats()
  console.log('📈 [TaskList] 存储统计:', stats)
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'blue',
    running: 'green',
    completed: 'green',
    disabled: 'red',
    published: 'green',
    pending_approval: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    running: '运行中',
    completed: '已完成',
    disabled: '停用',
    published: '已发布',
    pending_approval: '待审批',
    approved: '已审批',
    rejected: '已驳回'
  }
  return textMap[status] || '未知'
}

function displayStatus(record) {
  // 业务优先：published/running/disabled/completed
  if (['published','running','disabled','completed'].includes(String(record.status))) return record.status
  // 草稿态根据审批状态覆盖显示
  const a = String(record.approvalStatus || '')
  if (a === 'pending_approval') return 'pending_approval'
  if (a === 'approved') return 'approved'
  if (a === 'rejected') return 'rejected'
  return record.status || 'draft'
}

function openCreateModal() {
  createModalVisible.value = true
}

function confirmCreateTask() {
  const name = (createForm.name || '').trim()
  if (!name) { Message.error('请输入画布名称'); return }
  try {
    const saved = TaskStorage.createTask({
      name,
      description: (createForm.description || '').trim(),
      version: 1,
      type: 'marketing',
      status: 'draft',
      canvasData: { nodes: [], connections: [] },
      createTime: new Date().toLocaleString('zh-CN'),
      creator: '当前用户'
    })
    createModalVisible.value = false
    createForm.name = ''
    createForm.description = ''
    if (saved && saved.id) {
      router.push(`/marketing/tasks/horizontal?mode=edit&id=${saved.id}&version=${saved.version || 1}`)
    } else {
      router.push('/marketing/tasks/horizontal')
    }
  } catch (e) {
    Message.error('创建任务失败')
  }
}

const selectedRowKeys = ref([])
const rowSelection = reactive({ type: 'checkbox', selectedRowKeys, onChange: (keys) => { selectedRowKeys.value = keys } })
const canBatchApprove = computed(() => {
  const ids = new Set(selectedRowKeys.value)
  const rows = taskData.value.filter(r => ids.has(r.id))
  return rows.some(r => r.status === 'pending_approval')
})

const canBatchSubmitApproval = computed(() => {
  const ids = new Set(selectedRowKeys.value)
  const rows = taskData.value.filter(r => ids.has(r.id))
  return rows.some(r => r.status === 'draft' && r.publishReady === true)
})

const approvalModalVisible = ref(false)
const approvalForm = reactive({ remark: '' })
let approvalTarget = { id: null, version: null }
function openSubmitApprovalModal(record) {
  if (record.publishReady !== true) { Message.warning('当前版本未通过发布校验'); return }
  try {
    const canvas = TaskStorage.getTaskVersionCanvas(record.id, record.version)
    const v = validateForPublish(null, canvas)
    if (!v.pass) { Message.warning('数据校验未通过，请前往画布修复'); return }
  } catch {}
  approvalTarget = { id: record.id, version: record.version }
  approvalForm.remark = record.description || ''
  approvalModalVisible.value = true
}
function confirmSubmitApproval() {
  try {
    const { id, version } = approvalTarget
    if (!id || !version) return
    if (!approvalForm.remark || !approvalForm.remark.trim()) { Message.warning('请输入版本说明'); return }
    TaskStorage.updateTask(id, { version, description: approvalForm.remark, updateTime: new Date().toLocaleString('zh-CN') })
    TaskStorage.submitApproval(id, version, '当前用户', approvalForm.remark)
    approvalModalVisible.value = false
    refreshTaskList()
    Message.success('已提交审批')
  } catch { Message.error('提交审批失败') }
}

function approveOne(record) {
  try {
    TaskStorage.approveVersions([{ id: record.id, version: record.version }], 'approve', '当前用户', '')
    refreshTaskList()
    Message.success('已审批通过')
  } catch { Message.error('审批失败') }
}

function rejectOne(record) {
  try {
    TaskStorage.approveVersions([{ id: record.id, version: record.version }], 'reject', '当前用户', '')
    refreshTaskList()
    Message.success('已驳回')
  } catch { Message.error('驳回失败') }
}

function batchApprove(decision) {
  try {
    const ids = new Set(selectedRowKeys.value)
    const rows = taskData.value.filter(r => ids.has(r.id) && r.status === 'pending_approval')
    const items = rows.map(r => ({ id: r.id, version: r.version }))
    const res = TaskStorage.approveVersions(items, decision, '当前用户', '')
    const ok = res.filter(x => x.status === 'success').length
    const fail = res.length - ok
    refreshTaskList()
    selectedRowKeys.value = []
    if (fail === 0) Message.success(`成功${ok}条`)
    else Message.info(`成功${ok}条，失败${fail}条`)
  } catch { Message.error('批量审批失败') }
}

function batchSubmitApproval() {
  const ids = new Set(selectedRowKeys.value)
  const rows = taskData.value.filter(r => ids.has(r.id) && r.status === 'draft' && r.publishReady === true)
  if (!rows.length) { Message.info('未选择可提交审批的任务'); return }
  batchApprovalForm.remark = ''
  batchApprovalModalVisible.value = true
}

const batchApprovalModalVisible = ref(false)
const batchApprovalForm = reactive({ remark: '' })
function confirmBatchSubmitApproval() {
  try {
    if (!batchApprovalForm.remark || !batchApprovalForm.remark.trim()) { Message.warning('请输入统一版本说明'); return }
    const ids = new Set(selectedRowKeys.value)
    const rows = taskData.value.filter(r => ids.has(r.id) && r.status === 'draft' && r.publishReady === true).filter(r => {
      try {
        const canvas = TaskStorage.getTaskVersionCanvas(r.id, r.version)
        const v = validateForPublish(null, canvas)
        return v.pass
      } catch { return false }
    })
    rows.forEach(r => {
      try {
        TaskStorage.updateTask(r.id, { version: r.version, description: batchApprovalForm.remark, updateTime: new Date().toLocaleString('zh-CN') })
        TaskStorage.submitApproval(r.id, r.version, '当前用户', batchApprovalForm.remark)
      } catch {}
    })
    batchApprovalModalVisible.value = false
    refreshTaskList()
    selectedRowKeys.value = []
    Message.success(`已提交审批：${rows.length}条`)
  } catch { Message.error('批量提交审批失败') }
}
// 用途：查看任务（点击任务名称）
// 入参：record 任务记录
// 返回：无
// 边界：需存在 id/version 字段
// 副作用：路由跳转到查看模式
// 查看任务（点击任务名称）
const viewTask = (record) => {
  router.push(`/marketing/tasks/horizontal?mode=view&id=${record.id}&version=${record.version}`)
}

// 用途：编辑任务
// 入参：record 任务记录
// 返回：无
// 边界：需存在 id/version 字段
// 副作用：路由跳转到编辑模式
// 编辑任务
const editTask = (record) => {
  try {
    if (record.status === 'published') {
      const baseVer = Number(record.version || 1)
      const newVer = baseVer + 1
      const canvas = TaskStorage.getTaskVersionCanvas(record.id, baseVer) || record.canvasData || { nodes: [], connections: [] }
      TaskStorage.updateTask(record.id, { version: newVer, status: 'draft', canvasData: canvas, updateTime: new Date().toLocaleString('zh-CN') })
      router.push(`/marketing/tasks/horizontal?mode=edit&id=${record.id}&version=${newVer}`)
    } else {
      router.push(`/marketing/tasks/horizontal?mode=edit&id=${record.id}&version=${record.version}`)
    }
  } catch {
    router.push(`/marketing/tasks/horizontal?mode=edit&id=${record.id}&version=${record.version}`)
  }
}

// 查看历史版本
const viewVersion = (record, version) => {
  router.push(`/marketing/tasks/horizontal?mode=view&id=${record.id}&version=${version}`)
}

// 手工推送任务
const manualPush = (record) => {
  console.log('手工推送任务:', record)
  if (record.status === 'draft') {
    record.status = 'running'
  }
  Message.success('任务推送成功')
}

// 查看执行日志
const viewExecutionLog = (record) => {
  console.log('查看执行日志:', record)
  Message.info('执行日志功能开发中...')
}

// 停止任务
const stopTask = (record) => {
  console.log('停止任务:', record)
  record.status = 'disabled'
  Message.success('任务已停止')
}

// 删除任务
const deleteTask = (record) => {
  console.log('🗑️ [TaskList] 删除任务:', record)
  
  try {
    // 从本地存储删除任务
    const success = TaskStorage.deleteTask(record.id)
    
    if (success) {
      // 从当前列表中移除任务
      const index = taskData.value.findIndex(task => task.id === record.id)
      if (index > -1) {
        taskData.value.splice(index, 1)
        pagination.total = taskData.value.length
      }
      
      Message.success('任务删除成功')
      console.log('✅ [TaskList] 任务删除成功:', record.id)
      
      // 显示更新后的存储统计
      const stats = TaskStorage.getStorageStats()
      console.log('📈 [TaskList] 删除后存储统计:', stats)
    } else {
      // 如果是模拟数据（ID 1-4），提示无法删除
      if (record.id >= 1 && record.id <= 4) {
        Message.warning('示例任务无法删除')
      } else {
        Message.error('任务删除失败')
      }
    }
  } catch (error) {
    console.error('❌ [TaskList] 删除任务失败:', error)
    Message.error('删除任务时发生错误')
  }
}

// 分页变化
const onPageChange = (page) => {
  pagination.current = page
  console.log('页码变化:', page)
}

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  console.log('页大小变化:', pageSize)
}

// 刷新任务列表
const refreshTaskList = () => {
  console.log('🔄 [TaskList] 刷新任务列表')
  initData()
  Message.success('任务列表已刷新')
}

// 组件挂载
onMounted(() => {
  initData()
})
</script>

<style scoped>
.marketing-tasks-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 页面头部样式 */
.page-header {
  background: #fff;
  border-bottom: 1px solid #f2f3f5;
  padding: 16px 24px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #86909c;
}

/* 内容卡片样式 */
.content-card {
  flex: 1;
  margin: 16px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.task-section {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.task-filters {
  margin-bottom: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
}

/* 表格样式优化 */
:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 500;
  padding: 10px 12px;
  font-size: 13px;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f2f3f5;
  padding: 10px 12px;
}

:deep(.arco-table-tbody .arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

/* 按钮样式 */
:deep(.arco-btn-primary) {
  background-color: #165dff;
  border-color: #165dff;
}

:deep(.arco-btn-primary:hover) {
  background-color: #4080ff;
  border-color: #4080ff;
}

/* 任务名称链接样式 */
.task-name-link {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s ease;
}

.task-name-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 版本选项样式 */
.version-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.version-time {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.danger-btn {
  color: #f53f3f;
}

.danger-btn:hover {
  background-color: #ffece8;
  color: #f53f3f;
}
</style>
