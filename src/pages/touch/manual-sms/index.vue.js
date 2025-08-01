import { ref, reactive, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconUpload, IconDownload, IconExperiment, IconSend, IconFile, IconInfoCircle, IconEdit, IconEye, IconUser, IconCheckCircle, IconLeft } from '@arco-design/web-vue/es/icon';
import { useRouter } from 'vue-router';
// 路由
const router = useRouter();
// 加载状态
const loading = ref(false);
// 表单数据
const formData = reactive({
    batchName: '',
    department: '',
    sendTime: null, // 发送日期
    sendHour: null, // 发送小时
    inputType: 'manual', // manual | upload
    manualNumbers: '',
    customerIdField: '',
    phoneField: '',
    templateMode: 'select', // select | create
    templateId: '',
    newTemplate: {
        name: '',
        type: '',
        content: ''
    }
});
// 测试发送相关状态
const testModalVisible = ref(false);
const testCompleteModalVisible = ref(false);
const testPhone = ref('');
const selectedRecordId = ref(null);
const selectedRecord = ref(null);
const testCompleted = ref(false);
// 模拟模板数据
const templates = ref([
    { id: '1', name: '会员生日祝福', content: '尊敬的${customerName}，祝您生日快乐！感谢您一直以来对我们的支持。' },
    { id: '2', name: '活动邀请', content: '尊敬的会员，我们将于${currentDate}举办${activity}活动，诚邀您的参与。' },
]);
// 参数记录数据（模拟5条记录）
const paramRecords = ref([
    {
        id: 1,
        customerName: '张三',
        activityTime: '2024-01-15至2024-01-31',
        contactPhone: '400-123-4567',
        balance: '1,250.00',
        age: '28'
    },
    {
        id: 2,
        customerName: '李四',
        activityTime: '2024-01-20至2024-02-05',
        contactPhone: '400-123-4567',
        balance: '3,680.50',
        age: '35'
    },
    {
        id: 3,
        customerName: '王五',
        activityTime: '2024-01-25至2024-02-10',
        contactPhone: '400-123-4567',
        balance: '856.20',
        age: '42'
    },
    {
        id: 4,
        customerName: '赵六',
        activityTime: '2024-02-01至2024-02-15',
        contactPhone: '400-123-4567',
        balance: '2,145.80',
        age: '31'
    },
    {
        id: 5,
        customerName: '钱七',
        activityTime: '2024-02-05至2024-02-20',
        contactPhone: '400-123-4567',
        balance: '4,520.30',
        age: '29'
    }
]);
// 参数记录表格列配置
const paramRecordColumns = [
    { title: '客户姓名', dataIndex: 'customerName', width: 100 },
    { title: '活动时间', dataIndex: 'activityTime', width: 180 },
    { title: '联系电话', dataIndex: 'contactPhone', width: 120 },
    { title: '账户余额', dataIndex: 'balance', width: 100 },
    { title: '年龄', dataIndex: 'age', width: 80 }
];
// 风险合规底表预设参数
const riskParams = ref([
    { key: 'customerName', label: '客户姓名' },
    { key: 'idNumber', label: '身份证号' },
    { key: 'riskLevel', label: '风险等级' },
    { key: 'riskScore', label: '风险评分' },
    { key: 'warningTime', label: '预警时间' },
    { key: 'warningType', label: '预警类型' },
    { key: 'accountStatus', label: '账户状态' },
]);
// 目标表参数
const targetParams = ref([
    { key: 'customerName', label: '客户姓名' },
    { key: 'idNumber', label: '身份证号' },
    { key: 'accountNo', label: '账号' },
    { key: 'balance', label: '余额' },
    { key: 'riskLevel', label: '风险等级' },
]);
// 统一标准参数
const standardParams = ref([
    { key: 'bankName', label: '银行名称' },
    { key: 'branchName', label: '支行名称' },
    { key: 'servicePhone', label: '服务电话' },
    { key: 'currentDate', label: '当前日期' },
]);
// 短信类型选项
const smsTypes = [
    { value: 'notice', label: '通知短信' },
    { value: 'marketing', label: '营销短信' },
    { value: 'verification', label: '验证码' }
];
// 插入参数到模板内容
const insertParam = (key) => {
    const textarea = document.querySelector('.template-textarea');
    if (textarea) {
        const cursorPos = textarea.selectionStart;
        const content = formData.newTemplate.content;
        const newContent = content.slice(0, cursorPos) + '${' + key + '}' + content.slice(cursorPos);
        formData.newTemplate.content = newContent;
        // 恢复光标位置
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(cursorPos + key.length + 3, cursorPos + key.length + 3);
        }, 0);
    }
};
// 获取当前模板内容
const selectedTemplate = computed(() => {
    if (formData.templateMode === 'select') {
        return templates.value.find(t => t.id === formData.templateId);
    }
    else {
        return formData.newTemplate;
    }
});
// 预览内容
const previewContent = computed(() => {
    if (!selectedTemplate.value)
        return '';
    return selectedTemplate.value.content;
});
// 刷新后的模板内容
const refreshedTemplate = computed(() => {
    if (!selectedTemplate.value || !selectedRecord.value)
        return '';
    let content = selectedTemplate.value.content;
    // 替换模板中的参数
    if (selectedRecord.value) {
        Object.keys(selectedRecord.value).forEach(key => {
            if (key !== 'id') {
                const regex = new RegExp(`\$\{${key}\}`, 'g');
                content = content.replace(regex, selectedRecord.value[key]);
            }
        });
    }
    return content;
});
// 处理文件上传
const handleUpload = async (options) => {
    try {
        // 这里实现文件上传逻辑
        Message.success('文件上传成功');
    }
    catch (error) {
        Message.error('文件上传失败');
    }
};
// 显示测试发送弹窗
const showTestModal = () => {
    testModalVisible.value = true;
    testPhone.value = '';
    selectedRecordId.value = null;
    selectedRecord.value = null;
};
// 关闭测试发送弹窗
const closeTestModal = () => {
    testModalVisible.value = false;
};
// 选择参数记录
const selectParamRecord = (record) => {
    selectedRecordId.value = record.id;
    selectedRecord.value = record;
};
// 发送测试短信
const sendTest = () => {
    if (!testPhone.value || !selectedRecord.value)
        return;
    // 这里实现测试发送逻辑
    setTimeout(() => {
        testModalVisible.value = false;
        testCompleteModalVisible.value = true;
    }, 1000);
};
// 返回编辑
const backToEdit = () => {
    testCompleteModalVisible.value = false;
};
// 测试完成
const testComplete = () => {
    testCompleteModalVisible.value = false;
    testCompleted.value = true;
    Message.success('测试完成，可以进行下一步操作');
};
// 测试发送
const handleTest = async () => {
    try {
        // 这里实现测试发送逻辑
        Message.success('测试发送成功');
    }
    catch (error) {
        Message.error('测试发送失败');
    }
};
// 确认下发
const handleSubmit = async () => {
    try {
        // 验证必填字段
        if (!formData.batchName) {
            Message.error('请输入短信批次名称');
            return;
        }
        if (!formData.sendTime || !formData.sendHour) {
            Message.error('请选择短信发送时间');
            return;
        }
        // 格式化发送时间为YYYYmmdd HH格式
        const sendDate = formData.sendTime ? new Date(formData.sendTime) : null;
        const sendHour = formData.sendHour ? new Date(formData.sendHour) : null;
        let formattedSendTime = '';
        if (sendDate && sendHour) {
            const year = sendDate.getFullYear();
            const month = String(sendDate.getMonth() + 1).padStart(2, '0');
            const day = String(sendDate.getDate()).padStart(2, '0');
            const hour = String(sendHour.getHours()).padStart(2, '0');
            formattedSendTime = `${year}${month}${day} ${hour}`;
            console.log('短信发送时间:', formattedSendTime); // 格式: YYYYmmdd HH
        }
        // 这里实现确认下发逻辑，包含发送时间
        Message.success('短信下发成功，将在指定时间发送');
    }
    catch (error) {
        Message.error('短信下发失败');
    }
};
// 返回列表页
const backToList = () => {
    router.push({ name: 'ManualSMSList' });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['upload-button']} */ ;
