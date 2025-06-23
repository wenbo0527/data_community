/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconLeft, IconEdit, IconStar, IconStarFill } from '@arco-design/web-vue/es/icon';
// 已注册接口列表
const registeredInterfaces = ref([
    { value: 'interface1', label: '主接口1' },
    { value: 'interface2', label: '主接口2' },
    { value: 'interface3', label: '主接口3' }
]);
const route = useRoute();
// 备用接口表格列配置
const backupInterfaceColumns = [
    {
        title: '接口名称',
        dataIndex: 'name'
    },
    {
        title: '接口地址',
        dataIndex: 'url'
    },
    {
        title: '操作',
        slotName: 'operations'
    }
];
// 添加备用接口
const handleAddBackupInterface = () => {
    editForm.value.backupInterfaces.push({
        name: '',
        url: ''
    });
};
// 删除备用接口
const handleRemoveBackupInterface = (index) => {
    editForm.value.backupInterfaces.splice(index, 1);
};
// 计算基本信息
const combinedBasicInfo = computed(() => [
    {
        label: '接口编号',
        value: dataDetail.value.interfaceId
    },
    {
        label: '数据管理',
        value: dataDetail.value.manager
    },
    {
        label: '上线时间',
        value: dataDetail.value.onlineTime
    },
    {
        label: '更新频率',
        value: dataDetail.value.updateFrequency
    },
    {
        label: '请求方式',
        value: dataDetail.value.requestMethod
    },
    {
        label: '测试环境地址',
        value: dataDetail.value.testUrl
    },
    {
        label: '生产环境地址',
        value: dataDetail.value.productionUrl
    },
    {
        label: '超时时间',
        value: `${dataDetail.value.timeout}秒`
    },
    {
        label: '重试次数',
        value: dataDetail.value.retryCount
    },
    {
        label: '缓存时间',
        value: `${dataDetail.value.cacheTime}秒`
    }
]);
// 标签颜色映射
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
// 数据详情
const dataDetail = ref({
    dataName: '手机号核验服务',
    dataType: '核验类',
    subType: '身份核验类',
    category: '核验类',
    manager: '李明',
    supplier: '数据服务商A',
    price: 0.8,
    description: '提供手机号实名认证及在网时长查询服务，支持批量查询，实时响应',
    isPrimary: true,
    isFavorite: false,
    interfaceId: 'WS_CELLPHONE_V2',
    onlineTime: '2024-01-15',
    updateFrequency: '实时',
    requestMethod: 'POST',
    testUrl: 'https://test-api.example.com/api/v2/verify/phone',
    productionUrl: 'https://api.example.com/api/v2/verify/phone',
    backupTestUrl: '',
    backupProductionUrl: '',
    timeout: 1.5,
    retryCount: 2,
    cacheTime: 1800
});
// 编辑表单
const editDrawerVisible = ref(false);
const editFormRef = ref(null);
const editForm = ref({
    category: '',
    dataType: '',
    interfaceType: '主接口',
    tableName: '',
    callCost: 0,
    supplier: '',
    price: 0,
    description: '',
    backupTestUrl: '',
    backupProductionUrl: ''
});
// 表单校验规则
const editFormRules = {
    category: [{ required: true, message: '请选择数源种类' }],
    dataType: [{ required: true, message: '请选择数源分类' }],
    interfaceType: [{ required: true, message: '请选择接口类型' }],
    tableName: [{ required: true, message: '请输入落库表名' }],
    supplier: [{ required: true, message: '请输入供应商' }],
    price: [{ required: true, message: '请输入单价' }],
    callCost: [
        { required: true, message: '请输入调用费用' },
        { type: 'number', min: 0, message: '费用不能为负数' }
    ],
    backupTestUrl: [{ required: false, message: '请输入备用测试环境地址' }],
    backupProductionUrl: [{ required: false, message: '请输入备用生产环境地址' }]
};
// 功能信息
const functionInfo = ref([
    { label: '接口编号', value: 'WS_CELLPHONE_V2' },
    { label: '数据管理', value: 'dws_prd_phone_verify' },
    { label: '上线时间', value: '2024-01-15' },
    { label: '更新频率', value: '实时' }
]);
// 接口信息
const interfaceInfo = ref([
    { label: '请求方式', value: 'POST' },
    { label: '测试环境地址', value: 'https://test-api.example.com/api/v2/verify/phone' },
    { label: '生产环境地址', value: 'https://api.example.com/api/v2/verify/phone' },
    { label: '超时时间', value: '1500ms' },
    { label: '重试次数', value: '2次' },
    { label: '缓存时间', value: '30分钟' },
    { label: '上线时间', value: '2024-01-15' },
    { label: '报文格式', value: 'JSON' },
    { label: '请求编码', value: 'UTF-8' }
]);
// 落库信息
const storageInfo = ref([
    { label: '落库表名', value: 'dws_verify_phone_result_v2' },
    { label: '落库频率', value: '准实时' },
    { label: '保存天数', value: '365天' },
    { label: '压缩方式', value: 'ORC' },
    { label: '分区字段', value: 'dt,hour' },
    { label: '主键字段', value: 'request_id,phone' }
]);
// 表的元数据信息
const metadataColumns = [
    { title: '字段中文名', dataIndex: 'chineseName' },
    { title: '字段英文名', dataIndex: 'englishName' },
    { title: '字段类型', dataIndex: 'fieldType' },
    { title: '是否必填', dataIndex: 'required' },
    { title: '备注', dataIndex: 'remark' }
];
const metadataData = [
    {
        chineseName: '请求ID',
        englishName: 'request_id',
        fieldType: 'string',
        required: '是',
        remark: '唯一标识请求的ID'
    },
    {
        chineseName: '手机号',
        englishName: 'phone',
        fieldType: 'string',
        required: '是',
        remark: '待验证的手机号码'
    },
    {
        chineseName: '验证结果',
        englishName: 'verify_result',
        fieldType: 'boolean',
        required: '是',
        remark: '验证是否通过'
    },
    {
        chineseName: '在网状态',
        englishName: 'status',
        fieldType: 'string',
        required: '是',
        remark: '手机号在网状态'
    },
    {
        chineseName: '在网时长',
        englishName: 'duration',
        fieldType: 'integer',
        required: '否',
        remark: '手机号在网时长（月）'
    },
    {
        chineseName: '运营商',
        englishName: 'operator',
        fieldType: 'string',
        required: '是',
        remark: '手机号所属运营商'
    },
    {
        chineseName: '创建时间',
        englishName: 'create_time',
        fieldType: 'timestamp',
        required: '是',
        remark: '数据创建时间'
    },
    {
        chineseName: '更新时间',
        englishName: 'update_time',
        fieldType: 'timestamp',
        required: '是',
        remark: '数据更新时间'
    }
];
// 调用及费用信息
const usageInfo = ref([
    { label: '计费方式', value: '阶梯计费' },
    { label: '单价', value: '0.8元/次起' },
    { label: '最小起订量', value: '5000次' },
    { label: '账期', value: '预付费' }
]);
// 变量评估信息
const evaluationInfo = ref([
    { label: '准确率', value: '99.95%' },
    { label: '响应时间', value: '平均150ms' },
    { label: '覆盖率', value: '99.5%' },
    { label: '稳定性', value: '99.995%' }
]);
// 入参表格配置
const inputColumns = [
    { title: '参数名', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type' },
    { title: '是否必填', dataIndex: 'required' },
    { title: '描述', dataIndex: 'description' }
];
// 入参数据
const inputParams = [
    {
        name: 'phone',
        type: 'string',
        required: '是',
        description: '手机号码，支持单个或批量查询（最多100个）'
    },
    {
        name: 'checkItems',
        type: 'array',
        required: '否',
        description: '查询项目，可选值：["status", "duration"]'
    },
    {
        name: 'source',
        type: 'string',
        required: '否',
        description: '调用来源，用于统计'
    }
];
// 出参表格配置
const outputColumns = [
    { title: '参数名', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type' },
    { title: '描述', dataIndex: 'description' }
];
// 出参数据
const outputParams = [
    {
        name: 'isValid',
        type: 'boolean',
        description: '号码是否有效'
    },
    {
        name: 'status',
        type: 'string',
        description: '在网状态：正常/停机/销号/空号'
    },
    {
        name: 'duration',
        type: 'number',
        description: '在网时长（月）'
    },
    {
        name: 'operator',
        type: 'string',
        description: '运营商信息'
    },
    {
        name: 'message',
        type: 'string',
        description: '结果说明'
    }
];
// 收藏切换
const toggleFavorite = () => {
    dataDetail.value.isFavorite = !dataDetail.value.isFavorite;
};
// 编辑相关方法
const handleEdit = () => {
    editForm.value = {
        category: dataDetail.value.category,
        interfaceType: dataDetail.value.isPrimary ? '主接口' : '备用接口',
        tableName: storageInfo.value[0].value,
        supplier: dataDetail.value.supplier,
        price: dataDetail.value.price,
        description: dataDetail.value.description
    };
    editDrawerVisible.value = true;
};
const handleEditCancel = () => {
    editDrawerVisible.value = false;
    editFormRef.value?.resetFields();
};
const handleEditSubmit = async () => {
    try {
        await editFormRef.value?.validate();
        // TODO: 调用接口保存数据
        console.log('保存编辑数据:', editForm.value);
        // 模拟保存成功
        dataDetail.value = {
            ...dataDetail.value,
            category: editForm.value.category,
            isPrimary: editForm.value.interfaceType === '主接口',
            supplier: editForm.value.supplier,
            price: editForm.value.price,
            description: editForm.value.description
        };
        storageInfo.value[0].value = editForm.value.tableName;
        Message.success('保存成功');
        editDrawerVisible.value = false;
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
// 接口切换方法
const handleInterfaceChange = async (value) => {
    try {
        // TODO: 调用接口获取对应数据
        console.log('切换到', value ? '主接口' : '备用接口');
        // 模拟加载数据
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 更新界面数据
        updateInterfaceData(value);
        Message.success(`已切换到${value ? '主接口' : '备用接口'}`);
    }
    catch (error) {
        Message.error('接口切换失败');
    }
};
// 更新接口相关数据
const updateInterfaceData = (isPrimary) => {
    if (isPrimary) {
        functionInfo.value[0].value = 'WS_CELLPHONE';
        interfaceInfo.value[1].value = '/api/v1/verify/phone';
    }
    else {
        functionInfo.value[0].value = 'WS_CELLPHONE_BACKUP';
        interfaceInfo.value[1].value = '/api/v1/verify/phone/backup';
    }
};
// 获取路由参数
const interfaceId = computed(() => route.params.id);
// 在组件挂载时获取数据
onMounted(async () => {
    try {
        // TODO: 根据interfaceId获取数据详情
        console.log('获取数据详情:', interfaceId.value);
        // 模拟异步获取数据
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    catch (error) {
        Message.error('获取数据详情失败');
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
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
const __VLS_9 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    bordered: (false),
    ...{ class: "main-info" },
}));
const __VLS_11 = __VLS_10({
    bordered: (false),
    ...{ class: "main-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    gutter: (24),
}));
const __VLS_15 = __VLS_14({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    span: (18),
}));
const __VLS_19 = __VLS_18({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    direction: "vertical",
    fill: true,
}));
const __VLS_23 = __VLS_22({
    direction: "vertical",
    fill: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-section" },
});
const __VLS_25 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    align: "center",
}));
const __VLS_27 = __VLS_26({
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
const __VLS_29 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onClick': {} },
    type: "text",
}));
const __VLS_31 = __VLS_30({
    ...{ 'onClick': {} },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
__VLS_32.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_32.slots;
    const __VLS_37 = {}.IconLeft;
    /** @type {[typeof __VLS_components.IconLeft, typeof __VLS_components.iconLeft, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({}));
    const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
}
var __VLS_32;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "data-title" },
});
(__VLS_ctx.dataDetail.dataName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-group" },
});
const __VLS_41 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.dataType)),
}));
const __VLS_43 = __VLS_42({
    color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.dataType)),
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
(__VLS_ctx.dataDetail.dataType);
var __VLS_44;
if (__VLS_ctx.dataDetail.subType) {
    const __VLS_45 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.subType)),
    }));
    const __VLS_47 = __VLS_46({
        color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.subType)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    (__VLS_ctx.dataDetail.subType);
    var __VLS_48;
}
var __VLS_28;
const __VLS_49 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}));
const __VLS_51 = __VLS_50({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
const __VLS_53 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    label: "产品分类",
}));
const __VLS_55 = __VLS_54({
    label: "产品分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
(__VLS_ctx.dataDetail.category);
var __VLS_56;
const __VLS_57 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    label: "管理人员",
}));
const __VLS_59 = __VLS_58({
    label: "管理人员",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
(__VLS_ctx.dataDetail.manager);
var __VLS_60;
const __VLS_61 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    label: "供应商",
}));
const __VLS_63 = __VLS_62({
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
(__VLS_ctx.dataDetail.supplier);
var __VLS_64;
const __VLS_65 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    label: "单价",
}));
const __VLS_67 = __VLS_66({
    label: "单价",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
(__VLS_ctx.dataDetail.price);
var __VLS_68;
const __VLS_69 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    label: "产品描述",
    span: (2),
}));
const __VLS_71 = __VLS_70({
    label: "产品描述",
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
(__VLS_ctx.dataDetail.description);
var __VLS_72;
var __VLS_52;
var __VLS_24;
var __VLS_20;
const __VLS_73 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    span: (6),
    ...{ class: "action-panel" },
}));
const __VLS_75 = __VLS_74({
    span: (6),
    ...{ class: "action-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
const __VLS_77 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
const __VLS_81 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_83 = __VLS_82({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
let __VLS_85;
let __VLS_86;
let __VLS_87;
const __VLS_88 = {
    onClick: (__VLS_ctx.handleEdit)
};
__VLS_84.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_84.slots;
    const __VLS_89 = {}.IconEdit;
    /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({}));
    const __VLS_91 = __VLS_90({}, ...__VLS_functionalComponentArgsRest(__VLS_90));
}
var __VLS_84;
const __VLS_93 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: ({ 'favorite-btn': true, 'is-favorite': __VLS_ctx.dataDetail.isFavorite }) },
}));
const __VLS_95 = __VLS_94({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: ({ 'favorite-btn': true, 'is-favorite': __VLS_ctx.dataDetail.isFavorite }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
let __VLS_97;
let __VLS_98;
let __VLS_99;
const __VLS_100 = {
    onClick: (__VLS_ctx.toggleFavorite)
};
__VLS_96.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_96.slots;
    if (__VLS_ctx.dataDetail.isFavorite) {
        const __VLS_101 = {}.IconStarFill;
        /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ ;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({}));
        const __VLS_103 = __VLS_102({}, ...__VLS_functionalComponentArgsRest(__VLS_102));
    }
    else {
        const __VLS_105 = {}.IconStar;
        /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ ;
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({}));
        const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
    }
}
(__VLS_ctx.dataDetail.isFavorite ? '取消收藏' : '收藏');
var __VLS_96;
var __VLS_80;
var __VLS_76;
var __VLS_16;
var __VLS_12;
if (!__VLS_ctx.dataDetail.isPrimary) {
    const __VLS_109 = {}.AAlert;
    /** @type {[typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        type: "warning",
        ...{ style: ({ margin: '16px 0' }) },
    }));
    const __VLS_111 = __VLS_110({
        type: "warning",
        ...{ style: ({ margin: '16px 0' }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_112.slots.default;
    var __VLS_112;
}
const __VLS_113 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataDetail.isPrimary),
    type: "button",
    ...{ style: ({ marginBottom: '16px' }) },
}));
const __VLS_115 = __VLS_114({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataDetail.isPrimary),
    type: "button",
    ...{ style: ({ marginBottom: '16px' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
let __VLS_117;
let __VLS_118;
let __VLS_119;
const __VLS_120 = {
    onChange: (__VLS_ctx.handleInterfaceChange)
};
__VLS_116.slots.default;
const __VLS_121 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    value: (true),
}));
const __VLS_123 = __VLS_122({
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
var __VLS_124;
const __VLS_125 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    value: (false),
}));
const __VLS_127 = __VLS_126({
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
__VLS_128.slots.default;
var __VLS_128;
var __VLS_116;
const __VLS_129 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    bordered: (false),
    ...{ class: "main-card" },
}));
const __VLS_131 = __VLS_130({
    bordered: (false),
    ...{ class: "main-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
const __VLS_133 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({}));
const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
__VLS_136.slots.default;
const __VLS_137 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    key: "1",
    title: "基本信息",
}));
const __VLS_139 = __VLS_138({
    key: "1",
    title: "基本信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
const __VLS_141 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_143 = __VLS_142({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
const __VLS_145 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    column: (2),
    data: (__VLS_ctx.combinedBasicInfo),
}));
const __VLS_147 = __VLS_146({
    column: (2),
    data: (__VLS_ctx.combinedBasicInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
var __VLS_144;
var __VLS_140;
const __VLS_149 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    key: "2",
    title: "落库信息",
}));
const __VLS_151 = __VLS_150({
    key: "2",
    title: "落库信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
const __VLS_153 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_155 = __VLS_154({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_156.slots.default;
const __VLS_157 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    column: (2),
    data: (__VLS_ctx.storageInfo),
}));
const __VLS_159 = __VLS_158({
    column: (2),
    data: (__VLS_ctx.storageInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
const __VLS_161 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
    ...{ style: {} },
}));
const __VLS_163 = __VLS_162({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_165 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
    columns: (__VLS_ctx.metadataColumns),
    data: (__VLS_ctx.metadataData),
    pagination: (false),
}));
const __VLS_167 = __VLS_166({
    columns: (__VLS_ctx.metadataColumns),
    data: (__VLS_ctx.metadataData),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
var __VLS_156;
var __VLS_152;
const __VLS_169 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
    key: "3",
    title: "产品入参",
}));
const __VLS_171 = __VLS_170({
    key: "3",
    title: "产品入参",
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
__VLS_172.slots.default;
const __VLS_173 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_175 = __VLS_174({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    columns: (__VLS_ctx.inputColumns),
    data: (__VLS_ctx.inputParams),
    pagination: (false),
}));
const __VLS_179 = __VLS_178({
    columns: (__VLS_ctx.inputColumns),
    data: (__VLS_ctx.inputParams),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
var __VLS_176;
var __VLS_172;
const __VLS_181 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
    key: "4",
    title: "产品出参",
}));
const __VLS_183 = __VLS_182({
    key: "4",
    title: "产品出参",
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
__VLS_184.slots.default;
const __VLS_185 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_187 = __VLS_186({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_188.slots.default;
const __VLS_189 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    columns: (__VLS_ctx.outputColumns),
    data: (__VLS_ctx.outputParams),
    pagination: (false),
}));
const __VLS_191 = __VLS_190({
    columns: (__VLS_ctx.outputColumns),
    data: (__VLS_ctx.outputParams),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
var __VLS_188;
var __VLS_184;
const __VLS_193 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
    key: "5",
    title: "调用及费用",
}));
const __VLS_195 = __VLS_194({
    key: "5",
    title: "调用及费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
__VLS_196.slots.default;
const __VLS_197 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_199 = __VLS_198({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_198));
__VLS_200.slots.default;
const __VLS_201 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}));
const __VLS_203 = __VLS_202({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
var __VLS_200;
var __VLS_196;
const __VLS_205 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    key: "6",
    title: "变量评估",
}));
const __VLS_207 = __VLS_206({
    key: "6",
    title: "变量评估",
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
__VLS_208.slots.default;
const __VLS_209 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_211 = __VLS_210({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
__VLS_212.slots.default;
const __VLS_213 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}));
const __VLS_215 = __VLS_214({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
var __VLS_212;
var __VLS_208;
var __VLS_136;
var __VLS_132;
var __VLS_8;
const __VLS_217 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ ;
// @ts-ignore
const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
    ...{ 'onCancel': {} },
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.editDrawerVisible),
    title: "编辑信息",
    width: "800px",
}));
const __VLS_219 = __VLS_218({
    ...{ 'onCancel': {} },
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.editDrawerVisible),
    title: "编辑信息",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_218));
let __VLS_221;
let __VLS_222;
let __VLS_223;
const __VLS_224 = {
    onCancel: (__VLS_ctx.handleEditCancel)
};
const __VLS_225 = {
    onOk: (__VLS_ctx.handleEditSubmit)
};
__VLS_220.slots.default;
const __VLS_226 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
    defaultActiveKey: "1",
}));
const __VLS_228 = __VLS_227({
    defaultActiveKey: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_227));
__VLS_229.slots.default;
const __VLS_230 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
    key: "1",
    title: "产品信息",
}));
const __VLS_232 = __VLS_231({
    key: "1",
    title: "产品信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_231));
__VLS_233.slots.default;
const __VLS_234 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
    bordered: (false),
}));
const __VLS_236 = __VLS_235({
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_235));
__VLS_237.slots.default;
const __VLS_238 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}));
const __VLS_240 = __VLS_239({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_239));
/** @type {typeof __VLS_ctx.editFormRef} */ ;
var __VLS_242 = {};
__VLS_241.slots.default;
const __VLS_244 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    field: "dataName",
    label: "产品名称",
}));
const __VLS_246 = __VLS_245({
    field: "dataName",
    label: "产品名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
const __VLS_248 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    modelValue: (__VLS_ctx.dataDetail.dataName),
    disabled: true,
}));
const __VLS_250 = __VLS_249({
    modelValue: (__VLS_ctx.dataDetail.dataName),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
var __VLS_247;
const __VLS_252 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    field: "dataType",
    label: "数源种类",
    required: true,
}));
const __VLS_254 = __VLS_253({
    field: "dataType",
    label: "数源种类",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数源种类",
}));
const __VLS_258 = __VLS_257({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
const __VLS_260 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    value: "核验类",
}));
const __VLS_262 = __VLS_261({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
var __VLS_263;
const __VLS_264 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    value: "评分类",
}));
const __VLS_266 = __VLS_265({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
var __VLS_267;
const __VLS_268 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    value: "标签类",
}));
const __VLS_270 = __VLS_269({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
var __VLS_271;
var __VLS_259;
var __VLS_255;
const __VLS_272 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    field: "subType",
    label: "数源分类",
    required: true,
}));
const __VLS_274 = __VLS_273({
    field: "subType",
    label: "数源分类",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
__VLS_275.slots.default;
const __VLS_276 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请选择数源分类",
}));
const __VLS_278 = __VLS_277({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请选择数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
const __VLS_280 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    value: "身份核验类",
}));
const __VLS_282 = __VLS_281({
    value: "身份核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
var __VLS_283;
const __VLS_284 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    value: "信用评分",
}));
const __VLS_286 = __VLS_285({
    value: "信用评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
var __VLS_287;
const __VLS_288 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    value: "用户画像",
}));
const __VLS_290 = __VLS_289({
    value: "用户画像",
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
var __VLS_291;
var __VLS_279;
var __VLS_275;
const __VLS_292 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    field: "supplier",
    label: "供应商",
    required: true,
}));
const __VLS_294 = __VLS_293({
    field: "supplier",
    label: "供应商",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
__VLS_295.slots.default;
const __VLS_296 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}));
const __VLS_298 = __VLS_297({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
var __VLS_295;
const __VLS_300 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    field: "price",
    label: "单价",
    required: true,
}));
const __VLS_302 = __VLS_301({
    field: "price",
    label: "单价",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
const __VLS_304 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    modelValue: (__VLS_ctx.editForm.price),
    min: (0),
    precision: (2),
    placeholder: "请输入单价",
}));
const __VLS_306 = __VLS_305({
    modelValue: (__VLS_ctx.editForm.price),
    min: (0),
    precision: (2),
    placeholder: "请输入单价",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
var __VLS_303;
const __VLS_308 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    field: "description",
    label: "产品描述",
    required: true,
}));
const __VLS_310 = __VLS_309({
    field: "description",
    label: "产品描述",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
__VLS_311.slots.default;
const __VLS_312 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入产品描述",
}));
const __VLS_314 = __VLS_313({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入产品描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
var __VLS_311;
var __VLS_241;
var __VLS_237;
var __VLS_233;
const __VLS_316 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    key: "2",
    title: "已注册接口",
}));
const __VLS_318 = __VLS_317({
    key: "2",
    title: "已注册接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
const __VLS_320 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({}));
const __VLS_322 = __VLS_321({}, ...__VLS_functionalComponentArgsRest(__VLS_321));
__VLS_323.slots.default;
const __VLS_324 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    key: "2-1",
    title: "主接口",
}));
const __VLS_326 = __VLS_325({
    key: "2-1",
    title: "主接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
const __VLS_328 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}));
const __VLS_330 = __VLS_329({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
/** @type {typeof __VLS_ctx.editFormRef} */ ;
var __VLS_332 = {};
__VLS_331.slots.default;
const __VLS_334 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_335 = __VLS_asFunctionalComponent(__VLS_334, new __VLS_334({
    field: "tableName",
    label: "落库表名",
    required: true,
}));
const __VLS_336 = __VLS_335({
    field: "tableName",
    label: "落库表名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_335));
__VLS_337.slots.default;
const __VLS_338 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_339 = __VLS_asFunctionalComponent(__VLS_338, new __VLS_338({
    modelValue: (__VLS_ctx.editForm.tableName),
    placeholder: "请选择已注册接口",
}));
const __VLS_340 = __VLS_339({
    modelValue: (__VLS_ctx.editForm.tableName),
    placeholder: "请选择已注册接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_339));
__VLS_341.slots.default;
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.registeredInterfaces))) {
    const __VLS_342 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_343 = __VLS_asFunctionalComponent(__VLS_342, new __VLS_342({
        key: (index),
        value: (item.value),
    }));
    const __VLS_344 = __VLS_343({
        key: (index),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_343));
    __VLS_345.slots.default;
    (item.label);
    var __VLS_345;
}
var __VLS_341;
var __VLS_337;
const __VLS_346 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_347 = __VLS_asFunctionalComponent(__VLS_346, new __VLS_346({
    field: "callCost",
    label: "调用费用(元/次)",
    required: true,
}));
const __VLS_348 = __VLS_347({
    field: "callCost",
    label: "调用费用(元/次)",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_347));
__VLS_349.slots.default;
const __VLS_350 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_351 = __VLS_asFunctionalComponent(__VLS_350, new __VLS_350({
    modelValue: (__VLS_ctx.editForm.callCost),
    min: (0),
    precision: (2),
    placeholder: "请输入调用费用",
}));
const __VLS_352 = __VLS_351({
    modelValue: (__VLS_ctx.editForm.callCost),
    min: (0),
    precision: (2),
    placeholder: "请输入调用费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_351));
var __VLS_349;
const __VLS_354 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_355 = __VLS_asFunctionalComponent(__VLS_354, new __VLS_354({
    field: "dataManagement",
    label: "数据管理",
    required: true,
}));
const __VLS_356 = __VLS_355({
    field: "dataManagement",
    label: "数据管理",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_355));
__VLS_357.slots.default;
const __VLS_358 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_359 = __VLS_asFunctionalComponent(__VLS_358, new __VLS_358({
    modelValue: (__VLS_ctx.editForm.dataManagement),
    placeholder: "请选择数据管理方式",
}));
const __VLS_360 = __VLS_359({
    modelValue: (__VLS_ctx.editForm.dataManagement),
    placeholder: "请选择数据管理方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_359));
__VLS_361.slots.default;
const __VLS_362 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_363 = __VLS_asFunctionalComponent(__VLS_362, new __VLS_362({
    value: "自动",
}));
const __VLS_364 = __VLS_363({
    value: "自动",
}, ...__VLS_functionalComponentArgsRest(__VLS_363));
__VLS_365.slots.default;
var __VLS_365;
const __VLS_366 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_367 = __VLS_asFunctionalComponent(__VLS_366, new __VLS_366({
    value: "手动",
}));
const __VLS_368 = __VLS_367({
    value: "手动",
}, ...__VLS_functionalComponentArgsRest(__VLS_367));
__VLS_369.slots.default;
var __VLS_369;
var __VLS_361;
var __VLS_357;
var __VLS_331;
var __VLS_327;
const __VLS_370 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_371 = __VLS_asFunctionalComponent(__VLS_370, new __VLS_370({
    key: "2-2",
    title: "备用接口",
}));
const __VLS_372 = __VLS_371({
    key: "2-2",
    title: "备用接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_371));
__VLS_373.slots.default;
const __VLS_374 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_375 = __VLS_asFunctionalComponent(__VLS_374, new __VLS_374({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}));
const __VLS_376 = __VLS_375({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_375));
/** @type {typeof __VLS_ctx.editFormRef} */ ;
var __VLS_378 = {};
__VLS_377.slots.default;
const __VLS_380 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
    field: "backupTableName",
    label: "落库表名",
    required: true,
}));
const __VLS_382 = __VLS_381({
    field: "backupTableName",
    label: "落库表名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_381));
__VLS_383.slots.default;
const __VLS_384 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
    modelValue: (__VLS_ctx.editForm.backupTableName),
    placeholder: "请输入落库表名",
}));
const __VLS_386 = __VLS_385({
    modelValue: (__VLS_ctx.editForm.backupTableName),
    placeholder: "请输入落库表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_385));
var __VLS_383;
const __VLS_388 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({
    field: "backupCallCost",
    label: "调用费用(元/次)",
    required: true,
}));
const __VLS_390 = __VLS_389({
    field: "backupCallCost",
    label: "调用费用(元/次)",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_389));
__VLS_391.slots.default;
const __VLS_392 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
    modelValue: (__VLS_ctx.editForm.backupCallCost),
    min: (0),
    precision: (2),
    placeholder: "请输入调用费用",
}));
const __VLS_394 = __VLS_393({
    modelValue: (__VLS_ctx.editForm.backupCallCost),
    min: (0),
    precision: (2),
    placeholder: "请输入调用费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_393));
var __VLS_391;
const __VLS_396 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
    field: "backupDataManagement",
    label: "数据管理",
    required: true,
}));
const __VLS_398 = __VLS_397({
    field: "backupDataManagement",
    label: "数据管理",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_397));
__VLS_399.slots.default;
const __VLS_400 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({
    modelValue: (__VLS_ctx.editForm.backupDataManagement),
    placeholder: "请选择数据管理方式",
}));
const __VLS_402 = __VLS_401({
    modelValue: (__VLS_ctx.editForm.backupDataManagement),
    placeholder: "请选择数据管理方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_401));
__VLS_403.slots.default;
const __VLS_404 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_405 = __VLS_asFunctionalComponent(__VLS_404, new __VLS_404({
    value: "自动",
}));
const __VLS_406 = __VLS_405({
    value: "自动",
}, ...__VLS_functionalComponentArgsRest(__VLS_405));
__VLS_407.slots.default;
var __VLS_407;
const __VLS_408 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_409 = __VLS_asFunctionalComponent(__VLS_408, new __VLS_408({
    value: "手动",
}));
const __VLS_410 = __VLS_409({
    value: "手动",
}, ...__VLS_functionalComponentArgsRest(__VLS_409));
__VLS_411.slots.default;
var __VLS_411;
var __VLS_403;
var __VLS_399;
var __VLS_377;
var __VLS_373;
const __VLS_412 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({
    key: "2-3",
    title: "新增备用接口",
}));
const __VLS_414 = __VLS_413({
    key: "2-3",
    title: "新增备用接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_413));
__VLS_415.slots.default;
const __VLS_416 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_417 = __VLS_asFunctionalComponent(__VLS_416, new __VLS_416({
    columns: (__VLS_ctx.backupInterfaceColumns),
    data: (__VLS_ctx.editForm.backupInterfaces),
}));
const __VLS_418 = __VLS_417({
    columns: (__VLS_ctx.backupInterfaceColumns),
    data: (__VLS_ctx.editForm.backupInterfaces),
}, ...__VLS_functionalComponentArgsRest(__VLS_417));
__VLS_419.slots.default;
{
    const { operations: __VLS_thisSlot } = __VLS_419.slots;
    const [{ record, index }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_420 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_421 = __VLS_asFunctionalComponent(__VLS_420, new __VLS_420({}));
    const __VLS_422 = __VLS_421({}, ...__VLS_functionalComponentArgsRest(__VLS_421));
    __VLS_423.slots.default;
    const __VLS_424 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_425 = __VLS_asFunctionalComponent(__VLS_424, new __VLS_424({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_426 = __VLS_425({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_425));
    let __VLS_428;
    let __VLS_429;
    let __VLS_430;
    const __VLS_431 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleEditBackupInterface(index);
        }
    };
    __VLS_427.slots.default;
    var __VLS_427;
    const __VLS_432 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_433 = __VLS_asFunctionalComponent(__VLS_432, new __VLS_432({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_434 = __VLS_433({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_433));
    let __VLS_436;
    let __VLS_437;
    let __VLS_438;
    const __VLS_439 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleRemoveBackupInterface(index);
        }
    };
    __VLS_435.slots.default;
    var __VLS_435;
    var __VLS_423;
}
var __VLS_419;
const __VLS_440 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_441 = __VLS_asFunctionalComponent(__VLS_440, new __VLS_440({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}));
const __VLS_442 = __VLS_441({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_441));
let __VLS_444;
let __VLS_445;
let __VLS_446;
const __VLS_447 = {
    onClick: (__VLS_ctx.handleAddBackupInterface)
};
__VLS_443.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_443.slots;
    const __VLS_448 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_449 = __VLS_asFunctionalComponent(__VLS_448, new __VLS_448({}));
    const __VLS_450 = __VLS_449({}, ...__VLS_functionalComponentArgsRest(__VLS_449));
}
var __VLS_443;
var __VLS_415;
var __VLS_323;
var __VLS_319;
var __VLS_229;
var __VLS_220;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['main-info']} */ ;
/** @type {__VLS_StyleScopedClasses['title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['data-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-group']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-info']} */ ;
/** @type {__VLS_StyleScopedClasses['action-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['is-favorite']} */ ;
/** @type {__VLS_StyleScopedClasses['main-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
// @ts-ignore
var __VLS_243 = __VLS_242, __VLS_333 = __VLS_332, __VLS_379 = __VLS_378;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconLeft: IconLeft,
            IconEdit: IconEdit,
            IconStar: IconStar,
            IconStarFill: IconStarFill,
            registeredInterfaces: registeredInterfaces,
            backupInterfaceColumns: backupInterfaceColumns,
            handleAddBackupInterface: handleAddBackupInterface,
            handleRemoveBackupInterface: handleRemoveBackupInterface,
            combinedBasicInfo: combinedBasicInfo,
            getTagColor: getTagColor,
            dataDetail: dataDetail,
            editDrawerVisible: editDrawerVisible,
            editFormRef: editFormRef,
            editForm: editForm,
            editFormRules: editFormRules,
            storageInfo: storageInfo,
            metadataColumns: metadataColumns,
            metadataData: metadataData,
            usageInfo: usageInfo,
            evaluationInfo: evaluationInfo,
            inputColumns: inputColumns,
            inputParams: inputParams,
            outputColumns: outputColumns,
            outputParams: outputParams,
            toggleFavorite: toggleFavorite,
            handleEdit: handleEdit,
            handleEditCancel: handleEditCancel,
            handleEditSubmit: handleEditSubmit,
            handleInterfaceChange: handleInterfaceChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
