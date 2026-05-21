<template>
  <a-layout class="main-layout">
    <!-- 顶部区域：Logo + 单一菜单 -->
    <a-layout-header class="main-header">
      <div class="logo">
        <div class="logo-text">数据发现</div>
      </div>
      <div class="header-center">
        <span class="current-module">数据地图</span>
      </div>
      <div class="header-right">
        <!-- 预留右侧功能区 -->
      </div>
    </a-layout-header>

    <!-- 内容区 -->
    <a-layout-content class="main-content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #f0f2f5;
}

.main-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e5e6e8;
  padding: 0 24px;
  height: 56px;
  flex-shrink: 0;
}

.logo {
  width: 200px;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.current-module {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.header-right {
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.main-content {
  flex: 1;
  overflow: hidden;
}
</style>