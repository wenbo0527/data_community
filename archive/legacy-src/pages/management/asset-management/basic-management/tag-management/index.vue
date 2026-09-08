<template>
  <div class="tag-management-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">标签管理</h1>
      </div>
    </div>

    <div class="page-content">
      <!-- 筛选区域 -->
      <a-card class="filter-card">
        <a-form :model="filterForm" layout="inline" @submit="handleSearch">
          <a-row :gutter="16" style="width: 100%">
            <a-col :span="6">
              <a-form-item field="keyword" label="搜索">
                <a-input v-model="filterForm.keyword" placeholder="标签组名称/描述" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item field="type" label="类型">
                <a-select v-model="filterForm.type" placeholder="请选择" allow-clear>
                  <a-option value="text">文本</a-option>
                  <a-option value="rule">数据规则</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item field="priority" label="优先级">
                <a-select v-model="filterForm.priority" placeholder="请选择" allow-clear>
                  <a-option value="P0">P0</a-option>
                  <a-option value="P1">P1</a-option>
                  <a-option value="P2">P2</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6" style="text-align: right">
              <a-space>
                <a-button type="primary" @click="handleSearch">查询</a-button>
                <a-button @click="handleReset">重置</a-button>
                <a-button type="primary" status="success" @click="handleCreate">
                  <template #icon><icon-plus /></template>
                  新建标签组
                </a-button>
              </a-space>
            </a-col>
            <a-col :span="6">
              <a-form-item field="admin" label="管理员">
                <a-input v-model="filterForm.admin" placeholder="请输入关键词进行搜索" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item field="scope" label="展示范围">
                <a-select v-model="filterForm.scope" placeholder="请选择" allow-clear>
                  <a-option value="all">全部</a-option>
                  <a-option value="management">管理侧</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item field="status" label="状态">
                <a-select v-model="filterForm.status" placeholder="请选择" allow-clear>
                  <a-option value="enabled">已开启</a-option>
                  <a-option value="disabled">已关闭</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <!-- 表格区域 -->
      <a-card class="table-card">
        <div class="table-operations" style="margin-bottom: 16px">
          <a-space>
            <a-button :disabled="!selectedKeys.length" @click="handleBatchEnable">批量开启</a-button>
            <a-button :disabled="!selectedKeys.length" @click="handleBatchDisable">批量关闭</a-button>
            <a-button status="danger" :disabled="!selectedKeys.length" @click="handleBatchDelete">批量删除</a-button>
          </a-space>
        </div>

        <a-table
          row-key="id"
          :data="tableData"
          :row-selection="{ type: 'checkbox', showCheckedAll: true }"
          v-model:selected-keys="selectedKeys"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <template #columns>
            <a-table-column title="标签组名称" data-index="name" />
            <a-table-column title="描述" data-index="description">
              <template #cell="{ record }">
                {{ record.description || '-' }}
              </template>
            </a-table-column>
            <a-table-column title="包含标签数量" data-index="tagCount" align="center" />
            <a-table-column title="类型" data-index="type">
              <template #cell="{ record }">
                {{ record.type === 'text' ? '文本' : '数据规则' }}
              </template>
            </a-table-column>
            <a-table-column title="优先级" data-index="priority" align="center" />
            <a-table-column title="展示范围" data-index="scope">
              <template #cell="{ record }">
                {{ record.scope === 'all' ? '全部' : '管理侧' }}
              </template>
            </a-table-column>
            <a-table-column title="管理员" data-index="admins">
              <template #cell="{ record }">
                {{ record.admins.join(', ') }}
              </template>
            </a-table-column>
            <a-table-column title="状态" data-index="status" align="center">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'enabled' ? 'green' : 'gray'">
                  {{ record.status === 'enabled' ? '已开启' : '已关闭' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" align="center" width="280">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                  <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                  <a-button 
                    type="text" 
                    size="small" 
                    :status="record.status === 'enabled' ? 'warning' : 'success'"
                    @click="handleToggleStatus(record)"
                  >
                    {{ record.status === 'enabled' ? '关闭' : '开启' }}
                  </a-button>
                  <a-button 
                    v-if="record.status === 'disabled'"
                    type="text" 
                    status="danger" 
                    size="small" 
                    @click="handleDelete(record)"
                  >
                    删除
                  </a-button>
                  <a-button type="text" size="small" @click="handleViewUsage(record)">使用明细</a-button>
                  <a-button 
                    v-if="record.type === 'rule' && record.status === 'enabled'" 
                    type="text" 
                    size="small" 
                    @click="handleApply(record)"
                  >
                    应用
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 弹窗组件 -->
    <TagGroupForm 
      v-model:visible="formVisible" 
      :mode="formMode" 
      :data="currentRecord" 
      @success="handleFormSuccess" 
    />
    
    <TagGroupApply 
      v-model:visible="applyVisible" 
      :data="currentRecord" 
      @success="handleApplySuccess" 
    />
    
    <TagUsageDetail 
      v-model:visible="usageVisible" 
      :data="currentRecord" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import TagGroupForm from './TagGroupForm.vue'
import TagGroupApply from './TagGroupApply.vue'
import TagUsageDetail from './TagUsageDetail.vue'

// 筛选表单
const filterForm = reactive({
  keyword: '',
  type: '',
  priority: '',
  admin: '',
  scope: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const selectedKeys = ref([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 20,
  showTotal: true,
  showPageSize: true
})

// 弹窗控制
const formVisible = ref(false)
const formMode = ref('create') // create, edit, view
const currentRecord = ref(null)
const applyVisible = ref(false)
const usageVisible = ref(false)

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '新建标签测试',
    description: '-',
    tagCount: 1,
    type: 'text',
    priority: 'P0',
    scope: 'all',
    admins: ['admin'],
    status: 'enabled',
    createTime: '2023-10-20'
  },
  {
    id: 2,
    name: '测试标签',
    description: '-',
    tagCount: 1,
    type: 'text',
    priority: 'P0',
    scope: 'all',
    admins: ['admin'],
    status: 'disabled',
    createTime: '2023-10-21'
  }
]

// 初始化
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    tableData.value = mockData.filter(item => {
      if (filterForm.keyword && !item.name.includes(filterForm.keyword)) return false
      if (filterForm.type && item.type !== filterForm.type) return false
      if (filterForm.priority && item.priority !== filterForm.priority) return false
      if (filterForm.status && item.status !== filterForm.status) return false
      return true
    })
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

// 搜索操作
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  Object.keys(filterForm).forEach(key => filterForm[key] = '')
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.current = page
  fetchData()
}

// 增删改查操作
const handleCreate = () => {
  formMode.value = 'create'
  currentRecord.value = null
  formVisible.value = true
}

const handleEdit = (record) => {
  formMode.value = 'edit'
  currentRecord.value = { ...record }
  formVisible.value = true
}

const handleView = (record) => {
  formMode.value = 'view'
  currentRecord.value = { ...record }
  formVisible.value = true
}

const handleDelete = (record) => {
  Modal.warning({
    title: '确认删除',
    content: `确定要删除标签组"${record.name}"吗？此操作不可恢复。`,
    onOk: () => {
      Message.success('删除成功')
      fetchData()
    }
  })
}

const handleToggleStatus = (record) => {
  const action = record.status === 'enabled' ? '关闭' : '开启'
  if (action === '关闭' && record.tagCount > 0) {
     // 模拟检查被使用
     // Message.warning('该标签组内标签正在被使用，无法关闭')
     // return
  }
  
  Modal.info({
    title: `确认${action}`,
    content: `确定要${action}标签组"${record.name}"吗？`,
    onOk: () => {
      record.status = record.status === 'enabled' ? 'disabled' : 'enabled'
      Message.success(`${action}成功`)
    }
  })
}

const handleApply = (record) => {
  currentRecord.value = { ...record }
  applyVisible.value = true
}

const handleViewUsage = (record) => {
  currentRecord.value = { ...record }
  usageVisible.value = true
}

// 批量操作
const handleBatchEnable = () => {
  Message.success(`批量开启 ${selectedKeys.value.length} 项`)
  selectedKeys.value = []
}

const handleBatchDisable = () => {
  Message.success(`批量关闭 ${selectedKeys.value.length} 项`)
  selectedKeys.value = []
}

const handleBatchDelete = () => {
  Modal.warning({
    title: '批量删除',
    content: `确定要删除选中的 ${selectedKeys.value.length} 个标签组吗？`,
    onOk: () => {
      Message.success('批量删除成功')
      selectedKeys.value = []
      fetchData()
    }
  })
}

// 回调处理
const handleFormSuccess = () => {
  formVisible.value = false
  fetchData()
}

const handleApplySuccess = () => {
  applyVisible.value = false
  Message.success('应用设置保存成功')
}
</script>

<style scoped>
.tag-management-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  background: #fff;
}
</style>