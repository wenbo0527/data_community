/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed } from 'vue';
const props = defineProps();
const tableDetailData = computed(() => {
    if (!props.table)
        return [];
    return [
        { label: '表名', value: props.table.name },
        { label: '表类型', value: props.table.type },
        { label: '所属目录', value: props.table.category },
        { label: '业务域', value: props.table.domain },
        { label: '更新频率', value: props.table.updateFrequency },
        { label: '负责人', value: props.table.owner },
        { label: '描述', value: props.table.description }
    ];
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-detail-page" },
});
const __VLS_0 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    column: (1),
    data: (__VLS_ctx.tableDetailData),
    bordered: true,
    ...{ class: "table-descriptions" },
}));
const __VLS_2 = __VLS_1({
    column: (1),
    data: (__VLS_ctx.tableDetailData),
    bordered: true,
    ...{ class: "table-descriptions" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.ADivider;
/** @type {[typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, typeof __VLS_components.ADivider, typeof __VLS_components.aDivider, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    orientation: "left",
}));
const __VLS_6 = __VLS_5({
    orientation: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
const __VLS_8 = {}.ATable;
/** @type {[typeof __VLS_components.ATable, typeof __VLS_components.aTable, typeof __VLS_components.ATable, typeof __VLS_components.aTable, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    data: (props.table.fields),
    pagination: (false),
    bordered: (true),
    stripe: (true),
    rowClass: (() => 'table-row-hover'),
}));
const __VLS_10 = __VLS_9({
    data: (props.table.fields),
    pagination: (false),
    bordered: (true),
    stripe: (true),
    rowClass: (() => 'table-row-hover'),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
{
    const { columns: __VLS_thisSlot } = __VLS_11.slots;
    const __VLS_12 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        title: "字段名",
        dataIndex: "name",
    }));
    const __VLS_14 = __VLS_13({
        title: "字段名",
        dataIndex: "name",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_16 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        title: "类型",
        dataIndex: "type",
    }));
    const __VLS_18 = __VLS_17({
        title: "类型",
        dataIndex: "type",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    {
        const { cell: __VLS_thisSlot } = __VLS_19.slots;
        const [{ record }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_20 = {}.ATag;
        /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        (record.type);
        var __VLS_23;
    }
    var __VLS_19;
    const __VLS_24 = {}.ATableColumn;
    /** @type {[typeof __VLS_components.ATableColumn, typeof __VLS_components.aTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        title: "描述",
        dataIndex: "description",
    }));
    const __VLS_26 = __VLS_25({
        title: "描述",
        dataIndex: "description",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['table-detail-page']} */ ;
/** @type {__VLS_StyleScopedClasses['table-descriptions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            tableDetailData: tableDetailData,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
