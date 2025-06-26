import Mock from 'mockjs'

/**
 * 预算数据接口
 * @property {string} businessType - 业务类型
 * @property {string} platform - 产品平台
 * @property {number} targetLoan - 目标贷款金额(单位:亿)
 * @property {number} estimatedLoan - 预计贷款金额(单位:亿)
 * @property {number} actualLoan - 实际贷款金额(单位:亿)
 * @property {number} estimatedCost - 预计成本(单位:万)
 * @property {number} actualCost - 实际成本(单位:万)
 * @property {number} estimatedAnnualCost - 预计年化成本率
 * @property {number} actualAnnualCost - 实际年化成本率
 * @property {number} estimatedRiskFreeReturn - 预计无风险收益率
 * @property {number} actualRiskFreeReturn - 实际无风险收益率
 */
export interface BudgetData {
  businessType: string
  platform: string
  targetLoan: number
  estimatedLoan: number
  actualLoan: number
  loanDeviation: number
  estimatedCost: number
  actualCost: number
  estimatedAnnualCost: number
  actualAnnualCost: number
  estimatedRiskFreeReturn: number
  actualRiskFreeReturn: number
  unitPrice?: number
  totalCost?: number
}

/**
 * 燃尽图数据接口
 * @property {string} month - 月份
 * @property {number} budget - 预算剩余金额
 * @property {number} actual - 实际剩余金额
 * @property {number} initialBudget - 初始预算总额（用于计算累积消耗）
 * @property {number} cumulativeBudget - 累积预算消耗
 * @property {number} cumulativeActual - 累积实际消耗
 */
export interface BurndownData {
  month: string
  budget: number
  actual: number
  initialBudget?: number
  cumulativeBudget?: number
  cumulativeActual?: number
}

/**
 * 生成预算燃尽图数据
 * 模拟预算消耗情况，每月预算按80%递减，实际消耗在70%-100%之间随机波动
 * 同时计算累积消耗数据，支持燃尽图和累积消耗图两种显示模式
 * @returns {BurndownData[]} 燃尽图数据数组
 */
export const generateBurndownData = (filter?: {businessType?: string, platform?: string}) => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const data: BurndownData[] = []
  const initialBudget = 1000000 // 初始预算总额
  let budgetRemaining = initialBudget
  let actualRemaining = initialBudget

  months.forEach((month, index) => {
    // 计算累积消耗
    const cumulativeBudget = initialBudget - budgetRemaining
    const cumulativeActual = initialBudget - actualRemaining
    
    data.push({
      month,
      budget: budgetRemaining,
      actual: actualRemaining,
      initialBudget,
      cumulativeBudget,
      cumulativeActual
    })
    
    // 更新下个月的剩余预算
    budgetRemaining = Math.floor(budgetRemaining * 0.8)
    // 随机生成实际剩余值，使其有时高于预算(非预警)，有时低于预算(预警)
    actualRemaining = Math.floor(actualRemaining * (0.7 + Math.random() * 0.3))
  })

  return data
}

/**
 * 生成预算超支预警数据
 * 模拟不同业务类型和产品平台的预算执行情况
 * 包含目标、预计和实际的贷款金额、成本、收益率等数据
 * @returns {BudgetData[]} 预算数据数组
 */
export const generateWarningData = (filter?: {businessType?: string, platform?: string}) => {
  const businessTypes = filter?.businessType ? [filter.businessType] : ['助贷业务', '融担类业务', '直贷类业务']
  const platforms = filter?.platform ? [filter.platform] : ['字节', '蚂蚁', '京东', '美团']
  const data: BudgetData[] = []

  businessTypes.forEach(businessType => {
    platforms.forEach(platform => {
      const targetLoan = 620
      const estimatedLoan = Mock.Random.float(0.0006, targetLoan, 2, 2)
      const actualLoan = Mock.Random.float(estimatedLoan * 0.8, estimatedLoan * 1.2, 2, 2)
      
      data.push({
        businessType,
        platform,
        targetLoan,
        estimatedLoan,
        actualLoan,
        loanDeviation: (actualLoan - estimatedLoan) / estimatedLoan,
        estimatedCost: Mock.Random.float(0.0004, 0.0006, 2, 2) * 10000,
        actualCost: Mock.Random.float(0.0004 * 0.8, 0.0006 * 1.2, 2, 2) * 10000,
        estimatedAnnualCost: Mock.Random.float(0.03, 0.06, 4, 4),
        actualAnnualCost: Mock.Random.float(0.03 * 0.8, 0.06 * 1.2, 4, 4),
        estimatedRiskFreeReturn: Mock.Random.float(0.06, 0.09, 4, 4),
        actualRiskFreeReturn: Mock.Random.float(0.06 * 0.8, 0.09 * 1.2, 4, 4),
        unitPrice: undefined,
        totalCost: undefined
      })
    })
  })

  return data
}

/**
 * 生成外部产品数据
 * 模拟产品定价、消耗、性能指标等数据
 * @param {string} product - 产品名称
 * @param {number} months - 月份数量
 * @returns {Array} 产品数据数组
 */
export const generateExternalProductData = (product: string, months: number = 6) => {
  return Array.from({length: months}, (_, i) => {
    const month = `2023-${String(i+1).padStart(2, '0')}`;
    const basePrice = product === '产品A' ? 0.5 : 0.3;
    const pricePerCall = (basePrice + Math.random() * 0.3).toFixed(2);
    const baseBudget = product === '产品A' ? 10000 + i * 2000 : 8000 + i * 1500;
    const actualCost = baseBudget * (0.8 + Math.random() * 0.4);
    const ksValue = (0.5 + Math.random() * 0.5).toFixed(2);
    const ivValue = (0.1 + Math.random() * 0.3).toFixed(2);
    const psiValue = (0.05 + Math.random() * 0.2).toFixed(2);
    
    return {
      month,
      product,
      budget: baseBudget,
      actual: actualCost,
      pricePerCall,
      actualCost,
      stabilityScore: Math.round(80 + Math.random() * 20),
      valueScore: (3 + Math.random() * 2).toFixed(1),
      budgetAchievement: Math.round(actualCost / baseBudget * 100),
      roi: (1 + Math.random() * 2).toFixed(1),
      ks: ksValue,
      iv: ivValue,
      psi: psiValue,
      valuePerPrice: (Number(ksValue) / Number(pricePerCall)).toFixed(3)
    };
  });
}

/**
 * 模拟燃尽图数据API
 * @param {string} path - 路径: /api/external-data/burndown
 * @param {string} method - 方法: GET
 * @returns {object} 返回: 燃尽图数据
 */
Mock.mock(/\/api\/external-data\/burndown/, 'get', (options) => {
  const url = new URL(options.url, 'http://dummy.com')
  const businessType = url.searchParams.get('businessType') || undefined
  const platform = url.searchParams.get('platform') || undefined
  
  return {
    code: 200,
    data: generateBurndownData({businessType, platform})
  }
})

/**
 * 模拟预算超支预警数据API
 * @param {string} path - 路径: /api/external-data/warning
 * @param {string} method - 方法: GET
 * @returns {object} 返回: 预算超支预警数据
 */
Mock.mock(/\/api\/external-data\/warning/, 'get', (options) => {
  const url = new URL(options.url, 'http://dummy.com')
  const businessType = url.searchParams.get('businessType') || undefined
  const platform = url.searchParams.get('platform') || undefined
  
  return {
    code: 200,
    data: generateWarningData({businessType, platform})
  }
})