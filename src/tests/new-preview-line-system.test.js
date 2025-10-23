/**
 * 新预览线系统测试 - 使用重构后的PreviewLineSystem
 * 测试audience-split节点的预览线创建逻辑
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../utils/preview-line/PreviewLineSystem.js'
import { PreviewLineManager } from '../utils/preview-line/core/PreviewLineManager.js'
import { PreviewLineValidator } from '../utils/preview-line/core/PreviewLineValidator.js'

describe('新预览线系统：audience-split节点预览线修复验证', () => {
  let previewLineSystem
  let previewLineManager
  let previewLineValidator
  let branchAnalyzer
  let mockGraph
  let mockLayoutEngine
  
  // 创建模拟节点的辅助函数
  function createMockNode(id, type, config = {}) {
    return {
      id: id,
      getData: () => ({
        type: type,
        nodeType: type,
        config: config,
        ...config
      }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 })
    }
  }
  
  // 创建模拟连接的辅助函数
  function createMockEdge(id, sourceId, targetId, sourcePort = null, targetPort = null) {
    return {
      id: id,
      getSourceCellId: () => sourceId,
      getTargetCellId: () => targetId,
      getSourcePortId: () => sourcePort,
      getTargetPortId: () => targetPort
    }
  }
  
  beforeEach(async () => {
    // 创建模拟的图形引擎
    mockGraph = {
      getCells: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getNodes: vi.fn(() => []),
      getCellById: vi.fn(),
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => []),
      addEdge: vi.fn(),
      hasCell: vi.fn(() => false),
      removeCell: vi.fn()
    }
    
    // 创建模拟的布局引擎
    mockLayoutEngine = {
      getNodePosition: vi.fn(() => ({ x: 100, y: 100 })),
      getNodeSize: vi.fn(() => ({ width: 120, height: 60 }))
    }
    
    // 初始化预览线系统
    previewLineSystem = new PreviewLineSystem({ graph: mockGraph })
    await previewLineSystem.init()
    
    // 初始化预览线管理器和验证器
    previewLineManager = new PreviewLineManager({
      graph: mockGraph,
      layoutEngine: mockLayoutEngine,
      previewLineSystem: previewLineSystem
    })
    
    // 创建mock配置管理器
    const mockConfigManager = {
      get: vi.fn().mockReturnValue(false)
    }
    
    previewLineValidator = new PreviewLineValidator(mockConfigManager)
    
    // 模拟分支分析器
    branchAnalyzer = {
      getNodeBranches: vi.fn(),
      clearCache: vi.fn()
    }
    
    // 将分支分析器附加到系统
    previewLineSystem.branchAnalyzer = branchAnalyzer
  })
  
  describe('分支分析器测试', () => {
    it('应该正确分析已配置的audience-split节点分支', () => {
      // 创建已配置的audience-split节点
      const configuredNode = createMockNode('node_configured', 'audience-split', {
        isConfigured: true,
        crowdLayers: [
          { id: 'crowd_1', crowdName: '高价值用户', crowdId: 'crowd_001' },
          { id: 'crowd_2', crowdName: '普通用户', crowdId: 'crowd_002' },
          { id: 'crowd_3', crowdName: '新用户', crowdId: 'crowd_003' }
        ],
        unmatchBranch: {
          id: 'unmatch_default',
          crowdName: '未命中人群',
          crowdId: null
        }
      })
      
      // 模拟分支分析器返回的分支信息
      const expectedBranches = [
        { id: 'crowd_1', label: '高价值用户', type: 'audience' },
        { id: 'crowd_2', label: '普通用户', type: 'audience' },
        { id: 'crowd_3', label: '新用户', type: 'audience' },
        { id: 'unmatch_default', label: '未命中人群', type: 'audience', isDefault: true }
      ]
      
      branchAnalyzer.getNodeBranches.mockReturnValue(expectedBranches)
      
      // 获取分支信息
      const branches = branchAnalyzer.getNodeBranches(configuredNode)
      
      // 验证分支数量和内容
      expect(branches).toHaveLength(4) // 3个人群 + 1个未命中分支
      expect(branches[0]).toMatchObject({
        id: 'crowd_1',
        label: '高价值用户',
        type: 'audience'
      })
      expect(branches[1]).toMatchObject({
        id: 'crowd_2',
        label: '普通用户',
        type: 'audience'
      })
      expect(branches[2]).toMatchObject({
        id: 'crowd_3',
        label: '新用户',
        type: 'audience'
      })
      expect(branches[3]).toMatchObject({
        id: 'unmatch_default',
        label: '未命中人群',
        type: 'audience',
        isDefault: true
      })
    })
    
    it('应该正确处理未配置的audience-split节点', () => {
      // 创建未配置的audience-split节点
      const unconfiguredNode = createMockNode('node_unconfigured', 'audience-split', {
        isConfigured: false
      })
      
      // 模拟未配置节点返回空分支
      branchAnalyzer.getNodeBranches.mockReturnValue([])
      
      // 获取分支信息
      const branches = branchAnalyzer.getNodeBranches(unconfiguredNode)
      
      // 验证未配置节点不生成分支
      expect(branches).toHaveLength(0)
    })
    
    it('应该正确处理部分连接的audience-split节点', () => {
      // 创建有3个分支但只连接了2个的节点
      const partiallyConnectedNode = createMockNode('node_partial', 'audience-split', {
        isConfigured: true,
        crowdLayers: [
          { id: 'crowd_1', crowdName: '高价值用户', crowdId: 'crowd_001' },
          { id: 'crowd_2', crowdName: '普通用户', crowdId: 'crowd_002' },
          { id: 'crowd_3', crowdName: '新用户', crowdId: 'crowd_003' }
        ]
      })
      
      // 模拟只有2个连接
      const existingEdges = [
        createMockEdge('edge_1', 'node_partial', 'target_1', 'crowd_1'),
        createMockEdge('edge_2', 'node_partial', 'target_2', 'crowd_2')
        // crowd_3 没有连接
      ]
      
      mockGraph.getOutgoingEdges.mockReturnValue(existingEdges)
      
      // 模拟分支分析器返回所有分支
      const expectedBranches = [
        { id: 'crowd_1', label: '高价值用户', type: 'audience' },
        { id: 'crowd_2', label: '普通用户', type: 'audience' },
        { id: 'crowd_3', label: '新用户', type: 'audience' }
      ]
      
      branchAnalyzer.getNodeBranches.mockReturnValue(expectedBranches)
      
      // 获取分支信息
      const branches = branchAnalyzer.getNodeBranches(partiallyConnectedNode)
      
      // 验证分支数量
      expect(branches).toHaveLength(3)
      
      // 验证第三个分支（未连接的分支）
      expect(branches[2]).toMatchObject({
        id: 'crowd_3',
        label: '新用户',
        type: 'audience'
      })
    })
  })
  
  describe('预览线创建逻辑测试', () => {
    it('用户场景：期望3条预览线，实际2条的问题修复', async () => {
      // 模拟用户日志中的场景
      const problemNode = createMockNode('node_1756881179035', 'audience-split', {
        isConfigured: true,
        label: '人群分流节点',
        color: '#4A90E2',
        shape: 'rect',
        width: 120,
        height: 60,
        maxOutputs: 4,
        autoExpand: true,
        nextSlots: 4,
        type: 'audience-split',
        crowdLayers: [
          { id: 'crowd_1', crowdName: '高价值用户', crowdId: 'crowd_001' },
          { id: 'crowd_2', crowdName: '普通用户', crowdId: 'crowd_002' },
          { id: 'crowd_3', crowdName: '新用户', crowdId: 'crowd_003' }
        ],
        unmatchBranch: {
          id: 'unmatch_default',
          crowdName: '未命中人群',
          crowdId: null
        },
        nodeType: 'audience-split',
        branches: [], // 初始为空，应该由系统生成
        branchCount: 0,
        audiences: []
      })
      
      // 模拟只有2个现有连接（期望4条，实际2条）
      const existingEdges = [
        createMockEdge('edge_1', 'node_1756881179035', 'target_1', 'crowd_1'),
        createMockEdge('edge_2', 'node_1756881179035', 'target_2', 'crowd_2')
        // crowd_3 和 unmatch_default 没有连接
      ]
      
      mockGraph.getOutgoingEdges.mockReturnValue(existingEdges)
      
      // 模拟分支分析器返回所有分支
      const expectedBranches = [
        { id: 'crowd_1', label: '高价值用户', type: 'audience' },
        { id: 'crowd_2', label: '普通用户', type: 'audience' },
        { id: 'crowd_3', label: '新用户', type: 'audience' },
        { id: 'unmatch_default', label: '未命中人群', type: 'audience', isDefault: true }
      ]
      
      branchAnalyzer.getNodeBranches.mockReturnValue(expectedBranches)
      
      // 清理缓存，强制重新生成分支
      branchAnalyzer.clearCache()
      
      // 获取分支信息
      const branches = branchAnalyzer.getNodeBranches(problemNode)
      
      // 验证分支生成正确
      expect(branches).toHaveLength(4) // 3个人群 + 1个未命中分支
      
      // 计算未连接的分支数量
      const connectedBranchIds = existingEdges.map(edge => edge.getSourcePortId())
      const unconnectedBranches = branches.filter(branch => !connectedBranchIds.includes(branch.id))
      
      // 验证有2个未连接的分支（crowd_3 和 unmatch_default）
      expect(unconnectedBranches).toHaveLength(2)
      expect(unconnectedBranches.map(b => b.id)).toContain('crowd_3')
      expect(unconnectedBranches.map(b => b.id)).toContain('unmatch_default')
      
      // 验证分支分析器被正确调用
      expect(branchAnalyzer.getNodeBranches).toHaveBeenCalledWith(problemNode)
      expect(branchAnalyzer.clearCache).toHaveBeenCalled()
    })
  })
})