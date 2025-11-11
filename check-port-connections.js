/**
 * 端口连接检查脚本 - 增强版
 * 用于验证X6图中边的连接是否真正实现了从端口到端口的连接
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行：checkPortConnections()
 * 2. 或者运行详细检查：checkPortConnections(true)
 * 3. 运行快速检查：checkPortConnections(false, true)
 * 
 * 功能特性：
 * - 检查X6图实例和节点端口配置
 * - 验证边的端口连接配置
 * - 检查端口DOM元素的可见性
 * - 验证连接点是否在端口位置
 * - 提供详细的诊断报告和建议
 */

window.checkPortConnections = function(verbose = false, quickMode = false) {
    console.log('🔍 开始端口连接检查...');
    console.log('='.repeat(60));
    
    const results = {
        summary: {
            totalNodes: 0,
            totalEdges: 0,
            nodesWithPorts: 0,
            edgesWithPortConnections: 0,
            portDOMElements: 0,
            validPortConnections: 0
        },
        issues: [],
        details: []
    };
    
    try {
        // 快速模式：只检查关键指标
        if (quickMode) {
            const quickResult = quickPortConnectionCheck();
            if (!quickResult.success) {
                results.issues.push(`❌ ${quickResult.message}`);
                return printResults(results);
            }
            
            // 更新结果统计
            Object.assign(results.summary, quickResult.summary);
            
            console.log('⚡ 快速检查完成');
            console.log(`📊 节点端口配置率: ${quickResult.summary.nodePortRate}%`);
            console.log(`📊 边端口连接率: ${quickResult.summary.edgePortRate}%`);
            
            return printResults(results);
        }
        
        // 1. 获取X6图实例
        const graph = findX6GraphInstance();
        if (!graph) {
            results.issues.push('❌ 未找到X6图实例');
            return printResults(results);
        }
        
        console.log('✅ 找到X6图实例');
        
        // 2. 检查节点和端口配置
        const nodes = graph.getNodes();
        results.summary.totalNodes = nodes.length;
        console.log(`📊 总节点数: ${nodes.length}`);
        
        nodes.forEach((node, index) => {
            const nodeCheck = checkNodePorts(node, index, verbose);
            if (nodeCheck.hasPorts) {
                results.summary.nodesWithPorts++;
            }
            results.details.push(nodeCheck);
            results.issues.push(...nodeCheck.issues);
        });
        
        // 3. 检查边和端口连接
        const edges = graph.getEdges();
        results.summary.totalEdges = edges.length;
        console.log(`📊 总边数: ${edges.length}`);
        
        edges.forEach((edge, index) => {
            const edgeCheck = checkEdgePortConnection(edge, graph, index, verbose);
            if (edgeCheck.hasPortConnection) {
                results.summary.edgesWithPortConnections++;
            }
            if (edgeCheck.isValidPortConnection) {
                results.summary.validPortConnections++;
            }
            results.details.push(edgeCheck);
            results.issues.push(...edgeCheck.issues);
        });
        
        // 4. 检查端口DOM元素
        const portElements = checkPortDOMElements(verbose);
        results.summary.portDOMElements = portElements.count;
        results.issues.push(...portElements.issues);
        results.details.push(portElements);
        
        // 5. 输出结果
        return printResults(results);
        
    } catch (error) {
        console.error('❌ 检查过程中发生错误:', error);
        results.issues.push(`❌ 检查错误: ${error.message}`);
        return printResults(results);
    }
};

/**
 * 查找X6图实例
 */
function findX6GraphInstance() {
    // 尝试多种方式查找X6图实例
    const selectors = [
        '[data-testid="canvas-container"] .x6-graph',
        '.canvas-container .x6-graph',
        '.x6-graph',
        '[class*="canvas"] .x6-graph'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.__x6_graph__) {
            return element.__x6_graph__;
        }
    }
    
    // 尝试从全局变量查找
    if (window.graph) return window.graph;
    if (window.x6Graph) return window.x6Graph;
    
    // 尝试从Vue实例查找
    const vueApps = document.querySelectorAll('[data-v-app]');
    for (const app of vueApps) {
        if (app.__vue__ && app.__vue__.graph) {
            return app.__vue__.graph;
        }
    }
    
    return null;
}

/**
 * 检查节点端口配置
 */
