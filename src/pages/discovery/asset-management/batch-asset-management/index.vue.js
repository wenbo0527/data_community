/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconUpload, IconSettings, IconInfoCircle } from '@arco-design/web-vue/es/icon';
// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const selectedType = ref('');
const selectedStatus = ref('');
const selectedOwner = ref('');
const showImportModal = ref(false);
const showBatchModal = ref(false);
const selectedRowKeys = ref([]);
const fileList = ref([]);
const uploadRef = ref();
const previewVisible = ref(false);
const previewColumns = ref([]);
const previewData = ref({ total: 0, rows: [] });
// 导入配置
const importConfig = reactive({
    dataType: '', // behavior | credit
    mode: 'append', // append | overwrite
    startRow: 2, // 数据起始行
    batchSize: 1000, // 批次大小
    skipErrors: true // 跳过错误行
});
// 统计数据
const stats = reactive({
    total: 156,
    tables: 89,
    metrics: 45,
    external: 22
});
// 批量操作配置
const batchOperation = reactive({
    type: '',
    value: '',
    scope: 'selected'
});
// 表格列配置
const columns = [
    {
        title: '资产名称',
        dataIndex: 'name',
        width: 200
    },
    {
        title: '资产类型',
        dataIndex: 'assetType',
        slotName: 'assetType',
        width: 100
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
        width: 100
    },
    {
        title: '业务分类',
        dataIndex: 'category',
        width: 120
    },
    {
        title: '状态',
        dataIndex: 'status',
        slotName: 'status',
        width: 100
    },
    {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: 160
    },
    {
        title: '操作',
        slotName: 'actions',
        width: 120,
        fixed: 'right'
    }
];
// 表格数据
const tableData = ref([
    {
        id: 1,
        name: 'user_profile',
        assetType: 'table',
        description: '用户基础信息表',
        owner: '张三',
        category: '用户数据',
        status: 'active',
        updateTime: '2024-01-15 10:30:00'
    },
    {
        id: 2,
        name: '用户活跃度',
        assetType: 'metric',
        description: '统计用户活跃程度的指标',
        owner: '李四',
        category: '业务指标',
        status: 'active',
        updateTime: '2024-01-15 11:45:00'
    },
    {
        id: 3,
        name: '央行征信数据',
        assetType: 'external',
        description: '个人和企业征信数据源',
        owner: '王五',
        category: '外部数据',
        status: 'active',
        updateTime: '2024-01-14 16:20:00'
    }
]);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 3,
    showTotal: true,
    showPageSize: true
});
// 行选择配置
const rowSelection = reactive({
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false
});
// 方法
const handleSearch = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 500);
};
const resetFilters = () => {
    searchKeyword.value = '';
    selectedType.value = '';
    selectedStatus.value = '';
    selectedOwner.value = '';
    handleSearch();
};
const handlePageChange = (page) => {
    pagination.current = page;
};
const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
};
const getTypeColor = (type) => {
    const colorMap = {
        table: 'blue',
        metric: 'green',
        external: 'orange'
    };
    return colorMap[type] || 'gray';
};
const getTypeText = (type) => {
    const textMap = {
        table: '表',
        metric: '指标',
        external: '外数'
    };
    return textMap[type] || '未知';
};
const getStatusColor = (status) => {
    const colorMap = {
        active: 'green',
        inactive: 'orange',
        archived: 'red'
    };
    return colorMap[status] || 'gray';
};
const getStatusText = (status) => {
    const textMap = {
        active: '活跃',
        inactive: '非活跃',
        archived: '已归档'
    };
    return textMap[status] || '未知';
};
const viewAsset = (record) => {
    console.log('查看资产:', record);
};
const editAsset = (record) => {
    console.log('编辑资产:', record);
};
const batchUpdateStatus = (status) => {
    console.log('批量更新状态:', status, selectedRowKeys.value);
    Message.success(`批量${status === 'active' ? '启用' : '停用'}成功`);
};
const batchUpdateOwner = () => {
    console.log('批量分配负责人:', selectedRowKeys.value);
};
const batchDelete = () => {
    console.log('批量删除:', selectedRowKeys.value);
    Message.success('批量删除成功');
};
const exportSelected = () => {
    console.log('导出选中:', selectedRowKeys.value);
    Message.success('导出成功');
};
const handleFileChange = (fileList) => {
    console.log('文件变化:', fileList);
    previewVisible.value = false;
};
const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isExcel) {
        Message.error('只能上传Excel文件！');
        return false;
    }
    if (!isLt10M) {
        Message.error('文件大小不能超过10MB！');
        return false;
    }
    return true;
};
const handleDataTypeChange = () => {
    previewVisible.value = false;
    previewData.value = { total: 0, rows: [] };
};
const getDataTypeText = (type) => {
    const textMap = {
        behavior: '行为变量',
        credit: '征信变量'
    };
    return textMap[type] || '';
};
const handlePreviewData = () => {
    if (!fileList.value.length) {
        Message.warning('请先上传文件');
        return;
    }
    // 模拟数据预览
    if (importConfig.dataType === 'behavior') {
        previewColumns.value = [
            { title: '用户ID', dataIndex: 'userId', width: 100 },
            { title: '行为类型', dataIndex: 'behaviorType', width: 120 },
            { title: '行为时间', dataIndex: 'behaviorTime', width: 160 },
            { title: '行为值', dataIndex: 'behaviorValue', width: 100 },
            { title: '渠道', dataIndex: 'channel', width: 100 }
        ];
        previewData.value = {
            total: 1250,
            rows: [
                { userId: 'U001', behaviorType: '登录', behaviorTime: '2024-01-15 09:30:00', behaviorValue: '1', channel: 'APP' },
                { userId: 'U002', behaviorType: '购买', behaviorTime: '2024-01-15 10:15:00', behaviorValue: '299.00', channel: 'WEB' },
                { userId: 'U003', behaviorType: '浏览', behaviorTime: '2024-01-15 11:20:00', behaviorValue: '5', channel: 'APP' },
                { userId: 'U004', behaviorType: '分享', behaviorTime: '2024-01-15 12:05:00', behaviorValue: '1', channel: 'WEB' },
                { userId: 'U005', behaviorType: '收藏', behaviorTime: '2024-01-15 13:45:00', behaviorValue: '3', channel: 'APP' }
            ]
        };
    }
    else if (importConfig.dataType === 'credit') {
        previewColumns.value = [
            { title: '客户ID', dataIndex: 'customerId', width: 100 },
            { title: '征信分数', dataIndex: 'creditScore', width: 100 },
            { title: '逾期次数', dataIndex: 'overdueCount', width: 100 },
            { title: '负债率', dataIndex: 'debtRatio', width: 100 },
            { title: '更新时间', dataIndex: 'updateTime', width: 160 }
        ];
        previewData.value = {
            total: 856,
            rows: [
                { customerId: 'C001', creditScore: '750', overdueCount: '0', debtRatio: '0.35', updateTime: '2024-01-15' },
                { customerId: 'C002', creditScore: '680', overdueCount: '1', debtRatio: '0.42', updateTime: '2024-01-15' },
                { customerId: 'C003', creditScore: '720', overdueCount: '0', debtRatio: '0.28', updateTime: '2024-01-15' },
                { customerId: 'C004', creditScore: '650', overdueCount: '2', debtRatio: '0.55', updateTime: '2024-01-15' },
                { customerId: 'C005', creditScore: '780', overdueCount: '0', debtRatio: '0.20', updateTime: '2024-01-15' }
            ]
        };
    }
    previewVisible.value = true;
    Message.success('数据预览加载成功');
};
const downloadTemplate = () => {
    if (!importConfig.dataType) {
        Message.warning('请先选择数据类型');
        return;
    }
    const templateMap = {
        behavior: '行为变量导入模板.xlsx',
        credit: '征信变量导入模板.xlsx'
    };
    console.log('下载模板:', templateMap[importConfig.dataType]);
    Message.success(`${getDataTypeText(importConfig.dataType)}模板下载成功`);
};
const handleImport = () => {
    if (!importConfig.dataType) {
        Message.error('请选择数据类型');
        return;
    }
    if (!fileList.value.length) {
        Message.error('请上传Excel文件');
        return;
    }
    loading.value = true;
    // 模拟导入过程
    setTimeout(() => {
        loading.value = false;
        const modeText = importConfig.mode === 'append' ? '新增' : '覆盖';
        Message.success(`${getDataTypeText(importConfig.dataType)}${modeText}导入成功！共处理 ${previewData.value.total} 条数据`);
        showImportModal.value = false;
        resetImportForm();
    }, 2000);
};
const resetImportForm = () => {
    fileList.value = [];
    previewVisible.value = false;
    previewData.value = { total: 0, rows: [] };
    Object.assign(importConfig, {
        dataType: '',
        mode: 'append',
        startRow: 2,
        batchSize: 1000,
        skipErrors: true
    });
};
const handleBatchOperation = () => {
    console.log('批量操作:', batchOperation);
    Message.success('批量操作成功');
    showBatchModal.value = false;
    resetBatchForm();
};
const resetBatchForm = () => {
    Object.assign(batchOperation, {
        type: '',
        value: '',
        scope: 'selected'
    });
};
onMounted(() => {
    // 初始化数据
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "batch-asset-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showImportModal = true;
    }
};
__VLS_7.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconUpload;
    /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_7;
