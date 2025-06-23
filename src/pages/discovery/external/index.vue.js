/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "content" },
}));
const __VLS_6 = __VLS_5({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    defaultActiveKey: "1",
    type: "rounded",
}));
const __VLS_10 = __VLS_9({
    defaultActiveKey: "1",
    type: "rounded",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    key: "1",
    title: "产品页面",
}));
const __VLS_14 = __VLS_13({
    key: "1",
    title: "产品页面",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    gutter: ([24, 24]),
}));
const __VLS_18 = __VLS_17({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    span: (24),
}));
const __VLS_22 = __VLS_21({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    title: "外部数据",
    bordered: (false),
}));
const __VLS_26 = __VLS_25({
    title: "外部数据",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_28 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showEditModal = true;
        }
    };
    __VLS_35.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_40 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    }
    var __VLS_35;
    const __VLS_44 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    var __VLS_47;
    var __VLS_31;
}
const __VLS_52 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}));
const __VLS_54 = __VLS_53({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    field: "dataType",
    label: "数源种类",
}));
const __VLS_58 = __VLS_57({
    field: "dataType",
    label: "数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: "不限",
}));
const __VLS_66 = __VLS_65({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
var __VLS_67;
const __VLS_68 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    value: "核验类",
}));
const __VLS_70 = __VLS_69({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
const __VLS_72 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "评分类",
}));
const __VLS_74 = __VLS_73({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
var __VLS_75;
const __VLS_76 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "标签类",
}));
const __VLS_78 = __VLS_77({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
const __VLS_80 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    value: "名单类",
}));
const __VLS_82 = __VLS_81({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
var __VLS_83;
const __VLS_84 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    value: "价格评估类",
}));
const __VLS_86 = __VLS_85({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
var __VLS_87;
var __VLS_63;
var __VLS_59;
const __VLS_88 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    field: "dataCategory",
    label: "数源分类",
}));
const __VLS_90 = __VLS_89({
    field: "dataCategory",
    label: "数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    value: "不限",
}));
const __VLS_98 = __VLS_97({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
var __VLS_99;
const __VLS_100 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    value: "选项2",
}));
const __VLS_102 = __VLS_101({
    value: "选项2",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
var __VLS_103;
const __VLS_104 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    value: "选项3",
}));
const __VLS_106 = __VLS_105({
    value: "选项3",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
var __VLS_107;
const __VLS_108 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    value: "选项4",
}));
const __VLS_110 = __VLS_109({
    value: "选项4",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
var __VLS_111;
var __VLS_95;
var __VLS_91;
const __VLS_112 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    field: "supplier",
    label: "供应商",
}));
const __VLS_114 = __VLS_113({
    field: "supplier",
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
var __VLS_115;
var __VLS_55;
const __VLS_120 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    gutter: ([16, 16]),
}));
const __VLS_122 = __VLS_121({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredData))) {
    const __VLS_124 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }));
    const __VLS_126 = __VLS_125({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    const __VLS_128 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }));
    const __VLS_130 = __VLS_129({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_131.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "data-name" },
        });
        const __VLS_132 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            to: (`/discovery/external/detail/${item.interfaceId}`),
        }));
        const __VLS_134 = __VLS_133({
            to: (`/discovery/external/detail/${item.interfaceId}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        __VLS_135.slots.default;
        (item.dataName || '外部数据');
        var __VLS_135;
        const __VLS_136 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
        const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
        __VLS_139.slots.default;
        const __VLS_140 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            color: (__VLS_ctx.getTagColor(item.dataType)),
        }));
        const __VLS_142 = __VLS_141({
            color: (__VLS_ctx.getTagColor(item.dataType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_143.slots.default;
        (item.dataType);
        var __VLS_143;
        if (item.subType) {
            const __VLS_144 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
                color: (__VLS_ctx.getTagColor(item.subType)),
            }));
            const __VLS_146 = __VLS_145({
                color: (__VLS_ctx.getTagColor(item.subType)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_145));
            __VLS_147.slots.default;
            (item.subType);
            var __VLS_147;
        }
        if (item.isFavorite) {
            const __VLS_148 = {}.IconStarFill;
            /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ ;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                ...{ 'onClick': {} },
                ...{ style: ({ color: '#FFD700', cursor: 'pointer' }) },
            }));
            const __VLS_150 = __VLS_149({
                ...{ 'onClick': {} },
                ...{ style: ({ color: '#FFD700', cursor: 'pointer' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_149));
            let __VLS_152;
            let __VLS_153;
            let __VLS_154;
            const __VLS_155 = {
                onClick: (...[$event]) => {
                    if (!(item.isFavorite))
                        return;
                    __VLS_ctx.toggleFavorite(item);
                }
            };
            var __VLS_151;
        }
        else {
            const __VLS_156 = {}.IconStar;
            /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ ;
            // @ts-ignore
            const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
                ...{ 'onClick': {} },
                ...{ style: ({ cursor: 'pointer' }) },
            }));
            const __VLS_158 = __VLS_157({
                ...{ 'onClick': {} },
                ...{ style: ({ cursor: 'pointer' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_157));
            let __VLS_160;
            let __VLS_161;
            let __VLS_162;
            const __VLS_163 = {
                onClick: (...[$event]) => {
                    if (!!(item.isFavorite))
                        return;
                    __VLS_ctx.toggleFavorite(item);
                }
            };
            var __VLS_159;
        }
        var __VLS_139;
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
    const __VLS_164 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({}));
    const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    if (item.isPrimary) {
        const __VLS_168 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
            ...{ style: ({ color: '#165DFF' }) },
        }));
        const __VLS_170 = __VLS_169({
            ...{ style: ({ color: '#165DFF' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
        __VLS_171.slots.default;
        (item.interfaceId);
        var __VLS_171;
        if (item.backupInterfaceId) {
            const __VLS_172 = {}.ALink;
            /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
            // @ts-ignore
            const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
                ...{ style: ({ color: '#86909C' }) },
            }));
            const __VLS_174 = __VLS_173({
                ...{ style: ({ color: '#86909C' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_173));
            __VLS_175.slots.default;
            (item.backupInterfaceId);
            var __VLS_175;
        }
    }
    else {
        if (item.primaryInterfaceId) {
            const __VLS_176 = {}.ALink;
            /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
            // @ts-ignore
            const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
                ...{ style: ({ color: '#165DFF' }) },
            }));
            const __VLS_178 = __VLS_177({
                ...{ style: ({ color: '#165DFF' }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_177));
            __VLS_179.slots.default;
            (item.primaryInterfaceId);
            var __VLS_179;
        }
        const __VLS_180 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
            ...{ style: ({ color: '#86909C' }) },
        }));
        const __VLS_182 = __VLS_181({
            ...{ style: ({ color: '#86909C' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_181));
        __VLS_183.slots.default;
        (item.interfaceId);
        var __VLS_183;
    }
    var __VLS_167;
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
    var __VLS_131;
    var __VLS_127;
}
var __VLS_123;
var __VLS_27;
var __VLS_23;
var __VLS_19;
var __VLS_15;
const __VLS_184 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    key: "2",
    title: "接口页面",
}));
const __VLS_186 = __VLS_185({
    key: "2",
    title: "接口页面",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    gutter: ([24, 24]),
}));
const __VLS_190 = __VLS_189({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    span: (24),
}));
const __VLS_194 = __VLS_193({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    title: "接口列表",
    bordered: (false),
}));
const __VLS_198 = __VLS_197({
    title: "接口列表",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_199.slots;
    const __VLS_200 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({}));
    const __VLS_202 = __VLS_201({}, ...__VLS_functionalComponentArgsRest(__VLS_201));
    __VLS_203.slots.default;
    const __VLS_204 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        modelValue: (__VLS_ctx.selectedProduct),
        placeholder: "关联产品",
        ...{ style: {} },
        allowClear: true,
    }));
    const __VLS_206 = __VLS_205({
        modelValue: (__VLS_ctx.selectedProduct),
        placeholder: "关联产品",
        ...{ style: {} },
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableData.value))) {
        const __VLS_208 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }));
        const __VLS_210 = __VLS_209({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_209));
        __VLS_211.slots.default;
        (item.dataName);
        var __VLS_211;
    }
    var __VLS_207;
    const __VLS_212 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }));
    const __VLS_214 = __VLS_213({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    let __VLS_216;
    let __VLS_217;
    let __VLS_218;
    const __VLS_219 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    var __VLS_215;
    var __VLS_203;
}
{
    const { 'product-extra': __VLS_thisSlot } = __VLS_199.slots;
    const __VLS_220 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({}));
    const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
    __VLS_223.slots.default;
    const __VLS_224 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_226 = __VLS_225({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    let __VLS_228;
    let __VLS_229;
    let __VLS_230;
    const __VLS_231 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showEditModal = true;
        }
    };
    __VLS_227.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_227.slots;
        const __VLS_232 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({}));
        const __VLS_234 = __VLS_233({}, ...__VLS_functionalComponentArgsRest(__VLS_233));
    }
    var __VLS_227;
    const __VLS_236 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }));
    const __VLS_238 = __VLS_237({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    let __VLS_240;
    let __VLS_241;
    let __VLS_242;
    const __VLS_243 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    var __VLS_239;
    var __VLS_223;
}
const __VLS_244 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}));
const __VLS_246 = __VLS_245({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
const __VLS_248 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    field: "dataType",
    label: "数源种类",
}));
const __VLS_250 = __VLS_249({
    field: "dataType",
    label: "数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}));
const __VLS_254 = __VLS_253({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    value: "不限",
}));
const __VLS_258 = __VLS_257({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
var __VLS_259;
const __VLS_260 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    value: "核验类",
}));
const __VLS_262 = __VLS_261({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
var __VLS_263;
const __VLS_264 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    value: "评分类",
}));
const __VLS_266 = __VLS_265({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
var __VLS_267;
const __VLS_268 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    value: "标签类",
}));
const __VLS_270 = __VLS_269({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
var __VLS_271;
const __VLS_272 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    value: "名单类",
}));
const __VLS_274 = __VLS_273({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
__VLS_275.slots.default;
var __VLS_275;
const __VLS_276 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    value: "价格评估类",
}));
const __VLS_278 = __VLS_277({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
var __VLS_279;
var __VLS_255;
var __VLS_251;
const __VLS_280 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    field: "dataCategory",
    label: "数源分类",
}));
const __VLS_282 = __VLS_281({
    field: "dataCategory",
    label: "数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
const __VLS_284 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_286 = __VLS_285({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
const __VLS_288 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    value: "不限",
}));
const __VLS_290 = __VLS_289({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
var __VLS_291;
const __VLS_292 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    value: "选项2",
}));
const __VLS_294 = __VLS_293({
    value: "选项2",
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
__VLS_295.slots.default;
var __VLS_295;
const __VLS_296 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    value: "选项3",
}));
const __VLS_298 = __VLS_297({
    value: "选项3",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
var __VLS_299;
const __VLS_300 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    value: "选项4",
}));
const __VLS_302 = __VLS_301({
    value: "选项4",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
var __VLS_303;
var __VLS_287;
var __VLS_283;
const __VLS_304 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    field: "supplier",
    label: "供应商",
}));
const __VLS_306 = __VLS_305({
    field: "supplier",
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
const __VLS_308 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_310 = __VLS_309({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
var __VLS_307;
var __VLS_247;
const __VLS_312 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    gutter: ([16, 16]),
}));
const __VLS_314 = __VLS_313({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredData))) {
    const __VLS_316 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }));
    const __VLS_318 = __VLS_317({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_317));
    __VLS_319.slots.default;
    const __VLS_320 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }));
    const __VLS_322 = __VLS_321({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_321));
    __VLS_323.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_323.slots;
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
    var __VLS_323;
    var __VLS_319;
}
var __VLS_315;
var __VLS_199;
var __VLS_195;
var __VLS_191;
var __VLS_187;
var __VLS_11;
var __VLS_7;
var __VLS_3;
const __VLS_324 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showEditModal),
    title: "新增产品",
}));
const __VLS_326 = __VLS_325({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showEditModal),
    title: "新增产品",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
let __VLS_328;
let __VLS_329;
let __VLS_330;
const __VLS_331 = {
    onOk: (__VLS_ctx.handleAddProduct)
};
const __VLS_332 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showEditModal = false;
    }
};
__VLS_327.slots.default;
const __VLS_333 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}));
const __VLS_335 = __VLS_334({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_334));
__VLS_336.slots.default;
const __VLS_337 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
    label: "产品名称",
    field: "dataName",
}));
const __VLS_339 = __VLS_338({
    label: "产品名称",
    field: "dataName",
}, ...__VLS_functionalComponentArgsRest(__VLS_338));
__VLS_340.slots.default;
const __VLS_341 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
    modelValue: (__VLS_ctx.editForm.dataName),
    placeholder: "请输入产品名称",
}));
const __VLS_343 = __VLS_342({
    modelValue: (__VLS_ctx.editForm.dataName),
    placeholder: "请输入产品名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_342));
var __VLS_340;
const __VLS_345 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
    label: "接口列表",
    field: "interfaces",
}));
const __VLS_347 = __VLS_346({
    label: "接口列表",
    field: "interfaces",
}, ...__VLS_functionalComponentArgsRest(__VLS_346));
__VLS_348.slots.default;
const __VLS_349 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
    data: (__VLS_ctx.editForm.interfaces),
    columns: (__VLS_ctx.interfaceColumns),
    size: "small",
}));
const __VLS_351 = __VLS_350({
    data: (__VLS_ctx.editForm.interfaces),
    columns: (__VLS_ctx.interfaceColumns),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_350));
__VLS_352.slots.default;
{
    const { interfaceId: __VLS_thisSlot } = __VLS_352.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_353 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({
        modelValue: (record.interfaceId),
        placeholder: "请选择或搜索接口编号",
        allowSearch: true,
        allowClear: true,
        filterOption: (__VLS_ctx.filterOption),
    }));
    const __VLS_355 = __VLS_354({
        modelValue: (record.interfaceId),
        placeholder: "请选择或搜索接口编号",
        allowSearch: true,
        allowClear: true,
        filterOption: (__VLS_ctx.filterOption),
    }, ...__VLS_functionalComponentArgsRest(__VLS_354));
    __VLS_356.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableData.value))) {
        const __VLS_357 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }));
        const __VLS_359 = __VLS_358({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_358));
        __VLS_360.slots.default;
        (item.dataName);
        (item.interfaceId);
        var __VLS_360;
    }
    var __VLS_356;
}
{
    const { operations: __VLS_thisSlot } = __VLS_352.slots;
    const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_361 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_362 = __VLS_asFunctionalComponent(__VLS_361, new __VLS_361({
        ...{ 'onClick': {} },
        type: "text",
    }));
    const __VLS_363 = __VLS_362({
        ...{ 'onClick': {} },
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_362));
    let __VLS_365;
    let __VLS_366;
    let __VLS_367;
    const __VLS_368 = {
        onClick: (__VLS_ctx.addBackupInterface)
    };
    __VLS_364.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_364.slots;
        const __VLS_369 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({}));
        const __VLS_371 = __VLS_370({}, ...__VLS_functionalComponentArgsRest(__VLS_370));
    }
    var __VLS_364;
    if (rowIndex > 0) {
        const __VLS_373 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({
            ...{ 'onClick': {} },
            type: "text",
            status: "danger",
        }));
        const __VLS_375 = __VLS_374({
            ...{ 'onClick': {} },
            type: "text",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_374));
        let __VLS_377;
        let __VLS_378;
        let __VLS_379;
        const __VLS_380 = {
            onClick: (...[$event]) => {
                if (!(rowIndex > 0))
                    return;
                __VLS_ctx.removeInterface(rowIndex);
            }
        };
        __VLS_376.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_376.slots;
            const __VLS_381 = {}.IconDelete;
            /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
            // @ts-ignore
            const __VLS_382 = __VLS_asFunctionalComponent(__VLS_381, new __VLS_381({}));
            const __VLS_383 = __VLS_382({}, ...__VLS_functionalComponentArgsRest(__VLS_382));
        }
        var __VLS_376;
    }
}
var __VLS_352;
var __VLS_348;
const __VLS_385 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({
    label: "数源种类",
    field: "dataType",
}));
const __VLS_387 = __VLS_386({
    label: "数源种类",
    field: "dataType",
}, ...__VLS_functionalComponentArgsRest(__VLS_386));
__VLS_388.slots.default;
const __VLS_389 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_390 = __VLS_asFunctionalComponent(__VLS_389, new __VLS_389({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数据类型",
}));
const __VLS_391 = __VLS_390({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数据类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_390));
__VLS_392.slots.default;
const __VLS_393 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_394 = __VLS_asFunctionalComponent(__VLS_393, new __VLS_393({
    value: "核验类",
}));
const __VLS_395 = __VLS_394({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_394));
__VLS_396.slots.default;
var __VLS_396;
const __VLS_397 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_398 = __VLS_asFunctionalComponent(__VLS_397, new __VLS_397({
    value: "评分类",
}));
const __VLS_399 = __VLS_398({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_398));
__VLS_400.slots.default;
var __VLS_400;
const __VLS_401 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({
    value: "标签类",
}));
const __VLS_403 = __VLS_402({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_402));
__VLS_404.slots.default;
var __VLS_404;
const __VLS_405 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_406 = __VLS_asFunctionalComponent(__VLS_405, new __VLS_405({
    value: "名单类",
}));
const __VLS_407 = __VLS_406({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_406));
__VLS_408.slots.default;
var __VLS_408;
const __VLS_409 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_410 = __VLS_asFunctionalComponent(__VLS_409, new __VLS_409({
    value: "价格评估类",
}));
const __VLS_411 = __VLS_410({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_410));
__VLS_412.slots.default;
var __VLS_412;
var __VLS_392;
var __VLS_388;
const __VLS_413 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_414 = __VLS_asFunctionalComponent(__VLS_413, new __VLS_413({
    label: "数源分类",
    field: "subType",
}));
const __VLS_415 = __VLS_414({
    label: "数源分类",
    field: "subType",
}, ...__VLS_functionalComponentArgsRest(__VLS_414));
__VLS_416.slots.default;
const __VLS_417 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_418 = __VLS_asFunctionalComponent(__VLS_417, new __VLS_417({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请选择子类型",
}));
const __VLS_419 = __VLS_418({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请选择子类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_418));
__VLS_420.slots.default;
const __VLS_421 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_422 = __VLS_asFunctionalComponent(__VLS_421, new __VLS_421({
    value: "身份核验类",
}));
const __VLS_423 = __VLS_422({
    value: "身份核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_422));
__VLS_424.slots.default;
var __VLS_424;
const __VLS_425 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_426 = __VLS_asFunctionalComponent(__VLS_425, new __VLS_425({
    value: "信用评分",
}));
const __VLS_427 = __VLS_426({
    value: "信用评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_426));
__VLS_428.slots.default;
var __VLS_428;
const __VLS_429 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_430 = __VLS_asFunctionalComponent(__VLS_429, new __VLS_429({
    value: "用户画像",
}));
const __VLS_431 = __VLS_430({
    value: "用户画像",
}, ...__VLS_functionalComponentArgsRest(__VLS_430));
__VLS_432.slots.default;
var __VLS_432;
const __VLS_433 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_434 = __VLS_asFunctionalComponent(__VLS_433, new __VLS_433({
    value: "风险名单",
}));
const __VLS_435 = __VLS_434({
    value: "风险名单",
}, ...__VLS_functionalComponentArgsRest(__VLS_434));
__VLS_436.slots.default;
var __VLS_436;
const __VLS_437 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_438 = __VLS_asFunctionalComponent(__VLS_437, new __VLS_437({
    value: "资产评估",
}));
const __VLS_439 = __VLS_438({
    value: "资产评估",
}, ...__VLS_functionalComponentArgsRest(__VLS_438));
__VLS_440.slots.default;
var __VLS_440;
var __VLS_420;
var __VLS_416;
const __VLS_441 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_442 = __VLS_asFunctionalComponent(__VLS_441, new __VLS_441({
    label: "数据管理",
    field: "dataManagement",
}));
const __VLS_443 = __VLS_442({
    label: "数据管理",
    field: "dataManagement",
}, ...__VLS_functionalComponentArgsRest(__VLS_442));
__VLS_444.slots.default;
const __VLS_445 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_446 = __VLS_asFunctionalComponent(__VLS_445, new __VLS_445({
    modelValue: (__VLS_ctx.editForm.dataManagement),
    placeholder: "请选择数据管理员",
}));
const __VLS_447 = __VLS_446({
    modelValue: (__VLS_ctx.editForm.dataManagement),
    placeholder: "请选择数据管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_446));
__VLS_448.slots.default;
const __VLS_449 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_450 = __VLS_asFunctionalComponent(__VLS_449, new __VLS_449({
    value: "张三",
}));
const __VLS_451 = __VLS_450({
    value: "张三",
}, ...__VLS_functionalComponentArgsRest(__VLS_450));
__VLS_452.slots.default;
var __VLS_452;
var __VLS_448;
var __VLS_444;
const __VLS_453 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_454 = __VLS_asFunctionalComponent(__VLS_453, new __VLS_453({
    label: "上线时间",
    field: "onlineTime",
}));
const __VLS_455 = __VLS_454({
    label: "上线时间",
    field: "onlineTime",
}, ...__VLS_functionalComponentArgsRest(__VLS_454));
__VLS_456.slots.default;
const __VLS_457 = {}.ADatePicker;
/** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
// @ts-ignore
const __VLS_458 = __VLS_asFunctionalComponent(__VLS_457, new __VLS_457({
    modelValue: (__VLS_ctx.editForm.onlineTime),
    ...{ style: {} },
}));
const __VLS_459 = __VLS_458({
    modelValue: (__VLS_ctx.editForm.onlineTime),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_458));
var __VLS_456;
var __VLS_336;
var __VLS_327;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-form']} */ ;
/** @type {__VLS_StyleScopedClasses['data-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['data-name']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-form']} */ ;
/** @type {__VLS_StyleScopedClasses['data-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['data-name']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
var __VLS_dollars;
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
; /* PartiallyEnd: #4569/main.vue */
