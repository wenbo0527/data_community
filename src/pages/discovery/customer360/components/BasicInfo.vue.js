/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, watch } from 'vue';
const props = defineProps({
    userInfo: {
        type: Object,
        default: () => null
    }
});
// 监听props变化，记录数据变化情况
watch(() => props.userInfo, (newVal) => {
    console.debug('[BasicInfo] userInfo数据变化:', {
        timestamp: Date.now(),
        hasData: !!newVal,
        hasError: newVal?.error,
        dataKeys: newVal ? Object.keys(newVal) : [],
        basicInfoFields: newVal ? {
            hasName: 'name' in newVal,
            nameValue: newVal.name,
            hasAge: 'age' in newVal,
            ageValue: newVal.age,
            hasGender: 'gender' in newVal,
            genderValue: newVal.gender,
            hasMobile: 'mobile' in newVal,
            mobileValue: newVal.mobile,
            hasCustomerNo: 'customerNo' in newVal,
            customerNoValue: newVal.customerNo,
            hasAddress: 'address' in newVal,
            addressValue: newVal.address,
            hasIdCard: 'idCard' in newVal,
            idCardValue: newVal.idCard,
            hasIdExpiry: 'idExpiry' in newVal,
            idExpiryValue: newVal.idExpiry,
            hasStatus: 'status' in newVal,
            statusValue: newVal.status,
            hasSimilarity: 'similarity' in newVal,
            similarityValue: newVal.similarity,
            hasThreshold: 'threshold' in newVal,
            thresholdValue: newVal.threshold,
            hasErrorMsg: 'errorMsg' in newVal,
            errorMsgValue: newVal.errorMsg
        } : null
    });
}, { immediate: true, deep: true });
onMounted(() => {
    console.debug('[BasicInfo] 组件挂载完成，初始数据:', {
        timestamp: Date.now(),
        hasUserInfo: !!props.userInfo,
        userInfoError: props.userInfo?.error
    });
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basic-info" },
});
if (!__VLS_ctx.userInfo) {
    const __VLS_0 = {}.ASkeleton;
    /** @type {[typeof __VLS_components.ASkeleton, typeof __VLS_components.aSkeleton, ]} */ 
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        loading: (true),
    }));
    const __VLS_2 = __VLS_1({
        loading: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    const __VLS_4 = {}.ADescriptions;
    /** @type {[typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, typeof __VLS_components.ADescriptions, typeof __VLS_components.aDescriptions, ]} */ 
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        column: ({ xs: 1, sm: 2, md: 3 }),
        size: "small",
    }));
    const __VLS_6 = __VLS_5({
        column: ({ xs: 1, sm: 2, md: 3 }),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        label: "姓名",
    }));
    const __VLS_10 = __VLS_9({
        label: "姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    (__VLS_ctx.userInfo.name);
    let __VLS_11;
    const __VLS_12 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        label: "年龄",
    }));
    const __VLS_14 = __VLS_13({
        label: "年龄",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.userInfo.age);
    let __VLS_15;
    const __VLS_16 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        label: "性别",
    }));
    const __VLS_18 = __VLS_17({
        label: "性别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    (__VLS_ctx.userInfo.gender);
    let __VLS_19;
    const __VLS_20 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        label: "手机号码",
    }));
    const __VLS_22 = __VLS_21({
        label: "手机号码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    (__VLS_ctx.userInfo.mobile);
    let __VLS_23;
    const __VLS_24 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        label: "客户号",
    }));
    const __VLS_26 = __VLS_25({
        label: "客户号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    (__VLS_ctx.userInfo.customerNo);
    let __VLS_27;
    const __VLS_28 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        label: "户籍",
    }));
    const __VLS_30 = __VLS_29({
        label: "户籍",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    (__VLS_ctx.userInfo.address);
    let __VLS_31;
    const __VLS_32 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        label: "身份证号",
    }));
    const __VLS_34 = __VLS_33({
        label: "身份证号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    (__VLS_ctx.userInfo.idCard);
    let __VLS_35;
    const __VLS_36 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        label: "身份证有效期",
    }));
    const __VLS_38 = __VLS_37({
        label: "身份证有效期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    (__VLS_ctx.userInfo.idExpiry);
    let __VLS_39;
    const __VLS_40 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        label: "用户状态",
    }));
    const __VLS_42 = __VLS_41({
        label: "用户状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    (__VLS_ctx.userInfo.status);
    let __VLS_43;
    const __VLS_44 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        label: "活体相似度",
    }));
    const __VLS_46 = __VLS_45({
        label: "活体相似度",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    (__VLS_ctx.userInfo.similarity);
    let __VLS_47;
    const __VLS_48 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        label: "相似度阈值",
    }));
    const __VLS_50 = __VLS_49({
        label: "相似度阈值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    (__VLS_ctx.userInfo.threshold);
    let __VLS_51;
    const __VLS_52 = {}.ADescriptionsItem;
    /** @type {[typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, typeof __VLS_components.ADescriptionsItem, typeof __VLS_components.aDescriptionsItem, ]} */ 
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        label: "错误信息",
    }));
    const __VLS_54 = __VLS_53({
        label: "错误信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    (__VLS_ctx.userInfo.errorMsg);
    let __VLS_55;
    let __VLS_7;
}
/** @type {__VLS_StyleScopedClasses['basic-info']} */ 
let __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
        };
    },
});
 /* PartiallyEnd: #4569/main.vue */
