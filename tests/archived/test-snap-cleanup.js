/**
 * 测试吸附后预览线清理功能
 */

console.log('🧪 开始测试吸附后预览线清理功能...');

// 模拟浏览器环境
if (typeof window === 'undefined') {
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    getComputedStyle: () => ({})
  };
  global.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {}
    })
  };
}

// 模拟X6 Graph
class MockGraph {
  constructor() {
    this.cells = new Map();
    this.edges = new Map();
    this.nodes = new Map();
    this.eventListeners = new Map();
  }

  addEdge(config) {
    const edge = {
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...config,
      getSourceCellId: () => config.source?.cell,
      getTargetCellId: () => config.target?.cell,
      getSourceNode: () => this.nodes.get(config.source?.cell),
      getTargetNode: () => this.nodes.get(config.target?.cell),
      setAttrs: (attrs) => { this.attrs = attrs; },
      setLabels: (labels) => { this.labels = labels; },
      getData: () => config.data || {}
    };
    this.edges.set(edge.id, edge);
    this.cells.set(edge.id, edge);
    console.log('✅ 创建边:', edge.id);
    return edge;
  }

  addNode(config) {
    const node = {
      id: config.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...config,
      getPosition: () => ({ x: config.x || 0, y: config.y || 0 }),
      getSize: () => ({ width: config.width || 100, height: config.height || 60 }),
      setPosition: (x, y) => { config.x = x; config.y = y; },
      getData: () => config.data || {}
    };
    this.nodes.set(node.id, node);
    this.cells.set(node.id, node);
    console.log('✅ 创建节点:', node.id);
    return node;
  }

  removeEdge(edgeId) {
    const edge = this.edges.get(edgeId);
    if (edge) {
      this.edges.delete(edgeId);
      this.cells.delete(edgeId);
      console.log('🗑️ 删除边:', edgeId);
      return true;
    }
    return false;
  }

  removeCell(cellId) {
    const cell = this.cells.get(cellId);
    if (cell) {
      this.cells.delete(cellId);
      this.edges.delete(cellId);
      this.nodes.delete(cellId);
      console.log('🗑️ 删除单元格:', cellId);
      return true;
    }
    return false;
  }

  hasCell(cellId) {
    return this.cells.has(cellId);
  }

  getCellById(cellId) {
    return this.cells.get(cellId);
  }

  getEdges() {
    return Array.from(this.edges.values());
  }

  getNodes() {
    return Array.from(this.nodes.values());
  }

  getIncomingEdges(node) {
    const nodeId = typeof node === 'string' ? node : node.id;
    return this.getEdges().filter(edge => edge.getTargetCellId() === nodeId);
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventListeners.has(event)) {
      const handlers = this.eventListeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  container = {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
  };
}

// 创建测试场景
const graph = new MockGraph();

// 创建源节点和目标节点
const sourceNode = graph.addNode({
  id: 'source-node',
  x: 100,
  y: 100,
  width: 120,
  height: 60,
  data: { type: 'start' }
});

const targetNode = graph.addNode({
  id: 'target-node', 
  x: 300,
  y: 200,
  width: 120,
  height: 60,
  data: { type: 'process' }
});

console.log('📋 测试场景创建完成:', {
  sourceNode: sourceNode.id,
  targetNode: targetNode.id,
  totalNodes: graph.getNodes().length,
  totalEdges: graph.getEdges().length
});

// 模拟预览线管理器
class TestPreviewLineManager {
  constructor(graph) {
    this.graph = graph;
    this.previewLines = new Map();
    this.isProcessingSnap = false;
    this.snappedNodes = new Set();
  }

  // 创建预览线
  createPreviewLine(sourceNodeId, targetPosition, branchId = null) {
    const sourceNode = this.graph.getCellById(sourceNodeId);
    if (!sourceNode) {
      console.error('❌ 源节点不存在:', sourceNodeId);
      return null;
    }

    const previewLine = this.graph.addEdge({
      source: { cell: sourceNodeId, port: 'out' },
      target: { x: targetPosition.x, y: targetPosition.y },
      data: {
        type: 'preview-line',
        isPreview: true,
        branchId: branchId
      }
    });

    const previewInstance = {
      line: previewLine,
      sourceNode: sourceNode,
      endPosition: targetPosition,
      branchId: branchId
    };

    this.previewLines.set(sourceNodeId, previewInstance);
    console.log('✅ 创建预览线:', {
      sourceNodeId,
      previewLineId: previewLine.id,
      branchId,
      endPosition: targetPosition
    });

    return previewInstance;
  }

