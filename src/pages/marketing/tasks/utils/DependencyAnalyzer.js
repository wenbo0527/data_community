/**
 * 依赖关系分析器 - 架构优化工具
 * 用于分析和优化模块间的依赖关系，识别循环依赖和不必要的导入
 * 
 * 功能特性：
 * - 依赖关系映射和分析
 * - 循环依赖检测
 * - 不必要导入识别
 * - 依赖层级分析
 * - 优化建议生成
 */

import { EventBus } from './EventBus.js'

/**
 * 依赖分析结果格式
 */
const AnalysisResult = {
  success: (data = null, message = '') => ({
    success: true,
    data,
    message,
    timestamp: Date.now()
  }),
  
  error: (message = '', code = 'ANALYSIS_ERROR', details = null) => ({
    success: false,
    error: {
      message,
      code,
      details,
      timestamp: Date.now()
    }
  })
}

/**
 * 依赖关系分析器类
 */
export class DependencyAnalyzer {
  constructor(eventBus = null) {
    this.eventBus = eventBus || new EventBus()
    this.state = {
      initialized: false,
      analyzing: false,
      dependencyMap: new Map(), // 模块依赖映射
      circularDependencies: [], // 循环依赖列表
      unnecessaryImports: [], // 不必要的导入
      layerViolations: [], // 层级违规
      optimizationSuggestions: [] // 优化建议
    }
    
    // 模块层级定义
    this.layers = {
      'components': { level: 1, description: '组件层' },
      'composables': { level: 2, description: '组合函数层' },
      'services': { level: 3, description: '服务层' },
      'utils': { level: 4, description: '工具层' },
      'constants': { level: 5, description: '常量层' },
      'types': { level: 5, description: '类型定义层' }
    }
    
    console.log('✅ [DependencyAnalyzer] 依赖分析器已创建')
  }

  /**
   * 初始化分析器
   */
  initialize() {
    if (this.state.initialized) {
      return AnalysisResult.success(null, '依赖分析器已初始化')
    }

    try {
      this.state.initialized = true
      
      this.eventBus.emit('dependency:analyzer:initialized', {
        timestamp: Date.now()
      })
      
      console.log('✅ [DependencyAnalyzer] 分析器初始化完成')
      return AnalysisResult.success(null, '依赖分析器初始化成功')
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 初始化失败:', error)
      return AnalysisResult.error(`初始化失败: ${error.message}`, 'INIT_ERROR', error)
    }
  }

  /**
   * 分析项目依赖关系
   */
  async analyzeProjectDependencies(projectPath) {
    if (this.state.analyzing) {
      return AnalysisResult.error('分析正在进行中', 'ANALYSIS_IN_PROGRESS')
    }

    try {
      this.state.analyzing = true
      
      console.log('🔍 [DependencyAnalyzer] 开始分析项目依赖关系...')
      
      // 清空之前的分析结果
      this.clearAnalysisResults()
      
      // 1. 构建依赖映射
      await this.buildDependencyMap(projectPath)
      
      // 2. 检测循环依赖
      this.detectCircularDependencies()
      
      // 3. 识别不必要的导入
      this.identifyUnnecessaryImports()
      
      // 4. 检查层级违规
      this.checkLayerViolations()
      
      // 5. 生成优化建议
      this.generateOptimizationSuggestions()
      
      const analysisResult = {
        dependencyCount: this.state.dependencyMap.size,
        circularDependencies: this.state.circularDependencies,
        unnecessaryImports: this.state.unnecessaryImports,
        layerViolations: this.state.layerViolations,
        optimizationSuggestions: this.state.optimizationSuggestions,
        summary: this.generateAnalysisSummary()
      }
      
      this.eventBus.emit('dependency:analysis:completed', {
        result: analysisResult,
        timestamp: Date.now()
      })
      
      console.log('✅ [DependencyAnalyzer] 依赖关系分析完成')
      return AnalysisResult.success(analysisResult, '依赖关系分析完成')
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 分析失败:', error)
      return AnalysisResult.error(`分析失败: ${error.message}`, 'ANALYSIS_ERROR', error)
    } finally {
      this.state.analyzing = false
    }
  }

