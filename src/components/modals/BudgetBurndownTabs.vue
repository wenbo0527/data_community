<template>
  <a-card title="预算Burn-down图">
    <a-tabs v-model:value="activeTab" @change="handleTabChange">
      <a-tab-pane key="month" tab="月度">
        <div ref="burndownChartRef" class="chart-container" />
      </a-tab-pane>
      <a-tab-pane key="quarter" tab="季度">
        <div ref="burndownChartRef" class="chart-container" />
      </a-tab-pane>
      <a-tab-pane key="year" tab="年度">
        <div ref="burndownChartRef" class="chart-container" />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

type BurndownItem = { granularity: string }

const props = defineProps({ 
  chartData: { type: Array as () => Array<BurndownItem>, required: true },
  updateChart: { type: Function, required: true }
})

const activeTab = ref('month')
const burndownChartRef = ref()
let burndownChart: echarts.ECharts | null = null

const handleTabChange = (tabKey: string) => {
  // 根据tab切换更新图表数据
  props.updateChart(props.chartData.filter(item => item.granularity === tabKey))
}

onMounted(() => {
  console.log('初始化ECharts实例，数据长度:', props.chartData.length)
  burndownChart = echarts.init(burndownChartRef.value, undefined, {
  useCoarsePointer: true,
  pointerSize: 3,
  renderer: 'canvas',
  eventProcessors: {
    touch: { passive: true },
    mouse: { passive: true }
  }
} as any);

const initialData = props.chartData.filter(item => item.granularity === 'month');
console.log('过滤后的初始数据:', JSON.parse(JSON.stringify(initialData)));
props.updateChart(initialData);

watch(() => props.chartData, (newData) => {
  console.log('接收到新数据集，总条数:', newData.length);
  const filteredData = newData.filter(item => item.granularity === activeTab.value);
  console.log('当前激活标签:', activeTab.value, '过滤后数据:', filteredData);
  props.updateChart(filteredData);
});
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}</style>