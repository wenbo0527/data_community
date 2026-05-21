/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, watch, nextTick, reactive } from 'vue';
import * as echarts from 'echarts';
import { getTagLineage } from '@/api/tag';
import { useRoute, useRouter } from 'vue-router';
import { IconHome, IconSettings, IconTag, IconEye, IconDashboard, IconBarChart, IconMore, IconPlus, IconDown, IconDelete, IconCheckCircle, IconExclamationCircle, IconInfoCircle, IconCopy, IconMinus, IconEdit, IconCheck, IconClose } from '@arco-design/web-vue/es/icon';
import ConditionConfig from '@/components/common/ConditionConfig.vue';
import { onMounted } from 'vue';
// 血缘数据处理函数
const processLineageData = (data) => {
    console.debug('[Lineage] 原始数据输入:', {
        nodes: data.data.nodes?.length || 0,
        links: data.data.links?.length || 0,
        types: [...new Set(data.data.nodes.map(n => n.type))]
    });
    console.log('[Lineage Debug] 原始数据:', JSON.parse(JSON.stringify(data)));
    // 构建标签为核心的三层树结构
    const root = {
        name: 'tag001',
        type: 'root',
        children: data.data.nodes
            .filter(node => node.type === 'tag')
            .map(tag => {
            const attributes = data.data.links
                .filter(l => l.source === tag.id && l.type === 'attribute')
                .map(l => ({
                ...data.data.nodes.find(n => n.id === l.target),
                children: data.data.links
                    .filter(lt => lt.source === l.target && lt.type === 'table')
                    .map(lt => ({
                    ...data.data.nodes.find(n => n.id === lt.target),
                    _depth: 2
                })),
                _depth: 1
            }));
            return {
                ...tag,
                children: attributes,
                _depth: 0
            };
        })
    };
    // 建立类型映射
    const nodeMap = data.data.nodes.reduce((acc, node) => {
        acc[node.id] = {
            ...node,
            children: []
        };
        return acc;
    }, {});
    // 根据链接关系构建层级
    data.data.links.forEach(link => {
        if (link.type === 'attribute') {
            nodeMap[link.source].children.push(nodeMap[link.target]);
        }
        else if (link.type === 'table') {
            nodeMap[link.source].children.forEach(attr => {
                attr.children.push(nodeMap[link.target]);
            });
        }
    });
    // 提取标签节点作为根的子节点
    root.children = data.data.nodes
        .filter(node => node.type === 'tag')
        .map(node => nodeMap[node.id]);
    console.log('[Lineage Debug] 处理后的树结构:', JSON.parse(JSON.stringify(root)));
    console.debug('[Lineage] 树结构生成完成', {
        depth: getTreeDepth(root),
        totalNodes: countNodes(root),
        maxChildren: Math.max(...getChildrenCounts(root))
    });
    return root;
};
// 组件挂载时演示数据
onMounted(() => {
    // 使用静态演示数据替代API调用
    console.log('展示静态标签详情演示数据');
});
const route = useRoute();
const router = useRouter();
// 当前选中的标签页
const activeTab = ref('distribution');
const lineageChartRef = ref(null);
const lineageData = ref(null);
const countNodes = (node) => {
    let count = 0;
    const stack = [node];
    while (stack.length) {
        const current = stack.pop();
        count++;
        current.children?.forEach(c => stack.push(c));
    }
    return count;
};
const getChildrenCounts = (node) => {
    const counts = [];
    const traverse = (n) => {
        counts.push(n.children?.length || 0);
        n.children?.forEach(traverse);
    };
    traverse(node);
    return counts;
};
const initLineageChart = () => {
    console.debug('[Lineage] 初始化图表', {
        containerSize: {
            width: lineageChartRef.value?.offsetWidth,
            height: lineageChartRef.value?.offsetHeight
        }
    });
    if (!lineageChartRef.value)
        return;
    const chart = echarts.init(lineageChartRef.value);
    console.log('[Lineage Debug] ECharts配置:', {
        seriesType: 'tree',
        nodeCount: lineageData.value.children.length,
        maxDepth: getTreeDepth(lineageData.value)
    });
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: ({ data }) => {
                return `<div style='padding:8px;'>
          <div style='font-weight:500;margin-bottom:4px;'>${data.name}</div>
          <div style='color:#666;'>类型：${data.category}</div>
          ${data.updatedAt ? `<div style='color:#666;margin-top:4px;'>更新时间：${new Date(data.updatedAt).toLocaleString()}</div>` : ''}
        </div>`;
            }
        },
        series: [{
                type: 'tree',
                data: [lineageData.value],
                orient: 'LR',
                symbolSize: 36,
                itemStyle: {
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                lineStyle: {
                    color: '#99adef',
                    curveness: 0
                },
                symbolSize: 24,
                itemStyle: {
                    color: ({ data }) => {
                        const typeColors = {
                            tag: '#52c41a',
                            attribute: '#1890ff',
                            table: '#f5222d'
                        };
                        return typeColors[data.type] || '#666';
                    }
                },
                label: {
                    position: 'right',
                    verticalAlign: 'middle',
                    formatter: ({ data }) => {
                        const typeIcons = {
                            tag: '🏷',
                            attribute: '📌',
                            table: '🗂',
                            root: '🌳'
                        };
                        return `${data._isRoot ? typeIcons.root : typeIcons[data.type]} ${data.name}`;
                    },
                    fontSize: 14
                },
                leaves: {
                    label: { position: 'bottom', show: true }
                },
                expandAndCollapse: false,
                lineStyle: {
                    color: '#ccc',
                    curveness: 0.3
                }
            }]
    };
    chart.setOption(option);
    console.debug('[Lineage] 图表配置应用完成', {
        seriesCount: option.series.length,
        nodeTypes: [...new Set(option.series[0].data.flatMap(s => s.children).map(n => n.type))]
    });
    window.addEventListener('resize', () => chart.resize());
};
watch(() => activeTab.value, (val) => {
    if (val === 'lineage' && !lineageData.value) {
        fetchTagLineage();
    }
});
const getTreeDepth = (node) => {
    let maxDepth = 0;
    function traverse(n, depth) {
        if (depth > maxDepth)
            maxDepth = depth;
        n.children?.forEach(child => traverse(child, depth + 1));
    }
    traverse(node, 0);
    return maxDepth;
};
const fetchTagLineage = async () => {
    console.info('[Lineage] 开始加载血缘数据', { tab: activeTab.value });
    console.log('[Lineage Debug] 开始加载血缘数据');
    try {
        const startTime = performance.now();
        // 本地mock数据
        const mockLineageData = {
            nodes: [
                {
                    id: 'TAG_001',
                    name: '高净值客户',
                    type: 'tag',
                    updatedAt: Date.now(),
                    description: '月均AUM大于50万的客户群体',
                    owner: '王伟',
                    version: 'v2.3',
                },
                {
                    id: 'ATT_001',
                    name: '资产属性',
                    type: 'attribute',
                    dataType: 'number',
                    lastUpdateTime: Date.now() - 3600000,
                },
                {
                    id: 'ATT_002',
                    name: '交易属性',
                    type: 'attribute',
                    dataType: 'number',
                    lastUpdateTime: Date.now() - 7200000,
                },
                {
                    id: 'TBL_001',
                    name: '客户资产明细表',
                    type: 'table',
                    database: 'wealth_db',
                    lastSyncTime: Date.now() - 86400000,
                },
                {
                    id: 'TBL_002',
                    name: '交易流水表',
                    type: 'table',
                    database: 'transaction_db',
                    lastSyncTime: Date.now() - 172800000,
                },
                {
                    id: 1,
                    name: '用户基础属性',
                    type: 'tag',
                    updatedAt: Date.now(),
                },
                {
                    id: 2,
                    name: '活跃用户群体',
                    type: 'audience',
                    lastUpdateTime: Date.now() - 86400000,
                },
                {
                    id: 3,
                    name: '用户行为日志表',
                    type: 'table',
                    lastSyncTime: Date.now() - 259200000,
                },
            ],
            links: [
                { source: 'TAG_001', target: 'ATT_001', type: 'attribute' },
                { source: 'TAG_001', target: 'ATT_002', type: 'attribute' },
                { source: 'ATT_001', target: 'TBL_001', type: 'table' },
                { source: 'ATT_002', target: 'TBL_002', type: 'table' },
                { source: 1, target: 2 },
                { source: 2, target: 3 },
            ],
            links: [
                { source: 1, target: 2 },
                { source: 2, target: 3 }
            ]
        };
        const data = { data: mockLineageData };
        lineageData.value = processLineageData(data);
        console.info('[Lineage] 数据加载完成', {
            duration: `${performance.now() - startTime}ms`,
            source: 'mock',
            dataVersion: data.data.version || '1.0'
        });
        console.log('[Lineage Debug] 数据加载完成', {
            nodes: data.data.nodes.length,
            links: data.data.links.length
        });
        nextTick(initLineageChart);
    }
    catch (error) {
        console.error('获取血缘数据失败:', error);
    }
};
// 编辑模式相关
const isEditMode = ref(false); // 始终为false，禁止编辑
const originalTagValues = ref(null); // 用于保存编辑前的数据
// 配置选项卡相关
const activeConfigTab = ref('tag_value_1');
const tagValues = ref([
    {
        id: 'tag_value_1',
        name: '',
        description: '',
        conditionGroups: [],
        crossGroupLogic: 'or' // 跨条件组逻辑
    }
]);
// 标签详情数据
const tagDetail = reactive({
    id: 'BEHAV_NSLFCPK',
    name: '数字产品',
    dataType: 'string',
    category: '基础信息',
    dimensionType: '客户级',
    shareLevel: 'public',
    createUser: '张力',
    description: '这是一个产品、商品分类、商品中类、商品小类、商品品牌、商品规格、商品价格、商品促销、商品库存、商品销量、商品评价、商品推荐、商品搜索、商品收藏、商品分享、商品比较、商品咨询、商品投诉、商品退换货等信息的标签主体。'
});
// 标签统计数据
const tagStats = reactive({
    coverageCount: 9999773,
    coverageRate: 98.99,
    uniqueCount: 8891,
    availableCount: 23,
    updateTime: '2023-10-14 3:23:12',
    totalCount: 9999773,
    dataDate: '2023-10-19'
});
// 数据分布数据
const distributionData = ref([
    { label: '标签组1', percentage: 85, color: '#ff7d00' },
    { label: '标签组2', percentage: 70, color: '#1890ff' },
    { label: '标签组3', percentage: 45, color: '#fadb14' }
]);
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
// 获取数据类型颜色
const getDataTypeColor = (dataType) => {
    const colorMap = {
        string: 'green',
        number: 'blue'
    };
    return colorMap[dataType] || 'gray';
};
// 获取数据类型文本
const getDataTypeText = (dataType) => {
    const textMap = {
        string: '字符型',
        number: '数值型'
    };
    return textMap[dataType] || dataType;
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
// 标签值管理方法
// 新增标签值
const addTagValue = () => {
    const newId = `tag_value_${Date.now()}`;
    const newTagValue = {
        id: newId,
        name: '',
        description: '',
        conditionGroups: [],
        crossGroupLogic: 'or'
    };
    tagValues.value.push(newTagValue);
    activeConfigTab.value = newId;
};
// 删除标签值
const deleteTagValue = (targetKey) => {
    const index = tagValues.value.findIndex(item => item.id === targetKey);
    if (index > -1 && tagValues.value.length > 1) {
        tagValues.value.splice(index, 1);
        // 如果删除的是当前激活的tab，切换到第一个tab
        if (activeConfigTab.value === targetKey) {
            activeConfigTab.value = tagValues.value[0].id;
        }
    }
};
// 更新tab标题
const updateTabTitle = (tagValue) => {
    // 这个方法主要用于触发响应式更新，实际标题更新由模板中的计算属性处理
};
// 编辑模式相关方法
// 进入编辑模式
const enterEditMode = () => {
    // 保存当前数据作为备份
    originalTagValues.value = JSON.parse(JSON.stringify(tagValues.value));
    isEditMode.value = true;
};
// 保存配置
const saveConfiguration = () => {
    // 这里可以添加保存到后端的逻辑
    console.log('保存标签配置:', tagValues.value);
    // 模拟保存成功
    isEditMode.value = false;
    originalTagValues.value = null;
    // 显示保存成功提示
    // Message.success('配置保存成功')
};
// 取消编辑
const cancelEdit = () => {
    if (originalTagValues.value) {
        // 恢复原始数据
        tagValues.value = JSON.parse(JSON.stringify(originalTagValues.value));
    }
    isEditMode.value = false;
    originalTagValues.value = null;
};
// 获取当前标签值
const getCurrentTagValue = () => {
    return tagValues.value.find(item => item.id === activeConfigTab.value) || tagValues.value[0];
};
// 获取当前标签值的条件组
const getCurrentTagValueConditionGroups = () => {
    const currentTagValue = getCurrentTagValue();
    return currentTagValue ? currentTagValue.conditionGroups : [];
};
// 切换跨条件组逻辑（针对当前标签值）
const toggleCrossGroupLogic = () => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue) {
        currentTagValue.crossGroupLogic = currentTagValue.crossGroupLogic === 'and' ? 'or' : 'and';
    }
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
/** @type {__VLS_StyleScopedClasses['tag-values-management']} */ 
/** @type {__VLS_StyleScopedClasses['tag-values-management']} */ 
/** @type {__VLS_StyleScopedClasses['section-header']} */ 
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
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-detail" },
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
    ...{ class: "tag-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tag-id" },
});
(__VLS_ctx.tagDetail.id);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tag-name" },
});
(__VLS_ctx.tagDetail.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_20 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    type: "primary",
}));
const __VLS_22 = __VLS_21({
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
let __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_24 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ class: "info-card" },
}));
const __VLS_26 = __VLS_25({
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_27.slots;
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
const __VLS_28 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    color: (__VLS_ctx.getDataTypeColor(__VLS_ctx.tagDetail.dataType)),
}));
const __VLS_30 = __VLS_29({
    color: (__VLS_ctx.getDataTypeColor(__VLS_ctx.tagDetail.dataType)),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
(__VLS_ctx.getDataTypeText(__VLS_ctx.tagDetail.dataType));
let __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.tagDetail.category);
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
(__VLS_ctx.tagDetail.category);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.tagDetail.dimensionType);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
const __VLS_32 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    color: (__VLS_ctx.getShareLevelColor(__VLS_ctx.tagDetail.shareLevel)),
}));
const __VLS_34 = __VLS_33({
    color: (__VLS_ctx.getShareLevelColor(__VLS_ctx.tagDetail.shareLevel)),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
(__VLS_ctx.getShareLevelText(__VLS_ctx.tagDetail.shareLevel));
let __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.tagDetail.createUser);
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
(__VLS_ctx.tagDetail.description);
let __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_36 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ class: "subject-card" },
}));
const __VLS_38 = __VLS_37({
    ...{ class: "subject-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_39.slots;
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
(__VLS_ctx.formatNumber(__VLS_ctx.tagStats.coverageCount));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.tagStats.coverageRate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.formatNumber(__VLS_ctx.tagStats.uniqueCount));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.tagStats.availableCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.tagStats.updateTime);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-tabs" },
});
const __VLS_40 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.activeTab),
    type: "button",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.activeTab),
    type: "button",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    value: "distribution",
}));
const __VLS_46 = __VLS_45({
    value: "distribution",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
let __VLS_47;
const __VLS_48 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    value: "trend",
}));
const __VLS_50 = __VLS_49({
    value: "trend",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
let __VLS_51;
const __VLS_52 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    value: "lineage",
}));
const __VLS_54 = __VLS_53({
    value: "lineage",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
let __VLS_55;
let __VLS_43;
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
    (__VLS_ctx.formatNumber(__VLS_ctx.tagStats.totalCount));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "count-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "count-desc" },
    });
    (__VLS_ctx.tagStats.dataDate);
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
        ref: "lineageChartRef",
        ...{ style: {} },
    });
    /** @type {typeof __VLS_ctx.lineageChartRef} */ 
}
let __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_56 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ class: "rule-config-card" },
}));
const __VLS_58 = __VLS_57({
    ...{ class: "rule-config-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_59.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-title" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rule-config-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-values-config-vertical" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-values-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_60 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (__VLS_ctx.addTagValue)
};
__VLS_63.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_63.slots;
    const __VLS_68 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, ]} */ 
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
}
let __VLS_63;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-values-list" },
});
for (const [tagValue, index] of __VLS_getVForSourceType((__VLS_ctx.tagValues))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (tagValue.id),
        ...{ class: "tag-value-item" },
        ...{ class: ({ active: __VLS_ctx.activeConfigTab === tagValue.id }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeConfigTab = tagValue.id;
            } },
        ...{ class: "tag-value-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tag-value-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tag-value-name" },
    });
    (tagValue.name || `标签值${index + 1}`);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tag-value-desc" },
    });
    (tagValue.description || '暂无描述');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "tag-value-actions" },
    });
    if (__VLS_ctx.tagValues.length > 1) {
        const __VLS_72 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_76;
        let __VLS_77;
        let __VLS_78;
        const __VLS_79 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.tagValues.length > 1))
                    return;
                __VLS_ctx.deleteTagValue(tagValue.id);
            }
        };
        __VLS_75.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_75.slots;
            const __VLS_80 = {}.IconDelete;
            /** @type {[typeof __VLS_components.IconDelete, ]} */ 
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
            const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
        }
        var __VLS_75;
    }
}
if (__VLS_ctx.tagValues.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    const __VLS_84 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, ]} */ 
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        ...{ style: {} },
    }));
    const __VLS_86 = __VLS_85({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
if (__VLS_ctx.getCurrentTagValue()) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tag-value-config-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    (__VLS_ctx.getCurrentTagValue().name || '标签值配置');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "edit-actions" },
    });
    if (!__VLS_ctx.isEditMode) {
        const __VLS_88 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            type: "primary",
            ...{ class: "edit-btn" },
            disabled: true,
        }));
        const __VLS_90 = __VLS_89({
            type: "primary",
            ...{ class: "edit-btn" },
            disabled: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        __VLS_91.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_91.slots;
            const __VLS_92 = {}.IconEdit;
            /** @type {[typeof __VLS_components.IconEdit, ]} */ 
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
            const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
        }
        let __VLS_91;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "edit-mode-actions" },
        });
        const __VLS_96 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "save-btn" },
        }));
        const __VLS_98 = __VLS_97({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "save-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        let __VLS_100;
        let __VLS_101;
        let __VLS_102;
        const __VLS_103 = {
            onClick: (__VLS_ctx.saveConfiguration)
        };
        __VLS_99.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_99.slots;
            const __VLS_104 = {}.IconCheck;
            /** @type {[typeof __VLS_components.IconCheck, ]} */ 
            // @ts-ignore
            const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
            const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
        }
        let __VLS_99;
        const __VLS_108 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            ...{ 'onClick': {} },
            ...{ class: "cancel-btn" },
        }));
        const __VLS_110 = __VLS_109({
            ...{ 'onClick': {} },
            ...{ class: "cancel-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        let __VLS_112;
        let __VLS_113;
        let __VLS_114;
        const __VLS_115 = {
            onClick: (__VLS_ctx.cancelEdit)
        };
        __VLS_111.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_111.slots;
            const __VLS_116 = {}.IconClose;
            /** @type {[typeof __VLS_components.IconClose, ]} */ 
            // @ts-ignore
            const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
            const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
        }
        let __VLS_111;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "config-label" },
    });
    const __VLS_120 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        modelValue: (__VLS_ctx.getCurrentTagValue().name),
        placeholder: "请输入标签值名称",
        ...{ class: "config-input" },
        disabled: (!__VLS_ctx.isEditMode),
    }));
    const __VLS_122 = __VLS_121({
        modelValue: (__VLS_ctx.getCurrentTagValue().name),
        placeholder: "请输入标签值名称",
        ...{ class: "config-input" },
        disabled: (!__VLS_ctx.isEditMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "config-label" },
    });
    const __VLS_124 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        modelValue: (__VLS_ctx.getCurrentTagValue().description),
        placeholder: "请输入标签值描述",
        ...{ class: "config-input" },
        disabled: (!__VLS_ctx.isEditMode),
    }));
    const __VLS_126 = __VLS_125({
        modelValue: (__VLS_ctx.getCurrentTagValue().description),
        placeholder: "请输入标签值描述",
        ...{ class: "config-input" },
        disabled: (!__VLS_ctx.isEditMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "condition-groups-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "condition-count" },
    });
    (__VLS_ctx.getCurrentTagValueConditionGroups().length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "conditions-workspace" },
    });
    /** @type {[typeof ConditionConfig, ]} */ 
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(ConditionConfig, new ConditionConfig({
        ...{ 'onAddConditionGroup': {} },
        ...{ 'onDeleteConditionGroup': {} },
        ...{ 'onToggleCrossGroupLogic': {} },
        ...{ 'onToggleGroupLogic': {} },
        ...{ 'onAddConditionByType': {} },
        ...{ 'onRemoveCondition': {} },
        conditionGroups: (__VLS_ctx.getCurrentTagValueConditionGroups()),
        crossGroupLogic: (__VLS_ctx.getCurrentTagValue().crossGroupLogic),
        editable: (__VLS_ctx.isEditMode),
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
    const __VLS_129 = __VLS_128({
        ...{ 'onAddConditionGroup': {} },
        ...{ 'onDeleteConditionGroup': {} },
        ...{ 'onToggleCrossGroupLogic': {} },
        ...{ 'onToggleGroupLogic': {} },
        ...{ 'onAddConditionByType': {} },
        ...{ 'onRemoveCondition': {} },
        conditionGroups: (__VLS_ctx.getCurrentTagValueConditionGroups()),
        crossGroupLogic: (__VLS_ctx.getCurrentTagValue().crossGroupLogic),
        editable: (__VLS_ctx.isEditMode),
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
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    let __VLS_131;
    let __VLS_132;
    let __VLS_133;
    const __VLS_134 = {
        onAddConditionGroup: (__VLS_ctx.addConditionGroup)
    };
    const __VLS_135 = {
        onDeleteConditionGroup: (__VLS_ctx.deleteConditionGroup)
    };
    const __VLS_136 = {
        onToggleCrossGroupLogic: (__VLS_ctx.toggleCrossGroupLogic)
    };
    const __VLS_137 = {
        onToggleGroupLogic: (__VLS_ctx.toggleGroupLogic)
    };
    const __VLS_138 = {
        onAddConditionByType: (__VLS_ctx.addConditionByType)
    };
    const __VLS_139 = {
        onRemoveCondition: (__VLS_ctx.removeCondition)
    };
    let __VLS_130;
}
let __VLS_59;
/** @type {__VLS_StyleScopedClasses['tag-detail']} */ 
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['header-content']} */ 
/** @type {__VLS_StyleScopedClasses['page-title']} */ 
/** @type {__VLS_StyleScopedClasses['tag-info']} */ 
/** @type {__VLS_StyleScopedClasses['tag-id']} */ 
/** @type {__VLS_StyleScopedClasses['tag-name']} */ 
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
/** @type {__VLS_StyleScopedClasses['content-section']} */ 
/** @type {__VLS_StyleScopedClasses['rule-config-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['rule-config-content']} */ 
/** @type {__VLS_StyleScopedClasses['tag-values-config-vertical']} */ 
/** @type {__VLS_StyleScopedClasses['tag-values-management']} */ 
/** @type {__VLS_StyleScopedClasses['section-header']} */ 
/** @type {__VLS_StyleScopedClasses['tag-values-list']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-item']} */ 
/** @type {__VLS_StyleScopedClasses['active']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-header']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-info']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-name']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-desc']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-actions']} */ 
/** @type {__VLS_StyleScopedClasses['empty-state']} */ 
/** @type {__VLS_StyleScopedClasses['tag-value-config-section']} */ 
/** @type {__VLS_StyleScopedClasses['config-header']} */ 
/** @type {__VLS_StyleScopedClasses['edit-actions']} */ 
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ 
/** @type {__VLS_StyleScopedClasses['edit-mode-actions']} */ 
/** @type {__VLS_StyleScopedClasses['save-btn']} */ 
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ 
/** @type {__VLS_StyleScopedClasses['config-row']} */ 
/** @type {__VLS_StyleScopedClasses['config-item']} */ 
/** @type {__VLS_StyleScopedClasses['config-label']} */ 
/** @type {__VLS_StyleScopedClasses['config-input']} */ 
/** @type {__VLS_StyleScopedClasses['config-item']} */ 
/** @type {__VLS_StyleScopedClasses['config-label']} */ 
/** @type {__VLS_StyleScopedClasses['config-input']} */ 
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ 
/** @type {__VLS_StyleScopedClasses['section-header']} */ 
/** @type {__VLS_StyleScopedClasses['section-title']} */ 
/** @type {__VLS_StyleScopedClasses['section-info']} */ 
/** @type {__VLS_StyleScopedClasses['condition-count']} */ 
/** @type {__VLS_StyleScopedClasses['conditions-workspace']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconHome: IconHome,
            IconPlus: IconPlus,
            IconDelete: IconDelete,
            IconEdit: IconEdit,
            IconCheck: IconCheck,
            IconClose: IconClose,
            ConditionConfig: ConditionConfig,
            activeTab: activeTab,
            lineageChartRef: lineageChartRef,
            isEditMode: isEditMode,
            activeConfigTab: activeConfigTab,
            tagValues: tagValues,
            tagDetail: tagDetail,
            tagStats: tagStats,
            distributionData: distributionData,
            dataSourceTypeOptions: dataSourceTypeOptions,
            dateTypeOptions: dateTypeOptions,
            dynamicUnitOptions: dynamicUnitOptions,
            getDataTypeColor: getDataTypeColor,
            getDataTypeText: getDataTypeText,
            getShareLevelColor: getShareLevelColor,
            getShareLevelText: getShareLevelText,
            formatNumber: formatNumber,
            addConditionGroup: addConditionGroup,
            deleteConditionGroup: deleteConditionGroup,
            toggleGroupLogic: toggleGroupLogic,
            addTagValue: addTagValue,
            deleteTagValue: deleteTagValue,
            saveConfiguration: saveConfiguration,
            cancelEdit: cancelEdit,
            getCurrentTagValue: getCurrentTagValue,
            getCurrentTagValueConditionGroups: getCurrentTagValueConditionGroups,
            toggleCrossGroupLogic: toggleCrossGroupLogic,
            addConditionByType: addConditionByType,
            removeCondition: removeCondition,
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
