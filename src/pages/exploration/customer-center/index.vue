<template>
  <div class="customer-center">
    <!-- 如果当前路由是父路由，显示模块介绍 -->
    <div v-if="$route.name === 'customer-center'">
      <h2>客群中心</h2>
      <p>客群中心模块主页，包含标签体系、人群画像、事件中心等功能</p>
      
      <div class="module-grid">
        <div class="module-card">
          <h3>标签体系</h3>
          <p>标签管理、属性管理</p>
        </div>
        <div class="module-card">
          <h3>人群画像</h3>
          <p>人群管理功能</p>
        </div>
        <div class="module-card">
          <h3>事件中心</h3>
          <p>事件管理、虚拟事件</p>
        </div>
      </div>
    </div>
    <!-- 渲染子路由组件 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 客群中心模块主页
</script>

<style scoped>
.customer-center {
  padding: 20px;
}

.customer-center h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.module-card {
  padding: 20px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.module-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.module-card p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}
</style>