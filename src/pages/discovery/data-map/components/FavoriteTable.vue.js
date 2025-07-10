/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch } from 'vue';
import { IconStar, IconStarFill, IconPlus, IconFile } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
const props = defineProps();
const activeCollection = ref(null);
const emit = defineEmits();
const createCollectionVisible = ref(false);
const searchKeyword = ref('');
const tableLoading = ref(false);
const selectedKeys = ref([]);
// 监听selectedKeys变化，同步更新newCollection.tables
watch(selectedKeys, (newKeys) => {
    if (!newKeys || !mockTransferData.value)
        return;
    console.log('当前选中的key值:', newKeys);
    newCollection.value.tables = mockTransferData.value
        .filter(item => item?.key && newKeys.includes(item.key))
        .map(item => {
        console.log('Transfer item 数据:', JSON.stringify(item, null, 2));
        console.log('当前渲染的表项数据:', item);
        return {
            name: item?.name || '',
            type: item?.type || '',
            category: '',
            domain: '',
            updateFrequency: '',
            owner: '',
            description: item?.description || '',
            fields: []
        };
    });
    console.log('转换后的表数据:', newCollection.value.tables);
});
const tableColumns = [
    {
        title: '表名',
        dataIndex: 'label',
        width: 180
    },
    {
        title: '类型',
        dataIndex: 'type',
        width: 100
    },
    {
        title: '描述',
        dataIndex: 'description'
    }
];
const rowSelection = {
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false
};
const filteredTables = computed(() => {
    if (!searchKeyword.value)
        return mockTransferData.value;
    const filtered = mockTransferData.value.filter(item => {
        if (!item)
            return false;
        return ((item.label && item.label.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
            (item.name && item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())));
    });
    return filtered.length > 0 ? filtered : [{
            key: 'no-data',
            label: '暂无数据',
            description: '未找到匹配的表，请尝试其他搜索关键词',
            type: 'empty'
        }];
});
const mockTransferData = ref([
    {
        key: 'table1',
        label: '用户基础信息表(核心)',
        name: '用户基础信息表(核心)',
        type: '维度表',
        description: '存储用户的基本信息，包括ID、姓名、年龄等'
    },
    {
        key: 'table2',
        label: '交易流水表(高频)',
        name: '交易流水表(高频)',
        type: '事实表',
        description: '记录用户的所有交易信息，包括交易时间、金额等'
    },
    {
        key: 'table3',
        label: '产品信息表(基础)',
        name: '产品信息表(基础)',
        type: '维度表',
        description: '存储所有产品的基本信息，包括产品ID、名称、价格等'
    },
    {
        key: 'table4',
        label: '风险评估表(重要)',
        name: '风险评估表(重要)',
        type: '明细表',
        description: '存储用户的风险评估信息，包括信用分数、风险等级等'
    }
]);
const newCollection = ref({
    name: '',
    description: '',
    tables: []
});
const filterMethod = (item, query) => {
    if (!item || !query)
        return false;
    return ((item.name?.toLowerCase()?.includes(query.toLowerCase()) ||
        item.description?.toLowerCase()?.includes(query.toLowerCase()) ||
        item.type?.toLowerCase()?.includes(query.toLowerCase())) ?? false);
};
const toggleTableSelection = (table) => {
    const index = newCollection.value.tables.findIndex(t => t.name === table.name);
    if (index >= 0) {
        newCollection.value.tables.splice(index, 1);
    }
    else {
        newCollection.value.tables.push(table);
    }
};
const removeSelectedTable = (table) => {
    const index = newCollection.value.tables.findIndex(t => t.name === table.name);
    if (index >= 0) {
        newCollection.value.tables.splice(index, 1);
        // 同步更新selectedKeys
        const item = mockTransferData.value.find(item => item.name === table.name);
        if (item) {
            selectedKeys.value = selectedKeys.value.filter(key => key !== item.key);
        }
    }
};
const showCreateCollectionDialog = () => {
    createCollectionVisible.value = true;
    searchKeyword.value = '';
    newCollection.value = {
        name: '',
        description: '',
        tables: []
    };
};
const handleCreateCollection = () => {
    if (!newCollection.value.name) {
        Message.error('请输入集合名称');
        return;
    }
    emit('create-collection', { ...newCollection.value });
    createCollectionVisible.value = false;
    newCollection.value = {
        name: '',
        description: '',
        tables: []
    };
};
const getTypeColor = (type) => {
    const colors = {
        '维度表': 'blue',
        '事实表': 'green',
        '明细表': 'orange',
        '汇总表': 'purple'
    };
    return type ? colors[type] || 'gray' : 'gray';
};
const removeFavorite = (table) => {
    emit('remove', table);
};
const showCollectionDetail = (collection) => {
    console.log('点击的表集合数据:', JSON.stringify(collection, null, 2));
    emit('show-collection-detail', collection);
};
const handleTransferItemClick = (item) => {
    // 输出传入的item参数
    console.log('handleTransferItemClick called with item:', item);
    // 确保从mockTransferData中获取完整数据
    const fullItem = mockTransferData.value.find(data => data?.key === item?.key) || item;
    console.log('完整的表项数据:', fullItem);
    // 确保有有效的key值
    if (!fullItem?.key) {
        console.warn('点击的表项缺少key值:', JSON.stringify(fullItem));
        return;
    }
    const tableName = fullItem?.name || '未知表';
    const tableType = fullItem?.type || '未知类型';
    console.log(`Transfer组件点击事件触发，表名: ${tableName}，类型: ${tableType}`);
    // 更新选中状态
    const isSelected = selectedKeys.value.includes(fullItem.key);
    selectedKeys.value = isSelected
        ? selectedKeys.value.filter(key => key !== fullItem.key)
        : [...selectedKeys.value, fullItem.key];
    console.log('更新后的selectedKeys:', selectedKeys.value);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['favorite-tables']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-tables']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-card']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-card']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-card']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['available-table']} */ ;
