import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconUpload, IconSearch } from '@arco-design/web-vue/es/icon';
// 路由
const router = useRouter();
// 导航到采购登记页面
const navigateToRegister = () => {
    router.push('/discovery/asset-management/external-purchase-register');
};
// 处理新增采购项目
const handleCreatePurchaseProject = () => {
    navigateToRegister();
};
// 响应式数据
const activeTab = ref('external-data');
const loading = ref(false);
// 采购项目相关状态
const projectLoading = ref(false);
const projectSearchKeyword = ref('');
const selectedProjectStatus = ref('');
const selectedProjectSupplier = ref('');
const searchKeyword = ref('');
const selectedType = ref('');
const selectedStatus = ref('');
// 搜索表单
const searchForm = ref({
    name: '',
    status: '',
    supplier: ''
});
const showCreateModal = ref(false);
const editingExternalData = ref(null);
const formRef = ref();
// 模态框宽度计算
const modalWidth = computed(() => {
    return Math.min(1000, (typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1200) * 0.9);
});
// 表格列配置
const columns = [
    {
        title: '数源名称',
        dataIndex: 'name',
        slotName: 'name',
        width: 180
    },
    {
        title: '数源种类',
        dataIndex: 'dataCategory',
        width: 120
    },
    {
        title: '接口类型',
        dataIndex: 'interfaceType',
        width: 120
    },
    {
        title: '接口标签',
        dataIndex: 'interfaceTag',
        width: 100
    },
    {
        title: '落库表名',
        dataIndex: 'targetTable',
        width: 150
    },
    {
        title: '供应商',
        dataIndex: 'provider',
        width: 120
    },
    {
        title: '单价（元/条）',
        dataIndex: 'unitPrice',
        width: 120
    },
    {
        title: '负责人',
        dataIndex: 'owner',
        width: 100
    },
    {
        title: '状态',
        dataIndex: 'status',
        slotName: 'status',
        width: 100
    },
    {
        title: '最后更新',
        dataIndex: 'updateTime',
        width: 160
    },
    {
        title: '操作',
        slotName: 'actions',
        width: 220,
        fixed: 'right'
    }
];
// 采购项目表格列配置
const projectColumns = [
    {
        title: '项目名称',
        dataIndex: 'projectName',
        slotName: 'projectName',
        width: 180
    },
    {
        title: '关联供应商',
        dataIndex: 'supplier',
        width: 120
    },
    {
        title: '采购用量',
        dataIndex: 'purchaseVolume',
        width: 120,
        render: ({ record }) => `${record.purchaseVolume}条`
    },
    {
        title: '总金额',
        dataIndex: 'totalAmount',
        width: 120,
        render: ({ record }) => `¥${record.totalAmount.toLocaleString()}`
    },
    {
        title: '采购日期',
        dataIndex: 'purchaseDate',
        width: 120
    },
    {
        title: '关联产品数',
        dataIndex: 'relatedProductCount',
        width: 120
    },
    {
        title: '项目状态',
        dataIndex: 'status',
        slotName: 'projectStatus',
        width: 100
    },
    {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 160
    },
    {
        title: '操作',
        slotName: 'projectActions',
        width: 200,
        fixed: 'right'
    }
];
// 模拟表格数据
const tableData = ref([
    {
        id: 1,
        name: '央行征信数据',
        dataCategory: '征信数据',
        interfaceType: 'REST API',
        interfaceTag: '主接口',
        targetTable: 'credit_data',
        provider: '人民银行征信中心',
        unitPrice: 2.5000,
        owner: '张三',
        description: '个人征信报告、企业征信信息等',
        dataManager: '李管理',
        updateFrequency: '实时',
        dataManagementDescription: '通过API实时获取征信数据，确保数据时效性',
        files: [
            {
                id: 'file1',
                displayName: '征信数据接口文档',
                originalName: 'credit_api_doc.pdf',
                size: 2048576,
                type: 'application/pdf',
                uploadTime: '2024-01-10 09:00:00'
            },
            {
                id: 'file2',
                displayName: '数据字典',
                originalName: 'data_dictionary.xlsx',
                size: 1024000,
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                uploadTime: '2024-01-10 09:30:00'
            }
        ],
        status: 'active',
        updateTime: '2024-01-15 10:30:00'
    },
    {
        id: 2,
        name: '风控评分模型',
        dataCategory: '风控数据',
        interfaceType: '数据库直连',
        interfaceTag: '主接口',
        targetTable: 'risk_score',
        provider: '同盾科技',
        unitPrice: 1.2000,
        owner: '李四',
        description: '客户风险评分、反欺诈模型结果',
        dataManager: '王管理',
        updateFrequency: '日更新',
        dataManagementDescription: '每日凌晨2点通过数据库直连更新风控评分',
        files: [
            {
                id: 'file3',
                displayName: '风控模型说明书',
                originalName: 'risk_model_manual.doc',
                size: 3145728,
                type: 'application/msword',
                uploadTime: '2024-01-12 14:00:00'
            }
        ],
        status: 'active',
        updateTime: '2024-01-14 16:45:00'
    },
    {
        id: 3,
        name: '运营商数据',
        dataCategory: '运营商数据',
        interfaceType: 'SFTP',
        interfaceTag: '备接口',
        targetTable: 'telecom_data',
        provider: '中国移动',
        unitPrice: 0.9200,
        owner: '王五',
        description: '用户通话记录、流量使用、位置信息等',
        dataManager: '赵管理',
        updateFrequency: '每周',
        dataManagementDescription: '每周一上午通过SFTP传输文件',
        files: [],
        status: 'draft',
        updateTime: '2024-01-10 14:20:00'
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
// 采购项目分页配置
const projectPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 5,
    showTotal: true,
    showPageSize: true
});
// 采购项目模拟数据
const projectTableData = ref([
    {
        id: 1,
        projectName: '2024年Q1征信数据采购项目',
        supplier: '供应商A',
        purchaseVolume: 100000,
        totalAmount: 250000,
        purchaseDate: '2024-01-15',
        description: '用于风控模型训练的征信数据采购',
        relatedProductCount: 3,
        status: 'approved',
        createTime: '2024-01-10 09:30:00'
    },
    {
        id: 2,
        projectName: '运营商数据补充采购',
        supplier: '供应商B',
        purchaseVolume: 50000,
        totalAmount: 46000,
        purchaseDate: '2024-01-20',
        description: '补充运营商通话记录和流量数据',
        relatedProductCount: 2,
        status: 'in-progress',
        createTime: '2024-01-18 14:20:00'
    },
    {
        id: 3,
        projectName: '政务数据试点采购',
        supplier: '供应商C',
        purchaseVolume: 20000,
        totalAmount: 80000,
        purchaseDate: '2024-02-01',
        description: '政务数据试点项目，用于业务拓展',
        relatedProductCount: 1,
        status: 'pending',
        createTime: '2024-01-25 11:15:00'
    },
    {
        id: 4,
        projectName: '金融数据年度采购',
        supplier: '供应商A',
        purchaseVolume: 200000,
        totalAmount: 480000,
        purchaseDate: '2024-02-15',
        description: '年度金融数据采购计划',
        relatedProductCount: 5,
        status: 'completed',
        createTime: '2024-01-05 16:45:00'
    },
    {
        id: 5,
        projectName: '风控数据紧急采购',
        purchaseVolume: 30000,
        totalAmount: 36000,
        purchaseDate: '2024-01-30',
        description: '紧急风控数据采购，用于模型优化',
        relatedProductCount: 2,
        status: 'cancelled',
        createTime: '2024-01-28 10:00:00'
    }
]);
// 表单数据
const formData = reactive({
    name: '',
    dataCategory: '',
    interfaceType: '',
    interfaceTag: '',
    targetTable: '',
    provider: '',
    unitPrice: 0,
    owner: '',
    description: '',
    dataManager: '',
    updateFrequency: '',
    dataManagementDescription: '',
    files: []
});
// 表单验证规则
const formRules = {
    name: [
        { required: true, message: '请输入数源名称' }
    ],
    dataCategory: [
        { required: true, message: '请选择数源种类' }
    ],
    interfaceType: [
        { required: true, message: '请选择接口类型' }
    ],
    interfaceTag: [
        { required: true, message: '请选择接口标签' }
    ],
    targetTable: [
        { required: true, message: '请输入落库表名' }
    ],
    provider: [
        { required: true, message: '请输入供应商名称' }
    ],
    unitPrice: [
        { required: true, message: '请输入单价' },
        { type: 'number', min: 0, message: '单价不能小于0' }
    ],
    owner: [
        { required: true, message: '请输入负责人' }
    ],
    description: [
        { required: true, message: '请输入描述信息' }
    ]
};
// 方法
const handleSearch = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 500);
};
const handleTabChange = (key) => {
    activeTab.value = key;
    console.log('切换标签页:', key);
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
// 采购项目相关方法
const handleProjectSearch = () => {
    projectLoading.value = true;
    setTimeout(() => {
        projectLoading.value = false;
    }, 500);
};
const handleProjectPageChange = (page) => {
    projectPagination.current = page;
};
const handleProjectPageSizeChange = (pageSize) => {
    projectPagination.pageSize = pageSize;
    projectPagination.current = 1;
};
const getProjectStatusColor = (status) => {
    const colorMap = {
        pending: 'orange',
        approved: 'blue',
        'in-progress': 'cyan',
        completed: 'green',
        cancelled: 'red'
    };
    return colorMap[status] || 'gray';
};
const getProjectStatusText = (status) => {
    const textMap = {
        pending: '待审核',
        approved: '已审核',
        'in-progress': '进行中',
        completed: '已完成',
        cancelled: '已取消'
    };
    return textMap[status] || '未知';
};
const viewProjectDetail = (record) => {
    console.log('查看项目详情:', record);
    Message.info('查看项目详情功能开发中');
};
const editProject = (record) => {
    console.log('编辑项目:', record);
    // 导航到采购登记页面，传递编辑数据
    router.push({
        path: '/discovery/asset-management/external-purchase-register',
        query: {
            mode: 'edit',
            id: record.id
        },
        state: {
            editData: record
        }
    });
};
const deleteProject = (record) => {
    console.log('删除项目:', record);
    Message.success('删除成功');
};
const viewExternalDataDetail = (record) => {
    editingExternalData.value = { ...record, isViewMode: true };
    Object.assign(formData, record);
    showCreateModal.value = true;
};
const editExternalData = (record) => {
    editingExternalData.value = record;
    Object.assign(formData, record);
    showCreateModal.value = true;
};
const copyExternalData = (record) => {
    const copiedData = { ...record };
    copiedData.name = `${record.name}_副本`;
    delete copiedData.id;
    editingExternalData.value = null;
    Object.assign(formData, copiedData);
    showCreateModal.value = true;
    Message.success('已复制数源，请修改相关信息');
};
const deleteExternalData = (record) => {
    console.log('删除外数:', record);
    Message.success('删除成功');
};
const handleSubmit = async () => {
    // 如果是查看模式，直接关闭弹窗
    if (editingExternalData.value?.isViewMode) {
        showCreateModal.value = false;
        resetForm();
        return;
    }
    try {
        const valid = await formRef.value?.validate();
        if (valid) {
            console.log('提交表单:', formData);
            Message.success(editingExternalData.value ? '编辑成功' : '注册成功');
            showCreateModal.value = false;
            resetForm();
        }
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
const resetForm = () => {
    editingExternalData.value = null;
    Object.assign(formData, {
        name: '',
        dataCategory: '',
        interfaceType: '',
        interfaceTag: '',
        targetTable: '',
        provider: '',
        unitPrice: 0,
        owner: '',
        description: '',
        dataManager: '',
        updateFrequency: '',
        dataManagementDescription: '',
        files: []
    });
    formRef.value?.resetFields();
};
// 文件处理相关方法
const handleFileUpload = (option) => {
    const { file } = option;
    // 检查文件大小（50MB限制）
    if (file.size > 50 * 1024 * 1024) {
        Message.error('文件大小不能超过50MB');
        return;
    }
    // 检查文件类型
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip', '.rar'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
        Message.error('不支持的文件格式');
        return;
    }
    // 模拟文件上传
    const newFile = {
        id: Date.now().toString(),
        displayName: file.name.split('.')[0], // 默认使用文件名（不含扩展名）作为显示名称
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadTime: new Date().toLocaleString()
    };
    formData.files.push(newFile);
    Message.success('文件上传成功');
};
const removeFile = (index) => {
    formData.files.splice(index, 1);
    Message.success('文件删除成功');
};
const downloadFile = (file) => {
    // 模拟文件下载
    Message.info(`正在下载文件: ${file.displayName}`);
    console.log('下载文件:', file);
};
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
onMounted(() => {
    // 初始化数据
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['file-item']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-tips']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "external-data-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
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
    type: "primary",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreateModal = true;
    }
};
__VLS_7.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
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
    type: "outline",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.handleCreatePurchaseProject)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_19;
var __VLS_3;
const __VLS_28 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onChange': {} },
    activeKey: (__VLS_ctx.activeTab),
    type: "card",
}));
const __VLS_30 = __VLS_29({
    ...{ 'onChange': {} },
    activeKey: (__VLS_ctx.activeTab),
    type: "card",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onChange: (__VLS_ctx.handleTabChange)
};
__VLS_31.slots.default;
const __VLS_36 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    key: "external-data",
    title: "外部数据",
}));
const __VLS_38 = __VLS_37({
    key: "external-data",
    title: "外部数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ class: "search-card" },
}));
const __VLS_42 = __VLS_41({
    ...{ class: "search-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_44 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    gutter: (16),
}));
const __VLS_46 = __VLS_45({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    span: (6),
}));
const __VLS_50 = __VLS_49({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchForm.name),
    placeholder: "搜索数据名称、描述",
    allowClear: true,
}));
const __VLS_54 = __VLS_53({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchForm.name),
    placeholder: "搜索数据名称、描述",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onSearch: (__VLS_ctx.handleSearch)
};
var __VLS_55;
var __VLS_51;
const __VLS_60 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    span: (4),
}));
const __VLS_62 = __VLS_61({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.status),
    placeholder: "状态",
    allowClear: true,
}));
const __VLS_66 = __VLS_65({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.status),
    placeholder: "状态",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_67.slots.default;
const __VLS_72 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "active",
}));
const __VLS_74 = __VLS_73({
    value: "active",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
var __VLS_75;
const __VLS_76 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "inactive",
}));
const __VLS_78 = __VLS_77({
    value: "inactive",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
var __VLS_67;
var __VLS_63;
const __VLS_80 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    span: (4),
}));
const __VLS_82 = __VLS_81({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.supplier),
    placeholder: "供应商",
    allowClear: true,
}));
const __VLS_86 = __VLS_85({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.supplier),
    placeholder: "供应商",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_87.slots.default;
const __VLS_92 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    value: "supplier1",
}));
const __VLS_94 = __VLS_93({
    value: "supplier1",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
var __VLS_95;
const __VLS_96 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    value: "supplier2",
}));
const __VLS_98 = __VLS_97({
    value: "supplier2",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
var __VLS_99;
const __VLS_100 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    value: "supplier3",
}));
const __VLS_102 = __VLS_101({
    value: "supplier3",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
var __VLS_103;
const __VLS_104 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    value: "supplier4",
}));
const __VLS_106 = __VLS_105({
    value: "supplier4",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
var __VLS_107;
var __VLS_87;
var __VLS_83;
const __VLS_108 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    span: (4),
}));
const __VLS_110 = __VLS_109({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_114 = __VLS_113({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
let __VLS_116;
let __VLS_117;
let __VLS_118;
const __VLS_119 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_115.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_115.slots;
    const __VLS_120 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
    const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
}
var __VLS_115;
var __VLS_111;
var __VLS_47;
var __VLS_43;
const __VLS_124 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_126 = __VLS_125({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_132 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_127.slots.default;
{
    const { name: __VLS_thisSlot } = __VLS_127.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_133 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
        ...{ 'onClick': {} },
        type: "text",
    }));
    const __VLS_135 = __VLS_134({
        ...{ 'onClick': {} },
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    let __VLS_137;
    let __VLS_138;
    let __VLS_139;
    const __VLS_140 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewExternalDataDetail(record);
        }
    };
    __VLS_136.slots.default;
    (record.name);
    var __VLS_136;
}
{
    const { status: __VLS_thisSlot } = __VLS_127.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_141 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_143 = __VLS_142({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
    __VLS_144.slots.default;
    (__VLS_ctx.getStatusText(record.status));
    var __VLS_144;
}
{
    const { actions: __VLS_thisSlot } = __VLS_127.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_145 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({}));
    const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
    __VLS_148.slots.default;
    const __VLS_149 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_151 = __VLS_150({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    let __VLS_153;
    let __VLS_154;
    let __VLS_155;
    const __VLS_156 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editExternalData(record);
        }
    };
    __VLS_152.slots.default;
    var __VLS_152;
    const __VLS_157 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_159 = __VLS_158({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    let __VLS_161;
    let __VLS_162;
    let __VLS_163;
    const __VLS_164 = {
        onClick: (...[$event]) => {
            __VLS_ctx.copyExternalData(record);
        }
    };
    __VLS_160.slots.default;
    var __VLS_160;
    const __VLS_165 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_167 = __VLS_166({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    let __VLS_169;
    let __VLS_170;
    let __VLS_171;
    const __VLS_172 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteExternalData(record);
        }
    };
    __VLS_168.slots.default;
    var __VLS_168;
    var __VLS_148;
}
var __VLS_127;
var __VLS_39;
const __VLS_173 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    key: "purchase-projects",
    title: "采购项目",
}));
const __VLS_175 = __VLS_174({
    key: "purchase-projects",
    title: "采购项目",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    ...{ class: "search-card" },
}));
const __VLS_179 = __VLS_178({
    ...{ class: "search-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_180.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_181 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
    gutter: (16),
}));
const __VLS_183 = __VLS_182({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
__VLS_184.slots.default;
const __VLS_185 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
    span: (6),
}));
const __VLS_187 = __VLS_186({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_188.slots.default;
const __VLS_189 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.projectSearchKeyword),
    placeholder: "搜索项目名称",
    allowClear: true,
}));
const __VLS_191 = __VLS_190({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.projectSearchKeyword),
    placeholder: "搜索项目名称",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
let __VLS_193;
let __VLS_194;
let __VLS_195;
const __VLS_196 = {
    onSearch: (__VLS_ctx.handleProjectSearch)
};
var __VLS_192;
var __VLS_188;
const __VLS_197 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
    span: (4),
}));
const __VLS_199 = __VLS_198({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_198));
__VLS_200.slots.default;
const __VLS_201 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedProjectStatus),
    placeholder: "项目状态",
    allowClear: true,
}));
const __VLS_203 = __VLS_202({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedProjectStatus),
    placeholder: "项目状态",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
let __VLS_205;
let __VLS_206;
let __VLS_207;
const __VLS_208 = {
    onChange: (__VLS_ctx.handleProjectSearch)
};
__VLS_204.slots.default;
const __VLS_209 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    value: "pending",
}));
const __VLS_211 = __VLS_210({
    value: "pending",
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
__VLS_212.slots.default;
var __VLS_212;
const __VLS_213 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    value: "approved",
}));
const __VLS_215 = __VLS_214({
    value: "approved",
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
__VLS_216.slots.default;
var __VLS_216;
const __VLS_217 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
    value: "in-progress",
}));
const __VLS_219 = __VLS_218({
    value: "in-progress",
}, ...__VLS_functionalComponentArgsRest(__VLS_218));
__VLS_220.slots.default;
var __VLS_220;
const __VLS_221 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
    value: "completed",
}));
const __VLS_223 = __VLS_222({
    value: "completed",
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
__VLS_224.slots.default;
var __VLS_224;
const __VLS_225 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
    value: "cancelled",
}));
const __VLS_227 = __VLS_226({
    value: "cancelled",
}, ...__VLS_functionalComponentArgsRest(__VLS_226));
__VLS_228.slots.default;
var __VLS_228;
var __VLS_204;
var __VLS_200;
const __VLS_229 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    span: (4),
}));
const __VLS_231 = __VLS_230({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
__VLS_232.slots.default;
const __VLS_233 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedProjectSupplier),
    placeholder: "关联供应商",
    allowClear: true,
}));
const __VLS_235 = __VLS_234({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedProjectSupplier),
    placeholder: "关联供应商",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
let __VLS_237;
let __VLS_238;
let __VLS_239;
const __VLS_240 = {
    onChange: (__VLS_ctx.handleProjectSearch)
};
__VLS_236.slots.default;
const __VLS_241 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
    value: "supplier1",
}));
const __VLS_243 = __VLS_242({
    value: "supplier1",
}, ...__VLS_functionalComponentArgsRest(__VLS_242));
__VLS_244.slots.default;
var __VLS_244;
const __VLS_245 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
    value: "supplier2",
}));
const __VLS_247 = __VLS_246({
    value: "supplier2",
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
__VLS_248.slots.default;
var __VLS_248;
const __VLS_249 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
    value: "supplier3",
}));
const __VLS_251 = __VLS_250({
    value: "supplier3",
}, ...__VLS_functionalComponentArgsRest(__VLS_250));
__VLS_252.slots.default;
var __VLS_252;
const __VLS_253 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
    value: "supplier4",
}));
const __VLS_255 = __VLS_254({
    value: "supplier4",
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
__VLS_256.slots.default;
var __VLS_256;
var __VLS_236;
var __VLS_232;
const __VLS_257 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
    span: (4),
}));
const __VLS_259 = __VLS_258({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_258));
__VLS_260.slots.default;
const __VLS_261 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_263 = __VLS_262({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
let __VLS_265;
let __VLS_266;
let __VLS_267;
const __VLS_268 = {
    onClick: (__VLS_ctx.handleProjectSearch)
};
__VLS_264.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_264.slots;
    const __VLS_269 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({}));
    const __VLS_271 = __VLS_270({}, ...__VLS_functionalComponentArgsRest(__VLS_270));
}
var __VLS_264;
var __VLS_260;
var __VLS_184;
var __VLS_180;
const __VLS_273 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.projectColumns),
    data: (__VLS_ctx.projectTableData),
    loading: (__VLS_ctx.projectLoading),
    pagination: (__VLS_ctx.projectPagination),
}));
const __VLS_275 = __VLS_274({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.projectColumns),
    data: (__VLS_ctx.projectTableData),
    loading: (__VLS_ctx.projectLoading),
    pagination: (__VLS_ctx.projectPagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
let __VLS_277;
let __VLS_278;
let __VLS_279;
const __VLS_280 = {
    onPageChange: (__VLS_ctx.handleProjectPageChange)
};
const __VLS_281 = {
    onPageSizeChange: (__VLS_ctx.handleProjectPageSizeChange)
};
__VLS_276.slots.default;
{
    const { projectName: __VLS_thisSlot } = __VLS_276.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_282 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
        ...{ 'onClick': {} },
        type: "text",
    }));
    const __VLS_284 = __VLS_283({
        ...{ 'onClick': {} },
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_283));
    let __VLS_286;
    let __VLS_287;
    let __VLS_288;
    const __VLS_289 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewProjectDetail(record);
        }
    };
    __VLS_285.slots.default;
    (record.projectName);
    var __VLS_285;
}
{
    const { projectStatus: __VLS_thisSlot } = __VLS_276.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_290 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({
        color: (__VLS_ctx.getProjectStatusColor(record.status)),
    }));
    const __VLS_292 = __VLS_291({
        color: (__VLS_ctx.getProjectStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_291));
    __VLS_293.slots.default;
    (__VLS_ctx.getProjectStatusText(record.status));
    var __VLS_293;
}
{
    const { projectActions: __VLS_thisSlot } = __VLS_276.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_294 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({}));
    const __VLS_296 = __VLS_295({}, ...__VLS_functionalComponentArgsRest(__VLS_295));
    __VLS_297.slots.default;
    const __VLS_298 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_300 = __VLS_299({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_299));
    let __VLS_302;
    let __VLS_303;
    let __VLS_304;
    const __VLS_305 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editProject(record);
        }
    };
    __VLS_301.slots.default;
    var __VLS_301;
    const __VLS_306 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_307 = __VLS_asFunctionalComponent(__VLS_306, new __VLS_306({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_308 = __VLS_307({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_307));
    let __VLS_310;
    let __VLS_311;
    let __VLS_312;
    const __VLS_313 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewProjectDetail(record);
        }
    };
    __VLS_309.slots.default;
    var __VLS_309;
    const __VLS_314 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_315 = __VLS_asFunctionalComponent(__VLS_314, new __VLS_314({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_316 = __VLS_315({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_315));
    let __VLS_318;
    let __VLS_319;
    let __VLS_320;
    const __VLS_321 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteProject(record);
        }
    };
    __VLS_317.slots.default;
    var __VLS_317;
    var __VLS_297;
}
var __VLS_276;
var __VLS_176;
var __VLS_31;
const __VLS_322 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_323 = __VLS_asFunctionalComponent(__VLS_322, new __VLS_322({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingExternalData?.isViewMode ? '数源详情' : (__VLS_ctx.editingExternalData ? '编辑数源' : '注册外部数据')),
    width: (__VLS_ctx.modalWidth),
    okText: (__VLS_ctx.editingExternalData?.isViewMode ? '关闭' : '确定'),
    cancelText: (__VLS_ctx.editingExternalData?.isViewMode ? '' : '取消'),
    hideCancel: (__VLS_ctx.editingExternalData?.isViewMode),
}));
const __VLS_324 = __VLS_323({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingExternalData?.isViewMode ? '数源详情' : (__VLS_ctx.editingExternalData ? '编辑数源' : '注册外部数据')),
    width: (__VLS_ctx.modalWidth),
    okText: (__VLS_ctx.editingExternalData?.isViewMode ? '关闭' : '确定'),
    cancelText: (__VLS_ctx.editingExternalData?.isViewMode ? '' : '取消'),
    hideCancel: (__VLS_ctx.editingExternalData?.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_323));
