/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconUpload, IconDownload, IconExperiment, IconSend, IconFile } from '@arco-design/web-vue/es/icon';
// 加载状态
const loading = ref(false);
// 表单数据
const formData = reactive({
    inputType: 'manual',
    manualNumbers: '',
    templateMode: 'select',
    templateId: '',
    newTemplate: {
        name: '',
        content: ''
    }
});
// 模拟模板数据
const templates = ref([
    { id: '1', name: '会员生日祝福', content: '尊敬的${name}，祝您生日快乐！感谢您一直以来对我们的支持。' },
    { id: '2', name: '活动邀请', content: '尊敬的会员，我们将于${date}举办${activity}活动，诚邀您的参与。' },
]);
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
// 插入参数到模板内容
const insertParam = (key) => {
    const textarea = document.querySelector('.create-template-form textarea');
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
        // 这里实现确认下发逻辑
        Message.success('短信下发成功');
    }
    catch (error) {
        Message.error('短信下发失败');
    }
};
// 短信类型选项
const smsTypes = [
    { value: 'notice', label: '通知短信' },
    { value: 'marketing', label: '营销短信' },
    { value: 'verification', label: '验证码' }
];
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['upload-button']} */ ;
/** @type {__VLS_StyleScopedClasses['params-card']} */ ;
/** @type {__VLS_StyleScopedClasses['param-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['header-section']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['params-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "manual-sms-container" },
});
const __VLS_0 = {}.ASpin;
/** @type {[typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    loading: (__VLS_ctx.loading),
    ...{ class: "spin-container" },
    tip: "加载中...",
}));
const __VLS_2 = __VLS_1({
    loading: (__VLS_ctx.loading),
    ...{ class: "spin-container" },
    tip: "加载中...",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_4 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    gutter: ([24, 24]),
}));
const __VLS_6 = __VLS_5({
    gutter: ([24, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    span: (24),
    lg: (16),
}));
const __VLS_10 = __VLS_9({
    span: (24),
    lg: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ class: "form-card" },
    bordered: (false),
}));
const __VLS_14 = __VLS_13({
    ...{ class: "form-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    model: (__VLS_ctx.formData),
    layout: "vertical",
}));
const __VLS_18 = __VLS_17({
    model: (__VLS_ctx.formData),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "接收人信息",
    required: true,
}));
const __VLS_22 = __VLS_21({
    label: "接收人信息",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    direction: "vertical",
    size: (16),
    fill: true,
}));
const __VLS_26 = __VLS_25({
    direction: "vertical",
    size: (16),
    fill: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.formData.inputType),
    type: "button",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.formData.inputType),
    type: "button",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    value: "manual",
}));
const __VLS_34 = __VLS_33({
    value: "manual",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
var __VLS_35;
const __VLS_36 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    value: "upload",
}));
const __VLS_38 = __VLS_37({
    value: "upload",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
var __VLS_39;
var __VLS_31;
if (__VLS_ctx.formData.inputType === 'manual') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "manual-input-area" },
    });
    const __VLS_40 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        modelValue: (__VLS_ctx.formData.manualNumbers),
        placeholder: "请输入手机号码，多个号码请用换行分隔",
        autoSize: ({ minRows: 4, maxRows: 8 }),
    }));
    const __VLS_42 = __VLS_41({
        modelValue: (__VLS_ctx.formData.manualNumbers),
        placeholder: "请输入手机号码，多个号码请用换行分隔",
        autoSize: ({ minRows: 4, maxRows: 8 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-tips" },
    });
    const __VLS_44 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        color: "blue",
    }));
    const __VLS_46 = __VLS_45({
        color: "blue",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    var __VLS_47;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-area" },
    });
    const __VLS_48 = {}.AUpload;
    /** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        customRequest: (__VLS_ctx.handleUpload),
        showFileList: (true),
        limit: (1),
        accept: ".xlsx,.xls,.csv",
    }));
    const __VLS_50 = __VLS_49({
        customRequest: (__VLS_ctx.handleUpload),
        showFileList: (true),
        limit: (1),
        accept: ".xlsx,.xls,.csv",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    {
        const { 'upload-button': __VLS_thisSlot } = __VLS_51.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "upload-button" },
        });
        const __VLS_52 = {}.IconUpload;
        /** @type {[typeof __VLS_components.IconUpload, typeof __VLS_components.iconUpload, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "upload-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "upload-hint" },
        });
    }
    var __VLS_51;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-tips" },
    });
    const __VLS_56 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    const __VLS_60 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        type: "text",
        size: "small",
    }));
    const __VLS_62 = __VLS_61({
        type: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_63.slots;
        const __VLS_64 = {}.IconDownload;
        /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
        const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
    }
    var __VLS_63;
    const __VLS_68 = {}.ADivider;
    /** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        direction: "vertical",
    }));
    const __VLS_70 = __VLS_69({
        direction: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tip-text" },
    });
    var __VLS_59;
}
var __VLS_27;
var __VLS_23;
const __VLS_72 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    label: "短信模板",
    required: true,
}));
const __VLS_74 = __VLS_73({
    label: "短信模板",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    direction: "vertical",
    size: (12),
    fill: true,
}));
const __VLS_78 = __VLS_77({
    direction: "vertical",
    size: (12),
    fill: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.formData.templateMode),
    type: "button",
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.formData.templateMode),
    type: "button",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    value: "select",
}));
const __VLS_86 = __VLS_85({
    value: "select",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
var __VLS_87;
const __VLS_88 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    value: "create",
}));
const __VLS_90 = __VLS_89({
    value: "create",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
var __VLS_91;
var __VLS_83;
if (__VLS_ctx.formData.templateMode === 'select') {
    const __VLS_92 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        modelValue: (__VLS_ctx.formData.templateId),
        placeholder: "请选择短信模板",
        allowSearch: true,
    }));
    const __VLS_94 = __VLS_93({
        modelValue: (__VLS_ctx.formData.templateId),
        placeholder: "请选择短信模板",
        allowSearch: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    for (const [template] of __VLS_getVForSourceType((__VLS_ctx.templates))) {
        const __VLS_96 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            key: (template.id),
            value: (template.id),
        }));
        const __VLS_98 = __VLS_97({
            key: (template.id),
            value: (template.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        __VLS_99.slots.default;
        (template.name);
        var __VLS_99;
    }
    var __VLS_95;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "create-template-form" },
    });
    const __VLS_100 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        modelValue: (__VLS_ctx.formData.newTemplate.name),
        placeholder: "请输入模板名称",
    }));
    const __VLS_102 = __VLS_101({
        modelValue: (__VLS_ctx.formData.newTemplate.name),
        placeholder: "请输入模板名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-content-area" },
    });
    const __VLS_104 = {}.ATextarea;
    /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        modelValue: (__VLS_ctx.formData.newTemplate.content),
        placeholder: "请输入模板内容",
        autoSize: ({ minRows: 3, maxRows: 6 }),
    }));
    const __VLS_106 = __VLS_105({
        modelValue: (__VLS_ctx.formData.newTemplate.content),
        placeholder: "请输入模板内容",
        autoSize: ({ minRows: 3, maxRows: 6 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-counter" },
    });
    (__VLS_ctx.formData.newTemplate.content.length);
}
var __VLS_79;
var __VLS_75;
const __VLS_108 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_118 = __VLS_117({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
let __VLS_120;
let __VLS_121;
let __VLS_122;
const __VLS_123 = {
    onClick: (__VLS_ctx.handleTest)
};
__VLS_119.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_119.slots;
    const __VLS_124 = {}.IconExperiment;
    /** @type {[typeof __VLS_components.IconExperiment, typeof __VLS_components.iconExperiment, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({}));
    const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
}
var __VLS_119;
const __VLS_128 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    ...{ 'onClick': {} },
    type: "primary",
    status: "success",
}));
const __VLS_130 = __VLS_129({
    ...{ 'onClick': {} },
    type: "primary",
    status: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
let __VLS_132;
let __VLS_133;
let __VLS_134;
const __VLS_135 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_131.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_131.slots;
    const __VLS_136 = {}.IconSend;
    /** @type {[typeof __VLS_components.IconSend, typeof __VLS_components.iconSend, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
    const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
}
var __VLS_131;
var __VLS_115;
var __VLS_111;
var __VLS_19;
var __VLS_15;
var __VLS_11;
const __VLS_140 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    span: (24),
    lg: (8),
}));
const __VLS_142 = __VLS_141({
    span: (24),
    lg: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    gutter: ([0, 24]),
}));
const __VLS_146 = __VLS_145({
    gutter: ([0, 24]),
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    span: (24),
}));
const __VLS_150 = __VLS_149({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    ...{ class: "preview-card" },
    title: "模板预览",
    bordered: (false),
}));
const __VLS_154 = __VLS_153({
    ...{ class: "preview-card" },
    title: "模板预览",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-content" },
});
if (__VLS_ctx.selectedTemplate?.content) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-message" },
    });
    (__VLS_ctx.selectedTemplate?.content);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-placeholder" },
    });
    const __VLS_156 = {}.IconFile;
    /** @type {[typeof __VLS_components.IconFile, typeof __VLS_components.iconFile, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        ...{ class: "placeholder-icon" },
    }));
    const __VLS_158 = __VLS_157({
        ...{ class: "placeholder-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
var __VLS_155;
var __VLS_151;
if (__VLS_ctx.formData.templateMode === 'create') {
    const __VLS_160 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        span: (24),
    }));
    const __VLS_162 = __VLS_161({
        span: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    const __VLS_164 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        ...{ class: "params-card" },
        title: "可用参数",
        bordered: (false),
    }));
    const __VLS_166 = __VLS_165({
        ...{ class: "params-card" },
        title: "可用参数",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-list" },
    });
    for (const [param] of __VLS_getVForSourceType((__VLS_ctx.riskParams))) {
        const __VLS_168 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
            ...{ 'onClick': {} },
            key: (param.key),
            ...{ class: "param-tag" },
        }));
        const __VLS_170 = __VLS_169({
            ...{ 'onClick': {} },
            key: (param.key),
            ...{ class: "param-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
        let __VLS_172;
        let __VLS_173;
        let __VLS_174;
        const __VLS_175 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.formData.templateMode === 'create'))
                    return;
                __VLS_ctx.insertParam(param.key);
            }
        };
        __VLS_171.slots.default;
        (param.label);
        var __VLS_171;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "params-hint" },
    });
    var __VLS_167;
    var __VLS_163;
}
const __VLS_176 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    span: (24),
}));
const __VLS_178 = __VLS_177({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    ...{ class: "stats-card" },
    title: "发送统计",
    bordered: (false),
}));
const __VLS_182 = __VLS_181({
    ...{ class: "stats-card" },
    title: "发送统计",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    gutter: ([16, 16]),
}));
const __VLS_186 = __VLS_185({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    span: (12),
}));
const __VLS_190 = __VLS_189({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    title: "今日已发送",
    value: (128),
}));
const __VLS_194 = __VLS_193({
    title: "今日已发送",
    value: (128),
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
var __VLS_191;
const __VLS_196 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    span: (12),
}));
const __VLS_198 = __VLS_197({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.AStatistic;
/** @type {[typeof __VLS_components.AStatistic, typeof __VLS_components.aStatistic, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    title: "本月已发送",
    value: (1024),
}));
const __VLS_202 = __VLS_201({
    title: "本月已发送",
    value: (1024),
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
var __VLS_199;
var __VLS_187;
var __VLS_183;
var __VLS_179;
var __VLS_147;
var __VLS_143;
var __VLS_7;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['manual-sms-container']} */ ;
/** @type {__VLS_StyleScopedClasses['spin-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-section']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['content-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['manual-input-area']} */ ;
/** @type {__VLS_StyleScopedClasses['input-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-button']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-text']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['tip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['create-template-form']} */ ;
/** @type {__VLS_StyleScopedClasses['template-content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['template-counter']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-message']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['params-card']} */ ;
/** @type {__VLS_StyleScopedClasses['params-list']} */ ;
/** @type {__VLS_StyleScopedClasses['param-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['params-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconUpload: IconUpload,
            IconDownload: IconDownload,
            IconExperiment: IconExperiment,
            IconSend: IconSend,
            IconFile: IconFile,
            loading: loading,
            formData: formData,
            templates: templates,
            riskParams: riskParams,
            insertParam: insertParam,
            selectedTemplate: selectedTemplate,
            handleUpload: handleUpload,
            handleTest: handleTest,
            handleSubmit: handleSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
