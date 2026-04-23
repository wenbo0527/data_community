import Mock from 'mockjs'

interface BudgetItem {
  id: string
  businessType: string
  platform: string
  targetLoan: number
  estimatedLoan: number
  estimatedCost: number
  estimatedAnnualCost: number
  estimatedRiskFreeReturn: number
  granularity?: 'year' | 'quarter' | 'month'
  timeLabel?: string
  budgetNo?: string
  remainingAmount?: number
}

// 生成预算数据（与列表展示字段一致）
const generateBudgetData = (count: number): BudgetItem[] => {
  const year = new Date().getFullYear()
  const bts = ['助贷', '融担', '直贷']
  const platsMap: Record<string, string[]> = { '助贷': ['蚂蚁', '字节', '京东'], '融担': ['蚂蚁', '字节', '京东'], '直贷': ['苏贷'] }
  const data: BudgetItem[] = []

  for (let i = 0; i < count; i++) {
    const month = (i % 12) + 1
    const quarter = Math.ceil(month / 3)
    const bt = bts[i % bts.length]
    const plat = platsMap[bt][i % platsMap[bt].length]
    const granularity = (i % 3 === 0 ? 'year' : i % 3 === 1 ? 'quarter' : 'month') as 'year'|'quarter'|'month'
    const timeLabel = granularity === 'year' ? String(year) : granularity === 'quarter' ? `${year}-Q${quarter}` : `${year}-${String(month).padStart(2, '0')}`
    const budgetNo = `B${year}-${String(i + 1).padStart(3, '0')}`
    const remainingAmount = Math.max(0, Number(Mock.Random.float(800000, 1200000, 2, 2)) - Number(Mock.Random.float(600000, 1000000, 2, 2)) - Number(Mock.Random.float(40000, 80000, 2, 2)))
    data.push({
      id: Mock.Random.guid(),
      businessType: bt,
      platform: plat,
      targetLoan: Mock.Random.float(800000, 1200000, 2, 2),
      estimatedLoan: Mock.Random.float(600000, 1000000, 2, 2),
      estimatedCost: Mock.Random.float(40000, 80000, 2, 2),
      estimatedAnnualCost: Mock.Random.float(0.03, 0.06, 4, 4),
      estimatedRiskFreeReturn: Mock.Random.float(0.06, 0.09, 4, 4),
      granularity,
      timeLabel,
      budgetNo,
      remainingAmount
    })
  }

  return data
}

// 模拟预算数据列表
let budgetDataList = generateBudgetData(36)

// 获取预算列表
Mock.mock(/\/api\/budget\/list/, 'get', (options: any) => {
  const url = new URL(options.url, 'http://dummy.com')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    code: 200,
    data: {
      list: budgetDataList.slice(start, end),
      total: budgetDataList.length,
      page,
      pageSize
    }
  }
})

// 上传预算数据（单个或批量追加）
Mock.mock(/\/api\/budget\/upload/, 'post', (options: any) => {
  try {
    const payload = options.body ? JSON.parse(options.body) : {}
    if (payload && (payload.platform || payload.businessType)) {
      const item: BudgetItem = {
        id: Mock.Random.guid(),
        businessType: payload.businessType || '助贷',
        platform: payload.platform || '蚂蚁',
        targetLoan: Number(payload.targetLoan ?? 900000),
        estimatedLoan: Number(payload.estimatedLoan ?? 700000),
        estimatedCost: Number(payload.estimatedCost ?? 50000),
        estimatedAnnualCost: Number(payload.estimatedAnnualCost ?? 0.045),
        estimatedRiskFreeReturn: Number(payload.estimatedRiskFreeReturn ?? 0.075),
        granularity: payload.granularity || 'month',
        timeLabel: payload.timeLabel || `${new Date().getFullYear()}-${String((new Date().getMonth()+1)).padStart(2, '0')}`,
        budgetNo: `B${new Date().getFullYear()}-${String(Math.floor(Math.random()*999)+1).padStart(3, '0')}`,
        remainingAmount: Math.max(0, Number(payload.targetLoan ?? 900000) - Number(payload.estimatedLoan ?? 700000) - Number(payload.estimatedCost ?? 50000))
      }
      budgetDataList = [item, ...budgetDataList]
    } else {
      const newData = generateBudgetData(Mock.Random.integer(3, 5))
      budgetDataList = [...newData, ...budgetDataList]
    }
  } catch {
    const newData = generateBudgetData(Mock.Random.integer(3, 5))
    budgetDataList = [...newData, ...budgetDataList]
  }

  return {
    code: 200,
    message: '上传成功'
  }
})

// 删除预算数据
Mock.mock(/\/api\/budget\/.*/, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  budgetDataList = budgetDataList.filter(item => item.id !== id)

  return {
    code: 200,
    message: '删除成功'
  }
})
