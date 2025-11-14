import { defineStore } from 'pinia'
import type { ErrorType } from '@/types/api'

export interface ContractItem {
  id: string
  contractNo: string
  contractName: string
  supplier: string
  amount: number
  startDate: string // ISO 日期字符串
  endDate: string   // ISO 日期字符串
  status: 'active' | 'expired' | 'pending'
  dataCount?: number
  productCount?: number
  writtenOffAmount?: number
}

export interface ContractListParams {
  page?: number
  pageSize?: number
  supplier?: string
  status?: string
}

function daysBetween(dateStr: string) {
  try {
    const now = new Date()
    const target = new Date(dateStr)
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  } catch {
    return NaN
  }
}

export const useContractStore = defineStore('contract', {
  state: () => ({
    list: [] as ContractItem[],
    total: 0,
    loading: false,
    error: null as ErrorType | null
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
  },

  actions: {
    async fetchContractList(params: ContractListParams = {}) {
      this.loading = true
      try {
        // 简化：使用本地静态数据，后续可替换为真实 API
        const base: ContractItem[] = [
          { id: 'C-20240101', contractNo: 'HT-001', contractName: '外数采购-字节2024Q4', supplier: '字节', amount: 1200000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*25).toISOString(), status: 'active' },
          { id: 'C-20240102', contractNo: 'HT-002', contractName: '外数采购-阿里2024Q4', supplier: '阿里', amount: 800000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*60).toISOString(), status: 'active' },
          { id: 'C-20240103', contractNo: 'HT-003', contractName: '外数采购-快手2024Q3', supplier: '快手', amount: 500000, startDate: new Date(Date.now() - 1000*60*60*24*90).toISOString(), endDate: new Date(Date.now() - 1000*60*60*24*10).toISOString(), status: 'expired' },
          { id: 'C-20240104', contractNo: 'HT-004', contractName: '外数采购-美团2024Q4', supplier: '美团', amount: 650000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*15).toISOString(), status: 'active' },
          { id: 'C-20240105', contractNo: 'HT-005', contractName: '外数采购-京东2024Q4', supplier: '京东', amount: 720000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*35).toISOString(), status: 'pending' },
          { id: 'C-20240106', contractNo: 'HT-006', contractName: '外数采购-腾讯2024Q3', supplier: '腾讯', amount: 1500000, startDate: new Date(Date.now() - 1000*60*60*24*120).toISOString(), endDate: new Date(Date.now() - 1000*60*60*24*5).toISOString(), status: 'expired' },
          { id: 'C-20240107', contractNo: 'HT-007', contractName: '外数采购-网易2024Q4', supplier: '网易', amount: 430000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*5).toISOString(), status: 'active' },
          { id: 'C-20240108', contractNo: 'HT-008', contractName: '外数采购-哔哩哔哩2024Q4', supplier: '哔哩哔哩', amount: 300000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*80).toISOString(), status: 'active' },
          { id: 'C-20240109', contractNo: 'HT-009', contractName: '外数采购-携程2024Q4', supplier: '携程', amount: 560000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*28).toISOString(), status: 'active' },
          { id: 'C-20240110', contractNo: 'HT-010', contractName: '外数采购-百度2024Q4', supplier: '百度', amount: 980000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*90).toISOString(), status: 'pending' },
          { id: 'C-20240111', contractNo: 'HT-011', contractName: '外数采购-小米2024Q4', supplier: '小米', amount: 410000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*12).toISOString(), status: 'active' },
          { id: 'C-20240112', contractNo: 'HT-012', contractName: '外数采购-拼多多2024Q3', supplier: '拼多多', amount: 700000, startDate: new Date(Date.now() - 1000*60*60*24*200).toISOString(), endDate: new Date(Date.now() - 1000*60*60*24*30).toISOString(), status: 'expired' },
          { id: 'C-20240113', contractNo: 'HT-013', contractName: '外数采购-得物2024Q4', supplier: '得物', amount: 250000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*3).toISOString(), status: 'active' },
          { id: 'C-20240114', contractNo: 'HT-014', contractName: '外数采购-知乎2024Q4', supplier: '知乎', amount: 330000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*40).toISOString(), status: 'pending' },
          { id: 'C-20240115', contractNo: 'HT-015', contractName: '外数采购-58同城2024Q4', supplier: '58同城', amount: 280000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*70).toISOString(), status: 'active' },
          { id: 'C-20240116', contractNo: 'HT-016', contractName: '外数采购-微博2024Q3', supplier: '微博', amount: 350000, startDate: new Date(Date.now() - 1000*60*60*24*60).toISOString(), endDate: new Date(Date.now() - 1000*60*60*24*1).toISOString(), status: 'expired' },
          { id: 'C-20240117', contractNo: 'HT-017', contractName: '外数采购-爱奇艺2024Q4', supplier: '爱奇艺', amount: 620000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*20).toISOString(), status: 'active' },
          { id: 'C-20240118', contractNo: 'HT-018', contractName: '外数采购-哔哩哔哩2024Q3', supplier: '哔哩哔哩', amount: 310000, startDate: new Date(Date.now() - 1000*60*60*24*150).toISOString(), endDate: new Date(Date.now() - 1000*60*60*24*20).toISOString(), status: 'expired' },
          { id: 'C-20240119', contractNo: 'HT-019', contractName: '外数采购-携程2024Q3', supplier: '携程', amount: 540000, startDate: new Date(Date.now() - 1000*60*60*24*30).toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*2).toISOString(), status: 'active' },
          { id: 'C-20240120', contractNo: 'HT-020', contractName: '外数采购-京东2024Q3', supplier: '京东', amount: 760000, startDate: new Date(Date.now() - 1000*60*60*24*10).toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*120).toISOString(), status: 'pending' }
        ]

        let list = [...base]
        list = list.map((i) => {
          const numId = Number(String(i.id || '').replace(/\D/g, '')) || 1
          const defaultDataCount = i.dataCount ?? (numId * 1000 + 500)
          const defaultProductCount = i.productCount ?? (numId % 5) + 1
          const ratios = [0.3, 0.5, 0.7]
          const defaultWrittenOff = i.writtenOffAmount ?? Math.round((i.amount || 0) * ratios[numId % ratios.length])
          return { ...i, dataCount: defaultDataCount, productCount: defaultProductCount, writtenOffAmount: defaultWrittenOff }
        })
        if (params.supplier) list = list.filter(i => i.supplier === params.supplier)
        if (params.status) list = list.filter(i => i.status === params.status)

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
          {
            id: 'C-20240104', contractNo: 'HT-004', contractName: '外数采购-美团2024Q4', supplier: '美团'
            , amount: 650000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000*60*60*24*15).toISOString(), status: 'active'
          }
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
        const id = `C-${Date.now()}`
        const item: ContractItem = {
          id,
          contractNo: payload.contractNo || id,
          contractName: payload.contractName || '未命名合同',
          supplier: payload.supplier || '未知供应商',
          amount: Number(payload.amount) || 0,
          startDate: payload.startDate || new Date().toISOString(),
          endDate: payload.endDate || new Date(Date.now() + 1000*60*60*24*30).toISOString(),
          status: (payload.status as ContractItem['status']) || 'pending'
        }
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
        this.list = this.list.filter(i => i.id !== id)
        this.total = this.list.length
        return true
      } catch (e: any) {
        this.error = { code: 'CONTRACT_DELETE_ERROR', message: e?.message || '删除合同失败' }
        return false
      }
    }
    ,
    updateAssociations(contractId: string, products: { id: string }[]) {
      const idx = this.list.findIndex(i => i.id === contractId)
      if (idx >= 0) {
        const item = this.list[idx]
        const next = { ...item, productCount: products.length }
        this.list.splice(idx, 1, next)
        this.total = this.list.length
      }
    }
  }
})
