/**
 * 测试X6 API兼容性问题
 * 检查不同情况下节点对象的方法可用性
 */

// 模拟可能出现的问题场景
console.log('=== X6 API兼容性测试 ===')

// 场景1：节点对象可能是代理对象或包装对象
function testProxyNode() {
  console.log('\n--- 测试代理节点对象 ---')
  
  const originalNode = {
    id: 'test-node',
    _data: { type: 'process', isConfigured: false },
    _position: { x: 100, y: 100 },
    _size: { width: 120, height: 80 },
    
    getData() { return this._data },
    getPosition() { return this._position },
    getSize() { return this._size }
  }
  
  // 创建代理对象（可能在某些情况下发生）
  const proxyNode = new Proxy(originalNode, {
    get(target, prop) {
      console.log(`访问属性: ${String(prop)}`)
      return target[prop]
    }
  })
  
  console.log('原始节点方法检查:')
  console.log('  getData:', typeof originalNode.getData)
  console.log('  getPosition:', typeof originalNode.getPosition)
  console.log('  getSize:', typeof originalNode.getSize)
  
  console.log('\n代理节点方法检查:')
  console.log('  getData:', typeof proxyNode.getData)
  console.log('  getPosition:', typeof proxyNode.getPosition)
  console.log('  getSize:', typeof proxyNode.getSize)
  
  try {
    const data = proxyNode.getData()
    console.log('✅ 代理节点getData()成功:', data)
  } catch (error) {
    console.error('❌ 代理节点getData()失败:', error.message)
  }
}

// 场景2：节点对象可能在某些状态下丢失方法
function testNodeStateIssues() {
  console.log('\n--- 测试节点状态问题 ---')
  
  // 模拟节点在不同状态下的情况
  const states = [
    {
      name: '正常状态',
      node: {
        id: 'normal-node',
        getData: () => ({ type: 'process', isConfigured: false }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 80 })
      }
    },
    {
      name: '方法被删除',
      node: {
        id: 'broken-node'
        // 故意不包含方法
      }
    },
    {
      name: '方法为null',
      node: {
        id: 'null-method-node',
        getData: null,
        getPosition: null,
        getSize: null
      }
    },
    {
      name: '方法为undefined',
      node: {
        id: 'undefined-method-node',
        getData: undefined,
        getPosition: undefined,
        getSize: undefined
      }
    },
    {
      name: '方法抛出异常',
      node: {
        id: 'error-node',
        getData: () => { throw new Error('getData方法内部错误') },
        getPosition: () => { throw new Error('getPosition方法内部错误') },
        getSize: () => { throw new Error('getSize方法内部错误') }
      }
    }
  ]
  
  states.forEach(({ name, node }) => {
    console.log(`\n测试状态: ${name}`)
    console.log('节点ID:', node.id)
    
    // 检查方法类型
    const methods = ['getData', 'getPosition', 'getSize']
    methods.forEach(method => {
      const methodType = typeof node[method]
      console.log(`  ${method}: ${methodType}`)
      
      if (methodType === 'function') {
        try {
          const result = node[method]()
          console.log(`    ✅ ${method}()成功:`, result)
        } catch (error) {
          console.log(`    ❌ ${method}()失败:`, error.message)
        }
      }
    })
  })
}

