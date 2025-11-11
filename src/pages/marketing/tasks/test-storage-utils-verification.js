/**
 * StorageUtils 方法验证测试脚本
 * 验证所有静态方法的可用性和正确性
 */

import StorageUtils from './utils/StorageUtils.js'

/**
 * 测试结果收集器
 */
class TestResultCollector {
  constructor() {
    this.results = []
  }

  addResult(method, status, message, data = null) {
    this.results.push({
      method,
      status, // 'success', 'warning', 'error'
      message,
      data,
      timestamp: Date.now()
    })
  }

  getResults() {
    return this.results
  }

  getSummary() {
    const summary = {
      total: this.results.length,
      success: this.results.filter(r => r.status === 'success').length,
      warning: this.results.filter(r => r.status === 'warning').length,
      error: this.results.filter(r => r.status === 'error').length
    }
    summary.successRate = summary.total > 0 ? (summary.success / summary.total * 100).toFixed(1) : 0
    return summary
  }

  printResults() {
    console.log('\n📊 StorageUtils 方法验证结果:')
    console.log('==========================================')
    
    this.results.forEach((result, index) => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '❌'
      console.log(`${icon} ${index + 1}. ${result.method}: ${result.message}`)
      if (result.data) {
        console.log(`   数据:`, result.data)
      }
    })

    const summary = this.getSummary()
    console.log('\n📈 测试摘要:')
    console.log(`总计: ${summary.total} | 成功: ${summary.success} | 警告: ${summary.warning} | 错误: ${summary.error}`)
    console.log(`成功率: ${summary.successRate}%`)
    console.log('==========================================\n')
  }
}

/**
 * StorageUtils 方法验证测试类
 */
class StorageUtilsVerificationTest {
  constructor() {
    this.collector = new TestResultCollector()
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始 StorageUtils 方法验证测试...\n')

    try {
      // 1. 测试初始化方法
      await this.testInitializeStorage()
      
      // 2. 测试基本存储操作
      await this.testBasicStorageOperations()
      
      // 3. 测试高级存储操作
      await this.testAdvancedStorageOperations()
      
      // 4. 测试诊断和状态方法
      await this.testDiagnosticMethods()
      
      // 5. 测试错误处理
      await this.testErrorHandling()

    } catch (error) {
      this.collector.addResult(
        'runAllTests',
        'error',
        `测试执行失败: ${error.message}`,
        { stack: error.stack }
      )
    }

    // 打印结果
    this.collector.printResults()
    return this.collector.getResults()
  }

  /**
   * 测试初始化方法
   */
  async testInitializeStorage() {
    console.log('🔧 测试初始化方法...')
    
    try {
      const result = StorageUtils.initializeStorage()
      this.collector.addResult(
        'initializeStorage',
        result ? 'success' : 'warning',
        `初始化${result ? '成功' : '失败，使用内存存储'}`,
        { initialized: result }
      )
    } catch (error) {
      this.collector.addResult(
        'initializeStorage',
        'error',
        `初始化异常: ${error.message}`
      )
    }
  }

  /**
   * 测试基本存储操作
   */
  async testBasicStorageOperations() {
    console.log('💾 测试基本存储操作...')
    
    const testData = {
      string: 'test string',
      number: 12345,
      boolean: true,
      object: { nested: { value: 'nested test' } },
      array: [1, 2, 3, 'test'],
      timestamp: Date.now()
    }

    // 测试 setItem
    try {
      const setResult = StorageUtils.setItem('test-verification-key', testData)
      this.collector.addResult(
        'setItem',
        setResult ? 'success' : 'error',
        `数据存储${setResult ? '成功' : '失败'}`,
        { success: setResult }
      )
    } catch (error) {
      this.collector.addResult(
        'setItem',
        'error',
        `存储异常: ${error.message}`
      )
    }

    // 测试 getItem
    try {
      const getData = StorageUtils.getItem('test-verification-key')
      const isEqual = JSON.stringify(getData) === JSON.stringify(testData)
      this.collector.addResult(
        'getItem',
        isEqual ? 'success' : 'error',
        `数据读取${isEqual ? '成功且一致' : '失败或不一致'}`,
        { retrieved: getData, isEqual }
      )
    } catch (error) {
      this.collector.addResult(
        'getItem',
        'error',
        `读取异常: ${error.message}`
      )
    }

    // 测试 hasItem
    try {
      const hasItem = StorageUtils.hasItem('test-verification-key')
      this.collector.addResult(
        'hasItem',
        hasItem ? 'success' : 'error',
        `存在性检查${hasItem ? '通过' : '失败'}`,
        { exists: hasItem }
      )
    } catch (error) {
      this.collector.addResult(
        'hasItem',
        'error',
        `存在性检查异常: ${error.message}`
      )
    }

    // 测试 removeItem
    try {
      const removeResult = StorageUtils.removeItem('test-verification-key')
      this.collector.addResult(
        'removeItem',
        removeResult ? 'success' : 'error',
        `数据删除${removeResult ? '成功' : '失败'}`,
        { success: removeResult }
      )
    } catch (error) {
      this.collector.addResult(
        'removeItem',
        'error',
        `删除异常: ${error.message}`
      )
    }
  }

