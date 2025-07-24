/**
 * 吸附功能坐标系测试套件
 * 
 * 验证坐标系转换、吸附逻辑和性能的正确性
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  NodeMoveSnapHandler,
  DragHintSnapHandler,
  PreviewLineCoordinateManager,
  CoordinateValidationCache,
  getValidatedCoordinates
} from '../examples/SnapCoordinateSystemExample.js'
import { 
  SNAP_DISTANCES,
  COORDINATE_SYSTEM_CONFIG,
  SnapConfigManager,
  validateSnapConfig,
  adjustConfigForContext
} from '../config/SnapConfig.js'

// ===== 1. 模拟对象和工具函数 =====

/**
 * 模拟图形对象
 */
function createMockGraph() {
  const nodes = new Map()
  const edges = new Map()
  
  return {
    nodes,
    edges,
    getNodes: () => Array.from(nodes.values()),
    getEdges: () => Array.from(edges.values()),
    getCellById: (id) => nodes.get(id) || edges.get(id),
    addNode: (config) => {
      const node = createMockNode(config)
      nodes.set(node.id, node)
      return node
    },
    addEdge: (config) => {
      const edge = createMockEdge(config)
      edges.set(edge.id, edge)
      return edge
    },
    removeNode: (node) => {
      const id = typeof node === 'string' ? node : node.id
      nodes.delete(id)
    },
    removeEdge: (edge) => {
      const id = typeof edge === 'string' ? edge : edge.id
      edges.delete(id)
    },
    on: vi.fn(),
    off: vi.fn()
  }
}

/**
 * 模拟节点对象
 */
function createMockNode(config) {
  const nodeData = {
    id: config.id || `node-${Math.random().toString(36).substr(2, 9)}`,
    position: { x: config.x || 0, y: config.y || 0 },
    size: { width: config.width || 100, height: config.height || 60 },
    attrs: config.attrs || {},
    data: config.data || {}
  }
  
  return {
    id: nodeData.id,
    getPosition: () => ({ ...nodeData.position }),
    setPosition: (pos) => Object.assign(nodeData.position, pos),
    getSize: () => ({ ...nodeData.size }),
    setSize: (size) => Object.assign(nodeData.size, size),
    getAttrs: () => ({ ...nodeData.attrs }),
    setAttrs: (attrs) => Object.assign(nodeData.attrs, attrs),
    getData: () => ({ ...nodeData.data }),
    setData: (data) => Object.assign(nodeData.data, data)
  }
}

/**
 * 模拟边对象
 */
function createMockEdge(config) {
  return {
    id: config.id || `edge-${Math.random().toString(36).substr(2, 9)}`,
    source: config.source,
    target: config.target,
    attrs: config.attrs || {},
    data: config.data || {}
  }
}

/**
 * 模拟坐标管理器
 */
function createMockCoordinateManager() {
  return {
    logicalToDOM: vi.fn((x, y) => ({ x: x + 10, y: y + 10 })),
    DOMToLogical: vi.fn((x, y) => ({ x: x - 10, y: y - 10 })),
    validateCoordinateTransform: vi.fn((node) => {
      // 模拟坐标偏差检测
      const position = node.getPosition()
      const hasDeviation = Math.random() > 0.7 // 30% 概率有偏差
      
      if (hasDeviation) {
        return {
          isValid: false,
          difference: { x: 2, y: 3 },
          correctedPosition: {
            x: position.x - 2,
            y: position.y - 3
          }
        }
      }
      
      return {
        isValid: true,
        difference: null,
        correctedPosition: position
      }
    }),
    correctDragHintPosition: vi.fn((sourceNodeId, position, size, branchIndex) => ({
      x: position.x + branchIndex * 5,
      y: position.y + branchIndex * 5
    })),
    correctPreviewLinePath: vi.fn((sourceNodeId, branchIndex, startPoint, endPoint) => ({
      startPoint,
      endPoint: {
        x: endPoint.x + branchIndex * 2,
        y: endPoint.y + branchIndex * 2
      },
      pathData: `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`
    }))
  }
}

// ===== 2. 配置测试 =====

