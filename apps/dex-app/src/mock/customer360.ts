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
    creditLevel: 'A',
    creditsList: [
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
        ],
        thirdPartyLoanId: 'IOU-CR001-20260415'
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
        ],
        thirdPartyLoanId: 'IOU-CR002-20260310'
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
      {
        id: 'CR001',
        collectionDate: '2026-04-10',
        collectionTime: '09:30:00',
        collectionMethod: '电话',
        collectorName: '李华',
        collectorPhone: '138****5678',
        contactResult: '联系成功',
        effectiveScore: 85,
        overdueAmount: 15000,
        overduePeriod: 'M1',
        promiseAmount: 10000,
        promiseDate: '2026-04-15',
        remark: '客户承诺按时还款'
      },
      {
        id: 'CR002',
        collectionDate: '2026-04-03',
        collectionTime: '14:20:00',
        collectionMethod: '短信',
        collectorName: '王芳',
        collectorPhone: '139****8765',
        contactResult: '已发送',
        effectiveScore: 60,
        overdueAmount: 15000,
        overduePeriod: 'M1',
        promiseAmount: null,
        promiseDate: null,
        remark: '短信已发送，客户未回复'
      },
      {
        id: 'CR003',
        collectionDate: '2026-03-28',
        collectionTime: '10:00:00',
        collectionMethod: '电话',
        collectorName: '李华',
        collectorPhone: '138****5678',
        contactResult: '联系成功',
        effectiveScore: 92,
        overdueAmount: 12000,
        overduePeriod: 'M0',
        promiseAmount: 12000,
        promiseDate: '2026-04-01',
        remark: '客户表示会在到期前还款'
      },
      {
        id: 'CR004',
        collectionDate: '2026-03-20',
        collectionTime: '16:45:00',
        collectionMethod: '上门',
        collectorName: '赵强',
        collectorPhone: '137****2345',
        contactResult: '联系失败',
        effectiveScore: 30,
        overdueAmount: 20000,
        overduePeriod: 'M2',
        promiseAmount: null,
        promiseDate: null,
        remark: '上门无人应答'
      }
    ],
    badNotifications: [
      {
        id: 'BN001',
        notificationDate: '2026-03-15',
        notificationType: '逾期提醒',
        content: '您在我司的贷款已逾期，请尽快处理',
        status: '已发送',
        sendMethod: '短信'
      },
      {
        id: 'BN002',
        notificationDate: '2026-03-01',
        notificationType: '到期提醒',
        content: '您的贷款将于3天后到期，请确保账户余额充足',
        status: '已发送',
        sendMethod: '短信'
      }
    ],
    loanRecords: [
      {
        id: 'LON001',
        loanNo: 'LN20240315001',
        thirdPartyCustomerId: 'EXT-887123-LON001',
        loanDate: '2024-03-15',
        channel: 'APP',
        productName: '个人信用贷款',
        productKey: 'CREDIT_SELF_001',
        result: '成功',
        rejectReason: null,
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
        productName: '消费分期',
        productKey: 'CREDIT_SELF_002',
        result: '成功',
        rejectReason: null,
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
        loanNo: 'LN20260125003',
        thirdPartyCustomerId: 'EXT-887123-LON003',
        loanDate: '2026-01-25',
        channel: 'APP',
        productName: 'Su贷',
        productKey: 'LN-2024-009',
        result: '成功',
        rejectReason: null,
        contractNo: 'CON-2026-025-LN009',
        status: '正常',
        amount: 200000,
        balance: 192000,
        installments: 12,
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: null,
        currentPeriod: 4,
        remainingPrincipal: 192000,
        remainingInterest: 8400,
        remainingPenalty: 0,
        remainingTotal: 200400,
        interestRate: 3.9
      }
    ],
    products: [
      {
        productKey: 'CREDIT_SELF_001',
        productName: '个人信用贷款',
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
        thirdPartyLoanId: 'IOU-CREDIT-SELF-001'
      },
      {
        productKey: 'CREDIT_SELF_002',
        productName: '消费分期',
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
        thirdPartyLoanId: 'IOU-CREDIT-SELF-002'
      },
      {
        productKey: 'LN-2024-009',
        productName: 'Su贷',
        productCode: 'P001',
        productType: 'loan',
        amount: 2e5,
        rate: 3.9,
        startDate: '2024-01-15',
        creditTime: '2026-05-25',
        creditStatus: '正常',
        thirdPartyLoanId: 'IOU-LN-2024-009'
      }
    ],
    currentOverdueDays: 0,
    maxOverdueDays: 15,
    currentTotalLoanBalance: 192000,
    currentTotalCreditAmount: 250000,
    unsettledLoanCount: 0,
    maxInstallments: 36,
    earliestLoanDate: '2023-04-20',
    totalPaidPrincipal: 48000,
    totalPaidInterestPenalty: 3200,
    remainingPrincipal: 192000,
    remainingInterest: 8400,
    remainingPenalty: 0,
    remainingTotalAmount: 200400,
    historyMaxOverdueDays: 15,
    currentOverduePeriods: 0,
    currentTotalOverdueAmount: 0,
    userProfile: {
      risk: {
        riskType: '低风险',
        riskLevel: 'A',
        repaymentCapacity: '充足',
        creditScore: 723
      },
      demographics: {
        ageGroup: '31-50',
        genderLabel: '男性',
        regionType: '一线城市',
        occupationType: '企业主',
        incomeLevel: '高收入'
      }
    },
    // 实时业务数据（Su贷产品）
    realTimeData: {
      totalCreditLimit: 250000,
      usedCredit: 45000,
      availableCredit: 205000,
      creditList: [
        { id: 'CR001', productName: 'Su贷-极速版', creditTime: '2026-05-01', creditAmount: 100000, creditStatus: '正常', source: '自动' },
        { id: 'CR002', productName: 'Su贷-标准版', creditTime: '2026-04-15', creditAmount: 50000, creditStatus: '正常', source: '自动' },
        { id: 'CR003', productName: 'Su贷-极速版', creditTime: '2026-03-01', creditAmount: 100000, creditStatus: '冻结', source: '人工' },
        { id: 'CR004', productName: 'Su贷-标准版', creditTime: '2026-01-10', creditAmount: 80000, creditStatus: '销户', source: '自动' }
      ],
      loanList: [
        { id: 'LN001', productName: 'Su贷-极速版', loanTime: '2026-05-01', loanAmount: 50000, balance: 45000, loanStatus: '正常' },
        { id: 'LN002', productName: 'Su贷-标准版', loanTime: '2026-04-20', loanAmount: 30000, balance: 0, loanStatus: '结清' },
        { id: 'LN003', productName: 'Su贷-极速版', loanTime: '2026-03-15', loanAmount: 20000, balance: 8500, loanStatus: '正常' },
        { id: 'LN004', productName: 'Su贷-标准版', loanTime: '2026-02-28', loanAmount: 15000, balance: 0, loanStatus: '结清' },
        { id: 'LN005', productName: 'Su贷-极速版', loanTime: '2026-01-10', loanAmount: 80000, balance: 32000, loanStatus: '逾期' },
        { id: 'LN006', productName: 'Su贷-标准版', loanTime: '2025-12-05', loanAmount: 50000, balance: 0, loanStatus: '结清' }
      ]
    },
    marketingRecords: {
      touchRecords: [
        { id: 'TR001', productKey: 'LN-2024-009', touchDate: '2026-05-20 14:30', touchChannel: '人工外呼', content: '针对VIP客户推荐Su贷极速版，提到年利率7.2%起，借款额度最高50万，线上审批5分钟放款', touchResult: '成功', operator: '张三', duration: '00:15', transcript: '客户：正好有资金需求，想了解一下。客服：好的，Su贷产品支持最高50万额度，年利率7.2%起，线上审批5分钟放款。客户：怎么申请？客服：全程线上操作，身份证和银行卡即可，申请后1-3个工作日完成审批。客户：好的，我试试。' },
        { id: 'TR002', productKey: 'LN-2024-009', touchDate: '2026-05-18 09:45', touchChannel: '短信', content: '【XX银行】尊敬的张伟，您已获得Su贷专属利率优惠，年利率低至6.8%，限期内申请可享免息券一张，点击链接查看详情：https://xx.co/abc123', touchResult: '成功', operator: '系统' },
        { id: 'TR003', productKey: 'LN-2024-009', touchDate: '2026-05-15 16:20', touchChannel: 'AI外呼', content: 'AI外呼介绍Su贷产品，提到额度20万，利率8.9%，客户表示考虑', touchResult: '成功', operator: '智能助手', duration: '00:42', transcript: 'AI：您好，我是XX银行智能客服，检测到您是我行优质客户，特为您推荐Su贷产品，额度20万，利率8.9%起。客户：利率还能再低吗？AI：您的利率需要根据审批结果确定，优质客户最低可至6.8%。客户：那我考虑一下。AI：好的，感谢您的接听，再见。' },
        { id: 'TR004', productKey: 'LN-2024-009', touchDate: '2026-05-12 11:00', touchChannel: 'APP推送', content: '新功能介绍：Su贷2.0重磅上线，额度更高利率更低，点击查看您的专属额度', touchResult: '成功', operator: '系统' },
        { id: 'TR005', productKey: 'LN-2024-009', touchDate: '2026-05-08 10:15', touchChannel: '短信', content: '【XX银行】张伟先生，您在Su贷的可用额度为205,000元，年利率仅需7.2%，有效期至2026-05-31，欢迎使用', touchResult: '成功', operator: '系统' },
        { id: 'TR006', productKey: 'LN-2024-009', touchDate: '2026-05-05 14:00', touchChannel: '人工外呼', content: '人工外呼告知客户授信额度已提升至25万，建议关注', touchResult: '失败', operator: '李四', duration: '00:05', transcript: '客服：喂您好，请问是张伟先生吗？客户：哪位？客服：我是XX银行信用卡中心...（电话中断）' },
        { id: 'TR007', productKey: 'LN-2024-009', touchDate: '2026-04-28 09:30', touchChannel: 'AI外呼挂短', content: 'AI外呼介绍产品，客户未接听，留言后将短信发送至手机', touchResult: '成功', operator: '智能助手' },
        { id: 'TR008', productKey: 'LN-2024-009', touchDate: '2026-04-25 16:45', touchChannel: '人工外呼', content: '产品推介，针对有车客户推荐车主贷，提到利率优惠', touchResult: '成功', operator: '王五', duration: '02:30', transcript: '客服：您好张先生，我注意到您是我行优质车主客户，特为您推荐我行车主贷产品，年利率低至5.8%，最高可借100万。客户：需要什么材料？客服：行驶证和身份证即可，全程线上审批。客户：好的我了解一下。' }
      ],
      benefitRecords: [
        { id: 'BR001', productKey: 'LN-2024-009', benefitDate: '2026-05-20', benefitName: '积分翻倍奖励', benefitType: '积分奖励', benefitAmount: 5000, benefitStatus: '已发放', benefitDescription: '5月积分翻倍活动，授信客户专属，5000积分已到账，可前往积分商城兑换好礼' },
        { id: 'BR002', productKey: 'LN-2024-009', benefitDate: '2026-05-15', benefitName: 'VIP专享利率优惠券', benefitType: '利率优惠', benefitAmount: 0, benefitStatus: '已发放', benefitDescription: 'Su贷VIP专享利率优惠券，原利率8.9%，使用后降至7.2%，有效期至2026-06-30' },
        { id: 'BR003', productKey: 'LN-2024-009', benefitDate: '2026-05-10', benefitName: '首次用信免息券', benefitType: '免息优惠', benefitAmount: 0, benefitStatus: '已发放', benefitDescription: '首次使用Su贷产品，可享受30天免息优惠，借款金额上限10万，有效期30天' },
        { id: 'BR004', productKey: 'LN-2024-009', benefitDate: '2026-04-20', benefitName: '推荐好友奖励', benefitType: '推荐奖励', benefitAmount: 200, benefitStatus: '已发放', benefitDescription: '推荐好友成功申请Su贷，获得200元现金红包，已发放至绑定的银行账户' },
        { id: 'BR005', productKey: 'LN-2024-009', benefitDate: '2026-04-15', benefitName: '会员等级提升', benefitType: '权益升级', benefitAmount: 0, benefitStatus: '已发放', benefitDescription: 'Su贷会员等级由银卡升级为金卡，享受更高额度、更低利率、优先审批权益' },
        { id: 'BR006', productKey: 'LN-2024-009', benefitDate: '2026-04-01', benefitName: '幸运抽奖资格', benefitType: '活动权益', benefitAmount: 0, benefitStatus: '待领取', benefitDescription: '4月活动期间用信客户，可参与幸运抽奖，奖品包括iPhone、购物卡、积分等，领取截止日期2026-06-30' },
        { id: 'BR007', productKey: 'LN-2024-009', benefitDate: '2026-03-20', benefitName: '生日专属利率券', benefitType: '利率优惠', benefitAmount: 0, benefitStatus: '已使用', benefitDescription: '客户生日专属利率优惠券，已在2026-03-22的贷款申请中使用，实际享受利率7.5%（原利率8.9%）' }
      ],
      effectAnalysis: {
        totalTouch: 12,
        effectiveTouch: 8,
        conversionRate: 0.33,
        lastTouchDate: '2026-05-20'
      }
    },
    paymentProcessRecords: [
      { id: 'PP001', date: '2026-05-01', type: '还款', amount: 3200, status: '成功', method: '自动扣款' },
      { id: 'PP002', date: '2026-04-01', type: '还款', amount: 3200, status: '成功', method: '自动扣款' },
      { id: 'PP003', date: '2026-03-01', type: '还款', amount: 3200, status: '成功', method: '自动扣款' }
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
    collectionRecords: [],
    loanRecords: [
      {
        id: 'LON004',
        loanNo: 'LN20250310004',
        thirdPartyCustomerId: 'EXT-123-LON004',
        loanDate: '2025-03-10',
        channel: 'APP',
        productName: 'Su贷',
        productKey: 'LN-2025-007',
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
    quotaAdjustHistory: [],
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
        thirdPartyLoanId: 'IOU-LN-2025-007'
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
        thirdPartyLoanId: 'IOU-LN-2025-012'
      }
    ]
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