/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, watch } from 'vue';
import { Modal } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
const props = defineProps();
const emit = defineEmits(['save-relations']);
const relations = ref([]); // State to hold the list of relations
const availableTables = ref([]); // Assuming you have a list of all available tables
// State for the Add/Edit modal
const editModalVisible = ref(false);
const isEditing = ref(false);
const currentRelationForm = reactive({
    targetTable: '',
    relationField: '',
    relationType: '',
    relationDescription: ''
});
const editingIndex = ref(null); // Index of the relation being edited
// Watch for initial relations prop changes and initialize the relations state
watch(() => props.initialRelations, (newVal) => {
    relations.value = [...newVal]; // Initialize relations with prop data
}, { immediate: true, deep: true });
// Mock data for available tables (replace with actual data fetching)
// For now, let's use a simple mock list
availableTables.value = [
    { name: 'dim_user', type: 'dimension', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
    { name: 'fact_loan_apply', type: 'fact', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
    { name: 'dws_risk_score', type: 'dws', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
    { name: 'dwd_fraud_alert', type: 'dwd', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
    { name: 'dim_product', type: 'dimension', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
];
// --- Modal Actions ---
const addRelation = () => {
    isEditing.value = false;
    editingIndex.value = null;
    // Reset form
    currentRelationForm.targetTable = '';
    currentRelationForm.relationField = props.fieldName; // Default to current field name
    currentRelationForm.relationType = '';
    currentRelationForm.relationDescription = '';
    editModalVisible.value = true;
};
const editRelation = (record, index) => {
    isEditing.value = true;
    editingIndex.value = index;
    // Populate form with record data
    currentRelationForm.targetTable = record.targetTable;
    currentRelationForm.relationField = record.relationField;
    currentRelationForm.relationType = record.relationType || '';
    currentRelationForm.relationDescription = record.relationDescription || '';
    editModalVisible.value = true;
};
const deleteRelation = (index) => {
    Modal.confirm({
        title: '确认删除',
        content: '确定要删除这条关联关系吗？',
        onOk: () => {
            relations.value.splice(index, 1);
            emit('save-relations', relations.value);
        }
    });
};
const handleEditModalOk = () => {
    // Basic validation (add more robust validation as needed)
    if (!currentRelationForm.targetTable || !currentRelationForm.relationField) {
        // Show error message
        return;
    }
    if (isEditing.value && editingIndex.value !== null) {
        // Update existing relation
        relations.value[editingIndex.value] = { ...currentRelationForm };
    }
    else {
        // Add new relation
        relations.value.push({ ...currentRelationForm });
    }
    emit('save-relations', relations.value);
    editModalVisible.value = false;
};
const handleEditModalCancel = () => {
    editModalVisible.value = false;
};
// --- Panel Actions ---
// (In Vue 3 setup script, everything declared here is automatically exposed)
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "relation-editor-panel" },
});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    direction: "vertical",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    direction: "vertical",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    type: "primary",
    size: "mini",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    type: "primary",
    size: "mini",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.addRelation)
};
__VLS_7.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_7;
const __VLS_16 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    data: (__VLS_ctx.relations),
    bordered: (false),
    pagination: (false),
}));
const __VLS_18 = __VLS_17({
    data: (__VLS_ctx.relations),
    bordered: (false),
    pagination: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_20 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "关联表",
        dataIndex: "targetTable",
    }));
    const __VLS_22 = __VLS_21({
        title: "关联表",
        dataIndex: "targetTable",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_24 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: "关联字段",
        dataIndex: "relationField",
    }));
    const __VLS_26 = __VLS_25({
        title: "关联字段",
        dataIndex: "relationField",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const __VLS_28 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: "关联类型",
        dataIndex: "relationType",
    }));
    const __VLS_30 = __VLS_29({
        title: "关联类型",
        dataIndex: "relationType",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_32 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: "关联说明",
        dataIndex: "relationDescription",
    }));
    const __VLS_34 = __VLS_33({
        title: "关联说明",
        dataIndex: "relationDescription",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const __VLS_36 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        title: "操作",
    }));
    const __VLS_38 = __VLS_37({
        title: "操作",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_39.slots;
        const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_40 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        const __VLS_44 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_48;
        let __VLS_49;
        let __VLS_50;
        const __VLS_51 = {
            onClick: (...[$event]) => {
                __VLS_ctx.editRelation(record, rowIndex);
            }
        };
        __VLS_47.slots.default;
        var __VLS_47;
        const __VLS_52 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            status: "danger",
        }));
        const __VLS_54 = __VLS_53({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        let __VLS_56;
        let __VLS_57;
        let __VLS_58;
        const __VLS_59 = {
            onClick: (...[$event]) => {
                __VLS_ctx.deleteRelation(rowIndex);
            }
        };
        __VLS_55.slots.default;
        var __VLS_55;
        var __VLS_43;
    }
    var __VLS_39;
}
var __VLS_19;
var __VLS_3;
const __VLS_60 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.editModalVisible),
    title: (__VLS_ctx.isEditing ? '编辑关联关系' : '新增关联关系'),
}));
const __VLS_62 = __VLS_61({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.editModalVisible),
    title: (__VLS_ctx.isEditing ? '编辑关联关系' : '新增关联关系'),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onOk: (__VLS_ctx.handleEditModalOk)
};
const __VLS_68 = {
    onCancel: (__VLS_ctx.handleEditModalCancel)
};
__VLS_63.slots.default;
const __VLS_69 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    model: (__VLS_ctx.currentRelationForm),
    layout: "vertical",
}));
const __VLS_71 = __VLS_70({
    model: (__VLS_ctx.currentRelationForm),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
const __VLS_73 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    label: "关联表",
    field: "targetTable",
    required: true,
}));
const __VLS_75 = __VLS_74({
    label: "关联表",
    field: "targetTable",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
const __VLS_77 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    modelValue: (__VLS_ctx.currentRelationForm.targetTable),
    placeholder: "请选择关联表",
    allowSearch: true,
    disabled: (__VLS_ctx.isEditing),
}));
const __VLS_79 = __VLS_78({
    modelValue: (__VLS_ctx.currentRelationForm.targetTable),
    placeholder: "请选择关联表",
    allowSearch: true,
    disabled: (__VLS_ctx.isEditing),
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
for (const [table] of __VLS_getVForSourceType((__VLS_ctx.availableTables))) {
    const __VLS_81 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        key: (table.name),
        value: (table.name),
    }));
    const __VLS_83 = __VLS_82({
        key: (table.name),
        value: (table.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    __VLS_84.slots.default;
    (table.name);
    var __VLS_84;
}
var __VLS_80;
var __VLS_76;
const __VLS_85 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    label: "关联字段",
    field: "relationField",
    required: true,
}));
const __VLS_87 = __VLS_86({
    label: "关联字段",
    field: "relationField",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
const __VLS_89 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    modelValue: (__VLS_ctx.currentRelationForm.relationField),
    placeholder: "请输入关联字段",
}));
const __VLS_91 = __VLS_90({
    modelValue: (__VLS_ctx.currentRelationForm.relationField),
    placeholder: "请输入关联字段",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
var __VLS_88;
const __VLS_93 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    label: "关联类型",
    field: "relationType",
}));
const __VLS_95 = __VLS_94({
    label: "关联类型",
    field: "relationType",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
const __VLS_97 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    modelValue: (__VLS_ctx.currentRelationForm.relationType),
    placeholder: "请选择关联类型",
}));
const __VLS_99 = __VLS_98({
    modelValue: (__VLS_ctx.currentRelationForm.relationType),
    placeholder: "请选择关联类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
const __VLS_101 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    value: "主表关联",
}));
const __VLS_103 = __VLS_102({
    value: "主表关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
__VLS_104.slots.default;
var __VLS_104;
const __VLS_105 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    value: "维度-事实关联",
}));
const __VLS_107 = __VLS_106({
    value: "维度-事实关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_108.slots.default;
var __VLS_108;
const __VLS_109 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    value: "维度-汇总关联",
}));
const __VLS_111 = __VLS_110({
    value: "维度-汇总关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
__VLS_112.slots.default;
var __VLS_112;
const __VLS_113 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    value: "字段关联",
}));
const __VLS_115 = __VLS_114({
    value: "字段关联",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
__VLS_116.slots.default;
var __VLS_116;
var __VLS_100;
var __VLS_96;
const __VLS_117 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    label: "关联说明",
    field: "relationDescription",
}));
const __VLS_119 = __VLS_118({
    label: "关联说明",
    field: "relationDescription",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
__VLS_120.slots.default;
const __VLS_121 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    modelValue: (__VLS_ctx.currentRelationForm.relationDescription),
    placeholder: "请输入关联说明",
    autoSize: ({ minRows: 2, maxRows: 4 }),
}));
const __VLS_123 = __VLS_122({
    modelValue: (__VLS_ctx.currentRelationForm.relationDescription),
    placeholder: "请输入关联说明",
    autoSize: ({ minRows: 2, maxRows: 4 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
var __VLS_120;
var __VLS_72;
var __VLS_63;
/** @type {__VLS_StyleScopedClasses['relation-editor-panel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            relations: relations,
            availableTables: availableTables,
            editModalVisible: editModalVisible,
            isEditing: isEditing,
            currentRelationForm: currentRelationForm,
            addRelation: addRelation,
            editRelation: editRelation,
            deleteRelation: deleteRelation,
            handleEditModalOk: handleEditModalOk,
            handleEditModalCancel: handleEditModalCancel,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
