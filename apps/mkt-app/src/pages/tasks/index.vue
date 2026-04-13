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
            <a-button type="primary" @click="createTask">
              <template #icon>
                <IconPlus />
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
            <StatusTag :status="record.status" dictKey="marketingTask" />
          </template>
          <template #createTime="{ record }">
            {{ DateUtils.formatDateTime(record.createTime) }}
          </template>
          <template #executeTime="{ record }">
            {{ record.executeTime && record.executeTime !== '-' ? DateUtils.formatDateTime(record.executeTime) : '-' }}
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="editTask(record)" v-if="record.status === 'draft' || record.status === 'published'">编辑</a-button>
              <a-button 
                v-if="record.versions && record.versions.length > 0"
                type="text" 
                size="small"
                @click="showHistory(record)"
              >
                历史版本
              </a-button>
              <a-button type="text" size="small" @click="manualPush(record)" v-if="record.status === 'draft' || record.status === 'running'">手工推送</a-button>
              <a-button type="text" size="small" @click="viewExecutionLog(record)" v-if="record.status === 'running' || record.status === 'completed'">执行日志</a-button>
              <a-button type="text" size="small" @click="stopTask(record)" v-if="record.status === 'running'">停止</a-button>
              <a-button type="text" size="small" @click="deleteTask(record)" class="danger-btn">删除</a-button>
            </a-space>
          </template>
        </a-table>
      </div>
    </div>
    <!-- 历史版本弹窗 -->
    <a-modal v-model:visible="historyVisible" title="历史版本" width="800px" :footer="false" class="history-modal">
      <div class="history-modal-content">
        <div class="version-list">
          <div 
            v-for="ver in currentTaskVersions" 
            :key="ver.version" 
            class="version-item"
            :class="{ active: selectedVersionId === ver.version }"
            @click="selectVersion(ver)"
          >
            <div class="version-info">
              <span class="version-tag">v{{ ver.version }}</span>
              <span class="version-time">{{ ver.createTime }}</span>
            </div>
            <div class="version-status">
              <a-tag v-if="ver.isActive" color="green" size="small">运行中</a-tag>
              <a-tag v-else-if="ver.isDraft" color="orange" size="small">草稿</a-tag>
              <a-tag v-else color="gray" size="small">已归档</a-tag>
            </div>
          </div>
        </div>
        <div class="version-detail" v-if="selectedVersionData">
          <div class="detail-header">
            <h3>版本 v{{ selectedVersionData.version }}</h3>
            <span class="detail-status">
              <a-tag v-if="selectedVersionData.isActive" color="green">运行中</a-tag>
              <a-tag v-else-if="selectedVersionData.isDraft" color="orange">草稿</a-tag>
              <a-tag v-else color="gray">已归档</a-tag>
            </span>
          </div>
          
          <div class="detail-info-grid">
            <div class="info-item">
              <span class="label">修改时间：</span>
              <span class="value">{{ selectedVersionData.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">修改人：</span>
              <span class="value">{{ selectedVersionData.creator || '未知' }}</span>
            </div>
          </div>

          <div class="detail-desc">
            <div class="desc-label">版本说明：</div>
            <p>{{ selectedVersionData.description || '暂无描述' }}</p>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { TaskStorage } from '../../utils/taskStorage.js'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'

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

// 历史版本相关状态
const historyVisible = ref(false)
const currentHistoryTask = ref(null)
const selectedVersionId = ref(null)
const currentTaskVersions = ref([])
const selectedVersionData = computed(() => 
  currentTaskVersions.value.find(v => v.version === selectedVersionId.value)
)

// 显示历史版本弹窗
const showHistory = (record) => {
  currentHistoryTask.value = record
  // 模拟版本详细数据（实际应从接口获取）
  // 确保同一时间只有1个草稿状态的画布和1个进行中的策略
  // 这里的逻辑主要是为了展示效果，mock数据中通常只有一个running
  
  const versions = (record.versions || []).map(v => {
    // 简单模拟不同版本的画布数据差异
    // 实际项目中每个版本应该有独立的canvasData
    const versionCanvasData = JSON.parse(JSON.stringify(record.canvasData || { nodes: [], connections: [] }))
    
    // 为了演示效果，稍微修改一下旧版本的节点位置或数量
    if (v.version < record.version) {
      if (versionCanvasData.nodes.length > 2) {
        versionCanvasData.nodes.pop() // 旧版本少一个节点
        // 移除相关的连线
        versionCanvasData.connections = versionCanvasData.connections.filter(c => 
          versionCanvasData.nodes.some(n => n.id === c.source) && 
          versionCanvasData.nodes.some(n => n.id === c.target)
        )
      }
    }

    return {
      ...v,
      description: v.description || `这是版本 v${v.version} 的详细描述信息，记录了该版本的变更内容和策略调整。`,
      // 根据 isActive 判断状态，如果没有 isActive 属性，默认非最新版本为 archived
      status: v.isActive ? 'running' : (v.version === record.version && record.status === 'draft' ? 'draft' : 'archived'),
      isDraft: v.version === record.version && record.status === 'draft',
      isActive: v.isActive,
      creator: record.creator,
      canvasData: versionCanvasData
    }
  })
  
  // 按版本号倒序排列
  currentTaskVersions.value = versions.sort((a, b) => b.version - a.version)
  
  if (versions.length > 0) {
    selectedVersionId.value = versions[0].version
  }
  historyVisible.value = true
}

// 选择版本
const selectVersion = (ver) => {
  selectedVersionId.value = ver.version
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

/* 历史版本弹窗样式 */
.history-modal-content {
  display: flex;
  height: 500px;
  border: 1px solid #f2f3f5;
  border-radius: 4px;
}

.version-list {
  width: 240px;
  border-right: 1px solid #f2f3f5;
  overflow-y: auto;
  background-color: #f7f8fa;
}

.version-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f2f3f5;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.version-item:hover {
  background-color: #e6f7ff;
}

.version-item.active {
  background-color: #e6f7ff;
  border-right: 2px solid #165dff;
}

.version-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-tag {
  font-weight: 600;
  color: #1d2129;
}

.version-time {
  font-size: 12px;
  color: #86909c;
}

.version-status {
  display: flex;
  justify-content: flex-start;
}

.version-detail {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.detail-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 13px;
  color: #86909c;
}

.info-item .value {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.detail-desc {
  background-color: #f7f8fa;
  border-radius: 4px;
  padding: 16px;
  flex: 1;
}

.detail-desc .desc-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.detail-desc p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4e5969;
  white-space: pre-wrap;
}
</style>
