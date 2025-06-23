/// <reference types="../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IconLeft, IconEdit, IconStar, IconStarFill } from '@arco-design/web-vue/es/icon';
import { Statistic } from '@arco-design/web-vue';
const route = useRoute();
const router = useRouter();
import { generateExternalDataDetail, generateExternalDataStatistics } from '@/mock/external-data-v1';
const statistics = ref(generateExternalDataStatistics());
const dataDetail = ref({
    interfaceId: '',
    dataName: '',
    dataType: '',
    subType: '',
    supplier: '',
    description: '',
    price: 0,
    inputParams: [],
    metadataData: [],
    manager: '',
    isFavorite: false,
    apiUrl: '',
    targetTable: '',
    status: '',
    interfaceTag: '',
    onlineTime: '',
    updateFrequency: '',
    dataSource: '',
    requestMethod: '',
    headers: '',
    timeout: 0,
    qpsLimit: 0,
    // 落库信息
    storageInfo: [],
    metadataData: [],
    // 产品入参
    inputParams: [],
    // 产品出参
    outputParams: [],
    // 调用及费用
    usageInfo: [],
    // 变量评估
    evaluationInfo: []
});
const getTagColor = (type) => {
    const colors = {
        '核验类': 'arcoblue',
        '评分类': 'orangered',
        '标签类': 'green',
        '名单类': 'purple',
        '价格评估类': 'gold',
        '身份核验类': 'blue',
        '信用评分': 'orange',
        '用户画像': 'green',
        '风险名单': 'red',
        '资产评估': 'gold'
    };
    return colors[type] || 'gray';
};
const toggleFavorite = () => {
    dataDetail.value.isFavorite = !dataDetail.value.isFavorite;
};
const editModalVisible = ref(false);
const editForm = ref({
    dataType: '',
    subType: '',
    supplier: '',
    price: 0,
    description: '',
    storageTable: '',
    interfaceTag: ''
});
const handleEdit = () => {
    editForm.value = {
        dataType: dataDetail.value.dataType,
        subType: dataDetail.value.subType,
        supplier: dataDetail.value.supplier,
        price: dataDetail.value.price,
        description: dataDetail.value.description,
        storageTable: dataDetail.value.storageInfo?.[0]?.value || '',
        interfaceTag: dataDetail.value.interfaceTag || ''
    };
    editModalVisible.value = true;
};
const handleSave = () => {
    dataDetail.value.dataType = editForm.value.dataType;
    dataDetail.value.subType = editForm.value.subType;
    dataDetail.value.supplier = editForm.value.supplier;
    dataDetail.value.price = editForm.value.price;
    dataDetail.value.description = editForm.value.description;
    dataDetail.value.interfaceTag = editForm.value.interfaceTag;
    if (dataDetail.value.storageInfo.length > 0) {
        dataDetail.value.storageInfo[0].value = editForm.value.storageTable;
    }
    editModalVisible.value = false;
};
const combinedBasicInfo = computed(() => [
    { label: '接口编号', value: dataDetail.value.interfaceId },
    { label: '数据分类', value: dataDetail.value.subType },
    { label: '供应商', value: dataDetail.value.supplier },
    { label: '单价', value: `${dataDetail.value.price}元/次` },
    { label: '管理人员', value: dataDetail.value.manager },
    { label: '上线时间', value: dataDetail.value.onlineTime },
    { label: '接口状态', value: dataDetail.value.status },
    { label: '接口标签', value: dataDetail.value.interfaceTag },
    { label: '更新频率', value: dataDetail.value.updateFrequency },
    { label: '数据来源', value: dataDetail.value.dataSource }
]);
const interfaceInfo = computed(() => [
    { label: '请求方式', value: dataDetail.value.requestMethod },
    { label: '请求地址', value: dataDetail.value.apiUrl },
    { label: 'Headers', value: dataDetail.value.headers },
    { label: '请求超时', value: `${dataDetail.value.timeout}秒` },
    { label: 'QPS限制', value: `${dataDetail.value.qpsLimit}次/秒` },
    { label: '目标表', value: dataDetail.value.targetTable }
]);
const storageInfo = computed(() => [
    { label: '落库表名', value: dataDetail.value.targetTable },
    { label: '数据格式', value: 'JSON' },
    { label: '更新频率', value: dataDetail.value.updateFrequency },
    { label: '数据来源', value: dataDetail.value.dataSource }
]);
const outputParams = ref([]);
const usageInfo = ref([]);
const evaluationInfo = ref([]);
const inputParams = ref([]);
const metadataData = ref([]);
onMounted(() => {
    // 根据路由参数获取数据详情
    dataDetail.value = generateExternalDataDetail(route.params.id);
    // 初始化表格数据
    outputParams.value = dataDetail.value.outputParams || [];
    usageInfo.value = dataDetail.value.usageInfo || [];
    evaluationInfo.value = dataDetail.value.evaluationInfo || [];
});
const metadataColumns = [
    { title: '字段名称', dataIndex: 'field' },
    { title: '字段类型', dataIndex: 'type' },
    { title: '字段说明', dataIndex: 'comment' }
];
const inputColumns = [
    { title: '参数名称', dataIndex: 'name' },
    { title: '参数类型', dataIndex: 'type' },
    { title: '是否必填', dataIndex: 'required', render: ({ record }) => record.required ? '是' : '否' },
    { title: '参数说明', dataIndex: 'description' }
];
const outputColumns = [
    { title: '参数名称', dataIndex: 'name' },
    { title: '参数类型', dataIndex: 'type' },
    { title: '参数说明', dataIndex: 'description' }
];
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
    gutter: (16),
    ...{ class: "status-cards" },
}));
const __VLS_11 = __VLS_10({
    gutter: (16),
    ...{ class: "status-cards" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    span: (6),
}));
const __VLS_15 = __VLS_14({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ class: "status-card" },
}));
const __VLS_19 = __VLS_18({
    ...{ class: "status-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.statistic;
/** @type {[typeof __VLS_components.Statistic, typeof __VLS_components.statistic, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    title: "注册中",
    value: (__VLS_ctx.statistics.registering),
}));
const __VLS_23 = __VLS_22({
    title: "注册中",
    value: (__VLS_ctx.statistics.registering),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
var __VLS_20;
var __VLS_16;
const __VLS_25 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    span: (6),
}));
const __VLS_27 = __VLS_26({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
const __VLS_29 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ class: "status-card" },
}));
const __VLS_31 = __VLS_30({
    ...{ class: "status-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_32.slots.default;
const __VLS_33 = {}.statistic;
/** @type {[typeof __VLS_components.Statistic, typeof __VLS_components.statistic, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    title: "待上线",
    value: (__VLS_ctx.statistics.pending),
}));
const __VLS_35 = __VLS_34({
    title: "待上线",
    value: (__VLS_ctx.statistics.pending),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
var __VLS_32;
var __VLS_28;
const __VLS_37 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    span: (6),
}));
const __VLS_39 = __VLS_38({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
const __VLS_41 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    ...{ class: "status-card" },
}));
const __VLS_43 = __VLS_42({
    ...{ class: "status-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
const __VLS_45 = {}.statistic;
/** @type {[typeof __VLS_components.Statistic, typeof __VLS_components.statistic, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    title: "已上线",
    value: (__VLS_ctx.statistics.online),
}));
const __VLS_47 = __VLS_46({
    title: "已上线",
    value: (__VLS_ctx.statistics.online),
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
var __VLS_44;
var __VLS_40;
const __VLS_49 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    span: (6),
}));
const __VLS_51 = __VLS_50({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
const __VLS_53 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    ...{ class: "status-card" },
}));
const __VLS_55 = __VLS_54({
    ...{ class: "status-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
const __VLS_57 = {}.statistic;
/** @type {[typeof __VLS_components.Statistic, typeof __VLS_components.statistic, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    title: "已下线",
    value: (__VLS_ctx.statistics.offline),
}));
const __VLS_59 = __VLS_58({
    title: "已下线",
    value: (__VLS_ctx.statistics.offline),
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
var __VLS_56;
var __VLS_52;
var __VLS_12;
const __VLS_61 = {}.ADrawer;
/** @type {[typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, typeof __VLS_components.ADrawer, typeof __VLS_components.aDrawer, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    visible: (__VLS_ctx.editModalVisible),
    title: "编辑数据信息",
    width: "600px",
    footer: (true),
}));
const __VLS_63 = __VLS_62({
    visible: (__VLS_ctx.editModalVisible),
    title: "编辑数据信息",
    width: "600px",
    footer: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
const __VLS_65 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}));
const __VLS_67 = __VLS_66({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
const __VLS_69 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    label: "数据种类",
}));
const __VLS_71 = __VLS_70({
    label: "数据种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
const __VLS_73 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数据种类",
}));
const __VLS_75 = __VLS_74({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数据种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
const __VLS_77 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    value: "核验类",
}));
const __VLS_79 = __VLS_78({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
var __VLS_80;
const __VLS_81 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    value: "评分类",
}));
const __VLS_83 = __VLS_82({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
var __VLS_84;
const __VLS_85 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    value: "标签类",
}));
const __VLS_87 = __VLS_86({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
var __VLS_88;
const __VLS_89 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    value: "名单类",
}));
const __VLS_91 = __VLS_90({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
var __VLS_92;
const __VLS_93 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    value: "价格评估类",
}));
const __VLS_95 = __VLS_94({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
var __VLS_96;
var __VLS_76;
var __VLS_72;
const __VLS_97 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    label: "数据分类",
}));
const __VLS_99 = __VLS_98({
    label: "数据分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
const __VLS_101 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请输入数据分类",
}));
const __VLS_103 = __VLS_102({
    modelValue: (__VLS_ctx.editForm.subType),
    placeholder: "请输入数据分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
var __VLS_100;
const __VLS_105 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    label: "供应商",
}));
const __VLS_107 = __VLS_106({
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_108.slots.default;
const __VLS_109 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}));
const __VLS_111 = __VLS_110({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
var __VLS_108;
const __VLS_113 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    label: "单价(元/次)",
}));
const __VLS_115 = __VLS_114({
    label: "单价(元/次)",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
__VLS_116.slots.default;
const __VLS_117 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    modelValue: (__VLS_ctx.editForm.price),
    min: (0),
}));
const __VLS_119 = __VLS_118({
    modelValue: (__VLS_ctx.editForm.price),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
var __VLS_116;
const __VLS_121 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    label: "描述信息",
}));
const __VLS_123 = __VLS_122({
    label: "描述信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
const __VLS_125 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入描述信息",
}));
const __VLS_127 = __VLS_126({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入描述信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
var __VLS_124;
const __VLS_129 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    label: "落库表名",
}));
const __VLS_131 = __VLS_130({
    label: "落库表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
const __VLS_133 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    modelValue: (__VLS_ctx.editForm.storageTable),
    placeholder: "请输入落库表名",
}));
const __VLS_135 = __VLS_134({
    modelValue: (__VLS_ctx.editForm.storageTable),
    placeholder: "请输入落库表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
var __VLS_132;
const __VLS_137 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    label: "接口标签",
}));
const __VLS_139 = __VLS_138({
    label: "接口标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
const __VLS_141 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    modelValue: (__VLS_ctx.editForm.interfaceTag),
    placeholder: "请选择接口标签",
}));
const __VLS_143 = __VLS_142({
    modelValue: (__VLS_ctx.editForm.interfaceTag),
    placeholder: "请选择接口标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
const __VLS_145 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    value: "主接口",
}));
const __VLS_147 = __VLS_146({
    value: "主接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
var __VLS_148;
const __VLS_149 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    value: "备接口",
}));
const __VLS_151 = __VLS_150({
    value: "备接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
var __VLS_152;
var __VLS_144;
var __VLS_140;
var __VLS_68;
{
    const { footer: __VLS_thisSlot } = __VLS_64.slots;
    const __VLS_153 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({}));
    const __VLS_155 = __VLS_154({}, ...__VLS_functionalComponentArgsRest(__VLS_154));
    __VLS_156.slots.default;
    const __VLS_157 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        ...{ 'onClick': {} },
    }));
    const __VLS_159 = __VLS_158({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    let __VLS_161;
    let __VLS_162;
    let __VLS_163;
    const __VLS_164 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editModalVisible = false;
        }
    };
    __VLS_160.slots.default;
    var __VLS_160;
    const __VLS_165 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_167 = __VLS_166({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    let __VLS_169;
    let __VLS_170;
    let __VLS_171;
    const __VLS_172 = {
        onClick: (__VLS_ctx.handleSave)
    };
    __VLS_168.slots.default;
    var __VLS_168;
    var __VLS_156;
}
var __VLS_64;
const __VLS_173 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    bordered: (false),
    ...{ class: "main-info" },
}));
const __VLS_175 = __VLS_174({
    bordered: (false),
    ...{ class: "main-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    gutter: (24),
}));
const __VLS_179 = __VLS_178({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_180.slots.default;
const __VLS_181 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
    span: (18),
}));
const __VLS_183 = __VLS_182({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
__VLS_184.slots.default;
const __VLS_185 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
    direction: "vertical",
    fill: true,
}));
const __VLS_187 = __VLS_186({
    direction: "vertical",
    fill: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_188.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-section" },
});
const __VLS_189 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    align: "center",
}));
const __VLS_191 = __VLS_190({
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
__VLS_192.slots.default;
const __VLS_193 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
    ...{ 'onClick': {} },
    type: "text",
}));
const __VLS_195 = __VLS_194({
    ...{ 'onClick': {} },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
let __VLS_197;
let __VLS_198;
let __VLS_199;
const __VLS_200 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
__VLS_196.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_196.slots;
    const __VLS_201 = {}.IconLeft;
    /** @type {[typeof __VLS_components.IconLeft, typeof __VLS_components.iconLeft, ]} */ ;
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({}));
    const __VLS_203 = __VLS_202({}, ...__VLS_functionalComponentArgsRest(__VLS_202));
}
var __VLS_196;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "data-title" },
});
(__VLS_ctx.dataDetail.dataName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-group" },
});
const __VLS_205 = {}.ATag;
/** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.dataType)),
}));
const __VLS_207 = __VLS_206({
    color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.dataType)),
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
__VLS_208.slots.default;
(__VLS_ctx.dataDetail.dataType);
var __VLS_208;
if (__VLS_ctx.dataDetail.subType) {
    const __VLS_209 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
        color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.subType)),
    }));
    const __VLS_211 = __VLS_210({
        color: (__VLS_ctx.getTagColor(__VLS_ctx.dataDetail.subType)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    __VLS_212.slots.default;
    (__VLS_ctx.dataDetail.subType);
    var __VLS_212;
}
var __VLS_192;
const __VLS_213 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}));
const __VLS_215 = __VLS_214({
    column: (2),
    size: "large",
    ...{ class: "basic-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
__VLS_216.slots.default;
const __VLS_217 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
    label: "接口编号",
}));
const __VLS_219 = __VLS_218({
    label: "接口编号",
}, ...__VLS_functionalComponentArgsRest(__VLS_218));
__VLS_220.slots.default;
(__VLS_ctx.dataDetail.interfaceId);
var __VLS_220;
const __VLS_221 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
    label: "供应商",
}));
const __VLS_223 = __VLS_222({
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
__VLS_224.slots.default;
(__VLS_ctx.dataDetail.supplier);
var __VLS_224;
const __VLS_225 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
    label: "单价",
}));
const __VLS_227 = __VLS_226({
    label: "单价",
}, ...__VLS_functionalComponentArgsRest(__VLS_226));
__VLS_228.slots.default;
(__VLS_ctx.dataDetail.price);
var __VLS_228;
const __VLS_229 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    label: "管理人员",
}));
const __VLS_231 = __VLS_230({
    label: "管理人员",
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
__VLS_232.slots.default;
(__VLS_ctx.dataDetail.manager);
var __VLS_232;
const __VLS_233 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
    label: "描述信息",
    span: (2),
}));
const __VLS_235 = __VLS_234({
    label: "描述信息",
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
__VLS_236.slots.default;
(__VLS_ctx.dataDetail.description || '暂无描述');
var __VLS_236;
var __VLS_216;
var __VLS_188;
var __VLS_184;
const __VLS_237 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
    span: (6),
    ...{ class: "action-panel" },
}));
const __VLS_239 = __VLS_238({
    span: (6),
    ...{ class: "action-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
__VLS_240.slots.default;
const __VLS_241 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({}));
const __VLS_243 = __VLS_242({}, ...__VLS_functionalComponentArgsRest(__VLS_242));
__VLS_244.slots.default;
const __VLS_245 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_247 = __VLS_246({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
let __VLS_249;
let __VLS_250;
let __VLS_251;
const __VLS_252 = {
    onClick: (__VLS_ctx.handleEdit)
};
__VLS_248.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_248.slots;
    const __VLS_253 = {}.IconEdit;
    /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({}));
    const __VLS_255 = __VLS_254({}, ...__VLS_functionalComponentArgsRest(__VLS_254));
}
var __VLS_248;
const __VLS_257 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: ({ 'favorite-btn': true, 'is-favorite': __VLS_ctx.dataDetail.isFavorite }) },
}));
const __VLS_259 = __VLS_258({
    ...{ 'onClick': {} },
    type: "text",
    ...{ class: ({ 'favorite-btn': true, 'is-favorite': __VLS_ctx.dataDetail.isFavorite }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_258));
let __VLS_261;
let __VLS_262;
let __VLS_263;
const __VLS_264 = {
    onClick: (__VLS_ctx.toggleFavorite)
};
__VLS_260.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_260.slots;
    if (__VLS_ctx.dataDetail.isFavorite) {
        const __VLS_265 = {}.IconStarFill;
        /** @type {[typeof __VLS_components.IconStarFill, typeof __VLS_components.iconStarFill, ]} */ ;
        // @ts-ignore
        const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({}));
        const __VLS_267 = __VLS_266({}, ...__VLS_functionalComponentArgsRest(__VLS_266));
    }
    else {
        const __VLS_269 = {}.IconStar;
        /** @type {[typeof __VLS_components.IconStar, typeof __VLS_components.iconStar, ]} */ ;
        // @ts-ignore
        const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({}));
        const __VLS_271 = __VLS_270({}, ...__VLS_functionalComponentArgsRest(__VLS_270));
    }
}
(__VLS_ctx.dataDetail.isFavorite ? '取消收藏' : '收藏');
var __VLS_260;
var __VLS_244;
var __VLS_240;
var __VLS_180;
var __VLS_176;
const __VLS_273 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
    bordered: (false),
    ...{ class: "main-card" },
}));
const __VLS_275 = __VLS_274({
    bordered: (false),
    ...{ class: "main-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
__VLS_276.slots.default;
const __VLS_277 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_278 = __VLS_asFunctionalComponent(__VLS_277, new __VLS_277({}));
const __VLS_279 = __VLS_278({}, ...__VLS_functionalComponentArgsRest(__VLS_278));
__VLS_280.slots.default;
const __VLS_281 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({
    key: "1",
    title: "基本信息",
}));
const __VLS_283 = __VLS_282({
    key: "1",
    title: "基本信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_282));
__VLS_284.slots.default;
const __VLS_285 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_286 = __VLS_asFunctionalComponent(__VLS_285, new __VLS_285({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_287 = __VLS_286({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_286));
__VLS_288.slots.default;
const __VLS_289 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({
    column: (2),
    data: (__VLS_ctx.combinedBasicInfo),
}));
const __VLS_291 = __VLS_290({
    column: (2),
    data: (__VLS_ctx.combinedBasicInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_290));
const __VLS_293 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({
    ...{ style: {} },
}));
const __VLS_295 = __VLS_294({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_294));
const __VLS_297 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_298 = __VLS_asFunctionalComponent(__VLS_297, new __VLS_297({
    column: (2),
    data: (__VLS_ctx.interfaceInfo),
}));
const __VLS_299 = __VLS_298({
    column: (2),
    data: (__VLS_ctx.interfaceInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_298));
var __VLS_288;
var __VLS_284;
const __VLS_301 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({
    key: "2",
    title: "落库信息",
}));
const __VLS_303 = __VLS_302({
    key: "2",
    title: "落库信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_302));
__VLS_304.slots.default;
const __VLS_305 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_307 = __VLS_306({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_306));
__VLS_308.slots.default;
const __VLS_309 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
    column: (2),
    data: (__VLS_ctx.storageInfo),
}));
const __VLS_311 = __VLS_310({
    column: (2),
    data: (__VLS_ctx.storageInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_310));
const __VLS_313 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({
    ...{ style: {} },
}));
const __VLS_315 = __VLS_314({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_314));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_317 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
    columns: (__VLS_ctx.metadataColumns),
    data: (__VLS_ctx.metadataData),
    pagination: (false),
}));
const __VLS_319 = __VLS_318({
    columns: (__VLS_ctx.metadataColumns),
    data: (__VLS_ctx.metadataData),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_318));
var __VLS_308;
var __VLS_304;
const __VLS_321 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_322 = __VLS_asFunctionalComponent(__VLS_321, new __VLS_321({
    key: "3",
    title: "产品入参",
}));
const __VLS_323 = __VLS_322({
    key: "3",
    title: "产品入参",
}, ...__VLS_functionalComponentArgsRest(__VLS_322));
__VLS_324.slots.default;
const __VLS_325 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_327 = __VLS_326({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_326));
__VLS_328.slots.default;
const __VLS_329 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
    columns: (__VLS_ctx.inputColumns),
    data: (__VLS_ctx.inputParams),
    pagination: (false),
}));
const __VLS_331 = __VLS_330({
    columns: (__VLS_ctx.inputColumns),
    data: (__VLS_ctx.inputParams),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_330));
