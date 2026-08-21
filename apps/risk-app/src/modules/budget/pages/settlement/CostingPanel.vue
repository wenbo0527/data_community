<template>
  <div class="costing-panel">
    <a-form v-if="!embedded" :model="form" layout="inline" style="margin-bottom: 12px">
      <a-form-item field="supplierId" label="合作机构" required>
        <a-select v-model="form.supplierId" allow-clear placeholder="选择合作机构" style="width: 240px">
          <a-option v-for="s in supplierOptions" :key="s.value" :value="s.value">{{ s.label }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="month" label="账期" required>
        <a-input v-model="form.month" placeholder="YYYY-MM" style="width: 140px" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :disabled="!reconcileReady" @click="generateCosting">生成费用核算</a-button>
      </a-form-item>
    </a-form>

    <a-alert v-if="!reconcileReady" type="warning" style="margin-bottom: 12px" message="暂无外部对账数据，请先完成「外部对账」步骤" show-icon />

    <a-space direction="vertical" fill style="width: 100%">
      <a-card title="固定费用产品核算" :bordered="true">
        <a-space style="margin-bottom: 8px">
          <a-button type="primary" size="small" :disabled="fixedLines.length===0" @click="confirmBatch('fixed')">批量确认</a-button>
        </a-space>
        <a-table
          :data="fixedLines"
          :pagination="{ total: fixedLines.length, current: fixedPage, pageSize: fixedPageSize, showTotal: true, showPageSize: true, pageSizeOptions: [20,50,100] }"
          @page-change="(p:number)=>fixedPage=p"
          @page-size-change="(ps:number)=>{ fixedPageSize=ps; fixedPage=1 }"
          row-key="lineId"
          :row-class="rowClass"
          :loading="loading"
        >
          <template #columns>
            <a-table-column title="产品名称" :width="160"><template #cell="{ record }">{{ record.productName }}</template></a-table-column>
            <a-table-column title="付款账目类型" :width="150"><template #cell="{ record }">{{ record.paymentType || '—' }}</template></a-table-column>
            <a-table-column title="单价" :width="120"><template #cell="{ record }">{{ formatPrice(record.unitPrice) }}</template></a-table-column>
            <a-table-column title="外部单价" :width="120"><template #cell="{ record }">{{ formatPrice(record.externalUnitPrice) }}</template></a-table-column>
            <a-table-column title="外部对账调用量" :width="140"><template #cell="{ record }">{{ record.usageQty }}</template></a-table-column>
            <a-table-column title="最终减免量" :width="120"><template #cell="{ record }">{{ record.freeDeducted ?? 0 }}</template></a-table-column>
            <a-table-column title="计费用量" :width="120"><template #cell="{ record }">{{ record.chargeQty }}</template></a-table-column>
            <a-table-column title="对账最终费用" :width="160"><template #cell="{ record }">{{ formatAmount(record.amountInclTax) }}</template></a-table-column>
            <a-table-column title="系统费用(含税)" :width="160"><template #cell="{ record }">{{ formatAmount(record.systemAmount) }}</template></a-table-column>
            <a-table-column title="差异" :width="140"><template #cell="{ record }">{{ formatAmount(diffAmount(record)) }}</template></a-table-column>
            <a-table-column title="状态" :width="120"><template #cell="{ record }"><a-tag :status="statusTagFor(record.lineId)">{{ statusTextFor(record.lineId) }}</a-tag></template></a-table-column>
            <a-table-column title="操作" :width="200">
              <template #cell="{ record }">
                <a-space>
                  <a-checkbox v-model="excluded[record.lineId]">剔除</a-checkbox>
                  <a-button v-if="!confirmed[record.lineId]" size="small" type="text" :disabled="excluded[record.lineId]" @click="confirmOne(record.lineId)">确认</a-button>
                  <a-button v-else size="small" type="text" @click="cancelConfirm(record.lineId)">取消</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>

      <a-card title="阶梯定价产品核算" :bordered="true">
        <a-table
          :data="tieredLines"
          :pagination="{ total: tieredLines.length, current: tierPage, pageSize: tierPageSize, showTotal: true, showPageSize: true, pageSizeOptions: [20,50,100] }"
          @page-change="(p:number)=>tierPage=p"
          @page-size-change="(ps:number)=>{ tierPageSize=ps; tierPage=1 }"
          row-key="lineId"
          :row-class="rowClass"
          :loading="loading"
        >
          <template #columns>
            <a-table-column title="产品名称" :width="160"><template #cell="{ record }">{{ record.productName }}</template></a-table-column>
            <a-table-column title="付款账目类型" :width="150"><template #cell="{ record }">{{ record.paymentType || '—' }}</template></a-table-column>
            <a-table-column title="外部单价" :width="120"><template #cell="{ record }">{{ formatPrice(record.externalUnitPrice) }}</template></a-table-column>
            <a-table-column title="外部对账调用量" :width="140"><template #cell="{ record }">{{ record.usageQty }}</template></a-table-column>
            <a-table-column title="最终减免量" :width="120"><template #cell="{ record }">{{ record.freeDeducted ?? 0 }}</template></a-table-column>
            <a-table-column title="计费用量" :width="120"><template #cell="{ record }">{{ record.chargeQty }}</template></a-table-column>
            <a-table-column title="阶梯规则" :width="260"><template #cell="{ record }">{{ tierRuleText(record) }}</template></a-table-column>
            <a-table-column title="对账最终费用" :width="160"><template #cell="{ record }">{{ formatAmount(record.amountInclTax) }}</template></a-table-column>
            <a-table-column title="系统费用(含税)" :width="160"><template #cell="{ record }">{{ formatAmount(record.systemAmount) }}</template></a-table-column>
            <a-table-column title="差异" :width="140"><template #cell="{ record }">{{ formatAmount(diffAmount(record)) }}</template></a-table-column>
            <a-table-column title="状态" :width="120"><template #cell="{ record }"><a-tag :status="statusTagFor(record.lineId)">{{ statusTextFor(record.lineId) }}</a-tag></template></a-table-column>
            <a-table-column title="操作" :width="200">
              <template #cell="{ record }">
                <a-space>
                  <a-checkbox v-model="excluded[record.lineId]">剔除</a-checkbox>
                  <a-button v-if="!confirmed[record.lineId]" size="small" type="text" :disabled="excluded[record.lineId]" @click="confirmOne(record.lineId)">确认</a-button>
                  <a-button v-else size="small" type="text" @click="cancelConfirm(record.lineId)">取消</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>

      <a-card title="特殊计费产品核算" :bordered="true">
        <a-table :data="specialLines" :pagination="false" row-key="lineId" :row-class="rowClass" :loading="loading">
          <template #columns>
            <a-table-column title="产品名称" :width="160"><template #cell="{ record }">{{ record.productName }}</template></a-table-column>
            <a-table-column title="付款账目类型" :width="150"><template #cell="{ record }">{{ record.paymentType || '—' }}</template></a-table-column>
            <a-table-column title="外部单价" :width="120"><template #cell="{ record }">{{ formatPrice(record.externalUnitPrice) }}</template></a-table-column>
            <a-table-column title="对账最终费用" :width="160"><template #cell="{ record }">{{ formatAmount(record.amountInclTax) }}</template></a-table-column>
            <a-table-column title="状态" :width="120"><template #cell="{ record }"><a-tag :status="statusTagFor(record.lineId)">{{ statusTextFor(record.lineId) }}</a-tag></template></a-table-column>
            <a-table-column title="操作" :width="220">
              <template #cell="{ record }">
                <a-space>
                  <a-checkbox v-model="excluded[record.lineId]">剔除</a-checkbox>
                  <a-button v-if="!confirmed[record.lineId]" size="small" type="text" :disabled="excluded[record.lineId]" @click="confirmSpecial(record.lineId)">确认</a-button>
                  <a-button v-else size="small" type="text" @click="cancelConfirm(record.lineId)">取消</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>

      <div v-if="!embedded" style="text-align: right">
        <a-space>
          <a-button type="primary" :loading="saving" :disabled="!lines.length" @click="finishCosting">确认费用并进入核销</a-button>
          <a-button type="outline" :disabled="!lines.length" @click="saveOnly">保存</a-button>
        </a-space>
      </div>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useSettlementSupplier } from '../../composables/useSettlementSupplier'
