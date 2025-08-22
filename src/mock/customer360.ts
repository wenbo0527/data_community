// 催收记录接口
interface CollectionRecord {
  id: string;
  collectionDate: string;
  collectionTime: string;
  collectionMethod: string; // 电话、短信、上门、邮件
  collectorName: string;
  collectorPhone: string;
  contactResult: string; // 联系成功、联系失败、拒接、关机
  customerResponse: string;
  promiseAmount?: number;
  promiseDate?: string;
  riskLevel: string; // 低、中、高
  followUpAction: string;
  remarks: string;
  effectiveScore: number; // 催收效果评分
  duration: number; // 通话时长（分钟）
}

// 征信记录接口
interface CreditReport {
  reportId: string;
  reportDate: string;
  reportType: string; // 个人征信、企业征信
  reportSource: string; // 人行征信、百行征信
  creditScore: number;
  creditLevel: string; // AAA、AA、A、BBB、BB、B、CCC、CC、C、D
  riskStatus: string; // 正常、关注、次级、可疑、损失
  reportUrl: string;
  validUntil: string;
  queryReason: string;
  basicInfo: {
    name: string;
    idCard: string;
    queryDate: string;
    reportVersion: string;
  };
  summary: {
    totalAccounts: number;
    activeAccounts: number;
    overdueAccounts: number;
    totalCreditLimit: number;
    totalBalance: number;
    monthlyPayment: number;
  };
}

// 营销记录接口
interface MarketingRecord {
  // 触达记录
  touchRecords: Array<{
    id: string;
    touchDate: string;
    touchChannel: string; // 短信、电话、邮件、APP推送、微信
    campaignName: string;
    campaignType: string; // 产品推广、活动通知、风险提醒
    content: string;
    targetAudience: string;
    touchResult: string; // 成功、失败、拒绝
    responseAction: string; // 点击、申请、忽略、退订
    conversionValue: number;
    cost: number;
  }>;
  
  // 权益发放记录
  benefitRecords: Array<{
    id: string;
    benefitDate: string;
    benefitType: string; // 积分、优惠券、免费服务、利率优惠
    benefitName: string;
    benefitValue: number;
    benefitStatus: string; // 已发放、已使用、已过期、已退回
    useDate?: string;
    expiryDate: string;
    sourceActivity: string;
    usageRestriction: string;
  }>;
  
  // 营销效果分析
  effectAnalysis: {
    totalTouchCount: number;
    successfulTouchCount: number;
    conversionRate: number;
    totalCost: number;
    totalRevenue: number;
    roi: number; // 投资回报率
    customerLifetimeValue: number;
  };
}

// 还款记录明细接口
interface RepaymentDetail {
  repaymentId: string;
  repaymentDate: string;
  repaymentAmount: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  repaymentMethod: string; // 自动扣款、主动还款、线下还款
  repaymentStatus: string; // 成功、失败、部分还款
  bankCard: string;
  transactionId: string;
  remarks: string;
}

// 扩展用信记录接口
interface EnhancedLoanRecord {
  loanNo: string;
  loanDate: string;
  bankCard: string;
  channel: string;
  productName: string;
  result: string;
  rejectReason: string;
  contractNo: string;
  status: string;
  amount: number;
  balance: number;
  installments: number;
  paidInstallments: number;
  nextPayment: number;
  nextPaymentDate: string;
  // 新增字段
  repaymentDetails: RepaymentDetail[];
  repaymentPlan: Array<{
    period: number;
    dueDate: string;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    status: string; // 未到期、已还款、逾期、部分还款
  }>;
  overdueInfo?: {
    overdueDays: number;
    overdueAmount: number;
    penaltyAmount: number;
    riskLevel: string;
  };
}

