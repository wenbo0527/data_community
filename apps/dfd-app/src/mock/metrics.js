const metrics = [
    {
        id: '1',
        name: 'DAU',
        category: '用户指标',
        businessDomain: '留存域',
        businessDefinition: '日活跃用户数',
        owner: '张三',
        code: 'USER_001',
        useCase: '用于监控产品的日常活跃情况，是产品健康度的重要指标',
        statisticalPeriod: '日更新',
        sourceTable: 'dwd.user_login_detail',
        processingLogic: 'SELECT dt, COUNT(DISTINCT user_id) as dau\nFROM dwd.user_login_detail\nWHERE dt = ${date}\nGROUP BY dt',
        fieldDescription: 'user_id: 用户唯一标识, dt: 统计日期',
        reportInfo: '用户分析/核心指标',
        storageLocation: 'adm.ads_user_core_metrics',
        queryCode: 'SELECT dau FROM adm.ads_user_core_metrics WHERE dt = ${date}',
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
        category: '业务域',
        businessDomain: '业务规模',
        businessDefinition: '授信申请环节中风控审批结果为通过的笔数',
        owner: '王志雄',
        code: 'A00043',
        useCase: '',
        statisticalPeriod: '离线T+2',
        sourceTable: 'a_frms_deparment_sx_his_full',
        processingLogic: `
WITH base AS (
  SELECT
    flow_id,
    apply_id,
    customer_id,
    product_code,
    result,
    decision_stage,
    decision_time,
    CASE WHEN remark LIKE '%测试%' OR remark LIKE '%test%' THEN 1 ELSE 0 END AS is_test,
    data_dt
  FROM a_frms_deparment_sx_his_full
  WHERE data_dt = \${date}
),
dedup AS (
  SELECT
    flow_id,
    apply_id,
    customer_id,
    product_code,
    result,
    decision_stage,
    decision_time,
    is_test,
    data_dt,
    ROW_NUMBER() OVER (PARTITION BY flow_id ORDER BY decision_time DESC) AS rn
  FROM base
),
latest AS (
  SELECT * FROM dedup WHERE rn = 1
),
valid_app AS (
  SELECT l.*
  FROM latest l
  LEFT JOIN dim_customer d ON l.customer_id = d.customer_id
  LEFT JOIN dim_product p ON l.product_code = p.product_code
  WHERE COALESCE(l.is_test, 0) = 0
    AND COALESCE(d.is_blacklist, 0) = 0
    AND COALESCE(p.status, 'ON') IN ('ON','ACTIVE')
),
pass_at_risk AS (
  SELECT * FROM valid_app WHERE result = 'PA' AND decision_stage = 'RISK'
),
exclude_revoke AS (
  SELECT pr.*
  FROM pass_at_risk pr
  LEFT JOIN a_frms_deparment_sx_his_full h2
    ON pr.flow_id = h2.flow_id
   AND h2.result IN ('RV','RJ')
   AND h2.decision_time > pr.decision_time
   AND h2.data_dt = pr.data_dt
  WHERE h2.flow_id IS NULL
),
final_cnt AS (
  SELECT
    data_dt,
    COUNT(DISTINCT flow_id) AS pass_cnt
  FROM exclude_revoke
  GROUP BY data_dt
)
SELECT pass_cnt
FROM final_cnt
WHERE data_dt = \${date}
`,
        fieldDescription: '',
        reportInfo: '发展日测报告\n公司级报表・市场营销报表',
        storageLocation: 'adm.ads_report_index_commonality_info_full',
        queryCode: 'SELECT data_dt=20250401\nFROM adm.ads_report_numbersinfo_free_temporal_code\nWHERE data_dt=20250401\nAND indicator_name=\'风控授信通过量\'\nAND indicator_id=\'A00043\'',
        versions: [
            { date: '2024-01-01', description: '指标创建' }
        ],
        businessOwner: '',
        technicalOwner: '',
        isFavorite: false
    },
    {
        id: '2',
        name: '用户注册转化率',
        category: '用户指标',
        businessDomain: '转化域',
        businessDefinition: '访问用户转化为注册用户的比率',
        owner: '李四',
        code: 'USER_002',
        useCase: '衡量产品获客效果，优化注册流程',
        statisticalPeriod: '日更新',
        sourceTable: 'dwd.user_register_detail',
        processingLogic: 'SELECT dt, COUNT(DISTINCT register_user_id) / COUNT(DISTINCT visit_user_id) as conversion_rate\nFROM dwd.user_register_detail\nWHERE dt = ${date}\nGROUP BY dt',
        fieldDescription: 'register_user_id: 完成注册的用户ID, visit_user_id: 访问用户ID',
        reportInfo: '用户分析/转化分析',
        storageLocation: 'adm.ads_user_conversion_metrics',
        queryCode: 'SELECT conversion_rate FROM adm.ads_user_conversion_metrics WHERE dt = ${date}',
        versions: [
            { date: '2024-01-05', description: '指标创建' }
        ],
        businessOwner: '王五',
        technicalOwner: '赵六',
        isFavorite: false
    }
];
export default [
    {
        url: '/api/metrics/list',
        method: 'get',
        response: ({ query }) => {
            const { page = '1', pageSize = '10', name, category, businessDomain } = query;
            console.log('Mock服务收到请求参数:', { page, pageSize, name, category, businessDomain });
            let filteredMetrics = [...metrics];
            // 按名称筛选
            if (name) {
                filteredMetrics = filteredMetrics.filter(item => item.name.includes(name));
            }
            // 按分类筛选
            if (category) {
                filteredMetrics = filteredMetrics.filter(item => item.category === category);
            }
            // 按业务域筛选
            if (businessDomain) {
                filteredMetrics = filteredMetrics.filter(item => item.businessDomain === businessDomain);
            }
            // 分页处理
            const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
            const endIndex = startIndex + parseInt(pageSize);
            const paginatedMetrics = filteredMetrics.slice(startIndex, endIndex);
            const response = {
                code: 200,
                message: 'success',
                data: {
                    list: paginatedMetrics,
                    total: filteredMetrics.length
                }
            };
            console.log('Mock服务返回数据:', response);
            return response;
        }
    }
];
