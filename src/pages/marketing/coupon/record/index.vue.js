/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { recordMockData } from '@/mock/coupon';
import { Message } from '@arco-design/web-vue';
import { IconDownload, IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
const route = useRoute();
const couponId = route.params.id;
// 搜索表单数据
const searchForm = reactive({
    userId: '',
    couponId: '',
    packageId: '',
    taskId: '',
    count: undefined,
    time: [],
    status: undefined,
    operationType: undefined
});
// 表格数据
const tableData = ref([]);
const loading = ref(false);
// 分页配置
const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
});
// 获取表格数据
const fetchTableData = async () => {
    loading.value = true;
    try {
        // 使用mock数据
        const mockData = recordMockData;
        // 根据分页参数返回对应的数据
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        tableData.value = mockData.slice(start, end);
        pagination.total = mockData.length;
    }
    catch (error) {
        console.error('获取发放记录失败:', error);
        Message.error('获取发放记录失败');
    }
    finally {
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    pagination.current = 1;
    fetchTableData();
};
// 重置
const handleReset = () => {
    searchForm.userId = '';
    searchForm.couponId = '';
    searchForm.packageId = '';
    searchForm.taskId = '';
    searchForm.count = undefined;
    searchForm.time = [];
    searchForm.status = undefined;
    searchForm.operationType = undefined;
    handleSearch();
};
// 分页变化
const onPageChange = (current) => {
    pagination.current = current;
    fetchTableData();
};
const onPageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchTableData();
};
// 初始化加载数据
fetchTableData();
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-record-container" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "search-card" },
    bordered: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "search-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    model: (__VLS_ctx.searchForm),
    layout: "inline",
    ...{ class: "filter-form" },
}));
const __VLS_6 = __VLS_5({
    model: (__VLS_ctx.searchForm),
    layout: "inline",
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-content" },
});
const __VLS_8 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    field: "userId",
    label: "用户ID",
}));
const __VLS_10 = __VLS_9({
    field: "userId",
    label: "用户ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.searchForm.userId),
    placeholder: "请输入用户ID",
    allowClear: true,
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.searchForm.userId),
    placeholder: "请输入用户ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
const __VLS_16 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    field: "couponId",
    label: "券实例ID",
}));
const __VLS_18 = __VLS_17({
    field: "couponId",
    label: "券实例ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.searchForm.couponId),
    placeholder: "请输入券实例ID",
    allowClear: true,
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.searchForm.couponId),
    placeholder: "请输入券实例ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_19;
const __VLS_24 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    field: "packageId",
    label: "券包ID",
}));
const __VLS_26 = __VLS_25({
    field: "packageId",
    label: "券包ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.searchForm.packageId),
    placeholder: "请输入券包ID",
    allowClear: true,
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.searchForm.packageId),
    placeholder: "请输入券包ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
const __VLS_32 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    field: "taskId",
    label: "任务ID",
}));
const __VLS_34 = __VLS_33({
    field: "taskId",
    label: "任务ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.searchForm.taskId),
    placeholder: "请输入任务ID",
    allowClear: true,
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.searchForm.taskId),
    placeholder: "请输入任务ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-row" },
});
const __VLS_40 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    field: "time",
    label: "发放时间",
    ...{ class: "date-form-item" },
}));
const __VLS_42 = __VLS_41({
    field: "time",
    label: "发放时间",
    ...{ class: "date-form-item" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ARangePicker;
/** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.searchForm.time),
    showTime: true,
    format: "YYYY-MM-DD HH:mm:ss",
    placeholder: (['开始时间', '结束时间']),
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.searchForm.time),
    showTime: true,
    format: "YYYY-MM-DD HH:mm:ss",
    placeholder: (['开始时间', '结束时间']),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
const __VLS_48 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    field: "status",
    label: "发放状态",
}));
const __VLS_50 = __VLS_49({
    field: "status",
    label: "发放状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.searchForm.status),
    placeholder: "全部状态",
    allowClear: true,
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.searchForm.status),
    placeholder: "全部状态",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    value: "success",
}));
const __VLS_58 = __VLS_57({
    value: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
var __VLS_59;
const __VLS_60 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    value: "failed",
}));
const __VLS_62 = __VLS_61({
    value: "failed",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
var __VLS_63;
var __VLS_55;
var __VLS_51;
const __VLS_64 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    field: "operationType",
    label: "流水类型",
}));
const __VLS_66 = __VLS_65({
    field: "operationType",
    label: "流水类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.searchForm.operationType),
    placeholder: "全部类型",
    allowClear: true,
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.searchForm.operationType),
    placeholder: "全部类型",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "发放",
}));
const __VLS_74 = __VLS_73({
    value: "发放",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
var __VLS_75;
const __VLS_76 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "锁定",
}));
const __VLS_78 = __VLS_77({
    value: "锁定",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
const __VLS_80 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    value: "解锁",
}));
const __VLS_82 = __VLS_81({
    value: "解锁",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
var __VLS_83;
const __VLS_84 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    value: "核销",
}));
const __VLS_86 = __VLS_85({
    value: "核销",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
var __VLS_87;
const __VLS_88 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    value: "过期",
}));
const __VLS_90 = __VLS_89({
    value: "过期",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
var __VLS_91;
const __VLS_92 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    value: "作废",
}));
const __VLS_94 = __VLS_93({
    value: "作废",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
var __VLS_95;
var __VLS_71;
var __VLS_67;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
const __VLS_96 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_102 = __VLS_101({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
let __VLS_104;
let __VLS_105;
let __VLS_106;
const __VLS_107 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_103.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_103.slots;
    const __VLS_108 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
    const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
}
var __VLS_103;
const __VLS_112 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ 'onClick': {} },
}));
const __VLS_114 = __VLS_113({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
let __VLS_116;
let __VLS_117;
let __VLS_118;
const __VLS_119 = {
    onClick: (__VLS_ctx.handleReset)
};
__VLS_115.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_115.slots;
    const __VLS_120 = {}.IconRefresh;
    /** @type {[typeof __VLS_components.IconRefresh, typeof __VLS_components.iconRefresh, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
    const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
}
var __VLS_115;
var __VLS_99;
var __VLS_7;
var __VLS_3;
const __VLS_124 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ class: "table-card" },
    bordered: (false),
}));
const __VLS_126 = __VLS_125({
    ...{ class: "table-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_127.slots;
    const __VLS_128 = {}.ATypographyTitle;
    /** @type {[typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        heading: (6),
        ...{ style: {} },
    }));
    const __VLS_130 = __VLS_129({
        heading: (6),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    var __VLS_131;
}
{
    const { extra: __VLS_thisSlot } = __VLS_127.slots;
    const __VLS_132 = {}.ATooltip;
    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        content: "下载流水记录",
    }));
    const __VLS_134 = __VLS_133({
        content: "下载流水记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    const __VLS_136 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        type: "primary",
        size: "small",
    }));
    const __VLS_138 = __VLS_137({
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_139.slots;
        const __VLS_140 = {}.IconDownload;
        /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
        const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
    }
    var __VLS_139;
    var __VLS_135;
}
const __VLS_144 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    bordered: ({ cell: true, wrapper: true }),
    stripe: true,
    size: "small",
}));
const __VLS_146 = __VLS_145({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    bordered: ({ cell: true, wrapper: true }),
    stripe: true,
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_148;
let __VLS_149;
let __VLS_150;
const __VLS_151 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_152 = {
    onPageSizeChange: (__VLS_ctx.onPageSizeChange)
};
__VLS_147.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_147.slots;
    const __VLS_153 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
        title: "用户ID",
        dataIndex: "userId",
        width: (120),
        align: "center",
    }));
    const __VLS_155 = __VLS_154({
        title: "用户ID",
        dataIndex: "userId",
        width: (120),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_154));
    const __VLS_157 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        title: "券实例ID",
        dataIndex: "couponId",
        width: (140),
        align: "center",
    }));
    const __VLS_159 = __VLS_158({
        title: "券实例ID",
        dataIndex: "couponId",
        width: (140),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    const __VLS_161 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
        title: "券包ID",
        dataIndex: "packageId",
        width: (140),
        align: "center",
    }));
    const __VLS_163 = __VLS_162({
        title: "券包ID",
        dataIndex: "packageId",
        width: (140),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    const __VLS_165 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        title: "任务ID",
        dataIndex: "taskId",
        width: (140),
        align: "center",
    }));
    const __VLS_167 = __VLS_166({
        title: "任务ID",
        dataIndex: "taskId",
        width: (140),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    const __VLS_169 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
        title: "流水类型",
        dataIndex: "operationType",
        width: (100),
        align: "center",
    }));
    const __VLS_171 = __VLS_170({
        title: "流水类型",
        dataIndex: "operationType",
        width: (100),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    __VLS_172.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_172.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_173 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
            color: ({
                '发放': 'blue',
                '锁定': 'orange',
                '解锁': 'green',
                '核销': 'purple',
                '过期': 'red',
                '作废': 'gray'
            }[record.operationType]),
            size: "small",
        }));
        const __VLS_175 = __VLS_174({
            color: ({
                '发放': 'blue',
                '锁定': 'orange',
                '解锁': 'green',
                '核销': 'purple',
                '过期': 'red',
                '作废': 'gray'
            }[record.operationType]),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_174));
        __VLS_176.slots.default;
        (record.operationType);
        var __VLS_176;
    }
    var __VLS_172;
    const __VLS_177 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
        title: "状态",
        dataIndex: "status",
        width: (80),
        align: "center",
    }));
    const __VLS_179 = __VLS_178({
        title: "状态",
        dataIndex: "status",
        width: (80),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_178));
    __VLS_180.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_180.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_181 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
            color: (record.status === '成功' ? 'green' : 'red'),
            size: "small",
        }));
        const __VLS_183 = __VLS_182({
            color: (record.status === '成功' ? 'green' : 'red'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_182));
        __VLS_184.slots.default;
        (record.status);
        var __VLS_184;
    }
    var __VLS_180;
    const __VLS_185 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
        title: "详情",
        dataIndex: "failedReason",
        width: (200),
    }));
    const __VLS_187 = __VLS_186({
        title: "详情",
        dataIndex: "failedReason",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    __VLS_188.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_188.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (record.failedReason) {
            const __VLS_189 = {}.ATooltip;
            /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
                content: (record.failedReason),
                position: "left",
            }));
            const __VLS_191 = __VLS_190({
                content: (record.failedReason),
                position: "left",
            }, ...__VLS_functionalComponentArgsRest(__VLS_190));
            __VLS_192.slots.default;
            const __VLS_193 = {}.ATypographyText;
            /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ ;
            // @ts-ignore
            const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
                type: "secondary",
                ...{ style: {} },
            }));
            const __VLS_195 = __VLS_194({
                type: "secondary",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_194));
            __VLS_196.slots.default;
            (record.failedReason);
            var __VLS_196;
            var __VLS_192;
        }
    }
    var __VLS_188;
    const __VLS_197 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
        title: "发放时间",
        dataIndex: "operationTime",
        width: (160),
        align: "center",
    }));
    const __VLS_199 = __VLS_198({
        title: "发放时间",
        dataIndex: "operationTime",
        width: (160),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_198));
}
var __VLS_147;
var __VLS_127;
/** @type {__VLS_StyleScopedClasses['coupon-record-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['date-form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconDownload: IconDownload,
            IconSearch: IconSearch,
            IconRefresh: IconRefresh,
            searchForm: searchForm,
            tableData: tableData,
            loading: loading,
            pagination: pagination,
            handleSearch: handleSearch,
            handleReset: handleReset,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
