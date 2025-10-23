/**
 * 调试预览线创建问题
 * 模拟实际应用环境来重现"3条日志"问题
 */

// 模拟Vue环境
if (typeof global !== 'undefined') {
  global.console = console
}

// 模拟X6节点对象（基于实际X6 API）
class X6Node {
  constructor(config) {
    this.id = config.id
    this.shape = config.shape
    this._data = config.data || {}
    this._position = { x: config.x || 0, y: config.y || 0 }
    this._size = { width: config.width || 100, height: config.height || 60 }
    this.attrs = config.attrs || {}
  }
  
  // X6节点的标准API
  getData() {
    return this._data
  }
  
  setData(data) {
    this._data = { ...this._data, ...data }
  }
  
  position(x, y) {
    if (arguments.length === 0) {
      return this._position
    }
    this._position = { x, y }
    return this
  }
  
  getPosition() {
    return this._position
  }
  
  size(width, height) {
    if (arguments.length === 0) {
      return this._size
    }
    this._size = { width, height }
    return this
  }
  
  getSize() {
    return this._size
  }
  
  setAttrByPath(path, value) {
    // 模拟设置属性
    console.log(`设置属性 ${path} = ${value}`)
  }
}

// 模拟X6图形对象
class X6Graph {
  constructor() {
    this.cells = []
  }
  
  addCell(config) {
    const node = new X6Node(config)
    this.cells.push(node)
    return node
  }
  
  getNodes() {
    return this.cells.filter(cell => cell instanceof X6Node)
  }
  
  getCellById(id) {
    return this.cells.find(cell => cell.id === id)
  }
  
  removeCell(cell) {
    const index = this.cells.indexOf(cell)
    if (index > -1) {
      this.cells.splice(index, 1)
    }
  }
}

// 模拟PreviewLineRenderer
class MockPreviewLineRenderer {
  constructor(graph) {
    this.graph = graph
  }
  
  createPreviewLine(sourceNode) {
    console.log('\n=== PreviewLineRenderer.createPreviewLine 开始 ===')
    console.log('传入的sourceNode:', {
      id: sourceNode?.id,
      type: typeof sourceNode,
      constructor: sourceNode?.constructor?.name
    })
    
    // 检查节点是否存在
    if (!sourceNode) {
      console.error('❌ sourceNode为空')
      return null
    }
    
    // 检查节点是否有id
    if (!sourceNode.id) {
      console.error('❌ sourceNode没有id属性')
      return null
    }
    
    // 检查节点是否在图中
    const nodeInGraph = this.graph.getCellById(sourceNode.id)
    if (!nodeInGraph) {
      console.error('❌ 节点不在图中:', sourceNode.id)
      return null
    }
    
    console.log('✅ 节点基础检查通过')
    
    // 检查节点方法可用性
    const requiredMethods = ['getData', 'getPosition', 'getSize']
    console.log('\n--- 检查节点方法可用性 ---')
    
    for (const method of requiredMethods) {
      const hasMethod = typeof sourceNode[method] === 'function'
      console.log(`${method}: ${hasMethod ? '✅' : '❌'}`)
      
      if (!hasMethod) {
        console.error(`❌ sourceNode.${method} is not a function`)
        return null
      }
    }
    
    console.log('✅ 所有必需方法都可用')
    
    // 尝试调用getData方法
    console.log('\n--- 调用getData方法 ---')
    try {
      const nodeData = sourceNode.getData()
      console.log('✅ getData()成功:', nodeData)
      
      if (!nodeData) {
        console.warn('⚠️ getData()返回空数据')
        return null
      }
      
      // 检查isConfigured属性
      console.log('节点配置状态:', {
        isConfigured: nodeData.isConfigured,
        type: typeof nodeData.isConfigured
      })
      
      if (nodeData.isConfigured) {
        console.log('✅ 节点已配置，跳过预览线创建')
        return null
      }
      
    } catch (error) {
      console.error('❌ getData()调用失败:', error.message)
      return null
    }
    
    // 尝试调用getPosition方法
    console.log('\n--- 调用getPosition方法 ---')
    try {
      const position = sourceNode.getPosition()
      console.log('✅ getPosition()成功:', position)
    } catch (error) {
      console.error('❌ getPosition()调用失败:', error.message)
      return null
    }
    
    // 尝试调用getSize方法
    console.log('\n--- 调用getSize方法 ---')
    try {
      const size = sourceNode.getSize()
      console.log('✅ getSize()成功:', size)
    } catch (error) {
      console.error('❌ getSize()调用失败:', error.message)
      return null
    }
    
    console.log('\n✅ 预览线创建成功')
    return {
      id: `preview-${sourceNode.id}`,
      sourceNodeId: sourceNode.id,
      created: new Date().toISOString()
    }
  }
}

