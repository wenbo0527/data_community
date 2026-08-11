<template>
  <div class="asset-catalog-page">
    <a-page-header title="资产目录" sub-title="按业务域、资产类型浏览所有数据资产">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :span="6">
        <a-card :bordered="false" title="业务域分类">
          <a-empty v-if="domains.length === 0" />
          <div
            v-for="d in domains" :key="d.code"
            class="domain-item"
            :class="{ active: selectedDomain?.code === d.code }"
            @click="selectDomain(d)"
          >
            <div class="domain-header">
              <strong>{{ d.name }}</strong>
              <a-tag size="small">{{ d.tableCount }}</a-tag>
            </div>
            <div class="domain-meta">{{ d.description }}</div>
            <div class="domain-stats">
              <span>覆盖人群 {{ d.coverage }}</span>
              <span>质量分 {{ d.avgQuality }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="18">
        <a-card :bordered="false" :title="selectedDomain ? `${selectedDomain.name} · 资产列表` : '资产列表'">
          <template v-if="selectedDomain">
            <a-tabs default-active-key="tables">
              <a-tab-pane key="tables" :title="`表(${filteredTables.length})`">
                <a-table
                  :columns="columns"
                  :data="filteredTables"
                  :pagination="{ pageSize: 10, showTotal: true }"
                  row-key="name"
                  size="medium"
                >
                  <template #type="{ record }">
                    <a-tag :color="typeColor(record.type)">{{ record.type?.toUpperCase() }}</a-tag>
                  </template>
                  <template #qualityScore="{ record }">
                    <a-progress :percent="record.qualityScore / 100" :stroke-width="6" :color="qualityColor(record.qualityScore)" />
                  </template>
                </a-table>
              </a-tab-pane>

              <a-tab-pane key="metrics" :title="`指标(${metrics.length})`">
                <a-table
                  :columns="metricColumns"
                  :data="metrics"
                  :pagination="{ pageSize: 10 }"
                  row-key="code"
                  size="medium"
                >
                  <template #layer="{ record }">
                    <a-tag :color="layerColor(record.layer)">{{ record.layer }}</a-tag>
                  </template>
                </a-table>
              </a-tab-pane>

              <a-tab-pane key="variables" :title="`变量(${variables.length})`">
                <a-table
                  :columns="variableColumns"
                  :data="variables"
                  :pagination="{ pageSize: 10 }"
                  row-key="code"
                  size="medium"
                />
              </a-tab-pane>
            </a-tabs>
          </template>
          <a-empty v-else description="从左侧选择一个业务域" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MetadataStore } from '@/mock-shared/metadata-store'

const router = useRouter()
const route = useRoute()

const allTables = ref<any[]>([])
const domains = ref<any[]>([])
const metrics = ref<any[]>([])
const variables = ref<any[]>([])
const selectedDomain = ref<any>(null)

onMounted(() => {
  allTables.value = MetadataStore.getTables()
  // 动态生成业务域
  const map: Record<string, any> = {}
  allTables.value.forEach(t => {
    if (!map[t.domain]) {
      map[t.domain] = { tables: [], totalQuality: 0 }
    }
    map[t.domain].tables.push(t)
    map[t.domain].totalQuality += (t.qualityScore || 0)
  })
  domains.value = Object.keys(map).map((k, i) => ({
    code: 'D' + (i + 1).toString().padStart(2, '0'),
    name: k,
    description: `${k}相关的维表、明细表、汇总表`,
    tableCount: map[k].tables.length,
    coverage: '95%',
    avgQuality: Math.round(map[k].totalQuality / map[k].tables.length)
  }))

  // 从 query 预选 domain(支持中文名或英文 enum)
  const domainEnumMap: Record<string, string> = {
    loan_pre: '用户域',
    risk: '风控域',
    customer: '用户域',
    user: '用户域',
    trade: '交易域'
  }
  const qDomain = (route.query.domain as string) || ''
  const targetDomain = domainEnumMap[qDomain] || qDomain
  if (targetDomain) {
    const found = domains.value.find(d => d.name === targetDomain)
    if (found) selectedDomain.value = found
  }
  if (!selectedDomain.value && domains.value.length > 0) {
    selectedDomain.value = domains.value[0]
  }

  metrics.value = [
    { code: 'M001', name: 'DAU', layer: 'L3', domain: '用户域', owner: '王运营' },
    { code: 'M002', name: 'MAU', layer: 'L2', domain: '用户域', owner: '王运营' },
    { code: 'M003', name: 'GMV', layer: 'L1', domain: '交易域', owner: '李产品' },
    { code: 'M004', name: '授信通过率', layer: 'L2', domain: '风控域', owner: '张风控' }
  ]

  variables.value = [
    { code: 'V001', name: '年龄段', dataType: 'enum', coverage: 100, owner: '王运营' },
    { code: 'V002', name: 'AUM', dataType: 'number', coverage: 75, owner: '陈营销' },
    { code: 'V003', name: '风险等级', dataType: 'enum', coverage: 85, owner: '张风控' },
    { code: 'V004', name: '信用分', dataType: 'number', coverage: 78, owner: '张风控' }
  ]
})

const filteredTables = computed(() => {
  if (!selectedDomain.value) return []
  return allTables.value.filter(t => t.domain === selectedDomain.value.name)
})

const columns = [
  { title: '表名', dataIndex: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 90 },
  { title: '业务域', dataIndex: 'domain', width: 100 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '记录数', dataIndex: 'recordCount', width: 130 },
  { title: '质量分', dataIndex: 'qualityScore', slotName: 'qualityScore', width: 150 },
  { title: '描述', dataIndex: 'description' }
]

const metricColumns = [
  { title: '编码', dataIndex: 'code', width: 90 },
  { title: '名称', dataIndex: 'name' },
  { title: '分层', dataIndex: 'layer', slotName: 'layer', width: 80 },
  { title: '业务域', dataIndex: 'domain', width: 100 },
  { title: 'Owner', dataIndex: 'owner', width: 100 }
]

const variableColumns = [
  { title: '编码', dataIndex: 'code', width: 90 },
  { title: '名称', dataIndex: 'name' },
  { title: '数据类型', dataIndex: 'dataType', width: 100 },
  { title: '覆盖率(%)', dataIndex: 'coverage', width: 110 },
  { title: 'Owner', dataIndex: 'owner', width: 100 }
]

function selectDomain(d: any) {
  selectedDomain.value = d
}

function typeColor(type: string) {
  return { dim: 'arcoblue', dwd: 'green', dws: 'orange', ads: 'purple', fact: 'cyan' }[type] || 'gray'
}
function qualityColor(score: number) {
  if (score >= 90) return '#00b42a'
  if (score >= 60) return '#ff7d00'
  return '#f53f3f'
}
function layerColor(layer: string) {
  return { L1: 'red', L2: 'orange', L3: 'arcoblue' }[layer] || 'gray'
}

const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.asset-catalog-page {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
  .domain-item {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    background: #fafbfc;
    border-left: 3px solid transparent;
    transition: all 0.2s;
    &:hover { background: #f2f3f5; }
    &.active { background: #e8f3ff; border-left-color: #165dff; }
    .domain-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .domain-meta { font-size: 12px; color: #86909c; margin-bottom: 6px; }
    .domain-stats {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #4e5969;
    }
  }
}
</style>