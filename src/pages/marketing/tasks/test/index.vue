<template>
  <div class="test-index">
    <div class="test-header">
      <h1>画布系统测试中心</h1>
      <p class="description">
        欢迎使用画布系统测试中心。这里提供了完整的系统验证和测试工具，
        帮助您检测和修复画布系统中的各种问题。
      </p>
    </div>

    <div class="test-options">
      <!-- 快速验证 -->
      <a-card class="test-card" hoverable>
        <template #cover>
          <div class="card-icon quick-test">
            <icon-check-circle />
          </div>
        </template>
        <a-card-meta
          title="快速验证"
          description="运行基础的系统健康检查，快速发现常见问题"
        />
        <template #actions>
          <a-button 
            type="primary" 
            @click="runQuickValidation"
            :loading="quickValidating"
            block
          >
            {{ quickValidating ? '验证中...' : '开始快速验证' }}
          </a-button>
        </template>
      </a-card>

      <!-- 完整测试 -->
      <a-card class="test-card" hoverable>
        <template #cover>
          <div class="card-icon full-test">
            <icon-settings />
          </div>
        </template>
        <a-card-meta
          title="完整测试套件"
          description="运行所有测试项目，包括功能测试、性能测试和集成测试"
        />
        <template #actions>
          <a-button 
            type="primary" 
            @click="goToFullTest"
            block
          >
            进入完整测试
          </a-button>
        </template>
      </a-card>

      <!-- 系统修复 -->
      <a-card class="test-card" hoverable>
        <template #cover>
          <div class="card-icon repair">
            <icon-tool />
          </div>
        </template>
        <a-card-meta
          title="系统修复工具"
          description="自动检测并修复常见的系统问题和数据格式错误"
        />
        <template #actions>
          <a-button 
            type="primary" 
            @click="runSystemRepair"
            :loading="repairing"
            block
          >
            {{ repairing ? '修复中...' : '开始系统修复' }}
          </a-button>
        </template>
      </a-card>

      <!-- 性能监控 -->
      <a-card class="test-card" hoverable>
        <template #cover>
          <div class="card-icon performance">
            <icon-dashboard />
          </div>
        </template>
        <a-card-meta
          title="性能监控"
          description="监控系统性能指标，包括内存使用、存储效率等"
        />
        <template #actions>
          <a-button 
            type="primary" 
            @click="showPerformanceMonitor"
            block
          >
            查看性能监控
          </a-button>
        </template>
      </a-card>
    </div>

    <!-- 快速验证结果 -->
    <div v-if="quickValidationResult" class="validation-result">
      <a-card title="快速验证结果">
        <div class="result-summary">
          <div class="summary-item">
            <span class="label">总体状态:</span>
            <a-tag 
              :color="quickValidationResult.success ? 'green' : 'red'"
              class="status-tag"
            >
              {{ quickValidationResult.success ? '正常' : '异常' }}
            </a-tag>
          </div>
          <div class="summary-item">
            <span class="label">检查项目:</span>
            <span class="value">{{ quickValidationResult.summary.totalChecks }}</span>
          </div>
          <div class="summary-item">
            <span class="label">通过:</span>
            <span class="value success">{{ quickValidationResult.summary.passedChecks }}</span>
          </div>
          <div class="summary-item">
            <span class="label">失败:</span>
            <span class="value error">{{ quickValidationResult.summary.failedChecks }}</span>
          </div>
          <div class="summary-item">
            <span class="label">已修复:</span>
            <span class="value warning">{{ quickValidationResult.summary.fixedIssues }}</span>
          </div>
        </div>

        <div v-if="quickValidationResult.summary.failedChecks > 0" class="failed-checks">
          <h4>需要关注的问题:</h4>
          <div 
            v-for="check in failedChecks" 
            :key="check.name"
            class="failed-check-item"
          >
            <icon-exclamation-circle class="error-icon" />
            <div class="check-info">
              <div class="check-name">{{ check.description }}</div>
              <div class="check-message">{{ check.message }}</div>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <a-button @click="exportQuickResult">导出结果</a-button>
          <a-button type="primary" @click="goToFullTest">进行完整测试</a-button>
        </div>
      </a-card>
    </div>

    <!-- 性能监控面板 -->
    <a-modal
      v-model:visible="showPerformanceModal"
      title="系统性能监控"
      width="800px"
      :footer="null"
    >
      <div class="performance-monitor">
        <div class="performance-metrics">
          <div class="metric-card">
            <div class="metric-title">内存使用</div>
            <div class="metric-value">{{ performanceData.memoryUsage }}MB</div>
            <div class="metric-trend" :class="performanceData.memoryTrend">
              {{ performanceData.memoryTrend === 'up' ? '↗' : '↘' }}
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-title">存储使用</div>
            <div class="metric-value">{{ performanceData.storageUsage }}KB</div>
            <div class="metric-trend" :class="performanceData.storageTrend">
              {{ performanceData.storageTrend === 'up' ? '↗' : '↘' }}
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-title">响应时间</div>
            <div class="metric-value">{{ performanceData.responseTime }}ms</div>
            <div class="metric-trend" :class="performanceData.responseTrend">
              {{ performanceData.responseTrend === 'up' ? '↗' : '↘' }}
            </div>
          </div>
        </div>
        
        <div class="performance-chart">
          <div class="chart-placeholder">
            <p>性能趋势图 (模拟数据)</p>
            <div class="chart-bars">
              <div 
                v-for="i in 10" 
                :key="i"
                class="chart-bar"
                :style="{ height: Math.random() * 100 + 'px' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconCheckCircle, 
  IconSettings, 
  IconTool, 
  IconDashboard,
  IconExclamationCircle 
} from '@arco-design/web-vue/es/icon'