describe('吸附配置测试', () => {
  test('配置验证应该通过', () => {
    const validation = validateSnapConfig()
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })
  
  test('配置管理器应该正确合并配置', () => {
    const customConfig = {
      distances: {
        NODE_MOVE_SNAP: 100
      }
    }
    
    const manager = new SnapConfigManager(customConfig)
    expect(manager.get('distances.NODE_MOVE_SNAP')).toBe(100)
    expect(manager.get('distances.DRAG_HINT_SNAP')).toBe(SNAP_DISTANCES.DRAG_HINT_SNAP)
  })
  
  test('应该根据上下文调整配置', () => {
    const context = {
      nodeCount: 150,
      zoomLevel: 2.5,
      deviceType: 'desktop',
      canvasSize: { width: 1920, height: 1080 }
    }
    
    const adjustedConfig = adjustConfigForContext(context)
    
    // 大量节点应该减少吸附距离
    expect(adjustedConfig.NODE_MOVE_SNAP).toBeLessThan(SNAP_DISTANCES.NODE_MOVE_SNAP)
    
    // 高缩放级别应该进一步减少吸附距离
    expect(adjustedConfig.NODE_MOVE_SNAP).toBeLessThan(SNAP_DISTANCES.NODE_MOVE_SNAP * 0.8)
  })
})

// ===== 3. 坐标系转换测试 =====

describe('坐标系转换测试', () => {
  let graph
  let coordinateManager
  
  beforeEach(() => {
    graph = createMockGraph()
    coordinateManager = createMockCoordinateManager()
  })
  
  test('坐标验证缓存应该正常工作', () => {
    const cache = new CoordinateValidationCache(1000)
    const node = createMockNode({ x: 100, y: 100 })
    
    // 首次获取应该返回null
    expect(cache.get(node)).toBeNull()
    
    // 设置缓存
    const validation = { isValid: true, difference: null }
    cache.set(node, validation)
    
    // 应该能够获取缓存的值
    expect(cache.get(node)).toEqual(validation)
  })
  
  test('坐标验证缓存应该正确过期', async () => {
    const cache = new CoordinateValidationCache(50) // 50ms TTL
    const node = createMockNode({ x: 100, y: 100 })
    
    const validation = { isValid: true, difference: null }
    cache.set(node, validation)
    
    // 立即获取应该有值
    expect(cache.get(node)).toEqual(validation)
    
    // 等待过期
    await new Promise(resolve => setTimeout(resolve, 60))
    
    // 过期后应该返回null
    expect(cache.get(node)).toBeNull()
  })
})

// ===== 4. 节点移动吸附测试 =====

describe('节点移动吸附测试', () => {
  let graph
  let coordinateManager
  let snapHandler
  
  beforeEach(() => {
    graph = createMockGraph()
    coordinateManager = createMockCoordinateManager()
    snapHandler = new NodeMoveSnapHandler(graph)
    snapHandler.coordinateManager = coordinateManager
  })
  
  test('应该正确检测吸附目标', () => {
    // 创建目标节点
    const targetNode = graph.addNode({
      x: 200, y: 200, width: 100, height: 60,
      data: { type: 'normal' }
    })
    
    // 创建移动节点
    const movingNode = graph.addNode({
      x: 150, y: 150, width: 100, height: 60,
      data: { type: 'normal' }
    })
    
    // 执行吸附检测
    const result = snapHandler.handleNodeMove(movingNode, { x: 150, y: 150 })
    
    // 验证结果
    expect(result.snapResult.hasSnap).toBe(true)
    expect(result.snapResult.target.node.id).toBe(targetNode.id)
    expect(coordinateManager.validateCoordinateTransform).toHaveBeenCalledWith(movingNode)
  })
  
  test('应该跳过特殊节点', () => {
    // 创建拖拽提示点
    const dragHint = graph.addNode({
      x: 200, y: 200, width: 12, height: 12,
      data: { isDragHint: true, type: 'drag-hint' }
    })
    
    // 创建移动节点
    const movingNode = graph.addNode({
      x: 190, y: 190, width: 100, height: 60,
      data: { type: 'normal' }
    })
    
    // 执行吸附检测
    const result = snapHandler.handleNodeMove(movingNode, { x: 190, y: 190 })
    
    // 应该没有检测到吸附目标（因为跳过了拖拽提示点）
    expect(result.snapResult.hasSnap).toBe(false)
  })
  
  test('应该应用坐标修正', () => {
    // 模拟坐标偏差
    coordinateManager.validateCoordinateTransform.mockReturnValue({
      isValid: false,
      difference: { x: 5, y: 3 },
      correctedPosition: { x: 145, y: 147 }
    })
    
    const movingNode = graph.addNode({
      x: 150, y: 150, width: 100, height: 60
    })
    
    const result = snapHandler.handleNodeMove(movingNode, { x: 150, y: 150 })
    
    // 验证坐标修正被应用
    expect(result.centerX).toBe(195) // 150 + 50 - 5
    expect(result.centerY).toBe(177) // 150 + 30 - 3
  })
})

