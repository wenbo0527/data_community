import { ref, onMounted, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconFilter, IconHistory } from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
// 导入新组件
import SearchSection from './components/SearchSection.vue';
import TableCollectionGrid from './components/TableCollectionGrid.vue';
import LoadingState from './components/LoadingState.vue';
import CreateCollectionModal from './components/CreateCollectionModal.vue';
import BusinessProcessFlow from '@/components/BusinessProcessFlow.vue';
import { tableMockData } from '@/mock/tableData';
import mockData from '@/mock/data-map';
// 新增状态管理
const activeTab = ref('1');
const searchLoading = ref(false);
const collectionsLoading = ref(false);
const searchFilters = ref({});
const createCollectionVisible = ref(false);
const editingCollection = ref(null);
const showAdvancedFilter = ref(false);
const showHistory = ref(false);
// 防抖搜索
const debouncedFetchData = useDebounceFn(async () => {
    await fetchCollections();
}, 300);
const router = useRouter();
const searchForm = ref({
    name: ''
});
const loading = ref(false);
const currentTable = ref(null);
const favoriteTables = ref(tableMockData);
const tableCollections = ref(mockData.collections || []);
// 表详情数据
const tableDetailData = computed(() => {
    if (!currentTable.value)
        return [];
    return [
        { label: '表名', value: currentTable.value.name },
        { label: '表类型', value: currentTable.value.type },
        { label: '所属目录', value: currentTable.value.category },
        { label: '业务域', value: currentTable.value.domain },
        { label: '更新频率', value: currentTable.value.updateFrequency },
        { label: '负责人', value: currentTable.value.owner },
        { label: '描述', value: currentTable.value.description }
    ];
});
// 增强的集合数据
const enhancedCollections = computed(() => {
    return tableCollections.value.map(collection => ({
        ...collection,
        type: collection.type || getCollectionType(collection),
        owner: collection.owner || '系统管理员',
        updateTime: collection.updateTime || new Date().toISOString(),
        isFavorite: collection.isFavorite || false
    }));
});
// 根据集合内容推断类型
const getCollectionType = (collection) => {
    const tableTypes = collection.tables.map(t => t.type);
    if (tableTypes.includes('事实表'))
        return '业务流程';
    if (tableTypes.includes('维度表'))
        return '数据分析';
    return '通用';
};
// 获取表集合数据
const fetchCollections = async () => {
    collectionsLoading.value = true;
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        tableCollections.value = mockData.collections || [];
        favoriteTables.value = mockData.favoriteTables || [];
    }
    catch (error) {
        Message.error('获取数据失败');
        console.error('Failed to fetch collections:', error);
    }
    finally {
        collectionsLoading.value = false;
    }
};
// 优化的搜索处理
const handleSearch = async (value, filters) => {
    if (!value.trim()) {
        Message.warning('请输入搜索关键词');
        return;
    }
    searchLoading.value = true;
    try {
        // 模拟搜索API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push({
            path: '/discovery/search',
            query: {
                q: value,
                type: filters.type,
                domain: filters.domain,
                updateFrequency: filters.updateFrequency
            }
        });
    }
    catch (error) {
        Message.error('搜索失败，请重试');
    }
    finally {
        searchLoading.value = false;
    }
};
const handleClearSearch = () => {
    searchForm.value.name = '';
    searchFilters.value = {};
};
const handleFilterChange = (filters) => {
    searchFilters.value = filters;
    // 如果有搜索关键词，自动触发搜索
    if (searchForm.value.name) {
        handleSearch(searchForm.value.name, filters);
    }
};
const handleTabChange = (key) => {
    activeTab.value = key;
    // 切换标签页时可以进行相应的数据加载
    if (key === '1' && !tableCollections.value.length) {
        debouncedFetchData();
    }
};
// 显示表详情
const showDetail = (table) => {
    currentTable.value = table;
};
const showCollectionDetail = (collection) => {
    // 这里添加跳转到场景详情页的逻辑
    router.push({
        name: 'CollectionDetail',
        params: { id: collection.id },
        state: { data: collection }
    });
};
// 移除收藏
const removeFavorite = (table) => {
    favoriteTables.value = favoriteTables.value.filter(t => t.name !== table.name);
    Message.success('已取消收藏');
};
// 创建表集合 - 打开对话框
const handleCreateCollection = () => {
    editingCollection.value = null;
    createCollectionVisible.value = true;
};
// 处理创建集合提交
const handleCreateCollectionSubmit = (collection) => {
    const newCollection = {
        id: String(Date.now()),
        name: collection.name,
        description: collection.description || '',
        type: collection.type || getCollectionType(collection),
        tables: collection.tables,
        owner: collection.owner || '当前用户',
        updateTime: collection.updateTime || new Date().toISOString(),
        isFavorite: collection.isFavorite || false
    };
    tableCollections.value.push(newCollection);
    editingCollection.value = null;
    Message.success('创建成功');
};
// 处理编辑集合提交
const handleUpdateCollectionSubmit = (collection) => {
    const index = tableCollections.value.findIndex(c => c.id === collection.id);
    if (index > -1) {
        tableCollections.value[index] = collection;
        editingCollection.value = null;
        Message.success('更新成功');
    }
};
// 编辑表集合
const handleEditCollection = (collection) => {
    editingCollection.value = collection;
    createCollectionVisible.value = true;
};
// 删除表集合
const handleDeleteCollection = (collection) => {
    const index = tableCollections.value.findIndex(c => c.id === collection.id);
    if (index > -1) {
        tableCollections.value.splice(index, 1);
        Message.success('删除成功');
    }
};
// 收藏状态变更
const handleFavoriteChange = (collection, isFavorite) => {
    const index = tableCollections.value.findIndex(c => c.id === collection.id);
    if (index > -1) {
        tableCollections.value[index].isFavorite = isFavorite;
    }
};
// 切换高级搜索
const toggleAdvancedFilter = () => {
    showAdvancedFilter.value = !showAdvancedFilter.value;
    if (showAdvancedFilter.value) {
        showHistory.value = false;
    }
};
// 切换搜索历史
const toggleHistory = () => {
    showHistory.value = !showHistory.value;
    if (showHistory.value) {
        showAdvancedFilter.value = false;
    }
};
onMounted(async () => {
    loading.value = true;
    try {
        await fetchCollections();
    }
    finally {
        loading.value = false;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-tabs-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['data-map-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['data-map-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-section']} */ ;
/** @type {__VLS_StyleScopedClasses['header-top-row']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-tabs-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-tabs-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['data-map-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-section']} */ ;
/** @type {__VLS_StyleScopedClasses['header-top-row']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-tabs-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-tabs-tab']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-map-container" },
});
if (__VLS_ctx.loading) {
    /** @type {[typeof LoadingState, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(LoadingState, new LoadingState({
        type: "skeleton",
        showSearch: (true),
        showTabs: (true),
        showGrid: (true),
        loadingText: "正在加载数据资产...",
    }));
    const __VLS_1 = __VLS_0({
        type: "skeleton",
        showSearch: (true),
        showTabs: (true),
        showGrid: (true),
        loadingText: "正在加载数据资产...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-top-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "page-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "page-description" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-actions" },
    });
    const __VLS_3 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
        ...{ 'onClick': {} },
        type: "text",
        ...{ class: ({ active: __VLS_ctx.showAdvancedFilter }) },
    }));
    const __VLS_5 = __VLS_4({
        ...{ 'onClick': {} },
        type: "text",
        ...{ class: ({ active: __VLS_ctx.showAdvancedFilter }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    let __VLS_7;
    let __VLS_8;
    let __VLS_9;
    const __VLS_10 = {
        onClick: (__VLS_ctx.toggleAdvancedFilter)
    };
    __VLS_6.slots.default;
    const __VLS_11 = {}.IconFilter;
    /** @type {[typeof __VLS_components.IconFilter, typeof __VLS_components.iconFilter, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({}));
    const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
    var __VLS_6;
    const __VLS_15 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        ...{ 'onClick': {} },
        type: "text",
    }));
    const __VLS_17 = __VLS_16({
        ...{ 'onClick': {} },
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_19;
    let __VLS_20;
    let __VLS_21;
    const __VLS_22 = {
        onClick: (__VLS_ctx.toggleHistory)
    };
    __VLS_18.slots.default;
    const __VLS_23 = {}.IconHistory;
    /** @type {[typeof __VLS_components.IconHistory, typeof __VLS_components.iconHistory, ]} */ ;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({}));
    const __VLS_25 = __VLS_24({}, ...__VLS_functionalComponentArgsRest(__VLS_24));
    var __VLS_18;
    /** @type {[typeof SearchSection, ]} */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(SearchSection, new SearchSection({
        ...{ 'onSearch': {} },
        ...{ 'onClear': {} },
        ...{ 'onFilterChange': {} },
        modelValue: (__VLS_ctx.searchForm.name),
        placeholder: "请输入表名、描述或业务域进行搜索",
        loading: (__VLS_ctx.searchLoading),
        showAdvancedFilter: (__VLS_ctx.showAdvancedFilter),
        showHistory: (__VLS_ctx.showHistory),
    }));
    const __VLS_28 = __VLS_27({
        ...{ 'onSearch': {} },
        ...{ 'onClear': {} },
        ...{ 'onFilterChange': {} },
        modelValue: (__VLS_ctx.searchForm.name),
        placeholder: "请输入表名、描述或业务域进行搜索",
        loading: (__VLS_ctx.searchLoading),
        showAdvancedFilter: (__VLS_ctx.showAdvancedFilter),
        showHistory: (__VLS_ctx.showHistory),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_30;
    let __VLS_31;
    let __VLS_32;
    const __VLS_33 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    const __VLS_34 = {
        onClear: (__VLS_ctx.handleClearSearch)
    };
    const __VLS_35 = {
        onFilterChange: (__VLS_ctx.handleFilterChange)
    };
    var __VLS_29;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tabs-section" },
    });
    const __VLS_36 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onChange': {} },
        activeKey: (__VLS_ctx.activeTab),
        animation: true,
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onChange': {} },
        activeKey: (__VLS_ctx.activeTab),
        animation: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onChange: (__VLS_ctx.handleTabChange)
    };
    __VLS_39.slots.default;
    const __VLS_44 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        key: "1",
        title: "常用表",
    }));
    const __VLS_46 = __VLS_45({
        key: "1",
        title: "常用表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-content-wrapper" },
    });
    /** @type {[typeof TableCollectionGrid, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(TableCollectionGrid, new TableCollectionGrid({
        ...{ 'onCollectionClick': {} },
        ...{ 'onCreateCollection': {} },
        ...{ 'onEditCollection': {} },
        ...{ 'onDeleteCollection': {} },
        ...{ 'onFavoriteChange': {} },
        collections: (__VLS_ctx.enhancedCollections),
        loading: (__VLS_ctx.collectionsLoading),
        pageSize: (12),
    }));
    const __VLS_49 = __VLS_48({
        ...{ 'onCollectionClick': {} },
        ...{ 'onCreateCollection': {} },
        ...{ 'onEditCollection': {} },
        ...{ 'onDeleteCollection': {} },
        ...{ 'onFavoriteChange': {} },
        collections: (__VLS_ctx.enhancedCollections),
        loading: (__VLS_ctx.collectionsLoading),
        pageSize: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_51;
    let __VLS_52;
    let __VLS_53;
    const __VLS_54 = {
        onCollectionClick: (__VLS_ctx.showCollectionDetail)
    };
    const __VLS_55 = {
        onCreateCollection: (__VLS_ctx.handleCreateCollection)
    };
    const __VLS_56 = {
        onEditCollection: (__VLS_ctx.handleEditCollection)
    };
    const __VLS_57 = {
        onDeleteCollection: (__VLS_ctx.handleDeleteCollection)
    };
    const __VLS_58 = {
        onFavoriteChange: (__VLS_ctx.handleFavoriteChange)
    };
    var __VLS_50;
    var __VLS_47;
    const __VLS_59 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        key: "2",
        title: "核心业务流程",
    }));
    const __VLS_61 = __VLS_60({
        key: "2",
        title: "核心业务流程",
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    __VLS_62.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-content-wrapper business-process" },
    });
    /** @type {[typeof BusinessProcessFlow, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(BusinessProcessFlow, new BusinessProcessFlow({}));
    const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
    var __VLS_62;
    var __VLS_39;
    if (__VLS_ctx.currentTable) {
        const __VLS_66 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
            to: (`/discovery/data-map/${encodeURIComponent(JSON.stringify(__VLS_ctx.currentTable))}`),
            ...{ class: "hidden-link" },
        }));
        const __VLS_68 = __VLS_67({
            to: (`/discovery/data-map/${encodeURIComponent(JSON.stringify(__VLS_ctx.currentTable))}`),
            ...{ class: "hidden-link" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    }
    /** @type {[typeof CreateCollectionModal, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(CreateCollectionModal, new CreateCollectionModal({
        ...{ 'onCreate': {} },
        ...{ 'onUpdate': {} },
        visible: (__VLS_ctx.createCollectionVisible),
        editData: (__VLS_ctx.editingCollection),
    }));
    const __VLS_71 = __VLS_70({
        ...{ 'onCreate': {} },
        ...{ 'onUpdate': {} },
        visible: (__VLS_ctx.createCollectionVisible),
        editData: (__VLS_ctx.editingCollection),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_73;
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = {
        onCreate: (__VLS_ctx.handleCreateCollectionSubmit)
    };
    const __VLS_77 = {
        onUpdate: (__VLS_ctx.handleUpdateCollectionSubmit)
    };
    var __VLS_72;
}
/** @type {__VLS_StyleScopedClasses['data-map-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-section']} */ ;
/** @type {__VLS_StyleScopedClasses['header-top-row']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['business-process']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden-link']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconFilter: IconFilter,
            IconHistory: IconHistory,
            SearchSection: SearchSection,
            TableCollectionGrid: TableCollectionGrid,
            LoadingState: LoadingState,
            CreateCollectionModal: CreateCollectionModal,
            BusinessProcessFlow: BusinessProcessFlow,
            activeTab: activeTab,
            searchLoading: searchLoading,
            collectionsLoading: collectionsLoading,
            createCollectionVisible: createCollectionVisible,
            editingCollection: editingCollection,
            showAdvancedFilter: showAdvancedFilter,
            showHistory: showHistory,
            searchForm: searchForm,
            loading: loading,
            currentTable: currentTable,
            enhancedCollections: enhancedCollections,
            handleSearch: handleSearch,
            handleClearSearch: handleClearSearch,
            handleFilterChange: handleFilterChange,
            handleTabChange: handleTabChange,
            showCollectionDetail: showCollectionDetail,
            handleCreateCollection: handleCreateCollection,
            handleCreateCollectionSubmit: handleCreateCollectionSubmit,
            handleUpdateCollectionSubmit: handleUpdateCollectionSubmit,
            handleEditCollection: handleEditCollection,
            handleDeleteCollection: handleDeleteCollection,
            handleFavoriteChange: handleFavoriteChange,
            toggleAdvancedFilter: toggleAdvancedFilter,
            toggleHistory: toggleHistory,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
