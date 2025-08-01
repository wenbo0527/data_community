/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, watch } from 'vue';
const props = defineProps({
    loans: {
        type: Array,
        default: () => []
    }
});
// 定义表格列配置
const columns = [
    {
        title: '用信编号',
        dataIndex: 'loanNo'
    },
    {
        title: '用信日期',
        dataIndex: 'loanDate'
    },
    {
        title: '银行卡号',
        dataIndex: 'bankCard'
    },
    {
        title: '渠道',
        dataIndex: 'channel'
    },
    {
        title: '产品名称',
        dataIndex: 'productName'
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
        title: '合同编号',
        dataIndex: 'contractNo'
    },
    {
        title: '状态',
        dataIndex: 'status'
    },
    {
        title: '金额',
        dataIndex: 'amount',
        render: ({ record }) => (record.amount || 0).toFixed(2)
    },
    {
        title: '余额',
        dataIndex: 'balance',
        render: ({ record }) => (record.balance || 0).toFixed(2)
    },
    {
        title: '分期数',
        dataIndex: 'installments'
    },
    {
        title: '操作',
        render: () => '查看详情'
    }
];
// 监听props变化
watch(() => props.loans, (newVal) => {
    // 可以在这里添加必要的业务逻辑
}, { immediate: true, deep: true });
onMounted(() => {
    console.debug('[LoanList] 组件挂载完成，初始数据:', {
        timestamp: Date.now(),
        hasLoans: !!props.loans,
        loansCount: props.loans?.length
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loan-list" },
});
if (!__VLS_ctx.loans || __VLS_ctx.loans.length === 0) {
    const __VLS_0 = {}.AEmpty;
    /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        description: "暂无用信记录",
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无用信记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    const __VLS_4 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        data: (__VLS_ctx.loans),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        size: "small",
        bordered: (true),
    }));
    const __VLS_6 = __VLS_5({
        data: (__VLS_ctx.loans),
        columns: (__VLS_ctx.columns),
        pagination: (false),
        size: "small",
        bordered: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
/** @type {__VLS_StyleScopedClasses['loan-list']} */ ;
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
