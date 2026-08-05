<template>
  <div class="service-page">
    <a-page-header title="数据服务" sub-title="API 服务、调用统计、调用方管理、限流配置">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">发布 API</a-button>
      </template>
    </a-page-header>

    <!-- 统计卡片 -->
    <a-row :gutter="16">
      <a-col :span="6"><a-statistic title="API 总数" :value="totalCount" /></a-col>
      <a-col :span="6"><a-statistic title="今日调用" :value="todayCalls" /></a-col>
      <a-col :span="6"><a-statistic title="成功率" :value="successRate" :precision="2" suffix="%" /></a-col>
      <a-col :span="6"><a-statistic title="平均延迟" :value="avgLatency" suffix="ms" /></a-col>
    </a-row>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="10">
          <a-input v-model="keyword" placeholder="搜索 API 名 / 路径" allow-clear size="large">
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterStatus" placeholder="状态" allow-clear size="large">
            <a-option value="online">在线</a-option>
            <a-option value="offline">下线</a-option>
            <a-option value="deprecated">已弃用</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterCategory" placeholder="分类" allow-clear size="large">
            <a-option value="user">用户域</a-option>
            <a-option value="trade">交易域</a-option>
            <a-option value="risk">风控域</a-option>
            <a-option value="marketing">营销域</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="resetFilters">重置</a-button>
        </a-col>
      </a-row>

      <a-table
        :columns="columns"
        :data="filteredApis"
        :pagination="{ pageSize: 10, showTotal: true }"
        row-key="path"
        stripe
        size="medium"
      >
        <template #method="{ record }">
          <a-tag :color="methodColor(record.method)">{{ record.method }}</a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>
        <template #qps="{ record }">
          <a-progress :percent="Math.min(record.qps / 100, 1)" :stroke-width="6" :color="qpsColor(record.qps)" />
        </template>
        <template #successRate="{ record }">
          <span :style="{ color: record.successRate >= 99 ? '#00b42a' : (record.successRate >= 95 ? '#ff7d00' : '#f53f3f') }">
            {{ record.successRate }}%
          </span>
        </template>
        <template #actions="{ record }">
          <a-link @click="openApi(record)">详情</a-link>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      v-model:visible="detailVisible"
      :title="`API 详情 · ${currentApi?.name || ''}`"
      :width="780"
      :footer="false"
    >
      <template v-if="currentApi">
        <a-descriptions :column="2" bordered size="medium">
          <a-descriptions-item label="API 名">{{ currentApi.name }}</a-descriptions-item>
          <a-descriptions-item label="分类">{{ currentApi.category }}</a-descriptions-item>
          <a-descriptions-item label="请求方式">
            <a-tag :color="methodColor(currentApi.method)">{{ currentApi.method }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="statusColor(currentApi.status)">{{ statusLabel(currentApi.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="路径" :span="2">
            <pre class="formula">{{ currentApi.path }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="调用次数(今日)">{{ currentApi.qps }}</a-descriptions-item>
          <a-descriptions-item label="成功率">{{ currentApi.successRate }}%</a-descriptions-item>
          <a-descriptions-item label="平均延迟">{{ currentApi.latency }} ms</a-descriptions-item>
          <a-descriptions-item label="限流 QPS">{{ currentApi.qpsLimit }}</a-descriptions-item>
          <a-descriptions-item label="Owner" :span="2">{{ currentApi.owner }}</a-descriptions-item>
        </a-descriptions>

        <h3 style="margin-top: 24px">调用方 Top 5</h3>
        <a-table
          :columns="callerColumns"
          :data="currentApi.topCallers || []"
          :pagination="false"
          row-key="system"
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

const apis = ref<any[]>([])
const keyword = ref('')
const filterStatus = ref<string | undefined>(undefined)
const filterCategory = ref<string | undefined>(undefined)

const detailVisible = ref(false)
const currentApi = ref<any>(null)

onMounted(() => {
  apis.value = [
    {
      name: '用户画像查询', method: 'GET', path: '/api/v1/user/profile',
      category: 'user', status: 'online', qps: 8500, successRate: 99.95, latency: 45, qpsLimit: 10000, owner: '王运营',
      topCallers: [
        { system: '营销系统', qps: 3200, dailyCalls: '120万' },
        { system: '风控系统', qps: 2800, dailyCalls: '95万' },
        { system: '客户中心', qps: 1500, dailyCalls: '60万' },
        { system: 'BI 看板', qps: 800, dailyCalls: '30万' },
        { system: '运营工具', qps: 200, dailyCalls: '8万' }
      ]
    },
    {
      name: '授信查询', method: 'GET', path: '/api/v1/credit/score',
      category: 'risk', status: 'online', qps: 5200, successRate: 99.80, latency: 78, qpsLimit: 8000, owner: '张风控',
      topCallers: [
        { system: '风控决策', qps: 4200, dailyCalls: '150万' },
        { system: '贷后管理', qps: 800, dailyCalls: '35万' }
      ]
    },
    {
      name: '交易流水查询', method: 'POST', path: '/api/v1/trade/list',
      category: 'trade', status: 'online', qps: 3400, successRate: 99.92, latency: 62, qpsLimit: 5000, owner: '李产品',
      topCallers: [
        { system: '财务系统', qps: 1800, dailyCalls: '70万' },
        { system: '审计系统', qps: 1100, dailyCalls: '40万' }
      ]
    },
    {
      name: '优惠券发放', method: 'POST', path: '/api/v1/coupon/grant',
      category: 'marketing', status: 'online', qps: 2100, successRate: 99.65, latency: 92, qpsLimit: 3000, owner: '陈营销',
      topCallers: [
        { system: '营销画布', qps: 1500, dailyCalls: '55万' },
        { system: 'APP', qps: 600, dailyCalls: '22万' }
      ]
    },
    {
      name: '用户标签查询', method: 'GET', path: '/api/v1/user/tags',
      category: 'user', status: 'online', qps: 6800, successRate: 99.99, latency: 28, qpsLimit: 8000, owner: '王运营',
      topCallers: [
        { system: '客群圈选', qps: 4000, dailyCalls: '150万' },
        { system: '营销画布', qps: 2800, dailyCalls: '100万' }
      ]
    },
    {
      name: '合规检查', method: 'POST', path: '/api/v1/compliance/check',
      category: 'risk', status: 'offline', qps: 0, successRate: 0, latency: 0, qpsLimit: 1000, owner: '合规团队',
      topCallers: []
    }
  ]
})

const filteredApis = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return apis.value.filter(a => {
    if (k) {
      if (!a.name.toLowerCase().includes(k) && !a.path.toLowerCase().includes(k)) return false
    }
    if (filterStatus.value && a.status !== filterStatus.value) return false
    if (filterCategory.value && a.category !== filterCategory.value) return false
    return true
  })
})

const totalCount = computed(() => apis.value.length)
const todayCalls = computed(() => apis.value.reduce((s, a) => s + a.qps, 0))
const successRate = computed(() => {
  const online = apis.value.filter(a => a.status === 'online')
  if (online.length === 0) return 0
  return online.reduce((s, a) => s + a.successRate, 0) / online.length
})
const avgLatency = computed(() => {
  const online = apis.value.filter(a => a.status === 'online')
  if (online.length === 0) return 0
  return Math.round(online.reduce((s, a) => s + a.latency, 0) / online.length)
})

const columns = [
  { title: 'API 名', dataIndex: 'name', width: 160 },
  { title: '方法', dataIndex: 'method', slotName: 'method', width: 80 },
  { title: '路径', dataIndex: 'path', width: 240 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 90 },
  { title: 'QPS', dataIndex: 'qps', slotName: 'qps', width: 140 },
  { title: '成功率', dataIndex: 'successRate', slotName: 'successRate', width: 100 },
  { title: '延迟', dataIndex: 'latency', width: 80 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 80 }
]

const callerColumns = [
  { title: '调用方', dataIndex: 'system' },
  { title: 'QPS', dataIndex: 'qps', width: 100 },
  { title: '日调用', dataIndex: 'dailyCalls', width: 120 }
]

function methodColor(m: string) {
  return { GET: 'arcoblue', POST: 'green', PUT: 'orange', DELETE: 'red' }[m] || 'gray'
}
function statusColor(s: string) {
  return { online: 'green', offline: 'gray', deprecated: 'red' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { online: '在线', offline: '下线', deprecated: '已弃用' }[s] || s
}
function qpsColor(q: number) {
  if (q > 8000) return '#f53f3f'
  if (q > 5000) return '#ff7d00'
  return '#00b42a'
}
function resetFilters() {
  keyword.value = ''
  filterStatus.value = undefined
  filterCategory.value = undefined
}
function openApi(a: any) {
  currentApi.value = a
  detailVisible.value = true
}
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.service-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

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