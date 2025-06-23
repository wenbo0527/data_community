<template>
  <a-layout class="layout-container">
    <!-- 顶部菜单栏 -->
    <a-layout-header class="top-menu"
      style="padding: 0 24px; background: #f8f9fa; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <a-menu mode="horizontal" :selected-keys="[activeTopMenu]" @menu-item-click="handleTopMenuClick">
        <a-menu-item key="home">首页</a-menu-item>
        <a-menu-item key="discovery">数据发现</a-menu-item>
        <a-menu-item key="exploration">数据探索</a-menu-item>
        <a-menu-item key="management">数据管理</a-menu-item>
        <a-menu-item key="marketing">数字营销</a-menu-item>
        <a-menu-item key="risk">数字风险</a-menu-item>
        <a-menu-item key="touch">触达管理</a-menu-item>
      </a-menu>
    </a-layout-header>

    <a-layout>
      <!-- 侧边菜单栏 -->
      <a-layout-sider :collapsed="collapsed" :breakpoint="breakpoint" :width="220" :collapsible="true"
        @collapse="handleCollapse" class="layout-sider" v-show="showSideMenu">
        <div class="menu-wrapper">
          <div class="menu-header" v-if="!isDetailPage">
            <a-input-search v-model="searchText" :style="{ width: '90%' }" placeholder="搜索菜单" allow-clear />
          </div>
          <a-menu :style="{ width: '100%' }" :collapsed="collapsed" :selected-keys="selectedKeys"
            :default-open-keys="['management']" show-collapse-button @menu-item-click="handleMenuClick"
            :active-key-style="{ color: 'rgb(var(--primary-6))', fontWeight: 'bold', borderLeft: '3px solid rgb(var(--primary-6))', paddingLeft: '13px' }"
            :hover-key-style="{ backgroundColor: 'var(--color-fill-2)' }" :item-margin="12">
            <template v-for="item in filteredMenuItems" :key="item.key">
              <template v-if="!item.children">
                <a-menu-item @click="() => handleMenuClick(item.key)">
                  <template #icon>
                    <icon-experiment v-if="item.key === 'exploration'" />
                    <icon-dashboard v-else-if="item.key === 'marketing'" />
                    <icon-safe v-else-if="item.key === 'risk'" />
                    <icon-apps v-else />
                  </template>
                  <span class="menu-item-text">{{ item.title }}</span>
                </a-menu-item>
              </template>
              <template v-else>
                <a-sub-menu :key="item.key">
                  <template #icon>
                    <icon-common v-if="item.key === 'discovery'" />
                    <icon-robot v-else-if="item.key === 'management'" />
                    <icon-apps v-else-if="item.key === 'apps'" />
                    <icon-common v-else-if="item.key === 'touch'" />
                    <icon-common v-else-if="item.key === 'reach'" />
                  </template>
                  <template #title>{{ item.title }}</template>
                  <!-- 递归渲染子菜单 -->
                  <template v-for="child in item.children" :key="child.key">
                    <template v-if="child.children && child.children.length > 0">
                      <a-sub-menu :key="child.key">
                        <template #title>{{ child.title }}</template>
                        <template v-for="grandchild in child.children" :key="grandchild.key">
                          <a-menu-item @click="() => handleMenuClick(grandchild.key)">
                            <span class="menu-item-text">{{ grandchild.title }}</span>
                          </a-menu-item>
                        </template>
                      </a-sub-menu>
                    </template>
                    <template v-else>
                      <a-menu-item @click="() => handleMenuClick(child.key)">
                        <span class="menu-item-text">{{ child.title }}</span>
                      </a-menu-item>
                    </template>
                  </template>
                </a-sub-menu>
              </template>
            </template>
          </a-menu>
        </div>
      </a-layout-sider>

      <!-- 主内容区 -->
      <a-layout>
        <a-layout-header class="layout-header">
          <a-space>
            <a-button type="text" @click="toggleCollapse">
              <template #icon>
                <icon-menu-fold v-if="!collapsed" />
                <icon-menu-unfold v-else />
              </template>
            </a-button>
            <a-breadcrumb :style="{ marginLeft: '24px', color: '#666' }" separator="/">
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
const isDetailPage = computed(() => route.path.includes('/discovery/customer360/detail'))

