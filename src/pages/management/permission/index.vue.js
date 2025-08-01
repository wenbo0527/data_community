import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconSafe } from '@arco-design/web-vue/es/icon';
// 表格数据
const tableData = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const showCreateModal = ref(false);
const formRef = ref();
// 分页配置
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
});
// 表单数据
const formData = ref({
    type: '数据权限',
    name: '',
    reason: ''
});
const rules = {
    type: [{ required: true, message: '请选择权限类型' }],
    name: [{ required: true, message: '请输入权限名称' }],
    reason: [{ required: true, message: '请输入申请理由' }]
};
// 获取状态颜色
const getStatusColor = (status) => {
    const colorMap = {
        '待审批': 'blue',
        '已通过': 'green',
        '已拒绝': 'red'
    };
    return colorMap[status] || 'blue';
};
// 获取表格数据
const fetchData = async () => {
    loading.value = true;
    try {
        // TODO: 调用接口获取数据
        tableData.value = [
            { id: 'P001', name: '客户数据访问权限', type: '数据权限', applyTime: '2023-05-10', status: '已通过' },
            { id: 'P002', name: '报表系统访问权限', type: '应用权限', applyTime: '2023-05-15', status: '待审批' }
        ];
        pagination.value.total = 2;
    }
    catch (error) {
        Message.error('获取数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    pagination.value.current = 1;
    fetchData();
};
// 分页变化
const onPageChange = (current) => {
    pagination.value.current = current;
    fetchData();
};
const onPageSizeChange = (pageSize) => {
    pagination.value.pageSize = pageSize;
    pagination.value.current = 1;
    fetchData();
};
// 查看详情
const handleViewDetail = (record) => {
    // TODO: 实现详情查看逻辑
    Message.info(`查看权限详情: ${record.name}`);
};
// 撤回申请
const handleWithdraw = (record) => {
    // TODO: 实现撤回逻辑
    Message.success(`已撤回权限申请: ${record.name}`);
    fetchData();
};
// 重置表单
const resetForm = () => {
    formRef.value?.resetFields();
    showCreateModal.value = false;
};
// 提交表单
const handleSubmit = async () => {
    const { error } = await formRef.value.validate();
    if (error)
        return false;
    try {
        // TODO: 调用接口提交数据
        Message.success('申请成功');
        resetForm();
        fetchData();
        return true;
    }
    catch (error) {
        Message.error('申请失败');
        return false;
    }
};
onMounted(() => {
    fetchData();
});
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
const __VLS_9 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    gutter: ([24, 24]),
}));
const __VLS_11 = __VLS_10({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    span: (24),
}));
const __VLS_15 = __VLS_14({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_20.slots;
    const __VLS_21 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
    const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    const __VLS_25 = {}.IconSafe;
    /** @type {[typeof __VLS_components.IconSafe, typeof __VLS_components.iconSafe, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
    const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
    var __VLS_24;
}
{
    const { extra: __VLS_thisSlot } = __VLS_20.slots;
    const __VLS_29 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({}));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    const __VLS_33 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchKeyword),
        placeholder: "搜索权限名称",
        ...{ style: {} },
    }));
    const __VLS_35 = __VLS_34({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchKeyword),
        placeholder: "搜索权限名称",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    let __VLS_37;
    let __VLS_38;
    let __VLS_39;
    const __VLS_40 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    var __VLS_36;
    const __VLS_41 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_43 = __VLS_42({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_45;
    let __VLS_46;
    let __VLS_47;
    const __VLS_48 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showCreateModal = true;
        }
    };
    __VLS_44.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_44.slots;
        const __VLS_49 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({}));
        const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
    }
    var __VLS_44;
    var __VLS_32;
}
const __VLS_53 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    gutter: ([24, 24]),
}));
const __VLS_55 = __VLS_54({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableData))) {
    const __VLS_57 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        span: (6),
        key: (item.id),
    }));
    const __VLS_59 = __VLS_58({
        span: (6),
        key: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    const __VLS_61 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        hoverable: true,
    }));
    const __VLS_63 = __VLS_62({
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_64.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_64.slots;
        const __VLS_65 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }));
        const __VLS_67 = __VLS_66({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        let __VLS_69;
        let __VLS_70;
        let __VLS_71;
        const __VLS_72 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleViewDetail(item);
            }
        };
        __VLS_68.slots.default;
        (item.name);
        var __VLS_68;
    }
    {
        const { extra: __VLS_thisSlot } = __VLS_64.slots;
        const __VLS_73 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            color: (item.type === '数据权限' ? 'blue' : 'green'),
        }));
        const __VLS_75 = __VLS_74({
            color: (item.type === '数据权限' ? 'blue' : 'green'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        __VLS_76.slots.default;
        (item.type);
        var __VLS_76;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (item.applyTime);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_77 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        color: (item.status === '已通过' ? 'green' : item.status === '已拒绝' ? 'red' : 'orange'),
    }));
    const __VLS_79 = __VLS_78({
        color: (item.status === '已通过' ? 'green' : item.status === '已拒绝' ? 'red' : 'orange'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    __VLS_80.slots.default;
    (item.status);
    var __VLS_80;
    const __VLS_81 = {}.ADivider;
    /** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({}));
    const __VLS_83 = __VLS_82({}, ...__VLS_functionalComponentArgsRest(__VLS_82));
    const __VLS_85 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
    const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_88.slots.default;
    const __VLS_89 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        type: "text",
        size: "small",
    }));
    const __VLS_91 = __VLS_90({
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_92.slots.default;
    var __VLS_92;
    const __VLS_93 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        type: "text",
        size: "small",
        status: "warning",
    }));
    const __VLS_95 = __VLS_94({
        type: "text",
        size: "small",
        status: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    __VLS_96.slots.default;
    var __VLS_96;
    var __VLS_88;
    var __VLS_64;
    var __VLS_60;
}
var __VLS_56;
var __VLS_20;
var __VLS_16;
var __VLS_12;
var __VLS_8;
const __VLS_97 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    ...{ 'onCancel': {} },
    ...{ 'onBeforeOk': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: "申请权限",
    footer: (false),
    width: (800),
}));
const __VLS_99 = __VLS_98({
    ...{ 'onCancel': {} },
    ...{ 'onBeforeOk': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: "申请权限",
    footer: (false),
    width: (800),
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
let __VLS_101;
let __VLS_102;
let __VLS_103;
const __VLS_104 = {
    onCancel: (__VLS_ctx.resetForm)
};
const __VLS_105 = {
    onBeforeOk: (__VLS_ctx.handleSubmit)
};
__VLS_100.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "create-permission-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
const __VLS_106 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '720px' }) },
}));
const __VLS_108 = __VLS_107({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '720px' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_110 = {};
__VLS_109.slots.default;
const __VLS_112 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ class: "section-card" },
}));
const __VLS_114 = __VLS_113({
    ...{ class: "section-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.AGrid;
/** @type {[typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, typeof __VLS_components.AGrid, typeof __VLS_components.aGrid, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}));
const __VLS_118 = __VLS_117({
    cols: (2),
    colGap: (16),
    rowGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    field: "type",
    label: "权限类型",
    required: true,
}));
const __VLS_126 = __VLS_125({
    field: "type",
    label: "权限类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.formData.type),
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.formData.type),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    value: "数据权限",
}));
const __VLS_134 = __VLS_133({
    value: "数据权限",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
const __VLS_136 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    value: "应用权限",
}));
const __VLS_138 = __VLS_137({
    value: "应用权限",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
var __VLS_139;
var __VLS_131;
var __VLS_127;
var __VLS_123;
const __VLS_140 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    field: "name",
    label: "权限名称",
    required: true,
}));
const __VLS_146 = __VLS_145({
    field: "name",
    label: "权限名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入权限名称",
    allowClear: true,
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入权限名称",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
var __VLS_147;
var __VLS_143;
const __VLS_152 = {}.AGridItem;
/** @type {[typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, typeof __VLS_components.AGridItem, typeof __VLS_components.aGridItem, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    span: (24),
}));
const __VLS_154 = __VLS_153({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    field: "reason",
    label: "申请理由",
    required: true,
}));
const __VLS_158 = __VLS_157({
    field: "reason",
    label: "申请理由",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    modelValue: (__VLS_ctx.formData.reason),
    placeholder: "请输入申请理由",
    maxLength: (200),
    showWordLimit: true,
}));
const __VLS_162 = __VLS_161({
    modelValue: (__VLS_ctx.formData.reason),
    placeholder: "请输入申请理由",
    maxLength: (200),
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
var __VLS_159;
var __VLS_155;
var __VLS_119;
var __VLS_115;
var __VLS_109;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
const __VLS_164 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({}));
const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_170 = __VLS_169({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
let __VLS_172;
let __VLS_173;
let __VLS_174;
const __VLS_175 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_171.slots.default;
var __VLS_171;
const __VLS_176 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    ...{ 'onClick': {} },
}));
const __VLS_178 = __VLS_177({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
let __VLS_180;
let __VLS_181;
let __VLS_182;
const __VLS_183 = {
    onClick: (__VLS_ctx.resetForm)
};
__VLS_179.slots.default;
var __VLS_179;
var __VLS_167;
var __VLS_100;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['create-permission-container']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
// @ts-ignore
var __VLS_111 = __VLS_110;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconSafe: IconSafe,
            tableData: tableData,
            searchKeyword: searchKeyword,
            showCreateModal: showCreateModal,
            formRef: formRef,
            formData: formData,
            rules: rules,
            handleSearch: handleSearch,
            handleViewDetail: handleViewDetail,
            resetForm: resetForm,
            handleSubmit: handleSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