// 场景3：测试X6节点对象的原型链问题
function testPrototypeChainIssues() {
  console.log('\n--- 测试原型链问题 ---')
  
  // 模拟X6节点的原型链结构
  class BaseCell {
    constructor(config) {
      this.id = config.id
      this._data = config.data || {}
    }
  }
  
  class Node extends BaseCell {
    constructor(config) {
      super(config)
      this._position = { x: config.x || 0, y: config.y || 0 }
      this._size = { width: config.width || 100, height: config.height || 60 }
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
  
  const node = new Node({
    id: 'prototype-test-node',
    data: { type: 'process', isConfigured: false },
    x: 200,
    y: 200,
    width: 140,
    height: 100
  })
  
  console.log('节点类型:', typeof node)
  console.log('节点构造函数:', node.constructor.name)
  console.log('节点原型链:')
  
  let proto = Object.getPrototypeOf(node)
  let level = 0
  while (proto && level < 5) {
    console.log(`  级别${level}:`, proto.constructor.name)
    proto = Object.getPrototypeOf(proto)
    level++
  }
  
  // 测试方法可用性
  console.log('\n方法可用性:')
  const methods = ['getData', 'getPosition', 'getSize']
  methods.forEach(method => {
    const hasMethod = typeof node[method] === 'function'
    console.log(`  ${method}: ${hasMethod ? '✅' : '❌'}`)
    
    if (hasMethod) {
      try {
        const result = node[method]()
        console.log(`    结果:`, result)
      } catch (error) {
        console.log(`    错误:`, error.message)
      }
    }
  })
  
  // 测试方法是否在原型链上
  console.log('\n方法来源检查:')
  methods.forEach(method => {
    const hasOwnProperty = node.hasOwnProperty(method)
    const inPrototype = method in node
    console.log(`  ${method}:`)
    console.log(`    自有属性: ${hasOwnProperty}`)
    console.log(`    原型链中: ${inPrototype}`)
  })
}

// 场景4：测试异步获取节点的问题
function testAsyncNodeIssues() {
  console.log('\n--- 测试异步节点问题 ---')
  
  // 模拟异步获取节点的情况
  const mockGraph = {
    nodes: [],
    
    addNode(config) {
      const node = {
        id: config.id,
        _data: config.data,
        _position: { x: config.x, y: config.y },
        _size: { width: config.width, height: config.height },
        
        getData() { return this._data },
        getPosition() { return this._position },
        getSize() { return this._size }
      }
      this.nodes.push(node)
      return node
    },
    
    getNodes() {
      // 模拟异步返回（可能导致时序问题）
      return [...this.nodes]
    }
  }
  
  // 添加节点
  mockGraph.addNode({
    id: 'async-node-1',
    data: { type: 'process', isConfigured: false },
    x: 100, y: 100, width: 120, height: 80
  })
  
  // 立即获取节点（可能存在时序问题）
  const nodes = mockGraph.getNodes()
  console.log('获取到的节点数量:', nodes.length)
  
  if (nodes.length > 0) {
    const node = nodes[0]
    console.log('节点信息:', {
      id: node.id,
      type: typeof node,
      hasGetData: typeof node.getData === 'function'
    })
    
    // 测试在不同时机调用方法
    setTimeout(() => {
      console.log('\n延迟调用测试:')
      try {
        const data = node.getData()
        console.log('✅ 延迟调用getData()成功:', data)
      } catch (error) {
        console.error('❌ 延迟调用getData()失败:', error.message)
      }
    }, 10)
  }
}

// 运行所有测试
testProxyNode()
testNodeStateIssues()
testPrototypeChainIssues()
testAsyncNodeIssues()

// 场景5：模拟实际的PreviewLineSystem调用
function testRealWorldScenario() {
  console.log('\n\n=== 实际场景模拟 ===')
  
  // 模拟实际的节点创建过程
  const createRealNode = (config) => {
    // 模拟X6的addCell返回的节点对象
    const node = Object.create(null) // 创建无原型对象
    node.id = config.id
    node._data = config.data
    node._position = { x: config.x, y: config.y }
    node._size = { width: config.width, height: config.height }
    
    // 添加方法（可能在某些情况下丢失）
    if (Math.random() > 0.3) { // 70%概率有方法
      node.getData = function() { return this._data }
      node.getPosition = function() { return this._position }
      node.getSize = function() { return this._size }
    }
    
    return node
  }
  
  // 创建多个节点进行测试
  console.log('\n创建测试节点:')
  for (let i = 1; i <= 5; i++) {
    const node = createRealNode({
      id: `real-node-${i}`,
      data: { type: 'process', isConfigured: false },
      x: i * 100, y: i * 50,
      width: 120, height: 80
    })
    
    console.log(`\n节点 ${i}:`)
    console.log('  ID:', node.id)
    console.log('  类型:', typeof node)
    console.log('  原型:', Object.getPrototypeOf(node))
    
    const methods = ['getData', 'getPosition', 'getSize']
    let allMethodsAvailable = true
    
    methods.forEach(method => {
      const hasMethod = typeof node[method] === 'function'
      console.log(`  ${method}: ${hasMethod ? '✅' : '❌'}`)
      if (!hasMethod) allMethodsAvailable = false
    })
    
    if (allMethodsAvailable) {
      console.log('  ✅ 所有方法可用，可以创建预览线')
      try {
        const data = node.getData()
        console.log('  数据:', data)
      } catch (error) {
        console.log('  ❌ 调用方法时出错:', error.message)
      }
    } else {
      console.log('  ❌ 方法缺失，无法创建预览线')
    }
  }
}

setTimeout(testRealWorldScenario, 50)

console.log('\n=== 所有兼容性测试完成 ===')