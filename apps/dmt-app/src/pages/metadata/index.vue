<template>
  <div class="metadata-container">
    <div class="page-header">
      <a-typography-title :heading="1">元数据管理</a-typography-title>
      <a-typography-text>统一管理数据资产元信息</a-typography-text>
    </div>
    
    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane key="modeling" title="建模">
        <ModelingView />
      </a-tab-pane>
      <a-tab-pane key="query" title="查询">
        <QueryView />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ModelingView from './modeling/index.vue'
import QueryView from './query/index.vue'

const activeTab = ref('modeling')
</script>

<style scoped>
.metadata-container {
  padding: 24px;
  background: var(--subapp-bg-secondary);
  min-height: 100%;
}

.page-header {
  margin-bottom: 24px;
}
</style>
