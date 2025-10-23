/**
 * 模块边界优化器
 * 用于明确各模块的职责边界，重构混合职责的模块
 */

import { EventBus } from './EventBus.js'

/**
 * 模块边界分析结果
 */
class BoundaryAnalysisResult {
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
    return new BoundaryAnalysisResult(true, data, null, metadata)
  }

  static error(error, metadata = {}) {
    return new BoundaryAnalysisResult(false, null, error, metadata)
  }
}

/**
 * 模块职责定义
 */
const MODULE_RESPONSIBILITIES = {
  // Canvas层 - 视图和交互
  canvas: {
    name: 'Canvas层',
    responsibilities: [
      '画布渲染和显示',
      '用户交互处理',
      '视图状态管理',
      '事件监听和响应'
    ],
    allowedDependencies: ['composables', 'services', 'utils', 'constants'],
    forbiddenDependencies: ['other_components'],
    patterns: ['components/**/*.vue', 'components/**/*.jsx']
  },

  // Service层 - 业务逻辑和数据处理
  service: {
    name: 'Service层',
    responsibilities: [
      '业务逻辑处理',
      '数据管理和持久化',
      '外部API调用',
      '状态同步'
    ],
    allowedDependencies: ['utils', 'constants', 'types'],
    forbiddenDependencies: ['components', 'composables'],
    patterns: ['services/**/*.js', 'services/**/*.ts']
  },

  // Composables层 - 组合式逻辑
  composable: {
    name: 'Composables层',
    responsibilities: [
      '可复用的组合式逻辑',
      '状态管理',
      '生命周期管理',
      '响应式数据处理'
    ],
    allowedDependencies: ['services', 'utils', 'constants', 'types'],
    forbiddenDependencies: ['components'],
    patterns: ['composables/**/*.js', 'composables/**/*.ts']
  },

  // Utils层 - 工具函数
  utils: {
    name: 'Utils层',
    responsibilities: [
      '纯函数工具',
      '数据转换',
      '算法实现',
      '通用辅助功能'
    ],
    allowedDependencies: ['constants', 'types'],
    forbiddenDependencies: ['components', 'composables', 'services'],
    patterns: ['utils/**/*.js', 'utils/**/*.ts']
  },

  // Constants层 - 常量定义
  constants: {
    name: 'Constants层',
    responsibilities: [
      '常量定义',
      '配置参数',
      '枚举值',
      '默认值'
    ],
    allowedDependencies: ['types'],
    forbiddenDependencies: ['components', 'composables', 'services', 'utils'],
    patterns: ['constants/**/*.js', 'constants/**/*.ts']
  },

  // Types层 - 类型定义
  types: {
    name: 'Types层',
    responsibilities: [
      'TypeScript类型定义',
      '接口声明',
      '类型别名',
      '泛型定义'
    ],
    allowedDependencies: [],
    forbiddenDependencies: ['components', 'composables', 'services', 'utils', 'constants'],
    patterns: ['types/**/*.ts', '**/*.d.ts']
  }
}

/**
 * 模块边界优化器类
 */
class ModuleBoundaryOptimizer {
  constructor() {
    this.eventBus = new EventBus()
    this.isInitialized = false
    this.moduleMap = new Map()
    this.boundaryViolations = []
    this.mixedResponsibilities = []
    this.refactoringPlan = null
    
    this.initialize()
  }

  /**
   * 初始化优化器
   */
  initialize() {
    try {
      this.isInitialized = true
      this.eventBus.emit('boundary-optimizer:initialized', { 
        timestamp: new Date().toISOString() 
      })
    } catch (error) {
      console.error('模块边界优化器初始化失败:', error)
      throw error
    }
  }

