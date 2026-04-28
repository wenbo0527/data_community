<template>
  <div class="discovery-layout">
    <!-- 左侧内部菜单 -->
    <aside class="discovery-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">💎 {{ domainTitle }}</span>
      </div>
      <a-menu
        v-model:selected-keys="selectedKeys"
        v-model:open-keys="openKeys"
        mode="inline"
        class="discovery-menu"
        @click="handleMenuClick"
      >
        <!-- 数据地图（默认首页） -->
        <a-menu-item key="/discovery/data-map">
          <template #icon><icon-apps /></template>
          数据地图
        </a-menu-item>

        <!-- 数据资源发现 -->
        <a-sub-menu key="data-resources">
          <template #title>
            <span><icon-cloud /> 数据资源发现</span>
          </template>
          <a-menu-item key="/discovery/data-resources/business-system">业务系统数据源</a-menu-item>
          <a-menu-item key="/discovery/data-resources/file-import">文件资源</a-menu-item>
          <a-menu-item key="/discovery/data-resources/external-data">外部数据源</a-menu-item>
          <a-menu-item key="/discovery/data-resources/real-time-data">实时数据源</a-menu-item>
          <a-menu-item key="/discovery/data-resources/log-data">日志数据源</a-menu-item>
        </a-sub-menu>

        <!-- 数据资产发现 -->
        <a-sub-menu key="data-assets">
          <template #title>
            <span><icon-folder /> 数据资产发现</span>
          </template>
          <a-menu-item key="/discovery/data-map/table-list">资产目录</a-menu-item>
        </a-sub-menu>

        <!-- 数据要素发现 -->
        <a-sub-menu key="data-elements">
          <template #title>
            <span><icon-mind-mapping /> 数据要素发现</span>
          </template>
          <a-menu-item key="/discovery/metrics-map">指标地图</a-menu-item>
          <a-menu-item key="/discovery/variable-map">变量地图</a-menu-item>
          <a-menu-item key="/discovery/feature-map">特征地图</a-menu-item>
          <a-menu-item key="/discovery/api-market">其他</a-menu-item>
        </a-sub-menu>

        <!-- 数据资产运营工具 -->
        <a-sub-menu key="analysis-tools">
          <template #title>
            <span><icon-tools /> 数据资产运营工具</span>
          </template>
          <a-menu-item key="/discovery/lineage">全链路血缘</a-menu-item>
          <a-menu-item key="/discovery/impact-analysis">影响分析</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </aside>

    <!-- 右侧内容区 -->
    <main class="discovery-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const domainTitle = ref('数据发现')
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// 从当前路由同步选中状态
const syncSelectedKeys = () => {
  const path = route.path
  selectedKeys.value = [path]
  // 展开对应的 sub-menu
  if (path.startsWith('/discovery/data-resources')) openKeys.value = ['data-resources']
  else if (path.startsWith('/discovery/data-map/table-list')) openKeys.value = ['data-assets']
  else if (path.startsWith('/discovery/metrics-map') || path.startsWith('/discovery/variable-map') || path.startsWith('/discovery/feature-map') || path.startsWith('/discovery/api-market')) openKeys.value = ['data-elements']
  else if (path.startsWith('/discovery/lineage') || path.startsWith('/discovery/impact-analysis')) openKeys.value = ['analysis-tools']
}

watch(() => route.path, syncSelectedKeys, { immediate: true })

const handleMenuClick = ({ key }: { key: string }) => {
  if (key !== route.path) {
    router.push(key)
  }
}
</script>

<style scoped>
.discovery-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.discovery-sidebar {
  width: 240px;
  min-width: 240px;
  background: #fff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e6eb;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.discovery-menu {
  border-right: none !important;
  flex: 1;
}

.discovery-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
