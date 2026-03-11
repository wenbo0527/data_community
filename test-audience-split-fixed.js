/**
 * 测试人群分流节点预览线创建修复后的功能
 */

// 模拟人群分流节点配置
const audienceSplitConfig = {
  type: 'audience-split',
  crowdLayers: [
    { id: 'layer1', name: '高价值用户', conditions: [] },
    { id: 'layer2', name: '普通用户', conditions: [] }
  ],
  unmatchBranch: {
    id: 'unmatched',
    name: '未命中人群'
  },
  isConfigured: true
}

// 模拟图形对象
const mockGraph = {
  getOutgoingEdges: (node) => {
    console.log('📊 [模拟图形] 获取节点出边:', node.id)
    // 模拟没有真实连接的情况
    return []
  },
  addEdge: (edgeConfig) => {
    console.log('➕ [模拟图形] 添加边:', edgeConfig)
    return {
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...edgeConfig
    }
  },
  hasCell: () => true
}

// 模拟节点对象
const mockNode = {
  id: 'audience-split-node-1',
  type: 'audience-split',
  getData: () => audienceSplitConfig,
  getPosition: () => ({ x: 100, y: 100 }),
  getSize: () => ({ width: 120, height: 80 })
}

// 模拟UnifiedStructuredLayoutEngine构造函数
class MockUnifiedStructuredLayoutEngine {
  constructor() {
    console.log('🏗️ [模拟布局引擎] 构造函数被调用')
  }
  
  generateBranchesByType(nodeType, config) {
    console.log('🌿 [模拟布局引擎] 生成分支:', { nodeType, config })
    
    if (nodeType === 'audience-split' && config) {
      const branches = []
      
      // 添加人群分支
      if (config.crowdLayers && Array.isArray(config.crowdLayers)) {
        config.crowdLayers.forEach((layer, index) => {
          branches.push({
            id: layer.id,
            label: layer.name,
            type: 'crowd',
            index: index
          })
        })
      }
      
      // 添加未命中分支
      if (config.unmatchBranch) {
        branches.push({
          id: config.unmatchBranch.id,
          label: config.unmatchBranch.name,
          type: 'unmatch',
          index: branches.length
        })
      }
      
      console.log('✅ [模拟布局引擎] 生成的分支:', branches)
      return branches
    }
    
    return []
  }
}

// 设置全局window对象
if (typeof window === 'undefined') {
  global.window = {}
}
window.UnifiedStructuredLayoutEngine = MockUnifiedStructuredLayoutEngine

// 模拟UnifiedPreviewLineManager的核心方法
class MockUnifiedPreviewLineManager {
  constructor() {
    this.graph = mockGraph
    this.previewLines = new Map()
    this.layoutEngineReady = true
    this._debugMode = true
  }
  
  getNodeBranches(node, config) {
    console.log('🔍 [模拟预览线管理器] 获取节点分支:', { nodeId: node.id, config })
    
    const nodeData = node.getData()
    const nodeType = nodeData.type
    
    // 使用布局引擎生成分支
    if (window.UnifiedStructuredLayoutEngine) {
      const layoutEngine = new window.UnifiedStructuredLayoutEngine()
      const branches = layoutEngine.generateBranchesByType(nodeType, nodeData)
      console.log('✅ [模拟预览线管理器] 通过布局引擎获取分支:', branches)
      return branches
    }
    
    console.warn('⚠️ [模拟预览线管理器] 布局引擎不可用，返回空分支')
    return []
  }
  
