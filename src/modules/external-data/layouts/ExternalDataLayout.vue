<template>
  <div class="external-data-layout">
    <a-layout class="layout">
      <a-layout-sider :width="200" class="sider">
        <a-menu :selected-keys="selectedKeys" @menu-item-click="onMenuClick">
          <a-menu-item key="/external-data/archive">档案管理</a-menu-item>
          <a-menu-item key="/external-data/lifecycle">外数生命周期</a-menu-item>
          <a-menu-item key="/external-data/evaluation">评估中心</a-menu-item>
          <a-menu-item key="/external-data/service">数据服务</a-menu-item>
          <a-menu-item key="/external-data/monitor">监控中心</a-menu-item>
          <a-menu-item key="/external-data/supplier-management">供应商管理</a-menu-item>
          <a-menu-item key="/external-data/supplier-pricing">供应商定价档案</a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content class="external-data-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const selectedKeys = ref<string[]>([route.path.startsWith('/external-data') ? route.path : '/external-data/archive'])
watch(() => route.path, (p) => {
  if (p.startsWith('/external-data')) selectedKeys.value = [p]
})
const onMenuClick = (key: string) => {
  router.push(key)
}
</script>

<style scoped>
.layout {
  height: 100vh;
}
.sider {
  border-right: 1px solid var(--color-border-2);
}
.external-data-content {
  padding: 20px;
  overflow-y: auto;
}
</style>
