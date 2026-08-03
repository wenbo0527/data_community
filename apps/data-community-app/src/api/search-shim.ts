/**
 * 搜索 API shim(子应用内桩)
 * 用于 GlobalSearchResult 等组件
 */
import { SearchExtrasStore } from '@/mock/shared/search-extras'

export const searchApi = {
  async search(keyword: string) {
    return {
      code: 0,
      message: 'success',
      data: {
        keyword,
        total: 0,
        items: [] as any[]
      }
    }
  },
  async suggest(prefix: string) {
    const list = SearchExtrasStore.suggestions(prefix)
    return { code: 0, data: list }
  }
}