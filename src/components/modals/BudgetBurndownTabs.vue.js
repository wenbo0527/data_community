import { ref, onMounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
const props = defineProps({
    chartData: { type: Array, default: () => [] }
});
const emit = defineEmits();
// 图表类型：燃尽图或累积消耗图
const chartType = ref('burndown');
// 时间粒度：月度、季度、年度
const activeTab = ref('month');
const burndownChartRef = ref();
let burndownChart = null;
// 根据图表类型动态计算标题
const chartTitle = computed(() => {
    return chartType.value === 'burndown' ? '预算燃尽图' : '预算累积消耗图';
});
// 处理图表类型切换
const handleChartTypeChange = () => {
    emit('chart-type-change', chartType.value);
    updateChartWithCurrentData();
};
// 处理时间粒度切换
const handleTabChange = (tabKey) => {
    updateChartWithCurrentData();
};
// 根据当前选择更新图表数据
const updateChartWithCurrentData = () => {
    // 如果数据中没有granularity字段，直接使用所有数据
    const filteredData = props.chartData.length > 0 && props.chartData[0].granularity
        ? props.chartData.filter(item => item.granularity === activeTab.value)
        : props.chartData;
    console.log('过滤后的数据:', filteredData);
    // 根据图表类型处理数据
    if (chartType.value === 'burndown') {
        // 燃尽图：直接使用原始数据
        console.log('更新燃尽图:', filteredData, chartType.value);
        updateChart(filteredData, chartType.value);
    }
    else {
        // 累积消耗图：计算每月消耗量
        const cumulativeData = calculateCumulativeData(filteredData);
        console.log('更新累积图:', cumulativeData, chartType.value);
        updateChart(cumulativeData, chartType.value);
    }
};
// 计算累积消耗数据
const calculateCumulativeData = (data) => {
    if (!data || data.length === 0)
        return [];
    return data.map(item => {
        // 如果mock数据中已经包含累积消耗数据，直接使用
        if (item.cumulativeBudget !== undefined && item.cumulativeActual !== undefined) {
            return {
                ...item,
                budget: item.cumulativeBudget,
                actual: item.cumulativeActual
            };
        }
        // 兼容旧数据格式，手动计算累积消耗
        const initialBudget = item.initialBudget || data[0].budget;
        return {
            ...item,
            budget: initialBudget - item.budget, // 累积消耗 = 初始预算 - 剩余预算
            actual: initialBudget - item.actual // 累积实际消耗 = 初始预算 - 实际剩余
        };
    });
};
// 更新图表
const updateChart = (data, type) => {
    console.log('updateChart被调用:', {
        hasChartRef: !!burndownChartRef.value,
        hasChartInstance: !!burndownChart,
        dataLength: data?.length || 0,
        chartType: type,
        data,
        sampleData: data?.[0],
        xAxisData: data?.map(item => item.month || item.period),
        budgetData: data?.map(item => item.budget),
        actualData: data?.map(item => item.actual),
        budgetDataConverted: data?.map(item => (item.budget / 10000).toFixed(2)),
        actualDataConverted: data?.map(item => (item.actual / 10000).toFixed(2))
    });
    if (!burndownChartRef.value || !burndownChart || !data?.length) {
        console.log('updateChart跳过:', {
            hasChartRef: !!burndownChartRef.value,
            hasChartInstance: !!burndownChart,
            dataLength: data?.length || 0
        });
        return;
    }
    const chartDom = burndownChartRef.value;
    const rect = chartDom.getBoundingClientRect();
    console.log('图表容器尺寸:', { width: rect.width, height: rect.height });
    // 基础配置
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            },
            formatter: function (params) {
                let result = params[0].name + '<br/>';
                params.forEach((param) => {
                    const value = typeof param.value === 'number' ? param.value.toFixed(2) : param.value;
                    result += param.marker + param.seriesName + ': ' + value + ' 万元<br/>';
                });
                return result;
            }
        },
        legend: {
            data: type === 'cumulative' ? ['累积预算消耗', '累积实际消耗'] : ['预算剩余', '实际剩余'],
            top: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.map(item => item.month || item.period)
        },
        yAxis: {
            type: 'value',
            name: '金额(万元)',
            axisLabel: {
                formatter: '{value}'
            }
        }
    };
    // 根据图表类型设置不同的系列数据
    if (type === 'cumulative') {
        // 累积消耗图
        option.series = [
            {
                name: '累积预算消耗',
                type: 'line',
                stack: 'Total',
                data: data.map(item => parseFloat((item.budget / 10000).toFixed(2))),
                itemStyle: { color: '#1890ff' },
                areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
            },
            {
                name: '累积实际消耗',
                type: 'line',
                stack: 'Total',
                data: data.map(item => parseFloat((item.actual / 10000).toFixed(2))),
                itemStyle: { color: '#52c41a' },
                areaStyle: { color: 'rgba(82, 196, 26, 0.1)' }
            }
        ];
    }
    else {
        // 燃尽图
        option.series = [
            {
                name: '预算剩余',
                type: 'line',
                data: data.map(item => parseFloat((item.budget / 10000).toFixed(2))),
                itemStyle: { color: '#1890ff' },
                areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
            },
            {
                name: '实际剩余',
                type: 'line',
                data: data.map(item => parseFloat((item.actual / 10000).toFixed(2))),
                itemStyle: { color: '#52c41a' },
                areaStyle: { color: 'rgba(82, 196, 26, 0.1)' }
            }
        ];
    }
    console.log('设置ECharts配置:', option);
    console.log('详细配置信息:', {
        xAxisData: option.xAxis.data,
        seriesCount: option.series.length,
        series0Data: option.series[0]?.data,
        series1Data: option.series[1]?.data,
        chartInstance: !!burndownChart,
        containerElement: burndownChartRef.value
    });
    burndownChart.setOption(option, true); // 强制重绘
    burndownChart.resize(); // 调整大小
    // 检查图表是否成功渲染
    setTimeout(() => {
        const canvas = burndownChartRef.value?.querySelector('canvas');
        console.log('图表渲染检查:', {
            hasCanvas: !!canvas,
            canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
            chartOption: burndownChart?.getOption(),
            isDisposed: burndownChart?.isDisposed()
        });
    }, 100);
    console.log('ECharts配置设置完成，已强制重绘和调整大小');
};
// 监听数据变化
watch(() => props.chartData, (newData) => {
    console.log('props.chartData变化，新数据长度:', newData.length);
    if (burndownChart) {
        updateChartWithCurrentData();
    }
}, { immediate: true });
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
    // 初始化图表数据
    updateChartWithCurrentData();
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
    title: (__VLS_ctx.chartTitle),
}));
const __VLS_2 = __VLS_1({
    title: (__VLS_ctx.chartTitle),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_5 = {}.ARadioGroup;
    /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.chartType),
        size: "small",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.chartType),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_9;
    let __VLS_10;
    let __VLS_11;
    const __VLS_12 = {
        onChange: (__VLS_ctx.handleChartTypeChange)
    };
    __VLS_8.slots.default;
    const __VLS_13 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        value: "burndown",
    }));
    const __VLS_15 = __VLS_14({
        value: "burndown",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_16.slots.default;
    var __VLS_16;
    const __VLS_17 = {}.ARadio;
    /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        value: "cumulative",
    }));
    const __VLS_19 = __VLS_18({
        value: "cumulative",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    var __VLS_20;
    var __VLS_8;
}
const __VLS_21 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onChange': {} },
    value: (__VLS_ctx.activeTab),
}));
const __VLS_23 = __VLS_22({
    ...{ 'onChange': {} },
    value: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onChange: (__VLS_ctx.handleTabChange)
};
__VLS_24.slots.default;
const __VLS_29 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    key: "month",
    tab: "月度",
}));
const __VLS_31 = __VLS_30({
    key: "month",
    tab: "月度",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const __VLS_33 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    key: "quarter",
    tab: "季度",
}));
const __VLS_35 = __VLS_34({
    key: "quarter",
    tab: "季度",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    key: "year",
    tab: "年度",
}));
const __VLS_39 = __VLS_38({
    key: "year",
    tab: "年度",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
var __VLS_24;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ref: "burndownChartRef",
    ...{ class: "chart-container" },
});
/** @type {typeof __VLS_ctx.burndownChartRef} */ ;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            chartType: chartType,
            activeTab: activeTab,
            burndownChartRef: burndownChartRef,
            chartTitle: chartTitle,
            handleChartTypeChange: handleChartTypeChange,
            handleTabChange: handleTabChange,
        };
    },
    __typeEmits: {},
    props: {
        chartData: { type: Array, default: () => [] }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    props: {
        chartData: { type: Array, default: () => [] }
    },
});
; /* PartiallyEnd: #4569/main.vue */