// ===== 5. 拖拽点吸附测试 =====

describe('拖拽点吸附测试', () => {
  let graph
  let coordinateManager
  let snapHandler
  
  beforeEach(() => {
    graph = createMockGraph()
    coordinateManager = createMockCoordinateManager()
    snapHandler = new DragHintSnapHandler(graph)
    snapHandler.coordinateManager = coordinateManager
  })
  
  test('应该正确检测拖拽点吸附', () => {
    // 创建拖拽提示点
    const dragHint = graph.addNode({
      x: 200, y: 200, width: 12, height: 12,
      data: { isDragHint: true, type: 'drag-hint', sourceNodeId: 'source-1' }
    })
    
    // 创建拖拽节点
    const draggedNode = graph.addNode({
      x: 190, y: 190, width: 100, height: 60
    })
    
    const result = snapHandler.checkDragHintSnap(draggedNode, { x: 190, y: 190 })
    
    // 验证吸附检测
    expect(result.canConnect).toBe(true)
    expect(result.nearestHint.id).toBe(dragHint.id)
    expect(result.distance).toBeLessThan(snapHandler.CONNECT_THRESHOLD)
  })
  
  test('应该在距离超出阈值时不吸附', () => {
    // 创建距离较远的拖拽提示点
    const dragHint = graph.addNode({
      x: 300, y: 300, width: 12, height: 12,
      data: { isDragHint: true, type: 'drag-hint' }
    })
    
    const draggedNode = graph.addNode({
      x: 100, y: 100, width: 100, height: 60
    })
    
    const result = snapHandler.checkDragHintSnap(draggedNode, { x: 100, y: 100 })
    
    // 距离太远，不应该吸附
    expect(result.canConnect).toBe(false)
    expect(result.nearestHint).toBeNull()
  })
  
  test('应该执行自动连接', () => {
    const sourceNode = graph.addNode({
      x: 100, y: 100, width: 100, height: 60,
      data: { type: 'normal' }
    })
    
    const targetNode = graph.addNode({
      x: 300, y: 300, width: 100, height: 60,
      data: { type: 'normal' }
    })
    
    const dragHint = graph.addNode({
      x: 200, y: 200, width: 12, height: 12,
      data: {
        isDragHint: true,
        type: 'drag-hint',
        sourceNodeId: sourceNode.id,
        branchId: 'branch-1',
        branchLabel: 'Yes'
      }
    })
    
    const connection = snapHandler.executeAutoConnect(sourceNode, targetNode, dragHint)
    
    // 验证连接创建
    expect(connection).toBeDefined()
    expect(connection.source.cell).toBe(sourceNode.id)
    expect(connection.target.cell).toBe(targetNode.id)
    
    // 验证拖拽提示点被删除
    expect(graph.getCellById(dragHint.id)).toBeUndefined()
  })
})

// ===== 6. 预览线坐标管理测试 =====

