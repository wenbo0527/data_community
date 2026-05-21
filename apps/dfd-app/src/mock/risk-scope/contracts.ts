import type { MockMethod } from 'vite-plugin-mock'

const now = Date.now()
const makeDate = (offsetDays: number) => new Date(now + offsetDays * 86400000).toISOString()

// Initial base contracts
const baseContracts: any[] = [
  // Existing ones (adapted from original api/contract.ts)
  { id: 'C-20260101', contractNo: 'HT-001', contractName: '外数采购-学信网2026Q1', supplier: '学信网', amount: 1200000, startDate: makeDate(0), endDate: makeDate(90), status: 'active', contractType: 'framework' },
  { id: 'C-20260102', contractNo: 'HT-002', contractName: '外数采购-百行2026Q1', supplier: '百行', amount: 800000, startDate: makeDate(0), endDate: makeDate(60), status: 'active', contractType: 'framework' },
  { id: 'C-20260103', contractNo: 'HT-003', contractName: '外数采购-朴道2026Q1', supplier: '朴道', amount: 600000, startDate: makeDate(0), endDate: makeDate(45), status: 'active', contractType: 'framework' },
  
  // NEW: Xuexin Framework & Supplement
  { 
    id: 'C-XX-FW-01', 
    contractNo: 'XX-2026-FW-001', 
    contractName: '学信网-2026年度框架协议', 
    supplier: '学信网', 
    amount: 5000000, 
    startDate: makeDate(-30), 
    endDate: makeDate(335), 
    status: 'active',
    contractType: 'framework',
    dataCount: 10000,
    productCount: 10,
    writtenOffAmount: 500000
  },
  { 
    id: 'C-XX-SUP-01', 
    contractNo: 'XX-2026-SUP-001', 
    contractName: '学信网-2026补充采购单01', 
    supplier: '学信网', 
    amount: 200000, 
    startDate: makeDate(10), 
    endDate: makeDate(100), 
    status: 'active',
    contractType: 'supplement',
    frameworkId: 'C-XX-FW-01',
    dataCount: 2000,
    productCount: 2,
    writtenOffAmount: 0
  }
]

// Generate some more random contracts to mimic previous behavior
const generatedContracts = baseContracts.map((i, idx) => {
  const numId = idx + 1
  const defaultDataCount = i.dataCount ?? (numId * 1000 + 500)
  const defaultProductCount = i.productCount ?? (idx % 5) + 1
  const ratios = [0.3, 0.5, 0.7]
  const defaultWrittenOff = i.writtenOffAmount ?? Math.round((i.amount || 0) * ratios[idx % ratios.length])
  
  return { 
    ...i, 
    dataCount: defaultDataCount, 
    productCount: defaultProductCount, 
    writtenOffAmount: defaultWrittenOff,
    contractType: i.contractType || (idx % 2 === 0 ? 'framework' : 'supplement')
  }
})

export default [
  {
    url: '/api/budget/contracts',
    method: 'get',
    response: ({ query }: { query: any }) => {
      let list = [...generatedContracts]
      
      // Filter logic
      if (query.supplier) {
        list = list.filter(i => i.supplier === query.supplier)
      }
      if (query.status) {
        list = list.filter(i => i.status === query.status)
      }
      
      return {
        code: 200,
        data: {
          list,
          total: list.length
        }
      }
    }
  },
  {
    url: '/api/budget/contracts',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const id = `C-${Date.now()}`
      const newItem = {
        id,
        contractNo: body.contractNo || id,
        contractName: body.contractName || '未命名合同',
        supplier: body.supplier || '未知征信机构',
        amount: Number(body.amount) || 0,
        startDate: body.startDate || new Date().toISOString(),
        endDate: body.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
        status: body.status || 'active',
        contractType: body.contractType || 'framework', // Default to framework
        frameworkId: body.frameworkId || null,
        dataCount: 0,
        productCount: 0,
        writtenOffAmount: 0
      }
      generatedContracts.unshift(newItem)
      return {
        code: 200,
        data: newItem
      }
    }
  },
  {
    url: RegExp('/api/budget/contracts/.+'),
    method: 'put',
    response: ({ body, url }: { body: any, url: string }) => {
      const id = url.split('/').pop()
      const item = generatedContracts.find(i => i.id === id)
      if (item) {
        Object.assign(item, body)
        return { code: 200, data: true }
      }
      return { code: 404, message: 'Contract not found' }
    }
  },
  {
    url: RegExp('/api/budget/contracts/.+'),
    method: 'delete',
    response: () => {
      return { code: 200, data: true }
    }
  }
] as MockMethod[]