function checkNodePorts(node, index, verbose) {
    const result = {
        type: 'node',
        id: node.id,
        index,
        hasPorts: false,
        portGroups: [],
        ports: [],
        issues: []
    };
    
    try {
        // 检查端口组配置
        const portGroups = node.getPortGroups();
        if (portGroups && Object.keys(portGroups).length > 0) {
            result.hasPorts = true;
            result.portGroups = Object.keys(portGroups);
            
            if (verbose) {
                console.log(`📍 节点 ${index} (${node.id}) 端口组:`, Object.keys(portGroups));
            }
            
            // 检查是否有in和out端口组
            const hasInPort = 'in' in portGroups;
            const hasOutPort = 'out' in portGroups;
            
            if (!hasInPort) {
                result.issues.push(`⚠️ 节点 ${node.id} 缺少 'in' 端口组`);
            }
            if (!hasOutPort) {
                result.issues.push(`⚠️ 节点 ${node.id} 缺少 'out' 端口组`);
            }
        } else {
            result.issues.push(`❌ 节点 ${node.id} 没有端口组配置`);
        }
        
        // 检查端口实例
        const ports = node.getPorts();
        if (ports && ports.length > 0) {
            result.ports = ports.map(port => ({
                id: port.id,
                group: port.group,
                position: port.args?.position || 'unknown'
            }));
            
            if (verbose) {
                console.log(`📍 节点 ${index} 端口:`, result.ports);
            }
        } else {
            result.issues.push(`⚠️ 节点 ${node.id} 没有端口实例`);
        }
        
        // 检查节点数据中的端口配置
        const nodeData = node.getData();
        if (nodeData && nodeData.portConfig) {
            if (verbose) {
                console.log(`📍 节点 ${index} 数据端口配置:`, nodeData.portConfig);
            }
        }
        
    } catch (error) {
        result.issues.push(`❌ 检查节点 ${node.id} 端口时出错: ${error.message}`);
    }
    
    return result;
}

/**
 * 检查边的端口连接
 */
function checkEdgePortConnection(edge, graph, index, verbose) {
    const result = {
        type: 'edge',
        id: edge.id,
        index,
        hasPortConnection: false,
        isValidPortConnection: false,
        sourceInfo: {},
        targetInfo: {},
        issues: []
    };
    
    try {
        const sourceCell = edge.getSourceCell();
        const targetCell = edge.getTargetCell();
        const sourcePort = edge.getSourcePortId();
        const targetPort = edge.getTargetPortId();
        
        // 检查源端口连接
        if (sourceCell && sourcePort) {
            result.hasPortConnection = true;
            result.sourceInfo = {
                cellId: sourceCell.id,
                portId: sourcePort,
                cellType: sourceCell.shape || 'unknown'
            };
            
            // 验证源端口是否存在于源节点
            const sourcePorts = sourceCell.getPorts();
            const sourcePortExists = sourcePorts.some(port => port.id === sourcePort);
            
            if (sourcePortExists) {
                result.sourceInfo.portExists = true;
            } else {
                result.issues.push(`❌ 边 ${edge.id} 的源端口 ${sourcePort} 在源节点中不存在`);
            }
            
            if (verbose) {
                console.log(`📍 边 ${index} 源连接:`, result.sourceInfo);
            }
        } else {
            result.issues.push(`❌ 边 ${edge.id} 缺少源端口连接`);
        }
        
        // 检查目标端口连接
        if (targetCell && targetPort) {
            result.targetInfo = {
                cellId: targetCell.id,
                portId: targetPort,
                cellType: targetCell.shape || 'unknown'
            };
            
            // 验证目标端口是否存在于目标节点
            const targetPorts = targetCell.getPorts();
            const targetPortExists = targetPorts.some(port => port.id === targetPort);
            
            if (targetPortExists) {
                result.targetInfo.portExists = true;
            } else {
                result.issues.push(`❌ 边 ${edge.id} 的目标端口 ${targetPort} 在目标节点中不存在`);
            }
            
            if (verbose) {
                console.log(`📍 边 ${index} 目标连接:`, result.targetInfo);
            }
        } else {
            result.issues.push(`❌ 边 ${edge.id} 缺少目标端口连接`);
        }
        
        // 检查连接点配置
        const edgeData = edge.getData();
        if (edgeData) {
            const connectionPoint = edge.prop('source/connectionPoint') || edge.prop('target/connectionPoint');
            const anchor = edge.prop('source/anchor') || edge.prop('target/anchor');
            
            if (connectionPoint === null && anchor === null) {
                result.isValidPortConnection = true;
                if (verbose) {
                    console.log(`✅ 边 ${index} 正确配置为端口连接 (connectionPoint和anchor为null)`);
                }
            } else {
                result.issues.push(`⚠️ 边 ${edge.id} 可能不是纯端口连接 (connectionPoint: ${connectionPoint}, anchor: ${anchor})`);
            }
        }
        
        // 检查边的路径是否连接到端口位置
        const sourcePoint = edge.getSourcePoint();
        const targetPoint = edge.getTargetPoint();
        
        if (sourcePoint && targetPoint) {
            // 验证连接点是否在端口位置而不是节点中心
            if (sourceCell && sourcePort) {
                const sourcePortPosition = getPortPosition(sourceCell, sourcePort);
                if (sourcePortPosition) {
                    const distance = calculateDistance(sourcePoint, sourcePortPosition);
                    result.sourceInfo.portDistance = distance;
                    
                    if (distance > 20) { // 允许20像素的误差
                        result.issues.push(`⚠️ 边 ${edge.id} 源连接点距离端口位置较远 (${distance.toFixed(1)}px)`);
                    }
                }
            }
            
            if (targetCell && targetPort) {
                const targetPortPosition = getPortPosition(targetCell, targetPort);
                if (targetPortPosition) {
                    const distance = calculateDistance(targetPoint, targetPortPosition);
                    result.targetInfo.portDistance = distance;
                    
                    if (distance > 20) { // 允许20像素的误差
                        result.issues.push(`⚠️ 边 ${edge.id} 目标连接点距离端口位置较远 (${distance.toFixed(1)}px)`);
                    }
                }
            }
            
            if (verbose) {
                console.log(`📍 边 ${index} 连接点:`, {
                    source: sourcePoint,
                    target: targetPoint,
                    sourcePortDistance: result.sourceInfo.portDistance,
                    targetPortDistance: result.targetInfo.portDistance
                });
            }
        }
        
    } catch (error) {
        result.issues.push(`❌ 检查边 ${edge.id} 连接时出错: ${error.message}`);
    }
    
    return result;
}

