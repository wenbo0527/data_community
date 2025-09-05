/**
 * 🔍 浏览器完整性测试脚本 v2.0
 * 用于实时检查系统状态和完整性问题
 * 
 * 使用方法：
 * 1. 在浏览器控制台中粘贴并运行此脚本
 * 2. 调用 window.integrityTester.runFullCheck() 进行完整检查
 * 3. 调用 window.integrityTester.getDetailedReport() 获取详细报告
 * 4. 调用 window.integrityTester.fixNaNCoordinates() 修复NaN坐标
 * 5. 调用 window.integrityTester.runEnhancedCheck() 运行增强完整性校验
 * 6. 调用 window.integrityTester.autoFix() 自动修复发现的问题
 */

class IntegrityTester {
  constructor() {
    this.graph = null
    this.previewLineManager = null
    this.layoutEngine = null
    this.lastCheckResults = null
    this.init()
  }

  init() {
    console.log('🔍 [完整性测试器] 初始化中...')
    
    // 尝试获取graph实例
    this.graph = window.graph || window.taskFlowGraph || null
    
    // 尝试获取预览线管理器实例
    this.previewLineManager = window.previewLineManager || window.unifiedPreviewLineManager || null
    
    // 尝试获取布局引擎实例
    this.layoutEngine = window.layoutEngine || window.structuredLayoutEngine || null
    
    if (!this.graph) {
      console.warn('⚠️ 未找到graph实例，部分功能可能不可用')
    }
    
    if (!this.previewLineManager) {
      console.warn('⚠️ 未找到预览线管理器实例，部分功能可能不可用')
    }
    
    if (!this.layoutEngine) {
      console.warn('⚠️ 未找到布局引擎实例，部分功能可能不可用')
    }
    
    console.log('✅ [完整性测试器] 初始化完成')
  }

  /**
   * 🔍 运行完整的完整性检查
   */
  runFullCheck() {
    console.log('🔍 [完整性测试器] 开始完整检查...')
    
    const results = {
      timestamp: new Date().toISOString(),
      nodeCoordinates: this.checkNodeCoordinates(),
      previewLines: this.checkPreviewLines(),
      connections: this.checkConnections(),
      systemStatus: this.checkSystemStatus()
    }
    
    // 计算总体状态
    const totalIssues = results.nodeCoordinates.issues.length + 
                       results.previewLines.issues.length + 
                       results.connections.issues.length
    
    results.summary = {
      totalNodes: results.nodeCoordinates.total,
      totalPreviewLines: results.previewLines.total,
      totalConnections: results.connections.total,
      totalIssues: totalIssues,
      overallStatus: totalIssues === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION',
      healthScore: this.calculateHealthScore(results)
    }
    
    this.lastCheckResults = results
    
    console.log('📊 [完整性检查] 结果摘要:', results.summary)
    
    if (totalIssues > 0) {
      console.warn('⚠️ [完整性检查] 发现问题:', {
        节点坐标问题: results.nodeCoordinates.issues.length,
        预览线问题: results.previewLines.issues.length,
        连接线问题: results.connections.issues.length
      })
    } else {
      console.log('✅ [完整性检查] 系统状态良好')
    }
    
    return results
  }

  /**
   * 🔍 运行增强完整性校验（使用UnifiedPreviewLineManager的方法）
   */
  runEnhancedCheck() {
    console.log('🔍 [完整性测试器] 运行增强完整性校验...')
    
    if (!this.previewLineManager || typeof this.previewLineManager.validateEnhancedIntegrity !== 'function') {
      console.error('❌ 预览线管理器不可用或不支持增强完整性校验')
      return null
    }
    
    try {
      const results = this.previewLineManager.validateEnhancedIntegrity()
      this.lastCheckResults = results
      
      console.log('📊 [增强完整性校验] 完成:', results.summary)
      
      if (results.criticalIssues.length > 0) {
        console.error('🚨 发现关键问题:', results.criticalIssues)
      }
      
      return results
    } catch (error) {
      console.error('❌ 增强完整性校验失败:', error)
      return null
    }
  }

  /**
   * 🔧 自动修复发现的问题
   */
  autoFix() {
    console.log('🔧 [完整性测试] 开始自动修复问题...');
    
    const fixResults = {
      startNodeFix: null,
      coordinatesFix: null,
      summary: { fixed: 0, failed: 0 }
    };
    
    // 1. 确保开始节点有基础坐标
    try {
      fixResults.startNodeFix = this.ensureStartNodeBaseCoordinates();
      if (fixResults.startNodeFix.success) {
        fixResults.summary.fixed++;
      } else {
        fixResults.summary.failed++;
      }
    } catch (error) {
      console.error('❌ [完整性测试] 设置开始节点基础坐标失败:', error);
      fixResults.summary.failed++;
    }
    
    // 2. 修复NaN坐标
    try {
      fixResults.coordinatesFix = this.fixNaNCoordinates();
      if (fixResults.coordinatesFix && fixResults.coordinatesFix.fixed > 0) {
        fixResults.summary.fixed += fixResults.coordinatesFix.fixed;
      }
    } catch (error) {
      console.error('❌ [完整性测试] 修复NaN坐标失败:', error);
      fixResults.summary.failed++;
    }
    
    console.log('✅ [完整性测试] 自动修复完成:', fixResults);
    return fixResults;
  }

