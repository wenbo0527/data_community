<template>
  <div class="settlement-management">
    <div class="page-header">
      <h3>结算管理</h3>
      <p class="desc">支持多供应商、多合同的批量结算任务管理</p>
    </div>

    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="suppliers" label="供应商">
          <a-select v-model="filters.suppliers" multiple allow-clear placeholder="选择供应商" style="width: 260px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="contracts" label="合同">
          <a-select v-model="filters.contracts" multiple allow-clear placeholder="选择合同" style="width: 300px">
            <a-option v-for="c in contractOptions" :key="c.id" :value="c.id">{{ c.contractName }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="granularity" label="粒度">
          <a-select v-model="filters.granularity" allow-clear placeholder="选择" style="width: 120px">
            <a-option value="year">年</a-option>
            <a-option value="quarter">季</a-option>
            <a-option value="month">月</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="timeLabel" label="时间">
          <a-input v-model="filters.timeLabel" allow-clear placeholder="如 2025 / 2025-Q2 / 2025-01" style="width: 160px" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" allow-clear placeholder="选择状态" style="width: 140px">
            <a-option value="pending">待执行</a-option>
            <a-option value="running">执行中</a-option>
            <a-option value="succeeded">已完成</a-option>
            <a-option value="failed">失败</a-option>
            <a-option value="canceled">已取消</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-space>
            <a-button type="primary" @click="showCreate = true">
              <template #icon><icon-plus /></template>
              发起结算
            </a-button>
            <a-button @click="refresh">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
            <a-button type="outline" @click="exportList">导出列表</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="结算任务列表" :bordered="true" :loading="loading">
      <a-table :data="displayedTasks" row-key="id" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="任务编号" :width="140">
            <template #cell="{ record }">{{ record.id }}</template>
          </a-table-column>
          <a-table-column title="供应商数" :width="100">
            <template #cell="{ record }">{{ record.supplierIds.length }}</template>
          </a-table-column>
          <a-table-column title="合同数" :width="100">
            <template #cell="{ record }">{{ record.contractIds.length }}</template>
          </a-table-column>
          <a-table-column title="结算周期" :width="160">
            <template #cell="{ record }">{{ granularityLabel(record.granularity) }} · {{ record.timeLabel }}</template>
          </a-table-column>
          <a-table-column title="预算金额" :width="140">
            <template #cell="{ record }">{{ formatAmount(record.summary.budgetAmount) }}</template>
          </a-table-column>
          <a-table-column title="实际金额" :width="140">
            <template #cell="{ record }">{{ formatAmount(record.summary.actualAmount) }}</template>
          </a-table-column>
          <a-table-column title="差异金额/率" :width="160">
            <template #cell="{ record }">{{ formatAmount(record.summary.diffAmount) }}（{{ formatPercent(record.summary.diffRate) }}）</template>
          </a-table-column>
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }"><a-tag :status="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
          </a-table-column>
          <a-table-column title="进度" :width="180">
            <template #cell="{ record }"><a-progress :percent="record.progress" /></template>
          </a-table-column>
          <a-table-column title="创建人" :width="120">
            <template #cell="{ record }">{{ record.createdBy }}</template>
          </a-table-column>
          <a-table-column title="创建时间" :width="180">
            <template #cell="{ record }">{{ formatDate(record.createdAt) }}</template>
          </a-table-column>
          <a-table-column title="操作" :width="260" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" type="text" @click="openDetail(record)">查看</a-button>
                <a-button size="small" type="text" @click="generateReport(record)">生成报告</a-button>
                <a-button size="small" type="text" @click="updateData(record)">更新数据</a-button>
                <a-popconfirm content="确认取消该任务？" @ok="() => cancelTask(record)">
                  <a-button size="small" type="text">取消</a-button>
                </a-popconfirm>
                <a-button size="small" type="text" @click="downloadReport(record)">下载报告</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="showCreate" title="发起结算" :width="800" ok-text="创建" cancel-text="取消" @ok="submitCreate">
      <a-form :model="createForm" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item field="supplierIds" label="供应商" required>
              <a-select v-model="createForm.supplierIds" multiple allow-clear placeholder="选择供应商">
                <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="contractIds" label="合同" required>
              <a-select v-model="createForm.contractIds" multiple allow-clear placeholder="选择合同">
                <a-option v-for="c in filteredContractOptions" :key="c.id" :value="c.id">{{ c.contractName }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item field="granularity" label="结算粒度" required>
              <a-select v-model="createForm.granularity" placeholder="选择">
                <a-option value="year">年</a-option>
                <a-option value="quarter">季</a-option>
                <a-option value="month">月</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="timeLabel" label="结算时间" required>
              <a-input v-model="createForm.timeLabel" placeholder="如 2025 / 2025-Q2 / 2025-01" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="strict" label="严格对齐">
              <a-switch v-model="createForm.strict" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item field="includeTax" label="包含税费">
              <a-switch v-model="createForm.includeTax" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="tolerance" label="误差阈值(元)">
              <a-input-number v-model="createForm.tolerance" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="createdBy" label="创建人">
              <a-input v-model="createForm.createdBy" placeholder="输入创建人" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item field="budgetSnapshotId" label="预算快照">
              <a-select v-model="createForm.budgetSnapshotId" placeholder="选择快照">
                <a-option value="budget-v1">budget-v1</a-option>
                <a-option value="budget-v2">budget-v2</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="actualSnapshotId" label="实际数据账期">
              <a-select v-model="createForm.actualSnapshotId" placeholder="选择账期">
                <a-option value="actual-2025-01">actual-2025-01</a-option>
                <a-option value="actual-2025-02">actual-2025-02</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model="createForm.remark" :rows="3" placeholder="填写备注" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:visible="detailVisible" :width="720" title="任务详情">
      <a-steps :current="currentStep" style="margin-bottom: 12px">
        <a-step title="数据锁定" />
        <a-step title="差异计算" />
        <a-step title="规则校验" />
        <a-step title="报告生成" />
        <a-step title="数据更新" />
      </a-steps>
      <a-card title="子任务进度" :bordered="true" style="margin-bottom: 12px">
        <a-table :data="subtasks" :pagination="false">
          <template #columns>
            <a-table-column title="供应商" data-index="supplierId" />
            <a-table-column title="合同数" :width="100">
              <template #cell="{ record }">{{ record.contracts.length }}</template>
            </a-table-column>
            <a-table-column title="状态" :width="120">
              <template #cell="{ record }"><a-tag :status="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
            </a-table-column>
            <a-table-column title="进度" :width="160">
              <template #cell="{ record }"><a-progress :percent="record.progress" /></template>
            </a-table-column>
            <a-table-column title="操作" :width="200">
              <template #cell="{ record }">
                <a-space>
                  <a-button size="small" type="text" @click="retrySubtask(record)">重试</a-button>
                  <a-button size="small" type="text" @click="skipSubtask(record)">跳过</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
      <div style="text-align: right">
        <a-space>
          <a-button type="primary" @click="generateReport(currentTask!)">生成报告</a-button>
          <a-button type="outline" @click="detailVisible = false">关闭</a-button>
        </a-space>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { useContractStore } from '@/modules/budget/stores/contract'

type Granularity = 'year'|'quarter'|'month'
type TaskStatus = 'pending'|'running'|'succeeded'|'failed'|'canceled'

interface SettlementSummary { budgetAmount: number; actualAmount: number; diffAmount: number; diffRate: number }
interface SettlementSubTask { id: string; taskId: string; supplierId: string; status: TaskStatus; progress: number; contracts: string[]; summary: SettlementSummary }
interface SettlementTask { id: string; supplierIds: string[]; contractIds: string[]; granularity: Granularity; timeLabel: string; status: TaskStatus; progress: number; createdBy: string; createdAt: string; summary: SettlementSummary }

const store = useContractStore()

const loading = ref(false)
const tasks = ref<SettlementTask[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })

