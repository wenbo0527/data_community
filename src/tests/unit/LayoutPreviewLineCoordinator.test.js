/**
 * LayoutPreviewLineCoordinator 单元测试
 * 验证统一布局与预览线联动的TDD测试
 * P04任务核心测试：确保点击统一布局时预览线同步执行
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LayoutPreviewLineCoordinator, getLayoutPreviewLineCoordinator, resetLayoutPreviewLineCoordinator } from '../../utils/LayoutPreviewLineCoordinator.js';

// Mock 布局引擎
class MockUnifiedStructuredLayoutEngine {
  constructor() {
    this.layoutEngineReady = false;
    this.executeLayoutImmediateCalled = false;
    this.lastExecuteOptions = null;
    this.mockLayoutResult = {
      success: true,
      performance: { executionTime: 100 },
      message: 'Mock layout executed successfully'
    };
  }
  
  async executeLayoutImmediate(options = {}) {
    this.executeLayoutImmediateCalled = true;
    this.lastExecuteOptions = options;
    
    // 模拟布局执行时间
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return this.mockLayoutResult;
  }
  
  updatePreviewManager(previewManager) {
    this.previewManager = previewManager;
  }
  
  notifyPreviewManagerReady() {
    this.layoutEngineReady = true;
    if (this.previewManager && typeof this.previewManager.processPendingCalculations === 'function') {
      this.previewManager.processPendingCalculations();
    }
  }
}

// Mock 预览线管理器
class MockUnifiedPreviewLineManager {
  constructor() {
    this.previewLines = new Map();
    this.layoutEngineReady = false;
    this.pendingCalculations = new Set();
    this.initializeExistingNodesCalled = false;
    this.recalculateAllPreviewPositionsCalled = false;
    this.syncEndpointPositionsCalled = false;
    this.processPendingCalculationsCalled = false;
  }
  
  setLayoutEngine(layoutEngine) {
    this.layoutEngine = layoutEngine;
  }
  
  initializeExistingNodes() {
    this.initializeExistingNodesCalled = true;
  }
  
  processPendingCalculations() {
    this.processPendingCalculationsCalled = true;
    this.pendingCalculations.clear();
  }
  
  recalculateAllPreviewPositions() {
    this.recalculateAllPreviewPositionsCalled = true;
  }
  
  syncEndpointPositions() {
    this.syncEndpointPositionsCalled = true;
  }
  
  // 模拟添加预览线
  addMockPreviewLine(id) {
    this.previewLines.set(id, { id, type: 'mock' });
  }
}

// Mock 图实例
class MockGraph {
  constructor() {
    this.nodes = [];
    this.edges = [];
  }
  
  getNodes() {
    return this.nodes;
  }
  
  getEdges() {
    return this.edges;
  }
  
  // 添加模拟节点
  addMockNode(id, x = 100, y = 100) {
    const node = {
      id,
      getPosition: () => ({ x, y }),
      setPosition: (pos) => { this.x = pos.x; this.y = pos.y; }
    };
    this.nodes.push(node);
    return node;
  }
}

describe('LayoutPreviewLineCoordinator', () => {
  let coordinator;
  let mockLayoutEngine;
  let mockPreviewLineManager;
  let mockGraph;
  
  beforeEach(() => {
    // 重置单例
    resetLayoutPreviewLineCoordinator();
    
    // 创建mock实例
    mockLayoutEngine = new MockUnifiedStructuredLayoutEngine();
    mockPreviewLineManager = new MockUnifiedPreviewLineManager();
    mockGraph = new MockGraph();
    
    // 创建协调器实例
    coordinator = new LayoutPreviewLineCoordinator({
      debug: { enableLogging: false }, // 测试时关闭日志
      timing: {
        preLayoutDelay: 10, // 缩短测试时间
        postLayoutDelay: 10,
        previewLineUpdateDelay: 10
      }
    });
    
    // 设置引用
    coordinator.setLayoutEngine(mockLayoutEngine);
    coordinator.setPreviewLineManager(mockPreviewLineManager);
    coordinator.setGraph(mockGraph);
  });
  
  afterEach(() => {
    if (coordinator) {
      coordinator.destroy();
    }
    resetLayoutPreviewLineCoordinator();
  });
  
  describe('🏗️ 基础功能测试', () => {
    it('应该正确初始化协调器', () => {
      expect(coordinator).toBeDefined();
      expect(coordinator.coordinationState.isCoordinating).toBe(false);
      expect(coordinator.coordinationState.coordinationCount).toBe(0);
      expect(coordinator.performanceMetrics.totalCoordinations).toBe(0);
    });
    
    it('应该正确设置和获取组件引用', () => {
      expect(coordinator.layoutEngine).toBe(mockLayoutEngine);
      expect(coordinator.previewLineManager).toBe(mockPreviewLineManager);
      expect(coordinator.graph).toBe(mockGraph);
    });
    
    it('应该正确验证组件引用', () => {
      const result = coordinator.validateComponentReferences();
      expect(result.success).toBe(true);
      expect(result.message).toBe('所有组件引用验证通过');
    });
    
    it('应该在缺少组件引用时验证失败', () => {
      coordinator.setLayoutEngine(null);
      const result = coordinator.validateComponentReferences();
      expect(result.success).toBe(false);
      expect(result.message).toContain('布局引擎引用无效');
    });
  });
  
  describe('🎯 核心协调功能测试 - P04任务关键验证', () => {
    beforeEach(() => {
      // 添加一些模拟数据
      mockGraph.addMockNode('node1', 100, 100);
      mockGraph.addMockNode('node2', 200, 200);
      mockPreviewLineManager.addMockPreviewLine('preview1');
      mockPreviewLineManager.addMockPreviewLine('preview2');
    });
    
    it('🚀 应该成功协调统一布局与预览线同步执行', async () => {
      const result = await coordinator.coordinateUnifiedLayoutWithPreviewLines();
      
      // 验证协调结果
      expect(result.success).toBe(true);
      expect(result.coordinationId).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.message).toBe('统一布局与预览线协调执行成功');
      
      // 验证布局引擎被正确调用
      expect(mockLayoutEngine.executeLayoutImmediateCalled).toBe(true);
      expect(mockLayoutEngine.lastExecuteOptions.includePreviewLines).toBe(true);
      expect(mockLayoutEngine.lastExecuteOptions.coordinationMode).toBe(true);
      
      // 验证预览线管理器方法被调用
      expect(mockPreviewLineManager.initializeExistingNodesCalled).toBe(true);
      expect(mockPreviewLineManager.recalculateAllPreviewPositionsCalled).toBe(true);
      expect(mockPreviewLineManager.syncEndpointPositionsCalled).toBe(true);
    });
    
    it('🔄 应该正确执行预布局准备阶段', async () => {
      // 添加待处理计算
      mockPreviewLineManager.pendingCalculations.add('calc1');
      
      const result = await coordinator.performPreLayoutPreparation();
      
      expect(result.success).toBe(true);
      expect(result.previewLineCount).toBe(2); // 我们添加了2个预览线
      expect(mockPreviewLineManager.initializeExistingNodesCalled).toBe(true);
      expect(mockPreviewLineManager.processPendingCalculationsCalled).toBe(true);
    });
    
    it('🏗️ 应该正确执行包含预览线集成的统一布局', async () => {
      const options = { testOption: 'test' };
      const result = await coordinator.executeUnifiedLayoutWithPreviewLineIntegration(options);
      
      expect(result.success).toBe(true);
      expect(mockLayoutEngine.executeLayoutImmediateCalled).toBe(true);
      
      // 验证传递的选项包含必要的标识
      const passedOptions = mockLayoutEngine.lastExecuteOptions;
      expect(passedOptions.includePreviewLines).toBe(true);
      expect(passedOptions.coordinationMode).toBe(true);
      expect(passedOptions.testOption).toBe('test'); // 原始选项也应该传递
    });
    
    it('🔄 应该正确执行后布局同步阶段', async () => {
      const mockLayoutResult = {
        success: true,
        performance: { executionTime: 100 }
      };
      
      const result = await coordinator.performPostLayoutSynchronization(mockLayoutResult);
      
      expect(result.success).toBe(true);
      expect(mockPreviewLineManager.recalculateAllPreviewPositionsCalled).toBe(true);
      expect(mockPreviewLineManager.syncEndpointPositionsCalled).toBe(true);
    });
    
    it('⚠️ 应该防止重复协调执行', async () => {
      // 开始第一个协调
      const promise1 = coordinator.coordinateUnifiedLayoutWithPreviewLines();
      
      // 立即开始第二个协调（应该被跳过）
      const result2 = await coordinator.coordinateUnifiedLayoutWithPreviewLines();
      
      expect(result2.success).toBe(false);
      expect(result2.skipped).toBe(true);
      expect(result2.message).toBe('协调正在进行中');
      
      // 等待第一个协调完成
      const result1 = await promise1;
      expect(result1.success).toBe(true);
    });
  });
  
  describe('🔍 同步验证测试', () => {
    it('应该正确验证同步结果 - 所有节点位置有效', () => {
      mockGraph.addMockNode('node1', 100, 100);
      mockGraph.addMockNode('node2', 200, 200);
      mockPreviewLineManager.addMockPreviewLine('preview1');
      
      const result = coordinator.validateSynchronizationResult();
      
      expect(result.success).toBe(true);
      expect(result.nodeCount).toBe(2);
      expect(result.validNodePositions).toBe(2);
      expect(result.invalidNodePositions).toBe(0);
      expect(result.previewLineCount).toBe(1);
      expect(result.message).toBe('同步验证通过');
    });
    
    it('应该检测到无效的节点位置', () => {
      // 添加有效节点
      mockGraph.addMockNode('node1', 100, 100);
      
      // 添加无效节点（NaN位置）
      const invalidNode = {
        id: 'invalid',
        getPosition: () => ({ x: NaN, y: NaN })
      };
      mockGraph.nodes.push(invalidNode);
      
      const result = coordinator.validateSynchronizationResult();
      
      expect(result.success).toBe(false);
      expect(result.nodeCount).toBe(2);
      expect(result.validNodePositions).toBe(1);
      expect(result.invalidNodePositions).toBe(1);
      expect(result.message).toContain('发现1个无效节点位置');
    });
  });
  
  describe('📊 性能监控测试', () => {
    it('应该正确更新性能指标', () => {
      coordinator.updatePerformanceMetrics(100, true);
      coordinator.updatePerformanceMetrics(200, false);
      
      const metrics = coordinator.getPerformanceMetrics();
      
      expect(metrics.totalCoordinations).toBe(2);
      expect(metrics.successfulCoordinations).toBe(1);
      expect(metrics.failedCoordinations).toBe(1);
      expect(metrics.lastCoordinationDuration).toBe(200);
      expect(metrics.averageCoordinationTime).toBe(150);
      expect(metrics.successRate).toBe('50.00%');
    });
    
    it('应该正确计算成功率', () => {
      // 3次成功，1次失败
      coordinator.updatePerformanceMetrics(100, true);
      coordinator.updatePerformanceMetrics(100, true);
      coordinator.updatePerformanceMetrics(100, true);
      coordinator.updatePerformanceMetrics(100, false);
      
      const metrics = coordinator.getPerformanceMetrics();
      expect(metrics.successRate).toBe('75.00%');
    });
  });
  
  describe('🗑️ 资源管理测试', () => {
    it('应该正确处理WeakRef引用', () => {
      // 测试正常引用
      expect(coordinator.layoutEngine).toBe(mockLayoutEngine);
      
      // 模拟垃圾回收（通过设置为null）
      coordinator._layoutEngineRef = null;
      expect(coordinator.layoutEngine).toBe(null);
    });
    
    it('应该正确销毁协调器', () => {
      coordinator.destroy();
      
      expect(coordinator._layoutEngineRef).toBe(null);
      expect(coordinator._previewLineManagerRef).toBe(null);
      expect(coordinator._graphRef).toBe(null);
      expect(coordinator.eventListeners.size).toBe(0);
      expect(coordinator.coordinationQueue.length).toBe(0);
      expect(coordinator.coordinationState.isCoordinating).toBe(false);
    });
  });
  
  describe('🔧 单例模式测试', () => {
    it('应该返回相同的单例实例', () => {
      const instance1 = getLayoutPreviewLineCoordinator();
      const instance2 = getLayoutPreviewLineCoordinator();
      
      expect(instance1).toBe(instance2);
    });
    
    it('应该正确重置单例实例', () => {
      const instance1 = getLayoutPreviewLineCoordinator();
      resetLayoutPreviewLineCoordinator();
      const instance2 = getLayoutPreviewLineCoordinator();
      
      expect(instance1).not.toBe(instance2);
    });
  });
  
  describe('🚨 错误处理测试', () => {
    it('应该处理布局执行失败', async () => {
      // 模拟布局失败
      mockLayoutEngine.mockLayoutResult = {
        success: false,
        message: 'Mock layout failed'
      };
      
      const result = await coordinator.coordinateUnifiedLayoutWithPreviewLines();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Mock layout failed');
      expect(coordinator.performanceMetrics.failedCoordinations).toBe(1);
    });
    
    it('应该处理预览线管理器异常', async () => {
      // 模拟预览线管理器方法抛出异常
      mockPreviewLineManager.recalculateAllPreviewPositions = () => {
        throw new Error('Preview line calculation failed');
      };
      
      const result = await coordinator.coordinateUnifiedLayoutWithPreviewLines();
      
      // 协调应该成功，但后布局同步可能部分失败
      expect(result.success).toBe(true); // 主要布局成功
      expect(result.postLayoutResult.success).toBe(false); // 后布局同步失败
    });
    
    it('应该处理组件引用无效的情况', async () => {
      coordinator.setLayoutEngine(null);
      
      const result = await coordinator.coordinateUnifiedLayoutWithPreviewLines();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('组件引用验证失败');
    });
  });
});

/**
 * 🎯 P04任务核心集成测试
 * 验证统一布局与预览线的完整联动流程
 */
