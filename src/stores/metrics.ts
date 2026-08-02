import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { metrics as rawMetrics } from '@/mock/metrics'
import type { MetricItem } from '@/types/metrics'

/**
 * 指标 Pinia Store
 *
 * 包装 metrics.ts 静态 mock,提供响应式 + 跨模块共享。
 * 用法:
 *   const m = useMetricsStore()
 *   m.all
 *   m.byCategory('用户指标')
 */
export const useMetricsStore = defineStore('metrics', () => {
  const list = ref<MetricItem[]>(rawMetrics as MetricItem[])

  const all = computed(() => list.value)

  const byId = (id: string) => list.value.find(m => m.id === id)
  const byName = (name: string) => list.value.find(m => m.name === name)
  const byCode = (code: string) => list.value.find(m => m.code === code)

  const byCategory = (category: string) =>
    list.value.filter(m => m.category === category)

  const byBusinessDomain = (domain: string) =>
    list.value.filter(m => m.businessDomain === domain)

  const byType = (type: any) =>
    list.value.filter(m => m.type === type)

  const categories = computed(() => {
    const set = new Set<string>()
    list.value.forEach(m => { if (m.category) set.add(m.category) })
    return Array.from(set)
  })

  const businessDomains = computed(() => {
    const set = new Set<string>()
    list.value.forEach(m => { if (m.businessDomain) set.add(m.businessDomain) })
    return Array.from(set)
  })

  return {
    list,
    all,
    categories,
    businessDomains,
    byId,
    byName,
    byCode,
    byCategory,
    byBusinessDomain,
    byType
  }
})