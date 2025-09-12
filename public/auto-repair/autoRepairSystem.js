/**
 * TaskFlow 自动化修复系统
 * 主要用于代码研发测试环节的问题诊断和修复
 * 生产环境保持简化处理，避免复杂的自动修复逻辑
 */

class TaskFlowAutoRepairSystem {
  constructor() {
    this.repairHistory = []
    this.isRepairing = false
    // 浏览器环境检测：检查是否为开发环境
     this.isDevelopment = this.detectDevelopmentEnvironment()
     
     // 根据环境设置不同的配置
     this.config = {
      environment: this.isDevelopment ? 'development' : 'production',
      features: this.isDevelopment ? {
        healthCheck: true,
        autoRepair: true,
        monitoring: true,
        detailedLogging: true
      } : {
        healthCheck: false,
        autoRepair: false,
        monitoring: false,
        detailedLogging: false
      },
      ...(this.isDevelopment ? {
        maxRetries: 3,
        retryDelay: 1000,
        healthCheckInterval: 30000, // 30秒
        enableAutoRepair: true,
        enableDetailedLogging: true
      } : {
        maxRetries: 1,
        retryDelay: 500,
        healthCheckInterval: 0, // 禁用定期检查
        enableAutoRepair: false,
        enableDetailedLogging: false
      })
     }
     
     console.log(`🔍 [环境检测] 当前环境: ${this.config.environment}`)
  }

  /**
   * 检测开发环境
   */
  detectDevelopmentEnvironment() {
    // 多种方式检测开发环境
    const indicators = [
      // 检查 localhost 或开发端口
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '5173' || // Vite 默认端口
      window.location.port === '3000' || // 常见开发端口
      window.location.port === '8080',
      
      // 检查 Vite 开发环境标识
      window.__vite_is_modern_browser !== undefined,
      
      // 检查开发工具
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__ !== undefined,
      
      // 检查 URL 参数
      window.location.search.includes('dev=true'),
      
      // 检查全局开发标识
      window.isDevelopment === true
    ]
    
    const isDev = indicators.some(indicator => indicator)
    console.log(`🔍 [环境检测] 开发环境指标:`, {
      hostname: window.location.hostname,
      port: window.location.port,
      vite: window.__vite_is_modern_browser !== undefined,
      vue_devtools: window.__VUE_DEVTOOLS_GLOBAL_HOOK__ !== undefined,
      isDevelopment: isDev
    })
    
    return isDev
  }

  /**
   * 启动自动修复系统
   */
  async initialize() {
    if (this.isDevelopment) {
      console.log('🚀 [开发环境] 自动修复系统正在启动...')
      
      // 开发环境：立即执行一次健康检查和修复
      await this.performHealthCheckAndRepair()
      
      // 开发环境：启动定期健康检查
      this.startPeriodicHealthCheck()
      
      console.log('✅ [开发环境] 自动修复系统启动完成')
    } else {
      console.log('📋 [生产环境] 启动简化错误处理系统')
    }
    
    // 所有环境都监听错误事件，但处理方式不同
    this.setupErrorListeners()
  }

  /**
   * 执行健康检查和自动修复（环境分离）
   */
  async performHealthCheckAndRepair() {
    if (!this.isDevelopment) {
      // 生产环境只执行基础验证
      return await this.performBasicValidation()
    }
    
    if (this.isRepairing) {
      console.log('⏳ [开发环境] 修复正在进行中，跳过本次检查')
      return
    }

    try {
      this.isRepairing = true
      
      const healthStatus = await this.performHealthCheck()
      
      if (!healthStatus.healthy) {
        console.log('🔧 [开发环境] 检测到问题，开始自动修复')
        const repairResult = await this.executeAutoRepair(healthStatus.issues)
        
        // 记录修复历史
        this.repairHistory.push({
          timestamp: Date.now(),
          issues: healthStatus.issues,
          repairResult,
          success: repairResult.success,
          environment: 'development'
        })
        
        if (repairResult.success) {
          console.log('✅ [开发环境] 修复完成')
        } else {
          console.error('❌ [开发环境] 修复失败:', repairResult.error)
        }
      } else {
        console.log('✅ [开发环境] 系统健康状态良好')
      }
    } catch (error) {
      console.error('❌ [开发环境] 健康检查失败:', error)
    } finally {
      this.isRepairing = false
    }
  }
  
  /**
   * 生产环境的基础验证
   */
  async performBasicValidation() {
    const basicChecks = [
      { name: '图形实例', check: () => !!window.taskFlowGraph },
      { name: '节点操作', check: () => !!window.nodeOperations },
      { name: '配置抽屉', check: () => !!window.configDrawers?.value }
    ]
    
    const results = basicChecks.map(({ name, check }) => {
      try {
        const success = check()
        return { name, success }
      } catch (error) {
        return { name, success: false, error: error.message }
      }
    })
    
    const failedChecks = results.filter(r => !r.success)
    
    if (failedChecks.length > 0) {
      console.warn('⚠️ [生产环境] 基础功能检查发现问题，建议刷新页面')
      this.showProductionErrorGuidance()
    }
    
    return {
      healthy: failedChecks.length === 0,
      results,
      environment: 'production'
    }
  }
  
