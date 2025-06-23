/// <reference types="../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, reactive, computed } from 'vue';
// 表单数据
const formModel = reactive({
    maId: '',
    taskId: '',
    executeDate: null
});
// 表格数据
const tableData = ref([
    {
        taskId: 'STR20230515001',
        taskName: '风控策略A-实时任务',
        maId: 'MA001',
        executeTime: '2023-05-15',
        status: '成功'
    },
    {
        taskId: 'STR20230515002',
        taskName: '风控策略B-批量任务',
        maId: 'MA002',
        executeTime: '2023-05-15',
        status: '失败'
    },
    {
        taskId: 'STR20230515003',
        taskName: '风控策略C-实时任务',
        maId: 'MA003',
        executeTime: '2023-05-15',
        status: '处理中'
    }
]);
// 分页配置
const pagination = reactive({
    total: 100,
    current: 1,
    pageSize: 10
});
// 获取状态颜色
const getStatusColor = (status) => {
    const colorMap = {
        '成功': 'green',
        '失败': 'red',
        '处理中': 'blue'
    };
    return colorMap[status] || 'gray';
};
// 处理搜索
const handleSearch = () => {
    console.log('搜索条件:', formModel);
    // 实现搜索逻辑
};
// 处理分页
const onPageChange = (page) => {
    pagination.current = page;
    // 实现分页逻辑
};
// 显示失败详情
const showFailDetail = (record) => {
    console.log('失败详情:', record);
    // 实现失败详情展示逻辑
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "touch-home" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-overview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metrics-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "unit" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "unit" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "unit" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "unit" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "unit" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "task-detail" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-form" },
});
const __VLS_0 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    model: (__VLS_ctx.formModel),
    layout: "inline",
}));
const __VLS_2 = __VLS_1({
    model: (__VLS_ctx.formModel),
    layout: "inline",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    field: "maId",
    label: "MA任务ID",
}));
const __VLS_6 = __VLS_5({
    field: "maId",
    label: "MA任务ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.formModel.maId),
    placeholder: "请输入MA任务ID",
    allowClear: true,
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.formModel.maId),
    placeholder: "请输入MA任务ID",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
var __VLS_7;
const __VLS_12 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    field: "taskId",
    label: "任务执行批次",
}));
const __VLS_14 = __VLS_13({
    field: "taskId",
    label: "任务执行批次",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.formModel.taskId),
    placeholder: "请输入任务执行批次",
    allowClear: true,
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.formModel.taskId),
    placeholder: "请输入任务执行批次",
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
var __VLS_15;
const __VLS_20 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    field: "executeDate",
    label: "选择执行日期",
}));
const __VLS_22 = __VLS_21({
    field: "executeDate",
    label: "选择执行日期",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ADatePicker;
/** @type {[typeof __VLS_components.ADatePicker, typeof __VLS_components.aDatePicker, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.formModel.executeDate),
    allowClear: true,
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.formModel.executeDate),
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_23;
const __VLS_28 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_35.slots.default;
var __VLS_35;
var __VLS_31;
var __VLS_3;
const __VLS_40 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onPageChange': {} },
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
}));
const __VLS_42 = __VLS_41({
    ...{ 'onPageChange': {} },
    data: (__VLS_ctx.tableData),
    pagination: (__VLS_ctx.pagination),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onPageChange: (__VLS_ctx.onPageChange)
};
__VLS_43.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_43.slots;
    const __VLS_48 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        title: "策略ID",
        dataIndex: "taskId",
        width: (150),
    }));
    const __VLS_50 = __VLS_49({
        title: "策略ID",
        dataIndex: "taskId",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const __VLS_52 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        title: "MA任务名称",
        dataIndex: "taskName",
        width: (200),
    }));
    const __VLS_54 = __VLS_53({
        title: "MA任务名称",
        dataIndex: "taskName",
        width: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const __VLS_56 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        title: "MA任务ID",
        dataIndex: "maId",
        width: (120),
    }));
    const __VLS_58 = __VLS_57({
        title: "MA任务ID",
        dataIndex: "maId",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const __VLS_60 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        title: "任务执行批次",
        dataIndex: "executeTime",
        width: (150),
    }));
    const __VLS_62 = __VLS_61({
        title: "任务执行批次",
        dataIndex: "executeTime",
        width: (150),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    const __VLS_64 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        title: "状态",
        dataIndex: "status",
        width: (100),
    }));
    const __VLS_66 = __VLS_65({
        title: "状态",
        dataIndex: "status",
        width: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_67.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_68 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            color: (__VLS_ctx.getStatusColor(record.status)),
        }));
        const __VLS_70 = __VLS_69({
            color: (__VLS_ctx.getStatusColor(record.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        (record.status);
        var __VLS_71;
    }
    var __VLS_67;
    const __VLS_72 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        title: "操作",
        width: (120),
    }));
    const __VLS_74 = __VLS_73({
        title: "操作",
        width: (120),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_75.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (record.status === '失败') {
            const __VLS_76 = {}.AButton;
            /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                ...{ 'onClick': {} },
                type: "text",
            }));
            const __VLS_78 = __VLS_77({
                ...{ 'onClick': {} },
                type: "text",
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            let __VLS_80;
            let __VLS_81;
            let __VLS_82;
            const __VLS_83 = {
                onClick: (...[$event]) => {
                    if (!(record.status === '失败'))
                        return;
                    __VLS_ctx.showFailDetail(record);
                }
            };
            __VLS_79.slots.default;
            var __VLS_79;
        }
    }
    var __VLS_75;
}
var __VLS_43;
/** @type {__VLS_StyleScopedClasses['touch-home']} */ ;
/** @type {__VLS_StyleScopedClasses['data-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['metrics-container']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-item']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-item']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-item']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-item']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-item']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['task-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formModel: formModel,
            tableData: tableData,
            pagination: pagination,
            getStatusColor: getStatusColor,
            handleSearch: handleSearch,
            onPageChange: onPageChange,
            showFailDetail: showFailDetail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
