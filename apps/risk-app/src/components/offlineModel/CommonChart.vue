<template>
  <div class="common-chart">
    <div v-if="title" class="chart-title">{{ title }}</div>
    <div class="chart-container" :style="{ height: height + 'px' }">
      <div class="chart-placeholder">
        <span>📊 图表区域 (type: {{ type }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: string
  data: any[]
  title?: string
  height?: number
}>()
</script>

<style scoped>
.common-chart {
  width: 100%;
}
.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}
.chart-container {
  background: #fafafa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart-placeholder {
  color: #999;
  font-size: 14px;
}
</style>