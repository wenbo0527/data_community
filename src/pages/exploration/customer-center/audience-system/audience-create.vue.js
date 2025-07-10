/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconUpload } from '@arco-design/web-vue/es/icon';
import ConditionConfig from '@/components/common/ConditionConfig.vue';
const router = useRouter();
const route = useRoute();
// 获取创建模式和编辑状态
const createMode = ref(route.query.mode || 'rule'); // rule | import
const isEditMode = ref(!!route.params.id);
const saving = ref(false);
const preCalculating = ref(false);
const showPreviewResult = ref(false);
// 人群表单数据
const audienceForm = reactive({
    basic: {
        name: '',
        audienceType: 'rule',
        shareLevel: 'public',
        updateFrequency: 'daily',
        expireDate: null,
        description: ''
    },
    conditionGroups: [],
    crossGroupLogic: 'or',
    import: {
        method: 'file',
        fileList: []
    }
});
// 预览统计数据
const previewStats = reactive({
    totalCount: 0,
    ruleCount: 0,
    coverage: 0,
    estimatedTime: 0
});
// 页面标题和描述
const getPageTitle = () => {
    if (isEditMode.value) {
        return '编辑人群';
    }
    return createMode.value === 'rule' ? '自定义规则创建人群' : '数据导入创建人群';
};
const getPageDescription = () => {
    if (isEditMode.value) {
        return '修改人群配置信息';
    }
    return createMode.value === 'rule'
        ? '通过配置条件规则来定义人群范围，支持标签、事件、明细数据三种类型'
        : '通过文件上传、数据库导入或API接口导入人群数据';
};
// 计算属性：是否可以进行预计算
const canPreCalculate = computed(() => {
    // 基本信息必须填写完整
    if (!audienceForm.basic.name || !audienceForm.basic.audienceType) {
        return false;
    }
    // 规则创建模式需要至少一个条件组
    if (createMode.value === 'rule' && audienceForm.conditionGroups.length === 0) {
        return false;
    }
    // 导入模式需要上传文件
    if (createMode.value === 'import' && audienceForm.import.method === 'file' && audienceForm.import.fileList.length === 0) {
        return false;
    }
    return true;
});
// 条件配置相关函数
const addConditionGroup = () => {
    audienceForm.conditionGroups.push({
        id: Date.now().toString(),
        logic: 'and',
        conditions: [{
                id: Date.now().toString() + '_1',
                type: 'tag',
                dataSourceType: 'tag',
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
};
const addExcludeConditionGroup = () => {
    audienceForm.conditionGroups.push({
        id: Date.now().toString(),
        logic: 'and',
        isExclude: true,
        conditions: [{
                id: Date.now().toString() + '_1',
                type: 'tag',
                dataSourceType: 'tag',
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
};
const deleteConditionGroup = (groupIndex) => {
    // 找到常规条件组中的索引
    const regularGroups = audienceForm.conditionGroups.filter(group => !group.isExclude);
    if (groupIndex >= 0 && groupIndex < regularGroups.length) {
        const targetGroup = regularGroups[groupIndex];
        const actualIndex = audienceForm.conditionGroups.indexOf(targetGroup);
        audienceForm.conditionGroups.splice(actualIndex, 1);
    }
};
const deleteExcludeConditionGroup = (groupIndex) => {
    // 找到排除条件组中的索引
    const excludeGroups = audienceForm.conditionGroups.filter(group => group.isExclude);
    if (groupIndex >= 0 && groupIndex < excludeGroups.length) {
        const targetGroup = excludeGroups[groupIndex];
        const actualIndex = audienceForm.conditionGroups.indexOf(targetGroup);
        audienceForm.conditionGroups.splice(actualIndex, 1);
    }
};
const toggleCrossGroupLogic = () => {
    audienceForm.crossGroupLogic = audienceForm.crossGroupLogic === 'and' ? 'or' : 'and';
};
const toggleGroupLogic = (group) => {
    group.logic = group.logic === 'and' ? 'or' : 'and';
};
const addConditionByType = (group, type) => {
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
};
const removeCondition = (group, conditionIndex) => {
    if (group.conditions && conditionIndex >= 0 && conditionIndex < group.conditions.length) {
        group.conditions.splice(conditionIndex, 1);
    }
};
// ConditionConfig组件所需的数据选项
const dataSourceTypeOptions = [
    { label: '标签', value: 'tag' },
    { label: '事件', value: 'event' },
    { label: '明细数据', value: 'detail' }
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
        tag: [
            { label: '年龄', value: 'age' },
            { label: '性别', value: 'gender' },
            { label: '城市', value: 'city' },
            { label: '收入', value: 'income' },
            { label: '职业', value: 'occupation' },
            { label: '教育程度', value: 'education' }
        ],
        event: [
            { label: '登录事件', value: 'login_event' },
            { label: '购买事件', value: 'purchase_event' },
            { label: '浏览事件', value: 'view_event' },
            { label: '点击事件', value: 'click_event' },
            { label: '分享事件', value: 'share_event' }
        ],
        detail: [
            { label: '用户ID', value: 'user_id' },
            { label: '订单金额', value: 'order_amount' },
            { label: '订单时间', value: 'order_time' },
            { label: '商品类别', value: 'product_category' },
            { label: '支付方式', value: 'payment_method' }
        ]
    };
    return fieldMap[dataSourceType] || [];
};
// 获取聚合选项
const getAggregationOptions = (dataSourceType) => {
    if (dataSourceType === 'tag') {
        return [];
    }
    return [
        { label: '计数', value: 'count' },
        { label: '求和', value: 'sum' },
        { label: '平均值', value: 'avg' },
        { label: '最大值', value: 'max' },
        { label: '最小值', value: 'min' },
        { label: '去重计数', value: 'distinct_count' }
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
// 文件上传处理
const handleFileChange = (fileList) => {
    audienceForm.import.fileList = fileList;
};
// 预计算
const preCalculate = async () => {
    preCalculating.value = true;
    try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000));
        // 更新预览统计
        previewStats.totalCount = Math.floor(Math.random() * 100000) + 10000;
        previewStats.ruleCount = audienceForm.conditionGroups.length;
        previewStats.coverage = Math.floor(Math.random() * 30) + 70;
        previewStats.estimatedTime = Math.floor(Math.random() * 10) + 1;
        // 显示预览结果
        showPreviewResult.value = true;
        Message.success('预计算完成');
    }
    catch (error) {
        Message.error('预计算失败');
    }
    finally {
        preCalculating.value = false;
    }
};
// 保存人群
const saveAudience = async () => {
    // 如果还没有预计算，先进行预计算
    if (!showPreviewResult.value) {
        Message.warning('请先进行预计算');
        return;
    }
    saving.value = true;
    try {
        // 生成人群ID（如果是新建模式）
        const audienceId = isEditMode.value ? route.params.id : `AUD_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        // 构建完整的人群数据
        const audienceData = {
            id: audienceId,
            ...audienceForm.basic,
            createMode: createMode.value,
            conditionGroups: audienceForm.conditionGroups,
            crossGroupLogic: audienceForm.crossGroupLogic,
            importConfig: audienceForm.import,
            createUser: '当前用户',
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            status: 'active'
        };
        console.log('保存人群数据:', audienceData);
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500));
        Message.success(isEditMode.value ? '人群更新成功' : '人群创建成功');
        // 返回人群管理页面
        goBack();
    }
    catch (error) {
        Message.error(isEditMode.value ? '人群更新失败' : '人群创建失败');
    }
    finally {
        saving.value = false;
    }
};
// 返回人群管理页面
const goBack = () => {
    router.push({ name: 'audience-management' });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-breadcrumb-item-link']} */ ;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-breadcrumb-item-link']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['audience-create']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-form']} */ ;
/** @type {__VLS_StyleScopedClasses['rules-config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['import-config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-section']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-result-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "audience-create" },
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
const __VLS_8 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    to: "/exploration/customer-center",
}));
const __VLS_10 = __VLS_9({
    to: "/exploration/customer-center",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
var __VLS_7;
const __VLS_12 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    to: "/exploration/customer-center/audience-system/audience-management",
}));
const __VLS_18 = __VLS_17({
    to: "/exploration/customer-center/audience-system/audience-management",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
var __VLS_19;
var __VLS_15;
const __VLS_20 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
(__VLS_ctx.getPageTitle());
var __VLS_23;
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
(__VLS_ctx.getPageTitle());
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
(__VLS_ctx.getPageDescription());
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_24 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ class: "form-card" },
}));
const __VLS_26 = __VLS_25({
    ...{ class: "form-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_27.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-title" },
    });
}
const __VLS_28 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    model: (__VLS_ctx.audienceForm.basic),
    layout: "vertical",
    ...{ class: "basic-form" },
}));
const __VLS_30 = __VLS_29({
    model: (__VLS_ctx.audienceForm.basic),
    layout: "vertical",
    ...{ class: "basic-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    gutter: (24),
}));
const __VLS_34 = __VLS_33({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    span: (12),
}));
const __VLS_38 = __VLS_37({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "人群名称",
    required: true,
}));
const __VLS_42 = __VLS_41({
    label: "人群名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.audienceForm.basic.name),
    placeholder: "请输入人群名称",
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.audienceForm.basic.name),
    placeholder: "请输入人群名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
var __VLS_39;
const __VLS_48 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    span: (12),
}));
const __VLS_50 = __VLS_49({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "人群类型",
    required: true,
}));
const __VLS_54 = __VLS_53({
    label: "人群类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.audienceForm.basic.audienceType),
    placeholder: "请选择人群类型",
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.audienceForm.basic.audienceType),
    placeholder: "请选择人群类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    value: "static",
}));
const __VLS_62 = __VLS_61({
    value: "static",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
var __VLS_63;
const __VLS_64 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: "dynamic",
}));
const __VLS_66 = __VLS_65({
    value: "dynamic",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
var __VLS_67;
const __VLS_68 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    value: "computed",
}));
const __VLS_70 = __VLS_69({
    value: "computed",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
const __VLS_72 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "rule",
}));
const __VLS_74 = __VLS_73({
    value: "rule",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
var __VLS_75;
var __VLS_59;
var __VLS_55;
var __VLS_51;
var __VLS_35;
const __VLS_76 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    gutter: (24),
}));
const __VLS_78 = __VLS_77({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    span: (12),
}));
const __VLS_82 = __VLS_81({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "共享级别",
    required: true,
}));
const __VLS_86 = __VLS_85({
    label: "共享级别",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.audienceForm.basic.shareLevel),
    placeholder: "请选择共享级别",
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.audienceForm.basic.shareLevel),
    placeholder: "请选择共享级别",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    value: "public",
}));
const __VLS_94 = __VLS_93({
    value: "public",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
var __VLS_95;
const __VLS_96 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    value: "private",
}));
const __VLS_98 = __VLS_97({
    value: "private",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
var __VLS_99;
const __VLS_100 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    value: "team",
}));
const __VLS_102 = __VLS_101({
    value: "team",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
var __VLS_103;
var __VLS_91;
var __VLS_87;
var __VLS_83;
const __VLS_104 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    span: (12),
}));
const __VLS_106 = __VLS_105({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "更新频率",
}));
const __VLS_110 = __VLS_109({
    label: "更新频率",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.audienceForm.basic.updateFrequency),
    placeholder: "请选择更新频率",
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.audienceForm.basic.updateFrequency),
    placeholder: "请选择更新频率",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    value: "realtime",
}));
const __VLS_118 = __VLS_117({
    value: "realtime",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
var __VLS_119;
const __VLS_120 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    value: "daily",
}));
const __VLS_122 = __VLS_121({
    value: "daily",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
var __VLS_123;
const __VLS_124 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    value: "weekly",
}));
const __VLS_126 = __VLS_125({
    value: "weekly",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
var __VLS_127;
const __VLS_128 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    value: "monthly",
}));
const __VLS_130 = __VLS_129({
    value: "monthly",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
var __VLS_131;
const __VLS_132 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    value: "manual",
}));
const __VLS_134 = __VLS_133({
    value: "manual",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
var __VLS_115;
var __VLS_111;
var __VLS_107;
var __VLS_79;
const __VLS_136 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    gutter: (24),
}));
const __VLS_138 = __VLS_137({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    span: (12),
}));
const __VLS_142 = __VLS_141({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "有效期",
}));
const __VLS_146 = __VLS_145({
    label: "有效期",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ADatePicker;
/** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.audienceForm.basic.expireDate),
    placeholder: "请选择有效期",
    ...{ style: {} },
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.audienceForm.basic.expireDate),
    placeholder: "请选择有效期",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
var __VLS_147;
var __VLS_143;
var __VLS_139;
const __VLS_152 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "人群描述",
}));
const __VLS_154 = __VLS_153({
    label: "人群描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.audienceForm.basic.description),
    placeholder: "请输入人群描述",
    rows: (4),
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.audienceForm.basic.description),
    placeholder: "请输入人群描述",
    rows: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
var __VLS_155;
var __VLS_31;
var __VLS_27;
if (__VLS_ctx.createMode === 'rule') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-section" },
    });
    const __VLS_160 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        ...{ class: "form-card" },
    }));
    const __VLS_162 = __VLS_161({
        ...{ class: "form-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_163.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    {
        const { extra: __VLS_thisSlot } = __VLS_163.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-description" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "rules-config-section" },
    });
    /** @type {[typeof ConditionConfig, ]} */ ;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent(ConditionConfig, new ConditionConfig({
        ...{ 'onAddConditionGroup': {} },
        ...{ 'onAddExcludeConditionGroup': {} },
        ...{ 'onDeleteExcludeConditionGroup': {} },
        ...{ 'onDeleteConditionGroup': {} },
        ...{ 'onToggleGroupLogic': {} },
        ...{ 'onToggleCrossGroupLogic': {} },
        ...{ 'onAddConditionByType': {} },
        ...{ 'onRemoveCondition': {} },
        conditionGroups: (__VLS_ctx.audienceForm.conditionGroups),
        crossGroupLogic: (__VLS_ctx.audienceForm.crossGroupLogic || 'or'),
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
    const __VLS_165 = __VLS_164({
        ...{ 'onAddConditionGroup': {} },
        ...{ 'onAddExcludeConditionGroup': {} },
        ...{ 'onDeleteExcludeConditionGroup': {} },
        ...{ 'onDeleteConditionGroup': {} },
        ...{ 'onToggleGroupLogic': {} },
        ...{ 'onToggleCrossGroupLogic': {} },
        ...{ 'onAddConditionByType': {} },
        ...{ 'onRemoveCondition': {} },
        conditionGroups: (__VLS_ctx.audienceForm.conditionGroups),
        crossGroupLogic: (__VLS_ctx.audienceForm.crossGroupLogic || 'or'),
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
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    let __VLS_167;
    let __VLS_168;
    let __VLS_169;
    const __VLS_170 = {
        onAddConditionGroup: (__VLS_ctx.addConditionGroup)
    };
    const __VLS_171 = {
        onAddExcludeConditionGroup: (__VLS_ctx.addExcludeConditionGroup)
    };
    const __VLS_172 = {
        onDeleteExcludeConditionGroup: (__VLS_ctx.deleteExcludeConditionGroup)
    };
    const __VLS_173 = {
        onDeleteConditionGroup: (__VLS_ctx.deleteConditionGroup)
    };
    const __VLS_174 = {
        onToggleGroupLogic: (__VLS_ctx.toggleGroupLogic)
    };
    const __VLS_175 = {
        onToggleCrossGroupLogic: (__VLS_ctx.toggleCrossGroupLogic)
    };
    const __VLS_176 = {
        onAddConditionByType: (__VLS_ctx.addConditionByType)
    };
    const __VLS_177 = {
        onRemoveCondition: (__VLS_ctx.removeCondition)
    };
    var __VLS_166;
    var __VLS_163;
}
if (__VLS_ctx.createMode === 'import') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-section" },
    });
    const __VLS_178 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
        ...{ class: "form-card" },
    }));
    const __VLS_180 = __VLS_179({
        ...{ class: "form-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    __VLS_181.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_181.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    {
        const { extra: __VLS_thisSlot } = __VLS_181.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-description" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "import-config-section" },
    });
    const __VLS_182 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
        model: (__VLS_ctx.audienceForm.import),
        layout: "vertical",
    }));
    const __VLS_184 = __VLS_183({
        model: (__VLS_ctx.audienceForm.import),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    __VLS_185.slots.default;
    const __VLS_186 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
        label: "导入方式",
    }));
    const __VLS_188 = __VLS_187({
        label: "导入方式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    __VLS_189.slots.default;
    const __VLS_190 = {}.ARadioGroup;
    /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
        modelValue: (__VLS_ctx.audienceForm.import.method),
    }));
    const __VLS_192 = __VLS_191({
        modelValue: (__VLS_ctx.audienceForm.import.method),
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    __VLS_193.slots.default;
    const __VLS_194 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
        value: "file",
    }));
    const __VLS_196 = __VLS_195({
        value: "file",
    }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    __VLS_197.slots.default;
    var __VLS_197;
    const __VLS_198 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
        value: "database",
    }));
    const __VLS_200 = __VLS_199({
        value: "database",
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    __VLS_201.slots.default;
    var __VLS_201;
    const __VLS_202 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
        value: "api",
    }));
    const __VLS_204 = __VLS_203({
        value: "api",
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    __VLS_205.slots.default;
    var __VLS_205;
    var __VLS_193;
    var __VLS_189;
    if (__VLS_ctx.audienceForm.import.method === 'file') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_206 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
            label: "上传文件",
        }));
        const __VLS_208 = __VLS_207({
            label: "上传文件",
        }, ...__VLS_functionalComponentArgsRest(__VLS_207));
        __VLS_209.slots.default;
        const __VLS_210 = {}.AUpload;
        /** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ ;
        // @ts-ignore
        const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
            ...{ 'onChange': {} },
            fileList: (__VLS_ctx.audienceForm.import.fileList),
            showFileList: (true),
            autoUpload: (false),
            accept: ".csv,.xlsx,.json",
        }));
        const __VLS_212 = __VLS_211({
            ...{ 'onChange': {} },
            fileList: (__VLS_ctx.audienceForm.import.fileList),
            showFileList: (true),
            autoUpload: (false),
            accept: ".csv,.xlsx,.json",
        }, ...__VLS_functionalComponentArgsRest(__VLS_211));
        let __VLS_214;
        let __VLS_215;
        let __VLS_216;
        const __VLS_217 = {
            onChange: (__VLS_ctx.handleFileChange)
        };
        __VLS_213.slots.default;
        {
            const { 'upload-button': __VLS_thisSlot } = __VLS_213.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "upload-area" },
            });
            const __VLS_218 = {}.IconUpload;
            /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
            // @ts-ignore
            const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
                ...{ style: {} },
            }));
            const __VLS_220 = __VLS_219({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_219));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
        }
        var __VLS_213;
        var __VLS_209;
    }
    var __VLS_185;
    var __VLS_181;
}
if (__VLS_ctx.showPreviewResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-result-section" },
    });
    const __VLS_222 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({}));
    const __VLS_224 = __VLS_223({}, ...__VLS_functionalComponentArgsRest(__VLS_223));
    __VLS_225.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-result-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "section-description" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-result-content" },
    });
    const __VLS_226 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
        gutter: (24),
    }));
    const __VLS_228 = __VLS_227({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    __VLS_229.slots.default;
    const __VLS_230 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
        span: (6),
    }));
    const __VLS_232 = __VLS_231({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    __VLS_233.slots.default;
    const __VLS_234 = {}.AStatistic;
    /** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
        title: "预估人群规模",
        value: (__VLS_ctx.previewStats.totalCount),
        suffix: "人",
    }));
    const __VLS_236 = __VLS_235({
        title: "预估人群规模",
        value: (__VLS_ctx.previewStats.totalCount),
        suffix: "人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    var __VLS_233;
    const __VLS_238 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
        span: (6),
    }));
    const __VLS_240 = __VLS_239({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_239));
    __VLS_241.slots.default;
    const __VLS_242 = {}.AStatistic;
    /** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({
        title: "规则条件数",
        value: (__VLS_ctx.previewStats.ruleCount),
        suffix: "个",
    }));
    const __VLS_244 = __VLS_243({
        title: "规则条件数",
        value: (__VLS_ctx.previewStats.ruleCount),
        suffix: "个",
    }, ...__VLS_functionalComponentArgsRest(__VLS_243));
    var __VLS_241;
    const __VLS_246 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
        span: (6),
    }));
    const __VLS_248 = __VLS_247({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_247));
    __VLS_249.slots.default;
    const __VLS_250 = {}.AStatistic;
    /** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({
        title: "数据覆盖率",
        value: (__VLS_ctx.previewStats.coverage),
        suffix: "%",
        precision: (2),
    }));
    const __VLS_252 = __VLS_251({
        title: "数据覆盖率",
        value: (__VLS_ctx.previewStats.coverage),
        suffix: "%",
        precision: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    var __VLS_249;
    const __VLS_254 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
        span: (6),
    }));
    const __VLS_256 = __VLS_255({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_255));
    __VLS_257.slots.default;
    const __VLS_258 = {}.AStatistic;
    /** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
        title: "预计执行时间",
        value: (__VLS_ctx.previewStats.estimatedTime),
        suffix: "分钟",
    }));
    const __VLS_260 = __VLS_259({
        title: "预计执行时间",
        value: (__VLS_ctx.previewStats.estimatedTime),
        suffix: "分钟",
    }, ...__VLS_functionalComponentArgsRest(__VLS_259));
    var __VLS_257;
    var __VLS_229;
    var __VLS_225;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-footer" },
});
const __VLS_262 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({}));
const __VLS_264 = __VLS_263({}, ...__VLS_functionalComponentArgsRest(__VLS_263));
__VLS_265.slots.default;
const __VLS_266 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
    ...{ 'onClick': {} },
}));
const __VLS_268 = __VLS_267({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
let __VLS_270;
let __VLS_271;
let __VLS_272;
const __VLS_273 = {
    onClick: (__VLS_ctx.goBack)
};
__VLS_269.slots.default;
var __VLS_269;
if (!__VLS_ctx.showPreviewResult) {
    const __VLS_274 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.preCalculating),
        disabled: (!__VLS_ctx.canPreCalculate),
    }));
    const __VLS_276 = __VLS_275({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.preCalculating),
        disabled: (!__VLS_ctx.canPreCalculate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_275));
    let __VLS_278;
    let __VLS_279;
    let __VLS_280;
    const __VLS_281 = {
        onClick: (__VLS_ctx.preCalculate)
    };
    __VLS_277.slots.default;
    var __VLS_277;
}
if (__VLS_ctx.showPreviewResult) {
    const __VLS_282 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_284 = __VLS_283({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_283));
    let __VLS_286;
    let __VLS_287;
    let __VLS_288;
    const __VLS_289 = {
        onClick: (__VLS_ctx.saveAudience)
    };
    __VLS_285.slots.default;
    (__VLS_ctx.isEditMode ? '保存' : '创建');
    var __VLS_285;
}
var __VLS_265;
/** @type {__VLS_StyleScopedClasses['audience-create']} */ ;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-form']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-description']} */ ;
/** @type {__VLS_StyleScopedClasses['rules-config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-description']} */ ;
/** @type {__VLS_StyleScopedClasses['import-config-section']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-result-section']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-result-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-description']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-result-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            ConditionConfig: ConditionConfig,
            createMode: createMode,
            isEditMode: isEditMode,
            saving: saving,
            preCalculating: preCalculating,
            showPreviewResult: showPreviewResult,
            audienceForm: audienceForm,
            previewStats: previewStats,
            getPageTitle: getPageTitle,
            getPageDescription: getPageDescription,
            canPreCalculate: canPreCalculate,
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
            handleFileChange: handleFileChange,
            preCalculate: preCalculate,
            saveAudience: saveAudience,
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
