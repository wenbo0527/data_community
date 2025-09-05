/**
 * 浏览器完整性测试脚本
 * 用于实时检查系统状态和完整性问题
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行：loadScript('/integrity-test.js')
 * 2. 或者直接复制此脚本内容到控制台执行
 */

// 完整性测试工具类
class IntegrityTester {
  constructor() {
    this.results = {
      nodeCoordinates: [],
      previewLines: [],
      connections: [],
      summary: {
        totalIssues: 0,
        nodeIssues: 0,
        previewLineIssues: 0,
        connectionIssues: 0
      }
    }
  }

  // 检查所有节点坐标完整性
  checkNodeCoordinates() {
    console.log('🔍 检查节点坐标完整性...')
    
    const issues = []
    
    try {
      // 获取图实例
      const graph = window.graph || window.taskFlowGraph
      if (!graph) {
        issues.push({
          type: 'GRAPH_NOT_FOUND',
          message: '未找到图实例',
          severity: 'critical'
        })
        return issues
      }

      // 获取所有节点
      const nodes = graph.getNodes()
      console.log(`📊 找到 ${nodes.length} 个节点`)

      nodes.forEach((node, index) => {
        const position = node.getPosition()
        const data = node.getData ? node.getData() : {}
        const nodeId = node.id
        const nodeType = data.type || 'unknown'

        // 检查X坐标
        if (isNaN(position.x) || position.x === undefined || position.x === null) {
          issues.push({
            type: 'INVALID_X_COORDINATE',
            nodeId,
            nodeType,
            position,
            message: `节点 ${nodeId} (${nodeType}) 的X坐标无效: ${position.x}`,
            severity: 'high'
          })
        }

        // 检查Y坐标
        if (isNaN(position.y) || position.y === undefined || position.y === null) {
          issues.push({
            type: 'INVALID_Y_COORDINATE',
            nodeId,
            nodeType,
            position,
            message: `节点 ${nodeId} (${nodeType}) 的Y坐标无效: ${position.y}`,
            severity: 'high'
          })
        }

        // 特别检查audience-split类型节点
        if (nodeType === 'audience-split' && (isNaN(position.y) || isNaN(position.x))) {
          issues.push({
            type: 'AUDIENCE_SPLIT_COORDINATE_ISSUE',
            nodeId,
            nodeType,
            position,
            message: `audience-split节点 ${nodeId} 坐标异常`,
            severity: 'critical'
          })
        }
      })

    } catch (error) {
      issues.push({
        type: 'NODE_CHECK_ERROR',
        message: `节点检查过程中发生错误: ${error.message}`,
        severity: 'critical',
        error: error.stack
      })
    }

    this.results.nodeCoordinates = issues
    this.results.summary.nodeIssues = issues.length
    
    if (issues.length === 0) {
      console.log('✅ 所有节点坐标完整性检查通过')
    } else {
      console.log(`❌ 发现 ${issues.length} 个节点坐标问题`)
      issues.forEach(issue => {
        console.log(`  - ${issue.message}`)
      })
    }

    return issues
  }

