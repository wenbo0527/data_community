<template>
  <a-layout class="layout-container">
    <!-- 头部导航区 -->
    <a-layout-header class="header">
      <div class="logo">
        <img src="../../assets/logo.svg" alt="logo" />
      </div>
      <div class="nav-menu">
        <a-menu mode="horizontal" :selected-keys="[activeMenu]">
          <a-menu-item key="home" @click="$router.push('/home')">首页</a-menu-item>
          <a-menu-item key="discovery" @click="$router.push('/discovery/external')">数据发现</a-menu-item>
          <a-menu-item key="management" @click="$router.push('/management/service')">数据管理</a-menu-item>
          <a-menu-item key="exploration" @click="$router.push('/exploration')">数据探索</a-menu-item>
          <a-menu-item key="digital-marketing" @click="$router.push('/digital-marketing')">数字营销</a-menu-item>
        </a-menu>
      </div>
      <div class="header-right">
        <a-space>
          <a-button-group>
            <a-button type="outline" size="small" @click="toggleUserRole">切换角色</a-button>
            <a-button type="outline" size="small" @click="toggleDepartment">切换部门</a-button>
            <a-button type="outline" size="small" @click="showWelcomeModal = true">显示弹窗</a-button>
          </a-button-group>
          <a-avatar>
            <IconUser />
          </a-avatar>
          <a-dropdown>
            <a-button type="text">{{ userStore.userInfo.username }}<IconDown /></a-button>
            <template #content>
              <a-doption>个人设置</a-doption>
              <a-doption>退出登录</a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </a-layout-header>

    <a-layout>
      <a-layout-content class="content">
        <!-- 欢迎横幅 -->
        <div class="welcome-banner">
          <div class="banner-content">
            <div class="welcome-text">
              <h1>欢迎回来，{{ username }}！</h1>
            </div>
          </div>
        </div>
        
        <a-row :gutter="12" class="main-content-row">
          <!-- 左侧区域 -->
          <a-col :span="6" class="left-column">
            <!-- 身份卡区 -->
            <a-card class="card-container">
              <template #title>身份信息</template>
              <template #extra>
                 <a-badge :count="3" :offset="[10, 0]">
                   <IconNotification style="font-size: 16px; color: #165dff;" />
                 </a-badge>
               </template>
              <div class="identity-info">
                <div class="user-profile">
                  <div class="avatar-container">
                    <img src="/squirrel-avatar.svg" alt="avatar" class="avatar-image" />
                    <div class="online-indicator"></div>
                  </div>
                  <div class="user-details">
                    <h3 class="user-name">张珊</h3>
                    <p class="department">数学部 · 数据应用团队</p>
                  </div>
                </div>
                <div class="user-stats">
                  <div class="stat-item">
                    <span class="stat-value">128</span>
                    <span class="stat-label">数据集</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">45</span>
                    <span class="stat-label">项目</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">12</span>
                    <span class="stat-label">待办</span>
                  </div>
                </div>
                <div class="quick-actions">
                  <div class="action-item">
                    <IconUser class="action-icon" />
                    <span>角色</span>
                  </div>
                  <div class="action-item">
                    <IconStorage class="action-icon" />
                    <span>资源</span>
                  </div>
                  <div class="action-item">
                    <IconFile class="action-icon" />
                    <span>待办</span>
                  </div>
                </div>
              </div>
            </a-card>

            <!-- 快速通道 -->
            <a-card class="card-container">
              <template #title>快速通道</template>
              <div class="quick-channel-compact">
                <div class="channel-row">
                  <div v-for="channel in quickChannels.slice(0, 4)" :key="channel.id" class="channel-item-compact" @click="navigateToPath(channel.path)">
                    <component :is="channel.icon" class="channel-icon-compact" />
                    <span>{{ channel.name }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 添加快捷方式弹窗 -->
              <a-modal v-model:visible="showAddDialog" title="添加快捷方式" @ok="handleAddChannel" @cancel="showAddDialog = false">
                <a-form :model="newChannel">
                  <a-form-item field="name" label="名称">
                    <a-input v-model="newChannel.name" placeholder="请输入快捷方式名称" />
                  </a-form-item>
                  <a-form-item field="path" label="页面路径">
                    <a-select v-model="newChannel.path" placeholder="请选择页面路径">
                      <a-option v-for="path in availablePaths" :key="path.value" :value="path.value">{{ path.label }}</a-option>
                    </a-select>
                  </a-form-item>
                </a-form>
              </a-modal>
            </a-card>

            <!-- 社区加油站 -->
            <a-card class="card-container">
              <template #title>社区加油站</template>
              <div class="community-links-compact">
                <div class="community-row">
                  <div class="community-item-compact">
                    <IconBook class="community-icon-compact" />
                    <span>制度索引</span>
                  </div>
                  <div class="community-item-compact">
                    <IconFile class="community-icon-compact" />
                    <span>案例库</span>
                  </div>
                  <div class="community-item-compact">
                    <IconNotification class="community-icon-compact" />
                    <span>社区发布</span>
                  </div>
                  <div class="community-item-compact">
                    <IconBulb class="community-icon-compact" />
                    <span>使用指南</span>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <!-- 右侧区域 -->
          <a-col :span="18" class="right-column">
            <!-- 指标卡片区 -->
            <a-card title="社区数据站" class="card-container">
              <a-row :gutter="12" class="metric-cards">
              <a-col :span="6" v-for="metric in metrics" :key="metric.title">
                <a-card class="metric-card">
                  <div class="metric-content">
                    <a-statistic
                      :title="metric.title"
                      :value="metric.value"
                      :precision="2"
                      show-group-separator
                      suffix="亿元"
                      :value-style="{ color: metric.color }"
                    >
                      <template #prefix>
                        <icon-arrow-rise v-if="metric.trend === 'up'" style="color: #0fbf60" />
                        <icon-arrow-fall v-else style="color: #f53f3f" />
                      </template>
                    </a-statistic>
                    <div class="comparison-data"><span class="comparison-item">较前一日：<span :style="{ color: metric.dayOverDay >= 0 ? '#0fbf60' : '#f53f3f' }">{{ metric.dayOverDay >= 0 ? '+' : '' }}{{ metric.dayOverDay }}%</span></span></div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
            </a-card>

            <!-- 数据架构图和通知栏 -->
            <a-row :gutter="12" class="bottom-row">
              <a-col :span="16" class="architecture-column">
                <a-card title="社区架构图" class="card-container">
                  <ArchitectureChart />
                </a-card>
              </a-col>
              <a-col :span="8" class="notice-column">
                <a-card title="通知公告" class="card-container">
                  <a-tabs>
                    <a-tab-pane key="notice" title="通知">
                      <a-list :max-height="400">
                        <a-list-item v-for="notice in notices" :key="notice.id">
                          <a-space direction="vertical" style="width: 100%">
                            <div class="notice-title">
                              <a-typography-text>{{ notice.title }}</a-typography-text>
                              <a-tag :color="getNoticeTypeColor(notice.type)">{{ notice.type }}</a-tag>
                            </div>
                            <a-typography-text type="secondary" class="notice-time">{{ notice.time }}</a-typography-text>
                          </a-space>
                        </a-list-item>
                      </a-list>
                    </a-tab-pane>
                    <a-tab-pane key="todo" title="待办">
                      <a-list :max-height="400">
                        <a-list-item v-for="todo in todos" :key="todo.id">
                          <a-space direction="vertical" style="width: 100%">
                            <div class="notice-title">
                              <a-typography-text>{{ todo.title }}</a-typography-text>
                              <a-tag :color="todo.priority === '高' ? 'red' : todo.priority === '中' ? 'orange' : 'blue'">{{ todo.priority }}</a-tag>
                            </div>
                            <a-typography-text type="secondary" class="notice-time">截止时间：{{ todo.deadline }}</a-typography-text>
                          </a-space>
                        </a-list-item>
                      </a-list>
                    </a-tab-pane>
                  </a-tabs>
                </a-card>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </a-layout-content>
    </a-layout>
    
    <!-- 欢迎弹窗 -->
    <home-welcome-modal
      v-model:visible="showWelcomeModal"
      :is-new-user="userStore.isNewUser"
    />
  </a-layout>
</template>

<script setup>
import ArchitectureChart from '../../components/layout/ArchitectureChart.vue';
import { ref, onMounted, markRaw } from 'vue'
import HomeWelcomeModal from '../../components/modals/HomeWelcomeModal.vue'
import { useUserStore } from '../../store/modules/user'
import { Statistic } from '@arco-design/web-vue'
import {
  IconUser,
  IconDown,
  IconApps,
  IconFile,
  IconNotification,
  IconStorage,
  IconBook,
  IconBulb,
  IconArrowRise,
  IconArrowFall,
  IconQuestion,
  IconCompass,
  IconEye,
  IconCloud,
  IconStar,
  IconPlus
} from '@arco-design/web-vue/es/icon'

const userStore = useUserStore()

const toggleDepartment = () => {
  const departments = ['risk', 'marketing', 'data']
  const currentIndex = departments.indexOf(userStore.userInfo.department)
  const nextIndex = (currentIndex + 1) % departments.length
  userStore.setUserDepartment(departments[nextIndex])
}

// 控制欢迎弹窗
const showWelcomeModal = ref(false)

// 切换用户角色
const toggleUserRole = () => {
  userStore.isNewUser = !userStore.isNewUser
}

// 初始化用户角色和欢迎弹窗
onMounted(async () => {
  const isNewUser = await userStore.checkUserRole()
  showWelcomeModal.value = true
})

// 通知数据
const notices = ref([
  {
    id: 1,
    title: '数据社区平台使用指南V2.0发布',
    type: '使用指南',
    time: '2024-01-15 10:00'
  },
  {
    id: 2,
    title: '数据接口申请工单已审批通过',
    type: '工单进度',
    time: '2024-01-14 15:30'
  },
  {
    id: 3,
    title: '数据社区2024年度工作规划',
    type: '社区发布',
    time: '2024-01-13 09:00'
  },
  {
    id: 4,
    title: '数据治理最佳实践案例分享',
    type: '案例',
    time: '2024-01-12 16:45'
  }
])

// 获取通知类型对应的颜色
const getNoticeTypeColor = (type) => {
  const colorMap = {
    '使用指南': 'blue',
    '工单进度': 'green',
    '社区发布': 'purple',
    '案例': 'orange'
  }
  return colorMap[type] || 'blue'
}

// 待办数据
const todos = ref([
  {
    id: 1,
    title: '数据质量周报审核',
    priority: '高',
    deadline: '2024-01-16 18:00'
  },
  {
    id: 2,
    title: '新增数据接口评审',
    priority: '中',
    deadline: '2024-01-17 12:00'
  },
  {
    id: 3,
    title: '数据安全培训',
    priority: '低',
    deadline: '2024-01-18 15:00'
  },
  {
    id: 4,
    title: '月度数据统计报告',
    priority: '高',
    deadline: '2024-01-19 17:00'
  }
])

// 使用markRaw包装图标组件
const icons = {
  IconQuestion: markRaw(IconQuestion),
  IconCompass: markRaw(IconCompass),
  IconEye: markRaw(IconEye),
  IconApps: markRaw(IconApps)
}

const username = ref('张珊')
const department = ref('数学部')
const activeMenu = ref('home')

// 快速通道数据
const quickChannels = ref([
  { id: 1, icon: icons.IconQuestion, name: '客户360', path: '/customer360' },
  { id: 2, icon: icons.IconCompass, name: '数据地图', path: '/data-map' },
  { id: 3, icon: icons.IconEye, name: '消费中心', path: '/consumption' }
])

// 添加快捷方式弹窗
const showAddDialog = ref(false)
const newChannel = ref({
  name: '',
  path: ''
})

// 可选的页面路径
const availablePaths = [
  { label: '首页', value: '/home' },
  { label: '数据发现', value: '/discovery/external' },
  { label: '数据管理', value: '/management/service' },
  { label: '数据探索', value: '/exploration' },
  { label: '营销分析', value: '/marketing' }
]

// 添加快捷方式
const handleAddChannel = () => {
  if (newChannel.value.name && newChannel.value.path) {
    quickChannels.value.push({
      id: Date.now(),
      icon: icons.IconApps,
      name: newChannel.value.name,
      path: newChannel.value.path
    })
    newChannel.value = { name: '', path: '' }
    showAddDialog.value = false
  }
}

// 跳转到对应页面
const navigateToPath = (path) => {
  if (path) {
    router.push(path)
  }
}

// 指标卡片数据
const metrics = ref([
  {
    title: '上日在途余额',
    value: 1234.56,
    trend: 'up',
    color: '#0fbf60',
    dayOverDay: 2.3 // 较前一日
  },
  {
    title: '上日放款金额',
    value: 987.65,
    trend: 'down',
    color: '#f53f3f',
    dayOverDay: -1.5
  },
  {
    title: '上日还款金额',
    value: 876.54,
    trend: 'up',
    color: '#0fbf60',
    dayOverDay: 3.2
  },
  {
    title: '上日在途加权定价',
    value: 765.43,
    trend: 'down',
    color: '#f53f3f',
    dayOverDay: -0.8
  }
])
</script>

<style scoped>
.layout-container {
  height: 100vh;
  min-width: 320px;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 欢迎横幅样式 */
.welcome-banner {
  margin-bottom: 16px;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(114, 46, 209, 0.1) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.banner-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  z-index: 2;
}

.welcome-text h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}





/* 主要内容区域布局 */
.main-content-row {
  align-items: stretch;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
}

.left-column .card-container:last-child {
  margin-bottom: 0;
  flex: 1;
}

.right-column > .card-container {
  margin-bottom: 24px;
}

.right-column > .card-container:last-child {
  margin-bottom: 0;
}

/* 底部行布局 */
.bottom-row {
  align-items: stretch;
  margin-top: 0;
}

.architecture-column,
.notice-column {
  display: flex;
  flex-direction: column;
}

.architecture-column .card-container,
.notice-column .card-container {
  height: 100%;
  margin-bottom: 0;
}

/* 在线状态指示器 */
.online-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: #00d084;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 208, 132, 0.3);
}

