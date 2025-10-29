/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { IconSearch } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { fetchUserInfo } from '../../../mock/customer360';
const router = useRouter();
const loading = ref(false);
const searchForm = reactive({
    userId: ''
});
const handleSearch = async () => {
    if (!searchForm.userId.trim()) {
        Message.warning('请输入用户ID');
        return;
    }
    loading.value = true;
    try {
        const userInfo = await fetchUserInfo(searchForm.userId);
        if (userInfo.error) {
            Message.error(userInfo.message || '查询失败');
            return;
        }
        Message.success('查询成功，正在跳转到客户详情页...');
        const routeParams = {
            name: 'Customer360Detail',
            params: {
                userId: searchForm.userId
            }
        };
        try {
            // 在当前页面跳转到详情页
            await router.push(routeParams);
        }
        catch (routeError) {
            Message.error('页面打开失败，请稍后重试');
        }
    }
    catch (error) {
        Message.error('查询失败，请稍后重试');
    }
    finally {
        loading.value = false;
    }
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['search-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-360-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['search-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "customer-360-container" },
});
if (!__VLS_ctx.$route.params.userId) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-form" },
    });
    const __VLS_0 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.searchForm.userId),
        placeholder: "请输入用户ID（如：887123）",
        ...{ class: "search-input" },
        size: "large",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.searchForm.userId),
        placeholder: "请输入用户ID（如：887123）",
        ...{ class: "search-input" },
        size: "large",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
    var __VLS_3;
    const __VLS_8 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "search-button" },
        size: "large",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "search-button" },
        size: "large",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    __VLS_11.slots.default;
    const __VLS_16 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
    var __VLS_11;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-tips" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
const __VLS_20 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
/** @type {__VLS_StyleScopedClasses['customer-360-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['search-button']} */ ;
/** @type {__VLS_StyleScopedClasses['search-tips']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            loading: loading,
            searchForm: searchForm,
            handleSearch: handleSearch,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
