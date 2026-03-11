export type Granularity = 'year'|'quarter'|'month'
export type TaskStatus = 'pending'|'running'|'succeeded'|'failed'|'canceled'

export interface SettlementSummary { budgetAmount: number; actualAmount: number; diffAmount: number; diffRate: number }
export interface SettlementTask { id: string; supplierIds: string[]; contractIds: string[]; granularity: Granularity; timeLabel: string; status: TaskStatus; progress: number; createdBy: string; createdAt: string; summary: SettlementSummary; stage?: 'costing'|'reconcile'|'writeoff'; taskName?: string; archived?: boolean }

const tasks: SettlementTask[] = []

export async function getSettlementTasks(): Promise<{ list: SettlementTask[] }> {
  return { list: tasks.slice() }
}

export async function createSettlementTask(payload: Omit<SettlementTask, 'id'|'status'|'progress'|'createdAt'>): Promise<SettlementTask> {
  const id = `ST-${Date.now()}`
  const task: SettlementTask = { ...payload, id, status: 'pending', progress: 0, createdAt: new Date().toISOString() }
  tasks.unshift(task)
  return task
}

export async function cancelSettlementTask(id: string): Promise<boolean> {
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return false
  const t = tasks[idx]!
  t.status = 'canceled'
  t.progress = 0
  return true
}

export async function completeSettlementTask(id: string): Promise<boolean> {
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return false
  const t = tasks[idx]!
  t.status = 'succeeded'
  t.progress = 100
  return true
}

export async function updateSettlementTask(id: string, patch: Partial<SettlementTask>): Promise<SettlementTask | null> {
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return null
  const current = tasks[idx]
  const next: SettlementTask = { ...current }
  Object.entries(patch).forEach(([key, value]) => {
    if (value !== undefined) (next as any)[key] = value
  })
  tasks[idx] = next
  return tasks[idx]!
}

export async function deleteSettlementTask(id: string): Promise<boolean> {
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return false
  tasks.splice(idx, 1)
  return true
}
