/**
 * 预览线验证器
 * 负责预览线存在性判断、有效性检验和创建需求分析
 */

import { PreviewLineStates, PreviewLineTypes, CreationRequirementTypes, NodeTypes } from '../types/PreviewLineTypes.js'
import { defaultConfigManager } from '../config/PreviewLineConfig.js'

/**
 * 预览线验证器类
 */
export class PreviewLineValidator {
  constructor(configManager = defaultConfigManager, graph = null, layoutEngine = null) {
    this.config = configManager
    this.debugMode = configManager.get('debug.enabled', true) // 临时启用调试模式以排查问题
    this.graph = graph
    this.layoutEngine = layoutEngine
  }

  /**
   * 设置图实例
   * @param {Object} graph - 图实例
   */
  setGraph(graph) {
    this.graph = graph
  }

  /**
   * 设置布局引擎实例
   * @param {Object} layoutEngine - 布局引擎实例
   */
  setLayoutEngine(layoutEngine) {
    this.layoutEngine = layoutEngine
  }

  /**
   * 检查布局引擎是否就绪
   * @returns {boolean} 是否就绪
   */
  isLayoutEngineReady() {
    // 🔧 修复：增强布局引擎就绪检查逻辑，支持多种布局引擎状态
    if (!this.layoutEngine) {
      console.log('🔍 [PreviewLineValidator] 布局引擎不存在，返回false')
      return false
    }
    
    // 检查布局引擎是否有isLayoutEngineReady方法
    if (typeof this.layoutEngine.isLayoutEngineReady === 'function') {
      const isReady = this.layoutEngine.isLayoutEngineReady()
      console.log('🔍 [PreviewLineValidator] 布局引擎就绪状态:', isReady)
      return isReady
    }
    
    // 检查布局引擎是否有isReady属性
    if (typeof this.layoutEngine.isReady === 'boolean') {
      console.log('🔍 [PreviewLineValidator] 使用isReady属性:', this.layoutEngine.isReady)
      return this.layoutEngine.isReady
    }
    
    // 如果布局引擎存在但没有状态检查方法，假设已就绪
    console.log('🔍 [PreviewLineValidator] 布局引擎存在但无状态检查方法，假设已就绪')
    return true
  }

