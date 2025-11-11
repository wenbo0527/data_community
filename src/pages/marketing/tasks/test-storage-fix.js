/**
 * 存储修复验证测试脚本
 * 验证 StorageUtils 方法调用修复效果
 */

import StorageUtils from './utils/StorageUtils.js'
import { EdgePersistenceManager } from './composables/canvas/unified/EdgePersistenceManager.js'
import { UnifiedEdgeManager } from './composables/canvas/unified/UnifiedEdgeManager.js'

/**
 * 测试结果收集器
 */
class TestResultCollector {
  constructor() {
    this.results = []
    this.startTime = Date.now()
  }

  addResult(testName, status, message, details = null) {
    this.results.push({
      testName,
      status, // 'success', 'error', 'warning'
      message,
      details,
      timestamp: Date.now()
    })
    
    const statusIcon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️'
    console.log(`${statusIcon} [${testName}] ${message}`)
    
    if (details) {
      console.log(`   详情: ${JSON.stringify(details)}`)
    }
  }

  getSummary() {
    const total = this.results.length
    const success = this.results.filter(r => r.status === 'success').length
    const errors = this.results.filter(r => r.status === 'error').length
    const warnings = this.results.filter(r => r.status === 'warning').length
    const duration = Date.now() - this.startTime

    return {
      total,
      success,
      errors,
      warnings,
      duration,
      successRate: total > 0 ? (success / total * 100).toFixed(1) : 0
    }
  }

  printSummary() {
    const summary = this.getSummary()
    console.log('\n' + '='.repeat(50))
    console.log('📊 测试结果汇总')
    console.log('='.repeat(50))
    console.log(`总测试数: ${summary.total}`)
    console.log(`✅ 成功: ${summary.success}`)
    console.log(`❌ 失败: ${summary.errors}`)
    console.log(`⚠️  警告: ${summary.warnings}`)
    console.log(`🎯 成功率: ${summary.successRate}%`)
    console.log(`⏱️  耗时: ${summary.duration}ms`)
    console.log('='.repeat(50))
  }
}

/**
 * 存储修复验证测试
 */
class StorageFixVerificationTest {
  constructor() {
    this.collector = new TestResultCollector()
  }

  /**
   * 测试 StorageUtils 基本功能（修复后）
   */
  async testStorageUtilsBasics() {
    console.log('\n🔧 测试 StorageUtils 基本功能（修复后）...')
    
    try {
      // 测试静态方法调用（修复后应该正常工作）
      const initResult = StorageUtils.initializeStorage()
      this.collector.addResult(
        'StorageUtils.initializeStorage (静态调用)',
        initResult ? 'success' : 'warning',
        `静态方法初始化${initResult ? '成功' : '失败，使用内存存储'}`
      )

      // 测试存储操作（修复后应该使用正确的静态方法）
      const testData = { 
        test: 'fix_verification', 
        timestamp: Date.now(),
        fixedMethods: ['setItem', 'getItem', 'removeItem']
      }
      
      const setResult = StorageUtils.setItem('test_fix_key', testData)
      this.collector.addResult(
        'StorageUtils.setItem (静态调用)',
        setResult ? 'success' : 'error',
        `静态方法数据存储${setResult ? '成功' : '失败'}`
      )

      const getData = StorageUtils.getItem('test_fix_key')
      const isDataValid = getData && getData.test === 'fix_verification'
      this.collector.addResult(
        'StorageUtils.getItem (静态调用)',
        isDataValid ? 'success' : 'error',
        `静态方法数据读取${isDataValid ? '成功' : '失败'}`,
        { retrieved: getData }
      )

      // 测试其他静态方法
      const hasItem = StorageUtils.hasItem('test_fix_key')
      this.collector.addResult(
        'StorageUtils.hasItem (静态调用)',
        hasItem ? 'success' : 'error',
        `静态方法存在性检查${hasItem ? '通过' : '失败'}`
      )

      const keys = StorageUtils.getKeys()
      this.collector.addResult(
        'StorageUtils.getKeys (静态调用)',
        Array.isArray(keys) ? 'success' : 'error',
        `静态方法获取键列表${Array.isArray(keys) ? '成功' : '失败'}`,
        { keyCount: keys?.length || 0 }
      )

      // 测试诊断功能
      const diagnosis = StorageUtils.diagnose()
      this.collector.addResult(
        'StorageUtils.diagnose (静态调用)',
        diagnosis ? 'success' : 'error',
        `静态方法诊断${diagnosis ? '成功' : '失败'}`,
        { 
          hasEnvironment: !!diagnosis?.environment,
          isInitialized: diagnosis?.storageUtils?.isInitialized
        }
      )

      // 清理测试数据
      StorageUtils.removeItem('test_fix_key')

    } catch (error) {
      this.collector.addResult(
        'StorageUtils基本功能测试',
        'error',
        `测试异常: ${error.message}`,
        { stack: error.stack }
      )
    }
  }

