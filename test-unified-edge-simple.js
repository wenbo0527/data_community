/**
 * 简单的 UnifiedEdgeManager 测试
 * 用于验证基本功能和 API 兼容性
 */

import UnifiedEdgeManager from './src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js'

// 创建模拟图实例
const mockGraph = {
  addEdge: (config) => {
    console.log('Mock addEdge called with:', config)
    return { 
      id: `edge_${Date.now()}`,
      getSource: () => ({ cell: config.source.cell, port: config.source.port }),
      getTarget: () => ({ cell: config.target.cell, port: config.target.port }),
      getSourcePortId: () => config.source.port,
      getTargetPortId: () => config.target.port,
      setAttrs: () => {},
      setData: () => {},
      getData: () => ({}),
      remove: () => {}
    }
  },
  removeEdge: (id) => {
    console.log('Mock removeEdge called with:', id)
    return true
  },
  getEdges: () => [],
  getNodes: () => [],
  getNode: (id) => ({
    id,
    getPosition: () => ({ x: 100, y: 100 }),
    getSize: () => ({ width: 120, height: 80 }),
    getData: () => ({ type: 'test-node' }),
    getBBox: () => ({ x: 100, y: 100, width: 120, height: 80 }),
    getPorts: () => [
      { id: 'in', group: 'in' },
      { id: 'out', group: 'out' }
    ]
  }),
  getCellById: (id) => ({
    id,
    getPosition: () => ({ x: 100, y: 100 }),
    getSize: () => ({ width: 120, height: 80 }),
    getData: () => ({ type: 'test-node' }),
    getBBox: () => ({ x: 100, y: 100, width: 120, height: 80 }),
    getPorts: () => [
      { id: 'in', group: 'in' },
      { id: 'out', group: 'out' }
    ]
  }),
  on: () => {},
  off: () => {},
  trigger: () => {},
  toJSON: () => ({ cells: [] }),
  fromJSON: () => {},
  clearCells: () => {},
  addNode: () => {},
  removeNode: () => {}
}

async function testUnifiedEdgeManager() {
  console.log('🧪 开始测试 UnifiedEdgeManager...')
  
  try {
    // 1. 测试实例化
    console.log('1. 测试实例化...')
    const manager = new UnifiedEdgeManager(mockGraph, {
      autoCleanup: true,
      performanceOptimization: true,
      problemDiagnosis: true,
      enableConnectionValidation: true,
      enableInPortSnap: true,
      enableBatchOperations: true
    })
    console.log('✅ 实例化成功')

    // 2. 测试初始化
    console.log('2. 测试初始化...')
    await manager.initialize()
    console.log('✅ 初始化成功，isInitialized:', manager.isInitialized.value)

    // 3. 测试方法存在性
    console.log('3. 测试方法存在性...')
    const requiredMethods = [
      'createPreviewLine',
      'removePreviewLine', 
      'removePreviewLines',
      'convertPreviewToConnection',
      'createConnectionViaController',
      'hasPreviewLine',
      'hasConnection',
      'getNodePreviewLines',
      'getNodeConnections'
    ]
    
    for (const method of requiredMethods) {
      if (typeof manager[method] !== 'function') {
        throw new Error(`缺少方法: ${method}`)
      }
    }
    console.log('✅ 所有必需方法都存在')

    // 4. 测试预览线创建
    console.log('4. 测试预览线创建...')
    const previewResult = await manager.createPreviewLine('node1', {
      sourcePort: 'out',
      branchId: 'branch1'
    })
    console.log('预览线创建结果:', previewResult)

    // 5. 测试预览线查询
    console.log('5. 测试预览线查询...')
    const hasPreview = manager.hasPreviewLine('node1', 'branch1')
    console.log('预览线存在检查:', hasPreview)

    // 6. 测试获取节点预览线
    console.log('6. 测试获取节点预览线...')
    const nodePreviewLines = manager.getNodePreviewLines('node1')
    console.log('节点预览线:', nodePreviewLines)

    // 7. 测试销毁
    console.log('7. 测试销毁...')
    manager.destroy()
    console.log('✅ 销毁成功')

    console.log('🎉 所有测试通过！')
    return true

  } catch (error) {
    console.error('❌ 测试失败:', error)
    console.error('错误堆栈:', error.stack)
    return false
  }
}

// 运行测试
testUnifiedEdgeManager().then(success => {
  process.exit(success ? 0 : 1)
})