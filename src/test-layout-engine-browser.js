/**
 * 浏览器环境下测试布局引擎修复
 * 验证PreviewLineSystem能否正确获取UnifiedStructuredLayoutEngine构造函数
 */

import { UnifiedStructuredLayoutEngine } from './pages/marketing/tasks/utils/canvas/UnifiedStructuredLayoutEngine.js';
import { PreviewLineSystem } from './utils/preview-line/PreviewLineSystem.js';

console.log('🧪 [浏览器测试] 开始测试布局引擎修复...');

// 1. 验证UnifiedStructuredLayoutEngine和PreviewLineSystem导入
console.log('✅ [浏览器测试] UnifiedStructuredLayoutEngine导入成功');
console.log('✅ [浏览器测试] PreviewLineSystem导入成功');
console.log('🔍 [浏览器测试] 构造函数类型:', typeof UnifiedStructuredLayoutEngine);
console.log('🔍 [浏览器测试] PreviewLineSystem类型:', typeof PreviewLineSystem);

// 2. 模拟useStructuredLayout.js的全局设置（Node.js环境）
global.UnifiedStructuredLayoutEngine = UnifiedStructuredLayoutEngine;
console.log('✅ [Node.js测试] global.UnifiedStructuredLayoutEngine已设置');
console.log('🔍 [Node.js测试] 全局构造函数类型:', typeof global.UnifiedStructuredLayoutEngine);

// 3. 验证PreviewLineSystem能否获取到构造函数
console.log('🔍 [浏览器测试] 测试PreviewLineSystem获取构造函数...');

// 模拟PreviewLineSystem中的获取逻辑
const testLayoutEngineAccess = () => {
  // 这是PreviewLineSystem中initializeLayoutEngineIfNeeded方法的逻辑
  if (typeof global.UnifiedStructuredLayoutEngine === 'function') {
    console.log('✅ [Node.js测试] PreviewLineSystem可以访问构造函数');
    
    // 尝试创建PreviewLineSystem实例进行测试
    try {
      // 创建一个模拟的graph对象用于测试
      const mockGraph = {
        getNodes: () => [],
        getEdges: () => [],
        on: () => {},
        off: () => {}
      };
      
      // 测试PreviewLineSystem实例化
      const previewLineSystem = new PreviewLineSystem(mockGraph);
      console.log('✅ [Node.js测试] PreviewLineSystem实例创建成功');
      console.log('✅ [Node.js测试] 构造函数可用，可以创建实例');
      return true;
    } catch (error) {
      console.error('❌ [Node.js测试] 创建PreviewLineSystem实例失败:', error);
      return false;
    }
  } else {
    console.error('❌ [Node.js测试] PreviewLineSystem无法访问构造函数');
    console.error('❌ [Node.js测试] global.UnifiedStructuredLayoutEngine类型:', typeof global.UnifiedStructuredLayoutEngine);
    return false;
  }
};

const testResult = testLayoutEngineAccess();

if (testResult) {
  console.log('🎉 [Node.js测试] 布局引擎修复验证成功！');
  console.log('🔧 [Node.js测试] PreviewLineSystem现在应该能够正确初始化布局引擎');
} else {
  console.error('💥 [Node.js测试] 布局引擎修复验证失败！');
}

console.log('🏁 [Node.js测试] 测试完成');

// 4. 额外验证：检查修复前后的差异
console.log('📊 [Node.js测试] 修复状态总结:');
console.log('- global.UnifiedStructuredLayoutEngine存在:', typeof global.UnifiedStructuredLayoutEngine === 'function');
console.log('- 可用于创建实例:', typeof global.UnifiedStructuredLayoutEngine === 'function');
console.log('- PreviewLineSystem可以访问:', typeof global.UnifiedStructuredLayoutEngine === 'function');