let __VLS_326;
let __VLS_327;
let __VLS_328;
const __VLS_329 = {
    onOk: (__VLS_ctx.handleSubmit)
};
const __VLS_330 = {
    onCancel: (__VLS_ctx.resetForm)
};
__VLS_325.slots.default;
const __VLS_331 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_332 = __VLS_asFunctionalComponent(__VLS_331, new __VLS_331({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.editingExternalData?.isViewMode ? {} : __VLS_ctx.formRules),
    layout: "vertical",
    disabled: (__VLS_ctx.editingExternalData?.isViewMode),
}));
const __VLS_333 = __VLS_332({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.editingExternalData?.isViewMode ? {} : __VLS_ctx.formRules),
    layout: "vertical",
    disabled: (__VLS_ctx.editingExternalData?.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_332));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_335 = {};
__VLS_334.slots.default;
const __VLS_337 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
    orientation: "left",
}));
const __VLS_339 = __VLS_338({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_338));
__VLS_340.slots.default;
var __VLS_340;
const __VLS_341 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
    gutter: (16),
}));
const __VLS_343 = __VLS_342({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_342));
__VLS_344.slots.default;
const __VLS_345 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
    span: (12),
}));
const __VLS_347 = __VLS_346({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_346));
__VLS_348.slots.default;
const __VLS_349 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
    label: "数源名称",
    field: "name",
}));
const __VLS_351 = __VLS_350({
    label: "数源名称",
    field: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_350));
