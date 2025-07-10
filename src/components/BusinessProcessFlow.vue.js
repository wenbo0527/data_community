/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { IconFile, IconBarChart, IconEdit, IconEye, IconUser, IconPlus, IconDelete, IconClockCircle } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { processSteps } from '@/mock/businessProcessData';
import BusinessProcessEditModal from './modals/BusinessProcessEditModal.vue';
const router = useRouter();
const emit = defineEmits();
const activeStep = ref(0);
const businessType = ref('self'); // 默认自营
const productType = ref('general'); // 默认通用
const cascaderValue = ref(['self', 'general']); // 级联选择器值
// 级联选择器选项
const cascaderOptions = ref([
    {
        value: 'self',
        label: '自营',
        children: [
            { value: 'general', label: '通用' },
            { value: 'personal', label: '个人贷' },
            { value: 'business', label: '企业贷' },
            { value: 'mortgage', label: '房贷' },
            { value: 'car', label: '车贷' }
        ]
    },
    {
        value: 'supermarket',
        label: '贷超',
        children: [
            { value: 'general', label: '通用' },
            { value: 'personal', label: '个人贷' },
            { value: 'business', label: '企业贷' }
        ]
    },
    {
        value: 'assist',
        label: '助贷',
        children: [
            { value: 'general', label: '通用' },
            { value: 'personal', label: '个人贷' },
            { value: 'business', label: '企业贷' }
        ]
    }
]);
// 视图模式和加载状态
const tableViewMode = ref('grid');
const metricViewMode = ref('grid');
const tableLoading = ref(false);
// Tab切换状态
const activeTab = ref('tables');
// 搜索和分页状态
const tableSearchText = ref('');
const metricSearchText = ref('');
const currentPage = ref(1);
const metricCurrentPage = ref(1);
// 编辑状态
const isEditing = ref(false);
const selectedTables = ref([]);
// 编辑弹窗状态
const editModalVisible = ref(false);
const processListModalVisible = ref(false);
const currentEditProcess = ref(null);
// 模态框宽度计算属性
const modalWidth = computed(() => {
    if (typeof window !== 'undefined') {
        return Math.min(800, window.innerWidth * 0.9);
    }
    return 800;
});
// 流程列表数据
const processList = ref([
    {
        id: 1,
        name: '个人信贷业务流程',
        description: '个人信贷业务的完整流程，包含申请、审核、放款等环节',
        businessType: 'self',
        productType: 'personal',
        stepCount: 6,
        creator: '张三',
        updateTime: '2024-01-15 14:30'
    },
    {
        id: 2,
        name: '企业贷款业务流程',
        description: '企业贷款业务流程，涵盖企业资质审核、风险评估等步骤',
        businessType: 'self',
        productType: 'business',
        stepCount: 8,
        creator: '李四',
        updateTime: '2024-01-12 09:15'
    },
    {
        id: 3,
        name: '贷超平台流程',
        description: '贷超平台业务流程，包含渠道对接、订单分发等环节',
        businessType: 'supermarket',
        productType: 'general',
        stepCount: 5,
        creator: '王五',
        updateTime: '2024-01-10 16:45'
    }
]);
// 根据业务类型获取对应的流程步骤
const currentProcessSteps = computed(() => {
    // 这里可以根据业务类型和产品类型返回不同的步骤
    // 目前使用默认的processSteps，后续可以扩展
    return processSteps;
});
// 当前步骤的数据表
const currentTables = computed(() => {
    if (activeStep.value >= 0 && activeStep.value < currentProcessSteps.value.length) {
        return currentProcessSteps.value[activeStep.value].tables;
    }
    return [];
});
// 确保组件挂载后高亮第一个步骤
onMounted(() => {
    console.groupCollapsed('[业务流程] 初始化加载');
    console.log('初始步骤数据表:', currentProcessSteps.value[0]?.tables);
    console.log('初始步骤指标:', currentMetrics.value);
    console.log('业务类型:', businessType.value);
    console.log('产品选型:', productType.value);
    console.groupEnd();
    selectStep(0);
});
// 优化的表格列定义
const optimizedTableColumns = [
    {
        title: '表名',
        dataIndex: 'name',
        width: 180,
        ellipsis: true,
        tooltip: true,
        render: ({ record }) => {
            return h('div', { class: 'table-name-cell' }, [
                h('span', { class: 'table-name' }, record.name),
                h('span', { class: 'table-type' }, record.type)
            ]);
        }
    },
    {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        tooltip: true
    },
    {
        title: '负责人',
        dataIndex: 'owner',
        width: 100,
        render: ({ record }) => {
            return h('span', { class: 'owner-name' }, record.owner || '未指定');
        }
    }
];
// 字段列定义
const fieldColumns = [
    { title: '字段名', dataIndex: 'name' },
    { title: '使用说明', dataIndex: 'usage', render: ({ record }) => (record.usage || '暂无说明') },
    { title: '描述', dataIndex: 'description' },
    { title: '管理员', dataIndex: 'owner', render: ({ record }) => (record.owner || '未指定') }
];
// 级联选择器变化处理
const onCascaderChange = (value) => {
    if (value && value.length === 2) {
        businessType.value = value[0];
        productType.value = value[1];
        console.log('业务类型变化:', value[0], '产品类型变化:', value[1]);
        Message.info(`已切换到${getBusinessTypeName(value[0])}模式 - ${getProductTypeName(value[1])}产品`);
        // 这里可以根据业务类型和产品类型重新加载对应的流程数据
    }
};
// 业务类型变更处理
const onBusinessTypeChange = (value) => {
    console.log('业务类型变更:', value);
    Message.info(`已切换到${getBusinessTypeName(value)}模式`);
    // 这里可以根据业务类型调整流程步骤或数据
};
// 产品类型变更处理
const onProductTypeChange = (value) => {
    console.log('产品类型变更:', value);
    Message.info(`已切换到${getProductTypeName(value)}产品`);
    // 这里可以根据产品类型调整相关数据
};
// 获取业务类型名称
const getBusinessTypeName = (type) => {
    const typeMap = {
        'self': '自营',
        'supermarket': '贷超',
        'assist': '助贷'
    };
    return typeMap[type] || '未知';
};
// 获取产品类型名称
const getProductTypeName = (type) => {
    const typeMap = {
        'general': '通用',
        'personal': '个人贷',
        'business': '企业贷',
        'mortgage': '房贷',
        'car': '车贷'
    };
    return typeMap[type] || '未知';
};
// 当前步骤的业务指标
const currentMetrics = computed(() => {
    if (activeStep.value < 0 || activeStep.value >= currentProcessSteps.value.length)
        return [];
    const metrics = currentProcessSteps.value[activeStep.value].tables.flatMap(table => {
        return table.metrics || [];
    });
    return metrics;
});
// 获取步骤的指标数量
const getStepMetricsCount = (step) => {
    return step.tables.reduce((count, table) => {
        return count + (table.metrics?.length || 0);
    }, 0);
};
// 搜索处理函数
const handleTableSearch = (value) => {
    tableSearchText.value = value;
    currentPage.value = 1; // 重置到第一页
};
const handleMetricSearch = (value) => {
    metricSearchText.value = value;
    metricCurrentPage.value = 1; // 重置到第一页
};
// 优化的指标列定义
const optimizedMetricColumns = [
    {
        title: '指标名称',
        dataIndex: 'name',
        key: 'name',
        width: 180,
        render: ({ record }) => {
            return h('div', { class: 'metric-name-cell' }, [
                h('div', { class: 'metric-name' }, record.name),
                h('span', { class: 'metric-unit' }, record.unit ? `(${record.unit})` : '')
            ]);
        }
    },
    {
        title: '计算公式',
        dataIndex: 'formula',
        key: 'formula',
        ellipsis: true,
        tooltip: true,
        render: ({ record }) => {
            return h('code', { class: 'formula-code' }, record.formula);
        }
    },
    {
        title: '负责人',
        dataIndex: 'owner',
        key: 'owner',
        width: 100,
        render: ({ record }) => {
            return h('span', { class: 'owner-name' }, record.owner);
        }
    }
];
const metricColumns = [
    { title: '指标名称', dataIndex: 'name' },
    { title: '负责人', dataIndex: 'owner', render: ({ record }) => (`<span>${record.owner || '未指定'}</span>`) },
    { title: '业务口径', dataIndex: 'description' }
];
const showMetricDetail = (metric) => {
    console.log('查看指标详情:', metric);
};
const getStepTooltipContent = (stepIndex) => {
    const step = processSteps[stepIndex];
    return `管理员: ${step.owner || '未指定'}`;
};
// 选择步骤
/**
 * 选择业务流程步骤
 * @param {number} index - 要切换到的步骤索引
 */
