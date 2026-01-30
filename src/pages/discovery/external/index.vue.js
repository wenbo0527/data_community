/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, h } from 'vue';
import { IconStar, IconStarFill, IconPlus, IconDelete } from '@arco-design/web-vue/es/icon';
const loading = ref(false);
const searchText = ref('');
const showEditModal = ref(false);
const editForm = ref({
    dataName: '',
    interfaces: [
        { type: '主接口', interfaceId: '' }
    ],
    dataType: '',
    subType: '',
    dataManagement: '登陆账号',
    onlineTime: ''
});
const filterForm = ref({
    dataType: undefined,
    dataCategory: undefined,
    supplier: ''
});
const columns = [
    {
        title: '接口编号',
        dataIndex: 'interfaceId',
        slotName: 'interfaceId'
    },
    {
        title: '数据管理',
        dataIndex: 'dataManagement'
    },
    {
        title: '上线时间',
        dataIndex: 'onlineTime'
    },
    {
        title: '数据类型',
        slotName: 'dataType'
    }
];
const tableData = ref([
    {
        interfaceId: 'WS_CELLPHONE',
        backupInterfaceId: 'WS_CELLPHONE_BACKUP',
        dataManagement: '张三',
        onlineTime: '2023-12-08',
        dataType: '核验类',
        subType: '身份核验类',
        isPrimary: true,
        isFavorite: false,
        dataName: '手机号核验服务'
    },
    {
        interfaceId: 'WS_CREDIT_SCORE_BACKUP',
        primaryInterfaceId: 'WS_CREDIT_SCORE',
        dataManagement: '张三',
        onlineTime: '2023-12-10',
        dataType: '评分类',
        subType: '信用评分',
        isPrimary: false,
        isFavorite: true,
        dataName: '个人信用评分'
    },
    {
        interfaceId: 'WS_USER_TAGS',
        backupInterfaceId: 'WS_USER_TAGS_BACKUP',
        dataManagement: '张三',
        onlineTime: '2023-12-12',
        dataType: '标签类',
        subType: '用户画像',
        isPrimary: true,
        isFavorite: false,
        dataName: '用户标签服务'
    },
    {
        interfaceId: 'WS_BLACK_LIST',
        backupInterfaceId: 'WS_BLACK_LIST_BACKUP',
        dataManagement: '张三',
        onlineTime: '2023-12-15',
        dataType: '名单类',
        subType: '风险名单',
        isPrimary: true,
        isFavorite: false,
        dataName: '风险名单查询'
    },
    {
        interfaceId: 'WS_PRICE_EVAL_BACKUP',
        primaryInterfaceId: 'WS_PRICE_EVAL',
        dataManagement: '张三',
        onlineTime: '2023-12-18',
        dataType: '价格评估类',
        subType: '资产评估',
        isPrimary: false,
        isFavorite: true,
        dataName: '资产价格评估'
    }
]);
const toggleFavorite = (item) => {
    item.isFavorite = !item.isFavorite;
};
const interfaceColumns = [
    {
        title: '接口类型',
        dataIndex: 'type',
        width: 120,
        editable: false
    },
    {
        title: '接口编号',
        dataIndex: 'interfaceId',
        slotName: 'interfaceId'
    },
    {
        title: '操作',
        slotName: 'operations',
        width: 100
    }
];
const addBackupInterface = () => {
    const backupCount = editForm.value.interfaces.filter(i => i.type.includes('备接口')).length;
    editForm.value.interfaces.push({
        type: `备接口${backupCount + 1}`,
        interfaceId: ''
    });
};
const removeInterface = (index) => {
    editForm.value.interfaces.splice(index, 1);
};
const handleAddProduct = () => {
    const primaryInterface = editForm.value.interfaces.find(i => i.type === '主接口');
    const backupInterfaces = editForm.value.interfaces.filter(i => i.type.includes('备接口'));
    tableData.value.push({
        ...editForm.value,
        interfaceId: primaryInterface?.interfaceId || '',
        backupInterfaceId: backupInterfaces.map(i => i.interfaceId).join(','),
        isPrimary: true,
        isFavorite: false
    });
    showEditModal.value = false;
    editForm.value = {
        dataName: '',
        interfaceId: '',
        dataType: '',
        subType: '',
        dataManagement: '登陆账号',
        onlineTime: ''
    };
};
const filteredData = computed(() => {
    let result = tableData.value;
    // 应用搜索过滤
    if (searchText.value) {
        result = result.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(searchText.value.toLowerCase())));
    }
    // 应用数据类型过滤
    if (filterForm.value.dataType && filterForm.value.dataType !== '不限') {
        result = result.filter(item => item.dataType === filterForm.value.dataType);
    }
    return result;
});
const getTagColor = (type) => {
    const colorMap = {
        '核验类': 'blue',
        '评分类': 'orange',
        '标签类': 'green',
        '名单类': 'red',
        '价格评估类': 'purple',
        '身份核验类': 'cyan',
        '信用评分': 'gold',
        '用户画像': 'lime',
        '风险名单': 'magenta',
        '资产评估': 'geekblue'
    };
    return colorMap[type] || 'gray';
};
const selectedProduct = ref('');
const filterOption = (inputValue, option) => {
    return (option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
        option._children.toLowerCase().includes(inputValue.toLowerCase()));
};
const handleSearch = (value) => {
    searchText.value = value;
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "external-data-page" },
});
const __VLS_0 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    defaultActiveKey: "1",
    type: "rounded",
}));
const __VLS_2 = __VLS_1({
    defaultActiveKey: "1",
    type: "rounded",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    key: "1",
    title: "产品页面",
}));
const __VLS_6 = __VLS_5({
    key: "1",
    title: "产品页面",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    gutter: ([24, 24]),
}));
const __VLS_10 = __VLS_9({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    span: (24),
}));
const __VLS_14 = __VLS_13({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    title: "外部数据",
    bordered: (false),
}));
const __VLS_18 = __VLS_17({
    title: "外部数据",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_20 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showEditModal = true;
        }
    };
    __VLS_27.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_27.slots;
        const __VLS_32 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    let __VLS_27;
    const __VLS_36 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    let __VLS_39;
    let __VLS_23;
}
const __VLS_44 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}));
const __VLS_46 = __VLS_45({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    field: "dataType",
    label: "数源种类",
}));
const __VLS_50 = __VLS_49({
    field: "dataType",
    label: "数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    value: "不限",
}));
const __VLS_58 = __VLS_57({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
let __VLS_59;
const __VLS_60 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    value: "核验类",
}));
const __VLS_62 = __VLS_61({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
let __VLS_63;
const __VLS_64 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: "评分类",
}));
const __VLS_66 = __VLS_65({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
let __VLS_67;
const __VLS_68 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    value: "标签类",
}));
const __VLS_70 = __VLS_69({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
let __VLS_71;
const __VLS_72 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "名单类",
}));
const __VLS_74 = __VLS_73({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
let __VLS_75;
const __VLS_76 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "价格评估类",
}));
const __VLS_78 = __VLS_77({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
let __VLS_79;
let __VLS_55;
let __VLS_51;
const __VLS_80 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    field: "dataCategory",
    label: "数源分类",
}));
const __VLS_82 = __VLS_81({
    field: "dataCategory",
    label: "数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    value: "不限",
}));
const __VLS_90 = __VLS_89({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
let __VLS_91;
const __VLS_92 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    value: "选项2",
}));
const __VLS_94 = __VLS_93({
    value: "选项2",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
let __VLS_95;
const __VLS_96 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    value: "选项3",
}));
const __VLS_98 = __VLS_97({
    value: "选项3",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
let __VLS_99;
const __VLS_100 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    value: "选项4",
}));
const __VLS_102 = __VLS_101({
    value: "选项4",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
let __VLS_103;
let __VLS_87;
let __VLS_83;
const __VLS_104 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    field: "supplier",
    label: "供应商",
}));
const __VLS_106 = __VLS_105({
    field: "supplier",
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
let __VLS_107;
let __VLS_47;
const __VLS_112 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    gutter: ([16, 16]),
}));
const __VLS_114 = __VLS_113({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredData))) {
    const __VLS_116 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }));
    const __VLS_118 = __VLS_117({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    const __VLS_120 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }));
    const __VLS_122 = __VLS_121({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_123.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_123.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "data-name" },
        });
        const __VLS_124 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ 
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            to: (`/discovery/external/detail/${item.interfaceId}`),
        }));
        const __VLS_126 = __VLS_125({
            to: (`/discovery/external/detail/${item.interfaceId}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_127.slots.default;
        (item.dataName || '外部数据');
        var __VLS_127;
        const __VLS_128 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
        const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
        __VLS_131.slots.default;
        const __VLS_132 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            color: (__VLS_ctx.getTagColor(item.dataType)),
        }));
        const __VLS_134 = __VLS_133({
            color: (__VLS_ctx.getTagColor(item.dataType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        __VLS_135.slots.default;
        (item.dataType);
        var __VLS_135;
        if (item.subType) {
            const __VLS_136 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
            // @ts-ignore
            const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
                color: (__VLS_ctx.getTagColor(item.subType)),
            }));
            const __VLS_138 = __VLS_137({
                color: (__VLS_ctx.getTagColor(item.subType)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_137));
            __VLS_139.slots.default;
            (item.subType);
            var __VLS_139;
        }
        if (item.isFavorite) {
            const __VLS_140 = {}.IconStarFill;
            /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ 
            // @ts-ignore
            const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
                ...{ 'onClick': {} },
                ...{ style: ({ color: '#FFD700', cursor: 'pointer' }) },
            }));
            const __VLS_142 = __VLS_141({
                ...{ 'onClick': {} },
                ...{ style: ({ color: '#FFD700', cursor: 'pointer' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_141));
            let __VLS_144;
            let __VLS_145;
            let __VLS_146;
            const __VLS_147 = {
                onClick: (...[$event]) => {
                    if (!(item.isFavorite))
                        return;
                    __VLS_ctx.toggleFavorite(item);
                }
            };
            var __VLS_143;
        }
        else {
            const __VLS_148 = {}.IconStar;
            /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ 
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                ...{ 'onClick': {} },
                ...{ style: ({ cursor: 'pointer' }) },
            }));
            const __VLS_150 = __VLS_149({
                ...{ 'onClick': {} },
                ...{ style: ({ cursor: 'pointer' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_149));
            let __VLS_152;
            let __VLS_153;
            let __VLS_154;
            const __VLS_155 = {
                onClick: (...[$event]) => {
                    if (item.isFavorite)
                        return;
                    __VLS_ctx.toggleFavorite(item);
                }
            };
            var __VLS_151;
        }
        var __VLS_131;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    const __VLS_156 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({}));
    const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    if (item.isPrimary) {
        const __VLS_160 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ 
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
            ...{ style: ({ color: '#165DFF' }) },
        }));
        const __VLS_162 = __VLS_161({
            ...{ style: ({ color: '#165DFF' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_161));
        __VLS_163.slots.default;
        (item.interfaceId);
        var __VLS_163;
        if (item.backupInterfaceId) {
            const __VLS_164 = {}.ALink;
            /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ 
            // @ts-ignore
            const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
                ...{ style: ({ color: '#86909C' }) },
            }));
            const __VLS_166 = __VLS_165({
                ...{ style: ({ color: '#86909C' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_165));
            __VLS_167.slots.default;
            (item.backupInterfaceId);
            var __VLS_167;
        }
    }
    else {
        if (item.primaryInterfaceId) {
            const __VLS_168 = {}.ALink;
            /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ 
            // @ts-ignore
            const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
                ...{ style: ({ color: '#165DFF' }) },
            }));
            const __VLS_170 = __VLS_169({
                ...{ style: ({ color: '#165DFF' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_169));
            __VLS_171.slots.default;
            (item.primaryInterfaceId);
            var __VLS_171;
        }
        const __VLS_172 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ 
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
            ...{ style: ({ color: '#86909C' }) },
        }));
        const __VLS_174 = __VLS_173({
            ...{ style: ({ color: '#86909C' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        __VLS_175.slots.default;
        (item.interfaceId);
        var __VLS_175;
    }
    var __VLS_159;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.dataManagement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.onlineTime);
    var __VLS_123;
    var __VLS_119;
}
let __VLS_115;
let __VLS_19;
let __VLS_15;
let __VLS_11;
let __VLS_7;
const __VLS_176 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    key: "2",
    title: "接口页面",
}));
const __VLS_178 = __VLS_177({
    key: "2",
    title: "接口页面",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    gutter: ([24, 24]),
}));
const __VLS_182 = __VLS_181({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    span: (24),
}));
const __VLS_186 = __VLS_185({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    title: "接口列表",
    bordered: (false),
}));
const __VLS_190 = __VLS_189({
    title: "接口列表",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_191.slots;
    const __VLS_192 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
    const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_195.slots.default;
    const __VLS_196 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        modelValue: (__VLS_ctx.selectedProduct),
        placeholder: "关联产品",
        ...{ style: {} },
        allowClear: true,
    }));
    const __VLS_198 = __VLS_197({
        modelValue: (__VLS_ctx.selectedProduct),
        placeholder: "关联产品",
        ...{ style: {} },
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    __VLS_199.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableData.value))) {
        const __VLS_200 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
        // @ts-ignore
        const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }));
        const __VLS_202 = __VLS_201({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_201));
        __VLS_203.slots.default;
        (item.dataName);
        var __VLS_203;
    }
    let __VLS_199;
    const __VLS_204 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }));
    const __VLS_206 = __VLS_205({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    let __VLS_208;
    let __VLS_209;
    let __VLS_210;
    const __VLS_211 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    let __VLS_207;
    let __VLS_195;
}
{
    const { 'product-extra': __VLS_thisSlot } = __VLS_191.slots;
    const __VLS_212 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({}));
    const __VLS_214 = __VLS_213({}, ...__VLS_functionalComponentArgsRest(__VLS_213));
    __VLS_215.slots.default;
    const __VLS_216 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_218 = __VLS_217({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    let __VLS_220;
    let __VLS_221;
    let __VLS_222;
    const __VLS_223 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showEditModal = true;
        }
    };
    __VLS_219.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_219.slots;
        const __VLS_224 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
        // @ts-ignore
        const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({}));
        const __VLS_226 = __VLS_225({}, ...__VLS_functionalComponentArgsRest(__VLS_225));
    }
    let __VLS_219;
    const __VLS_228 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }));
    const __VLS_230 = __VLS_229({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    let __VLS_232;
    let __VLS_233;
    let __VLS_234;
    const __VLS_235 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    let __VLS_231;
    let __VLS_215;
}
const __VLS_236 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}));
const __VLS_238 = __VLS_237({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
const __VLS_240 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    field: "dataType",
    label: "数源种类",
}));
const __VLS_242 = __VLS_241({
    field: "dataType",
    label: "数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
const __VLS_244 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
const __VLS_248 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    value: "不限",
}));
const __VLS_250 = __VLS_249({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
let __VLS_251;
const __VLS_252 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    value: "核验类",
}));
const __VLS_254 = __VLS_253({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
let __VLS_255;
const __VLS_256 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    value: "评分类",
}));
const __VLS_258 = __VLS_257({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
let __VLS_259;
const __VLS_260 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    value: "标签类",
}));
const __VLS_262 = __VLS_261({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
let __VLS_263;
const __VLS_264 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    value: "名单类",
}));
const __VLS_266 = __VLS_265({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
let __VLS_267;
const __VLS_268 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    value: "价格评估类",
}));
const __VLS_270 = __VLS_269({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
let __VLS_271;
let __VLS_247;
let __VLS_243;
const __VLS_272 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    field: "dataCategory",
    label: "数源分类",
}));
const __VLS_274 = __VLS_273({
    field: "dataCategory",
    label: "数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
__VLS_275.slots.default;
const __VLS_276 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_278 = __VLS_277({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
const __VLS_280 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    value: "不限",
}));
const __VLS_282 = __VLS_281({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
let __VLS_283;
const __VLS_284 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    value: "选项2",
}));
const __VLS_286 = __VLS_285({
    value: "选项2",
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
let __VLS_287;
const __VLS_288 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    value: "选项3",
}));
const __VLS_290 = __VLS_289({
    value: "选项3",
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
let __VLS_291;
const __VLS_292 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    value: "选项4",
}));
const __VLS_294 = __VLS_293({
    value: "选项4",
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
__VLS_295.slots.default;
let __VLS_295;
let __VLS_279;
let __VLS_275;
const __VLS_296 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    field: "supplier",
    label: "供应商",
}));
const __VLS_298 = __VLS_297({
    field: "supplier",
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
const __VLS_300 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_302 = __VLS_301({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
let __VLS_299;
let __VLS_239;
const __VLS_304 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    gutter: ([16, 16]),
}));
const __VLS_306 = __VLS_305({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredData))) {
    const __VLS_308 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
    // @ts-ignore
    const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }));
    const __VLS_310 = __VLS_309({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_309));
    __VLS_311.slots.default;
    const __VLS_312 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }));
    const __VLS_314 = __VLS_313({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_313));
    __VLS_315.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_315.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "data-name" },
        });
        (item.dataName || '外部数据');
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.interfaceId);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.dataManagement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.onlineTime);
    var __VLS_315;
    var __VLS_311;
}
let __VLS_307;
let __VLS_191;
let __VLS_187;
let __VLS_183;
let __VLS_179;
let __VLS_3;
const __VLS_316 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showEditModal),
    title: "新增产品",
}));
const __VLS_318 = __VLS_317({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showEditModal),
    title: "新增产品",
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
let __VLS_320;
let __VLS_321;
let __VLS_322;
const __VLS_323 = {
    onOk: (__VLS_ctx.handleAddProduct)
};
const __VLS_324 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showEditModal = false;
    }
};
__VLS_319.slots.default;
const __VLS_325 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}));
const __VLS_327 = __VLS_326({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_326));
__VLS_328.slots.default;
const __VLS_329 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
    label: "产品名称",
    field: "dataName",
}));
const __VLS_331 = __VLS_330({
    label: "产品名称",
    field: "dataName",
}, ...__VLS_functionalComponentArgsRest(__VLS_330));
__VLS_332.slots.default;
const __VLS_333 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({
    modelValue: (__VLS_ctx.editForm.dataName),
    placeholder: "请输入产品名称",
}));
const __VLS_335 = __VLS_334({
    modelValue: (__VLS_ctx.editForm.dataName),
    placeholder: "请输入产品名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_334));
let __VLS_332;
const __VLS_337 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
    label: "接口列表",
    field: "interfaces",
}));
const __VLS_339 = __VLS_338({
    label: "接口列表",
    field: "interfaces",
}, ...__VLS_functionalComponentArgsRest(__VLS_338));
__VLS_340.slots.default;
const __VLS_341 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
    data: (__VLS_ctx.editForm.interfaces),
    columns: (__VLS_ctx.interfaceColumns),
    size: "small",
}));
const __VLS_343 = __VLS_342({
    data: (__VLS_ctx.editForm.interfaces),
    columns: (__VLS_ctx.interfaceColumns),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_342));
__VLS_344.slots.default;
{
    const { interfaceId: __VLS_thisSlot } = __VLS_344.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_345 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
    // @ts-ignore
    const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
        modelValue: (record.interfaceId),
        placeholder: "请选择或搜索接口编号",
        allowSearch: true,
        allowClear: true,
        filterOption: (__VLS_ctx.filterOption),
    }));
    const __VLS_347 = __VLS_346({
        modelValue: (record.interfaceId),
        placeholder: "请选择或搜索接口编号",
        allowSearch: true,
        allowClear: true,
        filterOption: (__VLS_ctx.filterOption),
    }, ...__VLS_functionalComponentArgsRest(__VLS_346));
    __VLS_348.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableData.value))) {
        const __VLS_349 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
        // @ts-ignore
        const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }));
        const __VLS_351 = __VLS_350({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_350));
        __VLS_352.slots.default;
        (item.dataName);
        (item.interfaceId);
        var __VLS_352;
    }
    let __VLS_348;
}
{
    const { operations: __VLS_thisSlot } = __VLS_344.slots;
    const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_353 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({
        ...{ 'onClick': {} },
        type: "text",
    }));
    const __VLS_355 = __VLS_354({
        ...{ 'onClick': {} },
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_354));
    let __VLS_357;
    let __VLS_358;
    let __VLS_359;
    const __VLS_360 = {
        onClick: (__VLS_ctx.addBackupInterface)
    };
    __VLS_356.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_356.slots;
        const __VLS_361 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
        // @ts-ignore
        const __VLS_362 = __VLS_asFunctionalComponent(__VLS_361, new __VLS_361({}));
        const __VLS_363 = __VLS_362({}, ...__VLS_functionalComponentArgsRest(__VLS_362));
    }
    let __VLS_356;
    if (rowIndex > 0) {
        const __VLS_365 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({
            ...{ 'onClick': {} },
            type: "text",
            status: "danger",
        }));
        const __VLS_367 = __VLS_366({
            ...{ 'onClick': {} },
            type: "text",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_366));
        let __VLS_369;
        let __VLS_370;
        let __VLS_371;
        const __VLS_372 = {
            onClick: (...[$event]) => {
                if (!(rowIndex > 0))
                    return;
                __VLS_ctx.removeInterface(rowIndex);
            }
        };
        __VLS_368.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_368.slots;
            const __VLS_373 = {}.IconDelete;
            /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ 
            // @ts-ignore
            const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({}));
            const __VLS_375 = __VLS_374({}, ...__VLS_functionalComponentArgsRest(__VLS_374));
        }
        let __VLS_368;
    }
}
let __VLS_344;
let __VLS_340;
const __VLS_377 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({
    label: "数源种类",
    field: "dataType",
}));
const __VLS_379 = __VLS_378({
    label: "数源种类",
    field: "dataType",
}, ...__VLS_functionalComponentArgsRest(__VLS_378));
__VLS_380.slots.default;
const __VLS_381 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_382 = __VLS_asFunctionalComponent(__VLS_381, new __VLS_381({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数据类型",
}));
const __VLS_383 = __VLS_382({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数据类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_382));
__VLS_384.slots.default;
const __VLS_385 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({
    value: "核验类",
}));
const __VLS_387 = __VLS_386({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_386));
__VLS_388.slots.default;
let __VLS_388;
const __VLS_389 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_390 = __VLS_asFunctionalComponent(__VLS_389, new __VLS_389({
    value: "评分类",
}));
const __VLS_391 = __VLS_390({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_390));
__VLS_392.slots.default;
let __VLS_392;
const __VLS_393 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_394 = __VLS_asFunctionalComponent(__VLS_393, new __VLS_393({
    value: "标签类",
}));
const __VLS_395 = __VLS_394({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_394));
__VLS_396.slots.default;
let __VLS_396;
const __VLS_397 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({
    value: "名单类",
}));
const __VLS_399 = __VLS_398({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_398));
__VLS_400.slots.default;
let __VLS_400;
const __VLS_401 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({
    value: "价格评估类",
}));
const __VLS_403 = __VLS_402({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_402));
__VLS_404.slots.default;
let __VLS_404;
let __VLS_384;
let __VLS_380;
const __VLS_405 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_406 = __VLS_asFunctionalComponent(__VLS_405, new __VLS_405({
    label: "数源分类",
    field: "subType",
}));
const __VLS_407 = __VLS_406({
    label: "数源分类",
    field: "subType",
}, ...__VLS_functionalComponentArgsRest(__VLS_406));
__VLS_408.slots.default;
const __VLS_409 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_410 = __VLS_asFunctionalComponent(__VLS_409, new __VLS_409({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请选择子类型",
}));
const __VLS_411 = __VLS_410({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请选择子类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_410));
__VLS_412.slots.default;
const __VLS_413 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_414 = __VLS_asFunctionalComponent(__VLS_413, new __VLS_413({
    value: "身份核验类",
}));
const __VLS_415 = __VLS_414({
    value: "身份核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_414));
__VLS_416.slots.default;
let __VLS_416;
const __VLS_417 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_418 = __VLS_asFunctionalComponent(__VLS_417, new __VLS_417({
    value: "信用评分",
}));
const __VLS_419 = __VLS_418({
    value: "信用评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_418));
__VLS_420.slots.default;
let __VLS_420;
const __VLS_421 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_422 = __VLS_asFunctionalComponent(__VLS_421, new __VLS_421({
    value: "用户画像",
}));
const __VLS_423 = __VLS_422({
    value: "用户画像",
}, ...__VLS_functionalComponentArgsRest(__VLS_422));
__VLS_424.slots.default;
let __VLS_424;
const __VLS_425 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_426 = __VLS_asFunctionalComponent(__VLS_425, new __VLS_425({
    value: "风险名单",
}));
const __VLS_427 = __VLS_426({
    value: "风险名单",
}, ...__VLS_functionalComponentArgsRest(__VLS_426));
__VLS_428.slots.default;
let __VLS_428;
const __VLS_429 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_430 = __VLS_asFunctionalComponent(__VLS_429, new __VLS_429({
    value: "资产评估",
}));
const __VLS_431 = __VLS_430({
    value: "资产评估",
}, ...__VLS_functionalComponentArgsRest(__VLS_430));
__VLS_432.slots.default;
let __VLS_432;
let __VLS_412;
let __VLS_408;
const __VLS_433 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_434 = __VLS_asFunctionalComponent(__VLS_433, new __VLS_433({
    label: "数据管理",
    field: "dataManagement",
}));
const __VLS_435 = __VLS_434({
    label: "数据管理",
    field: "dataManagement",
}, ...__VLS_functionalComponentArgsRest(__VLS_434));
__VLS_436.slots.default;
const __VLS_437 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_438 = __VLS_asFunctionalComponent(__VLS_437, new __VLS_437({
    modelValue: (__VLS_ctx.editForm.dataManagement),
    placeholder: "请选择数据管理员",
}));
const __VLS_439 = __VLS_438({
    modelValue: (__VLS_ctx.editForm.dataManagement),
    placeholder: "请选择数据管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_438));
__VLS_440.slots.default;
const __VLS_441 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_442 = __VLS_asFunctionalComponent(__VLS_441, new __VLS_441({
    value: "张三",
}));
const __VLS_443 = __VLS_442({
    value: "张三",
}, ...__VLS_functionalComponentArgsRest(__VLS_442));
__VLS_444.slots.default;
let __VLS_444;
let __VLS_440;
let __VLS_436;
const __VLS_445 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_446 = __VLS_asFunctionalComponent(__VLS_445, new __VLS_445({
    label: "上线时间",
    field: "onlineTime",
}));
const __VLS_447 = __VLS_446({
    label: "上线时间",
    field: "onlineTime",
}, ...__VLS_functionalComponentArgsRest(__VLS_446));
__VLS_448.slots.default;
const __VLS_449 = {}.ADatePicker;
/** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ 
// @ts-ignore
const __VLS_450 = __VLS_asFunctionalComponent(__VLS_449, new __VLS_449({
    modelValue: (__VLS_ctx.editForm.onlineTime),
    ...{ style: {} },
}));
const __VLS_451 = __VLS_450({
    modelValue: (__VLS_ctx.editForm.onlineTime),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_450));
let __VLS_448;
let __VLS_328;
let __VLS_319;
/** @type {__VLS_StyleScopedClasses['external-data-page']} */ 
/** @type {__VLS_StyleScopedClasses['filter-form']} */ 
/** @type {__VLS_StyleScopedClasses['data-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-header']} */ 
/** @type {__VLS_StyleScopedClasses['data-name']} */ 
/** @type {__VLS_StyleScopedClasses['card-content']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['filter-form']} */ 
/** @type {__VLS_StyleScopedClasses['data-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-header']} */ 
/** @type {__VLS_StyleScopedClasses['data-name']} */ 
/** @type {__VLS_StyleScopedClasses['card-content']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconStar: IconStar,
            IconStarFill: IconStarFill,
            IconPlus: IconPlus,
            IconDelete: IconDelete,
            searchText: searchText,
            showEditModal: showEditModal,
            editForm: editForm,
            filterForm: filterForm,
            tableData: tableData,
            toggleFavorite: toggleFavorite,
            interfaceColumns: interfaceColumns,
            addBackupInterface: addBackupInterface,
            removeInterface: removeInterface,
            handleAddProduct: handleAddProduct,
            filteredData: filteredData,
            getTagColor: getTagColor,
            selectedProduct: selectedProduct,
            filterOption: filterOption,
            handleSearch: handleSearch,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
