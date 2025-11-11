// 在浏览器控制台中运行此脚本来调试布局引擎问题
console.log('🔍 布局引擎时序问题快速诊断...')

// 1. 检查全局状态
console.log('\n=== 全局状态检查 ===')
console.log('window.layoutEngine:', !!window.layoutEngine, window.layoutEngine?.constructor?.name)
console.log('window.UnifiedStructuredLayoutEngine:', !!window.UnifiedStructuredLayoutEngine)
console.log('window.unifiedEdgeManager:', !!window.unifiedEdgeManager)

// 2. 检查PreviewLineSystem
console.log('\n=== PreviewLineSystem检查 ===')
let previewLineSystem = null
if (window.unifiedEdgeManager) {
  try {
    previewLineSystem = window.unifiedEdgeManager.getPreviewLineSystem()
    console.log('PreviewLineSystem实例:', !!previewLineSystem)
    if (previewLineSystem) {
      console.log('- layoutEngine:', !!previewLineSystem.layoutEngine)
      console.log('- layoutEngineReady:', previewLineSystem.layoutEngineReady)
      console.log('- isLayoutEngineReady():', previewLineSystem.isLayoutEngineReady())
    }
  } catch (e) {
    console.log('获取PreviewLineSystem失败:', e.message)
  }
}

// 3. 检查Validator
console.log('\n=== PreviewLineValidator检查 ===')
if (previewLineSystem?.previewLineManager?.validator) {
  const validator = previewLineSystem.previewLineManager.validator
  console.log('Validator存在:', true)
  console.log('- layoutEngine:', !!validator.layoutEngine)
  console.log('- isLayoutEngineReady():', validator.isLayoutEngineReady())
} else {
  console.log('Validator不存在或无法访问')
}

// 4. 诊断结果
console.log('\n=== 诊断结果 ===')
const issues = []

if (!window.layoutEngine) {
  issues.push('❌ 全局布局引擎缺失')
}

if (previewLineSystem && !previewLineSystem.layoutEngine) {
  issues.push('❌ PreviewLineSystem缺少布局引擎')
}

if (previewLineSystem && !previewLineSystem.layoutEngineReady) {
  issues.push('❌ PreviewLineSystem布局引擎未就绪')
}

if (previewLineSystem?.previewLineManager?.validator && !previewLineSystem.previewLineManager.validator.layoutEngine) {
  issues.push('❌ PreviewLineValidator缺少布局引擎')
}

if (issues.length === 0) {
  console.log('✅ 未发现明显问题')
} else {
  console.log('发现问题:')
  issues.forEach(issue => console.log(issue))
}

console.log('\n🔧 如需手动修复，可运行:')
console.log('// 手动设置PreviewLineSystem布局引擎')
console.log('if (window.layoutEngine && previewLineSystem) {')
console.log('  previewLineSystem.setLayoutEngine(window.layoutEngine)')
console.log('  console.log("✅ 手动设置完成")')
console.log('}')