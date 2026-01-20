import type { BlacklistItem, Channel } from '@/types'
import mock from '@/mock/touch'

export async function getChannels(): Promise<Channel[]> {
  return mock.channels.map(c => ({ id: c.id, name: c.name, status: c.status, quota: c.quota, used: c.used }))
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
