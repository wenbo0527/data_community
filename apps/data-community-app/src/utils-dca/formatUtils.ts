/**
 * 格式化工具函数
 */

/**
 * 格式化金额
 */
export function formatAmount(value: number | string, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * 脱敏手机号
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

/**
 * 脱敏身份证
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.slice(0, 4) + '****' + idCard.slice(-4)
}

/**
 * 格式化信用卡号（脱敏）
 */
export function maskCreditCard(cardNo: string): string {
  if (!cardNo || cardNo.length < 8) return cardNo
  return cardNo.slice(0, 4) + ' **** **** ' + cardNo.slice(-4)
}
