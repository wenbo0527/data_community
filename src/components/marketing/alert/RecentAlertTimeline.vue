<template>
  <div class="recent-alert-timeline">
    <a-card title="最近预警" :bordered="false" class="timeline-card">
      <template #extra>
        <a-space>
          <a-button
            type="text"
            size="small"
            @click="handleViewAllHistory"
          >
            查看全部
          </a-button>
          <a-select
            v-model="typeFilter"
            size="small"
            style="width: 100px"
            placeholder="类型"
            allow-clear
            @change="handleTypeFilter"
          >
            <a-option value="inventory">库存</a-option>
            <a-option value="expiry">过期</a-option>
            <a-option value="failure">失败</a-option>
          </a-select>
          <a-select
            v-model="statusFilter"
            size="small"
            style="width: 100px"
            placeholder="状态"
            allow-clear
            @change="handleStatusFilter"
          >
            <a-option value="pending">待处理</a-option>
            <a-option value="processing">处理中</a-option>
            <a-option value="resolved">已解决</a-option>
          </a-select>
        </a-space>
      </template>

      <div class="timeline-container">
        <!-- 按类型分组显示 -->
        <div v-if="groupedAlerts && Object.keys(groupedAlerts).length > 0" class="grouped-timeline">
          <div
            v-for="(alerts, type) in groupedAlerts"
            :key="type"
            class="type-group"
          >
            <div class="type-header">
              <a-tag :color="getTypeColor(type)" size="large">
                <template #icon>
                  <component :is="getAlertIcon(type)" />
                </template>
                {{ getTypeText(type) }}
              </a-tag>
              <div class="header-actions">
                <span class="alert-count">{{ alerts.length }}条</span>
                <a-button
                  type="text"
                  size="small"
                  @click="toggleTypeExpansion(type)"
                >
                  {{ expandedTypes.has(type) ? '收起' : '展开' }}
                </a-button>
              </div>
            </div>
            
            <div v-show="expandedTypes.has(type)" class="timeline-list">
              <div
                v-for="(alert, index) in alerts.slice(0, 3)"
                :key="alert.id"
                class="timeline-item"
                :class="[
                  { 'timeline-item--last': index === Math.min(alerts.length, 3) - 1 }
                ]"
              >
                <!-- 时间线节点 -->
                <div class="timeline-node">
                  <div class="timeline-dot" :class="`timeline-dot--${type}`">
                    <component :is="getAlertIcon(alert.type)" />
                  </div>
                  <div v-if="index !== Math.min(alerts.length, 3) - 1" class="timeline-line"></div>
                </div>

                <!-- 预警卡片 -->
                <div class="alert-timeline-card" @click="handleAlertClick(alert)">
                  <div class="alert-timeline-card__header">
                    <div class="alert-info">
                      <a-tag 
                        :color="getStatusColor(alert.status)" 
                        size="small"
                        class="status-tag"
                      >
                        {{ getStatusText(alert.status) }}
                      </a-tag>
                    </div>
                    <div class="alert-time">
                      {{ formatRelativeTime(alert.createTime) }}
                    </div>
                  </div>

                  <div class="alert-timeline-card__content">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-message">{{ alert.message || '暂无详细信息' }}</div>
                  </div>

                  <div class="alert-timeline-card__actions">
                    <a-space size="mini">
                      <!-- 失败类预警显示处理按钮 -->
                      <a-button
                        v-if="alert.type === 'failure' && alert.status === 'pending'"
                        type="primary"
                        size="mini"
                        @click.stop="handleProcessAlert(alert)"
                      >
                        处理
                      </a-button>
                      <!-- 库存和过期预警只显示查看详情 -->
                      <a-button
                        type="text"
                        size="mini"
                        @click.stop="handleViewDetail(alert)"
                      >
                        详情
                      </a-button>
                      <!-- 所有类型都可以标记已知 -->
                      <a-button
                        v-if="alert.status !== 'resolved'"
                        type="text"
                        size="mini"
                        status="success"
                        @click.stop="handleResolveAlert(alert)"
                      >
                        {{ alert.type === 'failure' ? '标记解决' : '标记已知' }}
                      </a-button>
                    </a-space>
                  </div>
                </div>
              </div>
              
              <!-- 显示更多按钮 -->
              <div v-if="alerts.length > 3" class="show-more">
                <a-button
                  type="text"
                  size="small"
                  @click="handleShowMoreType(type)"
                >
                  查看更多{{ getTypeText(type) }}预警 ({{ alerts.length - 3 }}条)
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-timeline">
          <a-empty description="暂无预警记录" />
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IconExclamationCircle, IconSettings, IconClockCircle, IconCheckCircle } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