describe('预览线坐标管理测试', () => {
  let graph
  let coordinateManager
  let previewManager
  
  beforeEach(() => {
    graph = createMockGraph()
    coordinateManager = createMockCoordinateManager()
    previewManager = new PreviewLineCoordinateManager(graph)
    previewManager.coordinateManager = coordinateManager
  })
  
  test('应该正确计算预览线终点', () => {
    const sourceNode = graph.addNode({
      x: 100, y: 100, width: 100, height: 60
    })
    
    const endpoint = previewManager.calculatePreviewLineEndpoint(sourceNode, 1)
    
    // 验证基础计算
    expect(endpoint.original.x).toBe(250) // 100 + 50 + 150*1
    expect(endpoint.original.y).toBe(260) // 100 + 60 + 100
    
    // 验证坐标修正被调用
    expect(coordinateManager.correctPreviewLinePath).toHaveBeenCalled()
    expect(endpoint.corrected).toBeDefined()
  })
  
  test('应该创建拖拽提示点', () => {
    const sourceNode = graph.addNode({
      x: 100, y: 100, width: 100, height: 60
    })
    
    const endpoint = {
      original: { x: 200, y: 200 },
      corrected: { x: 202, y: 202 }
    }
    
    const branchInfo = {
      id: 'branch-1',
      label: 'Yes',
      index: 0
    }
    
    const dragHint = previewManager.createDragHint(sourceNode, endpoint, branchInfo)
    
    // 验证拖拽提示点创建
    expect(dragHint).toBeDefined()
    expect(dragHint.getData().isDragHint).toBe(true)
    expect(dragHint.getData().sourceNodeId).toBe(sourceNode.id)
    expect(dragHint.getData().branchId).toBe(branchInfo.id)
    
    // 验证坐标修正被调用
    expect(coordinateManager.correctDragHintPosition).toHaveBeenCalled()
  })
})

// ===== 7. 性能测试 =====

describe('性能测试', () => {
  let graph
  let coordinateManager
  
  beforeEach(() => {
    graph = createMockGraph()
    coordinateManager = createMockCoordinateManager()
  })
  
  test('坐标验证缓存性能', () => {
    const cache = new CoordinateValidationCache()
    const nodes = []
    
    // 创建100个节点
    for (let i = 0; i < 100; i++) {
      nodes.push(createMockNode({ x: i * 10, y: i * 10 }))
    }
    
    // 首次访问（缓存未命中）
    const startTime1 = performance.now()
    nodes.forEach(node => {
      getValidatedCoordinates(node, coordinateManager)
    })
    const endTime1 = performance.now()
    const firstAccessTime = endTime1 - startTime1
    
    // 第二次访问（缓存命中）
    const startTime2 = performance.now()
    nodes.forEach(node => {
      getValidatedCoordinates(node, coordinateManager)
    })
    const endTime2 = performance.now()
    const secondAccessTime = endTime2 - startTime2
    
    // 缓存命中应该显著提高性能
    expect(secondAccessTime).toBeLessThan(firstAccessTime * 0.5)
  })
})

// ===== 8. 边界情况测试 =====

describe('边界情况测试', () => {
  let graph
  let coordinateManager
  let snapHandler
  
  beforeEach(() => {
    graph = createMockGraph()
    coordinateManager = createMockCoordinateManager()
    snapHandler = new NodeMoveSnapHandler(graph)
    snapHandler.coordinateManager = coordinateManager
  })
  
  test('应该处理空图形', () => {
    const movingNode = graph.addNode({
      x: 100, y: 100, width: 100, height: 60
    })
    
    // 移除所有其他节点
    graph.removeNode(movingNode)
    graph.addNode({
      x: 100, y: 100, width: 100, height: 60,
      id: movingNode.id
    })
    
    const result = snapHandler.handleNodeMove(movingNode, { x: 100, y: 100 })
    
    expect(result.snapResult.hasSnap).toBe(false)
  })
  
  test('应该处理重叠节点', () => {
    // 创建两个完全重叠的节点
    const node1 = graph.addNode({
      x: 100, y: 100, width: 100, height: 60
    })
    
    const node2 = graph.addNode({
      x: 100, y: 100, width: 100, height: 60
    })
    
    const result = snapHandler.handleNodeMove(node1, { x: 100, y: 100 })
    
    // 应该检测到吸附（距离为0）
    expect(result.snapResult.hasSnap).toBe(true)
    expect(result.snapResult.target.distance).toBe(0)
  })
  
  test('应该处理极大坐标值', () => {
    const largeCoordinate = 999999
    
    const node1 = graph.addNode({
      x: largeCoordinate, y: largeCoordinate, width: 100, height: 60
    })
    
    const node2 = graph.addNode({
      x: largeCoordinate + 50, y: largeCoordinate + 50, width: 100, height: 60
    })
    
    const result = snapHandler.handleNodeMove(node1, { 
      x: largeCoordinate, 
      y: largeCoordinate 
    })
    
    // 应该能够正常处理大坐标值
    expect(result.centerX).toBe(largeCoordinate + 50)
    expect(result.centerY).toBe(largeCoordinate + 30)
    expect(result.snapResult.hasSnap).toBe(true)
  })
  
  test('应该处理负坐标值', () => {
    const node1 = graph.addNode({
      x: -100, y: -100, width: 100, height: 60
    })
    
    const node2 = graph.addNode({
      x: -50, y: -50, width: 100, height: 60
    })
    
    const result = snapHandler.handleNodeMove(node1, { x: -100, y: -100 })
    
    // 应该能够正常处理负坐标值
    expect(result.centerX).toBe(-50)
    expect(result.centerY).toBe(-70)
    expect(result.snapResult.hasSnap).toBe(true)
  })
})