describe('🎯 P04核心集成测试 - 统一布局与预览线联动', () => {
  let coordinator;
  let mockLayoutEngine;
  let mockPreviewLineManager;
  let mockGraph;
  
  beforeEach(() => {
    resetLayoutPreviewLineCoordinator();
    
    mockLayoutEngine = new MockUnifiedStructuredLayoutEngine();
    mockPreviewLineManager = new MockUnifiedPreviewLineManager();
    mockGraph = new MockGraph();
    
    coordinator = new LayoutPreviewLineCoordinator({
      debug: { enableLogging: false },
      timing: { preLayoutDelay: 5, postLayoutDelay: 5, previewLineUpdateDelay: 5 }
    });
    
    coordinator.setLayoutEngine(mockLayoutEngine);
    coordinator.setPreviewLineManager(mockPreviewLineManager);
    coordinator.setGraph(mockGraph);
  });
  
  afterEach(() => {
    coordinator?.destroy();
    resetLayoutPreviewLineCoordinator();
  });
  
  it('🚀 完整流程测试：点击统一布局时预览线同步执行', async () => {
    // 准备测试数据
    mockGraph.addMockNode('node1', 50, 50);
    mockGraph.addMockNode('node2', 150, 150);
    mockGraph.addMockNode('node3', 250, 250);
    
    mockPreviewLineManager.addMockPreviewLine('preview1');
    mockPreviewLineManager.addMockPreviewLine('preview2');
    mockPreviewLineManager.pendingCalculations.add('calc1');
    
    // 执行协调
    const startTime = performance.now();
    const result = await coordinator.coordinateUnifiedLayoutWithPreviewLines({
      layoutType: 'hierarchical',
      direction: 'TB'
    });
    const endTime = performance.now();
    
    // 🎯 验证核心P04需求：统一布局与预览线联动
    expect(result.success).toBe(true);
    expect(result.coordinationId).toBeDefined();
    expect(result.duration).toBeGreaterThan(0);
    
    // 验证三个阶段都成功执行
    expect(result.preLayoutResult.success).toBe(true);
    expect(result.layoutResult.success).toBe(true);
    expect(result.postLayoutResult.success).toBe(true);
    
    // 🎯 验证布局引擎调用（包含预览线集成标识）
    expect(mockLayoutEngine.executeLayoutImmediateCalled).toBe(true);
    const layoutOptions = mockLayoutEngine.lastExecuteOptions;
    expect(layoutOptions.includePreviewLines).toBe(true);
    expect(layoutOptions.coordinationMode).toBe(true);
    expect(layoutOptions.layoutType).toBe('hierarchical');
    expect(layoutOptions.direction).toBe('TB');
    
    // 🎯 验证预览线管理器的完整调用序列
    expect(mockPreviewLineManager.initializeExistingNodesCalled).toBe(true);
    expect(mockPreviewLineManager.processPendingCalculationsCalled).toBe(true);
    expect(mockPreviewLineManager.recalculateAllPreviewPositionsCalled).toBe(true);
    expect(mockPreviewLineManager.syncEndpointPositionsCalled).toBe(true);
    
    // 验证性能指标
    const metrics = coordinator.getPerformanceMetrics();
    expect(metrics.totalCoordinations).toBe(1);
    expect(metrics.successfulCoordinations).toBe(1);
    expect(metrics.successRate).toBe('100.00%');
    
    // 验证同步结果
    expect(result.postLayoutResult.validationResult.success).toBe(true);
    expect(result.postLayoutResult.validationResult.nodeCount).toBe(3);
    expect(result.postLayoutResult.validationResult.previewLineCount).toBe(2);
    
    console.log(`✅ P04核心测试通过 - 协调耗时: ${result.duration.toFixed(2)}ms`);
  });
  
  it('🔄 应该正确处理多次连续的统一布局请求', async () => {
    mockGraph.addMockNode('node1', 100, 100);
    mockPreviewLineManager.addMockPreviewLine('preview1');
    
    // 第一次协调
    const result1 = await coordinator.coordinateUnifiedLayoutWithPreviewLines();
    expect(result1.success).toBe(true);
    
    // 第二次协调（应该也成功）
    const result2 = await coordinator.coordinateUnifiedLayoutWithPreviewLines();
    expect(result2.success).toBe(true);
    
    // 验证性能指标
    const metrics = coordinator.getPerformanceMetrics();
    expect(metrics.totalCoordinations).toBe(2);
    expect(metrics.successfulCoordinations).toBe(2);
  });
  
  it('🎯 应该确保预览线状态与布局状态同步', async () => {
    mockGraph.addMockNode('node1', 100, 100);
    mockGraph.addMockNode('node2', 200, 200);
    mockPreviewLineManager.addMockPreviewLine('preview1');
    
    // 执行协调
    const result = await coordinator.coordinateUnifiedLayoutWithPreviewLines();
    
    expect(result.success).toBe(true);
    
    // 验证协调状态已重置
    expect(coordinator.coordinationState.isCoordinating).toBe(false);
    expect(coordinator.coordinationState.layoutInProgress).toBe(false);
    expect(coordinator.coordinationState.previewLineUpdateInProgress).toBe(false);
    
    // 验证协调计数增加
    expect(coordinator.coordinationState.coordinationCount).toBe(1);
    expect(coordinator.coordinationState.lastCoordinationTime).toBeGreaterThan(0);
  });
});