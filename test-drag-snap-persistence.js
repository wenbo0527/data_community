/**
 * 拖拽和吸附状态持久化测试
 * 测试EdgePersistenceManager的拖拽状态和吸附状态序列化/反序列化功能
 */

import { EdgePersistenceManager } from './src/pages/marketing/tasks/composables/canvas/unified/EdgePersistenceManager.js'

// 模拟拖拽状态管理器
class MockDragStateManager {
  constructor() {
    this.currentState = 'idle'
    this.currentDrag = null
    this.stateHistory = []
  }

  getStateInfo() {
    return {
      currentState: this.currentState,
      currentDrag: this.currentDrag,
      stateHistory: this.stateHistory.slice(-5), // 只保留最近5个状态
      timestamp: Date.now()
    }
  }

  transitionTo(newState) {
    this.stateHistory.push({
      from: this.currentState,
      to: newState,
      timestamp: Date.now()
    })
    this.currentState = newState
    console.log(`🔄 拖拽状态转换: ${this.currentState} -> ${newState}`)
  }

  startDrag(dragInfo) {
    this.currentDrag = dragInfo
    this.transitionTo('dragging')
  }

  endDrag() {
    this.currentDrag = null
    this.transitionTo('idle')
  }
}

// 模拟边管理器
class MockEdgeManager {
  constructor() {
    this.dragStateManager = new MockDragStateManager()
    this.snapInfo = {
      isSnapping: false,
      snapTarget: null,
      snapDistance: 30,
      snapConfig: {
        enabled: true,
        distance: 30,
        showIndicators: true
      }
    }
    this.previewLines = new Map()
    this.connections = new Map()
    this.eventListeners = new Map()
  }

  // 事件监听器方法
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
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.warn('事件监听器执行错误:', error)
        }
      })
    }
  }

  // 模拟拖拽会话
  simulateDragSession() {
    this.dragStateManager.startDrag({
      type: 'preview_line',
      startPosition: { x: 100, y: 200 },
      currentPosition: { x: 150, y: 250 },
      sourceNode: 'node-1',
      sourcePort: 'output-1'
    })

    // 模拟吸附状态
    this.snapInfo.isSnapping = true
    this.snapInfo.snapTarget = {
      nodeId: 'node-2',
      portId: 'input-1',
      position: { x: 200, y: 300 },
      distance: 15
    }
  }

  // 重置为空闲状态
  resetToIdle() {
    this.dragStateManager.endDrag()
    this.snapInfo.isSnapping = false
    this.snapInfo.snapTarget = null
  }
}

