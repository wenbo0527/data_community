<template>
  <a-layout class="touch-layout">
    <a-layout-sider class="touch-sider" :width="220" breakpoint="lg">
      <div class="sider-title">触达系统</div>
      <a-menu
        v-model:selected-keys="selectedKeys"
        :default-selected-keys="[defaultKey]"
        @menu-item-click="onMenuClick"
      >
        <a-menu-item key="/touch">触达首页</a-menu-item>
        <a-menu-item key="/touch/channel/blacklist">渠道黑名单</a-menu-item>
        <a-menu-item key="/touch/manual-sms">手动短信</a-menu-item>
        <a-menu-item key="/touch/manual-sms/list">手动短信列表</a-menu-item>
        <a-menu-item key="/touch/policy/template">策略模板</a-menu-item>
        <a-menu-item key="/touch/query">触达查询</a-menu-item>
        <a-menu-item key="/touch/system">系统管理</a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content class="touch-content">
        <div class="touch-header" v-if="$route.name !== 'TouchIndex'">
          <a-breadcrumb>
            <a-breadcrumb-item>触达系统</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentPageTitle }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentPageTitle = computed(() => route.meta.title || route.name || '')

const selectedKeys = ref([])
const defaultKey = '/touch'

const updateSelected = () => {
  const p = route.path || defaultKey
  selectedKeys.value = [p.startsWith('/touch') ? p : defaultKey]
}
updateSelected()

watch(() => route.path, () => updateSelected(), { immediate: false })

const onMenuClick = (key) => {
  if (key && key !== route.path) router.push(key)
}
</script>

<style scoped>
.touch-layout {
  width: 100%;
  height: 100%;
}
.touch-sider {
  height: 100%;
  overflow: auto;
  border-right: 1px solid var(--color-border);
}
.sider-title {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 600;
}
.touch-header {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}
.touch-content {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
