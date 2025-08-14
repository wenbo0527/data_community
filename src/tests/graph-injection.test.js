import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import WorkflowEditor from '../pages/exploration/workflows/WorkflowEditor.vue';

// Mock X6 Graph
const mockGraph = {
  addNode: vi.fn(),
  on: vi.fn(),
  dispose: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  canUndo: vi.fn(() => false),
  canRedo: vi.fn(() => false)
};

// Mock X6 Graph constructor
vi.mock('@antv/x6', () => ({
  Graph: vi.fn(() => mockGraph),
  registerVueShape: vi.fn()
}));

// Mock router
const mockRoute = {
  params: { id: 'test-workflow' }
};

const mockRouter = {
  push: vi.fn()
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}));

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn()
  }
}));

describe('Graph实例注入测试', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在initGraph后正确提供graph实例', async () => {
    // 创建一个模拟的canvas元素
    const mockCanvas = document.createElement('div');
    mockCanvas.offsetWidth = 800;
    mockCanvas.offsetHeight = 600;
    
    // Mock canvasRef
    const canvasRef = { value: mockCanvas };
    
    wrapper = mount(WorkflowEditor, {
      global: {
        stubs: {
          'a-button': true,
          'a-dropdown': true,
          'a-doption': true,
          'a-modal': true,
          'a-form': true,
          'a-form-item': true,
          'a-input': true,
          'a-textarea': true,
          'a-select': true,
          'a-option': true,
          'a-switch': true,
          'a-spin': true,
          'icon-left': true,
          'icon-save': true,
          'icon-settings': true,
          'icon-bug': true,
          'icon-undo': true,
          'icon-redo': true,
          'icon-more': true,
          'icon-check': true,
          'icon-archive': true,
          'icon-history': true,
          'icon-branch': true
        }
      }
    });

    // 等待组件挂载和nextTick
    await nextTick();
    await nextTick();

    // 验证Graph构造函数被调用
    const { Graph } = await import('@antv/x6');
    expect(Graph).toHaveBeenCalled();

    // 验证graph实例的方法被调用（说明graph实例已创建）
    expect(mockGraph.on).toHaveBeenCalled();
    
    console.log('✅ Graph实例注入测试通过 - graph实例已正确创建和提供');
  });

  it('应该能够正确处理节点点击事件', async () => {
    wrapper = mount(WorkflowEditor, {
      global: {
        stubs: {
          'a-button': true,
          'a-dropdown': true,
          'a-doption': true,
          'a-modal': true,
          'a-form': true,
          'a-form-item': true,
          'a-input': true,
          'a-textarea': true,
          'a-select': true,
          'a-option': true,
          'a-switch': true,
          'a-spin': true,
          'icon-left': true,
          'icon-save': true,
          'icon-settings': true,
          'icon-bug': true,
          'icon-undo': true,
          'icon-redo': true,
          'icon-more': true,
          'icon-check': true,
          'icon-archive': true,
          'icon-history': true,
          'icon-branch': true
        }
      }
    });

    await nextTick();
    await nextTick();

    // 验证事件绑定
    expect(mockGraph.on).toHaveBeenCalledWith('node:click', expect.any(Function));
    expect(mockGraph.on).toHaveBeenCalledWith('blank:click', expect.any(Function));
    expect(mockGraph.on).toHaveBeenCalledWith('history:change', expect.any(Function));
    
    console.log('✅ 事件绑定测试通过 - graph事件已正确绑定');
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });
});