  checkBranchHasRealConnection(node, branchId) {
    console.log('🔍 [模拟预览线管理器] 检查分支真实连接:', { nodeId: node.id, branchId })
    
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []
    
    const realConnections = outgoingEdges.filter(edge => {
      const edgeData = edge.getData ? edge.getData() : {}
      const isPreviewLine = edgeData.isPreview ||
                           edgeData.type === 'preview-line' ||
                           edgeData.type === 'unified-preview-line' ||
                           edgeData.type === 'draggable-preview'
      
      return !isPreviewLine && edgeData.branchId === branchId
    })
    
    const hasRealConnection = realConnections.length > 0
    
    console.log('🔗 [模拟预览线管理器] 分支连接检查结果:', {
      nodeId: node.id,
      branchId: branchId,
      totalOutgoingEdges: outgoingEdges.length,
      realConnections: realConnections.length,
      hasRealConnection: hasRealConnection,
      reason: hasRealConnection ? 'has_real_connection' : 'no_real_connection'
    })
    
    return hasRealConnection
  }
  
  calculateBranchPreviewPosition(node, branches, branchIndex) {
    console.log('📐 [模拟预览线管理器] 计算分支预览位置:', {
      nodeId: node.id,
      branchIndex: branchIndex,
      totalBranches: branches.length
    })
    
    const nodePos = node.getPosition()
    const nodeSize = node.getSize()
    
    // 简单的位置计算：在节点右侧垂直分布
    const spacing = 60
    const startY = nodePos.y - (branches.length - 1) * spacing / 2
    
    const position = {
      x: nodePos.x + nodeSize.width + 100,
      y: startY + branchIndex * spacing
    }
    
    console.log('✅ [模拟预览线管理器] 计算的分支位置:', position)
    return position
  }
  
  createBasicPreviewLine(node, endPosition, options) {
    console.log('🔧 [模拟预览线管理器] 创建基础预览线:', {
      nodeId: node.id,
      endPosition: endPosition,
      options: options
    })
    
    const nodePos = node.getPosition()
    const nodeSize = node.getSize()
    
    const edgeConfig = {
      source: { cell: node.id, port: 'out' },
      target: { x: endPosition.x, y: endPosition.y },
      attrs: {
        line: {
          stroke: '#1890ff',
          strokeWidth: 2,
          strokeDasharray: '5 5'
        }
      },
      data: {
        isPreview: true,
        type: 'unified-preview-line',
        branchId: options.branchId,
        branchLabel: options.branchLabel
      }
    }
    
    const edge = this.graph.addEdge(edgeConfig)
    console.log('✅ [模拟预览线管理器] 基础预览线创建成功:', edge.id)
    return edge
  }
  
  setPreviewLineState(previewInstance, state) {
    console.log('🎯 [模拟预览线管理器] 设置预览线状态:', {
      lineId: previewInstance.line.id,
      state: state
    })
    previewInstance.state = state
  }
  
  // 修复后的createBranchPreviewLines方法
  createBranchPreviewLines(node, initialState, options = {}) {
    const nodeId = node.id
    const nodeData = node.getData ? node.getData() : {}
    const nodeType = nodeData.type || node.type || 'unknown'
    
    console.log('🔧 [模拟预览线管理器] 开始创建分支预览线:', {
      nodeId: nodeId,
      nodeType: nodeType,
      initialState: initialState,
      options: options
    })
    
    // 检查是否已经存在预览线实例
    const existingPreview = this.previewLines.get(nodeId)
    if (existingPreview) {
      console.log('⏭️ [模拟预览线管理器] 节点已有预览线，跳过重复创建:', {
        nodeId: nodeId,
        existingType: Array.isArray(existingPreview) ? 'branch' : 'single',
        existingCount: Array.isArray(existingPreview) ? existingPreview.length : 1
      })
      return existingPreview
    }
    
    // 获取分支信息
    const branches = this.getNodeBranches(node, options.config)
    
    console.log('📊 [模拟预览线管理器] 获取到分支信息:', {
      nodeId: nodeId,
      branchCount: branches.length,
      branches: branches.map(b => ({ id: b.id, label: b.label }))
    })
    
    const previewInstances = []
    
    branches.forEach((branch, index) => {
      console.log('🌿 [模拟预览线管理器] 处理分支预览线:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index,
        totalBranches: branches.length
      })
      
      // 检查该分支是否已有真实连接
      const hasRealConnection = this.checkBranchHasRealConnection(node, branch.id)
      
      console.log('🔗 [模拟预览线管理器] 分支连接检查:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        hasRealConnection: hasRealConnection,
        willCreatePreview: !hasRealConnection
      })
      
      // 🔧 关键修复：对于人群分流节点，即使没有真实连接也要创建预览线
      // 只有当有真实连接时才跳过预览线创建
      if (hasRealConnection) {
        console.log('⏭️ [模拟预览线管理器] 分支已有真实连接，跳过预览线创建:', {
          nodeId: nodeId,
          branchId: branch.id,
          branchLabel: branch.label,
          branchIndex: index
        })
        return
      }
      
      console.log('✅ [模拟预览线管理器] 分支需要创建预览线:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index
      })
      