// 模拟用户数据库
interface UserData {
  userId: string;
  name: string;
  age: number;
  gender: string;
  idCard: string;
  mobile: string;
  email: string;
  customerNo: string;
  address: string;
  idExpiry: string;
  status: string;
  joinDate: string;
  customerLevel: string;
  totalCredit: number;
  usedCredit: number;
  availableCredit: number;
  similarity: number;
  threshold: number;
  errorMsg: string;
  depositProducts: Array<{
    productKey: string;
    name: string;
    balance: number;
    currency: string;
    status: string;
    rate: number;
    lastTransaction?: string;
    maturityDate?: string;
  }>;
  loanProducts: Array<{
    productKey: string;
    name: string;
    balance: number;
    currency: string;
    status: string;
    rate: number;
    remainingPeriod: number;
    totalPeriod: number;
    nextPaymentDate?: string;
  }>;
  maxOverdueDays: number;
  currentOverdueDays: number;
  totalLoanAmount: number;
  totalCreditAmount: number;
  overdueAmount: number;
  repaymentRate: number;
  creditsList: Array<{
    creditNo: string;
    creditDate: string;
    channel: string;
    productName: string;
    result: string;
    rejectReason: string;
    initialAmount: number;
    currentAmount: number;
    usedAmount: number;
    riskLevel: string;
    rate: number;
    period: number;
    expiryDate: string;
  }>;
  // 用信记录（增强版）
  loanRecords: EnhancedLoanRecord[];
  
  // 催收记录
  collectionRecords: CollectionRecord[];
  
  // 征信记录
  creditReports: CreditReport[];
  
  // 营销记录
  marketingRecords: MarketingRecord;
  quotaAdjustHistory: Array<{
    customerNo: string;
    adjustDate: string;
    beforeAmount: number;
    afterAmount: number;
    adjustReason: string;
    beforeRate: number;
    afterRate: number;
    beforePeriod: number;
    afterPeriod: number;
    operator: string;
    result: string;
  }>;
  products: Array<{
    productKey: string;
    productType: string;
    productName: string;
    amount: number;
    startDate: string;
    rate?: number;
  }>;
}

