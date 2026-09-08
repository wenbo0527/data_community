/**
 * 复制文本到剪贴板的工具函数
 */

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (text) => {
  try {
    // 优先使用现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }
    
    // 降级方案：使用传统的 document.execCommand
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve()
      } else {
        reject(new Error('复制失败'))
      }
      document.body.removeChild(textArea)
    })
  } catch (error) {
    throw new Error('复制失败: ' + error.message)
  }
}

/**
 * 复制对象数据为JSON格式
 * @param {any} data - 要复制的数据
 * @returns {Promise<void>}
 */
export const copyDataAsJson = async (data) => {
  const jsonString = JSON.stringify(data, null, 2)
  await copyToClipboard(jsonString)
}

/**
 * 复制数组数据为CSV格式
 * @param {Array} data - 要复制的数组数据
 * @param {Array} headers - CSV头部（可选）
 * @returns {Promise<void>}
 */
export const copyDataAsCsv = async (data, headers = null) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('数据必须是非空数组')
  }
  
  let csvContent = ''
  
  // 如果提供了headers，使用它们；否则从第一个对象的键生成
  const csvHeaders = headers || Object.keys(data[0])
  csvContent += csvHeaders.join(',') + '\n'
  
  // 添加数据行
  data.forEach(item => {
    const row = csvHeaders.map(header => {
      const value = item[header]
      // 处理包含逗号、引号或换行符的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    })
    csvContent += row.join(',') + '\n'
  })
  
  await copyToClipboard(csvContent)
}

/**
 * 复制表格数据（支持选中行）
 * @param {Array} data - 表格数据
 * @param {Array} columns - 列配置
 * @param {Array} selectedRows - 选中的行（可选）
 * @returns {Promise<void>}
 */
export const copyTableData = async (data, columns, selectedRows = null) => {
  const targetData = selectedRows && selectedRows.length > 0 ? selectedRows : data
  const headers = columns.map(col => col.title)
  const csvData = targetData.map(row => {
    const csvRow = {}
    columns.forEach(col => {
      csvRow[col.title] = row[col.dataIndex]
    })
    return csvRow
  })
  
  await copyDataAsCsv(csvData, headers)
}