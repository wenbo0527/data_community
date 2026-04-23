declare module '../../api/external/evaluation' {
  // 对应评估报告的基础类型
  export interface EvaluationReport {
    id: string | number
    title?: string
    supplier?: string
    reportType?: string
    status?: string
    createdAt?: string
    score?: number
  }

  // 评估报告详情类型
  export interface EvaluationDetail {
    id: string | number
    title?: string
    status?: string
    score?: number
    content?: unknown
    fields?: Record<string, unknown>
  }

  // 已注册产品摘要类型
  export interface ProductSummary {
    id: string | number
    name: string
    supplier?: string
    status?: string
    interfaces?: number
  }

  // 列表查询参数
  export interface EvaluationQuery {
    page?: number
    pageSize?: number
    reportType?: string
    keyword?: string
    status?: string
    startDate?: string
    endDate?: string
  }

  // JS 模块导出的函数声明
  export function getEvaluationReports(
    query?: EvaluationQuery
  ): Promise<{ list: EvaluationReport[]; total: number }>

  export function getEvaluationReportDetail(
    id: string | number
  ): Promise<EvaluationDetail>

  export function createEvaluationReport(
    payload: Record<string, unknown>
  ): Promise<void | { success?: boolean }>

  export function getRegisteredProducts(): Promise<ProductSummary[]>

  export function publishReport(
    id: string | number
  ): Promise<void | { success?: boolean }>

  export function archiveReport(
    id: string | number
  ): Promise<void | { success?: boolean }>
}