<template>
  <div class="external-data-analysis">
    <!-- 如果当前路由是父路由，显示模块介绍 -->
    <div v-if="$route.name === 'external-data-analysis'">
      <h2>外数监控与分析</h2>
      <p>外部数据监控与分析模块主页</p>
    </div>
    <!-- 渲染子路由组件 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 外数监控与分析模块主页
</script>

<style scoped>
.external-data-analysis {
  padding: 20px;
}

.external-data-analysis h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
}
</style>