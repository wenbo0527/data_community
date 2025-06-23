/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { onMounted, watch } from 'vue';
const props = defineProps({
    credits: {
        type: Array,
        default: () => []
    }
});
// 监听props变化，记录数据变化情况
watch(() => props.credits, (newVal) => {
    console.debug('[CreditList] credits数据变化:', {
        timestamp: Date.now(),
        count: newVal?.length,
        isEmpty: !newVal || newVal.length === 0,
        firstItem: newVal && newVal.length > 0 ? {
            creditNo: newVal[0].creditNo,
            creditDate: newVal[0].creditDate,
            hasInitialAmount: 'initialAmount' in newVal[0],
            initialAmountValue: newVal[0].initialAmount,
            hasCurrentAmount: 'currentAmount' in newVal[0],
            currentAmountValue: newVal[0].currentAmount,
            hasUsedAmount: 'usedAmount' in newVal[0],
            usedAmountValue: newVal[0].usedAmount
        } : null
    });
}, { immediate: true, deep: true });
onMounted(() => {
    console.debug('[CreditList] 组件挂载完成，初始数据:', {
        timestamp: Date.now(),
        hasCredits: !!props.credits,
        creditsCount: props.credits?.length
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "credit-list" },
});
if (!__VLS_ctx.credits || __VLS_ctx.credits.length === 0) {
    const __VLS_0 = {}.AEmpty;
    /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        description: "暂无授信信息",
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无授信信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    const __VLS_4 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        data: (__VLS_ctx.credits),
        pagination: (false),
        size: "small",
        borderCell: true,
    }));
    const __VLS_6 = __VLS_5({
        data: (__VLS_ctx.credits),
        pagination: (false),
        size: "small",
        borderCell: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        title: "授信编号",
        dataIndex: "creditNo",
    }));
    const __VLS_10 = __VLS_9({
        title: "授信编号",
        dataIndex: "creditNo",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        title: "授信日期",
        dataIndex: "creditDate",
    }));
    const __VLS_14 = __VLS_13({
        title: "授信日期",
        dataIndex: "creditDate",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_16 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        title: "渠道",
        dataIndex: "channel",
    }));
    const __VLS_18 = __VLS_17({
        title: "渠道",
        dataIndex: "channel",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_20 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "结果",
        dataIndex: "result",
    }));
    const __VLS_22 = __VLS_21({
        title: "结果",
        dataIndex: "result",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_24 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: "拒绝原因",
        dataIndex: "rejectReason",
    }));
    const __VLS_26 = __VLS_25({
        title: "拒绝原因",
        dataIndex: "rejectReason",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const __VLS_28 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: "初始额度",
        dataIndex: "initialAmount",
    }));
    const __VLS_30 = __VLS_29({
        title: "初始额度",
        dataIndex: "initialAmount",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_31.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.initialAmount || 0).toFixed(2));
    }
    var __VLS_31;
    const __VLS_32 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: "当前额度",
        dataIndex: "currentAmount",
    }));
    const __VLS_34 = __VLS_33({
        title: "当前额度",
        dataIndex: "currentAmount",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_35.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.currentAmount || 0).toFixed(2));
    }
    var __VLS_35;
    const __VLS_36 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        title: "已用额度",
        dataIndex: "usedAmount",
    }));
    const __VLS_38 = __VLS_37({
        title: "已用额度",
        dataIndex: "usedAmount",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_39.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.usedAmount || 0).toFixed(2));
    }
    var __VLS_39;
    const __VLS_40 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        title: "风险等级",
        dataIndex: "riskLevel",
    }));
    const __VLS_42 = __VLS_41({
        title: "风险等级",
        dataIndex: "riskLevel",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_44 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        title: "操作",
    }));
    const __VLS_46 = __VLS_45({
        title: "操作",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_47.slots;
        const __VLS_48 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            type: "text",
            size: "small",
        }));
        const __VLS_50 = __VLS_49({
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        var __VLS_51;
    }
    var __VLS_47;
    var __VLS_7;
}
/** @type {__VLS_StyleScopedClasses['credit-list']} */ ;
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
