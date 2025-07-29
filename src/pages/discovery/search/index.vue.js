import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { useDebounceFn } from '@vueuse/core';
import { IconSearch, IconFilter, IconHistory, IconDelete, IconHeart, IconUser, IconClockCircle, IconApps } from '@arco-design/web-vue/es/icon';
// 导入组件
import LoadingState from '../data-map/components/LoadingState.vue';
import mockDataMap from '@/mock/data-map';
import mockMetrics from '@/mock/metrics';
const router = useRouter();
const route = useRoute();
// 响应式状态
const loading = ref(false);
const searchLoading = ref(false);
const searchQuery = ref('');
const showAdvancedFilter = ref(false);
const showHistory = ref(false);
const activeResultType = ref('all');
const currentPage = ref(1);
const pageSize = ref(12);
const searchHistory = ref([]);
const filters = ref({});
// 搜索结果数据
const allResults = ref([]);
const tableResults = ref([]);
const metricResults = ref([]);
const externalResults = ref([]);
// 计算属性
const currentResults = computed(() => {
    switch (activeResultType.value) {
        case 'table':
            return tableResults.value;
        case 'metric':
            return metricResults.value;
        case 'external':
            return externalResults.value;
        default:
            return allResults.value;
    }
});
const totalResults = computed(() => currentResults.value.length);
// 防抖搜索
const debouncedSearch = useDebounceFn(async () => {
    await performSearch();
}, 300);
// 初始化
onMounted(() => {
    loadSearchHistory();
    // 如果URL中有搜索参数，自动执行搜索
    const query = route.query.q;
    if (query) {
        searchQuery.value = query;
        handleSearch(query);
    }
});
// 监听搜索查询变化
watch(searchQuery, (newValue) => {
    if (newValue) {
        debouncedSearch();
    }
    else {
        clearResults();
    }
});
// 搜索方法
const handleSearch = async (query) => {
    const searchTerm = query || searchQuery.value;
    if (!searchTerm.trim())
        return;
    searchLoading.value = true;
    saveSearchHistory(searchTerm);
    try {
        await performSearch(searchTerm);
    }
    finally {
        searchLoading.value = false;
    }
};
const performSearch = async (query) => {
    const searchTerm = query || searchQuery.value;
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    // 搜索数据表
    const tables = mockDataMap.collections?.flatMap(collection => collection.tables.map(table => ({
        id: `table_${table.name}`,
        name: table.name,
        description: table.description,
        type: 'table',
        owner: table.owner,
        updateTime: '2024-01-15',
        domain: table.domain,
        isFavorite: false
    }))) || [];
    // 搜索指标
    const metrics = mockMetrics?.map((metric) => ({
        id: `metric_${metric.id}`,
        name: metric.name,
        description: metric.description,
        type: 'metric',
        owner: metric.owner || '系统管理员',
        updateTime: metric.updateTime || '2024-01-15',
        domain: metric.category,
        isFavorite: false
    })) || [];
    // 搜索外部数据
    const external = [
        {
            id: 'external_1',
            name: '外部数据源A',
            description: '来自第三方的数据源',
            type: 'external',
            owner: '系统管理员',
            updateTime: '2024-01-15',
            domain: '金融',
            isFavorite: false
        },
        {
            id: 'external_2',
            name: '外部数据源B',
            description: '合作伙伴提供的数据',
            type: 'external',
            owner: '数据管理员',
            updateTime: '2024-01-10',
            domain: '营销',
            isFavorite: false
        }
    ];
    // 过滤搜索结果
    const filterResults = (items) => {
        return items.filter(item => {
            const matchesQuery = !searchTerm ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = !filters.value.type || item.type === filters.value.type;
            const matchesDomain = !filters.value.domain || item.domain === filters.value.domain;
            return matchesQuery && matchesType && matchesDomain;
        });
    };
    tableResults.value = filterResults(tables);
    metricResults.value = filterResults(metrics);
    externalResults.value = filterResults(external);
    allResults.value = [...tableResults.value, ...metricResults.value, ...externalResults.value];
};
const handleClearSearch = () => {
    searchQuery.value = '';
    clearResults();
};
const clearResults = () => {
    allResults.value = [];
    tableResults.value = [];
    metricResults.value = [];
    externalResults.value = [];
    currentPage.value = 1;
};
// 筛选方法
const handleFilterChange = () => {
    if (searchQuery.value) {
        debouncedSearch();
    }
};
const resetFilters = () => {
    filters.value = {};
    if (searchQuery.value) {
        debouncedSearch();
    }
};
// 切换方法
const toggleAdvancedFilter = () => {
    showAdvancedFilter.value = !showAdvancedFilter.value;
    if (showAdvancedFilter.value) {
        showHistory.value = false;
    }
};
const toggleHistory = () => {
    showHistory.value = !showHistory.value;
    if (showHistory.value) {
        showAdvancedFilter.value = false;
    }
};
// 搜索历史方法
const loadSearchHistory = () => {
    const history = localStorage.getItem('search-history');
    if (history) {
        searchHistory.value = JSON.parse(history);
    }
};
const saveSearchHistory = (query) => {
    if (!query.trim())
        return;
    const history = [...searchHistory.value];
    const index = history.indexOf(query);
    if (index > -1) {
        history.splice(index, 1);
    }
    history.unshift(query);
    searchHistory.value = history.slice(0, 10);
    localStorage.setItem('search-history', JSON.stringify(searchHistory.value));
};
const selectHistory = (query) => {
    searchQuery.value = query;
    showHistory.value = false;
    handleSearch(query);
};
const clearHistory = () => {
    searchHistory.value = [];
    localStorage.removeItem('search-history');
};
// 结果处理方法
const handleResultTypeChange = (key) => {
    activeResultType.value = key;
    currentPage.value = 1;
};
const handleItemClick = (item) => {
    // 根据类型跳转到不同的详情页
    switch (item.type) {
        case 'table':
            router.push(`/discovery/data-map/${encodeURIComponent(JSON.stringify(item))}`);
            break;
        case 'metric':
            router.push(`/discovery/metrics-map/${item.id}`);
            break;
        case 'external':
            router.push(`/discovery/external/${item.id}`);
            break;
    }
};
const toggleFavorite = (item) => {
    item.isFavorite = !item.isFavorite;
    Message.success(item.isFavorite ? '已添加到收藏' : '已取消收藏');
};
const handlePageChange = (page) => {
    currentPage.value = page;
};
const handlePageSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
};
// 工具方法
const getTypeColor = (type) => {
    switch (type) {
        case 'table':
            return 'blue';
        case 'metric':
            return 'green';
        case 'external':
            return 'orange';
        default:
            return 'gray';
    }
};
const getTypeLabel = (type) => {
    switch (type) {
        case 'table':
            return '数据表';
        case 'metric':
            return '指标';
        case 'external':
            return '外部数据';
        default:
            return '未知';
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input-search-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['history-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['result-type-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
/** @type {__VLS_StyleScopedClasses['search-page-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['results-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['results-content']} */ ;
/** @type {__VLS_StyleScopedClasses['search-page-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-page-container" },
});
if (__VLS_ctx.loading) {
    /** @type {[typeof LoadingState, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(LoadingState, new LoadingState({
        type: "skeleton",
        showSearch: (true),
        showTabs: (true),
        showGrid: (true),
        loadingText: "正在搜索数据资产...",
    }));
    const __VLS_1 = __VLS_0({
        type: "skeleton",
        showSearch: (true),
        showTabs: (true),
        showGrid: (true),
        loadingText: "正在搜索数据资产...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-header" },
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-input-area" },
    });
    const __VLS_27 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        ...{ 'onSearch': {} },
        ...{ 'onClear': {} },
        modelValue: (__VLS_ctx.searchQuery),
        placeholder: "请输入表名、描述或业务域进行搜索",
        searchButton: true,
        allowClear: true,
        loading: (__VLS_ctx.searchLoading),
        size: "large",
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onSearch': {} },
        ...{ 'onClear': {} },
        modelValue: (__VLS_ctx.searchQuery),
        placeholder: "请输入表名、描述或业务域进行搜索",
        searchButton: true,
        allowClear: true,
        loading: (__VLS_ctx.searchLoading),
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_31;
    let __VLS_32;
    let __VLS_33;
    const __VLS_34 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    const __VLS_35 = {
        onClear: (__VLS_ctx.handleClearSearch)
    };
    __VLS_30.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_30.slots;
        const __VLS_36 = {}.IconSearch;
        /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ style: {} },
        }));
        const __VLS_38 = __VLS_37({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    }
    var __VLS_30;
    if (__VLS_ctx.showAdvancedFilter) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "advanced-filter" },
        });
        const __VLS_40 = {}.ARow;
        /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            gutter: (16),
        }));
        const __VLS_42 = __VLS_41({
            gutter: (16),
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
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
        const __VLS_48 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.filters.type),
            placeholder: "数据类型",
            allowClear: true,
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.filters.type),
            placeholder: "数据类型",
            allowClear: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onChange: (__VLS_ctx.handleFilterChange)
        };
        __VLS_51.slots.default;
        const __VLS_56 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            value: "table",
        }));
        const __VLS_58 = __VLS_57({
            value: "table",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        var __VLS_59;
        const __VLS_60 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            value: "metric",
        }));
        const __VLS_62 = __VLS_61({
            value: "metric",
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        var __VLS_63;
        const __VLS_64 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            value: "external",
        }));
        const __VLS_66 = __VLS_65({
            value: "external",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        var __VLS_67;
        var __VLS_51;
        var __VLS_47;
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
        const __VLS_72 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.filters.domain),
            placeholder: "业务域",
            allowClear: true,
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.filters.domain),
            placeholder: "业务域",
            allowClear: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_76;
        let __VLS_77;
        let __VLS_78;
        const __VLS_79 = {
            onChange: (__VLS_ctx.handleFilterChange)
        };
        __VLS_75.slots.default;
        const __VLS_80 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            value: "用户域",
        }));
        const __VLS_82 = __VLS_81({
            value: "用户域",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_83.slots.default;
        var __VLS_83;
        const __VLS_84 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            value: "交易域",
        }));
        const __VLS_86 = __VLS_85({
            value: "交易域",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_87.slots.default;
        var __VLS_87;
        const __VLS_88 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            value: "产品域",
        }));
        const __VLS_90 = __VLS_89({
            value: "产品域",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        __VLS_91.slots.default;
        var __VLS_91;
        const __VLS_92 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            value: "风控域",
        }));
        const __VLS_94 = __VLS_93({
            value: "风控域",
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        __VLS_95.slots.default;
        var __VLS_95;
        var __VLS_75;
        var __VLS_71;
        const __VLS_96 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            span: (6),
        }));
        const __VLS_98 = __VLS_97({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        __VLS_99.slots.default;
        const __VLS_100 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.filters.updateFrequency),
            placeholder: "更新频率",
            allowClear: true,
        }));
        const __VLS_102 = __VLS_101({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.filters.updateFrequency),
            placeholder: "更新频率",
            allowClear: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_104;
        let __VLS_105;
        let __VLS_106;
        const __VLS_107 = {
            onChange: (__VLS_ctx.handleFilterChange)
        };
        __VLS_103.slots.default;
        const __VLS_108 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            value: "实时",
        }));
        const __VLS_110 = __VLS_109({
            value: "实时",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        __VLS_111.slots.default;
        var __VLS_111;
        const __VLS_112 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
            value: "日更新",
        }));
        const __VLS_114 = __VLS_113({
            value: "日更新",
        }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        __VLS_115.slots.default;
        var __VLS_115;
        const __VLS_116 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
            value: "周更新",
        }));
        const __VLS_118 = __VLS_117({
            value: "周更新",
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        __VLS_119.slots.default;
        var __VLS_119;
        const __VLS_120 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            value: "月更新",
        }));
        const __VLS_122 = __VLS_121({
            value: "月更新",
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        __VLS_123.slots.default;
        var __VLS_123;
        var __VLS_103;
        var __VLS_99;
        const __VLS_124 = {}.ACol;
        /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            span: (6),
        }));
        const __VLS_126 = __VLS_125({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_127.slots.default;
        const __VLS_128 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
            ...{ 'onClick': {} },
            type: "outline",
        }));
        const __VLS_130 = __VLS_129({
            ...{ 'onClick': {} },
            type: "outline",
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        let __VLS_132;
        let __VLS_133;
        let __VLS_134;
        const __VLS_135 = {
            onClick: (__VLS_ctx.resetFilters)
        };
        __VLS_131.slots.default;
        var __VLS_131;
        var __VLS_127;
        var __VLS_43;
    }
    if (__VLS_ctx.showHistory && __VLS_ctx.searchHistory.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "search-history" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "history-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        const __VLS_136 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_138 = __VLS_137({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        let __VLS_140;
        let __VLS_141;
        let __VLS_142;
        const __VLS_143 = {
            onClick: (__VLS_ctx.clearHistory)
        };
        __VLS_139.slots.default;
        const __VLS_144 = {}.IconDelete;
        /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
        const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
        var __VLS_139;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "history-list" },
        });
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.searchHistory.slice(0, 5)))) {
            const __VLS_148 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                ...{ 'onClick': {} },
                key: (index),
                ...{ class: "history-tag" },
            }));
            const __VLS_150 = __VLS_149({
                ...{ 'onClick': {} },
                key: (index),
                ...{ class: "history-tag" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_149));
            let __VLS_152;
            let __VLS_153;
            let __VLS_154;
            const __VLS_155 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.showHistory && __VLS_ctx.searchHistory.length > 0))
                        return;
                    __VLS_ctx.selectHistory(item);
                }
            };
            __VLS_151.slots.default;
            (item);
            var __VLS_151;
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "results-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "results-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "results-count" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.totalResults);
    if (__VLS_ctx.searchQuery) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "search-term" },
        });
        (__VLS_ctx.searchQuery);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-type-tabs" },
    });
    const __VLS_156 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        ...{ 'onChange': {} },
        activeKey: (__VLS_ctx.activeResultType),
    }));
    const __VLS_158 = __VLS_157({
        ...{ 'onChange': {} },
        activeKey: (__VLS_ctx.activeResultType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    let __VLS_160;
    let __VLS_161;
    let __VLS_162;
    const __VLS_163 = {
        onChange: (__VLS_ctx.handleResultTypeChange)
    };
    __VLS_159.slots.default;
    const __VLS_164 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        key: "all",
        title: "全部",
    }));
    const __VLS_166 = __VLS_165({
        key: "all",
        title: "全部",
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_167.slots;
        const __VLS_168 = {}.ABadge;
        /** @type {[typeof __VLS_components.ABadge, typeof __VLS_components.aBadge, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
            count: (__VLS_ctx.allResults.length),
            maxCount: (99),
        }));
        const __VLS_170 = __VLS_169({
            count: (__VLS_ctx.allResults.length),
            maxCount: (99),
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    }
    var __VLS_167;
    const __VLS_172 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        key: "table",
        title: "数据表",
    }));
    const __VLS_174 = __VLS_173({
        key: "table",
        title: "数据表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_175.slots;
        const __VLS_176 = {}.ABadge;
        /** @type {[typeof __VLS_components.ABadge, typeof __VLS_components.aBadge, ]} */ ;
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
            count: (__VLS_ctx.tableResults.length),
            maxCount: (99),
        }));
        const __VLS_178 = __VLS_177({
            count: (__VLS_ctx.tableResults.length),
            maxCount: (99),
        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    }
    var __VLS_175;
    const __VLS_180 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        key: "metric",
        title: "指标",
    }));
    const __VLS_182 = __VLS_181({
        key: "metric",
        title: "指标",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_183.slots;
        const __VLS_184 = {}.ABadge;
        /** @type {[typeof __VLS_components.ABadge, typeof __VLS_components.aBadge, ]} */ ;
        // @ts-ignore
        const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
            count: (__VLS_ctx.metricResults.length),
            maxCount: (99),
        }));
        const __VLS_186 = __VLS_185({
            count: (__VLS_ctx.metricResults.length),
            maxCount: (99),
        }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    }
    var __VLS_183;
    const __VLS_188 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        key: "external",
        title: "外部数据",
    }));
    const __VLS_190 = __VLS_189({
        key: "external",
        title: "外部数据",
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    __VLS_191.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_191.slots;
        const __VLS_192 = {}.ABadge;
        /** @type {[typeof __VLS_components.ABadge, typeof __VLS_components.aBadge, ]} */ ;
        // @ts-ignore
        const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
            count: (__VLS_ctx.externalResults.length),
            maxCount: (99),
        }));
        const __VLS_194 = __VLS_193({
            count: (__VLS_ctx.externalResults.length),
            maxCount: (99),
        }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    }
    var __VLS_191;
    var __VLS_159;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "results-content" },
    });
    if (__VLS_ctx.currentResults.length === 0 && !__VLS_ctx.searchLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-results" },
        });
        const __VLS_196 = {}.AEmpty;
        /** @type {[typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, typeof __VLS_components.AEmpty, typeof __VLS_components.aEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
            description: "暂无搜索结果",
        }));
        const __VLS_198 = __VLS_197({
            description: "暂无搜索结果",
        }, ...__VLS_functionalComponentArgsRest(__VLS_197));
        __VLS_199.slots.default;
        {
            const { image: __VLS_thisSlot } = __VLS_199.slots;
            const __VLS_200 = {}.IconSearch;
            /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
            // @ts-ignore
            const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
                ...{ style: {} },
            }));
            const __VLS_202 = __VLS_201({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_201));
        }
        var __VLS_199;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "results-grid" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.currentResults))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.currentResults.length === 0 && !__VLS_ctx.searchLoading))
                            return;
                        __VLS_ctx.handleItemClick(item);
                    } },
                key: (item.id),
                ...{ class: "result-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-type" },
            });
            const __VLS_204 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
            // @ts-ignore
            const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
                color: (__VLS_ctx.getTypeColor(item.type)),
            }));
            const __VLS_206 = __VLS_205({
                color: (__VLS_ctx.getTypeColor(item.type)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_205));
            __VLS_207.slots.default;
            (__VLS_ctx.getTypeLabel(item.type));
            var __VLS_207;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-actions" },
            });
            const __VLS_208 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }));
            const __VLS_210 = __VLS_209({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_209));
            let __VLS_212;
            let __VLS_213;
            let __VLS_214;
            const __VLS_215 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.currentResults.length === 0 && !__VLS_ctx.searchLoading))
                        return;
                    __VLS_ctx.toggleFavorite(item);
                }
            };
            __VLS_211.slots.default;
            const __VLS_216 = {}.IconHeart;
            /** @type {[typeof __VLS_components.IconHeart, typeof __VLS_components.iconHeart, ]} */ ;
            // @ts-ignore
            const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
                ...{ style: ({ color: item.isFavorite ? '#f53f3f' : '#86909c' }) },
            }));
            const __VLS_218 = __VLS_217({
                ...{ style: ({ color: item.isFavorite ? '#f53f3f' : '#86909c' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_217));
            var __VLS_211;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ class: "item-title" },
            });
            (item.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "item-description" },
            });
            (item.description);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-meta" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "meta-item" },
            });
            const __VLS_220 = {}.IconUser;
            /** @type {[typeof __VLS_components.IconUser, typeof __VLS_components.iconUser, ]} */ ;
            // @ts-ignore
            const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({}));
            const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
            (item.owner);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "meta-item" },
            });
            const __VLS_224 = {}.IconClockCircle;
            /** @type {[typeof __VLS_components.IconClockCircle, typeof __VLS_components.iconClockCircle, ]} */ ;
            // @ts-ignore
            const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({}));
            const __VLS_226 = __VLS_225({}, ...__VLS_functionalComponentArgsRest(__VLS_225));
            (item.updateTime);
            if (item.domain) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "meta-item" },
                });
                const __VLS_228 = {}.IconApps;
                /** @type {[typeof __VLS_components.IconApps, typeof __VLS_components.iconApps, ]} */ ;
                // @ts-ignore
                const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({}));
                const __VLS_230 = __VLS_229({}, ...__VLS_functionalComponentArgsRest(__VLS_229));
                (item.domain);
            }
        }
    }
    if (__VLS_ctx.currentResults.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pagination-wrapper" },
        });
        const __VLS_232 = {}.APagination;
        /** @type {[typeof __VLS_components.APagination, typeof __VLS_components.aPagination, ]} */ ;
        // @ts-ignore
        const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
            ...{ 'onChange': {} },
            ...{ 'onPageSizeChange': {} },
            current: (__VLS_ctx.currentPage),
            total: (__VLS_ctx.totalResults),
            pageSize: (__VLS_ctx.pageSize),
            showTotal: true,
            showJumper: true,
            showPageSize: true,
        }));
        const __VLS_234 = __VLS_233({
            ...{ 'onChange': {} },
            ...{ 'onPageSizeChange': {} },
            current: (__VLS_ctx.currentPage),
            total: (__VLS_ctx.totalResults),
            pageSize: (__VLS_ctx.pageSize),
            showTotal: true,
            showJumper: true,
            showPageSize: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_233));
        let __VLS_236;
        let __VLS_237;
        let __VLS_238;
        const __VLS_239 = {
            onChange: (__VLS_ctx.handlePageChange)
        };
        const __VLS_240 = {
            onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
        };
        var __VLS_235;
    }
}
/** @type {__VLS_StyleScopedClasses['search-page-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['search-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['advanced-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['search-history']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-list']} */ ;
/** @type {__VLS_StyleScopedClasses['history-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['results-section']} */ ;
/** @type {__VLS_StyleScopedClasses['results-header']} */ ;
/** @type {__VLS_StyleScopedClasses['results-count']} */ ;
/** @type {__VLS_StyleScopedClasses['search-term']} */ ;
/** @type {__VLS_StyleScopedClasses['result-type-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['results-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-results']} */ ;
/** @type {__VLS_StyleScopedClasses['results-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-type']} */ ;
/** @type {__VLS_StyleScopedClasses['item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['item-content']} */ ;
/** @type {__VLS_StyleScopedClasses['item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['item-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            IconFilter: IconFilter,
            IconHistory: IconHistory,
            IconDelete: IconDelete,
            IconHeart: IconHeart,
            IconUser: IconUser,
            IconClockCircle: IconClockCircle,
            IconApps: IconApps,
            LoadingState: LoadingState,
            loading: loading,
            searchLoading: searchLoading,
            searchQuery: searchQuery,
            showAdvancedFilter: showAdvancedFilter,
            showHistory: showHistory,
            activeResultType: activeResultType,
            currentPage: currentPage,
            pageSize: pageSize,
            searchHistory: searchHistory,
            filters: filters,
            allResults: allResults,
            tableResults: tableResults,
            metricResults: metricResults,
            externalResults: externalResults,
            currentResults: currentResults,
            totalResults: totalResults,
            handleSearch: handleSearch,
            handleClearSearch: handleClearSearch,
            handleFilterChange: handleFilterChange,
            resetFilters: resetFilters,
            toggleAdvancedFilter: toggleAdvancedFilter,
            toggleHistory: toggleHistory,
            selectHistory: selectHistory,
            clearHistory: clearHistory,
            handleResultTypeChange: handleResultTypeChange,
            handleItemClick: handleItemClick,
            toggleFavorite: toggleFavorite,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
            getTypeColor: getTypeColor,
            getTypeLabel: getTypeLabel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
