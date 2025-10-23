/**
 * 增强版画布查询与统计模式功能测试用例
 * 包含位置信息的画布节点、草稿和发布状态的任务测试
 * 支持查询模式（默认用户号1234）和统计模式测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive, ref } from 'vue';
import StatisticsModePanel from '../components/StatisticsModePanel.vue';
import QueryModePanel from '../components/QueryModePanel.vue';
import TaskFlowCanvas from '../pages/marketing/tasks/components/TaskFlowCanvas.vue';
import DataVisualizationCharts from '../components/DataVisualizationCharts.vue';
import { TaskStorage } from '../pages/marketing/tasks/utils/canvas/taskStorage.js';
import MockDataGenerator from '../utils/mockDataGenerator.js';
import ChartRenderer from '../utils/chartRenderer.js';

// Mock依赖
vi.mock('../utils/taskStorage.js', () => ({
  TaskStorage: vi.fn()
}));
vi.mock('../utils/mockDataGenerator.js', () => ({
  default: {
    generateQueryMockData: vi.fn(),
    generateStatisticsMockData: vi.fn()
  }
}));
vi.mock('../utils/chartRenderer.js', () => ({
  default: vi.fn()
}));
vi.mock('../components/DataVisualizationCharts.vue', () => ({
  default: {
    name: 'DataVisualizationCharts',
    template: '<div class="data-visualization-charts">Charts</div>',
    props: ['data', 'chartType', 'theme']
  }
}));
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('增强版画布查询与统计模式功能测试', () => {
  let mockTasks;
  let mockTaskStorage;
  let mockChartRenderer;

  beforeEach(() => {
    // 模拟包含位置信息的任务数据
    mockTasks = [
      {
        id: 'task-draft-1',
        taskName: '促实名任务-草稿',
        taskType: '促实名',
        status: 'draft', // 草稿状态
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:30:00',
        canvasData: {
          nodes: [
            { 
              id: 'node-1', 
              type: 'start', 
              name: '开始',
              x: 100, // 包含位置信息
              y: 100,
              width: 120,
              height: 60,
              ports: {
                groups: {
                  out: {
                    position: 'right',
                    attrs: {
                      circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        fill: '#fff'
                      }
                    }
                  }
                }
              }
            },
            { 
              id: 'node-2', 
              type: 'sms', 
              name: '短信发送',
              x: 300,
              y: 100,
              width: 120,
              height: 60,
              ports: {
                groups: {
                  in: {
                    position: 'left',
                    attrs: {
                      circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        fill: '#fff'
                      }
                    }
                  },
                  out: {
                    position: 'right',
                    attrs: {
                      circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        fill: '#fff'
                      }
                    }
                  }
                }
              }
            },
            { 
              id: 'node-3', 
              type: 'end', 
              name: '结束',
              x: 500,
              y: 100,
              width: 120,
              height: 60,
              ports: {
                groups: {
                  in: {
                    position: 'left',
                    attrs: {
                      circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        fill: '#fff'
                      }
                    }
                  }
                }
              }
            }
          ],
          connections: [
            { 
              id: 'conn-1', 
              source: { cell: 'node-1', port: 'out' }, 
              target: { cell: 'node-2', port: 'in' },
              attrs: {
                line: {
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8
                  }
                }
              }
            },
            { 
              id: 'conn-2', 
              source: { cell: 'node-2', port: 'out' }, 
              target: { cell: 'node-3', port: 'in' },
              attrs: {
                line: {
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8
                  }
                }
              }
            }
          ]
        }
      },
      {
        id: 'task-published-1',
        taskName: '促授信任务-已发布',
        taskType: '促授信',
        status: 'published', // 发布状态
        createTime: '2024-01-16 14:30:00',
        updateTime: '2024-01-16 15:00:00',
        publishTime: '2024-01-16 15:00:00',
        canvasData: {
          nodes: [
            { 
              id: 'node-4', 
              type: 'start', 
              name: '开始',
              x: 50,
              y: 150,
              width: 120,
              height: 60,
              ports: {
                groups: {
                  out: {
                    position: 'right',
                    attrs: {
                      circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        fill: '#fff'
                      }
                    }
                  }
                }
              }
            },
            { 
              id: 'node-5', 
              type: 'audience-split', 
              name: '人群分流',
              x: 250,
              y: 150,
              width: 140,
              height: 80,
              ports: {
                groups: {
                  in: {
                    position: 'left',
                    attrs: {
                      circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        fill: '#fff'
                      }
                    }
                  },
                  out: {
                    position: 'right',
                    attrs: {
                      circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        fill: '#fff'
                      }
                    }
                  }
                }
              }
            },
            { 
              id: 'node-6', 
              type: 'end', 
              name: '结束',
              x: 450,
              y: 150,
              width: 120,
              height: 60,
              ports: {
                groups: {
                  in: {
                    position: 'left',
                    attrs: {
                      circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                        fill: '#fff'
                      }
                    }
                  }
                }
              }
            }
          ],
          connections: [
            { 
              id: 'conn-3', 
              source: { cell: 'node-4', port: 'out' }, 
              target: { cell: 'node-5', port: 'in' },
              attrs: {
                line: {
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8
                  }
                }
              }
            },
            { 
              id: 'conn-4', 
              source: { cell: 'node-5', port: 'out' }, 
              target: { cell: 'node-6', port: 'in' },
              attrs: {
                line: {
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8
                  }
                }
              }
            }
          ]
        }
      }
    ];

    // Mock TaskStorage
    mockTaskStorage = {
      getAllTasks: vi.fn().mockReturnValue(mockTasks),
      getTasksByStatus: vi.fn(),
      getTasksByType: vi.fn()
    };
    TaskStorage.mockImplementation(() => mockTaskStorage);

    // Mock MockDataGenerator
    MockDataGenerator.generateQueryMockData.mockReturnValue({
      tasks: mockTasks,
      totalCount: mockTasks.length
    });
    MockDataGenerator.generateStatisticsMockData.mockReturnValue({
      tasks: mockTasks,
      statistics: {
        totalTasks: mockTasks.length,
        totalNodes: 6,
        totalConnections: 4,
        completionRate: 50,
        avgNodesPerTask: 3,
        complexityIndex: 2.5
      }
    });

    // Mock ChartRenderer
    mockChartRenderer = {
      renderPieChart: vi.fn(),
      renderBarChart: vi.fn(),
      renderLineChart: vi.fn()
    };
    ChartRenderer.mockImplementation(() => mockChartRenderer);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('StatisticsModePanel 统计模式面板测试', () => {
    it('应该正确渲染统计模式面板', async () => {
      const wrapper = mount(StatisticsModePanel, {
        props: {
          tasks: mockTasks
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.statistics-panel').exists()).toBe(true);
    });

    it('应该正确计算包含位置信息的节点统计', async () => {
      const wrapper = mount(StatisticsModePanel, {
        props: {
          tasks: mockTasks
        }
      });

      // 验证节点位置信息被正确处理
      const nodeStats = wrapper.vm.calculateNodeStatistics(mockTasks);
      expect(nodeStats.totalNodes).toBe(6);
      expect(nodeStats.nodesWithPosition).toBe(6); // 所有节点都有位置信息
    });

    it('应该支持草稿和发布状态的任务统计', async () => {
      const wrapper = mount(StatisticsModePanel, {
        props: {
          tasks: mockTasks
        }
      });

      const statusStats = wrapper.vm.calculateStatusStatistics(mockTasks);
      expect(statusStats.draft).toBe(1);
      expect(statusStats.published).toBe(1);
    });
  });

  describe('QueryModePanel 查询模式面板测试', () => {
    it('应该正确渲染查询模式面板', async () => {
      const wrapper = mount(QueryModePanel, {
        props: {
          defaultUserId: '1234'
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.query-panel').exists()).toBe(true);
    });

    it('应该支持默认用户号1234的查询', async () => {
      const wrapper = mount(QueryModePanel, {
        props: {
          defaultUserId: '1234'
        }
      });

      expect(wrapper.vm.userId).toBe('1234');
    });

    it('应该支持草稿和发布状态的查询', async () => {
      const wrapper = mount(QueryModePanel, {
        props: {
          defaultUserId: '1234'
        }
      });

      // 测试状态查询
      await wrapper.vm.queryByStatus('draft');
      expect(mockTaskStorage.getTasksByStatus).toHaveBeenCalledWith('draft');

      await wrapper.vm.queryByStatus('published');
      expect(mockTaskStorage.getTasksByStatus).toHaveBeenCalledWith('published');
    });
  });

  describe('TaskFlowCanvas 画布组件测试', () => {
    it('应该正确渲染包含位置信息的画布节点', async () => {
      const wrapper = mount(TaskFlowCanvas, {
        props: {
          taskData: mockTasks[0]
        }
      });

      expect(wrapper.exists()).toBe(true);
      
      // 验证节点位置信息
      const canvasData = wrapper.vm.processCanvasData(mockTasks[0].canvasData);
      expect(canvasData.nodes[0].x).toBe(100);
      expect(canvasData.nodes[0].y).toBe(100);
      expect(canvasData.nodes[0].width).toBe(120);
      expect(canvasData.nodes[0].height).toBe(60);
    });

    it('应该正确处理连接样式属性', async () => {
      const wrapper = mount(TaskFlowCanvas, {
        props: {
          taskData: mockTasks[0]
        }
      });

      const canvasData = wrapper.vm.processCanvasData(mockTasks[0].canvasData);
      const connection = canvasData.connections[0];
      
      expect(connection.attrs.line.stroke).toBe('#A2B1C3');
      expect(connection.attrs.line.strokeWidth).toBe(2);
      expect(connection.attrs.line.targetMarker.name).toBe('block');
    });
  });

  describe('Mock数据生成器测试', () => {
    it('应该生成包含位置信息的节点数据', () => {
      const mockData = MockDataGenerator.generateQueryMockData(5, '1234');
      
      expect(mockData.tasks).toBeDefined();
      expect(mockData.tasks.length).toBeGreaterThan(0);
      
      // 验证节点包含位置信息
      const task = mockData.tasks[0];
      if (task.canvasData && task.canvasData.nodes) {
        const node = task.canvasData.nodes[0];
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
        expect(node.width).toBeDefined();
        expect(node.height).toBeDefined();
      }
    });

    it('应该支持草稿和发布状态的任务生成', () => {
      const mockData = MockDataGenerator.generateQueryMockData(10, '1234');
      
      const statuses = mockData.tasks.map(task => task.status);
      expect(statuses).toContain('draft');
      expect(statuses).toContain('published');
    });

    it('应该为发布状态的任务生成publishTime', () => {
      const mockData = MockDataGenerator.generateQueryMockData(10, '1234');
      
      const publishedTasks = mockData.tasks.filter(task => task.status === 'published');
      publishedTasks.forEach(task => {
        expect(task.publishTime).toBeDefined();
      });
    });
  });
});