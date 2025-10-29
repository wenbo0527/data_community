/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, watch } from 'vue';
const props = defineProps({
    credits: {
        type: Array,
        default: () => []
    }
});
// 定义表格列配置
const columns = [
    {
        title: '授信编号',
        dataIndex: 'creditNo'
    },
    {
        title: '授信日期',
        dataIndex: 'creditDate'
    },
    {
        title: '渠道',
        dataIndex: 'channel'
    },
    {
        title: '结果',
        dataIndex: 'result'
    },
    {
        title: '拒绝原因',
        dataIndex: 'rejectReason'
    },
    {
        title: '初始额度',
        dataIndex: 'initialAmount',
        render: ({ record }) => (record.initialAmount || 0).toFixed(2)
    },
    {
        title: '当前额度',
        dataIndex: 'currentAmount',
        render: ({ record }) => (record.currentAmount || 0).toFixed(2)
    },
    {
        title: '已用额度',
        dataIndex: 'usedAmount',
        render: ({ record }) => (record.usedAmount || 0).toFixed(2)
    },
    {
        title: '风险等级',
        dataIndex: 'riskLevel'
    },
    {
        title: '操作',
        render: () => '查看详情'
    }
];
// 监听props变化
watch(() => props.credits, (newVal) => {
    // 可以在这里添加必要的业务逻辑
}, { immediate: true, deep: true });
onMounted(() => {
    // 组件挂载完成
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "credit-list" },
});
if (!__VLS_ctx.credits || __VLS_ctx.credits.length === 0) {
    const __VLS_0 = {}.AEmpty;
    /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        description: "暂无授信信息",
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无授信信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    const __VLS_4 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        data: (__VLS_ctx.credits),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        size: "small",
        bordered: (true),
    }));
    const __VLS_6 = __VLS_5({
        data: (__VLS_ctx.credits),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        size: "small",
        bordered: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
/** @type {__VLS_StyleScopedClasses['credit-list']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            columns: columns,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
