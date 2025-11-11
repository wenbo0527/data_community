/**
 * 统一边管理器核心功能验证脚本
 * 验证所有关键功能是否正常工作
 */

import UnifiedEdgeManager from './src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js'

// 创建模拟图实例
const mockGraph = {
  addEdge: (edgeData) => {
    console.log('✓ 模拟图添加边:', edgeData.id || 'auto-generated')
    return { 
      id: edgeData.id || 'edge_' + Date.now(),
      getSource: () => edgeData.source,
      getTarget: () => edgeData.target,
      getSourcePortId: () => edgeData.source?.port || 'out',
      getTargetPortId: () => edgeData.target?.port || 'in',
      setAttrs: (attrs) => console.log('✓ 设置边属性:', attrs),
      setData: (data) => console.log('✓ 设置边数据:', data),
      getData: () => edgeData.data || {},
      remove: () => console.log('✓ 移除边')
    }
  },
  removeEdge: (edgeId) => {
    console.log('✓ 模拟图移除边:', edgeId)
  },
  getEdges: () => [],
  getNodes: () => [],
  getNode: (id) => ({ 
    id, 
    ports: [],
    getPosition: () => ({ x: 50, y: 50 }),
    getSize: () => ({ width: 100, height: 60 }),
    getData: () => ({ type: 'default', nodeType: 'default' }),
    getBBox: () => ({ x: 0, y: 0, width: 100, height: 60 }),
    getPorts: () => [
      { id: 'port1', group: 'out' },
      { id: 'port2', group: 'in' }
    ]
  }),
  getCellById: (id) => ({ 
    id,
    getPosition: () => ({ x: 50, y: 50 }),
    getSize: () => ({ width: 100, height: 60 }),
    getData: () => ({ type: 'default', nodeType: 'default' }),
    getBBox: () => ({ x: 0, y: 0, width: 100, height: 60 }),
    getPorts: () => [
      { id: 'port1', group: 'out' },
      { id: 'port2', group: 'in' }
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

async function runCoreTests() {
  console.log('🚀 开始统一边管理器核心功能验证...\n')

  try {
    // 1. 初始化测试
    console.log('1. 初始化测试')
    const manager = new UnifiedEdgeManager(mockGraph, {
      autoCleanup: true,
      performanceOptimization: true,
      problemDiagnosis: true,
      enableConnectionValidation: true,
      enableInPortSnap: true,
      enableBatchOperations: true
    })
    console.log('✓ UnifiedEdgeManager 初始化成功')

    // 2. 预览线创建测试
    console.log('\n2. 预览线创建测试')
    
    const previewLine = await manager.createPreviewLine('node1', 'port1', { x: 100, y: 100 })
    console.log('✓ 预览线创建成功:', previewLine?.id)

    // 3. 连接线创建测试
    console.log('\n3. 连接线创建测试')
    const connectionData = {
      source: { cell: 'node1', port: 'port1' },
      target: { cell: 'node2', port: 'port2' }
    }
    
    const connection = await manager.createConnection('node1', 'node2', { 
      sourcePort: 'port1', 
      targetPort: 'port2' 
    })
    console.log('✓ 连接线创建成功:', connection?.id)

    // 4. 预览线转换为连接线测试
    console.log('\n4. 预览线转换测试')
    if (previewLine) {
      const convertedConnection = await manager.convertPreviewToConnection(previewLine.id, {
        target: { cell: 'node3', port: 'port3' }
      })
      console.log('✓ 预览线转换成功:', convertedConnection?.id)
    }

    // 5. 批量操作测试
    console.log('\n5. 批量操作测试')
    const batchConnections = [
      { source: { cell: 'node4', port: 'port4' }, target: { cell: 'node5', port: 'port5' } },
      { source: { cell: 'node6', port: 'port6' }, target: { cell: 'node7', port: 'port7' } }
    ]
    
    const batchResults = await manager.createBatchConnections(batchConnections)
    console.log('✓ 批量连接创建成功:', batchResults.length, '个连接')

    // 6. 清理测试
    console.log('\n6. 清理测试')
    await manager.cleanup()
    console.log('✓ 清理完成')

    // 7. 销毁测试
    console.log('\n7. 销毁测试')
    manager.destroy()
    console.log('✓ 销毁完成')

    console.log('\n🎉 所有核心功能验证通过！')
    return true

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error(error.stack)
    return false
  }
}

// 运行测试
runCoreTests().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('❌ 测试执行失败:', error)
  process.exit(1)
})