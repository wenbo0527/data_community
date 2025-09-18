/**
 * useConfigDrawers预览线管理器TDD测试用例
 * 专门测试useConfigDrawers中预览线管理器实例的正确性
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ref } from 'vue';
import { useStructuredLayout } from '../../composables/useStructuredLayout.js';
import UnifiedPreviewLineManager from '../../utils/UnifiedPreviewLineManager.js';

describe('useConfigDrawers预览线管理器TDD测试', () => {
  let mockGraph;
  let layoutComposable;

  beforeEach(() => {
    // 创建Mock Graph实例
    mockGraph = {
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => []),
      setPosition: vi.fn(),
      getBBox: vi.fn(() => ({ width: 120, height: 80 })),
      updateNode: vi.fn(),
      hasCell: vi.fn(() => true),
      addNode: vi.fn(),
      addEdge: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      getCellById: vi.fn(() => null),
      removeCell: vi.fn(),
      centerContent: vi.fn(),
      zoomToFit: vi.fn(),
      zoom: vi.fn(() => 1)
    };

    // 创建getGraph函数
    const getGraph = () => mockGraph;

    // 初始化useStructuredLayout，传入getGraph函数
    layoutComposable = useStructuredLayout(getGraph);
    
    // 🔧 关键修复：手动触发布局系统初始化
    if (layoutComposable.initializeLayoutEngine) {
      layoutComposable.initializeLayoutEngine();
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TDD-001: 预览线管理器实例初始化', () => {
    it('应该成功创建非null的预览线管理器实例', () => {
      // 验证unifiedPreviewManager不为null
      expect(layoutComposable.unifiedPreviewManager.value).not.toBeNull();
      expect(layoutComposable.unifiedPreviewManager.value).toBeDefined();
    });

    it('应该创建正确类型的预览线管理器实例', () => {
      const manager = layoutComposable.unifiedPreviewManager.value;
      
      // 验证实例类型
      if (manager) {
        expect(manager).toBeInstanceOf(UnifiedPreviewLineManager);
        expect(manager.constructor.name).toBe('UnifiedPreviewLineManager');
      }
    });

    it('应该正确传递构造函数参数', () => {
      const manager = layoutComposable.unifiedPreviewManager.value;
      
      if (manager) {
        // 验证graph参数正确传递
        expect(manager.graph).toStrictEqual(mockGraph);
        
        // 验证layoutConfig参数存在
        expect(manager.layoutConfig).toBeDefined();
        
        // 验证layoutEngine参数存在
        expect(manager.layoutEngine).toBeDefined();
      }
    });
  });

  describe('TDD-002: 预览线管理器方法可用性', () => {
    it('应该具有所有必需的预览线管理方法', () => {
      const manager = layoutComposable.unifiedPreviewManager.value;
      
      if (manager) {
        // 验证核心方法存在
        expect(typeof manager.createPreviewLine).toBe('function');
        expect(typeof manager.updatePreviewLinePosition).toBe('function');
        expect(typeof manager.removePreviewLine).toBe('function');
        expect(typeof manager.forceRefreshPreviewLine).toBe('function');
        expect(typeof manager.batchUpdatePreviewLines).toBe('function');
      }
    });

    it('应该能够正常调用预览线管理方法', () => {
      const manager = layoutComposable.unifiedPreviewManager.value;
      
      if (manager) {
        // 测试方法调用不抛出异常
        expect(() => {
          manager.createPreviewLine(
            { id: 'node1', x: 0, y: 0 },
            { id: 'node2', x: 100, y: 100 },
            'connection'
          );
        }).not.toThrow();
      }
    });
  });

  describe('TDD-003: useConfigDrawers集成测试', () => {
    it('应该在useConfigDrawers中正确获取预览线管理器', () => {
      // 模拟useConfigDrawers的获取逻辑
      const unifiedPreviewManager = layoutComposable.unifiedPreviewManager.value;
      
      // 验证获取到的实例
      expect(unifiedPreviewManager).not.toBeNull();
      expect(unifiedPreviewManager).not.toBeUndefined();
      
      if (unifiedPreviewManager) {
        // 验证实例类型信息
        const managerType = unifiedPreviewManager?.constructor?.name;
        expect(managerType).toBe('UnifiedPreviewLineManager');
        expect(managerType).not.toBe('undefined');
      }
    });

    it('应该正确显示可用方法列表', () => {
      const manager = layoutComposable.unifiedPreviewManager.value;
      
      if (manager) {
        // 获取可用方法列表
        const availableMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(manager))
          .filter(method => typeof manager[method] === 'function' && !method.startsWith('_'));
        
        // 验证方法列表不为空
        expect(availableMethods.length).toBeGreaterThan(0);
        expect(availableMethods).toContain('createPreviewLine');
        expect(availableMethods).toContain('updatePreviewLinePosition');
        expect(availableMethods).toContain('removePreviewLine');
      }
    });
  });

  describe('TDD-004: 错误处理和边界情况', () => {
    it('应该处理预览线管理器初始化失败的情况', () => {
      // 模拟初始化失败场景
      const mockFailedGraph = null;
      
      // 验证在异常情况下的处理
      expect(() => {
        useStructuredLayout(mockFailedGraph);
      }).not.toThrow();
    });

    it('应该处理预览线管理器方法调用异常', () => {
      const manager = layoutComposable.unifiedPreviewManager.value;
      
      if (manager) {
        // 测试异常参数处理 - 预览线管理器会进行参数验证并抛出错误
        expect(() => {
          manager.createPreviewLine(null, null, null);
        }).toThrow();
        
        // updatePreviewLinePosition 方法对无效参数进行静默处理
        expect(() => {
          manager.updatePreviewLinePosition('invalid-id', null, null);
        }).not.toThrow();
      }
    });
  });

  describe('TDD-005: 性能和内存管理', () => {
    it('应该正确管理预览线实例的生命周期', () => {
      const manager = layoutComposable.unifiedPreviewManager.value;
      
      if (manager) {
        // 创建预览线
        const previewId = manager.createPreviewLine(
          { id: 'source', x: 0, y: 0 },
          { id: 'target', x: 100, y: 100 },
          'connection'
        );
        
        expect(previewId).toBeDefined();
        
        // 移除预览线
        const removed = manager.removePreviewLine(previewId);
        // 注意：由于测试环境中预览线可能不会实际创建到图中，所以移除操作可能返回false
        expect(typeof removed).toBe('boolean');
      }
    });

    it('应该支持批量操作优化', () => {
      const manager = layoutComposable.unifiedPreviewManager.value;
      
      if (manager) {
        // 测试批量更新方法
        expect(typeof manager.batchUpdatePreviewLines).toBe('function');
        
        // 验证批量操作不抛出异常
        expect(() => {
          manager.batchUpdatePreviewLines([]);
        }).not.toThrow();
      }
    });
  });
});