/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, watch } from 'vue';
const props = defineProps({
    userInfo: {
        type: Object,
        default: () => null
    },
    productData: {
        type: Array,
        default: () => []
    }
});
// 监听props变化，记录数据变化情况
watch(() => props.userInfo, (newVal) => {
    console.debug('[ProductInfo] userInfo数据变化:', {
        timestamp: Date.now(),
        hasError: newVal?.error,
        hasData: !!newVal,
        maxOverdueDays: newVal?.maxOverdueDays,
        currentOverdueDays: newVal?.currentOverdueDays,
        overdueAmount: newVal?.overdueAmount,
        repaymentRate: newVal?.repaymentRate
    });
}, { immediate: true, deep: true });
watch(() => props.productData, (newVal) => {
    console.debug('[ProductInfo] productData数据变化:', {
        timestamp: Date.now(),
        count: newVal?.length,
        isEmpty: !newVal || newVal.length === 0,
        firstItem: newVal && newVal.length > 0 ? {
            productKey: newVal[0].productKey,
            name: newVal[0].name,
            hasBalance: 'balance' in newVal[0],
            balanceValue: newVal[0].balance
        } : null
    });
}, { immediate: true, deep: true });
onMounted(() => {
    console.debug('[ProductInfo] 组件挂载完成，初始数据:', {
        timestamp: Date.now(),
        hasUserInfo: !!props.userInfo,
        userInfoError: props.userInfo?.error,
        productDataCount: props.productData?.length
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "product-info" },
});
if (!__VLS_ctx.userInfo) {
    const __VLS_0 = {}.ASkeleton;
    /** @type {[typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        loading: (true),
    }));
    const __VLS_2 = __VLS_1({
        loading: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else if (__VLS_ctx.userInfo.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_4 = {}.AEmpty;
    /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        description: "找不到用户相关信息",
    }));
    const __VLS_6 = __VLS_5({
        description: "找不到用户相关信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    const __VLS_8 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        bordered: true,
        column: ({ xs: 1, sm: 2, md: 4 }),
        size: "small",
    }));
    const __VLS_10 = __VLS_9({
        bordered: true,
        column: ({ xs: 1, sm: 2, md: 4 }),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        label: "历史最大透支天数",
    }));
    const __VLS_14 = __VLS_13({
        label: "历史最大透支天数",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.userInfo.maxOverdueDays || 0);
    var __VLS_15;
    const __VLS_16 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        label: "当前透支天数",
    }));
    const __VLS_18 = __VLS_17({
        label: "当前透支天数",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    (__VLS_ctx.userInfo.currentOverdueDays || 0);
    var __VLS_19;
    const __VLS_20 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        label: "当前透支金额",
    }));
    const __VLS_22 = __VLS_21({
        label: "当前透支金额",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    ((__VLS_ctx.userInfo.overdueAmount || 0).toFixed(2));
    var __VLS_23;
    const __VLS_24 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        label: "当前还款率",
    }));
    const __VLS_26 = __VLS_25({
        label: "当前还款率",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    (__VLS_ctx.userInfo.repaymentRate || 0);
    var __VLS_27;
    var __VLS_11;
    if (__VLS_ctx.productData && __VLS_ctx.productData.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-title mt-4" },
        });
    }
    if (__VLS_ctx.productData && __VLS_ctx.productData.length > 0) {
        const __VLS_28 = {}.ATable;
        /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            data: (__VLS_ctx.productData),
            pagination: (false),
            size: "small",
            borderCell: true,
        }));
        const __VLS_30 = __VLS_29({
            data: (__VLS_ctx.productData),
            pagination: (false),
            size: "small",
            borderCell: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        const __VLS_32 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            title: "产品编号",
            dataIndex: "productKey",
        }));
        const __VLS_34 = __VLS_33({
            title: "产品编号",
            dataIndex: "productKey",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        const __VLS_36 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            title: "产品名称",
            dataIndex: "name",
        }));
        const __VLS_38 = __VLS_37({
            title: "产品名称",
            dataIndex: "name",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        const __VLS_40 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            title: "余额",
            dataIndex: "balance",
        }));
        const __VLS_42 = __VLS_41({
            title: "余额",
            dataIndex: "balance",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_43.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            ((record.balance || 0).toFixed(2));
        }
        var __VLS_43;
        const __VLS_44 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            title: "状态",
            dataIndex: "status",
        }));
        const __VLS_46 = __VLS_45({
            title: "状态",
            dataIndex: "status",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        var __VLS_31;
    }
    else if (!__VLS_ctx.userInfo.error) {
        const __VLS_48 = {}.AEmpty;
        /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            description: "暂无产品信息",
        }));
        const __VLS_50 = __VLS_49({
            description: "暂无产品信息",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    }
}
/** @type {__VLS_StyleScopedClasses['product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
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
