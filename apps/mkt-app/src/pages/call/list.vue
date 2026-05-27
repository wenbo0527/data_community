<template>
  <div class="call-list-page">
    <div class="page-header">
      <a-space>
        <a-button type="primary" @click="handleImport">
          <template #icon><IconUpload /></template>
          批量导入
        </a-button>
        <a-button @click="handleExport">
          <template #icon><IconDownload /></template>
          导出名单
        </a-button>
      </a-space>
      <a-input-search v-model="searchKeyword" placeholder="搜索客户姓名/手机号" style="width: 240px; margin-left: auto;" @search="handleSearch" />
    </div>
    <a-table :columns="listColumns" :data="listData" :loading="loading" :pagination="pagination">
      <template #index="{ rowIndex }">{{ rowIndex + 1 }}</template>
      <template #status="{ record }">
        <a-tag :color="record.status === 'pending' ? 'orange' : record.status === 'called' ? 'green' : 'gray'">
          {{ record.statusText }}
        </a-tag>
      </template>
      <template #actions="{ record }">
        <a-button type="text" size="small" @click="handleCall(record)">呼叫</a-button>
        <a-button type="text" size="small" @click="handleDetail(record)">详情</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconUpload, IconDownload } from '@arco-design/web-vue/es/icon'

const loading = ref(false)
const searchKeyword = ref('')
const pagination = { pageSize: 10, total: 100 }

const listColumns = [
  { title: '序号', slotName: 'index', width: 60 },
  { title: '客户姓名', dataIndex: 'customerName' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '意向产品', dataIndex: 'product' },
  { title: '状态', slotName: 'status', align: 'center', width: 100 },
  { title: '分配坐席', dataIndex: 'assignee' },
  { title: '最近联系', dataIndex: 'lastCall', width: 180 },
  { title: '操作', slotName: 'actions', align: 'center', width: 150 }
]

const listData = ref([
  { id: '1', customerName: '张三', phone: '138****1234', product: '消费贷', status: 'pending', statusText: '待拨打', assignee: '李四', lastCall: '-' },
  { id: '2', customerName: '李四', phone: '139****5678', product: '信用卡', status: 'called', statusText: '已拨打', assignee: '张三', lastCall: '2026-05-27 10:30' },
  { id: '3', customerName: '王五', phone: '137****9012', product: '消费贷', status: 'called', statusText: '已拨打', assignee: '李四', lastCall: '2026-05-27 09:15' }
])

const handleImport = () => console.log('批量导入')
const handleExport = () => console.log('导出名单')
const handleSearch = () => console.log('搜索:', searchKeyword.value)
const handleCall = (record: any) => console.log('呼叫:', record)
const handleDetail = (record: any) => console.log('详情:', record)
</script>

<style scoped>
.call-list-page {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
</style>