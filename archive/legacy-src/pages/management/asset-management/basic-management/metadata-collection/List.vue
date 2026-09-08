<template>
  <div class="metadata-list">
    <div class="page-header">
      <h2>元数据采集</h2>
      <a-space>
        <a-button type="primary" @click="goCreate">
          <template #icon><IconPlus /></template>
          新建任务
        </a-button>
        <a-button @click="fetchList" :loading="loading">
          刷新
        </a-button>
      </a-space>
    </div>

    <a-tabs default-active-key="extraction" @change="handleTabChange">
      <a-tab-pane key="extraction" title="数据抽取任务">
        <!-- 抽取任务筛选 -->
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
                <a-option value="MySQL">MySQL</a-option>
              </a-select>
            </a-col>
            <a-col :span="6">
              <a-select v-model="statusFilter" allow-clear placeholder="运行状态" @change="fetchList">
                <a-option value="success">成功</a-option>
                <a-option value="running">进行中</a-option>
                <a-option value="failed">失败</a-option>
              </a-select>
            </a-col>
          </a-row>
        </div>
      </a-tab-pane>
      <a-tab-pane key="synchronization" title="同步任务">
        <!-- 同步任务筛选 -->
        <div class="search-section">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-input-search v-model="keyword" placeholder="搜索同步任务" @search="fetchList" />
            </a-col>
            <a-col :span="6">
              <a-select v-model="syncType" allow-clear placeholder="同步类型" @change="fetchList">
                <a-option value="full">全量同步</a-option>
                <a-option value="incremental">增量同步</a-option>
              </a-select>
            </a-col>
          </a-row>
        </div>
      </a-tab-pane>
    </a-tabs>

    <a-table
      :columns="currentColumns"
      :data="list"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template #status="{ record }">
        <a-tag :color="statusColor(record.status)">{{ statusText(record.status) }}</a-tag>
      </template>
      <template #schedule="{ record }">
        <a-tag color="gray" bordered>{{ record.schedule }}</a-tag>
      </template>
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="runTask(record)">执行</a-button>
          <a-button type="text" size="small" @click="viewDetail(record)">详情</a-button>
          <a-button type="text" status="danger" size="small">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('extraction')
const keyword = ref('')
const dataSource = ref<string | undefined>(undefined)
const statusFilter = ref<string | undefined>(undefined)
const syncType = ref<string | undefined>(undefined)
const assetType = ref<string | undefined>(undefined)

const list = ref<any[]>([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showPageSize: true
})

// 抽取任务列定义
const extractionColumns = [
  { title: '任务名称', dataIndex: 'taskName', width: 200 },
  { title: '数据源', dataIndex: 'dataSourceType', width: 120 },
  { title: '抽取对象', dataIndex: 'targetObject', width: 150 },
  { title: '调度策略', dataIndex: 'schedule', slotName: 'schedule', width: 150 },
  { title: '最近运行时间', dataIndex: 'lastRunTime', width: 180 },
  { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
  { title: '操作', dataIndex: 'actions', width: 180, slotName: 'actions', fixed: 'right' }
]

// 同步任务列定义
const syncColumns = [
  { title: '任务名称', dataIndex: 'taskName', width: 200 },
  { title: '源端', dataIndex: 'source', width: 120 },
  { title: '目标端', dataIndex: 'target', width: 120 },
  { title: '同步类型', dataIndex: 'syncType', width: 120 },
  { title: '调度策略', dataIndex: 'schedule', slotName: 'schedule', width: 150 },
  { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
  { title: '操作', dataIndex: 'actions', width: 180, slotName: 'actions', fixed: 'right' }
]

const currentColumns = computed(() => {
  return activeTab.value === 'extraction' ? extractionColumns : syncColumns
})

const statusColor = (s?: string) => {
  const map: Record<string, string> = { pending: 'gray', running: 'arcoblue', success: 'green', failed: 'red' }
  return map[s || 'pending'] || 'gray'
}
const statusText = (s?: string) => {
  const map: Record<string, string> = { pending: '等待中', running: '执行中', success: '成功', failed: '失败' }
  return map[s || 'pending'] || '未知'
}

const handleTabChange = (key: string) => {
  activeTab.value = key
  pagination.current = 1
  fetchList()
}

// Mock 数据生成
const getMockData = (type: string) => {
  if (type === 'extraction') {
    return [
      { id: 1, taskName: '营销数据抽取_Doris', dataSourceType: 'Doris', targetObject: 'marketing_db.*', schedule: '每日 02:00', lastRunTime: '2023-10-27 02:05:00', status: 'success' },
      { id: 2, taskName: '客户信息抽取_Oracle', dataSourceType: 'Oracle', targetObject: 'crm_users', schedule: '每周一 01:00', lastRunTime: '2023-10-23 01:30:00', status: 'success' },
      { id: 3, taskName: '日志数据实时抽取', dataSourceType: 'Kafka', targetObject: 'app_logs', schedule: '实时', lastRunTime: '2023-10-27 10:00:00', status: 'running' },
      { id: 4, taskName: '财务报表抽取', dataSourceType: 'Excel', targetObject: 'finance_2023', schedule: '手动', lastRunTime: '2023-10-20 15:00:00', status: 'failed' },
    ]
  } else {
    return [
      { id: 101, taskName: '数仓同步_ODS->DWD', source: 'ODS_DB', target: 'DWD_DB', syncType: '全量同步', schedule: '每日 03:00', status: 'success' },
      { id: 102, taskName: '标签同步_ES', source: 'Tag_Service', target: 'ElasticSearch', syncType: '增量同步', schedule: '每小时', status: 'running' },
      { id: 103, taskName: '元数据同步至Atlas', source: 'Hive Metastore', target: 'Apache Atlas', syncType: '增量同步', schedule: '每日 00:00', status: 'success' },
    ]
  }
}

const fetchList = async () => {
  loading.value = true
  // 模拟 API 调用延迟
  setTimeout(() => {
    list.value = getMockData(activeTab.value)
    pagination.total = list.value.length
    loading.value = false
  }, 500)
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
  Message.info('跳转到新建任务页面')
  // router.push(...)
}

const runTask = (record: any) => {
  Message.success(`任务 "${record.taskName}" 已开始执行`)
  record.status = 'running'
}

const viewDetail = (record: any) => {
  Message.info(`查看任务详情: ${record.taskName}`)
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