var __VLS_328;
var __VLS_324;
const __VLS_333 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({
    key: "4",
    title: "产品出参",
}));
const __VLS_335 = __VLS_334({
    key: "4",
    title: "产品出参",
}, ...__VLS_functionalComponentArgsRest(__VLS_334));
__VLS_336.slots.default;
const __VLS_337 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_339 = __VLS_338({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_338));
__VLS_340.slots.default;
const __VLS_341 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
    columns: (__VLS_ctx.outputColumns),
    data: (__VLS_ctx.outputParams),
    pagination: (false),
}));
const __VLS_343 = __VLS_342({
    columns: (__VLS_ctx.outputColumns),
    data: (__VLS_ctx.outputParams),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_342));
var __VLS_340;
var __VLS_336;
const __VLS_345 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
    key: "5",
    title: "调用及费用",
}));
const __VLS_347 = __VLS_346({
    key: "5",
    title: "调用及费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_346));
__VLS_348.slots.default;
const __VLS_349 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_351 = __VLS_350({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_350));
__VLS_352.slots.default;
const __VLS_353 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}));
const __VLS_355 = __VLS_354({
    column: (2),
    data: (__VLS_ctx.usageInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_354));
var __VLS_352;
var __VLS_348;
const __VLS_357 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
// @ts-ignore
const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({
    key: "6",
    title: "变量评估",
}));
const __VLS_359 = __VLS_358({
    key: "6",
    title: "变量评估",
}, ...__VLS_functionalComponentArgsRest(__VLS_358));
__VLS_360.slots.default;
const __VLS_361 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_362 = __VLS_asFunctionalComponent(__VLS_361, new __VLS_361({
    bordered: (false),
    ...{ class: "info-card" },
}));
const __VLS_363 = __VLS_362({
    bordered: (false),
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_362));
__VLS_364.slots.default;
const __VLS_365 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}));
const __VLS_367 = __VLS_366({
    column: (2),
    data: (__VLS_ctx.evaluationInfo),
}, ...__VLS_functionalComponentArgsRest(__VLS_366));
var __VLS_364;
var __VLS_360;
var __VLS_280;
var __VLS_276;
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['status-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
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
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconLeft: IconLeft,
            IconEdit: IconEdit,
            IconStar: IconStar,
            IconStarFill: IconStarFill,
            Statistic: Statistic,
            statistics: statistics,
            dataDetail: dataDetail,
            getTagColor: getTagColor,
            toggleFavorite: toggleFavorite,
            editModalVisible: editModalVisible,
            editForm: editForm,
            handleEdit: handleEdit,
            handleSave: handleSave,
            combinedBasicInfo: combinedBasicInfo,
            interfaceInfo: interfaceInfo,
            storageInfo: storageInfo,
            outputParams: outputParams,
            usageInfo: usageInfo,
            evaluationInfo: evaluationInfo,
            inputParams: inputParams,
            metadataData: metadataData,
            metadataColumns: metadataColumns,
            inputColumns: inputColumns,
            outputColumns: outputColumns,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
