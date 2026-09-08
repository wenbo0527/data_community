<template>
  <div class="reconcile-panel">
    <a-form v-if="!embedded" :model="form" layout="inline" style="margin-bottom: 12px">
      <a-form-item field="supplierId" label="供应商" required>
        <a-select v-model="form.supplierId" allow-clear placeholder="选择供应商" style="width: 240px">
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
    </a-form>

    <div v-if="!hasCosting" style="margin-bottom: 12px">
      <a-alert type="warning" show-icon>
        <template #title>未找到费用核算快照</template>
        <template #content>
          请先在费用核算阶段生成快照后再进行对账。
          <a-button size="small" type="outline" style="margin-left: 8px" @click="goToCosting">去费用核算</a-button>
        </template>
      </a-alert>
    </div>

    <div class="toolbar">
      <a-space>
        <a-upload :auto-upload="false" :show-file-list="false" accept=".csv" @change="onFileChange">
          <a-button type="primary">上传外部对账单(CSV)</a-button>
        </a-upload>
        <a-button type="outline" @click="mockUpload">模拟上传数据</a-button>
        <a-button type="outline" @click="mappingVisible = true">匹配映射记录</a-button>
      </a-space>
    </div>

    <a-modal v-model:visible="mappingVisible" title="外数匹配映射记录" :width="860" ok-text="保存" cancel-text="关闭" @ok="saveMapping">
      <a-space style="margin-bottom: 8px">
        <a-upload :auto-upload="false" :show-file-list="false" accept=".csv" @change="onMappingUpload">
          <a-button type="primary">上传新增</a-button>
        </a-upload>
        <a-button type="outline" @click="addMappingRow">新增一行</a-button>
      </a-space>
      <a-table :data="mappingList" :pagination="false" row-key="__id">
        <template #columns>
          <a-table-column title="外数产品名称" :width="240">
            <template #cell="{ record }">
              <a-select v-model="record.externalProductCode" :options="externalOptions" placeholder="选择外数产品" style="width: 220px" @change="(v:string)=>onExternalSelect(record, v)" />
            </template>
          </a-table-column>
          <a-table-column title="别名1" :width="160">
            <template #cell="{ record }">
              <a-input v-model="record.aliases[0]" placeholder="别名1" />
            </template>
          </a-table-column>
          <a-table-column title="别名2" :width="160">
            <template #cell="{ record }">
              <a-input v-model="record.aliases[1]" placeholder="别名2" />
            </template>
          </a-table-column>
          <a-table-column title="别名3" :width="160">
            <template #cell="{ record }">
              <a-input v-model="record.aliases[2]" placeholder="别名3" />
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>

    

    <a-table :data="rows" :pagination="false" row-key="productCode">
      <template #columns>
        <a-table-column title="外数产品名称" :width="220">
          <template #cell="{ record }">{{ record.productName }}</template>
        </a-table-column>
        <a-table-column title="匹配状态" :width="120">
          <template #cell="{ record }">
            <a-tag :status="record.matched ? 'success' : 'warning'">{{ record.matched ? '已匹配' : '未匹配' }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="匹配外数产品" :width="240">
          <template #cell="{ record }">
            <a-select v-model="record.productCode" :options="productOptions" placeholder="选择外数产品" style="width: 220px" @change="(v:any)=>onProductSelect(record, v)" />
          </template>
        </a-table-column>
        <a-table-column title="计费方式" :width="120">
          <template #cell="{ record }">{{ record.billingTypeLabel }}</template>
        </a-table-column>
        <a-table-column title="调用量(内部/外部)" :width="200">
          <template #cell="{ record }">{{ record.systemUsage }} / {{ record.externalUsage }}</template>
        </a-table-column>
        <a-table-column title="单价(内部/外部)" :width="200">
          <template #cell="{ record }">{{ formatPrice(record.systemUnitPrice) }} / {{ formatPrice(record.externalUnitPrice) }}</template>
        </a-table-column>
        <a-table-column title="总费用(内部/外部)" :width="220">
          <template #cell="{ record }">{{ formatAmount(record.systemAmount) }} / {{ formatAmount(record.externalAmount) }}</template>
        </a-table-column>
        <a-table-column title="减免量(内部/外部)" :width="180">
          <template #cell="{ record }">{{ (record.systemDiscount ?? 0) }} / {{ (record.externalDiscount ?? 0) }}</template>
        </a-table-column>
        
        <a-table-column title="最终费用(可编辑)" :width="200">
          <template #cell="{ record }">
            <a-input-number v-model="record.finalAmount" :min="0" :precision="2" style="width: 180px" />
          </template>
        </a-table-column>
      </template>
    </a-table>

    <div style="text-align: right; margin-top: 12px">
      <a-space>
        <a-button type="outline" :disabled="!rows.length" @click="saveOnly">保存对账</a-button>
        <a-button type="primary" :disabled="!rows.length" @click="enterWriteoff">进入核销</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { useSettlementSupplier } from '@/modules/budget/composables/useSettlementSupplier'
import { useSettlementFlowStore } from '@/modules/budget/stores/settlementFlow'
import { getActivePricingMap } from '@/modules/budget/api/pricingArchive'
import { getSupplierProductsMock } from '@/modules/external-data/mock/supplierProducts'

const router = useRouter()
const flowStore = useSettlementFlowStore()
const { supplierOptions, loadSuppliers } = useSettlementSupplier()

const props = defineProps<{ supplierId?: string; month?: string; embedded?: boolean }>()
const embedded = computed(() => props.embedded === true)
const form = ref({ supplierId: props.supplierId || '', channelId: '', month: props.month || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}` })
const externalRows = ref<any[]>([])
const rows = ref<any[]>([])
const pricingMap = ref<Record<string, any>>({})
const supplierProducts = ref<any[]>([])
const productOptions = computed(() => supplierProducts.value.map((p: any) => ({ label: p.productName, value: p.productCode })))
const mappingVisible = ref(false)
const mappingList = ref<any[]>([])
const externalOptions = computed(() => supplierProducts.value.map((p: any) => ({ label: p.productName, value: p.productCode })))
const nameToCode = computed(() => {
  const m: Record<string, string> = {}
  for (const rec of mappingList.value) {
    const extName = supplierProducts.value.find((p: any) => p.productCode === rec.externalProductCode)?.productName || rec.externalProductName || ''
    if (extName && rec.externalProductCode) m[extName] = rec.externalProductCode
    const aliases: string[] = rec.aliases || []
    for (const a of aliases) {
      if (a && rec.externalProductCode) m[a] = rec.externalProductCode
    }
  }
  return m
})
function addMappingRow() {
  mappingList.value.push({ __id: `M-${Date.now()}-${Math.random()}`, externalProductCode: '', externalProductName: '', aliases: ['', '', ''] })
}
function onExternalSelect(record: any, v: string) {
  record.externalProductCode = v
  const p = supplierProducts.value.find((sp: any) => sp.productCode === v)
  record.externalProductName = p?.productName || ''
}
function onMappingUpload(files: any) {
  try {
    const file = files?.[0] || files?.file
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const recs = csvToJson(text)
      recs.forEach((r: any) => {
        mappingList.value.push({
          __id: `M-${Date.now()}-${Math.random()}`,
          externalProductCode: String(r.externalProductCode || ''),
          externalProductName: String(r.externalProductName || ''),
          aliases: [String(r.alias1 || ''), String(r.alias2 || ''), String(r.alias3 || '')]
        })
      })
      Message.success('映射记录已导入')
    }
    reader.readAsText(file as File)
  } catch {
    Message.error('导入映射记录失败')
  }
}
function saveMapping() {
  mappingVisible.value = false
  Message.success('映射记录已保存')
}
const hasCosting = computed(() => {
  if (!form.value.supplierId || !form.value.month) return false
  return Boolean(flowStore.getCosting(form.value.supplierId, form.value.month))
})
const goToCosting = () => {
  const sid = form.value.supplierId || ''
  const mon = form.value.month || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
  router.push(`/risk/budget/accounting?stage=costing&supplierId=${encodeURIComponent(sid)}&month=${encodeURIComponent(mon)}`)
}

const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const formatPrice = (n?: number) => { if (n === undefined || n === null) return '—'; return `¥${Number(n).toFixed(4)}` }
const unitLabel = (unit?: string) => unit === 'record' ? '查得' : '查询'

function normalizeHeader(h: string): string {
  const map: Record<string, string> = {
    '账单周期': 'period',
    '产品名称': 'productName',
    '朴道产品代码': 'productCode',
    '计费方式': 'billingType',
    '最终计费次数': 'finalCount',
    '减免次数': 'discountCount',
    '最终付费次数': 'finalPaidCount',
    '单价': 'unitPrice',
    '金额': 'amount'
  }
  return map[h] || h
}
function csvToJson(text: string): any[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headerLine = lines[0] || ''
  const header = headerLine.split(',').map(h => normalizeHeader(h.trim()))
  const records: any[] = []
  for (let i = 1; i < lines.length; i++) {
    const rowLine = lines[i] || ''
    const cells = rowLine.split(',').map(c => c.trim())
    const obj: any = {}
    header.forEach((h, idx) => { obj[h] = cells[idx] ?? '' })
    records.push(obj)
  }
  return records
}

const onFileChange = async (files: any) => {
  try {
    const file = files?.[0] || files?.file
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const text = String(reader.result || '')
      externalRows.value = csvToJson(text)
      Message.success('对账单解析成功')
      await buildRows()
    }
    reader.readAsText(file as File)
  } catch (e) {
    Message.error('解析对账单失败')
  }
}

const buildRows = async () => {
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择供应商与账期'); return }
  const costing = flowStore.getCosting(form.value.supplierId, form.value.month)
  if (!costing) { Message.error('未找到费用核算快照'); return }
  pricingMap.value = await getActivePricingMap(form.value.supplierId)
  supplierProducts.value = await getSupplierProductsMock(form.value.supplierId)
  const sysByProduct: Record<string, { usage: number; unitPrice: number; amount: number }> = {}
  for (const l of costing.lines) {
    if (costing.excluded[l.lineId]) continue
    const key = l.productCode
    const prev = sysByProduct[key] || { usage: 0, unitPrice: l.unitPrice, amount: 0 }
    prev.usage += Number(l.usageQty) || 0
    prev.amount += Number(l.amountInclTax) || 0
    prev.unitPrice = l.unitPrice
    sysByProduct[key] = prev
  }
  rows.value = externalRows.value.map((e: any) => {
    let code = String(e.productCode || e.product || e.code || '')
    const name = String(e.productName || '')
    if (!pricingMap.value[code]) {
      const mapped = nameToCode.value[name]
      if (mapped) code = mapped
    }
    const sys = sysByProduct[code] || { usage: 0, unitPrice: 0, amount: 0 }
    const unit = pricingMap.value[code]?.unit
    const billingTypeLabel = unitLabel(unit)
    const extUsage = Number(e.finalPaidCount || e.finalCount || e.usageQty || e.usage || 0)
    const extUnit = Number(e.unitPrice || 0)
    const extAmount = Number(e.amount || e.amountInclTax || 0)
    const costingLine = (flowStore.getCosting(form.value.supplierId, form.value.month)?.lines || []).find((l: any) => l.productCode === code)
    const sysDiscount = costingLine ? Number(costingLine.freeDeducted || 0) : 0
    const extDiscount = Number(e.discountCount || e.discount || 0)
    return {
      productCode: code,
      productName: name || (supplierProducts.value.find((p: any) => p.productCode === code)?.productName || code),
      matched: Boolean(pricingMap.value[code]),
      billingTypeLabel,
      systemUsage: sys.usage,
      systemUnitPrice: sys.unitPrice,
      systemAmount: Number(sys.amount.toFixed(2)),
      systemDiscount: sysDiscount,
      externalDiscount: extDiscount,
      externalUsage: extUsage,
      externalUnitPrice: extUnit,
      externalAmount: Number(extAmount.toFixed(2)),
      finalAmount: Number(extAmount.toFixed(2))
    }
  })
  const firstPeriod = String(externalRows.value?.[0]?.period || '')
  if (firstPeriod && firstPeriod !== form.value.month) {
    Message.warning(`对账单账期(${firstPeriod})与当前账期(${form.value.month})不一致`)
  }
}


const saveSnapshotInternal = () => {
  const items = rows.value.map((r: any) => ({
    productCode: r.productCode,
    systemAmount: r.systemAmount,
    externalAmount: r.externalAmount,
    finalAmount: r.finalAmount,
    reason: r.reason
  }))
  flowStore.setReconcileSnapshot(form.value.supplierId, form.value.month, items)
}
const saveOnly = () => {
  saveSnapshotInternal()
  Message.success('对账结果已保存')
}
const enterWriteoff = () => {
  saveSnapshotInternal()
  Message.success('已保存并进入核销')
  if (!embedded.value) router.push('/risk/budget/settlement?stage=writeoff')
}
const mockUpload = async () => {
  const sidLocal = form.value.supplierId || props.supplierId || ''
  const monLocal = form.value.month || props.month || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
  form.value.supplierId = sidLocal
  form.value.month = monLocal
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择供应商与账期'); return }
  const costing = flowStore.getCosting(form.value.supplierId, form.value.month)
  if (!costing) { Message.error('未找到费用核算快照'); return }
  pricingMap.value = await getActivePricingMap(form.value.supplierId)
  const header = ['账单周期','产品名称','朴道产品代码','计费方式','最终计费次数','减免次数','最终付费次数','单价','金额']
  const lines = costing.lines.filter((l: any) => !costing.excluded[l.lineId])
  const csvRows: string[] = [header.join(',')]
  const includeCount = Math.max(1, Math.floor(lines.length * 0.7))
  for (let i = 0; i < includeCount; i++) {
    const l = lines[i]
    const btype = pricingMap.value[l.productCode]?.billingType
    const billingLabel = btype === 'fixed' ? '固定' : btype === 'tiered' ? '阶梯' : btype === 'special' ? '特殊' : '按量'
    const finalCount = Math.max(0, Math.floor(Number(l.usageQty) || 0))
    const discount = Math.floor(finalCount * 0.05)
    const finalPaid = Math.max(0, finalCount - discount)
    const unit = Number(l.unitPrice || 0)
    const amount = Number((unit * finalPaid).toFixed(2))
    csvRows.push([
      form.value.month,
      l.productName,
      l.productCode,
      billingLabel,
      String(finalCount),
      String(discount),
      String(finalPaid),
      unit.toFixed(4),
      amount.toFixed(2)
    ].join(','))
  }
  const unknowns = [
    { productName: '未知产品A', productCode: 'EXT_UNKNOWN_A', unitPrice: 0.055, paid: 1200 },
    { productName: '未知产品B', productCode: 'EXT_UNKNOWN_B', unitPrice: 0.045, paid: 800 }
  ]
  for (const u of unknowns) {
    const amount = Number((u.unitPrice * u.paid).toFixed(2))
    csvRows.push([
      form.value.month,
      u.productName,
      u.productCode,
      '查询',
      String(u.paid),
      '0',
      String(u.paid),
      u.unitPrice.toFixed(4),
      amount.toFixed(2)
    ].join(','))
  }
  const text = csvRows.join('\n')
  externalRows.value = csvToJson(text)
  await buildRows()
  Message.success('已生成并载入模拟对账单')
}
function onProductSelect(record: any, v: string) {
  record.productCode = v
  const p = supplierProducts.value.find((sp: any) => sp.productCode === v)
  record.productName = p?.productName || v
  const unit = pricingMap.value[v]?.unit
  record.billingTypeLabel = unitLabel(unit)
  const costing = flowStore.getCosting(form.value.supplierId, form.value.month)
  if (costing) {
    const sysLine = costing.lines.find((l: any) => l.productCode === v && !costing.excluded[l.lineId])
    if (sysLine) {
      record.systemUsage = Number(sysLine.usageQty) || 0
      record.systemUnitPrice = Number(sysLine.unitPrice) || 0
      const amount = Number(sysLine.amountInclTax) || 0
      record.systemAmount = Number(amount.toFixed(2))
      record.matched = true
    } else {
      record.systemUsage = 0
      record.systemUnitPrice = 0
      record.systemAmount = 0
      record.matched = Boolean(pricingMap.value[v])
    }
  }
}
onMounted(async () => {
  try {
    await loadSuppliers()
  } catch {}
  if (props.supplierId && props.month) {
    await buildRows()
  }
})
watch(() => props.supplierId, async (sid?: string) => { 
  form.value.supplierId = sid || '' 
  if (form.value.supplierId && form.value.month) await buildRows()
})
watch(() => props.month, async (m?: string) => { 
  form.value.month = m || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}` 
  if (form.value.supplierId && form.value.month) await buildRows()
})
</script>

<style scoped>
.reconcile-panel { width: 100%; }
.toolbar { margin-bottom: 12px; display: flex; justify-content: flex-end; }
</style>
