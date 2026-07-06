<template>
  <div class="evaluation-task-page">
    <DmtPageHeader title="评估任务中心" subtitle="统一承接变量准入评估、复评任务与探索课题转评估的执行闭环。" />

    <DmtStatGroup :items="statItems" />

    <a-card :bordered="false" class="filter-card">
      <a-space wrap size="large">
        <a-input v-model="filters.keyword" allow-clear placeholder="搜索任务名称 / 来源" style="width: 280px" />
        <a-select v-model="filters.status" allow-clear placeholder="任务状态" :options="statusOptions" style="width: 160px" />
        <a-select v-model="filters.taskType" allow-clear placeholder="任务类型" :options="taskTypeOptions" style="width: 180px" />
        <a-select v-model="filters.dataSourceId" allow-clear placeholder="数据源" :options="dataSourceOptions" style="width: 180px" />
        <a-button @click="resetFilters">重置</a-button>
      </a-space>
    </a-card>

    <a-card :bordered="false" class="table-card">
      <a-table :columns="columns" :data="filteredTasks" :pagination="false" row-key="id">
        <template #nameCell="{ record }">
          <a-link @click="openDetail(record.id)">{{ record.name }}</a-link>
        </template>
        <template #taskTypeCell="{ record }">
          <a-tag :color="taskTypeColor(record.taskType)">{{ taskTypeLabel(record.taskType) }}</a-tag>
        </template>
        <template #statusCell="{ record }">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>
        <template #sourceCell="{ record }">
          <a-space wrap>
            <a-tag v-for="name in record.sourceNames" :key="name" size="small">{{ name }}</a-tag>
            <a-tag v-if="record.sourceType === 'topic'" color="purple" size="small">来自课题</a-tag>
            <a-tag v-else color="arcoblue" size="small">来自变量</a-tag>
          </a-space>
        </template>
        <template #originCell="{ record }">
          <a-space wrap>
            <a-link
              v-for="(id, idx) in record.sourceIds.slice(0, 2)"
              :key="id + idx"
              @click="jumpToSource(record, id)"
            >
              {{ shortenId(id) }}
            </a-link>
            <span v-if="record.sourceIds.length > 2" class="muted">+{{ record.sourceIds.length - 2 }}</span>
            <span v-if="!record.sourceIds.length" class="muted">—</span>
          </a-space>
        </template>
        <template #actionsCell="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="openDetail(record.id)">详情</a-button>
            <a-button
              v-if="record.status !== 'completed'"
              type="text"
              size="small"
              :loading="runningTaskId === record.id"
              @click="handleRunTask(record.id)"
            >
              {{ record.status === 'running' ? '执行中…' : '执行任务' }}
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <a-drawer :visible="detailVisible" :width="880" title="评估任务详情" @cancel="detailVisible = false" unmount-on-close>
      <template v-if="currentTask">
        <!-- 顶部 Header：任务名 + 状态 + 横向字段带 -->
        <div class="detail-header">
          <div class="detail-header-top">
            <h3 class="detail-title">{{ currentTask.name }}</h3>
            <a-tag :color="statusColor(currentTask.status)" size="medium">{{ statusLabel(currentTask.status) }}</a-tag>
            <a-tag color="arcoblue" size="medium">{{ taskTypeLabel(currentTask.taskType) }}</a-tag>
          </div>
          <div class="detail-field-strip">
            <div class="detail-field-cell">
              <div class="detail-field-label">任务 ID</div>
              <div class="detail-field-value">{{ currentTask.id }}</div>
            </div>
            <div class="detail-field-cell">
              <div class="detail-field-label">数据源</div>
              <div class="detail-field-value">{{ currentTask.dataSourceName || '—' }}</div>
            </div>
            <div class="detail-field-cell">
              <div class="detail-field-label">变量类型</div>
              <div class="detail-field-value">{{ currentTask.variableTypeName || '—' }}</div>
            </div>
            <div class="detail-field-cell">
              <div class="detail-field-label">负责人</div>
              <div class="detail-field-value">{{ currentTask.owner }}</div>
            </div>
            <div class="detail-field-cell">
              <div class="detail-field-label">创建时间</div>
              <div class="detail-field-value">{{ currentTask.createdAt }}</div>
            </div>
            <div class="detail-field-cell">
              <div class="detail-field-label">完成时间</div>
              <div class="detail-field-value">{{ currentTask.finishedAt || '—' }}</div>
            </div>
          </div>
          <div class="detail-description">
            <div class="detail-description-label">任务说明</div>
            <div class="detail-description-value">{{ currentTask.description || '—' }}</div>
          </div>
        </div>

        <!-- 指标带：4 个指标横向 4 等分 -->
        <div v-if="currentTask.metrics" class="detail-metric-strip">
          <div class="detail-metric-cell">
            <div class="metric-label">覆盖率</div>
            <div class="metric-value">{{ metricPercent(currentTask.metrics.coverage) }}</div>
          </div>
          <div class="detail-metric-cell">
            <div class="metric-label">通过率</div>
            <div class="metric-value">{{ metricPercent(currentTask.metrics.passRate) }}</div>
          </div>
          <div class="detail-metric-cell">
            <div class="metric-label">IV</div>
            <div class="metric-value">{{ metricNumber(currentTask.metrics.iv) }}</div>
          </div>
          <div class="detail-metric-cell">
            <div class="metric-label">KS</div>
            <div class="metric-value">{{ metricNumber(currentTask.metrics.ks) }}</div>
          </div>
        </div>

        <!-- 结果摘要 -->
        <a-alert v-if="currentTask.resultSummary" type="info" :show-icon="false" class="detail-summary">
          {{ currentTask.resultSummary }}
        </a-alert>

        <!-- 目标变量 + 评估报告 左右两列 -->
        <a-row :gutter="16" class="detail-row">
          <a-col :span="12">
            <a-card title="目标变量" :bordered="false">
              <a-table :data="currentTask.targets" :pagination="false" row-key="id" :bordered="false">
                <template #columns>
                  <a-table-column title="变量名称" data-index="name" />
                  <a-table-column title="编码" data-index="code" :width="160" />
                  <a-table-column title="来源" :width="80">
                    <template #cell="{ record }">
                      <a-tag size="small">{{ sourceTypeLabel(record.sourceType) }}</a-tag>
                    </template>
                  </a-table-column>
                </template>
                <template #empty><a-empty description="暂无目标变量" /></template>
              </a-table>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="评估报告" :bordered="false">
              <template v-if="currentTaskReports.length">
                <a-alert v-if="hasExternalReport" type="success" :show-icon="false" class="detail-mini-alert">
                  外数评估能力已生成 {{ externalReportCount }} 份报告并回写变量档案。
                </a-alert>
                <a-table :data="currentTaskReports" :pagination="false" row-key="id" :bordered="false">
                  <template #columns>
                    <a-table-column title="类型" :width="90">
                      <template #cell="{ record }">
                        <a-tag size="small" :color="record.kind === 'external' ? 'arcoblue' : 'green'">
                          {{ record.kind === 'external' ? '外数' : '内部' }}
                        </a-tag>
                      </template>
                    </a-table-column>
                    <a-table-column title="报告名称" data-index="name" />
                    <a-table-column title="操作" :width="100" fixed="right">
                      <template #cell="{ record }">
                        <a-button
                          v-if="record.kind === 'external'"
                          type="text"
                          size="mini"
                          @click="openExternalReport(record)"
                        >
                          跳转
                        </a-button>
                        <a-button
                          v-else
                          type="text"
                          size="mini"
                          @click="openInternalReport(record)"
                        >
                          查看
                        </a-button>
                      </template>
                    </a-table-column>
                  </template>
                </a-table>
              </template>
              <a-empty v-else description="该任务尚未生成评估报告" />
            </a-card>
          </a-col>
        </a-row>
      </template>
    </a-drawer>

    <!-- 内部评估报告预览 -->
    <a-modal
      v-model:visible="internalPreviewVisible"
      :title="internalPreviewTitle"
      :width="560"
      :footer="false"
      unmount-on-close
    >
      <a-descriptions v-if="internalPreviewContent" :column="1" bordered>
        <a-descriptions-item label="报告 ID">{{ internalPreviewContent.id }}</a-descriptions-item>
        <a-descriptions-item label="报告类型">内部报告（DMT 评估引擎）</a-descriptions-item>
        <a-descriptions-item label="报告名称">{{ internalPreviewContent.name }}</a-descriptions-item>
        <a-descriptions-item v-if="internalPreviewContent.variableName" label="关联变量">
          <a-link @click="goToVariable(internalPreviewContent.variableId!)">
            {{ internalPreviewContent.variableName }}
          </a-link>
        </a-descriptions-item>
        <a-descriptions-item label="生成时间">{{ internalPreviewContent.generatedAt }}</a-descriptions-item>
        <a-descriptions-item label="结论摘要">{{ internalPreviewContent.summary }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import EvaluationTaskStore, {
  type EvaluationTaskMock,
  type EvaluationTaskReport,
  type EvaluationTaskStatus,
  type EvaluationTaskType
} from '@/modules/variable-hub/mock/evaluation/evaluation-task-store'
import { dataSources } from '@/modules/variable-hub/mock/variable-management/data-sources'
import { buildRiskAppUrl } from '@/utils/appLinks'
import DmtPageHeader from '@/modules/variable-hub/components/PageHeader.vue'
import DmtStatGroup from '@/modules/variable-hub/components/StatGroup.vue'

const router = useRouter()

const filters = reactive({
  keyword: '',
  status: '' as '' | EvaluationTaskStatus,
  taskType: '' as '' | EvaluationTaskType,
  dataSourceId: ''
})

const columns = [
  { title: '任务名称', dataIndex: 'name', slotName: 'nameCell', width: 240 },
  { title: '任务类型', dataIndex: 'taskType', slotName: 'taskTypeCell', width: 130 },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 120 },
  { title: '数据源', dataIndex: 'dataSourceName', width: 160 },
  { title: '评估来源', dataIndex: 'sourceNames', slotName: 'sourceCell' },
  { title: '源对象', dataIndex: 'sourceIds', slotName: 'originCell', width: 220 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
  { title: '操作', dataIndex: 'actions', slotName: 'actionsCell', width: 140 }
]

const summary = computed(() => EvaluationTaskStore.listSummary())

const statItems = computed(() => [
  { title: '任务总数', value: summary.value.total, iconText: '#', iconBg: '#f0f7ff', iconColor: '#165dff', subtitle: '当前可见' },
  { title: '待执行', value: summary.value.pending, iconText: '○', iconBg: '#f5f5f5', iconColor: '#86909c', subtitle: '尚未启动' },
  { title: '执行中', value: summary.value.running, iconText: '…', iconBg: '#e6fffb', iconColor: '#0fc6c2', subtitle: '进行中' },
  { title: '已完成', value: summary.value.completed, iconText: '✓', iconBg: '#e8ffea', iconColor: '#00b42a', subtitle: '已生成报告' }
])
const allTasks = computed(() => EvaluationTaskStore.listTasks())

const statusOptions = [
  { label: '待执行', value: 'pending' },
  { label: '执行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '执行失败', value: 'failed' }
]

const taskTypeOptions = [
  { label: '准入评估', value: 'access' },
  { label: '复评任务', value: 'recheck' },
  { label: '对比评估', value: 'comparison' }
]

const dataSourceOptions = dataSources.map((item) => ({
  label: item.name,
  value: item.id
}))

const filteredTasks = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()
  return allTasks.value.filter((item) => {
    if (keyword) {
      const inName = item.name.toLowerCase().includes(keyword)
      const inSource = item.sourceNames.some((name) => name.toLowerCase().includes(keyword))
      if (!inName && !inSource) return false
    }
    if (filters.status && item.status !== filters.status) return false
    if (filters.taskType && item.taskType !== filters.taskType) return false
    if (filters.dataSourceId && item.dataSourceId !== filters.dataSourceId) return false
    return true
  })
})

