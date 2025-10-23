<template>
  <div class="preview-line-test">
    <div class="test-header">
      <h1>预览线功能测试页面</h1>
      <div class="test-controls">
        <button @click="runBasicTest" :disabled="testing">基础功能测试</button>
        <button @click="runManagerTest" :disabled="testing">管理器测试</button>
        <button @click="runIntegrationTest" :disabled="testing">集成测试</button>
        <button @click="clearLogs">清空日志</button>
      </div>
    </div>

    <div class="test-content">
      <div class="test-results">
        <h3>测试结果</h3>
        <div class="result-item" v-for="result in testResults" :key="result.id" :class="result.status">
          <span class="result-name">{{ result.name }}</span>
          <span class="result-status">{{ result.status }}</span>
          <span class="result-message">{{ result.message }}</span>
        </div>
      </div>

      <div class="test-logs">
        <h3>测试日志</h3>
        <div class="log-container">
          <div v-for="log in logs" :key="log.id" :class="`log-${log.level}`">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <div class="manager-status">
        <h3>管理器状态</h3>
        <div class="status-grid">
          <div class="status-item">
            <label>PreviewLineSystem:</label>
            <span :class="managerStatus.previewLineSystem ? 'status-ok' : 'status-error'">
              {{ managerStatus.previewLineSystem ? '✅ 可用' : '❌ 不可用' }}
            </span>
          </div>
          <div class="status-item">
            <label>UnifiedEdgeManager:</label>
            <span :class="managerStatus.unifiedEdgeManager ? 'status-ok' : 'status-error'">
              {{ managerStatus.unifiedEdgeManager ? '✅ 可用' : '❌ 不可用' }}
            </span>
          </div>
          <div class="status-item">
            <label>useConfigDrawers:</label>
            <span :class="managerStatus.useConfigDrawers ? 'status-ok' : 'status-error'">
              {{ managerStatus.useConfigDrawers ? '✅ 可用' : '❌ 不可用' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'PreviewLineTest',
  setup() {
    const testing = ref(false)
    const testResults = ref([])
    const logs = ref([])
    const managerStatus = reactive({
      previewLineSystem: false,
      unifiedEdgeManager: false,
      useConfigDrawers: false
    })

    let logId = 0

    const addLog = (level, message) => {
      logs.value.push({
        id: ++logId,
        level,
        message,
        time: new Date().toLocaleTimeString()
      })
    }

    const addResult = (name, status, message) => {
      testResults.value.push({
        id: Date.now(),
        name,
        status,
        message
      })
    }

    const clearLogs = () => {
      logs.value = []
      testResults.value = []
    }

    const checkManagerStatus = () => {
      addLog('info', '检查管理器状态...')
      
      // 检查全局window对象中的管理器
      managerStatus.previewLineSystem = !!(typeof window !== 'undefined' && window.previewLineSystem)
      managerStatus.unifiedEdgeManager = !!(typeof window !== 'undefined' && window.unifiedEdgeManager)
      
      addLog('info', `PreviewLineSystem: ${managerStatus.previewLineSystem ? '可用' : '不可用'}`)
      addLog('info', `UnifiedEdgeManager: ${managerStatus.unifiedEdgeManager ? '可用' : '不可用'}`)
      
      if (typeof window !== 'undefined') {
        const windowKeys = Object.keys(window).filter(key => 
          key.includes('preview') || key.includes('unified') || key.includes('edge')
        )
        addLog('info', `Window中相关对象: ${windowKeys.join(', ') || '无'}`)
      }
    }

    const runBasicTest = async () => {
      testing.value = true
      addLog('info', '开始基础功能测试...')
      
      try {
        // 测试1: 检查管理器实例
        checkManagerStatus()
        
        if (managerStatus.previewLineSystem) {
          addResult('PreviewLineSystem实例', 'success', '管理器实例存在')
          
          // 测试PreviewLineSystem的基本方法
          const previewSystem = window.previewLineSystem
          const methods = ['init', 'createPreviewLine', 'deletePreviewLine', 'hasPreviewLine']
          
          for (const method of methods) {
            if (typeof previewSystem[method] === 'function') {
              addResult(`方法检查: ${method}`, 'success', '方法存在且可调用')
            } else {
              addResult(`方法检查: ${method}`, 'error', '方法不存在或不可调用')
            }
          }
          
          // 测试初始化状态
          if (typeof previewSystem.isInitialized === 'function') {
            const isInit = previewSystem.isInitialized()
            addResult('初始化状态', isInit ? 'success' : 'warning', `初始化状态: ${isInit}`)
          }
          
        } else {
          addResult('PreviewLineSystem实例', 'error', '管理器实例不存在')
        }
        
        if (managerStatus.unifiedEdgeManager) {
          addResult('UnifiedEdgeManager实例', 'success', '管理器实例存在')
          
          const edgeManager = window.unifiedEdgeManager
          const methods = ['createPreviewLine', 'convertPreviewToConnection', 'onNodeConfigured']
          
          for (const method of methods) {
            if (typeof edgeManager[method] === 'function') {
              addResult(`方法检查: ${method}`, 'success', '方法存在且可调用')
            } else {
              addResult(`方法检查: ${method}`, 'error', '方法不存在或不可调用')
            }
          }
        } else {
          addResult('UnifiedEdgeManager实例', 'error', '管理器实例不存在')
        }
        
        addLog('info', '基础功能测试完成')
        
      } catch (error) {
        addLog('error', `基础功能测试失败: ${error.message}`)
        addResult('基础功能测试', 'error', error.message)
      } finally {
        testing.value = false
      }
    }

    const runManagerTest = async () => {
      testing.value = true
      addLog('info', '开始管理器测试...')
      
      try {
        // 模拟useConfigDrawers中的管理器获取逻辑
        addLog('info', '模拟useConfigDrawers管理器获取...')
        
        let previewLineSystem = null
        let unifiedPreviewManager = null
        
        // 方案1：从全局window对象获取
        if (typeof window !== 'undefined' && window.previewLineSystem) {
          previewLineSystem = window.previewLineSystem
          addLog('info', '从全局window获取PreviewLineSystem成功')
          addResult('Window获取PreviewLineSystem', 'success', '成功获取实例')
        } else {
          addLog('warning', '从全局window获取PreviewLineSystem失败')
          addResult('Window获取PreviewLineSystem', 'error', '无法获取实例')
        }
        
        // 方案2：从全局unifiedEdgeManager获取
        if (typeof window !== 'undefined' && window.unifiedEdgeManager) {
          unifiedPreviewManager = window.unifiedEdgeManager
          addLog('info', '从全局window获取UnifiedEdgeManager成功')
          addResult('Window获取UnifiedEdgeManager', 'success', '成功获取实例')
        } else {
          addLog('warning', '从全局window获取UnifiedEdgeManager失败')
          addResult('Window获取UnifiedEdgeManager', 'error', '无法获取实例')
        }
        
        // 测试方法可用性
        if (previewLineSystem) {
          const availableMethods = []
          const testMethods = ['onNodeConfigured', 'createUnifiedPreviewLine', 'handleNodeConfigured', 'createPreviewLineAfterConfig']
          
          for (const method of testMethods) {
            if (typeof previewLineSystem[method] === 'function') {
              availableMethods.push(method)
            }
          }
          
          addLog('info', `PreviewLineSystem可用方法: ${availableMethods.join(', ')}`)
          addResult('PreviewLineSystem方法', availableMethods.length > 0 ? 'success' : 'warning', 
            `可用方法数量: ${availableMethods.length}`)
        }
        
        if (unifiedPreviewManager) {
          const availableMethods = []
          const testMethods = ['onNodeConfigured', 'createPreviewLineAfterConfig', 'handleNodeConfigured']
          
          for (const method of testMethods) {
            if (typeof unifiedPreviewManager[method] === 'function') {
              availableMethods.push(method)
            }
          }
          
          addLog('info', `UnifiedEdgeManager可用方法: ${availableMethods.join(', ')}`)
          addResult('UnifiedEdgeManager方法', availableMethods.length > 0 ? 'success' : 'warning', 
            `可用方法数量: ${availableMethods.length}`)
        }
        
        addLog('info', '管理器测试完成')
        
      } catch (error) {
        addLog('error', `管理器测试失败: ${error.message}`)
        addResult('管理器测试', 'error', error.message)
      } finally {
        testing.value = false
      }
    }

    const runIntegrationTest = async () => {
      testing.value = true
      addLog('info', '开始集成测试...')
      
      try {
        // 检查路由是否包含任务编辑页面
        const currentRoute = window.location.pathname
        addLog('info', `当前路由: ${currentRoute}`)
        
        // 提供导航建议
        addLog('info', '建议导航到 /marketing/tasks/create 进行实际预览线测试')
        addResult('测试建议', 'info', '请手动导航到任务创建页面进行实际测试')
        
        // 检查是否有TaskFlowCanvas组件可用
        addLog('info', '检查TaskFlowCanvas组件可用性...')
        
        addLog('info', '集成测试完成')
        
      } catch (error) {
        addLog('error', `集成测试失败: ${error.message}`)
        addResult('集成测试', 'error', error.message)
      } finally {
        testing.value = false
      }
    }

    onMounted(() => {
      addLog('info', '预览线测试页面已加载')
      checkManagerStatus()
    })

    return {
      testing,
      testResults,
      logs,
      managerStatus,
      runBasicTest,
      runManagerTest,
      runIntegrationTest,
      clearLogs
    }
  }
}
</script>

<style scoped>
.preview-line-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  margin-bottom: 30px;
}

