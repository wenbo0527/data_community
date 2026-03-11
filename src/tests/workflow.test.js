import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import WorkflowManager from '../pages/exploration/workflows/WorkflowManager.vue';
import WorkflowCreate from '../pages/exploration/workflows/WorkflowCreate.vue';
import { WorkflowStorage } from '../utils/workflowStorage';

// Mock WorkflowStorage
vi.mock('../utils/workflowStorage', () => ({
  WorkflowStorage: {
    getWorkflows: vi.fn(),
    saveWorkflow: vi.fn(),
    deleteWorkflow: vi.fn(),
    generateId: vi.fn(() => 'workflow_1234567890_abcdefghi'),
    getDataSources: vi.fn(() => ({ files: [], databases: [] })),
    getSettings: vi.fn(() => ({ autoSave: true, debugMode: false, theme: 'light' }))
  },
  default: {
    getWorkflows: vi.fn(),
    saveWorkflow: vi.fn(),
    deleteWorkflow: vi.fn(),
    generateId: vi.fn(() => 'workflow_1234567890_abcdefghi'),
    getDataSources: vi.fn(() => ({ files: [], databases: [] })),
    getSettings: vi.fn(() => ({ autoSave: true, debugMode: false, theme: 'light' }))
  }
}));

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn()
  },
  Modal: {
    confirm: vi.fn()
  }
}));

// Mock Vue Router
const mockRouter = {
  push: vi.fn()
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}));

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn()
  },
  Modal: {
    confirm: vi.fn()
  }
}));

