/**
 * 调试分支节点预览线创建问题
 */

import UnifiedPreviewLineManager from './src/utils/UnifiedPreviewLineManager.js'

// 模拟图形对象
const mockGraph = {
  getOutgoingEdges: () => {
    // 模拟只有1个分支已连接（总共3个分支）
    return [
      {
        id: 'edge_1',
        getData: () => ({ branchId: 'crowd_1', isPreview: false }),
        getSourceCellId: () => 'node_1756879013860',
        getTargetCellId: () => 'target_node_1'
      }
    ]
  },
  getIncomingEdges: () => [],
  addEdge: (edgeConfig) => {
    console.log('🔧 [Mock Graph] 添加边:', {
      source: edgeConfig.source,
      target: edgeConfig.target,
      data: edgeConfig.data
    })
    return { 
      id: `preview_${Date.now()}`,
      getData: () => edgeConfig.data || {},
      setRouter: () => {},
      setAttrs: () => {},
      getSourcePoint: () => ({ x: 300, y: 200 }),
      getTargetPoint: () => ({ x: 400, y: 300 }),
      getTarget: () => ({ x: 400, y: 300 }),
      getSource: () => ({ x: 300, y: 200 }),
      getVertices: () => [],
      setVertices: () => {},
      getSourceCellId: () => edgeConfig.source?.cell || edgeConfig.source,
      getTargetCellId: () => edgeConfig.target?.cell || edgeConfig.target
    }
  },
  removeEdge: () => {},
  getCellById: (id) => {
    if (id === 'node_1756879013860') {
      return mockNode
    }
    return null
  },
  hasCell: () => true,
  on: () => {},
  off: () => {}
}

// 模拟分支节点 - 使用调试日志中的实际数据
const mockNode = {
  id: 'node_1756879013860',
  getId: () => 'node_1756879013860',
  getData: () => ({
    type: 'audience-split',
    nodeType: 'audience-split',
    label: '人群分流',
    color: '#FF6B35',
    shape: 'rect',
    width: 120,
    height: 60,
    maxOutputs: 10,
    autoExpand: true,
    nextSlots: [],
    crowdLayers: [
      { id: 'crowd_1', crowdName: '高响应客群', crowdId: 'crowd_001' },
      { id: 'crowd_2', crowdName: '低响应客群', crowdId: 'crowd_002' },
      { id: 'crowd_3', crowdName: '中等响应客群', crowdId: 'crowd_003' }
    ],
    unmatchBranch: {
      id: 'unmatch_default',
      name: '未命中人群',
      crowdName: '未命中人群'
    },
    branches: [
      { id: 'crowd_1', crowdName: '高响应客群' },
      { id: 'crowd_2', crowdName: '低响应客群' },
      { id: 'crowd_3', crowdName: '中等响应客群' }
    ],
    branchCount: 3,
    audiences: [],
    isConfigured: true // 关键：已配置状态
  }),
  getPosition: () => ({ x: 300, y: 200 }),
  getSize: () => ({ width: 120, height: 60 }),
  isNode: () => true,
  setData: (data) => {
    console.log('🔧 [Mock Node] setData called:', data)
  }
}

// 创建预览线管理器
const previewManager = new UnifiedPreviewLineManager(
  mockGraph,
  null, // branchManager
  {}, // layoutConfig
  null // layoutEngine
)

// 清除缓存以确保重新生成分支信息
previewManager.branchInfoCache.clear()
console.log('🧹 [调试] 已清除分支信息缓存')

console.log('\n=== 开始调试分支节点预览线创建 ===')
console.log('节点ID:', mockNode.id)
console.log('节点数据:', JSON.stringify(mockNode.getData(), null, 2))

// 直接测试 generateBranchesByType 方法
console.log('\n--- 步骤0: 直接测试分支生成方法 ---')
const nodeData = mockNode.getData()
try {
  const branches = previewManager.generateBranchesByType(nodeData.nodeType, nodeData, mockNode.id)
  console.log('generateBranchesByType 结果:', branches)
  console.log('分支数量:', branches.length)
} catch (error) {
  console.error('generateBranchesByType 错误:', error)
}

// 1. 测试 shouldCreatePreviewLine
console.log('\n--- 步骤1: 检查是否应该创建预览线 ---')
const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)
console.log('shouldCreatePreviewLine 结果:', shouldCreate)

// 2. 测试 createUnifiedPreviewLine
console.log('\n--- 步骤2: 尝试创建统一预览线 ---')
try {
  const result = previewManager.createUnifiedPreviewLine(mockNode, 'INTERACTIVE', {})
  console.log('createUnifiedPreviewLine 结果:', result)
} catch (error) {
  console.error('createUnifiedPreviewLine 错误:', error)
}

// 3. 直接测试 createBranchPreviewLines
console.log('\n--- 步骤3: 直接测试分支预览线创建 ---')
try {
  const branchResult = previewManager.createBranchPreviewLines(mockNode, 'INTERACTIVE', {})
  console.log('createBranchPreviewLines 结果:', branchResult)
} catch (error) {
  console.error('createBranchPreviewLines 错误:', error)
}

// 4. 检查预览线管理器状态
console.log('\n--- 步骤4: 检查预览线管理器状态 ---')
try {
  const allLines = previewManager.getAllPreviewLines()
  console.log('所有预览线:', allLines)
} catch (error) {
  console.error('获取所有预览线错误:', error)
}

console.log('\n=== 调试完成 ===')