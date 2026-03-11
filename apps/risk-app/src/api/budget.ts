import { getBudgetList, getBudgetDetail, createBudget as createBudgetApi, updateBudget as updateBudgetApi } from '@/modules/budget/api/budget'

export const budgetApiService = {
  async getBudgets(params: { page?: number; pageSize?: number }) {
    const res = await getBudgetList(params)
    return { list: res.list || [], total: Number(res.total || (res.list || []).length) }
  },
  async getBudget(id: string) {
    return await getBudgetDetail(id)
  },
  async createBudget(payload: any) {
    return await createBudgetApi(payload)
  },
  async updateBudget(id: string, payload: any) {
    return await updateBudgetApi(id, payload)
  },
  async deleteBudget(id: string) {
    return { id, deleted: true }
  }
}
