<template>
  <div class="settlement-management">
    <div class="page-header">
      <h3>结算管理</h3>
      <p class="desc"></p>
    </div>
    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="suppliers" label="供应商">
          <a-select v-model="filters.suppliers" multiple allow-clear placeholder="选择供应商" style="width: 260px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="channels" label="对接渠道">
          <a-select v-model="filters.channels" multiple allow-clear placeholder="选择对接渠道" style="width: 260px">
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
            <a-option value="month">月</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="timeLabel" label="时间">
          <a-input v-model="filters.timeLabel" allow-clear placeholder="如 2025-01" style="width: 160px" />
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
            <a-button type="primary" @click="goAccounting">
              <template #icon><IconPlus /></template>
              发起结算
            </a-button>
            <a-button @click="refresh">
              <template #icon><IconRefresh /></template>
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
          <a-table-column title="任务名称" :width="160">
            <template #cell="{ record }">
              <a-button size="small" type="text" @click="handleAction(record)">{{ record.taskName || '—' }}</a-button>
            </template>
          </a-table-column>
          <a-table-column title="供应商" :width="160">
            <template #cell="{ record }">{{ getExternalSupplierName(record.supplierIds[0] || '') || (record.supplierIds[0] || '—') }}</template>
          </a-table-column>
          <a-table-column title="对接渠道" :width="160">
            <template #cell="{ record }">{{ getExternalSupplierName(record.supplierIds[0] || '') || (record.supplierIds[0] || '—') }}</template>
          </a-table-column>
          <a-table-column title="合同数" :width="100">
            <template #cell="{ record }">{{ record.contractIds.length }}</template>
          </a-table-column>
          <a-table-column title="结算周期" :width="160">
            <template #cell="{ record }">{{ granularityLabel(record.granularity) }} · {{ record.timeLabel }}</template>
          </a-table-column>

          <a-table-column title="实际金额" :width="140">
            <template #cell="{ record }">{{ formatAmount(record.summary.actualAmount) }}</template>
          </a-table-column>
          <a-table-column title="差异金额/率" :width="160">
            <template #cell="{ record }">{{ formatAmount(record.summary.diffAmount) }}（{{ formatPercent(record.summary.diffRate) }}）</template>
          </a-table-column>
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }"><a-tag :status="statusTag(record.status, record.stage)">{{ statusLabel(record.status, record.stage) }}</a-tag></template>
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
                <a-button size="small" type="text" @click="handleAction(record)">{{ actionLabel(record) }}</a-button>
                <a-popconfirm v-if="record.status !== 'succeeded'" content="确认删除该任务？" @ok="() => deleteTask(record)">
                  <a-button size="small" type="text">删除</a-button>
                </a-popconfirm>
                <a-space v-else>
                  <a-popconfirm content="确认撤销该任务到待核算？" @ok="() => revertTask(record)">
                    <a-button size="small" type="text">撤销</a-button>
                  </a-popconfirm>
                  <a-popconfirm content="确认归档该任务？" @ok="() => archiveTask(record)">
                    <a-button size="small" type="text">归档</a-button>
                  </a-popconfirm>
                </a-space>
                <a-button size="small" type="text" @click="downloadReport(record)">下载</a-button>
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
            <a-form-item field="supplierId" label="供应商" required>
              <a-select v-model="createForm.supplierId" allow-clear placeholder="选择供应商">
                <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="channelId" label="对接渠道">
              <a-select v-model="createForm.channelId" allow-clear placeholder="选择对接渠道">
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
                <a-option value="month">月</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="timeLabel" label="结算时间" required>
              <a-input v-model="createForm.timeLabel" placeholder="如 2025-01" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { useContractStore } from '@/modules/budget/stores/contract'
import { useSettlementSupplier } from '@/modules/budget/composables/useSettlementSupplier'
import { getSettlementTasks, createSettlementTask, updateSettlementTask, deleteSettlementTask } from '@/modules/budget/api/settlement'
import { settlementSystemListener, supplierChangeNotifier } from '@/modules/external-data/utils/supplierChangeNotifier'
import { useSettlementFlowStore } from '@/modules/budget/stores/settlementFlow'
import { getActivePricingMap } from '@/modules/budget/api/pricingArchive'
import { generateBillLines } from '@/modules/budget/utils/costing'

