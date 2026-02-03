<template>
  <div class="settlement-management">
    <div class="page-header">
      <h3>结算管理</h3>
    </div>

    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="suppliers" label="征信机构">
          <a-select v-model="filters.suppliers" multiple allow-clear placeholder="选择征信机构" style="width: 260px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="contracts" label="合同">
          <a-select v-model="filters.contracts" multiple allow-clear placeholder="选择合同" style="width: 300px">
            <a-option v-for="c in contractOptions" :key="c.id" :value="c.id">{{ c.contractName }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="timeLabel" label="结算周期">
          <a-select v-model="filters.timeLabel" allow-clear placeholder="选择月份" style="width: 160px">
            <a-option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.value.replace('-', '') }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" allow-clear placeholder="选择状态" style="width: 140px">
            <a-option value="costing">待核算</a-option>
            <a-option value="reconcile">待对账</a-option>
            <a-option value="writeoff">待核销</a-option>
            <a-option value="pending_reimbursement">待报销</a-option>
            <a-option value="done">已完成</a-option>
          </a-select>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-space>
            <a-button type="primary" @click="applyFilter">查询</a-button>
            <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
            <a-button style="margin-left: 8px" type="primary" @click="showCreate = true">
              <template #icon><IconPlus /></template>
              发起结算
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="结算任务列表" :bordered="true" :loading="loading">
      <a-table :data="displayedTasks" row-key="id" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="任务名称" :width="180">
            <template #cell="{ record }">{{ record.taskName || record.id }}</template>
          </a-table-column>
          <a-table-column title="征信机构" :width="140">
            <template #cell="{ record }">{{ record.supplierIds[0] || '—' }}</template>
          </a-table-column>
          <a-table-column title="合同数" :width="100">
            <template #cell="{ record }">{{ record.contractIds.length }}</template>
          </a-table-column>
          <a-table-column title="结算周期" :width="200">
            <template #cell="{ record }">{{ granularityLabel(record.granularity) }} · {{ rangeLabel(record.timeLabel) }}</template>
          </a-table-column>
          <a-table-column title="实际金额" :width="140">
            <template #cell="{ record }">{{ formatAmount(record.summary.actualAmount) }}</template>
          </a-table-column>
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }">
              <StatusTag :status="record.stage || 'costing'" dictKey="budgetTask" />
            </template>
          </a-table-column>
          <a-table-column title="创建人" :width="120">
            <template #cell="{ record }">{{ record.createdBy }}</template>
          </a-table-column>
          <a-table-column title="创建时间" :width="180">
            <template #cell="{ record }">{{ DateUtils.formatDateTime(record.createdAt) }}</template>
          </a-table-column>
          <a-table-column title="操作" :width="400" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button v-if="record.stage==='costing'" size="small" type="text" @click="startCosting(record)">发起核算</a-button>
                <a-button v-if="record.stage==='reconcile'" size="small" type="text" @click="startReconcile(record)">发起对账</a-button>
                <a-button v-if="record.stage==='writeoff'" size="small" type="text" @click="startWriteoff(record)">发起核销</a-button>
                <a-button v-if="record.stage==='pending_reimbursement'" size="small" type="text" @click="startReimbursement(record)">发起报销</a-button>
                <a-dropdown>
                  <a-button size="small" type="text">下载数据</a-button>
                  <template #content>
                    <a-doption @click="exportCosting(record)">导出核算数据</a-doption>
                    <a-doption @click="exportReconcile(record)">导出对账数据</a-doption>
                    <a-doption @click="exportWriteoff(record)">导出核销数据</a-doption>
                  </template>
                </a-dropdown>
                <a-button v-if="record.stage!=='done'" size="small" type="text" status="danger" @click="deleteTask(record)">删除</a-button>
                <a-button v-if="record.stage==='done'" size="small" type="text" @click="cancelTask(record)">撤销</a-button>
                <a-button v-if="record.stage==='done' && !record.archived" size="small" type="text" @click="archiveTask(record)">归档</a-button>
                <a-button size="small" type="text" @click="openDetail(record)">查看</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="showCreate" title="发起结算" :width="800" ok-text="创建" cancel-text="取消" @ok="submitCreate">
      <a-form ref="createFormRef" :model="createForm" :rules="createRules" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item field="taskName" label="任务名称" required>
              <a-input v-model="createForm.taskName" placeholder="请输入任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="supplierId" label="征信机构" required>
              <a-select v-model="createForm.supplierId" allow-clear placeholder="选择征信机构">
                <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item field="timeLabel" label="结算周期" required>
              <a-select v-model="createForm.timeLabel" placeholder="选择月份">
                <a-option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item field="createdBy" label="创建人">
              <a-input v-model="createForm.createdBy" placeholder="输入创建人" />
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
            <a-table-column title="对接渠道" data-index="supplierId" />
            <a-table-column title="合同数" :width="100">
              <template #cell="{ record }">{{ record.contracts.length }}</template>
            </a-table-column>
            <a-table-column title="状态" :width="120">
              <template #cell="{ record }"><a-tag :status="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
            </a-table-column>
            <a-table-column title="进度" :width="160">
                  <template #cell="{ record }"><a-progress :percent="record.progress" /></template>
                </a-table-column>
                <a-table-column title="操作" :width="240">
                  <template #cell="{ record }">
                    <a-space>
                      <a-button size="small" type="text" :disabled="record.status !== 'succeeded'" @click="enterFlow(record)">进入结算流程</a-button>
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
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { useContractStore } from '@/modules/budget/stores/contract'
import { useSettlementFlowStore } from '../stores/settlementFlow'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'

