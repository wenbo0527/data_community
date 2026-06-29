const pad2 = (n: number) => String(n).padStart(2, '0')

const toDate = (input: any) => {
  if (!input) return null
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export const formatDate = (input: any) => {
  const d = toDate(input)
  if (!d) return '—'
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export const formatDateTime = (input: any) => {
  const d = toDate(input)
  if (!d) return '—'
  return `${formatDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

export const smartFormat = (input: any) => {
  const d = toDate(input)
  if (!d) return '—'
  const diff = Date.now() - d.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
  return formatDateTime(d)
}

export default { formatDate, formatDateTime, smartFormat }