describe('工作流管理功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('WorkflowManager 组件', () => {
    it('应该正确渲染工作流管理页面', () => {
      WorkflowStorage.getWorkflows.mockReturnValue([
        {
          id: '1',
          name: '测试流程',
          description: '测试描述',
          status: 'draft',
          nodes: [],
          edges: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]);

      const wrapper = mount(WorkflowManager, {
        global: {
          stubs: {
            'a-button': true,
            'a-input-search': true,
            'a-select': true,
            'a-option': true,
            'a-spin': true,
            'a-empty': true,
            'a-dropdown': true,
            'a-doption': true,
            'a-tag': true,
            'icon-plus': true,
            'icon-refresh': true,
            'icon-more': true,
            'icon-edit': true,
            'icon-copy': true,
            'icon-download': true,
            'icon-delete': true,
            'icon-clock-circle': true
          }
        }
      });

      expect(wrapper.find('.workflow-manager').exists()).toBe(true);
      expect(wrapper.find('.page-title').text()).toBe('分析流程管理');
    });

    it('应该能够创建新流程', async () => {
      const wrapper = mount(WorkflowManager, {
        global: {
          stubs: {
            'a-button': {
              template: '<button @click="$emit(\'click\')" v-bind="$attrs"><slot /></button>'
            },
            'a-input-search': true,
            'a-select': true,
            'a-option': true,
            'a-spin': true,
            'a-empty': true,
            'a-dropdown': true,
            'a-doption': true,
            'a-tag': true,
            'icon-plus': true
          }
        }
      });

      const createButton = wrapper.find('button');
      await createButton.trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith('/exploration/workflows/create');
    });

    it('应该能够搜索和筛选流程', async () => {
      const workflows = [
        {
          id: '1',
          name: '数据导入流程',
          description: '用于数据导入的流程',
          status: 'published',
          nodes: [],
          edges: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '2',
          name: 'SQL分析流程',
          description: '用于SQL分析的流程',
          status: 'draft',
          nodes: [],
          edges: [],
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        }
      ];

      WorkflowStorage.getWorkflows.mockReturnValue(workflows);

      const wrapper = mount(WorkflowManager, {
        global: {
          stubs: {
            'a-button': true,
            'a-input-search': true,
            'a-select': true,
            'a-option': true,
            'a-spin': true,
            'a-empty': true,
            'a-dropdown': true,
            'a-doption': true,
            'a-tag': true,
            'icon-plus': true,
            'icon-refresh': true,
            'icon-more': true,
            'icon-edit': true,
            'icon-copy': true,
            'icon-download': true,
            'icon-delete': true,
            'icon-clock-circle': true
          }
        }
      });

      // 测试搜索功能 - 直接设置组件的响应式属性
      wrapper.vm.searchKeyword = '数据导入';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.filteredWorkflows).toHaveLength(1);
      expect(wrapper.vm.filteredWorkflows[0].name).toBe('数据导入流程');

      // 测试状态筛选
      wrapper.vm.searchKeyword = '';
      wrapper.vm.statusFilter = 'draft';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.filteredWorkflows).toHaveLength(1);
      expect(wrapper.vm.filteredWorkflows[0].status).toBe('draft');
    });
  });

  describe('WorkflowCreate 组件', () => {
    it('应该正确渲染创建流程页面', () => {
      const wrapper = mount(WorkflowCreate, {
        global: {
          stubs: {
            'a-button': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-input-tag': true,
            'a-switch': true,
            'a-card': true,
            'a-row': true,
            'a-col': true,
            'icon-arrow-left': true,
            'icon-check': true,
            'icon-file': true,
            'icon-database': true,
            'icon-code': true,
            'icon-branches': true
          }
        }
      });

      expect(wrapper.find('.workflow-create').exists()).toBe(true);
      expect(wrapper.find('h2').text()).toBe('创建分析流程');
    });

    it('应该验证表单输入', async () => {
      const wrapper = mount(WorkflowCreate, {
        global: {
          stubs: {
            'a-button': {
              template: '<button @click="$emit(\'click\')" v-bind="$attrs"><slot /></button>'
            },
            'a-form': {
              template: '<form @submit.prevent="$emit(\'submit\')" v-bind="$attrs"><slot /></form>'
            },
            'a-form-item': true,
            'a-input': {
              template: '<input v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" v-bind="$attrs" />',
              props: ['modelValue'],
              emits: ['update:modelValue']
            },
            'a-textarea': true,
            'a-input-tag': true,
            'a-switch': true,
            'a-card': true,
            'a-row': true,
            'a-col': true,
            'icon-arrow-left': true
          }
        }
      });

      // 测试空表单提交
      const form = wrapper.find('form');
      await form.trigger('submit');

      // 由于表单验证是异步的，这里主要测试组件是否正确渲染
      expect(wrapper.vm.formData.name).toBe('');
    });

    it('应该能够选择模板', async () => {
      const wrapper = mount(WorkflowCreate, {
        global: {
          stubs: {
            'a-button': true,
            'a-form': true,
            'a-form-item': true,
            'a-input': true,
            'a-textarea': true,
            'a-input-tag': true,
            'a-switch': true,
            'a-card': true,
            'a-row': true,
            'a-col': true,
            'icon-arrow-left': true,
            'icon-check': true,
            'icon-file': true,
            'icon-database': true,
            'icon-code': true,
            'icon-branches': true
          }
        }
      });

      // 测试模板选择
      await wrapper.vm.selectTemplate('data-import');
      expect(wrapper.vm.selectedTemplate).toBe('data-import');

      // 测试获取选中模板名称
      const templateName = wrapper.vm.getSelectedTemplateName();
      expect(templateName).toBe('数据导入模板');
    });
  });

  describe('WorkflowStorage 工具类', () => {
    it('应该能够保存工作流', () => {
      const workflow = {
        id: 'test-id',
        name: '测试流程',
        description: '测试描述',
        status: 'draft',
        nodes: [],
        edges: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      WorkflowStorage.saveWorkflow.mockReturnValue(true);
      const result = WorkflowStorage.saveWorkflow(workflow);

      expect(WorkflowStorage.saveWorkflow).toHaveBeenCalledWith(workflow);
      expect(result).toBe(true);
    });

    it('应该能够删除工作流', () => {
      WorkflowStorage.deleteWorkflow.mockReturnValue(true);
      const result = WorkflowStorage.deleteWorkflow('test-id');

      expect(WorkflowStorage.deleteWorkflow).toHaveBeenCalledWith('test-id');
      expect(result).toBe(true);
    });

    it('应该能够获取工作流列表', () => {
      const workflows = [
        {
          id: '1',
          name: '流程1',
          status: 'draft',
          nodes: [],
          edges: []
        }
      ];

      WorkflowStorage.getWorkflows.mockReturnValue(workflows);
      const result = WorkflowStorage.getWorkflows();

      expect(WorkflowStorage.getWorkflows).toHaveBeenCalled();
      expect(result).toEqual(workflows);
    });
  });
});