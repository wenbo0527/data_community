// src/mock/coupon.ts
var approvalFlowMockData = [
  {
    id: 1,
    templateId: 1,
    type: "template",
    status: "\u5BA1\u6279\u901A\u8FC7",
    approvers: [
      {
        id: 1,
        name: "\u5F20\u4E09",
        role: "\u4EA7\u54C1\u7ECF\u7406",
        status: "\u5DF2\u901A\u8FC7",
        approvalTime: "2024-01-01 10:30:00",
        comment: "\u6D3B\u52A8\u65B9\u6848\u5408\u7406\uFF0C\u540C\u610F\u4E0A\u7EBF"
      },
      {
        id: 2,
        name: "\u674E\u56DB",
        role: "\u98CE\u63A7\u7ECF\u7406",
        status: "\u5DF2\u901A\u8FC7",
        approvalTime: "2024-01-01 14:20:00",
        comment: "\u98CE\u9669\u53EF\u63A7\uFF0C\u540C\u610F\u4E0A\u7EBF"
      }
    ],
    createTime: "2024-01-01 09:00:00",
    updateTime: "2024-01-01 14:20:00"
  },
  {
    id: 2,
    templateId: 2,
    type: "template",
    status: "\u5BA1\u6279\u4E2D",
    approvers: [
      {
        id: 3,
        name: "\u738B\u4E94",
        role: "\u4EA7\u54C1\u7ECF\u7406",
        status: "\u5DF2\u901A\u8FC7",
        approvalTime: "2024-01-02 11:15:00",
        comment: "\u6D3B\u52A8\u65B9\u6848\u53EF\u884C"
      },
      {
        id: 4,
        name: "\u8D75\u516D",
        role: "\u98CE\u63A7\u7ECF\u7406",
        status: "\u5F85\u5BA1\u6279",
        approvalTime: null,
        comment: null
      }
    ],
    createTime: "2024-01-02 10:00:00",
    updateTime: "2024-01-02 11:15:00"
  },
  {
    id: 3,
    templateId: 3,
    type: "template",
    status: "\u5BA1\u6279\u62D2\u7EDD",
    approvers: [
      {
        id: 5,
        name: "\u5F20\u4E09",
        role: "\u4EA7\u54C1\u7ECF\u7406",
        status: "\u5DF2\u62D2\u7EDD",
        approvalTime: "2024-01-03 16:45:00",
        comment: "\u6D3B\u52A8\u65B9\u6848\u5B58\u5728\u98CE\u9669\uFF0C\u5EFA\u8BAE\u8C03\u6574"
      }
    ],
    createTime: "2024-01-03 15:30:00",
    updateTime: "2024-01-03 16:45:00"
  }
];
var templateMockData = [
  {
    id: 5,
    name: "\u957F\u671F\u514D\u606F\u5238\u6A21\u7248",
    type: "interest_free",
    status: "\u751F\u6548\u4E2D",
    createTime: "2024-01-05",
    creator: "\u738B\u4E94",
    approvalStatus: "\u5BA1\u6279\u901A\u8FC7",
    validityPeriodType: "unlimited",
    firstUseOnly: false,
    stackable: false,
    products: ["personal_loan", "SELF_APP"],
    repaymentMethods: ["equal_principal", "equal_installment"],
    loanPeriodType: "fixed",
    loanPeriod: 60,
    loanAmountMin: 2e4,
    loanAmountMax: 15e4,
    useChannels: ["app", "miniprogram", "h5"],
    creditChannels: ["app", "miniprogram"],
    description: "\u957F\u671F\u514D\u606F\u6D3B\u52A8\u5238",
    interestFreeDays: 60,
    maxInterestFreeAmount: 15e4,
    displayConfig: {
      showExpiryDate: true,
      expiryReminder: 7,
      showUsageInstructions: true
    }
  },
  {
    id: 1,
    name: "\u9996\u501F30\u5929\u514D\u606F\u5238\u6A21\u7248",
    type: "interest_free",
    status: "\u8349\u7A3F",
    createTime: "2024-01-01",
    creator: "\u5F20\u4E09",
    approvalStatus: "\u5BA1\u6279\u901A\u8FC7",
    approvalId: 1,
    validityPeriodType: "limited",
    validityPeriod: ["2024-01-01", "2024-12-31"],
    firstUseOnly: true,
    stackable: false,
    products: ["SELF_APP"],
    repaymentMethods: ["equal_principal", "equal_installment"],
    loanPeriodType: "fixed",
    loanPeriod: 30,
    loanAmountMin: 1e4,
    loanAmountMax: 1e5,
    useChannels: ["app", "miniprogram", "h5"],
    creditChannels: ["app", "miniprogram"],
    description: "\u65B0\u7528\u6237\u9996\u501F30\u5929\u514D\u606F",
    interestFreeDays: 30,
    maxInterestFreeAmount: 1e5,
    displayConfig: {
      showExpiryDate: true,
      expiryReminder: 3,
      showUsageInstructions: true
    }
  },
  {
    id: 2,
    name: "\u9996\u501F90\u5929\u514D\u606F\u5238\u6A21\u7248",
    type: "interest_free",
    status: "\u8349\u7A3F",
    createTime: "2024-01-02",
    creator: "\u5F20\u4E09",
    approvalStatus: "\u5BA1\u6279\u4E2D",
    approvalId: 2,
    validityPeriodType: "limited",
    validityPeriod: ["2024-01-01", "2024-12-31"],
    firstUseOnly: true,
    stackable: false,
    products: ["personal_loan"],
    repaymentMethods: ["equal_principal", "equal_installment"],
    loanPeriodType: "fixed",
    loanPeriod: 90,
    loanAmountMin: 5e4,
    loanAmountMax: 2e5,
    useChannels: ["app", "miniprogram"],
    creditChannels: ["app"],
    description: "\u65B0\u7528\u6237\u9996\u501F90\u5929\u514D\u606F",
    displayConfig: {
      showExpiryDate: false,
      expiryReminder: 5,
      showUsageInstructions: false
    }
  },
  {
    id: 3,
    name: "\u590D\u501F8\u6298\u4F18\u60E0\u5238\u6A21\u7248",
    type: "discount",
    status: "\u8349\u7A3F",
    createTime: "2024-01-03",
    creator: "\u674E\u56DB",
    approvalStatus: "\u5BA1\u6279\u62D2\u7EDD",
    approvalId: 3,
    discountType: "uniform",
    uniformDiscount: 0.8,
    validityPeriodType: "limited",
    validityPeriod: ["2024-01-01", "2024-12-31"],
    firstUseOnly: false,
    stackable: true,
    products: ["SELF_APP"],
    repaymentMethods: ["equal_principal"],
    loanPeriodType: "range",
    loanPeriodMin: 3,
    loanPeriodMax: 12,
    loanAmountMin: 5e3,
    loanAmountMax: 5e4,
    useChannels: ["app"],
    creditChannels: ["app"],
    description: "\u8001\u7528\u6237\u590D\u501F8\u6298\u4F18\u60E0",
    displayConfig: {
      showExpiryDate: true,
      expiryReminder: 7,
      showUsageInstructions: true
    }
  },
  {
    id: 4,
    name: "\u590D\u501F7\u6298\u4F18\u60E0\u5238\u6A21\u7248",
    type: "discount",
    status: "\u8349\u7A3F",
    createTime: "2024-01-04",
    creator: "\u674E\u56DB",
    discountType: "percentage",
    discountValue: 70,
    validityPeriodType: "limited",
    validityPeriod: ["2024-01-01", "2024-12-31"],
    firstUseOnly: false,
    stackable: false,
    products: ["personal_loan"],
    repaymentMethods: ["equal_installment"],
    loanPeriodType: "range",
    loanPeriodMin: 6,
    loanPeriodMax: 24,
    loanAmountMin: 1e5,
    loanAmountMax: 5e5,
    useChannels: ["app"],
    creditChannels: ["app"],
    description: "\u8001\u7528\u6237\u590D\u501F7\u6298\u4F18\u60E0",
    displayConfig: {
      showExpiryDate: false,
      expiryReminder: 10,
      showUsageInstructions: false
    }
  },
  {
    id: 6,
    name: "\u8282\u65E5\u7279\u60E0\u514D\u606F\u5238\u6A21\u7248",
    type: "interest_free",
    status: "\u751F\u6548\u4E2D",
    createTime: "2024-01-06",
    creator: "\u8D75\u516D",
    approvalStatus: "\u5BA1\u6279\u901A\u8FC7",
    validityPeriodType: "limited",
    validityPeriod: ["2024-02-01", "2024-02-29"],
    firstUseOnly: false,
    stackable: true,
    products: ["SELF_APP", "personal_loan"],
    repaymentMethods: ["equal_principal", "equal_installment"],
    loanPeriodType: "range",
    loanPeriodMin: 12,
    loanPeriodMax: 36,
    loanAmountMin: 3e4,
    loanAmountMax: 3e5,
    useChannels: ["app", "miniprogram", "h5"],
    creditChannels: ["app", "miniprogram"],
    description: "\u8282\u65E5\u7279\u60E0\u6D3B\u52A8\u5238",
    interestFreeDays: 45,
    maxInterestFreeAmount: 3e5,
    displayConfig: {
      showExpiryDate: true,
      expiryReminder: 3,
      showUsageInstructions: true
    }
  }
];
var packageMockData = [
  {
    id: 1,
    name: "\u65B0\u6625\u793C\u5305",
    type: "\u7EC4\u5408\u5238\u5305",
    status: "\u751F\u6548\u4E2D",
    createTime: "2024-01-10",
    startTime: "2024-01-15",
    endTime: "2024-02-15",
    totalCount: 1e3,
    stock: 800,
    unclaimed: 500,
    claimed: 300,
    locked: 50,
    verified: 150,
    expired: 0,
    invalid: 0,
    rules: "\u5305\u542B30\u5929\u514D\u606F\u5238\u548C8\u6298\u4F18\u60E0\u5238",
    operator: "\u5F20\u4E09",
    auditor: "\u674E\u56DB",
    validityStartTime: "2024-01-15",
    validityEndTime: "2024-02-15",
    dailyLimit: 100,
    weeklyLimit: 500,
    monthlyLimit: 2e3,
    userLimitDesc: "\u5355\u4E00\u7528\u6237\u5355\u6B21\u53EA\u80FD\u62E5\u6709\u5355\u4E00\u5F20\u540CID\u5238\u5305"
  },
  {
    id: 2,
    name: "\u5468\u5E74\u5E86\u793C\u5305",
    type: "\u7EC4\u5408\u5238\u5305",
    status: "\u5F85\u5BA1\u6838",
    createTime: "2024-01-20",
    startTime: "2024-02-01",
    endTime: "2024-02-29",
    totalCount: 500,
    stock: 500,
    unclaimed: 500,
    claimed: 0,
    locked: 0,
    verified: 0,
    expired: 0,
    invalid: 0,
    rules: "\u5305\u542B90\u5929\u514D\u606F\u5238\u548C7\u6298\u4F18\u60E0\u5238",
    operator: "\u674E\u56DB",
    auditor: "\u5F20\u4E09",
    validityStartTime: "2024-02-01",
    validityEndTime: "2024-02-29"
  }
];
var couponMockData = [
  {
    id: 1,
    templateId: 1,
    name: "\u9996\u501F30\u5929\u514D\u606F\u5238",
    type: "\u514D\u606F\u5238",
    status: "\u8349\u7A3F",
    createTime: "2024-01-10",
    startTime: "2024-01-15",
    endTime: "2024-02-15",
    totalCount: 1e3,
    stock: 1e3,
    unclaimed: 1e3,
    claimed: 0,
    locked: 0,
    verified: 0,
    expired: 0,
    invalid: 0,
    rules: "1. \u4EC5\u9650\u9996\u6B21\u501F\u6B3E\u7528\u6237\u4F7F\u7528\n2. \u501F\u6B3E\u671F\u9650\u56FA\u5B9A\u4E3A30\u5929\n3. \u5355\u7B14\u501F\u6B3E\u91D1\u989D10,000-100,000\u5143\n4. \u514D\u606F\u91D1\u989D\u4E0A\u9650100,000\u5143\n5. \u4E0D\u53EF\u4E0E\u5176\u4ED6\u4F18\u60E0\u5238\u53E0\u52A0\u4F7F\u7528",
    operator: "\u5F20\u4E09",
    auditor: "\u674E\u56DB",
    validityStartTime: "2024-01-15",
    validityEndTime: "2024-02-15",
    dailyLimit: 100,
    weeklyLimit: 500,
    monthlyLimit: 2e3,
    userLimitDesc: "\u5355\u4E00\u7528\u6237\u5355\u6B21\u53EA\u80FD\u62E5\u6709\u5355\u4E00\u5F20\u540CID\u5238"
  },
  {
    id: 2,
    templateId: 2,
    name: "\u9996\u501F90\u5929\u514D\u606F\u5238",
    type: "\u514D\u606F\u5238",
    status: "\u5F85\u5BA1\u6838",
    createTime: "2024-01-20",
    startTime: "2024-02-01",
    endTime: "2024-02-29",
    totalCount: 500,
    stock: 500,
    unclaimed: 500,
    claimed: 0,
    locked: 0,
    verified: 0,
    expired: 0,
    invalid: 0,
    rules: "1. \u4EC5\u9650\u9996\u6B21\u501F\u6B3E\u7528\u6237\u4F7F\u7528\n2. \u501F\u6B3E\u671F\u9650\u56FA\u5B9A\u4E3A90\u5929\n3. \u5355\u7B14\u501F\u6B3E\u91D1\u989D50,000-200,000\u5143\n4. \u53EF\u5728APP\u548C\u5C0F\u7A0B\u5E8F\u6E20\u9053\u4F7F\u7528\n5. \u4E0D\u53EF\u4E0E\u5176\u4ED6\u4F18\u60E0\u5238\u53E0\u52A0\u4F7F\u7528",
    operator: "\u674E\u56DB",
    auditor: "\u5F20\u4E09",
    validityStartTime: "2024-02-01",
    validityEndTime: "2024-02-29"
  },
  {
    id: 3,
    templateId: 3,
    name: "\u590D\u501F8\u6298\u4F18\u60E0\u5238",
    type: "\u6298\u6263\u5238",
    status: "\u751F\u6548\u4E2D",
    createTime: "2024-01-25",
    startTime: "2024-02-01",
    endTime: "2024-03-31",
    totalCount: 2e3,
    stock: 2e3,
    unclaimed: 1500,
    claimed: 300,
    locked: 50,
    verified: 150,
    expired: 0,
    invalid: 0,
    rules: "1. \u9650\u590D\u501F\u7528\u6237\u4F7F\u7528\n2. \u501F\u6B3E\u671F\u96503-12\u4E2A\u6708\n3. \u5355\u7B14\u501F\u6B3E\u91D1\u989D5,000-50,000\u5143\n4. \u7EDF\u4E008\u6298\u5229\u7387\u4F18\u60E0\n5. \u53EF\u4E0E\u5176\u4ED6\u4F18\u60E0\u5238\u53E0\u52A0\u4F7F\u7528\n6. \u4EC5\u9650APP\u6E20\u9053\u4F7F\u7528",
    operator: "\u5F20\u4E09",
    auditor: "\u738B\u4E94",
    validityStartTime: "2024-02-01",
    validityEndTime: "2024-03-31"
  },
  {
    id: 4,
    templateId: 4,
    name: "\u590D\u501F7\u6298\u4F18\u60E0\u5238",
    type: "\u6298\u6263\u5238",
    status: "\u7968\u52B5\u505C\u53D1",
    createTime: "2024-01-30",
    startTime: "2024-02-15",
    endTime: "2024-03-15",
    totalCount: 1e3,
    stock: 1e3,
    unclaimed: 600,
    claimed: 200,
    locked: 30,
    verified: 120,
    expired: 50,
    invalid: 0,
    rules: "1. \u9650\u590D\u501F\u7528\u6237\u4F7F\u7528\n2. \u501F\u6B3E\u671F\u96506-24\u4E2A\u6708\n3. \u5355\u7B14\u501F\u6B3E\u91D1\u989D100,000-500,000\u5143\n4. \u4EAB\u53D77\u6298\u5229\u7387\u4F18\u60E0\n5. \u4E0D\u53EF\u4E0E\u5176\u4ED6\u4F18\u60E0\u5238\u53E0\u52A0\u4F7F\u7528\n6. \u4EC5\u9650APP\u6E20\u9053\u4F7F\u7528",
    operator: "\u674E\u56DB",
    auditor: "\u5F20\u4E09",
    validityStartTime: "2024-02-15",
    validityEndTime: "2024-03-15"
  },
  {
    id: 5,
    templateId: 1,
    name: "\u65B0\u662530\u5929\u514D\u606F\u5238",
    type: "\u514D\u606F\u5238",
    status: "\u7968\u52B5\u5931\u6548",
    createTime: "2024-01-05",
    startTime: "2024-01-10",
    endTime: "2024-01-25",
    totalCount: 800,
    stock: 800,
    unclaimed: 0,
    claimed: 0,
    locked: 0,
    verified: 600,
    expired: 200,
    invalid: 0,
    rules: "1. \u65B0\u6625\u7279\u60E0\u6D3B\u52A8\u4E13\u5C5E\u4F18\u60E0\n2. \u501F\u6B3E\u671F\u9650\u56FA\u5B9A\u4E3A30\u5929\n3. \u5355\u7B14\u501F\u6B3E\u91D1\u989D10,000-100,000\u5143\n4. \u514D\u606F\u91D1\u989D\u4E0A\u9650100,000\u5143\n5. \u4E0D\u53EF\u4E0E\u5176\u4ED6\u4F18\u60E0\u5238\u53E0\u52A0\u4F7F\u7528",
    operator: "\u738B\u4E94",
    auditor: "\u5F20\u4E09",
    validityStartTime: "2024-01-10",
    validityEndTime: "2024-01-25"
  }
];
var recordMockData = [
  // 撤回记录
  {
    userId: "10008",
    couponId: "CP008",
    packageId: "PKG008",
    taskId: "TASK008",
    operationType: "\u64A4\u56DE",
    status: "\u6210\u529F",
    operationTime: "2024-01-22 14:30:00",
    operator: "ADMIN",
    withdrawReason: "\u6D3B\u52A8\u8C03\u6574",
    withdrawTime: "2024-01-22 14:30:00",
    withdrawOperator: "ADMIN"
  },
  // 发放记录
  {
    userId: "10001",
    couponId: "CP001",
    packageId: "PKG001",
    taskId: "TASK001",
    operationType: "\u53D1\u653E",
    status: "\u6210\u529F",
    operationTime: "2024-01-15 10:00:00",
    operator: "SYSTEM",
    totalIssued: 1e3,
    successCount: 950,
    failedCount: 50,
    warning: false,
    failedReason: "",
    issueStartTime: "2024-01-15 09:00:00",
    issueEndTime: "2024-01-15 10:30:00",
    lockRecords: [
      {
        lockTime: "2024-01-15 09:30:00",
        lockOperator: "SYSTEM",
        lockReason: "\u7CFB\u7EDF\u81EA\u52A8\u9501\u5B9A"
      }
    ],
    verificationRecords: [
      {
        verificationTime: "2024-01-16 11:00:00",
        verificationOperator: "USER_10001",
        verificationResult: "\u6838\u9500\u6210\u529F"
      }
    ]
  },
  {
    userId: "10002",
    couponId: "CP002",
    packageId: "PKG002",
    taskId: "TASK002",
    operationType: "\u53D1\u653E",
    status: "\u5931\u8D25",
    operationTime: "2024-01-16 11:30:00",
    operator: "SYSTEM",
    totalIssued: 800,
    successCount: 650,
    failedCount: 150,
    warning: true,
    warningMessage: "\u5931\u8D25\u7387\u8D85\u8FC715%",
    failedReason: "\u63A5\u53E3\u62A5\u9519"
  },
  {
    userId: "10003",
    couponId: "CP003",
    packageId: "PKG003",
    taskId: "TASK003",
    operationType: "\u53D1\u653E",
    status: "\u6210\u529F",
    operationTime: "2024-01-17 09:15:00",
    operator: "SYSTEM",
    totalIssued: 1200,
    successCount: 1200,
    failedCount: 0,
    warning: false,
    failedReason: ""
  },
  {
    userId: "10004",
    couponId: "CP004",
    packageId: "PKG004",
    taskId: "TASK004",
    operationType: "\u53D1\u653E",
    status: "\u5931\u8D25",
    operationTime: "2024-01-18 14:20:00",
    operator: "SYSTEM",
    totalIssued: 500,
    successCount: 0,
    failedCount: 500,
    warning: true,
    warningMessage: "\u5168\u90E8\u53D1\u653E\u5931\u8D25",
    failedReason: "\u5E93\u5B58\u4E0D\u8DB3"
  },
  {
    userId: "10005",
    couponId: "CP005",
    packageId: "PKG005",
    taskId: "TASK005",
    operationType: "\u53D1\u653E",
    status: "\u5931\u8D25",
    operationTime: "2024-01-19 16:45:00",
    operator: "SYSTEM",
    totalIssued: 1e3,
    successCount: 800,
    failedCount: 200,
    warning: true,
    warningMessage: "\u5931\u8D25\u738720%",
    failedReason: "\u63A5\u53E3\u62A5\u9519",
    issueStartTime: "2024-01-19 15:00:00",
    issueEndTime: "2024-01-19 17:30:00",
    lockRecords: [
      {
        lockTime: "2024-01-19 16:00:00",
        lockOperator: "SYSTEM",
        lockReason: "\u7CFB\u7EDF\u81EA\u52A8\u9501\u5B9A"
      }
    ],
    verificationRecords: [
      {
        verificationTime: "2024-01-20 09:15:00",
        verificationOperator: "USER_10005",
        verificationResult: "\u6838\u9500\u6210\u529F"
      }
    ]
  },
  // 新增锁定记录
  {
    userId: "10006",
    couponId: "CP006",
    packageId: "PKG006",
    taskId: "TASK006",
    operationType: "\u9501\u5B9A",
    status: "\u6210\u529F",
    operationTime: "2024-01-20 10:00:00",
    operator: "SYSTEM",
    lockReason: "\u7528\u6237\u7533\u8BF7\u9501\u5B9A",
    lockTime: "2024-01-20 10:00:00",
    unlockTime: "2024-01-21 10:00:00",
    lockOperator: "SYSTEM"
  },
  // 新增核销记录
  {
    userId: "10007",
    couponId: "CP007",
    packageId: "PKG007",
    taskId: "TASK007",
    operationType: "\u6838\u9500",
    status: "\u6210\u529F",
    operationTime: "2024-01-21 11:00:00",
    operator: "USER_10007",
    verificationTime: "2024-01-21 11:00:00",
    verificationResult: "\u6838\u9500\u6210\u529F",
    verificationAmount: 1e4,
    verificationOrderId: "ORDER_10007"
  }
];
var dashboardStats = {
  totalIssued: 3e3,
  totalSuccess: 2800,
  totalFailed: 200,
  warningCount: 1,
  lastUpdated: "2024-01-17 09:15:00",
  activeWarnings: [
    {
      id: "WARN001",
      type: "\u53D1\u653E\u5931\u8D25\u7387\u8FC7\u9AD8",
      message: "\u5238\u5305PKG002\u53D1\u653E\u5931\u8D25\u738718.75%",
      time: "2024-01-16 11:30:00",
      severity: "medium"
    }
  ]
};
export {
  approvalFlowMockData,
  couponMockData,
  dashboardStats,
  packageMockData,
  recordMockData,
  templateMockData
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21vY2svY291cG9uLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIi9Vc2Vycy9tYWMvbmlzX21vY2svZGF0YV9jb211bml0eS9kYXRhX2NvbXVuaXR5L3NyYy9tb2NrL2NvdXBvbi50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvVXNlcnMvbWFjL25pc19tb2NrL2RhdGFfY29tdW5pdHkvZGF0YV9jb211bml0eS9zcmMvbW9ja1wiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvbWFjL25pc19tb2NrL2RhdGFfY29tdW5pdHkvZGF0YV9jb211bml0eS9zcmMvbW9jay9jb3Vwb24udHNcIjsvLyBcdTVCQTFcdTYyNzlcdTZENDFcdTY1NzBcdTYzNkVcbmV4cG9ydCBjb25zdCBhcHByb3ZhbEZsb3dNb2NrRGF0YSA9IFtcbiAge1xuICAgIGlkOiAxLFxuICAgIHRlbXBsYXRlSWQ6IDEsXG4gICAgdHlwZTogJ3RlbXBsYXRlJyxcbiAgICBzdGF0dXM6ICdcdTVCQTFcdTYyNzlcdTkwMUFcdThGQzcnLFxuICAgIGFwcHJvdmVyczogW1xuICAgICAge1xuICAgICAgICBpZDogMSxcbiAgICAgICAgbmFtZTogJ1x1NUYyMFx1NEUwOScsXG4gICAgICAgIHJvbGU6ICdcdTRFQTdcdTU0QzFcdTdFQ0ZcdTc0MDYnLFxuICAgICAgICBzdGF0dXM6ICdcdTVERjJcdTkwMUFcdThGQzcnLFxuICAgICAgICBhcHByb3ZhbFRpbWU6ICcyMDI0LTAxLTAxIDEwOjMwOjAwJyxcbiAgICAgICAgY29tbWVudDogJ1x1NkQzQlx1NTJBOFx1NjVCOVx1Njg0OFx1NTQwOFx1NzQwNlx1RkYwQ1x1NTQwQ1x1NjEwRlx1NEUwQVx1N0VCRidcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAyLFxuICAgICAgICBuYW1lOiAnXHU2NzRFXHU1NkRCJyxcbiAgICAgICAgcm9sZTogJ1x1OThDRVx1NjNBN1x1N0VDRlx1NzQwNicsXG4gICAgICAgIHN0YXR1czogJ1x1NURGMlx1OTAxQVx1OEZDNycsXG4gICAgICAgIGFwcHJvdmFsVGltZTogJzIwMjQtMDEtMDEgMTQ6MjA6MDAnLFxuICAgICAgICBjb21tZW50OiAnXHU5OENFXHU5NjY5XHU1M0VGXHU2M0E3XHVGRjBDXHU1NDBDXHU2MTBGXHU0RTBBXHU3RUJGJ1xuICAgICAgfVxuICAgIF0sXG4gICAgY3JlYXRlVGltZTogJzIwMjQtMDEtMDEgMDk6MDA6MDAnLFxuICAgIHVwZGF0ZVRpbWU6ICcyMDI0LTAxLTAxIDE0OjIwOjAwJ1xuICB9LFxuICB7XG4gICAgaWQ6IDIsXG4gICAgdGVtcGxhdGVJZDogMixcbiAgICB0eXBlOiAndGVtcGxhdGUnLFxuICAgIHN0YXR1czogJ1x1NUJBMVx1NjI3OVx1NEUyRCcsXG4gICAgYXBwcm92ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIGlkOiAzLFxuICAgICAgICBuYW1lOiAnXHU3MzhCXHU0RTk0JyxcbiAgICAgICAgcm9sZTogJ1x1NEVBN1x1NTRDMVx1N0VDRlx1NzQwNicsXG4gICAgICAgIHN0YXR1czogJ1x1NURGMlx1OTAxQVx1OEZDNycsXG4gICAgICAgIGFwcHJvdmFsVGltZTogJzIwMjQtMDEtMDIgMTE6MTU6MDAnLFxuICAgICAgICBjb21tZW50OiAnXHU2RDNCXHU1MkE4XHU2NUI5XHU2ODQ4XHU1M0VGXHU4ODRDJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IDQsXG4gICAgICAgIG5hbWU6ICdcdThENzVcdTUxNkQnLFxuICAgICAgICByb2xlOiAnXHU5OENFXHU2M0E3XHU3RUNGXHU3NDA2JyxcbiAgICAgICAgc3RhdHVzOiAnXHU1Rjg1XHU1QkExXHU2Mjc5JyxcbiAgICAgICAgYXBwcm92YWxUaW1lOiBudWxsLFxuICAgICAgICBjb21tZW50OiBudWxsXG4gICAgICB9XG4gICAgXSxcbiAgICBjcmVhdGVUaW1lOiAnMjAyNC0wMS0wMiAxMDowMDowMCcsXG4gICAgdXBkYXRlVGltZTogJzIwMjQtMDEtMDIgMTE6MTU6MDAnXG4gIH0sXG4gIHtcbiAgICBpZDogMyxcbiAgICB0ZW1wbGF0ZUlkOiAzLFxuICAgIHR5cGU6ICd0ZW1wbGF0ZScsXG4gICAgc3RhdHVzOiAnXHU1QkExXHU2Mjc5XHU2MkQyXHU3RUREJyxcbiAgICBhcHByb3ZlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgaWQ6IDUsXG4gICAgICAgIG5hbWU6ICdcdTVGMjBcdTRFMDknLFxuICAgICAgICByb2xlOiAnXHU0RUE3XHU1NEMxXHU3RUNGXHU3NDA2JyxcbiAgICAgICAgc3RhdHVzOiAnXHU1REYyXHU2MkQyXHU3RUREJyxcbiAgICAgICAgYXBwcm92YWxUaW1lOiAnMjAyNC0wMS0wMyAxNjo0NTowMCcsXG4gICAgICAgIGNvbW1lbnQ6ICdcdTZEM0JcdTUyQThcdTY1QjlcdTY4NDhcdTVCNThcdTU3MjhcdTk4Q0VcdTk2NjlcdUZGMENcdTVFRkFcdThCQUVcdThDMDNcdTY1NzQnXG4gICAgICB9XG4gICAgXSxcbiAgICBjcmVhdGVUaW1lOiAnMjAyNC0wMS0wMyAxNTozMDowMCcsXG4gICAgdXBkYXRlVGltZTogJzIwMjQtMDEtMDMgMTY6NDU6MDAnXG4gIH1cbl1cblxuLy8gXHU1MjM4XHU2QTIxXHU3MjQ4XHU2NTcwXHU2MzZFXG5leHBvcnQgY29uc3QgdGVtcGxhdGVNb2NrRGF0YSA9IFtcbiAge1xuICAgIGlkOiA1LFxuICAgIG5hbWU6ICdcdTk1N0ZcdTY3MUZcdTUxNERcdTYwNkZcdTUyMzhcdTZBMjFcdTcyNDgnLFxuICAgIHR5cGU6ICdpbnRlcmVzdF9mcmVlJyxcbiAgICBzdGF0dXM6ICdcdTc1MUZcdTY1NDhcdTRFMkQnLFxuICAgIGNyZWF0ZVRpbWU6ICcyMDI0LTAxLTA1JyxcbiAgICBjcmVhdG9yOiAnXHU3MzhCXHU0RTk0JyxcbiAgICBhcHByb3ZhbFN0YXR1czogJ1x1NUJBMVx1NjI3OVx1OTAxQVx1OEZDNycsXG4gICAgdmFsaWRpdHlQZXJpb2RUeXBlOiAndW5saW1pdGVkJyxcbiAgICBmaXJzdFVzZU9ubHk6IGZhbHNlLFxuICAgIHN0YWNrYWJsZTogZmFsc2UsXG4gICAgcHJvZHVjdHM6IFsncGVyc29uYWxfbG9hbicsICdTRUxGX0FQUCddLFxuICAgIHJlcGF5bWVudE1ldGhvZHM6IFsnZXF1YWxfcHJpbmNpcGFsJywgJ2VxdWFsX2luc3RhbGxtZW50J10sXG4gICAgbG9hblBlcmlvZFR5cGU6ICdmaXhlZCcsXG4gICAgbG9hblBlcmlvZDogNjAsXG4gICAgbG9hbkFtb3VudE1pbjogMjAwMDAsXG4gICAgbG9hbkFtb3VudE1heDogMTUwMDAwLFxuICAgIHVzZUNoYW5uZWxzOiBbJ2FwcCcsICdtaW5pcHJvZ3JhbScsICdoNSddLFxuICAgIGNyZWRpdENoYW5uZWxzOiBbJ2FwcCcsICdtaW5pcHJvZ3JhbSddLFxuICAgIGRlc2NyaXB0aW9uOiAnXHU5NTdGXHU2NzFGXHU1MTREXHU2MDZGXHU2RDNCXHU1MkE4XHU1MjM4JyxcbiAgICBpbnRlcmVzdEZyZWVEYXlzOiA2MCxcbiAgICBtYXhJbnRlcmVzdEZyZWVBbW91bnQ6IDE1MDAwMCxcbiAgICBkaXNwbGF5Q29uZmlnOiB7XG4gICAgICBzaG93RXhwaXJ5RGF0ZTogdHJ1ZSxcbiAgICAgIGV4cGlyeVJlbWluZGVyOiA3LFxuICAgICAgc2hvd1VzYWdlSW5zdHJ1Y3Rpb25zOiB0cnVlXG4gICAgfVxuICB9LFxuICB7XG4gICAgaWQ6IDEsXG4gICAgbmFtZTogJ1x1OTk5Nlx1NTAxRjMwXHU1OTI5XHU1MTREXHU2MDZGXHU1MjM4XHU2QTIxXHU3MjQ4JyxcbiAgICB0eXBlOiAnaW50ZXJlc3RfZnJlZScsXG4gICAgc3RhdHVzOiAnXHU4MzQ5XHU3QTNGJyxcbiAgICBjcmVhdGVUaW1lOiAnMjAyNC0wMS0wMScsXG4gICAgY3JlYXRvcjogJ1x1NUYyMFx1NEUwOScsXG4gICAgYXBwcm92YWxTdGF0dXM6ICdcdTVCQTFcdTYyNzlcdTkwMUFcdThGQzcnLFxuICAgIGFwcHJvdmFsSWQ6IDEsXG4gICAgdmFsaWRpdHlQZXJpb2RUeXBlOiAnbGltaXRlZCcsXG4gICAgdmFsaWRpdHlQZXJpb2Q6IFsnMjAyNC0wMS0wMScsICcyMDI0LTEyLTMxJ10sXG4gICAgZmlyc3RVc2VPbmx5OiB0cnVlLFxuICAgIHN0YWNrYWJsZTogZmFsc2UsXG4gICAgcHJvZHVjdHM6IFsnU0VMRl9BUFAnXSxcbiAgICByZXBheW1lbnRNZXRob2RzOiBbJ2VxdWFsX3ByaW5jaXBhbCcsICdlcXVhbF9pbnN0YWxsbWVudCddLFxuICAgIGxvYW5QZXJpb2RUeXBlOiAnZml4ZWQnLFxuICAgIGxvYW5QZXJpb2Q6IDMwLFxuICAgIGxvYW5BbW91bnRNaW46IDEwMDAwLFxuICAgIGxvYW5BbW91bnRNYXg6IDEwMDAwMCxcbiAgICB1c2VDaGFubmVsczogWydhcHAnLCAnbWluaXByb2dyYW0nLCAnaDUnXSxcbiAgICBjcmVkaXRDaGFubmVsczogWydhcHAnLCAnbWluaXByb2dyYW0nXSxcbiAgICBkZXNjcmlwdGlvbjogJ1x1NjVCMFx1NzUyOFx1NjIzN1x1OTk5Nlx1NTAxRjMwXHU1OTI5XHU1MTREXHU2MDZGJyxcbiAgICBpbnRlcmVzdEZyZWVEYXlzOiAzMCxcbiAgICBtYXhJbnRlcmVzdEZyZWVBbW91bnQ6IDEwMDAwMCxcbiAgICBkaXNwbGF5Q29uZmlnOiB7XG4gICAgICBzaG93RXhwaXJ5RGF0ZTogdHJ1ZSxcbiAgICAgIGV4cGlyeVJlbWluZGVyOiAzLFxuICAgICAgc2hvd1VzYWdlSW5zdHJ1Y3Rpb25zOiB0cnVlXG4gICAgfVxuICB9LFxuICB7XG4gICAgaWQ6IDIsXG4gICAgbmFtZTogJ1x1OTk5Nlx1NTAxRjkwXHU1OTI5XHU1MTREXHU2MDZGXHU1MjM4XHU2QTIxXHU3MjQ4JyxcbiAgICB0eXBlOiAnaW50ZXJlc3RfZnJlZScsXG4gICAgc3RhdHVzOiAnXHU4MzQ5XHU3QTNGJyxcbiAgICBjcmVhdGVUaW1lOiAnMjAyNC0wMS0wMicsXG4gICAgY3JlYXRvcjogJ1x1NUYyMFx1NEUwOScsXG4gICAgYXBwcm92YWxTdGF0dXM6ICdcdTVCQTFcdTYyNzlcdTRFMkQnLFxuICAgIGFwcHJvdmFsSWQ6IDIsXG4gICAgdmFsaWRpdHlQZXJpb2RUeXBlOiAnbGltaXRlZCcsXG4gICAgdmFsaWRpdHlQZXJpb2Q6IFsnMjAyNC0wMS0wMScsICcyMDI0LTEyLTMxJ10sXG4gICAgZmlyc3RVc2VPbmx5OiB0cnVlLFxuICAgIHN0YWNrYWJsZTogZmFsc2UsXG4gICAgcHJvZHVjdHM6IFsncGVyc29uYWxfbG9hbiddLFxuICAgIHJlcGF5bWVudE1ldGhvZHM6IFsnZXF1YWxfcHJpbmNpcGFsJywgJ2VxdWFsX2luc3RhbGxtZW50J10sXG4gICAgbG9hblBlcmlvZFR5cGU6ICdmaXhlZCcsXG4gICAgbG9hblBlcmlvZDogOTAsXG4gICAgbG9hbkFtb3VudE1pbjogNTAwMDAsXG4gICAgbG9hbkFtb3VudE1heDogMjAwMDAwLFxuICAgIHVzZUNoYW5uZWxzOiBbJ2FwcCcsICdtaW5pcHJvZ3JhbSddLFxuICAgIGNyZWRpdENoYW5uZWxzOiBbJ2FwcCddLFxuICAgIGRlc2NyaXB0aW9uOiAnXHU2NUIwXHU3NTI4XHU2MjM3XHU5OTk2XHU1MDFGOTBcdTU5MjlcdTUxNERcdTYwNkYnLFxuICAgIGRpc3BsYXlDb25maWc6IHtcbiAgICAgIHNob3dFeHBpcnlEYXRlOiBmYWxzZSxcbiAgICAgIGV4cGlyeVJlbWluZGVyOiA1LFxuICAgICAgc2hvd1VzYWdlSW5zdHJ1Y3Rpb25zOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAge1xuICAgIGlkOiAzLFxuICAgIG5hbWU6ICdcdTU5MERcdTUwMUY4XHU2Mjk4XHU0RjE4XHU2MEUwXHU1MjM4XHU2QTIxXHU3MjQ4JyxcbiAgICB0eXBlOiAnZGlzY291bnQnLFxuICAgIHN0YXR1czogJ1x1ODM0OVx1N0EzRicsXG4gICAgY3JlYXRlVGltZTogJzIwMjQtMDEtMDMnLFxuICAgIGNyZWF0b3I6ICdcdTY3NEVcdTU2REInLFxuICAgIGFwcHJvdmFsU3RhdHVzOiAnXHU1QkExXHU2Mjc5XHU2MkQyXHU3RUREJyxcbiAgICBhcHByb3ZhbElkOiAzLFxuICAgIGRpc2NvdW50VHlwZTogJ3VuaWZvcm0nLFxuICAgIHVuaWZvcm1EaXNjb3VudDogMC44LFxuICAgIHZhbGlkaXR5UGVyaW9kVHlwZTogJ2xpbWl0ZWQnLFxuICAgIHZhbGlkaXR5UGVyaW9kOiBbJzIwMjQtMDEtMDEnLCAnMjAyNC0xMi0zMSddLFxuICAgIGZpcnN0VXNlT25seTogZmFsc2UsXG4gICAgc3RhY2thYmxlOiB0cnVlLFxuICAgIHByb2R1Y3RzOiBbJ1NFTEZfQVBQJ10sXG4gICAgcmVwYXltZW50TWV0aG9kczogWydlcXVhbF9wcmluY2lwYWwnXSxcbiAgICBsb2FuUGVyaW9kVHlwZTogJ3JhbmdlJyxcbiAgICBsb2FuUGVyaW9kTWluOiAzLFxuICAgIGxvYW5QZXJpb2RNYXg6IDEyLFxuICAgIGxvYW5BbW91bnRNaW46IDUwMDAsXG4gICAgbG9hbkFtb3VudE1heDogNTAwMDAsXG4gICAgdXNlQ2hhbm5lbHM6IFsnYXBwJ10sXG4gICAgY3JlZGl0Q2hhbm5lbHM6IFsnYXBwJ10sXG4gICAgZGVzY3JpcHRpb246ICdcdTgwMDFcdTc1MjhcdTYyMzdcdTU5MERcdTUwMUY4XHU2Mjk4XHU0RjE4XHU2MEUwJyxcbiAgICBkaXNwbGF5Q29uZmlnOiB7XG4gICAgICBzaG93RXhwaXJ5RGF0ZTogdHJ1ZSxcbiAgICAgIGV4cGlyeVJlbWluZGVyOiA3LFxuICAgICAgc2hvd1VzYWdlSW5zdHJ1Y3Rpb25zOiB0cnVlXG4gICAgfVxuICB9LFxuICB7XG4gICAgaWQ6IDQsXG4gICAgbmFtZTogJ1x1NTkwRFx1NTAxRjdcdTYyOThcdTRGMThcdTYwRTBcdTUyMzhcdTZBMjFcdTcyNDgnLFxuICAgIHR5cGU6ICdkaXNjb3VudCcsXG4gICAgc3RhdHVzOiAnXHU4MzQ5XHU3QTNGJyxcbiAgICBjcmVhdGVUaW1lOiAnMjAyNC0wMS0wNCcsXG4gICAgY3JlYXRvcjogJ1x1Njc0RVx1NTZEQicsXG4gICAgZGlzY291bnRUeXBlOiAncGVyY2VudGFnZScsXG4gICAgZGlzY291bnRWYWx1ZTogNzAsXG4gICAgdmFsaWRpdHlQZXJpb2RUeXBlOiAnbGltaXRlZCcsXG4gICAgdmFsaWRpdHlQZXJpb2Q6IFsnMjAyNC0wMS0wMScsICcyMDI0LTEyLTMxJ10sXG4gICAgZmlyc3RVc2VPbmx5OiBmYWxzZSxcbiAgICBzdGFja2FibGU6IGZhbHNlLFxuICAgIHByb2R1Y3RzOiBbJ3BlcnNvbmFsX2xvYW4nXSxcbiAgICByZXBheW1lbnRNZXRob2RzOiBbJ2VxdWFsX2luc3RhbGxtZW50J10sXG4gICAgbG9hblBlcmlvZFR5cGU6ICdyYW5nZScsXG4gICAgbG9hblBlcmlvZE1pbjogNixcbiAgICBsb2FuUGVyaW9kTWF4OiAyNCxcbiAgICBsb2FuQW1vdW50TWluOiAxMDAwMDAsXG4gICAgbG9hbkFtb3VudE1heDogNTAwMDAwLFxuICAgIHVzZUNoYW5uZWxzOiBbJ2FwcCddLFxuICAgIGNyZWRpdENoYW5uZWxzOiBbJ2FwcCddLFxuICAgIGRlc2NyaXB0aW9uOiAnXHU4MDAxXHU3NTI4XHU2MjM3XHU1OTBEXHU1MDFGN1x1NjI5OFx1NEYxOFx1NjBFMCcsXG4gICAgZGlzcGxheUNvbmZpZzoge1xuICAgICAgc2hvd0V4cGlyeURhdGU6IGZhbHNlLFxuICAgICAgZXhwaXJ5UmVtaW5kZXI6IDEwLFxuICAgICAgc2hvd1VzYWdlSW5zdHJ1Y3Rpb25zOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAge1xuICAgIGlkOiA2LFxuICAgIG5hbWU6ICdcdTgyODJcdTY1RTVcdTcyNzlcdTYwRTBcdTUxNERcdTYwNkZcdTUyMzhcdTZBMjFcdTcyNDgnLFxuICAgIHR5cGU6ICdpbnRlcmVzdF9mcmVlJyxcbiAgICBzdGF0dXM6ICdcdTc1MUZcdTY1NDhcdTRFMkQnLFxuICAgIGNyZWF0ZVRpbWU6ICcyMDI0LTAxLTA2JyxcbiAgICBjcmVhdG9yOiAnXHU4RDc1XHU1MTZEJyxcbiAgICBhcHByb3ZhbFN0YXR1czogJ1x1NUJBMVx1NjI3OVx1OTAxQVx1OEZDNycsXG4gICAgdmFsaWRpdHlQZXJpb2RUeXBlOiAnbGltaXRlZCcsXG4gICAgdmFsaWRpdHlQZXJpb2Q6IFsnMjAyNC0wMi0wMScsICcyMDI0LTAyLTI5J10sXG4gICAgZmlyc3RVc2VPbmx5OiBmYWxzZSxcbiAgICBzdGFja2FibGU6IHRydWUsXG4gICAgcHJvZHVjdHM6IFsnU0VMRl9BUFAnLCAncGVyc29uYWxfbG9hbiddLFxuICAgIHJlcGF5bWVudE1ldGhvZHM6IFsnZXF1YWxfcHJpbmNpcGFsJywgJ2VxdWFsX2luc3RhbGxtZW50J10sXG4gICAgbG9hblBlcmlvZFR5cGU6ICdyYW5nZScsXG4gICAgbG9hblBlcmlvZE1pbjogMTIsXG4gICAgbG9hblBlcmlvZE1heDogMzYsXG4gICAgbG9hbkFtb3VudE1pbjogMzAwMDAsXG4gICAgbG9hbkFtb3VudE1heDogMzAwMDAwLFxuICAgIHVzZUNoYW5uZWxzOiBbJ2FwcCcsICdtaW5pcHJvZ3JhbScsICdoNSddLFxuICAgIGNyZWRpdENoYW5uZWxzOiBbJ2FwcCcsICdtaW5pcHJvZ3JhbSddLFxuICAgIGRlc2NyaXB0aW9uOiAnXHU4MjgyXHU2NUU1XHU3Mjc5XHU2MEUwXHU2RDNCXHU1MkE4XHU1MjM4JyxcbiAgICBpbnRlcmVzdEZyZWVEYXlzOiA0NSxcbiAgICBtYXhJbnRlcmVzdEZyZWVBbW91bnQ6IDMwMDAwMCxcbiAgICBkaXNwbGF5Q29uZmlnOiB7XG4gICAgICBzaG93RXhwaXJ5RGF0ZTogdHJ1ZSxcbiAgICAgIGV4cGlyeVJlbWluZGVyOiAzLFxuICAgICAgc2hvd1VzYWdlSW5zdHJ1Y3Rpb25zOiB0cnVlXG4gICAgfVxuICB9XG5dXG5cbi8vIFx1NTIzOFx1NTMwNVx1NjU3MFx1NjM2RVxuZXhwb3J0IGNvbnN0IHBhY2thZ2VNb2NrRGF0YSA9IFtcbiAge1xuICAgIGlkOiAxLFxuICAgIG5hbWU6ICdcdTY1QjBcdTY2MjVcdTc5M0NcdTUzMDUnLFxuICAgIHR5cGU6ICdcdTdFQzRcdTU0MDhcdTUyMzhcdTUzMDUnLFxuICAgIHN0YXR1czogJ1x1NzUxRlx1NjU0OFx1NEUyRCcsXG4gICAgY3JlYXRlVGltZTogJzIwMjQtMDEtMTAnLFxuICAgIHN0YXJ0VGltZTogJzIwMjQtMDEtMTUnLFxuICAgIGVuZFRpbWU6ICcyMDI0LTAyLTE1JyxcbiAgICB0b3RhbENvdW50OiAxMDAwLFxuICAgIHN0b2NrOiA4MDAsXG4gICAgdW5jbGFpbWVkOiA1MDAsXG4gICAgY2xhaW1lZDogMzAwLFxuICAgIGxvY2tlZDogNTAsXG4gICAgdmVyaWZpZWQ6IDE1MCxcbiAgICBleHBpcmVkOiAwLFxuICAgIGludmFsaWQ6IDAsXG4gICAgcnVsZXM6ICdcdTUzMDVcdTU0MkIzMFx1NTkyOVx1NTE0RFx1NjA2Rlx1NTIzOFx1NTQ4QzhcdTYyOThcdTRGMThcdTYwRTBcdTUyMzgnLFxuICAgIG9wZXJhdG9yOiAnXHU1RjIwXHU0RTA5JyxcbiAgICBhdWRpdG9yOiAnXHU2NzRFXHU1NkRCJyxcbiAgICB2YWxpZGl0eVN0YXJ0VGltZTogJzIwMjQtMDEtMTUnLFxuICAgIHZhbGlkaXR5RW5kVGltZTogJzIwMjQtMDItMTUnLFxuICAgIGRhaWx5TGltaXQ6IDEwMCxcbiAgICB3ZWVrbHlMaW1pdDogNTAwLFxuICAgIG1vbnRobHlMaW1pdDogMjAwMCxcbiAgICB1c2VyTGltaXREZXNjOiAnXHU1MzU1XHU0RTAwXHU3NTI4XHU2MjM3XHU1MzU1XHU2QjIxXHU1M0VBXHU4MEZEXHU2MkU1XHU2NzA5XHU1MzU1XHU0RTAwXHU1RjIwXHU1NDBDSURcdTUyMzhcdTUzMDUnXG4gIH0sXG4gIHtcbiAgICBpZDogMixcbiAgICBuYW1lOiAnXHU1NDY4XHU1RTc0XHU1RTg2XHU3OTNDXHU1MzA1JyxcbiAgICB0eXBlOiAnXHU3RUM0XHU1NDA4XHU1MjM4XHU1MzA1JyxcbiAgICBzdGF0dXM6ICdcdTVGODVcdTVCQTFcdTY4MzgnLFxuICAgIGNyZWF0ZVRpbWU6ICcyMDI0LTAxLTIwJyxcbiAgICBzdGFydFRpbWU6ICcyMDI0LTAyLTAxJyxcbiAgICBlbmRUaW1lOiAnMjAyNC0wMi0yOScsXG4gICAgdG90YWxDb3VudDogNTAwLFxuICAgIHN0b2NrOiA1MDAsXG4gICAgdW5jbGFpbWVkOiA1MDAsXG4gICAgY2xhaW1lZDogMCxcbiAgICBsb2NrZWQ6IDAsXG4gICAgdmVyaWZpZWQ6IDAsXG4gICAgZXhwaXJlZDogMCxcbiAgICBpbnZhbGlkOiAwLFxuICAgIHJ1bGVzOiAnXHU1MzA1XHU1NDJCOTBcdTU5MjlcdTUxNERcdTYwNkZcdTUyMzhcdTU0OEM3XHU2Mjk4XHU0RjE4XHU2MEUwXHU1MjM4JyxcbiAgICBvcGVyYXRvcjogJ1x1Njc0RVx1NTZEQicsXG4gICAgYXVkaXRvcjogJ1x1NUYyMFx1NEUwOScsXG4gICAgdmFsaWRpdHlTdGFydFRpbWU6ICcyMDI0LTAyLTAxJyxcbiAgICB2YWxpZGl0eUVuZFRpbWU6ICcyMDI0LTAyLTI5J1xuICB9XG5dXG5cbi8vIFx1NTIzOFx1NjU3MFx1NjM2RVxuZXhwb3J0IGNvbnN0IGNvdXBvbk1vY2tEYXRhID0gW1xuICB7XG4gICAgaWQ6IDEsXG4gICAgdGVtcGxhdGVJZDogMSxcbiAgICBuYW1lOiAnXHU5OTk2XHU1MDFGMzBcdTU5MjlcdTUxNERcdTYwNkZcdTUyMzgnLFxuICAgIHR5cGU6ICdcdTUxNERcdTYwNkZcdTUyMzgnLFxuICAgIHN0YXR1czogJ1x1ODM0OVx1N0EzRicsXG4gICAgY3JlYXRlVGltZTogJzIwMjQtMDEtMTAnLFxuICAgIHN0YXJ0VGltZTogJzIwMjQtMDEtMTUnLFxuICAgIGVuZFRpbWU6ICcyMDI0LTAyLTE1JyxcbiAgICB0b3RhbENvdW50OiAxMDAwLFxuICAgIHN0b2NrOiAxMDAwLFxuICAgIHVuY2xhaW1lZDogMTAwMCxcbiAgICBjbGFpbWVkOiAwLFxuICAgIGxvY2tlZDogMCxcbiAgICB2ZXJpZmllZDogMCxcbiAgICBleHBpcmVkOiAwLFxuICAgIGludmFsaWQ6IDAsXG4gICAgcnVsZXM6ICcxLiBcdTRFQzVcdTk2NTBcdTk5OTZcdTZCMjFcdTUwMUZcdTZCM0VcdTc1MjhcdTYyMzdcdTRGN0ZcdTc1MjhcXG4yLiBcdTUwMUZcdTZCM0VcdTY3MUZcdTk2NTBcdTU2RkFcdTVCOUFcdTRFM0EzMFx1NTkyOVxcbjMuIFx1NTM1NVx1N0IxNFx1NTAxRlx1NkIzRVx1OTFEMVx1OTg5RDEwLDAwMC0xMDAsMDAwXHU1MTQzXFxuNC4gXHU1MTREXHU2MDZGXHU5MUQxXHU5ODlEXHU0RTBBXHU5NjUwMTAwLDAwMFx1NTE0M1xcbjUuIFx1NEUwRFx1NTNFRlx1NEUwRVx1NTE3Nlx1NEVENlx1NEYxOFx1NjBFMFx1NTIzOFx1NTNFMFx1NTJBMFx1NEY3Rlx1NzUyOCcsXG4gICAgb3BlcmF0b3I6ICdcdTVGMjBcdTRFMDknLFxuICAgIGF1ZGl0b3I6ICdcdTY3NEVcdTU2REInLFxuICAgIHZhbGlkaXR5U3RhcnRUaW1lOiAnMjAyNC0wMS0xNScsXG4gICAgdmFsaWRpdHlFbmRUaW1lOiAnMjAyNC0wMi0xNScsXG4gICAgZGFpbHlMaW1pdDogMTAwLFxuICAgIHdlZWtseUxpbWl0OiA1MDAsXG4gICAgbW9udGhseUxpbWl0OiAyMDAwLFxuICAgIHVzZXJMaW1pdERlc2M6ICdcdTUzNTVcdTRFMDBcdTc1MjhcdTYyMzdcdTUzNTVcdTZCMjFcdTUzRUFcdTgwRkRcdTYyRTVcdTY3MDlcdTUzNTVcdTRFMDBcdTVGMjBcdTU0MENJRFx1NTIzOCdcbiAgfSxcbiAge1xuICAgIGlkOiAyLFxuICAgIHRlbXBsYXRlSWQ6IDIsXG4gICAgbmFtZTogJ1x1OTk5Nlx1NTAxRjkwXHU1OTI5XHU1MTREXHU2MDZGXHU1MjM4JyxcbiAgICB0eXBlOiAnXHU1MTREXHU2MDZGXHU1MjM4JyxcbiAgICBzdGF0dXM6ICdcdTVGODVcdTVCQTFcdTY4MzgnLFxuICAgIGNyZWF0ZVRpbWU6ICcyMDI0LTAxLTIwJyxcbiAgICBzdGFydFRpbWU6ICcyMDI0LTAyLTAxJyxcbiAgICBlbmRUaW1lOiAnMjAyNC0wMi0yOScsXG4gICAgdG90YWxDb3VudDogNTAwLFxuICAgIHN0b2NrOiA1MDAsXG4gICAgdW5jbGFpbWVkOiA1MDAsXG4gICAgY2xhaW1lZDogMCxcbiAgICBsb2NrZWQ6IDAsXG4gICAgdmVyaWZpZWQ6IDAsXG4gICAgZXhwaXJlZDogMCxcbiAgICBpbnZhbGlkOiAwLFxuICAgIHJ1bGVzOiAnMS4gXHU0RUM1XHU5NjUwXHU5OTk2XHU2QjIxXHU1MDFGXHU2QjNFXHU3NTI4XHU2MjM3XHU0RjdGXHU3NTI4XFxuMi4gXHU1MDFGXHU2QjNFXHU2NzFGXHU5NjUwXHU1NkZBXHU1QjlBXHU0RTNBOTBcdTU5MjlcXG4zLiBcdTUzNTVcdTdCMTRcdTUwMUZcdTZCM0VcdTkxRDFcdTk4OUQ1MCwwMDAtMjAwLDAwMFx1NTE0M1xcbjQuIFx1NTNFRlx1NTcyOEFQUFx1NTQ4Q1x1NUMwRlx1N0EwQlx1NUU4Rlx1NkUyMFx1OTA1M1x1NEY3Rlx1NzUyOFxcbjUuIFx1NEUwRFx1NTNFRlx1NEUwRVx1NTE3Nlx1NEVENlx1NEYxOFx1NjBFMFx1NTIzOFx1NTNFMFx1NTJBMFx1NEY3Rlx1NzUyOCcsXG4gICAgb3BlcmF0b3I6ICdcdTY3NEVcdTU2REInLFxuICAgIGF1ZGl0b3I6ICdcdTVGMjBcdTRFMDknLFxuICAgIHZhbGlkaXR5U3RhcnRUaW1lOiAnMjAyNC0wMi0wMScsXG4gICAgdmFsaWRpdHlFbmRUaW1lOiAnMjAyNC0wMi0yOSdcbiAgfSxcbiAge1xuICAgIGlkOiAzLFxuICAgIHRlbXBsYXRlSWQ6IDMsXG4gICAgbmFtZTogJ1x1NTkwRFx1NTAxRjhcdTYyOThcdTRGMThcdTYwRTBcdTUyMzgnLFxuICAgIHR5cGU6ICdcdTYyOThcdTYyNjNcdTUyMzgnLFxuICAgIHN0YXR1czogJ1x1NzUxRlx1NjU0OFx1NEUyRCcsXG4gICAgY3JlYXRlVGltZTogJzIwMjQtMDEtMjUnLFxuICAgIHN0YXJ0VGltZTogJzIwMjQtMDItMDEnLFxuICAgIGVuZFRpbWU6ICcyMDI0LTAzLTMxJyxcbiAgICB0b3RhbENvdW50OiAyMDAwLFxuICAgIHN0b2NrOiAyMDAwLFxuICAgIHVuY2xhaW1lZDogMTUwMCxcbiAgICBjbGFpbWVkOiAzMDAsXG4gICAgbG9ja2VkOiA1MCxcbiAgICB2ZXJpZmllZDogMTUwLFxuICAgIGV4cGlyZWQ6IDAsXG4gICAgaW52YWxpZDogMCxcbiAgICBydWxlczogJzEuIFx1OTY1MFx1NTkwRFx1NTAxRlx1NzUyOFx1NjIzN1x1NEY3Rlx1NzUyOFxcbjIuIFx1NTAxRlx1NkIzRVx1NjcxRlx1OTY1MDMtMTJcdTRFMkFcdTY3MDhcXG4zLiBcdTUzNTVcdTdCMTRcdTUwMUZcdTZCM0VcdTkxRDFcdTk4OUQ1LDAwMC01MCwwMDBcdTUxNDNcXG40LiBcdTdFREZcdTRFMDA4XHU2Mjk4XHU1MjI5XHU3Mzg3XHU0RjE4XHU2MEUwXFxuNS4gXHU1M0VGXHU0RTBFXHU1MTc2XHU0RUQ2XHU0RjE4XHU2MEUwXHU1MjM4XHU1M0UwXHU1MkEwXHU0RjdGXHU3NTI4XFxuNi4gXHU0RUM1XHU5NjUwQVBQXHU2RTIwXHU5MDUzXHU0RjdGXHU3NTI4JyxcbiAgICBvcGVyYXRvcjogJ1x1NUYyMFx1NEUwOScsXG4gICAgYXVkaXRvcjogJ1x1NzM4Qlx1NEU5NCcsXG4gICAgdmFsaWRpdHlTdGFydFRpbWU6ICcyMDI0LTAyLTAxJyxcbiAgICB2YWxpZGl0eUVuZFRpbWU6ICcyMDI0LTAzLTMxJ1xuICB9LFxuICB7XG4gICAgaWQ6IDQsXG4gICAgdGVtcGxhdGVJZDogNCxcbiAgICBuYW1lOiAnXHU1OTBEXHU1MDFGN1x1NjI5OFx1NEYxOFx1NjBFMFx1NTIzOCcsXG4gICAgdHlwZTogJ1x1NjI5OFx1NjI2M1x1NTIzOCcsXG4gICAgc3RhdHVzOiAnXHU3OTY4XHU1MkI1XHU1MDVDXHU1M0QxJyxcbiAgICBjcmVhdGVUaW1lOiAnMjAyNC0wMS0zMCcsXG4gICAgc3RhcnRUaW1lOiAnMjAyNC0wMi0xNScsXG4gICAgZW5kVGltZTogJzIwMjQtMDMtMTUnLFxuICAgIHRvdGFsQ291bnQ6IDEwMDAsXG4gICAgc3RvY2s6IDEwMDAsXG4gICAgdW5jbGFpbWVkOiA2MDAsXG4gICAgY2xhaW1lZDogMjAwLFxuICAgIGxvY2tlZDogMzAsXG4gICAgdmVyaWZpZWQ6IDEyMCxcbiAgICBleHBpcmVkOiA1MCxcbiAgICBpbnZhbGlkOiAwLFxuICAgIHJ1bGVzOiAnMS4gXHU5NjUwXHU1OTBEXHU1MDFGXHU3NTI4XHU2MjM3XHU0RjdGXHU3NTI4XFxuMi4gXHU1MDFGXHU2QjNFXHU2NzFGXHU5NjUwNi0yNFx1NEUyQVx1NjcwOFxcbjMuIFx1NTM1NVx1N0IxNFx1NTAxRlx1NkIzRVx1OTFEMVx1OTg5RDEwMCwwMDAtNTAwLDAwMFx1NTE0M1xcbjQuIFx1NEVBQlx1NTNENzdcdTYyOThcdTUyMjlcdTczODdcdTRGMThcdTYwRTBcXG41LiBcdTRFMERcdTUzRUZcdTRFMEVcdTUxNzZcdTRFRDZcdTRGMThcdTYwRTBcdTUyMzhcdTUzRTBcdTUyQTBcdTRGN0ZcdTc1MjhcXG42LiBcdTRFQzVcdTk2NTBBUFBcdTZFMjBcdTkwNTNcdTRGN0ZcdTc1MjgnLFxuICAgIG9wZXJhdG9yOiAnXHU2NzRFXHU1NkRCJyxcbiAgICBhdWRpdG9yOiAnXHU1RjIwXHU0RTA5JyxcbiAgICB2YWxpZGl0eVN0YXJ0VGltZTogJzIwMjQtMDItMTUnLFxuICAgIHZhbGlkaXR5RW5kVGltZTogJzIwMjQtMDMtMTUnXG4gIH0sXG4gIHtcbiAgICBpZDogNSxcbiAgICB0ZW1wbGF0ZUlkOiAxLFxuICAgIG5hbWU6ICdcdTY1QjBcdTY2MjUzMFx1NTkyOVx1NTE0RFx1NjA2Rlx1NTIzOCcsXG4gICAgdHlwZTogJ1x1NTE0RFx1NjA2Rlx1NTIzOCcsXG4gICAgc3RhdHVzOiAnXHU3OTY4XHU1MkI1XHU1OTMxXHU2NTQ4JyxcbiAgICBjcmVhdGVUaW1lOiAnMjAyNC0wMS0wNScsXG4gICAgc3RhcnRUaW1lOiAnMjAyNC0wMS0xMCcsXG4gICAgZW5kVGltZTogJzIwMjQtMDEtMjUnLFxuICAgIHRvdGFsQ291bnQ6IDgwMCxcbiAgICBzdG9jazogODAwLFxuICAgIHVuY2xhaW1lZDogMCxcbiAgICBjbGFpbWVkOiAwLFxuICAgIGxvY2tlZDogMCxcbiAgICB2ZXJpZmllZDogNjAwLFxuICAgIGV4cGlyZWQ6IDIwMCxcbiAgICBpbnZhbGlkOiAwLFxuICAgIHJ1bGVzOiAnMS4gXHU2NUIwXHU2NjI1XHU3Mjc5XHU2MEUwXHU2RDNCXHU1MkE4XHU0RTEzXHU1QzVFXHU0RjE4XHU2MEUwXFxuMi4gXHU1MDFGXHU2QjNFXHU2NzFGXHU5NjUwXHU1NkZBXHU1QjlBXHU0RTNBMzBcdTU5MjlcXG4zLiBcdTUzNTVcdTdCMTRcdTUwMUZcdTZCM0VcdTkxRDFcdTk4OUQxMCwwMDAtMTAwLDAwMFx1NTE0M1xcbjQuIFx1NTE0RFx1NjA2Rlx1OTFEMVx1OTg5RFx1NEUwQVx1OTY1MDEwMCwwMDBcdTUxNDNcXG41LiBcdTRFMERcdTUzRUZcdTRFMEVcdTUxNzZcdTRFRDZcdTRGMThcdTYwRTBcdTUyMzhcdTUzRTBcdTUyQTBcdTRGN0ZcdTc1MjgnLFxuICAgIG9wZXJhdG9yOiAnXHU3MzhCXHU0RTk0JyxcbiAgICBhdWRpdG9yOiAnXHU1RjIwXHU0RTA5JyxcbiAgICB2YWxpZGl0eVN0YXJ0VGltZTogJzIwMjQtMDEtMTAnLFxuICAgIHZhbGlkaXR5RW5kVGltZTogJzIwMjQtMDEtMjUnXG4gIH1cbl1cblxuLy8gXHU1MjM4XHU2RDQxXHU2QzM0XHU4QkIwXHU1RjU1XHU2NTcwXHU2MzZFXG5leHBvcnQgY29uc3QgcmVjb3JkTW9ja0RhdGEgPSBbXG4gIC8vIFx1NjRBNFx1NTZERVx1OEJCMFx1NUY1NVxuICB7XG4gICAgdXNlcklkOiAnMTAwMDgnLFxuICAgIGNvdXBvbklkOiAnQ1AwMDgnLFxuICAgIHBhY2thZ2VJZDogJ1BLRzAwOCcsXG4gICAgdGFza0lkOiAnVEFTSzAwOCcsXG4gICAgb3BlcmF0aW9uVHlwZTogJ1x1NjRBNFx1NTZERScsXG4gICAgc3RhdHVzOiAnXHU2MjEwXHU1MjlGJyxcbiAgICBvcGVyYXRpb25UaW1lOiAnMjAyNC0wMS0yMiAxNDozMDowMCcsXG4gICAgb3BlcmF0b3I6ICdBRE1JTicsXG4gICAgd2l0aGRyYXdSZWFzb246ICdcdTZEM0JcdTUyQThcdThDMDNcdTY1NzQnLFxuICAgIHdpdGhkcmF3VGltZTogJzIwMjQtMDEtMjIgMTQ6MzA6MDAnLFxuICAgIHdpdGhkcmF3T3BlcmF0b3I6ICdBRE1JTidcbiAgfSxcbiAgLy8gXHU1M0QxXHU2NTNFXHU4QkIwXHU1RjU1XG4gIHtcbiAgICB1c2VySWQ6ICcxMDAwMScsXG4gICAgY291cG9uSWQ6ICdDUDAwMScsXG4gICAgcGFja2FnZUlkOiAnUEtHMDAxJyxcbiAgICB0YXNrSWQ6ICdUQVNLMDAxJyxcbiAgICBvcGVyYXRpb25UeXBlOiAnXHU1M0QxXHU2NTNFJyxcbiAgICBzdGF0dXM6ICdcdTYyMTBcdTUyOUYnLFxuICAgIG9wZXJhdGlvblRpbWU6ICcyMDI0LTAxLTE1IDEwOjAwOjAwJyxcbiAgICBvcGVyYXRvcjogJ1NZU1RFTScsXG4gICAgdG90YWxJc3N1ZWQ6IDEwMDAsXG4gICAgc3VjY2Vzc0NvdW50OiA5NTAsXG4gICAgZmFpbGVkQ291bnQ6IDUwLFxuICAgIHdhcm5pbmc6IGZhbHNlLFxuICAgIGZhaWxlZFJlYXNvbjogJycsXG4gICAgaXNzdWVTdGFydFRpbWU6ICcyMDI0LTAxLTE1IDA5OjAwOjAwJyxcbiAgICBpc3N1ZUVuZFRpbWU6ICcyMDI0LTAxLTE1IDEwOjMwOjAwJyxcbiAgICBsb2NrUmVjb3JkczogW1xuICAgICAge1xuICAgICAgICBsb2NrVGltZTogJzIwMjQtMDEtMTUgMDk6MzA6MDAnLFxuICAgICAgICBsb2NrT3BlcmF0b3I6ICdTWVNURU0nLFxuICAgICAgICBsb2NrUmVhc29uOiAnXHU3Q0ZCXHU3RURGXHU4MUVBXHU1MkE4XHU5NTAxXHU1QjlBJ1xuICAgICAgfVxuICAgIF0sXG4gICAgdmVyaWZpY2F0aW9uUmVjb3JkczogW1xuICAgICAge1xuICAgICAgICB2ZXJpZmljYXRpb25UaW1lOiAnMjAyNC0wMS0xNiAxMTowMDowMCcsXG4gICAgICAgIHZlcmlmaWNhdGlvbk9wZXJhdG9yOiAnVVNFUl8xMDAwMScsXG4gICAgICAgIHZlcmlmaWNhdGlvblJlc3VsdDogJ1x1NjgzOFx1OTUwMFx1NjIxMFx1NTI5RidcbiAgICAgIH1cbiAgICBdXG4gIH0sXG4gIHtcbiAgICB1c2VySWQ6ICcxMDAwMicsXG4gICAgY291cG9uSWQ6ICdDUDAwMicsXG4gICAgcGFja2FnZUlkOiAnUEtHMDAyJyxcbiAgICB0YXNrSWQ6ICdUQVNLMDAyJyxcbiAgICBvcGVyYXRpb25UeXBlOiAnXHU1M0QxXHU2NTNFJyxcbiAgICBzdGF0dXM6ICdcdTU5MzFcdThEMjUnLFxuICAgIG9wZXJhdGlvblRpbWU6ICcyMDI0LTAxLTE2IDExOjMwOjAwJyxcbiAgICBvcGVyYXRvcjogJ1NZU1RFTScsXG4gICAgdG90YWxJc3N1ZWQ6IDgwMCxcbiAgICBzdWNjZXNzQ291bnQ6IDY1MCxcbiAgICBmYWlsZWRDb3VudDogMTUwLFxuICAgIHdhcm5pbmc6IHRydWUsXG4gICAgd2FybmluZ01lc3NhZ2U6ICdcdTU5MzFcdThEMjVcdTczODdcdThEODVcdThGQzcxNSUnLFxuICAgIGZhaWxlZFJlYXNvbjogJ1x1NjNBNVx1NTNFM1x1NjJBNVx1OTUxOSdcbiAgfSxcbiAge1xuICAgIHVzZXJJZDogJzEwMDAzJyxcbiAgICBjb3Vwb25JZDogJ0NQMDAzJyxcbiAgICBwYWNrYWdlSWQ6ICdQS0cwMDMnLFxuICAgIHRhc2tJZDogJ1RBU0swMDMnLFxuICAgIG9wZXJhdGlvblR5cGU6ICdcdTUzRDFcdTY1M0UnLFxuICAgIHN0YXR1czogJ1x1NjIxMFx1NTI5RicsXG4gICAgb3BlcmF0aW9uVGltZTogJzIwMjQtMDEtMTcgMDk6MTU6MDAnLFxuICAgIG9wZXJhdG9yOiAnU1lTVEVNJyxcbiAgICB0b3RhbElzc3VlZDogMTIwMCxcbiAgICBzdWNjZXNzQ291bnQ6IDEyMDAsXG4gICAgZmFpbGVkQ291bnQ6IDAsXG4gICAgd2FybmluZzogZmFsc2UsXG4gICAgZmFpbGVkUmVhc29uOiAnJ1xuICB9LFxuICB7XG4gICAgdXNlcklkOiAnMTAwMDQnLFxuICAgIGNvdXBvbklkOiAnQ1AwMDQnLFxuICAgIHBhY2thZ2VJZDogJ1BLRzAwNCcsXG4gICAgdGFza0lkOiAnVEFTSzAwNCcsXG4gICAgb3BlcmF0aW9uVHlwZTogJ1x1NTNEMVx1NjUzRScsXG4gICAgc3RhdHVzOiAnXHU1OTMxXHU4RDI1JyxcbiAgICBvcGVyYXRpb25UaW1lOiAnMjAyNC0wMS0xOCAxNDoyMDowMCcsXG4gICAgb3BlcmF0b3I6ICdTWVNURU0nLFxuICAgIHRvdGFsSXNzdWVkOiA1MDAsXG4gICAgc3VjY2Vzc0NvdW50OiAwLFxuICAgIGZhaWxlZENvdW50OiA1MDAsXG4gICAgd2FybmluZzogdHJ1ZSxcbiAgICB3YXJuaW5nTWVzc2FnZTogJ1x1NTE2OFx1OTBFOFx1NTNEMVx1NjUzRVx1NTkzMVx1OEQyNScsXG4gICAgZmFpbGVkUmVhc29uOiAnXHU1RTkzXHU1QjU4XHU0RTBEXHU4REIzJ1xuICB9LFxuICB7XG4gICAgdXNlcklkOiAnMTAwMDUnLFxuICAgIGNvdXBvbklkOiAnQ1AwMDUnLFxuICAgIHBhY2thZ2VJZDogJ1BLRzAwNScsXG4gICAgdGFza0lkOiAnVEFTSzAwNScsXG4gICAgb3BlcmF0aW9uVHlwZTogJ1x1NTNEMVx1NjUzRScsXG4gICAgc3RhdHVzOiAnXHU1OTMxXHU4RDI1JyxcbiAgICBvcGVyYXRpb25UaW1lOiAnMjAyNC0wMS0xOSAxNjo0NTowMCcsXG4gICAgb3BlcmF0b3I6ICdTWVNURU0nLFxuICAgIHRvdGFsSXNzdWVkOiAxMDAwLFxuICAgIHN1Y2Nlc3NDb3VudDogODAwLFxuICAgIGZhaWxlZENvdW50OiAyMDAsXG4gICAgd2FybmluZzogdHJ1ZSxcbiAgICB3YXJuaW5nTWVzc2FnZTogJ1x1NTkzMVx1OEQyNVx1NzM4NzIwJScsXG4gICAgZmFpbGVkUmVhc29uOiAnXHU2M0E1XHU1M0UzXHU2MkE1XHU5NTE5JyxcbiAgICBpc3N1ZVN0YXJ0VGltZTogJzIwMjQtMDEtMTkgMTU6MDA6MDAnLFxuICAgIGlzc3VlRW5kVGltZTogJzIwMjQtMDEtMTkgMTc6MzA6MDAnLFxuICAgIGxvY2tSZWNvcmRzOiBbXG4gICAgICB7XG4gICAgICAgIGxvY2tUaW1lOiAnMjAyNC0wMS0xOSAxNjowMDowMCcsXG4gICAgICAgIGxvY2tPcGVyYXRvcjogJ1NZU1RFTScsXG4gICAgICAgIGxvY2tSZWFzb246ICdcdTdDRkJcdTdFREZcdTgxRUFcdTUyQThcdTk1MDFcdTVCOUEnXG4gICAgICB9XG4gICAgXSxcbiAgICB2ZXJpZmljYXRpb25SZWNvcmRzOiBbXG4gICAgICB7XG4gICAgICAgIHZlcmlmaWNhdGlvblRpbWU6ICcyMDI0LTAxLTIwIDA5OjE1OjAwJyxcbiAgICAgICAgdmVyaWZpY2F0aW9uT3BlcmF0b3I6ICdVU0VSXzEwMDA1JyxcbiAgICAgICAgdmVyaWZpY2F0aW9uUmVzdWx0OiAnXHU2ODM4XHU5NTAwXHU2MjEwXHU1MjlGJ1xuICAgICAgfVxuICAgIF1cbiAgfSxcbiAgLy8gXHU2NUIwXHU1ODlFXHU5NTAxXHU1QjlBXHU4QkIwXHU1RjU1XG4gIHtcbiAgICB1c2VySWQ6ICcxMDAwNicsXG4gICAgY291cG9uSWQ6ICdDUDAwNicsXG4gICAgcGFja2FnZUlkOiAnUEtHMDA2JyxcbiAgICB0YXNrSWQ6ICdUQVNLMDA2JyxcbiAgICBvcGVyYXRpb25UeXBlOiAnXHU5NTAxXHU1QjlBJyxcbiAgICBzdGF0dXM6ICdcdTYyMTBcdTUyOUYnLFxuICAgIG9wZXJhdGlvblRpbWU6ICcyMDI0LTAxLTIwIDEwOjAwOjAwJyxcbiAgICBvcGVyYXRvcjogJ1NZU1RFTScsXG4gICAgbG9ja1JlYXNvbjogJ1x1NzUyOFx1NjIzN1x1NzUzM1x1OEJGN1x1OTUwMVx1NUI5QScsXG4gICAgbG9ja1RpbWU6ICcyMDI0LTAxLTIwIDEwOjAwOjAwJyxcbiAgICB1bmxvY2tUaW1lOiAnMjAyNC0wMS0yMSAxMDowMDowMCcsXG4gICAgbG9ja09wZXJhdG9yOiAnU1lTVEVNJ1xuICB9LFxuICAvLyBcdTY1QjBcdTU4OUVcdTY4MzhcdTk1MDBcdThCQjBcdTVGNTVcbiAge1xuICAgIHVzZXJJZDogJzEwMDA3JyxcbiAgICBjb3Vwb25JZDogJ0NQMDA3JyxcbiAgICBwYWNrYWdlSWQ6ICdQS0cwMDcnLFxuICAgIHRhc2tJZDogJ1RBU0swMDcnLFxuICAgIG9wZXJhdGlvblR5cGU6ICdcdTY4MzhcdTk1MDAnLFxuICAgIHN0YXR1czogJ1x1NjIxMFx1NTI5RicsXG4gICAgb3BlcmF0aW9uVGltZTogJzIwMjQtMDEtMjEgMTE6MDA6MDAnLFxuICAgIG9wZXJhdG9yOiAnVVNFUl8xMDAwNycsXG4gICAgdmVyaWZpY2F0aW9uVGltZTogJzIwMjQtMDEtMjEgMTE6MDA6MDAnLFxuICAgIHZlcmlmaWNhdGlvblJlc3VsdDogJ1x1NjgzOFx1OTUwMFx1NjIxMFx1NTI5RicsXG4gICAgdmVyaWZpY2F0aW9uQW1vdW50OiAxMDAwMCxcbiAgICB2ZXJpZmljYXRpb25PcmRlcklkOiAnT1JERVJfMTAwMDcnXG4gIH1cbl1cblxuLy8gXHU5OTk2XHU5ODc1XHU3RURGXHU4QkExXHU2NTcwXHU2MzZFXG5leHBvcnQgY29uc3QgZGFzaGJvYXJkU3RhdHMgPSB7XG4gIHRvdGFsSXNzdWVkOiAzMDAwLFxuICB0b3RhbFN1Y2Nlc3M6IDI4MDAsXG4gIHRvdGFsRmFpbGVkOiAyMDAsXG4gIHdhcm5pbmdDb3VudDogMSxcbiAgbGFzdFVwZGF0ZWQ6ICcyMDI0LTAxLTE3IDA5OjE1OjAwJyxcbiAgYWN0aXZlV2FybmluZ3M6IFtcbiAgICB7XG4gICAgICBpZDogJ1dBUk4wMDEnLFxuICAgICAgdHlwZTogJ1x1NTNEMVx1NjUzRVx1NTkzMVx1OEQyNVx1NzM4N1x1OEZDN1x1OUFEOCcsXG4gICAgICBtZXNzYWdlOiAnXHU1MjM4XHU1MzA1UEtHMDAyXHU1M0QxXHU2NTNFXHU1OTMxXHU4RDI1XHU3Mzg3MTguNzUlJyxcbiAgICAgIHRpbWU6ICcyMDI0LTAxLTE2IDExOjMwOjAwJyxcbiAgICAgIHNldmVyaXR5OiAnbWVkaXVtJ1xuICAgIH1cbiAgXVxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFDTyxJQUFNLHVCQUF1QjtBQUFBLEVBQ2xDO0FBQUEsSUFDRSxJQUFJO0FBQUEsSUFDSixZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEs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
