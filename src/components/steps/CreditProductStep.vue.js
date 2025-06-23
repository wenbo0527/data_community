/// <reference types="../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits(['next', 'prev']);
const selectedCreditProducts = ref([]);
console.log('初始化selectedCreditProducts:', selectedCreditProducts.value);
// 模拟信贷产品数据
const creditProductOptions = [
    {
        label: '信贷产品A',
        value: 'credit_a',
        weeklyRatio: 25.5,
        submissionRatio: 18.2,
        recommendedRate: 0.35
    },
    {
        label: '信贷产品B',
        value: 'credit_b',
        weeklyRatio: 18.0,
        submissionRatio: 12.5,
        recommendedRate: 0.28
    },
    {
        label: '信贷产品C',
        value: 'credit_c',
        weeklyRatio: 22.3,
        submissionRatio: 15.8,
        recommendedRate: 0.32
    }
];
const getSelectedScenes = (dataProduct) => {
    const scenes = dataProduct.scenes || [];
    console.log('获取选中场景数据:', scenes);
    return scenes;
};
const getCreditProductData = (dataProduct, scene) => {
    console.log('获取信贷产品数据，场景信息:', scene);
    const creditProducts = selectedCreditProducts.value.map(creditProductValue => {
        const creditProductName = creditProductOptions.find(option => option.value === creditProductValue)?.label || '';
        const product = {
            creditProductValue,
            creditProductName,
            amount: 0,
            dataProductId: dataProduct.id,
            sceneValue: scene.sceneValue
        };
        console.log('生成信贷产品数据:', product);
        return product;
    });
    return creditProducts;
};
const calculateRatio = (amount, total) => {
    if (typeof amount !== 'number' || typeof total !== 'number' || total <= 0) {
        console.warn('计算比例参数无效:', { amount, total });
        return '0.00';
    }
    const validAmount = Math.max(0, amount);
    const ratio = ((validAmount / total) * 100).toFixed(2);
    console.log('计算比例:', { amount: validAmount, total, ratio });
    return ratio;
};
const updateAmount = (record, sceneName) => {
    console.log('updateAmount调用，传入的record:', record, '场景名称:', sceneName);
    if (!record || typeof record.amount !== 'number' || !record.creditProductValue || !record.sceneValue) {
        console.warn('无效的记录数据:', record);
        return;
    }
    const dataProduct = props.formData.dataProducts.find(dp => dp.id === record.dataProductId);
    if (!dataProduct) {
        console.warn('未找到对应的数据产品:', record.dataProductId);
        return;
    }
    if (!Array.isArray(dataProduct.scenes)) {
        dataProduct.scenes = [];
    }
    let scene = dataProduct.scenes.find(s => s.sceneValue === record.sceneValue);
    if (!scene) {
        scene = {
            sceneValue: record.sceneValue,
            sceneName: sceneName,
            amount: record.sceneValueAmount || 0,
            ratio: 0,
            totalAmount: dataProduct.totalAmount || 0,
            allocatedAmount: 0,
            remainingAmount: dataProduct.totalAmount || 0,
            weeklyAvgAmount: 0,
            weeklyAvgRatio: '0',
            submissionRatio: '0',
            creditProducts: []
        };
        dataProduct.scenes.push(scene);
    }
    if (!Array.isArray(scene.creditProducts)) {
        scene.creditProducts = [];
    }
    let creditProduct = scene.creditProducts.find(cp => cp.creditProductValue === record.creditProductValue);
    if (creditProduct) {
        creditProduct.amount = Math.min(record.amount, scene.amount || 0);
    }
    else {
        creditProduct = {
            creditProductValue: record.creditProductValue,
            creditProductName: creditProductOptions.find(p => p.value === record.creditProductValue)?.label || '',
            amount: Math.min(record.amount, scene.amount || 0),
            recommendedAmount: calculateRecommendedAmount(record),
            weeklyRatio: Number(calculateWeeklyRatio(record)),
            submissionRatio: Number(calculateSubmissionRatio(record)),
            totalRatio: Number(calculateRatio(record.amount, dataProduct.totalAmount)),
            dataProductId: record.dataProductId,
            sceneValue: record.sceneValue,
            sceneValueAmount: scene.amount || 0
        };
        scene.creditProducts.push(creditProduct);
    }
    scene.allocatedAmount = scene.creditProducts.reduce((sum, cp) => sum + (cp.amount || 0), 0);
    scene.remainingAmount = Math.max(0, scene.amount - scene.allocatedAmount);
    scene.ratio = Number(calculateRatio(scene.allocatedAmount, dataProduct.totalAmount));
    console.log('更新后的场景数据:', scene);
};
const handleNext = () => {
    emit('next');
};
const handlePrev = () => {
    emit('prev');
};
const columns = [
    { title: '信贷产品', slotName: 'creditProduct', width: 160 },
    { title: '分配条数', slotName: 'amount', width: 140 },
    { title: '建议分配量', slotName: 'recommendedAmount', width: 140 },
    { title: '周均转化率', slotName: 'weeklyRatio', width: 120 },
    { title: '提交转化率', slotName: 'submissionRatio', width: 120 },
    { title: '总占比', slotName: 'totalRatio', width: 100 }
];
const getTableData = (dataProduct) => {
    console.log('获取表格数据，数据产品:', dataProduct);
    if (!dataProduct || !Array.isArray(dataProduct.scenes)) {
        console.warn('数据产品或场景数据无效');
        return [];
    }
    const scenes = dataProduct.scenes;
    console.log('场景数据:', scenes);
    const tableData = scenes.map((scene) => {
        if (!scene)
            return [];
        console.log('处理场景数据:', scene);
        const sceneName = sceneOptions.find(option => option.value === scene.sceneValue)?.label || scene.sceneName || '';
        // 为每个场景的每个信贷产品创建数据行
        return selectedCreditProducts.value.map(creditProductValue => {
            const product = creditProductOptions.find(p => p.value === creditProductValue);
            const existingProduct = scene.creditProducts?.find(cp => cp.creditProductValue === creditProductValue);
            return {
                sceneName,
                sceneValue: scene.sceneValue,
                creditProductValue,
                creditProductName: product?.label || '',
                amount: existingProduct?.amount || 0,
                recommendedAmount: calculateRecommendedAmount({ creditProductValue, sceneValueAmount: scene.amount || 0 }),
                weeklyRatio: Number(calculateWeeklyRatio({ creditProductValue })),
                submissionRatio: Number(calculateSubmissionRatio({ creditProductValue })),
                totalRatio: Number(calculateRatio(existingProduct?.amount || 0, dataProduct.totalAmount)),
                dataProductId: dataProduct.id,
                sceneValueAmount: scene.amount || 0
            };
        });
    }).flat().filter(Boolean);
    console.log('生成的表格数据:', tableData);
    return tableData;
};
const getRowClass = (record) => {
    return {
        'scene-row': true
    };
};
const calculateAssignedTotal = (dataProduct) => {
    let total = 0;
    dataProduct.scenes?.forEach((scene) => {
        scene.creditProducts?.forEach((cp) => {
            total += cp.amount || 0;
        });
    });
    return total;
};
const calculateAllocationProgress = (dataProduct) => {
    const assignedTotal = calculateAssignedTotal(dataProduct);
    return dataProduct.totalAmount ? ((assignedTotal / dataProduct.totalAmount) * 100).toFixed(2) : 0;
};
const selectedScenes = ref(['credit_apply', 'credit_pass']);
const sceneConfig = ref({});
const sceneOptions = [
    { label: '授信申请', value: 'credit_apply' },
    { label: '授信通过', value: 'credit_pass' },
    { label: '信贷产品B', value: 'credit_b' },
    { label: '信贷产品C', value: 'credit_c' }
];
// 修改calculateSceneTotal方法
const calculateSceneTotal = (sceneValue) => {
    return props.formData.dataProducts.reduce((total, product) => {
        const scene = product.scenes?.find((s) => s.sceneValue === sceneValue);
        return total + (scene?.amount || 0);
    }, 0);
};
const handleAutoAllocation = () => {
    console.log('开始自动分配，当前选中的信贷产品:', selectedCreditProducts.value);
    selectedScenes.value.forEach(sceneValue => {
        const totalPerScene = props.formData.dataProducts.reduce((sum, dp) => {
            const sceneData = dp.scenes?.find((s) => s.sceneValue === sceneValue);
            return sum + (sceneData?.amount || 0);
        }, 0);
        const avgAmount = Math.floor(totalPerScene / selectedCreditProducts.value.length);
        sceneConfig.value[sceneValue] = selectedCreditProducts.value.map(creditProductValue => ({
            sceneValue: sceneValue,
            creditProductValue,
            amount: avgAmount,
            dataProductId: props.formData.dataProducts[0]?.id,
            creditProductName: creditProductOptions.find(p => p.value === creditProductValue)?.label || ''
        }));
    });
};
// 更新计算函数
const calculateRecommendedAmount = (record) => {
    const product = creditProductOptions.find(p => p.value === record.creditProductValue);
    return product && record.sceneValueAmount ? Math.round(record.sceneValueAmount * (product.recommendedRate || 0)) : 0;
};
const calculateWeeklyRatio = (record) => {
    const product = creditProductOptions.find(p => p.value === record.creditProductValue);
    return product ? product.weeklyRatio?.toFixed(2) || '0.00' : '0.00';
};
const calculateSubmissionRatio = (record) => {
    const product = creditProductOptions.find(p => p.value === record.creditProductValue);
    return product ? product.submissionRatio?.toFixed(2) || '0.00' : '0.00';
};
// 在script setup中添加
import { onMounted } from 'vue';
onMounted(() => {
    initializeSceneConfig(true);
});
const initializeSceneConfig = (forceUpdate = false) => {
    console.log('初始化场景配置开始，forceUpdate:', forceUpdate);
    selectedScenes.value = ['credit_apply', 'credit_pass'];
    props.formData.dataProducts.forEach((dataProduct) => {
        console.log('处理数据产品:', dataProduct);
        selectedScenes.value.forEach((sceneValue) => {
            console.log('处理场景:', sceneValue);
            sceneConfig.value[sceneValue] = selectedCreditProducts.value.map(creditProductValue => {
                const existing = sceneConfig.value[sceneValue]?.find((item) => item.creditProductValue === creditProductValue &&
                    item.dataProductId === dataProduct.id);
                const newConfig = existing || {
                    sceneValue,
                    creditProductValue,
                    creditProductName: creditProductOptions.find(p => p.value === creditProductValue)?.label || '',
                    amount: 0,
                    dataProductId: dataProduct.id,
                    sceneValueAmount: dataProduct.scenes?.find(s => s.sceneValue === sceneValue)?.amount || 0
                };
                console.log('场景配置项:', newConfig);
                return newConfig;
            });
        });
    });
    console.log('初始化场景配置完成，当前配置:', sceneConfig.value);
};
// 监听信贷产品选择变化
watch(selectedCreditProducts, (newValue) => {
    console.log('信贷产品选择变化，新值:', newValue);
    console.log('当前表格数据:', getTableData(props.formData.dataProducts[0]));
    initializeSceneConfig(true);
}, { deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-info']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-th']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "credit-product-step" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "credit-product-selection" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "selection-controls" },
});
const __VLS_0 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.selectedCreditProducts),
    multiple: true,
    placeholder: "请选择信贷产品",
    ...{ class: "credit-product-select" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.selectedCreditProducts),
    multiple: true,
    placeholder: "请选择信贷产品",
    ...{ class: "credit-product-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
for (const [product] of __VLS_getVForSourceType((__VLS_ctx.creditProductOptions))) {
    const __VLS_4 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        key: (product.value),
        value: (product.value),
    }));
    const __VLS_6 = __VLS_5({
        key: (product.value),
        value: (product.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    (product.label);
    var __VLS_7;
}
var __VLS_3;
const __VLS_8 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "auto-btn" },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "auto-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.handleAutoAllocation)
};
__VLS_11.slots.default;
var __VLS_11;
if (__VLS_ctx.selectedCreditProducts.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "configuration-details" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "section-title" },
    });
    for (const [dataProduct, index] of __VLS_getVForSourceType((__VLS_ctx.formData.dataProducts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-product-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "data-product-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "data-product-name" },
        });
        (dataProduct.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.calculateAssignedTotal(dataProduct));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (dataProduct.totalAmount - __VLS_ctx.calculateAssignedTotal(dataProduct));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.calculateAllocationProgress(dataProduct));
        for (const [scene] of __VLS_getVForSourceType((dataProduct.scenes))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (scene.sceneValue),
                ...{ class: "scene-section" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "scene-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "scene-name" },
            });
            (scene.sceneName);
            const __VLS_16 = {}.ATable;
            /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                data: (__VLS_ctx.getTableData(dataProduct)),
                columns: (__VLS_ctx.columns),
                pagination: (false),
                ...{ class: "credit-product-table" },
                rowClass: (__VLS_ctx.getRowClass),
            }));
            const __VLS_18 = __VLS_17({
                data: (__VLS_ctx.getTableData(dataProduct)),
                columns: (__VLS_ctx.columns),
                pagination: (false),
                ...{ class: "credit-product-table" },
                rowClass: (__VLS_ctx.getRowClass),
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            __VLS_19.slots.default;
            {
                const { scene: __VLS_thisSlot } = __VLS_19.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (record.sceneName);
            }
            {
                const { creditProduct: __VLS_thisSlot } = __VLS_19.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (record.creditProductName);
            }
            {
                const { amount: __VLS_thisSlot } = __VLS_19.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                const __VLS_20 = {}.AInputNumber;
                /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                    ...{ 'onChange': {} },
                    modelValue: (record.amount),
                    min: (0),
                    max: (record.sceneValueAmount || 0),
                    placeholder: "请输入陪跑量",
                }));
                const __VLS_22 = __VLS_21({
                    ...{ 'onChange': {} },
                    modelValue: (record.amount),
                    min: (0),
                    max: (record.sceneValueAmount || 0),
                    placeholder: "请输入陪跑量",
                }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                let __VLS_24;
                let __VLS_25;
                let __VLS_26;
                const __VLS_27 = {
                    onChange: (...[$event]) => {
                        if (!(__VLS_ctx.selectedCreditProducts.length > 0))
                            return;
                        __VLS_ctx.updateAmount(record, record.sceneValue);
                    }
                };
                var __VLS_23;
            }
            {
                const { recommendedAmount: __VLS_thisSlot } = __VLS_19.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (__VLS_ctx.calculateRecommendedAmount(record));
            }
            {
                const { weeklyRatio: __VLS_thisSlot } = __VLS_19.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (__VLS_ctx.calculateWeeklyRatio(record));
            }
            {
                const { submissionRatio: __VLS_thisSlot } = __VLS_19.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (__VLS_ctx.calculateSubmissionRatio(record));
            }
            {
                const { totalRatio: __VLS_thisSlot } = __VLS_19.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                (__VLS_ctx.calculateRatio(record.amount, dataProduct.totalAmount));
            }
            var __VLS_19;
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-footer" },
});
const __VLS_28 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    size: "large",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.handlePrev)
};
__VLS_35.slots.default;
var __VLS_35;
const __VLS_40 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (__VLS_ctx.handleNext)
};
__VLS_43.slots.default;
var __VLS_43;
var __VLS_31;
/** @type {__VLS_StyleScopedClasses['credit-product-step']} */ ;
/** @type {__VLS_StyleScopedClasses['credit-product-selection']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['credit-product-select']} */ ;
/** @type {__VLS_StyleScopedClasses['auto-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['configuration-details']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['data-product-section']} */ ;
/** @type {__VLS_StyleScopedClasses['data-product-header']} */ ;
/** @type {__VLS_StyleScopedClasses['data-product-name']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-info']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-section']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-header']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-name']} */ ;
/** @type {__VLS_StyleScopedClasses['credit-product-table']} */ ;
/** @type {__VLS_StyleScopedClasses['form-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            selectedCreditProducts: selectedCreditProducts,
            creditProductOptions: creditProductOptions,
            calculateRatio: calculateRatio,
            updateAmount: updateAmount,
            handleNext: handleNext,
            handlePrev: handlePrev,
            columns: columns,
            getTableData: getTableData,
            getRowClass: getRowClass,
            calculateAssignedTotal: calculateAssignedTotal,
            calculateAllocationProgress: calculateAllocationProgress,
            handleAutoAllocation: handleAutoAllocation,
            calculateRecommendedAmount: calculateRecommendedAmount,
            calculateWeeklyRatio: calculateWeeklyRatio,
            calculateSubmissionRatio: calculateSubmissionRatio,
        };
    },
    emits: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
