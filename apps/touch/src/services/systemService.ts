import type { GlobalConfig } from '@/types'

export async function getGlobalConfig(): Promise<GlobalConfig> {
  return {
    channels: { sms: { quota: 10000 }, email: { quota: 5000 } },
    signatures: ['【XX银行】', '【XX商城】'],
    approval: { enabled: true, levels: 2 }
  }
}
