<template>
  <div class="workbench-page">
    <UnifiedWorkbench />
  </div>
</template>

<script setup lang="ts">
import UnifiedWorkbench from '@/components-dca/common/UnifiedWorkbench.vue'
</script>

<style lang="scss" scoped>
.workbench-page {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>