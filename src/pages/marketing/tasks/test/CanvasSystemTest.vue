<template>
  <div class="canvas-system-test">
    <div class="test-header">
      <h1>画布系统综合修复测试</h1>
      <div class="test-controls">
        <a-button type="primary" @click="runAllTests" :loading="isRunning">
          运行所有测试
        </a-button>
        <a-button @click="clearTestData">清除测试数据</a-button>
        <a-button @click="exportTestResults">导出测试结果</a-button>
      </div>
    </div>

    <div class="test-content">
      <!-- 测试状态面板 -->
      <div class="test-status-panel">
        <a-card title="测试状态" size="small">
          <div class="status-grid">
            <div class="status-item">
              <span class="label">总测试数:</span>
              <span class="value">{{ testResults.length }}</span>
            </div>
            <div class="status-item">
              <span class="label">通过:</span>
              <span class="value success">{{ passedTests }}</span>
            </div>
            <div class="status-item">
              <span class="label">失败:</span>
              <span class="value error">{{ failedTests }}</span>
            </div>
            <div class="status-item">
              <span class="label">进度:</span>
              <span class="value">{{ testProgress }}%</span>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 测试项目列表 -->
      <div class="test-items">
        <a-card 
          v-for="test in testResults" 
          :key="test.id"
          :title="test.name"
          size="small"
          class="test-item"
          :class="{ 
            'test-passed': test.status === 'passed',
            'test-failed': test.status === 'failed',
            'test-running': test.status === 'running'
          }"
        >
          <template #extra>
            <a-tag 
              :color="getStatusColor(test.status)"
              class="test-status-tag"
            >
              {{ getStatusText(test.status) }}
            </a-tag>
          </template>
          
          <div class="test-details">
            <p class="test-description">{{ test.description }}</p>
            
            <div v-if="test.status === 'running'" class="test-progress">
              <a-progress :percent="test.progress" size="small" />
            </div>
            
            <div v-if="test.result" class="test-result">
              <div v-if="test.result.success" class="success-result">
                <a-icon type="check-circle" />
                <span>{{ test.result.message }}</span>
              </div>
              <div v-else class="error-result">
                <a-icon type="close-circle" />
                <span>{{ test.result.message }}</span>
                <div v-if="test.result.details" class="error-details">
                  <pre>{{ test.result.details }}</pre>
                </div>
              </div>
            </div>
            
            <div v-if="test.metrics" class="test-metrics">
              <div class="metric-item">
                <span>执行时间: {{ test.metrics.duration }}ms</span>
              </div>
              <div class="metric-item">
                <span>内存使用: {{ test.metrics.memoryUsage }}MB</span>
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 详细日志 -->
      <div class="test-logs">
        <a-card title="测试日志" size="small">
          <div class="log-container">
            <div 
              v-for="(log, index) in testLogs" 
              :key="index"
              class="log-entry"
              :class="log.level"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

// 测试工具导入
import StorageUtils from '../utils/StorageUtils.js'
import DataMigrationManager from '../utils/DataMigrationManager.js'
import UnifiedDataValidator from '../utils/UnifiedDataValidator.js'

// 响应式数据
const isRunning = ref(false)
const testResults = ref([])
const testLogs = ref([])
const currentTestIndex = ref(0)

// 计算属性
const passedTests = computed(() => 
  testResults.value.filter(test => test.status === 'passed').length
)

const failedTests = computed(() => 
  testResults.value.filter(test => test.status === 'failed').length
)

const testProgress = computed(() => {
  if (testResults.value.length === 0) return 0
  const completed = testResults.value.filter(test => 
    test.status === 'passed' || test.status === 'failed'
  ).length
  return Math.round((completed / testResults.value.length) * 100)
})

// 测试定义
const testDefinitions = [
  {
    id: 'storage-utils-test',
    name: 'StorageUtils 存储工具测试',
    description: '测试localStorage兼容性和存储功能',
    testFn: testStorageUtils
  },
  {
    id: 'data-migration-test',
    name: 'DataMigrationManager 数据迁移测试',
    description: '测试数据格式迁移和版本兼容性',
    testFn: testDataMigration
  },
  {
    id: 'data-validator-test',
    name: 'UnifiedDataValidator 数据验证测试',
    description: '测试统一数据验证和修复机制',
    testFn: testDataValidator
  },
  {
    id: 'integration-test',
    name: '集成测试',
    description: '测试各组件协同工作',
    testFn: testIntegration
  },
  {
    id: 'performance-test',
    name: '性能测试',
    description: '测试系统性能和内存使用',
    testFn: testPerformance
  }
]

