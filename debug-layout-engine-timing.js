/**
 * 布局引擎初始化时序问题调试脚本
 * 用于分析"布局引擎未就绪"错误的根本原因
 */

console.log('🔍 开始布局引擎初始化时序问题分析...')

// 1. 检查全局布局引擎状态
function checkGlobalLayoutEngine() {
  console.log('\n=== 1. 全局布局引擎状态检查 ===')
  
  const hasWindowLayoutEngine = !!window.layoutEngine
  const hasUnifiedEngine = !!window.UnifiedStructuredLayoutEngine
  
  console.log('全局布局引擎状态:', {
    hasWindowLayoutEngine,
    hasUnifiedEngine,
    layoutEngineType: window.layoutEngine?.constructor?.name,
    layoutEngineReady: window.layoutEngine?.isReady,
    layoutEngineIsReadyMethod: typeof window.layoutEngine?.isLayoutEngineReady
  })
  
  return {
    hasWindowLayoutEngine,
    hasUnifiedEngine,
    layoutEngine: window.layoutEngine
  }
}

// 2. 检查PreviewLineSystem状态
function checkPreviewLineSystemStatus() {
  console.log('\n=== 2. PreviewLineSystem状态检查 ===')
  
  // 尝试获取PreviewLineSystem实例
  let previewLineSystem = null
  
  // 方法1: 通过全局变量
  if (window.previewLineSystem) {
    previewLineSystem = window.previewLineSystem
    console.log('✓ 通过window.previewLineSystem获取到实例')
  }
  
  // 方法2: 通过UnifiedEdgeManager
  if (!previewLineSystem && window.unifiedEdgeManager) {
    try {
      previewLineSystem = window.unifiedEdgeManager.getPreviewLineSystem()
      console.log('✓ 通过UnifiedEdgeManager获取到PreviewLineSystem实例')
    } catch (error) {
      console.log('❌ 通过UnifiedEdgeManager获取PreviewLineSystem失败:', error.message)
    }
  }
  
  if (previewLineSystem) {
    const hasLayoutEngine = !!previewLineSystem.layoutEngine
    const layoutEngineReady = previewLineSystem.layoutEngineReady
    const isLayoutEngineReady = previewLineSystem.isLayoutEngineReady()
    
    console.log('PreviewLineSystem状态:', {
      hasLayoutEngine,
      layoutEngineReady,
      isLayoutEngineReady,
      layoutEngineType: previewLineSystem.layoutEngine?.constructor?.name,
      previewLineSystemInitialized: previewLineSystem.isInitialized?.()
    })
    
    return {
      instance: previewLineSystem,
      hasLayoutEngine,
      layoutEngineReady,
      isLayoutEngineReady
    }
  } else {
    console.log('❌ 未找到PreviewLineSystem实例')
    return null
  }
}

// 3. 检查PreviewLineValidator状态
function checkPreviewLineValidatorStatus() {
  console.log('\n=== 3. PreviewLineValidator状态检查 ===')
  
  const previewLineSystemStatus = checkPreviewLineSystemStatus()
  
  if (previewLineSystemStatus?.instance) {
    const previewLineSystem = previewLineSystemStatus.instance
    
    // 检查PreviewLineManager
    if (previewLineSystem.previewLineManager) {
      const validator = previewLineSystem.previewLineManager.validator
      
      if (validator) {
        const validatorHasLayoutEngine = !!validator.layoutEngine
        const validatorIsReady = validator.isLayoutEngineReady()
        
        console.log('PreviewLineValidator状态:', {
          validatorExists: true,
          validatorHasLayoutEngine,
          validatorIsReady,
          validatorLayoutEngineType: validator.layoutEngine?.constructor?.name
        })
        
        return {
          validator,
          validatorHasLayoutEngine,
          validatorIsReady
        }
      } else {
        console.log('❌ PreviewLineValidator不存在')
      }
    } else {
      console.log('❌ PreviewLineManager不存在')
    }
  }
  
  return null
}

