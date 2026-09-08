<template>
  <div class="preview-line-style-config">
    <div class="config-header">
      <h3 class="config-title">预览线样式配置</h3>
      <div class="config-actions">
        <button 
          class="btn-reset" 
          @click="resetToDefault"
          title="重置为默认样式"
        >
          重置
        </button>
      </div>
    </div>

    <div class="config-content">
      <!-- 主题选择 -->
      <div class="config-section">
        <label class="section-label">预设主题</label>
        <div class="theme-selector">
          <button 
            v-for="theme in availableThemes" 
            :key="theme.name"
            :class="['theme-btn', { active: currentTheme === theme.name }]"
            @click="selectTheme(theme.name)"
          >
            <div class="theme-preview" :style="getThemePreviewStyle(theme)"></div>
            <span class="theme-name">{{ theme.label }}</span>
          </button>
        </div>
      </div>

      <!-- 自定义样式 -->
      <div class="config-section">
        <label class="section-label">自定义样式</label>
        
        <!-- 颜色配置 -->
        <div class="style-group">
          <label class="style-label">线条颜色</label>
          <div class="color-input-group">
            <input 
              type="color" 
              v-model="customStyle.stroke" 
              @change="updateCustomStyle"
              class="color-picker"
            />
            <input 
              type="text" 
              v-model="customStyle.stroke" 
              @input="updateCustomStyle"
              class="color-text"
              placeholder="#1890ff"
            />
          </div>
        </div>

        <!-- 线条宽度 -->
        <div class="style-group">
          <label class="style-label">线条宽度</label>
          <div class="range-input-group">
            <input 
              type="range" 
              v-model.number="customStyle.strokeWidth" 
              @input="updateCustomStyle"
              min="1" 
              max="10" 
              step="0.5"
              class="range-slider"
            />
            <span class="range-value">{{ customStyle.strokeWidth }}px</span>
          </div>
        </div>

        <!-- 透明度 -->
        <div class="style-group">
          <label class="style-label">透明度</label>
          <div class="range-input-group">
            <input 
              type="range" 
              v-model.number="customStyle.opacity" 
              @input="updateCustomStyle"
              min="0.1" 
              max="1" 
              step="0.1"
              class="range-slider"
            />
            <span class="range-value">{{ Math.round(customStyle.opacity * 100) }}%</span>
          </div>
        </div>

        <!-- 线条样式 -->
        <div class="style-group">
          <label class="style-label">线条样式</label>
          <select 
            v-model="customStyle.strokeDasharray" 
            @change="updateCustomStyle"
            class="style-select"
          >
            <option value="none">实线</option>
            <option value="5 5">短虚线</option>
            <option value="10 5">长虚线</option>
            <option value="15 10 5 10">点划线</option>
          </select>
        </div>

        <!-- 箭头样式 -->
        <div class="style-group">
          <label class="style-label">箭头颜色</label>
          <div class="color-input-group">
            <input 
              type="color" 
              v-model="customStyle.targetMarker.fill" 
              @change="updateCustomStyle"
              class="color-picker"
            />
            <input 
              type="text" 
              v-model="customStyle.targetMarker.fill" 
              @input="updateCustomStyle"
              class="color-text"
              placeholder="#1890ff"
            />
          </div>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="config-section">
        <label class="section-label">样式预览</label>
        <div class="preview-area">
          <svg width="200" height="60" class="preview-svg">
            <defs>
              <marker 
                id="preview-arrow" 
                viewBox="0 0 10 10" 
                refX="8" 
                refY="3" 
                markerWidth="6" 
                markerHeight="6" 
                orient="auto"
              >
                <path 
                  d="M0,0 L0,6 L9,3 z" 
                  :fill="currentStyleConfig.targetMarker.fill"
                  :stroke="currentStyleConfig.targetMarker.stroke"
                />
              </marker>
            </defs>
            <line 
              x1="20" 
              y1="30" 
              x2="180" 
              y2="30" 
              :stroke="currentStyleConfig.stroke"
              :stroke-width="currentStyleConfig.strokeWidth"
              :stroke-dasharray="currentStyleConfig.strokeDasharray === 'none' ? '' : currentStyleConfig.strokeDasharray"
              :opacity="currentStyleConfig.opacity"
              marker-end="url(#preview-arrow)"
            />
            <circle cx="20" cy="30" r="3" fill="#52c41a" />
            <text x="25" y="20" font-size="12" fill="#666">源节点</text>
            <text x="150" y="20" font-size="12" fill="#666">预览线</text>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { previewLineStyleManager } from '@/pages/marketing/tasks/utils/canvas/PreviewLineStyleManager.js'