  /**
   * 🎯 确保开始节点有基础坐标
   */
  ensureStartNodeBaseCoordinates() {
    console.log('🎯 [完整性测试器] 设置开始节点基础坐标...')
    
    if (!this.layoutEngine || !this.layoutEngine.ensureStartNodeBaseCoordinates) {
      console.warn('⚠️ [完整性测试器] 布局引擎不可用或缺少ensureStartNodeBaseCoordinates方法')
      return { success: false, reason: 'layoutEngine不可用' }
    }
    
    try {
      this.layoutEngine.ensureStartNodeBaseCoordinates()
      console.log('✅ [完整性测试器] 开始节点基础坐标设置完成')
      return { success: true }
    } catch (error) {
      console.error('❌ [完整性测试器] 设置开始节点基础坐标失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 🔍 检查节点坐标完整性
   */
  checkNodeCoordinates() {
    const result = { total: 0, valid: 0, invalid: 0, issues: [] }
    
    if (!this.graph) {
      console.warn('⚠️ Graph实例不可用，跳过节点坐标检查')
      return result
    }
    
    const nodes = this.graph.getNodes()
    result.total = nodes.length
    
    nodes.forEach(node => {
      try {
        const position = node.getPosition()
        const nodeData = node.getData() || {}
        const nodeType = nodeData.type || 'unknown'
        
        const hasValidPosition = position && 
          typeof position.x === 'number' && 
          typeof position.y === 'number' && 
          !isNaN(position.x) && 
          !isNaN(position.y) &&
          isFinite(position.x) && 
          isFinite(position.y)
        
        if (hasValidPosition) {
          result.valid++
        } else {
          result.invalid++
          result.issues.push({
            nodeId: node.id,
            nodeType: nodeType,
            issue: '节点坐标无效或包含NaN/Infinity',
            position: position,
            details: {
              x: position?.x,
              y: position?.y,
              xIsNaN: isNaN(position?.x),
              yIsNaN: isNaN(position?.y),
              xIsFinite: isFinite(position?.x),
              yIsFinite: isFinite(position?.y)
            }
          })
        }
      } catch (error) {
        result.invalid++
        result.issues.push({
          nodeId: node.id,
          issue: `检查节点坐标时出错: ${error.message}`,
          error: error.stack
        })
      }
    })
    
    return result
  }

  /**
   * 🔍 检查预览线完整性
   */
  checkPreviewLines() {
    const result = { total: 0, valid: 0, invalid: 0, issues: [] }
    
    if (!this.previewLineManager || !this.previewLineManager.previewLines) {
      console.warn('⚠️ 预览线管理器不可用，跳过预览线检查')
      return result
    }
    
    const previewLines = this.previewLineManager.previewLines
    result.total = previewLines.size
    
    previewLines.forEach((previewInstance, nodeId) => {
      try {
        if (!previewInstance.sourceNode) {
          result.invalid++
          result.issues.push({
            nodeId,
            issue: '预览线缺少源节点'
          })
        } else if (!this.graph.hasCell(previewInstance.sourceNode.id)) {
          result.invalid++
          result.issues.push({
            nodeId,
            issue: '预览线源节点不在graph中',
            sourceNodeId: previewInstance.sourceNode.id
          })
        } else {
          result.valid++
        }
      } catch (error) {
        result.invalid++
        result.issues.push({
          nodeId,
          issue: `检查预览线时出错: ${error.message}`,
          error: error.stack
        })
      }
    })
    
    return result
  }

  /**
   * 🔍 检查连接线完整性
   */
  checkConnections() {
    const result = { total: 0, valid: 0, invalid: 0, issues: [] }
    
    if (!this.graph) {
      console.warn('⚠️ Graph实例不可用，跳过连接线检查')
      return result
    }
    
    const edges = this.graph.getEdges()
    result.total = edges.length
    
    edges.forEach(edge => {
      try {
        const source = edge.getSource()
        const target = edge.getTarget()
        
        if (!source || !source.cell) {
          result.invalid++
          result.issues.push({
            edgeId: edge.id,
            issue: '连接线缺少源节点'
          })
        } else if (!target || !target.cell) {
          result.invalid++
          result.issues.push({
            edgeId: edge.id,
            issue: '连接线缺少目标节点'
          })
        } else if (!this.graph.hasCell(source.cell)) {
          result.invalid++
          result.issues.push({
            edgeId: edge.id,
            issue: '连接线源节点不在graph中',
            sourceCell: source.cell
          })
        } else if (!this.graph.hasCell(target.cell)) {
          result.invalid++
          result.issues.push({
            edgeId: edge.id,
            issue: '连接线目标节点不在graph中',
            targetCell: target.cell
          })
        } else {
          result.valid++
        }
      } catch (error) {
        result.invalid++
        result.issues.push({
          edgeId: edge.id,
          issue: `检查连接线时出错: ${error.message}`,
          error: error.stack
        })
      }
    })
    
    return result
  }

  /**
   * 🔍 检查系统状态
   */
  checkSystemStatus() {
    return {
      graphAvailable: !!this.graph,
      previewLineManagerAvailable: !!this.previewLineManager,
      layoutEngineAvailable: !!this.layoutEngine,
      enhancedIntegritySupported: !!(this.previewLineManager && 
        typeof this.previewLineManager.validateEnhancedIntegrity === 'function'),
      autoFixSupported: !!(this.previewLineManager && 
        typeof this.previewLineManager.fixNaNCoordinates === 'function')
    }
  }

  /**
   * 🔧 修复NaN坐标
   */
  fixNaNCoordinates() {
    console.log('🔧 [完整性测试器] 修复NaN坐标...')
    
    const fixResults = { fixed: 0, failed: 0, details: [] }
    
    if (!this.graph) {
      console.error('❌ Graph实例不可用，无法修复坐标')
      return fixResults
    }
    
    const nodes = this.graph.getNodes()
    
    nodes.forEach(node => {
      try {
        const position = node.getPosition()
        const nodeData = node.getData() || {}
        const nodeType = nodeData.type || 'unknown'
        
        if (!position || isNaN(position.x) || isNaN(position.y)) {
          let fixedX = position?.x || 0
          let fixedY = position?.y || 0
          
          if (isNaN(fixedX)) {
            fixedX = 100
          }
          
          if (isNaN(fixedY)) {
            // 根据节点类型计算Y坐标
            const typeYMap = {
              'start': 50,
              'audience-split': 150,
              'condition': 250,
              'action': 350,
              'end': 450
            }
            fixedY = typeYMap[nodeType] || 200
          }
          
          node.setPosition({ x: fixedX, y: fixedY }, { silent: true })
          
          fixResults.fixed++
          fixResults.details.push({
            nodeId: node.id,
            nodeType: nodeType,
            originalPosition: position,
            fixedPosition: { x: fixedX, y: fixedY }
          })
          
          console.log(`✅ 修复节点坐标: ${node.id} -> (${fixedX}, ${fixedY})`)
        }
      } catch (error) {
        fixResults.failed++
        fixResults.details.push({
          nodeId: node.id,
          error: error.message
        })
        console.error(`❌ 修复节点坐标失败: ${node.id}`, error)
      }
    })
    
    console.log('🔧 [坐标修复] 完成:', {
      修复成功: fixResults.fixed,
      修复失败: fixResults.failed
    })
    
    return fixResults
  }

  /**
   * 📊 获取详细报告
   */
  getDetailedReport() {
    if (!this.lastCheckResults) {
      console.warn('⚠️ 尚未运行检查，请先调用 runFullCheck() 或 runEnhancedCheck()')
      return null
    }
    
    console.log('📊 [详细报告] 最后检查结果:', this.lastCheckResults)
    return this.lastCheckResults
  }

  /**
   * 📊 计算健康评分
   */
  calculateHealthScore(results) {
    const totalItems = results.nodeCoordinates.total + 
                      results.previewLines.total + 
                      results.connections.total
    
    if (totalItems === 0) return 100
    
    const validItems = results.nodeCoordinates.valid + 
                      results.previewLines.valid + 
                      results.connections.valid
    
    return Math.round((validItems / totalItems) * 100)
  }

  /**
   * 🔧 快速诊断和修复
   */
  quickDiagnose() {
    console.log('🔧 [快速诊断] 开始...')
    
    // 1. 运行增强检查
    const enhancedResults = this.runEnhancedCheck()
    
    // 2. 如果发现问题，尝试自动修复
    if (enhancedResults && enhancedResults.summary.totalIssues > 0) {
      console.log('🔧 发现问题，开始自动修复...')
      const fixResults = this.autoFix()
      
      // 3. 修复后再次检查
      console.log('🔧 修复完成，重新检查...')
      const recheckResults = this.runEnhancedCheck()
      
      return {
        initialCheck: enhancedResults,
        fixResults: fixResults,
        finalCheck: recheckResults
      }
    } else {
      console.log('✅ 系统状态良好，无需修复')
      return {
        initialCheck: enhancedResults,
        fixResults: null,
        finalCheck: null
      }
    }
  }
}

// 创建全局实例
if (!window.integrityTester) {
  window.integrityTester = new IntegrityTester()
  console.log('🔍 [完整性测试器] 已创建全局实例: window.integrityTester')
  console.log('📖 使用说明:')
  console.log('  - window.integrityTester.runFullCheck() - 运行完整检查')
  console.log('  - window.integrityTester.runEnhancedCheck() - 运行增强完整性校验')
  console.log('  - window.integrityTester.autoFix() - 自动修复问题')
  console.log('  - window.integrityTester.quickDiagnose() - 快速诊断和修复')
  console.log('  - window.integrityTester.getDetailedReport() - 获取详细报告')
} else {
  console.log('🔍 [完整性测试器] 全局实例已存在，重新初始化...')
  window.integrityTester.init()
}

console.log('✅ [完整性测试脚本] 加载完成！')
console.log('🚀 快速开始: window.integrityTester.quickDiagnose()')