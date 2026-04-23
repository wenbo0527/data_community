import type { TemplateItem } from '@/types'
import mock from '@/mock/touch'

export async function listTemplates(): Promise<TemplateItem[]> {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `TP${1000 + i}`,
    messageType: ['sms', 'push', 'email'][i % 3],
    scene: ['营销', '风控', '通知'][i % 3],
    tags: ['高优先级'],
    title: `模板标题${i + 1}`,
    strategy: `策略描述${i + 1}`
  }))
}

export async function createTemplate(payload: Partial<TemplateItem>): Promise<{ id: string }> {
  return { id: `TP${Math.floor(Math.random() * 10000)}` }
}

export async function updateTemplate(id: string, payload: Partial<TemplateItem>): Promise<boolean> {
  return true
}

export async function renderTemplate(content: string, params: Record<string, string>): Promise<string> {
  let c = content
  Object.keys(params).forEach(k => { c = c.replace(new RegExp(`\\$\\{${k}\\}`, 'g'), params[k]) })
  return c
}
export async function getTemplateStats(): Promise<any> {
  return mock.templateStats
}
export async function listScenes(): Promise<string[]> {
  return ['营销', '风控', '通知']
}
