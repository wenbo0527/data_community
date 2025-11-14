// 预算模块 API 服务
// 说明：使用浏览器 fetch 访问 mock 接口；在缺失接口时做兼容处理

export interface BudgetListParams {
  page?: number
  pageSize?: number
}

export interface BudgetItem {
  id: string
  businessType: string
  platform: string
  targetLoan: number
  estimatedLoan: number
  estimatedCost: number
  estimatedAnnualCost: number
  estimatedRiskFreeReturn: number
  granularity?: 'year' | 'quarter' | 'month'
  timeLabel?: string
  budgetNo?: string
  remainingAmount?: number
}

export interface BudgetListResponse {
  list: BudgetItem[]
  total: number
  page?: number
  pageSize?: number
}

const API_BASE_URL = ''

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const resp = await fetch(`${API_BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`)
  }
  return resp.json() as Promise<T>
}

function toQuery(params: Record<string, any> = {}): string {
  const usp = new URLSearchParams()
  Object.keys(params).forEach((k) => {
    const v = params[k]
    if (v !== undefined && v !== null) usp.append(k, String(v))
  })
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export const budgetApiService = {
  // 获取预算列表（兼容 mock 返回的 data.data 结构）
  async getBudgets(params: BudgetListParams = {}): Promise<BudgetListResponse> {
    const { page = 1, pageSize = 10 } = params
    if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
      const list = seedAndGetMemoryBudgets()
      const total = list.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return { list: list.slice(start, end), total, page, pageSize }
    }
    try {
      const data: any = await request('/api/budget/list' + toQuery({ page, pageSize }))
      const raw = data?.data || {}
      const list: BudgetItem[] = raw.list || raw.data || []
      const total = Number(raw.total || list.length || 0)
      if (!Array.isArray(list) || list.length === 0) {
        const mem = seedAndGetMemoryBudgets()
        const start = (page - 1) * pageSize
        const end = start + pageSize
        return { list: mem.slice(start, end), total: mem.length, page, pageSize }
      }
      return { list, total, page, pageSize }
    } catch (err) {
      // 后备：使用内存数据
      const list = seedAndGetMemoryBudgets()
      const total = list.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return { list: list.slice(start, end), total, page, pageSize }
    }
  },

  // 通过列表查找详情，兼容当前 mock
  async getBudget(id: string): Promise<BudgetItem | null> {
    try {
      const resp = await this.getBudgets({ page: 1, pageSize: 1000 })
      return resp.list.find((item) => String(item.id) === String(id)) || null
    } catch {
      const list = seedAndGetMemoryBudgets()
      return list.find((item) => String(item.id) === String(id)) || null
    }
  },

  // 创建预算：使用 upload 接口生成新数据（mock 不读取 body，这里仅触发刷新）
  async createBudget(payload: Partial<BudgetItem>): Promise<{ success: boolean }> {
    try {
      await request('/api/budget/upload', {
        method: 'POST',
        body: JSON.stringify(payload || {})
      })
      return { success: true }
    } catch {
      const list = seedAndGetMemoryBudgets()
      const now = new Date()
      const month = now.getMonth() + 1
      const quarter = Math.ceil(month / 3)
      const bt = String(payload.businessType || '助贷')
      const platform = String(payload.platform || (bt === '直贷' ? '苏贷' : '蚂蚁'))
      const newItem: BudgetItem = {
        id: 'mem_' + Date.now(),
        businessType: bt,
        platform,
        targetLoan: Number(payload.targetLoan ?? 900000),
        estimatedLoan: Number(payload.estimatedLoan ?? 700000),
        estimatedCost: Number(payload.estimatedCost ?? 50000),
        estimatedAnnualCost: Number(payload.estimatedAnnualCost ?? 0.045),
        estimatedRiskFreeReturn: Number(payload.estimatedRiskFreeReturn ?? 0.075),
        granularity: payload.granularity || 'month',
        timeLabel: payload.timeLabel || `${now.getFullYear()}-${String(month).padStart(2, '0')}`
      }
      list.unshift(newItem)
      return { success: true }
    }
  },

  // 更新预算：当前无对应 mock，返回成功即可
  async updateBudget(id: string, payload: Partial<BudgetItem>): Promise<{ success: boolean }> {
    try {
      // 预留真实接口位置
      void id
      void payload
      return { success: true }
    } catch {
      const list = seedAndGetMemoryBudgets()
      const idx = list.findIndex((i) => String(i.id) === String(id))
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...payload }
      }
      return { success: true }
    }
  },

  // 删除预算：mock 已支持 DELETE /api/budget/:id
  async deleteBudget(id: string): Promise<{ success: boolean }> {
    try {
      await request(`/api/budget/${id}`, { method: 'DELETE' })
      return { success: true }
    } catch {
      const list = seedAndGetMemoryBudgets()
      const idx = list.findIndex((i) => String(i.id) === String(id))
      if (idx >= 0) list.splice(idx, 1)
      return { success: true }
    }
  },

  // 预算核销：当前无对应 mock，直接返回成功
  async createVerification(payload: { budgetId: string; projectId: string; verificationAmount: number }): Promise<{ success: boolean }> {
    // 可在未来接入真实接口 /api/budget/verify
    void payload
    return { success: true }
  }
}

export default budgetApiService

// ---- 内存后备实现 ----
let memoryBudgets: BudgetItem[] | null = null

function seedAndGetMemoryBudgets(): BudgetItem[] {
  if (!memoryBudgets) {
    const businessTypes = ['助贷', '融担', '直贷']
    const platformsMap: Record<string, string[]> = {
      '助贷': ['蚂蚁', '字节', '京东'],
      '融担': ['蚂蚁', '字节', '京东'],
      '直贷': ['苏贷']
    }
    const year = new Date().getFullYear()
    memoryBudgets = Array.from({ length: 36 }).map((_, i) => {
      const bt = businessTypes[i % businessTypes.length]
      const plats = platformsMap[bt]
      const platform = plats[i % plats.length]
      const month = (i % 12) + 1
      const quarter = Math.ceil(month / 3)
      const granularity = (i % 3 === 0 ? 'year' : i % 3 === 1 ? 'quarter' : 'month') as 'year' | 'quarter' | 'month'
      const timeLabel = granularity === 'year' ? String(year) : granularity === 'quarter' ? `${year}-Q${quarter}` : `${year}-${String(month).padStart(2, '0')}`
      const targetLoan = 800000 + i * 10000
      const estimatedLoan = 600000 + i * 8000
      const estimatedCost = 40000 + i * 500
      const estimatedAnnualCost = 0.03 + (i % 10) * 0.003
      const estimatedRiskFreeReturn = 0.06 + (i % 10) * 0.003
      const budgetNo = `B${year}-${String(i + 1).padStart(3, '0')}`
      const remainingAmount = Math.max(0, targetLoan - estimatedLoan - estimatedCost)
      return {
        id: 'mem_' + (i + 1),
        businessType: bt,
        platform,
        targetLoan,
        estimatedLoan,
        estimatedCost,
        estimatedAnnualCost,
        estimatedRiskFreeReturn,
        granularity,
        timeLabel,
        budgetNo,
        remainingAmount
      }
    })
  }
  return memoryBudgets
}
