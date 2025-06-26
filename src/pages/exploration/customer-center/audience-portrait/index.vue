<template>
  <div class="audience-portrait">
    <!-- 如果当前路由是父路由，显示模块介绍 -->
    <div v-if="$route.name === 'audience-portrait'">
      <h2>人群画像</h2>
      <p>人群画像分析，包含人群管理功能</p>
      
      <div class="function-grid">
        <div class="function-card">
          <h3>人群管理</h3>
          <p>管理用户人群，创建、分析、维护人群数据</p>
        </div>
      </div>
    </div>
    <!-- 渲染子路由组件 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 人群画像模块主页
</script>

<style scoped>
.audience-portrait {
  padding: 20px;
}

.audience-portrait h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.function-card {
  padding: 20px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.function-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.function-card p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}
</style>