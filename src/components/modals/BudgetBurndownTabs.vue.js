/// <reference types="../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
const props = defineProps({
    chartData: { type: Array, required: true },
    updateChart: { type: Function, required: true }
});
const activeTab = ref('month');
const burndownChartRef = ref();
let burndownChart = null;
const handleTabChange = (tabKey) => {
    // 根据tab切换更新图表数据
    props.updateChart(props.chartData.filter(item => item.granularity === tabKey));
};
onMounted(() => {
    console.log('初始化ECharts实例，数据长度:', props.chartData.length);
    burndownChart = echarts.init(burndownChartRef.value, undefined, {
        useCoarsePointer: true,
        pointerSize: 3,
        renderer: 'canvas',
        eventProcessors: {
            touch: { passive: true },
            mouse: { passive: true }
        }
    });
    const initialData = props.chartData.filter(item => item.granularity === 'month');
    console.log('过滤后的初始数据:', JSON.parse(JSON.stringify(initialData)));
    props.updateChart(initialData);
    watch(() => props.chartData, (newData) => {
        console.log('接收到新数据集，总条数:', newData.length);
        const filteredData = newData.filter(item => item.granularity === activeTab.value);
        console.log('当前激活标签:', activeTab.value, '过滤后数据:', filteredData);
        props.updateChart(filteredData);
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "预算Burn-down图",
}));
const __VLS_2 = __VLS_1({
    title: "预算Burn-down图",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ 'onChange': {} },
    value: (__VLS_ctx.activeTab),
}));
const __VLS_7 = __VLS_6({
    ...{ 'onChange': {} },
    value: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_9;
let __VLS_10;
let __VLS_11;
const __VLS_12 = {
    onChange: (__VLS_ctx.handleTabChange)
};
__VLS_8.slots.default;
const __VLS_13 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    key: "month",
    tab: "月度",
}));
const __VLS_15 = __VLS_14({
    key: "month",
    tab: "月度",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ref: "burndownChartRef",
    ...{ class: "chart-container" },
});
/** @type {typeof __VLS_ctx.burndownChartRef} */ ;
var __VLS_16;
const __VLS_17 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    key: "quarter",
    tab: "季度",
}));
const __VLS_19 = __VLS_18({
    key: "quarter",
    tab: "季度",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ref: "burndownChartRef",
    ...{ class: "chart-container" },
});
/** @type {typeof __VLS_ctx.burndownChartRef} */ ;
var __VLS_20;
const __VLS_21 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    key: "year",
    tab: "年度",
}));
const __VLS_23 = __VLS_22({
    key: "year",
    tab: "年度",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ref: "burndownChartRef",
    ...{ class: "chart-container" },
});
/** @type {typeof __VLS_ctx.burndownChartRef} */ ;
var __VLS_24;
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeTab: activeTab,
            burndownChartRef: burndownChartRef,
            handleTabChange: handleTabChange,
        };
    },
    props: {
        chartData: { type: Array, required: true },
        updateChart: { type: Function, required: true }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        chartData: { type: Array, required: true },
        updateChart: { type: Function, required: true }
    },
});
; /* PartiallyEnd: #4569/main.vue */
