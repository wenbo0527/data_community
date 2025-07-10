/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { formatAmount, formatChangeValue } from '@/utils/calculations';
import { useRouter } from 'vue-router';
const router = useRouter();
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
        name: '实际费用',
        current: 120000,
        change: 20000,
        type: 'amount'
    },
    {
        name: '征信调用量',
        current: 1500,
        change: 200,
        type: 'number'
    },
    {
        name: '征信单笔成本',
        current: 80,
        change: 5,
        type: 'amount'
    },
    {
        name: '外部数据使用量',
        current: 1000,
        change: 150,
        type: 'number',
        onClick: () => {
            router.push({
                path: '/exploration/external-data-analysis/external-data-evaluation',
                query: {
                    platform: props.platform
                }
            });
        }
    },
    {
        name: '外部数据调用量',
        current: 500,
        change: 50,
        type: 'number'
    },
    {
        name: '外部数据平均单价',
        current: 240,
        change: 20,
        type: 'amount'
    }
]);
const emitTimeRangeChange = () => {
    emit('time-range-change', props.timeRange);
};
const getChangeClass = (value) => {
    return value > 0 ? 'warning-text' : 'success-text';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "budget-consumption-tab" },
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
    ...{ class: "budget-table" },
}));
const __VLS_18 = __VLS_17({
    data: (__VLS_ctx.tableData),
    pagination: (false),
    bordered: ({ wrapper: true, cell: true }),
    ...{ class: "budget-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_20 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "关键指标",
        dataIndex: "name",
        width: (120),
    }));
    const __VLS_22 = __VLS_21({
        title: "关键指标",
        dataIndex: "name",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_23.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (record.onClick) },
            ...{ class: ({ 'clickable': record.onClick }) },
        });
        (record.name);
    }
    var __VLS_23;
    const __VLS_24 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: "当期数据",
        dataIndex: "current",
        width: (150),
    }));
    const __VLS_26 = __VLS_25({
        title: "当期数据",
        dataIndex: "current",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_27.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comparison-cell" },
        });
        (record.type === 'amount' ? __VLS_ctx.formatAmount(record.current) : record.current);
    }
    var __VLS_27;
    const __VLS_28 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: "环比",
        dataIndex: "change",
        width: (150),
    }));
    const __VLS_30 = __VLS_29({
        title: "环比",
        dataIndex: "change",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_31.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comparison-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (__VLS_ctx.getChangeClass(record.change)) },
        });
        (__VLS_ctx.formatChangeValue(record.change, record.type));
    }
    var __VLS_31;
}
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['budget-consumption-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['time-range-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['budget-table']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-cell']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatAmount: formatAmount,
            formatChangeValue: formatChangeValue,
            tableData: tableData,
            emitTimeRangeChange: emitTimeRangeChange,
            getChangeClass: getChangeClass,
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
