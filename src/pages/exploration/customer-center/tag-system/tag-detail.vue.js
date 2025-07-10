/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IconHome, IconSettings, IconTag, IconEye, IconDashboard, IconBarChart, IconMore, IconPlus, IconDown, IconDelete, IconCheckCircle, IconExclamationCircle, IconInfoCircle, IconCopy, IconMinus, IconEdit, IconCheck, IconClose } from '@arco-design/web-vue/es/icon';
import ConditionConfig from '@/components/common/ConditionConfig.vue';
const route = useRoute();
const router = useRouter();
// 当前选中的标签页
const activeTab = ref('distribution');
// 编辑模式相关
const isEditMode = ref(false);
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-management']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-management']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-item']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['config-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-illustration']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['and']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['config-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['config-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['config-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group-card']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['and']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['and']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['or']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-text']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['excluded']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-config']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-config']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['wide']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['exclude-active']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-group-area']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-group-area']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-info']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-count']} */ ;
/** @type {__VLS_StyleScopedClasses['vertical-logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-detail" },
});
const __VLS_0 = {}.ABreadcrumb;
/** @type {[typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "breadcrumb" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "breadcrumb" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.IconHome;
/** @type {[typeof __VLS_components.IconHome, typeof __VLS_components.iconHome, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
var __VLS_7;
const __VLS_12 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
const __VLS_16 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
var __VLS_19;
var __VLS_3;
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
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    type: "primary",
}));
const __VLS_22 = __VLS_21({
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
const __VLS_24 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_28 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ class: "info-card" },
}));
const __VLS_30 = __VLS_29({
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_31.slots;
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
const __VLS_32 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    color: (__VLS_ctx.getDataTypeColor(__VLS_ctx.tagDetail.dataType)),
}));
const __VLS_34 = __VLS_33({
    color: (__VLS_ctx.getDataTypeColor(__VLS_ctx.tagDetail.dataType)),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
(__VLS_ctx.getDataTypeText(__VLS_ctx.tagDetail.dataType));
var __VLS_35;
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
const __VLS_36 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    color: (__VLS_ctx.getShareLevelColor(__VLS_ctx.tagDetail.shareLevel)),
}));
const __VLS_38 = __VLS_37({
    color: (__VLS_ctx.getShareLevelColor(__VLS_ctx.tagDetail.shareLevel)),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
(__VLS_ctx.getShareLevelText(__VLS_ctx.tagDetail.shareLevel));
var __VLS_39;
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
var __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_40 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ class: "subject-card" },
}));
const __VLS_42 = __VLS_41({
    ...{ class: "subject-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_43.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-title" },
    });
    const __VLS_44 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        type: "text",
        size: "small",
    }));
    const __VLS_46 = __VLS_45({
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    var __VLS_47;
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
const __VLS_48 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
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
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    value: "distribution",
}));
const __VLS_54 = __VLS_53({
    value: "distribution",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
var __VLS_55;
const __VLS_56 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    value: "trend",
}));
const __VLS_58 = __VLS_57({
    value: "trend",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
var __VLS_59;
var __VLS_51;
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
var __VLS_43;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_60 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ class: "rule-config-card" },
}));
const __VLS_62 = __VLS_61({
    ...{ class: "rule-config-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_63.slots;
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
const __VLS_64 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_66 = __VLS_65({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onClick: (__VLS_ctx.addTagValue)
};
__VLS_67.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_67.slots;
    const __VLS_72 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
    const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
}
var __VLS_67;
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
        const __VLS_76 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_78 = __VLS_77({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        let __VLS_80;
        let __VLS_81;
        let __VLS_82;
        const __VLS_83 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.tagValues.length > 1))
                    return;
                __VLS_ctx.deleteTagValue(tagValue.id);
            }
        };
        __VLS_79.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_79.slots;
            const __VLS_84 = {}.IconDelete;
            /** @type {[typeof __VLS_components.IconDelete, ]} */ ;
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
            const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
        }
        var __VLS_79;
    }
}
if (__VLS_ctx.tagValues.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    const __VLS_88 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ style: {} },
    }));
    const __VLS_90 = __VLS_89({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
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
        const __VLS_92 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "edit-btn" },
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "edit-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_96;
        let __VLS_97;
        let __VLS_98;
        const __VLS_99 = {
            onClick: (__VLS_ctx.enterEditMode)
        };
        __VLS_95.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_95.slots;
            const __VLS_100 = {}.IconEdit;
            /** @type {[typeof __VLS_components.IconEdit, ]} */ ;
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({}));
            const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
        }
        var __VLS_95;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "edit-mode-actions" },
        });
        const __VLS_104 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "save-btn" },
        }));
        const __VLS_106 = __VLS_105({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "save-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        let __VLS_108;
        let __VLS_109;
        let __VLS_110;
        const __VLS_111 = {
            onClick: (__VLS_ctx.saveConfiguration)
        };
        __VLS_107.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_107.slots;
            const __VLS_112 = {}.IconCheck;
            /** @type {[typeof __VLS_components.IconCheck, ]} */ ;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
            const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
        }
        var __VLS_107;
        const __VLS_116 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
            ...{ 'onClick': {} },
            ...{ class: "cancel-btn" },
        }));
        const __VLS_118 = __VLS_117({
            ...{ 'onClick': {} },
            ...{ class: "cancel-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        let __VLS_120;
        let __VLS_121;
        let __VLS_122;
        const __VLS_123 = {
            onClick: (__VLS_ctx.cancelEdit)
        };
        __VLS_119.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_119.slots;
            const __VLS_124 = {}.IconClose;
            /** @type {[typeof __VLS_components.IconClose, ]} */ ;
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({}));
            const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
        }
        var __VLS_119;
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
    const __VLS_128 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        modelValue: (__VLS_ctx.getCurrentTagValue().name),
        placeholder: "请输入标签值名称",
        ...{ class: "config-input" },
        disabled: (!__VLS_ctx.isEditMode),
    }));
    const __VLS_130 = __VLS_129({
        modelValue: (__VLS_ctx.getCurrentTagValue().name),
        placeholder: "请输入标签值名称",
        ...{ class: "config-input" },
        disabled: (!__VLS_ctx.isEditMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "config-label" },
    });
    const __VLS_132 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        modelValue: (__VLS_ctx.getCurrentTagValue().description),
        placeholder: "请输入标签值描述",
        ...{ class: "config-input" },
        disabled: (!__VLS_ctx.isEditMode),
    }));
    const __VLS_134 = __VLS_133({
        modelValue: (__VLS_ctx.getCurrentTagValue().description),
        placeholder: "请输入标签值描述",
        ...{ class: "config-input" },
        disabled: (!__VLS_ctx.isEditMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
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
    /** @type {[typeof ConditionConfig, ]} */ ;
    // @ts-ignore
    const __VLS_136 = __VLS_asFunctionalComponent(ConditionConfig, new ConditionConfig({
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
    const __VLS_137 = __VLS_136({
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
    }, ...__VLS_functionalComponentArgsRest(__VLS_136));
    let __VLS_139;
    let __VLS_140;
    let __VLS_141;
    const __VLS_142 = {
        onAddConditionGroup: (__VLS_ctx.addConditionGroup)
    };
    const __VLS_143 = {
        onDeleteConditionGroup: (__VLS_ctx.deleteConditionGroup)
    };
    const __VLS_144 = {
        onToggleCrossGroupLogic: (__VLS_ctx.toggleCrossGroupLogic)
    };
    const __VLS_145 = {
        onToggleGroupLogic: (__VLS_ctx.toggleGroupLogic)
    };
    const __VLS_146 = {
        onAddConditionByType: (__VLS_ctx.addConditionByType)
    };
    const __VLS_147 = {
        onRemoveCondition: (__VLS_ctx.removeCondition)
    };
    var __VLS_138;
}
var __VLS_63;
/** @type {__VLS_StyleScopedClasses['tag-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-id']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-name']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['subject-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['subject-content']} */ ;
/** @type {__VLS_StyleScopedClasses['subject-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-content']} */ ;
/** @type {__VLS_StyleScopedClasses['distribution-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['total-count']} */ ;
/** @type {__VLS_StyleScopedClasses['count-number']} */ ;
/** @type {__VLS_StyleScopedClasses['count-label']} */ ;
/** @type {__VLS_StyleScopedClasses['count-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['distribution-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-label']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-value']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['rule-config-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['rule-config-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config-vertical']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-management']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-name']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['config-header']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-mode-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['config-row']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['config-label']} */ ;
/** @type {__VLS_StyleScopedClasses['config-input']} */ ;
/** @type {__VLS_StyleScopedClasses['config-item']} */ ;
/** @type {__VLS_StyleScopedClasses['config-label']} */ ;
/** @type {__VLS_StyleScopedClasses['config-input']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-groups-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-info']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-count']} */ ;
/** @type {__VLS_StyleScopedClasses['conditions-workspace']} */ ;
var __VLS_dollars;
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
            enterEditMode: enterEditMode,
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
; /* PartiallyEnd: #4569/main.vue */
