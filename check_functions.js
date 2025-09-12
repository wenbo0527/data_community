// 检查TaskFlowCanvas组件和函数暴露状态
console.log('🔍 检查TaskFlowCanvas组件状态');
console.log('当前页面URL:', window.location.href);
console.log('页面标题:', document.title);

// 检查DOM元素
console.log('\n📋 DOM元素检查:');
console.log('TaskFlowCanvas容器:', document.querySelector('.task-flow-canvas'));
console.log('Canvas区域:', document.querySelector('.canvas-area'));
console.log('画布容器:', document.querySelector('#canvas-container'));

// 检查Vue组件实例
console.log('\n🔧 Vue组件检查:');
const canvasElement = document.querySelector('.canvas-area');
if (canvasElement && canvasElement.__vueParentComponent) {
  console.log('Vue组件实例存在:', !!canvasElement.__vueParentComponent);
} else {
  console.log('Vue组件实例不存在');
}

// 检查window对象上的函数
console.log('\n🚀 函数暴露检查:');
console.log('window.initializeGraph:', typeof window.initializeGraph);
console.log('window.initializeNodeOperations:', typeof window.initializeNodeOperations);
console.log('window.initializeConfigDrawers:', typeof window.initializeConfigDrawers);
console.log('window.initializeLayoutEngineAfterDataLoad:', typeof window.initializeLayoutEngineAfterDataLoad);

// 检查所有包含initialize的window属性
console.log('\n📝 所有initialize相关属性:');
const initializeProps = Object.keys(window).filter(key => key.includes('initialize'));
console.log('找到的initialize属性:', initializeProps);

// 检查TaskFlow相关的全局变量
console.log('\n🎯 TaskFlow全局变量:');
console.log('window.TASK_FLOW_DEBUG:', window.TASK_FLOW_DEBUG);
console.log('window.taskFlowAutoRepairInstance:', !!window.taskFlowAutoRepairInstance);
console.log('window.TaskFlowAutoRepairSystem:', !!window.TaskFlowAutoRepairSystem);

console.log('\n✅ 检查完成');