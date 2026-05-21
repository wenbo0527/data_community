/**
 * 格式化工具类
 * 基于 mkt-app 实现
 */

export class FormatUtils {
  /**
   * 格式化金额
   */
  static formatAmount(
    amount: number | string | null | undefined,
    options: {
      currency?: string
      precision?: number
      showSymbol?: boolean
      showThousandsSeparator?: boolean
    } = {}
  ): string {
    const {
      currency = 'CNY',
      precision = 2,
      showSymbol = true,
      showThousandsSeparator = true
    } = options

    if (amount === null || amount === undefined || amount === '') {
      return showSymbol ? '¥0.00' : '0.00'
    }

    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) {
      return showSymbol ? '¥0.00' : '0.00'
    }

    let formatted = num.toFixed(precision)

    if (showThousandsSeparator) {
      const parts = formatted.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      formatted = parts.join('.')
    }

    if (showSymbol) {
      const symbols: Record<string, string> = {
        CNY: '¥',
        USD: '$',
        EUR: '€'
      }
      return `${symbols[currency] || '¥'}${formatted}`
    }

    return formatted
  }

  /**
   * 格式化百分比（输入 0.1234 → 输出 12.34%）
   */
  static formatPercentage(value: number | string | null | undefined, precision = 2): string {
    if (value === null || value === undefined || value === '') {
      return '0.00%'
    }

    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) {
      return '0.00%'
    }

    return `${(num * 100).toFixed(precision)}%`
  }

  /**
   * 格式化利率（输入 0.1234 → 输出 12.34%）
   */
  static formatInterestRate(rate: number | string | null | undefined, precision = 2): string {
    if (rate === null || rate === undefined || rate === '') {
      return '0.00%'
    }

    const num = typeof rate === 'string' ? parseFloat(rate) : rate
    if (isNaN(num)) {
      return '0.00%'
    }

    return `${num.toFixed(precision)}%`
  }

  /**
   * 格式化手机号（显示空格：138 0013 8000）
   */
  static formatPhone(phone: string | null | undefined): string {
    if (!phone) return ''

    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
    }

    return phone
  }

  /**
   * 脱敏手机号（138 **** 8000）
   */
  static maskPhone(phone: string | null | undefined): string {
    if (!phone) return ''

    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
    }

    return phone
  }

  /**
   * 脱敏身份证号
   */
  static maskIdCard(idCard: string | null | undefined): string {
    if (!idCard) return ''

    if (idCard.length === 18) {
      return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1********$3')
    } else if (idCard.length === 15) {
      return idCard.replace(/(\d{6})(\d{6})(\d{3})/, '$1******$3')
    }

    return idCard
  }

  /**
   * 脱敏银行卡号
   */
  static maskBankCard(cardNumber: string | null | undefined): string {
    if (!cardNumber) return ''

    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.length >= 12) {
      return `${cleaned.substring(0, 4)}${'*'.repeat(cleaned.length - 8)}${cleaned.substring(cleaned.length - 4)}`
    }

    return cardNumber
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined || bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * 格式化数字
   */
  static formatNumber(
    num: number | string | null | undefined,
    options: {
      precision?: number
      showThousandsSeparator?: boolean
      showPositiveSign?: boolean
    } = {}
  ): string {
    const {
      precision = 0,
      showThousandsSeparator = true,
      showPositiveSign = false
    } = options

    if (num === null || num === undefined || num === '') {
      return '0'
    }

    const number = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(number)) {
      return '0'
    }

    let formatted = Number(number).toFixed(precision)

    if (showThousandsSeparator) {
      const parts = formatted.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      formatted = parts.join('.')
    }

    if (showPositiveSign && number > 0) {
      formatted = `+${formatted}`
    }

    return formatted
  }

  /**
   * 格式化期限
   */
  static formatTerm(
    term: number | null | undefined,
    unit: 'day' | 'month' | 'year' = 'month'
  ): string {
    if (!term || term <= 0) return ''

    const unitMap = {
      day: '天',
      month: '个月',
      year: '年'
    }

    return `${term}${unitMap[unit]}`
  }

  /**
   * 截断文本
   */
  static truncateText(text: string | null | undefined, maxLength: number, suffix = '...'): string {
    if (!text) return ''

    if (text.length <= maxLength) {
      return text
    }

    return text.substring(0, maxLength - suffix.length) + suffix
  }
}

// 导出便捷函数
export const formatAmount = FormatUtils.formatAmount
export const formatPercent = FormatUtils.formatPercentage
export const formatNumber = FormatUtils.formatNumber
export const formatPhone = FormatUtils.formatPhone
export const maskPhone = FormatUtils.maskPhone
export const maskIdCard = FormatUtils.maskIdCard
export const maskBankCard = FormatUtils.maskBankCard
export const formatFileSize = FormatUtils.formatFileSize
export const formatTerm = FormatUtils.formatTerm
export const truncateText = FormatUtils.truncateText

export default FormatUtils
