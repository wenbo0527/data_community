// 🔍 详细Y坐标调试脚本 - 增强版
// 用于诊断UnifiedStructuredLayoutEngine实例属性和方法缺失问题

console.log('🔍 [详细Y坐标调试] 开始执行调试脚本...');
console.log('⏰ [时间戳]:', new Date().toISOString());

// 获取全局实例
const layoutEngine = window.layoutEngine;
const graph = window.graph;

// 📍 [步骤1] 检查节点当前位置:
console.log('\n📍 [步骤1] 检查节点当前位置: ');

if (graph) {
  const nodes = graph.getNodes();
  console.log(`📊 [节点总数]: ${nodes.length}`);
  
  nodes.forEach(node => {
    const position = node.getPosition();
    const size = node.getSize();
    const centerY = position.y + size.height / 2;
    console.log(`  节点 ${node.id}: 位置(${position.x}, ${position.y}) 中心Y=${centerY} 尺寸=${size.width}x${size.height}`);
  });
} else {
  console.log('❌ [调试] graph实例不存在');
}

console.log('');

// 🏗️ [步骤2] 检查布局引擎层级计算:
console.log('\n🏗️ [步骤2] 检查布局引擎层级计算: ');

if (layoutEngine) {
  console.log('📋 [布局引擎实例]:', {
    存在: !!layoutEngine,
    类型: typeof layoutEngine,
    构造函数: layoutEngine.constructor?.name,
    原型链: Object.getPrototypeOf(layoutEngine)?.constructor?.name
  });
  
  // 🔍 检查所有方法是否存在
  console.log('🔧 [方法检查]:', {
    calculateLayerY: typeof layoutEngine.calculateLayerY,
    executeLayout: typeof layoutEngine.executeLayout,
    executeLayoutDebounced: typeof layoutEngine.executeLayoutDebounced,
    executeLayoutImmediate: typeof layoutEngine.executeLayoutImmediate
  });
  
  // 🔍 检查实例属性
  console.log('📊 [实例属性]:', {
    graph: !!layoutEngine.graph,
    options: !!layoutEngine.options,
    layoutModel: !!layoutEngine.layoutModel,
    performanceOptimizer: !!layoutEngine.performanceOptimizer
  });
  
  // 检查layoutModel
  if (layoutEngine.layoutModel) {
    console.log('📊 [layoutModel]:', {
      存在: !!layoutEngine.layoutModel,
      layers: layoutEngine.layoutModel.layers?.length || 0,
      nodePositions: layoutEngine.layoutModel.nodePositions?.size || 0,
      parentChildMap: layoutEngine.layoutModel.parentChildMap?.size || 0
    });
  } else {
    console.log('⚠️ [调试] layoutModel不存在');
  }
  
  // 检查options配置
  if (layoutEngine.options) {
    console.log('⚙️ [options配置]:', {
      存在: !!layoutEngine.options,
      layer: layoutEngine.options.layer,
      node: layoutEngine.options.node
    });
  } else {
    console.log('⚠️ [调试] options配置不存在');
  }
} else {
  console.log('❌ [调试] layoutEngine不存在');
}

console.log('');

// 🧮 [步骤3] 手动测试calculateLayerY方法:
console.log('\n🧮 [步骤3] 手动测试calculateLayerY方法: ');

// 🔍 首先检查方法是否存在
if (layoutEngine) {
  console.log('🔍 [方法存在性检查]:', {
    calculateLayerY在实例上: 'calculateLayerY' in layoutEngine,
    calculateLayerY类型: typeof layoutEngine.calculateLayerY,
    calculateLayerY是函数: typeof layoutEngine.calculateLayerY === 'function'
  });
  
  // 🔍 检查原型链上的方法
  const proto = Object.getPrototypeOf(layoutEngine);
  console.log('🔍 [原型链方法检查]:', {
    原型存在: !!proto,
    原型上有calculateLayerY: proto && 'calculateLayerY' in proto,
    原型calculateLayerY类型: proto && typeof proto.calculateLayerY
  });
  
  // 🔍 尝试直接访问方法
  const method = layoutEngine.calculateLayerY || (proto && proto.calculateLayerY);
  console.log('🔍 [方法获取结果]:', {
    方法存在: !!method,
    方法类型: typeof method
  });
  
  if (method && typeof method === 'function') {
    try {
      const testResults = [];
      for (let i = 0; i <= 3; i++) {
        const y = method.call(layoutEngine, i);
        testResults.push({ layerIndex: i, y: y });
        console.log(`✅ [测试] calculateLayerY(${i}) = ${y}`);
      }
      
      console.log('📊 [测试结果汇总]:', testResults);
      
      // 检查是否有NaN值
      const hasNaN = testResults.some(result => isNaN(result.y));
      if (hasNaN) {
        console.log('❌ [测试] 发现NaN值!');
      } else {
        console.log('✅ [测试] 所有Y坐标计算正常');
      }
      
    } catch (error) {
      console.log('❌ [调试] 测试calculateLayerY时出错:', error);
    }
  } else {
    console.log('❌ [调试] calculateLayerY方法不存在或不是函数');
  }
} else {
  console.log('❌ [调试] layoutEngine不存在');
}

console.log('');

// ⚙️ [步骤4] 检查布局配置:
console.log('\n⚙️ [步骤4] 检查布局配置: ');