  // 检查预览线完整性
  checkPreviewLines() {
    console.log('🔍 检查预览线完整性...')
    
    const issues = []
    
    try {
      // 获取预览线管理器实例
      const previewLineManager = window.unifiedPreviewLineManager || window.previewLineManager
      if (!previewLineManager) {
        issues.push({
          type: 'PREVIEW_LINE_MANAGER_NOT_FOUND',
          message: '未找到预览线管理器实例',
          severity: 'high'
        })
        return issues
      }

      // 检查预览线状态
      const previewLines = previewLineManager.previewLines || []
      console.log(`📊 找到 ${previewLines.length} 条预览线`)

      previewLines.forEach((previewLine, index) => {
        // 检查源节点
        if (!previewLine.sourceNode) {
          issues.push({
            type: 'PREVIEW_LINE_NO_SOURCE',
            index,
            message: `预览线 ${index} 缺少源节点`,
            severity: 'high'
          })
        } else {
          // 检查源节点坐标
          const sourcePos = previewLine.sourceNode.getPosition ? previewLine.sourceNode.getPosition() : null
          if (!sourcePos || isNaN(sourcePos.x) || isNaN(sourcePos.y)) {
            issues.push({
              type: 'PREVIEW_LINE_INVALID_SOURCE_POSITION',
              index,
              sourcePos,
              message: `预览线 ${index} 源节点坐标无效`,
              severity: 'high'
            })
          }
        }

        // 检查预览线路径
        if (!previewLine.path || previewLine.path.length === 0) {
          issues.push({
            type: 'PREVIEW_LINE_NO_PATH',
            index,
            message: `预览线 ${index} 缺少路径信息`,
            severity: 'medium'
          })
        }
      })

    } catch (error) {
      issues.push({
        type: 'PREVIEW_LINE_CHECK_ERROR',
        message: `预览线检查过程中发生错误: ${error.message}`,
        severity: 'critical',
        error: error.stack
      })
    }

    this.results.previewLines = issues
    this.results.summary.previewLineIssues = issues.length
    
    if (issues.length === 0) {
      console.log('✅ 所有预览线完整性检查通过')
    } else {
      console.log(`❌ 发现 ${issues.length} 个预览线问题`)
      issues.forEach(issue => {
        console.log(`  - ${issue.message}`)
      })
    }

    return issues
  }

  // 检查连接线完整性
  checkConnections() {
    console.log('🔍 检查连接线完整性...')
    
    const issues = []
    
    try {
      // 获取图实例
      const graph = window.graph || window.taskFlowGraph
      if (!graph) {
        issues.push({
          type: 'GRAPH_NOT_FOUND',
          message: '未找到图实例',
          severity: 'critical'
        })
        return issues
      }

      // 获取所有边
      const edges = graph.getEdges()
      const nodes = graph.getNodes()
      const nodeIds = new Set(nodes.map(n => n.id))
      
      console.log(`📊 找到 ${edges.length} 条连接线`)

      edges.forEach((edge, index) => {
        const edgeId = edge.id
        
        // 检查源节点
        const sourceId = edge.getSourceCellId ? edge.getSourceCellId() : edge.source
        if (!sourceId) {
          issues.push({
            type: 'CONNECTION_NO_SOURCE',
            edgeId,
            message: `连接线 ${edgeId} 缺少源节点`,
            severity: 'high'
          })
        } else if (!nodeIds.has(sourceId)) {
          issues.push({
            type: 'CONNECTION_INVALID_SOURCE',
            edgeId,
            sourceId,
            message: `连接线 ${edgeId} 的源节点 ${sourceId} 不存在`,
            severity: 'high'
          })
        }

        // 检查目标节点
        const targetId = edge.getTargetCellId ? edge.getTargetCellId() : edge.target
        if (!targetId) {
          issues.push({
            type: 'CONNECTION_NO_TARGET',
            edgeId,
            message: `连接线 ${edgeId} 缺少目标节点`,
            severity: 'high'
          })
        } else if (!nodeIds.has(targetId)) {
          issues.push({
            type: 'CONNECTION_INVALID_TARGET',
            edgeId,
            targetId,
            message: `连接线 ${edgeId} 的目标节点 ${targetId} 不存在`,
            severity: 'high'
          })
        }

        // 检查自环连接
        if (sourceId && targetId && sourceId === targetId) {
          issues.push({
            type: 'CONNECTION_SELF_LOOP',
            edgeId,
            nodeId: sourceId,
            message: `连接线 ${edgeId} 是自环连接`,
            severity: 'medium'
          })
        }
      })

    } catch (error) {
      issues.push({
        type: 'CONNECTION_CHECK_ERROR',
        message: `连接线检查过程中发生错误: ${error.message}`,
        severity: 'critical',
        error: error.stack
      })
    }

    this.results.connections = issues
    this.results.summary.connectionIssues = issues.length
    
    if (issues.length === 0) {
      console.log('✅ 所有连接线完整性检查通过')
    } else {
      console.log(`❌ 发现 ${issues.length} 个连接线问题`)
      issues.forEach(issue => {
        console.log(`  - ${issue.message}`)
      })
    }

    return issues
  }

