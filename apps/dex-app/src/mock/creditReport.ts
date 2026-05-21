/**
 * 征信报告 Mock 数据
 * 基于人行征信报告标准格式
 */

// 信用评分范围：350-850
// 等级：AAA(800+), AA(750-799), A(700-749), BBB(650-699), BB(600-649), B(550-599), CCC(<550)

export interface CreditReport {
  id: string
  reportId: string
  source: string
  queryDate: string
  creditScore: number
  creditLevel: string
  reportStatus: '正常' | '关注' | '异常'
  // 信贷概况
  creditOverview: {
    creditCardAccounts: number
    loanAccounts: number
    totalCreditLimit: number
    usedCredit: number
    creditUtilizationRate: number
  }
  // 逾期信息
  overdueInfo: {
    overdueCount: number
    maxOverdueDays: number
    overdueAmount: number
    currentOverdueCount: number
  }
  // 查询记录
  queryRecords: {
    totalQueryCount: number
    queriesLast3Months: number
    queryReasons: { reason: string; count: number }[]
  }
  // 特殊标注
  specialNotes: {
    type: 'warning' | 'danger' | 'info'
    label: string
    description: string
  }[]
  // 详细账户列表
  accounts: {
    type: 'credit_card' | 'loan'
    bank: string
    accountNo: string
    openDate: string
    creditLimit: number
    usedAmount: number
    overdueStatus: '正常' | '逾期' | '呆账'
    overdueDays: number
  }[]
}

export interface CreditNote {
  id: string
  reportId: string
  content: string
  creator: string
  createTime: string
  updateTime: string
}

// 模拟征信报告数据
export const mockCreditReports: CreditReport[] = [
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
  },
  {
    id: 'CR002',
    reportId: 'RPT20260310002',
    source: '人行征信中心',
    queryDate: '2026-03-10',
    creditScore: 698,
    creditLevel: 'BBB',
    reportStatus: '正常',
    creditOverview: {
      creditCardAccounts: 3,
      loanAccounts: 1,
      totalCreditLimit: 120000,
      usedCredit: 38500,
      creditUtilizationRate: 32.1
    },
    overdueInfo: {
      overdueCount: 1,
      maxOverdueDays: 8,
      overdueAmount: 1200,
      currentOverdueCount: 0
    },
    queryRecords: {
      totalQueryCount: 8,
      queriesLast3Months: 2,
      queryReasons: [
        { reason: '贷款审批', count: 3 },
        { reason: '信用卡审批', count: 3 },
        { reason: '贷后管理', count: 2 }
      ]
    },
    specialNotes: [
      { type: 'info', label: '正常', description: '信贷记录良好' }
    ],
    accounts: [
      {
        type: 'credit_card',
        bank: '招商银行',
        accountNo: '6225 **** **** 1234',
        openDate: '2019-03-15',
        creditLimit: 50000,
        usedAmount: 12000,
        overdueStatus: '正常',
        overdueDays: 0
      },
      {
        type: 'credit_card',
        bank: '工商银行',
        accountNo: '6222 **** **** 5678',
        openDate: '2020-11-08',
        creditLimit: 25000,
        usedAmount: 8500,
        overdueStatus: '正常',
        overdueDays: 0
      },
      {
        type: 'credit_card',
        bank: '浦发银行',
        accountNo: '6225 **** **** 7890',
        openDate: '2022-06-15',
        creditLimit: 45000,
        usedAmount: 18000,
        overdueStatus: '逾期',
        overdueDays: 8
      },
      {
        type: 'loan',
        bank: '中国银行',
        accountNo: '6217 **** **** 7890',
        openDate: '2023-04-20',
        creditLimit: 150000,
        usedAmount: 150000,
        overdueStatus: '正常',
        overdueDays: 0
      }
    ]
  },
  {
    id: 'CR003',
    reportId: 'RPT20251201003',
    source: '人行征信中心',
    queryDate: '2025-12-01',
    creditScore: 782,
    creditLevel: 'AA',
    reportStatus: '正常',
    creditOverview: {
      creditCardAccounts: 2,
      loanAccounts: 0,
      totalCreditLimit: 60000,
      usedCredit: 12000,
      creditUtilizationRate: 20.0
    },
    overdueInfo: {
      overdueCount: 0,
      maxOverdueDays: 0,
      overdueAmount: 0,
      currentOverdueCount: 0
    },
    queryRecords: {
      totalQueryCount: 4,
      queriesLast3Months: 1,
      queryReasons: [
        { reason: '信用卡审批', count: 2 },
        { reason: '贷后管理', count: 2 }
      ]
    },
    specialNotes: [
      { type: 'info', label: '优质', description: '信用记录优秀，无任何逾期' }
    ],
    accounts: [
      {
        type: 'credit_card',
        bank: '招商银行',
        accountNo: '6225 **** **** 1234',
        openDate: '2019-03-15',
        creditLimit: 40000,
        usedAmount: 8000,
        overdueStatus: '正常',
        overdueDays: 0
      },
      {
        type: 'credit_card',
        bank: '工商银行',
        accountNo: '6222 **** **** 5678',
        openDate: '2020-09-12',
        creditLimit: 20000,
        usedAmount: 4000,
        overdueStatus: '正常',
        overdueDays: 0
      }
    ]
  }
]

// 模拟备注数据
export const mockCreditNotes: CreditNote[] = [
  {
    id: 'NOTE001',
    reportId: 'CR001',
    content: '该客户信用卡使用率偏高，建议持续关注',
    creator: '张三',
    createTime: '2026-04-16 10:30:00',
    updateTime: '2026-04-16 10:30:00'
  },
  {
    id: 'NOTE002',
    reportId: 'CR001',
    content: '曾有一次短期逾期，已在次月全额还款，认定为非恶意逾期',
    creator: '李四',
    createTime: '2026-04-17 14:20:00',
    updateTime: '2026-04-17 14:20:00'
  }
]

// 模拟 API 请求
export function fetchCreditReports(userId: string): Promise<CreditReport[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCreditReports)
    }, 300)
  })
}

export function fetchCreditReportById(reportId: string): Promise<CreditReport | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCreditReports.find(r => r.reportId === reportId))
    }, 200)
  })
}

export function fetchCreditNotes(reportId: string): Promise<CreditNote[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCreditNotes.filter(n => n.reportId === reportId))
    }, 150)
  })
}

export function addCreditNote(reportId: string, content: string): Promise<CreditNote> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newNote: CreditNote = {
        id: `NOTE${Date.now()}`,
        reportId,
        content,
        creator: '当前用户',
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN')
      }
      mockCreditNotes.push(newNote)
      resolve(newNote)
    }, 200)
  })
}

export function deleteCreditNote(noteId: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockCreditNotes.findIndex(n => n.id === noteId)
      if (index > -1) {
        mockCreditNotes.splice(index, 1)
        resolve(true)
      } else {
        resolve(false)
      }
    }, 150)
  })
}
