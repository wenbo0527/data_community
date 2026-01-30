/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
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
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "external-detail-page" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    bordered: (false),
    ...{ class: "main-info" },
}));
const __VLS_2 = __VLS_1({
    bordered: (false),
    ...{ class: "main-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    gutter: (24),
}));
const __VLS_6 = __VLS_5({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    span: (18),
}));
const __VLS_10 = __VLS_9({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    direction: "vertical",
    fill: true,
}));
const __VLS_14 = __VLS_13({
    direction: "vertical",
    fill: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-section" },
});
const __VLS_16 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    align: "center",
}));
const __VLS_18 = __VLS_17({
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    type: "text",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
__VLS_23.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_23.slots;
    const __VLS_28 = {}.IconLeft;
    /** @type {[typeof __VLS_components.IconLeft, typeof __VLS_components.iconLeft, ]} */ 
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
let __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "data-title" },
});
(__VLS_ctx.dataDetail.dataName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-group" },
});
const __VLS_32 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.dataType)),
}));
const __VLS_34 = __VLS_33({
    color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.dataType)),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
(__VLS_ctx.dataDetail.dataType);
let __VLS_35;
if (__VLS_ctx.dataDetail.subType) {
    const __VLS_36 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.subType)),
    }));
    const __VLS_38 = __VLS_37({
        color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.subType)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    (__VLS_ctx.dataDetail.subType);
    let __VLS_39;
}
let __VLS_19;
const __VLS_40 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}));
const __VLS_42 = __VLS_41({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "产品分类",
}));
const __VLS_46 = __VLS_45({
    label: "产品分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
(__VLS_ctx.dataDetail.category);
let __VLS_47;
const __VLS_48 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "管理人员",
}));
const __VLS_50 = __VLS_49({
    label: "管理人员",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
(__VLS_ctx.dataDetail.manager);
let __VLS_51;
const __VLS_52 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "供应商",
}));
const __VLS_54 = __VLS_53({
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
(__VLS_ctx.dataDetail.supplier);
let __VLS_55;
const __VLS_56 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "单价",
}));
const __VLS_58 = __VLS_57({
    label: "单价",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
(__VLS_ctx.dataDetail.price);
let __VLS_59;
const __VLS_60 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "产品描述",
    span: (2),
}));
const __VLS_62 = __VLS_61({
    label: "产品描述",
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
(__VLS_ctx.dataDetail.description);
let __VLS_63;
let __VLS_43;
let __VLS_15;
let __VLS_11;
const __VLS_64 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    span: (6),
    ...{ class: "action-panel" },
}));
const __VLS_66 = __VLS_65({
    span: (6),
    ...{ class: "action-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_74 = __VLS_73({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onClick: (__VLS_ctx.handleEdit)
};
__VLS_75.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_75.slots;
    const __VLS_80 = {}.IconEdit;
    /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ 
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
    const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
}
let __VLS_75;
const __VLS_84 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: ({ 'favorite-btn': true, 'is-favorite': __VLS_ctx.dataDetail.isFavorite }) },
}));
const __VLS_86 = __VLS_85({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: ({ 'favorite-btn': true, 'is-favorite': __VLS_ctx.dataDetail.isFavorite }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onClick: (__VLS_ctx.toggleFavorite)
};
__VLS_87.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_87.slots;
    if (__VLS_ctx.dataDetail.isFavorite) {
        const __VLS_92 = {}.IconStarFill;
        /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ 
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
        const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
    }
    else {
        const __VLS_96 = {}.IconStar;
        /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ 
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
        const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
    }
}
(__VLS_ctx.dataDetail.isFavorite ? '取消收藏' : '收藏');
let __VLS_87;
let __VLS_71;
let __VLS_67;
let __VLS_7;
let __VLS_3;
if (!__VLS_ctx.dataDetail.isPrimary) {
    const __VLS_100 = {}.AAlert;
    /** @type {[typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, typeof __VLS_components.AAlert, typeof __VLS_components.aAlert, ]} */ 
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        type: "warning",
        ...{ style: ({ margin: '16px 0' }) },
    }));
    const __VLS_102 = __VLS_101({
        type: "warning",
        ...{ style: ({ margin: '16px 0' }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    let __VLS_103;
}
const __VLS_104 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataDetail.isPrimary),
    type: "button",
    ...{ style: ({ marginBottom: '16px' }) },
}));
const __VLS_106 = __VLS_105({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataDetail.isPrimary),
    type: "button",
    ...{ style: ({ marginBottom: '16px' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onChange: (__VLS_ctx.handleInterfaceChange)
};
__VLS_107.slots.default;
const __VLS_112 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    value: (true),
}));
const __VLS_114 = __VLS_113({
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
let __VLS_115;
const __VLS_116 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    value: (false),
}));
const __VLS_118 = __VLS_117({
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
let __VLS_119;
let __VLS_107;
const __VLS_120 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    bordered: (false),
    ...{ class: "main-card" },
}));
const __VLS_122 = __VLS_121({
    bordered: (false),
    ...{ class: "main-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({}));
const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    key: "1",
    title: "基本信息",
}));
const __VLS_130 = __VLS_129({
    key: "1",
    title: "基本信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_134 = __VLS_133({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    column: (2),
    data: (__VLS_ctx.combinedBasicInfo),
}));
const __VLS_138 = __VLS_137({
    column: (2),
    data: (__VLS_ctx.combinedBasicInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
let __VLS_135;
let __VLS_131;
const __VLS_140 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    key: "2",
    title: "落库信息",
}));
const __VLS_142 = __VLS_141({
    key: "2",
    title: "落库信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_146 = __VLS_145({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    column: (2),
    data: (__VLS_ctx.storageInfo),
}));
const __VLS_150 = __VLS_149({
    column: (2),
    data: (__VLS_ctx.storageInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
const __VLS_152 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ 
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    ...{ style: {} },
}));
const __VLS_154 = __VLS_153({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_156 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    columns: (__VLS_ctx.metadataColumns),
    data: (__VLS_ctx.metadataData),
    pagination: (false),
}));
const __VLS_158 = __VLS_157({
    columns: (__VLS_ctx.metadataColumns),
    data: (__VLS_ctx.metadataData),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
let __VLS_147;
let __VLS_143;
const __VLS_160 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    key: "3",
    title: "产品入参",
}));
const __VLS_162 = __VLS_161({
    key: "3",
    title: "产品入参",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_166 = __VLS_165({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    columns: (__VLS_ctx.inputColumns),
    data: (__VLS_ctx.inputParams),
    pagination: (false),
}));
const __VLS_170 = __VLS_169({
    columns: (__VLS_ctx.inputColumns),
    data: (__VLS_ctx.inputParams),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
let __VLS_167;
let __VLS_163;
const __VLS_172 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    key: "4",
    title: "产品出参",
}));
const __VLS_174 = __VLS_173({
    key: "4",
    title: "产品出参",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_178 = __VLS_177({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    columns: (__VLS_ctx.outputColumns),
    data: (__VLS_ctx.outputParams),
    pagination: (false),
}));
const __VLS_182 = __VLS_181({
    columns: (__VLS_ctx.outputColumns),
    data: (__VLS_ctx.outputParams),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
let __VLS_179;
let __VLS_175;
const __VLS_184 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    key: "5",
    title: "调用及费用",
}));
const __VLS_186 = __VLS_185({
    key: "5",
    title: "调用及费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_190 = __VLS_189({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}));
const __VLS_194 = __VLS_193({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
let __VLS_191;
let __VLS_187;
const __VLS_196 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    key: "6",
    title: "变量评估",
}));
const __VLS_198 = __VLS_197({
    key: "6",
    title: "变量评估",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_202 = __VLS_201({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
const __VLS_204 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}));
const __VLS_206 = __VLS_205({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
let __VLS_203;
let __VLS_199;
let __VLS_127;
let __VLS_123;
const __VLS_208 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ 
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    ...{ 'onCancel': {} },
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.editDrawerVisible),
    title: "编辑信息",
    width: "800px",
}));
const __VLS_210 = __VLS_209({
    ...{ 'onCancel': {} },
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.editDrawerVisible),
    title: "编辑信息",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
let __VLS_212;
let __VLS_213;
let __VLS_214;
const __VLS_215 = {
    onCancel: (__VLS_ctx.handleEditCancel)
};
const __VLS_216 = {
    onOk: (__VLS_ctx.handleEditSubmit)
};
__VLS_211.slots.default;
const __VLS_217 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
    defaultActiveKey: "1",
}));
const __VLS_219 = __VLS_218({
    defaultActiveKey: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_218));
