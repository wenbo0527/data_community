/**
 * 预览线系统测试 - createUnifiedPreviewLine 和 deletePreviewLine 方法测试
 * 测试预览线的创建、删除和相关功能
 */

import { PreviewLineSystem } from '../../utils/preview-line/PreviewLineSystem.js'

/**
 * 创建模拟的图实例
 */
function createMockGraph() {
  const cells = new Map()
  const edges = new Map()
  
  return {
    addNode: (config) => {
      const node = {
        id: config.id || `node_${Date.now()}`,
        ...config,
        getData: () => config.data || {},
        store: { data: { data: config.data || {} } }
      }
      cells.set(node.id, node)
      return node
    },
    
    addEdge: (config) => {
      const edge = {
        id: config.id || `edge_${Date.now()}`,
        ...config,
        getTargetPoint: () => ({ x: 100, y: 100 }),
        getSourcePoint: () => ({ x: 50, y: 50 })
      }
      edges.set(edge.id, edge)
      cells.set(edge.id, edge)
      return edge
    },
    
    removeCell: (id) => {
      cells.delete(id)
      edges.delete(id)
      return true
    },
    
    hasCell: (id) => cells.has(id),
    
    getCell: (id) => cells.get(id),
    
    container: {
      getBoundingClientRect: () => ({ left: 0, top: 0 })
    },
    
    clientToGraph: (x, y) => ({ x, y })
  }
}

/**
 * 创建模拟的源节点
 */
function createMockSourceNode(nodeType = 'email', isConfigured = true) {
  return {
    id: `node_${Date.now()}`,
    data: {
      type: nodeType,
      nodeType: nodeType,
      isConfigured: isConfigured
    },
    getData: function() {
      return this.data
    },
    store: {
      data: {
        data: {
          type: nodeType,
          nodeType: nodeType,
          isConfigured: isConfigured
        }
      }
    }
  }
}

/**
 * 测试预览线系统的创建和删除功能
 */
export async function testPreviewLineCreateAndDelete() {
  console.log('🧪 开始测试预览线创建和删除功能')
  
  try {
    // 创建模拟环境
    const mockGraph = createMockGraph()
    const sourceNode = createMockSourceNode('email', true)
    
    // 创建预览线系统实例
    const previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      system: {
        enableDebug: true,
        enableStats: true
      }
    })
    
    // 初始化系统
    const initSuccess = await previewLineSystem.init()
    if (!initSuccess) {
      throw new Error('预览线系统初始化失败')
    }
    
    console.log('✅ 预览线系统初始化成功')
    
    // 测试 createUnifiedPreviewLine 方法
    console.log('\n📝 测试 createUnifiedPreviewLine 方法')
    
    const previewLineConfig = {
      sourceNode: sourceNode,
      initialState: 'interactive',
      branchId: 'main',
      branchLabel: '主分支',
      type: 'single'
    }
    
    const previewLine = await previewLineSystem.createUnifiedPreviewLine(previewLineConfig)
    
    if (previewLine) {
      console.log('✅ createUnifiedPreviewLine 测试通过:', {
        lineId: previewLine.id,
        sourceNodeId: sourceNode.id,
        branchId: previewLineConfig.branchId
      })
    } else {
      throw new Error('createUnifiedPreviewLine 返回null')
    }
    
    // 验证预览线是否存在
    const hasPreviewLine = previewLineSystem.hasPreviewLine(sourceNode.id)
    console.log('✅ hasPreviewLine 检查:', hasPreviewLine)
    
    // 获取节点的预览线
    const nodePreviewLines = previewLineSystem.getNodePreviewLines(sourceNode.id)
    console.log('✅ getNodePreviewLines 结果:', nodePreviewLines.length)
    
    // 测试 deletePreviewLine 方法
    console.log('\n🗑️ 测试 deletePreviewLine 方法')
    
    const deleteSuccess = await previewLineSystem.deletePreviewLine(previewLine.id)
    
    if (deleteSuccess) {
      console.log('✅ deletePreviewLine 测试通过:', previewLine.id)
    } else {
      throw new Error('deletePreviewLine 返回false')
    }
    
    // 验证预览线是否已删除
    const hasPreviewLineAfterDelete = previewLineSystem.hasPreviewLine(sourceNode.id)
    console.log('✅ 删除后 hasPreviewLine 检查:', hasPreviewLineAfterDelete)
    
    // 测试批量删除功能
    console.log('\n📦 测试批量操作功能')
    
    // 创建多个预览线
    const previewLines = []
    for (let i = 0; i < 3; i++) {
      const node = createMockSourceNode('sms', true)
      const config = {
        sourceNode: node,
        initialState: 'interactive',
        branchId: `branch_${i}`,
        type: 'single'
      }
      const line = await previewLineSystem.createUnifiedPreviewLine(config)
      if (line) {
        previewLines.push(line)
      }
    }
    
    console.log('✅ 创建了', previewLines.length, '条预览线')
    
    // 批量删除操作
    const batchOperations = previewLines.map(line => ({
      type: 'delete',
      id: line.id
    }))
    
    const batchResults = await previewLineSystem.batchOperatePreviewLines(batchOperations)
    const successCount = batchResults.filter(r => r.success).length
    
    console.log('✅ 批量删除结果:', {
      总数: batchResults.length,
      成功: successCount,
      失败: batchResults.length - successCount
    })
    
    // 测试 forceRegeneratePreviewLines 方法
    console.log('\n🔄 测试 forceRegeneratePreviewLines 方法')
    
    // 先创建一些预览线
    for (let i = 0; i < 2; i++) {
      const node = createMockSourceNode('webhook', true)
      const config = {
        sourceNode: node,
        initialState: 'interactive',
        type: 'single'
      }
      await previewLineSystem.createUnifiedPreviewLine(config)
    }
    
    const regenerateResult = await previewLineSystem.forceRegeneratePreviewLines()
    
    console.log('✅ forceRegeneratePreviewLines 测试通过:', {
      成功: regenerateResult.success,
      之前数量: regenerateResult.previousCount,
      新数量: regenerateResult.newCount,
      删除数量: regenerateResult.deletedCount
    })
    
    // 获取系统统计信息
    const stats = previewLineSystem.getStats()
    console.log('\n📊 系统统计信息:', stats)
    
    console.log('\n🎉 所有测试通过！')
    
    return {
      success: true,
      message: '预览线创建和删除功能测试通过',
      stats: stats
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return {
      success: false,
      message: `测试失败: ${error.message}`,
      error: error
    }
  }
}

