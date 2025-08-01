/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, watch } from 'vue';
const props = defineProps({
    history: {
        type: Array,
        default: () => []
    }
});
// 定义表格列配置
const columns = [
    {
        title: '客户号',
        dataIndex: 'customerNo'
    },
    {
        title: '调整日期',
        dataIndex: 'adjustDate'
    },
    {
        title: '调整前额度',
        dataIndex: 'beforeAmount',
        render: ({ record }) => (record.beforeAmount || 0).toFixed(2)
    },
    {
        title: '调整后额度',
        dataIndex: 'afterAmount',
        render: ({ record }) => (record.afterAmount || 0).toFixed(2)
    },
    {
        title: '调整原因',
        dataIndex: 'adjustReason'
    },
    {
        title: '调整前利率',
        dataIndex: 'beforeRate',
        render: ({ record }) => (record.beforeRate || 0).toFixed(2)
    },
    {
        title: '调整后利率',
        dataIndex: 'afterRate',
        render: ({ record }) => (record.afterRate || 0).toFixed(2)
    },
    {
        title: '调整前期限',
        dataIndex: 'beforePeriod'
    },
    {
        title: '调整后期限',
        dataIndex: 'afterPeriod'
    },
    {
        title: '操作人',
        dataIndex: 'operator'
    },
    {
        title: '结果',
        dataIndex: 'result'
    }
];
// 监听props变化
watch(() => props.history, (newVal) => {
    // 可以在这里添加必要的业务逻辑
}, { immediate: true, deep: true });
onMounted(() => {
    console.debug('[AdjustmentHistory] 组件挂载完成，初始数据:', {
        timestamp: Date.now(),
        hasHistory: !!props.history,
        historyCount: props.history?.length
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "adjustment-history" },
});
if (!__VLS_ctx.history || __VLS_ctx.history.length === 0) {
    const __VLS_0 = {}.AEmpty;
    /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        description: "暂无调整记录",
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无调整记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    const __VLS_4 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        data: (__VLS_ctx.history),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        size: "small",
        bordered: (true),
    }));
    const __VLS_6 = __VLS_5({
        data: (__VLS_ctx.history),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        size: "small",
        bordered: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
/** @type {__VLS_StyleScopedClasses['adjustment-history']} */ ;
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
