<template>
  <div class="model-register-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="page-title">
        <h2>模型注册</h2>
        <span class="page-subtitle">注册和管理机器学习模型</span>
      </div>
      <div class="page-actions">
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <icon-plus />
            </template>
            新建模型
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
              v-model="filterForm.name"
              placeholder="请输入模型名称"
              allow-clear
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
            <span>模型列表</span>
            <a-space></a-space>
          </div>
        </template>
        
        <a-table
          :data="modelList"
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
              <a-button type="text" size="small" @click="handleCreateVersion(record)">
                新建版本
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
import { useOfflineModelStore } from '@/modules/offline-model/stores'
import { Message } from '@arco-design/web-vue'
import { modelAPI } from '@/modules/offline-model/api'

const router = useRouter()
const store = useOfflineModelStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  name: ''
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
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '模型编码',
    dataIndex: 'code',
    width: 150
  },
  {
    title: '模型类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  
  {
    title: '版本',
    dataIndex: 'version',
    width: 80
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
    width: 200,
    fixed: 'right'
  }
]

// 计算属性
const modelList = computed(() => store.getModels)

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const response = await modelAPI.getModels({
      name: filterForm.name,
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    
    if (response.success) {
      store.setModels(response.data.data)
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
  router.push('/model-offline-analysis/model-register/create')
}

 

const handleViewDetail = (record) => {
  router.push(`/model-offline-analysis/model-register/detail/${record.id}`)
}

const handleEdit = (record) => {
  router.push(`/model-offline-analysis/model-register/edit/${record.id}`)
}

const handleCreateVersion = async (record) => {
  try {
    const res = await modelAPI.createModelVersion(record.id)
    if (res.success) {
      Message.success('新版本已创建')
      loadData()
    } else {
      Message.error(res.message || '新建版本失败')
    }
  } catch (e) {
    Message.error('新建版本失败')
  }
}



const handleDelete = (record) => {
  Message.info('删除功能开发中')
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    daily: 'blue',
    monthly: 'green',
    classification: 'arcoblue',
    regression: 'green',
    clustering: 'orange',
    deep_learning: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    daily: '日模型',
    monthly: '月模型',
    classification: '分类模型',
    regression: '回归模型',
    clustering: '聚类模型',
    deep_learning: '深度学习'
  }
  return labels[type] || type
}


const getStatusColor = (status) => {
  const colors = {
    online: 'green',
    archived: 'gray'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    online: '上线',
    archived: '归档'
  }
  return labels[status] || status
}


const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="less">
.model-register-page {
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
  
  .table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
