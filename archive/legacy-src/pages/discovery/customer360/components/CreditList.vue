<template>
  <div class="credit-list">
    <a-empty v-if="!credits || credits.length === 0" description="暂无授信信息" />
    <a-table v-else :data="credits" :columns="columns" :pagination="false" size="small" :bordered="true" />
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

// 定义表格列配置
const columns = [
  {
    title: '授信编号',
    dataIndex: 'creditNo'
  },
  {
    title: '授信日期',
    dataIndex: 'creditDate'
  },
  {
    title: '渠道',
    dataIndex: 'channel'
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
    title: '初始额度',
    dataIndex: 'initialAmount',
    render: ({ record }) => (record.initialAmount || 0).toFixed(2)
  },
  {
    title: '当前额度',
    dataIndex: 'currentAmount',
    render: ({ record }) => (record.currentAmount || 0).toFixed(2)
  },
  {
    title: '已用额度',
    dataIndex: 'usedAmount',
    render: ({ record }) => (record.usedAmount || 0).toFixed(2)
  },
  {
    title: '风险等级',
    dataIndex: 'riskLevel'
  },
  {
    title: '操作',
    render: () => '查看详情'
  }
];

// 监听props变化
watch(() => props.credits, (newVal) => {
  // 可以在这里添加必要的业务逻辑
}, { immediate: true, deep: true });

onMounted(() => {
  // 组件挂载完成
});
</script>