// 检查节点实际位置的测试脚本

// 等待页面完全加载
setTimeout(() => {
    console.log('🔍 [节点位置检查] 开始检查节点实际位置');
    
    // 获取图实例
    const app = window.app;
    if (!app || !app.$refs || !app.$refs.taskFlowCanvas) {
        console.error('❌ 无法获取TaskFlowCanvas实例');
        return;
    }
    
    const canvas = app.$refs.taskFlowCanvas;
    const graph = canvas.graph;
    
    if (!graph) {
        console.error('❌ 无法获取图实例');
        return;
    }
    
    console.log('✅ 成功获取图实例');
    
    // 获取所有节点
    const nodes = graph.getNodes();
    console.log(`📊 总节点数: ${nodes.length}`);
    
    // 检查每个节点的位置
    nodes.forEach((node, index) => {
        const nodeId = node.id;
        const position = node.getPosition();
        const size = node.getSize();
        const centerY = position.y + size.height / 2;
        
        console.log(`🔍 节点${index + 1}: ${nodeId}`);
        console.log(`   - 原始位置: (${position.x}, ${position.y})`);
        console.log(`   - 节点尺寸: ${size.width} x ${size.height}`);
        console.log(`   - 中心Y坐标: ${centerY}`);
        console.log(`   - Y坐标是否为NaN: ${isNaN(position.y)}`);
        console.log(`   - 中心Y是否为NaN: ${isNaN(centerY)}`);
        
        // 检查节点数据
        const nodeData = node.getData();
        if (nodeData) {
            console.log(`   - 节点类型: ${nodeData.type || '未知'}`);
            console.log(`   - 节点标签: ${nodeData.label || '未知'}`);
        }
        
        console.log('---');
    });
    
    // 检查布局引擎状态
    if (window.layoutEngine) {
        console.log('🔧 [布局引擎] 检查布局引擎状态');
        
        // 尝试获取层级映射
        const testNodes = nodes.slice(0, 4); // 取前4个节点测试
        testNodes.forEach(node => {
            try {
                const layerIndex = window.layoutEngine.getSimpleLayerIndex(node.id);
                const expectedY = window.layoutEngine.calculateLayerY(layerIndex);
                
                console.log(`🎯 节点 ${node.id}:`);
                console.log(`   - 层级索引: ${layerIndex}`);
                console.log(`   - 期望Y坐标: ${expectedY}`);
                console.log(`   - 实际Y坐标: ${node.getPosition().y}`);
                console.log(`   - Y坐标匹配: ${Math.abs(node.getPosition().y - expectedY) < 1}`);
            } catch (error) {
                console.error(`❌ 节点 ${node.id} 层级计算失败:`, error.message);
            }
        });
    } else {
        console.warn('⚠️ 布局引擎实例不存在');
    }
    
    console.log('✅ [节点位置检查] 检查完成');
    
}, 2000);

console.log('📋 节点位置检查脚本已加载，将在2秒后执行');