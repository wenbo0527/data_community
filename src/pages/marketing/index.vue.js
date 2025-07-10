/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon';
// 数据概览指标
const metrics = ref([
    {
        title: '营销投入',
        value: 156.78,
        trend: 'up',
        color: '#0fbf60',
        yoy: 15.2,
        mom: 5.8
    },
    {
        title: '转化金额',
        value: 89.45,
        trend: 'up',
        color: '#0fbf60',
        yoy: 12.3,
        mom: 4.2
    },
    {
        title: '获客成本',
        value: 234.56,
        trend: 'down',
        color: '#f53f3f',
        yoy: -8.5,
        mom: -3.2
    },
    {
        title: '投入产出比',
        value: 3.45,
        trend: 'up',
        color: '#0fbf60',
        yoy: 6.8,
        mom: 2.1
    }
]);
// 营销活动列表数据
const columns = [
    { title: '活动名称', dataIndex: 'name' },
    { title: '活动类型', dataIndex: 'type' },
    { title: '开始时间', dataIndex: 'startTime' },
    { title: '结束时间', dataIndex: 'endTime' },
    { title: '预算', dataIndex: 'budget' },
    { title: '状态', dataIndex: 'status', slotName: 'status' },
    { title: '操作', slotName: 'operations' }
];
const campaignList = ref([
    {
        id: 1,
        name: '618促销活动',
        type: '节日营销',
        startTime: '2024-06-01',
        endTime: '2024-06-18',
        budget: '100,000',
        status: '进行中'
    },
    {
        id: 2,
        name: '年末回馈',
        type: '促销活动',
        startTime: '2024-12-01',
        endTime: '2024-12-31',
        budget: '150,000',
        status: '未开始'
    },
    {
        id: 3,
        name: '新春特惠',
        type: '节日营销',
        startTime: '2024-01-15',
        endTime: '2024-02-15',
        budget: '200,000',
        status: '已结束'
    },
    {
        id: 4,
        name: '会员专享日',
        type: '会员活动',
        startTime: '2024-03-01',
        endTime: '2024-03-31',
        budget: '80,000',
        status: '进行中'
    },
    {
        id: 5,
        name: '五一特惠',
        type: '节日营销',
        startTime: '2024-04-28',
        endTime: '2024-05-05',
        budget: '120,000',
        status: '未开始'
    },
    {
        id: 6,
        name: '新品首发',
        type: '产品推广',
        startTime: '2024-04-01',
        endTime: '2024-04-15',
        budget: '90,000',
        status: '进行中'
    },
    {
        id: 7,
        name: '品牌周年庆',
        type: '品牌活动',
        startTime: '2024-07-01',
        endTime: '2024-07-07',
        budget: '300,000',
        status: '未开始'
    },
    {
        id: 8,
        name: '开学季促销',
        type: '促销活动',
        startTime: '2024-08-15',
        endTime: '2024-09-15',
        budget: '150,000',
        status: '未开始'
    }
]);
const pagination = {
    total: 8,
    current: 1,
    pageSize: 10
};
// 获取状态对应的颜色
const getStatusColor = (status) => {
    const colorMap = {
        '进行中': 'green',
        '未开始': 'blue',
        '已结束': 'gray'
    };
    return colorMap[status] || 'blue';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['card-container']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "content" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    title: "营销数据概览",
    ...{ class: "card-container" },
}));
const __VLS_11 = __VLS_10({
    title: "营销数据概览",
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    gutter: (16),
    ...{ class: "metric-cards" },
}));
const __VLS_15 = __VLS_14({
    gutter: (16),
    ...{ class: "metric-cards" },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
for (const [metric] of __VLS_getVForSourceType((__VLS_ctx.metrics))) {
    const __VLS_17 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        span: (6),
        key: (metric.title),
    }));
    const __VLS_19 = __VLS_18({
        span: (6),
        key: (metric.title),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    const __VLS_21 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        ...{ class: "metric-card" },
    }));
    const __VLS_23 = __VLS_22({
        ...{ class: "metric-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-content" },
    });
    const __VLS_25 = {}.AStatistic;
    /** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        title: (metric.title),
        value: (metric.value),
        precision: (2),
        showGroupSeparator: true,
        valueStyle: ({ color: metric.color }),
    }));
    const __VLS_27 = __VLS_26({
        title: (metric.title),
        value: (metric.value),
        precision: (2),
        showGroupSeparator: true,
        valueStyle: ({ color: metric.color }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_28.slots;
        if (metric.trend === 'up') {
            const __VLS_29 = {}.IconArrowRise;
            /** @type {[typeof __VLS_components.IconArrowRise, typeof __VLS_components.iconArrowRise, ]} */ ;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
                ...{ style: {} },
            }));
            const __VLS_31 = __VLS_30({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        }
        else {
            const __VLS_33 = {}.IconArrowFall;
            /** @type {[typeof __VLS_components.IconArrowFall, typeof __VLS_components.iconArrowFall, ]} */ ;
            // @ts-ignore
            const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
                ...{ style: {} },
            }));
            const __VLS_35 = __VLS_34({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        }
    }
    var __VLS_28;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comparison-data" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "comparison-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: ({ color: metric.yoy >= 0 ? '#0fbf60' : '#f53f3f' }) },
    });
    (metric.yoy >= 0 ? '+' : '');
    (metric.yoy);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "comparison-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: ({ color: metric.mom >= 0 ? '#0fbf60' : '#f53f3f' }) },
    });
    (metric.mom >= 0 ? '+' : '');
    (metric.mom);
    var __VLS_24;
    var __VLS_20;
}
var __VLS_16;
var __VLS_12;
const __VLS_37 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    gutter: (16),
}));
const __VLS_39 = __VLS_38({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
const __VLS_41 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    span: (12),
}));
const __VLS_43 = __VLS_42({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
const __VLS_45 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    title: "营销转化漏斗",
    ...{ class: "card-container" },
}));
const __VLS_47 = __VLS_46({
    title: "营销转化漏斗",
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-container" },
});
var __VLS_48;
var __VLS_44;
const __VLS_49 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    span: (12),
}));
const __VLS_51 = __VLS_50({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
const __VLS_53 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    title: "营销效果趋势",
    ...{ class: "card-container" },
}));
const __VLS_55 = __VLS_54({
    title: "营销效果趋势",
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-container" },
});
var __VLS_56;
var __VLS_52;
var __VLS_40;
const __VLS_57 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    title: "营销活动列表",
    ...{ class: "card-container" },
}));
const __VLS_59 = __VLS_58({
    title: "营销活动列表",
    ...{ class: "card-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
const __VLS_61 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    data: (__VLS_ctx.campaignList),
    columns: (__VLS_ctx.columns),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_63 = __VLS_62({
    data: (__VLS_ctx.campaignList),
    columns: (__VLS_ctx.columns),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
{
    const { status: __VLS_thisSlot } = __VLS_64.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_65 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_67 = __VLS_66({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    (record.status);
    var __VLS_68;
}
{
    const { operations: __VLS_thisSlot } = __VLS_64.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_69 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({}));
    const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    const __VLS_73 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        type: "text",
        size: "small",
    }));
    const __VLS_75 = __VLS_74({
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_76.slots.default;
    var __VLS_76;
    const __VLS_77 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        type: "text",
        size: "small",
    }));
    const __VLS_79 = __VLS_78({
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    __VLS_80.slots.default;
    var __VLS_80;
    var __VLS_72;
}
var __VLS_64;
var __VLS_60;
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['card-container']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-content']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-data']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-item']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-item']} */ ;
/** @type {__VLS_StyleScopedClasses['card-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['card-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['card-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconArrowRise: IconArrowRise,
            IconArrowFall: IconArrowFall,
            metrics: metrics,
            columns: columns,
            campaignList: campaignList,
            pagination: pagination,
            getStatusColor: getStatusColor,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