type Granularity = 'year'|'quarter'|'month'
type TaskStatus = 'pending'|'running'|'succeeded'|'failed'|'canceled'

interface SettlementSummary { budgetAmount: number; actualAmount: number; diffAmount: number; diffRate: number }
interface SettlementTask { id: string; supplierIds: string[]; contractIds: string[]; granularity: Granularity; timeLabel: string; status: TaskStatus; progress: number; createdBy: string; createdAt: string; summary: SettlementSummary; stage?: 'costing'|'reconcile'|'writeoff'; taskName?: string }

const store = useContractStore()
const { 
  supplierOptions: externalSupplierOptions, 
  loadSuppliers: loadExternalSuppliers,
  getSupplierName: getExternalSupplierName,
  validateSuppliers
} = useSettlementSupplier()

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const tasks = ref<SettlementTask[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })

const filters = reactive<{ suppliers: string[]; channels: string[]; contracts: string[]; granularity?: Granularity; timeLabel?: string; status?: TaskStatus }>({ suppliers: [], channels: [], contracts: [] })

const supplierOptions = computed(() => externalSupplierOptions.value.map((option: { label: string }) => option.label))
const contractOptions = computed(() => store.list.map((i: any) => ({ id: String(i.id), contractName: String(i.contractName || i.id), supplier: i.supplier || '—', amount: Number(i.amount) || 0, writtenOffAmount: Number(i.writtenOffAmount) || 0 })))
const filteredContractOptions = computed(() => { 
  const sid = createForm.supplierId
  if (!sid) return contractOptions.value
  const name = getExternalSupplierName(sid)
  return contractOptions.value.filter((c: { supplier: string }) => c.supplier === name || c.supplier === sid)
})

const displayedTasks = computed(() => tasks.value.filter((t: SettlementTask) => { if (filters.suppliers.length && !filters.suppliers.some((s: string) => t.supplierIds.includes(s))) return false; if (filters.contracts.length && !filters.contracts.some((c: string) => t.contractIds.includes(c))) return false; if (filters.granularity && t.granularity !== filters.granularity) return false; if (filters.timeLabel && t.timeLabel !== filters.timeLabel) return false; if (filters.status && t.status !== filters.status) return false; return true }))

const showCreate = ref(false)
const createForm = reactive<{ supplierId: string; channelId?: string; contractIds: string[]; granularity: Granularity; timeLabel: string; strict: boolean; includeTax: boolean; tolerance: number; createdBy: string; budgetSnapshotId?: string; actualSnapshotId?: string; remark?: string }>({ supplierId: '', channelId: '', contractIds: [], granularity: 'month', timeLabel: '2025-12', strict: false, includeTax: true, tolerance: 0, createdBy: '管理员' })

// 抽屉版流程已移除

const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const formatPercent = (n?: number) => { if (n === undefined || n === null) return '—'; return `${(n * 100).toFixed(2)}%` }
const formatDate = (d?: string | Date) => { try { return new Date(d || '').toLocaleString() } catch { return '—' } }
const granularityLabel = (g?: Granularity) => g === 'year' ? '年' : g === 'quarter' ? '季' : g === 'month' ? '月' : '—'
const statusLabel = (s: TaskStatus, stage?: string) => {
  if (s === 'pending') {
    if (stage === 'costing') return '待核算'
    if (stage === 'reconcile') return '待对账'
    if (stage === 'writeoff') return '待核销'
    return '待执行'
  }
  return s === 'running' ? '执行中' : s === 'succeeded' ? '已完成' : s === 'failed' ? '失败' : '已取消'
}
const statusTag = (s: TaskStatus, stage?: string) => {
  if (s === 'pending') return 'default'
  return s === 'running' ? 'warning' : s === 'succeeded' ? 'success' : s === 'failed' ? 'danger' : 'default'
}

