import type { TaskBatch } from '@/types'

export async function listBatches(): Promise<TaskBatch[]> {
  return [
    { id: 1, batchName: '营销活动短信批次', templateId: 'TP1001', recipientCount: 1250, creator: '张三', createTime: '2024-01-15 10:30:45', status: 'completed' }
  ]
}

export async function createManualSms(payload: Partial<TaskBatch>): Promise<{ id: number }> {
  return { id: Math.floor(Math.random() * 10000) }
}

export async function copyBatch(id: number): Promise<{ id: number }> {
  return { id: id + 1 }
}

export async function scheduleBatch(id: number, sendTime: string): Promise<boolean> {
  return true
}
