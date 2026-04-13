import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import metricsMock from '@/mock/metrics';
import { IconStarFill, IconStar, IconDownload, IconPlus } from '@arco-design/web-vue/es/icon';
const searchForm = ref({
    name: '',
    category: '',
    businessDomain: '',
    onlyFavorite: false
});
// 添加缺失的响应式变量
const searchKeyword = ref('');
const selectedCategory = ref('');
const selectedDomain = ref('');
const selectedKeys = ref([]);
const showCreateModal = ref(false);
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10
});
const tableData = ref([]);
const drawerVisible = ref(false);
const currentMetric = ref(null);
const incrementalModalVisible = ref(false);
const batchModalVisible = ref(false);
const incrementalFileCount = ref(0);
const batchFileCount = ref(0);
const showIncrementalModal = () => {
    incrementalModalVisible.value = true;
};
const showBatchModal = () => {
    batchModalVisible.value = true;
};
// 树形数据结构
const treeData = ref([
    {
        title: '用户指标',
        key: '用户指标',
        children: [
            {
                title: '获客域',
                key: '用户指标-获客域'
            },
            {
                title: '转化域',
                key: '用户指标-转化域'
            },
            {
                title: '留存域',
                key: '用户指标-留存域'
            }
        ]
    },
    {
        title: '交易指标',
        key: '交易指标',
        children: [
            {
                title: '变现域',
                key: '交易指标-变现域'
            }
        ]
    }
]);
// 处理树节点选择
const handleTabChange = (key) => {
    console.log('切换标签页:', key);
};
const onTreeSelect = (selectedKeys, data) => {
    handleTreeSelect(selectedKeys, data);
};
const handleTreeSelect = (selectedKeys, data) => {
    if (selectedKeys.length === 0) {
        searchForm.value.category = '';
        searchForm.value.businessDomain = '';
        handleSearch();
        return;
    }
    const selectedKey = String(selectedKeys[0]);
    if (selectedKey.includes('-')) {
        const [category, domain] = selectedKey.split('-');
        searchForm.value.category = category;
        searchForm.value.businessDomain = domain;
    }
    else {
        searchForm.value.category = selectedKey;
        searchForm.value.businessDomain = '';
    }
    handleSearch();
};
// 下载模板
const downloadTemplate = (type) => {
    const link = document.createElement('a');
    link.href = `/templates/metrics-${type}-template.xlsx`;
    link.download = `指标${type === 'incremental' ? '增量' : '批量'}导入模板.xlsx`;
    link.click();
};
// 处理文件变化
const handleFileChange = (type, event) => {
    const file = event.file;
    if (file) {
        console.log(`[${type}上传] 选择的文件:`, file.name, '大小:', file.size, '类型:', file.type);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                console.log(`[${type}上传] 解析成功，共${jsonData.length}条记录`, jsonData.slice(0, 3));
                if (type === 'incremental') {
                    incrementalFileCount.value = jsonData.length;
                }
                else {
                    batchFileCount.value = jsonData.length;
                }
            }
            catch (error) {
                console.error('文件解析失败:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    }
};
// 确认增量上传
const confirmIncrementalUpload = () => {
    console.log('确认增量上传', incrementalFileCount.value, '条记录');
    console.log('触发增量上传API请求');
    incrementalFileCount.value = 0;
    incrementalModalVisible.value = false;
};
// 确认批量上传
const confirmBatchUpload = () => {
    console.log('确认批量上传', batchFileCount.value, '条记录');
    console.log('触发批量上传API请求');
    batchFileCount.value = 0;
    batchModalVisible.value = false;
};
// 批量上传
const handleBatchUpload = async (option) => {
    const formData = new FormData();
    formData.append('file', option.fileItem.file);
    console.log('开始批量上传文件:', option.fileItem.name);
    try {
        const res = await axios.post('/api/metrics/batch-import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('批量上传响应:', res.data);
        if (res.data.success) {
            batchFileCount.value = res.data.count;
            fetchMetrics();
        }
    }
    catch (error) {
        console.error('批量上传失败:', error);
    }
    return {
        abort: () => { }
    };
};
// 增量上传
const handleIncrementalUpload = async (option) => {
    const formData = new FormData();
    formData.append('file', option.fileItem.file);
    console.log('开始增量上传文件:', option.fileItem.name);
    try {
        const res = await axios.post('/api/metrics/incremental-import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('增量上传响应:', res.data);
        if (res.data.success) {
            incrementalFileCount.value = res.data.count;
            fetchMetrics();
        }
    }
    catch (error) {
        console.error('增量上传失败:', error);
    }
    return {
        abort: () => { }
    };
};
// 获取指标列表
const fetchMetrics = async () => {
    try {
        console.log('请求参数:', {
            page: pagination.value.current,
            pageSize: pagination.value.pageSize,
            ...searchForm.value
        });
        // 直接使用 mock 数据
        const queryParams = { ...searchForm.value, page: pagination.value.current + '', pageSize: pagination.value.pageSize + '' };
        if (searchForm.value.onlyFavorite) {
            queryParams.isFavorite = true;
        }
        const mockList = metricsMock[0].response({ query: queryParams });
        console.log('Mock数据:', mockList);
        if (mockList && mockList.data) {
            tableData.value = mockList.data.list || [];
            pagination.value.total = mockList.data.total || 0;
            console.log('更新后的表格数据:', tableData.value);
            console.log('更新后的分页信息:', pagination.value);
        }
        else {
            console.warn('Mock数据格式异常:', mockList);
            tableData.value = [];
            pagination.value.total = 0;
        }
    }
    catch (error) {
        console.error('获取指标列表失败:', error);
        tableData.value = [];
        pagination.value.total = 0;
    }
};
// 搜索处理
const handleSearch = () => {
    // 同步搜索表单数据
    searchForm.value.name = searchKeyword.value;
    searchForm.value.category = selectedCategory.value;
    searchForm.value.businessDomain = selectedDomain.value;
    pagination.value.current = 1;
    fetchMetrics();
};
// 导出指标
const exportMetrics = () => {
    console.log('导出指标数据');
    // 这里可以添加导出逻辑
};
// 分页处理
const onPageChange = (current) => {
    pagination.value.current = current;
    fetchMetrics();
};
// 显示详情
const showDetail = (record) => {
    currentMetric.value = record;
    drawerVisible.value = true;
};
// 关闭详情抽屉
const scrollToCard = (id) => {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
const closeDrawer = () => {
    drawerVisible.value = false;
    currentMetric.value = null;
};
// 收藏切换
const toggleFavorite = (record) => {
    record.isFavorite = !record.isFavorite;
};
const toggleFavoriteFilter = () => {
    searchForm.value.onlyFavorite = !searchForm.value.onlyFavorite;
    handleSearch();
};
// 表格渲染完成处理
const handleTableRender = () => {
    console.log('表格渲染完成，当前容器宽度:', document.querySelector('.metrics-map')?.clientWidth);
    console.log('表格列宽计算:', document.querySelectorAll('.arco-table-col').forEach((col) => {
        console.log(col.dataset.columnKey, '宽度:', col.clientWidth);
    }));
};
onMounted(() => {
    console.log('组件挂载，开始获取数据');
    console.log('初始容器宽度:', document.querySelector('.metrics-map')?.clientWidth);
    fetchMetrics();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['metric-name']} */ 
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metrics-map" },
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
let __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_28 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    gutter: (16),
}));
const __VLS_30 = __VLS_29({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    span: (8),
}));
const __VLS_34 = __VLS_33({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索指标名称、描述",
}));
const __VLS_38 = __VLS_37({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索指标名称、描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onSearch: (__VLS_ctx.handleSearch)
};
let __VLS_39;
let __VLS_35;
const __VLS_44 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    span: (4),
}));
const __VLS_46 = __VLS_45({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCategory),
    placeholder: "选择分类",
    allowClear: true,
}));
const __VLS_50 = __VLS_49({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCategory),
    placeholder: "选择分类",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_51.slots.default;
const __VLS_56 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    value: "business",
}));
const __VLS_58 = __VLS_57({
    value: "business",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
let __VLS_59;
const __VLS_60 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    value: "technical",
}));
const __VLS_62 = __VLS_61({
    value: "technical",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
let __VLS_63;
const __VLS_64 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: "quality",
}));
const __VLS_66 = __VLS_65({
    value: "quality",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
let __VLS_67;
let __VLS_51;
let __VLS_47;
const __VLS_68 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    span: (4),
}));
const __VLS_70 = __VLS_69({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedDomain),
    placeholder: "业务域",
    allowClear: true,
}));
const __VLS_74 = __VLS_73({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedDomain),
    placeholder: "业务域",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_75.slots.default;
const __VLS_80 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    value: "user",
}));
const __VLS_82 = __VLS_81({
    value: "user",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
let __VLS_83;
const __VLS_84 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    value: "transaction",
}));
const __VLS_86 = __VLS_85({
    value: "transaction",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
let __VLS_87;
const __VLS_88 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    value: "product",
}));
const __VLS_90 = __VLS_89({
    value: "product",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
let __VLS_91;
let __VLS_75;
let __VLS_71;
let __VLS_31;
const __VLS_92 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    gutter: (24),
}));
const __VLS_94 = __VLS_93({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    span: (6),
}));
const __VLS_98 = __VLS_97({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    title: "指标分类",
    bordered: (false),
}));
const __VLS_102 = __VLS_101({
    title: "指标分类",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ATree;
/** @type {[typeof __VLS_components.ATree, typeof __VLS_components.aTree, ]} */ 
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    ...{ 'onSelect': {} },
    selectedKeys: (__VLS_ctx.selectedKeys),
    data: (__VLS_ctx.treeData),
    showLine: (true),
}));
const __VLS_106 = __VLS_105({
    ...{ 'onSelect': {} },
    selectedKeys: (__VLS_ctx.selectedKeys),
    data: (__VLS_ctx.treeData),
    showLine: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onSelect: (__VLS_ctx.onTreeSelect)
};
let __VLS_107;
let __VLS_103;
let __VLS_99;
const __VLS_112 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    span: (18),
}));
const __VLS_114 = __VLS_113({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    bordered: (false),
}));
const __VLS_118 = __VLS_117({
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    ...{ 'onPageChange': {} },
    ...{ 'onAfterRender': {} },
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_122 = __VLS_121({
    ...{ 'onPageChange': {} },
    ...{ 'onAfterRender': {} },
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
let __VLS_124;
let __VLS_125;
let __VLS_126;
const __VLS_127 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_128 = {
    onAfterRender: (__VLS_ctx.handleTableRender)
};
__VLS_123.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_123.slots;
    const __VLS_129 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        title: "指标名称",
        dataIndex: "name",
    }));
    const __VLS_131 = __VLS_130({
        title: "指标名称",
        dataIndex: "name",
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    __VLS_132.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_132.slots;
        const { record } = __VLS_getSlotParam(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_133 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ 
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
            ...{ 'onClick': {} },
        }));
        const __VLS_135 = __VLS_134({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_137;
        let __VLS_138;
        let __VLS_139;
        const __VLS_140 = {
            onClick: (...[$event]) => {
                __VLS_ctx.showDetail(record);
            }
        };
        __VLS_136.slots.default;
        (record.name);
        let __VLS_136;
        const __VLS_141 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_143 = __VLS_142({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        let __VLS_145;
        let __VLS_146;
        let __VLS_147;
        const __VLS_148 = {
            onClick: (...[$event]) => {
                __VLS_ctx.toggleFavorite(record);
            }
        };
        __VLS_144.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_144.slots;
            if (record.isFavorite) {
                const __VLS_149 = {}.IconStarFill;
                /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ 
                // @ts-ignore
                const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
                    ...{ style: {} },
                }));
                const __VLS_151 = __VLS_150({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_150));
            }
            else {
                const __VLS_153 = {}.IconStar;
                /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ 
                // @ts-ignore
                const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({}));
                const __VLS_155 = __VLS_154({}, ...__VLS_functionalComponentArgsRest(__VLS_154));
            }
        }
        let __VLS_144;
    }
    let __VLS_132;
    const __VLS_157 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        title: "指标分类",
        dataIndex: "category",
    }));
    const __VLS_159 = __VLS_158({
        title: "指标分类",
        dataIndex: "category",
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    const __VLS_161 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
        title: "业务域",
        dataIndex: "businessDomain",
    }));
    const __VLS_163 = __VLS_162({
        title: "业务域",
        dataIndex: "businessDomain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    const __VLS_165 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        title: "业务口径",
        dataIndex: "businessDefinition",
    }));
    const __VLS_167 = __VLS_166({
        title: "业务口径",
        dataIndex: "businessDefinition",
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    const __VLS_169 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
        title: "指标负责人",
        dataIndex: "owner",
    }));
    const __VLS_171 = __VLS_170({
        title: "指标负责人",
        dataIndex: "owner",
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
}
let __VLS_123;
let __VLS_119;
let __VLS_115;
let __VLS_95;
const __VLS_173 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ 
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (800),
    title: "指标详情",
    placement: "right",
    mask: (false),
    wrapStyle: ({ top: '64px', height: 'calc(100% - 64px)' }),
}));
const __VLS_175 = __VLS_174({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (800),
    title: "指标详情",
    placement: "right",
    mask: (false),
    wrapStyle: ({ top: '64px', height: 'calc(100% - 64px)' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
let __VLS_177;
let __VLS_178;
let __VLS_179;
const __VLS_180 = {
    onCancel: (__VLS_ctx.closeDrawer)
};
__VLS_176.slots.default;
if (__VLS_ctx.currentMetric) {
    const __VLS_181 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
        direction: "vertical",
        size: "small",
        fill: true,
        ...{ style: {} },
    }));
    const __VLS_183 = __VLS_182({
        direction: "vertical",
        size: "small",
        fill: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    __VLS_184.slots.default;
    const __VLS_185 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
        ...{ 'onChange': {} },
        type: "rounded",
        defaultActiveKey: (0),
    }));
    const __VLS_187 = __VLS_186({
        ...{ 'onChange': {} },
        type: "rounded",
        defaultActiveKey: (0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    let __VLS_189;
    let __VLS_190;
    let __VLS_191;
    const __VLS_192 = {
        onChange: (__VLS_ctx.handleTabChange)
    };
    __VLS_188.slots.default;
    const __VLS_193 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
        key: "0",
        title: "基础信息",
    }));
    const __VLS_195 = __VLS_194({
        key: "0",
        title: "基础信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_194));
    const __VLS_197 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
        key: "1",
        title: "业务口径",
    }));
    const __VLS_199 = __VLS_198({
        key: "1",
        title: "业务口径",
    }, ...__VLS_functionalComponentArgsRest(__VLS_198));
    const __VLS_201 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
        key: "2",
        title: "技术逻辑",
    }));
    const __VLS_203 = __VLS_202({
        key: "2",
        title: "技术逻辑",
    }, ...__VLS_functionalComponentArgsRest(__VLS_202));
    const __VLS_205 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
        key: "3",
        title: "报表位置",
    }));
    const __VLS_207 = __VLS_206({
        key: "3",
        title: "报表位置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_206));
    const __VLS_209 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
        key: "4",
        title: "结果表信息",
    }));
    const __VLS_211 = __VLS_210({
        key: "4",
        title: "结果表信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    const __VLS_213 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
        key: "5",
        title: "查询代码",
    }));
    const __VLS_215 = __VLS_214({
        key: "5",
        title: "查询代码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_214));
    const __VLS_217 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
        key: "6",
        title: "历史版本",
    }));
    const __VLS_219 = __VLS_218({
        key: "6",
        title: "历史版本",
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    let __VLS_188;
    const __VLS_221 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
    // @ts-ignore
    const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
        gutter: (24),
    }));
    const __VLS_223 = __VLS_222({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_222));
    __VLS_224.slots.default;
    const __VLS_225 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
    // @ts-ignore
    const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
        span: (24),
    }));
    const __VLS_227 = __VLS_226({
        span: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_226));
    __VLS_228.slots.default;
    const __VLS_229 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
        ...{ class: "detail-card" },
    }));
    const __VLS_231 = __VLS_230({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    __VLS_232.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_232.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('basic-info');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_233 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
        column: (2),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_235 = __VLS_234({
        column: (2),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    __VLS_236.slots.default;
    const __VLS_237 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
        label: "指标名称",
    }));
    const __VLS_239 = __VLS_238({
        label: "指标名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_238));
    __VLS_240.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "highlight-text" },
    });
    (__VLS_ctx.currentMetric.name);
    let __VLS_240;
    const __VLS_241 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
        label: "指标编号",
    }));
    const __VLS_243 = __VLS_242({
        label: "指标编号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    __VLS_244.slots.default;
    (__VLS_ctx.currentMetric.code);
    let __VLS_244;
    const __VLS_245 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
        label: "分类/业务域",
    }));
    const __VLS_247 = __VLS_246({
        label: "分类/业务域",
    }, ...__VLS_functionalComponentArgsRest(__VLS_246));
    __VLS_248.slots.default;
    const __VLS_249 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({}));
    const __VLS_251 = __VLS_250({}, ...__VLS_functionalComponentArgsRest(__VLS_250));
    __VLS_252.slots.default;
    (__VLS_ctx.currentMetric.category);
    let __VLS_252;
    const __VLS_253 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
        color: "purple",
        ...{ style: {} },
    }));
    const __VLS_255 = __VLS_254({
        color: "purple",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    __VLS_256.slots.default;
    (__VLS_ctx.currentMetric.businessDomain);
    let __VLS_256;
    let __VLS_248;
    const __VLS_257 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
        label: "负责人",
    }));
    const __VLS_259 = __VLS_258({
        label: "负责人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_258));
    __VLS_260.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "highlight-text" },
    });
    (__VLS_ctx.currentMetric.owner);
    let __VLS_260;
    let __VLS_236;
    let __VLS_232;
    let __VLS_228;
    let __VLS_224;
    const __VLS_261 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
        ...{ class: "detail-card" },
    }));
    const __VLS_263 = __VLS_262({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_262));
    __VLS_264.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_264.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('business-definition');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_265 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_267 = __VLS_266({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_266));
    __VLS_268.slots.default;
    const __VLS_269 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({
        label: "业务定义",
    }));
    const __VLS_271 = __VLS_270({
        label: "业务定义",
    }, ...__VLS_functionalComponentArgsRest(__VLS_270));
    __VLS_272.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.businessDefinition);
    let __VLS_272;
    const __VLS_273 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
        label: "使用场景",
    }));
    const __VLS_275 = __VLS_274({
        label: "使用场景",
    }, ...__VLS_functionalComponentArgsRest(__VLS_274));
    __VLS_276.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.useCase);
    let __VLS_276;
    const __VLS_277 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_278 = __VLS_asFunctionalComponent(__VLS_277, new __VLS_277({
        label: "统计周期",
    }));
    const __VLS_279 = __VLS_278({
        label: "统计周期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_278));
    __VLS_280.slots.default;
    const __VLS_281 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({
        color: "blue",
    }));
    const __VLS_283 = __VLS_282({
        color: "blue",
    }, ...__VLS_functionalComponentArgsRest(__VLS_282));
    __VLS_284.slots.default;
    (__VLS_ctx.currentMetric.statisticalPeriod);
    let __VLS_284;
    let __VLS_280;
    let __VLS_268;
    let __VLS_264;
    const __VLS_285 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_286 = __VLS_asFunctionalComponent(__VLS_285, new __VLS_285({
        ...{ class: "detail-card" },
    }));
    const __VLS_287 = __VLS_286({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_286));
    __VLS_288.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_288.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('technical-logic');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_289 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_291 = __VLS_290({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_290));
    __VLS_292.slots.default;
    const __VLS_293 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({
        label: "数据来源表",
    }));
    const __VLS_295 = __VLS_294({
        label: "数据来源表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_294));
    __VLS_296.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code-block" },
    });
    (__VLS_ctx.currentMetric.sourceTable);
    let __VLS_296;
    const __VLS_297 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent(__VLS_297, new __VLS_297({
        label: "加工逻辑",
    }));
    const __VLS_299 = __VLS_298({
        label: "加工逻辑",
    }, ...__VLS_functionalComponentArgsRest(__VLS_298));
    __VLS_300.slots.default;
    const __VLS_301 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ 
    // @ts-ignore
    const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({
        code: true,
        ...{ class: "code-block" },
    }));
    const __VLS_303 = __VLS_302({
        code: true,
        ...{ class: "code-block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_302));
    __VLS_304.slots.default;
    (__VLS_ctx.currentMetric.processingLogic);
    let __VLS_304;
    let __VLS_300;
    const __VLS_305 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({
        label: "关联字段说明",
    }));
    const __VLS_307 = __VLS_306({
        label: "关联字段说明",
    }, ...__VLS_functionalComponentArgsRest(__VLS_306));
    __VLS_308.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.fieldDescription);
    let __VLS_308;
    let __VLS_292;
    let __VLS_288;
    const __VLS_309 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
        ...{ class: "detail-card" },
    }));
    const __VLS_311 = __VLS_310({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_310));
    __VLS_312.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_312.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('report-position');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_313 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_315 = __VLS_314({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_314));
    __VLS_316.slots.default;
    const __VLS_317 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
        label: "报表信息",
    }));
    const __VLS_319 = __VLS_318({
        label: "报表信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_318));
    __VLS_320.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.reportInfo);
    let __VLS_320;
    let __VLS_316;
    let __VLS_312;
    const __VLS_321 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_322 = __VLS_asFunctionalComponent(__VLS_321, new __VLS_321({
        ...{ class: "detail-card" },
    }));
    const __VLS_323 = __VLS_322({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_322));
    __VLS_324.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_324.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('result-table');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_325 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_327 = __VLS_326({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_326));
    __VLS_328.slots.default;
    const __VLS_329 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
        label: "存储位置",
    }));
    const __VLS_331 = __VLS_330({
        label: "存储位置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_330));
    __VLS_332.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code-block" },
    });
    (__VLS_ctx.currentMetric.storageLocation);
    let __VLS_332;
    let __VLS_328;
    let __VLS_324;
    const __VLS_333 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({
        ...{ class: "detail-card" },
    }));
    const __VLS_335 = __VLS_334({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_334));
    __VLS_336.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_336.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('query-code');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_337 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ 
    // @ts-ignore
    const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
        code: true,
        ...{ class: "code-block query-code" },
    }));
    const __VLS_339 = __VLS_338({
        code: true,
        ...{ class: "code-block query-code" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_338));
    __VLS_340.slots.default;
    (__VLS_ctx.currentMetric.queryCode);
    let __VLS_340;
    let __VLS_336;
    const __VLS_341 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
        ...{ class: "detail-card" },
    }));
    const __VLS_343 = __VLS_342({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_342));
    __VLS_344.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_344.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('history-version');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_345 = {}.ATimeline;
    /** @type {[typeof __VLS_components.ATimeline, typeof __VLS_components.aTimeline, typeof __VLS_components.ATimeline, typeof __VLS_components.aTimeline, ]} */ 
    // @ts-ignore
    const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
        ...{ class: "version-timeline" },
    }));
    const __VLS_347 = __VLS_346({
        ...{ class: "version-timeline" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_346));
    __VLS_348.slots.default;
    for (const [version, index] of __VLS_getVForSourceType((__VLS_ctx.currentMetric.versions))) {
        const __VLS_349 = {}.ATimelineItem;
        /** @type {[typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, ]} */ 
        // @ts-ignore
        const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
            key: (index),
        }));
        const __VLS_351 = __VLS_350({
            key: (index),
        }, ...__VLS_functionalComponentArgsRest(__VLS_350));
        __VLS_352.slots.default;
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
        var __VLS_352;
    }
    let __VLS_348;
    let __VLS_344;
    let __VLS_184;
}
let __VLS_176;
/** @type {__VLS_StyleScopedClasses['metrics-map']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['search-section']} */ 
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
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconStarFill: IconStarFill,
            IconStar: IconStar,
            IconDownload: IconDownload,
            IconPlus: IconPlus,
            searchKeyword: searchKeyword,
            selectedCategory: selectedCategory,
            selectedDomain: selectedDomain,
            selectedKeys: selectedKeys,
            showCreateModal: showCreateModal,
            pagination: pagination,
            tableData: tableData,
            drawerVisible: drawerVisible,
            currentMetric: currentMetric,
            treeData: treeData,
            handleTabChange: handleTabChange,
            onTreeSelect: onTreeSelect,
            handleSearch: handleSearch,
            exportMetrics: exportMetrics,
            onPageChange: onPageChange,
            showDetail: showDetail,
            scrollToCard: scrollToCard,
            closeDrawer: closeDrawer,
            toggleFavorite: toggleFavorite,
            handleTableRender: handleTableRender,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
