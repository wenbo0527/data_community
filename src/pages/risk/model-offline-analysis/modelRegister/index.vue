<template>
  <div class="model-register-page">
    <!-- 页面标题和操作区 -->
    <PageHeader title="模型注册">
      <template #actions>
        <a-button type="primary" @click="handleCreate">
          <template #icon>
            <icon-plus />
          </template>
          新建模型
        </a-button>
      </template>
    </PageHeader>

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
          
          <a-form-item label="模型类型">
            <a-select
              v-model="filterForm.type"
              placeholder="请选择模型类型"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="classification">分类模型</a-option>
              <a-option value="regression">回归模型</a-option>
              <a-option value="clustering">聚类模型</a-option>
              <a-option value="deep_learning">深度学习</a-option>
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
              <a-button 
                v-if="record.status === 'failed'"
                type="text" 
                size="small" 
                status="warning"
                @click="handleRetrain(record)"
              >
                重训练
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModelStore } from '@/store/modules/model-offline'
import { Message } from '@arco-design/web-vue'
import { modelAPI } from '@/api/offlineModel'

const router = useRouter()
const store = useModelStore()

// 响应式数据
const loading = ref(false)
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  name: '',
  type: ''
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
// 指标卡片移除

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
      type: filterForm.type,
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
  filterForm.type = ''
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
  router.push('/offline-model/model-register/create')
}

 

const handleViewDetail = (record) => {
  router.push(`/offline-model/model-register/detail/${record.id}`)
}

const handleEdit = (record) => {
  router.push(`/offline-model/model-register/edit/${record.id}`)
}

const handleRetrain = (record) => {
  Message.info('重训练功能开发中')
}

const handleDelete = (record) => {
  Message.info('删除功能开发中')
}

// 工具方法
const getTypeColor = (type) => {
  const colors = {
    classification: 'blue',
    regression: 'green',
    clustering: 'orange',
    deep_learning: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    classification: '分类模型',
    regression: '回归模型',
    clustering: '聚类模型',
    deep_learning: '深度学习'
  }
  return labels[type] || type
}

// 框架展示移除

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    training: 'blue',
    failed: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '有效',
    inactive: '无效',
    training: '训练中',
    failed: '训练失败'
  }
  return labels[status] || status
}

// 准确率展示移除

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
