import { ref, computed, watch, type ComputedRef, type WatchSource } from 'vue'

/**
 * usePagination —— 通用分页 composable
 *
 * 封装 computed slice 分页 + 搜索/筛选变化时自动回到第 1 页
 *
 * 用法:
 *   const filteredFiles = computed(() => { /* 过滤逻辑 *\/ })
 *   const { pagination, paged, onPageChange, onPageSizeChange } = usePagination(filteredFiles, [search, format])
 *
 *   // 模板中:
 *   // v-for="item in paged"
 *   // <a-pagination :total="filteredFiles.length" ... @change="onPageChange" />
 */
export function usePagination<T>(
  filtered: ComputedRef<T[]>,
  watchSources: WatchSource[] = [],
  options?: { pageSize?: number }
) {
  const pagination = ref({
    current: 1,
    pageSize: options?.pageSize ?? 12
  })

  const paged = computed(() => {
    const start = (pagination.value.current - 1) * pagination.value.pageSize
    return filtered.value.slice(start, start + pagination.value.pageSize)
  })

  // 搜索/筛选变化时回到第 1 页
  if (watchSources.length > 0) {
    watch(watchSources, () => {
      pagination.value.current = 1
    })
  }

  function onPageChange(c: number) {
    pagination.value.current = c
  }

  function onPageSizeChange(s: number) {
    pagination.value.pageSize = s
    pagination.value.current = 1
  }

  return { pagination, paged, onPageChange, onPageSizeChange }
}
