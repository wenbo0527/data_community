/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
const router = useRouter();
const serviceList = ref([
    {
        id: 1,
        title: '在线数据明细申请',
        description: '在线调用外部数据API接口，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
    },
    {
        id: 2,
        title: '外置数据回溯申请',
        description: '在线调用外部数据API接口，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
    },
    {
        id: 3,
        title: '离线数据任务申请',
        description: '离线数据任务是指在一次性申请，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
    },
    {
        id: 4,
        title: '全量变量回溯申请',
        description: '过往历史数据全量变量回溯申请，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
    },
    {
        id: 5,
        title: '数据文件清洗申请',
        description: '对接数据文件上传至指定文件夹，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
    },
    {
        id: 6,
        title: '风险合规外数查询',
        description: '查询客户风险合规相关外部数据，支持身份证号查询和批量回溯两种模式，可按时间筛选并生成查询确认列表。'
    }
]);
const handleApply = (service) => {
    if (service.id === 4) {
        // 全量变量回溯申请，跳转到专门的申请页面
        router.push('/management/service/backtrack');
    }
    else if (service.id === 6) {
        // 客户资金用途外数查询，跳转到专门的查询页面
        router.push('/management/service/fund-usage-query');
    }
    else {
        Message.success(`已提交${service.title}申请`);
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-footer']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_0 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    gutter: ([24, 24]),
}));
const __VLS_2 = __VLS_1({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
for (const [service] of __VLS_getVForSourceType((__VLS_ctx.serviceList))) {
    const __VLS_4 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        span: (6),
        key: (service.id),
    }));
    const __VLS_6 = __VLS_5({
        span: (6),
        key: (service.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ class: "service-card" },
        hoverable: true,
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "service-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "service-title" },
    });
    (service.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "service-description" },
    });
    (service.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "service-footer" },
    });
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
        onClick: (...[$event]) => {
            __VLS_ctx.handleApply(service);
        }
    };
    __VLS_15.slots.default;
    var __VLS_15;
    var __VLS_11;
    var __VLS_7;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['service-card']} */ ;
/** @type {__VLS_StyleScopedClasses['service-content']} */ ;
/** @type {__VLS_StyleScopedClasses['service-title']} */ ;
/** @type {__VLS_StyleScopedClasses['service-description']} */ ;
/** @type {__VLS_StyleScopedClasses['service-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            serviceList: serviceList,
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
