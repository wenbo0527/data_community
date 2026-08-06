import { defineStore } from 'pinia'
import { getVariableDetail, getVariableList } from '@/modules/variable-hub/api/variable-management'
import { buildVariableEdges } from '@/modules/variable-hub/mock/variable-management/variable-relations'

export const useVariableStore = defineStore('variable', {
  state: () => ({
    variableList: [] as any[],
    variableTotal: 0,
    variableLoading: false,
    currentVariable: null as any | null,
    variableDetailLoading: false,
    variableLineage: {
      upstream: [] as any[],
      downstream: [] as any[],
      current: null as any | null
    },
    lineageLoading: false,
    variableGraph: {
      nodes: [] as any[],
      edges: [] as any[]
    },
    filters: {
      keyword: '',
      type: 'all',
      status: 'all',
      dataSource: 'all',
      quality: null as number | null,
      dateRange: [] as any[]
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  }),

  getters: {
    filteredVariables: (state) => {
      let filtered = [...state.variableList]

      if (state.filters.keyword) {
        const keyword = String(state.filters.keyword).toLowerCase()
        filtered = filtered.filter((item: any) =>
          String(item.name || '').toLowerCase().includes(keyword) ||
          String(item.description || '').toLowerCase().includes(keyword) ||
          String(item.code || '').toLowerCase().includes(keyword)
        )
      }

      if (state.filters.type && state.filters.type !== 'all') {
        filtered = filtered.filter((item: any) => item.type === state.filters.type)
      }

      if (state.filters.status && state.filters.status !== 'all') {
        filtered = filtered.filter((item: any) => item.status === state.filters.status)
      }

      if (state.filters.dataSource && state.filters.dataSource !== 'all') {
        filtered = filtered.filter((item: any) => item.dataSource === state.filters.dataSource)
      }

      if (state.filters.quality != null) {
        filtered = filtered.filter((item: any) => Number(item.quality ?? 0) >= Number(state.filters.quality))
      }

      return filtered
    },

    variableStats: (state) => {
      const total = state.variableList.length
      const active = state.variableList.filter((item: any) => item.status === 'active').length
      const pending = state.variableList.filter((item: any) => item.status === 'pending').length
      const inactive = state.variableList.filter((item: any) => item.status === 'inactive').length

      return { total, active, pending, inactive }
    }
  },

  actions: {
    updateFilters(payload: Partial<{ keyword: string; type: string; status: string; dataSource: string; quality: number | null; dateRange: any[] }>) {
      this.filters = { ...this.filters, ...payload }
    },

    resetFilters() {
      this.filters = {
        keyword: '',
        type: 'all',
        status: 'all',
        dataSource: 'all',
        quality: null,
        dateRange: []
      }
    },

    async fetchVariableList(params: { page?: number; pageSize?: number; keyword?: string; type?: string; status?: string; dataSource?: string } = {}) {
      this.variableLoading = true
      try {
        const response: any = await getVariableList(params)
        if (response?.code === 200) {
          const data = response.data || {}
          const list = Array.isArray(data.list) ? data.list : []
          const total = Number(data.total ?? list.length)
          this.variableList = list
          this.variableTotal = total
          this.pagination = {
            page: params.page || 1,
            pageSize: params.pageSize || 10,
            total
          }

          this.variableGraph = {
            nodes: list.map((v: any) => ({
              id: v.id,
              name: v.name,
              label: v.name,
              type: v.type,
              status: v.status
            })),
            edges: buildVariableEdges(list)
          }
        }
        return response
      } finally {
        this.variableLoading = false
      }
    },

    async fetchVariableDetail(id: string | number) {
      this.variableDetailLoading = true
      try {
        const response: any = await getVariableDetail(id)
        if (response?.code === 200) {
          this.currentVariable = response.data
        } else {
          // 404：清空 currentVariable
          this.currentVariable = null
        }
        return response
      } finally {
        this.variableDetailLoading = false
      }
    },

    async fetchVariableLineage(variableId: string | number) {
      this.lineageLoading = true
      try {
        const current = this.variableList.find((v: any) => String(v.id) === String(variableId)) || this.currentVariable
        this.variableLineage = {
          upstream: [
            { id: 'table_001', name: '用户注册表', type: 'table' },
            { id: 'table_002', name: '用户认证表', type: 'table' }
          ],
          downstream: [
            { id: 'metric_001', name: '用户平均年龄', type: 'metric' },
            { id: 'model_001', name: '信用评分模型', type: 'model' }
          ],
          current: current || null
        }
      } finally {
        this.lineageLoading = false
      }
    }
  }
})