  /**
   * 检查预览线创建需求
   * 这是解决用户问题的核心方法：基于节点应该有几条预览线和现在有哪些预览线来决定
   * @param {Object} node - 节点对象
   * @param {string} requestedState - 请求的状态
   * @param {Map} existingPreviewLines - 现有预览线映射
   * @param {boolean} forceUpdate - 是否强制更新
   * @returns {Object} 创建需求分析结果
   */
  checkPreviewLineRequirement(node, requestedState, existingPreviewLines, forceUpdate = false) {
    const startTime = performance.now()
    
    try {
      // 1. 基础验证 - 增强节点验证
      if (!node) {
        this.log('warn', '预览线需求检查: 节点不存在')
        return this.createRequirementResult(false, '节点不存在', CreationRequirementTypes.NO_CREATION)
      }
      
      // 验证节点基本属性 - 支持多种获取ID的方式
      let nodeId = null
      try {
        if (node.id) {
          nodeId = node.id
        } else if (typeof node.getId === 'function') {
          nodeId = node.getId()
        } else if (node.store && node.store.data && node.store.data.id) {
          nodeId = node.store.data.id
        }
      } catch (idError) {
        this.log('error', '获取节点ID时发生异常', {
          error: idError.message,
          stack: idError.stack,
          nodeType: typeof node,
          nodeConstructor: node?.constructor?.name
        })
      }
      
      if (!nodeId) {
        this.log('warn', '预览线需求检查: 节点缺少id属性', {
          node: node,
          nodeType: typeof node,
          hasId: !!node.id,
          hasGetId: typeof node.getId === 'function',
          hasStore: !!node.store,
          nodeConstructor: node?.constructor?.name
        })
        return this.createRequirementResult(false, '节点缺少id属性', CreationRequirementTypes.NO_CREATION)
      }

      // 检查布局引擎是否就绪 - 新增布局引擎状态检查
      if (!this.isLayoutEngineReady()) {
        this.log('warn', `预览线需求检查: 布局引擎未就绪: ${nodeId}`, {
          nodeId,
          hasLayoutEngine: !!this.layoutEngine,
          layoutEngineType: this.layoutEngine?.constructor?.name
        })
        return this.createRequirementResult(false, '布局引擎未就绪', CreationRequirementTypes.NO_CREATION)
      }

      // 检查节点是否在图中存在
      if (this.graph && typeof this.graph.hasCell === 'function') {
        if (!this.graph.hasCell(nodeId)) {
          this.log('warn', `预览线需求检查: 节点不在图中: ${nodeId}`)
          return this.createRequirementResult(false, '节点不在图中', CreationRequirementTypes.NO_CREATION)
        }
      }

      // 2. 强制更新检查
      if (forceUpdate) {
        this.log('info', `强制更新预览线: ${nodeId}`)
        return this.createRequirementResult(true, '强制更新', CreationRequirementTypes.NEEDS_UPDATE)
      }

      // 3. 获取现有预览线 - 使用已验证的nodeId
      const existingLines = existingPreviewLines.get(nodeId) || []
      
      // 4. 验证现有预览线有效性
      const validationResult = this.validateExistingPreviewLines(existingLines, node)
      if (!validationResult.isValid) {
        this.log('warn', `现有预览线无效: ${nodeId}, 原因: ${validationResult.reason}`)
        return this.createRequirementResult(true, `现有预览线无效: ${validationResult.reason}`, CreationRequirementTypes.NEEDS_CLEANUP)
      }

      // 5. 根据节点类型进行具体检查
      let requirementResult
      try {
        if (this.isBranchNode(node)) {
          requirementResult = this.checkBranchNodeRequirement(node, requestedState, existingLines)
        } else {
          requirementResult = this.checkSingleNodeRequirement(node, requestedState, existingLines)
        }
        
        // 验证返回结果的有效性
        if (!requirementResult || typeof requirementResult !== 'object') {
          throw new Error(`节点类型检查返回无效结果: ${typeof requirementResult}`)
        }
        
      } catch (typeCheckError) {
        this.log('error', `节点类型检查异常: ${nodeId}`, {
          error: typeCheckError.message,
          stack: typeCheckError.stack,
          nodeId: nodeId,
          isBranchNode: this.isBranchNode(node)
        })
        return this.createRequirementResult(true, `节点类型检查异常: ${typeCheckError.message}`, CreationRequirementTypes.NEEDS_CREATION)
      }

      // 6. 记录性能指标
      const duration = performance.now() - startTime
      this.log('debug', `预览线需求检查完成: ${nodeId}, 耗时: ${duration.toFixed(2)}ms`)

      return requirementResult

    } catch (error) {
      // 获取节点ID用于错误日志 - 增强错误处理
      let errorNodeId = 'unknown'
      let errorContext = {}
      
      try {
        if (node && node.id) {
          errorNodeId = node.id
        } else if (node && typeof node.getId === 'function') {
          errorNodeId = node.getId()
        }
        
        // 收集更多上下文信息
        errorContext = {
          nodeType: typeof node,
          nodeConstructor: node?.constructor?.name,
          hasId: !!node?.id,
          hasGetId: typeof node?.getId === 'function',
          hasStore: !!node?.store,
          requestedState: requestedState,
          forceUpdate: forceUpdate,
          errorMessage: error.message,
          errorStack: error.stack
        }
      } catch (contextError) {
        errorContext.contextError = contextError.message
      }
      
      this.log('error', `预览线需求检查异常: ${errorNodeId}`, errorContext)
      return this.createRequirementResult(true, `检查异常: ${error.message}`, CreationRequirementTypes.NEEDS_CREATION)
    }
  }

