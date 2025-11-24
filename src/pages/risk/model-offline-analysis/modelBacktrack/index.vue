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
          <a-button @click="handleExport">
            <template #icon>
              <icon-download />
            </template>
            导出报告
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
              <a-button size="small" @click="handleBatchOperation">
                <template #icon>
                  <icon-settings />
                </template>
                批量操作
              </a-button>
              <a-button size="small" @click="handleTableSetting">
                <template #icon>
                  <icon-tool />
                </template>
                表格设置
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
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          
          <template #createTime="{ record }">
            {{ formatDate(record.createTime) }}
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                查看详情
              </a-button>
              <a-button 
                v-if="record.status === 'completed'"
                type="text" 
                size="small"
                @click="handleViewReport(record)"
              >
                查看报告
              </a-button>
              <a-button 
                v-if="record.status === 'running'"
                type="text" 
                size="small"
                status="warning"
                @click="handleStop(record)"
              >
                停止
              </a-button>
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
import { useTaskStore } from '@/store/modules/model-offline'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const store = useTaskStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  modelName: '',
  backtrackType: '',
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
const backtrackList = computed(() => store.backtracks)

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取数据
    // await store.fetchBacktracks({
    //   ...filterForm,
    //   page: pagination.current,
    //   pageSize: pagination.pageSize
    // })
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        modelName: '信用评分模型',
        type: 'performance',
        version: 'v1.0.0',
        startTime: '2024-01-15 10:30:00',
        endTime: '2024-01-15 12:30:00',
        status: 'completed',
        creator: '张三',
        createTime: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        modelName: '风险预测模型',
        type: 'data',
        version: 'v1.0.1',
        startTime: '2024-01-16 14:20:00',
        endTime: '',
        status: 'running',
        creator: '李四',
        createTime: '2024-01-16 14:20:00'
      }
    ]
    
    store.backtracks = mockData
    pagination.total = mockData.length
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
  router.push('/offline-model/model-backtrack/create')
}

const handleExport = () => {
  Message.info('导出报告功能开发中')
}

const handleBatchOperation = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请先选择要操作的记录')
    return
  }
  Message.info('批量操作功能开发中')
}

const handleTableSetting = () => {
  Message.info('表格设置功能开发中')
}

const handleViewModel = (record) => {
  router.push(`/offline-model/model-register/detail/${record.modelId}`)
}

const handleViewDetail = (record) => {
  router.push(`/offline-model/model-backtrack/detail/${record.id}`)
}

const handleViewReport = (record) => {
  router.push(`/offline-model/model-backtrack/report/${record.id}`)
}

const handleStop = (record) => {
  Message.info('停止回溯功能开发中')
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
}
</style>