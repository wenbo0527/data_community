/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconArrowLeft, IconRight, IconDownload, IconRefresh, IconUser, IconStorage, IconSafe } from '@arco-design/web-vue/es/icon';
import { fetchUserInfo } from '../../../mock/customer360';
import { formatAmount, formatPercent } from '../../../utils/calculations';
import BasicInfo from './components/BasicInfo.vue';
import ProductInfo from './components/ProductInfo.vue';
import CreditList from './components/CreditList.vue';
import LoanList from './components/LoanList.vue';
import AdjustmentHistory from './components/AdjustmentHistory.vue';
// 基础响应式变量
const route = useRoute();
const router = useRouter();
const userInfo = ref(null);
const loading = ref(true);
// activeTab 已移除，改为垂直展示
const selectedProduct = ref('');
const selectedProductType = ref('全部产品');
// 产品选项
const productOptions = ref([
    { label: '全部产品', value: '全部产品' },
    { label: '自营产品', value: '自营产品' },
    { label: '助贷产品', value: '助贷产品' }
]);
// 获取用户ID
const userId = computed(() => {
    console.log('📍 详情页获取用户ID，route.params:', route.params);
    console.log('📍 详情页获取用户ID，route.query:', route.query);
    return route.params.userId || route.query.userId;
});
// 计算属性
const creditUtilizationRate = computed(() => {
    if (!userInfo.value)
        return 0;
    const { totalCredit, usedCredit } = userInfo.value;
    return totalCredit > 0 ? (usedCredit / totalCredit * 100).toFixed(2) : 0;
});
const totalAssets = computed(() => {
    if (!userInfo.value)
        return 0;
    const depositTotal = userInfo.value.depositProducts?.reduce((sum, product) => sum + product.balance, 0) || 0;
    return depositTotal;
});
const totalLiabilities = computed(() => {
    if (!userInfo.value)
        return 0;
    const loanTotal = userInfo.value.loanProducts?.reduce((sum, product) => sum + product.balance, 0) || 0;
    return loanTotal;
});
const riskLevel = computed(() => {
    if (!userInfo.value)
        return '未知';
    const { currentOverdueDays, repaymentRate } = userInfo.value;
    if (currentOverdueDays > 90)
        return '高风险';
    if (currentOverdueDays > 30)
        return '中风险';
    if (repaymentRate < 80)
        return '中风险';
    return '低风险';
});
// 获取用户数据
const fetchData = async () => {
    console.log('🔥🔥🔥 fetchData函数被调用了！');
    console.log('📊 详情页开始获取数据');
    const currentUserId = userId.value;
    console.log('📊 当前用户ID:', currentUserId);
    if (!currentUserId) {
        console.log('❌ 缺少用户ID参数，准备跳转回首页');
        Message.error('缺少用户ID参数');
        router.push('/discovery/customer360');
        return;
    }
    console.log('⏳ 详情页设置loading状态为true');
    loading.value = true;
    try {
        console.log('📡 详情页开始调用fetchUserInfo API，用户ID:', currentUserId);
        const data = await fetchUserInfo(currentUserId);
        console.log('📡 详情页API响应结果:', data);
        if (data.error) {
            console.log('❌ 详情页API返回错误:', data.message);
            Message.error(data.message || '查询失败');
            return;
        }
        console.log('✅ 详情页数据获取成功，设置userInfo');
        userInfo.value = data;
        console.log('📊 详情页获取到的用户信息:', userInfo.value);
    }
    catch (error) {
        console.error('❌ 详情页获取用户信息失败:', error);
        console.error('❌ 详情页错误详情:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        Message.error('获取用户信息失败');
    }
    finally {
        console.log('🔄 详情页设置loading状态为false');
        loading.value = false;
    }
};
const goBack = () => {
    router.push('/discovery/customer360');
};
const exportData = () => {
    if (!userInfo.value)
        return;
    Message.success('导出功能开发中...');
};
// 处理产品切换
const handleProductChange = (value) => {
    console.log('产品切换:', value);
    selectedProductType.value = value;
    // 这里可以根据选择的产品类型过滤显示的数据
    Message.info(`已切换到: ${value}`);
};
// 监听路由变化
watch(() => userId.value, (newUserId, oldUserId) => {
    console.log('🔄 路由userId变化:', { oldUserId, newUserId });
    if (newUserId && newUserId !== oldUserId) {
        console.log('🔄 检测到userId变化，重新获取数据');
        fetchData();
    }
});
// 同时监听params和query的变化
watch(() => [route.params.userId, route.query.userId], ([newParamsId, newQueryId], [oldParamsId, oldQueryId]) => {
    console.log('🔄 路由参数变化:', {
        params: { old: oldParamsId, new: newParamsId },
        query: { old: oldQueryId, new: newQueryId }
    });
});
onMounted(() => {
    console.log('🚀 详情页组件已挂载，开始获取数据');
    console.log('🚀 挂载时的路由信息:', {
        params: route.params,
        query: route.query,
        path: route.path,
        name: route.name
    });
    // 默认选中第一个产品
    if (productOptions.value.length > 0) {
        selectedProductType.value = productOptions.value[0].value;
    }
    console.log('🚀 准备调用fetchData函数');
    try {
        fetchData();
        console.log('🚀 fetchData函数调用成功');
    }
    catch (error) {
        console.error('🚀 fetchData函数调用失败:', error);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['arco-tabs-header-title-text']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['customer-detail-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tabs-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "customer-detail-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
const __VLS_0 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: "back-button" },
    type: "text",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "back-button" },
    type: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.goBack)
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.IconArrowLeft;
    /** @type {[typeof __VLS_components.IconArrowLeft, typeof __VLS_components.iconArrowLeft, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "breadcrumb" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_12 = {}.IconRight;
/** @type {[typeof __VLS_components.IconRight, typeof __VLS_components.iconRight, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-right" },
});
const __VLS_16 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "outline",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.exportData)
};
__VLS_19.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_24 = {}.IconDownload;
    /** @type {[typeof __VLS_components.IconDownload, typeof __VLS_components.iconDownload, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_19;
const __VLS_28 = {}.AButton;
/** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onClick: (__VLS_ctx.fetchData)
};
__VLS_31.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_31.slots;
    const __VLS_36 = {}.IconRefresh;
    /** @type {[typeof __VLS_components.IconRefresh, typeof __VLS_components.iconRefresh, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
var __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "product-tabs-container" },
});
const __VLS_40 = {}.ATabs;
/** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onChange': {} },
    activeKey: (__VLS_ctx.selectedProductType),
    type: "line",
    ...{ class: "product-tabs" },
}));
const __VLS_42 = __VLS_41({
    ...{ 'onChange': {} },
    activeKey: (__VLS_ctx.selectedProductType),
    type: "line",
    ...{ class: "product-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onChange: (__VLS_ctx.handleProductChange)
};
__VLS_43.slots.default;
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.productOptions))) {
    const __VLS_48 = {}.ATabPane;
    /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        key: (option.value),
        title: (option.label),
    }));
    const __VLS_50 = __VLS_49({
        key: (option.value),
        title: (option.label),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
var __VLS_43;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-container" },
    });
    const __VLS_52 = {}.ASpin;
    /** @type {[typeof __VLS_components.ASpin, typeof __VLS_components.aSpin, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        size: "large",
        tip: "正在加载客户信息...",
    }));
    const __VLS_54 = __VLS_53({
        size: "large",
        tip: "正在加载客户信息...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
}
else if (__VLS_ctx.userInfo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-sections" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    /** @type {[typeof BasicInfo, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(BasicInfo, new BasicInfo({
        userInfo: (__VLS_ctx.userInfo),
    }));
    const __VLS_57 = __VLS_56({
        userInfo: (__VLS_ctx.userInfo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    /** @type {[typeof ProductInfo, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(ProductInfo, new ProductInfo({
        userInfo: (__VLS_ctx.userInfo),
        selectedProduct: (__VLS_ctx.selectedProduct),
    }));
    const __VLS_60 = __VLS_59({
        userInfo: (__VLS_ctx.userInfo),
        selectedProduct: (__VLS_ctx.selectedProduct),
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    /** @type {[typeof CreditList, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(CreditList, new CreditList({
        credits: (__VLS_ctx.userInfo.creditsList),
        key: (`credits-${__VLS_ctx.userId}-${__VLS_ctx.userInfo.creditsList?.length || 0}`),
    }));
    const __VLS_63 = __VLS_62({
        credits: (__VLS_ctx.userInfo.creditsList),
        key: (`credits-${__VLS_ctx.userId}-${__VLS_ctx.userInfo.creditsList?.length || 0}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    /** @type {[typeof LoanList, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(LoanList, new LoanList({
        loans: (__VLS_ctx.userInfo.loanRecords),
        key: (`loans-${__VLS_ctx.userId}-${__VLS_ctx.userInfo.loanRecords?.length || 0}`),
    }));
    const __VLS_66 = __VLS_65({
        loans: (__VLS_ctx.userInfo.loanRecords),
        key: (`loans-${__VLS_ctx.userId}-${__VLS_ctx.userInfo.loanRecords?.length || 0}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    /** @type {[typeof AdjustmentHistory, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(AdjustmentHistory, new AdjustmentHistory({
        history: (__VLS_ctx.userInfo.quotaAdjustHistory),
        key: (`history-${__VLS_ctx.userId}-${__VLS_ctx.userInfo.quotaAdjustHistory?.length || 0}`),
    }));
    const __VLS_69 = __VLS_68({
        history: (__VLS_ctx.userInfo.quotaAdjustHistory),
        key: (`history-${__VLS_ctx.userId}-${__VLS_ctx.userInfo.quotaAdjustHistory?.length || 0}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-container" },
    });
    const __VLS_71 = {}.AResult;
    /** @type {[typeof __VLS_components.AResult, typeof __VLS_components.aResult, typeof __VLS_components.AResult, typeof __VLS_components.aResult, ]} */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
        status: "404",
        title: "未找到用户信息",
    }));
    const __VLS_73 = __VLS_72({
        status: "404",
        title: "未找到用户信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    __VLS_74.slots.default;
    {
        const { subtitle: __VLS_thisSlot } = __VLS_74.slots;
    }
    {
        const { extra: __VLS_thisSlot } = __VLS_74.slots;
        const __VLS_75 = {}.AButton;
        /** @type {[typeof __VLS_components.AButton, typeof __VLS_components.aButton, typeof __VLS_components.AButton, typeof __VLS_components.aButton, ]} */ ;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_77 = __VLS_76({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        let __VLS_79;
        let __VLS_80;
        let __VLS_81;
        const __VLS_82 = {
            onClick: (__VLS_ctx.goBack)
        };
        __VLS_78.slots.default;
        var __VLS_78;
    }
    var __VLS_74;
}
/** @type {__VLS_StyleScopedClasses['customer-detail-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tabs-container']} */ ;
/** @type {__VLS_StyleScopedClasses['product-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-container']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-sections']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['error-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            IconArrowLeft: IconArrowLeft,
            IconRight: IconRight,
            IconDownload: IconDownload,
            IconRefresh: IconRefresh,
            BasicInfo: BasicInfo,
            ProductInfo: ProductInfo,
            CreditList: CreditList,
            LoanList: LoanList,
            AdjustmentHistory: AdjustmentHistory,
            userInfo: userInfo,
            loading: loading,
            selectedProduct: selectedProduct,
            selectedProductType: selectedProductType,
            productOptions: productOptions,
            userId: userId,
            fetchData: fetchData,
            goBack: goBack,
            exportData: exportData,
            handleProductChange: handleProductChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