  // 执行完整的完整性检查
  runFullCheck() {
    console.log('🚀 开始执行完整性检查...')
    console.log('=' .repeat(50))
    
    const startTime = performance.now()
    
    // 执行各项检查
    this.checkNodeCoordinates()
    this.checkPreviewLines()
    this.checkConnections()
    
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    
    // 计算总问题数
    this.results.summary.totalIssues = 
      this.results.summary.nodeIssues + 
      this.results.summary.previewLineIssues + 
      this.results.summary.connectionIssues
    
    // 输出总结报告
    console.log('=' .repeat(50))
    console.log('📋 完整性检查报告')
    console.log(`⏱️  检查耗时: ${duration}ms`)
    console.log(`📊 节点坐标问题: ${this.results.summary.nodeIssues}`)
    console.log(`📊 预览线问题: ${this.results.summary.previewLineIssues}`)
    console.log(`📊 连接线问题: ${this.results.summary.connectionIssues}`)
    console.log(`📊 总问题数: ${this.results.summary.totalIssues}`)
    
    if (this.results.summary.totalIssues === 0) {
      console.log('🎉 系统完整性检查全部通过！')
    } else {
      console.log('⚠️  发现完整性问题，请查看详细信息')
      console.log('💡 提示：可以调用 integrityTester.getDetailedReport() 获取详细报告')
    }
    
    console.log('=' .repeat(50))
    
    return this.results
  }

  // 获取详细报告
  getDetailedReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      details: {
        nodeCoordinates: this.results.nodeCoordinates,
        previewLines: this.results.previewLines,
        connections: this.results.connections
      }
    }
  }

  // 修复NaN坐标问题
  fixNaNCoordinates() {
    console.log('🔧 尝试修复NaN坐标问题...')
    
    try {
      const graph = window.graph || window.taskFlowGraph
      if (!graph) {
        console.log('❌ 未找到图实例，无法修复')
        return false
      }

      const nodes = graph.getNodes()
      let fixedCount = 0
      
      nodes.forEach(node => {
        const position = node.getPosition()
        let needsFix = false
        let newPosition = { ...position }
        
        if (isNaN(position.x) || position.x === undefined || position.x === null) {
          newPosition.x = Math.random() * 400 + 100 // 随机X坐标
          needsFix = true
        }
        
        if (isNaN(position.y) || position.y === undefined || position.y === null) {
          newPosition.y = Math.random() * 300 + 100 // 随机Y坐标
          needsFix = true
        }
        
        if (needsFix) {
          node.setPosition(newPosition)
          fixedCount++
          console.log(`🔧 修复节点 ${node.id} 坐标: ${JSON.stringify(newPosition)}`)
        }
      })
      
      if (fixedCount > 0) {
        console.log(`✅ 成功修复 ${fixedCount} 个节点的坐标问题`)
        return true
      } else {
        console.log('ℹ️  没有发现需要修复的坐标问题')
        return true
      }
      
    } catch (error) {
      console.log(`❌ 修复过程中发生错误: ${error.message}`)
      return false
    }
  }
}

// 创建全局实例
window.integrityTester = new IntegrityTester()

// 便捷方法
window.checkIntegrity = () => window.integrityTester.runFullCheck()
window.fixCoordinates = () => window.integrityTester.fixNaNCoordinates()
window.getIntegrityReport = () => window.integrityTester.getDetailedReport()

// 输出使用说明
console.log('🎯 完整性测试工具已加载！')
console.log('📖 使用方法：')
console.log('  - checkIntegrity()     : 执行完整的完整性检查')
console.log('  - fixCoordinates()     : 修复NaN坐标问题')
console.log('  - getIntegrityReport() : 获取详细报告')
console.log('  - integrityTester      : 访问完整的测试器实例')
console.log('')
console.log('💡 建议先运行 checkIntegrity() 检查系统状态')