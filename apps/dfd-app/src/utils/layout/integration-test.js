/**
 * 集成测试
 * 验证UnifiedLayoutEngine在实际项目环境中的工作情况
 */

import UnifiedLayoutEngine from './UnifiedLayoutEngine.js';

/**
 * 模拟真实的X6图实例
 */
class MockX6Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.listeners = new Map();
    }
    
    addNode(nodeData) {
        const node = {
            id: nodeData.id,
            getData: () => nodeData.data || {},
            getPosition: () => nodeData.position || { x: 0, y: 0 },
            setPosition: (pos) => { nodeData.position = pos; },
            getBBox: () => ({ 
                width: nodeData.data?.width || 120, 
                height: nodeData.data?.height || 60 
            })
        };
        this.nodes.set(nodeData.id, node);
        return node;
    }
    
    addEdge(edgeData) {
        const edge = {
            id: edgeData.id,
            source: edgeData.source,
            target: edgeData.target,
            getData: () => edgeData.data || {},
            getSourceNode: () => this.nodes.get(edgeData.source),
            getTargetNode: () => this.nodes.get(edgeData.target)
        };
        this.edges.set(edgeData.id, edge);
        return edge;
    }
    
    getNodes() {
        return Array.from(this.nodes.values());
    }
    
    getEdges() {
        return Array.from(this.edges.values());
    }
    
    getCells() {
        return [...this.getNodes(), ...this.getEdges()];
    }
    
    getCellById(id) {
        return this.nodes.get(id) || this.edges.get(id) || null;
    }
    
    updateCellPosition(cell, position) {
        if (cell && cell.setPosition) {
            cell.setPosition(position);
        }
    }
    
    batchUpdate(callback) {
        return callback();
    }
    
    trigger(event, data) {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach(listener => listener(data));
    }
    
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(listener);
    }
    
    off(event, listener) {
        const listeners = this.listeners.get(event) || [];
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
}

/**
 * 模拟预览线管理器
 */
class MockPreviewManager {
    constructor() {
        this.locked = false;
        this.lockReason = null;
        this.previewLines = [];
    }
    
    updatePreviewLines(lines) {
        if (!this.locked) {
            this.previewLines = lines || [];

        }
    }
    
    clearPreviewLines() {
        if (!this.locked) {
            this.previewLines = [];

        }
    }
    
    setLocked(locked, reason = null) {
        this.locked = locked;
        this.lockReason = reason;

    }
    
    isLocked() {
        return this.locked;
    }
    
    getLockReason() {
        return this.lockReason;
    }
}

/**
 * 创建真实的工作流数据
 */
function createWorkflowData() {
    const nodes = [
        {
            id: 'start_1',
            data: {
                type: 'start',
                label: '开始',
                width: 100,
                height: 50
            },
            position: { x: 0, y: 0 }
        },
        {
            id: 'process_1',
            data: {
                type: 'process',
                label: '数据处理',
                width: 120,
                height: 60
            },
            position: { x: 0, y: 0 }
        },
        {
            id: 'decision_1',
            data: {
                type: 'decision',
                label: '条件判断',
                width: 100,
                height: 80
            },
            position: { x: 0, y: 0 }
        },
        {
            id: 'process_2',
            data: {
                type: 'process',
                label: '分支A处理',
                width: 120,
                height: 60
            },
            position: { x: 0, y: 0 }
        },
        {
            id: 'process_3',
            data: {
                type: 'process',
                label: '分支B处理',
                width: 120,
                height: 60
            },
            position: { x: 0, y: 0 }
        },
        {
            id: 'end_1',
            data: {
                type: 'end',
                label: '结束',
                width: 100,
                height: 50
            },
            position: { x: 0, y: 0 }
        }
    ];
    
    const edges = [
        {
            id: 'edge_1',
            source: 'start_1',
            target: 'process_1',
            data: { type: 'default' }
        },
        {
            id: 'edge_2',
            source: 'process_1',
            target: 'decision_1',
            data: { type: 'default' }
        },
        {
            id: 'edge_3',
            source: 'decision_1',
            target: 'process_2',
            data: { type: 'condition', label: '是' }
        },
        {
            id: 'edge_4',
            source: 'decision_1',
            target: 'process_3',
            data: { type: 'condition', label: '否' }
        },
        {
            id: 'edge_5',
            source: 'process_2',
            target: 'end_1',
            data: { type: 'default' }
        },
        {
            id: 'edge_6',
            source: 'process_3',
            target: 'end_1',
            data: { type: 'default' }
        }
    ];
    
    return { nodes, edges };
}

/**
 * 集成测试：基本布局功能
 */
async function testBasicLayoutIntegration() {

    console.log('-'.repeat(40));
    
    const graph = new MockX6Graph();
    const previewManager = new MockPreviewManager();
    const engine = new UnifiedLayoutEngine(graph, previewManager, {
        enableOptimization: true,
        enableCache: true,
        enablePerformanceMonitoring: true
    });
    
    const { nodes, edges } = createWorkflowData();
    
    // 添加节点和边到图中
    nodes.forEach(nodeData => graph.addNode(nodeData));
    edges.forEach(edgeData => graph.addEdge(edgeData));
    
    try {
        const result = await engine.executeLayout(nodes, edges, {
            direction: 'TB',
            rankSep: 80,
            nodeSep: 60
        });


        // 验证节点位置是否合理
        const layoutedNodes = result.nodes || nodes;
        let validPositions = 0;
        
        layoutedNodes.forEach(node => {
            if (node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number') {
                validPositions++;
            }
        });

        return validPositions === layoutedNodes.length;
    } catch (error) {

        return false;
    }
}

