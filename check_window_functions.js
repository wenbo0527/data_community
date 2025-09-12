console.log('=== 检查 window 对象上的函数 ===');
console.log('initializeGraph:', typeof window.initializeGraph);
console.log('initializeNodeOperations:', typeof window.initializeNodeOperations);
console.log('initializeConfigDrawers:', typeof window.initializeConfigDrawers);
console.log('initializeLayoutEngineAfterDataLoad:', typeof window.initializeLayoutEngineAfterDataLoad);
console.log('graph:', typeof window.graph);
console.log('layoutEngine:', typeof window.layoutEngine);
console.log('=== window 对象的所有属性 ===');
const windowProps = Object.getOwnPropertyNames(window).filter(prop => 
  prop.includes('initialize') || 
  prop.includes('graph') || 
  prop.includes('layout') ||
  prop.includes('TaskFlow')
);
console.log('相关属性:', windowProps);