const selectStep = (index) => {
    if (index < 0 || index >= currentProcessSteps.value.length)
        return;
    if (index === activeStep.value)
        return; // 避免重复点击同一索引
    console.groupCollapsed(`[业务流程] 切换到步骤: ${index + 1}. ${currentProcessSteps.value[index].name} (索引: ${index})`);
    // 更新activeStep为点击的索引
    activeStep.value = index;
    // 重置搜索和分页状态
    tableSearchText.value = '';
    metricSearchText.value = '';
    currentPage.value = 1;
    metricCurrentPage.value = 1;
    // 重置编辑状态
    isEditing.value = false;
    selectedTables.value = [];
    console.log('更新后activeStep:', activeStep.value);
    console.log('当前步骤数据表:', currentTables.value);
    console.log('当前步骤指标:', currentMetrics.value);
    console.groupEnd();
};
// 显示表详情
/**
 * 显示数据表详情
 * @param {TableItem} record - 点击的数据表对象
 */
const showTableDetail = (record) => {
    if (isEditing.value)
        return;
    console.groupCollapsed(`[数据表] 点击表: ${record.name}`);
    console.log('表详情:', record);
    console.log('点击时间:', new Date().toLocaleString());
    console.groupEnd();
    router.push({
        name: 'TableDetail',
        params: {
            tableName: record.name,
            tableData: encodeURIComponent(JSON.stringify(record))
        }
    });
};
const startEditing = () => {
    isEditing.value = true;
};
const cancelEditing = () => {
    isEditing.value = false;
};
const saveChanges = () => {
    isEditing.value = false;
    console.log('保存更改');
};
// 编辑数据表绑定
const editTableBinding = () => {
    console.log('编辑数据表绑定');
    Message.info('编辑数据表绑定功能');
};
// 编辑指标绑定
const editMetricBinding = () => {
    console.log('编辑指标绑定');
    Message.info('编辑指标绑定功能');
};
// 打开流程列表弹窗
const openEditModal = () => {
    processListModalVisible.value = true;
};
// 新增流程
const createNewProcess = () => {
    currentEditProcess.value = null;
    processListModalVisible.value = false;
    editModalVisible.value = true;
};
// 编辑流程
const editProcess = (process) => {
    currentEditProcess.value = process;
    processListModalVisible.value = false;
    editModalVisible.value = true;
};
// 删除流程
const deleteProcess = (processId) => {
    const index = processList.value.findIndex(p => p.id === processId);
    if (index > -1) {
        processList.value.splice(index, 1);
        Message.success('流程删除成功');
    }
};
// 获取业务类型文本
const getBusinessTypeText = (type) => {
    const typeMap = {
        'self': '自营',
        'supermarket': '贷超',
        'assist': '助贷'
    };
    return typeMap[type] || type;
};
// 获取产品类型文本
const getProductTypeText = (type) => {
    const typeMap = {
        'general': '通用',
        'personal': '个人贷',
        'business': '企业贷',
        'mortgage': '房贷',
        'car': '车贷'
    };
    return typeMap[type] || type;
};
// 保存业务流程
const saveBusinessProcess = (data) => {
    console.log('保存业务流程数据:', data);
    if (currentEditProcess.value) {
        // 编辑模式
        const index = processList.value.findIndex(p => p.id === currentEditProcess.value.id);
        if (index > -1) {
            processList.value[index] = { ...processList.value[index], ...data };
            Message.success('业务流程更新成功');
        }
    }
    else {
        // 新增模式
        const newProcess = {
            id: Date.now(),
            ...data,
            creator: '当前用户',
            updateTime: new Date().toLocaleString('zh-CN')
        };
        processList.value.push(newProcess);
        Message.success('业务流程创建成功');
    }
    editModalVisible.value = false;
    currentEditProcess.value = null;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['arco-steps-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-steps-item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-steps-item']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-steps-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-steps-item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-card']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-card']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-card']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['completed']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['completed']} */ ;