/**
 * 检查端口DOM元素
 */
function checkPortDOMElements(verbose) {
    const result = {
        type: 'portDOM',
        count: 0,
        elements: [],
        issues: []
    };
    
    try {
        // 查找所有端口相关的DOM元素
        const portSelectors = [
            '.x6-port',
            '[data-port]',
            '[data-port-group]',
            '.x6-port-body',
            '[magnet="true"]'
        ];
        
        const allPortElements = new Set();
        
        portSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => allPortElements.add(el));
        });
        
        result.count = allPortElements.size;
        
        if (verbose && allPortElements.size > 0) {
            console.log(`📍 找到 ${allPortElements.size} 个端口DOM元素`);
        }
        
        // 检查每个端口元素的属性
        allPortElements.forEach((element, index) => {
            const portInfo = {
                index,
                tagName: element.tagName,
                classes: element.className,
                attributes: {},
                isVisible: isElementVisible(element),
                boundingRect: element.getBoundingClientRect()
            };
            
            // 收集相关属性
            const relevantAttrs = ['data-port', 'data-port-group', 'magnet', 'port', 'port-group'];
            relevantAttrs.forEach(attr => {
                if (element.hasAttribute(attr)) {
                    portInfo.attributes[attr] = element.getAttribute(attr);
                }
            });
            
            result.elements.push(portInfo);
            
            if (!portInfo.isVisible) {
                result.issues.push(`⚠️ 端口DOM元素 ${index} 不可见`);
            }
            
            if (verbose) {
                console.log(`📍 端口DOM ${index}:`, portInfo);
            }
        });
        
        if (result.count === 0) {
            result.issues.push('❌ 未找到任何端口DOM元素');
        }
        
    } catch (error) {
        result.issues.push(`❌ 检查端口DOM元素时出错: ${error.message}`);
    }
    
    return result;
}

/**
 * 检查元素是否可见
 */
function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
}

/**
 * 输出检查结果
 */
function printResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 端口连接检查结果汇总');
    console.log('='.repeat(60));
    
    // 输出统计信息
    const { summary } = results;
    console.log(`📈 统计信息:`);
    console.log(`   总节点数: ${summary.totalNodes}`);
    console.log(`   有端口的节点数: ${summary.nodesWithPorts}`);
    console.log(`   总边数: ${summary.totalEdges}`);
    console.log(`   有端口连接的边数: ${summary.edgesWithPortConnections}`);
    console.log(`   有效端口连接数: ${summary.validPortConnections}`);
    console.log(`   端口DOM元素数: ${summary.portDOMElements}`);
    
    // 计算成功率
    const nodePortRate = summary.totalNodes > 0 ? (summary.nodesWithPorts / summary.totalNodes * 100).toFixed(1) : 0;
    const edgePortRate = summary.totalEdges > 0 ? (summary.edgesWithPortConnections / summary.totalEdges * 100).toFixed(1) : 0;
    const validConnectionRate = summary.totalEdges > 0 ? (summary.validPortConnections / summary.totalEdges * 100).toFixed(1) : 0;
    
    console.log(`\n📊 成功率:`);
    console.log(`   节点端口配置率: ${nodePortRate}%`);
    console.log(`   边端口连接率: ${edgePortRate}%`);
    console.log(`   有效端口连接率: ${validConnectionRate}%`);
    
    // 输出问题
    if (results.issues.length > 0) {
        console.log(`\n⚠️ 发现的问题 (${results.issues.length}个):`);
        results.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
    } else {
        console.log('\n✅ 未发现问题！');
    }
    
    // 总体评估
    console.log('\n🎯 总体评估:');
    if (validConnectionRate >= 90) {
        console.log('   ✅ 优秀 - 端口连接实现良好');
    } else if (validConnectionRate >= 70) {
        console.log('   ⚠️ 良好 - 端口连接基本正常，有少量问题');
    } else if (validConnectionRate >= 50) {
        console.log('   ⚠️ 一般 - 端口连接存在一些问题');
    } else {
        console.log('   ❌ 需要改进 - 端口连接存在较多问题');
    }
    
    console.log('\n💡 建议:');
    if (summary.nodesWithPorts < summary.totalNodes) {
        console.log('   - 检查节点创建时的端口配置');
    }
    if (summary.edgesWithPortConnections < summary.totalEdges) {
        console.log('   - 检查边创建时的端口连接配置');
    }
    if (summary.portDOMElements === 0) {
        console.log('   - 检查端口DOM元素的渲染');
    }
    if (results.issues.length > 0) {
        console.log('   - 解决上述发现的具体问题');
    }
    
    console.log('\n' + '='.repeat(60));
    
    return results;
}

