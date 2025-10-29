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
  console.log(`🔄 [组件加载] 开始加载: ${componentName}`)
  loadStats.loading.add(componentName)
  
  const startTime = performance.now()
  
  return import(/* @vite-ignore */ componentPath)
    .then(module => {
      const loadTime = performance.now() - startTime
      loadStats.loading.delete(componentName)
      loadStats.success++
      
      console.log(`✅ [组件加载] 成功: ${componentName} (${loadTime.toFixed(2)}ms)`)
      
      // 验证组件导出
      if (!module.default && !module[componentName]) {
        console.warn(`⚠️ [组件验证] ${componentName} 可能缺少默认导出`)
      }
      
      return module
    })
    .catch(error => {
      const loadTime = performance.now() - startTime
      loadStats.loading.delete(componentName)
      loadStats.failed++
      
      const errorInfo = {
        componentName,
        error: error.message,
        stack: error.stack,
        loadTime,
        timestamp: new Date().toISOString()
      }
      
      loadStats.errors.push(errorInfo)
      
      console.group(`❌ [组件加载失败] ${componentName}`)
      console.error('错误信息:', error.message)
      console.error('加载时间:', `${loadTime.toFixed(2)}ms`)
      console.error('错误堆栈:', error.stack)
      
      // 分析错误类型
      if (error.message.includes('SyntaxError')) {
        console.error('🔍 语法错误分析:')
        console.error('- 检查组件文件是否存在语法错误')
        console.error('- 检查 import/export 语句是否正确')
        console.error('- 检查是否使用了不支持的语法')
      }
      
      if (error.message.includes('Cannot resolve module')) {
        console.error('🔍 模块解析错误:')
        console.error('- 检查文件路径是否正确')
        console.error('- 检查文件是否存在')
        console.error('- 检查文件扩展名是否正确')
      }
      
      console.groupEnd()
      
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
  console.group('📊 [组件加载统计报告]')
  console.log('成功加载:', loadStats.success)
  console.log('加载失败:', loadStats.failed)
  console.log('正在加载:', Array.from(loadStats.loading))
  
  if (loadStats.errors.length > 0) {
    console.group('❌ 失败详情:')
    loadStats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.componentName}: ${error.error}`)
    })
    console.groupEnd()
  }
  
  console.groupEnd()
}

// 全局暴露统计函数（开发环境）
if (process.env.NODE_ENV === 'development') {
  window.__componentLoadStats = {
    getStats: getLoadStats,
    clearStats: clearLoadStats,
    printReport: printLoadReport
  }
}