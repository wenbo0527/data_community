// 模拟数据
export const mockTables = [
    {
        name: 'dim_user',
        type: 'dim',
        category: 'DIM',
        domain: '用户域',
        updateFrequency: '每日',
        owner: '张三',
        description: '用户维度表，存储用户基础信息。关联逻辑：作为主表关联fact_loan_apply表(user_id)和dws_risk_score表(user_id)，提供用户基础画像数据。',
        computeClusterTable: 'dim.dim_user',
        analysisClusterTable: 'dim.dim_user',
        registerTime: '2024-01-15T10:30:00Z',
        fields: [
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'username', type: 'string', description: '用户名' },
            { name: 'mobile', type: 'string', description: '手机号' },
            { name: 'id_card', type: 'string', description: '身份证号' },
            { name: 'create_time', type: 'timestamp', description: '创建时间' },
            { name: 'age', type: 'int', description: '年龄' },
            { name: 'gender', type: 'string', description: '性别' },
            { name: 'education', type: 'string', description: '学历' },
            { name: 'occupation', type: 'string', description: '职业' },
            { name: 'address', type: 'string', description: '地址' },
            { name: 'income_level', type: 'string', description: '收入水平' }
        ]
    },
    {
        name: 'fact_loan_apply',
        type: 'fact',
        category: 'DWD',
        domain: '贷前分析',
        updateFrequency: '实时',
        owner: '李四',
        description: '贷款申请事实表。关联逻辑：通过user_id关联dim_user表获取申请人信息，通过user_id关联dws_risk_score表获取风控评分，用于贷前审批决策。',
        computeClusterTable: 'dwd.fact_loan_apply',
        analysisClusterTable: 'dwd.fact_loan_apply',
        registerTime: '2024-01-16T14:45:00Z',
        fields: [
            { name: 'apply_id', type: 'string', description: '申请ID' },
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'loan_amount', type: 'decimal', description: '申请金额' },
            { name: 'loan_term', type: 'int', description: '贷款期限' },
            { name: 'apply_time', type: 'timestamp', description: '申请时间' },
            { name: 'loan_purpose', type: 'string', description: '贷款用途' },
            { name: 'monthly_income', type: 'decimal', description: '月收入' },
            { name: 'employment_type', type: 'string', description: '就业类型' },
            { name: 'credit_score', type: 'int', description: '信用评分' },
            { name: 'product_type', type: 'string', description: '产品类型' },
            { name: 'approval_status', type: 'string', description: '审批状态' }
        ]
    },
    {
        name: 'dws_risk_score',
        type: 'dws',
        category: 'DWS',
        domain: '风控评估',
        updateFrequency: '每日',
        owner: '王五',
        description: '风险评分汇总表。关联逻辑：通过user_id关联dim_user表获取用户基本信息，为fact_loan_apply表提供风控评分支持，同时关联dwd_fraud_alert表获取欺诈信息。',
        computeClusterTable: 'dws.dws_risk_score',
        analysisClusterTable: 'dws.dws_risk_score',
        registerTime: '2024-01-17T09:15:00Z',
        fields: [
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'credit_score', type: 'int', description: '信用评分' },
            { name: 'behavior_score', type: 'int', description: '行为评分' },
            { name: 'anti_fraud_score', type: 'int', description: '反欺诈评分' },
            { name: 'update_time', type: 'timestamp', description: '更新时间' },
            { name: 'overdue_history', type: 'string', description: '逾期历史' },
            { name: 'credit_history_length', type: 'int', description: '信用历史长度(月)' }
        ]
    },
    {
        name: 'dwd_fraud_alert',
        type: 'dwd',
        category: 'DWD',
        domain: '反欺诈',
        updateFrequency: '实时', owner: '赵六',
        description: '欺诈预警明细表。关联逻辑：通过user_id关联dim_user表和dws_risk_score表，为风控决策提供欺诈风险信息，是风控评分的重要组成部分。',
        computeClusterTable: 'dwd.dwd_fraud_alert',
        analysisClusterTable: 'dwd.dwd_fraud_alert',
        registerTime: '2024-01-18T11:30:00Z',
        fields: [
            { name: 'alert_id', type: 'string', description: '预警ID' },
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'alert_type', type: 'string', description: '预警类型' },
            { name: 'alert_level', type: 'string', description: '预警等级' },
            { name: 'alert_time', type: 'timestamp', description: '预警时间' },
            { name: 'device_info', type: 'string', description: '设备信息' },
            { name: 'ip_address', type: 'string', description: 'IP地址' },
            { name: 'location', type: 'string', description: '地理位置' }
        ]
    },
    {
        name: 'fact_self_loan',
        type: 'fact',
        category: 'DWD',
        domain: '自营业务',
        updateFrequency: '实时',
        owner: '钱七',
        description: '自营贷款业务事实表，记录自营贷款业务的交易信息',
        computeClusterTable: 'dwd.fact_self_loan',
        analysisClusterTable: 'dwd.fact_self_loan',
        registerTime: '2024-01-19T13:20:00Z',
        fields: [
            { name: 'transaction_id', type: 'string', description: '交易ID' },
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'product_id', type: 'string', description: '产品ID' },
            { name: 'amount', type: 'decimal', description: '交易金额' },
            { name: 'transaction_time', type: 'timestamp', description: '交易时间' },
            { name: 'interest_rate', type: 'decimal', description: '利率' },
            { name: 'term', type: 'int', description: '期限' },
            { name: 'status', type: 'string', description: '交易状态' }
        ]
    },
    // 为注册流程补充的额外mock数据
    {
        name: 'dim_product',
        type: 'dim',
        category: 'DIM',
        domain: '产品域',
        updateFrequency: '每日',
        owner: '产品经理',
        description: '产品维度表，存储产品基础信息。关联逻辑：作为主表关联fact_order_detail表(product_id)和fact_product_sales表(product_id)，提供产品基础信息。',
        computeClusterTable: 'dim.dim_product',
        analysisClusterTable: 'dim.dim_product',
        registerTime: '2024-01-20T15:45:00Z',
        fields: [
            { name: 'product_id', type: 'string', description: '产品ID' },
            { name: 'product_name', type: 'string', description: '产品名称' },
            { name: 'category', type: 'string', description: '产品分类' },
            { name: 'brand', type: 'string', description: '品牌' },
            { name: 'price', type: 'decimal', description: '价格' },
            { name: 'create_time', type: 'timestamp', description: '创建时间' }
        ]
    },
    {
        name: 'fact_order_detail',
        type: 'fact',
        category: 'DWD',
        domain: '交易域',
        updateFrequency: '实时',
        owner: '交易分析师',
        description: '订单明细事实表。关联逻辑：通过user_id关联dim_user表获取用户信息，通过product_id关联dim_product表获取产品信息。',
        computeClusterTable: 'dwd.fact_order_detail',
        analysisClusterTable: 'dwd.fact_order_detail',
        registerTime: '2024-01-21T16:30:00Z',
        fields: [
            { name: 'order_id', type: 'string', description: '订单ID' },
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'product_id', type: 'string', description: '产品ID' },
            { name: 'quantity', type: 'int', description: '数量' },
            { name: 'amount', type: 'decimal', description: '金额' },
            { name: 'order_time', type: 'timestamp', description: '下单时间' }
        ]
    },
    {
        name: 'dws_user_behavior',
        type: 'dws',
        category: 'DWS',
        domain: '用户行为分析',
        updateFrequency: '每日',
        owner: '用户行为分析师',
        description: '用户行为汇总表。关联逻辑：通过user_id关联dim_user表获取用户基本信息，为用户画像和精准营销提供数据支持。',
        computeClusterTable: 'dws.dws_user_behavior',
        analysisClusterTable: 'dws.dws_user_behavior',
        registerTime: '2024-01-22T17:15:00Z',
        fields: [
            { name: 'user_id', type: 'string', description: '用户ID' },
            { name: 'pv_count', type: 'int', description: '页面浏览量' },
            { name: 'visit_count', type: 'int', description: '访问次数' },
            { name: 'avg_stay_time', type: 'int', description: '平均停留时间(秒)' },
            { name: 'update_time', type: 'timestamp', description: '更新时间' }
        ]
    }
];
const mockCollections = [
    {
        id: 'collection-1',
        name: '贷前分析',
        description: '贷前分析场景的相关数据表，包含贷款申请、用户信息等核心数据',
        isRecommended: true,
        tables: mockTables.filter(table => ['贷前分析', '用户域'].includes(table.domain))
    },
    {
        id: 'collection-2',
        name: '风控评估',
        description: '风控评估场景的相关数据表，用于风险评分和信用评估',
        isRecommended: true,
        tables: mockTables.filter(table => table.domain === '风控评估')
    },
    {
        id: 'collection-3',
        name: '反欺诈分析',
        description: '反欺诈场景的相关数据表，用于识别和预防欺诈行为',
        isRecommended: false,
        tables: mockTables.filter(table => table.domain === '反欺诈' || table.name.includes('fraud'))
    },
    {
        id: 'collection-4',
        name: '自营业务分析',
        description: '自营业务场景的相关数据表，用于分析自营贷款业务的运营情况',
        isRecommended: false,
        tables: mockTables.filter(table => table.domain === '自营业务')
    }
];
const mockApis = [
    {
        url: '/api/data-map/tables',
        method: 'get',
        response: ({ query }) => {
            const { name, type, category, domain, current = 1, pageSize = 10 } = query;
            let filteredTables = [...mockTables];
            if (name) {
                filteredTables = filteredTables.filter(table => table.name.toLowerCase().includes(name.toLowerCase()) ||
                    table.description.toLowerCase().includes(name.toLowerCase()));
            }
            if (type) {
                filteredTables = filteredTables.filter(table => table.type === type);
            }
            if (category) {
                filteredTables = filteredTables.filter(table => table.category === category);
            }
            if (domain) {
                filteredTables = filteredTables.filter(table => table.domain === domain);
            }
            const start = (current - 1) * pageSize;
            const end = start + pageSize;
            return {
                code: 200,
                data: {
                    list: filteredTables.slice(start, end),
                    total: filteredTables.length
                }
            };
        }
    },
    {
        url: '/api/data-map/collections',
        method: 'get',
        response: () => {
            return {
                code: 200,
                data: mockCollections
            };
        }
    }
];
export default {
    favoriteTables: mockTables.filter(table => table.name.includes('dim') || table.name.includes('fact')),
    collections: mockCollections
};