  /**
   * 生产环境错误指导
   */
  showProductionErrorGuidance() {
    const message = '系统检测到异常，请刷新页面重试'
    
    if (window.ElMessage) {
      window.ElMessage.error(message)
    } else if (window.console) {
      console.error('❌ [生产环境]', message)
    }
  }

  /**
   * 执行系统健康检查（仅开发环境）
   */
  async performHealthCheck() {
    if (!this.isDevelopment) {
      return { healthy: true, message: '生产环境跳过详细健康检查' }
    }
    
    const checks = {
      // 检查图形实例
      graphInstance: () => {
        return window.taskFlowGraph && typeof window.taskFlowGraph.getNodes === 'function'
      },
      
      // 检查节点操作实例
      nodeOperations: () => {
        return window.nodeOperations && typeof window.nodeOperations.createNode === 'function'
      },
      
      // 检查配置抽屉
      configDrawers: () => {
        return window.configDrawers && window.configDrawers.value
      },
      
      // 检查结构化布局
      structuredLayout: () => {
        return window.configDrawers?.value?.structuredLayout
      },
      
      // 检查统一预览线管理器
      unifiedPreviewManager: () => {
        return window.unifiedPreviewLineManager && 
               typeof window.unifiedPreviewLineManager.onNodeConfigured === 'function'
      },
      
      // 检查布局引擎
      layoutEngine: () => {
        return window.layoutEngineInitialized === true
      }
    }

    const results = {}
    const issues = []

    for (const [checkName, checkFn] of Object.entries(checks)) {
      try {
        const result = checkFn()
        results[checkName] = result
        
        if (!result) {
          issues.push(checkName)
        }
      } catch (error) {
        results[checkName] = false
        issues.push(checkName)
        if (this.config.enableDetailedLogging) {
          console.warn(`⚠️ [开发检查] ${checkName} 检查失败:`, error.message)
        }
      }
    }

    return {
      healthy: issues.length === 0,
      issues,
      results,
      timestamp: Date.now(),
      environment: 'development'
    }
  }

  /**
   * 执行自动修复
   */
  async executeAutoRepair(issues) {
    const repairStrategies = {
      graphInstance: async () => {
        console.log('🔧 [修复] 重新初始化图形实例')
        if (window.initializeGraph && typeof window.initializeGraph === 'function') {
          await window.initializeGraph()
          return { success: true, message: '图形实例重新初始化完成' }
        }
        throw new Error('initializeGraph 函数不可用')
      },

      nodeOperations: async () => {
        console.log('🔧 [修复] 重新初始化节点操作')
        if (window.initializeNodeOperations && typeof window.initializeNodeOperations === 'function') {
          await window.initializeNodeOperations()
          return { success: true, message: '节点操作重新初始化完成' }
        }
        throw new Error('initializeNodeOperations 函数不可用')
      },

      configDrawers: async () => {
        console.log('🔧 [修复] 重新初始化配置抽屉')
        if (window.initializeConfigDrawers && typeof window.initializeConfigDrawers === 'function') {
          await window.initializeConfigDrawers()
          return { success: true, message: '配置抽屉重新初始化完成' }
        }
        throw new Error('initializeConfigDrawers 函数不可用')
      },

      structuredLayout: async () => {
        console.log('🔧 [修复] 重新初始化结构化布局')
        // 确保配置抽屉存在
        if (!window.configDrawers?.value) {
          await repairStrategies.configDrawers()
        }
        
        if (window.configDrawers?.value?.structuredLayout) {
          return { success: true, message: '结构化布局已存在' }
        }
        
        throw new Error('结构化布局初始化失败')
      },

      unifiedPreviewManager: async () => {
        console.log('🔧 [修复] 重新设置统一预览线管理器')
        
        // 确保结构化布局存在
        if (!window.configDrawers?.value?.structuredLayout) {
          await repairStrategies.structuredLayout()
        }
        
        const structuredLayout = window.configDrawers.value.structuredLayout
        if (structuredLayout?.unifiedPreviewManager?.value) {
          window.unifiedPreviewLineManager = structuredLayout.unifiedPreviewManager.value
          return { success: true, message: '统一预览线管理器设置完成' }
        }
        
        throw new Error('统一预览线管理器不可用')
      },

      layoutEngine: async () => {
        console.log('🔧 [修复] 重新初始化布局引擎')
        if (window.initializeLayoutEngineAfterDataLoad && typeof window.initializeLayoutEngineAfterDataLoad === 'function') {
          await window.initializeLayoutEngineAfterDataLoad()
          return { success: true, message: '布局引擎重新初始化完成' }
        }
        throw new Error('initializeLayoutEngineAfterDataLoad 函数不可用')
      }
    }

    const repairResults = []
    let overallSuccess = true

    for (const issue of issues) {
      if (repairStrategies[issue]) {
        try {
          const result = await this.executeWithRetry(
            repairStrategies[issue],
            this.config.maxRetries
          )
          repairResults.push({ issue, success: true, result })
          console.log(`✅ [修复] ${issue} 修复成功`)
        } catch (error) {
          repairResults.push({ issue, success: false, error: error.message })
          console.error(`❌ [修复] ${issue} 修复失败:`, error.message)
          overallSuccess = false
        }
      } else {
        console.warn(`⚠️ [修复] 未找到 ${issue} 的修复策略`)
        overallSuccess = false
      }
    }

    return {
      success: overallSuccess,
      results: repairResults,
      timestamp: Date.now()
    }
  }