__VLS_352.slots.default;
const __VLS_353 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入数源名称",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_355 = __VLS_354({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入数源名称",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_354));
var __VLS_352;
var __VLS_348;
const __VLS_357 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({
    span: (12),
}));
const __VLS_359 = __VLS_358({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_358));
__VLS_360.slots.default;
const __VLS_361 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_362 = __VLS_asFunctionalComponent(__VLS_361, new __VLS_361({
    label: "数源种类",
    field: "dataCategory",
}));
const __VLS_363 = __VLS_362({
    label: "数源种类",
    field: "dataCategory",
}, ...__VLS_functionalComponentArgsRest(__VLS_362));
__VLS_364.slots.default;
const __VLS_365 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({
    modelValue: (__VLS_ctx.formData.dataCategory),
    placeholder: "请选择数源种类",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_367 = __VLS_366({
    modelValue: (__VLS_ctx.formData.dataCategory),
    placeholder: "请选择数源种类",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_366));
__VLS_368.slots.default;
const __VLS_369 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({
    value: "征信数据",
}));
const __VLS_371 = __VLS_370({
    value: "征信数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_370));
__VLS_372.slots.default;
var __VLS_372;
const __VLS_373 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({
    value: "风控数据",
}));
const __VLS_375 = __VLS_374({
    value: "风控数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_374));
__VLS_376.slots.default;
var __VLS_376;
const __VLS_377 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({
    value: "运营商数据",
}));
const __VLS_379 = __VLS_378({
    value: "运营商数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_378));
__VLS_380.slots.default;
var __VLS_380;
const __VLS_381 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_382 = __VLS_asFunctionalComponent(__VLS_381, new __VLS_381({
    value: "政务数据",
}));
const __VLS_383 = __VLS_382({
    value: "政务数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_382));
__VLS_384.slots.default;
var __VLS_384;
const __VLS_385 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({
    value: "金融数据",
}));
const __VLS_387 = __VLS_386({
    value: "金融数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_386));
__VLS_388.slots.default;
var __VLS_388;
const __VLS_389 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_390 = __VLS_asFunctionalComponent(__VLS_389, new __VLS_389({
    value: "其他",
}));
const __VLS_391 = __VLS_390({
    value: "其他",
}, ...__VLS_functionalComponentArgsRest(__VLS_390));
__VLS_392.slots.default;
var __VLS_392;
var __VLS_368;
var __VLS_364;
var __VLS_360;
var __VLS_344;
const __VLS_393 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_394 = __VLS_asFunctionalComponent(__VLS_393, new __VLS_393({
    gutter: (16),
}));
const __VLS_395 = __VLS_394({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_394));
__VLS_396.slots.default;
const __VLS_397 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({
    span: (8),
}));
const __VLS_399 = __VLS_398({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_398));
__VLS_400.slots.default;
const __VLS_401 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({
    label: "接口类型",
    field: "interfaceType",
}));
const __VLS_403 = __VLS_402({
    label: "接口类型",
    field: "interfaceType",
}, ...__VLS_functionalComponentArgsRest(__VLS_402));
__VLS_404.slots.default;
const __VLS_405 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_406 = __VLS_asFunctionalComponent(__VLS_405, new __VLS_405({
    modelValue: (__VLS_ctx.formData.interfaceType),
    placeholder: "请选择接口类型",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_407 = __VLS_406({
    modelValue: (__VLS_ctx.formData.interfaceType),
    placeholder: "请选择接口类型",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_406));
__VLS_408.slots.default;
const __VLS_409 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_410 = __VLS_asFunctionalComponent(__VLS_409, new __VLS_409({
    value: "REST API",
}));
const __VLS_411 = __VLS_410({
    value: "REST API",
}, ...__VLS_functionalComponentArgsRest(__VLS_410));
__VLS_412.slots.default;
var __VLS_412;
const __VLS_413 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_414 = __VLS_asFunctionalComponent(__VLS_413, new __VLS_413({
    value: "SOAP",
}));
const __VLS_415 = __VLS_414({
    value: "SOAP",
}, ...__VLS_functionalComponentArgsRest(__VLS_414));
__VLS_416.slots.default;
var __VLS_416;
const __VLS_417 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_418 = __VLS_asFunctionalComponent(__VLS_417, new __VLS_417({
    value: "FTP",
}));
const __VLS_419 = __VLS_418({
    value: "FTP",
}, ...__VLS_functionalComponentArgsRest(__VLS_418));
__VLS_420.slots.default;
var __VLS_420;
const __VLS_421 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_422 = __VLS_asFunctionalComponent(__VLS_421, new __VLS_421({
    value: "SFTP",
}));
const __VLS_423 = __VLS_422({
    value: "SFTP",
}, ...__VLS_functionalComponentArgsRest(__VLS_422));
__VLS_424.slots.default;
var __VLS_424;
const __VLS_425 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_426 = __VLS_asFunctionalComponent(__VLS_425, new __VLS_425({
    value: "数据库直连",
}));
const __VLS_427 = __VLS_426({
    value: "数据库直连",
}, ...__VLS_functionalComponentArgsRest(__VLS_426));
__VLS_428.slots.default;
var __VLS_428;
const __VLS_429 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_430 = __VLS_asFunctionalComponent(__VLS_429, new __VLS_429({
    value: "文件传输",
}));
const __VLS_431 = __VLS_430({
    value: "文件传输",
}, ...__VLS_functionalComponentArgsRest(__VLS_430));
__VLS_432.slots.default;
var __VLS_432;
var __VLS_408;
var __VLS_404;
var __VLS_400;
const __VLS_433 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_434 = __VLS_asFunctionalComponent(__VLS_433, new __VLS_433({
    span: (8),
}));
const __VLS_435 = __VLS_434({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_434));
__VLS_436.slots.default;
const __VLS_437 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_438 = __VLS_asFunctionalComponent(__VLS_437, new __VLS_437({
    label: "接口标签",
    field: "interfaceTag",
}));
const __VLS_439 = __VLS_438({
    label: "接口标签",
    field: "interfaceTag",
}, ...__VLS_functionalComponentArgsRest(__VLS_438));
__VLS_440.slots.default;
const __VLS_441 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_442 = __VLS_asFunctionalComponent(__VLS_441, new __VLS_441({
    modelValue: (__VLS_ctx.formData.interfaceTag),
    placeholder: "请选择接口标签",
}));
const __VLS_443 = __VLS_442({
    modelValue: (__VLS_ctx.formData.interfaceTag),
    placeholder: "请选择接口标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_442));
__VLS_444.slots.default;
const __VLS_445 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_446 = __VLS_asFunctionalComponent(__VLS_445, new __VLS_445({
    value: "主接口",
}));
const __VLS_447 = __VLS_446({
    value: "主接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_446));
__VLS_448.slots.default;
var __VLS_448;
const __VLS_449 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_450 = __VLS_asFunctionalComponent(__VLS_449, new __VLS_449({
    value: "备接口",
}));
const __VLS_451 = __VLS_450({
    value: "备接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_450));
__VLS_452.slots.default;
var __VLS_452;
var __VLS_444;
var __VLS_440;
var __VLS_436;
var __VLS_396;
const __VLS_453 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_454 = __VLS_asFunctionalComponent(__VLS_453, new __VLS_453({
    gutter: (16),
}));
const __VLS_455 = __VLS_454({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_454));
__VLS_456.slots.default;
const __VLS_457 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_458 = __VLS_asFunctionalComponent(__VLS_457, new __VLS_457({
    span: (8),
}));
const __VLS_459 = __VLS_458({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_458));
__VLS_460.slots.default;
const __VLS_461 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_462 = __VLS_asFunctionalComponent(__VLS_461, new __VLS_461({
    label: "供应商",
    field: "provider",
}));
const __VLS_463 = __VLS_462({
    label: "供应商",
    field: "provider",
}, ...__VLS_functionalComponentArgsRest(__VLS_462));
__VLS_464.slots.default;
const __VLS_465 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_466 = __VLS_asFunctionalComponent(__VLS_465, new __VLS_465({
    modelValue: (__VLS_ctx.formData.provider),
    placeholder: "请输入供应商名称",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_467 = __VLS_466({
    modelValue: (__VLS_ctx.formData.provider),
    placeholder: "请输入供应商名称",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_466));
var __VLS_464;
var __VLS_460;
const __VLS_469 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_470 = __VLS_asFunctionalComponent(__VLS_469, new __VLS_469({
    span: (8),
}));
const __VLS_471 = __VLS_470({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_470));
__VLS_472.slots.default;
const __VLS_473 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_474 = __VLS_asFunctionalComponent(__VLS_473, new __VLS_473({
    label: "负责人",
    field: "owner",
}));
const __VLS_475 = __VLS_474({
    label: "负责人",
    field: "owner",
}, ...__VLS_functionalComponentArgsRest(__VLS_474));
__VLS_476.slots.default;
const __VLS_477 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_478 = __VLS_asFunctionalComponent(__VLS_477, new __VLS_477({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_479 = __VLS_478({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_478));
var __VLS_476;
var __VLS_472;
var __VLS_456;
const __VLS_481 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_482 = __VLS_asFunctionalComponent(__VLS_481, new __VLS_481({
    gutter: (16),
}));
const __VLS_483 = __VLS_482({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_482));
__VLS_484.slots.default;
const __VLS_485 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_486 = __VLS_asFunctionalComponent(__VLS_485, new __VLS_485({
    span: (12),
}));
const __VLS_487 = __VLS_486({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_486));
__VLS_488.slots.default;
const __VLS_489 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_490 = __VLS_asFunctionalComponent(__VLS_489, new __VLS_489({
    label: "落库表名",
    field: "targetTable",
}));
const __VLS_491 = __VLS_490({
    label: "落库表名",
    field: "targetTable",
}, ...__VLS_functionalComponentArgsRest(__VLS_490));
__VLS_492.slots.default;
const __VLS_493 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_494 = __VLS_asFunctionalComponent(__VLS_493, new __VLS_493({
    modelValue: (__VLS_ctx.formData.targetTable),
    placeholder: "请输入落库表名",
}));
const __VLS_495 = __VLS_494({
    modelValue: (__VLS_ctx.formData.targetTable),
    placeholder: "请输入落库表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_494));
var __VLS_492;
var __VLS_488;
const __VLS_497 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_498 = __VLS_asFunctionalComponent(__VLS_497, new __VLS_497({
    span: (12),
}));
const __VLS_499 = __VLS_498({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_498));
__VLS_500.slots.default;
const __VLS_501 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_502 = __VLS_asFunctionalComponent(__VLS_501, new __VLS_501({
    label: "单价（元/条）",
    field: "unitPrice",
}));
const __VLS_503 = __VLS_502({
    label: "单价（元/条）",
    field: "unitPrice",
}, ...__VLS_functionalComponentArgsRest(__VLS_502));
__VLS_504.slots.default;
const __VLS_505 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_506 = __VLS_asFunctionalComponent(__VLS_505, new __VLS_505({
    modelValue: (__VLS_ctx.formData.unitPrice),
    placeholder: "请输入单价",
    precision: (4),
    min: (0),
    max: (9999.9999),
    ...{ style: {} },
}));
const __VLS_507 = __VLS_506({
    modelValue: (__VLS_ctx.formData.unitPrice),
    placeholder: "请输入单价",
    precision: (4),
    min: (0),
    max: (9999.9999),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_506));
__VLS_508.slots.default;
{
    const { suffix: __VLS_thisSlot } = __VLS_508.slots;
}
var __VLS_508;
var __VLS_504;
var __VLS_500;
var __VLS_484;
const __VLS_509 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_510 = __VLS_asFunctionalComponent(__VLS_509, new __VLS_509({
    gutter: (16),
}));
const __VLS_511 = __VLS_510({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_510));
__VLS_512.slots.default;
const __VLS_513 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_514 = __VLS_asFunctionalComponent(__VLS_513, new __VLS_513({
    span: (24),
}));
const __VLS_515 = __VLS_514({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_514));
__VLS_516.slots.default;
const __VLS_517 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_518 = __VLS_asFunctionalComponent(__VLS_517, new __VLS_517({
    label: "描述信息",
    field: "description",
}));
const __VLS_519 = __VLS_518({
    label: "描述信息",
    field: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_518));
__VLS_520.slots.default;
const __VLS_521 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_522 = __VLS_asFunctionalComponent(__VLS_521, new __VLS_521({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入描述信息",
    rows: (3),
}));
const __VLS_523 = __VLS_522({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入描述信息",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_522));
var __VLS_520;
var __VLS_516;
var __VLS_512;
const __VLS_525 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_526 = __VLS_asFunctionalComponent(__VLS_525, new __VLS_525({
    orientation: "left",
}));
const __VLS_527 = __VLS_526({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_526));
__VLS_528.slots.default;
var __VLS_528;
const __VLS_529 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_530 = __VLS_asFunctionalComponent(__VLS_529, new __VLS_529({
    gutter: (16),
}));
const __VLS_531 = __VLS_530({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_530));
__VLS_532.slots.default;
const __VLS_533 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_534 = __VLS_asFunctionalComponent(__VLS_533, new __VLS_533({
    span: (12),
}));
const __VLS_535 = __VLS_534({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_534));
__VLS_536.slots.default;
const __VLS_537 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_538 = __VLS_asFunctionalComponent(__VLS_537, new __VLS_537({
    label: "数据管理员",
    field: "dataManager",
}));
const __VLS_539 = __VLS_538({
    label: "数据管理员",
    field: "dataManager",
}, ...__VLS_functionalComponentArgsRest(__VLS_538));
__VLS_540.slots.default;
const __VLS_541 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_542 = __VLS_asFunctionalComponent(__VLS_541, new __VLS_541({
    modelValue: (__VLS_ctx.formData.dataManager),
    placeholder: "请输入数据管理员",
}));
const __VLS_543 = __VLS_542({
    modelValue: (__VLS_ctx.formData.dataManager),
    placeholder: "请输入数据管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_542));
var __VLS_540;
var __VLS_536;
const __VLS_545 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_546 = __VLS_asFunctionalComponent(__VLS_545, new __VLS_545({
    span: (12),
}));
const __VLS_547 = __VLS_546({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_546));
__VLS_548.slots.default;
const __VLS_549 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_550 = __VLS_asFunctionalComponent(__VLS_549, new __VLS_549({
    label: "数据更新频率",
    field: "updateFrequency",
}));
const __VLS_551 = __VLS_550({
    label: "数据更新频率",
    field: "updateFrequency",
}, ...__VLS_functionalComponentArgsRest(__VLS_550));
__VLS_552.slots.default;
const __VLS_553 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_554 = __VLS_asFunctionalComponent(__VLS_553, new __VLS_553({
    modelValue: (__VLS_ctx.formData.updateFrequency),
    placeholder: "选择更新频率",
}));
const __VLS_555 = __VLS_554({
    modelValue: (__VLS_ctx.formData.updateFrequency),
    placeholder: "选择更新频率",
}, ...__VLS_functionalComponentArgsRest(__VLS_554));
__VLS_556.slots.default;
const __VLS_557 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_558 = __VLS_asFunctionalComponent(__VLS_557, new __VLS_557({
    value: "实时",
}));
const __VLS_559 = __VLS_558({
    value: "实时",
}, ...__VLS_functionalComponentArgsRest(__VLS_558));
__VLS_560.slots.default;
var __VLS_560;
const __VLS_561 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_562 = __VLS_asFunctionalComponent(__VLS_561, new __VLS_561({
    value: "日更新",
}));
const __VLS_563 = __VLS_562({
    value: "日更新",
}, ...__VLS_functionalComponentArgsRest(__VLS_562));
__VLS_564.slots.default;
var __VLS_564;
const __VLS_565 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_566 = __VLS_asFunctionalComponent(__VLS_565, new __VLS_565({
    value: "离线T+1",
}));
const __VLS_567 = __VLS_566({
    value: "离线T+1",
}, ...__VLS_functionalComponentArgsRest(__VLS_566));
__VLS_568.slots.default;
var __VLS_568;
const __VLS_569 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_570 = __VLS_asFunctionalComponent(__VLS_569, new __VLS_569({
    value: "每周",
}));
const __VLS_571 = __VLS_570({
    value: "每周",
}, ...__VLS_functionalComponentArgsRest(__VLS_570));
__VLS_572.slots.default;
var __VLS_572;
const __VLS_573 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_574 = __VLS_asFunctionalComponent(__VLS_573, new __VLS_573({
    value: "每月",
}));
const __VLS_575 = __VLS_574({
    value: "每月",
}, ...__VLS_functionalComponentArgsRest(__VLS_574));
__VLS_576.slots.default;
var __VLS_576;
var __VLS_556;
var __VLS_552;
var __VLS_548;
var __VLS_532;
const __VLS_577 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_578 = __VLS_asFunctionalComponent(__VLS_577, new __VLS_577({
    gutter: (16),
}));
const __VLS_579 = __VLS_578({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_578));
__VLS_580.slots.default;
const __VLS_581 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_582 = __VLS_asFunctionalComponent(__VLS_581, new __VLS_581({
    span: (24),
}));
const __VLS_583 = __VLS_582({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_582));
__VLS_584.slots.default;
const __VLS_585 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_586 = __VLS_asFunctionalComponent(__VLS_585, new __VLS_585({
    label: "数据管理说明",
}));
const __VLS_587 = __VLS_586({
    label: "数据管理说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_586));
__VLS_588.slots.default;
const __VLS_589 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_590 = __VLS_asFunctionalComponent(__VLS_589, new __VLS_589({
    modelValue: (__VLS_ctx.formData.dataManagementDescription),
    placeholder: "请输入数据管理相关说明",
    rows: (3),
}));
const __VLS_591 = __VLS_590({
    modelValue: (__VLS_ctx.formData.dataManagementDescription),
    placeholder: "请输入数据管理相关说明",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_590));
var __VLS_588;
var __VLS_584;
var __VLS_580;
const __VLS_593 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_594 = __VLS_asFunctionalComponent(__VLS_593, new __VLS_593({
    orientation: "left",
}));
const __VLS_595 = __VLS_594({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_594));
__VLS_596.slots.default;
var __VLS_596;
const __VLS_597 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_598 = __VLS_asFunctionalComponent(__VLS_597, new __VLS_597({
    gutter: (16),
}));
const __VLS_599 = __VLS_598({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_598));
__VLS_600.slots.default;
const __VLS_601 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_602 = __VLS_asFunctionalComponent(__VLS_601, new __VLS_601({
    span: (24),
}));
const __VLS_603 = __VLS_602({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_602));
__VLS_604.slots.default;
const __VLS_605 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_606 = __VLS_asFunctionalComponent(__VLS_605, new __VLS_605({
    label: "相关文件",
}));
const __VLS_607 = __VLS_606({
    label: "相关文件",
}, ...__VLS_functionalComponentArgsRest(__VLS_606));
__VLS_608.slots.default;
if (__VLS_ctx.formData.files && __VLS_ctx.formData.files.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "uploaded-files" },
    });
    for (const [file, index] of __VLS_getVForSourceType((__VLS_ctx.formData.files))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "file-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-info" },
        });
        const __VLS_609 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        const __VLS_610 = __VLS_asFunctionalComponent(__VLS_609, new __VLS_609({
            modelValue: (file.displayName),
            placeholder: "请输入文件名称",
            disabled: (__VLS_ctx.editingExternalData?.isViewMode),
            ...{ class: "file-name-input" },
        }));
        const __VLS_611 = __VLS_610({
            modelValue: (file.displayName),
            placeholder: "请输入文件名称",
            disabled: (__VLS_ctx.editingExternalData?.isViewMode),
            ...{ class: "file-name-input" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_610));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "file-original-name" },
        });
        (file.originalName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "file-size" },
        });
        (__VLS_ctx.formatFileSize(file.size));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-actions" },
        });
        const __VLS_613 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_614 = __VLS_asFunctionalComponent(__VLS_613, new __VLS_613({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_615 = __VLS_614({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_614));
        let __VLS_617;
        let __VLS_618;
        let __VLS_619;
        const __VLS_620 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.formData.files && __VLS_ctx.formData.files.length > 0))
                    return;
                __VLS_ctx.downloadFile(file);
            }
        };
        __VLS_616.slots.default;
        var __VLS_616;
        if (!__VLS_ctx.editingExternalData?.isViewMode) {
            const __VLS_621 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_622 = __VLS_asFunctionalComponent(__VLS_621, new __VLS_621({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }));
            const __VLS_623 = __VLS_622({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_622));
            let __VLS_625;
            let __VLS_626;
            let __VLS_627;
            const __VLS_628 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.formData.files && __VLS_ctx.formData.files.length > 0))
                        return;
                    if (!(!__VLS_ctx.editingExternalData?.isViewMode))
                        return;
                    __VLS_ctx.removeFile(index);
                }
            };
            __VLS_624.slots.default;
            var __VLS_624;
        }
    }
}
if (!__VLS_ctx.editingExternalData?.isViewMode) {
    const __VLS_629 = {}.AUpload;
    /** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ ;
    // @ts-ignore
    const __VLS_630 = __VLS_asFunctionalComponent(__VLS_629, new __VLS_629({
        customRequest: (__VLS_ctx.handleFileUpload),
        showFileList: (false),
        multiple: true,
        accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar",
        ...{ class: "file-upload" },
    }));
    const __VLS_631 = __VLS_630({
        customRequest: (__VLS_ctx.handleFileUpload),
        showFileList: (false),
        multiple: true,
        accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar",
        ...{ class: "file-upload" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_630));
    __VLS_632.slots.default;
    {
        const { 'upload-button': __VLS_thisSlot } = __VLS_632.slots;
        const __VLS_633 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_634 = __VLS_asFunctionalComponent(__VLS_633, new __VLS_633({
            type: "outline",
        }));
        const __VLS_635 = __VLS_634({
            type: "outline",
        }, ...__VLS_functionalComponentArgsRest(__VLS_634));
        __VLS_636.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_636.slots;
            const __VLS_637 = {}.IconUpload;
            /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
            // @ts-ignore
            const __VLS_638 = __VLS_asFunctionalComponent(__VLS_637, new __VLS_637({}));
            const __VLS_639 = __VLS_638({}, ...__VLS_functionalComponentArgsRest(__VLS_638));
        }
        (__VLS_ctx.editingExternalData ? '追加文件' : '上传文件');
        var __VLS_636;
    }
    var __VLS_632;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "upload-tips" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_608;
var __VLS_604;
var __VLS_600;
var __VLS_334;
var __VLS_325;
/** @type {__VLS_StyleScopedClasses['external-data-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['header-info']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['uploaded-files']} */ ;
/** @type {__VLS_StyleScopedClasses['file-item']} */ ;
/** @type {__VLS_StyleScopedClasses['file-info']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name-input']} */ ;
/** @type {__VLS_StyleScopedClasses['file-original-name']} */ ;
/** @type {__VLS_StyleScopedClasses['file-size']} */ ;
/** @type {__VLS_StyleScopedClasses['file-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-tips']} */ ;
// @ts-ignore
var __VLS_336 = __VLS_335;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconUpload: IconUpload,
            IconSearch: IconSearch,
            handleCreatePurchaseProject: handleCreatePurchaseProject,
            activeTab: activeTab,
            loading: loading,
            projectLoading: projectLoading,
            projectSearchKeyword: projectSearchKeyword,
            selectedProjectStatus: selectedProjectStatus,
            selectedProjectSupplier: selectedProjectSupplier,
            searchForm: searchForm,
            showCreateModal: showCreateModal,
            editingExternalData: editingExternalData,
            formRef: formRef,
            modalWidth: modalWidth,
            columns: columns,
            projectColumns: projectColumns,
            tableData: tableData,
            pagination: pagination,
            projectPagination: projectPagination,
            projectTableData: projectTableData,
            formData: formData,
            formRules: formRules,
            handleSearch: handleSearch,
            handleTabChange: handleTabChange,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
            getStatusColor: getStatusColor,
            getStatusText: getStatusText,
            handleProjectSearch: handleProjectSearch,
            handleProjectPageChange: handleProjectPageChange,
            handleProjectPageSizeChange: handleProjectPageSizeChange,
            getProjectStatusColor: getProjectStatusColor,
            getProjectStatusText: getProjectStatusText,
            viewProjectDetail: viewProjectDetail,
            editProject: editProject,
            deleteProject: deleteProject,
            viewExternalDataDetail: viewExternalDataDetail,
            editExternalData: editExternalData,
            copyExternalData: copyExternalData,
            deleteExternalData: deleteExternalData,
            handleSubmit: handleSubmit,
            resetForm: resetForm,
            handleFileUpload: handleFileUpload,
            removeFile: removeFile,
            downloadFile: downloadFile,
            formatFileSize: formatFileSize,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
