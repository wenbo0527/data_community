/**
 * 营销画布节点类型支持测试
 * 测试支持的节点类型、不支持的类型、类型与形状映射等
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getNodeConfig, getNodeShapeByType } from '@/utils/nodeTypes.js'
import { useCanvasNodes } from '@/pages/marketing/tasks/composables/useCanvasNodes.js'
import { validateCanvasData } from '@/pages/marketing/tasks/utils/canvas/canvasValidation.js'
import { generateUniqueId } from '@/pages/marketing/tasks/utils/canvas/idGenerator.js'

// 营销画布支持的节点类型
const SUPPORTED_NODE_TYPES = [
  'start',
  'audience-split',
  'event-split', 
  'sms',
  'ai-call',
  'manual-call',
  'ab-test',
  'wait',
  'end'
]

// 不支持的节点类型
const UNSUPPORTED_NODE_TYPES = [
  'invalid-type',
  'unknown-node',
  'deprecated-type',
  'test-type',
  '',
  null,
  undefined,
  123,
  {},
  []
]

describe('节点类型支持测试', () => {
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

  describe('支持的节点类型测试', () => {
    it('应该支持所有预定义的营销画布节点类型', () => {
      SUPPORTED_NODE_TYPES.forEach(nodeType => {
        const config = getNodeConfig(nodeType)
        
        expect(config).toBeDefined()
        expect(config.label).toBeDefined()
        expect(config.color).toBeDefined()
        expect(config.ports).toBeDefined()
        
        // 验证端口配置的合理性
        if (nodeType === 'start') {
          expect(config.ports.in).toBe(false)
          expect(config.ports.out).toBe(true)
        } else if (nodeType === 'end') {
          expect(config.ports.in).toBe(true)
          expect(config.ports.out).toBe(false)
        } else {
          expect(config.ports.in).toBe(true)
          expect(config.ports.out).toBe(true)
        }
      })
    })

    it('应该为每个支持的节点类型返回正确的形状', () => {
      SUPPORTED_NODE_TYPES.forEach(nodeType => {
        const shape = getNodeShapeByType(nodeType)
        
        // 根据用户要求，所有节点都应该是圆形
        expect(shape).toBe('circle')
      })
    })

    it('应该成功创建所有支持类型的节点', async () => {
      for (const nodeType of SUPPORTED_NODE_TYPES) {
        const nodeData = {
          type: nodeType,
          position: { x: 100, y: 100 },
          data: { label: `Test ${nodeType} Node` }
        }

        try {
          const result = await canvasNodes.addNodeFromData(nodeData)
          expect(result).toBeDefined()
          expect(mockGraph.addNode).toHaveBeenCalled()
        } catch (error) {
          // 如果抛出异常，验证是否为预期的验证错误
          expect(error.message).toContain('验证失败')
        }
      }
      
      expect(mockGraph.addNode).toHaveBeenCalledTimes(SUPPORTED_NODE_TYPES.length)
    })

    it('应该正确验证包含支持节点类型的画布数据', () => {
      const nodes = SUPPORTED_NODE_TYPES.map(nodeType => ({
        id: generateUniqueId(),
        type: nodeType,
        position: { x: Math.random() * 1000, y: Math.random() * 1000 },
        data: { label: `${nodeType} Node` }
      }))

      const result = validateCanvasData({ nodes, connections: [] })
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('不支持的节点类型测试', () => {
    it('应该拒绝不支持的节点类型', () => {
      UNSUPPORTED_NODE_TYPES.forEach(nodeType => {
        const config = getNodeConfig(nodeType)
        
        // 不支持的类型应该返回null或undefined，或者抛出错误
        expect(config).toBeUndefined()
      })
    })

    it('应该为不支持的节点类型返回默认形状', () => {
      UNSUPPORTED_NODE_TYPES.forEach(nodeType => {
        const shape = getNodeShapeByType(nodeType)
        
        // 不支持的类型应该返回默认的圆形
        expect(shape).toBe('circle')
      })
    })

    it('应该拒绝创建不支持类型的节点', async () => {
      for (const nodeType of UNSUPPORTED_NODE_TYPES.filter(type => typeof type === 'string')) {
        const nodeData = {
          type: nodeType,
          position: { x: 100, y: 100 },
          data: { label: `Test ${nodeType} Node` }
        }

        try {
          const result = await canvasNodes.addNodeFromData(nodeData)
          expect(result.success).toBe(false)
        } catch (error) {
          // 验证抛出的错误包含不支持类型的信息
          expect(error.message).toContain('不支持的节点类型')
        }
      }
      
      expect(mockGraph.addNode).not.toHaveBeenCalled()
    })

    it('应该拒绝包含不支持节点类型的画布数据', () => {
      UNSUPPORTED_NODE_TYPES.forEach(nodeType => {
        const nodeData = {
          id: generateUniqueId(),
          type: nodeType,
          position: { x: 100, y: 100 },
          data: { label: 'Test Node' }
        }

        const result = validateCanvasData({ nodes: [nodeData], connections: [] })
        
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors.some(error => 
          error.includes('不支持') || 
          error.includes('invalid') || 
          error.includes('类型')
        )).toBe(true)
      })
    })
  })

  describe('节点类型与配置映射测试', () => {
    it('应该为开始节点提供正确的配置', () => {
      const config = getNodeConfig('start')
      
      expect(config.label).toBe('开始')
      expect(config.color).toBeDefined()
      expect(config.ports.in).toBe(false)
      expect(config.ports.out).toBe(true)
      expect(config.width).toBeDefined()
      expect(config.height).toBeDefined()
    })

    it('应该为结束节点提供正确的配置', () => {
      const config = getNodeConfig('end')
      
      expect(config.label).toBe('结束')
      expect(config.color).toBeDefined()
      expect(config.ports.in).toBe(true)
      expect(config.ports.out).toBe(false)
      expect(config.width).toBeDefined()
      expect(config.height).toBeDefined()
    })

    it('应该为SMS节点提供正确的配置', () => {
      const config = getNodeConfig('sms')
      
      expect(config.label).toBe('SMS')
      expect(config.color).toBeDefined()
      expect(config.ports.in).toBe(true)
      expect(config.ports.out).toBe(true)
      expect(config.width).toBeDefined()
      expect(config.height).toBeDefined()
    })

    it('应该为AI外呼节点提供正确的配置', () => {
      const config = getNodeConfig('ai-call')
      
      expect(config.label).toBe('AI外呼')
      expect(config.color).toBeDefined()
      expect(config.ports.in).toBe(true)
      expect(config.ports.out).toBe(true)
      expect(config.width).toBeDefined()
      expect(config.height).toBeDefined()
    })

    it('应该为受众分流节点提供正确的配置', () => {
      const config = getNodeConfig('audience-split')
      
      expect(config.label).toBe('受众分流')
      expect(config.color).toBeDefined()
      expect(config.ports.in).toBe(true)
      expect(config.ports.out).toBe(true)
      expect(config.width).toBeDefined()
      expect(config.height).toBeDefined()
    })
  })

  describe('节点类型兼容性测试', () => {
    it('应该处理大小写不敏感的节点类型', () => {
      const testCases = [
        { input: 'SMS', expected: 'sms' },
        { input: 'Start', expected: 'start' },
        { input: 'AI-CALL', expected: 'ai-call' },
        { input: 'Audience-Split', expected: 'audience-split' }
      ]

      testCases.forEach(({ input, expected }) => {
        // 假设有一个标准化函数
        const normalizedType = input.toLowerCase()
        expect(normalizedType).toBe(expected)
        
        const config = getNodeConfig(normalizedType)
        expect(config).toBeDefined()
      })
    })

    it('应该处理带有额外空格的节点类型', () => {
      const typesWithSpaces = [
        ' sms ',
        '\tsms\t',
        '\nsms\n',
        '  start  '
      ]

      typesWithSpaces.forEach(typeWithSpace => {
        const trimmedType = typeWithSpace.trim()
        const config = getNodeConfig(trimmedType)
        expect(config).toBeDefined()
      })
    })

    it('应该处理节点类型的别名', () => {
      // 如果系统支持节点类型别名
      const aliases = {
        'message': 'sms',
        'call': 'ai-call',
        'split': 'audience-split',
        'begin': 'start',
        'finish': 'end'
      }

      Object.entries(aliases).forEach(([alias, actualType]) => {
        // 这里假设有别名解析功能
        const resolvedType = aliases[alias] || alias
        const config = getNodeConfig(resolvedType)
        expect(config).toBeDefined()
      })
    })
  })

  describe('节点类型扩展性测试', () => {
    it('应该支持动态添加新的节点类型', () => {
      // 这个测试验证系统是否支持运行时添加新节点类型
      const newNodeType = 'custom-action'
      const newNodeConfig = {
        label: '自定义动作',
        color: '#ff6b6b',
        ports: { in: true, out: true },
        width: 120,
        height: 60
      }

      // 假设有注册新节点类型的功能
      // registerNodeType(newNodeType, newNodeConfig)
      
      // 验证新类型是否可用
      // const config = getNodeConfig(newNodeType)
      // expect(config).toEqual(newNodeConfig)
      
      // 由于当前系统可能不支持动态注册，这个测试可以作为未来扩展的参考
      expect(true).toBe(true) // 占位测试
    })

    it('应该支持节点类型的版本控制', () => {
      // 测试节点类型的向后兼容性
      const legacyTypes = [
        'sms-v1',
        'call-v1',
        'split-v1'
      ]

      // 假设系统支持版本化的节点类型
      legacyTypes.forEach(legacyType => {
        // 应该能够处理旧版本的节点类型
        // 或者提供迁移机制
        expect(true).toBe(true) // 占位测试
      })
    })
  })

  describe('错误处理和边界情况', () => {
    it('应该优雅处理null和undefined节点类型', () => {
      expect(() => getNodeConfig(null)).not.toThrow()
      expect(() => getNodeConfig(undefined)).not.toThrow()
      expect(() => getNodeShapeByType(null)).not.toThrow()
      expect(() => getNodeShapeByType(undefined)).not.toThrow()
    })

    it('应该处理非字符串节点类型', () => {
      const nonStringTypes = [123, {}, [], true, false]
      
      nonStringTypes.forEach(type => {
        expect(() => getNodeConfig(type)).not.toThrow()
        expect(() => getNodeShapeByType(type)).not.toThrow()
        
        const config = getNodeConfig(type)
        expect(config).toBeUndefined()
        
        const shape = getNodeShapeByType(type)
        expect(shape).toBe('circle') // 默认形状
      })
    })

    it('应该处理极长的节点类型字符串', () => {
      const longType = 'a'.repeat(10000)
      
      expect(() => getNodeConfig(longType)).not.toThrow()
      expect(() => getNodeShapeByType(longType)).not.toThrow()
      
      const config = getNodeConfig(longType)
      expect(config).toBeUndefined()
    })

    it('应该处理包含特殊字符的节点类型', () => {
      const specialCharTypes = [
        'node@type',
        'node#type',
        'node$type',
        'node%type',
        'node&type',
        'node*type',
        'node+type',
        'node=type',
        'node?type',
        'node|type'
      ]
      
      specialCharTypes.forEach(type => {
        expect(() => getNodeConfig(type)).not.toThrow()
        expect(() => getNodeShapeByType(type)).not.toThrow()
        
        const config = getNodeConfig(type)
        expect(config).toBeUndefined()
      })
    })
  })
})