<template>
  <a-layout class="layout-container">
    <tour-guide-button />
    <a-layout-sider
      :collapsed="collapsed"
      :breakpoint="breakpoint"
      :width="220"
      :collapsible="true"
      @collapse="handleCollapse"
      class="layout-sider"
    >
      <div class="menu-wrapper">
        <div class="menu-header">
          <a-input-search
            v-model="searchText"
            :style="{ width: '90%' }"
            placeholder="搜索菜单"
            allow-clear
          />
        </div>
        <a-menu
          :style="{ width: '100%' }"
          :collapsed="collapsed"
          :selected-keys="selectedKeys"
          :default-open-keys="['management']"
          show-collapse-button
          @menu-item-click="handleMenuClick"
        >
          <template v-for="item in filteredMenuItems" :key="item.key">
            <a-menu-item v-if="!item.children" :key="`item-${item.key}`">
              <template #icon>
                <icon-experiment v-if="item.key === 'exploration'" />
                <icon-dashboard v-else-if="item.key === 'marketing'" />
                <icon-safe v-else-if="item.key === 'risk'" />
                <icon-apps v-else />
              </template>
              {{ item.title }}
            </a-menu-item>
            <a-sub-menu v-else-if="item.children" :key="`submenu-${item.key}`">
              <template #icon>
                <icon-common v-if="item.key === 'discovery'" />
                <icon-robot v-else-if="item.key === 'management'" />
                <icon-apps v-else />
              </template>
              <template #title>{{ item.title }}</template>
              <a-menu-item v-for="child in item.children" :key="`child-${child.key}`">
                {{ child.title }}
              </a-menu-item>
            </a-sub-menu>
          </template>
        </a-menu>
      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="layout-header">
        <a-space>
          <a-button type="text" @click="toggleCollapse">
            <template #icon>
              <icon-menu-fold v-if="!collapsed" />
              <icon-menu-unfold v-else />
            </template>
          </a-button>
          <a-breadcrumb :style="{ marginLeft: '16px' }">
            <a-breadcrumb-item>首页</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentRoute }}</a-breadcrumb-item>
          </a-breadcrumb>
        </a-space>
      </a-layout-header>
      <a-layout-content class="layout-content">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TourGuideButton from '@/components/guide/TourGuideButton.vue'
import {
  IconApps,
  IconRobot,
  IconMenuFold,
  IconMenuUnfold,
  IconCommon,
  IconExperiment,
  IconDashboard,
  IconSafe
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const searchText = ref('')
const breakpoint = 'xl'
const selectedKeys = ref([route.name])

const menuItems = [
  {
    key: 'discovery',
    title: '数据发现',
    children: [
      {
        key: 'external',
        title: '外部数据',
        path: '/discovery/external'
      },
      {
        key: 'credit',
        title: '征信变量',
        path: '/discovery/credit'
      }
    ]
  },
  {
    key: 'exploration',
    title: '数据探索',
    path: '/exploration'
  },
  {
    key: 'management',
    title: '数据管理',
    children: [
      {
        key: 'dataService',
        title: '数据服务',
        path: '/management/service'
      },
      {
        key: 'accompany',
        title: '数据陪跑',
        path: '/management/accompany'
      },
      {
        key: 'permission',
        title: '权限服务',
        path: '/management/permission'
      }
    ]
  },
  {
    key: 'marketing',
    title: '数字营销',
    children: [
      {
        key: 'couponTemplate',
        title: '券模版管理',
        path: '/marketing/coupon/template'
      },
      {
        key: 'couponManagement',
        title: '券管理',
        path: '/marketing/coupon/management'
      },
      {
        key: 'couponPackage',
        title: '券包管理',
        path: '/marketing/coupon/package'
      },
      {
        key: 'couponStatistics',
        title: '数据统计',
        path: '/marketing/coupon/statistics'
      },
      {
        key: 'couponRecord',
        title: '发放流水记录',
        path: '/marketing/coupon/record'
      },
      {
        key: 'globalRules',
        title: '全局规则',
        path: '/marketing/coupon/rules'
      },
      {
        key: 'couponInventory',
        title: '库存统计',
        path: '/marketing/coupon/inventory'
      }
    ]
  },
  {
    key: 'risk',
    title: '数字风险',
    path: '/risk'
  }
]

const filteredMenuItems = computed(() => {
  if (!searchText.value) return menuItems
  
  const search = searchText.value.toLowerCase()
  return menuItems.filter(item => {
    const matchItem = item.title.toLowerCase().includes(search)
    if (item.children) {
      item.children = item.children.filter(child =>
        child.title.toLowerCase().includes(search)
      )
      return matchItem || item.children.length > 0
    }
    return matchItem
  })
})

const currentRoute = computed(() => {
  const currentMenu = menuItems.find(item => {
    if (item.children) {
      return item.children.some(child => child.key === route.name)
    }
    return item.key === route.name
  })
  return currentMenu?.title || ''
})

const handleCollapse = (val) => {
  collapsed.value = val
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const handleMenuClick = (key) => {
  // 从key中提取实际的菜单项key
  const actualKey = key.replace(/^(item-|child-|submenu-)/, '')
  
  const findPath = (items) => {
    for (const item of items) {
      if (item.key === actualKey) return item.path
      if (item.children) {
        const childPath = item.children.find(child => child.key === actualKey)?.path
        if (childPath) return childPath
      }
    }
    return null
  }
  
  const path = findPath(menuItems)
  if (path) {
    router.push(path)
    selectedKeys.value = [actualKey]
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-sider {
  background: var(--color-menu-dark-bg);
}

.menu-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 16px;
  display: flex;
  justify-content: center;
}

.layout-header {
  background: var(--color-bg-2);
  padding: 0 16px;
  display: flex;
  align-items: center;
}

.layout-content {
  padding: 16px;
  background: var(--color-fill-2);
}
</style>