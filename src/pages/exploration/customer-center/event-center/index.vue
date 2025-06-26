<template>
  <div class="event-center">
    <!-- 如果当前路由是父路由，显示模块介绍 -->
    <div v-if="$route.name === 'event-center'">
      <h2>事件中心</h2>
      <p>事件管理中心，包含事件管理和虚拟事件功能</p>
      
      <div class="function-grid">
        <div class="function-card">
          <h3>事件管理</h3>
          <p>管理系统事件，创建、编辑、监控事件</p>
        </div>
        <div class="function-card">
          <h3>虚拟事件</h3>
          <p>管理虚拟事件，模拟和测试事件场景</p>
        </div>
      </div>
    </div>
    <!-- 渲染子路由组件 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 事件中心模块主页
</script>

<style scoped>
.event-center {
  padding: 20px;
}

.event-center h2 {
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