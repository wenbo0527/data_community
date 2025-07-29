// 导入Vue组合式API
import { ref, onMounted } from 'vue';
// 导入Vue路由
import { useRouter } from 'vue-router';
// 初始化路由实例
const router = useRouter();
// 加载状态控制
const loading = ref(false);
// 页面容器引用
const containerRef = ref(null);
/**
 * 记录布局尺寸
 * 输出当前窗口宽度和容器渲染宽度到控制台
 */
const logLayoutDimensions = () => {
    if (containerRef.value) {
        const windowWidth = window.innerWidth;
        const containerWidth = containerRef.value.clientWidth;
        const headerSection = document.querySelector('.header-section')?.clientWidth;
        const contentSection = document.querySelector('.content-section')?.clientWidth;
        const statCards = document.querySelectorAll('.stat-card');
        console.group('页面布局宽度报告');
        console.log(`窗口宽度: ${windowWidth}px`);
        console.log(`容器渲染宽度: ${containerWidth}px`);
        console.log(`头部区域宽度: ${headerSection}px`);
        console.log(`内容区域宽度: ${contentSection}px`);
        statCards.forEach((card, index) => {
            console.log(`统计卡片 ${index + 1} 宽度: ${card.clientWidth}px`);
        });
        console.groupEnd();
    }
};
// 组件挂载后执行
onMounted(() => {
    // 初始记录一次尺寸
    logLayoutDimensions();
    // 添加窗口大小变化监听
    window.addEventListener('resize', logLayoutDimensions);
});
/**
 * 刷新数据
 * 模拟数据加载过程
 */
const refreshData = () => {
    loading.value = true;
    // 模拟数据加载
    setTimeout(() => {
        loading.value = false;
    }, 1000);
};
/**
 * 显示使用指南
 * TODO: 实现指南弹窗逻辑
 */
const showGuide = () => {
    // 显示使用指南
};
/**
 * 路由跳转
 * @param routeName 目标路由名称
 */
const navigateTo = (routeName) => {
    router.push({ name: routeName });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['relation-diagram-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "containerRef",
    ...{ class: "asset-guide-container" },
});
/** @type {typeof __VLS_ctx.containerRef} */ ;
const __VLS_0 = {}.ASpin;
/** @type {[typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    loading: (__VLS_ctx.loading),
    ...{ class: "spin-container" },
    tip: "加载中...",
}));
const __VLS_2 = __VLS_1({
    loading: (__VLS_ctx.loading),
    ...{ class: "spin-container" },
    tip: "加载中...",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
const __VLS_4 = {}.IconData;
/** @type {[typeof __VLS_components.IconData, typeof __VLS_components.iconData, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    width: "24",
    height: "24",
}));
const __VLS_6 = __VLS_5({
    width: "24",
    height: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-actions" },
});
const __VLS_8 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.refreshData)
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.showGuide)
};
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_24 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    gutter: ([16, 16]),
}));
const __VLS_26 = __VLS_25({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    span: (6),
}));
const __VLS_30 = __VLS_29({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    bordered: (false),
    hoverable: true,
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    ...{ class: "stat-card" },
    bordered: (false),
    hoverable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (...[$event]) => {
        __VLS_ctx.navigateTo('data-tables');
    }
};
__VLS_35.slots.default;
const __VLS_40 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    title: "数据表",
    value: (1268),
    valueStyle: ({ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }),
    showGroupSeparator: true,
}));
const __VLS_42 = __VLS_41({
    title: "数据表",
    value: (1268),
    valueStyle: ({ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }),
    showGroupSeparator: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { suffix: __VLS_thisSlot } = __VLS_43.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-unit" },
    });
}
var __VLS_43;
var __VLS_35;
var __VLS_31;
const __VLS_44 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    span: (6),
}));
const __VLS_46 = __VLS_45({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ class: "stat-card" },
    bordered: (false),
}));
const __VLS_50 = __VLS_49({
    ...{ class: "stat-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    title: "外部数据",
    value: (4985),
    valueStyle: ({ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }),
    showGroupSeparator: true,
}));
const __VLS_54 = __VLS_53({
    title: "外部数据",
    value: (4985),
    valueStyle: ({ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }),
    showGroupSeparator: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
{
    const { suffix: __VLS_thisSlot } = __VLS_55.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-unit" },
    });
}
var __VLS_55;
var __VLS_51;
var __VLS_47;
const __VLS_56 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    span: (6),
}));
const __VLS_58 = __VLS_57({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ class: "stat-card" },
    bordered: (false),
}));
const __VLS_62 = __VLS_61({
    ...{ class: "stat-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    title: "变量管理",
    value: (1002),
    valueStyle: ({ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }),
    showGroupSeparator: true,
}));
const __VLS_66 = __VLS_65({
    title: "变量管理",
    value: (1002),
    valueStyle: ({ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }),
    showGroupSeparator: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
{
    const { suffix: __VLS_thisSlot } = __VLS_67.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-unit" },
    });
}
var __VLS_67;
var __VLS_63;
var __VLS_59;
const __VLS_68 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    span: (6),
}));
const __VLS_70 = __VLS_69({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ class: "stat-card" },
    bordered: (false),
}));
const __VLS_74 = __VLS_73({
    ...{ class: "stat-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    title: "标签地图",
    value: (168),
    valueStyle: ({ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }),
    showGroupSeparator: true,
}));
const __VLS_78 = __VLS_77({
    title: "标签地图",
    value: (168),
    valueStyle: ({ color: 'rgb(var(--primary-6))', fontSize: '24px', fontWeight: 600 }),
    showGroupSeparator: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
{
    const { suffix: __VLS_thisSlot } = __VLS_79.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-unit" },
    });
}
var __VLS_79;
var __VLS_75;
var __VLS_71;
var __VLS_27;
const __VLS_80 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    title: "关系图",
    ...{ class: "relation-diagram-card" },
    bordered: (false),
}));
const __VLS_82 = __VLS_81({
    title: "关系图",
    ...{ class: "relation-diagram-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "placeholder-diagram" },
});
var __VLS_83;
const __VLS_84 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    gutter: ([16, 16]),
}));
const __VLS_86 = __VLS_85({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    xs: (24),
    md: (12),
}));
const __VLS_90 = __VLS_89({
    xs: (24),
    md: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    title: "主题域分布",
    ...{ class: "chart-card" },
    bordered: (false),
}));
const __VLS_94 = __VLS_93({
    title: "主题域分布",
    ...{ class: "chart-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "placeholder-chart" },
});
var __VLS_95;
var __VLS_91;
const __VLS_96 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    xs: (24),
    md: (12),
}));
const __VLS_98 = __VLS_97({
    xs: (24),
    md: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    title: "数据增长趋势",
    ...{ class: "chart-card" },
    bordered: (false),
}));
const __VLS_102 = __VLS_101({
    title: "数据增长趋势",
    ...{ class: "chart-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "placeholder-chart" },
});
var __VLS_103;
var __VLS_99;
var __VLS_87;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['asset-guide-container']} */ ;
/** @type {__VLS_StyleScopedClasses['spin-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-section']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['relation-diagram-card']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-diagram']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-chart']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            containerRef: containerRef,
            refreshData: refreshData,
            showGuide: showGuide,
            navigateTo: navigateTo,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
