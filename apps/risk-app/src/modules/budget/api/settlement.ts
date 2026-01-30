import http from '../../../api/http'
const useMock = (import.meta as any)?.env?.VITE_USE_MOCK === 'true'

export async function getSettlementList(_: any) {
  if (useMock) {
    const list = Array.from({ length: 6 }, (_, i) => ({
      id: `S${i+1}`,
      contractNo: `FA-00${i+1}`,
      supplier: ['百行','朴道','钱塘','学信网'][i % 4],
      amount: 80000 + i * 5000,
      writtenOffAmount: 20000 + i * 3000,
      endDate: new Date(Date.now() + (i + 15) * 86400000).toISOString()
    }))
    return { list, total: list.length }
  }
  return await http.get('/budget/settlement/list')
}

export async function createWriteoff(payload: any) {
  if (useMock) return { id: Date.now().toString(), ...payload }
  return await http.post('/budget/settlement/writeoff', payload)
}

export async function createSettlementTask(payload: any) {
  if (useMock) return { id: Date.now().toString(), ...payload }
  return await http.post('/budget/settlement/task', payload)
}