type Granularity = 'year'|'quarter'|'month'
type TaskStatus = 'pending'|'running'|'succeeded'|'failed'|'canceled'|'costing'|'reconcile'|'writeoff'|'pending_reimbursement'|'done'
type Stage = 'costing'|'reconcile'|'writeoff'|'pending_reimbursement'|'done'

interface SettlementSummary { budgetAmount: number; actualAmount: number; diffAmount: number; diffRate: number }
interface SettlementSubTask { id: string; taskId: string; supplierId: string; status: TaskStatus; progress: number; contracts: string[]; summary: SettlementSummary }
interface SettlementTask { id: string; taskName?: string; supplierIds: string[]; contractIds: string[]; granularity: Granularity; timeLabel: string; status: TaskStatus; stage?: Stage; archived?: boolean; progress: number; createdBy: string; createdAt: string; summary: SettlementSummary }

const store = useContractStore()
const flowStore = useSettlementFlowStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const tasks = ref<SettlementTask[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })

const filters = reactive<{ suppliers: string[]; contracts: string[]; granularity?: Granularity; timeLabel?: string; status?: TaskStatus }>({ suppliers: [], contracts: [] })

const supplierOptions = computed(() => Array.from(new Set(store.list.map((i: any) => i.supplier).filter(Boolean))))
const contractOptions = computed(() => store.list.map((i: any) => ({ id: String(i.id), contractName: String(i.contractName || i.id), supplier: i.supplier || '—', amount: Number(i.amount) || 0, writtenOffAmount: Number(i.writtenOffAmount) || 0 })))
const filteredContractOptions = computed(() => {
  if (!createForm.supplierId) return contractOptions.value
  return contractOptions.value.filter(c => c.supplier === createForm.supplierId)
})

const displayedTasks = computed(() => tasks.value.filter(t => {
  if (filters.suppliers.length && !filters.suppliers.some(s => t.supplierIds.includes(s))) return false
  if (filters.contracts.length && !filters.contracts.some(c => t.contractIds.includes(c))) return false
  if (filters.granularity && t.granularity !== filters.granularity) return false
  if (filters.timeLabel && t.timeLabel !== filters.timeLabel) return false
  if (filters.status && t.stage !== filters.status) return false
  return true
}))