/** @type {__VLS_StyleScopedClasses['available-table']} */ ;
/** @type {__VLS_StyleScopedClasses['transfer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "favorite-tables" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "favorite-tables" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_4 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.IconStar;
    /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
}
{
    const { extra: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_12 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.showCreateCollectionDialog)
    };
    __VLS_15.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_15.slots;
        const __VLS_20 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    }
    var __VLS_15;
}
const __VLS_24 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    gutter: ([16, 16]),
}));
const __VLS_26 = __VLS_25({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
for (const [collection] of __VLS_getVForSourceType((__VLS_ctx.tableCollections))) {
    const __VLS_28 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (collection.id),
        span: (8),
    }));
    const __VLS_30 = __VLS_29({
        key: (collection.id),
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        ...{ class: "scene-card" },
        hoverable: true,
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        ...{ class: "scene-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showCollectionDetail(collection);
        }
    };
    __VLS_35.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_40 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            align: "center",
        }));
        const __VLS_42 = __VLS_41({
            align: "center",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        const __VLS_44 = {}.IconStarFill;
        /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            ...{ style: {} },
        }));
        const __VLS_46 = __VLS_45({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        const __VLS_48 = {}.ATypographyTitle;
        /** @type {[typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            heading: (6),
        }));
        const __VLS_50 = __VLS_49({
            heading: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        (collection.name);
        var __VLS_51;
        var __VLS_43;
    }
    const __VLS_52 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ellipsis: ({ rows: 2 }),
        type: "secondary",
        ...{ class: "scene-description" },
    }));
    const __VLS_54 = __VLS_53({
        ellipsis: ({ rows: 2 }),
        type: "secondary",
        ...{ class: "scene-description" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    (collection.description);
    var __VLS_55;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "scene-footer" },
    });
    const __VLS_56 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        align: "center",
        ...{ style: {} },
    }));
    const __VLS_58 = __VLS_57({
        align: "center",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    const __VLS_60 = {}.IconFile;
    /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_64 = {}.ATypographyText;
    /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        strong: true,
    }));
    const __VLS_66 = __VLS_65({
        strong: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    (collection.tables.length);
    var __VLS_67;
    var __VLS_59;
    for (const [table] of __VLS_getVForSourceType((collection.tables.slice(0, 3)))) {
        const __VLS_68 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            size: "small",
            key: (table.name),
        }));
        const __VLS_70 = __VLS_69({
            size: "small",
            key: (table.name),
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        (table.name);
        var __VLS_71;
    }
    if (collection.tables.length > 3) {
        const __VLS_72 = {}.ATypographyText;
        /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            type: "secondary",
        }));
        const __VLS_74 = __VLS_73({
            type: "secondary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        (collection.tables.length);
        var __VLS_75;
    }
    var __VLS_35;
    var __VLS_31;
}
var __VLS_27;
var __VLS_3;
const __VLS_76 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.createCollectionVisible),
    title: "创建表集合",
}));
const __VLS_78 = __VLS_77({
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.createCollectionVisible),
    title: "创建表集合",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onOk: (__VLS_ctx.handleCreateCollection)
};
__VLS_79.slots.default;
const __VLS_84 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    model: (__VLS_ctx.newCollection),
}));
const __VLS_86 = __VLS_85({
    model: (__VLS_ctx.newCollection),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    field: "name",
    label: "集合名称",
}));
const __VLS_90 = __VLS_89({
    field: "name",
    label: "集合名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.newCollection.name),
    placeholder: "请输入集合名称，如：贷前分析常用表",
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.newCollection.name),
    placeholder: "请输入集合名称，如：贷前分析常用表",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
var __VLS_91;
const __VLS_96 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    field: "description",
    label: "集合描述",
}));
const __VLS_98 = __VLS_97({
    field: "description",
    label: "集合描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.newCollection.description),
    placeholder: "请输入集合描述",
    autoSize: ({ minRows: 2, maxRows: 5 }),
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.newCollection.description),
    placeholder: "请输入集合描述",
    autoSize: ({ minRows: 2, maxRows: 5 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
var __VLS_99;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dialog-sections" },
});
const __VLS_104 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索表名或描述",
    ...{ style: {} },
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索表名或描述",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
if (__VLS_ctx.newCollection.tables.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selected-tables" },
        ...{ style: {} },
    });
    const __VLS_108 = {}.ATypographyTitle;
    /** @type {[typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        heading: (6),
    }));
    const __VLS_110 = __VLS_109({
        heading: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    var __VLS_111;
    const __VLS_112 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        wrap: true,
    }));
    const __VLS_114 = __VLS_113({
        wrap: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    __VLS_115.slots.default;
    for (const [table] of __VLS_getVForSourceType((__VLS_ctx.newCollection.tables))) {
        const __VLS_116 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
            ...{ 'onClose': {} },
            key: (table.name),
            closable: true,
            size: "small",
        }));
        const __VLS_118 = __VLS_117({
            ...{ 'onClose': {} },
            key: (table.name),
            closable: true,
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        let __VLS_120;
        let __VLS_121;
        let __VLS_122;
        const __VLS_123 = {
            onClose: (...[$event]) => {
                if (!(__VLS_ctx.newCollection.tables.length > 0))
                    return;
                __VLS_ctx.removeSelectedTable(table);
            }
        };
        __VLS_119.slots.default;
        (table.name);
        var __VLS_119;
    }
    var __VLS_115;
}
const __VLS_124 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    data: (__VLS_ctx.filteredTables),
    columns: (__VLS_ctx.tableColumns),
    pagination: (false),
    rowSelection: (__VLS_ctx.rowSelection),
    rowKey: ('key'),
    size: "small",
    ...{ class: "table-selector" },
}));
const __VLS_126 = __VLS_125({
    data: (__VLS_ctx.filteredTables),
    columns: (__VLS_ctx.tableColumns),
    pagination: (false),
    rowSelection: (__VLS_ctx.rowSelection),
    rowKey: ('key'),
    size: "small",
    ...{ class: "table-selector" },
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_127.slots;
    const __VLS_128 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        title: "表名",
        dataIndex: "label",
        width: (180),
    }));
    const __VLS_130 = __VLS_129({
        title: "表名",
        dataIndex: "label",
        width: (180),
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_131.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_132 = {}.ATypographyText;
        /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            strong: true,
        }));
        const __VLS_134 = __VLS_133({
            strong: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        __VLS_135.slots.default;
        (record.label);
        var __VLS_135;
    }
    var __VLS_131;
    const __VLS_136 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        title: "类型",
        dataIndex: "type",
        width: (100),
    }));
    const __VLS_138 = __VLS_137({
        title: "类型",
        dataIndex: "type",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_139.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_140 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            size: "small",
            color: (__VLS_ctx.getTypeColor(record.type)),
        }));
        const __VLS_142 = __VLS_141({
            size: "small",
            color: (__VLS_ctx.getTypeColor(record.type)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_143.slots.default;
        (record.type);
        var __VLS_143;
    }
    var __VLS_139;
    const __VLS_144 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        title: "描述",
        dataIndex: "description",
    }));
    const __VLS_146 = __VLS_145({
        title: "描述",
        dataIndex: "description",
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_147.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_147.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_148 = {}.ATypographyParagraph;
        /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
            type: "secondary",
            ellipsis: ({ rows: 1 }),
        }));
        const __VLS_150 = __VLS_149({
            type: "secondary",
            ellipsis: ({ rows: 1 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        __VLS_151.slots.default;
        (record.description);
        var __VLS_151;
    }
    var __VLS_147;
}
var __VLS_127;
var __VLS_87;
var __VLS_79;
/** @type {__VLS_StyleScopedClasses['favorite-tables']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-card']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-description']} */ ;
/** @type {__VLS_StyleScopedClasses['scene-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-sections']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-tables']} */ ;
/** @type {__VLS_StyleScopedClasses['table-selector']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconStar: IconStar,
            IconStarFill: IconStarFill,
            IconPlus: IconPlus,
            IconFile: IconFile,
            createCollectionVisible: createCollectionVisible,
            searchKeyword: searchKeyword,
            tableColumns: tableColumns,
            rowSelection: rowSelection,
            filteredTables: filteredTables,
            newCollection: newCollection,
            removeSelectedTable: removeSelectedTable,
            showCreateCollectionDialog: showCreateCollectionDialog,
            handleCreateCollection: handleCreateCollection,
            getTypeColor: getTypeColor,
            showCollectionDetail: showCollectionDetail,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
