/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconFile, IconStar, IconFolderAdd, IconCopy, IconLock } from '@arco-design/web-vue/es/icon';
import { tableMockData } from '@/mock/tableData';
const route = useRoute();
const router = useRouter();
const searchKeyword = ref('');
const businessDomain = ref('');
const themeDomain = ref('');
const loading = ref(false);
const tableData = ref([]);
const currentTable = ref(null);
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
});
// 初始化页面数据
onMounted(() => {
    const query = route.query.keyword;
    if (query) {
        searchKeyword.value = query;
        handleSearch();
    }
});
// 处理数据更新
const updateTableData = () => {
    return tableMockData.map(item => ({
        ...item,
        updateTime: new Date().toLocaleDateString()
    }));
};
// 检查关键字匹配
const checkKeywordMatch = (item) => {
    return searchKeyword.value === '' ||
        item.name.includes(searchKeyword.value) ||
        item.description.includes(searchKeyword.value);
};
// 检查业务域匹配
const checkDomainMatch = (item) => {
    return businessDomain.value === '' ||
        item.domain === businessDomain.value;
};
// 检查主题域匹配
const checkThemeMatch = (item) => {
    return themeDomain.value === '' ||
        item.theme === themeDomain.value;
};
// 搜索处理
const handleSearch = async () => {
    loading.value = true;
    try {
        // 使用共享mock数据
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 获取更新后的数据
        const updatedData = updateTableData();
        // 过滤数据
        tableData.value = updatedData.filter(item => checkKeywordMatch(item) &&
            checkDomainMatch(item) &&
            checkThemeMatch(item));
        // 更新分页总数
        pagination.value.total = tableData.value.length;
    }
    catch (error) {
        Message.error('搜索失败');
    }
    finally {
        loading.value = false;
    }
};
// 分页处理
const onPageChange = (current) => {
    pagination.value.current = current;
    handleSearch();
};
const onPageSizeChange = (pageSize) => {
    pagination.value.pageSize = pageSize;
    handleSearch();
};
// 构建表详情参数
const buildTableParams = (record, fullTableData) => {
    return {
        name: record.name,
        type: record.type || '',
        description: record.description || '',
        updateTime: record.updateTime || new Date().toLocaleDateString(),
        fields: fullTableData.fields || [],
        category: fullTableData.category || '',
        domain: fullTableData.domain || '',
        updateFrequency: fullTableData.updateFrequency || '',
        owner: fullTableData.owner || ''
    };
};
// 验证表记录
const validateTableRecord = (record) => {
    if (!record?.name) {
        throw new Error('表名不能为空');
    }
    const fullTableData = tableMockData.find(item => item.name === record.name);
    if (!fullTableData) {
        throw new Error('未找到表数据');
    }
    return fullTableData;
};
// 显示表详情
const showTableDetail = (record) => {
    try {
        const fullTableData = validateTableRecord(record);
        const tableParams = buildTableParams(record, fullTableData);
        router.push({
            name: 'TableDetail',
            params: {
                tableName: record.name
            },
            query: {
                table: JSON.stringify(tableParams)
            }
        });
    }
    catch (error) {
        Message.error(error.message);
        console.error('跳转表详情页失败:', error);
    }
};
// 申请权限
const requestPermission = async (record) => {
    try {
        // TODO: 调用权限申请API
        Message.success('权限申请已提交');
    }
    catch (error) {
        Message.error('权限申请失败');
    }
};
// 添加到收藏
const addToFavorite = async (record) => {
    try {
        // TODO: 调用收藏API
        Message.success('添加收藏成功');
    }
    catch (error) {
        Message.error('添加收藏失败');
    }
};
// 复制表名
const copyTableName = async (record) => {
    try {
        await navigator.clipboard.writeText(record.name);
        Message.success('复制成功');
    }
    catch (error) {
        Message.error('复制失败');
    }
};
// 添加到集合
const addToCollection = async (record) => {
    try {
        const { Modal, Select, Option } = await import('@arco-design/web-vue');
        const { h } = await import('vue');
        let selectedCollection = ref('');
        Modal.confirm({
            title: '添加到常用表集合',
            content: () => {
                return h('div', [
                    h(Select, {
                        placeholder: '请选择集合',
                        style: { width: '100%' },
                        allowClear: true,
                        'onUpdate:modelValue': (value) => {
                            selectedCollection.value = value;
                        }
                    }, () => [
                        h(Option, { value: 'collection1' }, () => '常用表集合1'),
                        h(Option, { value: 'collection2' }, () => '常用表集合2'),
                        h(Option, { value: 'collection3' }, () => '常用表集合3')
                    ])
                ]);
            },
            onOk: async () => {
                if (!selectedCollection.value) {
                    Message.warning('请选择集合');
                    return false;
                }
                try {
                    // TODO: 调用添加到集合API
                    Message.success(`已添加到${selectedCollection.value}`);
                    return true;
                }
                catch (error) {
                    Message.error('添加到集合失败');
                    return false;
                }
            },
            onCancel: () => {
                Message.info('已取消');
            }
        });
    }
    catch (error) {
        Message.error('弹窗打开失败');
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-list-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
const __VLS_0 = {}.ABreadcrumb;
/** @type {[typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, typeof __VLS_components.ABreadcrumb, typeof __VLS_components.aBreadcrumb, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
const __VLS_8 = {}.ABreadcrumbItem;
/** @type {[typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, typeof __VLS_components.ABreadcrumbItem, typeof __VLS_components.aBreadcrumbItem, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
const __VLS_12 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "search-info" },
    align: "center",
    gutter: (16),
}));
const __VLS_18 = __VLS_17({
    ...{ class: "search-info" },
    align: "center",
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    span: (16),
}));
const __VLS_22 = __VLS_21({
    span: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索表名、字段名或描述",
    searchButton: true,
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索表名、字段名或描述",
    searchButton: true,
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onSearch: (__VLS_ctx.handleSearch)
};
var __VLS_27;
var __VLS_23;
const __VLS_32 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    span: (8),
}));
const __VLS_34 = __VLS_33({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.businessDomain),
    placeholder: "业务域",
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.businessDomain),
    placeholder: "业务域",
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    value: "domain1",
}));
const __VLS_46 = __VLS_45({
    value: "domain1",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
var __VLS_47;
const __VLS_48 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    value: "domain2",
}));
const __VLS_50 = __VLS_49({
    value: "domain2",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
var __VLS_51;
const __VLS_52 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    value: "domain3",
}));
const __VLS_54 = __VLS_53({
    value: "domain3",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
var __VLS_55;
const __VLS_56 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    value: "domain4",
}));
const __VLS_58 = __VLS_57({
    value: "domain4",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
var __VLS_59;
var __VLS_43;
const __VLS_60 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.themeDomain),
    placeholder: "主题域",
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.themeDomain),
    placeholder: "主题域",
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: "theme1",
}));
const __VLS_66 = __VLS_65({
    value: "theme1",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
var __VLS_67;
const __VLS_68 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    value: "theme2",
}));
const __VLS_70 = __VLS_69({
    value: "theme2",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
const __VLS_72 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "theme3",
}));
const __VLS_74 = __VLS_73({
    value: "theme3",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
var __VLS_75;
const __VLS_76 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "theme4",
}));
const __VLS_78 = __VLS_77({
    value: "theme4",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
var __VLS_63;
var __VLS_39;
var __VLS_35;
var __VLS_19;
const __VLS_80 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    gutter: (12),
}));
const __VLS_82 = __VLS_81({
    gutter: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
for (const [record] of __VLS_getVForSourceType((__VLS_ctx.tableData))) {
    const __VLS_84 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        key: (record.name),
        span: (8),
        ...{ style: {} },
    }));
    const __VLS_86 = __VLS_85({
        key: (record.name),
        span: (8),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    const __VLS_88 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        hoverable: true,
        ...{ class: "table-card" },
        bordered: (false),
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        hoverable: true,
        ...{ class: "table-card" },
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showTableDetail(record);
        }
    };
    __VLS_91.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    const __VLS_96 = {}.IconFile;
    /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ style: {} },
    }));
    const __VLS_98 = __VLS_97({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "table-name" },
    });
    (record.name);
    if (record.type) {
        const __VLS_100 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            color: (record.type === '维度表' ? 'arcoblue' : 'orangered'),
            size: "small",
            ...{ style: {} },
        }));
        const __VLS_102 = __VLS_101({
            color: (record.type === '维度表' ? 'arcoblue' : 'orangered'),
            size: "small",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        __VLS_103.slots.default;
        (record.type);
        var __VLS_103;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "description" },
        title: (record.description),
    });
    (record.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "update-time" },
    });
    (record.updateTime);
    {
        const { actions: __VLS_thisSlot } = __VLS_91.slots;
        const __VLS_104 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
        const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
        __VLS_107.slots.default;
        const __VLS_108 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            content: "收藏",
            position: "bottom",
        }));
        const __VLS_110 = __VLS_109({
            content: "收藏",
            position: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        __VLS_111.slots.default;
        const __VLS_112 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
            ...{ 'onClick': {} },
            type: "text",
        }));
        const __VLS_114 = __VLS_113({
            ...{ 'onClick': {} },
            type: "text",
        }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        let __VLS_116;
        let __VLS_117;
        let __VLS_118;
        const __VLS_119 = {
            onClick: (...[$event]) => {
                __VLS_ctx.addToFavorite(record);
            }
        };
        __VLS_115.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_115.slots;
            const __VLS_120 = {}.IconStar;
            /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ ;
            // @ts-ignore
            const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
            const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
        }
        var __VLS_115;
        var __VLS_111;
        const __VLS_124 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            content: "申请权限",
            position: "bottom",
        }));
        const __VLS_126 = __VLS_125({
            content: "申请权限",
            position: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_127.slots.default;
        const __VLS_128 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
            ...{ 'onClick': {} },
            type: "text",
        }));
        const __VLS_130 = __VLS_129({
            ...{ 'onClick': {} },
            type: "text",
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        let __VLS_132;
        let __VLS_133;
        let __VLS_134;
        const __VLS_135 = {
            onClick: (...[$event]) => {
                __VLS_ctx.requestPermission(record);
            }
        };
        __VLS_131.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_131.slots;
            const __VLS_136 = {}.IconLock;
            /** @type {[typeof __VLS_components.IconLock, typeof __VLS_components.iconLock, ]} */ ;
            // @ts-ignore
            const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
            const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
        }
        var __VLS_131;
        var __VLS_127;
        const __VLS_140 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            content: "复制表名",
            position: "bottom",
        }));
        const __VLS_142 = __VLS_141({
            content: "复制表名",
            position: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_143.slots.default;
        const __VLS_144 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
            ...{ 'onClick': {} },
            type: "text",
        }));
        const __VLS_146 = __VLS_145({
            ...{ 'onClick': {} },
            type: "text",
        }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        let __VLS_148;
        let __VLS_149;
        let __VLS_150;
        const __VLS_151 = {
            onClick: (...[$event]) => {
                __VLS_ctx.copyTableName(record);
            }
        };
        __VLS_147.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_147.slots;
            const __VLS_152 = {}.IconCopy;
            /** @type {[typeof __VLS_components.IconCopy, typeof __VLS_components.iconCopy, ]} */ ;
            // @ts-ignore
            const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({}));
            const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
        }
        var __VLS_147;
        var __VLS_143;
        const __VLS_156 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
            content: "添加到集合",
            position: "bottom",
        }));
        const __VLS_158 = __VLS_157({
            content: "添加到集合",
            position: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        __VLS_159.slots.default;
        const __VLS_160 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
            ...{ 'onClick': {} },
            type: "text",
        }));
        const __VLS_162 = __VLS_161({
            ...{ 'onClick': {} },
            type: "text",
        }, ...__VLS_functionalComponentArgsRest(__VLS_161));
        let __VLS_164;
        let __VLS_165;
        let __VLS_166;
        const __VLS_167 = {
            onClick: (...[$event]) => {
                __VLS_ctx.addToCollection(record);
            }
        };
        __VLS_163.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_163.slots;
            const __VLS_168 = {}.IconFolderAdd;
            /** @type {[typeof __VLS_components.IconFolderAdd, typeof __VLS_components.iconFolderAdd, ]} */ ;
            // @ts-ignore
            const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({}));
            const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
        }
        var __VLS_163;
        var __VLS_159;
        var __VLS_107;
    }
    var __VLS_91;
    var __VLS_87;
}
var __VLS_83;
var __VLS_15;
/** @type {__VLS_StyleScopedClasses['table-list-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-info']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-name']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
/** @type {__VLS_StyleScopedClasses['update-time']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconFile: IconFile,
            IconStar: IconStar,
            IconFolderAdd: IconFolderAdd,
            IconCopy: IconCopy,
            IconLock: IconLock,
            searchKeyword: searchKeyword,
            businessDomain: businessDomain,
            themeDomain: themeDomain,
            tableData: tableData,
            handleSearch: handleSearch,
            showTableDetail: showTableDetail,
            requestPermission: requestPermission,
            addToFavorite: addToFavorite,
            copyTableName: copyTableName,
            addToCollection: addToCollection,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
