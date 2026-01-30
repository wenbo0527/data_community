/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IconStar, IconStarFill, IconPlus, IconUpload, IconDownload } from '@arco-design/web-vue/es/icon';
const router = useRouter();
const searchText = ref('');
const showEditModal = ref(false);
const showBatchModal = ref(false);
const batchFile = ref(null);
const editForm = ref({
    interfaceName: '',
    dataType: '',
    dataCategory: '',
    supplier: '',
    description: ''
});
const batchForm = ref({
    file: null
});
const filterForm = ref({
    dataType: undefined,
    dataCategory: undefined,
    supplier: ''
});
// 导入mock数据
import { generateExternalDataDetail } from '@/mock/external-data-v1';
// 初始化数据列表
const dataList = ref([
    generateExternalDataDetail('EXT001'),
    generateExternalDataDetail('EXT002')
]);
const filteredData = computed(() => {
    return dataList.value.filter(item => {
        const matchesSearch = (item.dataName && item.dataName.toLowerCase().includes(searchText.value.toLowerCase())) ||
            (item.interfaceId && item.interfaceId.toLowerCase().includes(searchText.value.toLowerCase())) ||
            (item.supplier && item.supplier.toLowerCase().includes(searchText.value.toLowerCase()));
        const matchesFilter = (!filterForm.value.dataType || filterForm.value.dataType === '不限' || item.dataType === filterForm.value.dataType) &&
            (!filterForm.value.dataCategory || filterForm.value.dataCategory === '不限' || item.subType === filterForm.value.dataCategory) &&
            (!filterForm.value.supplier || item.supplier === filterForm.value.supplier);
        return matchesSearch && matchesFilter;
    });
});
const getTagColor = (type) => {
    const colors = {
        '核验类': 'arcoblue',
        '评分类': 'orangered',
        '标签类': 'green',
        '名单类': 'purple',
        '价格评估类': 'gold'
    };
    return colors[type] || 'gray';
};
const handleSearch = (value) => {
    searchText.value = value;
};
const handleSubmit = () => {
    // 这里添加提交逻辑
    console.log('提交表单:', editForm.value);
    showEditModal.value = false;
};
const handleCancel = () => {
    showEditModal.value = false;
};
const handleBatchSubmit = () => {
    if (!batchFile.value) {
        Message.error('请先上传文件');
        return;
    }
    // 这里添加批量提交逻辑
    console.log('批量提交文件:', batchFile.value);
    showBatchModal.value = false;
};
const handleBatchCancel = () => {
    showBatchModal.value = false;
};
const handleFileChange = (file) => {
    batchFile.value = file;
};
const downloadTemplate = () => {
    // 模拟下载模板文件
    const link = document.createElement('a');
    link.href = '/template/batch_import_template.xlsx';
    link.download = '批量导入模板.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('下载模板文件');
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ALayout;
/** @type {[typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, typeof __VLS_components.ALayout, typeof __VLS_components.aLayout, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ALayoutContent;
/** @type {[typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, typeof __VLS_components.ALayoutContent, typeof __VLS_components.aLayoutContent, ]} */ 
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "content" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    defaultActiveKey: "1",
    type: "rounded",
}));
const __VLS_11 = __VLS_10({
    defaultActiveKey: "1",
    type: "rounded",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    key: "1",
    title: "产品页面",
}));
const __VLS_15 = __VLS_14({
    key: "1",
    title: "产品页面",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showEditModal),
    title: "新建数据产品",
    width: "600px",
    maskClosable: (false),
}));
const __VLS_19 = __VLS_18({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showEditModal),
    title: "新建数据产品",
    width: "600px",
    maskClosable: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
let __VLS_21;
let __VLS_22;
let __VLS_23;
const __VLS_24 = {
    onOk: (__VLS_ctx.handleSubmit)
};
const __VLS_25 = {
    onCancel: (__VLS_ctx.handleCancel)
};
__VLS_20.slots.default;
const __VLS_26 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showBatchModal),
    title: "批量变更数据",
    width: "600px",
    maskClosable: (false),
}));
const __VLS_28 = __VLS_27({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showBatchModal),
    title: "批量变更数据",
    width: "600px",
    maskClosable: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
let __VLS_30;
let __VLS_31;
let __VLS_32;
const __VLS_33 = {
    onOk: (__VLS_ctx.handleBatchSubmit)
};
const __VLS_34 = {
    onCancel: (__VLS_ctx.handleBatchCancel)
};
__VLS_29.slots.default;
const __VLS_35 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    model: (__VLS_ctx.batchForm),
    layout: "vertical",
}));
const __VLS_37 = __VLS_36({
    model: (__VLS_ctx.batchForm),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_38.slots.default;
const __VLS_39 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    label: "上传文件",
    required: true,
}));
const __VLS_41 = __VLS_40({
    label: "上传文件",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_42.slots.default;
const __VLS_43 = {}.AUpload;
/** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ 
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    ...{ 'onChange': {} },
    showFileList: (false),
}));
const __VLS_45 = __VLS_44({
    ...{ 'onChange': {} },
    showFileList: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
let __VLS_47;
let __VLS_48;
let __VLS_49;
const __VLS_50 = {
    onChange: (__VLS_ctx.handleFileChange)
};
__VLS_46.slots.default;
{
    const { 'upload-button': __VLS_thisSlot } = __VLS_46.slots;
    const __VLS_51 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        type: "outline",
    }));
    const __VLS_53 = __VLS_52({
        type: "outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    __VLS_54.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_54.slots;
        const __VLS_55 = {}.IconUpload;
        /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ 
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({}));
        const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
    }
    let __VLS_54;
}
let __VLS_46;
if (__VLS_ctx.batchFile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    (__VLS_ctx.batchFile.name);
}
let __VLS_42;
const __VLS_59 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    label: "模板下载",
}));
const __VLS_61 = __VLS_60({
    label: "模板下载",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_62.slots.default;
const __VLS_63 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    ...{ 'onClick': {} },
    type: "text",
}));
const __VLS_65 = __VLS_64({
    ...{ 'onClick': {} },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_67;
let __VLS_68;
let __VLS_69;
const __VLS_70 = {
    onClick: (__VLS_ctx.downloadTemplate)
};
__VLS_66.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_66.slots;
    const __VLS_71 = {}.IconDownload;
    /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ 
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({}));
    const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
}
let __VLS_66;
let __VLS_62;
let __VLS_38;
let __VLS_29;
const __VLS_75 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}));
const __VLS_77 = __VLS_76({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
__VLS_78.slots.default;
const __VLS_79 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    field: "interfaceName",
    label: "接口名称",
    required: true,
}));
const __VLS_81 = __VLS_80({
    field: "interfaceName",
    label: "接口名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
__VLS_82.slots.default;
const __VLS_83 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
    modelValue: (__VLS_ctx.editForm.interfaceName),
    placeholder: "请输入接口名称",
}));
const __VLS_85 = __VLS_84({
    modelValue: (__VLS_ctx.editForm.interfaceName),
    placeholder: "请输入接口名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
let __VLS_82;
const __VLS_87 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    field: "dataType",
    label: "数源种类",
    required: true,
}));
const __VLS_89 = __VLS_88({
    field: "dataType",
    label: "数源种类",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
__VLS_90.slots.default;
const __VLS_91 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数源种类",
}));
const __VLS_93 = __VLS_92({
    modelValue: (__VLS_ctx.editForm.dataType),
    placeholder: "请选择数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
__VLS_94.slots.default;
const __VLS_95 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
    value: "核验类",
}));
const __VLS_97 = __VLS_96({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
__VLS_98.slots.default;
let __VLS_98;
const __VLS_99 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
    value: "评分类",
}));
const __VLS_101 = __VLS_100({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
__VLS_102.slots.default;
let __VLS_102;
const __VLS_103 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
    value: "标签类",
}));
const __VLS_105 = __VLS_104({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
__VLS_106.slots.default;
let __VLS_106;
const __VLS_107 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
    value: "名单类",
}));
const __VLS_109 = __VLS_108({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_108));
__VLS_110.slots.default;
let __VLS_110;
const __VLS_111 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
    value: "价格评估类",
}));
const __VLS_113 = __VLS_112({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
__VLS_114.slots.default;
let __VLS_114;
let __VLS_94;
let __VLS_90;
const __VLS_115 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
    field: "dataCategory",
    label: "分类",
    required: true,
}));
const __VLS_117 = __VLS_116({
    field: "dataCategory",
    label: "分类",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
__VLS_118.slots.default;
const __VLS_119 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
    modelValue: (__VLS_ctx.editForm.dataCategory),
    placeholder: "请选择分类",
}));
const __VLS_121 = __VLS_120({
    modelValue: (__VLS_ctx.editForm.dataCategory),
    placeholder: "请选择分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
__VLS_122.slots.default;
const __VLS_123 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
    value: "身份核验类",
}));
const __VLS_125 = __VLS_124({
    value: "身份核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
__VLS_126.slots.default;
let __VLS_126;
const __VLS_127 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
    value: "信用评分",
}));
const __VLS_129 = __VLS_128({
    value: "信用评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
__VLS_130.slots.default;
let __VLS_130;
const __VLS_131 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
    value: "用户画像",
}));
const __VLS_133 = __VLS_132({
    value: "用户画像",
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
__VLS_134.slots.default;
let __VLS_134;
const __VLS_135 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({
    value: "风险名单",
}));
const __VLS_137 = __VLS_136({
    value: "风险名单",
}, ...__VLS_functionalComponentArgsRest(__VLS_136));
__VLS_138.slots.default;
let __VLS_138;
const __VLS_139 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
    value: "资产评估",
}));
const __VLS_141 = __VLS_140({
    value: "资产评估",
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
__VLS_142.slots.default;
let __VLS_142;
let __VLS_122;
let __VLS_118;
const __VLS_143 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
    field: "supplier",
    label: "供应商",
}));
const __VLS_145 = __VLS_144({
    field: "supplier",
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
__VLS_146.slots.default;
const __VLS_147 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}));
const __VLS_149 = __VLS_148({
    modelValue: (__VLS_ctx.editForm.supplier),
    placeholder: "请输入供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_148));
let __VLS_146;
const __VLS_151 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
    field: "description",
    label: "描述",
}));
const __VLS_153 = __VLS_152({
    field: "description",
    label: "描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_152));
__VLS_154.slots.default;
const __VLS_155 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入描述",
}));
const __VLS_157 = __VLS_156({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_156));
let __VLS_154;
let __VLS_78;
let __VLS_20;
const __VLS_159 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
    gutter: ([24, 24]),
}));
const __VLS_161 = __VLS_160({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
__VLS_162.slots.default;
const __VLS_163 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({
    span: (24),
}));
const __VLS_165 = __VLS_164({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_164));
__VLS_166.slots.default;
const __VLS_167 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
    title: "外部数据v1",
    bordered: (false),
}));
const __VLS_169 = __VLS_168({
    title: "外部数据v1",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_168));
__VLS_170.slots.default;
{
    const { extra: __VLS_thisSlot } = __VLS_170.slots;
    const __VLS_171 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({}));
    const __VLS_173 = __VLS_172({}, ...__VLS_functionalComponentArgsRest(__VLS_172));
    __VLS_174.slots.default;
    const __VLS_175 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_177 = __VLS_176({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    let __VLS_179;
    let __VLS_180;
    let __VLS_181;
    const __VLS_182 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showEditModal = true;
        }
    };
    __VLS_178.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_178.slots;
        const __VLS_183 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
        // @ts-ignore
        const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({}));
        const __VLS_185 = __VLS_184({}, ...__VLS_functionalComponentArgsRest(__VLS_184));
    }
    let __VLS_178;
    const __VLS_187 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_189 = __VLS_188({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    let __VLS_191;
    let __VLS_192;
    let __VLS_193;
    const __VLS_194 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showBatchModal = true;
        }
    };
    __VLS_190.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_190.slots;
        const __VLS_195 = {}.IconUpload;
        /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ 
        // @ts-ignore
        const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({}));
        const __VLS_197 = __VLS_196({}, ...__VLS_functionalComponentArgsRest(__VLS_196));
    }
    let __VLS_190;
    const __VLS_199 = {}.AInputSearch;
    /** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
    // @ts-ignore
    const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }));
    const __VLS_201 = __VLS_200({
        ...{ 'onSearch': {} },
        modelValue: (__VLS_ctx.searchText),
        placeholder: "搜索数据",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_200));
    let __VLS_203;
    let __VLS_204;
    let __VLS_205;
    const __VLS_206 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    let __VLS_202;
    let __VLS_174;
}
const __VLS_207 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}));
const __VLS_209 = __VLS_208({
    model: (__VLS_ctx.filterForm),
    layout: "inline",
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
__VLS_210.slots.default;
const __VLS_211 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({
    field: "dataType",
    label: "数源种类",
}));
const __VLS_213 = __VLS_212({
    field: "dataType",
    label: "数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_212));
__VLS_214.slots.default;
const __VLS_215 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ 
// @ts-ignore
const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}));
const __VLS_217 = __VLS_216({
    modelValue: (__VLS_ctx.filterForm.dataType),
    type: "button",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_216));
__VLS_218.slots.default;
const __VLS_219 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
    value: "不限",
}));
const __VLS_221 = __VLS_220({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_220));
__VLS_222.slots.default;
let __VLS_222;
const __VLS_223 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
    value: "核验类",
}));
const __VLS_225 = __VLS_224({
    value: "核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_224));
__VLS_226.slots.default;
let __VLS_226;
const __VLS_227 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({
    value: "评分类",
}));
const __VLS_229 = __VLS_228({
    value: "评分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
__VLS_230.slots.default;
let __VLS_230;
const __VLS_231 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({
    value: "标签类",
}));
const __VLS_233 = __VLS_232({
    value: "标签类",
}, ...__VLS_functionalComponentArgsRest(__VLS_232));
__VLS_234.slots.default;
let __VLS_234;
const __VLS_235 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
    value: "名单类",
}));
const __VLS_237 = __VLS_236({
    value: "名单类",
}, ...__VLS_functionalComponentArgsRest(__VLS_236));
__VLS_238.slots.default;
let __VLS_238;
const __VLS_239 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ 
// @ts-ignore
const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
    value: "价格评估类",
}));
const __VLS_241 = __VLS_240({
    value: "价格评估类",
}, ...__VLS_functionalComponentArgsRest(__VLS_240));
__VLS_242.slots.default;
let __VLS_242;
let __VLS_218;
let __VLS_214;
const __VLS_243 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
    field: "dataCategory",
    label: "数源分类",
}));
const __VLS_245 = __VLS_244({
    field: "dataCategory",
    label: "数源分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_244));
__VLS_246.slots.default;
const __VLS_247 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_249 = __VLS_248({
    modelValue: (__VLS_ctx.filterForm.dataCategory),
    placeholder: "不限",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_248));
__VLS_250.slots.default;
const __VLS_251 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({
    value: "不限",
}));
const __VLS_253 = __VLS_252({
    value: "不限",
}, ...__VLS_functionalComponentArgsRest(__VLS_252));
__VLS_254.slots.default;
let __VLS_254;
const __VLS_255 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
    value: "身份核验类",
}));
const __VLS_257 = __VLS_256({
    value: "身份核验类",
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
__VLS_258.slots.default;
let __VLS_258;
const __VLS_259 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
    value: "信用评分",
}));
const __VLS_261 = __VLS_260({
    value: "信用评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
__VLS_262.slots.default;
let __VLS_262;
const __VLS_263 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({
    value: "用户画像",
}));
const __VLS_265 = __VLS_264({
    value: "用户画像",
}, ...__VLS_functionalComponentArgsRest(__VLS_264));
__VLS_266.slots.default;
let __VLS_266;
const __VLS_267 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
    value: "风险名单",
}));
const __VLS_269 = __VLS_268({
    value: "风险名单",
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
__VLS_270.slots.default;
let __VLS_270;
const __VLS_271 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
    value: "资产评估",
}));
const __VLS_273 = __VLS_272({
    value: "资产评估",
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
__VLS_274.slots.default;
let __VLS_274;
let __VLS_250;
let __VLS_246;
const __VLS_275 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({
    field: "supplier",
    label: "供应商",
}));
const __VLS_277 = __VLS_276({
    field: "supplier",
    label: "供应商",
}, ...__VLS_functionalComponentArgsRest(__VLS_276));
__VLS_278.slots.default;
const __VLS_279 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_281 = __VLS_280({
    modelValue: (__VLS_ctx.filterForm.supplier),
    placeholder: "供应商A",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_280));
let __VLS_278;
let __VLS_210;
const __VLS_283 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
    gutter: ([16, 16]),
}));
const __VLS_285 = __VLS_284({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_284));
__VLS_286.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredData))) {
    const __VLS_287 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
    // @ts-ignore
    const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }));
    const __VLS_289 = __VLS_288({
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        key: (item.interfaceId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_288));
    __VLS_290.slots.default;
    const __VLS_291 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
    // @ts-ignore
    const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }));
    const __VLS_293 = __VLS_292({
        bordered: (true),
        ...{ class: "data-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_292));
    __VLS_294.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_294.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "data-name" },
        });
        const __VLS_295 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ 
        // @ts-ignore
        const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({
            to: (`/external-data-v1/detail/${item.interfaceId}`),
        }));
        const __VLS_297 = __VLS_296({
            to: (`/external-data-v1/detail/${item.interfaceId}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_296));
        __VLS_298.slots.default;
        (item.dataName);
        var __VLS_298;
        const __VLS_299 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
        // @ts-ignore
        const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({}));
        const __VLS_301 = __VLS_300({}, ...__VLS_functionalComponentArgsRest(__VLS_300));
        __VLS_302.slots.default;
        const __VLS_303 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({
            color: (__VLS_ctx.getTagColor(item.dataType)),
        }));
        const __VLS_305 = __VLS_304({
            color: (__VLS_ctx.getTagColor(item.dataType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_304));
        __VLS_306.slots.default;
        (item.dataType);
        var __VLS_306;
        if (item.subType) {
            const __VLS_307 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
            // @ts-ignore
            const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({
                color: (__VLS_ctx.getTagColor(item.subType)),
            }));
            const __VLS_309 = __VLS_308({
                color: (__VLS_ctx.getTagColor(item.subType)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_308));
            __VLS_310.slots.default;
            (item.subType);
            var __VLS_310;
        }
        if (item.isPrimary) {
            const __VLS_311 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
            // @ts-ignore
            const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({
                color: "green",
            }));
            const __VLS_313 = __VLS_312({
                color: "green",
            }, ...__VLS_functionalComponentArgsRest(__VLS_312));
            __VLS_314.slots.default;
            var __VLS_314;
        }
        else {
            const __VLS_315 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
            // @ts-ignore
            const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({
                color: "orange",
            }));
            const __VLS_317 = __VLS_316({
                color: "orange",
            }, ...__VLS_functionalComponentArgsRest(__VLS_316));
            __VLS_318.slots.default;
            var __VLS_318;
        }
        var __VLS_302;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.interfaceId);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.supplier);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.status);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.price);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.manager);
    var __VLS_294;
    var __VLS_290;
}
let __VLS_286;
let __VLS_170;
let __VLS_166;
let __VLS_162;
let __VLS_16;
let __VLS_12;
let __VLS_8;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['content']} */ 
/** @type {__VLS_StyleScopedClasses['filter-form']} */ 
/** @type {__VLS_StyleScopedClasses['data-card']} */ 
/** @type {__VLS_StyleScopedClasses['card-header']} */ 
/** @type {__VLS_StyleScopedClasses['data-name']} */ 
/** @type {__VLS_StyleScopedClasses['card-content']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
/** @type {__VLS_StyleScopedClasses['info-item']} */ 
/** @type {__VLS_StyleScopedClasses['label']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconUpload: IconUpload,
            IconDownload: IconDownload,
            searchText: searchText,
            showEditModal: showEditModal,
            showBatchModal: showBatchModal,
            batchFile: batchFile,
            editForm: editForm,
            batchForm: batchForm,
            filterForm: filterForm,
            filteredData: filteredData,
            getTagColor: getTagColor,
            handleSearch: handleSearch,
            handleSubmit: handleSubmit,
            handleCancel: handleCancel,
            handleBatchSubmit: handleBatchSubmit,
            handleBatchCancel: handleBatchCancel,
            handleFileChange: handleFileChange,
            downloadTemplate: downloadTemplate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
