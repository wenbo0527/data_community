/**
 * 画布查询与统计模式功能测试用例
 * 测试StatisticsModePanel和QueryModePanel的数据统计、查询、图表渲染等功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestEnvironment } from './mockFactory.js';
import StatisticsModePanel from '../components/StatisticsModePanel.vue';
import QueryModePanel from '../components/QueryModePanel.vue';
import { TaskStorage } from '../pages/marketing/tasks/utils/canvas/taskStorage.js';
import MockDataGenerator from '../utils/mockDataGenerator.js';
import ChartRenderer from '../utils/chartRenderer.js';

// Mock依赖
vi.mock('../utils/taskStorage.js');
vi.mock('../utils/mockDataGenerator.js');
vi.mock('../utils/chartRenderer.js');
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('画布查询与统计模式功能测试', () => {
  let testEnv;
  let mockTasks;
  let mockTaskStorage;
  let mockChartRenderer;

  beforeEach(() => {
    testEnv = createTestEnvironment();
    
    // 模拟任务数据
    mockTasks = [
      {
        id: 'task-1',
        taskName: '促实名任务1',
        taskType: '促实名',
        status: 'running',
        createTime: '2024-01-15 10:00:00',
        canvasData: {
          nodes: [
            { id: 'node-1', type: 'start', name: '开始' },
            { id: 'node-2', type: 'sms', name: '短信发送' },
            { id: 'node-3', type: 'end', name: '结束' }
          ],
          connections: [
            { id: 'conn-1', source: 'node-1', target: 'node-2' },
            { id: 'conn-2', source: 'node-2', target: 'node-3' }
          ]
        }
      },
      {
        id: 'task-2',
        taskName: '促授信任务1',
        taskType: '促授信',
        status: 'completed',
        createTime: '2024-01-16 14:30:00',
        canvasData: {
          nodes: [
            { id: 'node-4', type: 'start', name: '开始' },
            { id: 'node-5', type: 'crowd-split', name: '人群分流' },
            { id: 'node-6', type: 'push', name: '推送' },
            { id: 'node-7', type: 'end', name: '结束' }
          ],
          connections: [
            { id: 'conn-3', source: 'node-4', target: 'node-5' },
            { id: 'conn-4', source: 'node-5', target: 'node-6' },
            { id: 'conn-5', source: 'node-6', target: 'node-7' }
          ]
        }
      },
      {
        id: 'task-3',
        taskName: '促支用任务1',
        taskType: '促支用',
        status: 'draft',
        createTime: '2024-01-17 09:15:00',
        canvasData: {
          nodes: [
            { id: 'node-8', type: 'start', name: '开始' },
            { id: 'node-9', type: 'email', name: '邮件' }
          ],
          connections: [
            { id: 'conn-6', source: 'node-8', target: 'node-9' }
          ]
        }
      }
    ];

    // Mock TaskStorage
    mockTaskStorage = {
      getAllTasks: vi.fn().mockResolvedValue(mockTasks),
      getTaskById: vi.fn(),
      saveTask: vi.fn(),
      deleteTask: vi.fn()
    };
    TaskStorage.mockImplementation(() => mockTaskStorage);

    // Mock ChartRenderer
    mockChartRenderer = {
      renderPieChart: vi.fn(),
      renderBarChart: vi.fn(),
      renderLineChart: vi.fn(),
      destroy: vi.fn(),
      resize: vi.fn()
    };
    ChartRenderer.renderPieChart = mockChartRenderer.renderPieChart;
    ChartRenderer.renderBarChart = mockChartRenderer.renderBarChart;
    ChartRenderer.renderLineChart = mockChartRenderer.renderLineChart;

    // Mock MockDataGenerator
    MockDataGenerator.generateTasks = vi.fn().mockReturnValue(mockTasks);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('StatisticsModePanel - 统计模式面板', () => {
    let wrapper;

    beforeEach(() => {
      const mockCanvasData = {
        nodes: mockTasks.flatMap(task => task.canvasData?.nodes || []),
        connections: mockTasks.flatMap(task => task.canvasData?.connections || [])
      };
      
      wrapper = mount(StatisticsModePanel, {
        props: {
          canvasData: mockCanvasData,
          graph: testEnv.graph
        },
        global: {
          stubs: {
            'a-card': { template: '<div><slot /></div>' },
            'a-statistic': { template: '<div>{{ title }}: {{ value }}</div>', props: ['title', 'value'] },
            'a-select': { template: '<select><slot /></select>' },
            'a-button': { template: '<button @click="$emit(\"click\")"><slot /></button>' },
            'a-table': { template: '<table><slot /></table>' },
            'a-tabs': { template: '<div><slot /></div>' },
            'a-row': { template: '<div class="row"><slot /></div>' },
            'a-col': { template: '<div class="col"><slot /></div>' }
          }
        }
      });
    });

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
      }
    });

    describe('组件初始化', () => {
      it('应该正确渲染统计模式面板', () => {
        expect(wrapper.find('.statistics-mode-panel').exists()).toBe(true);
      });

      it('应该包含统计控制区域', () => {
        expect(wrapper.find('.statistics-controls').exists()).toBe(true);
      });

      it('应该包含概览统计卡片', () => {
        expect(wrapper.find('.statistics-overview').exists()).toBe(true);
      });
    });

    describe('统计数据计算', () => {
      it('应该正确计算任务总数', async () => {
        await wrapper.vm.$nextTick();
        await wrapper.vm.refreshStatistics();
        
        expect(wrapper.vm.overviewStats.totalTasks).toBe(2);
      });

      it('应该正确计算节点总数', async () => {
        await wrapper.vm.$nextTick();
        await wrapper.vm.refreshStatistics();
        
        // 总节点数: 3 + 4 = 7
        expect(wrapper.vm.overviewStats.totalNodes).toBe(7);
      });

      it('应该正确计算连接总数', async () => {
        await wrapper.vm.$nextTick();
        await wrapper.vm.refreshStatistics();
        
        // 总连接数: 2 + 3 = 5
        expect(wrapper.vm.overviewStats.totalConnections).toBe(5);
      });
    });

    describe('统计维度功能', () => {
      it('应该支持按任务类型统计', async () => {
        await wrapper.vm.$nextTick();
        
        wrapper.vm.statsParams.dimension = 'taskType';
        await wrapper.vm.refreshStatistics();
        
        expect(wrapper.vm.statsParams.dimension).toBe('taskType');
      });

      it('应该支持按任务状态统计', async () => {
        await wrapper.vm.$nextTick();
        
        wrapper.vm.statsParams.dimension = 'status';
        await wrapper.vm.refreshStatistics();
        
        expect(wrapper.vm.statsParams.dimension).toBe('status');
      });
    });

    describe('错误处理', () => {
      it('应该处理数据加载失败', async () => {
        const { Message } = await import('@arco-design/web-vue');
        mockTaskStorage.getAllTasks.mockRejectedValue(new Error('加载失败'));
        
        await wrapper.vm.refreshStatistics();
        
        expect(Message.error).toHaveBeenCalledWith('统计数据更新失败');
      });

      it('应该处理空数据情况', async () => {
        mockTaskStorage.getAllTasks.mockResolvedValue([]);
        
        await wrapper.vm.refreshStatistics();
        
        expect(wrapper.vm.overviewStats.totalTasks).toBe(0);
        expect(wrapper.vm.overviewStats.totalNodes).toBe(0);
        expect(wrapper.vm.overviewStats.totalConnections).toBe(0);
      });
    });
  });

  describe('QueryModePanel - 查询模式面板', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(QueryModePanel, {
        global: {
          stubs: {
            'a-card': { template: '<div><slot /></div>' },
            'a-select': { template: '<select><slot /></select>' },
            'a-button': { template: '<button @click="$emit(\"click\")"><slot /></button>' },
            'a-table': { template: '<table><slot /></table>' },
            'a-tabs': { template: '<div><slot /></div>' }
          }
        }
      });
    });

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
      }
    });

    describe('组件初始化', () => {
      it('应该正确渲染查询模式面板', () => {
        expect(wrapper.find('.query-mode-panel').exists()).toBe(true);
      });

      it('应该包含查询控制区域', () => {
        expect(wrapper.find('.query-controls').exists()).toBe(true);
      });

      it('应该包含查询结果展示区域', () => {
        expect(wrapper.find('.query-results').exists()).toBe(true);
      });
    });

    describe('查询功能', () => {
      it('应该支持按任务名称查询', async () => {
        wrapper.vm.queryParams.taskName = '促实名';
        await wrapper.vm.executeQuery();
        
        expect(wrapper.vm.queryParams.taskName).toBe('促实名');
      });

      it('应该支持按任务类型查询', async () => {
        wrapper.vm.queryParams.taskType = '促授信';
        await wrapper.vm.executeQuery();
        
        expect(wrapper.vm.queryParams.taskType).toBe('促授信');
      });

      it('应该支持按任务状态查询', async () => {
        wrapper.vm.queryParams.status = 'running';
        await wrapper.vm.executeQuery();
        
        expect(wrapper.vm.queryParams.status).toBe('running');
      });
    });

    describe('错误处理', () => {
      it('应该处理查询失败', async () => {
        const { Message } = await import('@arco-design/web-vue');
        mockTaskStorage.getAllTasks.mockRejectedValue(new Error('查询失败'));
        
        await wrapper.vm.executeQuery();
        
        expect(Message.error).toHaveBeenCalledWith('查询失败，请重试');
      });
    });
  });
});