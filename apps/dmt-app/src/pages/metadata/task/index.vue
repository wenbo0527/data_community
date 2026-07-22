<template>
  <div class="task-panel">
    <!-- 顶部说明 -->
    <a-alert type="info" :show-icon="false" class="task-tip">
      <template #title>采集任务</template>
      统一管理所有数据源的元数据采集任务，包含创建、调度、监控、查看采集日志等能力。
    </a-alert>

    <!-- 子 Tab：任务列表 / 创建任务 -->
    <a-tabs default-active-key="list" type="rounded" class="task-sub-tabs">
      <a-tab-pane key="list" title="任务列表">
        <CollectionList />
      </a-tab-pane>
      <a-tab-pane key="create" title="创建任务">
        <CollectionForm />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import CollectionList from '@/pages/asset-management/basic-management/metadata-collection/List.vue'
import CollectionForm from '@/pages/asset-management/basic-management/metadata-collection/index.vue'
</script>

<style scoped>
.task-panel { padding: 8px 0; }
.task-tip { margin-bottom: 16px; }
.task-sub-tabs { background: #fff; border-radius: 6px; padding: 16px; }
</style>
