/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TopMenu from './TopMenu.vue';
import SideMenu from './SideMenu.vue';
import BreadcrumbNav from './BreadcrumbNav.vue';
import { getMenuItemByPath } from '../../config/menuConfig';
import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon';
const router = useRouter();
const route = useRoute();
// 组件引用
const topMenuRef = ref(null);
const sideMenuRef = ref(null);
// 布局状态
const collapsed = ref(false);
const breakpoint = 'xl';
const activeModule = ref('discovery');
// 计算是否为详情页
const isDetailPage = computed(() => {
    return route.path.includes('/detail') || route.path.includes('/customer360/');
});
// 计算是否显示侧边菜单
const showSideMenu = computed(() => {
    // 首页不显示侧边菜单
    return activeModule.value !== 'home';
});
// 处理顶部菜单变化
const handleTopMenuChange = (moduleKey) => {
    console.log('顶部菜单变化:', moduleKey);
    activeModule.value = moduleKey;
    // 清空侧边菜单搜索
    if (sideMenuRef.value) {
        sideMenuRef.value.clearSearch();
    }
};
// 处理侧边栏折叠
const handleCollapse = (val) => {
    collapsed.value = val;
};
// 切换侧边栏折叠状态
const toggleCollapse = () => {
    collapsed.value = !collapsed.value;
};
// 根据路由更新活动模块
const updateActiveModuleFromRoute = () => {
    const menuInfo = getMenuItemByPath(route.path);
    if (menuInfo && menuInfo.module !== activeModule.value) {
        activeModule.value = menuInfo.module;
        // 只在需要时更新顶部菜单选中状态，避免重复调用
        if (topMenuRef.value && !topMenuRef.value.selectedKeys?.includes(menuInfo.module)) {
            topMenuRef.value.setActiveMenu(menuInfo.module);
        }
    }
};
// 监听路由变化
watch(() => route.path, () => {
    updateActiveModuleFromRoute();
}, { immediate: true });
// 组件挂载时初始化
onMounted(() => {
    console.log('MainLayout 组件挂载完成');
    updateActiveModuleFromRoute();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "layout-container" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "layout-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutHeader;
/** @type {[typeof __VLS_components.ALayoutHeader, typeof __VLS_components.aLayoutHeader, typeof __VLS_components.ALayoutHeader, typeof __VLS_components.aLayoutHeader, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "top-menu-header" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "top-menu-header" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
/** @type {[typeof TopMenu, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(TopMenu, new TopMenu({
    ...{ 'onMenuChange': {} },
    ref: "topMenuRef",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onMenuChange': {} },
    ref: "topMenuRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onMenuChange: (__VLS_ctx.handleTopMenuChange)
};
/** @type {typeof __VLS_ctx.topMenuRef} */ ;
var __VLS_16 = {};
var __VLS_11;
var __VLS_8;
const __VLS_18 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({}));
const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.ALayoutSider;
/** @type {[typeof __VLS_components.ALayoutSider, typeof __VLS_components.aLayoutSider, typeof __VLS_components.ALayoutSider, typeof __VLS_components.aLayoutSider, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    ...{ 'onCollapse': {} },
    collapsed: (__VLS_ctx.collapsed),
    breakpoint: (__VLS_ctx.breakpoint),
    width: (220),
    collapsible: (true),
    ...{ class: "layout-sider" },
}));
const __VLS_24 = __VLS_23({
    ...{ 'onCollapse': {} },
    collapsed: (__VLS_ctx.collapsed),
    breakpoint: (__VLS_ctx.breakpoint),
    width: (220),
    collapsible: (true),
    ...{ class: "layout-sider" },
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
let __VLS_26;
let __VLS_27;
let __VLS_28;
const __VLS_29 = {
    onCollapse: (__VLS_ctx.handleCollapse)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.showSideMenu) }, null, null);
__VLS_25.slots.default;
/** @type {[typeof SideMenu, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(SideMenu, new SideMenu({
    activeModule: (__VLS_ctx.activeModule),
    collapsed: (__VLS_ctx.collapsed),
    isDetailPage: (__VLS_ctx.isDetailPage),
    ref: "sideMenuRef",
}));
const __VLS_31 = __VLS_30({
    activeModule: (__VLS_ctx.activeModule),
    collapsed: (__VLS_ctx.collapsed),
    isDetailPage: (__VLS_ctx.isDetailPage),
    ref: "sideMenuRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
/** @type {typeof __VLS_ctx.sideMenuRef} */ ;
var __VLS_33 = {};
var __VLS_32;
var __VLS_25;
const __VLS_35 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({}));
const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_38.slots.default;
const __VLS_39 = {}.ALayoutHeader;
/** @type {[typeof __VLS_components.ALayoutHeader, typeof __VLS_components.aLayoutHeader, typeof __VLS_components.ALayoutHeader, typeof __VLS_components.aLayoutHeader, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    ...{ class: "layout-header" },
}));
const __VLS_41 = __VLS_40({
    ...{ class: "layout-header" },
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_42.slots.default;
const __VLS_43 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({}));
const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
const __VLS_47 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    ...{ 'onClick': {} },
    type: "text",
}));
const __VLS_49 = __VLS_48({
    ...{ 'onClick': {} },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
let __VLS_51;
let __VLS_52;
let __VLS_53;
const __VLS_54 = {
    onClick: (__VLS_ctx.toggleCollapse)
};
__VLS_50.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_50.slots;
    if (!__VLS_ctx.collapsed) {
        const __VLS_55 = {}.IconMenuFold;
        /** @type {[typeof __VLS_components.IconMenuFold, typeof __VLS_components.iconMenuFold, ]} */ ;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({}));
        const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
    }
    else {
        const __VLS_59 = {}.IconMenuUnfold;
        /** @type {[typeof __VLS_components.IconMenuUnfold, typeof __VLS_components.iconMenuUnfold, ]} */ ;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({}));
        const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
    }
}
var __VLS_50;
/** @type {[typeof BreadcrumbNav, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(BreadcrumbNav, new BreadcrumbNav({
    currentPath: (__VLS_ctx.route.path),
}));
const __VLS_64 = __VLS_63({
    currentPath: (__VLS_ctx.route.path),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
var __VLS_46;
var __VLS_42;
const __VLS_66 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    ...{ class: "layout-content" },
}));
const __VLS_68 = __VLS_67({
    ...{ class: "layout-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
const __VLS_70 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({}));
const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
var __VLS_69;
var __VLS_38;
var __VLS_21;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['layout-container']} */ ;
/** @type {__VLS_StyleScopedClasses['top-menu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-sider']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-header']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-content']} */ ;
// @ts-ignore
var __VLS_17 = __VLS_16, __VLS_34 = __VLS_33;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            TopMenu: TopMenu,
            SideMenu: SideMenu,
            BreadcrumbNav: BreadcrumbNav,
            IconMenuFold: IconMenuFold,
            IconMenuUnfold: IconMenuUnfold,
            route: route,
            topMenuRef: topMenuRef,
            sideMenuRef: sideMenuRef,
            collapsed: collapsed,
            breakpoint: breakpoint,
            activeModule: activeModule,
            isDetailPage: isDetailPage,
            showSideMenu: showSideMenu,
            handleTopMenuChange: handleTopMenuChange,
            handleCollapse: handleCollapse,
            toggleCollapse: toggleCollapse,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
