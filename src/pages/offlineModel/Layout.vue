<template>
  <div class="offline-model-layout">
    <a-layout style="min-height: 100vh">
      <!-- 侧边导航 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        :width="240"
        class="layout-sider"
      >
        <div class="logo">
          <img src="@/assets/logo.svg" alt="logo" />
          <span v-if="!collapsed" class="logo-text">离线模型</span>
        </div>
        
        <a-menu
          :selected-keys="selectedKeys"
          :open-keys="openKeys"
          mode="inline"
          theme="dark"
          @select="handleMenuSelect"
        >
          <a-menu-item key="feature-center" @click="$router.push('/offline-model/feature-center')">
            <template #icon>
              <icon-apps />
            </template>
            特征中心
          </a-menu-item>
          
          <a-menu-item key="model-register" @click="$router.push('/offline-model/model-register')">
            <template #icon>
              <icon-upload />
            </template>
            模型注册
          </a-menu-item>
          
          <a-menu-item key="model-backtrack" @click="$router.push('/offline-model/model-backtrack')">
            <template #icon>
              <icon-history />
            </template>
            模型回溯
          </a-menu-item>
          
          <a-menu-item key="task-management" @click="$router.push('/offline-model/task-management')">
            <template #icon>
              <icon-calendar-clock />
            </template>
            任务管理
          </a-menu-item>
          
          <a-menu-item key="model-evaluation" @click="$router.push('/offline-model/model-evaluation')">
            <template #icon>
              <icon-chart-line />
            </template>
            模型评估
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <!-- 右侧内容区 -->
      <a-layout>
        <!-- 头部 -->
        <a-layout-header class="layout-header">
          <div class="header-left">
            <a-button
              type="text"
              :icon="collapsed ? 'icon-menu-unfold' : 'icon-menu-fold'"
              @click="() => (collapsed = !collapsed)"
            />
            <a-breadcrumb class="breadcrumb">
              <a-breadcrumb-item>离线模型</a-breadcrumb-item>
              <a-breadcrumb-item>{{ currentPageTitle }}</a-breadcrumb-item>
            </a-breadcrumb>
          </div>
          
          <div class="header-right">
            <a-space>
              <a-button type="text" @click="handleRefresh">
                <template #icon>
                  <icon-refresh />
                </template>
              </a-button>
              <a-button type="text" @click="handleHelp">
                <template #icon>
                  <icon-question-circle />
                </template>
              </a-button>
            </a-space>
          </div>
        </a-layout-header>

        <!-- 内容区域 -->
        <a-layout-content class="layout-content">
          <div class="content-wrapper">
            <router-view />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 响应式数据
const collapsed = ref(false)
const selectedKeys = ref([])
const openKeys = ref([])

// 计算属性
const currentPageTitle = computed(() => {
  const titles = {
    'feature-center': '特征中心',
    'model-register': '模型注册',
    'model-backtrack': '模型回溯',
    'task-management': '任务管理',
    'model-evaluation': '模型评估'
  }
  const routeName = route.name?.toLowerCase().replace('offlineModel.', '')
  return titles[routeName] || '离线模型'
})

// 监听路由变化
watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName) {
      const routeName = newRouteName.toLowerCase().replace('offlinemodel.', '')
      selectedKeys.value = [routeName]
    }
  },
  { immediate: true }
)

// 方法
const handleMenuSelect = ({ key }) => {
  selectedKeys.value = [key]
}

const handleRefresh = () => {
  window.location.reload()
}

const handleHelp = () => {
  // TODO: 打开帮助文档
  console.log('打开帮助文档')
}
</script>

<style scoped lang="less">
.offline-model-layout {
  height: 100vh;
  
  .layout-sider {
    background: #001529;
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64px;
      padding: 0 16px;
      background: #001529;
      border-bottom: 1px solid #303030;
      
      img {
        height: 32px;
        margin-right: 8px;
      }
      
      .logo-text {
        color: #fff;
        font-size: 18px;
        font-weight: 500;
        white-space: nowrap;
      }
    }
  }
  
  .layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    
    .header-left {
      display: flex;
      align-items: center;
      
      .breadcrumb {
        margin-left: 16px;
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
    }
  }
  
  .layout-content {
    margin: 24px;
    padding: 24px;
    background: #fff;
    border-radius: 6px;
    
    .content-wrapper {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>