const detailVisible = ref(false)
const currentTaskId = ref('')
const currentTask = computed<EvaluationTaskMock | undefined>(() =>
  currentTaskId.value ? EvaluationTaskStore.getTaskById(currentTaskId.value) : undefined
)

const currentTaskReports = computed<EvaluationTaskReport[]>(() => currentTask.value?.reports || [])
const externalReportCount = computed(() => currentTaskReports.value.filter((r) => r.kind === 'external').length)
const hasExternalReport = computed(() => externalReportCount.value > 0)

// 内部报告预览
const internalPreviewVisible = ref(false)
const internalPreviewTitle = ref('评估报告（内部）')
const internalPreviewContent = ref<EvaluationTaskReport | null>(null)

const openInternalReport = (report: EvaluationTaskReport) => {
  internalPreviewTitle.value = report.name
  internalPreviewContent.value = report
  internalPreviewVisible.value = true
}

const openExternalReport = (report: EvaluationTaskReport) => {
  // 透传 risk-app 链接（与变量档案"查看外数评估"一致）
  const target = report.url?.startsWith('http')
    ? report.url
    : buildRiskAppUrl(report.url)
  window.open(target, '_blank')
}

const goToVariable = (variableId: string) => {
  router.push({ name: 'VariableAssetDetail', params: { id: variableId, mode: 'view' } })
}

