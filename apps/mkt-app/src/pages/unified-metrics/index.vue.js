import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconDownload, IconStar, IconStarFill } from '@arco-design/web-vue/es/icon';
import metricsMock from '@/mock/metrics';
// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const selectedCategory = ref('');
const selectedDomain = ref('');
const selectedStatus = ref('');
const selectedKeys = ref([]);
const showCreateModal = ref(false);
const showVersionHistoryModal = ref(false);
const drawerVisible = ref(false);
const editingMetric = ref(null);
const currentMetric = ref(null);
const formRef = ref();
const versionHistoryData = ref([]);
// 搜索表单
const searchForm = ref({
    name: '',
    category: '',
    businessDomain: '',
    status: '',
    onlyFavorite: false,
    isFavorite: false
});
// 分页
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10
});
// 表格数据
const tableData = ref([]);
// 树形数据
const treeData = ref([
    {
        title: '业务指标',
        key: 'business',
        children: [
            { title: '用户域', key: 'business-user' },
            { title: '交易域', key: 'business-transaction' },
            { title: '产品域', key: 'business-product' }
        ]
    },
    {
        title: '技术指标',
        key: 'technical',
        children: [
            { title: '性能指标', key: 'technical-performance' },
            { title: '质量指标', key: 'technical-quality' }
        ]
    },
    {
        title: '财务指标',
        key: 'financial',
        children: [
            { title: '收入指标', key: 'financial-revenue' },
            { title: '成本指标', key: 'financial-cost' }
        ]
    },
    {
        title: '风险指标',
        key: 'risk',
        children: [
            { title: '信用风险', key: 'risk-credit' },
            { title: '操作风险', key: 'risk-operation' }
        ]
    }
]);
// 表单数据
const formData = reactive({
    name: '',
    code: '',
    category: '',
    businessDomain: '',
    statisticalPeriod: '',
    owner: '',
    version: '',
    businessDefinition: '',
    useCase: '',
    sourceTable: '',
    processingLogic: '',
    fieldDescription: '',
    storageLocation: '',
    queryCode: '',
    status: 'active'
});
// 表单验证规则
const formRules = {
    name: [{ required: true, message: '请输入指标名称' }],
    code: [{ required: true, message: '请输入指标编码' }],
    category: [{ required: true, message: '请选择指标分类' }],
    businessDomain: [{ required: true, message: '请选择业务域' }],
    owner: [{ required: true, message: '请输入负责人' }],
    businessDefinition: [{ required: true, message: '请输入业务定义' }],
    sourceTable: [{ required: true, message: '请输入来源表' }]
};
// 版本历史表格列
const versionHistoryColumns = [
    { title: '版本号', dataIndex: 'version' },
    { title: '状态', dataIndex: 'versionStatus', slotName: 'versionStatus' },
    { title: '更新时间', dataIndex: 'updateTime' },
    { title: '更新人', dataIndex: 'updater' },
    { title: '版本说明', dataIndex: 'description' },
    { title: '操作', slotName: 'actions', width: 150 }
];
// 获取指标列表
const fetchMetrics = async () => {
    try {
        loading.value = true;
        console.log('请求参数:', {
            page: pagination.value.current,
            pageSize: pagination.value.pageSize,
            ...searchForm.value
        });
        // 使用 mock 数据
        const queryParams = {
            ...searchForm.value,
            page: pagination.value.current + '',
            pageSize: pagination.value.pageSize + ''
        };
        if (searchForm.value.onlyFavorite) {
            queryParams.isFavorite = true;
        }
        const mockList = metricsMock[0].response({ query: queryParams });
        console.log('Mock数据:', mockList);
        if (mockList && mockList.data) {
            tableData.value = mockList.data.list || [];
            pagination.value.total = mockList.data.total || 0;
        }
        else {
            tableData.value = [];
            pagination.value.total = 0;
        }
    }
    catch (error) {
        console.error('获取指标列表失败:', error);
        tableData.value = [];
        pagination.value.total = 0;
    }
    finally {
        loading.value = false;
    }
};
// 搜索处理
const handleSearch = () => {
    // 同步搜索表单数据
    searchForm.value.name = searchKeyword.value;
    searchForm.value.category = selectedCategory.value;
    searchForm.value.businessDomain = selectedDomain.value;
    searchForm.value.status = selectedStatus.value;
    pagination.value.current = 1;
    fetchMetrics();
};
// 分页处理
const onPageChange = (current) => {
    pagination.value.current = current;
    fetchMetrics();
};
const handlePageSizeChange = (pageSize) => {
    pagination.value.pageSize = pageSize;
    pagination.value.current = 1;
    fetchMetrics();
};
// 树形导航选择
const onTreeSelect = (selectedKeys, data) => {
    if (selectedKeys.length === 0) {
        selectedCategory.value = '';
        selectedDomain.value = '';
        handleSearch();
        return;
    }
    const selectedKey = String(selectedKeys[0]);
    if (selectedKey.includes('-')) {
        const [category, domain] = selectedKey.split('-');
        selectedCategory.value = category;
        selectedDomain.value = domain;
    }
    else {
        selectedCategory.value = selectedKey;
        selectedDomain.value = '';
    }
    handleSearch();
};
// 显示详情
const showDetail = (record) => {
    currentMetric.value = record;
    drawerVisible.value = true;
};
// 关闭详情抽屉
const closeDrawer = () => {
    drawerVisible.value = false;
    currentMetric.value = null;
};
// 收藏切换
const toggleFavorite = (record) => {
    record.isFavorite = !record.isFavorite;
    Message.success(record.isFavorite ? '已添加到收藏' : '已取消收藏');
};
const toggleFavoriteFilter = () => {
    searchForm.value.onlyFavorite = !searchForm.value.onlyFavorite;
    handleSearch();
};
// 编辑指标
const editMetric = (record) => {
    editingMetric.value = record;
    // 填充表单数据
    Object.assign(formData, record);
    showCreateModal.value = true;
};
// 复制指标
const copyMetric = (record) => {
    editingMetric.value = null;
    // 填充表单数据，但清空名称和编码
    Object.assign(formData, {
        ...record,
        name: record.name + '_副本',
        code: record.code + '_copy',
        version: 'v1.0.0'
    });
    showCreateModal.value = true;
};
// 删除指标
const deleteMetric = (record) => {
    Message.success('指标删除成功');
    fetchMetrics();
};
// 查看版本历史
const viewVersionHistory = (record) => {
    // 模拟版本历史数据
    versionHistoryData.value = [
        {
            version: 'v1.2.0',
            versionStatus: 'active',
            updateTime: '2024-01-15 10:30:00',
            updater: '张三',
            description: '优化计算逻辑，提升性能'
        },
        {
            version: 'v1.1.0',
            versionStatus: 'inactive',
            updateTime: '2024-01-10 14:20:00',
            updater: '李四',
            description: '修复数据统计bug'
        },
        {
            version: 'v1.0.0',
            versionStatus: 'inactive',
            updateTime: '2024-01-01 09:00:00',
            updater: '王五',
            description: '初始版本'
        }
    ];
    showVersionHistoryModal.value = true;
};
// 激活版本
const activateVersion = (record) => {
    Message.success(`版本 ${record.version} 已激活`);
    showVersionHistoryModal.value = false;
    fetchMetrics();
};
// 查看版本详情
const viewVersionDetail = (record) => {
    Message.info('查看版本详情功能开发中');
};
// 提交表单
const handleSubmit = async () => {
    try {
        const valid = await formRef.value?.validate();
        if (valid) {
            if (editingMetric.value) {
                Message.success('指标编辑成功');
            }
            else {
                Message.success('指标创建成功');
            }
            showCreateModal.value = false;
            resetForm();
            fetchMetrics();
        }
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
// 重置表单
const resetForm = () => {
    editingMetric.value = null;
    Object.assign(formData, {
        name: '',
        code: '',
        category: '',
        businessDomain: '',
        statisticalPeriod: '',
        owner: '',
        version: '',
        businessDefinition: '',
        useCase: '',
        sourceTable: '',
        processingLogic: '',
        fieldDescription: '',
        storageLocation: '',
        queryCode: '',
        status: 'active'
    });
    formRef.value?.resetFields();
};
// 导出指标
const exportMetrics = () => {
    Message.success('指标数据导出成功');
};
// 标签页切换
const handleTabChange = (key) => {
    console.log('切换标签页:', key);
};
// 获取状态颜色
const getStatusColor = (status) => {
    const colorMap = {
        active: 'green',
        inactive: 'red',
        draft: 'orange'
    };
    return colorMap[status] || 'gray';
};
// 获取状态文本
const getStatusText = (status) => {
    const textMap = {
        active: '启用',
        inactive: '停用',
        draft: '草稿'
    };
    return textMap[status] || status;
};
// 获取分类颜色
const getCategoryColor = (category) => {
    const colorMap = {
        business: 'blue',
        technical: 'green',
        financial: 'orange',
        risk: 'red'
    };
    return colorMap[category] || 'gray';
};
// 获取分类文本
const getCategoryText = (category) => {
    const textMap = {
        business: '业务指标',
        technical: '技术指标',
        financial: '财务指标',
        risk: '风险指标'
    };
    return textMap[category] || category;
};
// 组件挂载
onMounted(() => {
    console.log('统一指标页面挂载，开始获取数据');
    fetchMetrics();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['metric-name']} */ 
/** @type {__VLS_StyleScopedClasses['tree-card']} */ 
/** @type {__VLS_StyleScopedClasses['unified-metrics']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['search-section']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "unified-metrics" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
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
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
let __VLS_7;
const __VLS_16 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.exportMetrics)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.IconDownload;
    /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ 
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
let __VLS_19;
const __VLS_28 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.searchForm.onlyFavorite ? 'primary' : 'secondary'),
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.searchForm.onlyFavorite ? 'primary' : 'secondary'),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onClick: (__VLS_ctx.toggleFavoriteFilter)
};
__VLS_31.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_31.slots;
    if (__VLS_ctx.searchForm.onlyFavorite) {
        const __VLS_36 = {}.IconStarFill;
        /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ 
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    }
    else {
        const __VLS_40 = {}.IconStar;
        /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ 
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
}
(__VLS_ctx.searchForm.onlyFavorite ? '显示全部' : '仅看收藏');
let __VLS_31;
let __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_44 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    gutter: (16),
}));
const __VLS_46 = __VLS_45({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    span: (8),
}));
const __VLS_50 = __VLS_49({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索指标名称、描述",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索指标名称、描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onSearch: (__VLS_ctx.handleSearch)
};
let __VLS_55;
let __VLS_51;
const __VLS_60 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    span: (4),
}));
const __VLS_62 = __VLS_61({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCategory),
    placeholder: "指标分类",
    allowClear: true,
}));
const __VLS_66 = __VLS_65({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCategory),
    placeholder: "指标分类",
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
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "business",
}));
const __VLS_74 = __VLS_73({
    value: "business",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
let __VLS_75;
const __VLS_76 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "technical",
}));
const __VLS_78 = __VLS_77({
    value: "technical",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
let __VLS_79;
const __VLS_80 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    value: "financial",
}));
const __VLS_82 = __VLS_81({
    value: "financial",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
let __VLS_83;
const __VLS_84 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    value: "risk",
}));
const __VLS_86 = __VLS_85({
    value: "risk",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
let __VLS_87;
let __VLS_67;
let __VLS_63;
const __VLS_88 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    span: (4),
}));
const __VLS_90 = __VLS_89({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedDomain),
    placeholder: "业务域",
    allowClear: true,
}));
const __VLS_94 = __VLS_93({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedDomain),
    placeholder: "业务域",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_95.slots.default;
const __VLS_100 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    value: "user",
}));
const __VLS_102 = __VLS_101({
    value: "user",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
let __VLS_103;
const __VLS_104 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    value: "transaction",
}));
const __VLS_106 = __VLS_105({
    value: "transaction",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
let __VLS_107;
const __VLS_108 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    value: "product",
}));
const __VLS_110 = __VLS_109({
    value: "product",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
let __VLS_111;
const __VLS_112 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    value: "retention",
}));
const __VLS_114 = __VLS_113({
    value: "retention",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
let __VLS_115;
const __VLS_116 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    value: "conversion",
}));
const __VLS_118 = __VLS_117({
    value: "conversion",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
let __VLS_119;
let __VLS_95;
let __VLS_91;
const __VLS_120 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    span: (4),
}));
const __VLS_122 = __VLS_121({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
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
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    value: "active",
}));
const __VLS_134 = __VLS_133({
    value: "active",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
let __VLS_135;
const __VLS_136 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    value: "inactive",
}));
const __VLS_138 = __VLS_137({
    value: "inactive",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
let __VLS_139;
const __VLS_140 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    value: "draft",
}));
const __VLS_142 = __VLS_141({
    value: "draft",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
let __VLS_143;
let __VLS_127;
let __VLS_123;
let __VLS_47;
const __VLS_144 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    gutter: (24),
}));
const __VLS_146 = __VLS_145({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    span: (6),
}));
const __VLS_150 = __VLS_149({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    title: "指标分类",
    bordered: (false),
    ...{ class: "tree-card" },
}));
const __VLS_154 = __VLS_153({
    title: "指标分类",
    bordered: (false),
    ...{ class: "tree-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ATree;
/** @type {[typeof __VLS_components.ATree, typeof __VLS_components.aTree, ]} */ 
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    ...{ 'onSelect': {} },
    selectedKeys: (__VLS_ctx.selectedKeys),
    data: (__VLS_ctx.treeData),
    showLine: (true),
}));
const __VLS_158 = __VLS_157({
    ...{ 'onSelect': {} },
    selectedKeys: (__VLS_ctx.selectedKeys),
    data: (__VLS_ctx.treeData),
    showLine: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
let __VLS_160;
let __VLS_161;
let __VLS_162;
const __VLS_163 = {
    onSelect: (__VLS_ctx.onTreeSelect)
};
let __VLS_159;
let __VLS_155;
let __VLS_151;
const __VLS_164 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    span: (18),
}));
const __VLS_166 = __VLS_165({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    bordered: (false),
    ...{ class: "metrics-table" },
}));
const __VLS_170 = __VLS_169({
    bordered: (false),
    ...{ class: "metrics-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
    loading: (__VLS_ctx.loading),
}));
const __VLS_174 = __VLS_173({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
let __VLS_176;
let __VLS_177;
let __VLS_178;
const __VLS_179 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_180 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_175.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_175.slots;
    const __VLS_181 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
        title: "指标名称",
        dataIndex: "name",
        width: (200),
    }));
    const __VLS_183 = __VLS_182({
        title: "指标名称",
        dataIndex: "name",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    __VLS_184.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_184.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_185 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ 
        // @ts-ignore
        const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
            ...{ 'onClick': {} },
        }));
        const __VLS_187 = __VLS_186({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        let __VLS_189;
        let __VLS_190;
        let __VLS_191;
        const __VLS_192 = {
            onClick: (...[$event]) => {
                __VLS_ctx.showDetail(record);
            }
        };
        __VLS_188.slots.default;
        (record.name);
        let __VLS_188;
        const __VLS_193 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_195 = __VLS_194({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_194));
        let __VLS_197;
        let __VLS_198;
        let __VLS_199;
        const __VLS_200 = {
            onClick: (...[$event]) => {
                __VLS_ctx.toggleFavorite(record);
            }
        };
        __VLS_196.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_196.slots;
            if (record.isFavorite) {
                const __VLS_201 = {}.IconStarFill;
                /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ 
                // @ts-ignore
                const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
                    ...{ style: {} },
                }));
                const __VLS_203 = __VLS_202({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_202));
            }
            else {
                const __VLS_205 = {}.IconStar;
                /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ 
                // @ts-ignore
                const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({}));
                const __VLS_207 = __VLS_206({}, ...__VLS_functionalComponentArgsRest(__VLS_206));
            }
        }
        let __VLS_196;
    }
    let __VLS_184;
    const __VLS_209 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
        title: "指标分类",
        dataIndex: "category",
        width: (120),
    }));
    const __VLS_211 = __VLS_210({
        title: "指标分类",
        dataIndex: "category",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    __VLS_212.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_212.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_213 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
            color: (__VLS_ctx.getCategoryColor(record.category)),
        }));
        const __VLS_215 = __VLS_214({
            color: (__VLS_ctx.getCategoryColor(record.category)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_214));
        __VLS_216.slots.default;
        (__VLS_ctx.getCategoryText(record.category));
        let __VLS_216;
    }
    let __VLS_212;
    const __VLS_217 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
        title: "业务域",
        dataIndex: "businessDomain",
        width: (120),
    }));
    const __VLS_219 = __VLS_218({
        title: "业务域",
        dataIndex: "businessDomain",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    __VLS_220.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_220.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_221 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
            color: "purple",
        }));
        const __VLS_223 = __VLS_222({
            color: "purple",
        }, ...__VLS_functionalComponentArgsRest(__VLS_222));
        __VLS_224.slots.default;
        (record.businessDomain);
        let __VLS_224;
    }
    let __VLS_220;
    const __VLS_225 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
        title: "状态",
        dataIndex: "status",
        width: (100),
    }));
    const __VLS_227 = __VLS_226({
        title: "状态",
        dataIndex: "status",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_226));
    __VLS_228.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_228.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_229 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
            color: (__VLS_ctx.getStatusColor(record.status)),
        }));
        const __VLS_231 = __VLS_230({
            color: (__VLS_ctx.getStatusColor(record.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_230));
        __VLS_232.slots.default;
        (__VLS_ctx.getStatusText(record.status));
        let __VLS_232;
    }
    let __VLS_228;
    const __VLS_233 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
        title: "负责人",
        dataIndex: "owner",
        width: (120),
    }));
    const __VLS_235 = __VLS_234({
        title: "负责人",
        dataIndex: "owner",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    const __VLS_237 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
        title: "更新时间",
        dataIndex: "updateTime",
        width: (150),
    }));
    const __VLS_239 = __VLS_238({
        title: "更新时间",
        dataIndex: "updateTime",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_238));
    const __VLS_241 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
        title: "操作",
        width: (200),
        fixed: "right",
    }));
    const __VLS_243 = __VLS_242({
        title: "操作",
        width: (200),
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    __VLS_244.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_244.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_245 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
        // @ts-ignore
        const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({}));
        const __VLS_247 = __VLS_246({}, ...__VLS_functionalComponentArgsRest(__VLS_246));
        __VLS_248.slots.default;
        const __VLS_249 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_251 = __VLS_250({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_250));
        let __VLS_253;
        let __VLS_254;
        let __VLS_255;
        const __VLS_256 = {
            onClick: (...[$event]) => {
                __VLS_ctx.editMetric(record);
            }
        };
        __VLS_252.slots.default;
        let __VLS_252;
        const __VLS_257 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_259 = __VLS_258({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_258));
        let __VLS_261;
        let __VLS_262;
        let __VLS_263;
        const __VLS_264 = {
            onClick: (...[$event]) => {
                __VLS_ctx.viewVersionHistory(record);
            }
        };
        __VLS_260.slots.default;
        let __VLS_260;
        const __VLS_265 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_267 = __VLS_266({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_266));
        let __VLS_269;
        let __VLS_270;
        let __VLS_271;
        const __VLS_272 = {
            onClick: (...[$event]) => {
                __VLS_ctx.copyMetric(record);
            }
        };
        __VLS_268.slots.default;
        let __VLS_268;
        const __VLS_273 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            status: "danger",
        }));
        const __VLS_275 = __VLS_274({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_274));
        let __VLS_277;
        let __VLS_278;
        let __VLS_279;
        const __VLS_280 = {
            onClick: (...[$event]) => {
                __VLS_ctx.deleteMetric(record);
            }
        };
        __VLS_276.slots.default;
        let __VLS_276;
        let __VLS_248;
    }
    let __VLS_244;
}
let __VLS_175;
let __VLS_171;
let __VLS_167;
let __VLS_147;
const __VLS_281 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ 
// @ts-ignore
const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (800),
    title: "指标详情",
    placement: "right",
    mask: (false),
    wrapStyle: ({ top: '64px', height: 'calc(100% - 64px)' }),
}));
const __VLS_283 = __VLS_282({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (800),
    title: "指标详情",
    placement: "right",
    mask: (false),
    wrapStyle: ({ top: '64px', height: 'calc(100% - 64px)' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_282));
let __VLS_285;
let __VLS_286;
let __VLS_287;
const __VLS_288 = {
    onCancel: (__VLS_ctx.closeDrawer)
};
__VLS_284.slots.default;
if (__VLS_ctx.currentMetric) {
    const __VLS_289 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({
        direction: "vertical",
        size: "small",
        fill: true,
        ...{ style: {} },
    }));
    const __VLS_291 = __VLS_290({
        direction: "vertical",
        size: "small",
        fill: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_290));
    __VLS_292.slots.default;
    const __VLS_293 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
    // @ts-ignore
    const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({
        ...{ 'onChange': {} },
        type: "rounded",
        defaultActiveKey: (0),
    }));
    const __VLS_295 = __VLS_294({
        ...{ 'onChange': {} },
        type: "rounded",
        defaultActiveKey: (0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_294));
    let __VLS_297;
    let __VLS_298;
    let __VLS_299;
    const __VLS_300 = {
        onChange: (__VLS_ctx.handleTabChange)
    };
    __VLS_296.slots.default;
    const __VLS_301 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({
        key: "0",
        title: "基础信息",
    }));
    const __VLS_303 = __VLS_302({
        key: "0",
        title: "基础信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_302));
    const __VLS_305 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({
        key: "1",
        title: "业务口径",
    }));
    const __VLS_307 = __VLS_306({
        key: "1",
        title: "业务口径",
    }, ...__VLS_functionalComponentArgsRest(__VLS_306));
    const __VLS_309 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
        key: "2",
        title: "技术逻辑",
    }));
    const __VLS_311 = __VLS_310({
        key: "2",
        title: "技术逻辑",
    }, ...__VLS_functionalComponentArgsRest(__VLS_310));
    const __VLS_313 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({
        key: "3",
        title: "报表位置",
    }));
    const __VLS_315 = __VLS_314({
        key: "3",
        title: "报表位置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_314));
    const __VLS_317 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
        key: "4",
        title: "结果表信息",
    }));
    const __VLS_319 = __VLS_318({
        key: "4",
        title: "结果表信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_318));
    const __VLS_321 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_322 = __VLS_asFunctionalComponent(__VLS_321, new __VLS_321({
        key: "5",
        title: "查询代码",
    }));
    const __VLS_323 = __VLS_322({
        key: "5",
        title: "查询代码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_322));
    const __VLS_325 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
        key: "6",
        title: "历史版本",
    }));
    const __VLS_327 = __VLS_326({
        key: "6",
        title: "历史版本",
    }, ...__VLS_functionalComponentArgsRest(__VLS_326));
    let __VLS_296;
    const __VLS_329 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
    // @ts-ignore
    const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
        gutter: (24),
    }));
    const __VLS_331 = __VLS_330({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_330));
    __VLS_332.slots.default;
    const __VLS_333 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
    // @ts-ignore
    const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({
        span: (24),
    }));
    const __VLS_335 = __VLS_334({
        span: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_334));
    __VLS_336.slots.default;
    const __VLS_337 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
        ...{ class: "detail-card" },
    }));
    const __VLS_339 = __VLS_338({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_338));
    __VLS_340.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_340.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    const __VLS_341 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
        column: (2),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_343 = __VLS_342({
        column: (2),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_342));
    __VLS_344.slots.default;
    const __VLS_345 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
        label: "指标名称",
    }));
    const __VLS_347 = __VLS_346({
        label: "指标名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_346));
    __VLS_348.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "highlight-text" },
    });
    (__VLS_ctx.currentMetric.name);
    let __VLS_348;
    const __VLS_349 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
        label: "指标编号",
    }));
    const __VLS_351 = __VLS_350({
        label: "指标编号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_350));
    __VLS_352.slots.default;
    (__VLS_ctx.currentMetric.code);
    let __VLS_352;
    const __VLS_353 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({
        label: "分类/业务域",
    }));
    const __VLS_355 = __VLS_354({
        label: "分类/业务域",
    }, ...__VLS_functionalComponentArgsRest(__VLS_354));
    __VLS_356.slots.default;
    const __VLS_357 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({}));
    const __VLS_359 = __VLS_358({}, ...__VLS_functionalComponentArgsRest(__VLS_358));
    __VLS_360.slots.default;
    (__VLS_ctx.currentMetric.category);
    let __VLS_360;
    const __VLS_361 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_362 = __VLS_asFunctionalComponent(__VLS_361, new __VLS_361({
        color: "purple",
        ...{ style: {} },
    }));
    const __VLS_363 = __VLS_362({
        color: "purple",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_362));
    __VLS_364.slots.default;
    (__VLS_ctx.currentMetric.businessDomain);
    let __VLS_364;
    let __VLS_356;
    const __VLS_365 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({
        label: "负责人",
    }));
    const __VLS_367 = __VLS_366({
        label: "负责人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_366));
    __VLS_368.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "highlight-text" },
    });
    (__VLS_ctx.currentMetric.owner);
    let __VLS_368;
    const __VLS_369 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({
        label: "状态",
    }));
    const __VLS_371 = __VLS_370({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_370));
    __VLS_372.slots.default;
    const __VLS_373 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({
        color: (__VLS_ctx.getStatusColor(__VLS_ctx.currentMetric.status)),
    }));
    const __VLS_375 = __VLS_374({
        color: (__VLS_ctx.getStatusColor(__VLS_ctx.currentMetric.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_374));
    __VLS_376.slots.default;
    (__VLS_ctx.getStatusText(__VLS_ctx.currentMetric.status));
    let __VLS_376;
    let __VLS_372;
    const __VLS_377 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({
        label: "统计周期",
    }));
    const __VLS_379 = __VLS_378({
        label: "统计周期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_378));
    __VLS_380.slots.default;
    const __VLS_381 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_382 = __VLS_asFunctionalComponent(__VLS_381, new __VLS_381({
        color: "blue",
    }));
    const __VLS_383 = __VLS_382({
        color: "blue",
    }, ...__VLS_functionalComponentArgsRest(__VLS_382));
    __VLS_384.slots.default;
    (__VLS_ctx.currentMetric.statisticalPeriod);
    let __VLS_384;
    let __VLS_380;
    let __VLS_344;
    let __VLS_340;
    const __VLS_385 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({
        ...{ class: "detail-card" },
    }));
    const __VLS_387 = __VLS_386({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_386));
    __VLS_388.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_388.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    const __VLS_389 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_390 = __VLS_asFunctionalComponent(__VLS_389, new __VLS_389({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_391 = __VLS_390({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_390));
    __VLS_392.slots.default;
    const __VLS_393 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_394 = __VLS_asFunctionalComponent(__VLS_393, new __VLS_393({
        label: "业务定义",
    }));
    const __VLS_395 = __VLS_394({
        label: "业务定义",
    }, ...__VLS_functionalComponentArgsRest(__VLS_394));
    __VLS_396.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.businessDefinition);
    let __VLS_396;
    const __VLS_397 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({
        label: "使用场景",
    }));
    const __VLS_399 = __VLS_398({
        label: "使用场景",
    }, ...__VLS_functionalComponentArgsRest(__VLS_398));
    __VLS_400.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.useCase);
    let __VLS_400;
    let __VLS_392;
    let __VLS_388;
    const __VLS_401 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({
        ...{ class: "detail-card" },
    }));
    const __VLS_403 = __VLS_402({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_402));
    __VLS_404.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_404.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    const __VLS_405 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_406 = __VLS_asFunctionalComponent(__VLS_405, new __VLS_405({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_407 = __VLS_406({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_406));
    __VLS_408.slots.default;
    const __VLS_409 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_410 = __VLS_asFunctionalComponent(__VLS_409, new __VLS_409({
        label: "数据来源表",
    }));
    const __VLS_411 = __VLS_410({
        label: "数据来源表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_410));
    __VLS_412.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code-block" },
    });
    (__VLS_ctx.currentMetric.sourceTable);
    let __VLS_412;
    const __VLS_413 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_414 = __VLS_asFunctionalComponent(__VLS_413, new __VLS_413({
        label: "加工逻辑",
    }));
    const __VLS_415 = __VLS_414({
        label: "加工逻辑",
    }, ...__VLS_functionalComponentArgsRest(__VLS_414));
    __VLS_416.slots.default;
    const __VLS_417 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ 
    // @ts-ignore
    const __VLS_418 = __VLS_asFunctionalComponent(__VLS_417, new __VLS_417({
        code: true,
        ...{ class: "code-block" },
    }));
    const __VLS_419 = __VLS_418({
        code: true,
        ...{ class: "code-block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_418));
    __VLS_420.slots.default;
    (__VLS_ctx.currentMetric.processingLogic);
    let __VLS_420;
    let __VLS_416;
    const __VLS_421 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_422 = __VLS_asFunctionalComponent(__VLS_421, new __VLS_421({
        label: "关联字段说明",
    }));
    const __VLS_423 = __VLS_422({
        label: "关联字段说明",
    }, ...__VLS_functionalComponentArgsRest(__VLS_422));
    __VLS_424.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.fieldDescription);
    let __VLS_424;
    let __VLS_408;
    let __VLS_404;
    const __VLS_425 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_426 = __VLS_asFunctionalComponent(__VLS_425, new __VLS_425({
        ...{ class: "detail-card" },
    }));
    const __VLS_427 = __VLS_426({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_426));
    __VLS_428.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_428.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    const __VLS_429 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_430 = __VLS_asFunctionalComponent(__VLS_429, new __VLS_429({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_431 = __VLS_430({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_430));
    __VLS_432.slots.default;
    const __VLS_433 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_434 = __VLS_asFunctionalComponent(__VLS_433, new __VLS_433({
        label: "报表信息",
    }));
    const __VLS_435 = __VLS_434({
        label: "报表信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_434));
    __VLS_436.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.reportInfo);
    let __VLS_436;
    let __VLS_432;
    let __VLS_428;
    const __VLS_437 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_438 = __VLS_asFunctionalComponent(__VLS_437, new __VLS_437({
        ...{ class: "detail-card" },
    }));
    const __VLS_439 = __VLS_438({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_438));
    __VLS_440.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_440.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    const __VLS_441 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_442 = __VLS_asFunctionalComponent(__VLS_441, new __VLS_441({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_443 = __VLS_442({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_442));
    __VLS_444.slots.default;
    const __VLS_445 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_446 = __VLS_asFunctionalComponent(__VLS_445, new __VLS_445({
        label: "存储位置",
    }));
    const __VLS_447 = __VLS_446({
        label: "存储位置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_446));
    __VLS_448.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code-block" },
    });
    (__VLS_ctx.currentMetric.storageLocation);
    let __VLS_448;
    let __VLS_444;
    let __VLS_440;
    const __VLS_449 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_450 = __VLS_asFunctionalComponent(__VLS_449, new __VLS_449({
        ...{ class: "detail-card" },
    }));
    const __VLS_451 = __VLS_450({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_450));
    __VLS_452.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_452.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    const __VLS_453 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ 
    // @ts-ignore
    const __VLS_454 = __VLS_asFunctionalComponent(__VLS_453, new __VLS_453({
        code: true,
        ...{ class: "code-block query-code" },
    }));
    const __VLS_455 = __VLS_454({
        code: true,
        ...{ class: "code-block query-code" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_454));
    __VLS_456.slots.default;
    (__VLS_ctx.currentMetric.queryCode);
    let __VLS_456;
    let __VLS_452;
    const __VLS_457 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_458 = __VLS_asFunctionalComponent(__VLS_457, new __VLS_457({
        ...{ class: "detail-card" },
    }));
    const __VLS_459 = __VLS_458({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_458));
    __VLS_460.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_460.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title" },
        });
    }
    const __VLS_461 = {}.ATimeline;
    /** @type {[typeof __VLS_components.ATimeline, typeof __VLS_components.aTimeline, typeof __VLS_components.ATimeline, typeof __VLS_components.aTimeline, ]} */ 
    // @ts-ignore
    const __VLS_462 = __VLS_asFunctionalComponent(__VLS_461, new __VLS_461({
        ...{ class: "version-timeline" },
    }));
    const __VLS_463 = __VLS_462({
        ...{ class: "version-timeline" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_462));
    __VLS_464.slots.default;
    for (const [version, index] of __VLS_getVForSourceType((__VLS_ctx.currentMetric.versions))) {
        const __VLS_465 = {}.ATimelineItem;
        /** @type {[typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, ]} */ 
        // @ts-ignore
        const __VLS_466 = __VLS_asFunctionalComponent(__VLS_465, new __VLS_465({
            key: (index),
        }));
        const __VLS_467 = __VLS_466({
            key: (index),
        }, ...__VLS_functionalComponentArgsRest(__VLS_466));
        __VLS_468.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "version-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "version-date" },
        });
        (version.date);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "version-description" },
        });
        (version.description);
        var __VLS_468;
    }
    let __VLS_464;
    let __VLS_460;
    let __VLS_336;
    let __VLS_332;
    let __VLS_292;
}
let __VLS_284;
const __VLS_469 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_470 = __VLS_asFunctionalComponent(__VLS_469, new __VLS_469({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingMetric ? '编辑指标' : '新建指标'),
    width: "1000px",
}));
const __VLS_471 = __VLS_470({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingMetric ? '编辑指标' : '新建指标'),
    width: "1000px",
}, ...__VLS_functionalComponentArgsRest(__VLS_470));
let __VLS_473;
let __VLS_474;
let __VLS_475;
const __VLS_476 = {
    onOk: (__VLS_ctx.handleSubmit)
};
const __VLS_477 = {
    onCancel: (__VLS_ctx.resetForm)
};
__VLS_472.slots.default;
const __VLS_478 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_479 = __VLS_asFunctionalComponent(__VLS_478, new __VLS_478({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    layout: "vertical",
}));
const __VLS_480 = __VLS_479({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_479));
/** @type {typeof __VLS_ctx.formRef} */ 
const __VLS_482 = {};
__VLS_481.slots.default;
const __VLS_484 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ 
// @ts-ignore
const __VLS_485 = __VLS_asFunctionalComponent(__VLS_484, new __VLS_484({
    orientation: "left",
}));
const __VLS_486 = __VLS_485({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_485));
__VLS_487.slots.default;
let __VLS_487;
const __VLS_488 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_489 = __VLS_asFunctionalComponent(__VLS_488, new __VLS_488({
    gutter: (16),
}));
const __VLS_490 = __VLS_489({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_489));
__VLS_491.slots.default;
const __VLS_492 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_493 = __VLS_asFunctionalComponent(__VLS_492, new __VLS_492({
    span: (12),
}));
const __VLS_494 = __VLS_493({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_493));
__VLS_495.slots.default;
const __VLS_496 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_497 = __VLS_asFunctionalComponent(__VLS_496, new __VLS_496({
    label: "指标名称",
    field: "name",
}));
const __VLS_498 = __VLS_497({
    label: "指标名称",
    field: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_497));
__VLS_499.slots.default;
const __VLS_500 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_501 = __VLS_asFunctionalComponent(__VLS_500, new __VLS_500({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入指标名称",
}));
const __VLS_502 = __VLS_501({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入指标名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_501));
let __VLS_499;
let __VLS_495;
const __VLS_504 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_505 = __VLS_asFunctionalComponent(__VLS_504, new __VLS_504({
    span: (12),
}));
const __VLS_506 = __VLS_505({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_505));
__VLS_507.slots.default;
const __VLS_508 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_509 = __VLS_asFunctionalComponent(__VLS_508, new __VLS_508({
    label: "指标编码",
    field: "code",
}));
const __VLS_510 = __VLS_509({
    label: "指标编码",
    field: "code",
}, ...__VLS_functionalComponentArgsRest(__VLS_509));
__VLS_511.slots.default;
const __VLS_512 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_513 = __VLS_asFunctionalComponent(__VLS_512, new __VLS_512({
    modelValue: (__VLS_ctx.formData.code),
    placeholder: "请输入指标编码",
}));
const __VLS_514 = __VLS_513({
    modelValue: (__VLS_ctx.formData.code),
    placeholder: "请输入指标编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_513));
let __VLS_511;
let __VLS_507;
let __VLS_491;
const __VLS_516 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_517 = __VLS_asFunctionalComponent(__VLS_516, new __VLS_516({
    gutter: (16),
}));
const __VLS_518 = __VLS_517({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_517));
__VLS_519.slots.default;
const __VLS_520 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_521 = __VLS_asFunctionalComponent(__VLS_520, new __VLS_520({
    span: (8),
}));
const __VLS_522 = __VLS_521({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_521));
__VLS_523.slots.default;
const __VLS_524 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_525 = __VLS_asFunctionalComponent(__VLS_524, new __VLS_524({
    label: "指标分类",
    field: "category",
}));
const __VLS_526 = __VLS_525({
    label: "指标分类",
    field: "category",
}, ...__VLS_functionalComponentArgsRest(__VLS_525));
__VLS_527.slots.default;
const __VLS_528 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_529 = __VLS_asFunctionalComponent(__VLS_528, new __VLS_528({
    modelValue: (__VLS_ctx.formData.category),
    placeholder: "请选择指标分类",
}));
const __VLS_530 = __VLS_529({
    modelValue: (__VLS_ctx.formData.category),
    placeholder: "请选择指标分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_529));
__VLS_531.slots.default;
const __VLS_532 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_533 = __VLS_asFunctionalComponent(__VLS_532, new __VLS_532({
    value: "business",
}));
const __VLS_534 = __VLS_533({
    value: "business",
}, ...__VLS_functionalComponentArgsRest(__VLS_533));
__VLS_535.slots.default;
let __VLS_535;
const __VLS_536 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_537 = __VLS_asFunctionalComponent(__VLS_536, new __VLS_536({
    value: "technical",
}));
const __VLS_538 = __VLS_537({
    value: "technical",
}, ...__VLS_functionalComponentArgsRest(__VLS_537));
__VLS_539.slots.default;
let __VLS_539;
const __VLS_540 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_541 = __VLS_asFunctionalComponent(__VLS_540, new __VLS_540({
    value: "financial",
}));
const __VLS_542 = __VLS_541({
    value: "financial",
}, ...__VLS_functionalComponentArgsRest(__VLS_541));
__VLS_543.slots.default;
let __VLS_543;
const __VLS_544 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_545 = __VLS_asFunctionalComponent(__VLS_544, new __VLS_544({
    value: "risk",
}));
const __VLS_546 = __VLS_545({
    value: "risk",
}, ...__VLS_functionalComponentArgsRest(__VLS_545));
__VLS_547.slots.default;
let __VLS_547;
let __VLS_531;
let __VLS_527;
let __VLS_523;
const __VLS_548 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_549 = __VLS_asFunctionalComponent(__VLS_548, new __VLS_548({
    span: (8),
}));
const __VLS_550 = __VLS_549({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_549));
__VLS_551.slots.default;
const __VLS_552 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_553 = __VLS_asFunctionalComponent(__VLS_552, new __VLS_552({
    label: "业务域",
    field: "businessDomain",
}));
const __VLS_554 = __VLS_553({
    label: "业务域",
    field: "businessDomain",
}, ...__VLS_functionalComponentArgsRest(__VLS_553));
__VLS_555.slots.default;
const __VLS_556 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_557 = __VLS_asFunctionalComponent(__VLS_556, new __VLS_556({
    modelValue: (__VLS_ctx.formData.businessDomain),
    placeholder: "请选择业务域",
}));
const __VLS_558 = __VLS_557({
    modelValue: (__VLS_ctx.formData.businessDomain),
    placeholder: "请选择业务域",
}, ...__VLS_functionalComponentArgsRest(__VLS_557));
__VLS_559.slots.default;
const __VLS_560 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_561 = __VLS_asFunctionalComponent(__VLS_560, new __VLS_560({
    value: "user",
}));
const __VLS_562 = __VLS_561({
    value: "user",
}, ...__VLS_functionalComponentArgsRest(__VLS_561));
__VLS_563.slots.default;
let __VLS_563;
const __VLS_564 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_565 = __VLS_asFunctionalComponent(__VLS_564, new __VLS_564({
    value: "transaction",
}));
const __VLS_566 = __VLS_565({
    value: "transaction",
}, ...__VLS_functionalComponentArgsRest(__VLS_565));
__VLS_567.slots.default;
let __VLS_567;
const __VLS_568 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_569 = __VLS_asFunctionalComponent(__VLS_568, new __VLS_568({
    value: "product",
}));
const __VLS_570 = __VLS_569({
    value: "product",
}, ...__VLS_functionalComponentArgsRest(__VLS_569));
__VLS_571.slots.default;
let __VLS_571;
const __VLS_572 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_573 = __VLS_asFunctionalComponent(__VLS_572, new __VLS_572({
    value: "retention",
}));
const __VLS_574 = __VLS_573({
    value: "retention",
}, ...__VLS_functionalComponentArgsRest(__VLS_573));
__VLS_575.slots.default;
let __VLS_575;
const __VLS_576 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_577 = __VLS_asFunctionalComponent(__VLS_576, new __VLS_576({
    value: "conversion",
}));
const __VLS_578 = __VLS_577({
    value: "conversion",
}, ...__VLS_functionalComponentArgsRest(__VLS_577));
__VLS_579.slots.default;
let __VLS_579;
let __VLS_559;
let __VLS_555;
let __VLS_551;
const __VLS_580 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_581 = __VLS_asFunctionalComponent(__VLS_580, new __VLS_580({
    span: (8),
}));
const __VLS_582 = __VLS_581({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_581));
__VLS_583.slots.default;
const __VLS_584 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_585 = __VLS_asFunctionalComponent(__VLS_584, new __VLS_584({
    label: "统计周期",
    field: "statisticalPeriod",
}));
const __VLS_586 = __VLS_585({
    label: "统计周期",
    field: "statisticalPeriod",
}, ...__VLS_functionalComponentArgsRest(__VLS_585));
__VLS_587.slots.default;
const __VLS_588 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_589 = __VLS_asFunctionalComponent(__VLS_588, new __VLS_588({
    modelValue: (__VLS_ctx.formData.statisticalPeriod),
    placeholder: "请选择统计周期",
}));
const __VLS_590 = __VLS_589({
    modelValue: (__VLS_ctx.formData.statisticalPeriod),
    placeholder: "请选择统计周期",
}, ...__VLS_functionalComponentArgsRest(__VLS_589));
__VLS_591.slots.default;
const __VLS_592 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_593 = __VLS_asFunctionalComponent(__VLS_592, new __VLS_592({
    value: "实时",
}));
const __VLS_594 = __VLS_593({
    value: "实时",
}, ...__VLS_functionalComponentArgsRest(__VLS_593));
__VLS_595.slots.default;
let __VLS_595;
const __VLS_596 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_597 = __VLS_asFunctionalComponent(__VLS_596, new __VLS_596({
    value: "日更新",
}));
const __VLS_598 = __VLS_597({
    value: "日更新",
}, ...__VLS_functionalComponentArgsRest(__VLS_597));
__VLS_599.slots.default;
let __VLS_599;
const __VLS_600 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_601 = __VLS_asFunctionalComponent(__VLS_600, new __VLS_600({
    value: "离线T+1",
}));
const __VLS_602 = __VLS_601({
    value: "离线T+1",
}, ...__VLS_functionalComponentArgsRest(__VLS_601));
__VLS_603.slots.default;
let __VLS_603;
const __VLS_604 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_605 = __VLS_asFunctionalComponent(__VLS_604, new __VLS_604({
    value: "离线T+2",
}));
const __VLS_606 = __VLS_605({
    value: "离线T+2",
}, ...__VLS_functionalComponentArgsRest(__VLS_605));
__VLS_607.slots.default;
let __VLS_607;
const __VLS_608 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_609 = __VLS_asFunctionalComponent(__VLS_608, new __VLS_608({
    value: "每周",
}));
const __VLS_610 = __VLS_609({
    value: "每周",
}, ...__VLS_functionalComponentArgsRest(__VLS_609));
__VLS_611.slots.default;
let __VLS_611;
const __VLS_612 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_613 = __VLS_asFunctionalComponent(__VLS_612, new __VLS_612({
    value: "每月",
}));
const __VLS_614 = __VLS_613({
    value: "每月",
}, ...__VLS_functionalComponentArgsRest(__VLS_613));
__VLS_615.slots.default;
let __VLS_615;
let __VLS_591;
let __VLS_587;
let __VLS_583;
let __VLS_519;
const __VLS_616 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_617 = __VLS_asFunctionalComponent(__VLS_616, new __VLS_616({
    gutter: (16),
}));
const __VLS_618 = __VLS_617({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_617));
__VLS_619.slots.default;
const __VLS_620 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_621 = __VLS_asFunctionalComponent(__VLS_620, new __VLS_620({
    span: (12),
}));
const __VLS_622 = __VLS_621({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_621));
__VLS_623.slots.default;
const __VLS_624 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_625 = __VLS_asFunctionalComponent(__VLS_624, new __VLS_624({
    label: "负责人",
    field: "owner",
}));
const __VLS_626 = __VLS_625({
    label: "负责人",
    field: "owner",
}, ...__VLS_functionalComponentArgsRest(__VLS_625));
__VLS_627.slots.default;
const __VLS_628 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_629 = __VLS_asFunctionalComponent(__VLS_628, new __VLS_628({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
}));
const __VLS_630 = __VLS_629({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
}, ...__VLS_functionalComponentArgsRest(__VLS_629));
let __VLS_627;
let __VLS_623;
const __VLS_632 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_633 = __VLS_asFunctionalComponent(__VLS_632, new __VLS_632({
    span: (12),
}));
const __VLS_634 = __VLS_633({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_633));
__VLS_635.slots.default;
const __VLS_636 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_637 = __VLS_asFunctionalComponent(__VLS_636, new __VLS_636({
    label: "版本号",
    field: "version",
}));
const __VLS_638 = __VLS_637({
    label: "版本号",
    field: "version",
}, ...__VLS_functionalComponentArgsRest(__VLS_637));
__VLS_639.slots.default;
const __VLS_640 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_641 = __VLS_asFunctionalComponent(__VLS_640, new __VLS_640({
    modelValue: (__VLS_ctx.formData.version),
    placeholder: "请输入版本号（如：v1.0.0）",
}));
const __VLS_642 = __VLS_641({
    modelValue: (__VLS_ctx.formData.version),
    placeholder: "请输入版本号（如：v1.0.0）",
}, ...__VLS_functionalComponentArgsRest(__VLS_641));
let __VLS_639;
let __VLS_635;
let __VLS_619;
const __VLS_644 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ 
// @ts-ignore
const __VLS_645 = __VLS_asFunctionalComponent(__VLS_644, new __VLS_644({
    orientation: "left",
}));
const __VLS_646 = __VLS_645({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_645));
__VLS_647.slots.default;
let __VLS_647;
const __VLS_648 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_649 = __VLS_asFunctionalComponent(__VLS_648, new __VLS_648({
    label: "业务定义",
    field: "businessDefinition",
}));
const __VLS_650 = __VLS_649({
    label: "业务定义",
    field: "businessDefinition",
}, ...__VLS_functionalComponentArgsRest(__VLS_649));
__VLS_651.slots.default;
const __VLS_652 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_653 = __VLS_asFunctionalComponent(__VLS_652, new __VLS_652({
    modelValue: (__VLS_ctx.formData.businessDefinition),
    placeholder: "请输入业务定义",
    rows: (3),
}));
const __VLS_654 = __VLS_653({
    modelValue: (__VLS_ctx.formData.businessDefinition),
    placeholder: "请输入业务定义",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_653));
let __VLS_651;
const __VLS_656 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_657 = __VLS_asFunctionalComponent(__VLS_656, new __VLS_656({
    label: "使用场景",
}));
const __VLS_658 = __VLS_657({
    label: "使用场景",
}, ...__VLS_functionalComponentArgsRest(__VLS_657));
__VLS_659.slots.default;
const __VLS_660 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_661 = __VLS_asFunctionalComponent(__VLS_660, new __VLS_660({
    modelValue: (__VLS_ctx.formData.useCase),
    placeholder: "请输入使用场景",
    rows: (3),
}));
const __VLS_662 = __VLS_661({
    modelValue: (__VLS_ctx.formData.useCase),
    placeholder: "请输入使用场景",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_661));
let __VLS_659;
const __VLS_664 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ 
// @ts-ignore
const __VLS_665 = __VLS_asFunctionalComponent(__VLS_664, new __VLS_664({
    orientation: "left",
}));
const __VLS_666 = __VLS_665({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_665));
__VLS_667.slots.default;
let __VLS_667;
const __VLS_668 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_669 = __VLS_asFunctionalComponent(__VLS_668, new __VLS_668({
    label: "来源表",
    field: "sourceTable",
}));
const __VLS_670 = __VLS_669({
    label: "来源表",
    field: "sourceTable",
}, ...__VLS_functionalComponentArgsRest(__VLS_669));
__VLS_671.slots.default;
const __VLS_672 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_673 = __VLS_asFunctionalComponent(__VLS_672, new __VLS_672({
    modelValue: (__VLS_ctx.formData.sourceTable),
    placeholder: "请输入来源表",
}));
const __VLS_674 = __VLS_673({
    modelValue: (__VLS_ctx.formData.sourceTable),
    placeholder: "请输入来源表",
}, ...__VLS_functionalComponentArgsRest(__VLS_673));
let __VLS_671;
const __VLS_676 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_677 = __VLS_asFunctionalComponent(__VLS_676, new __VLS_676({
    label: "加工逻辑",
}));
const __VLS_678 = __VLS_677({
    label: "加工逻辑",
}, ...__VLS_functionalComponentArgsRest(__VLS_677));
__VLS_679.slots.default;
const __VLS_680 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_681 = __VLS_asFunctionalComponent(__VLS_680, new __VLS_680({
    modelValue: (__VLS_ctx.formData.processingLogic),
    placeholder: "请输入加工逻辑SQL",
    rows: (5),
}));
const __VLS_682 = __VLS_681({
    modelValue: (__VLS_ctx.formData.processingLogic),
    placeholder: "请输入加工逻辑SQL",
    rows: (5),
}, ...__VLS_functionalComponentArgsRest(__VLS_681));
let __VLS_679;
const __VLS_684 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_685 = __VLS_asFunctionalComponent(__VLS_684, new __VLS_684({
    label: "字段说明",
}));
const __VLS_686 = __VLS_685({
    label: "字段说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_685));
__VLS_687.slots.default;
const __VLS_688 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_689 = __VLS_asFunctionalComponent(__VLS_688, new __VLS_688({
    modelValue: (__VLS_ctx.formData.fieldDescription),
    placeholder: "请输入字段说明",
    rows: (3),
}));
const __VLS_690 = __VLS_689({
    modelValue: (__VLS_ctx.formData.fieldDescription),
    placeholder: "请输入字段说明",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_689));
let __VLS_687;
const __VLS_692 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ 
// @ts-ignore
const __VLS_693 = __VLS_asFunctionalComponent(__VLS_692, new __VLS_692({
    orientation: "left",
}));
const __VLS_694 = __VLS_693({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_693));
__VLS_695.slots.default;
let __VLS_695;
const __VLS_696 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_697 = __VLS_asFunctionalComponent(__VLS_696, new __VLS_696({
    label: "存储位置",
}));
const __VLS_698 = __VLS_697({
    label: "存储位置",
}, ...__VLS_functionalComponentArgsRest(__VLS_697));
__VLS_699.slots.default;
const __VLS_700 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_701 = __VLS_asFunctionalComponent(__VLS_700, new __VLS_700({
    modelValue: (__VLS_ctx.formData.storageLocation),
    placeholder: "请输入存储位置",
}));
const __VLS_702 = __VLS_701({
    modelValue: (__VLS_ctx.formData.storageLocation),
    placeholder: "请输入存储位置",
}, ...__VLS_functionalComponentArgsRest(__VLS_701));
let __VLS_699;
const __VLS_704 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_705 = __VLS_asFunctionalComponent(__VLS_704, new __VLS_704({
    label: "查询代码",
}));
const __VLS_706 = __VLS_705({
    label: "查询代码",
}, ...__VLS_functionalComponentArgsRest(__VLS_705));
__VLS_707.slots.default;
const __VLS_708 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_709 = __VLS_asFunctionalComponent(__VLS_708, new __VLS_708({
    modelValue: (__VLS_ctx.formData.queryCode),
    placeholder: "请输入查询代码",
    rows: (5),
}));
const __VLS_710 = __VLS_709({
    modelValue: (__VLS_ctx.formData.queryCode),
    placeholder: "请输入查询代码",
    rows: (5),
}, ...__VLS_functionalComponentArgsRest(__VLS_709));
let __VLS_707;
let __VLS_481;
let __VLS_472;
const __VLS_712 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_713 = __VLS_asFunctionalComponent(__VLS_712, new __VLS_712({
    visible: (__VLS_ctx.showVersionHistoryModal),
    title: "版本历史",
    width: "800px",
    footer: (false),
}));
const __VLS_714 = __VLS_713({
    visible: (__VLS_ctx.showVersionHistoryModal),
    title: "版本历史",
    width: "800px",
    footer: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_713));
__VLS_715.slots.default;
const __VLS_716 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_717 = __VLS_asFunctionalComponent(__VLS_716, new __VLS_716({
    columns: (__VLS_ctx.versionHistoryColumns),
    data: (__VLS_ctx.versionHistoryData),
    pagination: (false),
}));
const __VLS_718 = __VLS_717({
    columns: (__VLS_ctx.versionHistoryColumns),
    data: (__VLS_ctx.versionHistoryData),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_717));
__VLS_719.slots.default;
{
    const { versionStatus: __VLS_thisSlot } = __VLS_719.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_720 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_721 = __VLS_asFunctionalComponent(__VLS_720, new __VLS_720({
        color: (record.versionStatus === 'active' ? 'green' : 'gray'),
    }));
    const __VLS_722 = __VLS_721({
        color: (record.versionStatus === 'active' ? 'green' : 'gray'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_721));
    __VLS_723.slots.default;
    (record.versionStatus === 'active' ? '当前版本' : '历史版本');
    let __VLS_723;
}
{
    const { actions: __VLS_thisSlot } = __VLS_719.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_724 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_725 = __VLS_asFunctionalComponent(__VLS_724, new __VLS_724({}));
    const __VLS_726 = __VLS_725({}, ...__VLS_functionalComponentArgsRest(__VLS_725));
    __VLS_727.slots.default;
    const __VLS_728 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_729 = __VLS_asFunctionalComponent(__VLS_728, new __VLS_728({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
    }));
    const __VLS_730 = __VLS_729({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
    }, ...__VLS_functionalComponentArgsRest(__VLS_729));
    let __VLS_732;
    let __VLS_733;
    let __VLS_734;
    const __VLS_735 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewVersionDetail(record);
        }
    };
    __VLS_731.slots.default;
    let __VLS_731;
    if (record.versionStatus !== 'active') {
        const __VLS_736 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_737 = __VLS_asFunctionalComponent(__VLS_736, new __VLS_736({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_738 = __VLS_737({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_737));
        let __VLS_740;
        let __VLS_741;
        let __VLS_742;
        const __VLS_743 = {
            onClick: (...[$event]) => {
                if (!(record.versionStatus !== 'active'))
                    return;
                __VLS_ctx.activateVersion(record);
            }
        };
        __VLS_739.slots.default;
        let __VLS_739;
    }
    let __VLS_727;
}
let __VLS_719;
let __VLS_715;
/** @type {__VLS_StyleScopedClasses['unified-metrics']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['search-section']} */ 
/** @type {__VLS_StyleScopedClasses['tree-card']} */ 
/** @type {__VLS_StyleScopedClasses['metrics-table']} */ 
/** @type {__VLS_StyleScopedClasses['detail-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['highlight-text']} */ 
/** @type {__VLS_StyleScopedClasses['highlight-text']} */ 
/** @type {__VLS_StyleScopedClasses['detail-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['description-content']} */ 
/** @type {__VLS_StyleScopedClasses['description-content']} */ 
/** @type {__VLS_StyleScopedClasses['detail-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['code-block']} */ 
/** @type {__VLS_StyleScopedClasses['code-block']} */ 
/** @type {__VLS_StyleScopedClasses['description-content']} */ 
/** @type {__VLS_StyleScopedClasses['detail-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['description-content']} */ 
/** @type {__VLS_StyleScopedClasses['detail-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['code-block']} */ 
/** @type {__VLS_StyleScopedClasses['detail-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['code-block']} */ 
/** @type {__VLS_StyleScopedClasses['query-code']} */ 
/** @type {__VLS_StyleScopedClasses['detail-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-title']} */ 
/** @type {__VLS_StyleScopedClasses['version-timeline']} */ 
/** @type {__VLS_StyleScopedClasses['version-item']} */ 
/** @type {__VLS_StyleScopedClasses['version-date']} */ 
/** @type {__VLS_StyleScopedClasses['version-description']} */ 
// @ts-ignore
const __VLS_483 = __VLS_482;
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconDownload: IconDownload,
            IconStar: IconStar,
            IconStarFill: IconStarFill,
            loading: loading,
            searchKeyword: searchKeyword,
            selectedCategory: selectedCategory,
            selectedDomain: selectedDomain,
            selectedStatus: selectedStatus,
            selectedKeys: selectedKeys,
            showCreateModal: showCreateModal,
            showVersionHistoryModal: showVersionHistoryModal,
            drawerVisible: drawerVisible,
            editingMetric: editingMetric,
            currentMetric: currentMetric,
            formRef: formRef,
            versionHistoryData: versionHistoryData,
            searchForm: searchForm,
            pagination: pagination,
            tableData: tableData,
            treeData: treeData,
            formData: formData,
            formRules: formRules,
            versionHistoryColumns: versionHistoryColumns,
            handleSearch: handleSearch,
            onPageChange: onPageChange,
            handlePageSizeChange: handlePageSizeChange,
            onTreeSelect: onTreeSelect,
            showDetail: showDetail,
            closeDrawer: closeDrawer,
            toggleFavorite: toggleFavorite,
            toggleFavoriteFilter: toggleFavoriteFilter,
            editMetric: editMetric,
            copyMetric: copyMetric,
            deleteMetric: deleteMetric,
            viewVersionHistory: viewVersionHistory,
            activateVersion: activateVersion,
            viewVersionDetail: viewVersionDetail,
            handleSubmit: handleSubmit,
            resetForm: resetForm,
            exportMetrics: exportMetrics,
            handleTabChange: handleTabChange,
            getStatusColor: getStatusColor,
            getStatusText: getStatusText,
            getCategoryColor: getCategoryColor,
            getCategoryText: getCategoryText,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
