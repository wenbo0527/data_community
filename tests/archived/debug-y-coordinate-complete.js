// 完整的Y坐标调试脚本
console.log('🔍 [Y坐标调试] 开始完整的Y坐标计算和应用流程测试');

// 1. 检查布局引擎实例
const layoutEngine = window.layoutEngine;
if (!layoutEngine) {
  console.error('❌ 布局引擎实例不存在');
  console.log('🔍 检查可用的window对象属性:', Object.keys(window).filter(key => key.includes('layout') || key.includes('graph')));
} else {
  console.log('✅ 布局引擎实例存在');
  console.log('🔍 布局引擎类型:', layoutEngine.constructor.name);
  console.log('🔍 布局引擎方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(layoutEngine)).filter(name => typeof layoutEngine[name] === 'function'));
}

// 2. 检查图形实例 - 从布局引擎获取
let graph = null;
if (layoutEngine && layoutEngine.graph) {
  graph = layoutEngine.graph;
  console.log('✅ 从布局引擎获取图形实例成功');
  console.log('📊 图形中的节点数量:', graph.getNodes().length);
} else {
  console.error('❌ 无法从布局引擎获取图形实例');
  // 尝试其他方式获取graph实例
  if (window.graph) {
    graph = window.graph;
    console.log('✅ 从window.graph获取图形实例');
  } else {
    console.log('🔍 检查可用的window对象属性:', Object.keys(window).filter(key => key.includes('graph')));
  }
}

// 3. 测试calculateLayerY方法
if (layoutEngine && layoutEngine.calculateLayerY) {
  console.log('\n🧮 [calculateLayerY测试] 开始测试Y坐标计算方法');
  
  // 测试不同层级的Y坐标计算
  const testLayers = [0, 1, 2, 3, 4];
  testLayers.forEach(layerIndex => {
    const y = layoutEngine.calculateLayerY(layerIndex);
    console.log(`层级 ${layerIndex} -> Y坐标: ${y}`);
    
    // 验证计算结果
    const expectedY = 100 + (layerIndex * 150);
    if (y === expectedY) {
      console.log(`✅ 层级 ${layerIndex} Y坐标计算正确: ${y}`);
    } else {
      console.error(`❌ 层级 ${layerIndex} Y坐标计算错误: 期望 ${expectedY}, 实际 ${y}`);
    }
  });
  
  // 测试边界情况
  console.log('\n🔬 [边界测试] 测试异常输入');
  const edgeCases = [NaN, null, undefined, -1, 'string', {}, []];
  edgeCases.forEach(input => {
    try {
      const result = layoutEngine.calculateLayerY(input);
      console.log(`输入: ${input} (${typeof input}) -> 结果: ${result}`);
    } catch (error) {
      console.error(`输入: ${input} -> 错误:`, error.message);
    }
  });
} else {
  console.error('❌ calculateLayerY方法不存在');
}

// 4. 检查实际节点的Y坐标
if (graph) {
  console.log('\n📍 [节点位置检查] 检查所有节点的实际位置');
  
  const nodes = graph.getNodes();
  nodes.forEach(node => {
    const nodeId = node.id;
    const position = node.getPosition();
    const size = node.getSize();
    const centerY = position.y + size.height / 2;
    
    console.log(`节点 ${nodeId}:`);
    console.log(`  - 左上角位置: (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
    console.log(`  - 尺寸: ${size.width} x ${size.height}`);
    console.log(`  - 中心Y坐标: ${centerY.toFixed(1)}`);
    console.log(`  - Y坐标是否为NaN: ${isNaN(position.y)}`);
    console.log(`  - 中心Y坐标是否为NaN: ${isNaN(centerY)}`);
    
    if (isNaN(position.y) || isNaN(centerY)) {
      console.error(`❌ 节点 ${nodeId} 的Y坐标为NaN!`);
    }
  });
}

// 5. 检查布局模型状态
if (layoutEngine && layoutEngine.layoutModel) {
  console.log('\n🏗️ [布局模型检查] 检查布局模型状态');
  
  const layoutModel = layoutEngine.layoutModel;
  console.log('布局模型存在:', !!layoutModel);
  
  if (layoutModel.layerCache) {
    console.log('层级缓存大小:', layoutModel.layerCache.size);
    layoutModel.layerCache.forEach((layerIndex, nodeId) => {
      console.log(`节点 ${nodeId} -> 层级 ${layerIndex}`);
    });
  }
  
  if (layoutModel.endpointNodes) {
    console.log('虚拟endpoint节点数量:', layoutModel.endpointNodes.size);
  }
}

// 6. 测试getSimpleLayerIndex方法
if (layoutEngine && layoutEngine.getSimpleLayerIndex && graph) {
  console.log('\n🔢 [层级索引测试] 测试getSimpleLayerIndex方法');
  
  const nodes = graph.getNodes();
  nodes.forEach(node => {
    const nodeId = node.id;
    try {
      const layerIndex = layoutEngine.getSimpleLayerIndex(nodeId);
      console.log(`节点 ${nodeId} -> 层级索引: ${layerIndex}`);
      
      if (typeof layerIndex === 'number' && !isNaN(layerIndex)) {
        const expectedY = layoutEngine.calculateLayerY(layerIndex);
        console.log(`  期望Y坐标: ${expectedY}`);
      } else {
        console.error(`❌ 节点 ${nodeId} 层级索引无效: ${layerIndex}`);
      }
    } catch (error) {
      console.error(`❌ 获取节点 ${nodeId} 层级索引失败:`, error.message);
    }
  });
}

// 7. 强制触发布局更新
if (layoutEngine && layoutEngine.executeLayout) {
  console.log('\n🔄 [强制布局] 尝试强制触发布局更新');
  
  try {
    // 记录更新前的节点位置
    const nodesBefore = {};
    if (graph) {
      graph.getNodes().forEach(node => {
        const pos = node.getPosition();
        nodesBefore[node.id] = { x: pos.x, y: pos.y };
      });
    }
    
    // 执行布局
    layoutEngine.executeLayout().then(() => {
      console.log('✅ 布局更新完成');
      
      // 检查更新后的节点位置
      if (graph) {
        console.log('\n📊 [位置对比] 布局前后位置对比:');
        graph.getNodes().forEach(node => {
          const beforePos = nodesBefore[node.id];
          const afterPos = node.getPosition();
          const afterCenterY = afterPos.y + node.getSize().height / 2;
          
          console.log(`节点 ${node.id}:`);
          console.log(`  更新前: (${beforePos.x.toFixed(1)}, ${beforePos.y.toFixed(1)})`);
          console.log(`  更新后: (${afterPos.x.toFixed(1)}, ${afterPos.y.toFixed(1)})`);
          console.log(`  中心Y坐标: ${afterCenterY.toFixed(1)}`);
          console.log(`  Y坐标是否为NaN: ${isNaN(afterPos.y)}`);
          
          if (isNaN(afterPos.y)) {
            console.error(`❌ 布局更新后节点 ${node.id} Y坐标仍为NaN!`);
          } else {
            console.log(`✅ 节点 ${node.id} Y坐标正常: ${afterPos.y.toFixed(1)}`);
          }
        });
      }
    }).catch(error => {
      console.error('❌ 布局更新失败:', error);
    });
  } catch (error) {
    console.error('❌ 执行布局失败:', error);
  }
} else {
  console.error('❌ executeLayout方法不存在');
}

console.log('\n🏁 [Y坐标调试] 完整测试脚本执行完成');