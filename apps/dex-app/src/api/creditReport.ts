/**
 * 征信报告 API
 * TASK-20260714-9EA2D40C: 清理残留 axios（dead code）· 仅保留 mock 路径
 */
import type { CreditReport, CreditNote } from '../mock/creditReport'
import {
  fetchCreditReports as mockFetchReports,
  fetchCreditReportById as mockFetchById,
  fetchCreditNotes as mockFetchNotes,
  addCreditNote as mockAddNote,
  deleteCreditNote as mockDeleteNote
} from '../mock/creditReport'

// 获取用户的征信报告列表
export async function getCreditReports(userId: string): Promise<CreditReport[]> {
  return mockFetchReports(userId)
}

// 获取单个征信报告详情
export async function getCreditReportDetail(reportId: string): Promise<CreditReport> {
  return mockFetchById(reportId) as Promise<CreditReport>
}

// 获取报告备注列表
export async function getCreditNotes(reportId: string): Promise<CreditNote[]> {
  return mockFetchNotes(reportId)
}

// 添加备注
export async function addCreditNote(reportId: string, content: string): Promise<CreditNote> {
  return mockAddNote(reportId, content)
}

// 删除备注
export async function deleteCreditNote(noteId: string): Promise<boolean> {
  return mockDeleteNote(noteId)
}
