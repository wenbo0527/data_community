/**
 * P02任务实现：初始化管理器
 * 解决初始化重复调用导致状态不一致问题
 * 提供单例模式和初始化锁机制
 */

import { UnifiedStructuredLayoutEngine } from './UnifiedStructuredLayoutEngine.js'
import { HierarchyLayoutEngine } from '../composables/layout/HierarchyLayoutEngine.js'

/**
 * 初始化状态枚举
 */
export const InitializationState = {
  NOT_INITIALIZED: 'not-initialized',
  INITIALIZING: 'initializing',
  INITIALIZED: 'initialized',
  FAILED: 'failed'
}

/**
 * 初始化管理器 - 单例模式
 * 负责管理所有组件的初始化状态，防止重复初始化
 */
export class InitializationManager {
  static #instance = null
  static #initializationLock = new Map() // 初始化锁
  
  constructor() {
    if (InitializationManager.#instance) {
      return InitializationManager.#instance
    }
    
    // 初始化状态管理
    this.#initializationStates = new Map()
    this.#initializationResults = new Map()
    this.#initializationPromises = new Map()
    
    // 组件实例缓存
    this.#componentInstances = new Map()
    
    // 配置管理
    this.#configurations = new Map()
    
    // 调试模式
    this.#debugMode = process.env.NODE_ENV === 'development'
    
    InitializationManager.#instance = this
  }
  
  /**
   * 获取单例实例
   * @returns {InitializationManager}
   */
  static getInstance() {
    if (!InitializationManager.#instance) {
      InitializationManager.#instance = new InitializationManager()
    }
    return InitializationManager.#instance
  }
  
  /**
   * 重置单例实例（仅用于测试）
   */
  static resetInstance() {
    InitializationManager.#instance = null
    InitializationManager.#initializationLock.clear()
  }
  
  // 私有属性
  #initializationStates
  #initializationResults
  #initializationPromises
  #componentInstances
  #configurations
  #debugMode
  
  /**
   * 安全初始化 - 带锁机制
   * @param {string} componentKey - 组件标识
   * @param {Function} initFunction - 初始化函数
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 初始化结果
   */
  async safeInitialize(componentKey, initFunction, options = {}) {
    const { force = false, timeout = 30000 } = options
    
    this.#log(`🔒 [初始化管理器] 开始安全初始化: ${componentKey}`, { force })
    
    // 检查是否已经初始化且不强制重新初始化
    if (!force && this.getInitializationState(componentKey) === InitializationState.INITIALIZED) {
      const cachedResult = this.#initializationResults.get(componentKey)
      this.#log(`♻️ [初始化管理器] 返回缓存结果: ${componentKey}`)
      return {
        ...cachedResult,
        fromCache: true
      }
    }
    
    // 检查是否正在初始化
    if (this.#initializationPromises.has(componentKey)) {
      this.#log(`⏳ [初始化管理器] 等待正在进行的初始化: ${componentKey}`)
      return await this.#initializationPromises.get(componentKey)
    }
    
    // 创建初始化Promise
    const initPromise = this.#executeInitialization(componentKey, initFunction, timeout)
    this.#initializationPromises.set(componentKey, initPromise)
    
    try {
      const result = await initPromise
      return result
    } finally {
      // 清理Promise缓存
      this.#initializationPromises.delete(componentKey)
    }
  }
  
  /**
   * 执行初始化
   * @param {string} componentKey - 组件标识
   * @param {Function} initFunction - 初始化函数
   * @param {number} timeout - 超时时间
   * @returns {Promise<Object>} 初始化结果
   */
  async #executeInitialization(componentKey, initFunction, timeout) {
    this.setInitializationState(componentKey, InitializationState.INITIALIZING)
    
