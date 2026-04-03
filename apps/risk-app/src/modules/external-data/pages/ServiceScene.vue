<template>
  <div class="service-scene-container">
    <a-page-header title="服务场景入口" subtitle="选择适合您的外数服务场景">
      <template #actions>
        <a-button type="primary" status="warning" @click="showNotifications">
          <template #icon><icon-bell /></template>
          查看通知
        </a-button>
      </template>
    </a-page-header>
    
    <div class="scene-grid">
      <a-card v-for="scene in scenes" :key="scene.id" hoverable class="scene-card" @click="handleSceneClick(scene)">
        <a-card-meta :title="scene.title">
          <template #avatar>
            <div class="scene-avatar" :style="{ backgroundColor: scene.color }">
              <component :is="scene.icon" />
            </div>
          </template>
          <template #description>
            <div class="scene-desc">{{ scene.description }}</div>
            <div class="scene-tags">
              <a-tag v-for="tag in scene.tags" :key="tag" size="small" style="margin-right: 4px; margin-top: 8px">{{ tag }}</a-tag>
            </div>
          </template>
        </a-card-meta>
        <template #actions>
          <a-button type="text" size="small" @click.stop="handleSceneClick(scene)">立即申请</a-button>
          <a-button type="text" size="small" @click.stop="showDocs(scene)">查看文档</a-button>
        </template>
      </a-card>
    </div>

    <ServiceApplicationDrawer
      v-model:visible="drawerVisible"
      :edit-mode="false"
      :initial-service-type="currentServiceType"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconCloud, IconStorage, IconClockCircle, IconFindReplace, IconSafe, IconImport, IconBell, IconCheckCircle, IconCloseCircle, IconInfoCircle } from '@arco-design/web-vue/es/icon'
import ServiceApplicationDrawer from '../components/ServiceApplicationDrawer.vue'

const router = useRouter()
const drawerVisible = ref(false)
const currentServiceType = ref('')