const calcSummaryForContracts = (ids: string[]) => { const items = contractOptions.value.filter((c: { id: string }) => ids.includes(c.id)); const budgetAmount = items.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0); const actualAmount = items.reduce((sum: number, i: { writtenOffAmount: number }) => sum + i.writtenOffAmount, 0); const diffAmount = actualAmount - budgetAmount; const diffRate = budgetAmount > 0 ? diffAmount / budgetAmount : 0; return { budgetAmount, actualAmount, diffAmount, diffRate } }

const submitCreate = async () => {
  if (!createForm.supplierId || !createForm.contractIds.length) { Message.error('请选择供应商与合同'); return }
  
  // 验证供应商可用性
  const validation = await validateSuppliers([createForm.supplierId])
  if (!validation.valid) {
    const invalidNames = validation.details.filter(d => !d.available).map(d => d.name)
    Message.error(`以下供应商不可用：${invalidNames.join(', ')}`)
    return
  }
  
  const summary = calcSummaryForContracts(createForm.contractIds)
  const task = await createSettlementTask({
    supplierIds: [createForm.supplierId],
    contractIds: [...createForm.contractIds],
    granularity: createForm.granularity,
    timeLabel: createForm.timeLabel,
    createdBy: createForm.createdBy,
    summary
  } as any)
  tasks.value.unshift(task)
  pagination.total = tasks.value.length
  showCreate.value = false
  Message.success('结算任务已创建')
}

