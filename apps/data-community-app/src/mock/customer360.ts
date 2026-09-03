/**
 * 客户360 Mock 数据
 * 支持精确搜索和模糊搜索
 * v3.3+: 包含完整 creditApplications / loanProducts 关系映射
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
      customerLevel: 'VIP',
      customerNo: 'C887123',
      domicile: '上海',
      idCardExpiry: '2030-01-01',
      thirdPartyCustomerId: 'EXT-887123-CUST'
    },
    domicile: '上海',
    idCardExpiry: '2030-01-01',
    totalCredit: 156000,
    usedCredit: 42800,
    creditUtilizationRate: 27.4,
    creditScore: 723,
    creditLevel: 'BBB',
    creditsList: [
      {
        id: 'CR001',
        reportId: 'RPT20250801001',
        source: '人行征信中心',
        queryDate: '2025-08-01',
        reportType: '人行征信报告',
        reportStatus: '正常',
        creditScore: 723,
        creditLevel: 'BBB',
        creditOverview: {
          totalCreditLimit: 156000,
          usedCredit: 42800,
          creditUtilizationRate: 27.4
        },
        notes: '信用记录良好,有1次短期逾期'
      },
      {
        id: 'CR002',
        reportId: 'RPT20251215002',
        source: '百行征信',
        queryDate: '2025-12-15',
        reportType: '百行征信报告',
        reportStatus: '正常',
        creditScore: 718,
        creditLevel: 'BBB',
        creditOverview: {
          totalCreditLimit: 156000,
          usedCredit: 42800,
          creditUtilizationRate: 27.4
        },
        notes: '近6个月查询次数较多'
      }
    ],
    collectionRecords: [
      {
        id: 'COL001',
        collectionNo: 'CN20260701001',
        startDate: '2026-07-01',
        endDate: null,
        type: '电话催收',
        target: '本人',
        reason: '借款2(LP-SUJS0001-002)逾期12天',
        executor: '催收员A组·王强',
        result: '已联系客户,承诺3日内还款',
        status: '处理中'
      }
    ],
    paymentProcessRecords: [
      { id: 'PAY001', type: '主动还款', amount: 5000, method: '微信支付', date: '2026-07-25', status: '成功' }
    ],
    quotaAdjustHistory: [
      { id: 'QA001', type: '提额', productName: '全资', before: 100000, after: 200000, reason: '信用良好', date: '2024-09-01' }
    ],
    loanRecords: [
      {
        id: 'LON001',
        loanNo: 'LN20240315001',
        thirdPartyCustomerId: 'EXT-887123-LON001',
        loanDate: '2024-03-15',
        channel: 'APP',
        bankCardNo: '****1234',
        productName: '全资',
        productKey: 'CREDIT_SELF_001',
        creditProductId: 'GRX0001',
        creditApplicationId: 'CA-2024-001',
        loanProductId: 'LP-GRX0001-001',
        loanProductName: '个人信用贷款-借款1',
        result: '成功',
        rejectReason: null,
        iouNo: 'IOU-2024-0315-001',
        thirdPartyIouNo: 'TPI-2024-0315-001',
        iouStatus: '正常',
        contractNo: 'CON-2024-001-CS001',
        status: '正常',
        amount: 200000,
        balance: 180000,
        installments: 36,
        overdueDays: 0,
        maxOverdueDays: 5,
        settlementDate: null,
        currentPeriod: 15,
        remainingPrincipal: 150000,
        remainingInterest: 3200,
        remainingPenalty: 0,
        remainingTotal: 153200,
        interestRate: 4.35
      },
      {
        id: 'LON002',
        loanNo: 'LN20240901002',
        thirdPartyCustomerId: 'EXT-887123-LON002',
        loanDate: '2024-09-01',
        channel: 'APP',
        bankCardNo: '****5678',
        productName: '全资',
        productKey: 'CREDIT_SELF_002',
        creditProductId: 'XFFQ0001',
        creditApplicationId: 'CA-2024-002',
        loanProductId: 'LP-XFFQ0001-001',
        loanProductName: '消费分期-借款1',
        result: '成功',
        rejectReason: null,
        iouNo: 'IOU-2024-0901-002',
        thirdPartyIouNo: 'TPI-2024-0901-002',
        iouStatus: '正常',
        contractNo: 'CON-2024-009-CS002',
        status: '正常',
        amount: 50000,
        balance: 12000,
        installments: 24,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 8,
        remainingPrincipal: 10000,
        remainingInterest: 800,
        remainingPenalty: 0,
        remainingTotal: 10800,
        interestRate: 5.22
      },
      {
        id: 'LON003',
        loanNo: 'LN20240115003',
        thirdPartyCustomerId: 'EXT-887123-LON003',
        loanDate: '2024-01-15',
        channel: 'H5',
        bankCardNo: '****9012',
        productName: '联合贷',
        productKey: 'LN-2024-009',
        creditProductId: 'BYD0001',
        creditApplicationId: 'CA-2024-003',
        loanProductId: 'LP-BYD0001-001',
        loanProductName: '联合贷极速版-借款1',
        result: '成功',
        rejectReason: null,
        iouNo: 'IOU-2024-0115-003',
        thirdPartyIouNo: 'TPI-2024-0115-003',
        iouStatus: '正常',
        contractNo: 'CON-2024-001-LN009',
        status: '正常',
        amount: 100000,
        balance: 50000,
        installments: 36,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 18,
        remainingPrincipal: 50000,
        remainingInterest: 1800,
        remainingPenalty: 0,
        remainingTotal: 51800,
        interestRate: 3.9
      },
      {
        id: 'LON004',
        loanNo: 'LN20240610004',
        thirdPartyCustomerId: 'EXT-887123-LON004',
        loanDate: '2024-06-10',
        channel: 'APP',
        bankCardNo: '****3456',
        productName: '联合贷',
        productKey: 'LN-2024-009',
        creditProductId: 'BYD0001',
        creditApplicationId: 'CA-2024-003',
        loanProductId: 'LP-BYD0001-002',
        loanProductName: '联合贷极速版-借款2',
        result: '成功',
        rejectReason: null,
        iouNo: 'IOU-2024-0610-004',
        thirdPartyIouNo: 'TPI-2024-0610-004',
        iouStatus: '已结清',
        contractNo: 'CON-2024-006-LN010',
        status: '结清',
        amount: 100000,
        balance: 0,
        installments: 18,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: '2025-12-10',
        currentPeriod: 18,
        remainingPrincipal: 0,
        remainingInterest: 0,
        remainingPenalty: 0,
        remainingTotal: 0,
        interestRate: 3.9
      },
      {
        id: 'LON005',
        loanNo: 'LN20260520005',
        thirdPartyCustomerId: 'EXT-887123-LON005',
        loanDate: '2026-05-20',
        channel: 'H5',
        bankCardNo: '****7890',
        productName: '联合贷',
        productKey: 'LN-2024-009',
        creditProductId: 'BYD0001',
        creditApplicationId: 'CA-2024-003',
        loanProductId: 'LP-BYD0001-003',
        loanProductName: '联合贷极速版-借款3',
        result: '成功',
        rejectReason: null,
        iouNo: 'IOU-2026-0520-005',
        thirdPartyIouNo: 'TPI-2026-0520-005',
        iouStatus: '逾期',
        contractNo: 'CON-2026-005-LN011',
        status: '逾期',
        amount: 80000,
        balance: 60000,
        installments: 24,
        overdueDays: 5,
        maxOverdueDays: 5,
        settlementDate: null,
        currentPeriod: 3,
        remainingPrincipal: 60000,
        remainingInterest: 1400,
        remainingPenalty: 50,
        remainingTotal: 61450,
        interestRate: 4.1
      },
      {
        id: 'LON006',
        loanNo: 'LN20260110006',
        thirdPartyCustomerId: 'EXT-887123-LON006',
        loanDate: '2026-01-10',
        channel: 'APP',
        bankCardNo: '****2345',
        productName: 'Su贷-极速版',
        productKey: 'SU-2026-001',
        creditProductId: 'SUJS0001',
        creditApplicationId: 'CA-2026-001',
        loanProductId: 'LP-SUJS0001-001',
        loanProductName: 'Su贷极速版-借款1',
        result: '成功',
        rejectReason: null,
        iouNo: 'IOU-2026-0110-006',
        thirdPartyIouNo: 'TPI-2026-0110-006',
        iouStatus: '正常',
        contractNo: 'CON-2026-001-SU001',
        status: '正常',
        amount: 100000,
        balance: 60000,
        installments: 12,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 7,
        remainingPrincipal: 60000,
        remainingInterest: 4500,
        remainingPenalty: 0,
        remainingTotal: 64500,
        interestRate: 7.2
      },
      {
        id: 'LON007',
        loanNo: 'LN20260315007',
        thirdPartyCustomerId: 'EXT-887123-LON007',
        loanDate: '2026-03-15',
        channel: 'APP',
        productName: 'Su贷-极速版',
        productKey: 'SU-2026-001',
        creditProductId: 'SUJS0001',
        creditApplicationId: 'CA-2026-001',
        loanProductId: 'LP-SUJS0001-002',
        loanProductName: 'Su贷极速版-借款2',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2026-003-SU002',
        status: '逾期',
        amount: 80000,
        balance: 25500,
        installments: 12,
        overdueDays: 12,
        maxOverdueDays: 12,
        settlementDate: null,
        currentPeriod: 5,
        remainingPrincipal: 25000,
        remainingInterest: 500,
        remainingPenalty: 200,
        remainingTotal: 25700,
        interestRate: 7.2
      },
      {
        id: 'LON008',
        loanNo: 'LN20260420008',
        thirdPartyCustomerId: 'EXT-887123-LON008',
        loanDate: '2026-04-20',
        channel: 'APP',
        productName: 'Su贷-极速版',
        productKey: 'SU-2026-001',
        creditProductId: 'SUJS0001',
        creditApplicationId: 'CA-2026-001',
        loanProductId: 'LP-SUJS0001-003',
        loanProductName: 'Su贷极速版-借款3',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2026-004-SU003',
        status: '结清',
        amount: 70000,
        balance: 0,
        installments: 6,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: '2026-07-20',
        currentPeriod: 6,
        remainingPrincipal: 0,
        remainingInterest: 0,
        remainingPenalty: 0,
        remainingTotal: 0,
        interestRate: 7.2
      },
      {
        id: 'LON009',
        loanNo: 'LN20260701009',
        thirdPartyCustomerId: 'EXT-887123-LON009',
        loanDate: '2026-07-01',
        channel: 'APP',
        productName: 'Su贷-极速版',
        productKey: 'SU-2026-001',
        creditProductId: 'SUJS0001',
        creditApplicationId: 'CA-2026-001',
        loanProductId: 'LP-SUJS0001-004',
        loanProductName: 'Su贷极速版-借款4(短期)',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2026-007-SU004',
        status: '正常',
        amount: 50000,
        balance: 30000,
        installments: 3,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 1,
        remainingPrincipal: 30000,
        remainingInterest: 1500,
        remainingPenalty: 0,
        remainingTotal: 31500,
        interestRate: 9.5
      },
      {
        id: 'LON010',
        loanNo: 'LN20260425010',
        thirdPartyCustomerId: 'EXT-887123-LON010',
        loanDate: '2026-04-25',
        channel: 'APP',
        productName: '信用卡',
        productKey: 'CC-2020-001',
        creditProductId: 'CC2020101',
        creditApplicationId: 'CA-2020-101',
        loanProductId: 'LP-CC-2020-001',
        loanProductName: '信用卡账单1-分期',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2026-004-CC001',
        status: '正常',
        amount: 12800,
        balance: 6400,
        installments: 3,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 2,
        remainingPrincipal: 6400,
        remainingInterest: 200,
        remainingPenalty: 0,
        remainingTotal: 6600,
        interestRate: 0.06
      },
      {
        id: 'LON011',
        loanNo: 'LN20260715011',
        thirdPartyCustomerId: 'EXT-887123-LON011',
        loanDate: '2026-07-15',
        channel: 'APP',
        productName: '信用卡',
        productKey: 'CC-2020-001',
        creditProductId: 'CC2020101',
        creditApplicationId: 'CA-2020-101',
        loanProductId: 'LP-CC-2020-002',
        loanProductName: '信用卡账单2-分期',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2026-007-CC002',
        status: '正常',
        amount: 9800,
        balance: 9800,
        installments: 3,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 1,
        remainingPrincipal: 9800,
        remainingInterest: 50,
        remainingPenalty: 0,
        remainingTotal: 9850,
        interestRate: 0.06
      }
    ],
    products: [
      {
        productKey: 'CREDIT_SELF_001',
        productName: '全资',
        productCode: 'P004',
        productType: 'self',
        bank: '中国银行',
        amount: 200000,
        balance: 180000,
        interestRate: '4.35%',
        maturityDate: '2030-04-20',
        status: '正常使用',
        creditTime: '2023-04-20',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-CREDIT-SELF-001',
        creditProductId: 'GRX0001'
      },
      {
        productKey: 'CREDIT_SELF_002',
        productName: '全资',
        productCode: 'P005',
        productType: 'self',
        bank: '交通银行',
        amount: 50000,
        balance: 12000,
        interestRate: '5.22%',
        maturityDate: '2027-09-01',
        status: '正常使用',
        creditTime: '2024-09-01',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-CREDIT-SELF-002',
        creditProductId: 'XFFQ0001'
      },
      {
        productKey: 'LN-2024-009',
        productName: '联合贷',
        productCode: 'P001',
        productType: 'loan',
        amount: 2e5,
        rate: 3.9,
        startDate: '2024-01-15',
        creditTime: '2026-05-25',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-LN-2024-009',
        creditProductId: 'BYD0001'
      },
      {
        productKey: 'LN-2024-010',
        productName: '联合贷',
        productCode: 'P001',
        productType: 'loan',
        amount: 100000,
        rate: 4.1,
        startDate: '2025-03-10',
        creditTime: '2026-05-20',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-LN-2024-010',
        creditProductId: 'BYD0002'
      },
      {
        productKey: 'SU-2026-001',
        productName: 'Su贷-极速版',
        productCode: 'P010',
        productType: 'sudai',
        amount: 250000,
        balance: 85500,
        rate: 7.2,
        interestRate: '7.20%',
        startDate: '2026-01-10',
        creditTime: '2026-01-10',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-SU-2026-001',
        creditProductId: 'SUJS0001',
        bank: 'XX银行(自营)',
        maturityDate: '2027-01-10'
      },
      {
        productKey: 'SU-2026-002',
        productName: 'Su贷-标准版',
        productCode: 'P011',
        productType: 'sudai',
        amount: 80000,
        balance: 0,
        rate: 8.9,
        interestRate: '8.90%',
        startDate: '2026-04-15',
        creditTime: '2026-04-15',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-SU-2026-002',
        creditProductId: 'SUBZ0001',
        bank: 'XX银行(自营)',
        maturityDate: '2027-04-15'
      }
    ],
    creditApplications: [
      { creditApplicationId: 'CA-2024-001', productKey: 'CREDIT_SELF_001', creditProductId: 'GRX0001', appliedAt: '2024-03-15T10:20:00Z', approvedBy: '风控组 · 张三', status: '生效' },
      { creditApplicationId: 'CA-2024-002', productKey: 'CREDIT_SELF_002', creditProductId: 'XFFQ0001', appliedAt: '2024-09-01T14:30:00Z', approvedBy: '风控组 · 李四', status: '生效' },
      { creditApplicationId: 'CA-2024-003', productKey: 'LN-2024-009', creditProductId: 'BYD0001', appliedAt: '2024-01-15T09:00:00Z', approvedBy: '风控组 · 王五', status: '生效' },
      { creditApplicationId: 'CA-2024-004', productKey: 'LN-2024-009', creditProductId: 'BYD0002', appliedAt: '2025-03-10T11:15:00Z', approvedBy: '风控组 · 赵六', status: '生效' },
      { creditApplicationId: 'CA-2026-001', productKey: 'SU-2026-001', creditProductId: 'SUJS0001', appliedAt: '2026-01-10T10:20:00Z', approvedBy: '系统自动审批', status: '生效' },
      { creditApplicationId: 'CA-2026-002', productKey: 'SU-2026-001', creditProductId: 'SUBZ0001', appliedAt: '2026-04-15T14:30:00Z', approvedBy: '系统自动审批', status: '生效' },
      { creditApplicationId: 'CA-2020-101', productKey: 'CC-2020-001', creditProductId: 'CC2020101', appliedAt: '2020-05-01T11:00:00Z', approvedBy: '风控组 · 孙七', status: '生效' }
    ],
    loanProducts: [
      { loanProductId: 'LP-GRX0001-001', loanProductName: '个人信用贷款-借款1', creditProductId: 'GRX0001', creditApplicationId: 'CA-2024-001', createdAt: '2024-03-20T09:30:00Z' },
      { loanProductId: 'LP-XFFQ0001-001', loanProductName: '消费分期-借款1', creditProductId: 'XFFQ0001', creditApplicationId: 'CA-2024-002', createdAt: '2024-09-05T10:00:00Z' },
      { loanProductId: 'LP-BYD0001-001', loanProductName: '联合贷极速版-借款1', creditProductId: 'BYD0001', creditApplicationId: 'CA-2024-003', createdAt: '2024-01-20T10:00:00Z' },
      { loanProductId: 'LP-BYD0001-002', loanProductName: '联合贷极速版-借款2', creditProductId: 'BYD0001', creditApplicationId: 'CA-2024-003', createdAt: '2024-04-15T11:00:00Z' },
      { loanProductId: 'LP-BYD0001-003', loanProductName: '联合贷极速版-借款3', creditProductId: 'BYD0001', creditApplicationId: 'CA-2024-003', createdAt: '2026-05-25T10:00:00Z' },
      { loanProductId: 'LP-SUJS0001-001', loanProductName: 'Su贷极速版-借款1', creditProductId: 'SUJS0001', creditApplicationId: 'CA-2026-001', createdAt: '2026-01-15T10:00:00Z' },
      { loanProductId: 'LP-SUJS0001-002', loanProductName: 'Su贷极速版-借款2', creditProductId: 'SUJS0001', creditApplicationId: 'CA-2026-001', createdAt: '2026-03-20T11:00:00Z' },
      { loanProductId: 'LP-SUJS0001-003', loanProductName: 'Su贷极速版-借款3', creditProductId: 'SUJS0001', creditApplicationId: 'CA-2026-001', createdAt: '2026-04-25T10:00:00Z' },
      { loanProductId: 'LP-SUJS0001-004', loanProductName: 'Su贷极速版-借款4(短期)', creditProductId: 'SUJS0001', creditApplicationId: 'CA-2026-001', createdAt: '2026-07-05T10:00:00Z' },
      { loanProductId: 'LP-CC-2020-001', loanProductName: '信用卡账单1-分期', creditProductId: 'CC2020101', creditApplicationId: 'CA-2020-101', createdAt: '2026-04-28T10:00:00Z' },
      { loanProductId: 'LP-CC-2020-002', loanProductName: '信用卡账单2-分期', creditProductId: 'CC2020101', creditApplicationId: 'CA-2020-101', createdAt: '2026-07-18T10:00:00Z' }
    ]
  },
  '887456': {
    userId: '887456',
    basicInfo: {
      name: '张伟',
      status: '正常',
      age: 42,
      gender: '男',
      idCard: '32010119820615****',
      phone: '139****2233',
      registrationDate: '2018-09-20',
      customerLevel: '普通',
      customerNo: 'C887456',
      domicile: '南京',
      idCardExpiry: '2028-06-15',
      thirdPartyCustomerId: 'EXT-887456-CUST'
    },
    domicile: '南京',
    idCardExpiry: '2028-06-15',
    totalCredit: 80000,
    usedCredit: 24000,
    creditUtilizationRate: 30,
    creditScore: 685,
    creditLevel: 'BB',
    creditsList: [
      {
        id: 'CR101',
        reportId: 'RPT20250920101',
        source: '人行征信中心',
        queryDate: '2025-09-20',
        reportType: '人行征信报告',
        reportStatus: '正常',
        creditScore: 685,
        creditLevel: 'BB',
        creditOverview: {
          totalCreditLimit: 80000,
          usedCredit: 24000,
          creditUtilizationRate: 30
        },
        notes: '征信记录一般,有3次短期逾期'
      }
    ],
    collectionRecords: [],
    paymentProcessRecords: [],
    quotaAdjustHistory: [],
    loanRecords: [
      {
        id: 'LON201',
        loanNo: 'LN20240510201',
        thirdPartyCustomerId: 'EXT-887456-LON201',
        loanDate: '2024-05-10',
        channel: 'APP',
        productName: '联合贷',
        productKey: 'LN-2024-100',
        creditProductId: 'NJCS0001',
        creditApplicationId: 'CA-2024-100',
        loanProductId: 'LP-NJCS0001-001',
        loanProductName: '联合贷标准版-借款1',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2024-005-LN100',
        status: '正常',
        amount: 50000,
        balance: 25000,
        installments: 24,
        overdueDays: 0,
        maxOverdueDays: 3,
        settlementDate: null,
        currentPeriod: 14,
        remainingPrincipal: 25000,
        remainingInterest: 750,
        remainingPenalty: 0,
        remainingTotal: 25750,
        interestRate: 5.0
      },
      {
        id: 'LON202',
        loanNo: 'LN20250215202',
        thirdPartyCustomerId: 'EXT-887456-LON202',
        loanDate: '2025-02-15',
        channel: 'H5',
        productName: '信用卡',
        productKey: 'CC-2021-002',
        creditProductId: 'CC2021156',
        creditApplicationId: 'CA-2021-156',
        loanProductId: 'LP-CC-2021-001',
        loanProductName: '信用卡账单1-分期',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2025-002-CC156',
        status: '正常',
        amount: 24000,
        balance: 6000,
        installments: 12,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 9,
        remainingPrincipal: 6000,
        remainingInterest: 150,
        remainingPenalty: 0,
        remainingTotal: 6150,
        interestRate: 0.06
      }
    ],
    products: [
      {
        productKey: 'LN-2024-100',
        productName: '联合贷',
        productCode: 'P003',
        productType: 'loan',
        amount: 50000,
        rate: 5.0,
        startDate: '2024-05-10',
        creditTime: '2026-05-10',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-LN-2024-100',
        creditProductId: 'NJCS0001'
      },
      {
        productKey: 'CC-2021-002',
        productName: '信用卡',
        productCode: 'P020',
        productType: 'credit_card',
        amount: 30000,
        balance: 6000,
        interestRate: '0.06%',
        startDate: '2021-08-15',
        maturityDate: '2028-08-15',
        status: '正常使用',
        creditTime: '2021-08-15',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-CC-2021-002',
        creditProductId: 'CC2021156'
      }
    ],
    creditApplications: [
      { creditApplicationId: 'CA-2024-100', productKey: 'LN-2024-100', creditProductId: 'NJCS0001', appliedAt: '2024-05-10T10:00:00Z', approvedBy: '风控组 · 孙七', status: '生效' },
      { creditApplicationId: 'CA-2021-156', productKey: 'CC-2021-002', creditProductId: 'CC2021156', appliedAt: '2021-08-15T11:00:00Z', approvedBy: '风控组 · 周八', status: '生效' }
    ],
    loanProducts: [
      { loanProductId: 'LP-NJCS0001-001', loanProductName: '联合贷标准版-借款1', creditProductId: 'NJCS0001', creditApplicationId: 'CA-2024-100', createdAt: '2024-05-15T10:00:00Z' },
      { loanProductId: 'LP-CC-2021-001', loanProductName: '信用卡账单1-分期', creditProductId: 'CC2021156', creditApplicationId: 'CA-2021-156', createdAt: '2025-02-20T10:00:00Z' }
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
      customerLevel: '普通',
      customerNo: 'C123',
      domicile: '苏州',
      idCardExpiry: '2031-03-01',
      thirdPartyCustomerId: 'EXT-123-CUST'
    },
    domicile: '苏州',
    idCardExpiry: '2031-03-01',
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
        reportStatus: '正常',
        creditScore: 782,
        creditLevel: 'AA',
        creditOverview: {
          totalCreditLimit: 60000,
          usedCredit: 12000,
          creditUtilizationRate: 20
        },
        notes: '信用记录优秀'
      }
    ],
    collectionRecords: [],
    paymentProcessRecords: [],
    quotaAdjustHistory: [],
    loanRecords: [
      {
        id: 'LON004',
        loanNo: 'LN20250310004',
        thirdPartyCustomerId: 'EXT-123-LON004',
        loanDate: '2025-03-10',
        channel: 'APP',
        productName: 'Su贷',
        productKey: 'LN-2025-007',
        creditProductId: 'BYD0003',
        creditApplicationId: 'CA-2025-007',
        loanProductId: 'LP-BYD0003-001',
        loanProductName: 'Su贷极速版-借款1',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2025-010-LN007',
        status: '正常',
        amount: 100000,
        balance: 85000,
        installments: 12,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 3,
        remainingPrincipal: 85000,
        remainingInterest: 2100,
        remainingPenalty: 0,
        remainingTotal: 87100,
        interestRate: 4.2
      },
      {
        id: 'LON005',
        loanNo: 'LN20250620005',
        thirdPartyCustomerId: 'EXT-123-LON005',
        loanDate: '2025-06-20',
        channel: 'APP',
        productName: '蚂蚁借呗',
        productKey: 'LN-2025-012',
        creditProductId: 'MYJB0001',
        creditApplicationId: 'CA-2025-012',
        loanProductId: 'LP-MYJB0001-001',
        loanProductName: '蚂蚁借呗-借款1',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2025-060-LN012',
        status: '正常',
        amount: 50000,
        balance: 35000,
        installments: 6,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 2,
        remainingPrincipal: 35000,
        remainingInterest: 900,
        remainingPenalty: 0,
        remainingTotal: 35900,
        interestRate: 5.1
      }
    ],
    products: [
      {
        productKey: 'LN-2025-007',
        productName: 'Su贷',
        productCode: 'P001',
        productType: 'loan',
        amount: 1e5,
        rate: 4.2,
        startDate: '2025-03-10',
        creditTime: '2026-05-15',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-LN-2025-007',
        creditProductId: 'BYD0003'
      },
      {
        productKey: 'LN-2025-012',
        productName: '蚂蚁借呗',
        productCode: 'P002',
        productType: 'loan',
        amount: 5e4,
        rate: 5.1,
        startDate: '2025-06-20',
        creditTime: '2026-05-20',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-LN-2025-012',
        creditProductId: 'MYJB0001'
      }
    ],
    creditApplications: [
      { creditApplicationId: 'CA-2025-007', productKey: 'LN-2025-007', creditProductId: 'BYD0003', appliedAt: '2025-03-10T10:00:00Z', approvedBy: '系统自动审批', status: '生效' },
      { creditApplicationId: 'CA-2025-012', productKey: 'LN-2025-012', creditProductId: 'MYJB0001', appliedAt: '2025-06-20T11:00:00Z', approvedBy: '风控组 · 吴九', status: '生效' }
    ],
    loanProducts: [
      { loanProductId: 'LP-BYD0003-001', loanProductName: 'Su贷极速版-借款1', creditProductId: 'BYD0003', creditApplicationId: 'CA-2025-007', createdAt: '2025-03-12T10:00:00Z' },
      { loanProductId: 'LP-MYJB0001-001', loanProductName: '蚂蚁借呗-借款1', creditProductId: 'MYJB0001', creditApplicationId: 'CA-2025-012', createdAt: '2025-06-22T10:00:00Z' }
    ]
  },
  '456': {
    userId: '456',
    basicInfo: {
      name: '李娜',
      status: '正常',
      age: 31,
      gender: '女',
      idCard: '33010119931122****',
      phone: '136****1122',
      registrationDate: '2019-03-10',
      customerLevel: '白银',
      customerNo: 'C456',
      domicile: '杭州',
      idCardExpiry: '2029-11-22',
      thirdPartyCustomerId: 'EXT-456-CUST'
    },
    domicile: '杭州',
    idCardExpiry: '2029-11-22',
    totalCredit: 250000,
    usedCredit: 180000,
    creditUtilizationRate: 72,
    creditScore: 645,
    creditLevel: 'B',
    creditsList: [
      {
        id: 'CR301',
        reportId: 'RPT20251211301',
        source: '人行征信中心',
        queryDate: '2025-12-11',
        reportType: '人行征信报告',
        reportStatus: '关注',
        creditScore: 645,
        creditLevel: 'B',
        creditOverview: {
          totalCreditLimit: 250000,
          usedCredit: 180000,
          creditUtilizationRate: 72
        },
        notes: '负债率较高,近6个月有2次逾期'
      }
    ],
    collectionRecords: [
      {
        id: 'COL301',
        collectionNo: 'CN20260615301',
        startDate: '2026-06-15',
        endDate: null,
        type: '短信催收',
        target: '本人',
        reason: '借款2(LP-CS-001)逾期7天',
        executor: '催收员C组·李明',
        result: '已发短信,等待客户回复',
        status: '处理中'
      }
    ],
    paymentProcessRecords: [
      { id: 'PAY301', type: '自动代扣', amount: 3000, method: '银行代扣', date: '2026-07-10', status: '成功' }
    ],
    quotaAdjustHistory: [
      { id: 'QA301', type: '降额', productName: '全资', before: 200000, after: 100000, reason: '负债过高', date: '2026-04-01' }
    ],
    loanRecords: [
      {
        id: 'LON401',
        loanNo: 'LN20230320401',
        thirdPartyCustomerId: 'EXT-456-LON401',
        loanDate: '2023-03-20',
        channel: 'APP',
        productName: '全资',
        productKey: 'CREDIT_SELF_456',
        creditProductId: 'CCB0001',
        creditApplicationId: 'CA-2023-456',
        loanProductId: 'LP-CCB0001-001',
        loanProductName: '个人信用贷款-借款1',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2023-003-CCB456',
        status: '正常',
        amount: 100000,
        balance: 50000,
        installments: 36,
        overdueDays: 0,
        maxOverdueDays: 7,
        settlementDate: null,
        currentPeriod: 28,
        remainingPrincipal: 50000,
        remainingInterest: 1500,
        remainingPenalty: 0,
        remainingTotal: 51500,
        interestRate: 4.8
      },
      {
        id: 'LON402',
        loanNo: 'LN20250205402',
        thirdPartyCustomerId: 'EXT-456-LON402',
        loanDate: '2025-02-05',
        channel: 'H5',
        productName: '全资',
        productKey: 'CREDIT_SELF_456',
        creditProductId: 'CCB0001',
        creditApplicationId: 'CA-2023-456',
        loanProductId: 'LP-CCB0001-002',
        loanProductName: '个人信用贷款-借款2',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2025-002-CCB456B',
        status: '逾期',
        amount: 80000,
        balance: 60000,
        installments: 24,
        overdueDays: 7,
        maxOverdueDays: 7,
        settlementDate: null,
        currentPeriod: 6,
        remainingPrincipal: 60000,
        remainingInterest: 2400,
        remainingPenalty: 350,
        remainingTotal: 62750,
        interestRate: 5.5
      },
      {
        id: 'LON403',
        loanNo: 'LN20220715403',
        thirdPartyCustomerId: 'EXT-456-LON403',
        loanDate: '2022-07-15',
        channel: 'APP',
        productName: '信用卡',
        productKey: 'CC-2022-456',
        creditProductId: 'CMB0001',
        creditApplicationId: 'CA-2022-456',
        loanProductId: 'LP-CMB0001-001',
        loanProductName: '信用卡账单1-分期',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2022-007-CMB456',
        status: '正常',
        amount: 36000,
        balance: 18000,
        installments: 24,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 18,
        remainingPrincipal: 18000,
        remainingInterest: 500,
        remainingPenalty: 0,
        remainingTotal: 18500,
        interestRate: 0.06
      },
      {
        id: 'LON404',
        loanNo: 'LN20240710404',
        thirdPartyCustomerId: 'EXT-456-LON404',
        loanDate: '2024-07-10',
        channel: 'APP',
        productName: '信用卡',
        productKey: 'CC-2022-456',
        creditProductId: 'CMB0001',
        creditApplicationId: 'CA-2022-456',
        loanProductId: 'LP-CMB0001-002',
        loanProductName: '信用卡账单2-分期',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2024-007-CMB456B',
        status: '结清',
        amount: 25000,
        balance: 0,
        installments: 12,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: '2025-07-10',
        currentPeriod: 12,
        remainingPrincipal: 0,
        remainingInterest: 0,
        remainingPenalty: 0,
        remainingTotal: 0,
        interestRate: 0.06
      }
    ],
    products: [
      {
        productKey: 'CREDIT_SELF_456',
        productName: '全资',
        productCode: 'P007',
        productType: 'self',
        bank: '建设银行',
        amount: 100000,
        balance: 50000,
        interestRate: '4.80%',
        maturityDate: '2028-03-20',
        status: '正常使用',
        creditTime: '2023-03-20',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-CREDIT-SELF-456',
        creditProductId: 'CCB0001'
      },
      {
        productKey: 'CC-2022-456',
        productName: '信用卡',
        productCode: 'P021',
        productType: 'credit_card',
        amount: 50000,
        balance: 18000,
        interestRate: '0.06%',
        startDate: '2022-05-10',
        maturityDate: '2029-05-10',
        status: '正常使用',
        creditTime: '2022-05-10',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-CC-2022-456',
        creditProductId: 'CMB0001'
      }
    ],
    creditApplications: [
      { creditApplicationId: 'CA-2023-456', productKey: 'CREDIT_SELF_456', creditProductId: 'CCB0001', appliedAt: '2023-03-20T10:00:00Z', approvedBy: '风控组 · 王五', status: '生效' },
      { creditApplicationId: 'CA-2022-456', productKey: 'CC-2022-456', creditProductId: 'CMB0001', appliedAt: '2022-05-10T11:00:00Z', approvedBy: '风控组 · 李四', status: '生效' }
    ],
    loanProducts: [
      { loanProductId: 'LP-CCB0001-001', loanProductName: '个人信用贷款-借款1', creditProductId: 'CCB0001', creditApplicationId: 'CA-2023-456', createdAt: '2023-03-25T10:00:00Z' },
      { loanProductId: 'LP-CCB0001-002', loanProductName: '个人信用贷款-借款2', creditProductId: 'CCB0001', creditApplicationId: 'CA-2023-456', createdAt: '2025-02-08T10:00:00Z' },
      { loanProductId: 'LP-CMB0001-001', loanProductName: '信用卡账单1-分期', creditProductId: 'CMB0001', creditApplicationId: 'CA-2022-456', createdAt: '2022-07-18T10:00:00Z' },
      { loanProductId: 'LP-CMB0001-002', loanProductName: '信用卡账单2-分期', creditProductId: 'CMB0001', creditApplicationId: 'CA-2022-456', createdAt: '2024-07-12T10:00:00Z' }
    ]
  }
}

/**
 * 根据借据记录生成还款记录
 * 每条借据按期次生成已还款/逾期/待还款记录
 */
