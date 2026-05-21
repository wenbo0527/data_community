/**
 * 人群分流(audience-split)节点预览线生成问题测试脚本
 * 专门诊断和修复audience-split节点的预览线生成问题
 */

// 获取图实例的函数
function getGraphInstance() {
    console.log('🔍 开始搜索图实例...');
    
    // 搜索路径列表
    const searchPaths = [
        () => window.graph,
        () => window.app?.$refs?.graph?.graph,
        () => window.app?.$children?.[0]?.graph,
        () => document.querySelector('.x6-graph')?.graph,
        () => window.Vue?.prototype?.$graph,
        () => window.__VUE_APP__?.graph
    ];
    
    for (let i = 0; i < searchPaths.length; i++) {
        try {
            const graph = searchPaths[i]();
            if (graph && typeof graph.getCells === 'function') {
                console.log(`✅ 在路径 ${i + 1} 找到图实例:`, graph);
                return graph;
            }
        } catch (error) {
            console.log(`❌ 路径 ${i + 1} 搜索失败:`, error.message);
        }
    }
    
    console.error('❌ 未找到有效的图实例');
    return null;
}

// 获取预览线管理器实例
function getPreviewLineManager() {
    console.log('🔍 搜索预览线管理器实例...');
    
    const searchPaths = [
        () => window.previewLineManager,
        () => window.app?.$refs?.previewLineManager,
        () => window.UnifiedPreviewLineManager,
        () => window.app?.$children?.[0]?.previewLineManager
    ];
    
    for (let i = 0; i < searchPaths.length; i++) {
        try {
            const manager = searchPaths[i]();
            if (manager && typeof manager.shouldCreatePreviewLine === 'function') {
                console.log(`✅ 在路径 ${i + 1} 找到预览线管理器:`, manager);
                return manager;
            }
        } catch (error) {
            console.log(`❌ 路径 ${i + 1} 搜索失败:`, error.message);
        }
    }
    
    console.error('❌ 未找到预览线管理器实例');
    return null;
}

// 测试audience-split节点预览线生成
function testAudienceSplitPreviewLine() {
    console.log('\n🚀 开始测试人群分流节点预览线生成...');
    
    const graph = getGraphInstance();
    if (!graph) {
        console.error('❌ 无法获取图实例，测试终止');
        return false;
    }
    
    const previewLineManager = getPreviewLineManager();
    if (!previewLineManager) {
        console.error('❌ 无法获取预览线管理器，测试终止');
        return false;
    }
    
    // 查找audience-split节点
    const cells = graph.getCells();
    const audienceSplitNodes = cells.filter(cell => {
        const nodeType = cell.getData()?.nodeType || cell.prop('nodeType');
        return nodeType === 'audience-split';
    });
    
    console.log(`📊 找到 ${audienceSplitNodes.length} 个人群分流节点`);
    
    if (audienceSplitNodes.length === 0) {
        console.warn('⚠️ 未找到人群分流节点，创建测试节点...');
        return createTestAudienceSplitNode(graph, previewLineManager);
    }
    
    // 测试每个audience-split节点
    let allTestsPassed = true;
    audienceSplitNodes.forEach((node, index) => {
        console.log(`\n🔍 测试第 ${index + 1} 个人群分流节点:`, node.id);
        const testResult = testSingleAudienceSplitNode(node, previewLineManager, graph);
        if (!testResult) {
            allTestsPassed = false;
        }
    });
    
    return allTestsPassed;
}

// 测试单个audience-split节点
function testSingleAudienceSplitNode(node, previewLineManager, graph) {
    console.log(`\n📋 测试节点 ${node.id} 的详细信息:`);
    
    // 1. 检查节点基本信息
    const nodeData = node.getData() || {};
    const nodeType = nodeData.nodeType || node.prop('nodeType');
    console.log('节点类型:', nodeType);
    console.log('节点数据:', nodeData);
    
    // 2. 检查isConfigured状态
    const isConfigured = nodeData.isConfigured;
    console.log('配置状态 (isConfigured):', isConfigured);
    
    // 3. 检查分支信息
    const branches = nodeData.branches || [];
    console.log('分支信息:', branches);
    console.log('分支数量:', branches.length);
    
    // 4. 测试shouldNodeBeConfigured方法
    let shouldBeConfigured = false;
    try {
        shouldBeConfigured = previewLineManager.shouldNodeBeConfigured(node);
        console.log('shouldNodeBeConfigured 结果:', shouldBeConfigured);
    } catch (error) {
        console.error('❌ shouldNodeBeConfigured 方法调用失败:', error);
    }
    
    // 5. 测试shouldCreatePreviewLine方法
    let shouldCreatePreview = false;
    try {
        shouldCreatePreview = previewLineManager.shouldCreatePreviewLine(node);
        console.log('shouldCreatePreviewLine 结果:', shouldCreatePreview);
    } catch (error) {
        console.error('❌ shouldCreatePreviewLine 方法调用失败:', error);
    }
    
    // 6. 检查现有连接
    const outgoingEdges = graph.getOutgoingEdges(node);
    const incomingEdges = graph.getIncomingEdges(node);
    console.log('出边数量:', outgoingEdges?.length || 0);
    console.log('入边数量:', incomingEdges?.length || 0);
    
    // 7. 测试分支预览线创建
    if (branches.length > 0) {
        console.log('\n🔧 测试分支预览线创建...');
        testBranchPreviewLineCreation(node, previewLineManager, branches);
    }
    
    // 8. 分析问题
    console.log('\n🔍 问题分析:');
    if (!isConfigured) {
        console.warn('⚠️ 节点未配置 (isConfigured = false)');
    }
    if (branches.length === 0) {
        console.warn('⚠️ 节点没有分支信息');
    }
    if (!shouldBeConfigured) {
        console.warn('⚠️ shouldNodeBeConfigured 返回 false');
    }
    if (!shouldCreatePreview) {
        console.warn('⚠️ shouldCreatePreviewLine 返回 false');
    }
    
    return shouldCreatePreview;
}

