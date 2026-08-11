import { getBudgetList, getBudgetDetail, createBudget as createBudgetApi, updateBudget as updateBudgetApi } from '@/modules/budget/api/budget'

export const budgetApiService = {
  async getBudgets(params: { page?: number; pageSize?: number }) {
    const res: any = await getBudgetList(params)
    const data = res?.data || res
    return { list: data.list || [], total: Number(data.total || (data.list || []).length) }
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