const mockUsers: { [key: string]: UserData } = {
  // 添加一个有效的用户ID '887123'，与图片中显示的一致
  '887123': {
    userId: '887123',
    name: '张*',
    // 添加基本信息字段，这是页面渲染的关键依赖
    basicInfo: {
      name: '张*',
      age: 35,
      gender: '男',
      idCard: '320*******123X',
      phone: '159****5678',
      email: 'zhang@example.com',
      address: '上海市浦东新区',
      customerNo: 'KH100100022002',
      idExpiry: '2028-05-20',
      status: '正常',
      joinDate: '2020-03-10',
      customerLevel: '普通客户'
    },
    products: [
      {
        productKey: 'DP-2024-002',
        productType: '活期存款',
        productName: '活期存款',
        amount: 20000,
        startDate: '2023-01-10'
      },
      {
        productKey: 'LN-2024-002',
        productType: '消费贷款',
        productName: '消费贷款',
        amount: 50000,
        rate: 4.35,
        startDate: '2023-08-15'
      }
    ],
    age: 35,
    gender: '男',
    idCard: '320*******123X',
    mobile: '159****5678',
    email: 'zhang@example.com',
    customerNo: 'KH100100022002',
    address: '上海市浦东新区',
    idExpiry: '2028-05-20',
    status: '正常',
    joinDate: '2020-03-10',
    customerLevel: '普通客户',
    totalCredit: 50000,
    usedCredit: 30000,
    availableCredit: 20000,
    similarity: 9.876543,
    threshold: 60.00,
    errorMsg: '当日已核查通过',
    
    depositProducts: [
      {
        productKey: 'regular-887123',
        name: '活期存款',
        balance: 20000.00,
        currency: 'CNY',
        status: '正常',
        rate: 0.30,
        lastTransaction: '2024-09-20'
      }
    ],
    
    loanProducts: [
      {
        productKey: 'consumer-887123',
        name: '个人消费贷款',
        balance: 30000.00,
        currency: 'CNY',
        status: '正常',
        rate: 4.35,
        remainingPeriod: 18,
        totalPeriod: 24,
        nextPaymentDate: '2024-02-15',
        // repaymentDetails和repaymentPlan移到loanRecords中
      }
    ],
    
    // 催收记录
    collectionRecords: [
      {
        id: 'COL001',
        collectionDate: '2024-01-20',
        collectionTime: '14:30',
        collectionMethod: '电话',
        collectorName: '张催收',
        collectorPhone: '400-123-4567',
        contactResult: '联系成功',
        customerResponse: '承诺本周内还款',
        promiseAmount: 2500,
        promiseDate: '2024-01-25',
        riskLevel: '中',
        followUpAction: '3天后回访',
        remarks: '客户态度良好，有还款意愿',
        effectiveScore: 8,
        duration: 15
      },
      {
        id: 'COL002',
        collectionDate: '2024-01-18',
        collectionTime: '10:15',
        collectionMethod: '短信',
        collectorName: '李催收',
        collectorPhone: '400-123-4568',
        contactResult: '发送成功',
        customerResponse: '未回复',
        riskLevel: '低',
        followUpAction: '电话跟进',
        remarks: '发送还款提醒短信',
        effectiveScore: 5,
        duration: 0
      }
    ],
    
    // 征信记录
    creditReports: [
      {
        reportId: 'CR20240115001',
        reportDate: '2024-01-15',
        reportType: '个人征信',
        reportSource: '人行征信',
        creditScore: 720,
        creditLevel: 'AA',
        riskStatus: '正常',
        reportUrl: 'https://example.com/credit-report/CR20240115001.pdf',
        validUntil: '2024-07-15',
        queryReason: '贷款审批',
        basicInfo: {
          name: '张三',
          idCard: '110101199001011234',
          queryDate: '2024-01-15',
          reportVersion: 'V2.1'
        },
        summary: {
          totalAccounts: 5,
          activeAccounts: 3,
          overdueAccounts: 0,
          totalCreditLimit: 500000,
          totalBalance: 150000,
          monthlyPayment: 8500
        }
      }
    ],
    
    // 营销记录
    marketingRecords: {
      touchRecords: [
        {
          id: 'TCH001',
          touchDate: '2024-01-10',
          touchChannel: 'APP推送',
          campaignName: '新春理财节',
          campaignType: '产品推广',
          content: '新春理财产品，年化收益率高达6.8%',
          targetAudience: '高净值客户',
          touchResult: '成功',
          responseAction: '点击',
          conversionValue: 50000,
          cost: 2
        },
        {
          id: 'TCH002',
          touchDate: '2024-01-05',
          touchChannel: '短信',
          campaignName: '信用卡分期优惠',
          campaignType: '活动通知',
          content: '信用卡分期手续费5折优惠，限时3天',
          targetAudience: '信用卡客户',
          touchResult: '成功',
          responseAction: '申请',
          conversionValue: 10000,
          cost: 0.1
        }
      ],
      benefitRecords: [
        {
          id: 'BEN001',
          benefitDate: '2024-01-01',
          benefitType: '积分',
          benefitName: '新年积分礼包',
          benefitValue: 10000,
          benefitStatus: '已发放',
          expiryDate: '2024-12-31',
          sourceActivity: '新年活动',
          usageRestriction: '可兑换礼品或抵扣消费'
        },
        {
          id: 'BEN002',
          benefitDate: '2023-12-25',
          benefitType: '优惠券',
          benefitName: '理财产品购买券',
          benefitValue: 500,
          benefitStatus: '已使用',
          useDate: '2024-01-10',
          expiryDate: '2024-03-25',
          sourceActivity: '圣诞节活动',
          usageRestriction: '仅限理财产品使用'
        }
      ],
      effectAnalysis: {
        totalTouchCount: 15,
        successfulTouchCount: 12,
        conversionRate: 0.8,
        totalCost: 50,
        totalRevenue: 5000,
        roi: 100,
        customerLifetimeValue: 150000
      }
    },
    
    maxOverdueDays: 0,
    currentOverdueDays: 0,
    totalLoanAmount: 30000,
    totalCreditAmount: 50000,
    overdueAmount: 0,
    repaymentRate: 100,
    
    creditsList: [
      {
        creditNo: '20701555',
        creditDate: '2023-08-15 10:20:30',
        channel: '手机银行',
        productName: '个人消费信用贷',
        result: '通过',
        rejectReason: '-',
        initialAmount: 50000.00,
        currentAmount: 50000.00,
        usedAmount: 30000.00,
        riskLevel: '正常',
        rate: 4.35,
        period: 24,
        expiryDate: '2025-08-14'
      }
    ],
    
    loanRecords: [
      {
        loanNo: '3276555',
        loanDate: '2023-08-15 10:30:45',
        bankCard: '6228****9876',
        channel: '手机银行',
        productName: '个人消费贷款',
        result: '通过',
        rejectReason: '-',
        contractNo: 'HT-20230815-005',
        status: '正常',
        amount: 30000.00,
        balance: 22500.00,
        installments: 24,
        paidInstallments: 6,
        nextPayment: 1312.50,
        nextPaymentDate: '2024-10-15',
        repaymentDetails: [
          {
            period: 1,
            paymentDate: '2023-09-15',
            principalAmount: 1062.50,
            interestAmount: 250.00,
            totalAmount: 1312.50,
            remainingBalance: 28937.50,
            status: '已还款',
            actualPaymentDate: '2023-09-15'
          },
          {
            period: 2,
            paymentDate: '2023-10-15',
            principalAmount: 1066.25,
            interestAmount: 246.25,
            totalAmount: 1312.50,
            remainingBalance: 27871.25,
            status: '已还款',
            actualPaymentDate: '2023-10-15'
          },
          {
            period: 3,
            paymentDate: '2023-11-15',
            principalAmount: 1070.00,
            interestAmount: 242.50,
            totalAmount: 1312.50,
            remainingBalance: 26801.25,
            status: '已还款',
            actualPaymentDate: '2023-11-15'
          }
        ],
        repaymentPlan: [
          {
            period: 7,
            dueDate: '2024-02-15',
            principalAmount: 1087.50,
            interestAmount: 225.00,
            totalAmount: 1312.50,
            remainingBalance: 21412.50,
            status: '待还款'
          },
          {
            period: 8,
            dueDate: '2024-03-15',
            principalAmount: 1091.25,
            interestAmount: 221.25,
            totalAmount: 1312.50,
            remainingBalance: 20321.25,
            status: '待还款'
          }
        ]
      }
    ],
    
    quotaAdjustHistory: [
      {
        customerNo: '887123',
        adjustDate: '2023-09-15 14:30:22',
        beforeAmount: 30000,
        afterAmount: 50000,
        adjustReason: '客户信用评级提升',
        beforeRate: 4.85,
        afterRate: 4.35,
        beforePeriod: 12,
        afterPeriod: 24,
        operator: '系统',
        result: '成功'
      },
      {
        customerNo: '887123',
        adjustDate: '2023-05-10 09:15:30',
        beforeAmount: 20000,
        afterAmount: 30000,
        adjustReason: '定期评估调整',
        beforeRate: 5.25,
        afterRate: 4.85,
        beforePeriod: 12,
        afterPeriod: 12,
        operator: '张经理',
        result: '成功'
      }
    ]
  },
  '123': {
    userId: '123',
    name: '李*',
    products: [
      {
        productKey: 'DP-2024-001',
        productType: '定期存款',
        productName: '三年期定存',
        amount: 150000,
        startDate: '2023-03-15'
      },
      {
        productKey: 'LN-2024-001',
        productType: '住房贷款',
        productName: '公积金贷款',
        amount: 800000,
        rate: 3.25,
        startDate: '2023-05-20'
      }
    ],
    age: 44,
    gender: '男',
    idCard: '110*******939X',
    mobile: '139****8866',
    email: 'liming@example.com',
    customerNo: 'KH100100011001',
    address: '江苏省昆山市',
    idExpiry: '2030-12-15',
    status: '正常',
    joinDate: '2018-05-20',
    customerLevel: 'VIP客户',
    totalCredit: 30000,
    usedCredit: 30000,
    availableCredit: 0,
    similarity: 11.889977,
    threshold: 55.22,
    errorMsg: '当日已核查通过',
    
    depositProducts: [
      {
        productKey: 'regular',
        name: '活期存款',
        balance: 52800.56,
        currency: 'CNY',
        status: '正常',
        rate: 0.35,
        lastTransaction: '2024-10-15'
      },
      {
        productKey: 'fixed',
        name: '定期存款(1年)',
        balance: 100000.00,
        currency: 'CNY',
        status: '正常',
        rate: 2.10,
        maturityDate: '2025-06-30'
      }
    ],
    
    // 催收记录
    collectionRecords: [
      {
        id: 'COL003',
        productKey: 'regular',
        collectionDate: '2024-01-22',
        collectionTime: '09:00',
        collectionMethod: '电话',
        collectorName: '王催收',
        collectorPhone: '400-123-4569',
        contactResult: '拒接',
        customerResponse: '无应答',
        riskLevel: '高',
        followUpAction: '上门催收',
        remarks: '多次拒接电话，需要上门处理',
        effectiveScore: 2,
        duration: 0
      },
      {
        id: 'COL004',
        productKey: 'fixed',
        collectionDate: '2024-01-20',
        collectionTime: '16:45',
        collectionMethod: '上门',
        collectorName: '赵催收',
        collectorPhone: '400-123-4570',
        contactResult: '联系成功',
        customerResponse: '承诺明天还款',
        promiseAmount: 8500,
        promiseDate: '2024-01-21',
        riskLevel: '高',
        followUpAction: '明日电话确认',
        remarks: '客户经济困难，需要协商还款计划',
        effectiveScore: 6,
        duration: 30
      },
      {
        id: 'COL005',
        productKey: 'loan001',
        collectionDate: '2024-01-18',
        collectionTime: '14:30',
        collectionMethod: '短信',
        collectorName: '系统',
        collectorPhone: '400-123-4567',
        contactResult: '已发送',
        customerResponse: '已读',
        riskLevel: '中',
        followUpAction: '继续观察',
        remarks: '自动催收短信，客户已读',
        effectiveScore: 4,
        duration: 0
      }
    ],
    
    // 征信记录
    creditReports: [
      {
        productKey: 'regular',
        reportDate: '2024-09-12',
        reportType: '个人信用报告',
        creditScore: 750,
        riskLevel: '低风险',
        queryCount: 3,
        overdueTimes: 0,
        maxOverdueDays: 0,
        totalCreditLimit: 50000,
        usedCreditLimit: 15000,
        creditUtilization: 30,
        accountCount: 5,
        normalAccounts: 5,
        overdueAccounts: 0,
        reportSource: '人民银行征信中心',
        validUntil: '2024-12-12'
      },
      {
        productKey: 'fixed',
        reportDate: '2024-09-10',
        reportType: '个人信用报告',
        creditScore: 720,
        riskLevel: '低风险',
        queryCount: 2,
        overdueTimes: 0,
        maxOverdueDays: 0,
        totalCreditLimit: 30000,
        usedCreditLimit: 8000,
        creditUtilization: 27,
        accountCount: 3,
        normalAccounts: 3,
        overdueAccounts: 0,
        reportSource: '人民银行征信中心',
        validUntil: '2024-12-10'
      },
      {
        productKey: 'loan001',
        reportDate: '2024-08-15',
        reportType: '企业信用报告',
        creditScore: 680,
        riskLevel: '中风险',
        queryCount: 5,
        overdueTimes: 1,
        maxOverdueDays: 15,
        totalCreditLimit: 100000,
        usedCreditLimit: 45000,
        creditUtilization: 45,
        accountCount: 3,
        normalAccounts: 2,
        overdueAccounts: 1,
        reportSource: '人民银行征信中心',
        validUntil: '2024-11-15'
      }
    ],
    
    // 营销记录
    marketingRecords: {
      touchRecords: [
        {
          id: 'TCH003',
          touchDate: '2024-01-15',
          touchChannel: '短信',
          campaignName: '还款提醒',
          campaignType: '风险提醒',
          content: '您的贷款即将到期，请及时还款避免逾期',
          targetAudience: '逾期风险客户',
          touchResult: '成功',
          responseAction: '忽略',
          conversionValue: 0,
          cost: 0.1
        }
      ],
      benefitRecords: [
        {
          id: 'BEN003',
          benefitDate: '2023-11-01',
          benefitType: '利率优惠',
          benefitName: '忠诚客户利率减免',
          benefitValue: 0.5,
          benefitStatus: '已过期',
          expiryDate: '2023-12-31',
          sourceActivity: '客户挽留活动',
          usageRestriction: '仅限现有贷款产品'
        }
      ],
      effectAnalysis: {
        totalTouchCount: 8,
        successfulTouchCount: 5,
        conversionRate: 0.625,
        totalCost: 15,
        totalRevenue: 500,
        roi: 33.33,
        customerLifetimeValue: 80000
      }
    },
    
    maxOverdueDays: 90,
    currentOverdueDays: 0,
    totalLoanAmount: 375000,
    totalCreditAmount: 500000,
    overdueAmount: 0,
    repaymentRate: 100,
    
    creditsList: [
      {
        creditNo: '20701432',
        productKey: 'regular',
        creditDate: '2024-09-12 12:09:12',
        channel: '小米',
        productName: '个人综合授信',
        result: '通过',
        rejectReason: '-',
        initialAmount: 1000.00,
        currentAmount: 2000.00,
        usedAmount: 1500.00,
        riskLevel: '正常',
        rate: 4.85,
        period: 12,
        expiryDate: '2034-09-11'
      },
      {
        creditNo: '20479894',
        productKey: 'fixed',
        creditDate: '2024-09-12 12:09:12',
        channel: '苹果',
        productName: '个人消费信用贷',
        result: '通过',
        rejectReason: '-',
        initialAmount: 1000.00,
        currentAmount: 2000.00,
        usedAmount: 1500.00,
        riskLevel: '正常',
        rate: 6.50,
        period: 12,
        expiryDate: '2026-11-04'
      },
      {
        creditNo: '23446863',
        productKey: 'loan001',
        creditDate: '2024-09-12 12:09:12',
        channel: '黑莓',
        productName: '个人经营贷款',
        result: '通过',
        rejectReason: '-',
        initialAmount: 1000.00,
        currentAmount: 2000.00,
        usedAmount: 1500.00,
        riskLevel: '正常',
        rate: 5.50,
        period: 12,
        expiryDate: '2025-09-11' 
      }
    ],
    
    loanRecords: [
      {
        loanNo: '3276234',
        productKey: 'regular',
        loanDate: '2024-09-12 12:09:12',
        bankCard: '1234****7890',
        channel: '小米',
        productName: '个人住房贷款',
        result: '通过',
        rejectReason: '-',
        contractNo: '93719123',
        status: '正常',
        amount: 1200.00,
        balance: 1200.00,
        installments: 12,
        paidInstallments: 1,
        nextPayment: 100.00,
        nextPaymentDate: '2024-11-05',
        repaymentDetails: [],
        repaymentPlan: []
      },
      {
        loanNo: '8673241',
        productKey: 'fixed',
        loanDate: '2024-09-12 12:09:12',
        bankCard: '1234****7890',
        channel: '高德',
        productName: '个人消费贷款',
        result: '通过',
        rejectReason: '-',
        contractNo: '48023413',
        status: '正常',
        amount: 1200.00,
        balance: 1200.00,
        installments: 12,
        paidInstallments: 6,
        nextPayment: 100.00,
        nextPaymentDate: '2024-11-20',
        repaymentDetails: [],
        repaymentPlan: []
      },
      {
        loanNo: '8790008',
        productKey: 'loan001',
        loanDate: '2024-09-12 12:09:12',
        bankCard: '1234****7890',
        channel: '美团',
        productName: '个人消费贷款',
        result: '通过',
        rejectReason: '-',
        contractNo: '87319433',
        status: '正常',
        amount: 1200.00,
        balance: 1200.00,
        installments: 12,
        paidInstallments: 6,
        nextPayment: 100.00,
        nextPaymentDate: '2024-11-20',
        repaymentDetails: [],
        repaymentPlan: []
      }
    ],
    
    quotaAdjustHistory: [
      {
        customerNo: '123',
        productKey: 'regular',
        adjustDate: '2024-09-12 12:09:12',
        beforeAmount: 1000,
        afterAmount: 2000,
        adjustReason: '客户信用评级提升',
        beforeRate: 5.25,
        afterRate: 4.85,
        beforePeriod: 12,
        afterPeriod: 24,
        operator: '李经理',
        result: '成功'
      },
      {
        customerNo: '123',
        productKey: 'fixed',
        adjustDate: '2024-06-05 10:30:45',
        beforeAmount: 500,
        afterAmount: 1000,
        adjustReason: '定期评估调整',
        beforeRate: 5.75,
        afterRate: 5.25,
        beforePeriod: 6,
        afterPeriod: 12,
        operator: '王经理',
        result: '成功'
      },
      {
        customerNo: '123',
        productKey: 'loan001',
        adjustDate: '2024-03-20 16:45:12',
        beforeAmount: 300,
        afterAmount: 500,
        adjustReason: '首次授信',
        beforeRate: 0,
        afterRate: 5.75,
        beforePeriod: 0,
        afterPeriod: 6,
        operator: '系统',
        result: '成功'
      }
    ]
  },
  // 用户'456'的记录已被删除
  
  // 空数据用户（用于测试空状态）
  'empty': {
    userId: 'empty',
    customerNo: 'empty',
    name: '空数据用户',
    mobile: '13800000000',
    idCard: '110101199003031234',
    gender: '男',
    age: 31,
    address: '北京市朝阳区',
    email: 'empty@example.com',
    idExpiry: '2030-12-31',
    status: 'active',
    joinDate: '2024-01-01',
    customerLevel: 'Bronze',
    similarity: 0,
    threshold: 0.8,
    errorMsg: '',
    depositProducts: [],
    loanProducts: [],
    totalLoanAmount: 0,
    totalCreditAmount: 0,
    overdueAmount: 0,
    repaymentRate: 0,
    creditsList: [],
    loanRecords: [],
    collectionRecords: [],
    creditReports: [],
    products: [],
    marketingRecords: {
      touchRecords: [],
      benefitRecords: [],
      effectAnalysis: {
        totalTouchCount: 0,
        successfulTouchCount: 0,
        conversionRate: 0,
        totalCost: 0,
        totalRevenue: 0,
        roi: 0,
        customerLifetimeValue: 0
      }
    },
    quotaAdjustHistory: [],
    maxOverdueDays: 0,
    currentOverdueDays: 0,
    totalCredit: 0,
    usedCredit: 0,
    availableCredit: 0
  },
  
  // 异常数据用户（用于测试错误处理）
  'error': {
    userId: 'error',
    customerNo: 'error',
    name: '异常用户',
    mobile: '13900000000',
    idCard: '110101199004041234',
    gender: '女',
    age: 30,
    address: '上海市浦东新区',
    email: 'error@example.com',
    idExpiry: '2025-01-01',
    status: 'suspended',
    joinDate: '2024-01-01',
    customerLevel: 'Silver',
    similarity: 0.5,
    threshold: 0.8,
    errorMsg: '数据异常',
    depositProducts: [],
    loanProducts: [],
    totalLoanAmount: 0,
    totalCreditAmount: 0,
    overdueAmount: 5000,
    repaymentRate: 0.3,
    creditsList: [],
    products: [
      {
        productKey: 'ERR001',
        productType: 'deposit',
        productName: '异常存款产品',
        amount: -1000, // 异常负余额
        startDate: '2024-01-01',
        rate: -0.5 // 异常负利率
      },
      {
        productKey: 'ERR002',
        productType: 'loan',
        productName: '异常贷款产品',
        amount: 0, // 异常零金额
        startDate: '2024-01-01',
        rate: 999 // 异常高利率
      }
    ],
    creditReports: [],
    loanRecords: [],
    collectionRecords: [
      {
        id: 'COL_ERR',
        collectionDate: '2024-13-32', // 异常日期
        collectionTime: '25:70', // 异常时间
        collectionMethod: '未知方式',
        collectorName: '',
        collectorPhone: 'invalid-phone',
        contactResult: '异常结果',
        customerResponse: '',
        riskLevel: '超高',
        followUpAction: '',
        remarks: '',
        effectiveScore: -1, // 异常评分
        duration: -10 // 异常时长
      }
    ],
    marketingRecords: {
      touchRecords: [],
      benefitRecords: [],
      effectAnalysis: {
        totalTouchCount: -1,
        successfulTouchCount: 10, // 成功数大于总数
        conversionRate: 1.5, // 异常转化率
        totalCost: -100,
        totalRevenue: -500,
        roi: -999,
        customerLifetimeValue: -50000
      }
    },
    quotaAdjustHistory: [],
    maxOverdueDays: -1,
    currentOverdueDays: -1,
    totalCredit: -10000,
    usedCredit: 20000, // 使用额度大于总额度
    availableCredit: -30000
  }
};

