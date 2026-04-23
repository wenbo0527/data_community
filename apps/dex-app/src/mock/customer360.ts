/**
 * 客户360 Mock 数据
 * 支持精确搜索和模糊搜索
 */

// 精确搜索 Mock 用户数据
export const mockUsers: Record<string, any> = {
  '887123': {
    userId: '887123',
    basicInfo: {
      name: '张伟',
      status: '正常',
      age: 35,
      gender: '男',
      idCard: '31010119890101****',
      phone: '138****1234',
      registrationDate: '2020-03-15',
      customerLevel: 'VIP'
    },
    totalCredit: 156000,
    usedCredit: 42800,
    creditUtilizationRate: 27.4,
    creditScore: 723,
    creditLevel: 'A',
    creditsList: [
      {
        id: 'CR001',
        reportId: 'RPT20260415001',
        source: '人行征信中心',
        queryDate: '2026-04-15',
        reportType: '人行征信报告',
        status: '正常',
        creditScore: 723,
        creditLevel: 'A',
        notes: ''
      },
      {
        id: 'CR002',
        reportId: 'RPT20260310002',
        source: '人行征信中心',
        queryDate: '2026-03-10',
        reportType: '人行征信报告',
        status: '正常',
        creditScore: 698,
        creditLevel: 'BBB',
        notes: ''
      }
    ],
    creditReports: [
      {
        id: 'CR002',
        reportId: 'RPT20260310002',
        source: '人行征信中心',
        queryDate: '2026-03-10',
        creditScore: 698,
        creditLevel: 'BBB',
        reportStatus: '正常',
        creditOverview: {
          creditCardAccounts: 4,
          loanAccounts: 1,
          totalCreditLimit: 136000,
          usedCredit: 38500,
          creditUtilizationRate: 28.3
        },
        overdueInfo: {
          overdueCount: 1,
          maxOverdueDays: 8,
          overdueAmount: 1500,
          currentOverdueCount: 0
        },
        queryRecords: {
          totalQueryCount: 8,
          queriesLast3Months: 2,
          queryReasons: [
            { reason: '贷款审批', count: 3 },
            { reason: '信用卡审批', count: 2 },
            { reason: '贷后管理', count: 2 },
            { reason: '担保资格审查', count: 1 }
          ]
        },
        specialNotes: [
          { type: 'warning', label: '关注', description: '近3个月有2次硬查询' },
          { type: 'info', label: '正常', description: '无呆账、垫付记录' }
        ],
        accounts: [
          {
            type: 'credit_card',
            bank: '招商银行',
            accountNo: '6225 **** **** 1234',
            openDate: '2019-03-15',
            creditLimit: 50000,
            usedAmount: 12500,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'credit_card',
            bank: '工商银行',
            accountNo: '6222 **** **** 5678',
            openDate: '2018-07-22',
            creditLimit: 30000,
            usedAmount: 8000,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'credit_card',
            bank: '建设银行',
            accountNo: '6217 **** **** 9012',
            openDate: '2021-01-10',
            creditLimit: 20000,
            usedAmount: 12000,
            overdueStatus: '逾期',
            overdueDays: 8
          },
          {
            type: 'credit_card',
            bank: '农业银行',
            accountNo: '6228 **** **** 3456',
            openDate: '2020-05-18',
            creditLimit: 36000,
            usedAmount: 6000,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'loan',
            bank: '中国银行',
            accountNo: '6217 **** **** 7890',
            openDate: '2023-04-20',
            creditLimit: 150000,
            usedAmount: 135000,
            overdueStatus: '正常',
            overdueDays: 0
          }
        ]
      },
      {
        id: 'CR001',
        reportId: 'RPT20260415001',
        source: '人行征信中心',
        queryDate: '2026-04-15',
        creditScore: 723,
        creditLevel: 'A',
        reportStatus: '正常',
        creditOverview: {
          creditCardAccounts: 4,
          loanAccounts: 2,
          totalCreditLimit: 156000,
          usedCredit: 42800,
          creditUtilizationRate: 27.4
        },
        overdueInfo: {
          overdueCount: 2,
          maxOverdueDays: 15,
          overdueAmount: 3200,
          currentOverdueCount: 0
        },
        queryRecords: {
          totalQueryCount: 12,
          queriesLast3Months: 3,
          queryReasons: [
            { reason: '贷款审批', count: 5 },
            { reason: '信用卡审批', count: 4 },
            { reason: '贷后管理', count: 2 },
            { reason: '担保资格审查', count: 1 }
          ]
        },
        specialNotes: [
          { type: 'warning', label: '关注', description: '近3个月有3次硬查询' },
          { type: 'info', label: '正常', description: '无呆账、垫付记录' }
        ],
        accounts: [
          {
            type: 'credit_card',
            bank: '招商银行',
            accountNo: '6225 **** **** 1234',
            openDate: '2019-03-15',
            creditLimit: 50000,
            usedAmount: 12800,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'credit_card',
            bank: '工商银行',
            accountNo: '6222 **** **** 5678',
            openDate: '2018-07-22',
            creditLimit: 30000,
            usedAmount: 8500,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'credit_card',
            bank: '建设银行',
            accountNo: '6217 **** **** 9012',
            openDate: '2021-01-10',
            creditLimit: 20000,
            usedAmount: 15000,
            overdueStatus: '逾期',
            overdueDays: 15
          },
          {
            type: 'credit_card',
            bank: '农业银行',
            accountNo: '6228 **** **** 3456',
            openDate: '2020-05-18',
            creditLimit: 56000,
            usedAmount: 6500,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'loan',
            bank: '中国银行',
            accountNo: '6217 **** **** 7890',
            openDate: '2023-04-20',
            creditLimit: 200000,
            usedAmount: 180000,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'loan',
            bank: '交通银行',
            accountNo: '6222 **** **** 2345',
            openDate: '2024-09-01',
            creditLimit: 50000,
            usedAmount: 12000,
            overdueStatus: '正常',
            overdueDays: 0
          }
        ]
      }
    ],
    collectionRecords: [
      { id: 'COL001', date: '2026-03-15', amount: 5000, status: '已完成' },
      { id: 'COL002', date: '2026-02-20', amount: 3200, status: '已完成' }
    ],
    loanRecords: [
      { id: 'LON001', bank: '中国银行', amount: 200000, balance: 180000, status: '正常' },
      { id: 'LON002', bank: '交通银行', amount: 50000, balance: 12000, status: '正常' }
    ],
    products: [
      {
        productKey: 'CREDIT_SELF_001',
        productName: '个人信用贷款',
        productType: 'self',
        bank: '中国银行',
        amount: 200000,
        balance: 180000,
        interestRate: '4.35%',
        maturityDate: '2030-04-20',
        status: '正常使用'
      },
      {
        productKey: 'CREDIT_SELF_002',
        productName: '消费分期贷款',
        productType: 'self',
        bank: '交通银行',
        amount: 50000,
        balance: 12000,
        interestRate: '5.22%',
        maturityDate: '2027-09-01',
        status: '正常使用'
      }
    ],
    quotaAdjustHistory: [
      { id: 'ADJ001', date: '2026-01-15', before: 150000, after: 200000, reason: '额度提升' }
    ]
  },
  '123': {
    userId: '123',
    basicInfo: {
      name: '李娜',
      status: '正常',
      age: 28,
      gender: '女',
      idCard: '32010119960301****',
      phone: '139****5678',
      registrationDate: '2021-06-20',
      customerLevel: '普通'
    },
    totalCredit: 60000,
    usedCredit: 12000,
    creditUtilizationRate: 20,
    creditScore: 782,
    creditLevel: 'AA',
    creditsList: [
      {
        id: 'CR003',
        reportId: 'RPT20251201003',
        source: '人行征信中心',
        queryDate: '2025-12-01',
        reportType: '人行征信报告',
        status: '正常',
        creditScore: 782,
        creditLevel: 'AA',
        notes: '信用记录优秀'
      }
    ],
    creditReports: [
      {
        id: 'CR002',
        reportId: 'RPT20260310002',
        source: '人行征信中心',
        queryDate: '2026-03-10',
        creditScore: 698,
        creditLevel: 'BBB',
        reportStatus: '正常',
        creditOverview: {
          creditCardAccounts: 4,
          loanAccounts: 1,
          totalCreditLimit: 136000,
          usedCredit: 38500,
          creditUtilizationRate: 28.3
        },
        overdueInfo: {
          overdueCount: 1,
          maxOverdueDays: 8,
          overdueAmount: 1500,
          currentOverdueCount: 0
        },
        queryRecords: {
          totalQueryCount: 8,
          queriesLast3Months: 2,
          queryReasons: [
            { reason: '贷款审批', count: 3 },
            { reason: '信用卡审批', count: 2 },
            { reason: '贷后管理', count: 2 },
            { reason: '担保资格审查', count: 1 }
          ]
        },
        specialNotes: [
          { type: 'warning', label: '关注', description: '近3个月有2次硬查询' },
          { type: 'info', label: '正常', description: '无呆账、垫付记录' }
        ],
        accounts: [
          {
            type: 'credit_card',
            bank: '招商银行',
            accountNo: '6225 **** **** 1234',
            openDate: '2019-03-15',
            creditLimit: 50000,
            usedAmount: 12500,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'credit_card',
            bank: '工商银行',
            accountNo: '6222 **** **** 5678',
            openDate: '2018-07-22',
            creditLimit: 30000,
            usedAmount: 8000,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'credit_card',
            bank: '建设银行',
            accountNo: '6217 **** **** 9012',
            openDate: '2021-01-10',
            creditLimit: 20000,
            usedAmount: 12000,
            overdueStatus: '逾期',
            overdueDays: 8
          },
          {
            type: 'credit_card',
            bank: '农业银行',
            accountNo: '6228 **** **** 3456',
            openDate: '2020-05-18',
            creditLimit: 36000,
            usedAmount: 6000,
            overdueStatus: '正常',
            overdueDays: 0
          },
          {
            type: 'loan',
            bank: '中国银行',
            accountNo: '6217 **** **** 7890',
            openDate: '2023-04-20',
            creditLimit: 150000,
            usedAmount: 135000,
            overdueStatus: '正常',
            overdueDays: 0
          }
        ]
      },],
    collectionRecords: [],
    loanRecords: [],
    quotaAdjustHistory: []
  }
}

