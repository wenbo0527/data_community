import { ref, onMounted, reactive, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useExternalDataStore } from '@/store/modules/external-data';
import PlatformProductModal from '@/components/modals/PlatformProductModal.vue';
import BudgetBurndownTabs from '@/components/modals/BudgetBurndownTabs.vue';
import { IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon';
const store = useExternalDataStore();
const filterForm = reactive({
    businessType: '助贷业务',
    platform: '字节',
    targetLoan: undefined,
    year: new Date().getFullYear().toString(),
    granularity: 'month',
    healthStatus: [],
    dateRange: []
});
// 平台产品弹窗
const platformModalVisible = ref(false);
const currentPlatform = ref();
import { useRouter } from 'vue-router';
const router = useRouter();
// 调试信息相关状态
const showDebugInfo = ref(false);
const loadingStatus = ref('');
const apiResponse = ref(null);
const handlePlatformClick = (record) => {
    currentPlatform.value = record;
    platformModalVisible.value = true;
};
const toggleDebugInfo = () => {
    showDebugInfo.value = !showDebugInfo.value;
};
const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
// 图表引用
const burndownChartRef = ref();
let burndownChart = null;
// 预警数据
const warningData = ref([]);
// 燃尽图数据
const burndownData = ref([]);
// 当前图表类型
const currentChartType = ref('burndown');
// 数据格式化函数
const formatAmount = (value) => {
    return value?.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) || '-';
};
const formatPercent = (value) => {
    return value ? `${(value * 100).toFixed(2)}%` : '-';
};
const exportData = () => {
    // 导出数据逻辑
    console.log('导出数据功能');
};
// 图表更新逻辑已移至BudgetBurndownTabs组件内部
const updateBurndownChart = (data, type) => {
    // 此函数已废弃，图表渲染由BudgetBurndownTabs组件自行处理
    console.log('updateBurndownChart已废弃，图表由BudgetBurndownTabs组件处理');
    return;
};
// 初始化burn-down图表
const initBurndownChart = (chartType = 'burndown') => {
    if (burndownChartRef.value) {
        burndownChart = echarts.init(burndownChartRef.value);
        if (store.burndownData?.length) {
            updateBurndownChart(store.burndownData, chartType);
        }
    }
};
// 处理筛选
const handleFilter = async () => {
    const params = {
        businessType: filterForm.businessType || undefined,
        platform: filterForm.platform || undefined,
        targetLoan: filterForm.targetLoan,
        granularity: filterForm.granularity,
        startMonth: filterForm.dateRange[0] ?
            (filterForm.granularity === 'quarter' ?
                `${new Date(filterForm.dateRange[0]).getFullYear()}-Q${Math.floor(new Date(filterForm.dateRange[0]).getMonth() / 3) + 1}` :
                new Date(filterForm.dateRange[0]).toISOString().slice(0, 7)) :
            null,
        endMonth: filterForm.dateRange[1] ?
            (filterForm.granularity === 'quarter' ?
                `${new Date(filterForm.dateRange[1]).getFullYear()}-Q${Math.floor(new Date(filterForm.dateRange[1]).getMonth() / 3) + 1}` :
                filterForm.dateRange[1].toISOString().slice(0, 7)) :
            null
    };
    await Promise.all([
        store.fetchBurndownData(params),
        store.fetchWarningData(params)
    ]);
    updateBurndownChart(store.burndownData, currentChartType.value);
    warningData.value = store.warningData;
};
// 处理图表类型变化
const handleChartTypeChange = (chartType) => {
    currentChartType.value = chartType;
    if (store.burndownData?.length) {
        updateBurndownChart(store.burndownData, chartType);
    }
};
// 重置筛选
const resetFilter = () => {
    filterForm.businessType = '';
    filterForm.platform = '';
    filterForm.targetLoan = undefined;
    filterForm.dateRange = [];
    handleFilter();
};
// 监听窗口大小变化
window.addEventListener('resize', () => {
    burndownChart?.resize();
}, { passive: true });
// 配置图表事件为被动模式并初始化数据
onMounted(async () => {
    try {
        loadingStatus.value = '数据加载中...';
        console.log('开始获取数据...');
        // 先获取数据
        await Promise.all([
            store.fetchBurndownData(),
            store.fetchWarningData(),
            store.fetchTargetLoanOptions()
        ]);
        console.log('数据获取完成:', {
            burndownData: store.burndownData,
            warningData: store.warningData,
            targetLoanOptions: store.targetLoanOptions
        });
        // 设置API响应数据用于调试
        apiResponse.value = {
            burndownData: store.burndownData,
            warningData: store.warningData,
            targetLoanOptions: store.targetLoanOptions
        };
        // 更新本地数据
        burndownData.value = store.burndownData;
        warningData.value = store.warningData;
        // 确保DOM已经挂载
        await nextTick();
        // 初始化图表
        if (burndownChartRef.value) {
            // 添加被动事件监听
            const chartDom = burndownChartRef.value;
            chartDom.addEventListener('wheel', () => { }, { passive: true });
            chartDom.addEventListener('mousewheel', () => { }, { passive: true });
            // 初始化图表
            initBurndownChart();
            loadingStatus.value = '数据加载完成';
        }
    }
    catch (error) {
        console.error('初始化数据失败:', error);
        loadingStatus.value = `数据加载失败: ${error.message || '未知错误'}`;
        apiResponse.value = error.response?.data || error;
    }
    finally {
        showDebugInfo.value = true;
    }
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['comparison-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-progress']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "external-data-monitor" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "filter-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "filter-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
}));
const __VLS_6 = __VLS_5({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    field: "businessType",
    label: "业务类型",
}));
const __VLS_10 = __VLS_9({
    field: "businessType",
    label: "业务类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.filterForm.businessType),
    placeholder: "请选择业务类型",
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.filterForm.businessType),
    placeholder: "请选择业务类型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    value: "助贷业务",
}));
const __VLS_18 = __VLS_17({
    value: "助贷业务",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
var __VLS_19;
const __VLS_20 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    value: "融担类业务",
}));
const __VLS_22 = __VLS_21({
    value: "融担类业务",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
const __VLS_24 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    value: "直贷类业务",
}));
const __VLS_26 = __VLS_25({
    value: "直贷类业务",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
var __VLS_15;
var __VLS_11;
const __VLS_28 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    field: "platform",
    label: "平台产品",
}));
const __VLS_30 = __VLS_29({
    field: "platform",
    label: "平台产品",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.filterForm.platform),
    placeholder: "请选择平台产品",
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.filterForm.platform),
    placeholder: "请选择平台产品",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    value: "字节",
}));
const __VLS_38 = __VLS_37({
    value: "字节",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
var __VLS_39;
const __VLS_40 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    value: "蚂蚁",
}));
const __VLS_42 = __VLS_41({
    value: "蚂蚁",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
var __VLS_43;
const __VLS_44 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    value: "京东",
}));
const __VLS_46 = __VLS_45({
    value: "京东",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
var __VLS_47;
const __VLS_48 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    value: "美团",
}));
const __VLS_50 = __VLS_49({
    value: "美团",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
var __VLS_51;
var __VLS_35;
var __VLS_31;
const __VLS_52 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    field: "targetLoan",
    label: "目标贷余",
}));
const __VLS_54 = __VLS_53({
    field: "targetLoan",
    label: "目标贷余",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.filterForm.targetLoan),
    placeholder: "请选择目标贷余",
    ...{ style: {} },
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.filterForm.targetLoan),
    placeholder: "请选择目标贷余",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.store.targetLoanOptions))) {
    const __VLS_60 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        key: (option),
        value: (option),
    }));
    const __VLS_62 = __VLS_61({
        key: (option),
        value: (option),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    (__VLS_ctx.formatAmount(option));
    var __VLS_63;
}
var __VLS_59;
var __VLS_55;
const __VLS_64 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    field: "year",
    label: "年份",
}));
const __VLS_66 = __VLS_65({
    field: "year",
    label: "年份",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.filterForm.year),
    placeholder: "请选择年份",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.filterForm.year),
    placeholder: "请选择年份",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
