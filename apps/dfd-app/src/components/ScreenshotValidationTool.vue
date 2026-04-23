<template>
  <div class="screenshot-validation-tool">
    <div class="tool-header">
      <h3 class="tool-title">📸 截图验证工具</h3>
      <p class="tool-description">自动生成各状态节点的截图用于人工验证</p>
    </div>
    
    <div class="tool-controls">
      <div class="control-group">
        <label class="control-label">节点类型</label>
        <select v-model="selectedNodeType" class="control-select">
          <option value="default">默认节点</option>
          <option value="start">开始节点</option>
          <option value="end">结束节点</option>
          <option value="condition">条件节点</option>
          <option value="process">处理节点</option>
          <option value="database">数据库节点</option>
        </select>
      </div>
      
      <div class="control-group">
        <label class="control-label">交互状态</label>
        <select v-model="selectedState" class="control-select">
          <option value="default">默认状态</option>
          <option value="hover">悬停状态</option>
          <option value="selected">选中状态</option>
          <option value="disabled">禁用状态</option>
          <option value="dragging">拖拽状态</option>
        </select>
      </div>
      
      <div class="control-group">
        <label class="control-label">截图尺寸</label>
        <select v-model="screenshotSize" class="control-select">
          <option value="small">小尺寸 (400x300)</option>
          <option value="medium">中尺寸 (800x600)</option>
          <option value="large">大尺寸 (1200x900)</option>
          <option value="custom">自定义尺寸</option>
        </select>
      </div>
      
      <div class="control-group" v-if="screenshotSize === 'custom'">
        <label class="control-label">自定义尺寸</label>
        <div class="custom-size-inputs">
          <input v-model.number="customWidth" type="number" placeholder="宽度" class="size-input">
          <span class="size-separator">×</span>
          <input v-model.number="customHeight" type="number" placeholder="高度" class="size-input">
        </div>
      </div>
      
      <div class="control-group">
        <label class="control-label">背景颜色</label>
        <div class="color-options">
          <div v-for="color in backgroundColors" 
               :key="color.value"
               class="color-option"
               :class="{ active: backgroundColor === color.value }"
               :style="{ backgroundColor: color.value }"
               @click="backgroundColor = color.value"
               :title="color.name">
          </div>
          <input v-model="backgroundColor" type="color" class="color-input">
        </div>
      </div>
      
      <div class="control-actions">
        <button @click="captureScreenshot" class="capture-button primary">
          📸 生成截图
        </button>
        <button @click="captureAllStates" class="capture-button secondary">
          🎬 批量生成
        </button>
        <button @click="clearScreenshots" class="capture-button danger">
          🗑️ 清空截图
        </button>
      </div>
    </div>
    
    <div class="tool-content">
      <div class="preview-area">
        <div class="preview-header">
          <h4 class="preview-title">预览区域</h4>
          <div class="preview-controls">
            <button @click="resetPreview" class="preview-button">
              🔄 重置
            </button>
            <button @click="toggleGrid" class="preview-button">
              📐 网格 {{ showGrid ? '开' : '关' }}
            </button>
          </div>
        </div>
        
        <div class="preview-container" 
             :style="previewContainerStyle"
             ref="previewContainer">
          <div v-if="showGrid" class="grid-overlay"></div>
          
          <div class="preview-node" 
               :class="previewNodeClass"
               :style="previewNodeStyle"
               @mouseenter="handleMouseEnter"
               @mouseleave="handleMouseLeave"
               @click="handleClick">
            <div class="node-header">
              <div class="node-icon" :style="{ backgroundColor: getNodeColor() }">ND</div>
              <div class="node-title-text">{{ getNodeTitle() }}</div>
              <div class="node-menu">
                <div class="menu-dot"></div>
                <div class="menu-dot"></div>
                <div class="menu-dot"></div>
              </div>
            </div>
            <div class="node-content">
              <div class="content-item">内容项 1</div>
              <div class="content-item">内容项 2</div>
              <div class="content-item">内容项 3</div>
            </div>
            <div class="node-ports">
              <div class="port in-port"></div>
              <div class="port out-port"></div>
            </div>
          </div>
          
          <div class="preview-info">
            <div class="info-item">
              <span class="info-label">节点类型：</span>
              <span class="info-value">{{ selectedNodeType }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">交互状态：</span>
              <span class="info-value">{{ selectedState }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">尺寸：</span>
              <span class="info-value">{{ getCurrentSize() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">颜色：</span>
              <span class="info-value color-sample" :style="{ backgroundColor: getNodeColor() }"></span>
              <span class="info-value">{{ getNodeColor() }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="screenshots-gallery">
        <div class="gallery-header">
          <h4 class="gallery-title">📷 截图库 ({{ screenshots.length }})</h4>
          <div class="gallery-controls">
            <button @click="downloadAllScreenshots" class="gallery-button" :disabled="screenshots.length === 0">
              📦 下载全部
            </button>
            <button @click="generateReport" class="gallery-button" :disabled="screenshots.length === 0">
              📊 生成报告
            </button>
          </div>
        </div>
        
        <div class="screenshots-grid" v-if="screenshots.length > 0">
          <div v-for="(screenshot, index) in screenshots" :key="index" class="screenshot-item">
            <div class="screenshot-container">
              <img :src="screenshot.dataUrl" :alt="screenshot.name" class="screenshot-image">
              <div class="screenshot-overlay">
                <div class="screenshot-info">
                  <div class="info-row">
                    <span class="info-label">类型：</span>
                    <span class="info-value">{{ screenshot.nodeType }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">状态：</span>
                    <span class="info-value">{{ screenshot.state }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">尺寸：</span>
                    <span class="info-value">{{ screenshot.width }}×{{ screenshot.height }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">时间：</span>
                    <span class="info-value">{{ formatTime(screenshot.timestamp) }}</span>
                  </div>
                </div>
                <div class="screenshot-actions">
                  <button @click="viewScreenshot(screenshot)" class="action-button">
                    👁️ 查看
                  </button>
                  <button @click="downloadScreenshot(screenshot)" class="action-button">
                    💾 下载
                  </button>
                  <button @click="deleteScreenshot(index)" class="action-button danger">
                    🗑️ 删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-gallery">
          <div class="empty-icon">📸</div>
          <div class="empty-text">暂无截图，点击"生成截图"开始</div>
        </div>
      </div>
    </div>
    
    <!-- 截图查看模态框 -->
    <div v-if="viewingScreenshot" class="screenshot-modal" @click="closeScreenshotView">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ viewingScreenshot.name }}</h3>
          <button @click="closeScreenshotView" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <img :src="viewingScreenshot.dataUrl" :alt="viewingScreenshot.name" class="modal-image">
          <div class="modal-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">节点类型：</span>
                <span class="info-value">{{ viewingScreenshot.nodeType }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">交互状态：</span>
                <span class="info-value">{{ viewingScreenshot.state }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">截图尺寸：</span>
                <span class="info-value">{{ viewingScreenshot.width }}×{{ viewingScreenshot.height }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">文件大小：</span>
                <span class="info-value">{{ formatFileSize(viewingScreenshot.size) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">生成时间：</span>
                <span class="info-value">{{ formatTime(viewingScreenshot.timestamp) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">背景颜色：</span>
                <span class="info-value color-sample" :style="{ backgroundColor: viewingScreenshot.backgroundColor }"></span>
                <span class="info-value">{{ viewingScreenshot.backgroundColor }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="downloadScreenshot(viewingScreenshot)" class="modal-button primary">
            💾 下载截图
          </button>
          <button @click="closeScreenshotView" class="modal-button">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// 状态变量
const selectedNodeType = ref('default')
const selectedState = ref('default')
const screenshotSize = ref('medium')
const customWidth = ref(800)
const customHeight = ref(600)
const backgroundColor = ref('#ffffff')
const showGrid = ref(false)
const screenshots = ref([])
const viewingScreenshot = ref(null)

// 背景颜色选项
const backgroundColors = ref([
  { name: '白色', value: '#ffffff' },
  { name: '浅灰', value: '#f8fafc' },
  { name: '深灰', value: '#374151' },
  { name: '蓝色', value: '#dbeafe' },
  { name: '绿色', value: '#dcfce7' },
  { name: '红色', value: '#fee2e2' }
])

// 计算属性
const previewContainerStyle = computed(() => {
  const size = getScreenshotDimensions()
  return {
    width: `${size.width}px`,
    height: `${size.height}px`,
    backgroundColor: backgroundColor.value,
    position: 'relative',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden'
  }
})

const previewNodeClass = computed(() => {
  return `node-state-${selectedState.value}`
})

const previewNodeStyle = computed(() => {
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10
  }
})

// 方法
const getScreenshotDimensions = () => {
  switch (screenshotSize.value) {
    case 'small':
      return { width: 400, height: 300 }
    case 'medium':
      return { width: 800, height: 600 }
    case 'large':
      return { width: 1200, height: 900 }
    case 'custom':
      return { width: customWidth.value, height: customHeight.value }
    default:
      return { width: 800, height: 600 }
  }
}

const getNodeColor = () => {
  const colors = {
    default: '#14b8a6',
    start: '#10b981',
    end: '#ef4444',
    condition: '#f59e0b',
    process: '#8b5cf6',
    database: '#3b82f6'
  }
  return colors[selectedNodeType.value] || '#14b8a6'
}

const getNodeTitle = () => {
  const titles = {
    default: '默认节点',
    start: '开始节点',
    end: '结束节点',
    condition: '条件节点',
    process: '处理节点',
    database: '数据库节点'
  }
  return titles[selectedNodeType.value] || '默认节点'
}

const getCurrentSize = () => {
  const dimensions = getScreenshotDimensions()
  return `${dimensions.width}×${dimensions.height}`
}

const handleMouseEnter = () => {
  if (selectedState.value === 'default') {
    // 可以在这里添加悬停效果
  }
}

const handleMouseLeave = () => {
  if (selectedState.value === 'default') {
    // 可以在这里移除悬停效果
  }
}

const handleClick = () => {
  if (selectedState.value === 'default') {
    // 可以在这里添加点击效果
  }
}

const captureScreenshot = async () => {
  try {
    const previewContainer = document.querySelector('.preview-container')
    if (!previewContainer) return

    // 使用 html2canvas 进行截图
    const html2canvas = await import('html2canvas')
    const canvas = await html2canvas.default(previewContainer, {
      backgroundColor: null,
      scale: 2, // 高DPI截图
      useCORS: true,
      allowTaint: true
    })

    const dataUrl = canvas.toDataURL('image/png', 1.0)
    const dimensions = getScreenshotDimensions()
    
    const screenshot = {
      id: Date.now(),
      name: `${selectedNodeType}-${selectedState}-${Date.now()}.png`,
      dataUrl,
      nodeType: selectedNodeType.value,
      state: selectedState.value,
      width: dimensions.width,
      height: dimensions.height,
      size: Math.round(dataUrl.length * 0.75), // 估算文件大小（字节）
      backgroundColor: backgroundColor.value,
      timestamp: new Date().toISOString()
    }

    screenshots.value.unshift(screenshot)
    
    // 显示成功消息
    showNotification('截图生成成功！', 'success')
    
  } catch (error) {
    console.error('截图生成失败:', error)
    showNotification('截图生成失败，请重试', 'error')
  }
}

const captureAllStates = async () => {
  const originalState = selectedState.value
  const states = ['default', 'hover', 'selected', 'disabled', 'dragging']
  
  showNotification('开始批量生成截图...', 'info')
  
  for (let i = 0; i < states.length; i++) {
    selectedState.value = states[i]
    await nextTick() // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 500)) // 等待动画完成
    await captureScreenshot()
  }
  
  selectedState.value = originalState
  showNotification('批量截图生成完成！', 'success')
}

const clearScreenshots = () => {
  if (confirm('确定要清空所有截图吗？')) {
    screenshots.value = []
    showNotification('截图已清空', 'info')
  }
}

const viewScreenshot = (screenshot) => {
  viewingScreenshot.value = screenshot
}

const closeScreenshotView = () => {
  viewingScreenshot.value = null
}

const downloadScreenshot = (screenshot) => {
  const link = document.createElement('a')
  link.download = screenshot.name
  link.href = screenshot.dataUrl
  link.click()
  showNotification('截图下载成功！', 'success')
}

const deleteScreenshot = (index) => {
  if (confirm('确定要删除这张截图吗？')) {
    screenshots.value.splice(index, 1)
    showNotification('截图已删除', 'info')
  }
}

const downloadAllScreenshots = () => {
  if (screenshots.value.length === 0) return
  
  // 创建一个压缩包并下载所有截图
  screenshots.value.forEach((screenshot, index) => {
    setTimeout(() => {
      downloadScreenshot(screenshot)
    }, index * 500) // 错开下载时间
  })
  
  showNotification('开始下载所有截图...', 'info')
}

const generateReport = () => {
  if (screenshots.value.length === 0) return
  
  const report = {
    title: '节点样式截图验证报告',
    generatedAt: new Date().toISOString(),
    summary: {
      totalScreenshots: screenshots.value.length,
      nodeTypes: [...new Set(screenshots.value.map(s => s.nodeType))],
      states: [...new Set(screenshots.value.map(s => s.state))],
      averageSize: Math.round(screenshots.value.reduce((sum, s) => sum + s.size, 0) / screenshots.value.length)
    },
    screenshots: screenshots.value.map(s => ({
      name: s.name,
      nodeType: s.nodeType,
      state: s.state,
      dimensions: `${s.width}x${s.height}`,
      size: formatFileSize(s.size),
      timestamp: s.timestamp
    }))
  }
  
  const dataStr = JSON.stringify(report, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', `screenshot-validation-report-${Date.now()}.json`)
  linkElement.click()
  
  showNotification('报告生成成功！', 'success')
}

const resetPreview = () => {
  selectedNodeType.value = 'default'
  selectedState.value = 'default'
  backgroundColor.value = '#ffffff'
  screenshotSize.value = 'medium'
  showGrid.value = false
  showNotification('预览已重置', 'info')
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const showNotification = (message, type = 'info') => {
  // 这里可以集成通知系统
  console.log(`[${type.toUpperCase()}] ${message}`)
  
  // 简单的浏览器通知
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('截图验证工具', {
      body: message,
      icon: '📸'
    })
  }
}

// 生命周期
onMounted(() => {
  // 请求通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})
</script>

<style scoped>
.screenshot-validation-tool {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
}

.tool-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 10px 0;
}

.tool-description {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

.tool-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 25px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.control-select {
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-select:focus {
  outline: none;
  border-color: #4c78ff;
  box-shadow: 0 0 0 3px rgba(76, 120, 255, 0.1);
}

.custom-size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-input {
  flex: 1;
  padding: 8px 10px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

.size-separator {
  font-weight: 600;
  color: #6b7280;
}

.color-options {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.color-option:hover {
  transform: scale(1.1);
  border-color: #9ca3af;
}

.color-option.active {
  border-color: #4c78ff;
  box-shadow: 0 0 0 2px rgba(76, 120, 255, 0.3);
}

.color-option.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.color-input {
  width: 50px;
  height: 32px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  background: white;
}

.control-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.capture-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.capture-button.primary {
  background: linear-gradient(135deg, #4c78ff 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 120, 255, 0.3);
}

.capture-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 120, 255, 0.4);
}

.capture-button.secondary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.capture-button.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.capture-button.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.capture-button.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.tool-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.preview-area {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 25px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.preview-controls {
  display: flex;
  gap: 10px;
}

.preview-button {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.preview-container {
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(156, 163, 175, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(156, 163, 175, 0.2) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 5;
}

.preview-node {
  width: 280px;
  min-height: 96px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.preview-node:hover {
  transform: scale(1.02);
}

.preview-node.node-state-hover {
  border: 2px solid #9ca3af;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.preview-node.node-state-selected {
  border: 2px solid #4c78ff;
  box-shadow: 0 4px 12px rgba(76, 120, 255, 0.15);
}

.preview-node.node-state-disabled {
  opacity: 0.5;
  background: #f9fafb;
}

.preview-node.node-state-dragging {
  opacity: 0.8;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.node-header {
  height: 36px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
}

.node-icon {
  width: 28px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.node-title-text {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.node-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
}

.menu-dot {
  width: 3px;
  height: 3px;
  background: #6b7280;
  border-radius: 50%;
}

.node-content {
  padding: 12px;
}

.content-item {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  color: #111827;
}

.content-item:last-child {
  border-bottom: none;
}

.node-ports {
  position: absolute;
  top: 50%;
  left: -4px;
  right: -4px;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;
}

.port {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid #4c78ff;
}

.port.in-port {
  background: white;
}

.port.out-port {
  background: #4c78ff;
}

.preview-info {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 80px;
}

.info-value {
  color: #374151;
  font-weight: 500;
}

.color-sample {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

.screenshots-gallery {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 25px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.gallery-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.gallery-controls {
  display: flex;
  gap: 10px;
}

.gallery-button {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gallery-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.gallery-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  max-height: 600px;
  overflow-y: auto;
}

.screenshot-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.screenshot-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #9ca3af;
}

.screenshot-container {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.screenshot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.screenshot-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.screenshot-item:hover .screenshot-overlay {
  opacity: 1;
}

.screenshot-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
}

.info-label {
  font-weight: 500;
  opacity: 0.8;
}

.info-value {
  font-weight: 600;
}

.screenshot-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-button {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.action-button.danger:hover {
  background: rgba(239, 68, 68, 0.8);
  border-color: rgba(239, 68, 68, 0.5);
}

.empty-gallery {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.1rem;
  margin: 0;
}

.screenshot-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid #f3f4f6;
  background: #f8fafc;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 25px;
  border-top: 2px solid #f3f4f6;
  background: #f8fafc;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.modal-button.primary {
  background: linear-gradient(135deg, #4c78ff 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 120, 255, 0.3);
}

.modal-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 120, 255, 0.4);
}

.modal-button:not(.primary) {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.modal-button:not(.primary):hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .tool-content {
    grid-template-columns: 1fr;
  }
  
  .tool-controls {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .screenshot-validation-tool {
    padding: 20px;
  }
  
  .tool-controls {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .control-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .screenshots-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .modal-content {
    margin: 20px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 40px);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>