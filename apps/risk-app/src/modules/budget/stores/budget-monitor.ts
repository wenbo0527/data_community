import { defineStore } from 'pinia'
import { getBurndown, getWarnings } from '../../external-data/api/monitor'

export const useBudgetMonitorStore = defineStore('budgetMonitor', {
  state: () => ({
    burndown: [] as any[],
    warnings: [] as any[],
    loading: false
  }),
  actions: {
    async fetchBurndown(params?: { range?: 'month' | 'quarter' }) {
      this.loading = true
      try {
        this.burndown = await getBurndown(params || { range: 'month' })
      } finally {
        this.loading = false
      }
    },
    async fetchWarnings(params?: any) {
      this.loading = true
      try {
        this.warnings = await getWarnings(params || {})
      } finally {
        this.loading = false
      }
    }
  }
})
