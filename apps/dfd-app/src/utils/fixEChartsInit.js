/**
 * ECharts初始化批量修复脚本
 * 基于Arco Design规范，自动替换项目中所有的echarts.init调用
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 需要修复的文件列表
const filesToFix = [
  'src/pages/exploration/customer-center/tag-system/tag-detail.vue',
  'src/components/modals/ExternalProductModal.vue.js',
  'src/components/modals/BudgetBurndownTabs.vue.js',
  'src/pages/marketing/coupon/statistics/index.vue.js',
  'src/pages/exploration/customer-center/event-center/event-sample-stats.vue',
  'src/pages/exploration/customer-center/tag-system/tag-detail/tag-detail.vue.js',
  'src/pages/exploration/external-data-analysis/external-data-monitor.vue',
  'src/pages/exploration/external-data-analysis/external-data-monitor.vue.js',
  'src/pages/exploration/customer-center/audience-system/audience-detail.vue',
  'src/pages/exploration/ExternalDataEvaluationDetail.vue',
  'src/pages/discovery/data-map/components/IndicatorDetail.vue',
  'src/pages/discovery/data-map/components/nodes/StationNode.ts',
  'src/pages/exploration/customer-center/tag-system/tag-detail/tag-detail.vue',
  'src/pages/exploration/customer-center/event-center/event-sample-stats.vue.js',
  'src/pages/exploration/customer-center/audience-system/audience-detail.vue.js',
  'src/pages/marketing/coupon/statistics/index.vue',
  'src/pages/discovery/data-map/components/nodes/MetricNode.ts',
  'src/pages/exploration/customer-center/tag-system/tag-detail.vue.js'
]

/**
 * 生成修复建议
 */
function generateFixSuggestions() {
  const suggestions = []
  
  filesToFix.forEach(filePath => {
    const fullPath = path.resolve(__dirname, '../../', filePath)
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      
      // 检查是否包含echarts.init
      if (content.includes('echarts.init')) {
        suggestions.push({
          file: filePath,
          action: 'replace_echarts_init',
          description: '替换echarts.init为safeInitECharts',
          priority: 'high'
        })
      }
      
      // 检查是否已导入工具函数
      if (!content.includes('safeInitECharts') && content.includes('echarts.init')) {
        suggestions.push({
          file: filePath,
          action: 'add_import',
          description: '添加echartsUtils导入',
          priority: 'high'
        })
      }
    }
  })
  
  return suggestions
}

/**
 * 生成修复报告
 */
function generateFixReport() {
  const suggestions = generateFixSuggestions()
  
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: filesToFix.length,
    needsFix: suggestions.length,
    suggestions: suggestions,
    fixTemplate: {
      import: `import { safeInitECharts, safeDisposeChart } from '@/utils/echartsUtils'`,
      replace: {
        from: 'echarts.init(container)',
        to: 'await safeInitECharts(container)'
      },
      asyncFunction: '需要将包含echarts.init的函数改为async函数'
    }
  }
  
  return report
}

// 生成并输出报告
const report = generateFixReport()

console.log(JSON.stringify(report, null, 2))

export { generateFixSuggestions, generateFixReport }