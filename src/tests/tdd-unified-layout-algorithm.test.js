/**
 * TDD测试：统一布局算法
 * 验证自上而下、父子分层、模块居中对齐
 * 特别关注开始节点在布局中的正确位置和行为
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LayoutModeManager } from '../core/interaction/LayoutModeManager'
import { UnifiedEventBus } from '../core/UnifiedEventBus'
import { UnifiedCacheManager } from '../core/UnifiedCacheManager'
import { ErrorHandler } from '../core/ErrorHandler'
import { CoordinateSystemManager } from '../utils/CoordinateSystemManager'

describe('TDD: 统一布局算法测试', () => {
  let layoutManager
  let mockGraph
  let mockEventBus
  let mockCacheManager
  let mockErrorHandler
  let mockCoordinateManager

  beforeEach(() => {
    // Mock graph
    mockGraph = {
      getNodes: vi.fn(),
      getEdges: vi.fn(),
      setPosition: vi.fn(),
      getBBox: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      layout: vi.fn(),
      freeze: vi.fn(),
      unfreeze: vi.fn()
    }

    // Mock dependencies
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      removeAllListeners: vi.fn()
    }

    mockCacheManager = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn()
    }

    mockErrorHandler = {
      handleError: vi.fn(),
      getErrorStats: vi.fn(),
      clearErrors: vi.fn()
    }

    // Mock CoordinateSystemManager
    mockCoordinateManager = {
      logicalToDOM: vi.fn().mockImplementation((pos) => pos),
      DOMToLogical: vi.fn().mockImplementation((pos) => pos),
      getNodeDOMPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      calculateCoordinateOffset: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      validateCoordinateTransform: vi.fn().mockReturnValue(true),
      correctLayoutPosition: vi.fn().mockImplementation((pos) => pos),
      correctDragHintPosition: vi.fn().mockImplementation((pos) => pos)
    }

    layoutManager = new LayoutModeManager(
      mockGraph,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler,
      mockCoordinateManager
    )
  })

  afterEach(() => {
    if (layoutManager) {
      layoutManager.destroy()
    }
  })

  describe('开始节点布局测试', () => {
    beforeEach(() => {
      layoutManager.switchToUnifiedMode()
    })

    it('应该将开始节点放置在布局的最顶层（失败测试）', () => {
      // 准备测试数据：包含开始节点的简单流程
      const nodesWithStart = [
        { id: 'start-1', type: 'start', position: { x: 200, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'sms-1', type: 'sms', position: { x: 400, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'end-1', type: 'end', position: { x: 600, y: 300 }, size: { width: 120, height: 80 } }
      ]

      mockGraph.getNodes.mockReturnValue(nodesWithStart)
      mockGraph.getEdges.mockReturnValue([])
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 80 })

      // 应用统一布局
      const layoutResult = layoutManager.applyUnifiedLayout()
      
      expect(layoutResult).toBe(true)

      // 验证setPosition被调用
      expect(mockGraph.setPosition).toHaveBeenCalled()
      
      // 获取所有setPosition调用的参数
      const positionCalls = mockGraph.setPosition.mock.calls
      const startNodeCall = positionCalls.find(call => call[0] === 'start-1')
      const smsNodeCall = positionCalls.find(call => call[0] === 'sms-1')
      const endNodeCall = positionCalls.find(call => call[0] === 'end-1')

      // 🎯 修复：验证垂直分层布局（Y坐标层级关系）
      expect(startNodeCall).toBeDefined()
      expect(smsNodeCall).toBeDefined()
      expect(endNodeCall).toBeDefined()
      
      // 验证垂直分层：开始节点在最顶层（Y坐标最小）
      expect(startNodeCall[1].y).toBeLessThan(smsNodeCall[1].y)
      expect(smsNodeCall[1].y).toBeLessThan(endNodeCall[1].y)
      
      // 验证层级间距（每层间距应大于100px）
      const layer1Spacing = smsNodeCall[1].y - startNodeCall[1].y
      const layer2Spacing = endNodeCall[1].y - smsNodeCall[1].y
      expect(layer1Spacing).toBeGreaterThan(100)
      expect(layer2Spacing).toBeGreaterThan(100)
    })

    it('应该确保开始节点在自上而下布局中的正确层级识别（失败测试）', () => {
      // 准备复杂的多层级流程
      const complexFlow = [
        { id: 'start-1', type: 'start', position: { x: 100, y: 400 }, size: { width: 120, height: 80 } },
        { id: 'audience-split-1', type: 'audience-split', position: { x: 300, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'sms-branch-1', type: 'sms', position: { x: 500, y: 100 }, size: { width: 120, height: 80 } },
        { id: 'ai-call-branch-1', type: 'ai-call', position: { x: 500, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'wait-merge-1', type: 'wait', position: { x: 700, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'end-1', type: 'end', position: { x: 900, y: 200 }, size: { width: 120, height: 80 } }
      ]

      mockGraph.getNodes.mockReturnValue(complexFlow)
      mockGraph.getEdges.mockReturnValue([])
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 80 })

      // 应用统一布局
      const layoutResult = layoutManager.applyUnifiedLayout()
      
      expect(layoutResult).toBe(true)

      // 🎯 修复：验证垂直分层的层级识别逻辑
      const positionCalls = mockGraph.setPosition.mock.calls
      const startNodeCall = positionCalls.find(call => call[0] === 'start-1')
      const audienceSplitCall = positionCalls.find(call => call[0] === 'audience-split-1')
      const waitCall = positionCalls.find(call => call[0] === 'wait-merge-1')
      const endNodeCall = positionCalls.find(call => call[0] === 'end-1')
      
      expect(startNodeCall).toBeDefined()
      expect(audienceSplitCall).toBeDefined()
      expect(waitCall).toBeDefined()
      expect(endNodeCall).toBeDefined()
      
      // 验证垂直分层：开始节点在最顶层（层级0）
      expect(startNodeCall[1].y).toBeLessThan(audienceSplitCall[1].y)
      expect(audienceSplitCall[1].y).toBeLessThan(waitCall[1].y)
      expect(waitCall[1].y).toBeLessThan(endNodeCall[1].y)
      
      // 验证分支节点在同一层（Y坐标一致）
      const smsBranchCall = positionCalls.find(call => call[0] === 'sms-branch-1')
      const aiCallBranchCall = positionCalls.find(call => call[0] === 'ai-call-branch-1')
      expect(smsBranchCall).toBeDefined()
      expect(aiCallBranchCall).toBeDefined()
      
      // 分支节点应该在同一层（Y坐标相近，允许小幅差异）
      expect(Math.abs(smsBranchCall[1].y - aiCallBranchCall[1].y)).toBeLessThan(20)
      
      // 验证层级间距合理性（每层间距应大于100px）
      const layer1Spacing = audienceSplitCall[1].y - startNodeCall[1].y
      const layer2Spacing = waitCall[1].y - audienceSplitCall[1].y
      expect(layer1Spacing).toBeGreaterThan(100)
      expect(layer2Spacing).toBeGreaterThan(100)
    })

    it('应该正确处理开始节点的单一输出端口连接（失败测试）', () => {
      // 准备包含连接关系的测试数据
      const nodesWithConnections = [
        { id: 'start-1', type: 'start', position: { x: 100, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'sms-1', type: 'sms', position: { x: 400, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'wait-1', type: 'wait', position: { x: 700, y: 200 }, size: { width: 120, height: 80 } }
      ]

      const edges = [
        { id: 'edge-1', source: 'start-1', target: 'sms-1' },
        { id: 'edge-2', source: 'sms-1', target: 'wait-1' }
      ]

      mockGraph.getNodes.mockReturnValue(nodesWithConnections)
      mockGraph.getEdges.mockReturnValue(edges)
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 80 })

      // 应用统一布局
      const layoutResult = layoutManager.applyUnifiedLayout()
      
      expect(layoutResult).toBe(true)

      // 🎯 修复：验证开始节点连接关系的垂直分层处理
      const positionCalls = mockGraph.setPosition.mock.calls
      const startNodeCall = positionCalls.find(call => call[0] === 'start-1')
      const smsNodeCall = positionCalls.find(call => call[0] === 'sms-1')
      const waitNodeCall = positionCalls.find(call => call[0] === 'wait-1')
      
      expect(startNodeCall).toBeDefined()
      expect(smsNodeCall).toBeDefined()
      expect(waitNodeCall).toBeDefined()
      
      // 验证垂直分层：开始节点在最顶层，按连接关系逐层向下
      expect(startNodeCall[1].y).toBeLessThan(smsNodeCall[1].y)
      expect(smsNodeCall[1].y).toBeLessThan(waitNodeCall[1].y)
      
      // 验证层级间距（每层间距应大于100px）
      const layer1Spacing = smsNodeCall[1].y - startNodeCall[1].y
      const layer2Spacing = waitNodeCall[1].y - smsNodeCall[1].y
      expect(layer1Spacing).toBeGreaterThan(100)
      expect(layer2Spacing).toBeGreaterThan(100)
      
      // 验证X坐标中心对齐（不同层间X中心一致）
      const startCenterX = startNodeCall[1].x + 60 // 节点宽度120的一半
      const smsCenterX = smsNodeCall[1].x + 60
      const waitCenterX = waitNodeCall[1].x + 60
      expect(Math.abs(startCenterX - smsCenterX)).toBeLessThan(20)
      expect(Math.abs(smsCenterX - waitCenterX)).toBeLessThan(20)
    })

    it('应该在模块居中对齐中正确处理开始节点（失败测试）', () => {
      // 准备包含分支的复杂流程
      const branchFlow = [
        { id: 'start-1', type: 'start', position: { x: 50, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'audience-split-1', type: 'audience-split', position: { x: 250, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'sms-branch-1', type: 'sms', position: { x: 450, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'ai-call-branch-1', type: 'ai-call', position: { x: 450, y: 400 }, size: { width: 120, height: 80 } },
        { id: 'wait-merge-1', type: 'wait', position: { x: 650, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'end-1', type: 'end', position: { x: 850, y: 300 }, size: { width: 120, height: 80 } }
      ]

      const complexEdges = [
        { id: 'edge-1', source: 'start-1', target: 'audience-split-1' },
        { id: 'edge-2', source: 'audience-split-1', target: 'sms-branch-1' },
        { id: 'edge-3', source: 'audience-split-1', target: 'ai-call-branch-1' },
        { id: 'edge-4', source: 'sms-branch-1', target: 'wait-merge-1' },
        { id: 'edge-5', source: 'ai-call-branch-1', target: 'wait-merge-1' },
        { id: 'edge-6', source: 'wait-merge-1', target: 'end-1' }
      ]

      mockGraph.getNodes.mockReturnValue(branchFlow)
      mockGraph.getEdges.mockReturnValue(complexEdges)
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 80 })

      // 应用统一布局
      const layoutResult = layoutManager.applyUnifiedLayout()
      
      expect(layoutResult).toBe(true)

      // 🎯 修复：验证复杂流程的垂直分层和模块居中对齐
      const positionCalls = mockGraph.setPosition.mock.calls
      const startNodeCall = positionCalls.find(call => call[0] === 'start-1')
      const audienceSplitCall = positionCalls.find(call => call[0] === 'audience-split-1')
      const waitNodeCall = positionCalls.find(call => call[0] === 'wait-merge-1')
      const endNodeCall = positionCalls.find(call => call[0] === 'end-1')
      const smsBranchCall = positionCalls.find(call => call[0] === 'sms-branch-1')
      const aiCallBranchCall = positionCalls.find(call => call[0] === 'ai-call-branch-1')
      
      expect(startNodeCall).toBeDefined()
      expect(audienceSplitCall).toBeDefined()
      expect(waitNodeCall).toBeDefined()
      expect(endNodeCall).toBeDefined()
      expect(smsBranchCall).toBeDefined()
      expect(aiCallBranchCall).toBeDefined()
      
      // 验证垂直分层：start节点在最顶层（层级0）
      expect(startNodeCall[1].y).toBeLessThan(audienceSplitCall[1].y)
      
      // 验证第二层：audience-split节点
      expect(audienceSplitCall[1].y).toBeLessThan(smsBranchCall[1].y)
      expect(audienceSplitCall[1].y).toBeLessThan(aiCallBranchCall[1].y)
      
      // 验证第三层：分支节点sms和ai-call Y坐标一致（同层）
      expect(Math.abs(smsBranchCall[1].y - aiCallBranchCall[1].y)).toBeLessThan(20)
      
      // 验证第四层：wait节点
      expect(waitNodeCall[1].y).toBeGreaterThan(smsBranchCall[1].y)
      expect(waitNodeCall[1].y).toBeGreaterThan(aiCallBranchCall[1].y)
      
      // 验证第五层：end节点在最底层
      expect(endNodeCall[1].y).toBeGreaterThan(waitNodeCall[1].y)
      
      // 验证层级间距（每层间距应大于100px）
      const layer1To2Spacing = audienceSplitCall[1].y - startNodeCall[1].y
      const layer2To3Spacing = smsBranchCall[1].y - audienceSplitCall[1].y
      const layer3To4Spacing = waitNodeCall[1].y - smsBranchCall[1].y
      const layer4To5Spacing = endNodeCall[1].y - waitNodeCall[1].y
      expect(layer1To2Spacing).toBeGreaterThan(100)
      expect(layer2To3Spacing).toBeGreaterThan(100)
      expect(layer3To4Spacing).toBeGreaterThan(100)
      expect(layer4To5Spacing).toBeGreaterThan(100)
      
      // 验证X坐标中心对齐（主干线节点X中心一致）
      const startCenterX = startNodeCall[1].x + 60
      const audienceSplitCenterX = audienceSplitCall[1].x + 60
      const waitCenterX = waitNodeCall[1].x + 60
      const endCenterX = endNodeCall[1].x + 60
      expect(Math.abs(startCenterX - audienceSplitCenterX)).toBeLessThan(20)
      expect(Math.abs(audienceSplitCenterX - waitCenterX)).toBeLessThan(20)
      expect(Math.abs(waitCenterX - endCenterX)).toBeLessThan(20)
      
      // 验证分支节点相对于主干线的居中分布
      const branchCenterY = (smsBranchCall[1].y + aiCallBranchCall[1].y) / 2
      const mainLineY = (audienceSplitCall[1].y + waitNodeCall[1].y) / 2
      expect(Math.abs(branchCenterY - mainLineY)).toBeLessThan(30)
    })

    it('应该正确处理只有开始节点的单节点布局（失败测试）', () => {
      // 准备只有开始节点的测试数据
      const singleStartNode = [
        { id: 'start-only', type: 'start', position: { x: 500, y: 400 }, size: { width: 120, height: 80 } }
      ]

      mockGraph.getNodes.mockReturnValue(singleStartNode)
      mockGraph.getEdges.mockReturnValue([])
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 80 })

      // 应用统一布局
      const layoutResult = layoutManager.applyUnifiedLayout()
      
      expect(layoutResult).toBe(true)

      // 🎯 修复：验证单节点的垂直分层布局
      const positionCalls = mockGraph.setPosition.mock.calls
      const startNodeCall = positionCalls.find(call => call[0] === 'start-only')
      
      expect(startNodeCall).toBeDefined()
      
      // 验证开始节点被放置在顶层（Y坐标应该是最小值）
      // 单节点情况下，开始节点应该在层级0，Y坐标应该是基础起始位置
      expect(startNodeCall[1].y).toBeGreaterThanOrEqual(50) // 最小边距
      expect(startNodeCall[1].y).toBeLessThan(200) // 应该在顶部区域
      
      // 验证X坐标居中（基于画布宽度）
      // 假设画布宽度为800，节点宽度120，居中X坐标应该是340
      const expectedCenterX = 400 - 60 // 画布中心减去节点宽度的一半
      expect(Math.abs(startNodeCall[1].x - expectedCenterX)).toBeLessThan(50)
      
      // 验证节点类型为开始节点（层级0的特征）
      expect(startNodeCall[0]).toBe('start-only')
    })

    it('应该在父子分层中正确识别开始节点为根节点（失败测试）', () => {
      // 准备复杂层级的测试数据
      const hierarchicalNodes = [
        { id: 'start-1', type: 'start', position: { x: 100, y: 100 }, size: { width: 120, height: 80 } },
        { id: 'event-split-1', type: 'event-split', position: { x: 300, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'end-1', type: 'end', position: { x: 500, y: 300 }, size: { width: 120, height: 80 } }
      ]

      const hierarchicalEdges = [
        { id: 'edge-1', source: 'start-1', target: 'event-split-1' },
        { id: 'edge-2', source: 'event-split-1', target: 'end-1' }
      ]

      mockGraph.getNodes.mockReturnValue(hierarchicalNodes)
      mockGraph.getEdges.mockReturnValue(hierarchicalEdges)
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 80 })

      // 应用统一布局
      const layoutResult = layoutManager.applyUnifiedLayout()
      
      expect(layoutResult).toBe(true)

      // 🎯 修复：验证父子分层中开始节点作为根节点的垂直分层
      const positionCalls = mockGraph.setPosition.mock.calls
      const startCall = positionCalls.find(call => call[0] === 'start-1')
      const eventSplitCall = positionCalls.find(call => call[0] === 'event-split-1')
      const endCall = positionCalls.find(call => call[0] === 'end-1')
      
      expect(startCall).toBeDefined()
      expect(eventSplitCall).toBeDefined()
      expect(endCall).toBeDefined()
      
      // 验证开始节点为根节点（层级0），Y坐标最小
      expect(startCall[1].y).toBeLessThan(eventSplitCall[1].y)
      expect(startCall[1].y).toBeLessThan(endCall[1].y)
      
      // 验证严格的垂直分层：start(层级0) -> event-split(层级1) -> end(层级2)
      expect(eventSplitCall[1].y).toBeLessThan(endCall[1].y)
      
      // 验证层级间距的一致性（每层间距应大于100px且相对一致）
      const layer0To1Spacing = eventSplitCall[1].y - startCall[1].y
      const layer1To2Spacing = endCall[1].y - eventSplitCall[1].y
      expect(layer0To1Spacing).toBeGreaterThan(100)
      expect(layer1To2Spacing).toBeGreaterThan(100)
      expect(Math.abs(layer0To1Spacing - layer1To2Spacing)).toBeLessThan(50) // 间距应该相对一致
      
      // 验证X坐标中心对齐（不同层间X中心一致）
      const startCenterX = startCall[1].x + 60
      const eventSplitCenterX = eventSplitCall[1].x + 60
      const endCenterX = endCall[1].x + 60
      expect(Math.abs(startCenterX - eventSplitCenterX)).toBeLessThan(20)
      expect(Math.abs(eventSplitCenterX - endCenterX)).toBeLessThan(20)
      
      // 验证根节点特征：开始节点应该在最顶层且无上游节点
      expect(startCall[1].y).toBeLessThanOrEqual(150) // 应该在顶部区域
    })
  })

  describe('统一布局算法核心功能测试', () => {
    beforeEach(() => {
      layoutManager.switchToUnifiedMode()
    })

    it('应该实现自上而下的层级计算（失败测试）', () => {
      // 准备多层级的测试数据
      const multiLayerNodes = [
        { id: 'start-1', type: 'start', position: { x: 100, y: 100 }, size: { width: 120, height: 80 } },
        { id: 'audience-split-1', type: 'audience-split', position: { x: 300, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'sms-1', type: 'sms', position: { x: 200, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'ai-call-1', type: 'ai-call', position: { x: 400, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'wait-1', type: 'wait', position: { x: 300, y: 400 }, size: { width: 120, height: 80 } },
        { id: 'end-1', type: 'end', position: { x: 300, y: 500 }, size: { width: 120, height: 80 } }
      ]

      const multiLayerEdges = [
        { id: 'edge-1', source: 'start-1', target: 'audience-split-1' },
        { id: 'edge-2', source: 'audience-split-1', target: 'sms-1' },
        { id: 'edge-3', source: 'audience-split-1', target: 'ai-call-1' },
        { id: 'edge-4', source: 'sms-1', target: 'wait-1' },
        { id: 'edge-5', source: 'ai-call-1', target: 'wait-1' },
        { id: 'edge-6', source: 'wait-1', target: 'end-1' }
      ]

      mockGraph.getNodes.mockReturnValue(multiLayerNodes)
      mockGraph.getEdges.mockReturnValue(multiLayerEdges)
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 80 })

      // 应用统一布局
      const layoutResult = layoutManager.applyUnifiedLayout()
      
      expect(layoutResult).toBe(true)

      // 🎯 修复：验证自上而下的垂直层级计算
      const positionCalls = mockGraph.setPosition.mock.calls
      const startCall = positionCalls.find(call => call[0] === 'start-1')
      const audienceSplitCall = positionCalls.find(call => call[0] === 'audience-split-1')
      const smsCall = positionCalls.find(call => call[0] === 'sms-1')
      const aiCallCall = positionCalls.find(call => call[0] === 'ai-call-1')
      const waitCall = positionCalls.find(call => call[0] === 'wait-1')
      const endCall = positionCalls.find(call => call[0] === 'end-1')
      
      // 验证严格的垂直分层：每个节点的层级为其上游节点层级最大值+1
      // 层级0：start
      // 层级1：audience-split
      // 层级2：sms, ai-call（分支节点）
      // 层级3：wait（汇聚节点）
      // 层级4：end
      
      expect(startCall[1].y).toBeLessThan(audienceSplitCall[1].y) // 层级0 -> 层级1
      expect(audienceSplitCall[1].y).toBeLessThan(smsCall[1].y) // 层级1 -> 层级2
      expect(audienceSplitCall[1].y).toBeLessThan(aiCallCall[1].y) // 层级1 -> 层级2
      expect(smsCall[1].y).toBeLessThan(waitCall[1].y) // 层级2 -> 层级3
      expect(aiCallCall[1].y).toBeLessThan(waitCall[1].y) // 层级2 -> 层级3
      expect(waitCall[1].y).toBeLessThan(endCall[1].y) // 层级3 -> 层级4
      
      // 验证同层节点Y坐标一致（sms和ai-call应该在同一层）
      expect(Math.abs(smsCall[1].y - aiCallCall[1].y)).toBeLessThan(20)
      
      // 验证垂直层级间距的一致性（每层间距应大于100px）
      const layer0To1 = audienceSplitCall[1].y - startCall[1].y
      const layer1To2 = smsCall[1].y - audienceSplitCall[1].y
      const layer2To3 = waitCall[1].y - smsCall[1].y
      const layer3To4 = endCall[1].y - waitCall[1].y
      
      expect(layer0To1).toBeGreaterThan(100)
      expect(layer1To2).toBeGreaterThan(100)
      expect(layer2To3).toBeGreaterThan(100)
      expect(layer3To4).toBeGreaterThan(100)
      
      // 验证X坐标中心对齐（主干线节点X中心一致）
      const startCenterX = startCall[1].x + 60
      const audienceSplitCenterX = audienceSplitCall[1].x + 60
      const waitCenterX = waitCall[1].x + 60
      const endCenterX = endCall[1].x + 60
      expect(Math.abs(startCenterX - audienceSplitCenterX)).toBeLessThan(20)
      expect(Math.abs(audienceSplitCenterX - waitCenterX)).toBeLessThan(20)
      expect(Math.abs(waitCenterX - endCenterX)).toBeLessThan(20)
      
      // 验证分支节点相对于主干线的居中分布
      const branchCenterY = (smsCall[1].y + aiCallCall[1].y) / 2
      const mainLineY = (audienceSplitCall[1].y + waitCall[1].y) / 2
      expect(Math.abs(branchCenterY - mainLineY)).toBeLessThan(30)
    })

    it('应该实现模块化的居中对齐算法（失败测试）', () => {
      // 准备复杂的分支流程测试数据
      const complexBranchFlow = [
        { id: 'start-1', type: 'start', position: { x: 300, y: 100 }, size: { width: 120, height: 80 } },
        { id: 'audience-split-1', type: 'audience-split', position: { x: 300, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'sms-1', type: 'sms', position: { x: 200, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'ai-call-1', type: 'ai-call', position: { x: 400, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'end-1', type: 'end', position: { x: 300, y: 400 }, size: { width: 120, height: 80 } }
      ]

      const complexBranchEdges = [
        { id: 'edge-1', source: 'start-1', target: 'audience-split-1' },
        { id: 'edge-2', source: 'audience-split-1', target: 'sms-1' },
        { id: 'edge-3', source: 'audience-split-1', target: 'ai-call-1' },
        { id: 'edge-4', source: 'sms-1', target: 'end-1' },
        { id: 'edge-5', source: 'ai-call-1', target: 'end-1' }
      ]

      mockGraph.getNodes.mockReturnValue(complexBranchFlow)
      mockGraph.getEdges.mockReturnValue(complexBranchEdges)
      mockGraph.getBBox.mockReturnValue({ width: 120, height: 80 })

      // 应用统一布局
      const layoutResult = layoutManager.applyUnifiedLayout()
      
      expect(layoutResult).toBe(true)

      // 🎯 修复：验证模块化的垂直分层和居中对齐算法
      const positionCalls = mockGraph.setPosition.mock.calls
      const startCall = positionCalls.find(call => call[0] === 'start-1')
      const audienceSplitCall = positionCalls.find(call => call[0] === 'audience-split-1')
      const smsCall = positionCalls.find(call => call[0] === 'sms-1')
      const aiCallCall = positionCalls.find(call => call[0] === 'ai-call-1')
      const endCall = positionCalls.find(call => call[0] === 'end-1')
      
      // 验证严格的垂直分层：每个节点的层级为其上游节点层级最大值+1
      // 层级0：start
      // 层级1：audience-split
      // 层级2：sms, ai-call（分支节点）
      // 层级3：end（汇聚节点）
      
      expect(startCall[1].y).toBeLessThan(audienceSplitCall[1].y) // 层级0 -> 层级1
      expect(audienceSplitCall[1].y).toBeLessThan(smsCall[1].y) // 层级1 -> 层级2
      expect(audienceSplitCall[1].y).toBeLessThan(aiCallCall[1].y) // 层级1 -> 层级2
      expect(smsCall[1].y).toBeLessThan(endCall[1].y) // 层级2 -> 层级3
      expect(aiCallCall[1].y).toBeLessThan(endCall[1].y) // 层级2 -> 层级3
      
      // 验证同层节点Y坐标一致（sms和ai-call应该在同一层）
      expect(Math.abs(smsCall[1].y - aiCallCall[1].y)).toBeLessThan(20)
      
      // 验证垂直层级间距（每层间距应大于100px）
      const layer0To1 = audienceSplitCall[1].y - startCall[1].y
      const layer1To2 = smsCall[1].y - audienceSplitCall[1].y
      const layer2To3 = endCall[1].y - smsCall[1].y
      
      expect(layer0To1).toBeGreaterThan(100)
      expect(layer1To2).toBeGreaterThan(100)
      expect(layer2To3).toBeGreaterThan(100)
      
      // 验证主干线节点的X中心对齐（不同层间X中心一致）
      const startCenterX = startCall[1].x + 60
      const audienceSplitCenterX = audienceSplitCall[1].x + 60
      const endCenterX = endCall[1].x + 60
      expect(Math.abs(startCenterX - audienceSplitCenterX)).toBeLessThan(20)
      expect(Math.abs(audienceSplitCenterX - endCenterX)).toBeLessThan(20)
      
      // 验证分支节点的模块化居中对齐
      // 分支节点（sms, ai-call）应该相对于父节点（audience-split）和子节点（end）居中分布
      const branchCenterX = (smsCall[1].x + aiCallCall[1].x) / 2
      const parentCenterX = audienceSplitCall[1].x + 60
      const childCenterX = endCall[1].x + 60
      
      // 分支中心应该与父子节点中心对齐
      expect(Math.abs(branchCenterX - parentCenterX)).toBeLessThan(30)
      expect(Math.abs(branchCenterX - childCenterX)).toBeLessThan(30)
      
      // 验证分支节点的对称分布（相对于中心线）
      const leftBranchDistance = Math.abs(smsCall[1].x - parentCenterX)
      const rightBranchDistance = Math.abs(aiCallCall[1].x - parentCenterX)
      expect(Math.abs(leftBranchDistance - rightBranchDistance)).toBeLessThan(50)
    })
  })
})