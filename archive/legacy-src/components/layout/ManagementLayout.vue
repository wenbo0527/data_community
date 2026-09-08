<template>
  <div class="management-layout">
    <!-- 公共导航 -->
    <nav>
      <router-link to="/management/service">服务管理</router-link>
      <router-link to="/management/permission">权限管理</router-link>
    </nav>
    
    <!-- 二级路由出口 -->
    <div class="content-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ManagementLayout'
}
</script>

<style scoped>
.management-layout {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>