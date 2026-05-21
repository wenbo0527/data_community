<template>
  <div class="asset-overview">
    <a-page-header title="资产总揽（最新快照）" />
    <a-card class="toolbar" :bordered="true">
      <a-row :gutter="12" align="center">
        <a-col :span="10">
          <a-input v-model="searchKeyword" placeholder="搜索名称/标签/域/类型/平台" allow-clear @press-enter="applySearch" />
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="refreshSnapshot">刷新</a-button>
            <span>已更新：{{ updatedAgo }}</span>
          </a-space>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-radio-group v-model="currentView" type="button">
            <a-radio value="overview">概览</a-radio>
            <a-radio value="relation">关系</a-radio>
            <a-radio value="list">清单</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>
    </a-card>

    <div v-show="currentView === 'overview'">
      <a-row :gutter="12">
        <a-col :span="6"><a-card><a-statistic title="资产总数" :value="overview.total" /></a-card></a-col>
        <a-col :span="6"><a-card><a-statistic title="活跃资产数" :value="overview.active" /></a-card></a-col>
        <a-col :span="6"><a-card><a-statistic title="关系连接数" :value="overview.relations" /></a-card></a-col>
        <a-col :span="6"><a-card><a-statistic title="异常资产数" :value="overview.abnormal" /></a-card></a-col>
      </a-row>
      <a-row :gutter="12" style="margin-top: 12px">
        <a-col :span="6"><a-card><a-statistic title="综合健康分" :value="overview.healthScore" :precision="0" /></a-card></a-col>
        <a-col :span="18">
          <a-card :bordered="true" title="分类分布">
            <a-space style="margin-bottom: 8px">
              <a-radio-group v-model="distributionDimension" type="button">
                <a-radio value="type">类型</a-radio>
                <a-radio value="domain">域</a-radio>
                <a-radio value="platform">平台</a-radio>
              </a-radio-group>
            </a-space>
            <div ref="chartRef" style="height: 260px; width: 100%"></div>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="12" style="margin-top: 12px">
        <a-col :span="24">
          <a-card :bordered="true" title="最新预警">
            <a-list :bordered="false" :data="alerts">
              <template #item="{ item }">
                <a-list-item>
                  <a-space>
                    <a-badge :status="item.severity === 'critical' ? 'danger' : item.severity === 'warning' ? 'warning' : 'normal'" />
                    <span>{{ item.type }} · {{ item.message }}</span>
                    <a-tag>{{ item.assetId }}</a-tag>
                    <span style="color: var(--color-text-2)">更新于 {{ formatTime(item.updatedAt) }}</span>
                  </a-space>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div v-show="currentView === 'relation'">
      <a-row :gutter="12">
        <a-col :span="6">
          <a-card :bordered="true" title="筛选器">
            <a-form :model="filters" layout="vertical">
              <a-form-item field="type" label="类型">
                <a-select v-model="filters.type" allow-clear>
                  <a-option value="table">表</a-option>
                  <a-option value="model">模型</a-option>
                  <a-option value="api">接口</a-option>
                  <a-option value="task">任务</a-option>
                </a-select>
              </a-form-item>
              <a-form-item field="domain" label="域">
                <a-select v-model="filters.domain" allow-clear>
                  <a-option value="risk">风控</a-option>
                  <a-option value="marketing">营销</a-option>
                  <a-option value="compliance">合规</a-option>
                </a-select>
              </a-form-item>
              <a-form-item field="platform" label="平台">
                <a-select v-model="filters.platform" allow-clear>
                  <a-option value="API">API</a-option>
                  <a-option value="文件">文件</a-option>
                  <a-option value="数据库">数据库</a-option>
                  <a-option value="平台工具">平台工具</a-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-space>
                  <a-checkbox v-model="filters.onlyWithRelations">仅显示存在关系</a-checkbox>
                  <a-checkbox v-model="filters.onlyAbnormal">仅显示异常资产</a-checkbox>
                </a-space>
              </a-form-item>
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="applyFilters">应用</a-button>
                  <a-button @click="resetFilters">重置</a-button>
                </a-space>
              </a-form-item>
            </a-form>
            <a-divider />
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="关键路径数">{{ relationMetrics.criticalPaths }}</a-descriptions-item>
              <a-descriptions-item label="孤立节点数">{{ relationMetrics.isolatedCount }}</a-descriptions-item>
              <a-descriptions-item label="入度极值">{{ relationMetrics.maxInDegreeNode?.name || '—' }}</a-descriptions-item>
              <a-descriptions-item label="出度极值">{{ relationMetrics.maxOutDegreeNode?.name || '—' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
        <a-col :span="18">
          <a-card :bordered="true" title="资产关系图">
            <div ref="graphContainerRef" style="height: 520px; width: 100%; border: 1px solid var(--color-border-2)"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div v-show="currentView === 'list'">
      <a-card :bordered="true" title="最新清单">
        <a-space style="margin-bottom: 8px">
          <a-tag v-for="chip in activeChips" :key="chip">{{ chip }}</a-tag>
        </a-space>
        <a-table :data="displayedList" row-key="id" :pagination="pagination" @page-change="onPageChange">
          <template #columns>
            <a-table-column title="名称" data-index="name" :width="220" />
            <a-table-column title="类型" :width="100">
              <template #cell="{ record }">{{ record.type }}</template>
            </a-table-column>
            <a-table-column title="域" :width="120">
              <template #cell="{ record }">{{ record.domain }}</template>
            </a-table-column>
            <a-table-column title="所有者" :width="120">
              <template #cell="{ record }">{{ record.owner }}</template>
            </a-table-column>
            <a-table-column title="质量分" :width="100">
              <template #cell="{ record }">{{ record.healthScore }}</template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }"><a-tag :status="record.status === 'online' ? 'success' : record.status === 'maintaining' ? 'warning' : 'default'">{{ record.status }}</a-tag></template>
            </a-table-column>
            <a-table-column title="最近更新时间" :width="180">
              <template #cell="{ record }">{{ formatTime(record.updatedAt) }}</template>
            </a-table-column>
            <a-table-column title="操作" :width="120" fixed="right">
              <template #cell="{ record }">
                <a-button size="mini" type="outline" @click="openDetail(record)">详情</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>

    <a-drawer :visible="detailVisible" :width="520" :mask-closable="true" :esc-to-close="true" @cancel="detailVisible=false" title="资产详情">
      <a-descriptions :column="1" size="small" v-if="currentDetail">
        <a-descriptions-item label="名称">{{ currentDetail.name }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ currentDetail.type }}</a-descriptions-item>
        <a-descriptions-item label="域">{{ currentDetail.domain }}</a-descriptions-item>
        <a-descriptions-item label="所有者">{{ currentDetail.owner }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ currentDetail.status }}</a-descriptions-item>
        <a-descriptions-item label="质量分">{{ currentDetail.healthScore }}</a-descriptions-item>
        <a-descriptions-item label="最近更新时间">{{ formatTime(currentDetail.updatedAt) }}</a-descriptions-item>
        <a-descriptions-item label="标签">
          <a-space><a-tag v-for="t in currentDetail.tags" :key="t">{{ t }}</a-tag></a-space>
        </a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import * as echarts from 'echarts'
