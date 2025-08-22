// 测试页面状态的脚本
// 在浏览器控制台中运行此脚本来检查页面状态

console.log('=== Customer360 页面状态检查 ===');

// 检查页面基本元素
const checkPageElements = () => {
  console.log('1. 检查页面基本元素:');
  
  const app = document.getElementById('app');
  console.log('  - #app 元素:', app ? '存在' : '不存在');
  
  const customer360Container = document.querySelector('.customer360-container');
  console.log('  - .customer360-container:', customer360Container ? '存在' : '不存在');
  
  const debugPanel = document.querySelector('.debug-panel');
  console.log('  - .debug-panel:', debugPanel ? '存在' : '不存在');
  
  const loadingElement = document.querySelector('.loading');
  console.log('  - 加载状态元素:', loadingElement ? '存在' : '不存在');
  
  return { app, customer360Container, debugPanel, loadingElement };
};

// 检查Vue应用状态
const checkVueApp = () => {
  console.log('2. 检查Vue应用状态:');
  
  // 检查Vue DevTools
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('  - Vue DevTools: 已安装');
  } else {
    console.log('  - Vue DevTools: 未安装');
  }
  
  // 检查Vue实例
  const app = document.getElementById('app');
  if (app && app.__vue_app__) {
    console.log('  - Vue应用实例: 存在');
  } else {
    console.log('  - Vue应用实例: 不存在或未挂载');
  }
};

// 检查控制台错误
const checkConsoleErrors = () => {
  console.log('3. 检查控制台错误:');
  
  // 重写console.error来捕获错误
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.log('  - 捕获到的错误数量:', errors.length);
    if (errors.length > 0) {
      console.log('  - 错误详情:', errors);
    }
  }, 1000);
};

// 检查网络请求
const checkNetworkRequests = () => {
  console.log('4. 检查网络请求:');
  
  // 监听fetch请求
  const originalFetch = window.fetch;
  const requests = [];
  
  window.fetch = function(...args) {
    requests.push({
      url: args[0],
      options: args[1],
      timestamp: new Date().toISOString()
    });
    return originalFetch.apply(this, args);
  };
  
  setTimeout(() => {
    console.log('  - API请求数量:', requests.length);
    if (requests.length > 0) {
      console.log('  - 请求详情:', requests);
    }
  }, 2000);
};

// 检查路由状态
const checkRouterStatus = () => {
  console.log('5. 检查路由状态:');
  
  console.log('  - 当前URL:', window.location.href);
  console.log('  - 路径:', window.location.pathname);
  console.log('  - 查询参数:', window.location.search);
  console.log('  - Hash:', window.location.hash);
};

// 执行所有检查
const runAllChecks = () => {
  const elements = checkPageElements();
  checkVueApp();
  checkConsoleErrors();
  checkNetworkRequests();
  checkRouterStatus();
  
  // 如果找到调试面板，显示其内容
  if (elements.debugPanel) {
    console.log('6. 调试面板内容:');
    console.log(elements.debugPanel.textContent);
  }
  
  console.log('=== 检查完成 ===');
};

// 运行检查
runAllChecks();

// 导出函数供手动调用
window.customer360Debug = {
  checkPageElements,
  checkVueApp,
  checkConsoleErrors,
  checkNetworkRequests,
  checkRouterStatus,
  runAllChecks
};

console.log('调试工具已加载，可以使用 window.customer360Debug 访问各种检查函数');