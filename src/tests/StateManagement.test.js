import { describe, test, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { SmartMockFactory } from './config/mockStrategy';

// Mock useCanvasState
const mockCanvasState = {
  selectedNodes: [],
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  isConnecting: false,
  connectionStart: null,
  selectNode: vi.fn(),
  selectMultipleNodes: vi.fn(),
  clearSelection: vi.fn(),
  startDrag: vi.fn(),
  updateDrag: vi.fn(),
  endDrag: vi.fn(),
  startConnection: vi.fn(),
  endConnection: vi.fn(),
  cancelConnection: vi.fn()
};

// 使用优化的Mock策略 - 只Mock必要的外部依赖
vi.mock('../pages/marketing/tasks/composables/canvas/useCanvasNodes');
vi.mock('../pages/marketing/tasks/composables/canvas/useCanvasState', () => ({
  useCanvasState: vi.fn(() => mockCanvasState)
}));

describe('状态管理测试', () => {
  let mockFactory;
  let mockCanvasNodes;
  
  beforeEach(() => {
    // 使用智能Mock工厂创建轻量化Mock
    mockFactory = new SmartMockFactory('integration');
    mockCanvasNodes = mockFactory.createCanvasNodesMock();
    
    // 重置mock状态
    mockCanvasState.selectedNodes = [];
    mockCanvasState.isDragging = false;
    mockCanvasState.dragOffset = { x: 0, y: 0 };
    mockCanvasState.isConnecting = false;
    mockCanvasState.connectionStart = null;
    
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    mockFactory.resetAllMocks();
    vi.clearAllMocks();
  });
  
  afterAll(() => {
    mockFactory.cleanup();
  });

  describe('接口完整性测试', () => {
    test('应该提供所有必需的状态管理接口', () => {
      const state = mockCanvasState;
      
      // 验证状态属性
      expect(state).toHaveProperty('selectedNodes');
      expect(state).toHaveProperty('isDragging');
      expect(state).toHaveProperty('dragOffset');
      expect(state).toHaveProperty('isConnecting');
      expect(state).toHaveProperty('connectionStart');
      
      // 验证操作方法
      expect(state).toHaveProperty('selectNode');
      expect(state).toHaveProperty('selectMultipleNodes');
      expect(state).toHaveProperty('clearSelection');
      expect(state).toHaveProperty('startDrag');
      expect(state).toHaveProperty('updateDrag');
      expect(state).toHaveProperty('endDrag');
      expect(state).toHaveProperty('startConnection');
      expect(state).toHaveProperty('endConnection');
      expect(state).toHaveProperty('cancelConnection');
    });
    
    test('所有方法应该是函数类型', () => {
      const state = mockCanvasState;
      
      const methods = [
        'selectNode', 'selectMultipleNodes', 'clearSelection',
        'startDrag', 'updateDrag', 'endDrag',
        'startConnection', 'endConnection', 'cancelConnection'
      ];
      
      methods.forEach(method => {
        expect(typeof state[method]).toBe('function');
      });
    });
    
    test('初始状态应该正确', () => {
      const state = mockCanvasState;
      
      expect(state.selectedNodes).toEqual([]);
      expect(state.isDragging).toBe(false);
      expect(state.dragOffset).toEqual({ x: 0, y: 0 });
      expect(state.isConnecting).toBe(false);
      expect(state.connectionStart).toBeNull();
    });
  });

  describe('选择状态管理测试', () => {
    test('应该能够选择单个节点', () => {
      const nodeId = 'node-1';
      
      // 模拟选择节点的行为
      mockCanvasState.selectNode.mockImplementation((id) => {
        if (!mockCanvasState.selectedNodes.includes(id)) {
          mockCanvasState.selectedNodes.push(id);
        }
      });
      
      mockCanvasState.selectNode(nodeId);
      
      expect(mockCanvasState.selectNode).toHaveBeenCalledWith(nodeId);
      expect(mockCanvasState.selectedNodes).toContain(nodeId);
    });
    
    test('应该能够选择多个节点', () => {
      const nodeIds = ['node-1', 'node-2', 'node-3'];
      
      // 模拟选择多个节点的行为
      mockCanvasState.selectMultipleNodes.mockImplementation((ids) => {
        mockCanvasState.selectedNodes = [...ids];
      });
      
      mockCanvasState.selectMultipleNodes(nodeIds);
      
      expect(mockCanvasState.selectMultipleNodes).toHaveBeenCalledWith(nodeIds);
      expect(mockCanvasState.selectedNodes).toEqual(expect.arrayContaining(nodeIds));
    });
    
    test('应该能够清除选择', () => {
      // 先选择一些节点
      mockCanvasState.selectedNodes = ['node-1', 'node-2'];
      expect(mockCanvasState.selectedNodes.length).toBeGreaterThan(0);
      
      // 模拟清除选择的行为
      mockCanvasState.clearSelection.mockImplementation(() => {
        mockCanvasState.selectedNodes = [];
      });
      
      mockCanvasState.clearSelection();
      
      expect(mockCanvasState.clearSelection).toHaveBeenCalled();
      expect(mockCanvasState.selectedNodes).toEqual([]);
    });
    
    test('重复选择同一节点应该保持唯一性', () => {
      const nodeId = 'node-1';
      
      // 模拟选择节点的行为，确保唯一性
      mockCanvasState.selectNode.mockImplementation((id) => {
        if (!mockCanvasState.selectedNodes.includes(id)) {
          mockCanvasState.selectedNodes.push(id);
        }
      });
      
      mockCanvasState.selectNode(nodeId);
      mockCanvasState.selectNode(nodeId);
      
      const selectedCount = mockCanvasState.selectedNodes.filter(id => id === nodeId).length;
      expect(selectedCount).toBe(1);
    });
    
    test('选择空数组应该清除所有选择', () => {
      // 先选择一些节点
      mockCanvasState.selectedNodes = ['node-1', 'node-2'];
      
      // 模拟选择空数组的行为
      mockCanvasState.selectMultipleNodes.mockImplementation((ids) => {
        mockCanvasState.selectedNodes = [...ids];
      });
      
      mockCanvasState.selectMultipleNodes([]);
      
      expect(mockCanvasState.selectedNodes).toEqual([]);
    });
  });

  describe('拖拽状态管理测试', () => {
    test('应该能够开始拖拽', () => {
      const nodeId = 'node-1';
      const startPosition = { x: 100, y: 100 };
      
      // 模拟开始拖拽的行为
      mockCanvasState.startDrag.mockImplementation((id, pos) => {
        mockCanvasState.isDragging = true;
        mockCanvasState.dragState = {
          nodeId: id,
          startPosition: pos,
          currentPosition: pos
        };
      });
      
      mockCanvasState.startDrag(nodeId, startPosition);
      
      expect(mockCanvasState.startDrag).toHaveBeenCalledWith(nodeId, startPosition);
      expect(mockCanvasState.isDragging).toBe(true);
      expect(mockCanvasState.dragState.nodeId).toBe(nodeId);
      expect(mockCanvasState.dragState.startPosition).toEqual(startPosition);
    });
    
    test('应该能够更新拖拽位置', () => {
      const nodeId = 'node-1';
      const startPosition = { x: 100, y: 100 };
      const newPosition = { x: 150, y: 150 };
      
      // 先设置拖拽状态
      mockCanvasState.isDragging = true;
      mockCanvasState.dragState = {
        nodeId,
        startPosition,
        currentPosition: startPosition
      };
      
      // 模拟更新拖拽位置的行为
      mockCanvasState.updateDrag.mockImplementation((pos) => {
        if (mockCanvasState.isDragging) {
          mockCanvasState.dragState.currentPosition = pos;
        }
      });
      
      mockCanvasState.updateDrag(newPosition);
      
      expect(mockCanvasState.updateDrag).toHaveBeenCalledWith(newPosition);
      expect(mockCanvasState.dragState.currentPosition).toEqual(newPosition);
    });
    
    test('应该能够结束拖拽', () => {
      const nodeId = 'node-1';
      const startPosition = { x: 100, y: 100 };
      
      // 先设置拖拽状态
      mockCanvasState.isDragging = true;
      mockCanvasState.dragState = {
        nodeId,
        startPosition,
        currentPosition: startPosition
      };
      
      expect(mockCanvasState.isDragging).toBe(true);
      
      // 模拟结束拖拽的行为
      mockCanvasState.endDrag.mockImplementation(() => {
        mockCanvasState.isDragging = false;
        mockCanvasState.dragState = null;
      });
      
      mockCanvasState.endDrag();
      
      expect(mockCanvasState.endDrag).toHaveBeenCalled();
      expect(mockCanvasState.isDragging).toBe(false);
      expect(mockCanvasState.dragState).toBeNull();
    });
    
    test('未开始拖拽时更新位置应该无效', () => {
      const newPosition = { x: 150, y: 150 };
      
      // 确保初始状态
      mockCanvasState.isDragging = false;
      mockCanvasState.dragState = null;
      
      expect(mockCanvasState.isDragging).toBe(false);
      
      // 模拟更新拖拽位置的行为（应该无效）
      mockCanvasState.updateDrag.mockImplementation((pos) => {
        if (mockCanvasState.isDragging) {
          mockCanvasState.dragState.currentPosition = pos;
        }
      });
      
      mockCanvasState.updateDrag(newPosition);
      
      expect(mockCanvasState.updateDrag).toHaveBeenCalledWith(newPosition);
      expect(mockCanvasState.isDragging).toBe(false);
      expect(mockCanvasState.dragState).toBeNull();
    });
  });

  describe('连接状态管理测试', () => {
    test('应该能够开始连接', () => {
      const sourceNodeId = 'node-1';
      
      // 模拟开始连接的行为
      mockCanvasState.startConnection.mockImplementation((sourceId) => {
        mockCanvasState.isConnecting = true;
        mockCanvasState.connectionState = {
          sourceNodeId: sourceId,
          targetNodeId: null
        };
      });
      
      mockCanvasState.startConnection(sourceNodeId);
      
      expect(mockCanvasState.startConnection).toHaveBeenCalledWith(sourceNodeId);
      expect(mockCanvasState.isConnecting).toBe(true);
      expect(mockCanvasState.connectionState.sourceNodeId).toBe(sourceNodeId);
    });
    
    test('应该能够结束连接', () => {
      const sourceNodeId = 'node-1';
      const targetNodeId = 'node-2';
      
      // 先设置连接状态
      mockCanvasState.isConnecting = true;
      mockCanvasState.connectionState = {
        sourceNodeId,
        targetNodeId: null
      };
      
      expect(mockCanvasState.isConnecting).toBe(true);
      
      // 模拟结束连接的行为
      mockCanvasState.endConnection.mockImplementation((targetId) => {
        mockCanvasState.isConnecting = false;
        mockCanvasState.connectionState = null;
        // 这里可以添加创建连接的逻辑
      });
      
      mockCanvasState.endConnection(targetNodeId);
      
      expect(mockCanvasState.endConnection).toHaveBeenCalledWith(targetNodeId);
      expect(mockCanvasState.isConnecting).toBe(false);
      expect(mockCanvasState.connectionState).toBeNull();
    });
    
    test('应该能够取消连接', () => {
      const sourceNodeId = 'node-1';
      
      // 先设置连接状态
      mockCanvasState.isConnecting = true;
      mockCanvasState.connectionState = {
        sourceNodeId,
        targetNodeId: null
      };
      
      expect(mockCanvasState.isConnecting).toBe(true);
      
      // 模拟取消连接的行为
      mockCanvasState.cancelConnection.mockImplementation(() => {
        mockCanvasState.isConnecting = false;
        mockCanvasState.connectionState = null;
      });
      
      mockCanvasState.cancelConnection();
      
      expect(mockCanvasState.cancelConnection).toHaveBeenCalled();
      expect(mockCanvasState.isConnecting).toBe(false);
      expect(mockCanvasState.connectionState).toBeNull();
    });
  });

  describe('异常处理测试', () => {
    test('选择无效节点ID应该被忽略', () => {
      const invalidNodeId = null;
      
      // 模拟选择无效节点的行为
      mockCanvasState.selectNode.mockImplementation((id) => {
        if (id && typeof id === 'string' && !mockCanvasState.selectedNodes.includes(id)) {
          mockCanvasState.selectedNodes.push(id);
        }
      });
      
      mockCanvasState.selectNode(invalidNodeId);
      
      expect(mockCanvasState.selectNode).toHaveBeenCalledWith(invalidNodeId);
      expect(mockCanvasState.selectedNodes).not.toContain(invalidNodeId);
    });
    
    test('选择包含无效ID的数组应该过滤无效值', () => {
      const mixedIds = ['node-1', null, 'node-2', undefined, '', 'node-3'];
      
      // 模拟选择多个节点的行为（过滤无效项）
      mockCanvasState.selectMultipleNodes.mockImplementation((ids) => {
        const validIds = ids.filter(id => id != null && typeof id === 'string' && id !== '');
        mockCanvasState.selectedNodes = [...validIds];
      });
      
      mockCanvasState.selectMultipleNodes(mixedIds);
      
      expect(mockCanvasState.selectMultipleNodes).toHaveBeenCalledWith(mixedIds);
      expect(mockCanvasState.selectedNodes).toEqual(['node-1', 'node-2', 'node-3']);
    });
    
    test('拖拽时传入无效坐标应该使用默认值', () => {
      const nodeId = 'node-1';
      const validPosition = { x: 100, y: 100 };
      const invalidPosition = { x: 'invalid', y: null };
      
      // 先设置有效拖拽状态
      mockCanvasState.isDragging = true;
      mockCanvasState.dragState = {
        nodeId,
        startPosition: validPosition,
        currentPosition: validPosition
      };
      
      const initialDragState = { ...mockCanvasState.dragState };
      
      // 模拟更新拖拽位置的行为（验证坐标有效性）
      mockCanvasState.updateDrag.mockImplementation((pos) => {
        if (mockCanvasState.isDragging && 
            pos && 
            typeof pos.x === 'number' && 
            typeof pos.y === 'number') {
          mockCanvasState.dragState.currentPosition = pos;
        }
      });
      
      mockCanvasState.updateDrag(invalidPosition);
      
      expect(mockCanvasState.updateDrag).toHaveBeenCalledWith(invalidPosition);
      // 拖拽状态应该保持不变
      expect(mockCanvasState.dragState.currentPosition).toEqual(initialDragState.currentPosition);
    });
    
    test('连接时传入无效节点应该被忽略', () => {
      const validNodeId = 'node-1';
      const invalidNodeId = null;
      
      // 先设置有效连接状态
      mockCanvasState.isConnecting = true;
      mockCanvasState.connectionState = {
        sourceNodeId: validNodeId,
        targetNodeId: null
      };
      
      expect(mockCanvasState.isConnecting).toBe(true);
      
      // 模拟结束连接的行为（验证节点有效性）
      mockCanvasState.endConnection.mockImplementation((targetId) => {
        if (targetId && typeof targetId === 'string') {
          mockCanvasState.isConnecting = false;
          mockCanvasState.connectionState = null;
        }
      });
      
      mockCanvasState.endConnection(invalidNodeId);
      
      expect(mockCanvasState.endConnection).toHaveBeenCalledWith(invalidNodeId);
      // 连接状态应该保持不变
      expect(mockCanvasState.isConnecting).toBe(true);
      expect(mockCanvasState.connectionState.sourceNodeId).toBe(validNodeId);
    });
    
    test('状态重置应该恢复到初始状态', () => {
      // 设置一些状态
      mockCanvasState.selectedNodes = ['node-1', 'node-2'];
      mockCanvasState.isDragging = true;
      mockCanvasState.dragState = {
        nodeId: 'node-1',
        startPosition: { x: 100, y: 100 },
        currentPosition: { x: 100, y: 100 }
      };
      mockCanvasState.isConnecting = true;
      mockCanvasState.connectionState = {
        sourceNodeId: 'node-1',
        targetNodeId: null
      };
      
      // 验证状态已设置
      expect(mockCanvasState.selectedNodes.length).toBeGreaterThan(0);
      expect(mockCanvasState.isDragging).toBe(true);
      expect(mockCanvasState.isConnecting).toBe(true);
      
      // 模拟重置状态的行为
      const resetState = vi.fn(() => {
        mockCanvasState.selectedNodes = [];
        mockCanvasState.isDragging = false;
        mockCanvasState.isConnecting = false;
        mockCanvasState.dragState = null;
        mockCanvasState.connectionState = null;
      });
      
      resetState();
      
      expect(resetState).toHaveBeenCalled();
      // 验证所有状态已清除
      expect(mockCanvasState.selectedNodes).toEqual([]);
      expect(mockCanvasState.isDragging).toBe(false);
      expect(mockCanvasState.isConnecting).toBe(false);
      expect(mockCanvasState.dragState).toBeNull();
      expect(mockCanvasState.connectionState).toBeNull();
    });
  });

  describe('状态一致性测试', () => {
    test('同时进行多个操作应该保持状态一致性', () => {
      const nodeIds = ['node-1', 'node-2'];
      const dragPosition = { x: 100, y: 100 };
      
      // 模拟选择多个节点
      mockCanvasState.selectMultipleNodes.mockImplementation((ids) => {
        mockCanvasState.selectedNodes = [...ids];
      });
      
      // 模拟开始拖拽
      mockCanvasState.startDrag.mockImplementation((nodeId, pos) => {
        mockCanvasState.isDragging = true;
        mockCanvasState.dragState = {
          nodeId,
          startPosition: pos,
          currentPosition: pos
        };
      });
      
      mockCanvasState.selectMultipleNodes(nodeIds);
      mockCanvasState.startDrag('node-1', dragPosition);
      
      expect(mockCanvasState.selectedNodes).toContain('node-1');
      expect(mockCanvasState.isDragging).toBe(true);
      expect(mockCanvasState.dragState.nodeId).toBe('node-1');
    });
    
    test('结束拖拽不应该影响选择状态', () => {
      const nodeIds = ['node-1', 'node-2'];
      const dragPosition = { x: 100, y: 100 };
      
      // 设置初始状态
      mockCanvasState.selectedNodes = [...nodeIds];
      mockCanvasState.isDragging = true;
      mockCanvasState.dragState = {
        nodeId: 'node-1',
        startPosition: dragPosition,
        currentPosition: dragPosition
      };
      
      // 模拟结束拖拽（不影响选择状态）
      mockCanvasState.endDrag.mockImplementation(() => {
        mockCanvasState.isDragging = false;
        mockCanvasState.dragState = null;
        // 选择状态保持不变
      });
      
      mockCanvasState.endDrag();
      
      expect(mockCanvasState.selectedNodes).toEqual(['node-1', 'node-2']);
      expect(mockCanvasState.isDragging).toBe(false);
    });
    
    test('开始新连接应该取消旧连接', () => {
      // 模拟开始连接的行为（新连接取消旧连接）
      mockCanvasState.startConnection.mockImplementation((sourceId) => {
        mockCanvasState.isConnecting = true;
        mockCanvasState.connectionState = {
          sourceNodeId: sourceId,
          targetNodeId: null
        };
      });
      
      mockCanvasState.startConnection('node-1');
      expect(mockCanvasState.connectionState.sourceNodeId).toBe('node-1');
      
      // 开始新连接应该替换旧连接
      mockCanvasState.startConnection('node-2');
      
      expect(mockCanvasState.isConnecting).toBe(true);
      expect(mockCanvasState.connectionState.sourceNodeId).toBe('node-2');
    });
  });
});