// 模拟PreviewLineSystem
class MockPreviewLineSystem {
  constructor(graph) {
    this.graph = graph
    this.previewLineRenderer = new MockPreviewLineRenderer(graph)
  }
  
  createPreviewLinesForExistingNodes() {
    console.log('\n=== PreviewLineSystem.createPreviewLinesForExistingNodes 开始 ===')
    
    const nodes = this.graph.getNodes()
    console.log('获取到的节点数量:', nodes.length)
    
    if (nodes.length === 0) {
      console.log('没有节点，跳过预览线创建')
      return
    }
    
    let createdCount = 0
    
    nodes.forEach((node, index) => {
      console.log(`\n--- 处理节点 ${index + 1}/${nodes.length} ---`)
      console.log('节点信息:', {
        id: node.id,
        type: typeof node,
        constructor: node.constructor.name
      })
      
      // 检查节点方法可用性（PreviewLineSystem中的检查）
      if (typeof node.getData !== 'function') {
        console.error('❌ 节点缺少getData方法')
        return
      }
      
      try {
        const nodeData = node.getData()
        console.log('节点数据:', nodeData)
        
        if (!nodeData.isConfigured) {
          console.log('🔄 节点未配置，创建预览线')
          const previewLine = this.previewLineRenderer.createPreviewLine(node)
          if (previewLine) {
            createdCount++
            console.log('✅ 预览线创建成功:', previewLine.id)
          }
        } else {
          console.log('✅ 节点已配置，跳过')
        }
      } catch (error) {
        console.error('❌ 处理节点时出错:', error.message)
      }
    })
    
    console.log(`\n=== 预览线创建完成，共创建 ${createdCount} 条预览线 ===`)
  }
}

// 运行测试
function runDebugTest() {
  console.log('\n🚀 开始预览线调试测试')
  
  // 创建模拟图形
  const graph = new X6Graph()
  
  // 添加测试节点
  const testNodes = [
    {
      id: 'start-node-1',
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
      id: 'process-node-1',
      shape: 'rect',
      x: 300,
      y: 200,
      width: 140,
      height: 100,
      data: {
        type: 'process',
        nodeType: 'process',
        isConfigured: false,
        label: '处理节点1'
      }
    },
    {
      id: 'process-node-2',
      shape: 'rect',
      x: 500,
      y: 300,
      width: 140,
      height: 100,
      data: {
        type: 'process',
        nodeType: 'process',
        isConfigured: false,
        label: '处理节点2'
      }
    }
  ]
  
  console.log('\n--- 添加测试节点 ---')
  testNodes.forEach(nodeConfig => {
    const node = graph.addCell(nodeConfig)
    console.log(`✅ 添加节点: ${node.id}`)
  })
  
  // 创建预览线系统
  const previewLineSystem = new MockPreviewLineSystem(graph)
  
  // 运行预览线创建
  previewLineSystem.createPreviewLinesForExistingNodes()
  
  console.log('\n🎉 调试测试完成')
}

// 运行测试
runDebugTest()

// 额外测试：检查可能的边界情况
console.log('\n\n=== 边界情况测试 ===')

// 测试1：节点没有getData方法
console.log('\n--- 测试1: 节点缺少getData方法 ---')
const brokenNode = {
  id: 'broken-node',
  // 故意不包含getData方法
}

const renderer = new MockPreviewLineRenderer(new X6Graph())
try {
  renderer.createPreviewLine(brokenNode)
} catch (error) {
  console.log('✅ 正确捕获了缺少方法的错误:', error.message)
}

// 测试2：getData返回null
console.log('\n--- 测试2: getData返回null ---')
const nullDataNode = {
  id: 'null-data-node',
  getData: () => null,
  getPosition: () => ({ x: 0, y: 0 }),
  getSize: () => ({ width: 100, height: 60 })
}

try {
  const result = renderer.createPreviewLine(nullDataNode)
  console.log('处理null数据的结果:', result)
} catch (error) {
  console.log('处理null数据时的错误:', error.message)
}

console.log('\n✅ 所有测试完成')