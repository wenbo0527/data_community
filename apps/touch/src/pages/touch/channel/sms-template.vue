<template>
  <div class="sms-template-container">
    <a-card :bordered="false" title="短信管理" class="search-card">
      <template #extra>
        <a-button type="primary" @click="handleCreate">
          <template #icon><icon-plus /></template>
          短信模板新建
        </a-button>
      </template>
      
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="模板ID" class="form-item">
          <a-input v-model="searchForm.templateId" placeholder="请输入模板ID" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="短信类型" class="form-item">
          <a-select v-model="searchForm.smsType" placeholder="请选择短信类型" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="营销类">营销类</a-option>
            <a-option value="通知类">通知类</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="短信模板" class="form-item">
          <a-input v-model="searchForm.template" placeholder="请输入短信模板" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="短信标项" class="form-item">
          <a-input v-model="searchForm.label" placeholder="请输入短信标项" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="内容" class="form-item">
          <a-input v-model="searchForm.content" placeholder="请输入内容" allow-clear style="width: 200px;" />
        </a-form-item>
        
        <a-form-item class="form-item-buttons">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格区域 -->
    <a-card :bordered="false" class="table-card">
      <a-table 
        :columns="columns" 
        :data="filteredList" 
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="onPageChange"
      >
        <template #status="{ record }">
          <a-tag v-if="record.status === '使用中'" color="green">使用中</a-tag>
          <a-tag v-else color="gray">停用</a-tag>
        </template>
        
        <template #action="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleView(record)">
              <template #icon><icon-eye /></template>
              查看
            </a-button>
            <a-button type="text" size="small" @click="handleEdit(record)">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-button type="text" size="small" status="danger" @click="handleDelete(record)">
              <template #icon><icon-delete /></template>
              删除
            </a-button>
            <a-button type="text" size="small" @click="handleCopy(record)">
              <template #icon><icon-copy /></template>
              另起全复本
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconRefresh, IconEye, IconEdit, IconDelete, IconCopy } from '@arco-design/web-vue/es/icon'
import { listSmsTemplates } from '@/services/channelService'

const router = useRouter()
const list = ref<any[]>([])
const loading = ref(false)

const searchForm = reactive({
  templateId: '',
  smsType: '',
  template: '',
  label: '',
  content: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { title: '模板ID', dataIndex: 'templateId', width: 180 },
  { title: '短信类型', dataIndex: 'smsType', width: 120 },
  { title: '一级场景', dataIndex: 'primaryScene', width: 150 },
  { title: '策略tag', dataIndex: 'strategyTag', width: 200 },
  { title: '短信标项', dataIndex: 'label', width: 200 },
  { title: '短信模板', dataIndex: 'template', width: 200 },
  { title: '内容', dataIndex: 'content', ellipsis: true, tooltip: true, width: 300 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '操作', slotName: 'action', width: 280, fixed: 'right' }
]

const filteredList = computed(() => {
  let result = [...list.value]
  
  if (searchForm.templateId) {
    result = result.filter(item => item.templateId?.includes(searchForm.templateId))
  }
  if (searchForm.smsType) {
    result = result.filter(item => item.smsType === searchForm.smsType)
  }
  if (searchForm.template) {
    result = result.filter(item => item.template?.includes(searchForm.template))
  }
  if (searchForm.label) {
    result = result.filter(item => item.label?.includes(searchForm.label))
  }
  if (searchForm.content) {
    result = result.filter(item => item.content?.includes(searchForm.content))
  }
  
  pagination.total = result.length
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

async function load() {
  loading.value = true
  try {
    list.value = await listSmsTemplates()
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.templateId = ''
  searchForm.smsType = ''
  searchForm.template = ''
  searchForm.label = ''
  searchForm.content = ''
  pagination.current = 1
}

function onPageChange(page: number) {
  pagination.current = page
}

function handleCreate() {
  router.push('/touch/channel/sms-template/create')
}

function handleView(record: any) {
  Message.info(`查看模板：${record.templateId}`)
}

function handleEdit(record: any) {
  router.push(`/touch/channel/sms-template/edit/${record.id}`)
}

function handleDelete(record: any) {
  Message.info(`删除模板：${record.templateId}`)
}

function handleCopy(record: any) {
  router.push({
    path: '/touch/channel/sms-template/create',
    query: { copyFrom: record.id }
  })
}

load()
</script>

<style scoped>
.sms-template-container {
  padding: 20px;
  background: #f2f3f5;
  min-height: 100vh;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 0;
}

.form-item {
  margin-right: 24px;
  margin-bottom: 0;
}

.form-item :deep(.arco-form-item-label) {
  width: 84px;
  text-align: right;
  padding-right: 12px;
}

.form-item-buttons {
  margin-left: auto;
  margin-bottom: 0;
}

.table-card {
  background: #fff;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table) {
  font-size: 14px;
}

:deep(.arco-pagination) {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
