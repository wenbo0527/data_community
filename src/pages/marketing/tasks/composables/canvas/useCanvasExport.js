import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

/**
 * 画布导出功能 Composable
 * 提供图片导出功能，支持PNG、JPG、SVG格式
 */
export function useCanvasExport() {
  // 导出状态
  const isExporting = ref(false)
  const exportProgress = ref(0)
  
  // 导出格式配置
  const exportFormats = [
    { value: 'png', label: 'PNG图片', icon: 'icon-image' },
    { value: 'jpg', label: 'JPG图片', icon: 'icon-image' },
    { value: 'svg', label: 'SVG矢量图', icon: 'icon-file-image' }
  ]
  
  // 导出配置
  const exportConfig = {
    png: {
      backgroundColor: '#f8f9fa',
      padding: 20,
      quality: 1
    },
    jpg: {
      backgroundColor: '#f8f9fa',
      padding: 20,
      quality: 0.9
    },
    svg: {
      preserveDimensions: true,
      copyStyles: true,
      serializeImages: true
    }
  }
  
  /**
   * 生成导出文件名
   * @param {string} format - 导出格式
   * @param {string} prefix - 文件名前缀
   * @returns {string} 文件名
   */
  const generateFileName = (format, prefix = 'canvas') => {
    const timestamp = new Date().getTime()
    return `${prefix}_${timestamp}.${format}`
  }
  
  /**
   * 导出图片
   * @param {Object} graph - X6图实例
   * @param {string} format - 导出格式 (png|jpg|svg)
   * @param {Object} options - 导出选项
   */
  const handleExport = async (graph, format, options = {}) => {
    if (!graph) {
      Message.error('画布未初始化')
      return false
    }
    
    try {
      isExporting.value = true
      exportProgress.value = 0
      
      const fileName = options.fileName || generateFileName(format)
      const config = { ...exportConfig[format], ...options.config }
      
      exportProgress.value = 30
      
      switch (format) {
        case 'png':
          await graph.exportPNG(fileName, config)
          Message.success('PNG图片导出成功')
          break
          
        case 'jpg':
          await graph.exportJPEG(fileName, config)
          Message.success('JPG图片导出成功')
          break
          
        case 'svg':
          await graph.exportSVG(fileName, config)
          Message.success('SVG图片导出成功')
          break
          
        default:
          throw new Error(`不支持的导出格式: ${format}`)
      }
      
      exportProgress.value = 100
      return true
      
    } catch (error) {
      console.error('导出图片失败:', error)
      Message.error(`导出图片失败: ${error.message}`)
      return false
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }
  
  /**
   * 批量导出多种格式
   * @param {Object} graph - X6图实例
   * @param {Array} formats - 导出格式数组
   * @param {Object} options - 导出选项
   */
  const batchExport = async (graph, formats = ['png'], options = {}) => {
    if (!graph) {
      Message.error('画布未初始化')
      return false
    }
    
    const results = []
    
    for (const format of formats) {
      const result = await handleExport(graph, format, {
        ...options,
        fileName: options.fileName ? 
          `${options.fileName}.${format}` : 
          generateFileName(format)
      })
      results.push({ format, success: result })
    }
    
    const successCount = results.filter(r => r.success).length
    
    if (successCount === formats.length) {
      Message.success(`成功导出${successCount}个文件`)
    } else if (successCount > 0) {
      Message.warning(`成功导出${successCount}/${formats.length}个文件`)
    } else {
      Message.error('导出失败')
    }
    
    return results
  }
  
  /**
   * 导出为Base64数据
   * @param {Object} graph - X6图实例
   * @param {string} format - 导出格式
   * @param {Object} options - 导出选项
   * @returns {Promise<string>} Base64数据
   */
  const exportAsBase64 = async (graph, format = 'png', options = {}) => {
    if (!graph) {
      throw new Error('画布未初始化')
    }
    
    try {
      const config = { ...exportConfig[format], ...options }
      
      switch (format) {
        case 'png':
          return await graph.toPNG(config)
        case 'jpg':
          return await graph.toJPEG(config)
        case 'svg':
          return await graph.toSVG(config)
        default:
          throw new Error(`不支持的导出格式: ${format}`)
      }
    } catch (error) {
      console.error('导出Base64失败:', error)
      throw error
    }
  }
  
  /**
   * 预览导出效果
   * @param {Object} graph - X6图实例
   * @param {string} format - 导出格式
   * @param {Object} options - 导出选项
   * @returns {Promise<string>} 预览URL
   */
  const previewExport = async (graph, format = 'png', options = {}) => {
    try {
      const base64 = await exportAsBase64(graph, format, options)
      return `data:image/${format};base64,${base64}`
    } catch (error) {
      console.error('预览导出失败:', error)
      throw error
    }
  }
  
  return {
    // 状态
    isExporting,
    exportProgress,
    
    // 配置
    exportFormats,
    exportConfig,
    
    // 方法
    handleExport,
    batchExport,
    exportAsBase64,
    previewExport,
    generateFileName
  }
}