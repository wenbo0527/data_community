import { defineStore } from 'pinia'
import type { ErrorType } from '@/types/api'
import {
  getSignReports,
  getSignReportById,
  createSignReport as apiCreateSignReport,
  updateSignReport as apiUpdateSignReport,
  deleteSignReport as apiDeleteSignReport,
  searchSignReports as apiSearchSignReports
} from '../api/signReport'
import type { SignReport, SignReportPartnerOrg } from '../api/signReport'

export type { SignReport, SignReportPartnerOrg }

export const useSignReportStore = defineStore('signReport', {
  state: () => ({
    list: [] as SignReport[],
    total: 0,
    loading: false,
    error: null as ErrorType | null,
    detail: null as SignReport | null
  }),

  getters: {
    // PRD R10: 供合同管理搜索选择签报使用（label 含签报号与标题，value 为 id）
    reportOptions: (state) =>
      state.list.map((r) => ({
        label: `${r.reportNo} - ${r.title}`,
        value: r.id,
        reportNo: r.reportNo,
        title: r.title,
        totalAmount: r.totalAmount,
        partnerOrgs: r.partnerOrgs
      }))
  },

  actions: {
    // PRD V2: 签报总金额 ≥ SUM(签报/成交通知书金额)
    validateV2(data: { totalAmount: number; partnerOrgs: SignReportPartnerOrg[] }): { valid: boolean; diff?: number } {
      const total = Number(data.totalAmount || 0)
      const sum = (data.partnerOrgs || []).reduce((acc, p) => acc + (Number(p.noticeAmount) || 0), 0)
      if (total < sum) {
        return { valid: false, diff: sum - total }
      }
      return { valid: true }
    },

    async fetchList() {
      this.loading = true
      try {
        const list = await getSignReports()
        this.list = list
        this.total = list.length
        this.error = null
        return true
      } catch (e: any) {
        this.error = { code: 'SIGN_REPORT_FETCH_ERROR', message: e?.message || '获取签报列表失败' }
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchDetail(id: string) {
      this.loading = true
      try {
        const detail = await getSignReportById(id)
        this.detail = detail
        this.error = null
        return !!detail
      } catch (e: any) {
        this.error = { code: 'SIGN_REPORT_DETAIL_ERROR', message: e?.message || '获取签报详情失败' }
        return false
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<SignReport, 'id' | 'createdAt'>) {
      // PRD V2: 签报总金额 ≥ SUM(签报/成交通知书金额)
      const v2 = this.validateV2({ totalAmount: payload.totalAmount, partnerOrgs: payload.partnerOrgs })
      if (!v2.valid) {
        this.error = { code: 'SIGN_REPORT_V2_ERROR', message: `签报总金额不足，差额${v2.diff!.toLocaleString('zh-CN')}元` }
        return false
      }
      this.loading = true
      try {
        const item = await apiCreateSignReport(payload)
        this.list = [item, ...this.list]
        this.total = this.list.length
        this.error = null
        return true
      } catch (e: any) {
        this.error = { code: 'SIGN_REPORT_CREATE_ERROR', message: e?.message || '新增签报失败' }
        return false
      } finally {
        this.loading = false
      }
    },

    async update(id: string, data: Partial<SignReport>) {
      // PRD V2: 签报总金额 ≥ SUM(签报/成交通知书金额)（仅当包含金额数据时校验）
      if (data.totalAmount !== undefined && data.partnerOrgs !== undefined) {
        const v2 = this.validateV2({ totalAmount: data.totalAmount, partnerOrgs: data.partnerOrgs })
        if (!v2.valid) {
          this.error = { code: 'SIGN_REPORT_V2_ERROR', message: `签报总金额不足，差额${v2.diff!.toLocaleString('zh-CN')}元` }
          return false
        }
      }
      this.loading = true
      try {
        const ok = await apiUpdateSignReport(id, data)
        if (ok) {
          const idx = this.list.findIndex((r) => r.id === id)
          if (idx >= 0) {
            this.list[idx] = { ...this.list[idx], ...data, id }
          }
          if (this.detail?.id === id) {
            this.detail = { ...this.detail, ...data, id }
          }
          this.error = null
        }
        return ok
      } catch (e: any) {
        this.error = { code: 'SIGN_REPORT_UPDATE_ERROR', message: e?.message || '更新签报失败' }
        return false
      } finally {
        this.loading = false
      }
    },

    // PRD R10: 按签报号搜索（供合同管理 R10 搜索选择使用）
    async searchByReportNo(keyword: string) {
      this.loading = true
      try {
        const list = await apiSearchSignReports(keyword)
        this.list = list
        this.total = list.length
        this.error = null
        return list
      } catch (e: any) {
        this.error = { code: 'SIGN_REPORT_SEARCH_ERROR', message: e?.message || '搜索签报失败' }
        return []
      } finally {
        this.loading = false
      }
    },

    async delete(id: string) {
      this.loading = true
      try {
        const ok = await apiDeleteSignReport(id)
        if (ok) {
          this.list = this.list.filter((r) => r.id !== id)
          this.total = this.list.length
          this.error = null
        }
        return ok
      } catch (e: any) {
        this.error = { code: 'SIGN_REPORT_DELETE_ERROR', message: e?.message || '删除签报失败' }
        return false
      } finally {
        this.loading = false
      }
    }
  }
})
