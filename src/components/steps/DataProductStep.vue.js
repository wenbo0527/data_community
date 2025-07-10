/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { watch, reactive, computed, onMounted } from 'vue';
import { IconDelete } from '@arco-design/web-vue/es/icon';
const mockDataProducts = [
    { id: 'dp1', name: '数据产品A', description: '用于信用评估的综合数据产品', price: 100, supplier: '供应商A', sceneRatios: {} },
    { id: 'dp2', name: '数据产品B', description: '用于风险控制的专业数据产品', price: 150, supplier: '供应商B', sceneRatios: {} },
    { id: 'dp3', name: '数据产品C', description: '用于营销分析的高级数据产品', price: 200, supplier: '供应商C', sceneRatios: {} },
];
const props = defineProps();
const emit = defineEmits();
// 使用reactive创建一个新的响应式对象
const modelValueRef = reactive({
    products: [...props.modelValue.products],
    periodDays: [...props.modelValue.periodDays]
});
const products = computed(() => modelValueRef.products);
const periodDays = computed(() => modelValueRef.periodDays);
// 监听props变化更新reactive对象
watch(() => props.modelValue, (newValue) => {
    Object.assign(modelValueRef, newValue);
}, { deep: true });
// 删除数据产品
const removeProduct = (index) => {
    modelValueRef.products.splice(index, 1);
    emit('update:modelValue', modelValueRef);
};
// 初始化默认数据产品
onMounted(() => {
    if (modelValueRef.products.length === 0) {
        addProduct();
    }
    // 为每个数据产品初始化期数配置
    modelValueRef.products.forEach(product => {
        if (!product.periods || product.periods.length !== periodDays.value.length) {
            product.periods = periodDays.value.map((days, index) => ({
                count: 0,
                days,
                ratio: 0,
                dailyAmount: 0,
                cost: 0,
                discount: {
                    type: 'none',
                    value: 0
                }
            }));
        }
    });
});
const columns = [
    { title: '期数', slotName: 'period', width: 80 },
    { title: '每期陪跑量', slotName: 'periodConfig', width: 120 },
    { title: '当期占比', slotName: 'periodRatio', width: 100 },
    { title: '日均陪跑量', slotName: 'averageDailyAmount', width: 100 },
    { title: '折扣优惠', slotName: 'discountOption', width: 200 },
    { title: '当期费用', slotName: 'totalCost', width: 120 }
];
import { calculateRatio, calculateDailyAmount, calculateCost } from '../../utils/calculations';
const getProductPrice = (name) => {
    const product = mockDataProducts.find(p => p.name === name);
    return product?.price || 0;
};
const addProduct = () => {
    const newProduct = {
        id: `dp${modelValueRef.products.length + 1}`,
        name: '',
        totalAmount: 0,
        periods: periodDays.value.map((days, index) => ({
            count: 0,
            days,
            ratio: 0,
            dailyAmount: 0,
            cost: 0,
            discount: {
                type: 'none',
                value: 0
            }
        })),
        sceneRatios: {},
        scenes: []
    };
    modelValueRef.products.push(newProduct);
    emit('update:modelValue', modelValueRef);
};
const handleNext = () => emit('next');
const handlePrev = () => emit('prev');
watch(products, (newProducts) => {
    emit('update:modelValue', {
        ...modelValueRef,
        products: newProducts
    });
}, { deep: true });
// 监听每个产品的periods变化
watch(() => modelValueRef.products.map((p) => p.periods), () => {
    console.log('Periods updated:', modelValueRef.products.map((p) => p.periods));
    emit('update:modelValue', modelValueRef);
}, { deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-product-config" },
});
for (const [product, index] of __VLS_getVForSourceType((__VLS_ctx.modelValue.products))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "product-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-header" },
    });
    if (__VLS_ctx.modelValueRef.products.length > 1) {
        const __VLS_0 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ 'onClick': {} },
            type: "text",
            status: "danger",
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onClick': {} },
            type: "text",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_4;
        let __VLS_5;
        let __VLS_6;
        const __VLS_7 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.modelValueRef.products.length > 1))
                    return;
                __VLS_ctx.removeProduct(index);
            }
        };
        __VLS_3.slots.default;
        const __VLS_8 = {}.IconDelete;
        /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
        const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
        var __VLS_3;
    }
    const __VLS_12 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        gutter: (24),
    }));
    const __VLS_14 = __VLS_13({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        span: (12),
    }));
    const __VLS_18 = __VLS_17({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        label: "数据产品",
        field: (`products[${index}].name`),
        required: true,
    }));
    const __VLS_22 = __VLS_21({
        label: "数据产品",
        field: (`products[${index}].name`),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        modelValue: (product.name),
        placeholder: "请选择数据产品",
        ...{ class: "custom-select" },
    }));
    const __VLS_26 = __VLS_25({
        modelValue: (product.name),
        placeholder: "请选择数据产品",
        ...{ class: "custom-select" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    for (const [dp] of __VLS_getVForSourceType((__VLS_ctx.mockDataProducts))) {
        const __VLS_28 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            key: (dp.id),
            value: (dp.name),
        }));
        const __VLS_30 = __VLS_29({
            key: (dp.id),
            value: (dp.name),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        (dp.name);
        (dp.description);
        (dp.price);
        var __VLS_31;
    }
    var __VLS_27;
    var __VLS_23;
    var __VLS_19;
    const __VLS_32 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        span: (12),
    }));
    const __VLS_34 = __VLS_33({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        label: "总陪跑量",
        field: (`products[${index}].totalAmount`),
        required: true,
    }));
    const __VLS_38 = __VLS_37({
        label: "总陪跑量",
        field: (`products[${index}].totalAmount`),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        modelValue: (product.totalAmount),
        placeholder: "请输入总陪跑量",
        min: (0),
        ...{ class: "custom-input-number" },
    }));
    const __VLS_42 = __VLS_41({
        modelValue: (product.totalAmount),
        placeholder: "请输入总陪跑量",
        min: (0),
        ...{ class: "custom-input-number" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    var __VLS_39;
    var __VLS_35;
    var __VLS_15;
    const __VLS_44 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        data: (product.periods),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        ...{ class: "period-table" },
    }));
    const __VLS_46 = __VLS_45({
        data: (product.periods),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        ...{ class: "period-table" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    {
        const { period: __VLS_thisSlot } = __VLS_47.slots;
        const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
        (rowIndex + 1);
    }
    {
        const { periodConfig: __VLS_thisSlot } = __VLS_47.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_48 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            modelValue: (record.count),
            min: (0),
            max: (product.totalAmount),
            ...{ class: "count-input" },
            placeholder: "请输入条数",
        }));
        const __VLS_50 = __VLS_49({
            modelValue: (record.count),
            min: (0),
            max: (product.totalAmount),
            ...{ class: "count-input" },
            placeholder: "请输入条数",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    }
    {
        const { periodRatio: __VLS_thisSlot } = __VLS_47.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.calculateRatio(record.count, product.totalAmount));
    }
    {
        const { averageDailyAmount: __VLS_thisSlot } = __VLS_47.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.calculateDailyAmount(record.count, record.days));
    }
    {
        const { discountOption: __VLS_thisSlot } = __VLS_47.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_52 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            gutter: (8),
        }));
        const __VLS_54 = __VLS_53({
            gutter: (8),
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        const __VLS_56 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            span: (12),
        }));
        const __VLS_58 = __VLS_57({
            span: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        const __VLS_60 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            modelValue: (record.discount.type),
            ...{ class: "discount-select" },
        }));
        const __VLS_62 = __VLS_61({
            modelValue: (record.discount.type),
            ...{ class: "discount-select" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        const __VLS_64 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            value: "none",
        }));
        const __VLS_66 = __VLS_65({
            value: "none",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        var __VLS_67;
        const __VLS_68 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            value: "discount",
        }));
        const __VLS_70 = __VLS_69({
            value: "discount",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        var __VLS_71;
        const __VLS_72 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            value: "free",
        }));
        const __VLS_74 = __VLS_73({
            value: "free",
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        var __VLS_75;
        var __VLS_63;
        var __VLS_59;
        const __VLS_76 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            span: (12),
        }));
        const __VLS_78 = __VLS_77({
            span: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        __VLS_79.slots.default;
        if (record.discount.type !== 'none') {
            const __VLS_80 = {}.AInputNumber;
            /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                modelValue: (record.discount.value),
                min: (0),
                max: (record.discount.type === 'discount' ? 1 : record.count),
                precision: (record.discount.type === 'discount' ? 2 : 0),
                placeholder: (record.discount.type === 'discount' ? '请输入折扣率' : '请输入免费条数'),
                ...{ class: "discount-value-input" },
            }));
            const __VLS_82 = __VLS_81({
                modelValue: (record.discount.value),
                min: (0),
                max: (record.discount.type === 'discount' ? 1 : record.count),
                precision: (record.discount.type === 'discount' ? 2 : 0),
                placeholder: (record.discount.type === 'discount' ? '请输入折扣率' : '请输入免费条数'),
                ...{ class: "discount-value-input" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        }
        var __VLS_79;
        var __VLS_55;
    }
    {
        const { totalCost: __VLS_thisSlot } = __VLS_47.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.calculateCost(record.count, __VLS_ctx.getProductPrice(product.name), record.discount.type, record.discount.value));
    }
    var __VLS_47;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
