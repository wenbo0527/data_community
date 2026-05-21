// 测试 PreviewLineSystem 修复效果
console.log('🔍 开始测试 PreviewLineSystem 修复效果...');

// 等待页面完全加载
function waitForPreviewSystem() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50; // 最多等待5秒
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      console.log(`[测试] 第${attempts}次检查 window.previewLineSystem...`);
      
      if (window.previewLineSystem) {
        clearInterval(checkInterval);
        console.log('✅ window.previewLineSystem 已找到!');
        resolve(window.previewLineSystem);
        return;
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('❌ 超时：未找到 window.previewLineSystem');
        reject(new Error('超时：未找到 window.previewLineSystem'));
        return;
      }
    }, 100);
  });
}

// 测试 PreviewLineSystem 方法
function testPreviewSystemMethods(previewSystem) {
  console.log('🧪 开始测试 PreviewLineSystem 方法...');
  
  const methods = [
    'getAllPreviewLines',
    'getActivePreviewLines', 
    'getPreviewLineData',
    'initialize',
    'init'
  ];
  
  methods.forEach(methodName => {
    if (typeof previewSystem[methodName] === 'function') {
      console.log(`✅ 方法 ${methodName} 可用`);
      
      // 特别测试 getAllPreviewLines 方法
      if (methodName === 'getAllPreviewLines') {
        try {
          const result = previewSystem.getAllPreviewLines();
          console.log(`✅ ${methodName}() 调用成功，返回:`, result);
        } catch (error) {
          console.log(`❌ ${methodName}() 调用失败:`, error.message);
        }
      }
    } else {
      console.log(`❌ 方法 ${methodName} 不可用`);
    }
  });
}

// 主测试函数
async function runTest() {
  try {
    console.log('🚀 启动 PreviewLineSystem 测试...');
    
    // 检查当前状态
    console.log('当前 window.previewLineSystem:', window.previewLineSystem);
    
    if (window.previewLineSystem) {
      console.log('✅ window.previewLineSystem 已存在，直接测试');
      testPreviewSystemMethods(window.previewLineSystem);
    } else {
      console.log('⏳ window.previewLineSystem 不存在，等待初始化...');
      const previewSystem = await waitForPreviewSystem();
      testPreviewSystemMethods(previewSystem);
    }
    
    console.log('🎉 测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 立即运行测试
runTest();

// 也在页面加载完成后运行测试
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runTest);
} else {
  // 如果页面已经加载完成，延迟一点再测试
  setTimeout(runTest, 1000);
}

console.log('📝 测试脚本已加载，等待执行结果...');