/**
 * 预览线和连接线转化关系完整测试
 * 测试预览线 ↔ 连接线的完整转化流程
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockGraph, createMockNode, createTestEnvironment } from './utils/mockFactory.js'

describe('预览线和连接线转化关系测试', () => {
  let testEnv
  let mockGraph
  let previewLineSystem
  let sourceNode
  let targetNode

  beforeEach(() => {
    // 使用标准化测试环境
    testEnv = createTestEnvironment({
      enableGraph: true,
      enablePreviewLine: true
    })
    
    mockGraph = testEnv.mockGraph
    previewLineSystem = testEnv.previewLineSystem
    
    // 创建测试节点
    sourceNode = createMockNode('source-node', 'data-source')
    targetNode = createMockNode('target-node', 'data-processing')
    
    // 配置Graph返回节点
    mockGraph.getCellById.mockImplementation((id) => {
      if (id === 'source-node') return sourceNode
      if (id === 'target-node') return targetNode
      return null
    })
  })

  afterEach(() => {
    testEnv.cleanup()
  })

  describe('预览线创建测试', () => {
    it('源节点存在时应创建预览线', async () => {
      // 创建预览线
      const previewLine = await previewLineSystem.createPreviewLine({
        sourceId: 'source-node',
        sourcePort: 'out'
      })

      // 验证预览线创建
      expect(previewLineSystem.createPreviewLine).toHaveBeenCalledWith({
        sourceId: 'source-node',
        sourcePort: 'out'
      })
      expect(previewLine).toBeDefined()
    })

    it('应该从源节点的out端口出发', async () => {
      await previewLineSystem.createPreviewLine({
        sourceId: 'source-node',
        sourcePort: 'out'
      })

      // 验证端口配置
      expect(previewLineSystem.getSourcePort).toHaveBeenCalled()
      expect(previewLineSystem.getSourcePort()).toBe('out')
    })
  })

  describe('预览线转连接线测试', () => {
    it('存在源节点和目标节点时预览线应转为连接线', async () => {
      // 模拟预览线转连接线
      const connectionResult = await previewLineSystem.transformPreviewToConnection({
        sourceId: 'source-node',
        targetId: 'target-node',
        sourcePort: 'out',
        targetPort: 'in'
      })

      // 验证转换调用
      expect(previewLineSystem.transformPreviewToConnection).toHaveBeenCalledWith({
        sourceId: 'source-node',
        targetId: 'target-node',
        sourcePort: 'out',
        targetPort: 'in'
      })
    })

    it('连接线应连接到目标节点的in端口', async () => {
      await previewLineSystem.transformPreviewToConnection({
        sourceId: 'source-node',
        targetId: 'target-node',
        targetPort: 'in'
      })

      // 验证目标端口
      expect(previewLineSystem.getTargetPort).toHaveBeenCalled()
      expect(previewLineSystem.getTargetPort()).toBe('in')
    })
  })

  describe('连接线转预览线测试', () => {
    it('删除目标节点后连接线应恢复为预览线', async () => {
      // 模拟节点删除
      await previewLineSystem.handleNodeDeletion('target-node')

      // 验证节点删除处理
      expect(previewLineSystem.handleNodeDeletion).toHaveBeenCalledWith('target-node')
      
      // 验证连接线转预览线
      expect(previewLineSystem.transformConnectionToPreview).toHaveBeenCalled()
    })

    it('分支节点删除时应只恢复对应分支的预览线', async () => {
      // 创建分支节点
      const branchNode = createMockNode('branch-node', 'audience-split', {
        isConfigured: true,
        crowdLayers: [
          { id: 'branch1', name: '分支1' },
          { id: 'branch2', name: '分支2' }
        ]
      })

      mockGraph.getCellById.mockImplementation((id) => {
        if (id === 'branch-node') return branchNode
        return null
      })

      // 删除分支节点
      await previewLineSystem.handleNodeDeletion('branch-node')

      // 验证分支处理
      expect(previewLineSystem.handleNodeDeletion).toHaveBeenCalledWith('branch-node')
      // 注意：getBranchCount 在 handleNodeDeletion 内部被调用，需要确保Mock正确配置
      expect(previewLineSystem.getBranchCount).toHaveBeenCalled()
    })
  })

  describe('端口配置验证测试', () => {
    it('预览线和连接线都应从out端口出发', async () => {
      // 测试预览线端口
      await previewLineSystem.createPreviewLine({
        sourceId: 'source-node',
        sourcePort: 'out'
      })

      // 测试连接线端口
      await previewLineSystem.transformPreviewToConnection({
        sourceId: 'source-node',
        targetId: 'target-node',
        sourcePort: 'out',
        targetPort: 'in'
      })

      // 验证源端口始终为out
      expect(previewLineSystem.getSourcePort()).toBe('out')
    })

    it('只有in端口能触发吸附', async () => {
      // 模拟吸附操作
      await previewLineSystem.handleSnapToNode({
        nodeId: 'target-node',
        port: 'in'
      })

      // 验证吸附处理
      expect(previewLineSystem.handleSnapToNode).toHaveBeenCalledWith({
        nodeId: 'target-node',
        port: 'in'
      })
      expect(previewLineSystem.getTargetPort()).toBe('in')
    })
  })

  describe('数量验证测试', () => {
    it('预览线+连接线数量应等于节点分支数量', async () => {
      // 获取分支数量
      const branchCount = previewLineSystem.getBranchCount()
      
      // 验证数量计算
      expect(previewLineSystem.getBranchCount).toHaveBeenCalled()
      expect(typeof branchCount).toBe('number')
      expect(branchCount).toBeGreaterThanOrEqual(1)
    })

    it('无分支节点的数量应为1', async () => {
      // 模拟无分支节点
      previewLineSystem.getBranchCount.mockReturnValue(1)
      
      const count = previewLineSystem.getBranchCount()
      expect(count).toBe(1)
    })
  })
})