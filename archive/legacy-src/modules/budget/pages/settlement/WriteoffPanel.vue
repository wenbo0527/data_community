<template>
  <div class="writeoff-panel">
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
      <a-form-item>
        <a-button type="primary" @click="loadPending">加载待核销</a-button>
      </a-form-item>
    </a-form>
    <div class="toolbar">
      <a-space>
        <a-button type="outline" @click="supplementMockData">补充mock数据</a-button>
        <a-button type="outline" @click="supplementContractMock">补充合同Mock</a-button>
        <a-button type="outline" @click="loadPending">加载待核销</a-button>
      </a-space>
    </div>

    <a-table :data="productRows" :pagination="false" row-key="productCode">
      <template #columns>
        <a-table-column title="产品名称" :width="200">
          <template #cell="{ record }">{{ record.productName }}</template>
        </a-table-column>
        <a-table-column title="待核销总费用" :width="180">
          <template #cell="{ record }">{{ formatAmount(record.pendingAmount) }}</template>
        </a-table-column>
        <a-table-column title="选择合同与核销金额" :width="560">
          <template #cell="{ record }">
            <a-space>
              <a-space direction="vertical">
                <a-space v-for="(w, idx) in record.writeoffs" :key="idx">
                  <a-select v-model="w.contractId" placeholder="选择合同" style="width: 260px" @change="(val:string)=>onContractSelect(record, idx, val)">
                    <a-option v-for="c in availableContracts" :key="c.id" :value="c.id">{{ c.contractName }}（剩余：{{ formatAmount(contractRemaining(c)) }}）</a-option>
                  </a-select>
                  <a-button v-if="w.contractId" size="small" type="text" @click="goContractDetail(w.contractId)">合同：{{ selectedContractName(w.contractId) }} · 剩余：{{ formatAmount(selectedContractRemain(w.contractId)) }}</a-button>
                  <a-input-number v-model="w.amount" :min="0" :max="record.pendingAmount" :precision="2" :disabled="!w.contractId" />
                  <a-button size="small" type="primary" @click="confirmWriteoff(record, idx)">执行</a-button>
                  <a-button size="small" type="outline" @click="addWriteoffLineAt(record, idx)">＋</a-button>
                  <a-button size="small" type="outline" @click="deleteWriteoffLine(record, idx)">－</a-button>
                </a-space>
              </a-space>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="状态" :width="160">
          <template #cell="{ record }">
            <a-tag :status="record.pendingAmount <= 0 ? 'success' : 'warning'">{{ record.pendingAmount <= 0 ? '核销完成' : '待核销' }}</a-tag>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <div style="text-align: right; margin-top: 12px">
      <a-space>
        <a-button type="primary" :disabled="productRows.every(r => r.pendingAmount > 0)" @click="finishTask">完成核销并生成报告</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { useContractStore } from '@/modules/budget/stores/contract'
import { useSettlementSupplier } from '@/modules/budget/composables/useSettlementSupplier'
import { useSettlementFlowStore } from '@/modules/budget/stores/settlementFlow'
import { generateBillLines } from '@/modules/budget/utils/costing'
import { getSupplierProductsMock } from '@/modules/external-data/mock/supplierProducts'

const store = useContractStore()
const flowStore = useSettlementFlowStore()
const router = useRouter()
const { supplierOptions, getSupplierName, loadSuppliers } = useSettlementSupplier()

