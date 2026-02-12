<template>
  <div class="touch-query-detail-container">
    <a-card :bordered="false" title="触达查询" class="search-card">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="姓名" class="form-item">
          <a-input v-model="searchForm.name" placeholder="请输入姓名" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="手机号码" class="form-item">
          <a-input v-model="searchForm.phone" placeholder="请输入手机号码" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="模板ID" class="form-item">
          <a-input v-model="searchForm.templateId" placeholder="请输入模板ID" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="通话时长(秒)" class="form-item">
          <a-input v-model="searchForm.callDuration" placeholder="请输入时长" allow-clear style="width: 160px;" />
        </a-form-item>
        
        <a-form-item label="触达通道" class="form-item">
          <a-select v-model="searchForm.channel" placeholder="请选择触达通道" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="sms">短信</a-option>
            <a-option value="ai_call">AI外呼</a-option>
            <a-option value="manual_call">人工外呼</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="厂商" class="form-item">
          <a-select v-model="searchForm.vendor" placeholder="请选择厂商" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="自营">自营</a-option>
            <a-option value="阿里云">阿里云</a-option>
            <a-option value="腾讯云">腾讯云</a-option>
            <a-option value="百应">百应</a-option>
            <a-option value="九四">九四</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="触达类型" class="form-item">
          <a-select v-model="searchForm.type" placeholder="请选择" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="短信">短信</a-option>
            <a-option value="AI外呼">AI外呼</a-option>
            <a-option value="人工外呼">人工外呼</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="触达状态" class="form-item">
          <a-select v-model="searchForm.status" placeholder="请选择触达状态" allow-clear style="width: 160px;">
            <a-option value="">全部</a-option>
            <a-option value="success">成功</a-option>
            <a-option value="failed">失败</a-option>
            <a-option value="pending">待处理</a-option>
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
        <template #status="{ record }">
          <a-tag v-if="record.status === 'success'" color="green">成功</a-tag>
          <a-tag v-else-if="record.status === 'failed'" color="red">失败</a-tag>
          <a-tag v-else color="orange">待处理</a-tag>
        </template>
        
        <template #audioRecord="{ record }">
          <a-button v-if="record.audioRecord" type="text" size="small" @click="handlePlayAudio(record)">
            <template #icon><icon-play-arrow /></template>
            播放
          </a-button>
          <span v-else style="color: #86909c;">-</span>
        </template>
        
        <template #action="{ record }">
          <a-button type="text" size="small" @click="handleViewDetail(record)">
            查看详情
          </a-button>
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
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconRefresh, IconPlayArrow } from '@arco-design/web-vue/es/icon'
import { listTouchDetails } from '@/services/queryService'

const list = ref<any[]>([])
const loading = ref(false)

const searchForm = reactive({
  name: '',
  phone: '',
  templateId: '',
  callDuration: '',
  channel: '',
  vendor: '',
  type: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { title: '触达对象', dataIndex: 'recipient', width: 120 },
  { title: '手机号码', dataIndex: 'phone', width: 140 },
  { title: '触达类型', dataIndex: 'type', width: 100 },
  { title: '模板ID', dataIndex: 'templateId', width: 180 },
  { title: '外部模板ID', dataIndex: 'externalTemplateId', width: 180 },
  { title: '通话时长(秒)', dataIndex: 'callDuration', width: 120 },
  { title: '对话录音', slotName: 'audioRecord', width: 100 },
  { title: '触达通道', dataIndex: 'channel', width: 120 },
  { title: '厂商', dataIndex: 'vendor', width: 100 },
  { title: '触达状态', slotName: 'status', width: 100 },
  { title: '详细信息', slotName: 'action', width: 100, fixed: 'right' },
  { title: '触达时间', dataIndex: 'time', width: 180 }
]

const filteredList = computed(() => {
  let result = [...list.value]
  
  if (searchForm.name) {
    result = result.filter(item => item.recipient?.includes(searchForm.name))
  }
  if (searchForm.phone) {
    result = result.filter(item => item.phone?.includes(searchForm.phone))
  }
  if (searchForm.templateId) {
    result = result.filter(item => item.templateId?.includes(searchForm.templateId))
  }
  if (searchForm.callDuration) {
    result = result.filter(item => item.callDuration?.toString().includes(searchForm.callDuration))
  }
  if (searchForm.channel) {
    result = result.filter(item => item.channel === searchForm.channel)
  }
  if (searchForm.vendor) {
    result = result.filter(item => item.vendor === searchForm.vendor)
  }
  if (searchForm.type) {
    result = result.filter(item => item.type === searchForm.type)
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
    list.value = await listTouchDetails()
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
  searchForm.templateId = ''
  searchForm.callDuration = ''
  searchForm.channel = ''
  searchForm.vendor = ''
  searchForm.type = ''
  searchForm.status = ''
  pagination.current = 1
}

function onPageChange(page: number) {
  pagination.current = page
}

function handlePlayAudio(record: any) {
  Message.info(`播放录音：${record.recipient}`)
}

function handleViewDetail(record: any) {
  Message.info(`查看详情：${record.recipient}`)
}

load()
</script>

<style scoped>
.touch-query-detail-container {
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
  width: 100px;
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
