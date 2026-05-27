<template>
  <a-layout class="main-layout">
    <a-layout-header class="main-header">
      <div class="logo">
        <div class="logo-text">数字营销</div>
      </div>
      <a-menu mode="horizontal" :selected-keys="[activeTopMenu]" @menu-item-click="handleTopMenuClick" class="top-menu">
        <a-menu-item key="benefit">权益中心</a-menu-item>
        <a-menu-item key="touch">触达系统</a-menu-item>
        <a-menu-item key="customer">客群中心</a-menu-item>
        <a-menu-item key="canvas">营销画布</a-menu-item>
        <a-menu-item key="call">电销工作台</a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout class="body-layout">
      <a-layout-sider class="main-sider" :width="240" collapsible breakpoint="xl">
        <a-menu :selected-keys="[activeSideMenu]" :default-open-keys="openKeys" @menu-item-click="handleSideMenuClick" :auto-open="true">
          <template v-for="item in currentSideMenus" :key="item.key">
            <a-sub-menu v-if="Array.isArray((item as any).children)" :key="item.key">
              <template #title>{{ item.title }}</template>
              <a-menu-item v-for="child in (item as any).children" :key="child.key">{{ child.title }}</a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="item.key">{{ item.title }}</a-menu-item>
          </template>
        </a-menu>
      </a-layout-sider>
      <a-layout-content class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

console.log('[MKT-MainLayout] route:', route.path)

const activeTopMenu = ref('benefit')
const activeSideMenu = ref('')
const openKeys = ref(['benefit'])

// ========== 权益中心 ==========
const benefitMenus = [
  { key: '/benefit', title: '权益首页' },
  { key: '/benefit/dashboard', title: '权益首页' },
  {
    key: 'coupon-group',
    title: '券管理',
    children: [
      { key: '/benefit/template', title: '券模板管理' },
      { key: '/benefit/management', title: '券管理' },
      { key: '/benefit/package', title: '券包管理' },
      { key: '/benefit/inventory', title: '券库存管理' }
    ]
  },
  {
    key: 'alert-group',
    title: '预警中心',
    children: [
      { key: '/marketing/alert/management', title: '预警管理' },
      { key: '/marketing/alert/rules', title: '预警规则' },
      { key: '/marketing/alert/rules/create', title: '创建预警规则' },
      { key: '/marketing/alert/history', title: '预警历史' }
    ]
  },
  {
    key: 'stats-group',
    title: '统计分析',
    children: [
      { key: '/benefit/statistics', title: '权益统计' },
      { key: '/benefit/logs', title: '权益日志' }
    ]
  }
]

// ========== 触达系统 ==========
const touchMenus = [
  { key: '/touch', title: '触达首页' },
  {
    key: 'policy-group',
    title: '策略管理',
    children: [
      { key: '/touch/policy/overview', title: '策略数据概览' },
      { key: '/touch/policy/template', title: '策略模板' },
      { key: '/touch/policy/template/create', title: '创建策略模板' }
    ]
  },
  {
    key: 'query-group',
    title: '触达查询',
    children: [
      { key: '/touch/query', title: '触达查询' },
      { key: '/touch/query/detail', title: '触达详情' },
      { key: '/touch/query/ai-call-records', title: 'AI呼叫记录' },
      { key: '/touch/query/ai-sms-vendor-records', title: 'AI短信厂商记录' },
      { key: '/touch/query/manual-call-records', title: '人工呼叫记录' },
      { key: '/touch/query/sms-records', title: '短信记录' }
    ]
  },
  {
    key: 'channel-group',
    title: '渠道管理',
    children: [
      { key: '/touch/channel', title: '渠道管理' },
      { key: '/touch/channel/sms-template', title: '短信模板' },
      { key: '/touch/channel/sms-template/create', title: '创建短信模板' },
      { key: '/touch/channel/ai-call-template', title: 'AI外呼模板' },
      { key: '/touch/channel/manual-call-template', title: '人工电销模板' }
    ]
  },
  {
    key: 'vendor-group',
    title: '厂商管理',
    children: [
      { key: '/touch/channel/vendors', title: '厂商管理' },
      { key: '/touch/channel/vendors/sms', title: '短信厂商' },
      { key: '/touch/channel/vendors/ai', title: 'AI厂商' }
    ]
  },
  { key: '/touch/channel/blacklist', title: '黑名单管理' },
  { key: '/touch/channel/alert', title: '渠道预警' },
  { key: '/touch/channel/rate-limit', title: '渠道限流' },
  {
    key: 'system-group',
    title: '系统配置',
    children: [
      { key: '/touch/system', title: '系统概览' },
      { key: '/touch/system/dictionary', title: '系统词典' }
    ]
  },
  { key: '/touch/manual-sms', title: '手动短信' }
]

