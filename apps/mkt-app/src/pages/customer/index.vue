<template>
  <div class="customer-center-page">
    <div class="page-header">
      <h1>客群中心</h1>
      <div class="header-actions">
        <a-button type="primary" @click="handleCreate">
          <template #icon><IconPlus /></template>
          新建客群
        </a-button>
        <a-button @click="handleRefresh">
          <template #icon><IconRefresh /></template>
          刷新
        </a-button>
      </div>
    </div>
    
    <!-- 搜索筛选区 -->
    <div class="search-section">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="客群名称">
          <a-input v-model="searchForm.name" placeholder="请输入客群名称" />
        </a-form-item>
        <a-form-item label="创建时间">
          <a-range-picker v-model="searchForm.dateRange" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model="searchForm.status" placeholder="请选择状态" allow-clear>
            <a-option value="active">活跃</a-option>
            <a-option value="inactive">失效</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>
    </div>
    
    <!-- 客群列表 -->
    <a-table :columns="columns" :data="tableData" :loading="loading" :pagination="pagination">
      <template #index="{ rowIndex }">{{ rowIndex + 1 }}</template>
      <template #name="{ record }">
        <a-link @click="handleView(record)">{{ record.name }}</a-link>
      </template>
      <template #size="{ record }">{{ record.size }} 人</template>
      <template #status="{ record }">
        <a-tag :color="record.status === 'active' ? 'green' : 'gray'">
          {{ record.status === 'active' ? '活跃' : '失效' }}
        </a-tag>
      </template>
      <template #actions="{ record }">
        <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
        <a-button type="text" size="small" @click="handleCopy(record)">复制</a-button>
        <a-button type="text" size="small" @click="handleDelete(record)">删除</a-button>
      </template>
    </a-table>
    
    <!-- 新建/编辑弹窗 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" @ok="handleModalOk" @cancel="modalVisible = false">
      <a-form :model="formData" layout="vertical">
        <a-form-item label="客群名称" required>
          <a-input v-model="formData.name" placeholder="请输入客群名称" />
        </a-form-item>
        <a-form-item label="客群描述">
          <a-textarea v-model="formData.desc" placeholder="请输入客群描述" />
        </a-form-item>
        <a-form-item label="筛选条件">
          <div class="condition-builder">
            <p class="condition-tip">请在下方添加筛选条件</p>
            <!-- 条件构建器占位 -->
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const loading = ref(false)
const modalVisible = ref(false)
const modalTitle = ref('新建客群')
const isEdit = ref(false)

const searchForm = reactive({
  name: '',
  dateRange: [],
  status: ''
})

const formData = reactive({
  id: '',
  name: '',
  desc: '',
  conditions: []
})

const columns = [
  { title: '序号', slotName: 'index', width: 60 },
  { title: '客群名称', slotName: 'name' },
  { title: '人数', slotName: 'size', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '操作', slotName: 'actions', width: 200 }
]

const tableData = ref([
  { id: '1', name: '高价值客户', size: 1250, createTime: '2026-04-01 10:00', status: 'active' },
  { id: '2', name: '流失风险客户', size: 856, createTime: '2026-04-02 14:30', status: 'active' },
  { id: '3', name: '新手客户', size: 3200, createTime: '2026-03-28 09:15', status: 'inactive' }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 500)
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.dateRange = []
  searchForm.status = ''
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 500)
}

const handleCreate = () => {
  modalTitle.value = '新建客群'
  isEdit.value = false
  Object.assign(formData, { id: '', name: '', desc: '', conditions: [] })
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  modalTitle.value = '编辑客群'
  isEdit.value = true
  Object.assign(formData, record)
  modalVisible.value = true
}

const handleView = (record: any) => {
  console.log('查看客群详情:', record)
}

const handleCopy = (record: any) => {
  console.log('复制客群:', record)
}

const handleDelete = (record: any) => {
  console.log('删除客群:', record)
}

const handleModalOk = () => {
  console.log('保存客群:', formData)
  modalVisible.value = false
}
</script>

<style scoped>
.customer-center-page {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}
.header-actions {
  display: flex;
  gap: 12px;
}
.search-section {
  background: #f7f8fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}
.condition-builder {
  border: 1px dashed #ccc;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
}
.condition-tip {
  color: #999;
  margin: 0;
}
</style>
