/**
 * 日期工具(简化版)
 *
 * 提供权限页面使用的日期格式化、相对时间、范围等
 */

const DateUtils = {
  /** 格式化日期 */
  format(date: string | Date | number, pattern: string = 'YYYY-MM-DD HH:mm'): string {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return pattern
      .replace('YYYY', String(d.getFullYear()))
      .replace('MM', pad(d.getMonth() + 1))
      .replace('DD', pad(d.getDate()))
      .replace('HH', pad(d.getHours()))
      .replace('mm', pad(d.getMinutes()))
      .replace('ss', pad(d.getSeconds()))
  },

  /** 格式化日期时间(带秒) */
  formatDateTime(date: string | Date | number, pattern: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return this.format(date, pattern)
  },

  /** 相对时间 */
  fromNow(date: string | Date | number): string {
    const d = new Date(date).getTime()
    if (isNaN(d)) return ''
    const diff = Date.now() - d
    const abs = Math.abs(diff)
    const sec = Math.floor(abs / 1000)
    if (sec < 60) return diff >= 0 ? `${sec} 秒前` : `${sec} 秒后`
    const min = Math.floor(sec / 60)
    if (min < 60) return diff >= 0 ? `${min} 分钟前` : `${min} 分钟后`
    const hour = Math.floor(min / 60)
    if (hour < 24) return diff >= 0 ? `${hour} 小时前` : `${hour} 小时后`
    const day = Math.floor(hour / 24)
    if (day < 30) return diff >= 0 ? `${day} 天前` : `${day} 天后`
    const month = Math.floor(day / 30)
    if (month < 12) return diff >= 0 ? `${month} 个月前` : `${month} 个月后`
    const year = Math.floor(day / 365)
    return diff >= 0 ? `${year} 年前` : `${year} 年后`
  },

  /** 范围转数组 */
  range(start: Date | string, end: Date | string, step: 'day' | 'hour' = 'day'): Date[] {
    const result: Date[] = []
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    const inc = step === 'day' ? 86400000 : 3600000
    for (let t = s; t <= e; t += inc) {
      result.push(new Date(t))
    }
    return result
  },

  /** 加天数 */
  addDays(date: string | Date | number, days: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  },

  /** 加月数 */
  addMonths(date: string | Date | number, months: number): Date {
    const d = new Date(date)
    d.setMonth(d.getMonth() + months)
    return d
  },

  /** 相差天数 */
  diffDays(a: string | Date, b: string | Date): number {
    return Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 86400000)
  },

  /** 今天 */
  today(): string {
    return new Date().toISOString().slice(0, 10)
  },

  /** 是否过期 */
  isExpired(date: string | Date): boolean {
    return new Date(date).getTime() < Date.now()
  }
}

export default DateUtils
export { DateUtils }