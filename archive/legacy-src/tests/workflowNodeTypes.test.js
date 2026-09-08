import { describe, it, expect, beforeEach } from 'vitest'
import {
  NodeType,
  NODE_TYPE_ICON_MAP,
  CellStatus,
  PROCESSING_TYPE_LIST,
  NODE_TYPE_LOGO,
  getPortsByType,
  getNodeTypeName,
  getNodeTypeColor,
  getNodeTypeIcon,
  getNodeTypeIconName
} from '../utils/workflowNodeTypes.js'

describe('workflowNodeTypes.js - 节点类型定义和工具函数测试', () => {
  
  describe('NodeType 枚举测试', () => {
    it('应该包含所有必要的节点类型', () => {
      expect(NodeType.INPUT).toBe('INPUT')
      expect(NodeType.FILTER).toBe('FILTER')
      expect(NodeType.JOIN).toBe('JOIN')
      expect(NodeType.UNION).toBe('UNION')
      expect(NodeType.AGG).toBe('AGG')
      expect(NodeType.OUTPUT).toBe('OUTPUT')
    })

    it('应该有6种不同的节点类型', () => {
      const nodeTypes = Object.values(NodeType)
      expect(nodeTypes).toHaveLength(6)
      expect(new Set(nodeTypes)).toHaveLength(6) // 确保没有重复
    })
  })

  describe('NODE_TYPE_ICON_MAP 测试', () => {
    it('应该为每个节点类型提供图标映射', () => {
      Object.values(NodeType).forEach(type => {
        expect(NODE_TYPE_ICON_MAP[type]).toBeDefined()
        expect(typeof NODE_TYPE_ICON_MAP[type]).toBe('object') // Vue组件
      })
    })

    it('图标映射应该包含所有节点类型', () => {
      const iconKeys = Object.keys(NODE_TYPE_ICON_MAP)
      const nodeTypeValues = Object.values(NodeType)
      expect(iconKeys.sort()).toEqual(nodeTypeValues.sort())
    })
  })

  describe('CellStatus 枚举测试', () => {
    it('应该包含所有状态类型', () => {
      expect(CellStatus.DEFAULT).toBe('default')
      expect(CellStatus.SUCCESS).toBe('success')
      expect(CellStatus.ERROR).toBe('error')
    })
  })

  describe('PROCESSING_TYPE_LIST 测试', () => {
    it('应该包含所有节点类型的配置', () => {
      expect(PROCESSING_TYPE_LIST).toHaveLength(4)
      
      const types = PROCESSING_TYPE_LIST.map(item => item.type)
      Object.values(NodeType).forEach(type => {
        expect(types).toContain(type)
      })
    })

    it('每个配置项应该包含必要的字段', () => {
      PROCESSING_TYPE_LIST.forEach(item => {
        expect(item).toHaveProperty('type')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('description')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('color')
        
        expect(typeof item.type).toBe('string')
        expect(typeof item.name).toBe('string')
        expect(typeof item.description).toBe('string')
        expect(typeof item.icon).toBe('string')
        expect(typeof item.color).toBe('string')
        expect(item.color).toMatch(/^#[0-9a-fA-F]{6}$/) // 验证颜色格式
      })
    })

    it('应该有唯一的节点类型', () => {
      const types = PROCESSING_TYPE_LIST.map(item => item.type)
      expect(new Set(types)).toHaveLength(types.length)
    })
  })

  describe('NODE_TYPE_LOGO 测试', () => {
    it('应该为每个节点类型提供Logo URL', () => {
      Object.values(NodeType).forEach(type => {
        expect(NODE_TYPE_LOGO[type]).toBeDefined()
        expect(typeof NODE_TYPE_LOGO[type]).toBe('string')
        expect(NODE_TYPE_LOGO[type]).toMatch(/^https?:\/\//)
      })
    })
  })

  describe('getPortsByType 函数测试', () => {
    const testNodeId = 'test-node-123'

    it('INPUT节点应该只有输出端口', () => {
      const ports = getPortsByType(NodeType.INPUT, testNodeId)
      expect(ports).toHaveLength(1)
      expect(ports[0]).toEqual({
        id: `${testNodeId}-out`,
        group: 'out'
      })
    })

    it('OUTPUT节点应该只有输入端口', () => {
      const ports = getPortsByType(NodeType.OUTPUT, testNodeId)
      expect(ports).toHaveLength(1)
      expect(ports[0]).toEqual({
        id: `${testNodeId}-in`,
        group: 'in'
      })
    })

    it('PROCESSING节点应该有输入和输出端口', () => {
      const ports = getPortsByType(NodeType.PROCESSING, testNodeId)
      expect(ports).toHaveLength(2)
      
      const inputPort = ports.find(p => p.group === 'in')
      const outputPort = ports.find(p => p.group === 'out')
      
      expect(inputPort).toEqual({
        id: `${testNodeId}-in`,
        group: 'in'
      })
      expect(outputPort).toEqual({
        id: `${testNodeId}-out`,
        group: 'out'
      })
    })

    it('应该处理无效的节点类型', () => {
      const ports = getPortsByType('INVALID_TYPE', testNodeId)
      expect(ports).toHaveLength(2) // 默认返回输入和输出端口
    })

    it('应该处理空的节点ID', () => {
      const ports = getPortsByType(NodeType.INPUT, '')
      expect(ports).toHaveLength(1)
      expect(ports[0].id).toBe('-out')
    })
  })

  describe('getNodeTypeName 函数测试', () => {
    it('应该返回正确的节点类型名称', () => {
      expect(getNodeTypeName(NodeType.INPUT)).toBe('数据输入')
      expect(getNodeTypeName(NodeType.PROCESSING)).toBe('数据处理')
      expect(getNodeTypeName(NodeType.OUTPUT)).toBe('数据输出')
    })

    it('应该处理未知的节点类型', () => {
      expect(getNodeTypeName('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
      expect(getNodeTypeName(null)).toBe(null)
      expect(getNodeTypeName(undefined)).toBe(undefined)
    })
  })

  describe('getNodeTypeColor 函数测试', () => {
    it('应该返回正确的节点类型颜色', () => {
      expect(getNodeTypeColor(NodeType.INPUT)).toBe('#1890ff')
      expect(getNodeTypeColor(NodeType.PROCESSING)).toBe('#52c41a')
      expect(getNodeTypeColor(NodeType.OUTPUT)).toBe('#f5222d')
    })

    it('应该为未知类型返回默认颜色', () => {
      expect(getNodeTypeColor('UNKNOWN_TYPE')).toBe('#1890ff')
      expect(getNodeTypeColor(null)).toBe('#1890ff')
      expect(getNodeTypeColor(undefined)).toBe('#1890ff')
    })

    it('返回的颜色应该是有效的十六进制格式', () => {
      Object.values(NodeType).forEach(type => {
        const color = getNodeTypeColor(type)
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })

  describe('getNodeTypeIcon 函数测试', () => {
    it('应该返回正确的图标组件', () => {
      expect(getNodeTypeIcon(NodeType.INPUT)).toBe('IconDatabase')
      expect(getNodeTypeIcon(NodeType.PROCESSING)).toBe('IconSettings')
      expect(getNodeTypeIcon(NodeType.OUTPUT)).toBe('IconExport')
    })

    it('应该为未知类型返回默认图标', () => {
      const defaultIcon = getNodeTypeIcon('UNKNOWN_TYPE')
      const inputIcon = getNodeTypeIcon(NodeType.INPUT)
      expect(defaultIcon).toBe(inputIcon)
    })
  })

  describe('getNodeTypeIconName 函数测试', () => {
    it('应该返回正确的图标名称', () => {
      expect(getNodeTypeIconName(NodeType.INPUT)).toBe('icon-database')
      expect(getNodeTypeIconName(NodeType.FILTER)).toBe('icon-filter')
      expect(getNodeTypeIconName(NodeType.JOIN)).toBe('icon-link')
      expect(getNodeTypeIconName(NodeType.UNION)).toBe('icon-union')
      expect(getNodeTypeIconName(NodeType.AGG)).toBe('icon-function')
      expect(getNodeTypeIconName(NodeType.OUTPUT)).toBe('icon-export')
    })

    it('应该为未知类型返回默认图标名称', () => {
      expect(getNodeTypeIconName('UNKNOWN_TYPE')).toBe('icon-database')
      expect(getNodeTypeIconName(null)).toBe('icon-database')
      expect(getNodeTypeIconName(undefined)).toBe('icon-database')
    })

    it('返回的图标名称应该以icon-开头', () => {
      Object.values(NodeType).forEach(type => {
        const iconName = getNodeTypeIconName(type)
        expect(iconName).toMatch(/^icon-/)
      })
    })
  })

  describe('数据一致性测试', () => {
    it('PROCESSING_TYPE_LIST中的类型应该与NodeType枚举一致', () => {
      const listTypes = PROCESSING_TYPE_LIST.map(item => item.type).sort()
      const enumTypes = Object.values(NodeType).sort()
      expect(listTypes).toEqual(enumTypes)
    })

    it('NODE_TYPE_ICON_MAP的键应该与NodeType枚举一致', () => {
      const mapKeys = Object.keys(NODE_TYPE_ICON_MAP).sort()
      const enumTypes = Object.values(NodeType).sort()
      expect(mapKeys).toEqual(enumTypes)
    })

    it('NODE_TYPE_LOGO的键应该与NodeType枚举一致', () => {
      const logoKeys = Object.keys(NODE_TYPE_LOGO).sort()
      const enumTypes = Object.values(NodeType).sort()
      expect(logoKeys).toEqual(enumTypes)
    })

    it('PROCESSING_TYPE_LIST中的颜色应该与getNodeTypeColor返回的颜色一致', () => {
      PROCESSING_TYPE_LIST.forEach(item => {
        expect(getNodeTypeColor(item.type)).toBe(item.color)
      })
    })
  })

  describe('边界条件和错误处理测试', () => {
    it('函数应该能处理null和undefined参数', () => {
      expect(() => getPortsByType(null, 'test')).not.toThrow()
      expect(() => getPortsByType(undefined, 'test')).not.toThrow()
      expect(() => getNodeTypeName(null)).not.toThrow()
      expect(() => getNodeTypeColor(undefined)).not.toThrow()
      expect(() => getNodeTypeIcon(null)).not.toThrow()
      expect(() => getNodeTypeIconName(undefined)).not.toThrow()
    })

    it('函数应该能处理空字符串参数', () => {
      expect(() => getPortsByType('', 'test')).not.toThrow()
      expect(() => getNodeTypeName('')).not.toThrow()
      expect(() => getNodeTypeColor('')).not.toThrow()
      expect(() => getNodeTypeIcon('')).not.toThrow()
      expect(() => getNodeTypeIconName('')).not.toThrow()
    })

    it('函数应该能处理非字符串参数', () => {
      expect(() => getPortsByType(123, 'test')).not.toThrow()
      expect(() => getNodeTypeName(123)).not.toThrow()
      expect(() => getNodeTypeColor({})).not.toThrow()
      expect(() => getNodeTypeIcon([])).not.toThrow()
      expect(() => getNodeTypeIconName(true)).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('函数调用应该在合理时间内完成', () => {
      const startTime = performance.now()
      
      // 执行大量函数调用
      for (let i = 0; i < 1000; i++) {
        Object.values(NodeType).forEach(type => {
          getPortsByType(type, `node-${i}`)
          getNodeTypeName(type)
          getNodeTypeColor(type)
          getNodeTypeIcon(type)
          getNodeTypeIconName(type)
        })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 1000次调用应该在100ms内完成
      expect(duration).toBeLessThan(100)
    })
  })
})