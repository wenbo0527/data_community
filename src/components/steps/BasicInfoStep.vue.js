import { withDefaults } from 'vue';
const props = withDefaults(defineProps(), {
    modelValue: () => ({
        name: '',
        cacheTime: '30',
        days: 0,
        periods: 0,
        description: '',
        periodDays: [30]
    }),
    step: 0
});
const emit = defineEmits();
const handlePeriodsChange = (value) => {
    // 初始化期数天数数组
    props.modelValue.periodDays = new Array(value).fill(0);
    emit('update:modelValue', props.modelValue);
};
const handleNext = () => {
    emit('next');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    modelValue: () => ({
        name: '',
        cacheTime: '30',
        days: 0,
        periods: 0,
        description: '',
        periodDays: [30]
    }),
    step: 0
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-footer']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    model: (__VLS_ctx.modelValue),
    layout: "vertical",
    ...{ class: "basic-info-form" },
}));
const __VLS_2 = __VLS_1({
    model: (__VLS_ctx.modelValue),
    layout: "vertical",
    ...{ class: "basic-info-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    gutter: (24),
}));
const __VLS_7 = __VLS_6({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    span: (6),
}));
const __VLS_11 = __VLS_10({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    label: "计划名称",
    field: "name",
    rules: ([{ required: true, message: '请输入计划名称' }]),
}));
const __VLS_15 = __VLS_14({
    label: "计划名称",
    field: "name",
    rules: ([{ required: true, message: '请输入计划名称' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    modelValue: (__VLS_ctx.modelValue.name),
    placeholder: "请输入计划名称",
    showWordLimit: true,
    maxLength: (100),
    allowClear: true,
    ...{ class: "custom-input" },
}));
const __VLS_19 = __VLS_18({
    modelValue: (__VLS_ctx.modelValue.name),
    placeholder: "请输入计划名称",
    showWordLimit: true,
    maxLength: (100),
    allowClear: true,
    ...{ class: "custom-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
var __VLS_16;
var __VLS_12;
const __VLS_21 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    span: (6),
}));
const __VLS_23 = __VLS_22({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
const __VLS_25 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    label: "缓存时间",
    field: "cacheTime",
    rules: ([{ required: true, message: '请选择缓存时间' }]),
}));
const __VLS_27 = __VLS_26({
    label: "缓存时间",
    field: "cacheTime",
    rules: ([{ required: true, message: '请选择缓存时间' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
const __VLS_29 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    modelValue: (__VLS_ctx.modelValue.cacheTime),
    placeholder: "请选择缓存时间",
    ...{ class: "custom-select" },
}));
const __VLS_31 = __VLS_30({
    modelValue: (__VLS_ctx.modelValue.cacheTime),
    placeholder: "请选择缓存时间",
    ...{ class: "custom-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_32.slots.default;
const __VLS_33 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    value: "0",
}));
const __VLS_35 = __VLS_34({
    value: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
var __VLS_36;
for (const [i] of __VLS_getVForSourceType((30))) {
    const __VLS_37 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        value: (i),
    }));
    const __VLS_39 = __VLS_38({
        value: (i),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    (i);
    var __VLS_40;
}
var __VLS_32;
var __VLS_28;
var __VLS_24;
const __VLS_41 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    span: (6),
}));
const __VLS_43 = __VLS_42({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
const __VLS_45 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    label: "陪跑天数",
    field: "days",
    rules: ([{ required: true, message: '请输入陪跑天数' }, { type: 'number', min: 1, max: 365, message: '天数范围为1-365天' }]),
}));
const __VLS_47 = __VLS_46({
    label: "陪跑天数",
    field: "days",
    rules: ([{ required: true, message: '请输入陪跑天数' }, { type: 'number', min: 1, max: 365, message: '天数范围为1-365天' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
const __VLS_49 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    modelValue: (__VLS_ctx.modelValue.days),
    placeholder: "请输入陪跑天数",
    min: (1),
    max: (365),
    ...{ class: "custom-input-number" },
}));
const __VLS_51 = __VLS_50({
    modelValue: (__VLS_ctx.modelValue.days),
    placeholder: "请输入陪跑天数",
    min: (1),
    max: (365),
    ...{ class: "custom-input-number" },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
var __VLS_48;
var __VLS_44;
const __VLS_53 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    span: (6),
}));
const __VLS_55 = __VLS_54({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
const __VLS_57 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    label: "陪跑期数",
    field: "periods",
    rules: ([{ required: true, message: '请选择陪跑期数' }]),
}));
const __VLS_59 = __VLS_58({
    label: "陪跑期数",
    field: "periods",
    rules: ([{ required: true, message: '请选择陪跑期数' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
const __VLS_61 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.modelValue.periods),
    placeholder: "请选择陪跑期数",
    ...{ class: "custom-select" },
}));
const __VLS_63 = __VLS_62({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.modelValue.periods),
    placeholder: "请选择陪跑期数",
    ...{ class: "custom-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
let __VLS_65;
let __VLS_66;
let __VLS_67;
const __VLS_68 = {
    onChange: (__VLS_ctx.handlePeriodsChange)
};
__VLS_64.slots.default;
for (const [i] of __VLS_getVForSourceType((10))) {
    const __VLS_69 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        value: (i),
    }));
    const __VLS_71 = __VLS_70({
        value: (i),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    (i);
    var __VLS_72;
}
var __VLS_64;
var __VLS_60;
var __VLS_56;
var __VLS_8;
const __VLS_73 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    gutter: (24),
}));
const __VLS_75 = __VLS_74({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
const __VLS_77 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    span: (24),
}));
const __VLS_79 = __VLS_78({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
const __VLS_81 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    label: "备注",
    field: "description",
}));
const __VLS_83 = __VLS_82({
    label: "备注",
    field: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
const __VLS_85 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    modelValue: (__VLS_ctx.modelValue.description),
    placeholder: "请输入备注",
    maxLength: (1000),
    showWordLimit: true,
    allowClear: true,
    ...{ class: "custom-textarea" },
}));
const __VLS_87 = __VLS_86({
    modelValue: (__VLS_ctx.modelValue.description),
    placeholder: "请输入备注",
    maxLength: (1000),
    showWordLimit: true,
    allowClear: true,
    ...{ class: "custom-textarea" },
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
var __VLS_84;
var __VLS_80;
var __VLS_76;
const __VLS_89 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    ...{ class: "custom-divider" },
}));
const __VLS_91 = __VLS_90({
    ...{ class: "custom-divider" },
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
var __VLS_92;
const __VLS_93 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    gutter: ([24, 16]),
}));
const __VLS_95 = __VLS_94({
    gutter: ([24, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
for (const [i] of __VLS_getVForSourceType((__VLS_ctx.modelValue.periods))) {
    const __VLS_97 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
        span: (6),
    }));
    const __VLS_99 = __VLS_98({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    __VLS_100.slots.default;
    const __VLS_101 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        label: (`第${i}期天数`),
        field: (`periodDays.${i - 1}`),
        rules: ([{ required: true, message: '请输入天数' }, { type: 'number', min: 1, max: 365, message: '天数范围为1-365天' }]),
    }));
    const __VLS_103 = __VLS_102({
        label: (`第${i}期天数`),
        field: (`periodDays.${i - 1}`),
        rules: ([{ required: true, message: '请输入天数' }, { type: 'number', min: 1, max: 365, message: '天数范围为1-365天' }]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    __VLS_104.slots.default;
    const __VLS_105 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        modelValue: (__VLS_ctx.modelValue.periodDays[i - 1]),
        placeholder: "请输入天数",
        min: (1),
        max: (365),
        ...{ class: "custom-input-number" },
    }));
    const __VLS_107 = __VLS_106({
        modelValue: (__VLS_ctx.modelValue.periodDays[i - 1]),
        placeholder: "请输入天数",
        min: (1),
        max: (365),
        ...{ class: "custom-input-number" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    var __VLS_104;
    var __VLS_100;
}
var __VLS_96;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-footer" },
});
const __VLS_109 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}));
const __VLS_111 = __VLS_110({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_113;
let __VLS_114;
let __VLS_115;
const __VLS_116 = {
    onClick: (__VLS_ctx.handleNext)
};
__VLS_112.slots.default;
var __VLS_112;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['basic-info-form']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input-number']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-select']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-input-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            handlePeriodsChange: handlePeriodsChange,
            handleNext: handleNext,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