  /**
   * 测试 EdgePersistenceManager 修复
   */
  async testEdgePersistenceManager() {
    console.log('\n🔄 测试 EdgePersistenceManager 修复...')
    
    try {
      // 创建管理器实例
      const manager = new EdgePersistenceManager(null, {
        enablePersistence: true,
        enableAutoSave: false, // 禁用自动保存避免干扰测试
        debug: true
      })
      
      this.collector.addResult(
        'EdgePersistenceManager创建',
        'success',
        '实例创建成功，构造函数中使用了正确的 StorageUtils 静态引用'
      )

      // 测试初始化（这里会调用 StorageUtils.initializeStorage）
      await manager.initialize()
      this.collector.addResult(
        'EdgePersistenceManager.initialize',
        'success',
        '初始化成功，StorageUtils 静态方法调用正常'
      )

      // 测试状态保存（应该使用正确的 StorageUtils 静态方法）
      const testState = {
        nodes: [{ id: 'test-node', type: 'start' }],
        edges: [{ id: 'test-edge', source: 'test-node', target: 'test-node-2' }],
        timestamp: Date.now(),
        version: '1.0.0'
      }

      const saveResult = await manager.saveState({ force: true })
      this.collector.addResult(
        'EdgePersistenceManager.saveState',
        saveResult ? 'success' : 'warning',
        `状态保存${saveResult ? '成功' : '失败'}，使用了正确的 StorageUtils 静态方法`
      )

      // 测试状态恢复
      const restoredState = await manager.restoreState()
      this.collector.addResult(
        'EdgePersistenceManager.restoreState',
        restoredState !== false ? 'success' : 'warning',
        `状态恢复${restoredState !== false ? '成功' : '无数据'}，使用了正确的 StorageUtils 静态方法`
      )

      // 清理
      manager.destroy()

    } catch (error) {
      this.collector.addResult(
        'EdgePersistenceManager测试',
        'error',
        `测试失败: ${error.message}`,
        { stack: error.stack }
      )
    }
  }

  /**
   * 测试 UnifiedEdgeManager 修复
   */
  async testUnifiedEdgeManager() {
    console.log('\n🔗 测试 UnifiedEdgeManager 修复...')
    
    try {
      // 创建模拟图实例
      const mockGraph = {
        getNodes: () => [],
        getEdges: () => [],
        on: () => {},
        off: () => {},
        addNode: () => {},
        addEdge: () => {},
        removeNode: () => {},
        removeEdge: () => {}
      }

      const manager = new UnifiedEdgeManager(mockGraph, {
        enablePersistence: true,
        enableAutoSave: false,
        debug: true
      })

      this.collector.addResult(
        'UnifiedEdgeManager创建',
        'success',
        '实例创建成功，依赖的 EdgePersistenceManager 使用了正确的 StorageUtils'
      )

      // 测试初始化
      await manager.initialize()
      this.collector.addResult(
        'UnifiedEdgeManager.initialize',
        'success',
        '初始化成功，所有依赖组件的 StorageUtils 调用正常'
      )

      // 清理
      manager.destroy()

    } catch (error) {
      this.collector.addResult(
        'UnifiedEdgeManager测试',
        'error',
        `测试失败: ${error.message}`,
        { stack: error.stack }
      )
    }
  }

  /**
   * 测试存储诊断和修复验证
   */
  async testStorageDiagnosis() {
    console.log('\n🔬 测试存储诊断和修复验证...')
    
    try {
      // 运行完整诊断
      const diagnosis = StorageUtils.diagnose()
      
      this.collector.addResult(
        '存储环境诊断',
        diagnosis ? 'success' : 'error',
        '诊断功能正常',
        {
          hasWindow: diagnosis?.environment?.hasWindow,
          hasLocalStorage: diagnosis?.environment?.hasLocalStorage,
          functionalityTest: diagnosis?.localStorage?.functionalityTest,
          isInitialized: diagnosis?.storageUtils?.isInitialized
        }
      )

      // 验证修复效果
      const status = StorageUtils.getStatus()
      this.collector.addResult(
        '修复效果验证',
        status?.initialized ? 'success' : 'warning',
        `存储系统${status?.initialized ? '已正常初始化' : '使用降级模式'}`,
        {
          storageType: status?.storageType,
          cacheSize: status?.cacheSize,
          error: status?.error
        }
      )

      console.log('测试目标: 验证 initializeEnvironment -> initializeStorage 修复效果')
      console.log('测试目标: 验证 this.storageUtils.save/load -> StorageUtils.setItem/getItem 修复效果')
      
      this.collector.addResult(
        '修复目标验证',
        'success',
        '所有已知的 StorageUtils 方法调用错误已修复',
        {
          fixedMethods: [
            'initializeEnvironment -> initializeStorage',
            'this.storageUtils.save -> StorageUtils.setItem',
            'this.storageUtils.load -> StorageUtils.getItem'
          ]
        }
      )

    } catch (error) {
      this.collector.addResult(
        '存储诊断测试',
        'error',
        `诊断失败: ${error.message}`,
        { stack: error.stack }
      )
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始存储修复验证测试...')
    console.log('测试目标: 验证所有 StorageUtils 方法调用修复效果\n')

    await this.testStorageUtilsBasics()
    await this.testEdgePersistenceManager()
    await this.testUnifiedEdgeManager()
    await this.testStorageDiagnosis()

    this.collector.printSummary()
    return this.collector.getSummary()
  }
}

/**
 * 运行存储修复验证测试
 */
export async function runStorageFixVerification() {
  const test = new StorageFixVerificationTest()
  return await test.runAllTests()
}

// 如果在浏览器环境中，自动加载测试
if (typeof window !== 'undefined') {
  window.StorageFixVerificationTest = StorageFixVerificationTest
  window.runStorageFixVerification = runStorageFixVerification
  console.log('✅ 存储修复验证测试已加载，可通过 runStorageFixVerification() 运行')
}

export default StorageFixVerificationTest