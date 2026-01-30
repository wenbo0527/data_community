export function log(event: string, data?: any) {
  try {
    const entry = { t: new Date().toISOString(), event, data }
    const arr = JSON.parse(localStorage.getItem('appLogs') || '[]')
    arr.unshift(entry)
    arr.splice(0, 1000)
    localStorage.setItem('appLogs', JSON.stringify(arr))
    console.info('[LOG]', event, data)
  } catch {}
  try {
    const entry = { t: new Date().toISOString(), event, data }
    if (shouldSendRemote()) {
      fetch('/api/append-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: JSON.stringify(entry) + '\n' })
      }).catch(() => { /* swallow */ })
    }
  } catch {}
}

let lastHealthCheck = 0
let logServerReady = false
function shouldSendRemote() {
  const now = Date.now()
  if (now - lastHealthCheck > 15000) {
    lastHealthCheck = now
    try {
      fetch('/api/health', { method: 'GET' })
        .then(res => { logServerReady = res.ok })
        .catch(() => { logServerReady = false })
    } catch { logServerReady = false }
  }
  return logServerReady
}

export function getLogs(): Array<{ t: string; event: string; data?: any }> {
  try { return JSON.parse(localStorage.getItem('appLogs') || '[]') } catch { return [] }
}

export function clearLogs() {
  try { localStorage.removeItem('appLogs') } catch {}
}
