import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import { IconSearch, IconPlus, IconEdit, IconDelete, IconArrowLeft, IconSave, IconPlayArrow, IconMore, IconBarChart } from '@arco-design/web-vue/es/icon';
import { generateEventData } from '@/mock/event';
// 页面状态
const showCreateForm = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const sampling = ref(false);
// 路由实例
const router = useRouter();
// 事件类型选项
const eventTypes = ['系统事件', '业务事件', '用户事件', '营销事件', '风控事件'];
// 状态选项
const statusOptions = ['上线', '下线'];
// 来源系统选项
const sourceSystems = ['用户中心', '订单系统', '支付系统', '营销系统', '风控系统', '数据平台'];
// 负责人选项
const owners = [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' },
    { id: '4', name: '赵六' },
    { id: '5', name: '系统管理员' }
];
// Topic选项
const topics = [
    'user-behavior-topic',
    'order-event-topic',
    'payment-event-topic',
    'marketing-event-topic',
    'risk-event-topic'
];
// 搜索表单
const searchForm = reactive({
    eventName: '',
    eventType: '',
    status: ''
});
// 表格数据
const tableData = ref([]);
const loading = ref(false);
// 分页配置
const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 15,
    showTotal: true,
    showJumper: true,
    pageSizeOptions: [10, 20, 50, 100],
    showPageSize: true
});
// 事件表单
const eventForm = reactive({
    eventName: '',
    sourceSystem: '',
    owner: '',
    collectionType: 'realtime',
    samplingRate: 10
});
// 数据源表单
const dataSourceForm = reactive({
    dataSourceType: 'kafka',
    topic: ''
});
const attributes = ref([
    {
        id: 'KE82KD',
        displayName: '客户姓名',
        dataType: 'string',
        relationId: 'UID',
        isUniqueId: true,
        isEventTime: false,
        isEnum: false
    },
    {
        id: 'phone',
        displayName: '联系电话',
        dataType: 'number',
        relationId: 'CUSTID',
        isUniqueId: true,
        isEventTime: false,
        isEnum: false
    },
    {
        id: 'gender',
        displayName: '性别',
        dataType: 'number',
        relationId: '',
        isUniqueId: false,
        isEventTime: false,
        isEnum: true,
        enumDict: [
            { value: '1', label: '男' },
            { value: '2', label: '女' }
        ]
    }
]);
// 表单验证规则
const eventRules = {
    eventName: [
        { required: true, message: '请输入事件名称' },
        { minLength: 2, maxLength: 50, message: '事件名称长度为2-50个字符' }
    ],
    sourceSystem: [
        { required: true, message: '请选择来源系统' }
    ],
    owner: [
        { required: true, message: '请选择事件负责人' }
    ],
    collectionType: [
        { required: true, message: '请选择获取方式' }
    ]
};
const eventFormRef = ref();
// 枚举字典编辑
const enumModalVisible = ref(false);
const currentEnumAttribute = ref(null);
const enumItems = ref([]);
// 获取数据
const fetchData = async () => {
    loading.value = true;
    try {
        // 模拟API请求
        setTimeout(() => {
            const data = generateEventData(50);
            // 根据搜索条件筛选
            let filteredData = data;
            if (searchForm.eventName) {
                filteredData = filteredData.filter(item => item.eventName.includes(searchForm.eventName));
            }
            if (searchForm.eventType) {
                filteredData = filteredData.filter(item => item.eventType === searchForm.eventType);
            }
            if (searchForm.status) {
                filteredData = filteredData.filter(item => item.status === searchForm.status);
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
        console.error('获取事件数据失败:', error);
        loading.value = false;
        Message.error('获取事件数据失败');
    }
};
// 页码变化
const onPageChange = (page) => {
    pagination.current = page;
    fetchData();
};
// 每页条数变化
const onPageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    fetchData();
};
// 查询
const handleSearch = () => {
    pagination.current = 1;
    fetchData();
};
// 重置查询条件
const resetSearch = () => {
    searchForm.eventName = '';
    pagination.current = 1;
    fetchData();
};
// 显示新建事件页面
const showCreateEvent = () => {
    showCreateForm.value = true;
    isEdit.value = false;
    resetEventForm();
};
// 取消新建/编辑
const cancelCreate = () => {
    showCreateForm.value = false;
    isEdit.value = false;
    resetEventForm();
};
// 重置事件表单
const resetEventForm = () => {
    eventForm.eventName = '';
    eventForm.sourceSystem = '';
    eventForm.owner = '';
    eventForm.collectionType = 'realtime';
    eventForm.samplingRate = 10;
    dataSourceForm.dataSourceType = 'kafka';
    dataSourceForm.topic = '';
    attributes.value = [
        {
            id: 'KE82KD',
            displayName: '客户姓名',
            dataType: 'string',
            relationId: 'UID',
            isUniqueId: true,
            isEventTime: false,
            isEnum: false
        },
        {
            id: 'phone',
            displayName: '联系电话',
            dataType: 'number',
            relationId: 'CUSTID',
            isUniqueId: true,
            isEventTime: false,
            isEnum: false
        },
        {
            id: 'gender',
            displayName: '性别',
            dataType: 'number',
            relationId: '',
            isUniqueId: false,
            isEventTime: false,
            isEnum: true,
            enumDict: [
                { value: '1', label: '男' },
                { value: '2', label: '女' }
            ]
        }
    ];
};
// 保存事件
const saveEvent = async () => {
    try {
        const valid = await eventFormRef.value?.validate();
        if (!valid) {
            saving.value = true;
            // 验证属性配置
            if (attributes.value.length === 0) {
                Message.error('请至少添加一个属性');
                saving.value = false;
                return;
            }
            // 检查是否有用户唯一标识
            const hasUniqueId = attributes.value.some(attr => attr.isUniqueId);
            if (!hasUniqueId) {
                Message.warning('建议至少设置一个用户唯一标识属性');
            }
            // 检查是否有事件时间
            const hasEventTime = attributes.value.some(attr => attr.isEventTime);
            if (!hasEventTime) {
                Message.warning('建议设置一个事件产生时间属性');
            }
            // 模拟保存API调用
            setTimeout(() => {
                Message.success(isEdit.value ? '事件更新成功' : '事件创建成功');
                saving.value = false;
                showCreateForm.value = false;
                fetchData();
            }, 1000);
        }
    }
    catch (error) {
        console.error('表单验证失败:', error);
        saving.value = false;
    }
};
// 触发采样
const triggerSampling = () => {
    sampling.value = true;
    setTimeout(() => {
        sampling.value = false;
        Message.success('采样已触发');
    }, 2000);
};
// 添加属性
const addAttribute = () => {
    attributes.value.push({
        id: '',
        displayName: '',
        dataType: 'string',
        relationId: '',
        isUniqueId: false,
        isEventTime: false,
        isEnum: false
    });
};
// 删除属性
const removeAttribute = (index) => {
    attributes.value.splice(index, 1);
};
// 验证属性ID唯一性
const validateAttributeId = (record, index) => {
    if (!record.id)
        return;
    const duplicateIndex = attributes.value.findIndex((attr, i) => i !== index && attr.id === record.id);
    if (duplicateIndex !== -1) {
        Message.error('属性ID不能重复');
        record.id = '';
    }
};
// 处理用户唯一标识变化
const handleUniqueIdChange = (record) => {
    // 当取消用户唯一标识时，清空关联ID
    if (!record.isUniqueId) {
        record.relationId = '';
    }
    // 可以在这里添加业务逻辑，比如限制唯一标识的数量
};
// 处理事件时间变化
const handleEventTimeChange = (record) => {
    if (record.isEventTime) {
        // 确保只有一个事件时间属性
        attributes.value.forEach(attr => {
            if (attr !== record) {
                attr.isEventTime = false;
            }
        });
    }
};
// 编辑枚举字典
const editEnumDict = (record) => {
    currentEnumAttribute.value = record;
    enumItems.value = record.enumDict ? [...record.enumDict] : [];
    enumModalVisible.value = true;
};
// 添加枚举项
const addEnumItem = () => {
    enumItems.value.push({ value: '', label: '' });
};
// 删除枚举项
const removeEnumItem = (index) => {
    enumItems.value.splice(index, 1);
};
// 保存枚举字典
const saveEnumDict = () => {
    if (currentEnumAttribute.value) {
        currentEnumAttribute.value.enumDict = [...enumItems.value];
        Message.success('枚举字典保存成功');
    }
    enumModalVisible.value = false;
};
// 取消枚举字典编辑
const cancelEnumDict = () => {
    enumModalVisible.value = false;
    enumItems.value = [];
    currentEnumAttribute.value = null;
};
// 查看事件详情
const viewEventDetail = (record) => {
    Message.info(`查看事件详情: ${record.eventName}`);
};
// 编辑事件
const editEvent = (record) => {
    isEdit.value = true;
    showCreateForm.value = true;
    // 填充表单数据
    eventForm.eventName = record.eventName;
    eventForm.sourceSystem = record.eventSource;
    eventForm.owner = record.owner;
    Message.info(`编辑事件: ${record.eventName}`);
};
// 查看抽样统计
const viewSampleStats = (record) => {
    router.push({
        path: '/exploration/customer-center/event-center/sample-stats',
        query: {
            eventId: record.id,
            eventName: record.eventName
        }
    });
};
// 删除事件
const deleteEvent = (record) => {
    Modal.warning({
        title: '确认删除',
        content: `确定要删除事件 ${record.eventName}？此操作不可恢复。`,
        okText: '确认删除',
        cancelText: '取消',
        onOk: () => {
            Message.success(`已删除事件: ${record.eventName}`);
            fetchData();
        }
    });
};
// 获取状态颜色
const getStatusColor = (status) => {
    const colorMap = {
        '上线': 'green',
        '下线': 'red'
    };
    return colorMap[status] || 'blue';
};
// 页面加载时获取数据
onMounted(() => {
    fetchData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['event-table']} */ ;
/** @type {__VLS_StyleScopedClasses['event-table']} */ ;
/** @type {__VLS_StyleScopedClasses['event-table']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
/** @type {__VLS_StyleScopedClasses['enum-item']} */ ;
/** @type {__VLS_StyleScopedClasses['event-management']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-th']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-th']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-tbody']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-tr']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-option']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "event-management" },
});
if (!__VLS_ctx.showCreateForm) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "event-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "page-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "page-description" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    const __VLS_0 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        size: "small",
    }));
    const __VLS_2 = __VLS_1({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onPressEnter': {} },
        modelValue: (__VLS_ctx.searchForm.eventName),
        placeholder: "搜索事件名称",
        allowClear: true,
        ...{ style: {} },
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onPressEnter': {} },
        modelValue: (__VLS_ctx.searchForm.eventName),
        placeholder: "搜索事件名称",
        allowClear: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onPressEnter: (__VLS_ctx.handleSearch)
    };
    __VLS_7.slots.default;
    {
        const { prefix: __VLS_thisSlot } = __VLS_7.slots;
        const __VLS_12 = {}.IconSearch;
        /** @type {[typeof __VLS_components.IconSearch, typeof __VLS_components.iconSearch, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ style: {} },
        }));
        const __VLS_14 = __VLS_13({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
    var __VLS_7;
    const __VLS_16 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.showCreateEvent)
    };
    __VLS_19.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_19.slots;
        const __VLS_24 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    }
    var __VLS_19;
    var __VLS_3;
    const __VLS_28 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ class: "content-card" },
        bordered: (false),
    }));
    const __VLS_30 = __VLS_29({
        ...{ class: "content-card" },
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-section" },
    });
    const __VLS_32 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onPageChange': {} },
        ...{ 'onPageSizeChange': {} },
        data: (__VLS_ctx.tableData),
        loading: (__VLS_ctx.loading),
        pagination: ({
            ...__VLS_ctx.pagination,
            showTotal: true,
            showPageSize: true,
            pageSizeOptions: ['15', '30', '50', '100'],
            size: 'small'
        }),
        ...{ class: "event-table" },
        size: "small",
        scroll: ({ x: 1200 }),
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onPageChange': {} },
        ...{ 'onPageSizeChange': {} },
        data: (__VLS_ctx.tableData),
        loading: (__VLS_ctx.loading),
        pagination: ({
            ...__VLS_ctx.pagination,
            showTotal: true,
            showPageSize: true,
            pageSizeOptions: ['15', '30', '50', '100'],
            size: 'small'
        }),
        ...{ class: "event-table" },
        size: "small",
        scroll: ({ x: 1200 }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onPageChange: (__VLS_ctx.onPageChange)
    };
    const __VLS_40 = {
        onPageSizeChange: (__VLS_ctx.onPageSizeChange)
    };
    __VLS_35.slots.default;
    {
        const { columns: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_41 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
            title: "ID",
            dataIndex: "id",
            width: (80),
            fixed: "left",
        }));
        const __VLS_43 = __VLS_42({
            title: "ID",
            dataIndex: "id",
            width: (80),
            fixed: "left",
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        const __VLS_45 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
            title: "事件名称",
            dataIndex: "eventName",
            width: (160),
        }));
        const __VLS_47 = __VLS_46({
            title: "事件名称",
            dataIndex: "eventName",
            width: (160),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        __VLS_48.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_48.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_49 = {}.ALink;
            /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
            // @ts-ignore
            const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
                ...{ 'onClick': {} },
            }));
            const __VLS_51 = __VLS_50({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_50));
            let __VLS_53;
            let __VLS_54;
            let __VLS_55;
            const __VLS_56 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.viewEventDetail(record);
                }
            };
            __VLS_52.slots.default;
            (record.eventName);
            var __VLS_52;
        }
        var __VLS_48;
        const __VLS_57 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
            title: "来源",
            dataIndex: "eventSource",
            width: (100),
        }));
        const __VLS_59 = __VLS_58({
            title: "来源",
            dataIndex: "eventSource",
            width: (100),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        const __VLS_61 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            title: "状态",
            dataIndex: "status",
            width: (80),
        }));
        const __VLS_63 = __VLS_62({
            title: "状态",
            dataIndex: "status",
            width: (80),
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        __VLS_64.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_64.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_65 = {}.ATag;
            /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
            // @ts-ignore
            const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
                color: (__VLS_ctx.getStatusColor(record.status)),
                size: "small",
            }));
            const __VLS_67 = __VLS_66({
                color: (__VLS_ctx.getStatusColor(record.status)),
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_66));
            __VLS_68.slots.default;
            (record.status);
            var __VLS_68;
        }
        var __VLS_64;
        const __VLS_69 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            title: "创建时间",
            dataIndex: "createTime",
            width: (140),
        }));
        const __VLS_71 = __VLS_70({
            title: "创建时间",
            dataIndex: "createTime",
            width: (140),
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        __VLS_72.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_72.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
            });
            (record.createTime);
        }
        var __VLS_72;
        const __VLS_73 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            title: "负责人",
            dataIndex: "owner",
            width: (80),
        }));
        const __VLS_75 = __VLS_74({
            title: "负责人",
            dataIndex: "owner",
            width: (80),
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        const __VLS_77 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
            title: "操作",
            width: (100),
            fixed: "right",
        }));
        const __VLS_79 = __VLS_78({
            title: "操作",
            width: (100),
            fixed: "right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        __VLS_80.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_80.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_81 = {}.ASpace;
            /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
                size: "mini",
            }));
            const __VLS_83 = __VLS_82({
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            __VLS_84.slots.default;
            const __VLS_85 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }));
            const __VLS_87 = __VLS_86({
                ...{ 'onClick': {} },
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            let __VLS_89;
            let __VLS_90;
            let __VLS_91;
            const __VLS_92 = {
                onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.editEvent(record);
                }
            };
            __VLS_88.slots.default;
            const __VLS_93 = {}.IconEdit;
            /** @type {[typeof __VLS_components.IconEdit, typeof __VLS_components.iconEdit, ]} */ ;
            // @ts-ignore
            const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
            const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
            var __VLS_88;
            const __VLS_97 = {}.ADropdown;
            /** @type {[typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, typeof __VLS_components.ADropdown, typeof __VLS_components.aDropdown, ]} */ ;
            // @ts-ignore
            const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
                trigger: "click",
            }));
            const __VLS_99 = __VLS_98({
                trigger: "click",
            }, ...__VLS_functionalComponentArgsRest(__VLS_98));
            __VLS_100.slots.default;
            const __VLS_101 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
                type: "text",
                size: "mini",
            }));
            const __VLS_103 = __VLS_102({
                type: "text",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_102));
            __VLS_104.slots.default;
            const __VLS_105 = {}.IconMore;
            /** @type {[typeof __VLS_components.IconMore, typeof __VLS_components.iconMore, ]} */ ;
            // @ts-ignore
            const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({}));
            const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
            var __VLS_104;
            {
                const { content: __VLS_thisSlot } = __VLS_100.slots;
                const __VLS_109 = {}.ADoption;
                /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ ;
                // @ts-ignore
                const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
                    ...{ 'onClick': {} },
                }));
                const __VLS_111 = __VLS_110({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_110));
                let __VLS_113;
                let __VLS_114;
                let __VLS_115;
                const __VLS_116 = {
                    onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.showCreateForm))
                            return;
                        __VLS_ctx.viewSampleStats(record);
                    }
                };
                __VLS_112.slots.default;
                const __VLS_117 = {}.IconBarChart;
                /** @type {[typeof __VLS_components.IconBarChart, typeof __VLS_components.iconBarChart, ]} */ ;
                // @ts-ignore
                const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({}));
                const __VLS_119 = __VLS_118({}, ...__VLS_functionalComponentArgsRest(__VLS_118));
                var __VLS_112;
                const __VLS_121 = {}.ADoption;
                /** @type {[typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, typeof __VLS_components.ADoption, typeof __VLS_components.aDoption, ]} */ ;
                // @ts-ignore
                const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
                    ...{ 'onClick': {} },
                    ...{ class: "danger-option" },
                }));
                const __VLS_123 = __VLS_122({
                    ...{ 'onClick': {} },
                    ...{ class: "danger-option" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_122));
                let __VLS_125;
                let __VLS_126;
                let __VLS_127;
                const __VLS_128 = {
                    onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.showCreateForm))
                            return;
                        __VLS_ctx.deleteEvent(record);
                    }
                };
                __VLS_124.slots.default;
                const __VLS_129 = {}.IconDelete;
                /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
                // @ts-ignore
                const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({}));
                const __VLS_131 = __VLS_130({}, ...__VLS_functionalComponentArgsRest(__VLS_130));
                var __VLS_124;
            }
            var __VLS_100;
            var __VLS_84;
        }
        var __VLS_80;
    }
    var __VLS_35;
    var __VLS_31;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "event-create" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "page-title" },
    });
    (__VLS_ctx.isEdit ? '编辑事件' : '新建事件');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "page-description" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    const __VLS_133 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
        size: "small",
    }));
    const __VLS_135 = __VLS_134({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    __VLS_136.slots.default;
    const __VLS_137 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_139 = __VLS_138({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    let __VLS_141;
    let __VLS_142;
    let __VLS_143;
    const __VLS_144 = {
        onClick: (__VLS_ctx.cancelCreate)
    };
    __VLS_140.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_140.slots;
        const __VLS_145 = {}.IconArrowLeft;
        /** @type {[typeof __VLS_components.IconArrowLeft, typeof __VLS_components.iconArrowLeft, ]} */ ;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({}));
        const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
    }
    var __VLS_140;
    const __VLS_149 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_151 = __VLS_150({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    let __VLS_153;
    let __VLS_154;
    let __VLS_155;
    const __VLS_156 = {
        onClick: (__VLS_ctx.saveEvent)
    };
    __VLS_152.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_152.slots;
        const __VLS_157 = {}.IconSave;
        /** @type {[typeof __VLS_components.IconSave, typeof __VLS_components.iconSave, ]} */ ;
        // @ts-ignore
        const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({}));
        const __VLS_159 = __VLS_158({}, ...__VLS_functionalComponentArgsRest(__VLS_158));
    }
    var __VLS_152;
    var __VLS_136;
    const __VLS_161 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
        ...{ class: "content-card" },
        bordered: (false),
    }));
    const __VLS_163 = __VLS_162({
        ...{ class: "content-card" },
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    __VLS_164.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-section" },
    });
    const __VLS_165 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        title: "事件基础信息",
        ...{ class: "section-card" },
        size: "small",
    }));
    const __VLS_167 = __VLS_166({
        title: "事件基础信息",
        ...{ class: "section-card" },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    __VLS_168.slots.default;
    const __VLS_169 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
        model: (__VLS_ctx.eventForm),
        rules: (__VLS_ctx.eventRules),
        ref: "eventFormRef",
        layout: "vertical",
    }));
    const __VLS_171 = __VLS_170({
        model: (__VLS_ctx.eventForm),
        rules: (__VLS_ctx.eventRules),
        ref: "eventFormRef",
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    /** @type {typeof __VLS_ctx.eventFormRef} */ ;
    var __VLS_173 = {};
    __VLS_172.slots.default;
    const __VLS_175 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        gutter: (24),
    }));
    const __VLS_177 = __VLS_176({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    __VLS_178.slots.default;
    const __VLS_179 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
        span: (8),
    }));
    const __VLS_181 = __VLS_180({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    __VLS_182.slots.default;
    const __VLS_183 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        field: "eventName",
        label: "事件名称",
        required: true,
    }));
    const __VLS_185 = __VLS_184({
        field: "eventName",
        label: "事件名称",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    __VLS_186.slots.default;
    const __VLS_187 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
        modelValue: (__VLS_ctx.eventForm.eventName),
        placeholder: "请输入事件名称",
        allowClear: true,
    }));
    const __VLS_189 = __VLS_188({
        modelValue: (__VLS_ctx.eventForm.eventName),
        placeholder: "请输入事件名称",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    var __VLS_186;
    var __VLS_182;
    const __VLS_191 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
        span: (8),
    }));
    const __VLS_193 = __VLS_192({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    __VLS_194.slots.default;
    const __VLS_195 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
        field: "sourceSystem",
        label: "来源系统",
        required: true,
    }));
    const __VLS_197 = __VLS_196({
        field: "sourceSystem",
        label: "来源系统",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    __VLS_198.slots.default;
    const __VLS_199 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
        modelValue: (__VLS_ctx.eventForm.sourceSystem),
        placeholder: "请选择来源系统",
        allowClear: true,
    }));
    const __VLS_201 = __VLS_200({
        modelValue: (__VLS_ctx.eventForm.sourceSystem),
        placeholder: "请选择来源系统",
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_200));
    __VLS_202.slots.default;
    for (const [system] of __VLS_getVForSourceType((__VLS_ctx.sourceSystems))) {
        const __VLS_203 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
            key: (system),
            value: (system),
        }));
        const __VLS_205 = __VLS_204({
            key: (system),
            value: (system),
        }, ...__VLS_functionalComponentArgsRest(__VLS_204));
        __VLS_206.slots.default;
        (system);
        var __VLS_206;
    }
    var __VLS_202;
    var __VLS_198;
    var __VLS_194;
    const __VLS_207 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({
        span: (8),
    }));
    const __VLS_209 = __VLS_208({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_208));
    __VLS_210.slots.default;
    const __VLS_211 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({
        field: "owner",
        label: "事件负责人",
        required: true,
    }));
    const __VLS_213 = __VLS_212({
        field: "owner",
        label: "事件负责人",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_212));
    __VLS_214.slots.default;
    const __VLS_215 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
        modelValue: (__VLS_ctx.eventForm.owner),
        placeholder: "请选择负责人",
        allowSearch: true,
        allowClear: true,
    }));
    const __VLS_217 = __VLS_216({
        modelValue: (__VLS_ctx.eventForm.owner),
        placeholder: "请选择负责人",
        allowSearch: true,
        allowClear: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    __VLS_218.slots.default;
    for (const [owner] of __VLS_getVForSourceType((__VLS_ctx.owners))) {
        const __VLS_219 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
            key: (owner.id),
            value: (owner.id),
        }));
        const __VLS_221 = __VLS_220({
            key: (owner.id),
            value: (owner.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_220));
        __VLS_222.slots.default;
        (owner.name);
        var __VLS_222;
    }
    var __VLS_218;
    var __VLS_214;
    var __VLS_210;
    var __VLS_178;
    const __VLS_223 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
        gutter: (24),
    }));
    const __VLS_225 = __VLS_224({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    __VLS_226.slots.default;
    const __VLS_227 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({
        span: (8),
    }));
    const __VLS_229 = __VLS_228({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_228));
    __VLS_230.slots.default;
    const __VLS_231 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({
        field: "collectionType",
        label: "获取方式",
        required: true,
    }));
    const __VLS_233 = __VLS_232({
        field: "collectionType",
        label: "获取方式",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_232));
    __VLS_234.slots.default;
    const __VLS_235 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
        modelValue: (__VLS_ctx.eventForm.collectionType),
        placeholder: "请选择获取方式",
    }));
    const __VLS_237 = __VLS_236({
        modelValue: (__VLS_ctx.eventForm.collectionType),
        placeholder: "请选择获取方式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    __VLS_238.slots.default;
    const __VLS_239 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
        value: "realtime",
    }));
    const __VLS_241 = __VLS_240({
        value: "realtime",
    }, ...__VLS_functionalComponentArgsRest(__VLS_240));
    __VLS_242.slots.default;
    var __VLS_242;
    const __VLS_243 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
        value: "sampling",
    }));
    const __VLS_245 = __VLS_244({
        value: "sampling",
    }, ...__VLS_functionalComponentArgsRest(__VLS_244));
    __VLS_246.slots.default;
    var __VLS_246;
    const __VLS_247 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
        value: "batch",
    }));
    const __VLS_249 = __VLS_248({
        value: "batch",
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    __VLS_250.slots.default;
    var __VLS_250;
    var __VLS_238;
    var __VLS_234;
    var __VLS_230;
    const __VLS_251 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({
        span: (8),
    }));
    const __VLS_253 = __VLS_252({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_252));
    __VLS_254.slots.default;
    if (__VLS_ctx.eventForm.collectionType === 'sampling') {
        const __VLS_255 = {}.AFormItem;
        /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
            field: "samplingRate",
            label: "采样率",
        }));
        const __VLS_257 = __VLS_256({
            field: "samplingRate",
            label: "采样率",
        }, ...__VLS_functionalComponentArgsRest(__VLS_256));
        __VLS_258.slots.default;
        const __VLS_259 = {}.AInputNumber;
        /** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ ;
        // @ts-ignore
        const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
            modelValue: (__VLS_ctx.eventForm.samplingRate),
            placeholder: "请输入采样率",
            min: (0),
            max: (100),
            suffix: "%",
        }));
        const __VLS_261 = __VLS_260({
            modelValue: (__VLS_ctx.eventForm.samplingRate),
            placeholder: "请输入采样率",
            min: (0),
            max: (100),
            suffix: "%",
        }, ...__VLS_functionalComponentArgsRest(__VLS_260));
        var __VLS_258;
    }
    var __VLS_254;
    const __VLS_263 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({
        span: (8),
    }));
    const __VLS_265 = __VLS_264({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_264));
    __VLS_266.slots.default;
    const __VLS_267 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({}));
    const __VLS_269 = __VLS_268({}, ...__VLS_functionalComponentArgsRest(__VLS_268));
    __VLS_270.slots.default;
    {
        const { label: __VLS_thisSlot } = __VLS_270.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    if (__VLS_ctx.eventForm.collectionType === 'sampling') {
        const __VLS_271 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
            ...{ 'onClick': {} },
            loading: (__VLS_ctx.sampling),
        }));
        const __VLS_273 = __VLS_272({
            ...{ 'onClick': {} },
            loading: (__VLS_ctx.sampling),
        }, ...__VLS_functionalComponentArgsRest(__VLS_272));
        let __VLS_275;
        let __VLS_276;
        let __VLS_277;
        const __VLS_278 = {
            onClick: (__VLS_ctx.triggerSampling)
        };
        __VLS_274.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_274.slots;
            const __VLS_279 = {}.IconPlayArrow;
            /** @type {[typeof __VLS_components.IconPlayArrow, typeof __VLS_components.iconPlayArrow, ]} */ ;
            // @ts-ignore
            const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({}));
            const __VLS_281 = __VLS_280({}, ...__VLS_functionalComponentArgsRest(__VLS_280));
        }
        var __VLS_274;
    }
    var __VLS_270;
    var __VLS_266;
    var __VLS_226;
    var __VLS_172;
    var __VLS_168;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-section" },
    });
    const __VLS_283 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
        title: "数据源配置",
        ...{ class: "section-card" },
        size: "small",
    }));
    const __VLS_285 = __VLS_284({
        title: "数据源配置",
        ...{ class: "section-card" },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_284));
    __VLS_286.slots.default;
    const __VLS_287 = {}.AForm;
    /** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
    // @ts-ignore
    const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
        model: (__VLS_ctx.dataSourceForm),
        layout: "vertical",
    }));
    const __VLS_289 = __VLS_288({
        model: (__VLS_ctx.dataSourceForm),
        layout: "vertical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_288));
    __VLS_290.slots.default;
    const __VLS_291 = {}.ARow;
    /** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
    // @ts-ignore
    const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
        gutter: (24),
    }));
    const __VLS_293 = __VLS_292({
        gutter: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_292));
    __VLS_294.slots.default;
    const __VLS_295 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({
        span: (12),
    }));
    const __VLS_297 = __VLS_296({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_296));
    __VLS_298.slots.default;
    const __VLS_299 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({
        field: "dataSourceType",
        label: "数据源类型",
    }));
    const __VLS_301 = __VLS_300({
        field: "dataSourceType",
        label: "数据源类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    __VLS_302.slots.default;
    const __VLS_303 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({
        modelValue: (__VLS_ctx.dataSourceForm.dataSourceType),
        placeholder: "请选择数据源类型",
        disabled: true,
    }));
    const __VLS_305 = __VLS_304({
        modelValue: (__VLS_ctx.dataSourceForm.dataSourceType),
        placeholder: "请选择数据源类型",
        disabled: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_304));
    __VLS_306.slots.default;
    const __VLS_307 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({
        value: "kafka",
    }));
    const __VLS_309 = __VLS_308({
        value: "kafka",
    }, ...__VLS_functionalComponentArgsRest(__VLS_308));
    __VLS_310.slots.default;
    var __VLS_310;
    const __VLS_311 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({
        value: "mysql",
    }));
    const __VLS_313 = __VLS_312({
        value: "mysql",
    }, ...__VLS_functionalComponentArgsRest(__VLS_312));
    __VLS_314.slots.default;
    var __VLS_314;
    const __VLS_315 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({
        value: "redis",
    }));
    const __VLS_317 = __VLS_316({
        value: "redis",
    }, ...__VLS_functionalComponentArgsRest(__VLS_316));
    __VLS_318.slots.default;
    var __VLS_318;
    var __VLS_306;
    var __VLS_302;
    var __VLS_298;
    const __VLS_319 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({
        span: (12),
    }));
    const __VLS_321 = __VLS_320({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_320));
    __VLS_322.slots.default;
    const __VLS_323 = {}.AFormItem;
    /** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_324 = __VLS_asFunctionalComponent(__VLS_323, new __VLS_323({
        field: "topic",
        label: "Topic",
    }));
    const __VLS_325 = __VLS_324({
        field: "topic",
        label: "Topic",
    }, ...__VLS_functionalComponentArgsRest(__VLS_324));
    __VLS_326.slots.default;
    const __VLS_327 = {}.ASelect;
    /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
    // @ts-ignore
    const __VLS_328 = __VLS_asFunctionalComponent(__VLS_327, new __VLS_327({
        modelValue: (__VLS_ctx.dataSourceForm.topic),
        placeholder: "请选择或创建Topic",
        allowSearch: true,
        allowCreate: true,
    }));
    const __VLS_329 = __VLS_328({
        modelValue: (__VLS_ctx.dataSourceForm.topic),
        placeholder: "请选择或创建Topic",
        allowSearch: true,
        allowCreate: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_328));
    __VLS_330.slots.default;
    for (const [topic] of __VLS_getVForSourceType((__VLS_ctx.topics))) {
        const __VLS_331 = {}.AOption;
        /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
        // @ts-ignore
        const __VLS_332 = __VLS_asFunctionalComponent(__VLS_331, new __VLS_331({
            key: (topic),
            value: (topic),
        }));
        const __VLS_333 = __VLS_332({
            key: (topic),
            value: (topic),
        }, ...__VLS_functionalComponentArgsRest(__VLS_332));
        __VLS_334.slots.default;
        (topic);
        var __VLS_334;
    }
    var __VLS_330;
    var __VLS_326;
    var __VLS_322;
    var __VLS_294;
    var __VLS_290;
    var __VLS_286;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-section" },
    });
    const __VLS_335 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_336 = __VLS_asFunctionalComponent(__VLS_335, new __VLS_335({
        ...{ class: "section-card" },
        size: "small",
    }));
    const __VLS_337 = __VLS_336({
        ...{ class: "section-card" },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_336));
    __VLS_338.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_338.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-title-with-action" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        const __VLS_339 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_340 = __VLS_asFunctionalComponent(__VLS_339, new __VLS_339({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
        }));
        const __VLS_341 = __VLS_340({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_340));
        let __VLS_343;
        let __VLS_344;
        let __VLS_345;
        const __VLS_346 = {
            onClick: (__VLS_ctx.addAttribute)
        };
        __VLS_342.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_342.slots;
            const __VLS_347 = {}.IconPlus;
            /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
            // @ts-ignore
            const __VLS_348 = __VLS_asFunctionalComponent(__VLS_347, new __VLS_347({}));
            const __VLS_349 = __VLS_348({}, ...__VLS_functionalComponentArgsRest(__VLS_348));
        }
        var __VLS_342;
    }
    const __VLS_351 = {}.ATable;
    /** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
    // @ts-ignore
    const __VLS_352 = __VLS_asFunctionalComponent(__VLS_351, new __VLS_351({
        data: (__VLS_ctx.attributes),
        pagination: (false),
        ...{ class: "attribute-table" },
        size: "small",
    }));
    const __VLS_353 = __VLS_352({
        data: (__VLS_ctx.attributes),
        pagination: (false),
        ...{ class: "attribute-table" },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_352));
    __VLS_354.slots.default;
    {
        const { columns: __VLS_thisSlot } = __VLS_354.slots;
        const __VLS_355 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_356 = __VLS_asFunctionalComponent(__VLS_355, new __VLS_355({
            title: "属性ID",
            dataIndex: "id",
            width: (120),
        }));
        const __VLS_357 = __VLS_356({
            title: "属性ID",
            dataIndex: "id",
            width: (120),
        }, ...__VLS_functionalComponentArgsRest(__VLS_356));
        __VLS_358.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_358.slots;
            const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_359 = {}.AInput;
            /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
            // @ts-ignore
            const __VLS_360 = __VLS_asFunctionalComponent(__VLS_359, new __VLS_359({
                ...{ 'onBlur': {} },
                modelValue: (record.id),
                placeholder: "请输入属性ID",
            }));
            const __VLS_361 = __VLS_360({
                ...{ 'onBlur': {} },
                modelValue: (record.id),
                placeholder: "请输入属性ID",
            }, ...__VLS_functionalComponentArgsRest(__VLS_360));
            let __VLS_363;
            let __VLS_364;
            let __VLS_365;
            const __VLS_366 = {
                onBlur: (...[$event]) => {
                    if (!!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.validateAttributeId(record, rowIndex);
                }
            };
            var __VLS_362;
        }
        var __VLS_358;
        const __VLS_367 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_368 = __VLS_asFunctionalComponent(__VLS_367, new __VLS_367({
            title: "展示名称",
            dataIndex: "displayName",
            width: (150),
        }));
        const __VLS_369 = __VLS_368({
            title: "展示名称",
            dataIndex: "displayName",
            width: (150),
        }, ...__VLS_functionalComponentArgsRest(__VLS_368));
        __VLS_370.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_370.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_371 = {}.AInput;
            /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
            // @ts-ignore
            const __VLS_372 = __VLS_asFunctionalComponent(__VLS_371, new __VLS_371({
                modelValue: (record.displayName),
                placeholder: "请输入展示名称",
            }));
            const __VLS_373 = __VLS_372({
                modelValue: (record.displayName),
                placeholder: "请输入展示名称",
            }, ...__VLS_functionalComponentArgsRest(__VLS_372));
        }
        var __VLS_370;
        const __VLS_375 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_376 = __VLS_asFunctionalComponent(__VLS_375, new __VLS_375({
            title: "数据类型",
            dataIndex: "dataType",
            width: (120),
        }));
        const __VLS_377 = __VLS_376({
            title: "数据类型",
            dataIndex: "dataType",
            width: (120),
        }, ...__VLS_functionalComponentArgsRest(__VLS_376));
        __VLS_378.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_378.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_379 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
            // @ts-ignore
            const __VLS_380 = __VLS_asFunctionalComponent(__VLS_379, new __VLS_379({
                modelValue: (record.dataType),
                placeholder: "选择类型",
            }));
            const __VLS_381 = __VLS_380({
                modelValue: (record.dataType),
                placeholder: "选择类型",
            }, ...__VLS_functionalComponentArgsRest(__VLS_380));
            __VLS_382.slots.default;
            const __VLS_383 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_384 = __VLS_asFunctionalComponent(__VLS_383, new __VLS_383({
                value: "string",
            }));
            const __VLS_385 = __VLS_384({
                value: "string",
            }, ...__VLS_functionalComponentArgsRest(__VLS_384));
            __VLS_386.slots.default;
            var __VLS_386;
            const __VLS_387 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_388 = __VLS_asFunctionalComponent(__VLS_387, new __VLS_387({
                value: "number",
            }));
            const __VLS_389 = __VLS_388({
                value: "number",
            }, ...__VLS_functionalComponentArgsRest(__VLS_388));
            __VLS_390.slots.default;
            var __VLS_390;
            const __VLS_391 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_392 = __VLS_asFunctionalComponent(__VLS_391, new __VLS_391({
                value: "boolean",
            }));
            const __VLS_393 = __VLS_392({
                value: "boolean",
            }, ...__VLS_functionalComponentArgsRest(__VLS_392));
            __VLS_394.slots.default;
            var __VLS_394;
            const __VLS_395 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_396 = __VLS_asFunctionalComponent(__VLS_395, new __VLS_395({
                value: "date",
            }));
            const __VLS_397 = __VLS_396({
                value: "date",
            }, ...__VLS_functionalComponentArgsRest(__VLS_396));
            __VLS_398.slots.default;
            var __VLS_398;
            const __VLS_399 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_400 = __VLS_asFunctionalComponent(__VLS_399, new __VLS_399({
                value: "array",
            }));
            const __VLS_401 = __VLS_400({
                value: "array",
            }, ...__VLS_functionalComponentArgsRest(__VLS_400));
            __VLS_402.slots.default;
            var __VLS_402;
            const __VLS_403 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_404 = __VLS_asFunctionalComponent(__VLS_403, new __VLS_403({
                value: "object",
            }));
            const __VLS_405 = __VLS_404({
                value: "object",
            }, ...__VLS_functionalComponentArgsRest(__VLS_404));
            __VLS_406.slots.default;
            var __VLS_406;
            var __VLS_382;
        }
        var __VLS_378;
        const __VLS_407 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_408 = __VLS_asFunctionalComponent(__VLS_407, new __VLS_407({
            title: "关联ID",
            dataIndex: "relationId",
            width: (120),
        }));
        const __VLS_409 = __VLS_408({
            title: "关联ID",
            dataIndex: "relationId",
            width: (120),
        }, ...__VLS_functionalComponentArgsRest(__VLS_408));
        __VLS_410.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_410.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_411 = {}.ASelect;
            /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
            // @ts-ignore
            const __VLS_412 = __VLS_asFunctionalComponent(__VLS_411, new __VLS_411({
                modelValue: (record.relationId),
                placeholder: "选择关联ID",
                allowClear: true,
                disabled: (!record.isUniqueId),
            }));
            const __VLS_413 = __VLS_412({
                modelValue: (record.relationId),
                placeholder: "选择关联ID",
                allowClear: true,
                disabled: (!record.isUniqueId),
            }, ...__VLS_functionalComponentArgsRest(__VLS_412));
            __VLS_414.slots.default;
            const __VLS_415 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_416 = __VLS_asFunctionalComponent(__VLS_415, new __VLS_415({
                value: "UID",
            }));
            const __VLS_417 = __VLS_416({
                value: "UID",
            }, ...__VLS_functionalComponentArgsRest(__VLS_416));
            __VLS_418.slots.default;
            var __VLS_418;
            const __VLS_419 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_420 = __VLS_asFunctionalComponent(__VLS_419, new __VLS_419({
                value: "CUSTID",
            }));
            const __VLS_421 = __VLS_420({
                value: "CUSTID",
            }, ...__VLS_functionalComponentArgsRest(__VLS_420));
            __VLS_422.slots.default;
            var __VLS_422;
            const __VLS_423 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_424 = __VLS_asFunctionalComponent(__VLS_423, new __VLS_423({
                value: "CUSTNO",
            }));
            const __VLS_425 = __VLS_424({
                value: "CUSTNO",
            }, ...__VLS_functionalComponentArgsRest(__VLS_424));
            __VLS_426.slots.default;
            var __VLS_426;
            var __VLS_414;
        }
        var __VLS_410;
        const __VLS_427 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_428 = __VLS_asFunctionalComponent(__VLS_427, new __VLS_427({
            title: "用户唯一标识",
            width: (120),
            align: "center",
        }));
        const __VLS_429 = __VLS_428({
            title: "用户唯一标识",
            width: (120),
            align: "center",
        }, ...__VLS_functionalComponentArgsRest(__VLS_428));
        __VLS_430.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_430.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_431 = {}.ASwitch;
            /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
            // @ts-ignore
            const __VLS_432 = __VLS_asFunctionalComponent(__VLS_431, new __VLS_431({
                ...{ 'onChange': {} },
                modelValue: (record.isUniqueId),
            }));
            const __VLS_433 = __VLS_432({
                ...{ 'onChange': {} },
                modelValue: (record.isUniqueId),
            }, ...__VLS_functionalComponentArgsRest(__VLS_432));
            let __VLS_435;
            let __VLS_436;
            let __VLS_437;
            const __VLS_438 = {
                onChange: (...[$event]) => {
                    if (!!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.handleUniqueIdChange(record);
                }
            };
            var __VLS_434;
        }
        var __VLS_430;
        const __VLS_439 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_440 = __VLS_asFunctionalComponent(__VLS_439, new __VLS_439({
            title: "事件产生时间",
            width: (120),
            align: "center",
        }));
        const __VLS_441 = __VLS_440({
            title: "事件产生时间",
            width: (120),
            align: "center",
        }, ...__VLS_functionalComponentArgsRest(__VLS_440));
        __VLS_442.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_442.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_443 = {}.ASwitch;
            /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
            // @ts-ignore
            const __VLS_444 = __VLS_asFunctionalComponent(__VLS_443, new __VLS_443({
                ...{ 'onChange': {} },
                modelValue: (record.isEventTime),
            }));
            const __VLS_445 = __VLS_444({
                ...{ 'onChange': {} },
                modelValue: (record.isEventTime),
            }, ...__VLS_functionalComponentArgsRest(__VLS_444));
            let __VLS_447;
            let __VLS_448;
            let __VLS_449;
            const __VLS_450 = {
                onChange: (...[$event]) => {
                    if (!!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.handleEventTimeChange(record);
                }
            };
            var __VLS_446;
        }
        var __VLS_442;
        const __VLS_451 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_452 = __VLS_asFunctionalComponent(__VLS_451, new __VLS_451({
            title: "枚举",
            width: (80),
            align: "center",
        }));
        const __VLS_453 = __VLS_452({
            title: "枚举",
            width: (80),
            align: "center",
        }, ...__VLS_functionalComponentArgsRest(__VLS_452));
        __VLS_454.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_454.slots;
            const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_455 = {}.ASwitch;
            /** @type {[typeof __VLS_components.ASwitch, typeof __VLS_components.aSwitch, ]} */ ;
            // @ts-ignore
            const __VLS_456 = __VLS_asFunctionalComponent(__VLS_455, new __VLS_455({
                modelValue: (record.isEnum),
            }));
            const __VLS_457 = __VLS_456({
                modelValue: (record.isEnum),
            }, ...__VLS_functionalComponentArgsRest(__VLS_456));
        }
        var __VLS_454;
        const __VLS_459 = {}.ATableColumn;
        /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_460 = __VLS_asFunctionalComponent(__VLS_459, new __VLS_459({
            title: "操作",
            width: (150),
            fixed: "right",
        }));
        const __VLS_461 = __VLS_460({
            title: "操作",
            width: (150),
            fixed: "right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_460));
        __VLS_462.slots.default;
        {
            const { cell: __VLS_thisSlot } = __VLS_462.slots;
            const [{ record, rowIndex }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_463 = {}.ASpace;
            /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
            // @ts-ignore
            const __VLS_464 = __VLS_asFunctionalComponent(__VLS_463, new __VLS_463({}));
            const __VLS_465 = __VLS_464({}, ...__VLS_functionalComponentArgsRest(__VLS_464));
            __VLS_466.slots.default;
            if (record.isEnum) {
                const __VLS_467 = {}.AButton;
                /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
                // @ts-ignore
                const __VLS_468 = __VLS_asFunctionalComponent(__VLS_467, new __VLS_467({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                }));
                const __VLS_469 = __VLS_468({
                    ...{ 'onClick': {} },
                    type: "text",
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_468));
                let __VLS_471;
                let __VLS_472;
                let __VLS_473;
                const __VLS_474 = {
                    onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.showCreateForm))
                            return;
                        if (!(record.isEnum))
                            return;
                        __VLS_ctx.editEnumDict(record);
                    }
                };
                __VLS_470.slots.default;
                var __VLS_470;
            }
            const __VLS_475 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_476 = __VLS_asFunctionalComponent(__VLS_475, new __VLS_475({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }));
            const __VLS_477 = __VLS_476({
                ...{ 'onClick': {} },
                type: "text",
                size: "small",
                status: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_476));
            let __VLS_479;
            let __VLS_480;
            let __VLS_481;
            const __VLS_482 = {
                onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.showCreateForm))
                        return;
                    __VLS_ctx.removeAttribute(rowIndex);
                }
            };
            __VLS_478.slots.default;
            {
                const { icon: __VLS_thisSlot } = __VLS_478.slots;
                const __VLS_483 = {}.IconDelete;
                /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
                // @ts-ignore
                const __VLS_484 = __VLS_asFunctionalComponent(__VLS_483, new __VLS_483({}));
                const __VLS_485 = __VLS_484({}, ...__VLS_functionalComponentArgsRest(__VLS_484));
            }
            var __VLS_478;
            var __VLS_466;
        }
        var __VLS_462;
    }
    var __VLS_354;
    var __VLS_338;
    var __VLS_164;
}
const __VLS_487 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_488 = __VLS_asFunctionalComponent(__VLS_487, new __VLS_487({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.enumModalVisible),
    title: "编辑枚举字典",
    width: "600px",
}));
const __VLS_489 = __VLS_488({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.enumModalVisible),
    title: "编辑枚举字典",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_488));
