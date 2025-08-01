/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconArrowLeft, IconEye } from '@arco-design/web-vue/es/icon';
import * as echarts from 'echarts';
// 路由相关
const router = useRouter();
const route = useRoute();
// 页面状态
const loading = ref(false);
const eventName = ref(route.query.eventName || '未知事件');
const eventId = ref(route.query.eventId || '');
const chartContainer = ref(null);
const messageModalVisible = ref(false);
// 搜索表单
const searchForm = reactive({
    userId: '',
    timeRange: []
});
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0
});
// 表格数据
const tableData = ref([]);
// 当前查看的报文
const currentMessage = ref({});
// 图表实例
let chartInstance = null;
// 模拟数据生成
const generateSampleData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 50; i++) {
        const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        data.push({
            id: `EVT${Math.random().toString(36).substr(2, 9)}`,
            eventId: eventId.value,
            userId: `USER${Math.random().toString(36).substr(2, 6)}`,
            timestamp: timestamp.toISOString().replace('T', ' ').substr(0, 19),
            eventType: ['登录', '购买', '浏览', '收藏', '分享'][Math.floor(Math.random() * 5)],
            status: ['成功', '失败'][Math.floor(Math.random() * 2)],
            rawData: {
                eventId: eventId.value,
                userId: `USER${Math.random().toString(36).substr(2, 6)}`,
                timestamp: timestamp.toISOString(),
                eventType: 'user_action',
                properties: {
                    action: ['login', 'purchase', 'browse', 'favorite', 'share'][Math.floor(Math.random() * 5)],
                    platform: ['web', 'mobile', 'app'][Math.floor(Math.random() * 3)],
                    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    sessionId: Math.random().toString(36).substr(2, 16),
                    referrer: 'https://example.com',
                    customData: {
                        productId: Math.random().toString(36).substr(2, 8),
                        category: 'electronics',
                        price: Math.floor(Math.random() * 1000) + 100
                    }
                }
            }
        });
    }
    return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
