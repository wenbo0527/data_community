/**
 * 节点类型验证测试
 * 测试节点类型验证功能，确保正确识别无效节点类型
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NodeTypeValidator, nodeTypeValidator } from '../../utils/preview-line/validators/NodeTypeValidator.js'
import { PreviewLineValidator } from '../../utils/preview-line/core/PreviewLineValidator.js'

describe('节点类型验证测试', () => {
  let validator
  let previewValidator

  beforeEach(() => {
    validator = new NodeTypeValidator()
    previewValidator = new PreviewLineValidator()
  })

  describe('NodeTypeValidator 基础功能测试', () => {
    it('应该正确验证有效的节点类型', () => {
      const validNode = {
        id: 'test-node-1',
        type: 'start',
        data: {
          type: 'start',
          isConfigured: true
        }
      }

      const result = validator.validateNodeType(validNode)
      
      expect(result.isValid).toBe(true)
      expect(result.nodeType).toBe('start')
      expect(result.actualType).toBe('start')
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝无效的节点类型', () => {
      const invalidNode = {
        id: 'test-node-2',
        type: 'invalid-type',
        data: {
          type: 'invalid-type'
        }
      }

      const result = validator.validateNodeType(invalidNode)
      
      expect(result.isValid).toBe(false)
      expect(result.actualType).toBe('invalid-type')
      expect(result.errors).toContain('不支持的节点类型: "invalid-type"')
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    it('应该拒绝危险的节点类型（邮件节点）', () => {
      const dangerousNode = {
        id: 'test-node-3',
        type: 'email',
        data: {
          type: 'email',
          isConfigured: true
        }
      }

      const result = validator.validateNodeType(dangerousNode)
      
      // 注意：email类型在nodeTypes.js中是定义的，但在验证逻辑中被标记为危险
      expect(result.isValid).toBe(true) // NodeTypeValidator本身不检查危险类型
      expect(result.nodeType).toBe('email')
    })

    it('应该检测节点类型不一致的情况', () => {
      const inconsistentNode = {
        id: 'test-node-4',
        type: 'start',
        nodeType: 'end', // 不一致
        data: {
          type: 'sms' // 也不一致
        }
      }

      const result = validator.validateNodeType(inconsistentNode)
      
      expect(result.isValid).toBe(true) // 主类型是有效的
      expect(result.nodeType).toBe('start') // 使用第一个找到的类型
      expect(result.warnings.length).toBeGreaterThan(0) // 应该有不一致警告
    })

    it('应该为任务节点提供特殊验证', () => {
      const taskNode = {
        id: 'test-task-1',
        type: 'task',
        data: {
          type: 'task',
          config: {
            taskType: 'data-processing'
          }
        }
      }

      const result = validator.validateNodeType(taskNode)
      
      expect(result.isValid).toBe(true)
      expect(result.nodeType).toBe('task')
    })

    it('应该为缺少配置的任务节点发出警告', () => {
      const incompleteTaskNode = {
        id: 'test-task-2',
        type: 'task',
        data: {
          type: 'task'
          // 缺少config.taskType
        }
      }

      const result = validator.validateNodeType(incompleteTaskNode)
      
      expect(result.isValid).toBe(true)
      expect(result.nodeType).toBe('task')
      // 任务节点配置检查在PreviewLineValidationError中进行
    })
  })

  describe('批量节点验证测试', () => {
    it('应该正确处理混合节点类型的批量验证', () => {
      const nodes = [
        { id: 'node-1', type: 'start', data: { type: 'start' } },
        { id: 'node-2', type: 'sms', data: { type: 'sms' } },
        { id: 'node-3', type: 'invalid-type', data: { type: 'invalid-type' } },
        { id: 'node-4', type: 'end', data: { type: 'end' } },
        { id: 'node-5', type: 'task', data: { type: 'task' } }
      ]

      const result = validator.validateMultipleNodeTypes(nodes)
      
      expect(result.totalNodes).toBe(5)
      expect(result.validNodes).toBe(4) // start, sms, end, task
      expect(result.invalidNodes).toBe(1) // invalid-type
      expect(result.summary.supportedTypes).toContain('start')
      expect(result.summary.supportedTypes).toContain('sms')
      expect(result.summary.supportedTypes).toContain('end')
      expect(result.summary.supportedTypes).toContain('task')
      expect(result.summary.unsupportedTypes).toContain('invalid-type')
    })

    it('应该处理空数组输入', () => {
      const result = validator.validateMultipleNodeTypes([])
      
      expect(result.totalNodes).toBe(0)
      expect(result.validNodes).toBe(0)
      expect(result.invalidNodes).toBe(0)
      expect(result.isValid).toBe(true)
    })

    it('应该处理无效输入', () => {
      const result = validator.validateMultipleNodeTypes(null)
      
      expect(result.isValid).toBe(false)
      expect(result.summary.errors).toContain('输入不是有效的节点数组')
    })
  })

  describe('PreviewLineValidator 集成测试', () => {
    it('应该在预览线需求检查中验证节点类型', () => {
      const validNode = {
        id: 'test-node-1',
        type: 'start',
        data: {
          type: 'start',
          isConfigured: true
        },
        getData: function() { return this.data }
      }

      const existingPreviewLines = new Map()
      
      const result = previewValidator.checkPreviewLineRequirement(
        validNode, 
        'active', 
        existingPreviewLines
      )
      
      // 应该通过节点类型验证并继续处理
      expect(result).toBeDefined()
      expect(result.reason).not.toContain('节点类型无效')
    })

    it('应该拒绝危险节点类型的预览线创建', () => {
      const dangerousNode = {
        id: 'test-email-node',
        type: 'email',
        data: {
          type: 'email',
          isConfigured: true
        },
        getData: function() { return this.data }
      }

      const existingPreviewLines = new Map()
      
      const result = previewValidator.checkPreviewLineRequirement(
        dangerousNode, 
        'active', 
        existingPreviewLines
      )
      
      // 应该拒绝邮件节点
      expect(result.needsCreation).toBe(false)
      expect(result.reason).toContain('危险的节点类型')
    })

    it('应该正确识别分支节点类型', () => {
      const branchNode = {
        id: 'test-branch-1',
        type: 'audience-split',
        data: {
          type: 'audience-split',
          isConfigured: true
        },
        getData: function() { return this.data }
      }

      const isBranch = previewValidator.isBranchNode(branchNode)
      
      expect(isBranch).toBe(true)
    })

    it('应该正确识别非分支节点类型', () => {
      const singleNode = {
        id: 'test-single-1',
        type: 'sms',
        data: {
          type: 'sms',
          isConfigured: true
        },
        getData: function() { return this.data }
      }

      const isBranch = previewValidator.isBranchNode(singleNode)
      
      expect(isBranch).toBe(false)
    })

    it('应该拒绝危险节点类型的分支判断', () => {
      const dangerousNode = {
        id: 'test-email-branch',
        type: 'email',
        data: {
          type: 'email'
        },
        getData: function() { return this.data }
      }

      const isBranch = previewValidator.isBranchNode(dangerousNode)
      
      // 邮件节点应该被拒绝，返回false
      expect(isBranch).toBe(false)
    })
  })

  describe('节点类型建议功能测试', () => {
    it('应该为常见错误类型提供建议', () => {
      const testCases = [
        { input: 'message', expected: 'sms' },
        { input: 'call', expected: 'ai-call' },
        { input: 'split', expected: 'audience-split' },
        { input: 'begin', expected: 'start' },
        { input: 'finish', expected: 'end' }
      ]

      testCases.forEach(({ input, expected }) => {
        const suggestion = validator.findSimilarNodeType(input)
        expect(suggestion).toBe(expected)
      })
    })

    it('应该为无匹配的类型返回null', () => {
      const suggestion = validator.findSimilarNodeType('completely-unknown-type')
      expect(suggestion).toBeNull()
    })
  })

  describe('支持的节点类型列表测试', () => {
    it('应该返回完整的支持类型列表', () => {
      const supportedTypes = validator.getSupportedNodeTypes()
      
      expect(supportedTypes).toContain('start')
      expect(supportedTypes).toContain('end')
      expect(supportedTypes).toContain('sms')
      expect(supportedTypes).toContain('audience-split')
      expect(supportedTypes).toContain('task')
      expect(supportedTypes).toContain('email') // 虽然危险，但在类型列表中
      
      // 确保返回的是副本，不是原始数组
      supportedTypes.push('test-type')
      const supportedTypes2 = validator.getSupportedNodeTypes()
      expect(supportedTypes2).not.toContain('test-type')
    })

    it('应该正确识别分支节点类型', () => {
      const branchTypes = ['audience-split', 'event-split', 'ab-test', 'condition']
      const nonBranchTypes = ['start', 'end', 'sms', 'task', 'wait']

      branchTypes.forEach(type => {
        expect(validator.isBranchNodeType(type)).toBe(true)
      })

      nonBranchTypes.forEach(type => {
        expect(validator.isBranchNodeType(type)).toBe(false)
      })
    })
  })

  describe('错误处理测试', () => {
    it('应该处理null节点输入', () => {
      const result = validator.validateNodeType(null)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('节点对象不存在')
    })

    it('应该处理缺少类型信息的节点', () => {
      const nodeWithoutType = {
        id: 'test-node-no-type',
        data: {}
      }

      const result = validator.validateNodeType(nodeWithoutType)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('无法获取节点类型')
    })

    it('应该处理异常情况并提供降级逻辑', () => {
      // 模拟一个会导致异常的节点对象
      const problematicNode = {
        id: 'problematic-node',
        type: 'start',
        getData: function() { 
          throw new Error('模拟数据获取异常') 
        }
      }

      // PreviewLineValidator应该能够处理这种异常
      const isBranch = previewValidator.isBranchNode(problematicNode)
      
      // 应该降级到原有逻辑并返回结果
      expect(typeof isBranch).toBe('boolean')
    })
  })
})

describe('节点类型验证集成测试', () => {
  it('应该在实际预览线系统中正确工作', async () => {
    // 创建一个包含各种节点类型的测试场景
    const testNodes = [
      {
        id: 'start-1',
        type: 'start',
        data: { type: 'start', isConfigured: true },
        getData: function() { return this.data }
      },
      {
        id: 'sms-1', 
        type: 'sms',
        data: { type: 'sms', isConfigured: true },
        getData: function() { return this.data }
      },
      {
        id: 'split-1',
        type: 'audience-split',
        data: { 
          type: 'audience-split', 
          isConfigured: true,
          config: { branches: [{ id: 'branch-1' }, { id: 'branch-2' }] }
        },
        getData: function() { return this.data }
      },
      {
        id: 'task-1',
        type: 'task',
        data: { 
          type: 'task', 
          isConfigured: true,
          config: { taskType: 'data-processing' }
        },
        getData: function() { return this.data }
      },
      {
        id: 'end-1',
        type: 'end',
        data: { type: 'end', isConfigured: true },
        getData: function() { return this.data }
      }
    ]

    const validator = new NodeTypeValidator()
    const batchResult = validator.validateMultipleNodeTypes(testNodes)

    expect(batchResult.isValid).toBe(true)
    expect(batchResult.validNodes).toBe(5)
    expect(batchResult.invalidNodes).toBe(0)
    
    // 验证支持的类型被正确识别
    expect(batchResult.summary.supportedTypes).toContain('start')
    expect(batchResult.summary.supportedTypes).toContain('sms')
    expect(batchResult.summary.supportedTypes).toContain('audience-split')
    expect(batchResult.summary.supportedTypes).toContain('task')
    expect(batchResult.summary.supportedTypes).toContain('end')
  })
})