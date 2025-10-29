/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
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
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['variable-name']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "credit-variables" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showBatchUpload = true;
    }
};
__VLS_7.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconUpload;
    /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_7;
const __VLS_16 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.downloadTemplate)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.IconDownload;
    /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_19;
var __VLS_3;
const __VLS_28 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    bordered: (false),
}));
const __VLS_30 = __VLS_29({
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (600),
    title: "变量详情",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (600),
    title: "变量详情",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onCancel: (__VLS_ctx.closeDrawer)
};
__VLS_35.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_35.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentVariable.name);
    const __VLS_40 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        color: (__VLS_ctx.getStatusColor(__VLS_ctx.currentVariable.status)),
    }));
    const __VLS_42 = __VLS_41({
        color: (__VLS_ctx.getStatusColor(__VLS_ctx.currentVariable.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    (__VLS_ctx.currentVariable.status);
    var __VLS_43;
}
const __VLS_44 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    column: (1),
    title: ('基本信息'),
    data: (__VLS_ctx.basicInfo),
}));
const __VLS_46 = __VLS_45({
    column: (1),
    title: ('基本信息'),
    data: (__VLS_ctx.basicInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    column: (1),
    title: ('加工逻辑'),
}));
const __VLS_54 = __VLS_53({
    column: (1),
    title: ('加工逻辑'),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "加工逻辑",
}));
const __VLS_58 = __VLS_57({
    label: "加工逻辑",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
(__VLS_ctx.currentVariable.logic || '暂无加工逻辑');
var __VLS_59;
var __VLS_55;
const __VLS_60 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const __VLS_64 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    column: (1),
    title: ('默认值'),
}));
const __VLS_66 = __VLS_65({
    column: (1),
    title: ('默认值'),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "默认值",
}));
const __VLS_70 = __VLS_69({
    label: "默认值",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
(__VLS_ctx.currentVariable.defaultValue || '无');
var __VLS_71;
var __VLS_67;
const __VLS_72 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const __VLS_76 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    column: (1),
    title: ('批次'),
}));
const __VLS_78 = __VLS_77({
    column: (1),
    title: ('批次'),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "批次",
}));
const __VLS_82 = __VLS_81({
    label: "批次",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
(__VLS_ctx.currentVariable.batch || '暂无批次信息');
var __VLS_83;
var __VLS_79;
const __VLS_84 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const __VLS_88 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    column: (1),
    title: ('备注'),
}));
const __VLS_90 = __VLS_89({
    column: (1),
    title: ('备注'),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    label: "备注",
}));
const __VLS_94 = __VLS_93({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
(__VLS_ctx.currentVariable.remark || '暂无备注');
var __VLS_95;
var __VLS_91;
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_96 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    gutter: (16),
}));
const __VLS_98 = __VLS_97({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    span: (8),
}));
const __VLS_102 = __VLS_101({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索变量名称、描述",
}));
const __VLS_106 = __VLS_105({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索变量名称、描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onSearch: (__VLS_ctx.handleSearch)
};
var __VLS_107;
var __VLS_103;
const __VLS_112 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    span: (4),
}));
const __VLS_114 = __VLS_113({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedTag),
    placeholder: "变量标签",
    allowClear: true,
}));
const __VLS_118 = __VLS_117({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedTag),
    placeholder: "变量标签",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
let __VLS_120;
let __VLS_121;
let __VLS_122;
const __VLS_123 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_119.slots.default;
const __VLS_124 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    value: "高风险",
}));
const __VLS_126 = __VLS_125({
    value: "高风险",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
var __VLS_127;
const __VLS_128 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    value: "中风险",
}));
const __VLS_130 = __VLS_129({
    value: "中风险",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
var __VLS_131;
const __VLS_132 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    value: "低风险",
}));
const __VLS_134 = __VLS_133({
    value: "低风险",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
var __VLS_119;
var __VLS_115;
const __VLS_136 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    span: (4),
}));
const __VLS_138 = __VLS_137({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCategory),
    placeholder: "变量分类",
    allowClear: true,
}));
const __VLS_142 = __VLS_141({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCategory),
    placeholder: "变量分类",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
let __VLS_144;
let __VLS_145;
let __VLS_146;
const __VLS_147 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_143.slots.default;
const __VLS_148 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    value: "基础信息",
}));
const __VLS_150 = __VLS_149({
    value: "基础信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
var __VLS_151;
const __VLS_152 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    value: "信贷记录",
}));
const __VLS_154 = __VLS_153({
    value: "信贷记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
var __VLS_155;
const __VLS_156 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    value: "行为特征",
}));
const __VLS_158 = __VLS_157({
    value: "行为特征",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
var __VLS_159;
var __VLS_143;
var __VLS_139;
const __VLS_160 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    span: (4),
}));
const __VLS_162 = __VLS_161({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedSupplier),
    placeholder: "数据供应商",
    allowClear: true,
}));
const __VLS_166 = __VLS_165({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedSupplier),
    placeholder: "数据供应商",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
let __VLS_168;
let __VLS_169;
let __VLS_170;
const __VLS_171 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_167.slots.default;
const __VLS_172 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    value: "人行征信",
}));
const __VLS_174 = __VLS_173({
    value: "人行征信",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
var __VLS_175;
const __VLS_176 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    value: "百行征信",
}));
const __VLS_178 = __VLS_177({
    value: "百行征信",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
var __VLS_179;
const __VLS_180 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    value: "芝麻信用",
}));
const __VLS_182 = __VLS_181({
    value: "芝麻信用",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
var __VLS_183;
var __VLS_167;
var __VLS_163;
var __VLS_99;
const __VLS_184 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.filteredData),
    pagination: ({ pageSize: 10 }),
    loading: (__VLS_ctx.loading),
}));
const __VLS_186 = __VLS_185({
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.filteredData),
    pagination: ({ pageSize: 10 }),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
{
    const { status: __VLS_thisSlot } = __VLS_187.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_188 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_190 = __VLS_189({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    __VLS_191.slots.default;
    (record.status);
    var __VLS_191;
}
{
    const { operations: __VLS_thisSlot } = __VLS_187.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_192 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
    const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_195.slots.default;
    const __VLS_196 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_198 = __VLS_197({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    let __VLS_200;
    let __VLS_201;
    let __VLS_202;
    const __VLS_203 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleView(record);
        }
    };
    __VLS_199.slots.default;
    var __VLS_199;
    const __VLS_204 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_206 = __VLS_205({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    let __VLS_208;
    let __VLS_209;
    let __VLS_210;
    const __VLS_211 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleEdit(record);
        }
    };
    __VLS_207.slots.default;
    var __VLS_207;
    const __VLS_212 = {}.APopconfirm;
    /** @type {[typeof __VLS_components.APopconfirm, typeof __VLS_components.aPopconfirm, typeof __VLS_components.APopconfirm, typeof __VLS_components.aPopconfirm, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        ...{ 'onOk': {} },
        content: "确定要删除这条记录吗？",
    }));
    const __VLS_214 = __VLS_213({
        ...{ 'onOk': {} },
        content: "确定要删除这条记录吗？",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    let __VLS_216;
    let __VLS_217;
    let __VLS_218;
    const __VLS_219 = {
        onOk: (...[$event]) => {
            __VLS_ctx.handleDelete(record);
        }
    };
    __VLS_215.slots.default;
    const __VLS_220 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_222 = __VLS_221({
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    __VLS_223.slots.default;
    var __VLS_223;
    var __VLS_215;
    var __VLS_195;
}
var __VLS_187;
var __VLS_31;
/** @type {__VLS_StyleScopedClasses['credit-variables']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconDownload: IconDownload,
            loading: loading,
            drawerVisible: drawerVisible,
            currentVariable: currentVariable,
            basicInfo: basicInfo,
            handleSearch: handleSearch,
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
