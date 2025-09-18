/**
 * 预览线状态锁定机制测试
 * 测试布局引擎与预览线管理器的协调机制
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnifiedStructuredLayoutEngine } from '../../utils/UnifiedStructuredLayoutEngine.js';
import UnifiedPreviewLineManager from '../../utils/UnifiedPreviewLineManager.js';

describe('预览线状态锁定机制测试', () => {
  let layoutEngine
  let previewLineManager
  let mockGraph

  beforeEach(() => {
    // 创建 Mock Graph
    mockGraph = {
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getOutgoingEdges: vi.fn(() => []),
      setPosition: vi.fn(),
      getBBox: vi.fn(() => ({ width: 120, height: 80 })),
      updateNode: vi.fn(),
      hasCell: vi.fn(() => true),
      addEdge: vi.fn().mockImplementation((edge) => {
        // 模拟添加边的行为
        const mockEdge = {
          id: edge.id || `edge_${Date.now()}`,
          ...edge
        }
        return mockEdge
      }),
      getCellById: vi.fn().mockReturnValue(null),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      removeEdge: vi.fn()
    }

    // 创建布局引擎实例
    layoutEngine = new UnifiedStructuredLayoutEngine(mockGraph, {
      canvas: { width: 800, height: 600 }
    })

    // 创建预览线管理器实例
    previewLineManager = new UnifiedPreviewLineManager(mockGraph, null, {}, layoutEngine)
  })

  afterEach(() => {
    vi.clearAllMocks()
    // 确保测试后解锁
    if (layoutEngine && layoutEngine.unlockPreviewLineRefresh) {
      layoutEngine.unlockPreviewLineRefresh('测试完成')
    }
  })

  describe('锁定机制基础功能', () => {
    it('应该能够正确锁定和解锁预览线刷新', () => {
      // 初始状态应该是未锁定
      expect(layoutEngine.isPreviewLineRefreshLocked()).toBe(false)

      // 锁定预览线刷新
      layoutEngine.lockPreviewLineRefresh('测试锁定')
      expect(layoutEngine.isPreviewLineRefreshLocked()).toBe(true)

      // 获取锁定状态
      const lockStatus = layoutEngine.getPreviewLineLockStatus()
      expect(lockStatus.locked).toBe(true)
      expect(lockStatus.reason).toBe('测试锁定')
      expect(lockStatus.startTime).toBeGreaterThan(0)

      // 解锁预览线刷新
      layoutEngine.unlockPreviewLineRefresh('测试解锁')
      expect(layoutEngine.isPreviewLineRefreshLocked()).toBe(false)
    })

    it('应该支持锁定超时自动解锁', async () => {
      // 设置较短的超时时间用于测试
      layoutEngine.LOCK_TIMEOUT = 100

      // 锁定预览线刷新
      layoutEngine.lockPreviewLineRefresh('超时测试')
      expect(layoutEngine.isPreviewLineRefreshLocked()).toBe(true)

      // 等待超时
      await new Promise(resolve => setTimeout(resolve, 150))

      // 应该自动解锁
      expect(layoutEngine.isPreviewLineRefreshLocked()).toBe(false)
    })
  })

  describe('预览线管理器锁定检查', () => {
    it('forceRefreshPreviewLine 应该检查锁定状态', async () => {
      // 创建一个测试预览线
      const previewLineId = 'test-preview-line'
      previewLineManager.previewLines.set(previewLineId, {
        id: previewLineId,
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        position: { x: 100, y: 100 }
      })

      // 锁定预览线刷新
      layoutEngine.lockPreviewLineRefresh('测试锁定')

      // 尝试强制刷新预览线
      const result = await previewLineManager.forceRefreshPreviewLine(previewLineId)

      // 应该被阻止
      expect(result).toBe(false)
    })

    it('updatePreviewLinePosition 应该检查锁定状态', async () => {
      // 锁定预览线刷新
      layoutEngine.lockPreviewLineRefresh('测试锁定')

      // 尝试更新预览线位置
      const result = await previewLineManager.updatePreviewLinePosition(
        'test-id',
        { x: 200, y: 200 }
      )

      // 应该被阻止
      expect(result).toBe(false)
    })

    it('batchUpdatePreviewLines 应该检查锁定状态', async () => {
      // 锁定预览线刷新
      layoutEngine.lockPreviewLineRefresh('测试锁定')

      // 尝试批量更新预览线
      const updates = [
        { id: 'line1', position: { x: 100, y: 100 } },
        { id: 'line2', position: { x: 200, y: 200 } }
      ]

      const result = await previewLineManager.batchUpdatePreviewLines(updates)

      // 应该被阻止
      expect(result.successful).toBe(0)
      expect(result.failed).toBe(2)
      expect(result.errors).toHaveLength(2)
    })
  })

  describe('布局执行期间的锁定行为', () => {
    it('executeLayoutImmediate 应该在执行期间锁定预览线刷新', async () => {
      // 模拟简单的节点结构
      const mockNodes = [
        {
          id: 'start',
          getId: () => 'start',
          getData: () => ({ type: 'start' }),
          getPosition: () => ({ x: 100, y: 100 }),
          getSize: () => ({ width: 120, height: 80 })
        }
      ]

      mockGraph.getNodes.mockReturnValue(mockNodes)
      mockGraph.getEdges.mockReturnValue([])

      // 监听锁定状态变化
      let lockStateChanges = []
      const originalLock = layoutEngine.lockPreviewLineRefresh.bind(layoutEngine)
      const originalUnlock = layoutEngine.unlockPreviewLineRefresh.bind(layoutEngine)

      layoutEngine.lockPreviewLineRefresh = (reason) => {
        lockStateChanges.push({ action: 'lock', reason })
        return originalLock(reason)
      }

      layoutEngine.unlockPreviewLineRefresh = (reason) => {
        lockStateChanges.push({ action: 'unlock', reason })
        return originalUnlock(reason)
      }

      // 执行布局
      await layoutEngine.executeLayoutImmediate()

      // 验证锁定和解锁都被调用
      expect(lockStateChanges).toContainEqual({ action: 'lock', reason: '布局计算中' })
      expect(lockStateChanges.some(change => 
        change.action === 'unlock' && 
        (change.reason === '布局计算完成' || change.reason === '布局计算失败')
      )).toBe(true)

      // 最终状态应该是解锁的
      expect(layoutEngine.isPreviewLineRefreshLocked()).toBe(false)
    })
  })

  describe('错误处理和边界情况', () => {
    it('应该处理预览线管理器没有布局引擎引用的情况', () => {
      // 创建没有布局引擎引用的预览线管理器
      const managerWithoutEngine = new UnifiedPreviewLineManager(mockGraph, null, {}, null)

      // 这些操作应该正常执行，不会因为缺少布局引擎引用而报错
      expect(async () => {
        await managerWithoutEngine.updatePreviewLinePosition('test', { x: 100, y: 100 })
      }).not.toThrow()
    })

    it('应该处理重复锁定和解锁', () => {
      // 重复锁定
      layoutEngine.lockPreviewLineRefresh('第一次锁定')
      layoutEngine.lockPreviewLineRefresh('第二次锁定')
      expect(layoutEngine.isPreviewLineRefreshLocked()).toBe(true)

      // 重复解锁
      layoutEngine.unlockPreviewLineRefresh('第一次解锁')
      layoutEngine.unlockPreviewLineRefresh('第二次解锁')
      expect(layoutEngine.isPreviewLineRefreshLocked()).toBe(false)
    })
  })

  // 新增：useConfigDrawers预览线管理器实例测试
  describe('useConfigDrawers预览线管理器实例测试', () => {
    it('应该正确初始化统一预览线管理器实例', () => {
      // 验证预览线管理器实例不为null
      expect(previewLineManager).not.toBeNull()
      expect(previewLineManager).toBeDefined()
      
      // 验证管理器类型
      expect(previewLineManager.constructor.name).toBe('UnifiedPreviewLineManager')
      
      // 验证实例具有必要的方法
      expect(typeof previewLineManager.createPreviewLine).toBe('function')
      expect(typeof previewLineManager.updatePreviewLinePosition).toBe('function')
      expect(typeof previewLineManager.removePreviewLine).toBe('function')
    })

    it('应该正确处理预览线管理器方法调用', () => {
      // 测试创建预览线
      const mockSourceNode = { id: 'source-1', x: 100, y: 100 }
      const mockTargetNode = { id: 'target-1', x: 200, y: 200 }
      
      const previewLineId = previewLineManager.createPreviewLine(
        mockSourceNode,
        mockTargetNode,
        'connection'
      )
      
      expect(previewLineId).toBeDefined()
      expect(typeof previewLineId).toBe('string')
      
      // 测试更新预览线位置
      // 创建一个模拟节点对象
      const mockNode = {
        id: 'source-1',
        getPosition: () => ({ x: 150, y: 150 }),
        getSize: () => ({ width: 120, height: 80 }),
        getPort: () => ({ position: { x: 60, y: 80 } }),
        getData: () => ({ type: 'start', nodeType: 'start' }),
        setData: vi.fn(),
        setPortProp: vi.fn(),
        updatePorts: vi.fn()
      }
      
      const updateResult = previewLineManager.updatePreviewLinePosition(mockNode)
      
      expect(updateResult).toBe(true)
      
      // 测试移除预览线 (使用创建预览线时的源节点ID)
      // 首先确保预览线管理器中有这个节点的预览线实例
      const sourceNodeId = mockNode.id
      const removeResult = previewLineManager.removePreviewLine(sourceNodeId)
      expect(removeResult).toBe(true)
    })

    it('应该正确处理预览线管理器状态查询', () => {
      // 验证可用方法列表
      const availableMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(previewLineManager))
        .filter(method => typeof previewLineManager[method] === 'function')
      
      expect(availableMethods).toContain('createPreviewLine')
      expect(availableMethods).toContain('updatePreviewLinePosition')
      expect(availableMethods).toContain('removePreviewLine')
      expect(availableMethods).toContain('forceRefreshPreviewLine')
      expect(availableMethods).toContain('batchUpdatePreviewLines')
      
      // 验证管理器状态
      expect(previewLineManager.isInitialized).toBe(true)
      expect(previewLineManager.getActivePreviewLinesCount()).toBeGreaterThanOrEqual(0)
    })

    it('应该正确处理预览线管理器错误情况', async () => {
      // 测试无效参数处理 - 应该抛出错误
      expect(() => {
        previewLineManager.createPreviewLine(null, null, 'connection')
      }).toThrow('节点ID和元素不能为空')
      
      // 测试不存在的预览线ID - 异步方法需要await
      const invalidId = 'non-existent-id'
      const updateResult = await previewLineManager.updatePreviewLinePosition(invalidId, {x: 0, y: 0}, {x: 100, y: 100})
      expect(updateResult).toBe(false)
      
      const removeResult = await previewLineManager.removePreviewLine(invalidId)
      expect(removeResult).toBe(false)
    })
  })
})