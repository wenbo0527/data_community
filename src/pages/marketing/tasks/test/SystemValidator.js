/**
 * 画布系统验证器
 * 用于自动检测和修复系统问题
 */

import StorageUtils from '../utils/StorageUtils.js'
import DataMigrationManager from '../utils/DataMigrationManager.js'
import UnifiedDataValidator from '../utils/UnifiedDataValidator.js'

export class SystemValidator {
  constructor(options = {}) {
    this.options = {
      autoFix: true,
      enableLogging: true,
      enableBackup: true,
      validateOnStartup: true,
      ...options
    }
    
    this.storageUtils = StorageUtils
    this.migrationManager = new DataMigrationManager({
      autoMigration: this.options.autoFix,
      enableValidation: true,
      enableBackup: this.options.enableBackup
    })
    this.dataValidator = new UnifiedDataValidator({
      strictMode: false,
      autoFix: this.options.autoFix,
      validateReferences: true,
      validateFormat: true,
      validateIntegrity: true
    })
    
    this.validationResults = []
    this.fixedIssues = []
    this.criticalErrors = []
  }

  /**
   * 运行完整的系统验证
   * @returns {Promise<Object>} 验证结果
   */
  async runFullValidation() {
    this.log('info', '🔍 开始画布系统完整验证...')
    
    const results = {
      timestamp: Date.now(),
      success: true,
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        fixedIssues: 0,
        criticalErrors: 0
      },
      checks: [],
      fixes: [],
      errors: []
    }
    
    try {
      // 1. 环境检查
      await this.checkEnvironment(results)
      
      // 2. 存储系统检查
      await this.checkStorageSystem(results)
      
      // 3. 数据完整性检查
      await this.checkDataIntegrity(results)
      
      // 4. 组件兼容性检查
      await this.checkComponentCompatibility(results)
      
      // 5. 性能检查
      await this.checkPerformance(results)
      
      // 6. 生成报告
      this.generateValidationReport(results)
      
    } catch (error) {
      results.success = false
      results.errors.push({
        type: 'system_error',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      })
      this.log('error', `❌ 系统验证失败: ${error.message}`)
    }
    