__VLS_220.slots.default;
const __VLS_221 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
    key: "1",
    title: "产品信息",
}));
const __VLS_223 = __VLS_222({
    key: "1",
    title: "产品信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
__VLS_224.slots.default;
const __VLS_225 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
    bordered: (false),
}));
const __VLS_227 = __VLS_226({
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_226));
__VLS_228.slots.default;
const __VLS_229 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}));
const __VLS_231 = __VLS_230({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
/** @type {typeof __VLS_ctx.editFormRef} */ 
const __VLS_233 = {};
__VLS_232.slots.default;
const __VLS_235 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
    field: "dataName",
    label: "产品名称",
}));
const __VLS_237 = __VLS_236({
    field: "dataName",
    label: "产品名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_236));
__VLS_238.slots.default;
const __VLS_239 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
    modelValue: (__VLS_ctx.dataDetail.dataName),
    disabled: true,
}));
const __VLS_241 = __VLS_240({
    modelValue: (__VLS_ctx.dataDetail.dataName),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_240));
let __VLS_238;
const __VLS_243 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
    field: "dataType",
    label: "数源种类",
    required: true,
}));
const __VLS_245 = __VLS_244({
    field: "dataType",
    label: "数源种类",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_244));
__VLS_246.slots.default;
const __VLS_247 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数源种类",
}));
const __VLS_249 = __VLS_248({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_248));
__VLS_250.slots.default;
const __VLS_251 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({
    value: "核验类",
}));
const __VLS_253 = __VLS_252({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_252));
__VLS_254.slots.default;
let __VLS_254;
const __VLS_255 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
    value: "评分类",
}));
const __VLS_257 = __VLS_256({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
__VLS_258.slots.default;
let __VLS_258;
const __VLS_259 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
    value: "标签类",
}));
const __VLS_261 = __VLS_260({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
__VLS_262.slots.default;
let __VLS_262;
let __VLS_250;
let __VLS_246;
const __VLS_263 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({
    field: "subType",
    label: "数源分类",
    required: true,
}));
const __VLS_265 = __VLS_264({
    field: "subType",
    label: "数源分类",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_264));
__VLS_266.slots.default;
const __VLS_267 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请选择数源分类",
}));
const __VLS_269 = __VLS_268({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请选择数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
__VLS_270.slots.default;
const __VLS_271 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
    value: "身份核验类",
}));
const __VLS_273 = __VLS_272({
    value: "身份核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
__VLS_274.slots.default;
let __VLS_274;
const __VLS_275 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({
    value: "信用评分",
}));
const __VLS_277 = __VLS_276({
    value: "信用评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_276));
__VLS_278.slots.default;
let __VLS_278;
const __VLS_279 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
    value: "用户画像",
}));
const __VLS_281 = __VLS_280({
    value: "用户画像",
}, ...__VLS_functionalComponentArgsRest(__VLS_280));
__VLS_282.slots.default;
let __VLS_282;
let __VLS_270;
let __VLS_266;
const __VLS_283 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
    field: "supplier",
    label: "供应商",
    required: true,
}));
const __VLS_285 = __VLS_284({
    field: "supplier",
    label: "供应商",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_284));
