import { defineStore } from 'pinia'
import type { ErrorType } from '@/types/api'
import { budgetApiService } from '@/api/budget'

export interface BudgetData {
  id: string
  businessType: string
  platform: string
  targetLoan: number
  estimatedLoan: number
  estimatedCost: number
  estimatedAnnualCost: number
  estimatedRiskFreeReturn: number
  granularity?: 'year' | 'quarter' | 'month'
  timeLabel?: string
}

export interface BudgetListParams {
  page?: number
  pageSize?: number
}

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    list: [] as BudgetData[],
    total: 0,
    loading: false,
    error: null as ErrorType | null
  }),

  getters: {
    stats: (state) => {
      const count = state.list.length
      const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
      const targetLoanTotal = sum(state.list.map((i: BudgetData) => i.targetLoan))
      const estimatedLoanTotal = sum(state.list.map((i: BudgetData) => i.estimatedLoan))
      const averageAnnualCost = count ? (sum(state.list.map((i: BudgetData) => i.estimatedAnnualCost)) / count) : 0
      return { count, targetLoanTotal, estimatedLoanTotal, averageAnnualCost }
    },
    byBusinessType: (state) => {
      const map: Record<string, BudgetData[]> = {}
      state.list.forEach((item: BudgetData) => {
        const key = item.businessType
        const bucket = map[key] ?? (map[key] = [])
        bucket.push(item)
      })
      return map
    }
  },

  actions: {
    async fetchBudgetList(params: BudgetListParams = { page: 1, pageSize: 10 }): Promise<{ data: BudgetData[]; total: number }>{
      this.loading = true
      try {
        const query: { page?: number; pageSize?: number } = {}
        if (typeof params.page === 'number') query.page = params.page
        if (typeof params.pageSize === 'number') query.pageSize = params.pageSize

        const resp: any = await budgetApiService.getBudgets(query)
        const data: BudgetData[] = (resp?.list || resp?.data || []) as BudgetData[]
        this.list = data
        this.total = Number(resp?.total || data.length || 0)
        return { data, total: this.total }
      } catch (error: any) {
        this.error = { message: error?.message || '预算列表加载失败' }
        return { data: [], total: 0 }
      } finally {
        this.loading = false
      }
    },

    async uploadMock(): Promise<boolean> {
      try {
        await budgetApiService.createBudget({})
        return true
      } catch (error: any) {
        this.error = { message: error?.message || '上传失败' }
        return false
      }
    },

    async createBudget(payload: Partial<BudgetData>): Promise<boolean> {
      this.loading = true
      try {
        await budgetApiService.createBudget(payload)
        await this.fetchBudgetList({ page: 1, pageSize: 10 })
        return true
      } catch (error: any) {
        this.error = { message: error?.message || '新增预算失败' }
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteById(id: string): Promise<boolean> {
      try {
        await budgetApiService.deleteBudget(id)
        const idx = this.list.findIndex((i: BudgetData) => String(i.id) === String(id))
        if (idx >= 0) this.list.splice(idx, 1)
        this.total = this.list.length
        return true
      } catch (error: any) {
        this.error = { message: error?.message || '删除失败' }
        return false
      }
    },

    clearError() { this.error = null }
  }
})