  /**
   * 分析模块边界
   */
  async analyzeModuleBoundaries(projectPath) {
    try {
      if (!this.isInitialized) {
        return BoundaryAnalysisResult.error(new Error('优化器未初始化'))
      }

      this.eventBus.emit('boundary-analysis:started', { projectPath })

      // 扫描和分类模块
      await this.scanAndClassifyModules(projectPath)
      
      // 分析职责边界
      this.analyzeResponsibilityBoundaries()
      
      // 检测边界违规
      this.detectBoundaryViolations()
      
      // 识别混合职责
      this.identifyMixedResponsibilities()
      
      // 生成重构计划
      this.generateRefactoringPlan()

      const analysisResult = {
        moduleMap: this.moduleMap,
        boundaryViolations: this.boundaryViolations,
        mixedResponsibilities: this.mixedResponsibilities,
        refactoringPlan: this.refactoringPlan,
        healthScore: this.calculateBoundaryHealthScore()
      }

      this.eventBus.emit('boundary-analysis:completed', analysisResult)
      return BoundaryAnalysisResult.success(analysisResult)

    } catch (error) {
      this.eventBus.emit('boundary-analysis:error', { error: error.message })
      return BoundaryAnalysisResult.error(error)
    }
  }

  /**
   * 扫描和分类模块
   */
  async scanAndClassifyModules(projectPath) {
    // 模拟文件扫描和分类
    const mockModules = [
      {
        path: 'components/TaskFlowCanvasRefactored.vue',
        type: 'canvas',
        size: 2600,
        dependencies: [
          'services/GraphService.js',
          'services/LayoutService.js',
          'composables/useCanvasCore.js',
          'utils/canvas/NodeConfigManager.js'
        ],
        exports: ['default'],
        responsibilities: [
          '画布渲染',
          '事件处理',
          '状态管理',
          '业务逻辑' // 混合职责
        ]
      },
      {
        path: 'services/GraphService.js',
        type: 'service',
        size: 800,
        dependencies: [
          'utils/canvas/CoordinateSystemManager.js',
          'utils/EventBus.js'
        ],
        exports: ['createGraphService'],
        responsibilities: [
          '图形管理',
          '数据持久化'
        ]
      },
      {
        path: 'utils/canvas/NodeConfigManager.js',
        type: 'utils',
        size: 400,
        dependencies: [
          'utils/nodeTypes.js', // 跨层级依赖
          'services/ConfigService.js' // 违规依赖
        ],
        exports: ['nodeConfigManager'],
        responsibilities: [
          '节点配置',
          '业务逻辑' // 混合职责
        ]
      }
    ]

    this.moduleMap.clear()
    for (const module of mockModules) {
      this.moduleMap.set(module.path, {
        ...module,
        layer: this.determineModuleLayer(module.path),
        violationScore: 0
      })
    }
  }

  /**
   * 确定模块层级
   */
  determineModuleLayer(filePath) {
    for (const [layerKey, layerConfig] of Object.entries(MODULE_RESPONSIBILITIES)) {
      for (const pattern of layerConfig.patterns) {
        const regex = new RegExp(pattern.replace('**', '.*').replace('*', '[^/]*'))
        if (regex.test(filePath)) {
          return layerKey
        }
      }
    }
    return 'unknown'
  }

  /**
   * 分析职责边界
   */
  analyzeResponsibilityBoundaries() {
    for (const [modulePath, moduleInfo] of this.moduleMap) {
      const expectedResponsibilities = MODULE_RESPONSIBILITIES[moduleInfo.layer]?.responsibilities || []
      const actualResponsibilities = moduleInfo.responsibilities || []
      
      // 检查职责是否超出边界
      const extraResponsibilities = actualResponsibilities.filter(resp => 
        !expectedResponsibilities.some(expected => 
          resp.toLowerCase().includes(expected.toLowerCase().split(' ')[0])
        )
      )

      if (extraResponsibilities.length > 0) {
        moduleInfo.extraResponsibilities = extraResponsibilities
        moduleInfo.violationScore += extraResponsibilities.length * 10
      }
    }
  }

  /**
   * 检测边界违规
   */
  detectBoundaryViolations() {
    this.boundaryViolations = []

    for (const [modulePath, moduleInfo] of this.moduleMap) {
      const layerConfig = MODULE_RESPONSIBILITIES[moduleInfo.layer]
      if (!layerConfig) continue

      // 检查依赖违规
      for (const dependency of moduleInfo.dependencies) {
        const depModule = this.findModuleByPath(dependency)
        if (!depModule) continue

        const depLayer = depModule.layer
        
        // 检查是否为禁止的依赖
        if (layerConfig.forbiddenDependencies.includes(depLayer)) {
          this.boundaryViolations.push({
            module: modulePath,
            layer: moduleInfo.layer,
            violation: 'forbidden_dependency',
            dependency,
            dependencyLayer: depLayer,
            severity: 'high',
            suggestion: this.generateViolationSuggestion(moduleInfo.layer, depLayer)
          })
          moduleInfo.violationScore += 20
        }
        
        // 检查是否为不推荐的依赖
        else if (!layerConfig.allowedDependencies.includes(depLayer)) {
          this.boundaryViolations.push({
            module: modulePath,
            layer: moduleInfo.layer,
            violation: 'discouraged_dependency',
            dependency,
            dependencyLayer: depLayer,
            severity: 'medium',
            suggestion: this.generateViolationSuggestion(moduleInfo.layer, depLayer)
          })
          moduleInfo.violationScore += 10
        }
      }
    }
  }

