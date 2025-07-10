/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import { packageMockData } from '@/mock/coupon';
// 表格数据
const tableData = ref(packageMockData);
const loading = ref(false);
const searchText = ref('');
// 分页配置
const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
});
// 新建券包表单
const formRef = ref(null);
const createModalVisible = ref(false);
const detailModalVisible = ref(false);
const currentPackageDetail = ref([]);
const isViewMode = ref(false);
const formData = reactive({
    name: '',
    coupons: [],
    stockRule: 'sufficient',
    invalidRule: 'any',
    marketingTargets: []
});
// 表单校验规则
const rules = {
    name: [
        { required: true, message: '请输入券包名称' },
        { maxLength: 50, message: '券包名称不能超过50个字符' }
    ],
    coupons: [
        { required: true, message: '请选择券' },
        { type: 'array', min: 1, message: '至少选择一张券' }
    ],
    stockRule: [
        { required: true, message: '请选择库存管理规则' }
    ],
    invalidRule: [
        { required: true, message: '请选择失效规则' }
    ],
    marketingTargets: [
        { required: true, message: '请选择营销目标' },
        { type: 'array', min: 1, message: '至少选择一个营销目标' }
    ]
};
// 可选券列表
const couponOptions = ref([
    { label: '首贷满100减50券', value: '1', type: '首贷促动包' },
    { label: '首贷满200减100券', value: '2', type: '首贷促动包' },
    { label: '首贷满300减150券', value: '3', type: '首贷促动包' },
    { label: '复贷满500减100券', value: '4', type: '复贷促动包' },
    { label: '复贷满1000减200券', value: '5', type: '复贷促动包' },
    { label: '复贷满2000减400券', value: '6', type: '复贷促动包' }
]);
// 获取表格数据
const fetchTableData = async () => {
    loading.value = true;
    try {
        // 模拟数据
        tableData.value = [
            {
                id: 1,
                name: '新用户首贷大礼包',
                couponTypes: 3,
                couponCount: 150,
                createTime: '2023-06-18 10:00:00',
                status: 1,
                type: '首贷促动包',
                creator: '张三'
            },
            {
                id: 2,
                name: '老用户专享券包',
                couponTypes: 2,
                couponCount: 200,
                createTime: '2023-07-01 14:30:00',
                status: 1,
                type: '复贷促动包',
                creator: '李四'
            },
            {
                id: 3,
                name: '新手体验券包',
                couponTypes: 2,
                couponCount: 100,
                createTime: '2023-07-15 09:00:00',
                status: 0,
                type: '首贷促动包',
                creator: '王五'
            },
            {
                id: 4,
                name: '复贷优惠大礼包',
                couponTypes: 3,
                couponCount: 300,
                createTime: '2023-07-20 16:45:00',
                status: 1,
                type: '复贷促动包',
                creator: '赵六'
            }
        ];
        pagination.total = 100;
    }
    catch (error) {
        console.error('获取券包列表失败:', error);
        Message.error('获取券包列表失败');
    }
    finally {
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    pagination.current = 1;
    fetchTableData();
};
// 分页变化
const onPageChange = (current) => {
    pagination.current = current;
    fetchTableData();
};
const onPageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchTableData();
};
// 打开新建弹窗
const openCreateModal = () => {
    createModalVisible.value = true;
};
// 确认新建
const handleCreateConfirm = async () => {
    try {
        await formRef.value.validate();
        // TODO: 调用接口创建券包
        Message.success('创建成功');
        createModalVisible.value = false;
        fetchTableData();
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
// 取消新建
const handleCreateCancel = () => {
    formRef.value.resetFields();
    createModalVisible.value = false;
};
// 启用/停用券包
const handleStatusChange = async (record) => {
    try {
        // TODO: 调用接口修改状态
        Message.success(`${record.status === 1 ? '停用' : '启用'}成功`);
        fetchTableData();
    }
    catch (error) {
        console.error('修改状态失败:', error);
        Message.error('操作失败');
    }
};
// 删除券包
const handleDelete = async (record) => {
    try {
        // TODO: 调用接口删除券包
        Message.success('删除成功');
        fetchTableData();
    }
    catch (error) {
        console.error('删除失败:', error);
        Message.error('删除失败');
    }
};
// 处理行双击事件
const handleRowDblClick = (record) => {
    // 复用创建表单结构
    formData.value = {
        name: record.name,
        coupons: record.coupons || [],
        stockRule: record.stockRule || 'sufficient',
        invalidRule: record.invalidRule || 'any',
        marketingTargets: record.marketingTargets || ['app', 'miniprogram']
    };
    createModalVisible.value = true;
};
// 初始化加载数据
fetchTableData();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-package-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header" },
});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchText),
    placeholder: "搜索券包名称",
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.searchText),
    placeholder: "搜索券包名称",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onSearch: (__VLS_ctx.handleSearch)
};
var __VLS_7;
const __VLS_12 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.openCreateModal)
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
var __VLS_3;
const __VLS_24 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    ...{ 'onRowDblclick': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    ...{ 'onRowDblclick': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_32 = {
    onPageSizeChange: (__VLS_ctx.onPageSizeChange)
};
const __VLS_33 = {
    onRowDblclick: (__VLS_ctx.handleRowDblClick)
};
__VLS_27.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_34 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
        title: "券包名称",
        dataIndex: "name",
        width: (200),
    }));
    const __VLS_36 = __VLS_35({
        title: "券包名称",
        dataIndex: "name",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_37.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_37.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_38 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }));
        const __VLS_40 = __VLS_39({
            ...{ 'onClick': {} },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        let __VLS_42;
        let __VLS_43;
        let __VLS_44;
        const __VLS_45 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleRowDblClick(record);
            }
        };
        __VLS_41.slots.default;
        (record.name);
        var __VLS_41;
    }
    var __VLS_37;
    const __VLS_46 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
        title: "包含券种类",
        dataIndex: "couponTypes",
        width: (150),
    }));
    const __VLS_48 = __VLS_47({
        title: "包含券种类",
        dataIndex: "couponTypes",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    const __VLS_50 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        title: "可下发券数量",
        dataIndex: "couponCount",
        width: (120),
        align: "center",
    }));
    const __VLS_52 = __VLS_51({
        title: "可下发券数量",
        dataIndex: "couponCount",
        width: (120),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const __VLS_54 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        title: "创建时间",
        dataIndex: "createTime",
        width: (180),
    }));
    const __VLS_56 = __VLS_55({
        title: "创建时间",
        dataIndex: "createTime",
        width: (180),
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    const __VLS_58 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        title: "状态",
        dataIndex: "status",
        width: (120),
        align: "center",
    }));
    const __VLS_60 = __VLS_59({
        title: "状态",
        dataIndex: "status",
        width: (120),
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_61.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_61.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_62 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
            color: (record.status === 1 ? 'green' : 'red'),
        }));
        const __VLS_64 = __VLS_63({
            color: (record.status === 1 ? 'green' : 'red'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        __VLS_65.slots.default;
        (record.status === 1 ? '启用' : '停用');
        var __VLS_65;
    }
    var __VLS_61;
    const __VLS_66 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        title: "创建人",
        dataIndex: "creator",
        width: (120),
    }));
    const __VLS_68 = __VLS_67({
        title: "创建人",
        dataIndex: "creator",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    const __VLS_70 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        title: "操作",
        align: "center",
        width: (150),
    }));
    const __VLS_72 = __VLS_71({
        title: "操作",
        align: "center",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_73.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_73.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_74 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({}));
        const __VLS_76 = __VLS_75({}, ...__VLS_functionalComponentArgsRest(__VLS_75));
        __VLS_77.slots.default;
        const __VLS_78 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: (record.status === 1 ? 'danger' : 'success'),
        }));
        const __VLS_80 = __VLS_79({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: (record.status === 1 ? 'danger' : 'success'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        let __VLS_82;
        let __VLS_83;
        let __VLS_84;
        const __VLS_85 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleStatusChange(record);
            }
        };
        __VLS_81.slots.default;
        (record.status === 1 ? '停用' : '启用');
        var __VLS_81;
        const __VLS_86 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
            ...{ 'onClick': {} },
            type: "text",
            status: "danger",
            size: "small",
            disabled: (record.status === 1),
        }));
        const __VLS_88 = __VLS_87({
            ...{ 'onClick': {} },
            type: "text",
            status: "danger",
            size: "small",
            disabled: (record.status === 1),
        }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        let __VLS_90;
        let __VLS_91;
        let __VLS_92;
        const __VLS_93 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(record);
            }
        };
        __VLS_89.slots.default;
        var __VLS_89;
        var __VLS_77;
    }
    var __VLS_73;
}
var __VLS_27;
const __VLS_94 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.createModalVisible),
    title: (__VLS_ctx.isViewMode ? '券包详情' : '新建券包'),
}));
const __VLS_96 = __VLS_95({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.createModalVisible),
    title: (__VLS_ctx.isViewMode ? '券包详情' : '新建券包'),
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
let __VLS_98;
let __VLS_99;
let __VLS_100;
const __VLS_101 = {
    onOk: (__VLS_ctx.handleCreateConfirm)
};
const __VLS_102 = {
    onCancel: (__VLS_ctx.handleCreateCancel)
};
__VLS_97.slots.default;
const __VLS_103 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.isViewMode ? {} : __VLS_ctx.rules),
    ref: "formRef",
    layout: "horizontal",
    ...{ style: ({ width: '100%', maxWidth: '800px', margin: '0 auto' }) },
}));
const __VLS_105 = __VLS_104({
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.isViewMode ? {} : __VLS_ctx.rules),
    ref: "formRef",
    layout: "horizontal",
    ...{ style: ({ width: '100%', maxWidth: '800px', margin: '0 auto' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_107 = {};
__VLS_106.slots.default;
const __VLS_109 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    field: "name",
    label: "券包名称",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}));
const __VLS_111 = __VLS_110({
    field: "name",
    label: "券包名称",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
__VLS_112.slots.default;
const __VLS_113 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入券包名称",
    readonly: (__VLS_ctx.isViewMode),
    allowClear: true,
}));
const __VLS_115 = __VLS_114({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入券包名称",
    readonly: (__VLS_ctx.isViewMode),
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
var __VLS_112;
const __VLS_117 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    field: "coupons",
    label: "选择券",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}));
