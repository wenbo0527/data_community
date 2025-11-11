<template>
  <div class="budget-project-relation-graph">
    <a-alert type="info" show-icon>
      关系图为示例展示，后续可扩展为从接口加载真实关系数据。
    </a-alert>
    <div ref="container" class="graph-container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Graph } from '@antv/x6'

const container = ref(null)

onMounted(() => {
  const graph = new Graph({
    container: container.value,
    width: '100%',
    height: 320,
    background: { color: '#fff' },
    grid: {
      visible: true,
      size: 10
    }
  })

  const budget = graph.addNode({
    x: 60, y: 140, width: 120, height: 40,
    label: '预算A',
    attrs: { body: { stroke: '#165DFF', fill: '#E8F3FF' } }
  })
  const project = graph.addNode({
    x: 260, y: 140, width: 140, height: 40,
    label: '项目X',
    attrs: { body: { stroke: '#00B42A', fill: '#E8FFEA' } }
  })
  graph.addEdge({ source: budget, target: project, labels: ['关联'],
    router: { name: 'orth' }, connector: { name: 'rounded' } })
})
</script>

<style scoped>
.graph-container { height: 320px; border: 1px dashed var(--color-border); margin-top: 12px; }
</style>