if (layoutEngine && layoutEngine.options) {
  const layoutConfig = {
    levelHeight: layoutEngine.options.layer?.baseHeight,
    nodeSpacing: layoutEngine.options.node?.preferredSpacing,
    minSpacing: layoutEngine.options.node?.minSpacing,
    maxSpacing: layoutEngine.options.node?.maxSpacing,
    endpointSize: layoutEngine.options.node?.endpointSize,
    enableGlobalOptimization: layoutEngine.options.optimization?.enableGlobalOptimization,
    maxIterations: layoutEngine.options.optimization?.maxIterations
  };
  
  console.log('📋 [布局配置]:', layoutConfig);
  
  // 🔍 检查配置值是否有效
  const configValidation = {
    levelHeight有效: typeof layoutConfig.levelHeight === 'number' && !isNaN(layoutConfig.levelHeight),
    nodeSpacing有效: typeof layoutConfig.nodeSpacing === 'number' && !isNaN(layoutConfig.nodeSpacing),
    配置完整性: Object.values(layoutConfig).every(val => val !== undefined)
  };
  
  console.log('✅ [配置验证]:', configValidation);
} else {
  console.log('❌ [调试] layoutEngine或options不存在');
}

console.log('');

// 🚀 [步骤5] 执行完整布局计算并跟踪:
console.log('\n🚀 [步骤5] 执行完整布局计算并跟踪: ');

if (layoutEngine && graph) {
  try {
    // 🔍 检查所有可能的执行方法
    const methods = {
      executeLayout: layoutEngine.executeLayout,
      executeLayoutDebounced: layoutEngine.executeLayoutDebounced,
      executeLayoutImmediate: layoutEngine.executeLayoutImmediate
    };
    
    console.log('🔍 [方法检查]:', {
      executeLayout: typeof methods.executeLayout,
      executeLayoutDebounced: typeof methods.executeLayoutDebounced,
      executeLayoutImmediate: typeof methods.executeLayoutImmediate
    });
    
    // 选择可用的方法
    const executeMethod = methods.executeLayoutImmediate || methods.executeLayout || methods.executeLayoutDebounced;
    
    if (executeMethod && typeof executeMethod === 'function') {
      console.log('🔄 [布局执行] 开始执行布局计算...');
      
      // 执行布局
      const layoutResult = await executeMethod.call(layoutEngine);
      
      console.log('✅ [步骤5] 布局执行完成:', layoutResult);
      
    } else {
      console.log('❌ [调试] 找不到可执行的布局方法');
      
      // 🔍 尝试检查原型链上的方法
      const proto = Object.getPrototypeOf(layoutEngine);
      if (proto) {
        console.log('🔍 [原型链方法]:', {
          executeLayout: typeof proto.executeLayout,
          executeLayoutDebounced: typeof proto.executeLayoutDebounced,
          executeLayoutImmediate: typeof proto.executeLayoutImmediate
        });
      }
    }
    
  } catch (error) {
    console.log('❌ [调试] 布局执行失败:', error);
  }
} else {
  console.log('❌ [调试] layoutEngine或graph不存在，无法执行布局');
}

// 📍 [最终检查] 布局后节点位置:
console.log('\n📍 [最终检查] 布局后节点位置: ');

if (graph) {
  const nodes = graph.getNodes();
  nodes.forEach(node => {
    const position = node.getPosition();
    const centerY = position.y + node.getSize().height / 2;
    console.log(`  节点 ${node.id}: 位置(${position.x}, ${position.y}) 中心Y=${centerY}`);
  });
} else {
  console.log('❌ [调试] graph实例不存在');
}

console.log('\n🔍 [详细Y坐标调试] 调试脚本执行完成');
console.log('💡 [提示] 请查看上面的日志输出，特别关注任何 NaN 值的出现');

// 🎯 关键修复验证：重新检查修复后的实例
console.log('\n🔧 [修复验证] 重新检查UnifiedStructuredLayoutEngine实例:');
if (window.layoutEngine) {
  console.log('✅ [修复验证] layoutEngine实例存在');
  console.log('🔍 [修复验证] calculateLayerY方法:', typeof window.layoutEngine.calculateLayerY);
  console.log('🔍 [修复验证] layoutModel属性:', !!window.layoutEngine.layoutModel);
  console.log('🔍 [修复验证] options配置:', !!window.layoutEngine.options);
  
  // 测试calculateLayerY方法
  if (typeof window.layoutEngine.calculateLayerY === 'function') {
    try {
      const testY = window.layoutEngine.calculateLayerY(0);
      console.log('✅ [修复验证] calculateLayerY(0)测试成功:', testY);
    } catch (error) {
      console.log('❌ [修复验证] calculateLayerY测试失败:', error.message);
    }
  }
} else {
  console.log('❌ [修复验证] layoutEngine实例仍然不存在');
}
console.log('🔧 [建议] 如果方法不存在，可能需要重新实例化布局引擎');

// 🔍 最终诊断
if (layoutEngine) {
  console.log('\n📋 [最终诊断]:', {
    实例存在: !!layoutEngine,
    构造函数: layoutEngine.constructor?.name,
    calculateLayerY存在: 'calculateLayerY' in layoutEngine,
    calculateLayerY类型: typeof layoutEngine.calculateLayerY,
    原型链完整: !!Object.getPrototypeOf(layoutEngine),
    实例化正常: layoutEngine instanceof Object
  });
} else {
  console.log('\n❌ [最终诊断] layoutEngine实例不存在');
}