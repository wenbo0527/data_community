import { defineStore } from 'pinia'
import { getVariableList, getVariableDetail, createVariable, updateVariable, deleteVariable } from '@/api/variable-management'
import { getVariableGraph, getVariableLineage, getPathAnalysis, getImpactAnalysis } from '@/api/variable-map'

export const useVariableStore = defineStore('variable', {
  state: () => ({
    // 变量列表
    variableList: [],
    variableTotal: 0,
    variableLoading: false,
    
    // 当前变量详情
    currentVariable: null,
    variableDetailLoading: false,
    
    // 变量图谱
    variableGraph: {
      nodes: [],
      edges: []
    },
    graphLoading: false,
    
    // 血缘分析
    variableLineage: {
      upstream: [],
      downstream: [],
      current: null
    },
    lineageLoading: false,
    
    // 路径分析
    pathAnalysis: {
      paths: [],
      total: 0
    },
    pathLoading: false,
    
    // 影响分析
    impactAnalysis: {
      affectedVariables: [],
      affectedReports: [],
      affectedDashboards: [],
      riskLevel: 'low',
      totalImpact: 0
    },
    impactLoading: false,
    
    // 筛选条件
    filters: {
      keyword: '',
      type: 'all',
      status: 'all',
      quality: null,
      dateRange: []
    },
    
    // 分页
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  }),

  getters: {
    // 获取过滤后的变量列表
    filteredVariables: (state) => {
      let filtered = [...state.variableList]
      
      if (state.filters.keyword) {
        const keyword = state.filters.keyword.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.code.toLowerCase().includes(keyword)
        )
      }
      
      if (state.filters.type && state.filters.type !== 'all') {
        filtered = filtered.filter(item => item.type === state.filters.type)
      }
      
      if (state.filters.status && state.filters.status !== 'all') {
        filtered = filtered.filter(item => item.status === state.filters.status)
      }
      
      if (state.filters.quality) {
        filtered = filtered.filter(item => item.quality >= state.filters.quality)
      }
      
      return filtered
    },
    
    // 获取变量统计信息
    variableStats: (state) => {
      const total = state.variableList.length
      const active = state.variableList.filter(item => item.status === 'active').length
      const deprecated = state.variableList.filter(item => item.status === 'deprecated').length
      const draft = state.variableList.filter(item => item.status === 'draft').length
      
      const typeStats = {}
      const typeList = ['numerical', 'categorical', 'text', 'datetime', 'boolean']
      typeList.forEach(type => {
        typeStats[type] = state.variableList.filter(item => item.type === type).length
      })
      
      return {
        total,
        active,
        deprecated,
        draft,
        typeStats
      }
    },
    
    // 获取图谱节点统计
    graphNodeStats: (state) => {
      const nodes = state.variableGraph.nodes
      const total = nodes.length
      const typeStats = {}
      const statusStats = {}
      
      nodes.forEach(node => {
        typeStats[node.type] = (typeStats[node.type] || 0) + 1
        statusStats[node.status] = (statusStats[node.status] || 0) + 1
      })
      
      return {
        total,
        typeStats,
        statusStats
      }
    }
  },

  actions: {
    // 获取变量列表
    async fetchVariableList(params = {}) {
      this.variableLoading = true
      try {
        const response = await getVariableList(params)
        if (response.code === 200) {
          const data = response.data || {}
          const list = Array.isArray(data.list) ? data.list : []
          const total = Number(data.total) || 0
          this.variableList = list
          this.variableTotal = total
          this.pagination = {
            page: params.page || 1,
            pageSize: params.pageSize || 10,
            total
          }
        }
        return response
      } catch (error) {
        console.error('获取变量列表失败:', error)
        throw error
      } finally {
        this.variableLoading = false
      }
    },
    
    // 获取变量详情
    async fetchVariableDetail(id) {
      this.variableDetailLoading = true
      try {
        const response = await getVariableDetail(id)
        if (response.code === 200) {
          this.currentVariable = response.data
        }
        return response
      } catch (error) {
        console.error('获取变量详情失败:', error)
        throw error
      } finally {
        this.variableDetailLoading = false
      }
    },
    
    // 创建变量
    async createVariable(data) {
      try {
        const response = await createVariable(data)
        if (response.code === 200) {
          // 刷新变量列表
          await this.fetchVariableList()
        }
        return response
      } catch (error) {
        console.error('创建变量失败:', error)
        throw error
      }
    },
    
    // 更新变量
    async updateVariable({ id, data }) {
      try {
        const response = await updateVariable(id, data)
        if (response.code === 200) {
          // 刷新变量列表和详情
          await this.fetchVariableList()
          await this.fetchVariableDetail(id)
        }
        return response
      } catch (error) {
        console.error('更新变量失败:', error)
        throw error
      }
    },
    
    // 删除变量
    async deleteVariable(id) {
      try {
        const response = await deleteVariable(id)
        if (response.code === 200) {
          // 刷新变量列表
          await this.fetchVariableList()
        }
        return response
      } catch (error) {
        console.error('删除变量失败:', error)
        throw error
      }
    },
    
    // 获取变量图谱
    async fetchVariableGraph(params = {}) {
      this.graphLoading = true
      try {
        const response = await getVariableGraph(params)
        if (response.code === 200) {
          this.variableGraph = response.data
        }
        return response
      } catch (error) {
        console.error('获取变量图谱失败:', error)
        throw error
      } finally {
        this.graphLoading = false
      }
    },
    
    // 获取变量血缘分析
    async fetchVariableLineage(variableId) {
      this.lineageLoading = true
      try {
        const response = await getVariableLineage(variableId)
        if (response.code === 200) {
          this.variableLineage = response.data
        }
        return response
      } catch (error) {
        console.error('获取变量血缘分析失败:', error)
        throw error
      } finally {
        this.lineageLoading = false
      }
    },
    
    // 获取路径分析
    async fetchPathAnalysis({ sourceId, targetId }) {
      this.pathLoading = true
      try {
        const response = await getPathAnalysis({ sourceId, targetId })
        if (response.code === 200) {
          this.pathAnalysis = response.data
        }
        return response
      } catch (error) {
        console.error('获取路径分析失败:', error)
        throw error
      } finally {
        this.pathLoading = false
      }
    },
    
    // 获取影响分析
    async fetchImpactAnalysis(variableId) {
      this.impactLoading = true
      try {
        const response = await getImpactAnalysis(variableId)
        if (response.code === 200) {
          this.impactAnalysis = response.data
        }
        return response
      } catch (error) {
        console.error('获取影响分析失败:', error)
        throw error
      } finally {
        this.impactLoading = false
      }
    },
    
    // 更新筛选条件
    updateFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },
    
    // 重置筛选条件
    resetFilters() {
      this.filters = {
        keyword: '',
        type: 'all',
        status: 'all',
        quality: null,
        dateRange: []
      }
    },
    
    // 更新分页
    updatePagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    }
  }
})
