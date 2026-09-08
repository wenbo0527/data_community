<template>
  <div class="data-models">
    <!-- 路由视图容器 -->
    <router-view />
  </div>
</template>

<script setup>
// 数据模型管理主入口页面
// 作为路由容器，渲染子路由组件
</script>

<style scoped>
.data-models {
  /* 移除固定高度，使用自然高度避免双重滚动 */
  background-color: #f5f5f5;
}
</style>