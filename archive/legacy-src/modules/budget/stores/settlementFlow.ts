import { defineStore } from 'pinia'
import type { BillLine } from '@/modules/budget/utils/costing'

export interface CostingSnapshot {
  lines: BillLine[]
  confirmed: Record<string, boolean>
  excluded: Record<string, boolean>
  createdAt: string
}

export interface ReconcileItem {
  productCode: string
  systemAmount: number
  externalAmount: number
  finalAmount: number
  reason?: string
}

export interface ReconcileSnapshot {
  items: ReconcileItem[]
  createdAt: string
}

export interface WriteoffRecord {
  productCode: string
  contractId: string
  amount: number
  remainingAfter: number
  createdAt: string
}

export interface WriteoffSnapshot {
  records: WriteoffRecord[]
  createdAt: string
}

function keyOf(supplierId: string, month: string) {
  return `${supplierId}-${month}`
}

export const useSettlementFlowStore = defineStore('settlementFlow', {
  state: () => ({
    costingByKey: {} as Record<string, CostingSnapshot>,
    reconcileByKey: {} as Record<string, ReconcileSnapshot>,
    writeoffByKey: {} as Record<string, WriteoffSnapshot>
  }),
  getters: {
    getCosting: (state) => (supplierId: string, month: string) => {
      return state.costingByKey[keyOf(supplierId, month)]
    },
    getReconcile: (state) => (supplierId: string, month: string) => {
      return state.reconcileByKey[keyOf(supplierId, month)]
    },
    getWriteoff: (state) => (supplierId: string, month: string) => {
      return state.writeoffByKey[keyOf(supplierId, month)]
    },
    pendingAmountByProduct: (state) => (supplierId: string, month: string) => {
      const k = keyOf(supplierId, month)
      const recon = state.reconcileByKey[k]
      if (!recon) return {}
      const writeoff = state.writeoffByKey[k]
      const byProduct: Record<string, number> = {}
      for (const it of recon.items) {
        byProduct[it.productCode] = (byProduct[it.productCode] || 0) + (it.finalAmount || 0)
      }
      if (writeoff) {
        for (const r of writeoff.records) {
          byProduct[r.productCode] = Math.max(0, (byProduct[r.productCode] || 0) - r.amount)
        }
      }
      return byProduct
    }
  },
  actions: {
    setCostingSnapshot(supplierId: string, month: string, lines: BillLine[], confirmed: Record<string, boolean>, excluded: Record<string, boolean>) {
      const k = keyOf(supplierId, month)
      this.costingByKey[k] = { lines: [...lines], confirmed: { ...confirmed }, excluded: { ...excluded }, createdAt: new Date().toISOString() }
    },
    setReconcileSnapshot(supplierId: string, month: string, items: ReconcileItem[]) {
      const k = keyOf(supplierId, month)
      this.reconcileByKey[k] = { items: items.map(i => ({ ...i })), createdAt: new Date().toISOString() }
    },
    addWriteoffRecord(supplierId: string, month: string, record: WriteoffRecord) {
      const k = keyOf(supplierId, month)
      const snap = this.writeoffByKey[k] || { records: [], createdAt: new Date().toISOString() }
      snap.records.push({ ...record })
      this.writeoffByKey[k] = snap
    }
  }
})
