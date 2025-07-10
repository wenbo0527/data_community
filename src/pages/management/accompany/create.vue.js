/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import BasicInfoStep from '@/components/steps/BasicInfoStep.vue';
import DataProductStep from '@/components/steps/DataProductStep.vue';
import SceneStep from '@/components/steps/SceneStep.vue';
import CreditProductStep from '@/components/steps/CreditProductStep.vue';
import SuccessStep from '@/components/steps/SuccessStep.vue';
// Step configuration
const steps = [
    { key: 'basic', title: '基本信息', component: BasicInfoStep },
    { key: 'product', title: '数据产品', component: DataProductStep },
    { key: 'scene', title: '场景选择', component: SceneStep },
    { key: 'credit', title: '信贷产品', component: CreditProductStep },
    { key: 'success', title: '完成', component: SuccessStep }
];
const currentStep = ref(0);
const formData = ref({
    workId: '',
    basic: {
        name: '',
        cacheTime: '30',
        days: 0,
        periods: 0,
        description: '',
        periodDays: [30]
    },
    creditProducts: [],
    dataProducts: []
});
// Computed properties
const currentComponent = computed(() => {
    const component = steps[currentStep.value].component;
    console.log(`当前步骤: ${steps[currentStep.value].key}, 组件: ${component.name}`);
    return component;
});
const currentStepProps = computed(() => {
    const baseProps = {
        formData: formData.value,
        step: currentStep.value
    };
    if (steps[currentStep.value].key === 'product') {
        return {
            ...baseProps,
            modelValue: {
                products: formData.value.dataProducts,
                periodDays: formData.value.basic.periodDays || []
            },
            'onUpdate:modelValue': (value) => {
                formData.value.dataProducts = value.products;
                formData.value.basic.periodDays = value.periodDays;
            }
        };
    }
    if (steps[currentStep.value].key === 'basic') {
        return {
            ...baseProps,
            modelValue: formData.value.basic,
            'onUpdate:modelValue': (value) => {
                formData.value.basic = value;
            }
        };
    }
    console.log(`基础步骤props:`, baseProps);
    return baseProps;
});
// Navigation methods
const goToNextStep = () => {
    console.log('当前步骤:', steps[currentStep.value].key);
    if (validateCurrentStep()) {
        console.log('校验通过，跳转到下一步');
        currentStep.value++;
    }
    else {
        console.warn('步骤校验未通过');
    }
};
const goToPreviousStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};
// Validation methods
const validateCurrentStep = () => {
    const validators = {
        basic: validateBasicInfo,
        product: validateDataProducts,
        scene: validateScenes,
        credit: validateCreditProducts
    };
    const currentValidator = validators[steps[currentStep.value].key];
    return currentValidator ? currentValidator() : true;
};
const validateBasicInfo = () => {
    const { name, days, periods } = formData.value.basic;
    return !!(name && days && periods);
};
const validateDataProducts = () => {
    return formData.value.dataProducts.every(product => product.name && product.totalAmount);
};
const validateScenes = () => {
    if (!formData.value.dataProducts.length) {
        Message.error('请先添加数据产品');
        return false;
    }
    return formData.value.dataProducts.every(product => {
        if (!product.scenes?.length) {
            Message.error(`数据产品「${product.name}」未配置场景数据`);
            return false;
        }
        const totalAllocated = product.scenes.reduce((sum, scene) => {
            return sum + Math.round(Number(scene.amount || 0));
        }, 0);
        if (totalAllocated !== product.totalAmount) {
            const difference = Math.abs(totalAllocated - product.totalAmount);
            Message.error(`数据产品「${product.name}」场景分配总量(${totalAllocated})与产品总量(${product.totalAmount})不一致，还需分配${difference}条数据`);
            return false;
        }
        return true;
    });
};
const validateCreditProducts = () => {
    if (!formData.value.creditProducts?.length) {
        Message.error('请选择至少一个信贷产品');
        return false;
    }
    const hasValidAllocation = formData.value.dataProducts.every(product => {
        const scenes = product.scenes || [];
        return scenes.every(scene => {
            const creditProducts = scene.creditProducts || [];
            const totalAllocated = creditProducts.reduce((sum, cp) => sum + (cp.amount || 0), 0);
            if (totalAllocated !== scene.amount) {
                Message.error(`数据产品「${product.name}」的场景「${scene.sceneName}」信贷产品分配总量不正确`);
                return false;
            }
            return true;
        });
    });
    return hasValidAllocation;
};
const onProductSelect = (product) => {
    // Handle product selection
};
const onSceneChange = (scenes) => {
    // Handle scene changes
};
const onAmountChange = (amount) => {
    // Handle amount changes
};
const onSubmitForm = async () => {
    // Handle form submission
};
const __VLS_exposed = {
    currentStep,
    steps,
    formData,
    goToNextStep,
    goToPreviousStep,
    currentComponent,
    currentStepProps
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['steps-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-steps-item-title']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
const __VLS_0 = {}.ASteps;
/** @type {[typeof __VLS_components.ASteps, typeof __VLS_components.aSteps, typeof __VLS_components.ASteps, typeof __VLS_components.aSteps, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    current: (__VLS_ctx.currentStep),
    ...{ class: "steps-nav" },
}));
const __VLS_2 = __VLS_1({
    current: (__VLS_ctx.currentStep),
    ...{ class: "steps-nav" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
for (const [step] of __VLS_getVForSourceType((__VLS_ctx.steps))) {
    const __VLS_4 = {}.AStep;
    /** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        key: (step.key),
        title: (step.title),
    }));
    const __VLS_6 = __VLS_5({
        key: (step.key),
        title: (step.title),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-content" },
});
const __VLS_8 = ((__VLS_ctx.currentComponent));
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onNext': {} },
    ...{ 'onPrev': {} },
    ...(__VLS_ctx.currentStepProps),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onNext': {} },
    ...{ 'onPrev': {} },
    ...(__VLS_ctx.currentStepProps),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onNext: (__VLS_ctx.goToNextStep)
};
const __VLS_16 = {
    onPrev: (__VLS_ctx.goToPreviousStep)
};
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            steps: steps,
            currentStep: currentStep,
            currentComponent: currentComponent,
            currentStepProps: currentStepProps,
            goToNextStep: goToNextStep,
            goToPreviousStep: goToPreviousStep,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