  /**
   * 检查分支节点预览线需求
   * 核心优化：精确分析每个分支的预览线需求
   * @param {Object} node - 分支节点
   * @param {string} requestedState - 请求状态
   * @param {Array} existingLines - 现有预览线
   * @returns {Object} 需求分析结果
   */
  checkBranchNodeRequirement(node, requestedState, existingLines) {
    try {
      // 获取节点ID用于日志
      let nodeId = 'unknown'
      try {
        nodeId = node?.id || node?.getId?.() || 'unknown'
      } catch (e) {
        // 忽略ID获取错误
      }

      // 获取分支配置 - 增强安全检查
      const branchAnalysis = this.analyzeBranchConfiguration(node)
      
      // 验证分支分析结果的完整性
      if (!branchAnalysis || typeof branchAnalysis !== 'object') {
        this.log('error', `分支分析返回无效结果: ${nodeId}`, {
          nodeId,
          branchAnalysis,
          resultType: typeof branchAnalysis
        })
        return this.createRequirementResult(false, '分支分析返回无效结果', CreationRequirementTypes.NO_CREATION)
      }
      
      if (!branchAnalysis.isValid) {
        this.log('warn', `分支配置无效: ${nodeId} - ${branchAnalysis.reason}`, {
          nodeId,
          branchAnalysis
        })
        return this.createRequirementResult(false, `分支配置无效: ${branchAnalysis.reason}`, CreationRequirementTypes.NO_CREATION)
      }

      // 2. 分析现有预览线 - 增强安全检查
      let existingAnalysis
      try {
        existingAnalysis = this.analyzeExistingBranchLines(existingLines, branchAnalysis.requiredBranches)
        
        if (!existingAnalysis || typeof existingAnalysis !== 'object') {
          throw new Error(`现有预览线分析返回无效结果: ${typeof existingAnalysis}`)
        }
      } catch (analysisError) {
        this.log('error', `现有预览线分析异常: ${nodeId}`, {
          nodeId,
          error: analysisError.message,
          stack: analysisError.stack,
          existingLinesCount: existingLines?.length || 0,
          requiredBranchesCount: branchAnalysis.requiredBranches?.length || 0
        })
        return this.createRequirementResult(true, `现有预览线分析异常: ${analysisError.message}`, CreationRequirementTypes.NEEDS_CREATION)
      }
      
      // 3. 详细的需求判断逻辑 - 增强安全检查
      let needsCreation
      try {
        needsCreation = this.determineBranchCreationNeeds(branchAnalysis, existingAnalysis, requestedState)
        
        if (!needsCreation || typeof needsCreation !== 'object') {
          throw new Error(`需求判断返回无效结果: ${typeof needsCreation}`)
        }
      } catch (needsError) {
        this.log('error', `需求判断异常: ${nodeId}`, {
          nodeId,
          error: needsError.message,
          stack: needsError.stack,
          branchAnalysis,
          existingAnalysis
        })
        return this.createRequirementResult(true, `需求判断异常: ${needsError.message}`, CreationRequirementTypes.NEEDS_CREATION)
      }
      
      // 4. 生成详细的创建需求结果 - 增强安全检查
      try {
        const result = this.createBranchRequirementResult(needsCreation, branchAnalysis, existingAnalysis)
        
        if (!result || typeof result !== 'object') {
          throw new Error(`需求结果生成返回无效结果: ${typeof result}`)
        }
        
        return result
      } catch (resultError) {
        this.log('error', `需求结果生成异常: ${nodeId}`, {
          nodeId,
          error: resultError.message,
          stack: resultError.stack,
          needsCreation,
          branchAnalysis,
          existingAnalysis
        })
        return this.createRequirementResult(true, `需求结果生成异常: ${resultError.message}`, CreationRequirementTypes.NEEDS_CREATION)
      }
      
    } catch (error) {
      // 获取节点ID用于错误日志
      let errorNodeId = 'unknown'
      try {
        errorNodeId = node?.id || node?.getId?.() || 'unknown'
      } catch (e) {
        // 忽略ID获取错误
      }
      
      this.log('error', `分支节点需求检查异常: ${errorNodeId}`, {
        nodeId: errorNodeId,
        error: error.message,
        stack: error.stack,
        requestedState,
        existingLinesCount: existingLines?.length || 0
      })
      
      return this.createRequirementResult(true, `分支节点需求检查异常: ${error.message}`, CreationRequirementTypes.NEEDS_CREATION)
    }
  }

  /**
   * 检查单一节点预览线需求
   * @param {Object} node - 单一节点
   * @param {string} requestedState - 请求状态
   * @param {Array} existingLines - 现有预览线
   * @returns {Object} 需求分析结果
   */
  checkSingleNodeRequirement(node, requestedState, existingLines) {
    try {
      // 获取节点ID用于日志
      let nodeId = 'unknown'
      try {
        nodeId = node?.id || node?.getId?.() || 'unknown'
      } catch (e) {
        // 忽略ID获取错误
      }

      // 0. 检查节点配置状态 - 增强安全检查
      let nodeData
      try {
        nodeData = node?.getData ? node.getData() : node?.data || {}
        
        if (!nodeData || typeof nodeData !== 'object') {
          this.log('warn', `节点数据获取失败: ${nodeId}`, {
            nodeId,
            nodeData,
            dataType: typeof nodeData
          })
          return this.createRequirementResult(false, '节点数据无效，不创建预览线', CreationRequirementTypes.NO_CREATION, {
            nodeType: 'single',
            error: '节点数据无效'
          })
        }
      } catch (dataError) {
        this.log('error', `节点数据获取异常: ${nodeId}`, {
          nodeId,
          error: dataError.message,
          stack: dataError.stack
        })
        return this.createRequirementResult(false, `节点数据获取异常: ${dataError.message}`, CreationRequirementTypes.NO_CREATION, {
          nodeType: 'single',
          error: dataError.message
        })
      }
      
      if (nodeData.isConfigured === false || nodeData.isConfigured === undefined) {
        this.log('info', `节点未配置，不创建预览线: ${nodeId}`, {
          nodeId,
          isConfigured: nodeData.isConfigured
        })
        return this.createRequirementResult(false, '节点未配置，不创建预览线', CreationRequirementTypes.NO_CREATION, {
          nodeType: 'single',
          isConfigured: nodeData.isConfigured
        })
      }

      // 1. 检查是否已有有效预览线 - 增强安全检查
      if (Array.isArray(existingLines) && existingLines.length > 0) {
        let validLine
        try {
          validLine = existingLines.find(line => {
            try {
              return this.isValidPreviewLine(line, node)
            } catch (validationError) {
              this.log('warn', `预览线有效性检查异常: ${nodeId}`, {
                nodeId,
                lineId: line?.id || 'unknown',
                error: validationError.message
              })
              return false
            }
          })
        } catch (findError) {
          this.log('error', `查找有效预览线异常: ${nodeId}`, {
            nodeId,
            error: findError.message,
            stack: findError.stack,
            existingLinesCount: existingLines.length
          })
          // 继续执行，假设没有找到有效预览线
        }
        
        if (validLine) {
          // 检查状态是否需要更新
          if (validLine.state !== requestedState) {
            return this.createRequirementResult(true, `状态需要更新: ${validLine.state} -> ${requestedState}`, CreationRequirementTypes.NEEDS_UPDATE, {
              existingLine: validLine,
              targetState: requestedState
            })
          }
          
          return this.createRequirementResult(false, `已存在有效预览线: ${validLine.id}`, CreationRequirementTypes.NO_CREATION, {
            existingLine: validLine
          })
        }
      }

      // 2. 需要创建新预览线
      return this.createRequirementResult(true, '需要创建单一预览线', CreationRequirementTypes.NEEDS_CREATION, {
        nodeType: 'single',
        targetState: requestedState
      })
      
    } catch (error) {
      // 获取节点ID用于错误日志
      let errorNodeId = 'unknown'
      try {
        errorNodeId = node?.id || node?.getId?.() || 'unknown'
      } catch (e) {
        // 忽略ID获取错误
      }
      
      this.log('error', `单一节点需求检查异常: ${errorNodeId}`, {
        nodeId: errorNodeId,
        error: error.message,
        stack: error.stack,
        requestedState,
        existingLinesCount: existingLines?.length || 0
      })
      
      return this.createRequirementResult(true, `单一节点需求检查异常: ${error.message}`, CreationRequirementTypes.NEEDS_CREATION, {
        nodeType: 'single',
        error: error.message
      })
    }
  }

