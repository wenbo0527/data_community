<template>
  <div class="product-info">
    <a-skeleton v-if="!userInfo" :loading="true" />
    <div v-else-if="userInfo.error">
      <a-empty description="找不到用户相关信息" />
    </div>
    <div v-else>
      <div class="section-title">产品级客户信息</div>
      <a-descriptions bordered :column="{ xs: 1, sm: 2, md: 4 }" size="small">
        <a-descriptions-item label="历史最大透支天数">{{ userInfo.maxOverdueDays || 0 }} 天</a-descriptions-item>
        <a-descriptions-item label="当前透支天数">{{ userInfo.currentOverdueDays || 0 }} 天</a-descriptions-item>
        <a-descriptions-item label="当前透支金额">{{ (userInfo.overdueAmount || 0).toFixed(2) }} 元</a-descriptions-item>
        <a-descriptions-item label="当前还款率">{{ userInfo.repaymentRate || 0 }}%</a-descriptions-item>
      </a-descriptions>
      
      <div v-if="productData && productData.length > 0" class="section-title mt-4">产品信息</div>
      <a-table v-if="productData && productData.length > 0" :data="productData" :pagination="false" size="small" border-cell>
        <a-table-column title="产品编号" data-index="productKey" />
        <a-table-column title="产品名称" data-index="name" />
        <a-table-column title="余额" data-index="balance">
          <template #cell="{ record }">
            {{ (record.balance || 0).toFixed(2) }} 元
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status" />
      </a-table>
      <a-empty v-else-if="!userInfo.error" description="暂无产品信息" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => null
  },
  productData: {
    type: Array,
    default: () => []
  }
});

// 监听props变化，记录数据变化情况
watch(() => props.userInfo, (newVal) => {
  console.debug('[ProductInfo] userInfo数据变化:', {
    timestamp: Date.now(),
    hasError: newVal?.error,
    hasData: !!newVal,
    maxOverdueDays: newVal?.maxOverdueDays,
    currentOverdueDays: newVal?.currentOverdueDays,
    overdueAmount: newVal?.overdueAmount,
    repaymentRate: newVal?.repaymentRate
  });
}, { immediate: true, deep: true });

watch(() => props.productData, (newVal) => {
  console.debug('[ProductInfo] productData数据变化:', {
    timestamp: Date.now(),
    count: newVal?.length,
    isEmpty: !newVal || newVal.length === 0,
    firstItem: newVal && newVal.length > 0 ? {
      productKey: newVal[0].productKey,
      name: newVal[0].name,
      hasBalance: 'balance' in newVal[0],
      balanceValue: newVal[0].balance
    } : null
  });
}, { immediate: true, deep: true });

onMounted(() => {
  console.debug('[ProductInfo] 组件挂载完成，初始数据:', {
    timestamp: Date.now(),
    hasUserInfo: !!props.userInfo,
    userInfoError: props.userInfo?.error,
    productDataCount: props.productData?.length
  });
});
</script>

<style scoped>
.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #1d2129;
}
.mt-4 {
  margin-top: 16px;
}
</style>