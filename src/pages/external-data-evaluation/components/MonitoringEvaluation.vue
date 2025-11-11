<template>
  <a-card title="监控评估" hoverable>
    <a-space direction="vertical" fill>
      <a-progress :percent="72" status="normal" />
      <a-progress :percent="38" status="warning" />
      <a-progress :percent="12" status="danger" />
    </a-space>
  </a-card>
</template>

<script setup>
// 监控进度展示（占位）
</script>