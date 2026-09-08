<template>
  <div class="task-management-page">
    <!-- 页面标题和操作区 -->
    <PageHeader title="任务管理" />

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

    <FilterBar
      v-model="filterForm"
      :fields="filterFields"
      search-text="搜索"
      reset-text="重置"
      @search="handleSearch"
      @reset="handleReset"
      @change="handleFilterChange"
    />

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
            <StatusTag :status="record.type" dictKey="riskTaskType" />
          </template>
          
          <template #status="{ record }">
            <StatusTag :status="record.status" dictKey="riskTaskStatus" />
          </template>
          
          <template #priority="{ record }">
            <StatusTag :status="record.priority" dictKey="riskTaskPriority" />
          </template>
          
          <template #progress="{ record }">
            <a-progress 
              :percent="record.progress" 
              :status="getProgressStatus(record.status)"
              size="small"
            />
          </template>
          
          <template #createTime="{ record }">
            {{ DateUtils.formatDateTime(record.createTime) }}
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
import PageHeader from '../components/PageHeader.vue'
import FilterBar from '../components/FilterBar.vue'
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/store/modules/model-offline'
import { taskAPI } from '@/api/offlineModel'
import { Message } from '@arco-design/web-vue'
import { logger } from '@/utils/enhancedErrorHandler.js'
import { getCommonColumns } from '../components/table-columns'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'

const router = useRouter()
const store = useTaskStore()

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
const filterFields = [
  { type: 'input', key: 'name', label: '任务名称', placeholder: '请输入任务名称' },
  { type: 'select', key: 'type', label: '任务类型', options: [
    { label: '模型训练', value: 'training' },
    { label: '模型评估', value: 'evaluation' },
    { label: '模型预测', value: 'prediction' },
    { label: '模型回溯', value: 'backtrack' }
  ] },
  { type: 'select', key: 'status', label: '状态', options: [
    { label: '待执行', value: 'pending' },
    { label: '运行中', value: 'running' },
    { label: '已完成', value: 'completed' },
    { label: '失败', value: 'failed' },
    { label: '暂停', value: 'paused' }
  ] },
  { type: 'select', key: 'priority', label: '优先级', options: [
    { label: '高', value: 'high' },
    { label: '中', value: 'medium' },
    { label: '低', value: 'low' }
  ] }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条任务`,
  showJumper: true,
  showPageSize: true
})

const baseColumns = getCommonColumns({
  nameTitle: '任务名称',
  nameKey: 'name',
  nameSlot: 'name',
  typeTitle: '任务类型',
  typeKey: 'type',
  typeSlot: 'type',
  statusTitle: '状态',
  statusKey: 'status',
  statusSlot: 'status',
  createTimeTitle: '创建时间',
  createTimeKey: 'createTime',
  createTimeSlot: 'createTime'
})
const columns = [
  baseColumns[0],
  baseColumns[1],
  baseColumns[2],
  { title: '优先级', dataIndex: 'priority', slotName: 'priority', width: 80 },
  { title: '进度', dataIndex: 'progress', slotName: 'progress', width: 150 },
  { title: '开始时间', dataIndex: 'startTime', width: 180 },
  { title: '预计完成时间', dataIndex: 'estimatedEndTime', width: 180 },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  baseColumns[3],
  baseColumns[4]
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
    logger.info('TaskManagement loadData start', {
      filters: { ...filterForm },
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    const res = await taskAPI.getTasks({ type: filterForm.type || '', status: filterForm.status || '', page: pagination.current, pageSize: pagination.pageSize })
    const list = (res.data && res.data.data) ? res.data.data : []
    store.setTasks(list)
    pagination.total = (res.data && res.data.total) ? res.data.total : list.length
    logger.info('TaskManagement loadData success', { total: pagination.total })
  } catch (error) {
    logger.error('TaskManagement loadData error', error)
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  logger.info('TaskManagement filter change', { filters: { ...filterForm } })
  loadData()
}

const handleSearch = () => {
  logger.info('TaskManagement search', { filters: { ...filterForm } })
  loadData()
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.type = ''
  filterForm.status = ''
  filterForm.priority = ''
  logger.info('TaskManagement reset filters')
  loadData()
}

const handlePageChange = (page) => {
  pagination.current = page
  logger.info('TaskManagement page change', { page })
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 不支持新建与批量操作，入口移除

const handleRefresh = () => {
  logger.info('TaskManagement manual refresh')
  loadData()
  Message.success('已刷新')
}

// 表格设置入口移除

const handleViewDetail = (record) => {
  logger.info('TaskManagement view detail', { id: record?.id })
  router.push(`/offline-model/task-management/detail/${record.id}`)
}

const handlePause = (record) => {
  logger.info('TaskManagement pause task', { id: record?.id })
  Message.info('暂停任务功能开发中')
}

const handleResume = (record) => {
  logger.info('TaskManagement resume task', { id: record?.id })
  Message.info('继续任务功能开发中')
}

const handleStop = (record) => {
  logger.info('TaskManagement stop task', { id: record?.id })
  Message.info('停止任务功能开发中')
}

const handleDelete = (record) => {
  logger.info('TaskManagement delete task', { id: record?.id })
  Message.info('删除任务功能开发中')
}

// 工具方法
 

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
