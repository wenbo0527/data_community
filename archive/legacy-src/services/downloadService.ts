import { Message } from '@arco-design/web-vue'

/**
 * 下载服务
 * 提供文件下载和导出功能
 */
class DownloadService {
  /**
   * 下载文件
   */
  async downloadFile(url: string, filename?: string): Promise<boolean> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || this.getFilenameFromUrl(url)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(downloadUrl)
      
      Message.success('文件下载成功')
      return true
    } catch (error) {
      console.error('文件下载失败:', error)
      Message.error('文件下载失败')
      return false
    }
  }

  /**
   * 导出Excel文件
   */
  async exportExcel(data: any[], filename: string, headers?: string[]): Promise<boolean> {
    try {
      // 这里应该使用实际的Excel导出库，如 xlsx
      // 为了测试，我们模拟导出过程
      const csvContent = this.convertToCSV(data, headers)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      Message.success('Excel导出成功')
      return true
    } catch (error) {
      console.error('Excel导出失败:', error)
      Message.error('Excel导出失败')
      return false
    }
  }

  /**
   * 导出PDF文件
   */
  async exportPDF(content: string, filename: string): Promise<boolean> {
    try {
      // 这里应该使用实际的PDF生成库，如 jsPDF
      // 为了测试，我们模拟PDF导出过程
      const blob = new Blob([content], { type: 'application/pdf' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.pdf`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      Message.success('PDF导出成功')
      return true
    } catch (error) {
      console.error('PDF导出失败:', error)
      Message.error('PDF导出失败')
      return false
    }
  }

  /**
   * 导出JSON文件
   */
  async exportJSON(data: any, filename: string): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      Message.success('JSON导出成功')
      return true
    } catch (error) {
      console.error('JSON导出失败:', error)
      Message.error('JSON导出失败')
      return false
    }
  }

  /**
   * 预览文件
   */
  async previewFile(url: string): Promise<boolean> {
    try {
      // 在新窗口中打开文件预览
      const newWindow = window.open(url, '_blank')
      if (!newWindow) {
        throw new Error('无法打开预览窗口，请检查浏览器弹窗设置')
      }
      
      Message.success('文件预览已打开')
      return true
    } catch (error) {
      console.error('文件预览失败:', error)
      Message.error('文件预览失败')
      return false
    }
  }

  /**
   * 批量下载文件
   */
  async downloadBatch(urls: string[], filenames?: string[]): Promise<boolean> {
    try {
      const promises = urls.map((url, index) => {
        const filename = filenames?.[index]
        return this.downloadFile(url, filename)
      })
      
      const results = await Promise.all(promises)
      const successCount = results.filter(result => result).length
      
      if (successCount === urls.length) {
        Message.success(`批量下载完成，共${successCount}个文件`)
      } else {
        Message.warning(`批量下载完成，成功${successCount}个，失败${urls.length - successCount}个`)
      }
      
      return successCount > 0
    } catch (error) {
      console.error('批量下载失败:', error)
      Message.error('批量下载失败')
      return false
    }
  }

  /**
   * 从URL获取文件名
   */
  private getFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop()
      return filename || 'download'
    } catch {
      return 'download'
    }
  }

  /**
   * 转换为CSV格式
   */
  private convertToCSV(data: any[], headers?: string[]): string {
    if (!data || data.length === 0) {
      return ''
    }

    let csv = ''
    
    // 添加表头
    if (headers && headers.length > 0) {
      csv += headers.join(',') + '\n'
    } else {
      // 使用第一行数据的键作为表头
      const firstRow = data[0]
      if (typeof firstRow === 'object') {
        csv += Object.keys(firstRow).join(',') + '\n'
      }
    }
    
    // 添加数据行
    data.forEach(row => {
      if (Array.isArray(row)) {
        csv += row.map(field => this.escapeCSVField(field)).join(',') + '\n'
      } else if (typeof row === 'object') {
        const values = headers 
          ? headers.map(header => row[header] || '')
          : Object.values(row)
        csv += values.map(field => this.escapeCSVField(field)).join(',') + '\n'
      }
    })
    
    return csv
  }

  /**
   * 转义CSV字段
   */
  private escapeCSVField(field: any): string {
    if (field === null || field === undefined) {
      return ''
    }
    
    const str = String(field)
    
    // 如果包含逗号、引号或换行符，需要用引号包围并转义内部引号
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    
    return str
  }

  /**
   * 检查文件类型
   */
  getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    const typeMap: Record<string, string> = {
      'pdf': 'PDF文档',
      'doc': 'Word文档',
      'docx': 'Word文档',
      'xls': 'Excel表格',
      'xlsx': 'Excel表格',
      'ppt': 'PowerPoint演示文稿',
      'pptx': 'PowerPoint演示文稿',
      'txt': '文本文件',
      'csv': 'CSV文件',
      'json': 'JSON文件',
      'xml': 'XML文件',
      'jpg': '图片文件',
      'jpeg': '图片文件',
      'png': '图片文件',
      'gif': '图片文件',
      'zip': '压缩文件',
      'rar': '压缩文件'
    }
    
    return typeMap[extension || ''] || '未知文件类型'
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
}

export default new DownloadService()