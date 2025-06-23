/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { defineProps } from 'vue';
const props = defineProps({
    formData: {
        type: Object,
        required: true
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
if (__VLS_ctx.formData.type === 'interest_free') {
    const __VLS_0 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ class: "section-card" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "section-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_4 = {};
    __VLS_3.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_3.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title-icon interest-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "title-text" },
        });
        const __VLS_5 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
            position: "right",
        }));
        const __VLS_7 = __VLS_6({
            position: "right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        __VLS_8.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "title-help" },
        });
        {
            const { content: __VLS_thisSlot } = __VLS_8.slots;
        }
        var __VLS_8;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-desc" },
    });
    const __VLS_9 = {}.AGrid;
    /** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        cols: (2),
        colGap: (16),
        rowGap: (16),
    }));
    const __VLS_11 = __VLS_10({
        cols: (2),
        colGap: (16),
        rowGap: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    const __VLS_13 = {}.AGridItem;
    /** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
    const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_16.slots.default;
    const __VLS_17 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        field: "interestFreeDays",
        label: "免息天数",
        required: true,
    }));
    const __VLS_19 = __VLS_18({
        field: "interestFreeDays",
        label: "免息天数",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    const __VLS_21 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        modelValue: (__VLS_ctx.formData.interestFreeDays),
        min: (0),
        max: (1000),
        precision: (0),
        placeholder: "请输入免息天数",
        ...{ style: {} },
    }));
    const __VLS_23 = __VLS_22({
        modelValue: (__VLS_ctx.formData.interestFreeDays),
        min: (0),
        max: (1000),
        precision: (0),
        placeholder: "请输入免息天数",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    var __VLS_20;
    var __VLS_16;
    const __VLS_25 = {}.AGridItem;
    /** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
    const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    const __VLS_29 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        field: "maxInterestFreeAmount",
        label: "最大免息金额",
        required: true,
    }));
    const __VLS_31 = __VLS_30({
        field: "maxInterestFreeAmount",
        label: "最大免息金额",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    const __VLS_33 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        modelValue: (__VLS_ctx.formData.maxInterestFreeAmount),
        min: (0),
        precision: (2),
        placeholder: "请输入最大免息金额",
        ...{ style: {} },
    }));
    const __VLS_35 = __VLS_34({
        modelValue: (__VLS_ctx.formData.maxInterestFreeAmount),
        min: (0),
        precision: (2),
        placeholder: "请输入最大免息金额",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    var __VLS_32;
    var __VLS_28;
    var __VLS_12;
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['interest-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['title-text']} */ ;
/** @type {__VLS_StyleScopedClasses['title-help']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
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