const showCreate = ref(false)
const createFormRef = ref()
const createForm = reactive<{ taskName: string; supplierId: string; granularity: Granularity; timeLabel: string; createdBy: string; remark?: string }>({ taskName: '', supplierId: '', granularity: 'month', timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`, createdBy: '管理员' })
const createRules = {
  taskName: [{ required: true, message: '请输入任务名称' }],
  supplierId: [{ required: true, message: '请选择征信机构' }],
  timeLabel: [{ required: true, message: '请选择结算周期' }]
}

const currentTask = ref<SettlementTask | null>(null)
const detailVisible = ref(false)
const subtasks = ref<SettlementSubTask[]>([])
const currentStep = ref(0)
const timers = ref<Record<string, number>>({})

const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const formatPercent = (n?: number) => { if (n === undefined || n === null) return '—'; return `${(n * 100).toFixed(2)}%` }
const granularityLabel = (g?: Granularity) => g === 'year' ? '年' : g === 'quarter' ? '季' : g === 'month' ? '月' : '—'
const rangeLabel = (monthStr?: string) => {
  if (!monthStr) return '—'
  const [y, m] = monthStr.split('-').map(x => Number(x))
  if (!y || !m) return '—'
  const start = `${y}${String(m).padStart(2,'0')}01`
  const endDate = new Date(y, m, 0)
  const end = `${endDate.getFullYear()}${String(endDate.getMonth()+1).padStart(2,'0')}${String(endDate.getDate()).padStart(2,'0')}`
  return `${start} - ${end}`
}
const pad = (n: number) => String(n).padStart(2,'0')
const monthOptions = computed(() => {
  const arr: Array<{ value: string; label: string }> = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const v = `${d.getFullYear()}-${pad(d.getMonth()+1)}`
    arr.push({ value: v, label: `${d.getFullYear()}${pad(d.getMonth()+1)}` })
  }
  return arr
})
const statusLabel = (s: TaskStatus) => {
  const map: Record<string, string> = { pending: '待执行', running: '执行中', succeeded: '已完成', failed: '失败', canceled: '已取消', costing: '待核算', reconcile: '待对账', writeoff: '待核销', pending_reimbursement: '待报销', done: '已完成' }
  return map[s] || s
}
const statusTag = (s: TaskStatus) => {
  const map: Record<string, string> = { pending: 'default', running: 'warning', succeeded: 'success', failed: 'danger', canceled: 'gray', costing: 'warning', reconcile: 'primary', writeoff: 'purple', pending_reimbursement: 'cyan', done: 'success' }
  return map[s] || 'default'
}

const calcSummaryForContracts = (ids: string[]) => {
  const items = contractOptions.value.filter(c => ids.includes(c.id))
  const budgetAmount = items.reduce((sum, i) => sum + i.amount, 0)
  const actualAmount = items.reduce((sum, i) => sum + i.writtenOffAmount, 0)
  const diffAmount = actualAmount - budgetAmount
  const diffRate = budgetAmount > 0 ? diffAmount / budgetAmount : 0
  return { budgetAmount, actualAmount, diffAmount, diffRate }
}

const submitCreate = async () => {
  try { await (createFormRef.value as any)?.validate() } catch { Message.error('请完整填写必填项'); return }
  if (!createForm.supplierId || !createForm.timeLabel) { Message.error('请选择征信机构与结算周期'); return }
  const id = `ST-${Date.now()}`
  const summary = { budgetAmount: 0, actualAmount: 0, diffAmount: 0, diffRate: 0 }
  const taskName = createForm.taskName || `结算任务-${createForm.supplierId || '未知征信机构'}-${createForm.timeLabel}`
  const task: SettlementTask = { id, taskName, supplierIds: [createForm.supplierId].filter(Boolean), contractIds: [], granularity: createForm.granularity, timeLabel: createForm.timeLabel, status: 'pending', stage: 'costing', progress: 0, createdBy: createForm.createdBy, createdAt: new Date().toISOString(), summary }
  tasks.value.unshift(task)
  pagination.total = tasks.value.length
  showCreate.value = false
  await fillMockSnapshots(task)
  router.push(`/budget/settlement/task/${id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=0`)
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

const openDetail = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}`) }
const retrySubtask = (st: SettlementSubTask) => { st.status = 'running'; st.progress = 0 }
const skipSubtask = (st: SettlementSubTask) => { st.status = 'succeeded'; st.progress = 100 }
const generateReport = (task: SettlementTask) => {
  const merged = { id: `SR-${Date.now()}`, taskId: task.id, type: 'merged', summary: task.summary, suppliers: subtasks.value.map(st => ({ supplierId: st.supplierId, summary: st.summary })) }
  const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${merged.id}.json`; a.click(); URL.revokeObjectURL(url)
  Message.success('结算报告已生成并下载')
}
const downloadReport = (task: SettlementTask) => generateReport(task)
const updateData = (task: SettlementTask) => { Message.info('数据更新为占位行为，待后端联调后写回合同域与预算域') }
const cancelTask = (task: SettlementTask) => { task.status = 'canceled'; Message.success('已撤销') }
const archiveTask = (task: SettlementTask) => { task.archived = true; Message.success('已归档') }
const deleteTask = (task: SettlementTask) => { tasks.value = tasks.value.filter(t => t.id !== task.id); pagination.total = tasks.value.length; Message.success('任务已删除') }
const startCosting = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=0`) }
const startReconcile = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=1`) }
const startWriteoff = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=2`) }
const startReimbursement = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=3`) }
const applyFilter = () => {}
const resetFilter = () => { filters.suppliers = []; filters.contracts = []; filters.granularity = undefined; filters.timeLabel = undefined; filters.status = undefined }
const exportCsv = (filename: string, header: string[], rows: Array<Array<string|number>>) => {
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
const exportCosting = (task: SettlementTask) => {
  const header = ['任务ID','征信机构','产品编码','产品名称','单位','单价','调用量','计费用量','免费量','减免量','系统金额(含税)','税率','币种','来源','行ID']
  const rows: Array<Array<string|number>> = []
  for (const sid of task.supplierIds) {
    const snap = flowStore.getCosting(sid, task.timeLabel)
    if (snap?.lines?.length) {
      for (const l of snap.lines) {
        rows.push([task.id, sid, l.productCode, l.productName, l.unit, l.unitPrice, l.usageQty, l.chargeQty, l.freeQuota ?? 0, l.freeDeducted ?? 0, l.amountInclTax, l.taxRate, l.currency, l.source, l.lineId])
      }
    }
  }
  exportCsv(`costing-detail-${task.id}.csv`, header, rows)
  Message.success('已导出核算明细数据')
}
const exportReconcile = (task: SettlementTask) => {
  const header = ['任务ID','征信机构','产品编码','系统金额','账单金额','最终金额','差异原因']
  const rows: Array<Array<string|number>> = []
  for (const sid of task.supplierIds) {
    const snap = flowStore.getReconcile(sid, task.timeLabel)
    if (snap?.items?.length) {
      for (const it of snap.items) {
        rows.push([task.id, sid, it.productCode, it.systemAmount, it.externalAmount, it.finalAmount, it.reason || ''])
      }
    }
  }
  exportCsv(`reconcile-detail-${task.id}.csv`, header, rows)
  Message.success('已导出对账明细数据')
}
const exportWriteoff = (task: SettlementTask) => {
  const header = ['任务ID','征信机构','产品编码','合同ID','核销金额','核销后剩余','时间']
  const rows: Array<Array<string|number>> = []
  for (const sid of task.supplierIds) {
    const snap = flowStore.getWriteoff(sid, task.timeLabel)
    if (snap?.records?.length) {
      for (const r of snap.records) {
        rows.push([task.id, sid, r.productCode, r.contractId, r.amount, r.remainingAfter, r.createdAt])
      }
    }
  }
  exportCsv(`writeoff-detail-${task.id}.csv`, header, rows)
  Message.success('已导出核销明细数据')
}
const enterFlow = (record: any) => { router.push(`/budget/settlement/task/${record.id}`) }
const onPageChange = (page: number) => { pagination.current = page }
onMounted(async () => { await store.fetchContractList({ page: 1, pageSize: 100 }); seedMockTasks() })
const goCreatePage = () => { router.push('/budget/settlement/task/new') }
const fillMockSnapshots = async (task: SettlementTask) => {
  const { generateBillLines } = await import('@/modules/budget/utils/costing')
  const { getActivePricingMap } = await import('@/modules/budget/api/pricingArchive')
  for (const sid of task.supplierIds) {
    const pricingMap = await getActivePricingMap(sid)
    const lines = await generateBillLines(sid, task.timeLabel)
    const confirmed: Record<string, boolean> = {}
    const excluded: Record<string, boolean> = {}
    const excludeRatio = 0.1 + Math.random() * 0.1
    const confirmRatio = 0.7 + Math.random() * 0.15
    const totalCount = lines.length || 1
    const excludeCount = Math.max(0, Math.floor(totalCount * excludeRatio))
    const confirmCount = Math.max(0, Math.floor(totalCount * confirmRatio))
    const shuffled = [...lines].sort(() => Math.random() - 0.5)
    const toExclude = new Set(shuffled.slice(0, excludeCount).map(l => l.lineId))
    const specials = shuffled.filter(l => pricingMap[l.productCode]?.billingType === 'special').map(l => l.lineId)
    for (const l of lines) {
      if (toExclude.has(l.lineId)) {
        excluded[l.lineId] = true
        l.verifyStatus = 'rejected'
        confirmed[l.lineId] = false as any
      } else if (specials.includes(l.lineId)) {
        confirmed[l.lineId] = false as any
        l.verifyStatus = 'pending'
      } else {
        confirmed[l.lineId] = true
        l.verifyStatus = 'verified'
      }
    }
    let confirmedAssigned = Object.values(confirmed).filter(Boolean).length
    for (const l of shuffled) {
      if (confirmedAssigned >= confirmCount) break
      if (!confirmed[l.lineId] && !excluded[l.lineId] && !specials.includes(l.lineId)) {
        confirmed[l.lineId] = true
        l.verifyStatus = 'verified'
        confirmedAssigned++
      }
    }
    flowStore.setCostingSnapshot(sid, task.timeLabel, lines, confirmed, excluded)
    const reconItems = lines.map(l => {
      const system = Number(l.amountInclTax || 0)
      const factor = 0.98 + Math.random() * 0.06
      const external = Number((system * factor).toFixed(2))
      const final = external
      const drift = external - system
      const reasonPool = drift < -0.01 ? ['账单优惠', '促销折扣', '协议价变更'] : drift > 0.01 ? ['额外服务', '超出配额', '临时加开'] : ['口径差异', '账期不一致']
      const reason = reasonPool[Math.floor(Math.random() * reasonPool.length)]
      return { productCode: l.productCode, systemAmount: system, externalAmount: external, finalAmount: final, reason }
    })
    flowStore.setReconcileSnapshot(sid, task.timeLabel, reconItems)
    const candidateContracts = contractOptions.value.filter(c => c.supplier === sid)
    const pickContract = (candidateContracts[0]?.id) || (contractOptions.value.find(c => c.supplier === sid)?.id) || (contractOptions.value[0]?.id) || 'C-0001'
    const pendingByProduct = flowStore.pendingAmountByProduct(sid, task.timeLabel)
    const products = Object.keys(pendingByProduct)
    for (const pcode of products.slice(0, Math.min(3, products.length))) {
      const total = pendingByProduct[pcode] || 0
      const firstPct = 0.3 + Math.random() * 0.2
      const firstAmt = Number((total * firstPct).toFixed(2))
      let remaining = Math.max(0, Number((total - firstAmt).toFixed(2)))
      flowStore.addWriteoffRecord(sid, task.timeLabel, { productCode: pcode, contractId: pickContract, amount: firstAmt, remainingAfter: remaining, createdAt: new Date().toISOString() })
      if (remaining > 0) {
        const secondPct = 0.2 + Math.random() * 0.3
        const secondAmt = Number((remaining * secondPct).toFixed(2))
        remaining = Math.max(0, Number((remaining - secondAmt).toFixed(2)))
        flowStore.addWriteoffRecord(sid, task.timeLabel, { productCode: pcode, contractId: pickContract, amount: secondAmt, remainingAfter: remaining, createdAt: new Date().toISOString() })
        if (remaining > 0 && Math.random() < 0.2) {
          const finalAmt = remaining
          remaining = 0
          flowStore.addWriteoffRecord(sid, task.timeLabel, { productCode: pcode, contractId: pickContract, amount: finalAmt, remainingAfter: remaining, createdAt: new Date().toISOString() })
        }
      }
    }
    
    // 如果任务阶段在核销之后，标记核销完成
    if (['pending_reimbursement', 'done'].includes(task.stage || '')) {
      flowStore.markWriteoffCompleted(sid, task.timeLabel, true)
    }

    // 如果任务已完成，或处于待报销状态且随机已有部分数据
    if (task.stage === 'done' || (task.stage === 'pending_reimbursement' && Math.random() > 0.5)) {
      flowStore.setReimbursementSnapshot(sid, task.timeLabel, {
        reimbursementNo: `RB-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        paymentDate: new Date().toISOString().split('T')[0]
      })
      if (task.stage === 'done') {
        flowStore.markReimbursementCompleted(sid, task.timeLabel, true)
      }
    }
  }
}
const seedMockTasks = () => {
  const allContracts = contractOptions.value
  if (!allContracts.length) return
  const sampleContracts = allContracts.slice(0, Math.min(5, allContracts.length)).map(c => c.id)
  const sampleSuppliers = Array.from(new Set(allContracts.slice(0, 5).map(c => c.supplier))).filter(Boolean)
  const ym = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
  const nameFor = (arr: string[]) => arr.length > 1 ? `${arr[0]}等${arr.length}家` : (arr[0] || '未知供应商')
  const t1: SettlementTask = { id: `ST-${Date.now()-1}`, taskName: `结算任务-${nameFor(sampleSuppliers)}-${ym}`, supplierIds: sampleSuppliers, contractIds: sampleContracts, granularity: 'month', timeLabel: ym, status: 'pending', stage: 'costing', progress: 0, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts) }
  const t2: SettlementTask = { id: `ST-${Date.now()-2}`, taskName: `结算任务-${nameFor(sampleSuppliers.slice(0,2))}-${ym}`, supplierIds: sampleSuppliers.slice(0,2), contractIds: sampleContracts.slice(0,3), granularity: 'month', timeLabel: ym, status: 'pending', stage: 'reconcile', progress: 45, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(0,3)) }
  const t3: SettlementTask = { id: `ST-${Date.now()-3}`, taskName: `结算任务-${nameFor(sampleSuppliers.slice(0,1))}-${ym}`, supplierIds: sampleSuppliers.slice(0,1), contractIds: sampleContracts.slice(0,2), granularity: 'month', timeLabel: ym, status: 'succeeded', stage: 'done', progress: 100, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(0,2)) }
  const t4: SettlementTask = { id: `ST-${Date.now()-4}`, taskName: `结算任务-待报销-${nameFor(sampleSuppliers.slice(1,2))}-${ym}`, supplierIds: sampleSuppliers.slice(1,2), contractIds: sampleContracts.slice(1,2), granularity: 'month', timeLabel: ym, status: 'pending', stage: 'pending_reimbursement', progress: 80, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(1,2)) }
  const t5: SettlementTask = { id: `ST-${Date.now()-5}`, taskName: `结算任务-待报销2-${nameFor(sampleSuppliers.slice(2,3))}-${ym}`, supplierIds: sampleSuppliers.slice(2,3), contractIds: sampleContracts.slice(2,3), granularity: 'month', timeLabel: ym, status: 'pending', stage: 'pending_reimbursement', progress: 85, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(2,3)) }
  tasks.value = [t2, t3, t4, t5, t1]
  pagination.total = tasks.value.length
  Promise.resolve().then(async () => {
    for (const t of tasks.value) { await fillMockSnapshots(t) }
  })
}
</script>

<style scoped>
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; }
</style>
