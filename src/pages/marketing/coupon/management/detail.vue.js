import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IconLeft } from '@arco-design/web-vue/es/icon';
import TemplateDetail from '../template/detail.vue';
const route = useRoute();
const router = useRouter();
const templateId = ref('');
const instanceFormData = ref({
    name: '',
    totalCount: 0,
    validity: [],
    rules: '',
    dailyLimit: 0,
    weeklyLimit: 0,
    monthlyLimit: 0
});
onMounted(() => {
    // TODO: 根据路由参数获取券实例ID，调用API获取数据
    // 这里假设从路由参数中获取templateId和instanceId
    templateId.value = route.query.templateId || '';
    // 模拟获取实例数据
    instanceFormData.value = {
        name: '测试券',
        totalCount: 1000,
        validity: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)],
        rules: '使用规则说明',
        dailyLimit: 100,
        weeklyLimit: 500,
        monthlyLimit: 2000
    };
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coupon-detail-container" },
});
const __VLS_0 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ 
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "form-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "form-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
const __VLS_4 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ 
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    type: "outline",
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    type: "outline",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.back();
    }
};
__VLS_7.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_7.slots;
    const __VLS_12 = {}.IconLeft;
    /** @type {[typeof __VLS_components.IconLeft, typeof __VLS_components.iconLeft, ]} */ 
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
let __VLS_7;
const __VLS_16 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ 
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    key: "template",
    title: "模板参数",
}));
const __VLS_22 = __VLS_21({
    key: "template",
    title: "模板参数",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
/** @type {[typeof TemplateDetail, ]} */ 
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(TemplateDetail, new TemplateDetail({
    id: (__VLS_ctx.templateId),
    readonly: (true),
    disableOperations: true,
}));
const __VLS_25 = __VLS_24({
    id: (__VLS_ctx.templateId),
    readonly: (true),
    disableOperations: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_23;
const __VLS_27 = {}.ATabPane;
/** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ 
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    key: "instance",
    title: "库存参数",
}));
const __VLS_29 = __VLS_28({
    key: "instance",
    title: "库存参数",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
const __VLS_31 = {}.AForm;
/** @type {[typeof __VLS_components.AForm, typeof __VLS_components.aForm, typeof __VLS_components.AForm, typeof __VLS_components.aForm, ]} */ 
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    model: (__VLS_ctx.instanceFormData),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '800px' }) },
    disabled: true,
}));
const __VLS_33 = __VLS_32({
    model: (__VLS_ctx.instanceFormData),
    layout: "vertical",
    ...{ style: ({ width: '100%', maxWidth: '800px' }) },
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
__VLS_34.slots.default;
const __VLS_35 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    field: "name",
    label: "券名称",
}));
const __VLS_37 = __VLS_36({
    field: "name",
    label: "券名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_38.slots.default;
const __VLS_39 = {}.AInput;
/** @type {[typeof __VLS_components.AInput, typeof __VLS_components.aInput, ]} */ 
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    modelValue: (__VLS_ctx.instanceFormData.name),
}));
const __VLS_41 = __VLS_40({
    modelValue: (__VLS_ctx.instanceFormData.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_38;
const __VLS_43 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    field: "totalCount",
    label: "发放数量",
}));
const __VLS_45 = __VLS_44({
    field: "totalCount",
    label: "发放数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
const __VLS_47 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    modelValue: (__VLS_ctx.instanceFormData.totalCount),
}));
const __VLS_49 = __VLS_48({
    modelValue: (__VLS_ctx.instanceFormData.totalCount),
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
let __VLS_46;
const __VLS_51 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
    field: "validity",
    label: "有效期",
}));
const __VLS_53 = __VLS_52({
    field: "validity",
    label: "有效期",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
__VLS_54.slots.default;
const __VLS_55 = {}.ARangePicker;
/** @type {[typeof __VLS_components.ARangePicker, typeof __VLS_components.aRangePicker, ]} */ 
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    modelValue: (__VLS_ctx.instanceFormData.validity),
    ...{ style: {} },
}));
const __VLS_57 = __VLS_56({
    modelValue: (__VLS_ctx.instanceFormData.validity),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
let __VLS_54;
const __VLS_59 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    field: "rules",
    label: "使用规则",
}));
const __VLS_61 = __VLS_60({
    field: "rules",
    label: "使用规则",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_62.slots.default;
const __VLS_63 = {}.ATextarea;
/** @type {[typeof __VLS_components.ATextarea, typeof __VLS_components.aTextarea, ]} */ 
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    modelValue: (__VLS_ctx.instanceFormData.rules),
}));
const __VLS_65 = __VLS_64({
    modelValue: (__VLS_ctx.instanceFormData.rules),
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_62;
const __VLS_67 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    field: "dailyLimit",
    label: "单日发放上限",
}));
const __VLS_69 = __VLS_68({
    field: "dailyLimit",
    label: "单日发放上限",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
__VLS_70.slots.default;
const __VLS_71 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    modelValue: (__VLS_ctx.instanceFormData.dailyLimit),
}));
const __VLS_73 = __VLS_72({
    modelValue: (__VLS_ctx.instanceFormData.dailyLimit),
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_70;
const __VLS_75 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
    field: "weeklyLimit",
    label: "单周发放上限",
}));
const __VLS_77 = __VLS_76({
    field: "weeklyLimit",
    label: "单周发放上限",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
__VLS_78.slots.default;
const __VLS_79 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    modelValue: (__VLS_ctx.instanceFormData.weeklyLimit),
}));
const __VLS_81 = __VLS_80({
    modelValue: (__VLS_ctx.instanceFormData.weeklyLimit),
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
let __VLS_78;
const __VLS_83 = {}.AFormItem;
/** @type {[typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, typeof __VLS_components.AFormItem, typeof __VLS_components.aFormItem, ]} */ 
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
    field: "monthlyLimit",
    label: "单月发放上限",
}));
const __VLS_85 = __VLS_84({
    field: "monthlyLimit",
    label: "单月发放上限",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
__VLS_86.slots.default;
const __VLS_87 = {}.AInputNumber;
/** @type {[typeof __VLS_components.AInputNumber, typeof __VLS_components.aInputNumber, ]} */ 
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    modelValue: (__VLS_ctx.instanceFormData.monthlyLimit),
}));
const __VLS_89 = __VLS_88({
    modelValue: (__VLS_ctx.instanceFormData.monthlyLimit),
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
let __VLS_86;
let __VLS_34;
let __VLS_30;
let __VLS_19;
let __VLS_3;
/** @type {__VLS_StyleScopedClasses['coupon-detail-container']} */ 
/** @type {__VLS_StyleScopedClasses['form-card']} */ 
/** @type {__VLS_StyleScopedClasses['page-header']} */ 
/** @type {__VLS_StyleScopedClasses['page-title']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconLeft: IconLeft,
            TemplateDetail: TemplateDetail,
            router: router,
            templateId: templateId,
            instanceFormData: instanceFormData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
