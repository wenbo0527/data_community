/**
 * 依赖关系优化器
 * 用于分析和优化模块间的依赖关系，减少循环依赖和不必要的导入
 */

import { EventBus } from './EventBus.js'

/**
 * 优化结果对象
 */
class OptimizationResult {
  constructor(success = false, data = null, error = null, metadata = {}) {
    this.success = success
    this.data = data
    this.error = error
    this.metadata = {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  }

  static success(data, metadata = {}) {
    return new OptimizationResult(true, data, null, metadata)
  }

  static error(error, metadata = {}) {
    return new OptimizationResult(false, null, error, metadata)
  }
}

/**
 * 依赖关系优化器类
 */
class DependencyOptimizer {
  constructor() {
    this.eventBus = new EventBus()
    this.isInitialized = false
    this.optimizationRules = new Map()
    this.dependencyMap = new Map()
    this.circularDependencies = []
    this.unnecessaryImports = []
    this.layerViolations = []
    
    this.initializeOptimizationRules()
  }

  /**
   * 初始化优化规则
   */
  initializeOptimizationRules() {
    try {
      // 层级规则：定义模块层级关系
      this.optimizationRules.set('layers', {
        'components': { level: 1, canImportFrom: ['composables', 'utils', 'services', 'constants', 'types'] },
        'composables': { level: 2, canImportFrom: ['utils', 'services', 'constants', 'types'] },
        'services': { level: 3, canImportFrom: ['utils', 'constants', 'types'] },
        'utils': { level: 4, canImportFrom: ['constants', 'types'] },
        'constants': { level: 5, canImportFrom: ['types'] },
        'types': { level: 6, canImportFrom: [] }
      })

      // 导入规则：定义允许的导入模式
      this.optimizationRules.set('imports', {
        // 禁止的导入模式
        forbidden: [
          /\.\.\/\.\.\/\.\.\/\.\.\//, // 超过3级的相对路径
          /components.*components/, // 组件间直接导入
          /services.*components/    // 服务层导入组件层
        ],
        // 推荐的导入模式
        recommended: [
          /^@\//, // 绝对路径导入
          /^\.\//, // 同级导入
          /^\.\.\/(?!.*\.\.\/)/ // 最多一级父级导入
        ]
      })

      // 重构建议规则
      this.optimizationRules.set('refactoring', {
        // 需要重构的文件大小阈值
        fileSizeThreshold: 500, // 行数
        // 需要重构的依赖数量阈值
        dependencyThreshold: 15,
        // 需要重构的循环依赖阈值
        circularDependencyThreshold: 3
      })

      this.isInitialized = true
      this.eventBus.emit('optimizer:initialized', { timestamp: new Date().toISOString() })

    } catch (error) {
      console.error('优化规则初始化失败:', error)
      throw error
    }
  }

  /**
   * 分析依赖关系
   */
  async analyzeDependencies(projectPath) {
    try {
      if (!this.isInitialized) {
        return OptimizationResult.error(new Error('优化器未初始化'))
      }

      this.eventBus.emit('analysis:started', { projectPath })

      // 扫描项目文件
      const files = await this.scanProjectFiles(projectPath)
      
      // 构建依赖映射
      await this.buildDependencyMap(files)
      
      // 检测循环依赖
      this.detectCircularDependencies()
      
      // 检测不必要的导入
      this.detectUnnecessaryImports()
      
      // 检测层级违规
      this.detectLayerViolations()

      const analysisResult = {
        totalFiles: files.length,
        dependencyMap: this.dependencyMap,
        circularDependencies: this.circularDependencies,
        unnecessaryImports: this.unnecessaryImports,
        layerViolations: this.layerViolations,
        healthScore: this.calculateHealthScore()
      }

      this.eventBus.emit('analysis:completed', analysisResult)
      return OptimizationResult.success(analysisResult)

    } catch (error) {
      this.eventBus.emit('analysis:error', { error: error.message })
      return OptimizationResult.error(error)
    }
  }

