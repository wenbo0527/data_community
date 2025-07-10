/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconSearch, IconDelete, IconDown, IconSettings, IconImport, IconUpload } from '@arco-design/web-vue/es/icon';
import ConditionConfig from '@/components/common/ConditionConfig.vue';
const router = useRouter();
// 搜索表单
const searchForm = reactive({
    tagName: ''
});
// 表格数据
const tableData = ref([]);
const loading = ref(false);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100]
});
// 标签编辑
const editModalVisible = ref(false);
const createMode = ref('edit');
const activeTab = ref('basic');
const editForm = ref({
    id: '',
    name: '',
    dataType: 'string',
    category: 'basic',
    tagType: 'static',
    dimensionKey: '',
    shareLevel: 'public',
    createUser: '',
    createTime: '',
    description: ''
});
const editIndex = ref(-1);
// 自定义规则表单
const ruleForm = ref({
    basic: {
        id: '',
        name: '',
        dataType: 'string',
        category: 'basic',
        dimensionKey: '',
        description: ''
    },
    notification: {
        enabled: false,
        methods: [],
        scenarios: [],
        recipients: [],
        webhookUrl: ''
    },
    tagValues: []
});
// 选中的标签值索引
const selectedTagValueIndex = ref(-1);
// 数据导入表单
const importForm = ref({
    method: 'file',
    fileList: [],
    fieldMapping: [],
    dataSource: '',
    tableName: '',
    queryCondition: '',
    apiMethod: 'GET',
    apiUrl: '',
    apiHeaders: '',
    apiParams: '',
    batchSize: 1000,
    duplicateHandling: 'skip'
});
// 生成模拟数据
const generateTagData = (count) => {
    const dataTypes = ['string', 'number'];
    const categories = ['basic', 'behavior', 'preference', 'business'];
    const tagTypes = ['static', 'dynamic', 'computed', 'rule'];
    const shareLevels = ['public', 'private'];
    const users = ['张三', '李四', '王五', '赵六', '钱七'];
    return Array.from({ length: count }, (_, index) => ({
        id: `TAG_${String(index + 1).padStart(3, '0')}`,
        name: `标签${index + 1}`,
        dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        tagType: tagTypes[Math.floor(Math.random() * tagTypes.length)],
        dimensionKey: `dim_key_${index + 1}`,
        shareLevel: shareLevels[Math.floor(Math.random() * shareLevels.length)],
        createUser: users[Math.floor(Math.random() * users.length)],
        createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `这是标签${index + 1}的描述信息`
    }));
};
// 获取数据
const fetchData = async () => {
    loading.value = true;
    try {
        // 模拟API请求
        setTimeout(() => {
            const data = generateTagData(50);
            // 根据搜索条件筛选
            let filteredData = data;
            if (searchForm.tagName) {
                filteredData = filteredData.filter(item => item.name.includes(searchForm.tagName) ||
                    item.id.includes(searchForm.tagName));
            }
            // 更新表格数据和分页信息
            pagination.total = filteredData.length;
            const start = (pagination.current - 1) * pagination.pageSize;
            const end = start + pagination.pageSize;
            tableData.value = filteredData.slice(start, end);
            loading.value = false;
        }, 500);
    }
    catch (error) {
        console.error('获取标签数据失败:', error);
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    pagination.current = 1;
    fetchData();
};
// 重置搜索
const handleReset = () => {
    searchForm.tagName = '';
    pagination.current = 1;
    fetchData();
};
// 分页变化
const handlePageChange = (page) => {
    pagination.current = page;
    fetchData();
};
const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchData();
};
// 获取模态框标题
const getModalTitle = () => {
    if (editIndex.value >= 0)
        return '编辑标签';
    if (createMode.value === 'rule')
        return '自定义规则创建标签';
    if (createMode.value === 'import')
        return '数据导入创建标签';
    return '新增标签';
};
// 添加标签（编辑模式）
const addTag = () => {
    createMode.value = 'edit';
    editForm.value = {
        id: '',
        name: '',
        dataType: 'string',
        category: 'basic',
        tagType: 'static',
        dimensionKey: '',
        shareLevel: 'public',
        createUser: '当前用户',
        createTime: new Date().toISOString(),
        description: ''
    };
    editIndex.value = -1;
    editModalVisible.value = true;
};
// 自定义规则创建标签
const addTagByRule = () => {
    router.push({ name: 'tag-create' });
};
// 数据导入创建标签
const addTagByImport = () => {
    createMode.value = 'import';
    // 重置导入表单
    importForm.value = {
        method: 'file',
        fileList: [],
        fieldMapping: [],
        dataSource: '',
        tableName: '',
        queryCondition: '',
        apiMethod: 'GET',
        apiUrl: '',
        apiHeaders: '',
        apiParams: '',
        batchSize: 1000,
        duplicateHandling: 'skip'
    };
    editIndex.value = -1;
    editModalVisible.value = true;
};
// 删除标签
const removeTag = (index) => {
    tableData.value.splice(index, 1);
    Message.success('删除成功');
};
// 编辑标签
const editTag = (record) => {
    createMode.value = 'edit';
    editForm.value = { ...record };
    editIndex.value = tableData.value.findIndex(item => item.id === record.id);
    editModalVisible.value = true;
};
// 跳转到标签详情页
const goToTagDetail = (record) => {
    router.push({
        name: 'tag-detail',
        params: {
            id: record.id
        }
    });
};
// 更新标签
const updateTag = (record) => {
    Message.info('标签更新功能开发中...');
};
// 保存标签
const saveTag = () => {
    if (createMode.value === 'edit') {
        if (editIndex.value >= 0) {
            // 编辑现有标签
            tableData.value[editIndex.value] = { ...editForm.value };
            Message.success('标签更新成功');
        }
        else {
            // 新增标签
            const newTag = {
                ...editForm.value,
                createTime: new Date().toISOString()
            };
            tableData.value.unshift(newTag);
            Message.success('标签创建成功');
        }
    }
    else if (createMode.value === 'rule') {
        // 自定义规则创建标签
        const newTag = {
            id: ruleForm.value.basic.id,
            name: ruleForm.value.basic.name,
            dataType: ruleForm.value.basic.dataType,
            category: ruleForm.value.basic.category,
            tagType: 'rule',
            dimensionKey: ruleForm.value.basic.dimensionKey,
            shareLevel: 'public',
            createUser: '当前用户',
            createTime: new Date().toISOString(),
            description: ruleForm.value.basic.description
        };
        tableData.value.unshift(newTag);
        Message.success('规则标签创建成功');
    }
    else if (createMode.value === 'import') {
        // 数据导入创建标签
        Message.success('数据导入任务已提交，请稍后查看结果');
    }
    editModalVisible.value = false;
};
// 标签值配置相关函数
const addTagValue = () => {
    const newTagValue = {
        name: '',
        value: '',
        description: '',
        conditionGroups: [],
        crossGroupLogic: 'or'
    };
    ruleForm.value.tagValues.push(newTagValue);
    selectedTagValueIndex.value = ruleForm.value.tagValues.length - 1;
};
const removeTagValue = (index) => {
    ruleForm.value.tagValues.splice(index, 1);
    if (selectedTagValueIndex.value === index) {
        selectedTagValueIndex.value = ruleForm.value.tagValues.length > 0 ? 0 : -1;
    }
    else if (selectedTagValueIndex.value > index) {
        selectedTagValueIndex.value--;
    }
};
const selectTagValue = (index) => {
    selectedTagValueIndex.value = index;
};
const getCurrentTagValue = () => {
    if (selectedTagValueIndex.value >= 0 && selectedTagValueIndex.value < ruleForm.value.tagValues.length) {
        return ruleForm.value.tagValues[selectedTagValueIndex.value];
    }
    return {
        name: '',
        value: '',
        description: '',
        conditionGroups: [],
        crossGroupLogic: 'or'
    };
};
const getCurrentTagValueConditionGroups = () => {
    const currentTagValue = getCurrentTagValue();
    return currentTagValue.conditionGroups || [];
};
const addConditionGroup = () => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue) {
        currentTagValue.conditionGroups.push({
            conditions: [{
                    field: '',
                    operator: '',
                    value: '',
                    logic: 'and'
                }]
        });
    }
};
const addExcludeConditionGroup = () => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue) {
        currentTagValue.conditionGroups.push({
            isExclude: true,
            conditions: [{
                    field: '',
                    operator: '',
                    value: '',
                    logic: 'and'
                }]
        });
    }
};
const deleteConditionGroup = (groupIndex) => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue && currentTagValue.conditionGroups) {
        currentTagValue.conditionGroups.splice(groupIndex, 1);
    }
};
const deleteExcludeConditionGroup = (groupIndex) => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue && currentTagValue.conditionGroups) {
        // 找到排除条件组中的索引
        const excludeGroups = currentTagValue.conditionGroups.filter(group => group.isExclude);
        if (groupIndex >= 0 && groupIndex < excludeGroups.length) {
            const targetGroup = excludeGroups[groupIndex];
            const actualIndex = currentTagValue.conditionGroups.indexOf(targetGroup);
            currentTagValue.conditionGroups.splice(actualIndex, 1);
        }
    }
};
const addCondition = (groupIndex) => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue && currentTagValue.conditionGroups[groupIndex]) {
        currentTagValue.conditionGroups[groupIndex].conditions.push({
            field: '',
            operator: '',
            value: '',
            logic: 'and'
        });
    }
};
const deleteCondition = (groupIndex, conditionIndex) => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue && currentTagValue.conditionGroups[groupIndex]) {
        currentTagValue.conditionGroups[groupIndex].conditions.splice(conditionIndex, 1);
    }
};
const toggleConditionLogic = (groupIndex, conditionIndex) => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue && currentTagValue.conditionGroups[groupIndex] && currentTagValue.conditionGroups[groupIndex].conditions[conditionIndex]) {
        const condition = currentTagValue.conditionGroups[groupIndex].conditions[conditionIndex];
        condition.logic = condition.logic === 'and' ? 'or' : 'and';
    }
};
const toggleCrossGroupLogic = () => {
    const currentTagValue = getCurrentTagValue();
    if (currentTagValue) {
        currentTagValue.crossGroupLogic = currentTagValue.crossGroupLogic === 'and' ? 'or' : 'and';
    }
};
// ConditionConfig组件所需的数据选项
const dataSourceTypeOptions = [
    { label: '明细数据', value: 'detail' },
    { label: '行为数据', value: 'behavior' },
    { label: '属性数据', value: 'attribute' }
];
const dateTypeOptions = [
    { label: '动态时间', value: 'dynamic' },
    { label: '固定时间', value: 'fixed' }
];
const dynamicUnitOptions = [
    { label: '天', value: 'days' },
    { label: '周', value: 'weeks' },
    { label: '月', value: 'months' }
];
// 获取字段选项
const getFieldOptions = (dataSourceType) => {
    const fieldMap = {
        detail: [
            { label: '用户ID', value: 'user_id' },
            { label: '订单金额', value: 'order_amount' },
            { label: '订单时间', value: 'order_time' },
            { label: '商品类别', value: 'product_category' }
        ],
        behavior: [
            { label: '页面访问', value: 'page_view' },
            { label: '点击事件', value: 'click_event' },
            { label: '停留时长', value: 'stay_duration' },
            { label: '访问频次', value: 'visit_frequency' }
        ],
        attribute: [
            { label: '年龄', value: 'age' },
            { label: '性别', value: 'gender' },
            { label: '城市', value: 'city' },
            { label: '收入', value: 'income' }
        ]
    };
    return fieldMap[dataSourceType] || [];
};
// 获取聚合选项
const getAggregationOptions = (dataSourceType) => {
    if (dataSourceType === 'attribute') {
        return [];
    }
    return [
        { label: '计数', value: 'count' },
        { label: '求和', value: 'sum' },
        { label: '平均值', value: 'avg' },
        { label: '最大值', value: 'max' },
        { label: '最小值', value: 'min' }
    ];
};
// 获取操作符选项
const getOperatorOptions = (condition) => {
    return [
        { label: '等于', value: 'eq' },
        { label: '不等于', value: 'ne' },
        { label: '大于', value: 'gt' },
        { label: '小于', value: 'lt' },
        { label: '大于等于', value: 'gte' },
        { label: '小于等于', value: 'lte' },
        { label: '包含', value: 'in' },
        { label: '不包含', value: 'not_in' },
        { label: '模糊匹配', value: 'like' }
    ];
};
// 判断是否需要值输入
const needValueInput = (condition) => {
    return true;
};
// 获取值输入占位符
const getValuePlaceholder = (condition) => {
    return '请输入值';
};
// 数据源类型变化处理
const onDataSourceTypeChange = (condition) => {
    condition.fieldName = '';
    condition.aggregationType = '';
};
// 日期类型变化处理
const onDateTypeChange = (condition) => {
    if (condition.dateType === 'dynamic') {
        condition.dateRange = undefined;
        condition.dynamicValue = 1;
        condition.dynamicUnit = 'days';
    }
    else {
        condition.dynamicValue = undefined;
        condition.dynamicUnit = undefined;
        condition.dateRange = [];
    }
};
// 切换条件组逻辑
const toggleGroupLogic = (group) => {
    group.logic = group.logic === 'and' ? 'or' : 'and';
};
// 按类型添加条件
const addConditionByType = (group, type) => {
    const newCondition = {
        id: Date.now().toString(),
        type: type,
        dataSourceType: type === 'tag' ? 'attribute' : type,
        fieldName: '',
        aggregationType: '',
        operator: '',
        value: '',
        dateType: 'dynamic',
        dynamicValue: 1,
        dynamicUnit: 'days',
        isExclude: false
    };
    group.conditions.push(newCondition);
};
// 移除条件
const removeCondition = (group, conditionIndex) => {
    group.conditions.splice(conditionIndex, 1);
};
// 导入相关函数
const handleFileChange = (fileList) => {
    importForm.value.fileList = fileList;
    if (fileList.length > 0) {
        // 模拟解析文件字段
        importForm.value.fieldMapping = [
            { sourceField: 'user_id', targetField: 'user_id', dataType: 'string' },
            { sourceField: 'tag_name', targetField: 'name', dataType: 'string' },
            { sourceField: 'tag_value', targetField: 'value', dataType: 'string' },
            { sourceField: 'created_at', targetField: 'create_time', dataType: 'date' }
        ];
    }
};
// 取消编辑
const cancelEdit = () => {
    editModalVisible.value = false;
    editIndex.value = -1;
    createMode.value = 'edit';
    activeTab.value = 'basic';
};
// 获取数据类型颜色
const getDataTypeColor = (type) => {
    const colors = {
        string: 'green',
        number: 'blue'
    };
    return colors[type] || 'gray';
};
// 获取数据类型文本
const getDataTypeText = (type) => {
    const texts = {
        string: '字符型',
        number: '数值型'
    };
    return texts[type] || type;
};
// 获取标签分类颜色
const getCategoryColor = (category) => {
    const colors = {
        basic: 'blue',
        behavior: 'green',
        preference: 'orange',
        business: 'purple'
    };
    return colors[category] || 'gray';
};
// 获取标签分类文本
const getCategoryText = (category) => {
    const texts = {
        basic: '基础信息',
        behavior: '行为特征',
        preference: '偏好特征',
        business: '业务特征'
    };
    return texts[category] || category;
};
// 获取标签类型颜色
const getTagTypeColor = (type) => {
    const colors = {
        static: 'blue',
        dynamic: 'green',
        computed: 'orange',
        rule: 'purple'
    };
    return colors[type] || 'gray';
};
// 获取标签类型文本
const getTagTypeText = (type) => {
    const texts = {
        static: '静态标签',
        dynamic: '动态标签',
        computed: '计算标签',
        rule: '规则标签'
    };
    return texts[type] || type;
};
// 获取共享级别颜色
const getShareLevelColor = (level) => {
    const colors = {
        public: 'green',
        private: 'orange'
    };
    return colors[level] || 'gray';
};
// 获取共享级别文本
const getShareLevelText = (level) => {
    const texts = {
        public: '公开',
        private: '私有'
    };
    return texts[level] || level;
};
// 格式化时间
const formatTime = (time) => {
    return new Date(time).toLocaleString('zh-CN');
};
// 初始化
onMounted(() => {
    fetchData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-header']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-condition-state']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-list']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchForm.tagName),
    placeholder: "请输入标签名称搜索",
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchForm.tagName),
    placeholder: "请输入标签名称搜索",
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onInput: (__VLS_ctx.handleSearch)
};
__VLS_7.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_7;
const __VLS_16 = {}.ADropdown;
/** @type {[typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
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
{
    const { icon: __VLS_thisSlot } = __VLS_23.slots;
    const __VLS_24 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
{
    const { suffix: __VLS_thisSlot } = __VLS_23.slots;
    const __VLS_28 = {}.IconDown;
    /** @type {[typeof __VLS_components.IconDown, typeof __VLS_components.iconDown, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
var __VLS_23;
{
    const { content: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_32 = {}.ADoption;
    /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.addTagByRule)
    };
    __VLS_35.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_40 = {}.IconSettings;
        /** @type {[typeof __VLS_components.IconSettings, typeof __VLS_components.iconSettings, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
    var __VLS_35;
    const __VLS_44 = {}.ADoption;
    /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onClick': {} },
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onClick: (__VLS_ctx.addTagByImport)
    };
    __VLS_47.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_47.slots;
        const __VLS_52 = {}.IconImport;
        /** @type {[typeof __VLS_components.IconImport, typeof __VLS_components.iconImport, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
    }
    var __VLS_47;
}
var __VLS_19;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_56 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ class: "table-card" },
}));
const __VLS_58 = __VLS_57({
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_59.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "table-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "table-count" },
    });
    (__VLS_ctx.pagination.total);
}
const __VLS_60 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    ...{ class: "tag-table" },
    size: "small",
    scroll: ({ x: 1600 }),
}));
const __VLS_62 = __VLS_61({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    ...{ class: "tag-table" },
    size: "small",
    scroll: ({ x: 1600 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_68 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_63.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_63.slots;
    const __VLS_69 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        title: "标签名称",
        dataIndex: "name",
        width: (150),
        fixed: "left",
    }));
    const __VLS_71 = __VLS_70({
        title: "标签名称",
        dataIndex: "name",
        width: (150),
        fixed: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_72.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_73 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            ...{ 'onClick': {} },
        }));
        const __VLS_75 = __VLS_74({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        let __VLS_77;
        let __VLS_78;
        let __VLS_79;
        const __VLS_80 = {
            onClick: (...[$event]) => {
                __VLS_ctx.goToTagDetail(record);
            }
        };
        __VLS_76.slots.default;
        (record.name);
        var __VLS_76;
    }
    var __VLS_72;
    const __VLS_81 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        title: "标签ID",
        dataIndex: "id",
        width: (120),
    }));
    const __VLS_83 = __VLS_82({
        title: "标签ID",
        dataIndex: "id",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    __VLS_84.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_84.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.id);
    }
    var __VLS_84;
    const __VLS_85 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        title: "数据类型",
        dataIndex: "dataType",
        width: (120),
    }));
    const __VLS_87 = __VLS_86({
        title: "数据类型",
        dataIndex: "dataType",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_88.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_88.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_89 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
            color: (__VLS_ctx.getDataTypeColor(record.dataType)),
        }));
        const __VLS_91 = __VLS_90({
            color: (__VLS_ctx.getDataTypeColor(record.dataType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        __VLS_92.slots.default;
        (__VLS_ctx.getDataTypeText(record.dataType));
        var __VLS_92;
    }
    var __VLS_88;
    const __VLS_93 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        title: "标签分类",
        dataIndex: "category",
        width: (120),
    }));
    const __VLS_95 = __VLS_94({
        title: "标签分类",
        dataIndex: "category",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    __VLS_96.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_96.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_97 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
            color: (__VLS_ctx.getCategoryColor(record.category)),
        }));
        const __VLS_99 = __VLS_98({
            color: (__VLS_ctx.getCategoryColor(record.category)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        __VLS_100.slots.default;
        (__VLS_ctx.getCategoryText(record.category));
        var __VLS_100;
    }
    var __VLS_96;
    const __VLS_101 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        title: "标签类型",
        dataIndex: "tagType",
        width: (120),
    }));
    const __VLS_103 = __VLS_102({
        title: "标签类型",
        dataIndex: "tagType",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    __VLS_104.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_104.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_105 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
            color: (__VLS_ctx.getTagTypeColor(record.tagType)),
        }));
        const __VLS_107 = __VLS_106({
            color: (__VLS_ctx.getTagTypeColor(record.tagType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_106));
        __VLS_108.slots.default;
        (__VLS_ctx.getTagTypeText(record.tagType));
        var __VLS_108;
    }
    var __VLS_104;
    const __VLS_109 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        title: "维度主键",
        dataIndex: "dimensionKey",
        width: (150),
    }));
    const __VLS_111 = __VLS_110({
        title: "维度主键",
        dataIndex: "dimensionKey",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_112.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_112.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.dimensionKey);
    }
    var __VLS_112;
    const __VLS_113 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        title: "共享级别",
        dataIndex: "shareLevel",
        width: (120),
    }));
    const __VLS_115 = __VLS_114({
        title: "共享级别",
        dataIndex: "shareLevel",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    __VLS_116.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_116.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_117 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
            color: (__VLS_ctx.getShareLevelColor(record.shareLevel)),
        }));
        const __VLS_119 = __VLS_118({
            color: (__VLS_ctx.getShareLevelColor(record.shareLevel)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        __VLS_120.slots.default;
        (__VLS_ctx.getShareLevelText(record.shareLevel));
        var __VLS_120;
    }
    var __VLS_116;
    const __VLS_121 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        title: "创建人",
        dataIndex: "createUser",
        width: (120),
    }));
    const __VLS_123 = __VLS_122({
        title: "创建人",
        dataIndex: "createUser",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    __VLS_124.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_124.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.createUser);
    }
    var __VLS_124;
    const __VLS_125 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
        title: "操作",
        width: (200),
        fixed: "right",
    }));
    const __VLS_127 = __VLS_126({
        title: "操作",
        width: (200),
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    __VLS_128.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_128.slots;
        const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_129 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({}));
        const __VLS_131 = __VLS_130({}, ...__VLS_functionalComponentArgsRest(__VLS_130));
        __VLS_132.slots.default;
        const __VLS_133 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_135 = __VLS_134({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_137;
        let __VLS_138;
        let __VLS_139;
        const __VLS_140 = {
            onClick: (...[$event]) => {
                __VLS_ctx.goToTagDetail(record);
            }
        };
        __VLS_136.slots.default;
        var __VLS_136;
        const __VLS_141 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_143 = __VLS_142({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        let __VLS_145;
        let __VLS_146;
        let __VLS_147;
        const __VLS_148 = {
            onClick: (...[$event]) => {
                __VLS_ctx.updateTag(record);
            }
        };
        __VLS_144.slots.default;
        var __VLS_144;
        const __VLS_149 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_151 = __VLS_150({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_150));
        let __VLS_153;
        let __VLS_154;
        let __VLS_155;
        const __VLS_156 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeTag(rowIndex);
            }
        };
        __VLS_152.slots.default;
        var __VLS_152;
        var __VLS_132;
    }
    var __VLS_128;
}
var __VLS_63;
var __VLS_59;
const __VLS_157 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.editModalVisible),
    title: (__VLS_ctx.getModalTitle()),
    width: "1000px",
    okText: (__VLS_ctx.editIndex === -1 ? '创建' : '保存'),
}));
const __VLS_159 = __VLS_158({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.editModalVisible),
    title: (__VLS_ctx.getModalTitle()),
    width: "1000px",
    okText: (__VLS_ctx.editIndex === -1 ? '创建' : '保存'),
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
let __VLS_161;
let __VLS_162;
let __VLS_163;
const __VLS_164 = {
    onOk: (__VLS_ctx.saveTag)
};
const __VLS_165 = {
    onCancel: (__VLS_ctx.cancelEdit)
};
__VLS_160.slots.default;
if (__VLS_ctx.createMode === 'edit') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_166 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        model: (__VLS_ctx.editForm),
        layout: "vertical",
    }));
    const __VLS_168 = __VLS_167({
        model: (__VLS_ctx.editForm),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    __VLS_169.slots.default;
    const __VLS_170 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
        gutter: (16),
    }));
    const __VLS_172 = __VLS_171({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    __VLS_173.slots.default;
    const __VLS_174 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
        span: (12),
    }));
    const __VLS_176 = __VLS_175({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    __VLS_177.slots.default;
    const __VLS_178 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
        label: "标签ID",
        required: true,
    }));
    const __VLS_180 = __VLS_179({
        label: "标签ID",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    __VLS_181.slots.default;
    const __VLS_182 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
        modelValue: (__VLS_ctx.editForm.id),
        placeholder: "请输入标签ID",
    }));
    const __VLS_184 = __VLS_183({
        modelValue: (__VLS_ctx.editForm.id),
        placeholder: "请输入标签ID",
    }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    var __VLS_181;
    var __VLS_177;
    const __VLS_186 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
        span: (12),
    }));
    const __VLS_188 = __VLS_187({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    __VLS_189.slots.default;
    const __VLS_190 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
        label: "标签名称",
        required: true,
    }));
    const __VLS_192 = __VLS_191({
        label: "标签名称",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    __VLS_193.slots.default;
    const __VLS_194 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
        modelValue: (__VLS_ctx.editForm.name),
        placeholder: "请输入标签名称",
    }));
    const __VLS_196 = __VLS_195({
        modelValue: (__VLS_ctx.editForm.name),
        placeholder: "请输入标签名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    var __VLS_193;
    var __VLS_189;
    var __VLS_173;
    const __VLS_198 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
        gutter: (16),
    }));
    const __VLS_200 = __VLS_199({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    __VLS_201.slots.default;
    const __VLS_202 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
        span: (12),
    }));
    const __VLS_204 = __VLS_203({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    __VLS_205.slots.default;
    const __VLS_206 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
        label: "数据类型",
        required: true,
    }));
    const __VLS_208 = __VLS_207({
        label: "数据类型",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    __VLS_209.slots.default;
    const __VLS_210 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
        modelValue: (__VLS_ctx.editForm.dataType),
        placeholder: "请选择数据类型",
    }));
    const __VLS_212 = __VLS_211({
        modelValue: (__VLS_ctx.editForm.dataType),
        placeholder: "请选择数据类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_211));
    __VLS_213.slots.default;
    const __VLS_214 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
        value: "string",
    }));
    const __VLS_216 = __VLS_215({
        value: "string",
    }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    __VLS_217.slots.default;
    var __VLS_217;
    const __VLS_218 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
        value: "number",
    }));
    const __VLS_220 = __VLS_219({
        value: "number",
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    __VLS_221.slots.default;
    var __VLS_221;
    var __VLS_213;
    var __VLS_209;
    var __VLS_205;
    const __VLS_222 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({
        span: (12),
    }));
    const __VLS_224 = __VLS_223({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_223));
    __VLS_225.slots.default;
    const __VLS_226 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
        label: "标签分类",
        required: true,
    }));
    const __VLS_228 = __VLS_227({
        label: "标签分类",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    __VLS_229.slots.default;
    const __VLS_230 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
        modelValue: (__VLS_ctx.editForm.category),
        placeholder: "请选择标签分类",
    }));
    const __VLS_232 = __VLS_231({
        modelValue: (__VLS_ctx.editForm.category),
        placeholder: "请选择标签分类",
    }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    __VLS_233.slots.default;
    const __VLS_234 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
        value: "basic",
    }));
    const __VLS_236 = __VLS_235({
        value: "basic",
    }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    __VLS_237.slots.default;
    var __VLS_237;
    const __VLS_238 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
        value: "behavior",
    }));
    const __VLS_240 = __VLS_239({
        value: "behavior",
    }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    __VLS_241.slots.default;
    var __VLS_241;
    const __VLS_242 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({
        value: "preference",
    }));
    const __VLS_244 = __VLS_243({
        value: "preference",
    }, ...__VLS_functionalComponentArgsRest(__VLS_243));
    __VLS_245.slots.default;
    var __VLS_245;
    const __VLS_246 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
        value: "business",
    }));
    const __VLS_248 = __VLS_247({
        value: "business",
    }, ...__VLS_functionalComponentArgsRest(__VLS_247));
    __VLS_249.slots.default;
    var __VLS_249;
    var __VLS_233;
    var __VLS_229;
    var __VLS_225;
    var __VLS_201;
    const __VLS_250 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({
        gutter: (16),
    }));
    const __VLS_252 = __VLS_251({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    __VLS_253.slots.default;
    const __VLS_254 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
        span: (12),
    }));
    const __VLS_256 = __VLS_255({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_255));
    __VLS_257.slots.default;
    const __VLS_258 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
        label: "标签类型",
        required: true,
    }));
    const __VLS_260 = __VLS_259({
        label: "标签类型",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_259));
    __VLS_261.slots.default;
    const __VLS_262 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({
        modelValue: (__VLS_ctx.editForm.tagType),
        placeholder: "请选择标签类型",
    }));
    const __VLS_264 = __VLS_263({
        modelValue: (__VLS_ctx.editForm.tagType),
        placeholder: "请选择标签类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_263));
    __VLS_265.slots.default;
    const __VLS_266 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
        value: "static",
    }));
    const __VLS_268 = __VLS_267({
        value: "static",
    }, ...__VLS_functionalComponentArgsRest(__VLS_267));
    __VLS_269.slots.default;
    var __VLS_269;
    const __VLS_270 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
        value: "dynamic",
    }));
    const __VLS_272 = __VLS_271({
        value: "dynamic",
    }, ...__VLS_functionalComponentArgsRest(__VLS_271));
    __VLS_273.slots.default;
    var __VLS_273;
    const __VLS_274 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
        value: "computed",
    }));
    const __VLS_276 = __VLS_275({
        value: "computed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_275));
    __VLS_277.slots.default;
    var __VLS_277;
    const __VLS_278 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({
        value: "rule",
    }));
    const __VLS_280 = __VLS_279({
        value: "rule",
    }, ...__VLS_functionalComponentArgsRest(__VLS_279));
    __VLS_281.slots.default;
    var __VLS_281;
    var __VLS_265;
    var __VLS_261;
    var __VLS_257;
    const __VLS_282 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
        span: (12),
    }));
    const __VLS_284 = __VLS_283({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_283));
    __VLS_285.slots.default;
    const __VLS_286 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({
        label: "维度主键",
        required: true,
    }));
    const __VLS_288 = __VLS_287({
        label: "维度主键",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_287));
    __VLS_289.slots.default;
    const __VLS_290 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({
        modelValue: (__VLS_ctx.editForm.dimensionKey),
        placeholder: "请输入维度主键",
    }));
    const __VLS_292 = __VLS_291({
        modelValue: (__VLS_ctx.editForm.dimensionKey),
        placeholder: "请输入维度主键",
    }, ...__VLS_functionalComponentArgsRest(__VLS_291));
    var __VLS_289;
    var __VLS_285;
    var __VLS_253;
    const __VLS_294 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
        gutter: (16),
    }));
    const __VLS_296 = __VLS_295({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_295));
    __VLS_297.slots.default;
    const __VLS_298 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({
        span: (12),
    }));
    const __VLS_300 = __VLS_299({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_299));
    __VLS_301.slots.default;
    const __VLS_302 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_303 = __VLS_asFunctionalComponent(__VLS_302, new __VLS_302({
        label: "共享级别",
        required: true,
    }));
    const __VLS_304 = __VLS_303({
        label: "共享级别",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_303));
    __VLS_305.slots.default;
    const __VLS_306 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_307 = __VLS_asFunctionalComponent(__VLS_306, new __VLS_306({
        modelValue: (__VLS_ctx.editForm.shareLevel),
        placeholder: "请选择共享级别",
    }));
    const __VLS_308 = __VLS_307({
        modelValue: (__VLS_ctx.editForm.shareLevel),
        placeholder: "请选择共享级别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_307));
    __VLS_309.slots.default;
    const __VLS_310 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({
        value: "public",
    }));
    const __VLS_312 = __VLS_311({
        value: "public",
    }, ...__VLS_functionalComponentArgsRest(__VLS_311));
    __VLS_313.slots.default;
    var __VLS_313;
    const __VLS_314 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_315 = __VLS_asFunctionalComponent(__VLS_314, new __VLS_314({
        value: "private",
    }));
    const __VLS_316 = __VLS_315({
        value: "private",
    }, ...__VLS_functionalComponentArgsRest(__VLS_315));
    __VLS_317.slots.default;
    var __VLS_317;
    var __VLS_309;
    var __VLS_305;
    var __VLS_301;
    const __VLS_318 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_319 = __VLS_asFunctionalComponent(__VLS_318, new __VLS_318({
        span: (12),
    }));
    const __VLS_320 = __VLS_319({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_319));
    __VLS_321.slots.default;
    const __VLS_322 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_323 = __VLS_asFunctionalComponent(__VLS_322, new __VLS_322({
        label: "创建人",
    }));
    const __VLS_324 = __VLS_323({
        label: "创建人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_323));
    __VLS_325.slots.default;
    const __VLS_326 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_327 = __VLS_asFunctionalComponent(__VLS_326, new __VLS_326({
        modelValue: (__VLS_ctx.editForm.createUser),
        placeholder: "请输入创建人",
    }));
    const __VLS_328 = __VLS_327({
        modelValue: (__VLS_ctx.editForm.createUser),
        placeholder: "请输入创建人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_327));
    var __VLS_325;
    var __VLS_321;
    var __VLS_297;
    const __VLS_330 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_331 = __VLS_asFunctionalComponent(__VLS_330, new __VLS_330({
        label: "描述",
    }));
    const __VLS_332 = __VLS_331({
        label: "描述",
    }, ...__VLS_functionalComponentArgsRest(__VLS_331));
    __VLS_333.slots.default;
    const __VLS_334 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_335 = __VLS_asFunctionalComponent(__VLS_334, new __VLS_334({
        modelValue: (__VLS_ctx.editForm.description),
        placeholder: "请输入标签描述",
        rows: (3),
    }));
    const __VLS_336 = __VLS_335({
        modelValue: (__VLS_ctx.editForm.description),
        placeholder: "请输入标签描述",
        rows: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_335));
    var __VLS_333;
    var __VLS_169;
}
else if (__VLS_ctx.createMode === 'rule') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_338 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
    // @ts-ignore
    const __VLS_339 = __VLS_asFunctionalComponent(__VLS_338, new __VLS_338({
        activeKey: (__VLS_ctx.activeTab),
        type: "line",
    }));
    const __VLS_340 = __VLS_339({
        activeKey: (__VLS_ctx.activeTab),
        type: "line",
    }, ...__VLS_functionalComponentArgsRest(__VLS_339));
    __VLS_341.slots.default;
    const __VLS_342 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_343 = __VLS_asFunctionalComponent(__VLS_342, new __VLS_342({
        key: "basic",
        title: "基本属性",
    }));
    const __VLS_344 = __VLS_343({
        key: "basic",
        title: "基本属性",
    }, ...__VLS_functionalComponentArgsRest(__VLS_343));
    __VLS_345.slots.default;
    const __VLS_346 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_347 = __VLS_asFunctionalComponent(__VLS_346, new __VLS_346({
        model: (__VLS_ctx.ruleForm.basic),
        layout: "vertical",
    }));
    const __VLS_348 = __VLS_347({
        model: (__VLS_ctx.ruleForm.basic),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_347));
    __VLS_349.slots.default;
    const __VLS_350 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_351 = __VLS_asFunctionalComponent(__VLS_350, new __VLS_350({
        gutter: (16),
    }));
    const __VLS_352 = __VLS_351({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_351));
    __VLS_353.slots.default;
    const __VLS_354 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_355 = __VLS_asFunctionalComponent(__VLS_354, new __VLS_354({
        span: (12),
    }));
    const __VLS_356 = __VLS_355({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_355));
    __VLS_357.slots.default;
    const __VLS_358 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_359 = __VLS_asFunctionalComponent(__VLS_358, new __VLS_358({
        label: "标签ID",
        required: true,
    }));
    const __VLS_360 = __VLS_359({
        label: "标签ID",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_359));
    __VLS_361.slots.default;
    const __VLS_362 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_363 = __VLS_asFunctionalComponent(__VLS_362, new __VLS_362({
        modelValue: (__VLS_ctx.ruleForm.basic.id),
        placeholder: "请输入标签ID",
    }));
    const __VLS_364 = __VLS_363({
        modelValue: (__VLS_ctx.ruleForm.basic.id),
        placeholder: "请输入标签ID",
    }, ...__VLS_functionalComponentArgsRest(__VLS_363));
    var __VLS_361;
    var __VLS_357;
    const __VLS_366 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_367 = __VLS_asFunctionalComponent(__VLS_366, new __VLS_366({
        span: (12),
    }));
    const __VLS_368 = __VLS_367({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_367));
    __VLS_369.slots.default;
    const __VLS_370 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_371 = __VLS_asFunctionalComponent(__VLS_370, new __VLS_370({
        label: "标签名称",
        required: true,
    }));
    const __VLS_372 = __VLS_371({
        label: "标签名称",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_371));
    __VLS_373.slots.default;
    const __VLS_374 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_375 = __VLS_asFunctionalComponent(__VLS_374, new __VLS_374({
        modelValue: (__VLS_ctx.ruleForm.basic.name),
        placeholder: "请输入标签名称",
    }));
    const __VLS_376 = __VLS_375({
        modelValue: (__VLS_ctx.ruleForm.basic.name),
        placeholder: "请输入标签名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_375));
    var __VLS_373;
    var __VLS_369;
    var __VLS_353;
    const __VLS_378 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_379 = __VLS_asFunctionalComponent(__VLS_378, new __VLS_378({
        gutter: (16),
    }));
    const __VLS_380 = __VLS_379({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_379));
    __VLS_381.slots.default;
    const __VLS_382 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_383 = __VLS_asFunctionalComponent(__VLS_382, new __VLS_382({
        span: (12),
    }));
    const __VLS_384 = __VLS_383({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_383));
    __VLS_385.slots.default;
    const __VLS_386 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_387 = __VLS_asFunctionalComponent(__VLS_386, new __VLS_386({
        label: "数据类型",
        required: true,
    }));
    const __VLS_388 = __VLS_387({
        label: "数据类型",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_387));
    __VLS_389.slots.default;
    const __VLS_390 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_391 = __VLS_asFunctionalComponent(__VLS_390, new __VLS_390({
        modelValue: (__VLS_ctx.ruleForm.basic.dataType),
        placeholder: "请选择数据类型",
    }));
    const __VLS_392 = __VLS_391({
        modelValue: (__VLS_ctx.ruleForm.basic.dataType),
        placeholder: "请选择数据类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_391));
    __VLS_393.slots.default;
    const __VLS_394 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_395 = __VLS_asFunctionalComponent(__VLS_394, new __VLS_394({
        value: "string",
    }));
    const __VLS_396 = __VLS_395({
        value: "string",
    }, ...__VLS_functionalComponentArgsRest(__VLS_395));
    __VLS_397.slots.default;
    var __VLS_397;
    const __VLS_398 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_399 = __VLS_asFunctionalComponent(__VLS_398, new __VLS_398({
        value: "number",
    }));
    const __VLS_400 = __VLS_399({
        value: "number",
    }, ...__VLS_functionalComponentArgsRest(__VLS_399));
    __VLS_401.slots.default;
    var __VLS_401;
    var __VLS_393;
    var __VLS_389;
    var __VLS_385;
    const __VLS_402 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_403 = __VLS_asFunctionalComponent(__VLS_402, new __VLS_402({
        span: (12),
    }));
    const __VLS_404 = __VLS_403({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_403));
    __VLS_405.slots.default;
    const __VLS_406 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_407 = __VLS_asFunctionalComponent(__VLS_406, new __VLS_406({
        label: "标签分类",
        required: true,
    }));
    const __VLS_408 = __VLS_407({
        label: "标签分类",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_407));
    __VLS_409.slots.default;
    const __VLS_410 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_411 = __VLS_asFunctionalComponent(__VLS_410, new __VLS_410({
        modelValue: (__VLS_ctx.ruleForm.basic.category),
        placeholder: "请选择标签分类",
    }));
    const __VLS_412 = __VLS_411({
        modelValue: (__VLS_ctx.ruleForm.basic.category),
        placeholder: "请选择标签分类",
    }, ...__VLS_functionalComponentArgsRest(__VLS_411));
    __VLS_413.slots.default;
    const __VLS_414 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_415 = __VLS_asFunctionalComponent(__VLS_414, new __VLS_414({
        value: "basic",
    }));
    const __VLS_416 = __VLS_415({
        value: "basic",
    }, ...__VLS_functionalComponentArgsRest(__VLS_415));
    __VLS_417.slots.default;
    var __VLS_417;
    const __VLS_418 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({
        value: "behavior",
    }));
    const __VLS_420 = __VLS_419({
        value: "behavior",
    }, ...__VLS_functionalComponentArgsRest(__VLS_419));
    __VLS_421.slots.default;
    var __VLS_421;
    const __VLS_422 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_423 = __VLS_asFunctionalComponent(__VLS_422, new __VLS_422({
        value: "preference",
    }));
    const __VLS_424 = __VLS_423({
        value: "preference",
    }, ...__VLS_functionalComponentArgsRest(__VLS_423));
    __VLS_425.slots.default;
    var __VLS_425;
    const __VLS_426 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_427 = __VLS_asFunctionalComponent(__VLS_426, new __VLS_426({
        value: "business",
    }));
    const __VLS_428 = __VLS_427({
        value: "business",
    }, ...__VLS_functionalComponentArgsRest(__VLS_427));
    __VLS_429.slots.default;
    var __VLS_429;
    var __VLS_413;
    var __VLS_409;
    var __VLS_405;
    var __VLS_381;
    const __VLS_430 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({
        gutter: (16),
    }));
    const __VLS_432 = __VLS_431({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_431));
    __VLS_433.slots.default;
    const __VLS_434 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_435 = __VLS_asFunctionalComponent(__VLS_434, new __VLS_434({
        span: (12),
    }));
    const __VLS_436 = __VLS_435({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_435));
    __VLS_437.slots.default;
    const __VLS_438 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_439 = __VLS_asFunctionalComponent(__VLS_438, new __VLS_438({
        label: "维度主键",
        required: true,
    }));
    const __VLS_440 = __VLS_439({
        label: "维度主键",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_439));
    __VLS_441.slots.default;
    const __VLS_442 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({
        modelValue: (__VLS_ctx.ruleForm.basic.dimensionKey),
        placeholder: "请输入维度主键",
    }));
    const __VLS_444 = __VLS_443({
        modelValue: (__VLS_ctx.ruleForm.basic.dimensionKey),
        placeholder: "请输入维度主键",
    }, ...__VLS_functionalComponentArgsRest(__VLS_443));
    var __VLS_441;
    var __VLS_437;
    var __VLS_433;
    const __VLS_446 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_447 = __VLS_asFunctionalComponent(__VLS_446, new __VLS_446({
        label: "标签描述",
    }));
    const __VLS_448 = __VLS_447({
        label: "标签描述",
    }, ...__VLS_functionalComponentArgsRest(__VLS_447));
    __VLS_449.slots.default;
    const __VLS_450 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_451 = __VLS_asFunctionalComponent(__VLS_450, new __VLS_450({
        modelValue: (__VLS_ctx.ruleForm.basic.description),
        placeholder: "请输入标签描述",
        rows: (3),
    }));
    const __VLS_452 = __VLS_451({
        modelValue: (__VLS_ctx.ruleForm.basic.description),
        placeholder: "请输入标签描述",
        rows: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_451));
    var __VLS_449;
    var __VLS_349;
    var __VLS_345;
    const __VLS_454 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({
        key: "notification",
        title: "通知管理",
    }));
    const __VLS_456 = __VLS_455({
        key: "notification",
        title: "通知管理",
    }, ...__VLS_functionalComponentArgsRest(__VLS_455));
    __VLS_457.slots.default;
    const __VLS_458 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_459 = __VLS_asFunctionalComponent(__VLS_458, new __VLS_458({
        model: (__VLS_ctx.ruleForm.notification),
        layout: "vertical",
    }));
    const __VLS_460 = __VLS_459({
        model: (__VLS_ctx.ruleForm.notification),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_459));
    __VLS_461.slots.default;
    const __VLS_462 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_463 = __VLS_asFunctionalComponent(__VLS_462, new __VLS_462({
        label: "启用通知",
    }));
    const __VLS_464 = __VLS_463({
        label: "启用通知",
    }, ...__VLS_functionalComponentArgsRest(__VLS_463));
    __VLS_465.slots.default;
    const __VLS_466 = {}.ASwitch;
    /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_467 = __VLS_asFunctionalComponent(__VLS_466, new __VLS_466({
        modelValue: (__VLS_ctx.ruleForm.notification.enabled),
    }));
    const __VLS_468 = __VLS_467({
        modelValue: (__VLS_ctx.ruleForm.notification.enabled),
    }, ...__VLS_functionalComponentArgsRest(__VLS_467));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    var __VLS_465;
    if (__VLS_ctx.ruleForm.notification.enabled) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_470 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_471 = __VLS_asFunctionalComponent(__VLS_470, new __VLS_470({
            label: "通知方式",
        }));
        const __VLS_472 = __VLS_471({
            label: "通知方式",
        }, ...__VLS_functionalComponentArgsRest(__VLS_471));
        __VLS_473.slots.default;
        const __VLS_474 = {}.ACheckboxGroup;
        /** @type {[typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, ]} */ ;
        // @ts-ignore
        const __VLS_475 = __VLS_asFunctionalComponent(__VLS_474, new __VLS_474({
            modelValue: (__VLS_ctx.ruleForm.notification.methods),
        }));
        const __VLS_476 = __VLS_475({
            modelValue: (__VLS_ctx.ruleForm.notification.methods),
        }, ...__VLS_functionalComponentArgsRest(__VLS_475));
        __VLS_477.slots.default;
        const __VLS_478 = {}.ACheckbox;
        /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_479 = __VLS_asFunctionalComponent(__VLS_478, new __VLS_478({
            value: "email",
        }));
        const __VLS_480 = __VLS_479({
            value: "email",
        }, ...__VLS_functionalComponentArgsRest(__VLS_479));
        __VLS_481.slots.default;
        var __VLS_481;
        const __VLS_482 = {}.ACheckbox;
        /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_483 = __VLS_asFunctionalComponent(__VLS_482, new __VLS_482({
            value: "sms",
        }));
        const __VLS_484 = __VLS_483({
            value: "sms",
        }, ...__VLS_functionalComponentArgsRest(__VLS_483));
        __VLS_485.slots.default;
        var __VLS_485;
        const __VLS_486 = {}.ACheckbox;
        /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_487 = __VLS_asFunctionalComponent(__VLS_486, new __VLS_486({
            value: "webhook",
        }));
        const __VLS_488 = __VLS_487({
            value: "webhook",
        }, ...__VLS_functionalComponentArgsRest(__VLS_487));
        __VLS_489.slots.default;
        var __VLS_489;
        const __VLS_490 = {}.ACheckbox;
        /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_491 = __VLS_asFunctionalComponent(__VLS_490, new __VLS_490({
            value: "internal",
        }));
        const __VLS_492 = __VLS_491({
            value: "internal",
        }, ...__VLS_functionalComponentArgsRest(__VLS_491));
        __VLS_493.slots.default;
        var __VLS_493;
        var __VLS_477;
        var __VLS_473;
        const __VLS_494 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_495 = __VLS_asFunctionalComponent(__VLS_494, new __VLS_494({
            label: "通知场景",
        }));
        const __VLS_496 = __VLS_495({
            label: "通知场景",
        }, ...__VLS_functionalComponentArgsRest(__VLS_495));
        __VLS_497.slots.default;
        const __VLS_498 = {}.ACheckboxGroup;
        /** @type {[typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, ]} */ ;
        // @ts-ignore
        const __VLS_499 = __VLS_asFunctionalComponent(__VLS_498, new __VLS_498({
            modelValue: (__VLS_ctx.ruleForm.notification.scenarios),
        }));
        const __VLS_500 = __VLS_499({
            modelValue: (__VLS_ctx.ruleForm.notification.scenarios),
        }, ...__VLS_functionalComponentArgsRest(__VLS_499));
        __VLS_501.slots.default;
        const __VLS_502 = {}.ACheckbox;
        /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_503 = __VLS_asFunctionalComponent(__VLS_502, new __VLS_502({
            value: "created",
        }));
        const __VLS_504 = __VLS_503({
            value: "created",
        }, ...__VLS_functionalComponentArgsRest(__VLS_503));
        __VLS_505.slots.default;
        var __VLS_505;
        const __VLS_506 = {}.ACheckbox;
        /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_507 = __VLS_asFunctionalComponent(__VLS_506, new __VLS_506({
            value: "updated",
        }));
        const __VLS_508 = __VLS_507({
            value: "updated",
        }, ...__VLS_functionalComponentArgsRest(__VLS_507));
        __VLS_509.slots.default;
        var __VLS_509;
        const __VLS_510 = {}.ACheckbox;
        /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_511 = __VLS_asFunctionalComponent(__VLS_510, new __VLS_510({
            value: "deleted",
        }));
        const __VLS_512 = __VLS_511({
            value: "deleted",
        }, ...__VLS_functionalComponentArgsRest(__VLS_511));
        __VLS_513.slots.default;
        var __VLS_513;
        const __VLS_514 = {}.ACheckbox;
        /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_515 = __VLS_asFunctionalComponent(__VLS_514, new __VLS_514({
            value: "error",
        }));
        const __VLS_516 = __VLS_515({
            value: "error",
        }, ...__VLS_functionalComponentArgsRest(__VLS_515));
        __VLS_517.slots.default;
        var __VLS_517;
        var __VLS_501;
        var __VLS_497;
        const __VLS_518 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_519 = __VLS_asFunctionalComponent(__VLS_518, new __VLS_518({
            label: "通知接收人",
        }));
        const __VLS_520 = __VLS_519({
            label: "通知接收人",
        }, ...__VLS_functionalComponentArgsRest(__VLS_519));
        __VLS_521.slots.default;
        const __VLS_522 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_523 = __VLS_asFunctionalComponent(__VLS_522, new __VLS_522({
            modelValue: (__VLS_ctx.ruleForm.notification.recipients),
            multiple: true,
            placeholder: "请选择通知接收人",
        }));
        const __VLS_524 = __VLS_523({
            modelValue: (__VLS_ctx.ruleForm.notification.recipients),
            multiple: true,
            placeholder: "请选择通知接收人",
        }, ...__VLS_functionalComponentArgsRest(__VLS_523));
        __VLS_525.slots.default;
        const __VLS_526 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_527 = __VLS_asFunctionalComponent(__VLS_526, new __VLS_526({
            value: "admin",
        }));
        const __VLS_528 = __VLS_527({
            value: "admin",
        }, ...__VLS_functionalComponentArgsRest(__VLS_527));
        __VLS_529.slots.default;
        var __VLS_529;
        const __VLS_530 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_531 = __VLS_asFunctionalComponent(__VLS_530, new __VLS_530({
            value: "creator",
        }));
        const __VLS_532 = __VLS_531({
            value: "creator",
        }, ...__VLS_functionalComponentArgsRest(__VLS_531));
        __VLS_533.slots.default;
        var __VLS_533;
        const __VLS_534 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_535 = __VLS_asFunctionalComponent(__VLS_534, new __VLS_534({
            value: "department",
        }));
        const __VLS_536 = __VLS_535({
            value: "department",
        }, ...__VLS_functionalComponentArgsRest(__VLS_535));
        __VLS_537.slots.default;
        var __VLS_537;
        const __VLS_538 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_539 = __VLS_asFunctionalComponent(__VLS_538, new __VLS_538({
            value: "custom",
        }));
        const __VLS_540 = __VLS_539({
            value: "custom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_539));
        __VLS_541.slots.default;
        var __VLS_541;
        var __VLS_525;
        var __VLS_521;
        if (__VLS_ctx.ruleForm.notification.methods.includes('webhook')) {
            const __VLS_542 = {}.AFormItem;
            /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
            // @ts-ignore
            const __VLS_543 = __VLS_asFunctionalComponent(__VLS_542, new __VLS_542({
                label: "Webhook地址",
            }));
            const __VLS_544 = __VLS_543({
                label: "Webhook地址",
            }, ...__VLS_functionalComponentArgsRest(__VLS_543));
            __VLS_545.slots.default;
            const __VLS_546 = {}.AInput;
            /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
            // @ts-ignore
            const __VLS_547 = __VLS_asFunctionalComponent(__VLS_546, new __VLS_546({
                modelValue: (__VLS_ctx.ruleForm.notification.webhookUrl),
                placeholder: "请输入Webhook地址",
            }));
            const __VLS_548 = __VLS_547({
                modelValue: (__VLS_ctx.ruleForm.notification.webhookUrl),
                placeholder: "请输入Webhook地址",
            }, ...__VLS_functionalComponentArgsRest(__VLS_547));
            var __VLS_545;
        }
    }
    var __VLS_461;
    var __VLS_457;
    const __VLS_550 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_551 = __VLS_asFunctionalComponent(__VLS_550, new __VLS_550({
        key: "values",
        title: "标签值配置",
    }));
    const __VLS_552 = __VLS_551({
        key: "values",
        title: "标签值配置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_551));
    __VLS_553.slots.default;
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
    const __VLS_554 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_555 = __VLS_asFunctionalComponent(__VLS_554, new __VLS_554({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_556 = __VLS_555({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_555));
    let __VLS_558;
    let __VLS_559;
    let __VLS_560;
    const __VLS_561 = {
        onClick: (__VLS_ctx.addTagValue)
    };
    __VLS_557.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_557.slots;
        const __VLS_562 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_563 = __VLS_asFunctionalComponent(__VLS_562, new __VLS_562({}));
        const __VLS_564 = __VLS_563({}, ...__VLS_functionalComponentArgsRest(__VLS_563));
    }
    var __VLS_557;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tag-values-list" },
    });
    for (const [tagValue, index] of __VLS_getVForSourceType((__VLS_ctx.ruleForm.tagValues))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "tag-value-item" },
            ...{ class: ({ active: __VLS_ctx.selectedTagValueIndex === index }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.createMode === 'edit'))
                        return;
                    if (!(__VLS_ctx.createMode === 'rule'))
                        return;
                    __VLS_ctx.selectTagValue(index);
                } },
            ...{ class: "tag-value-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-value-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tag-value-name" },
        });
        (tagValue.name || '未命名标签值');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tag-value-desc" },
        });
        (tagValue.description || '暂无描述');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: () => { } },
            ...{ class: "tag-value-actions" },
        });
        const __VLS_566 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_567 = __VLS_asFunctionalComponent(__VLS_566, new __VLS_566({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_568 = __VLS_567({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_567));
        let __VLS_570;
        let __VLS_571;
        let __VLS_572;
        const __VLS_573 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.createMode === 'edit'))
                    return;
                if (!(__VLS_ctx.createMode === 'rule'))
                    return;
                __VLS_ctx.removeTagValue(index);
            }
        };
        __VLS_569.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_569.slots;
            const __VLS_574 = {}.IconDelete;
            /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
            // @ts-ignore
            const __VLS_575 = __VLS_asFunctionalComponent(__VLS_574, new __VLS_574({}));
            const __VLS_576 = __VLS_575({}, ...__VLS_functionalComponentArgsRest(__VLS_575));
        }
        var __VLS_569;
    }
    if (__VLS_ctx.ruleForm.tagValues.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state" },
        });
        const __VLS_578 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_579 = __VLS_asFunctionalComponent(__VLS_578, new __VLS_578({
            ...{ style: {} },
        }));
        const __VLS_580 = __VLS_579({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_579));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    if (__VLS_ctx.selectedTagValueIndex >= 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-value-config-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "config-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        const __VLS_582 = {}.AForm;
        /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
        // @ts-ignore
        const __VLS_583 = __VLS_asFunctionalComponent(__VLS_582, new __VLS_582({
            model: (__VLS_ctx.getCurrentTagValue()),
            layout: "vertical",
        }));
        const __VLS_584 = __VLS_583({
            model: (__VLS_ctx.getCurrentTagValue()),
            layout: "vertical",
        }, ...__VLS_functionalComponentArgsRest(__VLS_583));
        __VLS_585.slots.default;
        const __VLS_586 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        const __VLS_587 = __VLS_asFunctionalComponent(__VLS_586, new __VLS_586({
            gutter: (16),
        }));
        const __VLS_588 = __VLS_587({
            gutter: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_587));
        __VLS_589.slots.default;
        const __VLS_590 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_591 = __VLS_asFunctionalComponent(__VLS_590, new __VLS_590({
            span: (12),
        }));
        const __VLS_592 = __VLS_591({
            span: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_591));
        __VLS_593.slots.default;
        const __VLS_594 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_595 = __VLS_asFunctionalComponent(__VLS_594, new __VLS_594({
            label: "标签值名称",
            required: true,
        }));
        const __VLS_596 = __VLS_595({
            label: "标签值名称",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_595));
        __VLS_597.slots.default;
        const __VLS_598 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        const __VLS_599 = __VLS_asFunctionalComponent(__VLS_598, new __VLS_598({
            modelValue: (__VLS_ctx.getCurrentTagValue().name),
            placeholder: "请输入标签值名称",
        }));
        const __VLS_600 = __VLS_599({
            modelValue: (__VLS_ctx.getCurrentTagValue().name),
            placeholder: "请输入标签值名称",
        }, ...__VLS_functionalComponentArgsRest(__VLS_599));
        var __VLS_597;
        var __VLS_593;
        const __VLS_602 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_603 = __VLS_asFunctionalComponent(__VLS_602, new __VLS_602({
            span: (12),
        }));
        const __VLS_604 = __VLS_603({
            span: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_603));
        __VLS_605.slots.default;
        const __VLS_606 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_607 = __VLS_asFunctionalComponent(__VLS_606, new __VLS_606({
            label: "标签值",
        }));
        const __VLS_608 = __VLS_607({
            label: "标签值",
        }, ...__VLS_functionalComponentArgsRest(__VLS_607));
        __VLS_609.slots.default;
        const __VLS_610 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        const __VLS_611 = __VLS_asFunctionalComponent(__VLS_610, new __VLS_610({
            modelValue: (__VLS_ctx.getCurrentTagValue().value),
            placeholder: "请输入标签值",
        }));
        const __VLS_612 = __VLS_611({
            modelValue: (__VLS_ctx.getCurrentTagValue().value),
            placeholder: "请输入标签值",
        }, ...__VLS_functionalComponentArgsRest(__VLS_611));
        var __VLS_609;
        var __VLS_605;
        var __VLS_589;
        const __VLS_614 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_615 = __VLS_asFunctionalComponent(__VLS_614, new __VLS_614({
            label: "描述",
        }));
        const __VLS_616 = __VLS_615({
            label: "描述",
        }, ...__VLS_functionalComponentArgsRest(__VLS_615));
        __VLS_617.slots.default;
        const __VLS_618 = {}.ATextarea;
        /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
        // @ts-ignore
        const __VLS_619 = __VLS_asFunctionalComponent(__VLS_618, new __VLS_618({
            modelValue: (__VLS_ctx.getCurrentTagValue().description),
            placeholder: "请输入标签值描述",
            rows: (2),
        }));
        const __VLS_620 = __VLS_619({
            modelValue: (__VLS_ctx.getCurrentTagValue().description),
            placeholder: "请输入标签值描述",
            rows: (2),
        }, ...__VLS_functionalComponentArgsRest(__VLS_619));
        var __VLS_617;
        var __VLS_585;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-config-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        /** @type {[typeof ConditionConfig, ]} */ ;
        // @ts-ignore
        const __VLS_622 = __VLS_asFunctionalComponent(ConditionConfig, new ConditionConfig({
            ...{ 'onAddConditionGroup': {} },
            ...{ 'onAddExcludeConditionGroup': {} },
            ...{ 'onDeleteConditionGroup': {} },
            ...{ 'onDeleteExcludeConditionGroup': {} },
            ...{ 'onToggleGroupLogic': {} },
            ...{ 'onToggleCrossGroupLogic': {} },
            ...{ 'onAddConditionByType': {} },
            ...{ 'onRemoveCondition': {} },
            conditionGroups: (__VLS_ctx.getCurrentTagValueConditionGroups()),
            crossGroupLogic: (__VLS_ctx.getCurrentTagValue().crossGroupLogic || 'or'),
            editable: (true),
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
        const __VLS_623 = __VLS_622({
            ...{ 'onAddConditionGroup': {} },
            ...{ 'onAddExcludeConditionGroup': {} },
            ...{ 'onDeleteConditionGroup': {} },
            ...{ 'onDeleteExcludeConditionGroup': {} },
            ...{ 'onToggleGroupLogic': {} },
            ...{ 'onToggleCrossGroupLogic': {} },
            ...{ 'onAddConditionByType': {} },
            ...{ 'onRemoveCondition': {} },
            conditionGroups: (__VLS_ctx.getCurrentTagValueConditionGroups()),
            crossGroupLogic: (__VLS_ctx.getCurrentTagValue().crossGroupLogic || 'or'),
            editable: (true),
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
        }, ...__VLS_functionalComponentArgsRest(__VLS_622));
        let __VLS_625;
        let __VLS_626;
        let __VLS_627;
        const __VLS_628 = {
            onAddConditionGroup: (__VLS_ctx.addConditionGroup)
        };
        const __VLS_629 = {
            onAddExcludeConditionGroup: (__VLS_ctx.addExcludeConditionGroup)
        };
        const __VLS_630 = {
            onDeleteConditionGroup: (__VLS_ctx.deleteConditionGroup)
        };
        const __VLS_631 = {
            onDeleteExcludeConditionGroup: (__VLS_ctx.deleteExcludeConditionGroup)
        };
        const __VLS_632 = {
            onToggleGroupLogic: (__VLS_ctx.toggleGroupLogic)
        };
        const __VLS_633 = {
            onToggleCrossGroupLogic: (__VLS_ctx.toggleCrossGroupLogic)
        };
        const __VLS_634 = {
            onAddConditionByType: (__VLS_ctx.addConditionByType)
        };
        const __VLS_635 = {
            onRemoveCondition: (__VLS_ctx.removeCondition)
        };
        var __VLS_624;
    }
    var __VLS_553;
    var __VLS_341;
}
else if (__VLS_ctx.createMode === 'import') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_636 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_637 = __VLS_asFunctionalComponent(__VLS_636, new __VLS_636({
        model: (__VLS_ctx.importForm),
        layout: "vertical",
    }));
    const __VLS_638 = __VLS_637({
        model: (__VLS_ctx.importForm),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_637));
    __VLS_639.slots.default;
    const __VLS_640 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_641 = __VLS_asFunctionalComponent(__VLS_640, new __VLS_640({
        label: "导入方式",
    }));
    const __VLS_642 = __VLS_641({
        label: "导入方式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_641));
    __VLS_643.slots.default;
    const __VLS_644 = {}.ARadioGroup;
    /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_645 = __VLS_asFunctionalComponent(__VLS_644, new __VLS_644({
        modelValue: (__VLS_ctx.importForm.method),
    }));
    const __VLS_646 = __VLS_645({
        modelValue: (__VLS_ctx.importForm.method),
    }, ...__VLS_functionalComponentArgsRest(__VLS_645));
    __VLS_647.slots.default;
    const __VLS_648 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_649 = __VLS_asFunctionalComponent(__VLS_648, new __VLS_648({
        value: "file",
    }));
    const __VLS_650 = __VLS_649({
        value: "file",
    }, ...__VLS_functionalComponentArgsRest(__VLS_649));
    __VLS_651.slots.default;
    var __VLS_651;
    const __VLS_652 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_653 = __VLS_asFunctionalComponent(__VLS_652, new __VLS_652({
        value: "database",
    }));
    const __VLS_654 = __VLS_653({
        value: "database",
    }, ...__VLS_functionalComponentArgsRest(__VLS_653));
    __VLS_655.slots.default;
    var __VLS_655;
    const __VLS_656 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_657 = __VLS_asFunctionalComponent(__VLS_656, new __VLS_656({
        value: "api",
    }));
    const __VLS_658 = __VLS_657({
        value: "api",
    }, ...__VLS_functionalComponentArgsRest(__VLS_657));
    __VLS_659.slots.default;
    var __VLS_659;
    var __VLS_647;
    var __VLS_643;
    if (__VLS_ctx.importForm.method === 'file') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_660 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_661 = __VLS_asFunctionalComponent(__VLS_660, new __VLS_660({
            label: "上传文件",
        }));
        const __VLS_662 = __VLS_661({
            label: "上传文件",
        }, ...__VLS_functionalComponentArgsRest(__VLS_661));
        __VLS_663.slots.default;
        const __VLS_664 = {}.AUpload;
        /** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ ;
        // @ts-ignore
        const __VLS_665 = __VLS_asFunctionalComponent(__VLS_664, new __VLS_664({
            ...{ 'onChange': {} },
            fileList: (__VLS_ctx.importForm.fileList),
            showFileList: (true),
            autoUpload: (false),
            accept: ".csv,.xlsx,.json",
        }));
        const __VLS_666 = __VLS_665({
            ...{ 'onChange': {} },
            fileList: (__VLS_ctx.importForm.fileList),
            showFileList: (true),
            autoUpload: (false),
            accept: ".csv,.xlsx,.json",
        }, ...__VLS_functionalComponentArgsRest(__VLS_665));
        let __VLS_668;
        let __VLS_669;
        let __VLS_670;
        const __VLS_671 = {
            onChange: (__VLS_ctx.handleFileChange)
        };
        __VLS_667.slots.default;
        {
            const { 'upload-button': __VLS_thisSlot } = __VLS_667.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "upload-area" },
            });
            const __VLS_672 = {}.IconUpload;
            /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
            // @ts-ignore
            const __VLS_673 = __VLS_asFunctionalComponent(__VLS_672, new __VLS_672({
                ...{ style: {} },
            }));
            const __VLS_674 = __VLS_673({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_673));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
        }
        var __VLS_667;
        var __VLS_663;
        if (__VLS_ctx.importForm.fileList.length > 0) {
            const __VLS_676 = {}.AFormItem;
            /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
            // @ts-ignore
            const __VLS_677 = __VLS_asFunctionalComponent(__VLS_676, new __VLS_676({
                label: "字段映射",
            }));
            const __VLS_678 = __VLS_677({
                label: "字段映射",
            }, ...__VLS_functionalComponentArgsRest(__VLS_677));
            __VLS_679.slots.default;
            const __VLS_680 = {}.ATable;
            /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
            // @ts-ignore
            const __VLS_681 = __VLS_asFunctionalComponent(__VLS_680, new __VLS_680({
                data: (__VLS_ctx.importForm.fieldMapping),
                pagination: (false),
                size: "small",
            }));
            const __VLS_682 = __VLS_681({
                data: (__VLS_ctx.importForm.fieldMapping),
                pagination: (false),
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_681));
            __VLS_683.slots.default;
            {
                const { columns: __VLS_thisSlot } = __VLS_683.slots;
                const __VLS_684 = {}.ATableColumn;
                /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_685 = __VLS_asFunctionalComponent(__VLS_684, new __VLS_684({
                    title: "源字段",
                    dataIndex: "sourceField",
                    width: (200),
                }));
                const __VLS_686 = __VLS_685({
                    title: "源字段",
                    dataIndex: "sourceField",
                    width: (200),
                }, ...__VLS_functionalComponentArgsRest(__VLS_685));
                const __VLS_688 = {}.ATableColumn;
                /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_689 = __VLS_asFunctionalComponent(__VLS_688, new __VLS_688({
                    title: "目标字段",
                    dataIndex: "targetField",
                    width: (200),
                }));
                const __VLS_690 = __VLS_689({
                    title: "目标字段",
                    dataIndex: "targetField",
                    width: (200),
                }, ...__VLS_functionalComponentArgsRest(__VLS_689));
                __VLS_691.slots.default;
                {
                    const { cell: __VLS_thisSlot } = __VLS_691.slots;
                    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                    const __VLS_692 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_693 = __VLS_asFunctionalComponent(__VLS_692, new __VLS_692({
                        modelValue: (record.targetField),
                        placeholder: "选择目标字段",
                    }));
                    const __VLS_694 = __VLS_693({
                        modelValue: (record.targetField),
                        placeholder: "选择目标字段",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_693));
                    __VLS_695.slots.default;
                    const __VLS_696 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_697 = __VLS_asFunctionalComponent(__VLS_696, new __VLS_696({
                        value: "id",
                    }));
                    const __VLS_698 = __VLS_697({
                        value: "id",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_697));
                    __VLS_699.slots.default;
                    var __VLS_699;
                    const __VLS_700 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_701 = __VLS_asFunctionalComponent(__VLS_700, new __VLS_700({
                        value: "name",
                    }));
                    const __VLS_702 = __VLS_701({
                        value: "name",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_701));
                    __VLS_703.slots.default;
                    var __VLS_703;
                    const __VLS_704 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_705 = __VLS_asFunctionalComponent(__VLS_704, new __VLS_704({
                        value: "value",
                    }));
                    const __VLS_706 = __VLS_705({
                        value: "value",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_705));
                    __VLS_707.slots.default;
                    var __VLS_707;
                    const __VLS_708 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_709 = __VLS_asFunctionalComponent(__VLS_708, new __VLS_708({
                        value: "user_id",
                    }));
                    const __VLS_710 = __VLS_709({
                        value: "user_id",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_709));
                    __VLS_711.slots.default;
                    var __VLS_711;
                    const __VLS_712 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_713 = __VLS_asFunctionalComponent(__VLS_712, new __VLS_712({
                        value: "create_time",
                    }));
                    const __VLS_714 = __VLS_713({
                        value: "create_time",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_713));
                    __VLS_715.slots.default;
                    var __VLS_715;
                    var __VLS_695;
                }
                var __VLS_691;
                const __VLS_716 = {}.ATableColumn;
                /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_717 = __VLS_asFunctionalComponent(__VLS_716, new __VLS_716({
                    title: "数据类型",
                    dataIndex: "dataType",
                    width: (150),
                }));
                const __VLS_718 = __VLS_717({
                    title: "数据类型",
                    dataIndex: "dataType",
                    width: (150),
                }, ...__VLS_functionalComponentArgsRest(__VLS_717));
                __VLS_719.slots.default;
                {
                    const { cell: __VLS_thisSlot } = __VLS_719.slots;
                    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                    const __VLS_720 = {}.ASelect;
                    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
                    // @ts-ignore
                    const __VLS_721 = __VLS_asFunctionalComponent(__VLS_720, new __VLS_720({
                        modelValue: (record.dataType),
                        placeholder: "选择类型",
                    }));
                    const __VLS_722 = __VLS_721({
                        modelValue: (record.dataType),
                        placeholder: "选择类型",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_721));
                    __VLS_723.slots.default;
                    const __VLS_724 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_725 = __VLS_asFunctionalComponent(__VLS_724, new __VLS_724({
                        value: "string",
                    }));
                    const __VLS_726 = __VLS_725({
                        value: "string",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_725));
                    __VLS_727.slots.default;
                    var __VLS_727;
                    const __VLS_728 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_729 = __VLS_asFunctionalComponent(__VLS_728, new __VLS_728({
                        value: "number",
                    }));
                    const __VLS_730 = __VLS_729({
                        value: "number",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_729));
                    __VLS_731.slots.default;
                    var __VLS_731;
                    const __VLS_732 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_733 = __VLS_asFunctionalComponent(__VLS_732, new __VLS_732({
                        value: "date",
                    }));
                    const __VLS_734 = __VLS_733({
                        value: "date",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_733));
                    __VLS_735.slots.default;
                    var __VLS_735;
                    const __VLS_736 = {}.AOption;
                    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
                    // @ts-ignore
                    const __VLS_737 = __VLS_asFunctionalComponent(__VLS_736, new __VLS_736({
                        value: "boolean",
                    }));
                    const __VLS_738 = __VLS_737({
                        value: "boolean",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_737));
                    __VLS_739.slots.default;
                    var __VLS_739;
                    var __VLS_723;
                }
                var __VLS_719;
            }
            var __VLS_683;
            var __VLS_679;
        }
    }
    if (__VLS_ctx.importForm.method === 'database') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_740 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        const __VLS_741 = __VLS_asFunctionalComponent(__VLS_740, new __VLS_740({
            gutter: (16),
        }));
        const __VLS_742 = __VLS_741({
            gutter: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_741));
        __VLS_743.slots.default;
        const __VLS_744 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_745 = __VLS_asFunctionalComponent(__VLS_744, new __VLS_744({
            span: (12),
        }));
        const __VLS_746 = __VLS_745({
            span: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_745));
        __VLS_747.slots.default;
        const __VLS_748 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_749 = __VLS_asFunctionalComponent(__VLS_748, new __VLS_748({
            label: "数据源",
        }));
        const __VLS_750 = __VLS_749({
            label: "数据源",
        }, ...__VLS_functionalComponentArgsRest(__VLS_749));
        __VLS_751.slots.default;
        const __VLS_752 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_753 = __VLS_asFunctionalComponent(__VLS_752, new __VLS_752({
            modelValue: (__VLS_ctx.importForm.dataSource),
            placeholder: "请选择数据源",
        }));
        const __VLS_754 = __VLS_753({
            modelValue: (__VLS_ctx.importForm.dataSource),
            placeholder: "请选择数据源",
        }, ...__VLS_functionalComponentArgsRest(__VLS_753));
        __VLS_755.slots.default;
        const __VLS_756 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_757 = __VLS_asFunctionalComponent(__VLS_756, new __VLS_756({
            value: "mysql_main",
        }));
        const __VLS_758 = __VLS_757({
            value: "mysql_main",
        }, ...__VLS_functionalComponentArgsRest(__VLS_757));
        __VLS_759.slots.default;
        var __VLS_759;
        const __VLS_760 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_761 = __VLS_asFunctionalComponent(__VLS_760, new __VLS_760({
            value: "mysql_slave",
        }));
        const __VLS_762 = __VLS_761({
            value: "mysql_slave",
        }, ...__VLS_functionalComponentArgsRest(__VLS_761));
        __VLS_763.slots.default;
        var __VLS_763;
        const __VLS_764 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_765 = __VLS_asFunctionalComponent(__VLS_764, new __VLS_764({
            value: "postgresql",
        }));
        const __VLS_766 = __VLS_765({
            value: "postgresql",
        }, ...__VLS_functionalComponentArgsRest(__VLS_765));
        __VLS_767.slots.default;
        var __VLS_767;
        const __VLS_768 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_769 = __VLS_asFunctionalComponent(__VLS_768, new __VLS_768({
            value: "oracle",
        }));
        const __VLS_770 = __VLS_769({
            value: "oracle",
        }, ...__VLS_functionalComponentArgsRest(__VLS_769));
        __VLS_771.slots.default;
        var __VLS_771;
        var __VLS_755;
        var __VLS_751;
        var __VLS_747;
        const __VLS_772 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_773 = __VLS_asFunctionalComponent(__VLS_772, new __VLS_772({
            span: (12),
        }));
        const __VLS_774 = __VLS_773({
            span: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_773));
        __VLS_775.slots.default;
        const __VLS_776 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_777 = __VLS_asFunctionalComponent(__VLS_776, new __VLS_776({
            label: "数据表",
        }));
        const __VLS_778 = __VLS_777({
            label: "数据表",
        }, ...__VLS_functionalComponentArgsRest(__VLS_777));
        __VLS_779.slots.default;
        const __VLS_780 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_781 = __VLS_asFunctionalComponent(__VLS_780, new __VLS_780({
            modelValue: (__VLS_ctx.importForm.tableName),
            placeholder: "请选择数据表",
        }));
        const __VLS_782 = __VLS_781({
            modelValue: (__VLS_ctx.importForm.tableName),
            placeholder: "请选择数据表",
        }, ...__VLS_functionalComponentArgsRest(__VLS_781));
        __VLS_783.slots.default;
        const __VLS_784 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_785 = __VLS_asFunctionalComponent(__VLS_784, new __VLS_784({
            value: "user_tags",
        }));
        const __VLS_786 = __VLS_785({
            value: "user_tags",
        }, ...__VLS_functionalComponentArgsRest(__VLS_785));
        __VLS_787.slots.default;
        var __VLS_787;
        const __VLS_788 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_789 = __VLS_asFunctionalComponent(__VLS_788, new __VLS_788({
            value: "customer_info",
        }));
        const __VLS_790 = __VLS_789({
            value: "customer_info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_789));
        __VLS_791.slots.default;
        var __VLS_791;
        const __VLS_792 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_793 = __VLS_asFunctionalComponent(__VLS_792, new __VLS_792({
            value: "behavior_data",
        }));
        const __VLS_794 = __VLS_793({
            value: "behavior_data",
        }, ...__VLS_functionalComponentArgsRest(__VLS_793));
        __VLS_795.slots.default;
        var __VLS_795;
        var __VLS_783;
        var __VLS_779;
        var __VLS_775;
        var __VLS_743;
        const __VLS_796 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_797 = __VLS_asFunctionalComponent(__VLS_796, new __VLS_796({
            label: "查询条件",
        }));
        const __VLS_798 = __VLS_797({
            label: "查询条件",
        }, ...__VLS_functionalComponentArgsRest(__VLS_797));
        __VLS_799.slots.default;
        const __VLS_800 = {}.ATextarea;
        /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
        // @ts-ignore
        const __VLS_801 = __VLS_asFunctionalComponent(__VLS_800, new __VLS_800({
            modelValue: (__VLS_ctx.importForm.queryCondition),
            placeholder: "请输入WHERE条件（可选）",
            rows: (3),
        }));
        const __VLS_802 = __VLS_801({
            modelValue: (__VLS_ctx.importForm.queryCondition),
            placeholder: "请输入WHERE条件（可选）",
            rows: (3),
        }, ...__VLS_functionalComponentArgsRest(__VLS_801));
        var __VLS_799;
    }
    if (__VLS_ctx.importForm.method === 'api') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_804 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        const __VLS_805 = __VLS_asFunctionalComponent(__VLS_804, new __VLS_804({
            gutter: (16),
        }));
        const __VLS_806 = __VLS_805({
            gutter: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_805));
        __VLS_807.slots.default;
        const __VLS_808 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_809 = __VLS_asFunctionalComponent(__VLS_808, new __VLS_808({
            span: (8),
        }));
        const __VLS_810 = __VLS_809({
            span: (8),
        }, ...__VLS_functionalComponentArgsRest(__VLS_809));
        __VLS_811.slots.default;
        const __VLS_812 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_813 = __VLS_asFunctionalComponent(__VLS_812, new __VLS_812({
            label: "请求方法",
        }));
        const __VLS_814 = __VLS_813({
            label: "请求方法",
        }, ...__VLS_functionalComponentArgsRest(__VLS_813));
        __VLS_815.slots.default;
        const __VLS_816 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_817 = __VLS_asFunctionalComponent(__VLS_816, new __VLS_816({
            modelValue: (__VLS_ctx.importForm.apiMethod),
            placeholder: "请选择请求方法",
        }));
        const __VLS_818 = __VLS_817({
            modelValue: (__VLS_ctx.importForm.apiMethod),
            placeholder: "请选择请求方法",
        }, ...__VLS_functionalComponentArgsRest(__VLS_817));
        __VLS_819.slots.default;
        const __VLS_820 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_821 = __VLS_asFunctionalComponent(__VLS_820, new __VLS_820({
            value: "GET",
        }));
        const __VLS_822 = __VLS_821({
            value: "GET",
        }, ...__VLS_functionalComponentArgsRest(__VLS_821));
        __VLS_823.slots.default;
        var __VLS_823;
        const __VLS_824 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_825 = __VLS_asFunctionalComponent(__VLS_824, new __VLS_824({
            value: "POST",
        }));
        const __VLS_826 = __VLS_825({
            value: "POST",
        }, ...__VLS_functionalComponentArgsRest(__VLS_825));
        __VLS_827.slots.default;
        var __VLS_827;
        var __VLS_819;
        var __VLS_815;
        var __VLS_811;
        const __VLS_828 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_829 = __VLS_asFunctionalComponent(__VLS_828, new __VLS_828({
            span: (16),
        }));
        const __VLS_830 = __VLS_829({
            span: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_829));
        __VLS_831.slots.default;
        const __VLS_832 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_833 = __VLS_asFunctionalComponent(__VLS_832, new __VLS_832({
            label: "API地址",
        }));
        const __VLS_834 = __VLS_833({
            label: "API地址",
        }, ...__VLS_functionalComponentArgsRest(__VLS_833));
        __VLS_835.slots.default;
        const __VLS_836 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        const __VLS_837 = __VLS_asFunctionalComponent(__VLS_836, new __VLS_836({
            modelValue: (__VLS_ctx.importForm.apiUrl),
            placeholder: "请输入API地址",
        }));
        const __VLS_838 = __VLS_837({
            modelValue: (__VLS_ctx.importForm.apiUrl),
            placeholder: "请输入API地址",
        }, ...__VLS_functionalComponentArgsRest(__VLS_837));
        var __VLS_835;
        var __VLS_831;
        var __VLS_807;
        const __VLS_840 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_841 = __VLS_asFunctionalComponent(__VLS_840, new __VLS_840({
            label: "请求头",
        }));
        const __VLS_842 = __VLS_841({
            label: "请求头",
        }, ...__VLS_functionalComponentArgsRest(__VLS_841));
        __VLS_843.slots.default;
        const __VLS_844 = {}.ATextarea;
        /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
        // @ts-ignore
        const __VLS_845 = __VLS_asFunctionalComponent(__VLS_844, new __VLS_844({
            modelValue: (__VLS_ctx.importForm.apiHeaders),
            placeholder: "请输入请求头（JSON格式）",
            rows: (3),
        }));
        const __VLS_846 = __VLS_845({
            modelValue: (__VLS_ctx.importForm.apiHeaders),
            placeholder: "请输入请求头（JSON格式）",
            rows: (3),
        }, ...__VLS_functionalComponentArgsRest(__VLS_845));
        var __VLS_843;
        if (__VLS_ctx.importForm.apiMethod === 'POST') {
            const __VLS_848 = {}.AFormItem;
            /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
            // @ts-ignore
            const __VLS_849 = __VLS_asFunctionalComponent(__VLS_848, new __VLS_848({
                label: "请求参数",
            }));
            const __VLS_850 = __VLS_849({
                label: "请求参数",
            }, ...__VLS_functionalComponentArgsRest(__VLS_849));
            __VLS_851.slots.default;
            const __VLS_852 = {}.ATextarea;
            /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
            // @ts-ignore
            const __VLS_853 = __VLS_asFunctionalComponent(__VLS_852, new __VLS_852({
                modelValue: (__VLS_ctx.importForm.apiParams),
                placeholder: "请输入请求参数（JSON格式）",
                rows: (3),
            }));
            const __VLS_854 = __VLS_853({
                modelValue: (__VLS_ctx.importForm.apiParams),
                placeholder: "请输入请求参数（JSON格式）",
                rows: (3),
            }, ...__VLS_functionalComponentArgsRest(__VLS_853));
            var __VLS_851;
        }
    }
    const __VLS_856 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_857 = __VLS_asFunctionalComponent(__VLS_856, new __VLS_856({
        label: "导入配置",
    }));
    const __VLS_858 = __VLS_857({
        label: "导入配置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_857));
    __VLS_859.slots.default;
    const __VLS_860 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_861 = __VLS_asFunctionalComponent(__VLS_860, new __VLS_860({
        gutter: (16),
    }));
    const __VLS_862 = __VLS_861({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_861));
    __VLS_863.slots.default;
    const __VLS_864 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_865 = __VLS_asFunctionalComponent(__VLS_864, new __VLS_864({
        span: (12),
    }));
    const __VLS_866 = __VLS_865({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_865));
    __VLS_867.slots.default;
    const __VLS_868 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_869 = __VLS_asFunctionalComponent(__VLS_868, new __VLS_868({
        label: "批次大小",
    }));
    const __VLS_870 = __VLS_869({
        label: "批次大小",
    }, ...__VLS_functionalComponentArgsRest(__VLS_869));
    __VLS_871.slots.default;
    const __VLS_872 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_873 = __VLS_asFunctionalComponent(__VLS_872, new __VLS_872({
        modelValue: (__VLS_ctx.importForm.batchSize),
        min: (100),
        max: (10000),
        placeholder: "1000",
    }));
    const __VLS_874 = __VLS_873({
        modelValue: (__VLS_ctx.importForm.batchSize),
        min: (100),
        max: (10000),
        placeholder: "1000",
    }, ...__VLS_functionalComponentArgsRest(__VLS_873));
    var __VLS_871;
    var __VLS_867;
    const __VLS_876 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_877 = __VLS_asFunctionalComponent(__VLS_876, new __VLS_876({
        span: (12),
    }));
    const __VLS_878 = __VLS_877({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_877));
    __VLS_879.slots.default;
    const __VLS_880 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_881 = __VLS_asFunctionalComponent(__VLS_880, new __VLS_880({
        label: "重复处理",
    }));
    const __VLS_882 = __VLS_881({
        label: "重复处理",
    }, ...__VLS_functionalComponentArgsRest(__VLS_881));
    __VLS_883.slots.default;
    const __VLS_884 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_885 = __VLS_asFunctionalComponent(__VLS_884, new __VLS_884({
        modelValue: (__VLS_ctx.importForm.duplicateHandling),
        placeholder: "请选择重复处理方式",
    }));
    const __VLS_886 = __VLS_885({
        modelValue: (__VLS_ctx.importForm.duplicateHandling),
        placeholder: "请选择重复处理方式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_885));
    __VLS_887.slots.default;
    const __VLS_888 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_889 = __VLS_asFunctionalComponent(__VLS_888, new __VLS_888({
        value: "skip",
    }));
    const __VLS_890 = __VLS_889({
        value: "skip",
    }, ...__VLS_functionalComponentArgsRest(__VLS_889));
    __VLS_891.slots.default;
    var __VLS_891;
    const __VLS_892 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_893 = __VLS_asFunctionalComponent(__VLS_892, new __VLS_892({
        value: "update",
    }));
    const __VLS_894 = __VLS_893({
        value: "update",
    }, ...__VLS_functionalComponentArgsRest(__VLS_893));
    __VLS_895.slots.default;
    var __VLS_895;
    const __VLS_896 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_897 = __VLS_asFunctionalComponent(__VLS_896, new __VLS_896({
        value: "error",
    }));
    const __VLS_898 = __VLS_897({
        value: "error",
    }, ...__VLS_functionalComponentArgsRest(__VLS_897));
    __VLS_899.slots.default;
    var __VLS_899;
    var __VLS_887;
    var __VLS_883;
    var __VLS_879;
    var __VLS_863;
    var __VLS_859;
    var __VLS_639;
}
var __VLS_160;
/** @type {__VLS_StyleScopedClasses['tag-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-title']} */ ;
/** @type {__VLS_StyleScopedClasses['table-count']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-table']} */ ;
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
/** @type {__VLS_StyleScopedClasses['condition-config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconSearch: IconSearch,
            IconDelete: IconDelete,
            IconDown: IconDown,
            IconSettings: IconSettings,
            IconImport: IconImport,
            IconUpload: IconUpload,
            ConditionConfig: ConditionConfig,
            searchForm: searchForm,
            tableData: tableData,
            loading: loading,
            pagination: pagination,
            editModalVisible: editModalVisible,
            createMode: createMode,
            activeTab: activeTab,
            editForm: editForm,
            editIndex: editIndex,
            ruleForm: ruleForm,
            selectedTagValueIndex: selectedTagValueIndex,
            importForm: importForm,
            handleSearch: handleSearch,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
            getModalTitle: getModalTitle,
            addTagByRule: addTagByRule,
            addTagByImport: addTagByImport,
            removeTag: removeTag,
            goToTagDetail: goToTagDetail,
            updateTag: updateTag,
            saveTag: saveTag,
            addTagValue: addTagValue,
            removeTagValue: removeTagValue,
            selectTagValue: selectTagValue,
            getCurrentTagValue: getCurrentTagValue,
            getCurrentTagValueConditionGroups: getCurrentTagValueConditionGroups,
            addConditionGroup: addConditionGroup,
            addExcludeConditionGroup: addExcludeConditionGroup,
            deleteConditionGroup: deleteConditionGroup,
            deleteExcludeConditionGroup: deleteExcludeConditionGroup,
            toggleCrossGroupLogic: toggleCrossGroupLogic,
            dataSourceTypeOptions: dataSourceTypeOptions,
            dateTypeOptions: dateTypeOptions,
            dynamicUnitOptions: dynamicUnitOptions,
            getFieldOptions: getFieldOptions,
            getAggregationOptions: getAggregationOptions,
            getOperatorOptions: getOperatorOptions,
            needValueInput: needValueInput,
            getValuePlaceholder: getValuePlaceholder,
            onDataSourceTypeChange: onDataSourceTypeChange,
            onDateTypeChange: onDateTypeChange,
            toggleGroupLogic: toggleGroupLogic,
            addConditionByType: addConditionByType,
            removeCondition: removeCondition,
            handleFileChange: handleFileChange,
            cancelEdit: cancelEdit,
            getDataTypeColor: getDataTypeColor,
            getDataTypeText: getDataTypeText,
            getCategoryColor: getCategoryColor,
            getCategoryText: getCategoryText,
            getTagTypeColor: getTagTypeColor,
            getTagTypeText: getTagTypeText,
            getShareLevelColor: getShareLevelColor,
            getShareLevelText: getShareLevelText,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
