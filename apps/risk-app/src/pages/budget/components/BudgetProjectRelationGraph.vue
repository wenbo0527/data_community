<template>
  <div class="budget-project-relation-graph">
    <a-alert type="info" show-icon>
      关系图为示例展示，后续可扩展为从接口加载真实关系数据。
    </a-alert>
    <div class="graph-placeholder">
      <span>关系图预览区域</span>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.graph-placeholder {
  height: 320px;
  border: 1px dashed var(--color-border);
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
}
</style>
