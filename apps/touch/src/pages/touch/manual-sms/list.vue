<template>
  <div class="manual-sms-list-container">
    <a-card class="header-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <icon-send />
          手工短信列表
        </div>
      </template>
      <div class="header-actions">
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            新增手工短信
          </a-button>
          <a-button type="primary" status="success" @click="handleSearch">
            <template #icon><icon-search /></template>
            筛选
          </a-button>
          <a-button @click="resetSearch">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
        </a-space>
      </div>
    </a-card>
    <a-card class="search-card" :bordered="false">
      <a-form :model="searchForm" layout="horizontal">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item field="batchName" label="批次名称">
              <a-input v-model="searchForm.batchName" placeholder="请输入批次名称" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="creator" label="创建人">
              <a-input v-model="searchForm.creator" placeholder="请输入创建人" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="createTime" label="创建时间">
              <a-range-picker v-model="searchForm.createTime" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card class="list-card" :bordered="false">
      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="onPageChange" @page-size-change="onPageSizeChange">
        <template #columns>
          <a-table-column title="批次名称" data-index="batchName" />
          <a-table-column title="模版名称" data-index="templateName" />
          <a-table-column title="发送人数" data-index="recipientCount" />
          <a-table-column title="创建人" data-index="creator" />
          <a-table-column title="创建时间" data-index="createTime" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" :width="180">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">
                  <template #icon><icon-eye /></template>
                  查看
                </a-button>
                <a-button type="text" size="small" @click="handleCopy(record)">
                  <template #icon><icon-copy /></template>
                  复制
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconSend, IconPlus, IconSearch, IconRefresh, IconEye, IconCopy } from '@arco-design/web-vue/es/icon'
const router = useRouter()
const searchForm = reactive({ batchName: '', createTime: [], creator: '' })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true })
const mockData = [
  { id: 1, batchName: '营销活动短信批次', templateName: '营销活动模板', recipientCount: 1250, createTime: '2024-01-15 10:30:45', status: 'completed', creator: '张三' },
  { id: 2, batchName: '会员生日祝福批次', templateName: '生日祝福模板', recipientCount: 568, createTime: '2024-01-20 14:22:18', status: 'completed', creator: '李四' },
  { id: 3, batchName: '账户余额提醒批次', templateName: '余额提醒模板', recipientCount: 3250, createTime: '2024-01-25 09:15:33', status: 'completed', creator: '王五' },
  { id: 4, batchName: '新品上市通知批次', templateName: '新品通知模板', recipientCount: 4500, createTime: '2024-02-01 16:45:20', status: 'completed', creator: '赵六' },
  { id: 5, batchName: '服务调整通知批次', templateName: '服务通知模板', recipientCount: 2800, createTime: '2024-02-05 11:10:05', status: 'completed', creator: '钱七' }
]
const getStatusColor = (status) => ({ pending: 'blue', sending: 'orange', completed: 'green', failed: 'red' }[status] || 'gray')
const getStatusText = (status) => ({ pending: '待发送', sending: '发送中', completed: '已完成', failed: '发送失败' }[status] || '未知状态')
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]
    if (searchForm.batchName) filteredData = filteredData.filter(item => item.batchName.includes(searchForm.batchName))
    if (searchForm.creator) filteredData = filteredData.filter(item => item.creator.includes(searchForm.creator))
    pagination.total = filteredData.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
    loading.value = false
  }, 500)
}
const handleSearch = () => { pagination.current = 1; loadData() }
const resetSearch = () => { searchForm.batchName = ''; searchForm.createTime = []; searchForm.creator = ''; pagination.current = 1; loadData() }
const onPageChange = (page) => { pagination.current = page; loadData() }
const onPageSizeChange = (pageSize) => { pagination.pageSize = pageSize; pagination.current = 1; loadData() }
const handleCreate = () => { router.push('/touch/manual-sms') }
const handleView = (record) => { Message.info(`查看批次：${record.batchName}`) }
const handleCopy = (record) => { router.push({ path: '/touch/manual-sms', query: { copyFrom: record.id } }) }
onMounted(() => { loadData() })
</script>

<style scoped>
.manual-sms-list-container { padding: 24px; background-color: var(--color-fill-2); min-height: 100vh; }
.header-card, .search-card, .list-card { margin-bottom: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
.card-title { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--color-text-1); }
.header-actions { display: flex; justify-content: flex-end; }
@media (max-width: 1200px) { .manual-sms-list-container { padding: 16px; } }
@media (max-width: 768px) { .header-card, .search-card, .list-card { padding: 16px; } }
</style>
