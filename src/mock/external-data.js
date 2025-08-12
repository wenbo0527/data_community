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
 * 生成模拟任务数据
 * @param {number} count - 任务数量
 * @returns {Array} 任务数组
 */
export const generateTasks = (count = 10) => {
    const tasks = [];
    const statusOptions = ['已创建', '进行中', '已完成', '已失败'];
    const templateTypes = ['基础分析', '深度分析', '定制分析'];
    const productNames = ['产品A', '产品B', '产品C', '产品D'];

    for (let i = 1; i <= count; i++) {
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const progress = status === '已完成' ? 100 : status === '已失败' ? Math.floor(Math.random() * 70) : Math.floor(Math.random() * 100);
        const createDate = new Date();
        createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 30));
        const estimatedDate = new Date(createDate);
        estimatedDate.setDate(createDate.getDate() + 7);

        tasks.push({
            id: i,
            taskName: `外部数据评估任务 ${i}`,
            createTime: createDate.toISOString().split('T')[0],
            estimatedTime: estimatedDate.toISOString().split('T')[0],
            status,
            progress,
            config: {
                productName: productNames[Math.floor(Math.random() * productNames.length)],
                startDate: createDate.toISOString().split('T')[0],
                endDate: estimatedDate.toISOString().split('T')[0],
                reportName: `外部数据评估报告 ${i}`,
                templateType: templateTypes[Math.floor(Math.random() * templateTypes.length)],
                description: `这是外部数据评估任务 ${i} 的详细描述，包含对外部数据源的分析和评估。`,
                fieldMapping: [
                    { sourceField: 'id', targetField: 'userId' },
                    { sourceField: 'name', targetField: 'userName' },
                    { sourceField: 'score', targetField: 'creditScore' }
                ],
                fileInfo: {
                    fileName: `data_source_${i}.csv`,
                    fileSize: Math.floor(Math.random() * 10000) + 1000,
                    uploadTime: createDate.toISOString()
                }
            }
        });
    }

    return tasks;
};

/**
 * 获取任务详情
 * @param {number} taskId - 任务ID
 * @returns {Object|null} 任务详情或null
 */
export const getTaskDetail = (taskId) => {
    const tasks = generateTasks(20);
    return tasks.find(task => task.id === taskId) || null;
};

/**
 * 模拟任务列表数据API
 * @param {string} path - 路径: /api/external/tasks
 * @param {string} method - 方法: GET
 * @returns {Object} 返回: 任务列表数据
 */
Mock.mock(/\/api\/external\/tasks/, 'get', (options) => {
    const url = new URL(options.url, 'http://dummy.com');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status') || undefined;

    const allTasks = generateTasks(50);
    const filteredTasks = status ? allTasks.filter(task => task.status === status) : allTasks;
    const total = filteredTasks.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    return {
        code: 200,
        data: {
            list: paginatedTasks,
            total
        }
    };
});

/**
 * 模拟任务详情数据API
 * @param {string} path - 路径: /api/external/task/:id
 * @param {string} method - 方法: GET
 * @returns {Object} 返回: 任务详情数据
 */
Mock.mock(/\/api\/external\/task\/\d+/, 'get', (options) => {
    const taskId = parseInt(options.url.split('/').pop() || '0');
    const task = getTaskDetail(taskId);

    if (task) {
        return {
            code: 200,
            data: task
        };
    } else {
        return {
            code: 404,
            message: '任务不存在'
        };
    }
});

/**
 * 模拟预算超支预警数据API
 * @param {string} path - 路径: /api/external-data/warning
 * @param {string} method - 方法: GET
 * @returns {Object} 返回: 预算超支预警数据
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
