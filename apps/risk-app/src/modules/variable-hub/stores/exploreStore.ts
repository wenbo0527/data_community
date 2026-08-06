/**
 * 探索课题 Pinia store
 * 阶段 1.4 · 包装 mock/explore/explore-store.ts
 *
 * 包含：
 * - 6 个 TOPIC mock（探索课题）
 * - 7 个 derivation mock（衍生需求，demandType='derivation'）
 *
 * 4 状态机（topic）：exploring / adopted / rejected / paused
 * 4 状态机（derivation）：pending_dev / developing / pending_register / registered
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ExploreStore } from '@/modules/variable-hub/mock/explore/explore-store'
import type { ExploreTopic } from '@/modules/variable-hub/mock/explore/explore-store'

export const useExploreStore = defineStore('explore', () => {
  const updateTrigger = ref(0)

  function refresh() {
    updateTrigger.value++
  }

  /** 列表查询 */
  function listTopics(): ExploreTopic[] {
    void updateTrigger.value
    return ExploreStore.listTopics()
  }

  function getTopicById(id: string): ExploreTopic | undefined {
    void updateTrigger.value
    return ExploreStore.getTopicById(id)
  }

  function addTopic(payload: {
    name: string
    businessProblem: string
    hypothesis: string
    domain: string
    visibility?: string
    variableTypeId?: string
    exploreCategoryId?: string
    dataSourceId?: string
    relatedVariableIds?: string[]
  }) {
    const r = ExploreStore.addTopic(payload)
    refresh()
    return r
  }

  /** 仅衍生需求 4 状态机 */
  function updateDerivationStatus(id: string, newStatus: string) {
    const t = ExploreStore.getTopicById(id)
    if (t && t.demandType === 'derivation') {
      // 触发响应式更新
      t.derivationStatus = newStatus as any
      t.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
      refresh()
    }
  }

  /** 状态统计 */
  const summary = computed(() => {
    void updateTrigger.value
    return ExploreStore.listStatusSummary()
  })

  return {
    updateTrigger,
    listTopics,
    getTopicById,
    addTopic,
    updateDerivationStatus,
    summary
  }
})
