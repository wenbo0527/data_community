import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HierarchyLayoutEngine } from '../../composables/layout/HierarchyLayoutEngine.js'
import { HierarchyAdapter } from '../../composables/layout/HierarchyAdapter.js'

// Mock @antv/hierarchy
vi.mock('@antv/hierarchy', () => ({
  compactBox: vi.fn((data) => {
    // 返回模拟的布局结果，确保包含正确的节点ID
    const mockResult = {
      id: data.id || 'virtual_root',
      x: 100,
      y: 100,
      width: data.width || 100,
      height: data.height || 50,
      children: data.children?.map((child, index) => ({
        id: child.id, // 使用实际的节点ID
        x: 150 + index * 100,
        y: 200,
        width: child.width || 100,
        height: child.height || 50,
        children: child.children || []
      })) || []
    };
    return mockResult;
  })
}))

describe('HierarchyLayoutEngine', () => {
  let engine
  let mockGraph
  let mockNodes
  let mockEdges

  beforeEach(() => {
    // Mock graph instance
    mockGraph = {
      getNodes: vi.fn(),
      getEdges: vi.fn(),
      getCellById: vi.fn(),
      model: {
        updateCell: vi.fn()
      }
    }

    // Mock nodes data
    mockNodes = [
      {
        id: 'start-1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        data: { type: 'start', label: '开始' }
      },
      {
        id: 'node-1',
        position: { x: 0, y: 100 },
        size: { width: 120, height: 60 },
        data: { type: 'ai-call', label: 'AI节点' }
      }
    ]

    // Mock edges data
    mockEdges = [
      {
        id: 'edge-1',
        source: { cell: 'start-1' },
        target: { cell: 'node-1' }
      }
    ]

    mockGraph.getNodes.mockReturnValue(mockNodes)
    mockGraph.getEdges.mockReturnValue(mockEdges)

    // Create engine instance
    engine = new HierarchyLayoutEngine(mockGraph, {
      layout: {
        direction: 'TB',
        nodeSep: 100,
        rankSep: 80
      },
      performance: {
        enableOptimization: true
      }
    })
  })

  describe('基础功能测试', () => {
    it('应该正确初始化HierarchyLayoutEngine', () => {
      expect(engine).toBeDefined()
      expect(engine.options.layout.direction).toBe('TB')
      expect(engine.options.layout.nodeSep).toBe(100)
      expect(engine.options.layout.rankSep).toBe(80)
    })

    it('应该有calculateLayout方法', () => {
      expect(typeof engine.calculateLayout).toBe('function')
    })

    it('应该有updateOptions方法', () => {
      expect(typeof engine.updateOptions).toBe('function')
    })

    it('应该有getStats方法', () => {
      expect(typeof engine.getStats).toBe('function')
    })
  })

  describe('布局执行测试', () => {
    it('应该成功执行布局', async () => {
      const mockGraphData = {
        nodes: mockNodes,
        edges: mockEdges
      };
      const result = await engine.calculateLayout(mockGraphData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(result.positions).toBeDefined()
      expect(result.positions instanceof Map).toBe(true)
      expect(result.positions.size).toBeGreaterThan(0)
    })

    it('应该成功执行布局计算', async () => {
      const mockGraphData = {
        nodes: mockNodes,
        edges: mockEdges
      };
      
      const result = await engine.calculateLayout(mockGraphData);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.positions).toBeDefined();
      expect(result.positions instanceof Map).toBe(true);
      expect(result.positions.size).toBeGreaterThan(0);
    });

    it('应该处理空图数据', async () => {
       const emptyData = { nodes: [], edges: [] }
       const result = await engine.calculateLayout(emptyData)
       
       expect(result).toBeDefined()
       expect(result.success).toBe(false)
       expect(result.error).toContain('图数据为空')
       expect(result.positions instanceof Map).toBe(true)
       expect(result.positions.size).toBe(0)
     })

    it('应该在图实例为空时正确处理', async () => {
      const result = await engine.calculateLayout(null);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toContain('图实例为空');
    });

    it('应该在图数据为空时正确处理', async () => {
      const emptyGraphData = { nodes: [], edges: [] };
      const result = await engine.calculateLayout(emptyGraphData);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toContain('图数据为空');
    })
  })

  describe('配置更新测试', () => {
    it('应该正确更新配置', () => {
      const newOptions = {
        layout: {
          direction: 'LR',
          nodeSep: 100
        }
      }
      
      engine.updateOptions(newOptions)
      
      expect(engine.options.layout.direction).toBe('LR')
      expect(engine.options.layout.nodeSep).toBe(100)
    })

    it('应该保留未更新的配置项', () => {
      const originalCache = engine.options.performance.enableCache
      
      engine.updateOptions({ layout: { direction: 'LR' } })
      
      expect(engine.options.performance.enableCache).toBe(originalCache)
    })
  })

  describe('统计信息测试', () => {
    it('应该返回布局统计信息', () => {
      const stats = engine.getStats()
      
      expect(stats).toBeDefined()
      expect(typeof stats.缓存大小).toBe('number')
      expect(typeof stats.是否布局中).toBe('boolean')
      expect(stats.配置信息).toBeDefined()
    })

    it('初始状态下统计信息应该正确', () => {
      const newEngine = new HierarchyLayoutEngine()
      const stats = newEngine.getStats()
      
      expect(stats.缓存大小).toBe(0)
      expect(stats.是否布局中).toBe(false)
      expect(stats.配置信息).toBeDefined()
    })
  })

  describe('HierarchyAdapter集成测试', () => {
    it('应该能够创建HierarchyAdapter实例', () => {
      const adapter = new HierarchyAdapter()
      expect(adapter).toBeDefined()
      expect(typeof adapter.convertToHierarchyData).toBe('function')
      expect(typeof adapter.convertFromHierarchyData).toBe('function')
    })

    it('应该能够转换X6数据到hierarchy格式', () => {
      const adapter = new HierarchyAdapter()
      const graphData = { nodes: mockNodes, edges: mockEdges }
      const hierarchyData = adapter.convertToHierarchyData(graphData)
      
      expect(hierarchyData).toBeDefined()
      expect(hierarchyData.config).toBeDefined()
      expect(hierarchyData.config.direction).toBe('TB')
    })
  })
})