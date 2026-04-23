// Date utility functions
class DateUtilsClass {
  formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString().split('T')[0]
  }

  parseDate(dateStr: string): Date {
    return new Date(dateStr)
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
}

export default new DateUtilsClass()
