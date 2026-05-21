import Mock from 'mockjs';
// 生成预算数据
const generateBudgetData = (count) => {
    const businessTypes = ['助贷业务', '融担类业务', '直贷类业务'];
    const platforms = ['产品A', '产品B', '产品C'];
    const data = [];
    for (let i = 0; i < count; i++) {
        const targetLoan = Mock.Random.float(800000, 1200000, 2, 2);
        data.push({
            id: Mock.Random.guid(),
            businessType: Mock.Random.pick(businessTypes),
            platform: Mock.Random.pick(platforms),
            targetLoan,
            estimatedLoan: Mock.Random.float(600000, targetLoan, 2, 2),
            estimatedCost: Mock.Random.float(40000, 60000, 2, 2),
            estimatedAnnualCost: Mock.Random.float(0.03, 0.06, 4, 4),
            estimatedRiskFreeReturn: Mock.Random.float(0.06, 0.09, 4, 4)
        });
    }
    return data;
};
// 模拟预算数据列表
let budgetDataList = generateBudgetData(20);
// 获取预算列表
Mock.mock(/\/api\/budget\/list/, 'get', (options) => {
    const url = new URL(options.url, 'http://dummy.com');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
        code: 200,
        data: {
            data: budgetDataList.slice(start, end),
            total: budgetDataList.length
        }
    };
});
// 上传预算数据
Mock.mock(/\/api\/budget\/upload/, 'post', () => {
    const newData = generateBudgetData(Mock.Random.integer(3, 5));
    budgetDataList = [...newData, ...budgetDataList];
    return {
        code: 200,
        message: '上传成功'
    };
});
// 删除预算数据
Mock.mock(/\/api\/budget\/.*/, 'delete', (options) => {
    const id = options.url.split('/').pop();
    budgetDataList = budgetDataList.filter(item => item.id !== id);
    return {
        code: 200,
        message: '删除成功'
    };
});
