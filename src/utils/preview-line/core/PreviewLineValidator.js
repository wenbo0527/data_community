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
      return false
    }
    
    // 检查布局引擎是否有isLayoutEngineReady方法
    if (typeof this.layoutEngine.isLayoutEngineReady === 'function') {
      const isReady = this.layoutEngine.isLayoutEngineReady()
      return isReady
    }
    
    // 检查布局引擎是否有isReady属性
    if (typeof this.layoutEngine.isReady === 'boolean') {
      return this.layoutEngine.isReady
    }
    
    // 如果布局引擎存在但没有状态检查方法，假设已就绪
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
  async checkPreviewLineRequirement(node, requestedState, existingPreviewLines, forceUpdate = false) {
    const startTime = performance.now()
    
    try {
      // 1. 基础验证 - 增强节点验证
      if (!node) {
        this.log('warn', '预览线需求检查: 节点不存在')
        return this.createRequirementResult(false, '节点不存在', CreationRequirementTypes.NO_CREATION)
      }

      // 1.1 节点类型验证 - 修复节点类型获取逻辑
      try {
        // 🔧 修复：正确获取节点类型，支持多种数据结构
        let nodeType = 'unknown'
        let nodeTypeSource = 'unknown'
        
        // 方法1：从节点数据中获取类型（X6 VueShape 节点的标准方式）
        if (node && typeof node.getData === 'function') {
          try {
            const nodeData = node.getData()
            if (nodeData && typeof nodeData === 'object') {
              // 🔧 关键修复：正确处理 nodeType 字段，无论它是字符串还是对象
              let typeValue = nodeData.type || nodeData.nodeType || nodeData.taskType
              
              if (typeof typeValue === 'string' && typeValue !== '') {
                nodeType = typeValue
                nodeTypeSource = 'nodeData.type/nodeType'
              } else if (typeValue && typeof typeValue === 'object') {
                // 🔧 修复：如果是对象，尝试提取字符串值
                if (typeof typeValue.type === 'string' && typeValue.type !== '') {
                  nodeType = typeValue.type
                  nodeTypeSource = 'nodeData.type.type'
                } else if (typeof typeValue.name === 'string' && typeValue.name !== '') {
                  nodeType = typeValue.name
                  nodeTypeSource = 'nodeData.type.name'
                } else if (typeof typeValue.nodeType === 'string' && typeValue.nodeType !== '') {
                  nodeType = typeValue.nodeType
                  nodeTypeSource = 'nodeData.type.nodeType'
                } else {
                  // 🔧 修复：对象无法直接转换为有效类型，记录详细信息
                  this.log('warn', `节点类型是对象但无法提取有效字符串`, { 
                    nodeId: this.getNodeId(node),
                    typeValue: typeValue,
                    typeKeys: Object.keys(typeValue || {})
                  })
                  nodeType = 'unknown'
                  nodeTypeSource = 'object-invalid'
                }
              }
            }
          } catch (getDataError) {
            this.log('warn', 'getData() 调用失败', { error: getDataError.message })
          }
        }
        
        // 方法2：直接从节点属性获取
        if (nodeType === 'unknown') {
          let typeValue = node?.type || node?.nodeType || node?.taskType
          
          if (typeof typeValue === 'string' && typeValue !== '') {
            nodeType = typeValue
            nodeTypeSource = 'node.type/nodeType'
          } else if (typeValue && typeof typeValue === 'object') {
            // 🔧 修复：同样处理对象类型
            if (typeof typeValue.type === 'string' && typeValue.type !== '') {
              nodeType = typeValue.type
              nodeTypeSource = 'node.type.type'
            } else if (typeof typeValue.name === 'string' && typeValue.name !== '') {
              nodeType = typeValue.name
              nodeTypeSource = 'node.type.name'
            }
          }
        }
        
        // 方法3：从节点data属性获取
        if (nodeType === 'unknown' && node?.data && typeof node.data === 'object') {
          let typeValue = node.data.type || node.data.nodeType || node.data.taskType
          
          if (typeof typeValue === 'string' && typeValue !== '') {
            nodeType = typeValue
            nodeTypeSource = 'node.data.type'
          } else if (typeValue && typeof typeValue === 'object') {
            // 🔧 修复：处理嵌套对象
            if (typeof typeValue.type === 'string' && typeValue.type !== '') {
              nodeType = typeValue.type
              nodeTypeSource = 'node.data.type.type'
            } else if (typeof typeValue.name === 'string' && typeValue.name !== '') {
              nodeType = typeValue.name
              nodeTypeSource = 'node.data.type.name'
            }
          }
        }
        
        // 方法4：从节点 shape 属性推断（X6 特有）
        if (nodeType === 'unknown' && node?.shape && typeof node.shape === 'string') {
          // 🔧 修复：从 shape 名称推断节点类型
          const shapeType = node.shape.replace('-node', '').replace('vue-shape-', '')
          if (shapeType && shapeType !== 'vue-shape' && shapeType !== '') {
            nodeType = shapeType
            nodeTypeSource = 'node.shape'
          }
        }
        
        // 🔧 最终验证：确保返回的是有效的字符串类型
        if (typeof nodeType !== 'string' || nodeType === '') {
          nodeType = 'unknown'
          nodeTypeSource = 'fallback'
        }
        
        // 🔧 调试日志：记录节点类型获取过程
        this.log('debug', `节点类型获取: ${nodeType} (来源: ${nodeTypeSource})`, {
          nodeId: this.getNodeId(node),
          nodeType: nodeType,
          source: nodeTypeSource
        })
        
        // 方法4：从节点store获取（X6特有）
        if (nodeType === 'unknown' && node?.store?.data && typeof node.store.data === 'object') {
          if (typeof node.store.data.type === 'string' && node.store.data.type !== '') {
            nodeType = node.store.data.type
            nodeTypeSource = 'node.store.data.type'
          } else if (typeof node.store.data.nodeType === 'string' && node.store.data.nodeType !== '') {
            nodeType = node.store.data.nodeType
            nodeTypeSource = 'node.store.data.nodeType'
          }
        }
        
        // 🔧 修复：支持带后缀和不带后缀的节点类型验证
        const validNodeTypes = [
          'start', 'start-node',
          'end', 'end-node', 
          'sms', 'sms-node',
          'audience-split', 'audience-split-node',
          'event-split', 'event-split-node',
          'ab-test', 'ab-test-node',
          'delay', 'delay-node',
          'condition', 'condition-node',
          'email', 'email-node',
          'wechat', 'wechat-node',
          'ai-call', 'ai-call-node',
          'manual-call', 'manual-call-node'
        ]
        
        // 🔧 修复：智能节点类型验证，支持多种匹配方式
        const isValidNodeType = (nodeType) => {
          if (!nodeType || typeof nodeType !== 'string') return false
          
          // 直接匹配
          if (validNodeTypes.includes(nodeType)) return true
          
          // 去掉 -node 后缀匹配
          const baseType = nodeType.replace('-node', '')
          if (validNodeTypes.includes(baseType)) return true
          
          // 添加 -node 后缀匹配
          const nodeTypeWithSuffix = nodeType + '-node'
          if (validNodeTypes.includes(nodeTypeWithSuffix)) return true
          
          return false
        }
        
        // 详细的节点类型调试信息
        const nodeId = this.getNodeId(node)
        this.log('debug', `[PreviewLineValidator] 节点类型检查: ${nodeId}`, {
          nodeType: nodeType,
          nodeTypeSource: nodeTypeSource,
          nodeConstructor: node?.constructor?.name,
          isValidType: isValidNodeType(nodeType)
        })
        
        if (!isValidNodeType(nodeType)) {
          // 🔧 修复：将警告级别降低为debug，避免控制台错误日志
          this.log('debug', `[PreviewLineValidator] 未识别的节点类型: ${nodeId}`, {
            nodeType: nodeType,
            nodeTypeSource: nodeTypeSource,
            validTypes: validNodeTypes.slice(0, 12) // 只显示基础类型，避免日志过长
          })
          // 不阻止创建，继续执行
        }

      } catch (nodeTypeError) {
        this.log('error', '[PreviewLineValidator] 节点类型验证异常', {
          nodeId: this.getNodeId(node),
          error: nodeTypeError.message,
          stack: nodeTypeError.stack
        })
        // 继续执行，但记录错误
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

      // 3. 获取现有预览线 - 兼容不同的数据类型
      let existingLines = []
      if (existingPreviewLines) {
        if (typeof existingPreviewLines.get === 'function') {
          // 如果是 Map 对象
          existingLines = existingPreviewLines.get(nodeId) || []
        } else if (Array.isArray(existingPreviewLines)) {
          // 如果直接传入的是数组
          existingLines = existingPreviewLines
        } else if (typeof existingPreviewLines === 'object') {
          // 如果是普通对象
          existingLines = existingPreviewLines[nodeId] || []
        }
      }
      
      // 4. 验证现有预览线有效性
      const validationResult = this.validateExistingPreviewLines(existingLines, node)
      if (!validationResult.isValid) {
        this.log('warn', `现有预览线无效: ${nodeId}, 原因: ${validationResult.reason}`)
        return this.createRequirementResult(true, `现有预览线无效: ${validationResult.reason}`, CreationRequirementTypes.NEEDS_CLEANUP)
      }

      // 5. 根据节点类型进行具体检查
      let requirementResult
      
      // 检查节点类型
      const isBranch = this.isBranchNode(node)
      
      // 根据节点类型调用相应的检查方法
      if (isBranch) {
        requirementResult = this.checkBranchNodeRequirement(node, requestedState, existingLines)
      } else {
        requirementResult = this.checkSingleNodeRequirement(node, requestedState, existingLines)
      }

      // 6. 记录性能指标
      const duration = performance.now() - startTime
      this.log('debug', `预览线需求检查完成: ${nodeId}, 耗时: ${duration.toFixed(2)}ms`)

      return requirementResult

    } catch (error) {
      // 获取节点ID用于错误日志
      const errorNodeId = this.getNodeId(node)
      
      this.log('error', `预览线需求检查异常: ${errorNodeId}`, {
        nodeId: errorNodeId,
        error: error.message,
        stack: error.stack,
        requestedState,
        forceUpdate
      })
      
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
    // 获取节点ID用于日志
    const nodeId = this.getNodeId(node)

    // 1. 获取分支配置
    const branchAnalysis = this.analyzeBranchConfiguration(node, 0)
    
    if (!branchAnalysis.isValid) {
      return this.createRequirementResult(false, `分支配置无效: ${branchAnalysis.reason}`, CreationRequirementTypes.NO_CREATION)
    }

    // 2. 分析现有预览线
    const existingAnalysis = this.analyzeExistingBranchLines(existingLines, branchAnalysis.requiredBranches)
    
    // 3. 判断创建需求
    const needsCreation = this.determineBranchCreationNeeds(branchAnalysis, existingAnalysis, requestedState)
    
    // 4. 生成结果
    return this.createBranchRequirementResult(needsCreation, branchAnalysis, existingAnalysis)
  }

  /**
   * 检查单一节点预览线需求
   * @param {Object} node - 单一节点
   * @param {string} requestedState - 请求状态
   * @param {Array} existingLines - 现有预览线
   * @returns {Object} 需求分析结果
   */
  checkSingleNodeRequirement(node, requestedState, existingLines) {
    // 获取节点ID用于日志
    const nodeId = this.getNodeId(node)

    // 1. 检查节点配置状态
    let nodeData
    if (typeof node.getData === 'function') {
      nodeData = node.getData()
    } else if (node.data) {
      nodeData = node.data
    } else {
      nodeData = {}
    }
    
    if (nodeData.isConfigured === false) {
      return this.createRequirementResult(false, '节点未配置，不创建预览线', CreationRequirementTypes.NO_CREATION, {
        nodeType: 'single',
        isConfigured: nodeData.isConfigured
      })
    }

    // 2. 检查是否已有有效预览线
    if (Array.isArray(existingLines) && existingLines.length > 0) {
      const validLine = existingLines.find(line => this.isValidPreviewLine(line, node))
      
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

    // 3. 需要创建新预览线
    return this.createRequirementResult(true, '需要创建单一预览线', CreationRequirementTypes.NEEDS_CREATION, {
      nodeType: 'single',
      targetState: requestedState
    })
  }

  /**
   * 分析分支配置
   * @param {Object} node - 分支节点
   * @returns {Object} 分支分析结果
   */
  analyzeBranchConfiguration(node, depth = 0) {
    
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
    if (!node) {
      return false
    }

    // 获取节点数据
    let nodeData = null
    if (typeof node.getData === 'function') {
      nodeData = node.getData()
    } else if (node.data) {
      nodeData = node.data
    } else if (node.store?.data?.data) {
      nodeData = node.store.data.data
    }

    if (!nodeData) {
      return false
    }

    // 获取节点类型
    const nodeType = nodeData.type || nodeData.nodeType || node.type || node.nodeType

    if (!nodeType) {
      return false
    }

    // 检查是否为分支节点类型
    const branchNodeTypes = ['audience-split', 'event-split', 'ab-test', 'condition']
    return branchNodeTypes.includes(nodeType)
  }

  /**
   * 获取节点ID的辅助方法
   * @param {Object} node - 节点对象
   * @returns {string} 节点ID
   */
  getNodeId(node) {
    try {
      return node?.id || node?.getId?.() || node?.data?.id || 'unknown'
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * 检查预览线是否有效 - 增强版，包含坐标验证
   * @param {Object} line - 预览线
   * @param {Object} node - 节点
   * @returns {boolean} 是否有效
   */
  isValidPreviewLine(line, node) {
    try {
      // 基础null检查
      if (!line || !node) {
        this.log('warn', '预览线有效性检查: 基础参数缺失', {
          hasLine: !!line,
          hasNode: !!node
        })
        return false
      }
      
      if (!line.id || !line.line) {
        this.log('warn', '预览线有效性检查: 预览线结构无效', {
          hasId: !!line.id,
          hasLine: !!line.line,
          lineId: line.id
        })
        return false
      }

      // 检查预览线是否仍然存在于图中
      if (line.line.isRemoved && line.line.isRemoved()) {
        this.log('warn', '预览线有效性检查: 预览线已被移除', {
          lineId: line.id
        })
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
        this.log('warn', '预览线有效性检查: 源节点不匹配', {
          lineId: line.id,
          expectedNodeId: nodeId,
          actualNodeId: line.sourceNode.id
        })
        return false
      }

      // 执行坐标验证
      const coordinateValidation = this.validatePortCoordinates(line, node)
      
      // 输出详细的坐标验证日志
      this.log('info', '预览线坐标验证结果', {
        lineId: line.id,
        nodeId: nodeId,
        coordinateValidation: coordinateValidation,
        isValid: coordinateValidation.isValid
      })

      // 如果坐标验证失败，记录但不影响整体有效性（可配置）
      if (!coordinateValidation.isValid) {
        this.log('warn', '预览线坐标验证失败', {
          lineId: line.id,
          nodeId: nodeId,
          errors: coordinateValidation.errors,
          deviations: coordinateValidation.coordinates?.deviations
        })
        
        // 根据配置决定是否因坐标问题判定为无效
        const strictCoordinateValidation = this.configManager?.getConfig?.()?.validation?.strictCoordinateValidation || false
        if (strictCoordinateValidation) {
          return false
        }
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
  extractAudienceBranches(nodeData, depth = 0) {
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
    
    return branches
  }

  /**
   * 提取事件分流分支
   * @param {Object} nodeData - 节点数据
   * @returns {Array} 分支列表
   */
  extractEventBranches(nodeData, depth = 0) {
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
  extractABTestBranches(nodeData, depth = 0) {
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
   * 验证端口坐标 - 专门的坐标校验方法
   * @param {Object} previewLine - 预览线对象
   * @param {Object} node - 节点对象
   * @returns {Object} 坐标验证结果
   */
  async validatePortCoordinates(previewLine, node) {
    try {
      // 动态导入ValidationUtils
      const { ValidationUtils } = await import('./PreviewLineValidationError.js')
      
      // 使用ValidationUtils的增强验证方法，包含坐标转换验证
      return ValidationUtils.validatePreviewLineConnection(previewLine, node, {
        thresholds: {
          position: 5,  // 位置偏差阈值
          distance: 10, // 距离偏差阈值
          coordinateTransform: 3 // 坐标转换偏差阈值
        }
      })
    } catch (error) {
      this.log('error', '端口坐标验证异常', {
        error: error.message,
        lineId: previewLine?.id || 'unknown',
        nodeId: node?.id || 'unknown'
      })
      
      return {
        isValid: false,
        errors: [`坐标验证异常: ${error.message}`],
        warnings: [],
        coordinates: {},
        nodeTypeValidation: null,
        coordinateTransformValidation: null
      }
    }
  }

  /**
   * 获取节点类型来源信息（用于调试）
   * @param {Object} node - 节点对象
   * @param {string} nodeType - 已获取的节点类型
   * @returns {string} 类型来源描述
   */
  getNodeTypeSource(node, nodeType) {
    if (!node) return 'node_null'
    
    if (node && typeof node.getData === 'function') {
      const nodeData = node.getData()
      if (nodeData?.type === nodeType) return 'getData().type'
      if (nodeData?.nodeType === nodeType) return 'getData().nodeType'
    }
    
    if (node?.type === nodeType) return 'node.type'
    if (node?.nodeType === nodeType) return 'node.nodeType'
    if (node?.data?.type === nodeType) return 'node.data.type'
    if (node?.data?.nodeType === nodeType) return 'node.data.nodeType'
    if (node?.store?.data?.type === nodeType) return 'node.store.data.type'
    if (node?.store?.data?.nodeType === nodeType) return 'node.store.data.nodeType'
    
    return 'unknown_source'
  }

  /**
   * 从可能的对象或字符串中提取有效的节点类型字符串
   * @param {*} typeValue - 可能的类型值
   * @param {string} source - 来源标识，用于调试
   * @returns {string} - 提取的节点类型字符串
   */
  extractStringType(typeValue, source = 'unknown') {
    // 如果已经是字符串且不为空，直接返回
    if (typeof typeValue === 'string' && typeValue.trim() !== '') {
      return typeValue.trim();
    }
    
    // 如果是对象，尝试从常见属性中提取
    if (typeValue && typeof typeValue === 'object') {
      // 尝试常见的类型属性
      const possibleKeys = ['type', 'nodeType', 'name', 'kind', 'category'];
      
      for (const key of possibleKeys) {
        if (typeValue[key] && typeof typeValue[key] === 'string' && typeValue[key].trim() !== '') {
          return typeValue[key].trim();
        }
      }
      
      // 如果对象有 toString 方法且不是默认的 [object Object]
      if (typeof typeValue.toString === 'function') {
        const stringValue = typeValue.toString();
        if (stringValue !== '[object Object]' && stringValue !== 'object') {
          return stringValue;
        }
      }
      
      // 最后尝试 JSON.stringify 并提取有用信息
      try {
        const jsonStr = JSON.stringify(typeValue);
        if (jsonStr && jsonStr !== '{}' && jsonStr.length < 100) {
          // 尝试从 JSON 中提取类型信息
          const typeMatch = jsonStr.match(/"(?:type|nodeType|name)"\s*:\s*"([^"]+)"/);
          if (typeMatch && typeMatch[1]) {
            return typeMatch[1];
          }
        }
      } catch (e) {
        // JSON.stringify 失败，忽略
      }
      
      return 'unknown-object-type';
    }
    
    return 'unknown';
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