import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'
import { createPreviewLineTestEnvironment } from './utils/MockGraphFactory.js'

describe('统一预览线管理器 - 重构后的分支逻辑测试', () => {
  let previewManager
  let testEnv

  beforeEach(() => {
    // 使用标准的测试环境
    testEnv = createPreviewLineTestEnvironment({
      enableEventSystem: true,
      layoutEngineReady: true
    })

    // 创建预览线管理器实例
    previewManager = new PreviewLineSystem({
      graph: testEnv.mockGraph,
      layoutEngine: testEnv.mockLayoutEngine,
      layoutEngineReady: true
    })
    
    // 确保初始化成功
    try {
      previewManager.init()
    } catch (error) {
      console.warn('PreviewLineSystem初始化警告:', error.message)
    }
    
    // 模拟 getNodeBranches 方法
    previewManager.getNodeBranches = vi.fn((node) => {
      const nodeData = node.getData() || {}
      const nodeType = nodeData.type || nodeData.nodeType
      
      if (nodeType === 'audience-split') {
        const config = nodeData.config || {}
        if (config.branches) {
          return config.branches
        }
        return [
          { id: 'branch-1', label: '分支1' },
          { id: 'branch-2', label: '分支2' }
        ]
      }
      
      if (nodeType === 'event-split') {
        return [
          { id: 'yes', label: '是' },
          { id: 'no', label: '否' }
        ]
      }
      
      if (nodeType === 'ab-test') {
        return [
          { id: 'version-a', label: '版本A' },
          { id: 'version-b', label: '版本B' }
        ]
      }
      
      return [{ id: 'default', label: '默认' }]
    })
  })



  describe('shouldCreatePreviewLine - 重构后的逻辑测试', () => {
    it('开始节点 - 无连接且已配置时应创建预览线', () => {
      const mockStartNode = testEnv.addNode({
        id: 'start-node-1',
        type: 'start',
        data: { type: 'start', isConfigured: true }
      })

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)
      expect(shouldCreate).toBe(true)
    })

    it('开始节点 - 有连接时不应创建预览线', () => {
      const mockStartNode = testEnv.addNode({
        id: 'start-node-1',
        type: 'start',
        data: { type: 'start', isConfigured: true }
      })

      // 添加真实连接
      testEnv.addEdge({
        id: 'real-edge-1',
        source: 'start-node-1',
        target: 'target-node-1',
        data: { type: 'real-connection' }
      })

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)
      expect(shouldCreate).toBe(false)
    })

    it('分支节点 - 部分分支连接时应创建预览线', () => {
      const mockBranchNode = testEnv.addNode({
        id: 'audience-split-1',
        type: 'audience-split',
        data: { 
          type: 'audience-split', 
          isConfigured: true,
          config: {
            branches: [
              { id: 'branch-1', label: '分支1' },
              { id: 'branch-2', label: '分支2' }
            ]
          }
        }
      })

      // 添加一个分支连接
      testEnv.addEdge({
        id: 'real-edge-1',
        source: 'audience-split-1',
        target: 'target-node-1',
        data: { type: 'real-connection', branchId: 'branch-1' }
      })

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockBranchNode)
      expect(shouldCreate).toBe(true)
    })

    it('分支节点 - 所有分支都连接时不应创建预览线', () => {
      const mockBranchNode = testEnv.addNode({
        id: 'audience-split-1',
        type: 'audience-split',
        data: { 
          type: 'audience-split', 
          isConfigured: true,
          config: {
            branches: [
              { id: 'branch-1', label: '分支1' },
              { id: 'branch-2', label: '分支2' }
            ]
          }
        }
      })

      // 添加所有分支连接
      testEnv.addEdge({
        id: 'real-edge-1',
        source: 'audience-split-1',
        target: 'target-node-1',
        data: { type: 'real-connection', branchId: 'branch-1' }
      })
      testEnv.addEdge({
        id: 'real-edge-2',
        source: 'audience-split-1',
        target: 'target-node-2',
        data: { type: 'real-connection', branchId: 'branch-2' }
      })

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockBranchNode)
      expect(shouldCreate).toBe(false)
    })

    it('未配置节点不应创建预览线', () => {
      const mockNode = testEnv.addNode({
        id: 'unconfigured-node-1',
        type: 'start',
        data: { type: 'start', isConfigured: false }
      })

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)
      expect(shouldCreate).toBe(false)
    })

    it('结束节点不应创建预览线', () => {
      const mockEndNode = {
        id: 'end-node-1',
        getData: () => ({ type: 'end', isConfigured: true }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 80, height: 40 })
      }

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockEndNode)
      expect(shouldCreate).toBe(false)
    })
  })

  describe('统一分类逻辑验证', () => {
    it('验证不同节点类型的分支判断', () => {
      // 开始节点 - 无分支
      const startNode = {
        id: 'start-1',
        getData: () => ({ type: 'start' })
      }
      expect(previewManager.isBranchNode(startNode)).toBe(false)

      // 人群分流节点 - 有分支
      const audienceSplitNode = {
        id: 'audience-split-1',
        getData: () => ({ type: 'audience-split' })
      }
      expect(previewManager.isBranchNode(audienceSplitNode)).toBe(true)

      // 事件分流节点 - 有分支
      const eventSplitNode = {
        id: 'event-split-1',
        getData: () => ({ type: 'event-split' })
      }
      expect(previewManager.isBranchNode(eventSplitNode)).toBe(true)

      // AB测试节点 - 有分支
      const abTestNode = {
        id: 'ab-test-1',
        getData: () => ({ type: 'ab-test' })
      }
      expect(previewManager.isBranchNode(abTestNode)).toBe(true)

      // 普通节点 - 无分支
      const normalNode = {
        id: 'normal-1',
        getData: () => ({ type: 'normal' })
      }
      expect(previewManager.isBranchNode(normalNode)).toBe(false)
    })

    it('验证预览线识别逻辑的一致性', () => {
      // 预览线识别：有源节点但无目标节点的边
      const previewEdge = {
        id: 'preview-1',
        getData: () => ({ type: 'preview-line' }),
        getSourceCellId: () => 'source-node-1',
        getTargetCellId: () => undefined
      }
      expect(previewManager.isPreviewLine(previewEdge)).toBe(true)

      // 真实连接：有源节点和目标节点的边
      const realEdge = {
        id: 'real-1',
        getData: () => ({ type: 'real-connection' }),
        getSourceCellId: () => 'source-node-1',
        getTargetCellId: () => 'target-node-1'
      }
      expect(previewManager.isPreviewLine(realEdge)).toBe(false)
    })
  })
})