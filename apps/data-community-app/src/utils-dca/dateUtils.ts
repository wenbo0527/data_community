import dayjs from 'dayjs'

export const DateUtils = {
  formatDate(date: string | Date | null | undefined, format = 'YYYY-MM-DD'): string {
    if (!date) return '-'
    return dayjs(date).format(format)
  },

  formatDateTime(date: string | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string {
    if (!date) return '-'
    return dayjs(date).format(format)
  },

  smartFormat(date: string | Date | null | undefined): string {
    if (!date) return '-'
    const d = dayjs(date)
    const now = dayjs()
    const diff = now.diff(d, 'minute')

    if (diff < 1) return '刚刚'
    if (diff < 60) return `${diff}分钟前`
    if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
    if (diff < 43200) return `${Math.floor(diff / 1440)}天前`
    return d.format('YYYY-MM-DD')
  },

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`
  }
}

export default DateUtils
