const metrics = [
    {
        id: '1',
        name: 'DAU',
        type: 'business', // 指标类型：business-业务核心指标, regulatory-监管指标
        category: '用户指标',
        businessDomain: '留存域',
        businessDefinition: '日活跃用户数',
        owner: '张三',
        code: 'USER_001',
        useCase: '用于监控产品的日常活跃情况，是产品健康度的重要指标',
        statisticalPeriod: '日更新',
        sourceTable: 'dwd.user_login_detail',
        processingLogic: `-- 日活跃用户数计算逻辑
-- 统计当日有登录行为的去重用户数
WITH user_login_base AS (
    SELECT 
        dt,
        user_id,
        login_time,
        device_type,
        channel
    FROM dwd.user_login_detail 
    WHERE dt = '\${date}'
        AND user_id IS NOT NULL
        AND user_id != ''
        -- 排除测试账号
        AND user_id NOT LIKE 'test_%'
        AND user_id NOT IN (
            SELECT user_id 
            FROM dim.test_user_list 
            WHERE is_active = 1
        )
),
user_daily_active AS (
    SELECT 
        dt,
        COUNT(DISTINCT user_id) as dau,
        COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN user_id END) as mobile_dau,
        COUNT(DISTINCT CASE WHEN device_type = 'pc' THEN user_id END) as pc_dau
    FROM user_login_base
    GROUP BY dt
)
SELECT 
    dt,
    dau,
    mobile_dau,
    pc_dau,
    ROUND(mobile_dau * 100.0 / dau, 2) as mobile_rate,
    ROUND(pc_dau * 100.0 / dau, 2) as pc_rate
FROM user_daily_active`,
        fieldDescription: 'user_id: 用户唯一标识, dt: 统计日期, device_type: 设备类型(mobile/pc), channel: 渠道来源',
        reportInfo: '用户分析/核心指标',
        storageLocation: 'adm.ads_user_core_metrics',
        queryCode: `-- 查询日活跃用户数
SELECT 
    dt,
    dau,
    mobile_dau,
    pc_dau,
    mobile_rate,
    pc_rate
FROM adm.ads_user_core_metrics 
WHERE dt = '\${date}'`,
        // 新增SQL相关字段
        sqlDetails: {
            mainSql: `-- 主要计算SQL
WITH user_login_base AS (
    SELECT 
        dt,
        user_id,
        login_time,
        device_type,
        channel
    FROM dwd.user_login_detail 
    WHERE dt = '\${date}'
        AND user_id IS NOT NULL
        AND user_id != ''
        -- 排除测试账号
        AND user_id NOT LIKE 'test_%'
        AND user_id NOT IN (
            SELECT user_id 
            FROM dim.test_user_list 
            WHERE is_active = 1
        )
),
user_daily_active AS (
    SELECT 
        dt,
        COUNT(DISTINCT user_id) as dau,
        COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN user_id END) as mobile_dau,
        COUNT(DISTINCT CASE WHEN device_type = 'pc' THEN user_id END) as pc_dau
    FROM user_login_base
    GROUP BY dt
)
SELECT 
    dt,
    dau,
    mobile_dau,
    pc_dau,
    ROUND(mobile_dau * 100.0 / dau, 2) as mobile_rate,
    ROUND(pc_dau * 100.0 / dau, 2) as pc_rate
FROM user_daily_active`,
            dataSources: [
                'dwd.user_login_detail - 用户登录明细表',
                'dim.test_user_list - 测试用户列表'
            ],
            outputFields: [
                'dt - 统计日期',
                'dau - 日活跃用户数',
                'mobile_dau - 移动端日活跃用户数',
                'pc_dau - PC端日活跃用户数',
                'mobile_rate - 移动端占比',
                'pc_rate - PC端占比'
            ],
            dependencies: [
                'dwd.user_login_detail',
                'dim.test_user_list'
            ]
        },
        versions: [
            { date: '2024-01-01', description: '指标创建' },
            { date: '2024-01-15', description: '优化统计逻辑，排除测试账号' }
        ],
        businessOwner: '李四',
        technicalOwner: '王五',
        isFavorite: true
    },
    {
        id: '2',
        name: '当日风控授信通过笔数',
        type: 'business', // 指标类型：business-业务核心指标, regulatory-监管指标
        category: '业务域',
        businessDomain: '业务规模',
        businessDefinition: '授信申请环节中风控审批结果为通过的笔数',
        owner: '王志雄',
        code: 'A00043',
        useCase: '用于监控风控系统的授信通过情况，评估业务规模和风险控制效果',
        statisticalPeriod: '离线T+2',
        sourceTable: 'a_frms_deparment_sx_his_full',
        processingLogic: `-- 风控授信通过笔数统计
-- 统计当日风控审批结果为通过(PA)的申请笔数
WITH risk_control_base AS (
    SELECT 
        data_dt,
        flow_id,
        apply_id,
        result,
        risk_score,
        approve_time,
        approve_amount,
        product_type,
        channel
    FROM a_frms_deparment_sx_his_full
    WHERE data_dt = '\${date}'
        AND result IS NOT NULL
        AND flow_id IS NOT NULL
        -- 排除测试数据
        AND apply_id NOT LIKE 'TEST_%'
),
risk_approval_summary AS (
    SELECT 
        data_dt,
        COUNT(DISTINCT flow_id) as total_applications,
        COUNT(DISTINCT CASE WHEN result = 'PA' THEN flow_id END) as approved_count,
        COUNT(DISTINCT CASE WHEN result = 'RE' THEN flow_id END) as rejected_count,
        COUNT(DISTINCT CASE WHEN result = 'PE' THEN flow_id END) as pending_count,
        AVG(CASE WHEN result = 'PA' THEN risk_score END) as avg_approved_score,
        SUM(CASE WHEN result = 'PA' THEN approve_amount ELSE 0 END) as total_approved_amount
    FROM risk_control_base
    GROUP BY data_dt
)
SELECT 
    data_dt,
    approved_count as risk_approved_count,
    total_applications,
    rejected_count,
    pending_count,
    ROUND(approved_count * 100.0 / total_applications, 2) as approval_rate,
    ROUND(avg_approved_score, 2) as avg_approved_score,
    total_approved_amount
FROM risk_approval_summary`,
        fieldDescription: 'flow_id: 流程ID, apply_id: 申请ID, result: 审批结果(PA-通过,RE-拒绝,PE-待定), risk_score: 风险评分, approve_amount: 批准金额',
        reportInfo: '发展日测报告\n公司级报表・市场营销报表',
        storageLocation: 'adm.ads_report_index_commonality_info_full',
        queryCode: `-- 查询风控授信通过笔数
SELECT 
    data_dt,
    risk_approved_count,
    total_applications,
    approval_rate,
    avg_approved_score,
    total_approved_amount
FROM adm.ads_report_index_commonality_info_full
WHERE data_dt = '\${date}'
    AND indicator_name = '风控授信通过量'
    AND indicator_id = 'A00043'`,
        sqlDetails: {
            mainSql: `-- 风控授信通过笔数主要计算逻辑
WITH risk_control_base AS (
    SELECT 
        data_dt,
        flow_id,
        apply_id,
        result,
        risk_score,
        approve_time,
        approve_amount,
        product_type,
        channel,
        -- 风险等级分类
        CASE 
            WHEN risk_score >= 800 THEN 'LOW'
            WHEN risk_score >= 600 THEN 'MEDIUM'
            WHEN risk_score >= 400 THEN 'HIGH'
            ELSE 'VERY_HIGH'
        END as risk_level
    FROM a_frms_deparment_sx_his_full
    WHERE data_dt = '\${date}'
        AND result IS NOT NULL
        AND flow_id IS NOT NULL
        -- 排除测试数据和异常数据
        AND apply_id NOT LIKE 'TEST_%'
        AND risk_score BETWEEN 0 AND 1000
),
product_channel_analysis AS (
    SELECT 
        data_dt,
        product_type,
        channel,
        COUNT(DISTINCT flow_id) as applications,
        COUNT(DISTINCT CASE WHEN result = 'PA' THEN flow_id END) as approvals,
        AVG(CASE WHEN result = 'PA' THEN approve_amount END) as avg_amount
    FROM risk_control_base
    WHERE result = 'PA'
    GROUP BY data_dt, product_type, channel
),
risk_level_analysis AS (
    SELECT 
        data_dt,
        risk_level,
        COUNT(DISTINCT flow_id) as level_applications,
        COUNT(DISTINCT CASE WHEN result = 'PA' THEN flow_id END) as level_approvals,
        ROUND(COUNT(DISTINCT CASE WHEN result = 'PA' THEN flow_id END) * 100.0 / COUNT(DISTINCT flow_id), 2) as level_approval_rate
    FROM risk_control_base
    GROUP BY data_dt, risk_level
)
SELECT 
    rb.data_dt,
    COUNT(DISTINCT rb.flow_id) as total_applications,
    COUNT(DISTINCT CASE WHEN rb.result = 'PA' THEN rb.flow_id END) as approved_count,
    COUNT(DISTINCT CASE WHEN rb.result = 'RE' THEN rb.flow_id END) as rejected_count,
    ROUND(COUNT(DISTINCT CASE WHEN rb.result = 'PA' THEN rb.flow_id END) * 100.0 / COUNT(DISTINCT rb.flow_id), 2) as approval_rate,
    AVG(CASE WHEN rb.result = 'PA' THEN rb.risk_score END) as avg_approved_score,
    SUM(CASE WHEN rb.result = 'PA' THEN rb.approve_amount ELSE 0 END) as total_approved_amount,
    -- 按风险等级统计
    COUNT(DISTINCT CASE WHEN rb.result = 'PA' AND rb.risk_level = 'LOW' THEN rb.flow_id END) as low_risk_approvals,
    COUNT(DISTINCT CASE WHEN rb.result = 'PA' AND rb.risk_level = 'MEDIUM' THEN rb.flow_id END) as medium_risk_approvals,
    COUNT(DISTINCT CASE WHEN rb.result = 'PA' AND rb.risk_level = 'HIGH' THEN rb.flow_id END) as high_risk_approvals
FROM risk_control_base rb
GROUP BY rb.data_dt`,
            dataSources: [
                'a_frms_deparment_sx_his_full - 风控部门授信历史全量表',
                'dim.product_info - 产品信息维表',
                'dim.channel_info - 渠道信息维表'
            ],
            outputFields: [
                'data_dt - 统计日期',
                'approved_count - 授信通过笔数',
                'total_applications - 总申请笔数',
                'approval_rate - 通过率',
                'avg_approved_score - 平均通过风险评分',
                'total_approved_amount - 总批准金额',
                'low_risk_approvals - 低风险通过笔数',
                'medium_risk_approvals - 中风险通过笔数',
                'high_risk_approvals - 高风险通过笔数'
            ],
            dependencies: [
                'a_frms_deparment_sx_his_full',
                'dim.product_info',
                'dim.channel_info'
            ]
        },
        versions: [
            { date: '2024-01-01', description: '指标创建' },
            { date: '2024-02-15', description: '增加风险等级分析维度' }
        ],
        businessOwner: '风控部门负责人',
        technicalOwner: '数据开发工程师',
        isFavorite: false
    },
    {
        id: '3',
        name: '用户注册转化率',
        type: 'business', // 指标类型：business-业务核心指标, regulatory-监管指标
        category: '用户指标',
        businessDomain: '转化域',
        businessDefinition: '访问用户转化为注册用户的比率',
        owner: '李四',
        code: 'USER_002',
        useCase: '衡量产品获客效果，优化注册流程',
        statisticalPeriod: '日更新',
        sourceTable: 'dwd.user_register_detail',
        processingLogic: `-- 用户注册转化率计算逻辑
-- 统计访问用户转化为注册用户的比率
WITH user_visit_base AS (
    SELECT 
        dt,
        user_id as visit_user_id,
        session_id,
        channel,
        device_type
    FROM dwd.user_visit_detail 
    WHERE dt = '\${date}'
        AND user_id IS NOT NULL
),
user_register_base AS (
    SELECT 
        dt,
        user_id as register_user_id,
        register_time,
        channel,
        device_type
    FROM dwd.user_register_detail 
    WHERE dt = '\${date}'
        AND user_id IS NOT NULL
),
conversion_analysis AS (
    SELECT 
        v.dt,
        COUNT(DISTINCT v.visit_user_id) as total_visitors,
        COUNT(DISTINCT r.register_user_id) as total_registers,
        COUNT(DISTINCT CASE WHEN v.channel = r.channel THEN r.register_user_id END) as same_channel_registers
    FROM user_visit_base v
    LEFT JOIN user_register_base r ON v.visit_user_id = r.register_user_id AND v.dt = r.dt
    GROUP BY v.dt
)
SELECT 
    dt,
    total_visitors,
    total_registers,
    ROUND(total_registers * 100.0 / total_visitors, 2) as conversion_rate,
    ROUND(same_channel_registers * 100.0 / total_registers, 2) as same_channel_rate
FROM conversion_analysis`,
        fieldDescription: 'register_user_id: 完成注册的用户ID, visit_user_id: 访问用户ID, session_id: 会话标识, channel: 渠道来源',
        reportInfo: '用户分析/转化分析',
        storageLocation: 'adm.ads_user_conversion_metrics',
        queryCode: `-- 查询用户注册转化率
SELECT 
    dt,
    total_visitors,
    total_registers,
    conversion_rate,
    same_channel_rate
FROM adm.ads_user_conversion_metrics 
WHERE dt = '\${date}'`,
        sqlDetails: {
            mainSql: `-- 用户注册转化率主要计算逻辑
WITH user_visit_base AS (
    SELECT 
        dt,
        user_id as visit_user_id,
        session_id,
        channel,
        device_type
    FROM dwd.user_visit_detail 
    WHERE dt = '\${date}'
        AND user_id IS NOT NULL
),
user_register_base AS (
    SELECT 
        dt,
        user_id as register_user_id,
        register_time,
        channel,
        device_type
    FROM dwd.user_register_detail 
    WHERE dt = '\${date}'
        AND user_id IS NOT NULL
)
SELECT 
    v.dt,
    COUNT(DISTINCT v.visit_user_id) as total_visitors,
    COUNT(DISTINCT r.register_user_id) as total_registers,
    ROUND(COUNT(DISTINCT r.register_user_id) * 100.0 / COUNT(DISTINCT v.visit_user_id), 2) as conversion_rate
FROM user_visit_base v
LEFT JOIN user_register_base r ON v.visit_user_id = r.register_user_id AND v.dt = r.dt
GROUP BY v.dt`,
            dataSources: [
                'dwd.user_visit_detail - 用户访问明细表',
                'dwd.user_register_detail - 用户注册明细表'
            ],
            outputFields: [
                'dt - 统计日期',
                'total_visitors - 总访问用户数',
                'total_registers - 总注册用户数',
                'conversion_rate - 注册转化率',
                'same_channel_rate - 同渠道转化率'
            ],
            dependencies: [
                'dwd.user_visit_detail',
                'dwd.user_register_detail'
            ]
        },
        versions: [
            { date: '2024-01-05', description: '指标创建' },
            { date: '2024-01-20', description: '增加渠道转化分析' }
        ],
        businessOwner: '王五',
        technicalOwner: '赵六',
        isFavorite: false
    },
    {
        id: '7',
        name: '月活跃用户数',
        type: 'business',
        category: '用户指标',
        businessDomain: '留存域',
        businessDefinition: '月度活跃用户数，统计一个月内有活跃行为的去重用户数',
        owner: '张三',
        code: 'USER_003',
        useCase: '衡量产品月度用户活跃度，分析用户留存情况',
        statisticalPeriod: '月更新',
        sourceTable: 'dwd.user_activity_detail',
        processingLogic: `-- 月活跃用户数计算逻辑
WITH monthly_active_users AS (
    SELECT 
        DATE_FORMAT(dt, '%Y-%m') as month,
        COUNT(DISTINCT user_id) as mau,
        COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN user_id END) as mobile_mau,
        COUNT(DISTINCT CASE WHEN device_type = 'pc' THEN user_id END) as pc_mau
    FROM dwd.user_activity_detail
    WHERE dt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND user_id IS NOT NULL
    GROUP BY DATE_FORMAT(dt, '%Y-%m')
)
SELECT 
    month,
    mau,
    mobile_mau,
    pc_mau,
    ROUND(mobile_mau * 100.0 / mau, 2) as mobile_rate
FROM monthly_active_users`,
        fieldDescription: 'user_id: 用户唯一标识, dt: 活跃日期, device_type: 设备类型, activity_type: 活跃行为类型',
        reportInfo: '用户分析/活跃度分析',
        storageLocation: 'adm.ads_user_monthly_metrics',
        queryCode: `SELECT month, mau, mobile_mau, pc_mau FROM adm.ads_user_monthly_metrics WHERE month = DATE_FORMAT(CURDATE(), '%Y-%m')`,
        sqlDetails: {
            mainSql: `SELECT DATE_FORMAT(dt, '%Y-%m') as month, COUNT(DISTINCT user_id) as mau FROM dwd.user_activity_detail WHERE dt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY month`,
            dataSources: ['dwd.user_activity_detail - 用户活跃明细表'],
            outputFields: ['month - 统计月份', 'mau - 月活跃用户数', 'mobile_mau - 移动端月活', 'pc_mau - PC端月活'],
            dependencies: ['dwd.user_activity_detail']
        },
        versions: [{ date: '2024-01-10', description: '指标创建' }],
        businessOwner: '产品经理',
        technicalOwner: '数据工程师',
        isFavorite: true
    },
    {
        id: '8',
        name: '客户获取成本',
        type: 'business',
        category: '营销指标',
        businessDomain: '获客域',
        businessDefinition: '获取一个新客户所需要的平均成本',
        owner: '市场部',
        code: 'MKT_001',
        useCase: '评估营销活动效果，优化获客策略',
        statisticalPeriod: '月更新',
        sourceTable: 'dwd.marketing_cost_detail',
        processingLogic: `-- 客户获取成本计算
SELECT 
    month,
    SUM(marketing_cost) / COUNT(DISTINCT new_customer_id) as cac
FROM dwd.marketing_cost_detail
WHERE month = DATE_FORMAT(CURDATE(), '%Y-%m')
GROUP BY month`,
        fieldDescription: 'marketing_cost: 营销成本, new_customer_id: 新客户ID, channel: 获客渠道',
        reportInfo: '营销分析/获客成本',
        storageLocation: 'adm.ads_marketing_metrics',
        queryCode: `SELECT cac FROM adm.ads_marketing_metrics WHERE month = DATE_FORMAT(CURDATE(), '%Y-%m')`,
        sqlDetails: {
            mainSql: `SELECT month, SUM(cost)/COUNT(DISTINCT customer_id) as cac FROM marketing_data GROUP BY month`,
            dataSources: ['dwd.marketing_cost_detail'],
            outputFields: ['month - 月份', 'cac - 客户获取成本'],
            dependencies: ['dwd.marketing_cost_detail']
        },
        versions: [{ date: '2024-01-15', description: '指标创建' }],
        businessOwner: '市场总监',
        technicalOwner: '数据分析师',
        isFavorite: false
    },
    // 监管指标示例
    {
        id: '4',
        name: '资本充足率',
        type: 'regulatory', // 监管指标
        regulatoryCategory: '资本监管', // 监管大类
        reportName: '资本充足率报告', // 报表名称
        description: '银行资本充足率监管指标，用于衡量银行资本充足程度',
        unit: '%',
        frequency: '月度',
        dataSource: '核心系统',
        calculationLogic: '核心一级资本 / 风险加权资产 * 100%',
        sqlLogic: `
            SELECT 
                (core_tier1_capital / risk_weighted_assets) * 100 as capital_adequacy_ratio
            FROM regulatory_capital_report 
            WHERE report_date = CURRENT_DATE
        `,
        processingLogic: '1. 从核心系统获取资本数据\n2. 计算风险加权资产\n3. 计算资本充足率\n4. 数据质量检查',
        queryCode: 'SELECT * FROM capital_adequacy WHERE date >= \'2024-01-01\'',
        businessDefinition: '根据银保监会要求，银行核心一级资本充足率不得低于7.5%',
        technicalDefinition: '核心一级资本与风险加权资产的比率，按照巴塞尔协议III标准计算',
        dataQuality: '数据准确性99.9%，及时性T+1',
        updateTime: '2024-01-20 09:00:00',
        version: '2.1.0',
        owner: '李四',
        department: '风险管理部'
    },
    {
        id: '5',
        name: '流动性覆盖率',
        type: 'regulatory', // 监管指标
        regulatoryCategory: '流动性监管', // 监管大类
        reportName: '流动性风险监管报告', // 报表名称
        description: '银行流动性覆盖率监管指标，衡量银行短期流动性风险抵御能力',
        unit: '%',
        frequency: '日度',
        dataSource: '资金系统',
        calculationLogic: '合格流动性资产 / 未来30天净现金流出量 * 100%',
        sqlLogic: `
            SELECT 
                (qualified_liquid_assets / net_cash_outflow_30d) * 100 as lcr
            FROM liquidity_report 
            WHERE report_date = CURRENT_DATE
        `,
        processingLogic: '1. 计算合格流动性资产\n2. 预测30天净现金流出\n3. 计算LCR比率\n4. 监管报送',
        queryCode: 'SELECT * FROM liquidity_coverage_ratio WHERE date >= \'2024-01-01\'',
        businessDefinition: '银保监会要求银行流动性覆盖率不得低于100%',
        technicalDefinition: '合格流动性资产与未来30天净现金流出量的比率',
        dataQuality: '数据准确性99.8%，及时性T+0',
        updateTime: '2024-01-20 08:30:00',
        version: '1.5.0',
        owner: '王五',
        department: '资产负债管理部'
    },
    {
        id: '6',
        name: '不良贷款率',
        type: 'regulatory', // 监管指标
        regulatoryCategory: '信贷风险监管', // 监管大类
        reportName: '信贷资产质量报告', // 报表名称
        description: '银行不良贷款率监管指标，反映信贷资产质量状况',
        unit: '%',
        frequency: '月度',
        dataSource: '信贷系统',
        calculationLogic: '不良贷款余额 / 贷款总余额 * 100%',
        sqlLogic: `
            SELECT 
                (SUM(CASE WHEN loan_class IN ('次级', '可疑', '损失') THEN loan_balance ELSE 0 END) / 
                 SUM(loan_balance)) * 100 as npl_ratio
            FROM loan_portfolio 
            WHERE report_date = LAST_DAY(CURRENT_DATE)
        `,
        processingLogic: '1. 统计各类贷款余额\n2. 识别不良贷款\n3. 计算不良率\n4. 趋势分析',
        queryCode: 'SELECT * FROM npl_analysis WHERE month >= \'2024-01\'',
        businessDefinition: '监管要求银行不良贷款率控制在合理水平，一般不超过3%',
        technicalDefinition: '次级、可疑、损失类贷款余额占贷款总余额的比例',
        dataQuality: '数据准确性99.9%，及时性T+1',
        updateTime: '2024-01-20 10:15:00',
        version: '3.0.0',
        owner: '赵六',
        department: '信贷管理部'
    },
    {
        id: '9',
        name: '杠杆率',
        type: 'regulatory',
        regulatoryCategory: '资本监管',
        reportName: '杠杆率监管报告',
        description: '银行杠杆率监管指标，衡量银行资本充足程度的补充指标',
        unit: '%',
        frequency: '季度',
        dataSource: '核心系统',
        calculationLogic: '一级资本 / 调整后表内外资产余额 * 100%',
        sqlLogic: `
            SELECT 
                (tier1_capital / adjusted_exposure) * 100 as leverage_ratio
            FROM regulatory_capital_report 
            WHERE report_date = LAST_DAY(CURRENT_DATE)
        `,
        processingLogic: '1. 计算一级资本净额\n2. 计算调整后表内外资产余额\n3. 计算杠杆率\n4. 监管报送',
        queryCode: 'SELECT * FROM leverage_ratio WHERE quarter >= \'2024-Q1\'',
        businessDefinition: '银保监会要求银行杠杆率不得低于4%',
        technicalDefinition: '一级资本与调整后表内外资产余额的比率',
        dataQuality: '数据准确性99.9%，及时性T+1',
        updateTime: '2024-01-20 11:00:00',
        version: '1.8.0',
        owner: '风险管理部',
        department: '风险管理部'
    },
    {
        id: '10',
        name: '净稳定资金比例',
        type: 'regulatory',
        regulatoryCategory: '流动性监管',
        reportName: '净稳定资金比例报告',
        description: '银行净稳定资金比例监管指标，衡量银行中长期流动性风险',
        unit: '%',
        frequency: '月度',
        dataSource: '资金系统',
        calculationLogic: '可用稳定资金 / 所需稳定资金 * 100%',
        sqlLogic: `
            SELECT 
                (available_stable_funding / required_stable_funding) * 100 as nsfr
            FROM liquidity_report 
            WHERE report_date = LAST_DAY(CURRENT_DATE)
        `,
        processingLogic: '1. 计算可用稳定资金\n2. 计算所需稳定资金\n3. 计算NSFR比率\n4. 趋势分析',
        queryCode: 'SELECT * FROM nsfr_analysis WHERE month >= \'2024-01\'',
        businessDefinition: '银保监会要求银行净稳定资金比例不得低于100%',
        technicalDefinition: '可用稳定资金与所需稳定资金的比率',
        dataQuality: '数据准确性99.8%，及时性T+1',
        updateTime: '2024-01-20 09:45:00',
        version: '2.2.0',
        owner: '资产负债管理部',
        department: '资产负债管理部'
    },
    {
        id: '11',
        name: '大额风险暴露',
        type: 'regulatory',
        regulatoryCategory: '信贷风险监管',
        reportName: '大额风险暴露报告',
        description: '银行对单一客户或客户群体的风险暴露监管指标',
        unit: '万元',
        frequency: '月度',
        dataSource: '信贷系统',
        calculationLogic: '单一客户风险暴露 / 一级资本净额 * 100%',
        sqlLogic: `
            SELECT 
                customer_id,
                customer_name,
                total_exposure,
                (total_exposure / tier1_capital) * 100 as exposure_ratio
            FROM large_exposure_report 
            WHERE report_date = LAST_DAY(CURRENT_DATE)
                AND (total_exposure / tier1_capital) * 100 >= 10
        `,
        processingLogic: '1. 统计单一客户风险暴露\n2. 计算暴露比例\n3. 识别大额风险暴露\n4. 监管报送',
        queryCode: 'SELECT * FROM large_exposure WHERE month >= \'2024-01\' AND exposure_ratio >= 10',
        businessDefinition: '银保监会要求银行对单一客户风险暴露不得超过一级资本净额的25%',
        technicalDefinition: '单一客户或客户群体风险暴露与一级资本净额的比率',
        dataQuality: '数据准确性99.9%，及时性T+1',
        updateTime: '2024-01-20 10:30:00',
        version: '1.6.0',
        owner: '信贷管理部',
        department: '信贷管理部'
    }
];
// 导出metrics数据供其他组件使用
export const metricsMock = [
    {
        url: '/api/metrics',
        method: 'get',
        response: ({ query }) => {
            console.log('Mock API 被调用，查询参数:', query)
            
            let filteredMetrics = [...metrics]
            
            // 按指标类型筛选
            if (query.type) {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.type === query.type
                )
            }
            
            // 按名称筛选
            if (query.name) {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.name.includes(query.name)
                )
            }
            
            // 按分类筛选 - 根据指标类型使用不同的分类字段
            if (query.category) {
                if (query.type === 'regulatory') {
                    // 监管指标使用监管大类筛选
                    filteredMetrics = filteredMetrics.filter(metric => 
                        metric.regulatoryCategory === query.category
                    )
                } else {
                    // 业务指标使用原有分类筛选
                    filteredMetrics = filteredMetrics.filter(metric => 
                        metric.category === query.category
                    )
                }
            }
            
            // 按业务域筛选（仅业务指标）
            if (query.businessDomain && query.type === 'business') {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.businessDomain === query.businessDomain
                )
            }
            
            // 按监管大类筛选（仅监管指标）
            if (query.regulatoryCategory && query.type === 'regulatory') {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.regulatoryCategory === query.regulatoryCategory
                )
            }
            
            // 按报表名称筛选（仅监管指标）
            if (query.reportName && query.type === 'regulatory') {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.reportName && metric.reportName.includes(query.reportName)
                )
            }
            
            // 按负责人筛选
            if (query.owner) {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.owner && metric.owner.includes(query.owner)
                )
            }
            
            // 按指标代码筛选
            if (query.code) {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.code && metric.code.includes(query.code)
                )
            }
            
            // 按收藏状态筛选
            if (query.isFavorite === 'true') {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.isFavorite === true
                )
            }
            
            const page = parseInt(query.page) || 1
            const pageSize = parseInt(query.pageSize) || 10
            const start = (page - 1) * pageSize
            const end = start + pageSize
            
            const result = {
                data: {
                    list: filteredMetrics.slice(start, end),
                    total: filteredMetrics.length
                }
            }
            
            console.log('Mock API 返回结果:', result)
            return result
        }
    }
];