const __VLS_16 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
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
    onClick: (...[$event]) => {
        __VLS_ctx.showBatchModal = true;
    }
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.IconSettings;
    /** @type {[typeof __VLS_components.IconSettings, typeof __VLS_components.iconSettings, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_19;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stats-section" },
});
const __VLS_28 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    gutter: (16),
}));
const __VLS_30 = __VLS_29({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    span: (6),
}));
const __VLS_34 = __VLS_33({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    title: "总资产数",
    value: (__VLS_ctx.stats.total),
}));
const __VLS_42 = __VLS_41({
    title: "总资产数",
    value: (__VLS_ctx.stats.total),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_39;
var __VLS_35;
const __VLS_44 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    span: (6),
}));
const __VLS_46 = __VLS_45({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    title: "表资产",
    value: (__VLS_ctx.stats.tables),
}));
const __VLS_54 = __VLS_53({
    title: "表资产",
    value: (__VLS_ctx.stats.tables),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
var __VLS_47;
const __VLS_56 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    span: (6),
}));
const __VLS_58 = __VLS_57({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    title: "指标资产",
    value: (__VLS_ctx.stats.metrics),
}));
const __VLS_66 = __VLS_65({
    title: "指标资产",
    value: (__VLS_ctx.stats.metrics),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
var __VLS_59;
const __VLS_68 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    span: (6),
}));
const __VLS_70 = __VLS_69({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    title: "外数资产",
    value: (__VLS_ctx.stats.external),
}));
const __VLS_78 = __VLS_77({
    title: "外数资产",
    value: (__VLS_ctx.stats.external),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
var __VLS_75;
var __VLS_71;
var __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_80 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    gutter: (16),
}));
const __VLS_82 = __VLS_81({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    span: (8),
}));
const __VLS_86 = __VLS_85({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索资产名称、描述",
}));
const __VLS_90 = __VLS_89({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索资产名称、描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
let __VLS_92;
let __VLS_93;
let __VLS_94;
const __VLS_95 = {
    onSearch: (__VLS_ctx.handleSearch)
};
var __VLS_91;
var __VLS_87;
const __VLS_96 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    span: (4),
}));
const __VLS_98 = __VLS_97({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedType),
    placeholder: "资产类型",
    allowClear: true,
}));
const __VLS_102 = __VLS_101({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedType),
    placeholder: "资产类型",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
let __VLS_104;
let __VLS_105;
let __VLS_106;
const __VLS_107 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_103.slots.default;
const __VLS_108 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    value: "table",
}));
const __VLS_110 = __VLS_109({
    value: "table",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
var __VLS_111;
const __VLS_112 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    value: "metric",
}));
const __VLS_114 = __VLS_113({
    value: "metric",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
var __VLS_115;
const __VLS_116 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    value: "external",
}));
const __VLS_118 = __VLS_117({
    value: "external",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
var __VLS_119;
var __VLS_103;
var __VLS_99;
const __VLS_120 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    span: (4),
}));
const __VLS_122 = __VLS_121({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedStatus),
    placeholder: "状态",
    allowClear: true,
}));
const __VLS_126 = __VLS_125({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedStatus),
    placeholder: "状态",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_127.slots.default;
const __VLS_132 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    value: "active",
}));
const __VLS_134 = __VLS_133({
    value: "active",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
const __VLS_136 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    value: "inactive",
}));
const __VLS_138 = __VLS_137({
    value: "inactive",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
var __VLS_139;
const __VLS_140 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    value: "archived",
}));
const __VLS_142 = __VLS_141({
    value: "archived",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
var __VLS_143;
var __VLS_127;
var __VLS_123;
const __VLS_144 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    span: (4),
}));
const __VLS_146 = __VLS_145({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedOwner),
    placeholder: "负责人",
    allowClear: true,
}));
const __VLS_150 = __VLS_149({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedOwner),
    placeholder: "负责人",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
let __VLS_152;
let __VLS_153;
let __VLS_154;
const __VLS_155 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_151.slots.default;
const __VLS_156 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    value: "张三",
}));
const __VLS_158 = __VLS_157({
    value: "张三",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
var __VLS_159;
const __VLS_160 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    value: "李四",
}));
const __VLS_162 = __VLS_161({
    value: "李四",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
var __VLS_163;
const __VLS_164 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    value: "王五",
}));
const __VLS_166 = __VLS_165({
    value: "王五",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
var __VLS_167;
var __VLS_151;
var __VLS_147;
const __VLS_168 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    span: (4),
}));
const __VLS_170 = __VLS_169({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    ...{ 'onClick': {} },
    type: "outline",
}));
const __VLS_174 = __VLS_173({
    ...{ 'onClick': {} },
    type: "outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
let __VLS_176;
let __VLS_177;
let __VLS_178;
const __VLS_179 = {
    onClick: (__VLS_ctx.resetFilters)
};
__VLS_175.slots.default;
var __VLS_175;
var __VLS_171;
var __VLS_83;
if (__VLS_ctx.selectedRowKeys.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "batch-toolbar" },
    });
    const __VLS_180 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({}));
    const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedRowKeys.length);
    const __VLS_184 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_186 = __VLS_185({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    let __VLS_188;
    let __VLS_189;
    let __VLS_190;
    const __VLS_191 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.selectedRowKeys.length > 0))
                return;
            __VLS_ctx.batchUpdateStatus('active');
        }
    };
    __VLS_187.slots.default;
    var __VLS_187;
    const __VLS_192 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_194 = __VLS_193({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    let __VLS_196;
    let __VLS_197;
    let __VLS_198;
    const __VLS_199 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.selectedRowKeys.length > 0))
                return;
            __VLS_ctx.batchUpdateStatus('inactive');
        }
    };
    __VLS_195.slots.default;
    var __VLS_195;
    const __VLS_200 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_202 = __VLS_201({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    let __VLS_204;
    let __VLS_205;
    let __VLS_206;
    const __VLS_207 = {
        onClick: (__VLS_ctx.batchUpdateOwner)
    };
    __VLS_203.slots.default;
    var __VLS_203;
    const __VLS_208 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        ...{ 'onClick': {} },
        size: "small",
        status: "danger",
    }));
    const __VLS_210 = __VLS_209({
        ...{ 'onClick': {} },
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    let __VLS_212;
    let __VLS_213;
    let __VLS_214;
    const __VLS_215 = {
        onClick: (__VLS_ctx.batchDelete)
    };
    __VLS_211.slots.default;
    var __VLS_211;
    const __VLS_216 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_218 = __VLS_217({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    let __VLS_220;
    let __VLS_221;
    let __VLS_222;
    const __VLS_223 = {
        onClick: (__VLS_ctx.exportSelected)
    };
    __VLS_219.slots.default;
    var __VLS_219;
    var __VLS_183;
}
const __VLS_224 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    rowSelection: (__VLS_ctx.rowSelection),
}));
const __VLS_226 = __VLS_225({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    rowSelection: (__VLS_ctx.rowSelection),
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
let __VLS_228;
let __VLS_229;
let __VLS_230;
const __VLS_231 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_232 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_227.slots.default;
{
    const { assetType: __VLS_thisSlot } = __VLS_227.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_233 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
        color: (__VLS_ctx.getTypeColor(record.assetType)),
    }));
    const __VLS_235 = __VLS_234({
        color: (__VLS_ctx.getTypeColor(record.assetType)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    __VLS_236.slots.default;
    (__VLS_ctx.getTypeText(record.assetType));
    var __VLS_236;
}
{
    const { status: __VLS_thisSlot } = __VLS_227.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_237 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_239 = __VLS_238({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_238));
    __VLS_240.slots.default;
    (__VLS_ctx.getStatusText(record.status));
    var __VLS_240;
}
{
    const { actions: __VLS_thisSlot } = __VLS_227.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_241 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({}));
    const __VLS_243 = __VLS_242({}, ...__VLS_functionalComponentArgsRest(__VLS_242));
    __VLS_244.slots.default;
    const __VLS_245 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_247 = __VLS_246({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_246));
    let __VLS_249;
    let __VLS_250;
    let __VLS_251;
    const __VLS_252 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewAsset(record);
        }
    };
    __VLS_248.slots.default;
    var __VLS_248;
    const __VLS_253 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_255 = __VLS_254({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    let __VLS_257;
    let __VLS_258;
    let __VLS_259;
    const __VLS_260 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editAsset(record);
        }
    };
    __VLS_256.slots.default;
    var __VLS_256;
    var __VLS_244;
}
var __VLS_227;
const __VLS_261 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showImportModal),
    title: "批量数据导入",
    width: "700px",
}));
const __VLS_263 = __VLS_262({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showImportModal),
    title: "批量数据导入",
    width: "700px",
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
let __VLS_265;
let __VLS_266;
let __VLS_267;
const __VLS_268 = {
    onOk: (__VLS_ctx.handleImport)
};
const __VLS_269 = {
    onCancel: (__VLS_ctx.resetImportForm)
};
__VLS_264.slots.default;
const __VLS_270 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
    model: (__VLS_ctx.importConfig),
    layout: "vertical",
}));
const __VLS_272 = __VLS_271({
    model: (__VLS_ctx.importConfig),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_271));
__VLS_273.slots.default;
const __VLS_274 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
    label: "数据类型",
}));
const __VLS_276 = __VLS_275({
    label: "数据类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_275));
__VLS_277.slots.default;
const __VLS_278 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.importConfig.dataType),
    placeholder: "选择数据类型",
}));
const __VLS_280 = __VLS_279({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.importConfig.dataType),
    placeholder: "选择数据类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_279));
let __VLS_282;
let __VLS_283;
let __VLS_284;
const __VLS_285 = {
    onChange: (__VLS_ctx.handleDataTypeChange)
};
__VLS_281.slots.default;
const __VLS_286 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({
    value: "behavior",
}));
const __VLS_288 = __VLS_287({
    value: "behavior",
}, ...__VLS_functionalComponentArgsRest(__VLS_287));
__VLS_289.slots.default;
var __VLS_289;
const __VLS_290 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({
    value: "credit",
}));
const __VLS_292 = __VLS_291({
    value: "credit",
}, ...__VLS_functionalComponentArgsRest(__VLS_291));
__VLS_293.slots.default;
var __VLS_293;
var __VLS_281;
var __VLS_277;
const __VLS_294 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
    label: "导入模式",
}));
const __VLS_296 = __VLS_295({
    label: "导入模式",
}, ...__VLS_functionalComponentArgsRest(__VLS_295));
__VLS_297.slots.default;
const __VLS_298 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({
    modelValue: (__VLS_ctx.importConfig.mode),
}));
const __VLS_300 = __VLS_299({
    modelValue: (__VLS_ctx.importConfig.mode),
}, ...__VLS_functionalComponentArgsRest(__VLS_299));
__VLS_301.slots.default;
const __VLS_302 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_303 = __VLS_asFunctionalComponent(__VLS_302, new __VLS_302({
    value: "append",
}));
const __VLS_304 = __VLS_303({
    value: "append",
}, ...__VLS_functionalComponentArgsRest(__VLS_303));
__VLS_305.slots.default;
var __VLS_305;
const __VLS_306 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_307 = __VLS_asFunctionalComponent(__VLS_306, new __VLS_306({
    value: "overwrite",
}));
const __VLS_308 = __VLS_307({
    value: "overwrite",
}, ...__VLS_functionalComponentArgsRest(__VLS_307));
__VLS_309.slots.default;
var __VLS_309;
var __VLS_301;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.br)({});
var __VLS_297;
const __VLS_310 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({
    label: "上传Excel文件",
}));
const __VLS_312 = __VLS_311({
    label: "上传Excel文件",
}, ...__VLS_functionalComponentArgsRest(__VLS_311));
__VLS_313.slots.default;
const __VLS_314 = {}.AUpload;
/** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ ;
// @ts-ignore
const __VLS_315 = __VLS_asFunctionalComponent(__VLS_314, new __VLS_314({
    ...{ 'onChange': {} },
    ...{ 'onBeforeUpload': {} },
    ref: "uploadRef",
    fileList: (__VLS_ctx.fileList),
    autoUpload: (false),
    accept: ".xlsx,.xls",
    limit: (1),
}));
const __VLS_316 = __VLS_315({
    ...{ 'onChange': {} },
    ...{ 'onBeforeUpload': {} },
    ref: "uploadRef",
    fileList: (__VLS_ctx.fileList),
    autoUpload: (false),
    accept: ".xlsx,.xls",
    limit: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_315));
let __VLS_318;
let __VLS_319;
let __VLS_320;
const __VLS_321 = {
    onChange: (__VLS_ctx.handleFileChange)
};
const __VLS_322 = {
    onBeforeUpload: (__VLS_ctx.beforeUpload)
};
/** @type {typeof __VLS_ctx.uploadRef} */ ;
var __VLS_323 = {};
__VLS_317.slots.default;
{
    const { 'upload-button': __VLS_thisSlot } = __VLS_317.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-area" },
    });
    const __VLS_325 = {}.IconUpload;
    /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
    // @ts-ignore
    const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
        ...{ style: {} },
    }));
    const __VLS_327 = __VLS_326({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_326));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
}
var __VLS_317;
var __VLS_313;
if (__VLS_ctx.importConfig.dataType) {
    const __VLS_329 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({}));
    const __VLS_331 = __VLS_330({}, ...__VLS_functionalComponentArgsRest(__VLS_330));
    __VLS_332.slots.default;
    const __VLS_333 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({}));
    const __VLS_335 = __VLS_334({}, ...__VLS_functionalComponentArgsRest(__VLS_334));
    __VLS_336.slots.default;
    const __VLS_337 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
        ...{ 'onClick': {} },
        type: "outline",
    }));
    const __VLS_339 = __VLS_338({
        ...{ 'onClick': {} },
        type: "outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_338));
    let __VLS_341;
    let __VLS_342;
    let __VLS_343;
    const __VLS_344 = {
        onClick: (__VLS_ctx.downloadTemplate)
    };
    __VLS_340.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_340.slots;
        const __VLS_345 = {}.IconInfoCircle;
        /** @type {[typeof __VLS_components.IconInfoCircle, typeof __VLS_components.iconInfoCircle, ]} */ ;
        // @ts-ignore
        const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({}));
        const __VLS_347 = __VLS_346({}, ...__VLS_functionalComponentArgsRest(__VLS_346));
    }
    (__VLS_ctx.getDataTypeText(__VLS_ctx.importConfig.dataType));
    var __VLS_340;
    const __VLS_349 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
        ...{ 'onClick': {} },
        type: "text",
        disabled: (!__VLS_ctx.fileList.length),
    }));
    const __VLS_351 = __VLS_350({
        ...{ 'onClick': {} },
        type: "text",
        disabled: (!__VLS_ctx.fileList.length),
    }, ...__VLS_functionalComponentArgsRest(__VLS_350));
    let __VLS_353;
    let __VLS_354;
    let __VLS_355;
    const __VLS_356 = {
        onClick: (__VLS_ctx.handlePreviewData)
    };
    __VLS_352.slots.default;
    var __VLS_352;
    var __VLS_336;
    var __VLS_332;
}
if (__VLS_ctx.previewVisible) {
    const __VLS_357 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({
        label: "数据预览",
    }));
    const __VLS_359 = __VLS_358({
        label: "数据预览",
    }, ...__VLS_functionalComponentArgsRest(__VLS_358));
    __VLS_360.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_361 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_362 = __VLS_asFunctionalComponent(__VLS_361, new __VLS_361({
        color: "blue",
    }));
    const __VLS_363 = __VLS_362({
        color: "blue",
    }, ...__VLS_functionalComponentArgsRest(__VLS_362));
    __VLS_364.slots.default;
    (__VLS_ctx.previewData.total);
    var __VLS_364;
    const __VLS_365 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({
        columns: (__VLS_ctx.previewColumns),
        data: (__VLS_ctx.previewData.rows),
        pagination: (false),
        size: "small",
        scroll: ({ x: 800 }),
    }));
    const __VLS_367 = __VLS_366({
        columns: (__VLS_ctx.previewColumns),
        data: (__VLS_ctx.previewData.rows),
        pagination: (false),
        size: "small",
        scroll: ({ x: 800 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_366));
    var __VLS_360;
}
if (__VLS_ctx.importConfig.dataType) {
    const __VLS_369 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({
        label: "导入配置",
    }));
    const __VLS_371 = __VLS_370({
        label: "导入配置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_370));
    __VLS_372.slots.default;
    const __VLS_373 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({
        gutter: (16),
    }));
    const __VLS_375 = __VLS_374({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_374));
    __VLS_376.slots.default;
    const __VLS_377 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({
        span: (12),
    }));
    const __VLS_379 = __VLS_378({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_378));
    __VLS_380.slots.default;
    const __VLS_381 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_382 = __VLS_asFunctionalComponent(__VLS_381, new __VLS_381({
        label: "数据起始行",
        size: "small",
    }));
    const __VLS_383 = __VLS_382({
        label: "数据起始行",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_382));
    __VLS_384.slots.default;
    const __VLS_385 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({
        modelValue: (__VLS_ctx.importConfig.startRow),
        min: (1),
        max: (100),
    }));
    const __VLS_387 = __VLS_386({
        modelValue: (__VLS_ctx.importConfig.startRow),
        min: (1),
        max: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_386));
    var __VLS_384;
    var __VLS_380;
    const __VLS_389 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_390 = __VLS_asFunctionalComponent(__VLS_389, new __VLS_389({
        span: (12),
    }));
    const __VLS_391 = __VLS_390({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_390));
    __VLS_392.slots.default;
    const __VLS_393 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_394 = __VLS_asFunctionalComponent(__VLS_393, new __VLS_393({
        label: "批次大小",
        size: "small",
    }));
    const __VLS_395 = __VLS_394({
        label: "批次大小",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_394));
    __VLS_396.slots.default;
    const __VLS_397 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({
        modelValue: (__VLS_ctx.importConfig.batchSize),
        min: (100),
        max: (10000),
    }));
    const __VLS_399 = __VLS_398({
        modelValue: (__VLS_ctx.importConfig.batchSize),
        min: (100),
        max: (10000),
    }, ...__VLS_functionalComponentArgsRest(__VLS_398));
    var __VLS_396;
    var __VLS_392;
    var __VLS_376;
    const __VLS_401 = {}.ACheckbox;
    /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({
        modelValue: (__VLS_ctx.importConfig.skipErrors),
    }));
    const __VLS_403 = __VLS_402({
        modelValue: (__VLS_ctx.importConfig.skipErrors),
    }, ...__VLS_functionalComponentArgsRest(__VLS_402));
    __VLS_404.slots.default;
    var __VLS_404;
    var __VLS_372;
}
var __VLS_273;
var __VLS_264;
const __VLS_405 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_406 = __VLS_asFunctionalComponent(__VLS_405, new __VLS_405({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showBatchModal),
    title: "批量操作配置",
    width: "500px",
}));
const __VLS_407 = __VLS_406({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showBatchModal),
    title: "批量操作配置",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_406));
