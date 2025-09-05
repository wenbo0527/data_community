// 🔍 浏览器Y坐标调试脚本
// 请在浏览器控制台中运行此脚本

(async function() {
  console.log('🔍 [Y坐标调试] 开始完整的Y坐标计算和应用流程测试');
  
  // 1. 检查布局引擎实例
  console.log('\n=== 1. 检查布局引擎实例 ===');
  const layoutEngine = window.layoutEngine;
  if (!layoutEngine) {
    console.error('❌ 布局引擎实例不存在');
    console.log('🔍 检查window对象中的可用属性:', Object.keys(window).filter(key => key.includes('layout') || key.includes('engine')));
    return;
  }
  console.log('✅ 布局引擎实例存在:', layoutEngine);
  
  // 2. 检查图形实例
  console.log('\n=== 2. 检查图形实例 ===');
  let graph = window.graph;
  if (!graph && layoutEngine.graph) {
    graph = layoutEngine.graph;
    console.log('✅ 从布局引擎获取图形实例');
  }
  if (!graph) {
    console.error('❌ 图形实例不存在');
    console.log('🔍 检查window对象中的可用属性:', Object.keys(window).filter(key => key.includes('graph')));
    return;
  }
  console.log('✅ 图形实例存在:', graph);
  
  // 3. 获取当前节点数据
  console.log('\n=== 3. 获取当前节点数据 ===');
  const nodes = graph.getNodes();
  const validNodes = nodes.filter(node => {
    const nodeId = node.id || node.getId();
    const nodeData = node.getData() || {};
    return !nodeId.includes('hint') && !nodeData.isEndpoint && !nodeData.isPreview;
  });
  
  console.log(`📊 节点统计: 总节点=${nodes.length}, 有效节点=${validNodes.length}`);
  
  if (validNodes.length === 0) {
    console.warn('⚠️ 没有有效节点，无法进行测试');
    return;
  }
  
  // 4. 测试calculateLayerY方法
  console.log('\n=== 4. 测试calculateLayerY方法 ===');
  if (typeof layoutEngine.calculateLayerY !== 'function') {
    console.error('❌ calculateLayerY方法不存在');
    console.log('🔍 布局引擎可用方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(layoutEngine)).filter(name => typeof layoutEngine[name] === 'function'));
  } else {
    console.log('✅ calculateLayerY方法存在');
    
    // 测试不同层级的Y坐标计算
    for (let i = 0; i < Math.min(5, validNodes.length); i++) {
      try {
        const yCoord = layoutEngine.calculateLayerY(i, []);
        console.log(`🔍 层级 ${i} 的Y坐标: ${yCoord}`);
        
        if (isNaN(yCoord)) {
          console.error(`❌ 层级 ${i} 的Y坐标为NaN`);
        } else {
          console.log(`✅ 层级 ${i} 的Y坐标计算正常: ${yCoord}`);
        }
      } catch (error) {
        console.error(`❌ 计算层级 ${i} Y坐标时出错:`, error);
      }
    }
  }
  
  // 5. 测试getSimpleLayerIndex方法
  console.log('\n=== 5. 测试getSimpleLayerIndex方法 ===');
  if (typeof layoutEngine.getSimpleLayerIndex !== 'function') {
    console.error('❌ getSimpleLayerIndex方法不存在');
  } else {
    console.log('✅ getSimpleLayerIndex方法存在');
    
    // 测试前几个节点的层级索引
    validNodes.slice(0, 3).forEach((node, index) => {
      try {
        const nodeId = node.id || node.getId();
        const layerIndex = layoutEngine.getSimpleLayerIndex(nodeId);
        console.log(`🔍 节点 ${nodeId} 的层级索引: ${layerIndex}`);
        
        if (isNaN(layerIndex)) {
          console.error(`❌ 节点 ${nodeId} 的层级索引为NaN`);
        } else {
          console.log(`✅ 节点 ${nodeId} 的层级索引计算正常: ${layerIndex}`);
        }
      } catch (error) {
        console.error(`❌ 获取节点层级索引时出错:`, error);
      }
    });
  }
  
  // 6. 检查布局配置
  console.log('\n=== 6. 检查布局配置 ===');
  if (layoutEngine.options && layoutEngine.options.layer) {
    console.log('✅ 布局配置存在:', layoutEngine.options.layer);
    console.log('🔍 baseHeight:', layoutEngine.options.layer.baseHeight);
    console.log('🔍 spacing:', layoutEngine.options.layer.spacing);
  } else {
    console.error('❌ 布局配置不存在');
    console.log('🔍 layoutEngine.options:', layoutEngine.options);
  }
  
  // 7. 测试Y坐标调试方法
  console.log('\n=== 7. 测试Y坐标调试方法 ===');
  if (typeof layoutEngine.testYCoordinateCalculation === 'function') {
    console.log('✅ testYCoordinateCalculation方法存在');
    
    try {
      const testNodes = validNodes.slice(0, 3).map(node => ({
        id: node.id || node.getId(),
        type: (node.getData() || {}).type || 'unknown'
      }));
      
      const testResult = layoutEngine.testYCoordinateCalculation(testNodes);
      console.log('🔍 Y坐标测试结果:', testResult);
      
      if (testResult.success) {
        console.log('✅ Y坐标测试成功');
        Object.entries(testResult.nodeResults).forEach(([nodeId, result]) => {
          console.log(`📍 节点 ${nodeId}: 层级=${result.layerIndex}, Y坐标=${result.yCoordinate}, 有效=${result.isValid}`);
        });
      } else {
        console.error('❌ Y坐标测试失败:', testResult.error);
      }
    } catch (error) {
      console.error('❌ 执行Y坐标测试时出错:', error);
    }
  } else {
    console.error('❌ testYCoordinateCalculation方法不存在');
  }
  
  // 8. 测试executeLayout方法
  console.log('\n=== 8. 测试executeLayout方法 ===');
  if (typeof layoutEngine.executeLayout !== 'function') {
    console.error('❌ executeLayout方法不存在');
  } else {
    console.log('✅ executeLayout方法存在');
    
    if (validNodes.length >= 2) {
      console.log('🚀 尝试执行布局...');
      try {
        const layoutResult = await layoutEngine.executeLayout();
        console.log('✅ 布局执行完成:', layoutResult);
        
        // 检查布局后的节点位置
        console.log('\n=== 布局后节点位置检查 ===');
        validNodes.slice(0, 3).forEach(node => {
          const nodeId = node.id || node.getId();
          const position = node.getPosition();
          console.log(`📍 节点 ${nodeId} 位置:`, position);
          
          if (isNaN(position.y)) {
            console.error(`❌ 节点 ${nodeId} 的Y坐标仍为NaN`);
          } else {
            console.log(`✅ 节点 ${nodeId} 的Y坐标正常: ${position.y}`);
          }
        });
      } catch (error) {
        console.error('❌ 执行布局时出错:', error);
      }
    } else {
      console.warn('⚠️ 节点数量不足，跳过布局执行测试');
    }
  }
  
  // 9. 检查布局模型状态
  console.log('\n=== 9. 检查布局模型状态 ===');
  if (layoutEngine.layoutModel) {
    console.log('✅ 布局模型存在');
    console.log('🔍 nodeToLayer映射大小:', layoutEngine.layoutModel.nodeToLayer?.size || 0);
    console.log('🔍 层级数量:', layoutEngine.layoutModel.layers?.length || 0);
    console.log('🔍 节点位置映射大小:', layoutEngine.layoutModel.nodePositions?.size || 0);
    
    // 显示前几个节点的层级映射
    if (layoutEngine.layoutModel.nodeToLayer && layoutEngine.layoutModel.nodeToLayer.size > 0) {
      console.log('\n📋 节点层级映射:');
      let count = 0;
      for (const [nodeId, layerIndex] of layoutEngine.layoutModel.nodeToLayer) {
        if (count >= 5) break;
        console.log(`  ${nodeId} -> 层级 ${layerIndex}`);
        count++;
      }
    }
  } else {
    console.error('❌ 布局模型不存在');
  }
  
  console.log('\n🏁 [Y坐标调试] 完整测试脚本执行完成');
})();