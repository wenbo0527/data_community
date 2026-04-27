// 详细的Y坐标调试脚本
// 在浏览器控制台中运行：copy(document.querySelector('script[src*="debug-y-coordinate-detailed.js"]').textContent); eval(_)

console.log('🔍 [详细Y坐标调试] 开始详细调试Y坐标计算流程');

// 获取必要的实例 - 多种方式尝试
let graph = null;
let layoutEngine = null;

// 尝试多种方式获取graph实例
if (window.graph) {
  graph = window.graph;
  console.log('✅ [调试] 通过window.graph获取到graph实例');
} else if (window.graphInstance) {
  graph = window.graphInstance;
  console.log('✅ [调试] 通过window.graphInstance获取到graph实例');
} else {
  // 尝试从Vue组件实例获取
  const vueApp = document.querySelector('#app')?.__vue_app__;
  if (vueApp) {
    console.log('🔍 [调试] 尝试从Vue应用实例获取graph');
    // 这里可以添加更多获取逻辑
  }
  console.error('❌ [调试] 无法获取graph实例');
}

// 获取layoutEngine实例
if (window.layoutEngine) {
  layoutEngine = window.layoutEngine;
  console.log('✅ [调试] layoutEngine实例获取成功');
} else if (window.unifiedLayoutEngine) {
  layoutEngine = window.unifiedLayoutEngine;
  console.log('✅ [调试] 通过window.unifiedLayoutEngine获取到layoutEngine实例');
} else {
  console.error('❌ [调试] 无法获取layoutEngine实例');
}

console.log('🔍 [调试] 实例获取结果:', {
  graph: !!graph,
  layoutEngine: !!layoutEngine,
  graphType: graph ? graph.constructor.name : 'null',
  layoutEngineType: layoutEngine ? layoutEngine.constructor.name : 'null'
});

