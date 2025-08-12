/**
 * 人群分流节点预览线生成综合测试
 * 验证从节点创建到预览线生成的完整流程
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { UnifiedPreviewLineManager } from '../utils/UnifiedPreviewLineManager.js'

describe('人群分流节点预览线生成综合测试', () => {
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
    previewManager = new UnifiedPreviewLineManager(mockGraph)

    // 创建模拟节点
    mockNode = {
      id: 'node_1754471167446',
      getData: vi.fn(),
      setData: vi.fn(),
      trigger: vi.fn()
    }
  })

  test('场景1：新创建的人群分流节点（isConfigured为undefined）', () => {
    // 模拟新创建的节点，isConfigured为undefined但有配置数据
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '白名单', crowdId: 'crowd1' },
          { id: 'branch2', crowdName: '黑名单', crowdId: 'crowd2' },
          { id: 'branch3', crowdName: '其他', crowdId: 'crowd3' }
        ]
      },
      isConfigured: undefined, // 关键：新创建的节点isConfigured为undefined
      lastUpdated: Date.now()
    }

    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：应该自动修复isConfigured并创建预览线
    expect(shouldCreate).toBe(true)
    expect(mockNode.setData).toHaveBeenCalledWith({
      ...nodeData,
      isConfigured: true
    })
  })

  test('场景2：从保存数据恢复的人群分流节点（已配置）', () => {
    // 模拟从保存数据恢复的节点，已正确配置
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '白名单', crowdId: 'crowd1' },
          { id: 'branch2', crowdName: '黑名单', crowdId: 'crowd2' }
        ]
      },
      isConfigured: true,
      lastUpdated: Date.now()
    }

    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：应该直接创建预览线，无需修复
    expect(shouldCreate).toBe(true)
    expect(mockNode.setData).not.toHaveBeenCalled()
  })

  test('场景3：未配置的人群分流节点', () => {
    // 模拟未配置的节点
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流',
      config: {}, // 空配置
      isConfigured: false
    }

    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：不应该创建预览线
    expect(shouldCreate).toBe(false)
    expect(mockNode.setData).not.toHaveBeenCalled()
  })

  test('场景4：人群分流节点已有部分连接', () => {
    // 模拟已有部分连接的节点
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '白名单', crowdId: 'crowd1' },
          { id: 'branch2', crowdName: '黑名单', crowdId: 'crowd2' },
          { id: 'branch3', crowdName: '其他', crowdId: 'crowd3' }
        ]
      },
      isConfigured: true
    }

    // 模拟已有一个真实连接
    const mockEdge = {
      id: 'edge-1',
      getData: () => ({
        type: 'normal',
        branchId: 'branch1'
      }),
      getTargetCellId: () => 'target-node-1'
    }

    mockNode.getData.mockReturnValue(nodeData)
    mockGraph.getOutgoingEdges.mockReturnValue([mockEdge])

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：仍有未连接的分支，应该创建预览线
    expect(shouldCreate).toBe(true)
  })

  test('场景5：人群分流节点所有分支已连接', () => {
    // 模拟所有分支都已连接的节点
    const nodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '白名单', crowdId: 'crowd1' },
          { id: 'branch2', crowdName: '黑名单', crowdId: 'crowd2' }
        ]
      },
      isConfigured: true
    }

    // 模拟所有分支都有连接
    const mockEdges = [
      {
        id: 'edge-1',
        getData: () => ({
          type: 'normal',
          branchId: 'branch1'
        }),
        getTargetCellId: () => 'target-node-1'
      },
      {
        id: 'edge-2',
        getData: () => ({
          type: 'normal',
          branchId: 'branch2'
        }),
        getTargetCellId: () => 'target-node-2'
      }
    ]

    mockNode.getData.mockReturnValue(nodeData)
    mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：所有分支已连接，不应该创建预览线
    expect(shouldCreate).toBe(false)
  })

  test('场景6：修复逻辑的完整性验证', () => {
    // 模拟复杂的节点数据结构
    const originalNodeData = {
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流',
      config: {
        crowdLayers: [
          { id: 'branch1', crowdName: '白名单', crowdId: 'crowd1' },
          { id: 'branch2', crowdName: '黑名单', crowdId: 'crowd2' }
        ],
        nodeName: '自定义人群分流',
        description: '测试描述'
      },
      isConfigured: undefined, // 需要修复
      lastUpdated: 1754531161917,
      level: 2,
      levelIndex: 0,
      customField: 'test-value'
    }

    mockNode.getData.mockReturnValue(originalNodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：应该修复并保留所有原有字段
    expect(shouldCreate).toBe(true)
    expect(mockNode.setData).toHaveBeenCalledWith({
      ...originalNodeData,
      isConfigured: true
    })

    // 验证：修复后的数据完整性
    const setDataCall = mockNode.setData.mock.calls[0][0]
    expect(setDataCall.type).toBe('audience-split')
    expect(setDataCall.config.crowdLayers).toHaveLength(2)
    expect(setDataCall.config.nodeName).toBe('自定义人群分流')
    expect(setDataCall.lastUpdated).toBe(1754531161917)
    expect(setDataCall.customField).toBe('test-value')
    expect(setDataCall.isConfigured).toBe(true)
  })

  test('场景7：日志中的实际问题重现', () => {
    // 重现用户日志中的实际问题
    const nodeData = {
      config: {
        crowdLayers: [
          { id: '17543800804178fx652f1n', crowdName: '黑名单' },
          { id: '17543800804178fx652f2n', crowdName: '白名单' },
          { id: '17543800804178fx652f3n', crowdName: '其他' }
        ]
      },
      lastUpdated: 1754531161917,
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '人群分流',
      // 关键：isConfigured字段缺失（undefined）
    }

    mockNode.id = 'node_1754471167446' // 使用日志中的实际节点ID
    mockNode.getData.mockReturnValue(nodeData)

    // 执行：检查是否应该创建预览线
    const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)

    // 验证：应该自动修复并创建预览线
    expect(shouldCreate).toBe(true)
    expect(mockNode.setData).toHaveBeenCalledWith({
      ...nodeData,
      isConfigured: true
    })
  })
})