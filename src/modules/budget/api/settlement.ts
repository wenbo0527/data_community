export type Granularity = 'year'|'quarter'|'month'
export type TaskStatus = 'pending'|'running'|'succeeded'|'failed'|'canceled'

export interface SettlementSummary { budgetAmount: number; actualAmount: number; diffAmount: number; diffRate: number }
export interface SettlementTask { id: string; supplierIds: string[]; contractIds: string[]; granularity: Granularity; timeLabel: string; status: TaskStatus; progress: number; createdBy: string; createdAt: string; summary: SettlementSummary }

let tasks: SettlementTask[] = []

export async function getSettlementTasks(): Promise<{ list: SettlementTask[] }> {
  return { list: tasks.slice() }
}

export async function createSettlementTask(payload: Omit<SettlementTask, 'id'|'status'|'progress'|'createdAt'>): Promise<SettlementTask> {
  const id = `ST-${Date.now()}`
  const task: SettlementTask = { ...payload, id, status: 'running', progress: 0, createdAt: new Date().toISOString() }
  tasks.unshift(task)
  return task
}

export async function cancelSettlementTask(id: string): Promise<boolean> {
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return false
  tasks[idx].status = 'canceled'
  tasks[idx].progress = 0
  return true
}

export async function completeSettlementTask(id: string): Promise<boolean> {
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return false
  tasks[idx].status = 'succeeded'
  tasks[idx].progress = 100
  return true
}
