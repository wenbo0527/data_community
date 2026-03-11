/**
 * 🔍 Y坐标NaN问题综合调试脚本
 * 用于在浏览器控制台中执行，全面诊断Y坐标计算问题
 */

(async function debugYCoordinateComprehensive() {
  console.log('🔍 [Y坐标综合调试] 开始执行综合调试脚本');
  
  try {
    // 1. 检查实例可用性
    console.log('\n=== 1. 实例可用性检查 ===');
    
    const graph = window.graph || window.graphInstance;
    const layoutEngine = window.layoutEngine;
    
    console.log('Graph实例:', {
      available: !!graph,
      type: typeof graph,
      methods: graph ? Object.getOwnPropertyNames(Object.getPrototypeOf(graph)).slice(0, 10) : 'N/A'
    });
    
    console.log('LayoutEngine实例:', {
      available: !!layoutEngine,
      type: typeof layoutEngine,
      hasCalculateLayerY: layoutEngine && typeof layoutEngine.calculateLayerY === 'function',
      hasLayoutModel: layoutEngine && !!layoutEngine.layoutModel,
      hasOptions: layoutEngine && !!layoutEngine.options
    });
    
    if (!graph) {
      console.error('❌ Graph实例不可用，无法继续调试');
      return;
    }
    
    if (!layoutEngine) {
      console.error('❌ LayoutEngine实例不可用，无法继续调试');
      return;
    }
    
    // 2. 检查当前节点状态
    console.log('\n=== 2. 当前节点状态检查 ===');
    
    const nodes = graph.getNodes();
    console.log(`当前画布节点数量: ${nodes.length}`);
    
    nodes.forEach((node, index) => {
      const position = node.getPosition();
      const size = node.getSize();
      const centerY = position.y + size.height / 2;
      const data = node.getData() || {};
      
      console.log(`节点 ${index + 1}: ${node.id}`, {
        type: data.type || 'unknown',
        position: position,
        centerY: centerY,
        isNaN_x: isNaN(position.x),
        isNaN_y: isNaN(position.y),
        isNaN_centerY: isNaN(centerY)
      });
      
      if (isNaN(position.y) || isNaN(centerY)) {
        console.error(`❌ 发现NaN坐标: 节点 ${node.id}`);
      }
    });
    
    // 3. 测试calculateLayerY方法
    console.log('\n=== 3. calculateLayerY方法测试 ===');
    
    if (typeof layoutEngine.calculateLayerY === 'function') {
      // 测试不同层级的Y坐标计算
      for (let i = 0; i <= 5; i++) {
        const result = layoutEngine.calculateLayerY(i);
        console.log(`层级 ${i} -> Y坐标: ${result}`, {
          isValid: !isNaN(result) && Number.isFinite(result),
          type: typeof result
        });
      }
      
      // 测试异常输入
      const testInputs = [null, undefined, 'string', NaN, -1, 1.5];
      testInputs.forEach(input => {
        try {
          const result = layoutEngine.calculateLayerY(input);
          console.log(`异常输入测试 ${input} -> ${result}`, {
            inputType: typeof input,
            resultValid: !isNaN(result) && Number.isFinite(result)
          });
        } catch (error) {
          console.error(`异常输入测试 ${input} 抛出错误:`, error.message);
        }
      });
    } else {
      console.error('❌ calculateLayerY方法不存在');
    }
    
    // 4. 检查布局配置
    console.log('\n=== 4. 布局配置检查 ===');
    
    if (layoutEngine.options) {
      console.log('布局配置:', {
        layer: layoutEngine.options.layer,
        node: layoutEngine.options.node,
        hasValidConfig: !!(layoutEngine.options.layer && layoutEngine.options.layer.baseHeight)
      });
    } else {
      console.error('❌ 布局配置不存在');
    }
    
    // 5. 检查layoutModel状态
    console.log('\n=== 5. LayoutModel状态检查 ===');
    
    if (layoutEngine.layoutModel) {
      const model = layoutEngine.layoutModel;
      console.log('LayoutModel状态:', {
        hasLayers: Array.isArray(model.layers),
        layersCount: model.layers ? model.layers.length : 0,
        hasNodePositions: model.nodePositions instanceof Map,
        nodePositionsCount: model.nodePositions ? model.nodePositions.size : 0,
        hasNodeToLayer: model.nodeToLayer instanceof Map,
        nodeToLayerCount: model.nodeToLayer ? model.nodeToLayer.size : 0
      });
      
      // 检查节点到层级的映射
      if (model.nodeToLayer && model.nodeToLayer.size > 0) {
        console.log('节点层级映射:');
        model.nodeToLayer.forEach((layerIndex, nodeId) => {
          console.log(`  ${nodeId} -> 层级 ${layerIndex}`);
        });
      }
    } else {
      console.error('❌ LayoutModel不存在');
    }
    
    // 6. 执行布局测试
    console.log('\n=== 6. 布局执行测试 ===');
    
    if (nodes.length >= 2) {
      console.log('节点数量足够，尝试执行布局测试...');
      
      try {
        // 创建测试节点数据
        const testNodes = nodes.slice(0, 3).map((node, index) => ({
          id: node.id,
          type: (node.getData() || {}).type || 'test',
          position: node.getPosition()
        }));
        
        // 调用测试方法
        if (typeof layoutEngine.testYCoordinateCalculation === 'function') {
          const testResult = layoutEngine.testYCoordinateCalculation(testNodes);
          console.log('Y坐标计算测试结果:', testResult);
        } else {
          console.warn('⚠️ testYCoordinateCalculation方法不存在');
        }
        
      } catch (error) {
        console.error('❌ 布局测试执行失败:', error);
      }
    } else {
      console.log('节点数量不足，跳过布局测试');
    }
    
    // 7. 检查预览线管理器
    console.log('\n=== 7. 预览线管理器检查 ===');
    
    const previewManager = window.previewLineManager;
    console.log('预览线管理器:', {
      available: !!previewManager,
      type: typeof previewManager
    });
    
    // 8. 总结和建议
    console.log('\n=== 8. 调试总结 ===');
    
    const hasNaNNodes = nodes.some(node => {
      const pos = node.getPosition();
      return isNaN(pos.x) || isNaN(pos.y);
    });
    
    const hasValidLayoutEngine = layoutEngine && 
                                typeof layoutEngine.calculateLayerY === 'function' &&
                                layoutEngine.options &&
                                layoutEngine.layoutModel;
    
    console.log('调试结果总结:', {
      hasNaNNodes: hasNaNNodes,
      hasValidLayoutEngine: hasValidLayoutEngine,
      nodeCount: nodes.length,
      recommendations: [
        hasNaNNodes ? '❌ 发现NaN坐标节点，需要修复Y坐标计算' : '✅ 所有节点坐标正常',
        hasValidLayoutEngine ? '✅ 布局引擎状态正常' : '❌ 布局引擎存在问题',
        nodes.length < 2 ? '⚠️ 节点数量不足，无法测试完整布局' : '✅ 节点数量足够测试'
      ]
    });
    
    // 9. 提供修复建议
    if (hasNaNNodes || !hasValidLayoutEngine) {
      console.log('\n=== 修复建议 ===');
      
      if (hasNaNNodes) {
        console.log('🔧 NaN坐标修复建议:');
        console.log('1. 检查calculateLayerY方法的输入参数验证');
        console.log('2. 确保layerIndex是有效的数字');
        console.log('3. 验证布局配置中的baseHeight和layerSpacing');
        console.log('4. 检查节点位置设置时的坐标转换');
      }
      
      if (!hasValidLayoutEngine) {
        console.log('🔧 布局引擎修复建议:');
        console.log('1. 确保UnifiedStructuredLayoutEngine正确导出');
        console.log('2. 检查实例初始化时的参数传递');
        console.log('3. 验证layoutModel和options的初始化');
      }
    }
    
    console.log('\n🔍 [Y坐标综合调试] 调试脚本执行完成');
    
  } catch (error) {
    console.error('❌ [Y坐标综合调试] 调试脚本执行失败:', error);
    console.error('错误堆栈:', error.stack);
  }
})();