export interface ContractItem {
  id: string
  contractNo: string
  contractName: string
  supplier: string
  amount: number
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'pending'
  dataCount?: number
  productCount?: number
  writtenOffAmount?: number
  contractType?: 'framework' | 'supplement'
  frameworkId?: string | null
  signReportNo?: string
  initialOccupiedAmount?: number
}

export interface ContractListParams {
  page?: number
  pageSize?: number
  supplier?: string
  status?: string
}

let memoryContracts: ContractItem[] | null = null

function seedContracts() {
  if (memoryContracts) return memoryContracts
  const now = Date.now()
  const makeDate = (offsetDays: number) => new Date(now + offsetDays * 86400000).toISOString()
  const base: ContractItem[] = [
    { id: 'C-20260101', contractNo: 'HT-001', contractName: '外数采购-学信网2026Q1', supplier: '学信网', amount: 1200000, startDate: makeDate(0), endDate: makeDate(90), status: 'active', contractType: 'framework', frameworkId: null, signReportNo: '签报〔2026〕69号', initialOccupiedAmount: 300000 },
    { id: 'C-20260102', contractNo: 'HT-002', contractName: '外数采购-百行征信有限公司2026Q1', supplier: '百行征信有限公司', amount: 800000, startDate: makeDate(0), endDate: makeDate(60), status: 'active', contractType: 'framework', frameworkId: null },
    { id: 'C-20260103', contractNo: 'HT-003', contractName: '外数采购-朴道征信有限公司2026Q1', supplier: '朴道征信有限公司', amount: 600000, startDate: makeDate(0), endDate: makeDate(45), status: 'active', contractType: 'framework', frameworkId: null },
    { id: 'C-XX-FW-01', contractNo: 'XX-2026-FW-001', contractName: '学信网-2026年度框架协议', supplier: '学信网', amount: 5000000, startDate: makeDate(-30), endDate: makeDate(335), status: 'active', contractType: 'framework', frameworkId: null, signReportNo: '签报〔2026〕69号', initialOccupiedAmount: 300000, dataCount: 10000, productCount: 10, writtenOffAmount: 500000 },
    { id: 'C-XX-SUP-01', contractNo: 'XX-2026-SUP-001', contractName: '学信网-2026补充采购单01', supplier: '学信网', amount: 200000, startDate: makeDate(10), endDate: makeDate(100), status: 'active', contractType: 'supplement', frameworkId: 'C-XX-FW-01', initialOccupiedAmount: 0, dataCount: 2000, productCount: 2, writtenOffAmount: 0 }
  ]
  memoryContracts = base.map((i, idx) => {
    const defaultDataCount = i.dataCount ?? (idx + 1) * 1000 + 500
    const defaultProductCount = i.productCount ?? (idx % 5) + 1
    const ratios = [0.3, 0.5, 0.7]
    const defaultWrittenOff = i.writtenOffAmount ?? Math.round((i.amount || 0) * ratios[idx % ratios.length])
    return { ...i, dataCount: defaultDataCount, productCount: defaultProductCount, writtenOffAmount: defaultWrittenOff }
  })
  return memoryContracts
}

export async function getContracts(params: ContractListParams = {}): Promise<{ list: ContractItem[]; total: number }> {
  const list = seedContracts().slice()
  let filtered = list
  if (params.supplier) filtered = filtered.filter(i => i.supplier === params.supplier)
  if (params.status) filtered = filtered.filter(i => i.status === params.status)
  return { list: filtered, total: filtered.length }
}

export async function createContract(data: Partial<ContractItem>): Promise<ContractItem> {
  const id = `C-${Date.now()}`
  const item: ContractItem = {
    id,
    contractNo: data.contractNo || id,
    contractName: data.contractName || '未命名合同',
    supplier: data.supplier || '未知供应商',
    amount: Number(data.amount) || 0,
    startDate: data.startDate || new Date().toISOString(),
    endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    status: (data.status as ContractItem['status']) || 'pending',
    dataCount: data.dataCount ?? 0,
    productCount: data.productCount ?? 0,
    writtenOffAmount: data.writtenOffAmount ?? 0,
    contractType: data.contractType ?? 'framework',
    frameworkId: data.frameworkId ?? null,
    signReportNo: data.signReportNo,
    initialOccupiedAmount: data.initialOccupiedAmount ?? 0
  }
  seedContracts()
  memoryContracts!.unshift(item)
  return item
}

export async function deleteContract(id: string): Promise<boolean> {
  seedContracts()
  const before = memoryContracts!.length
  memoryContracts = memoryContracts!.filter(i => i.id !== id)
  return memoryContracts!.length < before
}