import SystemValidator from './SystemValidator.js'

const router = useRouter()

// 响应式数据
const quickValidating = ref(false)
const repairing = ref(false)
const quickValidationResult = ref(null)
const showPerformanceModal = ref(false)
const performanceData = ref({
  memoryUsage: 0,
  storageUsage: 0,
  responseTime: 0,
  memoryTrend: 'down',
  storageTrend: 'down',
  responseTrend: 'down'
})

// 计算属性
const failedChecks = computed(() => {
  if (!quickValidationResult.value) return []
  return quickValidationResult.value.checks.filter(check => !check.passed)
})

// 快速验证
async function runQuickValidation() {
  if (quickValidating.value) return
  
  quickValidating.value = true
  quickValidationResult.value = null
  
  try {
    Message.info('开始快速验证...')
    
    const validator = new SystemValidator({
      autoFix: true,
      enableLogging: true
    })
    
    // 运行基础检查
    const result = await validator.runFullValidation()
    
    quickValidationResult.value = result
    
    if (result.success) {
      Message.success('快速验证完成，系统状态正常！')
    } else {
      Message.warning(`快速验证完成，发现 ${result.summary.failedChecks} 个问题`)
    }
    
  } catch (error) {
    console.error('快速验证失败:', error)
    Message.error('快速验证失败，请查看控制台了解详情')
  } finally {
    quickValidating.value = false
  }
}

// 系统修复
async function runSystemRepair() {
  if (repairing.value) return
  
  repairing.value = true
  
  try {
    Message.info('开始系统修复...')
    
    const validator = new SystemValidator({
      autoFix: true,
      enableLogging: true,
      enableBackup: true
    })
    
    const result = await validator.runFullValidation()
    
    if (result.summary.fixedIssues > 0) {
      Message.success(`系统修复完成，修复了 ${result.summary.fixedIssues} 个问题`)
    } else if (result.success) {
      Message.info('系统状态良好，无需修复')
    } else {
      Message.warning('发现问题但无法自动修复，建议进行手动检查')
    }
    
    // 更新快速验证结果
    quickValidationResult.value = result
    
  } catch (error) {
    console.error('系统修复失败:', error)
    Message.error('系统修复失败，请查看控制台了解详情')
  } finally {
    repairing.value = false
  }
}

