// 用户画像接口
interface UserProfile {
  // 人口统计特征
  demographics: {
    ageGroup: string;        // 年龄段：青年/中年/老年
    genderLabel: string;     // 性别标识
    regionType: string;      // 地域归属：一线城市/二线城市/三线城市
    occupationType: string;  // 职业类别：企业员工/自由职业/退休等
    incomeLevel: string;     // 收入水平：高收入/中等收入/低收入
  };
  
  // 行为特征
  behavior: {
    loginActivity: string;   // 登录活跃度：高活跃/中活跃/低活跃
    usageHabits: string;     // 使用习惯：移动端偏好/PC端偏好/混合使用
    featurePreference: string; // 功能偏好：理财偏好/贷款偏好/支付偏好
    operationPattern: string;  // 操作行为：谨慎型/积极型/观望型
  };
  
  // 消费特征
  consumption: {
    spendingPower: string;   // 消费能力：高消费/中等消费/低消费
    frequency: string;       // 消费频次：高频/中频/低频
    preference: string;      // 消费偏好：品质型/价格型/便利型
    timePattern: string;     // 消费时段：工作日/周末/节假日
  };
  
  // 风险特征
  risk: {
    creditLevel: string;     // 信用等级：优秀/良好/一般/较差
    riskType: string;        // 风险类型：低风险/中风险/高风险
    repaymentCapacity: string; // 还款能力：强/中等/弱
    controlLevel: string;    // 风险控制：严格/一般/宽松
  };
  
  // 产品偏好
  productPreference: {
    holdingTypes: string[];  // 持有产品类型
    activityLevel: string;   // 使用活跃度：高活跃/中活跃/低活跃
    valueContribution: string; // 价值贡献：高价值/中价值/低价值
    preferredChannels: string[]; // 偏好渠道
    servicePreference: string;   // 服务偏好：自助服务/人工服务/混合服务
    lifecycleStage: string;      // 生命周期：新客户/成长期/成熟期/流失风险期
  };
  
  // 营销响应特征
  marketingResponse: {
    sensitivity: string;     // 营销敏感度：高敏感/中敏感/低敏感
    bestContactTime: string; // 最佳触达时间：工作时间/休息时间/任意时间
    effectiveChannels: string[]; // 有效营销渠道
    frequencyPreference: string; // 营销频次偏好：高频/中频/低频
  };
}

// 支付流程记录接口
interface PaymentProcessRecords {
  // 签约记录
  contractRecords: Array<{
    contractId: string;      // 合同ID
    productKey: string;      // 产品标识
    signDate: string;        // 签约日期
    signMethod: string;      // 签约方式：线上签约/线下签约/电子签约
    contractType: string;    // 合同类型：借款合同/担保合同/服务协议
    contractStatus: string;  // 合同状态：有效/失效/终止
    contractAmount: number;  // 合同金额
    contractTerm: number;    // 合同期限（月）
    signLocation: string;    // 签约地点
    documentUrl: string;     // 合同文件链接
  }>;
  
  // 放款记录
  disbursementRecords: Array<{
    disbursementId: string;  // 放款ID
    productKey: string;      // 产品标识
    disbursementDate: string; // 放款日期
    disbursementAmount: number; // 放款金额
    disbursementChannel: string; // 放款渠道：银行转账/第三方支付/现金
    receivingAccount: string;    // 收款账户
    disbursementStatus: string;  // 放款状态：成功/失败/处理中
    transactionId: string;       // 交易流水号
    arrivalTime: string;         // 到账时间
    handlingFee: number;         // 手续费
  }>;
  
  // 还款记录
  repaymentRecords: Array<{
    repaymentId: string;     // 还款ID
    productKey: string;      // 产品标识
    repaymentDate: string;   // 还款日期
    repaymentAmount: number; // 还款金额
    repaymentMethod: string; // 还款方式：自动扣款/主动还款/线下还款
    repaymentChannel: string; // 还款渠道：银行卡/支付宝/微信/现金
    repaymentStatus: string;  // 还款状态：成功/失败/部分还款
    paymentAccount: string;   // 付款账户
    transactionId: string;    // 交易流水号
    principalAmount: number;  // 本金金额
    interestAmount: number;   // 利息金额
    penaltyAmount: number;    // 罚息金额
    remainingBalance: number; // 剩余余额
  }>;
}

// 催收记录接口
interface CollectionRecord {
  id: string;
  productKey?: string;
  productName?: string; // 产品名称
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
  reportSource: string;
}

// 征信记录接口
interface CreditReport {
  reportId: string;
  reportDate: string;
  creditScore: number;
  creditGrade: string;
  reportType: string;
  reportStatus: string;
  queryReason: string;
  riskLevel: string;
  queryCount: number;
  overdueTimes: number;
  maxOverdueDays: number;
  totalCreditLimit: number;
  usedCreditLimit: number;
  creditUtilization: number;
  accountCount: number;
  normalAccounts: number;
  overdueAccounts: number;
  reportSource: string;
  validUntil: string;
  reportContent: {
    personalInfo: {
      name: string;
      idNumber: string;
      phoneNumber: string;
      address: string;
    };
    creditHistory: {
      totalAccounts: number;
      activeAccounts: number;
      overdueAccounts: number;
      maxOverdueDays: number;
    };
    publicRecords: {
      courtRecords: number;
      taxRecords: number;
      administrativePenalties: number;
    };
  };
  productKey?: string;
  productName?: string; // 产品名称
  loanNo?: string; // 贷款编号
  loanDate?: string; // 放款日期
  bankCard?: string; // 银行卡号
  channel?: string; // 渠道
  result?: string; // 结果
  rejectReason?: string; // 拒绝原因
  contractNo?: string; // 合同编号
  status?: string; // 状态
  amount?: number; // 金额
  balance?: number; // 余额
  installments?: number; // 分期数
  paidInstallments?: number; // 已还分期数
  nextPayment?: number; // 下期还款金额
  nextPaymentDate?: string; // 下期还款日期
  repaymentDetails?: any[]; // 还款详情
  repaymentPlan?: any[]; // 还款计划
}

