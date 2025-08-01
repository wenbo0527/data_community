// 审批流数据
export const approvalFlowMockData = [
    {
        id: 1,
        templateId: 1,
        type: 'template',
        status: '审批通过',
        approvers: [
            {
                id: 1,
                name: '张三',
                role: '产品经理',
                status: '已通过',
                approvalTime: '2024-01-01 10:30:00',
                comment: '活动方案合理，同意上线'
            },
            {
                id: 2,
                name: '李四',
                role: '风控经理',
                status: '已通过',
                approvalTime: '2024-01-01 14:20:00',
                comment: '风险可控，同意上线'
            }
        ],
        createTime: '2024-01-01 09:00:00',
        updateTime: '2024-01-01 14:20:00'
    },
    {
        id: 2,
        templateId: 2,
        type: 'template',
        status: '审批中',
        approvers: [
            {
                id: 3,
                name: '王五',
                role: '产品经理',
                status: '已通过',
                approvalTime: '2024-01-02 11:15:00',
                comment: '活动方案可行'
            },
            {
                id: 4,
                name: '赵六',
                role: '风控经理',
                status: '待审批',
                approvalTime: null,
                comment: null
            }
        ],
        createTime: '2024-01-02 10:00:00',
        updateTime: '2024-01-02 11:15:00'
    },
    {
        id: 3,
        templateId: 3,
        type: 'template',
        status: '审批拒绝',
        approvers: [
            {
                id: 5,
                name: '张三',
                role: '产品经理',
                status: '已拒绝',
                approvalTime: '2024-01-03 16:45:00',
                comment: '活动方案存在风险，建议调整'
            }
        ],
        createTime: '2024-01-03 15:30:00',
        updateTime: '2024-01-03 16:45:00'
    }
];
// 券模版数据
export const templateMockData = [
    {
        id: 5,
        name: '长期免息券模版',
        type: 'interest_free',
        status: '生效中',
        createTime: '2024-01-05',
        creator: '王五',
        approvalStatus: '审批通过',
        validityPeriodType: 'unlimited',
        firstUseOnly: false,
        stackable: false,
        products: ['personal_loan', 'SELF_APP'],
        repaymentMethods: ['equal_principal', 'equal_installment'],
        loanPeriodType: 'fixed',
        loanPeriod: 60,
        loanAmountMin: 20000,
        loanAmountMax: 150000,
        useChannels: ['app', 'miniprogram', 'h5'],
        creditChannels: ['app', 'miniprogram'],
        description: '长期免息活动券',
        interestFreeDays: 60,
        maxInterestFreeAmount: 150000
    },
    {
        id: 1,
        name: '首借30天免息券模版',
        type: 'interest_free',
        status: '草稿',
        createTime: '2024-01-01',
        creator: '张三',
        approvalStatus: '审批通过',
        approvalId: 1,
        validityPeriodType: 'limited',
        validityPeriod: ['2024-01-01', '2024-12-31'],
        firstUseOnly: true,
        stackable: false,
        products: ['SELF_APP'],
        repaymentMethods: ['equal_principal', 'equal_installment'],
        loanPeriodType: 'fixed',
        loanPeriod: 30,
        loanAmountMin: 10000,
        loanAmountMax: 100000,
        useChannels: ['app', 'miniprogram', 'h5'],
        creditChannels: ['app', 'miniprogram'],
        description: '新用户首借30天免息',
        interestFreeDays: 30,
        maxInterestFreeAmount: 100000
    },
    {
        id: 2,
        name: '首借90天免息券模版',
        type: 'interest_free',
        status: '草稿',
        createTime: '2024-01-02',
        creator: '张三',
        approvalStatus: '审批中',
        approvalId: 2,
        validityPeriodType: 'limited',
        validityPeriod: ['2024-01-01', '2024-12-31'],
        firstUseOnly: true,
        stackable: false,
        products: ['personal_loan'],
        repaymentMethods: ['equal_principal', 'equal_installment'],
        loanPeriodType: 'fixed',
        loanPeriod: 90,
        loanAmountMin: 50000,
        loanAmountMax: 200000,
        useChannels: ['app', 'miniprogram'],
        creditChannels: ['app'],
        description: '新用户首借90天免息'
    },
    {
        id: 3,
        name: '复借8折优惠券模版',
        type: 'discount',
        status: '草稿',
        createTime: '2024-01-03',
        creator: '李四',
        approvalStatus: '审批拒绝',
        approvalId: 3,
        discountType: 'uniform',
        uniformDiscount: 0.8,
        validityPeriodType: 'limited',
        validityPeriod: ['2024-01-01', '2024-12-31'],
        firstUseOnly: false,
        stackable: true,
        products: ['SELF_APP'],
        repaymentMethods: ['equal_principal'],
        loanPeriodType: 'range',
        loanPeriodMin: 3,
        loanPeriodMax: 12,
        loanAmountMin: 5000,
        loanAmountMax: 50000,
        useChannels: ['app'],
        creditChannels: ['app'],
        description: '老用户复借8折优惠'
    },
    {
        id: 4,
        name: '复借7折优惠券模版',
        type: 'discount',
        status: '草稿',
        createTime: '2024-01-04',
        creator: '李四',
        discountType: 'percentage',
        discountValue: 70,
        validityPeriodType: 'limited',
        validityPeriod: ['2024-01-01', '2024-12-31'],
        firstUseOnly: false,
        stackable: false,
        products: ['personal_loan'],
        repaymentMethods: ['equal_installment'],
        loanPeriodType: 'range',
        loanPeriodMin: 6,
        loanPeriodMax: 24,
        loanAmountMin: 100000,
        loanAmountMax: 500000,
        useChannels: ['app'],
        creditChannels: ['app'],
        description: '老用户复借7折优惠'
    }
];
// 券包数据
export const packageMockData = [
    {
        id: 1,
        name: '新春礼包',
        type: '组合券包',
        status: '生效中',
        createTime: '2024-01-10',
        startTime: '2024-01-15',
        endTime: '2024-02-15',
        totalCount: 1000,
        stock: 800,
        unclaimed: 500,
        claimed: 300,
        locked: 50,
        verified: 150,
        expired: 0,
        invalid: 0,
        rules: '包含30天免息券和8折优惠券',
        operator: '张三',
        auditor: '李四',
        validityStartTime: '2024-01-15',
        validityEndTime: '2024-02-15',
        dailyLimit: 100,
        weeklyLimit: 500,
        monthlyLimit: 2000,
        userLimitDesc: '单一用户单次只能拥有单一张同ID券包'
    },
    {
        id: 2,
        name: '周年庆礼包',
        type: '组合券包',
        status: '待审核',
        createTime: '2024-01-20',
        startTime: '2024-02-01',
        endTime: '2024-02-29',
        totalCount: 500,
        stock: 500,
        unclaimed: 500,
        claimed: 0,
        locked: 0,
        verified: 0,
        expired: 0,
        invalid: 0,
        rules: '包含90天免息券和7折优惠券',
        operator: '李四',
        auditor: '张三',
        validityStartTime: '2024-02-01',
        validityEndTime: '2024-02-29'
    }
];
// 券数据
export const couponMockData = [
    {
        id: 1,
        templateId: 1,
        name: '首借30天免息券',
        type: '免息券',
        status: '草稿',
        createTime: '2024-01-10',
        startTime: '2024-01-15',
        endTime: '2024-02-15',
        totalCount: 1000,
        stock: 1000,
        unclaimed: 1000,
        claimed: 0,
        locked: 0,
        verified: 0,
        expired: 0,
        invalid: 0,
        rules: '1. 仅限首次借款用户使用\n2. 借款期限固定为30天\n3. 单笔借款金额10,000-100,000元\n4. 免息金额上限100,000元\n5. 不可与其他优惠券叠加使用',
        operator: '张三',
        auditor: '李四',
        validityStartTime: '2024-01-15',
        validityEndTime: '2024-02-15',
        dailyLimit: 100,
        weeklyLimit: 500,
        monthlyLimit: 2000,
        userLimitDesc: '单一用户单次只能拥有单一张同ID券'
    },
    {
        id: 2,
        templateId: 2,
        name: '首借90天免息券',
        type: '免息券',
        status: '待审核',
        createTime: '2024-01-20',
        startTime: '2024-02-01',
        endTime: '2024-02-29',
        totalCount: 500,
        stock: 500,
        unclaimed: 500,
        claimed: 0,
        locked: 0,
        verified: 0,
        expired: 0,
        invalid: 0,
        rules: '1. 仅限首次借款用户使用\n2. 借款期限固定为90天\n3. 单笔借款金额50,000-200,000元\n4. 可在APP和小程序渠道使用\n5. 不可与其他优惠券叠加使用',
        operator: '李四',
        auditor: '张三',
        validityStartTime: '2024-02-01',
        validityEndTime: '2024-02-29'
    },
    {
        id: 3,
        templateId: 3,
        name: '复借8折优惠券',
        type: '折扣券',
        status: '生效中',
        createTime: '2024-01-25',
        startTime: '2024-02-01',
        endTime: '2024-03-31',
        totalCount: 2000,
        stock: 2000,
        unclaimed: 1500,
        claimed: 300,
        locked: 50,
        verified: 150,
        expired: 0,
        invalid: 0,
        rules: '1. 限复借用户使用\n2. 借款期限3-12个月\n3. 单笔借款金额5,000-50,000元\n4. 统一8折利率优惠\n5. 可与其他优惠券叠加使用\n6. 仅限APP渠道使用',
        operator: '张三',
        auditor: '王五',
        validityStartTime: '2024-02-01',
        validityEndTime: '2024-03-31'
    },
    {
        id: 4,
        templateId: 4,
        name: '复借7折优惠券',
        type: '折扣券',
        status: '票劵停发',
        createTime: '2024-01-30',
        startTime: '2024-02-15',
        endTime: '2024-03-15',
        totalCount: 1000,
        stock: 1000,
        unclaimed: 600,
        claimed: 200,
        locked: 30,
        verified: 120,
        expired: 50,
        invalid: 0,
        rules: '1. 限复借用户使用\n2. 借款期限6-24个月\n3. 单笔借款金额100,000-500,000元\n4. 享受7折利率优惠\n5. 不可与其他优惠券叠加使用\n6. 仅限APP渠道使用',
        operator: '李四',
        auditor: '张三',
        validityStartTime: '2024-02-15',
        validityEndTime: '2024-03-15'
    },
    {
        id: 5,
        templateId: 1,
        name: '新春30天免息券',
        type: '免息券',
        status: '票劵失效',
        createTime: '2024-01-05',
        startTime: '2024-01-10',
        endTime: '2024-01-25',
        totalCount: 800,
        stock: 800,
        unclaimed: 0,
        claimed: 0,
        locked: 0,
        verified: 600,
        expired: 200,
        invalid: 0,
        rules: '1. 新春特惠活动专属优惠\n2. 借款期限固定为30天\n3. 单笔借款金额10,000-100,000元\n4. 免息金额上限100,000元\n5. 不可与其他优惠券叠加使用',
        operator: '王五',
        auditor: '张三',
        validityStartTime: '2024-01-10',
        validityEndTime: '2024-01-25'
    }
];
// 券流水记录数据
export const recordMockData = [
    // 撤回记录
    {
        userId: '10008',
        couponId: 'CP008',
        packageId: 'PKG008',
        taskId: 'TASK008',
        operationType: '撤回',
        status: '成功',
        operationTime: '2024-01-22 14:30:00',
        operator: 'ADMIN',
        withdrawReason: '活动调整',
        withdrawTime: '2024-01-22 14:30:00',
        withdrawOperator: 'ADMIN'
    },
    // 发放记录
    {
        userId: '10001',
        couponId: 'CP001',
        packageId: 'PKG001',
        taskId: 'TASK001',
        operationType: '发放',
        status: '成功',
        operationTime: '2024-01-15 10:00:00',
        operator: 'SYSTEM',
        totalIssued: 1000,
        successCount: 950,
        failedCount: 50,
        warning: false,
        failedReason: '',
        issueStartTime: '2024-01-15 09:00:00',
        issueEndTime: '2024-01-15 10:30:00',
        lockRecords: [
            {
                lockTime: '2024-01-15 09:30:00',
                lockOperator: 'SYSTEM',
                lockReason: '系统自动锁定'
            }
        ],
        verificationRecords: [
            {
                verificationTime: '2024-01-16 11:00:00',
                verificationOperator: 'USER_10001',
                verificationResult: '核销成功'
            }
        ]
    },
    {
        userId: '10002',
        couponId: 'CP002',
        packageId: 'PKG002',
        taskId: 'TASK002',
        operationType: '发放',
        status: '失败',
        operationTime: '2024-01-16 11:30:00',
        operator: 'SYSTEM',
        totalIssued: 800,
        successCount: 650,
        failedCount: 150,
        warning: true,
        warningMessage: '失败率超过15%',
        failedReason: '接口报错'
    },
    {
        userId: '10003',
        couponId: 'CP003',
        packageId: 'PKG003',
        taskId: 'TASK003',
        operationType: '发放',
        status: '成功',
        operationTime: '2024-01-17 09:15:00',
        operator: 'SYSTEM',
        totalIssued: 1200,
        successCount: 1200,
        failedCount: 0,
        warning: false,
        failedReason: ''
    },
    {
        userId: '10004',
        couponId: 'CP004',
        packageId: 'PKG004',
        taskId: 'TASK004',
        operationType: '发放',
        status: '失败',
        operationTime: '2024-01-18 14:20:00',
        operator: 'SYSTEM',
        totalIssued: 500,
        successCount: 0,
        failedCount: 500,
        warning: true,
        warningMessage: '全部发放失败',
        failedReason: '库存不足'
    },
    {
        userId: '10005',
        couponId: 'CP005',
        packageId: 'PKG005',
        taskId: 'TASK005',
        operationType: '发放',
        status: '失败',
        operationTime: '2024-01-19 16:45:00',
        operator: 'SYSTEM',
        totalIssued: 1000,
        successCount: 800,
        failedCount: 200,
        warning: true,
        warningMessage: '失败率20%',
        failedReason: '接口报错',
        issueStartTime: '2024-01-19 15:00:00',
        issueEndTime: '2024-01-19 17:30:00',
        lockRecords: [
            {
                lockTime: '2024-01-19 16:00:00',
                lockOperator: 'SYSTEM',
                lockReason: '系统自动锁定'
            }
        ],
        verificationRecords: [
            {
                verificationTime: '2024-01-20 09:15:00',
                verificationOperator: 'USER_10005',
                verificationResult: '核销成功'
            }
        ]
    },
    // 新增锁定记录
    {
        userId: '10006',
        couponId: 'CP006',
        packageId: 'PKG006',
        taskId: 'TASK006',
        operationType: '锁定',
        status: '成功',
        operationTime: '2024-01-20 10:00:00',
        operator: 'SYSTEM',
        lockReason: '用户申请锁定',
        lockTime: '2024-01-20 10:00:00',
        unlockTime: '2024-01-21 10:00:00',
        lockOperator: 'SYSTEM'
    },
    // 新增核销记录
    {
        userId: '10007',
        couponId: 'CP007',
        packageId: 'PKG007',
        taskId: 'TASK007',
        operationType: '核销',
        status: '成功',
        operationTime: '2024-01-21 11:00:00',
        operator: 'USER_10007',
        verificationTime: '2024-01-21 11:00:00',
        verificationResult: '核销成功',
        verificationAmount: 10000,
        verificationOrderId: 'ORDER_10007'
    }
];
// 首页统计数据
export const dashboardStats = {
    totalIssued: 3000,
    totalSuccess: 2800,
    totalFailed: 200,
    warningCount: 1,
    lastUpdated: '2024-01-17 09:15:00',
    activeWarnings: [
        {
            id: 'WARN001',
            type: '发放失败率过高',
            message: '券包PKG002发放失败率18.75%',
            time: '2024-01-16 11:30:00',
            severity: 'medium'
        }
    ]
};
