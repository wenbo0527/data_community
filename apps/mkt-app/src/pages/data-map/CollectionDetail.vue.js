import { ref, onMounted, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRoute, useRouter } from 'vue-router';
import { IconFile, IconUser } from '@arco-design/web-vue/es/icon';
import mockData from '@/mock/data-map';
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const collection = ref({
    id: '',
    name: '',
    description: '',
    tables: []
});
const currentPage = ref(1);
const pageSize = ref(9);
const paginatedTables = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return collection.value.tables.slice(start, end);
});
// 获取表集合数据
const fetchCollection = async () => {
    loading.value = true;
    try {
        const id = route.params.id;
        const found = mockData.collections.find(c => c.id === id);
        if (found) {
            collection.value = found;
        }
        else {
            Message.error('未找到该场景');
            router.back();
        }
    }
    catch (error) {
        Message.error('获取数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 显示表详情
const showDetail = (table) => {
    router.push({
        name: 'TableDetail',
        params: {
            tableName: table.name
        },
        state: {
            table: {
                ...table,
                theme: table.theme || ''
            }
        }
    }).catch(err => {
        console.error('路由跳转失败:', err);
        Message.error('无法打开表详情');
    });
};
onMounted(() => {
    fetchCollection();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table-card']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "collection-detail" },
});
const __VLS_0 = {}.ASpin;
/** @type {[typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    loading: (__VLS_ctx.loading),
    tip: "加载中...",
}));
const __VLS_2 = __VLS_1({
    loading: (__VLS_ctx.loading),
    tip: "加载中...",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.APageHeader;
/** @type {[typeof __VLS_components.APageHeader, typeof __VLS_components.aPageHeader, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onBack': {} },
    title: (__VLS_ctx.collection.name),
    subtitle: (__VLS_ctx.collection.description),
}));
const __VLS_6 = __VLS_5({
    ...{ 'onBack': {} },
    title: (__VLS_ctx.collection.name),
    subtitle: (__VLS_ctx.collection.description),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onBack: (() => __VLS_ctx.router.back())
};
let __VLS_7;
const __VLS_12 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    align: "center",
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    align: "center",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.IconUser;
/** @type {[typeof __VLS_components.IconUser, typeof __VLS_components.iconUser, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_20 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
(__VLS_ctx.collection.owner || '未指定');
let __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.collection.tables.length);
let __VLS_15;
const __VLS_24 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ 
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.APagination;
/** @type {[typeof __VLS_components.APagination, typeof __VLS_components.aPagination, ]} */ 
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    current: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.collection.tables.length),
    showTotal: true,
    ...{ style: {} },
}));
const __VLS_30 = __VLS_29({
    current: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.collection.tables.length),
    showTotal: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    gutter: ([16, 16]),
}));
const __VLS_34 = __VLS_33({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
for (const [table] of __VLS_getVForSourceType((__VLS_ctx.paginatedTables))) {
    const __VLS_36 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        key: (table.name),
        span: (8),
    }));
    const __VLS_38 = __VLS_37({
        key: (table.name),
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
        ...{ class: "table-card" },
        hoverable: true,
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
        ...{ class: "table-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showDetail(table);
        }
    };
    __VLS_43.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_43.slots;
        const __VLS_48 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            align: "center",
        }));
        const __VLS_50 = __VLS_49({
            align: "center",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        const __VLS_52 = {}.IconFile;
        /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ 
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "table-name" },
        });
        (table.name);
        var __VLS_51;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-meta" },
    });
    const __VLS_56 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    (table.type);
    var __VLS_59;
    const __VLS_60 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    (table.category);
    var __VLS_63;
    const __VLS_64 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
    const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    (table.domain);
    var __VLS_67;
    const __VLS_68 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    (table.owner);
    var __VLS_71;
    const __VLS_72 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ 
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ellipsis: ({ rows: 2 }),
        type: "secondary",
        ...{ class: "table-description" },
    }));
    const __VLS_74 = __VLS_73({
        ellipsis: ({ rows: 2 }),
        type: "secondary",
        ...{ class: "table-description" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    (table.description);
    var __VLS_75;
    var __VLS_43;
    var __VLS_39;
}
let __VLS_35;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['collection-detail']} */ 
/** @type {__VLS_StyleScopedClasses['table-card']} */ 
/** @type {__VLS_StyleScopedClasses['table-name']} */ 
/** @type {__VLS_StyleScopedClasses['table-info']} */ 
/** @type {__VLS_StyleScopedClasses['table-meta']} */ 
/** @type {__VLS_StyleScopedClasses['table-description']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconFile: IconFile,
            IconUser: IconUser,
            router: router,
            loading: loading,
            collection: collection,
            currentPage: currentPage,
            pageSize: pageSize,
            paginatedTables: paginatedTables,
            showDetail: showDetail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
