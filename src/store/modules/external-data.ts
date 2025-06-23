import { defineStore } from 'pinia'
import axios from 'axios'
import { ResponseData, ErrorType } from '@/types/api'
import { useBudgetStore } from './budget'

export interface WarningData {
  businessType: string
  platform: string
  targetLoan: number
  estimatedLoan: number
  actualLoan: number
  estimatedCost: number
  actualCost: number
  estimatedAnnualCost: number
  actualAnnualCost: number
  estimatedRiskFreeReturn: number
  actualRiskFreeReturn: number
  externalDataCost?: number
  budgetStatus?: string
}

export interface BurndownData {
  month: string
  budget: number
  actual: number
  granularity: string
}

export const useExternalDataStore = defineStore('externalData', {
  state: () => ({
    burndownData: [] as BurndownData[],
    warningData: [] as WarningData[],
    targetLoanOptions: [] as number[],
    loading: false,
    error: null as ErrorType | null
  }),

  actions: {
    async fetchBurndownData(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/external-data/burndown', { params })
        const typedResponse = response.data as ResponseData<BurndownData[]>
        this.burndownData = typedResponse.data
      } catch (error: any) {
        this.error = { message: error.message }
      } finally {
        this.loading = false
      }
    },

    async fetchWarningData(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/external-data/warning', { params })
        const typedResponse = response.data as ResponseData<WarningData[]>
        this.warningData = typedResponse.data
      } catch (error: any) {
        this.error = { message: error.message }
      } finally {
        this.loading = false
      }
    },

    async fetchTargetLoanOptions() {
      try {
        const budgetStore = useBudgetStore()
        const { data } = await budgetStore.fetchBudgetList({ page: 1, pageSize: 100 })
        this.targetLoanOptions = [...new Set(data.map(item => item.targetLoan))].sort((a, b) => a - b)
      } catch (error: any) {
        this.error = { message: error.message }
      }
    },

    clearError() {
      this.error = null
    }
  }
})