// 4. 分析时序问题
function analyzeTimingIssues() {
  console.log('\n=== 4. 时序问题分析 ===')
  
  const globalStatus = checkGlobalLayoutEngine()
  const previewLineStatus = checkPreviewLineSystemStatus()
  const validatorStatus = checkPreviewLineValidatorStatus()
  
  console.log('\n📊 综合分析结果:')
  
  // 问题1: 全局布局引擎是否存在
  if (!globalStatus.hasWindowLayoutEngine) {
    console.log('❌ 问题1: window.layoutEngine 不存在')
    console.log('   原因: 布局引擎可能未正确初始化或设置')
  } else {
    console.log('✅ 全局布局引擎存在')
  }
  
  // 问题2: PreviewLineSystem是否获得布局引擎
  if (previewLineStatus && !previewLineStatus.hasLayoutEngine) {
    console.log('❌ 问题2: PreviewLineSystem.layoutEngine 不存在')
    console.log('   原因: setLayoutEngine方法可能未被调用或调用失败')
  } else if (previewLineStatus) {
    console.log('✅ PreviewLineSystem已获得布局引擎')
  }
  
  // 问题3: PreviewLineValidator是否获得布局引擎
  if (validatorStatus && !validatorStatus.validatorHasLayoutEngine) {
    console.log('❌ 问题3: PreviewLineValidator.layoutEngine 不存在')
    console.log('   原因: validator.setLayoutEngine方法可能未被调用')
  } else if (validatorStatus) {
    console.log('✅ PreviewLineValidator已获得布局引擎')
  }
  
  // 问题4: 布局引擎就绪状态
  if (previewLineStatus && !previewLineStatus.isLayoutEngineReady) {
    console.log('❌ 问题4: 布局引擎未就绪')
    console.log('   原因: layoutEngineReady标志未正确设置')
  } else if (previewLineStatus) {
    console.log('✅ 布局引擎已就绪')
  }
  
  return {
    globalStatus,
    previewLineStatus,
    validatorStatus
  }
}

// 5. 提供修复建议
function provideFixes(analysisResult) {
  console.log('\n=== 5. 修复建议 ===')
  
  const { globalStatus, previewLineStatus, validatorStatus } = analysisResult
  
  const fixes = []
  
  if (!globalStatus.hasWindowLayoutEngine) {
    fixes.push({
      issue: '全局布局引擎缺失',
      fix: '确保在TaskFlowCanvasRefactored.vue的onMounted中正确调用configDrawers.structuredLayout.createLayoutEngineInstance()',
      priority: 'high'
    })
  }
  
  if (previewLineStatus && !previewLineStatus.hasLayoutEngine) {
    fixes.push({
      issue: 'PreviewLineSystem缺少布局引擎',
      fix: '确保在PreviewLineSystem初始化后调用setLayoutEngine(window.layoutEngine)',
      priority: 'high'
    })
  }
  
  if (validatorStatus && !validatorStatus.validatorHasLayoutEngine) {
    fixes.push({
      issue: 'PreviewLineValidator缺少布局引擎',
      fix: '在PreviewLineSystem.setLayoutEngine中确保同时设置validator的布局引擎',
      priority: 'medium'
    })
  }
  
  if (previewLineStatus && !previewLineStatus.isLayoutEngineReady) {
    fixes.push({
      issue: '布局引擎就绪状态错误',
      fix: '在setLayoutEngine方法中确保设置layoutEngineReady = true',
      priority: 'medium'
    })
  }
  
  console.log('修复建议列表:')
  fixes.forEach((fix, index) => {
    console.log(`${index + 1}. [${fix.priority.toUpperCase()}] ${fix.issue}`)
    console.log(`   解决方案: ${fix.fix}`)
  })
  
  return fixes
}

// 执行完整分析
function runCompleteAnalysis() {
  console.log('🚀 开始完整的布局引擎时序问题分析...')
  
  try {
    const analysisResult = analyzeTimingIssues()
    const fixes = provideFixes(analysisResult)
    
    console.log('\n🎯 分析完成!')
    console.log(`发现 ${fixes.length} 个需要修复的问题`)
    
    return {
      success: true,
      analysisResult,
      fixes
    }
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 导出分析函数
window.debugLayoutEngineTiming = {
  checkGlobalLayoutEngine,
  checkPreviewLineSystemStatus,
  checkPreviewLineValidatorStatus,
  analyzeTimingIssues,
  provideFixes,
  runCompleteAnalysis
}

// 自动运行分析
console.log('🔧 自动运行布局引擎时序分析...')
const result = runCompleteAnalysis()

if (result.success) {
  console.log('\n✅ 布局引擎时序问题分析完成')
  console.log('💡 请在浏览器控制台中查看详细分析结果')
  console.log('🛠️ 可以通过 window.debugLayoutEngineTiming 访问调试工具')
} else {
  console.log('\n❌ 分析失败:', result.error)
}