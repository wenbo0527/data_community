<template>
  <a-alert type="warning" :show-icon="true">
    <template #title>存量保护说明</template>
    SUD001 仍使用轻量版（全局阈值，存于 localStorage）。轻量版与完整版并行，运营侧 SUD001 体验零变化。
    <br />
    <span style="font-size: 12px; color: var(--color-text-3)">
      v1.3 评估全量迁移到完整版。本页不展示 SUD001 的规则编辑入口。
    </span>
  </a-alert>
</template>

<script setup lang="ts">
/**
 * 存量保护说明
 * TASK-20260603-B2A5D2BB
 * arch §5.1.3：配置页顶部显示存量保护说明（PRD §AC-4.5）
 */
</script>