  /**
   * 分析分支配置
   * @param {Object} node - 分支节点
   * @returns {Object} 分支分析结果
   */
  analyzeBranchConfiguration(node) {
    
    // 确保始终返回有效的对象结构
    const createDefaultResult = (isValid = false, reason = '未知错误', nodeType = 'unknown') => ({
      isValid,
      reason,
      nodeType,
      requiredBranches: [],
      branchCount: 0
    })
    
    try {
      // 安全检查：确保 node 存在
      if (!node) {
        this.log('error', '分支配置分析失败：节点为空')
        return createDefaultResult(false, '节点为空')
      }

      // 获取节点ID用于日志
      let nodeId = 'unknown'
      try {
        nodeId = node.id || node.getId?.() || 'unknown'
      } catch (e) {
        // 忽略ID获取错误
      }

      // 安全获取节点数据
      let nodeData = null
      try {
        nodeData = node.getData ? node.getData() : (node.data || {})
        if (!nodeData || typeof nodeData !== 'object') {
          nodeData = {}
        }
      } catch (error) {
        this.log('error', `获取节点数据失败: ${nodeId}`, {
          error: error.message,
          stack: error.stack,
          nodeId
        })
        nodeData = {}
      }

      // 安全获取节点类型
      let nodeType = 'unknown'
      try {
        nodeType = nodeData.type || node.type || 'unknown'
        if (typeof nodeType !== 'string') {
          nodeType = 'unknown'
        }
      } catch (error) {
        this.log('error', `获取节点类型失败: ${nodeId}`, {
          error: error.message,
          stack: error.stack,
          nodeId
        })
        nodeType = 'unknown'
      }

      // 调试日志
      if (this.debugMode) {
        this.log('debug', `分析分支配置: ${nodeId}`, {
          nodeId,
          nodeType,
          hasNodeData: !!nodeData,
          nodeDataKeys: nodeData ? Object.keys(nodeData) : [],
          nodeDataType: typeof nodeData,
          depth: depth
        })
      }
      
      let requiredBranches = []
      
      try {
        switch (nodeType) {
          case NodeTypes.AUDIENCE_SPLIT:
            requiredBranches = this.extractAudienceBranches(nodeData, depth + 1)
            break
          case NodeTypes.EVENT_SPLIT:
            requiredBranches = this.extractEventBranches(nodeData, depth + 1)
            break
          case NodeTypes.AB_TEST:
            requiredBranches = this.extractABTestBranches(nodeData, depth + 1)
            break
          default:
            this.log('warn', `不支持的分支节点类型: ${nodeType} (节点: ${nodeId})`)
            return createDefaultResult(false, `不支持的分支节点类型: ${nodeType}`, nodeType)
        }
      } catch (extractError) {
        this.log('error', `提取分支时发生异常: ${nodeType} (节点: ${nodeId})`, {
          error: extractError.message,
          stack: extractError.stack,
          nodeId,
          nodeType
        })
        return createDefaultResult(false, `提取分支异常: ${extractError.message}`, nodeType)
      }

      // 确保 requiredBranches 是数组
      if (!Array.isArray(requiredBranches)) {
        this.log('warn', `分支提取结果不是数组: ${nodeId}`, { 
          requiredBranches, 
          nodeType,
          nodeId,
          resultType: typeof requiredBranches
        })
        requiredBranches = []
      }

      if (requiredBranches.length === 0) {
        this.log('warn', `未找到有效的分支配置: ${nodeId}`, { 
          nodeType, 
          nodeData,
          nodeId,
          hasConfig: !!nodeData.config
        })
        return createDefaultResult(false, '未找到有效的分支配置', nodeType)
      }

      const result = {
        isValid: true,
        nodeType,
        requiredBranches,
        branchCount: requiredBranches.length,
        nodeId // 添加节点ID用于调试
      }

      if (this.debugMode) {
        this.log('debug', `分支配置分析成功: ${nodeId}`, result)
      }

      return result
      
    } catch (error) {
      // 获取节点ID用于错误日志
      let errorNodeId = 'unknown'
      try {
        errorNodeId = node?.id || node?.getId?.() || 'unknown'
      } catch (e) {
        // 忽略ID获取错误
      }
      
      this.log('error', `分支配置分析异常: ${errorNodeId}`, {
        error: error.message,
        stack: error.stack,
        nodeId: errorNodeId,
        nodeType: typeof node,
        nodeConstructor: node?.constructor?.name
      })
      
      return createDefaultResult(false, `分支配置分析异常: ${error.message}`)
    }
  }

