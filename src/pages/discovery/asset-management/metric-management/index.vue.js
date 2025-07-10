/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted, h } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const selectedCategory = ref('');
const selectedStatus = ref('');
const showCreateModal = ref(false);
const showVersionHistoryModal = ref(false);
const editingMetric = ref(null);
const currentMetricForHistory = ref(null);
const formRef = ref();
const versionHistoryData = ref([]);
// 表格列配置
const columns = [
    {
        title: '指标名称',
        dataIndex: 'name',
        width: 150,
        render: ({ record }) => {
            return h('a-button', {
                type: 'text',
                onClick: () => viewMetricDetail(record)
            }, record.name);
        }
    },
    {
        title: '指标编码',
        dataIndex: 'code',
        width: 120
    },
    {
        title: '分类',
        dataIndex: 'category',
        slotName: 'category',
        width: 100
    },
    {
        title: '业务域',
        dataIndex: 'businessDomain',
        width: 100
    },
    {
        title: '业务定义',
        dataIndex: 'businessDefinition',
        ellipsis: true,
        tooltip: true
    },
    {
        title: '统计周期',
        dataIndex: 'statisticalPeriod',
        width: 100
    },
    {
        title: '负责人',
        dataIndex: 'owner',
        width: 100
    },
    {
        title: '版本号',
        dataIndex: 'version',
        width: 100
    },
    {
        title: '版本状态',
        dataIndex: 'versionStatus',
        width: 100,
        render: ({ record }) => {
            const statusMap = {
                'active': { text: '当前版本', color: 'green' },
                'history': { text: '历史版本', color: 'gray' },
                'draft': { text: '草稿', color: 'orange' }
            };
            const status = statusMap[record.versionStatus] || { text: record.versionStatus, color: 'blue' };
            return h('a-tag', { color: status.color }, status.text);
        }
    },
    {
        title: '状态',
        dataIndex: 'status',
        slotName: 'status',
        width: 80
    },
    {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: 150
    },
    {
        title: '操作',
        slotName: 'actions',
        width: 200,
        fixed: 'right'
    }
];
// 版本历史表格列配置
const versionHistoryColumns = [
    {
        title: '版本号',
        dataIndex: 'version',
        width: 120
    },
    {
        title: '版本状态',
        dataIndex: 'versionStatus',
        slotName: 'versionStatus',
        width: 100
    },
    {
        title: '版本说明',
        dataIndex: 'versionDescription',
        ellipsis: true,
        tooltip: true
    },
    {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 150
    },
    {
        title: '创建人',
        dataIndex: 'creator',
        width: 100
    },
    {
        title: '操作',
        slotName: 'actions',
        width: 150,
        fixed: 'right'
    }
];
// 模拟数据
const mockData = ref([
    {
        id: 1,
        name: 'DAU',
        code: 'USER_001',
        category: '用户指标',
        businessDomain: '留存域',
        businessDefinition: '日活跃用户数',
        owner: '张三',
        version: 'v1.2.0',
        versionStatus: 'active',
        versionDescription: '优化计算逻辑，提升数据准确性',
        useCase: '用于监控产品的日常活跃情况，是产品健康度的重要指标',
        statisticalPeriod: '日更新',
        sourceTable: 'dwd.user_login_detail',
        processingLogic: 'SELECT dt, COUNT(DISTINCT user_id) as dau\nFROM dwd.user_login_detail\nWHERE dt = ${date}\nGROUP BY dt',
        fieldDescription: 'user_id: 用户唯一标识, dt: 统计日期',
        reports: [{ name: '用户分析报表', url: '/reports/user-analysis' }, { name: '核心指标报表', url: '/reports/core-metrics' }],
        storageLocation: 'adm.ads_user_core_metrics',
        queryCode: 'SELECT dau FROM adm.ads_user_core_metrics WHERE dt = ${date}',
        status: 'active',
        updateTime: '2024-01-15 10:30:00'
    },
    {
        id: 2,
        name: '当日风控授信通过笔数',
        code: 'A00043',
        category: '业务域',
        businessDomain: '业务规模',
        businessDefinition: '授信申请环节中风控审批结果为通过的笔数',
        owner: '王志雄',
        version: 'v1.0.0',
        versionStatus: 'active',
        versionDescription: '初始版本',
        useCase: '',
        statisticalPeriod: '离线T+2',
        sourceTable: 'a_frms_deparment_sx_his_full',
        processingLogic: 'SELECT COUNT(flow_id) FROM a_frms_deparment_sx_his_full WHERE result=\'PA\'',
        fieldDescription: '',
        reports: [{ name: '发展日测报告', url: '/reports/daily-development' }, { name: '公司级报表', url: '/reports/company-level' }, { name: '市场营销报表', url: '/reports/marketing' }],
        storageLocation: 'adm.ads_report_index_commonality_info_full',
        queryCode: 'SELECT data_dt=20250401\nFROM adm.ads_report_numbersinfo_free_temporal_code\nWHERE data_dt=20250401\nAND indicator_name=\'风控授信通过量\'\nAND indicator_id=\'A00043\'',
        status: 'active',
        updateTime: '2024-01-15 11:45:00'
    },
    {
        id: 3,
        name: '用户注册转化率',
        code: 'USER_002',
        category: '用户指标',
        businessDomain: '转化域',
        businessDefinition: '访问用户转化为注册用户的比率',
        owner: '李四',
        version: 'v2.1.0',
        versionStatus: 'active',
        versionDescription: '新增渠道维度分析',
        useCase: '衡量产品获客效果，优化注册流程',
        statisticalPeriod: '日更新',
        sourceTable: 'dwd.user_register_detail',
        processingLogic: 'SELECT dt, COUNT(DISTINCT register_user_id) / COUNT(DISTINCT visit_user_id) as conversion_rate\nFROM dwd.user_register_detail\nWHERE dt = ${date}\nGROUP BY dt',
        fieldDescription: 'register_user_id: 完成注册的用户ID, visit_user_id: 访问用户ID',
        reports: [{ name: '用户分析报表', url: '/reports/user-analysis' }, { name: '转化分析报表', url: '/reports/conversion-analysis' }],
        storageLocation: 'adm.ads_user_conversion_metrics',
        queryCode: 'SELECT conversion_rate FROM adm.ads_user_conversion_metrics WHERE dt = ${date}',
        status: 'active',
        updateTime: '2024-01-14 16:20:00'
    }
]);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 4,
    showTotal: true,
    showPageSize: true
});
// 表单数据
const formData = reactive({
    name: '',
    code: '',
    category: '',
    businessDomain: '',
    owner: '',
    version: '',
    versionDescription: '',
    versionStatus: 'draft',
    businessDefinition: '',
    useCase: '',
    statisticalPeriod: '',
    sourceTable: '',
    processingLogic: '',
    fieldDescription: '',
    reports: [{ name: '', url: '' }],
    storageLocation: '',
    queryCode: ''
});
// 表单验证规则
const formRules = {
    name: [
        { required: true, message: '请输入指标名称' }
    ],
    code: [
        { required: true, message: '请输入指标编码' }
    ],
    category: [
        { required: true, message: '请选择指标分类' }
    ],
    businessDomain: [
        { required: true, message: '请选择业务域' }
    ],
    owner: [
        { required: true, message: '请输入负责人' }
    ],
    version: [
        { required: true, message: '请输入版本号' }
    ],
    businessDefinition: [
        { required: true, message: '请输入业务定义' }
    ],
    statisticalPeriod: [
        { required: true, message: '请选择统计周期' }
    ],
    sourceTable: [
        { required: true, message: '请输入来源表' }
    ]
};
// 方法
const handleSearch = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 500);
};
const handlePageChange = (page) => {
    pagination.current = page;
};
const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
};
const getStatusColor = (status) => {
    const colorMap = {
        active: 'green',
        inactive: 'orange',
        draft: 'gray'
    };
    return colorMap[status] || 'gray';
};
const getStatusText = (status) => {
    const textMap = {
        active: '启用',
        inactive: '停用',
        draft: '草稿'
    };
    return textMap[status] || '未知';
};
const getCategoryColor = (category) => {
    const colorMap = {
        '用户指标': 'blue',
        '业务域': 'green',
        '技术指标': 'orange',
        '财务指标': 'purple',
        '风险指标': 'red'
    };
    return colorMap[category] || 'gray';
};
const getCategoryText = (category) => {
    return category;
};
// 报表操作方法
const addReport = () => {
    formData.reports.push({ name: '', url: '' });
};
const removeReport = (index) => {
    if (formData.reports.length > 1) {
        formData.reports.splice(index, 1);
    }
};
const viewMetricDetail = (record) => {
    // 设置为查看模式，填充表单数据但设为只读
    editingMetric.value = { ...record, isViewMode: true };
    Object.assign(formData, record);
    showCreateModal.value = true;
};
const editMetric = (record) => {
    editingMetric.value = record;
    Object.assign(formData, record);
    showCreateModal.value = true;
};
// 版本历史相关方法
const viewVersionHistory = (record) => {
    currentMetricForHistory.value = record;
    // 模拟版本历史数据
    versionHistoryData.value = [
        {
            id: 1,
            version: 'v2.1.0',
            versionStatus: 'active',
            versionDescription: '新增渠道维度分析',
            createTime: '2024-01-15 14:30:00',
            creator: '李四'
        },
        {
            id: 2,
            version: 'v2.0.0',
            versionStatus: 'history',
            versionDescription: '重构计算逻辑，提升性能',
            createTime: '2024-01-10 09:15:00',
            creator: '李四'
        },
        {
            id: 3,
            version: 'v1.0.0',
            versionStatus: 'history',
            versionDescription: '初始版本',
            createTime: '2024-01-01 10:00:00',
            creator: '张三'
        }
    ];
    showVersionHistoryModal.value = true;
};
const viewVersionDetail = (versionRecord) => {
    console.log('查看版本详情:', versionRecord);
    Message.info('查看版本详情功能开发中');
};
const activateVersion = (versionRecord) => {
    console.log('激活版本:', versionRecord);
    // 更新版本状态
    versionHistoryData.value.forEach(item => {
        item.versionStatus = item.id === versionRecord.id ? 'active' : 'history';
    });
    Message.success(`版本 ${versionRecord.version} 已激活`);
};
const copyMetric = (record) => {
    const newMetric = { ...record };
    newMetric.name = `${record.name}_副本`;
    newMetric.code = `${record.code}_COPY`;
    Object.assign(formData, newMetric);
    editingMetric.value = null;
    showCreateModal.value = true;
};
const deleteMetric = (record) => {
    console.log('删除指标:', record);
    Message.success('删除成功');
};
const handleSubmit = async () => {
    // 如果是查看模式，直接关闭弹窗
    if (editingMetric.value?.isViewMode) {
        showCreateModal.value = false;
        resetForm();
        return;
    }
    try {
        const valid = await formRef.value?.validate();
        if (valid) {
            // 如果是编辑模式，自动设置版本状态为当前版本
            if (editingMetric.value) {
                formData.versionStatus = 'active';
                Message.success(`指标编辑成功，版本 ${formData.version} 已激活`);
            }
            else {
                formData.versionStatus = 'active';
                Message.success(`指标创建成功，版本 ${formData.version} 已激活`);
            }
            console.log('提交表单:', formData);
            showCreateModal.value = false;
            resetForm();
        }
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
const resetForm = () => {
    editingMetric.value = null;
    Object.assign(formData, {
        name: '',
        code: '',
        category: '',
        businessDomain: '',
        owner: '',
        version: '',
        versionDescription: '',
        versionStatus: 'draft',
        businessDefinition: '',
        useCase: '',
        statisticalPeriod: '',
        sourceTable: '',
        processingLogic: '',
        fieldDescription: '',
        reports: [{ name: '', url: '' }],
        storageLocation: '',
        queryCode: ''
    });
    formRef.value?.resetFields();
};
onMounted(() => {
    // 初始化数据
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreateModal = true;
    }
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_12 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    gutter: (16),
}));
const __VLS_14 = __VLS_13({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    span: (8),
}));
const __VLS_18 = __VLS_17({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索指标名称、描述",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索指标名称、描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onSearch: (__VLS_ctx.handleSearch)
};
var __VLS_23;
var __VLS_19;
const __VLS_28 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    span: (4),
}));
const __VLS_30 = __VLS_29({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCategory),
    placeholder: "指标分类",
    allowClear: true,
}));
const __VLS_34 = __VLS_33({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCategory),
    placeholder: "指标分类",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_35.slots.default;
const __VLS_40 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    value: "business",
}));
const __VLS_42 = __VLS_41({
    value: "business",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
var __VLS_43;
const __VLS_44 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    value: "technical",
}));
const __VLS_46 = __VLS_45({
    value: "technical",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
var __VLS_47;
const __VLS_48 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    value: "financial",
}));
const __VLS_50 = __VLS_49({
    value: "financial",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
var __VLS_51;
const __VLS_52 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    value: "risk",
}));
const __VLS_54 = __VLS_53({
    value: "risk",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
var __VLS_55;
var __VLS_35;
var __VLS_31;
const __VLS_56 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    span: (4),
}));
const __VLS_58 = __VLS_57({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedStatus),
    placeholder: "状态",
    allowClear: true,
}));
const __VLS_62 = __VLS_61({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedStatus),
    placeholder: "状态",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_63.slots.default;
const __VLS_68 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    value: "active",
}));
const __VLS_70 = __VLS_69({
    value: "active",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
const __VLS_72 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "inactive",
}));
const __VLS_74 = __VLS_73({
    value: "inactive",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
var __VLS_75;
const __VLS_76 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "draft",
}));
const __VLS_78 = __VLS_77({
    value: "draft",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
var __VLS_63;
var __VLS_59;
var __VLS_15;
const __VLS_80 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.mockData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_82 = __VLS_81({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.mockData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_88 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_83.slots.default;
{
    const { status: __VLS_thisSlot } = __VLS_83.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_89 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_91 = __VLS_90({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_92.slots.default;
    (__VLS_ctx.getStatusText(record.status));
    var __VLS_92;
}
{
    const { category: __VLS_thisSlot } = __VLS_83.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_93 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        color: (__VLS_ctx.getCategoryColor(record.category)),
    }));
    const __VLS_95 = __VLS_94({
        color: (__VLS_ctx.getCategoryColor(record.category)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    __VLS_96.slots.default;
    (__VLS_ctx.getCategoryText(record.category));
    var __VLS_96;
}
{
    const { actions: __VLS_thisSlot } = __VLS_83.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_97 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
    const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
    __VLS_100.slots.default;
    const __VLS_101 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_103 = __VLS_102({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    let __VLS_105;
    let __VLS_106;
    let __VLS_107;
    const __VLS_108 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editMetric(record);
        }
    };
    __VLS_104.slots.default;
    var __VLS_104;
    const __VLS_109 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_111 = __VLS_110({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    let __VLS_113;
    let __VLS_114;
    let __VLS_115;
    const __VLS_116 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewVersionHistory(record);
        }
    };
    __VLS_112.slots.default;
    var __VLS_112;
    const __VLS_117 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_119 = __VLS_118({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    let __VLS_121;
    let __VLS_122;
    let __VLS_123;
    const __VLS_124 = {
        onClick: (...[$event]) => {
            __VLS_ctx.copyMetric(record);
        }
    };
    __VLS_120.slots.default;
    var __VLS_120;
    const __VLS_125 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_127 = __VLS_126({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    let __VLS_129;
    let __VLS_130;
    let __VLS_131;
    const __VLS_132 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteMetric(record);
        }
    };
    __VLS_128.slots.default;
    var __VLS_128;
    var __VLS_100;
}
var __VLS_83;
const __VLS_133 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingMetric?.isViewMode ? '指标详情' : (__VLS_ctx.editingMetric ? '编辑指标' : '新建指标')),
    width: "1000px",
    okText: (__VLS_ctx.editingMetric?.isViewMode ? '关闭' : '确定'),
    cancelText: (__VLS_ctx.editingMetric?.isViewMode ? '' : '取消'),
    hideCancel: (__VLS_ctx.editingMetric?.isViewMode),
}));
const __VLS_135 = __VLS_134({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingMetric?.isViewMode ? '指标详情' : (__VLS_ctx.editingMetric ? '编辑指标' : '新建指标')),
    width: "1000px",
    okText: (__VLS_ctx.editingMetric?.isViewMode ? '关闭' : '确定'),
    cancelText: (__VLS_ctx.editingMetric?.isViewMode ? '' : '取消'),
    hideCancel: (__VLS_ctx.editingMetric?.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
let __VLS_137;
let __VLS_138;
let __VLS_139;
const __VLS_140 = {
    onOk: (__VLS_ctx.handleSubmit)
};
const __VLS_141 = {
    onCancel: (__VLS_ctx.resetForm)
};
__VLS_136.slots.default;
const __VLS_142 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.editingMetric?.isViewMode ? {} : __VLS_ctx.formRules),
    layout: "vertical",
    disabled: (__VLS_ctx.editingMetric?.isViewMode),
}));
const __VLS_144 = __VLS_143({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.editingMetric?.isViewMode ? {} : __VLS_ctx.formRules),
    layout: "vertical",
    disabled: (__VLS_ctx.editingMetric?.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_146 = {};
__VLS_145.slots.default;
const __VLS_148 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    orientation: "left",
}));
const __VLS_150 = __VLS_149({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
var __VLS_151;
const __VLS_152 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    gutter: (16),
}));
const __VLS_154 = __VLS_153({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    span: (12),
}));
const __VLS_158 = __VLS_157({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    label: "指标名称",
    field: "name",
}));
const __VLS_162 = __VLS_161({
    label: "指标名称",
    field: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入指标名称",
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入指标名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
var __VLS_163;
var __VLS_159;
const __VLS_168 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    span: (12),
}));
const __VLS_170 = __VLS_169({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    label: "指标编码",
    field: "code",
}));
const __VLS_174 = __VLS_173({
    label: "指标编码",
    field: "code",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    modelValue: (__VLS_ctx.formData.code),
    placeholder: "请输入指标编码",
}));
const __VLS_178 = __VLS_177({
    modelValue: (__VLS_ctx.formData.code),
    placeholder: "请输入指标编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
var __VLS_175;
var __VLS_171;
var __VLS_155;
const __VLS_180 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    gutter: (16),
}));
const __VLS_182 = __VLS_181({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    span: (8),
}));
const __VLS_186 = __VLS_185({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    label: "指标分类",
    field: "category",
}));
const __VLS_190 = __VLS_189({
    label: "指标分类",
    field: "category",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    modelValue: (__VLS_ctx.formData.category),
    placeholder: "请选择指标分类",
}));
const __VLS_194 = __VLS_193({
    modelValue: (__VLS_ctx.formData.category),
    placeholder: "请选择指标分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    value: "用户指标",
}));
const __VLS_198 = __VLS_197({
    value: "用户指标",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
var __VLS_199;
const __VLS_200 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    value: "业务域",
}));
const __VLS_202 = __VLS_201({
    value: "业务域",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
var __VLS_203;
const __VLS_204 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    value: "技术指标",
}));
const __VLS_206 = __VLS_205({
    value: "技术指标",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
var __VLS_207;
const __VLS_208 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    value: "财务指标",
}));
const __VLS_210 = __VLS_209({
    value: "财务指标",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
var __VLS_211;
const __VLS_212 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    value: "风险指标",
}));
const __VLS_214 = __VLS_213({
    value: "风险指标",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
var __VLS_215;
var __VLS_195;
var __VLS_191;
var __VLS_187;
const __VLS_216 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    span: (8),
}));
const __VLS_218 = __VLS_217({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    label: "业务域",
    field: "businessDomain",
}));
const __VLS_222 = __VLS_221({
    label: "业务域",
    field: "businessDomain",
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
const __VLS_224 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    modelValue: (__VLS_ctx.formData.businessDomain),
    placeholder: "请选择业务域",
}));
const __VLS_226 = __VLS_225({
    modelValue: (__VLS_ctx.formData.businessDomain),
    placeholder: "请选择业务域",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
const __VLS_228 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    value: "留存域",
}));
const __VLS_230 = __VLS_229({
    value: "留存域",
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
var __VLS_231;
const __VLS_232 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    value: "转化域",
}));
const __VLS_234 = __VLS_233({
    value: "转化域",
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
var __VLS_235;
const __VLS_236 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    value: "业务规模",
}));
const __VLS_238 = __VLS_237({
    value: "业务规模",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
var __VLS_239;
const __VLS_240 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    value: "风控域",
}));
const __VLS_242 = __VLS_241({
    value: "风控域",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
var __VLS_243;
var __VLS_227;
var __VLS_223;
var __VLS_219;
const __VLS_244 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    span: (8),
}));
const __VLS_246 = __VLS_245({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
const __VLS_248 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    label: "统计周期",
    field: "statisticalPeriod",
}));
const __VLS_250 = __VLS_249({
    label: "统计周期",
    field: "statisticalPeriod",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    modelValue: (__VLS_ctx.formData.statisticalPeriod),
    placeholder: "请选择统计周期",
}));
const __VLS_254 = __VLS_253({
    modelValue: (__VLS_ctx.formData.statisticalPeriod),
    placeholder: "请选择统计周期",
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    value: "实时",
}));
const __VLS_258 = __VLS_257({
    value: "实时",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
var __VLS_259;
const __VLS_260 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    value: "日更新",
}));
const __VLS_262 = __VLS_261({
    value: "日更新",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
var __VLS_263;
const __VLS_264 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    value: "离线T+1",
}));
const __VLS_266 = __VLS_265({
    value: "离线T+1",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
var __VLS_267;
const __VLS_268 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    value: "离线T+2",
}));
const __VLS_270 = __VLS_269({
    value: "离线T+2",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
var __VLS_271;
const __VLS_272 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    value: "每周",
}));
const __VLS_274 = __VLS_273({
    value: "每周",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
__VLS_275.slots.default;
var __VLS_275;
const __VLS_276 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    value: "每月",
}));
const __VLS_278 = __VLS_277({
    value: "每月",
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
var __VLS_279;
var __VLS_255;
var __VLS_251;
var __VLS_247;
var __VLS_183;
const __VLS_280 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    gutter: (16),
}));
const __VLS_282 = __VLS_281({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
const __VLS_284 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    span: (12),
}));
const __VLS_286 = __VLS_285({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
const __VLS_288 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    label: "负责人",
    field: "owner",
}));
const __VLS_290 = __VLS_289({
    label: "负责人",
    field: "owner",
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
const __VLS_292 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
}));
const __VLS_294 = __VLS_293({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
var __VLS_291;
var __VLS_287;
const __VLS_296 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    span: (12),
}));
const __VLS_298 = __VLS_297({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
const __VLS_300 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    label: "版本号",
    field: "version",
}));
const __VLS_302 = __VLS_301({
    label: "版本号",
    field: "version",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
const __VLS_304 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    modelValue: (__VLS_ctx.formData.version),
    placeholder: "请输入版本号（如：v1.0.0）",
}));
const __VLS_306 = __VLS_305({
    modelValue: (__VLS_ctx.formData.version),
    placeholder: "请输入版本号（如：v1.0.0）",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
var __VLS_303;
var __VLS_299;
var __VLS_283;
const __VLS_308 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    gutter: (16),
}));
const __VLS_310 = __VLS_309({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
__VLS_311.slots.default;
const __VLS_312 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    span: (24),
}));
const __VLS_314 = __VLS_313({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
const __VLS_316 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    label: "版本说明",
}));
const __VLS_318 = __VLS_317({
    label: "版本说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
const __VLS_320 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
    modelValue: (__VLS_ctx.formData.versionDescription),
    placeholder: "请输入本次版本的更新说明",
    rows: (2),
}));
const __VLS_322 = __VLS_321({
    modelValue: (__VLS_ctx.formData.versionDescription),
    placeholder: "请输入本次版本的更新说明",
    rows: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_321));