  // 移除预览线
  removePreviewLine(sourceNodeId) {
    const previewInstance = this.previewLines.get(sourceNodeId);
    if (!previewInstance) {
      console.warn('⚠️ 预览线不存在:', sourceNodeId);
      return false;
    }

    // 从图中移除预览线
    const removed = this.graph.removeEdge(previewInstance.line.id);
    
    // 从管理器中移除
    this.previewLines.delete(sourceNodeId);
    
    console.log('🗑️ 移除预览线:', {
      sourceNodeId,
      previewLineId: previewInstance.line.id,
      removed
    });

    return removed;
  }

  // 检查吸附
  checkSnapToPreviewLines(dragNode, nodePosition, nodeSize) {
    console.log('🎯 开始检查吸附:', {
      dragNodeId: dragNode.id,
      position: nodePosition,
      size: nodeSize
    });

    // 检查节点是否已有输入连接
    const edges = this.graph.getIncomingEdges(dragNode);
    if (edges && edges.length > 0) {
      console.log('⏭️ 节点已有输入连接，跳过吸附:', dragNode.id);
      return false;
    }

    // 防止重复吸附
    if (this.isProcessingSnap) {
      console.log('⏭️ 正在处理吸附，跳过重复调用:', dragNode.id);
      return false;
    }

    if (this.snappedNodes.has(dragNode.id)) {
      console.log('⏭️ 节点已被吸附，跳过重复处理:', dragNode.id);
      return false;
    }

    const dragNodeCenter = {
      x: nodePosition.x + nodeSize.width / 2,
      y: nodePosition.y + nodeSize.height / 2
    };

    let closestSnap = null;
    let minDistance = Infinity;
    const snapDistance = 80;

    // 检查所有预览线的终点
    this.previewLines.forEach((previewInstance, sourceNodeId) => {
      if (sourceNodeId === dragNode.id) return;

      // 检查是否已存在连接
      const existingConnection = this.graph.getEdges().find(edge => {
        const sourceNode = edge.getSourceNode();
        const targetNode = edge.getTargetNode();
        return sourceNode && targetNode && 
               sourceNode.id === sourceNodeId && 
               targetNode.id === dragNode.id;
      });

      if (existingConnection) {
        console.log('⏭️ 已存在连接，跳过此源节点:', sourceNodeId);
        return;
      }

      if (previewInstance.endPosition) {
        const distance = Math.sqrt(
          Math.pow(dragNodeCenter.x - previewInstance.endPosition.x, 2) + 
          Math.pow(dragNodeCenter.y - previewInstance.endPosition.y, 2)
        );

        if (distance < snapDistance && distance < minDistance) {
          minDistance = distance;
          closestSnap = {
            x: previewInstance.endPosition.x - nodeSize.width / 2,
            y: previewInstance.endPosition.y - nodeSize.height / 2,
            sourceNodeId: sourceNodeId,
            branchId: previewInstance.branchId,
            distance: distance,
            endPosition: previewInstance.endPosition
          };
        }
      }
    });

    // 执行吸附
    if (closestSnap) {
      console.log('🎯 检测到预览线终点吸附:', {
        dragNodeId: dragNode.id,
        sourceNodeId: closestSnap.sourceNodeId,
        distance: closestSnap.distance,
        snapPosition: { x: closestSnap.x, y: closestSnap.y }
      });

      // 设置吸附处理标志
      this.isProcessingSnap = true;
      this.snappedNodes.add(dragNode.id);

      // 设置节点位置
      dragNode.setPosition(closestSnap.x, closestSnap.y);

      // 延迟创建连接
      setTimeout(() => {
        this.createSnapConnection(closestSnap.sourceNodeId, dragNode.id, closestSnap.branchId);
        this.isProcessingSnap = false;
      }, 100);

      return true;
    }

    return false;
  }