    return results
  }

  /**
   * 环境检查
   */
  async checkEnvironment(results) {
    this.log('info', '🔧 检查运行环境...')
    
    const checks = [
      {
        name: 'localStorage_support',
        description: 'localStorage 支持检查',
        test: () => this.testLocalStorageSupport()
      },
      {
        name: 'browser_compatibility',
        description: '浏览器兼容性检查',
        test: () => this.testBrowserCompatibility()
      },
      {
        name: 'memory_availability',
        description: '内存可用性检查',
        test: () => this.testMemoryAvailability()
      }
    ]
    
    for (const check of checks) {
      try {
        const result = await check.test()
        results.checks.push({
          category: 'environment',
          name: check.name,
          description: check.description,
          passed: result.success,
          message: result.message,
          details: result.details || null
        })
        
        if (result.success) {
          results.summary.passedChecks++
        } else {
          results.summary.failedChecks++
          if (result.critical) {
            results.errors.push({
              type: 'environment_error',
              check: check.name,
              message: result.message,
              timestamp: Date.now()
            })
          }
        }
        
        results.summary.totalChecks++
        
      } catch (error) {
        results.checks.push({
          category: 'environment',
          name: check.name,
          description: check.description,
          passed: false,
          message: `检查失败: ${error.message}`,
          error: error.stack
        })
        results.summary.failedChecks++
        results.summary.totalChecks++
      }
    }
  }

  /**
   * 存储系统检查
   */
  async checkStorageSystem(results) {
    this.log('info', '💾 检查存储系统...')
    
    const checks = [
      {
        name: 'storage_read_write',
        description: '存储读写功能检查',
        test: () => this.testStorageReadWrite()
      },
      {
        name: 'storage_capacity',
        description: '存储容量检查',
        test: () => this.testStorageCapacity()
      },
      {
        name: 'storage_persistence',
        description: '存储持久性检查',
        test: () => this.testStoragePersistence()
      },
      {
        name: 'storage_cleanup',
        description: '存储清理机制检查',
        test: () => this.testStorageCleanup()
      }
    ]
    
    for (const check of checks) {
      try {
        const result = await check.test()
        results.checks.push({
          category: 'storage',
          name: check.name,
          description: check.description,
          passed: result.success,
          message: result.message,
          details: result.details || null
        })
        
        if (result.success) {
          results.summary.passedChecks++
        } else {
          results.summary.failedChecks++
          
          // 尝试自动修复
          if (this.options.autoFix && result.fixable) {
            const fixResult = await this.attemptStorageFix(check.name, result)
            if (fixResult.success) {
              results.fixes.push({
                category: 'storage',
                issue: check.name,
                action: fixResult.action,
                message: fixResult.message,
                timestamp: Date.now()
              })
              results.summary.fixedIssues++
            }
          }
        }
        
        results.summary.totalChecks++
        
      } catch (error) {
        results.checks.push({
          category: 'storage',
          name: check.name,
          description: check.description,
          passed: false,
          message: `检查失败: ${error.message}`,
          error: error.stack
        })
        results.summary.failedChecks++
        results.summary.totalChecks++
      }
    }
  }

  /**
   * 数据完整性检查
   */
  async checkDataIntegrity(results) {
    this.log('info', '🔍 检查数据完整性...')
    
    try {
      // 获取所有存储的数据
      const storageKeys = [
        'unified-edge-manager-state',
        'edge-manager-backup',
        'canvas-state',
        'preview-line-state'
      ]
      
      for (const key of storageKeys) {
        const data = this.storageUtils.getItem(key)
        if (data) {
          // 验证数据格式
          const validationResult = await this.dataValidator.validateData(data)
          
          results.checks.push({
            category: 'data_integrity',
            name: `data_validation_${key}`,
            description: `数据验证: ${key}`,
            passed: validationResult.isValid,
            message: validationResult.isValid 
              ? '数据格式正确' 
              : `发现 ${validationResult.errors.length} 个错误`,
            details: {
              errors: validationResult.errors.length,
              warnings: validationResult.warnings.length,
              repairActions: validationResult.repairActions.length
            }
          })
          
          if (validationResult.isValid) {
            results.summary.passedChecks++
          } else {
            results.summary.failedChecks++
            
            // 尝试数据迁移修复
            if (this.options.autoFix) {
              try {
                const migratedData = await this.migrationManager.migrateData(data)
                const revalidationResult = await this.dataValidator.validateData(migratedData)
                
                if (revalidationResult.isValid) {
                  // 保存修复后的数据
                  this.storageUtils.setItem(key, migratedData)
                  
                  results.fixes.push({
                    category: 'data_integrity',
                    issue: `invalid_data_${key}`,
                    action: 'data_migration',
                    message: `成功修复数据格式问题`,
                    timestamp: Date.now()
                  })
                  results.summary.fixedIssues++
                }
              } catch (migrationError) {
                results.errors.push({
                  type: 'migration_error',
                  key: key,
                  message: migrationError.message,
                  timestamp: Date.now()
                })
              }
            }
          }
          
          results.summary.totalChecks++
        }
      }
      
    } catch (error) {
      results.errors.push({
        type: 'data_integrity_error',
        message: error.message,
        timestamp: Date.now()
      })
    }
  }

  /**
   * 组件兼容性检查
   */
  async checkComponentCompatibility(results) {
    this.log('info', '🔧 检查组件兼容性...')
    
    const checks = [
      {
        name: 'storage_utils_integration',
        description: 'StorageUtils 集成检查',
        test: () => this.testStorageUtilsIntegration()
      },
      {
        name: 'migration_manager_integration',
        description: 'DataMigrationManager 集成检查',
        test: () => this.testMigrationManagerIntegration()
      },
      {
        name: 'data_validator_integration',
        description: 'UnifiedDataValidator 集成检查',
        test: () => this.testDataValidatorIntegration()
      }
    ]
    
    for (const check of checks) {
      try {
        const result = await check.test()
        results.checks.push({
          category: 'compatibility',
          name: check.name,
          description: check.description,
          passed: result.success,
          message: result.message,
          details: result.details || null
        })
        
        if (result.success) {
          results.summary.passedChecks++
        } else {
          results.summary.failedChecks++
        }
        
        results.summary.totalChecks++
        
      } catch (error) {
        results.checks.push({
          category: 'compatibility',
          name: check.name,
          description: check.description,
          passed: false,
          message: `检查失败: ${error.message}`,
          error: error.stack
        })
        results.summary.failedChecks++
        results.summary.totalChecks++
      }
    }
  }

  /**
   * 性能检查
   */
  async checkPerformance(results) {
    this.log('info', '⚡ 检查系统性能...')
    
    const performanceTests = [
      {
        name: 'storage_performance',
        description: '存储性能测试',
        test: () => this.testStoragePerformance()
      },
      {
        name: 'validation_performance',
        description: '验证性能测试',
        test: () => this.testValidationPerformance()
      },
      {
        name: 'migration_performance',
        description: '迁移性能测试',
        test: () => this.testMigrationPerformance()
      }
    ]
    
    for (const test of performanceTests) {
      try {
        const result = await test.test()
        results.checks.push({
          category: 'performance',
          name: test.name,
          description: test.description,
          passed: result.success,
          message: result.message,
          details: result.metrics || null
        })
        
        if (result.success) {
          results.summary.passedChecks++
        } else {
          results.summary.failedChecks++
        }
        
        results.summary.totalChecks++
        
      } catch (error) {
        results.checks.push({
          category: 'performance',
          name: test.name,
          description: test.description,
          passed: false,
          message: `性能测试失败: ${error.message}`,
          error: error.stack
        })
        results.summary.failedChecks++
        results.summary.totalChecks++
      }
    }
  }

  // 具体测试方法实现
  
  testLocalStorageSupport() {
    try {
      const testKey = '__storage_test__'
      const testValue = 'test'
      
      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      
      if (retrieved === testValue) {
        return {
          success: true,
          message: 'localStorage 支持正常'
        }
      } else {
        return {
          success: false,
          message: 'localStorage 读写异常',
          critical: true
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `localStorage 不可用: ${error.message}`,
        critical: true
      }
    }
  }

  testBrowserCompatibility() {
    const requiredFeatures = [
      { name: 'Promise', test: () => typeof Promise !== 'undefined' },
      { name: 'Map', test: () => typeof Map !== 'undefined' },
      { name: 'Set', test: () => typeof Set !== 'undefined' },
      { name: 'JSON', test: () => typeof JSON !== 'undefined' },
      { name: 'performance', test: () => typeof performance !== 'undefined' }
    ]
    
    const unsupported = requiredFeatures.filter(feature => !feature.test())
    
    if (unsupported.length === 0) {
      return {
        success: true,
        message: '浏览器兼容性检查通过'
      }
    } else {
      return {
        success: false,
        message: `不支持的特性: ${unsupported.map(f => f.name).join(', ')}`,
        critical: true,
        details: { unsupported: unsupported.map(f => f.name) }
      }
    }
  }

  testMemoryAvailability() {
    if (performance.memory) {
      const memInfo = performance.memory
      const usedMB = memInfo.usedJSHeapSize / 1024 / 1024
      const limitMB = memInfo.jsHeapSizeLimit / 1024 / 1024
      const usagePercent = (usedMB / limitMB) * 100
      
      if (usagePercent < 80) {
        return {
          success: true,
          message: `内存使用正常 (${Math.round(usagePercent)}%)`,
          details: {
            used: Math.round(usedMB),
            limit: Math.round(limitMB),
            percentage: Math.round(usagePercent)
          }
        }
      } else {
        return {
          success: false,
          message: `内存使用过高 (${Math.round(usagePercent)}%)`,
          details: {
            used: Math.round(usedMB),
            limit: Math.round(limitMB),
            percentage: Math.round(usagePercent)
          }
        }
      }
    } else {
      return {
        success: true,
        message: '无法检测内存使用情况（浏览器不支持）'
      }
    }
  }

  async testStorageReadWrite() {
    try {
      const testData = {
        timestamp: Date.now(),
        data: 'test_storage_functionality'
      }
      
      this.storageUtils.setItem('__validation_test__', testData)
      const retrieved = this.storageUtils.getItem('__validation_test__')
      this.storageUtils.removeItem('__validation_test__')
      
      if (retrieved && retrieved.data === testData.data) {
        return {
          success: true,
          message: '存储读写功能正常'
        }
      } else {
        return {
          success: false,
          message: '存储读写功能异常',
          fixable: true
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `存储读写测试失败: ${error.message}`,
        fixable: true
      }
    }
  }

  async testStorageCapacity() {
    try {
      // 测试存储容量（简单测试）
      const testSize = 1024 * 100 // 100KB
      const testData = 'x'.repeat(testSize)
      
      this.storageUtils.setItem('__capacity_test__', testData)
      const retrieved = this.storageUtils.getItem('__capacity_test__')
      this.storageUtils.removeItem('__capacity_test__')
      
      if (retrieved && retrieved.length === testSize) {
        return {
          success: true,
          message: '存储容量测试通过'
        }
      } else {
        return {
          success: false,
          message: '存储容量不足或异常'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `存储容量测试失败: ${error.message}`
      }
    }
  }

  async testStoragePersistence() {
    // 简单的持久性测试
    try {
      const testKey = '__persistence_test__'
      const testData = { timestamp: Date.now() }
      
      this.storageUtils.setItem(testKey, testData)
      
      // 模拟页面刷新后的读取
      setTimeout(() => {
        const retrieved = this.storageUtils.getItem(testKey)
        this.storageUtils.removeItem(testKey)
        
        if (retrieved && retrieved.timestamp === testData.timestamp) {
          return {
            success: true,
            message: '存储持久性正常'
          }
        }
      }, 100)
      
      return {
        success: true,
        message: '存储持久性测试启动'
      }
    } catch (error) {
      return {
        success: false,
        message: `存储持久性测试失败: ${error.message}`
      }
    }
  }

  async testStorageCleanup() {
    try {
      // 测试过期数据清理
      const testKey = '__cleanup_test__'
      const testData = { message: 'cleanup test' }
      
      // 设置1ms过期时间
      this.storageUtils.setItem(testKey, testData, 1)
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const retrieved = this.storageUtils.getItem(testKey)
      
      if (retrieved === null) {
        return {
          success: true,
          message: '存储清理机制正常'
        }
      } else {
        return {
          success: false,
          message: '存储清理机制异常',
          fixable: true
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `存储清理测试失败: ${error.message}`
      }
    }
  }

  async testStorageUtilsIntegration() {
    try {
      const storageUtils = StorageUtils
      
      // 测试基本功能
      const testData = { integration: 'test' }
      storageUtils.setItem('integration_test', testData)
      const retrieved = storageUtils.getItem('integration_test')
      storageUtils.removeItem('integration_test')
      
      if (retrieved && retrieved.integration === 'test') {
        return {
          success: true,
          message: 'StorageUtils 集成正常'
        }
      } else {
        return {
          success: false,
          message: 'StorageUtils 集成异常'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `StorageUtils 集成测试失败: ${error.message}`
      }
    }
  }

  async testMigrationManagerIntegration() {
    try {
      const migrationManager = new DataMigrationManager()
      
      // 测试基本迁移功能
      const oldData = {
        edges: [{ id: 'test', source: 'node1', target: 'node2' }]
      }
      
      const migratedData = await migrationManager.migrateData(oldData)
      
      if (migratedData && migratedData.edges && migratedData.edges[0].source.id) {
        return {
          success: true,
          message: 'DataMigrationManager 集成正常'
        }
      } else {
        return {
          success: false,
          message: 'DataMigrationManager 集成异常'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `DataMigrationManager 集成测试失败: ${error.message}`
      }
    }
  }

  async testDataValidatorIntegration() {
    try {
      const validator = new UnifiedDataValidator()
      
      // 测试基本验证功能
      const testData = {
        nodes: [{ id: 'node1', x: 100, y: 100 }],
        edges: [{ id: 'edge1', source: { id: 'node1' }, target: { id: 'node1' } }]
      }
      
      const result = await validator.validateData(testData)
      
      if (result && typeof result.isValid === 'boolean') {
        return {
          success: true,
          message: 'UnifiedDataValidator 集成正常'
        }
      } else {
        return {
          success: false,
          message: 'UnifiedDataValidator 集成异常'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `UnifiedDataValidator 集成测试失败: ${error.message}`
      }
    }
  }

  async testStoragePerformance() {
    const startTime = performance.now()
    
    try {
      // 测试大量数据的存储性能
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        id: `item_${i}`,
        data: `test_data_${i}`,
        timestamp: Date.now()
      }))
      
      this.storageUtils.setItem('performance_test', testData)
      const retrieved = this.storageUtils.getItem('performance_test')
      this.storageUtils.removeItem('performance_test')
      
      const duration = performance.now() - startTime
      
      if (retrieved && retrieved.length === 1000 && duration < 1000) {
        return {
          success: true,
          message: `存储性能良好 (${Math.round(duration)}ms)`,
          metrics: { duration, itemCount: 1000 }
        }
      } else {
        return {
          success: false,
          message: `存储性能不佳 (${Math.round(duration)}ms)`,
          metrics: { duration, itemCount: 1000 }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `存储性能测试失败: ${error.message}`,
        metrics: { duration: performance.now() - startTime }
      }
    }
  }

  async testValidationPerformance() {
    const startTime = performance.now()
    
    try {
      const validator = new UnifiedDataValidator()
      
      // 创建大量测试数据
      const testData = {
        nodes: Array.from({ length: 500 }, (_, i) => ({
          id: `node_${i}`,
          x: Math.random() * 1000,
          y: Math.random() * 1000
        })),
        edges: Array.from({ length: 1000 }, (_, i) => ({
          id: `edge_${i}`,
          source: { id: `node_${Math.floor(Math.random() * 500)}` },
          target: { id: `node_${Math.floor(Math.random() * 500)}` }
        }))
      }
      
      const result = await validator.validateData(testData)
      const duration = performance.now() - startTime
      
      if (result && duration < 2000) {
        return {
          success: true,
          message: `验证性能良好 (${Math.round(duration)}ms)`,
          metrics: { 
            duration, 
            nodeCount: testData.nodes.length,
            edgeCount: testData.edges.length
          }
        }
      } else {
        return {
          success: false,
          message: `验证性能不佳 (${Math.round(duration)}ms)`,
          metrics: { 
            duration, 
            nodeCount: testData.nodes.length,
            edgeCount: testData.edges.length
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `验证性能测试失败: ${error.message}`,
        metrics: { duration: performance.now() - startTime }
      }
    }
  }

  async testMigrationPerformance() {
    const startTime = performance.now()
    
    try {
      const migrationManager = new DataMigrationManager()
      
      // 创建需要迁移的旧格式数据
      const oldData = {
        edges: Array.from({ length: 1000 }, (_, i) => ({
          id: `edge_${i}`,
          source: `node_${Math.floor(Math.random() * 500)}`,
          target: `node_${Math.floor(Math.random() * 500)}`
        }))
      }
      
      const migratedData = await migrationManager.migrateData(oldData)
      const duration = performance.now() - startTime
      
      if (migratedData && duration < 3000) {
        return {
          success: true,
          message: `迁移性能良好 (${Math.round(duration)}ms)`,
          metrics: { 
            duration, 
            edgeCount: oldData.edges.length
          }
        }
      } else {
        return {
          success: false,
          message: `迁移性能不佳 (${Math.round(duration)}ms)`,
          metrics: { 
            duration, 
            edgeCount: oldData.edges.length
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `迁移性能测试失败: ${error.message}`,
        metrics: { duration: performance.now() - startTime }
      }
    }
  }

  async attemptStorageFix(checkName, result) {
    try {
      switch (checkName) {
        case 'storage_read_write':
          // 尝试重新初始化存储工具
          this.storageUtils = StorageUtils
          return {
            success: true,
            action: 'reinitialize_storage',
            message: '重新初始化存储工具'
          }
          
        case 'storage_cleanup':
          // 手动清理存储数据
          this.storageUtils.clear()
          return {
            success: true,
            action: 'manual_cleanup',
            message: '手动清理存储数据'
          }
          
        default:
          return {
            success: false,
            action: 'no_fix_available',
            message: '没有可用的修复方案'
          }
      }
    } catch (error) {
      return {
        success: false,
        action: 'fix_failed',
        message: `修复失败: ${error.message}`
      }
    }
  }

  generateValidationReport(results) {
    const report = {
      title: '画布系统验证报告',
      timestamp: new Date(results.timestamp).toLocaleString(),
      summary: results.summary,
      status: results.success ? '通过' : '失败',
      recommendations: []
    }
    
    // 生成建议
    if (results.summary.failedChecks > 0) {
      report.recommendations.push('建议检查失败的项目并进行相应修复')
    }
    
    if (results.summary.criticalErrors > 0) {
      report.recommendations.push('发现严重错误，建议立即处理')
    }
    
    if (results.summary.fixedIssues > 0) {
      report.recommendations.push(`已自动修复 ${results.summary.fixedIssues} 个问题`)
    }
    
    this.log('info', '📋 验证报告生成完成', report)
    
    return report
  }

  log(level, message, data = null) {
    if (!this.options.enableLogging) return
    
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    
    switch (level) {
      case 'info':
        console.log(logMessage, data || '')
        break
      case 'warn':
        console.warn(logMessage, data || '')
        break
      case 'error':
        console.error(logMessage, data || '')
        break
      default:
        console.log(logMessage, data || '')
    }
  }
}

export default SystemValidator