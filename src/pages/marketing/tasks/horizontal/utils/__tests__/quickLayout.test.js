/**
 * HorizontalQuickLayout 单元测试
 * 测试快速布局算法在各种边界条件下的正确性和健壮性
 */

import { HorizontalQuickLayout } from '../quickLayout.js';

// 模拟X6图节点和边
class MockNode {
  constructor(id, data = {}) {
    this.id = id;
    this.data = data;
    this.ports = data.ports || [];
  }

  getPorts() {
    return this.ports;
  }

  getPort(id) {
    return this.ports.find(port => port.id === id);
  }
}

class MockEdge {
  constructor(source, target) {
    this.source = source;
    this.target = target;
  }

  getSource() {
    return this.source;
  }

  getTarget() {
    return this.target;
  }
}

class MockGraph {
  constructor(nodes = [], edges = []) {
    this.nodes = nodes;
    this.edges = edges;
  }

  getNodes() {
    return this.nodes;
  }

  getEdges() {
    return this.edges;
  }

  getCellById(id) {
    return this.nodes.find(node => node.id === id);
  }
}

describe('HorizontalQuickLayout', () => {
  let layout;

  beforeEach(() => {
    layout = new HorizontalQuickLayout({
      columnSpacing: 250,
      rowHeight: 150,
      startX: 100,
      startY: 100,
      centerAlign: true
    });
  });

  describe('输入参数验证', () => {
    test('应该拒绝空的图实例', async () => {
      await expect(layout.execute(null)).rejects.toThrow('图实例不能为空');
      await expect(layout.execute(undefined)).rejects.toThrow('图实例不能为空');
    });

    test('应该处理无效的图实例', async () => {
      const invalidGraph = { getNodes: null };
      await expect(layout.execute(invalidGraph)).resolves.not.toThrow();
    });

    test('应该处理空节点数组', async () => {
      const emptyGraph = new MockGraph([], []);
      await expect(layout.execute(emptyGraph)).resolves.not.toThrow();
    });
  });

  describe('数据验证', () => {
    test('应该验证节点数据格式', () => {
      const validNodes = [
        new MockNode('node1'),
        new MockNode('node2')
      ];
      
      expect(() => {
        layout.validateGraphData(validNodes, []);
      }).not.toThrow();
    });

    test('应该拒绝无效节点数据', () => {
      const invalidNodes = [
        null,
        undefined,
        {},
        { id: null }
      ];
      
      invalidNodes.forEach((invalidNode, index) => {
        if (index < 2) {
          expect(() => {
            layout.validateGraphData([invalidNode], []);
          }).toThrow(`节点[0]数据无效`);
        } else if (index === 2) {
          expect(() => {
            layout.validateGraphData([invalidNode], []);
          }).toThrow('节点[0]缺少必需的id属性');
        }
      });
    });

    test('应该验证边数据格式', () => {
      const validEdges = [
        new MockEdge({ cell: 'node1' }, { cell: 'node2' })
      ];
      
      expect(() => {
        layout.validateGraphData([], validEdges);
      }).not.toThrow();
    });

    test('应该拒绝无效边数据', () => {
      const invalidEdges = [
        null,
        {},
        { getSource: null, getTarget: () => {} }
      ];
      
      invalidEdges.forEach((invalidEdge, index) => {
        if (index < 2) {
          expect(() => {
            layout.validateGraphData([], [invalidEdge]);
          }).toThrow('边[0]数据无效');
        } else {
          expect(() => {
            layout.validateGraphData([], [invalidEdge]);
          }).toThrow('边[0]缺少getSource或getTarget方法');
        }
      });
    });
  });

  describe('拓扑分层算法', () => {
    test('应该正确处理简单线性拓扑', () => {
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C')
      ];
      
      const edges = [
        new MockEdge({ cell: 'A' }, { cell: 'B' }),
        new MockEdge({ cell: 'B' }, { cell: 'C' })
      ];

      const layers = layout.buildTopologyLayers(nodes, edges);
      
      expect(layers).toHaveLength(3);
      expect(layers[0]).toEqual(['A']);
      expect(layers[1]).toEqual(['B']);
      expect(layers[2]).toEqual(['C']);
    });

    test('应该正确处理分支拓扑', () => {
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C'),
        new MockNode('D')
      ];
      
      const edges = [
        new MockEdge({ cell: 'A' }, { cell: 'B' }),
        new MockEdge({ cell: 'A' }, { cell: 'C' }),
        new MockEdge({ cell: 'B' }, { cell: 'D' }),
        new MockEdge({ cell: 'C' }, { cell: 'D' })
      ];

      const layers = layout.buildTopologyLayers(nodes, edges);
      
      expect(layers.length).toBeGreaterThan(0);
      expect(layers[0]).toEqual(['A']);
      expect(layers[layers.length - 1]).toContain('D');
    });

    test('应该处理孤立节点', () => {
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C') // 孤立节点
      ];
      
      const edges = [
        new MockEdge({ cell: 'A' }, { cell: 'B' })
      ];

      const layers = layout.buildTopologyLayers(nodes, edges);
      
      expect(layers.length).toBeGreaterThan(0);
      
      // 所有节点都应该在某个层中
      const allLayeredNodes = layers.flat();
      expect(allLayeredNodes).toContain('A');
      expect(allLayeredNodes).toContain('B');
      expect(allLayeredNodes).toContain('C');
    });

    test('应该处理循环依赖', () => {
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C')
      ];
      
      const edges = [
        new MockEdge({ cell: 'A' }, { cell: 'B' }),
        new MockEdge({ cell: 'B' }, { cell: 'C' }),
        new MockEdge({ cell: 'C' }, { cell: 'A' }) // 循环
      ];

      const layers = layout.buildTopologyLayers(nodes, edges);
      
      // 应该能处理循环依赖，不会死循环
      expect(layers.length).toBeGreaterThan(0);
      
      // 所有节点都应该在某个层中
      const allLayeredNodes = layers.flat();
      expect(allLayeredNodes).toContain('A');
      expect(allLayeredNodes).toContain('B');
      expect(allLayeredNodes).toContain('C');
    });

    test('应该处理空数据', () => {
      const layers = layout.buildTopologyLayers([], []);
      expect(layers).toEqual([]);
    });

    test('应该处理无效边数据', () => {
      const nodes = [
        new MockNode('A'),
        new MockNode('B')
      ];
      
      const edges = [
        null,
        undefined,
        {},
        new MockEdge(null, null),
        new MockEdge({ cell: 'A' }, { cell: 'B' }) // 这条是有效的
      ];

      const layers = layout.buildTopologyLayers(nodes, edges);
      
      expect(layers.length).toBeGreaterThan(0);
      // 应该能处理无效的边数据而不崩溃
    });
  });

  describe('端口索引计算', () => {
    test('应该正确提取端口索引', () => {
      const node = new MockNode('test', {
        ports: [
          { id: 'out-0', group: 'out' },
          { id: 'out-1', group: 'out' },
          { id: 'out-2', group: 'out' }
        ]
      });

      const index = layout.getPortIndex(node);
      expect(index).toBe(0); // 应该返回最小的索引
    });

    test('应该处理没有输出端口的节点', () => {
      const node = new MockNode('test', {
        ports: [
          { id: 'in-0', group: 'in' },
          { id: 'in-1', group: 'in' }
        ]
      });

      const index = layout.getPortIndex(node);
      expect(index).toBe(0);
    });

    test('应该处理空端口数组', () => {
      const node = new MockNode('test', {
        ports: []
      });

      const index = layout.getPortIndex(node);
      expect(index).toBe(0);
    });

    test('应该处理无效端口ID', () => {
      const node = new MockNode('test', {
        ports: [
          { id: 'invalid', group: 'out' },
          { id: 'out-abc', group: 'out' },
          { id: 'out-5', group: 'out' }
        ]
      });

      const index = layout.getPortIndex(node);
      expect(index).toBe(0); // 无效ID应该返回0，out-5应该返回5，但取最小值
    });

    test('应该处理无效节点', () => {
      expect(layout.getPortIndex(null)).toBe(0);
      expect(layout.getPortIndex(undefined)).toBe(0);
      expect(layout.getPortIndex({})).toBe(0);
    });

    test('应该处理缺少getPorts方法的节点', () => {
      const node = { id: 'test' }; // 没有getPorts方法
      expect(layout.getPortIndex(node)).toBe(0);
    });
  });

  describe('位置计算', () => {
    test('应该计算正确的位置', () => {
      const layers = [
        ['A'],
        ['B', 'C'],
        ['D']
      ];
      
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C'),
        new MockNode('D')
      ];

      const positions = layout.calculatePositions(layers, nodes);
      
      expect(positions).toBeInstanceOf(Map);
      expect(positions.size).toBe(4);
      
      // 检查位置是否合理
      const posA = positions.get('A');
      const posB = positions.get('B');
      const posC = positions.get('C');
      const posD = positions.get('D');
      
      expect(posA.x).toBeLessThan(posB.x); // A在B的左边
      expect(posB.x).toBe(posC.x); // B和C在同一层
      expect(posB.y).not.toBe(posC.y); // B和C的Y坐标不同
    });
  });

  describe('分层结果验证', () => {
    test('应该验证有效的分层结果', () => {
      const layers = [['A'], ['B'], ['C']];
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C')
      ];

      expect(() => {
        layout.validateLayers(layers, nodes);
      }).not.toThrow();
    });

    test('应该拒绝包含未知节点的分层结果', () => {
      const layers = [['A'], ['B'], ['C'], ['D']]; // D不存在
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C')
      ];

      expect(() => {
        layout.validateLayers(layers, nodes);
      }).toThrow('层[3]包含未知节点ID: D');
    });

    test('应该拒绝重复的节点ID', () => {
      const layers = [['A'], ['B'], ['A']]; // A重复出现
      const nodes = [
        new MockNode('A'),
        new MockNode('B')
      ];

      expect(() => {
        layout.validateLayers(layers, nodes);
      }).toThrow('节点ID A 在多个层中出现');
    });

    test('应该检测缺失的节点', () => {
      const layers = [['A'], ['B']]; // 缺少C
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C')
      ];

      expect(() => {
        layout.validateLayers(layers, nodes);
      }).toThrow('以下节点未被包含在分层结果中: C');
    });
  });

  describe('位置验证', () => {
    test('应该验证有效的位置结果', () => {
      const positions = new Map([
        ['A', { x: 100, y: 100 }],
        ['B', { x: 350, y: 150 }],
        ['C', { x: 600, y: 100 }]
      ]);
      
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C')
      ];

      expect(() => {
        layout.validatePositions(positions, nodes);
      }).not.toThrow();
    });

    test('应该拒绝无效的位置数据', () => {
      const positions = new Map([
        ['A', null],
        ['B', { x: 'invalid', y: 150 }],
        ['C', { x: 600, y: NaN }]
      ]);
      
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C')
      ];

      expect(() => {
        layout.validatePositions(positions, nodes);
      }).toThrow();
    });

    test('应该检测缺失的位置', () => {
      const positions = new Map([
        ['A', { x: 100, y: 100 }],
        ['B', { x: 350, y: 150 }]
        // 缺少C
      ]);
      
      const nodes = [
        new MockNode('A'),
        new MockNode('B'),
        new MockNode('C')
      ];

      expect(() => {
        layout.validatePositions(positions, nodes);
      }).toThrow('以下节点缺少位置数据: C');
    });
  });

  describe('错误分类', () => {
    test('应该正确分类验证错误', () => {
      const validationError = new Error('节点数据验证失败');
      const result = layout.classifyError(validationError);
      
      expect(result.type).toBe('VALIDATION_ERROR');
      expect(result.userMessage).toContain('数据格式错误');
      expect(result.severity).toBe('warning');
    });

    test('应该正确分类拓扑错误', () => {
      const topologyError = new Error('拓扑分层失败');
      const result = layout.classifyError(topologyError);
      
      expect(result.type).toBe('TOPOLOGY_ERROR');
      expect(result.userMessage).toContain('拓扑结构异常');
      expect(result.severity).toBe('error');
    });

    test('应该正确分类位置错误', () => {
      const positionError = new Error('坐标计算错误');
      const result = layout.classifyError(positionError);
      
      expect(result.type).toBe('POSITION_ERROR');
      expect(result.userMessage).toContain('位置计算异常');
      expect(result.severity).toBe('error');
    });

    test('应该处理未知错误', () => {
      const unknownError = new Error('未知错误');
      const result = layout.classifyError(unknownError);
      
      expect(result.type).toBe('UNKNOWN_ERROR');
      expect(result.userMessage).toContain('未知错误');
      expect(result.severity).toBe('error');
    });
  });

  describe('性能测试', () => {
    test('应该处理大量节点', () => {
      const nodeCount = 1000;
      const nodes = Array.from({ length: nodeCount }, (_, i) => 
        new MockNode(`node${i}`)
      );
      
      const edges = [];
      for (let i = 0; i < nodeCount - 1; i++) {
        edges.push(new MockEdge({ cell: `node${i}` }, { cell: `node${i + 1}` }));
      }

      const startTime = performance.now();
      const layers = layout.buildTopologyLayers(nodes, edges);
      const endTime = performance.now();
      
      expect(layers.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});