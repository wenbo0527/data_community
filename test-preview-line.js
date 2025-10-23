// 测试预览线生成功能的脚本
console.log('开始测试预览线生成功能...');

// 模拟节点数据
const testNodes = [
  {
    id: 'test-start-node',
    type: 'start-node',
    data: { isConfigured: true },
    position: { x: 100, y: 100 }
  },
  {
    id: 'test-manual-call',
    type: 'manual-call', 
    data: { isConfigured: false },
    position: { x: 300, y: 100 }
  },
  {
    id: 'test-sms',
    type: 'sms',
    data: { isConfigured: true },
    position: { x: 500, y: 100 }
  }
];

// 测试shouldCreatePreviewLineWithDetails方法
function testPreviewLineGeneration() {
  console.log('测试节点:', testNodes);
  
  // 这里需要实际的PreviewLineSystem实例
  // 在浏览器控制台中运行此测试
  if (typeof window !== 'undefined' && window.previewLineSystem) {
    testNodes.forEach(node => {
      console.log(`\n测试节点 ${node.id} (${node.type}):`);
      const result = window.previewLineSystem.manager.shouldCreatePreviewLineWithDetails(node);
      console.log('结果:', result);
    });
  } else {
    console.log('需要在浏览器环境中运行，且需要previewLineSystem实例');
  }
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPreviewLineGeneration, testNodes };
} else if (typeof window !== 'undefined') {
  window.testPreviewLineGeneration = testPreviewLineGeneration;
  window.testNodes = testNodes;
}

console.log('测试脚本加载完成。在浏览器中运行 testPreviewLineGeneration() 来测试预览线生成功能。');