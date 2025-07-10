/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, watchEffect } from 'vue';
// defineProps and defineEmits are compiler macros, no import needed
import { Select as ASelect, Option as AOption } from '@arco-design/web-vue';
const props = defineProps();
const emit = defineEmits(['select-collection']);
const selectedCollection = ref(props.initialSelectedCollection);
watchEffect(() => {
    selectedCollection.value = props.initialSelectedCollection;
});
const handleSelect = (value) => {
    selectedCollection.value = value;
    emit('select-collection', value);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.ASelect;
/** @type {[typeof __VLS_components.ASelect, typeof __VLS_components.ASelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCollection),
    placeholder: "请选择集合",
    ...{ style: {} },
    allowClear: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCollection),
    placeholder: "请选择集合",
    ...{ style: {} },
    allowClear: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.handleSelect)
};
__VLS_3.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.collections))) {
    const __VLS_8 = {}.AOption;
    /** @type {[typeof __VLS_components.AOption, typeof __VLS_components.AOption, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (item.value),
        value: (item.value),
        label: (item.label),
    }));
    const __VLS_10 = __VLS_9({
        key: (item.value),
        value: (item.value),
        label: (item.label),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    (item.label);
    var __VLS_11;
}
var __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ASelect: ASelect,
            AOption: AOption,
            selectedCollection: selectedCollection,
            handleSelect: handleSelect,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
