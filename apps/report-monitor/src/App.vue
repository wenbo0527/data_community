<template>
  <div class="min-h-screen bg-gray-50">
    <a-layout class="h-screen">
      <a-layout-header class="bg-white border-b border-gray-200 px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold text-gray-900">报表监控系统</h1>
            <a-menu
              mode="horizontal"
              :selected-keys="selectedKeys"
              @menu-item-click="handleMenuClick"
              class="border-0"
            >
              <a-menu-item key="dashboard">
                <template #icon><icon-dashboard /></template>
                仪表盘
              </a-menu-item>
              <a-menu-item key="targets">
                <template #icon><icon-common /></template>
                监控目标
              </a-menu-item>
              <a-menu-item key="explore">
                <template #icon><icon-search /></template>
                探索模式
              </a-menu-item>
              <a-menu-item key="rules">
                <template #icon><icon-list /></template>
                监控规则
              </a-menu-item>
              <a-menu-item key="schedules">
                <template #icon><icon-schedule /></template>
                调度计划
              </a-menu-item>
              <a-menu-item key="runs">
                <template #icon><icon-history /></template>
                运行记录
              </a-menu-item>
              <a-menu-item key="alerts">
                <template #icon><icon-notification /></template>
                告警中心
              </a-menu-item>
            </a-menu>
          </div>
          <div class="flex items-center space-x-2">
            <a-badge :count="openAlertCount" :offset="[-2, 2]">
              <a-button shape="circle" size="small">
                <icon-notification />
              </a-button>
            </a-badge>
          </div>
        </div>
      </a-layout-header>
      
      <a-layout-content class="p-6 overflow-auto">
        <router-view />
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMonitorStore } from '@/store/monitor'
import {
  IconDashboard,
  IconCommon,
  IconList,
  IconSchedule,
  IconHistory,
  IconNotification,
  IconSearch
} from '@arco-design/web-vue/es/icon'

const route = useRoute()
const router = useRouter()
const store = useMonitorStore()

const selectedKeys = computed(() => {
  const path = route.path.slice(1) || 'dashboard'
  return [path]
})

const openAlertCount = computed(() => store.openAlerts.length)

const handleMenuClick = (key: string) => {
  router.push(`/${key}`)
}

watch(
  () => route.path,
  () => {
    store.setError(null)
  }
)

// Load data when app starts
onMounted(async () => {
  await Promise.all([
    store.loadTargets(),
    store.loadRules(),
    store.loadSchedules(),
    store.loadRuns(),
    store.loadAlerts()
  ])
})
</script>