  /**
   * 分析现有分支预览线
   * @param {Array} existingLines - 现有预览线
   * @param {Array} requiredBranches - 需要的分支
   * @returns {Object} 现有预览线分析结果
   */
  analyzeExistingBranchLines(existingLines, requiredBranches) {
    const existingBranches = new Map()
    const invalidLines = []
    
    // 分析现有预览线
    existingLines.forEach(line => {
      if (this.isValidBranchPreviewLine(line)) {
        const branchId = line.branchId || line.metadata?.branchId
        if (branchId) {
          existingBranches.set(branchId, line)
        } else {
          invalidLines.push(line)
        }
      } else {
        invalidLines.push(line)
      }
    })

    // 计算缺失和多余的分支
    const requiredBranchIds = new Set(requiredBranches.map(b => b.id))
    const existingBranchIds = new Set(existingBranches.keys())
    
    const missingBranches = requiredBranches.filter(b => !existingBranchIds.has(b.id))
    const extraBranchIds = [...existingBranchIds].filter(id => !requiredBranchIds.has(id))
    const extraLines = extraBranchIds.map(id => existingBranches.get(id))

    return {
      existingBranches,
      existingCount: existingBranches.size,
      requiredCount: requiredBranches.length,
      missingBranches,
      extraLines,
      invalidLines,
      isComplete: missingBranches.length === 0 && extraLines.length === 0 && invalidLines.length === 0
    }
  }

  /**
   * 确定分支创建需求
   * @param {Object} branchAnalysis - 分支分析结果
   * @param {Object} existingAnalysis - 现有预览线分析结果
   * @param {string} requestedState - 请求状态
   * @returns {Object} 创建需求
   */
  determineBranchCreationNeeds(branchAnalysis, existingAnalysis, requestedState) {
    const needs = {
      createNew: [],
      updateExisting: [],
      removeExtra: [],
      removeInvalid: []
    }

    // 1. 需要创建的新分支预览线
    needs.createNew = existingAnalysis.missingBranches

    // 2. 需要更新的现有预览线
    branchAnalysis.requiredBranches.forEach(branch => {
      const existingLine = existingAnalysis.existingBranches.get(branch.id)
      if (existingLine && existingLine.state !== requestedState) {
        needs.updateExisting.push({
          line: existingLine,
          branch,
          targetState: requestedState
        })
      }
    })

    // 3. 需要移除的多余预览线
    needs.removeExtra = existingAnalysis.extraLines

    // 4. 需要移除的无效预览线
    needs.removeInvalid = existingAnalysis.invalidLines

    return needs
  }

  /**
   * 创建分支需求结果
   * @param {Object} needs - 创建需求
   * @param {Object} branchAnalysis - 分支分析
   * @param {Object} existingAnalysis - 现有分析
   * @returns {Object} 需求结果
   */
  createBranchRequirementResult(needs, branchAnalysis, existingAnalysis) {
    const hasAnyNeeds = needs.createNew.length > 0 || 
                      needs.updateExisting.length > 0 || 
                      needs.removeExtra.length > 0 || 
                      needs.removeInvalid.length > 0

    if (!hasAnyNeeds) {
      return this.createRequirementResult(false, 
        `所有分支预览线已存在且有效 (${existingAnalysis.existingCount}/${branchAnalysis.branchCount})`, 
        CreationRequirementTypes.NO_CREATION, {
          branchAnalysis,
          existingAnalysis
        })
    }

    // 生成详细的操作说明
    const operations = []
    if (needs.createNew.length > 0) {
      operations.push(`创建 ${needs.createNew.length} 条新分支预览线`)
    }
    if (needs.updateExisting.length > 0) {
      operations.push(`更新 ${needs.updateExisting.length} 条现有预览线`)
    }
    if (needs.removeExtra.length > 0) {
      operations.push(`移除 ${needs.removeExtra.length} 条多余预览线`)
    }
    if (needs.removeInvalid.length > 0) {
      operations.push(`清理 ${needs.removeInvalid.length} 条无效预览线`)
    }

    const reason = `分支预览线需要调整: ${operations.join(', ')}`
    
    // 确保 operations 对象结构完整，符合 PreviewLineManager 的期望
    const operationsStructure = {
      createNew: needs.createNew || [],
      updateExisting: needs.updateExisting || [],
      removeExtra: needs.removeExtra || [],
      removeInvalid: needs.removeInvalid || []
    }
    
    return this.createRequirementResult(true, reason, CreationRequirementTypes.NEEDS_UPDATE, {
      branchAnalysis,
      existingAnalysis,
      operations: operationsStructure
    })
  }

