/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import metricsMock from '@/mock/metrics';
import { IconUpload, IconStarFill, IconStar } from '@arco-design/web-vue/es/icon';
import IncrementalImportModal from '@/components/modals/IncrementalImportModal.vue';
import BatchImportModal from '@/components/modals/BatchImportModal.vue';
const searchForm = ref({
    name: '',
    category: '',
    businessDomain: '',
    onlyFavorite: false
});
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
        let queryParams = { ...searchForm.value, page: pagination.value.current + '', pageSize: pagination.value.pageSize + '' };
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
    pagination.value.current = 1;
    fetchMetrics();
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metrics-map" },
});
const __VLS_0 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    gutter: (16),
}));
const __VLS_2 = __VLS_1({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    span: (6),
}));
const __VLS_6 = __VLS_5({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "tree-card" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "tree-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_11.slots;
}
const __VLS_12 = {}.ATree;
/** @type {[typeof __VLS_components.ATree, typeof __VLS_components.aTree, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onSelect': {} },
    data: (__VLS_ctx.treeData),
    defaultExpandedKeys: (['用户指标', '交易指标']),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onSelect': {} },
    data: (__VLS_ctx.treeData),
    defaultExpandedKeys: (['用户指标', '交易指标']),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onSelect: (__VLS_ctx.handleTreeSelect)
};
var __VLS_15;
var __VLS_11;
var __VLS_7;
const __VLS_20 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    span: (18),
}));
const __VLS_22 = __VLS_21({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "operation-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-area" },
});
const __VLS_24 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchForm.name),
    placeholder: "请输入指标名称",
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchForm.name),
    placeholder: "请输入指标名称",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onSearch: (__VLS_ctx.handleSearch)
};
var __VLS_27;
const __VLS_32 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "text",
    size: "mini",
    ...{ class: ({ 'active': __VLS_ctx.searchForm.onlyFavorite }) },
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "text",
    size: "mini",
    ...{ class: ({ 'active': __VLS_ctx.searchForm.onlyFavorite }) },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.toggleFavoriteFilter)
};
__VLS_35.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_35.slots;
    if (__VLS_ctx.searchForm.onlyFavorite) {
        const __VLS_40 = {}.IconStarFill;
        /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ style: {} },
        }));
        const __VLS_42 = __VLS_41({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
    else {
        const __VLS_44 = {}.IconStar;
        /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    }
}
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-area" },
});
const __VLS_48 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showIncrementalModal();
    }
};
__VLS_55.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_55.slots;
    const __VLS_60 = {}.IconUpload;
    /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
}
var __VLS_55;
const __VLS_64 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_66 = __VLS_65({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showBatchModal();
    }
};
__VLS_67.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_67.slots;
    const __VLS_72 = {}.IconUpload;
    /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
    const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
}
var __VLS_67;
var __VLS_51;
/** @type {[typeof IncrementalImportModal, ]} */ ;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(IncrementalImportModal, new IncrementalImportModal({
    visible: (__VLS_ctx.incrementalModalVisible),
}));
const __VLS_77 = __VLS_76({
    visible: (__VLS_ctx.incrementalModalVisible),
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
/** @type {[typeof BatchImportModal, ]} */ ;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent(BatchImportModal, new BatchImportModal({
    visible: (__VLS_ctx.batchModalVisible),
}));
const __VLS_80 = __VLS_79({
    visible: (__VLS_ctx.batchModalVisible),
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
const __VLS_82 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    ...{ 'onPageChange': {} },
    ...{ 'onAfterRender': {} },
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_84 = __VLS_83({
    ...{ 'onPageChange': {} },
    ...{ 'onAfterRender': {} },
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
let __VLS_86;
let __VLS_87;
let __VLS_88;
const __VLS_89 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_90 = {
    onAfterRender: (__VLS_ctx.handleTableRender)
};
__VLS_85.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_85.slots;
    const __VLS_91 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        title: "指标名称",
        dataIndex: "name",
    }));
    const __VLS_93 = __VLS_92({
        title: "指标名称",
        dataIndex: "name",
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    __VLS_94.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_94.slots;
        const { record } = __VLS_getSlotParam(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_95 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
            ...{ 'onClick': {} },
        }));
        const __VLS_97 = __VLS_96({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        let __VLS_99;
        let __VLS_100;
        let __VLS_101;
        const __VLS_102 = {
            onClick: (...[$event]) => {
                __VLS_ctx.showDetail(record);
            }
        };
        __VLS_98.slots.default;
        (record.name);
        var __VLS_98;
        const __VLS_103 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_105 = __VLS_104({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        let __VLS_107;
        let __VLS_108;
        let __VLS_109;
        const __VLS_110 = {
            onClick: (...[$event]) => {
                __VLS_ctx.toggleFavorite(record);
            }
        };
        __VLS_106.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_106.slots;
            if (record.isFavorite) {
                const __VLS_111 = {}.IconStarFill;
                /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ ;
                // @ts-ignore
                const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
                    ...{ style: {} },
                }));
                const __VLS_113 = __VLS_112({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_112));
            }
            else {
                const __VLS_115 = {}.IconStar;
                /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ ;
                // @ts-ignore
                const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({}));
                const __VLS_117 = __VLS_116({}, ...__VLS_functionalComponentArgsRest(__VLS_116));
            }
        }
        var __VLS_106;
    }
    var __VLS_94;
    const __VLS_119 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
        title: "指标分类",
        dataIndex: "category",
    }));
    const __VLS_121 = __VLS_120({
        title: "指标分类",
        dataIndex: "category",
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    const __VLS_123 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
        title: "业务域",
        dataIndex: "businessDomain",
    }));
    const __VLS_125 = __VLS_124({
        title: "业务域",
        dataIndex: "businessDomain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_124));
    const __VLS_127 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
        title: "业务口径",
        dataIndex: "businessDefinition",
    }));
    const __VLS_129 = __VLS_128({
        title: "业务口径",
        dataIndex: "businessDefinition",
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    const __VLS_131 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
        title: "指标负责人",
        dataIndex: "owner",
    }));
    const __VLS_133 = __VLS_132({
        title: "指标负责人",
        dataIndex: "owner",
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
}
var __VLS_85;
var __VLS_23;
var __VLS_3;
const __VLS_135 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ ;
// @ts-ignore
const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (800),
    title: "指标详情",
    placement: "right",
    mask: (false),
    wrapStyle: ({ top: '64px', height: 'calc(100% - 64px)' }),
}));
const __VLS_137 = __VLS_136({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.drawerVisible),
    width: (800),
    title: "指标详情",
    placement: "right",
    mask: (false),
    wrapStyle: ({ top: '64px', height: 'calc(100% - 64px)' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_136));
let __VLS_139;
let __VLS_140;
let __VLS_141;
const __VLS_142 = {
    onCancel: (__VLS_ctx.closeDrawer)
};
__VLS_138.slots.default;
if (__VLS_ctx.currentMetric) {
    const __VLS_143 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
        direction: "vertical",
        size: "small",
        fill: true,
        ...{ style: {} },
    }));
    const __VLS_145 = __VLS_144({
        direction: "vertical",
        size: "small",
        fill: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_144));
    __VLS_146.slots.default;
    const __VLS_147 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
        ...{ 'onChange': {} },
        type: "rounded",
        defaultActiveKey: (0),
    }));
    const __VLS_149 = __VLS_148({
        ...{ 'onChange': {} },
        type: "rounded",
        defaultActiveKey: (0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    let __VLS_151;
    let __VLS_152;
    let __VLS_153;
    const __VLS_154 = {
        onChange: (__VLS_ctx.handleTabChange)
    };
    __VLS_150.slots.default;
    const __VLS_155 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
        key: "0",
        title: "基础信息",
    }));
    const __VLS_157 = __VLS_156({
        key: "0",
        title: "基础信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    const __VLS_159 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
        key: "1",
        title: "业务口径",
    }));
    const __VLS_161 = __VLS_160({
        key: "1",
        title: "业务口径",
    }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    const __VLS_163 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({
        key: "2",
        title: "技术逻辑",
    }));
    const __VLS_165 = __VLS_164({
        key: "2",
        title: "技术逻辑",
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    const __VLS_167 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
        key: "3",
        title: "报表位置",
    }));
    const __VLS_169 = __VLS_168({
        key: "3",
        title: "报表位置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_168));
    const __VLS_171 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
        key: "4",
        title: "结果表信息",
    }));
    const __VLS_173 = __VLS_172({
        key: "4",
        title: "结果表信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    const __VLS_175 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        key: "5",
        title: "查询代码",
    }));
    const __VLS_177 = __VLS_176({
        key: "5",
        title: "查询代码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    const __VLS_179 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
        key: "6",
        title: "历史版本",
    }));
    const __VLS_181 = __VLS_180({
        key: "6",
        title: "历史版本",
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    var __VLS_150;
    const __VLS_183 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        gutter: (24),
    }));
    const __VLS_185 = __VLS_184({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    __VLS_186.slots.default;
    const __VLS_187 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
        span: (24),
    }));
    const __VLS_189 = __VLS_188({
        span: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    __VLS_190.slots.default;
    const __VLS_191 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
        ...{ class: "detail-card" },
    }));
    const __VLS_193 = __VLS_192({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    __VLS_194.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_194.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('basic-info');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_195 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
        column: (2),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_197 = __VLS_196({
        column: (2),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    __VLS_198.slots.default;
    const __VLS_199 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
        label: "指标名称",
    }));
    const __VLS_201 = __VLS_200({
        label: "指标名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_200));
    __VLS_202.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "highlight-text" },
    });
    (__VLS_ctx.currentMetric.name);
    var __VLS_202;
    const __VLS_203 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
        label: "指标编号",
    }));
    const __VLS_205 = __VLS_204({
        label: "指标编号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    __VLS_206.slots.default;
    (__VLS_ctx.currentMetric.code);
    var __VLS_206;
    const __VLS_207 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({
        label: "分类/业务域",
    }));
    const __VLS_209 = __VLS_208({
        label: "分类/业务域",
    }, ...__VLS_functionalComponentArgsRest(__VLS_208));
    __VLS_210.slots.default;
    const __VLS_211 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({}));
    const __VLS_213 = __VLS_212({}, ...__VLS_functionalComponentArgsRest(__VLS_212));
    __VLS_214.slots.default;
    (__VLS_ctx.currentMetric.category);
    var __VLS_214;
    const __VLS_215 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
        color: "purple",
        ...{ style: {} },
    }));
    const __VLS_217 = __VLS_216({
        color: "purple",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    __VLS_218.slots.default;
    (__VLS_ctx.currentMetric.businessDomain);
    var __VLS_218;
    var __VLS_210;
    const __VLS_219 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
        label: "负责人",
    }));
    const __VLS_221 = __VLS_220({
        label: "负责人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_220));
    __VLS_222.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "highlight-text" },
    });
    (__VLS_ctx.currentMetric.owner);
    var __VLS_222;
    var __VLS_198;
    var __VLS_194;
    var __VLS_190;
    var __VLS_186;
    const __VLS_223 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
        ...{ class: "detail-card" },
    }));
    const __VLS_225 = __VLS_224({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    __VLS_226.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_226.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('business-definition');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_227 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_229 = __VLS_228({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_228));
    __VLS_230.slots.default;
    const __VLS_231 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({
        label: "业务定义",
    }));
    const __VLS_233 = __VLS_232({
        label: "业务定义",
    }, ...__VLS_functionalComponentArgsRest(__VLS_232));
    __VLS_234.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.businessDefinition);
    var __VLS_234;
    const __VLS_235 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
        label: "使用场景",
    }));
    const __VLS_237 = __VLS_236({
        label: "使用场景",
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    __VLS_238.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.useCase);
    var __VLS_238;
    const __VLS_239 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
        label: "统计周期",
    }));
    const __VLS_241 = __VLS_240({
        label: "统计周期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_240));
    __VLS_242.slots.default;
    const __VLS_243 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
        color: "blue",
    }));
    const __VLS_245 = __VLS_244({
        color: "blue",
    }, ...__VLS_functionalComponentArgsRest(__VLS_244));
    __VLS_246.slots.default;
    (__VLS_ctx.currentMetric.statisticalPeriod);
    var __VLS_246;
    var __VLS_242;
    var __VLS_230;
    var __VLS_226;
    const __VLS_247 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
        ...{ class: "detail-card" },
    }));
    const __VLS_249 = __VLS_248({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    __VLS_250.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_250.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('technical-logic');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_251 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_253 = __VLS_252({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_252));
    __VLS_254.slots.default;
    const __VLS_255 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
        label: "数据来源表",
    }));
    const __VLS_257 = __VLS_256({
        label: "数据来源表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_256));
    __VLS_258.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code-block" },
    });
    (__VLS_ctx.currentMetric.sourceTable);
    var __VLS_258;
    const __VLS_259 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
        label: "加工逻辑",
    }));
    const __VLS_261 = __VLS_260({
        label: "加工逻辑",
    }, ...__VLS_functionalComponentArgsRest(__VLS_260));
    __VLS_262.slots.default;
    const __VLS_263 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
    // @ts-ignore
    const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({
        code: true,
        ...{ class: "code-block" },
    }));
    const __VLS_265 = __VLS_264({
        code: true,
        ...{ class: "code-block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_264));
    __VLS_266.slots.default;
    (__VLS_ctx.currentMetric.processingLogic);
    var __VLS_266;
    var __VLS_262;
    const __VLS_267 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
        label: "关联字段说明",
    }));
    const __VLS_269 = __VLS_268({
        label: "关联字段说明",
    }, ...__VLS_functionalComponentArgsRest(__VLS_268));
    __VLS_270.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.fieldDescription);
    var __VLS_270;
    var __VLS_254;
    var __VLS_250;
    const __VLS_271 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
        ...{ class: "detail-card" },
    }));
    const __VLS_273 = __VLS_272({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_272));
    __VLS_274.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_274.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('report-position');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_275 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_277 = __VLS_276({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_276));
    __VLS_278.slots.default;
    const __VLS_279 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
        label: "报表信息",
    }));
    const __VLS_281 = __VLS_280({
        label: "报表信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_280));
    __VLS_282.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description-content" },
    });
    (__VLS_ctx.currentMetric.reportInfo);
    var __VLS_282;
    var __VLS_278;
    var __VLS_274;
    const __VLS_283 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
        ...{ class: "detail-card" },
    }));
    const __VLS_285 = __VLS_284({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_284));
    __VLS_286.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_286.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('result-table');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_287 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }));
    const __VLS_289 = __VLS_288({
        column: (1),
        labelStyle: ({ 'font-weight': 600 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_288));
    __VLS_290.slots.default;
    const __VLS_291 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
        label: "存储位置",
    }));
    const __VLS_293 = __VLS_292({
        label: "存储位置",
    }, ...__VLS_functionalComponentArgsRest(__VLS_292));
    __VLS_294.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code-block" },
    });
    (__VLS_ctx.currentMetric.storageLocation);
    var __VLS_294;
    var __VLS_290;
    var __VLS_286;
    const __VLS_295 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({
        ...{ class: "detail-card" },
    }));
    const __VLS_297 = __VLS_296({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_296));
    __VLS_298.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_298.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('query-code');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_299 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
        code: true,
        ...{ class: "code-block query-code" },
    }));
    const __VLS_301 = __VLS_300({
        code: true,
        ...{ class: "code-block query-code" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    __VLS_302.slots.default;
    (__VLS_ctx.currentMetric.queryCode);
    var __VLS_302;
    var __VLS_298;
    const __VLS_303 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({
        ...{ class: "detail-card" },
    }));
    const __VLS_305 = __VLS_304({
        ...{ class: "detail-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_304));
    __VLS_306.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_306.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentMetric))
                        return;
                    __VLS_ctx.scrollToCard('history-version');
                } },
            ...{ class: "card-title" },
        });
    }
    const __VLS_307 = {}.ATimeline;
    /** @type {[typeof __VLS_components.ATimeline, typeof __VLS_components.aTimeline, typeof __VLS_components.ATimeline, typeof __VLS_components.aTimeline, ]} */ ;
    // @ts-ignore
    const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({
        ...{ class: "version-timeline" },
    }));
    const __VLS_309 = __VLS_308({
        ...{ class: "version-timeline" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_308));
    __VLS_310.slots.default;
    for (const [version, index] of __VLS_getVForSourceType((__VLS_ctx.currentMetric.versions))) {
        const __VLS_311 = {}.ATimelineItem;
        /** @type {[typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, typeof __VLS_components.ATimelineItem, typeof __VLS_components.aTimelineItem, ]} */ ;
        // @ts-ignore
        const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({
            key: (index),
        }));
        const __VLS_313 = __VLS_312({
            key: (index),
        }, ...__VLS_functionalComponentArgsRest(__VLS_312));
        __VLS_314.slots.default;
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
        var __VLS_314;
    }
    var __VLS_310;
    var __VLS_306;
    var __VLS_146;
}
var __VLS_138;
/** @type {__VLS_StyleScopedClasses['metrics-map']} */ ;
/** @type {__VLS_StyleScopedClasses['tree-card']} */ ;
/** @type {__VLS_StyleScopedClasses['operation-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-area']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['action-area']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-text']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-text']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['description-content']} */ ;
/** @type {__VLS_StyleScopedClasses['description-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['code-block']} */ ;
/** @type {__VLS_StyleScopedClasses['code-block']} */ ;
/** @type {__VLS_StyleScopedClasses['description-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['description-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['code-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['code-block']} */ ;
/** @type {__VLS_StyleScopedClasses['query-code']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['version-timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['version-item']} */ ;
/** @type {__VLS_StyleScopedClasses['version-date']} */ ;
/** @type {__VLS_StyleScopedClasses['version-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconStarFill: IconStarFill,
            IconStar: IconStar,
            IncrementalImportModal: IncrementalImportModal,
            BatchImportModal: BatchImportModal,
            searchForm: searchForm,
            pagination: pagination,
            tableData: tableData,
            drawerVisible: drawerVisible,
            currentMetric: currentMetric,
            incrementalModalVisible: incrementalModalVisible,
            batchModalVisible: batchModalVisible,
            showIncrementalModal: showIncrementalModal,
            showBatchModal: showBatchModal,
            treeData: treeData,
            handleTabChange: handleTabChange,
            handleTreeSelect: handleTreeSelect,
            handleSearch: handleSearch,
            onPageChange: onPageChange,
            showDetail: showDetail,
            scrollToCard: scrollToCard,
            closeDrawer: closeDrawer,
            toggleFavorite: toggleFavorite,
            toggleFavoriteFilter: toggleFavoriteFilter,
            handleTableRender: handleTableRender,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