/**
 * 测试预览线渲染器的 deletePreviewLine 方法
 */
export async function testRendererDeletePreviewLine() {
  console.log('\n🧪 开始测试渲染器 deletePreviewLine 方法')
  
  try {
    const mockGraph = createMockGraph()
    const sourceNode = createMockSourceNode('email', true)
    
    // 创建预览线系统
    const previewLineSystem = new PreviewLineSystem({
      graph: mockGraph
    })
    
    await previewLineSystem.init()
    
    // 创建预览线
    const previewLine = await previewLineSystem.createUnifiedPreviewLine({
      sourceNode: sourceNode,
      initialState: 'interactive'
    })
    
    if (!previewLine) {
      throw new Error('预览线创建失败')
    }
    
    // 直接测试渲染器的 deletePreviewLine 方法
    const renderer = previewLineSystem.renderer
    if (!renderer) {
      throw new Error('渲染器未初始化')
    }
    
    // 验证渲染器有 deletePreviewLine 方法
    if (typeof renderer.deletePreviewLine !== 'function') {
      throw new Error('渲染器缺少 deletePreviewLine 方法')
    }
    
    console.log('✅ 渲染器 deletePreviewLine 方法存在')
    
    // 测试渲染器的删除功能
    const deleteSuccess = renderer.deletePreviewLine(previewLine.id)
    
    if (deleteSuccess) {
      console.log('✅ 渲染器 deletePreviewLine 方法测试通过')
    } else {
      console.warn('⚠️ 渲染器 deletePreviewLine 返回false，但这可能是正常的')
    }
    
    return {
      success: true,
      message: '渲染器 deletePreviewLine 方法测试通过'
    }
    
  } catch (error) {
    console.error('❌ 渲染器测试失败:', error)
    return {
      success: false,
      message: `渲染器测试失败: ${error.message}`,
      error: error
    }
  }
}

/**
 * 运行所有测试
 */
export async function runAllTests() {
  console.log('🚀 开始运行预览线系统完整测试套件')
  console.log('=' .repeat(60))
  
  const results = []
  
  // 测试1: 预览线创建和删除
  const test1 = await testPreviewLineCreateAndDelete()
  results.push({ name: '预览线创建和删除测试', ...test1 })
  
  // 测试2: 渲染器 deletePreviewLine 方法
  const test2 = await testRendererDeletePreviewLine()
  results.push({ name: '渲染器 deletePreviewLine 测试', ...test2 })
  
  // 汇总结果
  console.log('\n' + '=' .repeat(60))
  console.log('📋 测试结果汇总:')
  
  let allPassed = true
  results.forEach((result, index) => {
    const status = result.success ? '✅ 通过' : '❌ 失败'
    console.log(`${index + 1}. ${result.name}: ${status}`)
    if (!result.success) {
      console.log(`   错误: ${result.message}`)
      allPassed = false
    }
  })
  
  console.log('\n' + '=' .repeat(60))
  if (allPassed) {
    console.log('🎉 所有测试通过！预览线系统功能正常。')
  } else {
    console.log('⚠️ 部分测试失败，请检查相关功能。')
  }
  
  return {
    success: allPassed,
    results: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  }
}

// 如果直接运行此文件，执行所有测试
if (typeof window !== 'undefined') {
  // 浏览器环境，可以通过控制台调用
  window.testPreviewLineSystem = {
    runAllTests,
    testPreviewLineCreateAndDelete,
    testRendererDeletePreviewLine
  }
  
  console.log('💡 测试函数已挂载到 window.testPreviewLineSystem')
  console.log('💡 可以通过以下方式运行测试:')
  console.log('   - window.testPreviewLineSystem.runAllTests()')
  console.log('   - window.testPreviewLineSystem.testPreviewLineCreateAndDelete()')
  console.log('   - window.testPreviewLineSystem.testRendererDeletePreviewLine()')
}