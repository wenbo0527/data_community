// 测试PreviewLineSystem的updateLayoutDirection方法
import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';

async function testPreviewLineSystem() {
  console.log('🧪 开始测试PreviewLineSystem...');
  
  try {
    // 创建PreviewLineSystem实例
    const previewSystem = new PreviewLineSystem({
      autoInit: false // 手动初始化以便观察过程
    });
    
    console.log('✅ PreviewLineSystem实例创建成功');
    
    // 初始化系统
    console.log('🔄 开始初始化PreviewLineSystem...');
    await previewSystem.init();
    console.log('✅ PreviewLineSystem初始化完成');
    
    // 测试updateLayoutDirection方法
    console.log('🔄 测试updateLayoutDirection方法...');
    
    // 测试左右布局 (LR)
    await previewSystem.updateLayoutDirection('LR');
    console.log('✅ 左右布局方向设置成功');
    
    // 测试上下布局 (TB)
    await previewSystem.updateLayoutDirection('TB');
    console.log('✅ 上下布局方向设置成功');
    
    // 获取当前配置
    const config = previewSystem.getConfig();
    console.log('📋 当前配置:', {
      layoutDirection: config.layoutDirection,
      initialized: previewSystem.initialized
    });
    
    console.log('🎉 所有测试通过！PreviewLineSystem工作正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testPreviewLineSystem();