const collapsed = ref(false)
const searchText = ref('')
const breakpoint = 'xl'
const selectedKeys = ref([route.name])
const activeTopMenu = ref('discovery')
const showSideMenu = ref(true)

const handleTopMenuClick = (key) => {
  activeTopMenu.value = key
  selectedKeys.value = []

  // 默认展开当前菜单
  if (key !== 'home') {
    const menuItem = menuItems.find(item => item.key === key)
    if (menuItem) {
      if (menuItem.children && menuItem.children.length > 0) {
        const firstChild = menuItem.children[0]
        if (firstChild && firstChild.path) {
          router.push(firstChild.path)
          selectedKeys.value = [firstChild.key]
        }
        // 设置当前激活的顶部菜单
        activeTopMenu.value = key
      } else if (menuItem.path) {
        router.push(menuItem.path)
        selectedKeys.value = [menuItem.key]
      }
      // 确保触达管理菜单点击时显示子菜单
      if (key === 'touch') {
        activeTopMenu.value = key
        const firstChild = menuItem.children?.[0]
        if (firstChild) {
          selectedKeys.value = [firstChild.key]
        }
      }
    }
  } else {
    router.push('/home')
    activeTopMenu.value = ''
  }
}



import { touchMenuItems } from './touchMenuItems'

const menuItems = [
  {
    key: 'discovery',
    title: '数据发现',
    children: [
      {
            key: 'asset-overview',
            title: '资产总览',
            path: '/discovery/asset-overview'
          },
      {
        key: 'dataMap',
        title: '统一搜索',
        path: '/discovery/data-map'
      },
      {
        key: 'full-data',
        title: '全量数据',
        path: '/discovery/data-map/TableList'
      },
      {
        key: 'data-asset',
        title: '数据资产',
        children: [
          
          {
            key: 'metrics-map',
            title: '指标地图',
            path: '/discovery/metrics-map'
          },
          {
            key: 'credit-variables',
            title: '征信变量',
            path: '/discovery/credit'
          },

          {
            key: 'external-data',
            title: '外部数据',
            path: '/external-data-v1/external-v1'
          }
        ]
      },
      {
        key: 'data-register',
        title: '数据注册',
        children: [

        {
            key: 'table-management',
            title: '表管理',
            path: '/discovery/asset-management/table-management'
          },
          {
            key: 'external-data-management',
            title: '外部数据管理',
            path: '/discovery/asset-management/external-data-management'
          },
          {
            key: 'metric-management',
            title: '指标管理',
            path: '/discovery/asset-management/metric-management'
          },
          {
            key: 'batch-asset-management',
            title: '批量资产管理',
            path: '/discovery/asset-management/batch-asset-management'
          }
        ]
      }
    ]
  },
  {
    key: 'exploration',
    title: '数据探索',
    children: [
      {
        key: 'explorationIndex',
        title: '探索首页',
        path: '/exploration/index'
      },
      {
        key: 'data-register',
        title: '外数生命周期',
        children: [
      {
        key: 'budget-management',
        title: '预算管理',
        path: '/exploration/budget-management'
      },
      {
        key: 'external-data-evaluation',
        title: '外部数据评估',
        path: '/exploration/external-data-evaluation'
      },
      {
        key: 'external-data-monitor',
        title: '外部数据监控',
        path: '/exploration/external-monitor'
      }
    ]
    }
      ,
      { key: 'customer360',
      title: '客户360',
        path: '/discovery/customer360'
      }
    ]

  },
  {
    key: 'management',
    title: '数据管理',
    children: [
      { key: 'management-service', title: '数据服务', path: '/management/service', name: 'management-service' },

      {
        key: 'permission',
        title: '权限管理',
        path: '/management/permission'
      },
      { key: 'accompany', title: '陪跑计划', path: '/management/accompany', children: [{ key: 'management-accompany-create', title: '创建陪跑', path: '/management/accompany/create' }, { key: 'management-accompany-result', title: '陪跑结果', path: '/management/accompany/result' }] },
    ]
  },
  {
    key: 'marketing',
    title: '数字营销',
    children: [
      {
        key: 'dashboard',
        title: '权益首页',
        path: '/marketing/dashboard'
      },
      {
        key: 'benefitConfig', title: '权益配置', children: [
          { key: 'template', title: '模板管理', route: '/marketing/benefit/template' },
          { key: 'management', title: '券管理', route: '/marketing/benefit/management' },
          { key: 'package', title: '券包管理', route: '/marketing/benefit/package' }
        ]
      },
      {
        key: 'dataStatistics', title: '数据统计', children: [
          { key: 'couponLogs', title: '权益日志', path: '/marketing/statistics/logs' },
          { key: 'inventory', title: '库存查询', path: '/marketing/statistics/inventory' }
        ]
      }
    ]
  },
  {
    key: 'risk',
    title: '数字风险',
    children: [
      {
        key: 'risk-index',
        title: '风险首页',
        path: '/risk/index'
      }
    ]
  },
  {
    key: 'touch',
    title: '触达管理',
    children: [...touchMenuItems]
  }
]