const filters = reactive<{ suppliers: string[]; contracts: string[]; granularity?: Granularity; timeLabel?: string; status?: TaskStatus }>({ suppliers: [], contracts: [] })

const supplierOptions = computed(() => Array.from(new Set(store.list.map((i: any) => i.supplier).filter(Boolean))))
const contractOptions = computed(() => store.list.map((i: any) => ({ id: String(i.id), contractName: String(i.contractName || i.id), supplier: i.supplier || '—', amount: Number(i.amount) || 0, writtenOffAmount: Number(i.writtenOffAmount) || 0 })))
const filteredContractOptions = computed(() => {
  if (!createForm.supplierIds?.length) return contractOptions.value
  return contractOptions.value.filter(c => createForm.supplierIds.includes(c.supplier))
})

const displayedTasks = computed(() => tasks.value.filter(t => {
  if (filters.suppliers.length && !filters.suppliers.some(s => t.supplierIds.includes(s))) return false
  if (filters.contracts.length && !filters.contracts.some(c => t.contractIds.includes(c))) return false
  if (filters.granularity && t.granularity !== filters.granularity) return false
  if (filters.timeLabel && t.timeLabel !== filters.timeLabel) return false
  if (filters.status && t.status !== filters.status) return false
  return true
}))

const showCreate = ref(false)
const createForm = reactive<{ supplierIds: string[]; contractIds: string[]; granularity: Granularity; timeLabel: string; strict: boolean; includeTax: boolean; tolerance: number; createdBy: string; budgetSnapshotId?: string; actualSnapshotId?: string; remark?: string }>({ supplierIds: [], contractIds: [], granularity: 'month', timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`, strict: false, includeTax: true, tolerance: 0, createdBy: '管理员' })

const currentTask = ref<SettlementTask | null>(null)
const detailVisible = ref(false)
const subtasks = ref<SettlementSubTask[]>([])
const currentStep = ref(0)
const timers = ref<Record<string, number>>({})

const formatAmount = (n?: number) => {
  if (n === undefined || n === null) return '—'
  return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
}
const formatPercent = (n?: number) => {
  if (n === undefined || n === null) return '—'
  return `${(n * 100).toFixed(2)}%`
}
const formatDate = (d?: string | Date) => {
  try { return new Date(d || '').toLocaleString() } catch { return '—' }
}
const granularityLabel = (g?: Granularity) => g === 'year' ? '年' : g === 'quarter' ? '季' : g === 'month' ? '月' : '—'
const statusLabel = (s: TaskStatus) => s === 'pending' ? '待执行' : s === 'running' ? '执行中' : s === 'succeeded' ? '已完成' : s === 'failed' ? '失败' : '已取消'
const statusTag = (s: TaskStatus) => s === 'pending' ? 'default' : s === 'running' ? 'warning' : s === 'succeeded' ? 'success' : s === 'failed' ? 'danger' : 'default'

const calcSummaryForContracts = (ids: string[]) => {
  const items = contractOptions.value.filter(c => ids.includes(c.id))
  const budgetAmount = items.reduce((sum, i) => sum + i.amount, 0)
  const actualAmount = items.reduce((sum, i) => sum + i.writtenOffAmount, 0)
  const diffAmount = actualAmount - budgetAmount
  const diffRate = budgetAmount > 0 ? diffAmount / budgetAmount : 0
  return { budgetAmount, actualAmount, diffAmount, diffRate }
}

const submitCreate = async () => {
  if (!createForm.supplierIds.length || !createForm.contractIds.length) {
    Message.error('请选择供应商与合同')
    return
  }
  const id = `ST-${Date.now()}`
  const summary = calcSummaryForContracts(createForm.contractIds)
  const task: SettlementTask = { id, supplierIds: [...createForm.supplierIds], contractIds: [...createForm.contractIds], granularity: createForm.granularity, timeLabel: createForm.timeLabel, status: 'running', progress: 0, createdBy: createForm.createdBy, createdAt: new Date().toISOString(), summary }
  tasks.value.unshift(task)
  pagination.total = tasks.value.length
  showCreate.value = false
  startTask(task)
  Message.success('结算任务已创建')
}

const startTask = (task: SettlementTask) => {
  const suppliers = Array.from(new Set(contractOptions.value.filter(c => task.contractIds.includes(c.id)).map(c => c.supplier)))
  subtasks.value = suppliers.map((s, idx) => ({ id: `${task.id}-S${idx+1}`, taskId: task.id, supplierId: s, status: 'running', progress: 0, contracts: contractOptions.value.filter(c => c.supplier === s && task.contractIds.includes(c.id)).map(c => c.id), summary: calcSummaryForContracts(contractOptions.value.filter(c => c.supplier === s && task.contractIds.includes(c.id)).map(c => c.id)) }))
  detailVisible.value = true
  currentTask.value = task
  currentStep.value = 1
  const t = window.setInterval(() => {
    let done = 0
    subtasks.value = subtasks.value.map(st => {
      if (st.status === 'running') {
        const p = Math.min(100, st.progress + Math.floor(10 + Math.random() * 20))
        const status: TaskStatus = p >= 100 ? 'succeeded' : 'running'
        if (status === 'succeeded') done += 1
        return { ...st, progress: p, status }
      }
      if (st.status === 'succeeded') done += 1
      return st
    })
    const percent = Math.floor((done / subtasks.value.length) * 100)
    task.progress = percent
    if (percent >= 100) {
      task.status = 'succeeded'
      currentStep.value = 4
      window.clearInterval(t)
      delete timers.value[task.id]
      Message.success('结算任务已完成，可生成报告')
    }
  }, 1000)
  timers.value[task.id] = t
}

const openDetail = (task: SettlementTask) => {
  currentTask.value = task
  detailVisible.value = true
  currentStep.value = task.status === 'succeeded' ? 4 : task.status === 'running' ? 2 : 0
}

const retrySubtask = (st: SettlementSubTask) => {
  st.status = 'running'
  st.progress = 0
}
const skipSubtask = (st: SettlementSubTask) => {
  st.status = 'succeeded'
  st.progress = 100
}

const generateReport = (task: SettlementTask) => {
  const merged = {
    id: `SR-${Date.now()}`,
    taskId: task.id,
    type: 'merged',
    summary: task.summary,
    suppliers: subtasks.value.map(st => ({ supplierId: st.supplierId, summary: st.summary }))
  }
  const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${merged.id}.json`
  a.click()
  URL.revokeObjectURL(url)
  Message.success('结算报告已生成并下载')
}

const downloadReport = (task: SettlementTask) => generateReport(task)

const updateData = (task: SettlementTask) => {
  Message.info('数据更新为占位行为，待后端联调后写回合同域与预算域')
}

const cancelTask = (task: SettlementTask) => {
  task.status = 'canceled'
  task.progress = 0
  const t = timers.value[task.id]
  if (t) { window.clearInterval(t); delete timers.value[task.id] }
  Message.success('任务已取消')
}

const applyFilter = () => {}
const resetFilter = () => { filters.suppliers = []; filters.contracts = []; filters.granularity = undefined; filters.timeLabel = undefined; filters.status = undefined }
const refresh = async () => { await store.fetchContractList({ page: 1, pageSize: 100 }); Message.success('已刷新合同数据') }
const exportList = () => {
  const header = ['任务编号','供应商数','合同数','结算粒度','结算时间','预算金额','实际金额','差异金额','差异率','状态','进度','创建人','创建时间']
  const rows = displayedTasks.value.map(t => [t.id, t.supplierIds.length, t.contractIds.length, granularityLabel(t.granularity), t.timeLabel, t.summary.budgetAmount, t.summary.actualAmount, t.summary.diffAmount, t.summary.diffRate, statusLabel(t.status), t.progress, t.createdBy, formatDate(t.createdAt)])
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `settlement-tasks-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const onPageChange = (page: number) => { pagination.current = page }

onMounted(async () => {
  await store.fetchContractList({ page: 1, pageSize: 100 })
  seedMockTasks()
})

const seedMockTasks = () => {
  const allContracts = contractOptions.value
  if (!allContracts.length) return
  const sampleContracts = allContracts.slice(0, Math.min(5, allContracts.length)).map(c => c.id)
  const sampleSuppliers = Array.from(new Set(allContracts.slice(0, 5).map(c => c.supplier))).filter(Boolean)
  const t1: SettlementTask = { id: `ST-${Date.now()-1}`, supplierIds: sampleSuppliers, contractIds: sampleContracts, granularity: 'month', timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`, status: 'pending', progress: 0, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts) }
  const t2: SettlementTask = { id: `ST-${Date.now()-2}`, supplierIds: sampleSuppliers.slice(0,2), contractIds: sampleContracts.slice(0,3), granularity: 'quarter', timeLabel: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth()+1)/3)}`, status: 'running', progress: 45, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(0,3)) }
  const t3: SettlementTask = { id: `ST-${Date.now()-3}`, supplierIds: sampleSuppliers.slice(0,1), contractIds: sampleContracts.slice(0,2), granularity: 'year', timeLabel: `${new Date().getFullYear()}`, status: 'succeeded', progress: 100, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(0,2)) }
  tasks.value = [t2, t3, t1]
  pagination.total = tasks.value.length
}
</script>

<style scoped>
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; }
</style>
