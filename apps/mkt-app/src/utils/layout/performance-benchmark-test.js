/**
 * 性能基准测试
 * 测试UnifiedLayoutEngine的性能表现
 */

import UnifiedLayoutEngine from './UnifiedLayoutEngine.js';

/**
 * 生成测试数据
 */
function generateTestData(nodeCount = 100, edgeCount = 150) {
    const nodes = [];
    const edges = [];
    
    // 生成节点
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            id: `node_${i}`,
            type: i % 3 === 0 ? 'input' : i % 3 === 1 ? 'process' : 'output',
            data: {
                label: `Node ${i}`,
                width: 120 + Math.random() * 80,
                height: 60 + Math.random() * 40
            },
            position: { x: 0, y: 0 }
        });
    }
    
    // 生成边
    for (let i = 0; i < edgeCount; i++) {
        const sourceIndex = Math.floor(Math.random() * nodeCount);
        let targetIndex = Math.floor(Math.random() * nodeCount);
        
        // 避免自环
        while (targetIndex === sourceIndex) {
            targetIndex = Math.floor(Math.random() * nodeCount);
        }
        
        edges.push({
            id: `edge_${i}`,
            source: `node_${sourceIndex}`,
            target: `node_${targetIndex}`,
            type: 'default'
        });
    }
    
    return { nodes, edges };
}

/**
 * 创建模拟的图实例
 */
function createMockGraphInstance() {
    return {
        getNodes: () => [],
        getEdges: () => [],
        getCellById: (id) => null,
        updateCellPosition: (cell, position) => {},
        batchUpdate: (callback) => callback(),
        trigger: (event, data) => {}
    };
}

/**
 * 创建模拟的预览线管理器
 */
function createMockPreviewManager() {
    return {
        updatePreviewLines: () => {},
        clearPreviewLines: () => {},
        setLocked: () => {},
        isLocked: () => false
    };
}

/**
 * 性能测试函数
 */
async function performanceTest(engineName, engine, testData, iterations = 10) {
    console.log(`\n🚀 开始测试 ${engineName}`);
    console.log(`📊 测试数据: ${testData.nodes.length} 节点, ${testData.edges.length} 边`);
    console.log(`🔄 测试轮数: ${iterations}`);
    
    const times = [];
    const memoryUsages = [];
    
    for (let i = 0; i < iterations; i++) {
        // 记录内存使用
        const memBefore = process.memoryUsage();
        
        // 执行布局计算
        const startTime = performance.now();
        
        try {
            await engine.executeLayout(testData.nodes, testData.edges, {
                direction: 'TB',
                rankSep: 80,
                nodeSep: 60,
                enableOptimization: true,
                enableCache: true
            });
        } catch (error) {
            console.warn(`⚠️  第 ${i + 1} 轮测试出现错误:`, error.message);
            continue;
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // 记录内存使用
        const memAfter = process.memoryUsage();
        const memoryDiff = memAfter.heapUsed - memBefore.heapUsed;
        
        times.push(executionTime);
        memoryUsages.push(memoryDiff);
        
        console.log(`  第 ${i + 1} 轮: ${executionTime.toFixed(2)}ms, 内存变化: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // 计算统计数据
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const avgMemory = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
    
    console.log(`\n📈 ${engineName} 性能统计:`);
    console.log(`  平均执行时间: ${avgTime.toFixed(2)}ms`);
    console.log(`  最快执行时间: ${minTime.toFixed(2)}ms`);
    console.log(`  最慢执行时间: ${maxTime.toFixed(2)}ms`);
    console.log(`  平均内存使用: ${(avgMemory / 1024 / 1024).toFixed(2)}MB`);
    
    return {
        engineName,
        avgTime,
        minTime,
        maxTime,
        avgMemory,
        times,
        memoryUsages
    };
}

/**
 * 主测试函数
 */
async function runBenchmark() {
    console.log('🎯 统一布局引擎性能基准测试');
    console.log('=' .repeat(50));
    
    // 创建模拟环境
    const mockGraph = createMockGraphInstance();
    const mockPreviewManager = createMockPreviewManager();
    
    // 测试不同规模的数据
    const testCases = [
        { nodes: 50, edges: 75, name: '小规模' },
        { nodes: 100, edges: 150, name: '中规模' },
        { nodes: 200, edges: 300, name: '大规模' }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
        console.log(`\n🔍 测试场景: ${testCase.name} (${testCase.nodes}节点, ${testCase.edges}边)`);
        console.log('-'.repeat(50));
        
        const testData = generateTestData(testCase.nodes, testCase.edges);
        
        // 测试新引擎
        const newEngine = new UnifiedLayoutEngine(mockGraph, mockPreviewManager, {
            enableOptimization: true,
            enableCache: true,
            enablePerformanceMonitoring: true
        });
        
        const newEngineResult = await performanceTest(
            'UnifiedLayoutEngine (新引擎)',
            newEngine,
            testData,
            5
        );
        
        results.push({
            testCase: testCase.name,
            newEngine: newEngineResult
        });
    }
    
    // 输出总结报告
    console.log('\n🎉 性能基准测试完成');
    console.log('=' .repeat(50));
    console.log('\n📋 总结报告:');
    
    results.forEach(result => {
        console.log(`\n${result.testCase}:`);
        console.log(`  平均执行时间: ${result.newEngine.avgTime.toFixed(2)}ms`);
        console.log(`  最快执行时间: ${result.newEngine.minTime.toFixed(2)}ms`);
        console.log(`  最慢执行时间: ${result.newEngine.maxTime.toFixed(2)}ms`);
        console.log(`  平均内存使用: ${(result.newEngine.avgMemory / 1024 / 1024).toFixed(2)}MB`);
    });
    
    // 计算总体性能
    const totalAvgTime = results.reduce((sum, r) => sum + r.newEngine.avgTime, 0) / results.length;
    const totalAvgMemory = results.reduce((sum, r) => sum + r.newEngine.avgMemory, 0) / results.length;
    
    console.log(`\n🏆 总体性能表现:`);
    console.log(`  平均执行时间: ${totalAvgTime.toFixed(2)}ms`);
    console.log(`  平均内存使用: ${(totalAvgMemory / 1024 / 1024).toFixed(2)}MB`);
    
    // 性能评估
    if (totalAvgTime < 100) {
        console.log('\n✅ 性能表现优秀: 平均执行时间小于100ms');
    } else if (totalAvgTime < 500) {
        console.log('\n✅ 性能表现良好: 平均执行时间小于500ms');
    } else {
        console.log('\n⚠️  性能需要优化: 平均执行时间超过500ms');
    }
    
    if (totalAvgMemory / 1024 / 1024 < 10) {
        console.log('✅ 内存使用合理: 平均内存使用小于10MB');
    } else {
        console.log('⚠️  内存使用较高: 平均内存使用超过10MB');
    }
}

// 运行基准测试
runBenchmark().catch(error => {
    console.error('❌ 基准测试失败:', error);
    process.exit(1);
});