/**
 * 快速Y坐标测试 - 验证NaN问题是否已修复
 */

// 简单的测试函数，直接在浏览器控制台运行
function quickYCoordinateTest() {
  console.log('🧪 [快速测试] 开始Y坐标NaN问题验证');
  
  try {
    // 检查布局引擎是否存在
    if (!window.layoutEngine) {
      console.error('❌ [快速测试] window.layoutEngine 不存在');
      return false;
    }
    
    // 检查布局模型是否存在
    if (!window.layoutEngine.layoutModel) {
      console.error('❌ [快速测试] layoutEngine.layoutModel 不存在');
      return false;
    }
    
    const layoutModel = window.layoutEngine.layoutModel;
    
    // 检查nodeToLayer映射
    if (!layoutModel.nodeToLayer || layoutModel.nodeToLayer.size === 0) {
      console.error('❌ [快速测试] nodeToLayer映射为空或不存在');
      return false;
    }
    
    console.log(`📊 [快速测试] nodeToLayer映射包含 ${layoutModel.nodeToLayer.size} 个节点`);
    
    // 检查所有节点的坐标
    let totalNodes = 0;
    let nanYNodes = [];
    let validYNodes = [];
    
    // 遍历所有图形节点
    if (window.graph && window.graph.getNodes) {
      const graphNodes = window.graph.getNodes();
      console.log(`📊 [快速测试] 图形包含 ${graphNodes.length} 个节点`);
      
      graphNodes.forEach(node => {
        totalNodes++;
        const position = node.getPosition();
        const nodeId = node.id;
        
        if (isNaN(position.y)) {
          nanYNodes.push({
            id: nodeId,
            position: position,
            layerIndex: layoutModel.nodeToLayer.get(nodeId)
          });
        } else {
          validYNodes.push({
            id: nodeId,
            position: position,
            layerIndex: layoutModel.nodeToLayer.get(nodeId)
          });
        }
      });
    }
    
    // 🗑️ [已删除] endpoint节点检查已被新的预览线分层策略替代
    
    // 输出测试结果
    console.log('\n🧪 [快速测试] 测试结果汇总:');
    console.log(`  📊 总节点数: ${totalNodes}`);
    console.log(`  ✅ Y坐标有效的节点: ${validYNodes.length}`);
    console.log(`  ❌ Y坐标为NaN的节点: ${nanYNodes.length}`);
    
    if (nanYNodes.length > 0) {
      console.log('\n❌ [快速测试] 发现Y坐标为NaN的节点:');
      nanYNodes.forEach(nodeInfo => {
        console.log(`  - ${nodeInfo.id}: Y=${nodeInfo.position.y}, 层级=${nodeInfo.layerIndex}${nodeInfo.isEndpoint ? ' (endpoint)' : ''}`);
      });
      
      // 分析NaN节点的层级分布
      const nanByLayer = {};
      nanYNodes.forEach(nodeInfo => {
        const layer = nodeInfo.layerIndex;
        if (!nanByLayer[layer]) {
          nanByLayer[layer] = [];
        }
        nanByLayer[layer].push(nodeInfo.id);
      });
      
      console.log('\n📊 [快速测试] NaN节点按层级分布:');
      Object.keys(nanByLayer).forEach(layer => {
        console.log(`  第${layer}层: ${nanByLayer[layer].length}个节点 - ${nanByLayer[layer].join(', ')}`);
      });
      
      return false;
    } else {
      console.log('\n✅ [快速测试] 所有节点Y坐标都是有效数值!');
      
      // 显示Y坐标分布
      const yCoordinates = validYNodes.map(n => n.position.y).sort((a, b) => a - b);
      const uniqueY = [...new Set(yCoordinates)];
      
      console.log(`📊 [快速测试] Y坐标分布: ${uniqueY.length}个不同的Y值`);
      uniqueY.forEach(y => {
        const nodesAtY = validYNodes.filter(n => n.position.y === y);
        console.log(`  Y=${y}: ${nodesAtY.length}个节点`);
      });
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ [快速测试] 测试过程中发生错误:', error);
    return false;
  }
}

// 在浏览器环境中暴露测试函数
if (typeof window !== 'undefined') {
  window.quickYCoordinateTest = quickYCoordinateTest;
  console.log('✅ [快速测试] 测试函数已加载，请在控制台运行: quickYCoordinateTest()');
}

// 在Node.js环境中直接运行
if (typeof window === 'undefined') {
  console.log('⚠️ [快速测试] Node.js环境，请在浏览器控制台中运行此测试');
}

export { quickYCoordinateTest };