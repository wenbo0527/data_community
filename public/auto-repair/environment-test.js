// 环境分离测试脚本
console.log('🧪 开始环境分离测试...');

// 等待DOM和脚本加载完成
function runEnvironmentTest() {
    console.log('\n=== TaskFlow自动修复系统环境分离测试 ===');
    
    // 1. 检查系统是否加载
    console.log('\n1. 系统加载检查:');
    console.log('   TaskFlowAutoRepairSystem类:', typeof window.TaskFlowAutoRepairSystem);
    console.log('   taskFlowAutoRepair实例:', !!window.taskFlowAutoRepair);
    
    if (!window.taskFlowAutoRepair) {
        console.error('❌ 自动修复系统未正确加载');
        return;
    }
    
    // 2. 环境检测测试
    console.log('\n2. 环境检测测试:');
    const isDev = window.taskFlowAutoRepair.detectDevelopmentEnvironment();
    console.log('   环境检测结果:', isDev ? '开发环境' : '生产环境');
    
    // 3. 配置检查
    console.log('\n3. 系统配置检查:');
    const config = window.taskFlowAutoRepair.config;
    console.log('   配置对象:', config);
    console.log('   环境设置:', config.environment);
    console.log('   功能配置:', config.features);
    
    // 4. 环境分离验证
    console.log('\n4. 环境分离验证:');
    if (isDev) {
        console.log('   ✅ 开发环境 - 应启用完整功能');
        console.log('   - 健康检查:', config.features.healthCheck ? '✅ 启用' : '❌ 禁用');
        console.log('   - 定期检查:', config.features.periodicCheck ? '✅ 启用' : '❌ 禁用');
        console.log('   - 详细日志:', config.features.detailedLogging ? '✅ 启用' : '❌ 禁用');
        console.log('   - 错误监听:', config.features.errorListening ? '✅ 启用' : '❌ 禁用');
    } else {
        console.log('   ✅ 生产环境 - 应保持简化处理');
        console.log('   - 健康检查:', config.features.healthCheck ? '⚠️ 启用(生产环境应禁用)' : '✅ 禁用');
        console.log('   - 定期检查:', config.features.periodicCheck ? '⚠️ 启用(生产环境应禁用)' : '✅ 禁用');
        console.log('   - 详细日志:', config.features.detailedLogging ? '⚠️ 启用(生产环境应禁用)' : '✅ 禁用');
        console.log('   - 错误监听:', config.features.errorListening ? '✅ 启用' : '❌ 禁用');
    }
    
    // 5. 系统状态检查
    console.log('\n5. 系统状态检查:');
    const status = window.taskFlowAutoRepair.getSystemStatus();
    console.log('   系统状态:', status);
    
    // 6. 功能测试
    console.log('\n6. 功能测试:');
    if (isDev && config.features.healthCheck) {
        console.log('   正在执行健康检查测试...');
        try {
            window.taskFlowAutoRepair.performHealthCheckAndRepair();
            console.log('   ✅ 健康检查功能正常');
        } catch (error) {
            console.log('   ❌ 健康检查功能异常:', error.message);
        }
    } else {
        console.log('   ⏭️ 跳过健康检查测试(功能未启用或非开发环境)');
    }
    
    console.log('\n=== 环境分离测试完成 ===\n');
}

// 延迟执行测试，确保所有脚本都已加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runEnvironmentTest, 1000);
    });
} else {
    setTimeout(runEnvironmentTest, 1000);
}