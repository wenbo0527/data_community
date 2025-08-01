/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch } from 'vue';
import { Table as ATable, Button as AButton, Space as ASpace, Popover as APopover, Checkbox as ACheckbox, CheckboxGroup as ACheckboxGroup, Radio as ARadio, RadioGroup as ARadioGroup, IconRefresh, IconSettings, IconMenu } from '@arco-design/web-vue';
import { arcoConfig } from '@/utils/arco';
export default (await import('vue')).defineComponent({
    name: 'BaseTable',
    components: {
        ATable,
        AButton,
        ASpace,
        APopover,
        ACheckbox,
        ACheckboxGroup,
        ARadio,
        ARadioGroup,
        IconRefresh,
        IconSettings,
        IconMenu
    },
    props: {
        // 表格数据
        data: {
            type: Array,
            default: () => []
        },
        // 表格列配置
        columns: {
            type: Array,
            default: () => []
        },
        // 加载状态
        loading: {
            type: Boolean,
            default: false
        },
        // 分页配置
        pagination: {
            type: [Object, Boolean],
            default: () => ({})
        },
        // 表格大小
        size: {
            type: String,
            default: 'medium',
            validator: (value) => ['small', 'medium', 'large'].includes(value)
        },
        // 滚动配置
        scroll: {
            type: Object,
            default: () => ({})
        },
        // 行选择配置
        rowSelection: {
            type: Object,
            default: null
        },
        // 展开配置
        expandable: {
            type: Object,
            default: null
        },
        // 是否显示工具栏
        showToolbar: {
            type: Boolean,
            default: true
        },
        // 是否显示刷新按钮
        showRefresh: {
            type: Boolean,
            default: true
        },
        // 是否显示列设置
        showColumnSetting: {
            type: Boolean,
            default: true
        },
        // 是否显示密度设置
        showDensitySetting: {
            type: Boolean,
            default: true
        },
        // 其他表格属性
        tableProps: {
            type: Object,
            default: () => ({})
        }
    },
    emits: [
        'refresh',
        'page-change',
        'page-size-change',
        'sorter-change',
        'filter-change',
        'selection-change',
        'expand',
        'row-click',
        'row-dblclick',
        'cell-click'
    ],
    setup(props, { emit }) {
        // 当前表格大小
        const currentSize = ref(props.size);
        // 可见列
        const visibleColumns = ref([]);
        // 可设置的列（排除操作列等）
        const settableColumns = computed(() => {
            return props.columns.filter(col => col.dataIndex &&
                !col.fixed &&
                col.title !== '操作');
        });
        // 计算后的列配置
        const computedColumns = computed(() => {
            if (visibleColumns.value.length === 0) {
                return props.columns;
            }
            return props.columns.filter(col => {
                // 保留操作列、固定列和选中的列
                return !col.dataIndex ||
                    col.fixed ||
                    col.title === '操作' ||
                    visibleColumns.value.includes(col.dataIndex);
            });
        });
        // 计算后的分页配置
        const computedPagination = computed(() => {
            if (props.pagination === false) {
                return false;
            }
            return {
                ...arcoConfig.table.pagination,
                ...props.pagination
            };
        });
        // 初始化可见列
        watch(() => props.columns, (newColumns) => {
            if (visibleColumns.value.length === 0) {
                visibleColumns.value = settableColumns.value.map(col => col.dataIndex);
            }
        }, { immediate: true });
        // 事件处理
        const handleRefresh = () => {
            emit('refresh');
        };
        const handlePageChange = (page) => {
            emit('page-change', page);
        };
        const handlePageSizeChange = (pageSize) => {
            emit('page-size-change', pageSize);
        };
        const handleSorterChange = (dataIndex, direction) => {
            emit('sorter-change', dataIndex, direction);
        };
        const handleFilterChange = (dataIndex, filteredValues) => {
            emit('filter-change', dataIndex, filteredValues);
        };
        const handleSelectionChange = (rowKeys, rowRecords) => {
            emit('selection-change', rowKeys, rowRecords);
        };
        const handleExpand = (rowKey, record) => {
            emit('expand', rowKey, record);
        };
        const handleRowClick = (record, ev) => {
            emit('row-click', record, ev);
        };
        const handleRowDblclick = (record, ev) => {
            emit('row-dblclick', record, ev);
        };
        const handleCellClick = (record, column, ev) => {
            emit('cell-click', record, column, ev);
        };
        return {
            currentSize,
            visibleColumns,
            settableColumns,
            computedColumns,
            computedPagination,
            handleRefresh,
            handlePageChange,
            handlePageSizeChange,
            handleSorterChange,
            handleFilterChange,
            handleSelectionChange,
            handleExpand,
            handleRowClick,
            handleRowDblclick,
            handleCellClick
        };
    }
});
const __VLS_ctx = {};
const __VLS_componentsOption = {
    ATable,
    AButton,
    ASpace,
    APopover,
    ACheckbox,
    ACheckboxGroup,
    ARadio,
    ARadioGroup,
    IconRefresh,
    IconSettings,
    IconMenu
};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['column-setting']} */ ;
/** @type {__VLS_StyleScopedClasses['column-setting']} */ ;
/** @type {__VLS_StyleScopedClasses['density-setting']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "base-table-container" },
});
if (__VLS_ctx.showToolbar) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-toolbar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toolbar-left" },
    });
    var __VLS_0 = {};
    const __VLS_2 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(__VLS_2, new __VLS_2({}));
    const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
    __VLS_5.slots.default;
    if (__VLS_ctx.showRefresh) {
        const __VLS_6 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
            ...{ 'onClick': {} },
            loading: (__VLS_ctx.loading),
        }));
        const __VLS_8 = __VLS_7({
            ...{ 'onClick': {} },
            loading: (__VLS_ctx.loading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        let __VLS_10;
        let __VLS_11;
        let __VLS_12;
        const __VLS_13 = {
            onClick: (__VLS_ctx.handleRefresh)
        };
        __VLS_9.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_9.slots;
            const __VLS_14 = {}.IconRefresh;
            /** @type {[typeof __VLS_components.IconRefresh, typeof __VLS_components.iconRefresh, ]} */ ;
            // @ts-ignore
            const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
            const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
        }
        var __VLS_9;
    }
    var __VLS_18 = {};
    var __VLS_5;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toolbar-right" },
    });
    var __VLS_20 = {};
    const __VLS_22 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({}));
    const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_25.slots.default;
    if (__VLS_ctx.showColumnSetting) {
        const __VLS_26 = {}.APopover;
        /** @type {[typeof __VLS_components.APopover, typeof __VLS_components.aPopover, typeof __VLS_components.APopover, typeof __VLS_components.aPopover, ]} */ ;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
            trigger: "click",
            position: "bottom",
        }));
        const __VLS_28 = __VLS_27({
            trigger: "click",
            position: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        __VLS_29.slots.default;
        const __VLS_30 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({}));
        const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
        __VLS_33.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_33.slots;
            const __VLS_34 = {}.IconSettings;
            /** @type {[typeof __VLS_components.IconSettings, typeof __VLS_components.iconSettings, ]} */ ;
            // @ts-ignore
            const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({}));
            const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
        }
        var __VLS_33;
        {
            const { content: __VLS_thisSlot } = __VLS_29.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "column-setting" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "setting-title" },
            });
            const __VLS_38 = {}.ACheckboxGroup;
            /** @type {[typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, typeof __VLS_components.ACheckboxGroup, typeof __VLS_components.aCheckboxGroup, ]} */ ;
            // @ts-ignore
            const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
                modelValue: (__VLS_ctx.visibleColumns),
                direction: "vertical",
            }));
            const __VLS_40 = __VLS_39({
                modelValue: (__VLS_ctx.visibleColumns),
                direction: "vertical",
            }, ...__VLS_functionalComponentArgsRest(__VLS_39));
            __VLS_41.slots.default;
            for (const [col] of __VLS_getVForSourceType((__VLS_ctx.settableColumns))) {
                const __VLS_42 = {}.ACheckbox;
                /** @type {[typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, typeof __VLS_components.ACheckbox, typeof __VLS_components.aCheckbox, ]} */ ;
                // @ts-ignore
                const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
                    key: (col.dataIndex || col.key),
                    value: (col.dataIndex || col.key),
                }));
                const __VLS_44 = __VLS_43({
                    key: (col.dataIndex || col.key),
                    value: (col.dataIndex || col.key),
                }, ...__VLS_functionalComponentArgsRest(__VLS_43));
                __VLS_45.slots.default;
                (col.title);
                var __VLS_45;
            }
            var __VLS_41;
        }
        var __VLS_29;
    }
    if (__VLS_ctx.showDensitySetting) {
        const __VLS_46 = {}.APopover;
        /** @type {[typeof __VLS_components.APopover, typeof __VLS_components.aPopover, typeof __VLS_components.APopover, typeof __VLS_components.aPopover, ]} */ ;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
            trigger: "click",
            position: "bottom",
        }));
        const __VLS_48 = __VLS_47({
            trigger: "click",
            position: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        __VLS_49.slots.default;
        const __VLS_50 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({}));
        const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
        __VLS_53.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_53.slots;
            const __VLS_54 = {}.IconMenu;
            /** @type {[typeof __VLS_components.IconMenu, typeof __VLS_components.iconMenu, ]} */ ;
            // @ts-ignore
            const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({}));
            const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
        }
        var __VLS_53;
        {
            const { content: __VLS_thisSlot } = __VLS_49.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "density-setting" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "setting-title" },
            });
            const __VLS_58 = {}.ARadioGroup;
            /** @type {[typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, typeof __VLS_components.ARadioGroup, typeof __VLS_components.aRadioGroup, ]} */ ;
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
                modelValue: (__VLS_ctx.currentSize),
                direction: "vertical",
            }));
            const __VLS_60 = __VLS_59({
                modelValue: (__VLS_ctx.currentSize),
                direction: "vertical",
            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            __VLS_61.slots.default;
            const __VLS_62 = {}.ARadio;
            /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
                value: "small",
            }));
            const __VLS_64 = __VLS_63({
                value: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            __VLS_65.slots.default;
            var __VLS_65;
            const __VLS_66 = {}.ARadio;
            /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
            // @ts-ignore
            const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
                value: "medium",
            }));
            const __VLS_68 = __VLS_67({
                value: "medium",
            }, ...__VLS_functionalComponentArgsRest(__VLS_67));
            __VLS_69.slots.default;
            var __VLS_69;
            const __VLS_70 = {}.ARadio;
            /** @type {[typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, typeof __VLS_components.ARadio, typeof __VLS_components.aRadio, ]} */ ;
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
                value: "large",
            }));
            const __VLS_72 = __VLS_71({
                value: "large",
            }, ...__VLS_functionalComponentArgsRest(__VLS_71));
            __VLS_73.slots.default;
            var __VLS_73;
            var __VLS_61;
        }
        var __VLS_49;
    }
    var __VLS_25;
}
const __VLS_74 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    ...{ 'onSorterChange': {} },
    ...{ 'onFilterChange': {} },
    ...{ 'onSelectionChange': {} },
    ...{ 'onExpand': {} },
    ...{ 'onRowClick': {} },
    ...{ 'onRowDblclick': {} },
    ...{ 'onCellClick': {} },
    ...(__VLS_ctx.tableProps),
    columns: (__VLS_ctx.computedColumns),
    data: (__VLS_ctx.data),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.computedPagination),
    size: (__VLS_ctx.currentSize),
    scroll: (__VLS_ctx.scroll),
    rowSelection: (__VLS_ctx.rowSelection),
    expandable: (__VLS_ctx.expandable),
}));
const __VLS_76 = __VLS_75({
    ...{ 'onPageChange': {} },
    ...{ 'onPageSizeChange': {} },
    ...{ 'onSorterChange': {} },
    ...{ 'onFilterChange': {} },
    ...{ 'onSelectionChange': {} },
    ...{ 'onExpand': {} },
    ...{ 'onRowClick': {} },
    ...{ 'onRowDblclick': {} },
    ...{ 'onCellClick': {} },
    ...(__VLS_ctx.tableProps),
    columns: (__VLS_ctx.computedColumns),
    data: (__VLS_ctx.data),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.computedPagination),
    size: (__VLS_ctx.currentSize),
    scroll: (__VLS_ctx.scroll),
    rowSelection: (__VLS_ctx.rowSelection),
    expandable: (__VLS_ctx.expandable),
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
let __VLS_78;
let __VLS_79;
let __VLS_80;
const __VLS_81 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
const __VLS_82 = {
    onPageSizeChange: (__VLS_ctx.handlePageSizeChange)
};
const __VLS_83 = {
    onSorterChange: (__VLS_ctx.handleSorterChange)
};
const __VLS_84 = {
    onFilterChange: (__VLS_ctx.handleFilterChange)
};
const __VLS_85 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
const __VLS_86 = {
    onExpand: (__VLS_ctx.handleExpand)
};
const __VLS_87 = {
    onRowClick: (__VLS_ctx.handleRowClick)
};
const __VLS_88 = {
    onRowDblclick: (__VLS_ctx.handleRowDblclick)
};
const __VLS_89 = {
    onCellClick: (__VLS_ctx.handleCellClick)
};
__VLS_77.slots.default;
for (const [_, name] of __VLS_getVForSourceType((__VLS_ctx.$slots))) {
    {
        const { [__VLS_tryAsConstant(name)]: __VLS_thisSlot } = __VLS_77.slots;
        const [slotData] = __VLS_getSlotParams(__VLS_thisSlot);
        var __VLS_90 = {
            ...(slotData),
        };
        var __VLS_91 = __VLS_tryAsConstant(name);
    }
}
var __VLS_77;
/** @type {__VLS_StyleScopedClasses['base-table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-left']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-right']} */ ;
/** @type {__VLS_StyleScopedClasses['column-setting']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['density-setting']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0, __VLS_19 = __VLS_18, __VLS_21 = __VLS_20, __VLS_92 = __VLS_91, __VLS_93 = __VLS_90;
var __VLS_dollars;
let __VLS_self;
