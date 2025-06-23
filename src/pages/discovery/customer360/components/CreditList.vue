<template>
  <div class="credit-list">
    <a-empty v-if="!credits || credits.length === 0" description="暂无授信信息" />
    <a-table v-else :data="credits" :pagination="false" size="small" border-cell>
      <a-table-column title="授信编号" data-index="creditNo" />
      <a-table-column title="授信日期" data-index="creditDate" />
      <a-table-column title="渠道" data-index="channel" />
      <a-table-column title="结果" data-index="result" />
      <a-table-column title="拒绝原因" data-index="rejectReason" />
      <a-table-column title="初始额度" data-index="initialAmount">
        <template #cell="{ record }">
          {{ (record.initialAmount || 0).toFixed(2) }}
        </template>
      </a-table-column>
      <a-table-column title="当前额度" data-index="currentAmount">
        <template #cell="{ record }">
          {{ (record.currentAmount || 0).toFixed(2) }}
        </template>
      </a-table-column>
      <a-table-column title="已用额度" data-index="usedAmount">
        <template #cell="{ record }">
          {{ (record.usedAmount || 0).toFixed(2) }}
        </template>
      </a-table-column>
      <a-table-column title="风险等级" data-index="riskLevel" />
      <a-table-column title="操作">
        <template #cell>
          <a-button type="text" size="small">查看详情</a-button>
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
  credits: {
    type: Array,
    default: () => []
  }
});

// 监听props变化，记录数据变化情况
watch(() => props.credits, (newVal) => {
  console.debug('[CreditList] credits数据变化:', {
    timestamp: Date.now(),
    count: newVal?.length,
    isEmpty: !newVal || newVal.length === 0,
    firstItem: newVal && newVal.length > 0 ? {
      creditNo: newVal[0].creditNo,
      creditDate: newVal[0].creditDate,
      hasInitialAmount: 'initialAmount' in newVal[0],
      initialAmountValue: newVal[0].initialAmount,
      hasCurrentAmount: 'currentAmount' in newVal[0],
      currentAmountValue: newVal[0].currentAmount,
      hasUsedAmount: 'usedAmount' in newVal[0],
      usedAmountValue: newVal[0].usedAmount
    } : null
  });
}, { immediate: true, deep: true });

onMounted(() => {
  console.debug('[CreditList] 组件挂载完成，初始数据:', {
    timestamp: Date.now(),
    hasCredits: !!props.credits,
    creditsCount: props.credits?.length
  });
});
</script>