const __VLS_119 = __VLS_118({
    field: "coupons",
    label: "选择券",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
__VLS_120.slots.default;
const __VLS_121 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    modelValue: (__VLS_ctx.formData.coupons),
    placeholder: "请选择券",
    multiple: true,
    options: (__VLS_ctx.couponOptions),
    readonly: (__VLS_ctx.isViewMode),
    disabled: (__VLS_ctx.isViewMode),
    allowClear: true,
    allowSearch: true,
    maxTagCount: (3),
}));
const __VLS_123 = __VLS_122({
    modelValue: (__VLS_ctx.formData.coupons),
    placeholder: "请选择券",
    multiple: true,
    options: (__VLS_ctx.couponOptions),
    readonly: (__VLS_ctx.isViewMode),
    disabled: (__VLS_ctx.isViewMode),
    allowClear: true,
    allowSearch: true,
    maxTagCount: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
var __VLS_120;
const __VLS_125 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    field: "stockRule",
    label: "库存管理规则",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}));
const __VLS_127 = __VLS_126({
    field: "stockRule",
    label: "库存管理规则",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
__VLS_128.slots.default;
const __VLS_129 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    modelValue: (__VLS_ctx.formData.stockRule),
    disabled: (__VLS_ctx.isViewMode),
}));
const __VLS_131 = __VLS_130({
    modelValue: (__VLS_ctx.formData.stockRule),
    disabled: (__VLS_ctx.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
const __VLS_133 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    value: "sufficient",
}));
const __VLS_135 = __VLS_134({
    value: "sufficient",
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
__VLS_136.slots.default;
var __VLS_136;
const __VLS_137 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    value: "any",
}));
const __VLS_139 = __VLS_138({
    value: "any",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
var __VLS_140;
var __VLS_132;
var __VLS_128;
const __VLS_141 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    field: "invalidRule",
    label: "失效规则",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}));