// 响应式数据
const currentTheme = ref('default')
const customStyle = ref({
  stroke: '#1890ff',
  strokeWidth: 2,
  opacity: 0.8,
  strokeDasharray: '5 5',
  targetMarker: {
    fill: '#1890ff',
    stroke: '#1890ff'
  }
})

// 可用主题
const availableThemes = ref([
  { name: 'default', label: '默认', color: '#1890ff' },
  { name: 'dark', label: '深色', color: '#434343' },
  { name: 'colorful', label: '彩色', color: '#ff4d4f' },
  { name: 'minimal', label: '简约', color: '#d9d9d9' }
])

// 计算当前样式配置
const currentStyleConfig = computed(() => {
  if (currentTheme.value === 'custom') {
    return {
      ...customStyle.value,
      strokeDasharray: customStyle.value.strokeDasharray === 'none' ? '' : customStyle.value.strokeDasharray
    }
  }
  const themeConfig = previewLineStyleManager.getStyleConfig(currentTheme.value)
  // 返回preview样式配置
  return {
    stroke: themeConfig.preview.stroke,
    strokeWidth: themeConfig.preview.strokeWidth,
    opacity: themeConfig.preview.strokeOpacity,
    strokeDasharray: themeConfig.preview.strokeDasharray,
    targetMarker: themeConfig.preview.targetMarker
  }
})

// 方法
const selectTheme = (themeName) => {
  currentTheme.value = themeName
  if (themeName !== 'custom') {
    previewLineStyleManager.setTheme(themeName)
    // 更新自定义样式为当前主题样式
    const themeConfig = previewLineStyleManager.getStyleConfig(themeName)
    const previewStyle = themeConfig.preview
    customStyle.value = {
      stroke: previewStyle.stroke,
      strokeWidth: previewStyle.strokeWidth,
      opacity: previewStyle.strokeOpacity,
      strokeDasharray: previewStyle.strokeDasharray || 'none',
      targetMarker: {
        fill: previewStyle.targetMarker.fill,
        stroke: previewStyle.targetMarker.stroke
      }
    }
  }
}

const updateCustomStyle = () => {
  currentTheme.value = 'custom'
  const styleConfig = {
    ...customStyle.value,
    strokeDasharray: customStyle.value.strokeDasharray === 'none' ? '' : customStyle.value.strokeDasharray
  }
  previewLineStyleManager.updateCustomStyle(styleConfig)
}

const resetToDefault = () => {
  previewLineStyleManager.resetToDefault()
  selectTheme('default')
}

const getThemePreviewStyle = (theme) => {
  return {
    backgroundColor: theme.color,
    width: '20px',
    height: '3px',
    borderRadius: '1px'
  }
}

// 监听主题变化
watch(currentTheme, (newTheme) => {
  if (newTheme !== 'custom') {
    previewLineStyleManager.setTheme(newTheme)
  }
})

// 组件挂载时初始化
onMounted(() => {
  const currentConfig = previewLineStyleManager.getStyleConfig('default')
  const previewStyle = currentConfig.preview
  customStyle.value = {
    stroke: previewStyle.stroke,
    strokeWidth: previewStyle.strokeWidth,
    opacity: previewStyle.strokeOpacity,
    strokeDasharray: previewStyle.strokeDasharray || 'none',
    targetMarker: {
      fill: previewStyle.targetMarker.fill,
      stroke: previewStyle.targetMarker.stroke
    }
  }
})
</script>

<style scoped>
.preview-line-style-config {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.config-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.btn-reset {
  padding: 4px 12px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.config-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.theme-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.theme-btn:hover {
  background: #f0f0f0;
  border-color: #1890ff;
}

.theme-btn.active {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.theme-preview {
  border-radius: 1px;
}

.theme-name {
  font-size: 12px;
  color: inherit;
}

.style-group {
  margin-bottom: 16px;
}

.style-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #595959;
}

.color-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-picker {
  width: 40px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
}

.range-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.range-slider {
  flex: 1;
  height: 4px;
  background: #f5f5f5;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #1890ff;
  border-radius: 50%;
  cursor: pointer;
}

.range-value {
  min-width: 40px;
  font-size: 13px;
  color: #595959;
  text-align: right;
}

.style-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.preview-area {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.preview-svg {
  width: 100%;
  height: 60px;
}
</style>