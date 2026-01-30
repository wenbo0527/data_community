import { defineStore } from 'pinia'
import type { BillLine } from '../utils/costing'

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
  finalDiscount?: number
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
  discountAmount?: number
  remainingAfter: number
  createdAt: string
}

export interface WriteoffSnapshot {
  records: WriteoffRecord[]
  createdAt: string
}

function keyOf(supplierId: string, month: string) { return `${supplierId}-${month}` }

export const useSettlementFlowStore = defineStore('settlementFlow', {
  state: () => ({
    costingByKey: {} as Record<string, CostingSnapshot>,
    reconcileByKey: {} as Record<string, ReconcileSnapshot>,
    writeoffByKey: {} as Record<string, WriteoffSnapshot>,
    currentStepIndex: 0,
    costingCompletedByKey: {} as Record<string, boolean>,
    reconcileCompletedByKey: {} as Record<string, boolean>,
    writeoffCompletedByKey: {} as Record<string, boolean>
  }),
  getters: {
    currentStep(state) { return ['costing','reconcile','writeoff'][state.currentStepIndex] as 'costing'|'reconcile'|'writeoff' },
    getCosting: (state) => (supplierId: string, month: string) => state.costingByKey[keyOf(supplierId, month)],
    getReconcile: (state) => (supplierId: string, month: string) => state.reconcileByKey[keyOf(supplierId, month)],
    getWriteoff: (state) => (supplierId: string, month: string) => state.writeoffByKey[keyOf(supplierId, month)],
    isCostingCompleted: (state) => (supplierId: string, month: string) => Boolean(state.costingCompletedByKey[keyOf(supplierId, month)]),
    isReconcileCompleted: (state) => (supplierId: string, month: string) => Boolean(state.reconcileCompletedByKey[keyOf(supplierId, month)]),
    isWriteoffCompleted: (state) => (supplierId: string, month: string) => Boolean(state.writeoffCompletedByKey[keyOf(supplierId, month)]),
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
    },
    pendingDiscountByProduct: (state) => (supplierId: string, month: string) => {
      const k = keyOf(supplierId, month)
      const recon = state.reconcileByKey[k]
      if (!recon) return {}
      const writeoff = state.writeoffByKey[k]
      const byProduct: Record<string, number> = {}
      for (const it of recon.items) {
        byProduct[it.productCode] = (byProduct[it.productCode] || 0) + (it.finalDiscount || 0)
      }
      if (writeoff) {
        for (const r of writeoff.records) {
          byProduct[r.productCode] = Math.max(0, (byProduct[r.productCode] || 0) - (r.discountAmount || 0))
        }
      }
      return byProduct
    }
  },
  actions: {
    next() { if (this.currentStepIndex < 2) this.currentStepIndex++ },
    prev() { if (this.currentStepIndex > 0) this.currentStepIndex-- },
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
    },
    markCostingCompleted(supplierId: string, month: string, completed = true) {
      const k = keyOf(supplierId, month)
      this.costingCompletedByKey[k] = completed
    },
    markReconcileCompleted(supplierId: string, month: string, completed = true) {
      const k = keyOf(supplierId, month)
      this.reconcileCompletedByKey[k] = completed
    },
    markWriteoffCompleted(supplierId: string, month: string, completed = true) {
      const k = keyOf(supplierId, month)
      this.writeoffCompletedByKey[k] = completed
    }
  }
})
