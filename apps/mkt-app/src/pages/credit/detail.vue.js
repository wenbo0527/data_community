/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconLeft, IconEdit } from '@arco-design/web-vue/es/icon';
const route = useRoute();
// 变量详情数据
const variableDetail = ref({
    name: '个人基本信息',
    code: 'BASIC_001',
    type: '基础信息',
    supplier: '征信服务商A',
    status: '正常',
    updateTime: '2024-01-08',
    description: '包含个人身份信息、职业信息、居住信息等基础数据项'
});
// 状态标签颜色
const getStatusColor = (status) => {
    const colorMap = {
        '正常': 'green',
        '异常': 'red',
        '维护中': 'orange'
    };
    return colorMap[status] || 'gray';
};
// 基本信息
const basicInfo = computed(() => [
    {
        label: '数据来源',
        value: '人行征信'
    },
    {
        label: '更新频率',
        value: '每日更新'
    },
    {
        label: '数据格式',
        value: 'JSON'
    },
    {
        label: '接入方式',
        value: 'API接口'
    }
]);
// 数据规则信息
const ruleInfo = ref([
    {
        label: '数据长度',
        value: '不限'
    },
    {
        label: '数据类型',
        value: 'String'
    },
    {
        label: '是否必填',
        value: '是'
    },
    {
        label: '验证规则',
        value: '身份证号码格式'
    }
]);
// 字段信息表格配置
const fieldColumns = [
    {
        title: '字段名称',
        dataIndex: 'name'
    },
    {
        title: '字段类型',
        dataIndex: 'type'
    },
    {
        title: '是否必填',
        dataIndex: 'required'
    },
    {
        title: '描述',
        dataIndex: 'description'
    }
];
// 字段数据
const fieldData = [
    {
        name: 'name',
        type: 'String',
        required: '是',
        description: '姓名'
    },
    {
        name: 'idCard',
        type: 'String',
        required: '是',
        description: '身份证号'
    },
    {
        name: 'occupation',
        type: 'String',
        required: '否',
        description: '职业'
    }
];
// 使用情况
const usageInfo = ref([
    {
        label: '调用次数',
        value: '12,345'
    },
    {
        label: '成功率',
        value: '99.9%'
    },
    {
        label: '平均耗时',
        value: '200ms'
    },
    {
        label: '最近调用',
        value: '2024-01-08 12:00:00'
    }
]);
// 评估报告
const evaluationInfo = ref([
    {
        label: '数据质量',
        value: '优'
    },
    {
        label: '覆盖率',
        value: '95%'
    },
    {
        label: '准确率',
        value: '99%'
    },
    {
        label: '时效性',
        value: '实时'
    }
]);
// 编辑表单
const editDrawerVisible = ref(false);
const editFormRef = ref(null);
const editForm = ref({
    type: '',
    supplier: '',
    description: ''
});
// 表单校验规则
const editFormRules = {
    type: [{ required: true, message: '请选择变量类型' }],
    supplier: [{ required: true, message: '请输入供应商' }]
};
// 编辑相关方法
const handleEdit = () => {
    editForm.value = {
        type: variableDetail.value.type,
        supplier: variableDetail.value.supplier,
        description: variableDetail.value.description
    };
    editDrawerVisible.value = true;
};
const handleEditCancel = () => {
    editDrawerVisible.value = false;
    editFormRef.value?.resetFields();
};
const handleEditSubmit = async () => {
    try {
        await editFormRef.value?.validate();
        // TODO: 调用接口保存数据
        console.log('保存编辑数据:', editForm.value);
        // 模拟保存成功
        variableDetail.value = {
            ...variableDetail.value,
            type: editForm.value.type,
            supplier: editForm.value.supplier,
            description: editForm.value.description
        };
        Message.success('保存成功');
        editDrawerVisible.value = false;
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
// 获取路由参数
const variableId = computed(() => route.params.id);
// 在组件挂载时获取数据
onMounted(async () => {
    try {
        // TODO: 根据variableId获取数据详情
        console.log('获取数据详情:', variableId.value);
        // 模拟异步获取数据
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    catch (error) {
        Message.error('获取数据详情失败');
    }
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "credit-detail-page" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    bordered: (false),
    ...{ class: "main-info" },
}));
const __VLS_2 = __VLS_1({
    bordered: (false),
    ...{ class: "main-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    gutter: (24),
}));
const __VLS_6 = __VLS_5({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    span: (18),
}));
const __VLS_10 = __VLS_9({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    direction: "vertical",
    fill: true,
}));
const __VLS_14 = __VLS_13({
    direction: "vertical",
    fill: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-section" },
});
const __VLS_16 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    align: "center",
}));
const __VLS_18 = __VLS_17({
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    type: "text",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
__VLS_23.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_23.slots;
    const __VLS_28 = {}.IconLeft;
    /** @type {[typeof __VLS_components.IconLeft, typeof __VLS_components.iconLeft, ]} */ 
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
let __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "data-title" },
});
(__VLS_ctx.variableDetail.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-group" },
});
const __VLS_32 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    color: (__VLS_ctx.getStatusColor(__VLS_ctx.variableDetail.status)),
}));
const __VLS_34 = __VLS_33({
    color: (__VLS_ctx.getStatusColor(__VLS_ctx.variableDetail.status)),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
(__VLS_ctx.variableDetail.status);
let __VLS_35;
let __VLS_19;
const __VLS_36 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}));
const __VLS_38 = __VLS_37({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "变量编号",
}));
const __VLS_42 = __VLS_41({
    label: "变量编号",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
(__VLS_ctx.variableDetail.code);
let __VLS_43;
const __VLS_44 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "变量类型",
}));
const __VLS_46 = __VLS_45({
    label: "变量类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
(__VLS_ctx.variableDetail.type);
let __VLS_47;
const __VLS_48 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "供应商",
}));
const __VLS_50 = __VLS_49({
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
(__VLS_ctx.variableDetail.supplier);
let __VLS_51;
const __VLS_52 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "更新时间",
}));
const __VLS_54 = __VLS_53({
    label: "更新时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
(__VLS_ctx.variableDetail.updateTime);
let __VLS_55;
const __VLS_56 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "变量描述",
    span: (2),
}));
const __VLS_58 = __VLS_57({
    label: "变量描述",
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
(__VLS_ctx.variableDetail.description);
let __VLS_59;
let __VLS_39;
let __VLS_15;
let __VLS_11;
const __VLS_60 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    span: (6),
    ...{ class: "action-panel" },
}));
const __VLS_62 = __VLS_61({
    span: (6),
    ...{ class: "action-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_70 = __VLS_69({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onClick: (__VLS_ctx.handleEdit)
};
__VLS_71.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_71.slots;
    const __VLS_76 = {}.IconEdit;
    /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ 
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
}
let __VLS_71;
let __VLS_67;
let __VLS_63;
let __VLS_7;
let __VLS_3;
const __VLS_80 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    bordered: (false),
    ...{ class: "main-card" },
}));
const __VLS_82 = __VLS_81({
    bordered: (false),
    ...{ class: "main-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    key: "1",
    title: "基本信息",
}));
const __VLS_90 = __VLS_89({
    key: "1",
    title: "基本信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_94 = __VLS_93({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    column: (2),
    data: (__VLS_ctx.basicInfo),
}));
const __VLS_98 = __VLS_97({
    column: (2),
    data: (__VLS_ctx.basicInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
let __VLS_95;
let __VLS_91;
const __VLS_100 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    key: "2",
    title: "数据规则",
}));
const __VLS_102 = __VLS_101({
    key: "2",
    title: "数据规则",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_106 = __VLS_105({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    column: (2),
    data: (__VLS_ctx.ruleInfo),
}));
const __VLS_110 = __VLS_109({
    column: (2),
    data: (__VLS_ctx.ruleInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
const __VLS_112 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ 
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ style: {} },
}));
const __VLS_114 = __VLS_113({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_116 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    columns: (__VLS_ctx.fieldColumns),
    data: (__VLS_ctx.fieldData),
    pagination: (false),
}));
const __VLS_118 = __VLS_117({
    columns: (__VLS_ctx.fieldColumns),
    data: (__VLS_ctx.fieldData),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
let __VLS_107;
let __VLS_103;
const __VLS_120 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    key: "3",
    title: "使用情况",
}));
const __VLS_122 = __VLS_121({
    key: "3",
    title: "使用情况",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_126 = __VLS_125({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}));
const __VLS_130 = __VLS_129({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
let __VLS_127;
let __VLS_123;
const __VLS_132 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    key: "4",
    title: "评估报告",
}));
const __VLS_134 = __VLS_133({
    key: "4",
    title: "评估报告",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_138 = __VLS_137({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}));
const __VLS_142 = __VLS_141({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
let __VLS_139;
let __VLS_135;
let __VLS_87;
let __VLS_83;
const __VLS_144 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ 
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    ...{ 'onCancel': {} },
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.editDrawerVisible),
    title: "编辑信息",
    width: "600px",
}));
const __VLS_146 = __VLS_145({
    ...{ 'onCancel': {} },
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.editDrawerVisible),
    title: "编辑信息",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_148;
let __VLS_149;
let __VLS_150;
const __VLS_151 = {
    onCancel: (__VLS_ctx.handleEditCancel)
};
const __VLS_152 = {
    onOk: (__VLS_ctx.handleEditSubmit)
};
__VLS_147.slots.default;
const __VLS_153 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}));
const __VLS_155 = __VLS_154({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
/** @type {typeof __VLS_ctx.editFormRef} */ 
const __VLS_157 = {};
__VLS_156.slots.default;
const __VLS_159 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
    field: "type",
    label: "变量类型",
    required: true,
}));
const __VLS_161 = __VLS_160({
    field: "type",
    label: "变量类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
__VLS_162.slots.default;
const __VLS_163 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({
    modelValue: (__VLS_ctx.editForm.type),
}));
const __VLS_165 = __VLS_164({
    modelValue: (__VLS_ctx.editForm.type),
}, ...__VLS_functionalComponentArgsRest(__VLS_164));
__VLS_166.slots.default;
const __VLS_167 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
    value: "基础信息",
}));
const __VLS_169 = __VLS_168({
    value: "基础信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_168));
__VLS_170.slots.default;
let __VLS_170;
const __VLS_171 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
    value: "信贷记录",
}));
const __VLS_173 = __VLS_172({
    value: "信贷记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_172));
__VLS_174.slots.default;
let __VLS_174;
const __VLS_175 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
    value: "还款记录",
}));
const __VLS_177 = __VLS_176({
    value: "还款记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_176));
__VLS_178.slots.default;
let __VLS_178;
const __VLS_179 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
    value: "征信评分",
}));
const __VLS_181 = __VLS_180({
    value: "征信评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
__VLS_182.slots.default;
let __VLS_182;
let __VLS_166;
let __VLS_162;
const __VLS_183 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
    field: "supplier",
    label: "供应商",
    required: true,
}));
const __VLS_185 = __VLS_184({
    field: "supplier",
    label: "供应商",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_184));