// 定义组件属性
const props = defineProps({
  alerts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义组件事件
const emit = defineEmits([
  'process-alert',
  'view-detail', 
  'resolve-alert',
  'load-more',
  'view-all-history',
  'type-filter',
  'status-filter'
])

// 响应式数据
const typeFilter = ref('')
const statusFilter = ref('')
const expandedTypes = ref(new Set(['inventory', 'expiry', 'failure'])) // 默认展开所有类型

// 过滤后的预警数据 - 限制为最新10条或3日内
const filteredAlerts = computed(() => {
  let filtered = props.alerts || []

  // 时间筛选：3日内
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  
  filtered = filtered.filter(alert => {
    const alertTime = new Date(alert.createTime || alert.time)
    return alertTime >= threeDaysAgo
  })

  // 类型筛选
  if (typeFilter.value) {
    filtered = filtered.filter(alert => alert.type === typeFilter.value)
  }

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(alert => alert.status === statusFilter.value)
  }

  // 按时间排序并限制为最新10条
  return filtered
    .sort((a, b) => new Date(b.createTime || b.time) - new Date(a.createTime || a.time))
    .slice(0, 10)
})

// 按类型分组的预警数据
const groupedAlerts = computed(() => {
  const groups = {}
  
  filteredAlerts.value.forEach(alert => {
    if (!groups[alert.type]) {
      groups[alert.type] = []
    }
    groups[alert.type].push(alert)
  })

  // 按时间排序每个分组
  Object.keys(groups).forEach(type => {
    groups[type].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  })

  return groups
})

// 显示的预警数据
const displayAlerts = computed(() => {
  return filteredAlerts.value.slice(0, displayLimit.value)
})

// 获取预警类型颜色
const getTypeColor = (type) => {
  const colors = {
    inventory: '#1890FF',
    expiry: '#FA8C16',
    failure: '#F53F3F'
  }
  return colors[type] || '#86909C'
}

// 获取预警类型文本
const getTypeText = (type) => {
  const texts = {
    inventory: '库存预警',
    expiry: '过期预警',
    failure: '失败预警'
  }
  return texts[type] || '未知类型'
}

// 获取预警状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: '#F53F3F',
    processing: '#FA8C16',
    resolved: '#52C41A'
  }
  return colors[status] || '#86909C'
}

// 获取预警状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决'
  }
  return texts[status] || '未知状态'
}

// 获取预警图标
const getAlertIcon = (type) => {
  const icons = {
    inventory: IconExclamationCircle,
    expiry: IconClockCircle,
    failure: IconSettings
  }
  return icons[type] || IconExclamationCircle
}

// 格式化相对时间
const formatRelativeTime = (time) => {
  const now = new Date()
  const alertTime = new Date(time)
  const diff = now - alertTime
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 事件处理函数
const handleTypeFilter = (value) => {
  typeFilter.value = value
  emit('type-filter', value)
}

const handleStatusFilter = (value) => {
  statusFilter.value = value
  emit('status-filter', value)
}

const handleAlertClick = (alert) => {
  emit('view-detail', alert)
}

const handleProcessAlert = (alert) => {
  emit('process-alert', alert)
}

const handleViewDetail = (alert) => {
  emit('view-detail', alert)
}

const handleResolveAlert = (alert) => {
  emit('resolve-alert', alert)
}

const handleViewAllHistory = () => {
  emit('view-all-history')
}

const handleShowMoreType = (type) => {
  // 显示该类型的更多预警
  Message.info(`查看更多${getTypeText(type)}`)
}

const toggleTypeExpansion = (type) => {
  if (expandedTypes.value.has(type)) {
    expandedTypes.value.delete(type)
  } else {
    expandedTypes.value.add(type)
  }
}

onMounted(() => {
  // 组件挂载后的初始化逻辑
})

onUnmounted(() => {
  // 组件卸载前的清理逻辑
})
</script>

<style scoped>
.recent-alert-timeline {
  width: 100%;
}

.timeline-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-container {
  position: relative;
}

.grouped-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.type-group {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-count {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
}

.timeline-list {
  position: relative;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
}

.timeline-item--last {
  margin-bottom: 0;
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  position: relative;
  z-index: 2;
}

.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  position: relative;
  z-index: 3;
}

.timeline-dot--inventory {
  background: #1890FF;
}

.timeline-dot--expiry {
  background: #FA8C16;
}

.timeline-dot--failure {
  background: #F53F3F;
}

.timeline-line {
  width: 2px;
  height: 40px;
  background: #e8e8e8;
  margin-top: 8px;
}

.alert-timeline-card {
  flex: 1;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.alert-timeline-card:hover {
  border-color: #1890FF;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  transform: translateY(-1px);
}

.alert-timeline-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.alert-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tag {
  font-size: 12px;
}

.alert-time {
  font-size: 12px;
  color: #999;
}

.alert-timeline-card__content {
  margin-bottom: 12px;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.4;
}

.alert-message {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alert-timeline-card__actions {
  display: flex;
  justify-content: flex-end;
}

.show-more {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e8e8e8;
}

.empty-timeline {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.load-more {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .type-group {
    padding: 12px;
  }
  
  .timeline-item {
    margin-bottom: 12px;
  }
  
  .timeline-dot {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
  
  .timeline-line {
    height: 30px;
  }
  
  .alert-timeline-card {
    padding: 12px;
  }
  
  .alert-timeline-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .alert-info {
    width: 100%;
  }
  
  .alert-time {
    align-self: flex-end;
  }
}
</style>