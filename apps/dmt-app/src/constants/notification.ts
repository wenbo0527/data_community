// Notification constants
export const NOTICE_TYPE_OPTIONS = [
  { value: 'system', label: '系统通知' },
  { value: 'task', label: '任务通知' },
  { value: 'alert', label: '告警通知' }
]

export const NOTICE_TYPE_MAP = {
  system: '系统通知',
  task: '任务通知',
  alert: '告警通知'
}

export const getNoticeTypeLabel = (type: string) => NOTICE_TYPE_MAP[type] || type
export const getNoticeTypeColor = (type: string) => {
  const colors: Record<string, string> = { system: 'blue', task: 'green', alert: 'red' }
  return colors[type] || 'gray'
}