/** @type {__VLS_StyleScopedClasses['param-tag']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "manual-sms-container" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "header-card" },
    bordered: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "header-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    const __VLS_4 = {}.IconSend;
    /** @type {[typeof __VLS_components.IconSend, typeof __VLS_components.iconSend, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_8 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.backToList)
};
__VLS_11.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_11.slots;
    const __VLS_16 = {}.IconLeft;
    /** @type {[typeof __VLS_components.IconLeft, typeof __VLS_components.iconLeft, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
var __VLS_11;
var __VLS_3;
const __VLS_20 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ class: "batch-card" },
    bordered: (false),
}));
const __VLS_22 = __VLS_21({
    ...{ class: "batch-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    gutter: (24),
}));
const __VLS_26 = __VLS_25({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
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
    label: "短信批次名称",
    required: true,
}));
const __VLS_34 = __VLS_33({
    label: "短信批次名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.formData.batchName),
    placeholder: "请输入短信批次名称，用于标识本次发送任务",
    ...{ style: {} },
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.formData.batchName),
    placeholder: "请输入短信批次名称，用于标识本次发送任务",
    ...{ style: {} },
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
    label: "归属部门",
}));
const __VLS_46 = __VLS_45({
    label: "归属部门",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.formData.department),
    placeholder: "请选择归属部门",
    ...{ style: {} },
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.formData.department),
    placeholder: "请选择归属部门",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    value: "marketing",
}));
const __VLS_54 = __VLS_53({
    value: "marketing",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
var __VLS_55;
const __VLS_56 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    value: "customer",
}));
const __VLS_58 = __VLS_57({
    value: "customer",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
var __VLS_59;
const __VLS_60 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    value: "product",
}));
const __VLS_62 = __VLS_61({
    value: "product",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
var __VLS_63;
const __VLS_64 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    value: "risk",
}));
const __VLS_66 = __VLS_65({
    value: "risk",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
var __VLS_67;
const __VLS_68 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    value: "operation",
}));
const __VLS_70 = __VLS_69({
    value: "operation",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
var __VLS_51;
var __VLS_47;
var __VLS_43;
const __VLS_72 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    span: (8),
}));
const __VLS_74 = __VLS_73({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "短信发送时间",
    required: true,
}));
const __VLS_78 = __VLS_77({
    label: "短信发送时间",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ADatePicker;
/** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.formData.sendTime),
    placeholder: "选择发送日期",
    ...{ style: {} },
    format: "YYYY-MM-DD",
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.formData.sendTime),
    placeholder: "选择发送日期",
    ...{ style: {} },
    format: "YYYY-MM-DD",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const __VLS_84 = {}.ATimePicker;
/** @type {[typeof __VLS_components.ATimePicker, typeof __VLS_components.aTimePicker, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.formData.sendHour),
    placeholder: "选择发送时间",
    ...{ style: {} },
    format: "HH",
    hideMinuteButton: (true),
    hideSecondButton: (true),
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.formData.sendHour),
    placeholder: "选择发送时间",
    ...{ style: {} },
    format: "HH",
    hideMinuteButton: (true),
    hideSecondButton: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-hint" },
});
var __VLS_79;
var __VLS_75;
var __VLS_27;
var __VLS_23;
const __VLS_88 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ class: "recipient-card" },
    bordered: (false),
}));
const __VLS_90 = __VLS_89({
    ...{ class: "recipient-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_91.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    const __VLS_92 = {}.IconUser;
    /** @type {[typeof __VLS_components.IconUser, typeof __VLS_components.iconUser, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
    const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
}
const __VLS_96 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    model: (__VLS_ctx.formData),
    layout: "vertical",
}));
const __VLS_98 = __VLS_97({
    model: (__VLS_ctx.formData),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "输入方式",
    required: true,
}));
const __VLS_102 = __VLS_101({
    label: "输入方式",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.formData.inputType),
    type: "button",
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.formData.inputType),
    type: "button",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    value: "manual",
}));
const __VLS_110 = __VLS_109({
    value: "manual",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
var __VLS_111;
const __VLS_112 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    value: "upload",
}));
const __VLS_114 = __VLS_113({
    value: "upload",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
var __VLS_115;
var __VLS_107;
var __VLS_103;
if (__VLS_ctx.formData.inputType === 'upload') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "field-mapping" },
    });
    const __VLS_116 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        gutter: (24),
    }));
    const __VLS_118 = __VLS_117({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    const __VLS_120 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        span: (12),
    }));
    const __VLS_122 = __VLS_121({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_123.slots.default;
    const __VLS_124 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        label: "客户标识字段",
    }));
    const __VLS_126 = __VLS_125({
        label: "客户标识字段",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    const __VLS_128 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        modelValue: (__VLS_ctx.formData.customerIdField),
        placeholder: "请选择客户标识字段",
        ...{ style: {} },
    }));
    const __VLS_130 = __VLS_129({
        modelValue: (__VLS_ctx.formData.customerIdField),
        placeholder: "请选择客户标识字段",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    const __VLS_132 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        value: "customer_id",
    }));
    const __VLS_134 = __VLS_133({
        value: "customer_id",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    var __VLS_135;
    const __VLS_136 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        value: "user_id",
    }));
    const __VLS_138 = __VLS_137({
        value: "user_id",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    var __VLS_139;
    const __VLS_140 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        value: "member_id",
    }));
    const __VLS_142 = __VLS_141({
        value: "member_id",
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    var __VLS_143;
    const __VLS_144 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        value: "account_id",
    }));
    const __VLS_146 = __VLS_145({
        value: "account_id",
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_147.slots.default;
    var __VLS_147;
    var __VLS_131;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "field-hint" },
    });
    var __VLS_127;
    var __VLS_123;
    const __VLS_148 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        span: (12),
    }));
    const __VLS_150 = __VLS_149({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_151.slots.default;
    const __VLS_152 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        label: "手机号字段",
    }));
    const __VLS_154 = __VLS_153({
        label: "手机号字段",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    __VLS_155.slots.default;
    const __VLS_156 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        modelValue: (__VLS_ctx.formData.phoneField),
        placeholder: "请选择手机号字段",
        ...{ style: {} },
    }));
    const __VLS_158 = __VLS_157({
        modelValue: (__VLS_ctx.formData.phoneField),
        placeholder: "请选择手机号字段",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    const __VLS_160 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        value: "phone",
    }));
    const __VLS_162 = __VLS_161({
        value: "phone",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    var __VLS_163;
    const __VLS_164 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        value: "mobile",
    }));
    const __VLS_166 = __VLS_165({
        value: "mobile",
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    var __VLS_167;
    const __VLS_168 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        value: "contact_phone",
    }));
    const __VLS_170 = __VLS_169({
        value: "contact_phone",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_171.slots.default;
    var __VLS_171;
    const __VLS_172 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        value: "tel",
    }));
    const __VLS_174 = __VLS_173({
        value: "tel",
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    var __VLS_175;
    var __VLS_159;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "field-hint" },
    });
    var __VLS_155;
    var __VLS_151;
    var __VLS_119;
}
if (__VLS_ctx.formData.inputType === 'manual') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "manual-input-area" },
    });
    const __VLS_176 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        modelValue: (__VLS_ctx.formData.manualNumbers),
        placeholder: "请输入手机号码，多个号码用换行分隔",
        autoSize: ({ minRows: 4, maxRows: 8 }),
    }));
    const __VLS_178 = __VLS_177({
        modelValue: (__VLS_ctx.formData.manualNumbers),
        placeholder: "请输入手机号码，多个号码用换行分隔",
        autoSize: ({ minRows: 4, maxRows: 8 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-tips" },
    });
    const __VLS_180 = {}.IconInfoCircle;
    /** @type {[typeof __VLS_components.IconInfoCircle, typeof __VLS_components.iconInfoCircle, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({}));
    const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tip-text" },
    });
}
if (__VLS_ctx.formData.inputType === 'upload') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-area" },
    });
    const __VLS_184 = {}.AUpload;
    /** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        customRequest: (__VLS_ctx.handleUpload),
        showFileList: (false),
        accept: ".xlsx,.xls,.csv",
    }));
    const __VLS_186 = __VLS_185({
        customRequest: (__VLS_ctx.handleUpload),
        showFileList: (false),
        accept: ".xlsx,.xls,.csv",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    {
        const { 'upload-button': __VLS_thisSlot } = __VLS_187.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "upload-button" },
        });
        const __VLS_188 = {}.IconUpload;
        /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({}));
        const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "upload-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "upload-hint" },
        });
    }
    var __VLS_187;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-tips" },
    });
    const __VLS_192 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        type: "text",
        size: "small",
    }));
    const __VLS_194 = __VLS_193({
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_195.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_195.slots;
        const __VLS_196 = {}.IconDownload;
        /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
        // @ts-ignore
        const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({}));
        const __VLS_198 = __VLS_197({}, ...__VLS_functionalComponentArgsRest(__VLS_197));
    }
    var __VLS_195;
}
var __VLS_99;
var __VLS_91;
const __VLS_200 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    ...{ class: "template-select-card" },
    bordered: (false),
}));
const __VLS_202 = __VLS_201({
    ...{ class: "template-select-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_203.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    const __VLS_204 = {}.IconFile;
    /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({}));
    const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
}
const __VLS_208 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    model: (__VLS_ctx.formData),
    layout: "vertical",
}));
const __VLS_210 = __VLS_209({
    model: (__VLS_ctx.formData),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
const __VLS_212 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    label: "模板选择",
    required: true,
}));
const __VLS_214 = __VLS_213({
    label: "模板选择",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
const __VLS_216 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    modelValue: (__VLS_ctx.formData.templateMode),
    type: "button",
}));
const __VLS_218 = __VLS_217({
    modelValue: (__VLS_ctx.formData.templateMode),
    type: "button",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    value: "select",
}));
const __VLS_222 = __VLS_221({
    value: "select",
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
var __VLS_223;
const __VLS_224 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    value: "create",
}));
const __VLS_226 = __VLS_225({
    value: "create",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
var __VLS_227;
var __VLS_219;
var __VLS_215;
if (__VLS_ctx.formData.templateMode === 'select') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_228 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        label: "选择模板",
    }));
    const __VLS_230 = __VLS_229({
        label: "选择模板",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    __VLS_231.slots.default;
    const __VLS_232 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
        modelValue: (__VLS_ctx.formData.templateId),
        placeholder: "请选择短信模板",
        options: (__VLS_ctx.templates.map(t => ({ label: t.name, value: t.id }))),
        ...{ style: {} },
    }));
    const __VLS_234 = __VLS_233({
        modelValue: (__VLS_ctx.formData.templateId),
        placeholder: "请选择短信模板",
        options: (__VLS_ctx.templates.map(t => ({ label: t.name, value: t.id }))),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    var __VLS_231;
}
if (__VLS_ctx.formData.templateMode === 'create') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_236 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
        gutter: (24),
    }));
    const __VLS_238 = __VLS_237({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    __VLS_239.slots.default;
    const __VLS_240 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
        span: (12),
    }));
    const __VLS_242 = __VLS_241({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    __VLS_243.slots.default;
    const __VLS_244 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
        label: "模板名称",
    }));
    const __VLS_246 = __VLS_245({
        label: "模板名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    __VLS_247.slots.default;
    const __VLS_248 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        modelValue: (__VLS_ctx.formData.newTemplate.name),
        placeholder: "请输入模板名称",
    }));
    const __VLS_250 = __VLS_249({
        modelValue: (__VLS_ctx.formData.newTemplate.name),
        placeholder: "请输入模板名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    var __VLS_247;
    var __VLS_243;
    const __VLS_252 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
        span: (12),
    }));
    const __VLS_254 = __VLS_253({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_253));
    __VLS_255.slots.default;
    const __VLS_256 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
        label: "短信类型",
    }));
    const __VLS_258 = __VLS_257({
        label: "短信类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    __VLS_259.slots.default;
    const __VLS_260 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
        modelValue: (__VLS_ctx.formData.newTemplate.type),
        placeholder: "请选择短信类型",
        options: (__VLS_ctx.smsTypes),
    }));
    const __VLS_262 = __VLS_261({
        modelValue: (__VLS_ctx.formData.newTemplate.type),
        placeholder: "请选择短信类型",
        options: (__VLS_ctx.smsTypes),
    }, ...__VLS_functionalComponentArgsRest(__VLS_261));
    var __VLS_259;
    var __VLS_255;
    var __VLS_239;
}
var __VLS_211;
var __VLS_203;
if (__VLS_ctx.formData.templateMode === 'create') {
    const __VLS_264 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
        ...{ class: "template-edit-card" },
        bordered: (false),
    }));
    const __VLS_266 = __VLS_265({
        ...{ class: "template-edit-card" },
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    __VLS_267.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_267.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-title" },
        });
        const __VLS_268 = {}.IconEdit;
        /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
        // @ts-ignore
        const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({}));
        const __VLS_270 = __VLS_269({}, ...__VLS_functionalComponentArgsRest(__VLS_269));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "params-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "params-hint" },
    });
    const __VLS_272 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        defaultActiveKey: "risk",
        size: "small",
        ...{ class: "params-tabs" },
    }));
    const __VLS_274 = __VLS_273({
        defaultActiveKey: "risk",
        size: "small",
        ...{ class: "params-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    __VLS_275.slots.default;
    const __VLS_276 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
        key: "risk",
        title: "风险合规",
    }));
    const __VLS_278 = __VLS_277({
        key: "risk",
        title: "风险合规",
    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
    __VLS_279.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-grid" },
    });
    for (const [param] of __VLS_getVForSourceType((__VLS_ctx.riskParams))) {
        const __VLS_280 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
            ...{ 'onClick': {} },
            key: (param.key),
            ...{ class: "param-tag" },
        }));
        const __VLS_282 = __VLS_281({
            ...{ 'onClick': {} },
            key: (param.key),
            ...{ class: "param-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_281));
        let __VLS_284;
        let __VLS_285;
        let __VLS_286;
        const __VLS_287 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.formData.templateMode === 'create'))
                    return;
                __VLS_ctx.insertParam(param.key);
            }
        };
        __VLS_283.slots.default;
        (param.label);
        var __VLS_283;
    }
    var __VLS_279;
    const __VLS_288 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
        key: "target",
        title: "目标表",
    }));
    const __VLS_290 = __VLS_289({
        key: "target",
        title: "目标表",
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    __VLS_291.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-grid" },
    });
    for (const [param] of __VLS_getVForSourceType((__VLS_ctx.targetParams))) {
        const __VLS_292 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
            ...{ 'onClick': {} },
            key: (param.key),
            ...{ class: "param-tag" },
        }));
        const __VLS_294 = __VLS_293({
            ...{ 'onClick': {} },
            key: (param.key),
            ...{ class: "param-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_293));
        let __VLS_296;
        let __VLS_297;
        let __VLS_298;
        const __VLS_299 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.formData.templateMode === 'create'))
                    return;
                __VLS_ctx.insertParam(param.key);
            }
        };
        __VLS_295.slots.default;
        (param.label);
        var __VLS_295;
    }
    var __VLS_291;
    const __VLS_300 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
        key: "standard",
        title: "标准参数",
    }));
    const __VLS_302 = __VLS_301({
        key: "standard",
        title: "标准参数",
    }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    __VLS_303.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-grid" },
    });
    for (const [param] of __VLS_getVForSourceType((__VLS_ctx.standardParams))) {
        const __VLS_304 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
            ...{ 'onClick': {} },
            key: (param.key),
            ...{ class: "param-tag" },
        }));
        const __VLS_306 = __VLS_305({
            ...{ 'onClick': {} },
            key: (param.key),
            ...{ class: "param-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_305));
        let __VLS_308;
        let __VLS_309;
        let __VLS_310;
        const __VLS_311 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.formData.templateMode === 'create'))
                    return;
                __VLS_ctx.insertParam(param.key);
            }
        };
        __VLS_307.slots.default;
        (param.label);
        var __VLS_307;
    }
    var __VLS_303;
    var __VLS_275;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-editor" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "editor-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "editor-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "char-counter" },
    });
    (__VLS_ctx.formData.newTemplate.content.length);
    const __VLS_312 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
        modelValue: (__VLS_ctx.formData.newTemplate.content),
        placeholder: "请输入模板内容，可点击上方参数快速插入",
        autoSize: ({ minRows: 6, maxRows: 10 }),
        ...{ class: "template-textarea" },
    }));
    const __VLS_314 = __VLS_313({
        modelValue: (__VLS_ctx.formData.newTemplate.content),
        placeholder: "请输入模板内容，可点击上方参数快速插入",
        autoSize: ({ minRows: 6, maxRows: 10 }),
        ...{ class: "template-textarea" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_313));
    var __VLS_267;
}
const __VLS_316 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    ...{ class: "preview-card" },
    bordered: (false),
}));
const __VLS_318 = __VLS_317({
    ...{ class: "preview-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_319.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title" },
    });
    const __VLS_320 = {}.IconEye;
    /** @type {[typeof __VLS_components.IconEye, typeof __VLS_components.iconEye, ]} */ ;
    // @ts-ignore
    const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({}));
    const __VLS_322 = __VLS_321({}, ...__VLS_functionalComponentArgsRest(__VLS_321));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-text" },
});
(__VLS_ctx.previewContent);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "char-count" },
});
(__VLS_ctx.previewContent.length);
var __VLS_319;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-action-bar" },
});
const __VLS_324 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({}));
const __VLS_326 = __VLS_325({}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
const __VLS_328 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_330 = __VLS_329({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
let __VLS_332;
let __VLS_333;
let __VLS_334;
const __VLS_335 = {
    onClick: (__VLS_ctx.showTestModal)
};
__VLS_331.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_331.slots;
    const __VLS_336 = {}.IconExperiment;
    /** @type {[typeof __VLS_components.IconExperiment, typeof __VLS_components.iconExperiment, ]} */ ;
    // @ts-ignore
    const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({}));
    const __VLS_338 = __VLS_337({}, ...__VLS_functionalComponentArgsRest(__VLS_337));
}
var __VLS_331;
const __VLS_340 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
    ...{ 'onClick': {} },
    type: "primary",
    status: "success",
}));
const __VLS_342 = __VLS_341({
    ...{ 'onClick': {} },
    type: "primary",
    status: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
let __VLS_344;
let __VLS_345;
let __VLS_346;
const __VLS_347 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_343.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_343.slots;
    const __VLS_348 = {}.IconSend;
    /** @type {[typeof __VLS_components.IconSend, typeof __VLS_components.iconSend, ]} */ ;
    // @ts-ignore
    const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({}));
    const __VLS_350 = __VLS_349({}, ...__VLS_functionalComponentArgsRest(__VLS_349));
}
var __VLS_343;
var __VLS_327;
const __VLS_352 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.testModalVisible),
    title: "测试发送",
    width: "800px",
    footer: (false),
}));
const __VLS_354 = __VLS_353({
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.testModalVisible),
    title: "测试发送",
    width: "800px",
    footer: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_353));
