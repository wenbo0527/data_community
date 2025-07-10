/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch } from 'vue';
import { Form as AForm, FormItem as AFormItem, Input as AInput, InputPassword as AInputPassword, Textarea as ATextarea, InputNumber as AInputNumber, Select as ASelect, Cascader as ACascader, DatePicker as ADatePicker, TimePicker as ATimePicker, RangePicker as ARangePicker, RadioGroup as ARadioGroup, CheckboxGroup as ACheckboxGroup, Switch as ASwitch, Slider as ASlider, Rate as ARate, Upload as AUpload, Button as AButton, Space as ASpace, Divider as ADivider } from '@arco-design/web-vue';
import { arcoConfig } from '@/utils/arco';
import { businessMessage } from '@/utils/message';
export default (await import('vue')).defineComponent({
    name: 'BaseForm',
    components: {
        AForm,
        AFormItem,
        AInput,
        AInputPassword,
        ATextarea,
        AInputNumber,
        ASelect,
        ACascader,
        ADatePicker,
        ATimePicker,
        ARangePicker,
        ARadioGroup,
        ACheckboxGroup,
        ASwitch,
        ASlider,
        ARate,
        AUpload,
        AButton,
        ASpace,
        ADivider
    },
    props: {
        // 表单数据
        modelValue: {
            type: Object,
            default: () => ({})
        },
        // 表单项配置
        formItems: {
            type: Array,
            default: () => []
        },
        // 表单验证规则
        rules: {
            type: Object,
            default: () => ({})
        },
        // 表单布局
        layout: {
            type: String,
            default: 'horizontal',
            validator: (value) => ['horizontal', 'vertical', 'inline'].includes(value)
        },
        // 表单大小
        size: {
            type: String,
            default: 'medium',
            validator: (value) => ['small', 'medium', 'large'].includes(value)
        },
        // 标签列属性
        labelColProps: {
            type: Object,
            default: () => ({ span: 6 })
        },
        // 包装列属性
        wrapperColProps: {
            type: Object,
            default: () => ({ span: 18 })
        },
        // 标签对齐方式
        labelAlign: {
            type: String,
            default: 'right',
            validator: (value) => ['left', 'right'].includes(value)
        },
        // 是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        // 是否显示操作按钮
        showActions: {
            type: Boolean,
            default: true
        },
        // 是否显示提交按钮
        showSubmit: {
            type: Boolean,
            default: true
        },
        // 是否显示重置按钮
        showReset: {
            type: Boolean,
            default: true
        },
        // 是否显示取消按钮
        showCancel: {
            type: Boolean,
            default: false
        },
        // 提交按钮文本
        submitText: {
            type: String,
            default: '提交'
        },
        // 重置按钮文本
        resetText: {
            type: String,
            default: '重置'
        },
        // 取消按钮文本
        cancelText: {
            type: String,
            default: '取消'
        },
        // 提交加载状态
        submitLoading: {
            type: Boolean,
            default: false
        },
        // 操作按钮包装列属性
        actionWrapperColProps: {
            type: Object,
            default: () => ({ offset: 6, span: 18 })
        },
        // 其他表单属性
        formProps: {
            type: Object,
            default: () => ({})
        }
    },
    emits: ['update:modelValue', 'submit', 'submit-success', 'submit-failed', 'reset', 'cancel'],
    setup(props, { emit }) {
        const formRef = ref();
        // 表单数据
        const formData = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value)
        });
        // 表单验证规则
        const formRules = computed(() => {
            const rules = { ...props.rules };
            // 从表单项中提取验证规则
            props.formItems.forEach(item => {
                if (item.rules && item.field) {
                    rules[item.field] = item.rules;
                }
            });
            return rules;
        });
        // 事件处理
        const handleSubmit = (data) => {
            emit('submit', data);
        };
        const handleSubmitSuccess = (data) => {
            businessMessage.saveSuccess();
            emit('submit-success', data);
        };
        const handleSubmitFailed = (data) => {
            businessMessage.error('表单验证失败，请检查输入内容');
            emit('submit-failed', data);
        };
        const handleReset = () => {
            formRef.value?.resetFields();
            emit('reset');
        };
        const handleCancel = () => {
            emit('cancel');
        };
        // 表单方法
        const validate = () => {
            return formRef.value?.validate();
        };
        const validateField = (field) => {
            return formRef.value?.validateField(field);
        };
        const resetFields = () => {
            formRef.value?.resetFields();
        };
        const clearValidate = (field) => {
            formRef.value?.clearValidate(field);
        };
        const setFields = (data) => {
            formRef.value?.setFields(data);
        };
        return {
            formRef,
            formData,
            formRules,
            handleSubmit,
            handleSubmitSuccess,
            handleSubmitFailed,
            handleReset,
            handleCancel,
            validate,
            validateField,
            resetFields,
            clearValidate,
            setFields
        };
    }
});
const __VLS_ctx = {};
const __VLS_componentsOption = {
    AForm,
    AFormItem,
    AInput,
    AInputPassword,
    ATextarea,
    AInputNumber,
    ASelect,
    ACascader,
    ADatePicker,
    ATimePicker,
    ARangePicker,
    ARadioGroup,
    ACheckboxGroup,
    ASwitch,
    ASlider,
    ARate,
    AUpload,
    AButton,
    ASpace,
    ADivider
};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-form-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "base-form-container" },
});
const __VLS_0 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSubmit': {} },
    ...{ 'onSubmitSuccess': {} },
    ...{ 'onSubmitFailed': {} },
    ref: "formRef",
    ...(__VLS_ctx.formProps),
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    layout: (__VLS_ctx.layout),
    size: (__VLS_ctx.size),
    labelColProps: (__VLS_ctx.labelColProps),
    wrapperColProps: (__VLS_ctx.wrapperColProps),
    labelAlign: (__VLS_ctx.labelAlign),
    disabled: (__VLS_ctx.disabled),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    ...{ 'onSubmitSuccess': {} },
    ...{ 'onSubmitFailed': {} },
    ref: "formRef",
    ...(__VLS_ctx.formProps),
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    layout: (__VLS_ctx.layout),
    size: (__VLS_ctx.size),
    labelColProps: (__VLS_ctx.labelColProps),
    wrapperColProps: (__VLS_ctx.wrapperColProps),
    labelAlign: (__VLS_ctx.labelAlign),
    disabled: (__VLS_ctx.disabled),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: (__VLS_ctx.handleSubmit)
};
const __VLS_8 = {
    onSubmitSuccess: (__VLS_ctx.handleSubmitSuccess)
};
const __VLS_9 = {
    onSubmitFailed: (__VLS_ctx.handleSubmitFailed)
};
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_10 = {};
__VLS_3.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.formItems))) {
    (item.field);
    if (item.type === 'group') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-group-title" },
        });
        (item.title);
    }
    else if (item.type === 'divider') {
        const __VLS_12 = {}.ADivider;
        /** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            orientation: (item.orientation || 'left'),
        }));
        const __VLS_14 = __VLS_13({
            orientation: (item.orientation || 'left'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        (item.title);
        var __VLS_15;
    }
    else {
        const __VLS_16 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            field: (item.field),
            label: (item.label),
            rules: (item.rules),
            validateTrigger: (item.validateTrigger),
            help: (item.help),
            extra: (item.extra),
            required: (item.required),
            asteriskPosition: (item.asteriskPosition),
            labelColProps: (item.labelColProps),
            wrapperColProps: (item.wrapperColProps),
            hideLabel: (item.hideLabel),
            hideAsterisk: (item.hideAsterisk),
            disabled: (item.disabled || __VLS_ctx.disabled),
            ...{ class: (item.className) },
        }));
        const __VLS_18 = __VLS_17({
            field: (item.field),
            label: (item.label),
            rules: (item.rules),
            validateTrigger: (item.validateTrigger),
            help: (item.help),
            extra: (item.extra),
            required: (item.required),
            asteriskPosition: (item.asteriskPosition),
            labelColProps: (item.labelColProps),
            wrapperColProps: (item.wrapperColProps),
            hideLabel: (item.hideLabel),
            hideAsterisk: (item.hideAsterisk),
            disabled: (item.disabled || __VLS_ctx.disabled),
            ...{ class: (item.className) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        if (item.type === 'input') {
            const __VLS_20 = {}.AInput;
            /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请输入${item.label}`),
                maxLength: (item.maxLength),
                showWordLimit: (item.showWordLimit),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_22 = __VLS_21({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请输入${item.label}`),
                maxLength: (item.maxLength),
                showWordLimit: (item.showWordLimit),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        }
        else if (item.type === 'password') {
            const __VLS_24 = {}.AInputPassword;
            /** @type {[typeof __VLS_components.AInputPassword, typeof __VLS_components.aInputPassword, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请输入${item.label}`),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_26 = __VLS_25({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请输入${item.label}`),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        }
        else if (item.type === 'textarea') {
            const __VLS_28 = {}.ATextarea;
            /** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请输入${item.label}`),
                maxLength: (item.maxLength),
                showWordLimit: (item.showWordLimit),
                autoSize: (item.autoSize),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_30 = __VLS_29({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请输入${item.label}`),
                maxLength: (item.maxLength),
                showWordLimit: (item.showWordLimit),
                autoSize: (item.autoSize),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        }
        else if (item.type === 'number') {
            const __VLS_32 = {}.AInputNumber;
            /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请输入${item.label}`),
                min: (item.min),
                max: (item.max),
                step: (item.step),
                precision: (item.precision),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_34 = __VLS_33({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请输入${item.label}`),
                min: (item.min),
                max: (item.max),
                step: (item.step),
                precision: (item.precision),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        }
        else if (item.type === 'select') {
            const __VLS_36 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                options: (item.options),
                multiple: (item.multiple),
                allowSearch: (item.allowSearch),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                loading: (item.loading),
                ...(item.props),
            }));
            const __VLS_38 = __VLS_37({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                options: (item.options),
                multiple: (item.multiple),
                allowSearch: (item.allowSearch),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                loading: (item.loading),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        }
        else if (item.type === 'cascader') {
            const __VLS_40 = {}.ACascader;
            /** @type {[typeof __VLS_components.ACascader, typeof __VLS_components.aCascader, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                options: (item.options),
                multiple: (item.multiple),
                allowSearch: (item.allowSearch),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                loading: (item.loading),
                ...(item.props),
            }));
            const __VLS_42 = __VLS_41({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                options: (item.options),
                multiple: (item.multiple),
                allowSearch: (item.allowSearch),
                allowClear: (item.allowClear !== false),
                disabled: (item.disabled || __VLS_ctx.disabled),
                loading: (item.loading),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        }
        else if (item.type === 'date') {
            const __VLS_44 = {}.ADatePicker;
            /** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                format: (item.format),
                disabled: (item.disabled || __VLS_ctx.disabled),
                allowClear: (item.allowClear !== false),
                ...(item.props),
            }));
            const __VLS_46 = __VLS_45({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                format: (item.format),
                disabled: (item.disabled || __VLS_ctx.disabled),
                allowClear: (item.allowClear !== false),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        }
        else if (item.type === 'time') {
            const __VLS_48 = {}.ATimePicker;
            /** @type {[typeof __VLS_components.ATimePicker, typeof __VLS_components.aTimePicker, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                format: (item.format),
                disabled: (item.disabled || __VLS_ctx.disabled),
                allowClear: (item.allowClear !== false),
                ...(item.props),
            }));
            const __VLS_50 = __VLS_49({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                format: (item.format),
                disabled: (item.disabled || __VLS_ctx.disabled),
                allowClear: (item.allowClear !== false),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        }
        else if (item.type === 'datetime') {
            const __VLS_52 = {}.ADatePicker;
            /** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                format: (item.format || 'YYYY-MM-DD HH:mm:ss'),
                showTime: (true),
                disabled: (item.disabled || __VLS_ctx.disabled),
                allowClear: (item.allowClear !== false),
                ...(item.props),
            }));
            const __VLS_54 = __VLS_53({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || `请选择${item.label}`),
                format: (item.format || 'YYYY-MM-DD HH:mm:ss'),
                showTime: (true),
                disabled: (item.disabled || __VLS_ctx.disabled),
                allowClear: (item.allowClear !== false),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        }
        else if (item.type === 'daterange') {
            const __VLS_56 = {}.ARangePicker;
            /** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || ['开始日期', '结束日期']),
                format: (item.format),
                disabled: (item.disabled || __VLS_ctx.disabled),
                allowClear: (item.allowClear !== false),
                ...(item.props),
            }));
            const __VLS_58 = __VLS_57({
                modelValue: (__VLS_ctx.formData[item.field]),
                placeholder: (item.placeholder || ['开始日期', '结束日期']),
                format: (item.format),
                disabled: (item.disabled || __VLS_ctx.disabled),
                allowClear: (item.allowClear !== false),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        }
        else if (item.type === 'radio') {
            const __VLS_60 = {}.ARadioGroup;
            /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                modelValue: (__VLS_ctx.formData[item.field]),
                options: (item.options),
                direction: (item.direction || 'horizontal'),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_62 = __VLS_61({
                modelValue: (__VLS_ctx.formData[item.field]),
                options: (item.options),
                direction: (item.direction || 'horizontal'),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        }
        else if (item.type === 'checkbox') {
            const __VLS_64 = {}.ACheckboxGroup;
            /** @type {[typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, ]} */ ;
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                modelValue: (__VLS_ctx.formData[item.field]),
                options: (item.options),
                direction: (item.direction || 'horizontal'),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_66 = __VLS_65({
                modelValue: (__VLS_ctx.formData[item.field]),
                options: (item.options),
                direction: (item.direction || 'horizontal'),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        }
        else if (item.type === 'switch') {
            const __VLS_68 = {}.ASwitch;
            /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                modelValue: (__VLS_ctx.formData[item.field]),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_70 = __VLS_69({
                modelValue: (__VLS_ctx.formData[item.field]),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        }
        else if (item.type === 'slider') {
            const __VLS_72 = {}.ASlider;
            /** @type {[typeof __VLS_components.ASlider, typeof __VLS_components.aSlider, ]} */ ;
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
                modelValue: (__VLS_ctx.formData[item.field]),
                min: (item.min),
                max: (item.max),
                step: (item.step),
                range: (item.range),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_74 = __VLS_73({
                modelValue: (__VLS_ctx.formData[item.field]),
                min: (item.min),
                max: (item.max),
                step: (item.step),
                range: (item.range),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        }
        else if (item.type === 'rate') {
            const __VLS_76 = {}.ARate;
            /** @type {[typeof __VLS_components.ARate, typeof __VLS_components.aRate, ]} */ ;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                modelValue: (__VLS_ctx.formData[item.field]),
                count: (item.count),
                allowHalf: (item.allowHalf),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_78 = __VLS_77({
                modelValue: (__VLS_ctx.formData[item.field]),
                count: (item.count),
                allowHalf: (item.allowHalf),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        }
        else if (item.type === 'upload') {
            const __VLS_80 = {}.AUpload;
            /** @type {[typeof __VLS_components.AUpload, typeof __VLS_components.aUpload, ]} */ ;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                fileList: (__VLS_ctx.formData[item.field]),
                action: (item.action),
                multiple: (item.multiple),
                accept: (item.accept),
                limit: (item.limit),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }));
            const __VLS_82 = __VLS_81({
                fileList: (__VLS_ctx.formData[item.field]),
                action: (item.action),
                multiple: (item.multiple),
                accept: (item.accept),
                limit: (item.limit),
                disabled: (item.disabled || __VLS_ctx.disabled),
                ...(item.props),
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        }
        else if (item.type === 'slot') {
            var __VLS_84 = {
                item: (item),
                formData: (__VLS_ctx.formData),
            };
            var __VLS_85 = __VLS_tryAsConstant(item.slotName || item.field);
        }
        else if (item.type === 'render' && item.render) {
            const __VLS_88 = ((item.render));
            // @ts-ignore
            const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                item: (item),
                formData: (__VLS_ctx.formData),
            }));
            const __VLS_90 = __VLS_89({
                item: (item),
                formData: (__VLS_ctx.formData),
            }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        }
        var __VLS_19;
    }
}
if (__VLS_ctx.showActions) {
    const __VLS_92 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        wrapperColProps: (__VLS_ctx.actionWrapperColProps),
    }));
    const __VLS_94 = __VLS_93({
        wrapperColProps: (__VLS_ctx.actionWrapperColProps),
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    const __VLS_96 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        size: (16),
    }));
    const __VLS_98 = __VLS_97({
        size: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    if (__VLS_ctx.showSubmit) {
        const __VLS_100 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            type: "primary",
            htmlType: "submit",
            loading: (__VLS_ctx.submitLoading),
            disabled: (__VLS_ctx.disabled),
        }));
        const __VLS_102 = __VLS_101({
            type: "primary",
            htmlType: "submit",
            loading: (__VLS_ctx.submitLoading),
            disabled: (__VLS_ctx.disabled),
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        __VLS_103.slots.default;
        (__VLS_ctx.submitText);
        var __VLS_103;
    }
    if (__VLS_ctx.showReset) {
        const __VLS_104 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            ...{ 'onClick': {} },
            disabled: (__VLS_ctx.disabled),
        }));
        const __VLS_106 = __VLS_105({
            ...{ 'onClick': {} },
            disabled: (__VLS_ctx.disabled),
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        let __VLS_108;
        let __VLS_109;
        let __VLS_110;
        const __VLS_111 = {
            onClick: (__VLS_ctx.handleReset)
        };
        __VLS_107.slots.default;
        (__VLS_ctx.resetText);
        var __VLS_107;
    }
    if (__VLS_ctx.showCancel) {
        const __VLS_112 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
            ...{ 'onClick': {} },
            disabled: (__VLS_ctx.disabled),
        }));
        const __VLS_114 = __VLS_113({
            ...{ 'onClick': {} },
            disabled: (__VLS_ctx.disabled),
        }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        let __VLS_116;
        let __VLS_117;
        let __VLS_118;
        const __VLS_119 = {
            onClick: (__VLS_ctx.handleCancel)
        };
        __VLS_115.slots.default;
        (__VLS_ctx.cancelText);
        var __VLS_115;
    }
    var __VLS_120 = {
        formData: (__VLS_ctx.formData),
    };
    var __VLS_99;
    var __VLS_95;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['base-form-container']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group-title']} */ ;
// @ts-ignore
var __VLS_11 = __VLS_10, __VLS_86 = __VLS_85, __VLS_87 = __VLS_84, __VLS_121 = __VLS_120;
var __VLS_dollars;
let __VLS_self;