let __VLS_409;
let __VLS_410;
let __VLS_411;
const __VLS_412 = {
    onOk: (__VLS_ctx.handleBatchOperation)
};
const __VLS_413 = {
    onCancel: (__VLS_ctx.resetBatchForm)
};
__VLS_408.slots.default;
const __VLS_414 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_415 = __VLS_asFunctionalComponent(__VLS_414, new __VLS_414({
    model: (__VLS_ctx.batchOperation),
    layout: "vertical",
}));
const __VLS_416 = __VLS_415({
    model: (__VLS_ctx.batchOperation),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_415));
__VLS_417.slots.default;
const __VLS_418 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({
    label: "操作类型",
}));
const __VLS_420 = __VLS_419({
    label: "操作类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_419));
__VLS_421.slots.default;
const __VLS_422 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_423 = __VLS_asFunctionalComponent(__VLS_422, new __VLS_422({
    modelValue: (__VLS_ctx.batchOperation.type),
    placeholder: "选择操作类型",
}));
const __VLS_424 = __VLS_423({
    modelValue: (__VLS_ctx.batchOperation.type),
    placeholder: "选择操作类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_423));
__VLS_425.slots.default;
const __VLS_426 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_427 = __VLS_asFunctionalComponent(__VLS_426, new __VLS_426({
    value: "updateStatus",
}));
const __VLS_428 = __VLS_427({
    value: "updateStatus",
}, ...__VLS_functionalComponentArgsRest(__VLS_427));
__VLS_429.slots.default;
var __VLS_429;
const __VLS_430 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({
    value: "updateOwner",
}));
const __VLS_432 = __VLS_431({
    value: "updateOwner",
}, ...__VLS_functionalComponentArgsRest(__VLS_431));
__VLS_433.slots.default;
var __VLS_433;
const __VLS_434 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_435 = __VLS_asFunctionalComponent(__VLS_434, new __VLS_434({
    value: "updateCategory",
}));
const __VLS_436 = __VLS_435({
    value: "updateCategory",
}, ...__VLS_functionalComponentArgsRest(__VLS_435));
__VLS_437.slots.default;
var __VLS_437;
const __VLS_438 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_439 = __VLS_asFunctionalComponent(__VLS_438, new __VLS_438({
    value: "addTags",
}));
const __VLS_440 = __VLS_439({
    value: "addTags",
}, ...__VLS_functionalComponentArgsRest(__VLS_439));
__VLS_441.slots.default;
var __VLS_441;
var __VLS_425;
var __VLS_421;
if (__VLS_ctx.batchOperation.type) {
    const __VLS_442 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({
        label: "目标值",
    }));
    const __VLS_444 = __VLS_443({
        label: "目标值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_443));
    __VLS_445.slots.default;
    const __VLS_446 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_447 = __VLS_asFunctionalComponent(__VLS_446, new __VLS_446({
        modelValue: (__VLS_ctx.batchOperation.value),
        placeholder: "请输入目标值",
    }));
    const __VLS_448 = __VLS_447({
        modelValue: (__VLS_ctx.batchOperation.value),
        placeholder: "请输入目标值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_447));
    var __VLS_445;
}
const __VLS_450 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_451 = __VLS_asFunctionalComponent(__VLS_450, new __VLS_450({
    label: "应用范围",
}));
const __VLS_452 = __VLS_451({
    label: "应用范围",
}, ...__VLS_functionalComponentArgsRest(__VLS_451));
__VLS_453.slots.default;
const __VLS_454 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({
    modelValue: (__VLS_ctx.batchOperation.scope),
}));
const __VLS_456 = __VLS_455({
    modelValue: (__VLS_ctx.batchOperation.scope),
}, ...__VLS_functionalComponentArgsRest(__VLS_455));
__VLS_457.slots.default;
const __VLS_458 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_459 = __VLS_asFunctionalComponent(__VLS_458, new __VLS_458({
    value: "selected",
}));
const __VLS_460 = __VLS_459({
    value: "selected",
}, ...__VLS_functionalComponentArgsRest(__VLS_459));
__VLS_461.slots.default;
var __VLS_461;
const __VLS_462 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_463 = __VLS_asFunctionalComponent(__VLS_462, new __VLS_462({
    value: "filtered",
}));
const __VLS_464 = __VLS_463({
    value: "filtered",
}, ...__VLS_functionalComponentArgsRest(__VLS_463));
__VLS_465.slots.default;
var __VLS_465;
const __VLS_466 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_467 = __VLS_asFunctionalComponent(__VLS_466, new __VLS_466({
    value: "all",
}));
const __VLS_468 = __VLS_467({
    value: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_467));
__VLS_469.slots.default;
var __VLS_469;
var __VLS_457;
var __VLS_453;
var __VLS_417;
var __VLS_408;
/** @type {__VLS_StyleScopedClasses['batch-asset-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
// @ts-ignore
var __VLS_324 = __VLS_323;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconSettings: IconSettings,
            IconInfoCircle: IconInfoCircle,
            loading: loading,
            searchKeyword: searchKeyword,
            selectedType: selectedType,
            selectedStatus: selectedStatus,
            selectedOwner: selectedOwner,
            showImportModal: showImportModal,
            showBatchModal: showBatchModal,
            selectedRowKeys: selectedRowKeys,
            fileList: fileList,
            uploadRef: uploadRef,
            previewVisible: previewVisible,
            previewColumns: previewColumns,
            previewData: previewData,
            importConfig: importConfig,
            stats: stats,
            batchOperation: batchOperation,
            columns: columns,
            tableData: tableData,
            pagination: pagination,
            rowSelection: rowSelection,
            handleSearch: handleSearch,
            resetFilters: resetFilters,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
            getTypeColor: getTypeColor,
            getTypeText: getTypeText,
            getStatusColor: getStatusColor,
            getStatusText: getStatusText,
            viewAsset: viewAsset,
            editAsset: editAsset,
            batchUpdateStatus: batchUpdateStatus,
            batchUpdateOwner: batchUpdateOwner,
            batchDelete: batchDelete,
            exportSelected: exportSelected,
            handleFileChange: handleFileChange,
            beforeUpload: beforeUpload,
            handleDataTypeChange: handleDataTypeChange,
            getDataTypeText: getDataTypeText,
            handlePreviewData: handlePreviewData,
            downloadTemplate: downloadTemplate,
            handleImport: handleImport,
            resetImportForm: resetImportForm,
            handleBatchOperation: handleBatchOperation,
            resetBatchForm: resetBatchForm,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
