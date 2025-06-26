const mockUsers = {
    // 添加一个有效的用户ID '887123'，与图片中显示的一致
    '887123': {
        userId: '887123',
        name: '张*',
        products: [
            {
                productKey: 'DP-2024-002',
                productType: '活期存款',
                productName: '活期存款',
                productCategory: '自营产品',
                amount: 20000,
                startDate: '2023-01-10'
            },
            {
                productKey: 'LN-2024-002',
                productType: '消费贷款',
                productName: '消费贷款',
                productCategory: '助贷产品',
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
                productCategory: '自营产品',
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
                productCategory: '助贷产品',
                balance: 30000.00,
                currency: 'CNY',
                status: '正常',
                rate: 4.35,
                remainingPeriod: 18,
                totalPeriod: 24,
                nextPaymentDate: '2024-10-15'
            }
        ],
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
                nextPaymentDate: '2024-10-15'
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
                productCategory: '自营产品',
                amount: 150000,
                startDate: '2023-03-15'
            },
            {
                productKey: 'LN-2024-001',
                productType: '住房贷款',
                productName: '公积金贷款',
                productCategory: '自营产品',
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
                productCategory: '自营产品',
                balance: 52800.56,
                currency: 'CNY',
                status: '正常',
                rate: 0.35,
                lastTransaction: '2024-10-15'
            },
            {
                productKey: 'fixed',
                name: '定期存款(1年)',
                productCategory: '自营产品',
                balance: 100000.00,
                currency: 'CNY',
                status: '正常',
                rate: 2.10,
                maturityDate: '2025-06-30'
            }
        ],
        loanProducts: [
            {
                productKey: 'housing',
                name: '个人住房贷款',
                productCategory: '自营产品',
                balance: 350000.00,
                currency: 'CNY',
                status: '正常',
                rate: 4.25,
                remainingPeriod: 180,
                totalPeriod: 240,
                nextPaymentDate: '2024-11-05'
            },
            {
                productKey: 'consumer',
                name: '个人消费贷款',
                productCategory: '助贷产品',
                balance: 25000.00,
                currency: 'CNY',
                status: '正常',
                rate: 6.50,
                remainingPeriod: 12,
                totalPeriod: 24
            }
        ],
        maxOverdueDays: 90,
        currentOverdueDays: 0,
        totalLoanAmount: 375000,
        totalCreditAmount: 500000,
        overdueAmount: 0,
        repaymentRate: 100,
        creditsList: [
            {
                creditNo: '20701432',
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
                nextPaymentDate: '2024-11-05'
            },
            {
                loanNo: '8673241',
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
                nextPaymentDate: '2024-11-20'
            },
            {
                loanNo: '8790008',
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
                nextPaymentDate: '2024-11-20'
            }
        ],
        quotaAdjustHistory: [
            {
                customerNo: '123',
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
};
export const fetchUserInfo = (userId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 根据userId查询用户数据
            const userData = mockUsers[userId];
            if (userData) {
                resolve(userData);
            }
            else {
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
