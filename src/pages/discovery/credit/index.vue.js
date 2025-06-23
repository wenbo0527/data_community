/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconUpload, IconDownload } from '@arco-design/web-vue/es/icon';
const searchText = ref('');
const loading = ref(false);
const drawerVisible = ref(false);
const currentVariable = ref({});
const filterForm = ref({
    variableTag: '不限',
    category: '不限',
    supplier: ''
});
const basicInfo = computed(() => [
    {
        label: '变量英文名',
        value: currentVariable.value.englishName
    },
    {
        label: '变量中文名',
        value: currentVariable.value.chineseName
    },
    {
        label: '一级分类',
        value: currentVariable.value.primaryCategory
    },
    {
        label: '二级分类',
        value: currentVariable.value.secondaryCategory
    },
    {
        label: '标签',
        value: currentVariable.value.tag
    },
    {
        label: '供应商',
        value: currentVariable.value.supplier
    }
]);
const handleSearch = (value) => {
    console.log('搜索:', value);
};
const handleBatchUpload = () => {
    Message.info('批量上传功能模拟');
};
const handleDownloadTemplate = () => {
    Message.info('模板下载功能模拟');
};
const handleView = (record) => {
    currentVariable.value = record;
    drawerVisible.value = true;
};
const handleEdit = (record) => {
    console.log('编辑记录:', record);
};
const handleDelete = (record) => {
    console.log('删除记录:', record);
};
const closeDrawer = () => {
    drawerVisible.value = false;
    currentVariable.value = {};
};
const getStatusColor = (status) => {
    const colorMap = {
        '已上线': 'green',
        '待上线': 'orange',
        '已下线': 'red'
    };
    return colorMap[status] || 'blue';
};
const columns = [
    { title: '一级分类', dataIndex: 'primaryCategory', width: 120, align: 'center' },
    { title: '二级分类', dataIndex: 'secondaryCategory', width: 120, align: 'center' },
    { title: '变量英文名', dataIndex: 'englishName', width: 150, align: 'left', slotName: 'englishName' },
    { title: '变量中文名', dataIndex: 'chineseName', width: 150, align: 'left' },
    { title: '标签', dataIndex: 'tag', width: 100, align: 'center' },
    { title: '批次', dataIndex: 'batch', width: 100, align: 'center' },
    { title: '上线时间', dataIndex: 'onlineTime', width: 120, align: 'center' },
    { title: '操作', slotName: 'operations', width: 150, align: 'center' }
];
const mockData = [
    {
        primaryCategory: '身份信息',
        secondaryCategory: '基础信息',
        englishName: 'basic_info',
        chineseName: '个人基础信息',
        tag: '个人信息',
        batch: 'B20231201',
        onlineTime: '2023-12-01'
    }
];
const filteredData = computed(() => {
    return mockData;
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
const __VLS_9 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    gutter: ([24, 24]),
}));
const __VLS_11 = __VLS_10({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    span: (24),
}));
const __VLS_15 = __VLS_14({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    title: "征信变量",
    bordered: (false),
}));
const __VLS_19 = __VLS_18({
    title: "征信变量",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (600),
    title: "变量详情",
}));
const __VLS_23 = __VLS_22({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (600),
    title: "变量详情",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onCancel: (__VLS_ctx.closeDrawer)
};
__VLS_24.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_24.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentVariable.name);
    const __VLS_29 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        color: (__VLS_ctx.getStatusColor(__VLS_ctx.currentVariable.status)),
    }));
    const __VLS_31 = __VLS_30({
        color: (__VLS_ctx.getStatusColor(__VLS_ctx.currentVariable.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    (__VLS_ctx.currentVariable.status);
    var __VLS_32;
}
const __VLS_33 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    column: (1),
    title: ('基本信息'),
    data: (__VLS_ctx.basicInfo),
}));
const __VLS_35 = __VLS_34({
    column: (1),
    title: ('基本信息'),
    data: (__VLS_ctx.basicInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({}));
const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const __VLS_41 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    column: (1),
    title: ('加工逻辑'),
}));
const __VLS_43 = __VLS_42({
    column: (1),
    title: ('加工逻辑'),
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
const __VLS_45 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    label: "加工逻辑",
}));
const __VLS_47 = __VLS_46({
    label: "加工逻辑",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
(__VLS_ctx.currentVariable.logic || '暂无加工逻辑');
var __VLS_48;
var __VLS_44;
const __VLS_49 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({}));
const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
const __VLS_53 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    column: (1),
    title: ('默认值'),
}));
const __VLS_55 = __VLS_54({
    column: (1),
    title: ('默认值'),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
const __VLS_57 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    label: "默认值",
}));
const __VLS_59 = __VLS_58({
    label: "默认值",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
(__VLS_ctx.currentVariable.defaultValue || '无');
var __VLS_60;
var __VLS_56;
const __VLS_61 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({}));
const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const __VLS_65 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    column: (1),
    title: ('批次'),
}));
const __VLS_67 = __VLS_66({
    column: (1),
    title: ('批次'),
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
const __VLS_69 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    label: "批次",
}));
const __VLS_71 = __VLS_70({
    label: "批次",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
(__VLS_ctx.currentVariable.batch || '暂无批次信息');
var __VLS_72;
var __VLS_68;
const __VLS_73 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({}));
const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
const __VLS_77 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    column: (1),
    title: ('备注'),
}));
const __VLS_79 = __VLS_78({
    column: (1),
    title: ('备注'),
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
const __VLS_81 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    label: "备注",
}));
const __VLS_83 = __VLS_82({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
(__VLS_ctx.currentVariable.remark || '暂无备注');
var __VLS_84;
var __VLS_80;
var __VLS_24;
{
    const { extra: __VLS_thisSlot } = __VLS_20.slots;
    const __VLS_85 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
    const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_88.slots.default;
    const __VLS_89 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_91 = __VLS_90({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    let __VLS_93;
    let __VLS_94;
    let __VLS_95;
    const __VLS_96 = {
        onClick: (__VLS_ctx.handleBatchUpload)
    };
    __VLS_92.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_92.slots;
        const __VLS_97 = {}.IconUpload;
        /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
        const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
    }
    var __VLS_92;
    const __VLS_101 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        ...{ 'onClick': {} },
    }));
    const __VLS_103 = __VLS_102({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    let __VLS_105;
    let __VLS_106;
    let __VLS_107;
    const __VLS_108 = {
        onClick: (__VLS_ctx.handleDownloadTemplate)
    };
    __VLS_104.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_104.slots;
        const __VLS_109 = {}.IconDownload;
        /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({}));
        const __VLS_111 = __VLS_110({}, ...__VLS_functionalComponentArgsRest(__VLS_110));
    }
    var __VLS_104;
    const __VLS_113 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索变量",
        ...{ style: {} },
    }));
    const __VLS_115 = __VLS_114({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索变量",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    let __VLS_117;
    let __VLS_118;
    let __VLS_119;
    const __VLS_120 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    var __VLS_116;
    var __VLS_88;
}
const __VLS_121 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}));
const __VLS_123 = __VLS_122({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
const __VLS_125 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    field: "variableTag",
    label: "变量标签",
}));
const __VLS_127 = __VLS_126({
    field: "variableTag",
    label: "变量标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
__VLS_128.slots.default;
const __VLS_129 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    modelValue: (__VLS_ctx.filterForm.variableTag),
    placeholder: "请选择标签",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_131 = __VLS_130({
    modelValue: (__VLS_ctx.filterForm.variableTag),
    placeholder: "请选择标签",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
const __VLS_133 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    value: "不限",
}));
const __VLS_135 = __VLS_134({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
__VLS_136.slots.default;
var __VLS_136;
const __VLS_137 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    value: "个人信息",
}));
const __VLS_139 = __VLS_138({
    value: "个人信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
var __VLS_140;
const __VLS_141 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    value: "信用卡",
}));
const __VLS_143 = __VLS_142({
    value: "信用卡",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
var __VLS_144;
const __VLS_145 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    value: "贷款",
}));
const __VLS_147 = __VLS_146({
    value: "贷款",
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
var __VLS_148;
const __VLS_149 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    value: "逾期",
}));
const __VLS_151 = __VLS_150({
    value: "逾期",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
var __VLS_152;
var __VLS_132;
var __VLS_128;
const __VLS_153 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    field: "category",
    label: "一级分类",
}));
const __VLS_155 = __VLS_154({
    field: "category",
    label: "一级分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_156.slots.default;
const __VLS_157 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    modelValue: (__VLS_ctx.filterForm.category),
    placeholder: "请选择分类",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_159 = __VLS_158({
    modelValue: (__VLS_ctx.filterForm.category),
    placeholder: "请选择分类",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
__VLS_160.slots.default;
const __VLS_161 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
    value: "不限",
}));
const __VLS_163 = __VLS_162({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
__VLS_164.slots.default;
var __VLS_164;
const __VLS_165 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
    value: "身份信息",
}));
const __VLS_167 = __VLS_166({
    value: "身份信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
__VLS_168.slots.default;
var __VLS_168;
const __VLS_169 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
    value: "信用信息",
}));
const __VLS_171 = __VLS_170({
    value: "信用信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
__VLS_172.slots.default;
var __VLS_172;
const __VLS_173 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    value: "资产信息",
}));
const __VLS_175 = __VLS_174({
    value: "资产信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
var __VLS_176;
const __VLS_177 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    value: "负债信息",
}));
const __VLS_179 = __VLS_178({
    value: "负债信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_180.slots.default;
var __VLS_180;
var __VLS_160;
var __VLS_156;
const __VLS_181 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
    field: "supplier",
    label: "供应商",
}));
const __VLS_183 = __VLS_182({
    field: "supplier",
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
__VLS_184.slots.default;
const __VLS_185 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商名称",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_187 = __VLS_186({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商名称",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
var __VLS_184;
var __VLS_124;
const __VLS_189 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.filteredData),
    pagination: ({ pageSize: 10 }),
    loading: (__VLS_ctx.loading),
}));
const __VLS_191 = __VLS_190({
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.filteredData),
    pagination: ({ pageSize: 10 }),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
__VLS_192.slots.default;
{
    const { status: __VLS_thisSlot } = __VLS_192.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_193 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_195 = __VLS_194({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_194));
    __VLS_196.slots.default;
    (record.status);
    var __VLS_196;
}
{
    const { operations: __VLS_thisSlot } = __VLS_192.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_197 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({}));
    const __VLS_199 = __VLS_198({}, ...__VLS_functionalComponentArgsRest(__VLS_198));
    __VLS_200.slots.default;
    const __VLS_201 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_203 = __VLS_202({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_202));
    let __VLS_205;
    let __VLS_206;
    let __VLS_207;
    const __VLS_208 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleView(record);
        }
    };
    __VLS_204.slots.default;
    var __VLS_204;
    const __VLS_209 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_211 = __VLS_210({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    let __VLS_213;
    let __VLS_214;
    let __VLS_215;
    const __VLS_216 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleEdit(record);
        }
    };
    __VLS_212.slots.default;
    var __VLS_212;
    const __VLS_217 = {}.APopconfirm;
    /** @type {[typeof __VLS_components.APopconfirm, typeof __VLS_components.aPopconfirm, typeof __VLS_components.APopconfirm, typeof __VLS_components.aPopconfirm, ]} */ ;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
        ...{ 'onOk': {} },
        content: "确定要删除这条记录吗？",
    }));
    const __VLS_219 = __VLS_218({
        ...{ 'onOk': {} },
        content: "确定要删除这条记录吗？",
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    let __VLS_221;
    let __VLS_222;
    let __VLS_223;
    const __VLS_224 = {
        onOk: (...[$event]) => {
            __VLS_ctx.handleDelete(record);
        }
    };
    __VLS_220.slots.default;
    const __VLS_225 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_227 = __VLS_226({
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_226));
    __VLS_228.slots.default;
    var __VLS_228;
    var __VLS_220;
    var __VLS_200;
}
var __VLS_192;
var __VLS_20;
var __VLS_16;
var __VLS_12;
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-form']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconDownload: IconDownload,
            searchText: searchText,
            loading: loading,
            drawerVisible: drawerVisible,
            currentVariable: currentVariable,
            filterForm: filterForm,
            basicInfo: basicInfo,
            handleSearch: handleSearch,
            handleBatchUpload: handleBatchUpload,
            handleDownloadTemplate: handleDownloadTemplate,
            handleView: handleView,
            handleEdit: handleEdit,
            handleDelete: handleDelete,
            closeDrawer: closeDrawer,
            getStatusColor: getStatusColor,
            columns: columns,
            filteredData: filteredData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