import { Graph } from '@antv/x6'

type SnapshotOverview = { total: number; active: number; relations: number; abnormal: number; healthScore: number; updatedAt: number }
type DistributionBucket = { key: string; count: number; ratio: number }
type AlertItem = { id: string; severity: 'info'|'warning'|'critical'; type: string; message: string; assetId: string; updatedAt: number }
type AssetItem = { id: string; name: string; type: string; domain: string; owner: string; status: string; healthScore: number; updatedAt: number; tags: string[] }
type NodeItem = { id: string; name: string; type: string; domain: string; platform: string; status: string; healthScore: number; updatedAt: number; tags: string[] }
type EdgeItem = { source: string; target: string; type: string }

const searchKeyword = ref('')
const currentView = ref<'overview'|'relation'|'list'>('overview')
const overview = reactive<SnapshotOverview>({ total: 0, active: 0, relations: 0, abnormal: 0, healthScore: 0, updatedAt: Date.now() })
const distributionDimension = ref<'type'|'domain'|'platform'>('type')
const distributionBuckets = ref<DistributionBucket[]>([])
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const alerts = ref<AlertItem[]>([])
const graphContainerRef = ref<HTMLElement | null>(null)
let graph: Graph | null = null
const relationNodes = ref<NodeItem[]>([])
const relationEdges = ref<EdgeItem[]>([])
const relationMetrics = reactive<{ isolatedCount: number; maxInDegreeNode?: NodeItem|null; maxOutDegreeNode?: NodeItem|null; criticalPaths: number }>({ isolatedCount: 0, maxInDegreeNode: null, maxOutDegreeNode: null, criticalPaths: 0 })
const filters = reactive<{ type?: string; domain?: string; platform?: string; onlyWithRelations: boolean; onlyAbnormal: boolean }>({ onlyWithRelations: false, onlyAbnormal: false })

