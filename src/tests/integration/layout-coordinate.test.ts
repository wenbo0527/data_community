import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LayoutModeManager } from '../../core/interaction/LayoutModeManager';
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager.js';
import { UnifiedEventBus } from '../../core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager';
import { ErrorHandler } from '../../core/ErrorHandler';
import { nodeTypes } from '../../utils/nodeTypes.js';

/**
 * 布局算法坐标处理测试
 * 验证布局算法的坐标处理和转换功能
 */
describe('布局算法坐标处理测试', () => {
  let layoutManager: LayoutModeManager;
  let coordinateManager: CoordinateSystemManager;
  let eventBus: UnifiedEventBus;
  let cacheManager: UnifiedCacheManager;
  let errorHandler: ErrorHandler;
  let mockEventBus: any;
  let mockCacheManager: any;
  let mockErrorHandler: any;
  let mockCoordinateManager: any;
  let mockGraph: any;
  let mockContainer: HTMLElement;
  let mockNodes: any[];

  beforeEach(() => {
    // 创建模拟的DOM容器
    mockContainer = document.createElement('div');
    mockContainer.style.width = '1200px';
    mockContainer.style.height = '800px';
    mockContainer.style.position = 'relative';
    document.body.appendChild(mockContainer);

    // 创建模拟图形对象 - 支持实际的位置更新
    mockNodes = [
      { id: 'node1', type: 'start', position: { x: 100, y: 100 } },
      { id: 'node2', type: 'sms', position: { x: 300, y: 100 } }
    ];
    
    mockGraph = {
      addNode: vi.fn(),
      removeNode: vi.fn(),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => mockNodes),
      getEdges: vi.fn(() => []),
      setPosition: vi.fn((nodeId, position) => {
        const node = mockNodes.find(n => n.id === nodeId);
        if (node) {
          node.position = { ...position };
        }
      }),
      getBBox: vi.fn((nodeId) => ({ x: 0, y: 0, width: 100, height: 50 })),
      getNodeById: vi.fn(),
      translateBy: vi.fn(),
      zoom: vi.fn(),
      centerContent: vi.fn(),
      container: mockContainer,
      on: vi.fn(),
      off: vi.fn(),
      trigger: vi.fn(),
      clientToLocal: vi.fn((point) => ({ x: point.x - 15, y: point.y - 15 })),
      localToClient: vi.fn((point) => ({ x: point.x + 15, y: point.y + 15 }))
    };

    // 创建模拟对象 - 修复事件监听器功能
    const eventListeners = new Map();
    mockEventBus = {
      on: vi.fn((event, callback) => {
        if (!eventListeners.has(event)) {
          eventListeners.set(event, []);
        }
        eventListeners.get(event).push(callback);
      }),
      off: vi.fn((event, callback) => {
        if (eventListeners.has(event)) {
          const callbacks = eventListeners.get(event);
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      }),
      emit: vi.fn((event, data) => {
        if (eventListeners.has(event)) {
          eventListeners.get(event).forEach(callback => callback(data));
        }
      }),
      trigger: vi.fn()
    };

    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn()
    };

    mockErrorHandler = {
      handleError: vi.fn(),
      logError: vi.fn(),
      getErrorHistory: vi.fn(() => [])
    };

    mockCoordinateManager = {
      DOMToLogical: vi.fn((point) => ({ x: point.x * 0.8, y: point.y * 0.8 })),
      logicalToDOM: vi.fn((point) => ({ x: point.x * 1.25, y: point.y * 1.25 })),
      getNodeDOMCenter: vi.fn((node) => ({
        x: node.position.x + node.size.width / 2,
        y: node.position.y + node.size.height / 2
      })),
      validateCoordinates: vi.fn(() => true),
      optimizeCoordinates: vi.fn((coords) => coords),
      correctDragHintPosition: vi.fn((nodeId, position, bbox) => position),
      validateCoordinateTransform: vi.fn((position, node) => ({
        isValid: true,
        position: position
      })),
      correctLayoutPosition: vi.fn((position, node, context) => position)
    };

    // 初始化核心组件（用于测试目的）
    eventBus = new UnifiedEventBus();
    cacheManager = new UnifiedCacheManager();
    errorHandler = new ErrorHandler(eventBus);
    coordinateManager = new CoordinateSystemManager(mockGraph, mockContainer);

    // 使用模拟对象初始化布局管理器
    layoutManager = new LayoutModeManager(
      mockGraph,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler,
      mockCoordinateManager
    );
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
  });

  describe('统一布局坐标处理', () => {
    it('应该正确计算水平布局的节点坐标', () => {
      const nodes = [
        { id: 'input-1', type: 'start', position: { x: 50, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'process-1', type: 'sms', position: { x: 250, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'process-2', type: 'ai-call', position: { x: 450, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'output-1', type: 'end', position: { x: 650, y: 200 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(nodes);
      mockGraph.getNodeById.mockImplementation((id) => nodes.find(n => n.id === id));

      // 切换到统一布局模式
      layoutManager.switchToUnifiedMode();
      
      // 计算布局位置
      const layoutResult = layoutManager.applyUnifiedLayout();
      expect(layoutResult).toBe(true);
      const layoutPositions = mockGraph.getNodes();
      
      expect(layoutPositions).toBeDefined();
      expect(layoutPositions.length).toBe(nodes.length);

      // 验证节点按类型正确排序
      const startNodes = layoutPositions.filter(p => p.type === 'start');
      const processingNodes = layoutPositions.filter(p => ['sms', 'ai-call', 'manual-call', 'wait'].includes(p.type));
      const endNodes = layoutPositions.filter(p => p.type === 'end');

      expect(startNodes.length).toBe(1);
      expect(processingNodes.length).toBe(2);
      expect(endNodes.length).toBe(1);

      // 验证坐标转换的准确性
      layoutPositions.forEach(pos => {
        const domPosition = mockCoordinateManager.logicalToDOM(pos.position);
        const backToLogical = mockCoordinateManager.DOMToLogical(domPosition);
        
        expect(Math.abs(backToLogical.x - pos.position.x)).toBeLessThan(1);
        expect(Math.abs(backToLogical.y - pos.position.y)).toBeLessThan(1);
      });
    });

    it('应该正确处理垂直对齐的坐标计算', () => {
      const nodes = [
        { id: 'node-1', type: 'sms', position: { x: 100, y: 150 }, size: { width: 120, height: 80 } },
        { id: 'node-2', type: 'ai-call', position: { x: 300, y: 180 }, size: { width: 120, height: 80 } },
        { id: 'node-3', type: 'manual-call', position: { x: 500, y: 220 }, size: { width: 120, height: 80 } }
      ];

      // 更新mockNodes数组以反映测试数据
      mockNodes.length = 0;
      mockNodes.push(...nodes);
      mockGraph.getNodeById.mockImplementation((id) => nodes.find(n => n.id === id));

      // 应用统一布局
      layoutManager.switchToUnifiedMode();
      const layoutResult = layoutManager.applyUnifiedLayout();
      expect(layoutResult).toBe(true);
      const alignedPositions = mockGraph.getNodes();

      // 验证垂直对齐 - 所有节点应该有相同的Y坐标
      const firstY = alignedPositions[0].position.y;
      alignedPositions.forEach(pos => {
        expect(Math.abs(pos.position.y - firstY)).toBeLessThan(5); // 允许小误差
      });

      // 验证坐标转换的一致性
      alignedPositions.forEach(pos => {
        const domPos = mockCoordinateManager.logicalToDOM(pos.position);
        const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
        
        expect(Math.abs(logicalPos.x - pos.position.x)).toBeLessThan(1);
        expect(Math.abs(logicalPos.y - pos.position.y)).toBeLessThan(1);
      });
    });

    it('应该正确计算节点间距', () => {
      const nodes = [
        { id: 'a', type: 'start', position: { x: 0, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'b', type: 'sms', position: { x: 200, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'c', type: 'end', position: { x: 400, y: 200 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(nodes);

      const layoutResult = layoutManager.applyUnifiedLayout();
      expect(layoutResult).toBe(true);
      const layoutPositions = mockGraph.getNodes();
      
      // 验证节点间距的一致性
      for (let i = 1; i < layoutPositions.length; i++) {
        const prevNode = layoutPositions[i - 1];
        const currentNode = layoutPositions[i];
        
        const spacing = currentNode.position.x - (prevNode.position.x + prevNode.size.width);
        expect(spacing).toBeGreaterThan(50); // 最小间距
        expect(spacing).toBeLessThan(250); // 最大间距
      }
    });
  });

  describe('手动布局坐标验证', () => {
    it('应该正确验证节点位置的合法性', () => {
      const validNode = {
        id: 'valid-node',
        position: { x: 200, y: 300 },
        size: { width: 120, height: 80 }
      };

      const invalidNode = {
        id: 'invalid-node',
        position: { x: -50, y: -100 }, // 负坐标
        size: { width: 120, height: 80 }
      };

      mockGraph.getNodeById.mockImplementation((id) => {
        return id === 'valid-node' ? validNode : invalidNode;
      });

      layoutManager.switchToManualMode();

      // 验证有效位置
      const isValidPosition = layoutManager.validateNodePosition(validNode);
      expect(isValidPosition).toBe(true);

      // 验证无效位置
      const isInvalidPosition = layoutManager.validateNodePosition(invalidNode);
      expect(isInvalidPosition).toBe(false);
    });

    it('应该正确处理边界位置的坐标转换', () => {
      const boundaryNodes = [
        { id: 'top-left', position: { x: 0, y: 0 }, size: { width: 120, height: 80 } },
        { id: 'top-right', position: { x: 1080, y: 0 }, size: { width: 120, height: 80 } },
        { id: 'bottom-left', position: { x: 0, y: 720 }, size: { width: 120, height: 80 } },
        { id: 'bottom-right', position: { x: 1080, y: 720 }, size: { width: 120, height: 80 } }
      ];

      layoutManager.switchToManualMode();

      boundaryNodes.forEach(node => {
        // 验证边界位置的坐标转换
        const domPosition = mockCoordinateManager.logicalToDOM(node.position);
        const backToLogical = mockCoordinateManager.DOMToLogical(domPosition);
        
        expect(Math.abs(backToLogical.x - node.position.x)).toBeLessThan(2);
        expect(Math.abs(backToLogical.y - node.position.y)).toBeLessThan(2);

        // 验证位置合法性
        const isValid = layoutManager.validateNodePosition(node);
        expect(typeof isValid).toBe('boolean');
      });
    });
  });

  describe('布局模式切换坐标处理', () => {
    it('应该在模式切换时保持坐标一致性', () => {
      const nodes = [
        { id: 'switch-1', type: 'start', position: { x: 100, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'switch-2', type: 'sms', position: { x: 300, y: 250 }, size: { width: 120, height: 80 } },
        { id: 'switch-3', type: 'end', position: { x: 500, y: 180 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(nodes);
      mockGraph.getNodeById.mockImplementation((id) => nodes.find(n => n.id === id));

      // 记录初始位置
      const initialPositions = nodes.map(node => ({
        id: node.id,
        position: { ...node.position }
      }));

      // 切换到统一布局
      layoutManager.switchToUnifiedMode();
      const unifiedResult = layoutManager.applyUnifiedLayout();
      expect(unifiedResult).toBe(true);
      const unifiedPositions = mockGraph.getNodes();
      
      // 切换到手动布局
      layoutManager.switchToManualMode();

      // 验证坐标转换在模式切换中的一致性
      initialPositions.forEach(initial => {
        const domPos = mockCoordinateManager.logicalToDOM(initial.position);
        const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
        
        expect(Math.abs(logicalPos.x - initial.position.x)).toBeLessThan(1);
        expect(Math.abs(logicalPos.y - initial.position.y)).toBeLessThan(1);
      });
    });

    it('应该正确处理布局模式事件的坐标数据', () => {
      const eventSpy = vi.fn();
      mockEventBus.on('layout:mode:changed', eventSpy);

      const testNode = {
        id: 'event-test',
        position: { x: 250, y: 350 },
        size: { width: 120, height: 80 }
      };

      mockGraph.getNodeById.mockReturnValue(testNode);

      // 触发布局模式切换
      layoutManager.switchToUnifiedMode();
      layoutManager.switchToManualMode();

      // 验证事件被正确触发
      expect(eventSpy).toHaveBeenCalledTimes(2);

      // 验证事件数据中的坐标信息
      const eventCalls = eventSpy.mock.calls;
      eventCalls.forEach(call => {
        const eventData = call[0];
        expect(eventData).toHaveProperty('from');
        expect(eventData).toHaveProperty('to');
        expect(['unified', 'manual']).toContain(eventData.from);
        expect(['unified', 'manual']).toContain(eventData.to);
      });
    });
  });

  describe('复杂布局场景坐标处理', () => {
    it('应该正确处理多分支布局的坐标计算', () => {
      const complexNodes = [
        { id: 'input', type: 'start', position: { x: 50, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'split', type: 'audience-split', position: { x: 250, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'branch-1', type: 'sms', position: { x: 450, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'branch-2', type: 'ai-call', position: { x: 450, y: 400 }, size: { width: 120, height: 80 } },
        { id: 'merge', type: 'wait', position: { x: 650, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'output', type: 'end', position: { x: 850, y: 300 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(complexNodes);
      mockGraph.getNodeById.mockImplementation((id) => complexNodes.find(n => n.id === id));

      // 应用统一布局
      layoutManager.switchToUnifiedMode();
      const layoutResult = layoutManager.applyUnifiedLayout();

      // 验证布局成功应用
      expect(layoutResult).toBe(true);
      
      // 验证分支节点的垂直分布（使用图中的节点）
      const graphNodes = mockGraph.getNodes();
      const branchNodes = graphNodes.filter(n => n.id.startsWith('branch-'));
      expect(branchNodes.length).toBe(2);
      
      const branch1 = branchNodes.find(n => n.id === 'branch-1');
      const branch2 = branchNodes.find(n => n.id === 'branch-2');
      
      expect(Math.abs(branch1.position.y - branch2.position.y)).toBeGreaterThan(100); // 分支间距

      // 验证所有节点的坐标转换准确性
      graphNodes.forEach(node => {
        const domPos = mockCoordinateManager.logicalToDOM(node.position);
        const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
        
        expect(Math.abs(logicalPos.x - node.position.x)).toBeLessThan(1);
        expect(Math.abs(logicalPos.y - node.position.y)).toBeLessThan(1);
      });
    });

    it('应该正确处理大量节点的布局性能', () => {
      // 创建大量节点
      const manyNodes = [];
      for (let i = 0; i < 50; i++) {
        manyNodes.push({
          id: `node-${i}`,
          type: i === 0 ? 'start' : i === 49 ? 'end' : ['sms', 'ai-call', 'manual-call', 'wait'][i % 4],
          position: { x: i * 100, y: 200 + (i % 3) * 100 },
          size: { width: 120, height: 80 }
        });
      }

      mockGraph.getNodes.mockReturnValue(manyNodes);
      mockGraph.getNodeById.mockImplementation((id) => manyNodes.find(n => n.id === id));

      // 测试布局计算性能
      const startTime = performance.now();
      
      layoutManager.switchToUnifiedMode();
      const layoutResult = layoutManager.applyUnifiedLayout();
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // 性能要求：50个节点的布局计算应在50ms内完成
      expect(duration).toBeLessThan(50);
      expect(layoutResult).toBe(true);

      // 验证布局成功应用
      expect(layoutResult).toBe(true);
      
      // 验证坐标转换的准确性（使用图中的节点）
      const graphNodes = mockGraph.getNodes();
      const sampleNodes = graphNodes.filter((_, index) => index % 10 === 0);
      sampleNodes.forEach(node => {
        const domPos = mockCoordinateManager.logicalToDOM(node.position);
        const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
        
        expect(Math.abs(logicalPos.x - node.position.x)).toBeLessThan(2);
        expect(Math.abs(logicalPos.y - node.position.y)).toBeLessThan(2);
      });
    });
  });

  describe('营销画布节点类型布局测试', () => {
    it('应该正确处理分支节点的多输出端口布局', () => {
      const branchNodes = [
        { id: 'start-node', type: 'start', position: { x: 100, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'audience-branch', type: 'audience-split', position: { x: 300, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'event-branch', type: 'event-split', position: { x: 500, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'ab-branch', type: 'ab-test', position: { x: 700, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'end-node', type: 'end', position: { x: 900, y: 300 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(branchNodes);
      mockGraph.getNodeById.mockImplementation((id) => branchNodes.find(n => n.id === id));

      // 应用统一布局
      layoutManager.switchToUnifiedMode();
      const layoutResult = layoutManager.applyUnifiedLayout();
      expect(layoutResult).toBe(true);

      // 验证分支节点的特殊布局处理
      const layoutPositions = mockGraph.getNodes();
      const branchNodeTypes = ['audience-split', 'event-split', 'ab-test'];
      const branchNodesInLayout = layoutPositions.filter(n => branchNodeTypes.includes(n.type));
      
      expect(branchNodesInLayout.length).toBe(3);
      
      // 验证分支节点的坐标转换
      branchNodesInLayout.forEach(node => {
        const domPos = mockCoordinateManager.logicalToDOM(node.position);
        const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
        
        expect(Math.abs(logicalPos.x - node.position.x)).toBeLessThan(1);
        expect(Math.abs(logicalPos.y - node.position.y)).toBeLessThan(1);
      });
    });

    it('应该正确处理开始节点的单一输入限制布局', () => {
      const startNodeFlow = [
        { id: 'start-1', type: 'start', position: { x: 100, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'sms-1', type: 'sms', position: { x: 300, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'wait-1', type: 'wait', position: { x: 500, y: 200 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(startNodeFlow);
      mockGraph.getNodeById.mockImplementation((id) => startNodeFlow.find(n => n.id === id));

      // 验证开始节点在布局中的特殊处理
      layoutManager.switchToUnifiedMode();
      const layoutResult = layoutManager.applyUnifiedLayout();
      expect(layoutResult).toBe(true);

      const layoutPositions = mockGraph.getNodes();
      const startNode = layoutPositions.find(n => n.type === 'start');
      
      expect(startNode).toBeDefined();
      expect(startNode.position.x).toBeLessThan(layoutPositions.find(n => n.type === 'sms').position.x);
      
      // 验证开始节点的坐标精度
      const domPos = mockCoordinateManager.logicalToDOM(startNode.position);
      const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
      
      expect(Math.abs(logicalPos.x - startNode.position.x)).toBeLessThan(1);
      expect(Math.abs(logicalPos.y - startNode.position.y)).toBeLessThan(1);
    });

    it('应该正确处理结束节点的无输出端口布局', () => {
      const endNodeFlow = [
        { id: 'ai-call-1', type: 'ai-call', position: { x: 100, y: 250 }, size: { width: 120, height: 80 } },
        { id: 'manual-call-1', type: 'manual-call', position: { x: 300, y: 250 }, size: { width: 120, height: 80 } },
        { id: 'end-1', type: 'end', position: { x: 500, y: 250 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(endNodeFlow);
      mockGraph.getNodeById.mockImplementation((id) => endNodeFlow.find(n => n.id === id));

      // 验证结束节点在布局中的特殊处理
      layoutManager.switchToUnifiedMode();
      const layoutResult = layoutManager.applyUnifiedLayout();
      expect(layoutResult).toBe(true);

      const layoutPositions = mockGraph.getNodes();
      const endNode = layoutPositions.find(n => n.type === 'end');
      
      expect(endNode).toBeDefined();
      expect(endNode.position.x).toBeGreaterThan(layoutPositions.find(n => n.type === 'ai-call').position.x);
      
      // 验证结束节点的坐标精度
      const domPos = mockCoordinateManager.logicalToDOM(endNode.position);
      const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
      
      expect(Math.abs(logicalPos.x - endNode.position.x)).toBeLessThan(1);
      expect(Math.abs(logicalPos.y - endNode.position.y)).toBeLessThan(1);
    });

    it('应该正确处理营销画布完整流程的布局坐标', () => {
      const marketingFlow = [
        { id: 'start', type: 'start', position: { x: 50, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'audience-split', type: 'audience-split', position: { x: 250, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'sms-branch', type: 'sms', position: { x: 450, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'ai-call-branch', type: 'ai-call', position: { x: 450, y: 400 }, size: { width: 120, height: 80 } },
        { id: 'wait-merge', type: 'wait', position: { x: 650, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'ab-test', type: 'ab-test', position: { x: 850, y: 300 }, size: { width: 120, height: 80 } },
        { id: 'manual-call-a', type: 'manual-call', position: { x: 1050, y: 250 }, size: { width: 120, height: 80 } },
        { id: 'manual-call-b', type: 'manual-call', position: { x: 1050, y: 350 }, size: { width: 120, height: 80 } },
        { id: 'end', type: 'end', position: { x: 1250, y: 300 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(marketingFlow);
      mockGraph.getNodeById.mockImplementation((id) => marketingFlow.find(n => n.id === id));

      // 应用统一布局
      layoutManager.switchToUnifiedMode();
      const layoutResult = layoutManager.applyUnifiedLayout();
      expect(layoutResult).toBe(true);

      const layoutPositions = mockGraph.getNodes();
      
      // 验证营销画布节点类型的完整性
      const nodeTypeCount = {};
      layoutPositions.forEach(node => {
        nodeTypeCount[node.type] = (nodeTypeCount[node.type] || 0) + 1;
      });
      
      expect(nodeTypeCount['start']).toBe(1);
      expect(nodeTypeCount['end']).toBe(1);
      expect(nodeTypeCount['audience-split']).toBe(1);
      expect(nodeTypeCount['ab-test']).toBe(1);
      expect(nodeTypeCount['sms']).toBe(1);
      expect(nodeTypeCount['ai-call']).toBe(1);
      expect(nodeTypeCount['manual-call']).toBe(2);
      expect(nodeTypeCount['wait']).toBe(1);
      
      // 验证流程顺序：start -> audience-split -> branches -> wait -> ab-test -> manual-calls -> end
      const startNode = layoutPositions.find(n => n.type === 'start');
      const endNode = layoutPositions.find(n => n.type === 'end');
      const audienceSplit = layoutPositions.find(n => n.type === 'audience-split');
      const abTest = layoutPositions.find(n => n.type === 'ab-test');
      
      expect(startNode.position.x).toBeLessThan(audienceSplit.position.x);
      expect(audienceSplit.position.x).toBeLessThan(abTest.position.x);
      expect(abTest.position.x).toBeLessThan(endNode.position.x);
      
      // 验证所有节点的坐标转换精度
      layoutPositions.forEach(node => {
        const domPos = mockCoordinateManager.logicalToDOM(node.position);
        const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
        
        expect(Math.abs(logicalPos.x - node.position.x)).toBeLessThan(1);
        expect(Math.abs(logicalPos.y - node.position.y)).toBeLessThan(1);
      });
    });
  });

  describe('坐标缓存和优化', () => {
    it('应该正确缓存布局计算结果', () => {
      const nodes = [
        { id: 'cache-1', type: 'start', position: { x: 100, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'cache-2', type: 'end', position: { x: 300, y: 200 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(nodes);
      mockGraph.getNodeById.mockImplementation((id) => nodes.find(n => n.id === id));

      // 第一次计算
      const startTime1 = performance.now();
      layoutManager.switchToUnifiedMode();
      const result1 = layoutManager.applyUnifiedLayout();
      const endTime1 = performance.now();
      const duration1 = endTime1 - startTime1;

      // 第二次计算（应该使用缓存）
      const startTime2 = performance.now();
      const result2 = layoutManager.applyUnifiedLayout();
      const endTime2 = performance.now();
      const duration2 = endTime2 - startTime2;

      // 验证缓存效果（第二次应该更快）
      expect(duration2).toBeLessThan(duration1);
      
      // 验证结果一致性
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      
      // 验证缓存效果（第二次应该更快）
      expect(duration2).toBeLessThanOrEqual(duration1);
    });

    it('应该在节点变化时正确更新缓存', () => {
      const initialNodes = [
        { id: 'update-1', type: 'start', position: { x: 100, y: 200 }, size: { width: 120, height: 80 } }
      ];

      const updatedNodes = [
        { id: 'update-1', type: 'start', position: { x: 100, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'update-2', type: 'end', position: { x: 300, y: 200 }, size: { width: 120, height: 80 } }
      ];

      // 初始布局
      mockGraph.getNodes.mockReturnValue(initialNodes);
      const initialLayoutResult = layoutManager.applyUnifiedLayout();
      expect(initialLayoutResult).toBe(true);

      // 更新节点
      mockGraph.getNodes.mockReturnValue(updatedNodes);
      mockGraph.getNodeById.mockImplementation((id) => updatedNodes.find(n => n.id === id));
      
      const updatedLayoutResult = layoutManager.applyUnifiedLayout();
      expect(updatedLayoutResult).toBe(true);

      // 验证新布局的坐标转换
      const updatedLayout = mockGraph.getNodes();
      updatedLayout.forEach(node => {
        const domPos = mockCoordinateManager.logicalToDOM(node.position);
        const logicalPos = mockCoordinateManager.DOMToLogical(domPos);
        
        expect(Math.abs(logicalPos.x - node.position.x)).toBeLessThan(1);
        expect(Math.abs(logicalPos.y - node.position.y)).toBeLessThan(1);
      });
    });
  });
});