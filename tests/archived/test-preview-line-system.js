/**
 * PreviewLineSystem方法绑定测试脚本
 * 用于验证checkNodeSnapToPreviewLines方法是否正确绑定
 */

// 导入PreviewLineSystem
import PreviewLineSystem from './src/utils/preview-line/PreviewLineSystem.js'

// 创建测试函数
function testPreviewLineSystemMethods() {
  console.log('🔍 开始测试PreviewLineSystem方法绑定...')
  
  try {
    // 创建PreviewLineSystem实例
    const mockGraph = {
      on: () => {},
      off: () => {},
      getCells: () => [],
      getNodes: () => [],
      getEdges: () => []
    }
    
    const mockLayoutEngine = {
      getLayerNodes: () => [],
      getNodeLayer: () => 0
    }
    
    console.log('📦 创建PreviewLineSystem实例...')
    const previewLineSystem = new PreviewLineSystem(mockGraph, {
      layoutEngine: mockLayoutEngine
    })
    
    console.log('✅ PreviewLineSystem实例创建成功')
    console.log('📋 实例属性:', Object.keys(previewLineSystem))
    
    // 调用init方法
    console.log('🚀 调用init方法...')
    previewLineSystem.init()
    console.log('✅ init方法调用成功')
    
    // 检查关键方法是否存在
    const methodsToCheck = [
      'checkNodeSnapToPreviewLines',
      'handleNodeConfigUpdated',
      'createPreviewLine',
      'updatePreviewLine',
      'clearPreviewLines'
    ]
    
    console.log('🔍 检查关键方法绑定状态:')
    methodsToCheck.forEach(methodName => {
      const method = previewLineSystem[methodName]
      const methodType = typeof method
      const exists = methodType === 'function'
      
      console.log(`  - ${methodName}: ${methodType} (${exists ? '✅' : '❌'})`)
      
      if (exists && methodName === 'checkNodeSnapToPreviewLines') {
        console.log('🎯 测试checkNodeSnapToPreviewLines方法调用...')
        try {
          // 创建测试参数
          const testNode = {
            id: 'test-node',
            getBBox: () => ({ x: 100, y: 100, width: 120, height: 60 })
          }
          
          const testPosition = { x: 100, y: 100 }
          const testSize = { width: 120, height: 60 }
          
          // 调用方法
          const result = method.call(previewLineSystem, testNode, testPosition, testSize)
          console.log('✅ checkNodeSnapToPreviewLines调用成功，返回结果:', result)
        } catch (error) {
          console.error('❌ checkNodeSnapToPreviewLines调用失败:', error.message)
        }
      }
    })
    
    // 检查原型链
    console.log('🔍 检查原型链:')
    console.log('  - constructor:', previewLineSystem.constructor.name)
    console.log('  - prototype methods:', Object.getOwnPropertyNames(PreviewLineSystem.prototype))
    
    // 检查实例方法绑定
    console.log('🔍 检查实例方法绑定:')
    const instanceMethods = Object.getOwnPropertyNames(previewLineSystem)
      .filter(name => typeof previewLineSystem[name] === 'function')
    console.log('  - 实例方法:', instanceMethods)
    
    console.log('✅ PreviewLineSystem方法绑定测试完成')
    
  } catch (error) {
    console.error('❌ PreviewLineSystem测试失败:', error)
    console.error('错误堆栈:', error.stack)
  }
}

// 运行测试
testPreviewLineSystemMethods()