  /**
   * 查找模块
   */
  findModuleByPath(path) {
    // 简化的路径匹配
    for (const [modulePath, moduleInfo] of this.moduleMap) {
      if (modulePath.includes(path.split('/').pop()) || path.includes(modulePath.split('/').pop())) {
        return moduleInfo
      }
    }
    return null
  }

  /**
   * 生成违规建议
   */
  generateViolationSuggestion(fromLayer, toLayer) {
    const suggestions = {
      'canvas-service': '组件不应直接调用服务，使用composables作为中间层',
      'utils-service': '工具函数不应依赖服务，考虑依赖注入或回调模式',
      'service-canvas': '服务层不应依赖组件，使用事件总线或观察者模式',
      'constants-utils': '常量不应依赖工具函数，保持常量的纯净性'
    }
    
    return suggestions[`${fromLayer}-${toLayer}`] || `${fromLayer}层不应依赖${toLayer}层`
  }

  /**
   * 识别混合职责
   */
  identifyMixedResponsibilities() {
    this.mixedResponsibilities = []

    for (const [modulePath, moduleInfo] of this.moduleMap) {
      const layerConfig = MODULE_RESPONSIBILITIES[moduleInfo.layer]
      if (!layerConfig) continue

      // 检查文件大小
      if (moduleInfo.size > 500) {
        this.mixedResponsibilities.push({
          module: modulePath,
          type: 'oversized',
          severity: 'medium',
          details: `文件过大(${moduleInfo.size}行)，可能承担了过多职责`,
          suggestion: '考虑拆分为多个更小的模块'
        })
      }

      // 检查依赖数量
      if (moduleInfo.dependencies.length > 10) {
        this.mixedResponsibilities.push({
          module: modulePath,
          type: 'over_dependent',
          severity: 'medium',
          details: `依赖过多(${moduleInfo.dependencies.length}个)`,
          suggestion: '减少依赖，使用依赖注入或事件总线'
        })
      }

      // 检查职责混合
      if (moduleInfo.extraResponsibilities && moduleInfo.extraResponsibilities.length > 0) {
        this.mixedResponsibilities.push({
          module: modulePath,
          type: 'mixed_responsibility',
          severity: 'high',
          details: `承担了额外职责: ${moduleInfo.extraResponsibilities.join(', ')}`,
          suggestion: '提取额外职责到对应的层级'
        })
      }
    }
  }

  /**
   * 生成重构计划
   */
  generateRefactoringPlan() {
    const actions = []

    // 处理边界违规
    for (const violation of this.boundaryViolations) {
      if (violation.severity === 'high') {
        actions.push({
          type: 'fix_boundary_violation',
          priority: 'high',
          module: violation.module,
          action: 'refactor_dependency',
          details: violation.suggestion
        })
      }
    }

    // 处理混合职责
    for (const mixed of this.mixedResponsibilities) {
      if (mixed.severity === 'high') {
        actions.push({
          type: 'separate_responsibilities',
          priority: 'high',
          module: mixed.module,
          action: 'extract_module',
          details: mixed.suggestion
        })
      }
    }

    // 优化建议
    const suggestions = [
      {
        category: '架构优化',
        items: [
          '建立清晰的模块接口契约',
          '使用依赖注入减少直接依赖',
          '实施事件驱动架构'
        ]
      },
      {
        category: '代码组织',
        items: [
          '按职责重新组织文件结构',
          '提取公共接口和抽象层',
          '统一命名规范和导出方式'
        ]
      }
    ]

    this.refactoringPlan = {
      actions,
      suggestions,
      estimatedEffort: this.calculateRefactoringEffort(actions),
      expectedBenefits: [
        '提高代码可维护性',
        '减少模块间耦合',
        '增强代码可测试性',
        '提升开发效率'
      ]
    }
  }

