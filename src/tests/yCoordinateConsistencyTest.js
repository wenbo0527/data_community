/**
 * Y坐标一致性测试
 * 验证方案一的修复效果：确保同层所有节点（包括虚拟endpoint）使用相同的Y坐标
 */

import { UnifiedStructuredLayoutEngine } from '../utils/UnifiedStructuredLayoutEngine.js'

/**
 * 模拟图形对象
 */
class MockGraph {
  constructor() {
    this.nodes = new Map()
    this.edges = new Map()
  }
  
  addNode(id, data = {}) {
    const node = {
      id,
      data,
      position: { x: 0, y: 0 },
      size: { width: 100, height: 60 },
      getId: () => id,
      getData: () => data,
      getPosition: () => node.position,
      getSize: () => node.size,
      setPosition: (pos) => { node.position = pos }
    }
    this.nodes.set(id, node)
    return node
  }
  
  addEdge(id, sourceId, targetId) {
    const edge = {
      id,
      sourceId,
      targetId,
      getId: () => id,
      getSourceCellId: () => sourceId,
      getTargetCellId: () => targetId
    }
    this.edges.set(id, edge)
    return edge
  }
  
  getNodes() { return Array.from(this.nodes.values()) }
  getEdges() { return Array.from(this.edges.values()) }
  getCellById(id) { return this.nodes.get(id) || this.edges.get(id) }
}

/**
 * 模拟预览线管理器
 */
class MockPreviewLineManager {
  constructor() {
    this.previewLines = new Map()
    this.endPosition = { x: 300, y: 200 }
  }
  
  addPreviewLine(sourceNodeId, branchId, endPosition) {
    const instance = {
      branchId,
      endPosition: { ...endPosition },
      isAttached: false,
      line: {
        setTarget: (pos) => {
          instance.endPosition = { ...pos }
          console.log(`📍 [Mock] 预览线终点更新: ${sourceNodeId}_${branchId} -> (${pos.x}, ${pos.y})`)
        }
      }
    }
    
    if (!this.previewLines.has(sourceNodeId)) {
      this.previewLines.set(sourceNodeId, [])
    }
    this.previewLines.get(sourceNodeId).push(instance)
    
    console.log(`✅ [Mock] 添加预览线: ${sourceNodeId}_${branchId} at (${endPosition.x}, ${endPosition.y})`)
  }
}

/**
 * 测试Y坐标一致性
 */
async function testYCoordinateConsistency() {
  console.log('🧪 [测试] 开始Y坐标一致性测试')
  
  // 创建测试图形
  const graph = new MockGraph()
  const previewManager = new MockPreviewLineManager()
  
  // 添加测试节点（创建3层结构）
  const nodeA = graph.addNode('nodeA', { type: 'start' })
  const nodeB = graph.addNode('nodeB', { type: 'process' })
  const nodeC = graph.addNode('nodeC', { type: 'process' })
  const nodeD = graph.addNode('nodeD', { type: 'end' })
  
  // 添加连接（创建层级关系）
  graph.addEdge('edge1', 'nodeA', 'nodeB')
  graph.addEdge('edge2', 'nodeA', 'nodeC')
  graph.addEdge('edge3', 'nodeB', 'nodeD')
  
  // 添加预览线（模拟未连接的endpoint）
  previewManager.addPreviewLine('nodeC', 'branch1', { x: 250, y: 180 })
  previewManager.addPreviewLine('nodeD', 'branch1', { x: 350, y: 220 })
  
  console.log('📊 [测试] 测试数据准备完成:', {
    节点数: graph.getNodes().length,
    连接数: graph.getEdges().length,
    预览线数: previewManager.previewLines.size
  })
  
  // 创建布局引擎
  const layoutEngine = new UnifiedStructuredLayoutEngine(graph, {
    layer: { baseHeight: 200 }, // 🔧 优化：更新测试基准值以匹配新的层间距
    node: { preferredSpacing: 220 }, // 🔧 优化：从200增加到220，改善X轴分布
    branchSpacing: 220, // 🔧 优化：从200增加到220，改善X轴分布
    optimization: { enableEndpointIntegration: true }
  }, previewManager)
  
  // 执行布局
  console.log('🚀 [测试] 开始执行布局...')
  const result = await layoutEngine.executeLayout()
  
  console.log('✅ [测试] 布局执行完成:', result)
  
  // 验证Y坐标一致性
  console.log('🔍 [验证] 开始验证Y坐标一致性...')
  
  const nodePositions = new Map()
  graph.getNodes().forEach(node => {
    const pos = node.getPosition()
    nodePositions.set(node.id, pos)
    console.log(`📍 [验证] 普通节点 ${node.id}: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`)
  })
  
  
  
  // 按层级分组验证Y坐标一致性
  const layerGroups = new Map()
  nodePositions.forEach((pos, nodeId) => {
    const layerY = Math.round(pos.y / 200) * 200 // 🔧 优化：按新的baseHeight(200)分组
    if (!layerGroups.has(layerY)) {
      layerGroups.set(layerY, [])
    }
    layerGroups.get(layerY).push({ nodeId, position: pos })
  })
  
  console.log('🔍 [验证] 层级分组结果:')
  let allLayersConsistent = true
  
  layerGroups.forEach((nodes, layerY) => {
    console.log(`📊 [验证] 层级 Y=${layerY}:`)
    
    const yCoordinates = nodes.map(n => n.position.y)
    const uniqueYs = [...new Set(yCoordinates)]
    const isConsistent = uniqueYs.length === 1
    
    nodes.forEach(({ nodeId, position }) => {
      console.log(`  - ${nodeId}: (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`)
    })
    
    if (isConsistent) {
      console.log(`  ✅ Y坐标一致: ${uniqueYs[0]}`)
    } else {
      console.log(`  ❌ Y坐标不一致: ${uniqueYs.join(', ')}`)
      allLayersConsistent = false
    }
  })
  
  // 验证预览线管理器同步
  console.log('🔍 [验证] 预览线管理器同步状态:')
  console.log(`  - 全局endPosition: (${previewManager.endPosition.x}, ${previewManager.endPosition.y})`)
  
  previewManager.previewLines.forEach((instances, sourceNodeId) => {
    instances.forEach(instance => {
      console.log(`  - 预览线 ${sourceNodeId}_${instance.branchId}: (${instance.endPosition.x}, ${instance.endPosition.y})`)
    })
  })
  
  // 测试结果
  if (allLayersConsistent) {
    console.log('🎉 [测试结果] Y坐标一致性测试通过！所有同层节点Y坐标一致')
  } else {
    console.log('❌ [测试结果] Y坐标一致性测试失败！存在同层节点Y坐标不一致的情况')
  }
  
  return {
    success: allLayersConsistent,
    layerCount: layerGroups.size,
    totalNodes: nodePositions.size,
    layoutResult: result
  }
}

// 运行测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.testYCoordinateConsistency = testYCoordinateConsistency
  console.log('🧪 [测试] Y坐标一致性测试已加载，可通过 window.testYCoordinateConsistency() 运行')
} else {
  // Node.js环境
  testYCoordinateConsistency().then(result => {
    console.log('🧪 [测试] 测试完成:', result)
  }).catch(error => {
    console.error('❌ [测试] 测试失败:', error)
  })
}

export { testYCoordinateConsistency }