// ========== 客群中心 ==========
const customerMenus = [
  { key: '/customer', title: '客群首页' },
  {
    key: 'audience-group',
    title: '人群管理',
    children: [
      { key: '/customer/list', title: '人群列表' },
      { key: '/customer/selector', title: '人群圈选' },
      { key: '/customer/portrait', title: '客户画像' }
    ]
  },
  {
    key: 'event-group',
    title: '事件中心',
    children: [
      { key: '/customer/event-center', title: '事件首页' },
      { key: '/customer/event-management', title: '事件管理' },
      { key: '/customer/virtual-events', title: '虚拟事件' },
      { key: '/customer/sample-stats', title: '样本统计' },
      { key: '/customer/kafka-datasource', title: 'Kafka数据源' }
    ]
  },
  {
    key: 'tag-group',
    title: '标签管理',
    children: [
      { key: '/customer/tag-system', title: '标签体系' },
      { key: '/customer/tag-table', title: '标签表管理' },
      { key: '/customer/tag-management', title: '标签管理' },
      { key: '/customer/tag-create', title: '创建标签' },
      { key: '/customer/attribute-management', title: '属性管理' }
    ]
  }
]

// ========== 营销画布 ==========
const canvasMenus = [
  { key: '/canvas', title: '营销画布' },
  { key: '/marketing/tasks/horizontal', title: '横向画布' }
]

// ========== 电销工作台 ==========
const callMenus = [
  {
    key: 'call-group',
    title: '外呼管理',
    children: [
      { key: '/call', title: '数据看板' },
      { key: '/call/task', title: '任务列表' },
      { key: '/call/list', title: '名单管理' },
      { key: '/call/record', title: '通话记录' }
    ]
  },
  {
    key: 'team-group',
    title: '团队',
    children: [
      { key: '/call/agent', title: '坐席管理' },
      { key: '/call/team', title: '班组管理' }
    ]
  },
  {
    key: 'system-group',
    title: '系统',
    children: [
      { key: '/call/settings', title: '系统设置' }
    ]
  }
]

const menuMap: Record<string, any[]> = {
  benefit: benefitMenus,
  touch: touchMenus,
  customer: customerMenus,
  canvas: canvasMenus,
  call: callMenus
}

const currentSideMenus = computed(() => {
  return menuMap[activeTopMenu.value] || benefitMenus
})

watch(() => route.path, (path) => {
  updateMenuState(path)
}, { immediate: true })

function updateMenuState(path: string) {
  // 根据路径更新顶部菜单
  if (path.startsWith('/benefit') || path.startsWith('/coupon') || path.startsWith('/marketing/alert') || path.startsWith('/alert') || path.startsWith('/tasks') || path.startsWith('/marketing/tasks')) {
    activeTopMenu.value = 'benefit'
    openKeys.value = ['benefit']
  } else if (path.startsWith('/touch')) {
    activeTopMenu.value = 'touch'
    openKeys.value = ['touch']
  } else if (path.startsWith('/customer')) {
    activeTopMenu.value = 'customer'
    openKeys.value = ['customer']
  } else if (path.startsWith('/canvas')) {
    activeTopMenu.value = 'canvas'
    openKeys.value = ['canvas']
  } else if (path.startsWith('/call')) {
    activeTopMenu.value = 'call'
    openKeys.value = ['call']
  }
  activeSideMenu.value = path
}

const handleTopMenuClick = (key: string) => {
  activeTopMenu.value = key
  // 跳转到该应用首页
  switch (key) {
    case 'benefit': router.push('/benefit'); break
    case 'touch': router.push('/touch'); break
    case 'customer': router.push('/customer'); break
    case 'canvas': router.push('/canvas'); break
    case 'call': router.push('/call'); break
  }
}

const handleSideMenuClick = (key: string) => {
  if (key) {
    router.push(key)
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.main-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}
.logo {
  margin-right: 40px;
  display: flex;
  align-items: center;
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
.top-menu {
  flex: 1;
}
.body-layout {
  flex: 1;
  overflow: hidden;
  display: flex;
}
.main-sider {
  height: 100%;
  border-right: 1px solid #e5e7eb;
  background: #fff;
}
.main-content {
  flex: 1;
  background: #f9fafb;
  overflow: auto;
  padding: 16px;
  height: 100%;
}
.content-wrapper {
  background: #fff;
  min-height: 100%;
  padding: 20px;
  border-radius: 4px;
}
</style>
