// 完整性校验测试脚本
// 用于检查节点坐标、预览线和连接线的完整性

(function() {
    console.log('🔍 开始完整性校验测试...');
    
    // 获取必要的实例
    const graph = window.graph || window.graphInstance;
    const layoutEngine = window.layoutEngine;
    const previewLineManager = window.previewLineManager;
    
    if (!graph) {
        console.error('❌ 无法获取graph实例');
        return;
    }
    
    console.log('✅ 成功获取graph实例');
    
    // 1. 节点坐标完整性检查
    function validateNodeCoordinates() {
        console.log('\n📍 检查节点坐标完整性...');
        
        const nodes = graph.getNodes();
        const invalidNodes = [];
        const validNodes = [];
        
        nodes.forEach(node => {
            const position = node.getPosition();
            const nodeData = node.getData();
            const nodeId = node.id;
            const nodeType = nodeData?.type || 'unknown';
            
            const isXValid = typeof position.x === 'number' && !isNaN(position.x);
            const isYValid = typeof position.y === 'number' && !isNaN(position.y);
            
            const nodeInfo = {
                id: nodeId,
                type: nodeType,
                position: position,
                xValid: isXValid,
                yValid: isYValid,
                isValid: isXValid && isYValid
            };
            
            if (nodeInfo.isValid) {
                validNodes.push(nodeInfo);
            } else {
                invalidNodes.push(nodeInfo);
            }
            
            console.log(`  节点 ${nodeId} (${nodeType}): (${position.x}, ${position.y}) - ${nodeInfo.isValid ? '✅' : '❌'}`);
        });
        
        console.log(`\n📊 节点坐标统计:`);
        console.log(`  总节点数: ${nodes.length}`);
        console.log(`  有效节点: ${validNodes.length}`);
        console.log(`  无效节点: ${invalidNodes.length}`);
        
        if (invalidNodes.length > 0) {
            console.warn('⚠️ 发现无效坐标的节点:', invalidNodes);
        }
        
        return { validNodes, invalidNodes, totalNodes: nodes.length };
    }
    
    // 2. 预览线完整性检查
    function validatePreviewLines() {
        console.log('\n🔗 检查预览线完整性...');
        
        if (!previewLineManager) {
            console.warn('⚠️ 预览线管理器不可用');
            return { validPreviewLines: [], invalidPreviewLines: [], totalPreviewLines: 0 };
        }
        
        // 尝试获取预览线数据
        let previewLines = [];
        try {
            // 检查不同的预览线获取方式
            if (previewLineManager.previewLines) {
                previewLines = Array.from(previewLineManager.previewLines.values());
            } else if (previewLineManager.getPreviewLines) {
                previewLines = previewLineManager.getPreviewLines();
            } else if (previewLineManager.getAllPreviewLines) {
                previewLines = previewLineManager.getAllPreviewLines();
            }
        } catch (error) {
            console.error('❌ 获取预览线数据失败:', error);
        }
        
        const validPreviewLines = [];
        const invalidPreviewLines = [];
        
        previewLines.forEach((previewLine, index) => {
            const hasSourceNode = previewLine.sourceNode && previewLine.sourceNode.id;
            const hasSourcePort = previewLine.sourcePort;
            const hasValidPosition = previewLine.currentPosition && 
                                   typeof previewLine.currentPosition.x === 'number' && 
                                   !isNaN(previewLine.currentPosition.x) &&
                                   typeof previewLine.currentPosition.y === 'number' && 
                                   !isNaN(previewLine.currentPosition.y);
            
            const previewLineInfo = {
                index: index,
                id: previewLine.id || `preview_${index}`,
                hasSourceNode: hasSourceNode,
                hasSourcePort: hasSourcePort,
                hasValidPosition: hasValidPosition,
                sourceNodeId: previewLine.sourceNode?.id,
                sourcePort: previewLine.sourcePort,
                currentPosition: previewLine.currentPosition,
                isValid: hasSourceNode && hasSourcePort
            };
            
            if (previewLineInfo.isValid) {
                validPreviewLines.push(previewLineInfo);
            } else {
                invalidPreviewLines.push(previewLineInfo);
            }
            
            console.log(`  预览线 ${previewLineInfo.id}: 源节点=${previewLineInfo.sourceNodeId}, 源端口=${previewLineInfo.sourcePort} - ${previewLineInfo.isValid ? '✅' : '❌'}`);
        });
        
        console.log(`\n📊 预览线统计:`);
        console.log(`  总预览线数: ${previewLines.length}`);
        console.log(`  有效预览线: ${validPreviewLines.length}`);
        console.log(`  无效预览线: ${invalidPreviewLines.length}`);
        
        if (invalidPreviewLines.length > 0) {
            console.warn('⚠️ 发现无效的预览线:', invalidPreviewLines);
        }
        
        return { validPreviewLines, invalidPreviewLines, totalPreviewLines: previewLines.length };
    }
    
    // 3. 连接线完整性检查
    function validateEdges() {
        console.log('\n🔗 检查连接线完整性...');
        
        const edges = graph.getEdges();
        const validEdges = [];
        const invalidEdges = [];
        
        edges.forEach(edge => {
            const sourceNode = edge.getSourceNode();
            const targetNode = edge.getTargetNode();
            const sourcePort = edge.getSourcePortId();
            const targetPort = edge.getTargetPortId();
            
            const hasSourceNode = sourceNode && sourceNode.id;
            const hasTargetNode = targetNode && targetNode.id;
            const hasSourcePort = sourcePort;
            const hasTargetPort = targetPort;
            
            const edgeInfo = {
                id: edge.id,
                hasSourceNode: hasSourceNode,
                hasTargetNode: hasTargetNode,
                hasSourcePort: hasSourcePort,
                hasTargetPort: hasTargetPort,
                sourceNodeId: sourceNode?.id,
                targetNodeId: targetNode?.id,
                sourcePort: sourcePort,
                targetPort: targetPort,
                isValid: hasSourceNode && hasTargetNode
            };
            
            if (edgeInfo.isValid) {
                validEdges.push(edgeInfo);
            } else {
                invalidEdges.push(edgeInfo);
            }
            
            console.log(`  连接线 ${edgeInfo.id}: ${edgeInfo.sourceNodeId}[${edgeInfo.sourcePort}] -> ${edgeInfo.targetNodeId}[${edgeInfo.targetPort}] - ${edgeInfo.isValid ? '✅' : '❌'}`);
        });
        
        console.log(`\n📊 连接线统计:`);
        console.log(`  总连接线数: ${edges.length}`);
        console.log(`  有效连接线: ${validEdges.length}`);
        console.log(`  无效连接线: ${invalidEdges.length}`);
        
        if (invalidEdges.length > 0) {
            console.warn('⚠️ 发现无效的连接线:', invalidEdges);
        }
        
        return { validEdges, invalidEdges, totalEdges: edges.length };
    }
    
    // 4. 布局引擎状态检查
    function validateLayoutEngine() {
        console.log('\n⚙️ 检查布局引擎状态...');
        
        if (!layoutEngine) {
            console.warn('⚠️ 布局引擎不可用');
            return { isValid: false, reason: '布局引擎不存在' };
        }
        
        const hasCalculateLayerY = typeof layoutEngine.calculateLayerY === 'function';
        const hasLayoutModel = layoutEngine.layoutModel !== undefined;
        const hasOptions = layoutEngine.options !== undefined;
        
        console.log(`  calculateLayerY方法: ${hasCalculateLayerY ? '✅' : '❌'}`);
        console.log(`  layoutModel: ${hasLayoutModel ? '✅' : '❌'}`);
        console.log(`  options配置: ${hasOptions ? '✅' : '❌'}`);
        
        if (hasOptions && layoutEngine.options) {
            const options = layoutEngine.options;
            console.log(`  配置详情:`);
            console.log(`    startY: ${options.startY}`);
            console.log(`    levelHeight: ${options.levelHeight}`);
            console.log(`    nodeSpacing: ${options.nodeSpacing}`);
            console.log(`    direction: ${options.direction}`);
        }
        
        const isValid = hasCalculateLayerY && hasLayoutModel && hasOptions;
        
        return {
            isValid: isValid,
            hasCalculateLayerY: hasCalculateLayerY,
            hasLayoutModel: hasLayoutModel,
            hasOptions: hasOptions,
            options: layoutEngine.options
        };
    }
    
    // 5. 特定节点类型检查（重点检查audience-split）
    function validateSpecificNodeTypes() {
        console.log('\n🎯 检查特定节点类型...');
        
        const nodes = graph.getNodes();
        const nodeTypeStats = {};
        const problematicNodes = [];
        
        nodes.forEach(node => {
            const nodeData = node.getData();
            const nodeType = nodeData?.type || 'unknown';
            const position = node.getPosition();
            
            if (!nodeTypeStats[nodeType]) {
                nodeTypeStats[nodeType] = {
                    total: 0,
                    validCoordinates: 0,
                    invalidCoordinates: 0,
                    nodes: []
                };
            }
            
            nodeTypeStats[nodeType].total++;
            nodeTypeStats[nodeType].nodes.push({
                id: node.id,
                position: position,
                isValid: !isNaN(position.x) && !isNaN(position.y)
            });
            
            if (isNaN(position.x) || isNaN(position.y)) {
                nodeTypeStats[nodeType].invalidCoordinates++;
                problematicNodes.push({
                    id: node.id,
                    type: nodeType,
                    position: position,
                    issues: {
                        xIsNaN: isNaN(position.x),
                        yIsNaN: isNaN(position.y)
                    }
                });
            } else {
                nodeTypeStats[nodeType].validCoordinates++;
            }
        });
        
        console.log('📊 按节点类型统计:');
        Object.entries(nodeTypeStats).forEach(([type, stats]) => {
            console.log(`  ${type}: 总数=${stats.total}, 有效=${stats.validCoordinates}, 无效=${stats.invalidCoordinates}`);
        });
        
        if (problematicNodes.length > 0) {
            console.warn('⚠️ 发现坐标异常的节点:', problematicNodes);
        }
        
        return { nodeTypeStats, problematicNodes };
    }
    
    // 执行所有检查
    const results = {
        timestamp: new Date().toISOString(),
        nodeValidation: validateNodeCoordinates(),
        previewLineValidation: validatePreviewLines(),
        edgeValidation: validateEdges(),
        layoutEngineValidation: validateLayoutEngine(),
        nodeTypeValidation: validateSpecificNodeTypes()
    };
    
    // 生成总结报告
    console.log('\n📋 完整性校验总结报告:');
    console.log('=' .repeat(50));
    
    const totalIssues = 
        results.nodeValidation.invalidNodes.length +
        results.previewLineValidation.invalidPreviewLines.length +
        results.edgeValidation.invalidEdges.length +
        (results.layoutEngineValidation.isValid ? 0 : 1);
    
    console.log(`总体状态: ${totalIssues === 0 ? '✅ 全部正常' : `❌ 发现 ${totalIssues} 个问题`}`);
    console.log(`检查时间: ${results.timestamp}`);
    console.log('');
    
    console.log('详细统计:');
    console.log(`  节点: ${results.nodeValidation.validNodes.length}/${results.nodeValidation.totalNodes} 有效`);
    console.log(`  预览线: ${results.previewLineValidation.validPreviewLines.length}/${results.previewLineValidation.totalPreviewLines} 有效`);
    console.log(`  连接线: ${results.edgeValidation.validEdges.length}/${results.edgeValidation.totalEdges} 有效`);
    console.log(`  布局引擎: ${results.layoutEngineValidation.isValid ? '✅ 正常' : '❌ 异常'}`);
    
    if (totalIssues > 0) {
        console.log('\n🔧 建议修复措施:');
        
        if (results.nodeValidation.invalidNodes.length > 0) {
            console.log('  1. 修复节点坐标NaN问题 - 检查布局计算逻辑');
        }
        
        if (results.previewLineValidation.invalidPreviewLines.length > 0) {
            console.log('  2. 修复预览线源节点缺失问题');
        }
        
        if (results.edgeValidation.invalidEdges.length > 0) {
            console.log('  3. 修复连接线节点缺失问题');
        }
        
        if (!results.layoutEngineValidation.isValid) {
            console.log('  4. 修复布局引擎配置问题');
        }
    }
    
    // 将结果保存到window对象供进一步分析
    window.integrityValidationResults = results;
    
    console.log('\n💾 完整结果已保存到 window.integrityValidationResults');
    console.log('🔍 完整性校验测试完成!');
    
    return results;
})();