import axios from 'axios'

export interface TaskConfig { [key: string]: any }
export interface Task { id: string | number; taskName?: string; progress?: number; status?: string; createdAt?: string; config?: TaskConfig }

export async function getTasks(params?: any) {
  const res = await axios.get('/api/external-data-evaluation/tasks', { params })
  const data = (res as any)?.data
  return { data }
}

export async function getTaskDetail(id: number | string) {
  const res = await axios.get(`/api/external-data-evaluation/tasks/${id}`)
  return (res as any)
}

export async function createTask(payload: { taskName: string; config?: Partial<TaskConfig> }) {
  const res = await axios.post('/api/external-data-evaluation/tasks', payload)
  return (res as any)?.data
}

export async function updateTaskProgress(id: number | string, progress: number) {
  const res = await axios.put(`/api/external-data-evaluation/tasks/${id}/progress`, { progress })
  return (res as any)?.data
}