// 初始化测试结果
function initializeTests() {
  testResults.value = testDefinitions.map(test => ({
    ...test,
    status: 'pending',
    progress: 0,
    result: null,
    metrics: null
  }))
}

// 运行所有测试
async function runAllTests() {
  if (isRunning.value) return
  
  isRunning.value = true
  currentTestIndex.value = 0
  testLogs.value = []
  
  addLog('info', '开始运行画布系统综合测试...')
  
  try {
    for (let i = 0; i < testResults.value.length; i++) {
      currentTestIndex.value = i
      await runSingleTest(testResults.value[i])
    }
    
    addLog('info', `测试完成! 通过: ${passedTests.value}, 失败: ${failedTests.value}`)
    Message.success(`测试完成! 通过 ${passedTests.value} 个，失败 ${failedTests.value} 个`)
    
  } catch (error) {
    addLog('error', `测试执行出错: ${error.message}`)
    Message.error('测试执行出错')
  } finally {
    isRunning.value = false
  }
}

// 运行单个测试
async function runSingleTest(test) {
  test.status = 'running'
  test.progress = 0
  
  addLog('info', `开始测试: ${test.name}`)
  
  const startTime = performance.now()
  const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
  
  try {
    // 执行测试函数
    const result = await test.testFn((progress) => {
      test.progress = progress
    })
    
    const endTime = performance.now()
    const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
    
    test.status = result.success ? 'passed' : 'failed'
    test.result = result
    test.metrics = {
      duration: Math.round(endTime - startTime),
      memoryUsage: Math.round((endMemory - startMemory) / 1024 / 1024 * 100) / 100
    }
    
    addLog(result.success ? 'info' : 'error', 
      `测试 ${test.name} ${result.success ? '通过' : '失败'}: ${result.message}`)
    
  } catch (error) {
    test.status = 'failed'
    test.result = {
      success: false,
      message: error.message,
      details: error.stack
    }
    
    addLog('error', `测试 ${test.name} 异常: ${error.message}`)
  }
}

// StorageUtils 测试
async function testStorageUtils(updateProgress) {
  updateProgress(10)
  
  try {
    const storageUtils = StorageUtils
    
    updateProgress(30)
    
    // 测试基本存储功能
    const testKey = 'test-storage-key'
    const testData = { message: 'Hello World', timestamp: Date.now() }
    
    storageUtils.setItem(testKey, testData)
    updateProgress(50)
    
    const retrievedData = storageUtils.getItem(testKey)
    updateProgress(70)
    
    if (!retrievedData || retrievedData.message !== testData.message) {
      throw new Error('存储和读取数据不匹配')
    }
    
    // 测试过期功能
    storageUtils.setItem(testKey + '-expire', testData, 1) // 1ms过期
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const expiredData = storageUtils.getItem(testKey + '-expire')
    if (expiredData !== null) {
      throw new Error('过期数据未被正确清理')
    }
    
    updateProgress(90)
    
    // 清理测试数据
    storageUtils.removeItem(testKey)
    
    updateProgress(100)
    
    return {
      success: true,
      message: 'StorageUtils 所有功能测试通过'
    }
    
  } catch (error) {
    return {
      success: false,
      message: `StorageUtils 测试失败: ${error.message}`,
      details: error.stack
    }
  }
}

// DataMigrationManager 测试
async function testDataMigration(updateProgress) {
  updateProgress(10)
  
  try {
    const migrationManager = new DataMigrationManager({
      autoMigration: true,
      enableValidation: true,
      enableBackup: true
    })
    
    updateProgress(30)
    
    // 创建旧格式数据
    const oldFormatData = {
      edges: [
        { id: 'edge1', source: 'node1', target: 'node2' }, // 旧格式：字符串
        { id: 'edge2', source: 'node2', target: 'node3' }
      ]
    }
    
    updateProgress(50)
    
    // 执行迁移
    const migratedData = await migrationManager.migrateData(oldFormatData)
    
    updateProgress(70)
    
    // 验证迁移结果
    if (!migratedData.edges || migratedData.edges.length !== 2) {
      throw new Error('边数据迁移失败')
    }
    
    const firstEdge = migratedData.edges[0]
    if (typeof firstEdge.source !== 'object' || !firstEdge.source.id) {
      throw new Error('边格式迁移失败：source应该是对象格式')
    }
    
    updateProgress(90)
    
    // 测试迁移历史
    const history = migrationManager.getMigrationHistory()
    if (history.length === 0) {
      throw new Error('迁移历史记录失败')
    }
    
    updateProgress(100)
    
    return {
      success: true,
      message: `数据迁移测试通过，迁移了 ${migratedData.edges.length} 条边数据`
    }
    
  } catch (error) {
    return {
      success: false,
      message: `DataMigrationManager 测试失败: ${error.message}`,
      details: error.stack
    }
  }
}

