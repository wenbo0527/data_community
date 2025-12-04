import { defineStore } from 'pinia'
import { getEvaluationReports, getEvaluationReportDetail, createEvaluationReport, getRegisteredProducts, publishReport, archiveReport } from '@/modules/external-data/api/evaluation'
import { getTasks, getTaskDetail, createTask, updateTaskProgress } from '@/modules/external-data/api/task'
import type { Task, TaskConfig } from '@/modules/external-data/api/task'
import { getBurndown, getWarnings } from '@/modules/external-data/api/monitor'

export interface Pagination { page: number; pageSize: number; total: number }
export interface EvaluationReport { id: string | number; supplier?: string; reportType?: string; status?: string; createdAt?: string; score?: number; title?: string }
export interface EvaluationDetail { id: string | number; title?: string; status?: string; score?: number; content?: unknown; fields?: Record<string, unknown> }
export interface ProductSummary { id: string | number; name: string; supplier?: string; status?: string; interfaces?: number }
export interface BurndownPoint { granularity?: 'month' | 'quarter'; month?: string; period?: string; budget?: number; actual?: number; initialBudget?: number; cumulativeBudget?: number; cumulativeActual?: number }
export interface WarningItem { id: string | number; level: 'info' | 'warning' | 'critical'; message: string; createdAt?: string; tag?: string; businessType?: string; platform?: string; year?: string | number; targetLoan?: number; estimatedLoan?: number; actualLoan?: number; estimatedCost?: number; actualCost?: number; estimatedAnnualCost?: number; actualAnnualCost?: number; estimatedRiskFreeReturn?: number; actualRiskFreeReturn?: number; externalDataCost?: number; budgetStatus?: string }

