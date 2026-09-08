<template>
  <div class="column-lineage-viewer">
    <a-empty description="字段血缘查看器(占位)" />
    <div v-if="column">
      <h4>{{ column }}</h4>
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="字段名">{{ column }}</a-descriptions-item>
        <a-descriptions-item label="上游数">{{ upstreamCount }}</a-descriptions-item>
        <a-descriptions-item label="下游数">{{ downstreamCount }}</a-descriptions-item>
        <a-descriptions-item label="涉及表数">{{ tableCount }}</a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script setup>
/**
 * 字段血缘查看器 - 占位
 */
defineProps({
  table: { type: String, default: '' },
  column: { type: String, default: '' },
  upstreamCount: { type: Number, default: 0 },
  downstreamCount: { type: Number, default: 0 },
  tableCount: { type: Number, default: 0 }
})
</script>