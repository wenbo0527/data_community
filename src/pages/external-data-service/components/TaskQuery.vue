<template>
  <div class="task-query">
    <!-- 搜索筛选 -->
    <a-card class="search-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input v-model="searchForm.taskId" placeholder="任务编号" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-select v-model="searchForm.taskType" placeholder="任务类型" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="data-sync">数据同步</a-option>
            <a-option value="data-processing">数据处理</a-option>
            <a-option value="data-analysis">数据分析</a-option>
            <a-option value="report-generation">报表生成</a-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-select v-model="searchForm.status" placeholder="任务状态" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="pending">待执行</a-option>
            <a-option value="running">运行中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="failed">已失败</a-option>
            <a-option value="cancelled">已取消</a-option>
          </a-select>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="8">
          <a-input v-model="searchForm.applicationId" placeholder="关联申请编号" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-range-picker v-model="searchForm.dateRange" style="width: 100%" />
        </a-col>
        <a-col :span="8">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 任务列表 -->
    <a-card class="list-card">
      <div class="list-header">
        <h3>任务查询列表</h3>
        <a-space>
          <a-button type="outline" @click="batchStart">
            <template #icon><icon-play-circle /></template>
            批量启动
          </a-button>
          <a-button type="outline" @click="batchStop">
            <template #icon><icon-pause-circle /></template>
            批量停止
          </a-button>
          <a-button type="outline" @click="batchRetry">
            <template #icon><icon-refresh /></template>
            批量重试
          </a-button>
        </a-space>
      </div>
      
      <a-table
        :data="taskList"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="任务编号" data-index="taskId" width="120">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.taskId }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="任务类型" data-index="taskType" width="100">
            <template #cell="{ record }">
              <a-tag :color="getTaskTypeColor(record.taskType)">
                {{ getTaskTypeText(record.taskType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联申请" data-index="applicationId" width="120">
            <template #cell="{ record }">
              <a-link @click="showApplicationDetail(record)">{{ record.applicationId }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="任务描述" data-index="description" ellipsis />
          <a-table-column title="任务状态" data-index="status" width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="执行进度" data-index="progress" width="120">
            <template #cell="{ record }">
              <a-progress 
                :percent="record.progress" 
                :status="getProgressStatus(record.status)"
                size="small"
              />
            </template>
          </a-table-column>
          <a-table-column title="开始时间" data-index="startTime" width="160" />
          <a-table-column title="结束时间" data-index="endTime" width="160" />
          <a-table-column title="执行时长" data-index="duration" width="100">
            <template #cell="{ record }">
              <span :style="{ color: getDurationColor(record.duration) }">
                {{ record.duration }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="操作" width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button 
                  v-if="record.status === 'pending'" 
                  type="text" 
                  size="small" 
                  @click="startTask(record)"
                >
                  启动
                </a-button>
                <a-button 
                  v-if="record.status === 'running'" 
                  type="text" 
                  size="small" 
                  @click="stopTask(record)"
                >
                  停止
                </a-button>
                <a-button 
                  v-if="['failed', 'cancelled'].includes(record.status)" 
                  type="text" 
                  size="small" 
                  @click="retryTask(record)"
                >
                  重试
                </a-button>
                <a-button type="text" size="small" @click="showTaskLog(record)">
                  日志
                </a-button>
                <a-button 
                  type="text" 
                  status="danger" 
                  size="small" 
                  @click="deleteTask(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 任务详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="任务执行详情"
      width="800px"
      :footer="false"
    >
      <div class="detail-content" v-if="currentRecord">
        <a-descriptions :data="detailData" :column="2" bordered />
        
        <div class="detail-actions" style="margin-top: 24px; text-align: center;">
          <a-space>
            <a-button 
              v-if="currentRecord.status === 'pending'" 
              type="primary" 
              @click="startTask(currentRecord)"
            >
              启动任务
            </a-button>
            <a-button 
              v-if="currentRecord.status === 'running'" 
              status="danger" 
              @click="stopTask(currentRecord)"
            >
              停止任务
            </a-button>
            <a-button 
              v-if="['failed', 'cancelled'].includes(currentRecord.status)" 
              @click="retryTask(currentRecord)"
            >
              重试任务
            </a-button>
            <a-button @click="showDetailModal = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 任务日志弹窗 -->
    <a-modal
      v-model:visible="showLogModal"
      title="任务执行日志"
      width="800px"
      :footer="false"
    >
      <div class="log-content">
        <div class="log-container">
          <div v-for="(log, index) in currentTaskLogs" :key="index" class="log-item">
            <span class="log-time">{{ log.timestamp }}</span>
            <span class="log-level" :style="{ color: getLogLevelColor(log.level) }">
              [{{ log.level }}]
            </span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
        <div style="text-align: center; margin-top: 16px;">
          <a-button @click="showLogModal = false">关闭</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconSearch,
  IconRefresh,
  IconPlayCircle,
  IconPauseCircle,
  IconDelete
} from '@arco-design/web-vue/es/icon'

// 搜索表单
const searchForm = reactive({
  taskId: '',
  taskType: '',
  status: '',
  applicationId: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const taskList = ref([
  {
    id: '1',
    taskId: 'TASK2024001',
    taskType: 'data-sync',
    applicationId: 'APP2024001',
    description: '同步用户行为数据到分析平台',
    status: 'running',
    progress: 65,
    startTime: '2024-01-15 10:30:00',
    endTime: '2024-01-15 11:30:00',
    duration: '00:45:30',
    errorMessage: '',
    executor: 'system-1'
  },
  {
    id: '2',
    taskId: 'TASK2024002',
    taskType: 'data-processing',
    applicationId: 'APP2024002',
    description: '处理历史交易数据，生成月度报表',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-14 14:00:00',
    endTime: '2024-01-14 14:45:00',
    duration: '00:45:00',
    errorMessage: '',
    executor: 'system-2'
  },
  {
    id: '3',
    taskId: 'TASK2024003',
    taskType: 'data-analysis',
    applicationId: 'APP2024003',
    description: '分析用户留存率，找出流失原因',
    status: 'failed',
    progress: 30,
    startTime: '2024-01-13 09:00:00',
    endTime: '2024-01-13 09:15:00',
    duration: '00:15:00',
    errorMessage: '数据源连接失败',
    executor: 'system-3'
  },
  {
    id: '4',
    taskId: 'TASK2024004',
    taskType: 'report-generation',
    applicationId: 'APP2024004',
    description: '生成业务运营月度报告',
    status: 'pending',
    progress: 0,
    startTime: '',
    endTime: '',
    duration: '00:00:00',
    errorMessage: '',
    executor: 'system-4'
  },
  {
    id: '5',
    taskId: 'TASK2024005',
    taskType: 'data-sync',
    applicationId: 'APP2024005',
    description: '同步供应商数据到采购系统',
    status: 'cancelled',
    progress: 45,
    startTime: '2024-01-12 16:00:00',
    endTime: '2024-01-12 16:20:00',
    duration: '00:20:00',
    errorMessage: '用户手动取消',
    executor: 'system-5'
  }
])

// 分页配置
const pagination = reactive({
  total: 5,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 行选择
const selectedRows = ref([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onSelect: (rowKeys) => {
    selectedRows.value = rowKeys
  }
})

// 详情弹窗
const showDetailModal = ref(false)
const currentRecord = ref(null)

// 日志弹窗
const showLogModal = ref(false)
const currentTaskLogs = ref([])

// 详情数据
const detailData = computed(() => {
  if (!currentRecord.value) return []
  return [
    { label: '任务编号', value: currentRecord.value.taskId },
    { label: '任务类型', value: getTaskTypeText(currentRecord.value.taskType) },
    { label: '关联申请', value: currentRecord.value.applicationId },
    { label: '任务描述', value: currentRecord.value.description },
    { label: '任务状态', value: getStatusText(currentRecord.value.status) },
    { label: '执行进度', value: `${currentRecord.value.progress}%` },
    { label: '开始时间', value: currentRecord.value.startTime || '未开始' },
    { label: '结束时间', value: currentRecord.value.endTime || '未结束' },
    { label: '执行时长', value: currentRecord.value.duration },
    { label: '执行器', value: currentRecord.value.executor },
    { label: '错误信息', value: currentRecord.value.errorMessage || '无' }
  ]
})

// 任务日志数据
const taskLogs = {
  'TASK2024001': [
    { timestamp: '2024-01-15 10:30:00', level: 'INFO', message: '任务开始执行' },
    { timestamp: '2024-01-15 10:30:05', level: 'INFO', message: '连接到数据源' },
    { timestamp: '2024-01-15 10:30:10', level: 'INFO', message: '开始数据同步' },
    { timestamp: '2024-01-15 10:35:00', level: 'INFO', message: '同步进度: 50%' },
    { timestamp: '2024-01-15 10:40:00', level: 'INFO', message: '同步进度: 65%' }
  ],
  'TASK2024002': [
    { timestamp: '2024-01-14 14:00:00', level: 'INFO', message: '任务开始执行' },
    { timestamp: '2024-01-14 14:00:05', level: 'INFO', message: '读取历史交易数据' },
    { timestamp: '2024-01-14 14:15:00', level: 'INFO', message: '数据处理完成' },
    { timestamp: '2024-01-14 14:30:00', level: 'INFO', message: '生成月度报表' },
    { timestamp: '2024-01-14 14:45:00', level: 'INFO', message: '任务执行完成' }
  ],
  'TASK2024003': [
    { timestamp: '2024-01-13 09:00:00', level: 'INFO', message: '任务开始执行' },
    { timestamp: '2024-01-13 09:00:05', level: 'INFO', message: '连接到数据源' },
    { timestamp: '2024-01-13 09:10:00', level: 'ERROR', message: '数据源连接失败' },
    { timestamp: '2024-01-13 09:15:00', level: 'ERROR', message: '任务执行失败' }
  ]
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    Message.success('搜索完成')
  }, 1000)
}

const handleReset = () => {
  Object.assign(searchForm, {
    taskId: '',
    taskType: '',
    status: '',
    applicationId: '',
    dateRange: []
  })
  handleSearch()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 显示详情
const showDetail = (record) => {
  currentRecord.value = record
  showDetailModal.value = true
}

// 显示申请详情
const showApplicationDetail = (record) => {
  Message.info(`查看申请详情: ${record.applicationId}`)
}

// 显示任务日志
const showTaskLog = (record) => {
  currentTaskLogs.value = taskLogs[record.taskId] || []
  showLogModal.value = true
}

// 任务操作
const startTask = (record) => {
  record.status = 'running'
  record.startTime = new Date().toLocaleString()
  record.progress = 0
  Message.success('任务启动成功')
}

const stopTask = (record) => {
  record.status = 'cancelled'
  record.endTime = new Date().toLocaleString()
  Message.success('任务停止成功')
}

const retryTask = (record) => {
  record.status = 'pending'
  record.progress = 0
  record.errorMessage = ''
  Message.success('任务重试成功')
}

const deleteTask = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除任务 ${record.taskId} 吗？`,
    onOk: () => {
      const index = taskList.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        taskList.value.splice(index, 1)
      }
      Message.success('任务已删除')
    }
  })
}

// 批量操作
const batchStart = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请选择要启动的任务')
    return
  }
  Message.success(`批量启动 ${selectedRows.value.length} 个任务成功`)
}

const batchStop = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请选择要停止的任务')
    return
  }
  Message.success(`批量停止 ${selectedRows.value.length} 个任务成功`)
}

const batchRetry = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请选择要重试的任务')
    return
  }
  Message.success(`批量重试 ${selectedRows.value.length} 个任务成功`)
}

// 辅助函数
const getTaskTypeColor = (type) => {
  const colors = {
    'data-sync': 'blue',
    'data-processing': 'green',
    'data-analysis': 'purple',
    'report-generation': 'cyan'
  }
  return colors[type] || 'gray'
}

const getTaskTypeText = (type) => {
  const texts = {
    'data-sync': '数据同步',
    'data-processing': '数据处理',
    'data-analysis': '数据分析',
    'report-generation': '报表生成'
  }
  return texts[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'running': 'blue',
    'completed': 'green',
    'failed': 'red',
    'cancelled': 'gray'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待执行',
    'running': '运行中',
    'completed': '已完成',
    'failed': '已失败',
    'cancelled': '已取消'
  }
  return texts[status] || status
}

const getProgressStatus = (status) => {
  const statuses = {
    'running': 'normal',
    'completed': 'success',
    'failed': 'exception',
    'cancelled': 'exception'
  }
  return statuses[status] || 'normal'
}

const getDurationColor = (duration) => {
  const hours = parseInt(duration.split(':')[0])
  if (hours > 2) return '#f53f3f'
  if (hours > 1) return '#ff5722'
  return '#00b42a'
}

const getLogLevelColor = (level) => {
  const colors = {
    'INFO': '#00b42a',
    'WARN': '#ff7d00',
    'ERROR': '#f53f3f',
    'DEBUG': '#86909c'
  }
  return colors[level] || '#86909c'
}
</script>

<style scoped lang="less">
.task-query {
  .search-card {
    margin-bottom: 16px;
    border-radius: 8px;
  }
  
  .list-card {
    border-radius: 8px;
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        font-size: 16px;
        color: var(--color-text-1);
      }
    }
  }
  
  .detail-content {
    .detail-actions {
      margin-top: 24px;
      text-align: center;
    }
  }
  
  .log-content {
    .log-container {
      max-height: 400px;
      overflow-y: auto;
      background-color: var(--color-fill-2);
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      
      .log-item {
        font-family: monospace;
        font-size: 12px;
        margin-bottom: 8px;
        display: flex;
        gap: 8px;
        
        .log-time {
          color: var(--color-text-3);
          min-width: 160px;
        }
        
        .log-level {
          min-width: 60px;
          font-weight: bold;
        }
        
        .log-message {
          flex: 1;
          color: var(--color-text-1);
        }
      }
    }
  }
}
</style>