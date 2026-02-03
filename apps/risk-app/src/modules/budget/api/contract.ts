import http from '../../../api/http'

export interface ContractItem {
  id: string
  contractNo: string
  contractName: string
  supplier: string
  amount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'terminated' | 'pending' | 'expired'
  dataCount?: number
  productCount?: number
  writtenOffAmount?: number
  totalFreeQuota?: number
  usedFreeQuota?: number
  contractType?: 'framework' | 'supplement'
  frameworkId?: string | null
  supplementIds?: string[]
}

export interface ContractListParams {
  page?: number
  pageSize?: number
  supplier?: string
  status?: string
}

export async function getContracts(params: ContractListParams = {}): Promise<{ list: ContractItem[]; total: number }> {
  const res: any = await http.get('/budget/contracts', { params })
  // Handle standard response wrapper { code: 200, data: { list, total } }
  if (res && res.code === 200 && res.data) {
    return res.data
  }
  // Handle direct return or other formats
  return res
}

export async function createContract(data: Partial<ContractItem>): Promise<ContractItem> {
  const res: any = await http.post('/budget/contracts', data)
  if (res && res.code === 200 && res.data) {
    return res.data
  }
  return res
}

export async function updateContract(id: string, data: Partial<ContractItem>): Promise<boolean> {
  const res: any = await http.put(`/budget/contracts/${id}`, data)
  if (res && res.code === 200) {
    return true
  }
  return !!res
}

export async function deleteContract(id: string): Promise<boolean> {
  const res: any = await http.delete(`/budget/contracts/${id}`)
  if (res && res.code === 200) {
    return true
  }
  return !!res
}