const list = ref<AssetItem[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })
const displayedList = computed<AssetItem[]>(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  const rows = (list.value as AssetItem[])
    .filter((x: AssetItem) => !searchKeyword.value || x.name.includes(searchKeyword.value) || (x.tags || []).some((t: string) => t.includes(searchKeyword.value)))
    .sort((a: AssetItem, b: AssetItem) => b.updatedAt - a.updatedAt)
  pagination.total = rows.length
  return rows.slice(start, end)
})
const activeChips = computed<string[]>(() => {
  const chips: string[] = []
  if (filters.type) chips.push(`类型:${filters.type}`)
  if (filters.domain) chips.push(`域:${filters.domain}`)
  if (filters.platform) chips.push(`平台:${filters.platform}`)
  if (filters.onlyWithRelations) chips.push('仅关系')
  if (filters.onlyAbnormal) chips.push('仅异常')
  if (searchKeyword.value) chips.push(`搜索:${searchKeyword.value}`)
  return chips
})

const updatedAgo = computed(() => {
  const sec = Math.max(0, Math.floor((Date.now() - overview.updatedAt) / 1000))
  return `${sec}秒前`
})

const formatTime = (ts: number) => {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
}

const onPageChange = (page: number) => { pagination.current = page }
const applySearch = () => { Message.success('已应用搜索'); renderGraph() }
const applyFilters = () => { Message.success('已应用筛选'); renderGraph() }
const resetFilters = () => { filters.type = undefined; filters.domain = undefined; filters.platform = undefined; filters.onlyWithRelations = false; filters.onlyAbnormal = false; renderGraph() }

const refreshSnapshot = () => {
  overview.updatedAt = Date.now()
  loadSnapshot()
  renderChart()
  renderGraph()
  Message.success('已刷新最新快照')
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  renderChart()
}

const renderChart = () => {
  if (!chartInstance) return
  const option: echarts.EChartsOption = {
    tooltip: {},
    xAxis: { type: 'category', data: (distributionBuckets.value as DistributionBucket[]).map((b: DistributionBucket) => b.key) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: (distributionBuckets.value as DistributionBucket[]).map((b: DistributionBucket) => b.count) }]
  }
  chartInstance.setOption(option)
}

const initGraph = () => {
  if (!graphContainerRef.value) return
  graph = new Graph({
    container: graphContainerRef.value,
    grid: { visible: true },
    panning: true,
    mousewheel: { enabled: true, modifiers: ['ctrl'] }
  })
  renderGraph()
}

const renderGraph = () => {
  if (!graph) return
  graph?.clearCells()
  const filteredNodes = (relationNodes.value as NodeItem[]).filter((n: NodeItem) => {
    if (filters.type && n.type !== filters.type) return false
    if (filters.domain && n.domain !== filters.domain) return false
    if (filters.platform && n.platform !== filters.platform) return false
    if (filters.onlyAbnormal && n.status !== 'abnormal') return false
    return true
  })
  const nodeIds = new Set(filteredNodes.map((n) => n.id))
  const filteredEdges = (relationEdges.value as EdgeItem[]).filter((e: EdgeItem) => {
    const ok = nodeIds.has(e.source) && nodeIds.has(e.target)
    if (!ok) return false
    return true
  })
  const nodes = filteredNodes.map((n: NodeItem, i: number) => ({
    id: n.id,
    shape: 'rect',
    x: 60 + (i % 6) * 160,
    y: 40 + Math.floor(i / 6) * 120,
    width: 120,
    height: 48,
    attrs: {
      label: { text: n.name },
      body: { stroke: n.status === 'abnormal' ? '#f53f3f' : '#d9d9d9', fill: '#fff' }
    }
  }))
  const edges = filteredEdges.map((e: EdgeItem) => ({
    source: e.source,
    target: e.target,
    attrs: { line: { stroke: '#c2c2c2' } }
  }))
  graph?.addNodes(nodes as any)
  graph?.addEdges(edges as any)
  computeRelationMetrics(filteredNodes, filteredEdges)
}

