// 抽屉调试脚本 - 用于验证抽屉状态和组件渲染
// 使用方法：在浏览器控制台中复制粘贴并运行此脚本

function debugDrawerIssue() {
  console.log('=== 抽屉调试开始 ===');
  
  // 1. 检查 Vue 应用实例
  const appElement = document.querySelector('#app');
  const app = appElement?.__vue_app__;
  console.log('Vue应用实例:', app);
  
  // 2. 查找 TaskFlowConfigDrawers 组件实例
  const drawerElements = document.querySelectorAll('.task-flow-config-drawers, [class*="task-flow-config"], [class*="TaskFlowConfig"]');
  console.log('TaskFlowConfigDrawers元素数量:', drawerElements.length);
  console.log('TaskFlowConfigDrawers元素:', drawerElements);
  
  // 3. 检查所有抽屉相关的DOM元素
  const allDrawers = document.querySelectorAll('[class*="drawer"], [class*="Drawer"], .arco-drawer, [class*="config-drawer"]');
  console.log('所有抽屉相关DOM元素数量:', allDrawers.length);
  console.log('所有抽屉相关DOM元素:', allDrawers);
  
  // 4. 检查具体的抽屉组件
  const specificDrawers = {
    crowdSplit: document.querySelectorAll('[class*="crowd-split"], [class*="CrowdSplit"]'),
    eventSplit: document.querySelectorAll('[class*="event-split"], [class*="EventSplit"]'),
    aiCall: document.querySelectorAll('[class*="ai-call"], [class*="AICall"]'),
    sms: document.querySelectorAll('[class*="sms"], [class*="SMS"]'),
    manualCall: document.querySelectorAll('[class*="manual-call"], [class*="ManualCall"]'),
    abTest: document.querySelectorAll('[class*="ab-test"], [class*="ABTest"]'),
    wait: document.querySelectorAll('[class*="wait"], [class*="Wait"]')
  };
  
  console.log('具体抽屉组件:', specificDrawers);
  
  // 5. 检查 Arco Design 抽屉组件
  const arcoDrawers = document.querySelectorAll('.arco-drawer');
  console.log('Arco Design 抽屉数量:', arcoDrawers.length);
  arcoDrawers.forEach((drawer, index) => {
    console.log(`Arco 抽屉 ${index + 1}:`, {
      element: drawer,
      visible: !drawer.classList.contains('arco-drawer-hidden'),
      classes: drawer.className,
      style: drawer.style.cssText
    });
  });
  
  // 6. 检查 Vue DevTools 可用性
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('Vue DevTools 可用，请在 DevTools 中检查组件状态');
  } else {
    console.log('Vue DevTools 不可用');
  }
  
  // 7. 尝试获取 Vue 组件实例
  try {
    const canvasElement = document.querySelector('.task-flow-canvas, [class*="task-flow-canvas"]');
    if (canvasElement && canvasElement.__vueParentComponent) {
      console.log('Canvas 组件实例:', canvasElement.__vueParentComponent);
    }
  } catch (error) {
    console.log('无法获取 Vue 组件实例:', error.message);
  }
  
  // 8. 检查控制台错误
  const originalError = console.error;
  const errors = [];
  console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.log('检测到的控制台错误:', errors);
    }
  }, 1000);
  
  return {
    appExists: !!app,
    drawerElementsCount: drawerElements.length,
    allDrawersCount: allDrawers.length,
    arcoDrawersCount: arcoDrawers.length,
    specificDrawersCount: Object.keys(specificDrawers).reduce((acc, key) => {
      acc[key] = specificDrawers[key].length;
      return acc;
    }, {}),
    timestamp: new Date().toISOString()
  };
}

// 运行调试
console.log('开始运行抽屉调试脚本...');
const result = debugDrawerIssue();
console.log('调试结果:', result);

// 提供便捷的重新运行函数
window.debugDrawerIssue = debugDrawerIssue;
console.log('调试函数已添加到 window.debugDrawerIssue，可以随时重新运行');

// 监听节点点击事件
function setupNodeClickListener() {
  console.log('设置节点点击监听器...');
  
  // 监听所有可能的节点点击
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // 检查是否点击了节点
    if (target.closest('.x6-node, [class*="node"], [data-node-id]')) {
      console.log('检测到节点点击:', target);
      
      // 延迟执行调试，等待状态更新
      setTimeout(() => {
        console.log('=== 节点点击后的状态检查 ===');
        const afterClickResult = debugDrawerIssue();
        console.log('点击后调试结果:', afterClickResult);
      }, 500);
    }
  });
}

setupNodeClickListener();
console.log('节点点击监听器已设置完成');