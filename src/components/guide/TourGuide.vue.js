/// <reference types="../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, computed, watch, nextTick } from 'vue';
import { Message } from '@arco-design/web-vue';
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    steps: {
        type: Array,
        default: () => []
    }
});
const emit = defineEmits(['update:visible', 'finish']);
// 当前步骤索引
const currentStepIndex = ref(0);
// 当前步骤信息
const currentStep = computed(() => props.steps[currentStepIndex.value]);
// 是否为最后一步
const isLastStep = computed(() => currentStepIndex.value === props.steps.length - 1);
// 高亮区域样式
const highlightStyle = computed(() => {
    if (!currentStep.value || !currentStep.value.element)
        return {};
    const element = document.querySelector(currentStep.value.element);
    if (!element)
        return {};
    const rect = element.getBoundingClientRect();
    return {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
    };
});
// 引导卡片位置样式
const cardStyle = computed(() => {
    if (!currentStep.value || !currentStep.value.element)
        return {};
    const element = document.querySelector(currentStep.value.element);
    if (!element)
        return {};
    const rect = element.getBoundingClientRect();
    const position = currentStep.value.position || 'bottom';
    const baseStyle = {
        position: 'fixed',
        transform: 'translate(-50%, 0)'
    };
    switch (position) {
        case 'top':
            return {
                ...baseStyle,
                left: `${rect.left + rect.width / 2}px`,
                top: `${rect.top - 10}px`,
                transform: 'translate(-50%, -100%)'
            };
        case 'bottom':
            return {
                ...baseStyle,
                left: `${rect.left + rect.width / 2}px`,
                top: `${rect.bottom + 10}px`
            };
        case 'left':
            return {
                ...baseStyle,
                left: `${rect.left - 10}px`,
                top: `${rect.top + rect.height / 2}px`,
                transform: 'translate(-100%, -50%)'
            };
        case 'right':
            return {
                ...baseStyle,
                left: `${rect.right + 10}px`,
                top: `${rect.top + rect.height / 2}px`,
                transform: 'translate(0, -50%)'
            };
        default:
            return baseStyle;
    }
});
// 监听visible变化
watch(() => props.visible, async (newVal) => {
    if (newVal) {
        currentStepIndex.value = 0;
        await nextTick();
        updateHighlight();
    }
});
// 更新高亮区域
const updateHighlight = () => {
    if (!currentStep.value || !currentStep.value.element)
        return;
    const element = document.querySelector(currentStep.value.element);
    if (!element) {
        console.warn(`Element ${currentStep.value.element} not found`);
        return;
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
// 处理遮罩层点击
const handleMaskClick = (e) => {
    // 防止点击高亮区域时关闭引导
    if (e.target.classList.contains('highlight-area'))
        return;
    // 点击遮罩层时关闭引导
    emit('update:visible', false);
};
// 上一步
const prevStep = () => {
    if (currentStepIndex.value > 0) {
        currentStepIndex.value--;
        nextTick(updateHighlight);
    }
};
// 下一步
const nextStep = () => {
    if (currentStepIndex.value < props.steps.length - 1) {
        currentStepIndex.value++;
        nextTick(updateHighlight);
    }
    else {
        // 完成引导
        emit('update:visible', false);
        emit('finish');
        Message.success('引导完成！');
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.visible) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tour-guide-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.handleMaskClick) },
        ...{ class: "tour-mask" },
    });
    if (__VLS_ctx.currentStep && __VLS_ctx.currentStep.element) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "highlight-area" },
            ...{ style: (__VLS_ctx.highlightStyle) },
        });
    }
    if (__VLS_ctx.currentStep) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "guide-card" },
            ...{ style: (__VLS_ctx.cardStyle) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "guide-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "guide-title" },
        });
        (__VLS_ctx.currentStep.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "guide-description" },
        });
        (__VLS_ctx.currentStep.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "guide-actions" },
        });
        const __VLS_0 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
        const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_3.slots.default;
        if (__VLS_ctx.currentStepIndex > 0) {
            const __VLS_4 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
                ...{ 'onClick': {} },
            }));
            const __VLS_6 = __VLS_5({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_5));
            let __VLS_8;
            let __VLS_9;
            let __VLS_10;
            const __VLS_11 = {
                onClick: (__VLS_ctx.prevStep)
            };
            __VLS_7.slots.default;
            var __VLS_7;
        }
        const __VLS_12 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_16;
        let __VLS_17;
        let __VLS_18;
        const __VLS_19 = {
            onClick: (__VLS_ctx.nextStep)
        };
        __VLS_15.slots.default;
        (__VLS_ctx.isLastStep ? '完成' : '下一步');
        var __VLS_15;
        var __VLS_3;
    }
}
/** @type {__VLS_StyleScopedClasses['tour-guide-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tour-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-area']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-card']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-content']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-title']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-description']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            $emit: emit,
            currentStepIndex: currentStepIndex,
            currentStep: currentStep,
            isLastStep: isLastStep,
            highlightStyle: highlightStyle,
            cardStyle: cardStyle,
            handleMaskClick: handleMaskClick,
            prevStep: prevStep,
            nextStep: nextStep,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            $emit: emit,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
