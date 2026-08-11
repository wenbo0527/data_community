import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { metrics as rawMetrics } from '@/mock/metrics'
import type { MetricItem } from '@/types/metrics'
import { normalizeMetrics, getMetricOwner, getMetricDefinition } from '@/types/metricSchema'

/**
 * 指标 Pinia Store(P1#1 升级:统一 schema)
 *
 * 所有模块页面应从此处读指标数据,而不是直接 import mock/metrics。
 * 用法:
 *   const m = useMetricsStore()
 *   m.all         // 标准化后的所有指标
 *   m.byCode('USER_001')  // 按业务代码查
 *   m.byName('DAU')
 *   m.getDefinition(metric)  // 兼容多字段
 *   m.getOwner(metric)
 */
export const useMetricsStore = defineStore('metrics', () => {
  // 原始数据
  const rawList = ref<MetricItem[]>(rawMetrics as MetricItem[])

  // 标准化后的数据(P1#1:统一 schema)
  const list = computed(() => normalizeMetrics(rawList.value as any[]))

  const all = computed(() => list.value)

  const byId = (id: string) => list.value.find(m => String(m.id) === String(id))
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

  // P1#1: 跨模块共享辅助函数
  const getDefinition = getMetricDefinition
  const getOwner = getMetricOwner

  return {
    rawList,
    list,
    all,
    categories,
    businessDomains,
    byId,
    byName,
    byCode,
    byCategory,
    byBusinessDomain,
    byType,
    getDefinition,
    getOwner
  }
})