const computeRelationMetrics = (nodes: NodeItem[], edges: EdgeItem[]) => {
  const idToIn: Record<string, number> = {}
  const idToOut: Record<string, number> = {}
  nodes.forEach((n: NodeItem) => { idToIn[n.id] = 0; idToOut[n.id] = 0 })
  edges.forEach((e: EdgeItem) => { idToOut[e.source] = (idToOut[e.source] || 0) + 1; idToIn[e.target] = (idToIn[e.target] || 0) + 1 })
  const isolated = nodes.filter((n) => (idToIn[n.id] === 0) && (idToOut[n.id] === 0)).length
  relationMetrics.isolatedCount = isolated
  const inKeys = Object.keys(idToIn)
  const outKeys = Object.keys(idToOut)
  const maxInId = inKeys.length > 0 ? inKeys.sort((a: string, b: string) => (idToIn[b] ?? 0) - (idToIn[a] ?? 0))[0] : undefined
  const maxOutId = outKeys.length > 0 ? outKeys.sort((a: string, b: string) => (idToOut[b] ?? 0) - (idToOut[a] ?? 0))[0] : undefined
  relationMetrics.maxInDegreeNode = maxInId ? (nodes.find((n: NodeItem) => n.id === maxInId) || null) : null
  relationMetrics.maxOutDegreeNode = maxOutId ? (nodes.find((n: NodeItem) => n.id === maxOutId) || null) : null
  relationMetrics.criticalPaths = Math.max(0, edges.length > 0 ? Math.ceil(edges.length / 5) : 0)
}

const openDetail = (record: AssetItem) => { currentDetail.value = record; detailVisible.value = true }
const detailVisible = ref(false)
const currentDetail = ref<AssetItem | null>(null)

const mockData = () => {
  overview.total = 128
  overview.active = 96
  overview.relations = 420
  overview.abnormal = 7
  overview.healthScore = 86
  distributionBuckets.value = [
    { key: '表', count: 52, ratio: 0.41 },
    { key: '模型', count: 22, ratio: 0.17 },
    { key: '接口', count: 31, ratio: 0.24 },
    { key: '任务', count: 23, ratio: 0.18 }
  ]
  alerts.value = [
    { id: 'a1', severity: 'warning', type: '质量', message: '表A空值异常', assetId: 'table-a', updatedAt: Date.now() - 3600_000 },
    { id: 'a2', severity: 'critical', type: '合规', message: '敏感字段未加密', assetId: 'model-b', updatedAt: Date.now() - 1800_000 }
  ]
  relationNodes.value = [
    { id: 'n1', name: '表_用户', type: 'table', domain: 'risk', platform: '数据库', status: 'online', healthScore: 90, updatedAt: Date.now(), tags: ['user','risk'] },
    { id: 'n2', name: '模型_评分', type: 'model', domain: 'risk', platform: '平台工具', status: 'online', healthScore: 88, updatedAt: Date.now(), tags: ['score'] },
    { id: 'n3', name: '接口_查询', type: 'api', domain: 'marketing', platform: 'API', status: 'abnormal', healthScore: 60, updatedAt: Date.now(), tags: ['query'] },
    { id: 'n4', name: '任务_日更新', type: 'task', domain: 'compliance', platform: '文件', status: 'maintaining', healthScore: 75, updatedAt: Date.now(), tags: ['daily'] },
    { id: 'n5', name: '表_订单', type: 'table', domain: 'marketing', platform: '数据库', status: 'online', healthScore: 92, updatedAt: Date.now(), tags: ['order'] }
  ]
  relationEdges.value = [
    { source: 'n1', target: 'n2', type: 'dependency' },
    { source: 'n2', target: 'n3', type: 'expose' },
    { source: 'n5', target: 'n2', type: 'dependency' },
    { source: 'n4', target: 'n1', type: 'update' }
  ]
  list.value = (relationNodes.value as NodeItem[]).map((n: NodeItem) => ({
    id: n.id, name: n.name, type: n.type, domain: n.domain, owner: n.domain === 'risk' ? '风控团队' : n.domain === 'marketing' ? '营销团队' : '合规团队',
    status: n.status, healthScore: n.healthScore, updatedAt: n.updatedAt, tags: n.tags
  }))
}

const loadSnapshot = () => { mockData() }

onMounted(() => {
  loadSnapshot()
  initChart()
  initGraph()
})

watch(distributionDimension, () => { renderChart() })
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
