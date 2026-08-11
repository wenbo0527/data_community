/**
 * 衍生需求 Pinia store
 * 阶段 1.3 · 包装 mock/risk-feature/derivations.ts
 *
 * 4 状态机：pending_dev → developing → pending_register → registered
 * 文档 §三 模块 A · F-01
 *
 * 注意：7 条 mock 数据已合并到 explore-store（demandType='derivation'）
 *       本 store 提供响应式包装，但底层数据仍用 DerivationStore（mock）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import DerivationStore from '@/modules/variable-hub/mock/risk-feature/derivations'
import type { DerivationRecord } from '@/modules/variable-hub/mock/risk-feature/derivations'

export const useDerivationStore = defineStore('derivation', () => {
  // 触发响应式更新的 key
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

  /** 创建 */
  function create(payload: Partial<DerivationRecord>, creator = 'Demo 用户') {
    const r = DerivationStore.create(payload, creator)
    refresh()
    return r
  }

  /** 状态流转 */
  function updateStatus(id: string, newStatus: string, operator = 'Demo 用户') {
    const r = DerivationStore.updateStatus(id, newStatus, operator)
    refresh()
    return r
  }

  /** 注册 */
  function register(id: string, payload: any) {
    const r = DerivationStore.register(id, payload)
    refresh()
    return r
  }

  /** 补充数据底表 */
  function supplementDataTable(id: string, tableName: string, remark?: string) {
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
      pending_dev: list.filter(d => d.status === 'pending_dev').length,
      developing: list.filter(d => d.status === 'developing').length,
      pending_register: list.filter(d => d.status === 'pending_register').length,
      registered: list.filter(d => d.status === 'registered').length
    }
  })

  return {
    updateTrigger,
    list,
    get,
    create,
    updateStatus,
    register,
    supplementDataTable,
    summary
  }
})
