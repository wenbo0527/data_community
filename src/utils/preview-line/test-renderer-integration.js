/**
 * 渲染器模块集成测试
 * 测试PreviewLineRenderer和StyleRenderer是否正常工作
 */

// 模拟图形引擎
class MockGraph {
  constructor() {
    this.edges = new Map()
    this.nodes = new Map()
  }

  addEdge(edgeConfig) {
    const edge = {
      id: edgeConfig.id,
      ...edgeConfig,
      getData: () => edgeConfig.data || {},
      getSourceCellId: () => edgeConfig.source?.cell,
      getTargetCellId: () => edgeConfig.target?.cell || null,
      attr: (path, value) => {
        if (value !== undefined) {
          console.log(`🎨 设置边属性: ${path} = ${JSON.stringify(value)}`)
        }
      }
    }
    this.edges.set(edgeConfig.id, edge)
    console.log(`📊 添加边到图中: ${edgeConfig.id}`)
    return edge
  }

  removeEdge(edgeId) {
    const removed = this.edges.delete(edgeId)
    console.log(`🗑️ 从图中移除边: ${edgeId}, 成功: ${removed}`)
    return removed
  }

  getCellById(id) {
    return this.edges.get(id) || this.nodes.get(id)
  }
}

// 模拟节点
class MockNode {
  constructor(id, x = 0, y = 0) {
    this.id = id
    this.x = x
    this.y = y
  }

  getId() {
    return this.id
  }

  getPosition() {
    return { x: this.x, y: this.y }
  }
}

// 模拟PreviewLineSystem的部分功能
class MockManager {
  constructor() {
    this.previewLines = new Map()
  }
}

// 导入渲染器模块
import { PreviewLineRenderer } from './renderers/PreviewLineRenderer.js'
import { StyleRenderer } from './renderers/StyleRenderer.js'

/**
 * 测试PreviewLineRenderer
 */
function testPreviewLineRenderer() {
  console.log('\n🧪 开始测试: PreviewLineRenderer')
  
  const mockGraph = new MockGraph()
  const mockManager = new MockManager()
  const renderer = new PreviewLineRenderer(mockGraph, mockManager)
  
  // 测试创建预览线
  const sourceNode = new MockNode('node1', 100, 100)
  const targetPosition = { x: 200, y: 200 }
  
  try {
    const previewLineId = renderer.createPreviewLine(sourceNode, targetPosition, 'branch1', '测试分支')
    console.log(`✅ 创建预览线成功: ${previewLineId}`)
    
    // 测试更新预览线
    const newPosition = { x: 300, y: 300 }
    const updateResult = renderer.updatePreviewLine('node1', newPosition)
    console.log(`✅ 更新预览线成功: ${updateResult}`)
    
    // 测试移除预览线
    const removeResult = renderer.removePreviewLine('node1')
    console.log(`✅ 移除预览线成功: ${removeResult}`)
    
    console.log('✅ PreviewLineRenderer 测试通过')
    return true
  } catch (error) {
    console.error('❌ PreviewLineRenderer 测试失败:', error)
    return false
  }
}

/**
 * 测试StyleRenderer
 */
function testStyleRenderer() {
  console.log('\n🧪 开始测试: StyleRenderer')
  
  const mockGraph = new MockGraph()
  const mockManager = new MockManager()
  const styleRenderer = new StyleRenderer(mockGraph, mockManager)
  
  // 创建一个模拟预览线用于样式测试
  const mockLine = {
    id: 'test-preview-line',
    attr: (path, value) => {
      console.log(`🎨 样式设置: ${path} = ${JSON.stringify(value)}`)
    },
    getAttrs: () => ({ line: {} }),
    setAttrs: (attrs) => {
      console.log(`🎨 设置属性: ${JSON.stringify(attrs)}`)
    },
    getLabels: () => [{
      attr: (path, value) => {
        console.log(`🏷️ 标签样式设置: ${path} = ${JSON.stringify(value)}`)
      }
    }],
    setLabels: (labels) => {
      console.log(`🏷️ 设置标签: ${JSON.stringify(labels)}`)
    }
  }
  
  const mockSourceNode = {
    getData: () => ({ type: 'sms', nodeType: 'sms' })
  }
  
  const mockPreviewInstance = {
    line: mockLine,
    sourceNode: mockSourceNode,
    branchLabel: 'test-branch'
  }
  
  try {
    // 测试不同状态的配置
    styleRenderer.configureInteractive(mockPreviewInstance)
    console.log('✅ 配置交互状态成功')
    
    styleRenderer.configureDragging(mockPreviewInstance)
    console.log('✅ 配置拖拽状态成功')
    
    styleRenderer.configureConnected(mockPreviewInstance)
    console.log('✅ 配置连接状态成功')
    
    styleRenderer.configureHover(mockPreviewInstance)
    console.log('✅ 配置悬停状态成功')
    
    console.log('✅ StyleRenderer 测试通过')
    return true
  } catch (error) {
    console.error('❌ StyleRenderer 测试失败:', error)
    return false
  }
}

/**
 * 主测试函数
 */
function runTests() {
  console.log('🚀 开始渲染器模块集成测试')
  console.log('==================================================')
  
  const results = []
  
  // 运行测试
  results.push(testPreviewLineRenderer())
  results.push(testStyleRenderer())
  
  // 统计结果
  const passed = results.filter(r => r).length
  const failed = results.filter(r => !r).length
  
  console.log('\n==================================================')
  console.log('📊 测试总结')
  console.log(`✅ 通过: ${passed}`)
  console.log(`❌ 失败: ${failed}`)
  console.log(`📈 总计: ${results.length}`)
  
  if (failed === 0) {
    console.log('\n🎉 渲染器模块集成测试完成! 所有测试通过')
  } else {
    console.log('\n⚠️ 部分测试失败，请检查错误信息')
  }
  
  return failed === 0
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
}

export { runTests }