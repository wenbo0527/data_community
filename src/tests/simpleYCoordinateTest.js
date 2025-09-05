/**
 * 简化的Y坐标一致性测试
 * 直接在浏览器控制台中运行
 */

// 简化测试函数，不依赖模块导入
function runSimpleYCoordinateTest() {
  console.log('🧪 [简化测试] 开始Y坐标一致性验证');
  
  // 检查布局引擎是否存在
  if (typeof window.layoutEngine === 'undefined') {
    console.error('❌ [测试] 未找到全局layoutEngine对象');
    return false;
  }
  
  const layoutEngine = window.layoutEngine;
  
  // 检查是否有节点数据
  if (!layoutEngine.layoutModel) {
    console.error('❌ [测试] 布局模型不存在');
    return false;
  }
  
  console.log('🔍 [测试] 开始检查Y坐标一致性...');
  
  // 收集所有节点位置
  const nodePositions = new Map();
  
  // 检查普通节点
  if (layoutEngine.graph && layoutEngine.graph.getNodes) {
    const nodes = layoutEngine.graph.getNodes();
    nodes.forEach(node => {
      const pos = node.getPosition();
      nodePositions.set(node.id, {
        position: pos,
        type: 'normal',
        nodeType: node.getData()?.type || 'unknown'
      });
      console.log(`📍 [测试] 普通节点 ${node.id}: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}) 类型: ${node.getData()?.type || 'unknown'}`);
    });
  }
  
  // 🗑️ [已删除] 虚拟endpoint节点检查已被新的预览线分层策略替代
  
  // 检查NaN值
  let hasNaN = false;
  nodePositions.forEach((data, nodeId) => {
    const pos = data.position;
    if (isNaN(pos.x) || isNaN(pos.y)) {
      console.error(`❌ [测试] 节点 ${nodeId} 存在NaN坐标: (${pos.x}, ${pos.y})`);
      hasNaN = true;
    }
  });
  
  if (hasNaN) {
    console.error('❌ [测试结果] 发现NaN坐标，Y坐标修复失败！');
    return false;
  }
  
  // 按层级分组验证Y坐标一致性
  const layerGroups = new Map();
  nodePositions.forEach((data, nodeId) => {
    const pos = data.position;
    const layerY = Math.round(pos.y / 200) * 200; // 按200像素分组
    if (!layerGroups.has(layerY)) {
      layerGroups.set(layerY, []);
    }
    layerGroups.get(layerY).push({ nodeId, ...data });
  });
  
  console.log('🔍 [测试] 层级分组结果:');
  let allLayersConsistent = true;
  
  layerGroups.forEach((nodes, layerY) => {
    console.log(`📊 [测试] 层级 Y=${layerY}:`);
    
    const yCoordinates = nodes.map(n => n.position.y);
    const uniqueYs = [...new Set(yCoordinates)];
    const isConsistent = uniqueYs.length === 1;
    
    nodes.forEach(({ nodeId, position, type, nodeType, sourceNodeId }) => {
      const typeInfo = type === 'endpoint' ? `endpoint(源:${sourceNodeId})` : `${type}(${nodeType})`;
      console.log(`  - ${nodeId}: (${position.x.toFixed(1)}, ${position.y.toFixed(1)}) [${typeInfo}]`);
    });
    
    if (isConsistent) {
      console.log(`  ✅ Y坐标一致: ${uniqueYs[0]}`);
    } else {
      console.log(`  ❌ Y坐标不一致: ${uniqueYs.join(', ')}`);
      allLayersConsistent = false;
    }
  });
  
  // 测试结果
  if (allLayersConsistent) {
    console.log('🎉 [测试结果] Y坐标一致性测试通过！所有同层节点Y坐标一致，NaN问题已修复');
  } else {
    console.log('❌ [测试结果] Y坐标一致性测试失败！存在同层节点Y坐标不一致的情况');
  }
  
  return {
    success: allLayersConsistent && !hasNaN,
    hasNaN: hasNaN,
    layerCount: layerGroups.size,
    totalNodes: nodePositions.size,
    layerGroups: Array.from(layerGroups.entries())
  };
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.runSimpleYCoordinateTest = runSimpleYCoordinateTest;
  console.log('🧪 [简化测试] 测试函数已加载，可通过 runSimpleYCoordinateTest() 运行');
}

// 如果在Node.js环境中，直接导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runSimpleYCoordinateTest };
}