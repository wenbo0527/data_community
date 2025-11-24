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
            <a-button type="text">{{ userStore?.userInfo?.username || '用户' }}<IconDown /></a-button>
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
              <h1>欢迎回来，{{ userStore?.userInfo?.username || username }}！</h1>
            </div>
          </div>
        </div>
        
        <a-row :gutter="12" class="main-content-row">
          <!-- 左侧区域 -->
          <a-col :span="6" class="left-column">
            <!-- 身份卡区 -->
            <a-card class="card-container compact-card">
              <template #title>身份信息</template>
              <template #extra>
                 <a-badge :count="3" :offset="[10, 0]">
                   <IconNotification style="font-size: 16px; color: #165dff;" />
                 </a-badge>
               </template>
              <div class="identity-info compact">
                <div class="user-profile compact">
                  <div class="avatar-container compact">
                    <img src="/squirrel-avatar.svg" alt="avatar" class="avatar-image" />
                    <div class="online-indicator compact"></div>
                  </div>
                  <div class="user-details compact">
                    <h3 class="user-name">张珊</h3>
                    <p class="department">数学部 · 数据应用团队</p>
                  </div>
                </div>
                <div class="quick-actions compact">
                  <div class="action-item compact">
                    <IconUser class="action-icon" />
                    <span>角色</span>
                  </div>
                  <div class="action-item compact">
                    <IconStorage class="action-icon" />
                    <span>资源</span>
                  </div>
                  <div class="action-item compact">
                    <IconFile class="action-icon" />
                    <span>待办</span>
                  </div>
                </div>
              </div>
            </a-card>

            <!-- 快速通道 -->
            <a-card class="card-container compact-card">
              <template #title>快速通道</template>
              <template #extra>
                <a-space>
                  <a-button type="text" size="small" @click="openConfigModal">
                    <template #icon><IconSettings /></template>
                    配置
                  </a-button>
                  <a-button type="text" size="small" @click="toggleEditMode">
                    <template #icon><IconEdit /></template>
                    {{ editMode ? '完成' : '编辑' }}
                  </a-button>
                </a-space>
              </template>
              
              <!-- 3x3网格布局 -->
              <div class="quick-channel-grid compact" :class="{ 'edit-mode': editMode }">
                <div class="channel-grid-row compact" v-for="row in 3" :key="row">
                  <div 
                    v-for="col in 3" 
                    :key="`${row}-${col}`"
                    class="channel-grid-item compact"
                    :class="{ 
                      'fixed-item': isFixedPosition(row, col),
                      'draggable': editMode && !isFixedPosition(row, col),
                      'drag-over': dragOverPosition === `${row}-${col}`
                    }"
                    :draggable="editMode && !isFixedPosition(row, col)"
                    @dragstart="handleDragStart(row, col, $event)"
                    @dragover.prevent="handleDragOver(row, col, $event)"
                    @drop="handleDrop(row, col, $event)"
                    @dragend="handleDragEnd"
                    @click="!editMode && handleChannelClick(getChannelAtPosition(row, col), row, col)"
                  >
                    <div class="channel-item-content compact">
                      <component 
                        :is="getChannelAtPosition(row, col)?.icon" 
                        class="channel-icon compact"
                      />
                      <span class="channel-name compact">{{ getChannelAtPosition(row, col)?.name || '未配置' }}</span>
                      <div v-if="editMode && !isFixedPosition(row, col) && !getChannelAtPosition(row, col)" class="add-channel-placeholder compact">
                        <IconPlus class="add-icon compact" />
                        <span>配置</span>
                      </div>
                      <div v-if="!editMode && !isFixedPosition(row, col) && !getChannelAtPosition(row, col)" class="click-hint compact">
                        <IconPlus class="hint-icon compact" />
                      </div>
                      <div v-if="editMode && !isFixedPosition(row, col) && getChannelAtPosition(row, col)" class="remove-btn compact" @click.stop="removeChannel(row, col)">
                        <IconClose class="remove-icon compact" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 应用配置弹窗 -->
              <a-modal v-model:visible="configModalVisible" title="配置应用" @ok="handleConfigConfirm" @cancel="configModalVisible = false">
                <a-form :model="configForm">
                  <a-form-item field="position" label="选择位置">
                    <a-select v-model="configForm.position" placeholder="请选择要配置的位置">
                      <a-option v-for="pos in availablePositions" :key="pos.value" :value="pos.value">{{ pos.label }}</a-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item field="application" label="选择应用">
                    <a-select v-model="configForm.application" placeholder="请选择应用">
                      <a-option v-for="app in availableApplications" :key="app.value" :value="app.value">{{ app.label }}</a-option>
                    </a-select>
                  </a-form-item>
                </a-form>
              </a-modal>
            </a-card>

            <!-- 社区加油站 -->
            <a-card class="card-container compact-card">
              <template #title>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span>社区加油站</span>
                  <a-button 
                    type="text" 
                    size="small" 
                    @click="refreshNotificationStats"
                  >
                    <template #icon><IconRefresh /></template>
                  </a-button>
                </div>
              </template>
              <div class="community-gas-station-horizontal">
                <div class="gas-station-buttons">
                  <div 
                    v-for="item in communityItems" 
                    :key="item.id"
                    class="gas-station-btn"
                    @click="handleCommunityClick(item)"
                  >
                    <div class="btn-icon">
                      <component :is="item.icon" />
                    </div>
                    <div class="btn-text">{{ item.title }}</div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <!-- 右侧区域 -->
          <a-col :span="18" class="right-column">
            <!-- 指标卡片区 -->
            <a-card title="社区数据站" class="card-container compact-card">
              <a-row :gutter="8" class="metric-cards compact">
              <a-col :span="6" v-for="metric in metrics" :key="metric.title">
                <a-card class="metric-card compact">
                  <div class="metric-content compact">
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
                    <div class="comparison-data compact"><span class="comparison-item">较前一日：<span :style="{ color: metric.dayOverDay >= 0 ? '#0fbf60' : '#f53f3f' }">{{ metric.dayOverDay >= 0 ? '+' : '' }}{{ metric.dayOverDay }}%</span></span></div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
            </a-card>

            <!-- 数据架构图和通知栏 -->
            <a-row :gutter="8" class="bottom-row compact">
              <a-col :span="16" class="architecture-column">
                <a-card title="社区架构图" class="card-container compact-card">
                  <ArchitectureChart />
                </a-card>
              </a-col>
              <a-col :span="8" class="notice-column">
                <a-card title="通知公告" class="card-container compact-card">
                  <template #extra>
                    <a-button 
                      type="text" 
                      size="small" 
                      @click="$router.push('/admin/notifications')"
                    >
                      <template #icon><IconSettings /></template>
                      管理
                    </a-button>
                  </template>
                  <a-tabs class="compact-tabs">
                    <a-tab-pane key="notice" title="通知">
                      <a-list :max-height="240" class="compact-list">
                        <a-list-item 
                          v-for="(notice, index) in notices.slice(0, 3)" 
                          :key="notice.id"
                          @click="viewNotification(notice)"
                          style="cursor: pointer;"
                        >
                          <a-space direction="vertical" style="width: 100%">
                            <div class="notice-title compact">
                              <a-typography-text class="compact-text">{{ notice.title }}</a-typography-text>
                              <a-space>
                                <a-tag :color="getNoticeTypeColor(notice.type)" class="compact-tag">{{ notice.type }}</a-tag>
                                <a-tag v-if="index === 0" color="red" size="small" class="compact-tag">
                                  最新
                                </a-tag>
                                <a-tag v-if="isNewNotice(notice.publishTime)" color="red" size="small" class="compact-tag">
                                  NEW
                                </a-tag>
                              </a-space>
                            </div>
                            <a-typography-text type="secondary" class="notice-time compact">{{ notice.time }}</a-typography-text>
                          </a-space>
                        </a-list-item>
                      </a-list>
                      <div class="view-more-container compact">
                        <a-button 
                          type="text" 
                          size="small" 
                          @click="$router.push('/notification/list')"
                          class="view-more-btn compact"
                        >
                          查看更多
                          <template #icon><IconArrowRise /></template>
                        </a-button>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane key="todo" title="待办">
                      <a-list :max-height="240" class="compact-list">
                        <a-list-item v-for="todo in todos.slice(0, 3)" :key="todo.id" class="compact-item">
                          <a-space direction="vertical" style="width: 100%">
                            <div class="notice-title compact">
                              <a-typography-text class="compact-text">{{ todo.title }}</a-typography-text>
                              <a-tag :color="todo.priority === '高' ? 'red' : todo.priority === '中' ? 'orange' : 'blue'" class="compact-tag">{{ todo.priority }}</a-tag>
                            </div>
                            <a-typography-text type="secondary" class="notice-time compact">截止时间：{{ todo.deadline }}</a-typography-text>
                          </a-space>
                        </a-list-item>
                      </a-list>
                      <div class="view-more-container compact">
                        <a-button 
                          type="text" 
                          size="small" 
                          @click="$router.push('/management/tasks')"
                          class="view-more-btn compact"
                        >
                          查看更多
                          <template #icon><IconArrowRise /></template>
                        </a-button>
                      </div>
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
      :is-new-user="userStore?.isNewUser || false"
    />
    
    <!-- 通知详情弹窗 -->
    <a-modal
      v-model:visible="notificationModalVisible"
      :title="selectedNotification?.title"
      width="800px"
      @cancel="handleCloseNotificationModal"
      :footer="false"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <!-- 通知基本信息 -->
        <div class="notification-info" style="margin-bottom: 20px;">
          <div style="display: flex; gap: 24px; align-items: center; padding: 16px; background: #f7f8fa; border-radius: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #86909c; font-size: 14px;">发布人：</span>
              <span style="font-weight: 500;">{{ selectedNotification.author }}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #86909c; font-size: 14px;">发布时间：</span>
              <span style="font-weight: 500;">{{ selectedNotification.time }}</span>
            </div>
          </div>
        </div>

        <!-- 通知内容 -->
        <div class="notification-content">
          <h4 style="margin-bottom: 12px; color: #1d2129;">正文</h4>
          <div class="content-body" style="padding: 16px; background: #f7f8fa; border-radius: 6px; line-height: 1.6; color: #4e5969;">
            {{ selectedNotification.content }}
          </div>
        </div>

        <!-- 附件部分 -->
        <div class="notification-attachments" style="margin-top: 20px;">
          <h4 style="margin-bottom: 12px; color: #1d2129;">附件</h4>
          <div v-if="selectedNotification.attachments && selectedNotification.attachments.length > 0" 
               style="padding: 16px; background: #f7f8fa; border-radius: 6px;">
            <div v-for="attachment in selectedNotification.attachments" 
                 :key="attachment.id" 
                 style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e6eb;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 500; color: #1d2129;">{{ attachment.fileName }}</span>
                <span style="color: #86909c; font-size: 12px;">{{ attachment.fileSize }}</span>
              </div>
              <a-button type="text" size="small" style="color: #165dff;">
                下载
              </a-button>
            </div>
          </div>
          <div v-else style="padding: 16px; background: #f7f8fa; border-radius: 6px; color: #86909c; text-align: center;">
            暂无附件
          </div>
        </div>
      </div>
    </a-modal>
    
    <!-- 应用选择弹窗 -->
    <a-modal
      v-model:visible="showAppSelectModal"
      title="选择应用"
      width="600px"
      @cancel="showAppSelectModal = false"
      :footer="false"
    >
      <div class="app-select-content">
        <div class="app-select-header">
          <p style="margin: 0 0 16px 0; color: #86909c; font-size: 14px;">
            为位置 [第{{ selectedPosition.row }}行，第{{ selectedPosition.col }}列] 选择应用
          </p>
        </div>
        <div class="app-grid">
          <div 
            v-for="app in availableApplications" 
            :key="app.value"
            class="app-item"
            @click="handleAppSelect(app)"
          >
            <div class="app-icon">
              <component :is="getIconComponent(app.icon)" />
            </div>
            <div class="app-name">{{ app.label }}</div>
          </div>
        </div>
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, markRaw, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import ArchitectureChart from '../../components/layout/ArchitectureChart.vue'
import NotificationStats from '../../components/NotificationStats.vue'
import {
  IconUser,
  IconDown,
  IconNotification,
  IconStorage,
  IconFile,
  IconQuestion,
  IconCompass,
  IconEye,
  IconApps,
  IconBook,
  IconBulb,
  IconArrowRise,
  IconArrowFall,
  IconSettings,
  IconSafe,
  IconRefresh,
  IconEdit,
  IconPlus,
  IconClose,
  IconDashboard,
  IconBarChart,
  IconCloud,
  IconUserGroup,
  IconGift,
  IconLink,
  IconCustomerService,
  IconRobot,
  IconExperiment,
  IconLocation,
  IconHeart,
  IconFire,
  IconBug,
  IconCalendar,
  IconStar
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const userStore = useUserStore()

const toggleDepartment = () => {
  if (userStore && userStore.userInfo && typeof userStore.setUserDepartment === 'function') {
    const departments = ['risk', 'marketing', 'data']
    const currentIndex = departments.indexOf(userStore.userInfo.department)
    const nextIndex = (currentIndex + 1) % departments.length
    userStore.setUserDepartment(departments[nextIndex])
  }
}

// 控制欢迎弹窗
const showWelcomeModal = ref(false)

// 切换用户角色
const toggleUserRole = () => {
  if (userStore && typeof userStore.setUserRole === 'function') {
    userStore.setUserRole(!userStore.isNewUser)
  } else if (userStore) {
    userStore.isNewUser = !userStore.isNewUser
  }
}

// 初始化用户角色和欢迎弹窗
onMounted(async () => {
  try {
    if (userStore && typeof userStore.checkUserRole === 'function') {
      const isNewUser = await userStore.checkUserRole()
      showWelcomeModal.value = isNewUser !== undefined ? isNewUser : true
    } else {
      showWelcomeModal.value = false
    }
  } catch (error) {
    console.warn('用户角色检查失败:', error)
    showWelcomeModal.value = false
  }
  // 初始化时获取通知数据
  await fetchNotices()
  // 初始化快速通道配置
  initQuickChannelConfig()
})

// 通知数据 - 集成通知管理系统
const notices = ref([])

// 通知弹窗状态管理
const notificationModalVisible = ref(false)
const selectedNotification = ref(null)

// 获取通知数据
const fetchNotices = async () => {
  try {
    // 导入通知API服务
    const NotificationAPI = (await import('../../api/notification')).default
    
    // 获取已发布的通知，限制数量为10条
    const response = await NotificationAPI.getNotifications({
      status: 'published',
      pageSize: 10,
      page: 1
    })
    
    if (response.success) {
      // 转换数据格式以适配现有UI
      const notificationList = response.data.list || response.data
      notices.value = notificationList.map(notification => ({
        id: notification.id,
        title: notification.title,
        type: notification.category?.name || '通知',
        publishTime: notification.publishTime || notification.published_at,
        time: new Date(notification.publishTime || notification.published_at).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
    }
  } catch (error) {
    console.error('获取通知数据失败:', error)
    // 使用默认数据作为降级方案
    notices.value = [
      {
        id: 1,
        title: '数据社区平台使用指南V2.0发布',
        type: '操作指南',
        publishTime: '2024-01-15T10:00:00Z',
        time: '2024-01-15 10:00'
      },
      {
        id: 2,
        title: '数据接口申请工单已审批通过',
        type: '工单进度',
        publishTime: '2024-01-14T15:30:00Z',
        time: '2024-01-14 15:30'
      },
      {
        id: 3,
        title: '数据社区2024年度工作规划',
        type: '社区动态',
        publishTime: '2024-01-13T09:00:00Z',
        time: '2024-01-13 09:00'
      },
      {
        id: 4,
        title: '数据治理最佳实践案例分享',
        type: '实践案例',
        publishTime: '2024-01-12T16:45:00Z',
        time: '2024-01-12 16:45'
      }
    ]
  }
}

// 获取通知类型对应的颜色
const getNoticeTypeColor = (type) => {
  const colorMap = {
    '操作指南': 'blue',
    '工单进度': 'green', 
    '社区动态': 'purple',
    '实践案例': 'orange',
    '政策制度': 'red',
    // 兼容旧数据
    '使用指南': 'blue',
    '社区发布': 'purple',
    '案例': 'orange'
  }
  return colorMap[type] || 'blue'
}

// 判断是否为新发布的通知（7天内）
const isNewNotice = (publishTime) => {
  if (!publishTime) return false
  const publishDate = new Date(publishTime)
  const now = new Date()
  const diffTime = Math.abs(now - publishDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

// 社区资源导航
const navigateToCommunity = (category) => {
  const categoryMap = {
    'policy': '/community/policy',
    'cases': '/community/cases', 
    'guide': '/community/guide',
    'news': '/community/news'
  }
  const path = categoryMap[category]
  if (path) {
    router.push(path)
  }
}

// 通知统计组件引用
const notificationStatsRef = ref(null)

// 刷新通知统计数据
const refreshNotificationStats = () => {
  if (notificationStatsRef.value) {
    notificationStatsRef.value.refresh()
  }
}

// 查看通知详情
const viewNotification = (notice) => {
  console.log('点击查看通知详情:', notice)
  selectedNotification.value = {
    id: notice.id,
    title: notice.title,
    content: `这是通知"${notice.title}"的详细内容。发布时间：${notice.time}，类型：${notice.type}。`,
    type: notice.type,
    publishTime: notice.publishTime,
    time: notice.time,
    author: '系统管理员',
    priority: 'normal',
    isSticky: false,
    attachments: [
      {
        id: 1,
        fileName: '通知附件1.pdf',
        fileSize: '2.3MB',
        downloadUrl: '/files/attachment1.pdf'
      },
      {
        id: 2,
        fileName: '相关文档.docx',
        fileSize: '1.8MB',
        downloadUrl: '/files/attachment2.docx'
      }
    ]
  }
  notificationModalVisible.value = true
}

// 关闭通知弹窗
const handleCloseNotificationModal = () => {
  notificationModalVisible.value = false
  selectedNotification.value = null
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

// 快速通道配置
const editMode = ref(false)
const configModalVisible = ref(false)
const dragOverPosition = ref('')
const draggedChannel = ref(null)
const showAppSelectModal = ref(false)
const selectedPosition = ref({ row: 0, col: 0 })

// 配置表单
const configForm = ref({
  position: '',
  application: ''
})

// 可用应用列表
const availableApplications = [
  { label: '模型平台', value: 'model-platform', icon: 'IconRobot' },
  { label: '客户360', value: 'customer360', icon: 'IconUserGroup' },
  { label: '数据地图', value: 'data-map', icon: 'IconLocation' },
  { label: '客群中心', value: 'customer-center', icon: 'IconUserGroup' },
  { label: '权益中心', value: 'benefit-center', icon: 'IconHeart' },
  { label: '营销中心', value: 'marketing-center', icon: 'IconFire' },
  { label: '外数管理', value: 'external-data', icon: 'IconCloud' },
  { label: '服务中心', value: 'service-center', icon: 'IconCustomerService' },
  { label: '洞察中心', value: 'insight-center', icon: 'IconBulb' }
]

// 可用位置列表
const availablePositions = computed(() => {
  const positions = []
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      if (!isFixedPosition(row, col)) {
        const channel = getChannelAtPosition(row, col)
        positions.push({
          label: `第${row}行第${col}列${channel ? ` (${channel.name})` : ''}`,
          value: `${row}-${col}`
        })
      }
    }
  }
  return positions
})

// 初始化快速通道配置
const initQuickChannelConfig = () => {
  const savedConfig = localStorage.getItem('quickChannelConfig')
  if (savedConfig) {
    quickChannels.value = JSON.parse(savedConfig)
  } else {
    // 默认配置：首行固定3个核心服务
    quickChannels.value = [
      { id: 1, row: 1, col: 1, icon: markRaw(IconSafe), name: '权限服务', path: '/management/permission' },
      { id: 2, row: 1, col: 2, icon: markRaw(IconCloud), name: '外数服务', path: '/discovery/external' },
      { id: 3, row: 1, col: 3, icon: markRaw(IconApps), name: '任务管理', path: '/management/tasks' }
    ]
  }
}

// 判断是否为固定位置（首行）
const isFixedPosition = (row, col) => {
  return row === 1
}

// 获取指定位置的应用
const getChannelAtPosition = (row, col) => {
  return quickChannels.value.find(channel => channel.row === row && channel.col === col)
}

// 切换编辑模式
const toggleEditMode = () => {
  editMode.value = !editMode.value
}

// 打开配置弹窗
const openConfigModal = () => {
  configModalVisible.value = true
}

// 处理配置确认
const handleConfigConfirm = () => {
  const { position, application } = configForm.value
  if (position && application) {
    const [row, col] = position.split('-').map(Number)
    const app = availableApplications.find(app => app.value === application)
    if (app) {
      // 移除该位置已有的应用
      quickChannels.value = quickChannels.value.filter(channel => !(channel.row === row && channel.col === col))
      
      // 添加新应用
      quickChannels.value.push({
        id: Date.now(),
        row,
        col,
        icon: getIconComponent(app.icon),
        name: app.label,
        path: getApplicationPath(app.value)
      })
      
      // 保存到本地存储
      saveQuickChannelConfig()
      
      // 重置表单
      configForm.value = { position: '', application: '' }
      configModalVisible.value = false
    }
  }
}

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconMap = {
    'IconDashboard': markRaw(IconDashboard),
    'IconUserGroup': markRaw(IconUserGroup),
    'IconCompass': markRaw(IconCompass),
    'IconGift': markRaw(IconGift),
    'IconBarChart': markRaw(IconBarChart),
    'IconCloud': markRaw(IconCloud),
    'IconCustomerService': markRaw(IconCustomerService),
    'IconBulb': markRaw(IconBulb),
    'IconRobot': markRaw(IconRobot),
    'IconExperiment': markRaw(IconExperiment),
    'IconLocation': markRaw(IconLocation),
    'IconHeart': markRaw(IconHeart),
    'IconFire': markRaw(IconFire),
    'IconDatabase': markRaw(IconStorage),
    'IconBug': markRaw(IconBug),
    'IconCalendar': markRaw(IconCalendar),
    'IconStar': markRaw(IconStar)
  }
  return iconMap[iconName] || markRaw(IconApps)
}

// 获取应用路径
const getApplicationPath = (appValue) => {
  const pathMap = {
    'model-platform': '/exploration',
    'customer360': '/discovery/customer360',
    'data-map': '/discovery/data-map',
    'customer-center': '/exploration/customer-center',
    'benefit-center': '/marketing/benefit',
    'marketing-center': '/marketing',
    'external-data': '/discovery/external',
    'service-center': '/management/service',
    'insight-center': '/exploration'
  }
  return pathMap[appValue] || '/home'
}

// 拖拽开始
const handleDragStart = (row, col, event) => {
  const channel = getChannelAtPosition(row, col)
  if (channel && !isFixedPosition(row, col)) {
    draggedChannel.value = { ...channel, sourceRow: row, sourceCol: col }
    event.dataTransfer.effectAllowed = 'move'
  }
}

// 拖拽经过
const handleDragOver = (row, col, event) => {
  if (editMode.value && !isFixedPosition(row, col)) {
    event.preventDefault()
    dragOverPosition.value = `${row}-${col}`
  }
}

// 拖拽放下
const handleDrop = (row, col, event) => {
  event.preventDefault()
  if (draggedChannel.value && !isFixedPosition(row, col)) {
    // 移除源位置的应用
    quickChannels.value = quickChannels.value.filter(channel => 
      !(channel.row === draggedChannel.value.sourceRow && channel.col === draggedChannel.value.sourceCol)
    )
    
    // 移动目标位置的应用到源位置（如果有的话）
    const targetChannel = getChannelAtPosition(row, col)
    if (targetChannel) {
      targetChannel.row = draggedChannel.value.sourceRow
      targetChannel.col = draggedChannel.value.sourceCol
    }
    
    // 更新拖拽应用的位置
    const draggedItem = quickChannels.value.find(channel => channel.id === draggedChannel.value.id)
    if (draggedItem) {
      draggedItem.row = row
      draggedItem.col = col
    }
    
    // 保存配置
    saveQuickChannelConfig()
  }
  dragOverPosition.value = ''
  draggedChannel.value = null
}

// 拖拽结束
const handleDragEnd = () => {
  dragOverPosition.value = ''
  draggedChannel.value = null
}

// 移除应用
const removeChannel = (row, col) => {
  quickChannels.value = quickChannels.value.filter(channel => !(channel.row === row && channel.col === col))
  saveQuickChannelConfig()
}

// 处理应用点击
const handleChannelClick = (channel, row, col) => {
  if (!channel) {
    // 点击未配置按钮，触发应用选择弹窗
    handleEmptyChannelClick(row, col)
    return
  }
  
  if (channel && channel.path) {
    router.push(channel.path)
  }
}

// 保存配置到本地存储
const saveQuickChannelConfig = () => {
  localStorage.setItem('quickChannelConfig', JSON.stringify(quickChannels.value))
}

// 处理未配置按钮点击
const handleEmptyChannelClick = (row, col) => {
  if (editMode.value) return // 编辑模式下不触发弹窗
  selectedPosition.value = { row, col }
  showAppSelectModal.value = true
}

// 处理应用选择
const handleAppSelect = (application) => {
  const { row, col } = selectedPosition.value
  const position = `${row}-${col}`
  
  // 查找或创建该位置的通道
  let channel = quickChannels.value.find(ch => ch.position === position)
  if (!channel) {
    channel = {
      id: Date.now(),
      position,
      name: application.label,
      value: application.value,
      icon: application.icon,
      fixed: false
    }
    quickChannels.value.push(channel)
  } else {
    // 更新现有通道
    channel.name = application.label
    channel.value = application.value
    channel.icon = application.icon
  }
  
  saveQuickChannelConfig()
  showAppSelectModal.value = false
  
  // 显示成功提示
  Message.success(`已添加 ${application.label} 到快速通道`)
}

// 社区加油站按钮点击处理
const handleCommunityClick = (item) => {
  if (item && item.path) {
    router.push(item.path)
  }
}

// 社区加油站数据
const communityItems = ref([
  {
    id: 1,
    icon: markRaw(IconBook),
    title: '政策制度',
    path: '/community/policy'
  },
  {
    id: 2,
    icon: markRaw(IconBulb),
    title: '实践案例',
    path: '/community/cases'
  },
  {
    id: 3,
    icon: markRaw(IconCompass),
    title: '使用指南',
    path: '/community/guide'
  },
  {
    id: 4,
    icon: markRaw(IconNotification),
    title: '社区动态',
    path: '/community/news'
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
const quickChannels = ref([])

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

/* 优化内容区域布局 */
.content {
  padding: 16px;
  background: transparent;
  height: calc(100vh - 72px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 紧凑欢迎横幅 */
.welcome-banner {
  margin-bottom: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(114, 46, 209, 0.1) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.welcome-text h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 优化主内容区域 */
.main-content-row {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.left-column .card-container:last-child {
  margin-bottom: 0;
  flex: 1;
}

.right-column > .card-container {
  margin-bottom: 16px;
}

.right-column > .card-container:last-child {
  margin-bottom: 0;
  flex: 1;
}

.right-column > .card-container:first-child {
  flex: 0 0 auto;
}

.right-column > .bottom-row {
  flex: 1;
  min-height: 0;
}

/* 紧凑卡片样式 */
.card-container {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
  margin-bottom: 10px;
  overflow: hidden;
}

.card-container:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.7);
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
  flex: 1;
  min-height: 0;
}

.architecture-column,
.notice-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.architecture-column .card-container,
.notice-column .card-container {
  height: 100%;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.architecture-column :deep(.arco-card-body),
.notice-column :deep(.arco-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.architecture-chart {
  flex: 1;
  min-height: 0;
  height: auto !important;
}

.compact-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.compact-tabs :deep(.arco-tabs-content) {
  flex: 1;
  min-height: 0;
}

.compact-list {
  flex: 1;
  min-height: 0;
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
  font-size: 10px;
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



/* 快速通道网格布局 */
.quick-channel-grid {
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.channel-grid-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.channel-grid-row:last-child {
  margin-bottom: 0;
}

.channel-grid-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.channel-grid-item:hover {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.08) 0%, rgba(114, 46, 209, 0.08) 100%);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 15px rgba(22, 93, 255, 0.12);
  border-color: rgba(22, 93, 255, 0.3);
}

.channel-grid-item.fixed-item {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(22, 93, 255, 0.05) 100%);
  border-color: rgba(22, 93, 255, 0.4);
}

.channel-grid-item.fixed-item:hover {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.15) 0%, rgba(22, 93, 255, 0.1) 100%);
}

.channel-grid-item.draggable {
  cursor: move;
}

.channel-grid-item.drag-over {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.2) 0%, rgba(114, 46, 209, 0.2) 100%);
  border-color: rgba(22, 93, 255, 0.6);
  transform: scale(1.05);
}

.channel-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  width: 100%;
}

.channel-icon {
  font-size: 32px;
  color: #165dff;
  filter: drop-shadow(0 2px 4px rgba(22, 93, 255, 0.2));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.channel-grid-item:hover .channel-icon {
  transform: scale(1.1);
  color: #722ed1;
}

.channel-name {
  font-size: 13px;
  color: #4e5969;
  font-weight: 500;
  line-height: 1.1;
  transition: all 0.3s;
}

.channel-grid-item:hover .channel-name {
  color: #165dff;
}

.add-channel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #86909c;
  font-size: 12px;
}

.add-icon {
  font-size: 24px;
  color: #c9cdd4;
  transition: all 0.3s;
}

.channel-grid-item:hover .add-icon {
  color: #165dff;
  transform: scale(1.1);
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(245, 63, 63, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
}

.channel-grid-item:hover .remove-btn {
  opacity: 1;
}

.remove-icon {
  font-size: 12px;
  color: white;
}

.remove-btn:hover {
  background: rgba(245, 63, 63, 1);
  transform: scale(1.1);
}

/* 编辑模式样式 */
.quick-channel-grid.edit-mode .channel-grid-item:not(.fixed-item) {
  border-style: dashed;
  border-color: rgba(22, 93, 255, 0.4);
}

.quick-channel-grid.edit-mode .channel-grid-item:not(.fixed-item):hover {
  border-color: rgba(22, 93, 255, 0.8);
}

/* 紧凑布局样式 */
.compact-card {
  margin-bottom: 12px;
}

.compact-card :deep(.arco-card-header) {
  min-height: 40px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
}

.compact-card :deep(.arco-card-body) {
  padding: 12px;
}

/* 紧凑身份卡片 */
.identity-info.compact {
  padding: 8px;
}

.user-profile.compact {
  margin-bottom: 8px;
  gap: 8px;
}

.avatar-container.compact {
  width: 40px;
  height: 40px;
}

.user-details.compact .user-name {
  font-size: 14px;
  margin-bottom: 2px;
}

.user-details.compact .department {
  font-size: 10px;
}

.quick-actions.compact {
  margin-top: 8px;
  padding-top: 8px;
  gap: 4px;
}

.action-item.compact {
  padding: 4px 2px;
  gap: 2px;
}

.action-item.compact .action-icon {
  font-size: 14px;
}

.action-item.compact span {
  font-size: 8px;
}

/* 紧凑快速通道 */
.quick-channel-grid.compact {
  padding: 8px;
  gap: 4px;
}

.channel-grid-row.compact {
  gap: 4px;
  margin-bottom: 4px;
}

.channel-grid-item.compact {
  padding: 8px 4px;
  border-radius: 6px;
  aspect-ratio: 1.6; /* 更扁平的矩形比例，减少高度 */
  min-height: 50px; /* 进一步降低最小高度 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative; /* 为点击提示提供定位基础 */
}

.channel-icon.compact {
  font-size: 18px;
  margin-bottom: 3px;
}

.channel-name.compact {
  font-size: 9px;
  line-height: 1.1;
  font-weight: 500;
}

.add-channel-placeholder.compact {
  gap: 6px;
}

.add-icon.compact {
  font-size: 20px;
}

.remove-btn.compact {
  width: 16px;
  height: 16px;
  top: 2px;
  right: 2px;
}

.remove-icon.compact {
  font-size: 10px;
}

/* 紧凑社区加油站 */
.community-gas-station {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gas-station-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.05) 0%, rgba(114, 46, 209, 0.05) 100%);
  border-radius: 8px;
}

.station-info h4 {
  margin: 0;
  font-size: 14px;
  color: #1d2129;
  font-weight: 600;
}

.station-info p {
  margin: 0;
  font-size: 12px;
  color: #86909c;
}

.gas-station-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.station-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.station-item:hover {
  background: rgba(22, 93, 255, 0.08);
  transform: translateX(4px);
}

.item-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  border-radius: 6px;
  color: white;
  font-size: 16px;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.item-desc {
  font-size: 11px;
  color: #86909c;
}

/* 紧凑指标卡片 */
.metric-cards.compact {
  margin-bottom: 12px;
}

.metric-card.compact {
  height: 85px; /* 进一步降低卡片高度 */
  border-radius: 6px;
}

.metric-card.compact :deep(.arco-card-body) {
  padding: 10px;
}

.metric-content.compact {
  gap: 4px;
}

.metric-content.compact :deep(.arco-statistic-title) {
  font-size: 11px;
  margin-bottom: 2px;
}

.metric-content.compact :deep(.arco-statistic-value) {
  font-size: 16px;
}

.comparison-data.compact {
  padding: 3px 6px;
  font-size: 9px;
  margin-top: 2px;
}

/* 应用选择弹窗样式 */
.app-select-content {
  padding: 16px 0;
}

.app-select-header {
  margin-bottom: 20px;
  text-align: center;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  min-height: 100px;
  gap: 12px;
}

.app-item:hover {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.08) 0%, rgba(114, 46, 209, 0.08) 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(22, 93, 255, 0.15);
  border-color: rgba(22, 93, 255, 0.3);
}

.app-item:active {
  transform: translateY(0) scale(0.98);
}

.app-icon {
  font-size: 32px;
  color: #165dff;
  filter: drop-shadow(0 2px 4px rgba(22, 93, 255, 0.2));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(114, 46, 209, 0.1) 100%);
  border-radius: 50%;
}

.app-item:hover .app-icon {
  transform: scale(1.1);
  color: #722ed1;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.15) 0%, rgba(114, 46, 209, 0.15) 100%);
}

.app-name {
  font-size: 14px;
  color: #4e5969;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
  transition: all 0.3s;
}

.app-item:hover .app-name {
  color: #165dff;
}

/* 未配置按钮可点击状态优化 */
.channel-grid-item:not(.fixed-item) .channel-item-content.compact {
  cursor: pointer;
}

.channel-grid-item:not(.fixed-item):hover .add-channel-placeholder {
  transform: scale(1.1);
  opacity: 0.8;
}

.channel-grid-item:not(.fixed-item) .channel-name {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.channel-grid-item:not(.fixed-item):hover .channel-name {
  color: #165dff;
  transform: translateY(-1px);
}

/* 点击提示样式 */
.click-hint {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.channel-grid-item:not(.fixed-item):hover .click-hint {
  opacity: 0.6;
}

.hint-icon {
  font-size: 12px;
  color: #165dff;
}

/* 社区加油站横向按钮布局 */
.community-gas-station-horizontal {
  padding: 4px 0;
}

.gas-station-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  align-items: stretch;
}

.gas-station-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 5px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  min-height: 55px; /* 降低高度以匹配快速通道 */
  gap: 5px;
}

.gas-station-btn:hover {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.08) 0%, rgba(114, 46, 209, 0.08) 100%);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 15px rgba(22, 93, 255, 0.12);
  border-color: rgba(22, 93, 255, 0.3);
}

