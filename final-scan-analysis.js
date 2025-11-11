// 最终扫描分析 - 识别需要修复的非标准调用
const fs = require('fs')
const path = require('path')

// 需要检查的非测试文件（排除测试文件和UnifiedEdgeManager内部调用）
const filesToCheck = [
  // 核心业务文件
  'src/pages/data-analysis/workflow/utils/workflowNodeCreator.js',
  'src/services/marketing/GraphService.js', // 已部分修复，需要检查其他位置
  'src/pages/marketing/tasks/composables/canvas/core/ConnectionCreationController.js',
  'src/utils/enhancedErrorHandler.js',
  'src/pages/marketing/tasks/utils/canvas/nodeConnectionHelper.js', // 已修复，需要验证
  'src/utils/preview-line/renderers/PreviewLineRenderer.js',
  'src/services/marketing/PreviewLineService.js',
  'src/examples/SnapCoordinateSystemExample.js',
  'src/pages/marketing/tasks/services/GraphService.js', // 已部分修复，需要检查其他位置
  'src/utils/workflowNodeCreator.js',
  'src/pages/marketing/tasks/core/interaction/NodeConnectionOptimizer.ts',
  'src/pages/marketing/tasks/composables/canvas/unified/EdgePersistenceManager.js',
  'src/pages/discovery/data-map/components/SubwayMap.vue',
  'src/pages/marketing/tasks/composables/canvas/usePreviewLine.js', // 已修复，需要验证
  'src/core/interaction/NodeConnectionOptimizer.ts',
  'src/utils/layout/integration-test.js'
]

console.log('🔍 分析非标准调用情况...\n')

filesToCheck.forEach(filePath => {
  const fullPath = path.join('/Users/mac/nis_mock/data_comunity/data_comunity', filePath)
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')
      
      // 查找graph.addEdge调用
      const matches = []
      lines.forEach((line, index) => {
        if (line.includes('graph.addEdge(') && !line.trim().startsWith('//')) {
          // 检查是否是降级方案中的调用
          const isDowngrade = content.includes('降级方案') && 
                             (line.includes('降级方案') || 
                              lines.slice(Math.max(0, index-5), index+5).some(l => l.includes('降级方案')))
          
          matches.push({
            line: index + 1,
            content: line.trim(),
            isDowngrade
          })
        }
      })
      
      if (matches.length > 0) {
        console.log(`📁 ${filePath}:`)
        matches.forEach(match => {
          const status = match.isDowngrade ? '✅ 降级方案' : '❌ 需要修复'
          console.log(`  第${match.line}行: ${status}`)
          console.log(`    ${match.content}`)
        })
        console.log()
      }
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`)
    }
  } catch (error) {
    console.log(`❌ 读取文件失败: ${filePath} - ${error.message}`)
  }
})

console.log('📊 扫描完成')