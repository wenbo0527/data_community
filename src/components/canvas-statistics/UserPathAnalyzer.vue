<template>
  <div class="user-path-analyzer">
    <div class="section-header">
      <div class="section-title">
        <icon-history />
        <span>用户路径分析</span>
      </div>
      <div class="section-actions">
        <a-space>
          <a-button 
            type="text" 
            size="mini"
            @click="clearPath"
          >
            <icon-undo />
          </a-button>
          <a-button 
            type="text" 
            size="mini"
            @click="toggleHistory"
          >
            <icon-history />
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 用户ID输入 -->
    <div class="user-input-section">
      <div class="input-group">
        <a-input
          v-model="userId"
          placeholder="输入用户ID进行路径分析"
          size="default"
          allow-clear
          @search="analyzeUserPath"
          @press-enter="analyzeUserPath"
        >
          <template #prefix>
            <icon-user />
          </template>
          <template #suffix>
            <a-button 
              type="primary" 
              size="mini"
              @click="analyzeUserPath"
              :loading="loading"
            >
              <icon-search />
              分析
            </a-button>
          </template>
        </a-input>
      </div>
      
      <!-- 历史记录 -->
      <div v-if="showHistory" class="history-dropdown">
        <div class="history-header">
          <span>最近分析</span>
          <a-link @click="clearHistory">清空</a-link>
        </div>
        <div class="history-list">
          <div 
            v-for="item in analysisHistory" 
            :key="item.userId"
            class="history-item"
            @click="selectHistoryItem(item.userId)"
          >
            <div class="history-user">
              <span class="user-id">{{ desensitizeUserId(item.userId) }}</span>
              <span class="analysis-time">{{ formatTime(item.timestamp) }}</span>
            </div>
            <div class="history-stats">
              <span>{{ item.nodesVisited }}个节点</span>
              <span>{{ formatDuration(item.totalStayTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 路径可视化 -->
    <div v-if="currentPath" class="path-visualization">
      <div class="path-header">
        <div class="path-info">
          <div class="user-profile">
            <div class="user-id">用户: {{ desensitizeUserId(currentPath.userId) }}</div>
            <div class="session-info">
              <span>{{ currentPath.userProfile.deviceType }}</span>
              <span>{{ currentPath.userProfile.location }}</span>
            </div>
          </div>
          <div class="session-stats">
            <div class="stat-item">
              <span class="stat-label">访问时间</span>
              <span class="stat-value">{{ formatTimeRange(currentPath.userProfile.firstVisit, currentPath.userProfile.lastVisit) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总停留</span>
              <span class="stat-value">{{ formatDuration(currentPath.totalStayTime) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 路径控制 -->
        <div class="path-controls">
          <div class="playback-controls">
            <a-button 
              type="text" 
              size="mini"
              @click="toggleAnimation"
            >
              <icon-play-arrow v-if="!isAnimating" />
              <icon-pause v-else />
            </a-button>
            <a-button 
              type="text" 
              size="mini"
              @click="resetAnimation"
            >
              <icon-stop />
            </a-button>
            <a-slider
              v-model="playbackSpeed"
              :min="0.5"
              :max="3"
              :step="0.5"
              :show-ticks="true"
              :show-input="false"
              style="width: 80px"
            />
            <span class="speed-label">{{ playbackSpeed }}x</span>
          </div>
          
          <div class="view-controls">
            <a-button 
              type="text" 
              size="mini"
              @click="togglePathStyle"
            >
              <icon-palette />
            </a-button>
            <a-button 
              type="text" 
              size="mini"
              @click="exportPath"
            >
              <icon-download />
            </a-button>
          </div>
        </div>
      </div>
      
      <!-- 路径时间线 -->
      <div class="path-timeline">
        <div class="timeline-header">
          <span>路径时间线</span>
          <span>{{ currentPath.path.length }}个节点</span>
        </div>
        <div class="timeline-content">
          <div 
            v-for="(node, index) in currentPath.path" 
            :key="node.nodeId"
            class="timeline-node"
            :class="{ 
              'active': currentStep === index,
              'completed': currentStep > index,
              'current': isAnimating && currentStep === index
            }"
            @click="jumpToStep(index)"
          >
            <div class="node-indicator">
              <div class="node-dot"></div>
              <div v-if="index < currentPath.path.length - 1" class="node-line"></div>
            </div>
            <div class="node-content">
              <div class="node-name">{{ node.nodeLabel }}</div>
              <div class="node-time">{{ formatTime(node.enterTime) }}</div>
              <div class="node-duration">停留 {{ formatDuration(node.stayTime) }}</div>
            </div>
            <div class="node-stats">
              <div class="conversion-rate">{{ node.conversionRate }}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 路径动画预览 -->
      <div class="path-preview">
        <div class="preview-header">
          <span>路径预览</span>
          <span>{{ currentStep + 1 }} / {{ currentPath.path.length }}</span>
        </div>
        <div class="preview-canvas" ref="previewCanvas">
          <!-- 这里将显示简化的路径图 -->
          <div class="path-nodes">
            <div 
              v-for="(node, index) in currentPath.path" 
              :key="node.nodeId"
              class="preview-node"
              :class="{ 
                'active': currentStep >= index,
                'current': currentStep === index
              }"
              :style="{ 
                left: (index * 60) + 'px',
                top: '20px'
              }"
            >
              <div class="node-icon">
                <component :is="getNodeIcon(node.nodeType)" />
              </div>
              <div class="node-label">{{ node.nodeLabel }}</div>
            </div>
          </div>
          <div class="path-connections">
            <div 
              v-for="(node, index) in currentPath.path.slice(0, -1)" 
              :key="'conn-' + index"
              class="connection-line"
              :class="{ 'active': currentStep > index }"
              :style="{ 
                left: (index * 60 + 20) + 'px',
                top: '30px',
                width: '40px'
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <icon-route />
      </div>
      <div class="empty-text">
        <p>输入用户ID开始路径分析</p>
        <p class="empty-hint">支持模糊搜索和历史记录</p>
      </div>
    </div>

    <!-- 分析中状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <icon-loading />
      </div>
      <div class="loading-text">正在分析用户路径...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { 
  IconUndo, 
  IconHistory,
  IconUser,
  IconSearch,
  IconPlayArrow,
  IconPause,
  IconStop,
  IconPalette,
  IconDownload,
  IconLoading
} from '@arco-design/web-vue/es/icon'

interface PathNode {
  nodeId: string
  nodeLabel: string
  position: { x: number; y: number }
  enterTime: string
  exitTime: string
  stayTime: number
  conversionRate: number
  nextNodes: string[]
}

interface UserPathData {
  userId: string
  userProfile: {
    firstVisit: string
    lastVisit: string
    totalVisits: number
    deviceType: string
    location: string
  }
  path: PathNode[]
  totalStayTime: number
  conversionPath: boolean
}

interface Props {
  canvasId: string
  filters: any
}

const props = defineProps<Props>()
const emit = defineEmits(['path-highlight', 'clear-path'])

// 状态管理
const userId = ref('')
const loading = ref(false)
const currentPath = ref<UserPathData | null>(null)
const isAnimating = ref(false)
const currentStep = ref(0)
const playbackSpeed = ref(1)
const showHistory = ref(false)
const pathStyle = ref<'default' | 'highlight'>('highlight')

// 分析历史
const analysisHistory = reactive([
  {
    userId: 'user_12345',
    timestamp: new Date(Date.now() - 3600000),
    nodesVisited: 6,
    totalStayTime: 7200
  },
  {
    userId: 'user_67890',
    timestamp: new Date(Date.now() - 7200000),
    nodesVisited: 4,
    totalStayTime: 4800
  }
])

// 动画定时器
let animationTimer: number | null = null

// 模拟路径数据
const mockPathData: UserPathData = {
  userId: 'user_demo_123',
  userProfile: {
    firstVisit: '2024-01-15 10:30:00',
    lastVisit: '2024-01-15 10:45:00',
    totalVisits: 1,
    deviceType: '移动端',
    location: '北京市'
  },
  path: [
    {
      nodeId: 'node1',
      nodeLabel: '开始节点',
      position: { x: 100, y: 100 },
      enterTime: '2024-01-15 10:30:00',
      exitTime: '2024-01-15 10:30:02',
      stayTime: 2,
      conversionRate: 100.0,
      nextNodes: ['node2']
    },
    {
      nodeId: 'node2',
      nodeLabel: '新用户判断',
      position: { x: 200, y: 100 },
      enterTime: '2024-01-15 10:30:02',
      exitTime: '2024-01-15 10:30:07',
      stayTime: 5,
      conversionRate: 80.0,
      nextNodes: ['node3']
    },
    {
      nodeId: 'node3',
      nodeLabel: '发送欢迎短信',
      position: { x: 300, y: 50 },
      enterTime: '2024-01-15 10:30:07',
      exitTime: '2024-01-15 10:30:15',
      stayTime: 8,
      conversionRate: 98.8,
      nextNodes: ['node4']
    },
    {
      nodeId: 'node4',
      nodeLabel: '等待1小时',
      position: { x: 300, y: 150 },
      enterTime: '2024-01-15 10:30:15',
      exitTime: '2024-01-15 11:30:15',
      stayTime: 3600,
      conversionRate: 99.2,
      nextNodes: ['node5']
    },
    {
      nodeId: 'node5',
      nodeLabel: '添加新用户标签',
      position: { x: 400, y: 100 },
      enterTime: '2024-01-15 11:30:15',
      exitTime: '2024-01-15 11:30:18',
      stayTime: 3,
      conversionRate: 100.0,
      nextNodes: ['node6']
    },
    {
      nodeId: 'node6',
      nodeLabel: '结束节点',
      position: { x: 500, y: 100 },
      enterTime: '2024-01-15 11:30:18',
      exitTime: '2024-01-15 11:30:19',
      stayTime: 1,
      conversionRate: 0.0,
      nextNodes: []
    }
  ],
  totalStayTime: 3619,
  conversionPath: true
}

// 分析用户路径
const analyzeUserPath = async () => {
  if (!userId.value.trim()) {
    // 显示提示
    return
  }
  
  loading.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 设置当前路径数据
    currentPath.value = mockPathData
    
    // 添加到历史记录
    addToHistory(userId.value, mockPathData)
    
    // 触发路径高亮事件
    emit('path-highlight', {
      userId: userId.value,
      path: mockPathData.path,
      style: pathStyle.value
    })
    
    // 重置动画状态
    currentStep.value = 0
    isAnimating.value = false
    
  } catch (error) {
    console.error('路径分析失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取节点图标
const getNodeIcon = (nodeType: string) => {
  const icons: Record<string, any> = {
    start: IconPlayCircle,
    end: IconStop,
    condition: IconExclamationCircle,
    action: IconSend,
    delay: IconClockCircle,
    tag: IconCheckCircle
  }
  return icons[nodeType] || IconUser
}

// 切换动画播放
const toggleAnimation = () => {
  if (isAnimating.value) {
    pauseAnimation()
  } else {
    startAnimation()
  }
}

// 开始动画
const startAnimation = () => {
  if (!currentPath.value) return
  
  isAnimating.value = true
  currentStep.value = 0
  
  const animateStep = () => {
    if (!isAnimating.value || !currentPath.value) return
    
    if (currentStep.value < currentPath.value.path.length - 1) {
      currentStep.value++
      
      // 设置下一步动画
      animationTimer = window.setTimeout(animateStep, 1000 / playbackSpeed.value)
    } else {
      // 动画结束
      isAnimating.value = false
      currentStep.value = currentPath.value.path.length - 1
    }
  }
  
  // 开始第一步
  animationTimer = window.setTimeout(animateStep, 1000 / playbackSpeed.value)
}

// 暂停动画
const pauseAnimation = () => {
  isAnimating.value = false
  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
}

// 重置动画
const resetAnimation = () => {
  pauseAnimation()
  currentStep.value = 0
}

// 跳转到指定步骤
const jumpToStep = (step: number) => {
  if (!currentPath.value) return
  
  pauseAnimation()
  currentStep.value = Math.max(0, Math.min(step, currentPath.value.path.length - 1))
}

// 切换路径样式
const togglePathStyle = () => {
  pathStyle.value = pathStyle.value === 'highlight' ? 'default' : 'highlight'
  
  if (currentPath.value) {
    emit('path-highlight', {
      userId: userId.value,
      path: currentPath.value.path,
      style: pathStyle.value
    })
  }
}

// 导出路径
const exportPath = () => {
  if (!currentPath.value) return
  
  const data = {
    userId: currentPath.value.userId,
    path: currentPath.value.path,
    totalStayTime: currentPath.value.totalStayTime,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `user_path_${currentPath.value.userId}_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 清除路径
const clearPath = () => {
  currentPath.value = null
  userId.value = ''
  isAnimating.value = false
  currentStep.value = 0
  emit('clear-path')
}

// 切换历史记录
const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

// 选择历史记录项
const selectHistoryItem = (historyUserId: string) => {
  userId.value = historyUserId
  showHistory.value = false
  analyzeUserPath()
}

// 添加到历史记录
const addToHistory = (userId: string, pathData: UserPathData) => {
  const existingIndex = analysisHistory.findIndex(item => item.userId === userId)
  const historyItem = {
    userId,
    timestamp: new Date(),
    nodesVisited: pathData.path.length,
    totalStayTime: pathData.totalStayTime
  }
  
  if (existingIndex >= 0) {
    analysisHistory.splice(existingIndex, 1)
  }
  
  analysisHistory.unshift(historyItem)
  
  // 保持最多10条历史记录
  if (analysisHistory.length > 10) {
    analysisHistory.splice(10)
  }
}

// 清空历史记录
const clearHistory = () => {
  analysisHistory.splice(0)
  showHistory.value = false
}

// 用户ID脱敏
const desensitizeUserId = (userId: string): string => {
  if (userId.length <= 8) {
    return '*'.repeat(userId.length)
  }
  return userId.substring(0, 4) + '****' + userId.substring(userId.length - 4)
}

// 格式化时间
const formatTime = (time: string): string => {
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 格式化时间范围
const formatTimeRange = (start: string, end: string): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const duration = endDate.getTime() - startDate.getTime()
  
  return `${formatTime(start)} - ${formatTime(end)} (${formatDuration(Math.floor(duration / 1000))})`
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}时${minutes}分`
  }
}

// 监听速度变化
const handleSpeedChange = () => {
  if (isAnimating.value) {
    pauseAnimation()
    startAnimation()
  }
}

// 监听筛选条件变化
watch(() => props.filters, () => {
  // 根据筛选条件重新加载数据
  if (userId.value && currentPath.value) {
    analyzeUserPath()
  }
}, { deep: true })

// 监听播放速度变化
watch(playbackSpeed, handleSpeedChange)

onMounted(() => {
  // 组件挂载时的初始化
})

onUnmounted(() => {
  // 清理动画定时器
  if (animationTimer) {
    clearTimeout(animationTimer)
  }
})
</script>

<style scoped lang="scss">
.user-path-analyzer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.user-input-section {
  position: relative;
}

.input-group {
  display: flex;
  gap: 8px;
}

.history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  
  span {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
  }
}

.history-list {
  padding: 8px 0;
}

.history-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f5f5f5;
  
  &:hover {
    background: #f6ffed;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.history-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  
  .user-id {
    font-size: 13px;
    font-weight: 500;
    color: #262626;
  }
  
  .analysis-time {
    font-size: 11px;
    color: #8c8c8c;
  }
}

.history-stats {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #8c8c8c;
}

.path-visualization {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.path-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.path-info {
  flex: 1;
  display: flex;
  gap: 24px;
}

.user-profile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .user-id {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
  }
  
  .session-info {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #8c8c8c;
  }
}

.session-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  gap: 8px;
  
  .stat-label {
    font-size: 12px;
    color: #8c8c8c;
    min-width: 60px;
  }
  
  .stat-value {
    font-size: 12px;
    color: #262626;
    font-weight: 500;
  }
}

.path-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .speed-label {
    font-size: 11px;
    color: #8c8c8c;
    min-width: 30px;
  }
}

.view-controls {
  display: flex;
  gap: 4px;
}

.path-timeline {
  margin-bottom: 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  span {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
  }
}

.timeline-content {
  max-height: 200px;
  overflow-y: auto;
}

.timeline-node {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f6ffed;
    border-radius: 4px;
    margin: 0 -8px;
    padding: 8px;
  }
  
  &.active {
    .node-dot {
      background: #1890ff;
      box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
    }
  }
  
  &.completed {
    .node-dot {
      background: #52c41a;
    }
    
    .node-line {
      background: #52c41a;
    }
  }
  
  &.current {
    .node-dot {
      background: #722ed1;
      box-shadow: 0 0 0 4px rgba(114, 46, 209, 0.2);
      animation: pulse 1s infinite;
    }
  }
}

.node-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .node-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #d9d9d9;
    transition: all 0.3s ease;
  }
  
  .node-line {
    width: 2px;
    height: 20px;
    background: #d9d9d9;
    margin-top: 4px;
  }
}

