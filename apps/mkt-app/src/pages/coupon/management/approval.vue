<template>
  <div class="approval-container">
    <a-page-header title="券审批管理" subtitle="P0-路由-#3 补 5 子路由配套空壳">
      <template #breadcrumb>
        <a-breadcrumb>
          <a-breadcrumb-item>营销中心</a-breadcrumb-item>
          <a-breadcrumb-item>券管理</a-breadcrumb-item>
          <a-breadcrumb-item>审批</a-breadcrumb-item>
        </a-breadcrumb>
      </template>
    </a-page-header>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-empty description="券审批管理 - 路由空壳" />
    </a-card>
  </div>
</template>

<script setup>
/**
 * P0-路由-#3 补 5 子路由配套空壳
 * 实际审批逻辑复用 src/pages/coupon/inventory/approval.vue
 * 此处仅占位, demo 路由可访问
 */
</script>

<style scoped>
.approval-container {
  padding: 24px;
  background-color: var(--color-bg-2);
  min-height: calc(100vh - 60px);
}
</style>
