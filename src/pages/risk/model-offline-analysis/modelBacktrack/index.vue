<template>
  <div class="model-backtrack-page">
    <!-- 页面标题和操作区 -->
    <PageHeader title="模型回溯">
      <template #actions>
        <a-dropdown>
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新建回溯
            <template #suffix><icon-down /></template>
          </a-button>
          <template #content>
            <a-doption @click="handleCreateBacktrack('single')">
              <template #icon><icon-plus /></template>
              单次回溯
            </a-doption>
            <a-doption @click="handleCreateBacktrack('periodic')">
              <template #icon><icon-plus /></template>
              周期回溯
            </a-doption>
          </template>
        </a-dropdown>
      </template>
    </PageHeader>

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
            <span>回溯记录</span>
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
import PageHeader from '../components/PageHeader.vue'
import FilterBar from '../components/FilterBar.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/store/modules/model-offline'
import { Message } from '@arco-design/web-vue'
import { 
  navigateToBacktrackCreate, 
  navigateToBacktrackDetail
} from '@/utils/model-backtrack-router'
import { getCommonColumns } from '../components/table-columns'

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
const filterFields = [
  { type: 'input', key: 'modelName', label: '模型名称', placeholder: '请输入模型名称' },
  { type: 'select', key: 'backtrackType', label: '回溯类型', options: [
    { label: '单次回溯', value: 'single' },
    { label: '周期回溯', value: 'periodic' }
  ] },
  { type: 'range', key: 'dateRange', label: '时间范围' }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

const baseColumns = getCommonColumns({
  nameTitle: '模型名称',
  nameKey: 'modelName',
  nameSlot: 'modelName',
  typeTitle: '回溯类型',
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
  ...baseColumns.slice(0, 2),
  { title: '回溯版本', dataIndex: 'version', width: 100 },
  { title: '开始时间', dataIndex: 'startTime', width: 180 },
  { title: '结束时间', dataIndex: 'endTime', width: 180 },
  ...baseColumns.slice(2)
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
        type: 'single',
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
        type: 'periodic',
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

const handleCreateBacktrack = (mode) => {
  navigateToBacktrackCreate(router, { 
    mode,
    source: 'risk'
  })
}

 

const handleViewModel = (record) => {
  // 使用统一的路由跳转，保持来源信息
  router.push({
    path: `/offline-model/model-register/detail/${record.modelId}`,
    query: {
      source: 'risk'
    }
  })
}

const handleViewDetail = (record) => {
  navigateToBacktrackDetail(router, record.id, { source: 'risk' })
}

 

const handleStop = () => {
  Message.info('停止回溯功能开发中')
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    single: 'blue',
    periodic: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    single: '单次回溯',
    periodic: '周期回溯'
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