export const useExternalDataStore = defineStore('externalData', {
  state: () => ({
    evaluationList: [] as EvaluationReport[],
    evaluationLoading: false as boolean,
    evaluationPagination: { page: 1, pageSize: 10, total: 0 } as Pagination,
    evaluationDetail: null as EvaluationDetail | null,
    products: [] as ProductSummary[],
    productsLoading: false as boolean,
    burndown: [] as BurndownPoint[],
    burndownLoading: false as boolean,
    warnings: [] as WarningItem[],
    warningsLoading: false as boolean,
    tasks: [] as Task[],
    tasksLoading: false as boolean,
    taskDetail: null as Task | null,
    creatingTask: false as boolean,
    error: null as string | null,
    targetLoanOptions: [] as number[],
    lifecycleStages: [] as any[],
    lifecycle: {} as any,
    services: [] as any[],
  }),

  actions: {
    async fetchEvaluationList(params?: { page?: number; pageSize?: number; reportType?: string; keyword?: string; status?: string; startDate?: string; endDate?: string }) {
      this.evaluationLoading = true
      this.error = null
      try {
        const query = { page: params?.page ?? this.evaluationPagination.page, pageSize: params?.pageSize ?? this.evaluationPagination.pageSize, reportType: params?.reportType, keyword: params?.keyword, status: params?.status, startDate: params?.startDate, endDate: params?.endDate }
        const res = await getEvaluationReports(query)
        const list: EvaluationReport[] = (res?.list ?? []) as EvaluationReport[]
        const total: number = Number(res?.total ?? list.length)
        this.evaluationList = list
        this.evaluationPagination = { page: query.page, pageSize: query.pageSize, total }
      } catch (e: any) { this.error = e?.message ?? '获取评估列表失败' } finally { this.evaluationLoading = false }
    },
    async fetchEvaluationDetail(id: string | number) {
      this.evaluationLoading = true
      this.error = null
      try { const res = await getEvaluationReportDetail(id); this.evaluationDetail = (res ?? null) as EvaluationDetail | null } catch (e: any) { this.error = e?.message ?? '获取评估详情失败' } finally { this.evaluationLoading = false }
    },
    async createEvaluation(payload: Record<string, unknown>) { this.evaluationLoading = true; this.error = null; try { await createEvaluationReport(payload); await this.fetchEvaluationList({ page: 1 }); return true } catch (e: any) { this.error = e?.message ?? '创建评估报告失败'; return false } finally { this.evaluationLoading = false } },
    async publishEvaluation(id: string | number) { this.evaluationLoading = true; this.error = null; try { await publishReport(id); await this.fetchEvaluationList(); return true } catch (e: any) { this.error = e?.message ?? '发布评估报告失败'; return false } finally { this.evaluationLoading = false } },
    async archiveEvaluation(id: string | number) { this.evaluationLoading = true; this.error = null; try { await archiveReport(id); await this.fetchEvaluationList(); return true } catch (e: any) { this.error = e?.message ?? '归档评估报告失败'; return false } finally { this.evaluationLoading = false } },
    async fetchProducts() { this.productsLoading = true; this.error = null; try { const res = await getRegisteredProducts(); const payload = res?.data; const list = Array.isArray(payload) ? payload : (payload?.data ?? []); this.products = (list ?? []) as ProductSummary[]; if (!Array.isArray(this.products) || this.products.length === 0) { this.products = [ { id: 1, name: '产品A', provider: '数据提供商A', category: '风控数据', status: 'active', registrationDate: '2024-01-15', lastUpdateDate: '2024-11-30', description: '提供用户信用评估相关数据' } as any, { id: 2, name: '产品B', provider: '数据提供商B', category: '营销数据', status: 'active', registrationDate: '2024-02-20', lastUpdateDate: '2024-12-01', description: '提供用户行为分析数据' } as any, { id: 3, name: '产品C', provider: '数据提供商C', category: '反欺诈数据', status: 'inactive', registrationDate: '2024-03-10', lastUpdateDate: '2024-10-15', description: '提供反欺诈检测数据' } as any, { id: 4, name: '产品D', provider: '数据提供商D', category: '征信数据', status: 'active', registrationDate: '2024-04-05', lastUpdateDate: '2024-11-28', description: '提供征信相关数据服务' } as any ] as ProductSummary[] } } catch (e: any) { this.error = e?.message ?? '获取产品列表失败' } finally { this.productsLoading = false } },
    async fetchBurndown(params?: { range?: 'month' | 'quarter'; productId?: string | number; businessType?: string; platform?: string; year?: string; targetLoan?: number }) { this.burndownLoading = true; this.error = null; try { const list = await getBurndown(params); this.burndown = (list ?? []) as BurndownPoint[] } catch (e: any) { this.error = e?.message ?? '获取燃尽数据失败' } finally { this.burndownLoading = false } },
    async fetchWarnings(params?: { level?: string; productId?: string | number; businessType?: string; platform?: string; year?: string; targetLoan?: number }) { this.warningsLoading = true; this.error = null; try { const list = await getWarnings(params); this.warnings = (list ?? []) as WarningItem[] } catch (e: any) { this.error = e?.message ?? '获取预警数据失败' } finally { this.warningsLoading = false } },
    async fetchTasks() { this.tasksLoading = true; this.error = null; try { const res = await getTasks({}); this.tasks = (res?.data?.list ?? []) as Task[] } catch (e: any) { this.error = e?.message ?? '获取任务列表失败' } finally { this.tasksLoading = false } },
    async fetchTaskDetail(id: string | number) { this.tasksLoading = true; this.error = null; try { const res = await getTaskDetail(Number(id)); this.taskDetail = (res?.data ?? null) as Task | null } catch (e: any) { this.error = e?.message ?? '获取任务详情失败' } finally { this.tasksLoading = false } },
    async createTaskAction(payload: { taskName: string; config?: Partial<TaskConfig> }) { this.creatingTask = true; this.error = null; try { await createTask(payload); await this.fetchTasks(); return true } catch (e: any) { this.error = e?.message ?? '创建任务失败'; return false } finally { this.creatingTask = false } },
    async updateTaskProgressAction(id: string | number, progress: number) { this.tasksLoading = true; this.error = null; try { await updateTaskProgress(Number(id), progress); await this.fetchTaskDetail(Number(id)); return true } catch (e: any) { this.error = e?.message ?? '更新任务进度失败'; return false } finally { this.tasksLoading = false } },
    async fetchTargetLoanOptions() { const set = new Set<number>(); (this.burndown || []).forEach((p: any) => { if (typeof p.targetLoan === 'number') set.add(p.targetLoan) }); (this.warnings || []).forEach((w: any) => { if (typeof w.targetLoan === 'number') set.add(w.targetLoan) }); this.targetLoanOptions = Array.from(set).sort((a, b) => a - b) },
    async fetchLifecycleData(_params?: any) { this.error = null; try { const now = new Date(); const fmt = (d: Date) => d.toISOString().slice(0, 10); this.lifecycleStages = [ { stage: 'registration', status: 'completed', startDate: fmt(new Date(now.getFullYear(), 0, 2)), endDate: fmt(new Date(now.getFullYear(), 0, 5)), description: '完成注册与资产归档' }, { stage: 'evaluation', status: 'completed', startDate: fmt(new Date(now.getFullYear(), 0, 6)), endDate: fmt(new Date(now.getFullYear(), 0, 18)), description: '完成质量与性能评估' }, { stage: 'approval', status: 'completed', startDate: fmt(new Date(now.getFullYear(), 0, 19)), endDate: fmt(new Date(now.getFullYear(), 0, 22)), description: '审批通过' }, { stage: 'deployment', status: 'in_progress', startDate: fmt(new Date(now.getFullYear(), 0, 23)), description: '上线发布中' }, { stage: 'operation', status: 'pending', description: '运维监控准备' } ]; this.lifecycle = { currentStage: 'deployment', currentStatus: 'in_progress', stages: this.lifecycleStages } } catch (e: any) { this.error = e?.message ?? '获取生命周期数据失败' } },
    async fetchServices() { this.error = null; try { const base = (this.products || []).map((p: any, idx: number) => ({ id: String(p.id ?? idx + 1), name: p.name || `外数服务-${idx + 1}`, supplier: p.supplier || p.provider || '—', serviceType: ['API','文件','数据库','平台工具'][idx % 4], billingMode: p.billingMode || 'per_call', unitPrice: typeof p.unitPrice === 'number' ? p.unitPrice : (idx + 1) * 1.5, status: p.status === 'online' ? 'online' : p.status === 'maintaining' ? 'maintaining' : 'pending' })); this.services = base } catch (e: any) { this.error = e?.message ?? '获取服务列表失败' } },
  },
})
