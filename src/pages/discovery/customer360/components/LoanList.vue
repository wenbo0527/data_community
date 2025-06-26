<template>
  <div class="loan-list">
    <a-empty v-if="!loans || loans.length === 0" description="暂无用信记录" />
    <a-table v-else :data="loans" :columns="columns" :pagination="false" size="small" :bordered="true" />
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

// 定义表格列配置
const columns = [
  {
    title: '用信编号',
    dataIndex: 'loanNo'
  },
  {
    title: '用信日期',
    dataIndex: 'loanDate'
  },
  {
    title: '银行卡号',
    dataIndex: 'bankCard'
  },
  {
    title: '渠道',
    dataIndex: 'channel'
  },
  {
    title: '产品名称',
    dataIndex: 'productName'
  },
  {
    title: '结果',
    dataIndex: 'result'
  },
  {
    title: '拒绝原因',
    dataIndex: 'rejectReason'
  },
  {
    title: '合同编号',
    dataIndex: 'contractNo'
  },
  {
    title: '状态',
    dataIndex: 'status'
  },
  {
    title: '金额',
    dataIndex: 'amount',
    render: ({ record }) => (record.amount || 0).toFixed(2)
  },
  {
    title: '余额',
    dataIndex: 'balance',
    render: ({ record }) => (record.balance || 0).toFixed(2)
  },
  {
    title: '分期数',
    dataIndex: 'installments'
  },
  {
    title: '操作',
    render: () => '查看详情'
  }
];

// 监听props变化
watch(() => props.loans, (newVal) => {
  // 可以在这里添加必要的业务逻辑
}, { immediate: true, deep: true });

onMounted(() => {
  console.debug('[LoanList] 组件挂载完成，初始数据:', {
    timestamp: Date.now(),
    hasLoans: !!props.loans,
    loansCount: props.loans?.length
  });
});
</script>