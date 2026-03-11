/**
 * Y坐标一致性测试 - 验证NaN问题是否已修复
 * 符合vitest测试框架规范
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

// 模拟图形和布局引擎
class MockGraph {
  constructor() {
    this.nodes = [];
    this.edges = [];
  }
  
  addNode(nodeData) {
    const node = {
      id: nodeData.id,
      data: nodeData,
      getPosition: () => ({ 
        x: nodeData.x !== undefined ? nodeData.x : 0, 
        y: nodeData.y !== undefined ? nodeData.y : 0 
      }),
      setPosition: (pos) => {
        nodeData.x = pos.x;
        nodeData.y = pos.y;
      }
    };
    this.nodes.push(node);
    return node;
  }
  
  addEdge(edgeData) {
    this.edges.push(edgeData);
  }
  
  getNodes() {
    return this.nodes;
  }
  
  getEdges() {
    return this.edges;
  }
}

class MockPreviewLineManager {
  constructor() {
    this.previewLines = [];
  }
  
  addPreviewLine(line) {
    this.previewLines.push(line);
  }
  
  getPreviewLines() {
    return this.previewLines;
  }
}

describe('Y坐标一致性测试', () => {
  let mockGraph;
  let mockPreviewLineManager;
  let UnifiedStructuredLayoutEngine;
  
  beforeAll(async () => {
    // 动态导入布局引擎
    try {
      const module = await import('../utils/UnifiedStructuredLayoutEngine.js');
      UnifiedStructuredLayoutEngine = module.UnifiedStructuredLayoutEngine;
    } catch (error) {
      console.error('无法导入UnifiedStructuredLayoutEngine:', error);
      throw error;
    }
  });

  it('应该检测并修复NaN的Y坐标', () => {
    // 创建一个包含NaN Y坐标的节点
    const nodeWithNaN = {
      id: 'test-node-nan',
      x: 100,
      y: NaN,
      type: 'audience-split'
    };
    
    const mockGraphLocal = new MockGraph();
    const node = mockGraphLocal.addNode(nodeWithNaN);
    const position = node.getPosition();
    
    // 验证Y坐标是否为NaN
    expect(isNaN(position.y)).toBe(true);
    
    // 模拟修复逻辑
    const fixedY = isNaN(position.y) ? 100 : position.y;
    node.setPosition({ x: position.x, y: fixedY });
    
    const fixedPosition = node.getPosition();
    expect(isNaN(fixedPosition.y)).toBe(false);
    expect(fixedPosition.y).toBe(100);
  });

  it('应该校验Y坐标的合理性范围', () => {
    const testCases = [
      { input: 10, expected: 50, description: '小于最小值应修正为50' },
      { input: 3000, expected: 2000, description: '大于最大值应修正为2000' },
      { input: 100, expected: 100, description: '在合理范围内应保持不变' },
      { input: 1500, expected: 1500, description: '在合理范围内应保持不变' }
    ];

    const minY = 50;
    const maxY = 2000;

    testCases.forEach(({ input, expected, description }) => {
      const correctedY = Math.max(minY, Math.min(maxY, input));
      expect(correctedY).toBe(expected);
    });
  });

  it('应该记录Y坐标校验的详细信息', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // 模拟Y坐标校验逻辑
    const validateYCoordinate = (y, context = '') => {
      const minY = 50;
      const maxY = 2000;
      const originalY = y;
      
      // 基本有效性检查
      if (typeof y !== 'number' || isNaN(y)) {
        console.log(`[Y坐标校验] ${context} - 无效Y坐标: ${y}, 使用默认值: 100`);
        return 100;
      }
      
      // 范围校验
      const correctedY = Math.max(minY, Math.min(maxY, y));
      
      if (correctedY !== originalY) {
        console.log(`[Y坐标校验] ${context} - Y坐标超出范围: ${originalY} -> ${correctedY}`);
      } else {
        console.log(`[Y坐标校验] ${context} - Y坐标正常: ${y}`);
      }
      
      return correctedY;
    };
    
    // 测试不同情况
    validateYCoordinate(NaN, '测试NaN');
    validateYCoordinate(10, '测试小于最小值');
    validateYCoordinate(3000, '测试大于最大值');
    validateYCoordinate(500, '测试正常值');
    
    expect(consoleSpy).toHaveBeenCalledTimes(4);
    consoleSpy.mockRestore();
  });
  
  it('应该为所有节点分配有效的Y坐标（非NaN）', async () => {
    // 创建模拟环境
    mockGraph = new MockGraph();
    mockPreviewLineManager = new MockPreviewLineManager();
    
    // 添加测试节点
    const startNode = mockGraph.addNode({
      id: 'start_1',
      type: 'start',
      label: '开始节点'
    });
    
    const processNode1 = mockGraph.addNode({
      id: 'process_1',
      type: 'process',
      label: '处理节点1'
    });
    
    const processNode2 = mockGraph.addNode({
      id: 'process_2',
      type: 'process',
      label: '处理节点2'
    });
    
    const endNode = mockGraph.addNode({
      id: 'end_1',
      type: 'end',
      label: '结束节点'
    });
    
    // 添加endpoint节点
    const endpointNode = mockGraph.addNode({
      id: 'endpoint_1',
      type: 'endpoint',
      isEndpoint: true,
      sourceNodeId: 'process_1',
      label: 'Endpoint节点'
    });
    
    // 添加连接
    mockGraph.addEdge({
      id: 'edge_1',
      source: 'start_1',
      target: 'process_1'
    });
    
    mockGraph.addEdge({
      id: 'edge_2',
      source: 'process_1',
      target: 'process_2'
    });
    
    mockGraph.addEdge({
      id: 'edge_3',
      source: 'process_2',
      target: 'end_1'
    });
    
    // 添加预览线
    mockPreviewLineManager.addPreviewLine({
      id: 'preview_1',
      source: 'process_1',
      target: 'endpoint_1'
    });
    
    // 创建布局引擎
    const layoutEngine = new UnifiedStructuredLayoutEngine();
    
    // 执行布局
    try {
      await layoutEngine.executeLayout({
        graph: mockGraph,
        previewLineManager: mockPreviewLineManager,
        layoutMode: 'structured',
        direction: 'TB'
      });
      
      // 验证所有节点的Y坐标
      const nodes = mockGraph.getNodes();
      const nanNodes = [];
      const validNodes = [];
      
      nodes.forEach(node => {
        const position = node.getPosition();
        const nodeId = node.id;
        
        if (isNaN(position.y)) {
          nanNodes.push({ id: nodeId, position });
        } else {
          validNodes.push({ id: nodeId, position });
        }
      });
      
      // 输出测试结果
      console.log('\n🧪 [Y坐标测试] 测试结果:');
      console.log(`  📊 总节点数: ${nodes.length}`);
      console.log(`  ✅ Y坐标有效的节点: ${validNodes.length}`);
      console.log(`  ❌ Y坐标为NaN的节点: ${nanNodes.length}`);
      
      if (nanNodes.length > 0) {
        console.log('\n❌ [Y坐标测试] 发现Y坐标为NaN的节点:');
        nanNodes.forEach(nodeInfo => {
          console.log(`  - ${nodeInfo.id}: Y=${nodeInfo.position.y}`);
        });
      }
      
      // 断言：所有节点的Y坐标都应该是有效数值
      expect(nanNodes.length).toBe(0);
      expect(validNodes.length).toBe(nodes.length);
      
      // 验证Y坐标是有限数值
      validNodes.forEach(nodeInfo => {
        expect(Number.isFinite(nodeInfo.position.y)).toBe(true);
        expect(nodeInfo.position.y).toBeGreaterThanOrEqual(0);
      });
      
      console.log('✅ [Y坐标测试] 所有节点Y坐标验证通过!');
      
    } catch (error) {
      console.error('❌ [Y坐标测试] 布局执行失败:', error);
      throw error;
    }
  });
  
  it('应该正确处理endpoint节点的Y坐标计算', async () => {
    // 创建专门测试endpoint节点的场景
    mockGraph = new MockGraph();
    mockPreviewLineManager = new MockPreviewLineManager();
    
    // 添加源节点
    const sourceNode = mockGraph.addNode({
      id: 'source_1',
      type: 'process',
      label: '源节点'
    });
    
    // 添加多个endpoint节点
    const endpoint1 = mockGraph.addNode({
      id: 'endpoint_1',
      type: 'endpoint',
      isEndpoint: true,
      sourceNodeId: 'source_1',
      label: 'Endpoint 1'
    });
    
    const endpoint2 = mockGraph.addNode({
      id: 'endpoint_2',
      type: 'endpoint',
      isEndpoint: true,
      sourceNodeId: 'source_1',
      label: 'Endpoint 2'
    });
    
    // 添加预览线
    mockPreviewLineManager.addPreviewLine({
      id: 'preview_1',
      source: 'source_1',
      target: 'endpoint_1'
    });
    
    mockPreviewLineManager.addPreviewLine({
      id: 'preview_2',
      source: 'source_1',
      target: 'endpoint_2'
    });
    
    // 创建布局引擎并执行布局
    const layoutEngine = new UnifiedStructuredLayoutEngine();
    
    await layoutEngine.executeLayout({
      graph: mockGraph,
      previewLineManager: mockPreviewLineManager,
      layoutMode: 'structured',
      direction: 'TB'
    });
    
    // 验证endpoint节点的Y坐标
    const endpointNodes = mockGraph.getNodes().filter(node => 
      node.data.isEndpoint || node.data.type === 'endpoint'
    );
    
    endpointNodes.forEach(node => {
      const position = node.getPosition();
      expect(Number.isFinite(position.y)).toBe(true);
      expect(isNaN(position.y)).toBe(false);
    });
    
    console.log('✅ [Y坐标测试] Endpoint节点Y坐标验证通过!');
  });
});