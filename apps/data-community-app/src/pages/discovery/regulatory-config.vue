<template>
  <div class="regulatory-config-page">
    <a-page-header
      title="监管报表配置"
      sub-title="银保监 / 人行报表配置 · 报送字段映射 · 生成任务"
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
            新建报表配置
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <!-- 顶部统计 -->
      <a-row :gutter="16" class="stats-row">
        <a-col :span="6">
          <a-card :bordered="false">
            <a-statistic title="已配置报表" :value="stats.configured" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false">
            <a-statistic title="报送中" :value="stats.running" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false">
            <a-statistic title="本月成功" :value="stats.success" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card :bordered="false">
            <a-statistic title="本月失败" :value="stats.failed" />
          </a-card>
        </a-col>
      </a-row>

      <!-- 监管机构 Tabs -->
      <a-card :bordered="false">
        <a-tabs default-active-key="cbrc">
          <a-tab-pane v-for="org in orgs" :key="org.code" :title="`${org.name} (${org.reports.length})`">
            <a-table :data="org.reports" :pagination="false" row-key="id" size="medium">
              <template #columns>
                <a-table-column title="报表名" data-index="name" :width="220" />
                <a-table-column title="报表编码" data-index="code" :width="180" />
                <a-table-column title="频率" :width="100">
                  <template #cell="{ record }">
                    <a-tag>{{ record.frequency }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="字段数" data-index="fieldCount" :width="100" />
                <a-table-column title="报送方式" :width="120">
                  <template #cell="{ record }">
                    <a-tag :color="record.method === 'auto' ? 'green' : 'orange'">
                      {{ record.method === 'auto' ? '自动' : '手动' }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="状态" :width="100">
                  <template #cell="{ record }">
                    <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="下次报送" data-index="nextRun" :width="180" />
                <a-table-column title="操作" :width="200">
                  <template #cell="{ record }">
                    <a-button type="text" size="small" @click="openMapping(record)">字段映射</a-button>
                    <a-button type="text" size="small" @click="runNow(record)">立即执行</a-button>
                    <a-button type="text" size="small" @click="viewHistory(record)">历史</a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-card>

      <!-- 字段映射 Drawer -->
      <a-drawer
        v-model:visible="mappingDrawerVisible"
        :title="`字段映射 · ${currentReport?.name || ''}`"
        :width="900"
        :footer="false"
      >
        <a-alert type="info" :show-icon="true" style="margin-bottom: 16px">
          将系统数据表字段映射到监管报表字段,支持自动匹配和手动调整
        </a-alert>

        <a-row :gutter="16" style="margin-bottom: 16px">
          <a-col :span="12">
            <a-descriptions :column="1" :bordered="true" size="small">
              <a-descriptions-item label="报表编码">{{ currentReport?.code }}</a-descriptions-item>
              <a-descriptions-item label="频率">{{ currentReport?.frequency }}</a-descriptions-item>
              <a-descriptions-item label="字段数">{{ currentReport?.fieldCount }}</a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :span="12">
            <a-statistic title="已映射" :value="mappedCount" :value-style="statMapped" />
            <a-statistic title="未映射" :value="unmappedCount" :value-style="statUnmapped" style="margin-top: 8px" />
          </a-col>
        </a-row>

        <a-table :data="mappingFields" :pagination="false" row-key="id" size="small">
          <template #columns>
            <a-table-column title="报表字段" data-index="reportField" :width="200" />
            <a-table-column title="类型" :width="100">
              <template #cell="{ record }">
                <a-tag size="small">{{ record.type }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="系统字段" :width="220">
              <template #cell="{ record }">
                <a-select v-model="record.systemField" size="small" style="width: 200px" allow-clear>
                  <a-option v-for="f in systemFieldOptions" :key="f" :value="f">{{ f }}</a-option>
                </a-select>
              </template>
            </a-table-column>
            <a-table-column title="规则" :width="120">
              <template #cell="{ record }">
                <a-tag v-if="record.systemField" color="green" size="small">已映射</a-tag>
                <a-tag v-else color="red" size="small">未映射</a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <div style="text-align: right; margin-top: 16px">
          <a-space>
            <a-button @click="autoMapping">自动匹配</a-button>
            <a-button type="primary" @click="saveMapping">保存映射</a-button>
          </a-space>
        </div>
      </a-drawer>

      <!-- 历史 Drawer -->
      <a-drawer
        v-model:visible="historyDrawerVisible"
        :title="`执行历史 · ${currentReport?.name || ''}`"
        :width="720"
        :footer="false"
      >
        <a-table :data="historyRows" :pagination="{ pageSize: 10, showTotal: true }" row-key="id" size="small">
          <template #columns>
            <a-table-column title="执行时间" data-index="time" :width="180" />
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="耗时" data-index="duration" :width="100" />
            <a-table-column title="记录数" data-index="rows" :width="100" />
            <a-table-column title="操作人" data-index="operator" :width="100" />
            <a-table-column title="备注" data-index="remark" />
          </template>
        </a-table>
      </a-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { RegReportStore } from '../../mock/shared/dataset'

const router = useRouter()

// 颜色 style 对象(避开 template 里 # 解析错误)
const statMapped = { color: '#00b42a' }
const statUnmapped = { color: '#f53f3f' }

const stats = ref({
  configured: RegReportStore.all().length,
  running: RegReportStore.all().filter(r => r.status === 'running').length,
  success: 1280,
  failed: RegReportStore.all().filter(r => r.status === 'failed').length
})

// 由公共 mock 派生:按 org 分组
const orgs = ref(
  (() => {
    const all = RegReportStore.all()
    const byOrg: Record<string, { name: string; reports: any[] }> = {}
    all.forEach(r => {
      const key = r.org
      if (!byOrg[key]) {
        byOrg[key] = {
          name:
            key === 'cbrc' ? '银保监' :
            key === 'pboc' ? '人行' :
            key === 'cbirc' ? '金融监管总局' :
            '证监会',
          reports: []
        }
      }
      byOrg[key].reports.push({
        id: r.id,
        name: r.name,
        code: r.code,
        frequency: r.frequency,
        fieldCount: r.fieldCount,
        method: r.method,
        status: r.status,
        nextRun: r.nextRun,
        owner: r.owner,
        description: r.description
      })
    })
    return Object.entries(byOrg).map(([code, info]) => ({ code, ...info }))
  })()
)

const mappingDrawerVisible = ref(false)
const currentReport = ref<any>(null)
const mappingFields = ref<any[]>([])

const systemFieldOptions = [
  'dim_user.user_id',
  'dim_user.name',
  'dim_user.mobile',
  'fact_loan_apply.apply_id',
  'fact_loan_apply.amount',
  'dws_risk_score.credit_score',
  'asset_customer_balance.total_assets',
  'dws_repayment_plan.overdue_amount'
]

const mappedCount = computed(() => mappingFields.value.filter(f => f.systemField).length)
const unmappedCount = computed(() => mappingFields.value.filter(f => !f.systemField).length)

function openMapping(report: any) {
  currentReport.value = report
  // 模拟生成映射字段
  mappingFields.value = [
    { id: '1', reportField: '机构代码', type: 'string', systemField: 'dim_user.user_id' },
    { id: '2', reportField: '客户名称', type: 'string', systemField: 'dim_user.name' },
    { id: '3', reportField: '证件号码', type: 'string', systemField: '' },
    { id: '4', reportField: '贷款金额', type: 'number', systemField: 'fact_loan_apply.amount' },
    { id: '5', reportField: '贷款余额', type: 'number', systemField: 'asset_customer_balance.total_assets' },
    { id: '6', reportField: '风险评分', type: 'number', systemField: 'dws_risk_score.credit_score' },
    { id: '7', reportField: '逾期金额', type: 'number', systemField: 'dws_repayment_plan.overdue_amount' },
    { id: '8', reportField: '发生日期', type: 'date', systemField: '' }
  ]
  mappingDrawerVisible.value = true
}

function autoMapping() {
  // 自动匹配未映射字段
  mappingFields.value.forEach(f => {
    if (!f.systemField) {
      // 简单匹配规则
      if (f.reportField.includes('机构')) f.systemField = 'dim_user.user_id'
      else if (f.reportField.includes('客户')) f.systemField = 'dim_user.name'
      else if (f.reportField.includes('贷款金额')) f.systemField = 'fact_loan_apply.amount'
      else if (f.reportField.includes('风险')) f.systemField = 'dws_risk_score.credit_score'
      else if (f.reportField.includes('逾期')) f.systemField = 'dws_repayment_plan.overdue_amount'
      else if (f.reportField.includes('日期')) f.systemField = ''
    }
  })
  Message.success('自动匹配完成')
}

function saveMapping() {
  Message.success('字段映射已保存')
  mappingDrawerVisible.value = false
}

function runNow(report: any) {
  const prev = report.status
  report.status = 'running'
  Message.loading(`正在执行: ${report.name}`)
  setTimeout(() => {
    // mock:90% 成功、10% 失败
    const ok = Math.random() > 0.1
    report.status = ok ? 'running' : 'failed'
    Message.success(ok ? `${report.name} 执行完成` : `${report.name} 执行失败`)
    if (ok) stats.value.success += 1
    else { stats.value.failed += 1; report.status = 'failed' }
    // 任务跑完恢复
    setTimeout(() => { report.status = prev === 'failed' ? 'failed' : 'running' }, 0)
    // 把这次执行追加到历史
    historyRows.value.unshift({
      id: 'H' + Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      status: ok ? 'success' : 'failed',
      duration: (Math.random() * 30 + 5).toFixed(1) + 's',
      rows: Math.floor(Math.random() * 5000 + 100),
      operator: '王运营',
      remark: ok ? '' : '校验失败:字段 XX 缺失'
    })
  }, 1500)
}

function viewHistory(report: any) {
  currentReport.value = report
  historyDrawerVisible.value = true
}

// 历史抽屉相关
const historyDrawerVisible = ref(false)
// 给历史加几条 mock 历史,首次进入抽屉时显示
const historyRows = ref([
  { id: 'H001', time: '2026-08-01 02:00:12', status: 'success', duration: '18.3s', rows: 4521, operator: '系统自动', remark: '' },
  { id: 'H002', time: '2026-07-01 02:00:08', status: 'success', duration: '17.9s', rows: 4490, operator: '系统自动', remark: '' },
  { id: 'H003', time: '2026-06-01 02:00:21', status: 'failed', duration: '5.2s', rows: 0, operator: '系统自动', remark: '校验失败:字段 cust_id 缺失' },
  { id: 'H004', time: '2026-05-01 02:00:09', status: 'success', duration: '18.1s', rows: 4388, operator: '系统自动', remark: '' }
])

function statusColor(s: string) {
  return { running: 'green', paused: 'orange', draft: 'gray', failed: 'red' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { running: '运行中', paused: '已暂停', draft: '草稿', failed: '失败' }[s] || s
}

const goBack = () => router.push('discovery')
</script>

<style lang="scss" scoped>
.regulatory-config-page {
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