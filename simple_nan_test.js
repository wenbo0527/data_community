// 简化的NaN问题检测脚本
console.log('=== 开始NaN问题检测 ===');

// 检查layoutEngine是否存在
if (typeof window.layoutEngine === 'undefined') {
    console.error('❌ window.layoutEngine 不存在');
} else {
    console.log('✅ window.layoutEngine 存在');
    
    // 测试Y坐标计算
    try {
        const result = window.layoutEngine.testYCoordinateCalculation();
        console.log('Y坐标测试结果:', result);
    } catch (error) {
        console.error('Y坐标测试失败:', error);
    }
    
    // 检查当前图形中的节点
    try {
        const graph = window.graph || window.layoutEngine.graph;
        if (graph) {
            const nodes = graph.getNodes();
            console.log(`图形中共有 ${nodes.length} 个节点`);
            
            // 检查前5个节点的位置
            nodes.slice(0, 5).forEach((node, index) => {
                const position = node.getPosition();
                const size = node.getSize();
                console.log(`节点 ${index + 1} (${node.id}):`, {
                    position: position,
                    size: size,
                    hasNaN: isNaN(position.x) || isNaN(position.y)
                });
            });
        } else {
            console.warn('⚠️ 未找到graph对象');
        }
    } catch (error) {
        console.error('检查节点位置时出错:', error);
    }
}

console.log('=== NaN问题检测完成 ===');