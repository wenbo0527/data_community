import { getBudgetList, createBudgetVerification } from './budget'

export async function getBudgets(params: { page?: number; pageSize?: number }) {
  const resp = await getBudgetList(params)
  const list = (resp?.list || []).map((b: any) => ({
    id: b.id,
    budgetName: b.name || b.budgetName || String(b.id),
    remainingAmount: Math.max(0, Number(b.total || 0) - Number(b.used || 0))
  }))
  return { list, total: Number(resp?.total || list.length) }
}

export async function createVerification(payload: { budgetId: string; projectId: string; verificationAmount: number }) {
  return await createBudgetVerification({
    budgetId: payload.budgetId,
    projectId: payload.projectId,
    verificationAmount: payload.verificationAmount
  })
}