// 测试分支预览线创建
function testBranchPreviewLineCreation(node, previewLineManager, branches) {
    branches.forEach((branch, index) => {
        console.log(`\n🌿 测试分支 ${index + 1}:`, branch);
        
        // 测试calculateBranchPreviewPosition方法
        try {
            const position = previewLineManager.calculateBranchPreviewPosition(node, branch, index);
            console.log('分支预览位置计算结果:', position);
            
            if (!position || !position.x || !position.y) {
                console.error('❌ 分支预览位置计算失败或返回无效位置');
            } else {
                console.log('✅ 分支预览位置计算成功');
            }
        } catch (error) {
            console.error('❌ calculateBranchPreviewPosition 调用失败:', error);
        }
        
        // 测试createBranchPreviewLine方法
        try {
            if (typeof previewLineManager.createBranchPreviewLine === 'function') {
                const previewLine = previewLineManager.createBranchPreviewLine(node, branch, index);
                console.log('分支预览线创建结果:', previewLine);
            } else {
                console.warn('⚠️ createBranchPreviewLine 方法不存在');
            }
        } catch (error) {
            console.error('❌ createBranchPreviewLine 调用失败:', error);
        }
    });
}

// 创建测试用的audience-split节点
function createTestAudienceSplitNode(graph, previewLineManager) {
    console.log('\n🏗️ 创建测试用的人群分流节点...');
    
    try {
        const testNode = graph.addNode({
            id: 'test-audience-split-' + Date.now(),
            x: 100,
            y: 100,
            width: 120,
            height: 60,
            shape: 'rect',
            data: {
                nodeType: 'audience-split',
                isConfigured: true,
                branches: [
                    { id: 'branch-1', name: '分支1', condition: 'age > 30' },
                    { id: 'branch-2', name: '分支2', condition: 'age <= 30' }
                ]
            }
        });
        
        console.log('✅ 测试节点创建成功:', testNode.id);
        
        // 测试新创建的节点
        return testSingleAudienceSplitNode(testNode, previewLineManager, graph);
    } catch (error) {
        console.error('❌ 创建测试节点失败:', error);
        return false;
    }
}

// 提供修复建议
function provideFixSuggestions() {
    console.log('\n💡 修复建议:');
    console.log('1. 确保audience-split节点的isConfigured字段正确设置为true');
    console.log('2. 检查节点的branches数组是否包含有效的分支信息');
    console.log('3. 验证shouldNodeBeConfigured方法对audience-split节点的处理逻辑');
    console.log('4. 检查calculateBranchPreviewPosition方法的参数验证和计算逻辑');
    console.log('5. 确保createBranchPreviewLines方法正确处理分支预览线创建');
    console.log('6. 检查预览线管理器的初始化和配置');
    console.log('7. 验证节点在图中的位置和尺寸信息是否正确');
}

// 主测试函数
function runAudienceSplitPreviewTest() {
    console.log('🎯 人群分流节点预览线生成测试开始');
    console.log('=' .repeat(50));
    
    const testResult = testAudienceSplitPreviewLine();
    
    console.log('\n' + '='.repeat(50));
    if (testResult) {
        console.log('✅ 测试完成，预览线生成正常');
    } else {
        console.log('❌ 测试发现问题，预览线生成异常');
        provideFixSuggestions();
    }
    
    return testResult;
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAudienceSplitPreviewTest,
        testAudienceSplitPreviewLineFix: runAudienceSplitPreviewTest, // 别名
        testAudienceSplitPreviewLine,
        getGraphInstance,
        getPreviewLineManager
    };
}

// 如果在浏览器环境中直接运行
if (typeof window !== 'undefined') {
    window.runAudienceSplitPreviewTest = runAudienceSplitPreviewTest;
    window.testAudienceSplitPreviewLineFix = runAudienceSplitPreviewTest; // 别名
    console.log('🔧 测试函数已加载到window对象，可以调用 runAudienceSplitPreviewTest() 或 testAudienceSplitPreviewLineFix() 开始测试');
}

console.log('📝 人群分流节点预览线测试脚本加载完成');