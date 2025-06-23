/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconCalendar } from '@arco-design/web-vue/es/icon';
import dayjs from 'dayjs';
const modalVisible = ref(false);
const dateModalVisible = ref(false);
const dateOption = ref('all');
const customStartDate = ref(null);
const customEndDate = ref(null);
const applicationDescription = ref('');
const formData = ref({
    variableScope: 'all',
    selectedProducts: [],
    startDate: null,
    endDate: null,
    executionCycle: ''
});
// 数据产品选项
const dataProducts = ref([
    { value: 'user_profile', label: '用户画像数据' },
    { value: 'transaction_data', label: '交易流水数据' },
    { value: 'risk_score', label: '风险评分数据' },
    { value: 'behavior_analysis', label: '行为分析数据' },
    { value: 'credit_assessment', label: '信用评估数据' },
    { value: 'market_data', label: '市场数据' },
    { value: 'external_data', label: '外部数据源' },
    { value: 'financial_indicators', label: '财务指标数据' }
]);
// 显示添加弹窗
const showAddModal = () => {
    modalVisible.value = true;
    // 重置表单
    formData.value = {
        variableScope: 'all',
        selectedProducts: [],
        startDate: null,
        endDate: null,
        executionCycle: ''
    };
};
// 处理执行周期变化
const handleCycleChange = (value) => {
    const yesterday = dayjs().subtract(1, 'day');
    if (value === 'daily') {
        // 每日：开始时间默认为昨天
        formData.value.startDate = yesterday.format('YYYY-MM-DD');
        formData.value.endDate = null;
    }
    else if (value === 'once') {
        // 仅本次：结束时间为昨天
        formData.value.endDate = yesterday.format('YYYY-MM-DD');
    }
};
// 禁用开始日期
const disabledStartDate = (current) => {
    if (formData.value.executionCycle === 'daily') {
        // 每日模式：开始日期不能晚于昨天
        return current && current.isAfter(dayjs().subtract(1, 'day'), 'day');
    }
    return false;
};
// 禁用结束日期
const disabledEndDate = (current) => {
    if (formData.value.executionCycle === 'once') {
        // 仅本次模式：结束日期必须是昨天
        return current && !current.isSame(dayjs().subtract(1, 'day'), 'day');
    }
    if (formData.value.startDate) {
        // 结束时间必须晚于开始时间
        return current && current.isBefore(dayjs(formData.value.startDate), 'day');
    }
    return false;
};
// 打开日期选择弹窗
const openDateModal = () => {
    dateModalVisible.value = true;
};
// 确认添加任务
const handleConfirm = () => {
    // 验证表单
    if (!formData.value.executionCycle) {
        Message.error('请选择执行周期');
        return;
    }
    if (formData.value.executionCycle === 'daily' && !formData.value.startDate) {
        Message.error('请选择开始日期');
        return;
    }
    if (formData.value.executionCycle === 'once' && !formData.value.endDate) {
        Message.error('请选择结束日期');
        return;
    }
    if (formData.value.variableScope === 'custom' && formData.value.selectedProducts.length === 0) {
        Message.error('请选择至少一个数据产品');
        return;
    }
    if (formData.value.startDate && formData.value.endDate) {
        if (dayjs(formData.value.endDate).isBefore(dayjs(formData.value.startDate))) {
            Message.error('结束时间必须晚于开始时间');
            return;
        }
    }
    modalVisible.value = false;
    Message.success('任务创建成功');
};
// 取消添加任务
const handleCancel = () => {
    modalVisible.value = false;
};
// 确认日期选择
const handleDateConfirm = () => {
    if (dateOption.value === 'custom') {
        if (customStartDate.value && customEndDate.value) {
            formData.value.startDate = customStartDate.value;
            formData.value.endDate = customEndDate.value;
        }
    }
    dateModalVisible.value = false;
};
// 取消日期选择
const handleDateCancel = () => {
    dateModalVisible.value = false;
};
// 提交申请
const handleSubmitApplication = () => {
    if (!applicationDescription.value.trim()) {
        Message.error('请输入申请说明');
        return;
    }
    Message.success('申请提交成功');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['add-product-item']} */ ;
