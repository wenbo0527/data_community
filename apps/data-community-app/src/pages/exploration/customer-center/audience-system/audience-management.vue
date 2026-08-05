<template>
  <div class="audience-page">
    <a-page-header title="客群管理" sub-title="基于标签 + 规则 + 行为圈选客群">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">
          <template #icon><icon-plus /></template>
          创建客群
        </a-button>
      </template>
    </a-page-header>

    <a-card class="filter-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input v-model="keyword" placeholder="搜索客群名 / 创建人" allow-clear size="large">
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterType" placeholder="客群类型" allow-clear size="large">
            <a-option value="static">静态客群</a-option>
            <a-option value="dynamic">动态客群</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterScenario" placeholder="应用场景" allow-clear size="large">
            <a-option value="marketing">营销活动</a-option>
            <a-option value="risk">风控策略</a-option>
            <a-option value="service">客户运营</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-button type="primary" @click="resetFilters">重置</a-button>
        </a-col>
      </a-row>
      <div class="result-meta">
        共 <b>{{ filteredAudiences.length }}</b> 个客群
      </div>
    </a-card>

    <a-table
      :columns="columns"
      :data="filteredAudiences"
      :pagination="{ pageSize: 10, showTotal: true }"
      row-key="id"
      stripe
      size="medium"
    >
      <template #name="{ record }">
        <a-link @click="openAudience(record)">{{ record.name }}</a-link>
      </template>
      <template #type="{ record }">
        <a-tag :color="record.type === 'dynamic' ? 'arcoblue' : 'gray'">
          {{ record.type === 'dynamic' ? '动态' : '静态' }}
        </a-tag>
      </template>
      <template #scenario="{ record }">
        <a-tag :color="scenarioColor(record.scenario)">{{ scenarioLabel(record.scenario) }}</a-tag>
      </template>
      <template #size="{ record }">{{ record.size.toLocaleString() }}</template>
      <template #coverageRate="{ record }">
        <a-progress :percent="record.coverageRate / 100" :stroke-width="6" :color="coverageColor(record.coverageRate)" />
      </template>
      <template #tags="{ record }">
        <a-tag v-for="t in (record.tags || [])" :key="t" color="green">{{ t }}</a-tag>
      </template>
    </a-table>

    <a-drawer
      v-model:visible="detailVisible"
      :title="`客群详情 · ${currentAudience?.name || ''}`"
      :width="780"
      :footer="false"
    >
      <template v-if="currentAudience">
        <a-descriptions :column="2" bordered size="medium">
          <a-descriptions-item label="客群 ID">{{ currentAudience.id }}</a-descriptions-item>
          <a-descriptions-item label="客群名">{{ currentAudience.name }}</a-descriptions-item>
          <a-descriptions-item label="类型">
            <a-tag :color="currentAudience.type === 'dynamic' ? 'arcoblue' : 'gray'">
              {{ currentAudience.type === 'dynamic' ? '动态' : '静态' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="应用场景">
            <a-tag :color="scenarioColor(currentAudience.scenario)">{{ scenarioLabel(currentAudience.scenario) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="人群规模">{{ currentAudience.size.toLocaleString() }}</a-descriptions-item>
          <a-descriptions-item label="覆盖率">{{ currentAudience.coverageRate }}%</a-descriptions-item>
          <a-descriptions-item label="创建人">{{ currentAudience.creator }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ currentAudience.updatedAt }}</a-descriptions-item>
          <a-descriptions-item label="圈选规则" :span="2">
            <pre class="formula">{{ currentAudience.rule }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="标签" :span="2">
            <a-tag v-for="t in (currentAudience.tags || [])" :key="t" color="green">{{ t }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <h3 style="margin-top: 24px">关联活动 ({{ currentAudience.campaigns?.length || 0 }})</h3>
        <a-table
          :columns="campaignColumns"
          :data="currentAudience.campaigns || []"
          :pagination="false"
          row-key="id"
          size="small"
        />
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const audiences = ref<any[]>([])
const keyword = ref('')
const filterType = ref<string | undefined>(undefined)
const filterScenario = ref<string | undefined>(undefined)

const detailVisible = ref(false)
const currentAudience = ref<any>(null)

onMounted(() => {
  audiences.value = [
    {
      id: 'A001', name: '高价值理财人群', type: 'dynamic', scenario: 'marketing',
      size: 25830, coverageRate: 2.1, creator: '王运营', updatedAt: '2025-08-03 14:30',
      tags: ['VIP', '理财'],
      rule: 'AUM >= 1,000,000 AND active_in_30d = true AND risk_level IN (low, medium)',
      campaigns: [
        { id: 'C001', name: '私行理财专场', status: 'running', sent: 25830, conversion: 3.2 },
        { id: 'C005', name: '高端保险推荐', status: 'completed', sent: 25830, conversion: 1.8 }
      ]
    },
    {
      id: 'A002', name: '近期有逾期客户', type: 'dynamic', scenario: 'risk',
      size: 1280, coverageRate: 0.1, creator: '张风控', updatedAt: '2025-08-03 11:20',
      tags: ['逾期', '高风险'],
      rule: 'overdue_count_30d > 0 AND overdue_amount > 1000',
      campaigns: [
        { id: 'C010', name: '逾期催收短信', status: 'running', sent: 1280, conversion: 0 }
      ]
    },
    {
      id: 'A003', name: '新注册未交易用户', type: 'static', scenario: 'marketing',
      size: 15280, coverageRate: 1.2, creator: '陈营销', updatedAt: '2025-08-02 16:45',
      tags: ['新客', '激活'],
      rule: 'register_date >= 2025-07-01 AND total_orders = 0',
      campaigns: [
        { id: 'C015', name: '新人福利推送', status: 'running', sent: 15280, conversion: 8.5 }
      ]
    },
    {
      id: 'A004', name: '高频活跃用户', type: 'dynamic', scenario: 'service',
      size: 88200, coverageRate: 7.1, creator: '王运营', updatedAt: '2025-08-01 09:15',
      tags: ['高活跃', '忠实'],
      rule: 'active_days_30d >= 20 AND login_count_30d >= 50',
      campaigns: [
        { id: 'C020', name: 'VIP 服务体验', status: 'completed', sent: 88200, conversion: 12.3 }
      ]
    },
    {
      id: 'A005', name: '流失预警人群', type: 'dynamic', scenario: 'marketing',
      size: 42180, coverageRate: 3.4, creator: '李产品', updatedAt: '2025-08-02 14:20',
      tags: ['流失预警', '召回'],
      rule: 'last_order_days >= 90 AND active_days_7d = 0 AND total_orders > 0',
      campaigns: []
    }
  ]
})

const filteredAudiences = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return audiences.value.filter(a => {
    if (k) {
      if (!a.name.toLowerCase().includes(k) && !a.creator.toLowerCase().includes(k)) return false
    }
    if (filterType.value && a.type !== filterType.value) return false
    if (filterScenario.value && a.scenario !== filterScenario.value) return false
    return true
  })
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '客群名', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 80 },
  { title: '场景', dataIndex: 'scenario', slotName: 'scenario', width: 100 },
  { title: '规模', dataIndex: 'size', slotName: 'size', width: 100 },
  { title: '覆盖率', dataIndex: 'coverageRate', slotName: 'coverageRate', width: 130 },
  { title: '创建人', dataIndex: 'creator', width: 100 },
  { title: '标签', dataIndex: 'tags', slotName: 'tags' }
]

const campaignColumns = [
  { title: '活动 ID', dataIndex: 'id', width: 80 },
  { title: '活动名', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '触达', dataIndex: 'sent', width: 100 },
  { title: '转化率(%)', dataIndex: 'conversion', width: 100 }
]

function scenarioColor(s: string) {
  return { marketing: 'orange', risk: 'red', service: 'arcoblue' }[s] || 'gray'
}
function scenarioLabel(s: string) {
  return { marketing: '营销', risk: '风控', service: '服务' }[s] || s
}
function coverageColor(c: number) {
  if (c >= 50) return '#f53f3f'
  if (c >= 10) return '#ff7d00'
  return '#00b42a'
}
function resetFilters() {
  keyword.value = ''
  filterType.value = undefined
  filterScenario.value = undefined
}
function openAudience(a: any) {
  currentAudience.value = a
  detailVisible.value = true
}
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.audience-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  .filter-card {
    margin-bottom: 16px;
    .result-meta {
      margin-top: 16px;
      color: #86909c;
      font-size: 13px;
      b { color: #165dff; font-weight: 600; }
    }
  }
  .formula {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-family: 'Menlo', monospace;
    font-size: 13px;
    color: #165dff;
    margin: 0;
  }
}
</style>