<template>
  <div class="adjustment-history">
    <a-empty v-if="!history || history.length === 0" description="暂无调额历史" />
    <a-table v-else :data="history" :pagination="false" size="small" border-cell>
      <a-table-column title="客户号" data-index="customerNo" />
      <a-table-column title="调整日期" data-index="adjustDate" />
      <a-table-column title="调整前额度" data-index="beforeAmount">
        <template #cell="{ record }">
          {{ (record.beforeAmount || 0).toFixed(2) }}
        </template>
      </a-table-column>
      <a-table-column title="调整后额度" data-index="afterAmount">
        <template #cell="{ record }">
          {{ (record.afterAmount || 0).toFixed(2) }}
        </template>
      </a-table-column>
      <a-table-column title="调整原因" data-index="adjustReason" />
      <a-table-column title="调整前利率" data-index="beforeRate">
        <template #cell="{ record }">
          {{ (record.beforeRate || 0).toFixed(2) }}
        </template>
      </a-table-column>
      <a-table-column title="调整后利率" data-index="afterRate">
        <template #cell="{ record }">
          {{ (record.afterRate || 0).toFixed(2) }}
        </template>
      </a-table-column>
      <a-table-column title="调整前期限" data-index="beforePeriod" />
      <a-table-column title="调整后期限" data-index="afterPeriod" />
      <a-table-column title="操作人" data-index="operator" />
      <a-table-column title="结果" data-index="result" />
    </a-table>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  }
});

// 监听props变化，记录数据变化情况
watch(() => props.history, (newVal) => {
  console.debug('[AdjustmentHistory] history数据变化:', {
    timestamp: Date.now(),
    count: newVal?.length,
    isEmpty: !newVal || newVal.length === 0,
    firstItem: newVal && newVal.length > 0 ? {
      customerNo: newVal[0].customerNo,
      adjustDate: newVal[0].adjustDate,
      hasBeforeAmount: 'beforeAmount' in newVal[0],
      beforeAmountValue: newVal[0].beforeAmount,
      hasAfterAmount: 'afterAmount' in newVal[0],
      afterAmountValue: newVal[0].afterAmount,
      hasBeforeRate: 'beforeRate' in newVal[0],
      beforeRateValue: newVal[0].beforeRate,
      hasAfterRate: 'afterRate' in newVal[0],
      afterRateValue: newVal[0].afterRate,
      hasBeforePeriod: 'beforePeriod' in newVal[0],
      beforePeriodValue: newVal[0].beforePeriod,
      hasAfterPeriod: 'afterPeriod' in newVal[0],
      afterPeriodValue: newVal[0].afterPeriod
    } : null
  });
}, { immediate: true, deep: true });

onMounted(() => {
  console.debug('[AdjustmentHistory] 组件挂载完成，初始数据:', {
    timestamp: Date.now(),
    hasHistory: !!props.history,
    historyCount: props.history?.length
  });
});
</script>