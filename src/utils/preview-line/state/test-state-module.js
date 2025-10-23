/**
 * 状态管理模块功能测试
 * 测试StateManager和StateSynchronizer的基本功能
 */

import { StateManager, StateSynchronizer, createStateSystem } from './index.js';

// 测试StateManager基本功能
function testStateManager() {
  console.log('=== 测试StateManager ===');
  
  const stateManager = new StateManager({
    enableHistory: true,
    enableValidation: true,
    enableBatching: true
  });
  
  // 测试状态设置和获取
  console.log('1. 测试状态设置和获取');
  stateManager.setState('test.value', 42);
  console.log('设置 test.value = 42');
  console.log('获取 test.value:', stateManager.getState('test.value'));
  
  // 测试状态订阅
  console.log('\n2. 测试状态订阅');
  const unsubscribe = stateManager.subscribe('test.value', (newValue, oldValue, path) => {
    console.log(`状态变化: ${path} 从 ${oldValue} 变为 ${newValue}`);
  });
  
  stateManager.setState('test.value', 100);
  
  // 测试批量更新
  console.log('\n3. 测试批量更新');
  stateManager.startBatch();
  stateManager.setState('test.a', 1);
  stateManager.setState('test.b', 2);
  stateManager.setState('test.c', 3);
  stateManager.endBatch();
  
  console.log('批量更新后的状态:', stateManager.getState('test'));
  
  // 测试历史记录
  console.log('\n4. 测试历史记录');
  console.log('撤销前:', stateManager.getState('test.value'));
  stateManager.undo();
  console.log('撤销后:', stateManager.getState('test.value'));
  stateManager.redo();
  console.log('重做后:', stateManager.getState('test.value'));
  
  // 清理
  unsubscribe();
  stateManager.destroy();
  
  console.log('StateManager 测试完成\n');
}

// 测试StateSynchronizer基本功能
async function testStateSynchronizer() {
  console.log('=== 测试StateSynchronizer ===');
  
  const synchronizer = new StateSynchronizer({
    enableSync: true,
    enableBroadcast: false,
    enableDebug: true
  });
  
  // 创建模拟连接
  const mockConnection1 = {
    id: 'connection1',
    getState: () => ({ value: 1 }),
    setState: (data) => console.log('Connection1 setState:', data),
    subscribe: (callback) => console.log('Connection1 subscribed'),
    unsubscribe: () => console.log('Connection1 unsubscribed')
  };
  
  const mockConnection2 = {
    id: 'connection2',
    getState: () => ({ value: 2 }),
    setState: (data) => console.log('Connection2 setState:', data),
    subscribe: (callback) => console.log('Connection2 subscribed'),
    unsubscribe: () => console.log('Connection2 unsubscribed')
  };
  
  // 测试连接注册
  console.log('1. 测试连接注册');
  synchronizer.registerConnection('conn1', mockConnection1, {
    priority: 'high',
    strategy: 'incremental'
  });
  
  synchronizer.registerConnection('conn2', mockConnection2, {
    priority: 'normal',
    strategy: 'batch'
  });
  
  console.log('已注册连接数:', Object.keys(synchronizer.connections).length);
  
  // 测试状态同步
  console.log('\n2. 测试状态同步');
  await synchronizer.syncState('conn1', { test: 'sync-data' }, {
    strategy: 'incremental',
    priority: 'high'
  });
  
  // 测试统计信息
  console.log('\n3. 测试统计信息');
  console.log('同步统计:', synchronizer.getStats());
  
  // 清理
  synchronizer.destroy();
  
  console.log('StateSynchronizer 测试完成\n');
}

// 测试完整状态系统
function testStateSystem() {
  console.log('=== 测试完整状态系统 ===');
  
  const stateSystem = createStateSystem({
    stateManagerOptions: {
      enableHistory: true,
      enableValidation: true
    },
    synchronizerOptions: {
      enableSync: true,
      enableDebug: true
    },
    enableSync: true
  });
  
  // 测试状态操作
  console.log('1. 测试状态操作');
  stateSystem.setState('app.user', { id: 1, name: 'Test User' });
  console.log('用户状态:', stateSystem.getState('app.user'));
  
  // 测试订阅
  console.log('\n2. 测试订阅');
  const unsubscribe = stateSystem.subscribe('app.user.name', (newValue) => {
    console.log('用户名变更为:', newValue);
  });
  
  stateSystem.setState('app.user.name', 'Updated User');
  
  // 测试统计信息
  console.log('\n3. 测试统计信息');
  console.log('系统统计:', stateSystem.getStats());
  
  // 清理
  unsubscribe();
  stateSystem.destroy();
  
  console.log('完整状态系统测试完成\n');
}

// 运行所有测试
export async function runStateModuleTests() {
  console.log('开始状态管理模块测试...');
  console.log('================================');
  
  try {
    testStateManager();
    await testStateSynchronizer();
    testStateSystem();
    
    console.log('✅ 所有测试通过!');
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.runStateModuleTests = runStateModuleTests;
  console.log('状态管理模块测试已加载，请调用 runStateModuleTests() 执行测试');
} else {
  // Node.js环境
  runStateModuleTests().catch(console.error);
}

export default {
  runStateModuleTests,
  testStateManager,
  testStateSynchronizer,
  testStateSystem
};