.gas-station-btn:active {
  transform: translateY(0) scale(0.98);
}

.btn-icon {
  font-size: 20px;
  color: #165dff;
  filter: drop-shadow(0 2px 4px rgba(22, 93, 255, 0.2));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(114, 46, 209, 0.1) 100%);
  border-radius: 50%;
  margin-bottom: 3px;
}

.gas-station-btn:hover .btn-icon {
  transform: scale(1.05);
  color: #722ed1;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.12) 0%, rgba(114, 46, 209, 0.12) 100%);
}

.btn-text {
  font-size: 11px;
  color: #4e5969;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  transition: all 0.3s;
}

.gas-station-btn:hover .btn-text {
  color: #165dff;
}

/* 紧凑通知公告 */
.bottom-row.compact {
  margin-top: 0;
}

.compact-tabs :deep(.arco-tabs-header) {
  margin-bottom: 12px;
}

.compact-tabs :deep(.arco-tabs-tab) {
  padding: 6px 12px;
  font-size: 13px;
}

.compact-list {
  margin-bottom: 8px;
}

.compact-list :deep(.arco-list-item) {
  padding: 8px 0;
  min-height: auto;
}

.compact-item {
  padding: 6px 0 !important;
}

.compact-text {
  font-size: 13px;
  line-height: 1.4;
}

