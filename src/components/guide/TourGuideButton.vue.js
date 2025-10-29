/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { IconQuestionCircle } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import TourGuide from './TourGuide.vue';
// 引导步骤配置
const tourSteps = [
    {
        element: '.data-assets',
        title: '数据资产',
        description: '在这里你可以查找和管理数据资产，包括数据表、外部数据、CDP元素和风控变量等。',
        position: 'right'
    },
    {
        element: '.data-exploration',
        title: '数据探索',
        description: '提供多维度自助分析工具，支持SQL分析、报表调取、客群洞察和模型开发等功能。',
        position: 'bottom'
    },
    {
        element: '.digital-credit',
        title: '数字授信',
        description: '变量中心与模型服务，支持实时风控和反欺诈等功能。',
        position: 'left'
    },
    {
        element: '.digital-marketing',
        title: '数字营销',
        description: '营销策略与权益管理，支持精准营销和活动策划等功能。',
        position: 'top'
    },
    {
        element: '.digital-management',
        title: '数字管理',
        description: '数据服务与权限申请，提供API管理和权限控制等功能。',
        position: 'left'
    }
];
// 引导状态
const tourVisible = ref(false);
// 开始引导
const startTour = () => {
    tourVisible.value = true;
};
// 处理引导完成
const handleTourFinish = () => {
    Message.success('引导完成！');
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tour-guide-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tour-guide-button-container" },
});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    shape: "circle",
    ...{ class: "tour-guide-button" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    shape: "circle",
    ...{ class: "tour-guide-button" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.startTour)
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.IconQuestionCircle;
    /** @type {[typeof __VLS_components.IconQuestionCircle, typeof __VLS_components.iconQuestionCircle, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
/** @type {[typeof TourGuide, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(TourGuide, new TourGuide({
    ...{ 'onFinish': {} },
    visible: (__VLS_ctx.tourVisible),
    steps: (__VLS_ctx.tourSteps),
}));
const __VLS_13 = __VLS_12({
    ...{ 'onFinish': {} },
    visible: (__VLS_ctx.tourVisible),
    steps: (__VLS_ctx.tourSteps),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_15;
let __VLS_16;
let __VLS_17;
const __VLS_18 = {
    onFinish: (__VLS_ctx.handleTourFinish)
};
var __VLS_14;
/** @type {__VLS_StyleScopedClasses['tour-guide-button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tour-guide-button']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconQuestionCircle: IconQuestionCircle,
            TourGuide: TourGuide,
            tourSteps: tourSteps,
            tourVisible: tourVisible,
            startTour: startTour,
            handleTourFinish: handleTourFinish,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