__VLS_286.slots.default;
const __VLS_287 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}));
const __VLS_289 = __VLS_288({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_288));
let __VLS_286;
const __VLS_291 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
    field: "price",
    label: "单价",
    required: true,
}));
const __VLS_293 = __VLS_292({
    field: "price",
    label: "单价",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_292));
__VLS_294.slots.default;
const __VLS_295 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({
    modelValue: (__VLS_ctx.editForm.price),
    min: (0),
    precision: (2),
    placeholder: "请输入单价",
}));
const __VLS_297 = __VLS_296({
    modelValue: (__VLS_ctx.editForm.price),
    min: (0),
    precision: (2),
    placeholder: "请输入单价",
}, ...__VLS_functionalComponentArgsRest(__VLS_296));
let __VLS_294;
const __VLS_299 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
    field: "description",
    label: "产品描述",
    required: true,
}));
const __VLS_301 = __VLS_300({
    field: "description",
    label: "产品描述",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_300));
__VLS_302.slots.default;
const __VLS_303 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入产品描述",
}));
const __VLS_305 = __VLS_304({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入产品描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_304));
let __VLS_302;
let __VLS_232;
let __VLS_228;
let __VLS_224;
const __VLS_307 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({
    key: "2",
    title: "已注册接口",
}));
const __VLS_309 = __VLS_308({
    key: "2",
    title: "已注册接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_308));
__VLS_310.slots.default;
const __VLS_311 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({}));
const __VLS_313 = __VLS_312({}, ...__VLS_functionalComponentArgsRest(__VLS_312));
__VLS_314.slots.default;
const __VLS_315 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({
    key: "2-1",
    title: "主接口",
}));
const __VLS_317 = __VLS_316({
    key: "2-1",
    title: "主接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_316));
__VLS_318.slots.default;
const __VLS_319 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}));
const __VLS_321 = __VLS_320({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_320));
/** @type {typeof __VLS_ctx.editFormRef} */ 
const __VLS_323 = {};
__VLS_322.slots.default;
const __VLS_325 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
    field: "tableName",
    label: "落库表名",
    required: true,
}));
const __VLS_327 = __VLS_326({
    field: "tableName",
    label: "落库表名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_326));
__VLS_328.slots.default;
const __VLS_329 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
    modelValue: (__VLS_ctx.editForm.tableName),
    placeholder: "请选择已注册接口",
}));
const __VLS_331 = __VLS_330({
    modelValue: (__VLS_ctx.editForm.tableName),
    placeholder: "请选择已注册接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_330));
__VLS_332.slots.default;
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.registeredInterfaces))) {
    const __VLS_333 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
    // @ts-ignore
    const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({
        key: (index),
        value: (item.value),
    }));
    const __VLS_335 = __VLS_334({
        key: (index),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_334));
    __VLS_336.slots.default;
    (item.label);
    var __VLS_336;
}
let __VLS_332;
let __VLS_328;
const __VLS_337 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
    field: "callCost",
    label: "调用费用(元/次)",
    required: true,
}));
const __VLS_339 = __VLS_338({
    field: "callCost",
    label: "调用费用(元/次)",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_338));