var __VLS_319;
var __VLS_315;
var __VLS_311;
const __VLS_324 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    orientation: "left",
}));
const __VLS_326 = __VLS_325({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
var __VLS_327;
const __VLS_328 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    label: "业务定义",
    field: "businessDefinition",
}));
const __VLS_330 = __VLS_329({
    label: "业务定义",
    field: "businessDefinition",
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
__VLS_331.slots.default;
const __VLS_332 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
    modelValue: (__VLS_ctx.formData.businessDefinition),
    placeholder: "请输入业务定义",
    rows: (3),
}));
const __VLS_334 = __VLS_333({
    modelValue: (__VLS_ctx.formData.businessDefinition),
    placeholder: "请输入业务定义",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
var __VLS_331;
const __VLS_336 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
    label: "使用场景",
}));
const __VLS_338 = __VLS_337({
    label: "使用场景",
}, ...__VLS_functionalComponentArgsRest(__VLS_337));
__VLS_339.slots.default;
const __VLS_340 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
    modelValue: (__VLS_ctx.formData.useCase),
    placeholder: "请输入使用场景",
    rows: (3),
}));
const __VLS_342 = __VLS_341({
    modelValue: (__VLS_ctx.formData.useCase),
    placeholder: "请输入使用场景",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
var __VLS_339;
const __VLS_344 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
    orientation: "left",
}));
const __VLS_346 = __VLS_345({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_345));
__VLS_347.slots.default;
var __VLS_347;
const __VLS_348 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
    label: "来源表",
    field: "sourceTable",
}));
const __VLS_350 = __VLS_349({
    label: "来源表",
    field: "sourceTable",
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
__VLS_351.slots.default;
const __VLS_352 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
    modelValue: (__VLS_ctx.formData.sourceTable),
    placeholder: "请输入来源表",
}));
const __VLS_354 = __VLS_353({
    modelValue: (__VLS_ctx.formData.sourceTable),
    placeholder: "请输入来源表",
}, ...__VLS_functionalComponentArgsRest(__VLS_353));
var __VLS_351;
const __VLS_356 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
    label: "加工逻辑",
}));
const __VLS_358 = __VLS_357({
    label: "加工逻辑",
}, ...__VLS_functionalComponentArgsRest(__VLS_357));
__VLS_359.slots.default;
const __VLS_360 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
    modelValue: (__VLS_ctx.formData.processingLogic),
    placeholder: "请输入加工逻辑SQL",
    rows: (5),
}));
const __VLS_362 = __VLS_361({
    modelValue: (__VLS_ctx.formData.processingLogic),
    placeholder: "请输入加工逻辑SQL",
    rows: (5),
}, ...__VLS_functionalComponentArgsRest(__VLS_361));
var __VLS_359;
const __VLS_364 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
    label: "字段说明",
}));
const __VLS_366 = __VLS_365({
    label: "字段说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
__VLS_367.slots.default;
const __VLS_368 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({
    modelValue: (__VLS_ctx.formData.fieldDescription),
    placeholder: "请输入字段说明",
    rows: (3),
}));
const __VLS_370 = __VLS_369({
    modelValue: (__VLS_ctx.formData.fieldDescription),
    placeholder: "请输入字段说明",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_369));
var __VLS_367;
const __VLS_372 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
    orientation: "left",
}));
const __VLS_374 = __VLS_373({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_373));
__VLS_375.slots.default;
var __VLS_375;
const __VLS_376 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
    label: "报表列表",
}));
const __VLS_378 = __VLS_377({
    label: "报表列表",
}, ...__VLS_functionalComponentArgsRest(__VLS_377));
__VLS_379.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "report-list" },
});
for (const [report, index] of __VLS_getVForSourceType((__VLS_ctx.formData.reports))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "report-item" },
    });
    const __VLS_380 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
        gutter: (8),
    }));
    const __VLS_382 = __VLS_381({
        gutter: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_381));
    __VLS_383.slots.default;
    const __VLS_384 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
        span: (10),
    }));
    const __VLS_386 = __VLS_385({
        span: (10),
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
    __VLS_387.slots.default;
    const __VLS_388 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({
        modelValue: (report.name),
        placeholder: "请输入报表名称",
    }));
    const __VLS_390 = __VLS_389({
        modelValue: (report.name),
        placeholder: "请输入报表名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_389));
    var __VLS_387;
    const __VLS_392 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
        span: (12),
    }));
    const __VLS_394 = __VLS_393({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_393));
    __VLS_395.slots.default;
    const __VLS_396 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
        modelValue: (report.url),
        placeholder: "请输入报表URL",
    }));
    const __VLS_398 = __VLS_397({
        modelValue: (report.url),
        placeholder: "请输入报表URL",
    }, ...__VLS_functionalComponentArgsRest(__VLS_397));
    var __VLS_395;
    const __VLS_400 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({
        span: (2),
    }));
    const __VLS_402 = __VLS_401({
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_401));
    __VLS_403.slots.default;
    const __VLS_404 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_405 = __VLS_asFunctionalComponent(__VLS_404, new __VLS_404({
        ...{ 'onClick': {} },
        type: "text",
        status: "danger",
        disabled: (__VLS_ctx.formData.reports.length <= 1),
    }));
    const __VLS_406 = __VLS_405({
        ...{ 'onClick': {} },
        type: "text",
        status: "danger",
        disabled: (__VLS_ctx.formData.reports.length <= 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_405));
    let __VLS_408;
    let __VLS_409;
    let __VLS_410;
    const __VLS_411 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeReport(index);
        }
    };
    __VLS_407.slots.default;
    var __VLS_407;
    var __VLS_403;
    var __VLS_383;
}
const __VLS_412 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({
    ...{ 'onClick': {} },
    type: "dashed",
    ...{ class: "add-report-btn" },
}));
const __VLS_414 = __VLS_413({
    ...{ 'onClick': {} },
    type: "dashed",
    ...{ class: "add-report-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_413));
let __VLS_416;
let __VLS_417;
let __VLS_418;
const __VLS_419 = {
    onClick: (__VLS_ctx.addReport)
};
__VLS_415.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_415.slots;
    const __VLS_420 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_421 = __VLS_asFunctionalComponent(__VLS_420, new __VLS_420({}));
    const __VLS_422 = __VLS_421({}, ...__VLS_functionalComponentArgsRest(__VLS_421));
}
var __VLS_415;
var __VLS_379;
const __VLS_424 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_425 = __VLS_asFunctionalComponent(__VLS_424, new __VLS_424({
    orientation: "left",
}));
const __VLS_426 = __VLS_425({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_425));
__VLS_427.slots.default;
var __VLS_427;
const __VLS_428 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_429 = __VLS_asFunctionalComponent(__VLS_428, new __VLS_428({
    label: "存储位置",
}));
const __VLS_430 = __VLS_429({
    label: "存储位置",
}, ...__VLS_functionalComponentArgsRest(__VLS_429));
__VLS_431.slots.default;
const __VLS_432 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_433 = __VLS_asFunctionalComponent(__VLS_432, new __VLS_432({
    modelValue: (__VLS_ctx.formData.storageLocation),
    placeholder: "请输入存储位置",
}));
const __VLS_434 = __VLS_433({
    modelValue: (__VLS_ctx.formData.storageLocation),
    placeholder: "请输入存储位置",
}, ...__VLS_functionalComponentArgsRest(__VLS_433));
var __VLS_431;
const __VLS_436 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_437 = __VLS_asFunctionalComponent(__VLS_436, new __VLS_436({
    label: "查询代码",
}));
const __VLS_438 = __VLS_437({
    label: "查询代码",
}, ...__VLS_functionalComponentArgsRest(__VLS_437));
__VLS_439.slots.default;
const __VLS_440 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_441 = __VLS_asFunctionalComponent(__VLS_440, new __VLS_440({
    modelValue: (__VLS_ctx.formData.queryCode),
    placeholder: "请输入查询代码",
    rows: (5),
}));
const __VLS_442 = __VLS_441({
    modelValue: (__VLS_ctx.formData.queryCode),
    placeholder: "请输入查询代码",
    rows: (5),
}, ...__VLS_functionalComponentArgsRest(__VLS_441));
var __VLS_439;
var __VLS_145;
var __VLS_136;
const __VLS_444 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_445 = __VLS_asFunctionalComponent(__VLS_444, new __VLS_444({
    visible: (__VLS_ctx.showVersionHistoryModal),
    title: "版本历史",
    width: "800px",
    footer: (false),
}));
const __VLS_446 = __VLS_445({
    visible: (__VLS_ctx.showVersionHistoryModal),
    title: "版本历史",
    width: "800px",
    footer: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_445));
__VLS_447.slots.default;
const __VLS_448 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_449 = __VLS_asFunctionalComponent(__VLS_448, new __VLS_448({
    columns: (__VLS_ctx.versionHistoryColumns),
    data: (__VLS_ctx.versionHistoryData),
    pagination: (false),
}));
const __VLS_450 = __VLS_449({
    columns: (__VLS_ctx.versionHistoryColumns),
    data: (__VLS_ctx.versionHistoryData),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_449));
__VLS_451.slots.default;
{
    const { versionStatus: __VLS_thisSlot } = __VLS_451.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_452 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_453 = __VLS_asFunctionalComponent(__VLS_452, new __VLS_452({
        color: (record.versionStatus === 'active' ? 'green' : 'gray'),
    }));
    const __VLS_454 = __VLS_453({
        color: (record.versionStatus === 'active' ? 'green' : 'gray'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_453));
    __VLS_455.slots.default;
    (record.versionStatus === 'active' ? '当前版本' : '历史版本');
    var __VLS_455;
}
{
    const { actions: __VLS_thisSlot } = __VLS_451.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_456 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_457 = __VLS_asFunctionalComponent(__VLS_456, new __VLS_456({}));
    const __VLS_458 = __VLS_457({}, ...__VLS_functionalComponentArgsRest(__VLS_457));
    __VLS_459.slots.default;
    const __VLS_460 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_461 = __VLS_asFunctionalComponent(__VLS_460, new __VLS_460({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_462 = __VLS_461({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_461));
    let __VLS_464;
    let __VLS_465;
    let __VLS_466;
    const __VLS_467 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewVersionDetail(record);
        }
    };
    __VLS_463.slots.default;
    var __VLS_463;
    if (record.versionStatus !== 'active') {
        const __VLS_468 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_469 = __VLS_asFunctionalComponent(__VLS_468, new __VLS_468({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_470 = __VLS_469({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_469));
        let __VLS_472;
        let __VLS_473;
        let __VLS_474;
        const __VLS_475 = {
            onClick: (...[$event]) => {
                if (!(record.versionStatus !== 'active'))
                    return;
                __VLS_ctx.activateVersion(record);
            }
        };
        __VLS_471.slots.default;
        var __VLS_471;
    }
    var __VLS_459;
}
var __VLS_451;
var __VLS_447;
/** @type {__VLS_StyleScopedClasses['metric-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['report-list']} */ ;
/** @type {__VLS_StyleScopedClasses['report-item']} */ ;
/** @type {__VLS_StyleScopedClasses['add-report-btn']} */ ;
// @ts-ignore
var __VLS_147 = __VLS_146;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            loading: loading,
            searchKeyword: searchKeyword,
            selectedCategory: selectedCategory,
            selectedStatus: selectedStatus,
            showCreateModal: showCreateModal,
            showVersionHistoryModal: showVersionHistoryModal,
            editingMetric: editingMetric,
            formRef: formRef,
            versionHistoryData: versionHistoryData,
            columns: columns,
            versionHistoryColumns: versionHistoryColumns,
            mockData: mockData,
            pagination: pagination,
            formData: formData,
            formRules: formRules,
            handleSearch: handleSearch,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
            getStatusColor: getStatusColor,
            getStatusText: getStatusText,
            getCategoryColor: getCategoryColor,
            getCategoryText: getCategoryText,
            addReport: addReport,
            removeReport: removeReport,
            editMetric: editMetric,
            viewVersionHistory: viewVersionHistory,
            viewVersionDetail: viewVersionDetail,
            activateVersion: activateVersion,
            copyMetric: copyMetric,
            deleteMetric: deleteMetric,
            handleSubmit: handleSubmit,
            resetForm: resetForm,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