const resetFilters = () => {
  filters.keyword = ''
  filters.status = ''
  filters.taskType = ''
  filters.dataSourceId = ''
}

const openDetail = (taskId: string) => {
  currentTaskId.value = taskId
  detailVisible.value = true
}

const handleRunTask = async (taskId: string) => {
  if (runningTaskId.value) return
  runningTaskId.value = taskId
  // pending → running → completed 中间态
  EvaluationTaskStore.startTask(taskId)
  await new Promise((r) => setTimeout(r, 50))
  Message.info('评估任务进入执行中（已调用外数评估/内部评估）…')
  await new Promise((r) => setTimeout(r, 1200))
  const task = EvaluationTaskStore.runTask(taskId)
  runningTaskId.value = ''
  if (!task) {
    Message.error('任务不存在')
    return
  }
  Message.success(`已完成 mock 执行，生成 ${task.reports.length} 份报告并回写变量档案`)
  openDetail(taskId)
}

const runningTaskId = ref('')

const shortenId = (id: string) => {
  if (!id) return ''
  if (id.length <= 10) return id
  return id
}

const jumpToSource = (record: any, id: string) => {
  if (record.sourceType === 'topic') {
    router.push(`/explore/topics/${id}`)
  } else {
    router.push({ name: 'VariableAssetDetail', params: { id, mode: 'view' } })
  }
}