const editTaskName = async (record: SettlementTask) => {
  const next = window.prompt('输入任务名称', record.taskName || '')
  if (next && next.trim()) {
    record.taskName = next.trim()
    await updateSettlementTask(record.id, { taskName: record.taskName } as any)
    Message.success('任务名称已更新')
  }
}
const actionLabel = (record: SettlementTask) => {
  if (record.status === 'pending') {
    if (record.stage === 'costing') return '发起核算'
    if (record.stage === 'reconcile') return '发起对账'
    if (record.stage === 'writeoff') return '发起核销'
    return '处理'
  }
  if (record.status === 'succeeded') return '查看'
  return '处理'
}
const handleAction = (record: SettlementTask) => {
  const supplierId = record.supplierIds[0] || ''
  const month = record.granularity === 'month' ? record.timeLabel : `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
  const stage = record.stage || (record.status === 'succeeded' ? 'writeoff' : 'costing')
  router.push(`/risk/budget/accounting?stage=${stage}&supplierId=${encodeURIComponent(supplierId)}&month=${encodeURIComponent(month)}`)
}
const goAccounting = () => {
  const sid = createForm.supplierId || (externalSupplierOptions.value[0]?.value || '')
  const mon = createForm.timeLabel || '2025-12'
  router.push(`/risk/budget/accounting?stage=costing&supplierId=${encodeURIComponent(sid)}&month=${encodeURIComponent(mon)}`)
}
const deleteTask = async (record: SettlementTask) => {
  const ok = await deleteSettlementTask(record.id)
  if (ok) {
    tasks.value = tasks.value.filter((t: SettlementTask) => t.id !== record.id)
    pagination.total = tasks.value.length
    Message.success('任务已删除')
  } else {
    Message.error('删除任务失败')
  }
}
const revertTask = async (record: SettlementTask) => {
  record.status = 'pending'
  record.stage = 'costing'
  await updateSettlementTask(record.id, { status: 'pending', stage: 'costing' } as any)
  Message.success('已撤销至待核算')
}
const archiveTask = async (record: SettlementTask) => {
  await updateSettlementTask(record.id, { archived: true } as any)
  Message.success('任务已归档')
}

const flowStore = useSettlementFlowStore()
const generateReport = async (task: SettlementTask) => {
  const rows: Array<{ supplierName: string; productName: string; productCode: string; usageQty: number; billingType: string; billingRule: string; actualAmount: number }> = []
  for (const sid of task.supplierIds) {
    const supplierName = getExternalSupplierName(sid)
    const pricingMap = await getActivePricingMap(sid)
    const month = task.granularity === 'month' ? task.timeLabel : `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
    const costing = flowStore.getCosting(sid, month)
    const reconcile = flowStore.getReconcile(sid, month)
    const usageByProduct: Record<string, number> = {}
    const nameByProduct: Record<string, string> = {}
    if (costing) {
      for (const l of costing.lines) {
        if (costing.excluded[l.lineId]) continue
        usageByProduct[l.productCode] = (usageByProduct[l.productCode] || 0) + (Number(l.usageQty) || 0)
        nameByProduct[l.productCode] = l.productName
      }
    }
    const items = reconcile?.items || []
    for (const it of items) {
      const btype = pricingMap[it.productCode]?.billingType
      const billingType = btype === 'fixed' ? '固定' : btype === 'tiered' ? '阶梯' : btype === 'special' ? '特殊' : '按量'
      const tiers = pricingMap[it.productCode]?.tiers || []
      const billingRule = btype === 'tiered' && tiers.length ? tiers.map((t: any) => `${t.lower}-${t.upper ?? '∞'}次：${Number(t.price).toFixed(4)}元/次`).join('；') : (pricingMap[it.productCode]?.remark || (btype === 'fixed' ? `单价：${Number(pricingMap[it.productCode]?.unitPrice || 0).toFixed(4)}元` : '—'))
      rows.push({
        supplierName,
        productName: nameByProduct[it.productCode] || it.productCode,
        productCode: it.productCode,
        usageQty: usageByProduct[it.productCode] || 0,
        billingType,
        billingRule,
        actualAmount: Number((it.finalAmount || 0).toFixed(2))
      })
    }
  }
  const report = { id: `SR-${Date.now()}`, taskId: task.id, granularity: task.granularity, timeLabel: task.timeLabel, rows }
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${report.id}.json`
  a.click()
  URL.revokeObjectURL(url)
  Message.success('费用报告（JSON）已生成并下载')
}
const downloadReport = (task: SettlementTask) => generateReport(task)
const updateData = (task: SettlementTask) => { Message.info('数据更新为占位行为，待后端联调后写回合同域与预算域') }

const applyFilter = () => {}
const resetFilter = () => { filters.suppliers = []; filters.contracts = []; filters.granularity = undefined; filters.timeLabel = undefined; filters.status = undefined }
const refresh = async () => { await store.fetchContractList({ page: 1, pageSize: 100 }); Message.success('已刷新合同数据') }
const exportList = () => {
  const header = ['任务名称','供应商','合同数','结算粒度','结算时间','预算金额','实际金额','差异金额','差异率','状态','创建人','创建时间']
  const rows = displayedTasks.value.map((t: SettlementTask) => [
    t.taskName || '—',
    getExternalSupplierName(t.supplierIds[0] || '') || (t.supplierIds[0] || '—'),
    t.contractIds.length,
    granularityLabel(t.granularity),
    t.timeLabel,
    t.summary.budgetAmount,
    t.summary.actualAmount,
    t.summary.diffAmount,
    t.summary.diffRate,
    statusLabel(t.status, t.stage),
    t.createdBy,
    formatDate(t.createdAt)
  ])
  const csv = [header.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n')
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
  // 注册供应商变更监听器
  const unregisterListener = supplierChangeNotifier.registerListener(settlementSystemListener)
  
  // 组件卸载时注销监听器
  onUnmounted(() => {
    unregisterListener()
  })
  
  // 加载外部供应商数据
  await loadExternalSuppliers()
  await store.fetchContractList({ page: 1, pageSize: 100 })
  const resp = await getSettlementTasks()
  tasks.value = resp.list
  if (!tasks.value.length) await seedMockTasks()
})
const seedMockTasks = async () => {
  const allContracts = contractOptions.value
  if (!allContracts.length) return
  const sampleContracts = allContracts.slice(0, Math.min(5, allContracts.length)).map((c: { id: string }) => c.id)
  const supplierOpts = externalSupplierOptions.value.slice(0, 3)
  if (!supplierOpts.length) return
  const t1: SettlementTask = {
    id: `ST-${Date.now()-1}`,
    supplierIds: [supplierOpts[0].value],
    contractIds: sampleContracts,
    granularity: 'month',
    timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
    status: 'pending',
    stage: 'costing',
    progress: 0,
    createdBy: '系统',
    createdAt: new Date().toISOString(),
    taskName: `核算-${supplierOpts[0].label}`,
    summary: calcSummaryForContracts(sampleContracts)
  }
  const t2: SettlementTask = {
    id: `ST-${Date.now()-2}`,
    supplierIds: [supplierOpts[1].value],
    contractIds: sampleContracts.slice(0,3),
    granularity: 'month',
    timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
    status: 'pending',
    stage: 'reconcile',
    progress: 0,
    createdBy: '系统',
    createdAt: new Date().toISOString(),
    taskName: `对账-${supplierOpts[1].label}`,
    summary: calcSummaryForContracts(sampleContracts.slice(0,3))
  }
  const t3: SettlementTask = {
    id: `ST-${Date.now()-3}`,
    supplierIds: [supplierOpts[2].value],
    contractIds: sampleContracts.slice(0,2),
    granularity: 'month',
    timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
    status: 'succeeded',
    stage: 'writeoff',
    progress: 100,
    createdBy: '系统',
    createdAt: new Date().toISOString(),
    taskName: `核销-${supplierOpts[2].label}`,
    summary: calcSummaryForContracts(sampleContracts.slice(0,2))
  }
  const monNow = '2025-12'
  const t4: SettlementTask = {
    id: `ST-${Date.now()-4}`,
    supplierIds: [supplierOpts[0].value],
    contractIds: sampleContracts.slice(0,4),
    granularity: 'month',
    timeLabel: monNow,
    status: 'pending',
    stage: 'writeoff',
    progress: 90,
    createdBy: '系统',
    createdAt: new Date().toISOString(),
    taskName: `核销-${supplierOpts[0].label}-待核销`,
    summary: calcSummaryForContracts(sampleContracts.slice(0,4))
  }
  tasks.value = [t2, t3, t4, t1]
  pagination.total = tasks.value.length
  
  // 为mock任务生成对应的费用核算快照，确保可直接进入对账
  try {
    const ensureCosting = async (sid: string, mon: string) => {
      const lines = await generateBillLines(sid, mon)
      const confirmed: Record<string, boolean> = {}
      const excluded: Record<string, boolean> = {}
      flowStore.setCostingSnapshot(sid, mon, lines, confirmed, excluded)
    }
    // 对账阶段任务优先生成快照
    await ensureCosting(supplierOpts[1].value, monNow)
    // 其他示例供应商也生成，便于切换演示
    await ensureCosting(supplierOpts[0].value, monNow)
    await ensureCosting(supplierOpts[2].value, monNow)
    const costingForT4 = flowStore.getCosting(supplierOpts[0].value, monNow)
    if (costingForT4) {
      const lines = costingForT4.lines.filter((l: any) => !costingForT4.excluded[l.lineId]).slice(0, Math.min(6, costingForT4.lines.length))
      const items = lines.map((l: any) => {
        const sysAmt = Number(l.amountInclTax || 0)
        const extAmt = Number((sysAmt * 1.02).toFixed(2))
        return { productCode: l.productCode, systemAmount: Number(sysAmt.toFixed(2)), externalAmount: extAmt, finalAmount: extAmt, reason: '' }
      })
      flowStore.setReconcileSnapshot(supplierOpts[0].value, monNow, items)
      const recordsCount = Math.min(2, items.length)
      for (let i = 0; i < recordsCount; i++) {
        const it = items[i]
        const writeAmt = Number((it.finalAmount * 0.5).toFixed(2))
        const remainingAfter = Number((it.finalAmount - writeAmt).toFixed(2))
        flowStore.addWriteoffRecord(supplierOpts[0].value, monNow, { productCode: it.productCode, contractId: t4.contractIds[0] || '—', amount: writeAmt, remainingAfter, createdAt: new Date().toISOString() })
      }
    }
  } catch {}
}
</script>

<style scoped>
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; }
</style>
