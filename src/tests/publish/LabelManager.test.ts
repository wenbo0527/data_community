import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Graph } from '@antv/x6';
import { LabelManager } from '../../managers/publish/LabelManager';
import { UnifiedEventBus } from '../../core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager';
import { ErrorHandler } from '../../core/ErrorHandler';

// 模拟DOM环境
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      className: '',
      style: { cssText: '' },
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      innerHTML: '',
      id: '',
      parentNode: {
        removeChild: vi.fn()
      }
    })),
    getElementById: vi.fn()
  }
});

describe('LabelManager', () => {
  let labelManager: LabelManager;
  let mockCanvas: Graph;
  let mockEventBus: UnifiedEventBus;
  let mockCacheManager: UnifiedCacheManager;
  let mockErrorHandler: ErrorHandler;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    // 创建模拟容器
    mockContainer = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      style: { cssText: '' }
    } as any;

    // 创建模拟画布
    mockCanvas = {
      container: mockContainer,
      getCellById: vi.fn()
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

    // 创建LabelManager实例
    labelManager = new LabelManager(
      mockCanvas,
      mockEventBus,
      mockCacheManager,
      mockErrorHandler
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    labelManager.dispose();
  });

  describe('初始化', () => {
    it('应该正确初始化LabelManager', () => {
      expect(labelManager).toBeDefined();
      expect(mockEventBus.on).toHaveBeenCalledWith('label:update', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('label:remove', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('canvas:transform', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('node:moved', expect.any(Function));
    });

    it('应该创建标签容器', () => {
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockContainer.appendChild).toHaveBeenCalled();
    });

    it('应该处理画布容器不存在的情况', () => {
      const canvasWithoutContainer = { container: null } as any;
      
      expect(() => {
        new LabelManager(
          canvasWithoutContainer,
          mockEventBus,
          mockCacheManager,
          mockErrorHandler
        );
      }).not.toThrow();
      
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('标签创建', () => {
    it('应该成功创建分支标签', async () => {
      const branchId = 'decision_1_branch_0';
      const labelConfig = {
        text: '条件1',
        condition: 'value > 100',
        isAttached: false,
        style: {
          fontSize: 12,
          fill: '#52c41a',
          fontWeight: 'normal'
        }
      };

      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);

      const label = await labelManager.createBranchLabel(branchId, labelConfig);

      expect(label).toBeDefined();
      expect(label.id).toBe(`label_${branchId}`);
      expect(label.branchId).toBe(branchId);
      expect(label.text).toBe(labelConfig.text);
      expect(label.condition).toBe(labelConfig.condition);
      expect(label.isAttached).toBe(false);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `label_${branchId}`,
        label,
        300000
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith('label:created', {
        branchId,
        label
      });
    });

    it('应该正确计算标签位置', async () => {
      const branchId = 'decision_1_branch_0';
      const labelConfig = { text: '条件1', condition: 'value > 100' };
      
      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);

      const position = await labelManager['calculateLabelPosition'](branchId, labelConfig);

      expect(position).toEqual({
        x: 295, // 100 + 120 + 75
        y: 115  // 100 + 60/2 + 0*30 - 15
      });
    });

    it('应该处理不同分支索引的位置计算', async () => {
      const branchId = 'decision_1_branch_2'; // 第3个分支
      const labelConfig = { text: '条件3', condition: 'value == 0' };
      
      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);

      const position = await labelManager['calculateLabelPosition'](branchId, labelConfig);

      expect(position).toEqual({
        x: 295, // 100 + 120 + 75
        y: 175  // 100 + 60/2 + 2*30 - 15
      });
    });

    it('应该处理标签创建过程中的错误', async () => {
      const branchId = 'invalid_branch';
      const labelConfig = { text: '测试', condition: 'test' };
      
      mockCanvas.getCellById.mockReturnValue(null);

      const label = await labelManager.createBranchLabel(branchId, labelConfig);

      expect(label).toBeNull();
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('标签更新', () => {
    it('应该创建新标签当标签不存在时', async () => {
      const branchId = 'decision_1_branch_0';
      const labelConfig = {
        text: '新条件',
        condition: 'value > 200',
        isAttached: false
      };

      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);

      const label = await labelManager.updateBranchLabel(branchId, labelConfig);

      expect(label).toBeDefined();
      expect(label.text).toBe(labelConfig.text);
      expect(mockEventBus.emit).toHaveBeenCalledWith('label:created', expect.any(Object));
    });

    it('应该更新现有标签', async () => {
      const branchId = 'decision_1_branch_0';
      const initialConfig = {
        text: '初始条件',
        condition: 'value > 100',
        isAttached: false
      };
      const updateConfig = {
        text: '更新条件',
        condition: 'value > 200',
        isAttached: true,
        style: { fontSize: 14 }
      };

      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);

      // 先创建标签
      await labelManager.createBranchLabel(branchId, initialConfig);
      
      // 然后更新标签
      const updatedLabel = await labelManager.updateBranchLabel(branchId, updateConfig);

      expect(updatedLabel).toBeDefined();
      expect(updatedLabel.text).toBe(updateConfig.text);
      expect(updatedLabel.condition).toBe(updateConfig.condition);
      expect(updatedLabel.isAttached).toBe(true);
      expect(mockEventBus.emit).toHaveBeenCalledWith('label:updated', expect.any(Object));
    });

    it('应该处理更新不存在标签的错误', async () => {
      const branchId = 'nonexistent_branch';
      const labelConfig = { text: '测试', condition: 'test' };

      const result = await labelManager['updateExistingLabel'](branchId, labelConfig);

      expect(result).toBeNull();
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('标签状态管理', () => {
    beforeEach(async () => {
      // 创建一个测试标签
      const branchId = 'decision_1_branch_0';
      const labelConfig = {
        text: '测试条件',
        condition: 'value > 100',
        isAttached: false
      };

      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);
      await labelManager.createBranchLabel(branchId, labelConfig);
    });

    it('应该正确更新标签为已连接状态', () => {
      const branchId = 'decision_1_branch_0';
      
      const result = labelManager.updateLabelState(branchId, 'attached');
      
      expect(result).toBe(true);
      const label = labelManager.getLabel(branchId);
      expect(label.isAttached).toBe(true);
    });

    it('应该正确更新标签为未连接状态', () => {
      const branchId = 'decision_1_branch_0';
      
      const result = labelManager.updateLabelState(branchId, 'unattached');
      
      expect(result).toBe(true);
      const label = labelManager.getLabel(branchId);
      expect(label.isAttached).toBe(false);
    });

    it('应该正确隐藏标签', () => {
      const branchId = 'decision_1_branch_0';
      
      const result = labelManager.updateLabelState(branchId, 'hidden');
      
      expect(result).toBe(true);
    });

    it('应该处理更新不存在标签状态的情况', () => {
      const result = labelManager.updateLabelState('nonexistent', 'attached');
      
      expect(result).toBe(false);
    });
  });

  describe('标签移除', () => {
    beforeEach(async () => {
      // 创建一个测试标签
      const branchId = 'decision_1_branch_0';
      const labelConfig = {
        text: '测试条件',
        condition: 'value > 100',
        isAttached: false
      };

      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);
      await labelManager.createBranchLabel(branchId, labelConfig);
    });

    it('应该成功移除标签', () => {
      const branchId = 'decision_1_branch_0';
      
      const result = labelManager.removeLabel(branchId);
      
      expect(result).toBe(true);
      expect(labelManager.getLabel(branchId)).toBeNull();
      expect(mockCacheManager.delete).toHaveBeenCalledWith(`label_${branchId}`);
      expect(mockEventBus.emit).toHaveBeenCalledWith('label:removed', {
        branchId,
        labelId: `label_${branchId}`
      });
    });

    it('应该处理移除不存在标签的情况', () => {
      const result = labelManager.removeLabel('nonexistent');
      
      expect(result).toBe(false);
    });
  });

  describe('标签查询', () => {
    beforeEach(async () => {
      // 创建多个测试标签
      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);

      await labelManager.createBranchLabel('decision_1_branch_0', {
        text: '条件1',
        condition: 'value > 100'
      });
      
      await labelManager.createBranchLabel('decision_1_branch_1', {
        text: '条件2',
        condition: 'value <= 100'
      });
    });

    it('应该正确获取单个标签', () => {
      const label = labelManager.getLabel('decision_1_branch_0');
      
      expect(label).toBeDefined();
      expect(label.text).toBe('条件1');
    });

    it('应该返回null当标签不存在时', () => {
      const label = labelManager.getLabel('nonexistent');
      
      expect(label).toBeNull();
    });

    it('应该正确获取所有标签', () => {
      const allLabels = labelManager.getAllLabels();
      
      expect(allLabels).toHaveLength(2);
      expect(allLabels.map(l => l.text)).toContain('条件1');
      expect(allLabels.map(l => l.text)).toContain('条件2');
    });
  });

  describe('批量操作', () => {
    beforeEach(async () => {
      // 创建多个测试标签
      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);

      await labelManager.createBranchLabel('decision_1_branch_0', {
        text: '条件1',
        condition: 'value > 100'
      });
      
      await labelManager.createBranchLabel('decision_1_branch_1', {
        text: '条件2',
        condition: 'value <= 100'
      });
    });

    it('应该隐藏所有标签', () => {
      labelManager.hideAllLabels();
      
      const allLabels = labelManager.getAllLabels();
      allLabels.forEach(label => {
        expect(label.element.style.display).toBe('none');
      });
    });

    it('应该显示所有标签', () => {
      labelManager.showAllLabels();
      
      const allLabels = labelManager.getAllLabels();
      allLabels.forEach(label => {
        expect(label.element.style.display).toBe('block');
      });
    });
  });

  describe('事件处理', () => {
    it('应该处理标签更新事件', async () => {
      const event = {
        branchId: 'decision_1_branch_0',
        labelConfig: {
          text: '事件更新',
          condition: 'event test'
        }
      };

      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);

      await labelManager['handleLabelUpdate'](event);

      const label = labelManager.getLabel(event.branchId);
      expect(label).toBeDefined();
      expect(label.text).toBe(event.labelConfig.text);
    });

    it('应该处理标签移除事件', async () => {
      // 先创建标签
      const branchId = 'decision_1_branch_0';
      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);
      await labelManager.createBranchLabel(branchId, {
        text: '测试',
        condition: 'test'
      });

      // 处理移除事件
      labelManager['handleLabelRemove']({ branchId });

      expect(labelManager.getLabel(branchId)).toBeNull();
    });

    it('应该处理节点移动事件', async () => {
      const nodeId = 'decision_1';
      const branchId = `${nodeId}_branch_0`;
      
      // 创建标签
      const mockNode = {
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      };
      
      mockCanvas.getCellById.mockReturnValue(mockNode);
      await labelManager.createBranchLabel(branchId, {
        text: '测试',
        condition: 'test'
      });

      const originalPosition = labelManager.getLabel(branchId).position;

      // 模拟节点移动
      mockNode.getPosition = () => ({ x: 200, y: 200 });
      
      await labelManager['handleNodeMoved']({ nodeId });

      const newPosition = labelManager.getLabel(branchId).position;
      expect(newPosition.x).not.toBe(originalPosition.x);
      expect(newPosition.y).not.toBe(originalPosition.y);
    });
  });

  describe('资源清理', () => {
    it('应该正确清理所有资源', () => {
      labelManager.dispose();
      
      expect(mockEventBus.off).toHaveBeenCalledWith('label:update', expect.any(Function));
      expect(mockEventBus.off).toHaveBeenCalledWith('label:remove', expect.any(Function));
      expect(mockEventBus.off).toHaveBeenCalledWith('canvas:transform', expect.any(Function));
      expect(mockEventBus.off).toHaveBeenCalledWith('node:moved', expect.any(Function));
    });
  });
});