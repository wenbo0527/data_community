import Mock from 'mockjs';
/**
 * 生成预算燃尽图数据
 * 模拟预算消耗情况，每月预算按80%递减，实际消耗在70%-100%之间随机波动
 * 同时计算累积消耗数据，支持燃尽图和累积消耗图两种显示模式
 * @returns {BurndownData[]} 燃尽图数据数组
 */
export const generateBurndownData = (filter) => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const data = [];
    const initialBudget = 1000000; // 初始预算总额
    let budgetRemaining = initialBudget;
    let actualRemaining = initialBudget;
    months.forEach((month, index) => {
        // 计算累积消耗
        const cumulativeBudget = initialBudget - budgetRemaining;
        const cumulativeActual = initialBudget - actualRemaining;
        data.push({
            month,
            budget: budgetRemaining,
            actual: actualRemaining,
            granularity: 'month',
            initialBudget,
            cumulativeBudget,
            cumulativeActual
        });
        // 更新下个月的剩余预算
        budgetRemaining = Math.floor(budgetRemaining * 0.8);
        // 随机生成实际剩余值，使其有时高于预算(非预警)，有时低于预算(预警)
        actualRemaining = Math.floor(actualRemaining * (0.7 + Math.random() * 0.3));
    });
    return data;
};
/**
 * 生成预算超支预警数据
 * 模拟不同业务类型和产品平台的预算执行情况
 * 包含目标、预计和实际的贷款金额、成本、收益率等数据
 * @returns {BudgetData[]} 预算数据数组
 */
export const generateWarningData = (filter) => {
    const businessTypes = filter?.businessType ? [filter.businessType] : ['助贷业务', '融担类业务', '直贷类业务'];
    const platforms = filter?.platform ? [filter.platform] : ['字节', '蚂蚁', '京东', '美团'];
    const data = [];
    businessTypes.forEach(businessType => {
        platforms.forEach(platform => {
            const targetLoan = 620;
            const estimatedLoan = Mock.Random.float(0.0006, targetLoan, 2, 2);
            const actualLoan = Mock.Random.float(estimatedLoan * 0.8, estimatedLoan * 1.2, 2, 2);
            data.push({
                businessType,
                platform,
                targetLoan,
                estimatedLoan,
                actualLoan,
                loanDeviation: (actualLoan - estimatedLoan) / estimatedLoan,
                estimatedCost: Mock.Random.float(0.0004, 0.0006, 2, 2) * 10000,
                actualCost: Mock.Random.float(0.0004 * 0.8, 0.0006 * 1.2, 2, 2) * 10000,
                estimatedAnnualCost: Mock.Random.float(0.03, 0.06, 4, 4),
                actualAnnualCost: Mock.Random.float(0.03 * 0.8, 0.06 * 1.2, 4, 4),
                estimatedRiskFreeReturn: Mock.Random.float(0.06, 0.09, 4, 4),
                actualRiskFreeReturn: Mock.Random.float(0.06 * 0.8, 0.09 * 1.2, 4, 4),
                unitPrice: undefined,
                totalCost: undefined
            });
        });
    });
    return data;
};
/**
 * 生成外部产品数据
 * 模拟产品定价、消耗、性能指标等数据
 * @param {string} product - 产品名称
 * @param {number} months - 月份数量
 * @returns {Array} 产品数据数组
 */
export const generateExternalProductData = (product, months = 6) => {
    return Array.from({ length: months }, (_, i) => {
        const month = `2023-${String(i + 1).padStart(2, '0')}`;
        const basePrice = product === '产品A' ? 0.5 : 0.3;
        const pricePerCall = (basePrice + Math.random() * 0.3).toFixed(2);
        const baseBudget = product === '产品A' ? 10000 + i * 2000 : 8000 + i * 1500;
        const actualCost = baseBudget * (0.8 + Math.random() * 0.4);
        const ksValue = (0.5 + Math.random() * 0.5).toFixed(2);
        const ivValue = (0.1 + Math.random() * 0.3).toFixed(2);
        const psiValue = (0.05 + Math.random() * 0.2).toFixed(2);
        return {
            month,
            product,
            budget: baseBudget,
            actual: actualCost,
            pricePerCall,
            actualCost,
            stabilityScore: Math.round(80 + Math.random() * 20),
            valueScore: (3 + Math.random() * 2).toFixed(1),
            budgetAchievement: Math.round(actualCost / baseBudget * 100),
            roi: (1 + Math.random() * 2).toFixed(1),
            ks: ksValue,
            iv: ivValue,
            psi: psiValue,
            valuePerPrice: (Number(ksValue) / Number(pricePerCall)).toFixed(3)
        };
    });
};
/**
 * 模拟燃尽图数据API
 * @param {string} path - 路径: /api/external-data/burndown
 * @param {string} method - 方法: GET
 * @returns {object} 返回: 燃尽图数据
 */
Mock.mock(/\/api\/external-data\/burndown/, 'get', (options) => {
    const url = new URL(options.url, 'http://dummy.com');
    const businessType = url.searchParams.get('businessType') || undefined;
    const platform = url.searchParams.get('platform') || undefined;
    return {
        code: 200,
        data: generateBurndownData({ businessType, platform })
    };
});
/**
 * 模拟预算超支预警数据API
 * @param {string} path - 路径: /api/external-data/warning
 * @param {string} method - 方法: GET
 * @returns {object} 返回: 预算超支预警数据
 */
Mock.mock(/\/api\/external-data\/warning/, 'get', (options) => {
    const url = new URL(options.url, 'http://dummy.com');
    const businessType = url.searchParams.get('businessType') || undefined;
    const platform = url.searchParams.get('platform') || undefined;
    return {
        code: 200,
        data: generateWarningData({ businessType, platform })
    };
});
