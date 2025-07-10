<template>
  <div class="audience-system">
    <!-- 如果当前路由是父路由，显示模块介绍 -->
    <div v-if="$route.name === 'audience-system'">
      <h2>人群管理系统</h2>
      <p>人群管理系统，包含人群创建、管理、分析等功能</p>
      
      <div class="function-grid">
        <div class="function-card" @click="goToAudienceManagement">
          <h3>人群管理</h3>
          <p>管理用户人群，创建、分析、维护人群数据</p>
        </div>
      </div>
    </div>
    <!-- 渲染子路由组件 -->
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到人群管理页面
const goToAudienceManagement = () => {
  router.push('/exploration/customer-center/audience-system/audience-management')
}
</script>

<style scoped>
.audience-system {
  padding: 20px;
}

.audience-system h2 {
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.function-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  transform: translateY(-2px);
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