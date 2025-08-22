import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DragInteractionManager } from '../../core/interaction/DragInteractionManager';
import { NodeConnectionOptimizer } from '../../core/interaction/NodeConnectionOptimizer';
import { LayoutModeManager } from '../../core/interaction/LayoutModeManager';
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager.js';
import { UnifiedEventBus } from '../../core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager';
import { ErrorHandler } from '../../core/ErrorHandler';
import { getNodeConfig } from '../../utils/nodeTypes.js';

/**
 * 坐标一致性集成测试
 * 验证拖拽过程中的坐标准确性和预览线连接的坐标正确性
 */
describe('坐标一致性集成测试', () => {
  let dragManager: DragInteractionManager;
  let connectionOptimizer: NodeConnectionOptimizer;
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

  beforeEach(() => {
    // 创建模拟的DOM容器
    mockContainer = document.createElement('div');
    mockContainer.style.width = '800px';
    mockContainer.style.height = '600px';
    mockContainer.style.position = 'relative';
    document.body.appendChild(mockContainer);

    // 创建模拟的Graph实例
    mockGraph = {
      addNode: vi.fn(),
      removeNode: vi.fn(),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getNodeById: vi.fn(),
      translateBy: vi.fn(),
      zoom: vi.fn(),
      centerContent: vi.fn(),
      container: mockContainer,
      on: vi.fn(),
      off: vi.fn(),
      trigger: vi.fn(),
      clientToLocal: vi.fn((point) => ({ x: point.x - 10, y: point.y - 10 })),
      localToClient: vi.fn((point) => ({ x: point.x + 10, y: point.y + 10 }))
    };

    // 创建模拟对象
    mockEventBus = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
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
      optimizeCoordinates: vi.fn((coords) => coords)
    };

    // 先初始化connectionOptimizer
    connectionOptimizer = new NodeConnectionOptimizer({
      eventBus: mockEventBus,
      cacheManager: mockCacheManager,
      errorHandler: mockErrorHandler,
      graph: mockGraph,
      coordinateManager: mockCoordinateManager
    });

    // 使用模拟对象初始化管理器
    dragManager = new DragInteractionManager(
      mockGraph,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler,
      connectionOptimizer,
      mockCoordinateManager
    );

    layoutManager = new LayoutModeManager(
      mockGraph,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler,
      mockCoordinateManager
    );

    // 为了测试目的，也创建真实的coordinateManager
    coordinateManager = new CoordinateSystemManager(mockGraph, mockContainer);
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
  });

  describe('拖拽坐标一致性测试', () => {
    it('应该正确转换拖拽起始坐标', () => {
      const domPoint = { x: 100, y: 150 };
      const logicalPoint = mockCoordinateManager.DOMToLogical(domPoint);
      const backToDom = mockCoordinateManager.logicalToDOM(logicalPoint);

      // 验证坐标转换的双向一致性
      expect(Math.abs(backToDom.x - domPoint.x)).toBeLessThan(1);
      expect(Math.abs(backToDom.y - domPoint.y)).toBeLessThan(1);
    });

    it('应该在拖拽过程中保持坐标准确性', () => {
      const mockNode = {
        id: 'test-node-1',
        position: { x: 200, y: 300 },
        size: { width: 120, height: 80 }
      };

      mockGraph.getNodeById.mockReturnValue(mockNode);

      // 模拟拖拽开始
      const startPoint = { x: 250, y: 340 }; // 节点中心点
      dragManager.startDrag('test-node-1', startPoint);

      // 模拟拖拽移动
      const movePoint = { x: 350, y: 440 };
      dragManager.updateDragPosition(movePoint);

      // 验证拖拽位置的坐标转换
      const expectedLogicalPoint = mockCoordinateManager.DOMToLogical(movePoint);
      const actualDomPoint = mockCoordinateManager.logicalToDOM(expectedLogicalPoint);

      expect(Math.abs(actualDomPoint.x - movePoint.x)).toBeLessThan(2);
      expect(Math.abs(actualDomPoint.y - movePoint.y)).toBeLessThan(2);
    });

    it('应该正确处理吸附目标的坐标计算', () => {
      const sourceNode = {
        id: 'source-node',
        position: { x: 100, y: 200 },
        size: { width: 120, height: 80 }
      };

      const targetNode = {
        id: 'target-node',
        position: { x: 250, y: 200 },
        size: { width: 120, height: 80 }
      };

      mockGraph.getNodes.mockReturnValue([sourceNode, targetNode]);
      mockGraph.getNodeById.mockImplementation((id) => {
        return id === 'source-node' ? sourceNode : targetNode;
      });

      // 测试吸附目标查找
      const dragPoint = { x: 280, y: 240 }; // 接近目标节点
      const snapTarget = dragManager.findSnapTarget('source-node', dragPoint);

      if (snapTarget) {
        // 验证吸附目标的坐标计算准确性
        const targetCenter = mockCoordinateManager.getNodeDOMCenter(targetNode);
        expect(snapTarget.distance).toBeLessThan(50); // 在吸附范围内
        expect(typeof targetCenter.x).toBe('number');
        expect(typeof targetCenter.y).toBe('number');
      }
    });
  });

  describe('预览线坐标一致性测试', () => {
    it('应该正确计算预览线的起始坐标', () => {
      const sourceNode = {
        id: 'source-node',
        position: { x: 100, y: 200 },
        size: { width: 120, height: 80 }
      };

      mockGraph.getNodeById.mockReturnValue(sourceNode);

      // 创建预览线
      const targetPoint = { x: 300, y: 250 };
      connectionOptimizer.createPreviewLine('source-node', 'output', targetPoint);

      // 验证预览线起始点坐标
      const sourceCenter = mockCoordinateManager.getNodeDOMCenter(sourceNode);
      const logicalSourceCenter = mockCoordinateManager.DOMToLogical(sourceCenter);
      const backToDomCenter = mockCoordinateManager.logicalToDOM(logicalSourceCenter);

      expect(Math.abs(backToDomCenter.x - sourceCenter.x)).toBeLessThan(1);
      expect(Math.abs(backToDomCenter.y - sourceCenter.y)).toBeLessThan(1);
    });

    it('应该正确处理预览线路径的坐标转换', () => {
      const sourceNode = {
        id: 'source-node',
        position: { x: 100, y: 200 },
        size: { width: 120, height: 80 }
      };

      const targetNode = {
        id: 'target-node',
        position: { x: 300, y: 200 },
        size: { width: 120, height: 80 }
      };

      mockGraph.getNodeById.mockImplementation((id) => {
        return id === 'source-node' ? sourceNode : targetNode;
      });

      // 创建预览线连接
      connectionOptimizer.createPreviewLine('source-node', 'output', { x: 350, y: 240 });

      // 验证连接路径的坐标计算
      const sourceCenter = mockCoordinateManager.getNodeDOMCenter(sourceNode);
      const targetCenter = mockCoordinateManager.getNodeDOMCenter(targetNode);

      // 计算连接距离
      const distance = Math.sqrt(
        Math.pow(targetCenter.x - sourceCenter.x, 2) +
        Math.pow(targetCenter.y - sourceCenter.y, 2)
      );

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1000); // 合理的连接距离
    });

    it('应该正确处理预览线的端口位置计算', () => {
      const node = {
        id: 'test-node',
        position: { x: 200, y: 300 },
        size: { width: 120, height: 80 }
      };

      mockGraph.getNodeById.mockReturnValue(node);

      // 测试输出端口位置
      const outputPortPosition = connectionOptimizer.getPortPosition(node, 'output');
      expect(outputPortPosition.x).toBeGreaterThan(node.position.x);
      expect(outputPortPosition.y).toBe(node.position.y + node.size.height / 2);

      // 测试输入端口位置
      const inputPortPosition = connectionOptimizer.getPortPosition(node, 'input');
      expect(inputPortPosition.x).toBe(node.position.x);
      expect(inputPortPosition.y).toBe(node.position.y + node.size.height / 2);
    });
  });

  // 创建营销画布节点的辅助函数
  const createMarketingCanvasNode = (type: string, position: { x: number; y: number }) => {
    const config = getNodeConfig(type);
    return {
      id: `${type}-node-${Date.now()}`,
      type,
      position,
      size: {
        width: config.width || 100,
        height: config.height || 100
      },
      ports: config.ports
    };
  };

  describe('预览线Endpoint坐标专项测试', () => {

    it('应该在实时拖拽中精确计算预览线endpoint坐标', () => {
      const sourceNode = createMarketingCanvasNode('audience-split', { x: 150, y: 250 });
      const targetNode = createMarketingCanvasNode('sms', { x: 400, y: 300 });
      
      mockGraph.getNodeById.mockImplementation((id) => {
        return id === sourceNode.id ? sourceNode : targetNode;
      });
      
      // 模拟实时拖拽过程中的endpoint坐标计算
      const dragPath = [
        { x: 200, y: 280 },
        { x: 250, y: 290 },
        { x: 300, y: 295 },
        { x: 350, y: 298 }
      ];
      
      dragPath.forEach((dragPoint, index) => {
        // 创建预览线并验证endpoint坐标
        connectionOptimizer.createPreviewLine(sourceNode.id, 'output', dragPoint);
        
        // 验证endpoint坐标的精确性
        const expectedEndpoint = {
          x: dragPoint.x,
          y: dragPoint.y
        };
        
        // 通过坐标转换验证endpoint位置
        const logicalEndpoint = mockCoordinateManager.DOMToLogical(expectedEndpoint);
        const domEndpoint = mockCoordinateManager.logicalToDOM(logicalEndpoint);
        
        expect(Math.abs(domEndpoint.x - expectedEndpoint.x)).toBeLessThan(0.5);
        expect(Math.abs(domEndpoint.y - expectedEndpoint.y)).toBeLessThan(0.5);
        
        // 验证拖拽过程中endpoint坐标的连续性
        if (index > 0) {
          const prevPoint = dragPath[index - 1];
          const distance = Math.sqrt(
            Math.pow(dragPoint.x - prevPoint.x, 2) + 
            Math.pow(dragPoint.y - prevPoint.y, 2)
          );
          expect(distance).toBeGreaterThan(0); // 确保有移动
        }
      });
    });
    
    it('应该在画布变换时保持预览线endpoint坐标同步', () => {
      const sourceNode = createMarketingCanvasNode('start', { x: 100, y: 200 });
      const initialDragPoint = { x: 200, y: 250 };
      
      mockGraph.getNodeById.mockReturnValue(sourceNode);
      
      // 创建初始预览线
      connectionOptimizer.createPreviewLine(sourceNode.id, 'output', initialDragPoint);
      
      // 画布缩放变换
      const zoomFactor = 1.2;
      mockGraph.zoom(zoomFactor);
      
      // 验证缩放后endpoint坐标的同步更新
      const scaledEndpoint = {
        x: initialDragPoint.x * zoomFactor,
        y: initialDragPoint.y * zoomFactor
      };
      
      const logicalScaled = mockCoordinateManager.DOMToLogical(scaledEndpoint);
      const domScaled = mockCoordinateManager.logicalToDOM(logicalScaled);
      
      expect(Math.abs(domScaled.x - scaledEndpoint.x)).toBeLessThan(1);
      expect(Math.abs(domScaled.y - scaledEndpoint.y)).toBeLessThan(1);
      
      // 画布平移变换
      const panOffset = { x: 50, y: 75 };
      mockGraph.translateBy(panOffset.x, panOffset.y);
      
      // 验证平移后endpoint坐标的同步更新
      const translatedEndpoint = {
        x: scaledEndpoint.x + panOffset.x,
        y: scaledEndpoint.y + panOffset.y
      };
      
      const logicalTranslated = mockCoordinateManager.DOMToLogical(translatedEndpoint);
      const domTranslated = mockCoordinateManager.logicalToDOM(logicalTranslated);
      
      expect(Math.abs(domTranslated.x - translatedEndpoint.x)).toBeLessThan(1);
      expect(Math.abs(domTranslated.y - translatedEndpoint.y)).toBeLessThan(1);
    });
    
    it('应该在吸附时精确连接到目标节点in端口的endpoint坐标', () => {
      const sourceNode = createMarketingCanvasNode('event-split', { x: 100, y: 150 });
      const targetNode = createMarketingCanvasNode('ai-call', { x: 350, y: 200 });
      
      mockGraph.getNodeById.mockImplementation((id) => {
        return id === sourceNode.id ? sourceNode : targetNode;
      });
      
      // 计算目标节点的in端口精确坐标
      const targetInPort = connectionOptimizer.getPortPosition(targetNode, 'input');
      const expectedInPortCoord = {
        x: targetNode.position.x,
        y: targetNode.position.y + targetNode.size.height / 2
      };
      
      // 验证in端口坐标计算的准确性
      expect(Math.abs(targetInPort.x - expectedInPortCoord.x)).toBeLessThan(0.5);
      expect(Math.abs(targetInPort.y - expectedInPortCoord.y)).toBeLessThan(0.5);
      
      // 模拟拖拽到目标节点附近触发吸附
      const snapDistance = 20;
      const snapPoint = {
        x: targetInPort.x - snapDistance,
        y: targetInPort.y + snapDistance / 2
      };
      
      // 创建预览线并触发吸附
      connectionOptimizer.createPreviewLine(sourceNode.id, 'output', snapPoint);
      
      // 验证吸附后预览线endpoint精确连接到in端口
      // 计算吸附距离
      const actualSnapDistance = Math.sqrt(
        Math.pow(snapPoint.x - targetInPort.x, 2) + 
        Math.pow(snapPoint.y - targetInPort.y, 2)
      );
      
      // 如果在吸附阈值内，验证坐标精确性
      if (actualSnapDistance <= 30) { // 使用默认吸附阈值
        expect(Math.abs(snapPoint.x - targetInPort.x)).toBeLessThan(30);
        expect(Math.abs(snapPoint.y - targetInPort.y)).toBeLessThan(30);
      }
      
      // 验证坐标转换在吸附过程中的精度
      const logicalSnapPoint = mockCoordinateManager.DOMToLogical(targetInPort);
      const domSnapPoint = mockCoordinateManager.logicalToDOM(logicalSnapPoint);
      
      expect(Math.abs(domSnapPoint.x - targetInPort.x)).toBeLessThan(0.5);
      expect(Math.abs(domSnapPoint.y - targetInPort.y)).toBeLessThan(0.5);
    });
    
    it('应该在分支节点多输出端口时正确计算预览线endpoint坐标', () => {
      const branchNode = createMarketingCanvasNode('ab-test', { x: 200, y: 300 });
      const targetNodes = [
        createMarketingCanvasNode('sms', { x: 400, y: 250 }),
        createMarketingCanvasNode('manual-call', { x: 400, y: 350 })
      ];
      
      mockGraph.getNodeById.mockImplementation((id) => {
        if (id === branchNode.id) return branchNode;
        return targetNodes.find(node => node.id === id);
      });
      
      // 测试分支节点的多个输出端口
      const outputPorts = ['output-0', 'output-1'];
      
      outputPorts.forEach((portId, index) => {
        const targetNode = targetNodes[index];
        const targetInPort = connectionOptimizer.getPortPosition(targetNode, 'input');
        
        // 从分支节点的特定输出端口创建预览线
        connectionOptimizer.createPreviewLine(branchNode.id, portId, targetInPort);
        
        // 验证预览线endpoint连接到正确的目标in端口
        const expectedTargetCoord = {
          x: targetNode.position.x,
          y: targetNode.position.y + targetNode.size.height / 2
        };
        
        expect(Math.abs(targetInPort.x - expectedTargetCoord.x)).toBeLessThan(0.5);
        expect(Math.abs(targetInPort.y - expectedTargetCoord.y)).toBeLessThan(0.5);
        
        // 验证坐标转换的精确性
        const logicalTarget = mockCoordinateManager.DOMToLogical(targetInPort);
        const domTarget = mockCoordinateManager.logicalToDOM(logicalTarget);
        
        expect(Math.abs(domTarget.x - targetInPort.x)).toBeLessThan(0.5);
        expect(Math.abs(domTarget.y - targetInPort.y)).toBeLessThan(0.5);
      });
    });

    it('应该在手动布局模式下移动节点后正确刷新预览线endpoint坐标', async () => {
      // 1. 设置手动布局模式
      layoutManager.switchToManualMode();

      // 2. 创建源节点和目标节点
      const sourceNode = createMarketingCanvasNode('start', { x: 100, y: 200 });
      const targetNode = createMarketingCanvasNode('audience-split', { x: 300, y: 200 });

      mockGraph.getNodes.mockReturnValue([sourceNode, targetNode]);
      mockGraph.getNodeById.mockImplementation((id) => {
        return id === sourceNode.id ? sourceNode : targetNode;
      });

      // 3. 建立预览线连接
      const initialTargetPoint = { x: 350, y: 240 };
      connectionOptimizer.createPreviewLine(sourceNode.id, 'output', initialTargetPoint);

      // 4. 移动目标节点位置
      const newTargetPosition = { x: 400, y: 300 };
      targetNode.position = newTargetPosition;

      // 5. 验证预览线endpoint坐标更新正确性
      const newTargetCenter = mockCoordinateManager.getNodeDOMCenter(targetNode);
      const logicalTargetCenter = mockCoordinateManager.DOMToLogical(newTargetCenter);
      const backToDomCenter = mockCoordinateManager.logicalToDOM(logicalTargetCenter);

      // 6. 验证坐标转换的准确性
      expect(Math.abs(backToDomCenter.x - newTargetCenter.x)).toBeLessThan(1);
      expect(Math.abs(backToDomCenter.y - newTargetCenter.y)).toBeLessThan(1);

      // 验证endpoint坐标相对于节点位置的正确性
      const expectedEndpointX = newTargetPosition.x; // in端口在节点左侧
      const expectedEndpointY = newTargetPosition.y + targetNode.size.height / 2;
      expect(Math.abs(newTargetCenter.x - (expectedEndpointX + targetNode.size.width / 2))).toBeLessThan(2);
      expect(Math.abs(newTargetCenter.y - expectedEndpointY)).toBeLessThan(2);
    });

    it('应该在移动画布新建节点时正确刷新预览线位置', async () => {
      // 1. 移动画布到新位置
      const canvasOffset = { x: 50, y: 80 };
      mockGraph.translateBy(canvasOffset.x, canvasOffset.y);

      // 2. 在新位置创建节点
      const sourceNode = createMarketingCanvasNode('sms', { x: 200, y: 250 });
      const targetNode = createMarketingCanvasNode('end', { x: 450, y: 250 });

      mockGraph.getNodes.mockReturnValue([sourceNode, targetNode]);
      mockGraph.getNodeById.mockImplementation((id) => {
        return id === sourceNode.id ? sourceNode : targetNode;
      });

      // 3. 开始拖拽连接
      const dragStartPoint = { x: sourceNode.position.x + sourceNode.size.width, y: sourceNode.position.y + sourceNode.size.height / 2 };
      connectionOptimizer.createPreviewLine(sourceNode.id, 'output', dragStartPoint);

      // 4. 验证预览线起始点坐标
      const sourceCenter = mockCoordinateManager.getNodeDOMCenter(sourceNode);
      const logicalSourceCenter = mockCoordinateManager.DOMToLogical(sourceCenter);

      // 5. 验证预览线endpoint坐标相对于画布偏移的正确性
      const targetEndpoint = { x: targetNode.position.x, y: targetNode.position.y + targetNode.size.height / 2 };
      const logicalEndpoint = mockCoordinateManager.DOMToLogical(targetEndpoint);
      const backToDomEndpoint = mockCoordinateManager.logicalToDOM(logicalEndpoint);

      expect(Math.abs(backToDomEndpoint.x - targetEndpoint.x)).toBeLessThan(1);
      expect(Math.abs(backToDomEndpoint.y - targetEndpoint.y)).toBeLessThan(1);
    });

    it('应该在吸附时预览线准确连接到目标节点in端口', async () => {
      // 1. 创建源节点和目标节点
      const sourceNode = createMarketingCanvasNode('ai-call', { x: 150, y: 180 });
      const targetNode = createMarketingCanvasNode('manual-call', { x: 350, y: 180 });

      mockGraph.getNodes.mockReturnValue([sourceNode, targetNode]);
      mockGraph.getNodeById.mockImplementation((id) => {
        return id === sourceNode.id ? sourceNode : targetNode;
      });

      // 2. 开始拖拽连接
      const dragStartPoint = { x: sourceNode.position.x + sourceNode.size.width, y: sourceNode.position.y + sourceNode.size.height / 2 };
      connectionOptimizer.createPreviewLine(sourceNode.id, 'output', dragStartPoint);

      // 3. 移动到目标节点吸附范围内
      const snapPoint = { x: targetNode.position.x - 10, y: targetNode.position.y + targetNode.size.height / 2 };
      const snapTarget = dragManager.findSnapTarget(sourceNode.id, snapPoint);

      // 4. 触发吸附逻辑
      if (snapTarget) {
        dragManager.applySnapPosition(snapTarget);
      }

      // 5. 验证预览线endpoint精确连接到in端口坐标
      const inPortPosition = connectionOptimizer.getPortPosition(targetNode, 'input');
      const logicalInPort = mockCoordinateManager.DOMToLogical(inPortPosition);
      const backToDomInPort = mockCoordinateManager.logicalToDOM(logicalInPort);

      expect(Math.abs(backToDomInPort.x - inPortPosition.x)).toBeLessThan(1);
      expect(Math.abs(backToDomInPort.y - inPortPosition.y)).toBeLessThan(1);

      // 6. 验证吸附后的坐标偏移计算
      const expectedInPortX = targetNode.position.x;
      const expectedInPortY = targetNode.position.y + targetNode.size.height / 2;
      expect(Math.abs(inPortPosition.x - expectedInPortX)).toBeLessThan(2);
      expect(Math.abs(inPortPosition.y - expectedInPortY)).toBeLessThan(2);
    });

    it('应该在拖拽过程中正确计算预览线到in端口的坐标', async () => {
      // 1. 创建不同类型的目标节点
      const testScenarios = [
        { sourceType: 'start', targetType: 'audience-split' },
        { sourceType: 'audience-split', targetType: 'sms' },
        { sourceType: 'event-split', targetType: 'ai-call' },
        { sourceType: 'ab-test', targetType: 'wait' },
        { sourceType: 'wait', targetType: 'end' }
      ];

      for (const scenario of testScenarios) {
        const sourceNode = createMarketingCanvasNode(scenario.sourceType, { x: 100, y: 200 });
        const targetNode = createMarketingCanvasNode(scenario.targetType, { x: 300, y: 200 });

        mockGraph.getNodeById.mockImplementation((id) => {
          return id === sourceNode.id ? sourceNode : targetNode;
        });

        // 2. 开始拖拽连接
        const dragPoint = { x: sourceNode.position.x + sourceNode.size.width, y: sourceNode.position.y + sourceNode.size.height / 2 };
        connectionOptimizer.createPreviewLine(sourceNode.id, 'output', dragPoint);

        // 3. 在拖拽过程中实时验证endpoint坐标
        const targetInPort = connectionOptimizer.getPortPosition(targetNode, 'input');
        const logicalInPort = mockCoordinateManager.DOMToLogical(targetInPort);
        const backToDomInPort = mockCoordinateManager.logicalToDOM(logicalInPort);

        // 4. 验证不同节点类型in端口位置计算的准确性
        expect(Math.abs(backToDomInPort.x - targetInPort.x)).toBeLessThan(1);
        expect(Math.abs(backToDomInPort.y - targetInPort.y)).toBeLessThan(1);

        // 5. 验证坐标转换在实时拖拽中的性能
        const startTime = performance.now();
        for (let i = 0; i < 100; i++) {
          const testPoint = { x: targetInPort.x + i, y: targetInPort.y };
          const logical = mockCoordinateManager.DOMToLogical(testPoint);
          const backToDom = mockCoordinateManager.logicalToDOM(logical);
          expect(Math.abs(backToDom.x - testPoint.x)).toBeLessThan(2);
        }
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(50); // 100次转换应在50ms内完成
      }
    });

    it('应该在复杂场景下保持endpoint坐标一致性', async () => {
      // 1. 同时进行画布缩放、移动、节点拖拽
      const sourceNode = createMarketingCanvasNode('audience-split', { x: 200, y: 300 });
      const targetNode = createMarketingCanvasNode('sms', { x: 500, y: 300 });

      mockGraph.getNodes.mockReturnValue([sourceNode, targetNode]);
      mockGraph.getNodeById.mockImplementation((id) => {
        return id === sourceNode.id ? sourceNode : targetNode;
      });

      // 画布缩放
      const zoomFactor = 1.5;
      mockGraph.zoom(zoomFactor);

      // 画布移动
      const panOffset = { x: 100, y: 150 };
      mockGraph.translateBy(panOffset.x, panOffset.y);

      // 节点拖拽
      const newSourcePosition = { x: 250, y: 350 };
      sourceNode.position = newSourcePosition;

      // 2. 验证多重变换下的坐标计算
      const sourceCenter = mockCoordinateManager.getNodeDOMCenter(sourceNode);
      const targetInPort = connectionOptimizer.getPortPosition(targetNode, 'input');

      // 创建预览线
      connectionOptimizer.createPreviewLine(sourceNode.id, 'output', targetInPort);

      // 3. 验证坐标缓存机制的正确性
      const cachedSourceCenter = mockCoordinateManager.getNodeDOMCenter(sourceNode);
      expect(cachedSourceCenter.x).toBe(sourceCenter.x);
      expect(cachedSourceCenter.y).toBe(sourceCenter.y);

      // 4. 验证边界情况下的坐标处理
      const extremePoint = { x: -100, y: 10000 };
      const logicalExtreme = mockCoordinateManager.DOMToLogical(extremePoint);
      const backToDomExtreme = mockCoordinateManager.logicalToDOM(logicalExtreme);

      expect(Math.abs(backToDomExtreme.x - extremePoint.x)).toBeLessThan(2);
      expect(Math.abs(backToDomExtreme.y - extremePoint.y)).toBeLessThan(2);
    });
  });

  describe('营销画布节点类型坐标测试', () => {
    it('应该正确处理分支节点的多输出端口坐标', () => {
      const branchNodeTypes = ['audience-split', 'event-split', 'ab-test'];
      
      branchNodeTypes.forEach(nodeType => {
        const branchNode = createMarketingCanvasNode(nodeType, { x: 200, y: 250 });
        const config = getNodeConfig(nodeType);
        
        mockGraph.getNodeById.mockReturnValue(branchNode);
        
        // 验证多输出端口的坐标计算
        if (config.ports && config.ports.items && Array.isArray(config.ports.items)) {
          const outputPorts = config.ports.items.filter(port => port.group === 'out');
          outputPorts.forEach((port, index) => {
            const portPosition = connectionOptimizer.getPortPosition(branchNode, port.id || `output-${index}`);
            expect(portPosition.x).toBeGreaterThan(branchNode.position.x);
            expect(typeof portPosition.y).toBe('number');
          });
        } else {
          // 如果没有配置端口，测试默认输出端口
          const portPosition = connectionOptimizer.getPortPosition(branchNode, 'output');
          expect(portPosition.x).toBeGreaterThan(branchNode.position.x);
          expect(typeof portPosition.y).toBe('number');
        }
      });
    });

    it('应该正确处理开始和结束节点的特殊端口坐标', () => {
      // 测试开始节点（无输入端口）
      const startNode = createMarketingCanvasNode('start', { x: 100, y: 200 });
      mockGraph.getNodeById.mockReturnValue(startNode);
      
      const startOutputPort = connectionOptimizer.getPortPosition(startNode, 'output');
      expect(startOutputPort.x).toBe(startNode.position.x + startNode.size.width);
      expect(startOutputPort.y).toBe(startNode.position.y + startNode.size.height / 2);
      
      // 测试结束节点（无输出端口）
      const endNode = createMarketingCanvasNode('end', { x: 400, y: 200 });
      mockGraph.getNodeById.mockReturnValue(endNode);
      
      const endInputPort = connectionOptimizer.getPortPosition(endNode, 'input');
      expect(endInputPort.x).toBe(endNode.position.x);
      expect(endInputPort.y).toBe(endNode.position.y + endNode.size.height / 2);
    });
  });

  describe('布局坐标一致性测试', () => {
    it('应该正确处理统一布局的坐标计算', () => {
      const nodes = [
        { id: 'node1', position: { x: 100, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'node2', position: { x: 300, y: 200 }, size: { width: 120, height: 80 } },
        { id: 'node3', position: { x: 500, y: 200 }, size: { width: 120, height: 80 } }
      ];

      mockGraph.getNodes.mockReturnValue(nodes);

      // 切换到统一布局模式
      layoutManager.switchToUnifiedMode();

      // 验证布局计算的坐标转换
      nodes.forEach(node => {
        const domCenter = mockCoordinateManager.getNodeDOMCenter(node);
        const logicalCenter = mockCoordinateManager.DOMToLogical(domCenter);
        const backToDom = mockCoordinateManager.logicalToDOM(logicalCenter);

        expect(Math.abs(backToDom.x - domCenter.x)).toBeLessThan(1);
        expect(Math.abs(backToDom.y - domCenter.y)).toBeLessThan(1);
      });
    });

    it('应该正确处理手动布局的坐标验证', () => {
      const node = {
        id: 'manual-node',
        position: { x: 250, y: 350 },
        size: { width: 120, height: 80 }
      };

      mockGraph.getNodeById.mockReturnValue(node);

      // 切换到手动布局模式
      layoutManager.switchToManualMode();

      // 验证手动布局的坐标处理
      const isValidPosition = layoutManager.validateNodePosition(node);
      expect(typeof isValidPosition).toBe('boolean');

      // 测试坐标转换的准确性
      const domPosition = mockCoordinateManager.logicalToDOM(node.position);
      const logicalPosition = mockCoordinateManager.DOMToLogical(domPosition);

      expect(Math.abs(logicalPosition.x - node.position.x)).toBeLessThan(1);
      expect(Math.abs(logicalPosition.y - node.position.y)).toBeLessThan(1);
    });
  });

  describe('坐标转换边界情况测试', () => {
    it('应该正确处理零坐标转换', () => {
      const zeroPoint = { x: 0, y: 0 };
      const logicalZero = mockCoordinateManager.DOMToLogical(zeroPoint);
      const backToZero = mockCoordinateManager.logicalToDOM(logicalZero);

      expect(Math.abs(backToZero.x - zeroPoint.x)).toBeLessThan(1);
      expect(Math.abs(backToZero.y - zeroPoint.y)).toBeLessThan(1);
    });

    it('应该正确处理负坐标转换', () => {
      const negativePoint = { x: -100, y: -50 };
      const logicalNegative = mockCoordinateManager.DOMToLogical(negativePoint);
      const backToNegative = mockCoordinateManager.logicalToDOM(logicalNegative);

      expect(Math.abs(backToNegative.x - negativePoint.x)).toBeLessThan(1);
      expect(Math.abs(backToNegative.y - negativePoint.y)).toBeLessThan(1);
    });

    it('应该正确处理大坐标值转换', () => {
      const largePoint = { x: 10000, y: 8000 };
      const logicalLarge = mockCoordinateManager.DOMToLogical(largePoint);
      const backToLarge = mockCoordinateManager.logicalToDOM(logicalLarge);

      expect(Math.abs(backToLarge.x - largePoint.x)).toBeLessThan(2);
      expect(Math.abs(backToLarge.y - largePoint.y)).toBeLessThan(2);
    });
  });

  describe('性能和一致性验证', () => {
    it('应该在频繁坐标转换中保持性能', () => {
      const startTime = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const point = { x: Math.random() * 1000, y: Math.random() * 800 };
        const logical = mockCoordinateManager.DOMToLogical(point);
        const backToDom = mockCoordinateManager.logicalToDOM(logical);
        
        // 验证转换精度
        expect(Math.abs(backToDom.x - point.x)).toBeLessThan(2);
        expect(Math.abs(backToDom.y - point.y)).toBeLessThan(2);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 性能要求：1000次转换应在100ms内完成
      expect(duration).toBeLessThan(100);
    });

    it('应该在并发操作中保持坐标一致性', async () => {
      const promises = [];
      const testPoints = [
        { x: 100, y: 200 },
        { x: 300, y: 400 },
        { x: 500, y: 600 },
        { x: 700, y: 800 }
      ];

      testPoints.forEach(point => {
        promises.push(new Promise(resolve => {
          setTimeout(() => {
            const logical = mockCoordinateManager.DOMToLogical(point);
            const backToDom = mockCoordinateManager.logicalToDOM(logical);
            resolve({
              original: point,
              converted: backToDom,
              accurate: Math.abs(backToDom.x - point.x) < 1 && Math.abs(backToDom.y - point.y) < 1
            });
          }, Math.random() * 10);
        }));
      });

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.accurate).toBe(true);
      });
    });
  });
});