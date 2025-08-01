import Mock from 'mockjs';
/**
 * 生成外部数据详情
 * @param {string} id - 接口ID
 * @returns {ExternalDataDetail} 外部数据详情
 */
export const generateExternalDataDetail = (id) => {
    const mockData = {
        'EXT001': {
            interfaceId: 'EXT001',
            dataName: '个人身份核验服务',
            dataType: '核验类',
            subType: '身份核验',
            supplier: '某某科技有限公司',
            description: '提供实时身份信息核验服务，支持姓名、身份证号、手机号三要素或二要素的核验，适用于注册、实名认证等场景',
            manager: '张三',
            price: 0.5,
            isFavorite: true,
            apiUrl: 'https://api.example.com/v1/identity/verify',
            targetTable: 'dwd_identity_verify_detail',
            status: '已上线',
            interfaceTag: '主接口',
            onlineTime: '2023-12-01',
            updateFrequency: '实时',
            dataSource: '公安部权威数据',
            requestMethod: 'POST',
            headers: 'Content-Type: application/json\nAuthorization: Bearer {token}',
            timeout: 3,
            qpsLimit: 1000,
            storageInfo: [
                { label: '落库表名', value: 'dwd_identity_verify_detail' },
                { label: '数据管理', value: '自动' },
                { label: '更新频率', value: '实时' },
                { label: '存储周期', value: '永久' },
                { label: '分区策略', value: '按天分区' },
                { label: '压缩格式', value: 'parquet' }
            ],
            metadataData: [
                { field: 'request_id', type: 'string', comment: '请求唯一标识' },
                { field: 'name', type: 'string', comment: '姓名' },
                { field: 'id_card', type: 'string', comment: '身份证号' },
                { field: 'mobile', type: 'string', comment: '手机号' },
                { field: 'verify_result', type: 'boolean', comment: '核验结果' },
                { field: 'verify_score', type: 'decimal', comment: '核验分数' },
                { field: 'fail_reason', type: 'string', comment: '失败原因' },
                { field: 'verify_time', type: 'timestamp', comment: '核验时间' },
                { field: 'response_time', type: 'int', comment: '响应时间(ms)' },
                { field: 'create_time', type: 'timestamp', comment: '创建时间' }
            ],
            inputParams: [
                { name: 'name', type: 'string', required: true, description: '姓名' },
                { name: 'id_card', type: 'string', required: true, description: '身份证号' },
                { name: 'mobile', type: 'string', required: false, description: '手机号' },
                { name: 'verify_type', type: 'string', required: true, description: '核验类型：2要素/3要素' },
                { name: 'request_id', type: 'string', required: true, description: '请求唯一标识' }
            ],
            outputParams: [
                { name: 'code', type: 'string', description: '返回码' },
                { name: 'message', type: 'string', description: '返回信息' },
                { name: 'verify_result', type: 'boolean', description: '核验结果' },
                { name: 'verify_score', type: 'decimal', description: '核验分数' },
                { name: 'fail_reason', type: 'string', description: '失败原因' },
                { name: 'verify_time', type: 'timestamp', description: '核验时间' }
            ],
            usageInfo: [
                { label: '计费方式', value: '按量计费' },
                { label: '单价', value: '0.5元/次' },
                { label: '阶梯优惠', value: '月调用量>10万次, 0.3元/次' },
                { label: '结算周期', value: '月结' },
                { label: '最低消费', value: '无' }
            ],
            evaluationInfo: [
                { label: '可用性', value: '99.99%' },
                { label: '准确率', value: '99.9%' },
                { label: '平均响应', value: '150ms' },
                { label: '数据时效', value: '实时' },
                { label: '接口文档', value: '已提供' },
                { label: '测试支持', value: '提供测试账号' }
            ]
        },
        'EXT002': {
            interfaceId: 'EXT002',
            dataName: '企业信用评分服务',
            dataType: '评分类',
            subType: '信用评分',
            supplier: '某某征信科技公司',
            description: '基于企业工商、司法、税务、舆情等多维度数据，提供企业信用风险评分服务，适用于企业授信、贷前审查等场景',
            manager: '李四',
            price: 20,
            isFavorite: false,
            apiUrl: 'https://api.example.com/v1/enterprise/credit-score',
            targetTable: 'dwd_enterprise_credit_detail',
            status: '已上线',
            interfaceTag: '主接口',
            onlineTime: '2023-11-15',
            updateFrequency: '每日',
            dataSource: '企业征信数据库',
            requestMethod: 'POST',
            headers: 'Content-Type: application/json\nX-Api-Key: {apikey}',
            timeout: 5,
            qpsLimit: 500,
            storageInfo: [
                { label: '落库表名', value: 'dwd_enterprise_credit_detail' },
                { label: '数据管理', value: '自动' },
                { label: '更新频率', value: '每日' },
                { label: '存储周期', value: '3年' },
                { label: '分区策略', value: '按月分区' },
                { label: '压缩格式', value: 'orc' }
            ],
            metadataData: [
                { field: 'enterprise_id', type: 'string', comment: '企业ID' },
                { field: 'credit_score', type: 'int', comment: '信用评分' },
                { field: 'risk_level', type: 'string', comment: '风险等级' },
                { field: 'score_detail', type: 'json', comment: '评分明细' },
                { field: 'warning_tags', type: 'array', comment: '风险标签' },
                { field: 'update_time', type: 'timestamp', comment: '数据更新时间' },
                { field: 'expire_time', type: 'timestamp', comment: '数据过期时间' }
            ],
            inputParams: [
                { name: 'enterprise_name', type: 'string', required: true, description: '企业名称' },
                { name: 'credit_code', type: 'string', required: true, description: '统一社会信用代码' },
                { name: 'legal_person', type: 'string', required: false, description: '法人姓名' },
                { name: 'province', type: 'string', required: true, description: '注册省份' },
                { name: 'request_id', type: 'string', required: true, description: '请求唯一标识' }
            ],
            outputParams: [
                { name: 'code', type: 'string', description: '返回码' },
                { name: 'message', type: 'string', description: '返回信息' },
                { name: 'credit_score', type: 'int', description: '信用评分(0-1000)' },
                { name: 'risk_level', type: 'string', description: '风险等级(低/中/高)' },
                { name: 'score_detail', type: 'object', description: '分项得分详情' },
                { name: 'warning_tags', type: 'array', description: '风险预警标签' },
                { name: 'report_time', type: 'timestamp', description: '报告时间' }
            ],
            usageInfo: [
                { label: '计费方式', value: '按量计费' },
                { label: '单价', value: '20元/次' },
                { label: '阶梯优惠', value: '月调用量>1000次, 15元/次' },
                { label: '结算周期', value: '月结' },
                { label: '最低消费', value: '1000元/月' }
            ],
            evaluationInfo: [
                { label: '可用性', value: '99.95%' },
                { label: '准确率', value: '95%' },
                { label: '平均响应', value: '300ms' },
                { label: '数据时效', value: 'T+1' },
                { label: '接口文档', value: '已提供' },
                { label: '测试支持', value: '提供沙箱环境' }
            ]
        }
    };
    return mockData[id] || {
        interfaceId: id,
        dataName: '未知数据',
        dataType: '未知类型',
        supplier: '未知供应商',
        description: '',
        manager: '',
        price: 0,
        isFavorite: false,
        apiUrl: '',
        targetTable: '',
        status: '',
        interfaceTag: '',
        onlineTime: '',
        updateFrequency: '',
        dataSource: '',
        requestMethod: '',
        headers: '',
        timeout: 0,
        qpsLimit: 0,
        storageInfo: [],
        metadataData: [],
        inputParams: [],
        outputParams: [],
        usageInfo: [],
        evaluationInfo: []
    };
};
/**
 * 生成外部数据统计信息
 * @returns {ExternalDataStatistics} 外部数据统计信息
 */
export const generateExternalDataStatistics = () => {
    return {
        registering: 10,
        pending: 5,
        online: 25,
        offline: 3
    };
};
/**
 * 模拟外部数据详情API
 * @param {string} path - 路径: /api/external-data-v1/detail/:id
 * @param {string} method - 方法: GET
 * @returns {object} 返回: 外部数据详情
 */
Mock.mock(/\/api\/external-data-v1\/detail\/.*/, 'get', (options) => {
    const id = options.url.split('/').pop();
    if (!id) {
        return {
            code: 400,
            message: 'Invalid ID'
        };
    }
    return {
        code: 200,
        data: generateExternalDataDetail(id)
    };
});
/**
 * 模拟外部数据统计API
 * @param {string} path - 路径: /api/external-data-v1/statistics
 * @param {string} method - 方法: GET
 * @returns {object} 返回: 外部数据统计信息
 */
Mock.mock('/api/external-data-v1/statistics', 'get', () => {
    return {
        code: 200,
        data: generateExternalDataStatistics()
    };
});
