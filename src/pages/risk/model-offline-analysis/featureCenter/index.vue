<template>
  <div class="risk-feature-center">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <h2>特征中心</h2>
      <p class="page-description">管理和维护特征数据，支持特征的全生命周期管理</p>
    </div>

    <!-- 搜索和筛选 -->
    <a-card class="filter-card">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item label="特征名称">
            <a-input
              v-model="filterForm.name"
              placeholder="请输入特征名称"
              allow-clear
              @change="handleSearch"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="特征类型">
            <a-select
              v-model="filterForm.type"
              placeholder="请选择特征类型"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="">全部</a-option>
              <a-option value="numerical">数值型</a-option>
              <a-option value="categorical">分类型</a-option>
              <a-option value="text">文本型</a-option>
              <a-option value="time">时间型</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="特征状态">
            <a-select
              v-model="filterForm.status"
              placeholder="请选择特征状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="">全部</a-option>
              <a-option value="active">有效</a-option>
              <a-option value="inactive">无效</a-option>
              <a-option value="pending">待审核</a-option>
              <a-option value="expired">已过期</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card hoverable>
          <template #title>
            <icon-apps />
            总特征数
          </template>
          <div class="stat-value">{{ stats.totalFeatures }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card hoverable>
          <template #title>
            <icon-check-circle />
            有效特征
          </template>
          <div class="stat-value">{{ stats.activeFeatures }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card hoverable>
          <template #title>
            <icon-clock-circle />
            待审核
          </template>
          <div class="stat-value">{{ stats.pendingFeatures }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card hoverable>
          <template #title>
            <icon-close-circle />
            已过期
          </template>
          <div class="stat-value">{{ stats.expiredFeatures }}</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 操作按钮 -->
    <a-space class="page-actions">
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <icon-plus />
        </template>
        新建特征
      </a-button>
      <a-button @click="handleImport">
        <template #icon>
          <icon-upload />
        </template>
        批量导入
      </a-button>
      <a-button @click="handleExport">
        <template #icon>
          <icon-download />
        </template>
        导出
      </a-button>
      <a-button @click="loadData">
        <template #icon>
          <icon-refresh />
        </template>
        刷新
      </a-button>
    </a-space>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-card>
        <template #title>
          <div class="table-header">
            <h3 class="table-title">特征列表</h3>
            <div class="table-actions">
              <span>共 {{ pagination.total }} 条数据</span>
            </div>
          </div>
        </template>
        
        <a-table
          :data="featureList"
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
          
          <template #createTime="{ record }">
            {{ formatDate(record.createTime) }}
          </template>
          
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                查看
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFeatureStore } from '@/store/modules/model-offline'
import { Message } from '@arco-design/web-vue'
import {
  IconSearch,
  IconRefresh,
  IconPlus,
  IconUpload,
  IconDownload,
  IconApps,
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle
} from '@arco-design/web-vue/es/icon'
import { featureAPI } from '@/api/offlineModel'

const router = useRouter()
const store = useFeatureStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  name: '',
  type: '',
  status: ''
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
    title: '特征名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '特征编码',
    dataIndex: 'code',
    width: 150
  },
  {
    title: '特征类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 计算属性
const featureList = computed(() => store.getFeatures)
const stats = computed(() => ({
  totalFeatures: featureList.value.length,
  activeFeatures: featureList.value.filter(item => item.status === 'active').length,
  pendingFeatures: featureList.value.filter(item => item.status === 'pending').length,
  expiredFeatures: featureList.value.filter(item => item.status === 'expired').length
}))

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const response = await featureAPI.getFeatures({
      ...filterForm,
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    
    if (response.success) {
      store.setFeatures(response.data.data)
      pagination.total = response.data.total
    } else {
      Message.error(response.message || '加载数据失败')
    }
  } catch (error) {
    Message.error('加载数据失败: ' + error.message)
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
  loadData()
}

const handlePageChange = (page) => {
  pagination.current = page
  loadData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleCreate = () => {
  router.push('/offline-model/feature-center/create')
}

const handleImport = () => {
  Message.info('批量导入功能开发中')
}

const handleExport = () => {
  Message.info('导出功能开发中')
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

const handleViewDetail = (record) => {
  router.push(`/offline-model/feature-center/detail/${record.id}`)
}

const handleEdit = (record) => {
  router.push(`/offline-model/feature-center/edit/${record.id}`)
}

const handleDelete = (record) => {
  Message.info('删除功能开发中')
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    numerical: 'blue',
    categorical: 'green',
    text: 'orange',
    time: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    numerical: '数值型',
    categorical: '分类型',
    text: '文本型',
    time: '时间型'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    draft: 'orange',
    pending: 'blue'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '有效',
    inactive: '无效',
    draft: '草稿',
    pending: '待审核'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.risk-feature-center {
  padding: 24px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
}

.page-description {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  text-align: center;
  margin-top: 8px;
}

.filter-card {
  margin-bottom: 16px;
}

.page-actions {
  margin-bottom: 16px;
}

.table-section {
  background: #fff;
  border-radius: 6px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
