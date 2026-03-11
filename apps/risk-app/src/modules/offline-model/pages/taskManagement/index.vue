<template>
  <div class="task-management-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="page-title">
        <h2>任务管理</h2>
        <span class="page-subtitle">管理和监控所有模型任务</span>
      </div>
      <div class="page-actions"></div>
    </div>

    <!-- 任务统计 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-loading />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.runningTasks }}</div>
                <div class="stat-label">运行中</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-check-circle />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.completedTasks }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-exclamation-circle />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.failedTasks }}</div>
                <div class="stat-label">失败</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <icon-pause-circle />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pausedTasks }}</div>
                <div class="stat-label">暂停</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="filter-section">
      <a-card>
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="任务名称">
            <a-input
              v-model="filterForm.name"
              placeholder="请输入任务名称"
              allow-clear
              @change="handleFilterChange"
            />
          </a-form-item>
          
          <a-form-item label="任务类型">
            <a-select
              v-model="filterForm.type"
              placeholder="请选择任务类型"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="training">模型训练</a-option>
              <a-option value="evaluation">模型评估</a-option>
              <a-option value="prediction">模型预测</a-option>
              <a-option value="backtrack">模型回溯</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="状态">
            <a-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="pending">待执行</a-option>
              <a-option value="running">运行中</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="failed">失败</a-option>
              <a-option value="paused">暂停</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="优先级">
            <a-select
              v-model="filterForm.priority"
              placeholder="请选择优先级"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="high">高</a-option>
              <a-option value="medium">中</a-option>
              <a-option value="low">低</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-card>
        <template #title>
          <div class="table-header">
            <span>任务列表</span>
            <a-space>
              <a-button size="small" @click="handleRefresh">
                <template #icon>
                  <icon-refresh />
                </template>
                刷新
              </a-button>
            </a-space>
          </div>
        </template>
        
        <a-table
          :data="taskList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
        >
          <template #name="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
          </template>
          
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          
          <template #priority="{ record }">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityLabel(record.priority) }}
            </a-tag>
          </template>
          
          <template #progress="{ record }">
            <a-progress 
              :percent="record.progress" 
              :status="getProgressStatus(record.status)"
              size="small"
            />
          </template>
          
          <template #createTime="{ record }">
            {{ formatDate(record.createTime) }}
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                查看
              </a-button>
              <a-button 
                v-if="record.status === 'running'"
                type="text" 
                size="small"
                status="warning"
                @click="handlePause(record)"
              >
                暂停
              </a-button>
              <a-button 
                v-if="record.status === 'paused'"
                type="text" 
                size="small"
                @click="handleResume(record)"
              >
                继续
              </a-button>
              <a-button 
                v-if="['running', 'paused'].includes(record.status)"
                type="text" 
                size="small"
                status="danger"
                @click="handleStop(record)"
              >
                停止
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOfflineModelStore } from '@/modules/offline-model/stores'
import { taskAPI } from '@/modules/offline-model/api'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const store = useOfflineModelStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])
const refreshTimer = ref(null)

// 筛选表单
const filterForm = reactive({
  name: '',
  type: '',
  status: '',
  priority: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '任务类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    slotName: 'priority',
    width: 80
  },
  {
    title: '进度',
    dataIndex: 'progress',
    slotName: 'progress',
    width: 150
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 180
  },
  {
    title: '预计完成时间',
    dataIndex: 'estimatedEndTime',
    width: 180
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 计算属性
const taskList = computed(() => store.getTasks)
const stats = computed(() => ({
  runningTasks: taskList.value.filter(item => item.status === 'running').length,
  completedTasks: taskList.value.filter(item => item.status === 'completed').length,
  failedTasks: taskList.value.filter(item => item.status === 'failed').length,
  pausedTasks: taskList.value.filter(item => item.status === 'paused').length
}))

// 生命周期
onMounted(() => {
  loadData()
  // 启动定时刷新
  refreshTimer.value = setInterval(() => {
    if (taskList.value.some(task => ['running', 'pending'].includes(task.status))) {
      loadData()
    }
  }, 30000) // 30秒刷新一次
})

onUnmounted(() => {
  // 清理定时器
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const res = await taskAPI.getTasks({ type: filterForm.type || '', status: filterForm.status || '', page: pagination.current, pageSize: pagination.pageSize })
    const list = (res.data && res.data.data) ? res.data.data : []
    store.setTasks(list)
    pagination.total = (res.data && res.data.total) ? res.data.total : list.length
  } catch (error) {
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.type = ''
  filterForm.status = ''
  filterForm.priority = ''
  loadData()
}

const handlePageChange = (page) => {
  pagination.current = page
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 不支持新建任务，入口移除

const handleRefresh = () => {
  loadData()
  Message.success('已刷新')
}

const handleViewDetail = (record) => {
  router.push(`/model-offline-analysis/task-management/detail/${record.id}`)
}

const handlePause = (record) => {
  Message.info('暂停任务功能开发中')
}

const handleResume = (record) => {
  Message.info('继续任务功能开发中')
}

const handleStop = (record) => {
  Message.info('停止任务功能开发中')
}

const handleDelete = (record) => {
  Message.info('删除任务功能开发中')
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    training: 'blue',
    evaluation: 'green',
    prediction: 'orange',
    backtrack: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    training: '模型训练',
    evaluation: '模型评估',
    prediction: '模型预测',
    backtrack: '模型回溯'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'gray',
    running: 'blue',
    completed: 'green',
    failed: 'red',
    paused: 'orange'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待执行',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    paused: '暂停'
  }
  return labels[status] || status
}

const getPriorityColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colors[priority] || 'gray'
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

const getProgressStatus = (status) => {
  const statusMap = {
    completed: 'success',
    failed: 'exception',
    running: 'normal',
    pending: 'normal',
    paused: 'warning'
  }
  return statusMap[status] || 'normal'
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleString('zh-CN') : '-'
}
</script>

<style scoped lang="less">
.task-management-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .page-title {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }
      
      .page-subtitle {
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .stats-section {
    margin-bottom: 24px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          font-size: 32px;
          color: #1890ff;
          margin-right: 16px;
        }
        
        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #333;
          }
          
          .stat-label {
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }
  
  .filter-section {
    margin-bottom: 24px;
  }
  
  .table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