  /**
   * 验证现有预览线有效性
   * @param {Array} existingLines - 现有预览线
   * @param {Object} node - 节点
   * @returns {Object} 验证结果
   */
  validateExistingPreviewLines(existingLines, node) {
    if (!existingLines || existingLines.length === 0) {
      return { isValid: true, reason: '无现有预览线' }
    }

    for (const line of existingLines) {
      if (!this.isValidPreviewLine(line, node)) {
        return { isValid: false, reason: `预览线 ${line.id} 无效` }
      }
    }

    return { isValid: true, reason: '所有现有预览线有效' }
  }

  /**
   * 检查是否为分支节点
   * @param {Object} node - 节点
   * @returns {boolean} 是否为分支节点
   */
  isBranchNode(node) {
    try {
      // 安全获取节点数据
      let nodeData
      try {
        nodeData = node?.getData ? node.getData() : node?.data || {}
      } catch (dataError) {
        // 如果获取数据失败，记录日志并返回false
        this.log('warn', '节点数据获取失败，假设为非分支节点', {
          error: dataError.message,
          nodeId: node?.id || 'unknown'
        })
        return false
      }
      
      // 安全获取节点类型
      const nodeType = nodeData?.type || nodeData?.nodeType || node?.type
      
      if (!nodeType) {
        this.log('warn', '节点类型未定义，假设为非分支节点', {
          nodeId: node?.id || 'unknown',
          nodeData: nodeData
        })
        return false
      }
      
      const branchTypes = [
        NodeTypes.AUDIENCE_SPLIT,
        NodeTypes.EVENT_SPLIT,
        NodeTypes.AB_TEST
      ]
      
      return branchTypes.includes(nodeType)
      
    } catch (error) {
      this.log('error', '分支节点检查异常', {
        error: error.message,
        stack: error.stack,
        nodeId: node?.id || 'unknown'
      })
      return false
    }
  }

  /**
   * 检查预览线是否有效
   * @param {Object} line - 预览线
   * @param {Object} node - 节点
   * @returns {boolean} 是否有效
   */
  isValidPreviewLine(line, node) {
    try {
      // 基础null检查
      if (!line || !node) {
        return false
      }
      
      if (!line.id || !line.line) {
        return false
      }

      // 检查预览线是否仍然存在于图中
      if (line.line.isRemoved && line.line.isRemoved()) {
        return false
      }

      // 安全获取节点ID
      let nodeId
      try {
        nodeId = node?.id || node?.getId?.() || null
      } catch (idError) {
        this.log('warn', '获取节点ID失败，预览线验证失败', {
          error: idError.message,
          lineId: line.id
        })
        return false
      }
      
      if (!nodeId) {
        this.log('warn', '节点ID为空，预览线验证失败', {
          lineId: line.id
        })
        return false
      }

      // 检查源节点是否匹配
      if (line.sourceNode && line.sourceNode.id !== nodeId) {
        return false
      }

      return true
      
    } catch (error) {
      this.log('error', '预览线有效性检查异常', {
        error: error.message,
        stack: error.stack,
        lineId: line?.id || 'unknown',
        nodeId: node?.id || 'unknown'
      })
      return false
    }
  }

  /**
   * 检查分支预览线是否有效
   * @param {Object} line - 分支预览线
   * @returns {boolean} 是否有效
   */
  isValidBranchPreviewLine(line) {
    if (!this.isValidPreviewLine(line)) {
      return false
    }

    // 检查分支特有属性
    const branchId = line.branchId || line.metadata?.branchId
    return !!branchId
  }

