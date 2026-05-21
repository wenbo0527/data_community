/**
 * 日期工具类 - 合并各应用实现
 * 基于 mkt-app 实现（最完整），补充 risk-app 的 formatDateTime
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.locale('zh-cn')

export class DateUtils {
  /**
   * 格式化日期
   */
  static formatDate(date: string | Date | null | undefined, format = 'YYYY-MM-DD'): string {
    if (!date) return ''
    return dayjs(date).format(format)
  }

  /**
   * 格式化日期时间
   */
  static formatDateTime(date: string | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string {
    if (!date) return ''
    return dayjs(date).format(format)
  }

  /**
   * 格式化时间
   */
  static formatTime(date: string | Date | null | undefined, format = 'HH:mm:ss'): string {
    if (!date) return ''
    return dayjs(date).format(format)
  }

  /**
   * 获取相对时间（几分钟前、几小时前等）
   */
  static getRelativeTime(date: string | Date | null | undefined): string {
    if (!date) return ''
    return dayjs(date).fromNow()
  }

  /**
   * 计算时间差（天数）
   */
  static getDaysDiff(startDate: string | Date, endDate: string | Date): number {
    if (!startDate || !endDate) return 0
    return dayjs(endDate).diff(dayjs(startDate), 'day')
  }

  /**
   * 计算时间差（小时）
   */
  static getHoursDiff(startDate: string | Date, endDate: string | Date): number {
    if (!startDate || !endDate) return 0
    return dayjs(endDate).diff(dayjs(startDate), 'hour')
  }

  /**
   * 计算时间差（分钟）
   */
  static getMinutesDiff(startDate: string | Date, endDate: string | Date): number {
    if (!startDate || !endDate) return 0
    return dayjs(endDate).diff(dayjs(startDate), 'minute')
  }

  /**
   * 判断是否为今天
   */
  static isToday(date: string | Date | null | undefined): boolean {
    if (!date) return false
    return dayjs(date).isSame(dayjs(), 'day')
  }

  /**
   * 判断是否为昨天
   */
  static isYesterday(date: string | Date | null | undefined): boolean {
    if (!date) return false
    return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
  }

  /**
   * 判断是否为本月
   */
  static isThisMonth(date: string | Date | null | undefined): boolean {
    if (!date) return false
    return dayjs(date).isSame(dayjs(), 'month')
  }

  /**
   * 判断是否为本年
   */
  static isThisYear(date: string | Date | null | undefined): boolean {
    if (!date) return false
    return dayjs(date).isSame(dayjs(), 'year')
  }

  /**
   * 获取月份的第一天
   */
  static getMonthStart(date: string | Date = new Date()): string {
    return dayjs(date).startOf('month').format('YYYY-MM-DD')
  }

  /**
   * 获取月份的最后一天
   */
  static getMonthEnd(date: string | Date = new Date()): string {
    return dayjs(date).endOf('month').format('YYYY-MM-DD')
  }

  /**
   * 添加时间
   */
  static addTime(
    date: string | Date,
    amount: number,
    unit: 'day' | 'month' | 'year' | 'hour' | 'minute' = 'day'
  ): string {
    return dayjs(date).add(amount, unit).format('YYYY-MM-DD HH:mm:ss')
  }

  /**
   * 减少时间
   */
  static subtractTime(
    date: string | Date,
    amount: number,
    unit: 'day' | 'month' | 'year' | 'hour' | 'minute' = 'day'
  ): string {
    return dayjs(date).subtract(amount, unit).format('YYYY-MM-DD HH:mm:ss')
  }

  /**
   * 验证日期格式是否有效
   */
  static isValidDate(date: string | Date | null | undefined): boolean {
    if (!date) return false
    return dayjs(date).isValid()
  }

  /**
   * 获取时间戳（毫秒）
   */
  static getTimestamp(date: string | Date = new Date()): number {
    return dayjs(date).valueOf()
  }

  /**
   * 从时间戳创建日期字符串
   */
  static fromTimestamp(timestamp: number, format = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(timestamp).format(format)
  }

  /**
   * 智能格式化日期
   * - 1分钟内：刚刚
   * - 1小时内：N分钟前
   * - 24小时内：N小时前
   * - 7天内：N天前
   * - 同一年：MM-DD HH:mm
   * - 不同年：YYYY-MM-DD
   */
  static smartFormat(date: string | Date | null | undefined): string {
    if (!date) return ''

    const now = dayjs()
    const target = dayjs(date)
    const diffMinutes = now.diff(target, 'minute')
    const diffHours = now.diff(target, 'hour')
    const diffDays = now.diff(target, 'day')

    if (diffMinutes < 1) {
      return '刚刚'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else if (target.isSame(now, 'year')) {
      return target.format('MM-DD HH:mm')
    } else {
      return target.format('YYYY-MM-DD')
    }
  }

  /**
   * 获取日期范围描述
   */
  static getDateRange(startDate: string | Date, endDate: string | Date): string {
    if (!startDate || !endDate) return ''
    return `${dayjs(startDate).format('YYYY-MM-DD')} 至 ${dayjs(endDate).format('YYYY-MM-DD')}`
  }

  /**
   * 获取年份的第一天
   */
  static getYearStart(date: string | Date = new Date()): string {
    return dayjs(date).startOf('year').format('YYYY-MM-DD')
  }

  /**
   * 获取年份的最后一天
   */
  static getYearEnd(date: string | Date = new Date()): string {
    return dayjs(date).endOf('year').format('YYYY-MM-DD')
  }
}

// 导出便捷函数
export const formatDate = DateUtils.formatDate
export const formatDateTime = DateUtils.formatDateTime
export const formatTime = DateUtils.formatTime
export const getRelativeTime = DateUtils.getRelativeTime
export const getDaysDiff = DateUtils.getDaysDiff
export const getHoursDiff = DateUtils.getHoursDiff
export const getMinutesDiff = DateUtils.getMinutesDiff
export const isToday = DateUtils.isToday
export const isYesterday = DateUtils.isYesterday
export const isThisMonth = DateUtils.isThisMonth
export const isThisYear = DateUtils.isThisYear
export const getMonthStart = DateUtils.getMonthStart
export const getMonthEnd = DateUtils.getMonthEnd
export const addTime = DateUtils.addTime
export const subtractTime = DateUtils.subtractTime
export const isValidDate = DateUtils.isValidDate
export const getTimestamp = DateUtils.getTimestamp
export const fromTimestamp = DateUtils.fromTimestamp
export const smartFormat = DateUtils.smartFormat
export const getDateRange = DateUtils.getDateRange
export const getYearStart = DateUtils.getYearStart
export const getYearEnd = DateUtils.getYearEnd

export default DateUtils
