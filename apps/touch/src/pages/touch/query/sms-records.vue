<template>
  <div class="sms-records-container">
    <a-card :bordered="false" title="短信管理" class="search-card">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="姓名" class="form-item">
          <a-input v-model="searchForm.name" placeholder="请输入姓名" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="手机号" class="form-item">
          <a-input v-model="searchForm.phone" placeholder="请输入手机号" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="短信内容" class="form-item">
          <a-input v-model="searchForm.content" placeholder="请输入内容" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="模板ID" class="form-item">
          <a-input v-model="searchForm.templateId" placeholder="请输入模板ID" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="短信通道商" class="form-item">
          <a-select v-model="searchForm.vendor" placeholder="请选择" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="阿里云短信">阿里云短信</a-option>
            <a-option value="腾讯云短信">腾讯云短信</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="短信厂商" class="form-item">
          <a-select v-model="searchForm.vendor" placeholder="请选择" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="阿里云短信">阿里云短信</a-option>
            <a-option value="腾讯云短信">腾讯云短信</a-option>
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
        <template #sendStatus="{ record }">
          <a-tag v-if="record.sendStatus === 'success'" color="green">发送成功</a-tag>
          <a-tag v-else-if="record.sendStatus === 'failed'" color="red">发送失败</a-tag>
          <a-tag v-else color="orange">发送中</a-tag>
        </template>
      </a-table>
      
      <!-- 暂无数据提示 -->
      <div v-if="filteredList.length === 0 && !loading" class="empty-tip">
        暂无数据
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon'
import { listSmsRecords } from '@/services/queryService'

const list = ref<any[]>([])
const loading = ref(false)

const searchForm = reactive({
  name: '',
  phone: '',
  content: '',
  templateId: '',
  vendor: '',
  smsVendor: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { title: '发送对象', dataIndex: 'recipient', width: 120 },
  { title: '手机号码', dataIndex: 'phone', width: 140 },
  { title: '模板ID', dataIndex: 'templateId', width: 120 },
  { title: '发送内容', dataIndex: 'content', ellipsis: true, tooltip: true },
  { title: '短信通道商', dataIndex: 'vendor', width: 120 },
  { title: '短信厂商', dataIndex: 'smsVendor', width: 120 },
  { title: '发送状态', dataIndex: 'sendStatus', slotName: 'sendStatus', width: 120 },
  { title: '发送时间', dataIndex: 'sendTime', width: 180 }
]

const filteredList = computed(() => {
  let result = [...list.value]
  
  if (searchForm.name) {
    result = result.filter(item => item.recipient?.includes(searchForm.name))
  }
  if (searchForm.phone) {
    result = result.filter(item => item.phone?.includes(searchForm.phone))
  }
  if (searchForm.content) {
    result = result.filter(item => item.content?.includes(searchForm.content))
  }
  if (searchForm.templateId) {
    result = result.filter(item => item.templateId?.includes(searchForm.templateId))
  }
  if (searchForm.vendor) {
    result = result.filter(item => item.vendor === searchForm.vendor)
  }
  if (searchForm.smsVendor) {
    result = result.filter(item => item.smsVendor === searchForm.smsVendor)
  }
  
  pagination.total = result.length
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

async function load() {
  loading.value = true
  try {
    list.value = await listSmsRecords()
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.content = ''
  searchForm.templateId = ''
  searchForm.vendor = ''
  searchForm.smsVendor = ''
  pagination.current = 1
}

function onPageChange(page: number) {
  pagination.current = page
}

load()
</script>

<style scoped>
.sms-records-container {
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

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #86909c;
  font-size: 14px;
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