const filteredMenuItems = computed(() => {
  let items = menuItems

  // 根据顶部菜单过滤
  if (activeTopMenu.value) {
    items = items.filter(item =>
      item.key === activeTopMenu.value ||
      item.path?.startsWith('/marketing')
    )
  }

  // 根据搜索文本过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    items = items.map(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child =>
          child.title.toLowerCase().includes(search)
        )
        return { ...item, children: filteredChildren }
      }
      return item
    }).filter(item =>
      item.children?.length ||
      item.title.toLowerCase().includes(search)
    )
  }

  return items
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

const routeLogs = ref([]);

const handleMenuClick = (key) => {
  try {
    // 只处理字符串类型的key
    if (typeof key !== 'string') {
      console.error('Invalid route key:', key);
      return;
    }

    const routeName = {
      'dashboard': 'couponDashboard',
      'budget-management': 'budgetManagement',
      'external-data-evaluation': 'externalDataEvaluation',
      'external-data-monitor': 'external-data-monitor',
      'full-data': 'TableList',
      'metrics-map': 'metricsMap',
      'data-map': 'dataMap',
      'credit-variables': 'credit',
      'asset-overview': 'AssetOverview',
      'external-data': 'ExternalDataV1List',
      'table-management': 'TableManagement',
      'external-data-management': 'ExternalDataManagement',
      'metric-management': 'MetricManagement',
      'batch-asset-management': 'BatchAssetManagement',
      'management-service': 'management-service',
      'management-data-map': 'management-data-map',
      'permission': 'permission',
      'accompany': 'accompany',
      'data-map': 'managementDataMap',
      'template': 'template',
      'management': 'management',
      'package': 'package',
      'couponLogs': 'couponLogs',
      'inventory': 'inventory'
    }[key] || key;

    try {
      let route;
      if (['service', 'permission', 'accompany', 'data-map'].includes(key)) {
        route = router.resolve(`/management/${key}`);
      } else {
        route = router.resolve({ name: routeName });
      }
      if (route.matched.length === 0) {
        throw new Error(`No match for route ${routeName}`);
      }

      // 记录路由跳转日志
      routeLogs.value.unshift({
        timestamp: new Date().toLocaleString(),
        from: route.path,
        to: route.path,
        key: key
      });
      // 只保留最近10条日志
      if (routeLogs.value.length > 10) {
        routeLogs.value.pop();
      }

      router.push(route);
    } catch (error) {
      console.error('Route navigation failed:', error);
    }
  } catch (error) {
    console.error('路由跳转失败:', error);
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.top-menu {
  padding: 0 24px;
  background: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.layout-sider {
  background: #ffffff;
}

.menu-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 20px 16px;
  display: flex;
  justify-content: center;
}

.menu-item-text {
  font-size: 14px;
  line-height: 22px;
}

.layout-header {
  background: #ffffff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.layout-content {
  padding: 16px;
  background: var(--color-fill-2);
}
</style>