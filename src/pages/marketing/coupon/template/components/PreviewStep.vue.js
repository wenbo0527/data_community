/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const emit = defineEmits(['prev']);
const props = defineProps({
    formData: {
        type: Object,
        required: true
    }
});
// 预览数据
const previewData = computed(() => {
    const data = [
        {
            label: '准入参数',
            value: [
                { label: '首次支用限制', value: props.formData.firstUseOnly ? '是' : '否' },
                { label: '贷款产品', value: props.formData.products.join('、') || '未选择' },
                { label: '还款方式', value: props.formData.repaymentMethods.join('、') || '未选择' },
                {
                    label: '借款期数',
                    value: formatLoanPeriod(props.formData)
                },
                {
                    label: '适用金额',
                    value: `${props.formData.loanAmountMin || 0} - ${props.formData.loanAmountMax || 0}元`
                },
                { label: '使用渠道', value: props.formData.useChannels.join('、') || '未选择' },
                { label: '授信渠道', value: props.formData.creditChannels.join('、') || '未选择' }
            ]
        },
        {
            label: '免息优惠',
            value: [
                { label: '免息天数', value: `${props.formData.interestFreeDays || 0}天` },
                { label: '最大免息金额', value: `${props.formData.maxInterestFreeAmount || 0}元` }
            ]
        },
        {
            label: '折扣优惠',
            value: formatDiscountInfo(props.formData)
        },
        {
            label: '锁定规则',
            value: formatLockInfo(props.formData)
        }
    ];
    return data;
});
// 格式化借款期数显示
const formatLoanPeriod = (data) => {
    if (data.loanPeriodType === 'unlimited')
        return '不限';
    if (data.loanPeriodType === 'gte')
        return `≥${data.loanPeriodValue}期`;
    if (data.loanPeriodType === 'lte')
        return `≤${data.loanPeriodValue}期`;
    if (data.loanPeriodType === 'range') {
        return `${data.loanPeriodMin || 0} - ${data.loanPeriodMax || 0}期`;
    }
    return '未设置';
};
// 格式化折扣信息显示
const formatDiscountInfo = (data) => {
    const info = [];
    if (data.discountType === 'uniform') {
        info.push({ label: '统一折扣', value: `${data.uniformDiscount || 0}%` });
    }
    else if (data.discountType === 'different') {
        info.push({ label: '前期期数', value: `${data.frontPeriods || 0}期` }, { label: '前期折扣', value: `${data.frontDiscount || 0}%` }, { label: '后期期数', value: `${data.backPeriods || 0}期` }, { label: '后期折扣', value: `${data.backDiscount || 0}%` });
    }
    else if (data.discountType === 'fixed') {
        info.push({ label: '前期期数', value: `${data.fixedFrontPeriods || 0}期` }, { label: '前期固定值', value: `${data.fixedFrontValue || 0}元` }, { label: '后期期数', value: `${data.fixedBackPeriods || 0}期` }, { label: '后期折扣', value: `${data.fixedBackDiscount || 0}%` });
    }
    if (data.limitMinRate) {
        info.push({ label: '最低利率', value: `${data.minRate || 0}%` });
    }
    return info;
};
// 格式化锁定规则显示
const formatLockInfo = (data) => {
    if (!data.hasLockPeriod)
        return [{ label: '是否锁定', value: '否' }];
    return [
        { label: '是否锁定', value: '是' },
        { label: '锁定类型', value: data.lockPeriodType === 'period' ? '期数' : '天数' },
        { label: '锁定值', value: `${data.lockPeriodValue || 0}${data.lockPeriodType === 'period' ? '期' : '天'}` },
        { label: '限制类型', value: data.lockLimitType === 'repayment' ? '还款' : '支用' }
    ];
};
// 返回上一步
const handlePrev = () => {
    emit('prev');
};
// 提交表单
const handleSubmit = async () => {
    try {
        // TODO: 实现表单提交逻辑
        Message.success('创建成功');
        router.push('/marketing/coupon/template');
    }
    catch (error) {
        console.error('提交失败:', error);
    }
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-step" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "preview-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "preview-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-icon preview-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "title-text" },
    });
    const __VLS_4 = {}.ATooltip;
    /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ 
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        position: "right",
    }));
    const __VLS_6 = __VLS_5({
        position: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "title-help" },
    });
    {
        const { content: __VLS_thisSlot } = __VLS_7.slots;
    }
    let __VLS_7;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-content" },
});
const __VLS_8 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    data: (__VLS_ctx.previewData),
    layout: "inline-vertical",
    bordered: true,
}));
const __VLS_10 = __VLS_9({
    data: (__VLS_ctx.previewData),
    layout: "inline-vertical",
    bordered: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-actions" },
});
const __VLS_12 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.handlePrev)
};
__VLS_19.slots.default;
let __VLS_19;
const __VLS_24 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_27.slots.default;
let __VLS_27;
let __VLS_15;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['preview-step']} */ 
/** @type {__VLS_StyleScopedClasses['preview-card']} */ 
/** @type {__VLS_StyleScopedClasses['section-title']} */ 
/** @type {__VLS_StyleScopedClasses['title-icon']} */ 
/** @type {__VLS_StyleScopedClasses['preview-icon']} */ 
/** @type {__VLS_StyleScopedClasses['title-text']} */ 
/** @type {__VLS_StyleScopedClasses['title-help']} */ 
/** @type {__VLS_StyleScopedClasses['preview-content']} */ 
/** @type {__VLS_StyleScopedClasses['footer-actions']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            $emit: emit,
            previewData: previewData,
            handlePrev: handlePrev,
            handleSubmit: handleSubmit,
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
 /* PartiallyEnd: #4569/main.vue */
