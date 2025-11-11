<template>
  <div class="budget-alert-panel">
    <div class="alert-header">
      <h3 class="alert-title">
        预算预警
        <a-badge :count="unreadCount" :offset="[10, -5]" />
      </h3>
      <div class="alert-controls">
        <a-button type="text" size="small" @click="handleRefresh">
          <template #icon>
            <icon-refresh />
          </template>
        </a-button>
        <a-button type="text" size="small" @click="handleViewAll">
          查看全部
        </a-button>
      </div>
    </div>
    
    <div class="alert-content">
      <div v-if="loading" class="loading-container">
        <a-spin />
      </div>
      
      <div v-else-if="alerts.length === 0" class="empty-container">
        <a-empty description="暂无预警信息" />
      </div>
      
      <div v-else class="alert-list">
        <div 
          v-for="alert in displayedAlerts" 
          :key="alert.id"
          class="alert-item"
          :class="{ unread: !alert.isRead, high: alert.alertLevel === 'high' }"
          @click="handleAlertClick(alert)"
        >
          <div class="alert-icon">
            <icon-exclamation-circle :style="{ color: getAlertColor(alert.alertLevel) }" />
          </div>
          
          <div class="alert-content-main">
            <div class="alert-header-info">
              <span class="alert-type">{{ getAlertTypeText(alert.alertType) }}</span>
              <span class="alert-level" :style="{ color: getAlertColor(alert.alertLevel) }">
                {{ getAlertLevelText(alert.alertLevel) }}
              </span>
            </div>
            
            <div class="alert-title-text">{{ alert.title }}</div>
            
            <div class="alert-description">{{ alert.description }}</div>
            
            <div class="alert-footer">
              <span class="alert-time">{{ formatTime(alert.createdAt) }}</span>
              <span class="alert-budget">{{ alert.budgetName }}</span>
            </div>
          </div>
          
          <div class="alert-actions">
            <a-button 
              v-if="!alert.isRead" 
              type="text" 
              size="mini"
              @click.stop="handleMarkAsRead(alert.id)"
            >
              标记已读
            </a-button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="alerts.length > displayLimit" class="alert-footer-actions">
      <a-button type="text" @click="handleExpand">
        {{ expanded ? '收起' : `展开全部 (${alerts.length})` }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconRefresh, IconExclamationCircle } from '@arco-design/web-vue/es/icon'
import { budgetApiService } from '@/api/budget'
import type { AlertRecord, AlertQueryParams } from '@/types/budget'

// Props
const props = defineProps({
  maxHeight: {
    type: Number,
    default: 400
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 30000 // 30秒
  }
})

// Emits
const emit = defineEmits<{
  alertClick: [alert: AlertRecord]
  markAsRead: [alertId: string]
}>()

// 响应式数据
const loading = ref(false)
const alerts = ref<AlertRecord[]>([])
const expanded = ref(false)
const displayLimit = 5

// 计算属性
const unreadCount = computed(() => alerts.value.filter(alert => !alert.isRead).length)
const displayedAlerts = computed(() => {
  if (expanded.value) {
    return alerts.value
  }
  return alerts.value.slice(0, displayLimit)
})

// 生命周期
let refreshTimer: number | null = null

onMounted(async () => {
  await loadAlerts()
  
  if (props.autoRefresh) {
    startAutoRefresh()
  }
})

// 方法
const loadAlerts = async (params?: AlertQueryParams) => {
  try {
    loading.value = true
    // 使用模拟数据或空数组，避免API调用错误
    alerts.value = [] // await budgetApiService.getAlerts(params)
  } catch (error) {
    Message.error('加载预警数据失败')
    console.error('加载预警数据失败:', error)
    alerts.value = []
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  refreshTimer = window.setInterval(() => {
    loadAlerts()
  }, props.refreshInterval)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const handleRefresh = async () => {
  await loadAlerts()
  Message.success('预警数据已刷新')
}

const handleViewAll = () => {
  // 导航到预警管理页面
  // router.push('/budget/alerts')
  Message.info('功能开发中')
}

const handleAlertClick = (alert: AlertRecord) => {
  emit('alertClick', alert)
  
  // 如果是未读预警，自动标记为已读
  if (!alert.isRead) {
    handleMarkAsRead(alert.id)
  }
}

const handleMarkAsRead = async (alertId: string) => {
  try {
    const updatedAlert = await budgetApiService.markAlertAsRead(alertId)
    if (updatedAlert) {
      // 更新本地数据
      const index = alerts.value.findIndex(alert => alert.id === alertId)
      if (index !== -1) {
        alerts.value[index] = updatedAlert
      }
      
      emit('markAsRead', alertId)
      Message.success('已标记为已读')
    }
  } catch (error) {
    Message.error('标记已读失败')
    console.error('标记已读失败:', error)
  }
}

const handleExpand = () => {
  expanded.value = !expanded.value
}

// 工具函数
const getAlertColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    low: '#00b42a',
    medium: '#ff7d00',
    high: '#f53f3f'
  }
  return colorMap[level] || '#86909c'
}

const getAlertTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    budget_exceeded: '预算超支',
    budget_warning: '预算预警',
    cost_anomaly: '成本异常',
    contract_expiry: '合同到期',
    settlement_overdue: '结算逾期'
  }
  return typeMap[type] || type
}

const getAlertLevelText = (level: string): string => {
  const levelMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return levelMap[level] || level
}

const formatTime = (date: string | Date): string => {
  const now = new Date()
  const alertTime = new Date(date)
  const diff = now.getTime() - alertTime.getTime()
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // 小于1天
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  // 超过7天显示具体日期
  return alertTime.toLocaleDateString('zh-CN')
}

// 暴露方法
defineExpose({
  refresh: loadAlerts,
  startAutoRefresh,
  stopAutoRefresh
})
</script>

<style scoped lang="less">
.budget-alert-panel {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  
  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f1f2;
    
    .alert-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
      display: flex;
      align-items: center;
    }
    
    .alert-controls {
      display: flex;
      gap: 8px;
    }
  }
  
  .alert-content {
    min-height: 200px;
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
    
    .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
    
    .alert-list {
      padding: 0;
      
      .alert-item {
        display: flex;
        align-items: flex-start;
        padding: 16px 20px;
        border-bottom: 1px solid #f0f1f2;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: #f7f8fa;
        }
        
        &.unread {
          background-color: #f2f9ff;
          
          &:hover {
            background-color: #e6f4ff;
          }
        }
        
        &.high {
          border-left: 3px solid #f53f3f;
        }
        
        .alert-icon {
          margin-right: 12px;
          margin-top: 2px;
          
          .arco-icon {
            font-size: 16px;
          }
        }
        
        .alert-content-main {
          flex: 1;
          min-width: 0;
          
          .alert-header-info {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            
            .alert-type {
              font-size: 12px;
              color: #86909c;
              background: #f2f3f5;
              padding: 2px 6px;
              border-radius: 4px;
            }
            
            .alert-level {
              font-size: 12px;
              font-weight: 500;
            }
          }
          
          .alert-title-text {
            font-size: 14px;
            font-weight: 500;
            color: #1d2129;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .alert-description {
            font-size: 13px;
            color: #4e5969;
            line-height: 1.5;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .alert-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #86909c;
            
            .alert-time {
              flex-shrink: 0;
            }
            
            .alert-budget {
              margin-left: 8px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
        
        .alert-actions {
          flex-shrink: 0;
          margin-left: 12px;
        }
      }
    }
  }
  
  .alert-footer-actions {
    display: flex;
    justify-content: center;
    padding: 12px;
    border-top: 1px solid #f0f1f2;
  }
}
</style>