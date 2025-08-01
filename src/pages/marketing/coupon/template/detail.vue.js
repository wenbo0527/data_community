/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { useRoute } from 'vue-router';
import CouponTemplateCreate from './create.vue';
const route = useRoute();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['back-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-template-detail" },
});
/** @type {[typeof CouponTemplateCreate, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(CouponTemplateCreate, new CouponTemplateCreate({
    mode: ('view'),
    id: (__VLS_ctx.route.query.id),
    readonly: (true),
    disableOperations: true,
}));
const __VLS_1 = __VLS_0({
    mode: ('view'),
    id: (__VLS_ctx.route.query.id),
    readonly: (true),
    disableOperations: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {__VLS_StyleScopedClasses['coupon-template-detail']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CouponTemplateCreate: CouponTemplateCreate,
            route: route,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