  /**
   * 测试高级存储操作
   */
  async testAdvancedStorageOperations() {
    console.log('🔍 测试高级存储操作...')

    // 测试 getKeys
    try {
      const keys = StorageUtils.getKeys()
      this.collector.addResult(
        'getKeys',
        Array.isArray(keys) ? 'success' : 'error',
        `获取存储键${Array.isArray(keys) ? '成功' : '失败'}`,
        { keys: keys.slice(0, 5), totalCount: keys.length }
      )
    } catch (error) {
      this.collector.addResult(
        'getKeys',
        'error',
        `获取存储键异常: ${error.message}`
      )
    }

    // 测试 getSize
    try {
      const size = StorageUtils.getSize()
      this.collector.addResult(
        'getSize',
        typeof size === 'number' ? 'success' : 'error',
        `获取存储大小${typeof size === 'number' ? '成功' : '失败'}`,
        { size }
      )
    } catch (error) {
      this.collector.addResult(
        'getSize',
        'error',
        `获取存储大小异常: ${error.message}`
      )
    }

    // 测试带选项的 setItem 和 getItem
    try {
      const testKey = 'test-options-key'
      const testValue = { options: 'test' }
      
      StorageUtils.setItem(testKey, testValue, { serialize: true })
      const retrieved = StorageUtils.getItem(testKey, { deserialize: true, defaultValue: null })
      
      const isEqual = JSON.stringify(retrieved) === JSON.stringify(testValue)
      this.collector.addResult(
        'setItem/getItem with options',
        isEqual ? 'success' : 'error',
        `带选项的存储操作${isEqual ? '成功' : '失败'}`,
        { isEqual }
      )
      
      // 清理
      StorageUtils.removeItem(testKey)
    } catch (error) {
      this.collector.addResult(
        'setItem/getItem with options',
        'error',
        `带选项的存储操作异常: ${error.message}`
      )
    }
  }

  /**
   * 测试诊断和状态方法
   */
  async testDiagnosticMethods() {
    console.log('🔬 测试诊断和状态方法...')

    // 测试 diagnose
    try {
      const diagnosis = StorageUtils.diagnose()
      const isValid = diagnosis && typeof diagnosis === 'object' && diagnosis.environment
      this.collector.addResult(
        'diagnose',
        isValid ? 'success' : 'error',
        `存储诊断${isValid ? '成功' : '失败'}`,
        { 
          hasEnvironment: !!diagnosis?.environment,
          hasLocalStorage: !!diagnosis?.localStorage,
          hasStorageUtils: !!diagnosis?.storageUtils
        }
      )
    } catch (error) {
      this.collector.addResult(
        'diagnose',
        'error',
        `存储诊断异常: ${error.message}`
      )
    }

    // 测试 getStatus
    try {
      const status = StorageUtils.getStatus()
      const isValid = status && typeof status === 'object' && typeof status.initialized === 'boolean'
      this.collector.addResult(
        'getStatus',
        isValid ? 'success' : 'error',
        `获取状态${isValid ? '成功' : '失败'}`,
        {
          initialized: status?.initialized,
          storageType: status?.storageType,
          cacheSize: status?.cacheSize
        }
      )
    } catch (error) {
      this.collector.addResult(
        'getStatus',
        'error',
        `获取状态异常: ${error.message}`
      )
    }
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    console.log('⚠️ 测试错误处理...')

    // 测试无效键的处理
    try {
      const result = StorageUtils.getItem(null)
      this.collector.addResult(
        'error handling - null key',
        'success',
        '无效键处理正常',
        { result }
      )
    } catch (error) {
      this.collector.addResult(
        'error handling - null key',
        'warning',
        `无效键抛出异常: ${error.message}`
      )
    }

    // 测试不存在键的默认值
    try {
      const defaultValue = { default: true }
      const result = StorageUtils.getItem('non-existent-key', { defaultValue })
      const isDefault = JSON.stringify(result) === JSON.stringify(defaultValue)
      this.collector.addResult(
        'error handling - default value',
        isDefault ? 'success' : 'warning',
        `默认值处理${isDefault ? '正常' : '异常'}`,
        { result, expected: defaultValue }
      )
    } catch (error) {
      this.collector.addResult(
        'error handling - default value',
        'error',
        `默认值处理异常: ${error.message}`
      )
    }
  }
}

// 导出测试类
export default StorageUtilsVerificationTest

// 如果直接运行此脚本
if (typeof window !== 'undefined') {
  window.StorageUtilsVerificationTest = StorageUtilsVerificationTest
  
  // 自动运行测试
  const test = new StorageUtilsVerificationTest()
  test.runAllTests().then(results => {
    console.log('✅ StorageUtils 方法验证测试完成')
    window.storageUtilsTestResults = results
  }).catch(error => {
    console.error('❌ StorageUtils 方法验证测试失败:', error)
  })
}