if (graph && layoutEngine) {
  // 1. 检查节点当前位置
  console.log('\n📍 [步骤1] 检查节点当前位置:');
  const nodes = graph.getNodes();
  nodes.forEach(node => {
    const position = node.getPosition();
    const size = node.getSize();
    const centerY = position.y + size.height / 2;
    console.log(`  节点 ${node.id}: 位置(${position.x}, ${position.y}) 中心Y=${centerY} 尺寸=${size.width}x${size.height}`);
  });

  // 2. 检查布局引擎的层级计算
  console.log('\n🏗️ [步骤2] 检查布局引擎层级计算:');
  try {
    // 获取布局模型
    const layoutModel = layoutEngine.layoutModel;
    if (layoutModel) {
      console.log('✅ [调试] layoutModel存在');
      
      // 检查节点到层级的映射
      if (layoutModel.nodeToLayer) {
        console.log('📊 [节点层级映射]:');
        layoutModel.nodeToLayer.forEach((layerIndex, nodeId) => {
          console.log(`  ${nodeId} -> 层级 ${layerIndex}`);
        });
      }
      
      // 检查层级结构
      if (layoutModel.layerStructure && layoutModel.layerStructure.layers) {
        console.log('📊 [层级结构]:');
        layoutModel.layerStructure.layers.forEach((layer, index) => {
          console.log(`  第${index}层: ${layer.length}个节点`, layer.map(n => n.id || n.nodeId));
        });
      }
    } else {
      console.warn('⚠️ [调试] layoutModel不存在');
    }
  } catch (error) {
    console.error('❌ [调试] 检查布局模型时出错:', error);
  }

  // 3. 手动测试calculateLayerY方法
  console.log('\n🧮 [步骤3] 手动测试calculateLayerY方法:');
  try {
    for (let i = 0; i < 5; i++) {
      const layerY = layoutEngine.calculateLayerY(i);
      console.log(`  calculateLayerY(${i}) = ${layerY}`);
      
      if (isNaN(layerY)) {
        console.error(`❌ [关键问题] calculateLayerY(${i}) 返回 NaN!`);
        
        // 检查layoutConfig
        const layoutConfig = layoutEngine.layoutConfig;
        console.log('🔍 [配置检查] layoutConfig:', layoutConfig);
        
        if (layoutConfig) {
          console.log('  - levelHeight:', layoutConfig.levelHeight);
          console.log('  - nodeSpacing:', layoutConfig.nodeSpacing);
          console.log('  - startY:', layoutConfig.startY);
        }
        
        break;
      }
    }
  } catch (error) {
    console.error('❌ [调试] 测试calculateLayerY时出错:', error);
  }

  // 4. 检查布局配置
  console.log('\n⚙️ [步骤4] 检查布局配置:');
  try {
    const layoutConfig = layoutEngine.layoutConfig;
    console.log('📋 [布局配置]:', {
      levelHeight: layoutConfig?.levelHeight,
      nodeSpacing: layoutConfig?.nodeSpacing,
      startY: layoutConfig?.startY,
      startX: layoutConfig?.startX,
      direction: layoutConfig?.direction
    });
    
    // 检查配置中是否有NaN值
    if (layoutConfig) {
      Object.entries(layoutConfig).forEach(([key, value]) => {
        if (typeof value === 'number' && isNaN(value)) {
          console.error(`❌ [配置错误] ${key} 的值为 NaN!`);
        }
      });
    }
  } catch (error) {
    console.error('❌ [调试] 检查布局配置时出错:', error);
  }

  // 5. 执行一次完整的布局计算并跟踪
  console.log('\n🚀 [步骤5] 执行完整布局计算并跟踪:');
  
  // 临时重写calculateLayerY方法以添加详细日志
  const originalCalculateLayerY = layoutEngine.calculateLayerY;
  layoutEngine.calculateLayerY = function(layerIndex) {
    console.log(`🧮 [calculateLayerY] 输入参数: layerIndex=${layerIndex}`);
    
    // 参数验证
    if (typeof layerIndex !== 'number' || isNaN(layerIndex) || layerIndex < 0 || !isFinite(layerIndex)) {
      console.error(`❌ [calculateLayerY] 无效的layerIndex: ${layerIndex}`);
      return NaN;
    }
    
    const config = this.layoutConfig;
    console.log(`🧮 [calculateLayerY] 配置检查:`, {
      startY: config?.startY,
      levelHeight: config?.levelHeight,
      configExists: !!config
    });
    
    if (!config || typeof config.startY !== 'number' || typeof config.levelHeight !== 'number') {
      console.error(`❌ [calculateLayerY] 配置无效:`, config);
      return NaN;
    }
    
    const result = config.startY + (layerIndex * config.levelHeight);
    console.log(`🧮 [calculateLayerY] 计算结果: ${config.startY} + (${layerIndex} * ${config.levelHeight}) = ${result}`);
    
    return result;
  };
  
  // 执行布局
  layoutEngine.executeLayout().then(result => {
    console.log('✅ [步骤5] 布局执行完成:', result);
    
    // 恢复原始方法
    layoutEngine.calculateLayerY = originalCalculateLayerY;
    
    // 检查最终节点位置
    console.log('\n📍 [最终检查] 布局后节点位置:');
    const finalNodes = graph.getNodes();
    finalNodes.forEach(node => {
      const position = node.getPosition();
      const size = node.getSize();
      const centerY = position.y + size.height / 2;
      console.log(`  节点 ${node.id}: 位置(${position.x}, ${position.y}) 中心Y=${centerY}`);
      
      if (isNaN(position.y) || isNaN(centerY)) {
        console.error(`❌ [最终检查] 节点 ${node.id} 的Y坐标仍然是 NaN!`);
      }
    });
  }).catch(error => {
    console.error('❌ [步骤5] 布局执行失败:', error);
    // 恢复原始方法
    layoutEngine.calculateLayerY = originalCalculateLayerY;
  });
  
} else {
  console.error('❌ [调试] 缺少必要的实例，无法进行详细调试');
}

console.log('\n🔍 [详细Y坐标调试] 调试脚本执行完成');
console.log('💡 [提示] 请查看上面的日志输出，特别关注任何 NaN 值的出现');