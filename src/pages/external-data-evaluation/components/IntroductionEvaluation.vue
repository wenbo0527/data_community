<template>
  <a-card title="引入评估" hoverable>
    <a-descriptions :column="2" :label-style="{ 'font-weight': 600 }" :data="items" />
  </a-card>
</template>

<script setup>
const items = [
  { label: '供应商', value: '示例供应商A' },
  { label: '数据类型', value: '行为数据' },
  { label: '采集频率', value: '每日' },
  { label: '合规状态', value: '已合规' }
]
</script>