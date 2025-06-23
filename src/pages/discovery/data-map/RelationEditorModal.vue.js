/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, watch } from 'vue';
import { Modal } from '@arco-design/web-vue';
const props = defineProps();
const emit = defineEmits(['update:visible', 'save-relations']);
const isVisible = ref(props.visible);
const modalTitle = ref(`编辑字段 '${props.fieldName}' 的关联关系`);
const form = ref({ targetTable: '', relationField: '', relationType: '', relationDescription: '' });
const existingRelations = ref([...props.initialRelations]);
const editingIndex = ref(null);
watch(() => props.visible, (newVal) => {
    isVisible.value = newVal;
    if (newVal) {
        // Reset form and load initial relations when modal opens
        resetForm();
        existingRelations.value = [...props.initialRelations];
        modalTitle.value = `编辑字段 '${props.fieldName}' 的关联关系`;
    }
});
watch(() => props.fieldName, (newVal) => {
    modalTitle.value = `编辑字段 '${newVal}' 的关联关系`;
});
const resetForm = () => {
    form.value = { targetTable: '', relationField: '', relationType: '', relationDescription: '' };
    editingIndex.value = null;
};
const handleCancel = () => {
    isVisible.value = false;
    emit('update:visible', false);
    resetForm();
};
const handleBeforeOk = (done) => {
    // Basic validation
    if (!form.value.targetTable || !form.value.relationField) {
        Modal.warning({
            title: '验证失败',
            content: '关联表名和关联字段不能为空。'
        });
        done(false);
        return;
    }
    if (editingIndex.value !== null) {
        // Update existing relation
        existingRelations.value[editingIndex.value] = { ...form.value };
    }
    else {
        // Add new relation
        existingRelations.value.push({ ...form.value });
    }
    emit('save-relations', existingRelations.value);
    isVisible.value = false;
    emit('update:visible', false);
    resetForm();
    done(true);
};
const editRelation = (record, index) => {
    form.value = { ...record };
    editingIndex.value = index;
};
const deleteRelation = (index) => {
    existingRelations.value.splice(index, 1);
    emit('save-relations', existingRelations.value);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onCancel': {} },
    ...{ 'onBeforeOk': {} },
    visible: (__VLS_ctx.isVisible),
    title: (__VLS_ctx.modalTitle),
    width: "600px",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onCancel': {} },
    ...{ 'onBeforeOk': {} },
    visible: (__VLS_ctx.isVisible),
    title: (__VLS_ctx.modalTitle),
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onCancel: (__VLS_ctx.handleCancel)
};
const __VLS_8 = {
    onBeforeOk: (__VLS_ctx.handleBeforeOk)
};
var __VLS_9 = {};
__VLS_3.slots.default;
const __VLS_10 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    model: (__VLS_ctx.form),
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}));
const __VLS_12 = __VLS_11({
    model: (__VLS_ctx.form),
    labelColProps: ({ span: 6 }),
    wrapperColProps: ({ span: 18 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_13.slots.default;
const __VLS_14 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    field: "targetTable",
    label: "关联表名",
    validateTrigger: "blur",
    required: true,
}));
const __VLS_16 = __VLS_15({
    field: "targetTable",
    label: "关联表名",
    validateTrigger: "blur",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
const __VLS_18 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.form.targetTable),
    placeholder: "请输入关联表名",
}));
const __VLS_20 = __VLS_19({
    modelValue: (__VLS_ctx.form.targetTable),
    placeholder: "请输入关联表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
var __VLS_17;
const __VLS_22 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    field: "relationField",
    label: "关联字段",
    validateTrigger: "blur",
    required: true,
}));
const __VLS_24 = __VLS_23({
    field: "relationField",
    label: "关联字段",
    validateTrigger: "blur",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_25.slots.default;
const __VLS_26 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    modelValue: (__VLS_ctx.form.relationField),
    placeholder: "请输入关联字段名",
}));
const __VLS_28 = __VLS_27({
    modelValue: (__VLS_ctx.form.relationField),
    placeholder: "请输入关联字段名",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
var __VLS_25;
const __VLS_30 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    field: "relationType",
    label: "关联类型",
}));
const __VLS_32 = __VLS_31({
    field: "relationType",
    label: "关联类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
const __VLS_34 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.form.relationType),
    placeholder: "请选择关联类型",
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.form.relationType),
    placeholder: "请选择关联类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