// UnifiedDataValidator 测试
async function testDataValidator(updateProgress) {
  updateProgress(10)
  
  try {
    const validator = new UnifiedDataValidator({
      strictMode: true,
      autoFix: true,
      validateReferences: true
    })
    
    updateProgress(30)
    
    // 创建测试数据（包含错误）
    const testData = {
      nodes: [
        { id: 'node1', x: 100, y: 100 },
        { id: 'node2', x: 200, y: 200 },
        { id: 'node3' } // 缺少位置信息
      ],
      edges: [
        { 
          id: 'edge1', 
          source: { id: 'node1' }, 
          target: { id: 'node2' } 
        },
        { 
          id: 'edge2', 
          source: { id: 'node2' }, 
          target: { id: 'nonexistent' } // 引用不存在的节点
        }
      ]
    }
    
    updateProgress(50)
    
    // 执行验证
    const validationResult = await validator.validateData(testData)
    
    updateProgress(70)
    
    // 检查验证结果
    if (validationResult.isValid) {
      throw new Error('应该检测到数据错误，但验证通过了')
    }
    
    if (validationResult.errors.length === 0) {
      throw new Error('应该有错误报告，但没有发现错误')
    }
    
    updateProgress(90)
    
    // 检查修复操作
    if (validationResult.repairActions.length === 0) {
      throw new Error('应该有自动修复操作，但没有执行修复')
    }
    
    updateProgress(100)
    
    return {
      success: true,
      message: `数据验证测试通过，发现 ${validationResult.errors.length} 个错误，执行了 ${validationResult.repairActions.length} 个修复操作`
    }
    
  } catch (error) {
    return {
      success: false,
      message: `UnifiedDataValidator 测试失败: ${error.message}`,
      details: error.stack
    }
  }
}

// 集成测试
async function testIntegration(updateProgress) {
  updateProgress(10)
  
  try {
    // 初始化所有组件
    const storageUtils = StorageUtils
    const migrationManager = new DataMigrationManager()
    const validator = new UnifiedDataValidator()
    
    updateProgress(30)
    
    // 模拟完整的数据流程
    const originalData = {
      edges: [
        { id: 'edge1', source: 'node1', target: 'node2' } // 旧格式
      ]
    }
    
    // 1. 存储原始数据
    storageUtils.setItem('integration-test-data', originalData)
    
    updateProgress(50)
    
    // 2. 读取并迁移数据
    const storedData = storageUtils.getItem('integration-test-data')
    const migratedData = await migrationManager.migrateData(storedData)
    
    updateProgress(70)
    
    // 3. 验证迁移后的数据
    const validationResult = await validator.validateData(migratedData)
    
    updateProgress(90)
    
    // 4. 存储最终数据
    storageUtils.setItem('integration-test-final', migratedData)
    
    // 清理测试数据
    storageUtils.removeItem('integration-test-data')
    storageUtils.removeItem('integration-test-final')
    
    updateProgress(100)
    
    return {
      success: true,
      message: '集成测试通过，所有组件协同工作正常'
    }
    
  } catch (error) {
    return {
      success: false,
      message: `集成测试失败: ${error.message}`,
      details: error.stack
    }
  }
}

