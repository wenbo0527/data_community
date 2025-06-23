/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, reactive, h, computed } from 'vue';
import { IconDownload, IconDelete } from '@arco-design/web-vue/es/icon';
import { Message, Modal } from '@arco-design/web-vue';
// 表格列配置
const columns = [
    { title: '用户ID', dataIndex: 'userId', width: 120, align: 'center' },
    { title: '券实例ID', dataIndex: 'couponId', width: 120, align: 'center' },
    { title: '券模版ID', dataIndex: 'templateId', width: 120, align: 'center' },
    { title: '券名称', dataIndex: 'couponName', width: 200 },
    {
        title: '券类型',
        dataIndex: 'couponType',
        width: 100,
        align: 'center',
        customCell: ({ record }) => h('a-tag', {
            color: record.couponType === 'discount' ? 'blue' : record.couponType === 'reduction' ? 'green' : 'orange'
        }, record.couponType === 'discount' ? '折扣券' : record.couponType === 'reduction' ? '满减券' : '立减券')
    },
    {
        title: '有效期',
        dataIndex: 'validPeriod',
        width: 200,
        customCell: ({ record }) => `${record.startTime} ~ ${record.endTime}`
    },
    {
        title: '券状态',
        dataIndex: 'status',
        width: 100,
        align: 'center',
        customCell: ({ record }) => h('a-tag', {
            color: {
                'received': 'blue',
                'locked': 'orange',
                'used': 'green',
                'expired': 'red',
                'invalid': 'gray'
            }[record.status]
        }, {
            'received': '已领取',
            'locked': '已锁定',
            'used': '已核销',
            'expired': '已过期',
            'invalid': '已作废'
        }[record.status])
    }
];
// 搜索表单数据
const formModel = reactive({
    couponId: '',
    templateId: '',
    userId: '',
    packageId: '',
    status: ''
});
// 表格数据
const tableData = ref([]);
const loading = ref(false);
const selectedRowKeys = ref([]);
const selectedRows = ref([]);
// 行选择配置
const rowSelection = computed(() => ({
    type: 'checkbox',
    showCheckedAll: true,
    selectedRowKeys: selectedRowKeys.value,
    onChange: (rowKeys, rows) => {
        selectedRowKeys.value = rowKeys;
        selectedRows.value = rows;
    },
    checkStrictly: false,
    onlyCurrent: false
}));
// 分页配置
const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true
});
// 获取库存统计数据
const fetchInventoryData = async () => {
    loading.value = true;
    try {
        // TODO: 调用接口获取数据
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 模拟数据
        tableData.value = [
            {
                userId: '10001',
                couponId: 'CP001',
                templateId: 'TPL001',
                couponName: '新人专享券',
                couponType: 'discount',
                startTime: '2024-01-01',
                endTime: '2024-12-31',
                status: 'received'
            },
            {
                userId: '10002',
                couponId: 'CP002',
                templateId: 'TPL002',
                couponName: '满100减10券',
                couponType: 'reduction',
                startTime: '2024-01-01',
                endTime: '2024-12-31',
                status: 'locked'
            },
            {
                userId: '10003',
                couponId: 'CP003',
                templateId: 'TPL003',
                couponName: '立减50券',
                couponType: 'instant',
                startTime: '2024-01-01',
                endTime: '2024-12-31',
                status: 'used'
            },
            {
                userId: '10004',
                couponId: 'CP004',
                templateId: 'TPL004',
                couponName: '周年庆券',
                couponType: 'discount',
                startTime: '2023-01-01',
                endTime: '2023-12-31',
                status: 'expired'
            },
            {
                userId: '10005',
                couponId: 'CP005',
                templateId: 'TPL005',
                couponName: '限时特惠券',
                couponType: 'reduction',
                startTime: '2024-01-01',
                endTime: '2024-12-31',
                status: 'invalid'
            }
        ];
        pagination.total = 100;
    }
    catch (error) {
        Message.error('获取库存统计数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    pagination.current = 1;
    fetchInventoryData();
};
// 批量撤回
const withdrawLoading = ref(false);
const handleBatchWithdraw = async () => {
    if (!selectedRows.value.length) {
        Message.warning('请先选择要撤回的券');
        return;
    }
    const validStatus = ['received', 'locked'];
    const withdrawableCoupons = selectedRows.value.filter(item => validStatus.includes(item.status));
    if (withdrawableCoupons.length !== selectedRows.value.length) {
        Modal.confirm({
            title: '部分券不可撤回',
            content: `当前选中${selectedRows.value.length}张券，其中${withdrawableCoupons.length}张可撤回`,
            okText: '继续撤回可操作券',
            cancelText: '取消操作',
            onOk: () => executeWithdraw(withdrawableCoupons)
        });
    }
    else {
        await executeWithdraw(withdrawableCoupons);
    }
};
const executeWithdraw = async (coupons) => {
    try {
        withdrawLoading.value = true;
        // 实际调用API处应替换为真实接口
        await Promise.all(coupons.map(coupon => withdrawCouponAPI(coupon.couponId)));
        await fetchInventoryData();
        selectedRowKeys.value = [];
        selectedRows.value = [];
        Message.success(`成功撤回${coupons.length}张券`);
    }
    catch (error) {
        Message.error(`撤回失败: ${error.message}`);
    }
    finally {
        withdrawLoading.value = false;
    }
};
// 重置表单
const resetForm = () => {
    formModel.couponId = '';
    formModel.templateId = '';
    formModel.userId = '';
    formModel.packageId = '';
    formModel.status = '';
    handleSearch();
};
// 分页变化
const onPageChange = (current) => {
    pagination.current = current;
    fetchInventoryData();
};
// 每页条数变化
const onPageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchInventoryData();
};
// 行点击事件
const handleRowClick = (record) => {
    const index = selectedRowKeys.value.indexOf(record.couponId);
    if (index === -1) {
        selectedRowKeys.value = [...selectedRowKeys.value, record.couponId];
        selectedRows.value = [...selectedRows.value, record];
    }
    else {
        selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== record.couponId);
        selectedRows.value = selectedRows.value.filter(row => row.couponId !== record.couponId);
    }
    // 验证选中状态
    const validStatus = ['received', 'locked'];
    const hasInvalidSelection = selectedRows.value.some(item => !validStatus.includes(item.status));
    if (hasInvalidSelection) {
        Message.warning('只能选择状态为"已领取"或"已锁定"的券');
    }
};
// 初始化加载数据
fetchInventoryData();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-inventory-container" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "search-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "search-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onSubmit': {} },
    model: (__VLS_ctx.formModel),
    layout: "horizontal",
    ...{ style: ({ width: '100%' }) },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onSubmit': {} },
    model: (__VLS_ctx.formModel),
    layout: "horizontal",
    ...{ style: ({ width: '100%' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onSubmit: (__VLS_ctx.handleSearch)
};
__VLS_7.slots.default;
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
const __VLS_20 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    field: "couponId",
    label: "券实例ID",
}));
const __VLS_22 = __VLS_21({
    field: "couponId",
    label: "券实例ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.formModel.couponId),
    placeholder: "请输入券实例ID",
    allowClear: true,
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.formModel.couponId),
    placeholder: "请输入券实例ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_23;
var __VLS_19;
const __VLS_28 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    span: (8),
}));
const __VLS_30 = __VLS_29({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    field: "templateId",
    label: "券模版",
}));
const __VLS_34 = __VLS_33({
    field: "templateId",
    label: "券模版",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.formModel.templateId),
    placeholder: "请输入券模版ID",
    allowClear: true,
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.formModel.templateId),
    placeholder: "请输入券模版ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_35;
