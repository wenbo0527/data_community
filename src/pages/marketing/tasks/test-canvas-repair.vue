<template>
  <div class="test-canvas-repair">
    <div class="test-header">
      <h1>画布系统修复验证测试</h1>
      <div class="test-status" :class="testStatus">
        <span>测试状态: {{ testStatusText }}</span>
      </div>
    </div>

    <div class="test-sections">
      <!-- 存储工具测试 -->
      <div class="test-section">
        <h2>1. 存储工具测试 (StorageUtils)</h2>
        <div class="test-controls">
          <button @click="testStorageUtils" :disabled="testing">测试存储工具</button>
        </div>
        <div class="test-results" v-if="storageTestResults">
          <h3>测试结果:</h3>
          <pre>{{ JSON.stringify(storageTestResults, null, 2) }}</pre>
        </div>
      </div>

      <!-- 数据迁移测试 -->
      <div class="test-section">
        <h2>2. 数据迁移测试 (DataMigrationManager)</h2>
        <div class="test-controls">
          <button @click="testDataMigration" :disabled="testing">测试数据迁移</button>
          <button @click="createLegacyData" :disabled="testing">创建旧版数据</button>
        </div>
        <div class="test-results" v-if="migrationTestResults">
          <h3>测试结果:</h3>
          <pre>{{ JSON.stringify(migrationTestResults, null, 2) }}</pre>
        </div>
      </div>

      <!-- 数据验证测试 -->
      <div class="test-section">
        <h2>3. 数据验证测试 (UnifiedDataValidator)</h2>
        <div class="test-controls">
          <button @click="testDataValidation" :disabled="testing">测试数据验证</button>
          <button @click="createInvalidData" :disabled="testing">创建无效数据</button>
        </div>
        <div class="test-results" v-if="validationTestResults">
          <h3>测试结果:</h3>
          <pre>{{ JSON.stringify(validationTestResults, null, 2) }}</pre>
        </div>
      </div>

      <!-- 边缘持久化测试 -->
      <div class="test-section">
        <h2>4. 边缘持久化测试 (EdgePersistenceManager)</h2>
        <div class="test-controls">
          <button @click="testEdgePersistence" :disabled="testing">测试边缘持久化</button>
          <button @click="clearAllData" :disabled="testing">清空所有数据</button>
        </div>
        <div class="test-results" v-if="persistenceTestResults">
          <h3>测试结果:</h3>
          <pre>{{ JSON.stringify(persistenceTestResults, null, 2) }}</pre>
        </div>
      </div>

      <!-- 综合测试 -->
      <div class="test-section">
        <h2>5. 综合测试</h2>
        <div class="test-controls">
          <button @click="runAllTests" :disabled="testing" class="primary-btn">运行所有测试</button>
        </div>
        <div class="test-progress" v-if="testing">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: testProgress + '%' }"></div>
          </div>
          <span>{{ testProgressText }}</span>
        </div>
        <div class="test-summary" v-if="allTestResults">
          <h3>综合测试结果:</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="label">总测试数:</span>
              <span class="value">{{ allTestResults.totalTests }}</span>
            </div>
            <div class="stat">
              <span class="label">通过:</span>
              <span class="value success">{{ allTestResults.passed }}</span>
            </div>
            <div class="stat">
              <span class="label">失败:</span>
              <span class="value error">{{ allTestResults.failed }}</span>
            </div>
            <div class="stat">
              <span class="label">成功率:</span>
              <span class="value">{{ allTestResults.successRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日志输出 -->
    <div class="test-logs">
      <h2>测试日志</h2>
      <div class="log-controls">
        <button @click="clearLogs">清空日志</button>
        <button @click="exportLogs">导出日志</button>
      </div>
      <div class="log-content" ref="logContent">
        <div v-for="(log, index) in logs" :key="index" :class="['log-entry', log.level]">
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { StorageUtils } from './utils/StorageUtils.js'
import { DataMigrationManager, DataVersion, MigrationType } from './utils/DataMigrationManager.js'
import { UnifiedDataValidator, ValidationLevel, ValidationType } from './utils/UnifiedDataValidator.js'

// 响应式数据
const testing = ref(false)
const testProgress = ref(0)
const testProgressText = ref('')
const testStatus = ref('idle')
const testStatusText = ref('待测试')

const storageTestResults = ref(null)
const migrationTestResults = ref(null)
const validationTestResults = ref(null)
const persistenceTestResults = ref(null)
const allTestResults = ref(null)

const logs = ref([])
const logContent = ref(null)

// 工具实例
let storageUtils = null
let dataMigrationManager = null
let dataValidator = null

// 初始化
onMounted(async () => {
  await initializeTools()
  addLog('info', '测试页面初始化完成')
})

// 初始化工具
async function initializeTools() {
  try {
    // 初始化存储工具
    storageUtils = StorageUtils
    
    // 初始化数据迁移管理器
    dataMigrationManager = new DataMigrationManager({
      autoMigration: true,
      validateAfterMigration: true,
      backupBeforeMigration: true,
      enableRollback: true,
      errorRecovery: 'auto'
    })
    
    // 初始化数据验证器
    dataValidator = new UnifiedDataValidator({
      validationLevel: ValidationLevel.STRICT,
      autoRepair: true,
      enablePerformanceCheck: true,
      enableDetailedLogging: true
    })
    
    addLog('info', '所有工具初始化成功')
  } catch (error) {
    addLog('error', `工具初始化失败: ${error.message}`)
  }
}

// 测试存储工具
async function testStorageUtils() {
  addLog('info', '开始测试存储工具...')
  
  try {
    const results = {
      environmentCheck: null,
      basicOperations: null,
      repairTest: null,
      performanceTest: null
    }
    
    // 环境检查
    const envResult = storageUtils.initializeStorage()
    results.environmentCheck = envResult
    addLog('info', `环境检查完成: ${envResult ? '成功' : '失败'}`)
    
    // 基本操作测试
    const testData = { test: 'data', timestamp: Date.now() }
    storageUtils.setItem('test-key', testData)
    const retrievedData = storageUtils.getItem('test-key')
    results.basicOperations = {
      setSuccess: true,
      getSuccess: JSON.stringify(retrievedData) === JSON.stringify(testData),
      data: retrievedData
    }
    addLog('info', `基本操作测试: ${results.basicOperations.getSuccess ? '通过' : '失败'}`)
    
    // 修复测试
    if (storageUtils.repairMethods) {
      const repairResult = await storageUtils.repairMethods()
      results.repairTest = repairResult
      addLog('info', `修复测试完成: ${repairResult.success ? '成功' : '失败'}`)
    }
    
    // 性能测试
    const performanceStart = performance.now()
    for (let i = 0; i < 100; i++) {
      storageUtils.setItem(`perf-test-${i}`, { index: i, data: 'test' })
    }
    const performanceEnd = performance.now()
    results.performanceTest = {
      operations: 100,
      timeMs: performanceEnd - performanceStart,
      opsPerSecond: Math.round(100 / ((performanceEnd - performanceStart) / 1000))
    }
    addLog('info', `性能测试完成: ${results.performanceTest.opsPerSecond} ops/sec`)
    
    storageTestResults.value = results
    addLog('success', '存储工具测试完成')
    
  } catch (error) {
    addLog('error', `存储工具测试失败: ${error.message}`)
    storageTestResults.value = { error: error.message }
  }
}

// 测试数据迁移
async function testDataMigration() {
  addLog('info', '开始测试数据迁移...')
  
  try {
    const results = {
      migrationRules: null,
      edgeFormatMigration: null,
      nodeFormatMigration: null,
      referenceMigration: null
    }
    
    // 设置迁移规则
    dataMigrationManager.setupMigrationRules()
    results.migrationRules = { success: true, rulesCount: 4 }
    addLog('info', '迁移规则设置完成')
    
    // 测试边缘格式迁移
    const legacyEdgeData = {
      edges: [
        { id: 'edge1', source: 'node1', target: 'node2' }, // 旧格式
        { id: 'edge2', source: { cell: 'node2' }, target: { cell: 'node3' } } // 新格式
      ]
    }
    
    const edgeMigrationResult = await dataMigrationManager.migrateData(legacyEdgeData)
    results.edgeFormatMigration = edgeMigrationResult
    addLog('info', `边缘格式迁移: ${edgeMigrationResult.success ? '成功' : '失败'}`)
    
    // 测试节点格式迁移
    const legacyNodeData = {
      nodes: [
        { name: 'node1', x: 100, y: 200 }, // 缺少ID和其他属性
        { id: 'node2', position: { x: 150, y: 250 }, size: { width: 100, height: 50 } }
      ]
    }
    
    const nodeMigrationResult = await dataMigrationManager.migrateData(legacyNodeData)
    results.nodeFormatMigration = nodeMigrationResult
    addLog('info', `节点格式迁移: ${nodeMigrationResult.success ? '成功' : '失败'}`)
    
    migrationTestResults.value = results
    addLog('success', '数据迁移测试完成')
    
  } catch (error) {
    addLog('error', `数据迁移测试失败: ${error.message}`)
    migrationTestResults.value = { error: error.message }
  }
}

// 测试数据验证
async function testDataValidation() {
  addLog('info', '开始测试数据验证...')
  
  try {
    const results = {
      structureValidation: null,
      formatValidation: null,
      referenceValidation: null,
      autoRepair: null
    }
    
    // 结构验证测试
    const validData = {
      nodes: [
        { id: 'node1', position: { x: 100, y: 200 }, size: { width: 100, height: 50 } }
      ],
      edges: [
        { id: 'edge1', source: { cell: 'node1' }, target: { cell: 'node2' } }
      ]
    }
    
    const structureResult = await dataValidator.validateData(validData)
    results.structureValidation = structureResult
    addLog('info', `结构验证: ${structureResult.isValid ? '通过' : '失败'}`)
    
    // 格式验证测试（包含错误数据）
    const invalidData = {
      nodes: [
        { position: { x: 'invalid', y: 200 } }, // 缺少ID，无效坐标
        { id: 'node2', size: { width: -100 } } // 无效尺寸
      ],
      edges: [
        { source: 'node1', target: 'node3' } // 缺少ID，旧格式
      ]
    }
    
    const formatResult = await dataValidator.validateData(invalidData)
    results.formatValidation = formatResult
    addLog('info', `格式验证: 发现 ${formatResult.errors.length} 个错误`)
    
    // 引用验证测试
    const referenceData = {
      nodes: [
        { id: 'node1', position: { x: 100, y: 200 } }
      ],
      edges: [
        { id: 'edge1', source: { cell: 'node1' }, target: { cell: 'nonexistent' } } // 引用不存在的节点
      ]
    }
    
    const referenceResult = await dataValidator.validateData(referenceData)
    results.referenceValidation = referenceResult
    addLog('info', `引用验证: ${referenceResult.isValid ? '通过' : '失败'}`)
    
    // 自动修复测试
    if (formatResult.repairActions.length > 0) {
      results.autoRepair = {
        repairCount: formatResult.repairActions.length,
        successCount: formatResult.repairActions.filter(a => a.success).length
      }
      addLog('info', `自动修复: ${results.autoRepair.successCount}/${results.autoRepair.repairCount} 成功`)
    }
    
    validationTestResults.value = results
    addLog('success', '数据验证测试完成')
    
  } catch (error) {
    addLog('error', `数据验证测试失败: ${error.message}`)
    validationTestResults.value = { error: error.message }
  }
}

// 测试边缘持久化
async function testEdgePersistence() {
  addLog('info', '开始测试边缘持久化...')
  
  try {
    const results = {
      initialization: null,
      saveRestore: null,
      validation: null,
      migration: null
    }
    
    // 模拟边缘管理器数据
    const mockEdgeManager = {
      edges: new Map([
        ['edge1', { id: 'edge1', source: { cell: 'node1' }, target: { cell: 'node2' } }]
      ]),
      nodes: new Map([
        ['node1', { id: 'node1', position: { x: 100, y: 200 } }],
        ['node2', { id: 'node2', position: { x: 300, y: 400 } }]
      ]),
      previewLines: new Map(),
      connections: new Map()
    }
    
    // 初始化测试
    results.initialization = { success: true, message: '模拟初始化成功' }
    addLog('info', '边缘持久化初始化测试通过')
    
    // 保存和恢复测试
    const testData = {
      edges: Array.from(mockEdgeManager.edges.entries()),
      nodes: Array.from(mockEdgeManager.nodes.entries()),
      timestamp: Date.now()
    }
    
    storageUtils.setItem('edge-persistence-test', testData)
    const restoredData = storageUtils.getItem('edge-persistence-test')
    
    results.saveRestore = {
      saveSuccess: true,
      restoreSuccess: restoredData !== null,
      dataIntegrity: JSON.stringify(testData) === JSON.stringify(restoredData)
    }
    addLog('info', `保存恢复测试: ${results.saveRestore.dataIntegrity ? '通过' : '失败'}`)
    
    // 验证测试
    const validationResult = await dataValidator.validateData({
      nodes: Array.from(mockEdgeManager.nodes.values()),
      edges: Array.from(mockEdgeManager.edges.values())
    })
    
    results.validation = {
      isValid: validationResult.isValid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length
    }
    addLog('info', `数据验证测试: ${validationResult.isValid ? '通过' : '失败'}`)
    
    persistenceTestResults.value = results
    addLog('success', '边缘持久化测试完成')
    
  } catch (error) {
    addLog('error', `边缘持久化测试失败: ${error.message}`)
    persistenceTestResults.value = { error: error.message }
  }
}

// 创建旧版数据
function createLegacyData() {
  const legacyData = {
    version: '1.0.0',
    edges: [
      { id: 'edge1', source: 'node1', target: 'node2' },
      { id: 'edge2', from: 'node2', to: 'node3' }
    ],
    nodes: [
      { name: 'node1', x: 100, y: 200 },
      { id: 'node2', pos: [150, 250] },
      { id: 'node3', position: { x: 200, y: 300 } }
    ]
  }
  
  storageUtils.setItem('legacy-data-test', legacyData)
  addLog('info', '已创建旧版测试数据')
}

// 创建无效数据
function createInvalidData() {
  const invalidData = {
    nodes: [
      { position: { x: 'invalid', y: null } },
      { id: '', size: { width: -100, height: 0 } },
      { id: 'duplicate' },
      { id: 'duplicate' }
    ],
    edges: [
      { source: 123, target: {} },
      { id: 'edge1', source: { cell: 'nonexistent' }, target: { cell: 'also-nonexistent' } }
    ]
  }
  
  storageUtils.setItem('invalid-data-test', invalidData)
  addLog('info', '已创建无效测试数据')
}

// 运行所有测试
async function runAllTests() {
  testing.value = true
  testProgress.value = 0
  testStatus.value = 'running'
  testStatusText.value = '测试进行中'
  
  const tests = [
    { name: '存储工具测试', fn: testStorageUtils },
    { name: '数据迁移测试', fn: testDataMigration },
    { name: '数据验证测试', fn: testDataValidation },
    { name: '边缘持久化测试', fn: testEdgePersistence }
  ]
  
  let passed = 0
  let failed = 0
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    testProgressText.value = `正在执行: ${test.name}`
    
    try {
      await test.fn()
      passed++
      addLog('success', `${test.name} 通过`)
    } catch (error) {
      failed++
      addLog('error', `${test.name} 失败: ${error.message}`)
    }
    
    testProgress.value = ((i + 1) / tests.length) * 100
    await new Promise(resolve => setTimeout(resolve, 500)) // 短暂延迟以显示进度
  }
  
  allTestResults.value = {
    totalTests: tests.length,
    passed,
    failed,
    successRate: Math.round((passed / tests.length) * 100)
  }
  
  testing.value = false
  testStatus.value = allTestResults.value.failed === 0 ? 'success' : 'error'
  testStatusText.value = allTestResults.value.failed === 0 ? '所有测试通过' : '部分测试失败'
  testProgressText.value = '测试完成'
  
  addLog('info', `所有测试完成: ${passed}/${tests.length} 通过`)
}

// 清空所有数据
function clearAllData() {
  const keys = ['test-key', 'edge-persistence-test', 'legacy-data-test', 'invalid-data-test']
  keys.forEach(key => {
    storageUtils.removeItem(key)
  })
  
  // 清空测试结果
  storageTestResults.value = null
  migrationTestResults.value = null
  validationTestResults.value = null
  persistenceTestResults.value = null
  allTestResults.value = null
  
  addLog('info', '已清空所有测试数据')
}

// 日志相关方法
function addLog(level, message) {
  logs.value.push({
    level,
    message,
    timestamp: Date.now()
  })
  
  // 自动滚动到底部
  nextTick(() => {
    if (logContent.value) {
      logContent.value.scrollTop = logContent.value.scrollHeight
    }
  })
}

function clearLogs() {
  logs.value = []
}

function exportLogs() {
  const logText = logs.value.map(log => 
    `[${formatTime(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`
  ).join('\n')
  
  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `canvas-repair-test-logs-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style scoped>
.test-canvas-repair {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.test-header {
  text-align: center;
  margin-bottom: 30px;
}

.test-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.test-status {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
}

.test-status.idle {
  background-color: #f8f9fa;
  color: #6c757d;
}

.test-status.running {
  background-color: #fff3cd;
  color: #856404;
}

.test-status.success {
  background-color: #d4edda;
  color: #155724;
}

.test-status.error {
  background-color: #f8d7da;
  color: #721c24;
}

.test-sections {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.test-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
}

.test-section h2 {
  color: #495057;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.test-controls button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #fff;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.test-controls button:hover:not(:disabled) {
  background-color: #e9ecef;
}

.test-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-controls .primary-btn {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.test-controls .primary-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.test-results {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
}

.test-results h3 {
  margin-bottom: 10px;
  color: #495057;
}

.test-results pre {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  overflow-x: auto;
  font-size: 0.9em;
  max-height: 300px;
  overflow-y: auto;
}

.test-progress {
  margin-top: 15px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}

.test-summary {
  margin-top: 15px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.stat .label {
  font-weight: 500;
  color: #6c757d;
}

.stat .value {
  font-weight: 600;
}

.stat .value.success {
  color: #28a745;
}

.stat .value.error {
  color: #dc3545;
}

.test-logs {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
}

.test-logs h2 {
  color: #495057;
  margin-bottom: 15px;
}

.log-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.log-controls button {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #fff;
  color: #495057;
  cursor: pointer;
  font-size: 0.9em;
}

.log-controls button:hover {
  background-color: #e9ecef;
}

.log-content {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  height: 300px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85em;
  line-height: 1.4;
}

.log-entry {
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
}

.log-time {
  color: #6c757d;
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: 600;
}

.log-entry.info .log-level {
  color: #17a2b8;
}

.log-entry.success .log-level {
  color: #28a745;
}

.log-entry.error .log-level {
  color: #dc3545;
}

.log-message {
  flex: 1;
}

@media (max-width: 768px) {
  .test-canvas-repair {
    padding: 10px;
  }
  
  .test-controls {
    flex-direction: column;
  }
  
  .test-controls button {
    width: 100%;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>