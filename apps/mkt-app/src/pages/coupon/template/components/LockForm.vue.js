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
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "section-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "section-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {};
__VLS_3.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "title-text" },
    });
    const __VLS_5 = {}.ATooltip;
    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ 
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
    let __VLS_8;
}
const __VLS_9 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    field: "hasLockPeriod",
    label: "是否设定锁定期限",
}));
const __VLS_11 = __VLS_10({
    field: "hasLockPeriod",
    label: "是否设定锁定期限",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    modelValue: (__VLS_ctx.formData.hasLockPeriod),
}));
const __VLS_15 = __VLS_14({
    modelValue: (__VLS_ctx.formData.hasLockPeriod),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    value: (true),
}));
const __VLS_19 = __VLS_18({
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
let __VLS_20;
const __VLS_21 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    value: (false),
}));
const __VLS_23 = __VLS_22({
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
let __VLS_24;
let __VLS_16;
let __VLS_12;
if (__VLS_ctx.formData.hasLockPeriod) {
    const __VLS_25 = {}.AGrid;
    /** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ 
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        cols: (2),
        colGap: (16),
        rowGap: (16),
    }));
    const __VLS_27 = __VLS_26({
        cols: (2),
        colGap: (16),
        rowGap: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    const __VLS_29 = {}.AGridItem;
    /** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({}));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    const __VLS_33 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        field: "lockPeriodType",
        label: "锁定期限类型",
    }));
    const __VLS_35 = __VLS_34({
        field: "lockPeriodType",
        label: "锁定期限类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    const __VLS_37 = {}.ARadioGroup;
    /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        modelValue: (__VLS_ctx.formData.lockPeriodType),
    }));
    const __VLS_39 = __VLS_38({
        modelValue: (__VLS_ctx.formData.lockPeriodType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    const __VLS_41 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        value: "period",
    }));
    const __VLS_43 = __VLS_42({
        value: "period",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    let __VLS_44;
    const __VLS_45 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        value: "day",
    }));
    const __VLS_47 = __VLS_46({
        value: "day",
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    let __VLS_48;
    let __VLS_40;
    let __VLS_36;
    let __VLS_32;
    const __VLS_49 = {}.AGridItem;
    /** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({}));
    const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    const __VLS_53 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        field: "lockPeriodValue",
        label: "锁定期限值",
    }));
    const __VLS_55 = __VLS_54({
        field: "lockPeriodValue",
        label: "锁定期限值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_56.slots.default;
    const __VLS_57 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        modelValue: (__VLS_ctx.formData.lockPeriodValue),
        min: (1),
        precision: (0),
        placeholder: "请输入锁定期限",
        ...{ style: {} },
    }));
    const __VLS_59 = __VLS_58({
        modelValue: (__VLS_ctx.formData.lockPeriodValue),
        min: (1),
        precision: (0),
        placeholder: "请输入锁定期限",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.formData.lockPeriodType === 'period' ? '期' : '天');
    let __VLS_56;
    let __VLS_52;
    const __VLS_61 = {}.AGridItem;
    /** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ 
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        span: "2",
    }));
    const __VLS_63 = __VLS_62({
        span: "2",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_64.slots.default;
    const __VLS_65 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        field: "lockLimitType",
        label: "限定方式",
    }));
    const __VLS_67 = __VLS_66({
        field: "lockLimitType",
        label: "限定方式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    const __VLS_69 = {}.ARadioGroup;
    /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        modelValue: (__VLS_ctx.formData.lockLimitType),
    }));
    const __VLS_71 = __VLS_70({
        modelValue: (__VLS_ctx.formData.lockLimitType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    const __VLS_73 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        value: "repayment",
    }));
    const __VLS_75 = __VLS_74({
        value: "repayment",
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_76.slots.default;
    let __VLS_76;
    const __VLS_77 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        value: "charge",
    }));
    const __VLS_79 = __VLS_78({
        value: "charge",
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    __VLS_80.slots.default;
    let __VLS_80;
    let __VLS_72;
    let __VLS_68;
    let __VLS_64;
    let __VLS_28;
}
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['section-card']} */ 
/** @type {__VLS_StyleScopedClasses['section-title']} */ 
/** @type {__VLS_StyleScopedClasses['title-text']} */ 
/** @type {__VLS_StyleScopedClasses['title-help']} */ 
let __VLS_dollars;
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
 /* PartiallyEnd: #4569/main.vue */
