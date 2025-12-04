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
    { id: 'C-20240101', contractNo: 'HT-001', contractName: '外数采购-字节2024Q4', supplier: '字节', amount: 1200000, startDate: makeDate(0), endDate: makeDate(25), status: 'active' },
    { id: 'C-20240102', contractNo: 'HT-002', contractName: '外数采购-阿里2024Q4', supplier: '阿里', amount: 800000, startDate: makeDate(0), endDate: makeDate(60), status: 'active' },
    { id: 'C-20240103', contractNo: 'HT-003', contractName: '外数采购-快手2024Q3', supplier: '快手', amount: 500000, startDate: makeDate(-90), endDate: makeDate(-10), status: 'expired' },
    { id: 'C-20240104', contractNo: 'HT-004', contractName: '外数采购-美团2024Q4', supplier: '美团', amount: 650000, startDate: makeDate(0), endDate: makeDate(15), status: 'active' },
    { id: 'C-20240105', contractNo: 'HT-005', contractName: '外数采购-京东2024Q4', supplier: '京东', amount: 720000, startDate: makeDate(0), endDate: makeDate(35), status: 'pending' }
  ]
  memoryContracts = base.map((i, idx) => {
    const defaultDataCount = (idx + 1) * 1000 + 500
    const defaultProductCount = (idx % 5) + 1
    const ratios = [0.3, 0.5, 0.7]
    const defaultWrittenOff = Math.round((i.amount || 0) * ratios[idx % ratios.length])
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
    writtenOffAmount: data.writtenOffAmount ?? 0
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
