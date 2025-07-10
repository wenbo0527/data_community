/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon';
// 搜索表单
const searchForm = reactive({
    eventName: ''
});
// 表格数据
const tableData = ref([
    {
        id: 1,
        eventName: 'API注册成功事件',
        eventId: '12345678',
        scenario: '营销触达',
        updater: '张三',
        updateTime: '2024-08-13 12:32:21',
        status: '已上线'
    },
    {
        id: 2,
        eventName: 'APP关键业务事件',
        eventId: '12345678',
        scenario: '营销触达',
        updater: '张三',
        updateTime: '2024-08-13 12:32:21',
        status: '已上线'
    },
    {
        id: 3,
        eventName: '评估未来收益',
        eventId: '12345678',
        scenario: '营销触达',
        updater: '李四',
        updateTime: '2024-08-13 12:32:21',
        status: '已下线'
    },
    {
        id: 4,
        eventName: '评估未来收益',
        eventId: '12345678',
        scenario: '营销触达',
        updater: '李四',
        updateTime: '2024-08-13 12:32:21',
        status: '已下线'
    }
]);
// 加载状态
const loading = ref(false);
// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 25,
    showTotal: true,
    showPageSize: true
});
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
// 搜索处理
const handleSearch = () => {
    console.log('搜索:', searchForm.eventName);
    // 这里添加搜索逻辑
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
        id: tableData.value.length + 1,
        eventName: createForm.eventName,
        eventId: createForm.eventId,
        scenario: createForm.scenario,
        updater: '当前用户',
        updateTime: new Date().toLocaleString('zh-CN'),
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
    // 初始化数据
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        title: "虚拟事件名称",
        dataIndex: "eventName",
        width: (200),
    }));
    const __VLS_43 = __VLS_42({
        title: "虚拟事件名称",
        dataIndex: "eventName",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_44.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_45 = {}.ALink;
        /** @type {[typeof __VLS_components.ALink, typeof __VLS_components.aLink, typeof __VLS_components.ALink, typeof __VLS_components.aLink, ]} */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
            ...{ 'onClick': {} },
        }));
        const __VLS_47 = __VLS_46({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        let __VLS_49;
        let __VLS_50;
        let __VLS_51;
        const __VLS_52 = {
            onClick: (...[$event]) => {
                __VLS_ctx.viewEventDetail(record);
            }
        };
        __VLS_48.slots.default;
        (record.eventName);
        var __VLS_48;
    }
    var __VLS_44;
    const __VLS_53 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        title: "虚拟事件ID",
        dataIndex: "eventId",
        width: (120),
    }));
    const __VLS_55 = __VLS_54({
        title: "虚拟事件ID",
        dataIndex: "eventId",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const __VLS_57 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        title: "使用场景",
        dataIndex: "scenario",
        width: (120),
    }));
    const __VLS_59 = __VLS_58({
        title: "使用场景",
        dataIndex: "scenario",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const __VLS_61 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        title: "更新人",
        dataIndex: "updater",
        width: (100),
    }));
    const __VLS_63 = __VLS_62({
        title: "更新人",
        dataIndex: "updater",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const __VLS_65 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        title: "最近更新时间",
        dataIndex: "updateTime",
        width: (160),
    }));
    const __VLS_67 = __VLS_66({
        title: "最近更新时间",
        dataIndex: "updateTime",
        width: (160),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_68.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (record.updateTime);
    }
    var __VLS_68;
    const __VLS_69 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        title: "状态",
        dataIndex: "status",
        width: (80),
    }));
    const __VLS_71 = __VLS_70({
        title: "状态",
        dataIndex: "status",
        width: (80),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_72.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_73 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            color: (__VLS_ctx.getStatusColor(record.status)),
            size: "small",
        }));
        const __VLS_75 = __VLS_74({
            color: (__VLS_ctx.getStatusColor(record.status)),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        __VLS_76.slots.default;
        (record.status);
        var __VLS_76;
    }
    var __VLS_72;
    const __VLS_77 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        title: "操作",
        width: (120),
        fixed: "right",
    }));
    const __VLS_79 = __VLS_78({
        title: "操作",
        width: (120),
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
                __VLS_ctx.editEvent(record);
            }
        };
        __VLS_88.slots.default;
        var __VLS_88;
        const __VLS_93 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }));
        const __VLS_95 = __VLS_94({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        let __VLS_97;
        let __VLS_98;
        let __VLS_99;
        const __VLS_100 = {
            onClick: (...[$event]) => {
                __VLS_ctx.copyEvent(record);
            }
        };
        __VLS_96.slots.default;
        var __VLS_96;
        const __VLS_101 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "danger-btn" },
        }));
        const __VLS_103 = __VLS_102({
            ...{ 'onClick': {} },
            type: "text",
            size: "mini",
            ...{ class: "danger-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        let __VLS_105;
        let __VLS_106;
        let __VLS_107;
        const __VLS_108 = {
            onClick: (...[$event]) => {
                __VLS_ctx.deleteEvent(record);
            }
        };
        __VLS_104.slots.default;
        var __VLS_104;
        var __VLS_84;
    }
    var __VLS_80;
}
var __VLS_35;
var __VLS_31;
const __VLS_109 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.createModalVisible),
    title: "新建虚拟事件",
    width: "800px",
    okText: "保存",
    cancelText: "取消",
}));
const __VLS_111 = __VLS_110({
    ...{ 'onOk': {} },
    ...{ 'onCancel': {} },
    visible: (__VLS_ctx.createModalVisible),
    title: "新建虚拟事件",
    width: "800px",
    okText: "保存",
    cancelText: "取消",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_113;
let __VLS_114;
let __VLS_115;
const __VLS_116 = {
    onOk: (__VLS_ctx.saveVirtualEvent)
};
const __VLS_117 = {
    onCancel: (__VLS_ctx.cancelCreate)
};
__VLS_112.slots.default;
const __VLS_118 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    model: (__VLS_ctx.createForm),
    layout: "vertical",
    ...{ class: "create-form" },
}));
const __VLS_120 = __VLS_119({
    model: (__VLS_ctx.createForm),
    layout: "vertical",
    ...{ class: "create-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
const __VLS_122 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    gutter: (16),
}));
const __VLS_124 = __VLS_123({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
const __VLS_126 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    span: (12),
}));
const __VLS_128 = __VLS_127({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
__VLS_129.slots.default;
const __VLS_130 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
    label: "虚拟事件名称",
    required: true,
}));
const __VLS_132 = __VLS_131({
    label: "虚拟事件名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
__VLS_133.slots.default;
const __VLS_134 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
    modelValue: (__VLS_ctx.createForm.eventName),
    placeholder: "请输入虚拟事件名称",
    allowClear: true,
}));
const __VLS_136 = __VLS_135({
    modelValue: (__VLS_ctx.createForm.eventName),
    placeholder: "请输入虚拟事件名称",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
var __VLS_133;
var __VLS_129;
const __VLS_138 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    span: (12),
}));
const __VLS_140 = __VLS_139({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
__VLS_141.slots.default;
const __VLS_142 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    label: "虚拟事件ID",
    required: true,
}));
const __VLS_144 = __VLS_143({
    label: "虚拟事件ID",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
__VLS_145.slots.default;
const __VLS_146 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    modelValue: (__VLS_ctx.createForm.eventId),
    placeholder: "请输入虚拟事件ID",
    allowClear: true,
}));
const __VLS_148 = __VLS_147({
    modelValue: (__VLS_ctx.createForm.eventId),
    placeholder: "请输入虚拟事件ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
var __VLS_145;
var __VLS_141;
var __VLS_125;
const __VLS_150 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    gutter: (16),
}));
const __VLS_152 = __VLS_151({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
const __VLS_154 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    span: (12),
}));
const __VLS_156 = __VLS_155({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
const __VLS_158 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    label: "使用场景",
    required: true,
}));
const __VLS_160 = __VLS_159({
    label: "使用场景",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
const __VLS_162 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    modelValue: (__VLS_ctx.createForm.scenario),
    placeholder: "请选择使用场景",
    allowClear: true,
}));
const __VLS_164 = __VLS_163({
    modelValue: (__VLS_ctx.createForm.scenario),
    placeholder: "请选择使用场景",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_165.slots.default;
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.scenarioOptions))) {
    const __VLS_166 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        key: (option.value),
        value: (option.value),
    }));
    const __VLS_168 = __VLS_167({
        key: (option.value),
        value: (option.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    __VLS_169.slots.default;
    (option.label);
    var __VLS_169;
}
var __VLS_165;
var __VLS_161;
var __VLS_157;
const __VLS_170 = {}.ACol;
/** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
    span: (12),
}));
const __VLS_172 = __VLS_171({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
__VLS_173.slots.default;
const __VLS_174 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    label: "描述",
}));
const __VLS_176 = __VLS_175({
    label: "描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
__VLS_177.slots.default;
const __VLS_178 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
    modelValue: (__VLS_ctx.createForm.description),
    placeholder: "请输入描述信息",
    allowClear: true,
}));
const __VLS_180 = __VLS_179({
    modelValue: (__VLS_ctx.createForm.description),
    placeholder: "请输入描述信息",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
var __VLS_177;
var __VLS_173;
var __VLS_153;
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
const __VLS_182 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}));
const __VLS_184 = __VLS_183({
    ...{ 'onClick': {} },
    type: "outline",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
let __VLS_186;
let __VLS_187;
let __VLS_188;
const __VLS_189 = {
    onClick: (__VLS_ctx.addConditionGroup)
};
__VLS_185.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_185.slots;
    const __VLS_190 = {}.IconPlus;
    /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({}));
    const __VLS_192 = __VLS_191({}, ...__VLS_functionalComponentArgsRest(__VLS_191));
}
var __VLS_185;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logic-relation-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "relation-label" },
});
const __VLS_194 = {}.ARadioGroup;
/** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
    modelValue: (__VLS_ctx.createForm.logicRelation),
    size: "small",
}));
const __VLS_196 = __VLS_195({
    modelValue: (__VLS_ctx.createForm.logicRelation),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
__VLS_197.slots.default;
const __VLS_198 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
    value: "AND",
}));
const __VLS_200 = __VLS_199({
    value: "AND",
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
__VLS_201.slots.default;
var __VLS_201;
const __VLS_202 = {}.ARadio;
/** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
// @ts-ignore
const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
    value: "OR",
}));
const __VLS_204 = __VLS_203({
    value: "OR",
}, ...__VLS_functionalComponentArgsRest(__VLS_203));
__VLS_205.slots.default;
var __VLS_205;
var __VLS_197;
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
    const __VLS_206 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "add-condition-btn" },
    }));
    const __VLS_208 = __VLS_207({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        ...{ class: "add-condition-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    let __VLS_210;
    let __VLS_211;
    let __VLS_212;
    const __VLS_213 = {
        onClick: (...[$event]) => {
            __VLS_ctx.addCondition(groupIndex);
        }
    };
    __VLS_209.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_209.slots;
        const __VLS_214 = {}.IconPlus;
        /** @type {[typeof __VLS_components.IconPlus, typeof __VLS_components.iconPlus, ]} */ ;
        // @ts-ignore
        const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({}));
        const __VLS_216 = __VLS_215({}, ...__VLS_functionalComponentArgsRest(__VLS_215));
    }
    var __VLS_209;
    const __VLS_218 = {}.AButton;
    /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        disabled: (__VLS_ctx.createForm.conditionGroups.length === 1),
        ...{ class: "remove-group-btn" },
    }));
    const __VLS_220 = __VLS_219({
        ...{ 'onClick': {} },
        type: "text",
        size: "small",
        disabled: (__VLS_ctx.createForm.conditionGroups.length === 1),
        ...{ class: "remove-group-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    let __VLS_222;
    let __VLS_223;
    let __VLS_224;
    const __VLS_225 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeConditionGroup(groupIndex);
        }
    };
    __VLS_221.slots.default;
    var __VLS_221;
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
        const __VLS_226 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
            modelValue: (condition.field),
            placeholder: "APP注册",
            size: "small",
        }));
        const __VLS_228 = __VLS_227({
            modelValue: (condition.field),
            placeholder: "APP注册",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_227));
        __VLS_229.slots.default;
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.fieldOptions))) {
            const __VLS_230 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
                key: (option.value),
                value: (option.value),
            }));
            const __VLS_232 = __VLS_231({
                key: (option.value),
                value: (option.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_231));
            __VLS_233.slots.default;
            (option.label);
            var __VLS_233;
        }
        var __VLS_229;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-operator" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        const __VLS_234 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
            modelValue: (condition.operator),
            placeholder: "身份证号",
            size: "small",
        }));
        const __VLS_236 = __VLS_235({
            modelValue: (condition.operator),
            placeholder: "身份证号",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_235));
        __VLS_237.slots.default;
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.operatorOptions))) {
            const __VLS_238 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
                key: (option.value),
                value: (option.value),
            }));
            const __VLS_240 = __VLS_239({
                key: (option.value),
                value: (option.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_239));
            __VLS_241.slots.default;
            (option.label);
            var __VLS_241;
        }
        var __VLS_237;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-logic" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        const __VLS_242 = {}.ASelect;
        /** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, typeof __VLS_components.ASelect, typeof __VLS_components.aSelect, ]} */ ;
        // @ts-ignore
        const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({
            modelValue: (condition.logic),
            size: "small",
        }));
        const __VLS_244 = __VLS_243({
            modelValue: (condition.logic),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_243));
        __VLS_245.slots.default;
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.logicOptions))) {
            const __VLS_246 = {}.AOption;
            /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.aOption, typeof __VLS_components.AOption, typeof __VLS_components.aOption, ]} */ ;
            // @ts-ignore
            const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
                key: (option.value),
                value: (option.value),
            }));
            const __VLS_248 = __VLS_247({
                key: (option.value),
                value: (option.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_247));
            __VLS_249.slots.default;
            (option.label);
            var __VLS_249;
        }
        var __VLS_245;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-value" },
        });
        const __VLS_250 = {}.AInput;
        /** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
        // @ts-ignore
        const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({
            modelValue: (condition.value),
            placeholder: "123",
            size: "small",
        }));
        const __VLS_252 = __VLS_251({
            modelValue: (condition.value),
            placeholder: "123",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_251));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "condition-actions" },
        });
        const __VLS_254 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            disabled: (group.conditions.length === 1 && __VLS_ctx.createForm.conditionGroups.length === 1),
            ...{ class: "remove-btn" },
        }));
        const __VLS_256 = __VLS_255({
            ...{ 'onClick': {} },
            type: "text",
            size: "small",
            disabled: (group.conditions.length === 1 && __VLS_ctx.createForm.conditionGroups.length === 1),
            ...{ class: "remove-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_255));
        let __VLS_258;
        let __VLS_259;
        let __VLS_260;
        const __VLS_261 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeCondition(groupIndex, conditionIndex);
            }
        };
        __VLS_257.slots.default;
        var __VLS_257;
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
var __VLS_121;
var __VLS_112;
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
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconSearch: IconSearch,
            IconPlus: IconPlus,
            searchForm: searchForm,
            tableData: tableData,
            loading: loading,
            pagination: pagination,
            getStatusColor: getStatusColor,
            handleSearch: handleSearch,
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
