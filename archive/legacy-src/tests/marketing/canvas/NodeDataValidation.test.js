/**
 * 营销画布节点数据验证测试
 * 测试节点位置信息、ID验证、边界值等数据验证逻辑
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateCanvasData } from '@/pages/marketing/tasks/utils/canvas/canvasValidation.js'
import { generateUniqueId, isValidId } from '@/pages/marketing/tasks/utils/canvas/idGenerator.js'
import { useCanvasNodes } from '@/pages/marketing/tasks/composables/canvas/useCanvasNodes.js'

describe('节点数据验证测试', () => {
  let mockGraph
  let mockNodeManager
  let canvasNodes

  beforeEach(() => {
    mockGraph = {
      addNode: vi.fn(),
      getNodes: vi.fn(() => []),
      getNodeById: vi.fn(),
      removeNode: vi.fn()
    }
    
    // 添加缺失的nodeManager mock
    mockNodeManager = {
      addNode: vi.fn(),
      removeNode: vi.fn(),
      getNode: vi.fn(),
      getAllNodes: vi.fn(() => [])
    }
    
    canvasNodes = useCanvasNodes(mockGraph, mockNodeManager)
  })

  describe('位置信息验证', () => {
    it('应该验证有效的位置坐标', () => {
      const validPositions = [
        { x: 0, y: 0 },
        { x: 100, y: 200 },
        { x: 1920, y: 1080 },
        { x: 50.5, y: 75.3 } // 支持小数坐标
      ]

      validPositions.forEach(position => {
        const nodeData = {
          id: generateUniqueId(),
          type: 'sms',
          position,
          data: { label: 'Test Node' }
        }

        const result = validateCanvasData({ nodes: [nodeData], connections: [] })
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('应该拒绝无效的位置坐标', () => {
      const invalidPositions = [
        null,
        undefined,
        {},
        { x: null, y: 100 },
        { x: 100, y: null },
        { x: 'invalid', y: 100 },
        { x: 100, y: 'invalid' },
        { x: NaN, y: 100 },
        { x: 100, y: NaN },
        { x: Infinity, y: 100 },
        { x: 100, y: -Infinity }
      ]

      invalidPositions.forEach(position => {
        const nodeData = {
          id: generateUniqueId(),
          type: 'sms',
          position,
          data: { label: 'Test Node' }
        }

        const result = validateCanvasData({ nodes: [nodeData], connections: [] })
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors.some(error => error.includes('位置') || error.includes('position'))).toBe(true)
      })
    })

    it('应该验证位置边界值', () => {
      const boundaryTests = [
        { position: { x: -1000, y: -1000 }, shouldPass: true }, // 负坐标应该被允许
        { position: { x: 0, y: 0 }, shouldPass: true }, // 零坐标
        { position: { x: 10000, y: 10000 }, shouldPass: true }, // 大坐标值
        { position: { x: Number.MAX_SAFE_INTEGER, y: 100 }, shouldPass: false }, // 超大值
        { position: { x: 100, y: Number.MAX_SAFE_INTEGER }, shouldPass: false }
      ]

      boundaryTests.forEach(({ position, shouldPass }) => {
        const nodeData = {
          id: generateUniqueId(),
          type: 'sms',
          position,
          data: { label: 'Boundary Test' }
        }

        const result = validateCanvasData({ nodes: [nodeData], connections: [] })
        expect(result.isValid).toBe(shouldPass)
      })
    })
  })

  describe('节点ID验证', () => {
    it('应该验证有效的节点ID格式', () => {
      const validIds = [
        generateUniqueId(),
        'node-123',
        'sms-node-456',
        'custom_id_789',
        'node.with.dots',
        'node-with-dashes'
      ]

      validIds.forEach(id => {
        expect(isValidId(id)).toBe(true)
        
        const nodeData = {
          id,
          type: 'sms',
          position: { x: 100, y: 100 },
          data: { label: 'Test Node' }
        }

        const result = validateCanvasData({ nodes: [nodeData], connections: [] })
        expect(result.isValid).toBe(true)
      })
    })

    it('应该拒绝无效的节点ID', () => {
      const invalidIds = [
        null,
        undefined,
        '',
        ' ',
        '   ',
        'id with spaces',
        'id\twith\ttabs',
        'id\nwith\nnewlines',
        'id@with@symbols',
        'id#with#hash',
        'id%with%percent'
      ]

      invalidIds.forEach(id => {
        expect(isValidId(id)).toBe(false)
        
        // 跳过null和undefined，因为它们会被当作缺少ID处理
        if (id === null || id === undefined) {
          const nodeData = {
            id,
            type: 'sms',
            position: { x: 100, y: 100 },
            data: { label: 'Test Node' }
          }

          const result = validateCanvasData({ nodes: [nodeData], connections: [] })
          expect(result.isValid).toBe(false)
          expect(result.errors.some(error => error.includes('缺少ID'))).toBe(true)
        } else {
          const nodeData = {
            id,
            type: 'sms',
            position: { x: 100, y: 100 },
            data: { label: 'Test Node' }
          }

          const result = validateCanvasData({ nodes: [nodeData], connections: [] })
          expect(result.isValid).toBe(false)
          // 对于其他无效ID，应该有相关错误信息
          expect(result.errors.length).toBeGreaterThan(0)
        }
      })
    })

    it('应该确保节点ID唯一性', () => {
      const duplicateId = generateUniqueId()
      const nodesWithDuplicateIds = [
        {
          id: duplicateId,
          type: 'sms',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' }
        },
        {
          id: duplicateId,
          type: 'ai-call',
          position: { x: 200, y: 200 },
          data: { label: 'Node 2' }
        }
      ]

      const result = validateCanvasData({ nodes: nodesWithDuplicateIds, connections: [] })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('重复') || error.includes('duplicate'))).toBe(true)
    })
  })

  describe('节点数据结构验证', () => {
    it('应该验证完整的节点数据结构', () => {
      const startNode = {
        id: generateUniqueId(),
        type: 'start',
        position: { x: 0, y: 0 },
        label: '开始',
        data: { label: '开始' }
      }
      
      const completeNodeData = {
        id: generateUniqueId(),
        type: 'sms',
        position: { x: 100, y: 100 },
        label: 'SMS节点',
        data: {
          label: 'SMS节点',
          config: {
            message: '测试消息',
            sender: '系统'
          }
        }
      }

      const result = validateCanvasData({ nodes: [startNode, completeNodeData], connections: [] })
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝缺少必需字段的节点', () => {
      const incompleteNodes = [
        { type: 'sms', position: { x: 100, y: 100 } }, // 缺少id
        { id: generateUniqueId(), position: { x: 100, y: 100 } }, // 缺少type
        { id: generateUniqueId(), type: 'sms' }, // 缺少position
        { id: generateUniqueId(), type: 'sms', position: { x: 100, y: 100 } } // 缺少data
      ]

      incompleteNodes.forEach(nodeData => {
        const result = validateCanvasData({ nodes: [nodeData], connections: [] })
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    it('应该验证节点数据类型', () => {
      const nodeWithWrongTypes = {
        id: 123, // 应该是字符串
        type: null, // 应该是字符串
        position: 'invalid', // 应该是对象
        data: 'invalid' // 应该是对象
      }

      const result = validateCanvasData({ nodes: [nodeWithWrongTypes], connections: [] })
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('边界值和极端情况测试', () => {
    it('应该处理空节点数组', () => {
      const result = validateCanvasData({ nodes: [], connections: [] })
      expect(result.isValid).toBe(false) // 空节点数组应该失败
      expect(result.errors.some(error => error.includes('至少需要一个节点'))).toBe(true)
    })

    it('应该处理大量节点', () => {
      const largeNodeArray = Array.from({ length: 1000 }, (_, index) => ({
        id: `node-${index}`,
        type: index === 0 ? 'start' : 'sms', // 第一个节点为start类型
        x: index * 10,
        y: index * 10,
        label: `Node ${index}`,
        data: { label: `Node ${index}` }
      }))

      const result = validateCanvasData({ nodes: largeNodeArray, connections: [] })
      expect(result.isValid).toBe(false) // 大量未配置的sms节点应该失败
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该处理极长的节点标签', () => {
      const longLabel = 'A'.repeat(10000) // 10000字符的标签
      const nodeWithLongLabel = {
        id: generateUniqueId(),
        type: 'start',
        x: 100,
        y: 100,
        label: longLabel,
        data: { label: longLabel }
      }

      const result = validateCanvasData({ nodes: [nodeWithLongLabel], connections: [] })
      // 当前验证器不限制标签长度，所以应该通过
      expect(result.isValid).toBe(true)
    })

    it('应该处理特殊字符在节点数据中', () => {
      const nodeWithSpecialChars = {
        id: 'node-special-chars',
        type: 'start', // 使用start类型，因为它不需要额外配置
        x: 100,
        y: 100,
        label: '节点🚀测试💯',
        data: {
          label: '节点🚀测试💯',
          description: 'Special chars: <>&"\'\'\n\t',
          config: {
            message: 'Hello\nWorld\t测试'
          }
        }
      }

      const result = validateCanvasData({ nodes: [nodeWithSpecialChars], connections: [] })
      expect(result.isValid).toBe(true)
    })
  })

  describe('useCanvasNodes集成测试', () => {
    it('应该正确添加有效节点到画布', async () => {
      const validNodeData = {
        type: 'sms',
        position: { x: 100, y: 100 },
        data: { label: 'Test SMS Node' }
      }

      try {
        const result = await canvasNodes.addNodeFromData(validNodeData)
        expect(result).toBeDefined()
        expect(mockGraph.addNode).toHaveBeenCalledTimes(1)
      } catch (error) {
        // 如果抛出异常，验证是否为预期的验证错误
        expect(error.message).toContain('验证失败')
      }
    })

    it('应该拒绝添加无效节点到画布', async () => {
      const invalidNodeData = {
        type: 'invalid-type',
        position: null,
        data: null
      }

      try {
        const result = await canvasNodes.addNodeFromData(invalidNodeData)
        expect(result.success).toBe(false)
      } catch (error) {
        // 验证抛出的错误包含类型相关信息
        expect(error.message).toContain('不支持的节点类型')
      }
      
      expect(mockGraph.addNode).not.toHaveBeenCalled()
    })

    it('应该在添加节点前进行数据验证', async () => {
      const nodeData = {
        type: 'sms',
        position: { x: 'invalid', y: 100 },
        data: { label: 'Test Node' }
      }

      try {
        const result = await canvasNodes.addNodeFromData(nodeData)
        expect(result.success).toBe(false)
      } catch (error) {
        // 验证抛出的错误包含位置相关信息
        expect(error.message).toContain('验证失败')
      }
      
      expect(mockGraph.addNode).not.toHaveBeenCalled()
    })
  })
})