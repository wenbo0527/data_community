<template>
  <div class="classification-viewer">
    <a-empty description="字段分级分类查看器(占位)" />
    <a-descriptions :column="2" bordered>
      <a-descriptions-item label="表名">{{ table }}</a-descriptions-item>
      <a-descriptions-item label="覆盖率">{{ coverage }}%</a-descriptions-item>
      <a-descriptions-item label="已分级字段数">{{ classifiedCount }}</a-descriptions-item>
      <a-descriptions-item label="未分级字段数">{{ unclassifiedCount }}</a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script setup>
/**
 * 字段分级分类查看器 - 占位
 */
const props = defineProps({
  table: { type: String, default: '' },
  coverage: { type: Number, default: 0 },
  classifiedCount: { type: Number, default: 0 },
  unclassifiedCount: { type: Number, default: 0 }
})
</script>