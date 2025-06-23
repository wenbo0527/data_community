<template>
    <a-page-header
      :title="userInfo?.name || '客户详情'"
      :sub-title="'用户ID：' + (userInfo?.customerNo || '')"
      @back="() => $router.go(-1)"
    />
    <a-card :loading="loading">
      <!-- 产品选择标签页 -->
      <a-tabs v-if="userInfo?.productData && userInfo.productData.length > 0" :active-key="selectedProduct" @change="handleProductChange">
        <a-tab-pane v-for="product in products" :key="product.key" :title="product.name">
          <!-- 产品信息将通过ProductInfo组件展示 -->
        </a-tab-pane>
      </a-tabs>
      
      <!-- 所有信息直接展示 -->
      <div class="info-sections">
        <!-- 基本信息卡片 -->
        <a-card v-if="userInfo" class="info-card" :bordered="false">
          <BasicInfo :user-info="userInfo" />
        </a-card>
        
        <!-- 产品级客户信息 -->
        <a-card v-if="userInfo" class="info-card" title="产品级客户信息" :bordered="false">
          <ProductInfo :user-info="userInfo" :product-data="userInfo.productData" />
        </a-card>
        
        <!-- 授信列表 -->
        <a-card v-if="userInfo" class="info-card" title="授信列表" :bordered="false">
          <CreditList :credits="userInfo?.creditsList" />
        </a-card>
        
        <!-- 用信列表 -->
        <a-card v-if="userInfo" class="info-card" title="用信列表" :bordered="false">
          <LoanList :loans="userInfo?.loanRecords" />
        </a-card>
        
        <!-- 调额历史 -->
        <a-card v-if="userInfo" class="info-card" title="调额历史" :bordered="false">
          <AdjustmentHistory :history="userInfo?.quotaAdjustHistory" />
        </a-card>
      </div>
    </a-card>
</template>

<script setup>
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
  if(newUserId !== oldUserId) {
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
    if (userInfo.value) fetchData();
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
  } catch (e) {
    console.error('Failed to fetch user info:', e);
  } finally {
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
const loading = ref(false)

watch(route, (newRoute) => {
  if (newRoute.query.product && newRoute.query.product !== selectedProduct.value) {
    selectedProduct.value = newRoute.query.product;
  }
})

import { fetchUserInfo } from '@/mock/customer360';

const fetchData = async () => {
  try {
      loading.value = true
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
} else {
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
  } catch (e) {
    console.error('[ERROR] 数据加载失败:', {
      timestamp: Date.now(),
      error: e,
      userId: userId.value
    });
    Message.error('数据加载失败');
  } finally {
    loading.value = false
  }
}


watchEffect(() => {
  console.debug('[DEBUG] 开始获取用户数据:', { userId: userId.value, timestamp: Date.now() });
  if (userId) {
    fetchData()
  }
})
</script>

<style scoped>
.info-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  margin-bottom: 16px;
}

.info-card :deep(.arco-card-header) {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e6eb;
}

.info-card :deep(.arco-card-body) {
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
  font-size: 16px;
}

.operations {
  display: flex;
  gap: 8px;
}
</style>