  /**
   * 提取人群分流分支
   * @param {Object} nodeData - 节点数据
   * @returns {Array} 分支列表
   */
  extractAudienceBranches(nodeData) {
    const branches = []
    
    // 安全检查：确保 nodeData 存在
    if (!nodeData || typeof nodeData !== 'object') {
      this.log('warn', '节点数据无效，无法提取人群分支', { nodeData, depth })
      return branches
    }
    
    // 将 config 变量定义移到方法开始处，确保在整个方法作用域内都可访问
    const config = nodeData.config || {}
    
    try {
      
      // 调试日志：记录节点数据结构
      if (this.debugMode) {
        console.log('[PreviewLineValidator] 分析人群分流节点数据:', {
          nodeData: nodeData,
          config: config,
          hasConfig: !!config,
          configKeys: config ? Object.keys(config) : [],
          hasCrowdLayers: !!(nodeData.crowdLayers || config.crowdLayers),
          isConfigured: nodeData.isConfigured || config.isConfigured
        })
      }
      
      // 支持多种人群配置字段 - 增强容错性
      let audienceData = null
      
      // 优先级顺序：config.audiences > config.crowdLayers > nodeData.crowdLayers > nodeData.audiences
      if (config && config.audiences && Array.isArray(config.audiences)) {
        audienceData = config.audiences
      } else if (config && config.crowdLayers && Array.isArray(config.crowdLayers)) {
        audienceData = config.crowdLayers
      } else if (nodeData.crowdLayers && Array.isArray(nodeData.crowdLayers)) {
        audienceData = nodeData.crowdLayers
      } else if (nodeData.audiences && Array.isArray(nodeData.audiences)) {
        audienceData = nodeData.audiences
      }
      
      if (audienceData && audienceData.length > 0) {
        audienceData.forEach((audience, index) => {
          try {
            // 严格验证：确保 audience 对象存在且有效
            if (!audience || typeof audience !== 'object' || audience === null) {
              if (this.debugMode) {
                console.warn('[PreviewLineValidator] 跳过无效的人群对象:', { index, audience })
              }
              return
            }
            
            // 安全访问属性，避免 TypeError
            let audienceId = null
            let audienceName = null
            
            try {
              audienceId = audience.id || audience.crowdId || audience.audienceId || `audience_${index}`
            } catch (e) {
              audienceId = `audience_${index}`
            }
            
            try {
              audienceName = audience.name || audience.crowdName || audience.label || audience.title || `分支${index + 1}`
            } catch (e) {
              audienceName = `分支${index + 1}`
            }
            
            // 只有当人群对象有基本信息时才添加
            if (audienceId && audienceName) {
              branches.push({
                id: audienceId,
                label: audienceName,
                index,
                type: 'audience',
                originalData: audience // 保留原始数据用于调试
              })
            } else {
              // 记录无效的人群配置
              if (this.debugMode) {
                console.warn('[PreviewLineValidator] 跳过无效的人群配置:', {
                  index,
                  audience,
                  audienceId,
                  audienceName
                })
              }
            }
          } catch (error) {
            this.log('error', `处理人群对象时发生错误: index=${index}`, error)
          }
        })
      }
    } catch (error) {
      this.log('error', '提取人群分支时发生异常', error)
      return branches
    }
    
    // 添加未命中分支（如果存在）- 增强容错性
    let unmatchBranch = null
    if (config.unmatchBranch && typeof config.unmatchBranch === 'object') {
      unmatchBranch = config.unmatchBranch
    } else if (nodeData.unmatchBranch && typeof nodeData.unmatchBranch === 'object') {
      unmatchBranch = nodeData.unmatchBranch
    }
    
    if (unmatchBranch) {
      const unmatchId = unmatchBranch.id || unmatchBranch.crowdId || 'unmatch_default'
      const unmatchLabel = unmatchBranch.name || unmatchBranch.crowdName || unmatchBranch.label || '未命中人群'
      
      branches.push({
        id: unmatchId,
        label: unmatchLabel,
        index: branches.length,
        type: 'audience',
        isUnmatch: true,
        originalData: unmatchBranch
      })
    }
    
    // 调试日志：记录提取结果
    if (this.debugMode) {
      console.log('[PreviewLineValidator] 人群分支提取结果:', {
        totalBranches: branches.length,
        branches: branches.map(b => ({ id: b.id, label: b.label, type: b.type, isUnmatch: b.isUnmatch })),
        hasAudienceData: !!audienceData,
        audienceDataLength: audienceData ? audienceData.length : 0,
        hasUnmatchBranch: !!unmatchBranch,
        depth: depth
      })
    }
    
    return branches
  }

  /**
   * 提取事件分流分支
   * @param {Object} nodeData - 节点数据
   * @returns {Array} 分支列表
   */
  extractEventBranches(nodeData) {
    const branches = []
    
    try {
      // 安全检查：确保 nodeData 存在
      if (!nodeData || typeof nodeData !== 'object') {
        this.log('warn', '节点数据无效，无法提取事件分支', { nodeData, depth })
        return branches
      }
      
      const config = nodeData.config || {}
      
      if (config && config.events && Array.isArray(config.events)) {
        config.events.forEach((event, index) => {
          try {
            // 严格验证：确保 event 对象存在且有效
            if (!event || typeof event !== 'object' || event === null) {
              if (this.debugMode) {
                console.warn('[PreviewLineValidator] 跳过无效的事件对象:', { index, event })
              }
              return
            }
            
            // 安全访问属性
            let eventId = null
            let eventName = null
            
            try {
              eventId = event.id || `event_${index}`
            } catch (e) {
              eventId = `event_${index}`
            }
            
            try {
              eventName = event.name || event.label || `事件${index + 1}`
            } catch (e) {
              eventName = `事件${index + 1}`
            }
            
            if (eventId) {
              branches.push({
                id: eventId,
                label: eventName,
                index,
                type: 'event'
              })
            }
          } catch (error) {
            this.log('error', `处理事件对象时发生错误: index=${index}`, error)
          }
        })
      }
    } catch (error) {
      this.log('error', '提取事件分支时发生异常', error)
    }
    
    return branches
  }