export default [
    {
        url: '/api/metrics',
        method: 'get',
        response: ({ query }) => {
            console.log('Mock API 被调用，查询参数:', query)
            
            let filteredMetrics = [...metrics]
            
            // 按指标类型筛选
            if (query.type) {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.type === query.type
                )
            }
            
            // 按名称筛选
            if (query.name) {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.name.includes(query.name)
                )
            }
            
            // 按分类筛选 - 根据指标类型使用不同的分类字段
            if (query.category) {
                if (query.type === 'regulatory') {
                    // 监管指标使用监管大类筛选
                    filteredMetrics = filteredMetrics.filter(metric => 
                        metric.regulatoryCategory === query.category
                    )
                } else {
                    // 业务指标使用原有分类筛选
                    filteredMetrics = filteredMetrics.filter(metric => 
                        metric.category === query.category
                    )
                }
            }
            
            // 按业务域筛选（仅业务指标）
            if (query.businessDomain && query.type === 'business') {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.businessDomain === query.businessDomain
                )
            }
            
            // 按监管大类筛选（仅监管指标）
            if (query.regulatoryCategory && query.type === 'regulatory') {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.regulatoryCategory === query.regulatoryCategory
                )
            }
            
            // 按报表名称筛选（仅监管指标）
            if (query.reportName && query.type === 'regulatory') {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.reportName && metric.reportName.includes(query.reportName)
                )
            }
            
            // 按负责人筛选
            if (query.owner) {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.owner && metric.owner.includes(query.owner)
                )
            }
            
            // 按指标代码筛选
            if (query.code) {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.code && metric.code.includes(query.code)
                )
            }
            
            // 按收藏状态筛选
            if (query.isFavorite === 'true') {
                filteredMetrics = filteredMetrics.filter(metric => 
                    metric.isFavorite === true
                )
            }
            
            const page = parseInt(query.page) || 1
            const pageSize = parseInt(query.pageSize) || 10
            const start = (page - 1) * pageSize
            const end = start + pageSize
            
            const result = {
                data: {
                    list: filteredMetrics.slice(start, end),
                    total: filteredMetrics.length
                }
            }
            
            console.log('Mock API 返回结果:', result)
            return result
        }
    }
];
