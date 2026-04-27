/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import MainLayout from './components/layout/MainLayout.vue';
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['logo']} */ 
/** @type {__VLS_StyleScopedClasses['logo']} */ 
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.$route.path !== '/login' && __VLS_ctx.$route.path !== '/' && __VLS_ctx.$route.path !== '/home') {
    /** @type {[typeof MainLayout, typeof MainLayout, ]} */ 
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(MainLayout, new MainLayout({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
    const __VLS_3 = {};
    __VLS_2.slots.default;
    const __VLS_4 = {}.RouterView;
    /** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ 
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_2;
}
else {
    const __VLS_8 = {}.RouterView;
    /** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ 
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {};
    let __VLS_11;
}
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MainLayout: MainLayout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