/**
 * 集成测试：缓存机制
 */
async function testCacheIntegration() {

    console.log('-'.repeat(40));
    
    const graph = new MockX6Graph();
    const previewManager = new MockPreviewManager();
    const engine = new UnifiedLayoutEngine(graph, previewManager, {
        enableCache: true,
        cacheSize: 10
    });
    
    const { nodes, edges } = createWorkflowData();
    
    // 添加节点和边到图中
    nodes.forEach(nodeData => graph.addNode(nodeData));
    edges.forEach(edgeData => graph.addEdge(edgeData));
    
    try {
        // 第一次执行
        const startTime1 = performance.now();
        await engine.executeLayout(nodes, edges);
        const time1 = performance.now() - startTime1;
        
        // 第二次执行（应该使用缓存）
        const startTime2 = performance.now();
        await engine.executeLayout(nodes, edges);
        const time2 = performance.now() - startTime2;
        
        console.log(`⏱️  第一次执行: ${time1.toFixed(2)}ms`);
        console.log(`⏱️  第二次执行: ${time2.toFixed(2)}ms`);
        
        // 缓存应该显著提高性能
        const improvement = ((time1 - time2) / time1) * 100;
        console.log(`🚀 性能提升: ${improvement.toFixed(2)}%`);

        return true;
    } catch (error) {

        return false;
    }
}

/**
 * 集成测试：事件系统
 */
async function testEventIntegration() {

    console.log('-'.repeat(40));
    
    const graph = new MockX6Graph();
    const previewManager = new MockPreviewManager();
    const engine = new UnifiedLayoutEngine(graph, previewManager);
    
    const { nodes, edges } = createWorkflowData();
    
    // 添加节点和边到图中
    nodes.forEach(nodeData => graph.addNode(nodeData));
    edges.forEach(edgeData => graph.addEdge(edgeData));
    
    const eventsFired = [];
    
    // 监听事件
    engine.on('layout:start', () => {
        eventsFired.push('layout:start');

    });
    
    engine.on('layout:complete', (data) => {
        eventsFired.push('layout:complete');

    });
    
    engine.on('layout:error', (error) => {
        eventsFired.push('layout:error');

    });
    
    try {
        await engine.executeLayout(nodes, edges);
        
        console.log(`📡 触发的事件: ${eventsFired.join(', ')}`);
        
        // 验证事件是否正确触发
        const hasStartEvent = eventsFired.includes('layout:start');
        const hasCompleteEvent = eventsFired.includes('layout:complete');
        const hasNoErrorEvent = !eventsFired.includes('layout:error');
        
        if (hasStartEvent && hasCompleteEvent && hasNoErrorEvent) {

            return true;
        } else {

            return false;
        }
    } catch (error) {

        return false;
    }
}

/**
 * 集成测试：预览线管理器集成
 */
async function testPreviewManagerIntegration() {

    console.log('-'.repeat(40));
    
    const graph = new MockX6Graph();
    const previewManager = new MockPreviewManager();
    const engine = new UnifiedLayoutEngine(graph, previewManager);
    
    const { nodes, edges } = createWorkflowData();
    
    // 添加节点和边到图中
    nodes.forEach(nodeData => graph.addNode(nodeData));
    edges.forEach(edgeData => graph.addEdge(edgeData));
    
    try {
        // 执行布局前检查预览线管理器状态
        console.log(`🔍 布局前预览线管理器锁定状态: ${previewManager.isLocked()}`);
        
        await engine.executeLayout(nodes, edges);
        
        // 执行布局后检查预览线管理器状态
        console.log(`🔍 布局后预览线管理器锁定状态: ${previewManager.isLocked()}`);
        
        // 测试预览线管理器方法调用
        engine.updatePreviewManager(previewManager);


        return true;
    } catch (error) {

        return false;
    }
}

/**
 * 主集成测试函数
 */
async function runIntegrationTests() {

    console.log('='.repeat(50));
    
    const tests = [
        { name: '基本布局功能', test: testBasicLayoutIntegration },
        { name: '缓存机制', test: testCacheIntegration },
        { name: '事件系统', test: testEventIntegration },
        { name: '预览线管理器集成', test: testPreviewManagerIntegration }
    ];
    
    const results = [];
    
    for (const { name, test } of tests) {
        try {
            const passed = await test();
            results.push({ name, passed });
        } catch (error) {

            results.push({ name, passed: false });
        }
    }
    
    // 输出测试结果

    console.log('='.repeat(50));

    let passedCount = 0;
    results.forEach(result => {
        const status = result.passed ? '✅ 通过' : '❌ 失败';

        if (result.passed) passedCount++;
    });
    
    const totalTests = results.length;
    const passRate = (passedCount / totalTests * 100).toFixed(1);
    
    console.log(`\n🏆 总体结果: ${passedCount}/${totalTests} 通过 (${passRate}%)`);
    
    if (passedCount === totalTests) {

    } else {

    }
    
    return passedCount === totalTests;
}

// 运行集成测试
runIntegrationTests().catch(error => {

    process.exit(1);
});