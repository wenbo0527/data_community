/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { defineProps } from 'vue';
const props = defineProps({
    formData: {
        type: Object,
        required: true
    }
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
if (__VLS_ctx.formData.type === 'discount') {
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
            ...{ class: "title-icon discount-icon" },
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
    const __VLS_9 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        field: "discountType",
        label: "每期折扣",
        required: true,
    }));
    const __VLS_11 = __VLS_10({
        field: "discountType",
        label: "每期折扣",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    const __VLS_13 = {}.ARadioGroup;
    /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        modelValue: (__VLS_ctx.formData.discountType),
    }));
    const __VLS_15 = __VLS_14({
        modelValue: (__VLS_ctx.formData.discountType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_16.slots.default;
    const __VLS_17 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        value: "uniform",
    }));
    const __VLS_19 = __VLS_18({
        value: "uniform",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    var __VLS_20;
    const __VLS_21 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        value: "different",
    }));
    const __VLS_23 = __VLS_22({
        value: "different",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    var __VLS_24;
    const __VLS_25 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        value: "fixed",
    }));
    const __VLS_27 = __VLS_26({
        value: "fixed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    var __VLS_28;
    var __VLS_16;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    if (__VLS_ctx.formData.discountType === 'uniform') {
        const __VLS_29 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
            modelValue: (__VLS_ctx.formData.uniformDiscount),
            min: (0),
            max: (1),
            precision: (2),
            placeholder: "请输入折扣率",
            ...{ style: {} },
        }));
        const __VLS_31 = __VLS_30({
            modelValue: (__VLS_ctx.formData.uniformDiscount),
            min: (0),
            max: (1),
            precision: (2),
            placeholder: "请输入折扣率",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    }
    if (__VLS_ctx.formData.discountType === 'different') {
        const __VLS_33 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
        const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
        __VLS_36.slots.default;
        const __VLS_37 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
            modelValue: (__VLS_ctx.formData.frontPeriods),
            min: (1),
            precision: (0),
            ...{ style: {} },
        }));
        const __VLS_39 = __VLS_38({
            modelValue: (__VLS_ctx.formData.frontPeriods),
            min: (1),
            precision: (0),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        const __VLS_41 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
            modelValue: (__VLS_ctx.formData.frontDiscount),
            min: (0),
            max: (1),
            precision: (2),
            ...{ style: {} },
        }));
        const __VLS_43 = __VLS_42({
            modelValue: (__VLS_ctx.formData.frontDiscount),
            min: (0),
            max: (1),
            precision: (2),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        var __VLS_36;
    }
    if (__VLS_ctx.formData.discountType === 'fixed') {
        const __VLS_45 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({}));
        const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
        __VLS_48.slots.default;
        const __VLS_49 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
            modelValue: (__VLS_ctx.formData.fixedBackPeriods),
            min: (1),
            precision: (0),
            ...{ style: {} },
        }));
        const __VLS_51 = __VLS_50({
            modelValue: (__VLS_ctx.formData.fixedBackPeriods),
            min: (1),
            precision: (0),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        const __VLS_53 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            modelValue: (__VLS_ctx.formData.fixedBackDiscount),
            min: (0),
            max: (1),
            precision: (2),
            ...{ style: {} },
        }));
        const __VLS_55 = __VLS_54({
            modelValue: (__VLS_ctx.formData.fixedBackDiscount),
            min: (0),
            max: (1),
            precision: (2),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        var __VLS_48;
    }
    var __VLS_12;
    const __VLS_57 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        field: "limitMinRate",
        label: "是否限制最低利率",
        required: true,
    }));
    const __VLS_59 = __VLS_58({
        field: "limitMinRate",
        label: "是否限制最低利率",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    const __VLS_61 = {}.ARadioGroup;
    /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        modelValue: (__VLS_ctx.formData.limitMinRate),
    }));
    const __VLS_63 = __VLS_62({
        modelValue: (__VLS_ctx.formData.limitMinRate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_64.slots.default;
    const __VLS_65 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        value: (true),
    }));
    const __VLS_67 = __VLS_66({
        value: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    var __VLS_68;
    const __VLS_69 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        value: (false),
    }));
    const __VLS_71 = __VLS_70({
        value: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    var __VLS_72;
    var __VLS_64;
    var __VLS_60;
    if (__VLS_ctx.formData.limitMinRate) {
        const __VLS_73 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            field: "minRate",
            label: "最低利率",
            required: true,
        }));
        const __VLS_75 = __VLS_74({
            field: "minRate",
            label: "最低利率",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        __VLS_76.slots.default;
        const __VLS_77 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
            modelValue: (__VLS_ctx.formData.minRate),
            min: (0),
            precision: (4),
            placeholder: "请输入最低利率",
            ...{ style: {} },
        }));
        const __VLS_79 = __VLS_78({
            modelValue: (__VLS_ctx.formData.minRate),
            min: (0),
            precision: (4),
            placeholder: "请输入最低利率",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        var __VLS_76;
    }
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['discount-icon']} */ ;
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
