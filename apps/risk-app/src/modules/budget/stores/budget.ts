import { defineStore } from 'pinia'
import { getBudgetList, getBudgetDetail, createBudget, updateBudget } from '../api/budget'

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    list: [] as any[],
    total: 0,
    loading: false,
    stats: {} as any
  }),
  actions: {
    async fetchBudgetList(params?: { page?: number; pageSize?: number }) {
      this.loading = true
      try {
        const res = await getBudgetList(params || { page: 1, pageSize: 10 })
        this.list = res.list || []
        this.total = Number(res.total || this.list.length)
      } finally {
        this.loading = false
      }
    },
    async fetchBudgetDetail(id: string) {
      this.loading = true
      try {
        return await getBudgetDetail(id)
      } finally {
        this.loading = false
      }
    },
    async create(payload: any) {
      this.loading = true
      try {
        return await createBudget(payload)
      } finally {
        this.loading = false
      }
    },
    async update(id: string, payload: any) {
      this.loading = true
      try {
        return await updateBudget(id, payload)
      } finally {
        this.loading = false
      }
    }
  }
})
