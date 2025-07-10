/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
const props = defineProps();
const emit = defineEmits(['next', 'prev']);
const selectedScenes = ref([]);
const sceneOptions = [
    { label: '授信申请', value: 'credit_apply' },
    { label: '授信通过', value: 'credit_pass' },
    { label: '支用申请', value: 'loan_apply' },
    { label: '支用通过', value: 'loan_pass' }
];
const conditionFields = [
    { label: '条件', value: 'condition' }
];
const amountConditionOptions = [
    { label: '等于', value: 'eq' },
    { label: '大于', value: 'gt' },
    { label: '小于', value: 'lt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于等于', value: 'lte' },
    { label: '区间', value: 'range' }
];
const periodConditionOptions = [
    { label: '等于', value: 'eq' },
    { label: '大于', value: 'gt' },
    { label: '小于', value: 'lt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于等于', value: 'lte' },
    { label: '区间', value: 'range' }
];
const riskLevelOptions = [
    { label: '低风险', value: 'low' },
    { label: '中风险', value: 'medium' },
    { label: '高风险', value: 'high' }
];
const columns = [
    { title: '场景', slotName: 'scene', width: 150 },
    { title: '分配条数', slotName: 'amount', width: 150 },
    { title: '分配比例', slotName: 'ratio', width: 150 },
    { title: '条件', slotName: 'amountCondition', width: 300 }
];
const getProductSceneData = (product) => {
    return selectedScenes.value.map(sceneValue => {
        const sceneName = sceneOptions.find(option => option.value === sceneValue)?.label || '';
        const existingScene = product.scenes?.find((s) => s.sceneValue === sceneValue);
        return {
            sceneValue,
            sceneName,
            amount: Number(existingScene?.amount || 0),
            selectedField: 'amount',
            amountCondition: existingScene?.amountCondition || '',
            amountValue: Number(existingScene?.amountValue || 0),
            minAmount: Number(existingScene?.minAmount || 0),
            maxAmount: existingScene?.maxAmount || null,
            creditProducts: []
        };
    });
};
const updateAmount = (record, product) => {
    if (record.amount > product.totalAmount) {
        record.amount = product.totalAmount;
    }
    // 更新产品的场景数据
    if (!product.scenes) {
        product.scenes = [];
    }
    const existingSceneIndex = product.scenes.findIndex((s) => s.sceneValue === record.sceneValue);
    const updatedRecord = {
        ...record,
        ratio: calculateRatio(record.amount, product.totalAmount)
    };
    if (existingSceneIndex >= 0) {
        product.scenes[existingSceneIndex] = updatedRecord;
    }
    else {
        product.scenes.push(updatedRecord);
    }
};
const calculateRatio = (amount, total) => {
    if (!total)
        return 0;
    // 使用toFixed控制精度，并转换为数值类型
    return Number((amount / total * 100).toFixed(2));
};
const calculateProgress = (product) => {
    if (!product.totalAmount)
        return 0;
    const totalAllocated = (product.scenes || []).reduce((sum, scene) => {
        // 直接使用整数计算，避免浮点数精度问题
        const sceneAmount = Math.round(Number(scene.amount || 0));
        return sum + sceneAmount;
    }, 0);
    // 使用整数计算百分比，最后再处理小数位
    return Math.min(Number((totalAllocated * 100 / product.totalAmount).toFixed(2)), 100);
};
const validateSceneAllocation = () => {
    // 检查是否选择了场景
    if (selectedScenes.value.length === 0) {
        Message.error('请至少选择一个场景进行数据分配');
        return false;
    }
    // 检查每个数据产品的场景分配是否完成
    return props.formData.dataProducts.every(product => {
        // 检查是否存在场景数据
        if (!product.scenes?.length) {
            Message.error(`请为数据产品「${product.name}」分配场景数据`);
            return false;
        }
        // 检查是否所有选择的场景都已分配数据
        const unallocatedScenes = selectedScenes.value.filter(sceneValue => {
            return !product.scenes?.some((scene) => scene.sceneValue === sceneValue && Number(scene.amount) > 0);
        });
        if (unallocatedScenes.length > 0) {
            const sceneNames = unallocatedScenes
                .map(sceneValue => sceneOptions.find(option => option.value === sceneValue)?.label)
                .filter(Boolean)
                .join('、');
            Message.error(`数据产品「${product.name}」的「${sceneNames}」场景尚未分配数据`);
            return false;
        }
        // 检查分配总量是否正确
        const totalAllocated = product.scenes.reduce((sum, scene) => {
            return sum + Math.round(Number(scene.amount || 0));
        }, 0);
        if (totalAllocated !== product.totalAmount) {
            const difference = Math.abs(totalAllocated - product.totalAmount);
            Message.error(`数据产品「${product.name}」的场景分配总量(${totalAllocated})与产品总量(${product.totalAmount})不一致，` +
                `还需分配${difference}条数据`);
            return false;
        }
        return true;
    });
};
const handleNext = () => {
    if (!validateSceneAllocation()) {
        // 使用Arco Design的Message组件显示错误提示
        Message.error('请确保所有数据产品的场景分配完成且总量正确');
        return;
    }
    // 添加校验通过日志
    console.log('场景步骤校验通过，触发下一步');
    emit('next');
};
const handlePrev = () => {
    emit('prev');
};
const getAmountPlaceholder = (condition) => {
    const placeholders = {
        gt: '大于金额',
        lt: '小于金额',
        gte: '大于等于金额',
        lte: '小于等于金额'
    };
    return placeholders[condition] || '请输入金额';
};
const updateAmountCondition = (value, record, product) => {
    if (!product.scenes) {
        product.scenes = [];
    }
    const existingSceneIndex = product.scenes.findIndex((s) => s.sceneValue === record.sceneValue);
    if (existingSceneIndex >= 0) {
        product.scenes[existingSceneIndex].amountCondition = value;
    }
    else {
        product.scenes.push({
            ...record,
            amountCondition: value
        });
    }
};
const updateSelectedCondition = (value, record, product) => {
    if (!product.scenes) {
        product.scenes = [];
    }
    const existingSceneIndex = product.scenes.findIndex((s) => s.sceneValue === record.sceneValue);
    if (existingSceneIndex >= 0) {
        product.scenes[existingSceneIndex].selectedCondition = value;
    }
    else {
        product.scenes.push({
            ...record,
            selectedCondition: value
        });
    }
};
const updateAmountValue = (record, product) => {
    // 确保数值有效
    if (record.amountValue < 0) {
        record.amountValue = 0;
    }
    updateSceneData(record, product);
};
const updateAmountRange = (record, product) => {
    // 确保最小额度不为负
    if (record.minAmount < 0) {
        record.minAmount = 0;
    }
    // 确保最大额度不小于最小额度
    if (record.maxAmount && record.maxAmount < record.minAmount) {
        record.maxAmount = record.minAmount;
    }
    updateSceneData(record, product);
};
const updateSceneData = (record, product) => {
    if (!product.scenes) {
        product.scenes = [];
    }
    const existingSceneIndex = product.scenes.findIndex((s) => s.sceneValue === record.sceneValue);
    if (existingSceneIndex >= 0) {
        const updatedScene = {
            ...product.scenes[existingSceneIndex],
            amountCondition: String(record.amountCondition),
            amountValue: String(record.amountValue),
            minAmount: String(record.minAmount),
            maxAmount: record.maxAmount ? String(record.maxAmount) : null
        };
        product.scenes[existingSceneIndex] = updatedScene;
    }
    else {
        product.scenes.push({
            sceneValue: String(record.sceneValue),
            sceneName: String(record.sceneName),
            amount: String(record.amount),
            amountCondition: String(record.amountCondition),
            amountValue: String(record.amountValue),
            minAmount: String(record.minAmount),
            maxAmount: record.maxAmount ? String(record.maxAmount) : null
        });
    }
};
// 添加场景数据更新监听
watch(() => props.formData.dataProducts, () => {
    console.log('场景数据更新:', JSON.parse(JSON.stringify(props.formData.dataProducts)));
}, { deep: true, immediate: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['value-input']} */ ;
/** @type {__VLS_StyleScopedClasses['value-input']} */ ;
/** @type {__VLS_StyleScopedClasses['amount-range-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['allocation-progress']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scene-step" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scene-selection" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
const __VLS_0 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.selectedScenes),
    multiple: true,
    placeholder: "请选择场景",
    ...{ class: "scene-select" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.selectedScenes),
    multiple: true,
    placeholder: "请选择场景",
    ...{ class: "scene-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
for (const [scene] of __VLS_getVForSourceType((__VLS_ctx.sceneOptions))) {
    const __VLS_4 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        key: (scene.value),
        value: (scene.value),
    }));
    const __VLS_6 = __VLS_5({
        key: (scene.value),
        value: (scene.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    (scene.label);
    var __VLS_7;
}
var __VLS_3;
for (const [product, productIndex] of __VLS_getVForSourceType((__VLS_ctx.formData.dataProducts))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (productIndex),
        ...{ class: "product-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "product-title" },
    });
    (product.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "product-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-value" },
    });
    (product.totalAmount);
    const __VLS_8 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        data: (__VLS_ctx.getProductSceneData(product)),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        ...{ class: "scene-table" },
    }));
    const __VLS_10 = __VLS_9({
        data: (__VLS_ctx.getProductSceneData(product)),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        ...{ class: "scene-table" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    {
        const { scene: __VLS_thisSlot } = __VLS_11.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (record.sceneName);
    }
    {
        const { amount: __VLS_thisSlot } = __VLS_11.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_12 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ 'onChange': {} },
            modelValue: (record.amount),
            min: (0),
            max: (product.totalAmount),
            precision: (0),
            placeholder: "请输入分配条数",
            ...{ class: "amount-input" },
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onChange': {} },
            modelValue: (record.amount),
            min: (0),
            max: (product.totalAmount),
            precision: (0),
            placeholder: "请输入分配条数",
            ...{ class: "amount-input" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_16;
        let __VLS_17;
        let __VLS_18;
        const __VLS_19 = {
            onChange: (...[$event]) => {
                __VLS_ctx.updateAmount(record, product);
            }
        };
        var __VLS_15;
    }
    {
        const { ratio: __VLS_thisSlot } = __VLS_11.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.calculateRatio(record.amount, product.totalAmount));
    }
    {
        const { amountCondition: __VLS_thisSlot } = __VLS_11.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-selects" },
        });
        const __VLS_20 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            modelValue: (record.selectedCondition),
            placeholder: "选择条件",
            ...{ class: "condition-type-select" },
            ...{ style: {} },
        }));
        const __VLS_22 = __VLS_21({
            modelValue: (record.selectedCondition),
            placeholder: "选择条件",
            ...{ class: "condition-type-select" },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        const __VLS_24 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            value: "amount",
        }));
        const __VLS_26 = __VLS_25({
            value: "amount",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        var __VLS_27;
        const __VLS_28 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            value: "period",
        }));
        const __VLS_30 = __VLS_29({
            value: "period",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        var __VLS_31;
        const __VLS_32 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            value: "riskLevel",
        }));
        const __VLS_34 = __VLS_33({
            value: "riskLevel",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        var __VLS_35;
        var __VLS_23;
        const __VLS_36 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ 'onChange': {} },
            modelValue: (record.amountCondition),
            placeholder: "选择关系",
            ...{ class: "condition-select" },
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onChange': {} },
            modelValue: (record.amountCondition),
            placeholder: "选择关系",
            ...{ class: "condition-select" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_40;
        let __VLS_41;
        let __VLS_42;
        const __VLS_43 = {
            onChange: ((value) => __VLS_ctx.updateAmountCondition(value, record, product))
        };
        __VLS_39.slots.default;
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.amountConditionOptions))) {
            const __VLS_44 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                key: (option.value),
                value: (option.value),
            }));
            const __VLS_46 = __VLS_45({
                key: (option.value),
                value: (option.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
            __VLS_47.slots.default;
            (option.label);
            var __VLS_47;
        }
        var __VLS_39;
        if (record.amountCondition) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "value-input" },
            });
            if (record.amountCondition === 'range') {
                const __VLS_48 = {}.AInput;
                /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                // @ts-ignore
                const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                    ...{ 'onChange': {} },
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (record.minAmount),
                    placeholder: "最小值",
                    ...{ class: "condition-input" },
                }));
                const __VLS_50 = __VLS_49({
                    ...{ 'onChange': {} },
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (record.minAmount),
                    placeholder: "最小值",
                    ...{ class: "condition-input" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_49));
                let __VLS_52;
                let __VLS_53;
                let __VLS_54;
                const __VLS_55 = {
                    onChange: (...[$event]) => {
                        if (!(record.amountCondition))
                            return;
                        if (!(record.amountCondition === 'range'))
                            return;
                        __VLS_ctx.updateAmountRange(record, product);
                    }
                };
                const __VLS_56 = {
                    'onUpdate:modelValue': ((val) => record.minAmount = Number(val))
                };
                var __VLS_51;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "separator" },
                });
                const __VLS_57 = {}.AInput;
                /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                // @ts-ignore
                const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
                    ...{ 'onChange': {} },
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (record.maxAmount),
                    placeholder: "最大值",
                    ...{ class: "condition-input" },
                }));
                const __VLS_59 = __VLS_58({
                    ...{ 'onChange': {} },
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (record.maxAmount),
                    placeholder: "最大值",
                    ...{ class: "condition-input" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_58));
                let __VLS_61;
                let __VLS_62;
                let __VLS_63;
                const __VLS_64 = {
                    onChange: (...[$event]) => {
                        if (!(record.amountCondition))
                            return;
                        if (!(record.amountCondition === 'range'))
                            return;
                        __VLS_ctx.updateAmountRange(record, product);
                    }
                };
                const __VLS_65 = {
                    'onUpdate:modelValue': ((val) => record.maxAmount = val ? Number(val) : null)
                };
                var __VLS_60;
            }
            else {
                const __VLS_66 = {}.AInput;
                /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
                // @ts-ignore
                const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
                    ...{ 'onChange': {} },
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (record.amountValue),
                    placeholder: (__VLS_ctx.getAmountPlaceholder(record.amountCondition)),
                    ...{ class: "condition-input" },
                }));
                const __VLS_68 = __VLS_67({
                    ...{ 'onChange': {} },
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (record.amountValue),
                    placeholder: (__VLS_ctx.getAmountPlaceholder(record.amountCondition)),
                    ...{ class: "condition-input" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_67));
                let __VLS_70;
                let __VLS_71;
                let __VLS_72;
                const __VLS_73 = {
                    onChange: (...[$event]) => {
                        if (!(record.amountCondition))
                            return;
                        if (!!(record.amountCondition === 'range'))
                            return;
                        __VLS_ctx.updateAmountValue(record, product);
                    }
                };
                const __VLS_74 = {
                    'onUpdate:modelValue': ((val) => record.amountValue = Number(val))
                };
                var __VLS_69;
            }
        }
    }
    var __VLS_11;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "allocation-progress" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "progress-text" },
    });
    (__VLS_ctx.calculateProgress(product));
    const __VLS_75 = {}.AProgress;
    /** @type {[typeof __VLS_components.AProgress, typeof __VLS_components.aProgress, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        percent: (__VLS_ctx.calculateProgress(product)),
        showText: (false),
        size: "small",
    }));
    const __VLS_77 = __VLS_76({
        percent: (__VLS_ctx.calculateProgress(product)),
        showText: (false),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-footer" },
});
const __VLS_79 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({}));
const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
__VLS_82.slots.default;
const __VLS_83 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
    ...{ 'onClick': {} },
    size: "large",
}));
const __VLS_85 = __VLS_84({
    ...{ 'onClick': {} },
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
let __VLS_87;
let __VLS_88;
let __VLS_89;
const __VLS_90 = {
    onClick: (__VLS_ctx.handlePrev)
};
__VLS_86.slots.default;
var __VLS_86;
const __VLS_91 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}));
const __VLS_93 = __VLS_92({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
let __VLS_95;
let __VLS_96;
let __VLS_97;
const __VLS_98 = {
    onClick: (__VLS_ctx.handleNext)
};
__VLS_94.slots.default;
var __VLS_94;
var __VLS_82;
/** @type {__VLS_StyleScopedClasses['scene-step']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-selection']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-select']} */ ;
/** @type {__VLS_StyleScopedClasses['product-section']} */ ;
/** @type {__VLS_StyleScopedClasses['product-title']} */ ;
/** @type {__VLS_StyleScopedClasses['product-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-table']} */ ;
/** @type {__VLS_StyleScopedClasses['amount-input']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-selects']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-type-select']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-select']} */ ;
/** @type {__VLS_StyleScopedClasses['value-input']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-input']} */ ;
/** @type {__VLS_StyleScopedClasses['separator']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-input']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-input']} */ ;
/** @type {__VLS_StyleScopedClasses['allocation-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-text']} */ ;
/** @type {__VLS_StyleScopedClasses['form-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            selectedScenes: selectedScenes,
            sceneOptions: sceneOptions,
            amountConditionOptions: amountConditionOptions,
            columns: columns,
            getProductSceneData: getProductSceneData,
            updateAmount: updateAmount,
            calculateRatio: calculateRatio,
            calculateProgress: calculateProgress,
            handleNext: handleNext,
            handlePrev: handlePrev,
            getAmountPlaceholder: getAmountPlaceholder,
            updateAmountCondition: updateAmountCondition,
            updateAmountValue: updateAmountValue,
            updateAmountRange: updateAmountRange,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
