<template>
  <!-- @prd: metadata-collection -->
  <div class="metadata-list">
    <div class="page-header">
      <h2>元数据采集任务列表</h2>
      <a-space>
        <a-button @click="fetchList" :loading="loading">
          <template #icon><IconRefresh /></template>
          刷新
        </a-button>
        <a-popover position="bottom" trigger="click">
          <a-button type="primary">
            <template #icon><IconPlus /></template>
            新建采集任务
          </a-button>
          <template #content>
            <div style="display: flex; flex-direction: column; gap: 4px; min-width: 200px">
              <a-button type="text" size="small" @click="openCreate">从表单创建（含完整配置）</a-button>
              <a-button type="text" size="small" @click="quickCreate">快速创建（仅名称和数据源）</a-button>
            </div>
          </template>
        </a-popover>
      </a-space>
    </div>

    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search v-model="keyword" placeholder="搜索任务名 / 任务 ID" @search="fetchList" />
        </a-col>
        <a-col :span="6">
          <a-select v-model="dataSource" allow-clear placeholder="数据源类型" @change="fetchList">
            <a-option v-for="t in ['Doris', 'Hive', 'Oracle', 'MySQL']" :key="t" :value="t">{{ t }}</a-option>
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
        <a-col :span="4">
          <a-tag>{{ totalLabel }}</a-tag>
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
        <span v-if="record.errorMessage" class="error-hint">· {{ record.errorMessage }}</span>
      </template>
      <template #triggeredBy="{ record }">
        <a-tag size="small" :color="record.triggeredBy === 'shelf' ? 'purple' : 'gray'">
          {{ triggeredText(record.triggeredBy) }}
        </a-tag>
        <span v-if="record.sourceAssetName" class="source-asset">
          · {{ record.sourceAssetName }}
        </span>
      </template>
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="runNow(record)" :disabled="record.status === 'running'">
            <template #icon><IconPlayCircleFill /></template>
            运行
          </a-button>
          <a-button type="text" size="small" @click="rerunOne(record)">重跑</a-button>
          <a-popconfirm
            content="确认删除此任务？"
            @ok="removeOne(record)"
          >
            <a-button type="text" size="small" status="danger">
              <template #icon><IconClose /></template>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>

    <!-- 快速创建 Modal -->
    <a-modal
      v-model:visible="quickVisible"
      title="快速创建采集任务"
      :width="480"
      :ok-text="'创建并运行'"
      @ok="confirmQuickCreate"
      @cancel="quickVisible = false"
    >
      <a-form :model="quickForm" layout="vertical">
        <a-form-item label="任务名称">
          <a-input v-model="quickForm.taskName" placeholder="例如：核心 MySQL 表采集" />
        </a-form-item>
        <a-form-item label="数据源">
          <a-select v-model="quickForm.dataSourceType">
            <a-option v-for="t in ['Doris', 'Hive', 'Oracle', 'MySQL']" :key="t" :value="t">{{ t }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="采集对象">
          <a-select v-model="quickForm.assetType">
            <a-option value="表">表</a-option>
            <a-option value="指标">指标</a-option>
            <a-option value="API">API</a-option>
            <a-option value="变量">变量</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh, IconPlayCircleFill, IconClose } from '@arco-design/web-vue/es/icon'
import {
  getMetadataTasks,
  runMetadataTask,
  rerunTask,
  deleteTask,
  startMetadataTaskAsync,
  type MetadataTask
} from '@/mock-dca/metadata-bus'

const router = useRouter()
const loading = ref(false)
const keyword = ref('')
const dataSource = ref<string | undefined>(undefined)
const assetType = ref<string | undefined>(undefined)

const list = ref<MetadataTask[]>([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showPageSize: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '任务名称', dataIndex: 'taskName', width: 240 },
  { title: '数据源', dataIndex: 'dataSourceType', width: 90 },
  { title: '对象', dataIndex: 'assetType', width: 70 },
  { title: '状态', dataIndex: 'status', width: 110, slotName: 'status' },
  { title: '触发来源', dataIndex: 'triggeredBy', width: 200, slotName: 'triggeredBy' },
  { title: '创建时间', dataIndex: 'createdAt', width: 160 },
  { title: '操作', dataIndex: 'actions', width: 200, slotName: 'actions', fixed: 'right' }
]

const statusColor = (s?: string) => {
  const map: Record<string, string> = { pending: 'arcoblue', running: 'orange', success: 'green', failed: 'red' }
  return map[s || 'pending'] || 'gray'
}
const statusText = (s?: string) => {
  const map: Record<string, string> = { pending: '待执行', running: '进行中', success: '成功', failed: '失败' }
  return map[s || 'pending'] || '未知'
}
const triggeredText = (t?: string) => t === 'shelf' ? '上下架同步' : t === 'user' ? '人工' : ''

const totalLabel = computed(() => `共 ${pagination.total} 个任务`)

const fetchList = () => {
  loading.value = true
  try {
    let items = getMetadataTasks()
    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      items = items.filter(t =>
        t.taskName.toLowerCase().includes(kw) ||
        t.id.toLowerCase().includes(kw)
      )
    }
    if (dataSource.value) items = items.filter(t => t.dataSourceType === dataSource.value)
    if (assetType.value) items = items.filter(t => t.assetType === assetType.value)
    pagination.total = items.length
    list.value = items.slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize)
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

const openCreate = () => {
  router.push('/management/asset-management/basic-management/metadata-collection')
}
const quickCreate = () => {
  Object.assign(quickForm, { taskName: '', dataSourceType: 'Hive', assetType: '表' })
  quickVisible.value = true
}

const quickVisible = ref(false)
const quickForm = reactive({
  taskName: '',
  dataSourceType: 'Hive' as 'Doris' | 'Hive' | 'Oracle' | 'MySQL',
  assetType: '表' as '指标' | 'API' | '变量' | '表'
})
const confirmQuickCreate = async () => {
  if (!quickForm.taskName.trim()) {
    Message.warning('请输入任务名')
    return
  }
  const task = await import('@/mock-dca/metadata-bus').then(m => m.createMetadataTask({
    taskName: quickForm.taskName,
    dataSourceType: quickForm.dataSourceType,
    assetType: quickForm.assetType
  }))
  await startMetadataTaskAsync(task.id)
  Message.success(`已创建任务 ${task.id}，并自动开始运行`)
  quickVisible.value = false
  fetchList()
}

const runNow = async (record: MetadataTask) => {
  if (record.status === 'running') {
    Message.warning('该任务正在运行中')
    return
  }
  Message.loading({ content: `正在运行 ${record.id}...`, duration: 800 })
  const t = await runMetadataTask(record.id)
  if (t.status === 'success') {
    Message.success(`${t.id} 运行成功，已登记到上下架台账`)
  } else {
    Message.warning(`${t.id} 运行失败：${t.errorMessage}`)
  }
  fetchList()
}

const rerunOne = (record: MetadataTask) => {
  const newTask = rerunTask(record.id)
  if (newTask) {
    Message.success(`已创建重跑任务 ${newTask.id}`)
    fetchList()
  }
}

const removeOne = (record: MetadataTask) => {
  if (deleteTask(record.id)) {
    Message.success('已删除')
    fetchList()
  }
}

let refreshTimer: any = null
onMounted(() => {
  fetchList()
  refreshTimer = setInterval(() => fetchList(), 1000)
})
onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.metadata-list { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; }
.search-section { margin-bottom: 16px; }
.error-hint { color: #ff7d00; font-size: 12px; margin-left: 6px; }
.source-asset { color: #722ed1; font-size: 12px; margin-left: 4px; }
</style>
