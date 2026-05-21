/**
 * 测试节点对象方法可用性
 */

// 模拟X6图和节点
class MockX6Node {
  constructor(id, data = {}) {
    this.id = id
    this._data = data
    this._position = { x: 100, y: 100 }
    this._size = { width: 120, height: 60 }
  }
  
  getData() {
    return this._data
  }
  
  getPosition() {
    return this._position
  }
  
  getSize() {
    return this._size
  }
}

class MockX6Graph {
  constructor() {
    this.nodes = []
  }
  
  addNode(nodeConfig) {
    const node = new MockX6Node(nodeConfig.id, nodeConfig.data)
    this.nodes.push(node)
    return node
  }
  
  getNodes() {
    return this.nodes
  }
  
  addEdge(edgeConfig) {
    return {
      id: edgeConfig.id,
      ...edgeConfig
    }
  }
}

// 测试节点方法
function testNodeMethods() {
  console.log('\n=== 测试节点对象方法可用性 ===')
  
  const graph = new MockX6Graph()
  
  // 添加测试节点
  const node1 = graph.addNode({
    id: 'test-node-1',
    data: {
      type: 'start',
      nodeType: 'start',
      isConfigured: true,
      label: '测试节点1'
    }
  })
  
  const node2 = graph.addNode({
    id: 'test-node-2', 
    data: {
      type: 'sms',
      nodeType: 'sms',
      isConfigured: true,
      label: '测试节点2'
    }
  })
  
  console.log('\n--- 节点1方法测试 ---')
  console.log('节点ID:', node1.id)
  console.log('hasGetData:', typeof node1.getData === 'function')
  console.log('hasGetPosition:', typeof node1.getPosition === 'function')
  console.log('hasGetSize:', typeof node1.getSize === 'function')
  
  if (typeof node1.getData === 'function') {
    console.log('getData()结果:', node1.getData())
  }
  
  if (typeof node1.getPosition === 'function') {
    console.log('getPosition()结果:', node1.getPosition())
  }
  
  if (typeof node1.getSize === 'function') {
    console.log('getSize()结果:', node1.getSize())
  }
  
  console.log('\n--- 图形节点获取测试 ---')
  const nodes = graph.getNodes()
  console.log('图形中节点数量:', nodes.length)
  
  nodes.forEach((node, index) => {
    console.log(`\n节点${index + 1}:`, {
      id: node.id,
      type: typeof node,
      hasGetData: typeof node.getData === 'function',
      hasGetPosition: typeof node.getPosition === 'function',
      hasGetSize: typeof node.getSize === 'function',
      availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(node))
        .filter(prop => typeof node[prop] === 'function')
    })
    
    if (typeof node.getData === 'function') {
      try {
        const data = node.getData()
        console.log('  节点数据:', data)
      } catch (error) {
        console.error('  获取节点数据失败:', error.message)
      }
    }
  })
}

// 测试预览线系统兼容性
function testPreviewLineCompatibility() {
  console.log('\n\n=== 测试预览线系统兼容性 ===')
  
  const graph = new MockX6Graph()
  
  // 添加已配置节点
  const configuredNode = graph.addNode({
    id: 'configured-node',
    data: {
      type: 'start',
      nodeType: 'start', 
      isConfigured: true,
      label: '已配置节点'
    }
  })
  
  // 模拟PreviewLineSystem的createPreviewLinesForExistingNodes逻辑
  console.log('\n--- 模拟PreviewLineSystem逻辑 ---')
  const nodes = graph.getNodes()
  console.log('获取到的节点数量:', nodes.length)
  
  let createdCount = 0
  
  for (const node of nodes) {
    try {
      // 验证节点对象的方法可用性
      if (!node || typeof node.getData !== 'function') {
        console.warn('节点对象无效或缺少getData方法:', {
          nodeId: node?.id,
          nodeType: typeof node,
          hasGetData: typeof node?.getData === 'function',
          hasGetPosition: typeof node?.getPosition === 'function',
          hasGetSize: typeof node?.getSize === 'function'
        })
        continue
      }
      
      const nodeData = node.getData()
      if (!nodeData) {
        console.log('节点无数据，跳过:', node.id)
        continue
      }
      
      console.log('检查节点:', {
        nodeId: node.id,
        nodeType: nodeData.nodeType || nodeData.type,
        isConfigured: nodeData.isConfigured,
        hasRequiredMethods: {
          getData: typeof node.getData === 'function',
          getPosition: typeof node.getPosition === 'function',
          getSize: typeof node.getSize === 'function'
        }
      })
      
      // 检查节点是否已配置且需要预览线
      if (nodeData.isConfigured) {
        console.log('✅ 节点符合预览线创建条件:', node.id)
        
        // 模拟预览线创建逻辑
        if (typeof node.getPosition === 'function' && typeof node.getSize === 'function') {
          const position = node.getPosition()
          const size = node.getSize()
          console.log('  节点位置:', position)
          console.log('  节点大小:', size)
          createdCount++
        }
      }
    } catch (error) {
      console.warn('为节点创建预览线失败:', {
        nodeId: node?.id,
        error: error.message
      })
    }
  }
  
  console.log('\n预览线创建模拟完成，成功创建数量:', createdCount)
}

// 运行测试
testNodeMethods()
testPreviewLineCompatibility()

console.log('\n=== 测试完成 ===')