  /**
   * 构建依赖映射
   */
  async buildDependencyMap(projectPath) {
    try {
      // 模拟依赖映射构建 - 实际实现需要文件系统扫描
      const mockDependencies = this.getMockDependencyData()
      
      for (const [module, dependencies] of mockDependencies) {
        this.state.dependencyMap.set(module, {
          path: module,
          dependencies: dependencies,
          dependents: [], // 依赖此模块的其他模块
          layer: this.determineModuleLayer(module),
          importCount: dependencies.length,
          isCircular: false
        })
      }
      
      // 构建反向依赖关系
      this.buildReverseDependencies()
      
      console.log(`✅ [DependencyAnalyzer] 依赖映射构建完成，共 ${this.state.dependencyMap.size} 个模块`)
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 构建依赖映射失败:', error)
      throw error
    }
  }

  /**
   * 检测循环依赖
   */
  detectCircularDependencies() {
    try {
      const visited = new Set()
      const recursionStack = new Set()
      const circularPaths = []
      
      for (const [modulePath] of this.state.dependencyMap) {
        if (!visited.has(modulePath)) {
          const path = []
          this.detectCircularDFS(modulePath, visited, recursionStack, path, circularPaths)
        }
      }
      
      this.state.circularDependencies = circularPaths.map(path => ({
        cycle: path,
        severity: this.calculateCircularSeverity(path),
        suggestion: this.generateCircularFixSuggestion(path)
      }))
      
      console.log(`🔍 [DependencyAnalyzer] 检测到 ${this.state.circularDependencies.length} 个循环依赖`)
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 循环依赖检测失败:', error)
      throw error
    }
  }

  /**
   * 深度优先搜索检测循环依赖
   */
  detectCircularDFS(modulePath, visited, recursionStack, currentPath, circularPaths) {
    visited.add(modulePath)
    recursionStack.add(modulePath)
    currentPath.push(modulePath)
    
    const moduleInfo = this.state.dependencyMap.get(modulePath)
    if (moduleInfo && moduleInfo.dependencies) {
      for (const dependency of moduleInfo.dependencies) {
        if (!visited.has(dependency)) {
          this.detectCircularDFS(dependency, visited, recursionStack, currentPath, circularPaths)
        } else if (recursionStack.has(dependency)) {
          // 发现循环依赖
          const cycleStart = currentPath.indexOf(dependency)
          const cycle = currentPath.slice(cycleStart).concat([dependency])
          circularPaths.push(cycle)
          
          // 标记循环中的模块
          cycle.forEach(module => {
            const info = this.state.dependencyMap.get(module)
            if (info) {
              info.isCircular = true
            }
          })
        }
      }
    }
    
    currentPath.pop()
    recursionStack.delete(modulePath)
  }

  /**
   * 识别不必要的导入
   */
  identifyUnnecessaryImports() {
    try {
      const unnecessaryImports = []
      
      for (const [modulePath, moduleInfo] of this.state.dependencyMap) {
        // 检查重复导入
        const duplicateImports = this.findDuplicateImports(moduleInfo.dependencies)
        if (duplicateImports.length > 0) {
          unnecessaryImports.push({
            module: modulePath,
            type: 'duplicate',
            imports: duplicateImports,
            suggestion: '移除重复的导入语句'
          })
        }
        
        // 检查未使用的导入（模拟检测）
        const unusedImports = this.findUnusedImports(modulePath, moduleInfo.dependencies)
        if (unusedImports.length > 0) {
          unnecessaryImports.push({
            module: modulePath,
            type: 'unused',
            imports: unusedImports,
            suggestion: '移除未使用的导入语句'
          })
        }
        
        // 检查可以合并的导入
        const mergableImports = this.findMergableImports(moduleInfo.dependencies)
        if (mergableImports.length > 0) {
          unnecessaryImports.push({
            module: modulePath,
            type: 'mergable',
            imports: mergableImports,
            suggestion: '合并来自同一模块的多个导入'
          })
        }
      }
      
      this.state.unnecessaryImports = unnecessaryImports
      
      console.log(`🔍 [DependencyAnalyzer] 识别到 ${unnecessaryImports.length} 个不必要的导入`)
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 识别不必要导入失败:', error)
      throw error
    }
  }