import { useSettlementFlowStore } from '../../stores/settlementFlow'
import { getActivePricingMap } from '../../api/pricingArchive'
import { getSupplierProductsMock } from '../../../external-data/mock/supplierProducts'
import { log } from '@/utils/logger'

const flowStore = useSettlementFlowStore()
const { supplierOptions, loadSuppliers } = useSettlementSupplier()

const props = defineProps<{ supplierId?: string; month?: string; embedded?: boolean }>()
const embedded = computed(() => props.embedded === true)
const form = ref({ supplierId: props.supplierId || '', month: props.month || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}` })
const lines = ref<any[]>([])
const confirmed = ref<Record<string, boolean>>({})
const excluded = ref<Record<string, boolean>>({})
const pricingMap = ref<Record<string, any>>({})
const loading = ref(false)
const saving = ref(false)

// PRD R34: 费用核算依赖外部对账快照（必须先完成对账才能进入核算）
const reconcileSnapshot = computed(() => {
  const sid = form.value.supplierId
  const mon = form.value.month
  if (!sid || !mon) return null
  return flowStore.getReconcile(sid, mon)
})
const reconcileReady = computed(() => {
  const snap = reconcileSnapshot.value
  return Boolean(snap && Array.isArray(snap.items) && snap.items.length > 0)
})

// PRD: 取 line 的计费类型：优先价表，回落到 line 自带，无值则按"已匹配/未匹配"判定为 fixed
const lineBillingType = (l: any) => {
  const fromPricing = pricingMap.value[l.productCode]?.billingType
  if (fromPricing) return fromPricing
  const fromLine = (l as any)?.billingType
  if (fromLine) return fromLine
  // PRD: 未匹配或外部匹配产品的对账记录默认按 fixed / volume 计入"固定费用产品核算"，确保进入下一步不丢记录
  return 'fixed'
}
const fixedLines = computed(() => lines.value.filter((l: any) => { const t = lineBillingType(l); return t === 'fixed' || t === 'volume' }))
const tieredLines = computed(() => lines.value.filter((l: any) => lineBillingType(l) === 'tiered'))
const specialLines = computed(() => lines.value.filter((l: any) => lineBillingType(l) === 'special'))

const fixedPage = ref(1); const fixedPageSize = ref(20)
const tierPage = ref(1); const tierPageSize = ref(20)

const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const formatPrice = (n?: number) => { if (n === undefined || n === null) return '—'; return `¥${Number(n).toFixed(4)}` }
const tierRuleText = (record: any) => {
  const p = pricingMap.value[record.productCode]
  const tiers = p?.tiers || []
  if (!tiers.length) return '—'
  return tiers.map((t: any) => `${t.lower}-${t.upper ?? '∞'}: ${Number(t.price).toFixed(4)} 元/次`).join('；')
}
const diffAmount = (record: any) => {
  const sys = Number(record.systemAmount || 0)
  const ext = Number(record.amountInclTax || 0)
  return Number((ext - sys).toFixed(2))
}

const rowClass = (record: any) => excluded.value[record.lineId] ? 'excluded-row' : ''
const statusTagFor = (id: string) => excluded.value[id] ? 'warning' : (confirmed.value[id] ? 'success' : 'default')
const statusTextFor = (id: string) => excluded.value[id] ? '已剔除' : (confirmed.value[id] ? '已确认' : '待确认')

// 根据对账快照生成费用核算行：按"外数档案产品(code) + 付款账目类型"分组，保证手动匹配后的每条记录都进入核算
const generateCosting = async () => {
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择合作机构与账期'); return }
  if (!reconcileReady.value) { Message.error('暂无外部对账数据，请先完成对账'); return }
  loading.value = true
  try {
    pricingMap.value = await getActivePricingMap(form.value.supplierId)
    const supplierProducts = await getSupplierProductsMock(form.value.supplierId)
    const snap = reconcileSnapshot.value!
    const linesByKey = new Map<string, any>()
    for (const item of snap.items) {
      // 分组 key：优先使用手动匹配后的外数档案 code；否则用 productCode。付款账目类型单独成段保留。
      const groupedCode = String(item.matchedProductCode || item.productCode || '')
      const groupedName = String(item.matchedProductName || item.productName || groupedCode)
      const cm = String(item.callMethod || '').trim()
      const key = `${groupedCode}::${cm}`
      // 用"匹配后的产品名"反查该供应商下的真实 productCode（用于定价查询）
      const matchedSupplierCode = supplierProducts.find((sp: any) => sp.productName === groupedName)?.productCode
        || supplierProducts.find((sp: any) => sp.productName === item.productName)?.productCode
        || groupedCode
      const pricing = pricingMap.value[matchedSupplierCode] || pricingMap.value[groupedCode] || {}
      const finalPaid = Number(item.finalAmount || 0)
      const freeDeducted = Number(item.finalDiscount || 0)
      const unitPrice = Number(pricing?.unitPrice || (pricing as any)?.basePrice || 0)
      const chargeQty = unitPrice > 0 ? Number((finalPaid / unitPrice).toFixed(0)) : 0
      const systemAmount = Number((chargeQty * unitPrice).toFixed(2))
      const taxRate = pricing?.taxRate ?? 0.06
      const amountExclTax = taxRate > 0 ? Number((finalPaid / (1 + taxRate)).toFixed(2)) : finalPaid
      const taxAmount = Number((finalPaid - amountExclTax).toFixed(2))
      const lineId = `${form.value.supplierId}-${groupedCode}-${cm || 'unknown'}-${form.value.month}-costing`
      const existing = linesByKey.get(key)
      if (existing) {
        existing.paymentType = combinePaymentTypes(existing.paymentType, cm)
        if (Number(item.externalUnitPrice || 0) > 0) existing.externalUnitPrice = Number(item.externalUnitPrice)
        existing.usageQty += chargeQty
        existing.chargeQty += chargeQty
        existing.freeDeducted += freeDeducted
        existing.amountInclTax = Number((existing.amountInclTax + finalPaid).toFixed(2))
        existing.amountExclTax = taxRate > 0 ? Number((existing.amountInclTax / (1 + taxRate)).toFixed(2)) : existing.amountInclTax
        existing.taxAmount = Number((existing.amountInclTax - existing.amountExclTax).toFixed(2))
        existing.systemAmount = Number((existing.systemAmount + systemAmount).toFixed(2))
        existing.originalProductNames = Array.from(new Set([...(existing.originalProductNames || [existing.originalProductName || existing.productName]), item.originalProductName || item.productName]))
        continue
      }
      linesByKey.set(key, {
        lineId,
        supplierId: form.value.supplierId,
        productCode: matchedSupplierCode,
        externalProductCode: groupedCode,
        productName: groupedName,
        originalProductName: item.originalProductName || item.productName,
        originalProductNames: [item.originalProductName || item.productName],
        paymentType: combinePaymentTypes(cm),
        billingType: pricing?.billingType || 'fixed',
        unit: pricing?.unit,
        unitPrice,
        externalUnitPrice: Number(item.externalUnitPrice || 0),
        usageQty: chargeQty,
        chargeQty,
        freeQuota: 0,
        freeDeducted,
        amountExclTax,
        taxRate,
        taxAmount,
        amountInclTax: Number(finalPaid.toFixed(2)),
        systemAmount,
        currency: pricing?.currency || 'CNY',
        verifyStatus: 'pending' as any,
        source: 'reconcile.snapshot'
      } as any)
    }
    lines.value = Array.from(linesByKey.values())
    confirmed.value = {}
    excluded.value = {}
    Message.success(`已基于外部对账生成 ${lines.value.length} 条费用详情`)
    log('costing.generated', { supplierId: form.value.supplierId, month: form.value.month, count: lines.value.length })
  } finally {
    loading.value = false
  }
}

const combinePaymentTypes = (...values: unknown[]) => {
  const methods = new Set(values.flatMap(value => String(value || '').split('+').map(item => item.trim()).filter(item => item === '线上' || item === '线下')))
  if (methods.has('线上') && methods.has('线下')) return '线上 + 线下'
  return methods.values().next().value || '—'
}

const confirmOne = (lineId: string) => { confirmed.value[lineId] = true; Message.success('已确认') }
const cancelConfirm = (lineId: string) => { confirmed.value[lineId] = false }
const confirmBatch = (type: 'fixed' | 'tiered') => {
  const arr = type === 'fixed' ? fixedLines.value : tieredLines.value
  arr.forEach((l: any) => { if (!excluded.value[l.lineId]) confirmed.value[l.lineId] = true })
  Message.success('已批量确认')
}
const confirmSpecial = (lineId: string) => { confirmed.value[lineId] = true; Message.success('已确认') }

const saveSnapshot = () => {
  const billLines = lines.value.map(l => ({
    lineId: l.lineId, supplierId: l.supplierId, productCode: l.productCode, productName: l.productName,
    unit: l.unit, unitPrice: l.unitPrice, usageQty: l.usageQty, chargeQty: l.chargeQty,
    freeQuota: l.freeQuota ?? 0, freeDeducted: l.freeDeducted, paymentType: l.paymentType, externalUnitPrice: l.externalUnitPrice, amountExclTax: l.amountExclTax,
    taxRate: l.taxRate, taxAmount: l.taxAmount, amountInclTax: l.amountInclTax, systemAmount: l.systemAmount,
    currency: l.currency, verifyStatus: l.verifyStatus || 'pending', source: l.source
  })) as any
  flowStore.setCostingSnapshot(form.value.supplierId, form.value.month, billLines, { ...confirmed.value }, { ...excluded.value })
}

const saveOnly = (): boolean => {
  if (!lines.value.length) { Message.warning('暂无费用详情可保存'); return false }
  saveSnapshot()
  Message.success('费用详情已保存')
  return true
}

const finishCosting = async (): Promise<boolean> => {
  if (!lines.value.length) { Message.error('请先生成费用详情'); return false }
  const unresolved = lines.value.filter((l: any) => !excluded.value[l.lineId] && !confirmed.value[l.lineId])
  if (unresolved.length > 0) { Message.warning(`仍有 ${unresolved.length} 条未确认`); return false }
  saving.value = true
  try {
    saveSnapshot()
    flowStore.markCostingCompleted(form.value.supplierId, form.value.month, true)
    Message.success('费用核算已完成，进入确认核销')
    log('costing.finish', { supplierId: form.value.supplierId, month: form.value.month, count: lines.value.length })
    return true
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try { await loadSuppliers() } catch {}
  if (reconcileReady.value) {
    await generateCosting()
  }
})
watch(() => props.supplierId, (sid?: string) => { form.value.supplierId = sid || '' })
watch(() => props.month, (m?: string) => { form.value.month = m || form.value.month })
watch([() => form.value.supplierId, () => form.value.month], () => {
  if (reconcileReady.value && lines.value.length === 0) generateCosting()
})

defineExpose({
  save: saveOnly,
  complete: finishCosting
})
</script>

<style scoped>
.costing-panel { width: 100%; }
.excluded-row { opacity: 0.5; }
</style>