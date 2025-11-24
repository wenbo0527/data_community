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
                <icon-refresh />
              </template>
              刷新
            </a-button>
            <a-button type="primary" @click="createTask">
              <template #icon>
                <icon-plus />
              </template>
              新建任务
            </a-button>
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
          @page-change="onPageChange"
          @page-size-change="onPageSizeChange"
        >
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="editTask(record)" v-if="record.status === 'draft' || record.status === 'published'">编辑</a-button>
              <a-dropdown v-if="record.versions && record.versions.length > 1">
                <a-button type="text" size="small">
                  历史版本
                  <icon-down />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconDown, IconRefresh } from '@arco-design/web-vue/es/icon'
import { TaskStorage } from '../../../utils/taskStorage.js'

const router = useRouter()

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
  
  // 模拟任务数据（作为示例数据）
  const mockTasks = [
    {
      id: 1,
      taskName: '消费贷促实名认证活动',
      taskType: '促实名',
      status: 'running',
      version: 2,
      createTime: '2024-01-15 10:30:00',
      executeTime: '2024-01-15 14:00:00',
      creator: '张三',
      versions: [
        { version: 1, createTime: '2024-01-15 10:30:00', isActive: false },
        { version: 2, createTime: '2024-01-16 14:20:00', isActive: true }
      ],
      canvasData: {
        nodes: [
          { id: 'start', type: 'start', x: 100, y: 100, label: '开始' },
          { id: 'crowd-split', type: 'crowd-split', x: 100, y: 200, label: '人群分流' },
          { id: 'blacklist-end', type: 'end', x: 50, y: 300, label: '黑名单结束' },
          { id: 'sms-send', type: 'sms', x: 150, y: 300, label: '短信发送' },
          { id: 'event-split', type: 'event-split', x: 150, y: 400, label: '短信发送成功事件分流' },
          { id: 'high-response', type: 'manual-call', x: 100, y: 500, label: '高响应客群电销' },
          { id: 'medium-response', type: 'push', x: 200, y: 500, label: '中响应客群推送' },
          { id: 'low-response', type: 'email', x: 300, y: 500, label: '低响应客群邮件' },
          { id: 'end', type: 'end', x: 200, y: 600, label: '结束' }
        ],
        connections: [
          { source: 'start', target: 'crowd-split' },
          { source: 'crowd-split', target: 'blacklist-end', label: '黑名单' },
          { source: 'crowd-split', target: 'sms-send', label: '高响应客群' },
          { source: 'crowd-split', target: 'sms-send', label: '中响应客群' },
          { source: 'crowd-split', target: 'sms-send', label: '低响应客群' },
          { source: 'sms-send', target: 'event-split' },
          { source: 'event-split', target: 'high-response', label: '短信发送成功' },
          { source: 'event-split', target: 'medium-response', label: '短信发送失败' },
          { source: 'high-response', target: 'end' },
          { source: 'medium-response', target: 'end' },
          { source: 'low-response', target: 'end' }
        ]
      }
    },
    {
      id: 2,
      taskName: '消费贷促授信额度提升',
      taskType: '促授信',
      status: 'running',
      version: 1,
      createTime: '2024-01-14 09:15:00',
      executeTime: '2024-01-14 10:00:00',
      creator: '李四',
      versions: [
        { version: 1, createTime: '2024-01-14 09:15:00', isActive: true }
      ],
      canvasData: {
        nodes: [
          { id: 'start', type: 'start', x: 100, y: 100, label: '开始' },
          { id: 'crowd-split', type: 'crowd-split', x: 100, y: 200, label: '人群分流' },
          { id: 'blacklist-end', type: 'end', x: 50, y: 300, label: '黑名单结束' },
          { id: 'app-push', type: 'push', x: 150, y: 300, label: 'APP推送' },
          { id: 'event-split', type: 'event-split', x: 150, y: 400, label: 'APP热场景事件分流' },
          { id: 'hot-scene-follow', type: 'manual-call', x: 100, y: 500, label: '热场景跟进' },
          { id: 'normal-follow', type: 'email', x: 200, y: 500, label: '常规跟进' },
          { id: 'end', type: 'end', x: 150, y: 600, label: '结束' }
        ],
        connections: [
          { source: 'start', target: 'crowd-split' },
          { source: 'crowd-split', target: 'blacklist-end', label: '黑名单' },
          { source: 'crowd-split', target: 'app-push', label: '高响应客群' },
          { source: 'crowd-split', target: 'app-push', label: '中响应客群' },
          { source: 'app-push', target: 'event-split' },
          { source: 'event-split', target: 'hot-scene-follow', label: 'APP热场景触发' },
          { source: 'event-split', target: 'normal-follow', label: '未触发热场景' },
          { source: 'hot-scene-follow', target: 'end' },
          { source: 'normal-follow', target: 'end' }
        ]
      }
    },
    {
      id: 3,
      taskName: '消费贷促支用激活推广',
      taskType: '促支用',
      status: 'draft',
      version: 1,
      createTime: '2024-01-16 16:20:00',
      executeTime: '-',
      creator: '王五',
      versions: [
        { version: 1, createTime: '2024-01-16 16:20:00', isActive: false }
      ]
    },
    {
      id: 4,
      taskName: '消费贷促实名用户回访',
      taskType: '促实名',
      status: 'disabled',
      version: 1,
      createTime: '2024-01-13 08:45:00',
      executeTime: '2024-01-13 12:00:00',
      creator: '赵六',
      versions: [
        { version: 1, createTime: '2024-01-13 08:45:00', isActive: false }
      ]
    }
  ]
  
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
    versions: task.versions || [
      { version: task.version || 1, createTime: task.createTime || new Date().toLocaleString('zh-CN'), isActive: task.status === 'running' }
    ],
    canvasData: task.canvasData || { nodes: [], connections: [] }
  }))
  
  // 合并数据：本地存储的任务优先，避免ID冲突
  const existingIds = new Set(convertedStoredTasks.map(task => task.id))
  const filteredMockTasks = mockTasks.filter(task => !existingIds.has(task.id))
  
  const allTasks = [...convertedStoredTasks, ...filteredMockTasks]
  
  console.log('✅ [TaskList] 任务列表数据加载完成:', {
    storedTasksCount: convertedStoredTasks.length,
    mockTasksCount: filteredMockTasks.length,
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
    published: 'green'
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
    published: '已发布'
  }
  return textMap[status] || '未知'
}

// 创建任务
const createTask = () => {
  router.push('/marketing/tasks/horizontal')
}

// 查看任务（点击任务名称）
const viewTask = (record) => {
  router.push(`/marketing/tasks/horizontal?mode=view&id=${record.id}&version=${record.version}`)
}

// 编辑任务
const editTask = (record) => {
  router.push(`/marketing/tasks/horizontal?mode=edit&id=${record.id}&version=${record.version}`)
}

// 查看历史版本
const viewVersion = (record, version) => {
  router.push(`/marketing/tasks/editor?mode=view&id=${record.id}&version=${version}`)
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