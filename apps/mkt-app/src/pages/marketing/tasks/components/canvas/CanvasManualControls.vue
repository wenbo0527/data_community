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
import { getAutomationConfig, setAutomationConfig, logCurrentConfig } from '@/pages/marketing/tasks/config/canvasAutomationConfig'

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
        console.error('[CanvasManualControls] 图实例不存在，无法应用布局')
        return
      }
      
      try {
        isLayouting.value = true
        console.log('[CanvasManualControls] 🚀 手动触发布局（统一使用原生Dagre）')
        
        // 统一使用统一结构化布局
        if (typeof structuredLayout.applyUnifiedStructuredLayout === 'function') {
          await structuredLayout.applyUnifiedStructuredLayout(graph)
        } else if (typeof structuredLayout.applyLayout === 'function') {
          await structuredLayout.applyLayout() // 已配置为原生Dagre布局
        } else {
          console.error('[CanvasManualControls] 布局方法不可用')
        }
        
        console.log('[CanvasManualControls] ✅ 手动布局完成')
      } catch (error) {
        console.error('[CanvasManualControls] 手动布局失败:', error)
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
        console.log('[CanvasManualControls] 📍 手动居中画布内容')
        
        if (panZoomManager && typeof panZoomManager.centerCanvas === 'function') {
          panZoomManager.centerCanvas()
        } else if (graph && typeof graph.centerContent === 'function') {
          graph.centerContent()
        } else {
          console.warn('[CanvasManualControls] 居中方法不可用')
        }
        
        console.log('[CanvasManualControls] ✅ 手动居中完成')
      } catch (error) {
        console.error('[CanvasManualControls] 手动居中失败:', error)
      }
    }
    
    // 手动缩放适应
    const triggerManualZoomFit = () => {
      if (!graph) return
      
      try {
        console.log('[CanvasManualControls] 🔍 手动缩放适应内容')
        
        if (panZoomManager && typeof panZoomManager.zoomToFit === 'function') {
          panZoomManager.zoomToFit()
        } else if (graph && typeof graph.zoomToFit === 'function') {
          graph.zoomToFit({ padding: 20 })
        } else {
          console.warn('[CanvasManualControls] 缩放适应方法不可用')
        }
        
        console.log('[CanvasManualControls] ✅ 手动缩放适应完成')
      } catch (error) {
        console.error('[CanvasManualControls] 手动缩放适应失败:', error)
      }
    }
    
    // 重置视图
    const resetView = () => {
      if (!graph) return
      
      try {
        console.log('[CanvasManualControls] 🏠 重置视图')
        
        // 重置缩放
        if (graph.zoom) {
          graph.zoom(1)
        }
        
        // 重置位置
        if (graph.centerContent) {
          graph.centerContent()
        }
        
        console.log('[CanvasManualControls] ✅ 视图重置完成')
      } catch (error) {
        console.error('[CanvasManualControls] 视图重置失败:', error)
      }
    }
    
    // 切换自动布局
    const toggleAutoLayout = () => {
      autoLayoutEnabled.value = !autoLayoutEnabled.value
      updateConfig('AUTO_LAYOUT', 'ENABLED', autoLayoutEnabled.value)
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
      }, 100)
    }
    
    // 更新配置
    const updateConfig = (category, key, value) => {
      setAutomationConfig(category, key, value)
      if (verboseLogging.value) {
        logCurrentConfig()
      }
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
      toggleAutoLayout,
      layoutAndCenter,
      centerAndZoom,
      updateConfig
    }
  }
}
</script>

<style scoped>
.canvas-manual-controls {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.controls-header h4 {
  margin: 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.automation-status {
  font-size: 12px;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--subapp-success);
  color: white;
  font-weight: 500;
}

.status-indicator.disabled {
  background: #6b7280;
}

.controls-grid {
  display: grid;
  gap: 16px;
}

.control-group {
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  padding: 12px;
}

.control-group h5 {
  margin: 0 0 12px 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:last-child {
  margin-bottom: 0;
}

.control-btn:hover {
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

.config-panel {
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.config-panel h5 {
  margin: 0 0 12px 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
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
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.config-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.controls-footer {
  margin-top: 16px;
  text-align: center;
}

.toggle-advanced-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #ffffff;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-advanced-btn:hover {
  background: #f3f4f6;
  color: #374151;
}
</style>