.node-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .node-name {
    font-size: 13px;
    font-weight: 500;
    color: #262626;
  }
  
  .node-time {
    font-size: 11px;
    color: #8c8c8c;
  }
  
  .node-duration {
    font-size: 11px;
    color: #52c41a;
  }
}

.node-stats {
  .conversion-rate {
    font-size: 12px;
    font-weight: 600;
    color: #52c41a;
  }
}

.path-preview {
  background: #fff;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  span {
    font-size: 13px;
    color: #8c8c8c;
  }
}

.preview-canvas {
  position: relative;
  height: 60px;
  overflow: hidden;
}

.path-nodes {
  position: relative;
  height: 100%;
}

.preview-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  
  &.active {
    .node-icon {
      background: #722ed1;
      color: #fff;
    }
  }
  
  &.current {
    .node-icon {
      background: #1890ff;
      color: #fff;
      transform: scale(1.2);
    }
  }
  
  .node-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #fff;
    transition: all 0.3s ease;
  }
  
  .node-label {
    font-size: 10px;
    color: #8c8c8c;
    text-align: center;
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.path-connections {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  .connection-line {
    position: absolute;
    height: 2px;
    background: #d9d9d9;
    top: 30px;
    transition: all 0.3s ease;
    
    &.active {
      background: #722ed1;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  
  .empty-icon {
    font-size: 48px;
    color: #d9d9d9;
    margin-bottom: 16px;
  }
  
  .empty-text {
    p {
      font-size: 14px;
      color: #8c8c8c;
      margin: 0;
      
      &.empty-hint {
        font-size: 12px;
        margin-top: 4px;
      }
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  
  .loading-spinner {
    font-size: 32px;
    color: #1890ff;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    font-size: 14px;
    color: #8c8c8c;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 4px rgba(114, 46, 209, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(114, 46, 209, 0.1);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(114, 46, 209, 0.2);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

:deep(.arco-slider) {
  .arco-slider-track {
    background: #f0f0f0;
  }
  
  .arco-slider-bar {
    background: #1890ff;
  }
  
  .arco-slider-dot {
    border-color: #1890ff;
  }
}
</style>