export { mockUsers };

export const fetchUserInfo = (userId: string): Promise<any> => {
  console.log('[搜索日志] 开始查询用户信息, userId:', userId, '时间戳:', Date.now());
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据userId查询用户数据
      const userData = mockUsers[userId];
      if (userData) {
        // 记录详细的数据结构信息
        console.log('[搜索日志] 用户信息查询成功, userId:', userId, '时间戳:', Date.now());
        console.debug('[数据完整性检查] 用户数据结构:', {
          userId: userId,
          timestamp: Date.now(),
          dataKeys: Object.keys(userData),
          hasBasicInfo: !!(userData.name && userData.age && userData.gender),
          depositProductsCount: userData.depositProducts?.length,
          loanProductsCount: userData.loanProducts?.length,
          creditsListCount: userData.creditsList?.length,
          loanRecordsCount: userData.loanRecords?.length,
          quotaAdjustHistoryCount: userData.quotaAdjustHistory?.length,
          // 检查关键字段是否存在
          hasMaxOverdueDays: 'maxOverdueDays' in userData,
          hasCurrentOverdueDays: 'currentOverdueDays' in userData,
          hasOverdueAmount: 'overdueAmount' in userData,
          hasRepaymentRate: 'repaymentRate' in userData,
          // 检查第一个产品数据的完整性
          firstDepositProduct: userData.depositProducts && userData.depositProducts.length > 0 ? {
            hasProductKey: 'productKey' in userData.depositProducts[0],
            hasName: 'name' in userData.depositProducts[0],
            hasBalance: 'balance' in userData.depositProducts[0],
            hasCurrency: 'currency' in userData.depositProducts[0],
            hasStatus: 'status' in userData.depositProducts[0],
            hasRate: 'rate' in userData.depositProducts[0]
          } : null,
          firstLoanProduct: userData.loanProducts && userData.loanProducts.length > 0 ? {
            hasProductKey: 'productKey' in userData.loanProducts[0],
            hasName: 'name' in userData.loanProducts[0],
            hasBalance: 'balance' in userData.loanProducts[0],
            hasCurrency: 'currency' in userData.loanProducts[0],
            hasStatus: 'status' in userData.loanProducts[0],
            hasRate: 'rate' in userData.loanProducts[0],
            hasRemainingPeriod: 'remainingPeriod' in userData.loanProducts[0],
            hasTotalPeriod: 'totalPeriod' in userData.loanProducts[0]
          } : null
        });
        resolve(userData);
      } else {
        console.log('[搜索日志] 用户信息查询失败, userId:', userId, '错误: 找不到用户相关信息', '时间戳:', Date.now());
        // 用户不存在时返回错误信息
        resolve({
          error: 'USER_NOT_FOUND',
          message: '找不到用户相关信息',
          userId: userId
        });
      }
    }, 500);
  });
};