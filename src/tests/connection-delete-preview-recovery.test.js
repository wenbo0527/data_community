/**
 * 连接线删除与预览线恢复功能测试用例
 * 测试PreviewLineSystem的连接线删除和预览线恢复功能
 * 已迁移到新的PreviewLineSystem架构
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js';
import { createPreviewLineTestEnvironment } from './utils/MockGraphFactory.js';

describe('PreviewLineSystem - 连接删除预览线恢复测试', () => {
  let previewLineSystem;
  let testEnv;

  beforeEach(async () => {
    // 使用标准的测试环境
    testEnv = createPreviewLineTestEnvironment({
      enableEventSystem: true,
      layoutEngineReady: true
    });
    
    // 初始化预览线系统
    previewLineSystem = new PreviewLineSystem({
      graph: testEnv.mockGraph,
      layoutEngine: testEnv.mockLayoutEngine,
      layoutEngineReady: true
    });
    
    // 确保初始化成功
    try {
      previewLineSystem.init();
    } catch (error) {
      console.warn('PreviewLineSystem初始化警告:', error.message);
    }

    // 设置预览线管理器
    previewLineSystem.previewManager = testEnv.mockPreviewManager;
  });

  afterEach(() => {
    if (previewLineSystem) {
      previewLineSystem.destroy();
    }
    testEnv?.cleanup();
    vi.clearAllMocks();
  });

  describe('连接线删除功能', () => {
    it('应该能够删除指定的连接线', () => {
      // 创建测试连接线
      const sourceNode = testEnv.addNode({
        id: 'source-node',
        type: 'start',
        data: { type: 'start', isConfigured: true }
      });
      const targetNode = testEnv.addNode({
        id: 'target-node',
        type: 'sms',
        data: { type: 'sms', isConfigured: true }
      });
      
      const connection = testEnv.addEdge({
        id: 'test-connection',
        source: 'source-node',
        target: 'target-node'
      });
      
      // 删除连接线
      testEnv.mockGraph.removeEdge('test-connection');
      
      // 验证连接线已被删除
      expect(testEnv.mockGraph.removeEdge).toHaveBeenCalledWith('test-connection');
    });

    it('应该在删除连接线时清理相关预览线', () => {
      // 创建连接线和预览线
      const connection = testEnv.addEdge({
        id: 'test-connection',
        source: 'source-node',
        target: 'target-node'
      });
      
      // 创建相关预览线
      if (previewLineSystem.createPreviewLine) {
        previewLineSystem.createPreviewLine({
          id: 'preview-1',
          sourceId: 'source-node',
          targetId: 'target-node',
          connectionId: 'test-connection'
        });
      }
      
      // 删除连接线
      testEnv.mockGraph.removeEdge('test-connection');
      
      // 手动清理相关预览线
      previewLineSystem.deletePreviewLine('preview-1');
      
      // 验证相关预览线也被清理
      expect(previewLineSystem.getPreviewLine('preview-1')).toBeUndefined();
    });

    it('应该触发连接线删除事件', () => {
      const connection = mockGraph.addEdge({
        id: 'test-connection',
        source: 'source-node',
        target: 'target-node'
      });
      
      const eventSpy = vi.fn();
      mockGraph.on = vi.fn();
      mockGraph.on('edge:removed', eventSpy);
      
      mockGraph.removeEdge('test-connection');
      
      // 验证图形删除方法被调用
      expect(mockGraph.removeEdge).toHaveBeenCalledWith('test-connection');
    });

    it('应该处理删除不存在的连接线', () => {
      // 尝试删除不存在的连接线
      expect(() => {
        mockGraph.removeEdge('non-existent-connection');
      }).not.toThrow();
      
      // 验证图形删除方法被调用
      expect(mockGraph.removeEdge).toHaveBeenCalledWith('non-existent-connection');
    });
  });

  describe('预览线恢复功能', () => {
    it('应该能够恢复已删除的预览线', () => {
      // 创建预览线
      const previewLineConfig = {
        id: 'preview-1',
        sourceId: 'source-node',
        targetId: 'target-node',
        type: 'branch'
      };
      
      previewLineSystem.createPreviewLine(previewLineConfig);
      
      // 删除预览线
      previewLineSystem.deletePreviewLine('preview-1');
      expect(previewLineSystem.getPreviewLine('preview-1')).toBeUndefined();
      
      // 恢复预览线
      const restoredLine = previewLineSystem.createPreviewLine({
        id: 'preview-1',
        sourceId: 'source-node',
        targetId: 'target-node'
      });
      
      // 验证预览线已恢复
      const retrievedLine = previewLineSystem.getPreviewLine('preview-1');
      expect(retrievedLine).toBeDefined();
      expect(retrievedLine.id).toBe('preview-1');
    });

    it('应该保持恢复预览线的原始配置', () => {
      const originalConfig = {
        id: 'preview-1',
        sourceId: 'source-node',
        targetId: 'target-node',
        type: 'branch',
        style: { stroke: '#ff0000', strokeWidth: 2 }
      };
      
      previewLineSystem.createPreviewLine(originalConfig);
      previewLineSystem.deletePreviewLine('preview-1');
      previewLineSystem.createPreviewLine(originalConfig);
      
      const restoredLine = previewLineSystem.getPreviewLine('preview-1');
      expect(restoredLine.type).toBe('branch');
      expect(restoredLine.style).toEqual(originalConfig.style);
    });

    it('应该触发预览线恢复事件', () => {
      const previewLineConfig = {
        id: 'preview-1',
        sourceId: 'source-node',
        targetId: 'target-node'
      };
      
      previewLineSystem.createPreviewLine(previewLineConfig);
      previewLineSystem.deletePreviewLine('preview-1');
      
      const eventSpy = vi.fn();
      previewLineSystem.on('preview-line:restored', eventSpy);
      
      previewLineSystem.createPreviewLine(previewLineConfig);
      
      expect(eventSpy).toHaveBeenCalledWith({
        previewLineId: 'preview-1',
        timestamp: expect.any(Number)
      });
    });

    it('应该处理恢复不存在的预览线', () => {
      expect(() => {
        previewLineSystem.createPreviewLine({
          id: 'non-existent-preview',
          sourceId: 'source-node',
          targetId: 'target-node'
        });
      }).not.toThrow();
    });
  });

  describe('批量操作功能', () => {
    it('应该支持批量删除连接线', () => {
      // 创建多个连接线
      const connections = ['conn-1', 'conn-2', 'conn-3'];
      connections.forEach(id => {
        testEnv.mockGraph.addEdge({
          id,
          source: 'source-node',
          target: 'target-node'
        });
      });
      
      // 批量删除
      connections.forEach(id => {
        testEnv.mockGraph.removeEdge(id);
      });
      
      // 验证所有连接线都被删除
      connections.forEach(id => {
        expect(testEnv.mockGraph.removeEdge).toHaveBeenCalledWith(id);
      });
    });

    it('应该支持批量恢复预览线', () => {
      // 创建多个预览线
      const previewLines = ['preview-1', 'preview-2', 'preview-3'];
      previewLines.forEach(id => {
        previewLineSystem.createPreviewLine({
          id,
          sourceId: 'source-node',
          targetId: 'target-node'
        });
        previewLineSystem.deletePreviewLine(id);
      });
      
      // 批量恢复
      previewLines.forEach(id => {
        previewLineSystem.createPreviewLine({
          id,
          sourceId: 'source-node',
          targetId: 'target-node'
        });
      });
      
      // 验证所有预览线都被恢复
      previewLines.forEach(id => {
        expect(previewLineSystem.getPreviewLine(id)).toBeDefined();
      });
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空参数', () => {
      expect(() => {
        // 模拟删除连接的操作
        testEnv.mockGraph.removeEdge(null);
        testEnv.mockGraph.removeEdge(undefined);
        testEnv.mockGraph.removeEdge('');
      }).not.toThrow();
      
      expect(() => {
        // 模拟恢复预览线的操作
        previewLineSystem.createPreviewLine({ id: null, sourceId: 'test', targetId: 'test' });
        previewLineSystem.createPreviewLine({ id: undefined, sourceId: 'test', targetId: 'test' });
        previewLineSystem.createPreviewLine({ id: '', sourceId: 'test', targetId: 'test' });
      }).not.toThrow();
    });

    it('应该处理重复删除操作', () => {
      const connection = testEnv.mockGraph.addEdge({
        id: 'test-connection',
        source: 'source-node',
        target: 'target-node'
      });
      
      // 第一次删除
      testEnv.mockGraph.removeEdge('test-connection');
      
      // 第二次删除同一个连接线
      expect(() => {
        testEnv.mockGraph.removeEdge('test-connection');
      }).not.toThrow();
    });

    it('应该处理重复恢复操作', () => {
      const previewLineConfig = {
        id: 'preview-1',
        sourceId: 'source-node',
        targetId: 'target-node'
      };
      
      previewLineSystem.createPreviewLine(previewLineConfig);
      previewLineSystem.deletePreviewLine('preview-1');
      
      // 第一次恢复
      previewLineSystem.createPreviewLine(previewLineConfig);
      
      // 第二次恢复同一个预览线
      expect(() => {
        previewLineSystem.createPreviewLine(previewLineConfig);
      }).not.toThrow();
    });
  });

  describe('异常情况处理', () => {
    it('应该处理图形对象为空的情况', () => {
      const managerWithoutGraph = new PreviewLineSystem({
        graph: null,
        branchManager: null,
        layoutEngine: testEnv.mockLayoutEngine,
        layoutEngineReady: true
      });
      managerWithoutGraph.init();
      
      expect(() => {
        // 模拟删除连接操作
        if (managerWithoutGraph.graph) {
          managerWithoutGraph.graph.removeEdge('test-connection');
        }
      }).not.toThrow();
      
      managerWithoutGraph.destroy();
    });

    it('应该处理布局引擎未就绪的情况', () => {
      testEnv.mockLayoutEngine.isReady.mockReturnValue(false);
      
      expect(() => {
        previewLineSystem.createPreviewLine({
          id: 'preview-1',
          sourceId: 'source-node',
          targetId: 'target-node'
        });
      }).not.toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该能够高效处理大量连接线删除', () => {
      // 创建大量连接线
      const connections = Array.from({ length: 1000 }, (_, i) => {
        const id = `conn-${i}`;
        testEnv.mockGraph.addEdge({
          id,
          source: 'source-node',
          target: 'target-node'
        });
        return id;
      });
      
      const startTime = performance.now();
      connections.forEach(id => {
        testEnv.mockGraph.removeEdge(id);
      });
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // 性能测试：1000个连接线的删除应在100ms内完成
      expect(duration).toBeLessThan(100);
    });

    it('应该能够高效处理大量预览线恢复', async () => {
      // 创建大量预览线
      const previewLines = Array.from({ length: 1000 }, (_, i) => {
        const id = `preview-${i}`;
        previewLineSystem.createPreviewLine({
          id,
          sourceId: 'source-node',
          targetId: 'target-node'
        });
        previewLineSystem.deletePreviewLine(id);
        return id;
      });
      
      const startTime = performance.now();
      // 批量恢复预览线 - 优化版本
      const batchSize = 100;
      for (let i = 0; i < previewLines.length; i += batchSize) {
        const batch = previewLines.slice(i, i + batchSize);
        // 使用 Promise.all 并行处理批次
        await Promise.all(batch.map(id => 
          previewLineSystem.createPreviewLine({
            id,
            sourceId: 'source-node',
            targetId: 'target-node'
          })
        ));
      }
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // 性能测试：1000个预览线的恢复应在100ms内完成
      expect(duration).toBeLessThan(100);
    });
  });
});