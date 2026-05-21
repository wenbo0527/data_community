<template>
  <div class="costing-panel">
    <a-form v-if="!embedded" :model="form" layout="inline" style="margin-bottom: 12px">
      <a-form-item field="supplierId" label="征信机构" required>
        <a-select v-model="form.supplierId" allow-clear placeholder="选择征信机构" style="width: 240px">
          <a-option v-for="s in supplierOptions" :key="s.value" :value="s.value">{{ s.label }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="channelId" label="对接渠道">
        <a-select v-model="form.channelId" allow-clear placeholder="选择对接渠道" style="width: 240px">
          <a-option v-for="s in supplierOptions" :key="s.value" :value="s.value">{{ s.label }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="month" label="账期" required>
        <a-input v-model="form.month" placeholder="YYYY-MM" style="width: 140px" />
      </a-form-item>
      <a-form-item field="taskName" label="核算任务名称">
        <a-input v-model="taskForm.taskName" placeholder="输入任务名称" style="width: 240px" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="loadBills">生成账单</a-button>
      </a-form-item>
    </a-form>

    <a-space direction="vertical" fill style="width: 100%">
      <div class="toolbar" style="margin-bottom: 12px; display: flex; justify-content: flex-end;">
        <a-space>
          <a-button type="outline" @click="supplementCostingMock">补充核算Mock</a-button>
        </a-space>
      </div>
      <a-card title="固定费用产品核算" :bordered="true">
        <a-space style="margin-bottom: 8px">
          <a-button type="primary" size="small" :disabled="fixedLines.length===0" @click="confirmBatch('fixed')">批量确认</a-button>
        </a-space>
        <a-table 
          :data="fixedPagedLines" 
          :pagination="{ total: fixedLines.length, current: fixedPage, pageSize: fixedPageSize, showTotal: true, showPageSize: true, pageSizeOptions: [20,50,100] }" 
          @page-change="(p:number)=>fixedPage=p" 
          @page-size-change="(ps:number)=>{ fixedPageSize=ps; fixedPage=1 }" 
          row-key="lineId"
          :row-class="fixedRowClass"
          :loading="billLoading"
        >
          <template #columns>
            <a-table-column title="产品名称" :width="160">
              <template #cell="{ record }">{{ record.productName }}</template>
            </a-table-column>
            <a-table-column title="单价" :width="120">
              <template #cell="{ record }">{{ formatPrice(record.unitPrice) }}</template>
            </a-table-column>
            <a-table-column title="调用量" :width="120">
              <template #cell="{ record }">{{ record.usageQty }}</template>
            </a-table-column>
            <a-table-column title="免费量" :width="120">
              <template #cell="{ record }">{{ record.freeValidStart && record.freeValidEnd ? (record.freeQuota ?? 0) : '—' }}</template>
            </a-table-column>
            <a-table-column title="减免量" :width="120">
              <template #cell="{ record }">{{ record.freeValidStart && record.freeValidEnd ? (record.freeDeducted ?? 0) : 0 }}</template>
            </a-table-column>
            <a-table-column title="计费用量" :width="120">
              <template #cell="{ record }">{{ record.chargeQty }}</template>
            </a-table-column>
            <a-table-column title="免费量有效期" :width="200">
              <template #cell="{ record }">{{ record.freeValidStart && record.freeValidEnd ? `${String(record.freeValidStart).slice(0,10)} ~ ${String(record.freeValidEnd).slice(0,10)}` : '—' }}</template>
            </a-table-column>
            <a-table-column title="系统费用(含税)" :width="160">
              <template #cell="{ record }">{{ formatAmount(record.amountInclTax) }}</template>
            </a-table-column>
            <a-table-column title="状态" :width="120">
              <template #cell="{ record }"><a-tag :status="statusTagFor(record.lineId)">{{ statusTextFor(record.lineId) }}</a-tag></template>
            </a-table-column>
            <a-table-column title="操作" :width="200">
              <template #cell="{ record }">
                <a-space>
                  <a-checkbox v-model="excluded[record.lineId]">剔除</a-checkbox>
                  <a-button v-if="excluded[record.lineId]" size="small" type="text" @click="excluded[record.lineId]=false">恢复</a-button>
                  <a-button v-if="!confirmed[record.lineId]" size="small" type="text" :disabled="excluded[record.lineId]" @click="confirmOne(record.lineId)">确认</a-button>
                  <a-button v-else size="small" type="text" @click="cancelConfirm(record.lineId)">取消</a-button>
                  <a-tag :status="confirmed[record.lineId] ? 'success' : 'default'">{{ confirmed[record.lineId] ? '已确认' : '待确认' }}</a-tag>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>

      <a-card title="阶梯定价产品核算" :bordered="true">
        <a-table 
          :data="tierPagedLines" 
          :pagination="{ total: tieredLines.length, current: tierPage, pageSize: tierPageSize, showTotal: true, showPageSize: true, pageSizeOptions: [20,50,100] }" 
          @page-change="(p:number)=>tierPage=p" 
          @page-size-change="(ps:number)=>{ tierPageSize=ps; tierPage=1 }" 
          row-key="lineId"
          :row-class="tierRowClass"
          :loading="billLoading"
        >
          <template #columns>
            <a-table-column title="产品名称" :width="160">
              <template #cell="{ record }">{{ record.productName }}</template>
            </a-table-column>
            <a-table-column title="调用量" :width="120">
              <template #cell="{ record }">{{ record.usageQty }}</template>
            </a-table-column>
            <a-table-column title="免费量" :width="120">
              <template #cell="{ record }">{{ record.freeValidStart && record.freeValidEnd ? (record.freeQuota ?? 0) : '—' }}</template>
            </a-table-column>
            <a-table-column title="减免量" :width="120">
              <template #cell="{ record }">{{ record.freeValidStart && record.freeValidEnd ? (record.freeDeducted ?? 0) : 0 }}</template>
            </a-table-column>
            <a-table-column title="计费用量" :width="120">
              <template #cell="{ record }">{{ record.chargeQty }}</template>
            </a-table-column>
            <a-table-column title="免费量有效期" :width="200">
              <template #cell="{ record }">{{ record.freeValidStart && record.freeValidEnd ? `${String(record.freeValidStart).slice(0,10)} ~ ${String(record.freeValidEnd).slice(0,10)}` : '—' }}</template>
            </a-table-column>
            <a-table-column title="阶梯规则" :width="260">
              <template #cell="{ record }">{{ tierRuleText(record) }}</template>
            </a-table-column>
            <a-table-column title="系统费用(含税)" :width="160">
              <template #cell="{ record }">{{ formatAmount(record.amountInclTax) }}</template>
            </a-table-column>
            <a-table-column title="状态" :width="120">
              <template #cell="{ record }"><a-tag :status="statusTagFor(record.lineId)">{{ statusTextFor(record.lineId) }}</a-tag></template>
            </a-table-column>
            <a-table-column title="操作" :width="200">
              <template #cell="{ record }">
                <a-space>
                  <a-checkbox v-model="excluded[record.lineId]">剔除</a-checkbox>
                  <a-button v-if="excluded[record.lineId]" size="small" type="text" @click="excluded[record.lineId]=false">恢复</a-button>
                  <a-button v-if="!confirmed[record.lineId]" size="small" type="text" :disabled="excluded[record.lineId]" @click="confirmOne(record.lineId)">确认</a-button>
                  <a-button v-else size="small" type="text" @click="cancelConfirm(record.lineId)">取消</a-button>
                  <a-tag :status="confirmed[record.lineId] ? 'success' : 'default'">{{ confirmed[record.lineId] ? '已确认' : '待确认' }}</a-tag>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>

      <a-card title="特殊计费产品核算" :bordered="true">
        <a-table :data="specialLines" :pagination="false" row-key="lineId" :row-class="specialRowClass" :loading="billLoading">
          <template #columns>
            <a-table-column title="产品名称" :width="160">
              <template #cell="{ record }">{{ record.productName }}</template>
            </a-table-column>
            <a-table-column title="调用量" :width="120">
              <template #cell="{ record }">{{ record.usageQty }}</template>
            </a-table-column>
            <a-table-column title="费用(手动填入)" :width="200">
              <template #cell="{ record }">
                <a-input-number v-model="manualAmount[record.lineId]" :min="0" :precision="2" :disabled="excluded[record.lineId]" />
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="120">
              <template #cell="{ record }"><a-tag :status="statusTagFor(record.lineId)">{{ statusTextFor(record.lineId) }}</a-tag></template>
            </a-table-column>
            <a-table-column title="操作" :width="220">
              <template #cell="{ record }">
                <a-space>
                  <a-checkbox v-model="excluded[record.lineId]">剔除</a-checkbox>
                  <a-button v-if="excluded[record.lineId]" size="small" type="text" @click="excluded[record.lineId]=false">恢复</a-button>
                  <a-button v-if="!confirmed[record.lineId]" size="small" type="text" :disabled="excluded[record.lineId]" @click="confirmSpecial(record.lineId)">确认</a-button>
                  <a-button v-else size="small" type="text" @click="cancelConfirm(record.lineId)">取消</a-button>
                  <a-tag :status="confirmed[record.lineId] ? 'success' : 'default'">{{ confirmed[record.lineId] ? '已确认' : '待确认' }}</a-tag>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>

      <div v-if="!embedded" style="text-align: right">
        <a-space>
          <a-button type="primary" :disabled="!form.supplierId || !form.month" @click="finishCosting">完成核算</a-button>
          <a-button type="outline" :disabled="!form.supplierId || !form.month" @click="saveTask">保存</a-button>
        </a-space>
      </div>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { useSettlementSupplier } from '../../composables/useSettlementSupplier'
import { generateBillLines } from '../../utils/costing'
import { getActivePricingMap } from '../../api/pricingArchive'
import { useSettlementFlowStore } from '../../stores/settlementFlow'
import { createSettlementTask } from '../../api/settlement'
import { log } from '@/utils/logger'

const router = useRouter()
const flowStore = useSettlementFlowStore()
const { supplierOptions, loadSuppliers } = useSettlementSupplier()

const props = defineProps<{ supplierId?: string; month?: string; embedded?: boolean; taskName?: string }>()
const embedded = computed(() => props.embedded === true)
const form = ref({ supplierId: props.supplierId || '', channelId: '', month: props.month || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}` })
const taskForm = ref<{ taskName?: string }>({ taskName: props.taskName || '' })
const lines = ref<any[]>([])
const confirmed = ref<Record<string, boolean>>({})
const excluded = ref<Record<string, boolean>>({})
const manualAmount = ref<Record<string, number>>({})
const pricingMap = ref<Record<string, any>>({})
const billLoading = ref(false)
const unresolved = computed(() => (lines.value as any[]).filter((l: any) => !excluded.value[l.lineId] && !confirmed.value[l.lineId]))
const unresolvedNames = computed(() => unresolved.value.map((l: any) => String(l.productName || l.productCode || l.lineId)))

const fixedLines = computed(() => (lines.value as any[]).filter((l: any) => pricingMap.value[l.productCode]?.billingType === 'fixed' || pricingMap.value[l.productCode]?.billingType === 'volume'))
const tieredLines = computed(() => (lines.value as any[]).filter((l: any) => pricingMap.value[l.productCode]?.billingType === 'tiered'))
const specialLines = computed(() => (lines.value as any[]).filter((l: any) => pricingMap.value[l.productCode]?.billingType === 'special'))

const fixedPage = ref(1)
const fixedPageSize = ref(20)
const fixedPagedLines = computed(() => {
  const start = (fixedPage.value - 1) * fixedPageSize.value
  return fixedLines.value.slice(start, start + fixedPageSize.value)
})
const tierPage = ref(1)
const tierPageSize = ref(20)
const tierPagedLines = computed(() => {
  const start = (tierPage.value - 1) * tierPageSize.value
  return tieredLines.value.slice(start, start + tierPageSize.value)
})

const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const formatPrice = (n?: number) => { if (n === undefined || n === null) return '—'; return `¥${Number(n).toFixed(4)}` }
const tierRuleText = (record: any) => {
  const p = pricingMap.value[record.productCode]
  const tiers = p?.tiers || []
  if (!tiers.length) return '—'
  return tiers.map((t: any) => `${t.lower}-${t.upper ?? '∞'}: ${Number(t.price).toFixed(4)} 元/次`).join('；')
}

const supplementCostingMock = async () => {
  const sid = form.value.supplierId || props.supplierId || ''
  const mon = form.value.month || props.month || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
  form.value.supplierId = sid
  form.value.month = mon
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择供应商与账期'); return }
  billLoading.value = true
  log('costing.mock.start', { supplierId: form.value.supplierId, month: form.value.month })
  const ls = await generateBillLines(form.value.supplierId, form.value.month)
  pricingMap.value = await getActivePricingMap(form.value.supplierId)
  let finalLines = ls
  if (!finalLines.length) {
    const keys = Object.keys(pricingMap.value)
    finalLines = keys.map((code, idx) => {
      const p = pricingMap.value[code]
      const qty = 10000 - idx * 500
      const amountExclTax = p.billingType === 'special' ? 0 : Number(((p.unitPrice || 0) * qty).toFixed(2))
      const taxAmount = p.billingType === 'special' ? 0 : Number((amountExclTax * p.taxRate).toFixed(2))
      return {
        lineId: `${form.value.supplierId}-${code}-${form.value.month}`,
        supplierId: form.value.supplierId,
        productCode: code,
        productName: code,
        unit: p.unit,
        unitPrice: Number((p.unitPrice ?? 0).toFixed(6)),
        usageQty: qty,
        chargeQty: qty,
        amountExclTax,
        taxRate: p.taxRate,
        taxAmount,
        amountInclTax: Number((amountExclTax + taxAmount).toFixed(2)),
        currency: p.currency,
        verifyStatus: 'pending',
        source: 'mock.synthetic'
      }
    })
  }
  flowStore.setCostingSnapshot(form.value.supplierId, form.value.month, finalLines, {}, {})
  lines.value = finalLines
  confirmed.value = {}
  excluded.value = {}
  manualAmount.value = {}
  log('costing.mock.done', { supplierId: form.value.supplierId, month: form.value.month, count: finalLines.length })
  Message.success('已补充核算Mock数据')
  billLoading.value = false
}

const loadBills = async () => {
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择供应商与账期'); return }
  billLoading.value = true
  lines.value = await generateBillLines(form.value.supplierId, form.value.month)
  pricingMap.value = await getActivePricingMap(form.value.supplierId)
  confirmed.value = {}
  excluded.value = {}
  manualAmount.value = {}
  log('costing.loadBills', { supplierId: form.value.supplierId, month: form.value.month, count: lines.value.length })
  Message.success('账单已生成')
  billLoading.value = false
}

const confirmOne = (lineId: string) => { confirmed.value[lineId] = true; Message.success('已确认') }
const cancelConfirm = (lineId: string) => { confirmed.value[lineId] = false; Message.success('已取消确认') }
const confirmBatch = (type: 'fixed' | 'tiered') => {
  const arr: any[] = type === 'fixed' ? fixedLines.value : tieredLines.value
  arr.forEach((l: any) => {
    if (!excluded.value[l.lineId]) confirmed.value[l.lineId] = true
  })
  Message.success('已批量确认')
}
const confirmSpecial = (lineId: string) => {
  const val = Number(manualAmount.value[lineId] || 0)
  const idx = lines.value.findIndex((l: any) => l.lineId === lineId)
  if (idx >= 0) {
    const next = { ...lines.value[idx] }
    next.amountExclTax = val
    next.taxAmount = Number((val * next.taxRate).toFixed(2))
    next.amountInclTax = Number((next.amountExclTax + next.taxAmount).toFixed(2))
    lines.value.splice(idx, 1, next)
    confirmed.value[lineId] = true
    Message.success('已确认')
  }
}

const buildSummary = () => {
  const actualAmount = lines.value.reduce((sum: number, l: any) => sum + (Number(l.amountInclTax) || 0), 0)
  const budgetAmount = actualAmount
  const diffAmount = actualAmount - budgetAmount
  const diffRate = budgetAmount > 0 ? diffAmount / budgetAmount : 0
  return { budgetAmount, actualAmount, diffAmount, diffRate }
}
const finishCosting = async (): Promise<boolean> => {
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择征信机构与账期'); return false }
  if (unresolved.value.length > 0) { Message.warning(`仍有${unresolved.value.length}条未确认：${unresolvedNames.value.slice(0, 5).join('、')}`); return false }
  flowStore.setCostingSnapshot(form.value.supplierId, form.value.month, lines.value, confirmed.value, excluded.value)
  const summary = buildSummary()
  log('costing.finish', { supplierId: form.value.supplierId, month: form.value.month, summary })
  try {
    await createSettlementTask({
      supplierIds: [form.value.supplierId],
      contractIds: [],
      granularity: 'month',
      timeLabel: form.value.month,
      createdBy: '管理员',
      summary,
      stage: 'reconcile',
      taskName: taskForm.value.taskName || `核算-${form.value.supplierId}-${form.value.month}`
    } as any)
  } catch (e) {
    Message.warning('保存任务到后端失败，已先行进入下一步')
  }
  flowStore.markCostingCompleted(form.value.supplierId, form.value.month, true)
  Message.success('已完成核算，任务状态为待对账')
  if (!embedded.value) router.push('/budget/settlement')
  return true
}
const saveTask = async () => {
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择供应商与账期'); return }
  flowStore.setCostingSnapshot(form.value.supplierId, form.value.month, lines.value, confirmed.value, excluded.value)
  const summary = buildSummary()
  log('costing.save', { supplierId: form.value.supplierId, month: form.value.month, summary })
  await createSettlementTask({
    supplierIds: [form.value.supplierId],
    contractIds: [],
    granularity: 'month',
    timeLabel: form.value.month,
    createdBy: '管理员',
    summary,
    stage: 'costing',
    taskName: taskForm.value.taskName || `核算-${form.value.supplierId}-${form.value.month}`
  } as any)
  Message.success('已保存任务，状态为待核算')
  if (!embedded.value) router.push('/budget/settlement')
}
onMounted(async () => {
  try { await loadSuppliers() } catch {}
  if (props.supplierId && props.month) { loadBills() }
})
watch(() => props.supplierId, (sid: string | undefined) => { form.value.supplierId = sid || ''; if (form.value.supplierId && form.value.month) loadBills() })
watch(() => props.month, (m: string | undefined) => { form.value.month = m || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`; if (form.value.supplierId && form.value.month) loadBills() })
watch([() => form.value.supplierId, () => form.value.month], ([sid, m]) => { if (!embedded.value && sid && m) loadBills() })

const fixedRowClass = (record: any) => isDeleted(record.lineId) ? 'deleted-row' : (excluded.value[record.lineId] ? 'excluded-row' : '')
const tierRowClass = (record: any) => isDeleted(record.lineId) ? 'deleted-row' : (excluded.value[record.lineId] ? 'excluded-row' : '')
const specialRowClass = (record: any) => isDeleted(record.lineId) ? 'deleted-row' : (excluded.value[record.lineId] ? 'excluded-row' : '')
const isDeleted = (id: string) => excluded.value[id] && confirmed.value[id]
const statusTagFor = (id: string) => isDeleted(id) ? 'danger' : (excluded.value[id] ? 'warning' : (confirmed.value[id] ? 'success' : 'default'))
const statusTextFor = (id: string) => isDeleted(id) ? '已删除' : (excluded.value[id] ? '已剔除' : (confirmed.value[id] ? '已确认' : '待确认'))

defineExpose({
  save: saveTask,
  complete: finishCosting
})
</script>

<style scoped>
.costing-panel { width: 100%; }
.excluded-row { opacity: 0.5; }
.deleted-row { opacity: 0.35; }
</style>