const __VLS_84 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onClick': {} },
    type: "outline",
}));
const __VLS_86 = __VLS_85({
    ...{ 'onClick': {} },
    type: "outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onClick: (__VLS_ctx.addProduct)
};
__VLS_87.slots.default;
var __VLS_87;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-footer" },
});
const __VLS_92 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    ...{ 'onClick': {} },
    size: "large",
}));
const __VLS_98 = __VLS_97({
    ...{ 'onClick': {} },
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
let __VLS_100;
let __VLS_101;
let __VLS_102;
const __VLS_103 = {
    onClick: (__VLS_ctx.handlePrev)
};
__VLS_99.slots.default;
var __VLS_99;
const __VLS_104 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}));
const __VLS_106 = __VLS_105({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onClick: (__VLS_ctx.handleNext)
};
__VLS_107.slots.default;
var __VLS_107;
var __VLS_95;
/** @type {__VLS_StyleScopedClasses['data-product-config']} */ ;
/** @type {__VLS_StyleScopedClasses['product-section']} */ ;
/** @type {__VLS_StyleScopedClasses['product-header']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input-number']} */ ;
/** @type {__VLS_StyleScopedClasses['period-table']} */ ;
/** @type {__VLS_StyleScopedClasses['count-input']} */ ;
/** @type {__VLS_StyleScopedClasses['discount-select']} */ ;
/** @type {__VLS_StyleScopedClasses['discount-value-input']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['form-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconDelete: IconDelete,
            mockDataProducts: mockDataProducts,
            modelValueRef: modelValueRef,
            removeProduct: removeProduct,
            columns: columns,
            calculateRatio: calculateRatio,
            calculateDailyAmount: calculateDailyAmount,
            calculateCost: calculateCost,
            getProductPrice: getProductPrice,
            addProduct: addProduct,
            handleNext: handleNext,
            handlePrev: handlePrev,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
