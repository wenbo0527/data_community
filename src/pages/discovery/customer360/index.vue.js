/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { SearchOutlined } from '@ant-design/icons-vue';
import { Message, Spin } from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import { fetchUserInfo } from '@/api/discovery';
const userId = ref('');
const loading = ref(false);
const router = useRouter();
const handleSearch = async () => {
    if (!userId) {
        Message.warning('请输入用户ID');
        return;
    }
    loading.value = true;
    try {
        const userData = await fetchUserInfo(userId.value);
        if (userData) {
            router.push(`/discovery/customer360/${userId.value}`);
        }
        else {
            Message.warning('未找到该用户信息');
        }
    }
    catch (error) {
        Message.error('查询失败，请重试');
        console.error('Search error:', error);
    }
    finally {
        loading.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['search-results']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-box" },
});
const __VLS_0 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onPressEnter': {} },
    modelValue: (__VLS_ctx.userId),
    placeholder: "请输入用户ID进行查询",
    ...{ class: "search-input" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onPressEnter': {} },
    modelValue: (__VLS_ctx.userId),
    placeholder: "请输入用户ID进行查询",
    ...{ class: "search-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onPressEnter: (__VLS_ctx.handleSearch)
};
var __VLS_3;
const __VLS_8 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "search-button" },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "search-button" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_11.slots.default;
const __VLS_16 = {}.SearchOutlined;
/** @type {[typeof __VLS_components.SearchOutlined, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
var __VLS_11;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-container" },
    });
    const __VLS_20 = {}.Spin;
    /** @type {[typeof __VLS_components.Spin, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        size: (20),
    }));
    const __VLS_22 = __VLS_21({
        size: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
const __VLS_24 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
/** @type {__VLS_StyleScopedClasses['search-container']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['search-button']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SearchOutlined: SearchOutlined,
            Spin: Spin,
            userId: userId,
            loading: loading,
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