__VLS_340.slots.default;
const __VLS_341 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
    modelValue: (__VLS_ctx.editForm.callCost),
    min: (0),
    precision: (2),
    placeholder: "请输入调用费用",
}));
const __VLS_343 = __VLS_342({
    modelValue: (__VLS_ctx.editForm.callCost),
    min: (0),
    precision: (2),
    placeholder: "请输入调用费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_342));
let __VLS_340;
const __VLS_345 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
    field: "dataManagement",
    label: "数据管理",
    required: true,
}));
const __VLS_347 = __VLS_346({
    field: "dataManagement",
    label: "数据管理",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_346));
__VLS_348.slots.default;
const __VLS_349 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
    modelValue: (__VLS_ctx.editForm.dataManagement),
    placeholder: "请选择数据管理方式",
}));
const __VLS_351 = __VLS_350({
    modelValue: (__VLS_ctx.editForm.dataManagement),
    placeholder: "请选择数据管理方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_350));
__VLS_352.slots.default;
const __VLS_353 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({
    value: "自动",
}));
const __VLS_355 = __VLS_354({
    value: "自动",
}, ...__VLS_functionalComponentArgsRest(__VLS_354));
__VLS_356.slots.default;
let __VLS_356;
const __VLS_357 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({
    value: "手动",
}));
const __VLS_359 = __VLS_358({
    value: "手动",
}, ...__VLS_functionalComponentArgsRest(__VLS_358));
__VLS_360.slots.default;
let __VLS_360;
let __VLS_352;
let __VLS_348;
let __VLS_322;
let __VLS_318;
const __VLS_361 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_362 = __VLS_asFunctionalComponent(__VLS_361, new __VLS_361({
    key: "2-2",
    title: "备用接口",
}));
const __VLS_363 = __VLS_362({
    key: "2-2",
    title: "备用接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_362));
__VLS_364.slots.default;
const __VLS_365 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}));
const __VLS_367 = __VLS_366({
    model: (__VLS_ctx.editForm),
    ref: "editFormRef",
    rules: (__VLS_ctx.editFormRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_366));
/** @type {typeof __VLS_ctx.editFormRef} */ 
const __VLS_369 = {};
__VLS_368.slots.default;
const __VLS_371 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_372 = __VLS_asFunctionalComponent(__VLS_371, new __VLS_371({
    field: "backupTableName",
    label: "落库表名",
    required: true,
}));
const __VLS_373 = __VLS_372({
    field: "backupTableName",
    label: "落库表名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_372));
__VLS_374.slots.default;
const __VLS_375 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_376 = __VLS_asFunctionalComponent(__VLS_375, new __VLS_375({
    modelValue: (__VLS_ctx.editForm.backupTableName),
    placeholder: "请输入落库表名",
}));
const __VLS_377 = __VLS_376({
    modelValue: (__VLS_ctx.editForm.backupTableName),
    placeholder: "请输入落库表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_376));
let __VLS_374;
const __VLS_379 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_380 = __VLS_asFunctionalComponent(__VLS_379, new __VLS_379({
    field: "backupCallCost",
    label: "调用费用(元/次)",
    required: true,
}));
const __VLS_381 = __VLS_380({
    field: "backupCallCost",
    label: "调用费用(元/次)",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_380));
__VLS_382.slots.default;
const __VLS_383 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_384 = __VLS_asFunctionalComponent(__VLS_383, new __VLS_383({
    modelValue: (__VLS_ctx.editForm.backupCallCost),
    min: (0),
    precision: (2),
    placeholder: "请输入调用费用",
}));
const __VLS_385 = __VLS_384({
    modelValue: (__VLS_ctx.editForm.backupCallCost),
    min: (0),
    precision: (2),
    placeholder: "请输入调用费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_384));
let __VLS_382;
const __VLS_387 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_388 = __VLS_asFunctionalComponent(__VLS_387, new __VLS_387({
    field: "backupDataManagement",
    label: "数据管理",
    required: true,
}));
const __VLS_389 = __VLS_388({
    field: "backupDataManagement",
    label: "数据管理",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_388));
__VLS_390.slots.default;
const __VLS_391 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_392 = __VLS_asFunctionalComponent(__VLS_391, new __VLS_391({
    modelValue: (__VLS_ctx.editForm.backupDataManagement),
    placeholder: "请选择数据管理方式",
}));
const __VLS_393 = __VLS_392({
    modelValue: (__VLS_ctx.editForm.backupDataManagement),
    placeholder: "请选择数据管理方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_392));
__VLS_394.slots.default;
const __VLS_395 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_396 = __VLS_asFunctionalComponent(__VLS_395, new __VLS_395({
    value: "自动",
}));
const __VLS_397 = __VLS_396({
    value: "自动",
}, ...__VLS_functionalComponentArgsRest(__VLS_396));
__VLS_398.slots.default;
let __VLS_398;
const __VLS_399 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_400 = __VLS_asFunctionalComponent(__VLS_399, new __VLS_399({
    value: "手动",
}));
const __VLS_401 = __VLS_400({
    value: "手动",
}, ...__VLS_functionalComponentArgsRest(__VLS_400));
__VLS_402.slots.default;
let __VLS_402;
let __VLS_394;
let __VLS_390;
let __VLS_368;
let __VLS_364;
const __VLS_403 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_404 = __VLS_asFunctionalComponent(__VLS_403, new __VLS_403({
    key: "2-3",
    title: "新增备用接口",
}));
const __VLS_405 = __VLS_404({
    key: "2-3",
    title: "新增备用接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_404));
__VLS_406.slots.default;
const __VLS_407 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_408 = __VLS_asFunctionalComponent(__VLS_407, new __VLS_407({
    columns: (__VLS_ctx.backupInterfaceColumns),
    data: (__VLS_ctx.editForm.backupInterfaces),
}));
const __VLS_409 = __VLS_408({
    columns: (__VLS_ctx.backupInterfaceColumns),
    data: (__VLS_ctx.editForm.backupInterfaces),
}, ...__VLS_functionalComponentArgsRest(__VLS_408));
__VLS_410.slots.default;
{
    const { operations: __VLS_thisSlot } = __VLS_410.slots;
    const [{ record, index }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_411 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_412 = __VLS_asFunctionalComponent(__VLS_411, new __VLS_411({}));
    const __VLS_413 = __VLS_412({}, ...__VLS_functionalComponentArgsRest(__VLS_412));
    __VLS_414.slots.default;
    const __VLS_415 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_416 = __VLS_asFunctionalComponent(__VLS_415, new __VLS_415({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_417 = __VLS_416({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_416));
    let __VLS_419;
    let __VLS_420;
    let __VLS_421;
    const __VLS_422 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleEditBackupInterface(index);
        }
    };
    __VLS_418.slots.default;
    let __VLS_418;
    const __VLS_423 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_424 = __VLS_asFunctionalComponent(__VLS_423, new __VLS_423({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }));
    const __VLS_425 = __VLS_424({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_424));
    let __VLS_427;
    let __VLS_428;
    let __VLS_429;
    const __VLS_430 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleRemoveBackupInterface(index);
        }
    };
    __VLS_426.slots.default;
    let __VLS_426;
    let __VLS_414;
}
let __VLS_410;
const __VLS_431 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_432 = __VLS_asFunctionalComponent(__VLS_431, new __VLS_431({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}));
const __VLS_433 = __VLS_432({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_432));
let __VLS_435;
let __VLS_436;
let __VLS_437;
const __VLS_438 = {
    onClick: (__VLS_ctx.handleAddBackupInterface)
};
__VLS_434.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_434.slots;
    const __VLS_439 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
    // @ts-ignore
    const __VLS_440 = __VLS_asFunctionalComponent(__VLS_439, new __VLS_439({}));
    const __VLS_441 = __VLS_440({}, ...__VLS_functionalComponentArgsRest(__VLS_440));
}
let __VLS_434;
let __VLS_406;
let __VLS_314;
let __VLS_310;
let __VLS_220;
let __VLS_211;
/** @type {__VLS_StyleScopedClasses['external-detail-page']} */ 
/** @type {__VLS_StyleScopedClasses['main-info']} */ 
/** @type {__VLS_StyleScopedClasses['title-section']} */ 
/** @type {__VLS_StyleScopedClasses['data-title']} */ 
/** @type {__VLS_StyleScopedClasses['tag-group']} */ 
/** @type {__VLS_StyleScopedClasses['basic-info']} */ 
/** @type {__VLS_StyleScopedClasses['action-panel']} */ 
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ 
/** @type {__VLS_StyleScopedClasses['is-favorite']} */ 
/** @type {__VLS_StyleScopedClasses['main-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
/** @type {__VLS_StyleScopedClasses['info-card']} */ 
// @ts-ignore
const __VLS_234 = __VLS_233, __VLS_324 = __VLS_323, __VLS_370 = __VLS_369;
let __VLS_dollars;
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
 /* PartiallyEnd: #4569/main.vue */
