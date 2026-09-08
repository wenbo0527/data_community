declare module '../../api/external/evaluation.js' {
  export const getEvaluationReports: (params?: any) => Promise<any>
  export const getEvaluationReportDetail: (id: string | number) => Promise<any>
  export const createEvaluationReport: (payload: any) => Promise<any>
  export const getRegisteredProducts: (params?: any) => Promise<any>
  export const publishReport: (id: string | number) => Promise<any>
  export const archiveReport: (id: string | number) => Promise<any>
}

declare module '../../api/external/evaluation' {
  export const getEvaluationReports: (params?: any) => Promise<any>
  export const getEvaluationReportDetail: (id: string | number) => Promise<any>
  export const createEvaluationReport: (payload: any) => Promise<any>
  export const getRegisteredProducts: (params?: any) => Promise<any>
  export const publishReport: (id: string | number) => Promise<any>
  export const archiveReport: (id: string | number) => Promise<any>
}