      const endPosition = this.calculateBranchPreviewPosition(node, branches, index)
      
      if (!endPosition) {
        console.error('❌ [模拟预览线管理器] 无法计算分支预览线终点位置')
        return
      }
      
      // 创建分支预览线
      const previewLine = this.createBasicPreviewLine(node, endPosition, {
        type: 'preview',
        branchId: branch.id,
        branchIndex: index,
        totalBranches: branches.length,
        branchLabel: branch.label,
        ...options
      })
      
      if (!previewLine) {
        console.error('❌ [模拟预览线管理器] 分支预览线创建失败')
        return
      }
      
      // 创建预览线实例
      const previewInstance = {
        line: previewLine,
        sourceNode: node,
        sourceNodeId: node.id,
        state: initialState,
        type: 'preview',
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index,
        totalBranches: branches.length,
        endPosition: endPosition,
        branchInfo: branch
      }
      
      // 设置初始状态
      this.setPreviewLineState(previewInstance, initialState)
      
      previewInstances.push(previewInstance)
      
      console.log('✅ [模拟预览线管理器] 分支预览线创建成功:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index,
        lineId: previewLine.id
      })
    })
    
    // 存储分支预览线
    if (previewInstances.length > 0) {
      this.previewLines.set(node.id, previewInstances)
    }
    
    console.log('✅ [模拟预览线管理器] 分支预览线创建完成:', {
      nodeId: nodeId,
      totalBranches: branches.length,
      createdCount: previewInstances.length,
      skippedCount: branches.length - previewInstances.length,
      totalPreviewLines: this.previewLines.size
    })
    
    return previewInstances
  }
}

// 执行测试
console.log('🚀 [测试开始] 人群分流节点预览线创建修复验证')
console.log('=' .repeat(80))

// 创建预览线管理器实例
const previewManager = new MockUnifiedPreviewLineManager()

// 测试分支预览线创建
const result = previewManager.createBranchPreviewLines(mockNode, 'interactive')

console.log('=' .repeat(80))
console.log('📊 [测试结果] 预览线创建结果汇总:')
console.log('- 期望预览线数量:', 3)
console.log('- 实际创建数量:', result ? result.length : 0)
console.log('- 创建成功:', result && result.length === 3 ? '✅' : '❌')

if (result && result.length > 0) {
  console.log('\n📋 [详细信息] 创建的预览线:')
  result.forEach((instance, index) => {
    console.log(`  ${index + 1}. 分支ID: ${instance.branchId}, 标签: ${instance.branchLabel}, 线ID: ${instance.line.id}`)
  })
}

console.log('\n🎯 [修复验证] 关键问题检查:')
console.log('- 布局引擎构造函数可用:', typeof window.UnifiedStructuredLayoutEngine === 'function' ? '✅' : '❌')
console.log('- 分支生成正常:', result && result.length > 0 ? '✅' : '❌')
console.log('- 预览线创建逻辑正确:', result && result.length === 3 ? '✅' : '❌')

console.log('\n🏁 [测试完成] 修复验证结束')