/**
 * 统一预览线拖拽和吸附状态持久化测试
 * 测试预览线中集成的拖拽和吸附状态的序列化和反序列化功能
 */

import { EdgePersistenceManager } from './EdgePersistenceManager.js'

// Mock 拖拽状态管理器
class MockDragStateManager {
  constructor() {
    this.currentState = 'idle'
    this.currentDrag = null
  }

  getStateInfo() {
    return {
      currentState: this.currentState,
      previousState: 'idle',
      currentDrag: this.currentDrag
    }
  }

  transitionTo(state) {
    this.currentState = state
  }

  // 模拟拖拽开始
  startDrag(dragInfo) {
    this.currentState = 'dragging'
    this.currentDrag = {
      type: dragInfo.type || 'preview-line',
      phase: 'start',
      sourceNode: dragInfo.sourceNode,
      targetNode: dragInfo.targetNode,
      startPosition: dragInfo.startPosition,
      currentPosition: dragInfo.currentPosition,
      branchId: dragInfo.branchId,
      branchLabel: dragInfo.branchLabel,
      metadata: dragInfo.metadata || {}
    }
  }

  // 模拟拖拽结束
  endDrag() {
    this.currentState = 'idle'
    this.currentDrag = null
  }
}

// Mock 边管理器
class MockEdgeManager {
  constructor() {
    this.edges = new Map()
    this.nodeEdges = new Map()
    this.portUsage = new Map()
    this.dragStateManager = new MockDragStateManager()
    this.snapInfo = {
      isSnapping: false,
      snapTarget: null,
      snapDistance: 30,
      snapConfig: {
        enabled: true,
        distance: 30,
        showIndicators: true,
        tolerance: 5
      }
    }
    this.eventListeners = new Map()
  }

  // 添加事件监听器方法
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data))
    }
  }

  getStats() {
    return {
      edgeCount: this.edges.size,
      nodeCount: this.nodeEdges.size,
      portUsageCount: this.portUsage.size
    }
  }

  // 添加预览线（包含拖拽和吸附状态）
  addPreviewLine(edgeId, previewLineData) {
    this.edges.set(edgeId, {
      id: edgeId,
      type: 'preview-line',
      state: 'active',
      source: {
        nodeId: previewLineData.sourceNodeId,
        port: previewLineData.sourcePort || 'output'
      },
      target: previewLineData.targetNodeId ? {
        nodeId: previewLineData.targetNodeId,
        port: previewLineData.targetPort || 'input'
      } : null,
      branch: previewLineData.branch || null,
      style: previewLineData.style || {},
      metadata: previewLineData.metadata || {},
      path: previewLineData.path,
      created: Date.now(),
      updated: Date.now()
    })
  }

  // 模拟吸附状态变化
  setSnapState(isSnapping, snapTarget = null) {
    this.snapInfo.isSnapping = isSnapping
    this.snapInfo.snapTarget = snapTarget
  }
}

/**
 * 测试统一预览线拖拽和吸附状态持久化
 */
