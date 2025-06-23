/// <reference types="../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref } from 'vue';
import { formatAmount, formatPercent, formatChangeValue } from '@/utils/calculations';
const props = defineProps({
    platform: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true
    },
    timeRange: {
        type: String,
        required: true
    }
});
const emit = defineEmits(['time-range-change']);
const tableData = ref([
    {
        customerType: '新户',
        processName: '授信申请量',
        creditApplyCount: { current: 5000, change: 500 },
        rowSpan: 2
    },
    {
        customerType: '新户',
        processName: '授信通过率',
        creditApprovalRate: { current: 0.65, change: 0.05 },
        rowSpan: 0
    },
    {
        customerType: '新户',
        processName: '授信平均额度',
        creditLimit: { current: 5000000, change: 500000 },
        rowSpan: 2
    },
    {
        customerType: '新户',
        processName: '支用申请量',
        loanApplyCount: { current: 3000, change: 300 },
        rowSpan: 0
    },
    {
        customerType: '新户',
        processName: '支用通过率',
        loanApprovalRate: { current: 0.8, change: 0.02 },
        rowSpan: 2
    },
    {
        customerType: '新户',
        processName: '支用金额',
        loanAmount: { current: 3000000, change: 300000 },
        rowSpan: 0
    },
    {
        customerType: '新户',
        processName: '平均期数',
        averageTerm: { current: 12, change: 1 },
        rowSpan: 2
    },
    {
        customerType: '新户',
        processName: '平均定价',
        averagePricing: { current: 0.15, change: 0.01 },
        rowSpan: 0
    },
    {
        customerType: '老户',
        processName: '授信申请量',
        creditApplyCount: { current: 4000, change: 400 },
        rowSpan: 2
    },
    {
        customerType: '老户',
        processName: '授信通过率',
        creditApprovalRate: { current: 0.6, change: 0.04 },
        rowSpan: 0
    },
    {
        customerType: '老户',
        processName: '授信平均额度',
        creditLimit: { current: 4000000, change: 400000 },
        rowSpan: 2
    },
    {
        customerType: '老户',
        processName: '支用申请量',
        loanApplyCount: { current: 2000, change: 200 },
        rowSpan: 0
    },
    {
        customerType: '老户',
        processName: '支用通过率',
        loanApprovalRate: { current: 0.75, change: 0.01 },
        rowSpan: 2
    },
    {
        customerType: '老户',
        processName: '支用金额',
        loanAmount: { current: 2000000, change: 200000 },
        rowSpan: 0
    },
    {
        customerType: '老户',
        processName: '平均期数',
        averageTerm: { current: 10, change: 0.5 },
        rowSpan: 2
    },
    {
        customerType: '老户',
        processName: '平均定价',
        averagePricing: { current: 0.12, change: 0.005 },
        rowSpan: 0
    }
]);
const emitTimeRangeChange = () => {
    emit('time-range-change', props.timeRange);
};
const getChangeClass = (value) => {
    return value > 0 ? 'warning-text' : 'success-text';
};
const spanMethod = ({ record, column, rowIndex }) => {
    if (column.dataIndex === 'customerType') {
        const sameTypeRows = tableData.value.filter(item => item.customerType === record.customerType);
        const isFirstRow = tableData.value.findIndex(item => item.customerType === record.customerType) === rowIndex;
        return {
            rowspan: isFirstRow ? sameTypeRows.length : 0,
            colspan: 1
        };
    }
    return {
        rowspan: 1,
        colspan: 1
    };
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "business-process-tab" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "time-range-selector" },
});
const __VLS_0 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    value: (__VLS_ctx.timeRange),
    type: "button",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    value: (__VLS_ctx.timeRange),
    type: "button",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.emitTimeRangeChange)
};
__VLS_3.slots.default;
const __VLS_8 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    value: "month",
}));
const __VLS_10 = __VLS_9({
    value: "month",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
const __VLS_12 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    value: "quarter",
}));
const __VLS_14 = __VLS_13({
    value: "quarter",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
var __VLS_3;
const __VLS_16 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    data: (__VLS_ctx.tableData),
    pagination: (false),
    bordered: ({ wrapper: true, cell: true }),
    spanMethod: (__VLS_ctx.spanMethod),
    ...{ class: "process-table" },
}));
const __VLS_18 = __VLS_17({
    data: (__VLS_ctx.tableData),
    pagination: (false),
    bordered: ({ wrapper: true, cell: true }),
    spanMethod: (__VLS_ctx.spanMethod),
    ...{ class: "process-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_20 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "客群结构",
        dataIndex: "customerType",
        width: (120),
    }));
    const __VLS_22 = __VLS_21({
        title: "客群结构",
        dataIndex: "customerType",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_23.slots;
        const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (rowIndex % 8 === 0) {
            (record.customerType);
        }
    }
    var __VLS_23;
    const __VLS_24 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: "业务流程",
        dataIndex: "processName",
        width: (150),
    }));
    const __VLS_26 = __VLS_25({
        title: "业务流程",
        dataIndex: "processName",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_27.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (record.processName);
    }
    var __VLS_27;
    const __VLS_28 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: "实际数据",
        dataIndex: "currentValue",
        width: (150),
    }));
    const __VLS_30 = __VLS_29({
        title: "实际数据",
        dataIndex: "currentValue",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_31.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comparison-cell" },
        });
        (record.processName === '授信申请量' ? record.creditApplyCount.current :
            record.processName === '授信通过率' ? __VLS_ctx.formatPercent(record.creditApprovalRate.current) :
                record.processName === '授信平均额度' ? __VLS_ctx.formatAmount(record.creditLimit.current) :
                    record.processName === '支用申请量' ? record.loanApplyCount.current :
                        record.processName === '支用通过率' ? __VLS_ctx.formatPercent(record.loanApprovalRate.current) :
                            record.processName === '支用金额' ? __VLS_ctx.formatAmount(record.loanAmount.current) :
                                record.processName === '平均期数' ? record.averageTerm.current :
                                    __VLS_ctx.formatPercent(record.averagePricing.current));
    }
    var __VLS_31;
    const __VLS_32 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: "环比",
        dataIndex: "change",
        width: (150),
    }));
    const __VLS_34 = __VLS_33({
        title: "环比",
        dataIndex: "change",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_35.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comparison-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (__VLS_ctx.getChangeClass(record.processName === '授信申请量' ? record.creditApplyCount.change :
                    record.processName === '授信通过率' ? record.creditApprovalRate.change :
                        record.processName === '授信平均额度' ? record.creditLimit.change :
                            record.processName === '支用申请量' ? record.loanApplyCount.change :
                                record.processName === '支用通过率' ? record.loanApprovalRate.change :
                                    record.processName === '支用金额' ? record.loanAmount.change :
                                        record.processName === '平均期数' ? record.averageTerm.change :
                                            record.averagePricing.change)) },
        });
        (record.processName === '授信申请量' ? __VLS_ctx.formatChangeValue(record.creditApplyCount.change, 'number') :
            record.processName === '授信通过率' ? __VLS_ctx.formatChangeValue(record.creditApprovalRate.change, 'percent') :
                record.processName === '授信平均额度' ? __VLS_ctx.formatChangeValue(record.creditLimit.change, 'amount') :
                    record.processName === '支用申请量' ? __VLS_ctx.formatChangeValue(record.loanApplyCount.change, 'number') :
                        record.processName === '支用通过率' ? __VLS_ctx.formatChangeValue(record.loanApprovalRate.change, 'percent') :
                            record.processName === '支用金额' ? __VLS_ctx.formatChangeValue(record.loanAmount.change, 'amount') :
                                record.processName === '平均期数' ? __VLS_ctx.formatChangeValue(record.averageTerm.change, 'number') :
                                    __VLS_ctx.formatChangeValue(record.averagePricing.change, 'percent'));
    }
    var __VLS_35;
}
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['business-process-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['time-range-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['process-table']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-cell']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatAmount: formatAmount,
            formatPercent: formatPercent,
            formatChangeValue: formatChangeValue,
            tableData: tableData,
            emitTimeRangeChange: emitTimeRangeChange,
            getChangeClass: getChangeClass,
            spanMethod: spanMethod,
        };
    },
    emits: {},
    props: {
        platform: {
            type: String,
            required: true
        },
        businessType: {
            type: String,
            required: true
        },
        timeRange: {
            type: String,
            required: true
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        platform: {
            type: String,
            required: true
        },
        businessType: {
            type: String,
            required: true
        },
        timeRange: {
            type: String,
            required: true
        }
    },
});
; /* PartiallyEnd: #4569/main.vue */
