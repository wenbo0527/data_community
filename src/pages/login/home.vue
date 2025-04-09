<template>
  <a-layout class="layout-container">
    <!-- 头部导航区 -->
    <a-layout-header class="header">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="logo" />
        <a-typography-title :heading="4" style="margin: 0">数据社区</a-typography-title>
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
        <a-row :gutter="12">
          <!-- 左侧区域 -->
          <a-col :span="6">
            <!-- 身份卡区 -->
            <a-card class="card-container">
              <template #title>身份信息</template>
              <div class="identity-info">
                <div class="avatar-container">
                  <img src="/squirrel-avatar.svg" alt="avatar" class="avatar-image" />
                </div>
                <h3 class="user-name">张珊</h3>
                <p class="department">数学部</p>
                <p class="team">数据应用团队</p>
                <div class="quick-links">
                  <a-space size="large">
                    <div class="quick-link-item">
                      <IconUser class="quick-link-icon" />
                      <span>角色</span>
                    </div>
                    <div class="quick-link-item">
                      <IconFile class="quick-link-icon" />
                      <span>待办</span>
                    </div>
                    <div class="quick-link-item">
                      <IconNotification class="quick-link-icon" />
                      <span>通知</span>
                    </div>
                    <div class="quick-link-item">
                      <IconStorage class="quick-link-icon" />
                      <span>数据资源</span>
                    </div>
                  </a-space>
                </div>
              </div>
            </a-card>

            <!-- 快速通道 -->
            <a-card class="card-container">
              <template #title>快速通道</template>
              <div class="quick-channel">
                <div class="channel-list">
                  <div v-for="channel in quickChannels" :key="channel.id" class="channel-item" @click="navigateToPath(channel.path)">
                    <component :is="channel.icon" class="channel-icon" />
                    <span>{{ channel.name }}</span>
                  </div>
                  <div class="channel-item add-channel" @click="showAddDialog = true">
                    <IconPlus class="channel-icon" />
                    <span>添加</span>
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
              <div class="community-links">
                <a-space size="large">
                  <div class="community-link-item">
                    <IconBook class="community-link-icon" />
                    <span>制度索引</span>
                  </div>
                  <div class="community-link-item">
                    <IconFile class="community-link-icon" />
                    <span>案例库</span>
                  </div>
                  <div class="community-link-item">
                    <IconNotification class="community-link-icon" />
                    <span>社区发布</span>
                  </div>
                  <div class="community-link-item">
                    <IconBulb class="community-link-icon" />
                    <span>使用指南</span>
                  </div>
                </a-space>
              </div>
            </a-card>
          </a-col>

          <!-- 右侧区域 -->
          <a-col :span="18">
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
                    <div class="comparison-data"><span class="comparison-item">同比：<span :style="{ color: metric.yoy >= 0 ? '#0fbf60' : '#f53f3f' }">{{ metric.yoy >= 0 ? '+' : '' }}{{ metric.yoy }}%</span></span><span class="comparison-item">环比：<span :style="{ color: metric.mom >= 0 ? '#0fbf60' : '#f53f3f' }">{{ metric.mom >= 0 ? '+' : '' }}{{ metric.mom }}%</span></span></div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
            </a-card>

            <!-- 数据架构图和通知栏 -->
            <a-row :gutter="12">
              <a-col :span="16">
                <a-card title="社区架构图">
                  <ArchitectureChart />
                </a-card>
              </a-col>
              <a-col :span="8">
                <a-card title="通知公告">
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
import ArchitectureChart from '@/components/layout/ArchitectureChart.vue';
import { ref, onMounted, markRaw } from 'vue'
import HomeWelcomeModal from '@/components/modals/HomeWelcomeModal.vue'
import { useUserStore } from '@/store/modules/user'
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
    yoy: 12.5, // 同比
    mom: 5.8   // 环比
  },
  {
    title: '上日放款金额',
    value: 987.65,
    trend: 'down',
    color: '#f53f3f',
    yoy: -8.3,
    mom: -3.2
  },
  {
    title: '上日还款金额',
    value: 876.54,
    trend: 'up',
    color: '#0fbf60',
    yoy: 15.7,
    mom: 6.4
  },
  {
    title: '上日在途加权定价',
    value: 765.43,
    trend: 'down',
    color: '#f53f3f',
    yoy: -5.2,
    mom: -2.1
  }
])
</script>

<style scoped>
.layout-container {
  height: 100vh;
  min-width: 1200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-1);
}

.metric-cards {
  margin-bottom: 16px;
}

.metric-card {
  height: 120px;
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  height: 64px;
  padding: 0 32px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  padding: 0 24px;
  transition: all 0.3s;
}

.content {
  padding: 24px;
  background: var(--color-bg-2);
  height: calc(100vh - 64px);
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.card-container {
  margin-bottom: 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.card-container:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-container :deep(.arco-card-header) {
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border-2);
}

.card-container :deep(.arco-card-body) {
  padding: 16px;
}

.identity-info {
  padding: 16px 0;
  text-align: center;
}

.avatar-container {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.user-name {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-1);
}

.department,
.team {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--color-text-3);
}

.quick-links {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-2);
}

.quick-link-icon {
  font-size: 24px;
  color: var(--color-primary-light-4);
}

.quick-channel {
  padding: 16px 0;
}

.channel-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.channel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--color-bg-1);
}

.channel-item:hover {
  background: var(--color-fill-2);
  transform: translateY(-2px);
}

.channel-icon {
  font-size: 28px;
  margin-bottom: 12px;
  color: var(--color-primary-light-3);
}

.channel-item span {
  font-size: 14px;
  color: var(--color-text-2);
}

.add-channel {
  border: 2px dashed var(--color-border-2);
  background: transparent !important;
}

.add-channel:hover {
  border-color: var(--color-primary-light-4);
  color: var(--color-primary);
}

.add-channel .channel-icon {
  color: var(--color-text-3);
}

.community-links {
  padding: 16px 0;
}

.community-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.community-link-item:hover {
  background: var(--color-fill-2);
  transform: translateY(-2px);
}

.community-link-icon {
  font-size: 32px;
  color: var(--color-primary-light-3);
}

.community-link-item span {
  font-size: 14px;
  color: var(--color-text-2);
  text-align: center;
}

.metric-card :deep(.arco-card-body) {
  padding: 16px;
}

.metric-card :deep(.arco-statistic-title) {
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--color-text-2);
}

.metric-card :deep(.arco-statistic-value) {
  font-size: 24px;
  font-weight: 500;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comparison-data {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-2);
}

.comparison-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.architecture-chart {
  height: 280px;
  background-image: url('/architecture.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
}

.notice-title {
  font-size: 14px;
  color: var(--color-text-1);
}
</style>