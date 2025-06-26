<template>
  <div class="adjustment-history">
    <a-empty v-if="!history || history.length === 0" description="暂无调整记录" />
    <a-table v-else :data="history" :columns="columns" :pagination="false" size="small" :bordered="true" />
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

// 定义表格列配置
const columns = [
  {
    title: '客户号',
    dataIndex: 'customerNo'
  },
  {
    title: '调整日期',
    dataIndex: 'adjustDate'
  },
  {
    title: '调整前额度',
    dataIndex: 'beforeAmount',
    render: ({ record }) => (record.beforeAmount || 0).toFixed(2)
  },
  {
    title: '调整后额度',
    dataIndex: 'afterAmount',
    render: ({ record }) => (record.afterAmount || 0).toFixed(2)
  },
  {
    title: '调整原因',
    dataIndex: 'adjustReason'
  },
  {
    title: '调整前利率',
    dataIndex: 'beforeRate',
    render: ({ record }) => (record.beforeRate || 0).toFixed(2)
  },
  {
    title: '调整后利率',
    dataIndex: 'afterRate',
    render: ({ record }) => (record.afterRate || 0).toFixed(2)
  },
  {
    title: '调整前期限',
    dataIndex: 'beforePeriod'
  },
  {
    title: '调整后期限',
    dataIndex: 'afterPeriod'
  },
  {
    title: '操作人',
    dataIndex: 'operator'
  },
  {
    title: '结果',
    dataIndex: 'result'
  }
];

// 监听props变化
watch(() => props.history, (newVal) => {
  // 可以在这里添加必要的业务逻辑
}, { immediate: true, deep: true });

onMounted(() => {
  console.debug('[AdjustmentHistory] 组件挂载完成，初始数据:', {
    timestamp: Date.now(),
    hasHistory: !!props.history,
    historyCount: props.history?.length
  });
});
</script>