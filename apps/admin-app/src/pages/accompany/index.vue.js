/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
const router = useRouter();
const loading = ref(false);
const searchText = ref('');
const columns = [
    {
        title: '计划名称',
        dataIndex: 'planName',
        slotName: 'planName'
    },
    {
        title: '数据产品',
        dataIndex: 'dataProduct'
    },
    {
        title: '信贷产品',
        dataIndex: 'creditProduct'
    },
    {
        title: '场景名称',
        dataIndex: 'sceneName'
    },
    {
        title: '启动日期',
        dataIndex: 'startDate'
    },
    {
        title: '执行批次',
        dataIndex: 'batchNo'
    },
    {
        title: '天数',
        dataIndex: 'days'
    },
    {
        title: '期数',
        dataIndex: 'periods'
    },
    {
        title: '创建人',
        dataIndex: 'creator'
    },
    {
        title: '状态',
        slotName: 'status'
    },
    {
        title: '操作',
        slotName: 'operations',
        width: 240,
        fixed: 'right'
    }
];
const tableData = ref([
    {
        planName: '信用卡陪跑计划A',
        dataProduct: '信用卡数据产品A',
        creditProduct: '信用卡产品B',
        sceneName: '授信申请场景',
        startDate: '2024-01-01',
        batchNo: '15点、21点、23点',
        days: 90,
        periods: 3,
        creator: '张三',
        status: '已启动'
    },
    {
        planName: '消费贷陪跑计划B',
        dataProduct: '消费贷数据产品C',
        creditProduct: '消费贷产品D',
        sceneName: '支用申请场景',
        startDate: '2024-02-01',
        batchNo: '15点、21点、23点',
        days: 30,
        periods: 1,
        creator: '李四',
        status: '已完成'
    }
]);
const filteredData = computed(() => {
    if (!searchText.value)
        return tableData.value;
    return tableData.value.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(searchText.value.toLowerCase())));
});
const getStatusColor = (status) => {
    const statusMap = {
        '已启动': 'green',
        '已完成': 'blue'
    };
    return statusMap[status] || 'gray';
};
const handleSearch = (value) => {
    searchText.value = value;
};
const handleCreate = () => {
    router.push('/management/accompany/create');
};
const handleViewResult = (record) => {
    router.push({
        path: '/management/accompany/result',
        query: { planName: record.planName }
    });
};
const handleRemark = (record) => {
    // TODO: 实现备注功能
    Message.info(`添加备注：${record.planName}`);
};
const handleTerminate = (record) => {
    // TODO: 实现终止功能
    Message.success(`终止计划：${record.planName}`);
    const index = tableData.value.findIndex(item => item.planName === record.planName);
    if (index !== -1) {
        tableData.value[index].status = '已完成';
    }
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ 
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "content" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    gutter: ([24, 24]),
}));
const __VLS_11 = __VLS_10({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    span: (24),
}));
const __VLS_15 = __VLS_14({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    title: "陪跑计划",
    bordered: (false),
}));
const __VLS_19 = __VLS_18({
    title: "陪跑计划",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_20.slots;
    const __VLS_21 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
    const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    const __VLS_25 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索计划",
        ...{ style: {} },
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索计划",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_29;
    let __VLS_30;
    let __VLS_31;
    const __VLS_32 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    let __VLS_28;
    const __VLS_33 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_35 = __VLS_34({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    let __VLS_37;
    let __VLS_38;
    let __VLS_39;
    const __VLS_40 = {
        onClick: (__VLS_ctx.handleCreate)
    };
    __VLS_36.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_36.slots;
        const __VLS_41 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({}));
        const __VLS_43 = __VLS_42({}, ...__VLS_functionalComponentArgsRest(__VLS_42));
    }
    let __VLS_36;
    let __VLS_24;
}
const __VLS_45 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.filteredData),
    pagination: ({ pageSize: 10 }),
    loading: (__VLS_ctx.loading),
}));
const __VLS_47 = __VLS_46({
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.filteredData),
    pagination: ({ pageSize: 10 }),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
{
    const { planId: __VLS_thisSlot } = __VLS_48.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_49 = {}.ALink;
    /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ 
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({}));
    const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    (record.planId);
    let __VLS_52;
}
{
    const { status: __VLS_thisSlot } = __VLS_48.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_53 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_55 = __VLS_54({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_56.slots.default;
    (record.status);
    let __VLS_56;
}
{
    const { operations: __VLS_thisSlot } = __VLS_48.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_57 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({}));
    const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    const __VLS_61 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_63 = __VLS_62({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_65;
    let __VLS_66;
    let __VLS_67;
    const __VLS_68 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleViewResult(record);
        }
    };
    __VLS_64.slots.default;
    let __VLS_64;
    const __VLS_69 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_71 = __VLS_70({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_73;
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleRemark(record);
        }
    };
    __VLS_72.slots.default;
    let __VLS_72;
    if (record.status === '已启动') {
        const __VLS_77 = {}.APopconfirm;
        /** @type {[typeof __VLS_components.APopconfirm, typeof __VLS_components.aPopconfirm, typeof __VLS_components.APopconfirm, typeof __VLS_components.aPopconfirm, ]} */ 
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
            ...{ 'onOk': {} },
            content: "确定要终止这个计划吗？",
        }));
        const __VLS_79 = __VLS_78({
            ...{ 'onOk': {} },
            content: "确定要终止这个计划吗？",
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        let __VLS_81;
        let __VLS_82;
        let __VLS_83;
        const __VLS_84 = {
            onOk: (...[$event]) => {
                if (!(record.status === '已启动'))
                    return;
                __VLS_ctx.handleTerminate(record);
            }
        };
        __VLS_80.slots.default;
        const __VLS_85 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_87 = __VLS_86({
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        __VLS_88.slots.default;
        let __VLS_88;
        let __VLS_80;
    }
    let __VLS_60;
}
let __VLS_48;
let __VLS_20;
let __VLS_16;
let __VLS_12;
let __VLS_8;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            loading: loading,
            searchText: searchText,
            columns: columns,
            filteredData: filteredData,
            getStatusColor: getStatusColor,
            handleSearch: handleSearch,
            handleCreate: handleCreate,
            handleViewResult: handleViewResult,
            handleRemark: handleRemark,
            handleTerminate: handleTerminate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