/** @type {__VLS_StyleScopedClasses['step-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['step-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['step-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['step-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['step-total']} */ ;
/** @type {__VLS_StyleScopedClasses['step-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-name']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['step-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-title']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['completed']} */ ;
/** @type {__VLS_StyleScopedClasses['step-title']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['data-section']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['step-title']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['step-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-name']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-name']} */ ;
/** @type {__VLS_StyleScopedClasses['table-name']} */ ;
/** @type {__VLS_StyleScopedClasses['current-step-info']} */ ;
/** @type {__VLS_StyleScopedClasses['step-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['step-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['step-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['step-total']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-name']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['step-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "business-process-flow" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "steps-card" },
    bordered: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "steps-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "steps-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "steps-title-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "steps-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "steps-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "steps-filters" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "filter-label" },
    });
    const __VLS_4 = {}.ACascader;
    /** @type {[typeof __VLS_components.ACascader, typeof __VLS_components.aCascader, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.cascaderValue),
        options: (__VLS_ctx.cascaderOptions),
        size: "small",
        ...{ style: ({ width: '200px' }) },
        placeholder: "请选择业务类型和产品类型",
        expandTrigger: "hover",
        showSearch: (true),
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.cascaderValue),
        options: (__VLS_ctx.cascaderOptions),
        size: "small",
        ...{ style: ({ width: '200px' }) },
        placeholder: "请选择业务类型和产品类型",
        expandTrigger: "hover",
        showSearch: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onChange: (__VLS_ctx.onCascaderChange)
    };
    var __VLS_7;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "steps-stats" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "step-count" },
    });
    (__VLS_ctx.currentProcessSteps.length);
    const __VLS_12 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.openEditModal)
    };
    __VLS_15.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_15.slots;
        const __VLS_20 = {}.IconEdit;
        /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    }
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "enhanced-steps" },
});
for (const [step, index] of __VLS_getVForSourceType((__VLS_ctx.currentProcessSteps))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectStep(index);
            } },
        key: (index),
        ...{ class: (['step-item', { 'active': __VLS_ctx.activeStep === index, 'completed': index < __VLS_ctx.activeStep }]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-indicator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-number" },
    });
    (index + 1);
    if (index < __VLS_ctx.currentProcessSteps.length - 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "step-connector" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "step-title" },
    });
    (step.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "current-step-overview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-overview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-indicator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-circle" },
});
(__VLS_ctx.activeStep + 1);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-total" },
});
(__VLS_ctx.currentProcessSteps.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "step-name" },
});
(__VLS_ctx.currentProcessSteps[__VLS_ctx.activeStep]?.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "step-description" },
});
(__VLS_ctx.currentProcessSteps[__VLS_ctx.activeStep]?.description);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-stats" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-item" },
});
const __VLS_24 = {}.IconFile;
/** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ class: "stat-icon" },
}));
const __VLS_26 = __VLS_25({
    ...{ class: "stat-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
(__VLS_ctx.currentTables.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-item" },
});
const __VLS_28 = {}.IconBarChart;
/** @type {[typeof __VLS_components.IconBarChart, typeof __VLS_components.iconBarChart, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ class: "stat-icon" },
}));
const __VLS_30 = __VLS_29({
    ...{ class: "stat-icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
(__VLS_ctx.currentMetrics.length);
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-content" },
});
const __VLS_32 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ class: "data-content-card" },
    bordered: (false),
}));
const __VLS_34 = __VLS_33({
    ...{ class: "data-content-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_35.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-extra-actions" },
    });
    const __VLS_36 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onClick: (...[$event]) => {
            __VLS_ctx.activeTab === 'tables' ? __VLS_ctx.editTableBinding() : __VLS_ctx.editMetricBinding();
        }
    };
    __VLS_39.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_39.slots;
        const __VLS_44 = {}.IconEdit;
        /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    }
    var __VLS_39;
    const __VLS_48 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.activeTab === 'tables' ? __VLS_ctx.tableViewMode : __VLS_ctx.metricViewMode),
        size: "small",
        ...{ style: ({ width: '100px' }) },
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.activeTab === 'tables' ? __VLS_ctx.tableViewMode : __VLS_ctx.metricViewMode),
        size: "small",
        ...{ style: ({ width: '100px' }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_52;
    let __VLS_53;
    let __VLS_54;
    const __VLS_55 = {
        'onUpdate:modelValue': ((value) => __VLS_ctx.activeTab === 'tables' ? (__VLS_ctx.tableViewMode = value) : (__VLS_ctx.metricViewMode = value))
    };
    __VLS_51.slots.default;
    const __VLS_56 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        value: "grid",
    }));
    const __VLS_58 = __VLS_57({
        value: "grid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    var __VLS_59;
    const __VLS_60 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        value: "list",
    }));
    const __VLS_62 = __VLS_61({
        value: "list",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    var __VLS_63;
    var __VLS_51;
}
const __VLS_64 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    activeKey: (__VLS_ctx.activeTab),
    type: "line",
    size: "large",
    ...{ class: "data-tabs" },
}));
const __VLS_66 = __VLS_65({
    activeKey: (__VLS_ctx.activeTab),
    type: "line",
    size: "large",
    ...{ class: "data-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    key: "tables",
    title: "核心底表",
}));
const __VLS_70 = __VLS_69({
    key: "tables",
    title: "核心底表",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_71.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-title" },
    });
    const __VLS_72 = {}.IconFile;
    /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ class: "tab-icon" },
    }));
    const __VLS_74 = __VLS_73({
        ...{ class: "tab-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tab-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tables-container" },
});
if (__VLS_ctx.currentTables.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.tableViewMode === 'grid') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tables-grid-view" },
        });
        for (const [table] of __VLS_getVForSourceType((__VLS_ctx.currentTables))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.currentTables.length > 0))
                            return;
                        if (!(__VLS_ctx.tableViewMode === 'grid'))
                            return;
                        __VLS_ctx.showTableDetail(table);
                    } },
                key: (table.name),
                ...{ class: "table-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "table-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
                ...{ class: "table-name" },
            });
            (table.name);
            if (table.type) {
                const __VLS_76 = {}.ATag;
                /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
                // @ts-ignore
                const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                    size: "small",
                    color: "green",
                }));
                const __VLS_78 = __VLS_77({
                    size: "small",
                    color: "green",
                }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                __VLS_79.slots.default;
                (table.type);
                var __VLS_79;
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "table-desc" },
            });
            (table.description);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "table-footer" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "table-owner" },
            });
            const __VLS_80 = {}.IconUser;
            /** @type {[typeof __VLS_components.IconUser, typeof __VLS_components.iconUser, ]} */ ;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                ...{ class: "owner-icon" },
            }));
            const __VLS_82 = __VLS_81({
                ...{ class: "owner-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            (table.owner || '未指定');
            const __VLS_84 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                type: "text",
                size: "mini",
            }));
            const __VLS_86 = __VLS_85({
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_85));
            __VLS_87.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_87.slots;
                const __VLS_88 = {}.IconEye;
                /** @type {[typeof __VLS_components.IconEye, typeof __VLS_components.iconEye, ]} */ ;
                // @ts-ignore
                const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
                const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
            }
            var __VLS_87;
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tables-list-view" },
        });
        const __VLS_92 = {}.ATable;
        /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            ...{ 'onRowClick': {} },
            data: (__VLS_ctx.currentTables),
            columns: (__VLS_ctx.optimizedTableColumns),
            pagination: (true),
            pageSize: (10),
            size: "small",
            loading: (__VLS_ctx.tableLoading),
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onRowClick': {} },
            data: (__VLS_ctx.currentTables),
            columns: (__VLS_ctx.optimizedTableColumns),
            pagination: (true),
            pageSize: (10),
            size: "small",
            loading: (__VLS_ctx.tableLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_96;
        let __VLS_97;
        let __VLS_98;
        const __VLS_99 = {
            onRowClick: (__VLS_ctx.showTableDetail)
        };
        var __VLS_95;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-tables-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-content" },
    });
    const __VLS_100 = {}.IconFile;
    /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        ...{ class: "empty-icon" },
    }));
    const __VLS_102 = __VLS_101({
        ...{ class: "empty-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "empty-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "empty-description" },
    });
    const __VLS_104 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_106 = __VLS_105({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_108;
    let __VLS_109;
    let __VLS_110;
    const __VLS_111 = {
        onClick: (__VLS_ctx.openEditModal)
    };
    __VLS_107.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_107.slots;
        const __VLS_112 = {}.IconEdit;
        /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
        const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
    }
    var __VLS_107;
}
var __VLS_71;
const __VLS_116 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    key: "metrics",
    title: "业务指标",
}));
const __VLS_118 = __VLS_117({
    key: "metrics",
    title: "业务指标",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_119.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-title" },
    });
    const __VLS_120 = {}.IconBarChart;
    /** @type {[typeof __VLS_components.IconBarChart, typeof __VLS_components.iconBarChart, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        ...{ class: "tab-icon" },
    }));
    const __VLS_122 = __VLS_121({
        ...{ class: "tab-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tab-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metrics-container" },
});
if (__VLS_ctx.currentMetrics.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.metricViewMode === 'grid') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "metrics-grid-view" },
        });
        for (const [metric] of __VLS_getVForSourceType((__VLS_ctx.currentMetrics))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.currentMetrics.length > 0))
                            return;
                        if (!(__VLS_ctx.metricViewMode === 'grid'))
                            return;
                        __VLS_ctx.showMetricDetail(metric);
                    } },
                key: (metric.name),
                ...{ class: "metric-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "metric-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
                ...{ class: "metric-name" },
            });
            (metric.name);
            if (metric.unit) {
                const __VLS_124 = {}.ATag;
                /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
                // @ts-ignore
                const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                    size: "small",
                    color: "blue",
                }));
                const __VLS_126 = __VLS_125({
                    size: "small",
                    color: "blue",
                }, ...__VLS_functionalComponentArgsRest(__VLS_125));
                __VLS_127.slots.default;
                (metric.unit);
                var __VLS_127;
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "metric-desc" },
            });
            (metric.description);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "metric-footer" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "metric-owner" },
            });
            const __VLS_128 = {}.IconUser;
            /** @type {[typeof __VLS_components.IconUser, typeof __VLS_components.iconUser, ]} */ ;
            // @ts-ignore
            const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
                ...{ class: "owner-icon" },
            }));
            const __VLS_130 = __VLS_129({
                ...{ class: "owner-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_129));
            (metric.owner || '未指定');
            const __VLS_132 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
                type: "text",
                size: "mini",
            }));
            const __VLS_134 = __VLS_133({
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_133));
            __VLS_135.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_135.slots;
                const __VLS_136 = {}.IconEye;
                /** @type {[typeof __VLS_components.IconEye, typeof __VLS_components.iconEye, ]} */ ;
                // @ts-ignore
                const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
                const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
            }
            var __VLS_135;
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "metrics-list-view" },
        });
        const __VLS_140 = {}.ATable;
        /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            ...{ 'onRowClick': {} },
            data: (__VLS_ctx.currentMetrics),
            columns: (__VLS_ctx.optimizedMetricColumns),
            pagination: (true),
            pageSize: (8),
            size: "small",
        }));
        const __VLS_142 = __VLS_141({
            ...{ 'onRowClick': {} },
            data: (__VLS_ctx.currentMetrics),
            columns: (__VLS_ctx.optimizedMetricColumns),
            pagination: (true),
            pageSize: (8),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        let __VLS_144;
        let __VLS_145;
        let __VLS_146;
        const __VLS_147 = {
            onRowClick: (__VLS_ctx.showMetricDetail)
        };
        var __VLS_143;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-metrics-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-content" },
    });
    const __VLS_148 = {}.IconBarChart;
    /** @type {[typeof __VLS_components.IconBarChart, typeof __VLS_components.iconBarChart, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        ...{ class: "empty-icon" },
    }));
    const __VLS_150 = __VLS_149({
        ...{ class: "empty-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "empty-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "empty-description" },
    });
    const __VLS_152 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_154 = __VLS_153({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    let __VLS_156;
    let __VLS_157;
    let __VLS_158;
    const __VLS_159 = {
        onClick: (__VLS_ctx.openEditModal)
    };
    __VLS_155.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_155.slots;
        const __VLS_160 = {}.IconEdit;
        /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
        const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
    }
    var __VLS_155;
}
var __VLS_119;
var __VLS_67;
var __VLS_35;
const __VLS_164 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    visible: (__VLS_ctx.processListModalVisible),
    title: "业务流程管理",
    width: (__VLS_ctx.modalWidth),
    footer: (false),
    maskClosable: (false),
}));
const __VLS_166 = __VLS_165({
    visible: (__VLS_ctx.processListModalVisible),
    title: "业务流程管理",
    width: (__VLS_ctx.modalWidth),
    footer: (false),
    maskClosable: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "process-list-modal" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_168 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_170 = __VLS_169({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
let __VLS_172;
let __VLS_173;
let __VLS_174;
const __VLS_175 = {
    onClick: (__VLS_ctx.createNewProcess)
};
__VLS_171.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_171.slots;
    const __VLS_176 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
    const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
}
var __VLS_171;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "process-list" },
});
for (const [process] of __VLS_getVForSourceType((__VLS_ctx.processList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (process.id),
        ...{ class: "process-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "process-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "process-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "process-name" },
    });
    (process.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "process-tags" },
    });
    const __VLS_180 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        size: "small",
        color: "blue",
    }));
    const __VLS_182 = __VLS_181({
        size: "small",
        color: "blue",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    (__VLS_ctx.getBusinessTypeText(process.businessType));
    var __VLS_183;
    const __VLS_184 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        size: "small",
        color: "green",
    }));
    const __VLS_186 = __VLS_185({
        size: "small",
        color: "green",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    (__VLS_ctx.getProductTypeText(process.productType));
    var __VLS_187;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "process-description" },
    });
    (process.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "process-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-item" },
    });
    const __VLS_188 = {}.IconFile;
    /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        ...{ class: "meta-icon" },
    }));
    const __VLS_190 = __VLS_189({
        ...{ class: "meta-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    (process.stepCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-item" },
    });
    const __VLS_192 = {}.IconUser;
    /** @type {[typeof __VLS_components.IconUser, typeof __VLS_components.iconUser, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        ...{ class: "meta-icon" },
    }));
    const __VLS_194 = __VLS_193({
        ...{ class: "meta-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    (process.creator);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-item" },
    });
    const __VLS_196 = {}.IconClockCircle;
    /** @type {[typeof __VLS_components.IconClockCircle, typeof __VLS_components.iconClockCircle, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        ...{ class: "meta-icon" },
    }));
    const __VLS_198 = __VLS_197({
        ...{ class: "meta-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    (process.updateTime);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "process-actions" },
    });
    const __VLS_200 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_202 = __VLS_201({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    let __VLS_204;
    let __VLS_205;
    let __VLS_206;
    const __VLS_207 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editProcess(process);
        }
    };
    __VLS_203.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_203.slots;
        const __VLS_208 = {}.IconEdit;
        /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
        // @ts-ignore
        const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({}));
        const __VLS_210 = __VLS_209({}, ...__VLS_functionalComponentArgsRest(__VLS_209));
    }
    var __VLS_203;
    const __VLS_212 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_214 = __VLS_213({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    let __VLS_216;
    let __VLS_217;
    let __VLS_218;
    const __VLS_219 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteProcess(process.id);
        }
    };
    __VLS_215.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_215.slots;
        const __VLS_220 = {}.IconDelete;
        /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({}));
        const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
    }
    var __VLS_215;
}
var __VLS_167;
/** @type {[typeof BusinessProcessEditModal, ]} */ ;
// @ts-ignore
const __VLS_224 = __VLS_asFunctionalComponent(BusinessProcessEditModal, new BusinessProcessEditModal({
    ...{ 'onSave': {} },
    visible: (__VLS_ctx.editModalVisible),
    processData: (__VLS_ctx.currentEditProcess),
}));
const __VLS_225 = __VLS_224({
    ...{ 'onSave': {} },
    visible: (__VLS_ctx.editModalVisible),
    processData: (__VLS_ctx.currentEditProcess),
}, ...__VLS_functionalComponentArgsRest(__VLS_224));
let __VLS_227;
let __VLS_228;
let __VLS_229;
const __VLS_230 = {
    onSave: (__VLS_ctx.saveBusinessProcess)
};
var __VLS_226;
/** @type {__VLS_StyleScopedClasses['business-process-flow']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-card']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-header']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-title-group']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-title']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-filters']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['step-count']} */ ;
/** @type {__VLS_StyleScopedClasses['enhanced-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['completed']} */ ;
/** @type {__VLS_StyleScopedClasses['step-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['step-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-title']} */ ;
/** @type {__VLS_StyleScopedClasses['current-step-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['step-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['step-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['step-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['step-total']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-name']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['step-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['data-content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-extra-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['data-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tables-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tables-grid-view']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-name']} */ ;
/** @type {__VLS_StyleScopedClasses['table-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['table-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['table-owner']} */ ;
/** @type {__VLS_StyleScopedClasses['owner-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tables-list-view']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tables-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-description']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics-container']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics-grid-view']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-header']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-name']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-owner']} */ ;
/** @type {__VLS_StyleScopedClasses['owner-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics-list-view']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-metrics-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-description']} */ ;
/** @type {__VLS_StyleScopedClasses['process-list-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['process-list']} */ ;
/** @type {__VLS_StyleScopedClasses['process-item']} */ ;
/** @type {__VLS_StyleScopedClasses['process-info']} */ ;
/** @type {__VLS_StyleScopedClasses['process-header']} */ ;
/** @type {__VLS_StyleScopedClasses['process-name']} */ ;
/** @type {__VLS_StyleScopedClasses['process-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['process-description']} */ ;
/** @type {__VLS_StyleScopedClasses['process-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['process-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconFile: IconFile,
            IconBarChart: IconBarChart,
            IconEdit: IconEdit,
            IconEye: IconEye,
            IconUser: IconUser,
            IconPlus: IconPlus,
            IconDelete: IconDelete,
            IconClockCircle: IconClockCircle,
            BusinessProcessEditModal: BusinessProcessEditModal,
            activeStep: activeStep,
            cascaderValue: cascaderValue,
            cascaderOptions: cascaderOptions,
            tableViewMode: tableViewMode,
            metricViewMode: metricViewMode,
            tableLoading: tableLoading,
            activeTab: activeTab,
            editModalVisible: editModalVisible,
            processListModalVisible: processListModalVisible,
            currentEditProcess: currentEditProcess,
            modalWidth: modalWidth,
            processList: processList,
            currentProcessSteps: currentProcessSteps,
            currentTables: currentTables,
            optimizedTableColumns: optimizedTableColumns,
            onCascaderChange: onCascaderChange,
            currentMetrics: currentMetrics,
            optimizedMetricColumns: optimizedMetricColumns,
            showMetricDetail: showMetricDetail,
            selectStep: selectStep,
            showTableDetail: showTableDetail,
            editTableBinding: editTableBinding,
            editMetricBinding: editMetricBinding,
            openEditModal: openEditModal,
            createNewProcess: createNewProcess,
            editProcess: editProcess,
            deleteProcess: deleteProcess,
            getBusinessTypeText: getBusinessTypeText,
            getProductTypeText: getProductTypeText,
            saveBusinessProcess: saveBusinessProcess,
        };
    },
    __typeEmits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
});
; /* PartiallyEnd: #4569/main.vue */
