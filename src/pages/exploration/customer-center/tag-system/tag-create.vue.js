import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconSettings, IconTags } from '@arco-design/web-vue/es/icon';
import ConditionConfig from '@/components/common/ConditionConfig.vue';
const router = useRouter();
// 标签基本信息表单
const tagForm = reactive({
    id: '',
    name: '',
    dataType: 'string',
    category: 'basic',
    dimensionKey: '',
    shareLevel: 'public',
    description: ''
});
// 标签值数据
const tagValues = ref([{
        name: '',
        value: '',
        description: '',
        conditionGroups: [],
        crossGroupLogic: 'or'
    }]);
// Tab相关状态管理
const activeTabKey = ref('tab-0');
// 工具函数
const getTabKey = (index) => {
    return `tab-${index}`;
};
const getIndexFromTabKey = (tabKey) => {
    const match = tabKey.match(/tab-(\d+)/);
    return match ? parseInt(match[1]) : -1;
};
// 确保初始activeTabKey正确
if (tagValues.value.length > 0) {
    activeTabKey.value = getTabKey(0);
}
// 标签值配置相关函数
const addTagValue = () => {
    const newTagValue = {
        name: '',
        value: '',
        description: '',
        conditionGroups: [],
        crossGroupLogic: 'or'
    };
    tagValues.value.push(newTagValue);
    const newIndex = tagValues.value.length - 1;
    activeTabKey.value = getTabKey(newIndex);
    console.log('添加标签值:', newTagValue, '新索引:', newIndex, '新activeTabKey:', activeTabKey.value);
};
const deleteTagValue = (targetKey) => {
    const index = getIndexFromTabKey(targetKey);
    if (index >= 0 && index < tagValues.value.length) {
        tagValues.value.splice(index, 1);
        // 更新activeTabKey
        if (tagValues.value.length > 0) {
            if (index === 0) {
                activeTabKey.value = getTabKey(0);
            }
            else {
                activeTabKey.value = getTabKey(index - 1);
            }
        }
        else {
            activeTabKey.value = '';
        }
    }
};
const updateTabTitle = (index) => {
    // Tab标题会自动更新，因为绑定了tagValue.name
};
const addConditionGroup = (tagValueIndex) => {
    if (tagValueIndex >= 0 && tagValueIndex < tagValues.value.length) {
        const tagValue = tagValues.value[tagValueIndex];
        tagValue.conditionGroups.push({
            id: Date.now().toString(),
            logic: 'and',
            conditions: [{
                    id: Date.now().toString() + '_1',
                    type: 'detail',
                    dataSourceType: 'detail',
                    fieldName: '',
                    aggregationType: '',
                    operator: '',
                    value: '',
                    dateType: 'dynamic',
                    dynamicValue: 1,
                    dynamicUnit: 'days',
                    dateRange: undefined,
                    isExclude: false
                }]
        });
    }
};
const addExcludeConditionGroup = (tagValueIndex) => {
    if (tagValueIndex >= 0 && tagValueIndex < tagValues.value.length) {
        const tagValue = tagValues.value[tagValueIndex];
        tagValue.conditionGroups.push({
            id: Date.now().toString(),
            logic: 'and',
            isExclude: true,
            conditions: [{
                    id: Date.now().toString() + '_1',
                    type: 'detail',
                    dataSourceType: 'detail',
                    fieldName: '',
                    aggregationType: '',
                    operator: '',
                    value: '',
                    dateType: 'dynamic',
                    dynamicValue: 1,
                    dynamicUnit: 'days',
                    dateRange: undefined,
                    isExclude: false
                }]
        });
    }
};
const deleteConditionGroup = (tagValueIndex, groupIndex) => {
    if (tagValueIndex >= 0 && tagValueIndex < tagValues.value.length) {
        const tagValue = tagValues.value[tagValueIndex];
        // 找到常规条件组中的索引
        const regularGroups = tagValue.conditionGroups.filter(group => !group.isExclude);
        if (groupIndex >= 0 && groupIndex < regularGroups.length) {
            const targetGroup = regularGroups[groupIndex];
            const actualIndex = tagValue.conditionGroups.indexOf(targetGroup);
            tagValue.conditionGroups.splice(actualIndex, 1);
        }
    }
};
const deleteExcludeConditionGroup = (tagValueIndex, groupIndex) => {
    if (tagValueIndex >= 0 && tagValueIndex < tagValues.value.length) {
        const tagValue = tagValues.value[tagValueIndex];
        // 找到排除条件组中的索引
        const excludeGroups = tagValue.conditionGroups.filter(group => group.isExclude);
        if (groupIndex >= 0 && groupIndex < excludeGroups.length) {
            const targetGroup = excludeGroups[groupIndex];
            const actualIndex = tagValue.conditionGroups.indexOf(targetGroup);
            tagValue.conditionGroups.splice(actualIndex, 1);
        }
    }
};
const toggleCrossGroupLogic = (tagValueIndex) => {
    if (tagValueIndex >= 0 && tagValueIndex < tagValues.value.length) {
        const tagValue = tagValues.value[tagValueIndex];
        tagValue.crossGroupLogic = tagValue.crossGroupLogic === 'and' ? 'or' : 'and';
    }
};
const toggleGroupLogic = (tagValueIndex, group) => {
    if (tagValueIndex >= 0 && tagValueIndex < tagValues.value.length) {
        group.logic = group.logic === 'and' ? 'or' : 'and';
    }
};
const addConditionByType = (tagValueIndex, group, type) => {
    if (tagValueIndex >= 0 && tagValueIndex < tagValues.value.length) {
        group.conditions.push({
            id: Date.now().toString() + '_' + group.conditions.length,
            type: type,
            dataSourceType: type,
            fieldName: '',
            aggregationType: '',
            operator: '',
            value: '',
            dateType: 'dynamic',
            dynamicValue: 1,
            dynamicUnit: 'days',
            dateRange: undefined,
            isExclude: false
        });
    }
};
const removeCondition = (tagValueIndex, group, conditionIndex) => {
    if (tagValueIndex >= 0 && tagValueIndex < tagValues.value.length) {
        if (group.conditions && conditionIndex >= 0 && conditionIndex < group.conditions.length) {
            group.conditions.splice(conditionIndex, 1);
        }
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
        condition.dateRange = ['', ''];
    }
};
// 保存标签
const saveTag = () => {
    // 验证基本信息
    if (!tagForm.id || !tagForm.name || !tagForm.dataType || !tagForm.category || !tagForm.dimensionKey) {
        Message.error('请填写完整的基本信息');
        return;
    }
    // 验证标签值
    if (tagValues.value.length === 0) {
        Message.error('请至少添加一个标签值');
        return;
    }
    // 验证标签值配置
    for (let i = 0; i < tagValues.value.length; i++) {
        const tagValue = tagValues.value[i];
        if (!tagValue.name) {
            Message.error(`标签值 ${i + 1} 的名称不能为空`);
            return;
        }
    }
    // 构建完整的标签数据
    const tagData = {
        ...tagForm,
        tagType: 'rule',
        createUser: '当前用户',
        createTime: new Date().toISOString(),
        tagValues: tagValues.value
    };
    console.log('保存标签数据:', tagData);
    Message.success('标签创建成功');
    // 返回标签管理页面
    goBack();
};
// 返回标签管理页面
const goBack = () => {
    router.push({ name: 'tag-management' });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-tabs-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-create']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-config']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-create" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "breadcrumb" },
});
const __VLS_0 = {}.ABreadcrumb;
/** @type {[typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.goBack)
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_16 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (__VLS_ctx.goBack)
};
__VLS_23.slots.default;
var __VLS_23;
const __VLS_28 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onClick: (__VLS_ctx.saveTag)
};
__VLS_31.slots.default;
var __VLS_31;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_36 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    gutter: (24),
}));
const __VLS_38 = __VLS_37({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    span: (24),
}));
const __VLS_42 = __VLS_41({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ class: "basic-info-card" },
}));
const __VLS_46 = __VLS_45({
    ...{ class: "basic-info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_47.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    const __VLS_48 = {}.IconSettings;
    /** @type {[typeof __VLS_components.IconSettings, typeof __VLS_components.iconSettings, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ style: {} },
    }));
    const __VLS_50 = __VLS_49({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
const __VLS_52 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    model: (__VLS_ctx.tagForm),
    layout: "vertical",
}));
const __VLS_54 = __VLS_53({
    model: (__VLS_ctx.tagForm),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    gutter: (16),
}));
const __VLS_58 = __VLS_57({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    span: (8),
}));
const __VLS_62 = __VLS_61({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "标签ID",
    required: true,
}));
const __VLS_66 = __VLS_65({
    label: "标签ID",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.tagForm.id),
    placeholder: "请输入标签ID",
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.tagForm.id),
    placeholder: "请输入标签ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_67;
var __VLS_63;
const __VLS_72 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    span: (8),
}));
const __VLS_74 = __VLS_73({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "标签名称",
    required: true,
}));
const __VLS_78 = __VLS_77({
    label: "标签名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.tagForm.name),
    placeholder: "请输入标签名称",
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.tagForm.name),
    placeholder: "请输入标签名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
var __VLS_79;
var __VLS_75;
const __VLS_84 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    span: (8),
}));
const __VLS_86 = __VLS_85({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "数据类型",
    required: true,
}));
const __VLS_90 = __VLS_89({
    label: "数据类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.tagForm.dataType),
    placeholder: "请选择数据类型",
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.tagForm.dataType),
    placeholder: "请选择数据类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    value: "string",
}));
const __VLS_98 = __VLS_97({
    value: "string",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
var __VLS_99;
const __VLS_100 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    value: "number",
}));
const __VLS_102 = __VLS_101({
    value: "number",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
var __VLS_103;
var __VLS_95;
var __VLS_91;
var __VLS_87;
var __VLS_59;
const __VLS_104 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    gutter: (16),
}));
const __VLS_106 = __VLS_105({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    span: (8),
}));
const __VLS_110 = __VLS_109({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "标签分类",
    required: true,
}));
const __VLS_114 = __VLS_113({
    label: "标签分类",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.tagForm.category),
    placeholder: "请选择标签分类",
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.tagForm.category),
    placeholder: "请选择标签分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    value: "basic",
}));
const __VLS_122 = __VLS_121({
    value: "basic",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
var __VLS_123;
const __VLS_124 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    value: "behavior",
}));
const __VLS_126 = __VLS_125({
    value: "behavior",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
var __VLS_127;
const __VLS_128 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    value: "preference",
}));
const __VLS_130 = __VLS_129({
    value: "preference",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
var __VLS_131;
const __VLS_132 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    value: "business",
}));
const __VLS_134 = __VLS_133({
    value: "business",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
var __VLS_119;
var __VLS_115;
var __VLS_111;
const __VLS_136 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    span: (8),
}));
const __VLS_138 = __VLS_137({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    label: "维度主键",
    required: true,
}));
const __VLS_142 = __VLS_141({
    label: "维度主键",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    modelValue: (__VLS_ctx.tagForm.dimensionKey),
    placeholder: "请输入维度主键",
}));
const __VLS_146 = __VLS_145({
    modelValue: (__VLS_ctx.tagForm.dimensionKey),
    placeholder: "请输入维度主键",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
var __VLS_143;
var __VLS_139;
const __VLS_148 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    span: (8),
}));
const __VLS_150 = __VLS_149({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "共享级别",
}));
const __VLS_154 = __VLS_153({
    label: "共享级别",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.tagForm.shareLevel),
    placeholder: "请选择共享级别",
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.tagForm.shareLevel),
    placeholder: "请选择共享级别",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    value: "public",
}));
const __VLS_162 = __VLS_161({
    value: "public",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
var __VLS_163;
const __VLS_164 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    value: "private",
}));
const __VLS_166 = __VLS_165({
    value: "private",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
var __VLS_167;
var __VLS_159;
var __VLS_155;
var __VLS_151;
var __VLS_107;
const __VLS_168 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "标签描述",
}));
const __VLS_170 = __VLS_169({
    label: "标签描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.tagForm.description),
    placeholder: "请输入标签描述",
    rows: (3),
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.tagForm.description),
    placeholder: "请输入标签描述",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
var __VLS_171;
var __VLS_55;
var __VLS_47;
var __VLS_43;
const __VLS_176 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    span: (24),
}));
const __VLS_178 = __VLS_177({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    ...{ class: "tag-values-card" },
}));
const __VLS_182 = __VLS_181({
    ...{ class: "tag-values-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_183.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    const __VLS_184 = {}.IconTags;
    /** @type {[typeof __VLS_components.IconTags, typeof __VLS_components.iconTags, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        ...{ style: {} },
    }));
    const __VLS_186 = __VLS_185({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-values-config" },
});
const __VLS_188 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    ...{ 'onAdd': {} },
    ...{ 'onDelete': {} },
    activeKey: (__VLS_ctx.activeTabKey),
    type: "editable-card",
    editable: (true),
    showAddButton: true,
}));
const __VLS_190 = __VLS_189({
    ...{ 'onAdd': {} },
    ...{ 'onDelete': {} },
    activeKey: (__VLS_ctx.activeTabKey),
    type: "editable-card",
    editable: (true),
    showAddButton: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
let __VLS_192;
let __VLS_193;
let __VLS_194;
const __VLS_195 = {
    onAdd: (__VLS_ctx.addTagValue)
};
const __VLS_196 = {
    onDelete: (__VLS_ctx.deleteTagValue)
};
__VLS_191.slots.default;
for (const [tagValue, index] of __VLS_getVForSourceType((__VLS_ctx.tagValues))) {
    const __VLS_197 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
        key: (__VLS_ctx.getTabKey(index)),
        title: (tagValue.name || `标签值${index + 1}`),
        closable: (__VLS_ctx.tagValues.length > 1),
    }));
    const __VLS_199 = __VLS_198({
        key: (__VLS_ctx.getTabKey(index)),
        title: (tagValue.name || `标签值${index + 1}`),
        closable: (__VLS_ctx.tagValues.length > 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_198));
    __VLS_200.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tag-value-config" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "section-title" },
    });
    const __VLS_201 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
        model: (tagValue),
        layout: "vertical",
    }));
    const __VLS_203 = __VLS_202({
        model: (tagValue),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_202));
    __VLS_204.slots.default;
    const __VLS_205 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
        gutter: (16),
    }));
    const __VLS_207 = __VLS_206({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_206));
    __VLS_208.slots.default;
    const __VLS_209 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
        span: (12),
    }));
    const __VLS_211 = __VLS_210({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    __VLS_212.slots.default;
    const __VLS_213 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
        label: "标签值名称",
        required: true,
    }));
    const __VLS_215 = __VLS_214({
        label: "标签值名称",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_214));
    __VLS_216.slots.default;
    const __VLS_217 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
        ...{ 'onInput': {} },
        modelValue: (tagValue.name),
        placeholder: "请输入标签值名称",
    }));
    const __VLS_219 = __VLS_218({
        ...{ 'onInput': {} },
        modelValue: (tagValue.name),
        placeholder: "请输入标签值名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    let __VLS_221;
    let __VLS_222;
    let __VLS_223;
    const __VLS_224 = {
        onInput: (...[$event]) => {
            __VLS_ctx.updateTabTitle(index);
        }
    };
    var __VLS_220;
    var __VLS_216;
    var __VLS_212;
    const __VLS_225 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
        span: (12),
    }));
    const __VLS_227 = __VLS_226({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_226));
    __VLS_228.slots.default;
    const __VLS_229 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
        label: "标签值",
    }));
    const __VLS_231 = __VLS_230({
        label: "标签值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    __VLS_232.slots.default;
    const __VLS_233 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
        modelValue: (tagValue.value),
        placeholder: "请输入标签值",
    }));
    const __VLS_235 = __VLS_234({
        modelValue: (tagValue.value),
        placeholder: "请输入标签值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    var __VLS_232;
    var __VLS_228;
    var __VLS_208;
    const __VLS_237 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
        label: "描述",
    }));
    const __VLS_239 = __VLS_238({
        label: "描述",
    }, ...__VLS_functionalComponentArgsRest(__VLS_238));
    __VLS_240.slots.default;
    const __VLS_241 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
        modelValue: (tagValue.description),
        placeholder: "请输入标签值描述",
        rows: (2),
    }));
    const __VLS_243 = __VLS_242({
        modelValue: (tagValue.description),
        placeholder: "请输入标签值描述",
        rows: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    var __VLS_240;
    var __VLS_204;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "config-section" },
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
    (tagValue.conditionGroups.length);
    /** @type {[typeof ConditionConfig, ]} */ ;
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(ConditionConfig, new ConditionConfig({
        ...{ 'onAddConditionGroup': {} },
        ...{ 'onAddExcludeConditionGroup': {} },
        ...{ 'onDeleteExcludeConditionGroup': {} },
        ...{ 'onDeleteConditionGroup': {} },
        ...{ 'onToggleGroupLogic': {} },
        ...{ 'onToggleCrossGroupLogic': {} },
        ...{ 'onAddConditionByType': {} },
        ...{ 'onRemoveCondition': {} },
        conditionGroups: (tagValue.conditionGroups),
        crossGroupLogic: (tagValue.crossGroupLogic || 'or'),
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
    const __VLS_246 = __VLS_245({
        ...{ 'onAddConditionGroup': {} },
        ...{ 'onAddExcludeConditionGroup': {} },
        ...{ 'onDeleteExcludeConditionGroup': {} },
        ...{ 'onDeleteConditionGroup': {} },
        ...{ 'onToggleGroupLogic': {} },
        ...{ 'onToggleCrossGroupLogic': {} },
        ...{ 'onAddConditionByType': {} },
        ...{ 'onRemoveCondition': {} },
        conditionGroups: (tagValue.conditionGroups),
        crossGroupLogic: (tagValue.crossGroupLogic || 'or'),
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
    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    let __VLS_248;
    let __VLS_249;
    let __VLS_250;
    const __VLS_251 = {
        onAddConditionGroup: (() => __VLS_ctx.addConditionGroup(index))
    };
    const __VLS_252 = {
        onAddExcludeConditionGroup: (() => __VLS_ctx.addExcludeConditionGroup(index))
    };
    const __VLS_253 = {
        onDeleteExcludeConditionGroup: ((groupIndex) => __VLS_ctx.deleteExcludeConditionGroup(index, groupIndex))
    };
    const __VLS_254 = {
        onDeleteConditionGroup: ((groupIndex) => __VLS_ctx.deleteConditionGroup(index, groupIndex))
    };
    const __VLS_255 = {
        onToggleGroupLogic: ((group) => __VLS_ctx.toggleGroupLogic(index, group))
    };
    const __VLS_256 = {
        onToggleCrossGroupLogic: (() => __VLS_ctx.toggleCrossGroupLogic(index))
    };
    const __VLS_257 = {
        onAddConditionByType: ((group, type) => __VLS_ctx.addConditionByType(index, group, type))
    };
    const __VLS_258 = {
        onRemoveCondition: ((group, conditionIndex) => __VLS_ctx.removeCondition(index, group, conditionIndex))
    };
    var __VLS_247;
    var __VLS_200;
}
var __VLS_191;
if (__VLS_ctx.tagValues.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    const __VLS_259 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
        ...{ style: {} },
    }));
    const __VLS_261 = __VLS_260({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_260));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
var __VLS_183;
var __VLS_179;
var __VLS_39;
/** @type {__VLS_StyleScopedClasses['tag-create']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-values-config']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-value-config']} */ ;
/** @type {__VLS_StyleScopedClasses['config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-info']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-count']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconSettings: IconSettings,
            IconTags: IconTags,
            ConditionConfig: ConditionConfig,
            tagForm: tagForm,
            tagValues: tagValues,
            activeTabKey: activeTabKey,
            getTabKey: getTabKey,
            addTagValue: addTagValue,
            deleteTagValue: deleteTagValue,
            updateTabTitle: updateTabTitle,
            addConditionGroup: addConditionGroup,
            addExcludeConditionGroup: addExcludeConditionGroup,
            deleteConditionGroup: deleteConditionGroup,
            deleteExcludeConditionGroup: deleteExcludeConditionGroup,
            toggleCrossGroupLogic: toggleCrossGroupLogic,
            toggleGroupLogic: toggleGroupLogic,
            addConditionByType: addConditionByType,
            removeCondition: removeCondition,
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
            saveTag: saveTag,
            goBack: goBack,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