  // 创建吸附连接
  createSnapConnection(sourceNodeId, targetNodeId, branchId) {
    const sourceNode = this.graph.getCellById(sourceNodeId);
    const targetNode = this.graph.getCellById(targetNodeId);

    if (!sourceNode || !targetNode) {
      console.error('❌ 无法找到源节点或目标节点:', { sourceNodeId, targetNodeId });
      return;
    }

    // 创建连接边
    const edge = this.graph.addEdge({
      source: { cell: sourceNodeId, port: 'out' },
      target: { cell: targetNodeId, port: 'in' },
      data: {
        branchId,
        sourceNodeId,
        targetNodeId,
        isAutoSnapped: true
      }
    });

    console.log('✅ 创建吸附连接:', {
      edgeId: edge.id,
      sourceNodeId,
      targetNodeId,
      branchId
    });

    // 🔧 关键：移除对应的预览线
    console.log('🧹 开始清理预览线...');
    const previewLinesBefore = this.previewLines.size;
    const edgesBefore = this.graph.getEdges().length;
    
    const removed = this.removePreviewLine(sourceNodeId);
    
    const previewLinesAfter = this.previewLines.size;
    const edgesAfter = this.graph.getEdges().length;
    
    console.log('📊 预览线清理结果:', {
      removed,
      previewLinesBefore,
      previewLinesAfter,
      edgesBefore,
      edgesAfter,
      previewLinesCleared: previewLinesBefore - previewLinesAfter,
      totalEdgesChange: edgesAfter - edgesBefore
    });

    return edge;
  }

  // 获取统计信息
  getStats() {
    return {
      previewLinesCount: this.previewLines.size,
      totalEdges: this.graph.getEdges().length,
      totalNodes: this.graph.getNodes().length,
      previewEdges: this.graph.getEdges().filter(edge => {
        const data = edge.getData();
        return data.type === 'preview-line' || data.isPreview === true;
      }).length
    };
  }
}

// 开始测试
async function runTest() {
  console.log('\n🧪 === 开始吸附预览线清理测试 ===\n');
  
  const manager = new TestPreviewLineManager(graph);
  
  // 1. 创建预览线
  console.log('📝 步骤1: 创建预览线');
  const previewInstance = manager.createPreviewLine('source-node', { x: 250, y: 230 });
  
  let stats = manager.getStats();
  console.log('📊 创建预览线后统计:', stats);
  
  if (stats.previewLinesCount !== 1) {
    console.error('❌ 测试失败: 预览线创建后数量不正确');
    return;
  }
  
  if (stats.previewEdges !== 1) {
    console.error('❌ 测试失败: 预览边数量不正确');
    return;
  }
  
  // 2. 模拟拖拽目标节点到预览线终点附近
  console.log('\n📝 步骤2: 模拟拖拽目标节点到预览线终点附近');
  const snapResult = manager.checkSnapToPreviewLines(
    targetNode,
    { x: 240, y: 220 }, // 接近预览线终点的位置
    { width: 120, height: 60 }
  );
  
  console.log('🎯 吸附结果:', snapResult);
  
  // 等待异步操作完成
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 3. 检查吸附后的状态
  console.log('\n📝 步骤3: 检查吸附后的状态');
  stats = manager.getStats();
  console.log('📊 吸附后统计:', stats);
  
  // 验证结果
  const success = {
    snapExecuted: snapResult === true,
    previewLineRemoved: stats.previewLinesCount === 0,
    connectionCreated: stats.totalEdges >= 1,
    noPreviewEdgesLeft: stats.previewEdges === 0
  };
  
  console.log('\n✅ 测试结果验证:', success);
  
  const allTestsPassed = Object.values(success).every(test => test === true);
  
  if (allTestsPassed) {
    console.log('\n🎉 所有测试通过！吸附后预览线被正确清理。');
  } else {
    console.log('\n❌ 测试失败！存在以下问题:');
    Object.entries(success).forEach(([test, passed]) => {
      if (!passed) {
        console.log(`   - ${test}: 失败`);
      }
    });
  }
  
  // 4. 详细检查剩余的边
  console.log('\n📝 步骤4: 详细检查剩余的边');
  const remainingEdges = graph.getEdges();
  console.log('🔍 剩余边详情:');
  remainingEdges.forEach((edge, index) => {
    const data = edge.getData();
    console.log(`   ${index + 1}. ${edge.id}:`, {
      type: data.type,
      isPreview: data.isPreview,
      isAutoSnapped: data.isAutoSnapped,
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId()
    });
  });
  
  return allTestsPassed;
}

// 运行测试
runTest().then(success => {
  console.log('\n🏁 测试完成，结果:', success ? '成功' : '失败');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ 测试执行出错:', error);
  process.exit(1);
});