// 营销记录接口
interface MarketingRecord {
  // 触达记录
  touchRecords: Array<{
    id: string;
    productKey?: string; // 关联的产品标识
    productName?: string; // 产品名称
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
    productKey?: string; // 关联的产品标识
    productName?: string; // 产品名称
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
  period: number;
  repaymentDate: string;
  actualPaymentDate: string;
  repaymentAmount: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  remainingBalance: number;
  status: string;
  repaymentMethod: string; // 自动扣款、主动还款、线下还款
  repaymentStatus: string; // 成功、失败、部分还款
  bankCard: string;
  transactionId: string;
  remarks: string;
}

// 扩展用信记录接口
interface EnhancedLoanRecord {
  loanNo: string;
  productKey: string;
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
  // 新增字段 - 根据需求文档
  overdueDays: number;           // 逾期天数
  maxOverdueDays: number;        // 历史最大逾期天数
  settlementDate?: string;       // 结清日期
  currentPeriod: number;         // 当前期次
  remainingPrincipal: number;    // 剩余本金
  remainingInterest: number;     // 剩余利息
  remainingPenalty: number;      // 剩余罚息
  remainingTotal: number;        // 剩余应还总额
  loanRate: number;              // 借款利率
  // 原有字段
  repaymentDetails: RepaymentDetail[];
  repaymentPlan: Array<{
    period: number;
    dueDate: string;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    remainingBalance: number;
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
  // 删除自营产品列表字段定义，统一使用products数组
  maxOverdueDays: number;
  currentOverdueDays: number;
  totalLoanAmount: number;
  totalCreditAmount: number;
  overdueAmount: number;
  repaymentRate: number;
  userProfile?: UserProfile;  // 用户画像数据
  paymentProcessRecords?: PaymentProcessRecords;  // 支付流程记录数据
  creditsList: Array<{
    creditNo: string;
    productKey?: string;
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
    productKey?: string;
    productName?: string; // 产品名称
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
    fee?: number; // 费用（如年费、手续费等）
    appInfo?: {
      deviceName: string;
      brand: string;
      ssid: string;
      bssid: string;
      lon: number;
      lat: number;
      homeAddress: string;
      gpsAddress: string;
      packageName: string;
      versionName: string;
      firstInstallTime: string;
      lastUpdateTime: string;
      extraParams: {
        name: string;
        phone: string;
      };
    };
  }>;
}

const mockUsers: { [key: string]: UserData } = {
  // 添加一个有效的用户ID '887123'，与图片中显示的一致
  '887123': {
    userId: '887123',
    name: '张*',
    products: [
      {
        productKey: 'LN-2024-002',
        productType: 'loan',
        productName: '蚂蚁借呗',
        amount: 50000,
        rate: 4.35,
        startDate: '2023-08-15'
      },
      {
        productKey: 'LN-2024-003',
        productType: 'loan',
        productName: '京东白条',
        amount: 100000,
        rate: 5.2,
        startDate: '2023-09-20'
      },
      {
        productKey: 'LN-2024-009',
        productType: 'loan',
        productName: 'Su贷',
        amount: 200000,
        rate: 3.9,
        startDate: '2024-01-15',
        appInfo: {
          deviceName: 'iPhone 14 Pro',
          brand: 'Apple',
          ssid: 'Home_WiFi_5G',
          bssid: 'aa:bb:cc:dd:ee:ff',
          lon: 121.4737,
          lat: 31.2304,
          homeAddress: '上海市浦东新区张江高科技园区',
          gpsAddress: '上海市浦东新区世纪大道1000号',
          packageName: 'com.sudai.app',
          versionName: '2.1.5',
          firstInstallTime: '2023-12-01',
          lastUpdateTime: '2024-01-10',
          extraParams: {
            name: '张三',
            phone: '138****5678'
          }
        }
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
    totalCredit: 80000,
    usedCredit: 30000,
    availableCredit: 50000,
    similarity: 9.876543,
    threshold: 60.00,
    errorMsg: '当日已核查通过',
    
    // 删除自营产品列表，统一使用products数组
    
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
        duration: 15,
        reportSource: '催收系统'
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
        duration: 0,
        reportSource: '催收系统'
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
        creditGrade: 'AA',
        riskLevel: '正常',
        validUntil: '2024-07-15',
        queryReason: '贷款审批',
        reportStatus: '有效',
        queryCount: 2,
        overdueTimes: 0,
        maxOverdueDays: 0,
        totalCreditLimit: 100000,
        usedCreditLimit: 30000,
        creditUtilization: 30,
        accountCount: 3,
        normalAccounts: 3,
        overdueAccounts: 0,
        reportContent: {
          personalInfo: {
            name: '张三',
            idNumber: '110*******123X',
            phoneNumber: '138****5678',
            address: '北京市朝阳区'
          },
          creditHistory: {
            totalAccounts: 3,
            activeAccounts: 3,
            overdueAccounts: 0,
            maxOverdueDays: 0
          },
          publicRecords: {
            courtRecords: 0,
            taxRecords: 0,
            administrativePenalties: 0
          }
        }
      }
    ],
    
    // 营销记录
    marketingRecords: {
      touchRecords: [
        {
          id: 'TCH001',
          productKey: 'LN-2024-001',
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
          productKey: 'LN-2024-001',
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
        },
        {
          id: 'TCH003',
          productKey: 'LN-2024-002',
          touchDate: '2024-01-15',
          touchChannel: '微信公众号',
          campaignName: '春节保险特惠',
          campaignType: '保险推广',
          content: '春节出行保险，全家保障仅需99元',
          targetAudience: '家庭客户',
          touchResult: '成功',
          responseAction: '购买',
          conversionValue: 99,
          cost: 5
        },
        {
          id: 'TCH004',
          productKey: 'LN-2024-001',
          touchDate: '2024-01-20',
          touchChannel: '邮件',
          campaignName: '投资理财讲座',
          campaignType: '教育营销',
          content: '专业理财师在线讲座，教您如何配置资产',
          targetAudience: '投资客户',
          touchResult: '成功',
          responseAction: '报名',
          conversionValue: 0,
          cost: 1
        },
        {
          id: 'TCH005',
          productKey: 'LN-2024-002',
          touchDate: '2024-01-25',
          touchChannel: '电话外呼',
          campaignName: '贷款利率优惠',
          campaignType: '产品推广',
          content: '个人消费贷款利率下调0.5%，限时申请',
          targetAudience: '有贷款需求客户',
          touchResult: '成功',
          responseAction: '咨询',
          conversionValue: 80000,
          cost: 15
        },
        {
          id: 'TCH006',
          productKey: 'LN-2024-001',
          touchDate: '2024-01-30',
          touchChannel: '网点推广',
          campaignName: '黄金投资节',
          campaignType: '贵金属推广',
          content: '黄金投资产品，抗通胀首选',
          targetAudience: '保值客户',
          touchResult: '成功',
          responseAction: '购买',
          conversionValue: 20000,
          cost: 8
        }
      ],
      benefitRecords: [
        {
          id: 'BEN001',
          productKey: 'LN-2024-001',
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
          productKey: 'LN-2024-001',
          benefitDate: '2023-12-25',
          benefitType: '优惠券',
          benefitName: '理财产品购买券',
          benefitValue: 500,
          benefitStatus: '已使用',
          useDate: '2024-01-10',
          expiryDate: '2024-03-25',
          sourceActivity: '圣诞节活动',
          usageRestriction: '仅限理财产品使用'
        },
        {
          id: 'BEN003',
          productKey: 'LN-2024-002',
          benefitDate: '2024-01-08',
          benefitType: '现金红包',
          benefitName: '理财收益加成红包',
          benefitValue: 88,
          benefitStatus: '已发放',
          expiryDate: '2024-02-08',
          sourceActivity: '理财节活动',
          usageRestriction: '购买理财产品时自动抵扣'
        },
        {
          id: 'BEN004',
          productKey: 'LN-2024-001',
          benefitDate: '2024-01-12',
          benefitType: '免费服务',
          benefitName: '专属理财师咨询',
          benefitValue: 200,
          benefitStatus: '已使用',
          useDate: '2024-01-20',
          expiryDate: '2024-04-12',
          sourceActivity: '高端客户专享',
          usageRestriction: '限一对一理财咨询服务'
        },
        {
          id: 'BEN005',
          productKey: 'LN-2024-002',
          benefitDate: '2024-01-18',
          benefitType: '积分倍增',
          benefitName: '消费积分双倍奖励',
          benefitValue: 2,
          benefitStatus: '已发放',
          expiryDate: '2024-02-18',
          sourceActivity: '信用卡推广',
          usageRestriction: '信用卡消费积分翻倍'
        },
        {
          id: 'BEN006',
          productKey: 'LN-2024-001',
          benefitDate: '2024-01-22',
          benefitType: '手续费减免',
          benefitName: '转账手续费全免券',
          benefitValue: 50,
          benefitStatus: '未使用',
          expiryDate: '2024-03-22',
          sourceActivity: '客户回馈活动',
          usageRestriction: '限跨行转账手续费减免'
        }
      ],
      effectAnalysis: {
        totalTouchCount: 21,
        successfulTouchCount: 18,
        conversionRate: 0.86,
        totalCost: 86.1,
        totalRevenue: 160199,
        roi: 1860,
        customerLifetimeValue: 180000
      }
    },
    
    maxOverdueDays: 15,
    currentOverdueDays: 0,
    totalLoanAmount: 1540000,
    totalCreditAmount: 350000,
    overdueAmount: 0,
    repaymentRate: 100,
    
    creditsList: [
      {
        creditNo: '20701555',
        productKey: 'LN-2024-002',
        creditDate: '2023-08-15 10:20:30',
        openDate: '2023-08-15', // 新增字段：开户日期
        channel: '手机银行',
        productName: '蚂蚁借呗',
        result: '通过',
        status: '正常', // 新增字段：状态（从result字段转换）
        rejectReason: '-',
        initialAmount: 50000.00,
        currentAmount: 50000.00,
        usedAmount: 30000.00,
        riskLevel: '正常',
        rate: 4.35,
        period: 24,
        expiryDate: '2025-08-14'
      },
      {
        creditNo: '20701556',
        productKey: 'LN-2024-003',
        creditDate: '2023-09-20 11:15:20',
        openDate: '2023-09-20', // 新增字段：开户日期
        channel: '手机银行',
        productName: '京东白条',
        result: '通过',
        status: '正常', // 新增字段：状态（从result字段转换）
        rejectReason: '-',
        initialAmount: 100000.00,
        currentAmount: 100000.00,
        usedAmount: 80000.00,
        riskLevel: '正常',
        rate: 5.2,
        period: 12,
        expiryDate: '2024-09-19'
      },
      {
        creditNo: '20701564',
        productKey: 'LN-2024-009',
        creditDate: '2024-01-15 14:30:20',
        openDate: '2024-01-15', // 新增字段：开户日期
        channel: 'Su贷APP',
        productName: 'Su贷',
        result: '通过',
        status: '正常', // 新增字段：状态（从result字段转换）
        rejectReason: '-',
        initialAmount: 200000.00,
        currentAmount: 200000.00,
        usedAmount: 150000.00,
        riskLevel: '正常',
        rate: 3.9,
        period: 36,
        expiryDate: '2027-01-14'
      }
    ],
    
    loanRecords: [
      {
        productKey: 'LN-2024-002',
        loanNo: '3276555',
        loanId: '3276555', // 新增字段：用信ID（映射自loanNo）
        loanDate: '2023-08-15 10:30:45',
        dueDate: '2024-02-15', // 新增字段：到期日期（映射自nextPaymentDate）
        bankCard: '6228****9876',
        channel: '手机银行',
        productName: '蚂蚁借呗',
        result: '通过',
        rejectReason: '-',
        contractNo: 'HT-20230815-005',
        status: '正常',
        amount: 50000.00,
        loanAmount: 50000.00, // 新增字段：借款金额（映射自amount）
        balance: 30000.00,
        remainingAmount: 30000.00, // 新增字段：剩余金额（映射自balance）
        installments: 24,
        paidInstallments: 8,
        nextPayment: 2200.00,
        nextPaymentDate: '2024-02-15',
        // 新增字段
        overdueDays: 0,
        maxOverdueDays: 5,
        settlementDate: undefined,
        currentPeriod: 9,
        remainingPrincipal: 28100.00,
        remainingInterest: 4800.00,
        remainingPenalty: 0,
        remainingTotal: 32900.00,
        loanRate: 4.35,
        disbursementRecords: [
          {
            batch: 1,
            disbursementDate: '2023-08-15',
            amount: 50000.00,
            bankName: '招商银行',
            bankCard: '6228****9876',
            channel: '银行转账',
            transactionId: 'TXN-20230815-001',
            status: '成功',
            processStatus: '已到账',
            remark: '首次放款'
          }
        ],
        repaymentDetails: [
          {
            repaymentId: 'RPY001',
            period: 1,
            repaymentDate: '2023-09-15',
            dueDate: '2023-09-15',
            amount: 2200.00,
            principal: 1800.00,
            interest: 400.00,
            penalty: 0,
            fee: 0,
            method: '自动扣款',
            status: '已还',
            overdueDays: 0,
            actualPaymentDate: '2023-09-15',
            repaymentAmount: 2200.00,
            principalAmount: 1800.00,
            interestAmount: 400.00,
            penaltyAmount: 0,
            totalAmount: 2200.00,
            remainingBalance: 48200.00,
            repaymentMethod: '自动扣款',
            repaymentStatus: '成功',
            bankCard: '****9876',
            transactionId: 'TXN001',
            remarks: '按时还款'
          },
          {
            repaymentId: 'RPY002',
            period: 2,
            repaymentDate: '2023-10-15',
            dueDate: '2023-10-15',
            amount: 2200.00,
            principal: 1850.00,
            interest: 350.00,
            penalty: 0,
            fee: 0,
            method: '自动扣款',
            status: '已还',
            overdueDays: 0,
            actualPaymentDate: '2023-10-15',
            repaymentAmount: 2200.00,
            principalAmount: 1850.00,
            interestAmount: 350.00,
            penaltyAmount: 0,
            totalAmount: 2200.00,
            remainingBalance: 46350.00,
            repaymentMethod: '自动扣款',
            repaymentStatus: '成功',
            bankCard: '****9876',
            transactionId: 'TXN002',
            remarks: '按时还款'
          }
        ],
        repaymentPlan: [
          {
            period: 9,
            dueDate: '2024-02-15',
            amount: 2200.00,
            principal: 1900.00,
            interest: 300.00,
            status: '待还',
            principalAmount: 1900.00,
            interestAmount: 300.00,
            totalAmount: 2200.00,
            remainingBalance: 28100.00
          },
          {
            period: 10,
            dueDate: '2024-03-15',
            amount: 2200.00,
            principal: 1950.00,
            interest: 250.00,
            status: '待还',
            principalAmount: 1950.00,
            interestAmount: 250.00,
            totalAmount: 2200.00,
            remainingBalance: 26150.00
          }
        ]
      },
      {
        productKey: 'LN-2024-003',
        loanNo: '3276556',
        loanId: '3276556', // 新增字段：用信ID（映射自loanNo）
        loanDate: '2023-09-20 14:20:30',
        dueDate: '2024-02-20', // 新增字段：到期日期（映射自nextPaymentDate）
        bankCard: '6228****9876',
        channel: '手机银行',
        productName: '京东白条',
        result: '通过',
        rejectReason: '-',
        contractNo: 'HT-20230920-006',
        status: '正常',
        amount: 30000.00,
        loanAmount: 30000.00, // 新增字段：借款金额（映射自amount）
        balance: 25000.00,
        remainingAmount: 25000.00, // 新增字段：剩余金额（映射自balance）
        installments: 12,
        paidInstallments: 3,
        nextPayment: 2800.00,
        nextPaymentDate: '2024-02-20',
        // 新增字段
        overdueDays: 0,
        maxOverdueDays: 0,
        settlementDate: undefined,
        currentPeriod: 4,
        remainingPrincipal: 22600.00,
        remainingInterest: 2400.00,
        remainingPenalty: 0,
        remainingTotal: 25000.00,
        loanRate: 5.2,
        disbursementRecords: [
          {
            batch: 1,
            disbursementDate: '2023-09-20',
            amount: 30000.00,
            bankName: '招商银行',
            bankCard: '6228****9876',
            channel: '手机银行',
            transactionId: 'TXN-20230920-001',
            status: '成功',
            processStatus: '已到账',
            remark: '京东白条放款'
          }
        ],
        repaymentDetails: [
          {
            repaymentId: 'RPY003',
            period: 1,
            repaymentDate: '2023-10-20',
            dueDate: '2023-10-20',
            amount: 2800.00,
            principal: 2300.00,
            interest: 500.00,
            penalty: 0,
            fee: 0,
            method: '主动还款',
            status: '已还',
            overdueDays: 0,
            actualPaymentDate: '2023-10-20',
            repaymentAmount: 2800.00,
            principalAmount: 2300.00,
            interestAmount: 500.00,
            penaltyAmount: 0,
            totalAmount: 2800.00,
            remainingBalance: 27700.00,
            repaymentMethod: '主动还款',
            repaymentStatus: '成功',
            bankCard: '****9876',
            transactionId: 'TXN003',
            remarks: '按时还款'
          }
        ],
        repaymentPlan: [
          {
            period: 4,
            dueDate: '2024-02-20',
            amount: 2800.00,
            principal: 2400.00,
            interest: 400.00,
            status: '待还',
            principalAmount: 2400.00,
            interestAmount: 400.00,
            totalAmount: 2800.00,
            remainingBalance: 22600.00
          }
        ]
      },
      {
        productKey: 'LN-2024-009',
        loanNo: '3276564',
        loanId: '3276564', // 新增字段：用信ID（映射自loanNo）
        loanDate: '2024-01-15 14:30:20',
        dueDate: '2024-04-15', // 新增字段：到期日期（映射自nextPaymentDate）
        bankCard: '6228****9876',
        channel: 'Su贷APP',
        productName: 'Su贷',
        result: '通过',
        rejectReason: '-',
        contractNo: 'HT-20240115-009',
        status: '正常',
        amount: 200000.00,
        loanAmount: 200000.00, // 新增字段：借款金额（映射自amount）
        balance: 150000.00,
        remainingAmount: 150000.00, // 新增字段：剩余金额（映射自balance）
        installments: 36,
        paidInstallments: 2,
        nextPayment: 4520.80,
        nextPaymentDate: '2024-04-15',
        // 新增字段
        overdueDays: 3,
        maxOverdueDays: 10,
        settlementDate: undefined,
        currentPeriod: 3,
        remainingPrincipal: 187860.65,
        remainingInterest: 15680.50,
        remainingPenalty: 450.80,
        remainingTotal: 203991.95,
        loanRate: 3.9,
        disbursementRecords: [
          {
            batch: 1,
            disbursementDate: '2024-01-15',
            amount: 200000.00,
            bankName: '招商银行',
            bankCard: '6228****9876',
            channel: 'Su贷APP',
            transactionId: 'TXN-20240115-001',
            status: '成功',
            processStatus: '已到账',
            remark: 'Su贷大额放款'
          }
        ],
        repaymentDetails: [
          {
            repaymentId: 'RPY009',
            period: 1,
            repaymentDate: '2024-02-15',
            dueDate: '2024-02-15',
            amount: 4520.80,
            principal: 4033.30,
            interest: 487.50,
            penalty: 0,
            fee: 0,
            method: '自动扣款',
            status: '已还',
            overdueDays: 0,
            actualPaymentDate: '2024-02-15',
            repaymentAmount: 4520.80,
            principalAmount: 4033.30,
            interestAmount: 487.50,
            penaltyAmount: 0,
            totalAmount: 4520.80,
            remainingBalance: 195966.70,
            repaymentMethod: '自动扣款',
            repaymentStatus: '成功',
            bankCard: '****9876',
            transactionId: 'TXN009',
            remarks: '按时还款'
          },
          {
            repaymentId: 'RPY010',
            period: 2,
            repaymentDate: '2024-03-15',
            dueDate: '2024-03-15',
            amount: 4520.80,
            principal: 4046.40,
            interest: 474.40,
            penalty: 0,
            fee: 0,
            method: '自动扣款',
            status: '已还',
            overdueDays: 0,
            actualPaymentDate: '2024-03-15',
            repaymentAmount: 4520.80,
            principalAmount: 4046.40,
            interestAmount: 474.40,
            penaltyAmount: 0,
            totalAmount: 4520.80,
            remainingBalance: 191920.30,
            repaymentMethod: '自动扣款',
            repaymentStatus: '成功',
            bankCard: '****9876',
            transactionId: 'TXN010',
            remarks: '按时还款'
          }
        ],
        repaymentPlan: [
          {
            period: 3,
            dueDate: '2024-04-15',
            amount: 4520.80,
            principal: 4059.65,
            interest: 461.15,
            status: '待还',
            principalAmount: 4059.65,
            interestAmount: 461.15,
            totalAmount: 4520.80,
            remainingBalance: 187860.65
          },
          {
            period: 4,
            dueDate: '2024-05-15',
            amount: 4520.80,
            principal: 4073.05,
            interest: 447.75,
            status: '待还',
            principalAmount: 4073.05,
            interestAmount: 447.75,
            totalAmount: 4520.80,
            remainingBalance: 183787.60
          }
        ]
      }
    ],
    
    quotaAdjustHistory: [
      {
        customerNo: '887123',
        productKey: 'LN-2024-002',
        productName: '蚂蚁借呗',
        adjustDate: '2023-09-15 14:30:22',
        adjustmentDate: '2023-09-15 14:30:22', // 新增字段：调额日期（映射自adjustDate）
        beforeAmount: 30000,
        previousAmount: 30000, // 新增字段：调额前金额（映射自beforeAmount）
        afterAmount: 50000,
        newAmount: 50000, // 新增字段：调额后金额（映射自afterAmount）
        adjustmentAmount: 20000, // 新增字段：调额金额（计算得出）
        type: '提额', // 新增字段：调额类型（根据金额变化计算）
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
        productKey: 'LN-2024-003',
        productName: '京东白条',
        adjustDate: '2023-10-20 16:45:10',
        adjustmentDate: '2023-10-20 16:45:10', // 新增字段：调额日期（映射自adjustDate）
        beforeAmount: 20000,
        previousAmount: 20000, // 新增字段：调额前金额（映射自beforeAmount）
        afterAmount: 30000,
        newAmount: 30000, // 新增字段：调额后金额（映射自afterAmount）
        adjustmentAmount: 10000, // 新增字段：调额金额（计算得出）
        type: '提额', // 新增字段：调额类型（根据金额变化计算）
        adjustReason: '消费行为良好',
        beforeRate: 5.8,
        afterRate: 5.2,
        beforePeriod: 6,
        afterPeriod: 12,
        operator: '系统',
        result: '成功'
      },
      {
        customerNo: '887123',
        productKey: 'LN-2024-009',
        productName: 'Su贷',
        adjustDate: '2024-02-01 10:30:15',
        adjustmentDate: '2024-02-01 10:30:15', // 新增字段：调额日期（映射自adjustDate）
        beforeAmount: 150000,
        previousAmount: 150000, // 新增字段：调额前金额（映射自beforeAmount）
        afterAmount: 200000,
        newAmount: 200000, // 新增字段：调额后金额（映射自afterAmount）
        adjustmentAmount: 50000, // 新增字段：调额金额（计算得出）
        type: '提额', // 新增字段：调额类型（根据金额变化计算）
        adjustReason: '信用评级提升',
        beforeRate: 4.2,
        afterRate: 3.9,
        beforePeriod: 24,
        afterPeriod: 36,
        operator: '系统',
        result: '成功'
      }
    ],
    
    // 用户画像数据
    userProfile: {
      demographics: {
        ageGroup: '中年',
        genderLabel: '男性',
        regionType: '一线城市',
        occupationType: '企业员工',
        incomeLevel: '中等收入'
      },
      behavior: {
        loginActivity: '中活跃',
        usageHabits: '移动端偏好',
        featurePreference: '贷款偏好',
        operationPattern: '谨慎型'
      },
      consumption: {
        spendingPower: '中等消费',
        frequency: '中频',
        preference: '品质型',
        timePattern: '工作日'
      },
      risk: {
        creditLevel: '良好',
        riskType: '低风险',
        repaymentCapacity: '强',
        controlLevel: '一般'
      },
      productPreference: {
        holdingTypes: ['消费贷款'],
        activityLevel: '中活跃',
        valueContribution: '中价值',
        preferredChannels: ['手机银行', 'APP'],
        servicePreference: '自助服务',
        lifecycleStage: '成熟期'
      },
      marketingResponse: {
        sensitivity: '中敏感',
        bestContactTime: '工作时间',
        effectiveChannels: ['APP推送', '短信'],
        frequencyPreference: '中频'
      }
    },
    
    // 支付流程记录数据（转换为数组格式以匹配前端组件需求）
    paymentProcessRecords: [
      {
        paymentId: 'CT-20230815-001', // 新增字段：支付ID（映射自contractId）
        productKey: 'LN-2024-002',
        status: '有效', // 新增字段：状态（映射自contractStatus）
        amount: 50000, // 新增字段：金额（映射自contractAmount）
        paymentMethod: '电子签约', // 新增字段：支付方式（映射自signMethod）
        paymentTime: '2023-08-15', // 新增字段：支付时间（映射自signDate）
        type: '合同签约',
        contractId: 'CT-20230815-001',
        signDate: '2023-08-15',
        signMethod: '电子签约',
        contractType: '借款合同',
        contractStatus: '有效',
        contractAmount: 50000,
        contractTerm: 24,
        signLocation: '线上',
        documentUrl: '/contracts/CT-20230815-001.pdf'
      },
      {
        paymentId: 'DB-20230815-001', // 新增字段：支付ID（映射自disbursementId）
        productKey: 'LN-2024-002',
        status: '成功', // 新增字段：状态（映射自disbursementStatus）
        amount: 50000, // 新增字段：金额（映射自disbursementAmount）
        paymentMethod: '银行转账', // 新增字段：支付方式（映射自disbursementChannel）
        paymentTime: '2023-08-15', // 新增字段：支付时间（映射自disbursementDate）
        type: '放款记录',
        disbursementId: 'DB-20230815-001',
        disbursementDate: '2023-08-15',
        disbursementAmount: 50000,
        disbursementChannel: '银行转账',
        receivingAccount: '6228****9876',
        disbursementStatus: '成功',
        transactionId: 'TXN-20230815-001',
        arrivalTime: '2023-08-15 15:30:00',
        handlingFee: 0
      },
      {
        paymentId: 'RP-20230915-001', // 新增字段：支付ID（映射自repaymentId）
        productKey: 'LN-2024-002',
        status: '成功', // 新增字段：状态（映射自repaymentStatus）
        amount: 2500, // 新增字段：金额（映射自repaymentAmount）
        paymentMethod: '自动扣款', // 新增字段：支付方式（映射自repaymentMethod）
        paymentTime: '2023-09-15', // 新增字段：支付时间（映射自repaymentDate）
        type: '还款记录',
        repaymentId: 'RP-20230915-001',
        repaymentDate: '2023-09-15',
        repaymentAmount: 2500,
        repaymentMethod: '自动扣款',
        repaymentChannel: '银行卡',
        repaymentStatus: '成功',
        paymentAccount: '6228****9876',
        transactionId: 'TXN-20230915-001',
        principalAmount: 1800,
        interestAmount: 700,
        penaltyAmount: 0,
        remainingBalance: 48200
      },
      {
        paymentId: 'RP-20231015-001', // 新增字段：支付ID（映射自repaymentId）
        productKey: 'LN-2024-002',
        status: '成功', // 新增字段：状态（映射自repaymentStatus）
        amount: 2500, // 新增字段：金额（映射自repaymentAmount）
        paymentMethod: '自动扣款', // 新增字段：支付方式（映射自repaymentMethod）
        paymentTime: '2023-10-15', // 新增字段：支付时间（映射自repaymentDate）
        type: '还款记录',
        repaymentId: 'RP-20231015-001',
        repaymentDate: '2023-10-15',
        repaymentAmount: 2500,
        repaymentMethod: '自动扣款',
        repaymentChannel: '银行卡',
        repaymentStatus: '成功',
        paymentAccount: '6228****9876',
        transactionId: 'TXN-20231015-001',
        principalAmount: 1850,
        interestAmount: 650,
        penaltyAmount: 0,
        remainingBalance: 45700
      }
    ]
  },
  '123': {
    userId: '123',
    name: '李*',
    products: [
      {
        productKey: 'LN-2024-001',
        productType: 'loan',
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
    
    // 删除自营产品列表，统一使用products数组
    
    // 催收记录
    collectionRecords: [
      {
        id: 'COL003',
        productKey: 'LN-2024-002',
        productName: '蚂蚁借呗',
        collectionDate: '2024-01-22',
        collectionTime: '09:00',
        collectionMethod: '电话',
        collectorName: '王催收',
        collectorPhone: '400-123-4569',
        contactResult: '拒接',
        customerResponse: '无应答',
        riskLevel: '高',
        followUpAction: '上门催收',
        remarks: '蚂蚁借呗逾期催收，多次拒接电话',
        effectiveScore: 2,
        duration: 0,
        reportSource: '催收系统'
      },
      {
        id: 'COL004',
        productKey: 'LN-2024-002',
        productName: '蚂蚁借呗',
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
        remarks: '蚂蚁借呗客户经济困难，需要协商还款计划',
        effectiveScore: 6,
        duration: 30,
        reportSource: '催收系统'
      },
      {
        id: 'COL005',
        productKey: 'LN-2024-003',
        productName: '京东白条',
        collectionDate: '2024-01-18',
        collectionTime: '14:30',
        collectionMethod: '短信',
        collectorName: '系统',
        collectorPhone: '400-123-4567',
        contactResult: '已发送',
        customerResponse: '已读',
        riskLevel: '中',
        followUpAction: '继续观察',
        remarks: '京东白条自动催收短信，客户已读',
        effectiveScore: 4,
        duration: 0,
        reportSource: '催收系统'
      },
      {
        id: 'COL006',
        productKey: 'LN-2024-004',
        productName: '微粒贷',
        collectionDate: '2024-01-15',
        collectionTime: '10:30',
        collectionMethod: '电话',
        collectorName: '李催收',
        collectorPhone: '400-123-4571',
        contactResult: '联系成功',
        customerResponse: '申请延期',
        riskLevel: '中',
        followUpAction: '审核延期申请',
        remarks: '微粒贷客户申请延期还款，需要审核',
        effectiveScore: 5,
        duration: 15,
        reportSource: '催收系统'
      },
      {
        id: 'COL007',
        productKey: 'CC-2024-001',
        productName: '花呗',
        collectionDate: '2024-01-12',
        collectionTime: '15:20',
        collectionMethod: 'APP内消息',
        collectorName: '系统',
        collectorPhone: '400-123-4567',
        contactResult: '已发送',
        customerResponse: '已查看',
        riskLevel: '低',
        followUpAction: '继续观察',
        remarks: '花呗逾期提醒，客户已查看消息',
        effectiveScore: 3,
        duration: 0,
        reportSource: '催收系统'
      }
    ],
    
    // 征信记录
    creditReports: [
      {
        reportId: 'CR001',
        productKey: 'LN-2024-002',
        productName: '蚂蚁借呗',
        reportDate: '2024-09-12',
        reportType: '个人信用报告',
        creditScore: 750,
        creditGrade: 'A',
        reportStatus: '有效',
        queryReason: '蚂蚁借呗贷款申请',
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
        validUntil: '2024-12-12',
        reportContent: {
          personalInfo: {
            name: '李明',
            idNumber: '110*******939X',
            phoneNumber: '139****8866',
            address: '江苏省昆山市'
          },
          creditHistory: {
            totalAccounts: 5,
            activeAccounts: 5,
            overdueAccounts: 0,
            maxOverdueDays: 0
          },
          publicRecords: {
            courtRecords: 0,
            taxRecords: 0,
            administrativePenalties: 0
          }
        }
      },
      {
        reportId: 'CR002',
        productKey: 'LN-2024-003',
        productName: '京东白条',
        reportDate: '2024-09-10',
        reportType: '个人信用报告',
        creditScore: 720,
        creditGrade: 'A',
        reportStatus: '有效',
        queryReason: '京东白条信用评估',
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
        validUntil: '2024-12-10',
        reportContent: {
          personalInfo: {
            name: '李明',
            idNumber: '110*******939X',
            phoneNumber: '139****8866',
            address: '江苏省昆山市'
          },
          creditHistory: {
            totalAccounts: 3,
            activeAccounts: 3,
            overdueAccounts: 0,
            maxOverdueDays: 0
          },
          publicRecords: {
            courtRecords: 0,
            taxRecords: 0,
            administrativePenalties: 0
          }
        }
      },
      {
        reportId: 'CR003',
        productKey: 'LN-2024-004',
        productName: '微粒贷',
        reportDate: '2024-08-15',
        reportType: '个人信用报告',
        creditScore: 680,
        creditGrade: 'B',
        reportStatus: '有效',
        queryReason: '微粒贷贷款审批',
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
        validUntil: '2024-11-15',
        reportContent: {
          personalInfo: {
            name: '李明',
            idNumber: '110*******939X',
            phoneNumber: '139****8866',
            address: '江苏省昆山市'
          },
          creditHistory: {
            totalAccounts: 3,
            activeAccounts: 2,
            overdueAccounts: 1,
            maxOverdueDays: 15
          },
          publicRecords: {
            courtRecords: 0,
            taxRecords: 0,
            administrativePenalties: 0
          }
        }
      },
      {
        reportId: 'CR004',
        productKey: 'CC-2024-001',
        productName: '花呗',
        reportDate: '2024-07-20',
        reportType: '个人信用报告',
        creditScore: 780,
        creditGrade: 'A+',
        reportStatus: '有效',
        queryReason: '花呗额度评估',
        riskLevel: '低风险',
        queryCount: 1,
        overdueTimes: 0,
        maxOverdueDays: 0,
        totalCreditLimit: 20000,
        usedCreditLimit: 5000,
        creditUtilization: 25,
        accountCount: 2,
        normalAccounts: 2,
        overdueAccounts: 0,
        reportSource: '人民银行征信中心',
        validUntil: '2024-10-20',
        reportContent: {
          personalInfo: {
            name: '李明',
            idNumber: '110*******939X',
            phoneNumber: '139****8866',
            address: '江苏省昆山市'
          },
          creditHistory: {
            totalAccounts: 2,
            activeAccounts: 2,
            overdueAccounts: 0,
            maxOverdueDays: 0
          },
          publicRecords: {
            courtRecords: 0,
            taxRecords: 0,
            administrativePenalties: 0
          }
        }
      },
      {
        reportId: 'CR005',
        productKey: 'LN-2024-005',
        productName: '招联好期贷',
        reportDate: '2024-06-15',
        reportType: '个人信用报告',
        creditScore: 710,
        creditGrade: 'A',
        reportStatus: '有效',
        queryReason: '招联好期贷申请',
        riskLevel: '低风险',
        queryCount: 2,
        overdueTimes: 0,
        maxOverdueDays: 0,
        totalCreditLimit: 80000,
        usedCreditLimit: 25000,
        creditUtilization: 31,
        accountCount: 4,
        normalAccounts: 4,
        overdueAccounts: 0,
        reportSource: '人民银行征信中心',
        validUntil: '2024-09-15',
        reportContent: {
          personalInfo: {
            name: '李明',
            idNumber: '110*******939X',
            phoneNumber: '139****8866',
            address: '江苏省昆山市'
          },
          creditHistory: {
            totalAccounts: 4,
            activeAccounts: 4,
            overdueAccounts: 0,
            maxOverdueDays: 0
          },
          publicRecords: {
            courtRecords: 0,
            taxRecords: 0,
            administrativePenalties: 0
          }
        }
      }
    ],
    
    // 营销记录
    marketingRecords: {
      touchRecords: [
        {
          id: 'TCH001',
          productKey: 'LN-2024-002',
          productName: '蚂蚁借呗',
          touchDate: '2024-01-10',
          touchChannel: 'APP推送',
          campaignName: '借呗额度提升活动',
          campaignType: '产品推广',
          content: '恭喜您获得借呗额度提升机会，最高可提升至10万元',
          targetAudience: '优质客户',
          touchResult: '成功',
          responseAction: '点击查看',
          conversionValue: 20000,
          cost: 2.5
        },
        {
          id: 'TCH002',
          productKey: 'LN-2024-003',
          productName: '京东白条',
          touchDate: '2024-01-15',
          touchChannel: '短信',
          campaignName: '白条免息券发放',
          campaignType: '优惠活动',
          content: '您的白条账户获得30天免息券，购物更优惠',
          targetAudience: '活跃用户',
          touchResult: '成功',
          responseAction: '立即使用',
          conversionValue: 500,
          cost: 0.8
        },
        {
          id: 'TCH003',
          productKey: 'LN-2024-004',
          productName: '微粒贷',
          touchDate: '2024-01-20',
          touchChannel: '微信消息',
          campaignName: '微粒贷利率优惠',
          campaignType: '利率优惠',
          content: '限时优惠：微粒贷年化利率低至5.4%，立即申请',
          targetAudience: '潜在客户',
          touchResult: '成功',
          responseAction: '申请贷款',
          conversionValue: 80000,
          cost: 5.0
        }
      ],
      benefitRecords: [
        {
          id: 'BEN001',
          productKey: 'LN-2024-002',
          productName: '蚂蚁借呗',
          benefitDate: '2023-12-01',
          benefitType: '利率优惠',
          benefitName: '新用户专享利率',
          benefitValue: 1.0,
          benefitStatus: '已使用',
          expiryDate: '2024-03-31',
          sourceActivity: '新用户注册活动',
          usageRestriction: '首次借款专享'
        },
        {
          id: 'BEN002',
          productKey: 'CC-2024-008',
          productName: '花呗',
          benefitDate: '2023-11-15',
          benefitType: '免息期延长',
          benefitName: '双十一免息券',
          benefitValue: 30,
          benefitStatus: '已使用',
          expiryDate: '2023-12-15',
          sourceActivity: '双十一购物节',
          usageRestriction: '购物消费专享'
        }
      ],
      effectAnalysis: {
        totalTouchCount: 12,
        successfulTouchCount: 9,
        conversionRate: 0.75,
        totalCost: 25,
        totalRevenue: 1200,
        roi: 48.0,
        customerLifetimeValue: 120000
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
        productKey: 'LN-2024-001',
        creditDate: '2024-09-12 12:09:12',
        channel: '小米',
        productName: '公积金贷款',
        result: '通过',
        rejectReason: '-',
        initialAmount: 800000.00,
        currentAmount: 800000.00,
        usedAmount: 750000.00,
        riskLevel: '正常',
        rate: 3.25,
        period: 360,
        expiryDate: '2052-11-30'
      }
    ],
    
    loanRecords: [
      {
        loanNo: '3276234',
        productKey: 'LN-2024-001',
        loanDate: '2023-05-20 10:30:45',
        bankCard: '1234****7890',
        channel: '手机银行',
        productName: '公积金贷款',
        result: '通过',
        rejectReason: '-',
        contractNo: 'HT-20230520-001',
        status: '正常',
        amount: 800000.00,
        balance: 750000.00,
        installments: 360,
        paidInstallments: 60,
        nextPayment: 4200.00,
        nextPaymentDate: '2024-10-20',
        // 新增字段
        overdueDays: 0,
        maxOverdueDays: 5,
        settlementDate: null,
        currentPeriod: 61,
        remainingPrincipal: 720000.00,
        remainingInterest: 25000.00,
        remainingPenalty: 1500.00,
        remainingTotal: 746500.00,
        loanRate: 0.0325,
        repaymentDetails: [],
        repaymentPlan: []
      }
    ],
    
    quotaAdjustHistory: [
      {
        customerNo: '123',
        adjustDate: '2023-09-15 14:30:22',
        beforeAmount: 600000,
        afterAmount: 800000,
        adjustReason: '客户信用评级提升',
        beforeRate: 3.45,
        afterRate: 3.25,
        beforePeriod: 240,
        afterPeriod: 360,
        operator: '李经理',
        result: '成功'
      }
    ]
  },
  
  // 李女士 - 年轻白领，拥有信用卡、个人消费贷款、装修贷款
  '123456': {
    userId: '123456',
    customerNo: '123456',
    name: '李女士',
    mobile: '13812345678',
    idCard: '110101199601151234',
    gender: '女',
    age: 28,
    address: '北京市海淀区中关村大街1号',
    email: 'li.ms@example.com',
    idExpiry: '2030-01-15',
    status: 'active',
    joinDate: '2022-03-15',
    customerLevel: 'Gold',
    similarity: 0.92,
    threshold: 0.8,
    errorMsg: '',
    products: [
      {
        productKey: 'CC-2022-001',
        productType: 'credit',
        productName: '白金信用卡',
        amount: 80000,
        startDate: '2022-03-15',
        rate: 0.0
      },
      {
        productKey: 'LN-2023-101',
        productType: 'loan',
        productName: '个人消费贷款',
        amount: 150000,
        startDate: '2023-06-20',
        rate: 4.8
      },
      {
        productKey: 'LN-2024-201',
        productType: 'loan',
        productName: '装修贷款',
        amount: 200000,
        startDate: '2024-02-10',
        rate: 5.2
      }
    ],
    totalLoanAmount: 350000,
    totalCreditAmount: 80000,
    overdueAmount: 0,
    repaymentRate: 1.0,
    creditsList: [],
    loanRecords: [],
    collectionRecords: [],
    creditReports: [],
    marketingRecords: {
      touchRecords: [],
      benefitRecords: [],
      effectAnalysis: {
        totalTouchCount: 15,
        successfulTouchCount: 12,
        conversionRate: 0.8,
        totalCost: 2500,
        totalRevenue: 8000,
        roi: 2.2,
        customerLifetimeValue: 45000
      }
    },
    quotaAdjustHistory: [],
    maxOverdueDays: 0,
    currentOverdueDays: 0,
    totalCredit: 80000,
    usedCredit: 25000,
    availableCredit: 55000,
    userProfile: {
      demographics: {
        ageGroup: '青年',
        genderLabel: '女性',
        regionType: '一线城市',
        occupationType: '企业员工',
        incomeLevel: '中高收入'
      },
      behavior: {
        loginActivity: '高活跃',
        usageHabits: '移动端偏好',
        featurePreference: '消费偏好',
        operationPattern: '积极型'
      },
      consumption: {
        spendingPower: '中高消费',
        frequency: '高频',
        preference: '时尚型',
        timePattern: '周末'
      },
      risk: {
        creditLevel: '优秀',
        riskType: '低风险',
        repaymentCapacity: '强',
        controlLevel: '良好'
      },
      productPreference: {
        holdingTypes: ['信用卡', '消费贷款', '装修贷款'],
        activityLevel: '高活跃',
        valueContribution: '高价值',
        preferredChannels: ['手机银行', 'APP', '微信'],
        servicePreference: '在线服务',
        lifecycleStage: '成长期'
      },
      marketingResponse: {
        sensitivity: '高敏感',
        bestContactTime: '晚间',
        effectiveChannels: ['APP推送', '微信', '短信'],
        frequencyPreference: '中频'
      }
    },
    paymentProcessRecords: {
      contractRecords: [],
      disbursementRecords: [],
      repaymentRecords: []
    }
  },
  
  // 王先生 - 中年企业家，拥有房屋抵押贷款、汽车贷款、经营性贷款、教育贷款
  '234567': {
    userId: '234567',
    customerNo: '234567',
    name: '王先生',
    mobile: '13923456789',
    idCard: '110101198201201234',
    gender: '男',
    age: 42,
    address: '上海市浦东新区陆家嘴金融中心',
    email: 'wang.sir@example.com',
    idExpiry: '2028-01-20',
    status: 'active',
    joinDate: '2020-05-10',
    customerLevel: 'Platinum',
    similarity: 0.95,
    threshold: 0.8,
    errorMsg: '',
    products: [
      {
        productKey: 'LN-2020-301',
        productType: 'loan',
        productName: '房屋抵押贷款',
        amount: 2000000,
        startDate: '2020-05-10',
        rate: 3.8
      },
      {
        productKey: 'LN-2021-401',
        productType: 'loan',
        productName: '汽车贷款',
        amount: 300000,
        startDate: '2021-08-15',
        rate: 4.5
      },
      {
        productKey: 'LN-2022-501',
        productType: 'loan',
        productName: '经营性贷款',
        amount: 1500000,
        startDate: '2022-11-20',
        rate: 5.8
      },
      {
        productKey: 'LN-2023-601',
        productType: 'loan',
        productName: '教育贷款',
        amount: 500000,
        startDate: '2023-09-01',
        rate: 4.2
      }
    ],
    totalLoanAmount: 4300000,
    totalCreditAmount: 0,
    overdueAmount: 0,
    repaymentRate: 1.0,
    creditsList: [],
    loanRecords: [],
    collectionRecords: [],
    creditReports: [],
    marketingRecords: {
      touchRecords: [],
      benefitRecords: [],
      effectAnalysis: {
        totalTouchCount: 25,
        successfulTouchCount: 20,
        conversionRate: 0.8,
        totalCost: 8000,
        totalRevenue: 35000,
        roi: 3.4,
        customerLifetimeValue: 180000
      }
    },
    quotaAdjustHistory: [],
    maxOverdueDays: 0,
    currentOverdueDays: 0,
    totalCredit: 0,
    usedCredit: 0,
    availableCredit: 0,
    userProfile: {
      demographics: {
        ageGroup: '中年',
        genderLabel: '男性',
        regionType: '一线城市',
        occupationType: '企业主',
        incomeLevel: '高收入'
      },
      behavior: {
        loginActivity: '中活跃',
        usageHabits: '多端使用',
        featurePreference: '投资偏好',
        operationPattern: '稳健型'
      },
      consumption: {
        spendingPower: '高消费',
        frequency: '中频',
        preference: '品质型',
        timePattern: '工作日'
      },
      risk: {
        creditLevel: '优秀',
        riskType: '低风险',
        repaymentCapacity: '很强',
        controlLevel: '优秀'
      },
      productPreference: {
        holdingTypes: ['房屋抵押贷款', '汽车贷款', '经营性贷款', '教育贷款'],
        activityLevel: '中活跃',
        valueContribution: '超高价值',
        preferredChannels: ['网点', '手机银行', '客户经理'],
        servicePreference: '专属服务',
        lifecycleStage: '成熟期'
      },
      marketingResponse: {
        sensitivity: '中敏感',
        bestContactTime: '工作时间',
        effectiveChannels: ['客户经理', '电话', 'APP推送'],
        frequencyPreference: '低频'
      }
    },
    paymentProcessRecords: {
      contractRecords: [],
      disbursementRecords: [],
      repaymentRecords: []
    }
  },
  
  // 陈女士 - 中年专业人士，拥有个人信用贷款、消费贷款、装修贷款
  '345678': {
    userId: '345678',
    customerNo: '345678',
    name: '陈女士',
    mobile: '13734567890',
    idCard: '110101198901051234',
    gender: '女',
    age: 35,
    address: '深圳市南山区科技园',
    email: 'chen.ms@example.com',
    idExpiry: '2029-01-05',
    status: 'active',
    joinDate: '2021-07-20',
    customerLevel: 'Gold',
    similarity: 0.88,
    threshold: 0.8,
    errorMsg: '',
    products: [
      {
        productKey: 'LN-2021-701',
        productType: 'loan',
        productName: '个人信用贷款',
        amount: 300000,
        startDate: '2021-07-20',
        rate: 5.5
      },
      {
        productKey: 'LN-2022-801',
        productType: 'loan',
        productName: '消费贷款',
        amount: 100000,
        startDate: '2022-12-10',
        rate: 6.2
      },
      {
        productKey: 'LN-2023-901',
        productType: 'loan',
        productName: '装修贷款',
        amount: 250000,
        startDate: '2023-04-15',
        rate: 5.8
      }
    ],
    totalLoanAmount: 650000,
    totalCreditAmount: 0,
    overdueAmount: 0,
    repaymentRate: 0.98,
    creditsList: [],
    loanRecords: [],
    collectionRecords: [],
    creditReports: [],
    marketingRecords: {
      touchRecords: [],
      benefitRecords: [],
      effectAnalysis: {
        totalTouchCount: 18,
        successfulTouchCount: 14,
        conversionRate: 0.78,
        totalCost: 3500,
        totalRevenue: 12000,
        roi: 2.4,
        customerLifetimeValue: 65000
      }
    },
    quotaAdjustHistory: [],
    maxOverdueDays: 3,
    currentOverdueDays: 0,
    totalCredit: 0,
    usedCredit: 0,
    availableCredit: 0,
    userProfile: {
      demographics: {
        ageGroup: '中年',
        genderLabel: '女性',
        regionType: '一线城市',
        occupationType: '专业人士',
        incomeLevel: '中高收入'
      },
      behavior: {
        loginActivity: '高活跃',
        usageHabits: '移动端偏好',
        featurePreference: '理财偏好',
        operationPattern: '理性型'
      },
      consumption: {
        spendingPower: '中高消费',
        frequency: '中频',
        preference: '实用型',
        timePattern: '晚间'
      },
      risk: {
        creditLevel: '良好',
        riskType: '低风险',
        repaymentCapacity: '强',
        controlLevel: '良好'
      },
      productPreference: {
        holdingTypes: ['个人信用贷款', '消费贷款', '装修贷款'],
        activityLevel: '高活跃',
        valueContribution: '中高价值',
        preferredChannels: ['手机银行', 'APP', '网点'],
        servicePreference: '自助服务',
        lifecycleStage: '成长期'
      },
      marketingResponse: {
        sensitivity: '高敏感',
        bestContactTime: '晚间',
        effectiveChannels: ['APP推送', '短信', '邮件'],
        frequencyPreference: '中频'
      }
    },
    paymentProcessRecords: {
      contractRecords: [],
      disbursementRecords: [],
      repaymentRecords: []
    }
  },
  
  // 刘先生 - 资深企业家，拥有经营性贷款、房屋抵押贷款、汽车贷款
  '456789': {
    userId: '456789',
    customerNo: '456789',
    name: '刘先生',
    mobile: '13845678901',
    idCard: '110101197401101234',
    gender: '男',
    age: 50,
    address: '广州市天河区珠江新城',
    email: 'liu.sir@example.com',
    idExpiry: '2026-01-10',
    status: 'active',
    joinDate: '2018-03-05',
    customerLevel: 'Diamond',
    similarity: 0.97,
    threshold: 0.8,
    errorMsg: '',
    products: [
      {
        productKey: 'LN-2018-001',
        productType: 'loan',
        productName: '经营性贷款',
        amount: 3000000,
        startDate: '2018-03-05',
        rate: 5.2
      },
      {
        productKey: 'LN-2019-002',
        productType: 'loan',
        productName: '房屋抵押贷款',
        amount: 1800000,
        startDate: '2019-06-20',
        rate: 3.9
      },
      {
        productKey: 'LN-2020-003',
        productType: 'loan',
        productName: '汽车贷款',
        amount: 800000,
        startDate: '2020-09-15',
        rate: 4.8
      }
    ],
    totalLoanAmount: 5600000,
    totalCreditAmount: 0,
    overdueAmount: 0,
    repaymentRate: 1.0,
    creditsList: [],
    loanRecords: [],
    collectionRecords: [],
    creditReports: [],
    marketingRecords: {
      touchRecords: [],
      benefitRecords: [],
      effectAnalysis: {
        totalTouchCount: 35,
        successfulTouchCount: 28,
        conversionRate: 0.8,
        totalCost: 15000,
        totalRevenue: 80000,
        roi: 4.3,
        customerLifetimeValue: 350000
      }
    },
    quotaAdjustHistory: [],
    maxOverdueDays: 0,
    currentOverdueDays: 0,
    totalCredit: 0,
    usedCredit: 0,
    availableCredit: 0,
    userProfile: {
      demographics: {
        ageGroup: '中老年',
        genderLabel: '男性',
        regionType: '一线城市',
        occupationType: '企业主',
        incomeLevel: '高收入'
      },
      behavior: {
        loginActivity: '中活跃',
        usageHabits: '传统渠道偏好',
        featurePreference: '投资偏好',
        operationPattern: '保守型'
      },
      consumption: {
        spendingPower: '高消费',
        frequency: '低频',
        preference: '品质型',
        timePattern: '工作日'
      },
      risk: {
        creditLevel: '优秀',
        riskType: '极低风险',
        repaymentCapacity: '很强',
        controlLevel: '优秀'
      },
      productPreference: {
        holdingTypes: ['经营性贷款', '房屋抵押贷款', '汽车贷款'],
        activityLevel: '中活跃',
        valueContribution: '超高价值',
        preferredChannels: ['网点', '客户经理', '电话'],
        servicePreference: '专属服务',
        lifecycleStage: '成熟期'
      },
      marketingResponse: {
        sensitivity: '低敏感',
        bestContactTime: '工作时间',
        effectiveChannels: ['客户经理', '电话', '邮件'],
        frequencyPreference: '低频'
      }
    },
    paymentProcessRecords: {
      contractRecords: [],
      disbursementRecords: [],
      repaymentRecords: []
    }
  },
  
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
    products: [],
    totalLoanAmount: 0,
    totalCreditAmount: 0,
    overdueAmount: 0,
    repaymentRate: 0,
    creditsList: [],
    loanRecords: [],
    collectionRecords: [],
    creditReports: [],
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
        duration: -10, // 异常时长
        reportSource: '异常数据源'
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
          productsCount: userData.products?.length,
          creditsListCount: userData.creditsList?.length,
          loanRecordsCount: userData.loanRecords?.length,
          quotaAdjustHistoryCount: userData.quotaAdjustHistory?.length,
          // 检查关键字段是否存在
          hasMaxOverdueDays: 'maxOverdueDays' in userData,
          hasCurrentOverdueDays: 'currentOverdueDays' in userData,
          hasOverdueAmount: 'overdueAmount' in userData,
          hasRepaymentRate: 'repaymentRate' in userData,
          // 检查第一个产品数据的完整性
          firstProduct: userData.products && userData.products.length > 0 ? {
            hasProductKey: 'productKey' in userData.products[0],
            hasProductName: 'productName' in userData.products[0],
            hasProductType: 'productType' in userData.products[0],
            hasAmount: 'amount' in userData.products[0],
            hasStartDate: 'startDate' in userData.products[0],
            hasRate: 'rate' in userData.products[0]
          } : null
        });
        
        // 转换数据格式，添加basicInfo字段
        const transformedData = {
          ...userData,
          basicInfo: {
            name: userData.name,
            age: userData.age,
            gender: userData.gender,
            idCard: userData.idCard,
            phone: userData.mobile,
            email: userData.email,
            customerNo: userData.customerNo,
            address: userData.address,
            idExpiry: userData.idExpiry,
            status: userData.status,
            joinDate: userData.joinDate,
            customerLevel: userData.customerLevel
          }
        };
        
        console.log('[数据转换] 已添加basicInfo字段:', transformedData.basicInfo);
        resolve(transformedData);
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