/* 用户统计数据 */
.user-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  padding: 16px;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.05) 0%, rgba(114, 46, 209, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(22, 93, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #165dff;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(229, 230, 235, 0.4);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.5);
  flex: 1;
}

.action-item:hover {
  background: rgba(22, 93, 255, 0.08);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 20px;
  color: #165dff;
  transition: all 0.3s;
}

.action-item:hover .action-icon {
  transform: scale(1.1);
  color: #722ed1;
}

.action-item span {
  font-size: 11px;
  color: #4e5969;
  font-weight: 500;
}

.metric-cards {
  margin-bottom: 24px;
}

.metric-card {
  height: 140px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.metric-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.header {
  height: 72px;
  padding: 0 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-menu {
  flex: 1;
  margin: 0 64px;
}

.nav-menu :deep(.arco-menu) {
  background: transparent;
  border-bottom: none;
}

.nav-menu :deep(.arco-menu-item) {
  font-size: 15px;
  padding: 0 28px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin: 0 4px;
}

.nav-menu :deep(.arco-menu-item:hover) {
  background: rgba(22, 93, 255, 0.1);
  color: #165dff;
}

.content {
  padding: 32px;
  background: transparent;
  height: calc(100vh - 72px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-container {
  margin-bottom: 24px;
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-container:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

.card-container :deep(.arco-card-header) {
  min-height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(229, 230, 235, 0.6);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px 20px 0 0;
}

.card-container :deep(.arco-card-body) {
  padding: 24px;
}

.identity-info {
  padding: 20px;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.05) 0%, rgba(114, 46, 209, 0.05) 100%);
  border-radius: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.user-details {
  flex: 1;
  text-align: left;
}

.avatar-container {
  width: 60px;
  height: 60px;
  position: relative;
  border-radius: 50%;
  box-shadow: 0 6px 20px rgba(22, 93, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.user-name {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.department {
  margin: 0;
  font-size: 13px;
  color: #86909c;
  font-weight: 500;
}

.user-stats {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  flex: 1;
  transition: all 0.3s;
}

.stat-item:hover {
  background: rgba(22, 93, 255, 0.08);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #165dff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
}



.quick-channel-compact {
  padding: 12px 0;
}

.channel-row {
  display: flex;
  gap: 8px;
}

.channel-item-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  flex: 1;
}

.channel-item-compact:hover {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.05) 0%, rgba(114, 46, 209, 0.05) 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(22, 93, 255, 0.15);
  border-color: rgba(22, 93, 255, 0.2);
}

.channel-icon-compact {
  font-size: 24px;
  margin-bottom: 8px;
  color: #165dff;
  filter: drop-shadow(0 2px 4px rgba(22, 93, 255, 0.2));
  transition: all 0.3s;
}

.channel-item-compact:hover .channel-icon-compact {
  transform: scale(1.1);
  color: #722ed1;
}

.channel-item-compact span {
  font-size: 12px;
  color: #4e5969;
  font-weight: 500;
  text-align: center;
}



.community-links-compact {
  padding: 8px 0;
}

.community-row {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.community-item-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 6px;
  border-radius: 6px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  flex: 1;
  min-width: 0;
}

.community-item-compact:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.community-item-compact span {
  font-size: 12px;
  color: #333;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.community-icon-compact {
  font-size: 16px;
  color: #1890ff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.community-icon-compact:hover {
  transform: scale(1.1);
}

.metric-card :deep(.arco-card-body) {
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
}

.metric-card :deep(.arco-statistic-title) {
  font-size: 14px;
  margin-bottom: 12px;
  color: #86909c;
  font-weight: 500;
}

.metric-card :deep(.arco-statistic-value) {
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comparison-data {
  display: flex;
  justify-content: center;
  font-size: 12px;
  color: #86909c;
  padding: 8px 16px;
  background: rgba(22, 93, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(22, 93, 255, 0.1);
}

.comparison-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.architecture-chart {
  height: 320px;
  background-image: url('/architecture.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  border-radius: 16px;
  background-color: rgba(22, 93, 255, 0.02);
  border: 1px solid rgba(22, 93, 255, 0.1);
  transition: all 0.3s;
}

.architecture-chart:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(22, 93, 255, 0.1);
}

.notice-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  line-height: 1.5;
  transition: color 0.3s;
}

.notice-title:hover {
  color: #165dff;
}
</style>