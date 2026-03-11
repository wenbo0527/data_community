import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Graph, Node, Edge } from '@antv/x6';
import { DeletionCascadeHandler } from '../../managers/publish/DeletionCascadeHandler';
import { UnifiedEventBus } from '../../core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager';
import { ErrorHandler } from '../../core/ErrorHandler';

describe('DeletionCascadeHandler', () => {
  let deletionHandler: DeletionCascadeHandler;
  let mockCanvas: Graph;
  let mockEventBus: UnifiedEventBus;
  let mockCacheManager: UnifiedCacheManager;
  let mockErrorHandler: ErrorHandler;
  let mockNodes: Map<string, Node>;
  let mockEdges: Map<string, Edge>;

  beforeEach(() => {
    // 创建模拟节点和边的存储
    mockNodes = new Map();
    mockEdges = new Map();

    // 创建模拟画布
    mockCanvas = {
      getCellById: vi.fn((id: string) => mockNodes.get(id) || mockEdges.get(id)),
      getNodes: vi.fn(() => Array.from(mockNodes.values())),
      getEdges: vi.fn(() => Array.from(mockEdges.values())),
      getIncomingEdges: vi.fn((node: Node) => {
        return Array.from(mockEdges.values()).filter(edge => 
          edge.getTargetCellId() === node.id
        );
      }),
      getOutgoingEdges: vi.fn((node: Node) => {
        return Array.from(mockEdges.values()).filter(edge => 
          edge.getSourceCellId() === node.id
        );
      }),
      removeCell: vi.fn((cell) => {
        if (mockNodes.has(cell.id)) {
          mockNodes.delete(cell.id);
        }
        if (mockEdges.has(cell.id)) {
          mockEdges.delete(cell.id);
        }
      })
    } as any;

    // 创建模拟事件总线
    mockEventBus = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    } as any;

    // 创建模拟缓存管理器
    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    } as any;

    // 创建模拟错误处理器
    mockErrorHandler = {
      handleError: vi.fn()
    } as any;

    // 创建模拟预览线管理器
    const mockPreviewLineManager = {
      getPreviewLinesByTargetNode: vi.fn(),
      removePreviewLine: vi.fn(),
      clearPreviewLines: vi.fn()
    };

    // 创建模拟标签管理器
    const mockLabelManager = {
      removeLabel: vi.fn(),
      clearLabels: vi.fn()
    };

    // 创建模拟布局引擎
    const mockLayoutEngine = {
      updateLayout: vi.fn(),
      recalculatePositions: vi.fn()
    };

    // 创建DeletionCascadeHandler实例
    deletionHandler = new DeletionCascadeHandler(
      mockCanvas,
      mockPreviewLineManager,
      mockLabelManager,
      mockLayoutEngine,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    deletionHandler.dispose();
    mockNodes.clear();
    mockEdges.clear();
  });

  // 辅助函数：创建模拟节点
  const createMockNode = (id: string, type: string, position = { x: 0, y: 0 }) => {
    const node = {
      id,
      getData: () => ({ type }),
      getPosition: () => position,
      getSize: () => ({ width: 120, height: 60 })
    } as any;
    mockNodes.set(id, node);
    return node;
  };

  // 辅助函数：创建模拟边
  const createMockEdge = (id: string, sourceId: string, targetId: string) => {
    const edge = {
      id,
      getSourceCellId: () => sourceId,
      getTargetCellId: () => targetId
    } as any;
    mockEdges.set(id, edge);
    return edge;
  };

  describe('初始化', () => {
    it('应该正确初始化DeletionCascadeHandler', () => {
      expect(deletionHandler).toBeDefined();
      expect(mockEventBus.on).toHaveBeenCalledWith('node:deleted', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('edge:deleted', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('cascade:cleanup', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('orphan:check', expect.any(Function));
    });

    it('应该初始化处理状态为false', () => {
      expect(deletionHandler.isProcessingDeletion()).toBe(false);
    });

    it('应该初始化删除队列为空', () => {
      expect(deletionHandler.getDeletionQueueSize()).toBe(0);
    });
  });

  describe('节点删除处理', () => {
    beforeEach(() => {
      // 创建测试节点
      createMockNode('input_1', 'INPUT', { x: 100, y: 100 });
      createMockNode('processing_1', 'PROCESSING', { x: 300, y: 100 });
      createMockNode('output_1', 'OUTPUT', { x: 500, y: 100 });
      
      // 创建连接
      createMockEdge('edge_1', 'input_1', 'processing_1');
      createMockEdge('edge_2', 'processing_1', 'output_1');
    });

    it('应该处理单个节点删除', async () => {
      const nodeId = 'processing_1';
      const nodeType = 'PROCESSING';
      
      await deletionHandler.processCascadeDeletion(nodeId, nodeType);
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('cascade:node-cleaned', {
        nodeId,
        nodeType,
        timestamp: expect.any(Number)
      });
    });

    it('应该清理节点的所有连接', async () => {
      const nodeId = 'processing_1';
      
      await deletionHandler.processCascadeDeletion(nodeId, 'PROCESSING');
      
      // 验证相关边被删除
      expect(mockCanvas.removeCell).toHaveBeenCalledTimes(2); // edge_1 和 edge_2
      expect(mockEventBus.emit).toHaveBeenCalledWith('edge:deleted', {
        edgeId: 'edge_1',
        sourceId: 'input_1',
        targetId: 'processing_1'
      });
      expect(mockEventBus.emit).toHaveBeenCalledWith('edge:deleted', {
        edgeId: 'edge_2',
        sourceId: 'processing_1',
        targetId: 'output_1'
      });
    });

    it('应该清理决策节点的分支标签', async () => {
      const nodeId = 'decision_1';
      createMockNode(nodeId, 'DECISION');
      
      // 模拟分支缓存
      const branches = [
        { index: 0, condition: 'value > 100' },
        { index: 1, condition: 'value <= 100' }
      ];
      mockCacheManager.get.mockImplementation((key) => {
        if (key === `node_branches_${nodeId}`) return branches;
        return null;
      });
      
      await deletionHandler.processCascadeDeletion(nodeId, 'DECISION');
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('label:remove', {
        branchId: `${nodeId}_branch_0`
      });
      expect(mockEventBus.emit).toHaveBeenCalledWith('label:remove', {
        branchId: `${nodeId}_branch_1`
      });
      expect(mockCacheManager.delete).toHaveBeenCalledWith(`node_branches_${nodeId}`);
    });

    it('应该清理自动生成的结束节点', async () => {
      const nodeId = 'auto_end_1';
      createMockNode(nodeId, 'END');
      
      // 模拟自动生成的结束节点
      mockCacheManager.get.mockImplementation((key) => {
        if (key === `auto_end_node_${nodeId}`) return true;
        if (key === `preview_lines_target_${nodeId}`) return [];
        return null;
      });
      
      await deletionHandler.processCascadeDeletion(nodeId, 'END');
      
      expect(mockCacheManager.delete).toHaveBeenCalledWith(`auto_end_node_${nodeId}`);
      expect(mockEventBus.emit).toHaveBeenCalledWith('end-node:auto-removed', {
        nodeId
      });
    });

    it('应该清理节点相关的缓存', async () => {
      const nodeId = 'test_node';
      
      await deletionHandler.processCascadeDeletion(nodeId, 'PROCESSING');
      
      const expectedCacheKeys = [
        `node_${nodeId}`,
        `node_config_${nodeId}`,
        `node_validation_${nodeId}`,
        `node_connections_${nodeId}`,
        `node_branches_${nodeId}`,
        `node_position_${nodeId}`,
        `node_size_${nodeId}`
      ];
      
      expectedCacheKeys.forEach(key => {
        expect(mockCacheManager.delete).toHaveBeenCalledWith(key);
      });
    });

    it('应该处理强制删除模式', async () => {
      const nodeId = 'nonexistent_node';
      
      // 节点不存在，但强制删除
      await deletionHandler.processCascadeDeletion(nodeId, 'PROCESSING', true);
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('cascade:node-cleaned', {
        nodeId,
        nodeType: 'PROCESSING',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('边删除处理', () => {
    beforeEach(() => {
      createMockNode('node_1', 'INPUT');
      createMockNode('node_2', 'PROCESSING');
      createMockEdge('edge_1', 'node_1', 'node_2');
    });

    it('应该处理边删除事件', async () => {
      const event = {
        edgeId: 'edge_1',
        sourceId: 'node_1',
        targetId: 'node_2'
      };
      
      await deletionHandler['handleEdgeDeleted'](event);
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('cascade:edge-cleaned', {
        edgeId: 'edge_1',
        sourceId: 'node_1',
        targetId: 'node_2'
      });
    });

    it('应该检查目标节点是否变成孤立节点', async () => {
      const event = {
        edgeId: 'edge_1',
        sourceId: 'node_1',
        targetId: 'node_2'
      };
      
      // 模拟目标节点没有其他输入连接
      mockCanvas.getIncomingEdges.mockReturnValue([]);
      mockCacheManager.get.mockReturnValue([]);
      
      await deletionHandler['handleEdgeDeleted'](event);
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('orphan:detected', {
        nodeId: 'node_2',
        nodeType: 'PROCESSING',
        timestamp: expect.any(Number)
      });
    });

    it('应该清理边相关的缓存和预览线', async () => {
      const edgeId = 'edge_1';
      const previewLineId = 'preview_line_1';
      
      mockCacheManager.get.mockImplementation((key) => {
        if (key === `preview_line_for_edge_${edgeId}`) return previewLineId;
        return null;
      });
      
      await deletionHandler['cleanupRelatedElements'](edgeId);
      
      expect(mockCacheManager.delete).toHaveBeenCalledWith(`edge_${edgeId}`);
      expect(mockCacheManager.delete).toHaveBeenCalledWith(`edge_validation_${edgeId}`);
      expect(mockEventBus.emit).toHaveBeenCalledWith('preview:remove', {
        lineId: previewLineId
      });
    });
  });

  describe('孤立节点检测', () => {
    beforeEach(() => {
      createMockNode('input_1', 'INPUT');
      createMockNode('processing_1', 'PROCESSING');
      createMockNode('output_1', 'OUTPUT');
    });

    it('应该正确识别孤立节点', async () => {
      const nodeId = 'processing_1';
      
      // 模拟没有输入连接和预览线
      mockCanvas.getIncomingEdges.mockReturnValue([]);
      mockCacheManager.get.mockReturnValue([]);
      
      await deletionHandler['checkForOrphanNode'](nodeId);
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('orphan:detected', {
        nodeId,
        nodeType: 'PROCESSING',
        timestamp: expect.any(Number)
      });
    });

    it('应该不将INPUT节点标记为孤立节点', async () => {
      const nodeId = 'input_1';
      
      // 即使没有输入连接，INPUT节点也不应该被标记为孤立
      mockCanvas.getIncomingEdges.mockReturnValue([]);
      mockCacheManager.get.mockReturnValue([]);
      
      await deletionHandler['checkForOrphanNode'](nodeId);
      
      expect(mockEventBus.emit).not.toHaveBeenCalledWith('orphan:detected', expect.any(Object));
    });

    it('应该解除孤立节点标记当有连接时', async () => {
      const nodeId = 'processing_1';
      
      // 先标记为孤立节点
      mockCanvas.getIncomingEdges.mockReturnValue([]);
      mockCacheManager.get.mockReturnValue([]);
      await deletionHandler['checkForOrphanNode'](nodeId);
      
      // 然后添加连接
      const mockEdge = createMockEdge('edge_1', 'input_1', nodeId);
      mockCanvas.getIncomingEdges.mockReturnValue([mockEdge]);
      
      await deletionHandler['checkForOrphanNode'](nodeId);
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('orphan:resolved', {
        nodeId,
        nodeType: 'PROCESSING',
        timestamp: expect.any(Number)
      });
    });

    it('应该检查所有节点的孤立状态', async () => {
      await deletionHandler['checkAllOrphanNodes']();
      
      expect(mockCanvas.getNodes).toHaveBeenCalled();
      // 应该为每个非INPUT节点检查孤立状态
    });

    it('应该获取孤立节点列表', async () => {
      const nodeId = 'processing_1';
      
      // 标记为孤立节点
      mockCanvas.getIncomingEdges.mockReturnValue([]);
      mockCacheManager.get.mockReturnValue([]);
      await deletionHandler['checkForOrphanNode'](nodeId);
      
      const orphanNodes = deletionHandler.getOrphanNodes();
      expect(orphanNodes).toContain(nodeId);
    });

    it('应该清理所有孤立节点', async () => {
      const nodeId = 'processing_1';
      
      // 先标记为孤立节点
      mockCanvas.getIncomingEdges.mockReturnValue([]);
      mockCacheManager.get.mockReturnValue([]);
      await deletionHandler['checkForOrphanNode'](nodeId);
      
      await deletionHandler.cleanupAllOrphanNodes();
      
      expect(mockCanvas.removeCell).toHaveBeenCalled();
      expect(mockEventBus.emit).toHaveBeenCalledWith('orphan:all-cleaned', {
        cleanedCount: 1,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('预览线清理', () => {
    it('应该清理节点相关的预览线', async () => {
      const nodeId = 'test_node';
      const sourcePreviewLines = ['preview_1', 'preview_2'];
      const targetPreviewLines = ['preview_3'];
      
      mockCacheManager.get.mockImplementation((key) => {
        if (key === `preview_lines_source_${nodeId}`) return sourcePreviewLines;
        if (key === `preview_lines_target_${nodeId}`) return targetPreviewLines;
        return null;
      });
      
      await deletionHandler['cleanupPreviewLines'](nodeId);
      
      // 验证所有预览线被移除
      expect(mockEventBus.emit).toHaveBeenCalledWith('preview:remove', { lineId: 'preview_1' });
      expect(mockEventBus.emit).toHaveBeenCalledWith('preview:remove', { lineId: 'preview_2' });
      expect(mockEventBus.emit).toHaveBeenCalledWith('preview:remove', { lineId: 'preview_3' });
      
      // 验证缓存被清理
      expect(mockCacheManager.delete).toHaveBeenCalledWith(`preview_lines_source_${nodeId}`);
      expect(mockCacheManager.delete).toHaveBeenCalledWith(`preview_lines_target_${nodeId}`);
    });
  });

  describe('级联清理事件', () => {
    it('应该处理级联清理事件', async () => {
      const nodeIds = ['node_1', 'node_2', 'node_3'];
      
      await deletionHandler['handleCascadeCleanup']({ nodeIds });
      
      // 验证每个节点都被处理
      expect(mockEventBus.emit).toHaveBeenCalledTimes(nodeIds.length);
    });

    it('应该处理强制级联清理', async () => {
      const nodeIds = ['nonexistent_1', 'nonexistent_2'];
      
      await deletionHandler['handleCascadeCleanup']({ nodeIds, force: true });
      
      // 即使节点不存在，强制模式也应该处理
      expect(mockEventBus.emit).toHaveBeenCalledTimes(nodeIds.length);
    });
  });

  describe('删除队列管理', () => {
    it('应该在处理中时将删除操作加入队列', async () => {
      // 模拟正在处理状态
      deletionHandler['isProcessing'] = true;
      
      await deletionHandler['handleNodeDeleted']({ nodeId: 'test_node' });
      
      expect(deletionHandler.getDeletionQueueSize()).toBe(1);
    });

    it('应该处理队列中的删除操作', async () => {
      // 手动添加到队列
      deletionHandler['deletionQueue'].add('node_1');
      deletionHandler['deletionQueue'].add('node_2');
      
      await deletionHandler['processQueuedDeletions']();
      
      expect(deletionHandler.getDeletionQueueSize()).toBe(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理节点删除过程中的错误', async () => {
      const nodeId = 'error_node';
      
      // 模拟错误
      mockCanvas.getCellById.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      await deletionHandler['handleNodeDeleted']({ nodeId });
      
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });

    it('应该处理边删除过程中的错误', async () => {
      const event = { edgeId: 'error_edge' };
      
      // 模拟错误
      mockCacheManager.get.mockImplementation(() => {
        throw new Error('Cache error');
      });
      
      await deletionHandler['handleEdgeDeleted'](event);
      
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });

    it('应该处理孤立节点检测中的错误', async () => {
      const nodeId = 'error_node';
      
      // 创建一个有效的节点对象，确保getCellById不返回null
      const mockNode = createMockNode(nodeId, 'PROCESSING');
      mockCanvas.getCellById.mockReturnValue(mockNode);
      
      // 模拟getIncomingEdges抛出错误
      mockCanvas.getIncomingEdges.mockImplementation(() => {
        throw new Error('Graph error');
      });
      
      await deletionHandler['checkForOrphanNode'](nodeId);
      
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('资源清理', () => {
    it('应该正确清理所有资源', () => {
      deletionHandler.dispose();
      
      expect(mockEventBus.off).toHaveBeenCalledWith('node:deleted', expect.any(Function));
      expect(mockEventBus.off).toHaveBeenCalledWith('edge:deleted', expect.any(Function));
      expect(mockEventBus.off).toHaveBeenCalledWith('cascade:cleanup', expect.any(Function));
      expect(mockEventBus.off).toHaveBeenCalledWith('orphan:check', expect.any(Function));
      
      expect(deletionHandler.getDeletionQueueSize()).toBe(0);
      expect(deletionHandler.getOrphanNodes()).toHaveLength(0);
      expect(deletionHandler.isProcessingDeletion()).toBe(false);
    });
  });
});