<template>
  <div class="data-resources-page">
    <a-page-header
      title="数据资源目录"
      sub-title="业务系统 / 外部数据 / 文件 / 日志 / 实时数据 五大数据源"
      :back="false"
    >
      <template #extra>
        <a-space>
          <a-button @click="goBack">
            <template #icon><icon-left /></template>
            返回
          </a-button>
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            接入新数据源
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <!-- 顶部统计 -->
      <a-row :gutter="16" class="stats-row">
        <a-col :span="5">
          <a-card :bordered="false">
            <a-statistic title="业务系统" :value="stats.business" />
          </a-card>
        </a-col>
        <a-col :span="5">
          <a-card :bordered="false">
            <a-statistic title="外部数据源" :value="stats.external" />
          </a-card>
        </a-col>
        <a-col :span="5">
          <a-card :bordered="false">
            <a-statistic title="实时数据流" :value="stats.realtime" />
          </a-card>
        </a-col>
        <a-col :span="5">
          <a-card :bordered="false">
            <a-statistic title="文件导入" :value="stats.file" />
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card :bordered="false">
            <a-statistic title="总表数" :value="stats.totalTables" />
          </a-card>
        </a-col>
      </a-row>

      <!-- 切换 Tab -->
      <a-tabs v-model:active-key="activeType" default-active-key="business" size="large">
        <!-- Tab 1: 业务系统 -->
        <a-tab-pane key="business" title="业务系统">
          <a-card :bordered="false">
            <a-row :gutter="16" style="margin-bottom: 16px">
              <a-col :span="14">
                <a-input-search
                  v-model="bsSearch"
                  placeholder="输入系统名称、库名或负责人搜索"
                  size="large"
                  allow-clear
                  @search="bsHandleSearch"
                />
              </a-col>
              <a-col :span="5">
                <a-select v-model="bsType" placeholder="系统类型" allow-clear size="large">
                  <a-option value="core">核心交易</a-option>
                  <a-option value="risk">风控系统</a-option>
                  <a-option value="marketing">营销系统</a-option>
                  <a-option value="finance">财务系统</a-option>
                </a-select>
              </a-col>
              <a-col :span="5">
                <a-button size="large" @click="bsHandleFilter">查询</a-button>
              </a-col>
            </a-row>

            <a-row :gutter="[16, 16]">
              <a-col v-for="sys in filteredBusinessSystems" :key="sys.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card hoverable :bordered="false">
                  <template #title>
                    <a-space>
                      <a-tag :color="getDbTypeColor(sys.dbType)">{{ sys.dbType?.toUpperCase() }}</a-tag>
                      <span>{{ sys.name }}</span>
                    </a-space>
                  </template>
                  <a-descriptions :column="1" size="small">
                    <a-descriptions-item label="系统类型">{{ sys.systemTypeLabel }}</a-descriptions-item>
                    <a-descriptions-item label="数据库">{{ sys.database }}</a-descriptions-item>
                    <a-descriptions-item label="表数量">{{ sys.tableCount }} 个</a-descriptions-item>
                    <a-descriptions-item label="负责人">{{ sys.owner }}</a-descriptions-item>
                    <a-descriptions-item label="更新时间">{{ sys.updatedAt }}</a-descriptions-item>
                  </a-descriptions>
                  <template #actions>
                    <a-button type="text" size="small" @click="viewDetail(sys)">详情</a-button>
                    <a-button type="text" size="small" @click="syncMeta(sys)">同步元数据</a-button>
                  </template>
                </a-card>
              </a-col>
            </a-row>
            <a-empty v-if="filteredBusinessSystems.length === 0" description="暂无业务系统" />
          </a-card>
        </a-tab-pane>

        <!-- Tab 2: 外部数据 -->
        <a-tab-pane key="external" title="外部数据">
          <a-card :bordered="false">
            <a-row :gutter="16" style="margin-bottom: 16px">
              <a-col :span="14">
                <a-input-search
                  v-model="extSearch"
                  placeholder="搜索外部数据源"
                  size="large"
                  allow-clear
                />
              </a-col>
              <a-col :span="5">
                <a-select v-model="extType" placeholder="数据类型" allow-clear size="large">
                  <a-option value="identity">身份认证</a-option>
                  <a-option value="risk">风险</a-option>
                  <a-option value="company">企业</a-option>
                  <a-option value="asset">资产</a-option>
                </a-select>
              </a-col>
            </a-row>

            <a-table :data="filteredExternal" :pagination="{ pageSize: 10 }" row-key="id" size="medium">
              <template #columns>
                <a-table-column title="数据源名" data-index="name" />
                <a-table-column title="类型" data-index="type" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="extTypeColor(record.type)">{{ extTypeLabel(record.type) }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="供应商" data-index="provider" :width="130" />
                <a-table-column title="接入时间" data-index="connectedAt" :width="120" />
                <a-table-column title="调用次数" data-index="monthlyCalls" :width="120">
                  <template #cell="{ record }">{{ record.monthlyCalls.toLocaleString() }}</template>
                </a-table-column>
                <a-table-column title="费用" data-index="monthlyCost" :width="120">
                  <template #cell="{ record }">¥{{ record.monthlyCost.toLocaleString() }}</template>
                </a-table-column>
                <a-table-column title="操作" :width="180">
                  <template #cell="{ record }">
                    <a-button type="text" size="small">查看</a-button>
                    <a-button type="text" size="small">申请</a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <!-- Tab 3: 文件导入 -->
        <a-tab-pane key="file" title="文件导入">
          <a-card :bordered="false">
            <a-row :gutter="[16, 16]">
              <a-col v-for="f in fileImports" :key="f.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card hoverable :bordered="false">
                  <template #title>
                    <a-space>
                      <icon-file />
                      <span>{{ f.name }}</span>
                    </a-space>
                  </template>
                  <a-descriptions :column="1" size="small">
                    <a-descriptions-item label="格式">{{ f.format }}</a-descriptions-item>
                    <a-descriptions-item label="大小">{{ f.size }}</a-descriptions-item>
                    <a-descriptions-item label="行数">{{ f.rowCount.toLocaleString() }}</a-descriptions-item>
                    <a-descriptions-item label="状态">
                      <a-tag :color="f.status === 'success' ? 'green' : 'orange'">{{ f.status === 'success' ? '已完成' : '导入中' }}</a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item label="导入时间">{{ f.importedAt }}</a-descriptions-item>
                  </a-descriptions>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-tab-pane>

        <!-- Tab 4: 日志数据 -->
        <a-tab-pane key="log" title="日志数据">
          <a-card :bordered="false">
            <a-table :data="logSources" :pagination="{ pageSize: 10 }" row-key="id" size="medium">
              <template #columns>
                <a-table-column title="日志类型" data-index="name" />
                <a-table-column title="来源" data-index="source" :width="200" />
                <a-table-column title="格式" data-index="format" :width="80">
                  <template #cell="{ record }">
                    <a-tag>{{ record.format }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="日均量" data-index="dailyVolume" :width="120">
                  <template #cell="{ record }">{{ record.dailyVolume }}</template>
                </a-table-column>
                <a-table-column title="保留期" data-index="retention" :width="100" />
                <a-table-column title="状态" data-index="status" :width="90">
                  <template #cell="{ record }">
                    <a-tag :color="record.status === 'online' ? 'green' : 'gray'">
                      {{ record.status === 'online' ? '已接入' : '停用' }}
                    </a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <!-- Tab 5: 实时数据 -->
        <a-tab-pane key="realtime" title="实时数据">
          <a-card :bordered="false">
            <a-row :gutter="[16, 16]">
              <a-col v-for="r in realtimeStreams" :key="r.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card hoverable :bordered="false">
                  <template #title>
                    <a-space>
                      <icon-thunderbolt :style="thunderStyle" />
                      <span>{{ r.name }}</span>
                    </a-space>
                  </template>
                  <a-descriptions :column="1" size="small">
                    <a-descriptions-item label="Kafka Topic">{{ r.topic }}</a-descriptions-item>
                    <a-descriptions-item label="QPS">{{ r.qps }} /秒</a-descriptions-item>
                    <a-descriptions-item label="延迟">{{ r.latency }} ms</a-descriptions-item>
                    <a-descriptions-item label="状态">
                      <a-tag :color="r.status === 'online' ? 'green' : 'red'">
                        {{ r.status === 'online' ? '运行中' : '异常' }}
                      </a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item label="消费者">{{ r.consumers }} 个</a-descriptions-item>
                  </a-descriptions>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

// 状态
const activeType = ref('business')
const bsSearch = ref('')
const bsType = ref<string | undefined>(undefined)
const extSearch = ref('')
const extType = ref<string | undefined>(undefined)

// 统计
const stats = ref({
  business: 28,
  external: 32,
  realtime: 15,
  file: 18,
  totalTables: 12847
})

// 业务系统
const businessSystems = ref([
  { id: 'BS001', name: '核心交易系统', dbType: 'mysql', systemType: 'core', systemTypeLabel: '核心交易', database: 'core_trade', tableCount: 320, owner: '李开发', updatedAt: '今天 10:30' },
  { id: 'BS002', name: '风控决策引擎', dbType: 'doris', systemType: 'risk', systemTypeLabel: '风控系统', database: 'risk_decision', tableCount: 180, owner: '张风控', updatedAt: '今天 09:15' },
  { id: 'BS003', name: '用户中心', dbType: 'pg', systemType: 'core', systemTypeLabel: '核心交易', database: 'user_center', tableCount: 95, owner: '王运营', updatedAt: '今天 11:20' },
  { id: 'BS004', name: '营销活动平台', dbType: 'hive', systemType: 'marketing', systemTypeLabel: '营销系统', database: 'mkt_platform', tableCount: 420, owner: '陈营销', updatedAt: '今天 08:45' },
  { id: 'BS005', name: '财务核算系统', dbType: 'oracle', systemType: 'finance', systemTypeLabel: '财务系统', database: 'fin_acc', tableCount: 220, owner: '吴财务', updatedAt: '昨天 17:30' },
  { id: 'BS006', name: '数据分析平台', dbType: 'clickhouse', systemType: 'core', systemTypeLabel: '核心交易', database: 'olap', tableCount: 180, owner: '王运营', updatedAt: '今天 14:15' }
])

// 外部数据
const externalData = ref([
  { id: 'EXT001', name: '运营商三要素', type: 'identity', provider: '银联', connectedAt: '2024-12-10', monthlyCalls: 12500, monthlyCost: 15000 },
  { id: 'EXT002', name: '法院失信', type: 'risk', provider: '司法数据', connectedAt: '2024-11-20', monthlyCalls: 8500, monthlyCost: 8000 },
  { id: 'EXT003', name: '学历查询', type: 'identity', provider: '学信网', connectedAt: '2024-10-15', monthlyCalls: 3200, monthlyCost: 4000 },
  { id: 'EXT004', name: '企业工商信息', type: 'company', provider: '天眼查', connectedAt: '2024-09-08', monthlyCalls: 1200, monthlyCost: 12000 },
  { id: 'EXT005', name: '车辆信息', type: 'asset', provider: '交管局', connectedAt: '2024-08-22', monthlyCalls: 680, monthlyCost: 3000 },
  { id: 'EXT006', name: '房产信息', type: 'asset', provider: '不动产', connectedAt: '2024-07-15', monthlyCalls: 450, monthlyCost: 18000 },
  { id: 'EXT007', name: '多头借贷', type: 'risk', provider: '同盾', connectedAt: '2024-06-10', monthlyCalls: 15200, monthlyCost: 12000 }
])

// 文件导入
const fileImports = ref([
  { id: 'F001', name: '客户名单 2024Q4', format: 'CSV', size: '125 MB', rowCount: 1280000, status: 'success', importedAt: '2024-12-15 10:30' },
  { id: 'F002', name: '交易流水 11月', format: 'Parquet', size: '2.3 GB', rowCount: 25000000, status: 'success', importedAt: '2024-12-01 02:00' },
  { id: 'F003', name: '合作伙伴 2024', format: 'Excel', size: '8.5 MB', rowCount: 3500, status: 'importing', importedAt: '今天 14:20' },
  { id: 'F004', name: '区域分布数据', format: 'GeoJSON', size: '15 MB', rowCount: 0, status: 'success', importedAt: '2024-11-20 16:00' }
])

// 日志数据
const logSources = ref([
  { id: 'L001', name: 'Nginx 访问日志', source: '/var/log/nginx/access.log', format: 'JSON', dailyVolume: '1.2 亿条', retention: '30 天', status: 'online' },
  { id: 'L002', name: '应用业务日志', source: 'app-logger / Kafka', format: 'JSON', dailyVolume: '5.6 亿条', retention: '90 天', status: 'online' },
  { id: 'L003', name: '数据库慢查询', source: 'MySQL slow.log', format: 'Text', dailyVolume: '2,300 条', retention: '180 天', status: 'online' },
  { id: 'L004', name: '审计日志', source: 'audit-service', format: 'JSON', dailyVolume: '850 万条', retention: '365 天', status: 'online' },
  { id: 'L005', name: '错误日志归档', source: 'old-archive', format: 'Text', dailyVolume: '0', retention: '730 天', status: 'online' }
])

// 实时数据流
const realtimeStreams = ref([
  { id: 'R001', name: '交易事件流', topic: 'trade_events', qps: 8500, latency: 12, status: 'online', consumers: 8 },
  { id: 'R002', name: '用户行为流', topic: 'user_behavior', qps: 15000, latency: 18, status: 'online', consumers: 12 },
  { id: 'R003', name: '风控决策流', topic: 'risk_decision', qps: 2300, latency: 8, status: 'online', consumers: 5 },
  { id: 'R004', name: '告警事件流', topic: 'alerts', qps: 250, latency: 5, status: 'online', consumers: 3 },
  { id: 'R005', name: '外部回执流', topic: 'external_callback', qps: 1200, latency: 25, status: 'online', consumers: 4 }
])

// 计算属性
const filteredBusinessSystems = computed(() => {
  let result = businessSystems.value
  if (bsSearch.value) {
    const k = bsSearch.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(k) ||
      s.database.toLowerCase().includes(k) ||
      s.owner.toLowerCase().includes(k)
    )
  }
  if (bsType.value) {
    result = result.filter(s => s.systemType === bsType.value)
  }
  return result
})

const filteredExternal = computed(() => {
  let result = externalData.value
  if (extSearch.value) {
    const k = extSearch.value.toLowerCase()
    result = result.filter(s => s.name.toLowerCase().includes(k) || s.provider.toLowerCase().includes(k))
  }
  if (extType.value) {
    result = result.filter(s => s.type === extType.value)
  }
  return result
})

// 操作
function bsHandleSearch() {}
function bsHandleFilter() {}
function viewDetail(s: any) {
  Message.info(`查看业务系统: ${s.name}`)
}
function syncMeta(s: any) {
  Message.success(`已触发同步: ${s.name}`)
}

// 工具
const thunderStyle = { color: '#ff7d00' }

function getDbTypeColor(t: string) {
  return { mysql: 'arcoblue', doris: 'green', pg: 'cyan', hive: 'orange', oracle: 'red', clickhouse: 'purple' }[t] || 'gray'
}
function extTypeColor(t: string) {
  return { identity: 'arcoblue', risk: 'red', company: 'purple', asset: 'orange' }[t] || 'gray'
}
function extTypeLabel(t: string) {
  return { identity: '身份', risk: '风险', company: '企业', asset: '资产' }[t] || t
}

const goBack = () => router.push('discovery')
</script>

<style lang="scss" scoped>
.data-resources-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.content-wrapper {
  padding: 0 24px 24px;
}

.stats-row {
  margin-bottom: 16px;
}
</style>