var __VLS_31;
const __VLS_40 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    span: (8),
}));
const __VLS_42 = __VLS_41({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    field: "userId",
    label: "用户ID",
}));
const __VLS_46 = __VLS_45({
    field: "userId",
    label: "用户ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.formModel.userId),
    placeholder: "请输入用户ID",
    allowClear: true,
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.formModel.userId),
    placeholder: "请输入用户ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_47;
var __VLS_43;
const __VLS_52 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    span: (8),
}));
const __VLS_54 = __VLS_53({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    field: "packageId",
    label: "券包ID",
}));
const __VLS_58 = __VLS_57({
    field: "packageId",
    label: "券包ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.formModel.packageId),
    placeholder: "请输入券包ID",
    allowClear: true,
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.formModel.packageId),
    placeholder: "请输入券包ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_59;
var __VLS_55;
const __VLS_64 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    span: (8),
}));
const __VLS_66 = __VLS_65({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    field: "status",
    label: "券状态",
}));
const __VLS_70 = __VLS_69({
    field: "status",
    label: "券状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    modelValue: (__VLS_ctx.formModel.status),
    placeholder: "请选择券状态",
    allowClear: true,
}));
const __VLS_74 = __VLS_73({
    modelValue: (__VLS_ctx.formModel.status),
    placeholder: "请选择券状态",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "received",
}));
const __VLS_78 = __VLS_77({
    value: "received",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
const __VLS_80 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    value: "locked",
}));
const __VLS_82 = __VLS_81({
    value: "locked",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
var __VLS_83;
const __VLS_84 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    value: "used",
}));
const __VLS_86 = __VLS_85({
    value: "used",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
var __VLS_87;
const __VLS_88 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    value: "expired",
}));
const __VLS_90 = __VLS_89({
    value: "expired",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
var __VLS_91;
const __VLS_92 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    value: "invalid",
}));
const __VLS_94 = __VLS_93({
    value: "invalid",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
var __VLS_95;
var __VLS_75;
var __VLS_71;
var __VLS_67;
var __VLS_15;
const __VLS_96 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    span: (24),
    ...{ style: {} },
}));
const __VLS_102 = __VLS_101({
    span: (24),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    ...{ 'onClick': {} },
}));
const __VLS_110 = __VLS_109({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
let __VLS_112;
let __VLS_113;
let __VLS_114;
const __VLS_115 = {
    onClick: (__VLS_ctx.resetForm)
};
__VLS_111.slots.default;
var __VLS_111;
const __VLS_116 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    type: "primary",
    htmlType: "submit",
}));
const __VLS_118 = __VLS_117({
    type: "primary",
    htmlType: "submit",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
var __VLS_119;
var __VLS_107;
var __VLS_103;
var __VLS_99;
var __VLS_7;
var __VLS_3;
const __VLS_120 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    ...{ class: "table-card" },
}));
const __VLS_122 = __VLS_121({
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_123.slots;
}
{
    const { extra: __VLS_thisSlot } = __VLS_123.slots;
    const __VLS_124 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({}));
    const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    const __VLS_128 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        ...{ 'onClick': {} },
        type: "primary",
        status: "danger",
        disabled: (!__VLS_ctx.selectedRows.length || __VLS_ctx.withdrawLoading),
        loading: (__VLS_ctx.withdrawLoading),
    }));
    const __VLS_130 = __VLS_129({
        ...{ 'onClick': {} },
        type: "primary",
        status: "danger",
        disabled: (!__VLS_ctx.selectedRows.length || __VLS_ctx.withdrawLoading),
        loading: (__VLS_ctx.withdrawLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    let __VLS_132;
    let __VLS_133;
    let __VLS_134;
    const __VLS_135 = {
        onClick: (__VLS_ctx.handleBatchWithdraw)
    };
    __VLS_131.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_131.slots;
        const __VLS_136 = {}.IconDelete;
        /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
        const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
    }
    var __VLS_131;
    const __VLS_140 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        type: "text",
    }));
    const __VLS_142 = __VLS_141({
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_143.slots;
        const __VLS_144 = {}.IconDownload;
        /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
        const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    }
    var __VLS_143;
    var __VLS_127;
}
const __VLS_148 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    ...{ 'onRowClick': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    bordered: ({ cell: true, wrapper: true }),
    stripe: true,
    rowSelection: (__VLS_ctx.rowSelection),
}));
const __VLS_150 = __VLS_149({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    ...{ 'onRowClick': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    bordered: ({ cell: true, wrapper: true }),
    stripe: true,
    rowSelection: (__VLS_ctx.rowSelection),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
let __VLS_152;
let __VLS_153;
let __VLS_154;
const __VLS_155 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_156 = {
    onPageSizeChange: (__VLS_ctx.onPageSizeChange)
};
const __VLS_157 = {
    onRowClick: (__VLS_ctx.handleRowClick)
};
__VLS_151.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_151.slots;
    for (const [column] of __VLS_getVForSourceType((__VLS_ctx.columns))) {
        const __VLS_158 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
            ...(column),
        }));
        const __VLS_160 = __VLS_159({
            ...(column),
        }, ...__VLS_functionalComponentArgsRest(__VLS_159));
        __VLS_161.slots.default;
        if (column.customCell) {
            {
                const { cell: __VLS_thisSlot } = __VLS_161.slots;
                const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
                const __VLS_162 = ((column.customCell));
                // @ts-ignore
                const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
                    record: (record),
                }));
                const __VLS_164 = __VLS_163({
                    record: (record),
                }, ...__VLS_functionalComponentArgsRest(__VLS_163));
            }
        }
        var __VLS_161;
    }
}
var __VLS_151;
var __VLS_123;
/** @type {__VLS_StyleScopedClasses['coupon-inventory-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconDownload: IconDownload,
            IconDelete: IconDelete,
            columns: columns,
            formModel: formModel,
            tableData: tableData,
            loading: loading,
            selectedRows: selectedRows,
            rowSelection: rowSelection,
            pagination: pagination,
            handleSearch: handleSearch,
            withdrawLoading: withdrawLoading,
            handleBatchWithdraw: handleBatchWithdraw,
            resetForm: resetForm,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
            handleRowClick: handleRowClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
