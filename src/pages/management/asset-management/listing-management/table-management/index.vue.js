import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const selectedDatabase = ref('');
const selectedStatus = ref('');
const showCreateModal = ref(false);
const editingTable = ref(null);
const formRef = ref();
// 表格列配置
const columns = [
    {
        title: '表名',
        dataIndex: 'tableName',
        width: 200
    },
    {
        title: '数据库',
        dataIndex: 'database',
        width: 120
    },
    {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        tooltip: true
    },
    {
        title: '业务分类',
        dataIndex: 'category',
        width: 120
    },
    {
        title: '负责人',
        dataIndex: 'owner',
        width: 120
    },
    {
        title: '状态',
        dataIndex: 'status',
        slotName: 'status',
        width: 100
    },
    {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 180
    },
    {
        title: '操作',
        slotName: 'actions',
        width: 180,
        fixed: 'right'
    }
];
// 表格数据
const tableData = ref([
    {
        id: 1,
        tableName: 'user_profile',
        database: 'mysql',
        description: '用户基础信息表，包含用户的基本属性和画像数据',
        category: '用户数据',
        owner: '张三',
        status: 'active',
        createTime: '2024-01-15 10:30:00'
    },
    {
        id: 2,
        tableName: 'transaction_records',
        database: 'postgresql',
        description: '交易记录表，存储所有用户的交易明细',
        category: '交易数据',
        owner: '李四',
        status: 'active',
        createTime: '2024-01-10 14:20:00'
    },
    {
        id: 3,
        tableName: 'product_catalog',
        database: 'mysql',
        description: '产品目录表，包含所有产品的详细信息',
        category: '产品数据',
        owner: '王五',
        status: 'inactive',
        createTime: '2024-01-05 09:15:00'
    }
]);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 3,
    showTotal: true,
    showPageSize: true
});
// 表单数据
const formData = reactive({
    tableName: '',
    database: '',
    description: '',
    category: '',
    owner: ''
});
// 表单验证规则
const formRules = {
    tableName: [
        { required: true, message: '请输入表名' }
    ],
    database: [
        { required: true, message: '请选择数据库' }
    ],
    category: [
        { required: true, message: '请选择业务分类' }
    ],
    owner: [
        { required: true, message: '请输入负责人' }
    ]
};
// 方法
const handleSearch = () => {
    loading.value = true;
    // 模拟搜索
    setTimeout(() => {
        loading.value = false;
    }, 500);
};
const handlePageChange = (page) => {
    pagination.current = page;
};
const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
};
const getStatusColor = (status) => {
    const colorMap = {
        active: 'green',
        inactive: 'orange',
        archived: 'red'
    };
    return colorMap[status] || 'gray';
};
const getStatusText = (status) => {
    const textMap = {
        active: '活跃',
        inactive: '非活跃',
        archived: '已归档'
    };
    return textMap[status] || '未知';
};
const viewTable = (record) => {
    // 跳转到表详情页
    console.log('查看表:', record);
};
const editTable = (record) => {
    editingTable.value = record;
    Object.assign(formData, record);
    showCreateModal.value = true;
};
const deleteTable = (record) => {
    // 删除确认
    console.log('删除表:', record);
    Message.success('删除成功');
};
const handleSubmit = async () => {
    try {
        const valid = await formRef.value?.validate();
        if (valid) {
            // 提交表单
            console.log('提交表单:', formData);
            Message.success(editingTable.value ? '编辑成功' : '创建成功');
            showCreateModal.value = false;
            resetForm();
        }
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
const resetForm = () => {
    editingTable.value = null;
    Object.assign(formData, {
        tableName: '',
        database: '',
        description: '',
        category: '',
        owner: ''
    });
    formRef.value?.resetFields();
};
onMounted(() => {
    // 初始化数据
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreateModal = true;
    }
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
let __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_12 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    gutter: (16),
}));
const __VLS_14 = __VLS_13({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    span: (8),
}));
const __VLS_18 = __VLS_17({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索表名、描述",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索表名、描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onSearch: (__VLS_ctx.handleSearch)
};
let __VLS_23;
let __VLS_19;
const __VLS_28 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    span: (4),
}));
const __VLS_30 = __VLS_29({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedDatabase),
    placeholder: "选择数据库",
    allowClear: true,
}));
const __VLS_34 = __VLS_33({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedDatabase),
    placeholder: "选择数据库",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_35.slots.default;
const __VLS_40 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    value: "mysql",
}));
const __VLS_42 = __VLS_41({
    value: "mysql",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
let __VLS_43;
const __VLS_44 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    value: "postgresql",
}));
const __VLS_46 = __VLS_45({
    value: "postgresql",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
let __VLS_47;
const __VLS_48 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    value: "oracle",
}));
const __VLS_50 = __VLS_49({
    value: "oracle",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
let __VLS_51;
let __VLS_35;
let __VLS_31;
const __VLS_52 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    span: (4),
}));
const __VLS_54 = __VLS_53({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedStatus),
    placeholder: "状态",
    allowClear: true,
}));
const __VLS_58 = __VLS_57({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedStatus),
    placeholder: "状态",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_59.slots.default;
const __VLS_64 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: "active",
}));
const __VLS_66 = __VLS_65({
    value: "active",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
let __VLS_67;
const __VLS_68 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    value: "inactive",
}));
const __VLS_70 = __VLS_69({
    value: "inactive",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
let __VLS_71;
const __VLS_72 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "archived",
}));
const __VLS_74 = __VLS_73({
    value: "archived",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
let __VLS_75;
let __VLS_59;
let __VLS_55;
let __VLS_15;
const __VLS_76 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_78 = __VLS_77({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_84 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_79.slots.default;
{
    const { status: __VLS_thisSlot } = __VLS_79.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_85 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_87 = __VLS_86({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_88.slots.default;
    (__VLS_ctx.getStatusText(record.status));
    let __VLS_88;
}
{
    const { actions: __VLS_thisSlot } = __VLS_79.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_89 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({}));
    const __VLS_91 = __VLS_90({}, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_92.slots.default;
    const __VLS_93 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_95 = __VLS_94({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    let __VLS_97;
    let __VLS_98;
    let __VLS_99;
    const __VLS_100 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewTable(record);
        }
    };
    __VLS_96.slots.default;
    let __VLS_96;
    const __VLS_101 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_103 = __VLS_102({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    let __VLS_105;
    let __VLS_106;
    let __VLS_107;
    const __VLS_108 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editTable(record);
        }
    };
    __VLS_104.slots.default;
    let __VLS_104;
    const __VLS_109 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_111 = __VLS_110({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    let __VLS_113;
    let __VLS_114;
    let __VLS_115;
    const __VLS_116 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteTable(record);
        }
    };
    __VLS_112.slots.default;
    let __VLS_112;
    let __VLS_92;
}
let __VLS_79;
const __VLS_117 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingTable ? '编辑表' : '新建表'),
    width: "800px",
}));
const __VLS_119 = __VLS_118({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingTable ? '编辑表' : '新建表'),
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
let __VLS_121;
let __VLS_122;
let __VLS_123;
const __VLS_124 = {
    onOk: (__VLS_ctx.handleSubmit)
};
const __VLS_125 = {
    onCancel: (__VLS_ctx.resetForm)
};
__VLS_120.slots.default;
const __VLS_126 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    layout: "vertical",
}));
const __VLS_128 = __VLS_127({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
/** @type {typeof __VLS_ctx.formRef} */ 
const __VLS_130 = {};
__VLS_129.slots.default;
const __VLS_132 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    gutter: (16),
}));
const __VLS_134 = __VLS_133({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    span: (12),
}));
const __VLS_138 = __VLS_137({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    label: "表名",
    field: "tableName",
}));
const __VLS_142 = __VLS_141({
    label: "表名",
    field: "tableName",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    modelValue: (__VLS_ctx.formData.tableName),
    placeholder: "请输入表名",
}));
const __VLS_146 = __VLS_145({
    modelValue: (__VLS_ctx.formData.tableName),
    placeholder: "请输入表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_143;
let __VLS_139;
const __VLS_148 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    span: (12),
}));
const __VLS_150 = __VLS_149({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "数据库",
    field: "database",
}));
const __VLS_154 = __VLS_153({
    label: "数据库",
    field: "database",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.formData.database),
    placeholder: "选择数据库",
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.formData.database),
    placeholder: "选择数据库",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    value: "mysql",
}));
const __VLS_162 = __VLS_161({
    value: "mysql",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
let __VLS_163;
const __VLS_164 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    value: "postgresql",
}));
const __VLS_166 = __VLS_165({
    value: "postgresql",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
let __VLS_167;
const __VLS_168 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    value: "oracle",
}));
const __VLS_170 = __VLS_169({
    value: "oracle",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
let __VLS_171;
let __VLS_159;
let __VLS_155;
let __VLS_151;
let __VLS_135;
const __VLS_172 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    label: "表描述",
    field: "description",
}));
const __VLS_174 = __VLS_173({
    label: "表描述",
    field: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入表描述",
    rows: (3),
}));
const __VLS_178 = __VLS_177({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入表描述",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
let __VLS_175;
const __VLS_180 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "业务分类",
    field: "category",
}));
const __VLS_182 = __VLS_181({
    label: "业务分类",
    field: "category",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.formData.category),
    placeholder: "选择业务分类",
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.formData.category),
    placeholder: "选择业务分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    value: "user",
}));
const __VLS_190 = __VLS_189({
    value: "user",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
let __VLS_191;
const __VLS_192 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    value: "transaction",
}));
const __VLS_194 = __VLS_193({
    value: "transaction",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
let __VLS_195;
const __VLS_196 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    value: "product",
}));
const __VLS_198 = __VLS_197({
    value: "product",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
let __VLS_199;
const __VLS_200 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    value: "marketing",
}));
const __VLS_202 = __VLS_201({
    value: "marketing",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
let __VLS_203;
let __VLS_187;
let __VLS_183;
const __VLS_204 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    label: "负责人",
    field: "owner",
}));
const __VLS_206 = __VLS_205({
    label: "负责人",
    field: "owner",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
const __VLS_208 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
}));
const __VLS_210 = __VLS_209({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
let __VLS_207;
let __VLS_129;
let __VLS_120;
/** @type {__VLS_StyleScopedClasses['table-management']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['search-section']} */ 
// @ts-ignore
const __VLS_131 = __VLS_130;
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            loading: loading,
            searchKeyword: searchKeyword,
            selectedDatabase: selectedDatabase,
            selectedStatus: selectedStatus,
            showCreateModal: showCreateModal,
            editingTable: editingTable,
            formRef: formRef,
            columns: columns,
            tableData: tableData,
            pagination: pagination,
            formData: formData,
            formRules: formRules,
            handleSearch: handleSearch,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
            getStatusColor: getStatusColor,
            getStatusText: getStatusText,
            viewTable: viewTable,
            editTable: editTable,
            deleteTable: deleteTable,
            handleSubmit: handleSubmit,
            resetForm: resetForm,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
