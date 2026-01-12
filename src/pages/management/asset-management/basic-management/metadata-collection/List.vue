<template>
  <div class="metadata-list">
    <div class="page-header">
      <h2>元数据采集任务列表</h2>
      <a-space>
        <a-button type="primary" @click="goCreate">
          <template #icon><icon-plus /></template>
          新建采集任务
        </a-button>
        <a-button @click="fetchList" :loading="loading">
          刷新
        </a-button>
      </a-space>
    </div>

    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search v-model="keyword" placeholder="搜索任务名称" @search="fetchList" />
        </a-col>
        <a-col :span="6">
          <a-select v-model="dataSource" allow-clear placeholder="数据源类型" @change="fetchList">
            <a-option value="Doris">Doris</a-option>
            <a-option value="Hive">Hive</a-option>
            <a-option value="Oracle">Oracle</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select v-model="assetType" allow-clear placeholder="采集对象类型" @change="fetchList">
            <a-option value="指标">指标</a-option>
            <a-option value="API">API</a-option>
            <a-option value="变量">变量</a-option>
            <a-option value="表">表</a-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <a-table
      :columns="columns"
      :data="list"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template #status="{ record }">
        <a-tag :color="statusColor(record.status)">{{ statusText(record.status) }}</a-tag>
      </template>
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="viewDetail(record)">查看</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { getMetadataTasks } from '@/api/metadata'

const router = useRouter()
const loading = ref(false)
const keyword = ref('')
const dataSource = ref<string | undefined>(undefined)
const assetType = ref<string | undefined>(undefined)

const list = ref<any[]>([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showPageSize: true
})

const columns = [
  { title: '任务名称', dataIndex: 'taskName', width: 240 },
  { title: '数据源类型', dataIndex: 'dataSourceType', width: 120 },
  { title: '采集对象类型', dataIndex: 'assetType', width: 120 },
  { title: '状态', dataIndex: 'status', width: 120, slotName: 'status' },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'actions', width: 120, slotName: 'actions', fixed: 'right' }
]

const statusColor = (s?: string) => {
  const map: Record<string, string> = { pending: 'arcoblue', running: 'orange', success: 'green', failed: 'red' }
  return map[s || 'pending'] || 'gray'
}
const statusText = (s?: string) => {
  const map: Record<string, string> = { pending: '待执行', running: '进行中', success: '成功', failed: '失败' }
  return map[s || 'pending'] || '未知'
}

const fetchList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined,
      dataSourceType: dataSource.value || undefined,
      assetType: assetType.value || undefined
    }
    const res = await getMetadataTasks(params)
    const items = (res as any)?.list || []
    const total = (res as any)?.total || items.length || 0
    list.value = items
    pagination.total = total
  } catch (e: any) {
    Message.warning(e?.message || '获取任务列表失败')
    list.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const onPageChange = (p: number) => {
  pagination.current = p
  fetchList()
}
const onPageSizeChange = (ps: number) => {
  pagination.pageSize = ps
  pagination.current = 1
  fetchList()
}

const goCreate = () => {
  router.push('/management/asset-management/basic-management/metadata-collection/create')
}
const viewDetail = (record: any) => {
  const id = record.id ?? record.taskName
  router.push(`/management/asset-management/basic-management/metadata-collection/${encodeURIComponent(id)}`)
}

onMounted(fetchList)
</script>

<style scoped>
.metadata-list {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.search-section {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--color-bg-2);
  border-radius: 8px;
}
</style>

