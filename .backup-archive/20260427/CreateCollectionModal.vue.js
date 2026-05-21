import { ref, computed, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { tableMockData } from '@/mock/tableData';
const props = defineProps();
const emit = defineEmits();
const formRef = ref();
const searchKeyword = ref('');
const selectedKeys = ref([]);
const formData = ref({
    name: '',
    description: '',
    type: '通用',
    owner: '当前用户',
    tables: []
});
// 编辑模式判断
const isEditMode = computed(() => !!props.editData);
const rules = {
    name: [
        { required: true, message: '请输入集合名称' },
        { minLength: 2, message: '集合名称至少2个字符' },
        { maxLength: 50, message: '集合名称不能超过50个字符' }
    ],
    type: [
        { required: true, message: '请选择集合类型' }
    ],
    owner: [
        { required: true, message: '请选择负责人' }
    ]
};
// 模拟表数据
const mockTransferData = computed(() => {
    return tableMockData.map((table, index) => ({
        key: `table_${index}`,
        name: table.name,
        type: table.type,
        category: table.category,
        domain: table.domain,
        updateFrequency: table.updateFrequency,
        owner: table.owner,
        description: table.description,
        fields: table.fields
    }));
});
// 过滤后的表数据
const filteredTables = computed(() => {
    if (!searchKeyword.value) {
        return mockTransferData.value;
    }
    return mockTransferData.value.filter(table => table.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        table.description.toLowerCase().includes(searchKeyword.value.toLowerCase()));
});
// 表格列配置
const tableColumns = [
    { title: '表名', dataIndex: 'name', width: 180 },
    { title: '类型', dataIndex: 'type', width: 100 },
    { title: '描述', dataIndex: 'description' }
];
// 行选择配置
const rowSelection = computed(() => ({
    type: 'checkbox',
    selectedRowKeys: selectedKeys.value,
    onSelect: (rowKeys, rowKey, record) => {
        const table = mockTransferData.value.find(t => t.key === rowKey);
        if (table) {
            if (rowKeys.includes(rowKey)) {
                // 添加到已选表
                if (!formData.value.tables.find(t => t.name === table.name)) {
                    formData.value.tables.push(table);
                }
            }
            else {
                // 从已选表中移除
                formData.value.tables = formData.value.tables.filter(t => t.name !== table.name);
            }
        }
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
        if (selected) {
            // 全选
            changeRows.forEach(row => {
                const table = mockTransferData.value.find(t => t.key === row.key);
                if (table && !formData.value.tables.find(t => t.name === table.name)) {
                    formData.value.tables.push(table);
                }
            });
        }
        else {
            // 取消全选
            changeRows.forEach(row => {
                formData.value.tables = formData.value.tables.filter(t => t.name !== row.name);
            });
        }
    }
}));
// 监听已选表变化，同步更新selectedKeys
watch(() => formData.value.tables, (newTables) => {
    selectedKeys.value = newTables.map(table => {
        const item = mockTransferData.value.find(t => t.name === table.name);
        return item?.key || '';
    }).filter(key => key);
}, { deep: true });
// 移除已选表
const removeSelectedTable = (table) => {
    formData.value.tables = formData.value.tables.filter(t => t.name !== table.name);
    const item = mockTransferData.value.find(t => t.name === table.name);
    if (item) {
        selectedKeys.value = selectedKeys.value.filter(key => key !== item.key);
    }
};
// 获取类型颜色
const getTypeColor = (type) => {
    const colors = {
        '维度表': 'blue',
        '事实表': 'green',
        '明细表': 'orange',
        '汇总表': 'purple'
    };
    return type ? colors[type] || 'gray' : 'gray';
};
// 处理创建/编辑集合
const handleCreateCollection = async () => {
    try {
        const valid = await formRef.value?.validate();
        if (!valid)
            return;
        if (formData.value.tables.length === 0) {
            Message.warning('请至少选择一张表');
            return;
        }
        if (isEditMode.value && props.editData) {
            // 编辑模式
            emit('update', {
                ...props.editData,
                name: formData.value.name,
                description: formData.value.description,
                type: formData.value.type,
                owner: formData.value.owner,
                tables: formData.value.tables,
                updateTime: new Date().toISOString()
            });
            Message.success('集合更新成功');
        }
        else {
            // 创建模式
            emit('create', {
                name: formData.value.name,
                description: formData.value.description,
                type: formData.value.type,
                owner: formData.value.owner,
                tables: formData.value.tables,
                updateTime: new Date().toISOString(),
                isFavorite: false
            });
            Message.success('集合创建成功');
        }
        handleCancel();
    }
    catch (error) {
        console.error('表单验证失败:', error);
    }
};
// 处理取消
const handleCancel = () => {
    emit('update:visible', false);
    // 重置表单
    formData.value = {
        name: '',
        description: '',
        type: '通用',
        owner: '当前用户',
        tables: []
    };
    selectedKeys.value = [];
    searchKeyword.value = '';
    formRef.value?.resetFields();
};
// 监听visible变化
watch(() => props.visible, (newVisible) => {
    if (!newVisible) {
        handleCancel();
    }
    else if (newVisible && props.editData) {
        // 编辑模式时填充数据
        formData.value = {
            name: props.editData.name,
            description: props.editData.description || '',
            type: props.editData.type || '通用',
            owner: props.editData.owner || '当前用户',
            tables: [...props.editData.tables]
        };
    }
});
// 监听editData变化
watch(() => props.editData, (newEditData) => {
    if (newEditData && props.visible) {
        formData.value = {
            name: newEditData.name,
            description: newEditData.description || '',
            type: newEditData.type || '通用',
            owner: newEditData.owner || '当前用户',
            tables: [...newEditData.tables]
        };
    }
}, { deep: true });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table-selector']} */ 
/** @type {__VLS_StyleScopedClasses['table-selector']} */ 
/** @type {__VLS_StyleScopedClasses['collection-modal']} */ 
/** @type {__VLS_StyleScopedClasses['collection-modal']} */ 
/** @type {__VLS_StyleScopedClasses['collection-modal']} */ 
/** @type {__VLS_StyleScopedClasses['collection-modal']} */ 
/** @type {__VLS_StyleScopedClasses['collection-modal']} */ 
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ 
/** @type {__VLS_StyleScopedClasses['collection-modal']} */ 
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ 
/** @type {__VLS_StyleScopedClasses['collection-modal']} */ 
/** @type {__VLS_StyleScopedClasses['arco-modal-footer']} */ 
/** @type {__VLS_StyleScopedClasses['arco-btn-primary']} */ 
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    ...{ 'onUpdate:visible': {} },
    visible: (__VLS_ctx.visible),
    title: (__VLS_ctx.isEditMode ? '编辑表集合' : '创建表集合'),
    width: "800px",
    ...{ class: "collection-modal" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    ...{ 'onUpdate:visible': {} },
    visible: (__VLS_ctx.visible),
    title: (__VLS_ctx.isEditMode ? '编辑表集合' : '创建表集合'),
    width: "800px",
    ...{ class: "collection-modal" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onOk: (__VLS_ctx.handleCreateCollection)
};
const __VLS_8 = {
    onCancel: (__VLS_ctx.handleCancel)
};
const __VLS_9 = {
    'onUpdate:visible': (...[$event]) => {
        __VLS_ctx.$emit('update:visible', $event);
    }
};
const __VLS_10 = {};
__VLS_3.slots.default;
const __VLS_11 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    model: (__VLS_ctx.formData),
    ref: "formRef",
    rules: (__VLS_ctx.rules),
    layout: "vertical",
}));
const __VLS_13 = __VLS_12({
    model: (__VLS_ctx.formData),
    ref: "formRef",
    rules: (__VLS_ctx.rules),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
/** @type {typeof __VLS_ctx.formRef} */ 
const __VLS_15 = {};
__VLS_14.slots.default;
const __VLS_17 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    field: "name",
    label: "集合名称",
}));
const __VLS_19 = __VLS_18({
    field: "name",
    label: "集合名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入集合名称，如：贷前分析常用表",
    maxLength: (50),
    showWordLimit: true,
}));
const __VLS_23 = __VLS_22({
    modelValue: (__VLS_ctx.formData.name),
    placeholder: "请输入集合名称，如：贷前分析常用表",
    maxLength: (50),
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_20;
const __VLS_25 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    field: "description",
    label: "集合描述",
}));
const __VLS_27 = __VLS_26({
    field: "description",
    label: "集合描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
const __VLS_29 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入集合描述",
    autoSize: ({ minRows: 2, maxRows: 5 }),
    maxLength: (200),
    showWordLimit: true,
}));
const __VLS_31 = __VLS_30({
    modelValue: (__VLS_ctx.formData.description),
    placeholder: "请输入集合描述",
    autoSize: ({ minRows: 2, maxRows: 5 }),
    maxLength: (200),
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_28;
const __VLS_33 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    field: "type",
    label: "集合类型",
}));
const __VLS_35 = __VLS_34({
    field: "type",
    label: "集合类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
const __VLS_37 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    modelValue: (__VLS_ctx.formData.type),
    placeholder: "请选择集合类型",
}));
const __VLS_39 = __VLS_38({
    modelValue: (__VLS_ctx.formData.type),
    placeholder: "请选择集合类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
const __VLS_41 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    value: "业务流程",
}));
const __VLS_43 = __VLS_42({
    value: "业务流程",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
let __VLS_44;
const __VLS_45 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    value: "数据分析",
}));
const __VLS_47 = __VLS_46({
    value: "数据分析",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
let __VLS_48;
const __VLS_49 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    value: "风险管控",
}));
const __VLS_51 = __VLS_50({
    value: "风险管控",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
let __VLS_52;
const __VLS_53 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    value: "用户画像",
}));
const __VLS_55 = __VLS_54({
    value: "用户画像",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
let __VLS_56;
const __VLS_57 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    value: "营销活动",
}));
const __VLS_59 = __VLS_58({
    value: "营销活动",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
let __VLS_60;
const __VLS_61 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    value: "通用",
}));
const __VLS_63 = __VLS_62({
    value: "通用",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
let __VLS_64;
let __VLS_40;
let __VLS_36;
const __VLS_65 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    field: "owner",
    label: "负责人",
}));
const __VLS_67 = __VLS_66({
    field: "owner",
    label: "负责人",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
const __VLS_69 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请选择负责人",
    allowSearch: true,
}));
const __VLS_71 = __VLS_70({
    modelValue: (__VLS_ctx.formData.owner),
    placeholder: "请选择负责人",
    allowSearch: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
__VLS_72.slots.default;
const __VLS_73 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    value: "张三",
}));
const __VLS_75 = __VLS_74({
    value: "张三",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
__VLS_76.slots.default;
let __VLS_76;
const __VLS_77 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    value: "李四",
}));
const __VLS_79 = __VLS_78({
    value: "李四",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
__VLS_80.slots.default;
let __VLS_80;
const __VLS_81 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    value: "王五",
}));
const __VLS_83 = __VLS_82({
    value: "王五",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
__VLS_84.slots.default;
let __VLS_84;
const __VLS_85 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    value: "赵六",
}));
const __VLS_87 = __VLS_86({
    value: "赵六",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
__VLS_88.slots.default;
let __VLS_88;
const __VLS_89 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    value: "钱七",
}));
const __VLS_91 = __VLS_90({
    value: "钱七",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
let __VLS_92;
const __VLS_93 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    value: "当前用户",
}));
const __VLS_95 = __VLS_94({
    value: "当前用户",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
__VLS_96.slots.default;
let __VLS_96;
let __VLS_72;
let __VLS_68;
const __VLS_97 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    label: "选择表",
}));
const __VLS_99 = __VLS_98({
    label: "选择表",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-selection" },
});
const __VLS_101 = {}.AInputSearch;
/** @type {[typeof __VLS_components.AInputSearch, typeof __VLS_components.aInputSearch, ]} */ 
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索表名或描述",
    ...{ style: {} },
}));
const __VLS_103 = __VLS_102({
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索表名或描述",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
if (__VLS_ctx.formData.tables.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selected-tables" },
    });
    const __VLS_105 = {}.ATypographyTitle;
    /** @type {[typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, ]} */ 
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        heading: (6),
        ...{ style: {} },
    }));
    const __VLS_107 = __VLS_106({
        heading: (6),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    __VLS_108.slots.default;
    (__VLS_ctx.formData.tables.length);
    let __VLS_108;
    const __VLS_109 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        wrap: true,
    }));
    const __VLS_111 = __VLS_110({
        wrap: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_112.slots.default;
    for (const [table] of __VLS_getVForSourceType((__VLS_ctx.formData.tables))) {
        const __VLS_113 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
            ...{ 'onClose': {} },
            key: (table.name),
            closable: true,
            size: "small",
            color: "blue",
        }));
        const __VLS_115 = __VLS_114({
            ...{ 'onClose': {} },
            key: (table.name),
            closable: true,
            size: "small",
            color: "blue",
        }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        let __VLS_117;
        let __VLS_118;
        let __VLS_119;
        const __VLS_120 = {
            onClose: (...[$event]) => {
                if (!(__VLS_ctx.formData.tables.length > 0))
                    return;
                __VLS_ctx.removeSelectedTable(table);
            }
        };
        __VLS_116.slots.default;
        (table.name);
        var __VLS_116;
    }
    let __VLS_112;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "available-tables" },
    ...{ style: {} },
});
const __VLS_121 = {}.ATypographyTitle;
/** @type {[typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, ]} */ 
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    heading: (6),
    ...{ style: {} },
}));
const __VLS_123 = __VLS_122({
    heading: (6),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
let __VLS_124;
const __VLS_125 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    data: (__VLS_ctx.filteredTables),
    columns: (__VLS_ctx.tableColumns),
    pagination: ({ pageSize: 5, simple: true }),
    rowSelection: (__VLS_ctx.rowSelection),
    rowKey: ('key'),
    size: "small",
    ...{ class: "table-selector" },
    scroll: ({ y: 300 }),
}));
const __VLS_127 = __VLS_126({
    data: (__VLS_ctx.filteredTables),
    columns: (__VLS_ctx.tableColumns),
    pagination: ({ pageSize: 5, simple: true }),
    rowSelection: (__VLS_ctx.rowSelection),
    rowKey: ('key'),
    size: "small",
    ...{ class: "table-selector" },
    scroll: ({ y: 300 }),
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
__VLS_128.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_128.slots;
    const __VLS_129 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        title: "表名",
        dataIndex: "name",
        width: (180),
    }));
    const __VLS_131 = __VLS_130({
        title: "表名",
        dataIndex: "name",
        width: (180),
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    __VLS_132.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_132.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_133 = {}.ATypographyText;
        /** @type {[typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, typeof __VLS_components.ATypographyText, typeof __VLS_components.aTypographyText, ]} */ 
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
            strong: true,
        }));
        const __VLS_135 = __VLS_134({
            strong: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        __VLS_136.slots.default;
        (record.name);
        let __VLS_136;
    }
    let __VLS_132;
    const __VLS_137 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
        title: "类型",
        dataIndex: "type",
        width: (100),
    }));
    const __VLS_139 = __VLS_138({
        title: "类型",
        dataIndex: "type",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    __VLS_140.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_140.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_141 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
            size: "small",
            color: (__VLS_ctx.getTypeColor(record.type)),
        }));
        const __VLS_143 = __VLS_142({
            size: "small",
            color: (__VLS_ctx.getTypeColor(record.type)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        __VLS_144.slots.default;
        (record.type);
        let __VLS_144;
    }
    let __VLS_140;
    const __VLS_145 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
        title: "描述",
        dataIndex: "description",
    }));
    const __VLS_147 = __VLS_146({
        title: "描述",
        dataIndex: "description",
    }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    __VLS_148.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_148.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_149 = {}.ATypographyParagraph;
        /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ 
        // @ts-ignore
        const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
            type: "secondary",
            ellipsis: ({ rows: 1 }),
        }));
        const __VLS_151 = __VLS_150({
            type: "secondary",
            ellipsis: ({ rows: 1 }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_150));
        __VLS_152.slots.default;
        (record.description);
        let __VLS_152;
    }
    let __VLS_148;
}
let __VLS_128;
let __VLS_100;
let __VLS_14;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['collection-modal']} */ 
/** @type {__VLS_StyleScopedClasses['table-selection']} */ 
/** @type {__VLS_StyleScopedClasses['selected-tables']} */ 
/** @type {__VLS_StyleScopedClasses['available-tables']} */ 
/** @type {__VLS_StyleScopedClasses['table-selector']} */ 
// @ts-ignore
const __VLS_16 = __VLS_15;
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formRef: formRef,
            searchKeyword: searchKeyword,
            formData: formData,
            isEditMode: isEditMode,
            rules: rules,
            filteredTables: filteredTables,
            tableColumns: tableColumns,
            rowSelection: rowSelection,
            removeSelectedTable: removeSelectedTable,
            getTypeColor: getTypeColor,
            handleCreateCollection: handleCreateCollection,
            handleCancel: handleCancel,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
 /* PartiallyEnd: #4569/main.vue */
