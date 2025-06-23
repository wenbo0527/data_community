<template>
  <div class="loan-list">
    <a-empty v-if="!loans || loans.length === 0" description="暂无用信信息" />
    <a-table v-else :data="loans" :pagination="false" size="small" border-cell>
      <a-table-column title="用信编号" data-index="loanNo" />
      <a-table-column title="用信日期" data-index="loanDate" />
      <a-table-column title="银行卡号" data-index="bankCard" />
      <a-table-column title="渠道" data-index="channel" />
      <a-table-column title="产品名称" data-index="productName" />
      <a-table-column title="结果" data-index="result" />
      <a-table-column title="合同编号" data-index="contractNo" />
      <a-table-column title="状态" data-index="status" />
      <a-table-column title="金额" data-index="amount">
        <template #cell="{ record }">
          {{ (record.amount || 0).toFixed(2) }}
        </template>
      </a-table-column>
      <a-table-column title="操作" fixed="right">
        <template #cell>
          <div class="operations">
            <a-button type="text" size="small">查看详情</a-button>
            <a-button type="text" size="small">查看合同</a-button>
            <a-button type="text" size="small">查看账单</a-button>
          </div>
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
  loans: {
    type: Array,
    default: () => []
  }
});

// 监听props变化，记录数据变化情况
watch(() => props.loans, (newVal) => {
  console.debug('[LoanList] loans数据变化:', {
    timestamp: Date.now(),
    count: newVal?.length,
    isEmpty: !newVal || newVal.length === 0,
    firstItem: newVal && newVal.length > 0 ? {
      loanNo: newVal[0].loanNo,
      loanDate: newVal[0].loanDate,
      hasAmount: 'amount' in newVal[0],
      amountValue: newVal[0].amount,
      hasBalance: 'balance' in newVal[0],
      balanceValue: newVal[0].balance,
      hasInstallments: 'installments' in newVal[0],
      installmentsValue: newVal[0].installments,
      hasPaidInstallments: 'paidInstallments' in newVal[0],
      paidInstallmentsValue: newVal[0].paidInstallments
    } : null
  });
}, { immediate: true, deep: true });

onMounted(() => {
  console.debug('[LoanList] 组件挂载完成，初始数据:', {
    timestamp: Date.now(),
    hasLoans: !!props.loans,
    loansCount: props.loans?.length
  });
});
</script>