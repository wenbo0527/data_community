import axios from 'axios'

export async function getEvaluationReports(params?: { page?: number; pageSize?: number; reportType?: string; keyword?: string; status?: string; startDate?: string; endDate?: string }) {
  const res = await axios.get('/api/external-data-evaluation/list', { params })
  const data = (res as any)?.data
  const list = Array.isArray(data?.list) ? data.list : (Array.isArray(data) ? data : (data?.data ?? []))
  const total = Number(data?.total ?? (Array.isArray(list) ? list.length : 0))
  return { list, total }
}

export async function getEvaluationReportDetail(id: string | number) {
  const res = await axios.get(`/api/external-data-evaluation/${id}`)
  return (res as any)?.data
}

export async function createEvaluationReport(payload: any) {
  const res = await axios.post('/api/external-data-evaluation', payload)
  return (res as any)?.data
}

export async function publishReport(id: string | number) {
  const res = await axios.put(`/api/external-data-evaluation/${id}/publish`)
  return (res as any)?.data
}

export async function archiveReport(id: string | number) {
  const res = await axios.put(`/api/external-data-evaluation/${id}/archive`)
  return (res as any)?.data
}

export async function getRegisteredProducts() {
  const res = await axios.get('/api/external-data-evaluation/products')
  return (res as any)
}