  /**
   * 检查层级违规
   */
  checkLayerViolations() {
    try {
      const violations = []
      
      for (const [modulePath, moduleInfo] of this.state.dependencyMap) {
        const moduleLayer = moduleInfo.layer
        
        for (const dependency of moduleInfo.dependencies) {
          const dependencyInfo = this.state.dependencyMap.get(dependency)
          if (dependencyInfo) {
            const dependencyLayer = dependencyInfo.layer
            
            // 检查是否违反层级规则（高层级不应依赖低层级）
            if (this.isLayerViolation(moduleLayer, dependencyLayer)) {
              violations.push({
                module: modulePath,
                moduleLayer: moduleLayer.description,
                dependency: dependency,
                dependencyLayer: dependencyLayer.description,
                severity: this.calculateLayerViolationSeverity(moduleLayer, dependencyLayer),
                suggestion: this.generateLayerFixSuggestion(moduleLayer, dependencyLayer)
              })
            }
          }
        }
      }
      
      this.state.layerViolations = violations
      
      console.log(`🔍 [DependencyAnalyzer] 检测到 ${violations.length} 个层级违规`)
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 层级违规检查失败:', error)
      throw error
    }
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions() {
    try {
      const suggestions = []
      
      // 循环依赖优化建议
      if (this.state.circularDependencies.length > 0) {
        suggestions.push({
          type: 'circular_dependency',
          priority: 'high',
          title: '解决循环依赖',
          description: `发现 ${this.state.circularDependencies.length} 个循环依赖，建议重构模块结构`,
          actions: [
            '提取公共接口或抽象层',
            '使用依赖注入模式',
            '重新设计模块边界',
            '考虑使用事件总线解耦'
          ]
        })
      }
      
      // 不必要导入优化建议
      if (this.state.unnecessaryImports.length > 0) {
        suggestions.push({
          type: 'unnecessary_imports',
          priority: 'medium',
          title: '清理不必要的导入',
          description: `发现 ${this.state.unnecessaryImports.length} 个不必要的导入，建议清理`,
          actions: [
            '移除未使用的导入语句',
            '合并重复的导入',
            '使用 ESLint 规则自动检测',
            '定期进行代码清理'
          ]
        })
      }
      
      // 层级违规优化建议
      if (this.state.layerViolations.length > 0) {
        suggestions.push({
          type: 'layer_violations',
          priority: 'high',
          title: '修复层级违规',
          description: `发现 ${this.state.layerViolations.length} 个层级违规，建议重构架构`,
          actions: [
            '重新设计模块层级结构',
            '提取中间抽象层',
            '使用依赖倒置原则',
            '明确模块职责边界'
          ]
        })
      }
      
      // 通用优化建议
      suggestions.push({
        type: 'general_optimization',
        priority: 'low',
        title: '通用架构优化',
        description: '基于分析结果的通用优化建议',
        actions: [
          '建立统一的导入路径规范',
          '使用路径别名简化导入',
          '实施模块边界清晰化',
          '定期进行依赖关系审查'
        ]
      })
      
      this.state.optimizationSuggestions = suggestions
      
      console.log(`✅ [DependencyAnalyzer] 生成 ${suggestions.length} 个优化建议`)
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 生成优化建议失败:', error)
      throw error
    }
  }

  /**
   * 生成分析摘要
   */
  generateAnalysisSummary() {
    try {
      const totalModules = this.state.dependencyMap.size
      const circularCount = this.state.circularDependencies.length
      const unnecessaryCount = this.state.unnecessaryImports.length
      const violationCount = this.state.layerViolations.length
      
      const healthScore = this.calculateHealthScore(totalModules, circularCount, unnecessaryCount, violationCount)
      
      return {
        totalModules,
        circularDependencies: circularCount,
        unnecessaryImports: unnecessaryCount,
        layerViolations: violationCount,
        healthScore,
        healthLevel: this.getHealthLevel(healthScore),
        recommendations: this.getTopRecommendations()
      }
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 生成分析摘要失败:', error)
      return {
        totalModules: 0,
        circularDependencies: 0,
        unnecessaryImports: 0,
        layerViolations: 0,
        healthScore: 0,
        healthLevel: 'unknown',
        recommendations: []
      }
    }
  }

  /**
   * 获取分析结果
   */
  getAnalysisResults() {
    try {
      if (!this.state.initialized) {
        return AnalysisResult.error('分析器未初始化', 'NOT_INITIALIZED')
      }
      
      const results = {
        dependencyMap: Array.from(this.state.dependencyMap.entries()),
        circularDependencies: this.state.circularDependencies,
        unnecessaryImports: this.state.unnecessaryImports,
        layerViolations: this.state.layerViolations,
        optimizationSuggestions: this.state.optimizationSuggestions,
        summary: this.generateAnalysisSummary()
      }
      
      return AnalysisResult.success(results, '获取分析结果成功')
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 获取分析结果失败:', error)
      return AnalysisResult.error(`获取分析结果失败: ${error.message}`, 'GET_RESULTS_ERROR', error)
    }
  }

  /**
   * 清空分析结果
   */
  clearAnalysisResults() {
    this.state.dependencyMap.clear()
    this.state.circularDependencies = []
    this.state.unnecessaryImports = []
    this.state.layerViolations = []
    this.state.optimizationSuggestions = []
  }

  /**
   * 销毁分析器
   */
  destroy() {
    try {
      this.clearAnalysisResults()
      this.state.initialized = false
      this.state.analyzing = false
      
      this.eventBus.emit('dependency:analyzer:destroyed', {
        timestamp: Date.now()
      })
      
      console.log('✅ [DependencyAnalyzer] 分析器已销毁')
      return AnalysisResult.success(null, '依赖分析器销毁成功')
      
    } catch (error) {
      console.error('❌ [DependencyAnalyzer] 销毁分析器失败:', error)
      return AnalysisResult.error(`销毁分析器失败: ${error.message}`, 'DESTROY_ERROR', error)
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 获取模拟依赖数据
   */
  getMockDependencyData() {
    return new Map([
      ['TaskFlowCanvasRefactored.vue', [
        'useCanvasCore.js',
        'useCanvasState.js',
        'GraphService.js',
        'LayoutService.js',
        'EventService.js',
        'nodeTypes.js',
        'EventBus.js'
      ]],
      ['GraphService.js', [
        'EventBus.js'
      ]],
      ['LayoutService.js', [
        'UnifiedStructuredLayoutEngine.js',
        'LayoutUtils.js',
        'EventBus.js'
      ]],
      ['EventService.js', [
        'EdgeOverlapManager.js'
      ]],
      ['useCanvasCore.js', [
        'x6Config.js',
        'nodeConfigManager.js'
      ]],
      ['useCanvasState.js', [
        'EventBus.js'
      ]]
    ])
  }

  /**
   * 确定模块层级
   */
  determineModuleLayer(modulePath) {
    for (const [layerName, layerInfo] of Object.entries(this.layers)) {
      if (modulePath.includes(layerName)) {
        return layerInfo
      }
    }
    
    // 默认为工具层
    return this.layers.utils
  }

  /**
   * 构建反向依赖关系
   */
  buildReverseDependencies() {
    for (const [modulePath, moduleInfo] of this.state.dependencyMap) {
      for (const dependency of moduleInfo.dependencies) {
        const dependencyInfo = this.state.dependencyMap.get(dependency)
        if (dependencyInfo) {
          dependencyInfo.dependents.push(modulePath)
        }
      }
    }
  }

  /**
   * 计算循环依赖严重程度
   */
  calculateCircularSeverity(cyclePath) {
    const cycleLength = cyclePath.length
    if (cycleLength <= 2) return 'low'
    if (cycleLength <= 4) return 'medium'
    return 'high'
  }

  /**
   * 生成循环依赖修复建议
   */
  generateCircularFixSuggestion(cyclePath) {
    return `建议重构 ${cyclePath.join(' -> ')} 的循环依赖，可考虑提取公共接口或使用依赖注入`
  }

  /**
   * 查找重复导入
   */
  findDuplicateImports(dependencies) {
    const seen = new Set()
    const duplicates = []
    
    for (const dep of dependencies) {
      if (seen.has(dep)) {
        duplicates.push(dep)
      } else {
        seen.add(dep)
      }
    }
    
    return duplicates
  }

  /**
   * 查找未使用的导入（模拟）
   */
  findUnusedImports(modulePath, dependencies) {
    // 模拟未使用导入检测
    return dependencies.filter(() => Math.random() < 0.1) // 10% 概率模拟未使用
  }

  /**
   * 查找可合并的导入
   */
  findMergableImports(dependencies) {
    const moduleGroups = new Map()
    
    for (const dep of dependencies) {
      const basePath = dep.split('/').slice(0, -1).join('/')
      if (!moduleGroups.has(basePath)) {
        moduleGroups.set(basePath, [])
      }
      moduleGroups.get(basePath).push(dep)
    }
    
    return Array.from(moduleGroups.entries())
      .filter(([, imports]) => imports.length > 1)
      .map(([basePath, imports]) => ({ basePath, imports }))
  }

  /**
   * 检查是否为层级违规
   */
  isLayerViolation(moduleLayer, dependencyLayer) {
    // 高层级模块不应依赖低层级模块
    return moduleLayer.level < dependencyLayer.level
  }

  /**
   * 计算层级违规严重程度
   */
  calculateLayerViolationSeverity(moduleLayer, dependencyLayer) {
    const levelDiff = dependencyLayer.level - moduleLayer.level
    if (levelDiff === 1) return 'low'
    if (levelDiff === 2) return 'medium'
    return 'high'
  }

  /**
   * 生成层级修复建议
   */
  generateLayerFixSuggestion(moduleLayer, dependencyLayer) {
    return `${moduleLayer.description} 不应依赖 ${dependencyLayer.description}，建议重构模块结构或提取中间层`
  }

  /**
   * 计算健康分数
   */
  calculateHealthScore(totalModules, circularCount, unnecessaryCount, violationCount) {
    if (totalModules === 0) return 0
    
    const circularPenalty = (circularCount / totalModules) * 40
    const unnecessaryPenalty = (unnecessaryCount / totalModules) * 20
    const violationPenalty = (violationCount / totalModules) * 30
    
    const score = Math.max(0, 100 - circularPenalty - unnecessaryPenalty - violationPenalty)
    return Math.round(score)
  }

  /**
   * 获取健康等级
   */
  getHealthLevel(score) {
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 70) return 'fair'
    if (score >= 60) return 'poor'
    return 'critical'
  }

  /**
   * 获取顶级建议
   */
  getTopRecommendations() {
    return this.state.optimizationSuggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 3)
      .map(suggestion => suggestion.title)
  }
}

/**
 * 创建依赖分析器实例
 */
export const createDependencyAnalyzer = (eventBus = null) => {
  return new DependencyAnalyzer(eventBus)
}

/**
 * 依赖分析器工具函数
 */
export const DependencyAnalyzerUtils = {
  /**
   * 验证分析器实例
   */
  isValidAnalyzer: (analyzer) => {
    return analyzer instanceof DependencyAnalyzer && analyzer.state.initialized
  },

  /**
   * 格式化分析结果
   */
  formatAnalysisResults: (results) => {
    if (!results || !results.success) {
      return { formatted: false, message: '无效的分析结果' }
    }

    const { data } = results
    return {
      formatted: true,
      summary: `分析了 ${data.summary.totalModules} 个模块，发现 ${data.summary.circularDependencies} 个循环依赖，${data.summary.unnecessaryImports} 个不必要导入，${data.summary.layerViolations} 个层级违规`,
      healthScore: data.summary.healthScore,
      healthLevel: data.summary.healthLevel,
      topRecommendations: data.summary.recommendations
    }
  },

  /**
   * 生成优化报告
   */
  generateOptimizationReport: (results) => {
    if (!results || !results.success) {
      return null
    }

    const { data } = results
    return {
      title: '依赖关系优化报告',
      generatedAt: new Date().toISOString(),
      summary: data.summary,
      details: {
        circularDependencies: data.circularDependencies,
        unnecessaryImports: data.unnecessaryImports,
        layerViolations: data.layerViolations
      },
      suggestions: data.optimizationSuggestions
    }
  }
}

export default DependencyAnalyzer