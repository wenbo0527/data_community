import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconSearch } from '@arco-design/web-vue/es/icon';
// 搜索表单
const searchForm = reactive({
    attributeName: ''
});
// 表格数据
const tableData = ref([]);
const loading = ref(false);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100]
});
// 属性编辑
const editModalVisible = ref(false);
const editForm = ref({
    id: '',
    name: '',
    attributeType: 'numeric',
    dimensionType: 'customer',
    dimensionKey: '',
    createTime: '',
    createUser: '',
    status: 'active',
    description: ''
});
const editIndex = ref(-1);
// 生成模拟数据
const generateAttributeData = (count) => {
    const attributeTypes = ['numeric', 'string'];
    const dimensionTypes = ['customer', 'product-customer'];
    const statuses = ['active', 'inactive'];
    const users = ['张三', '李四', '王五', '赵六', '钱七'];
    return Array.from({ length: count }, (_, index) => ({
        id: `ATTR_${String(index + 1).padStart(3, '0')}`,
        name: `属性${index + 1}`,
        attributeType: attributeTypes[Math.floor(Math.random() * attributeTypes.length)],
        dimensionType: dimensionTypes[Math.floor(Math.random() * dimensionTypes.length)],
        dimensionKey: `dim_key_${index + 1}`,
        createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        createUser: users[Math.floor(Math.random() * users.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        description: `这是属性${index + 1}的描述信息`
    }));
};
// 获取数据
const fetchData = async () => {
    loading.value = true;
    try {
        // 模拟API请求
        setTimeout(() => {
            const data = generateAttributeData(50);
            // 根据搜索条件筛选
            let filteredData = data;
            if (searchForm.attributeName) {
                filteredData = filteredData.filter(item => item.name.includes(searchForm.attributeName) ||
                    item.id.includes(searchForm.attributeName));
            }
            // 更新表格数据和分页信息
            pagination.total = filteredData.length;
            const start = (pagination.current - 1) * pagination.pageSize;
            const end = start + pagination.pageSize;
            tableData.value = filteredData.slice(start, end);
            loading.value = false;
        }, 500);
    }
    catch (error) {
        console.error('获取属性数据失败:', error);
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    pagination.current = 1;
    fetchData();
};
// 重置搜索
const handleReset = () => {
    searchForm.attributeName = '';
    pagination.current = 1;
    fetchData();
};
// 分页变化
const handlePageChange = (page) => {
    pagination.current = page;
    fetchData();
};
const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchData();
};
// 添加属性
const addAttribute = () => {
    editForm.value = {
        id: '',
        name: '',
        attributeType: 'numeric',
        dimensionType: 'customer',
        dimensionKey: '',
        createTime: new Date().toISOString(),
        createUser: '当前用户',
        status: 'active',
        description: ''
    };
    editIndex.value = -1;
    editModalVisible.value = true;
};
// 删除属性
const removeAttribute = (index) => {
    tableData.value.splice(index, 1);
    Message.success('删除成功');
};
// 验证属性ID唯一性
const validateAttributeId = (record, index) => {
    if (!record.id)
        return;
    const duplicateIndex = tableData.value.findIndex((attr, i) => i !== index && attr.id === record.id);
    if (duplicateIndex !== -1) {
        Message.error('属性ID不能重复');
        record.id = '';
    }
};
// 编辑属性 - 进入详情页编辑
const editAttribute = (record) => {
    editForm.value = { ...record };
    editIndex.value = tableData.value.findIndex(item => item.id === record.id);
    editModalVisible.value = true;
};
// 更新属性
const updateAttribute = (record) => {
    Message.info('属性更新功能开发中...');
};
// 保存属性
const saveAttribute = () => {
    if (editIndex.value >= 0) {
        // 编辑现有属性
        tableData.value[editIndex.value] = { ...editForm.value };
        Message.success('属性更新成功');
    }
    else {
        // 新增属性
        const newAttribute = {
            ...editForm.value,
            createTime: new Date().toISOString()
        };
        tableData.value.unshift(newAttribute);
        Message.success('属性创建成功');
    }
    editModalVisible.value = false;
};
// 取消编辑
const cancelEdit = () => {
    editModalVisible.value = false;
    editIndex.value = -1;
};
// 获取状态颜色
const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
};
// 获取状态文本
const getStatusText = (status) => {
    return status === 'active' ? '启用' : '禁用';
};
// 获取属性类型颜色
const getAttributeTypeColor = (type) => {
    const colors = {
        numeric: 'blue',
        string: 'green'
    };
    return colors[type] || 'gray';
};
// 获取属性类型文本
const getAttributeTypeText = (type) => {
    const texts = {
        numeric: '数值型',
        string: '字符型'
    };
    return texts[type] || type;
};
// 获取维度类型颜色
const getDimensionTypeColor = (type) => {
    const colors = {
        customer: 'blue',
        'product-customer': 'green'
    };
    return colors[type] || 'gray';
};
// 获取维度类型文本
const getDimensionTypeText = (type) => {
    const texts = {
        customer: '客户级',
        'product-customer': '产品客户级'
    };
    return texts[type] || type;
};
// 格式化时间
const formatTime = (time) => {
    return new Date(time).toLocaleString('zh-CN');
};
// 初始化
onMounted(() => {
    fetchData();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['attribute-management']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['header-actions']} */ 
/** @type {__VLS_StyleScopedClasses['search-form']} */ 
/** @type {__VLS_StyleScopedClasses['search-form']} */ 
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "attribute-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.ASpace;
/** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchForm.attributeName),
    placeholder: "请输入属性名称搜索",
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchForm.attributeName),
    placeholder: "请输入属性名称搜索",
    allowClear: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onInput: (__VLS_ctx.handleSearch)
};
__VLS_7.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconSearch;
    /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ 
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
let __VLS_7;
const __VLS_16 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.addAttribute)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ 
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
let __VLS_19;
let __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-section" },
});
const __VLS_28 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ class: "table-card" },
}));
const __VLS_30 = __VLS_29({
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_31.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "table-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "table-count" },
    });
    (__VLS_ctx.pagination.total);
}
const __VLS_32 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ 
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    ...{ class: "attribute-table" },
    size: "small",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    ...{ class: "attribute-table" },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_40 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
__VLS_35.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_35.slots;
    const __VLS_41 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        title: "属性名称",
        dataIndex: "name",
        width: (150),
    }));
    const __VLS_43 = __VLS_42({
        title: "属性名称",
        dataIndex: "name",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_44.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.name);
    }
    let __VLS_44;
    const __VLS_45 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        title: "属性ID",
        dataIndex: "id",
        width: (120),
    }));
    const __VLS_47 = __VLS_46({
        title: "属性ID",
        dataIndex: "id",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_48.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.id);
    }
    let __VLS_48;
    const __VLS_49 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        title: "属性类型",
        dataIndex: "attributeType",
        width: (120),
    }));
    const __VLS_51 = __VLS_50({
        title: "属性类型",
        dataIndex: "attributeType",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_52.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_53 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            color: (__VLS_ctx.getAttributeTypeColor(record.attributeType)),
        }));
        const __VLS_55 = __VLS_54({
            color: (__VLS_ctx.getAttributeTypeColor(record.attributeType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        __VLS_56.slots.default;
        (__VLS_ctx.getAttributeTypeText(record.attributeType));
        let __VLS_56;
    }
    let __VLS_52;
    const __VLS_57 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        title: "维度类型",
        dataIndex: "dimensionType",
        width: (120),
    }));
    const __VLS_59 = __VLS_58({
        title: "维度类型",
        dataIndex: "dimensionType",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_60.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_61 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ 
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            color: (__VLS_ctx.getDimensionTypeColor(record.dimensionType)),
        }));
        const __VLS_63 = __VLS_62({
            color: (__VLS_ctx.getDimensionTypeColor(record.dimensionType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        __VLS_64.slots.default;
        (__VLS_ctx.getDimensionTypeText(record.dimensionType));
        let __VLS_64;
    }
    let __VLS_60;
    const __VLS_65 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        title: "维度主键",
        dataIndex: "dimensionKey",
        width: (150),
    }));
    const __VLS_67 = __VLS_66({
        title: "维度主键",
        dataIndex: "dimensionKey",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_68.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.dimensionKey);
    }
    let __VLS_68;
    const __VLS_69 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        title: "创建时间",
        dataIndex: "createTime",
        width: (180),
    }));
    const __VLS_71 = __VLS_70({
        title: "创建时间",
        dataIndex: "createTime",
        width: (180),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_72.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatTime(record.createTime));
    }
    let __VLS_72;
    const __VLS_73 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        title: "创建人",
        dataIndex: "createUser",
        width: (120),
    }));
    const __VLS_75 = __VLS_74({
        title: "创建人",
        dataIndex: "createUser",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_76.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_76.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.createUser);
    }
    let __VLS_76;
    const __VLS_77 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ 
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        title: "操作",
        width: (200),
        fixed: "right",
    }));
    const __VLS_79 = __VLS_78({
        title: "操作",
        width: (200),
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    __VLS_80.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_80.slots;
        const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_81 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ 
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({}));
        const __VLS_83 = __VLS_82({}, ...__VLS_functionalComponentArgsRest(__VLS_82));
        __VLS_84.slots.default;
        const __VLS_85 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_87 = __VLS_86({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        let __VLS_89;
        let __VLS_90;
        let __VLS_91;
        const __VLS_92 = {
            onClick: (...[$event]) => {
                __VLS_ctx.editAttribute(record);
            }
        };
        __VLS_88.slots.default;
        let __VLS_88;
        const __VLS_93 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }));
        const __VLS_95 = __VLS_94({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        let __VLS_97;
        let __VLS_98;
        let __VLS_99;
        const __VLS_100 = {
            onClick: (...[$event]) => {
                __VLS_ctx.updateAttribute(record);
            }
        };
        __VLS_96.slots.default;
        let __VLS_96;
        const __VLS_101 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }));
        const __VLS_103 = __VLS_102({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            status: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        let __VLS_105;
        let __VLS_106;
        let __VLS_107;
        const __VLS_108 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeAttribute(rowIndex);
            }
        };
        __VLS_104.slots.default;
        let __VLS_104;
        let __VLS_84;
    }
    let __VLS_80;
}
let __VLS_35;
let __VLS_31;
const __VLS_109 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.editModalVisible),
    title: (__VLS_ctx.editIndex === -1 ? '新增属性' : '编辑属性'),
    width: "600px",
}));
const __VLS_111 = __VLS_110({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.editModalVisible),
    title: (__VLS_ctx.editIndex === -1 ? '新增属性' : '编辑属性'),
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_113;
let __VLS_114;
let __VLS_115;
const __VLS_116 = {
    onOk: (__VLS_ctx.saveAttribute)
};
const __VLS_117 = {
    onCancel: (__VLS_ctx.cancelEdit)
};
__VLS_112.slots.default;
const __VLS_118 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}));
const __VLS_120 = __VLS_119({
    model: (__VLS_ctx.editForm),
    layout: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
const __VLS_122 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    gutter: (16),
}));
const __VLS_124 = __VLS_123({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
const __VLS_126 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    span: (12),
}));
const __VLS_128 = __VLS_127({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
__VLS_129.slots.default;
const __VLS_130 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
    label: "属性ID",
    required: true,
}));
const __VLS_132 = __VLS_131({
    label: "属性ID",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
__VLS_133.slots.default;
const __VLS_134 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
    modelValue: (__VLS_ctx.editForm.id),
    placeholder: "请输入属性ID",
}));
const __VLS_136 = __VLS_135({
    modelValue: (__VLS_ctx.editForm.id),
    placeholder: "请输入属性ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
let __VLS_133;
let __VLS_129;
const __VLS_138 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    span: (12),
}));
const __VLS_140 = __VLS_139({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
__VLS_141.slots.default;
const __VLS_142 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    label: "属性名称",
    required: true,
}));
const __VLS_144 = __VLS_143({
    label: "属性名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
__VLS_145.slots.default;
const __VLS_146 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    modelValue: (__VLS_ctx.editForm.name),
    placeholder: "请输入属性名称",
}));
const __VLS_148 = __VLS_147({
    modelValue: (__VLS_ctx.editForm.name),
    placeholder: "请输入属性名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
let __VLS_145;
let __VLS_141;
let __VLS_125;
const __VLS_150 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ 
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    gutter: (16),
}));
const __VLS_152 = __VLS_151({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
const __VLS_154 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    span: (12),
}));
const __VLS_156 = __VLS_155({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
const __VLS_158 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    label: "属性类型",
    required: true,
}));
const __VLS_160 = __VLS_159({
    label: "属性类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
const __VLS_162 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    modelValue: (__VLS_ctx.editForm.attributeType),
    placeholder: "请选择属性类型",
}));
const __VLS_164 = __VLS_163({
    modelValue: (__VLS_ctx.editForm.attributeType),
    placeholder: "请选择属性类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_165.slots.default;
const __VLS_166 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
    value: "numeric",
}));
const __VLS_168 = __VLS_167({
    value: "numeric",
}, ...__VLS_functionalComponentArgsRest(__VLS_167));
__VLS_169.slots.default;
let __VLS_169;
const __VLS_170 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
    value: "string",
}));
const __VLS_172 = __VLS_171({
    value: "string",
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
__VLS_173.slots.default;
let __VLS_173;
let __VLS_165;
let __VLS_161;
let __VLS_157;
const __VLS_174 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ 
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    span: (12),
}));
const __VLS_176 = __VLS_175({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
__VLS_177.slots.default;
const __VLS_178 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
    label: "维度类型",
    required: true,
}));
const __VLS_180 = __VLS_179({
    label: "维度类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
__VLS_181.slots.default;
const __VLS_182 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ 
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
    modelValue: (__VLS_ctx.editForm.dimensionType),
    placeholder: "请选择维度类型",
}));
const __VLS_184 = __VLS_183({
    modelValue: (__VLS_ctx.editForm.dimensionType),
    placeholder: "请选择维度类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
__VLS_185.slots.default;
const __VLS_186 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
    value: "customer",
}));
const __VLS_188 = __VLS_187({
    value: "customer",
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
__VLS_189.slots.default;
let __VLS_189;
const __VLS_190 = {}.AOption;
/** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ 
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
    value: "product-customer",
}));
const __VLS_192 = __VLS_191({
    value: "product-customer",
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
__VLS_193.slots.default;
let __VLS_193;
let __VLS_185;
let __VLS_181;
let __VLS_177;
let __VLS_153;
const __VLS_194 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
    label: "维度主键",
    required: true,
}));
const __VLS_196 = __VLS_195({
    label: "维度主键",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
__VLS_197.slots.default;
const __VLS_198 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
    modelValue: (__VLS_ctx.editForm.dimensionKey),
    placeholder: "请输入维度主键",
}));
const __VLS_200 = __VLS_199({
    modelValue: (__VLS_ctx.editForm.dimensionKey),
    placeholder: "请输入维度主键",
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
let __VLS_197;
const __VLS_202 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
    label: "创建人",
}));
const __VLS_204 = __VLS_203({
    label: "创建人",
}, ...__VLS_functionalComponentArgsRest(__VLS_203));
__VLS_205.slots.default;
const __VLS_206 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
    modelValue: (__VLS_ctx.editForm.createUser),
    placeholder: "请输入创建人",
}));
const __VLS_208 = __VLS_207({
    modelValue: (__VLS_ctx.editForm.createUser),
    placeholder: "请输入创建人",
}, ...__VLS_functionalComponentArgsRest(__VLS_207));
let __VLS_205;
const __VLS_210 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
    label: "描述",
}));
const __VLS_212 = __VLS_211({
    label: "描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_211));
__VLS_213.slots.default;
const __VLS_214 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入属性描述",
    rows: (3),
}));
const __VLS_216 = __VLS_215({
    modelValue: (__VLS_ctx.editForm.description),
    placeholder: "请输入属性描述",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_215));
let __VLS_213;
let __VLS_121;
let __VLS_112;
/** @type {__VLS_StyleScopedClasses['attribute-management']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['header-content']} */ 
/** @type {__VLS_StyleScopedClasses['page-title']} */ 
/** @type {__VLS_StyleScopedClasses['page-description']} */ 
/** @type {__VLS_StyleScopedClasses['header-actions']} */ 
/** @type {__VLS_StyleScopedClasses['content-section']} */ 
/** @type {__VLS_StyleScopedClasses['table-card']} */ 
/** @type {__VLS_StyleScopedClasses['table-header']} */ 
/** @type {__VLS_StyleScopedClasses['table-title']} */ 
/** @type {__VLS_StyleScopedClasses['table-count']} */ 
/** @type {__VLS_StyleScopedClasses['attribute-table']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconPlus: IconPlus,
            IconSearch: IconSearch,
            searchForm: searchForm,
            tableData: tableData,
            loading: loading,
            pagination: pagination,
            editModalVisible: editModalVisible,
            editForm: editForm,
            editIndex: editIndex,
            handleSearch: handleSearch,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
            addAttribute: addAttribute,
            removeAttribute: removeAttribute,
            editAttribute: editAttribute,
            updateAttribute: updateAttribute,
            saveAttribute: saveAttribute,
            cancelEdit: cancelEdit,
            getAttributeTypeColor: getAttributeTypeColor,
            getAttributeTypeText: getAttributeTypeText,
            getDimensionTypeColor: getDimensionTypeColor,
            getDimensionTypeText: getDimensionTypeText,
            formatTime: formatTime,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
