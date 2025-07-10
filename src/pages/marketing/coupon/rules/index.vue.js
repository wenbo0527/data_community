/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
// 表格数据
const tableData = ref([]);
const loading = ref(false);
// 分页配置
const pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
});
// 表单相关
const showCreateModal = ref(false);
const formRef = ref(null);
const editingRule = ref(null);
const formData = ref({
    name: '',
    description: '',
    limitType: 'user', // 'user' | 'daily' | 'weekly' | 'monthly'
    limitValue: 1,
    status: true
});
const rules = {
    name: [{ required: true, message: '请输入规则名称' }],
    description: [{ required: true, message: '请输入规则描述' }],
    limitValue: [{ required: true, message: '请输入限制值' }]
};
// 获取表格数据
const fetchData = async () => {
    if (loading.value)
        return;
    loading.value = true;
    try {
        // TODO: 调用接口获取数据
        const mockData = [
            {
                id: 1,
                name: '单用户限制',
                description: '限制单个用户领券数量',
                limitType: 'user',
                limitValue: 10,
                status: true,
                createTime: '2024-01-01 12:00:00'
            },
            {
                id: 2,
                name: '单用户单日限制',
                description: '限制每日领券总数量',
                limitType: 'daily',
                limitValue: 3,
                status: true,
                createTime: '2024-01-01 12:00:00'
            },
            {
                id: 3,
                name: '单用户单周限制',
                description: '限制每周领券总数量',
                limitType: 'weekly',
                limitValue: 10,
                status: true,
                createTime: '2024-01-01 12:00:00'
            },
            {
                id: 4,
                name: '单用户单月限制',
                description: '限制每月领券总数量',
                limitType: 'monthly',
                limitValue: 30,
                status: true,
                createTime: '2024-01-01 12:00:00'
            }
        ];
        tableData.value = mockData;
        pagination.value.total = 1;
    }
    catch (error) {
        Message.error('获取数据失败');
    }
    finally {
        loading.value = false;
    }
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
// 重置表单
const resetForm = () => {
    formRef.value?.resetFields();
    editingRule.value = null;
    showCreateModal.value = false;
};
// 提交表单
const handleSubmit = async () => {
    const { error } = await formRef.value.validate();
    if (error)
        return false;
    try {
        // TODO: 调用接口提交数据
        Message.success(editingRule.value ? '更新成功' : '创建成功');
        resetForm();
        fetchData();
        return true;
    }
    catch (error) {
        Message.error(editingRule.value ? '更新失败' : '创建失败');
        return false;
    }
};
// 编辑规则
const handleEdit = (record) => {
    editingRule.value = record;
    formData.value = { ...record };
    showCreateModal.value = true;
};
// 删除规则
const handleDelete = (record) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除规则「${record.name}」吗？`,
        onOk: async () => {
            try {
                // TODO: 调用删除接口
                Message.success('删除成功');
                await fetchData();
            }
            catch (error) {
                Message.error('删除失败');
            }
        }
    });
};
// 更新规则状态
const handleStatusChange = async (record, value) => {
    record.statusLoading = true;
    try {
        // TODO: 调用接口更新状态
        record.status = value;
        Message.success('状态更新成功');
    }
    catch (error) {
        record.status = !value; // 恢复状态
        Message.error('状态更新失败');
    }
    finally {
        record.statusLoading = false;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-rules-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreateModal = true;
    }
};
__VLS_7.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_7;
var __VLS_3;
const __VLS_16 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_18 = __VLS_17({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_24 = {
    onPageSizeChange: (__VLS_ctx.onPageSizeChange)
};
__VLS_19.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_25 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        title: "规则名称",
        dataIndex: "name",
    }));
    const __VLS_27 = __VLS_26({
        title: "规则名称",
        dataIndex: "name",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const __VLS_29 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        title: "规则描述",
        dataIndex: "description",
    }));
    const __VLS_31 = __VLS_30({
        title: "规则描述",
        dataIndex: "description",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    const __VLS_33 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        title: "规则类型",
        dataIndex: "limitType",
    }));
    const __VLS_35 = __VLS_34({
        title: "规则类型",
        dataIndex: "limitType",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_36.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        ({
            user: '单用户上限',
            daily: '单日上限',
            weekly: '单周上限',
            monthly: '单月上限'
        }[record.limitType]);
    }
    var __VLS_36;
    const __VLS_37 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        title: "限制值",
        dataIndex: "limitValue",
    }));
    const __VLS_39 = __VLS_38({
        title: "限制值",
        dataIndex: "limitValue",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const __VLS_41 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        title: "状态",
        dataIndex: "status",
    }));
    const __VLS_43 = __VLS_42({
        title: "状态",
        dataIndex: "status",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_44.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_45 = {}.ASwitch;
        /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
            ...{ 'onChange': {} },
            modelValue: (record.status),
            loading: (record.statusLoading),
        }));
        const __VLS_47 = __VLS_46({
            ...{ 'onChange': {} },
            modelValue: (record.status),
            loading: (record.statusLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        let __VLS_49;
        let __VLS_50;
        let __VLS_51;
        const __VLS_52 = {
            onChange: ((value) => __VLS_ctx.handleStatusChange(record, value))
        };
        var __VLS_48;
    }
    var __VLS_44;
    const __VLS_53 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        title: "创建时间",
        dataIndex: "createTime",
    }));
    const __VLS_55 = __VLS_54({
        title: "创建时间",
        dataIndex: "createTime",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const __VLS_57 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        title: "操作",
        fixed: "right",
        width: (150),
    }));
    const __VLS_59 = __VLS_58({
        title: "操作",
        fixed: "right",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_60.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_61 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({}));
        const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
        __VLS_64.slots.default;
        const __VLS_65 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_67 = __VLS_66({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        let __VLS_69;
        let __VLS_70;
        let __VLS_71;
        const __VLS_72 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(record);
            }
        };
        __VLS_68.slots.default;
        var __VLS_68;
        const __VLS_73 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_75 = __VLS_74({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        let __VLS_77;
        let __VLS_78;
        let __VLS_79;
        const __VLS_80 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(record);
            }
        };
        __VLS_76.slots.default;
        var __VLS_76;
        var __VLS_64;
    }
    var __VLS_60;
}
var __VLS_19;
const __VLS_81 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    ...{ 'onCancel': {} },
    ...{ 'onBeforeOk': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingRule ? '编辑规则' : '创建规则'),
}));
const __VLS_83 = __VLS_82({
    ...{ 'onCancel': {} },
    ...{ 'onBeforeOk': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: (__VLS_ctx.editingRule ? '编辑规则' : '创建规则'),
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
let __VLS_85;
let __VLS_86;
let __VLS_87;
const __VLS_88 = {
    onCancel: (__VLS_ctx.resetForm)
};
const __VLS_89 = {
    onBeforeOk: (__VLS_ctx.handleSubmit)
};
__VLS_84.slots.default;
const __VLS_90 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
}));
const __VLS_92 = __VLS_91({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_94 = {};
__VLS_93.slots.default;
const __VLS_96 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    field: "name",
    label: "规则名称",
    required: true,
}));
const __VLS_98 = __VLS_97({
    field: "name",
    label: "规则名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入规则名称",
    allowClear: true,
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入规则名称",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
var __VLS_99;
const __VLS_104 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    field: "description",
    label: "规则描述",
    required: true,
}));
const __VLS_106 = __VLS_105({
    field: "description",
    label: "规则描述",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入规则描述",
    maxLength: (200),
    showWordLimit: true,
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入规则描述",
    maxLength: (200),
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
var __VLS_107;
const __VLS_112 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    field: "limitType",
    label: "规则类型",
    required: true,
}));
const __VLS_114 = __VLS_113({
    field: "limitType",
    label: "规则类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.formData.limitType),
    placeholder: "请选择规则类型",
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.formData.limitType),
    placeholder: "请选择规则类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    value: "user",
}));
const __VLS_122 = __VLS_121({
    value: "user",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
var __VLS_123;
const __VLS_124 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    value: "daily",
}));
const __VLS_126 = __VLS_125({
    value: "daily",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
var __VLS_127;
const __VLS_128 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    value: "weekly",
}));
const __VLS_130 = __VLS_129({
    value: "weekly",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
var __VLS_131;
const __VLS_132 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    value: "monthly",
}));
const __VLS_134 = __VLS_133({
    value: "monthly",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
var __VLS_119;
var __VLS_115;
const __VLS_136 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    field: "limitValue",
    label: "限制值",
    required: true,
}));
const __VLS_138 = __VLS_137({
    field: "limitValue",
    label: "限制值",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.formData.limitValue),
    placeholder: (`请输入${{
        user: '单用户',
        daily: '单用户单日',
        weekly: '单用户单周',
        monthly: '单用户单月'
    }[__VLS_ctx.formData.limitType]}可获取的最大数量`),
    min: (1),
    max: (999999),
    step: (1),
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.formData.limitValue),
    placeholder: (`请输入${{
        user: '单用户',
        daily: '单用户单日',
        weekly: '单用户单周',
        monthly: '单用户单月'
    }[__VLS_ctx.formData.limitType]}可获取的最大数量`),
    min: (1),
    max: (999999),
    step: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
var __VLS_139;
const __VLS_144 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    field: "status",
    label: "是否生效",
}));
const __VLS_146 = __VLS_145({
    field: "status",
    label: "是否生效",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ASwitch;
/** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.formData.status),
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.formData.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
var __VLS_147;
var __VLS_93;
var __VLS_84;
/** @type {__VLS_StyleScopedClasses['coupon-rules-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
// @ts-ignore
var __VLS_95 = __VLS_94;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            tableData: tableData,
            loading: loading,
            pagination: pagination,
            showCreateModal: showCreateModal,
            formRef: formRef,
            editingRule: editingRule,
            formData: formData,
            rules: rules,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
            resetForm: resetForm,
            handleSubmit: handleSubmit,
            handleEdit: handleEdit,
            handleDelete: handleDelete,
            handleStatusChange: handleStatusChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