let __VLS_491;
let __VLS_492;
let __VLS_493;
const __VLS_494 = {
    onOk: (__VLS_ctx.saveEnumDict)
};
const __VLS_495 = {
    onCancel: (__VLS_ctx.cancelEnumDict)
};
__VLS_490.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "enum-dict-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "enum-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.currentEnumAttribute?.displayName);
const __VLS_496 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_497 = __VLS_asFunctionalComponent(__VLS_496, new __VLS_496({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_498 = __VLS_497({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_497));
let __VLS_500;
let __VLS_501;
let __VLS_502;
const __VLS_503 = {
    onClick: (__VLS_ctx.addEnumItem)
};
__VLS_499.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_499.slots;
    const __VLS_504 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_505 = __VLS_asFunctionalComponent(__VLS_504, new __VLS_504({}));
    const __VLS_506 = __VLS_505({}, ...__VLS_functionalComponentArgsRest(__VLS_505));
}
var __VLS_499;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "enum-list" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.enumItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "enum-item" },
    });
    const __VLS_508 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_509 = __VLS_asFunctionalComponent(__VLS_508, new __VLS_508({
        modelValue: (item.value),
        placeholder: "枚举值",
        ...{ style: {} },
    }));
    const __VLS_510 = __VLS_509({
        modelValue: (item.value),
        placeholder: "枚举值",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_509));
    const __VLS_512 = {}.AInput;
    /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
    // @ts-ignore
    const __VLS_513 = __VLS_asFunctionalComponent(__VLS_512, new __VLS_512({
        modelValue: (item.label),
        placeholder: "显示名称",
        ...{ style: {} },
    }));
    const __VLS_514 = __VLS_513({
        modelValue: (item.label),
        placeholder: "显示名称",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_513));
    const __VLS_516 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_517 = __VLS_asFunctionalComponent(__VLS_516, new __VLS_516({
        ...{ 'onClick': {} },
        type: "text",
        status: "danger",
    }));
    const __VLS_518 = __VLS_517({
        ...{ 'onClick': {} },
        type: "text",
        status: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_517));
    let __VLS_520;
    let __VLS_521;
    let __VLS_522;
    const __VLS_523 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeEnumItem(index);
        }
    };
    __VLS_519.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_519.slots;
        const __VLS_524 = {}.IconDelete;
        /** @type {[typeof __VLS_components.IconDelete, typeof __VLS_components.iconDelete, ]} */ ;
        // @ts-ignore
        const __VLS_525 = __VLS_asFunctionalComponent(__VLS_524, new __VLS_524({}));
        const __VLS_526 = __VLS_525({}, ...__VLS_functionalComponentArgsRest(__VLS_525));
    }
    var __VLS_519;
}
var __VLS_490;
/** @type {__VLS_StyleScopedClasses['event-management']} */ ;
/** @type {__VLS_StyleScopedClasses['event-list']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
/** @type {__VLS_StyleScopedClasses['event-table']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-option']} */ ;
/** @type {__VLS_StyleScopedClasses['event-create']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-with-action']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-table']} */ ;
/** @type {__VLS_StyleScopedClasses['enum-dict-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['enum-header']} */ ;
/** @type {__VLS_StyleScopedClasses['enum-list']} */ ;
/** @type {__VLS_StyleScopedClasses['enum-item']} */ ;
// @ts-ignore
var __VLS_174 = __VLS_173;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            IconPlus: IconPlus,
            IconEdit: IconEdit,
            IconDelete: IconDelete,
            IconArrowLeft: IconArrowLeft,
            IconSave: IconSave,
            IconPlayArrow: IconPlayArrow,
            IconMore: IconMore,
            IconBarChart: IconBarChart,
            showCreateForm: showCreateForm,
            isEdit: isEdit,
            saving: saving,
            sampling: sampling,
            sourceSystems: sourceSystems,
            owners: owners,
            topics: topics,
            searchForm: searchForm,
            tableData: tableData,
            loading: loading,
            pagination: pagination,
            eventForm: eventForm,
            dataSourceForm: dataSourceForm,
            attributes: attributes,
            eventRules: eventRules,
            eventFormRef: eventFormRef,
            enumModalVisible: enumModalVisible,
            currentEnumAttribute: currentEnumAttribute,
            enumItems: enumItems,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
            handleSearch: handleSearch,
            showCreateEvent: showCreateEvent,
            cancelCreate: cancelCreate,
            saveEvent: saveEvent,
            triggerSampling: triggerSampling,
            addAttribute: addAttribute,
            removeAttribute: removeAttribute,
            validateAttributeId: validateAttributeId,
            handleUniqueIdChange: handleUniqueIdChange,
            handleEventTimeChange: handleEventTimeChange,
            editEnumDict: editEnumDict,
            addEnumItem: addEnumItem,
            removeEnumItem: removeEnumItem,
            saveEnumDict: saveEnumDict,
            cancelEnumDict: cancelEnumDict,
            viewEventDetail: viewEventDetail,
            editEvent: editEvent,
            viewSampleStats: viewSampleStats,
            deleteEvent: deleteEvent,
            getStatusColor: getStatusColor,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
