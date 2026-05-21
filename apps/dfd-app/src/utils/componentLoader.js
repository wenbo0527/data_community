/**
 * 组件加载器 - 增强的动态导入监控
 */

// 组件加载统计
const loadStats = {
  success: 0,
  failed: 0,
  loading: new Set(),
  errors: []
}

/**
 * 增强的组件加载函数
 * @param {string} componentPath - 组件路径
 * @param {string} componentName - 组件名称（用于调试）
 * @returns {Promise} 组件加载Promise
 */
export function loadComponent(componentPath, componentName = '未知组件') {

  loadStats.loading.add(componentName)
  
  const startTime = performance.now()
  
  return import(/* @vite-ignore */ componentPath)
    .then(module => {
      const loadTime = performance.now() - startTime
      loadStats.loading.delete(componentName)
      loadStats.success++
      
      console.log(`✅ [组件加载] 成功: ${componentName} (${loadTime.toFixed(2)}ms)`)
      
      // 验证组件导出
      if (!module?.default && !module?.[componentName]) {

      }
      
      return module?.default || module?.[componentName] || module
    })
    .catch(error => {
      const loadTime = performance.now() - startTime
      loadStats.loading.delete(componentName)
      loadStats.failed++
      
      // 从错误堆栈中解析可能的文件位置
      let fileName = null
      let lineNumber = null
      let columnNumber = null
      if (typeof error?.stack === 'string') {
        const m = error.stack.match(/(https?:\/\/[^\s)]+):(\d+):(\d+)/)
        if (m) {
          fileName = m[1]
          lineNumber = Number(m[2])
          columnNumber = Number(m[3])
        }
      }
      const errorInfo = {
        componentName,
        componentPath,
        error: error.message,
        stack: error.stack,
        fileName,
        lineNumber,
        columnNumber,
        loadTime,
        timestamp: new Date().toISOString()
      }
      
      loadStats.errors.push(errorInfo)



      console.error('加载时间:', `${loadTime.toFixed(2)}ms`)

      if (fileName) {


      }
      
      // 分析错误类型
      if (error.message.includes('SyntaxError')) {




      }
      
      if (error.message.includes('Cannot resolve module')) {




      }

      throw error
    })
}

/**
 * 获取组件加载统计信息
 */
export function getLoadStats() {
  return {
    ...loadStats,
    loading: Array.from(loadStats.loading),
    errors: [...loadStats.errors]
  }
}

/**
 * 清理加载统计
 */
export function clearLoadStats() {
  loadStats.success = 0
  loadStats.failed = 0
  loadStats.loading.clear()
  loadStats.errors = []
}

/**
 * 打印加载统计报告
 */
export function printLoadReport() {



  console.log('正在加载:', Array.from(loadStats.loading))
  
  if (loadStats.errors.length > 0) {

    loadStats.errors.forEach((error, index) => {

    })

  }

}

// 全局暴露统计函数（开发环境）
if (process.env.NODE_ENV === 'development') {
  window.__componentLoadStats = {
    getStats: getLoadStats,
    clearStats: clearLoadStats,
    printReport: printLoadReport
  }
}