const __VLS_143 = __VLS_142({
    field: "invalidRule",
    label: "失效规则",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
const __VLS_145 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    modelValue: (__VLS_ctx.formData.invalidRule),
    disabled: (__VLS_ctx.isViewMode),
}));
const __VLS_147 = __VLS_146({
    modelValue: (__VLS_ctx.formData.invalidRule),
    disabled: (__VLS_ctx.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
const __VLS_149 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    value: "any",
}));
const __VLS_151 = __VLS_150({
    value: "any",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
var __VLS_152;
const __VLS_153 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    value: "all",
}));
const __VLS_155 = __VLS_154({
    value: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_156.slots.default;
var __VLS_156;
var __VLS_148;
var __VLS_144;
const __VLS_157 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    field: "marketingTargets",
    label: "营销目标",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}));
const __VLS_159 = __VLS_158({
    field: "marketingTargets",
    label: "营销目标",
    validateTrigger: "blur",
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
__VLS_160.slots.default;
const __VLS_161 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
    modelValue: (__VLS_ctx.formData.marketingTargets),
    placeholder: "请选择营销目标",
    multiple: true,
    options: ([{ label: 'APP', value: 'app' }, { label: '小程序', value: 'miniprogram' }]),
    readonly: (__VLS_ctx.isViewMode),
    disabled: (__VLS_ctx.isViewMode),
    allowClear: true,
    maxTagCount: (2),
}));
const __VLS_163 = __VLS_162({
    modelValue: (__VLS_ctx.formData.marketingTargets),
    placeholder: "请选择营销目标",
    multiple: true,
    options: ([{ label: 'APP', value: 'app' }, { label: '小程序', value: 'miniprogram' }]),
    readonly: (__VLS_ctx.isViewMode),
    disabled: (__VLS_ctx.isViewMode),
    allowClear: true,
    maxTagCount: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
var __VLS_160;
var __VLS_106;
var __VLS_97;
const __VLS_165 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.detailModalVisible),
    title: "券包详情",
    footer: (false),
}));
const __VLS_167 = __VLS_166({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.detailModalVisible),
    title: "券包详情",
    footer: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
let __VLS_169;
let __VLS_170;
let __VLS_171;
const __VLS_172 = {
    onCancel: (() => __VLS_ctx.detailModalVisible = false)
};
__VLS_168.slots.default;
const __VLS_173 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    data: (__VLS_ctx.currentPackageDetail),
    layout: "inline-vertical",
    bordered: true,
}));
const __VLS_175 = __VLS_174({
    data: (__VLS_ctx.currentPackageDetail),
    layout: "inline-vertical",
    bordered: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
var __VLS_168;
/** @type {__VLS_StyleScopedClasses['coupon-package-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
// @ts-ignore
var __VLS_108 = __VLS_107;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            tableData: tableData,
            loading: loading,
            searchText: searchText,
            pagination: pagination,
            formRef: formRef,
            createModalVisible: createModalVisible,
            detailModalVisible: detailModalVisible,
            currentPackageDetail: currentPackageDetail,
            isViewMode: isViewMode,
            formData: formData,
            rules: rules,
            couponOptions: couponOptions,
            handleSearch: handleSearch,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
            openCreateModal: openCreateModal,
            handleCreateConfirm: handleCreateConfirm,
            handleCreateCancel: handleCreateCancel,
            handleStatusChange: handleStatusChange,
            handleDelete: handleDelete,
            handleRowDblClick: handleRowDblClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
