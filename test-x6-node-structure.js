/**
 * 测试实际X6节点对象的结构和方法
 */

import { Graph } from '@antv/x6'

// 创建一个简单的X6图形实例
const container = {
  clientWidth: 800,
  clientHeight: 600,
  appendChild: () => {},
  removeChild: () => {},
  querySelector: () => null
}

// 模拟DOM环境
if (typeof document === 'undefined') {
  global.document = {
    createElement: (tag) => ({
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      clientWidth: 800,
      clientHeight: 600
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {}
    }
  }
}

if (typeof window === 'undefined') {
  global.window = {
    getComputedStyle: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {}
  }
}

try {
  console.log('\n=== 测试X6节点对象结构 ===')
  
  // 创建X6图形实例
  const graph = new Graph({
    container: container,
    width: 800,
    height: 600,
    background: {
      color: '#f5f5f5'
    }
  })
  
  console.log('✅ X6图形实例创建成功')
  
  // 添加一个测试节点
  const nodeConfig = {
    id: 'test-node-x6',
    shape: 'circle',
    x: 100,
    y: 100,
    width: 120,
    height: 80,
    label: '测试节点',
    data: {
      type: 'start',
      nodeType: 'start',
      isConfigured: true,
      label: '测试节点'
    }
  }
  
  const node = graph.addNode(nodeConfig)
  console.log('✅ 节点添加成功，节点ID:', node.id)
  
  // 测试节点对象的方法
  console.log('\n--- X6节点对象方法测试 ---')
  console.log('节点类型:', typeof node)
  console.log('节点构造函数:', node.constructor.name)
  
  // 检查常用方法
  const methods = [
    'getData',
    'getPosition', 
    'getSize',
    'position',
    'size',
    'getAttrs',
    'setData',
    'setPosition',
    'setSize'
  ]
  
  console.log('\n方法可用性检查:')
  methods.forEach(method => {
    const hasMethod = typeof node[method] === 'function'
    console.log(`  ${method}: ${hasMethod ? '✅' : '❌'}`)
  })
  
  // 测试getData方法
  console.log('\n--- getData方法测试 ---')
  if (typeof node.getData === 'function') {
    try {
      const data = node.getData()
      console.log('✅ getData()成功:', data)
    } catch (error) {
      console.error('❌ getData()失败:', error.message)
    }
  } else {
    console.log('❌ getData方法不存在')
  }
  
  // 测试getPosition方法
  console.log('\n--- getPosition方法测试 ---')
  if (typeof node.getPosition === 'function') {
    try {
      const position = node.getPosition()
      console.log('✅ getPosition()成功:', position)
    } catch (error) {
      console.error('❌ getPosition()失败:', error.message)
    }
  } else if (typeof node.position === 'function') {
    try {
      const position = node.position()
      console.log('✅ position()成功:', position)
    } catch (error) {
      console.error('❌ position()失败:', error.message)
    }
  } else {
    console.log('❌ getPosition和position方法都不存在')
  }
  
  // 测试getSize方法
  console.log('\n--- getSize方法测试 ---')
  if (typeof node.getSize === 'function') {
    try {
      const size = node.getSize()
      console.log('✅ getSize()成功:', size)
    } catch (error) {
      console.error('❌ getSize()失败:', error.message)
    }
  } else if (typeof node.size === 'function') {
    try {
      const size = node.size()
      console.log('✅ size()成功:', size)
    } catch (error) {
      console.error('❌ size()失败:', error.message)
    }
  } else {
    console.log('❌ getSize和size方法都不存在')
  }
  
  // 列出所有可用方法
  console.log('\n--- 节点对象所有方法 ---')
  const allMethods = []
  let obj = node
  while (obj && obj !== Object.prototype) {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (typeof node[prop] === 'function' && !allMethods.includes(prop)) {
        allMethods.push(prop)
      }
    })
    obj = Object.getPrototypeOf(obj)
  }
  
  console.log('可用方法列表:')
  allMethods.sort().forEach(method => {
    console.log(`  - ${method}`)
  })
  
  // 测试通过graph.getNodes()获取的节点
  console.log('\n--- 通过graph.getNodes()获取节点测试 ---')
  const nodes = graph.getNodes()
  console.log('获取到的节点数量:', nodes.length)
  
  if (nodes.length > 0) {
    const firstNode = nodes[0]
    console.log('第一个节点ID:', firstNode.id)
    console.log('第一个节点类型:', typeof firstNode)
    console.log('第一个节点构造函数:', firstNode.constructor.name)
    
    // 检查方法可用性
    console.log('方法可用性:')
    methods.forEach(method => {
      const hasMethod = typeof firstNode[method] === 'function'
      console.log(`  ${method}: ${hasMethod ? '✅' : '❌'}`)
    })
    
    // 测试getData
    if (typeof firstNode.getData === 'function') {
      try {
        const data = firstNode.getData()
        console.log('✅ 通过getNodes获取的节点getData()成功:', data)
      } catch (error) {
        console.error('❌ 通过getNodes获取的节点getData()失败:', error.message)
      }
    }
  }
  
} catch (error) {
  console.error('❌ 测试过程中发生错误:', error)
  console.error('错误堆栈:', error.stack)
}

console.log('\n=== 测试完成 ===')