let __VLS_356;
let __VLS_357;
let __VLS_358;
const __VLS_359 = {
    onCancel: (__VLS_ctx.closeTestModal)
};
__VLS_355.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "test-modal-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "test-phone-section" },
});
const __VLS_360 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
    label: "测试手机号",
    required: true,
}));
const __VLS_362 = __VLS_361({
    label: "测试手机号",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_361));
__VLS_363.slots.default;
const __VLS_364 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
    modelValue: (__VLS_ctx.testPhone),
    placeholder: "请输入测试手机号",
    maxLength: (11),
}));
const __VLS_366 = __VLS_365({
    modelValue: (__VLS_ctx.testPhone),
    placeholder: "请输入测试手机号",
    maxLength: (11),
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
var __VLS_363;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "param-records-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
const __VLS_368 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({
    ...{ 'onRowClick': {} },
    columns: (__VLS_ctx.paramRecordColumns),
    data: (__VLS_ctx.paramRecords),
    pagination: (false),
    rowKey: "id",
    rowSelection: ({
        type: 'radio',
        selectedRowKeys: __VLS_ctx.selectedRecordId ? [__VLS_ctx.selectedRecordId] : [],
        onSelect: (rowKeys, rowKey) => __VLS_ctx.selectParamRecord(rowKey)
    }),
}));
const __VLS_370 = __VLS_369({
    ...{ 'onRowClick': {} },
    columns: (__VLS_ctx.paramRecordColumns),
    data: (__VLS_ctx.paramRecords),
    pagination: (false),
    rowKey: "id",
    rowSelection: ({
        type: 'radio',
        selectedRowKeys: __VLS_ctx.selectedRecordId ? [__VLS_ctx.selectedRecordId] : [],
        onSelect: (rowKeys, rowKey) => __VLS_ctx.selectParamRecord(rowKey)
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_369));
let __VLS_372;
let __VLS_373;
let __VLS_374;
const __VLS_375 = {
    onRowClick: (__VLS_ctx.selectParamRecord)
};
var __VLS_371;
if (__VLS_ctx.selectedRecord) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "refreshed-template-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-preview" },
    });
    (__VLS_ctx.refreshedTemplate);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "test-modal-actions" },
});
const __VLS_376 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
    ...{ 'onClick': {} },
}));
const __VLS_378 = __VLS_377({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_377));
let __VLS_380;
let __VLS_381;
let __VLS_382;
const __VLS_383 = {
    onClick: (__VLS_ctx.closeTestModal)
};
__VLS_379.slots.default;
var __VLS_379;
const __VLS_384 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.testPhone || !__VLS_ctx.selectedRecord),
}));
const __VLS_386 = __VLS_385({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.testPhone || !__VLS_ctx.selectedRecord),
}, ...__VLS_functionalComponentArgsRest(__VLS_385));
let __VLS_388;
let __VLS_389;
let __VLS_390;
const __VLS_391 = {
    onClick: (__VLS_ctx.sendTest)
};
__VLS_387.slots.default;
var __VLS_387;
var __VLS_355;
const __VLS_392 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
    visible: (__VLS_ctx.testCompleteModalVisible),
    title: "测试发送完成",
    width: "400px",
    footer: (false),
}));
const __VLS_394 = __VLS_393({
    visible: (__VLS_ctx.testCompleteModalVisible),
    title: "测试发送完成",
    width: "400px",
    footer: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_393));
