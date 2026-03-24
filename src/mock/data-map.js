import { MetadataStore } from "./shared/metadata-store";
const mockTables = MetadataStore.getTables();

// 模拟数据
const mockTables_old = [
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
    },
    {
        id: 'collection-5',
        name: '用户画像',
        description: '全方位的用户画像数据，包含基础属性、行为偏好、消费能力等多维标签，助力精准营销。',
        type: '用户画像',
        isRecommended: true,
        tables: mockTables.filter(table => table.domain === '用户域' || table.domain === '用户行为分析')
    },
    {
        id: 'collection-6',
        name: '电商大促活动',
        description: '针对双11、618等大促活动的实时监控与复盘数据，支持分钟级数据更新。',
        type: '营销活动',
        isRecommended: false,
        tables: mockTables.filter(table => table.domain === '交易域')
    },
    {
        id: 'collection-7',
        name: '供应链管理',
        description: '涵盖采购、库存、物流等供应链全链路数据，帮助优化库存周转与物流效率。',
        type: '业务流程',
        isRecommended: false,
        tables: mockTables.filter(table => table.domain === '产品域')
    },
    {
        id: 'collection-8',
        name: '渠道转化分析',
        description: '各推广渠道的流量、转化、ROI分析数据，为渠道投放策略提供数据支撑。',
        type: '数据分析',
        isRecommended: false,
        tables: mockTables.filter(table => table.domain === '用户行为分析')
    }
];

// 2.0 新增 Mock 数据

// 最近浏览
export const mockRecentlyViewed = [
    { id: 1, name: 'zh_user_behavior_analysis', type: 'Z', iconColor: '#165DFF', star: 0, viewed: true },
    { id: 2, name: 'hive_order_transactions', type: 'H', iconColor: '#00B42A', star: 0, viewed: true },
    { id: 3, name: 'doris_realtime_metrics', type: 'D', iconColor: '#F53F3F', star: 0, viewed: true },
    { id: 4, name: 'zh_customer_profiles', type: 'Z', iconColor: '#165DFF', star: 0, viewed: true },
    { id: 5, name: 'las_log_analysis', type: 'L', iconColor: '#FF7D00', star: 0, viewed: true },
];

// 数据资产
export const mockDataAssets = [
    { name: 'ByteHouse CDW表', count: 132, icon: 'icon-storage' },
    { name: 'EMR Hive表', count: 238, icon: 'icon-storage' },
    { name: 'LAS表', count: 126, icon: 'icon-storage' },
    { name: '数据专题', count: 30, icon: 'icon-folder' },
    { name: 'EMR Doris表', count: '4K', icon: 'icon-storage' },
    { name: 'LAS Schema库', count: 290, icon: 'icon-database' },
    { name: 'EMR Hive库', count: 253, icon: 'icon-database' },
    { name: 'EMR StarRocks表', count: '1K', icon: 'icon-storage' },
    { name: 'EMR Serverless StarRocks表', count: 414, isNew: true, icon: 'icon-storage' },
];

// 数据资源 (新增)
export const mockDataResources = [
    { name: 'API 接口', count: 56, icon: 'icon-api' },
    { name: '数据报表', count: 89, icon: 'icon-bar-chart' },
    { name: '算法模型', count: 12, icon: 'icon-mind-mapping' },
    { name: '数据看板', count: 45, icon: 'icon-dashboard' }
];

// 数据要素 (新增)
export const mockDataElements = [
    { name: '核心指标', count: 120, icon: 'icon-trophy' },
    { name: '业务标签', count: 340, icon: 'icon-tag' },
    { name: '数据标准', count: 85, icon: 'icon-book' }
];

// 业务线推荐 (改为 TableCollection 格式)
export const mockBusinessRecommendations = [
    {
        id: 'rec-1',
        name: 'Coral-资产体系测试',
        description: '测试-test111',
        type: '业务流程',
        tables: Array(4).fill({}), // 模拟4张表
        isRecommended: true,
        isFavorite: true,
        owner: 'Coral',
        updateTime: '2023-12-01T10:00:00Z'
    },
    {
        id: 'rec-2',
        name: 'Test_资产体系业务线',
        description: 'dfff - 这是一个用于测试资产体系业务线的集合，包含多个关键数据表。',
        type: '数据分析',
        tables: Array(2).fill({}), // 模拟2张表
        isRecommended: false,
        isFavorite: false,
        owner: 'TestUser',
        updateTime: '2023-12-05T14:30:00Z'
    },
    {
        id: 'rec-3',
        name: '测试1',
        description: '111 - 简单的测试集合',
        type: '风险管控',
        tables: Array(1).fill({}), // 模拟1张表
        isRecommended: false,
        isFavorite: false,
        owner: 'Admin',
        updateTime: '2023-12-10T09:15:00Z'
    }
];

export default [
    {
        url: '/api/data-map/tables',
        method: 'get',
        response: () => {
            return {
                code: 200,
                data: {
                    list: mockTables,
                    total: mockTables.length
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