const __VLS_38 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    value: "字段关联",
}));
const __VLS_40 = __VLS_39({
    value: "字段关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
var __VLS_41;
const __VLS_42 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    value: "维度-事实关联",
}));
const __VLS_44 = __VLS_43({
    value: "维度-事实关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
__VLS_45.slots.default;
var __VLS_45;
const __VLS_46 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    value: "事实-维度关联",
}));
const __VLS_48 = __VLS_47({
    value: "事实-维度关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
var __VLS_49;
const __VLS_50 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    value: "维度-汇总关联",
}));
const __VLS_52 = __VLS_51({
    value: "维度-汇总关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
var __VLS_53;
const __VLS_54 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    value: "汇总-维度关联",
}));
const __VLS_56 = __VLS_55({
    value: "汇总-维度关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_57.slots.default;
var __VLS_57;
var __VLS_37;
var __VLS_33;
const __VLS_58 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    field: "relationDescription",
    label: "关联说明",
}));
const __VLS_60 = __VLS_59({
    field: "relationDescription",
    label: "关联说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_61.slots.default;
const __VLS_62 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    modelValue: (__VLS_ctx.form.relationDescription),
    placeholder: "请输入关联说明",
}));
const __VLS_64 = __VLS_63({
    modelValue: (__VLS_ctx.form.relationDescription),
    placeholder: "请输入关联说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
var __VLS_61;
var __VLS_13;
const __VLS_66 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    orientation: "left",
}));
const __VLS_68 = __VLS_67({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
var __VLS_69;
const __VLS_70 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    data: (__VLS_ctx.existingRelations),
    bordered: (false),
    pagination: (false),
}));
const __VLS_72 = __VLS_71({
    data: (__VLS_ctx.existingRelations),
    bordered: (false),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
__VLS_73.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_73.slots;
    const __VLS_74 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        title: "关联表",
        dataIndex: "targetTable",
    }));
    const __VLS_76 = __VLS_75({
        title: "关联表",
        dataIndex: "targetTable",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const __VLS_78 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        title: "关联字段",
        dataIndex: "relationField",
    }));
    const __VLS_80 = __VLS_79({
        title: "关联字段",
        dataIndex: "relationField",
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    const __VLS_82 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        title: "关联类型",
        dataIndex: "relationType",
    }));
    const __VLS_84 = __VLS_83({
        title: "关联类型",
        dataIndex: "relationType",
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    const __VLS_86 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        title: "操作",
    }));
    const __VLS_88 = __VLS_87({
        title: "操作",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_89.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_89.slots;
        const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_90 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
        const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
        __VLS_93.slots.default;
        const __VLS_94 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_96 = __VLS_95({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_95));
        let __VLS_98;
        let __VLS_99;
        let __VLS_100;
        const __VLS_101 = {
            onClick: (...[$event]) => {
                __VLS_ctx.editRelation(record, rowIndex);
            }
        };
        __VLS_97.slots.default;
        var __VLS_97;
        const __VLS_102 = {}.APopconfirm;
        /** @type {[typeof __VLS_components.APopconfirm, typeof __VLS_components.aPopconfirm, typeof __VLS_components.APopconfirm, typeof __VLS_components.aPopconfirm, ]} */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            ...{ 'onOk': {} },
            content: "确定删除此关联关系吗?",
        }));
        const __VLS_104 = __VLS_103({
            ...{ 'onOk': {} },
            content: "确定删除此关联关系吗?",
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        let __VLS_106;
        let __VLS_107;
        let __VLS_108;
        const __VLS_109 = {
            onOk: (...[$event]) => {
                __VLS_ctx.deleteRelation(rowIndex);
            }
        };
        __VLS_105.slots.default;
        const __VLS_110 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
            type: "text",
            size: "mini",
            status: "danger",
        }));
        const __VLS_112 = __VLS_111({
            type: "text",
            size: "mini",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_111));
        __VLS_113.slots.default;
        var __VLS_113;
        var __VLS_105;
        var __VLS_93;
    }
    var __VLS_89;
}
var __VLS_73;
var __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isVisible: isVisible,
            modalTitle: modalTitle,
            form: form,
            existingRelations: existingRelations,
            handleCancel: handleCancel,
            handleBeforeOk: handleBeforeOk,
            editRelation: editRelation,
            deleteRelation: deleteRelation,
        };
    },
    emits: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
