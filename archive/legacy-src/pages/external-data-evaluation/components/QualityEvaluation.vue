<template>
  <a-card title="质量评估" hoverable>
    <a-table :columns="columns" :data="rows" size="small" />
  </a-card>
</template>

<script setup>
const columns = [
  { title: '指标', dataIndex: 'metric' },
  { title: '值', dataIndex: 'value' },
  { title: '说明', dataIndex: 'desc' }
]
const rows = [
  { metric: '缺失率', value: '0.5%', desc: '字段缺失占比' },
  { metric: '重复率', value: '1.2%', desc: '重复记录比例' },
  { metric: '一致性', value: '98%', desc: '多源一致性' }
]
</script>