<template>
  <div class="tag-system">
    <!-- 如果当前路由是父路由，显示模块介绍 -->
    <div v-if="$route.name === 'tag-system'">
      <h2>标签体系</h2>
      <p>标签体系管理，包含标签管理和属性管理功能</p>
      
      <div class="function-grid">
        <div class="function-card">
          <h3>标签管理</h3>
          <p>管理用户标签，创建、编辑、删除标签</p>
        </div>
        <div class="function-card">
          <h3>属性管理</h3>
          <p>管理标签属性，定义标签的各种属性和规则</p>
        </div>
      </div>
    </div>
    <!-- 渲染子路由组件 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 标签体系模块主页
</script>

<style scoped>
.tag-system {
  padding: 20px;
}

.tag-system h2 {
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