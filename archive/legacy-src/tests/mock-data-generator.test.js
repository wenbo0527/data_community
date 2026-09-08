/**
 * Mock数据生成器测试用例
 * 测试更新后的mockDataGenerator.js功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import MockDataGenerator from '../utils/mockDataGenerator.js';

describe('MockDataGenerator 数据生成器测试', () => {
  describe('generateQueryMockData 查询模式数据生成', () => {
    it('应该生成包含位置信息的节点数据', () => {
      const result = MockDataGenerator.generateQueryMockData(3, '1234');
      
      expect(result).toBeDefined();
      expect(result.tasks).toBeDefined();
      expect(Array.isArray(result.tasks)).toBe(true);
      expect(result.tasks.length).toBe(3);
      expect(result.totalCount).toBe(3);
      
      const tasks = result.tasks;
      
      // 验证任务包含必要字段
      const task = tasks[0];
      expect(task.id).toBeDefined();
      expect(task.taskName).toBeDefined();
      expect(task.taskType).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.userId).toBe('1234');
      expect(task.createTime).toBeDefined();
      expect(task.updateTime).toBeDefined();
      
      // 验证画布数据结构
      expect(task.canvasData).toBeDefined();
      expect(task.canvasData.nodes).toBeDefined();
      expect(task.canvasData.connections).toBeDefined();
      
      // 验证节点包含位置信息
      if (task.canvasData.nodes.length > 0) {
        const node = task.canvasData.nodes[0];
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
        expect(node.width).toBeDefined();
        expect(node.height).toBeDefined();
        expect(node.ports).toBeDefined();
      }
    });

    it('应该支持草稿和发布状态的任务生成', () => {
      const result = MockDataGenerator.generateQueryMockData(10, '1234');
      const tasks = result.tasks;
      
      const statuses = tasks.map(task => task.status);
      const uniqueStatuses = [...new Set(statuses)];
      
      // 应该包含多种状态
      expect(uniqueStatuses.length).toBeGreaterThan(1);
      
      // 检查是否包含草稿和发布状态
      const hasDraft = statuses.includes('draft');
      const hasPublished = statuses.includes('published');
      
      expect(hasDraft || hasPublished).toBe(true);
    });

    it('应该为发布状态的任务生成publishTime', () => {
      const result = MockDataGenerator.generateQueryMockData(20, '1234');
      const tasks = result.tasks;
      
      const publishedTasks = tasks.filter(task => task.status === 'published');
      
      if (publishedTasks.length > 0) {
        publishedTasks.forEach(task => {
          expect(task.publishTime).toBeDefined();
          expect(typeof task.publishTime).toBe('string');
        });
      }
    });

    it('应该为连接生成样式属性', () => {
      const result = MockDataGenerator.generateQueryMockData(3, '1234');
      const tasks = result.tasks;
      
      expect(tasks.length).toBeGreaterThan(0);
      const task = tasks[0];
      expect(task).toBeDefined();
      expect(task.canvasData).toBeDefined();
      
      if (task.canvasData.connections && task.canvasData.connections.length > 0) {
        const connection = task.canvasData.connections[0];
        expect(connection.attrs).toBeDefined();
        expect(connection.attrs.line).toBeDefined();
        expect(connection.attrs.line.stroke).toBeDefined();
        expect(connection.attrs.line.strokeWidth).toBeDefined();
      }
    });
  });

  describe('generateStatisticsMockData 统计模式数据生成', () => {
    it('应该生成统计数据', () => {
      const mockData = MockDataGenerator.generateStatisticsMockData(5, '1234');
      
      expect(mockData.tasks).toBeDefined();
      expect(mockData.statistics).toBeDefined();
      expect(mockData.statistics.taskStats).toBeDefined();
      expect(mockData.statistics.nodeStats).toBeDefined();
      expect(mockData.statistics.statusStats).toBeDefined();
      expect(mockData.statistics.taskTypeStats).toBeDefined();
      
      const nodeStats = mockData.statistics.nodeStats;
      expect(nodeStats.total).toBeDefined();
      expect(nodeStats.connections).toBeDefined();
      expect(nodeStats.typeDistribution).toBeDefined();
      
      mockData.tasks.forEach(task => {
        expect(task.userId).toBe('1234');
      });
    });

    it('应该正确计算状态分布', () => {
      const mockData = MockDataGenerator.generateStatisticsMockData(10, '1234');
      
      const statusStats = mockData.statistics.statusStats;
      expect(statusStats).toBeDefined();
      
      // 验证状态分布的总数等于任务总数
      const totalFromDist = Object.values(statusStats).reduce((sum, count) => sum + count, 0);
      expect(totalFromDist).toBe(mockData.tasks.length);
    });
  });

  describe('generateCanvasData 画布数据生成', () => {
    it('应该生成包含位置信息的画布数据', () => {
      const canvasData = MockDataGenerator.generateCanvasData('促实名', 100, 100);
      
      expect(canvasData.nodes).toBeDefined();
      expect(canvasData.connections).toBeDefined();
      expect(canvasData.nodes.length).toBeGreaterThan(0);
      
      // 验证所有节点都有位置信息
      canvasData.nodes.forEach(node => {
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
        expect(node.width).toBeDefined();
        expect(node.height).toBeDefined();
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
      });
    });

    it('应该为不同节点类型设置正确的尺寸', () => {
      const canvasData = MockDataGenerator.generateCanvasData('促实名', 100, 100);
      
      canvasData.nodes.forEach(node => {
        if (node.type === 'audience-split') {
          expect(node.width).toBe(140);
          expect(node.height).toBe(80);
        } else {
          expect(node.width).toBe(120);
          expect(node.height).toBe(60);
        }
      });
    });
  });

  describe('辅助方法测试', () => {
    it('generateTaskName 应该生成正确格式的任务名称', () => {
      const taskName = MockDataGenerator.generateTaskName('促实名');
      
      expect(typeof taskName).toBe('string');
      expect(taskName.length).toBeGreaterThan(0);
      expect(taskName).toMatch(/_\d{3}$/);
    });

    it('getRandomNodeType 应该返回有效的节点类型', () => {
      const nodeType = MockDataGenerator.getRandomNodeType('促实名');
      
      expect(typeof nodeType).toBe('string');
      expect(nodeType.length).toBeGreaterThan(0);
    });

    it('generateConnectionLabel 应该返回连接标签', () => {
      const label = MockDataGenerator.generateConnectionLabel('start', 'sms');
      
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});