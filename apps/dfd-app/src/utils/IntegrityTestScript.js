/**
 * 完整性校验测试脚本
 * 可在浏览器控制台中直接执行的完整性测试工具
 * 
 * 使用方法：
 * 1. 在浏览器控制台中复制粘贴此脚本
 * 2. 调用 window.runIntegrityTests() 执行完整测试
 * 3. 调用 window.runQuickIntegrityCheck() 执行快速检查
 */

(function() {
    'use strict';

    // 测试结果收集器
    class TestResultCollector {
        constructor() {
            this.results = [];
            this.summary = {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            };
        }

        addResult(testName, status, message, details = null) {
            const result = {
                testName,
                status, // 'pass', 'fail', 'warning'
                message,
                details,
                timestamp: new Date().toISOString()
            };
            
            this.results.push(result);
            this.summary.total++;
            this.summary[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
            
            // 实时输出结果
            const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';

            if (details) {

            }
        }

        printSummary() {
            console.log('\n' + '='.repeat(60));

            console.log('='.repeat(60));




            console.log(`成功率: ${((this.summary.passed / this.summary.total) * 100).toFixed(1)}%`);
            console.log('='.repeat(60));
            
            return this.summary;
        }

        getFailedTests() {
            return this.results.filter(r => r.status === 'fail');
        }
    }

    // 完整性测试工具类
    class IntegrityTester {
        constructor() {
            this.collector = new TestResultCollector();
            this.graph = null;
            this.layoutEngine = null;
            this.previewLineManager = null;
        }

        // 初始化测试环境
        initializeTestEnvironment() {

            // 获取关键实例
            this.graph = window.graph || window.__graph__ || null;
            this.layoutEngine = window.layoutEngine || window.__layoutEngine__ || null;
            this.previewLineManager = window.previewLineManager || window.__previewLineManager__ || null;

            if (!this.graph) {
                this.collector.addResult('环境检查', 'fail', 'Graph实例未找到');
                return false;
            }

            if (!this.layoutEngine) {
                this.collector.addResult('环境检查', 'fail', 'LayoutEngine实例未找到');
                return false;
            }

            this.collector.addResult('环境检查', 'pass', '测试环境初始化成功');
            return true;
        }

        // TC001: 基础节点坐标测试
        testBasicNodeCoordinates() {
            const testName = 'TC001-基础节点坐标';
            
            try {
                const nodes = this.graph.getNodes();
                if (nodes.length === 0) {
                    this.collector.addResult(testName, 'warning', '图中没有节点');
                    return;
                }

                const invalidNodes = [];
                nodes.forEach(node => {
                    const position = node.getPosition();
                    const { x, y } = position;
                    
                    if (isNaN(x) || isNaN(y) || x === undefined || y === undefined) {
                        invalidNodes.push({
                            id: node.id,
                            type: node.getData()?.type || 'unknown',
                            position: { x, y }
                        });
                    }
                });

                if (invalidNodes.length === 0) {
                    this.collector.addResult(testName, 'pass', `所有${nodes.length}个节点坐标有效`);
                } else {
                    this.collector.addResult(testName, 'fail', 
                        `发现${invalidNodes.length}个无效坐标节点`, invalidNodes);
                }
            } catch (error) {
                this.collector.addResult(testName, 'fail', `测试执行错误: ${error.message}`);
            }
        }

        // TC002: audience-split节点特殊测试
        testAudienceSplitNodes() {
            const testName = 'TC002-AudienceSplit节点';
            
            try {
                const nodes = this.graph.getNodes();
                const audienceSplitNodes = nodes.filter(node => {
                    const nodeData = node.getData();
                    return nodeData?.type === 'audience-split';
                });

                if (audienceSplitNodes.length === 0) {
                    this.collector.addResult(testName, 'warning', '没有找到audience-split节点');
                    return;
                }

                const issues = [];
                audienceSplitNodes.forEach(node => {
                    const position = node.getPosition();
                    const { x, y } = position;
                    
                    if (isNaN(y)) {
                        issues.push({
                            id: node.id,
                            issue: 'Y坐标为NaN',
                            position: { x, y }
                        });
                    }
                    
                    // 检查是否在正确的层级（第2层）
                    if (this.layoutEngine && typeof this.layoutEngine.getNodeLayerY === 'function') {
                        try {
                            const expectedY = this.layoutEngine.getNodeLayerY(node.id);
                            if (Math.abs(y - expectedY) > 1) { // 允许1px误差
                                issues.push({
                                    id: node.id,
                                    issue: 'Y坐标与预期层级不符',
                                    expected: expectedY,
                                    actual: y
                                });
                            }
                        } catch (e) {
                            issues.push({
                                id: node.id,
                                issue: '无法计算预期Y坐标',
                                error: e.message
                            });
                        }
                    }
                });

                if (issues.length === 0) {
                    this.collector.addResult(testName, 'pass', 
                        `所有${audienceSplitNodes.length}个audience-split节点正常`);
                } else {
                    this.collector.addResult(testName, 'fail', 
                        `发现${issues.length}个audience-split节点问题`, issues);
                }
            } catch (error) {
                this.collector.addResult(testName, 'fail', `测试执行错误: ${error.message}`);
            }
        }

        // TC007: 预览线源节点验证
        testPreviewLineSourceNodes() {
            const testName = 'TC007-预览线源节点';
            
            try {
                if (!this.previewLineManager) {
                    this.collector.addResult(testName, 'warning', '预览线管理器未找到');
                    return;
                }

                // 检查预览线管理器的状态
                const previewLines = this.previewLineManager.previewLines || [];
                if (previewLines.length === 0) {
                    this.collector.addResult(testName, 'warning', '当前没有预览线');
                    return;
                }

                const issues = [];
                previewLines.forEach((previewLine, index) => {
                    if (!previewLine.sourceNode) {
                        issues.push({
                            index,
                            issue: '缺少源节点',
                            previewLine: previewLine
                        });
                    } else {
                        const sourcePosition = previewLine.sourceNode.getPosition();
                        if (isNaN(sourcePosition.x) || isNaN(sourcePosition.y)) {
                            issues.push({
                                index,
                                issue: '源节点坐标无效',
                                sourceId: previewLine.sourceNode.id,
                                position: sourcePosition
                            });
                        }
                    }
                });

                if (issues.length === 0) {
                    this.collector.addResult(testName, 'pass', 
                        `所有${previewLines.length}条预览线源节点有效`);
                } else {
                    this.collector.addResult(testName, 'fail', 
                        `发现${issues.length}个预览线源节点问题`, issues);
                }
            } catch (error) {
                this.collector.addResult(testName, 'fail', `测试执行错误: ${error.message}`);
            }
        }

        // TC010: 连接线双节点验证
        testEdgeIntegrity() {
            const testName = 'TC010-连接线完整性';
            
            try {
                const edges = this.graph.getEdges();
                if (edges.length === 0) {
                    this.collector.addResult(testName, 'warning', '图中没有连接线');
                    return;
                }

                const issues = [];
                edges.forEach(edge => {
                    const sourceNode = edge.getSourceNode();
                    const targetNode = edge.getTargetNode();
                    
                    if (!sourceNode) {
                        issues.push({
                            edgeId: edge.id,
                            issue: '缺少源节点',
                            sourceId: edge.getSourceCellId()
                        });
                    }
                    
                    if (!targetNode) {
                        issues.push({
                            edgeId: edge.id,
                            issue: '缺少目标节点',
                            targetId: edge.getTargetCellId()
                        });
                    }
                    
                    // 检查节点坐标
                    if (sourceNode) {
                        const pos = sourceNode.getPosition();
                        if (isNaN(pos.x) || isNaN(pos.y)) {
                            issues.push({
                                edgeId: edge.id,
                                issue: '源节点坐标无效',
                                sourceId: sourceNode.id,
                                position: pos
                            });
                        }
                    }
                    
                    if (targetNode) {
                        const pos = targetNode.getPosition();
                        if (isNaN(pos.x) || isNaN(pos.y)) {
                            issues.push({
                                edgeId: edge.id,
                                issue: '目标节点坐标无效',
                                targetId: targetNode.id,
                                position: pos
                            });
                        }
                    }
                });

                if (issues.length === 0) {
                    this.collector.addResult(testName, 'pass', 
                        `所有${edges.length}条连接线完整性正常`);
                } else {
                    this.collector.addResult(testName, 'fail', 
                        `发现${issues.length}个连接线完整性问题`, issues);
                }
            } catch (error) {
                this.collector.addResult(testName, 'fail', `测试执行错误: ${error.message}`);
            }
        }

        // 布局引擎功能测试
        testLayoutEngineFunction() {
            const testName = 'TC-布局引擎功能';
            
            try {
                if (!this.layoutEngine) {
                    this.collector.addResult(testName, 'fail', '布局引擎实例不存在');
                    return;
                }

                const issues = [];
                
                // 检查关键方法是否存在
                const requiredMethods = [
                    'calculateLayerY',
                    'getNodeLayerY', 
                    'getSimpleLayerIndex',
                    'getLayerByNodeTypeAndId'
                ];
                
                requiredMethods.forEach(method => {
                    if (typeof this.layoutEngine[method] !== 'function') {
                        issues.push(`缺少方法: ${method}`);
                    }
                });

                // 测试calculateLayerY方法
                if (typeof this.layoutEngine.calculateLayerY === 'function') {
                    try {
                        const testY = this.layoutEngine.calculateLayerY(1);
                        if (isNaN(testY)) {
                            issues.push('calculateLayerY返回NaN');
                        }
                    } catch (e) {
                        issues.push(`calculateLayerY执行错误: ${e.message}`);
                    }
                }

                if (issues.length === 0) {
                    this.collector.addResult(testName, 'pass', '布局引擎功能正常');
                } else {
                    this.collector.addResult(testName, 'fail', 
                        `布局引擎存在${issues.length}个问题`, issues);
                }
            } catch (error) {
                this.collector.addResult(testName, 'fail', `测试执行错误: ${error.message}`);
            }
        }

        // 性能测试
        testPerformance() {
            const testName = 'TC-性能测试';
            
            try {
                const nodes = this.graph.getNodes();
                const nodeCount = nodes.length;
                
                // 测试布局计算性能
                const startTime = performance.now();
                
                // 触发布局重新计算
                if (this.layoutEngine && typeof this.layoutEngine.calculateLayout === 'function') {
                    this.layoutEngine.calculateLayout();
                } else if (typeof window.triggerLayout === 'function') {
                    window.triggerLayout();
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                const expectedMaxTime = nodeCount < 50 ? 100 : nodeCount < 100 ? 200 : 500;
                
                if (duration <= expectedMaxTime) {
                    this.collector.addResult(testName, 'pass', 
                        `布局计算耗时${duration.toFixed(2)}ms (${nodeCount}个节点)`);
                } else {
                    this.collector.addResult(testName, 'warning', 
                        `布局计算耗时${duration.toFixed(2)}ms，超过预期${expectedMaxTime}ms`);
                }
            } catch (error) {
                this.collector.addResult(testName, 'fail', `性能测试执行错误: ${error.message}`);
            }
        }

        // 执行完整测试套件
        runFullTestSuite() {

            console.log('='.repeat(60));
            
            if (!this.initializeTestEnvironment()) {

                return this.collector.printSummary();
            }

            // 执行所有测试
            this.testBasicNodeCoordinates();
            this.testAudienceSplitNodes();
            this.testPreviewLineSourceNodes();
            this.testEdgeIntegrity();
            this.testLayoutEngineFunction();
            this.testPerformance();

            return this.collector.printSummary();
        }

        // 快速完整性检查
        runQuickCheck() {

            if (!this.initializeTestEnvironment()) {
                return false;
            }

            this.testBasicNodeCoordinates();
            this.testAudienceSplitNodes();
            
            const summary = this.collector.printSummary();
            return summary.failed === 0;
        }

        // 获取详细的问题报告
        getDetailedReport() {
            const failedTests = this.collector.getFailedTests();

            console.log('='.repeat(40));
            
            if (failedTests.length === 0) {

                return;
            }

            failedTests.forEach((test, index) => {


                if (test.details) {


                }
            });
        }
    }

    // 自动修复工具
    class AutoFixer {
        constructor(graph, layoutEngine) {
            this.graph = graph;
            this.layoutEngine = layoutEngine;
        }

        // 修复NaN坐标
        fixNaNCoordinates() {

            const nodes = this.graph.getNodes();
            let fixedCount = 0;
            
            nodes.forEach(node => {
                const position = node.getPosition();
                let { x, y } = position;
                let needsUpdate = false;
                
                if (isNaN(x) || x === undefined) {
                    x = 100; // 默认X坐标
                    needsUpdate = true;
                }
                
                if (isNaN(y) || y === undefined) {
                    // 尝试通过布局引擎计算正确的Y坐标
                    if (this.layoutEngine && typeof this.layoutEngine.getNodeLayerY === 'function') {
                        try {
                            y = this.layoutEngine.getNodeLayerY(node.id);
                        } catch (e) {
                            y = 100; // 回退到默认值
                        }
                    } else {
                        y = 100; // 默认Y坐标
                    }
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    node.setPosition({ x, y });
                    fixedCount++;
                    console.log(`✅ 修复节点 ${node.id} 坐标: (${x}, ${y})`);
                }
            });

            return fixedCount;
        }
    }

    // 将工具暴露到全局
    window.IntegrityTester = IntegrityTester;
    window.AutoFixer = AutoFixer;
    
    // 便捷方法
    window.runIntegrityTests = function() {
        const tester = new IntegrityTester();
        return tester.runFullTestSuite();
    };
    
    window.runQuickIntegrityCheck = function() {
        const tester = new IntegrityTester();
        return tester.runQuickCheck();
    };
    
    window.fixNaNCoordinates = function() {
        const graph = window.graph || window.__graph__;
        const layoutEngine = window.layoutEngine || window.__layoutEngine__;
        
        if (!graph) {

            return 0;
        }
        
        const fixer = new AutoFixer(graph, layoutEngine);
        return fixer.fixNaNCoordinates();
    };
    
    window.getIntegrityReport = function() {
        const tester = new IntegrityTester();
        tester.runFullTestSuite();
        tester.getDetailedReport();
    };


    console.log('   • runIntegrityTests() - 执行完整测试套件');
    console.log('   • runQuickIntegrityCheck() - 快速完整性检查');
    console.log('   • fixNaNCoordinates() - 自动修复NaN坐标');
    console.log('   • getIntegrityReport() - 获取详细问题报告');

})();