const statusLabel = (value: EvaluationTaskStatus) => ({
  pending: '待执行',
  running: '执行中',
  completed: '已完成',
  failed: '执行失败'
}[value])

const statusColor = (value: EvaluationTaskStatus) => ({
  pending: 'orange',
  running: 'arcoblue',
  completed: 'green',
  failed: 'red'
}[value])

const taskTypeLabel = (value: EvaluationTaskType) => ({
  access: '准入评估',
  recheck: '复评任务',
  comparison: '对比评估'
}[value])

const taskTypeColor = (value: EvaluationTaskType) => ({
  access: 'green',
  recheck: 'orange',
  comparison: 'purple'
}[value])

const sourceTypeLabel = (value?: string) => ({
  external: '外数',
  internal: '内数',
  credit: '征信'
}[value || ''] || '—')

const metricPercent = (value?: number) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : '—')
const metricNumber = (value?: number) => (typeof value === 'number' ? value.toFixed(2) : '—')
</script>

<style scoped>
.evaluation-task-page {
  min-height: calc(100vh - 88px);
  background: #f7f8fa;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
}

.page-header p {
  margin: 8px 0 0;
  color: #4e5969;
}

.summary-row {
  margin-bottom: 16px;
}

.filter-card,
.table-card {
  box-shadow: 0 8px 20px rgba(15, 35, 95, 0.06);
}

/* 详情页宽画布样式 */
.detail-header {
  background: var(--color-fill-1);
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.detail-header-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-field-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0;
  background: #fff;
  border-radius: 6px;
  padding: 4px 0;
  border: 1px solid var(--color-border-2);
}

.detail-field-cell {
  position: relative;
  padding: 6px 14px;
  min-width: 0;
}

.detail-field-cell + .detail-field-cell::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 1px;
  background: var(--color-border-2);
}

.detail-field-label {
  color: var(--color-text-3);
  font-size: 12px;
  margin-bottom: 4px;
}

.detail-field-value {
  color: var(--color-text-1);
  font-size: 13px;
  font-weight: 500;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-description {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid var(--color-border-2);
}

.detail-description-label {
  flex-shrink: 0;
  color: var(--color-text-3);
  font-size: 12px;
  line-height: 22px;
}

.detail-description-value {
  flex: 1;
  color: var(--color-text-2);
  font-size: 13px;
  line-height: 22px;
}

.detail-metric-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.detail-metric-cell {
  background: linear-gradient(135deg, #f0f7ff 0%, #fafcff 100%);
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  padding: 14px 16px;
  text-align: center;
}

.metric-label {
  color: var(--color-text-3);
  font-size: 12px;
  margin-bottom: 6px;
}

.metric-value {
  color: var(--color-text-1);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.detail-summary {
  margin-bottom: 16px;
}

.detail-row {
  margin-top: 4px;
}

.detail-mini-alert {
  margin-bottom: 10px;
}

@media (max-width: 1100px) {
  .detail-field-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .detail-metric-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