for (const [year] of __VLS_getVForSourceType((__VLS_ctx.yearOptions))) {
    const __VLS_72 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        key: (year),
        value: (year),
    }));
    const __VLS_74 = __VLS_73({
        key: (year),
        value: (year),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    (year);
    var __VLS_75;
}
var __VLS_71;
var __VLS_67;
const __VLS_76 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_82 = __VLS_81({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    onClick: (__VLS_ctx.handleFilter)
};
__VLS_83.slots.default;
var __VLS_83;
const __VLS_88 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ 'onClick': {} },
    ...{ style: {} },
}));
const __VLS_90 = __VLS_89({
    ...{ 'onClick': {} },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
let __VLS_92;
let __VLS_93;
let __VLS_94;
const __VLS_95 = {
    onClick: (__VLS_ctx.resetFilter)
};
__VLS_91.slots.default;
var __VLS_91;
var __VLS_79;
var __VLS_7;
var __VLS_3;
/** @type {[typeof BudgetBurndownTabs, ]} */ ;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent(BudgetBurndownTabs, new BudgetBurndownTabs({
    ...{ 'onChartTypeChange': {} },
    chartData: (__VLS_ctx.burndownData),
}));
const __VLS_97 = __VLS_96({
    ...{ 'onChartTypeChange': {} },
    chartData: (__VLS_ctx.burndownData),
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
let __VLS_99;
let __VLS_100;
let __VLS_101;
const __VLS_102 = {
    onChartTypeChange: (__VLS_ctx.handleChartTypeChange)
};
var __VLS_98;
const __VLS_103 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
    ...{ class: "warning-card" },
    title: "预算健康度预警",
}));
const __VLS_105 = __VLS_104({
    ...{ class: "warning-card" },
    title: "预算健康度预警",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
__VLS_106.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_107 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({}));
const __VLS_109 = __VLS_108({}, ...__VLS_functionalComponentArgsRest(__VLS_108));
__VLS_110.slots.default;
const __VLS_111 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
    modelValue: (__VLS_ctx.filterForm.healthStatus),
    placeholder: "健康度状态",
    ...{ style: {} },
    multiple: true,
}));
const __VLS_113 = __VLS_112({
    modelValue: (__VLS_ctx.filterForm.healthStatus),
    placeholder: "健康度状态",
    ...{ style: {} },
    multiple: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
__VLS_114.slots.default;
const __VLS_115 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
    value: "正常",
}));
const __VLS_117 = __VLS_116({
    value: "正常",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
__VLS_118.slots.default;
var __VLS_118;
const __VLS_119 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
    value: "超支",
}));
const __VLS_121 = __VLS_120({
    value: "超支",
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
__VLS_122.slots.default;
var __VLS_122;
const __VLS_123 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
    value: "消耗过慢",
}));
const __VLS_125 = __VLS_124({
    value: "消耗过慢",
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
__VLS_126.slots.default;
var __VLS_126;
var __VLS_114;
var __VLS_110;
const __VLS_127 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_129 = __VLS_128({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
let __VLS_131;
let __VLS_132;
let __VLS_133;
const __VLS_134 = {
    onClick: (__VLS_ctx.exportData)
};
__VLS_130.slots.default;
var __VLS_130;
const __VLS_135 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({
    data: (__VLS_ctx.warningData),
    pagination: (false),
    bordered: ({ wrapper: true, cell: true }),
}));
const __VLS_137 = __VLS_136({
    data: (__VLS_ctx.warningData),
    pagination: (false),
    bordered: ({ wrapper: true, cell: true }),
}, ...__VLS_functionalComponentArgsRest(__VLS_136));
__VLS_138.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_138.slots;
    const __VLS_139 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
        title: "业务类型",
        dataIndex: "businessType",
        width: (120),
    }));
    const __VLS_141 = __VLS_140({
        title: "业务类型",
        dataIndex: "businessType",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    const __VLS_143 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
        title: "平台产品",
        dataIndex: "platform",
        width: (120),
    }));
    const __VLS_145 = __VLS_144({
        title: "平台产品",
        dataIndex: "platform",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_144));
    __VLS_146.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_146.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_147 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
            ...{ 'onClick': {} },
        }));
        const __VLS_149 = __VLS_148({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_148));
        let __VLS_151;
        let __VLS_152;
        let __VLS_153;
        const __VLS_154 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handlePlatformClick(record);
            }
        };
        __VLS_150.slots.default;
        (record.platform);
        var __VLS_150;
    }
    var __VLS_146;
    const __VLS_155 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
        title: "实际放款",
        align: "center",
        width: (150),
    }));
    const __VLS_157 = __VLS_156({
        title: "实际放款",
        align: "center",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    __VLS_158.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_158.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ({ 'warning-text': record.actualLoan > record.estimatedLoan * 1.1 }) },
        });
        (__VLS_ctx.formatAmount(record.actualLoan));
    }
    var __VLS_158;
    const __VLS_159 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
        title: "实际费用",
        align: "center",
        width: (200),
    }));
    const __VLS_161 = __VLS_160({
        title: "实际费用",
        align: "center",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    __VLS_162.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_162.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comparison-cell" },
        });
        const __VLS_163 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({
            content: (`预算: ${__VLS_ctx.formatAmount(record.estimatedCost)}
实际: ${__VLS_ctx.formatAmount(record.actualCost)}
偏离率: ${__VLS_ctx.formatPercent((record.actualCost - record.estimatedCost) / record.estimatedCost)}`),
        }));
        const __VLS_165 = __VLS_164({
            content: (`预算: ${__VLS_ctx.formatAmount(record.estimatedCost)}
实际: ${__VLS_ctx.formatAmount(record.actualCost)}
偏离率: ${__VLS_ctx.formatPercent((record.actualCost - record.estimatedCost) / record.estimatedCost)}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_164));
        __VLS_166.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cost-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "cost-value" },
            ...{ class: ({ 'warning-text': record.actualCost > record.estimatedCost * 1.1 }) },
        });
        (__VLS_ctx.formatAmount(record.actualCost));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deviation-value" },
            ...{ class: ({ 'warning-text': (record.actualCost - record.estimatedCost) > record.estimatedCost * 0.1 }) },
        });
        (__VLS_ctx.formatPercent((record.actualCost - record.estimatedCost) / record.estimatedCost));
        if ((record.actualCost - record.estimatedCost) > record.estimatedCost * 0.1) {
            const __VLS_167 = {}.IconArrowRise;
            /** @type {[typeof __VLS_components.IconArrowRise, typeof __VLS_components.iconArrowRise, ]} */ ;
            // @ts-ignore
            const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
                ...{ class: "trend-icon warning-text" },
            }));
            const __VLS_169 = __VLS_168({
                ...{ class: "trend-icon warning-text" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_168));
        }
        var __VLS_166;
    }
    var __VLS_162;
    const __VLS_171 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
        title: "年化数据成本",
        align: "center",
        width: (200),
    }));
    const __VLS_173 = __VLS_172({
        title: "年化数据成本",
        align: "center",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    __VLS_174.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_174.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comparison-cell" },
        });
        const __VLS_175 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
            content: (`预算: ${__VLS_ctx.formatPercent(record.estimatedAnnualCost)}\n实际: ${__VLS_ctx.formatPercent(record.actualAnnualCost)}\n偏离率: ${__VLS_ctx.formatPercent((record.actualAnnualCost - record.estimatedAnnualCost) / record.estimatedAnnualCost)}`),
        }));
        const __VLS_177 = __VLS_176({
            content: (`预算: ${__VLS_ctx.formatPercent(record.estimatedAnnualCost)}\n实际: ${__VLS_ctx.formatPercent(record.actualAnnualCost)}\n偏离率: ${__VLS_ctx.formatPercent((record.actualAnnualCost - record.estimatedAnnualCost) / record.estimatedAnnualCost)}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_176));
        __VLS_178.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cost-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "cost-value" },
            ...{ class: ({ 'warning-text': record.actualAnnualCost > record.estimatedAnnualCost * 1.1 }) },
        });
        (__VLS_ctx.formatPercent(record.actualAnnualCost));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deviation-value" },
            ...{ class: ({ 'warning-text': (record.actualAnnualCost - record.estimatedAnnualCost) > record.estimatedAnnualCost * 0.1 }) },
        });
        (__VLS_ctx.formatPercent((record.actualAnnualCost - record.estimatedAnnualCost) / record.estimatedAnnualCost));
        if ((record.actualAnnualCost - record.estimatedAnnualCost) > record.estimatedAnnualCost * 0.1) {
            const __VLS_179 = {}.IconArrowRise;
            /** @type {[typeof __VLS_components.IconArrowRise, typeof __VLS_components.iconArrowRise, ]} */ ;
            // @ts-ignore
            const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
                ...{ class: "trend-icon warning-text" },
            }));
            const __VLS_181 = __VLS_180({
                ...{ class: "trend-icon warning-text" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_180));
        }
        var __VLS_178;
    }
    var __VLS_174;
    const __VLS_183 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        title: "无风险收益",
        align: "center",
        width: (180),
    }));
    const __VLS_185 = __VLS_184({
        title: "无风险收益",
        align: "center",
        width: (180),
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    __VLS_186.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_186.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comparison-cell" },
        });
        const __VLS_187 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
            content: (`预算: ${__VLS_ctx.formatPercent(record.estimatedRiskFreeReturn)}
实际: ${__VLS_ctx.formatPercent(record.actualRiskFreeReturn)}
偏离率: ${__VLS_ctx.formatPercent((record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) / record.estimatedRiskFreeReturn)}`),
        }));
        const __VLS_189 = __VLS_188({
            content: (`预算: ${__VLS_ctx.formatPercent(record.estimatedRiskFreeReturn)}
实际: ${__VLS_ctx.formatPercent(record.actualRiskFreeReturn)}
偏离率: ${__VLS_ctx.formatPercent((record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) / record.estimatedRiskFreeReturn)}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_188));
        __VLS_190.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cost-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "cost-value" },
            ...{ class: ({ 'warning-text': record.actualRiskFreeReturn < record.estimatedRiskFreeReturn * 0.9 }) },
        });
        (__VLS_ctx.formatPercent(record.actualRiskFreeReturn));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deviation-value" },
            ...{ class: ({ 'warning-text': (record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) < record.estimatedRiskFreeReturn * -0.1 }) },
        });
        (__VLS_ctx.formatPercent((record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) / record.estimatedRiskFreeReturn));
        if ((record.actualRiskFreeReturn - record.estimatedRiskFreeReturn) < record.estimatedRiskFreeReturn * -0.1) {
            const __VLS_191 = {}.IconArrowFall;
            /** @type {[typeof __VLS_components.IconArrowFall, typeof __VLS_components.iconArrowFall, ]} */ ;
            // @ts-ignore
            const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
                ...{ class: "trend-icon warning-text" },
            }));
            const __VLS_193 = __VLS_192({
                ...{ class: "trend-icon warning-text" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_192));
        }
        var __VLS_190;
    }
    var __VLS_186;
}
var __VLS_138;
var __VLS_106;
/** @type {[typeof PlatformProductModal, ]} */ ;
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent(PlatformProductModal, new PlatformProductModal({
    visible: (__VLS_ctx.platformModalVisible),
    platform: (__VLS_ctx.currentPlatform?.platform || ''),
    businessType: (__VLS_ctx.currentPlatform?.businessType || ''),
    targetLoan: (__VLS_ctx.currentPlatform?.targetLoan || 0),
    actualLoan: (__VLS_ctx.currentPlatform?.actualLoan || 0),
    externalDataCost: (__VLS_ctx.currentPlatform?.externalDataCost || 0),
    budgetStatus: (__VLS_ctx.currentPlatform?.budgetStatus || '超支'),
}));
const __VLS_196 = __VLS_195({
    visible: (__VLS_ctx.platformModalVisible),
    platform: (__VLS_ctx.currentPlatform?.platform || ''),
    businessType: (__VLS_ctx.currentPlatform?.businessType || ''),
    targetLoan: (__VLS_ctx.currentPlatform?.targetLoan || 0),
    actualLoan: (__VLS_ctx.currentPlatform?.actualLoan || 0),
    externalDataCost: (__VLS_ctx.currentPlatform?.externalDataCost || 0),
    budgetStatus: (__VLS_ctx.currentPlatform?.budgetStatus || '超支'),
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
if (__VLS_ctx.showDebugInfo) {
    const __VLS_198 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
        ...{ class: "debug-card" },
        title: "调试信息",
    }));
    const __VLS_200 = __VLS_199({
        ...{ class: "debug-card" },
        title: "调试信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    __VLS_201.slots.default;
    const __VLS_202 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
        direction: "vertical",
    }));
    const __VLS_204 = __VLS_203({
        direction: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    __VLS_205.slots.default;
    const __VLS_206 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
        ...{ 'onClick': {} },
        type: "outline",
    }));
    const __VLS_208 = __VLS_207({
        ...{ 'onClick': {} },
        type: "outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    let __VLS_210;
    let __VLS_211;
    let __VLS_212;
    const __VLS_213 = {
        onClick: (__VLS_ctx.toggleDebugInfo)
    };
    __VLS_209.slots.default;
    (__VLS_ctx.showDebugInfo ? '隐藏调试信息' : '显示调试信息');
    var __VLS_209;
    const __VLS_214 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
        column: (1),
        bordered: true,
    }));
    const __VLS_216 = __VLS_215({
        column: (1),
        bordered: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    __VLS_217.slots.default;
    const __VLS_218 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
        label: "数据加载状态",
    }));
    const __VLS_220 = __VLS_219({
        label: "数据加载状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    __VLS_221.slots.default;
    (__VLS_ctx.loadingStatus);
    var __VLS_221;
    const __VLS_222 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({
        label: "接口返回数据",
    }));
    const __VLS_224 = __VLS_223({
        label: "接口返回数据",
    }, ...__VLS_functionalComponentArgsRest(__VLS_223));
    __VLS_225.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.apiResponse, null, 2));
    var __VLS_225;
    const __VLS_226 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
        label: "筛选条件",
    }));
    const __VLS_228 = __VLS_227({
        label: "筛选条件",
    }, ...__VLS_functionalComponentArgsRest(__VLS_227));
    __VLS_229.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.filterForm, null, 2));
    var __VLS_229;
    var __VLS_217;
    var __VLS_205;
    var __VLS_201;
}
/** @type {__VLS_StyleScopedClasses['external-data-monitor']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-card']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-info']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['deviation-value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-info']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['deviation-value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-info']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['deviation-value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
/** @type {__VLS_StyleScopedClasses['debug-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PlatformProductModal: PlatformProductModal,
            BudgetBurndownTabs: BudgetBurndownTabs,
            IconArrowRise: IconArrowRise,
            IconArrowFall: IconArrowFall,
            store: store,
            filterForm: filterForm,
            platformModalVisible: platformModalVisible,
            currentPlatform: currentPlatform,
            showDebugInfo: showDebugInfo,
            loadingStatus: loadingStatus,
            apiResponse: apiResponse,
            handlePlatformClick: handlePlatformClick,
            toggleDebugInfo: toggleDebugInfo,
            yearOptions: yearOptions,
            warningData: warningData,
            burndownData: burndownData,
            formatAmount: formatAmount,
            formatPercent: formatPercent,
            exportData: exportData,
            handleFilter: handleFilter,
            handleChartTypeChange: handleChartTypeChange,
            resetFilter: resetFilter,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
