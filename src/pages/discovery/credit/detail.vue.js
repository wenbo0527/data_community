/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "content" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    bordered: (false),
    ...{ class: "main-info" },
}));
const __VLS_11 = __VLS_10({
    bordered: (false),
    ...{ class: "main-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    gutter: (24),
}));
const __VLS_15 = __VLS_14({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    span: (18),
}));
const __VLS_19 = __VLS_18({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    direction: "vertical",
    fill: true,
}));
const __VLS_23 = __VLS_22({
    direction: "vertical",
    fill: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-section" },
});
const __VLS_25 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    align: "center",
}));
const __VLS_27 = __VLS_26({
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
const __VLS_29 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onClick': {} },
    type: "text",
}));
const __VLS_31 = __VLS_30({
    ...{ 'onClick': {} },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
__VLS_32.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_32.slots;
    const __VLS_37 = {}.IconLeft;
    /** @type {[typeof __VLS_components.IconLeft, typeof __VLS_components.iconLeft, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({}));
    const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
}
var __VLS_32;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "data-title" },
});
(__VLS_ctx.variableDetail.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-group" },
});
const __VLS_41 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    color: (__VLS_ctx.getStatusColor(__VLS_ctx.variableDetail.status)),
}));
const __VLS_43 = __VLS_42({
    color: (__VLS_ctx.getStatusColor(__VLS_ctx.variableDetail.status)),
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
(__VLS_ctx.variableDetail.status);
var __VLS_44;
var __VLS_28;
const __VLS_45 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}));
const __VLS_47 = __VLS_46({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
const __VLS_49 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    label: "变量编号",
}));
const __VLS_51 = __VLS_50({
    label: "变量编号",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
(__VLS_ctx.variableDetail.code);
var __VLS_52;
const __VLS_53 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    label: "变量类型",
}));
const __VLS_55 = __VLS_54({
    label: "变量类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
(__VLS_ctx.variableDetail.type);
var __VLS_56;
const __VLS_57 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    label: "供应商",
}));
const __VLS_59 = __VLS_58({
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
(__VLS_ctx.variableDetail.supplier);
var __VLS_60;
const __VLS_61 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    label: "更新时间",
}));
const __VLS_63 = __VLS_62({
    label: "更新时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
(__VLS_ctx.variableDetail.updateTime);
var __VLS_64;
const __VLS_65 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    label: "变量描述",
    span: (2),
}));
const __VLS_67 = __VLS_66({
    label: "变量描述",
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
(__VLS_ctx.variableDetail.description);
var __VLS_68;
var __VLS_48;
var __VLS_24;
var __VLS_20;
const __VLS_69 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    span: (6),
    ...{ class: "action-panel" },
}));
const __VLS_71 = __VLS_70({
    span: (6),
    ...{ class: "action-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
const __VLS_73 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({}));
const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
const __VLS_77 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_79 = __VLS_78({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
let __VLS_81;
let __VLS_82;
let __VLS_83;
const __VLS_84 = {
    onClick: (__VLS_ctx.handleEdit)
};
__VLS_80.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_80.slots;
    const __VLS_85 = {}.IconEdit;
    /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
    const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
}
var __VLS_80;
var __VLS_76;
var __VLS_72;
var __VLS_16;
var __VLS_12;
const __VLS_89 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    bordered: (false),
    ...{ class: "main-card" },
}));
const __VLS_91 = __VLS_90({
    bordered: (false),
    ...{ class: "main-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
const __VLS_93 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
const __VLS_97 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    key: "1",
    title: "基本信息",
}));
const __VLS_99 = __VLS_98({
    key: "1",
    title: "基本信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
const __VLS_101 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_103 = __VLS_102({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
__VLS_104.slots.default;
const __VLS_105 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    column: (2),
    data: (__VLS_ctx.basicInfo),
}));
const __VLS_107 = __VLS_106({
    column: (2),
    data: (__VLS_ctx.basicInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
var __VLS_104;
var __VLS_100;
const __VLS_109 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    key: "2",
    title: "数据规则",
}));
const __VLS_111 = __VLS_110({
    key: "2",
    title: "数据规则",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
__VLS_112.slots.default;
const __VLS_113 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_115 = __VLS_114({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
__VLS_116.slots.default;
const __VLS_117 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    column: (2),
    data: (__VLS_ctx.ruleInfo),
}));
const __VLS_119 = __VLS_118({
    column: (2),
    data: (__VLS_ctx.ruleInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
const __VLS_121 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    ...{ style: {} },
}));
const __VLS_123 = __VLS_122({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_125 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    columns: (__VLS_ctx.fieldColumns),
    data: (__VLS_ctx.fieldData),
    pagination: (false),
}));
const __VLS_127 = __VLS_126({
    columns: (__VLS_ctx.fieldColumns),
    data: (__VLS_ctx.fieldData),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
var __VLS_116;
var __VLS_112;
const __VLS_129 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    key: "3",
    title: "使用情况",
}));
const __VLS_131 = __VLS_130({
    key: "3",
    title: "使用情况",
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
const __VLS_133 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_135 = __VLS_134({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
__VLS_136.slots.default;
const __VLS_137 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}));
const __VLS_139 = __VLS_138({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
var __VLS_136;
var __VLS_132;
const __VLS_141 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    key: "4",
    title: "评估报告",
}));
const __VLS_143 = __VLS_142({
    key: "4",
    title: "评估报告",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
const __VLS_145 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_147 = __VLS_146({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
const __VLS_149 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}));
const __VLS_151 = __VLS_150({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
var __VLS_148;
var __VLS_144;
var __VLS_96;
var __VLS_92;
var __VLS_8;
const __VLS_153 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    ...{ 'onCancel': {} },
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.editDrawerVisible),
    title: "编辑信息",
    width: "600px",
}));
const __VLS_155 = __VLS_154({
    ...{ 'onCancel': {} },
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.editDrawerVisible),
    title: "编辑信息",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
let __VLS_157;
let __VLS_158;
let __VLS_159;
const __VLS_160 = {
    onCancel: (__VLS_ctx.handleEditCancel)
};
const __VLS_161 = {
    onOk: (__VLS_ctx.handleEditSubmit)
};
__VLS_156.slots.default;
const __VLS_162 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}));
const __VLS_164 = __VLS_163({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
/** @type {typeof __VLS_ctx.editFormRef} */ ;
var __VLS_166 = {};
__VLS_165.slots.default;
const __VLS_168 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    field: "type",
    label: "变量类型",
    required: true,
}));
const __VLS_170 = __VLS_169({
    field: "type",
    label: "变量类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.editForm.type),
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.editForm.type),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    value: "基础信息",
}));
const __VLS_178 = __VLS_177({
    value: "基础信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
var __VLS_179;
const __VLS_180 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    value: "信贷记录",
}));
const __VLS_182 = __VLS_181({
    value: "信贷记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
var __VLS_183;
const __VLS_184 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    value: "还款记录",
}));
const __VLS_186 = __VLS_185({
    value: "还款记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
var __VLS_187;
const __VLS_188 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    value: "征信评分",
}));
const __VLS_190 = __VLS_189({
    value: "征信评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
var __VLS_191;
var __VLS_175;
var __VLS_171;
const __VLS_192 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    field: "supplier",
    label: "供应商",
    required: true,
}));
const __VLS_194 = __VLS_193({
    field: "supplier",
    label: "供应商",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}));
const __VLS_198 = __VLS_197({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
var __VLS_195;
const __VLS_200 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    field: "description",
    label: "变量描述",
}));
const __VLS_202 = __VLS_201({
    field: "description",
    label: "变量描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
const __VLS_204 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入变量描述",
}));
const __VLS_206 = __VLS_205({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入变量描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
var __VLS_203;
var __VLS_165;
var __VLS_156;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['main-info']} */ ;
/** @type {__VLS_StyleScopedClasses['title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['data-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-group']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-info']} */ ;
/** @type {__VLS_StyleScopedClasses['action-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['main-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
// @ts-ignore
var __VLS_167 = __VLS_166;
var __VLS_dollars;
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
; /* PartiallyEnd: #4569/main.vue */
