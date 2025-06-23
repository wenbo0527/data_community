/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { onMounted, watch } from 'vue';
const props = defineProps({
    history: {
        type: Array,
        default: () => []
    }
});
// 监听props变化，记录数据变化情况
watch(() => props.history, (newVal) => {
    console.debug('[AdjustmentHistory] history数据变化:', {
        timestamp: Date.now(),
        count: newVal?.length,
        isEmpty: !newVal || newVal.length === 0,
        firstItem: newVal && newVal.length > 0 ? {
            customerNo: newVal[0].customerNo,
            adjustDate: newVal[0].adjustDate,
            hasBeforeAmount: 'beforeAmount' in newVal[0],
            beforeAmountValue: newVal[0].beforeAmount,
            hasAfterAmount: 'afterAmount' in newVal[0],
            afterAmountValue: newVal[0].afterAmount,
            hasBeforeRate: 'beforeRate' in newVal[0],
            beforeRateValue: newVal[0].beforeRate,
            hasAfterRate: 'afterRate' in newVal[0],
            afterRateValue: newVal[0].afterRate,
            hasBeforePeriod: 'beforePeriod' in newVal[0],
            beforePeriodValue: newVal[0].beforePeriod,
            hasAfterPeriod: 'afterPeriod' in newVal[0],
            afterPeriodValue: newVal[0].afterPeriod
        } : null
    });
}, { immediate: true, deep: true });
onMounted(() => {
    console.debug('[AdjustmentHistory] 组件挂载完成，初始数据:', {
        timestamp: Date.now(),
        hasHistory: !!props.history,
        historyCount: props.history?.length
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "adjustment-history" },
});
if (!__VLS_ctx.history || __VLS_ctx.history.length === 0) {
    const __VLS_0 = {}.AEmpty;
    /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        description: "暂无调额历史",
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无调额历史",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    const __VLS_4 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        data: (__VLS_ctx.history),
        pagination: (false),
        size: "small",
        borderCell: true,
    }));
    const __VLS_6 = __VLS_5({
        data: (__VLS_ctx.history),
        pagination: (false),
        size: "small",
        borderCell: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        title: "客户号",
        dataIndex: "customerNo",
    }));
    const __VLS_10 = __VLS_9({
        title: "客户号",
        dataIndex: "customerNo",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        title: "调整日期",
        dataIndex: "adjustDate",
    }));
    const __VLS_14 = __VLS_13({
        title: "调整日期",
        dataIndex: "adjustDate",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_16 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        title: "调整前额度",
        dataIndex: "beforeAmount",
    }));
    const __VLS_18 = __VLS_17({
        title: "调整前额度",
        dataIndex: "beforeAmount",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_19.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.beforeAmount || 0).toFixed(2));
    }
    var __VLS_19;
    const __VLS_20 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "调整后额度",
        dataIndex: "afterAmount",
    }));
    const __VLS_22 = __VLS_21({
        title: "调整后额度",
        dataIndex: "afterAmount",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_23.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.afterAmount || 0).toFixed(2));
    }
    var __VLS_23;
    const __VLS_24 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: "调整原因",
        dataIndex: "adjustReason",
    }));
    const __VLS_26 = __VLS_25({
        title: "调整原因",
        dataIndex: "adjustReason",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const __VLS_28 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: "调整前利率",
        dataIndex: "beforeRate",
    }));
    const __VLS_30 = __VLS_29({
        title: "调整前利率",
        dataIndex: "beforeRate",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_31.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.beforeRate || 0).toFixed(2));
    }
    var __VLS_31;
    const __VLS_32 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: "调整后利率",
        dataIndex: "afterRate",
    }));
    const __VLS_34 = __VLS_33({
        title: "调整后利率",
        dataIndex: "afterRate",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_35.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.afterRate || 0).toFixed(2));
    }
    var __VLS_35;
    const __VLS_36 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        title: "调整前期限",
        dataIndex: "beforePeriod",
    }));
    const __VLS_38 = __VLS_37({
        title: "调整前期限",
        dataIndex: "beforePeriod",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    const __VLS_40 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        title: "调整后期限",
        dataIndex: "afterPeriod",
    }));
    const __VLS_42 = __VLS_41({
        title: "调整后期限",
        dataIndex: "afterPeriod",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_44 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        title: "操作人",
        dataIndex: "operator",
    }));
    const __VLS_46 = __VLS_45({
        title: "操作人",
        dataIndex: "operator",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const __VLS_48 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        title: "结果",
        dataIndex: "result",
    }));
    const __VLS_50 = __VLS_49({
        title: "结果",
        dataIndex: "result",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    var __VLS_7;
}
/** @type {__VLS_StyleScopedClasses['adjustment-history']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
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
; /* PartiallyEnd: #4569/main.vue */
