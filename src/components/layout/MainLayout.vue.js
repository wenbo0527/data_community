/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TourGuideButton from '@/components/guide/TourGuideButton.vue';
import { ROUTE_NAMES, ROUTE_PATHS } from '@/router/constants';
import { navigateTo } from '@/router/utils';
import { warning } from '@/utils/message';
import { IconApps, IconRobot, IconMenuFold, IconMenuUnfold, IconCommon, IconExperiment, IconDashboard, IconSafe } from '@arco-design/web-vue/es/icon';
const router = useRouter();
const route = useRoute();
const isDetailPage = computed(() => route.path.includes('/discovery/customer360/detail'));
const collapsed = ref(false);
const searchText = ref('');
const breakpoint = 'xl';
const selectedKeys = ref([route.name]);
const activeTopMenu = ref('discovery');
const showSideMenu = ref(true);
const handleTopMenuClick = (key) => {
    try {
        activeTopMenu.value = key;
        selectedKeys.value = [];
        // 使用路由常量进行跳转
        if (key === 'home') {
            navigateTo(router, ROUTE_PATHS.HOME);
            activeTopMenu.value = '';
            return;
        }
        const menuItem = menuItems.find(item => item.key === key);
        if (menuItem) {
            if (menuItem.children && menuItem.children.length > 0) {
                const firstChild = menuItem.children[0];
                if (firstChild && firstChild.path) {
                    navigateTo(router, firstChild.path);
                    selectedKeys.value = [firstChild.key];
                }
                activeTopMenu.value = key;
            }
            else if (menuItem.path) {
                navigateTo(router, menuItem.path);
                selectedKeys.value = [menuItem.key];
            }
        }
    }
    catch (error) {
        console.error('顶部菜单点击错误:', error);
        warning('菜单跳转失败，请重试');
    }
};
import touchMenuItems from './touchMenuItems';
const menuItems = [
    {
        key: 'discovery',
        title: '数据发现',
        children: [
            {
                key: 'asset-overview',
                title: '资产总览',
                path: '/discovery/asset-overview'
            },
            {
                key: 'dataMap',
                title: '统一搜索',
                path: '/discovery/data-map'
            },
            {
                key: 'full-data',
                title: '全量数据',
                path: '/discovery/data-map/TableList'
            },
            {
                key: 'data-asset',
                title: '数据资产',
                children: [
                    {
                        key: 'metrics-map',
                        title: '指标地图',
                        path: '/discovery/metrics-map'
                    },
                    {
                        key: 'credit-variables',
                        title: '征信变量',
                        path: '/discovery/credit'
                    },
                    {
                        key: 'external-data',
                        title: '外部数据',
                        path: '/external-data-v1/list'
                    }
                ]
            },
            {
                key: 'data-register',
                title: '数据注册',
                children: [
                    {
                        key: 'table-management',
                        title: '表管理',
                        path: '/discovery/asset-management/table-management'
                    },
                    {
                        key: 'external-data-management',
                        title: '外部数据管理',
                        path: '/discovery/asset-management/external-data-management'
                    },
                    {
                        key: 'metric-management',
                        title: '指标管理',
                        path: '/discovery/asset-management/metric-management'
                    },
                    {
                        key: 'batch-asset-management',
                        title: '批量资产管理',
                        path: '/discovery/asset-management/batch-asset-management'
                    }
                ]
            }
        ]
    },
    {
        key: 'exploration',
        title: '数据探索',
        children: [
            {
                key: 'explorationIndex',
                title: '探索首页',
                path: '/exploration/index'
            },
            {
                key: 'data-register',
                title: '外数生命周期',
                children: [
                    {
                        key: 'budget-management',
                        title: '预算管理',
                        path: '/exploration/external-data-analysis/budget-management'
                    },
                    {
                        key: 'external-data-evaluation',
                        title: '外部数据评估',
                        path: '/exploration/external-data-analysis/external-data-evaluation'
                    },
                    {
                        key: 'external-data-monitor',
                        title: '外部数据监控',
                        path: '/exploration/external-data-analysis/external-data-monitor'
                    }
                ]
            },
            {
                key: 'customer360',
                title: '客户360',
                path: '/discovery/customer360'
            },
            {
                key: 'customer-center',
                title: '客群中心',
                children: [
                    {
                        key: 'audience-management',
                        title: '人群管理',
                        path: '/exploration/customer-center/audience-portrait/audience-management'
                    },
                    {
                        key: 'event-center',
                        title: '事件中心',
                        children: [
                            {
                                key: 'event-center-index',
                                title: '事件中心首页',
                                path: '/exploration/customer-center/event-center'
                            },
                            {
                                key: 'event-management',
                                title: '事件管理',
                                path: '/exploration/customer-center/event-center/event-management'
                            },
                            {
                                key: 'virtual-events',
                                title: '虚拟事件',
                                path: '/exploration/customer-center/event-center/virtual-events'
                            },
                            {
                                key: 'sample-stats',
                                title: '样本统计',
                                path: '/exploration/customer-center/event-center/sample-stats'
                            },
                            {
                                key: 'kafka-datasource',
                                title: 'Kafka数据源',
                                path: '/exploration/customer-center/event-center/kafka-datasource'
                            }
                        ]
                    },
                    {
                        key: 'tag-system',
                        title: '标签管理',
                        children: [
                            {
                                key: 'tag-system-index',
                                title: '标签体系首页',
                                path: '/exploration/customer-center/tag-system'
                            },
                            {
                                key: 'tag-management',
                                title: '标签管理',
                                path: '/exploration/customer-center/tag-system/tag-management'
                            },
                            {
                                key: 'attribute-management',
                                title: '属性管理',
                                path: '/exploration/customer-center/tag-system/attribute-management'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        key: 'management',
        title: '数据管理',
        children: [
            {
                key: 'management-service',
                title: '数据服务',
                path: '/management/service'
            },
            {
                key: 'permission',
                title: '权限管理',
                path: '/management/permission'
            },
            {
                key: 'accompany',
                title: '陪跑计划',
                path: '/management/accompany',
                children: [
                    {
                        key: 'management-accompany-create',
                        title: '创建陪跑',
                        path: '/management/accompany/create'
                    },
                    {
                        key: 'management-accompany-result',
                        title: '陪跑结果',
                        path: '/management/accompany/result'
                    }
                ]
            }
        ]
    },
    {
        key: 'marketing',
        title: '数字营销',
        children: [
            {
                key: 'dashboard',
                title: '权益首页',
                path: '/marketing/dashboard'
            },
            {
                key: 'benefitConfig',
                title: '权益配置',
                children: [
                    {
                        key: 'template',
                        title: '模板管理',
                        path: '/marketing/benefit/template'
                    },
                    {
                        key: 'coupon-management',
                        title: '券管理',
                        path: '/marketing/benefit/management'
                    },
                    {
                        key: 'package',
                        title: '券包管理',
                        path: '/marketing/benefit/package'
                    }
                ]
            },
            {
                key: 'dataStatistics',
                title: '数据统计',
                children: [
                    {
                        key: 'couponLogs',
                        title: '权益日志',
                        path: '/marketing/statistics/logs'
                    },
                    {
                        key: 'inventory',
                        title: '库存查询',
                        path: '/marketing/statistics/inventory'
                    }
                ]
            }
        ]
    },
    {
        key: 'risk',
        title: '数字风险',
        children: [
            {
                key: 'risk-index',
                title: '风险首页',
                path: '/risk/index'
            }
        ]
    },
    {
        key: 'touch',
        title: '触达管理',
        children: [...touchMenuItems]
    }
];
const filteredMenuItems = computed(() => {
    let items = menuItems;
    // 根据顶部菜单过滤
    if (activeTopMenu.value) {
        items = items.filter(item => item.key === activeTopMenu.value ||
            item.path?.startsWith('/marketing'));
    }
    // 根据搜索文本过滤
    if (searchText.value) {
        const search = searchText.value.toLowerCase();
        items = items.map(item => {
            if (item.children) {
                const filteredChildren = item.children.filter(child => child.title.toLowerCase().includes(search));
                return { ...item, children: filteredChildren };
            }
            return item;
        }).filter(item => item.children?.length ||
            item.title.toLowerCase().includes(search));
    }
    return items;
});
const currentRoute = computed(() => {
    const currentMenu = menuItems.find(item => {
        if (item.children) {
            return item.children.some(child => child.key === route.name);
        }
        return item.key === route.name;
    });
    return currentMenu?.title || '';
});
const handleCollapse = (val) => {
    collapsed.value = val;
};
const toggleCollapse = () => {
    collapsed.value = !collapsed.value;
};
const routeLogs = ref([]);
const handleMenuClick = (key) => {
    try {
        if (typeof key !== 'string') {
            console.error('Invalid route key:', key);
            return;
        }
        // 查找菜单项对应的路径
        const findMenuPath = (items, targetKey) => {
            for (const item of items) {
                if (item.key === targetKey) {
                    return item.path || item.route;
                }
                if (item.children) {
                    const childPath = findMenuPath(item.children, targetKey);
                    if (childPath)
                        return childPath;
                }
            }
            return null;
        };
        const menuPath = findMenuPath(menuItems, key);
        if (menuPath) {
            // 记录路由跳转日志
            routeLogs.value.unshift({
                timestamp: new Date().toLocaleString(),
                from: route.path,
                to: menuPath,
                key: key
            });
            // 只保留最近10条日志
            if (routeLogs.value.length > 10) {
                routeLogs.value.pop();
            }
            // 使用路由工具函数进行跳转
            navigateTo(router, menuPath);
            selectedKeys.value = [key];
        }
        else {
            console.warn(`未找到菜单项 ${key} 对应的路径`);
            warning('菜单路径未配置，请联系管理员');
        }
    }
    catch (error) {
        console.error('菜单点击错误:', error);
        warning('菜单跳转失败，请重试');
    }
};
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
    ...{ class: "top-menu" },
    ...{ style: {} },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "top-menu" },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.AMenu;
/** @type {[typeof __VLS_components.AMenu, typeof __VLS_components.aMenu, typeof __VLS_components.AMenu, typeof __VLS_components.aMenu, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onMenuItemClick': {} },
    mode: "horizontal",
    selectedKeys: ([__VLS_ctx.activeTopMenu]),
}));
const __VLS_11 = __VLS_10({
    ...{ 'onMenuItemClick': {} },
    mode: "horizontal",
    selectedKeys: ([__VLS_ctx.activeTopMenu]),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onMenuItemClick: (__VLS_ctx.handleTopMenuClick)
};
__VLS_12.slots.default;
const __VLS_17 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    key: "home",
}));
const __VLS_19 = __VLS_18({
    key: "home",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
var __VLS_20;
const __VLS_21 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    key: "discovery",
}));
const __VLS_23 = __VLS_22({
    key: "discovery",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
var __VLS_24;
const __VLS_25 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    key: "exploration",
}));
const __VLS_27 = __VLS_26({
    key: "exploration",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
var __VLS_28;
const __VLS_29 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    key: "management",
}));
const __VLS_31 = __VLS_30({
    key: "management",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_32.slots.default;
var __VLS_32;
const __VLS_33 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    key: "marketing",
}));
const __VLS_35 = __VLS_34({
    key: "marketing",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
var __VLS_36;
const __VLS_37 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    key: "risk",
}));
const __VLS_39 = __VLS_38({
    key: "risk",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
var __VLS_40;
const __VLS_41 = {}.AMenuItem;
/** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    key: "touch",
}));
const __VLS_43 = __VLS_42({
    key: "touch",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
var __VLS_44;
var __VLS_12;
var __VLS_8;
const __VLS_45 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({}));
const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
const __VLS_49 = {}.ALayoutSider;
/** @type {[typeof __VLS_components.ALayoutSider, typeof __VLS_components.aLayoutSider, typeof __VLS_components.ALayoutSider, typeof __VLS_components.aLayoutSider, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    ...{ 'onCollapse': {} },
    collapsed: (__VLS_ctx.collapsed),
    breakpoint: (__VLS_ctx.breakpoint),
    width: (220),
    collapsible: (true),
    ...{ class: "layout-sider" },
}));
const __VLS_51 = __VLS_50({
    ...{ 'onCollapse': {} },
    collapsed: (__VLS_ctx.collapsed),
    breakpoint: (__VLS_ctx.breakpoint),
    width: (220),
    collapsible: (true),
    ...{ class: "layout-sider" },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
let __VLS_53;
let __VLS_54;
let __VLS_55;
const __VLS_56 = {
    onCollapse: (__VLS_ctx.handleCollapse)
};
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.showSideMenu) }, null, null);
__VLS_52.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-wrapper" },
});
if (!__VLS_ctx.isDetailPage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "menu-header" },
    });
    const __VLS_57 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        modelValue: (__VLS_ctx.searchText),
        ...{ style: ({ width: '90%' }) },
        placeholder: "搜索菜单",
        allowClear: true,
    }));
    const __VLS_59 = __VLS_58({
        modelValue: (__VLS_ctx.searchText),
        ...{ style: ({ width: '90%' }) },
        placeholder: "搜索菜单",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
}
const __VLS_61 = {}.AMenu;
/** @type {[typeof __VLS_components.AMenu, typeof __VLS_components.aMenu, typeof __VLS_components.AMenu, typeof __VLS_components.aMenu, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    ...{ style: ({ width: '100%' }) },
    collapsed: (__VLS_ctx.collapsed),
    selectedKeys: (__VLS_ctx.selectedKeys),
    defaultOpenKeys: (['management']),
    showCollapseButton: true,
    activeKeyStyle: ({ color: 'rgb(var(--primary-6))', fontWeight: 'bold', borderLeft: '3px solid rgb(var(--primary-6))', paddingLeft: '13px' }),
    hoverKeyStyle: ({ backgroundColor: 'var(--color-fill-2)' }),
    itemMargin: (12),
}));
const __VLS_63 = __VLS_62({
    ...{ style: ({ width: '100%' }) },
    collapsed: (__VLS_ctx.collapsed),
    selectedKeys: (__VLS_ctx.selectedKeys),
    defaultOpenKeys: (['management']),
    showCollapseButton: true,
    activeKeyStyle: ({ color: 'rgb(var(--primary-6))', fontWeight: 'bold', borderLeft: '3px solid rgb(var(--primary-6))', paddingLeft: '13px' }),
    hoverKeyStyle: ({ backgroundColor: 'var(--color-fill-2)' }),
    itemMargin: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredMenuItems))) {
    (item.key);
    if (!item.children) {
        const __VLS_65 = {}.AMenuItem;
        /** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
            ...{ 'onClick': {} },
        }));
        const __VLS_67 = __VLS_66({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        let __VLS_69;
        let __VLS_70;
        let __VLS_71;
        const __VLS_72 = {
            onClick: (() => __VLS_ctx.handleMenuClick(item.key))
        };
        __VLS_68.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_68.slots;
            if (item.key === 'exploration') {
                const __VLS_73 = {}.IconExperiment;
                /** @type {[typeof __VLS_components.IconExperiment, typeof __VLS_components.iconExperiment, ]} */ ;
                // @ts-ignore
                const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({}));
                const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
            }
            else if (item.key === 'marketing') {
                const __VLS_77 = {}.IconDashboard;
                /** @type {[typeof __VLS_components.IconDashboard, typeof __VLS_components.iconDashboard, ]} */ ;
                // @ts-ignore
                const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
                const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
            }
            else if (item.key === 'risk') {
                const __VLS_81 = {}.IconSafe;
                /** @type {[typeof __VLS_components.IconSafe, typeof __VLS_components.iconSafe, ]} */ ;
                // @ts-ignore
                const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({}));
                const __VLS_83 = __VLS_82({}, ...__VLS_functionalComponentArgsRest(__VLS_82));
            }
            else {
                const __VLS_85 = {}.IconApps;
                /** @type {[typeof __VLS_components.IconApps, typeof __VLS_components.iconApps, ]} */ ;
                // @ts-ignore
                const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
                const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "menu-item-text" },
        });
        (item.title);
        var __VLS_68;
    }
    else {
        const __VLS_89 = {}.ASubMenu;
        /** @type {[typeof __VLS_components.ASubMenu, typeof __VLS_components.aSubMenu, typeof __VLS_components.ASubMenu, typeof __VLS_components.aSubMenu, ]} */ ;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
            key: (item.key),
        }));
        const __VLS_91 = __VLS_90({
            key: (item.key),
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        __VLS_92.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_92.slots;
            if (item.key === 'discovery') {
                const __VLS_93 = {}.IconCommon;
                /** @type {[typeof __VLS_components.IconCommon, typeof __VLS_components.iconCommon, ]} */ ;
                // @ts-ignore
                const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
                const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
            }
            else if (item.key === 'management') {
                const __VLS_97 = {}.IconRobot;
                /** @type {[typeof __VLS_components.IconRobot, typeof __VLS_components.iconRobot, ]} */ ;
                // @ts-ignore
                const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
                const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
            }
            else if (item.key === 'apps') {
                const __VLS_101 = {}.IconApps;
                /** @type {[typeof __VLS_components.IconApps, typeof __VLS_components.iconApps, ]} */ ;
                // @ts-ignore
                const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({}));
                const __VLS_103 = __VLS_102({}, ...__VLS_functionalComponentArgsRest(__VLS_102));
            }
            else if (item.key === 'touch') {
                const __VLS_105 = {}.IconCommon;
                /** @type {[typeof __VLS_components.IconCommon, typeof __VLS_components.iconCommon, ]} */ ;
                // @ts-ignore
                const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({}));
                const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
            }
            else if (item.key === 'reach') {
                const __VLS_109 = {}.IconCommon;
                /** @type {[typeof __VLS_components.IconCommon, typeof __VLS_components.iconCommon, ]} */ ;
                // @ts-ignore
                const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({}));
                const __VLS_111 = __VLS_110({}, ...__VLS_functionalComponentArgsRest(__VLS_110));
            }
        }
        {
            const { title: __VLS_thisSlot } = __VLS_92.slots;
            (item.title);
        }
        for (const [child] of __VLS_getVForSourceType((item.children))) {
            (child.key);
            if (child.children && child.children.length > 0) {
                const __VLS_113 = {}.ASubMenu;
                /** @type {[typeof __VLS_components.ASubMenu, typeof __VLS_components.aSubMenu, typeof __VLS_components.ASubMenu, typeof __VLS_components.aSubMenu, ]} */ ;
                // @ts-ignore
                const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
                    key: (child.key),
                }));
                const __VLS_115 = __VLS_114({
                    key: (child.key),
                }, ...__VLS_functionalComponentArgsRest(__VLS_114));
                __VLS_116.slots.default;
                {
                    const { title: __VLS_thisSlot } = __VLS_116.slots;
                    (child.title);
                }
                for (const [grandchild] of __VLS_getVForSourceType((child.children))) {
                    (grandchild.key);
                    if (grandchild.children && grandchild.children.length > 0) {
                        const __VLS_117 = {}.ASubMenu;
                        /** @type {[typeof __VLS_components.ASubMenu, typeof __VLS_components.aSubMenu, typeof __VLS_components.ASubMenu, typeof __VLS_components.aSubMenu, ]} */ ;
                        // @ts-ignore
                        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
                            key: (grandchild.key),
                        }));
                        const __VLS_119 = __VLS_118({
                            key: (grandchild.key),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
                        __VLS_120.slots.default;
                        {
                            const { title: __VLS_thisSlot } = __VLS_120.slots;
                            (grandchild.title);
                        }
                        for (const [greatGrandchild] of __VLS_getVForSourceType((grandchild.children))) {
                            const __VLS_121 = {}.AMenuItem;
                            /** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
                            // @ts-ignore
                            const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
                                ...{ 'onClick': {} },
                            }));
                            const __VLS_123 = __VLS_122({
                                ...{ 'onClick': {} },
                            }, ...__VLS_functionalComponentArgsRest(__VLS_122));
                            let __VLS_125;
                            let __VLS_126;
                            let __VLS_127;
                            const __VLS_128 = {
                                onClick: (() => __VLS_ctx.handleMenuClick(greatGrandchild.key))
                            };
                            __VLS_124.slots.default;
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "menu-item-text" },
                            });
                            (greatGrandchild.title);
                            var __VLS_124;
                        }
                        var __VLS_120;
                    }
                    else {
                        const __VLS_129 = {}.AMenuItem;
                        /** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
                        // @ts-ignore
                        const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
                            ...{ 'onClick': {} },
                        }));
                        const __VLS_131 = __VLS_130({
                            ...{ 'onClick': {} },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_130));
                        let __VLS_133;
                        let __VLS_134;
                        let __VLS_135;
                        const __VLS_136 = {
                            onClick: (() => __VLS_ctx.handleMenuClick(grandchild.key))
                        };
                        __VLS_132.slots.default;
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: "menu-item-text" },
                        });
                        (grandchild.title);
                        var __VLS_132;
                    }
                }
                var __VLS_116;
            }
            else {
                const __VLS_137 = {}.AMenuItem;
                /** @type {[typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, typeof __VLS_components.AMenuItem, typeof __VLS_components.aMenuItem, ]} */ ;
                // @ts-ignore
                const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
                    ...{ 'onClick': {} },
                }));
                const __VLS_139 = __VLS_138({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_138));
                let __VLS_141;
                let __VLS_142;
                let __VLS_143;
                const __VLS_144 = {
                    onClick: (() => __VLS_ctx.handleMenuClick(child.key))
                };
                __VLS_140.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "menu-item-text" },
                });
                (child.title);
                var __VLS_140;
            }
        }
        var __VLS_92;
    }
}
var __VLS_64;
var __VLS_52;
const __VLS_145 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({}));
const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
const __VLS_149 = {}.ALayoutHeader;
/** @type {[typeof __VLS_components.ALayoutHeader, typeof __VLS_components.aLayoutHeader, typeof __VLS_components.ALayoutHeader, typeof __VLS_components.aLayoutHeader, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    ...{ class: "layout-header" },
}));
const __VLS_151 = __VLS_150({
    ...{ class: "layout-header" },
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
const __VLS_153 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({}));
const __VLS_155 = __VLS_154({}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_156.slots.default;
const __VLS_157 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    ...{ 'onClick': {} },
    type: "text",
}));
const __VLS_159 = __VLS_158({
    ...{ 'onClick': {} },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
let __VLS_161;
let __VLS_162;
let __VLS_163;
const __VLS_164 = {
    onClick: (__VLS_ctx.toggleCollapse)
};
__VLS_160.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_160.slots;
    if (!__VLS_ctx.collapsed) {
        const __VLS_165 = {}.IconMenuFold;
        /** @type {[typeof __VLS_components.IconMenuFold, typeof __VLS_components.iconMenuFold, ]} */ ;
        // @ts-ignore
        const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({}));
        const __VLS_167 = __VLS_166({}, ...__VLS_functionalComponentArgsRest(__VLS_166));
    }
    else {
        const __VLS_169 = {}.IconMenuUnfold;
        /** @type {[typeof __VLS_components.IconMenuUnfold, typeof __VLS_components.iconMenuUnfold, ]} */ ;
        // @ts-ignore
        const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({}));
        const __VLS_171 = __VLS_170({}, ...__VLS_functionalComponentArgsRest(__VLS_170));
    }
}
var __VLS_160;
const __VLS_173 = {}.ABreadcrumb;
/** @type {[typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    ...{ style: ({ marginLeft: '24px', color: '#666' }) },
    separator: "/",
}));
const __VLS_175 = __VLS_174({
    ...{ style: ({ marginLeft: '24px', color: '#666' }) },
    separator: "/",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({}));
const __VLS_179 = __VLS_178({}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_180.slots.default;
var __VLS_180;
const __VLS_181 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({}));
const __VLS_183 = __VLS_182({}, ...__VLS_functionalComponentArgsRest(__VLS_182));
__VLS_184.slots.default;
(__VLS_ctx.currentRoute);
var __VLS_184;
var __VLS_176;
var __VLS_156;
var __VLS_152;
const __VLS_185 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
    ...{ class: "layout-content" },
}));
const __VLS_187 = __VLS_186({
    ...{ class: "layout-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_188.slots.default;
const __VLS_189 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({}));
const __VLS_191 = __VLS_190({}, ...__VLS_functionalComponentArgsRest(__VLS_190));
var __VLS_188;
var __VLS_148;
var __VLS_48;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['layout-container']} */ ;
/** @type {__VLS_StyleScopedClasses['top-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-sider']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-item-text']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-item-text']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-item-text']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-item-text']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-header']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconApps: IconApps,
            IconRobot: IconRobot,
            IconMenuFold: IconMenuFold,
            IconMenuUnfold: IconMenuUnfold,
            IconCommon: IconCommon,
            IconExperiment: IconExperiment,
            IconDashboard: IconDashboard,
            IconSafe: IconSafe,
            isDetailPage: isDetailPage,
            collapsed: collapsed,
            searchText: searchText,
            breakpoint: breakpoint,
            selectedKeys: selectedKeys,
            activeTopMenu: activeTopMenu,
            showSideMenu: showSideMenu,
            handleTopMenuClick: handleTopMenuClick,
            filteredMenuItems: filteredMenuItems,
            currentRoute: currentRoute,
            handleCollapse: handleCollapse,
            toggleCollapse: toggleCollapse,
            handleMenuClick: handleMenuClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
