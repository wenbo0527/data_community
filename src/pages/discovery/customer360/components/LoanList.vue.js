/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { onMounted, watch } from 'vue';
const props = defineProps({
    loans: {
        type: Array,
        default: () => []
    }
});
// 监听props变化，记录数据变化情况
watch(() => props.loans, (newVal) => {
    console.debug('[LoanList] loans数据变化:', {
        timestamp: Date.now(),
        count: newVal?.length,
        isEmpty: !newVal || newVal.length === 0,
        firstItem: newVal && newVal.length > 0 ? {
            loanNo: newVal[0].loanNo,
            loanDate: newVal[0].loanDate,
            hasAmount: 'amount' in newVal[0],
            amountValue: newVal[0].amount,
            hasBalance: 'balance' in newVal[0],
            balanceValue: newVal[0].balance,
            hasInstallments: 'installments' in newVal[0],
            installmentsValue: newVal[0].installments,
            hasPaidInstallments: 'paidInstallments' in newVal[0],
            paidInstallmentsValue: newVal[0].paidInstallments
        } : null
    });
}, { immediate: true, deep: true });
onMounted(() => {
    console.debug('[LoanList] 组件挂载完成，初始数据:', {
        timestamp: Date.now(),
        hasLoans: !!props.loans,
        loansCount: props.loans?.length
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loan-list" },
});
if (!__VLS_ctx.loans || __VLS_ctx.loans.length === 0) {
    const __VLS_0 = {}.AEmpty;
    /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        description: "暂无用信信息",
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无用信信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    const __VLS_4 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        data: (__VLS_ctx.loans),
        pagination: (false),
        size: "small",
        borderCell: true,
    }));
    const __VLS_6 = __VLS_5({
        data: (__VLS_ctx.loans),
        pagination: (false),
        size: "small",
        borderCell: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        title: "用信编号",
        dataIndex: "loanNo",
    }));
    const __VLS_10 = __VLS_9({
        title: "用信编号",
        dataIndex: "loanNo",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        title: "用信日期",
        dataIndex: "loanDate",
    }));
    const __VLS_14 = __VLS_13({
        title: "用信日期",
        dataIndex: "loanDate",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_16 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        title: "银行卡号",
        dataIndex: "bankCard",
    }));
    const __VLS_18 = __VLS_17({
        title: "银行卡号",
        dataIndex: "bankCard",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_20 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "渠道",
        dataIndex: "channel",
    }));
    const __VLS_22 = __VLS_21({
        title: "渠道",
        dataIndex: "channel",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_24 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: "产品名称",
        dataIndex: "productName",
    }));
    const __VLS_26 = __VLS_25({
        title: "产品名称",
        dataIndex: "productName",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const __VLS_28 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: "结果",
        dataIndex: "result",
    }));
    const __VLS_30 = __VLS_29({
        title: "结果",
        dataIndex: "result",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_32 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: "合同编号",
        dataIndex: "contractNo",
    }));
    const __VLS_34 = __VLS_33({
        title: "合同编号",
        dataIndex: "contractNo",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const __VLS_36 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        title: "状态",
        dataIndex: "status",
    }));
    const __VLS_38 = __VLS_37({
        title: "状态",
        dataIndex: "status",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    const __VLS_40 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        title: "金额",
        dataIndex: "amount",
    }));
    const __VLS_42 = __VLS_41({
        title: "金额",
        dataIndex: "amount",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_43.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ((record.amount || 0).toFixed(2));
    }
    var __VLS_43;
    const __VLS_44 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        title: "操作",
        fixed: "right",
    }));
    const __VLS_46 = __VLS_45({
        title: "操作",
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_47.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "operations" },
        });
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
        const __VLS_52 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            type: "text",
            size: "small",
        }));
        const __VLS_54 = __VLS_53({
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        var __VLS_55;
        const __VLS_56 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            type: "text",
            size: "small",
        }));
        const __VLS_58 = __VLS_57({
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        var __VLS_59;
    }
    var __VLS_47;
    var __VLS_7;
}
/** @type {__VLS_StyleScopedClasses['loan-list']} */ ;
/** @type {__VLS_StyleScopedClasses['operations']} */ ;
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
