import http from '../../../api/http'

export async function getEvaluationReports(params: any) {
  const res: any = await http.get('/external-data-evaluation/list', { params })
  // 适配 Mock 返回结构 { code: 200, data: { list: [], total: 0 } }
  // 同时也兼容直接返回 { list: [], total: 0 } 的情况
  const payload = res?.data || res
  return { 
    list: payload?.list || [], 
    total: Number(payload?.total || 0) 
  }
}

export async function getEvaluationReportDetail(id: string | number) {
  const res: any = await http.get(`/external-data-evaluation/detail/${id}`)
  return res?.data || res
}

export async function createEvaluationReport(payload: any) {
  const res: any = await http.post('/external-data-evaluation/create', payload)
  return res?.data || res
}

export async function publishReport(id: string | number) {
  const res: any = await http.put(`/external-data-evaluation/${id}/publish`)
  return res?.data || res
}

export async function archiveReport(id: string | number) {
  const res: any = await http.put(`/external-data-evaluation/${id}/archive`)
  return res?.data || res
}

export async function getRegisteredProducts() {
  // 返回完整的响应对象，由 Store 处理 { code, data } 结构
  return await http.get('/external-data-evaluation/products')
}
