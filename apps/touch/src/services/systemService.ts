import type { GlobalConfig, DictionaryItem } from '@/types'
import mock from '@/mock/touch'

export async function getGlobalConfig(): Promise<GlobalConfig> {
  return {
    channels: { sms: { quota: 10000 }, email: { quota: 5000 } },
    signatures: ['【XX银行】', '【XX商城】'],
    approval: { enabled: true, levels: 2 }
  }
}
export async function getDictionaries(): Promise<DictionaryItem[]> {
  return mock.dictionaries
}
export async function updateDictionary(item: Partial<DictionaryItem>): Promise<boolean> {
  return true
}