    try {
      // 设置超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`初始化超时: ${componentKey}`)), timeout)
      })
      
      // 执行初始化
      const result = await Promise.race([
        initFunction(),
        timeoutPromise
      ])
      
      // 标记为已初始化
      this.setInitializationState(componentKey, InitializationState.INITIALIZED)
      
      // 缓存结果
      const finalResult = {
        success: true,
        componentKey,
        timestamp: Date.now(),
        fromCache: false,
        ...result
      }
      
      this.#initializationResults.set(componentKey, finalResult)
      
      this.#log(`✅ [初始化管理器] 初始化成功: ${componentKey}`)
      return finalResult
      
    } catch (error) {
      // 标记为失败
      this.setInitializationState(componentKey, InitializationState.FAILED)
      
      const errorResult = {
        success: false,
        componentKey,
        error: error.message,
        timestamp: Date.now()
      }
      
      this.#initializationResults.set(componentKey, errorResult)
      
      this.#log(`❌ [初始化管理器] 初始化失败: ${componentKey}`, error)
      return errorResult
    }
  }
  
  /**
   * 初始化布局引擎
   * @param {Object} graph - 图实例
   * @param {Object} config - 配置
   * @returns {Promise<Object>} 初始化结果
   */
  async initializeLayoutEngine(graph, config = {}) {
    const componentKey = 'layout-engine'
    
    return await this.safeInitialize(componentKey, async () => {
      this.#log(`🏗️ [布局引擎初始化] 开始初始化布局引擎`, config)
      
      if (!graph) {
        throw new Error('Graph实例不能为空')
      }
      
      const engineType = config.layoutEngine || 'unified'
      let layoutEngine
      
      // 创建布局引擎实例
      if (engineType === 'hierarchy' && config.enableHierarchyEngine) {
        layoutEngine = new HierarchyLayoutEngine(graph, {
          layer: {
            baseHeight: config.levelHeight || 200,
            dynamicSpacing: true,
            maxLayers: 10,
            tolerance: 20
          },
          node: {
            minSpacing: (config.nodeSpacing || 200) * 0.6,
            preferredSpacing: config.nodeSpacing || 200,
            maxSpacing: (config.nodeSpacing || 200) * 1.5,
            endpointSize: { width: 20, height: 20 }
          },
          hierarchy: {
            algorithm: 'compactBox',
            direction: config.layoutDirection || 'TB',
            getHGap: () => config.nodeSpacing || 200,
            getVGap: () => config.levelHeight || 200,
            enableOptimization: true
          },
          optimization: {
            enableGlobalOptimization: true,
            maxIterations: 3,
            convergenceThreshold: 0.01,
            enableAestheticOptimization: true,
            enableEndpointIntegration: true
          },
          performance: {
            enableParallelProcessing: false,
            batchSize: 50,
            enableCaching: true
          }
        })
      } else {
        layoutEngine = new UnifiedStructuredLayoutEngine(graph, {
          layer: {
            baseHeight: config.levelHeight || 150,
            dynamicSpacing: true,
            maxLayers: 10,
            tolerance: 20
          },
          node: {
            minSpacing: (config.nodeSpacing || 180) * 0.6,
            preferredSpacing: config.nodeSpacing || 180,
            maxSpacing: (config.nodeSpacing || 180) * 1.5,
            endpointSize: { width: 20, height: 20 }
          },
          optimization: {
            enableGlobalOptimization: true,
            maxIterations: 5,
            convergenceThreshold: 0.01,
            enableAestheticOptimization: true,
            enableEndpointIntegration: true
          },
          performance: {
            enableParallelProcessing: false,
            batchSize: 50,
            enableCaching: true
          }
        })
      }
      
      // 缓存实例
      this.#componentInstances.set(componentKey, layoutEngine)
      this.#configurations.set(componentKey, config)
      
      // 设置全局引用
      if (typeof window !== 'undefined') {
        window.layoutEngine = layoutEngine
      }
      
      this.#log(`✅ [布局引擎初始化] 布局引擎初始化完成: ${engineType}`)
      
      return {
        layoutEngine,
        engineType,
        config
      }
    })
  }
  
  /**
   * 初始化预览线管理器
   * @param {Object} graph - 图实例
   * @param {Object} config - 配置
   * @returns {Promise<Object>} 初始化结果
   */
  async initializePreviewManager(graph, config = {}) {
    const componentKey = 'preview-manager'
    
    return await this.safeInitialize(componentKey, async () => {
      this.#log(`🔧 [预览线管理器初始化] 开始初始化预览线管理器`, config)
      
      if (!graph) {
        throw new Error('Graph实例不能为空')
      }
      
      // 获取布局引擎实例
      const layoutEngine = this.#componentInstances.get('layout-engine')
      
      // 创建基础预览线管理器实现
      const previewManager = {
        graph,
        layoutEngine,
        config: config.layoutConfig || {},
        direction: config.layoutDirection || 'TB',
        isReady: () => true,
        setLayoutEngine: (engine) => { previewManager.layoutEngine = engine }
      }
      
      // 如果有布局引擎，建立关联
      if (layoutEngine && previewManager.setLayoutEngine) {
        previewManager.setLayoutEngine(layoutEngine)
      }
      
      // 缓存实例
      this.#componentInstances.set(componentKey, previewManager)
      this.#configurations.set(componentKey, config)
      
      this.#log(`✅ [预览线管理器初始化] 预览线管理器初始化完成`)
      
      return {
        previewManager,
        hasLayoutEngine: !!layoutEngine,
        config
      }
    })
  }
  
  /**
   * 获取组件实例
   * @param {string} componentKey - 组件标识
   * @returns {Object|null} 组件实例
   */
  getComponentInstance(componentKey) {
    return this.#componentInstances.get(componentKey) || null
  }
  
  /**
   * 获取初始化状态
   * @param {string} componentKey - 组件标识
   * @returns {string} 初始化状态
   */
  getInitializationState(componentKey) {
    return this.#initializationStates.get(componentKey) || InitializationState.NOT_INITIALIZED
  }
  
  /**
   * 设置初始化状态
   * @param {string} componentKey - 组件标识
   * @param {string} state - 状态
   */
  setInitializationState(componentKey, state) {
    this.#initializationStates.set(componentKey, state)
    this.#log(`📊 [状态管理] ${componentKey}: ${state}`)
  }
  
  /**
   * 获取初始化报告
   * @returns {Object} 初始化状态报告
   */
  getInitializationReport() {
    const states = Array.from(this.#initializationStates.values())
    
    return {
      total: states.length,
      initialized: states.filter(s => s === InitializationState.INITIALIZED).length,
      initializing: states.filter(s => s === InitializationState.INITIALIZING).length,
      failed: states.filter(s => s === InitializationState.FAILED).length,
      notInitialized: states.filter(s => s === InitializationState.NOT_INITIALIZED).length,
      details: Object.fromEntries(this.#initializationStates.entries())
    }
  }
  
  /**
   * 清理失败的初始化状态
   * @param {string} componentKey - 组件标识
   */
  clearFailedState(componentKey) {
    if (this.getInitializationState(componentKey) === InitializationState.FAILED) {
      this.#initializationStates.delete(componentKey)
      this.#initializationResults.delete(componentKey)
      this.#componentInstances.delete(componentKey)
      this.#log(`🧹 [状态清理] 已清理失败状态: ${componentKey}`)
    }
  }
  
  /**
   * 重置所有状态
   */
  resetAll() {
    this.#initializationStates.clear()
    this.#initializationResults.clear()
    this.#initializationPromises.clear()
    this.#componentInstances.clear()
    this.#configurations.clear()
    this.#log(`🔄 [全局重置] 所有初始化状态已重置`)
  }
  
  /**
   * 调试日志
   * @param {string} message - 消息
   * @param {*} data - 数据
   */
  #log(message, data = null) {
    if (this.#debugMode) {
      if (data) {
        console.log(message, data)
      } else {
        console.log(message)
      }
    }
  }
}

// 导出单例实例
export const initializationManager = InitializationManager.getInstance()