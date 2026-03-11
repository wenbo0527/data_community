import { defineStore } from 'pinia'
import { getBurndown, getWarnings } from '@/api/budget-monitor'
import type { BurndownPoint, WarningItem } from '@/api/budget-monitor'

export const useBudgetMonitorStore = defineStore('budgetMonitor', {
  state: () => ({
    burndown: [] as BurndownPoint[],
    warnings: [] as WarningItem[],
    loading: false as boolean,
    error: null as string | null,
  }),
  actions: {
    async fetchBurndown(params?: {
      range?: 'month' | 'quarter'
      productId?: string | number
      businessType?: string
      platform?: string
      year?: string
      targetLoan?: number
    }) {
      this.loading = true
      this.error = null
      try {
        const list = await getBurndown(params)
        this.burndown = list
        return true
      } catch (e: any) {
        this.error = e?.message || '获取燃尽数据失败'
        return false
      } finally {
        this.loading = false
      }
    },
    async fetchWarnings(params?: {
      level?: string
      productId?: string | number
      businessType?: string
      platform?: string
      year?: string
      targetLoan?: number
    }) {
      this.loading = true
      this.error = null
      try {
        const list = await getWarnings(params)
        this.warnings = list
        return true
      } catch (e: any) {
        this.error = e?.message || '获取预警数据失败'
        return false
      } finally {
        this.loading = false
      }
    },
  },
})