// 模糊搜索 Mock 结果
export const fuzzySearchResults: Record<string, any[]> = {
  '张伟': [
    { userId: '887123', name: '张伟', idCardTail: '0101', age: 35, gender: '男', customerLevel: 'VIP' },
    { userId: '887456', name: '张伟', idCardTail: '2233', age: 42, gender: '男', customerLevel: '普通' }
  ],
  '李娜': [
    { userId: '123', name: '李娜', idCardTail: '0301', age: 28, gender: '女', customerLevel: '普通' },
    { userId: '456', name: '李娜', idCardTail: '1122', age: 31, gender: '女', customerLevel: '白银' }
  ]
}

/**
 * 获取用户信息
 * @param userId 用户ID
 */
export async function fetchUserInfo(userId: string): Promise<any> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  console.log('[MOCK] fetchUserInfo 被调用, userId:', userId)
  console.log('[MOCK] mockUsers 所有 key:', Object.keys(mockUsers))
  console.log('[MOCK] mockUsers[userId]:', mockUsers[userId])
  
  const user = mockUsers[userId]
  if (user) {
    console.log('[MOCK] 找到用户, 返回数据')
    return { ...user }
  }
  
  console.log('[MOCK] 未找到用户, 返回 error')
  return {
    error: true,
    errorType: 'USER_NOT_FOUND',
    message: '未找到该用户信息',
    userId
  }
}

/**
 * 模糊搜索用户
 * @param name 姓名
 * @param idCardTail 身份证后6位
 */
export async function fuzzySearch(name: string, idCardTail: string): Promise<any[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // 精确匹配
  const key = name
  const results = fuzzySearchResults[key] || []
  
  if (idCardTail) {
    return results.filter(r => r.idCardTail === idCardTail)
  }
  
  return results
}

export { mockUsers as customer360 }