/**
 * 测试实际应用中的节点对象结构
 * 通过模拟PreviewLineSystem的逻辑来检查节点对象
 */

// 模拟一个简单的节点对象，基于X6的实际API
class MockX6Node {
  constructor(config) {
    this.id = config.id
    this.shape = config.shape
    this._data = config.data || {}
    this._position = { x: config.x || 0, y: config.y || 0 }
    this._size = { width: config.width || 100, height: config.height || 60 }
  }
  
  // X6节点的实际方法
  getData() {
    return this._data
  }
  
  getPosition() {
    return this._position
  }
  
  getSize() {
    return this._size
  }
  
  setData(data) {
    this._data = { ...this._data, ...data }
  }
  
  setPosition(x, y) {
    this._position = { x, y }
  }
  
  setSize(width, height) {
    this._size = { width, height }
  }
}

// 模拟图形对象
class MockGraph {
  constructor() {
    this.nodes = []
  }
  
  addNode(config) {
    const node = new MockX6Node(config)
    this.nodes.push(node)
    return node
  }
  
  getNodes() {
    return this.nodes
  }
}

// 测试函数
function testRealNodeStructure() {
  console.log('\n=== 测试实际节点对象结构 ===')
  
  // 创建模拟图形
  const graph = new MockGraph()
  
  // 添加测试节点
  const nodeConfigs = [
    {
      id: 'start-node',
      shape: 'circle',
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      data: {
        type: 'start',
        nodeType: 'start',
        isConfigured: true,
        label: '开始节点'
      }
    },
    {
      id: 'process-node',
      shape: 'rect',
      x: 300,
      y: 200,
      width: 140,
      height: 100,
      data: {
        type: 'process',
        nodeType: 'process',
        isConfigured: false,
        label: '处理节点'
      }
    }
  ]
  
  nodeConfigs.forEach(config => {
    graph.addNode(config)
  })
  
  console.log('✅ 创建了', graph.getNodes().length, '个测试节点')
  
  // 模拟PreviewLineSystem的createPreviewLinesForExistingNodes逻辑
  console.log('\n--- 模拟PreviewLineSystem逻辑 ---')
  
  const nodes = graph.getNodes()
  console.log('获取到节点数量:', nodes.length)
  
  nodes.forEach((node, index) => {
    console.log(`\n节点 ${index + 1}:`)
    console.log('  ID:', node.id)
    console.log('  类型:', typeof node)
    
    // 检查方法可用性
    const methods = ['getData', 'getPosition', 'getSize']
    console.log('  方法可用性:')
    methods.forEach(method => {
      const hasMethod = typeof node[method] === 'function'
      console.log(`    ${method}: ${hasMethod ? '✅' : '❌'}`)
    })
    
    // 测试getData方法
    try {
      const nodeData = node.getData()
      console.log('  ✅ getData()成功:', nodeData)
      console.log('  节点类型:', nodeData.nodeType)
      console.log('  是否配置:', nodeData.isConfigured)
      
      // 模拟PreviewLineSystem的判断逻辑
      if (!nodeData.isConfigured) {
        console.log('  🔄 节点未配置，应该创建预览线')
        
        // 测试PreviewLineRenderer需要的方法
        try {
          const position = node.getPosition()
          const size = node.getSize()
          console.log('  ✅ getPosition()成功:', position)
          console.log('  ✅ getSize()成功:', size)
          console.log('  ✅ 节点对象符合PreviewLineRenderer要求')
        } catch (error) {
          console.error('  ❌ 节点方法调用失败:', error.message)
        }
      } else {
        console.log('  ✅ 节点已配置，跳过预览线创建')
      }
    } catch (error) {
      console.error('  ❌ getData()失败:', error.message)
    }
  })
  
  // 测试节点对象的原型链
  console.log('\n--- 节点对象原型链分析 ---')
  if (nodes.length > 0) {
    const firstNode = nodes[0]
    console.log('节点构造函数:', firstNode.constructor.name)
    
    // 检查原型链上的方法
    const allMethods = []
    let obj = firstNode
    while (obj && obj !== Object.prototype) {
      Object.getOwnPropertyNames(obj).forEach(prop => {
        if (typeof firstNode[prop] === 'function' && !allMethods.includes(prop)) {
          allMethods.push(prop)
        }
      })
      obj = Object.getPrototypeOf(obj)
    }
    
    console.log('所有可用方法:')
    allMethods.sort().forEach(method => {
      console.log(`  - ${method}`)
    })
  }
  
  console.log('\n=== 测试完成 ===')
}

// 运行测试
testRealNodeStructure()

// 额外测试：检查X6节点API的常见变体
console.log('\n=== X6 API变体测试 ===')

// 测试不同的API调用方式
class X6NodeVariant {
  constructor(config) {
    this.id = config.id
    this._data = config.data || {}
    this._position = { x: config.x || 0, y: config.y || 0 }
    this._size = { width: config.width || 100, height: config.height || 60 }
  }
  
  // 方式1: getData
  getData() {
    return this._data
  }
  
  // 方式2: data属性
  get data() {
    return this._data
  }
  
  // 方式3: position方法
  position() {
    return this._position
  }
  
  // 方式4: getPosition
  getPosition() {
    return this._position
  }
  
  // 方式5: size方法
  size() {
    return this._size
  }
  
  // 方式6: getSize
  getSize() {
    return this._size
  }
}

const variantNode = new X6NodeVariant({
  id: 'variant-test',
  data: { type: 'test', isConfigured: true },
  x: 50,
  y: 50,
  width: 100,
  height: 60
})

console.log('变体节点测试:')
console.log('  getData():', variantNode.getData())
console.log('  data属性:', variantNode.data)
console.log('  position():', variantNode.position())
console.log('  getPosition():', variantNode.getPosition())
console.log('  size():', variantNode.size())
console.log('  getSize():', variantNode.getSize())

console.log('\n✅ 所有API变体都可用')