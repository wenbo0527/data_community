/**
 * 校验工具类
 */

export class ValidationUtils {
  /**
   * 校验手机号（中国大陆）
   */
  static isPhone(phone: string | null | undefined): boolean {
    if (!phone) return false
    return /^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''))
  }

  /**
   * 校验邮箱
   */
  static isEmail(email: string | null | undefined): boolean {
    if (!email) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  /**
   * 校验身份证号（中国大陆，15位或18位）
   */
  static isIdCard(idCard: string | null | undefined): boolean {
    if (!idCard) return false
    const is15 = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9]|[12]\d)|3[01])\d{3}$/.test(idCard)
    const is18 = /^[1-9]\d{5}((19|20)\d{2})((0[1-9])|(1[0-2]))((0[1-9]|[12]\d)|3[01])\d{3}[\dXx]$/.test(idCard)
    return is15 || is18
  }

  /**
   * 校验是否为空（null, undefined, 空字符串，空数组）
   */
  static isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    return false
  }

  /**
   * 校验是否在范围内
   */
  static isInRange(
    value: number,
    min: number | null | undefined,
    max: number | null | undefined
  ): boolean {
    if (min !== null && min !== undefined && value < min) return false
    if (max !== null && max !== undefined && value > max) return false
    return true
  }

  /**
   * 校验URL格式
   */
  static isUrl(url: string | null | undefined): boolean {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * 校验是否全为数字
   */
  static isNumeric(value: string | null | undefined): boolean {
    if (!value) return false
    return /^\d+$/.test(value)
  }

  /**
   * 校验字符串长度范围
   */
  static isLengthInRange(
    value: string,
    min: number | null | undefined,
    max: number | null | undefined
  ): boolean {
    const len = value.length
    if (min !== null && min !== undefined && len < min) return false
    if (max !== null && max !== undefined && len > max) return false
    return true
  }
}

export const isPhone = ValidationUtils.isPhone
export const isEmail = ValidationUtils.isEmail
export const isIdCard = ValidationUtils.isIdCard
export const isEmpty = ValidationUtils.isEmpty
export const isInRange = ValidationUtils.isInRange
export const isUrl = ValidationUtils.isUrl
export const isNumeric = ValidationUtils.isNumeric
export const isLengthInRange = ValidationUtils.isLengthInRange

export default ValidationUtils
