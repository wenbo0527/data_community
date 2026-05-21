<template>
  <div class="canvas-manual-controls">
    <div class="controls-header">
      <h4>画布控制</h4>
      <div class="automation-status">
        <span class="status-indicator" :class="{ 'disabled': !automationEnabled }">
          {{ automationEnabled ? '自动化已启用' : '自动化已禁用' }}
        </span>
      </div>
    </div>
    
    <div class="controls-grid">
      <!-- 布局控制 -->
      <div class="control-group">
        <h5>布局控制</h5>
        <button 
          class="control-btn layout-btn"
          @click="triggerManualLayout"
          :disabled="isLayouting"
          title="手动触发结构化布局"
        >
          <span class="btn-icon">🔄</span>
          <span class="btn-text">{{ isLayouting ? '布局中...' : '应用布局' }}</span>
        </button>
        
        <button 
          class="control-btn toggle-btn"
          @click="toggleAutoLayout"
          :class="{ 'active': autoLayoutEnabled }"
          title="切换自动布局开关"
        >
          <span class="btn-icon">{{ autoLayoutEnabled ? '🔴' : '⚪' }}</span>
          <span class="btn-text">自动布局</span>
        </button>
      </div>
      
      <!-- 视图控制 -->
      <div class="control-group">
        <h5>视图控制</h5>
        <button 
          class="control-btn center-btn"
          @click="triggerManualCenter"
          title="手动居中画布内容"
        >
          <span class="btn-icon">📍</span>
          <span class="btn-text">居中内容</span>
        </button>
        
        <button 
          class="control-btn zoom-btn"
          @click="triggerManualZoomFit"
          title="手动缩放适应内容"
        >
          <span class="btn-icon">🔍</span>
          <span class="btn-text">适应缩放</span>
        </button>
        
        <button 
          class="control-btn reset-btn"
          @click="resetView"
          title="重置视图到默认状态"
        >
          <span class="btn-icon">🏠</span>
          <span class="btn-text">重置视图</span>
        </button>
      </div>
      
      <!-- 快捷操作 -->
      <div class="control-group">
        <h5>快捷操作</h5>
        <button 
          class="control-btn combo-btn"
          @click="layoutAndCenter"
          :disabled="isLayouting"
          title="应用布局并居中"
        >
          <span class="btn-icon">⚡</span>
          <span class="btn-text">{{ isLayouting ? '处理中...' : '布局+居中' }}</span>
        </button>
        
        <button 
          class="control-btn combo-btn"
          @click="centerAndZoom"
          title="居中并适应缩放"
        >
          <span class="btn-icon">🎯</span>
          <span class="btn-text">居中+缩放</span>
        </button>
      </div>
    </div>
    
    <!-- 配置面板 -->
    <div class="config-panel" v-if="showAdvanced">
      <h5>高级配置</h5>
      <div class="config-options">
        <label class="config-option">
          <input 
            type="checkbox" 
            v-model="autoCenterAfterLayout"
            @change="updateConfig('AUTO_CENTER', 'CENTER_AFTER_LAYOUT', $event.target.checked)"
          >
          <span>布局后自动居中</span>
        </label>
        
        <label class="config-option">
          <input 
            type="checkbox" 
            v-model="autoZoomAfterLayout"
            @change="updateConfig('AUTO_ZOOM', 'ZOOM_AFTER_LAYOUT', $event.target.checked)"
          >
          <span>布局后自动缩放</span>
        </label>
        
        <label class="config-option">
          <input 
            type="checkbox" 
            v-model="verboseLogging"
            @change="updateConfig('DEBUG', 'VERBOSE_LOGGING', $event.target.checked)"
          >
          <span>详细日志</span>
        </label>
      </div>
    </div>
    
    <div class="controls-footer">
      <button 
        class="toggle-advanced-btn"
        @click="showAdvanced = !showAdvanced"
      >
        {{ showAdvanced ? '隐藏高级选项' : '显示高级选项' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject } from 'vue'
import { getAutomationConfig, setAutomationConfig, logCurrentConfig } from '@/config/canvasAutomationConfig'

export default {
  name: 'CanvasManualControls',
  setup() {
    // 注入画布相关功能
    const graph = inject('graph', null)
    const structuredLayout = inject('structuredLayout', null)
    const panZoomManager = inject('panZoomManager', null)
    
    // 响应式状态
    const isLayouting = ref(false)
    const showAdvanced = ref(false)
    
    // 配置状态
    const autoLayoutEnabled = ref(getAutomationConfig('AUTO_LAYOUT', 'ENABLED'))
    const autoCenterAfterLayout = ref(getAutomationConfig('AUTO_CENTER', 'CENTER_AFTER_LAYOUT'))
    const autoZoomAfterLayout = ref(getAutomationConfig('AUTO_ZOOM', 'ZOOM_AFTER_LAYOUT'))
    const verboseLogging = ref(getAutomationConfig('DEBUG', 'VERBOSE_LOGGING'))
    
    // 计算属性
    const automationEnabled = computed(() => {
      return autoLayoutEnabled.value || autoCenterAfterLayout.value || autoZoomAfterLayout.value
    })
    
    // 手动触发布局
    const triggerManualLayout = async () => {
      if (!structuredLayout || isLayouting.value) return
      
      if (!graph) {

        return
      }
      
      try {
        isLayouting.value = true

        // 统一使用统一结构化布局
        if (typeof structuredLayout.applyUnifiedStructuredLayout === 'function') {
          await structuredLayout.applyUnifiedStructuredLayout(graph)
        } else if (typeof structuredLayout.applyLayout === 'function') {
          await structuredLayout.applyLayout() // 已配置为原生Dagre布局
        } else {

        }

      } catch (error) {

      } finally {
        setTimeout(() => {
          isLayouting.value = false
        }, 500)
      }
    }
    
    // 手动居中
    const triggerManualCenter = () => {
      if (!graph) return
      
      try {

        if (panZoomManager && typeof panZoomManager.centerContent === 'function') {
          panZoomManager.centerContent()
        } else if (typeof graph.centerContent === 'function') {
          graph.centerContent()
        } else {

        }

      } catch (error) {

      }
    }
    
    // 手动缩放适应
    const triggerManualZoomFit = () => {
      if (!graph) return
      
      try {

        if (panZoomManager && typeof panZoomManager.fitToContent === 'function') {
          panZoomManager.fitToContent()
        } else if (typeof graph.zoomToFit === 'function') {
          graph.zoomToFit({ padding: 50 })
        } else {

        }

      } catch (error) {

      }
    }
    
    // 重置视图
    const resetView = () => {
      try {

        if (graph) {
          // 重置缩放
          graph.zoom(1, { absolute: true })
          // 重置位置
          graph.translate(0, 0, { absolute: true })
        }

      } catch (error) {

      }
    }
    
    // 布局并居中
    const layoutAndCenter = async () => {
      await triggerManualLayout()
      setTimeout(() => {
        triggerManualCenter()
      }, 300)
    }
    
    // 居中并缩放
    const centerAndZoom = () => {
      triggerManualCenter()
      setTimeout(() => {
        triggerManualZoomFit()
      }, 200)
    }
    
    // 切换自动布局
    const toggleAutoLayout = () => {
      const newValue = !autoLayoutEnabled.value
      autoLayoutEnabled.value = newValue
      setAutomationConfig('AUTO_LAYOUT', 'ENABLED', newValue)
      
      if (structuredLayout && typeof structuredLayout.setAutoLayoutEnabled === 'function') {
        structuredLayout.setAutoLayoutEnabled(newValue)
      }

      logCurrentConfig()
    }
    
    // 更新配置
    const updateConfig = (category, key, value) => {
      setAutomationConfig(category, key, value)

    }
    
    return {
      // 状态
      isLayouting,
      showAdvanced,
      autoLayoutEnabled,
      autoCenterAfterLayout,
      autoZoomAfterLayout,
      verboseLogging,
      automationEnabled,
      
      // 方法
      triggerManualLayout,
      triggerManualCenter,
      triggerManualZoomFit,
      resetView,
      layoutAndCenter,
      centerAndZoom,
      toggleAutoLayout,
      updateConfig
    }
  }
}
</script>

<style scoped>
.canvas-manual-controls {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 280px;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.controls-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.automation-status {
  font-size: 12px;
}

.status-indicator {
  padding: 2px 8px;
  border-radius: 12px;
  background: #10b981;
  color: white;
  font-weight: 500;
}

.status-indicator.disabled {
  background: #6b7280;
}

.controls-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-group {
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  padding: 12px;
}

.control-group h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 6px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:last-child {
  margin-bottom: 0;
}

.control-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.active {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  flex: 1;
  text-align: left;
}

.layout-btn:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #f59e0b;
}

.center-btn:hover:not(:disabled) {
  background: #dbeafe;
  border-color: #3b82f6;
}

.zoom-btn:hover:not(:disabled) {
  background: #d1fae5;
  border-color: #10b981;
}

.reset-btn:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
}

.combo-btn:hover:not(:disabled) {
  background: #f3e8ff;
  border-color: #8b5cf6;
}

.config-panel {
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.config-panel h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
}

.config-option input[type="checkbox"] {
  margin: 0;
}

.controls-footer {
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.toggle-advanced-btn {
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-advanced-btn:hover {
  background: #e5e7eb;
}
</style>