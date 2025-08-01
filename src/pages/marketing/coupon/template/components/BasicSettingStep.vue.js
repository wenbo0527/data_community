/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import AdmissionForm from './AdmissionForm.vue';
import InterestFreeForm from './InterestFreeForm.vue';
import DiscountForm from './DiscountForm.vue';
import LockForm from './LockForm.vue';
const router = useRouter();
const emit = defineEmits(['next', 'cancel']);
// 表单引用
const formRef = ref(null);
// 产品选项数据
const productOptions = [
    { label: '个人消费贷款', value: 'PERSONAL_LOAN' },
    { label: '小微经营贷款', value: 'BUSINESS_LOAN' },
    { label: '房屋抵押贷款', value: 'MORTGAGE_LOAN' },
    { label: '汽车消费贷款', value: 'CAR_LOAN' },
    { label: '信用卡分期', value: 'CREDIT_CARD_INSTALLMENT' },
    { label: '教育助学贷款', value: 'EDUCATION_LOAN' },
];
// Props
const props = defineProps({
    formData: {
        type: Object,
        required: true
    }
});
// 表单验证规则
const rules = {
    products: [{ required: true, message: '请选择贷款产品' }],
    repaymentMethods: [{ required: true, message: '请选择还款方式' }],
    loanAmountMin: [{ required: true, message: '请输入最低金额' }],
    loanAmountMax: [{ required: true, message: '请输入最高金额' }],
    useChannels: [{ required: true, message: '请选择使用渠道' }],
    creditChannels: [{ required: true, message: '请选择授信渠道' }],
    interestFreeDays: [{ required: true, message: '请输入免息天数' }],
    maxInterestFreeAmount: [{ required: true, message: '请输入最大免息金额' }],
    uniformDiscount: [{
            required: true,
            message: '请输入折扣率',
            validator: (value) => props.formData.discountType !== 'uniform' || value !== null
        }],
    frontPeriods: [{
            required: true,
            message: '请输入前期期数',
            validator: (value) => props.formData.discountType !== 'different' || value !== null
        }],
    frontDiscount: [{
            required: true,
            message: '请输入前期折扣率',
            validator: (value) => props.formData.discountType !== 'different' || value !== null
        }],
    backPeriods: [{
            required: true,
            message: '请输入后期期数',
            validator: (value) => props.formData.discountType !== 'different' || value !== null
        }],
    backDiscount: [{
            required: true,
            message: '请输入后期折扣率',
            validator: (value) => props.formData.discountType !== 'different' || value !== null
        }],
    fixedFrontPeriods: [{
            required: true,
            message: '请输入前期期数',
            validator: (value) => props.formData.discountType !== 'fixed' || value !== null
        }],
    fixedFrontValue: [{
            required: true,
            message: '请输入前期固定值',
            validator: (value) => props.formData.discountType !== 'fixed' || value !== null
        }]
};
// 表单提交处理
const handleNext = async () => {
    try {
        await formRef.value.validate();
        emit('next');
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
// 取消处理
const handleCancel = () => {
    emit('cancel');
    router.back();
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basic-setting-step" },
});
const __VLS_0 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '800px' }) },
}));
const __VLS_2 = __VLS_1({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '800px' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
/** @type {[typeof AdmissionForm, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(AdmissionForm, new AdmissionForm({
    formData: (__VLS_ctx.formData),
}));
const __VLS_7 = __VLS_6({
    formData: (__VLS_ctx.formData),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
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
    field: "firstUseOnly",
    label: "是否仅限首次支用",
    required: true,
}));
const __VLS_19 = __VLS_18({
    field: "firstUseOnly",
    label: "是否仅限首次支用",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    modelValue: (__VLS_ctx.formData.firstUseOnly),
}));
const __VLS_23 = __VLS_22({
    modelValue: (__VLS_ctx.formData.firstUseOnly),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
const __VLS_25 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    value: (true),
}));
const __VLS_27 = __VLS_26({
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
var __VLS_28;
const __VLS_29 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    value: (false),
}));
const __VLS_31 = __VLS_30({
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_32.slots.default;
var __VLS_32;
var __VLS_24;
var __VLS_20;
var __VLS_16;
const __VLS_33 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
const __VLS_37 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    field: "products",
    label: "贷款产品",
    required: true,
}));
const __VLS_39 = __VLS_38({
    field: "products",
    label: "贷款产品",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
const __VLS_41 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    modelValue: (__VLS_ctx.formData.products),
    placeholder: "请选择贷款产品",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_43 = __VLS_42({
    modelValue: (__VLS_ctx.formData.products),
    placeholder: "请选择贷款产品",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
for (const [product] of __VLS_getVForSourceType((__VLS_ctx.productOptions))) {
    const __VLS_45 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        key: (product.value),
        value: (product.value),
    }));
    const __VLS_47 = __VLS_46({
        key: (product.value),
        value: (product.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    (product.label);
    var __VLS_48;
}
var __VLS_44;
var __VLS_40;
var __VLS_36;
var __VLS_12;
const __VLS_49 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_51 = __VLS_50({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
const __VLS_53 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    span: "2",
}));
const __VLS_55 = __VLS_54({
    span: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
const __VLS_57 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    field: "repaymentMethods",
    label: "还款方式",
    required: true,
}));
const __VLS_59 = __VLS_58({
    field: "repaymentMethods",
    label: "还款方式",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
const __VLS_61 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    modelValue: (__VLS_ctx.formData.repaymentMethods),
    placeholder: "请选择还款方式",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_63 = __VLS_62({
    modelValue: (__VLS_ctx.formData.repaymentMethods),
    placeholder: "请选择还款方式",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
const __VLS_65 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    value: "unlimited",
}));
const __VLS_67 = __VLS_66({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
var __VLS_68;
const __VLS_69 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    value: "equal_principal",
}));
const __VLS_71 = __VLS_70({
    value: "equal_principal",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
var __VLS_72;
const __VLS_73 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    value: "equal_installment",
}));
const __VLS_75 = __VLS_74({
    value: "equal_installment",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
var __VLS_76;
const __VLS_77 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    value: "interest_first",
}));
const __VLS_79 = __VLS_78({
    value: "interest_first",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
var __VLS_80;
const __VLS_81 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    value: "one_time",
}));
const __VLS_83 = __VLS_82({
    value: "one_time",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
var __VLS_84;
const __VLS_85 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    value: "flexible",
}));
const __VLS_87 = __VLS_86({
    value: "flexible",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
var __VLS_88;
var __VLS_64;
var __VLS_60;
var __VLS_56;
var __VLS_52;
const __VLS_89 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_91 = __VLS_90({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
const __VLS_93 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
const __VLS_97 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    field: "loanPeriod",
    label: "借款期数",
    required: true,
}));
const __VLS_99 = __VLS_98({
    field: "loanPeriod",
    label: "借款期数",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
const __VLS_101 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    modelValue: (__VLS_ctx.formData.loanPeriodType),
}));
const __VLS_103 = __VLS_102({
    modelValue: (__VLS_ctx.formData.loanPeriodType),
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
__VLS_104.slots.default;
const __VLS_105 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    value: "unlimited",
}));
const __VLS_107 = __VLS_106({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_108.slots.default;
var __VLS_108;
const __VLS_109 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    value: "gte",
}));
const __VLS_111 = __VLS_110({
    value: "gte",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
__VLS_112.slots.default;
var __VLS_112;
const __VLS_113 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    value: "lte",
}));
const __VLS_115 = __VLS_114({
    value: "lte",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
__VLS_116.slots.default;
var __VLS_116;
const __VLS_117 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    value: "range",
}));
const __VLS_119 = __VLS_118({
    value: "range",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
__VLS_120.slots.default;
var __VLS_120;
var __VLS_104;
if (__VLS_ctx.formData.loanPeriodType !== 'unlimited') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    if (__VLS_ctx.formData.loanPeriodType === 'range') {
        const __VLS_121 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({}));
        const __VLS_123 = __VLS_122({}, ...__VLS_functionalComponentArgsRest(__VLS_122));
        __VLS_124.slots.default;
        const __VLS_125 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
            modelValue: (__VLS_ctx.formData.loanPeriodMin),
            min: (1),
            placeholder: "最小期数",
            ...{ style: {} },
        }));
        const __VLS_127 = __VLS_126({
            modelValue: (__VLS_ctx.formData.loanPeriodMin),
            min: (1),
            placeholder: "最小期数",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        const __VLS_129 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
            modelValue: (__VLS_ctx.formData.loanPeriodMax),
            min: (__VLS_ctx.formData.loanPeriodMin || 1),
            placeholder: "最大期数",
            ...{ style: {} },
        }));
        const __VLS_131 = __VLS_130({
            modelValue: (__VLS_ctx.formData.loanPeriodMax),
            min: (__VLS_ctx.formData.loanPeriodMin || 1),
            placeholder: "最大期数",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_130));
        var __VLS_124;
    }
    else {
        const __VLS_133 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
            modelValue: (__VLS_ctx.formData.loanPeriodValue),
            min: (1),
            placeholder: "期数",
            ...{ style: {} },
        }));
        const __VLS_135 = __VLS_134({
            modelValue: (__VLS_ctx.formData.loanPeriodValue),
            min: (1),
            placeholder: "期数",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
}
var __VLS_100;
var __VLS_96;
const __VLS_137 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({}));
const __VLS_139 = __VLS_138({}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
const __VLS_141 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    field: "loanAmount",
    label: "适用金额",
    required: true,
}));
const __VLS_143 = __VLS_142({
    field: "loanAmount",
    label: "适用金额",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_144.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_145 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({}));
const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
const __VLS_149 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    modelValue: (__VLS_ctx.formData.loanAmountMin),
    min: (0),
    precision: (0),
    placeholder: "最低金额",
    ...{ style: {} },
}));
const __VLS_151 = __VLS_150({
    modelValue: (__VLS_ctx.formData.loanAmountMin),
    min: (0),
    precision: (0),
    placeholder: "最低金额",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_153 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    modelValue: (__VLS_ctx.formData.loanAmountMax),
    min: (__VLS_ctx.formData.loanAmountMin || 0),
    precision: (0),
    placeholder: "最高金额",
    ...{ style: {} },
}));
const __VLS_155 = __VLS_154({
    modelValue: (__VLS_ctx.formData.loanAmountMax),
    min: (__VLS_ctx.formData.loanAmountMin || 0),
    precision: (0),
    placeholder: "最高金额",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_148;
var __VLS_144;
var __VLS_140;
var __VLS_92;
const __VLS_157 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_159 = __VLS_158({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
__VLS_160.slots.default;
const __VLS_161 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({}));
const __VLS_163 = __VLS_162({}, ...__VLS_functionalComponentArgsRest(__VLS_162));
__VLS_164.slots.default;
const __VLS_165 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
    field: "useChannels",
    label: "使用渠道",
    required: true,
}));
const __VLS_167 = __VLS_166({
    field: "useChannels",
    label: "使用渠道",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
__VLS_168.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_168.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_169 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
    modelValue: (__VLS_ctx.formData.useChannels),
    placeholder: "请选择使用渠道",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_171 = __VLS_170({
    modelValue: (__VLS_ctx.formData.useChannels),
    placeholder: "请选择使用渠道",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
__VLS_172.slots.default;
const __VLS_173 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    value: "unlimited",
}));
const __VLS_175 = __VLS_174({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
var __VLS_176;
const __VLS_177 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    value: "app",
}));
const __VLS_179 = __VLS_178({
    value: "app",
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_180.slots.default;
var __VLS_180;
const __VLS_181 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
    value: "miniprogram",
}));
const __VLS_183 = __VLS_182({
    value: "miniprogram",
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
__VLS_184.slots.default;
var __VLS_184;
const __VLS_185 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
    value: "alipay_miniprogram",
}));
const __VLS_187 = __VLS_186({
    value: "alipay_miniprogram",
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_188.slots.default;
var __VLS_188;
const __VLS_189 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    value: "h5",
}));
const __VLS_191 = __VLS_190({
    value: "h5",
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
__VLS_192.slots.default;
var __VLS_192;
const __VLS_193 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
    value: "web",
}));
const __VLS_195 = __VLS_194({
    value: "web",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
__VLS_196.slots.default;
var __VLS_196;
const __VLS_197 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
    value: "offline",
}));
const __VLS_199 = __VLS_198({
    value: "offline",
}, ...__VLS_functionalComponentArgsRest(__VLS_198));
__VLS_200.slots.default;
var __VLS_200;
var __VLS_172;
var __VLS_168;
var __VLS_164;
const __VLS_201 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({}));
const __VLS_203 = __VLS_202({}, ...__VLS_functionalComponentArgsRest(__VLS_202));
__VLS_204.slots.default;
const __VLS_205 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    field: "creditChannels",
    label: "授信渠道",
    required: true,
}));
const __VLS_207 = __VLS_206({
    field: "creditChannels",
    label: "授信渠道",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
__VLS_208.slots.default;
{
    const { help: __VLS_thisSlot } = __VLS_208.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-text" },
    });
}
const __VLS_209 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    modelValue: (__VLS_ctx.formData.creditChannels),
    placeholder: "请选择授信渠道",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_211 = __VLS_210({
    modelValue: (__VLS_ctx.formData.creditChannels),
    placeholder: "请选择授信渠道",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
__VLS_212.slots.default;
const __VLS_213 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    value: "unlimited",
}));
const __VLS_215 = __VLS_214({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
__VLS_216.slots.default;
var __VLS_216;
const __VLS_217 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
    value: "app",
}));
const __VLS_219 = __VLS_218({
    value: "app",
}, ...__VLS_functionalComponentArgsRest(__VLS_218));
__VLS_220.slots.default;
var __VLS_220;
const __VLS_221 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
    value: "miniprogram",
}));
const __VLS_223 = __VLS_222({
    value: "miniprogram",
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
__VLS_224.slots.default;
var __VLS_224;
const __VLS_225 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
    value: "alipay_miniprogram",
}));
const __VLS_227 = __VLS_226({
    value: "alipay_miniprogram",
}, ...__VLS_functionalComponentArgsRest(__VLS_226));
__VLS_228.slots.default;
var __VLS_228;
const __VLS_229 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    value: "h5",
}));
const __VLS_231 = __VLS_230({
    value: "h5",
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
__VLS_232.slots.default;
var __VLS_232;
const __VLS_233 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
    value: "web",
}));
const __VLS_235 = __VLS_234({
    value: "web",
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
__VLS_236.slots.default;
var __VLS_236;
const __VLS_237 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
    value: "offline",
}));
const __VLS_239 = __VLS_238({
    value: "offline",
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
__VLS_240.slots.default;
var __VLS_240;
const __VLS_241 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
    value: "third_party",
}));
const __VLS_243 = __VLS_242({
    value: "third_party",
}, ...__VLS_functionalComponentArgsRest(__VLS_242));
__VLS_244.slots.default;
var __VLS_244;
var __VLS_212;
var __VLS_208;
var __VLS_204;
var __VLS_160;
/** @type {[typeof InterestFreeForm, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(InterestFreeForm, new InterestFreeForm({
    formData: (__VLS_ctx.formData),
}));
const __VLS_246 = __VLS_245({
    formData: (__VLS_ctx.formData),
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
/** @type {[typeof DiscountForm, ]} */ ;
// @ts-ignore
const __VLS_248 = __VLS_asFunctionalComponent(DiscountForm, new DiscountForm({
    formData: (__VLS_ctx.formData),
}));
const __VLS_249 = __VLS_248({
    formData: (__VLS_ctx.formData),
}, ...__VLS_functionalComponentArgsRest(__VLS_248));
/** @type {[typeof LockForm, ]} */ ;
// @ts-ignore
const __VLS_251 = __VLS_asFunctionalComponent(LockForm, new LockForm({
    formData: (__VLS_ctx.formData),
}));
const __VLS_252 = __VLS_251({
    formData: (__VLS_ctx.formData),
}, ...__VLS_functionalComponentArgsRest(__VLS_251));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-actions" },
});
const __VLS_254 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({}));
const __VLS_256 = __VLS_255({}, ...__VLS_functionalComponentArgsRest(__VLS_255));
__VLS_257.slots.default;
const __VLS_258 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
    ...{ 'onClick': {} },
}));
const __VLS_260 = __VLS_259({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_259));
let __VLS_262;
let __VLS_263;
let __VLS_264;
const __VLS_265 = {
    onClick: (__VLS_ctx.handleCancel)
};
__VLS_261.slots.default;
var __VLS_261;
const __VLS_266 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_268 = __VLS_267({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
let __VLS_270;
let __VLS_271;
let __VLS_272;
const __VLS_273 = {
    onClick: (__VLS_ctx.handleNext)
};
__VLS_269.slots.default;
var __VLS_269;
var __VLS_257;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['basic-setting-step']} */ ;
/** @type {__VLS_StyleScopedClasses['help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-actions']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            $emit: emit,
            AdmissionForm: AdmissionForm,
            InterestFreeForm: InterestFreeForm,
            DiscountForm: DiscountForm,
            LockForm: LockForm,
            formRef: formRef,
            productOptions: productOptions,
            rules: rules,
            handleNext: handleNext,
            handleCancel: handleCancel,
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