  /**
   * 扫描项目文件
   */
  async scanProjectFiles(projectPath) {
    // 模拟文件扫描（实际实现需要使用文件系统API）
    const mockFiles = [
      'components/TaskFlowCanvasRefactored.vue',
      'components/TaskFlowCanvas.vue',
      'services/GraphService.js',
      'services/LayoutService.js',
      'services/EventService.js',
      'utils/canvas/NodeConfigManager.js',
      'utils/canvas/CoordinateSystemManager.js',
      'composables/useCanvasCore.js',
      'composables/useCanvasState.js'
    ]
    
    return mockFiles.map(file => ({
      path: file,
      layer: this.getFileLayer(file),
      imports: this.extractImports(file)
    }))
  }

  /**
   * 获取文件所属层级
   */
  getFileLayer(filePath) {
    if (filePath.includes('components/')) return 'components'
    if (filePath.includes('composables/')) return 'composables'
    if (filePath.includes('services/')) return 'services'
    if (filePath.includes('utils/')) return 'utils'
    if (filePath.includes('constants/')) return 'constants'
    if (filePath.includes('types/')) return 'types'
    return 'unknown'
  }

  /**
   * 提取文件导入
   */
  extractImports(filePath) {
    // 模拟导入提取（实际实现需要解析文件内容）
    const mockImports = {
      'components/TaskFlowCanvasRefactored.vue': [
        '../services/GraphService.js',
        '../utils/canvas/NodeConfigManager.js',
        '../composables/useCanvasCore.js'
      ],
      'services/GraphService.js': [
        '../utils/canvas/CoordinateSystemManager.js',
        '../utils/EventBus.js'
      ]
    }
    
    return mockImports[filePath] || []
  }

  /**
   * 构建依赖映射
   */
  async buildDependencyMap(files) {
    this.dependencyMap.clear()
    
    for (const file of files) {
      const dependencies = file.imports.map(imp => this.resolvePath(imp, file.path))
      this.dependencyMap.set(file.path, {
        layer: file.layer,
        dependencies,
        dependents: []
      })
    }

    // 构建反向依赖关系
    for (const [filePath, fileInfo] of this.dependencyMap) {
      for (const dep of fileInfo.dependencies) {
        const depInfo = this.dependencyMap.get(dep)
        if (depInfo) {
          depInfo.dependents.push(filePath)
        }
      }
    }
  }