// 通知相关
const notificationVisible = ref(false)
const notifications = ref([
  { id: 1, type: 'success', title: '样本表创建成功', content: '您的样本表"用户信息样本V1.2"已创建成功，请检查样本并发起审批', time: '2025-01-28 10:30:00', read: false },
  { id: 2, type: 'info', title: '审批提醒', content: '您申请的"运营商数据查询服务"已进入审批阶段，请耐心等待', time: '2025-01-28 09:15:00', read: false },
  { id: 3, type: 'success', title: '审批通过', content: '您的"电商画像查询服务"已审批通过，系统将自动触发执行', time: '2025-01-27 16:45:00', read: true },
  { id: 4, type: 'warning', title: '执行完成', content: '"历史数据回溯服务"执行完成，共处理数据 12,580 条，文件已生成', time: '2025-01-27 14:20:00', read: true },
  { id: 5, type: 'error', title: '执行失败', content: '"运营商数据查询服务"执行失败，失败原因：样本数据格式不匹配', time: '2025-01-27 11:30:00', read: true },
  { id: 6, type: 'warning', title: '审批驳回', content: '您的"多头借贷查询服务"被驳回，驳回原因：申请理由不充分', time: '2025-01-26 15:00:00', read: true },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const notificationIcon = (type: string) => {
  const map: Record<string, any> = {
    success: IconCheckCircle,
    error: IconCloseCircle,
    warning: IconInfoCircle,
    info: IconBell
  }
  return map[type] || IconBell
}

const notificationColor = (type: string) => {
  const map: Record<string, string> = {
    success: 'green',
    error: 'red',
    warning: 'orange',
    info: 'blue'
  }
  return map[type] || 'blue'
}

const showNotifications = () => {
  notificationVisible.value = true
}

const handleNotificationRead = (id: number) => {
  const notif = notifications.value.find(n => n.id === id)
  if (notif) {
    notif.read = true
  }
}

const handleAllRead = () => {
  notifications.value.forEach(n => n.read = true)
  Message.success('已将所有通知标为已读')
}

const scenes = [
  {
    id: 'online-detail',
    title: '在线批量调用',
    description: '适用于实时业务场景，通过API接口进行高并发数据查询。',
    icon: IconCloud,
    color: '#165DFF',
    tags: ['实时API', '高并发', '低延迟'],
    serviceType: '在线批量调用'
  },
  {
    id: 'offline-task',
    title: '外数离线回溯申请',
    description: '适用于历史数据分析，支持上传样本文件进行批量回溯。',
    icon: IconStorage,
    color: '#722ED1',
    tags: ['历史回溯', '文件上传', '离线处理'],
    serviceType: '外数离线回溯申请'
  },
  {
    id: 'periodic-task',
    title: '周期跑批任务申请',
    description: '适用于定期数据更新，支持配置Cron表达式进行自动化调度。',
    icon: IconClockCircle,
    color: '#00B42A',
    tags: ['定时任务', '自动化', '周期执行'],
    serviceType: '周期跑批任务申请'
  },
  {
    id: 'variable-backtrack',
    title: '全量变量回溯申请',
    description: '适用于模型训练与验证，支持全量特征变量的历史数据回溯。',
    icon: IconFindReplace,
    color: '#FF7D00',
    tags: ['特征工程', '全量变量', '模型训练'],
    serviceType: '全量变量回溯申请'
  },
  {
    id: 'risk-compliance',
    title: '风险合规离线回溯申请',
    description: '适用于合规审计与风险排查，提供敏感数据的安全查询通道。',
    icon: IconSafe,
    color: '#F53F3F',
    tags: ['风险合规', '安全查询', '审计支持'],
    serviceType: '风险合规离线回溯申请'
  },
  {
    id: 'batch-external',
    title: '外数线上调用服务申请',
    description: '针对风险贷中单次或周期发起文件交互形式的样本传输、调用、落库，并在线上业务进行调用。',
    icon: IconImport,
    color: '#14C9C9',
    tags: ['文件交互', '线上调用', '样本传输'],
    serviceType: '外数线上调用服务申请'
  }
]

const handleSceneClick = (scene: any) => {
  if (scene.serviceType === '外数线上调用服务申请') {
    router.push({ name: 'RiskExternalDataOnlineCallApplication' })
  } else {
    currentServiceType.value = scene.serviceType
    drawerVisible.value = true
  }
}

const handleSuccess = () => {
  // 申请成功后跳转到服务列表页
  router.push({ name: 'RiskExternalDataService' })
}

const showDocs = (scene: any) => {
  Message.info(`正在查看【${scene.title}】的使用文档...`)
}

const showNotifications = () => {
  notificationVisible.value = true
}

const handleNotificationRead = (id: number) => {
  const notif = notifications.value.find(n => n.id === id)
  if (notif) {
    notif.read = true
  }
}

const handleAllRead = () => {
  notifications.value.forEach(n => n.read = true)
  Message.success('已将所有通知标为已读')
}

const notificationIcon = (type: string) => {
  const map: Record<string, any> = {
    success: IconCheckCircle,
    error: IconCloseCircle,
    warning: IconInfoCircle,
    info: IconBell
  }
  return map[type] || IconBell
}

const notificationColor = (type: string) => {
  const map: Record<string, string> = {
    success: 'green',
    error: 'red',
    warning: 'orange',
    info: 'blue'
  }
  return map[type] || 'blue'
}
</script>

<style scoped>
.service-scene-container {
  padding: 0 16px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.scene-card {
  transition: all 0.3s;
}

.scene-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.scene-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.scene-desc {
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 8px;
  margin-top: 8px;
}
<a-drawer
  v-model:visible="notificationVisible"
  title="通知中心"
  :width="480"
  :footer="false"
>
  <template #title>
    <div style="display: flex; align-items: center; gap: 8px;">
      <icon-bell />
      <span>通知中心</span>
      <a-tag v-if="unreadCount > 0" color="red" size="small">{{ unreadCount }} 未读</a-tag>
    </div>
  </template>
  <template #extra>
    <a-button type="text" size="small" @click="handleAllRead" :disabled="unreadCount === 0">全部标为已读</a-button>
  </template>
  <div class="notification-list">
    <div
      v-for="notif in notifications"
      :key="notif.id"
      class="notification-item"
      :class="{ 'unread': !notif.read }"
      @click="handleNotificationRead(notif.id)"
    >
      <div class="notification-icon" :style="{ color: notificationColor(notif.type) }">
        <component :is="notificationIcon(notif.type)" />
      </div>
      <div class="notification-content">
        <div class="notification-title">{{ notif.title }}</div>
        <div class="notification-text">{{ notif.content }}</div>
        <div class="notification-time">{{ notif.time }}</div>
      </div>
      <div v-if="!notif.read" class="notification-dot"></div>
    </div>
  </div>
</a-drawer>

<style scoped>
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #eef1f6;
}

.notification-item.unread {
  background: #e6f3ff;
  border-left: 3px solid #165dff;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: #1d2129;
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  color: #4e5969;
  line-height: 1.5;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: #86909c;
}

.notification-dot {
  width: 8px;
  height: 8px;
  background: #f53f3f;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}
</style>