/**
 * 获取端口在画布上的绝对位置
 */
function getPortPosition(cell, portId) {
    try {
        // 尝试通过X6 API获取端口位置
        const portPosition = cell.getPortProp(portId, 'args/position');
        if (portPosition) {
            const cellPosition = cell.position();
            const cellSize = cell.size();
            
            // 计算端口的绝对位置
            let x, y;
            
            if (typeof portPosition === 'object') {
                x = cellPosition.x + (portPosition.x || 0);
                y = cellPosition.y + (portPosition.y || 0);
            } else {
                // 处理相对位置字符串 (如 'top', 'bottom', 'left', 'right')
                switch (portPosition) {
                    case 'top':
                        x = cellPosition.x + cellSize.width / 2;
                        y = cellPosition.y;
                        break;
                    case 'bottom':
                        x = cellPosition.x + cellSize.width / 2;
                        y = cellPosition.y + cellSize.height;
                        break;
                    case 'left':
                        x = cellPosition.x;
                        y = cellPosition.y + cellSize.height / 2;
                        break;
                    case 'right':
                        x = cellPosition.x + cellSize.width;
                        y = cellPosition.y + cellSize.height / 2;
                        break;
                    default:
                        return null;
                }
            }
            
            return { x, y };
        }
        
        // 备用方法：通过DOM元素获取位置
        const portElement = document.querySelector(`[data-port="${portId}"]`);
        if (portElement) {
            const rect = portElement.getBoundingClientRect();
            const canvasElement = document.querySelector('.x6-graph-svg');
            if (canvasElement) {
                const canvasRect = canvasElement.getBoundingClientRect();
                return {
                    x: rect.left - canvasRect.left + rect.width / 2,
                    y: rect.top - canvasRect.top + rect.height / 2
                };
            }
        }
        
        return null;
    } catch (error) {
        console.warn(`获取端口 ${portId} 位置时出错:`, error);
        return null;
    }
}

/**
 * 计算两点之间的距离
 */
function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 快速端口连接检查（仅检查关键指标）
 */
function quickPortConnectionCheck() {
    const graph = findX6GraphInstance();
    if (!graph) {
        return { success: false, message: '未找到X6图实例' };
    }
    
    const nodes = graph.getNodes();
    const edges = graph.getEdges();
    
    const nodesWithPorts = nodes.filter(node => {
        const ports = node.getPorts();
        return ports && ports.length > 0;
    }).length;
    
    const edgesWithPortConnections = edges.filter(edge => {
        return edge.getSourcePortId() && edge.getTargetPortId();
    }).length;
    
    const portElements = document.querySelectorAll('.x6-port, [data-port], [magnet="true"]').length;
    
    return {
        success: true,
        summary: {
            totalNodes: nodes.length,
            nodesWithPorts,
            totalEdges: edges.length,
            edgesWithPortConnections,
            portElements,
            nodePortRate: nodes.length > 0 ? (nodesWithPorts / nodes.length * 100).toFixed(1) : 0,
            edgePortRate: edges.length > 0 ? (edgesWithPortConnections / edges.length * 100).toFixed(1) : 0
        }
    };
}

// 自动运行检查（如果在控制台环境中）
if (typeof window !== 'undefined' && window.console) {
    console.log('🔧 端口连接检查脚本已加载');
    console.log('💡 使用方法:');
    console.log('   - 完整检查: checkPortConnections()');
    console.log('   - 详细检查: checkPortConnections(true)');
    console.log('   - 快速检查: checkPortConnections(false, true)');
    
    // 添加快速检查函数到全局
    window.quickPortCheck = quickPortConnectionCheck;
    console.log('   - 极速检查: quickPortCheck()');
}