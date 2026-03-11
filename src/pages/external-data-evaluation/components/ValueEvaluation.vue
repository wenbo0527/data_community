<template>
  <a-card title="价值评估" hoverable>
    <a-descriptions :column="2" :label-style="{ 'font-weight': 600 }" :data="items" />
  </a-card>
</template>

<script setup>
const items = [
  { label: 'ROI(预估)', value: '180%' },
  { label: '业务影响', value: '核心转化提升' },
  { label: '覆盖面', value: '核心人群70%' },
  { label: '投入成本(月)', value: '￥50,000' }
]
</script>