const props = defineProps<{ supplierId?: string; month?: string; embedded?: boolean }>()
const embedded = computed(() => props.embedded === true)
const form = ref({ supplierId: props.supplierId || '', channelId: '', month: props.month || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}` })
const productRows = ref<any[]>([])
const supplierProducts = ref<any[]>([])

const availableContracts = computed(() => {
  const name = getSupplierName(form.value.supplierId)
  return store.list.filter((c: any) => c.status === 'active' && (c.supplier === name || c.supplier === form.value.supplierId))
})

const contractRemaining = (c: any) => {
  const total = Number(c.amount) || 0
  const off = Number(c.writtenOffAmount) || 0
  return Math.max(0, total - off)
}
const selectedContractRemain = (id: string) => {
  const c = store.list.find((i: any) => i.id === id)
  return c ? contractRemaining(c) : 0
}
const selectedContractName = (id: string) => {
  const c = store.list.find((i: any) => i.id === id)
  return c ? c.contractName : '—'
}
const onContractSelect = (row: any, index: number, contractId: string) => {
  const remain = selectedContractRemain(contractId)
  const auto = Math.min(row.pendingAmount || 0, remain || 0)
  row.writeoffs[index].contractId = contractId
  row.writeoffs[index].amount = Number(auto.toFixed(2))
}
const goContractDetail = (id: string) => {
  if (!id) return
  router.push(`/risk/budget/contracts/${encodeURIComponent(id)}`)
}
const addWriteoffLineAt = (row: any, index: number) => {
  const insertIndex = Math.min((index ?? 0) + 1, row.writeoffs.length)
  row.writeoffs.splice(insertIndex, 0, { contractId: '', amount: 0 })
}
const deleteWriteoffLine = (row: any, index: number) => {
  if (!Array.isArray(row.writeoffs)) row.writeoffs = []
  if (row.writeoffs.length <= 1) {
    row.writeoffs[0] = { contractId: '', amount: 0 }
    return
  }
  row.writeoffs.splice(index, 1)
}

const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }

const loadPending = () => {
  if (!form.value.supplierId || !form.value.month) { Message.error('请选择供应商与账期'); return }
  const byProduct = flowStore.pendingAmountByProduct(form.value.supplierId, form.value.month)
  productRows.value = Object.keys(byProduct).map(code => {
    const name = supplierProducts.value.find((p: any) => p.productCode === code)?.productName || code
    return { productCode: code, productName: name, pendingAmount: Number(byProduct[code].toFixed(2)), writeoffs: [{ contractId: '', amount: 0 }] }
  })
  if (!productRows.value.length) Message.info('当前无待核销产品')
}
const addWriteoffLine = (row: any) => {
  row.writeoffs.push({ contractId: '', amount: 0 })
}
const supplementMockData = async () => {
  const sid = form.value.supplierId || ''
  const mon = form.value.month || ''
  if (!sid || !mon) { Message.error('请选择供应商与账期'); return }
  let costing = flowStore.getCosting(sid, mon)
  if (!costing) {
    const lines = await generateBillLines(sid, mon)
    flowStore.setCostingSnapshot(sid, mon, lines, {}, {})
    costing = flowStore.getCosting(sid, mon)
  }
  if (!costing) { Message.error('生成核算快照失败'); return }
  const lines = costing.lines.filter((l: any) => !costing.excluded[l.lineId])
  const pick = lines.slice(0, Math.min(6, lines.length))
  const items = pick.map((l: any) => {
    const sysAmt = Number(l.amountInclTax || 0)
    const extAmt = Number((sysAmt * 1.02).toFixed(2))
    return { productCode: l.productCode, systemAmount: Number(sysAmt.toFixed(2)), externalAmount: extAmt, finalAmount: extAmt, reason: '' }
  })
  flowStore.setReconcileSnapshot(sid, mon, items)
  const c = availableContracts.value[0]
  if (c && items.length) {
    const it = items[0]
    const amt = Number((it.finalAmount * 0.3).toFixed(2))
    const remainAfter = Number((it.finalAmount - amt).toFixed(2))
    flowStore.addWriteoffRecord(sid, mon, { productCode: it.productCode, contractId: c.id, amount: amt, remainingAfter: remainAfter, createdAt: new Date().toISOString() })
  }
  Message.success('已补充mock数据')
  loadPending()
}
const supplementContractMock = async () => {
  const sid = form.value.supplierId || ''
  const mon = form.value.month || ''
  if (!sid || !mon) { Message.error('请选择供应商与账期'); return }
  const supplierName = getSupplierName(sid) || sid
  const now = Date.now()
  const makeDate = (offsetDays: number) => new Date(now + offsetDays * 86400000).toISOString()
  await store.createContract({
    contractNo: `HT-${Math.floor(now % 100000)}`,
    contractName: `${supplierName} 核销演示框架合同`,
    supplier: supplierName,
    amount: 500000,
    startDate: makeDate(0),
    endDate: makeDate(60),
    status: 'active',
    writtenOffAmount: 100000
  } as any)
  await store.createContract({
    contractNo: `HT-${Math.floor((now+1) % 100000)}`,
    contractName: `${supplierName} 核销演示补充协议`,
    supplier: supplierName,
    amount: 200000,
    startDate: makeDate(0),
    endDate: makeDate(90),
    status: 'active',
    writtenOffAmount: 20000
  } as any)
  Message.success('已补充合同Mock数据')
}

const confirmWriteoff = (row: any, idx: number) => {
  const entry = row.writeoffs[idx]
  if (!entry || !entry.contractId) { Message.error('请选择合同'); return }
  const amt = Number(entry.amount || 0)
  if (amt <= 0) { Message.error('请输入核销金额'); return }
  const c = store.list.find((i: any) => i.id === entry.contractId)
  if (!c) { Message.error('合同不存在'); return }
  const remain = contractRemaining(c)
  if (amt > remain) { Message.error('超过合同剩余可核销费用'); return }
  if (amt > row.pendingAmount) { Message.error('超过当前产品待核销总费用'); return }
  const next = { ...c, writtenOffAmount: Number(c.writtenOffAmount || 0) + amt }
  const contractIndex = store.list.findIndex((i: any) => i.id === c.id)
  if (contractIndex >= 0) store.list.splice(contractIndex, 1, next)
  row.pendingAmount = Number((row.pendingAmount - amt).toFixed(2))
  flowStore.addWriteoffRecord(form.value.supplierId, form.value.month, { productCode: row.productCode, contractId: c.id, amount: amt, remainingAfter: contractRemaining(next), createdAt: new Date().toISOString() })
  Message.success('核销已执行')
}

const finishTask = () => {
  const allDone = productRows.value.every(r => r.pendingAmount <= 0)
  if (!allDone) { Message.error('仍有待核销费用未完成'); return }
  Message.success('全部产品核销完成，可在任务详情生成报告')
}
onMounted(async () => {
  try {
    await loadSuppliers()
  } catch {}
  supplierProducts.value = await getSupplierProductsMock(form.value.supplierId || props.supplierId || '')
  if (props.supplierId && props.month) {
    loadPending()
  }
})
watch(() => props.supplierId, (sid?: string) => { form.value.supplierId = sid || '' })
watch(() => props.month, (m?: string) => { form.value.month = m || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}` })
</script>

<style scoped>
.writeoff-panel { width: 100%; }
.toolbar { margin-bottom: 12px; display: flex; justify-content: flex-end; }
</style>
