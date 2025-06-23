/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const selectedType = ref('');
const selectedStatus = ref('');
const showCreateModal = ref(false);
const editingExternalData = ref(null);
const formRef = ref();
// 表格列配置
const columns = [
    {
        title: '数源名称',
        dataIndex: 'name',
        slotName: 'name',
        width: 180
    },
    {
        title: '数源种类',
        dataIndex: 'dataCategory',
        width: 120
    },
    {
        title: '接口类型',
        dataIndex: 'interfaceType',
        width: 120
    },
    {
        title: '接口标签',
        dataIndex: 'interfaceTag',
        width: 100
    },
    {
        title: '落库表名',
        dataIndex: 'targetTable',
        width: 150
    },
    {
        title: '供应商',
        dataIndex: 'provider',
        width: 120
    },
    {
        title: '单价（元/条）',
        dataIndex: 'unitPrice',
        width: 120
    },
    {
        title: '负责人',
        dataIndex: 'owner',
        width: 100
    },
    {
        title: '状态',
        dataIndex: 'status',
        slotName: 'status',
        width: 100
    },
    {
        title: '最后更新',
        dataIndex: 'updateTime',
        width: 160
    },
    {
        title: '操作',
        slotName: 'actions',
        width: 220,
        fixed: 'right'
    }
];
// 模拟表格数据
const tableData = ref([
    {
        id: 1,
        name: '央行征信数据',
        dataCategory: '征信数据',
        interfaceType: 'REST API',
        interfaceTag: '主接口',
        targetTable: 'credit_data',
        provider: '人民银行征信中心',
        unitPrice: 2.5000,
        owner: '张三',
        description: '个人征信报告、企业征信信息等',
        dataManager: '李管理',
        updateFrequency: '实时',
        dataManagementDescription: '通过API实时获取征信数据，确保数据时效性',
        status: 'active',
        updateTime: '2024-01-15 10:30:00'
    },
    {
        id: 2,
        name: '风控评分模型',
        dataCategory: '风控数据',
        interfaceType: '数据库直连',
        interfaceTag: '主接口',
        targetTable: 'risk_score',
        provider: '同盾科技',
        unitPrice: 1.2000,
        owner: '李四',
        description: '客户风险评分、反欺诈模型结果',
        dataManager: '王管理',
        updateFrequency: '日更新',
        dataManagementDescription: '每日凌晨2点通过数据库直连更新风控评分',
        status: 'active',
        updateTime: '2024-01-14 16:45:00'
    },
    {
        id: 3,
        name: '运营商数据',
        dataCategory: '运营商数据',
        interfaceType: 'SFTP',
        interfaceTag: '备接口',
        targetTable: 'telecom_data',
        provider: '中国移动',
        unitPrice: 0.9200,
        owner: '王五',
        description: '用户通话记录、流量使用、位置信息等',
        dataManager: '赵管理',
        updateFrequency: '每周',
        dataManagementDescription: '每周一上午通过SFTP传输文件',
        status: 'draft',
        updateTime: '2024-01-10 14:20:00'
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
    name: '',
    dataCategory: '',
    interfaceType: '',
    interfaceTag: '',
    targetTable: '',
    provider: '',
    unitPrice: 0,
    owner: '',
    description: '',
    dataManager: '',
    updateFrequency: '',
    dataManagementDescription: ''
});
// 表单验证规则
const formRules = {
    name: [
        { required: true, message: '请输入数源名称' }
    ],
    dataCategory: [
        { required: true, message: '请选择数源种类' }
    ],
    interfaceType: [
        { required: true, message: '请选择接口类型' }
    ],
    interfaceTag: [
        { required: true, message: '请选择接口标签' }
    ],
    targetTable: [
        { required: true, message: '请输入落库表名' }
    ],
    provider: [
        { required: true, message: '请输入供应商名称' }
    ],
    unitPrice: [
        { required: true, message: '请输入单价' },
        { type: 'number', min: 0, message: '单价不能小于0' }
    ],
    owner: [
        { required: true, message: '请输入负责人' }
    ],
    description: [
        { required: true, message: '请输入描述信息' }
    ]
};
// 方法
const handleSearch = () => {
    loading.value = true;
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
        draft: 'gray'
    };
    return colorMap[status] || 'gray';
};
const getStatusText = (status) => {
    const textMap = {
        active: '启用',
        inactive: '停用',
        draft: '草稿'
    };
    return textMap[status] || '未知';
};
const viewExternalDataDetail = (record) => {
    editingExternalData.value = { ...record, isViewMode: true };
    Object.assign(formData, record);
    showCreateModal.value = true;
};
const editExternalData = (record) => {
    editingExternalData.value = record;
    Object.assign(formData, record);
    showCreateModal.value = true;
};
const copyExternalData = (record) => {
    const copiedData = { ...record };
    copiedData.name = `${record.name}_副本`;
    delete copiedData.id;
    editingExternalData.value = null;
    Object.assign(formData, copiedData);
    showCreateModal.value = true;
    Message.success('已复制数源，请修改相关信息');
};
const deleteExternalData = (record) => {
    console.log('删除外数:', record);
    Message.success('删除成功');
};
const handleSubmit = async () => {
    // 如果是查看模式，直接关闭弹窗
    if (editingExternalData.value?.isViewMode) {
        showCreateModal.value = false;
        resetForm();
        return;
    }
    try {
        const valid = await formRef.value?.validate();
        if (valid) {
            console.log('提交表单:', formData);
            Message.success(editingExternalData.value ? '编辑成功' : '注册成功');
            showCreateModal.value = false;
            resetForm();
        }
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
const resetForm = () => {
    editingExternalData.value = null;
    Object.assign(formData, {
        name: '',
        dataCategory: '',
        interfaceType: '',
        interfaceTag: '',
        targetTable: '',
        provider: '',
        unitPrice: 0,
        owner: '',
        description: '',
        dataManager: '',
        updateFrequency: '',
        dataManagementDescription: ''
    });
    formRef.value?.resetFields();
};
onMounted(() => {
    // 初始化数据
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "external-data-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
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
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
const __VLS_12 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    gutter: (16),
}));
const __VLS_14 = __VLS_13({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    span: (8),
}));
const __VLS_18 = __VLS_17({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索数源名称、供应商",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索数源名称、供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onSearch: (__VLS_ctx.handleSearch)
};
var __VLS_23;
var __VLS_19;
const __VLS_28 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    span: (4),
}));
const __VLS_30 = __VLS_29({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedType),
    placeholder: "数源种类",
    allowClear: true,
}));
const __VLS_34 = __VLS_33({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedType),
    placeholder: "数源种类",
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
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    value: "征信数据",
}));
const __VLS_42 = __VLS_41({
    value: "征信数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
var __VLS_43;
const __VLS_44 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    value: "风控数据",
}));
const __VLS_46 = __VLS_45({
    value: "风控数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
var __VLS_47;
const __VLS_48 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    value: "运营商数据",
}));
const __VLS_50 = __VLS_49({
    value: "运营商数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
var __VLS_51;
const __VLS_52 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    value: "政务数据",
}));
const __VLS_54 = __VLS_53({
    value: "政务数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
var __VLS_55;
const __VLS_56 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    value: "金融数据",
}));
const __VLS_58 = __VLS_57({
    value: "金融数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
var __VLS_59;
const __VLS_60 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    value: "其他",
}));
const __VLS_62 = __VLS_61({
    value: "其他",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
var __VLS_63;
var __VLS_35;
var __VLS_31;
const __VLS_64 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    span: (4),
}));
const __VLS_66 = __VLS_65({
    span: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedStatus),
    placeholder: "状态",
    allowClear: true,
}));
const __VLS_70 = __VLS_69({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedStatus),
    placeholder: "状态",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_71.slots.default;
const __VLS_76 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "active",
}));
const __VLS_78 = __VLS_77({
    value: "active",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
const __VLS_80 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    value: "inactive",
}));
const __VLS_82 = __VLS_81({
    value: "inactive",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
var __VLS_83;
const __VLS_84 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    value: "draft",
}));
const __VLS_86 = __VLS_85({
    value: "draft",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
var __VLS_87;
var __VLS_71;
var __VLS_67;
var __VLS_15;
const __VLS_88 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_90 = __VLS_89({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
let __VLS_92;
let __VLS_93;
let __VLS_94;
const __VLS_95 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_96 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_91.slots.default;
{
    const { name: __VLS_thisSlot } = __VLS_91.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_97 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
        ...{ 'onClick': {} },
        type: "text",
    }));
    const __VLS_99 = __VLS_98({
        ...{ 'onClick': {} },
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    let __VLS_101;
    let __VLS_102;
    let __VLS_103;
    const __VLS_104 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewExternalDataDetail(record);
        }
    };
    __VLS_100.slots.default;
    (record.name);
    var __VLS_100;
}
{
    const { status: __VLS_thisSlot } = __VLS_91.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_105 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_107 = __VLS_106({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    __VLS_108.slots.default;
    (__VLS_ctx.getStatusText(record.status));
    var __VLS_108;
}
{
    const { actions: __VLS_thisSlot } = __VLS_91.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_109 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({}));
    const __VLS_111 = __VLS_110({}, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_112.slots.default;
    const __VLS_113 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_115 = __VLS_114({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    let __VLS_117;
    let __VLS_118;
    let __VLS_119;
    const __VLS_120 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editExternalData(record);
        }
    };
    __VLS_116.slots.default;
    var __VLS_116;
    const __VLS_121 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_123 = __VLS_122({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    let __VLS_125;
    let __VLS_126;
    let __VLS_127;
    const __VLS_128 = {
        onClick: (...[$event]) => {
            __VLS_ctx.copyExternalData(record);
        }
    };
    __VLS_124.slots.default;
    var __VLS_124;
    const __VLS_129 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_131 = __VLS_130({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    let __VLS_133;
    let __VLS_134;
    let __VLS_135;
    const __VLS_136 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteExternalData(record);
        }
    };
    __VLS_132.slots.default;
    var __VLS_132;
    var __VLS_112;
}
var __VLS_91;
const __VLS_137 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingExternalData?.isViewMode ? '数源详情' : (__VLS_ctx.editingExternalData ? '编辑数源' : '注册外部数据')),
    width: "1000px",
    okText: (__VLS_ctx.editingExternalData?.isViewMode ? '关闭' : '确定'),
    cancelText: (__VLS_ctx.editingExternalData?.isViewMode ? '' : '取消'),
    hideCancel: (__VLS_ctx.editingExternalData?.isViewMode),
}));
const __VLS_139 = __VLS_138({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingExternalData?.isViewMode ? '数源详情' : (__VLS_ctx.editingExternalData ? '编辑数源' : '注册外部数据')),
    width: "1000px",
    okText: (__VLS_ctx.editingExternalData?.isViewMode ? '关闭' : '确定'),
    cancelText: (__VLS_ctx.editingExternalData?.isViewMode ? '' : '取消'),
    hideCancel: (__VLS_ctx.editingExternalData?.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
let __VLS_141;
let __VLS_142;
let __VLS_143;
const __VLS_144 = {
    onOk: (__VLS_ctx.handleSubmit)
};
const __VLS_145 = {
    onCancel: (__VLS_ctx.resetForm)
};
__VLS_140.slots.default;
const __VLS_146 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.editingExternalData?.isViewMode ? {} : __VLS_ctx.formRules),
    layout: "vertical",
    disabled: (__VLS_ctx.editingExternalData?.isViewMode),
}));
const __VLS_148 = __VLS_147({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.editingExternalData?.isViewMode ? {} : __VLS_ctx.formRules),
    layout: "vertical",
    disabled: (__VLS_ctx.editingExternalData?.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_150 = {};
__VLS_149.slots.default;
const __VLS_152 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    orientation: "left",
}));
const __VLS_154 = __VLS_153({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
var __VLS_155;
const __VLS_156 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    gutter: (16),
}));
const __VLS_158 = __VLS_157({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    span: (12),
}));
const __VLS_162 = __VLS_161({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    label: "数源名称",
    field: "name",
}));
const __VLS_166 = __VLS_165({
    label: "数源名称",
    field: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入数源名称",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_170 = __VLS_169({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入数源名称",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
var __VLS_167;
var __VLS_163;
const __VLS_172 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    span: (12),
}));
const __VLS_174 = __VLS_173({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "数源种类",
    field: "dataCategory",
}));
const __VLS_178 = __VLS_177({
    label: "数源种类",
    field: "dataCategory",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    modelValue: (__VLS_ctx.formData.dataCategory),
    placeholder: "请选择数源种类",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_182 = __VLS_181({
    modelValue: (__VLS_ctx.formData.dataCategory),
    placeholder: "请选择数源种类",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    value: "征信数据",
}));
const __VLS_186 = __VLS_185({
    value: "征信数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
var __VLS_187;
const __VLS_188 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    value: "风控数据",
}));
const __VLS_190 = __VLS_189({
    value: "风控数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
var __VLS_191;
const __VLS_192 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    value: "运营商数据",
}));
const __VLS_194 = __VLS_193({
    value: "运营商数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
var __VLS_195;
const __VLS_196 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    value: "政务数据",
}));
const __VLS_198 = __VLS_197({
    value: "政务数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
var __VLS_199;
const __VLS_200 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    value: "金融数据",
}));
const __VLS_202 = __VLS_201({
    value: "金融数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
var __VLS_203;
const __VLS_204 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    value: "其他",
}));
const __VLS_206 = __VLS_205({
    value: "其他",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
var __VLS_207;
var __VLS_183;
var __VLS_179;
var __VLS_175;
var __VLS_159;
const __VLS_208 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    gutter: (16),
}));
const __VLS_210 = __VLS_209({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
const __VLS_212 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    span: (8),
}));
const __VLS_214 = __VLS_213({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
const __VLS_216 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    label: "接口类型",
    field: "interfaceType",
}));
const __VLS_218 = __VLS_217({
    label: "接口类型",
    field: "interfaceType",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    modelValue: (__VLS_ctx.formData.interfaceType),
    placeholder: "请选择接口类型",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_222 = __VLS_221({
    modelValue: (__VLS_ctx.formData.interfaceType),
    placeholder: "请选择接口类型",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
const __VLS_224 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    value: "REST API",
}));
const __VLS_226 = __VLS_225({
    value: "REST API",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
var __VLS_227;
const __VLS_228 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    value: "SOAP",
}));
const __VLS_230 = __VLS_229({
    value: "SOAP",
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
var __VLS_231;
const __VLS_232 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    value: "FTP",
}));
const __VLS_234 = __VLS_233({
    value: "FTP",
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
var __VLS_235;
const __VLS_236 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    value: "SFTP",
}));
const __VLS_238 = __VLS_237({
    value: "SFTP",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
var __VLS_239;
const __VLS_240 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    value: "数据库直连",
}));
const __VLS_242 = __VLS_241({
    value: "数据库直连",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
var __VLS_243;
const __VLS_244 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    value: "文件传输",
}));
const __VLS_246 = __VLS_245({
    value: "文件传输",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
var __VLS_247;
var __VLS_223;
var __VLS_219;
var __VLS_215;
const __VLS_248 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    span: (8),
}));
const __VLS_250 = __VLS_249({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    label: "接口标签",
    field: "interfaceTag",
}));
const __VLS_254 = __VLS_253({
    label: "接口标签",
    field: "interfaceTag",
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    modelValue: (__VLS_ctx.formData.interfaceTag),
    placeholder: "请选择接口标签",
}));
const __VLS_258 = __VLS_257({
    modelValue: (__VLS_ctx.formData.interfaceTag),
    placeholder: "请选择接口标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
const __VLS_260 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    value: "主接口",
}));
const __VLS_262 = __VLS_261({
    value: "主接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
var __VLS_263;
const __VLS_264 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    value: "备接口",
}));
const __VLS_266 = __VLS_265({
    value: "备接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
var __VLS_267;
var __VLS_259;
var __VLS_255;
var __VLS_251;
var __VLS_211;
const __VLS_268 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    gutter: (16),
}));
const __VLS_270 = __VLS_269({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
const __VLS_272 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    span: (8),
}));
const __VLS_274 = __VLS_273({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
__VLS_275.slots.default;
const __VLS_276 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    label: "供应商",
    field: "provider",
}));
const __VLS_278 = __VLS_277({
    label: "供应商",
    field: "provider",
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
const __VLS_280 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    modelValue: (__VLS_ctx.formData.provider),
    placeholder: "请输入供应商名称",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_282 = __VLS_281({
    modelValue: (__VLS_ctx.formData.provider),
    placeholder: "请输入供应商名称",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
var __VLS_279;
var __VLS_275;
const __VLS_284 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    span: (8),
}));
const __VLS_286 = __VLS_285({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
const __VLS_288 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    label: "负责人",
    field: "owner",
}));
const __VLS_290 = __VLS_289({
    label: "负责人",
    field: "owner",
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
const __VLS_292 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}));
const __VLS_294 = __VLS_293({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请输入负责人",
    disabled: (__VLS_ctx.editingExternalData && !__VLS_ctx.editingExternalData.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
var __VLS_291;
var __VLS_287;
var __VLS_271;
const __VLS_296 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    gutter: (16),
}));
const __VLS_298 = __VLS_297({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
const __VLS_300 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    span: (12),
}));
const __VLS_302 = __VLS_301({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
const __VLS_304 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    label: "落库表名",
    field: "targetTable",
}));
const __VLS_306 = __VLS_305({
    label: "落库表名",
    field: "targetTable",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
const __VLS_308 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    modelValue: (__VLS_ctx.formData.targetTable),
    placeholder: "请输入落库表名",
}));
const __VLS_310 = __VLS_309({
    modelValue: (__VLS_ctx.formData.targetTable),
    placeholder: "请输入落库表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
var __VLS_307;
var __VLS_303;
const __VLS_312 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    span: (12),
}));
const __VLS_314 = __VLS_313({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
const __VLS_316 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    label: "单价（元/条）",
    field: "unitPrice",
}));
const __VLS_318 = __VLS_317({
    label: "单价（元/条）",
    field: "unitPrice",
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
const __VLS_320 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
    modelValue: (__VLS_ctx.formData.unitPrice),
    placeholder: "请输入单价",
    precision: (4),
    min: (0),
    max: (9999.9999),
    ...{ style: {} },
}));
const __VLS_322 = __VLS_321({
    modelValue: (__VLS_ctx.formData.unitPrice),
    placeholder: "请输入单价",
    precision: (4),
    min: (0),
    max: (9999.9999),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_321));
