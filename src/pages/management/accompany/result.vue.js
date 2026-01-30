/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
const props = defineProps({
    planName: {
        type: String,
        required: true
    }
});
// 筛选表单
const filterForm = ref({
    dataProduct: '',
    creditProduct: '',
    scene: '',
    period: '',
    dateRange: [],
    status: ''
});
// 选项数据
const dataProducts = ref(['数据产品A', '数据产品B', '数据产品C']);
const creditProducts = ref(['信贷产品A', '信贷产品B', '信贷产品C']);
const scenes = ref(['场景A', '场景B', '场景C']);
const periods = ref(['1', '3', '6', '12']);
const statuses = ref(['已启动', '已完成', '已终止']);
// 表格数据
const tableData = ref([
    {
        dataProduct: '数据产品A',
        creditProduct: '信贷产品B',
        scene: '场景A',
        condition: '条件1',
        period: '3',
        batchNo: '批次001',
        plannedAmount: 1000,
        actualAmount: 980,
        acquisitionRate: '98%',
        successRate: '95%',
        progress: '90%',
        status: '已启动',
        finishTime: '2024-01-01 15:00:00'
    },
    {
        dataProduct: '数据产品B',
        creditProduct: '信贷产品C',
        scene: '场景B',
        condition: '条件2',
        period: '1',
        batchNo: '批次002',
        plannedAmount: 2000,
        actualAmount: 1950,
        acquisitionRate: '97.5%',
        successRate: '96%',
        progress: '100%',
        status: '已完成',
        finishTime: '2024-01-02 21:00:00'
    }
]);
// 表格列定义
const columns = [
    { title: '数据产品', dataIndex: 'dataProduct' },
    { title: '信贷产品', dataIndex: 'creditProduct' },
    { title: '场景', dataIndex: 'scene' },
    { title: '条件', dataIndex: 'condition' },
    { title: '期数', dataIndex: 'period' },
    { title: '陪跑批次', dataIndex: 'batchNo' },
    { title: '计划陪跑量', dataIndex: 'plannedAmount' },
    { title: '实际陪跑量', dataIndex: 'actualAmount' },
    { title: '取得率', dataIndex: 'acquisitionRate' },
    { title: '成功率', dataIndex: 'successRate' },
    { title: '跑批进度', dataIndex: 'progress' },
    { title: '当前状态', dataIndex: 'status' },
    { title: '实际完成时间', dataIndex: 'finishTime' },
    { title: '操作', slotName: 'operations' }
];
// 加载状态
const loading = ref(false);
const selectedRowKeys = ref([]);
const selectedRows = ref([]);
const visibleTerminateModal = ref(false);
// 筛选后的数据
const filteredData = computed(() => {
    return tableData.value.filter(item => {
        return ((!filterForm.value.dataProduct || item.dataProduct === filterForm.value.dataProduct) &&
            (!filterForm.value.creditProduct || item.creditProduct === filterForm.value.creditProduct) &&
            (!filterForm.value.scene || item.scene === filterForm.value.scene) &&
            (!filterForm.value.period || item.period === filterForm.value.period) &&
            (!filterForm.value.status || item.status === filterForm.value.status));
    });
});
// 查询
const handleSearch = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 500);
};
// 重置
const handleReset = () => {
    filterForm.value = {
        dataProduct: '',
        creditProduct: '',
        scene: '',
        period: '',
        dateRange: [],
        status: ''
    };
};
// 导出
const handleExport = () => {
    Message.success('导出成功');
};
// 重跑
const handleRerun = () => {
    Message.info('重跑操作已触发');
};
// 重跑单条
const handleRerunItem = (record) => {
    Message.info(`重跑陪跑批次：${record.batchNo}`);
};
// 多选变化
const handleSelectionChange = (rowKeys, rows) => {
    selectedRowKeys.value = rowKeys;
    selectedRows.value = rows.filter(row => ['已启动', '未执行'].includes(row.status));
};
// 终止操作
const handleTerminate = () => {
    if (!selectedRowKeys.value.length) {
        Message.warning('请选择要终止的记录');
        return;
    }
    visibleTerminateModal.value = true;
};
// 确认终止
const confirmTerminate = () => {
    selectedRows.value.forEach(row => {
        row.status = '已终止';
        row._animate = true;
        setTimeout(() => {
            row._animate = false;
        }, 1000);
    });
    Message.success({
        content: '终止操作成功',
        duration: 2000
    });
    visibleTerminateModal.value = false;
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ 
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "content" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    title: "陪跑计划结果",
    bordered: (false),
}));
const __VLS_11 = __VLS_10({
    title: "陪跑计划结果",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
}));
const __VLS_15 = __VLS_14({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    field: "dataProduct",
    label: "数据产品",
}));
const __VLS_19 = __VLS_18({
    field: "dataProduct",
    label: "数据产品",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    modelValue: (__VLS_ctx.filterForm.dataProduct),
    placeholder: "请选择数据产品",
    ...{ style: {} },
}));
const __VLS_23 = __VLS_22({
    modelValue: (__VLS_ctx.filterForm.dataProduct),
    placeholder: "请选择数据产品",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
for (const [product] of __VLS_getVForSourceType((__VLS_ctx.dataProducts))) {
    const __VLS_25 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        key: (product),
        value: (product),
    }));
    const __VLS_27 = __VLS_26({
        key: (product),
        value: (product),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    (product);
    var __VLS_28;
}
let __VLS_24;
let __VLS_20;
const __VLS_29 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    field: "creditProduct",
    label: "信贷产品",
}));
const __VLS_31 = __VLS_30({
    field: "creditProduct",
    label: "信贷产品",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_32.slots.default;
const __VLS_33 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    modelValue: (__VLS_ctx.filterForm.creditProduct),
    placeholder: "请选择信贷产品",
    ...{ style: {} },
}));
const __VLS_35 = __VLS_34({
    modelValue: (__VLS_ctx.filterForm.creditProduct),
    placeholder: "请选择信贷产品",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
for (const [product] of __VLS_getVForSourceType((__VLS_ctx.creditProducts))) {
    const __VLS_37 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        key: (product),
        value: (product),
    }));
    const __VLS_39 = __VLS_38({
        key: (product),
        value: (product),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    (product);
    var __VLS_40;
}
let __VLS_36;
let __VLS_32;
const __VLS_41 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    field: "scene",
    label: "场景",
}));
const __VLS_43 = __VLS_42({
    field: "scene",
    label: "场景",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
const __VLS_45 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    modelValue: (__VLS_ctx.filterForm.scene),
    placeholder: "请选择场景",
    ...{ style: {} },
}));
const __VLS_47 = __VLS_46({
    modelValue: (__VLS_ctx.filterForm.scene),
    placeholder: "请选择场景",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
for (const [scene] of __VLS_getVForSourceType((__VLS_ctx.scenes))) {
    const __VLS_49 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        key: (scene),
        value: (scene),
    }));
    const __VLS_51 = __VLS_50({
        key: (scene),
        value: (scene),
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    (scene);
    var __VLS_52;
}
let __VLS_48;
let __VLS_44;
const __VLS_53 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    field: "period",
    label: "期数",
}));
const __VLS_55 = __VLS_54({
    field: "period",
    label: "期数",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
const __VLS_57 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.filterForm.period),
    placeholder: "请选择期数",
    ...{ style: {} },
}));
const __VLS_59 = __VLS_58({
    modelValue: (__VLS_ctx.filterForm.period),
    placeholder: "请选择期数",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
for (const [period] of __VLS_getVForSourceType((__VLS_ctx.periods))) {
    const __VLS_61 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        key: (period),
        value: (period),
    }));
    const __VLS_63 = __VLS_62({
        key: (period),
        value: (period),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_64.slots.default;
    (period);
    var __VLS_64;
}
let __VLS_60;
let __VLS_56;
const __VLS_65 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    field: "dateRange",
    label: "陪跑日期",
}));
const __VLS_67 = __VLS_66({
    field: "dateRange",
    label: "陪跑日期",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
const __VLS_69 = {}.ARangePicker;
/** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ 
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    modelValue: (__VLS_ctx.filterForm.dateRange),
    ...{ style: {} },
}));
const __VLS_71 = __VLS_70({
    modelValue: (__VLS_ctx.filterForm.dateRange),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_68;
const __VLS_73 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    field: "status",
    label: "当前状态",
}));
const __VLS_75 = __VLS_74({
    field: "status",
    label: "当前状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
const __VLS_77 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    modelValue: (__VLS_ctx.filterForm.status),
    placeholder: "请选择状态",
    ...{ style: {} },
}));
const __VLS_79 = __VLS_78({
    modelValue: (__VLS_ctx.filterForm.status),
    placeholder: "请选择状态",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
for (const [status] of __VLS_getVForSourceType((__VLS_ctx.statuses))) {
    const __VLS_81 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        key: (status),
        value: (status),
    }));
    const __VLS_83 = __VLS_82({
        key: (status),
        value: (status),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    __VLS_84.slots.default;
    (status);
    var __VLS_84;
}
let __VLS_80;
let __VLS_76;
const __VLS_85 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
const __VLS_89 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({}));
const __VLS_91 = __VLS_90({}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
const __VLS_93 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_95 = __VLS_94({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
let __VLS_97;
let __VLS_98;
let __VLS_99;
const __VLS_100 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_96.slots.default;
let __VLS_96;
const __VLS_101 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
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
    onClick: (__VLS_ctx.handleReset)
};
__VLS_104.slots.default;
let __VLS_104;
const __VLS_109 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    ...{ 'onClick': {} },
    type: "outline",
}));
const __VLS_111 = __VLS_110({
    ...{ 'onClick': {} },
    type: "outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_113;
let __VLS_114;
let __VLS_115;
const __VLS_116 = {
    onClick: (__VLS_ctx.handleExport)
};
__VLS_112.slots.default;
let __VLS_112;
const __VLS_117 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    ...{ 'onClick': {} },
    type: "primary",
    status: "warning",
}));
const __VLS_119 = __VLS_118({
    ...{ 'onClick': {} },
    type: "primary",
    status: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
let __VLS_121;
let __VLS_122;
let __VLS_123;
const __VLS_124 = {
    onClick: (__VLS_ctx.handleRerun)
};
__VLS_120.slots.default;
let __VLS_120;
const __VLS_125 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    ...{ 'onClick': {} },
    type: "primary",
    status: "danger",
    disabled: (!__VLS_ctx.selectedRowKeys.length),
    title: (!__VLS_ctx.selectedRowKeys.length ? '请选择要终止的记录' : ''),
}));
const __VLS_127 = __VLS_126({
    ...{ 'onClick': {} },
    type: "primary",
    status: "danger",
    disabled: (!__VLS_ctx.selectedRowKeys.length),
    title: (!__VLS_ctx.selectedRowKeys.length ? '请选择要终止的记录' : ''),
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
let __VLS_129;
let __VLS_130;
let __VLS_131;
const __VLS_132 = {
    onClick: (__VLS_ctx.handleTerminate)
};
__VLS_128.slots.default;
let __VLS_128;
let __VLS_92;
let __VLS_88;
let __VLS_16;
const __VLS_133 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    ...{ 'onSelectionChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.filteredData),
    pagination: ({ pageSize: 10 }),
    loading: (__VLS_ctx.loading),
    rowKey: "batchNo",
    rowSelection: ({ type: 'checkbox', selectedRowKeys: __VLS_ctx.selectedRowKeys, showCheckedAll: true }),
}));
const __VLS_135 = __VLS_134({
    ...{ 'onSelectionChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.filteredData),
    pagination: ({ pageSize: 10 }),
    loading: (__VLS_ctx.loading),
    rowKey: "batchNo",
    rowSelection: ({ type: 'checkbox', selectedRowKeys: __VLS_ctx.selectedRowKeys, showCheckedAll: true }),
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
let __VLS_137;
let __VLS_138;
let __VLS_139;
const __VLS_140 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
__VLS_136.slots.default;
{
    const { operations: __VLS_thisSlot } = __VLS_136.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_141 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
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
            __VLS_ctx.handleRerunItem(record);
        }
    };
    __VLS_144.slots.default;
    let __VLS_144;
}
let __VLS_136;
const __VLS_149 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.visibleTerminateModal),
    title: "确认终止",
}));
const __VLS_151 = __VLS_150({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.visibleTerminateModal),
    title: "确认终止",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
let __VLS_153;
let __VLS_154;
let __VLS_155;
const __VLS_156 = {
    onOk: (__VLS_ctx.confirmTerminate)
};
const __VLS_157 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.visibleTerminateModal = false;
    }
};
__VLS_152.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.selectedRowKeys.length);
const __VLS_158 = {}.AList;
/** @type {[typeof __VLS_components.AList, typeof __VLS_components.aList, ]} */ 
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    size: "small",
    data: (__VLS_ctx.selectedRows.map(row => row.batchNo + ' - ' + row.dataProduct)),
}));
const __VLS_160 = __VLS_159({
    size: "small",
    data: (__VLS_ctx.selectedRows.map(row => row.batchNo + ' - ' + row.dataProduct)),
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
let __VLS_152;
let __VLS_12;
let __VLS_8;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            filterForm: filterForm,
            dataProducts: dataProducts,
            creditProducts: creditProducts,
            scenes: scenes,
            periods: periods,
            statuses: statuses,
            columns: columns,
            loading: loading,
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows,
            visibleTerminateModal: visibleTerminateModal,
            filteredData: filteredData,
            handleSearch: handleSearch,
            handleReset: handleReset,
            handleExport: handleExport,
            handleRerun: handleRerun,
            handleRerunItem: handleRerunItem,
            handleSelectionChange: handleSelectionChange,
            handleTerminate: handleTerminate,
            confirmTerminate: confirmTerminate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
        };
    },
});
 /* PartiallyEnd: #4569/main.vue */