.compact-tag {
  font-size: 10px;
  height: 20px;
  line-height: 20px;
  padding: 0 6px;
}

.notice-time.compact {
  font-size: 11px;
}

.notice-title.compact {
  margin-bottom: 4px;
}

.view-more-container.compact {
  margin-top: 8px;
  padding-top: 8px;
}

.view-more-btn.compact {
  font-size: 11px;
  padding: 2px 6px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .channel-grid-row.compact {
    gap: 3px;
  }
  
  .channel-grid-item.compact {
    padding: 6px;
    min-height: 45px;
    border-radius: 5px;
  }
  
  .channel-icon.compact {
    font-size: 16px;
    margin-bottom: 2px;
  }
  
  .channel-name.compact {
    font-size: 8px;
  }
  
  .gas-station-buttons {
    gap: 6px;
  }
  
  .gas-station-btn {
    padding: 8px 4px;
    min-height: 50px;
    border-radius: 6px;
  }
  
  .btn-icon {
    width: 24px;
    height: 24px;
    font-size: 16px;
  }
  
  .btn-text {
    font-size: 9px;
  }
  
  .compact-card :deep(.arco-card-header) {
    min-height: 36px;
    padding: 6px 10px;
  }
  
  .compact-card :deep(.arco-card-body) {
    padding: 10px;
  }
  
  .metric-card.compact {
    height: 75px;
  }
  
  .metric-content.compact :deep(.arco-statistic-title) {
    font-size: 10px;
  }
  
  .metric-content.compact :deep(.arco-statistic-value) {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .main-content-row {
    flex-direction: column;
  }
  
  .left-column,
  .right-column {
    width: 100%;
  }
  
  .channel-grid-row.compact {
    gap: 2px;
  }
  
  .channel-grid-item.compact {
    padding: 4px;
    border-radius: 4px;
    min-height: 40px;
  }
  
  .channel-icon.compact {
    font-size: 14px;
    margin-bottom: 1px;
  }
  
  .channel-name.compact {
    font-size: 7px;
  }
  
  .quick-channel-grid.compact {
    padding: 4px;
  }
  
  .gas-station-buttons {
    gap: 4px;
  }
  
  .gas-station-btn {
    padding: 6px 3px;
    min-height: 45px;
    border-radius: 5px;
  }
  
  .btn-icon {
    width: 20px;
    height: 20px;
    font-size: 14px;
    margin-bottom: 1px;
  }
  
  .btn-text {
    font-size: 8px;
  }
  
  .metric-card.compact {
    height: 65px;
  }
  
  .metric-content.compact :deep(.arco-statistic-title) {
    font-size: 9px;
  }
  
  .metric-content.compact :deep(.arco-statistic-value) {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .channel-grid-row.compact {
    gap: 2px;
  }
  
  .channel-grid-item.compact {
    padding: 3px;
    border-radius: 3px;
    min-height: 35px;
  }
  
  .channel-icon.compact {
    font-size: 12px;
  }
  
  .channel-name.compact {
    font-size: 7px;
  }
  
  .compact-card :deep(.arco-card-header) {
    padding: 6px 8px;
    min-height: 32px;
  }
  
  .compact-card :deep(.arco-card-body) {
    padding: 8px;
  }
  
  .gas-station-buttons {
    gap: 3px;
  }
  
  .gas-station-btn {
    padding: 4px 2px;
    min-height: 40px;
    border-radius: 4px;
  }
  
  .btn-icon {
    width: 16px;
    height: 16px;
    font-size: 12px;
  }
  
  .btn-text {
    font-size: 7px;
  }
  
  .identity-info.compact {
    padding: 6px;
  }
  
  .user-profile.compact {
    margin-bottom: 6px;
    gap: 6px;
  }
  
  .avatar-container.compact {
    width: 32px;
    height: 32px;
  }
  
  .user-details.compact .user-name {
    font-size: 12px;
  }
  
  .user-details.compact .department {
    font-size: 9px;
  }
  
  .quick-actions.compact {
    margin-top: 6px;
    padding-top: 6px;
    gap: 3px;
  }
  
  .action-item.compact {
    padding: 3px 1px;
    gap: 1px;
  }
  
  .action-item.compact .action-icon {
    font-size: 10px;
  }
  
  .action-item.compact span {
    font-size: 7px;
  }
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

/* 查看更多按钮样式 */
.view-more-container {
  margin-top: 12px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.view-more-btn {
  color: #165dff;
  font-size: 12px;
  padding: 4px 8px;
  height: auto;
  transition: all 0.2s ease;
}

.view-more-btn:hover {
  color: #0e42d2;
  background-color: rgba(22, 93, 255, 0.05);
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