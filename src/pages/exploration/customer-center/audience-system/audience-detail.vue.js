/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { IconHome, IconSettings, IconTag, IconEye, IconDashboard, IconBarChart, IconMore, IconPlus, IconDown, IconDelete, IconCheckCircle, IconExclamationCircle, IconInfoCircle, IconCopy, IconMinus, IconEdit, IconCheck, IconClose } from '@arco-design/web-vue/es/icon';
import ConditionConfig from '@/components/common/ConditionConfig.vue';
const route = useRoute();
const router = useRouter();
// 当前选中的标签页
const activeTab = ref('distribution');
// 人群详情数据
const audienceDetail = reactive({
    id: 'AUD_20231019_001',
    name: '高价值客户群体',
    type: 'custom',
    status: 'active',
    createMethod: 'rule',
    updateFrequency: '每日',
    validPeriod: '长期有效',
    shareLevel: 'public',
    createUser: '张力',
    description: '基于消费行为和用户属性筛选出的高价值客户群体，包含近30天消费金额超过1000元且活跃度较高的用户。'
});
// 人群统计数据
const audienceStats = reactive({
    totalCount: 156789,
    coverageRate: 12.5,
    activeCount: 142356,
    qualityScore: 95.8,
    updateTime: '2023-10-19 14:23:12',
    dataDate: '2023-10-19'
});
// 人群规则配置
const audienceRules = reactive({
    ruleType: 'custom',
    crossGroupLogic: 'and',
    estimatedCount: 156789,
    conditionGroups: [
        {
            id: 'group_1',
            name: '消费行为条件',
            logic: 'and',
            conditions: [
                {
                    id: 'condition_1',
                    dataSourceType: 'behavior',
                    fieldName: '消费金额',
                    aggregationType: 'sum',
                    operator: 'gte',
                    value: '1000',
                    dateType: 'dynamic',
                    dynamicValue: 30,
                    dynamicUnit: 'days'
                }
            ]
        },
        {
            id: 'group_2',
            name: '用户属性条件',
            logic: 'and',
            conditions: [
                {
                    id: 'condition_2',
                    dataSourceType: 'attribute',
                    fieldName: '用户等级',
                    operator: 'in',
                    value: 'VIP,SVIP'
                }
            ]
        }
    ]
});
// 数据分布数据
const distributionData = ref([
    { label: '标签组1', percentage: 85, color: '#ff7d00' },
    { label: '标签组2', percentage: 70, color: '#1890ff' },
    { label: '标签组3', percentage: 45, color: '#fadb14' }
]);
// 血缘查询相关
const lineageChartRef = ref(null);
let lineageChart = null;
// 血缘关系数据
const lineageData = ref({
    name: '高价值客户群体',
    category: 'audience',
    children: [
        {
            name: '消费行为标签',
            category: 'tag',
            children: [
                {
                    name: '消费金额',
                    category: 'attribute',
                    children: [
                        {
                            name: 'order_table',
                            category: 'table',
                            value: '订单表'
                        },
                        {
                            name: 'payment_table',
                            category: 'table',
                            value: '支付表'
                        }
                    ]
                },
                {
                    name: '消费频次',
                    category: 'attribute',
                    children: [
                        {
                            name: 'order_table',
                            category: 'table',
                            value: '订单表'
                        }
                    ]
                }
            ]
        },
        {
            name: '用户属性标签',
            category: 'tag',
            children: [
                {
                    name: '用户等级',
                    category: 'attribute',
                    children: [
                        {
                            name: 'user_table',
                            category: 'table',
                            value: '用户表'
                        }
                    ]
                },
                {
                    name: '注册时间',
                    category: 'attribute',
                    children: [
                        {
                            name: 'user_table',
                            category: 'table',
                            value: '用户表'
                        }
                    ]
                }
            ]
        },
        {
            name: '活跃度标签',
            category: 'tag',
            children: [
                {
                    name: '登录频次',
                    category: 'attribute',
                    children: [
                        {
                            name: 'login_log_table',
                            category: 'table',
                            value: '登录日志表'
                        }
                    ]
                },
                {
                    name: '页面浏览',
                    category: 'attribute',
                    children: [
                        {
                            name: 'behavior_table',
                            category: 'table',
                            value: '行为表'
                        }
                    ]
                }
            ]
        }
    ]
});
// 规则配置相关数据
const conditionGroups = ref([]); // 条件组数组
const estimatedCount = ref(12843); // 预估覆盖人数
const availabilityRate = ref(98.2); // 标签可用率
const crossGroupLogic = ref('or'); // 跨条件组逻辑，默认为或
const configType = ref('tag'); // 当前配置类型，默认为标签
const logicType = ref('and'); // 标签逻辑关系，默认为且
// 数据源类型选项
const dataSourceTypeOptions = [
    { label: '明细数据', value: 'detail' },
    { label: '行为数据', value: 'behavior' },
    { label: '属性数据', value: 'attribute' }
];
// 日期类型选项
const dateTypeOptions = [
    { label: '动态日期', value: 'dynamic' },
    { label: '固定日期', value: 'fixed' },
    { label: '单个日期', value: 'single' }
];
// 动态日期单位选项
const dynamicUnitOptions = [
    { label: '天', value: 'days' },
    { label: '周', value: 'weeks' },
    { label: '月', value: 'months' },
    { label: '年', value: 'years' }
];
// 获取人群类型颜色
const getTypeColor = (type) => {
    const colorMap = {
        custom: 'blue',
        imported: 'green',
        system: 'orange'
    };
    return colorMap[type] || 'gray';
};
// 获取人群类型文本
const getTypeText = (type) => {
    const textMap = {
        custom: '自定义人群',
        imported: '导入人群',
        system: '系统人群'
    };
    return textMap[type] || type;
};
// 获取状态颜色
const getStatusColor = (status) => {
    const colorMap = {
        active: 'green',
        inactive: 'red',
        processing: 'orange',
        pending: 'gray'
    };
    return colorMap[status] || 'gray';
};
// 获取状态文本
const getStatusText = (status) => {
    const textMap = {
        active: '活跃',
        inactive: '停用',
        processing: '计算中',
        pending: '待处理'
    };
    return textMap[status] || status;
};
// 获取创建方式文本
const getCreateMethodText = (method) => {
    const textMap = {
        rule: '规则创建',
        import: '数据导入',
        api: 'API接口'
    };
    return textMap[method] || method;
};
// 获取规则类型文本
const getRuleTypeText = (type) => {
    const textMap = {
        custom: '自定义规则',
        template: '模板规则',
        imported: '导入规则'
    };
    return textMap[type] || type;
};
// 获取规则复杂度
const getRuleComplexity = () => {
    const totalConditions = audienceRules.conditionGroups.reduce((sum, group) => {
        return sum + group.conditions.length;
    }, 0);
    if (totalConditions <= 3)
        return '简单';
    if (totalConditions <= 8)
        return '中等';
    return '复杂';
};
// 获取共享级别颜色
const getShareLevelColor = (shareLevel) => {
    const colorMap = {
        public: 'green',
        private: 'orange'
    };
    return colorMap[shareLevel] || 'gray';
};
// 获取共享级别文本
const getShareLevelText = (shareLevel) => {
    const textMap = {
        public: '公开',
        private: '私有'
    };
    return textMap[shareLevel] || shareLevel;
};
// 格式化数字
const formatNumber = (num) => {
    return num.toLocaleString();
};
// 血缘图表相关方法
// 初始化血缘图表
const initLineageChart = () => {
    if (!lineageChartRef.value)
        return;
    lineageChart = echarts.init(lineageChartRef.value);
    const option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            formatter: function (params) {
                const data = params.data;
                let content = `<div style="padding: 8px;">`;
                content += `<div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>`;
                if (data.category === 'audience') {
                    content += `<div style="color: #666;">类型: 人群</div>`;
                    content += `<div style="color: #666;">规模: ${formatNumber(audienceStats.totalCount)}</div>`;
                    content += `<div style="color: #666;">更新时间: ${new Date(audienceStats.updateTime).toLocaleString()}</div>`;
                }
                else if (data.category === 'tag') {
                    content += `<div style="color: #666;">类型: 标签</div>`;
                    content += `<div style="color: #666;">最后更新: ${data.tagUpdatedTime || '无记录'}</div>`;
                }
                else if (data.category === 'attribute') {
                    content += `<div style="color: #666;">类型: 属性</div>`;
                    content += `<div style="color: #666;">同步时间: ${data.lastSynced || '未同步'}</div>`;
                    content += `<div style="color: #666;margin-top:4px;">更新时间: ${new Date(data.audienceStats?.updateTime || data.updatedAt).toLocaleString()}</div>`;
                }
                else if (data.category === 'table') {
                    content += `<div style="color: #666;">类型: 数据表</div>`;
                    content += `<div style="color: #666;">表名: ${data.value || data.name}</div>`;
                    content += `<div style="color: #666;">分区更新: ${data.partitionTime || '无分区'}</div>`;
                    content += `<div style="color: #666;margin-top:4px;">最后更新: ${new Date(data.tableUpdatedAt).toLocaleString()}</div>`;
                }
                content += `</div>`;
                return content;
            }
        },
        series: [
            {
                type: 'tree',
                data: [lineageData.value],
                top: '5%',
                left: '15%',
                bottom: '5%',
                right: '15%',
                symbolSize: 12,
                orient: 'LR',
                label: {
                    position: 'left',
                    verticalAlign: 'middle',
                    align: 'right',
                    fontSize: 12,
                    color: '#333',
                    formatter: function (params) {
                        return params.data.name;
                    }
                },
                leaves: {
                    label: {
                        position: 'right',
                        verticalAlign: 'middle',
                        align: 'left'
                    }
                },
                emphasis: {
                    focus: 'descendant'
                },
                expandAndCollapse: true,
                animationDuration: 550,
                animationDurationUpdate: 750,
                itemStyle: {
                    color: function (params) {
                        const colorMap = {
                            'audience': '#1890ff',
                            'tag': '#52c41a',
                            'attribute': '#faad14',
                            'table': '#f5222d'
                        };
                        return colorMap[params.data.category] || '#666';
                    },
                    borderColor: '#fff',
                    borderWidth: 2
                },
                lineStyle: {
                    color: '#ccc',
                    width: 1.5,
                    curveness: 0.3
                }
            }
        ]
    };
    lineageChart.setOption(option);
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        if (lineageChart) {
            lineageChart.resize();
        }
    });
};
// 监听 activeTab 变化，初始化血缘图表
watch(activeTab, async (newTab) => {
    if (newTab === 'lineage') {
        await nextTick();
        initLineageChart();
    }
});
// 规则配置相关方法
// 生成唯一ID
const generateId = () => {
    return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};