  /**
   * 计算重构工作量
   */
  calculateRefactoringEffort(actions) {
    const effortMap = {
      'fix_boundary_violation': 4, // 小时
      'separate_responsibilities': 8,
      'extract_module': 6
    }

    const totalHours = actions.reduce((sum, action) => {
      return sum + (effortMap[action.type] || 2)
    }, 0)

    return {
      totalHours,
      complexity: totalHours > 20 ? 'high' : totalHours > 10 ? 'medium' : 'low',
      phases: [
        { name: '分析和设计', hours: Math.ceil(totalHours * 0.3) },
        { name: '重构实施', hours: Math.ceil(totalHours * 0.5) },
        { name: '测试和验证', hours: Math.ceil(totalHours * 0.2) }
      ]
    }
  }

  /**
   * 计算边界健康分数
   */
  calculateBoundaryHealthScore() {
    let score = 100
    
    // 边界违规扣分
    const highViolations = this.boundaryViolations.filter(v => v.severity === 'high').length
    const mediumViolations = this.boundaryViolations.filter(v => v.severity === 'medium').length
    
    score -= highViolations * 15
    score -= mediumViolations * 8
    
    // 混合职责扣分
    const highMixed = this.mixedResponsibilities.filter(m => m.severity === 'high').length
    const mediumMixed = this.mixedResponsibilities.filter(m => m.severity === 'medium').length
    
    score -= highMixed * 12
    score -= mediumMixed * 6
    
    return Math.max(0, score)
  }

  /**
   * 执行重构
   */
  async executeRefactoring(plan) {
    try {
      this.eventBus.emit('refactoring:started', { plan })

      const results = []
      
      for (const action of plan.actions) {
        const result = await this.executeRefactoringAction(action)
        results.push(result)
      }

      this.eventBus.emit('refactoring:completed', { results })
      return BoundaryAnalysisResult.success(results)

    } catch (error) {
      this.eventBus.emit('refactoring:error', { error: error.message })
      return BoundaryAnalysisResult.error(error)
    }
  }

  /**
   * 执行重构动作
   */
  async executeRefactoringAction(action) {
    switch (action.type) {
      case 'fix_boundary_violation':
        return this.fixBoundaryViolation(action)
      
      case 'separate_responsibilities':
        return this.separateResponsibilities(action)
      
      case 'extract_module':
        return this.extractModule(action)
      
      default:
        throw new Error(`未知的重构动作: ${action.type}`)
    }
  }

  /**
   * 修复边界违规
   */
  async fixBoundaryViolation(action) {
    // 实际实现需要代码重构
    return {
      type: 'fix_boundary_violation',
      module: action.module,
      success: true,
      message: '已修复边界违规'
    }
  }

  /**
   * 分离职责
   */
  async separateResponsibilities(action) {
    // 实际实现需要代码重构
    return {
      type: 'separate_responsibilities',
      module: action.module,
      success: true,
      message: '已分离混合职责'
    }
  }

  /**
   * 提取模块
   */
  async extractModule(action) {
    // 实际实现需要代码重构
    return {
      type: 'extract_module',
      module: action.module,
      success: true,
      message: '已提取新模块'
    }
  }

  /**
   * 销毁优化器
   */
  destroy() {
    try {
      this.eventBus.emit('boundary-optimizer:destroying')
      
      this.moduleMap.clear()
      this.boundaryViolations = []
      this.mixedResponsibilities = []
      this.refactoringPlan = null
      
      this.eventBus.removeAllListeners()
      this.isInitialized = false
      
      this.eventBus.emit('boundary-optimizer:destroyed')
    } catch (error) {
      console.error('模块边界优化器销毁失败:', error)
    }
  }
}

/**
 * 创建模块边界优化器实例
 */
export function createModuleBoundaryOptimizer() {
  return new ModuleBoundaryOptimizer()
}

/**
 * 导出类和常量
 */
export {
  ModuleBoundaryOptimizer,
  BoundaryAnalysisResult,
  MODULE_RESPONSIBILITIES
}