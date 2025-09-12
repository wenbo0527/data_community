/**
 * TaskFlow自动修复系统测试脚本
 * 用于验证自动修复功能是否正常工作
 */

class TaskFlowAutoRepairTester {
  constructor() {
    this.testResults = []
    this.isTestMode = true
  }

  async runAllTests() {
    console.log('🧪 [自动修复测试] 开始运行测试套件')
    
    try {
      // 测试1: 检查自动修复系统是否加载
      await this.testAutoRepairSystemLoaded()
      
      // 测试2: 检查监控系统是否加载
      await this.testMonitoringSystemLoaded()
      
      // 测试3: 测试环境分离功能
      await this.testEnvironmentSeparation()
      
      // 测试4: 测试健康检查功能
      await this.testHealthCheck()
      
      // 测试5: 测试自动修复功能
      await this.testAutoRepairFunctionality()
      
      // 输出测试结果
      this.outputTestResults()
      
    } catch (error) {
      console.error('🚨 [自动修复测试] 测试套件执行失败:', error)
      this.addTestResult('测试套件执行', false, error.message)
    }
  }

  async testAutoRepairSystemLoaded() {
    const testName = '自动修复系统加载检查'
    try {
      const isLoaded = typeof window.TaskFlowAutoRepairSystem === 'function'
      this.addTestResult(testName, isLoaded, isLoaded ? '系统已加载' : '系统未加载')
      
      if (isLoaded) {
        // 尝试创建实例
        const instance = new window.TaskFlowAutoRepairSystem()
        const hasInitMethod = typeof instance.initialize === 'function'
        this.addTestResult(testName + ' - 实例创建', hasInitMethod, hasInitMethod ? '实例创建成功' : '实例创建失败')
      }
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testMonitoringSystemLoaded() {
    const testName = '监控系统加载检查'
    try {
      const isLoaded = typeof window.TaskFlowMonitoringSystem === 'function'
      this.addTestResult(testName, isLoaded, isLoaded ? '监控系统已加载' : '监控系统未加载')
      
      if (isLoaded) {
        const instance = new window.TaskFlowMonitoringSystem()
        const hasInitMethod = typeof instance.initialize === 'function'
        this.addTestResult(testName + ' - 实例创建', hasInitMethod, hasInitMethod ? '监控实例创建成功' : '监控实例创建失败')
      }
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testEnvironmentSeparation() {
    const testName = '环境分离功能检查'
    try {
      if (window.TaskFlowAutoRepairSystem) {
        const instance = new window.TaskFlowAutoRepairSystem()
        const config = instance.config
        
        // 检查环境检测
        const isDev = config.environment === 'development'
        const isProd = config.environment === 'production'
        
        this.addTestResult(testName + ' - 环境检测', isDev || isProd, `检测到环境: ${config.environment}`)
        
        // 检查功能启用状态
        if (isDev) {
          const devFeaturesEnabled = config.features.healthCheck && config.features.autoRepair && config.features.monitoring
          this.addTestResult(testName + ' - 开发环境功能', devFeaturesEnabled, '开发环境应启用所有功能')
        } else {
          const prodFeaturesLimited = !config.features.detailedLogging
          this.addTestResult(testName + ' - 生产环境功能', prodFeaturesLimited, '生产环境应限制详细日志')
        }
      } else {
        this.addTestResult(testName, false, '自动修复系统未加载')
      }
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testHealthCheck() {
    const testName = '健康检查功能测试'
    try {
      if (window.TaskFlowAutoRepairSystem) {
        const instance = new window.TaskFlowAutoRepairSystem()
        await instance.initialize()
        
        // 执行健康检查
        await instance.performHealthCheck()
        const healthStatus = instance.getHealthStatus()
        
        this.addTestResult(testName + ' - 执行检查', true, '健康检查执行成功')
        this.addTestResult(testName + ' - 状态获取', typeof healthStatus === 'object', `健康状态: ${JSON.stringify(healthStatus)}`)
        
      } else {
        this.addTestResult(testName, false, '自动修复系统未加载')
      }
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testAutoRepairFunctionality() {
    const testName = '自动修复功能测试'
    try {
      if (window.TaskFlowAutoRepairSystem) {
        const instance = new window.TaskFlowAutoRepairSystem()
        await instance.initialize()
        
        // 模拟一个需要修复的问题
        const mockIssue = {
          type: 'layout_engine_missing',
          severity: 'high',
          description: '布局引擎未初始化'
        }
        
        // 测试修复策略是否存在
        const hasRepairStrategy = typeof instance.repairStrategies[mockIssue.type] === 'function'
        this.addTestResult(testName + ' - 修复策略', hasRepairStrategy, hasRepairStrategy ? '修复策略存在' : '修复策略缺失')
        
        // 测试自动修复执行
        if (hasRepairStrategy) {
          const repairResult = await instance.performAutoRepair()
          this.addTestResult(testName + ' - 执行修复', true, `修复结果: ${JSON.stringify(repairResult)}`)
        }
        
      } else {
        this.addTestResult(testName, false, '自动修复系统未加载')
      }
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  addTestResult(testName, passed, message) {
    this.testResults.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    })
    
    const status = passed ? '✅' : '❌'
    console.log(`${status} [测试] ${testName}: ${message}`)
  }

  outputTestResults() {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    
    console.log('\n📊 [测试结果汇总]')
    console.log(`总测试数: ${totalTests}`)
    console.log(`通过: ${passedTests}`)
    console.log(`失败: ${failedTests}`)
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    
    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:')
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}: ${result.message}`)
      })
    }
    
    // 将结果保存到全局变量供外部访问
    window.taskFlowTestResults = {
      summary: { totalTests, passedTests, failedTests, successRate: (passedTests / totalTests) * 100 },
      details: this.testResults
    }
  }
}

// 自动运行测试（仅在开发环境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // 等待页面完全加载后运行测试
  window.addEventListener('load', async () => {
    // 延迟一段时间确保所有脚本都已加载
    setTimeout(async () => {
      const tester = new TaskFlowAutoRepairTester()
      await tester.runAllTests()
    }, 2000)
  })
}

// 导出测试器供手动调用
window.TaskFlowAutoRepairTester = TaskFlowAutoRepairTester

console.log('🧪 [自动修复测试] 测试脚本已加载，将在页面加载完成后自动运行测试')