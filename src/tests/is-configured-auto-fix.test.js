/**
 * 测试isConfigured字段的自动修复逻辑
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import UnifiedPreviewLineManager from '../utils/UnifiedPreviewLineManager.js'

describe('isConfigured字段自动修复测试', () => {
  let previewManager
  let mockGraph
  let mockNode

  beforeEach(() => {
    // 创建模拟图形对象
    mockGraph = {
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getConnectedEdges: vi.fn().mockReturnValue([]),
      getCellById: vi.fn(),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建预览线管理器实例
    previewManager = new UnifiedPreviewLineManager(
      mockGraph,  // graph
      null,      // branchManager
      {},        // layoutConfig
      null       // layoutEngine
    )

    // 创建模拟节点
    mockNode = {
      id: 'test-node-1',
      getData: vi.fn(),
      setData: vi.fn(),
      trigger: vi.fn()
    }
  })

  test('isConfigured为undefined且有配置数据时应自动修复', () => {
    // 设置：节点有配置数据但isConfigured为undefined
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '分支1' },
          { id: 'branch2', crowdName: '分支2' }
        ]
      },
      isConfigured: undefined // 关键：isConfigured为undefined
    }

    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：应该自动修复isConfigured并返回true
    expect(shouldCreate).toBe(true)
    expect(mockNode.setData).toHaveBeenCalledWith({
      ...nodeData,
      isConfigured: true
    })
  })

  test('开始节点isConfigured为undefined时应自动修复', () => {
    // 设置：开始节点isConfigured为undefined
    const nodeData = {
      type: 'start',
      nodeType: 'start',
      config: {},
      isConfigured: undefined
    }

    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：应该自动修复isConfigured并返回true
    expect(shouldCreate).toBe(true)
    expect(mockNode.setData).toHaveBeenCalledWith({
      ...nodeData,
      isConfigured: true
    })
  })

  test('isConfigured为undefined且无配置数据时不应修复', () => {
    // 设置：节点无配置数据且isConfigured为undefined
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      config: {}, // 空配置
      isConfigured: undefined
    }

    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：不应该修复isConfigured，返回false
    expect(shouldCreate).toBe(false)
    expect(mockNode.setData).not.toHaveBeenCalled()
  })

  test('isConfigured为false时不应修复', () => {
    // 设置：节点明确标记为未配置
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '分支1' }
        ]
      },
      isConfigured: false // 明确标记为未配置
    }

    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：不应该修复isConfigured，返回false
    expect(shouldCreate).toBe(false)
    expect(mockNode.setData).not.toHaveBeenCalled()
  })

  test('isConfigured为true时正常处理', () => {
    // 设置：节点已正确配置
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '分支1' },
          { id: 'branch2', crowdName: '分支2' }
        ]
      },
      isConfigured: true
    }

    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：不需要修复，直接返回true
    expect(shouldCreate).toBe(true)
    expect(mockNode.setData).not.toHaveBeenCalled()
  })

  test('修复后的节点数据应包含正确的isConfigured值', () => {
    // 设置：节点有配置数据但isConfigured为undefined
    const originalNodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '分支1' }
        ]
      },
      isConfigured: undefined,
      someOtherField: 'test-value'
    }

    mockNode.getData.mockReturnValue(originalNodeData)

    // 执行：检查是否应该创建预览线
    previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：修复后的数据应保留所有原有字段，只更新isConfigured
    expect(mockNode.setData).toHaveBeenCalledWith({
      type: 'audience-split',
      nodeType: 'audience-split',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '分支1' }
        ]
      },
      isConfigured: true,
      someOtherField: 'test-value'
    })
  })
})