  /**
   * 解析相对路径
   */
  resolvePath(importPath, currentFile) {
    // 简化的路径解析逻辑
    if (importPath.startsWith('./')) {
      return importPath.replace('./', currentFile.split('/').slice(0, -1).join('/') + '/')
    }
    if (importPath.startsWith('../')) {
      const levels = (importPath.match(/\.\.\//g) || []).length
      const currentDir = currentFile.split('/').slice(0, -1)
      const targetDir = currentDir.slice(0, -levels)
      const fileName = importPath.replace(/\.\.\//g, '')
      return targetDir.join('/') + '/' + fileName
    }
    return importPath
  }

  /**
   * 检测循环依赖
   */
  detectCircularDependencies() {
    this.circularDependencies = []
    const visited = new Set()
    const recursionStack = new Set()

    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        // 发现循环依赖
        const cycleStart = path.indexOf(node)
        const cycle = path.slice(cycleStart).concat([node])
        this.circularDependencies.push({
          cycle,
          severity: cycle.length > 3 ? 'high' : 'medium'
        })
        return
      }

      if (visited.has(node)) return

      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      const nodeInfo = this.dependencyMap.get(node)
      if (nodeInfo) {
        for (const dep of nodeInfo.dependencies) {
          dfs(dep, [...path])
        }
      }

      recursionStack.delete(node)
      path.pop()
    }

    for (const node of this.dependencyMap.keys()) {
      if (!visited.has(node)) {
        dfs(node)
      }
    }
  }

  /**
   * 检测不必要的导入
   */
  detectUnnecessaryImports() {
    this.unnecessaryImports = []
    
    for (const [filePath, fileInfo] of this.dependencyMap) {
      // 检测重复导入
      const duplicates = this.findDuplicateImports(fileInfo.dependencies)
      if (duplicates.length > 0) {
        this.unnecessaryImports.push({
          file: filePath,
          type: 'duplicate',
          imports: duplicates,
          suggestion: '移除重复的导入语句'
        })
      }

      // 检测过深的相对路径导入
      const deepImports = fileInfo.dependencies.filter(dep => 
        (dep.match(/\.\.\//g) || []).length > 2
      )
      if (deepImports.length > 0) {
        this.unnecessaryImports.push({
          file: filePath,
          type: 'deep_relative',
          imports: deepImports,
          suggestion: '使用绝对路径或重新组织模块结构'
        })
      }
    }
  }

  /**
   * 查找重复导入
   */
  findDuplicateImports(imports) {
    const seen = new Set()
    const duplicates = []
    
    for (const imp of imports) {
      const normalized = this.normalizeImportPath(imp)
      if (seen.has(normalized)) {
        duplicates.push(imp)
      } else {
        seen.add(normalized)
      }
    }
    
    return duplicates
  }

  /**
   * 标准化导入路径
   */
  normalizeImportPath(importPath) {
    return importPath.replace(/\\/g, '/').replace(/\/+/g, '/')
  }

  /**
   * 检测层级违规
   */
  detectLayerViolations() {
    this.layerViolations = []
    const layers = this.optimizationRules.get('layers')

    for (const [filePath, fileInfo] of this.dependencyMap) {
      const currentLayer = fileInfo.layer
      const layerConfig = layers[currentLayer]
      
      if (!layerConfig) continue

      for (const dep of fileInfo.dependencies) {
        const depInfo = this.dependencyMap.get(dep)
        if (!depInfo) continue

        const depLayer = depInfo.layer
        
        // 检查是否违反层级规则
        if (!layerConfig.canImportFrom.includes(depLayer)) {
          this.layerViolations.push({
            file: filePath,
            layer: currentLayer,
            violatingImport: dep,
            violatingLayer: depLayer,
            severity: this.calculateViolationSeverity(currentLayer, depLayer),
            suggestion: this.generateLayerViolationSuggestion(currentLayer, depLayer)
          })
        }
      }
    }
  }

  /**
   * 计算违规严重程度
   */
  calculateViolationSeverity(fromLayer, toLayer) {
    const layers = this.optimizationRules.get('layers')
    const fromLevel = layers[fromLayer]?.level || 0
    const toLevel = layers[toLayer]?.level || 0
    
    if (fromLevel > toLevel) return 'high' // 低层级导入高层级
    if (fromLevel === toLevel) return 'medium' // 同层级导入
    return 'low' // 正常的高层级导入低层级
  }

  /**
   * 生成层级违规建议
   */
  generateLayerViolationSuggestion(fromLayer, toLayer) {
    if (fromLayer === 'services' && toLayer === 'components') {
      return '服务层不应直接导入组件层，考虑使用事件总线或依赖注入'
    }
    if (fromLayer === 'utils' && toLayer === 'services') {
      return '工具层不应导入服务层，考虑将逻辑移至服务层或使用回调函数'
    }
    return `${fromLayer}层不应导入${toLayer}层，请重新设计模块结构`
  }

  /**
   * 计算健康分数
   */
  calculateHealthScore() {
    let score = 100
    
    // 循环依赖扣分
    score -= this.circularDependencies.length * 15
    
    // 不必要导入扣分
    score -= this.unnecessaryImports.length * 5
    
    // 层级违规扣分
    const highSeverityViolations = this.layerViolations.filter(v => v.severity === 'high').length
    const mediumSeverityViolations = this.layerViolations.filter(v => v.severity === 'medium').length
    
    score -= highSeverityViolations * 10
    score -= mediumSeverityViolations * 5
    
    return Math.max(0, score)
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions() {
    const suggestions = []

    // 循环依赖建议
    if (this.circularDependencies.length > 0) {
      suggestions.push({
        type: 'circular_dependency',
        priority: 'high',
        title: '解决循环依赖',
        description: `发现${this.circularDependencies.length}个循环依赖，建议重构模块结构`,
        actions: [
          '提取公共接口或抽象层',
          '使用事件总线解耦',
          '重新设计模块职责边界'
        ]
      })
    }

    // 层级违规建议
    const highViolations = this.layerViolations.filter(v => v.severity === 'high')
    if (highViolations.length > 0) {
      suggestions.push({
        type: 'layer_violation',
        priority: 'high',
        title: '修复层级违规',
        description: `发现${highViolations.length}个严重的层级违规`,
        actions: [
          '重新组织模块结构',
          '使用依赖注入模式',
          '建立清晰的接口契约'
        ]
      })
    }

    // 不必要导入建议
    if (this.unnecessaryImports.length > 0) {
      suggestions.push({
        type: 'unnecessary_import',
        priority: 'medium',
        title: '清理不必要的导入',
        description: `发现${this.unnecessaryImports.length}个不必要的导入`,
        actions: [
          '移除重复导入',
          '使用绝对路径替代深层相对路径',
          '整理导入语句顺序'
        ]
      })
    }

    return suggestions
  }

  /**
   * 执行自动优化
   */
  async executeOptimization(optimizationPlan) {
    try {
      this.eventBus.emit('optimization:started', { plan: optimizationPlan })

      const results = []

      for (const action of optimizationPlan.actions) {
        const result = await this.executeOptimizationAction(action)
        results.push(result)
      }

      this.eventBus.emit('optimization:completed', { results })
      return OptimizationResult.success(results)

    } catch (error) {
      this.eventBus.emit('optimization:error', { error: error.message })
      return OptimizationResult.error(error)
    }
  }

  /**
   * 执行单个优化动作
   */
  async executeOptimizationAction(action) {
    switch (action.type) {
      case 'remove_duplicate_imports':
        return this.removeDuplicateImports(action.target)
      
      case 'convert_relative_paths':
        return this.convertRelativePaths(action.target)
      
      case 'extract_common_interface':
        return this.extractCommonInterface(action.target)
      
      default:
        throw new Error(`未知的优化动作类型: ${action.type}`)
    }
  }

  /**
   * 移除重复导入
   */
  async removeDuplicateImports(target) {
    // 实际实现需要文件操作
    return {
      type: 'remove_duplicate_imports',
      target,
      success: true,
      message: '已移除重复导入'
    }
  }

  /**
   * 转换相对路径
   */
  async convertRelativePaths(target) {
    // 实际实现需要文件操作
    return {
      type: 'convert_relative_paths',
      target,
      success: true,
      message: '已转换为绝对路径'
    }
  }

  /**
   * 提取公共接口
   */
  async extractCommonInterface(target) {
    // 实际实现需要代码生成
    return {
      type: 'extract_common_interface',
      target,
      success: true,
      message: '已提取公共接口'
    }
  }

  /**
   * 销毁优化器
   */
  destroy() {
    try {
      this.eventBus.emit('optimizer:destroying')
      
      this.dependencyMap.clear()
      this.circularDependencies = []
      this.unnecessaryImports = []
      this.layerViolations = []
      this.optimizationRules.clear()
      
      this.eventBus.removeAllListeners()
      this.isInitialized = false
      
      this.eventBus.emit('optimizer:destroyed')
    } catch (error) {
      console.error('优化器销毁失败:', error)
    }
  }
}

/**
 * 创建依赖关系优化器实例
 */
export function createDependencyOptimizer() {
  return new DependencyOptimizer()
}

/**
 * 导出类和工具函数
 */
export {
  DependencyOptimizer,
  OptimizationResult
}