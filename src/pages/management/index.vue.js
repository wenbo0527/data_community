/// <reference types="../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref } from 'vue';
const services = ref([
    {
        title: '在线批量调用申请',
        description: '在线调用外部API以批量获取数据，需提供账号、密码等认证信息。',
        avatar: 'B',
        type: 'batch'
    },
    {
        title: '外数离线回溯申请',
        description: '离线方式获取历史外部数据，需明确时间范围和数据项。',
        avatar: 'O',
        type: 'offline'
    },
    {
        title: '周期跑批任务申请',
        description: '定期自动执行的数据获取任务，可设置执行周期和通知方式。',
        avatar: 'P',
        type: 'periodic'
    },
    {
        title: '全量变量回溯申请',
        description: '获取所有变量的历史数据，支持按时间范围分批处理。',
        avatar: 'F',
        type: 'full'
    },
    {
        title: '数据文件落库申请',
        description: '将数据文件导入到数据库中，支持多种文件格式。',
        avatar: 'D',
        type: 'import'
    }
]);
const handleApply = (type) => {
    console.log('申请服务类型:', type);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "content" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    gutter: ([24, 24]),
}));
const __VLS_11 = __VLS_10({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
for (const [service, index] of __VLS_getVForSourceType((__VLS_ctx.services))) {
    const __VLS_13 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        span: (6),
        key: (index),
    }));
    const __VLS_15 = __VLS_14({
        span: (6),
        key: (index),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_16.slots.default;
    const __VLS_17 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        hoverable: true,
    }));
    const __VLS_19 = __VLS_18({
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    const __VLS_21 = {}.ACardMeta;
    /** @type {[typeof __VLS_components.ACardMeta, typeof __VLS_components.aCardMeta, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        title: (service.title),
        description: (service.description),
    }));
    const __VLS_23 = __VLS_22({
        title: (service.title),
        description: (service.description),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-actions" },
    });
    const __VLS_25 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_29;
    let __VLS_30;
    let __VLS_31;
    const __VLS_32 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleApply(service.type);
        }
    };
    __VLS_28.slots.default;
    var __VLS_28;
    var __VLS_20;
    var __VLS_16;
}
var __VLS_12;
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            services: services,
            handleApply: handleApply,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
