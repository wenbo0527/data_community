/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconUpload, IconCheckCircle, IconPlus } from '@arco-design/web-vue/es/icon';
import { useFileUpload } from '@/utils/fileUploadUtils';
const router = useRouter();
const route = useRoute();
// 编辑模式相关
const isEditMode = ref(false);
const editingProjectId = ref('');
// 文件上传相关
const { isDragover, uploadProgress, currentFile, handleDragOver, handleDragLeave, handleDrop, formatFileSize, handleFileChange, handleUpload } = useFileUpload();
const fileList = ref([]);
const fileCount = ref(0);
// 模态框宽度计算属性
const modalWidth = computed(() => {
    if (typeof window !== 'undefined') {
        return Math.min(1000, window.innerWidth * 0.9);
    }
    return 1000;
});
// 步骤控制
const currentStep = ref(0);
const nextStep = () => {
    if (currentStep.value < 3) {
        currentStep.value++;
    }
};
const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};
// 跳过文件上传
const skipFileUpload = () => {
    Message.info('已跳过文件上传，可在后续步骤中补充');
    nextStep();
};
// 表单数据
const formData = reactive({
    projectName: '',
    purchaseVolume: undefined,
    totalAmount: undefined,
    purchaseDate: null,
    description: ''
});
// 筛选条件
const filterForm = reactive({
    name: '',
    dataType: '',
    supplier: '',
    isNew: ''
});
// 新增外数注册相关
const showNewDataModal = ref(false);
const newDataFormRef = ref();
// 新增外数表单数据
const newDataFormData = reactive({
    name: '',
    dataCategory: '',
    interfaceType: '',
    interfaceTag: '',
    provider: '',
    owner: '',
    targetTable: '',
    unitPrice: undefined,
    description: '',
    dataManager: '',
    updateFrequency: '',
    dataManagementDescription: '',
    files: []
});
// 新增外数表单验证规则
const newDataFormRules = {
    name: [
        { required: true, message: '请输入数源名称' }
    ],
    dataCategory: [
        { required: true, message: '请选择数源种类' }
    ],
    interfaceType: [
        { required: true, message: '请选择接口类型' }
    ],
    provider: [
        { required: true, message: '请输入供应商名称' }
    ],
    owner: [
        { required: true, message: '请输入负责人' }
    ],
    targetTable: [
        { required: true, message: '请输入落库表名' }
    ],
    unitPrice: [
        { required: true, message: '请输入单价' }
    ]
};
// 表格列配置
const columns = [
    {
        title: '数据名称',
        dataIndex: 'dataName',
        slotName: 'name',
        width: 180
    },
    {
        title: '数源种类',
        dataIndex: 'dataType',
        width: 120
    },
    {
        title: '供应商',
        dataIndex: 'supplier',
        width: 150
    },
    {
        title: '单价(元/次)',
        dataIndex: 'price',
        width: 120
    },
    {
        title: '接口标签',
        dataIndex: 'interfaceTag',
        width: 120
    },
];
// 摘要表格列配置
const summaryColumns = [
    {
        title: '数据名称',
        dataIndex: 'dataName',
        width: 180
    },
    {
        title: '数源种类',
        dataIndex: 'dataType',
        width: 120
    },
    {
        title: '供应商',
        dataIndex: 'supplier',
        width: 150
    },
    {
        title: '单价(元/次)',
        dataIndex: 'price',
        width: 120
    }
];
// 表格数据
const tableData = ref([]);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
});
// 选中的行
const selectedRowKeys = ref([]);
const selectedProducts = ref([]);
// 筛选后的表格数据
const filteredTableData = computed(() => {
    let result = [...tableData.value];
    if (filterForm.name) {
        result = result.filter(item => item.dataName.toLowerCase().includes(filterForm.name.toLowerCase()));
    }
    if (filterForm.dataType) {
        result = result.filter(item => item.dataType === filterForm.dataType);
    }
    if (filterForm.supplier) {
        result = result.filter(item => item.supplier === filterForm.supplier);
    }
    if (filterForm.isNew === 'true') {
        result = result.filter(item => item.isNew === true);
    }
    else if (filterForm.isNew === 'false') {
        result = result.filter(item => item.isNew === false);
    }
    pagination.total = result.length;
    return result;
});
// 计算选中的新数据产品数量
const selectedNewProducts = computed(() => {
    return selectedProducts.value.filter(item => item.isNew).length;
});
// 项目摘要信息
const summaryData = computed(() => [
    {
        label: '项目名称',
        value: formData.projectName
    },
    {
        label: '采购用量',
        value: formData.purchaseVolume ? `${formData.purchaseVolume} 条` : ''
    },
    {
        label: '总金额',
        value: formData.totalAmount ? `${formData.totalAmount} 元` : ''
    },
    {
        label: '采购日期',
        value: formData.purchaseDate ? new Date(formData.purchaseDate).toLocaleDateString() : ''
    },
    {
        label: '关联产品数',
        value: selectedRowKeys.value.length
    }
]);
// 处理文件上传
const handleFileUpload = async (option) => {
    const { fileItem } = option;
    uploadProgress.value = 0;
    // 模拟上传进度
    const interval = setInterval(() => {
        if (uploadProgress.value < 99) {
            uploadProgress.value += 10;
        }
        else {
            clearInterval(interval);
            uploadProgress.value = 100;
            Message.success('文件上传成功');
        }
    }, 300);
    return {
        abort: () => {
            clearInterval(interval);
            uploadProgress.value = 0;
        }
    };
};
// 处理筛选
const handleFilter = () => {
    pagination.current = 1;
};
// 重置筛选
const resetFilter = () => {
    filterForm.name = '';
    filterForm.dataType = '';
    filterForm.supplier = '';
    filterForm.isNew = '';
    pagination.current = 1;
};
// 处理分页变化
const handlePageChange = (page) => {
    pagination.current = page;
};
// 处理选择变化
const handleSelectionChange = (rowKeys, rows) => {
    selectedRowKeys.value = rowKeys;
    selectedProducts.value = rows;
};
// 完成注册
const finishRegistration = () => {
    const message = isEditMode.value ? '外数采购项目更新成功' : '外数采购项目注册成功';
    Message.success(message);
    router.push('/discovery/asset-management/external-data-management');
};
// 新增外数注册相关方法
// 提交新增外数表单
const handleNewDataSubmit = async () => {
    try {
        const valid = await newDataFormRef.value?.validate();
        if (valid) {
            // 模拟提交数据
            const newDataProduct = {
                id: `data-new-${Date.now()}`,
                dataName: newDataFormData.name,
                dataType: newDataFormData.dataCategory,
                supplier: newDataFormData.provider,
                price: newDataFormData.unitPrice || 0,
                interfaceTag: newDataFormData.interfaceTag,
                isNew: true // 标记为新数据产品
            };
            // 添加到表格数据中
            tableData.value.unshift(newDataProduct);
            // 自动选中新添加的数据产品
            selectedRowKeys.value.push(newDataProduct.id);
            selectedProducts.value.push(newDataProduct);
            Message.success('外数注册成功，已自动关联到当前采购项目');
            showNewDataModal.value = false;
            resetNewDataForm();
        }
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
// 重置新增外数表单
const resetNewDataForm = () => {
    newDataFormData.name = '';
    newDataFormData.dataCategory = '';
    newDataFormData.interfaceType = '';
    newDataFormData.interfaceTag = '';
    newDataFormData.provider = '';
    newDataFormData.owner = '';
    newDataFormData.targetTable = '';
    newDataFormData.unitPrice = undefined;
    newDataFormData.description = '';
    newDataFormData.dataManager = '';
    newDataFormData.updateFrequency = '';
    newDataFormData.dataManagementDescription = '';
    newDataFormData.files = [];
    newDataFormRef.value?.clearValidate();
};
// 处理新增外数文件上传
const handleNewDataFileUpload = async (option) => {
    const { fileItem } = option;
    // 模拟文件上传
    const newFile = {
        id: Date.now().toString(),
        displayName: fileItem.name,
        originalName: fileItem.name,
        size: fileItem.size,
        type: fileItem.type,
        uploadTime: new Date().toISOString()
    };
    newDataFormData.files.push(newFile);
    Message.success('文件上传成功');
    return {
        abort: () => {
            // 取消上传逻辑
        }
    };
};
// 删除新增外数文件
const removeNewDataFile = (index) => {
    newDataFormData.files.splice(index, 1);
    Message.success('文件删除成功');
};
// 下载文件
const downloadFile = (file) => {
    // 模拟文件下载
    Message.info(`正在下载文件: ${file.displayName}`);
};
// 加载编辑数据
const loadEditData = () => {
    // 检查是否为编辑模式
    if (route.query.mode === 'edit' && route.query.id) {
        isEditMode.value = true;
        editingProjectId.value = Array.isArray(route.query.id) ? (route.query.id[0] || '') : (route.query.id || '');
        // 从路由状态或历史记录中获取编辑数据
        const editData = history.state?.editData;
        if (editData) {
            // 填充表单数据
            formData.projectName = editData.projectName;
            formData.purchaseVolume = editData.purchaseVolume;
            formData.totalAmount = editData.totalAmount;
            formData.purchaseDate = editData.purchaseDate;
            formData.description = editData.description;
            // 如果有已关联的产品，设置选中状态
            if (editData.relatedProducts) {
                selectedRowKeys.value = editData.relatedProducts.map((p) => p.id);
                selectedProducts.value = [...editData.relatedProducts];
            }
            // 如果有已上传的文件，设置文件列表
            if (editData.uploadedFiles) {
                fileList.value = editData.uploadedFiles.map((file) => ({
                    uid: file.id,
                    name: file.name,
                    status: 'done',
                    url: file.url
                }));
            }
        }
    }
};
// 加载模拟数据
onMounted(() => {
    // 检查编辑模式并加载数据
    loadEditData();
    // 模拟获取外部数据产品列表
    tableData.value = Array.from({ length: 50 }).map((_, index) => ({
        id: `data-${index + 1}`,
        dataName: `外部数据产品 ${index + 1}`,
        dataType: ['API', '文件', '数据库'][Math.floor(Math.random() * 3)],
        supplier: ['数据供应商A', '数据供应商B', '数据供应商C', '第三方数据公司'][Math.floor(Math.random() * 4)],
        price: Math.floor(Math.random() * 1000) / 100,
        interfaceTag: ['金融', '电商', '运营商', '社交', '交通'][Math.floor(Math.random() * 5)],
        isNew: Math.random() > 0.5 // 随机设置是否为新数据产品
    }));
    pagination.total = tableData.value.length;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['upload-tips']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "external-purchase-register" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.isEditMode ? '编辑外数采购项目' : '外数采购项目注册');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
(__VLS_ctx.isEditMode ? '编辑外部数据采购项目信息，支持补充上传材料和更新项目内容' : '注册外部数据采购项目，上传采购文件并关联数据产品');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.go(-1);
    }
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ASteps;
/** @type {[typeof __VLS_components.ASteps, typeof __VLS_components.aSteps, typeof __VLS_components.ASteps, typeof __VLS_components.aSteps, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    current: (__VLS_ctx.currentStep),
    ...{ class: "register-steps" },
}));
const __VLS_10 = __VLS_9({
    current: (__VLS_ctx.currentStep),
    ...{ class: "register-steps" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.AStep;
/** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    title: "上传采购文件",
    description: "上传外数项目采购文件",
}));
const __VLS_14 = __VLS_13({
    title: "上传采购文件",
    description: "上传外数项目采购文件",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.AStep;
/** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    title: "填写项目信息",
    description: "填写项目名称、采购用量和总金额",
}));
const __VLS_18 = __VLS_17({
    title: "填写项目信息",
    description: "填写项目名称、采购用量和总金额",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.AStep;
/** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    title: "关联数据产品",
    description: "选择关联的外部数据产品",
}));
const __VLS_22 = __VLS_21({
    title: "关联数据产品",
    description: "选择关联的外部数据产品",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.AStep;
/** @type {[typeof __VLS_components.AStep, typeof __VLS_components.aStep, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    title: "完成",
    description: "完成项目注册",
}));
const __VLS_26 = __VLS_25({
    title: "完成",
    description: "完成项目注册",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_11;
const __VLS_28 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ class: "step-content" },
}));
const __VLS_30 = __VLS_29({
    ...{ class: "step-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
if (__VLS_ctx.currentStep === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.isEditMode ? '补充上传采购文件' : '上传外数项目采购文件');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "step-description" },
    });
    (__VLS_ctx.isEditMode ? '可以补充上传新的采购文件，支持PDF、Word、Excel格式' : '请上传外数项目采购文件，支持PDF、Word、Excel格式');
    const __VLS_32 = {}.AUploadDragger;
    /** @type {[typeof __VLS_components.AUploadDragger, typeof __VLS_components.aUploadDragger, typeof __VLS_components.AUploadDragger, typeof __VLS_components.aUploadDragger, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onChange': {} },
        ...{ 'onDrop': {} },
        ...{ 'onDragover': {} },
        ...{ 'onDragleave': {} },
        showFileList: (true),
        fileList: (__VLS_ctx.fileList),
        customRequest: (__VLS_ctx.handleFileUpload),
        accept: ".pdf,.docx,.xlsx,.xls",
        drag: true,
        ...{ class: "upload-area" },
        ...{ class: ({ 'upload-area--dragover': __VLS_ctx.isDragover }) },
        ...{ style: {} },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onChange': {} },
        ...{ 'onDrop': {} },
        ...{ 'onDragover': {} },
        ...{ 'onDragleave': {} },
        showFileList: (true),
        fileList: (__VLS_ctx.fileList),
        customRequest: (__VLS_ctx.handleFileUpload),
        accept: ".pdf,.docx,.xlsx,.xls",
        drag: true,
        ...{ class: "upload-area" },
        ...{ class: ({ 'upload-area--dragover': __VLS_ctx.isDragover }) },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onChange: (__VLS_ctx.handleFileChange)
    };
    const __VLS_40 = {
        onDrop: (__VLS_ctx.handleDrop)
    };
    const __VLS_41 = {
        onDragover: (__VLS_ctx.handleDragOver)
    };
    const __VLS_42 = {
        onDragleave: (__VLS_ctx.handleDragLeave)
    };
    __VLS_35.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-content" },
    });
    const __VLS_43 = {}.IconUpload;
    /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ class: "upload-icon" },
        ...{ style: {} },
    }));
    const __VLS_45 = __VLS_44({
        ...{ class: "upload-icon" },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "upload-text" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "upload-highlight" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "upload-hint" },
        ...{ style: {} },
    });
    if (__VLS_ctx.uploadProgress > 0) {
        const __VLS_47 = {}.AProgress;
        /** @type {[typeof __VLS_components.AProgress, typeof __VLS_components.aProgress, ]} */ ;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
            percent: (__VLS_ctx.uploadProgress),
            showText: (false),
        }));
        const __VLS_49 = __VLS_48({
            percent: (__VLS_ctx.uploadProgress),
            showText: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    }
    var __VLS_35;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    const __VLS_51 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (__VLS_ctx.fileList.length === 0),
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (__VLS_ctx.fileList.length === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onClick: (__VLS_ctx.nextStep)
    };
    __VLS_54.slots.default;
    var __VLS_54;
    const __VLS_59 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_61 = __VLS_60({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    let __VLS_63;
    let __VLS_64;
    let __VLS_65;
    const __VLS_66 = {
        onClick: (__VLS_ctx.skipFileUpload)
    };
    __VLS_62.slots.default;
    var __VLS_62;
}
if (__VLS_ctx.currentStep === 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "step-description" },
    });
    const __VLS_67 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        model: (__VLS_ctx.formData),
        layout: "vertical",
    }));
    const __VLS_69 = __VLS_68({
        model: (__VLS_ctx.formData),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_70.slots.default;
    const __VLS_71 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
        label: "项目名称",
        field: "projectName",
        required: true,
    }));
    const __VLS_73 = __VLS_72({
        label: "项目名称",
        field: "projectName",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    __VLS_74.slots.default;
    const __VLS_75 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        modelValue: (__VLS_ctx.formData.projectName),
        placeholder: "请输入项目名称",
        disabled: (__VLS_ctx.isEditMode),
        readonly: (__VLS_ctx.isEditMode),
    }));
    const __VLS_77 = __VLS_76({
        modelValue: (__VLS_ctx.formData.projectName),
        placeholder: "请输入项目名称",
        disabled: (__VLS_ctx.isEditMode),
        readonly: (__VLS_ctx.isEditMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    if (__VLS_ctx.isEditMode) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-tip" },
        });
    }
    var __VLS_74;
    const __VLS_79 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
        gutter: (16),
    }));
    const __VLS_81 = __VLS_80({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    __VLS_82.slots.default;
    const __VLS_83 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        span: (12),
    }));
    const __VLS_85 = __VLS_84({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    __VLS_86.slots.default;
    const __VLS_87 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
        label: "采购用量",
        field: "purchaseVolume",
        required: true,
    }));
    const __VLS_89 = __VLS_88({
        label: "采购用量",
        field: "purchaseVolume",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    __VLS_90.slots.default;
    const __VLS_91 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
        modelValue: (__VLS_ctx.formData.purchaseVolume),
        placeholder: "请输入采购用量",
        min: (1),
        ...{ style: {} },
    }));
    const __VLS_93 = __VLS_92({
        modelValue: (__VLS_ctx.formData.purchaseVolume),
        placeholder: "请输入采购用量",
        min: (1),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    __VLS_94.slots.default;
    {
        const { suffix: __VLS_thisSlot } = __VLS_94.slots;
    }
    var __VLS_94;
    var __VLS_90;
    var __VLS_86;
    const __VLS_95 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
        span: (12),
    }));
    const __VLS_97 = __VLS_96({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    __VLS_98.slots.default;
    const __VLS_99 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
        label: "总金额",
        field: "totalAmount",
        required: true,
    }));
    const __VLS_101 = __VLS_100({
        label: "总金额",
        field: "totalAmount",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    __VLS_102.slots.default;
    const __VLS_103 = {}.AInputNumber;
    /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
        modelValue: (__VLS_ctx.formData.totalAmount),
        placeholder: "请输入总金额",
        min: (0),
        precision: (2),
        ...{ style: {} },
    }));
    const __VLS_105 = __VLS_104({
        modelValue: (__VLS_ctx.formData.totalAmount),
        placeholder: "请输入总金额",
        min: (0),
        precision: (2),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    __VLS_106.slots.default;
    {
        const { suffix: __VLS_thisSlot } = __VLS_106.slots;
    }
    var __VLS_106;
    var __VLS_102;
    var __VLS_98;
    var __VLS_82;
    const __VLS_107 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
        label: "采购日期",
        field: "purchaseDate",
        required: true,
    }));
    const __VLS_109 = __VLS_108({
        label: "采购日期",
        field: "purchaseDate",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    __VLS_110.slots.default;
    const __VLS_111 = {}.ADatePicker;
    /** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
        modelValue: (__VLS_ctx.formData.purchaseDate),
        ...{ style: {} },
    }));
    const __VLS_113 = __VLS_112({
        modelValue: (__VLS_ctx.formData.purchaseDate),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    var __VLS_110;
    const __VLS_115 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
        label: "采购说明",
        field: "description",
    }));
    const __VLS_117 = __VLS_116({
        label: "采购说明",
        field: "description",
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    __VLS_118.slots.default;
    const __VLS_119 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
        modelValue: (__VLS_ctx.formData.description),
        placeholder: "请输入采购说明",
        rows: (3),
    }));
    const __VLS_121 = __VLS_120({
        modelValue: (__VLS_ctx.formData.description),
        placeholder: "请输入采购说明",
        rows: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    var __VLS_118;
    var __VLS_70;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    const __VLS_123 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_125 = __VLS_124({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_124));
    let __VLS_127;
    let __VLS_128;
    let __VLS_129;
    const __VLS_130 = {
        onClick: (__VLS_ctx.prevStep)
    };
    __VLS_126.slots.default;
    var __VLS_126;
    const __VLS_131 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.formData.projectName || !__VLS_ctx.formData.purchaseVolume || !__VLS_ctx.formData.totalAmount || !__VLS_ctx.formData.purchaseDate),
    }));
    const __VLS_133 = __VLS_132({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.formData.projectName || !__VLS_ctx.formData.purchaseVolume || !__VLS_ctx.formData.totalAmount || !__VLS_ctx.formData.purchaseDate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    let __VLS_135;
    let __VLS_136;
    let __VLS_137;
    const __VLS_138 = {
        onClick: (__VLS_ctx.nextStep)
    };
    __VLS_134.slots.default;
    var __VLS_134;
}
if (__VLS_ctx.currentStep === 2) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "step-description" },
    });
    const __VLS_139 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
        ...{ class: "filter-card" },
    }));
    const __VLS_141 = __VLS_140({
        ...{ class: "filter-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    __VLS_142.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-section" },
    });
    const __VLS_143 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
        model: (__VLS_ctx.filterForm),
        layout: "inline",
    }));
    const __VLS_145 = __VLS_144({
        model: (__VLS_ctx.filterForm),
        layout: "inline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_144));
    __VLS_146.slots.default;
    const __VLS_147 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
        field: "name",
        label: "名称",
    }));
    const __VLS_149 = __VLS_148({
        field: "name",
        label: "名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    __VLS_150.slots.default;
    const __VLS_151 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
        modelValue: (__VLS_ctx.filterForm.name),
        placeholder: "请输入数据名称",
        allowClear: true,
    }));
    const __VLS_153 = __VLS_152({
        modelValue: (__VLS_ctx.filterForm.name),
        placeholder: "请输入数据名称",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    var __VLS_150;
    const __VLS_155 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
        field: "dataType",
        label: "数源种类",
    }));
    const __VLS_157 = __VLS_156({
        field: "dataType",
        label: "数源种类",
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    __VLS_158.slots.default;
    const __VLS_159 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
        modelValue: (__VLS_ctx.filterForm.dataType),
        placeholder: "请选择数源种类",
        allowClear: true,
    }));
    const __VLS_161 = __VLS_160({
        modelValue: (__VLS_ctx.filterForm.dataType),
        placeholder: "请选择数源种类",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    __VLS_162.slots.default;
    const __VLS_163 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({
        value: "API",
    }));
    const __VLS_165 = __VLS_164({
        value: "API",
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    __VLS_166.slots.default;
    var __VLS_166;
    const __VLS_167 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
        value: "文件",
    }));
    const __VLS_169 = __VLS_168({
        value: "文件",
    }, ...__VLS_functionalComponentArgsRest(__VLS_168));
    __VLS_170.slots.default;
    var __VLS_170;
    const __VLS_171 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
        value: "数据库",
    }));
    const __VLS_173 = __VLS_172({
        value: "数据库",
    }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    __VLS_174.slots.default;
    var __VLS_174;
    var __VLS_162;
    var __VLS_158;
    const __VLS_175 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        field: "supplier",
        label: "供应商",
    }));
    const __VLS_177 = __VLS_176({
        field: "supplier",
        label: "供应商",
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    __VLS_178.slots.default;
    const __VLS_179 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
        modelValue: (__VLS_ctx.filterForm.supplier),
        placeholder: "请选择供应商",
        allowClear: true,
    }));
    const __VLS_181 = __VLS_180({
        modelValue: (__VLS_ctx.filterForm.supplier),
        placeholder: "请选择供应商",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    __VLS_182.slots.default;
    const __VLS_183 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        value: "数据供应商A",
    }));
    const __VLS_185 = __VLS_184({
        value: "数据供应商A",
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    __VLS_186.slots.default;
    var __VLS_186;
    const __VLS_187 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
        value: "数据供应商B",
    }));
    const __VLS_189 = __VLS_188({
        value: "数据供应商B",
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    __VLS_190.slots.default;
    var __VLS_190;
    const __VLS_191 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
        value: "数据供应商C",
    }));
    const __VLS_193 = __VLS_192({
        value: "数据供应商C",
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    __VLS_194.slots.default;
    var __VLS_194;
    const __VLS_195 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
        value: "第三方数据公司",
    }));
    const __VLS_197 = __VLS_196({
        value: "第三方数据公司",
    }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    __VLS_198.slots.default;
    var __VLS_198;
    var __VLS_182;
    var __VLS_178;
    const __VLS_199 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({}));
    const __VLS_201 = __VLS_200({}, ...__VLS_functionalComponentArgsRest(__VLS_200));
    __VLS_202.slots.default;
    const __VLS_203 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({}));
    const __VLS_205 = __VLS_204({}, ...__VLS_functionalComponentArgsRest(__VLS_204));
    __VLS_206.slots.default;
    const __VLS_207 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_209 = __VLS_208({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_208));
    let __VLS_211;
    let __VLS_212;
    let __VLS_213;
    const __VLS_214 = {
        onClick: (__VLS_ctx.handleFilter)
    };
    __VLS_210.slots.default;
    var __VLS_210;
    const __VLS_215 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
        ...{ 'onClick': {} },
    }));
    const __VLS_217 = __VLS_216({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    let __VLS_219;
    let __VLS_220;
    let __VLS_221;
    const __VLS_222 = {
        onClick: (__VLS_ctx.resetFilter)
    };
    __VLS_218.slots.default;
    var __VLS_218;
    const __VLS_223 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
        ...{ 'onClick': {} },
        type: "outline",
    }));
    const __VLS_225 = __VLS_224({
        ...{ 'onClick': {} },
        type: "outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    let __VLS_227;
    let __VLS_228;
    let __VLS_229;
    const __VLS_230 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.currentStep === 2))
                return;
            __VLS_ctx.showNewDataModal = true;
        }
    };
    __VLS_226.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_226.slots;
        const __VLS_231 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({}));
        const __VLS_233 = __VLS_232({}, ...__VLS_functionalComponentArgsRest(__VLS_232));
    }
    var __VLS_226;
    var __VLS_206;
    var __VLS_202;
    var __VLS_146;
    var __VLS_142;
    const __VLS_235 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
        ...{ 'onPageChange': {} },
        columns: (__VLS_ctx.columns),
        data: (__VLS_ctx.filteredTableData),
        pagination: (__VLS_ctx.pagination),
        rowSelection: ({
            type: 'checkbox',
            showCheckedAll: true,
            selectedRowKeys: __VLS_ctx.selectedRowKeys,
            onChange: __VLS_ctx.handleSelectionChange
        }),
    }));
    const __VLS_237 = __VLS_236({
        ...{ 'onPageChange': {} },
        columns: (__VLS_ctx.columns),
        data: (__VLS_ctx.filteredTableData),
        pagination: (__VLS_ctx.pagination),
        rowSelection: ({
            type: 'checkbox',
            showCheckedAll: true,
            selectedRowKeys: __VLS_ctx.selectedRowKeys,
            onChange: __VLS_ctx.handleSelectionChange
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    let __VLS_239;
    let __VLS_240;
    let __VLS_241;
    const __VLS_242 = {
        onPageChange: (__VLS_ctx.handlePageChange)
    };
    __VLS_238.slots.default;
    {
        const { name: __VLS_thisSlot } = __VLS_238.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_243 = {}.ATooltip;
        /** @type {[typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, typeof __VLS_components.ATooltip, typeof __VLS_components.aTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
            content: (record.dataName),
        }));
        const __VLS_245 = __VLS_244({
            content: (record.dataName),
        }, ...__VLS_functionalComponentArgsRest(__VLS_244));
        __VLS_246.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.dataName);
        var __VLS_246;
    }
    var __VLS_238;
    if (__VLS_ctx.selectedRowKeys.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "selected-summary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.selectedRowKeys.length);
        (__VLS_ctx.selectedNewProducts);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    const __VLS_247 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_249 = __VLS_248({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    let __VLS_251;
    let __VLS_252;
    let __VLS_253;
    const __VLS_254 = {
        onClick: (__VLS_ctx.prevStep)
    };
    __VLS_250.slots.default;
    var __VLS_250;
    const __VLS_255 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_257 = __VLS_256({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_256));
    let __VLS_259;
    let __VLS_260;
    let __VLS_261;
    const __VLS_262 = {
        onClick: (__VLS_ctx.nextStep)
    };
    __VLS_258.slots.default;
    var __VLS_258;
}
if (__VLS_ctx.currentStep === 3) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "success-content" },
    });
    const __VLS_263 = {}.IconCheckCircle;
    /** @type {[typeof __VLS_components.IconCheckCircle, typeof __VLS_components.iconCheckCircle, ]} */ ;
    // @ts-ignore
    const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({
        ...{ style: {} },
    }));
    const __VLS_265 = __VLS_264({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_264));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.isEditMode ? '采购项目更新成功' : '采购项目注册成功');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.isEditMode ? '您已成功更新外数采购项目信息，可以在外数管理页面查看详情' : '您已成功注册外数采购项目，可以在外数管理页面查看详情');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-summary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    const __VLS_267 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
        data: (__VLS_ctx.summaryData),
        layout: "vertical",
        bordered: true,
    }));
    const __VLS_269 = __VLS_268({
        data: (__VLS_ctx.summaryData),
        layout: "vertical",
        bordered: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_268));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ style: {} },
    });
    const __VLS_271 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
        columns: (__VLS_ctx.summaryColumns),
        data: (__VLS_ctx.selectedProducts),
        pagination: (false),
    }));
    const __VLS_273 = __VLS_272({
        columns: (__VLS_ctx.summaryColumns),
        data: (__VLS_ctx.selectedProducts),
        pagination: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_272));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-actions" },
    });
    const __VLS_275 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_277 = __VLS_276({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_276));
    let __VLS_279;
    let __VLS_280;
    let __VLS_281;
    const __VLS_282 = {
        onClick: (__VLS_ctx.prevStep)
    };
    __VLS_278.slots.default;
    var __VLS_278;
    const __VLS_283 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_285 = __VLS_284({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_284));
    let __VLS_287;
    let __VLS_288;
    let __VLS_289;
    const __VLS_290 = {
        onClick: (__VLS_ctx.finishRegistration)
    };
    __VLS_286.slots.default;
    var __VLS_286;
}
var __VLS_31;
const __VLS_291 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showNewDataModal),
    title: "新增外数注册",
    width: (__VLS_ctx.modalWidth),
    okText: "确定",
    cancelText: "取消",
}));
const __VLS_293 = __VLS_292({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.showNewDataModal),
    title: "新增外数注册",
    width: (__VLS_ctx.modalWidth),
    okText: "确定",
    cancelText: "取消",
}, ...__VLS_functionalComponentArgsRest(__VLS_292));
let __VLS_295;
let __VLS_296;
let __VLS_297;
const __VLS_298 = {
    onOk: (__VLS_ctx.handleNewDataSubmit)
};
const __VLS_299 = {
    onCancel: (__VLS_ctx.resetNewDataForm)
};
__VLS_294.slots.default;
const __VLS_300 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    ref: "newDataFormRef",
    model: (__VLS_ctx.newDataFormData),
    rules: (__VLS_ctx.newDataFormRules),
    layout: "vertical",
}));
const __VLS_302 = __VLS_301({
    ref: "newDataFormRef",
    model: (__VLS_ctx.newDataFormData),
    rules: (__VLS_ctx.newDataFormRules),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
/** @type {typeof __VLS_ctx.newDataFormRef} */ ;
var __VLS_304 = {};
__VLS_303.slots.default;
const __VLS_306 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_307 = __VLS_asFunctionalComponent(__VLS_306, new __VLS_306({
    orientation: "left",
}));
const __VLS_308 = __VLS_307({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_307));
__VLS_309.slots.default;
var __VLS_309;
const __VLS_310 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({
    gutter: (16),
}));
const __VLS_312 = __VLS_311({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_311));
__VLS_313.slots.default;
const __VLS_314 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_315 = __VLS_asFunctionalComponent(__VLS_314, new __VLS_314({
    span: (12),
}));
const __VLS_316 = __VLS_315({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_315));
__VLS_317.slots.default;
const __VLS_318 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_319 = __VLS_asFunctionalComponent(__VLS_318, new __VLS_318({
    label: "数源名称",
    field: "name",
}));
const __VLS_320 = __VLS_319({
    label: "数源名称",
    field: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_319));
__VLS_321.slots.default;
const __VLS_322 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_323 = __VLS_asFunctionalComponent(__VLS_322, new __VLS_322({
    modelValue: (__VLS_ctx.newDataFormData.name),
    placeholder: "请输入数源名称",
}));
const __VLS_324 = __VLS_323({
    modelValue: (__VLS_ctx.newDataFormData.name),
    placeholder: "请输入数源名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_323));
var __VLS_321;
var __VLS_317;
const __VLS_326 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_327 = __VLS_asFunctionalComponent(__VLS_326, new __VLS_326({
    span: (12),
}));
const __VLS_328 = __VLS_327({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_327));
__VLS_329.slots.default;
const __VLS_330 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_331 = __VLS_asFunctionalComponent(__VLS_330, new __VLS_330({
    label: "数源种类",
    field: "dataCategory",
}));
const __VLS_332 = __VLS_331({
    label: "数源种类",
    field: "dataCategory",
}, ...__VLS_functionalComponentArgsRest(__VLS_331));
__VLS_333.slots.default;
const __VLS_334 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_335 = __VLS_asFunctionalComponent(__VLS_334, new __VLS_334({
    modelValue: (__VLS_ctx.newDataFormData.dataCategory),
    placeholder: "请选择数源种类",
}));
const __VLS_336 = __VLS_335({
    modelValue: (__VLS_ctx.newDataFormData.dataCategory),
    placeholder: "请选择数源种类",
}, ...__VLS_functionalComponentArgsRest(__VLS_335));
__VLS_337.slots.default;
const __VLS_338 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_339 = __VLS_asFunctionalComponent(__VLS_338, new __VLS_338({
    value: "征信数据",
}));
const __VLS_340 = __VLS_339({
    value: "征信数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_339));
__VLS_341.slots.default;
var __VLS_341;
const __VLS_342 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_343 = __VLS_asFunctionalComponent(__VLS_342, new __VLS_342({
    value: "风控数据",
}));
const __VLS_344 = __VLS_343({
    value: "风控数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_343));
__VLS_345.slots.default;
var __VLS_345;
const __VLS_346 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_347 = __VLS_asFunctionalComponent(__VLS_346, new __VLS_346({
    value: "运营商数据",
}));
const __VLS_348 = __VLS_347({
    value: "运营商数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_347));
__VLS_349.slots.default;
var __VLS_349;
const __VLS_350 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_351 = __VLS_asFunctionalComponent(__VLS_350, new __VLS_350({
    value: "政务数据",
}));
const __VLS_352 = __VLS_351({
    value: "政务数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_351));
__VLS_353.slots.default;
var __VLS_353;
const __VLS_354 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_355 = __VLS_asFunctionalComponent(__VLS_354, new __VLS_354({
    value: "金融数据",
}));
const __VLS_356 = __VLS_355({
    value: "金融数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_355));
__VLS_357.slots.default;
var __VLS_357;
const __VLS_358 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_359 = __VLS_asFunctionalComponent(__VLS_358, new __VLS_358({
    value: "其他",
}));
const __VLS_360 = __VLS_359({
    value: "其他",
}, ...__VLS_functionalComponentArgsRest(__VLS_359));
__VLS_361.slots.default;
var __VLS_361;
var __VLS_337;
var __VLS_333;
var __VLS_329;
var __VLS_313;
const __VLS_362 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_363 = __VLS_asFunctionalComponent(__VLS_362, new __VLS_362({
    gutter: (16),
}));
const __VLS_364 = __VLS_363({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_363));
__VLS_365.slots.default;
const __VLS_366 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_367 = __VLS_asFunctionalComponent(__VLS_366, new __VLS_366({
    span: (8),
}));
const __VLS_368 = __VLS_367({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_367));
__VLS_369.slots.default;
const __VLS_370 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_371 = __VLS_asFunctionalComponent(__VLS_370, new __VLS_370({
    label: "接口类型",
    field: "interfaceType",
}));
const __VLS_372 = __VLS_371({
    label: "接口类型",
    field: "interfaceType",
}, ...__VLS_functionalComponentArgsRest(__VLS_371));
__VLS_373.slots.default;
const __VLS_374 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_375 = __VLS_asFunctionalComponent(__VLS_374, new __VLS_374({
    modelValue: (__VLS_ctx.newDataFormData.interfaceType),
    placeholder: "请选择接口类型",
}));
const __VLS_376 = __VLS_375({
    modelValue: (__VLS_ctx.newDataFormData.interfaceType),
    placeholder: "请选择接口类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_375));
__VLS_377.slots.default;
const __VLS_378 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_379 = __VLS_asFunctionalComponent(__VLS_378, new __VLS_378({
    value: "REST API",
}));
const __VLS_380 = __VLS_379({
    value: "REST API",
}, ...__VLS_functionalComponentArgsRest(__VLS_379));
__VLS_381.slots.default;
var __VLS_381;
const __VLS_382 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_383 = __VLS_asFunctionalComponent(__VLS_382, new __VLS_382({
    value: "SOAP",
}));
const __VLS_384 = __VLS_383({
    value: "SOAP",
}, ...__VLS_functionalComponentArgsRest(__VLS_383));
__VLS_385.slots.default;
var __VLS_385;
const __VLS_386 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_387 = __VLS_asFunctionalComponent(__VLS_386, new __VLS_386({
    value: "FTP",
}));
const __VLS_388 = __VLS_387({
    value: "FTP",
}, ...__VLS_functionalComponentArgsRest(__VLS_387));
__VLS_389.slots.default;
var __VLS_389;
const __VLS_390 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_391 = __VLS_asFunctionalComponent(__VLS_390, new __VLS_390({
    value: "SFTP",
}));
const __VLS_392 = __VLS_391({
    value: "SFTP",
}, ...__VLS_functionalComponentArgsRest(__VLS_391));
__VLS_393.slots.default;
var __VLS_393;
const __VLS_394 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_395 = __VLS_asFunctionalComponent(__VLS_394, new __VLS_394({
    value: "数据库直连",
}));
const __VLS_396 = __VLS_395({
    value: "数据库直连",
}, ...__VLS_functionalComponentArgsRest(__VLS_395));
__VLS_397.slots.default;
var __VLS_397;
const __VLS_398 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_399 = __VLS_asFunctionalComponent(__VLS_398, new __VLS_398({
    value: "文件传输",
}));
const __VLS_400 = __VLS_399({
    value: "文件传输",
}, ...__VLS_functionalComponentArgsRest(__VLS_399));
__VLS_401.slots.default;
var __VLS_401;
var __VLS_377;
var __VLS_373;
var __VLS_369;
const __VLS_402 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_403 = __VLS_asFunctionalComponent(__VLS_402, new __VLS_402({
    span: (8),
}));
const __VLS_404 = __VLS_403({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_403));
__VLS_405.slots.default;
const __VLS_406 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_407 = __VLS_asFunctionalComponent(__VLS_406, new __VLS_406({
    label: "接口标签",
    field: "interfaceTag",
}));
const __VLS_408 = __VLS_407({
    label: "接口标签",
    field: "interfaceTag",
}, ...__VLS_functionalComponentArgsRest(__VLS_407));
__VLS_409.slots.default;
const __VLS_410 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_411 = __VLS_asFunctionalComponent(__VLS_410, new __VLS_410({
    modelValue: (__VLS_ctx.newDataFormData.interfaceTag),
    placeholder: "请选择接口标签",
}));
const __VLS_412 = __VLS_411({
    modelValue: (__VLS_ctx.newDataFormData.interfaceTag),
    placeholder: "请选择接口标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_411));
__VLS_413.slots.default;
const __VLS_414 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_415 = __VLS_asFunctionalComponent(__VLS_414, new __VLS_414({
    value: "主接口",
}));
const __VLS_416 = __VLS_415({
    value: "主接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_415));
__VLS_417.slots.default;
var __VLS_417;
const __VLS_418 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({
    value: "备接口",
}));
const __VLS_420 = __VLS_419({
    value: "备接口",
}, ...__VLS_functionalComponentArgsRest(__VLS_419));
__VLS_421.slots.default;
var __VLS_421;
var __VLS_413;
var __VLS_409;
var __VLS_405;
var __VLS_365;
const __VLS_422 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_423 = __VLS_asFunctionalComponent(__VLS_422, new __VLS_422({
    gutter: (16),
}));
const __VLS_424 = __VLS_423({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_423));
__VLS_425.slots.default;
const __VLS_426 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_427 = __VLS_asFunctionalComponent(__VLS_426, new __VLS_426({
    span: (8),
}));
const __VLS_428 = __VLS_427({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_427));
__VLS_429.slots.default;
const __VLS_430 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({
    label: "供应商",
    field: "provider",
}));
const __VLS_432 = __VLS_431({
    label: "供应商",
    field: "provider",
}, ...__VLS_functionalComponentArgsRest(__VLS_431));
__VLS_433.slots.default;
const __VLS_434 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_435 = __VLS_asFunctionalComponent(__VLS_434, new __VLS_434({
    modelValue: (__VLS_ctx.newDataFormData.provider),
    placeholder: "请输入供应商名称",
}));
const __VLS_436 = __VLS_435({
    modelValue: (__VLS_ctx.newDataFormData.provider),
    placeholder: "请输入供应商名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_435));
var __VLS_433;
var __VLS_429;
const __VLS_438 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_439 = __VLS_asFunctionalComponent(__VLS_438, new __VLS_438({
    span: (8),
}));
const __VLS_440 = __VLS_439({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_439));
__VLS_441.slots.default;
const __VLS_442 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({
    label: "负责人",
    field: "owner",
}));
const __VLS_444 = __VLS_443({
    label: "负责人",
    field: "owner",
}, ...__VLS_functionalComponentArgsRest(__VLS_443));
__VLS_445.slots.default;
const __VLS_446 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_447 = __VLS_asFunctionalComponent(__VLS_446, new __VLS_446({
    modelValue: (__VLS_ctx.newDataFormData.owner),
    placeholder: "请输入负责人",
}));
const __VLS_448 = __VLS_447({
    modelValue: (__VLS_ctx.newDataFormData.owner),
    placeholder: "请输入负责人",
}, ...__VLS_functionalComponentArgsRest(__VLS_447));
var __VLS_445;
var __VLS_441;
var __VLS_425;
const __VLS_450 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_451 = __VLS_asFunctionalComponent(__VLS_450, new __VLS_450({
    gutter: (16),
}));
const __VLS_452 = __VLS_451({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_451));
__VLS_453.slots.default;
const __VLS_454 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({
    span: (12),
}));
const __VLS_456 = __VLS_455({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_455));
__VLS_457.slots.default;
const __VLS_458 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_459 = __VLS_asFunctionalComponent(__VLS_458, new __VLS_458({
    label: "落库表名",
    field: "targetTable",
}));
const __VLS_460 = __VLS_459({
    label: "落库表名",
    field: "targetTable",
}, ...__VLS_functionalComponentArgsRest(__VLS_459));
__VLS_461.slots.default;
const __VLS_462 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_463 = __VLS_asFunctionalComponent(__VLS_462, new __VLS_462({
    modelValue: (__VLS_ctx.newDataFormData.targetTable),
    placeholder: "请输入落库表名",
}));
const __VLS_464 = __VLS_463({
    modelValue: (__VLS_ctx.newDataFormData.targetTable),
    placeholder: "请输入落库表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_463));
var __VLS_461;
var __VLS_457;
const __VLS_466 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_467 = __VLS_asFunctionalComponent(__VLS_466, new __VLS_466({
    span: (12),
}));
const __VLS_468 = __VLS_467({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_467));
__VLS_469.slots.default;
const __VLS_470 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_471 = __VLS_asFunctionalComponent(__VLS_470, new __VLS_470({
    label: "单价（元/条）",
    field: "unitPrice",
}));
const __VLS_472 = __VLS_471({
    label: "单价（元/条）",
    field: "unitPrice",
}, ...__VLS_functionalComponentArgsRest(__VLS_471));
__VLS_473.slots.default;
const __VLS_474 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
// @ts-ignore
const __VLS_475 = __VLS_asFunctionalComponent(__VLS_474, new __VLS_474({
    modelValue: (__VLS_ctx.newDataFormData.unitPrice),
    placeholder: "请输入单价",
    precision: (4),
    min: (0),
    max: (9999.9999),
    ...{ style: {} },
}));
const __VLS_476 = __VLS_475({
    modelValue: (__VLS_ctx.newDataFormData.unitPrice),
    placeholder: "请输入单价",
    precision: (4),
    min: (0),
    max: (9999.9999),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_475));
__VLS_477.slots.default;
{
    const { suffix: __VLS_thisSlot } = __VLS_477.slots;
}
var __VLS_477;
var __VLS_473;
var __VLS_469;
var __VLS_453;
const __VLS_478 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_479 = __VLS_asFunctionalComponent(__VLS_478, new __VLS_478({
    gutter: (16),
}));
const __VLS_480 = __VLS_479({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_479));
__VLS_481.slots.default;
const __VLS_482 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_483 = __VLS_asFunctionalComponent(__VLS_482, new __VLS_482({
    span: (24),
}));
const __VLS_484 = __VLS_483({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_483));
__VLS_485.slots.default;
const __VLS_486 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_487 = __VLS_asFunctionalComponent(__VLS_486, new __VLS_486({
    label: "描述信息",
    field: "description",
}));
const __VLS_488 = __VLS_487({
    label: "描述信息",
    field: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_487));
__VLS_489.slots.default;
const __VLS_490 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_491 = __VLS_asFunctionalComponent(__VLS_490, new __VLS_490({
    modelValue: (__VLS_ctx.newDataFormData.description),
    placeholder: "请输入描述信息",
    rows: (3),
}));
const __VLS_492 = __VLS_491({
    modelValue: (__VLS_ctx.newDataFormData.description),
    placeholder: "请输入描述信息",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_491));
var __VLS_489;
var __VLS_485;
var __VLS_481;
const __VLS_494 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_495 = __VLS_asFunctionalComponent(__VLS_494, new __VLS_494({
    orientation: "left",
}));
const __VLS_496 = __VLS_495({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_495));
__VLS_497.slots.default;
var __VLS_497;
const __VLS_498 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_499 = __VLS_asFunctionalComponent(__VLS_498, new __VLS_498({
    gutter: (16),
}));
const __VLS_500 = __VLS_499({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_499));
__VLS_501.slots.default;
const __VLS_502 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_503 = __VLS_asFunctionalComponent(__VLS_502, new __VLS_502({
    span: (12),
}));
const __VLS_504 = __VLS_503({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_503));
__VLS_505.slots.default;
const __VLS_506 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_507 = __VLS_asFunctionalComponent(__VLS_506, new __VLS_506({
    label: "数据管理员",
    field: "dataManager",
}));
const __VLS_508 = __VLS_507({
    label: "数据管理员",
    field: "dataManager",
}, ...__VLS_functionalComponentArgsRest(__VLS_507));
__VLS_509.slots.default;
const __VLS_510 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_511 = __VLS_asFunctionalComponent(__VLS_510, new __VLS_510({
    modelValue: (__VLS_ctx.newDataFormData.dataManager),
    placeholder: "请输入数据管理员",
}));
const __VLS_512 = __VLS_511({
    modelValue: (__VLS_ctx.newDataFormData.dataManager),
    placeholder: "请输入数据管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_511));
var __VLS_509;
var __VLS_505;
const __VLS_514 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_515 = __VLS_asFunctionalComponent(__VLS_514, new __VLS_514({
    span: (12),
}));
const __VLS_516 = __VLS_515({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_515));
__VLS_517.slots.default;
const __VLS_518 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_519 = __VLS_asFunctionalComponent(__VLS_518, new __VLS_518({
    label: "数据更新频率",
    field: "updateFrequency",
}));
const __VLS_520 = __VLS_519({
    label: "数据更新频率",
    field: "updateFrequency",
}, ...__VLS_functionalComponentArgsRest(__VLS_519));
__VLS_521.slots.default;
const __VLS_522 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_523 = __VLS_asFunctionalComponent(__VLS_522, new __VLS_522({
    modelValue: (__VLS_ctx.newDataFormData.updateFrequency),
    placeholder: "选择更新频率",
}));
const __VLS_524 = __VLS_523({
    modelValue: (__VLS_ctx.newDataFormData.updateFrequency),
    placeholder: "选择更新频率",
}, ...__VLS_functionalComponentArgsRest(__VLS_523));
__VLS_525.slots.default;
const __VLS_526 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_527 = __VLS_asFunctionalComponent(__VLS_526, new __VLS_526({
    value: "实时",
}));
const __VLS_528 = __VLS_527({
    value: "实时",
}, ...__VLS_functionalComponentArgsRest(__VLS_527));
__VLS_529.slots.default;
var __VLS_529;
const __VLS_530 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_531 = __VLS_asFunctionalComponent(__VLS_530, new __VLS_530({
    value: "日更新",
}));
const __VLS_532 = __VLS_531({
    value: "日更新",
}, ...__VLS_functionalComponentArgsRest(__VLS_531));
__VLS_533.slots.default;
var __VLS_533;
const __VLS_534 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_535 = __VLS_asFunctionalComponent(__VLS_534, new __VLS_534({
    value: "离线T+1",
}));
const __VLS_536 = __VLS_535({
    value: "离线T+1",
}, ...__VLS_functionalComponentArgsRest(__VLS_535));
__VLS_537.slots.default;
var __VLS_537;
const __VLS_538 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_539 = __VLS_asFunctionalComponent(__VLS_538, new __VLS_538({
    value: "每周",
}));
const __VLS_540 = __VLS_539({
    value: "每周",
}, ...__VLS_functionalComponentArgsRest(__VLS_539));
__VLS_541.slots.default;
var __VLS_541;
const __VLS_542 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_543 = __VLS_asFunctionalComponent(__VLS_542, new __VLS_542({
    value: "每月",
}));
const __VLS_544 = __VLS_543({
    value: "每月",
}, ...__VLS_functionalComponentArgsRest(__VLS_543));
__VLS_545.slots.default;
var __VLS_545;
var __VLS_525;
var __VLS_521;
var __VLS_517;
var __VLS_501;
const __VLS_546 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_547 = __VLS_asFunctionalComponent(__VLS_546, new __VLS_546({
    gutter: (16),
}));
const __VLS_548 = __VLS_547({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_547));
__VLS_549.slots.default;
const __VLS_550 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_551 = __VLS_asFunctionalComponent(__VLS_550, new __VLS_550({
    span: (24),
}));
const __VLS_552 = __VLS_551({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_551));
__VLS_553.slots.default;
const __VLS_554 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_555 = __VLS_asFunctionalComponent(__VLS_554, new __VLS_554({
    label: "数据管理说明",
}));
const __VLS_556 = __VLS_555({
    label: "数据管理说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_555));
__VLS_557.slots.default;
const __VLS_558 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_559 = __VLS_asFunctionalComponent(__VLS_558, new __VLS_558({
    modelValue: (__VLS_ctx.newDataFormData.dataManagementDescription),
    placeholder: "请输入数据管理相关说明",
    rows: (3),
}));
const __VLS_560 = __VLS_559({
    modelValue: (__VLS_ctx.newDataFormData.dataManagementDescription),
    placeholder: "请输入数据管理相关说明",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_559));
var __VLS_557;
var __VLS_553;
var __VLS_549;
const __VLS_562 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_563 = __VLS_asFunctionalComponent(__VLS_562, new __VLS_562({
    orientation: "left",
}));
const __VLS_564 = __VLS_563({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_563));
__VLS_565.slots.default;
var __VLS_565;
const __VLS_566 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_567 = __VLS_asFunctionalComponent(__VLS_566, new __VLS_566({
    gutter: (16),
}));
const __VLS_568 = __VLS_567({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_567));
__VLS_569.slots.default;
const __VLS_570 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_571 = __VLS_asFunctionalComponent(__VLS_570, new __VLS_570({
    span: (24),
}));
const __VLS_572 = __VLS_571({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_571));
__VLS_573.slots.default;
const __VLS_574 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_575 = __VLS_asFunctionalComponent(__VLS_574, new __VLS_574({
    label: "相关文件",
}));
const __VLS_576 = __VLS_575({
    label: "相关文件",
}, ...__VLS_functionalComponentArgsRest(__VLS_575));
__VLS_577.slots.default;
if (__VLS_ctx.newDataFormData.files && __VLS_ctx.newDataFormData.files.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "uploaded-files" },
    });
    for (const [file, index] of __VLS_getVForSourceType((__VLS_ctx.newDataFormData.files))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "file-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-info" },
        });
        const __VLS_578 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        const __VLS_579 = __VLS_asFunctionalComponent(__VLS_578, new __VLS_578({
            modelValue: (file.displayName),
            placeholder: "请输入文件名称",
            ...{ class: "file-name-input" },
        }));
        const __VLS_580 = __VLS_579({
            modelValue: (file.displayName),
            placeholder: "请输入文件名称",
            ...{ class: "file-name-input" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_579));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "file-original-name" },
        });
        (file.originalName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "file-size" },
        });
        (__VLS_ctx.formatFileSize(file.size));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-actions" },
        });
        const __VLS_582 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_583 = __VLS_asFunctionalComponent(__VLS_582, new __VLS_582({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_584 = __VLS_583({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_583));
        let __VLS_586;
        let __VLS_587;
        let __VLS_588;
        const __VLS_589 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.newDataFormData.files && __VLS_ctx.newDataFormData.files.length > 0))
                    return;
                __VLS_ctx.downloadFile(file);
            }
        };
        __VLS_585.slots.default;
        var __VLS_585;
        const __VLS_590 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_591 = __VLS_asFunctionalComponent(__VLS_590, new __VLS_590({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_592 = __VLS_591({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_591));
        let __VLS_594;
        let __VLS_595;
        let __VLS_596;
        const __VLS_597 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.newDataFormData.files && __VLS_ctx.newDataFormData.files.length > 0))
                    return;
                __VLS_ctx.removeNewDataFile(index);
            }
        };
        __VLS_593.slots.default;
        var __VLS_593;
    }
}
const __VLS_598 = {}.AUpload;
/** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ ;
// @ts-ignore
const __VLS_599 = __VLS_asFunctionalComponent(__VLS_598, new __VLS_598({
    customRequest: (__VLS_ctx.handleNewDataFileUpload),
    showFileList: (false),
    multiple: true,
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar",
    ...{ class: "file-upload" },
}));
const __VLS_600 = __VLS_599({
    customRequest: (__VLS_ctx.handleNewDataFileUpload),
    showFileList: (false),
    multiple: true,
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar",
    ...{ class: "file-upload" },
}, ...__VLS_functionalComponentArgsRest(__VLS_599));
__VLS_601.slots.default;
{
    const { 'upload-button': __VLS_thisSlot } = __VLS_601.slots;
    const __VLS_602 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_603 = __VLS_asFunctionalComponent(__VLS_602, new __VLS_602({
        type: "outline",
    }));
    const __VLS_604 = __VLS_603({
        type: "outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_603));
    __VLS_605.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_605.slots;
        const __VLS_606 = {}.IconUpload;
        /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
        // @ts-ignore
        const __VLS_607 = __VLS_asFunctionalComponent(__VLS_606, new __VLS_606({}));
        const __VLS_608 = __VLS_607({}, ...__VLS_functionalComponentArgsRest(__VLS_607));
    }
    var __VLS_605;
}
var __VLS_601;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "upload-tips" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_577;
var __VLS_573;
var __VLS_569;
var __VLS_303;
var __VLS_294;
/** @type {__VLS_StyleScopedClasses['external-purchase-register']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['header-info']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['register-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area--dragover']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-content']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-text']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-section']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['step-container']} */ ;
/** @type {__VLS_StyleScopedClasses['success-content']} */ ;
/** @type {__VLS_StyleScopedClasses['project-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['step-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['uploaded-files']} */ ;
/** @type {__VLS_StyleScopedClasses['file-item']} */ ;
/** @type {__VLS_StyleScopedClasses['file-info']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name-input']} */ ;
/** @type {__VLS_StyleScopedClasses['file-original-name']} */ ;
/** @type {__VLS_StyleScopedClasses['file-size']} */ ;
/** @type {__VLS_StyleScopedClasses['file-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-tips']} */ ;
// @ts-ignore
var __VLS_305 = __VLS_304;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconCheckCircle: IconCheckCircle,
            IconPlus: IconPlus,
            isEditMode: isEditMode,
            isDragover: isDragover,
            uploadProgress: uploadProgress,
            handleDragOver: handleDragOver,
            handleDragLeave: handleDragLeave,
            handleDrop: handleDrop,
            formatFileSize: formatFileSize,
            handleFileChange: handleFileChange,
            fileList: fileList,
            modalWidth: modalWidth,
            currentStep: currentStep,
            nextStep: nextStep,
            prevStep: prevStep,
            skipFileUpload: skipFileUpload,
            formData: formData,
            filterForm: filterForm,
            showNewDataModal: showNewDataModal,
            newDataFormRef: newDataFormRef,
            newDataFormData: newDataFormData,
            newDataFormRules: newDataFormRules,
            columns: columns,
            summaryColumns: summaryColumns,
            pagination: pagination,
            selectedRowKeys: selectedRowKeys,
            selectedProducts: selectedProducts,
            filteredTableData: filteredTableData,
            selectedNewProducts: selectedNewProducts,
            summaryData: summaryData,
            handleFileUpload: handleFileUpload,
            handleFilter: handleFilter,
            resetFilter: resetFilter,
            handlePageChange: handlePageChange,
            handleSelectionChange: handleSelectionChange,
            finishRegistration: finishRegistration,
            handleNewDataSubmit: handleNewDataSubmit,
            resetNewDataForm: resetNewDataForm,
            handleNewDataFileUpload: handleNewDataFileUpload,
            removeNewDataFile: removeNewDataFile,
            downloadFile: downloadFile,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
