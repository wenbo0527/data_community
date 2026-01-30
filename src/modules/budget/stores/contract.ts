import { defineStore } from 'pinia'
import type { ErrorType } from '@/types/api'
import { getContracts, createContract as apiCreateContract, deleteContract as apiDeleteContract } from '@/modules/budget/api/contract'

export interface ContractItem {
  id: string
  contractNo: string
  contractName: string
  supplier: string
  amount: number
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'pending'
  dataCount?: number
  productCount?: number
  writtenOffAmount?: number
  contractType?: 'framework' | 'supplement'
  frameworkId?: string | null
}

export interface ContractListParams {
  page?: number
  pageSize?: number
  supplier?: string
  status?: string
}

function daysBetween(dateStr: string) {
  try { const now = new Date(); const target = new Date(dateStr); return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) } catch { return NaN }
}

export const useContractStore = defineStore('contract', {
  state: () => ({
    list: [] as ContractItem[],
    total: 0,
    loading: false,
    error: null as ErrorType | null,
    pricingMap: {} as Record<string, { billingMode?: string; billingType?: 'fixed' | 'tiered' | 'special'; basePrice?: number; tiers?: Array<{ lower: number; upper: number; price: number }>; remark?: string; freeQuotaValue?: number; freeQuotaStart?: string; freeQuotaEnd?: string }>
  }),

  getters: {
    stats: (state) => {
      const count = state.list.length
      const totalAmount = state.list.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
      const expiringCount = state.list.filter(i => daysBetween(i.endDate) <= 30 && daysBetween(i.endDate) >= 0).length
      const supplierSet = new Set(state.list.map(i => i.supplier))
      const supplierCount = supplierSet.size
      return { count, totalAmount, expiringCount, supplierCount }
    },
    bySupplier: (state) => {
      const map: Record<string, ContractItem[]> = {}
      state.list.forEach((item) => {
        const key = item.supplier || '—'
        const bucket = map[key] ?? (map[key] = [])
        bucket.push(item)
      })
      return map
    }
    ,frameworkOptions: (state) => {
      return state.list.filter(i => i.contractType === 'framework').map(i => ({ label: `${i.contractName}（${i.contractNo}）`, value: i.id, supplier: i.supplier }))
    }
    ,getPricing: (state) => {
      return (productId: string) => state.pricingMap[productId]
    }
  },

  actions: {
    async fetchContractList(params: ContractListParams = {}) {
      this.loading = true
      try {
        const res = await getContracts({ supplier: params.supplier, status: params.status })
        const list = res.list.map((i) => {
          const numId = Number(String(i.id || '').replace(/\D/g, '')) || 1
          const defaultDataCount = i.dataCount ?? (numId * 1000 + 500)
          const defaultProductCount = i.productCount ?? (numId % 5) + 1
          const ratios = [0.3, 0.5, 0.7]
          const defaultWrittenOff = i.writtenOffAmount ?? Math.round((i.amount || 0) * ratios[numId % ratios.length])
          const defaultType: 'framework' | 'supplement' = numId % 2 === 0 ? 'framework' : 'supplement'
          // 关联到最近的一个框架协议
          const frameworks = (this.list || []).filter(x => x.contractType === 'framework')
          const linkId = defaultType === 'supplement' && frameworks.length ? frameworks[frameworks.length - 1].id : null
          return { ...i, dataCount: defaultDataCount, productCount: defaultProductCount, writtenOffAmount: defaultWrittenOff, contractType: i.contractType ?? defaultType, frameworkId: i.frameworkId ?? linkId }
        })

        this.list = list
        this.total = list.length
        this.error = null
        return true
      } catch (e: any) {
        this.error = { code: 'CONTRACT_FETCH_ERROR', message: e?.message || '获取合同列表失败' }
        return false
      } finally {
        this.loading = false
      }
    },

    async uploadMock() {
      try {
        const append: ContractItem[] = [
          { id: 'C-20240104', contractNo: 'HT-004', contractName: '外数采购-美团2024Q4', supplier: '美团', amount: 650000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*15).toISOString(), status: 'active', contractType: 'framework', frameworkId: null },
          { id: 'C-20240105', contractNo: 'HT-005', contractName: '外数采购-美团补充协议-接口扩展', supplier: '美团', amount: 150000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*60).toISOString(), status: 'active', contractType: 'supplement', frameworkId: 'C-20240104' }
        ]
        this.list = [...this.list, ...append]
        this.total = this.list.length
        this.error = null
        return true
      } catch (e: any) {
        this.error = { code: 'CONTRACT_UPLOAD_ERROR', message: e?.message || '追加合同Mock失败' }
        return false
      }
    },

    async createContract(payload: Partial<ContractItem>) {
      try {
        const item = await apiCreateContract(payload)
        this.list = [item, ...this.list]
        this.total = this.list.length
        return true
      } catch (e: any) {
        this.error = { code: 'CONTRACT_CREATE_ERROR', message: e?.message || '新增合同失败' }
        return false
      }
    },

    async deleteById(id: string) {
      try {
        await apiDeleteContract(id)
        this.list = this.list.filter(i => i.id !== id)
        this.total = this.list.length
        return true
      } catch (e: any) {
        this.error = { code: 'CONTRACT_DELETE_ERROR', message: e?.message || '删除合同失败' }
        return false
      }
    },

    updateAssociations(contractId: string, products: { id: string }[]) {
      const idx = this.list.findIndex(i => i.id === contractId)
      if (idx >= 0) {
        const item = this.list[idx]
        const next = { ...item, productCount: products.length }
        this.list.splice(idx, 1, next)
        this.total = this.list.length
      }
    }
    ,updateFrameworkLink(contractId: string, frameworkId: string | null) {
      const idx = this.list.findIndex(i => i.id === contractId)
      if (idx >= 0) {
        const item = this.list[idx]
        const next = { ...item, frameworkId }
        this.list.splice(idx, 1, next)
        this.total = this.list.length
      }
    }
    ,updatePricing(productId: string, pricing: { billingMode?: string; billingType?: 'fixed' | 'tiered' | 'special'; basePrice?: number; tiers?: Array<{ lower: number; upper: number; price: number }>; remark?: string; freeQuotaValue?: number; freeQuotaStart?: string; freeQuotaEnd?: string }) {
      this.pricingMap[productId] = { ...pricing }
    }
  }
})