function generateRepaymentRecords(loanRecords: any[]): any[] {
  const records: any[] = []
  let idCounter = 1

  for (const loan of loanRecords) {
    if (!loan.loanNo) continue

    const installments = loan.installments || 1
    const currentPeriod = loan.currentPeriod || 0
    const perPrincipal = Math.round((loan.amount || 0) / installments)
    const perInterest = Math.round((loan.amount || 0) * (loan.interestRate || 0) / 100 / 12)
    const perTotal = perPrincipal + perInterest
    const startDate = new Date(loan.loanDate || new Date())

    // 决定已还期次数
    let repaidPeriods = 0
    if (loan.status === '结清' || loan.iouStatus === '已结清') {
      repaidPeriods = installments
    } else if (loan.status === '正常') {
      repaidPeriods = currentPeriod
    } else if (loan.status === '逾期') {
      repaidPeriods = Math.max(currentPeriod - 1, 0)
    }

    // 生成已还款记录
    for (let i = 1; i <= repaidPeriods; i++) {
      const d = new Date(startDate)
      d.setMonth(d.getMonth() + i)
      records.push({
        id: `RP${String(idCounter++).padStart(4, '0')}`,
        loanNo: loan.loanNo,
        productKey: loan.productKey || '',
        productName: loan.productName || '',
        creditProductId: loan.creditProductId || '',
        creditApplicationId: loan.creditApplicationId || '',
        loanProductId: loan.loanProductId || '',
        loanProductName: loan.loanProductName || '',
        period: i,
        repayDate: d.toISOString().slice(0, 10),
        amount: perTotal,
        principal: perPrincipal,
        interest: perInterest,
        penalty: 0,
        method: i % 2 === 0 ? '主动还款' : '自动扣款',
        status: '已还款'
      })
    }

    // 逾期期次
    if (loan.status === '逾期' && loan.overdueDays > 0) {
      const d = new Date(startDate)
      d.setMonth(d.getMonth() + currentPeriod)
      records.push({
        id: `RP${String(idCounter++).padStart(4, '0')}`,
        loanNo: loan.loanNo,
        productKey: loan.productKey || '',
        productName: loan.productName || '',
        creditProductId: loan.creditProductId || '',
        creditApplicationId: loan.creditApplicationId || '',
        loanProductId: loan.loanProductId || '',
        loanProductName: loan.loanProductName || '',
        period: currentPeriod,
        repayDate: d.toISOString().slice(0, 10),
        amount: perTotal,
        principal: perPrincipal,
        interest: perInterest,
        penalty: Math.round(loan.remainingPenalty || 0),
        method: '自动扣款',
        status: '逾期',
        overdueDays: loan.overdueDays
      })
    }

    // 待还款期次（在贷且有未还期次时，展示下一期待还）
    if ((loan.status === '正常' || loan.status === '逾期') && currentPeriod < installments) {
      const nextPeriod = loan.status === '逾期' ? currentPeriod + 1 : currentPeriod + 1
      if (nextPeriod <= installments) {
        const d = new Date(startDate)
        d.setMonth(d.getMonth() + nextPeriod)
        records.push({
          id: `RP${String(idCounter++).padStart(4, '0')}`,
          loanNo: loan.loanNo,
          productKey: loan.productKey || '',
          productName: loan.productName || '',
          creditProductId: loan.creditProductId || '',
          creditApplicationId: loan.creditApplicationId || '',
          loanProductId: loan.loanProductId || '',
          loanProductName: loan.loanProductName || '',
          period: nextPeriod,
          repayDate: d.toISOString().slice(0, 10),
          amount: perTotal,
          principal: perPrincipal,
          interest: perInterest,
          penalty: 0,
          method: '自动扣款',
          status: '待还款'
        })
      }
    }
  }

  return records
}

