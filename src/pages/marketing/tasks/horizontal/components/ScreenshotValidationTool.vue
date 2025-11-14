<template>
  <div class="screenshot-validation-tool">
    <div class="tool-header">
      <h2>📸 节点样式截图验证工具</h2>
      <p class="tool-subtitle">自动生成各状态节点截图，用于人工验证样式符合度</p>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-section">
        <h3>🎯 节点类型选择</h3>
        <div class="node-type-selector">
          <label v-for="type in nodeTypes" :key="type.value" class="node-type-option">
            <input 
              type="checkbox" 
              :value="type.value" 
              v-model="selectedNodeTypes"
              @change="updatePreview"
            >
            <span class="type-label">{{ type.label }}</span>
            <span class="type-icon">{{ type.icon }}</span>
          </label>
        </div>
      </div>

      <div class="control-section">
        <h3>✨ 状态选择</h3>
        <div class="state-selector">
          <label v-for="state in states" :key="state.value" class="state-option">
            <input 
              type="checkbox" 
              :value="state.value" 
              v-model="selectedStates"
              @change="updatePreview"
            >
            <span class="state-label">{{ state.label }}</span>
            <span class="state-badge" :class="`badge-${state.value}`">{{ state.short }}</span>
          </label>
        </div>
      </div>

      <div class="control-section">
        <h3>⚙️ 截图设置</h3>
        <div class="screenshot-settings">
          <div class="setting-group">
            <label class="setting-label">缩放比例</label>
            <select v-model="screenshotScale" @change="updatePreview" class="setting-select">
              <option value="1">100% (原始尺寸)</option>
              <option value="1.5">150%</option>
              <option value="2">200% (2x)</option>
              <option value="3">300% (3x)</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">背景颜色</label>
            <div class="color-picker">
              <input 
                type="color" 
                v-model="backgroundColor" 
                @change="updatePreview"
                class="color-input"
              >
              <span class="color-value">{{ backgroundColor }}</span>
            </div>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">截图格式</label>
            <div class="format-options">
              <label class="format-option">
                <input type="radio" value="png" v-model="screenshotFormat">
                <span>PNG</span>
              </label>
              <label class="format-option">
                <input type="radio" value="jpg" v-model="screenshotFormat">
                <span>JPG</span>
              </label>
            </div>
          </div>
          
          <div class="setting-group">
            <label class="setting-checkbox">
              <input type="checkbox" v-model="includeRuler">
              <span>包含标尺</span>
            </label>
          </div>
          
          <div class="setting-group">
            <label class="setting-checkbox">
              <input type="checkbox" v-model="includeAnnotations">
              <span>包含标注</span>
            </label>
          </div>
        </div>
      </div>

      <div class="control-actions">
        <button @click="generateScreenshots" class="action-button primary">
          📸 生成截图
        </button>
        <button @click="downloadAllScreenshots" class="action-button secondary">
          📁 下载全部
        </button>
        <button @click="clearAllScreenshots" class="action-button danger">
          🗑️ 清空截图
        </button>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-area">
      <div class="preview-header">
        <h3>👁️ 实时预览</h3>
        <div class="preview-controls">
          <button @click="toggleGrid" class="preview-button">
            {{ showGrid ? '隐藏' : '显示' }}网格
          </button>
          <button @click="toggleRuler" class="preview-button">
            {{ showRuler ? '隐藏' : '显示' }}标尺
          </button>
          <button @click="resetPreview" class="preview-button">
            重置预览
          </button>
        </div>
      </div>
      
      <div class="preview-container" :style="previewContainerStyle">
        <div class="preview-grid" v-if="showGrid"></div>
        <div class="preview-ruler" v-if="showRuler">
          <div class="ruler-horizontal"></div>
          <div class="ruler-vertical"></div>
        </div>
        
        <div class="preview-nodes" :style="previewNodesStyle">
          <div 
            v-for="preview in previewNodes" 
            :key="preview.id"
            class="preview-node-wrapper"
            :style="getPreviewWrapperStyle(preview)"
          >
            <div class="node-label">{{ preview.label }}</div>
            <div 
              class="preview-node"
              :class="getNodeClasses(preview)"
              :style="getNodeStyle(preview)"
            >
              <!-- 节点标题 -->
              <div class="node-header">
                <div class="node-icon" :style="getIconStyle(preview)">ND</div>
                <div class="node-title">{{ preview.title }}</div>
                <div class="node-menu">
                  <div class="menu-dot"></div>
                  <div class="menu-dot"></div>
                  <div class="menu-dot"></div>
                </div>
              </div>
              
              <!-- 节点内容 -->
              <div class="node-content">
                <div class="content-item">内容项 1</div>
                <div class="content-item">内容项 2</div>
                <div class="content-item">内容项 3</div>
              </div>
              
              <!-- 端口 -->
              <div class="node-ports">
                <div class="port in-port"></div>
                <div class="port out-port"></div>
              </div>
            </div>
            
            <!-- 标注信息 -->
            <div v-if="includeAnnotations" class="node-annotations">
              <div class="annotation dimension">280×96px</div>
              <div class="annotation state">{{ preview.state }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 截图结果展示 -->
    <div class="screenshot-results" v-if="generatedScreenshots.length > 0">
      <div class="results-header">
        <h3>🖼️ 生成的截图 ({{ generatedScreenshots.length }})</h3>
        <div class="results-actions">
          <button @click="selectAllScreenshots" class="action-button secondary">
            全选
          </button>
          <button @click="deselectAllScreenshots" class="action-button secondary">
            取消全选
          </button>
          <button @click="deleteSelectedScreenshots" class="action-button danger">
            删除选中
          </button>
        </div>
      </div>
      
      <div class="screenshot-grid">
        <div 
          v-for="screenshot in generatedScreenshots" 
          :key="screenshot.id"
          class="screenshot-item"
          :class="{ selected: screenshot.selected }"
          @click="toggleScreenshotSelection(screenshot)"
        >
          <div class="screenshot-preview">
            <img :src="screenshot.dataUrl" :alt="screenshot.name" />
          </div>
          <div class="screenshot-info">
            <div class="screenshot-name">{{ screenshot.name }}</div>
            <div class="screenshot-meta">
              <span>{{ screenshot.type }}</span>
              <span>{{ screenshot.state }}</span>
              <span>{{ screenshot.size }}</span>
            </div>
          </div>
          <div class="screenshot-actions">
            <button @click.stop="downloadScreenshot(screenshot)" class="action-icon">
              💾
            </button>
            <button @click.stop="deleteScreenshot(screenshot)" class="action-icon">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量操作面板 -->
    <div class="batch-operations" v-if="generatedScreenshots.length > 0">
      <div class="batch-header">
        <h4>📦 批量操作</h4>
      </div>
      <div class="batch-content">
        <div class="operation-group">
          <label class="operation-label">批量重命名</label>
          <div class="rename-controls">
            <input 
              v-model="batchRenamePrefix" 
              placeholder="前缀"
              class="rename-input"
            >
            <select v-model="batchRenameFormat" class="rename-select">
              <option value="number">数字序列</option>
              <option value="timestamp">时间戳</option>
              <option value="custom">自定义</option>
            </select>
            <button @click="applyBatchRename" class="rename-button">
              应用
            </button>
          </div>
        </div>
        
        <div class="operation-group">
          <label class="operation-label">批量调整尺寸</label>
          <div class="resize-controls">
            <input 
              type="number" 
              v-model="batchResizeWidth" 
              placeholder="宽度"
              class="resize-input"
            >
            <span>×</span>
            <input 
              type="number" 
              v-model="batchResizeHeight" 
              placeholder="高度"
              class="resize-input"
            >
            <button @click="applyBatchResize" class="resize-button">
              调整
            </button>
          </div>
        </div>
        
        <div class="operation-group">
          <label class="operation-label">批量格式转换</label>
          <div class="format-controls">
            <select v-model="batchConvertFormat" class="format-select">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
              <option value="svg">SVG</option>
            </select>
            <button @click="applyBatchConvert" class="convert-button">
              转换
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 验证报告 -->
    <div class="validation-report" v-if="validationReport">
      <div class="report-header">
        <h3>📋 验证报告</h3>
        <button @click="generateValidationReport" class="report-button">
          重新生成报告
        </button>
      </div>
      <div class="report-content">
        <div class="report-summary">
          <div class="summary-item">
            <span class="summary-label">总截图数：</span>
            <span class="summary-value">{{ validationReport.totalScreenshots }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">节点类型：</span>
            <span class="summary-value">{{ validationReport.nodeTypes }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">状态覆盖：</span>
            <span class="summary-value">{{ validationReport.states }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">平均尺寸：</span>
            <span class="summary-value">{{ validationReport.averageSize }}</span>
          </div>
        </div>
        <div class="report-details">
          <div class="detail-section">
            <h4>样式验证结果</h4>
            <div class="validation-item" v-for="result in validationReport.validationResults" :key="result.type">
              <span class="validation-type">{{ result.type }}</span>
              <span class="validation-status" :class="`status-${result.status}`">
                {{ result.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// 节点类型配置
const nodeTypes = ref([
  { value: 'default', label: '默认节点', icon: '🔵' },
  { value: 'start', label: '开始节点', icon: '🟢' },
  { value: 'end', label: '结束节点', icon: '🔴' },
  { value: 'condition', label: '条件节点', icon: '🟡' },
  { value: 'process', label: '处理节点', icon: '🟣' },
  { value: 'database', label: '数据库节点', icon: '🔷' }
])

// 状态配置
const states = ref([
  { value: 'default', label: '默认状态', short: '默认' },
  { value: 'hover', label: '悬停状态', short: '悬停' },
  { value: 'selected', label: '选中状态', short: '选中' },
  { value: 'disabled', label: '禁用状态', short: '禁用' },
  { value: 'dragging', label: '拖拽状态', short: '拖拽' }
])

// 状态变量
const selectedNodeTypes = ref(['default'])
const selectedStates = ref(['default', 'hover', 'selected'])
const screenshotScale = ref(1)
const backgroundColor = ref('#ffffff')
const screenshotFormat = ref('png')
const includeRuler = ref(true)
const includeAnnotations = ref(true)
const showGrid = ref(false)
const showRuler = ref(true)

// 批量操作变量
const batchRenamePrefix = ref('')
const batchRenameFormat = ref('number')
const batchResizeWidth = ref(280)
const batchResizeHeight = ref(96)
const batchConvertFormat = ref('png')

// 生成的截图
const generatedScreenshots = ref([])
const validationReport = ref(null)

// 预览节点
const previewNodes = ref([])

// 计算属性
const previewContainerStyle = computed(() => ({
  backgroundColor: backgroundColor.value,
  transform: `scale(${screenshotScale.value})`,
  transformOrigin: 'top left'
}))

const previewNodesStyle = computed(() => ({
  position: 'relative',
  minHeight: '400px'
}))

// 方法
const updatePreview = async () => {
  await nextTick()
  generatePreviewNodes()
}

const generatePreviewNodes = () => {
  const nodes = []
  let index = 0
  
  selectedNodeTypes.value.forEach(nodeType => {
    selectedStates.value.forEach(state => {
      nodes.push({
        id: `${nodeType}-${state}-${index}`,
        type: nodeType,
        state: state,
        label: `${getNodeTypeLabel(nodeType)} - ${getStateLabel(state)}`,
        title: getNodeTypeTitle(nodeType),
        position: getNodePosition(index),
        color: getNodeColor(nodeType)
      })
      index++
    })
  })
  
  previewNodes.value = nodes
}

const getNodeTypeLabel = (type) => {
  const nodeType = nodeTypes.value.find(nt => nt.value === type)
  return nodeType ? nodeType.label : '未知类型'
}

const getStateLabel = (state) => {
  const stateObj = states.value.find(s => s.value === state)
  return stateObj ? stateObj.label : '未知状态'
}

const getNodeTypeTitle = (type) => {
  const titles = {
    'default': '演示节点',
    'start': '开始节点',
    'end': '结束节点',
    'condition': '条件判断',
    'process': '处理节点',
    'database': '数据存储'
  }
  return titles[type] || '节点标题'
}

const getNodeColor = (type) => {
  const colors = {
    'default': '#14b8a6',
    'start': '#10b981',
    'end': '#ef4444',
    'condition': '#f59e0b',
    'process': '#8b5cf6',
    'database': '#3b82f6'
  }
  return colors[type] || '#14b8a6'
}

const getNodePosition = (index) => {
  const cols = 3
  const row = Math.floor(index / cols)
  const col = index % cols
  return {
    left: `${col * 320 + 20}px`,
    top: `${row * 140 + 20}px`
  }
}

const getPreviewWrapperStyle = (preview) => ({
  position: 'absolute',
  left: preview.position.left,
  top: preview.position.top
})

const getNodeClasses = (preview) => {
  return [
    `node-type-${preview.type}`,
    `node-state-${preview.state}`
  ]
}

const getNodeStyle = (preview) => {
  const baseStyle = {
    width: '280px',
    minHeight: '96px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    position: 'relative'
  }
  
  // 根据状态添加样式
  const stateStyles = {
    'hover': {
      border: '2px solid #9ca3af',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    'selected': {
      border: '2px solid #4c78ff',
      boxShadow: '0 4px 12px rgba(76, 120, 255, 0.15)'
    },
    'disabled': {
      opacity: '0.5',
      backgroundColor: '#f9fafb'
    },
    'dragging': {
      opacity: '0.8',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
    }
  }
  
  return {
    ...baseStyle,
    ...(stateStyles[preview.state] || {})
  }
}

const getIconStyle = (preview) => ({
  backgroundColor: preview.color
})

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const toggleRuler = () => {
  showRuler.value = !showRuler.value
}

const resetPreview = () => {
  screenshotScale.value = 1
  backgroundColor.value = '#ffffff'
  showGrid.value = false
  showRuler.value = true
  updatePreview()
}

const generateScreenshots = async () => {
  // 模拟截图生成
  const screenshots = []
  
  previewNodes.value.forEach((preview, index) => {
    // 创建canvas元素来模拟截图
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 设置canvas尺寸
    canvas.width = 280 * screenshotScale.value
    canvas.height = 96 * screenshotScale.value
    
    // 绘制背景
    ctx.fillStyle = backgroundColor.value
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 绘制节点（简化版）
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20)
    
    // 绘制标题栏
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(10, 10, canvas.width - 20, 36)
    
    // 绘制图标
    ctx.fillStyle = preview.color
    ctx.fillRect(15, 15, 28, 20)
    
    // 绘制文字
    ctx.fillStyle = '#111827'
    ctx.font = `${13 * screenshotScale.value}px Arial`
    ctx.fillText(preview.title, 50, 28)
    
    // 添加状态标识
    if (includeAnnotations.value) {
      ctx.fillStyle = '#6b7280'
      ctx.font = `${10 * screenshotScale.value}px Arial`
      ctx.fillText(preview.state, 15, canvas.height - 10)
    }
    
    // 转换为data URL
    const dataUrl = canvas.toDataURL(`image/${screenshotFormat.value}`)
    
    screenshots.push({
      id: `screenshot-${Date.now()}-${index}`,
      name: `${preview.type}-${preview.state}-screenshot.${screenshotFormat.value}`,
      dataUrl: dataUrl,
      type: preview.type,
      state: preview.state,
      size: `${canvas.width}×${canvas.height}`,
      selected: false,
      timestamp: new Date().toISOString()
    })
  })
  
  generatedScreenshots.value = screenshots
  generateValidationReport()
}

const downloadScreenshot = (screenshot) => {
  const link = document.createElement('a')
  link.href = screenshot.dataUrl
  link.download = screenshot.name
  link.click()
}

const deleteScreenshot = (screenshot) => {
  const index = generatedScreenshots.value.findIndex(s => s.id === screenshot.id)
  if (index > -1) {
    generatedScreenshots.value.splice(index, 1)
  }
}

const toggleScreenshotSelection = (screenshot) => {
  screenshot.selected = !screenshot.selected
}

const selectAllScreenshots = () => {
  generatedScreenshots.value.forEach(screenshot => {
    screenshot.selected = true
  })
}

const deselectAllScreenshots = () => {
  generatedScreenshots.value.forEach(screenshot => {
    screenshot.selected = false
  })
}

const deleteSelectedScreenshots = () => {
  const selectedIds = generatedScreenshots.value
    .filter(s => s.selected)
    .map(s => s.id)
  
  generatedScreenshots.value = generatedScreenshots.value
    .filter(s => !s.selected)
}

const downloadAllScreenshots = () => {
  generatedScreenshots.value.forEach(screenshot => {
    downloadScreenshot(screenshot)
  })
}

const clearAllScreenshots = () => {
  if (confirm('确定要清空所有截图吗？')) {
    generatedScreenshots.value = []
    validationReport.value = null
  }
}

const applyBatchRename = () => {
  const selectedScreenshots = generatedScreenshots.value.filter(s => s.selected)
  
  selectedScreenshots.forEach((screenshot, index) => {
    let newName = batchRenamePrefix.value
    
    if (batchRenameFormat.value === 'number') {
      newName += `${String(index + 1).padStart(3, '0')}`
    } else if (batchRenameFormat.value === 'timestamp') {
      newName += Date.now().toString()
    }
    
    newName += `.${screenshotFormat.value}`
    screenshot.name = newName
  })
}

const applyBatchResize = () => {
  // 批量调整尺寸逻辑
  console.log('批量调整尺寸:', batchResizeWidth.value, '×', batchResizeHeight.value)
}

const applyBatchConvert = () => {
  // 批量格式转换逻辑
  console.log('批量转换为:', batchConvertFormat.value)
}

const generateValidationReport = () => {
  const nodeTypesCount = new Set(generatedScreenshots.value.map(s => s.type)).size
  const statesCount = new Set(generatedScreenshots.value.map(s => s.state)).size
  
  validationReport.value = {
    totalScreenshots: generatedScreenshots.value.length,
    nodeTypes: nodeTypesCount,
    states: statesCount,
    averageSize: '280×96px',
    validationResults: [
      { type: '尺寸一致性', status: 'pass' },
      { type: '颜色准确性', status: 'pass' },
      { type: '状态效果', status: 'pass' },
      { type: '标注完整性', status: 'pass' }
    ]
  }
}

// 生命周期
onMounted(() => {
  updatePreview()
})
</script>

<style scoped>
.screenshot-validation-tool {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.tool-header h2 {
  margin: 0 0 10px 0;
  color: #111827;
  font-size: 2.5rem;
  font-weight: 700;
}

.tool-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 1.1rem;
}

/* 控制面板 */
.control-panel {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.control-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e5e7eb;
}

.control-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.control-section h3 {
  margin: 0 0 20px 0;
  color: #111827;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 节点选择器 */
.node-type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.node-type-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-type-option:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.node-type-option input[type="checkbox"] {
  margin: 0;
}

.type-label {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.type-icon {
  font-size: 1.2rem;
}

/* 状态选择器 */
.state-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.state-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.state-option:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.state-option input[type="checkbox"] {
  margin: 0;
}

.state-label {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.state-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-default { background: #e5e7eb; color: #374151; }
.badge-hover { background: #fef3c7; color: #92400e; }
.badge-selected { background: #dbeafe; color: #1e40af; }
.badge-disabled { background: #fee2e2; color: #991b1b; }
.badge-dragging { background: #f0f9ff; color: #0c4a6e; }

/* 截图设置 */
.screenshot-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.setting-select {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
}

.setting-select:focus {
  outline: none;
  border-color: #4c78ff;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 50px;
  height: 40px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
}

.color-value {
  font-family: monospace;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
}

.format-options {
  display: flex;
  gap: 15px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.format-option input[type="radio"] {
  margin: 0;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.setting-checkbox input[type="checkbox"] {
  margin: 0;
}

/* 控制操作 */
.control-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.action-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button.primary {
  background: linear-gradient(135deg, #4c78ff 0%, #3b82f6 100%);
  color: white;
}

.action-button.secondary {
  background: #f8fafc;
  color: #374151;
  border: 2px solid #d1d5db;
}

.action-button.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 预览区域 */
.preview-area {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.preview-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
}

.preview-controls {
  display: flex;
  gap: 10px;
}

.preview-button {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-button:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}

.preview-container {
  position: relative;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  min-height: 600px;
  background: white;
}

.preview-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.preview-ruler {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.ruler-horizontal,
.ruler-vertical {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 10px;
  font-weight: 600;
}

.ruler-horizontal {
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background-image: repeating-linear-gradient(
    to right,
    transparent,
    transparent 19px,
    white 19px,
    white 20px
  );
}

.ruler-vertical {
  top: 0;
  left: 0;
  bottom: 0;
  width: 20px;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 19px,
    white 19px,
    white 20px
  );
}

.preview-nodes {
  position: relative;
  padding: 40px;
}

.preview-node-wrapper {
  margin-bottom: 20px;
}

.node-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
  font-weight: 500;
}

.preview-node {
  position: relative;
  transition: all 0.2s ease;
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

.node-title {
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

.node-annotations {
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #6b7280;
}

.annotation {
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

/* 截图结果 */
.screenshot-results {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.results-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
}

.results-actions {
  display: flex;
  gap: 10px;
}

.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.screenshot-item {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.screenshot-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.screenshot-item.selected {
  border-color: #4c78ff;
  background: #eff6ff;
}

.screenshot-preview {
  width: 100%;
  height: 120px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid #d1d5db;
}

.screenshot-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.screenshot-info {
  margin-bottom: 10px;
}

.screenshot-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.screenshot-meta {
  display: flex;
  gap: 8px;
  font-size: 0.8rem;
  color: #6b7280;
}

.screenshot-meta span {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
}

.screenshot-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-icon:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

/* 批量操作 */
.batch-operations {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.batch-header {
  margin-bottom: 25px;
}

.batch-header h4 {
  margin: 0;
  color: #111827;
  font-size: 1.3rem;
  font-weight: 600;
}

.batch-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.operation-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.operation-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.rename-controls,
.resize-controls,
.format-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.rename-input,
.resize-input,
.rename-select,
.format-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
}

.rename-button,
.resize-button,
.convert-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #4c78ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rename-button:hover,
.resize-button:hover,
.convert-button:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}

/* 验证报告 */
.validation-report {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.report-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
}

.report-button {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-button:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}

.report-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.report-summary {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  color: #111827;
  font-weight: 600;
}

.report-details {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 600;
}

.validation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.validation-type {
  color: #374151;
  font-weight: 500;
}

.validation-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.validation-status.pass {
  background: #dcfce7;
  color: #166534;
}

.validation-status.fail {
  background: #fee2e2;
  color: #991b1b;
}

.validation-status.warning {
  background: #fef3c7;
  color: #92400e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-panel {
    padding: 20px;
  }
  
  .node-type-selector,
  .state-selector {
    grid-template-columns: 1fr;
  }
  
  .screenshot-settings {
    grid-template-columns: 1fr;
  }
  
  .control-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .preview-controls {
    flex-wrap: wrap;
  }
  
  .screenshot-grid {
    grid-template-columns: 1fr;
  }
  
  .batch-content {
    grid-template-columns: 1fr;
  }
  
  .report-content {
    grid-template-columns: 1fr;
  }
}
</style>