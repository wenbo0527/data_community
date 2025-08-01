/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch } from 'vue';
import { Modal as AModal } from '@arco-design/web-vue';
import BaseForm from './BaseForm.vue';
import { businessMessage } from '@/utils/message';
export default (await import('vue')).defineComponent({
    name: 'BaseModal',
    components: {
        AModal,
        BaseForm
    },
    props: {
        // 显示状态
        visible: {
            type: Boolean,
            default: false
        },
        // 标题
        title: {
            type: String,
            default: ''
        },
        // 描述信息
        description: {
            type: String,
            default: ''
        },
        // 宽度
        width: {
            type: [String, Number],
            default: 520
        },
        // 点击遮罩层是否可以关闭
        maskClosable: {
            type: Boolean,
            default: false
        },
        // 按ESC键是否可以关闭
        escToClose: {
            type: Boolean,
            default: true
        },
        // 是否显示关闭按钮
        closable: {
            type: Boolean,
            default: true
        },
        // 是否居中显示
        alignCenter: {
            type: Boolean,
            default: true
        },
        // 是否可拖拽
        draggable: {
            type: Boolean,
            default: false
        },
        // 是否全屏
        fullScreen: {
            type: Boolean,
            default: false
        },
        // 是否显示遮罩层
        mask: {
            type: Boolean,
            default: true
        },
        // 是否为简单模式
        simple: {
            type: Boolean,
            default: false
        },
        // 是否隐藏取消按钮
        hideCancel: {
            type: Boolean,
            default: false
        },
        // 是否隐藏标题
        hideTitle: {
            type: Boolean,
            default: false
        },
        // 是否显示底部
        footer: {
            type: Boolean,
            default: true
        },
        // 确定按钮文本
        okText: {
            type: String,
            default: '确定'
        },
        // 取消按钮文本
        cancelText: {
            type: String,
            default: '取消'
        },
        // 确定按钮加载状态
        okLoading: {
            type: Boolean,
            default: false
        },
        // 确定按钮属性
        okButtonProps: {
            type: Object,
            default: () => ({})
        },
        // 取消按钮属性
        cancelButtonProps: {
            type: Object,
            default: () => ({})
        },
        // 内容区域样式
        bodyStyle: {
            type: Object,
            default: () => ({})
        },
        // 模态框类名
        modalClass: {
            type: String,
            default: ''
        },
        // 模态框样式
        modalStyle: {
            type: Object,
            default: () => ({})
        },
        // 表单数据
        formData: {
            type: Object,
            default: () => ({})
        },
        // 表单项配置
        formItems: {
            type: Array,
            default: () => []
        },
        // 表单验证规则
        formRules: {
            type: Object,
            default: () => ({})
        },
        // 表单布局
        formLayout: {
            type: String,
            default: 'horizontal'
        },
        // 表单大小
        formSize: {
            type: String,
            default: 'medium'
        },
        // 表单标签列属性
        formLabelColProps: {
            type: Object,
            default: () => ({ span: 6 })
        },
        // 表单包装列属性
        formWrapperColProps: {
            type: Object,
            default: () => ({ span: 18 })
        },
        // 表单标签对齐方式
        formLabelAlign: {
            type: String,
            default: 'right'
        },
        // 表单是否禁用
        formDisabled: {
            type: Boolean,
            default: false
        },
        // 是否在确定前验证表单
        validateBeforeOk: {
            type: Boolean,
            default: true
        },
        // 其他模态框属性
        modalProps: {
            type: Object,
            default: () => ({})
        }
    },
    emits: [
        'update:visible',
        'update:formData',
        'ok',
        'cancel',
        'open',
        'close',
        'before-ok',
        'before-cancel',
        'form-submit'
    ],
    setup(props, { emit, slots }) {
        const formRef = ref();
        // 计算属性
        const computedFooter = computed(() => {
            return props.footer;
        });
        // 表单插槽
        const formSlots = computed(() => {
            const slotNames = Object.keys(slots);
            const formSlotNames = slotNames.filter(name => name !== 'default' &&
                name !== 'title' &&
                name !== 'footer');
            return formSlotNames.reduce((acc, name) => {
                acc[name] = slots[name];
                return acc;
            }, {});
        });
        // 事件处理
        const handleOk = async () => {
            try {
                // 如果有表单且需要验证
                if (props.formItems.length > 0 && props.validateBeforeOk) {
                    const valid = await formRef.value?.validate();
                    if (!valid) {
                        businessMessage.error('请完善表单信息');
                        return false;
                    }
                }
                emit('ok', props.formData);
                return true;
            }
            catch (error) {
                console.error('Modal ok validation failed:', error);
                return false;
            }
        };
        const handleCancel = () => {
            emit('cancel');
            emit('update:visible', false);
        };
        const handleOpen = () => {
            emit('open');
        };
        const handleClose = () => {
            emit('close');
            emit('update:visible', false);
        };
        const handleBeforeOk = (done) => {
            emit('before-ok', done);
        };
        const handleBeforeCancel = (done) => {
            emit('before-cancel', done);
        };
        const handleFormSubmit = (data) => {
            emit('form-submit', data);
        };
        // 监听表单数据变化
        watch(() => props.formData, (newData) => {
            emit('update:formData', newData);
        }, { deep: true });
        // 暴露表单方法
        const validateForm = () => {
            return formRef.value?.validate();
        };
        const resetForm = () => {
            formRef.value?.resetFields();
        };
        const clearValidate = (field) => {
            formRef.value?.clearValidate(field);
        };
        return {
            formRef,
            computedFooter,
            formSlots,
            handleOk,
            handleCancel,
            handleOpen,
            handleClose,
            handleBeforeOk,
            handleBeforeCancel,
            handleFormSubmit,
            validateForm,
            resetForm,
            clearValidate
        };
    }
});
const __VLS_ctx = {};
const __VLS_componentsOption = {
    AModal,
    BaseForm
};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-large']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-fullscreen']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    ...{ 'onOpen': {} },
    ...{ 'onClose': {} },
    ...{ 'onBeforeOk': {} },
    ...{ 'onBeforeCancel': {} },
    ...(__VLS_ctx.modalProps),
    visible: (__VLS_ctx.visible),
    title: (__VLS_ctx.title),
    width: (__VLS_ctx.width),
    maskClosable: (__VLS_ctx.maskClosable),
    escToClose: (__VLS_ctx.escToClose),
    closable: (__VLS_ctx.closable),
    alignCenter: (__VLS_ctx.alignCenter),
    draggable: (__VLS_ctx.draggable),
    fullScreen: (__VLS_ctx.fullScreen),
    mask: (__VLS_ctx.mask),
    simple: (__VLS_ctx.simple),
    hideCancel: (__VLS_ctx.hideCancel),
    hideTitle: (__VLS_ctx.hideTitle),
    footer: (__VLS_ctx.computedFooter),
    okText: (__VLS_ctx.okText),
    cancelText: (__VLS_ctx.cancelText),
    okLoading: (__VLS_ctx.okLoading),
    okButtonProps: (__VLS_ctx.okButtonProps),
    cancelButtonProps: (__VLS_ctx.cancelButtonProps),
    bodyStyle: (__VLS_ctx.bodyStyle),
    modalClass: (__VLS_ctx.modalClass),
    modalStyle: (__VLS_ctx.modalStyle),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    ...{ 'onOpen': {} },
    ...{ 'onClose': {} },
    ...{ 'onBeforeOk': {} },
    ...{ 'onBeforeCancel': {} },
    ...(__VLS_ctx.modalProps),
    visible: (__VLS_ctx.visible),
    title: (__VLS_ctx.title),
    width: (__VLS_ctx.width),
    maskClosable: (__VLS_ctx.maskClosable),
    escToClose: (__VLS_ctx.escToClose),
    closable: (__VLS_ctx.closable),
    alignCenter: (__VLS_ctx.alignCenter),
    draggable: (__VLS_ctx.draggable),
    fullScreen: (__VLS_ctx.fullScreen),
    mask: (__VLS_ctx.mask),
    simple: (__VLS_ctx.simple),
    hideCancel: (__VLS_ctx.hideCancel),
    hideTitle: (__VLS_ctx.hideTitle),
    footer: (__VLS_ctx.computedFooter),
    okText: (__VLS_ctx.okText),
    cancelText: (__VLS_ctx.cancelText),
    okLoading: (__VLS_ctx.okLoading),
    okButtonProps: (__VLS_ctx.okButtonProps),
    cancelButtonProps: (__VLS_ctx.cancelButtonProps),
    bodyStyle: (__VLS_ctx.bodyStyle),
    modalClass: (__VLS_ctx.modalClass),
    modalStyle: (__VLS_ctx.modalStyle),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onOk: (__VLS_ctx.handleOk)
};
const __VLS_8 = {
    onCancel: (__VLS_ctx.handleCancel)
};
const __VLS_9 = {
    onOpen: (__VLS_ctx.handleOpen)
};
const __VLS_10 = {
    onClose: (__VLS_ctx.handleClose)
};
const __VLS_11 = {
    onBeforeOk: (__VLS_ctx.handleBeforeOk)
};
const __VLS_12 = {
    onBeforeCancel: (__VLS_ctx.handleBeforeCancel)
};
var __VLS_13 = {};
__VLS_3.slots.default;
if (__VLS_ctx.$slots.title) {
    {
        const { title: __VLS_thisSlot } = __VLS_3.slots;
        var __VLS_14 = {};
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-content" },
});
if (__VLS_ctx.description) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-description" },
    });
    (__VLS_ctx.description);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-body" },
});
var __VLS_16 = {};
if (__VLS_ctx.formItems && __VLS_ctx.formItems.length > 0) {
    const __VLS_18 = {}.BaseForm;
    /** @type {[typeof __VLS_components.BaseForm, typeof __VLS_components.BaseForm, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
        ...{ 'onSubmit': {} },
        ref: "formRef",
        modelValue: (__VLS_ctx.formData),
        formItems: (__VLS_ctx.formItems),
        rules: (__VLS_ctx.formRules),
        layout: (__VLS_ctx.formLayout),
        size: (__VLS_ctx.formSize),
        labelColProps: (__VLS_ctx.formLabelColProps),
        wrapperColProps: (__VLS_ctx.formWrapperColProps),
        labelAlign: (__VLS_ctx.formLabelAlign),
        disabled: (__VLS_ctx.formDisabled),
        showActions: (false),
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onSubmit': {} },
        ref: "formRef",
        modelValue: (__VLS_ctx.formData),
        formItems: (__VLS_ctx.formItems),
        rules: (__VLS_ctx.formRules),
        layout: (__VLS_ctx.formLayout),
        size: (__VLS_ctx.formSize),
        labelColProps: (__VLS_ctx.formLabelColProps),
        wrapperColProps: (__VLS_ctx.formWrapperColProps),
        labelAlign: (__VLS_ctx.formLabelAlign),
        disabled: (__VLS_ctx.formDisabled),
        showActions: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_22;
    let __VLS_23;
    let __VLS_24;
    const __VLS_25 = {
        onSubmit: (__VLS_ctx.handleFormSubmit)
    };
    /** @type {typeof __VLS_ctx.formRef} */ ;
    var __VLS_26 = {};
    __VLS_21.slots.default;
    for (const [_, name] of __VLS_getVForSourceType((__VLS_ctx.formSlots))) {
        {
            const { [__VLS_tryAsConstant(name)]: __VLS_thisSlot } = __VLS_21.slots;
            const [slotData] = __VLS_getSlotParams(__VLS_thisSlot);
            var __VLS_28 = {
                ...(slotData),
            };
            var __VLS_29 = __VLS_tryAsConstant(name);
        }
    }
    var __VLS_21;
}
if (__VLS_ctx.$slots.footer) {
    {
        const { footer: __VLS_thisSlot } = __VLS_3.slots;
        var __VLS_32 = {
            ok: (__VLS_ctx.handleOk),
            cancel: (__VLS_ctx.handleCancel),
        };
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-description']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
// @ts-ignore
var __VLS_15 = __VLS_14, __VLS_17 = __VLS_16, __VLS_27 = __VLS_26, __VLS_30 = __VLS_29, __VLS_31 = __VLS_28, __VLS_33 = __VLS_32;
var __VLS_dollars;
let __VLS_self;