// 模糊搜索 Mock 结果
export const fuzzySearchResults: Record<string, any[]> = {
  '张伟': [
    {
      userId: '887123', name: '张伟', idCardTail: '0101', age: 35, gender: '男', customerLevel: 'VIP',
      city: '上海', phone: '138****1234',
      recentLoan: { loanNo: 'LN20240315001', amount: 200000, balance: 180000, status: '正常', overdueDays: 0 }
    },
    {
      userId: '887456', name: '张伟', idCardTail: '2233', age: 42, gender: '男', customerLevel: '普通',
      city: '南京', phone: '139****2233',
      recentLoan: { loanNo: 'LN20240510201', amount: 50000, balance: 25000, status: '正常', overdueDays: 0 }
    }
  ],
  '李娜': [
    {
      userId: '123', name: '李娜', idCardTail: '0301', age: 28, gender: '女', customerLevel: '普通',
      city: '苏州', phone: '139****5678',
      recentLoan: { loanNo: 'LN20250310004', amount: 100000, balance: 85000, status: '正常', overdueDays: 0 }
    },
    {
      userId: '456', name: '李娜', idCardTail: '1122', age: 31, gender: '女', customerLevel: '白银',
      city: '杭州', phone: '136****1122',
      recentLoan: { loanNo: 'LN20250205402', amount: 80000, balance: 60000, status: '逾期', overdueDays: 7 }
    }
  ]
}

/**
 * 获取用户信息
 * @param userId 用户ID
 */
export async function fetchUserInfo(userId: string): Promise<any> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  const user = mockUsers[userId]
  if (user) {
    const data = { ...user }
    // 自动生成还款记录
    if (!data.repaymentRecords && data.loanRecords) {
      data.repaymentRecords = generateRepaymentRecords(data.loanRecords)
    }
    return data
  }

  return {
    error: true,
    errorType: 'USER_NOT_FOUND',
    message: '未找到该用户信息',
    userId
  }
}

/**
 * 模糊搜索用户
 * @param keyword 关键词
 */
export async function fuzzySearchUsers(keyword: string): Promise<any[]> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200))

  const results: any[] = []
  Object.values(fuzzySearchResults).forEach((arr) => {
    arr.forEach((user) => {
      if (user.name.includes(keyword) && !results.find((r) => r.userId === user.userId)) {
        results.push(user)
      }
    })
  })
  return results
}

/**
 * 精确搜索用户
 * @param userId 用户ID
 */
export async function exactSearchUser(userId: string): Promise<any> {
  return fetchUserInfo(userId)
}
