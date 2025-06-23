/// <reference types="../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref } from 'vue';
import { formatAmount } from '@/utils/calculations';
import ExternalProductModal from '@/components/modals/ExternalProductModal.vue';
const selectedProducts = ref([]);
const selectedPlatform = ref();
const selectedMonth = ref();
const products = ref([
    '产品A', '产品B', '产品C', '产品D'
]);
const platforms = ref([
    '平台1', '平台2', '平台3'
]);
const tableData = ref([
    {
        product: '产品A',
        price: formatAmount(1000),
        cost: formatAmount(50000),
        iv: 0.5,
        ks: 0.45,
        psi: 0.12,
        value: 0.45,
        valueLevel: '高',
        performance: '优秀',
        performanceLevel: '高',
        priceLevel: '中',
        usageLevel: '高',
        stability: '稳定'
    },
    {
        product: '产品B',
        price: formatAmount(1500),
        cost: formatAmount(75000),
        iv: 0.4,
        ks: 0.35,
        psi: 0.15,
        value: 0.23,
        valueLevel: '中',
        performance: '良好',
        performanceLevel: '中',
        priceLevel: '高',
        usageLevel: '中',
        stability: '较稳定'
    },
    {
        product: '产品C',
        price: formatAmount(800),
        cost: formatAmount(40000),
        iv: 0.3,
        ks: 0.25,
        psi: 0.18,
        value: 0.31,
        valueLevel: '中',
        performance: '一般',
        performanceLevel: '低',
        priceLevel: '低',
        usageLevel: '高',
        stability: '一般'
    }
]);
const getLevelColor = (level) => {
    switch (level) {
        case '高': return 'green';
        case '中': return 'orange';
        case '低': return 'red';
        default: return 'gray';
    }
};
const getKsLevel = (ks) => {
    if (ks >= 0.4)
        return '高';
    if (ks >= 0.3)
        return '中';
    return '低';
};
const modalVisible = ref(false);
const currentProduct = ref({});
const showProductDetail = (product) => {
    currentProduct.value = product;
    modalVisible.value = true;
};
const exportData = () => {
    // 导出按钮点击事件，仅保留UI功能
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "external-data-evaluation" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-section" },
});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.exportData)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    placeholder: "选择外数产品",
    ...{ style: ({ width: '200px' }) },
    modelValue: (__VLS_ctx.selectedProducts),
    multiple: true,
    allowClear: true,
}));
const __VLS_10 = __VLS_9({
    placeholder: "选择外数产品",
    ...{ style: ({ width: '200px' }) },
    modelValue: (__VLS_ctx.selectedProducts),
    multiple: true,
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
for (const [product] of __VLS_getVForSourceType((__VLS_ctx.products))) {
    const __VLS_12 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        key: (product),
        value: (product),
    }));
    const __VLS_14 = __VLS_13({
        key: (product),
        value: (product),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (product);
    var __VLS_15;
}
var __VLS_11;
const __VLS_16 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    placeholder: "选择使用平台",
    ...{ style: ({ width: '200px', marginLeft: '16px' }) },
    modelValue: (__VLS_ctx.selectedPlatform),
    allowClear: true,
}));
const __VLS_18 = __VLS_17({
    placeholder: "选择使用平台",
    ...{ style: ({ width: '200px', marginLeft: '16px' }) },
    modelValue: (__VLS_ctx.selectedPlatform),
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
for (const [platform] of __VLS_getVForSourceType((__VLS_ctx.platforms))) {
    const __VLS_20 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        key: (platform),
        value: (platform),
    }));
    const __VLS_22 = __VLS_21({
        key: (platform),
        value: (platform),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    (platform);
    var __VLS_23;
}
var __VLS_19;
const __VLS_24 = {}.AMonthPicker;
/** @type {[typeof __VLS_components.AMonthPicker, typeof __VLS_components.aMonthPicker, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    placeholder: "选择数据月份",
    ...{ style: ({ width: '200px', marginLeft: '16px' }) },
    modelValue: (__VLS_ctx.selectedMonth),
}));
const __VLS_26 = __VLS_25({
    placeholder: "选择数据月份",
    ...{ style: ({ width: '200px', marginLeft: '16px' }) },
    modelValue: (__VLS_ctx.selectedMonth),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    data: (__VLS_ctx.tableData),
    pagination: (false),
    bordered: ({ wrapper: true, cell: true }),
    ...{ class: "evaluation-table" },
}));
const __VLS_30 = __VLS_29({
    data: (__VLS_ctx.tableData),
    pagination: (false),
    bordered: ({ wrapper: true, cell: true }),
    ...{ class: "evaluation-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_31.slots;
    const __VLS_32 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: "外数产品",
        dataIndex: "product",
        width: (180),
    }));
    const __VLS_34 = __VLS_33({
        title: "外数产品",
        dataIndex: "product",
        width: (180),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_35.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_36 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ 'onClick': {} },
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_40;
        let __VLS_41;
        let __VLS_42;
        const __VLS_43 = {
            onClick: (...[$event]) => {
                __VLS_ctx.showProductDetail(record);
            }
        };
        __VLS_39.slots.default;
        (record.product);
        var __VLS_39;
    }
    var __VLS_35;
    const __VLS_44 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        title: "单价",
        dataIndex: "price",
        width: (120),
    }));
    const __VLS_46 = __VLS_45({
        title: "单价",
        dataIndex: "price",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_47.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_48 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            content: (`单价: ${record.price}`),
        }));
        const __VLS_50 = __VLS_49({
            content: (`单价: ${record.price}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.price);
        var __VLS_51;
    }
    var __VLS_47;
    const __VLS_52 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        title: "当年实际消耗",
        dataIndex: "cost",
        width: (120),
    }));
    const __VLS_54 = __VLS_53({
        title: "当年实际消耗",
        dataIndex: "cost",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_55.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_56 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            content: (`当年实际消耗: ${record.cost}`),
        }));
        const __VLS_58 = __VLS_57({
            content: (`当年实际消耗: ${record.cost}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.cost);
        var __VLS_59;
    }
    var __VLS_55;
    const __VLS_60 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        title: "性能",
        dataIndex: "ks",
        width: (150),
    }));
    const __VLS_62 = __VLS_61({
        title: "性能",
        dataIndex: "ks",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_63.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (__VLS_ctx.getKsLevel(record.ks));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.ks.toFixed(2));
    }
    var __VLS_63;
    const __VLS_64 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        title: "价格",
        dataIndex: "priceLevel",
        width: (150),
    }));
    const __VLS_66 = __VLS_65({
        title: "价格",
        dataIndex: "priceLevel",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_67.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.priceLevel);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.price);
    }
    var __VLS_67;
    const __VLS_68 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        title: "调用量",
        dataIndex: "usageLevel",
        width: (150),
    }));
    const __VLS_70 = __VLS_69({
        title: "调用量",
        dataIndex: "usageLevel",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_71.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.usageLevel);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.cost);
    }
    var __VLS_71;
    const __VLS_72 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        title: "稳定性",
        dataIndex: "stability",
        width: (150),
    }));
    const __VLS_74 = __VLS_73({
        title: "稳定性",
        dataIndex: "stability",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_75.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.stability);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.stability === '稳定' ? '99.9%' : record.stability === '较稳定' ? '95%' : '90%');
    }
    var __VLS_75;
}
var __VLS_31;
/** @type {[typeof ExternalProductModal, ]} */ ;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(ExternalProductModal, new ExternalProductModal({
    visible: (__VLS_ctx.modalVisible),
    productData: (__VLS_ctx.currentProduct),
}));
const __VLS_77 = __VLS_76({
    visible: (__VLS_ctx.modalVisible),
    productData: (__VLS_ctx.currentProduct),
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
/** @type {__VLS_StyleScopedClasses['external-data-evaluation']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-section']} */ ;
/** @type {__VLS_StyleScopedClasses['evaluation-table']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ExternalProductModal: ExternalProductModal,
            selectedProducts: selectedProducts,
            selectedPlatform: selectedPlatform,
            selectedMonth: selectedMonth,
            products: products,
            platforms: platforms,
            tableData: tableData,
            getKsLevel: getKsLevel,
            modalVisible: modalVisible,
            currentProduct: currentProduct,
            showProductDetail: showProductDetail,
            exportData: exportData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