__VLS_186.slots.default;
const __VLS_187 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}));
const __VLS_189 = __VLS_188({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_188));
let __VLS_186;
const __VLS_191 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
    field: "description",
    label: "变量描述",
}));
const __VLS_193 = __VLS_192({
    field: "description",
    label: "变量描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_192));
__VLS_194.slots.default;
const __VLS_195 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入变量描述",
}));
const __VLS_197 = __VLS_196({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入变量描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_196));
let __VLS_194;
let __VLS_156;
let __VLS_147;
/** @type {__VLS_StyleScopedClasses['credit-detail-page']} */ 
/** @type {__VLS_StyleScopedClasses['main-info']} */ 
/** @type {__VLS_StyleScopedClasses['title-section']} */ 
/** @type {__VLS_StyleScopedClasses['data-title']} */ 
/** @type {__VLS_StyleScopedClasses['tag-group']} */ 
/** @type {__VLS_StyleScopedClasses['basic-info']} */ 
/** @type {__VLS_StyleScopedClasses['action-panel']} */ 
/** @type {__VLS_StyleScopedClasses['main-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
// @ts-ignore
const __VLS_158 = __VLS_157;
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconLeft: IconLeft,
            IconEdit: IconEdit,
            variableDetail: variableDetail,
            getStatusColor: getStatusColor,
            basicInfo: basicInfo,
            ruleInfo: ruleInfo,
            fieldColumns: fieldColumns,
            fieldData: fieldData,
            usageInfo: usageInfo,
            evaluationInfo: evaluationInfo,
            editDrawerVisible: editDrawerVisible,
            editFormRef: editFormRef,
            editForm: editForm,
            editFormRules: editFormRules,
            handleEdit: handleEdit,
            handleEditCancel: handleEditCancel,
            handleEditSubmit: handleEditSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
