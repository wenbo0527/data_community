/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, reactive, onMounted, h } from 'vue';
const handleChannelChange = (value) => {
    // 处理渠道变更逻辑
};
import { IconSearch, IconRefresh, IconEye, IconExperiment } from '@arco-design/web-vue/es/icon';
import { Tag as ATag } from '@arco-design/web-vue';
// 搜索表单
const searchForm = reactive({
    templateId: '',
    messageType: '',
    title: ''
});
const templateList = ref([]);
const loading = ref(false);
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
});
// 表格列配置
const showCreateModal = ref(false);
const formState = reactive({
    title: '',
    messageType: '',
    scene: '',
    tags: [],
    product: '',
    channel: '',
    frequencyControl: '',
    sendCount: 1,
    sendTime: '',
    taskId: '',
    needShortMessage: false,
    shortMessageTemplate: ''
});
const channelOptions = [
    { label: '短信', value: 'sms' },
    { label: 'AI外呼', value: 'ai_call' },
    { label: '人工外呼', value: 'manual_call' }
];
const handleCreate = () => {
    // 表单提交逻辑
};
const columns = [
    {
        title: '模板ID',
        dataIndex: 'id',
        width: 120
    },
    {
        title: '消息类型',
        dataIndex: 'messageType',
        width: 100,
        render: ({ record }) => {
            const typeMap = {
                sms: '短信',
                push: '推送',
                email: '邮件'
            };
            return typeMap[record.messageType] || record.messageType;
        }
    },
    {
        title: '一级场景',
        dataIndex: 'scene',
        width: 120
    },
    {
        title: '策略Tag',
        dataIndex: 'tags',
        render: ({ record }) => {
            return h('div', record.tags?.map((tag) => h(ATag, { color: 'blue', style: { marginRight: '4px' } }, () => tag)));
        }
    },
    {
        title: '消息标题',
        dataIndex: 'title',
        ellipsis: true,
        tooltip: true
    },
    {
        title: '消息策略',
        dataIndex: 'strategy',
        ellipsis: true,
        tooltip: true
    },
    {
        title: '操作',
        slotName: 'operations',
        width: 150
    }
];
// 搜索
const handleSearch = () => {
    pagination.current = 1;
    fetchData();
};
// 重置搜索
const resetSearch = () => {
    Object.keys(searchForm).forEach(key => {
        searchForm[key] = '';
    });
    handleSearch();
};
// 分页变化
const handlePageChange = (current) => {
    pagination.current = current;
    fetchData();
};
// 查看详情
const viewDetail = (record) => {
    console.log('查看详情', record);
};
// 测试模板
const testTemplate = (record) => {
    console.log('测试模板', record);
};
// 获取数据
const fetchData = async () => {
    loading.value = true;
    try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500));
        // 模拟数据
        templateList.value = Array.from({ length: 10 }, (_, i) => ({
            id: `TP${1000 + i}`,
            messageType: ['sms', 'push', 'email'][i % 3],
            scene: ['营销', '风控', '通知'][i % 3],
            tags: [['高优先级', '测试', '正式'][i % 3]],
            title: `模板标题${i + 1}`,
            strategy: `策略描述${i + 1}`
        }));
        pagination.total = 30;
    }
    catch (error) {
        console.error('获取模板列表失败', error);
    }
    finally {
        loading.value = false;
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
    ...{ class: "policy-template-container" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "search-card" },
    bordered: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "search-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    model: (__VLS_ctx.searchForm),
    layout: "inline",
}));
const __VLS_6 = __VLS_5({
    model: (__VLS_ctx.searchForm),
    layout: "inline",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    label: "模板ID",
}));
const __VLS_10 = __VLS_9({
    label: "模板ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.searchForm.templateId),
    placeholder: "请输入模板ID",
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.searchForm.templateId),
    placeholder: "请输入模板ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
const __VLS_16 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "消息类型",
}));
const __VLS_18 = __VLS_17({
    label: "消息类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.searchForm.messageType),
    placeholder: "请选择消息类型",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.searchForm.messageType),
    placeholder: "请选择消息类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    value: "sms",
}));
const __VLS_26 = __VLS_25({
    value: "sms",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
const __VLS_28 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    value: "push",
}));
const __VLS_30 = __VLS_29({
    value: "push",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
var __VLS_31;
const __VLS_32 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    value: "email",
}));
const __VLS_34 = __VLS_33({
    value: "email",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
var __VLS_35;
var __VLS_23;
var __VLS_19;
const __VLS_36 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "消息标题",
}));
const __VLS_38 = __VLS_37({
    label: "消息标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.searchForm.title),
    placeholder: "请输入消息标题",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.searchForm.title),
    placeholder: "请输入消息标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_39;
const __VLS_44 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_51.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_51.slots;
    const __VLS_56 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
}
var __VLS_51;
const __VLS_60 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (__VLS_ctx.resetSearch)
};
__VLS_63.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_63.slots;
    const __VLS_68 = {}.IconRefresh;
    /** @type {[typeof __VLS_components.IconRefresh, typeof __VLS_components.iconRefresh, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
}
var __VLS_63;
var __VLS_47;
var __VLS_7;
var __VLS_3;
const __VLS_72 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ class: "table-card" },
    bordered: (false),
}));
const __VLS_74 = __VLS_73({
    ...{ class: "table-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_75.slots;
    const __VLS_76 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showCreateModal = true;
        }
    };
    __VLS_79.slots.default;
    var __VLS_79;
}
const __VLS_84 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: "新建策略模板",
    width: "800px",
}));
const __VLS_86 = __VLS_85({
    ...{ 'onOk': {} },
    visible: (__VLS_ctx.showCreateModal),
    title: "新建策略模板",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onOk: (__VLS_ctx.handleCreate)
};
__VLS_87.slots.default;
const __VLS_92 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    model: (__VLS_ctx.formState),
    layout: "vertical",
}));
const __VLS_94 = __VLS_93({
    model: (__VLS_ctx.formState),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "标题",
    required: true,
}));
const __VLS_98 = __VLS_97({
    label: "标题",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.formState.title),
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.formState.title),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
var __VLS_99;
const __VLS_104 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "消息类型",
    required: true,
}));
const __VLS_106 = __VLS_105({
    label: "消息类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.formState.messageType),
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.formState.messageType),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    value: "sms",
}));
const __VLS_114 = __VLS_113({
    value: "sms",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
var __VLS_115;
const __VLS_116 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    value: "push",
}));
const __VLS_118 = __VLS_117({
    value: "push",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
var __VLS_119;
const __VLS_120 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    value: "email",
}));
const __VLS_122 = __VLS_121({
    value: "email",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
var __VLS_123;
var __VLS_111;
var __VLS_107;
const __VLS_124 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "一级场景",
    required: true,
}));
const __VLS_126 = __VLS_125({
    label: "一级场景",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.formState.scene),
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.formState.scene),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    value: "marketing",
}));
const __VLS_134 = __VLS_133({
    value: "marketing",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
var __VLS_135;
const __VLS_136 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    value: "risk",
}));
const __VLS_138 = __VLS_137({
    value: "risk",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
var __VLS_139;
const __VLS_140 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    value: "notification",
}));
const __VLS_142 = __VLS_141({
    value: "notification",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
var __VLS_143;
var __VLS_131;
var __VLS_127;
const __VLS_144 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "策略Tag",
    required: true,
}));
const __VLS_146 = __VLS_145({
    label: "策略Tag",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.formState.tags),
    mode: "multiple",
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.formState.tags),
    mode: "multiple",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    value: "high_priority",
}));
const __VLS_154 = __VLS_153({
    value: "high_priority",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
var __VLS_155;
const __VLS_156 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    value: "test",
}));
const __VLS_158 = __VLS_157({
    value: "test",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
var __VLS_159;
const __VLS_160 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    value: "production",
}));
const __VLS_162 = __VLS_161({
    value: "production",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
var __VLS_163;
var __VLS_151;
var __VLS_147;
const __VLS_164 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    label: "目标渠道",
    required: true,
}));
const __VLS_166 = __VLS_165({
    label: "目标渠道",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.formState.channel),
}));
const __VLS_170 = __VLS_169({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.formState.channel),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
let __VLS_172;
let __VLS_173;
let __VLS_174;
const __VLS_175 = {
    onChange: (__VLS_ctx.handleChannelChange)
};
__VLS_171.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.channelOptions))) {
    const __VLS_176 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        key: (item.value),
        value: (item.value),
    }));
    const __VLS_178 = __VLS_177({
        key: (item.value),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_179.slots.default;
    (item.label);
    var __VLS_179;
}
var __VLS_171;
var __VLS_167;
if (__VLS_ctx.formState.channel === 'sms') {
    const __VLS_180 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        label: "短信模板",
    }));
    const __VLS_182 = __VLS_181({
        label: "短信模板",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    const __VLS_184 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        modelValue: (__VLS_ctx.formState.shortMessageTemplate),
    }));
    const __VLS_186 = __VLS_185({
        modelValue: (__VLS_ctx.formState.shortMessageTemplate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    const __VLS_188 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        value: "template1",
    }));
    const __VLS_190 = __VLS_189({
        value: "template1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    __VLS_191.slots.default;
    var __VLS_191;
    const __VLS_192 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        value: "template2",
    }));
    const __VLS_194 = __VLS_193({
        value: "template2",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_195.slots.default;
    var __VLS_195;
    var __VLS_187;
    var __VLS_183;
}
else {
    const __VLS_196 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        label: "任务ID",
        required: true,
    }));
    const __VLS_198 = __VLS_197({
        label: "任务ID",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    __VLS_199.slots.default;
    const __VLS_200 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        modelValue: (__VLS_ctx.formState.taskId),
    }));
    const __VLS_202 = __VLS_201({
        modelValue: (__VLS_ctx.formState.taskId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    var __VLS_199;
    const __VLS_204 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        label: "是否需要挂短",
    }));
    const __VLS_206 = __VLS_205({
        label: "是否需要挂短",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    const __VLS_208 = {}.ASwitch;
    /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        modelValue: (__VLS_ctx.formState.needShortMessage),
    }));
    const __VLS_210 = __VLS_209({
        modelValue: (__VLS_ctx.formState.needShortMessage),
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    var __VLS_207;
    if (__VLS_ctx.formState.needShortMessage) {
        const __VLS_212 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
            label: "短信模板",
        }));
        const __VLS_214 = __VLS_213({
            label: "短信模板",
        }, ...__VLS_functionalComponentArgsRest(__VLS_213));
        __VLS_215.slots.default;
        const __VLS_216 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
            modelValue: (__VLS_ctx.formState.shortMessageTemplate),
        }));
        const __VLS_218 = __VLS_217({
            modelValue: (__VLS_ctx.formState.shortMessageTemplate),
        }, ...__VLS_functionalComponentArgsRest(__VLS_217));
        __VLS_219.slots.default;
        const __VLS_220 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
            value: "template1",
        }));
        const __VLS_222 = __VLS_221({
            value: "template1",
        }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        __VLS_223.slots.default;
        var __VLS_223;
        const __VLS_224 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
            value: "template2",
        }));
        const __VLS_226 = __VLS_225({
            value: "template2",
        }, ...__VLS_functionalComponentArgsRest(__VLS_225));
        __VLS_227.slots.default;
        var __VLS_227;
        var __VLS_219;
        var __VLS_215;
    }
}
const __VLS_228 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    label: "发送次数",
    required: true,
}));
const __VLS_230 = __VLS_229({
    label: "发送次数",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
const __VLS_232 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    modelValue: (__VLS_ctx.formState.sendCount),
    min: (1),
}));
const __VLS_234 = __VLS_233({
    modelValue: (__VLS_ctx.formState.sendCount),
    min: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
var __VLS_231;
const __VLS_236 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    label: "发送时间",
    required: true,
}));
const __VLS_238 = __VLS_237({
    label: "发送时间",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
const __VLS_240 = {}.ADatePicker;
/** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    modelValue: (__VLS_ctx.formState.sendTime),
    showTime: true,
}));
const __VLS_242 = __VLS_241({
    modelValue: (__VLS_ctx.formState.sendTime),
    showTime: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
var __VLS_239;
var __VLS_95;
var __VLS_87;
const __VLS_244 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    ...{ 'onPageChange': {} },
    data: (__VLS_ctx.templateList),
    columns: (__VLS_ctx.columns),
    pagination: (__VLS_ctx.pagination),
    loading: (__VLS_ctx.loading),
}));
const __VLS_246 = __VLS_245({
    ...{ 'onPageChange': {} },
    data: (__VLS_ctx.templateList),
    columns: (__VLS_ctx.columns),
    pagination: (__VLS_ctx.pagination),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
let __VLS_248;
let __VLS_249;
let __VLS_250;
const __VLS_251 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
__VLS_247.slots.default;
{
    const { operations: __VLS_thisSlot } = __VLS_247.slots;
    const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_252 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({}));
    const __VLS_254 = __VLS_253({}, ...__VLS_functionalComponentArgsRest(__VLS_253));
    __VLS_255.slots.default;
    const __VLS_256 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_258 = __VLS_257({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    let __VLS_260;
    let __VLS_261;
    let __VLS_262;
    const __VLS_263 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewDetail(record);
        }
    };
    __VLS_259.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_259.slots;
        const __VLS_264 = {}.IconEye;
        /** @type {[typeof __VLS_components.IconEye, typeof __VLS_components.iconEye, ]} */ ;
        // @ts-ignore
        const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({}));
        const __VLS_266 = __VLS_265({}, ...__VLS_functionalComponentArgsRest(__VLS_265));
    }
    var __VLS_259;
    const __VLS_268 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }));
    const __VLS_270 = __VLS_269({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_269));
    let __VLS_272;
    let __VLS_273;
    let __VLS_274;
    const __VLS_275 = {
        onClick: (...[$event]) => {
            __VLS_ctx.testTemplate(record);
        }
    };
    __VLS_271.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_271.slots;
        const __VLS_276 = {}.IconExperiment;
        /** @type {[typeof __VLS_components.IconExperiment, typeof __VLS_components.iconExperiment, ]} */ ;
        // @ts-ignore
        const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({}));
        const __VLS_278 = __VLS_277({}, ...__VLS_functionalComponentArgsRest(__VLS_277));
    }
    var __VLS_271;
    var __VLS_255;
}
var __VLS_247;
var __VLS_75;
/** @type {__VLS_StyleScopedClasses['policy-template-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            handleChannelChange: handleChannelChange,
            IconSearch: IconSearch,
            IconRefresh: IconRefresh,
            IconEye: IconEye,
            IconExperiment: IconExperiment,
            searchForm: searchForm,
            templateList: templateList,
            loading: loading,
            pagination: pagination,
            showCreateModal: showCreateModal,
            formState: formState,
            channelOptions: channelOptions,
            handleCreate: handleCreate,
            columns: columns,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            handlePageChange: handlePageChange,
            viewDetail: viewDetail,
            testTemplate: testTemplate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