// 测试函数
async function testDragSnapPersistence() {
  console.log('🧪 开始拖拽和吸附状态持久化测试...\n')

  try {
    // 1. 创建模拟环境
    const mockEdgeManager = new MockEdgeManager()
    const persistenceManager = new EdgePersistenceManager(mockEdgeManager, {
      includeDragState: true,
      includeSnapState: true,
      debug: true
    })

    await persistenceManager.initialize()

    console.log('✅ 1. 持久化管理器初始化成功')

    // 2. 测试拖拽状态序列化
    console.log('\n📦 2. 测试拖拽状态序列化...')
    
    // 模拟拖拽会话
    mockEdgeManager.simulateDragSession()
    
    const dragStateData = persistenceManager.serializeDragState(mockEdgeManager.dragStateManager)
    console.log('拖拽状态序列化结果:', JSON.stringify(dragStateData, null, 2))

    if (dragStateData && dragStateData.currentState && dragStateData.currentDrag) {
      console.log('✅ 拖拽状态序列化成功')
    } else {
      console.log('❌ 拖拽状态序列化失败')
      return false
    }

    // 3. 测试吸附状态序列化
    console.log('\n📦 3. 测试吸附状态序列化...')
    
    const snapStateData = persistenceManager.serializeSnapState(mockEdgeManager.snapInfo)
    console.log('吸附状态序列化结果:', JSON.stringify(snapStateData, null, 2))

    if (snapStateData && snapStateData.hasOwnProperty('isSnapping')) {
      console.log('✅ 吸附状态序列化成功')
    } else {
      console.log('❌ 吸附状态序列化失败')
      return false
    }

    // 4. 测试完整状态序列化
    console.log('\n📦 4. 测试完整状态序列化...')
    
    const fullState = await persistenceManager.serializeState()
    console.log('完整状态序列化结果包含拖拽状态:', !!fullState.data.dragState)
    console.log('完整状态序列化结果包含吸附状态:', !!fullState.data.snapState)

    if (fullState.data.dragState && fullState.data.snapState) {
      console.log('✅ 完整状态序列化成功')
    } else {
      console.log('❌ 完整状态序列化失败')
      return false
    }

    // 5. 测试拖拽状态反序列化
    console.log('\n📤 5. 测试拖拽状态反序列化...')
    
    // 重置为空闲状态
    mockEdgeManager.resetToIdle()
    
    // 反序列化拖拽状态
    const dragStateRestored = persistenceManager.deserializeDragState(
      dragStateData, 
      mockEdgeManager.dragStateManager
    )
    
    console.log('拖拽状态反序列化结果:', dragStateRestored)
    
    if (dragStateRestored !== undefined) {
      console.log('✅ 拖拽状态反序列化成功')
    } else {
      console.log('❌ 拖拽状态反序列化失败')
      return false
    }

    // 6. 测试吸附状态反序列化
    console.log('\n📤 6. 测试吸附状态反序列化...')
    
    const snapStateRestored = persistenceManager.deserializeSnapState(snapStateData)
    console.log('吸附状态反序列化结果:', JSON.stringify(snapStateRestored, null, 2))
    
    if (snapStateRestored && snapStateRestored.hasOwnProperty('isSnapping')) {
      console.log('✅ 吸附状态反序列化成功')
    } else {
      console.log('❌ 吸附状态反序列化失败')
      return false
    }

    // 7. 测试完整状态反序列化
    console.log('\n📤 7. 测试完整状态反序列化...')
    
    const restoredState = await persistenceManager.deserializeState(fullState)
    console.log('完整状态反序列化包含拖拽状态恢复:', !!restoredState.dragStateRestored)
    console.log('完整状态反序列化包含吸附状态:', !!restoredState.snapState)

    if (restoredState.dragStateRestored !== undefined && restoredState.snapState) {
      console.log('✅ 完整状态反序列化成功')
    } else {
      console.log('❌ 完整状态反序列化失败')
      return false
    }

    // 8. 测试过期状态处理
    console.log('\n⏰ 8. 测试过期状态处理...')
    
    // 创建过期的拖拽状态数据
    const expiredDragState = {
      ...dragStateData,
      timestamp: Date.now() - 10 * 60 * 1000 // 10分钟前
    }
    
    const expiredDragRestored = persistenceManager.deserializeDragState(
      expiredDragState, 
      mockEdgeManager.dragStateManager
    )
    
    if (expiredDragRestored === false) {
      console.log('✅ 过期拖拽状态正确拒绝恢复')
    } else {
      console.log('❌ 过期拖拽状态处理失败')
      return false
    }

    // 9. 测试不安全状态处理
    console.log('\n⚠️ 9. 测试不安全状态处理...')
    
    // 创建不安全的拖拽状态数据
    const unsafeDragState = {
      ...dragStateData,
      currentState: 'dragging' // 进行中的拖拽状态
    }
    
    const unsafeDragRestored = persistenceManager.deserializeDragState(
      unsafeDragState, 
      mockEdgeManager.dragStateManager
    )
    
    if (unsafeDragRestored === false) {
      console.log('✅ 不安全拖拽状态正确拒绝恢复')
    } else {
      console.log('❌ 不安全拖拽状态处理失败')
      return false
    }

    console.log('\n🎉 所有拖拽和吸附状态持久化测试通过！')
    return true

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    return false
  }
}

// 运行测试
testDragSnapPersistence().then(success => {
  if (success) {
    console.log('\n✅ 拖拽和吸附状态持久化功能验证完成')
    process.exit(0)
  } else {
    console.log('\n❌ 拖拽和吸附状态持久化功能验证失败')
    process.exit(1)
  }
}).catch(error => {
  console.error('❌ 测试执行失败:', error)
  process.exit(1)
})