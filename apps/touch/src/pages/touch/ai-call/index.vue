<template>
  <div class="ai-call-container">
    <a-card :bordered="false" class="search-card">
      <template #title>
        <div class="card-title">
          <icon-phone />
          AI外呼模板
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            新建模板
          </a-button>
        </a-space>
      </template>

      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="模板名称" class="form-item">
          <a-input v-model="searchForm.name" placeholder="请输入模板名称" allow-clear style="width: 160px;" />
        </a-form-item>

        <a-form-item label="供应商" class="form-item">
          <a-select v-model="searchForm.vendor" placeholder="请选择供应商" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="阿里云">阿里云</a-option>
            <a-option value="腾讯云">腾讯云</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="状态" class="form-item">
          <a-select v-model="searchForm.status" placeholder="请选择状态" allow-clear style="width: 140px;">
            <a-option value="">全部</a-option>
            <a-option value="使用中">使用中</a-option>
            <a-option value="停用">停用</a-option>
          </a-select>
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
          <a-tag v-else color="gray">{{ record.status }}</a-tag>
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
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPhone, IconPlus, IconSearch, IconRefresh, IconEye, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon'
import { listAiCallTemplates } from '@/services/channelService'

const router = useRouter()
const list = ref<any[]>([])
const loading = ref(false)

const searchForm = reactive({
  name: '',
  vendor: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '模板名称', dataIndex: 'name', width: 200 },
  { title: '供应商', dataIndex: 'vendor', width: 120 },
  { title: '场景', dataIndex: 'scene', width: 150 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '操作', slotName: 'action', width: 200, fixed: 'right' }
]

const filteredList = computed(() => {
  let result = [...list.value]

  if (searchForm.name) {
    result = result.filter(item => item.name?.includes(searchForm.name))
  }
  if (searchForm.vendor) {
    result = result.filter(item => item.vendor === searchForm.vendor)
  }
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status)
  }

  pagination.total = result.length
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

async function load() {
  loading.value = true
  try {
    list.value = await listAiCallTemplates()
    pagination.total = list.value.length
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.name = ''
  searchForm.vendor = ''
  searchForm.status = ''
  pagination.current = 1
}

function onPageChange(page: number) {
  pagination.current = page
}

function handleCreate() {
  router.push('/touch/ai-call/create')
}

function handleView(record: any) {
  Message.info(`查看模板：${record.name}`)
}

function handleEdit(record: any) {
  router.push(`/touch/ai-call/edit/${record.id}`)
}

function handleDelete(record: any) {
  Message.info(`删除模板：${record.name}`)
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.ai-call-container {
  padding: 20px;
  background: #f2f3f5;
  min-height: 100vh;
}

.search-card {
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--color-text-1);
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
