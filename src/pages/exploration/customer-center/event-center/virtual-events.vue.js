import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconPlus, IconSync, IconImport } from '@arco-design/web-vue/es/icon';
import { generateVirtualEventData, generateEventData } from '@/mock/event';
// 搜索表单
const searchForm = reactive({
    eventName: ''
});
// 表格数据
const tableData = ref([]);
// 事件中心数据（用于同步）
const eventCenterData = ref([]);
// 同步相关状态
const syncModalVisible = ref(false);
const importModalVisible = ref(false);
const syncLoading = ref(false);
const selectedEvents = ref([]);
// 加载状态
const loading = ref(false);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showTotal: true,
    showPageSize: true
});
// 初始化数据
const initData = () => {
    // 生成虚拟事件数据
    const virtualEvents = generateVirtualEventData(25);
    tableData.value = virtualEvents;
    pagination.total = virtualEvents.length;
    // 生成事件中心数据
    eventCenterData.value = generateEventData(50);
};
// 获取状态颜色
const getStatusColor = (status) => {
    switch (status) {
        case '已上线':
            return 'green';
        case '已下线':
            return 'red';
        case '草稿':
            return 'gray';
        default:
            return 'blue';
    }
};
// 获取同步状态颜色
const getSyncStatusColor = (status) => {
    switch (status) {
        case 'synced':
            return 'green';
        case 'pending':
            return 'orange';
        case 'failed':
            return 'red';
        default:
            return 'gray';
    }
};
// 获取同步状态文本
const getSyncStatusText = (status) => {
    switch (status) {
        case 'synced':
            return '已同步';
        case 'pending':
            return '待同步';
        case 'failed':
            return '同步失败';
        default:
            return '未同步';
    }
};
// 搜索处理
const handleSearch = () => {
    console.log('搜索:', searchForm.eventName);
    // 这里添加搜索逻辑
};
// 从事件中心导入事件
const importFromEventCenter = () => {
    importModalVisible.value = true;
};
// 同步虚拟事件到事件中心
const syncToEventCenter = (record) => {
    syncLoading.value = true;
    // 模拟同步过程
    setTimeout(() => {
        // 更新虚拟事件的同步状态
        const index = tableData.value.findIndex((item) => item.id === record.id);
        if (index !== -1) {
            tableData.value[index].syncStatus = 'synced';
        }
        syncLoading.value = false;
        Message.success(`虚拟事件"${record.eventName}"已成功同步到事件中心`);
    }, 2000);
};
// 批量同步选中的虚拟事件
const batchSyncToEventCenter = () => {
    if (selectedEvents.value.length === 0) {
        Message.warning('请选择要同步的虚拟事件');
        return;
    }
    syncLoading.value = true;
    let syncedCount = 0;
    selectedEvents.value.forEach((eventId, index) => {
        setTimeout(() => {
            const record = tableData.value.find((item) => item.id === eventId);
            if (record && record.syncStatus !== 'synced') {
                record.syncStatus = 'synced';
                syncedCount++;
            }
            if (index === selectedEvents.value.length - 1) {
                setTimeout(() => {
                    syncLoading.value = false;
                    Message.success(`成功同步${syncedCount}个虚拟事件到事件中心`);
                    selectedEvents.value = [];
                }, 1000);
            }
        }, index * 500);
    });
};
// 确认导入选中的事件
const confirmImportEvents = () => {
    if (selectedEvents.value.length === 0) {
        Message.warning('请选择要导入的事件');
        return;
    }
    selectedEvents.value.forEach((eventId) => {
        const realEvent = eventCenterData.value.find((item) => item.id === eventId);
        if (realEvent) {
            // 创建基于真实事件的虚拟事件
            const virtualEvent = {
                id: `VE${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                eventName: `${realEvent.eventName}虚拟事件`,
                eventId: `virtual_${realEvent.id.toLowerCase()}`,
                scenario: '营销触达',
                status: '草稿',
                updater: '当前用户',
                updateTime: new Date().toLocaleString('zh-CN'),
                createTime: new Date().toLocaleString('zh-CN'),
                description: `基于事件中心"${realEvent.eventName}"创建的虚拟事件`,
                logicRelation: 'AND',
                conditionGroups: [
                    {
                        id: 1,
                        conditions: [
                            {
                                field: realEvent.eventName,
                                operator: '用户ID',
                                value: '',
                                logic: '等于'
                            }
                        ]
                    }
                ],
                realEventId: realEvent.id,
                syncStatus: 'synced'
            };
            tableData.value.unshift(virtualEvent);
            pagination.total += 1;
        }
    });
    Message.success(`成功导入${selectedEvents.value.length}个事件`);
    importModalVisible.value = false;
    selectedEvents.value = [];
};
// 新建事件模态框状态
const createModalVisible = ref(false);
// 新建事件表单
const createForm = reactive({
    eventName: '',
    eventId: '',
    scenario: '',
    description: '',
    logicRelation: 'AND', // 条件间的逻辑关系：AND 或 OR
    conditionGroups: [
        {
            id: 1,
            conditions: [
                {
                    field: 'APP注册',
                    operator: '身份证号',
                    value: '123',
                    logic: '等于'
                }
            ]
        }
    ]
});
// 使用场景选项
const scenarioOptions = [
    { label: '营销触达', value: '营销触达' },
    { label: '风险控制', value: '风险控制' },
    { label: '用户分析', value: '用户分析' },
    { label: '行为监控', value: '行为监控' }
];
// 条件字段选项
const fieldOptions = [
    { label: 'APP注册', value: 'APP注册' },
    { label: '用户登录', value: '用户登录' },
    { label: '订单支付', value: '订单支付' },
    { label: '页面访问', value: '页面访问' }
];
// 操作符选项
const operatorOptions = [
    { label: '身份证号', value: '身份证号' },
    { label: '手机号', value: '手机号' },
    { label: '用户ID', value: '用户ID' },
    { label: '设备ID', value: '设备ID' }
];
// 逻辑操作符选项
const logicOptions = [
    { label: '等于', value: '等于' },
    { label: '不等于', value: '不等于' },
    { label: '包含', value: '包含' },
    { label: '不包含', value: '不包含' }
];
// 新建事件
const showCreateEvent = () => {
    createModalVisible.value = true;
};
// 添加条件组
const addConditionGroup = () => {
    const newId = Math.max(...createForm.conditionGroups.map(g => g.id)) + 1;
    createForm.conditionGroups.push({
        id: newId,
        conditions: [
            {
                field: '',
                operator: '',
                value: '',
                logic: '等于'
            }
        ]
    });
};
// 添加条件到指定组
const addCondition = (groupIndex) => {
    createForm.conditionGroups[groupIndex].conditions.push({
        field: '',
        operator: '',
        value: '',
        logic: '等于'
    });
};
// 删除条件
const removeCondition = (groupIndex, conditionIndex) => {
    const group = createForm.conditionGroups[groupIndex];
    if (group.conditions.length > 1) {
        group.conditions.splice(conditionIndex, 1);
    }
    else if (createForm.conditionGroups.length > 1) {
        // 如果组内只有一个条件且有多个组，删除整个组
        createForm.conditionGroups.splice(groupIndex, 1);
    }
};
// 删除条件组
const removeConditionGroup = (groupIndex) => {
    if (createForm.conditionGroups.length > 1) {
        createForm.conditionGroups.splice(groupIndex, 1);
    }
};
// 保存虚拟事件
const saveVirtualEvent = () => {
    // 表单验证
    if (!createForm.eventName) {
        Message.error('请输入虚拟事件名称');
        return;
    }
    if (!createForm.eventId) {
        Message.error('请输入虚拟事件ID');
        return;
    }
    if (!createForm.scenario) {
        Message.error('请选择使用场景');
        return;
    }
    // 模拟保存
    const newEvent = {
        id: `VE${Date.now()}`,
        eventName: createForm.eventName,
        eventId: createForm.eventId,
        scenario: createForm.scenario,
        updater: '当前用户',
        updateTime: new Date().toLocaleString('zh-CN'),
        createTime: new Date().toLocaleString('zh-CN'),
        status: '草稿'
    };
    tableData.value.unshift(newEvent);
    pagination.total += 1;
    Message.success('虚拟事件创建成功');
    createModalVisible.value = false;
    resetCreateForm();
};
// 重置表单
const resetCreateForm = () => {
    createForm.eventName = '';
    createForm.eventId = '';
    createForm.scenario = '';
    createForm.description = '';
    createForm.logicRelation = 'AND';
    createForm.conditionGroups = [
        {
            id: 1,
            conditions: [
                {
                    field: 'APP注册',
                    operator: '身份证号',
                    value: '123',
                    logic: '等于'
                }
            ]
        }
    ];
};
// 取消创建
const cancelCreate = () => {
    createModalVisible.value = false;
    resetCreateForm();
};
// 查看事件详情
const viewEventDetail = (record) => {
    console.log('查看详情:', record);
    Message.info('查看详情功能开发中...');
};
// 编辑事件
const editEvent = (record) => {
    console.log('编辑事件:', record);
    Message.info('编辑功能开发中...');
};
// 复制事件
const copyEvent = (record) => {
    console.log('复制事件:', record);
    Message.success('复制成功');
};
// 删除事件
const deleteEvent = (record) => {
    console.log('删除事件:', record);
    Message.warning('删除功能开发中...');
};
// 分页变化
const onPageChange = (page) => {
    pagination.current = page;
    console.log('页码变化:', page);
};
const onPageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    console.log('页大小变化:', pageSize);
};
// 组件挂载
onMounted(() => {
    initData();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-input']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-field']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-operator']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-logic']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['import-table']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-th']} */ ;
/** @type {__VLS_StyleScopedClasses['import-table']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
/** @type {__VLS_StyleScopedClasses['import-table']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-tr']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-table-td']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "virtual-events" },
});
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
    placeholder: "搜索虚拟事件名称",
    allowClear: true,
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onPressEnter': {} },
    modelValue: (__VLS_ctx.searchForm.eventName),
    placeholder: "搜索虚拟事件名称",
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
    type: "outline",
    size: "small",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.importFromEventCenter)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.IconImport;
    /** @type {[typeof __VLS_components.IconImport, typeof __VLS_components.iconImport, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_19;
const __VLS_28 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
    loading: (__VLS_ctx.syncLoading),
    disabled: (__VLS_ctx.selectedEvents.length === 0),
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
    loading: (__VLS_ctx.syncLoading),
    disabled: (__VLS_ctx.selectedEvents.length === 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onClick: (__VLS_ctx.batchSyncToEventCenter)
};
__VLS_31.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_31.slots;
    const __VLS_36 = {}.IconSync;
    /** @type {[typeof __VLS_components.IconSync, typeof __VLS_components.iconSync, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
var __VLS_31;
const __VLS_40 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (__VLS_ctx.showCreateEvent)
};
__VLS_43.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_43.slots;
    const __VLS_48 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
    const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
var __VLS_43;
var __VLS_3;
const __VLS_52 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ class: "content-card" },
    bordered: (false),
}));
const __VLS_54 = __VLS_53({
    ...{ class: "content-card" },
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-section" },
});
const __VLS_56 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
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
    scroll: ({ x: 1400 }),
    rowSelection: ({
        type: 'checkbox',
        selectedRowKeys: __VLS_ctx.selectedEvents,
        onSelect: (rowKeys) => { __VLS_ctx.selectedEvents = rowKeys; },
        onSelectAll: (selected, selectedRows, changeRows) => {
            if (selected) {
                __VLS_ctx.selectedEvents = __VLS_ctx.tableData.map(item => item.id);
            }
            else {
                __VLS_ctx.selectedEvents = [];
            }
        }
    }),
}));
const __VLS_58 = __VLS_57({
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
    scroll: ({ x: 1400 }),
    rowSelection: ({
        type: 'checkbox',
        selectedRowKeys: __VLS_ctx.selectedEvents,
        onSelect: (rowKeys) => { __VLS_ctx.selectedEvents = rowKeys; },
        onSelectAll: (selected, selectedRows, changeRows) => {
            if (selected) {
                __VLS_ctx.selectedEvents = __VLS_ctx.tableData.map(item => item.id);
            }
            else {
                __VLS_ctx.selectedEvents = [];
            }
        }
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
const __VLS_64 = {
    onPageSizeChange: (__VLS_ctx.onPageSizeChange)
};
__VLS_59.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_59.slots;
    const __VLS_65 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        title: "虚拟事件名称",
        dataIndex: "eventName",
        width: (200),
    }));
    const __VLS_67 = __VLS_66({
        title: "虚拟事件名称",
        dataIndex: "eventName",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_68.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_69 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            ...{ 'onClick': {} },
        }));
        const __VLS_71 = __VLS_70({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        let __VLS_73;
        let __VLS_74;
        let __VLS_75;
        const __VLS_76 = {
            onClick: (...[$event]) => {
                __VLS_ctx.viewEventDetail(record);
            }
        };
        __VLS_72.slots.default;
        (record.eventName);
        var __VLS_72;
    }
    var __VLS_68;
    const __VLS_77 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        title: "虚拟事件ID",
        dataIndex: "eventId",
        width: (120),
    }));
    const __VLS_79 = __VLS_78({
        title: "虚拟事件ID",
        dataIndex: "eventId",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    const __VLS_81 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        title: "使用场景",
        dataIndex: "scenario",
        width: (120),
    }));
    const __VLS_83 = __VLS_82({
        title: "使用场景",
        dataIndex: "scenario",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    const __VLS_85 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        title: "更新人",
        dataIndex: "updater",
        width: (100),
    }));
    const __VLS_87 = __VLS_86({
        title: "更新人",
        dataIndex: "updater",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    const __VLS_89 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        title: "最近更新时间",
        dataIndex: "updateTime",
        width: (160),
    }));
    const __VLS_91 = __VLS_90({
        title: "最近更新时间",
        dataIndex: "updateTime",
        width: (160),
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_92.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_92.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.updateTime);
    }
    var __VLS_92;
    const __VLS_93 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        title: "状态",
        dataIndex: "status",
        width: (80),
    }));
    const __VLS_95 = __VLS_94({
        title: "状态",
        dataIndex: "status",
        width: (80),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    __VLS_96.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_96.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_97 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
            color: (__VLS_ctx.getStatusColor(record.status)),
            size: "small",
        }));
        const __VLS_99 = __VLS_98({
            color: (__VLS_ctx.getStatusColor(record.status)),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        __VLS_100.slots.default;
        (record.status);
        var __VLS_100;
    }
    var __VLS_96;
    const __VLS_101 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        title: "同步状态",
        dataIndex: "syncStatus",
        width: (100),
    }));
    const __VLS_103 = __VLS_102({
        title: "同步状态",
        dataIndex: "syncStatus",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    __VLS_104.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_104.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_105 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
            color: (__VLS_ctx.getSyncStatusColor(record.syncStatus)),
            size: "small",
        }));
        const __VLS_107 = __VLS_106({
            color: (__VLS_ctx.getSyncStatusColor(record.syncStatus)),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_106));
        __VLS_108.slots.default;
        (__VLS_ctx.getSyncStatusText(record.syncStatus));
        var __VLS_108;
    }
    var __VLS_104;
    const __VLS_109 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        title: "操作",
        width: (180),
        fixed: "right",
    }));
    const __VLS_111 = __VLS_110({
        title: "操作",
        width: (180),
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_112.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_112.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_113 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
            size: "mini",
        }));
        const __VLS_115 = __VLS_114({
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        __VLS_116.slots.default;
        const __VLS_117 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            disabled: (record.syncStatus === 'synced'),
            loading: (__VLS_ctx.syncLoading),
        }));
        const __VLS_119 = __VLS_118({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            disabled: (record.syncStatus === 'synced'),
            loading: (__VLS_ctx.syncLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        let __VLS_121;
        let __VLS_122;
        let __VLS_123;
        const __VLS_124 = {
            onClick: (...[$event]) => {
                __VLS_ctx.syncToEventCenter(record);
            }
        };
        __VLS_120.slots.default;
        var __VLS_120;
        const __VLS_125 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_127 = __VLS_126({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        let __VLS_129;
        let __VLS_130;
        let __VLS_131;
        const __VLS_132 = {
            onClick: (...[$event]) => {
                __VLS_ctx.editEvent(record);
            }
        };
        __VLS_128.slots.default;
        var __VLS_128;
        const __VLS_133 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_135 = __VLS_134({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_137;
        let __VLS_138;
        let __VLS_139;
        const __VLS_140 = {
            onClick: (...[$event]) => {
                __VLS_ctx.copyEvent(record);
            }
        };
        __VLS_136.slots.default;
        var __VLS_136;
        const __VLS_141 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "danger-btn" },
        }));
        const __VLS_143 = __VLS_142({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "danger-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        let __VLS_145;
        let __VLS_146;
        let __VLS_147;
        const __VLS_148 = {
            onClick: (...[$event]) => {
                __VLS_ctx.deleteEvent(record);
            }
        };
        __VLS_144.slots.default;
        var __VLS_144;
        var __VLS_116;
    }
    var __VLS_112;
}
var __VLS_59;
var __VLS_55;
const __VLS_149 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.createModalVisible),
    title: "新建虚拟事件",
    width: "800px",
    okText: "保存",
    cancelText: "取消",
}));
const __VLS_151 = __VLS_150({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.createModalVisible),
    title: "新建虚拟事件",
    width: "800px",
    okText: "保存",
    cancelText: "取消",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
let __VLS_153;
let __VLS_154;
let __VLS_155;
const __VLS_156 = {
    onOk: (__VLS_ctx.saveVirtualEvent)
};
const __VLS_157 = {
    onCancel: (__VLS_ctx.cancelCreate)
};
__VLS_152.slots.default;
const __VLS_158 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    model: (__VLS_ctx.createForm),
    layout: "vertical",
    ...{ class: "create-form" },
}));
const __VLS_160 = __VLS_159({
    model: (__VLS_ctx.createForm),
    layout: "vertical",
    ...{ class: "create-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
const __VLS_162 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    gutter: (16),
}));
const __VLS_164 = __VLS_163({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_165.slots.default;
const __VLS_166 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
    span: (12),
}));
const __VLS_168 = __VLS_167({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_167));
__VLS_169.slots.default;
const __VLS_170 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
    label: "虚拟事件名称",
    required: true,
}));
const __VLS_172 = __VLS_171({
    label: "虚拟事件名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
__VLS_173.slots.default;
const __VLS_174 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    modelValue: (__VLS_ctx.createForm.eventName),
    placeholder: "请输入虚拟事件名称",
    allowClear: true,
}));
const __VLS_176 = __VLS_175({
    modelValue: (__VLS_ctx.createForm.eventName),
    placeholder: "请输入虚拟事件名称",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
var __VLS_173;
var __VLS_169;
const __VLS_178 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
    span: (12),
}));
const __VLS_180 = __VLS_179({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
__VLS_181.slots.default;
const __VLS_182 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
    label: "虚拟事件ID",
    required: true,
}));
const __VLS_184 = __VLS_183({
    label: "虚拟事件ID",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
__VLS_185.slots.default;
const __VLS_186 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
    modelValue: (__VLS_ctx.createForm.eventId),
    placeholder: "请输入虚拟事件ID",
    allowClear: true,
}));
const __VLS_188 = __VLS_187({
    modelValue: (__VLS_ctx.createForm.eventId),
    placeholder: "请输入虚拟事件ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
var __VLS_185;
var __VLS_181;
var __VLS_165;
const __VLS_190 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
    gutter: (16),
}));
const __VLS_192 = __VLS_191({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
__VLS_193.slots.default;
const __VLS_194 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
    span: (12),
}));
const __VLS_196 = __VLS_195({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
__VLS_197.slots.default;
const __VLS_198 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
    label: "使用场景",
    required: true,
}));
const __VLS_200 = __VLS_199({
    label: "使用场景",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
__VLS_201.slots.default;
const __VLS_202 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
    modelValue: (__VLS_ctx.createForm.scenario),
    placeholder: "请选择使用场景",
    allowClear: true,
}));
const __VLS_204 = __VLS_203({
    modelValue: (__VLS_ctx.createForm.scenario),
    placeholder: "请选择使用场景",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_203));
__VLS_205.slots.default;
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.scenarioOptions))) {
    const __VLS_206 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
        key: (option.value),
        value: (option.value),
    }));
    const __VLS_208 = __VLS_207({
        key: (option.value),
        value: (option.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    __VLS_209.slots.default;
    (option.label);
    var __VLS_209;
}
var __VLS_205;
var __VLS_201;
var __VLS_197;
const __VLS_210 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
    span: (12),
}));
const __VLS_212 = __VLS_211({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_211));
__VLS_213.slots.default;
const __VLS_214 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
    label: "描述",
}));
const __VLS_216 = __VLS_215({
    label: "描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_215));
__VLS_217.slots.default;
const __VLS_218 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
    modelValue: (__VLS_ctx.createForm.description),
    placeholder: "请输入描述信息",
    allowClear: true,
}));
const __VLS_220 = __VLS_219({
    modelValue: (__VLS_ctx.createForm.description),
    placeholder: "请输入描述信息",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
var __VLS_217;
var __VLS_213;
var __VLS_193;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_222 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}));
const __VLS_224 = __VLS_223({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_223));
let __VLS_226;
let __VLS_227;
let __VLS_228;
const __VLS_229 = {
    onClick: (__VLS_ctx.addConditionGroup)
};
__VLS_225.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_225.slots;
    const __VLS_230 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({}));
    const __VLS_232 = __VLS_231({}, ...__VLS_functionalComponentArgsRest(__VLS_231));
}
var __VLS_225;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logic-relation-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "relation-label" },
});
const __VLS_234 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
    modelValue: (__VLS_ctx.createForm.logicRelation),
    size: "small",
}));
const __VLS_236 = __VLS_235({
    modelValue: (__VLS_ctx.createForm.logicRelation),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_235));
__VLS_237.slots.default;
const __VLS_238 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
    value: "AND",
}));
const __VLS_240 = __VLS_239({
    value: "AND",
}, ...__VLS_functionalComponentArgsRest(__VLS_239));
__VLS_241.slots.default;
var __VLS_241;
const __VLS_242 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({
    value: "OR",
}));
const __VLS_244 = __VLS_243({
    value: "OR",
}, ...__VLS_functionalComponentArgsRest(__VLS_243));
__VLS_245.slots.default;
var __VLS_245;
var __VLS_237;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "conditions-container" },
});
for (const [group, groupIndex] of __VLS_getVForSourceType((__VLS_ctx.createForm.conditionGroups))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (group.id),
        ...{ class: "condition-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "group-number" },
    });
    (groupIndex + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "group-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-actions" },
    });
    const __VLS_246 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "add-condition-btn" },
    }));
    const __VLS_248 = __VLS_247({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "add-condition-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_247));
    let __VLS_250;
    let __VLS_251;
    let __VLS_252;
    const __VLS_253 = {
        onClick: (...[$event]) => {
            __VLS_ctx.addCondition(groupIndex);
        }
    };
    __VLS_249.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_249.slots;
        const __VLS_254 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({}));
        const __VLS_256 = __VLS_255({}, ...__VLS_functionalComponentArgsRest(__VLS_255));
    }
    var __VLS_249;
    const __VLS_258 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        disabled: (__VLS_ctx.createForm.conditionGroups.length === 1),
        ...{ class: "remove-group-btn" },
    }));
    const __VLS_260 = __VLS_259({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        disabled: (__VLS_ctx.createForm.conditionGroups.length === 1),
        ...{ class: "remove-group-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_259));
    let __VLS_262;
    let __VLS_263;
    let __VLS_264;
    const __VLS_265 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeConditionGroup(groupIndex);
        }
    };
    __VLS_261.slots.default;
    var __VLS_261;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-conditions" },
    });
    for (const [condition, conditionIndex] of __VLS_getVForSourceType((group.conditions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (conditionIndex),
            ...{ class: "condition-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-field" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        const __VLS_266 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
            modelValue: (condition.field),
            placeholder: "APP注册",
            size: "small",
        }));
        const __VLS_268 = __VLS_267({
            modelValue: (condition.field),
            placeholder: "APP注册",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_267));
        __VLS_269.slots.default;
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.fieldOptions))) {
            const __VLS_270 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
                key: (option.value),
                value: (option.value),
            }));
            const __VLS_272 = __VLS_271({
                key: (option.value),
                value: (option.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_271));
            __VLS_273.slots.default;
            (option.label);
            var __VLS_273;
        }
        var __VLS_269;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-operator" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        const __VLS_274 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
            modelValue: (condition.operator),
            placeholder: "身份证号",
            size: "small",
        }));
        const __VLS_276 = __VLS_275({
            modelValue: (condition.operator),
            placeholder: "身份证号",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_275));
        __VLS_277.slots.default;
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.operatorOptions))) {
            const __VLS_278 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({
                key: (option.value),
                value: (option.value),
            }));
            const __VLS_280 = __VLS_279({
                key: (option.value),
                value: (option.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_279));
            __VLS_281.slots.default;
            (option.label);
            var __VLS_281;
        }
        var __VLS_277;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-logic" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        const __VLS_282 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
            modelValue: (condition.logic),
            size: "small",
        }));
        const __VLS_284 = __VLS_283({
            modelValue: (condition.logic),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_283));
        __VLS_285.slots.default;
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.logicOptions))) {
            const __VLS_286 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({
                key: (option.value),
                value: (option.value),
            }));
            const __VLS_288 = __VLS_287({
                key: (option.value),
                value: (option.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_287));
            __VLS_289.slots.default;
            (option.label);
            var __VLS_289;
        }
        var __VLS_285;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-value" },
        });
        const __VLS_290 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({
            modelValue: (condition.value),
            placeholder: "123",
            size: "small",
        }));
        const __VLS_292 = __VLS_291({
            modelValue: (condition.value),
            placeholder: "123",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_291));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-actions" },
        });
        const __VLS_294 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            disabled: (group.conditions.length === 1 && __VLS_ctx.createForm.conditionGroups.length === 1),
            ...{ class: "remove-btn" },
        }));
        const __VLS_296 = __VLS_295({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            disabled: (group.conditions.length === 1 && __VLS_ctx.createForm.conditionGroups.length === 1),
            ...{ class: "remove-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_295));
        let __VLS_298;
        let __VLS_299;
        let __VLS_300;
        const __VLS_301 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeCondition(groupIndex, conditionIndex);
            }
        };
        __VLS_297.slots.default;
        var __VLS_297;
        if (conditionIndex < group.conditions.length - 1) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "condition-connector" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "connector-text" },
            });
        }
    }
    if (groupIndex < __VLS_ctx.createForm.conditionGroups.length - 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "group-connector" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "connector-line" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "connector-text group-connector-text" },
        });
        (__VLS_ctx.createForm.logicRelation === 'AND' ? '且' : '或');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "connector-line" },
        });
    }
}
var __VLS_161;
var __VLS_152;
const __VLS_302 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_303 = __VLS_asFunctionalComponent(__VLS_302, new __VLS_302({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.importModalVisible),
    title: "从事件中心导入事件",
    width: "1000px",
    okText: "导入选中事件",
    cancelText: "取消",
}));
const __VLS_304 = __VLS_303({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.importModalVisible),
    title: "从事件中心导入事件",
    width: "1000px",
    okText: "导入选中事件",
    cancelText: "取消",
}, ...__VLS_functionalComponentArgsRest(__VLS_303));
let __VLS_306;
let __VLS_307;
let __VLS_308;
const __VLS_309 = {
    onOk: (__VLS_ctx.confirmImportEvents)
};
const __VLS_310 = {
    onCancel: (() => { __VLS_ctx.importModalVisible = false; __VLS_ctx.selectedEvents = []; })
};
__VLS_305.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "import-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "import-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "import-description" },
});
const __VLS_311 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({
    data: (__VLS_ctx.eventCenterData),
    loading: (__VLS_ctx.loading),
    pagination: ({
        current: 1,
        pageSize: 10,
        total: __VLS_ctx.eventCenterData.length,
        showTotal: true,
        size: 'small'
    }),
    ...{ class: "import-table" },
    size: "small",
    scroll: ({ x: 800, y: 400 }),
    rowSelection: ({
        type: 'checkbox',
        selectedRowKeys: __VLS_ctx.selectedEvents,
        onSelect: (rowKeys) => { __VLS_ctx.selectedEvents = rowKeys; },
        onSelectAll: (selected, selectedRows, changeRows) => {
            if (selected) {
                __VLS_ctx.selectedEvents = __VLS_ctx.eventCenterData.map(item => item.id);
            }
            else {
                __VLS_ctx.selectedEvents = [];
            }
        }
    }),
}));
const __VLS_313 = __VLS_312({
    data: (__VLS_ctx.eventCenterData),
    loading: (__VLS_ctx.loading),
    pagination: ({
        current: 1,
        pageSize: 10,
        total: __VLS_ctx.eventCenterData.length,
        showTotal: true,
        size: 'small'
    }),
    ...{ class: "import-table" },
    size: "small",
    scroll: ({ x: 800, y: 400 }),
    rowSelection: ({
        type: 'checkbox',
        selectedRowKeys: __VLS_ctx.selectedEvents,
        onSelect: (rowKeys) => { __VLS_ctx.selectedEvents = rowKeys; },
        onSelectAll: (selected, selectedRows, changeRows) => {
            if (selected) {
                __VLS_ctx.selectedEvents = __VLS_ctx.eventCenterData.map(item => item.id);
            }
            else {
                __VLS_ctx.selectedEvents = [];
            }
        }
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_312));
__VLS_314.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_314.slots;
    const __VLS_315 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({
        title: "事件名称",
        dataIndex: "eventName",
        width: (200),
    }));
    const __VLS_317 = __VLS_316({
        title: "事件名称",
        dataIndex: "eventName",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_316));
    const __VLS_319 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_320 = __VLS_asFunctionalComponent(__VLS_319, new __VLS_319({
        title: "事件类型",
        dataIndex: "eventType",
        width: (120),
    }));
    const __VLS_321 = __VLS_320({
        title: "事件类型",
        dataIndex: "eventType",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_320));
    const __VLS_323 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_324 = __VLS_asFunctionalComponent(__VLS_323, new __VLS_323({
        title: "事件来源",
        dataIndex: "eventSource",
        width: (120),
    }));
    const __VLS_325 = __VLS_324({
        title: "事件来源",
        dataIndex: "eventSource",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_324));
    const __VLS_327 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_328 = __VLS_asFunctionalComponent(__VLS_327, new __VLS_327({
        title: "负责人",
        dataIndex: "owner",
        width: (100),
    }));
    const __VLS_329 = __VLS_328({
        title: "负责人",
        dataIndex: "owner",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_328));
    const __VLS_331 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_332 = __VLS_asFunctionalComponent(__VLS_331, new __VLS_331({
        title: "状态",
        dataIndex: "status",
        width: (80),
    }));
    const __VLS_333 = __VLS_332({
        title: "状态",
        dataIndex: "status",
        width: (80),
    }, ...__VLS_functionalComponentArgsRest(__VLS_332));
    __VLS_334.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_334.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_335 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_336 = __VLS_asFunctionalComponent(__VLS_335, new __VLS_335({
            color: (record.status === '上线' ? 'green' : 'red'),
            size: "small",
        }));
        const __VLS_337 = __VLS_336({
            color: (record.status === '上线' ? 'green' : 'red'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_336));
        __VLS_338.slots.default;
        (record.status);
        var __VLS_338;
    }
    var __VLS_334;
    const __VLS_339 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_340 = __VLS_asFunctionalComponent(__VLS_339, new __VLS_339({
        title: "创建时间",
        dataIndex: "createTime",
        width: (160),
    }));
    const __VLS_341 = __VLS_340({
        title: "创建时间",
        dataIndex: "createTime",
        width: (160),
    }, ...__VLS_functionalComponentArgsRest(__VLS_340));
    __VLS_342.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_342.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.createTime);
    }
    var __VLS_342;
}
var __VLS_314;
var __VLS_305;
/** @type {__VLS_StyleScopedClasses['virtual-events']} */ ;
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
/** @type {__VLS_StyleScopedClasses['danger-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['create-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['logic-relation-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['relation-label']} */ ;
/** @type {__VLS_StyleScopedClasses['conditions-container']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-group']} */ ;
/** @type {__VLS_StyleScopedClasses['group-header']} */ ;
/** @type {__VLS_StyleScopedClasses['group-label']} */ ;
/** @type {__VLS_StyleScopedClasses['group-number']} */ ;
/** @type {__VLS_StyleScopedClasses['group-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['group-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['add-condition-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-group-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['group-conditions']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-item']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-row']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-field']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-operator']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-logic']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-value']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['condition-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['connector-text']} */ ;
/** @type {__VLS_StyleScopedClasses['group-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['connector-line']} */ ;
/** @type {__VLS_StyleScopedClasses['connector-text']} */ ;
/** @type {__VLS_StyleScopedClasses['group-connector-text']} */ ;
/** @type {__VLS_StyleScopedClasses['connector-line']} */ ;
/** @type {__VLS_StyleScopedClasses['import-content']} */ ;
/** @type {__VLS_StyleScopedClasses['import-header']} */ ;
/** @type {__VLS_StyleScopedClasses['import-description']} */ ;
/** @type {__VLS_StyleScopedClasses['import-table']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            IconPlus: IconPlus,
            IconSync: IconSync,
            IconImport: IconImport,
            searchForm: searchForm,
            tableData: tableData,
            eventCenterData: eventCenterData,
            importModalVisible: importModalVisible,
            syncLoading: syncLoading,
            selectedEvents: selectedEvents,
            loading: loading,
            pagination: pagination,
            getStatusColor: getStatusColor,
            getSyncStatusColor: getSyncStatusColor,
            getSyncStatusText: getSyncStatusText,
            handleSearch: handleSearch,
            importFromEventCenter: importFromEventCenter,
            syncToEventCenter: syncToEventCenter,
            batchSyncToEventCenter: batchSyncToEventCenter,
            confirmImportEvents: confirmImportEvents,
            createModalVisible: createModalVisible,
            createForm: createForm,
            scenarioOptions: scenarioOptions,
            fieldOptions: fieldOptions,
            operatorOptions: operatorOptions,
            logicOptions: logicOptions,
            showCreateEvent: showCreateEvent,
            addConditionGroup: addConditionGroup,
            addCondition: addCondition,
            removeCondition: removeCondition,
            removeConditionGroup: removeConditionGroup,
            saveVirtualEvent: saveVirtualEvent,
            cancelCreate: cancelCreate,
            viewEventDetail: viewEventDetail,
            editEvent: editEvent,
            copyEvent: copyEvent,
            deleteEvent: deleteEvent,
            onPageChange: onPageChange,
            onPageSizeChange: onPageSizeChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