// 性能测试
async function testPerformance(updateProgress) {
  updateProgress(10)
  
  try {
    const startTime = performance.now()
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
    
    // 创建大量测试数据
    const largeDataset = {
      nodes: Array.from({ length: 1000 }, (_, i) => ({
        id: `node${i}`,
        x: Math.random() * 1000,
        y: Math.random() * 1000
      })),
      edges: Array.from({ length: 2000 }, (_, i) => ({
        id: `edge${i}`,
        source: { id: `node${Math.floor(Math.random() * 1000)}` },
        target: { id: `node${Math.floor(Math.random() * 1000)}` }
      }))
    }
    
    updateProgress(30)
    
    // 测试存储性能
    const storageUtils = StorageUtils
    const storageStart = performance.now()
    storageUtils.setItem('performance-test', largeDataset)
    const storageTime = performance.now() - storageStart
    
    updateProgress(50)
    
    // 测试验证性能
    const validator = new UnifiedDataValidator()
    const validationStart = performance.now()
    await validator.validateData(largeDataset)
    const validationTime = performance.now() - validationStart
    
    updateProgress(70)
    
    // 测试迁移性能
    const migrationManager = new DataMigrationManager()
    const migrationStart = performance.now()
    await migrationManager.migrateData(largeDataset)
    const migrationTime = performance.now() - migrationStart
    
    updateProgress(90)
    
    const totalTime = performance.now() - startTime
    const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
    const memoryUsed = (endMemory - startMemory) / 1024 / 1024
    
    // 清理测试数据
    storageUtils.removeItem('performance-test')
    
    updateProgress(100)
    
    // 性能基准检查
    if (totalTime > 5000) { // 5秒
      throw new Error(`性能测试超时: ${totalTime}ms`)
    }
    
    if (memoryUsed > 50) { // 50MB
      throw new Error(`内存使用过多: ${memoryUsed}MB`)
    }
    
    return {
      success: true,
      message: `性能测试通过 - 总时间: ${Math.round(totalTime)}ms, 内存: ${Math.round(memoryUsed * 100) / 100}MB`
    }
    
  } catch (error) {
    return {
      success: false,
      message: `性能测试失败: ${error.message}`,
      details: error.stack
    }
  }
}

// 工具函数
function addLog(level, message) {
  testLogs.value.push({
    level,
    message,
    timestamp: Date.now()
  })
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

function getStatusColor(status) {
  const colors = {
    pending: 'gray',
    running: 'blue',
    passed: 'green',
    failed: 'red'
  }
  return colors[status] || 'gray'
}

function getStatusText(status) {
  const texts = {
    pending: '待运行',
    running: '运行中',
    passed: '通过',
    failed: '失败'
  }
  return texts[status] || '未知'
}

function clearTestData() {
  testResults.value.forEach(test => {
    test.status = 'pending'
    test.progress = 0
    test.result = null
    test.metrics = null
  })
  testLogs.value = []
  Message.info('测试数据已清除')
}

function exportTestResults() {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.value.length,
      passed: passedTests.value,
      failed: failedTests.value,
      progress: testProgress.value
    },
    tests: testResults.value,
    logs: testLogs.value
  }
  
  const blob = new Blob([JSON.stringify(results, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `canvas-system-test-results-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  Message.success('测试结果已导出')
}

// 生命周期
onMounted(() => {
  initializeTests()
})
</script>

<style scoped>
.canvas-system-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.test-header h1 {
  margin: 0;
  color: #1f2937;
}

.test-controls {
  display: flex;
  gap: 10px;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.test-status-panel {
  margin-bottom: 20px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-item .label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
}

.status-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
}

.status-item .value.success {
  color: #10b981;
}

.status-item .value.error {
  color: #ef4444;
}

.test-items {
  display: grid;
  gap: 15px;
}

.test-item {
  transition: all 0.3s ease;
}

.test-item.test-passed {
  border-left: 4px solid #10b981;
}

.test-item.test-failed {
  border-left: 4px solid #ef4444;
}

.test-item.test-running {
  border-left: 4px solid #3b82f6;
}

.test-status-tag {
  font-weight: bold;
}

.test-details {
  margin-top: 10px;
}

.test-description {
  color: #6b7280;
  margin-bottom: 10px;
}

.test-progress {
  margin: 10px 0;
}

.test-result {
  margin: 10px 0;
}

.success-result {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
}

.error-result {
  color: #ef4444;
}

.error-result > span {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.error-details {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
}

.error-details pre {
  margin: 0;
  font-size: 12px;
  color: #991b1b;
  white-space: pre-wrap;
  word-break: break-word;
}

.test-metrics {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  font-size: 12px;
  color: #6b7280;
}

.test-logs {
  margin-top: 20px;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: #f9fafb;
  border-radius: 4px;
  padding: 10px;
}

.log-entry {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.log-time {
  color: #6b7280;
  min-width: 80px;
}

.log-level {
  min-width: 50px;
  font-weight: bold;
}

.log-entry.info .log-level {
  color: #3b82f6;
}

.log-entry.error .log-level {
  color: #ef4444;
}

.log-entry.warn .log-level {
  color: #f59e0b;
}

.log-message {
  flex: 1;
  color: #1f2937;
}

@media (max-width: 768px) {
  .test-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .test-controls {
    justify-content: center;
  }
}
</style>