import http from '../../../api/http'
const useMock = (import.meta as any)?.env?.VITE_USE_MOCK === 'true'

export async function getBudgetList(params: { page?: number; pageSize?: number }) {
  if (useMock) {
    const list = Array.from({ length: 8 }, (_, i) => ({ id: `B${i+1}`, name: `年度预算-${i+1}`, year: new Date().getFullYear(), total: 1000000 + i*50000, used: 400000 + i*30000, status: 'active' }))
    return { list, total: list.length }
  }
  return await http.get('/budget/list', { params })
}

export async function getBudgetDetail(id: string) {
  if (useMock) return { id, name: `年度预算-${id}`, year: new Date().getFullYear(), total: 1200000, status: 'active' }
  return await http.get(`/budget/${id}`)
}

export async function createBudget(payload: any) {
  if (useMock) return { id: Date.now().toString(), ...payload }
  return await http.post('/budget', payload)
}

export async function updateBudget(id: string, payload: any) {
  if (useMock) return { id, ...payload }
  return await http.put(`/budget/${id}`, payload)
}

export async function createBudgetVerification(payload: any) {
  if (useMock) {
    return { id: `V-${Date.now()}`, ...payload }
  }
  return await http.post('/budget/verification', payload)
}
