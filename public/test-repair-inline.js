// TaskFlow自动修复系统内联测试脚本
(function() {
    'use strict';
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runTests);
    } else {
        runTests();
    }
    
    function runTests() {
        console.log('🧪 开始TaskFlow自动修复系统测试 v2.0...');
        
        // 延迟执行，确保所有脚本都已加载
        setTimeout(async () => {
            await testSystemStatus();
            await testEnvironmentSeparation();
            await testHealthCheck();
            await testAutoRepair();
            console.log('✅ 所有测试完成');
        }, 2000);
    }
    
    async function testSystemStatus() {
        console.log('\n📋 检查系统状态...');
        
        // 检查自动修复系统是否加载
        if (typeof window.TaskFlowAutoRepairSystem === 'function') {
            console.log('✅ TaskFlowAutoRepairSystem 已加载');
            
            try {
                const instance = new window.TaskFlowAutoRepairSystem();
                console.log('✅ 自动修复系统实例创建成功');
                console.log(`环境: ${instance.config.environment}`);
                console.log('功能状态:', instance.config.features);
            } catch (error) {
                console.error('❌ 实例创建失败:', error.message);
            }
        } else {
            console.error('❌ TaskFlowAutoRepairSystem 未加载');
        }
        
        // 检查监控系统是否加载
        if (typeof window.TaskFlowMonitoringSystem === 'function') {
            console.log('✅ TaskFlowMonitoringSystem 已加载');
            
            try {
                const instance = new window.TaskFlowMonitoringSystem();
                console.log('✅ 监控系统实例创建成功');
            } catch (error) {
                console.error('❌ 监控实例创建失败:', error.message);
            }
        } else {
            console.error('❌ TaskFlowMonitoringSystem 未加载');
        }
        
        // 检查测试器是否加载
        if (typeof window.TaskFlowAutoRepairTester === 'function') {
            console.log('✅ TaskFlowAutoRepairTester 已加载');
        } else {
            console.error('❌ TaskFlowAutoRepairTester 未加载');
        }
    }
    
    async function testEnvironmentSeparation() {
        console.log('\n🌍 测试环境分离功能...');
        
        if (typeof window.TaskFlowAutoRepairSystem === 'function') {
            try {
                const instance = new window.TaskFlowAutoRepairSystem();
                const config = instance.config;
                
                console.log(`当前环境: ${config.environment}`);
                console.log('功能配置:', config.features);
                
                if (config.environment === 'development') {
                    console.log('开发环境 - 所有功能应该启用');
                    const allEnabled = config.features.healthCheck && config.features.autoRepair && config.features.monitoring;
                    console.log(allEnabled ? '✅ 开发环境功能配置正确' : '❌ 开发环境功能配置有误');
                } else {
                    console.log('生产环境 - 部分功能应该限制');
                    console.log(config.features.detailedLogging ? '⚠️ 生产环境不应启用详细日志' : '✅ 生产环境日志配置正确');
                }
            } catch (error) {
                console.error('❌ 环境分离测试失败:', error.message);
            }
        } else {
            console.error('❌ 自动修复系统未加载');
        }
    }
    
    async function testHealthCheck() {
        console.log('\n🏥 测试健康检查功能...');
        
        if (typeof window.TaskFlowAutoRepairSystem === 'function') {
            try {
                const instance = new window.TaskFlowAutoRepairSystem();
                await instance.initialize();
                
                console.log('执行健康检查...');
                await instance.performHealthCheck();
                
                const healthStatus = instance.getHealthStatus();
                console.log('健康状态:', healthStatus);
                console.log('✅ 健康检查执行成功');
            } catch (error) {
                console.error('❌ 健康检查失败:', error.message);
            }
        } else {
            console.error('❌ 自动修复系统未加载');
        }
    }
    
    async function testAutoRepair() {
        console.log('\n🔧 测试自动修复功能...');
        
        if (typeof window.TaskFlowAutoRepairSystem === 'function') {
            try {
                const instance = new window.TaskFlowAutoRepairSystem();
                await instance.initialize();
                
                console.log('执行自动修复...');
                const repairResult = await instance.performAutoRepair();
                
                console.log('修复结果:', repairResult);
                console.log('✅ 自动修复执行成功');
            } catch (error) {
                console.error('❌ 自动修复失败:', error.message);
            }
        } else {
            console.error('❌ 自动修复系统未加载');
        }
    }
    
    // 运行完整测试套件
    window.runTaskFlowTests = runTests;
    
})();