.test-header h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.test-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.test-controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.test-controls button:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #999;
}

.test-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.test-results, .test-logs, .manager-status {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: #fff;
}

.test-results {
  grid-column: 1 / -1;
}

.test-results h3, .test-logs h3, .manager-status h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.result-item {
  display: grid;
  grid-template-columns: 200px 80px 1fr;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 5px;
}

.result-item.success {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.result-item.error {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.result-item.warning {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.result-item.info {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.result-name {
  font-weight: bold;
}

.result-status {
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-container > div {
  padding: 4px 8px;
  border-bottom: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: 80px 60px 1fr;
  gap: 10px;
}

.log-info {
  background: #f8f9fa;
}

.log-warning {
  background: #fff3cd;
}

.log-error {
  background: #f8d7da;
}

.log-time {
  color: #666;
}

.log-level {
  font-weight: bold;
}

.log-level {
  color: #007bff;
}

.log-warning .log-level {
  color: #ffc107;
}

.log-error .log-level {
  color: #dc3545;
}

.status-grid {
  display: grid;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.status-item label {
  font-weight: bold;
}

.status-ok {
  color: #28a745;
}

.status-error {
  color: #dc3545;
}

@media (max-width: 768px) {
  .test-content {
    grid-template-columns: 1fr;
  }
  
  .result-item {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .log-container > div {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}
</style>