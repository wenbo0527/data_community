// 全面Y坐标调试脚本 - 检查完整的计算链路
// 在浏览器控制台中运行此脚本

console.log('🔍 [全面调试] 开始Y坐标计算链路全面检查');

// 1. 检查全局实例
const graph = window.graph;
const layoutEngine = window.layoutEngine;

console.log('📊 [实例检查] 全局实例状态:', {
  graph: !!graph,
  layoutEngine: !!layoutEngine,
  graphType: graph ? graph.constructor.name : 'undefined',
  layoutEngineType: layoutEngine ? layoutEngine.constructor.name : 'undefined'
});

if (!graph || !layoutEngine) {
  console.error('❌ [实例检查] 缺少必要的全局实例');
  console.log('请确保在TaskFlowCanvas.vue中正确暴露了graph和layoutEngine实例');
}

// 2. 检查问题节点
const problemNodeId = 'node_1756349599799';
const problemNode = graph ? graph.getCell(problemNodeId) : null;

console.log('🎯 [问题节点] 节点详情:', {
  nodeId: problemNodeId,
  nodeExists: !!problemNode,
  nodeType: problemNode ? problemNode.getType?.() : 'unknown',
  currentPosition: problemNode ? problemNode.getPosition() : 'unknown',
  nodeData: problemNode ? problemNode.getData() : 'unknown'
});

// 3. 检查布局引擎配置
if (layoutEngine) {
  console.log('⚙️ [布局引擎] 配置检查:', {
    hasOptions: !!layoutEngine.options,
    options: layoutEngine.options,
    hasLayoutModel: !!layoutEngine.layoutModel,
    layoutModelKeys: layoutEngine.layoutModel ? Object.keys(layoutEngine.layoutModel) : [],
    hasCalculateLayerY: typeof layoutEngine.calculateLayerY === 'function',
    hasExecuteLayout: typeof layoutEngine.executeLayout === 'function'
  });

  // 4. 检查nodeToLayer映射
  if (layoutEngine.layoutModel && layoutEngine.layoutModel.nodeToLayer) {
    const nodeToLayer = layoutEngine.layoutModel.nodeToLayer;
    console.log('🗺️ [层级映射] nodeToLayer状态:', {
      mapSize: nodeToLayer.size,
      hasProblemNode: nodeToLayer.has(problemNodeId),
      problemNodeLayer: nodeToLayer.get(problemNodeId),
      allMappings: Array.from(nodeToLayer.entries())
    });

    // 5. 测试calculateLayerY方法
    if (typeof layoutEngine.calculateLayerY === 'function') {
      console.log('🧪 [方法测试] 测试calculateLayerY方法:');
      
      // 测试不同的layerIndex值
      const testLayerIndexes = [0, 1, 2, -1, NaN, undefined, null, 'invalid'];
      
      testLayerIndexes.forEach(testIndex => {
        try {
          console.log(`  测试layerIndex=${testIndex} (type: ${typeof testIndex}):`);
          const result = layoutEngine.calculateLayerY(testIndex);
          console.log(`    结果: ${result} (type: ${typeof result}, isNaN: ${isNaN(result)})`);
        } catch (error) {
          console.log(`    错误: ${error.message}`);
        }
      });

      // 6. 测试问题节点的层级索引
      if (nodeToLayer.has(problemNodeId)) {
        const problemNodeLayerIndex = nodeToLayer.get(problemNodeId);
        console.log(`🎯 [问题节点测试] 节点${problemNodeId}的层级索引: ${problemNodeLayerIndex}`);
        
        try {
          const calculatedY = layoutEngine.calculateLayerY(problemNodeLayerIndex);
          console.log(`  计算出的Y坐标: ${calculatedY}`);
          console.log(`  Y坐标是否为NaN: ${isNaN(calculatedY)}`);
        } catch (error) {
          console.error(`  计算Y坐标时出错: ${error.message}`);
        }
      } else {
        console.warn(`⚠️ [问题节点测试] 节点${problemNodeId}不在nodeToLayer映射中`);
      }
    }
  }

  // 7. 检查布局引擎的基础配置
  if (layoutEngine.options) {
    const options = layoutEngine.options;
    console.log('📐 [配置检查] 布局引擎配置:', {
      hasCanvas: !!options.canvas,
      canvasWidth: options.canvas?.width,
      canvasHeight: options.canvas?.height,
      hasNode: !!options.node,
      nodeSpacing: options.node?.preferredSpacing,
      hasLayer: !!options.layer,
      layerSpacing: options.layer?.spacing,
      baseY: options.layer?.baseY
    });

    // 8. 手动计算Y坐标验证
    if (options.layer && typeof options.layer.baseY === 'number' && typeof options.layer.spacing === 'number') {
      console.log('🧮 [手动计算] 验证Y坐标计算公式:');
      const baseY = options.layer.baseY;
      const layerSpacing = options.layer.spacing;
      
      console.log(`  baseY: ${baseY}`);
      console.log(`  layerSpacing: ${layerSpacing}`);
      
      for (let i = 0; i <= 3; i++) {
        const manualY = baseY + i * layerSpacing;
        console.log(`  第${i}层手动计算Y坐标: ${manualY}`);
      }
    }
  }

  // 9. 尝试重新执行布局
  console.log('🔄 [布局重执行] 尝试重新执行布局计算:');
  try {
    if (typeof layoutEngine.executeLayout === 'function') {
      layoutEngine.executeLayout();
      console.log('✅ [布局重执行] 布局重新执行完成');
      
      // 重新检查问题节点位置
      setTimeout(() => {
        const updatedPosition = problemNode ? problemNode.getPosition() : null;
        console.log('🔍 [重执行后检查] 问题节点位置:', updatedPosition);
        
        if (updatedPosition && isNaN(updatedPosition.y)) {
          console.error('❌ [重执行后检查] Y坐标仍然是NaN');
        } else {
          console.log('✅ [重执行后检查] Y坐标已修复');
        }
      }, 1000);
    } else {
      console.warn('⚠️ [布局重执行] executeLayout方法不存在');
    }
  } catch (error) {
    console.error('❌ [布局重执行] 重新执行布局时出错:', error);
  }

} else {
  console.error('❌ [布局引擎] layoutEngine实例不存在');
}

// 10. 检查所有节点的Y坐标状态
if (graph) {
  console.log('📊 [全节点检查] 检查所有节点的Y坐标状态:');
  const allNodes = graph.getNodes();
  const nanNodes = [];
  const validNodes = [];
  
  allNodes.forEach(node => {
    const nodeId = node.id;
    const position = node.getPosition();
    
    if (isNaN(position.y)) {
      nanNodes.push({ id: nodeId, position, type: node.getType?.() });
    } else {
      validNodes.push({ id: nodeId, position, type: node.getType?.() });
    }
  });
  
  console.log(`  总节点数: ${allNodes.length}`);
  console.log(`  Y坐标为NaN的节点: ${nanNodes.length}个`);
  console.log(`  Y坐标正常的节点: ${validNodes.length}个`);
  
  if (nanNodes.length > 0) {
    console.log('  Y坐标为NaN的节点详情:', nanNodes);
  }
  
  if (validNodes.length > 0) {
    console.log('  Y坐标正常的节点详情:', validNodes.slice(0, 5)); // 只显示前5个
  }
}

console.log('🏁 [全面调试] Y坐标计算链路全面检查完成');
console.log('请查看上述输出，定位Y坐标NaN问题的具体原因');