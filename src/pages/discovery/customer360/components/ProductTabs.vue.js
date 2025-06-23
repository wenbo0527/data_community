/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref } from 'vue';
const __VLS_props = defineProps({
    products: {
        type: Array,
        default: () => []
    },
    loading: Boolean
});
const activeKey = ref('deposit');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "product-tabs" },
});
const __VLS_0 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    activeKey: (__VLS_ctx.activeKey),
}));
const __VLS_2 = __VLS_1({
    activeKey: (__VLS_ctx.activeKey),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
for (const [product] of __VLS_getVForSourceType((__VLS_ctx.products))) {
    const __VLS_4 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        key: (product.key),
        tab: (`${product.name} (${product.count})`),
    }));
    const __VLS_6 = __VLS_5({
        key: (product.key),
        tab: (`${product.name} (${product.count})`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.AList;
    /** @type {[typeof __VLS_components.AList, typeof __VLS_components.aList, typeof __VLS_components.AList, typeof __VLS_components.aList, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        itemLayout: "horizontal",
        dataSource: (product.list),
    }));
    const __VLS_10 = __VLS_9({
        itemLayout: "horizontal",
        dataSource: (product.list),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    {
        const { renderItem: __VLS_thisSlot } = __VLS_11.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_12 = {}.AListItem;
        /** @type {[typeof __VLS_components.AListItem, typeof __VLS_components.aListItem, typeof __VLS_components.AListItem, typeof __VLS_components.aListItem, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        const __VLS_16 = {}.AListItemMeta;
        /** @type {[typeof __VLS_components.AListItemMeta, typeof __VLS_components.aListItemMeta, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            description: (item.description),
        }));
        const __VLS_18 = __VLS_17({
            description: (item.description),
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        var __VLS_15;
    }
    var __VLS_11;
    var __VLS_7;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['product-tabs']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(__VLS_props),
            ...__VLS_props,
            activeKey: activeKey,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(__VLS_props),
            ...__VLS_props,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
