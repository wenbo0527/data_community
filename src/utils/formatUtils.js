/**
 * 格式化工具函数
 * 提供数字、金额、日期等格式化功能
 */

/**
 * 格式化金额
 * @param {number|string} amount - 金额
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的金额字符串
 */
export function formatAmount(amount, decimals = 2) {
  if (amount === null || amount === undefined || amount === '') {
    return '0.00'
  }
  
  const num = parseFloat(amount)
  if (isNaN(num)) {
    return '0.00'
  }
  
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 格式化百分比
 * @param {number|string} value - 数值
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的百分比字符串
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || value === '') {
    return '0.00%'
  }
  
  const num = parseFloat(value)
  if (isNaN(num)) {
    return '0.00%'
  }
  
  return (num * 100).toFixed(decimals) + '%'
}

/**
 * 格式化数字
 * @param {number|string} value - 数值
 * @param {number} decimals - 小数位数，默认0位
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || value === '') {
    return '0'
  }
  
  const num = parseFloat(value)
  if (isNaN(num)) {
    return '0'
  }
  
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式，默认'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) {
    return ''
  }
  
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return ''
  }
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY-MM-DD HH:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`
    case 'MM-DD':
      return `${month}-${day}`
    case 'HH:mm:ss':
      return `${hours}:${minutes}:${seconds}`
    case 'HH:mm':
      return `${hours}:${minutes}`
    default:
      return `${year}-${month}-${day}`
  }
}

/**
 * 格式化时间戳
 * @param {number} timestamp - 时间戳（毫秒）
 * @param {string} format - 格式，默认'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatTimestamp(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp) {
    return ''
  }
  
  return formatDate(new Date(timestamp), format)
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的文件大小字符串
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化手机号
 * @param {string} phone - 手机号
 * @returns {string} 格式化后的手机号
 */
export function formatPhone(phone) {
  if (!phone) return ''
  
  const phoneStr = String(phone).replace(/\D/g, '')
  if (phoneStr.length === 11) {
    return phoneStr.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
  }
  
  return phone
}

/**
 * 格式化身份证号
 * @param {string} idCard - 身份证号
 * @returns {string} 格式化后的身份证号
 */
export function formatIdCard(idCard) {
  if (!idCard) return ''
  
  const idStr = String(idCard)
  if (idStr.length === 18) {
    return idStr.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
  } else if (idStr.length === 15) {
    return idStr.replace(/(\d{6})\d{6}(\d{3})/, '$1******$2')
  }
  
  return idCard
}

/**
 * 格式化银行卡号
 * @param {string} cardNo - 银行卡号
 * @returns {string} 格式化后的银行卡号
 */
export function formatBankCard(cardNo) {
  if (!cardNo) return ''
  
  const cardStr = String(cardNo).replace(/\s/g, '')
  if (cardStr.length >= 16) {
    return cardStr.replace(/(\d{4})\d*(\d{4})/, '$1****$2')
  }
  
  return cardNo
}

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀，默认'...'
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text) return ''
  
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength) + suffix
}

/**
 * 格式化状态
 * @param {string|number} status - 状态值
 * @param {Object} statusMap - 状态映射表
 * @returns {string} 格式化后的状态文本
 */
export function formatStatus(status, statusMap = {}) {
  if (status === null || status === undefined) {
    return '未知'
  }
  
  return statusMap[status] || status
}

// 默认导出所有函数
export default {
  formatAmount,
  formatPercent,
  formatNumber,
  formatDate,
  formatTimestamp,
  formatFileSize,
  formatPhone,
  formatIdCard,
  formatBankCard,
  truncateText,
  formatStatus
}