/** @type {__VLS_StyleScopedClasses['add-product-item']} */ ;
/** @type {__VLS_StyleScopedClasses['add-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['add-product-item']} */ ;
/** @type {__VLS_StyleScopedClasses['add-text']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-products']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.showAddModal)
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "application-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "products-grid" },
});
for (const [n] of __VLS_getVForSourceType((4))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.showAddModal) },
        key: (n),
        ...{ class: "add-product-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "add-icon" },
    });
    const __VLS_12 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "add-text" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "application-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "description-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "description-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "character-count" },
});
(__VLS_ctx.applicationDescription.length);
const __VLS_16 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.applicationDescription),
    placeholder: "请输入申请说明",
    maxLength: (1000),
    autoSize: ({ minRows: 4, maxRows: 8 }),
    showWordLimit: true,
    ...{ class: "description-textarea" },
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.applicationDescription),
    placeholder: "请输入申请说明",
    maxLength: (1000),
    autoSize: ({ minRows: 4, maxRows: 8 }),
    showWordLimit: true,
    ...{ class: "description-textarea" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "confirm-section" },
});
const __VLS_20 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (__VLS_ctx.handleSubmitApplication)
};
__VLS_23.slots.default;
var __VLS_23;
const __VLS_28 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.modalVisible),
    title: "添加申请",
    width: "600px",
    maskClosable: (false),
}));
const __VLS_30 = __VLS_29({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.modalVisible),
    title: "添加申请",
    width: "600px",
    maskClosable: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onOk: (__VLS_ctx.handleConfirm)
};
const __VLS_36 = {
    onCancel: (__VLS_ctx.handleCancel)
};
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
const __VLS_37 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    modelValue: (__VLS_ctx.formData.variableScope),
    ...{ class: "radio-group" },
}));
const __VLS_39 = __VLS_38({
    modelValue: (__VLS_ctx.formData.variableScope),
    ...{ class: "radio-group" },
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
const __VLS_41 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    value: "all",
}));
const __VLS_43 = __VLS_42({
    value: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
var __VLS_44;
const __VLS_45 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    value: "custom",
}));
const __VLS_47 = __VLS_46({
    value: "custom",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
var __VLS_48;
var __VLS_40;
if (__VLS_ctx.formData.variableScope === 'custom') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "custom-products" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    const __VLS_49 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        modelValue: (__VLS_ctx.formData.selectedProducts),
        placeholder: "请选择数据产品",
        multiple: true,
        allowClear: true,
        maxTagCount: (3),
    }));
    const __VLS_51 = __VLS_50({
        modelValue: (__VLS_ctx.formData.selectedProducts),
        placeholder: "请选择数据产品",
        multiple: true,
        allowClear: true,
        maxTagCount: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    for (const [product] of __VLS_getVForSourceType((__VLS_ctx.dataProducts))) {
        const __VLS_53 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            key: (product.value),
            value: (product.value),
        }));
        const __VLS_55 = __VLS_54({
            key: (product.value),
            value: (product.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        __VLS_56.slots.default;
        (product.label);
        var __VLS_56;
    }
    var __VLS_52;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
const __VLS_57 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.formData.executionCycle),
    ...{ class: "radio-group" },
}));
const __VLS_59 = __VLS_58({
    modelValue: (__VLS_ctx.formData.executionCycle),
    ...{ class: "radio-group" },
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
const __VLS_61 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    value: "daily",
}));
const __VLS_63 = __VLS_62({
    value: "daily",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
var __VLS_64;
const __VLS_65 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    value: "once",
}));
const __VLS_67 = __VLS_66({
    value: "once",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
var __VLS_68;
var __VLS_60;
if (__VLS_ctx.formData.executionCycle) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "date-range" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "date-label" },
    });
    const __VLS_69 = {}.ADatePicker;
    /** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        modelValue: (__VLS_ctx.formData.startDate),
        placeholder: "请选择开始日期",
        disabledDate: (__VLS_ctx.disabledStartDate),
    }));
    const __VLS_71 = __VLS_70({
        modelValue: (__VLS_ctx.formData.startDate),
        placeholder: "请选择开始日期",
        disabledDate: (__VLS_ctx.disabledStartDate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "date-separator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "date-label" },
    });
    const __VLS_73 = {}.ADatePicker;
    /** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        modelValue: (__VLS_ctx.formData.endDate),
        placeholder: "请选择结束日期",
        disabledDate: (__VLS_ctx.disabledEndDate),
    }));
    const __VLS_75 = __VLS_74({
        modelValue: (__VLS_ctx.formData.endDate),
        placeholder: "请选择结束日期",
        disabledDate: (__VLS_ctx.disabledEndDate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    const __VLS_77 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        ...{ 'onClick': {} },
        type: "text",
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onClick': {} },
        type: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_81;
    let __VLS_82;
    let __VLS_83;
    const __VLS_84 = {
        onClick: (__VLS_ctx.openDateModal)
    };
    __VLS_80.slots.default;
    const __VLS_85 = {}.IconCalendar;
    /** @type {[typeof __VLS_components.IconCalendar, typeof __VLS_components.iconCalendar, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
    const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
    var __VLS_80;
}
var __VLS_31;
const __VLS_89 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.dateModalVisible),
    title: "添加申请",
    width: "400px",
    maskClosable: (false),
}));
const __VLS_91 = __VLS_90({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.dateModalVisible),
    title: "添加申请",
    width: "400px",
    maskClosable: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
let __VLS_93;
let __VLS_94;
let __VLS_95;
const __VLS_96 = {
    onOk: (__VLS_ctx.handleDateConfirm)
};
const __VLS_97 = {
    onCancel: (__VLS_ctx.handleDateCancel)
};
__VLS_92.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "date-modal-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "date-option" },
});
const __VLS_98 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    modelValue: (__VLS_ctx.dateOption),
    ...{ class: "date-radio-group" },
}));
const __VLS_100 = __VLS_99({
    modelValue: (__VLS_ctx.dateOption),
    ...{ class: "date-radio-group" },
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
__VLS_101.slots.default;
const __VLS_102 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
    value: "all",
}));
const __VLS_104 = __VLS_103({
    value: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
__VLS_105.slots.default;
var __VLS_105;
const __VLS_106 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    value: "custom",
}));
const __VLS_108 = __VLS_107({
    value: "custom",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
__VLS_109.slots.default;
var __VLS_109;
var __VLS_101;
if (__VLS_ctx.dateOption === 'custom') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "custom-date" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "date-range-picker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "date-label" },
    });
    const __VLS_110 = {}.ADatePicker;
    /** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        modelValue: (__VLS_ctx.customStartDate),
        placeholder: "开始日期",
    }));
    const __VLS_112 = __VLS_111({
        modelValue: (__VLS_ctx.customStartDate),
        placeholder: "开始日期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "date-separator" },
    });
    const __VLS_114 = {}.ADatePicker;
    /** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
        modelValue: (__VLS_ctx.customEndDate),
        placeholder: "结束日期",
    }));
    const __VLS_116 = __VLS_115({
        modelValue: (__VLS_ctx.customEndDate),
        placeholder: "结束日期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
}
var __VLS_92;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['application-list']} */ ;
/** @type {__VLS_StyleScopedClasses['products-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['add-product-item']} */ ;
/** @type {__VLS_StyleScopedClasses['add-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['add-text']} */ ;
/** @type {__VLS_StyleScopedClasses['application-description']} */ ;
/** @type {__VLS_StyleScopedClasses['description-header']} */ ;
/** @type {__VLS_StyleScopedClasses['description-title']} */ ;
/** @type {__VLS_StyleScopedClasses['character-count']} */ ;
/** @type {__VLS_StyleScopedClasses['description-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-section']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-group']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-products']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['date-range']} */ ;
/** @type {__VLS_StyleScopedClasses['date-label']} */ ;
/** @type {__VLS_StyleScopedClasses['date-separator']} */ ;
/** @type {__VLS_StyleScopedClasses['date-label']} */ ;
/** @type {__VLS_StyleScopedClasses['date-modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['date-option']} */ ;
/** @type {__VLS_StyleScopedClasses['date-radio-group']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-date']} */ ;
/** @type {__VLS_StyleScopedClasses['date-range-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['date-label']} */ ;
/** @type {__VLS_StyleScopedClasses['date-separator']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconCalendar: IconCalendar,
            modalVisible: modalVisible,
            dateModalVisible: dateModalVisible,
            dateOption: dateOption,
            customStartDate: customStartDate,
            customEndDate: customEndDate,
            applicationDescription: applicationDescription,
            formData: formData,
            dataProducts: dataProducts,
            showAddModal: showAddModal,
            disabledStartDate: disabledStartDate,
            disabledEndDate: disabledEndDate,
            openDateModal: openDateModal,
            handleConfirm: handleConfirm,
            handleCancel: handleCancel,
            handleDateConfirm: handleDateConfirm,
            handleDateCancel: handleDateCancel,
            handleSubmitApplication: handleSubmitApplication,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
