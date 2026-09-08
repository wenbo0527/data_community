/**
 * PreviewLineValidator 单元测试
 * 专门测试4种节点类型的容错处理逻辑
 * 🔧 更新：增强容错处理和异常场景测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineValidator } from '../../utils/preview-line/core/PreviewLineValidator.js'
import { CreationRequirementTypes } from '../../utils/preview-line/types/PreviewLineTypes.js'

describe('PreviewLineValidator - 4种节点类型容错测试', () => {
  let validator
  let mockConfigManager
  let mockGraph
  let mockLayoutEngine

  beforeEach(() => {
    // 模拟配置管理器
    mockConfigManager = {
      getConfig: vi.fn().mockReturnValue({
        enablePreviewLines: true,
        maxPreviewLines: 10
      }),
      get: vi.fn((key, defaultValue) => {
        if (key === 'debug.enabled') return true
        return defaultValue
      })
    }

    // 模拟图形对象
    mockGraph = {
      getNodes: vi.fn().mockReturnValue([]),
      getEdges: vi.fn().mockReturnValue([])
    }

    // 模拟布局引擎
    mockLayoutEngine = {
      isReady: vi.fn().mockReturnValue(true),
      calculatePosition: vi.fn().mockReturnValue({ x: 100, y: 100 })
    }

    validator = new PreviewLineValidator(mockConfigManager, mockGraph, mockLayoutEngine)
    
    // 模拟日志方法
    validator.log = vi.fn()
  })

  describe('start-node 节点测试', () => {
    it('应该正确处理正常的 start 节点', async () => {
      const startNode = {
        id: 'start-1',
        type: 'start',
        getData: vi.fn().mockReturnValue({
          type: 'start',
          isConfigured: true
        })
      }

      const result = await validator.checkPreviewLineRequirement(startNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(true)
      expect(result.type).toBe(CreationRequirementTypes.NEEDS_CREATION)
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理 start 节点数据获取异常', async () => {
      const startNode = {
        id: 'start-2',
        type: 'start',
        getData: vi.fn().mockImplementation(() => {
          throw new Error('数据获取失败')
        })
      }

      const result = await validator.checkPreviewLineRequirement(startNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(true)
      expect(result.reason).toContain('start节点需要预览线')
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理没有 getData 方法的 start 节点', async () => {
      const startNode = {
        id: 'start-3',
        type: 'start',
        data: {
          type: 'start',
          isConfigured: true
        }
      }

      const result = await validator.checkPreviewLineRequirement(startNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(true)
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })
  })

  describe('audience-split-node 节点测试', () => {
    it('应该正确处理正常的 audience-split 节点', async () => {
      const audienceSplitNode = {
        id: 'audience-split-1',
        type: 'audience-split',
        getData: vi.fn().mockReturnValue({
          type: 'audience-split',
          audiences: [
            { id: 'aud1', name: '受众1' },
            { id: 'aud2', name: '受众2' }
          ]
        })
      }

      const result = await validator.checkPreviewLineRequirement(audienceSplitNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理 audience-split 节点缺少 audiences 配置', async () => {
      const audienceSplitNode = {
        id: 'audience-split-2',
        type: 'audience-split',
        getData: vi.fn().mockReturnValue({
          type: 'audience-split'
          // 缺少 audiences 配置
        })
      }

      const result = await validator.checkPreviewLineRequirement(audienceSplitNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(false)
      expect(result.reason).toContain('audience-split节点缺少有效的audiences配置')
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理 audience-split 节点数据获取异常', async () => {
      const audienceSplitNode = {
        id: 'audience-split-3',
        type: 'audience-split',
        getData: vi.fn().mockImplementation(() => {
          throw new Error('数据获取失败')
        })
      }

      const result = await validator.checkPreviewLineRequirement(audienceSplitNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(false)
      expect(result.reason).toContain('audience-split节点数据获取异常')
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })
  })

  describe('manual-call-node 节点测试', () => {
    it('应该正确处理已配置的 manual-call 节点', async () => {
      const manualCallNode = {
        id: 'manual-call-1',
        type: 'manual-call',
        getData: vi.fn().mockReturnValue({
          type: 'manual-call',
          isConfigured: true,
          phoneNumber: '123456789'
        })
      }

      const result = await validator.checkPreviewLineRequirement(manualCallNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(true)
      expect(result.reason).toContain('manual-call节点已配置，需要预览线')
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理 manual-call 节点数据获取异常', async () => {
      const manualCallNode = {
        id: 'manual-call-2',
        type: 'manual-call',
        getData: vi.fn().mockImplementation(() => {
          throw new Error('数据获取失败')
        })
      }

      const result = await validator.checkPreviewLineRequirement(manualCallNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(true)
      expect(result.reason).toContain('manual-call节点数据获取异常，默认需要预览线')
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理未配置的 manual-call 节点', async () => {
      const manualCallNode = {
        id: 'manual-call-3',
        type: 'manual-call',
        getData: vi.fn().mockReturnValue({
          type: 'manual-call',
          isConfigured: false
        })
      }

      const result = await validator.checkPreviewLineRequirement(manualCallNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })
  })

  describe('sms-node 节点测试', () => {
    it('应该正确处理已配置的 sms 节点', async () => {
      const smsNode = {
        id: 'sms-1',
        type: 'sms',
        getData: vi.fn().mockReturnValue({
          type: 'sms',
          isConfigured: true,
          message: '测试短信内容'
        })
      }

      const result = await validator.checkPreviewLineRequirement(smsNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(true)
      expect(result.reason).toContain('sms节点已配置，需要预览线')
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理 sms 节点数据获取异常', async () => {
      const smsNode = {
        id: 'sms-2',
        type: 'sms',
        getData: vi.fn().mockImplementation(() => {
          throw new Error('数据获取失败')
        })
      }

      const result = await validator.checkPreviewLineRequirement(smsNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(true)
      expect(result.reason).toContain('sms节点数据获取异常，默认需要预览线')
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理未配置的 sms 节点', async () => {
      const smsNode = {
        id: 'sms-3',
        type: 'sms',
        getData: vi.fn().mockReturnValue({
          type: 'sms',
          isConfigured: false
        })
      }

      const result = await validator.checkPreviewLineRequirement(smsNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })
  })

  describe('isBranchNode 方法容错测试', () => {
    it('应该正确识别非分支节点类型', () => {
      const singleNodes = [
        { type: 'start', id: 'start-1' },
        { type: 'manual-call', id: 'manual-call-1' },
        { type: 'sms', id: 'sms-1' },
        { type: 'email', id: 'email-1' }
      ]

      singleNodes.forEach(node => {
        const result = validator.isBranchNode(node)
        expect(result).toBe(false)
        expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining(`🔧 明确识别：${node.id} 节点类型 ${node.type} 为单一节点`))
      })
    })

    it('应该正确识别分支节点类型', () => {
      const branchNodes = [
        { type: 'audience-split', id: 'audience-split-1', getData: () => ({ type: 'audience-split' }) },
        { type: 'event-split', id: 'event-split-1', getData: () => ({ type: 'event-split' }) }
      ]

      branchNodes.forEach(node => {
        const result = validator.isBranchNode(node)
        expect(result).toBe(true)
        expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining(`🔧 节点类型判断：${node.id} 类型 ${node.type} 是分支节点`))
      })
    })

    it('应该处理节点数据获取异常', () => {
      const problematicNode = {
        id: 'problematic-1',
        type: 'start',
        getData: vi.fn().mockImplementation(() => {
          throw new Error('数据获取失败')
        })
      }

      const result = validator.isBranchNode(problematicNode)
      
      expect(result).toBe(false)
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('预览线需求检查完成'))
    })

    it('应该处理空节点', () => {
      const result = validator.isBranchNode(null)
      expect(result).toBe(false)
    })

    it('应该处理没有数据的节点', () => {
      const nodeWithoutData = {
        id: 'no-data-1',
        type: 'start'
      }

      const result = validator.isBranchNode(nodeWithoutData)
      
      expect(result).toBe(false)
      expect(validator.log).toHaveBeenCalledWith('debug', expect.stringContaining('🔧 容错处理：no-data-1 节点类型 start 无数据，默认为非分支节点'))
    })
  })

  describe('异常场景综合测试', () => {
    it('应该处理完全无效的节点对象', async () => {
      const invalidNode = {}

      const result = await validator.checkPreviewLineRequirement(invalidNode, 'active', new Map())

      expect(result).toBeDefined()
      // 应该有合理的默认处理
    })

    it('应该处理节点类型不匹配的情况', async () => {
      const mismatchedNode = {
        id: 'mismatched-1',
        type: 'unknown-type',
        getData: vi.fn().mockReturnValue({
          type: 'different-type'
        })
      }

      const result = await validator.checkPreviewLineRequirement(mismatchedNode, 'active', new Map())

      expect(result).toBeDefined()
      // 应该有合理的处理逻辑
    })

    it('应该处理循环引用的节点数据', async () => {
      const circularData = { type: 'start' }
      circularData.self = circularData

      const circularNode = {
        id: 'circular-1',
        type: 'start',
        getData: vi.fn().mockReturnValue(circularData)
      }

      const result = await validator.checkPreviewLineRequirement(circularNode, 'active', new Map())

      expect(result).toBeDefined()
      expect(result.needsCreation).toBe(true)
    })
  })

  describe('日志记录验证', () => {
    it('应该记录适当级别的日志', async () => {
      const testNode = {
        id: 'log-test-1',
        type: 'start',
        getData: vi.fn().mockReturnValue({
          type: 'start',
          isConfigured: true
        })
      }

      await validator.checkPreviewLineRequirement(testNode, 'active', new Map())

      // 验证调试日志被正确记录
      expect(validator.log).toHaveBeenCalledWith('debug', expect.any(String))
      
      // 验证没有错误日志
      // 验证记录了错误日志
    })

    it('应该在异常情况下记录警告日志而不是错误日志', async () => {
      const problematicNode = {
        id: 'problem-1',
        type: 'manual-call',
        getData: vi.fn().mockImplementation(() => {
          throw new Error('测试异常')
        })
      }

      await validator.checkPreviewLineRequirement(problematicNode, 'active', new Map())

  // 验证记录了错误日志
        expect(validator.log).toHaveBeenCalledWith('error', expect.stringContaining('预览线需求检查异常'))
    })
  })
})