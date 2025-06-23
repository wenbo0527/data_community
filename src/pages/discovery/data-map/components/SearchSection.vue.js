/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import { IconSearch, IconDelete } from '@arco-design/web-vue/es/icon';
const props = defineProps();
const emit = defineEmits();
const router = useRouter();
const searchValue = ref(props.modelValue || '');
const showSuggestions = ref(false);
const suggestions = ref([]);
const searchHistory = ref([]);
const filters = ref({});
// 防抖搜索
const debouncedSearch = useDebounceFn((value) => {
    if (value.length >= 2) {
        generateSuggestions(value);
    }
    else {
        suggestions.value = [];
        showSuggestions.value = false;
    }
}, 300);
// 生成搜索建议
const generateSuggestions = (query) => {
    const mockSuggestions = [
        '用户基础信息表',
        '交易流水表',
        '产品信息表',
        '风险评估表',
        '客户画像表'
    ];
    suggestions.value = mockSuggestions.filter(item => item.toLowerCase().includes(query.toLowerCase()));
    showSuggestions.value = suggestions.value.length > 0;
};
// 加载搜索历史
const loadSearchHistory = () => {
    const history = localStorage.getItem('search-history');
    if (history) {
        searchHistory.value = JSON.parse(history);
    }
};
// 保存搜索历史
const saveSearchHistory = (query) => {
    if (!query.trim())
        return;
    const history = [...searchHistory.value];
    const index = history.indexOf(query);
    if (index > -1) {
        history.splice(index, 1);
    }
    history.unshift(query);
    searchHistory.value = history.slice(0, 10); // 最多保存10条
    localStorage.setItem('search-history', JSON.stringify(searchHistory.value));
};
const handleInput = (value) => {
    searchValue.value = value;
    debouncedSearch(value);
};
const handleSearch = (value = searchValue.value) => {
    if (!value.trim())
        return;
    saveSearchHistory(value);
    showSuggestions.value = false;
    // 跳转到聚合搜索页面
    router.push({
        path: '/discovery/search',
        query: { q: value }
    });
    emit('search', value, filters.value);
};
const handleClear = () => {
    searchValue.value = '';
    suggestions.value = [];
    showSuggestions.value = false;
    emit('clear');
};
const selectSuggestion = (suggestion) => {
    searchValue.value = suggestion;
    handleSearch(suggestion);
};
const selectHistory = (item) => {
    searchValue.value = item;
    handleSearch(item);
};
const clearHistory = () => {
    searchHistory.value = [];
    localStorage.removeItem('search-history');
};
const handleFilterChange = () => {
    emit('filter-change', filters.value);
};
const resetFilters = () => {
    filters.value = {};
    emit('filter-change', filters.value);
};
// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
    searchValue.value = newValue || '';
});
// 点击外部关闭建议
const handleClickOutside = (event) => {
    const target = event.target;
    if (!target.closest('.search-section')) {
        showSuggestions.value = false;
    }
};
onMounted(() => {
    loadSearchHistory();
    document.addEventListener('click', handleClickOutside);
});
// 组件卸载时移除事件监听
const onUnmounted = () => {
    document.removeEventListener('click', handleClickOutside);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input-search-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-item']} */ ;
/** @type {__VLS_StyleScopedClasses['history-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['search-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['search-history']} */ ;
/** @type {__VLS_StyleScopedClasses['advanced-filter']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "search-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "search-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onSearch': {} },
    ...{ 'onClear': {} },
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchValue),
    placeholder: (__VLS_ctx.placeholder),
    searchButton: true,
    allowClear: true,
    loading: (__VLS_ctx.loading),
}));
const __VLS_6 = __VLS_5({
    ...{ 'onSearch': {} },
    ...{ 'onClear': {} },
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchValue),
    placeholder: (__VLS_ctx.placeholder),
    searchButton: true,
    allowClear: true,
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onSearch: (__VLS_ctx.handleSearch)
};
const __VLS_12 = {
    onClear: (__VLS_ctx.handleClear)
};
const __VLS_13 = {
    onInput: (__VLS_ctx.handleInput)
};
__VLS_7.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_14 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
        ...{ style: {} },
    }));
    const __VLS_16 = __VLS_15({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
}
var __VLS_7;
if (__VLS_ctx.showSuggestions && __VLS_ctx.suggestions.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-suggestions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suggestions-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suggestions-list" },
    });
    for (const [suggestion, index] of __VLS_getVForSourceType((__VLS_ctx.suggestions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showSuggestions && __VLS_ctx.suggestions.length > 0))
                        return;
                    __VLS_ctx.selectSuggestion(suggestion);
                } },
            key: (index),
            ...{ class: "suggestion-item" },
        });
        const __VLS_18 = {}.IconSearch;
        /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
            ...{ class: "suggestion-icon" },
        }));
        const __VLS_20 = __VLS_19({
            ...{ class: "suggestion-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "suggestion-text" },
        });
        (suggestion);
    }
}
if (props.showHistory && __VLS_ctx.searchHistory.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-history" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_22 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onClick': {} },
        type: "text",
        size: "mini",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_26;
    let __VLS_27;
    let __VLS_28;
    const __VLS_29 = {
        onClick: (__VLS_ctx.clearHistory)
    };
    __VLS_25.slots.default;
    const __VLS_30 = {}.IconDelete;
    /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({}));
    const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
    var __VLS_25;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.searchHistory.slice(0, 5)))) {
        const __VLS_34 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
            ...{ 'onClick': {} },
            key: (index),
            ...{ class: "history-tag" },
        }));
        const __VLS_36 = __VLS_35({
            ...{ 'onClick': {} },
            key: (index),
            ...{ class: "history-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        let __VLS_38;
        let __VLS_39;
        let __VLS_40;
        const __VLS_41 = {
            onClick: (...[$event]) => {
                if (!(props.showHistory && __VLS_ctx.searchHistory.length > 0))
                    return;
                __VLS_ctx.selectHistory(item);
            }
        };
        __VLS_37.slots.default;
        (item);
        var __VLS_37;
    }
}
if (props.showAdvancedFilter) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advanced-filter" },
    });
    const __VLS_42 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
        gutter: (16),
    }));
    const __VLS_44 = __VLS_43({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    __VLS_45.slots.default;
    const __VLS_46 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
        span: (6),
    }));
    const __VLS_48 = __VLS_47({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_49.slots.default;
    const __VLS_50 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.filters.type),
        placeholder: "表类型",
        allowClear: true,
    }));
    const __VLS_52 = __VLS_51({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.filters.type),
        placeholder: "表类型",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    let __VLS_54;
    let __VLS_55;
    let __VLS_56;
    const __VLS_57 = {
        onChange: (__VLS_ctx.handleFilterChange)
    };
    __VLS_53.slots.default;
    const __VLS_58 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        value: "维度表",
    }));
    const __VLS_60 = __VLS_59({
        value: "维度表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_61.slots.default;
    var __VLS_61;
    const __VLS_62 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        value: "事实表",
    }));
    const __VLS_64 = __VLS_63({
        value: "事实表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_65.slots.default;
    var __VLS_65;
    const __VLS_66 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        value: "明细表",
    }));
    const __VLS_68 = __VLS_67({
        value: "明细表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_69.slots.default;
    var __VLS_69;
    const __VLS_70 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        value: "汇总表",
    }));
    const __VLS_72 = __VLS_71({
        value: "汇总表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_73.slots.default;
    var __VLS_73;
    var __VLS_53;
    var __VLS_49;
    const __VLS_74 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        span: (6),
    }));
    const __VLS_76 = __VLS_75({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    __VLS_77.slots.default;
    const __VLS_78 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.filters.domain),
        placeholder: "业务域",
        allowClear: true,
    }));
    const __VLS_80 = __VLS_79({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.filters.domain),
        placeholder: "业务域",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    let __VLS_82;
    let __VLS_83;
    let __VLS_84;
    const __VLS_85 = {
        onChange: (__VLS_ctx.handleFilterChange)
    };
    __VLS_81.slots.default;
    const __VLS_86 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        value: "用户域",
    }));
    const __VLS_88 = __VLS_87({
        value: "用户域",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_89.slots.default;
    var __VLS_89;
    const __VLS_90 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        value: "交易域",
    }));
    const __VLS_92 = __VLS_91({
        value: "交易域",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_93.slots.default;
    var __VLS_93;
    const __VLS_94 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        value: "产品域",
    }));
    const __VLS_96 = __VLS_95({
        value: "产品域",
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_97.slots.default;
    var __VLS_97;
    const __VLS_98 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
        value: "风控域",
    }));
    const __VLS_100 = __VLS_99({
        value: "风控域",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    __VLS_101.slots.default;
    var __VLS_101;
    var __VLS_81;
    var __VLS_77;
    const __VLS_102 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
        span: (6),
    }));
    const __VLS_104 = __VLS_103({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    __VLS_105.slots.default;
    const __VLS_106 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.filters.updateFrequency),
        placeholder: "更新频率",
        allowClear: true,
    }));
    const __VLS_108 = __VLS_107({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.filters.updateFrequency),
        placeholder: "更新频率",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    let __VLS_110;
    let __VLS_111;
    let __VLS_112;
    const __VLS_113 = {
        onChange: (__VLS_ctx.handleFilterChange)
    };
    __VLS_109.slots.default;
    const __VLS_114 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
        value: "实时",
    }));
    const __VLS_116 = __VLS_115({
        value: "实时",
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    __VLS_117.slots.default;
    var __VLS_117;
    const __VLS_118 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
        value: "日更新",
    }));
    const __VLS_120 = __VLS_119({
        value: "日更新",
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    __VLS_121.slots.default;
    var __VLS_121;
    const __VLS_122 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
        value: "周更新",
    }));
    const __VLS_124 = __VLS_123({
        value: "周更新",
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    __VLS_125.slots.default;
    var __VLS_125;
    const __VLS_126 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
        value: "月更新",
    }));
    const __VLS_128 = __VLS_127({
        value: "月更新",
    }, ...__VLS_functionalComponentArgsRest(__VLS_127));
    __VLS_129.slots.default;
    var __VLS_129;
    var __VLS_109;
    var __VLS_105;
    const __VLS_130 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
        span: (6),
    }));
    const __VLS_132 = __VLS_131({
        span: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    __VLS_133.slots.default;
    const __VLS_134 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
        ...{ 'onClick': {} },
        type: "outline",
    }));
    const __VLS_136 = __VLS_135({
        ...{ 'onClick': {} },
        type: "outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    let __VLS_138;
    let __VLS_139;
    let __VLS_140;
    const __VLS_141 = {
        onClick: (__VLS_ctx.resetFilters)
    };
    __VLS_137.slots.default;
    var __VLS_137;
    var __VLS_133;
    var __VLS_45;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestions-header']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestions-list']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-item']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-text']} */ ;
/** @type {__VLS_StyleScopedClasses['search-history']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-list']} */ ;
/** @type {__VLS_StyleScopedClasses['history-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['advanced-filter']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            IconDelete: IconDelete,
            searchValue: searchValue,
            showSuggestions: showSuggestions,
            suggestions: suggestions,
            searchHistory: searchHistory,
            filters: filters,
            handleInput: handleInput,
            handleSearch: handleSearch,
            handleClear: handleClear,
            selectSuggestion: selectSuggestion,
            selectHistory: selectHistory,
            clearHistory: clearHistory,
            handleFilterChange: handleFilterChange,
            resetFilters: resetFilters,
        };
    },
    emits: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
