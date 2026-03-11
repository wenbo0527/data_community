<template>
  <div class="page">
    <a-typography-title :heading="4">数字风险首页</a-typography-title>
    <a-card bordered>
      <a-space>
        <a-button type="primary" @click="$router.push('/model-offline-analysis/feature-center')">进入特征中心</a-button>
        <a-button @click="$router.push('/model-offline-analysis/task-management')">进入任务管理</a-button>
        <a-button @click="$router.push('/model-offline-analysis/model-evaluation')">进入模型评估</a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page {
  padding: 16px;
}
</style>
