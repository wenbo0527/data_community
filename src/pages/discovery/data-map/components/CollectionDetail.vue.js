/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { useRouter } from 'vue-router';
const getTypeColor = (type) => {
    // 类型颜色匹配逻辑
    return '#1890ff';
};
// defineProps and defineEmits are compiler macros, no import needed
import IconTable from '@arco-design/web-vue/es/icon';
const props = defineProps();
const emit = defineEmits();
const showTableDetail = (table) => {
    const router = useRouter();
    router.push({
        name: 'TableDetail',
        params: { tableName: table.name },
        state: { table }
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "collection-detail" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "collection-info" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "collection-info" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ATypographyTitle;
/** @type {[typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    heading: (4),
}));
const __VLS_6 = __VLS_5({
    heading: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
(__VLS_ctx.collection.name);
var __VLS_7;
const __VLS_8 = {}.ATypographyParagraph;
/** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
(__VLS_ctx.collection.description);
var __VLS_11;
var __VLS_3;
const __VLS_12 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ class: "table-list" },
}));
const __VLS_14 = __VLS_13({
    ...{ class: "table-list" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_15.slots;
    const __VLS_16 = {}.ASpace;
    /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.IconTable;
    /** @type {[typeof __VLS_components.IconTable, typeof __VLS_components.iconTable, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    (__VLS_ctx.collection.tables.length);
    var __VLS_19;
}
const __VLS_24 = {}.ARow;
/** @type {[typeof __VLS_components.ARow, typeof __VLS_components.aRow, typeof __VLS_components.ARow, typeof __VLS_components.aRow, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    gutter: ([16, 16]),
}));
const __VLS_26 = __VLS_25({
    gutter: ([16, 16]),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
for (const [table] of __VLS_getVForSourceType((__VLS_ctx.collection.tables))) {
    const __VLS_28 = {}.ACol;
    /** @type {[typeof __VLS_components.ACol, typeof __VLS_components.aCol, typeof __VLS_components.ACol, typeof __VLS_components.aCol, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (table.name),
        span: (8),
    }));
    const __VLS_30 = __VLS_29({
        key: (table.name),
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    const __VLS_32 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        ...{ class: "table-card" },
        hoverable: true,
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        ...{ class: "table-card" },
        hoverable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showTableDetail(table);
        }
    };
    __VLS_35.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_35.slots;
        const __VLS_40 = {}.ASpace;
        /** @type {[typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, typeof __VLS_components.ASpace, typeof __VLS_components.aSpace, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            align: "center",
        }));
        const __VLS_42 = __VLS_41({
            align: "center",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        const __VLS_44 = {}.IconTable;
        /** @type {[typeof __VLS_components.IconTable, typeof __VLS_components.iconTable, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        const __VLS_48 = {}.ATypographyTitle;
        /** @type {[typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, typeof __VLS_components.ATypographyTitle, typeof __VLS_components.aTypographyTitle, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            heading: (6),
            ...{ style: {} },
        }));
        const __VLS_50 = __VLS_49({
            heading: (6),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        (table.name);
        var __VLS_51;
        var __VLS_43;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-info" },
    });
    const __VLS_52 = {}.ATag;
    /** @type {[typeof __VLS_components.ATag, typeof __VLS_components.aTag, typeof __VLS_components.ATag, typeof __VLS_components.aTag, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        color: (__VLS_ctx.getTypeColor(table.type)),
    }));
    const __VLS_54 = __VLS_53({
        color: (__VLS_ctx.getTypeColor(table.type)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    (table.type);
    var __VLS_55;
    const __VLS_56 = {}.ATypographyParagraph;
    /** @type {[typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, typeof __VLS_components.ATypographyParagraph, typeof __VLS_components.aTypographyParagraph, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ellipsis: ({ rows: 2 }),
        type: "secondary",
        ...{ class: "table-description" },
    }));
    const __VLS_58 = __VLS_57({
        ellipsis: ({ rows: 2 }),
        type: "secondary",
        ...{ class: "table-description" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    (table.description);
    var __VLS_59;
    var __VLS_35;
    var __VLS_31;
}
var __VLS_27;
var __VLS_15;
/** @type {__VLS_StyleScopedClasses['collection-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['collection-info']} */ ;
/** @type {__VLS_StyleScopedClasses['table-list']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-info']} */ ;
/** @type {__VLS_StyleScopedClasses['table-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getTypeColor: getTypeColor,
            IconTable: IconTable,
            showTableDetail: showTableDetail,
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
; /* PartiallyEnd: #4569/main.vue */
