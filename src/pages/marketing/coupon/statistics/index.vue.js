/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { IconArrowRise, IconArrowFall, IconDownload } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import * as echarts from 'echarts';
// 数据加载状态
const loading = ref(false);
// 时间范围选择
const timeRange = ref('week');
// 统计数据
const statisticsData = ref([
    {
        batchDate: '2024-01-01',
        sendCount: 1000,
        successCount: 850,
        successRate: 85.0
    },
    {
        batchDate: '2024-01-02',
        sendCount: 1200,
        successCount: 980,
        successRate: 81.7
    },
    {
        batchDate: '2024-01-03',
        sendCount: 800,
        successCount: 700,
        successRate: 87.5
    },
    {
        batchDate: '2024-01-04',
        sendCount: 1500,
        successCount: 1200,
        successRate: 80.0
    }
]);
// 库存管理指标
const inventoryStats = ref([
    {
        title: '库存量',
        value: 10000,
        trend: 'up',
        percentage: 10.2,
        description: '近3月内权益创建的券总库存'
    },
    {
        title: '未领取量',
        value: 3200,
        trend: 'down',
        percentage: 5.5,
        description: '状态为未领取券的总量'
    },
    {
        title: '已领取量',
        value: 4800,
        trend: 'up',
        percentage: 12.3,
        description: '当前状态为已领取券的总量'
    },
    {
        title: '已锁定量',
        value: 1200,
        trend: 'up',
        percentage: 8.1,
        description: '当前状态为已锁定券的总量'
    },
    {
        title: '已核销量',
        value: 800,
        trend: 'up',
        percentage: 6.7,
        description: '当前状态为已核销券的总量'
    },
    {
        title: '权益领取率',
        value: 68.0,
        precision: 1,
        trend: 'up',
        percentage: 3.2,
        description: '统计周期内：(已领取+已锁定+已核销)/库存量'
    },
    {
        title: '权益使用率',
        value: 41.7,
        precision: 1,
        trend: 'up',
        percentage: 2.8,
        description: '统计周期内：(已锁定 + 已核销)/已领取'
    }
]);
// 过程监控指标
const processStats = ref([
    {
        title: '领取成功率',
        value: 85.5,
        precision: 1,
        trend: 'up',
        percentage: 4.2,
        description: '统计周期内：已领取量/策略请求下发量'
    },
    {
        title: '锁定成功率',
        value: 99.99,
        precision: 2,
        trend: 'up',
        percentage: 0.01,
        description: '统计周期内：已锁定量/核心请求锁定量'
    },
    {
        title: '核销成功率',
        value: 99.99,
        precision: 2,
        trend: 'up',
        percentage: 0.01,
        description: '统计周期内：已核销量/核心请求核销量'
    }
]);
// 维度选择
const selectedDimension = ref('ma');
// 趋势图表
const trendChartRef = ref(null);
let trendChart = null;
// 类型分布图表
const typeChartRef = ref(null);
let typeChart = null;
// ==================== 预警数据 ====================
const warningData = ref([
    {
        type: '券包发放失败',
        content: '券包ID: CP20240101发放失败，请检查',
        time: '2024-01-15 10:30',
        status: '未处理'
    },
    {
        type: '券即将过期',
        content: '券ID: C20240101即将在3天后过期',
        time: '2024-01-14 15:20',
        status: '已处理'
    },
    {
        type: '券使用异常',
        content: '券ID: C20240102使用率低于5%，请关注',
        time: '2024-01-13 09:45',
        status: '未处理'
    }
]);
// ==================== 失败原因统计数据 ====================
const failureReasonData = ref([
    { value: 35, name: '用户信息不匹配' },
    { value: 25, name: '券已过期' },
    { value: 20, name: '库存不足' },
    { value: 15, name: '系统错误' },
    { value: 5, name: '其他原因' }
]);
// ==================== 领取失败原因分布 ====================
const failureDistributionData = ref([
    { value: 42, name: '用户信息不匹配' },
    { value: 28, name: '券已过期' },
    { value: 18, name: '库存不足' },
    { value: 8, name: '系统错误' },
    { value: 4, name: '其他原因' }
]);
// 初始化失败原因饼图
const failureChartRef = ref(null);
let failureChart = null;
const initFailureChart = () => {
    if (!failureChartRef.value || !failureChartRef.value.clientWidth) {
        setTimeout(initFailureChart, 100);
        return;
    }
    failureChart = echarts.init(failureChartRef.value);
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            data: failureDistributionData.value.map(item => item.name)
        },
        series: [
            {
                name: '领取失败原因',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: failureDistributionData.value
            }
        ]
    };
    failureChart.setOption(option);
};
// 获取统计数据
const handleSearch = (value) => {
    console.log('搜索值:', value);
    // 这里可以添加实际的搜索逻辑
    fetchStatisticsData();
};
const fetchStatisticsData = async () => {
    loading.value = true;
    try {
        // TODO: 调用接口获取数据
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 更新图表数据
        initFailureChart();
    }
    catch (error) {
        Message.error('获取统计数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 监听时间范围变化
watch(timeRange, () => {
    fetchStatisticsData();
});
// 监听窗口大小变化，重绘图表
const handleResize = () => {
    trendChart?.resize();
    typeChart?.resize();
};
onMounted(() => {
    fetchStatisticsData();
    window.addEventListener('resize', handleResize);
    initFailureChart();
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    trendChart?.dispose();
    failureChart?.dispose();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-number']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-statistics-container" },
});
const __VLS_0 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    gutter: ([16, 16]),
}));
const __VLS_2 = __VLS_1({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    span: (24),
}));
const __VLS_6 = __VLS_5({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    title: "平台库存情况",
    loading: (__VLS_ctx.loading),
}));
const __VLS_10 = __VLS_9({
    title: "平台库存情况",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    gutter: ([16, 16]),
}));
const __VLS_14 = __VLS_13({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
for (const [stat, index] of __VLS_getVForSourceType((__VLS_ctx.inventoryStats))) {
    const __VLS_16 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        span: (6),
        key: (index),
    }));
    const __VLS_18 = __VLS_17({
        span: (6),
        key: (index),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ class: "stat-card" },
        bordered: (false),
    }));
    const __VLS_22 = __VLS_21({
        ...{ class: "stat-card" },
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.AStatistic;
    /** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: (stat.title),
        value: (stat.value),
        precision: (stat.precision || 0),
        valueStyle: ({ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '24px', fontWeight: 600 }),
    }));
    const __VLS_26 = __VLS_25({
        title: (stat.title),
        value: (stat.value),
        precision: (stat.precision || 0),
        valueStyle: ({ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '24px', fontWeight: 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_27.slots;
        if (stat.trend === 'up') {
            const __VLS_28 = {}.IconArrowRise;
            /** @type {[typeof __VLS_components.IconArrowRise, typeof __VLS_components.iconArrowRise, ]} */ ;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                ...{ style: ({ color: '#00B42A', fontSize: '20px' }) },
            }));
            const __VLS_30 = __VLS_29({
                ...{ style: ({ color: '#00B42A', fontSize: '20px' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        }
        else {
            const __VLS_32 = {}.IconArrowFall;
            /** @type {[typeof __VLS_components.IconArrowFall, typeof __VLS_components.iconArrowFall, ]} */ ;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                ...{ style: ({ color: '#F53F3F', fontSize: '20px' }) },
            }));
            const __VLS_34 = __VLS_33({
                ...{ style: ({ color: '#F53F3F', fontSize: '20px' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        }
    }
    {
        const { suffix: __VLS_thisSlot } = __VLS_27.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "trend-text" },
            ...{ style: ({ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '14px' }) },
        });
        (stat.percentage);
    }
    var __VLS_27;
    var __VLS_23;
    var __VLS_19;
}
var __VLS_15;
var __VLS_11;
var __VLS_7;
const __VLS_36 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    span: (24),
}));
const __VLS_38 = __VLS_37({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    title: "过程指标监控",
    loading: (__VLS_ctx.loading),
}));
const __VLS_42 = __VLS_41({
    title: "过程指标监控",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    gutter: ([16, 16]),
}));
const __VLS_46 = __VLS_45({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
for (const [stat, index] of __VLS_getVForSourceType((__VLS_ctx.processStats))) {
    const __VLS_48 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        span: (8),
        key: (index),
    }));
    const __VLS_50 = __VLS_49({
        span: (8),
        key: (index),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ class: "stat-card" },
        bordered: (false),
    }));
    const __VLS_54 = __VLS_53({
        ...{ class: "stat-card" },
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    const __VLS_56 = {}.AStatistic;
    /** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        title: (stat.title),
        value: (stat.value),
        precision: (stat.precision || 0),
        valueStyle: ({ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '24px', fontWeight: 600 }),
    }));
    const __VLS_58 = __VLS_57({
        title: (stat.title),
        value: (stat.value),
        precision: (stat.precision || 0),
        valueStyle: ({ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '24px', fontWeight: 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_59.slots;
        if (stat.trend === 'up') {
            const __VLS_60 = {}.IconArrowRise;
            /** @type {[typeof __VLS_components.IconArrowRise, typeof __VLS_components.iconArrowRise, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                ...{ style: ({ color: '#00B42A', fontSize: '20px' }) },
            }));
            const __VLS_62 = __VLS_61({
                ...{ style: ({ color: '#00B42A', fontSize: '20px' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        }
        else {
            const __VLS_64 = {}.IconArrowFall;
            /** @type {[typeof __VLS_components.IconArrowFall, typeof __VLS_components.iconArrowFall, ]} */ ;
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                ...{ style: ({ color: '#F53F3F', fontSize: '20px' }) },
            }));
            const __VLS_66 = __VLS_65({
                ...{ style: ({ color: '#F53F3F', fontSize: '20px' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        }
    }
    {
        const { suffix: __VLS_thisSlot } = __VLS_59.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "trend-text" },
            ...{ style: ({ color: stat.trend === 'up' ? '#00B42A' : '#F53F3F', fontSize: '14px' }) },
        });
        (stat.percentage);
    }
    var __VLS_59;
    var __VLS_55;
    var __VLS_51;
}
var __VLS_47;
var __VLS_43;
var __VLS_39;
const __VLS_68 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    span: (24),
}));
const __VLS_70 = __VLS_69({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    gutter: ([16, 16]),
}));
const __VLS_74 = __VLS_73({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    span: (12),
}));
const __VLS_78 = __VLS_77({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    title: "权益平台预警信息",
    loading: (__VLS_ctx.loading),
}));
const __VLS_82 = __VLS_81({
    title: "权益平台预警信息",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    data: (__VLS_ctx.warningData),
    pagination: (false),
    scroll: ({ y: 240 }),
}));
const __VLS_86 = __VLS_85({
    data: (__VLS_ctx.warningData),
    pagination: (false),
    scroll: ({ y: 240 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_87.slots;
    const __VLS_88 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        title: "预警类型",
        dataIndex: "type",
    }));
    const __VLS_90 = __VLS_89({
        title: "预警类型",
        dataIndex: "type",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const __VLS_92 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        title: "预警内容",
        dataIndex: "content",
    }));
    const __VLS_94 = __VLS_93({
        title: "预警内容",
        dataIndex: "content",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    const __VLS_96 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        title: "预警时间",
        dataIndex: "time",
    }));
    const __VLS_98 = __VLS_97({
        title: "预警时间",
        dataIndex: "time",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    const __VLS_100 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        title: "状态",
        dataIndex: "status",
    }));
    const __VLS_102 = __VLS_101({
        title: "状态",
        dataIndex: "status",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_103.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_104 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            color: (record.status === '已处理' ? 'green' : 'red'),
        }));
        const __VLS_106 = __VLS_105({
            color: (record.status === '已处理' ? 'green' : 'red'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        __VLS_107.slots.default;
        (record.status);
        var __VLS_107;
    }
    var __VLS_103;
}
var __VLS_87;
var __VLS_83;
var __VLS_79;
const __VLS_108 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    span: (12),
}));
const __VLS_110 = __VLS_109({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    title: "领取失败原因分析",
    loading: (__VLS_ctx.loading),
}));
const __VLS_114 = __VLS_113({
    title: "领取失败原因分析",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "failureChartRef",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.failureChartRef} */ ;
var __VLS_115;
var __VLS_111;
var __VLS_75;
var __VLS_71;
const __VLS_116 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    span: (24),
}));
const __VLS_118 = __VLS_117({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    title: "数据统计明细",
    loading: (__VLS_ctx.loading),
    ...{ class: "data-table-card" },
}));
const __VLS_122 = __VLS_121({
    title: "数据统计明细",
    loading: (__VLS_ctx.loading),
    ...{ class: "data-table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_123.slots;
    const __VLS_124 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({}));
    const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    const __VLS_128 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        ...{ 'onSearch': {} },
        placeholder: "搜索批次日期",
        ...{ style: {} },
        allowClear: true,
    }));
    const __VLS_130 = __VLS_129({
        ...{ 'onSearch': {} },
        placeholder: "搜索批次日期",
        ...{ style: {} },
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    let __VLS_132;
    let __VLS_133;
    let __VLS_134;
    const __VLS_135 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    var __VLS_131;
    const __VLS_136 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        type: "text",
    }));
    const __VLS_138 = __VLS_137({
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_139.slots;
        const __VLS_140 = {}.IconDownload;
        /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
        const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
    }
    var __VLS_139;
    var __VLS_127;
}
const __VLS_144 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    data: (__VLS_ctx.statisticsData),
    pagination: ({
        pageSize: 10,
        showTotal: true,
        showJumper: true,
        showPageSize: true
    }),
    bordered: (false),
    stripe: true,
}));
const __VLS_146 = __VLS_145({
    data: (__VLS_ctx.statisticsData),
    pagination: ({
        pageSize: 10,
        showTotal: true,
        showJumper: true,
        showPageSize: true
    }),
    bordered: (false),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_147.slots;
    const __VLS_148 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        title: "批次日期",
        dataIndex: "batchDate",
        align: "center",
    }));
    const __VLS_150 = __VLS_149({
        title: "批次日期",
        dataIndex: "batchDate",
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    const __VLS_152 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        title: "下发量",
        dataIndex: "sendCount",
        align: "right",
    }));
    const __VLS_154 = __VLS_153({
        title: "下发量",
        dataIndex: "sendCount",
        align: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    __VLS_155.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_155.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "highlight-text" },
        });
        (record.sendCount.toLocaleString());
    }
    var __VLS_155;
    const __VLS_156 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        title: "下发成功量",
        dataIndex: "successCount",
        align: "right",
    }));
    const __VLS_158 = __VLS_157({
        title: "下发成功量",
        dataIndex: "successCount",
        align: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_159.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "highlight-text" },
        });
        (record.successCount.toLocaleString());
    }
    var __VLS_159;
    const __VLS_160 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        title: "下发成功率",
        dataIndex: "successRate",
        align: "right",
    }));
    const __VLS_162 = __VLS_161({
        title: "下发成功率",
        dataIndex: "successRate",
        align: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_163.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_164 = {}.ABadge;
        /** @type {[typeof __VLS_components.ABadge, typeof __VLS_components.aBadge, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
            color: (record.successRate >= 80 ? '#00B42A' : record.successRate >= 60 ? '#FF7D00' : '#F53F3F'),
            text: (record.successRate.toFixed(1) + '%'),
        }));
        const __VLS_166 = __VLS_165({
            color: (record.successRate >= 80 ? '#00B42A' : record.successRate >= 60 ? '#FF7D00' : '#F53F3F'),
            text: (record.successRate.toFixed(1) + '%'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    }
    var __VLS_163;
}
var __VLS_147;
var __VLS_123;
var __VLS_119;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['coupon-statistics-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-text']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-text']} */ ;
/** @type {__VLS_StyleScopedClasses['data-table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-text']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconArrowRise: IconArrowRise,
            IconArrowFall: IconArrowFall,
            IconDownload: IconDownload,
            loading: loading,
            statisticsData: statisticsData,
            inventoryStats: inventoryStats,
            processStats: processStats,
            warningData: warningData,
            failureChartRef: failureChartRef,
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
