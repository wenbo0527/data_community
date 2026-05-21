/**
 * 征信报告详情 Mock 数据
 * 基于人行征信报告标准格式
 * 对应 PRD: 2026-05-08-PRD-客户360征信信息查询
 */

// ============================================
// 接口定义
// ============================================

export interface CreditReportFull {
  // 报告基本信息
  reportInfo: {
    reportGenerateTime: string  // 报告生成时间 YYYY-MM-DD HH:mm:ss
    reportId: string
    queryTime: string
  }
  // 身份信息
  identityInfo: IdentityInfo
  // 配偶信息
  spouseInfo: SpouseInfo | null
  // 居住信息
  residenceInfo: ResidenceInfo[]
  // 职业信息
  occupationInfo: OccupationInfo | null
  // 信息摘要
  creditSummary: CreditSummary
}

export interface IdentityInfo {
  name: string            // 姓名（掩码）
  idCard: string          // 身份证号（掩码）
  birthDate: string       // 出生日期
  maritalStatus: string   // 婚姻状态
  education: string       // 学历
  degree: string          // 学位
  employmentStatus: string // 就业状态
  nationality: string     // 国籍
  email: string           // 电子邮箱
  postalAddress: string   // 通讯地址（掩码）
  householdAddress: string // 户籍地址（掩码）
  phone: string           // 手机号码（掩码）
  phoneUpdateDate: string // 信息更新日期
}

export interface SpouseInfo {
  name: string
  idType: string
  idNumber: string        // 掩码
  employer: string
  phone: string           // 掩码
}

export interface ResidenceInfo {
  condition: string       // 状况
  address: string         // 掩码
  homePhone: string       // 掩码
  updateDate: string
}

export interface OccupationInfo {
  employer: string        // 掩码（全掩码）
  employerType: string    // 单位性质
  employmentStatus: string // 就业状况
  employerAddress: string  // 掩码
  employerPhone: string    // 掩码
  occupation: string      // 职业
  industry: string        // 行业
  jobTitle: string         // 职务
  professionalTitle: string // 职称
  joinYear: string        // 进入本单位年份
  updateDate: string
}

// 信息摘要
export interface CreditSummary {
  // 信贷交易信息提示
  loanTransactionSummary: LoanTransactionSummary[]
  // 信贷交易违约信息摘要
  overdueSummary: OverdueSummary[]
  // 信贷交易授信及负债信息摘要
  creditLiabilitySummary: CreditLiabilitySummary
}

export interface LoanTransactionSummary {
  businessType: string    // 业务类型
  accountCount: number    // 账户数
  firstLoanMonth: string  // 首笔业务发放月份
  total: string           // 合计
}

export interface OverdueSummary {
  accountType: string     // 账户类型
  accountCount: number
  monthCount: number      // 月份数
  maxOverdueAmount: number // 单月最高逾期/透支总额
  maxOverdueMonths: number // 最长逾期/透支月数
}

export interface CreditLiabilitySummary {
  // 非循环贷账户
  nonRevolvingLoans: {
    institutionCount: number
    accountCount: number
    totalCreditLimit: number
    balance: number
    avgPayment6M: number
  }
  // 循环贷账户
  revolvingLoans: {
    institutionCount: number
    accountCount: number
    totalCreditLimit: number
    balance: number
    avgPayment6M: number
  }
  // 贷记卡账户
  creditCards: {
    issuerCount: number
    accountCount: number
    totalCreditLimit: number
    maxCreditSingleBank: number
    minCreditSingleBank: number
    usedAmount: number
    avgUsed6M: number
  }
}

// ============================================
// Mock 数据
// ============================================

export const mockCreditReportFull: CreditReportFull = {
  reportInfo: {
    reportGenerateTime: '2026-05-08 14:30:25',
    reportId: 'RPT20260508001',
    queryTime: '2026-05-08 14:30:20'
  },

  identityInfo: {
    name: '张**',
    idCard: '411************1212',
    birthDate: '1988-06-15',
    maritalStatus: '已婚',
    education: '本科',
    degree: '学士',
    employmentStatus: '在职',
    nationality: '中国',
    email: 'zhang**@example.com',
    postalAddress: '河北省石家庄市裕华区裕东街道******',
    householdAddress: '河南省郑州市中原区棉纺路街道******',
    phone: '181*******1212',
    phoneUpdateDate: '2026-03-15'
  },

  spouseInfo: {
    name: '李**',
    idType: '居民身份证',
    idNumber: '411************3434',
    employer: '某科技有限公司',
    phone: '138*******5678'
  },

  residenceInfo: [
    {
      condition: '自购商品房',
      address: '广东省深圳市南山区科技园街道******',
      homePhone: '0755*******234',
      updateDate: '2026-02-20'
    },
    {
      condition: '租赁',
      address: '广东省深圳市福田区华强北街道******',
      homePhone: '无',
      updateDate: '2025-11-10'
    }
  ],

  occupationInfo: {
    employer: '********',
    employerType: '民营企业',
    employmentStatus: '在职',
    employerAddress: '********',
    employerPhone: '0755*******789',
    occupation: '软件工程师',
    industry: '信息技术',
    jobTitle: '高级工程师',
    professionalTitle: '中级',
    joinYear: '2019',
    updateDate: '2026-04-01'
  },

  creditSummary: {
    loanTransactionSummary: [
      { businessType: '个人住房贷款', accountCount: 1, firstLoanMonth: '2021-03', total: '1笔' },
      { businessType: '个人消费贷款', accountCount: 2, firstLoanMonth: '2023-06', total: '2笔' },
      { businessType: '信用卡', accountCount: 4, firstLoanMonth: '2018-09', total: '4笔' }
    ],
    overdueSummary: [
      {
        accountType: '贷款账户',
        accountCount: 1,
        monthCount: 2,
        maxOverdueAmount: 3500,
        maxOverdueMonths: 15
      },
      {
        accountType: '贷记卡账户',
        accountCount: 1,
        monthCount: 1,
        maxOverdueAmount: 800,
        maxOverdueMonths: 5
      }
    ],
    creditLiabilitySummary: {
      nonRevolvingLoans: {
        institutionCount: 1,
        accountCount: 1,
        totalCreditLimit: 1200000,
        balance: 980000,
        avgPayment6M: 8500
      },
      revolvingLoans: {
        institutionCount: 2,
        accountCount: 2,
        totalCreditLimit: 80000,
        balance: 42000,
        avgPayment6M: 2800
      },
      creditCards: {
        issuerCount: 4,
        accountCount: 4,
        totalCreditLimit: 156000,
        maxCreditSingleBank: 50000,
        minCreditSingleBank: 15000,
        usedAmount: 42800,
        avgUsed6M: 38500
      }
    }
  }
}

// ============================================
// API 函数
// ============================================

export function fetchCreditReportFull(userId: string): Promise<CreditReportFull> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCreditReportFull)
    }, 300)
  })
}