// 添加条件组
const addConditionGroup = () => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue) {
        const newGroup = {
            id: generateId(),
            name: `条件组${currentTagValue.conditionGroups.length + 1}`,
            collapsed: false,
            logic: 'and', // 默认为且逻辑
            conditions: []
        };
        currentTagValue.conditionGroups.push(newGroup);
        return newGroup;
    }
};
// 复制条件组
const duplicateGroup = (group) => {
    const newGroup = {
        ...group,
        id: generateId(),
        name: group.name + ' 副本',
        logic: group.logic || 'and',
        conditions: group.conditions.map(condition => ({
            ...condition,
            id: generateId()
        }))
    };
    conditionGroups.value.push(newGroup);
};
// 删除条件组
const removeGroup = (groupIndex) => {
    conditionGroups.value.splice(groupIndex, 1);
};
// 删除条件组
const deleteConditionGroup = (groupIndex) => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue) {
        currentTagValue.conditionGroups.splice(groupIndex, 1);
    }
};
// 切换条件组内的逻辑关系
const toggleGroupLogic = (group) => {
    group.logic = group.logic === 'and' ? 'or' : 'and';
};
// 人群管理相关方法
// 刷新人群数据
const refreshAudience = async () => {
    try {
        // 这里可以添加刷新人群的API调用
        console.log('刷新人群数据:', audienceDetail.id);
        // 模拟刷新成功
        audienceStats.updateTime = new Date().toLocaleString();
    }
    catch (error) {
        console.error('刷新人群失败:', error);
    }
};
// 导出人群数据
const exportAudience = () => {
    const exportData = {
        audienceId: audienceDetail.id,
        audienceName: audienceDetail.name,
        totalCount: audienceStats.totalCount,
        rules: audienceRules,
        exportTime: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audience-${audienceDetail.name || 'unnamed'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
// 编辑人群
const editAudience = () => {
    router.push({
        name: 'AudienceCreate',
        params: { id: audienceDetail.id },
        query: { mode: 'edit' }
    });
};
// 返回人群管理页面
const goBack = () => {
    router.push({ name: 'AudienceManagement' });
};
// 添加条件
const addCondition = (group) => {
    const newCondition = {
        id: generateId(),
        dataSourceType: 'detail',
        fieldName: '',
        aggregationType: 'sum',
        operator: 'gt',
        value: '',
        dateType: 'dynamic',
        dynamicValue: 7,
        dynamicUnit: 'days',
        dateRange: null,
        singleDate: null,
        isExclude: false,
        enableSequence: false,
        sequenceSteps: []
    };
    group.conditions.push(newCondition);
};
// 根据类型添加条件
const addConditionByType = (group, type) => {
    const typeMapping = {
        'tag': 'attribute',
        'behavior': 'behavior',
        'detail': 'detail',
        'user': 'attribute'
    };
    const dataSourceType = typeMapping[type] || 'detail';
    const newCondition = {
        id: generateId(),
        dataSourceType: dataSourceType,
        fieldName: '',
        aggregationType: getDefaultAggregationType(dataSourceType),
        operator: getDefaultOperator(dataSourceType),
        value: '',
        dateType: dataSourceType === 'attribute' ? null : 'dynamic',
        dynamicValue: 7,
        dynamicUnit: 'days',
        dateRange: null,
        singleDate: null,
        isExclude: false,
        enableSequence: false,
        sequenceSteps: []
    };
    group.conditions.push(newCondition);
};
// 添加排除条件
const addExcludeCondition = (group) => {
    const newCondition = {
        id: generateId(),
        dataSourceType: 'detail',
        fieldName: '',
        aggregationType: 'sum',
        operator: 'gt',
        value: '',
        dateType: 'dynamic',
        dynamicValue: 7,
        dynamicUnit: 'days',
        dateRange: null,
        singleDate: null,
        isExclude: true,
        enableSequence: false,
        sequenceSteps: []
    };
    group.conditions.push(newCondition);
};
// 复制条件
const duplicateCondition = (group, condition) => {
    const newCondition = {
        ...condition,
        id: generateId()
    };
    group.conditions.push(newCondition);
};
// 切换排除条件
const toggleExcludeCondition = (condition) => {
    condition.isExclude = !condition.isExclude;
};
// 清空画布
const clearCanvas = () => {
    conditionGroups.value = [];
    estimatedCount.value = 0;
};
// 导出规则
const exportRules = () => {
    const rules = {
        tagId: route.params.id,
        tagName: tagDetail.name,
        logic: 'or', // 条件组间固定为OR关系
        conditionGroups: conditionGroups.value.map(group => ({
            id: group.id,
            name: group.name,
            logic: group.logic,
            conditions: group.conditions.map(condition => ({
                id: condition.id,
                dataSourceType: condition.dataSourceType,
                fieldName: condition.fieldName,
                aggregationType: condition.aggregationType,
                operator: condition.operator,
                value: condition.value,
                dateType: condition.dateType,
                dateRange: condition.dateRange,
                dynamicValue: condition.dynamicValue,
                dynamicUnit: condition.dynamicUnit,
                isExclude: condition.isExclude
            }))
        })),
        estimatedCount: estimatedCount.value,
        exportTime: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tag-rules-${tagDetail.name || 'unnamed'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
// 编辑条件组名称
const editGroupName = (group) => {
    // 这里可以弹出编辑对话框
    const newName = prompt('请输入新的条件组名称:', group.name);
    if (newName && newName.trim()) {
        group.name = newName.trim();
    }
};
// 删除条件
const removeCondition = (group, conditionIndex) => {
    group.conditions.splice(conditionIndex, 1);
    // 如果条件组为空，可以选择删除条件组
    if (group.conditions.length === 0) {
        // 这里可以提示用户是否删除空的条件组
    }
};
// 数据源类型变化处理
const onDataSourceTypeChange = (condition) => {
    // 重置相关字段
    condition.aggregationType = getDefaultAggregationType(condition.dataSourceType);
    condition.operator = getDefaultOperator(condition.dataSourceType);
    condition.value = '';
    // 属性数据不需要日期范围
    if (condition.dataSourceType === 'attribute') {
        condition.dateType = null;
    }
    else if (!condition.dateType) {
        condition.dateType = 'dynamic';
        condition.dynamicValue = 7;
        condition.dynamicUnit = 'days';
    }
};
// 日期类型变化处理
const onDateTypeChange = (condition) => {
    // 重置日期相关字段
    condition.dateRange = null;
    condition.singleDate = null;
    condition.dynamicValue = 7;
    condition.dynamicUnit = 'days';
};
// 配置行为路径
const configureSequence = (condition) => {
    // 这里可以打开行为路径配置对话框
    console.log('配置行为路径:', condition);
};
// 获取聚合类型选项
const getAggregationOptions = (dataSourceType) => {
    if (dataSourceType === 'detail') {
        return [
            { label: '求和', value: 'sum' },
            { label: '平均值', value: 'avg' },
            { label: '最大值', value: 'max' },
            { label: '最小值', value: 'min' },
            { label: '去重计数', value: 'distinct_count' },
            { label: '计数', value: 'count' }
        ];
    }
    else if (dataSourceType === 'behavior') {
        return [
            { label: '次数', value: 'count' },
            { label: '天数', value: 'days' },
            { label: '连续天数', value: 'consecutive_days' },
            { label: '去重计数', value: 'distinct_count' }
        ];
    }
    return [];
};
// 获取默认聚合类型
const getDefaultAggregationType = (dataSourceType) => {
    if (dataSourceType === 'detail') {
        return 'sum';
    }
    else if (dataSourceType === 'behavior') {
        return 'count';
    }
    return null;
};
// 获取默认操作符
const getDefaultOperator = (dataSourceType) => {
    if (dataSourceType === 'detail' || dataSourceType === 'behavior') {
        return 'gt';
    }
    else if (dataSourceType === 'attribute') {
        return 'eq';
    }
    return 'eq';
};
// 获取操作符选项
const getOperatorOptions = (condition) => {
    const commonOptions = [
        { label: '等于', value: 'eq' },
        { label: '不等于', value: 'ne' }
    ];
    const numericOptions = [
        { label: '大于', value: 'gt' },
        { label: '大于等于', value: 'gte' },
        { label: '小于', value: 'lt' },
        { label: '小于等于', value: 'lte' }
    ];
    const stringOptions = [
        { label: '包含', value: 'contains' },
        { label: '不包含', value: 'not_contains' },
        { label: '开始于', value: 'starts_with' },
        { label: '结束于', value: 'ends_with' }
    ];
    const existsOptions = [
        { label: '存在', value: 'exists' },
        { label: '不存在', value: 'not_exists' }
    ];
    if (condition.dataSourceType === 'detail' || condition.dataSourceType === 'behavior') {
        return [...commonOptions, ...numericOptions, ...existsOptions];
    }
    else if (condition.dataSourceType === 'attribute') {
        return [...commonOptions, ...stringOptions, ...existsOptions];
    }
    return commonOptions;
};
// 是否需要值输入
const needValueInput = (condition) => {
    return condition.operator !== 'exists' && condition.operator !== 'not_exists';
};
// 获取值输入提示
const getValuePlaceholder = (condition) => {
    if (condition.dataSourceType === 'detail') {
        if (condition.aggregationType === 'sum' || condition.aggregationType === 'avg') {
            return '请输入金额';
        }
        else if (condition.aggregationType === 'count' || condition.aggregationType === 'distinct_count') {
            return '请输入数量';
        }
        return '请输入数值';
    }
    else if (condition.dataSourceType === 'behavior') {
        if (condition.aggregationType === 'count') {
            return '请输入次数';
        }
        else if (condition.aggregationType === 'days' || condition.aggregationType === 'consecutive_days') {
            return '请输入天数';
        }
        return '请输入数值';
    }
    else if (condition.dataSourceType === 'attribute') {
        return '请输入属性值';
    }
    return '请输入值';
};
// 获取字段选项
const getFieldOptions = (dataSourceType) => {
    if (dataSourceType === 'detail') {
        return [
            { label: '交易金额', value: 'transaction_amount' },
            { label: '交易笔数', value: 'transaction_count' },
            { label: '商品数量', value: 'product_quantity' },
            { label: '优惠金额', value: 'discount_amount' }
        ];
    }
    else if (dataSourceType === 'behavior') {
        return [
            { label: '页面访问', value: 'page_view' },
            { label: '商品点击', value: 'product_click' },
            { label: '加购行为', value: 'add_to_cart' },
            { label: '下单行为', value: 'place_order' },
            { label: '支付行为', value: 'payment' }
        ];
    }
    else if (dataSourceType === 'attribute') {
        return [
            { label: '性别', value: 'gender' },
            { label: '年龄', value: 'age' },
            { label: '城市', value: 'city' },
            { label: '职业', value: 'occupation' },
            { label: '会员等级', value: 'member_level' }
        ];
    }
    return [];
};
// 组件挂载时获取标签详情
onMounted(() => {
    const tagId = route.params.id;
    if (tagId) {
        // 这里可以根据tagId获取具体的标签详情
        console.log('获取标签详情:', tagId);
    }
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['info-row']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-item']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-item']} */ 
/** @type {__VLS_StyleScopedClasses['empty-state']} */ 
/** @type {__VLS_StyleScopedClasses['config-header']} */ 
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ 
/** @type {__VLS_StyleScopedClasses['section-header']} */ 
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ 
/** @type {__VLS_StyleScopedClasses['section-header']} */ 
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ 
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ 
/** @type {__VLS_StyleScopedClasses['logic-badge']} */ 
/** @type {__VLS_StyleScopedClasses['conditions-workspace']} */ 
/** @type {__VLS_StyleScopedClasses['empty-illustration']} */ 
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['and']} */ 
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['or']} */ 
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['or']} */ 
/** @type {__VLS_StyleScopedClasses['vertical-logic-text']} */ 
/** @type {__VLS_StyleScopedClasses['vertical-logic-text']} */ 
/** @type {__VLS_StyleScopedClasses['config-tab']} */ 
/** @type {__VLS_StyleScopedClasses['config-tab']} */ 
/** @type {__VLS_StyleScopedClasses['active']} */ 
/** @type {__VLS_StyleScopedClasses['config-tab']} */ 
/** @type {__VLS_StyleScopedClasses['active']} */ 
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['clickable']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['and']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['and']} */ 
/** @type {__VLS_StyleScopedClasses['logic-text']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['or']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['or']} */ 
/** @type {__VLS_StyleScopedClasses['logic-text']} */ 
/** @type {__VLS_StyleScopedClasses['logic-text']} */ 
/** @type {__VLS_StyleScopedClasses['condition-item']} */ 
/** @type {__VLS_StyleScopedClasses['condition-item']} */ 
/** @type {__VLS_StyleScopedClasses['excluded']} */ 
/** @type {__VLS_StyleScopedClasses['condition-config']} */ 
/** @type {__VLS_StyleScopedClasses['condition-config']} */ 
/** @type {__VLS_StyleScopedClasses['form-row']} */ 
/** @type {__VLS_StyleScopedClasses['primary']} */ 
/** @type {__VLS_StyleScopedClasses['form-row']} */ 
/** @type {__VLS_StyleScopedClasses['form-group']} */ 
/** @type {__VLS_StyleScopedClasses['form-group']} */ 
/** @type {__VLS_StyleScopedClasses['form-control']} */ 
/** @type {__VLS_StyleScopedClasses['wide']} */ 
/** @type {__VLS_StyleScopedClasses['action-btn']} */ 
/** @type {__VLS_StyleScopedClasses['action-btn']} */ 
/** @type {__VLS_StyleScopedClasses['action-btn']} */ 
/** @type {__VLS_StyleScopedClasses['exclude-active']} */ 
/** @type {__VLS_StyleScopedClasses['action-btn']} */ 
/** @type {__VLS_StyleScopedClasses['action-btn']} */ 
/** @type {__VLS_StyleScopedClasses['danger']} */ 
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ 
/** @type {__VLS_StyleScopedClasses['add-condition-group-area']} */ 
/** @type {__VLS_StyleScopedClasses['add-condition-group-area']} */ 
/** @type {__VLS_StyleScopedClasses['add-condition-group-btn']} */ 
/** @type {__VLS_StyleScopedClasses['danger']} */ 
/** @type {__VLS_StyleScopedClasses['danger']} */ 
/** @type {__VLS_StyleScopedClasses['logic-connector']} */ 
/** @type {__VLS_StyleScopedClasses['clickable']} */ 
/** @type {__VLS_StyleScopedClasses['logic-connector']} */ 
/** @type {__VLS_StyleScopedClasses['clickable']} */ 
/** @type {__VLS_StyleScopedClasses['delete-group-btn']} */ 
/** @type {__VLS_StyleScopedClasses['section-header']} */ 
/** @type {__VLS_StyleScopedClasses['section-info']} */ 
/** @type {__VLS_StyleScopedClasses['condition-count']} */ 
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['clickable']} */ 
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ 
/** @type {__VLS_StyleScopedClasses['clickable']} */ 
/** @type {__VLS_StyleScopedClasses['section-title']} */ 
/** @type {__VLS_StyleScopedClasses['legend-color']} */ 
/** @type {__VLS_StyleScopedClasses['legend-color']} */ 
/** @type {__VLS_StyleScopedClasses['legend-color']} */ 
/** @type {__VLS_StyleScopedClasses['legend-color']} */ 
/** @type {__VLS_StyleScopedClasses['trend-chart']} */ 
/** @type {__VLS_StyleScopedClasses['trend-placeholder']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "audience-detail" },
});
const __VLS_0 = {}.ABreadcrumb;
/** @type {[typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "breadcrumb" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "breadcrumb" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.IconHome;
/** @type {[typeof __VLS_components.IconHome, typeof __VLS_components.iconHome, ]} */ 
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_7;
const __VLS_12 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
let __VLS_15;
const __VLS_16 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
let __VLS_19;
let __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "audience-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "audience-id" },
});
(__VLS_ctx.audienceDetail.id);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "audience-name" },
});
(__VLS_ctx.audienceDetail.name);
const __VLS_20 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    color: (__VLS_ctx.getStatusColor(__VLS_ctx.audienceDetail.status)),
}));
const __VLS_22 = __VLS_21({
    color: (__VLS_ctx.getStatusColor(__VLS_ctx.audienceDetail.status)),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
(__VLS_ctx.getStatusText(__VLS_ctx.audienceDetail.status));
let __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_24 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    type: "primary",
}));
const __VLS_26 = __VLS_25({
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
let __VLS_27;
const __VLS_28 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
let __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_32 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ class: "info-card" },
}));
const __VLS_34 = __VLS_33({
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_35.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-title" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
const __VLS_36 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    color: (__VLS_ctx.getTypeColor(__VLS_ctx.audienceDetail.type)),
}));
const __VLS_38 = __VLS_37({
    color: (__VLS_ctx.getTypeColor(__VLS_ctx.audienceDetail.type)),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
(__VLS_ctx.getTypeText(__VLS_ctx.audienceDetail.type));
let __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.getCreateMethodText(__VLS_ctx.audienceDetail.createMethod));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.audienceDetail.updateFrequency);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.audienceDetail.validPeriod);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
const __VLS_40 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    color: (__VLS_ctx.getShareLevelColor(__VLS_ctx.audienceDetail.shareLevel)),
}));
const __VLS_42 = __VLS_41({
    color: (__VLS_ctx.getShareLevelColor(__VLS_ctx.audienceDetail.shareLevel)),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
(__VLS_ctx.getShareLevelText(__VLS_ctx.audienceDetail.shareLevel));
let __VLS_43;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.audienceDetail.createUser);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row full-width" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value description" },
});
(__VLS_ctx.audienceDetail.description);
let __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_44 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ class: "subject-card" },
}));
const __VLS_46 = __VLS_45({
    ...{ class: "subject-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_47.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-title" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "subject-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "subject-stats" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value primary" },
});
(__VLS_ctx.formatNumber(__VLS_ctx.audienceStats.totalCount));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.audienceStats.coverageRate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.formatNumber(__VLS_ctx.audienceStats.activeCount));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.audienceStats.qualityScore);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.audienceStats.updateTime);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-tabs" },
});
const __VLS_48 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.activeTab),
    type: "button",
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.activeTab),
    type: "button",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    value: "distribution",
}));
const __VLS_54 = __VLS_53({
    value: "distribution",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
let __VLS_55;
const __VLS_56 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    value: "trend",
}));
const __VLS_58 = __VLS_57({
    value: "trend",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
let __VLS_59;
const __VLS_60 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    value: "lineage",
}));
const __VLS_62 = __VLS_61({
    value: "lineage",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
let __VLS_63;
let __VLS_51;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-content" },
});
if (__VLS_ctx.activeTab === 'distribution') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "distribution-chart" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "total-count" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "count-number" },
    });
    (__VLS_ctx.formatNumber(__VLS_ctx.audienceStats.totalCount));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "count-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "count-desc" },
    });
    (__VLS_ctx.audienceStats.dataDate);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "distribution-bars" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.distributionData))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "bar-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-label" },
        });
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-fill" },
            ...{ style: ({ width: item.percentage + '%', backgroundColor: item.color }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-value" },
        });
        (item.percentage);
    }
}
if (__VLS_ctx.activeTab === 'trend') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "trend-chart" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "trend-placeholder" },
    });
}
if (__VLS_ctx.activeTab === 'lineage') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lineage-chart" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lineage-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lineage-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "title-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "title-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lineage-legend" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "legend-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "legend-color audience" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "legend-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "legend-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "legend-color tag" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "legend-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "legend-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "legend-color attribute" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "legend-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "legend-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "legend-color table" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "legend-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "lineageChartRef",
        ...{ class: "lineage-chart-container" },
    });
    /** @type {typeof __VLS_ctx.lineageChartRef} */ 
}
let __VLS_47;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_64 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ class: "rule-config-card" },
}));
const __VLS_66 = __VLS_65({
    ...{ class: "rule-config-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_67.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-title" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rule-config-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "conditions-workspace" },
});
/** @type {[typeof ConditionConfig, ]} */ 
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(ConditionConfig, new ConditionConfig({
    conditionGroups: (__VLS_ctx.audienceRules.conditionGroups),
    crossGroupLogic: (__VLS_ctx.audienceRules.crossGroupLogic),
    editable: (false),
    dataSourceTypeOptions: (__VLS_ctx.dataSourceTypeOptions),
    dateTypeOptions: (__VLS_ctx.dateTypeOptions),
    dynamicUnitOptions: (__VLS_ctx.dynamicUnitOptions),
    getFieldOptions: (__VLS_ctx.getFieldOptions),
    getAggregationOptions: (__VLS_ctx.getAggregationOptions),
    getOperatorOptions: (__VLS_ctx.getOperatorOptions),
    needValueInput: (__VLS_ctx.needValueInput),
    getValuePlaceholder: (__VLS_ctx.getValuePlaceholder),
    onDataSourceTypeChange: (__VLS_ctx.onDataSourceTypeChange),
    onDateTypeChange: (__VLS_ctx.onDateTypeChange),
}));
const __VLS_69 = __VLS_68({
    conditionGroups: (__VLS_ctx.audienceRules.conditionGroups),
    crossGroupLogic: (__VLS_ctx.audienceRules.crossGroupLogic),
    editable: (false),
    dataSourceTypeOptions: (__VLS_ctx.dataSourceTypeOptions),
    dateTypeOptions: (__VLS_ctx.dateTypeOptions),
    dynamicUnitOptions: (__VLS_ctx.dynamicUnitOptions),
    getFieldOptions: (__VLS_ctx.getFieldOptions),
    getAggregationOptions: (__VLS_ctx.getAggregationOptions),
    getOperatorOptions: (__VLS_ctx.getOperatorOptions),
    needValueInput: (__VLS_ctx.needValueInput),
    getValuePlaceholder: (__VLS_ctx.getValuePlaceholder),
    onDataSourceTypeChange: (__VLS_ctx.onDataSourceTypeChange),
    onDateTypeChange: (__VLS_ctx.onDateTypeChange),
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
let __VLS_67;
/** @type {__VLS_StyleScopedClasses['audience-detail']} */ 
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['header-content']} */ 
/** @type {__VLS_StyleScopedClasses['page-title']} */ 
/** @type {__VLS_StyleScopedClasses['audience-info']} */ 
/** @type {__VLS_StyleScopedClasses['audience-id']} */ 
/** @type {__VLS_StyleScopedClasses['audience-name']} */ 
/** @type {__VLS_StyleScopedClasses['header-actions']} */ 
/** @type {__VLS_StyleScopedClasses['content-section']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['info-grid']} */ 
/** @type {__VLS_StyleScopedClasses['info-row']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['value']} */ 
/** @type {__VLS_StyleScopedClasses['info-row']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['value']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['value']} */ 
/** @type {__VLS_StyleScopedClasses['info-row']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['value']} */ 
/** @type {__VLS_StyleScopedClasses['info-row']} */ 
/** @type {__VLS_StyleScopedClasses['full-width']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['value']} */ 
/** @type {__VLS_StyleScopedClasses['description']} */ 
/** @type {__VLS_StyleScopedClasses['content-section']} */ 
/** @type {__VLS_StyleScopedClasses['subject-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-header']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['subject-content']} */ 
/** @type {__VLS_StyleScopedClasses['subject-stats']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['primary']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['stat-item']} */ 
/** @type {__VLS_StyleScopedClasses['stat-label']} */ 
/** @type {__VLS_StyleScopedClasses['stat-value']} */ 
/** @type {__VLS_StyleScopedClasses['chart-section']} */ 
/** @type {__VLS_StyleScopedClasses['chart-tabs']} */ 
/** @type {__VLS_StyleScopedClasses['chart-content']} */ 
/** @type {__VLS_StyleScopedClasses['distribution-chart']} */ 
/** @type {__VLS_StyleScopedClasses['total-count']} */ 
/** @type {__VLS_StyleScopedClasses['count-number']} */ 
/** @type {__VLS_StyleScopedClasses['count-label']} */ 
/** @type {__VLS_StyleScopedClasses['count-desc']} */ 
/** @type {__VLS_StyleScopedClasses['distribution-bars']} */ 
/** @type {__VLS_StyleScopedClasses['bar-item']} */ 
/** @type {__VLS_StyleScopedClasses['bar-label']} */ 
/** @type {__VLS_StyleScopedClasses['bar-container']} */ 
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ 
/** @type {__VLS_StyleScopedClasses['bar-value']} */ 
/** @type {__VLS_StyleScopedClasses['trend-chart']} */ 
/** @type {__VLS_StyleScopedClasses['trend-placeholder']} */ 
/** @type {__VLS_StyleScopedClasses['lineage-chart']} */ 
/** @type {__VLS_StyleScopedClasses['lineage-header']} */ 
/** @type {__VLS_StyleScopedClasses['lineage-title']} */ 
/** @type {__VLS_StyleScopedClasses['title-text']} */ 
/** @type {__VLS_StyleScopedClasses['title-desc']} */ 
/** @type {__VLS_StyleScopedClasses['lineage-legend']} */ 
/** @type {__VLS_StyleScopedClasses['legend-item']} */ 
/** @type {__VLS_StyleScopedClasses['legend-color']} */ 
/** @type {__VLS_StyleScopedClasses['audience']} */ 
/** @type {__VLS_StyleScopedClasses['legend-text']} */ 
/** @type {__VLS_StyleScopedClasses['legend-item']} */ 
/** @type {__VLS_StyleScopedClasses['legend-color']} */ 
/** @type {__VLS_StyleScopedClasses['tag']} */ 
/** @type {__VLS_StyleScopedClasses['legend-text']} */ 
/** @type {__VLS_StyleScopedClasses['legend-item']} */ 
/** @type {__VLS_StyleScopedClasses['legend-color']} */ 
/** @type {__VLS_StyleScopedClasses['attribute']} */ 
/** @type {__VLS_StyleScopedClasses['legend-text']} */ 
/** @type {__VLS_StyleScopedClasses['legend-item']} */ 
/** @type {__VLS_StyleScopedClasses['legend-color']} */ 
/** @type {__VLS_StyleScopedClasses['table']} */ 
/** @type {__VLS_StyleScopedClasses['legend-text']} */ 
/** @type {__VLS_StyleScopedClasses['lineage-chart-container']} */ 
/** @type {__VLS_StyleScopedClasses['content-section']} */ 
/** @type {__VLS_StyleScopedClasses['rule-config-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['rule-config-content']} */ 
/** @type {__VLS_StyleScopedClasses['conditions-workspace']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconHome: IconHome,
            ConditionConfig: ConditionConfig,
            activeTab: activeTab,
            audienceDetail: audienceDetail,
            audienceStats: audienceStats,
            audienceRules: audienceRules,
            distributionData: distributionData,
            lineageChartRef: lineageChartRef,
            dataSourceTypeOptions: dataSourceTypeOptions,
            dateTypeOptions: dateTypeOptions,
            dynamicUnitOptions: dynamicUnitOptions,
            getTypeColor: getTypeColor,
            getTypeText: getTypeText,
            getStatusColor: getStatusColor,
            getStatusText: getStatusText,
            getCreateMethodText: getCreateMethodText,
            getShareLevelColor: getShareLevelColor,
            getShareLevelText: getShareLevelText,
            formatNumber: formatNumber,
            onDataSourceTypeChange: onDataSourceTypeChange,
            onDateTypeChange: onDateTypeChange,
            getAggregationOptions: getAggregationOptions,
            getOperatorOptions: getOperatorOptions,
            needValueInput: needValueInput,
            getValuePlaceholder: getValuePlaceholder,
            getFieldOptions: getFieldOptions,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
