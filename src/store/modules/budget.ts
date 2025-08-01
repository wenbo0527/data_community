import { defineStore } from 'pinia'
import axios from 'axios'
import { ResponseData, ErrorType } from '@/types/api'

export interface BudgetData {
  id: string
  businessType: string
  platform: string
  targetLoan: number
  estimatedLoan: number
  estimatedCost: number
  estimatedAnnualCost: number
  estimatedRiskFreeReturn: number
}

interface BudgetListResponse {
  data: BudgetData[]
  total: number
}

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    budgetList: [] as BudgetData[],
    loading: false,
    error: null as ErrorType | null
  }),

  actions: {
    async fetchBudgetList(params: { page: number; pageSize: number }) {
      this.loading = true
      try {
        const response = await axios.get('/api/budget/list', { params })
        const typedResponse = response.data as ResponseData<BudgetListResponse>
        return typedResponse.data
      } catch (error: any) {
        this.error = { message: error.message }
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadBudget(file: File) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await axios.post('/api/budget/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } catch (error: any) {
        this.error = { message: error.message }
        throw error
      }
    },

    async deleteBudget(id: string) {
      try {
        const response = await axios.delete(`/api/budget/${id}`)
        return response.data
      } catch (error: any) {
        this.error = { message: error.message }
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  }
})