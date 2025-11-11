/**
 * 格式化工具函数
 */

/**
 * 格式化金额
 */
export const formatAmount = (amount: number, currency: string = 'CNY'): string => {
  if (amount === null || amount === undefined) return '-'
  
  const formatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return formatter.format(amount)
}

/**
 * 格式化数字
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num === null || num === undefined) return '-'
  
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 格式化百分比
 */
export const formatPercent = (rate: number, decimals: number = 2): string => {
  if (rate === null || rate === undefined) return '-'
  
  return `${rate.toFixed(decimals)}%`
}

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  if (!date) return '-'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 格式化日期（相对时间）
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '-'
  
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  
  if (years > 0) return `${years}年前`
  if (months > 0) return `${months}个月前`
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  if (seconds > 0) return `${seconds}秒前`
  
  return '刚刚'
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化手机号
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '-'
  
  // 移除所有非数字字符
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
  }
  
  return phone
}

/**
 * 格式化身份证号
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard) return '-'
  
  if (idCard.length === 18) {
    return idCard.replace(/(\d{4})(\d{10})(\d{4})/, '$1**********$3')
  }
  
  return idCard
}

/**
 * 格式化银行卡号
 */
export const formatBankCard = (cardNo: string): string => {
  if (!cardNo) return '-'
  
  const cleanCard = cardNo.replace(/\s/g, '')
  if (cleanCard.length >= 8) {
    const last4 = cleanCard.slice(-4)
    const masked = '*'.repeat(cleanCard.length - 4)
    return masked + last4
  }
  
  return cardNo
}

/**
 * 截断字符串
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '-'
  
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength) + '...'
}

/**
 * 首字母大写
 */
export const capitalize = (text: string): string => {
  if (!text) return ''
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * 驼峰命名转下划线
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * 下划线转驼峰命名
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 深度克隆对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  } as T
}

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle = false
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  } as T
}