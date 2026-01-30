import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconUpload, IconDownload } from '@arco-design/web-vue/es/icon';
import { generateWarningData } from '@/mock/external-data';
// 数据列表
const budgetList = ref([]);
const loading = ref(false);
// 分页配置
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10
});
// 格式化金额
const formatAmount = (value) => {
    return value?.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) || '-';
};
// 格式化百分比
const formatPercent = (value) => {
    return value ? `${(value * 100).toFixed(2)}%` : '-';
};
// 处理文件上传
const handleUpload = (options) => {
    Message.success('上传弹窗已显示');
    return { abort: () => { } };
};
// 下载模板
const downloadTemplate = () => {
    // 实现模板下载逻辑
    const templateUrl = '/templates/budget-template.xlsx';
    window.open(templateUrl, '_blank');
};
// 获取预算列表
// 筛选相关状态
const selectedGranularity = ref('');
const selectedTime = ref('');
// 预算粒度筛选项
const granularityOptions = ref([
    { label: '年', value: '年' },
    { label: '季', value: '季' },
    { label: '月', value: '月' }
]);
// 处理筛选
const handleFilter = () => {
    fetchBudgetList();
};
// 重置筛选
const resetFilter = () => {
    selectedGranularity.value = '';
    selectedTime.value = '';
    fetchBudgetList();
};
const fetchBudgetList = async () => {
    loading.value = true;
    try {
        let data = generateWarningData().map(item => {
            const granularity = ['年', '季', '月'][Math.floor(Math.random() * 3)];
            let time = '';
            if (granularity === '年') {
                time = '2025';
            }
            else if (granularity === '季') {
                time = `Q${Math.floor(Math.random() * 3) + 1}`;
            }
            else {
                time = `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`;
            }
            return {
                ...item,
                budgetGranularity: granularity,
                budgetTime: time
            };
        });
        // 默认排序：按粒度(年>季>月)和时间升序
        data.sort((a, b) => {
            const granularityOrder = { '年': 1, '季': 2, '月': 3 };
            if (granularityOrder[a.budgetGranularity] !== granularityOrder[b.budgetGranularity]) {
                return granularityOrder[a.budgetGranularity] - granularityOrder[b.budgetGranularity];
            }
            return a.budgetTime.localeCompare(b.budgetTime);
        });
        // 筛选逻辑
        if (selectedGranularity.value) {
            data = data.filter(item => item.budgetGranularity === selectedGranularity.value);
        }
        if (selectedTime.value) {
            data = data.filter(item => item.budgetTime.includes(selectedTime.value));
        }
        budgetList.value = data;
        pagination.value.total = data.length;
    }
    catch (error) {
        Message.error(error.message || '获取数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 处理分页变化
const onPageChange = (page) => {
    pagination.value.current = page;
    fetchBudgetList();
};
onMounted(() => {
    fetchBudgetList();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "budget-management" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "action-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "action-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_3.slots;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_4 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    size: (16),
}));
const __VLS_6 = __VLS_5({
    size: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.selectedGranularity),
    options: (__VLS_ctx.granularityOptions),
    placeholder: "预算粒度",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.selectedGranularity),
    options: (__VLS_ctx.granularityOptions),
    placeholder: "预算粒度",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.selectedTime),
    placeholder: "时间",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.selectedTime),
    placeholder: "时间",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.handleFilter)
};
__VLS_19.slots.default;
let __VLS_19;
const __VLS_24 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.resetFilter)
};
__VLS_27.slots.default;
let __VLS_27;
let __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_32 = {}.AUpload;
/** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    customRequest: (__VLS_ctx.handleUpload),
    showFileList: (false),
    accept: ".xlsx,.xls",
}));
const __VLS_34 = __VLS_33({
    customRequest: (__VLS_ctx.handleUpload),
    showFileList: (false),
    accept: ".xlsx,.xls",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { 'upload-button': __VLS_thisSlot } = __VLS_35.slots;
    const __VLS_36 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        type: "primary",
    }));
    const __VLS_38 = __VLS_37({
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_39.slots;
        const __VLS_40 = {}.IconUpload;
        /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ 
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
    let __VLS_39;
}
let __VLS_35;
const __VLS_44 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: "download-template" },
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: "download-template" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (__VLS_ctx.downloadTemplate)
};
__VLS_47.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_47.slots;
    const __VLS_52 = {}.IconDownload;
    /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ 
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
    const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
}
let __VLS_47;
let __VLS_3;
const __VLS_56 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ class: "table-card" },
}));
const __VLS_58 = __VLS_57({
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_59.slots;
}
const __VLS_60 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onPageChange': {} },
    data: (__VLS_ctx.budgetList),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_62 = __VLS_61({
    ...{ 'onPageChange': {} },
    data: (__VLS_ctx.budgetList),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
__VLS_63.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_63.slots;
    const __VLS_68 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        title: "业务类型",
        dataIndex: "businessType",
    }));
    const __VLS_70 = __VLS_69({
        title: "业务类型",
        dataIndex: "businessType",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    const __VLS_72 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        title: "平台产品",
        dataIndex: "platform",
    }));
    const __VLS_74 = __VLS_73({
        title: "平台产品",
        dataIndex: "platform",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    const __VLS_76 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        title: "目标贷余",
        dataIndex: "targetLoan",
    }));
    const __VLS_78 = __VLS_77({
        title: "目标贷余",
        dataIndex: "targetLoan",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_79.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatAmount(record.targetLoan));
    }
    let __VLS_79;
    const __VLS_80 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        title: "预估放款",
        dataIndex: "estimatedLoan",
    }));
    const __VLS_82 = __VLS_81({
        title: "预估放款",
        dataIndex: "estimatedLoan",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_83.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatAmount(record.estimatedLoan));
    }
    let __VLS_83;
    const __VLS_84 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        title: "预估费用",
        dataIndex: "estimatedCost",
    }));
    const __VLS_86 = __VLS_85({
        title: "预估费用",
        dataIndex: "estimatedCost",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_87.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatAmount(record.estimatedCost));
    }
    let __VLS_87;
    const __VLS_88 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        title: "年化数据成本",
        dataIndex: "estimatedAnnualCost",
    }));
    const __VLS_90 = __VLS_89({
        title: "年化数据成本",
        dataIndex: "estimatedAnnualCost",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_91.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatPercent(record.estimatedAnnualCost));
    }
    let __VLS_91;
    const __VLS_92 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        title: "无风险收益",
        dataIndex: "estimatedRiskFreeReturn",
    }));
    const __VLS_94 = __VLS_93({
        title: "无风险收益",
        dataIndex: "estimatedRiskFreeReturn",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_95.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatPercent(record.estimatedRiskFreeReturn));
    }
    let __VLS_95;
    const __VLS_96 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        title: "预算粒度",
        dataIndex: "budgetGranularity",
    }));
    const __VLS_98 = __VLS_97({
        title: "预算粒度",
        dataIndex: "budgetGranularity",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_99.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (record.budgetGranularity);
    }
    let __VLS_99;
    const __VLS_100 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        title: "对应时间",
        dataIndex: "budgetTime",
    }));
    const __VLS_102 = __VLS_101({
        title: "对应时间",
        dataIndex: "budgetTime",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_103.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (record.budgetTime);
    }
    let __VLS_103;
}
let __VLS_63;
let __VLS_59;
/** @type {__VLS_StyleScopedClasses['budget-management']} */ 
/** @type {__VLS_StyleScopedClasses['action-card']} */ 
/** @type {__VLS_StyleScopedClasses['download-template']} */ 
/** @type {__VLS_StyleScopedClasses['table-card']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconDownload: IconDownload,
            budgetList: budgetList,
            loading: loading,
            pagination: pagination,
            formatAmount: formatAmount,
            formatPercent: formatPercent,
            handleUpload: handleUpload,
            downloadTemplate: downloadTemplate,
            selectedGranularity: selectedGranularity,
            selectedTime: selectedTime,
            granularityOptions: granularityOptions,
            handleFilter: handleFilter,
            resetFilter: resetFilter,
            onPageChange: onPageChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
