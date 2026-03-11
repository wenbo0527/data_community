/**
 * 🔍 简化版Y坐标NaN问题调试脚本
 * 专门针对node_1756349599799节点的Y坐标NaN问题
 */

(function debugYCoordinateSimple() {
  console.log('🔍 [Y坐标调试] 开始简化版Y坐标NaN问题调试');
  
  try {
    // 1. 获取实例
    const graph = window.graph || window.graphInstance;
    const layoutEngine = window.layoutEngine;
    
    if (!graph) {
      console.error('❌ Graph实例不可用');
      return;
    }
    
    if (!layoutEngine) {
      console.error('❌ LayoutEngine实例不可用');
      return;
    }
    
    // 2. 查找问题节点
    const problemNodeId = 'node_1756349599799';
    const problemNode = graph.getCellById(problemNodeId);
    
    if (!problemNode) {
      console.error(`❌ 找不到问题节点: ${problemNodeId}`);
      return;
    }
    
    console.log('🎯 [问题节点] 找到问题节点:', problemNodeId);
    
    // 3. 检查当前节点状态
    const position = problemNode.getPosition();
    const size = problemNode.getSize();
    const centerY = position.y + size.height / 2;
    const data = problemNode.getData() || {};
    
    console.log('📊 [节点状态] 问题节点当前状态:', {
      id: problemNodeId,
      type: data.type || 'unknown',
      position: position,
      size: size,
      centerY: centerY,
      isNaN_x: isNaN(position.x),
      isNaN_y: isNaN(position.y),
      isNaN_centerY: isNaN(centerY)
    });
    
    // 4. 检查布局引擎配置
    console.log('⚙️ [布局配置] 检查布局引擎配置:');
    
    if (layoutEngine.options && layoutEngine.options.layer) {
      const layerConfig = layoutEngine.options.layer;
      console.log('  层级配置:', {
        baseHeight: layerConfig.baseHeight,
        dynamicSpacing: layerConfig.dynamicSpacing,
        maxLayers: layerConfig.maxLayers
      });
    }
    
    // 5. 测试calculateLayerY方法
    console.log('🧮 [Y坐标计算] 测试calculateLayerY方法:');
    
    if (typeof layoutEngine.calculateLayerY === 'function') {
      // 测试不同层级
      for (let i = 0; i <= 3; i++) {
        const result = layoutEngine.calculateLayerY(i);
        console.log(`  层级 ${i} -> Y坐标: ${result}`, {
          isValid: !isNaN(result) && Number.isFinite(result)
        });
      }
    } else {
      console.error('❌ calculateLayerY方法不存在');
    }
    
    // 6. 检查节点层级映射
    console.log('🗺️ [层级映射] 检查节点层级映射:');
    
    if (layoutEngine.layoutModel && layoutEngine.layoutModel.nodeToLayer) {
      const nodeLayer = layoutEngine.layoutModel.nodeToLayer.get(problemNodeId);
      console.log(`  节点 ${problemNodeId} 的层级: ${nodeLayer}`);
      
      if (nodeLayer !== undefined && typeof layoutEngine.calculateLayerY === 'function') {
        const calculatedY = layoutEngine.calculateLayerY(nodeLayer);
        console.log(`  根据层级 ${nodeLayer} 计算的Y坐标: ${calculatedY}`);
      }
    } else {
      console.error('❌ 节点层级映射不存在');
    }
    
    // 7. 尝试手动修复Y坐标
    console.log('🔧 [手动修复] 尝试手动修复Y坐标:');
    
    if (isNaN(position.y)) {
      const defaultY = 100; // 使用默认Y坐标
      console.log(`  检测到Y坐标为NaN，尝试设置为默认值: ${defaultY}`);
      
      try {
        problemNode.setPosition({
          x: position.x || 0,
          y: defaultY
        }, {
          systemInitiated: true,
          layoutEngine: true,
          source: 'DebugScript'
        });
        
        // 验证修复结果
        const newPosition = problemNode.getPosition();
        console.log(`  修复后位置:`, newPosition);
        console.log(`  修复成功: ${!isNaN(newPosition.y)}`);
        
      } catch (error) {
        console.error('❌ 手动修复失败:', error);
      }
    } else {
      console.log('  Y坐标正常，无需修复');
    }
    
    // 8. 检查所有节点的Y坐标
    console.log('🔍 [全局检查] 检查所有节点的Y坐标:');
    
    const allNodes = graph.getNodes();
    let nanCount = 0;
    
    allNodes.forEach(node => {
      const pos = node.getPosition();
      if (isNaN(pos.y)) {
        nanCount++;
        console.log(`  ❌ 节点 ${node.id} Y坐标为NaN:`, pos);
      }
    });
    
    console.log(`  总节点数: ${allNodes.length}, NaN节点数: ${nanCount}`);
    
    // 9. 提供修复建议
    console.log('💡 [修复建议]:');
    
    if (nanCount > 0) {
      console.log('  1. 检查UnifiedStructuredLayoutEngine.js中的calculateLayerY方法');
      console.log('  2. 验证布局配置中的baseHeight值');
      console.log('  3. 确保节点层级映射正确');
      console.log('  4. 检查布局执行过程中的错误');
    } else {
      console.log('  ✅ 所有节点Y坐标正常');
    }
    
    console.log('🔍 [Y坐标调试] 简化版调试完成');
    
  } catch (error) {
    console.error('❌ [Y坐标调试] 调试脚本执行失败:', error);
  }
})();

// 提供手动执行函数
window.debugYCoordinate = function() {
  console.log('🔄 [手动调试] 重新执行Y坐标调试...');
  
  // 重新执行调试脚本
  setTimeout(() => {
    const script = document.createElement('script');
    script.src = '/debug-y-coordinate-simple.js';
    document.head.appendChild(script);
  }, 100);
};

console.log('💡 [使用提示] 可以在控制台中输入 debugYCoordinate() 重新执行调试');