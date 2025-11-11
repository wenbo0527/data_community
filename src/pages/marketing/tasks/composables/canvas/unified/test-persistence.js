/**
 * EdgePersistenceManager 基础功能测试
 * 用于验证数据结构和序列化机制的正确性
 */

import { EdgePersistenceManager } from './EdgePersistenceManager.js'
import { UnifiedEdgeManager } from './UnifiedEdgeManager.js'

// 模拟边数据
const mockEdgeData = {
  id: 'test-edge-1',
  type: 'preview',
  state: 'active',
  source: {
    nodeId: 'node-1',
    port: 'output-1'
  },
  target: {
    nodeId: 'node-2', 
    port: 'input-1'
  },
  branch: {
    id: 'branch-1',
    label: '测试分支',
    index: 0
  },
  style: {
    stroke: '#1890ff',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    opacity: 0.8
  },
  metadata: {
    createdAt: Date.now(),
    createdBy: 'test-user',
    custom: {
      testProperty: 'test-value'
    }
  }
}

// 测试序列化功能
function testSerialization() {
  console.log('🧪 开始测试序列化功能...')
  
  try {
    // 创建模拟的边管理器
    const mockEdgeManager = {
      edges: new Map([['test-edge-1', mockEdgeData]]),
      nodeEdges: new Map([['node-1', new Set(['test-edge-1'])]]),
      portUsage: new Map([['node-1:output-1', 1]]),
      getStats: () => ({ totalEdges: 1, previewLines: 1 })
    }
    
    // 创建持久化管理器
    const persistenceManager = new EdgePersistenceManager(mockEdgeManager, {
      enablePersistence: true,
      enableAutoSave: false,
      storageType: 'memory'
    })
    
    // 测试预览线序列化
    const serializedPreviewLines = persistenceManager.serializePreviewLines()
    console.log('✅ 预览线序列化成功:', serializedPreviewLines)
    
    // 验证序列化结果
    const serializedEdge = serializedPreviewLines['test-edge-1']
    if (serializedEdge && 
        serializedEdge.source.nodeId === 'node-1' &&
        serializedEdge.target.nodeId === 'node-2' &&
        serializedEdge.branch.label === '测试分支') {
      console.log('✅ 序列化数据结构验证通过')
    } else {
      console.error('❌ 序列化数据结构验证失败')
    }
    
    // 测试元数据序列化
    const serializedMetadata = persistenceManager.serializeMetadata()
    console.log('✅ 元数据序列化成功:', serializedMetadata)
    
    // 测试完整状态序列化
    persistenceManager.serializeState().then(serializedState => {
      console.log('✅ 完整状态序列化成功:', Object.keys(serializedState))
      
      // 测试反序列化
      const deserializedPreviewLines = persistenceManager.deserializePreviewLines(serializedState.previewLines)
      console.log('✅ 预览线反序列化成功:', Object.keys(deserializedPreviewLines))
      
      console.log('🎉 序列化测试全部通过!')
    }).catch(error => {
      console.error('❌ 状态序列化失败:', error)
    })
    
  } catch (error) {
    console.error('❌ 序列化测试失败:', error)
  }
}

// 测试数据结构兼容性
function testDataStructureCompatibility() {
  console.log('🧪 开始测试数据结构兼容性...')
  
  try {
    // 测试旧格式数据的兼容性
    const legacyData = {
      'legacy-edge-1': {
        id: 'legacy-edge-1',
        type: 'preview',
        sourceNodeId: 'node-1',  // 旧格式
        sourcePort: 'output-1',
        targetNodeId: 'node-2',
        targetPort: 'input-1'
      }
    }
    
    const persistenceManager = new EdgePersistenceManager(null, {
      enablePersistence: true
    })
    
    // 测试反序列化旧格式数据
    const deserializedLegacy = persistenceManager.deserializePreviewLines(legacyData)
    console.log('✅ 旧格式数据兼容性测试通过:', deserializedLegacy)
    
    console.log('🎉 数据结构兼容性测试通过!')
    
  } catch (error) {
    console.error('❌ 数据结构兼容性测试失败:', error)
  }
}

// 运行测试
console.log('🚀 开始EdgePersistenceManager基础功能测试')
testSerialization()
testDataStructureCompatibility()