__VLS_395.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "test-complete-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "success-message" },
});
const __VLS_396 = {}.IconCheckCircle;
/** @type {[typeof __VLS_components.IconCheckCircle, typeof __VLS_components.iconCheckCircle, ]} */ ;
// @ts-ignore
const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
    ...{ style: {} },
}));
const __VLS_398 = __VLS_397({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_397));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.testPhone);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "complete-actions" },
});
const __VLS_400 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({
    ...{ 'onClick': {} },
}));
const __VLS_402 = __VLS_401({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_401));
let __VLS_404;
let __VLS_405;
let __VLS_406;
const __VLS_407 = {
    onClick: (__VLS_ctx.backToEdit)
};
__VLS_403.slots.default;
var __VLS_403;
const __VLS_408 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_409 = __VLS_asFunctionalComponent(__VLS_408, new __VLS_408({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_410 = __VLS_409({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_409));
let __VLS_412;
let __VLS_413;
let __VLS_414;
const __VLS_415 = {
    onClick: (__VLS_ctx.testComplete)
};
__VLS_411.slots.default;
var __VLS_411;
var __VLS_395;
/** @type {__VLS_StyleScopedClasses['manual-sms-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['recipient-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['field-mapping']} */ ;
/** @type {__VLS_StyleScopedClasses['field-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['field-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['manual-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['tip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-button']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-text']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['template-select-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['template-edit-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['params-section']} */ ;
/** @type {__VLS_StyleScopedClasses['params-header']} */ ;
/** @type {__VLS_StyleScopedClasses['params-label']} */ ;
/** @type {__VLS_StyleScopedClasses['params-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['params-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['params-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['param-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['params-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['param-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['params-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['param-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['template-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-label']} */ ;
/** @type {__VLS_StyleScopedClasses['char-counter']} */ ;
/** @type {__VLS_StyleScopedClasses['template-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-section']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-text']} */ ;
/** @type {__VLS_StyleScopedClasses['char-count']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-action-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['test-modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['test-phone-section']} */ ;
/** @type {__VLS_StyleScopedClasses['param-records-section']} */ ;
/** @type {__VLS_StyleScopedClasses['refreshed-template-section']} */ ;
/** @type {__VLS_StyleScopedClasses['template-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['test-modal-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['test-complete-content']} */ ;
/** @type {__VLS_StyleScopedClasses['success-message']} */ ;
/** @type {__VLS_StyleScopedClasses['complete-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconDownload: IconDownload,
            IconExperiment: IconExperiment,
            IconSend: IconSend,
            IconFile: IconFile,
            IconInfoCircle: IconInfoCircle,
            IconEdit: IconEdit,
            IconEye: IconEye,
            IconUser: IconUser,
            IconCheckCircle: IconCheckCircle,
            IconLeft: IconLeft,
            formData: formData,
            testModalVisible: testModalVisible,
            testCompleteModalVisible: testCompleteModalVisible,
            testPhone: testPhone,
            selectedRecordId: selectedRecordId,
            selectedRecord: selectedRecord,
            templates: templates,
            paramRecords: paramRecords,
            paramRecordColumns: paramRecordColumns,
            riskParams: riskParams,
            targetParams: targetParams,
            standardParams: standardParams,
            smsTypes: smsTypes,
            insertParam: insertParam,
            previewContent: previewContent,
            refreshedTemplate: refreshedTemplate,
            handleUpload: handleUpload,
            showTestModal: showTestModal,
            closeTestModal: closeTestModal,
            selectParamRecord: selectParamRecord,
            sendTest: sendTest,
            backToEdit: backToEdit,
            testComplete: testComplete,
            handleSubmit: handleSubmit,
            backToList: backToList,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
