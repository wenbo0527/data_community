// 验证自动修复系统状态
console.log('🔍 [验证] 开始验证自动修复系统状态');

// 检查全局变量
console.log('📋 [验证] 全局变量检查:');
console.log('- TaskFlowAutoRepairSystem:', typeof window.TaskFlowAutoRepairSystem);
console.log('- taskFlowAutoRepair:', typeof window.taskFlowAutoRepair);
console.log('- runTaskFlowTests:', typeof window.runTaskFlowTests);

// 检查系统实例
if (window.taskFlowAutoRepair) {
  console.log('✅ [验证] 自动修复系统实例存在');
  console.log('- 环境:', window.taskFlowAutoRepair.config?.environment);
  console.log('- 配置:', window.taskFlowAutoRepair.config);
  
  // 获取系统状态
  window.taskFlowAutoRepair.getSystemStatus().then(status => {
    console.log('📊 [验证] 系统状态:', status);
  }).catch(err => {
    console.error('❌ [验证] 获取系统状态失败:', err);
  });
  
  // 手动触发健康检查
  console.log('🔧 [验证] 手动触发健康检查...');
  window.taskFlowAutoRepair.performHealthCheckAndRepair().then(result => {
    console.log('✅ [验证] 健康检查结果:', result);
  }).catch(err => {
    console.error('❌ [验证] 健康检查失败:', err);
  });
} else {
  console.error('❌ [验证] 自动修复系统实例不存在');
}

// 检查环境检测
if (window.TaskFlowAutoRepairSystem) {
  const testInstance = new window.TaskFlowAutoRepairSystem();
  console.log('🌍 [验证] 环境检测测试:');
  console.log('- 检测结果:', testInstance.isDevelopment);
  console.log('- 配置环境:', testInstance.config.environment);
}

console.log('🏁 [验证] 验证完成');