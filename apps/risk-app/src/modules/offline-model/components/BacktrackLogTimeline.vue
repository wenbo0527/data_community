<template>
  <div class="backtrack-log-timeline">
    <div v-if="nodes.length === 0" class="timeline-empty">
      <a-empty description="无执行节点" />
    </div>
    <a-timeline v-else>
      <a-timeline-item
        v-for="node in nodes"
        :key="node.id"
        :label="node.timestamp"
        :dot-color="node.status === 'done' ? 'rgb(var(--green-6))' : 'rgb(var(--blue-6))'"
      >
        <div class="node-desc">
          <span>{{ node.desc }}</span>
          <a-tag v-if="node.cost" color="gray" class="cost-tag">耗时 {{ node.cost }}</a-tag>
          <a-tag :color="node.status === 'done' ? 'green' : 'blue'" class="status-tag">
            {{ node.status === 'done' ? '已完成' : '进行中' }}
          </a-tag>
        </div>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { parseTimeline } from '../utils/logParser'

const props = defineProps({
  log: { type: Object, default: null }
})

const nodes = computed(() => parseTimeline(props.log))
</script>

<style scoped>
.backtrack-log-timeline { padding: 8px 0; }
.timeline-empty { padding: 24px 0; text-align: center; }
.node-desc { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cost-tag { font-size: 12px; }
.status-tag { font-size: 12px; }
</style>