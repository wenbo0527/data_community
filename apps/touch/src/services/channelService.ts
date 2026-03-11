import type { BlacklistItem, Channel, RateLimit, Alert, Vendor, GlobalRateLimitItem } from '@/types'
import mock from '@/mock/touch'

export async function getChannels(): Promise<Channel[]> {
  const src = mock.channels as any[]
  return src.map((c: any) => ({ id: c.id, name: c.name, status: c.status, quota: c.quota, used: c.used }))
}

export async function getBlacklist(): Promise<BlacklistItem[]> {
  return mock.blacklist
}

export async function unban(record: BlacklistItem): Promise<boolean> {
  return true
}

export async function importBlacklist(file: File): Promise<boolean> {
  return true
}
export async function getRateLimit(): Promise<RateLimit> {
  return mock.rateLimit
}
export async function listGlobalRateLimits(params?: Partial<GlobalRateLimitItem>): Promise<GlobalRateLimitItem[]> {
  const src = (mock as any).globalRateLimits as GlobalRateLimitItem[]
  if (!params) return src
  return src.filter(item => {
    const channelOk = !params.channel || item.channel === params.channel
    const sceneOk = !params.scene || item.scene === params.scene
    const lineOk = !params.line || item.line === params.line
    const statusOk = !params.status || item.status === params.status
    return channelOk && sceneOk && lineOk && statusOk
  })
}
export async function getAlerts(): Promise<Alert[]> {
  return mock.alerts
}
export async function getVendors(): Promise<{ ai: Vendor[], sms: Vendor[] }> {
  return mock.vendors
}
export async function listManualCallTemplates(): Promise<any[]> {
  return mock.manualCallTemplates
}
export async function listSmsTemplates(): Promise<any[]> {
  return mock.smsTemplates
}
export async function listAiCallTemplates(): Promise<any[]> {
  return mock.aiCallTemplates
}
