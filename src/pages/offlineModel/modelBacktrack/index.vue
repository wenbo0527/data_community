<template>
  <div class="model-backtrack-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="page-title">
        <h2>模型回溯</h2>
        <span class="page-subtitle">查看模型的历史版本和回溯分析</span>
      </div>
      <div class="page-actions">
        <a-space>
          <a-button type="primary" @click="handleCreateBacktrack">
            <template #icon>
              <icon-plus />
            </template>
            新建回溯
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="filter-section">
      <a-card>
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="模型名称">
            <a-input
              v-model="filterForm.modelName"
              placeholder="请输入模型名称"
              allow-clear
              @change="handleFilterChange"
            />
          </a-form-item>
          
          <a-form-item label="回溯类型">
            <a-select
              v-model="filterForm.backtrackType"
              placeholder="请选择回溯类型"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="performance">性能回溯</a-option>
              <a-option value="data">数据回溯</a-option>
              <a-option value="feature">特征回溯</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="任务状态">
            <a-select
              v-model="filterForm.status"
              placeholder="请选择任务状态"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="running">运行中</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="failed">失败</a-option>
              <a-option value="stopped">已停止</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="时间范围">
            <a-range-picker
              v-model="filterForm.dateRange"
              style="width: 240px"
              @change="handleFilterChange"
            />
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
            <span>回溯记录</span>
            <a-space>
              <a-button size="small" @click="handleBatchOperation" :disabled="selectedRows.length === 0">
                <template #icon>
                  <icon-settings />
                </template>
                批量操作
              </a-button>
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
          :data="backtrackList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
        >
          <template #modelName="{ record }">
            <a-link @click="handleViewModel(record)">{{ record.modelName }}</a-link>
          </template>
          
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>
          
          <template #status="{ record }">
            <div class="status-cell">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusLabel(record.status) }}
              </a-tag>
              <div v-if="record.status === 'running'" class="progress-mini">
                <a-progress 
                  :percent="getProgressPercent(record)" 
                  size="small" 
                  :show-text="false"
                  :status="getProgressStatus(record)"
                />
              </div>
            </div>
          </template>
          
          <template #createTime="{ record }">
            {{ formatDate(record.createTime) }}
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">查看详情</a-button>
              <a-button 
                v-if="record.status === 'completed'"
                type="text" 
                size="small"
                @click="handleViewReport(record)"
              >
                查看报告
              </a-button>
              <a-button v-if="record.status === 'running'" type="text" size="small" status="warning" @click="handleStop(record)">停止</a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { backtrackAPI } from '@/api/offlineModel'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  navigateToBacktrackCreate, 
  navigateToBacktrackDetail,
  navigateToBacktrackReport 
} from '@/utils/model-backtrack-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  modelName: '',
  backtrackType: '',
  status: '',
  dateRange: []
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
    title: '模型名称',
    dataIndex: 'modelName',
    slotName: 'modelName',
    width: 200
  },
  {
    title: '回溯类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  {
    title: '回溯版本',
    dataIndex: 'version',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 180
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 180
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
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
const backtrackList = computed(() => dataSource.value)
const dataSource = ref([])

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const res = await backtrackAPI.getBacktracks({ page: pagination.current, pageSize: pagination.pageSize })
    const list = res.data?.data || []
    dataSource.value = list.map(t => ({
      id: t.id,
      modelName: t.config?.serviceName || '-',
      type: 'feature',
      version: '-',
      startTime: t.createTime,
      endTime: t.updateTime,
      status: t.status,
      creator: '系统',
      createTime: t.createTime
    }))
    pagination.total = res.data?.total || dataSource.value.length
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
  filterForm.modelName = ''
  filterForm.backtrackType = ''
  filterForm.status = ''
  filterForm.dateRange = []
  loadData()
}

const handlePageChange = (page) => {
  pagination.current = page
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleCreateBacktrack = () => {
  navigateToBacktrackCreate(router, { source: 'offline' })
}

// 无报告导出

// 无批量操作与表格设置

const handleViewModel = (record) => {
  router.push({
    path: `/offline-model/model-register/detail/${record.modelId}`,
    query: { source: 'offline' }
  })
}

const handleViewDetail = (record) => {
  navigateToBacktrackDetail(router, record.id, { source: 'offline' })
}

// 报告功能 - 跳转到详情页的报告标签
const handleViewReport = (record) => {
  navigateToBacktrackReport(router, record.id, { source: 'offline' })
}

const handleRefresh = () => {
  loadData()
  Message.success('数据已刷新')
}

const handleBatchOperation = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请先选择要操作的记录')
    return
  }
  
  // 获取选中任务的状态
  const statuses = selectedRows.value.map(row => row.status)
  const hasRunning = statuses.includes('running')
  const hasCompleted = statuses.includes('completed')
  
  if (hasRunning) {
    // 如果有运行中的任务，提供批量停止选项
    Modal.confirm({
      title: '批量操作',
      content: `已选择 ${selectedRows.value.length} 个任务，其中包含运行中的任务。是否批量停止？`,
      okText: '批量停止',
      cancelText: '取消',
      onOk: async () => {
        const runningTasks = selectedRows.value.filter(row => row.status === 'running')
        const promises = runningTasks.map(task => backtrackAPI.stopBacktrack(task.id))
        
        try {
          await Promise.all(promises)
          Message.success(`已停止 ${runningTasks.length} 个任务`)
          await loadData()
          selectedRows.value = []
        } catch (error) {
          Message.error('批量停止失败')
        }
      }
    })
  } else if (hasCompleted) {
    // 如果只有已完成的任务，提供批量导出选项
    Modal.confirm({
      title: '批量操作',
      content: `已选择 ${selectedRows.value.length} 个已完成的任务。是否批量导出报告？`,
      okText: '批量导出',
      cancelText: '取消',
      onOk: () => {
        Message.info('批量导出功能开发中')
      }
    })
  } else {
    Message.info('选中的任务不支持批量操作')
  }
}

const handleStop = async (record) => {
  try {
    const res = await backtrackAPI.stopBacktrack(record.id)
    if (res.success) {
      Message.success('任务已停止')
      await loadData()
    } else {
      Message.error(res.message || '停止失败')
    }
  } catch (error) {
    Message.error('停止任务失败')
  }
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    performance: 'blue',
    data: 'green',
    feature: 'orange'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    performance: '性能回溯',
    data: '数据回溯',
    feature: '特征回溯'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    running: 'blue',
    completed: 'green',
    failed: 'red',
    stopped: 'orange'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    stopped: '已停止'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleString('zh-CN') : '-'
}

// 获取进度百分比
const getProgressPercent = (record) => {
  if (record.status !== 'running') return 0
  // 模拟进度计算，实际应该从record.progress获取
  return Math.floor(Math.random() * 40) + 30 // 30-70%的随机进度
}

// 获取进度状态
const getProgressStatus = (record) => {
  const percent = getProgressPercent(record)
  if (percent < 30) return 'exception'
  if (percent < 70) return 'normal'
  return 'success'
}
</script>

<style scoped lang="less">
.model-backtrack-page {
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
  
  .status-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .progress-mini {
      width: 60px;
    }
  }
}
</style>
