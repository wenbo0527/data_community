/// <reference types="../../../../node_modules/.vue-global-types/vue_3.3_0_0_0.d.ts" />
import { ref, computed, watch, watchEffect, onMounted } from 'vue';
import { IconUser, IconHistory } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { useRoute, useRouter } from 'vue-router';
import BasicInfo from './components/BasicInfo.vue';
import ProductInfo from './components/ProductInfo.vue';
import CreditList from './components/CreditList.vue';
import LoanList from './components/LoanList.vue';
import AdjustmentHistory from './components/AdjustmentHistory.vue';
const route = useRoute();
const router = useRouter();
console.log('路由参数:', route.params);
console.log('查询参数:', route.query);
// 确保初始值正确设置
const selectedProduct = ref(route.query.product || 'deposit');
console.debug('[DEBUG] 初始化selectedProduct:', selectedProduct.value);
const props = defineProps(['userId']);
const userId = ref(props.userId || route.query.userId);
console.log('组件接收参数 - userId:', userId.value, 'product:', selectedProduct.value);
watch(() => route.params.userId, (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
        console.log('userId参数变化:', newUserId);
        userId.value = newUserId;
        fetchData();
    }
});
watch(() => route.query.product, (newProduct) => {
    console.log('product参数变化:', newProduct);
    selectedProduct.value = newProduct || 'deposit';
});
watch(selectedProduct, (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
        router.push({ ...route, query: { ...route.query, product: newVal } });
        if (userInfo.value)
            fetchData();
    }
});
// 处理产品标签页切换
const handleProductChange = (key) => {
    selectedProduct.value = key;
};
const fetchUserData = async () => {
    try {
        loading.value = true;
        const res = await fetchUserInfo(userId.value);
        userInfo.value = res;
    }
    catch (e) {
        console.error('Failed to fetch user info:', e);
    }
    finally {
        loading.value = false;
    }
};
onMounted(() => {
    fetchUserData();
});
const products = ref([
    { key: 'deposit', name: '存款产品' },
    { key: 'loan', name: '贷款产品' }
]);
const currentProduct = computed(() => {
    return products.value.find(p => p.key === selectedProduct.value);
});
const userInfo = ref({});
console.debug('[DEBUG] 初始化userInfo:', { timestamp: Date.now(), value: userInfo.value });
const loading = ref(false);
watch(route, (newRoute) => {
    if (newRoute.query.product && newRoute.query.product !== selectedProduct.value) {
        selectedProduct.value = newRoute.query.product;
    }
});
import { fetchUserInfo } from '@/mock/customer360';
const fetchData = async () => {
    try {
        loading.value = true;
        console.debug('[DEBUG] 开始获取用户数据，参数:', {
            userId: userId.value,
            selectedProduct: selectedProduct.value,
            timestamp: Date.now()
        });
        // 根据选中产品筛选数据
        const rawData = await fetchUserInfo(userId.value);
        console.debug('[DEBUG] fetchUserInfo返回原始数据:', {
            timestamp: Date.now(),
            hasError: !!rawData.error,
            dataKeys: Object.keys(rawData),
            depositProductsCount: rawData.depositProducts?.length,
            loanProductsCount: rawData.loanProducts?.length,
            creditsListCount: rawData.creditsList?.length,
            loanRecordsCount: rawData.loanRecords?.length,
            quotaAdjustHistoryCount: rawData.quotaAdjustHistory?.length
        });
        // 检查是否有错误
        if (rawData.error) {
            console.warn('[WARN] 获取用户数据出现错误:', rawData.error, rawData.message);
            userInfo.value = rawData; // 直接使用错误信息
        }
        else {
            // 正常处理数据
            userInfo.value = selectedProduct.value === 'deposit'
                ? { ...rawData, productData: rawData.depositProducts || [] }
                : { ...rawData, productData: rawData.loanProducts || [] };
            console.debug('[DEBUG] 处理后的用户数据:', {
                productDataCount: userInfo.value.productData?.length,
                selectedProduct: selectedProduct.value
            });
        }
        console.debug('[DEBUG] 用户数据获取成功:', {
            timestamp: Date.now(),
            dataStructure: Object.keys(userInfo.value),
            creditsListExists: !!userInfo.value.creditsList,
            creditsListCount: userInfo.value.creditsList?.length,
            loanRecordsCount: userInfo.value.loanRecords?.length,
            quotaAdjustHistoryCount: userInfo.value.quotaAdjustHistory?.length
        });
        // 移除activeProduct相关逻辑，统一使用selectedProduct
    }
    catch (e) {
        console.error('[ERROR] 数据加载失败:', {
            timestamp: Date.now(),
            error: e,
            userId: userId.value
        });
        Message.error('数据加载失败');
    }
    finally {
        loading.value = false;
    }
};
watchEffect(() => {
    console.debug('[DEBUG] 开始获取用户数据:', { userId: userId.value, timestamp: Date.now() });
    if (userId) {
        fetchData();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.APageHeader;
/** @type {[typeof __VLS_components.APageHeader, typeof __VLS_components.aPageHeader, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBack': {} },
    title: (__VLS_ctx.userInfo?.name || '客户详情'),
    subTitle: ('用户ID：' + (__VLS_ctx.userInfo?.customerNo || '')),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    title: (__VLS_ctx.userInfo?.name || '客户详情'),
    subTitle: ('用户ID：' + (__VLS_ctx.userInfo?.customerNo || '')),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBack: (() => __VLS_ctx.$router.go(-1))
};
var __VLS_3;
const __VLS_8 = {}.ACard;
/** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    loading: (__VLS_ctx.loading),
}));
const __VLS_10 = __VLS_9({
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
if (__VLS_ctx.userInfo?.productData && __VLS_ctx.userInfo.productData.length > 0) {
    const __VLS_12 = {}.ATabs;
    /** @type {[typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, typeof __VLS_components.ATabs, typeof __VLS_components.aTabs, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onChange': {} },
        activeKey: (__VLS_ctx.selectedProduct),
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onChange': {} },
        activeKey: (__VLS_ctx.selectedProduct),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onChange: (__VLS_ctx.handleProductChange)
    };
    __VLS_15.slots.default;
    for (const [product] of __VLS_getVForSourceType((__VLS_ctx.products))) {
        const __VLS_20 = {}.ATabPane;
        /** @type {[typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, typeof __VLS_components.ATabPane, typeof __VLS_components.aTabPane, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            key: (product.key),
            title: (product.name),
        }));
        const __VLS_22 = __VLS_21({
            key: (product.key),
            title: (product.name),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        var __VLS_23;
    }
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-sections" },
});
if (__VLS_ctx.userInfo) {
    const __VLS_24 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ class: "info-card" },
        bordered: (false),
    }));
    const __VLS_26 = __VLS_25({
        ...{ class: "info-card" },
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    /** @type {[typeof BasicInfo, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(BasicInfo, new BasicInfo({
        userInfo: (__VLS_ctx.userInfo),
    }));
    const __VLS_29 = __VLS_28({
        userInfo: (__VLS_ctx.userInfo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    var __VLS_27;
}
if (__VLS_ctx.userInfo) {
    const __VLS_31 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
        ...{ class: "info-card" },
        title: "产品级客户信息",
        bordered: (false),
    }));
    const __VLS_33 = __VLS_32({
        ...{ class: "info-card" },
        title: "产品级客户信息",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    __VLS_34.slots.default;
    /** @type {[typeof ProductInfo, ]} */ ;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(ProductInfo, new ProductInfo({
        userInfo: (__VLS_ctx.userInfo),
        productData: (__VLS_ctx.userInfo.productData),
    }));
    const __VLS_36 = __VLS_35({
        userInfo: (__VLS_ctx.userInfo),
        productData: (__VLS_ctx.userInfo.productData),
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    var __VLS_34;
}
if (__VLS_ctx.userInfo) {
    const __VLS_38 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
        ...{ class: "info-card" },
        title: "授信列表",
        bordered: (false),
    }));
    const __VLS_40 = __VLS_39({
        ...{ class: "info-card" },
        title: "授信列表",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_41.slots.default;
    /** @type {[typeof CreditList, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(CreditList, new CreditList({
        credits: (__VLS_ctx.userInfo?.creditsList),
    }));
    const __VLS_43 = __VLS_42({
        credits: (__VLS_ctx.userInfo?.creditsList),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    var __VLS_41;
}
if (__VLS_ctx.userInfo) {
    const __VLS_45 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        ...{ class: "info-card" },
        title: "用信列表",
        bordered: (false),
    }));
    const __VLS_47 = __VLS_46({
        ...{ class: "info-card" },
        title: "用信列表",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    /** @type {[typeof LoanList, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(LoanList, new LoanList({
        loans: (__VLS_ctx.userInfo?.loanRecords),
    }));
    const __VLS_50 = __VLS_49({
        loans: (__VLS_ctx.userInfo?.loanRecords),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    var __VLS_48;
}
if (__VLS_ctx.userInfo) {
    const __VLS_52 = {}.ACard;
    /** @type {[typeof __VLS_components.ACard, typeof __VLS_components.aCard, typeof __VLS_components.ACard, typeof __VLS_components.aCard, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ class: "info-card" },
        title: "调额历史",
        bordered: (false),
    }));
    const __VLS_54 = __VLS_53({
        ...{ class: "info-card" },
        title: "调额历史",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    /** @type {[typeof AdjustmentHistory, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(AdjustmentHistory, new AdjustmentHistory({
        history: (__VLS_ctx.userInfo?.quotaAdjustHistory),
    }));
    const __VLS_57 = __VLS_56({
        history: (__VLS_ctx.userInfo?.quotaAdjustHistory),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    var __VLS_55;
}
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['info-sections']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            BasicInfo: BasicInfo,
            ProductInfo: ProductInfo,
            CreditList: CreditList,
            LoanList: LoanList,
            AdjustmentHistory: AdjustmentHistory,
            selectedProduct: selectedProduct,
            handleProductChange: handleProductChange,
            products: products,
            userInfo: userInfo,
            loading: loading,
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
; /* PartiallyEnd: #4569/main.vue */
