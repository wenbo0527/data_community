import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CycleDetector } from '../../managers/publish/CycleDetector';
import { UnifiedEventBus } from '../../managers/core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../managers/core/UnifiedCacheManager';
import { ErrorHandler } from '../../managers/core/ErrorHandler';

describe('CycleDetector', () => {
  let cycleDetector: CycleDetector;
  let mockCanvas: any;
  let mockEventBus: UnifiedEventBus;
  let mockCacheManager: UnifiedCacheManager;
  let mockErrorHandler: ErrorHandler;

  beforeEach(() => {
    // Mock Canvas
    mockCanvas = {
      getNodes: vi.fn().mockReturnValue([]),
      getCellById: vi.fn(),
      getConnectedEdges: vi.fn().mockReturnValue([])
    };

    // Mock EventBus
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      removeAllListeners: vi.fn(),
      addMiddleware: vi.fn(),
      removeMiddleware: vi.fn(),
      getEventHistory: vi.fn().mockReturnValue([]),
      clearEventHistory: vi.fn(),
      getListenerCount: vi.fn().mockReturnValue(0)
    } as any;

    // Mock CacheManager
    mockCacheManager = {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      has: vi.fn(),
      keys: vi.fn(),
      size: vi.fn(),
      getStats: vi.fn()
    } as any;

    // Mock ErrorHandler
    mockErrorHandler = {
      handleError: vi.fn(),
      getErrorHistory: vi.fn().mockReturnValue([]),
      clearErrorHistory: vi.fn(),
      setErrorCallback: vi.fn(),
      getErrorStats: vi.fn()
    } as any;

    cycleDetector = new CycleDetector(
      mockCanvas,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler
    );
  });

  describe('初始化', () => {
    it('应该正确初始化CycleDetector', () => {
      expect(cycleDetector).toBeDefined();
      expect(cycleDetector.getDetectionStats().totalNodesChecked).toBe(0);
      expect(cycleDetector.getDetectionStats().cyclesFound).toBe(0);
    });
  });

  describe('循环依赖检测', () => {
    it('应该检测到简单的双节点循环', async () => {
      // 创建两个相互连接的节点
      const node1 = { id: 'node1' };
      const node2 = { id: 'node2' };
      
      const edge1to2 = {
        getTargetCellId: () => 'node2',
        target: { cell: 'node2' }
      };
      const edge2to1 = {
        getTargetCellId: () => 'node1',
        target: { cell: 'node1' }
      };
      
      mockCanvas.getNodes.mockReturnValue([node1, node2]);
      mockCanvas.getCellById.mockImplementation((id: string) => {
        return id === 'node1' ? node1 : node2;
      });
      mockCanvas.getConnectedEdges.mockImplementation((node: any, options: any) => {
        if (options?.outgoing) {
          return node.id === 'node1' ? [edge1to2] : [edge2to1];
        }
        return [];
      });
      
      const result = await cycleDetector.detectCycles();
      
      expect(result.hasCycles).toBe(true);
      expect(result.cycles).toHaveLength(1);
      expect(result.cycles[0].severity).toBe('high');
      expect(result.affectedNodes).toContain('node1');
      expect(result.affectedNodes).toContain('node2');
      expect(mockEventBus.emit).toHaveBeenCalledWith('cycle:detection:started');
      expect(mockEventBus.emit).toHaveBeenCalledWith('cycle:detected', expect.any(Object));
      expect(mockCacheManager.set).toHaveBeenCalledWith('cycle_detection_result', result, 300000);
    });

    it('应该检测到复杂的多节点循环', async () => {
      // 创建三个节点的循环: node1 -> node2 -> node3 -> node1
      const node1 = { id: 'node1' };
      const node2 = { id: 'node2' };
      const node3 = { id: 'node3' };
      
      const edge1to2 = { getTargetCellId: () => 'node2' };
      const edge2to3 = { getTargetCellId: () => 'node3' };
      const edge3to1 = { getTargetCellId: () => 'node1' };
      
      mockCanvas.getNodes.mockReturnValue([node1, node2, node3]);
      mockCanvas.getCellById.mockImplementation((id: string) => {
        switch (id) {
          case 'node1': return node1;
          case 'node2': return node2;
          case 'node3': return node3;
          default: return null;
        }
      });
      mockCanvas.getConnectedEdges.mockImplementation((node: any, options: any) => {
        if (options?.outgoing) {
          switch (node.id) {
            case 'node1': return [edge1to2];
            case 'node2': return [edge2to3];
            case 'node3': return [edge3to1];
            default: return [];
          }
        }
        return [];
      });
      
      const result = await cycleDetector.detectCycles();
      
      expect(result.hasCycles).toBe(true);
      expect(result.cycles).toHaveLength(1);
      expect(result.cycles[0].severity).toBe('medium');
      expect(result.affectedNodes).toHaveLength(3);
      expect(result.affectedNodes).toContain('node1');
      expect(result.affectedNodes).toContain('node2');
      expect(result.affectedNodes).toContain('node3');
    });

    it('应该正确处理无循环的情况', async () => {
      // 创建线性连接的节点: node1 -> node2 -> node3
      const node1 = { id: 'node1' };
      const node2 = { id: 'node2' };
      const node3 = { id: 'node3' };
      
      const edge1to2 = { getTargetCellId: () => 'node2' };
      const edge2to3 = { getTargetCellId: () => 'node3' };
      
      mockCanvas.getNodes.mockReturnValue([node1, node2, node3]);
      mockCanvas.getCellById.mockImplementation((id: string) => {
        switch (id) {
          case 'node1': return node1;
          case 'node2': return node2;
          case 'node3': return node3;
          default: return null;
        }
      });
      mockCanvas.getConnectedEdges.mockImplementation((node: any, options: any) => {
        if (options?.outgoing) {
          switch (node.id) {
            case 'node1': return [edge1to2];
            case 'node2': return [edge2to3];
            case 'node3': return [];
            default: return [];
          }
        }
        return [];
      });
      
      const result = await cycleDetector.detectCycles();
      
      expect(result.hasCycles).toBe(false);
      expect(result.cycles).toHaveLength(0);
      expect(result.affectedNodes).toHaveLength(0);
    });

    it('应该处理空画布的情况', async () => {
      mockCanvas.getNodes.mockReturnValue([]);
      
      const result = await cycleDetector.detectCycles();
      
      expect(result.hasCycles).toBe(false);
      expect(result.cycles).toHaveLength(0);
      expect(result.affectedNodes).toHaveLength(0);
    });

    it('应该处理检测过程中的错误', async () => {
      mockCanvas.getNodes.mockImplementation(() => {
        throw new Error('获取节点失败');
      });
      
      const result = await cycleDetector.detectCycles();
      
      expect(result.hasCycles).toBe(false);
      expect(result.cycles).toHaveLength(0);
      expect(result.affectedNodes).toHaveLength(0);
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('循环严重程度计算', () => {
    it('应该将双节点循环标记为高严重程度', async () => {
      const node1 = { id: 'node1' };
      const node2 = { id: 'node2' };
      
      const edge1to2 = { getTargetCellId: () => 'node2' };
      const edge2to1 = { getTargetCellId: () => 'node1' };
      
      mockCanvas.getNodes.mockReturnValue([node1, node2]);
      mockCanvas.getCellById.mockImplementation((id: string) => {
        return id === 'node1' ? node1 : node2;
      });
      mockCanvas.getConnectedEdges.mockImplementation((node: any, options: any) => {
        if (options?.outgoing) {
          return node.id === 'node1' ? [edge1to2] : [edge2to1];
        }
        return [];
      });
      
      const result = await cycleDetector.detectCycles();
      
      expect(result.cycles[0].severity).toBe('high');
    });

    it('应该将中等长度循环标记为中等严重程度', async () => {
      // 创建4个节点的循环
      const nodes = [
        { id: 'node1' },
        { id: 'node2' },
        { id: 'node3' },
        { id: 'node4' }
      ];
      
      const edges = [
        { getTargetCellId: () => 'node2' },
        { getTargetCellId: () => 'node3' },
        { getTargetCellId: () => 'node4' },
        { getTargetCellId: () => 'node1' }
      ];
      
      mockCanvas.getNodes.mockReturnValue(nodes);
      mockCanvas.getCellById.mockImplementation((id: string) => {
        return nodes.find(node => node.id === id) || null;
      });
      mockCanvas.getConnectedEdges.mockImplementation((node: any, options: any) => {
        if (options?.outgoing) {
          const index = parseInt(node.id.replace('node', '')) - 1;
          return [edges[index]];
        }
        return [];
      });
      
      const result = await cycleDetector.detectCycles();
      
      expect(result.cycles[0].severity).toBe('medium');
    });

    it('应该将长循环标记为低严重程度', async () => {
      // 创建6个节点的循环
      const nodes = Array.from({ length: 6 }, (_, i) => ({ id: `node${i + 1}` }));
      const edges = Array.from({ length: 6 }, (_, i) => ({
        getTargetCellId: () => `node${(i + 1) % 6 + 1}`
      }));
      
      mockCanvas.getNodes.mockReturnValue(nodes);
      mockCanvas.getCellById.mockImplementation((id: string) => {
        return nodes.find(node => node.id === id) || null;
      });
      mockCanvas.getConnectedEdges.mockImplementation((node: any, options: any) => {
        if (options?.outgoing) {
          const index = parseInt(node.id.replace('node', '')) - 1;
          return [edges[index]];
        }
        return [];
      });
      
      const result = await cycleDetector.detectCycles();
      
      expect(result.cycles[0].severity).toBe('low');
    });
  });

  describe('循环影响分析', () => {
    it('应该正确分析循环的影响', async () => {
      const cycles = [
        {
          nodes: ['node1', 'node2'],
          path: ['node1', 'node2', 'node1'],
          severity: 'high' as const
        },
        {
          nodes: ['node3', 'node4', 'node5'],
          path: ['node3', 'node4', 'node5', 'node3'],
          severity: 'medium' as const
        }
      ];
      
      // Mock 节点数据
      mockCanvas.getCellById.mockImplementation((id: string) => {
        return {
          id,
          getData: () => ({ flowId: `flow_${id}` })
        };
      });
      
      const impact = await cycleDetector.analyzeCycleImpact(cycles);
      
      expect(impact.criticalNodes).toHaveLength(5);
      expect(impact.criticalNodes).toContain('node1');
      expect(impact.criticalNodes).toContain('node2');
      expect(impact.criticalNodes).toContain('node3');
      expect(impact.criticalNodes).toContain('node4');
      expect(impact.criticalNodes).toContain('node5');
      
      expect(impact.recommendations).toHaveLength(2);
      expect(impact.recommendations[0].type).toBe('break_cycle');
      expect(impact.recommendations[1].type).toBe('restructure');
    });

    it('应该为高风险循环生成断开连接建议', async () => {
      const cycles = [{
        nodes: ['node1', 'node2'],
        path: ['node1', 'node2', 'node1'],
        severity: 'high' as const
      }];
      
      const impact = await cycleDetector.analyzeCycleImpact(cycles);
      
      expect(impact.recommendations[0].type).toBe('break_cycle');
      expect(impact.recommendations[0].description).toContain('断开节点');
      expect(impact.recommendations[0].affectedNodes).toEqual(['node1', 'node2']);
    });

    it('应该为中风险循环生成重构建议', async () => {
      const cycles = [{
        nodes: ['node1', 'node2', 'node3'],
        path: ['node1', 'node2', 'node3', 'node1'],
        severity: 'medium' as const
      }];
      
      const impact = await cycleDetector.analyzeCycleImpact(cycles);
      
      expect(impact.recommendations[0].type).toBe('restructure');
      expect(impact.recommendations[0].description).toContain('重新设计流程结构');
      expect(impact.recommendations[0].affectedNodes).toEqual(['node1', 'node2', 'node3']);
    });

    it('应该为低风险循环生成警告建议', async () => {
      const cycles = [{
        nodes: ['node1', 'node2', 'node3', 'node4', 'node5'],
        path: ['node1', 'node2', 'node3', 'node4', 'node5', 'node1'],
        severity: 'low' as const
      }];
      
      const impact = await cycleDetector.analyzeCycleImpact(cycles);
      
      expect(impact.recommendations[0].type).toBe('warning');
      expect(impact.recommendations[0].description).toContain('注意流程逻辑的合理性');
    });
  });

  describe('缓存管理', () => {
    it('应该缓存检测结果', async () => {
      const node1 = { id: 'node1' };
      mockCanvas.getNodes.mockReturnValue([node1]);
      mockCanvas.getCellById.mockReturnValue(node1);
      mockCanvas.getConnectedEdges.mockReturnValue([]);
      
      const result = await cycleDetector.detectCycles();
      
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'cycle_detection_result',
        result,
        300000
      );
    });

    it('应该能够获取缓存的检测结果', () => {
      const cachedResult = {
        hasCycles: true,
        cycles: [],
        affectedNodes: ['node1']
      };
      
      mockCacheManager.get.mockReturnValue(cachedResult);
      
      const result = cycleDetector.getCachedDetectionResult();
      
      expect(result).toEqual(cachedResult);
      expect(mockCacheManager.get).toHaveBeenCalledWith('cycle_detection_result');
    });

    it('应该能够清除检测缓存', () => {
      cycleDetector.clearDetectionCache();
      
      expect(mockCacheManager.delete).toHaveBeenCalledWith('cycle_detection_result');
      expect(mockEventBus.emit).toHaveBeenCalledWith('cycle:cache:cleared');
    });
  });

  describe('节点循环检查', () => {
    it('应该正确识别在循环中的节点', () => {
      const cachedResult = {
        hasCycles: true,
        cycles: [],
        affectedNodes: ['node1', 'node2']
      };
      
      mockCacheManager.get.mockReturnValue(cachedResult);
      
      expect(cycleDetector.isNodeInCycle('node1')).toBe(true);
      expect(cycleDetector.isNodeInCycle('node3')).toBe(false);
    });

    it('应该在没有缓存结果时返回false', () => {
      mockCacheManager.get.mockReturnValue(null);
      
      expect(cycleDetector.isNodeInCycle('node1')).toBe(false);
    });
  });

  describe('检测统计信息', () => {
    it('应该提供正确的检测统计信息', () => {
      const cachedResult = {
        cycles: [{ nodes: ['node1', 'node2'] }]
      };
      
      mockCacheManager.get.mockReturnValue(cachedResult);
      
      const stats = cycleDetector.getDetectionStats();
      
      expect(stats.cyclesFound).toBe(1);
      expect(stats.lastDetectionTime).toBeTypeOf('number');
    });

    it('应该在没有缓存结果时返回默认统计信息', () => {
      mockCacheManager.get.mockReturnValue(null);
      
      const stats = cycleDetector.getDetectionStats();
      
      expect(stats.cyclesFound).toBe(0);
      expect(stats.lastDetectionTime).toBeNull();
    });
  });
});