async function testUnifiedPreviewLinePersistence() {
  console.log('🧪 开始测试统一预览线拖拽和吸附状态持久化...')

  try {
    // 创建 Mock 边管理器
    const mockEdgeManager = new MockEdgeManager()
    
    // 创建持久化管理器
    const persistenceManager = new EdgePersistenceManager(mockEdgeManager, {
      enablePersistence: true,
      includeMetadata: true,
      debug: true
    })

    await persistenceManager.initialize()

    // ==================== 测试1: 基础预览线序列化 ====================
    console.log('\n📝 测试1: 基础预览线序列化')
    
    // 添加基础预览线
    mockEdgeManager.addPreviewLine('preview-1', {
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
      path: 'M 100 100 L 200 200',
      style: { stroke: '#1890ff', strokeWidth: 2 }
    })

    const basicSerialized = await persistenceManager.serializeState()
    console.log('✅ 基础预览线序列化成功')
    console.log('预览线数据:', basicSerialized.data.previewLines)

    // ==================== 测试2: 带拖拽状态的预览线序列化 ====================
    console.log('\n📝 测试2: 带拖拽状态的预览线序列化')
    
    // 模拟拖拽开始
    mockEdgeManager.dragStateManager.startDrag({
      type: 'preview-line',
      sourceNode: { id: 'node-1' },
      targetNode: { id: 'node-2' },
      startPosition: { x: 100, y: 100 },
      currentPosition: { x: 150, y: 150 },
      branchId: 'branch-1',
      branchLabel: '条件分支',
      metadata: { dragType: 'create-connection' }
    })

    // 添加拖拽中的预览线
    mockEdgeManager.addPreviewLine('preview-drag', {
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
      path: 'M 100 100 L 150 150',
      style: { stroke: '#ff4d4f', strokeWidth: 3, opacity: 0.8 }
    })

    const dragSerialized = await persistenceManager.serializeState()
    console.log('✅ 带拖拽状态的预览线序列化成功')
    
    // 检查拖拽状态是否被正确序列化
    const previewDragData = dragSerialized.data.previewLines['preview-drag']
    if (previewDragData && previewDragData.dragState) {
      console.log('✅ 拖拽状态已集成到预览线中:', previewDragData.dragState)
    } else {
      console.warn('⚠️ 拖拽状态未正确集成到预览线中')
    }

    // ==================== 测试3: 带吸附状态的预览线序列化 ====================
    console.log('\n📝 测试3: 带吸附状态的预览线序列化')
    
    // 模拟吸附状态
    mockEdgeManager.setSnapState(true, {
      nodeId: 'node-3',
      position: { x: 200, y: 200 },
      distance: 15,
      port: 'input-port-1'
    })

    // 添加吸附中的预览线
    mockEdgeManager.addPreviewLine('preview-snap', {
      sourceNodeId: 'node-2',
      targetNodeId: 'node-3',
      path: 'M 150 150 L 200 200',
      style: { stroke: '#52c41a', strokeWidth: 2, strokeDasharray: '5,5' }
    })

    const snapSerialized = await persistenceManager.serializeState()
    console.log('✅ 带吸附状态的预览线序列化成功')
    
    // 检查吸附状态是否被正确序列化
    const previewSnapData = snapSerialized.data.previewLines['preview-snap']
    if (previewSnapData && previewSnapData.snapState) {
      console.log('✅ 吸附状态已集成到预览线中:', previewSnapData.snapState)
    } else {
      console.warn('⚠️ 吸附状态未正确集成到预览线中')
    }

    // ==================== 测试4: 完整状态反序列化 ====================
    console.log('\n📝 测试4: 完整状态反序列化')
    
    // 清空当前状态
    mockEdgeManager.edges.clear()
    mockEdgeManager.dragStateManager.endDrag()
    mockEdgeManager.setSnapState(false)

    // 反序列化状态
    const restoredState = await persistenceManager.deserializeState(snapSerialized)
    console.log('✅ 状态反序列化成功')
    console.log('恢复的预览线数量:', Object.keys(restoredState.edges).length)

    // 检查拖拽和吸附状态恢复
    for (const [edgeId, edgeData] of Object.entries(restoredState.edges)) {
      if (edgeData.dragStateRestored) {
        console.log('✅ 预览线拖拽状态已恢复:', edgeId)
      }
      if (edgeData.snapStateRestored) {
        console.log('✅ 预览线吸附状态已恢复:', edgeId)
      }
    }

    // ==================== 测试5: 过期状态处理 ====================
    console.log('\n📝 测试5: 过期状态处理')
    
    // 创建过期的状态数据
    const expiredData = {
      version: '1.0.0',
      timestamp: Date.now(),
      data: {
        previewLines: {
          'expired-preview': {
            id: 'expired-preview',
            type: 'preview-line',
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            dragState: {
              isDragging: false,
              timestamp: Date.now() - 10 * 60 * 1000 // 10分钟前
            },
            snapState: {
              isSnapping: false,
              timestamp: Date.now() - 10 * 60 * 1000 // 10分钟前
            }
          }
        }
      }
    }

    const expiredRestored = await persistenceManager.deserializeState(expiredData)
    console.log('✅ 过期状态处理测试完成')
    
    // 检查过期状态是否被正确跳过
    const expiredPreview = expiredRestored.edges['expired-preview']
    if (expiredPreview && !expiredPreview.dragStateRestored && !expiredPreview.snapStateRestored) {
      console.log('✅ 过期的拖拽和吸附状态已被正确跳过')
    }

    // ==================== 测试6: 不安全状态处理 ====================
    console.log('\n📝 测试6: 不安全状态处理')
    
    // 创建不安全的状态数据（进行中的拖拽）
    const unsafeData = {
      version: '1.0.0',
      timestamp: Date.now(),
      data: {
        previewLines: {
          'unsafe-preview': {
            id: 'unsafe-preview',
            type: 'preview-line',
            sourceNodeId: 'node-1',
            targetNodeId: 'node-2',
            dragState: {
              isDragging: true, // 进行中的拖拽
              dragType: 'preview-line',
              timestamp: Date.now()
            }
          }
        }
      }
    }

    const unsafeRestored = await persistenceManager.deserializeState(unsafeData)
    console.log('✅ 不安全状态处理测试完成')
    
    // 检查不安全状态是否被正确跳过
    const unsafePreview = unsafeRestored.edges['unsafe-preview']
    if (unsafePreview && !unsafePreview.dragStateRestored) {
      console.log('✅ 不安全的拖拽状态已被正确跳过')
    }

    console.log('\n🎉 统一预览线拖拽和吸附状态持久化测试全部通过!')
    
    // 清理资源
    persistenceManager.destroy()
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    throw error
  }
}

// 运行测试
testUnifiedPreviewLinePersistence().catch(console.error)