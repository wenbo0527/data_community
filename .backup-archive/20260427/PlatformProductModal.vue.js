import { ref } from 'vue';
import BudgetConsumptionTab from './BudgetConsumptionTab.vue';
import BusinessProcessTab from './BusinessProcessTab.vue';
import { formatAmount } from '@/utils/calculations';
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    platform: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true
    },
    actualLoan: {
        type: Number,
        required: true
    },
    externalDataCost: {
        type: Number,
        required: true
    },
    budgetStatus: {
        type: String,
        required: true,
        default: '超支'
    }
});
const emit = defineEmits(['update:visible']);
const timeRange = ref('month');
const handleTimeRangeChange = (range) => {
    timeRange.value = range;
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.AModal;
/** @type {[typeof __VLS_components.AModal, typeof __VLS_components.aModal, typeof __VLS_components.AModal, typeof __VLS_components.aModal, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:visible': {} },
    visible: (__VLS_ctx.visible),
    title: (`${__VLS_ctx.platform} - 详细数据`),
    width: "1200px",
    footer: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:visible': {} },
    visible: (__VLS_ctx.visible),
    title: (`${__VLS_ctx.platform} - 详细数据`),
    width: "1200px",
    footer: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:visible': ((val) => __VLS_ctx.emit('update:visible', val))
};
const __VLS_8 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-section" },
});
const __VLS_9 = {}.ADescriptions;
/** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    column: (4),
    bordered: true,
}));
const __VLS_11 = __VLS_10({
    column: (4),
    bordered: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    label: "业务类型",
}));
const __VLS_15 = __VLS_14({
    label: "业务类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
(__VLS_ctx.businessType);
let __VLS_16;
const __VLS_17 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    label: "平台产品",
}));
const __VLS_19 = __VLS_18({
    label: "平台产品",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
(__VLS_ctx.platform);
let __VLS_20;
const __VLS_21 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    label: "实际放款",
}));
const __VLS_23 = __VLS_22({
    label: "实际放款",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
(__VLS_ctx.formatAmount(__VLS_ctx.actualLoan));
let __VLS_24;
const __VLS_25 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    label: "实际费用",
}));
const __VLS_27 = __VLS_26({
    label: "实际费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
(__VLS_ctx.formatAmount(__VLS_ctx.externalDataCost));
let __VLS_28;
const __VLS_29 = {}.ADescriptionsItem;
/** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    label: "预算状态",
}));
const __VLS_31 = __VLS_30({
    label: "预算状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_32.slots.default;
(__VLS_ctx.budgetStatus);
let __VLS_32;
let __VLS_12;
const __VLS_33 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    type: "rounded",
    ...{ class: "tabs-section" },
}));
const __VLS_35 = __VLS_34({
    type: "rounded",
    ...{ class: "tabs-section" },
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
const __VLS_37 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    key: "budget",
    title: "预算消耗对比",
}));
const __VLS_39 = __VLS_38({
    key: "budget",
    title: "预算消耗对比",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
/** @type {[typeof BudgetConsumptionTab, ]} */ 
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(BudgetConsumptionTab, new BudgetConsumptionTab({
    ...{ 'onTimeRangeChange': {} },
    platform: (__VLS_ctx.platform),
    businessType: (__VLS_ctx.businessType),
    timeRange: (__VLS_ctx.timeRange),
}));
const __VLS_42 = __VLS_41({
    ...{ 'onTimeRangeChange': {} },
    platform: (__VLS_ctx.platform),
    businessType: (__VLS_ctx.businessType),
    timeRange: (__VLS_ctx.timeRange),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onTimeRangeChange: (__VLS_ctx.handleTimeRangeChange)
};
let __VLS_43;
let __VLS_40;
const __VLS_48 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    key: "process",
    title: "业务过程比对",
}));
const __VLS_50 = __VLS_49({
    key: "process",
    title: "业务过程比对",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
/** @type {[typeof BusinessProcessTab, ]} */ 
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(BusinessProcessTab, new BusinessProcessTab({
    ...{ 'onTimeRangeChange': {} },
    platform: (__VLS_ctx.platform),
    businessType: (__VLS_ctx.businessType),
    timeRange: (__VLS_ctx.timeRange),
}));
const __VLS_53 = __VLS_52({
    ...{ 'onTimeRangeChange': {} },
    platform: (__VLS_ctx.platform),
    businessType: (__VLS_ctx.businessType),
    timeRange: (__VLS_ctx.timeRange),
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
let __VLS_55;
let __VLS_56;
let __VLS_57;
const __VLS_58 = {
    onTimeRangeChange: (__VLS_ctx.handleTimeRangeChange)
};
let __VLS_54;
let __VLS_51;
let __VLS_36;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['modal-container']} */ 
/** @type {__VLS_StyleScopedClasses['summary-section']} */ 
/** @type {__VLS_StyleScopedClasses['tabs-section']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BudgetConsumptionTab: BudgetConsumptionTab,
            BusinessProcessTab: BusinessProcessTab,
            formatAmount: formatAmount,
            emit: emit,
            timeRange: timeRange,
            handleTimeRangeChange: handleTimeRangeChange,
        };
    },
    emits: {},
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        platform: {
            type: String,
            required: true
        },
        businessType: {
            type: String,
            required: true
        },
        actualLoan: {
            type: Number,
            required: true
        },
        externalDataCost: {
            type: Number,
            required: true
        },
        budgetStatus: {
            type: String,
            required: true,
            default: '超支'
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        platform: {
            type: String,
            required: true
        },
        businessType: {
            type: String,
            required: true
        },
        actualLoan: {
            type: Number,
            required: true
        },
        externalDataCost: {
            type: Number,
            required: true
        },
        budgetStatus: {
            type: String,
            required: true,
            default: '超支'
        }
    },
});
 /* PartiallyEnd: #4569/main.vue */
