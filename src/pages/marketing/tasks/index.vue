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
          <a-button type="primary" @click="createTask">
            <template #icon>
              <icon-plus />
            </template>
            新建任务
          </a-button>
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
              <a-button type="text" size="small" @click="editTask(record)" v-if="record.status === 'draft'">编辑</a-button>
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
import { IconPlus, IconDown } from '@arco-design/web-vue/es/icon'

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
  // 模拟任务数据
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
          { id: 'ab-test', type: 'ab-test', x: 150, y: 300, label: 'AB实验' },
          { id: 'manual-call-1', type: 'manual-call', x: 100, y: 400, label: '人工电销A组' },
          { id: 'manual-call-2', type: 'manual-call', x: 200, y: 400, label: '人工电销B组' },
          { id: 'end', type: 'end', x: 150, y: 500, label: '结束' }
        ],
        connections: [
          { source: 'start', target: 'crowd-split' },
          { source: 'crowd-split', target: 'blacklist-end', label: '命中黑名单' },
          { source: 'crowd-split', target: 'ab-test', label: '未命中黑名单' },
          { source: 'ab-test', target: 'manual-call-1', label: 'A组' },
          { source: 'ab-test', target: 'manual-call-2', label: 'B组' },
          { source: 'manual-call-1', target: 'end' },
          { source: 'manual-call-2', target: 'end' }
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
      ]
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
  
  taskData.value = mockTasks
  pagination.total = mockTasks.length
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'blue',
    running: 'green',
    completed: 'green',
    disabled: 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    running: '运行中',
    completed: '已完成',
    disabled: '停用'
  }
  return textMap[status] || '未知'
}

// 创建任务
const createTask = () => {
  router.push('/marketing/tasks/editor?mode=create')
}

// 查看任务（点击任务名称）
const viewTask = (record) => {
  router.push(`/marketing/tasks/editor?mode=view&id=${record.id}&version=${record.version}`)
}

// 编辑任务
const editTask = (record) => {
  router.push(`/marketing/tasks/editor?mode=edit&id=${record.id}&version=${record.version}`)
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
  console.log('删除任务:', record)
  Message.warning('删除任务功能开发中...')
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