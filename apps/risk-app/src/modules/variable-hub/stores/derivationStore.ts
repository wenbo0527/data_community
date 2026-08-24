/**
 * 需求 Pinia store
 * 包装 mock/risk-feature/derivations.ts
 *
 * 需求列表 2 状态：需求受理 / 需求驳回
 * 特征台账 2 状态：需求提出 / 已注册（由 midloanStatus 跟踪）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import DerivationStore from '@/modules/variable-hub/mock/risk-feature/derivations'
import type { DerivationRecord } from '@/modules/variable-hub/mock/risk-feature/derivations'

export const useDerivationStore = defineStore('derivation', () => {
  const updateTrigger = ref(0)

  function refresh() {
    updateTrigger.value++
  }

  /** 列表查询 */
  function list(filter: {
    status?: string
    businessScene?: string
    keyword?: string
  } = {}): DerivationRecord[] {
    void updateTrigger.value
    return DerivationStore.list(filter)
  }

  /** 详情查询 */
  function get(id: string): DerivationRecord | null {
    void updateTrigger.value
    return DerivationStore.get(id)
  }

  /** 创建：初始状态为需求受理 */
  function create(payload: Partial<DerivationRecord>, proposer = 'Demo 用户') {
    const r = DerivationStore.create(payload, proposer)
    refresh()
    return r
  }

  /** 特征注册 */
  function register(id: string, payload: any) {
    const r = DerivationStore.register(id, payload)
    refresh()
    return r
  }

  /** 需求驳回：仅需求受理状态可驳回 */
  function reject(id: string, reason: string) {
    const r = DerivationStore.reject(id, reason)
    refresh()
    return r
  }

  /** 补充数据底表 */
  function supplementDataTable(id: string, tableName: string) {
    const r = DerivationStore.supplementDataTable?.(id, tableName)
    refresh()
    return r
  }

  /** 状态统计 */
  const summary = computed(() => {
    void updateTrigger.value
    const list = DerivationStore.list()
    return {
      total: list.length,
      requirement_accepted: list.filter(d => d.status === 'requirement_accepted').length,
      rejected: list.filter(d => d.status === 'rejected').length,
      registered: list.filter(d => d.featureId).length
    }
  })

  return {
    updateTrigger,
    list,
    get,
    create,
    register,
    reject,
    supplementDataTable,
    summary
  }
})
