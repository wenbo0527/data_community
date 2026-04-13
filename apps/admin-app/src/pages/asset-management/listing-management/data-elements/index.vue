<template>
  <div class="data-elements-management">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item>数据资产管理</a-breadcrumb-item>
        <a-breadcrumb-item>数据要素管理</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <h1 class="page-title">数据要素管理</h1>
      </div>
    </div>
    
    <div class="page-content">
      <a-tabs default-active-key="unified" type="rounded">
        <a-tab-pane key="unified" title="要素总览">
          <UnifiedManagement />
        </a-tab-pane>
        <a-tab-pane key="metric" title="指标注册">
          <MetricManagement />
        </a-tab-pane>
        <a-tab-pane key="variable" title="变量注册">
          <VariableManagement />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
import UnifiedManagement from '../variable-management/index.vue'
import MetricManagement from '../metric-management/index.vue'
import VariableManagement from '@/pages/variable-management/index.vue'
</script>

<style scoped>
.data-elements-management {
  padding: 20px;
  background-color: var(--color-fill-2);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
}

.page-content {
  background-color: var(--color-bg-2);
  padding: 20px;
  border-radius: 4px;
}

/* 覆盖内部组件自身的面包屑和标题，使其在 tab 中显示自然，但保留操作按钮 */
:deep(.metric-management) {
  padding: 0;
}
:deep(.variable-management-page) {
  padding: 0;
  min-height: auto;
}
:deep(.variable-management-page .arco-breadcrumb),
:deep(.variable-management-page .page-title),
:deep(.metric-management .page-header h2) {
  display: none;
}
:deep(.variable-management-page .page-header) {
  margin-bottom: 0;
}
:deep(.metric-management .page-header) {
  margin-bottom: 16px;
}
</style>
