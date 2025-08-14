<template>
  <div class="data-models-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">数据查询&管理模型</h2>
        <p class="page-description">管理和维护数据查询模型，支持SQL和Python两种语言</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="handleCreate">
          <template #icon>
            <icon-plus />
          </template>
          新增模型
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="searchForm.name"
            placeholder="搜索模型名称"
            allow-clear
            @input="handleSearch"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.useCase"
            placeholder="使用场景"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="download">明细数据下载</a-option>
            <a-option value="report">分析报告模板</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="状态"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="draft">草稿</a-option>
            <a-option value="published">已发布</a-option>
            <a-option value="archived">已归档</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.language"
            placeholder="语言类型"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="sql">SQL</a-option>
            <a-option value="python">Python</a-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-table
        :columns="columns"
        :data="filteredData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <!-- 模型名称 -->
        <template #name="{ record }">
          <div class="model-name">
            <a-link @click="handleView(record)">
              {{ record.name }}
            </a-link>
            <div class="model-description">{{ record.description }}</div>
          </div>
        </template>

        <!-- 使用场景 -->
        <template #useCase="{ record }">
          <a-tag
            :color="record.useCase === 'download' ? 'blue' : 'green'"
          >
            {{ record.useCase === 'download' ? '明细数据下载' : '分析报告模板' }}
          </a-tag>
        </template>

        <!-- 语言类型 -->
        <template #language="{ record }">
          <a-tag
            :color="record.language === 'sql' ? 'orange' : 'purple'"
          >
            {{ record.language.toUpperCase() }}
          </a-tag>
        </template>

        <!-- 状态 -->
        <template #status="{ record }">
          <a-tag
            :color="getStatusColor(record.status)"
          >
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <!-- 管理人 -->
        <template #manager="{ record }">
          <div class="manager-info">
            <a-avatar :size="24" style="margin-right: 8px">
              {{ record.manager.charAt(0) }}
            </a-avatar>
            {{ record.manager }}
          </div>
        </template>

        <!-- 操作 -->
        <template #actions="{ record }">
          <a-space>
            <a-button
              type="text"
              size="small"
              @click="handleView(record)"
            >
              查看
            </a-button>
            <a-button
              type="text"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-button
              type="text"
              size="small"
              @click="handleCopy(record)"
            >
              复制
            </a-button>
            <a-popconfirm
              content="确定要删除这个数据模型吗？"
              @ok="handleDelete(record)"
            >
              <a-button
                type="text"
                size="small"
                status="danger"
              >
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconPlus,
  IconSearch
} from '@arco-design/web-vue/es/icon'
import { 
  getDataModelsList, 
  deleteDataModel, 
  copyDataModel 
} from '@/api/dataModels'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const dataList = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  useCase: '',
  status: '',
  language: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
})

// 表格列配置
const columns = [
  {
    title: '模型名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 250
  },
  {
    title: '使用场景',
    dataIndex: 'useCase',
    slotName: 'useCase',
    width: 120
  },
  {
    title: '语言类型',
    dataIndex: 'language',
    slotName: 'language',
    width: 100
  },
  {
    title: '管理人',
    dataIndex: 'manager',
    slotName: 'manager',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '版本',
    dataIndex: 'version',
    width: 80
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 150
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 过滤后的数据
const filteredData = computed(() => {
  let result = [...dataList.value]
  
  // 按名称搜索
  if (searchForm.name) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchForm.name.toLowerCase()) ||
      item.description.toLowerCase().includes(searchForm.name.toLowerCase())
    )
  }
  
  // 按使用场景筛选
  if (searchForm.useCase) {
    result = result.filter(item => item.useCase === searchForm.useCase)
  }
  
  // 按状态筛选
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status)
  }
  
  // 按语言类型筛选
  if (searchForm.language) {
    result = result.filter(item => item.language === searchForm.language)
  }
  
  // 更新分页总数
  pagination.total = result.length
  
  // 分页处理
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

// 状态颜色映射
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'gray',
    published: 'green',
    archived: 'red'
  }
  return colorMap[status] || 'gray'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return textMap[status] || '未知'
}

// 事件处理函数
const handleCreate = () => {
  router.push('/management/data-models/create')
}

const handleView = (record) => {
  router.push(`/management/data-models/${record.id}`)
}

const handleEdit = (record) => {
  router.push(`/management/data-models/${record.id}/edit`)
}

const handleCopy = async (record) => {
  try {
    const response = await copyDataModel(record.id)
    if (response.code === 200) {
      Message.success('复制成功')
      loadData()
    } else {
      Message.error(response.message || '复制失败')
    }
  } catch (error) {
    console.error('复制失败:', error)
    Message.error('复制失败')
  }
}

const handleDelete = async (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除模型 "${record.name}" 吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        const response = await deleteDataModel(record.id)
        if (response.code === 200) {
          Message.success('删除成功')
          loadData()
        } else {
          Message.error(response.message || '删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        Message.error('删除失败')
      }
    }
  })
}

const handleSearch = () => {
  pagination.current = 1
}

const handlePageChange = (page) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      useCase: searchForm.useCase || undefined,
      status: searchForm.status || undefined,
      language: searchForm.language || undefined
    }
    
    const response = await getDataModelsList(params)
    
    if (response.code === 200) {
      // 确保 dataList.value 始终是数组，避免迭代错误
      dataList.value = Array.isArray(response.data?.list) ? response.data.list : []
      pagination.total = response.data?.total || 0
    } else {
      Message.error(response.message || '加载数据失败')
      // 确保在错误情况下 dataList 也是数组
      dataList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    Message.error('加载数据失败')
    // 确保在异常情况下 dataList 也是数组
    dataList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.data-models-list {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-right {
  flex-shrink: 0;
}

.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.table-section {
  background-color: #fff;
}

.model-name {
  display: flex;
  flex-direction: column;
}

.model-description {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.manager-info {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-right {
    margin-top: 16px;
  }
  
  .search-section .arco-row {
    flex-direction: column;
  }
  
  .search-section .arco-col {
    margin-bottom: 12px;
  }
}
</style>