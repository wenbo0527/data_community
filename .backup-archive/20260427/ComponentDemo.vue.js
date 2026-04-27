/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed } from 'vue';
import { Card as ACard, Button as AButton, Space as ASpace, Tag as ATag, IconPlus, IconDelete } from '@arco-design/web-vue';
import { BaseTable, BaseForm, BaseModal } from '@/components/common';
import { tableColumnTemplates, formItemTemplates } from '@/components/common';
import { businessMessage } from '@/utils/message';
export default (await import('vue')).defineComponent({
    name: 'ComponentDemo',
    components: {
        ACard,
        AButton,
        ASpace,
        ATag,
        IconPlus,
        IconDelete,
        BaseTable,
        BaseForm,
        BaseModal
    },
    setup() {
        // 表格相关
        const tableLoading = ref(false);
        const selectedRows = ref([]);
        const tableData = ref([
            {
                id: 1,
                name: '张三',
                email: 'zhangsan@example.com',
                department: '技术部',
                status: 1,
                createTime: '2024-01-01 10:00:00'
            },
            {
                id: 2,
                name: '李四',
                email: 'lisi@example.com',
                department: '产品部',
                status: 0,
                createTime: '2024-01-02 11:00:00'
            },
            {
                id: 3,
                name: '王五',
                email: 'wangwu@example.com',
                department: '运营部',
                status: 1,
                createTime: '2024-01-03 12:00:00'
            }
        ]);
        const tableColumns = [
            tableColumnTemplates.index(),
            tableColumnTemplates.text('name', '姓名', { width: 120 }),
            tableColumnTemplates.text('email', '邮箱', { width: 200 }),
            tableColumnTemplates.text('department', '部门', { width: 120 }),
            tableColumnTemplates.status('status', { width: 100 }),
            tableColumnTemplates.time('createTime', '创建时间'),
            tableColumnTemplates.action({ width: 150 })
        ];
        const tablePagination = {
            current: 1,
            pageSize: 10,
            total: 100,
            showTotal: true,
            showJumper: true,
            showPageSize: true
        };
        // 表单相关
        const showAddModal = ref(false);
        const submitLoading = ref(false);
        const formRef = ref();
        const formData = reactive({
            name: '',
            email: '',
            department: '',
            status: 1,
            description: ''
        });
        const formItems = [
            formItemTemplates.requiredInput('name', '姓名'),
            formItemTemplates.requiredInput('email', '邮箱', {
                rules: [
                    { required: true, message: '邮箱不能为空' },
                    { type: 'email', message: '邮箱格式不正确' }
                ]
            }),
            formItemTemplates.requiredSelect('department', '部门', [
                { label: '技术部', value: '技术部' },
                { label: '产品部', value: '产品部' },
                { label: '运营部', value: '运营部' },
                { label: '市场部', value: '市场部' }
            ]),
            formItemTemplates.radio('status', '状态', [
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 }
            ]),
            formItemTemplates.textarea('description', '描述')
        ];
        const formRules = {
            name: [{ required: true, message: '姓名不能为空' }],
            email: [
                { required: true, message: '邮箱不能为空' },
                { type: 'email', message: '邮箱格式不正确' }
            ],
            department: [{ required: true, message: '请选择部门' }]
        };
        // 查询表单
        const queryForm = reactive({
            keyword: '',
            department: '',
            status: '',
            dateRange: []
        });
        const queryFormItems = [
            formItemTemplates.input('keyword', '关键词', {
                placeholder: '请输入姓名或邮箱'
            }),
            formItemTemplates.select('department', '部门', [
                { label: '全部', value: '' },
                { label: '技术部', value: '技术部' },
                { label: '产品部', value: '产品部' },
                { label: '运营部', value: '运营部' },
                { label: '市场部', value: '市场部' }
            ]),
            formItemTemplates.select('status', '状态', [
                { label: '全部', value: '' },
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 }
            ]),
            formItemTemplates.daterange('dateRange', '创建时间')
        ];
        // 计算属性
        const getStatusColor = (status) => {
            return status === 1 ? 'green' : 'red';
        };
        const getStatusText = (status) => {
            return status === 1 ? '启用' : '禁用';
        };
        // 事件处理
        const handleTableRefresh = () => {
            tableLoading.value = true;
            setTimeout(() => {
                tableLoading.value = false;
                businessMessage.success('刷新成功');
            }, 1000);
        };
        const handlePageChange = (page) => {
            tablePagination.current = page;
            console.log('Page changed:', page);
        };
        const handleSelectionChange = (rowKeys, rowRecords) => {
            selectedRows.value = rowRecords;
            console.log('Selection changed:', rowKeys, rowRecords);
        };
        const handleEdit = (record) => {
            Object.assign(formData, record);
            showAddModal.value = true;
        };
        const handleDelete = (record) => {
            businessMessage.confirm('确定要删除这条记录吗？', () => {
                const index = tableData.value.findIndex(item => item.id === record.id);
                if (index > -1) {
                    tableData.value.splice(index, 1);
                    businessMessage.success('删除成功');
                }
            });
        };
        const handleBatchDelete = () => {
            if (selectedRows.value.length === 0) {
                businessMessage.warning('请选择要删除的记录');
                return;
            }
            businessMessage.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, () => {
                const ids = selectedRows.value.map(row => row.id);
                tableData.value = tableData.value.filter(item => !ids.includes(item.id));
                selectedRows.value = [];
                businessMessage.success('批量删除成功');
            });
        };
        const handleSubmit = async () => {
            try {
                submitLoading.value = true;
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (formData.id) {
                    // 编辑
                    const index = tableData.value.findIndex(item => item.id === formData.id);
                    if (index > -1) {
                        tableData.value[index] = { ...formData };
                    }
                    businessMessage.success('编辑成功');
                }
                else {
                    // 新增
                    const newRecord = {
                        ...formData,
                        id: Date.now(),
                        createTime: new Date().toLocaleString()
                    };
                    tableData.value.unshift(newRecord);
                    businessMessage.success('新增成功');
                }
                showAddModal.value = false;
                resetForm();
            }
            catch (error) {
                businessMessage.error('操作失败');
            }
            finally {
                submitLoading.value = false;
            }
        };
        const handleCancel = () => {
            showAddModal.value = false;
            resetForm();
        };
        const resetForm = () => {
            Object.assign(formData, {
                id: undefined,
                name: '',
                email: '',
                department: '',
                status: 1,
                description: ''
            });
            formRef.value?.resetFields();
        };
        const handleQuery = (data) => {
            console.log('Query data:', data);
            businessMessage.success('查询成功');
        };
        const handleReset = () => {
            Object.assign(queryForm, {
                keyword: '',
                department: '',
                status: '',
                dateRange: []
            });
            businessMessage.info('查询条件已重置');
        };
        return {
            // 表格
            tableData,
            tableColumns,
            tableLoading,
            tablePagination,
            selectedRows,
            // 表单
            showAddModal,
            submitLoading,
            formRef,
            formData,
            formItems,
            formRules,
            // 查询表单
            queryForm,
            queryFormItems,
            // 方法
            getStatusColor,
            getStatusText,
            handleTableRefresh,
            handlePageChange,
            handleSelectionChange,
            handleEdit,
            handleDelete,
            handleBatchDelete,
            handleSubmit,
            handleCancel,
            handleQuery,
            handleReset
        };
    }
});
const __VLS_ctx = {};
const __VLS_componentsOption = {
    ACard,
    AButton,
    ASpace,
    ATag,
    IconPlus,
    IconDelete,
    BaseTable,
    BaseForm,
    BaseModal
};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['demo-section']} */ 
/** @type {__VLS_StyleScopedClasses['demo-section']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "component-demo" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "基础组件使用示例",
    ...{ class: "demo-card" },
}));
const __VLS_2 = __VLS_1({
    title: "基础组件使用示例",
    ...{ class: "demo-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "demo-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_4 = {}.BaseTable;
/** @type {[typeof __VLS_components.BaseTable, typeof __VLS_components.BaseTable, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onRefresh': {} },
    ...{ 'onPageChange': {} },
    ...{ 'onSelectionChange': {} },
    data: (__VLS_ctx.tableData),
    columns: (__VLS_ctx.tableColumns),
    loading: (__VLS_ctx.tableLoading),
    pagination: (__VLS_ctx.tablePagination),
}));
const __VLS_6 = __VLS_5({
    ...{ 'onRefresh': {} },
    ...{ 'onPageChange': {} },
    ...{ 'onSelectionChange': {} },
    data: (__VLS_ctx.tableData),
    columns: (__VLS_ctx.tableColumns),
    loading: (__VLS_ctx.tableLoading),
    pagination: (__VLS_ctx.tablePagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onRefresh: (__VLS_ctx.handleTableRefresh)
};
const __VLS_12 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_13 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
__VLS_7.slots.default;
{
    const { 'toolbar-buttons': __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_14 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_18;
    let __VLS_19;
    let __VLS_20;
    const __VLS_21 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showAddModal = true;
        }
    };
    __VLS_17.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_17.slots;
        const __VLS_22 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({}));
        const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
    }
    let __VLS_17;
    const __VLS_26 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.selectedRows.length === 0),
    }));
    const __VLS_28 = __VLS_27({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.selectedRows.length === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_30;
    let __VLS_31;
    let __VLS_32;
    const __VLS_33 = {
        onClick: (__VLS_ctx.handleBatchDelete)
    };
    __VLS_29.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_29.slots;
        const __VLS_34 = {}.IconDelete;
        /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ 
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({}));
        const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
    }
    let __VLS_29;
}
{
    const { status: __VLS_thisSlot } = __VLS_7.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_38 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }));
    const __VLS_40 = __VLS_39({
        color: (__VLS_ctx.getStatusColor(record.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_41.slots.default;
    (__VLS_ctx.getStatusText(record.status));
    let __VLS_41;
}
{
    const { action: __VLS_thisSlot } = __VLS_7.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_42 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({}));
    const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
    __VLS_45.slots.default;
    const __VLS_46 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_48 = __VLS_47({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    let __VLS_50;
    let __VLS_51;
    let __VLS_52;
    const __VLS_53 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleEdit(record);
        }
    };
    __VLS_49.slots.default;
    let __VLS_49;
    const __VLS_54 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_56 = __VLS_55({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    let __VLS_58;
    let __VLS_59;
    let __VLS_60;
    const __VLS_61 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleDelete(record);
        }
    };
    __VLS_57.slots.default;
    let __VLS_57;
    let __VLS_45;
}
let __VLS_7;
const __VLS_62 = {}.BaseModal;
/** @type {[typeof __VLS_components.BaseModal, typeof __VLS_components.BaseModal, ]} */ 
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showAddModal),
    title: "新增用户",
    width: "600",
    okLoading: (__VLS_ctx.submitLoading),
}));
const __VLS_64 = __VLS_63({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showAddModal),
    title: "新增用户",
    width: "600",
    okLoading: (__VLS_ctx.submitLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_66;
let __VLS_67;
let __VLS_68;
const __VLS_69 = {
    onOk: (__VLS_ctx.handleSubmit)
};
const __VLS_70 = {
    onCancel: (__VLS_ctx.handleCancel)
};
__VLS_65.slots.default;
const __VLS_71 = {}.BaseForm;
/** @type {[typeof __VLS_components.BaseForm, ]} */ 
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    ref: "formRef",
    modelValue: (__VLS_ctx.formData),
    formItems: (__VLS_ctx.formItems),
    rules: (__VLS_ctx.formRules),
}));
const __VLS_73 = __VLS_72({
    ref: "formRef",
    modelValue: (__VLS_ctx.formData),
    formItems: (__VLS_ctx.formItems),
    rules: (__VLS_ctx.formRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
/** @type {typeof __VLS_ctx.formRef} */ 
const __VLS_75 = {};
let __VLS_74;
let __VLS_65;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "demo-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_77 = {}.BaseForm;
/** @type {[typeof __VLS_components.BaseForm, ]} */ 
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    ...{ 'onSubmit': {} },
    ...{ 'onReset': {} },
    modelValue: (__VLS_ctx.queryForm),
    formItems: (__VLS_ctx.queryFormItems),
    layout: "inline",
    showReset: (true),
    submitText: "查询",
    resetText: "重置",
}));
const __VLS_79 = __VLS_78({
    ...{ 'onSubmit': {} },
    ...{ 'onReset': {} },
    modelValue: (__VLS_ctx.queryForm),
    formItems: (__VLS_ctx.queryFormItems),
    layout: "inline",
    showReset: (true),
    submitText: "查询",
    resetText: "重置",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
let __VLS_81;
let __VLS_82;
let __VLS_83;
const __VLS_84 = {
    onSubmit: (__VLS_ctx.handleQuery)
};
const __VLS_85 = {
    onReset: (__VLS_ctx.handleReset)
};
let __VLS_80;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['component-demo']} */ 
/** @type {__VLS_StyleScopedClasses['demo-card']} */ 
/** @type {__VLS_StyleScopedClasses['demo-section']} */ 
/** @type {__VLS_StyleScopedClasses['demo-section']} */ 
// @ts-ignore
const __VLS_76 = __VLS_75;
let __VLS_dollars;
let __VLS_self;
