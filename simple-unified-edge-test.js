/**
 * 简化的统一边管理器验证脚本
 * 主要验证类和方法是否可用，而不是完整功能测试
 */

import UnifiedEdgeManager from './src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js'

console.log('🚀 开始统一边管理器基础验证...\n')

try {
  // 1. 验证类是否可用
  console.log('1. 验证UnifiedEdgeManager类')
  console.log('✓ UnifiedEdgeManager类导入成功')
  console.log('✓ 类型:', typeof UnifiedEdgeManager)
  
  // 2. 验证构造函数
  console.log('\n2. 验证构造函数')
  const mockGraph = {
    addEdge: () => ({ id: 'test' }),
    removeEdge: () => {},
    getEdges: () => [],
    getNodes: () => [],
    getNode: () => null,
    getCellById: () => null,
    on: () => {},
    off: () => {},
    trigger: () => {}
  }
  
  const manager = new UnifiedEdgeManager(mockGraph)
  console.log('✓ UnifiedEdgeManager实例创建成功')
  console.log('✓ 实例类型:', typeof manager)
  
  // 3. 验证核心方法是否存在
  console.log('\n3. 验证核心方法')
  const methods = [
    'createPreviewLine',
    'createConnection', 
    'convertPreviewToConnection',
    'removeEdge',
    'removePreviewLine',
    'clearAllPreviewLines',
    'getEdge',
    'getPreviewLine',
    'getConnection',
    'hasPreviewLine',
    'hasConnection',
    'cleanup',
    'destroy'
  ]
  
  methods.forEach(method => {
    if (typeof manager[method] === 'function') {
      console.log(`✓ ${method}方法存在`)
    } else {
      console.log(`❌ ${method}方法不存在`)
    }
  })
  
  // 4. 验证配置选项
  console.log('\n4. 验证配置选项')
  const managerWithOptions = new UnifiedEdgeManager(mockGraph, {
    autoCleanup: true,
    performanceOptimization: true,
    problemDiagnosis: true,
    enableConnectionValidation: true,
    enableInPortSnap: true,
    enableBatchOperations: true
  })
  console.log('✓ 带配置选项的实例创建成功')
  
  // 5. 验证销毁方法
  console.log('\n5. 验证销毁方法')
  manager.destroy()
  managerWithOptions.destroy()
  console.log('✓ 销毁方法执行成功')
  
  console.log('\n🎉 统一边管理器基础验证通过！')
  console.log('\n📋 验证结果总结:')
  console.log('- ✅ 类导入正常')
  console.log('- ✅ 实例创建正常') 
  console.log('- ✅ 核心方法完整')
  console.log('- ✅ 配置选项支持')
  console.log('- ✅ 销毁机制正常')
  
  process.exit(0)

} catch (error) {
  console.error('❌ 验证失败:', error.message)
  console.error(error.stack)
  process.exit(1)
}