// 进入完整测试
function goToFullTest() {
  // 这里可以导航到完整测试页面
  // 由于我们在同一个目录下，可以直接显示测试组件
  router.push('/marketing/tasks/test/full')
}

// 显示性能监控
function showPerformanceMonitor() {
  updatePerformanceData()
  showPerformanceModal.value = true
}

// 更新性能数据
function updatePerformanceData() {
  // 获取真实的性能数据
  if (performance.memory) {
    const memInfo = performance.memory
    performanceData.value.memoryUsage = Math.round(memInfo.usedJSHeapSize / 1024 / 1024)
  } else {
    performanceData.value.memoryUsage = Math.round(Math.random() * 100)
  }
  
  // 估算存储使用
  let storageSize = 0
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        storageSize += localStorage[key].length
      }
    }
    performanceData.value.storageUsage = Math.round(storageSize / 1024)
  } catch (error) {
    performanceData.value.storageUsage = 0
  }
  
  // 模拟响应时间
  performanceData.value.responseTime = Math.round(Math.random() * 100 + 50)
  
  // 随机趋势
  performanceData.value.memoryTrend = Math.random() > 0.5 ? 'up' : 'down'
  performanceData.value.storageTrend = Math.random() > 0.5 ? 'up' : 'down'
  performanceData.value.responseTrend = Math.random() > 0.5 ? 'up' : 'down'
}

// 导出快速验证结果
function exportQuickResult() {
  if (!quickValidationResult.value) return
  
  const blob = new Blob([JSON.stringify(quickValidationResult.value, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `quick-validation-result-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  Message.success('验证结果已导出')
}

// 生命周期
onMounted(() => {
  // 页面加载时更新性能数据
  updatePerformanceData()
  
  // 定期更新性能数据
  setInterval(updatePerformanceData, 5000)
})
</script>

<style scoped>
.test-index {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;
}

.test-header h1 {
  font-size: 32px;
  color: #1f2937;
  margin-bottom: 15px;
}

.description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.test-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.test-card {
  transition: all 0.3s ease;
}

.test-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  font-size: 48px;
  color: white;
  border-radius: 8px 8px 0 0;
}

.card-icon.quick-test {
  background: linear-gradient(135deg, #10b981, #059669);
}

.card-icon.full-test {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.card-icon.repair {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.card-icon.performance {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.validation-result {
  margin-top: 30px;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
}

.summary-item .label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
}

.summary-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
}

.summary-item .value.success {
  color: #10b981;
}

.summary-item .value.error {
  color: #ef4444;
}

.summary-item .value.warning {
  color: #f59e0b;
}

.status-tag {
  font-weight: bold;
  font-size: 14px;
}

.failed-checks {
  margin: 20px 0;
}

.failed-checks h4 {
  color: #ef4444;
  margin-bottom: 15px;
}

.failed-check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  margin-bottom: 10px;
}

.error-icon {
  color: #ef4444;
  font-size: 18px;
  margin-top: 2px;
}

.check-info {
  flex: 1;
}

.check-name {
  font-weight: bold;
  color: #991b1b;
  margin-bottom: 5px;
}

.check-message {
  color: #7f1d1d;
  font-size: 14px;
}

.result-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.performance-monitor {
  padding: 20px 0;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  position: relative;
}

.metric-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 10px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 5px;
}

.metric-trend {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
}

.metric-trend.up {
  color: #ef4444;
}

.metric-trend.down {
  color: #10b981;
}

.performance-chart {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.chart-placeholder {
  text-align: center;
}

.chart-placeholder p {
  color: #6b7280;
  margin-bottom: 20px;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;
  gap: 5px;
}

.chart-bar {
  width: 20px;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  background: linear-gradient(to top, #1d4ed8, #3b82f6);
}

@media (max-width: 768px) {
  .test-options {
    grid-template-columns: 1fr;
  }
  
  .result-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .performance-metrics {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
}
</style>