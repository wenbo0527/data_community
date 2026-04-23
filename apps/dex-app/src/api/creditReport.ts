/**
 * 征信报告 API
 * 对接后端征信解析服务
 */
import axios from '../utils/axios'
import type { CreditReport, CreditNote } from '../mock/creditReport'

// Mock 开关（开发环境使用 Mock）
const USE_MOCK = true

// Mock API
import {
  fetchCreditReports as mockFetchReports,
  fetchCreditReportById as mockFetchById,
  fetchCreditNotes as mockFetchNotes,
  addCreditNote as mockAddNote,
  deleteCreditNote as mockDeleteNote
} from '../mock/creditReport'

// 获取用户的征信报告列表
export async function getCreditReports(userId: string): Promise<CreditReport[]> {
  if (USE_MOCK) {
    return mockFetchReports(userId)
  }
  const response = await axios.get(`/api/credit/reports/${userId}`)
  return response.data
}

// 获取单个征信报告详情
export async function getCreditReportDetail(reportId: string): Promise<CreditReport> {
  if (USE_MOCK) {
    return mockFetchById(reportId) as Promise<CreditReport>
  }
  const response = await axios.get(`/api/credit/report/${reportId}`)
  return response.data
}

// 获取报告备注列表
export async function getCreditNotes(reportId: string): Promise<CreditNote[]> {
  if (USE_MOCK) {
    return mockFetchNotes(reportId)
  }
  const response = await axios.get(`/api/credit/notes/${reportId}`)
  return response.data
}

// 添加备注
export async function addCreditNote(reportId: string, content: string): Promise<CreditNote> {
  if (USE_MOCK) {
    return mockAddNote(reportId, content)
  }
  const response = await axios.post('/api/credit/notes', { reportId, content })
  return response.data
}

// 删除备注
export async function deleteCreditNote(noteId: string): Promise<boolean> {
  if (USE_MOCK) {
    return mockDeleteNote(noteId)
  }
  const response = await axios.delete(`/api/credit/notes/${noteId}`)
  return response.data
}