// 生成时间统计数据
const generateTimeStats = () => {
    const hours = [];
    const counts = [];
    for (let i = 0; i < 24; i++) {
        hours.push(`${i.toString().padStart(2, '0')}:00`);
        counts.push(Math.floor(Math.random() * 100) + 10);
    }
    return { hours, counts };
};
// 初始化图表
const initChart = () => {
    if (!chartContainer.value)
        return;
    chartInstance = echarts.init(chartContainer.value);
    const { hours, counts } = generateTimeStats();
    const option = {
        title: {
            text: '24小时事件发生次数统计',
            left: 'center',
            textStyle: {
                fontSize: 14
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: hours,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '事件次数'
        },
        series: [{
                name: '事件次数',
                type: 'line',
                smooth: true,
                data: counts,
                itemStyle: {
                    color: '#165dff'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                                offset: 0, color: 'rgba(22, 93, 255, 0.3)'
                            }, {
                                offset: 1, color: 'rgba(22, 93, 255, 0.1)'
                            }]
                    }
                }
            }]
    };
    chartInstance.setOption(option);
    // 响应式调整
    window.addEventListener('resize', () => {
        chartInstance?.resize();
    });
};
// 获取数据
const fetchData = async () => {
    loading.value = true;
    try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        let data = generateSampleData();
        // 根据搜索条件过滤
        if (searchForm.userId) {
            data = data.filter(item => item.userId.includes(searchForm.userId));
        }
        if (searchForm.timeRange && searchForm.timeRange.length === 2) {
            const [startTime, endTime] = searchForm.timeRange;
            data = data.filter(item => {
                const itemTime = new Date(item.timestamp);
                return itemTime >= startTime && itemTime <= endTime;
            });
        }
        // 分页处理
        pagination.total = data.length;
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        tableData.value = data.slice(start, end);
    }
    catch (error) {
        Message.error('获取数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 搜索处理
const handleSearch = () => {
    pagination.current = 1;
    fetchData();
};
// 重置搜索
const resetSearch = () => {
    searchForm.userId = '';
    searchForm.timeRange = [];
    pagination.current = 1;
    fetchData();
};
// 分页处理
const onPageChange = (page) => {
    pagination.current = page;
    fetchData();
};
const onPageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchData();
};
// 查看报文
const viewMessage = (record) => {
    currentMessage.value = record;
    messageModalVisible.value = true;
};
// 格式化JSON
const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
};
// 获取状态颜色
const getStatusColor = (status) => {
    return status === '成功' ? 'green' : 'red';
};
// 返回上一页
const goBack = () => {
    router.go(-1);
};
// 页面初始化
onMounted(async () => {
    await fetchData();
    await nextTick();
    initChart();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['json-content']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "event-sample-stats" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
(__VLS_ctx.eventName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.goBack)
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.IconArrowLeft;
    /** @type {[typeof __VLS_components.IconArrowLeft, typeof __VLS_components.iconArrowLeft, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
const __VLS_12 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ class: "content-card" },
    bordered: (false),
}));
const __VLS_14 = __VLS_13({
    ...{ class: "content-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_16 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    gutter: (16),
}));
const __VLS_18 = __VLS_17({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    span: (8),
}));
const __VLS_22 = __VLS_21({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onPressEnter': {} },
    modelValue: (__VLS_ctx.searchForm.userId),
    placeholder: "请输入用户唯一标识",
    allowClear: true,
}));
const __VLS_26 = __VLS_25({
    ...{ 'onPressEnter': {} },
    modelValue: (__VLS_ctx.searchForm.userId),
    placeholder: "请输入用户唯一标识",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onPressEnter: (__VLS_ctx.handleSearch)
};
__VLS_27.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_32 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ style: {} },
    }));
    const __VLS_34 = __VLS_33({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
var __VLS_27;
var __VLS_23;
const __VLS_36 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    span: (8),
}));
const __VLS_38 = __VLS_37({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ARangePicker;
/** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.searchForm.timeRange),
    showTime: true,
    format: "YYYY-MM-DD HH:mm:ss",
    placeholder: (['开始时间', '结束时间']),
    ...{ style: {} },
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.searchForm.timeRange),
    showTime: true,
    format: "YYYY-MM-DD HH:mm:ss",
    placeholder: (['开始时间', '结束时间']),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_39;
const __VLS_44 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    span: (8),
}));
const __VLS_46 = __VLS_45({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_55.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_55.slots;
    const __VLS_60 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
}
var __VLS_55;
const __VLS_64 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onClick': {} },
}));
const __VLS_66 = __VLS_65({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onClick: (__VLS_ctx.resetSearch)
};
__VLS_67.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_67.slots;
    const __VLS_72 = {}.IconRefresh;
    /** @type {[typeof __VLS_components.IconRefresh, typeof __VLS_components.iconRefresh, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
    const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
}
var __VLS_67;
var __VLS_51;
var __VLS_47;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stats-section" },
});
const __VLS_76 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    title: "分时段统计",
    size: "small",
    ...{ class: "chart-card" },
}));
const __VLS_78 = __VLS_77({
    title: "分时段统计",
    size: "small",
    ...{ class: "chart-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "chartContainer",
    ...{ class: "chart-container" },
});
/** @type {typeof __VLS_ctx.chartContainer} */ ;
var __VLS_79;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-section" },
});
const __VLS_80 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    title: "事件详情",
    size: "small",
}));
const __VLS_82 = __VLS_81({
    title: "事件详情",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: ({
        ...__VLS_ctx.pagination,
        showTotal: true,
        showPageSize: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        size: 'small'
    }),
    size: "small",
    scroll: ({ x: 1000 }),
}));
const __VLS_86 = __VLS_85({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: ({
        ...__VLS_ctx.pagination,
        showTotal: true,
        showPageSize: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        size: 'small'
    }),
    size: "small",
    scroll: ({ x: 1000 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_92 = {
    onPageSizeChange: (__VLS_ctx.onPageSizeChange)
};
__VLS_87.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_87.slots;
    const __VLS_93 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        title: "时间",
        dataIndex: "timestamp",
        width: (160),
    }));
    const __VLS_95 = __VLS_94({
        title: "时间",
        dataIndex: "timestamp",
        width: (160),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    __VLS_96.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_96.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.timestamp);
    }
    var __VLS_96;
    const __VLS_97 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
        title: "用户ID",
        dataIndex: "userId",
        width: (120),
    }));
    const __VLS_99 = __VLS_98({
        title: "用户ID",
        dataIndex: "userId",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    __VLS_100.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_100.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_101 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
            color: "blue",
            size: "small",
        }));
        const __VLS_103 = __VLS_102({
            color: "blue",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        __VLS_104.slots.default;
        (record.userId);
        var __VLS_104;
    }
    var __VLS_100;
    const __VLS_105 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        title: "事件类型",
        dataIndex: "eventType",
        width: (100),
    }));
    const __VLS_107 = __VLS_106({
        title: "事件类型",
        dataIndex: "eventType",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    __VLS_108.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_108.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_109 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
            size: "small",
        }));
        const __VLS_111 = __VLS_110({
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        __VLS_112.slots.default;
        (record.eventType);
        var __VLS_112;
    }
    var __VLS_108;
    const __VLS_113 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        title: "状态",
        dataIndex: "status",
        width: (80),
    }));
    const __VLS_115 = __VLS_114({
        title: "状态",
        dataIndex: "status",
        width: (80),
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    __VLS_116.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_116.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_117 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
            color: (__VLS_ctx.getStatusColor(record.status)),
            size: "small",
        }));
        const __VLS_119 = __VLS_118({
            color: (__VLS_ctx.getStatusColor(record.status)),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        __VLS_120.slots.default;
        (record.status);
        var __VLS_120;
    }
    var __VLS_116;
    const __VLS_121 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        title: "操作",
        width: (100),
        fixed: "right",
    }));
    const __VLS_123 = __VLS_122({
        title: "操作",
        width: (100),
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    __VLS_124.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_124.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_125 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_127 = __VLS_126({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        let __VLS_129;
        let __VLS_130;
        let __VLS_131;
        const __VLS_132 = {
            onClick: (...[$event]) => {
                __VLS_ctx.viewMessage(record);
            }
        };
        __VLS_128.slots.default;
        const __VLS_133 = {}.IconEye;
        /** @type {[typeof __VLS_components.IconEye, typeof __VLS_components.iconEye, ]} */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({}));
        const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
        var __VLS_128;
    }
    var __VLS_124;
}
var __VLS_87;
var __VLS_83;
var __VLS_15;
const __VLS_137 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    visible: (__VLS_ctx.messageModalVisible),
    title: "完整报文",
    width: "800px",
    footer: (false),
}));
const __VLS_139 = __VLS_138({
    visible: (__VLS_ctx.messageModalVisible),
    title: "完整报文",
    width: "800px",
    footer: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "message-content" },
});
const __VLS_141 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    column: (1),
    bordered: true,
    size: "small",
}));
const __VLS_143 = __VLS_142({
    column: (1),
    bordered: true,
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
const __VLS_145 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    label: "事件ID",
}));
const __VLS_147 = __VLS_146({
    label: "事件ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
(__VLS_ctx.currentMessage.eventId);
var __VLS_148;
const __VLS_149 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    label: "用户ID",
}));
const __VLS_151 = __VLS_150({
    label: "用户ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
(__VLS_ctx.currentMessage.userId);
var __VLS_152;
const __VLS_153 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    label: "时间戳",
}));
const __VLS_155 = __VLS_154({
    label: "时间戳",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_156.slots.default;
(__VLS_ctx.currentMessage.timestamp);
var __VLS_156;
const __VLS_157 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    label: "事件类型",
}));
const __VLS_159 = __VLS_158({
    label: "事件类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
__VLS_160.slots.default;
(__VLS_ctx.currentMessage.eventType);
var __VLS_160;
var __VLS_144;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "json-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
    ...{ class: "json-viewer" },
});
(__VLS_ctx.formatJson(__VLS_ctx.currentMessage.rawData));
var __VLS_140;
/** @type {__VLS_StyleScopedClasses['event-sample-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['json-content']} */ ;
/** @type {__VLS_StyleScopedClasses['json-viewer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            IconRefresh: IconRefresh,
            IconArrowLeft: IconArrowLeft,
            IconEye: IconEye,
            loading: loading,
            eventName: eventName,
            chartContainer: chartContainer,
            messageModalVisible: messageModalVisible,
            searchForm: searchForm,
            pagination: pagination,
            tableData: tableData,
            currentMessage: currentMessage,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
            viewMessage: viewMessage,
            formatJson: formatJson,
            getStatusColor: getStatusColor,
            goBack: goBack,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