__VLS_323.slots.default;
{
    const { suffix: __VLS_thisSlot } = __VLS_323.slots;
}
var __VLS_323;
var __VLS_319;
var __VLS_315;
var __VLS_299;
const __VLS_324 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    gutter: (16),
}));
const __VLS_326 = __VLS_325({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
const __VLS_328 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    span: (24),
}));
const __VLS_330 = __VLS_329({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
__VLS_331.slots.default;
const __VLS_332 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
    label: "描述信息",
    field: "description",
}));
const __VLS_334 = __VLS_333({
    label: "描述信息",
    field: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
__VLS_335.slots.default;
const __VLS_336 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入描述信息",
    rows: (3),
}));
const __VLS_338 = __VLS_337({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入描述信息",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_337));
var __VLS_335;
var __VLS_331;
var __VLS_327;
const __VLS_340 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
    orientation: "left",
}));
const __VLS_342 = __VLS_341({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
__VLS_343.slots.default;
var __VLS_343;
const __VLS_344 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
    gutter: (16),
}));
const __VLS_346 = __VLS_345({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_345));
__VLS_347.slots.default;
const __VLS_348 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
    span: (12),
}));
const __VLS_350 = __VLS_349({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
__VLS_351.slots.default;
const __VLS_352 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
    label: "数据管理员",
    field: "dataManager",
}));
const __VLS_354 = __VLS_353({
    label: "数据管理员",
    field: "dataManager",
}, ...__VLS_functionalComponentArgsRest(__VLS_353));
__VLS_355.slots.default;
const __VLS_356 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
    modelValue: (__VLS_ctx.formData.dataManager),
    placeholder: "请输入数据管理员",
}));
const __VLS_358 = __VLS_357({
    modelValue: (__VLS_ctx.formData.dataManager),
    placeholder: "请输入数据管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_357));
var __VLS_355;
var __VLS_351;
const __VLS_360 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
    span: (12),
}));
const __VLS_362 = __VLS_361({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_361));
__VLS_363.slots.default;
const __VLS_364 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
    label: "数据更新频率",
    field: "updateFrequency",
}));
const __VLS_366 = __VLS_365({
    label: "数据更新频率",
    field: "updateFrequency",
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
__VLS_367.slots.default;
const __VLS_368 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({
    modelValue: (__VLS_ctx.formData.updateFrequency),
    placeholder: "选择更新频率",
}));
const __VLS_370 = __VLS_369({
    modelValue: (__VLS_ctx.formData.updateFrequency),
    placeholder: "选择更新频率",
}, ...__VLS_functionalComponentArgsRest(__VLS_369));
__VLS_371.slots.default;
const __VLS_372 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
    value: "实时",
}));
const __VLS_374 = __VLS_373({
    value: "实时",
}, ...__VLS_functionalComponentArgsRest(__VLS_373));
__VLS_375.slots.default;
var __VLS_375;
const __VLS_376 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
    value: "日更新",
}));
const __VLS_378 = __VLS_377({
    value: "日更新",
}, ...__VLS_functionalComponentArgsRest(__VLS_377));
__VLS_379.slots.default;
var __VLS_379;
const __VLS_380 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
    value: "离线T+1",
}));
const __VLS_382 = __VLS_381({
    value: "离线T+1",
}, ...__VLS_functionalComponentArgsRest(__VLS_381));
__VLS_383.slots.default;
var __VLS_383;
const __VLS_384 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
    value: "每周",
}));
const __VLS_386 = __VLS_385({
    value: "每周",
}, ...__VLS_functionalComponentArgsRest(__VLS_385));
__VLS_387.slots.default;
var __VLS_387;
const __VLS_388 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({
    value: "每月",
}));
const __VLS_390 = __VLS_389({
    value: "每月",
}, ...__VLS_functionalComponentArgsRest(__VLS_389));
__VLS_391.slots.default;
var __VLS_391;
var __VLS_371;
var __VLS_367;
var __VLS_363;
var __VLS_347;
const __VLS_392 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
    gutter: (16),
}));
const __VLS_394 = __VLS_393({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_393));
__VLS_395.slots.default;
const __VLS_396 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
    span: (24),
}));
const __VLS_398 = __VLS_397({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_397));
__VLS_399.slots.default;
const __VLS_400 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({
    label: "数据管理说明",
}));
const __VLS_402 = __VLS_401({
    label: "数据管理说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_401));
__VLS_403.slots.default;
const __VLS_404 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_405 = __VLS_asFunctionalComponent(__VLS_404, new __VLS_404({
    modelValue: (__VLS_ctx.formData.dataManagementDescription),
    placeholder: "请输入数据管理相关说明",
    rows: (3),
}));
const __VLS_406 = __VLS_405({
    modelValue: (__VLS_ctx.formData.dataManagementDescription),
    placeholder: "请输入数据管理相关说明",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_405));
var __VLS_403;
var __VLS_399;
var __VLS_395;
var __VLS_149;
var __VLS_140;
/** @type {__VLS_StyleScopedClasses['external-data-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
// @ts-ignore
var __VLS_151 = __VLS_150;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            loading: loading,
            searchKeyword: searchKeyword,
            selectedType: selectedType,
            selectedStatus: selectedStatus,
            showCreateModal: showCreateModal,
            editingExternalData: editingExternalData,
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
            viewExternalDataDetail: viewExternalDataDetail,
            editExternalData: editExternalData,
            copyExternalData: copyExternalData,
            deleteExternalData: deleteExternalData,
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
; /* PartiallyEnd: #4569/main.vue */