  /**
   * 提取AB测试分支
   * @param {Object} nodeData - 节点数据
   * @returns {Array} 分支列表
   */
  extractABTestBranches(nodeData) {
    const branches = []
    
    try {
      // 安全检查：确保 nodeData 存在
      if (!nodeData || typeof nodeData !== 'object') {
        this.log('warn', '节点数据无效，无法提取AB测试分支', { nodeData, depth })
        return branches
      }
      
      const config = nodeData.config || {}
      
      // AB测试通常有固定的A/B分支
      if (config && config.variants && Array.isArray(config.variants)) {
        config.variants.forEach((variant, index) => {
          try {
            // 严格验证：确保 variant 对象存在且有效
            if (!variant || typeof variant !== 'object' || variant === null) {
              if (this.debugMode) {
                console.warn('[PreviewLineValidator] 跳过无效的变体对象:', { index, variant })
              }
              return
            }
            
            // 安全访问属性
            let variantId = null
            let variantName = null
            
            try {
              variantId = variant.id || `variant_${String.fromCharCode(97 + index)}`
            } catch (e) {
              variantId = `variant_${String.fromCharCode(97 + index)}`
            }
            
            try {
              variantName = variant.name || variant.label || `变体${String.fromCharCode(65 + index)}`
            } catch (e) {
              variantName = `变体${String.fromCharCode(65 + index)}`
            }
            
            if (variantId) {
              branches.push({
                id: variantId,
                label: variantName,
                index,
                type: 'variant'
              })
            }
          } catch (error) {
            this.log('error', `处理变体对象时发生错误: index=${index}`, error)
          }
        })
      } else {
        // 默认A/B分支
        try {
          branches.push(
            { id: 'variant_a', label: '变体A', index: 0, type: 'variant' },
            { id: 'variant_b', label: '变体B', index: 1, type: 'variant' }
          )
        } catch (error) {
          this.log('error', '创建默认AB测试分支时发生错误', error)
        }
      }
    } catch (error) {
      this.log('error', '提取AB测试分支时发生异常', error)
    }
    
    return branches
  }

  /**
   * 创建需求结果
   * @param {boolean} needsCreation - 是否需要创建
   * @param {string} reason - 原因
   * @param {string} type - 需求类型
   * @param {Object} details - 详细信息
   * @returns {Object} 需求结果
   */
  createRequirementResult(needsCreation, reason, type, details = {}) {
    return {
      needsCreation,
      reason,
      type,
      details,
      timestamp: Date.now()
    }
  }

  /**
   * 日志记录
   * @param {string} level - 日志级别
   * @param {string} message - 消息
   * @param {*} data - 附加数据
   */
  log(level, message, data = null) {
    if (!this.debugMode && level === 'debug') {
      return
    }

    const logMessage = `[PreviewLineValidator] ${message}`
    
    // 安全处理data参数，避免访问undefined对象的属性
    let safeData = data
    
    try {
      if (data !== null && data !== undefined) {
        if (typeof data === 'object') {
          try {
            // 创建一个安全的数据副本，避免访问可能为undefined的属性
            safeData = JSON.parse(JSON.stringify(data))
          } catch (serializeError) {
            // 如果序列化失败，使用简化的安全数据
            safeData = {
              type: typeof data,
              hasId: data && typeof data.id !== 'undefined',
              constructor: data.constructor ? data.constructor.name : 'unknown',
              serializeError: serializeError.message,
              keys: data && typeof data === 'object' ? Object.keys(data) : []
            }
          }
        } else {
          // 对于非对象类型，直接使用
          safeData = data
        }
      } else {
        // data 为 null 或 undefined
        safeData = data
      }
    } catch (processError) {
      // 如果处理过程中发生任何错误，使用最基本的安全数据
      safeData = {
        originalType: typeof data,
        processError: processError.message,
        isNull: data === null,
        isUndefined: data === undefined
      }
    }
    
    try {
      switch (level) {
        case 'debug':
          console.debug(logMessage, safeData)
          break
        case 'info':
          console.info(logMessage, safeData)
          break
        case 'warn':
          console.warn(logMessage, safeData)
          break
        case 'error':
          console.error(logMessage, safeData)
          break
        default:
          console.log(logMessage, safeData)
          break
      }
    } catch (logError) {
      // 如果连日志输出都失败，使用最基本的输出
      console.error(`[PreviewLineValidator] 日志输出异常: ${logError.message}`, {
        originalMessage: message,
        originalLevel: level,
        logError: logError.message
      })
    }
  }
}

// 导出默认验证器实例
export const defaultValidator = new PreviewLineValidator()