// ===== 9. 集成测试 =====

describe('集成测试', () => {
  let graph
  let coordinateManager
  let nodeSnapHandler
  let dragHintSnapHandler
  let previewManager
  
  beforeEach(() => {
    graph = createMockGraph()
    coordinateManager = createMockCoordinateManager()
    nodeSnapHandler = new NodeMoveSnapHandler(graph)
    dragHintSnapHandler = new DragHintSnapHandler(graph)
    previewManager = new PreviewLineCoordinateManager(graph)
    
    nodeSnapHandler.coordinateManager = coordinateManager
    dragHintSnapHandler.coordinateManager = coordinateManager
    previewManager.coordinateManager = coordinateManager
  })
  
  test('完整的吸附流程', () => {
    // 1. 创建源节点
    const sourceNode = graph.addNode({
      x: 100, y: 100, width: 100, height: 60,
      data: { type: 'normal' }
    })
    
    // 2. 创建预览线和拖拽提示点
    const endpoint = previewManager.calculatePreviewLineEndpoint(sourceNode, 0)
    const dragHint = previewManager.createDragHint(sourceNode, endpoint, {
      id: 'branch-1',
      label: 'Yes',
      index: 0
    })
    
    // 3. 创建目标节点并移动到拖拽提示点附近
    const targetNode = graph.addNode({
      x: endpoint.corrected.x - 50, y: endpoint.corrected.y - 30,
      width: 100, height: 60,
      data: { type: 'normal' }
    })
    
    // 4. 检测节点移动吸附
    const moveResult = nodeSnapHandler.handleNodeMove(targetNode, targetNode.getPosition())
    
    // 5. 检测拖拽点吸附
    const dragResult = dragHintSnapHandler.checkDragHintSnap(targetNode, targetNode.getPosition())
    
    // 6. 执行自动连接
    let connection = null
    if (dragResult.canConnect) {
      connection = dragHintSnapHandler.executeAutoConnect(
        sourceNode,
        targetNode,
        dragResult.nearestHint
      )
    }
    
    // 验证完整流程
    expect(dragHint).toBeDefined()
    expect(moveResult.snapResult.hasSnap).toBe(true)
    expect(dragResult.canConnect).toBe(true)
    expect(connection).toBeDefined()
    expect(connection.source.cell).toBe(sourceNode.id)
    expect(connection.target.cell).toBe(targetNode.id)
  })
  
  test('多分支预览线处理', () => {
    const sourceNode = graph.addNode({
      x: 100, y: 100, width: 100, height: 60
    })
    
    // 创建多个分支
    const branches = [
      { id: 'branch-1', label: 'Yes', index: 0 },
      { id: 'branch-2', label: 'No', index: 1 },
      { id: 'branch-3', label: 'Maybe', index: 2 }
    ]
    
    const dragHints = branches.map(branch => {
      const endpoint = previewManager.calculatePreviewLineEndpoint(sourceNode, branch.index)
      return previewManager.createDragHint(sourceNode, endpoint, branch)
    })
    
    // 验证所有拖拽提示点都被创建
    expect(dragHints).toHaveLength(3)
    dragHints.forEach((hint, index) => {
      expect(hint.getData().branchId).toBe(branches[index].id)
      expect(hint.getData().branchLabel).toBe(branches[index].label)
    })
    
    // 验证拖拽提示点位置不重叠
    const positions = dragHints.map(hint => hint.getPosition())
    for (let i = 0; i < positions.length - 1; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = Math.sqrt(
          Math.pow(positions[i].x - positions[j].x, 2) +
          Math.pow(positions[i].y - positions[j].y, 2)
        )
        expect(distance).toBeGreaterThan(20) // 最小间距
      }
    }
  })
})