  /**
   * 带重试的执行函数
   */
  async executeWithRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        return result
      } catch (error) {
        console.warn(`🔄 [重试] 第${attempt}次尝试失败:`, error.message)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // 指数退避延迟
        const delay = Math.pow(2, attempt - 1) * this.config.retryDelay
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * 启动定期健康检查（仅开发环境）
   */
  startPeriodicHealthCheck() {
    if (!this.isDevelopment || this.config.healthCheckInterval <= 0) {
      return
    }
    
    setInterval(() => {
      this.performHealthCheckAndRepair()
    }, this.config.healthCheckInterval)
    
    console.log(`⏰ [开发环境] 定期健康检查已启动，间隔: ${this.config.healthCheckInterval}ms`)
  }

  /**
   * 设置错误监听器
   */
  setupErrorListeners() {
    // 监听全局错误
    window.addEventListener('error', (event) => {
      this.handleError('JavaScript Error', event.error)
    })

    // 监听未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('Unhandled Promise Rejection', event.reason)
    })

    console.log('👂 [自动修复系统] 错误监听器已设置')
  }

  /**
   * 处理错误事件（环境分离）
   */
  async handleError(type, error) {
    const errorMessage = error?.message || error?.toString() || ''
    
    if (this.isDevelopment) {
      // 开发环境：详细错误处理和自动修复
      console.error(`🚨 [开发错误] ${type}:`, error)
      
      const knownErrors = [
        '布局引擎未完全初始化',
        '统一预览线管理器不存在',
        '实例创建失败',
        '图形实例不存在',
        '找不到节点',
        'Cannot read properties of undefined',
        'Cannot read properties of null',
        'TypeError: Cannot read property',
        'ReferenceError',
        'performLoadCompleteCheck is not a function',
        'setLayoutEngine is not a function',
        'linkLayoutEngineAndPreviewManager',
        'createLayoutEngineInstance',
        'initializeLayoutEngine'
      ]
      
      const isKnownError = knownErrors.some(knownError => 
        errorMessage.includes(knownError)
      )
      
      if (isKnownError && this.config.enableAutoRepair) {
        console.log('🔧 [开发修复] 检测到可修复错误，触发自动修复')
        
        // 延迟执行修复，避免频繁触发
        setTimeout(() => {
          this.performHealthCheckAndRepair()
        }, 1000)
      }
    } else {
      // 生产环境：简化错误处理
      console.error(`❌ [生产错误] ${type}:`, errorMessage)
      
      // 发送错误报告到监控系统
      if (window.errorReporting) {
        window.errorReporting.report({
          type,
          message: errorMessage,
          timestamp: Date.now()
        })
      }
      
      // 显示用户友好的错误提示
      this.showProductionErrorGuidance()
    }
  }

  /**
   * 获取修复历史
   */
  getRepairHistory() {
    return this.repairHistory
  }

  /**
   * 获取系统状态
   */
  async getSystemStatus() {
    const healthStatus = await this.performHealthCheck()
    
    return {
      healthy: healthStatus.healthy,
      issues: healthStatus.issues,
      repairHistory: this.repairHistory,
      isRepairing: this.isRepairing,
      config: this.config
    }
  }
}

// 导出自动修复系统
window.TaskFlowAutoRepairSystem = TaskFlowAutoRepairSystem

// 自动启动修复系统
if (typeof window !== 'undefined') {
  window.taskFlowAutoRepair = new TaskFlowAutoRepairSystem()
  
  // 等待TaskFlowCanvas组件挂载后再启动
  const waitForTaskFlowCanvas = () => {
    // 检查TaskFlowCanvas组件是否已挂载（通过检查暴露的函数）
    if (window.initializeLayoutEngineAfterDataLoad && 
        window.initializeGraph && 
        window.initializeNodeOperations && 
        window.initializeConfigDrawers) {
      console.log('🎯 [自动修复系统] TaskFlowCanvas组件已挂载，开始初始化')
      window.taskFlowAutoRepair.initialize()
    } else {
      // 每500ms检查一次，最多等待30秒
      setTimeout(waitForTaskFlowCanvas, 500)
    }
  }
  
  // 在 DOM 加载完成后开始等待TaskFlowCanvas
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForTaskFlowCanvas)
  } else {
    waitForTaskFlowCanvas()
  }
}