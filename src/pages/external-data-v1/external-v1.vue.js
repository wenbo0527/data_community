import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { generateExternalProductData } from '@/mock/external-data';
const router = useRouter();
const columns = [
    {
        title: '接口编号',
        dataIndex: 'interfaceId',
        width: 120
    },
    {
        title: '接口名称',
        dataIndex: 'interfaceName',
        width: 150
    },
    {
        title: '数源种类',
        dataIndex: 'dataType',
        width: 100
    },
    {
        title: '供应商',
        dataIndex: 'supplier',
        width: 120
    },
    {
        title: '单价(元/次)',
        dataIndex: 'price',
        width: 100
    },
    {
        title: '操作',
        slotName: 'actions',
        width: 80
    }
];
const tableData = ref([]);
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
});
const filterForm = ref({
    dataType: '不限',
    dataCategory: '',
    supplier: ''
});
const selectedProduct = ref('');
const searchText = ref('');
const loadData = async () => {
    const mockData = generateExternalProductData('产品A', 10).map((item, index) => ({
        interfaceId: `EXT-${index + 1}`,
        interfaceName: `外部接口${index + 1}`,
        dataType: ['核验类', '评分类', '标签类'][index % 3],
        supplier: ['供应商A', '供应商B', '供应商C'][index % 3],
        price: Number(item.pricePerCall),
        dataName: item.product
    }));
    tableData.value = mockData;
    pagination.value.total = mockData.length;
};
const handleSearch = () => {
    pagination.value.current = 1;
    loadData();
};
const handleTableChange = (page) => {
    pagination.value.current = page;
    loadData();
};
const showDetail = (record) => {
    router.push(`/discovery/external/detail/${record.interfaceId}`);
};
// 初始化加载数据
loadData();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "content" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    defaultActiveKey: "1",
    type: "rounded",
}));
const __VLS_11 = __VLS_10({
    defaultActiveKey: "1",
    type: "rounded",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    key: "1",
    title: "接口页面",
}));
const __VLS_15 = __VLS_14({
    key: "1",
    title: "接口页面",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    gutter: ([24, 24]),
}));
const __VLS_19 = __VLS_18({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    span: (24),
}));
const __VLS_23 = __VLS_22({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
const __VLS_25 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    title: "接口列表",
    bordered: (false),
}));
const __VLS_27 = __VLS_26({
    title: "接口列表",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_28.slots;
    const __VLS_29 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({}));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    const __VLS_33 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        modelValue: (__VLS_ctx.selectedProduct),
        placeholder: "关联产品",
        ...{ style: {} },
        allowClear: true,
    }));
    const __VLS_35 = __VLS_34({
        modelValue: (__VLS_ctx.selectedProduct),
        placeholder: "关联产品",
        ...{ style: {} },
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableData))) {
        const __VLS_37 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }));
        const __VLS_39 = __VLS_38({
            key: (item.interfaceId),
            value: (item.interfaceId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        __VLS_40.slots.default;
        (item.dataName);
        var __VLS_40;
    }
    var __VLS_36;
    const __VLS_41 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }));
    const __VLS_43 = __VLS_42({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_45;
    let __VLS_46;
    let __VLS_47;
    const __VLS_48 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    var __VLS_44;
    var __VLS_32;
}
const __VLS_49 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}));
const __VLS_51 = __VLS_50({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
const __VLS_53 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    field: "dataType",
    label: "数源种类",
}));
const __VLS_55 = __VLS_54({
    field: "dataType",
    label: "数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
const __VLS_57 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}));
const __VLS_59 = __VLS_58({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
const __VLS_61 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    value: "不限",
}));
const __VLS_63 = __VLS_62({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
var __VLS_64;
const __VLS_65 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    value: "核验类",
}));
const __VLS_67 = __VLS_66({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
var __VLS_68;
const __VLS_69 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    value: "评分类",
}));
const __VLS_71 = __VLS_70({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
var __VLS_72;
const __VLS_73 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    value: "标签类",
}));
const __VLS_75 = __VLS_74({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
var __VLS_76;
const __VLS_77 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    value: "名单类",
}));
const __VLS_79 = __VLS_78({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
var __VLS_80;
const __VLS_81 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    value: "价格评估类",
}));
const __VLS_83 = __VLS_82({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
var __VLS_84;
var __VLS_60;
var __VLS_56;
const __VLS_85 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    field: "dataCategory",
    label: "数源分类",
}));
const __VLS_87 = __VLS_86({
    field: "dataCategory",
    label: "数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
const __VLS_89 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_91 = __VLS_90({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
const __VLS_93 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    value: "不限",
}));
const __VLS_95 = __VLS_94({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
var __VLS_96;
const __VLS_97 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    value: "选项2",
}));
const __VLS_99 = __VLS_98({
    value: "选项2",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
var __VLS_100;
const __VLS_101 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    value: "选项3",
}));
const __VLS_103 = __VLS_102({
    value: "选项3",
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
__VLS_104.slots.default;
var __VLS_104;
const __VLS_105 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    value: "选项4",
}));
const __VLS_107 = __VLS_106({
    value: "选项4",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_108.slots.default;
var __VLS_108;
var __VLS_92;
var __VLS_88;
const __VLS_109 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    field: "supplier",
    label: "供应商",
}));
const __VLS_111 = __VLS_110({
    field: "supplier",
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
__VLS_112.slots.default;
const __VLS_113 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_115 = __VLS_114({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
var __VLS_112;
var __VLS_52;
const __VLS_117 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    ...{ 'onChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_119 = __VLS_118({
    ...{ 'onChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
let __VLS_121;
let __VLS_122;
let __VLS_123;
const __VLS_124 = {
    onChange: (__VLS_ctx.handleTableChange)
};
__VLS_120.slots.default;
{
    const { actions: __VLS_thisSlot } = __VLS_120.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_125 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
        ...{ 'onClick': {} },
        type: "text",
    }));
    const __VLS_127 = __VLS_126({
        ...{ 'onClick': {} },
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    let __VLS_129;
    let __VLS_130;
    let __VLS_131;
    const __VLS_132 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showDetail(record);
        }
    };
    __VLS_128.slots.default;
    var __VLS_128;
}
var __VLS_120;
var __VLS_28;
var __VLS_24;
var __VLS_20;
var __VLS_16;
var __VLS_12;
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-form']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            columns: columns,
            tableData: tableData,
            pagination: pagination,
            filterForm: filterForm,
            selectedProduct: selectedProduct,
            searchText: searchText,
            handleSearch: handleSearch,
            handleTableChange: handleTableChange,
            showDetail: showDetail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
