const props = defineProps({
    mode: {
        type: String,
        default: 'create'
    },
    id: {
        type: String,
        default: ''
    },
    disableOperations: {
        type: Boolean,
        default: false
    }
});
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconLeft } from '@arco-design/web-vue/es/icon';
import { useRouter, useRoute } from 'vue-router';
import InterestFreeForm from './components/InterestFreeForm.vue';
import DiscountForm from './components/DiscountForm.vue';
import LockForm from './components/LockForm.vue';
const router = useRouter();
const route = useRoute();
const mode = ref(route.query.mode || 'create');
const readonly = ref(route.query.readonly === 'true');
const formRef = ref();
// 产品选项
const productOptions = [
    { label: '自营APP', value: 'SELF_APP' }
];
// 表单数据
const formData = ref({
    id: '',
    name: '',
    type: '',
    description: '',
    validityPeriodType: 'limited',
    validityPeriod: undefined,
    firstUseOnly: false,
    stackable: false,
    products: [],
    repaymentMethods: [],
    loanPeriodType: 'unlimited',
    loanPeriodMin: undefined,
    loanPeriodMax: undefined,
    loanPeriodValue: undefined,
    loanAmountMin: undefined,
    loanAmountMax: undefined,
    useChannels: [],
    creditChannels: [],
    interestFreeDays: undefined,
    maxInterestFreeAmount: undefined,
    discountType: 'uniform',
    uniformDiscount: undefined,
    frontPeriods: undefined,
    frontDiscount: undefined,
    backPeriods: undefined,
    backDiscount: undefined,
    fixedFrontPeriods: undefined,
    fixedFrontValue: undefined,
    fixedBackPeriods: undefined,
    fixedBackDiscount: undefined,
    limitMinRate: false,
    minRate: undefined
});
// 表单验证规则
const rules = {
    name: [{ required: true, message: '请输入优惠券名称' }],
    type: [{ required: true, message: '请选择优惠券类型' }],
    validityPeriodType: [{ required: true, message: '请选择有效期类型' }],
    validityPeriod: [{ required: true, message: '请选择有效期', trigger: 'change' }],
    products: [{ required: true, message: '请选择贷款产品' }],
    stackable: [{ required: true, message: '请选择是否支持叠加' }],
    repaymentMethods: [{ required: true, message: '请选择还款方式' }],
    useChannels: [{ required: true, message: '请选择使用渠道' }],
    creditChannels: [{ required: true, message: '请选择授信渠道' }],
    // 免息券参数验证
    interestFreeDays: [{
            required: true,
            message: '请输入免息天数',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 0 && value <= 1000;
            }
        }],
    maxInterestFreeAmount: [{
            required: true,
            message: '请输入最大免息金额',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 0;
            }
        }],
    // 折扣券参数验证
    discountType: [{ required: true, message: '请选择折扣类型' }],
    uniformDiscount: [{
            required: true,
            message: '请输入折扣率',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 0 && value <= 1;
            }
        }],
    frontPeriods: [{
            required: true,
            message: '请输入前期期数',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 1;
            }
        }],
    frontDiscount: [{
            required: true,
            message: '请输入前期折扣率',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 0 && value <= 1;
            }
        }],
    backPeriods: [{
            required: true,
            message: '请输入后期期数',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 1;
            }
        }],
    backDiscount: [{
            required: true,
            message: '请输入后期折扣率',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 0 && value <= 1;
            }
        }],
    fixedFrontPeriods: [{
            required: true,
            message: '请输入前期期数',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 1;
            }
        }],
    fixedFrontRate: [{
            required: true,
            message: '请输入前期固定利率',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 0 && value <= 1;
            }
        }],
    fixedBackPeriods: [{
            required: true,
            message: '请输入后期期数',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 1;
            }
        }],
    fixedBackDiscount: [{
            required: true,
            message: '请输入后期折扣率',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 0 && value <= 1;
            }
        }],
    minRate: [{
            required: true,
            message: '请输入最低利率',
            trigger: 'blur',
            validator: (value) => {
                if (value === null)
                    return true;
                return value >= 0;
            }
        }]
};
// 取消创建
const handleCancel = () => {
    router.back();
};
// 全选产品
const selectAllProducts = ref(false);
const handleSelectAllProducts = (checked) => {
    formData.value.products = checked ? productOptions.map(p => p.value) : [];
};
// 表单提交处理
const handleSubmit = async () => {
    try {
        await formRef.value.validate();
        // TODO: 调用接口提交数据
        Message.success('创建成功');
        router.push('/marketing/coupon/template');
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
// 提交并创建券
const handleSubmitAndCreate = async () => {
    try {
        await formRef.value.validate();
        // TODO: 调用接口提交数据，设置状态为已上线
        const submitData = {
            ...formData.value,
            status: 'online' // 设置状态为已上线
        };
        // TODO: 调用接口提交数据
        Message.success('创建并上线成功');
        // 跳转到库存管理页面并传递参数以触发创建库存弹窗
        router.push({
            path: '/marketing/coupon/management',
            query: {
                createCoupon: 'true',
                templateId: formData.value.id, // 传递模板ID
                templateName: formData.value.name, // 传递模板名称
                showCreateModal: 'true', // 控制创建券库存弹窗的显示
                _t: Date.now() // 添加时间戳确保每次跳转都会触发参数变化
            }
        });
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-template-create" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "form-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "form-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
(__VLS_ctx.mode === 'view' ? '优惠券模板详情' : '创建优惠券模板');
if (__VLS_ctx.mode === 'view' && !__VLS_ctx.disableOperations) {
    const __VLS_4 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        type: "outline",
        ...{ style: {} },
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        type: "outline",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.mode === 'view' && !__VLS_ctx.disableOperations))
                return;
            __VLS_ctx.router.back();
        }
    };
    __VLS_7.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_7.slots;
        const __VLS_12 = {}.IconLeft;
        /** @type {[typeof __VLS_components.IconLeft, typeof __VLS_components.iconLeft, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
    var __VLS_7;
}
const __VLS_16 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '800px' }) },
    disabled: (__VLS_ctx.mode === 'view' || __VLS_ctx.readonly),
}));
const __VLS_18 = __VLS_17({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '800px' }) },
    disabled: (__VLS_ctx.mode === 'view' || __VLS_ctx.readonly),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_20 = {};
__VLS_19.slots.default;
const __VLS_22 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    field: "name",
    label: "优惠券名称",
    required: true,
}));
const __VLS_24 = __VLS_23({
    field: "name",
    label: "优惠券名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_25.slots.default;
const __VLS_26 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入优惠券名称",
}));
const __VLS_28 = __VLS_27({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入优惠券名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
var __VLS_25;
const __VLS_30 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    field: "type",
    label: "优惠券类型",
    required: true,
}));
const __VLS_32 = __VLS_31({
    field: "type",
    label: "优惠券类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
const __VLS_34 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.formData.type),
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.formData.type),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
const __VLS_38 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    value: "interest_free",
}));
const __VLS_40 = __VLS_39({
    value: "interest_free",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
var __VLS_41;
const __VLS_42 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    value: "discount",
}));
const __VLS_44 = __VLS_43({
    value: "discount",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
__VLS_45.slots.default;
var __VLS_45;
var __VLS_37;
var __VLS_33;
if (__VLS_ctx.formData.type === 'interest_free') {
    /** @type {[typeof InterestFreeForm, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(InterestFreeForm, new InterestFreeForm({
        formData: (__VLS_ctx.formData),
    }));
    const __VLS_47 = __VLS_46({
        formData: (__VLS_ctx.formData),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
}
if (__VLS_ctx.formData.type === 'discount') {
    /** @type {[typeof DiscountForm, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(DiscountForm, new DiscountForm({
        formData: (__VLS_ctx.formData),
    }));
    const __VLS_50 = __VLS_49({
        formData: (__VLS_ctx.formData),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
const __VLS_52 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    field: "validityPeriodType",
    label: "有效期",
    required: true,
}));
const __VLS_54 = __VLS_53({
    field: "validityPeriodType",
    label: "有效期",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.formData.validityPeriodType),
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.formData.validityPeriodType),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    value: "limited",
}));
const __VLS_62 = __VLS_61({
    value: "limited",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
var __VLS_63;
const __VLS_64 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: "unlimited",
}));
const __VLS_66 = __VLS_65({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
var __VLS_67;
var __VLS_59;
if (__VLS_ctx.formData.validityPeriodType === 'limited') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_68 = {}.ARangePicker;
    /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        modelValue: (__VLS_ctx.formData.validityPeriod),
        ...{ style: {} },
    }));
    const __VLS_70 = __VLS_69({
        modelValue: (__VLS_ctx.formData.validityPeriod),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
}
var __VLS_55;
const __VLS_72 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_74 = __VLS_73({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    field: "firstUseOnly",
    label: "是否仅限首次支用",
    required: true,
}));
const __VLS_82 = __VLS_81({
    field: "firstUseOnly",
    label: "是否仅限首次支用",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.formData.firstUseOnly),
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.formData.firstUseOnly),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    value: (true),
}));
const __VLS_90 = __VLS_89({
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
var __VLS_91;
const __VLS_92 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    value: (false),
}));
const __VLS_94 = __VLS_93({
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
var __VLS_95;
var __VLS_87;
var __VLS_83;
var __VLS_79;
const __VLS_96 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    field: "stackable",
    label: "是否支持叠加",
    required: true,
}));
const __VLS_102 = __VLS_101({
    field: "stackable",
    label: "是否支持叠加",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.formData.stackable),
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.formData.stackable),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    value: (true),
}));
const __VLS_110 = __VLS_109({
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
var __VLS_111;
const __VLS_112 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    value: (false),
}));
const __VLS_114 = __VLS_113({
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
var __VLS_115;
var __VLS_107;
var __VLS_103;
var __VLS_99;
var __VLS_75;
const __VLS_116 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_118 = __VLS_117({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    field: "products",
    label: "贷款产品",
    required: true,
}));
const __VLS_126 = __VLS_125({
    field: "products",
    label: "贷款产品",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.formData.products),
    placeholder: "请选择贷款产品",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.formData.products),
    placeholder: "请选择贷款产品",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
for (const [product] of __VLS_getVForSourceType((__VLS_ctx.productOptions))) {
    const __VLS_132 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        key: (product.value),
        value: (product.value),
    }));
    const __VLS_134 = __VLS_133({
        key: (product.value),
        value: (product.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    (product.label);
    var __VLS_135;
}
var __VLS_131;
var __VLS_127;
var __VLS_123;
var __VLS_119;
const __VLS_136 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_138 = __VLS_137({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    span: (2),
}));
const __VLS_142 = __VLS_141({
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    field: "repaymentMethods",
    label: "还款方式",
    required: true,
}));
const __VLS_146 = __VLS_145({
    field: "repaymentMethods",
    label: "还款方式",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.formData.repaymentMethods),
    placeholder: "请选择还款方式",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.formData.repaymentMethods),
    placeholder: "请选择还款方式",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    value: "unlimited",
}));
const __VLS_154 = __VLS_153({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
var __VLS_155;
const __VLS_156 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    value: "equal_principal",
}));
const __VLS_158 = __VLS_157({
    value: "equal_principal",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
var __VLS_159;
const __VLS_160 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    value: "equal_installment",
}));
const __VLS_162 = __VLS_161({
    value: "equal_installment",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
var __VLS_163;
const __VLS_164 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    value: "interest_first",
}));
const __VLS_166 = __VLS_165({
    value: "interest_first",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
var __VLS_167;
const __VLS_168 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    value: "flexible",
}));
const __VLS_170 = __VLS_169({
    value: "flexible",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
var __VLS_171;
var __VLS_151;
var __VLS_147;
var __VLS_143;
var __VLS_139;
const __VLS_172 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_174 = __VLS_173({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    field: "loanPeriod",
    label: "借款期数",
    required: true,
}));
const __VLS_182 = __VLS_181({
    field: "loanPeriod",
    label: "借款期数",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.formData.loanPeriodType),
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.formData.loanPeriodType),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    value: "unlimited",
}));
const __VLS_190 = __VLS_189({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
var __VLS_191;
const __VLS_192 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    value: "gte",
}));
const __VLS_194 = __VLS_193({
    value: "gte",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
var __VLS_195;
const __VLS_196 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    value: "lte",
}));
const __VLS_198 = __VLS_197({
    value: "lte",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
var __VLS_199;
const __VLS_200 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    value: "range",
}));
const __VLS_202 = __VLS_201({
    value: "range",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
var __VLS_203;
var __VLS_187;
if (__VLS_ctx.formData.loanPeriodType !== 'unlimited') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    if (__VLS_ctx.formData.loanPeriodType === 'range') {
        const __VLS_204 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({}));
        const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
        __VLS_207.slots.default;
        const __VLS_208 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
            modelValue: (__VLS_ctx.formData.loanPeriodMin),
            min: (1),
            placeholder: "最小期数",
            ...{ style: {} },
        }));
        const __VLS_210 = __VLS_209({
            modelValue: (__VLS_ctx.formData.loanPeriodMin),
            min: (1),
            placeholder: "最小期数",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_209));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        const __VLS_212 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
            modelValue: (__VLS_ctx.formData.loanPeriodMax),
            min: (__VLS_ctx.formData.loanPeriodMin || 1),
            placeholder: "最大期数",
            ...{ style: {} },
        }));
        const __VLS_214 = __VLS_213({
            modelValue: (__VLS_ctx.formData.loanPeriodMax),
            min: (__VLS_ctx.formData.loanPeriodMin || 1),
            placeholder: "最大期数",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_213));
        var __VLS_207;
    }
    else {
        const __VLS_216 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
            modelValue: (__VLS_ctx.formData.loanPeriodValue),
            min: (1),
            placeholder: "期数",
            ...{ style: {} },
        }));
        const __VLS_218 = __VLS_217({
            modelValue: (__VLS_ctx.formData.loanPeriodValue),
            min: (1),
            placeholder: "期数",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
}
var __VLS_183;
var __VLS_179;
const __VLS_220 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({}));
const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
const __VLS_224 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    field: "loanAmount",
    label: "适用金额",
    required: true,
}));
const __VLS_226 = __VLS_225({
    field: "loanAmount",
    label: "适用金额",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
const __VLS_228 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({}));
const __VLS_230 = __VLS_229({}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
const __VLS_232 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    modelValue: (__VLS_ctx.formData.loanAmountMin),
    min: (0),
    precision: (0),
    placeholder: "最低金额",
    ...{ style: {} },
}));
const __VLS_234 = __VLS_233({
    modelValue: (__VLS_ctx.formData.loanAmountMin),
    min: (0),
    precision: (0),
    placeholder: "最低金额",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_236 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    modelValue: (__VLS_ctx.formData.loanAmountMax),
    min: (__VLS_ctx.formData.loanAmountMin || 0),
    precision: (0),
    placeholder: "最高金额",
    ...{ style: {} },
}));
const __VLS_238 = __VLS_237({
    modelValue: (__VLS_ctx.formData.loanAmountMax),
    min: (__VLS_ctx.formData.loanAmountMin || 0),
    precision: (0),
    placeholder: "最高金额",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_231;
var __VLS_227;
var __VLS_223;
var __VLS_175;
const __VLS_240 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_242 = __VLS_241({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
const __VLS_244 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({}));
const __VLS_246 = __VLS_245({}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
const __VLS_248 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    field: "useChannels",
    label: "使用渠道",
    required: true,
}));
const __VLS_250 = __VLS_249({
    field: "useChannels",
    label: "使用渠道",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    modelValue: (__VLS_ctx.formData.useChannels),
    placeholder: "请选择使用渠道",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_254 = __VLS_253({
    modelValue: (__VLS_ctx.formData.useChannels),
    placeholder: "请选择使用渠道",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    value: "unlimited",
}));
const __VLS_258 = __VLS_257({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
var __VLS_259;
const __VLS_260 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    value: "app",
}));
const __VLS_262 = __VLS_261({
    value: "app",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
var __VLS_263;
const __VLS_264 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    value: "miniprogram",
}));
const __VLS_266 = __VLS_265({
    value: "miniprogram",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
var __VLS_267;
const __VLS_268 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    value: "alipay_miniprogram",
}));
const __VLS_270 = __VLS_269({
    value: "alipay_miniprogram",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
var __VLS_271;
const __VLS_272 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    value: "h5",
}));
const __VLS_274 = __VLS_273({
    value: "h5",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
__VLS_275.slots.default;
var __VLS_275;
const __VLS_276 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    value: "web",
}));
const __VLS_278 = __VLS_277({
    value: "web",
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
var __VLS_279;
const __VLS_280 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    value: "offline",
}));
const __VLS_282 = __VLS_281({
    value: "offline",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
var __VLS_283;
var __VLS_255;
var __VLS_251;
var __VLS_247;
const __VLS_284 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({}));
const __VLS_286 = __VLS_285({}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
const __VLS_288 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    field: "creditChannels",
    label: "授信渠道",
    required: true,
}));
const __VLS_290 = __VLS_289({
    field: "creditChannels",
    label: "授信渠道",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
const __VLS_292 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    modelValue: (__VLS_ctx.formData.creditChannels),
    placeholder: "请选择授信渠道",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_294 = __VLS_293({
    modelValue: (__VLS_ctx.formData.creditChannels),
    placeholder: "请选择授信渠道",
    multiple: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
__VLS_295.slots.default;
const __VLS_296 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    value: "unlimited",
}));
const __VLS_298 = __VLS_297({
    value: "unlimited",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
var __VLS_299;
const __VLS_300 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    value: "app",
}));
const __VLS_302 = __VLS_301({
    value: "app",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
var __VLS_303;
const __VLS_304 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    value: "miniprogram",
}));
const __VLS_306 = __VLS_305({
    value: "miniprogram",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
var __VLS_307;
const __VLS_308 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    value: "alipay_miniprogram",
}));
const __VLS_310 = __VLS_309({
    value: "alipay_miniprogram",
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
__VLS_311.slots.default;
var __VLS_311;
const __VLS_312 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    value: "h5",
}));
const __VLS_314 = __VLS_313({
    value: "h5",
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
var __VLS_315;
const __VLS_316 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    value: "web",
}));
const __VLS_318 = __VLS_317({
    value: "web",
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
var __VLS_319;
const __VLS_320 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
    value: "offline",
}));
const __VLS_322 = __VLS_321({
    value: "offline",
}, ...__VLS_functionalComponentArgsRest(__VLS_321));
__VLS_323.slots.default;
var __VLS_323;
const __VLS_324 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    value: "third_party",
}));
const __VLS_326 = __VLS_325({
    value: "third_party",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
var __VLS_327;
var __VLS_295;
var __VLS_291;
var __VLS_287;
var __VLS_243;
/** @type {[typeof InterestFreeForm, ]} */ ;
// @ts-ignore
const __VLS_328 = __VLS_asFunctionalComponent(InterestFreeForm, new InterestFreeForm({
    formData: (__VLS_ctx.formData),
}));
const __VLS_329 = __VLS_328({
    formData: (__VLS_ctx.formData),
}, ...__VLS_functionalComponentArgsRest(__VLS_328));
/** @type {[typeof DiscountForm, ]} */ ;
// @ts-ignore
const __VLS_331 = __VLS_asFunctionalComponent(DiscountForm, new DiscountForm({
    formData: (__VLS_ctx.formData),
}));
const __VLS_332 = __VLS_331({
    formData: (__VLS_ctx.formData),
}, ...__VLS_functionalComponentArgsRest(__VLS_331));
/** @type {[typeof LockForm, ]} */ ;
// @ts-ignore
const __VLS_334 = __VLS_asFunctionalComponent(LockForm, new LockForm({
    formData: (__VLS_ctx.formData),
}));
const __VLS_335 = __VLS_334({
    formData: (__VLS_ctx.formData),
}, ...__VLS_functionalComponentArgsRest(__VLS_334));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-actions" },
});
const __VLS_337 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({}));
const __VLS_339 = __VLS_338({}, ...__VLS_functionalComponentArgsRest(__VLS_338));
__VLS_340.slots.default;
const __VLS_341 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
    ...{ 'onClick': {} },
}));
const __VLS_343 = __VLS_342({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_342));
let __VLS_345;
let __VLS_346;
let __VLS_347;
const __VLS_348 = {
    onClick: (__VLS_ctx.handleCancel)
};
__VLS_344.slots.default;
var __VLS_344;
const __VLS_349 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_351 = __VLS_350({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_350));
let __VLS_353;
let __VLS_354;
let __VLS_355;
const __VLS_356 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_352.slots.default;
var __VLS_352;
const __VLS_357 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({
    ...{ 'onClick': {} },
    type: "primary",
    status: "success",
}));
const __VLS_359 = __VLS_358({
    ...{ 'onClick': {} },
    type: "primary",
    status: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_358));
let __VLS_361;
let __VLS_362;
let __VLS_363;
const __VLS_364 = {
    onClick: (__VLS_ctx.handleSubmitAndCreate)
};
__VLS_360.slots.default;
var __VLS_360;
var __VLS_340;
var __VLS_19;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['coupon-template-create']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-actions']} */ ;
// @ts-ignore
var __VLS_21 = __VLS_20;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconLeft: IconLeft,
            InterestFreeForm: InterestFreeForm,
            DiscountForm: DiscountForm,
            LockForm: LockForm,
            router: router,
            mode: mode,
            readonly: readonly,
            formRef: formRef,
            productOptions: productOptions,
            formData: formData,
            rules: rules,
            handleCancel: handleCancel,
            handleSubmit: handleSubmit,
            handleSubmitAndCreate: handleSubmitAndCreate,
        };
    },
    props: {
        mode: {
            type: String,
            default: 'create'
        },
        id: {
            type: String,
            default: ''
        },
        disableOperations: {
            type: Boolean,
            default: false
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        mode: {
            type: String,
            default: 'create'
        },
        id: {
            type: String,
            default: ''
        },
        disableOperations: {
            type: Boolean,
            default: false
        }
    },
});
; /* PartiallyEnd: #4569/main.vue */
